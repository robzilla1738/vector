// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Independent Chromium/Firefox snapshot migrators: adblock-import I1/I2.
#include "chrome/browser/extensions/api/aux_browser_import/migrator.h"

#include <sys/stat.h>
#include <unistd.h>

#include <algorithm>
#include <cstring>
#include <memory>
#include <set>
#include <vector>

#include "base/environment.h"
#include "base/files/file_enumerator.h"
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/json/json_reader.h"
#include "base/path_service.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/extensions/api/aux_browser_import/encrypted_source_bytes.h"
#include "base/threading/platform_thread.h"
#include "base/time/time.h"
#include "chrome/common/importer/firefox_importer_utils.h"
#include "chrome/common/ini_parser.h"
#include "crypto/hash.h"
#include "third_party/sqlite/sqlite3.h"
#include "url/gurl.h"
#include "sql/database.h"
#include "sql/statement.h"
namespace aux_import {
namespace {
std::optional<base::FilePath> SourceHome(bool& fixture) {
  fixture = false;
#if !defined(OFFICIAL_BUILD)
  if (const auto override =
          base::Environment::Create()->GetVar("AUX_IMPORT_FIXTURE_HOME")) {
    const base::FilePath requested(*override);
    if (!requested.IsAbsolute() || base::IsLink(requested)) {
      return {};
    }
    const auto root = base::MakeAbsoluteFilePath(requested);
    base::FilePath temporary;
    if (base::GetTempDir(&temporary)) {
      temporary = base::MakeAbsoluteFilePath(temporary);
    }
    const bool inside_temp = (!temporary.empty() && temporary.IsParent(root)) ||
                             base::FilePath("/private/tmp").IsParent(root);
    struct stat status;
    if (root.empty() || !inside_temp ||
        stat(root.value().c_str(), &status) != 0 || !S_ISDIR(status.st_mode) ||
        status.st_uid != geteuid() || (status.st_mode & 0077)) {
      return {};
    }
    fixture = true;
    return root;
  }
#endif
  base::FilePath home;
  if (!base::PathService::Get(base::DIR_HOME, &home)) {
    return {};
  }
  return home;
}
struct Family {
  const char *id, *name, *path;
  bool firefox;
};
constexpr Family kFamilies[] = {
    {"chrome", "Google Chrome", "Google/Chrome", false},
    {"brave", "Brave", "BraveSoftware/Brave-Browser", false},
    {"arc", "Arc", "Arc/User Data", false},
    {"dia", "Dia", "Dia/User Data", false},
    {"atlas", "ChatGPT Atlas", "com.openai.atlas/browser-data/host", false},
    {"comet", "Comet", "Comet", false},
    {"helium", "Helium", "net.imput.helium", false},
    {"edge", "Microsoft Edge", "Microsoft Edge", false},
    {"firefox", "Firefox", "Firefox/Profiles", true}};
std::optional<base::DictValue> JSON(const base::FilePath& path) {
  std::string text;
  if (base::IsLink(path) ||
      !base::ReadFileToStringWithMaxSize(path, &text, 32 * 1024 * 1024)) {
    return std::nullopt;
  }
  return base::JSONReader::ReadDict(text, base::JSON_PARSE_RFC);
}
// Supplied04259adc/04259ef0: themes are excluded by both their unpacked
// manifest and the persisted settings manifest. Other extension state is not
// an eligibility filter; destination PendingExtensionManager owns admission.
base::ListValue ReadChromiumExtensionImports(const base::FilePath& profile) {
  std::set<std::string> themes;
  base::FileEnumerator ids(profile.AppendASCII("Extensions"), false,
                           base::FileEnumerator::DIRECTORIES);
  for (auto id = ids.Next(); !id.empty(); id = ids.Next()) {
    base::FileEnumerator versions(id, false, base::FileEnumerator::DIRECTORIES);
    for (auto version = versions.Next(); !version.empty();
         version = versions.Next()) {
      const auto manifest = JSON(version.AppendASCII("manifest.json"));
      if (manifest && manifest->FindDict("theme")) {
        themes.insert(id.BaseName().value());
        break;
      }
    }
  }
  base::ListValue imports;
  const auto preferences = JSON(profile.AppendASCII("Secure Preferences"));
  const auto* settings = preferences
      ? preferences->FindDictByDottedPath("extensions.settings") : nullptr;
  if (!settings) {
    return imports;
  }
  for (const auto item : *settings) {
    const auto* entry = item.second.GetIfDict();
    if (!entry || themes.contains(item.first)) {
      continue;
    }
    const auto* manifest = entry->FindDict("manifest");
    if (manifest && manifest->FindDict("theme")) {
      continue;
    }
    GURL update_url;
    const auto* url = entry->FindStringByDottedPath("manifest.update_url");
    if (url) {
      update_url = GURL(*url);
      if (!update_url.is_valid()) {
        continue;
      }
    } else if (!entry->FindBool("from_webstore").value_or(false)) {
      continue;
    }
    imports.Append(base::DictValue().Set("id", item.first).Set(
        "updateUrl", update_url.spec()));
  }
  return imports;
}
struct CloseDB {
  void operator()(sqlite3* db) const {
    if (db) {
      sqlite3_close(db);
    }
  }
};
using DB = std::unique_ptr<sqlite3, CloseDB>;
struct CloseQuery {
  void operator()(sqlite3_stmt* stmt) const {
    if (stmt) {
      sqlite3_finalize(stmt);
    }
  }
};
using Query = std::unique_ptr<sqlite3_stmt, CloseQuery>;
DB Snapshot(const base::FilePath& path, std::string& failure) {
  failure = "Source snapshot is unavailable";
  const auto source_size = base::GetFileSize(path);
  if (base::IsLink(path) || !source_size || *source_size > 256 * 1024 * 1024) {
    failure =
        "Source database is missing, linked or exceeds the snapshot size limit";
    return {};
  }
  if (sqlite3_initialize() != SQLITE_OK) {
    failure = "SQLite initialization failed";
    return {};
  }
  sqlite3* source_raw = nullptr;
  if (sqlite3_open_v2(path.value().c_str(), &source_raw,
                      SQLITE_OPEN_READONLY | SQLITE_OPEN_NOFOLLOW,
                      nullptr) != SQLITE_OK) {
    if (source_raw) {
      sqlite3_close(source_raw);
    }
    failure =
        "Source database could not be opened read-only without following links";
    return {};
  }
  DB source(source_raw);
  // Chromium builds SQLite with exclusive locking by default. Source
  // snapshots must share locks with a running source browser.
  if (sqlite3_exec(source.get(), "PRAGMA locking_mode=NORMAL", nullptr, nullptr,
                   nullptr) != SQLITE_OK) {
    failure = "Source database could not enter shared read-only locking mode";
    return {};
  }
  sqlite3_db_config(source.get(), SQLITE_DBCONFIG_DEFENSIVE, 1, nullptr);
  sqlite3_exec(source.get(), "PRAGMA trusted_schema=OFF", nullptr, nullptr,
               nullptr);
  sqlite3_stmt* page_query = nullptr;
  if (sqlite3_prepare_v2(source.get(), "PRAGMA page_size", -1, &page_query,
                         nullptr) != SQLITE_OK) {
    failure = "Source database page metadata could not be read";
    return {};
  }
  Query page_statement(page_query);
  if (sqlite3_step(page_statement.get()) != SQLITE_ROW) {
    failure = "Source database page metadata is unavailable";
    return {};
  }
  const int64_t page_size = sqlite3_column_int64(page_statement.get(), 0);
  if (page_size < 512 || page_size > 65536) {
    failure = "Source database has an unsupported page size";
    return {};
  }
  page_statement.reset();
  sqlite3* target_raw = nullptr;
  if (sqlite3_open_v2(":memory:", &target_raw,
                      SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE,
                      nullptr) != SQLITE_OK) {
    if (target_raw) {
      sqlite3_close(target_raw);
    }
    failure = "Temporary in-memory snapshot could not be created";
    return {};
  }
  DB target(target_raw);
  auto* backup =
      sqlite3_backup_init(target.get(), "main", source.get(), "main");
  if (!backup) {
    failure = "Source database snapshot could not be started";
    return {};
  }
  int result = SQLITE_OK, retries = 0, steps = 0;
  do {
    result = sqlite3_backup_step(backup, 256);
    if (++steps > 4096 ||
        static_cast<int64_t>(sqlite3_backup_pagecount(backup)) * page_size >
            256 * 1024 * 1024) {
      result = SQLITE_TOOBIG;
      break;
    }
    if (result == SQLITE_BUSY || result == SQLITE_LOCKED) {
      if (++retries > 100) {
        break;
      }
      base::PlatformThread::Sleep(base::Milliseconds(10));
    }
  } while (result == SQLITE_OK || result == SQLITE_BUSY ||
           result == SQLITE_LOCKED);
  sqlite3_backup_finish(backup);
  if (result != SQLITE_DONE) {
    failure =
        "Source database snapshot failed or exceeded its size/time budget";
    return {};
  }
  return target;
}
Query Prepare(sqlite3* db, const char* sql) {
  sqlite3_stmt* statement = nullptr;
  if (sqlite3_prepare_v2(db, sql, -1, &statement, nullptr) != SQLITE_OK) {
    return {};
  }
  return Query(statement);
}
std::string Text(sqlite3_stmt* statement, int column) {
  const auto* value = sqlite3_column_text(statement, column);
  int size = sqlite3_column_bytes(statement, column);
  if (!value || size < 0 || size > 8192) {
    return {};
  }
  return std::string(reinterpret_cast<const char*>(value), size);
}
// Supplied425c084 admits valid bookmarklets; its only scheme exclusions are
// chrome, chrome-extension and devtools. Malformed nodes are skipped, not a
// reason to reject the complete source bookmark batch.
void BookmarkTree(const base::DictValue& node,
                  base::ListValue& result,
                  const base::ListValue& path,
                  std::string root) {
  const auto* type = node.FindString("type");
  if (!type || (*type != "folder" && *type != "url")) {
    return;
  }
  const auto* source_name = node.FindString("name");
  const std::string name = source_name ? *source_name : std::string();
  const bool folder = *type == "folder";
  const auto* source_url = node.FindString("url");
  const GURL url(source_url ? *source_url : std::string());
  if (!folder && (!source_url || !url.is_valid() || url.SchemeIs("chrome") ||
                  url.SchemeIs("chrome-extension") || url.SchemeIs("devtools"))) {
    return;
  }
  auto next = path.Clone();
  if (!folder || !name.empty()) {
    base::DictValue row;
    row.Set("root", root);
    row.Set("path", path.Clone());
    row.Set("title", !folder && name.empty() ? url.spec() : name);
    row.Set("folder", folder);
    int64_t created = 0;
    if (const auto* date = node.FindString("date_added")) {
      if (!base::StringToInt64(*date, &created)) {
        created = 0;
      }
    }
    if (created <= 0) {
      created = base::Time::Now().ToDeltaSinceWindowsEpoch().InMicroseconds();
    }
    row.Set("createdWindowsMicros", base::NumberToString(created));
    if (!folder) {
      row.Set("url", url.spec());
    }
    result.Append(std::move(row));
  }
  if (folder) {
    if (!name.empty()) {
      next.Append(name);
    }
    if (const auto* children = node.FindList("children")) {
      for (const auto& child : *children) {
        if (child.is_dict()) {
          BookmarkTree(child.GetDict(), result, next, root);
        }
      }
    }
  }
}
// Original426793c appends the actual cache ID and checks directory status.
// It has no profile-count, single-component-name or symlink rejection policy.
bool AppendChromiumProfile(base::ListValue& profiles,
                           const base::FilePath& directory,
                           std::string_view id,
                           const base::DictValue* metadata) {
  const auto path = directory.Append(base::FilePath::FromUTF8Unsafe(id));
  if (!base::DirectoryExists(path)) {
    return false;
  }
  // Original4267a88: metadata is absent during fallback, never a fabricated
  // Preferences/cache row. Preserve the source's nonempty-string precedence.
  std::string name(id);
  std::string subtitle;
  if (metadata) {
    if (const auto* value = metadata->FindString("name"); value && !value->empty()) {
      name = *value;
    }
    if (const auto* username = metadata->FindString("user_name");
        username && !username->empty()) {
      subtitle = *username;
    } else if (const auto* gaia = metadata->FindString("gaia_name");
               gaia && !gaia->empty()) {
      subtitle = *gaia;
    }
  }
  if (subtitle.empty() && name != id) {
    subtitle = std::string(id);
  }
  base::DictValue profile;
  profile.Set("id", id);
  profile.Set("name", name);
  if (!subtitle.empty()) {
    profile.Set("subtitle", subtitle);
  }
  profile.Set("nativePath", path.value());
  profiles.Append(std::move(profile));
  return true;
}
// Arc's supplied StorableSidebar parser426b4b0/426d388 uses alternating
// ID/value arrays, not a flattened list of every tab or a guessed URL owner.
const base::DictValue& ArcValue(const base::DictValue& item) {
  if (const auto* value = item.FindDict("value")) {
    return *value;
  }
  return item;
}
const base::DictValue* FindArcItem(const base::ListValue& items,
                                 std::string_view id) {
  for (size_t index = 0; index + 1 < items.size(); index += 2) {
    if (items[index].is_string() && items[index].GetString() == id) {
      return items[index + 1].is_dict()
                 ? &ArcValue(items[index + 1].GetDict())
                 : nullptr;
    }
  }
  return nullptr;
}
void AppendArcBookmark(base::ListValue& rows,
                       std::string title,
                       const base::ListValue& path,
                       const GURL* url) {
  base::DictValue row;
  row.Set("root", "other");
  row.Set("path", path.Clone());
  row.Set("title", url && title.empty() ? url->spec() : title);
  row.Set("folder", !url);
  row.Set("arcSidebar", true);
  row.Set("createdWindowsMicros",
          base::NumberToString(base::Time::Now()
                                   .ToDeltaSinceWindowsEpoch().InMicroseconds()));
  if (url) {
    row.Set("url", url->spec());
  }
  rows.Append(std::move(row));
}
void AppendArcItem(const base::ListValue& items,
                   const std::string& id,
                   std::set<std::string>& visited,
                   const base::ListValue& path,
                   base::ListValue& rows) {
  if (!visited.insert(id).second) {
    return;
  }
  const auto* item = FindArcItem(items, id);
  if (!item) {
    return;
  }
  if (item->FindDictByDottedPath("data.list")) {
    const auto* source_title = item->FindString("title");
    const std::string title = source_title ? *source_title : "Untitled Folder";
    AppendArcBookmark(rows, title, path, nullptr);
    auto next = path.Clone();
    next.Append(title);
    if (const auto* children = item->FindList("childrenIds")) {
      for (const auto& child : *children) {
        if (child.is_string()) {
          AppendArcItem(items, child.GetString(), visited, next, rows);
        }
      }
    }
    return;
  }
  const auto* saved_url = item->FindStringByDottedPath("data.tab.savedURL");
  if (!saved_url) {
    return;
  }
  const GURL url(*saved_url);
  if (!url.is_valid() || url.SchemeIs("chrome") ||
      url.SchemeIs("chrome-extension") || url.SchemeIs("devtools")) {
    return;
  }
  const auto* title = item->FindString("title");
  if (!title) {
    title = item->FindStringByDottedPath("data.tab.savedTitle");
  }
  AppendArcBookmark(rows, title ? *title : url.spec(), path, &url);
}
std::optional<std::string> ArcPinnedContainer(const base::DictValue& space) {
  if (const auto* modern = space.FindList("newContainerIDs")) {
    for (size_t index = 0; index + 1 < modern->size(); index += 2) {
      if ((*modern)[index].is_dict() && (*modern)[index + 1].is_string() &&
          (*modern)[index].GetDict().contains("pinned")) {
        return (*modern)[index + 1].GetString();
      }
    }
  }
  if (const auto* legacy = space.FindList("containerIDs")) {
    for (size_t index = 0; index + 1 < legacy->size(); index += 2) {
      if ((*legacy)[index].is_string() && (*legacy)[index + 1].is_string() &&
          (*legacy)[index].GetString() == "pinned") {
        return (*legacy)[index + 1].GetString();
      }
    }
  }
  return std::nullopt;
}
void AppendArcSidebarBookmarks(const base::FilePath& profile,
                               base::ListValue& rows) {
  // Original4259984 uses Arc User Data's parent, not the selected profile's
  // arbitrary parent or a guessed owner account. Profile basename is the
  // actual captured sourceProfileId selected by the existing job owner.
  std::string text;
  if (!base::ReadFileToString(profile.DirName().DirName().AppendASCII(
                                  "StorableSidebar.json"), &text)) {
    return;
  }
  auto state = base::JSONReader::ReadDict(text, base::JSON_PARSE_RFC, 200);
  if (!state) {
    return;
  }
  const base::ListValue* items = nullptr;
  const base::ListValue* spaces = nullptr;
  if (const auto* containers = state->FindListByDottedPath("sidebar.containers")) {
    for (const auto& container : *containers) {
      if (!container.is_dict()) {
        continue;
      }
      const auto* found_items = container.GetDict().FindList("items");
      const auto* found_spaces = container.GetDict().FindList("spaces");
      if (found_items && found_spaces && !found_items->empty() &&
          !found_spaces->empty()) {
        items = found_items;
        spaces = found_spaces;
        break;
      }
    }
  }
  if (!items || !spaces) {
    items = state->FindListByDottedPath("sidebarSyncState.items");
    spaces = state->FindListByDottedPath("sidebarSyncState.spaceModels");
    if (!items || !spaces) {
      items = state->FindListByDottedPath("firebaseSyncState.syncData.items");
      spaces = state->FindListByDottedPath("firebaseSyncState.syncData.spaceModels");
    }
  }
  if (!items || !spaces) {
    return;
  }
  const auto selected = profile.BaseName().value();
  for (size_t index = 1; index < spaces->size(); index += 2) {
    if (!(*spaces)[index].is_dict()) {
      continue;
    }
    const auto& space = ArcValue((*spaces)[index].GetDict());
    const auto* source_profile = space.FindDict("profile");
    if (!source_profile) {
      continue;
    }
    const bool default_profile =
        selected == "Default" && source_profile->FindBool("default").value_or(false);
    const auto* directory = source_profile->FindStringByDottedPath(
        "custom._0.directoryBasename");
    if (!default_profile && (!directory || *directory != selected)) {
      continue;
    }
    const auto pinned = ArcPinnedContainer(space);
    if (!pinned || pinned->empty()) {
      continue;
    }
    const auto* container = FindArcItem(*items, *pinned);
    const auto* children = container ? container->FindList("childrenIds") : nullptr;
    if (!children) {
      continue;
    }
    const auto* source_title = space.FindString("title");
    const std::string title = source_title ? *source_title : "Untitled Space";
    base::ListValue path;
    path.Append(title);
    base::ListValue contents;
    std::set<std::string> visited;
    for (const auto& child : *children) {
      if (child.is_string()) {
        AppendArcItem(*items, child.GetString(), visited, path, contents);
      }
    }
    // Original parser emits a space only when it has an actual admitted child.
    if (!contents.empty()) {
      AppendArcBookmark(rows, title, {}, nullptr);
      for (auto& child : contents) {
        rows.Append(std::move(child));
      }
    }
  }
}
base::ListValue DiscoverChromiumProfiles(const base::FilePath& directory,
                                       bool atlas) {
  base::ListValue profiles;
  // Original4266e60 uses an unbounded file read and JSON options0/depth200.
  // Discovery must not silently fall back because an inherited generic reader
  // rejects a source symlink or reaches an unrelated byte cap.
  std::string local_state;
  std::optional<base::DictValue> state;
  if (base::ReadFileToString(directory.AppendASCII("Local State"), &local_state)) {
    state = base::JSONReader::ReadDict(local_state, base::JSON_PARSE_RFC, 200);
  }
  if (state) {
    if (const auto* cache = state->FindDictByDottedPath("profile.info_cache")) {
      std::set<std::string, std::less<>> ordered_ids;
      if (const auto* order = state->FindListByDottedPath("profile.profiles_order")) {
        for (const auto& value : *order) {
          if (!value.is_string()) {
            continue;
          }
          const auto& id = value.GetString();
          if (const auto* metadata = cache->FindDict(id);
              metadata && AppendChromiumProfile(profiles, directory, id, metadata)) {
            ordered_ids.emplace(id);
          }
        }
      }
      for (auto [id, value] : *cache) {
        if (!ordered_ids.contains(id) && value.is_dict()) {
          AppendChromiumProfile(profiles, directory, id, &value.GetDict());
        }
      }
    }
  }
  // Original4267508 is used only when no cache result survives admission.
  if (profiles.empty()) {
    base::FileEnumerator entries(directory, false,
                                 base::FileEnumerator::DIRECTORIES);
    for (auto path = entries.Next(); !path.empty(); path = entries.Next()) {
      const auto id = path.BaseName().value();
      // Original103eb5c is an ASCII high-bit test in this readdir path,
      // not an ID whitelist applied to the separate JSON cache path.
      if (base::IsStringASCII(id) &&
          (id == "Default" || id.starts_with("Profile ") ||
           (atlas && id.starts_with("user-")))) {
        AppendChromiumProfile(profiles, directory, id, nullptr);
      }
    }
    // Original4268340 compares record+8, its UTF8 ID, bytewise. No numeric
    // Profile suffix sorting or display-name reordering is imposed.
    std::ranges::sort(profiles, [](const auto& left, const auto& right) {
      return *left.GetDict().FindString("id") <
             *right.GetDict().FindString("id");
    });
  }
  return profiles;
}
// Original71f0cc8 reads profiles.ini and delegates to the shared Firefox
// importer. Resolve its relative paths against this explicit source INI before
// invoking the dictionary helper, whose normal GetProfilesINI() is global.
// This is a source-home adaptation, not a different profile selection policy.
base::ListValue DiscoverFirefoxProfiles(const base::FilePath& support,
                                       const base::FilePath* fixture_home) {
  auto ini = support.AppendASCII("Firefox/profiles.ini");
  if (!base::PathExists(ini)) {
    ini = base::FilePath();
  }
  if (fixture_home && !ini.empty()) {
    const auto resolved = base::MakeAbsoluteFilePath(ini);
    if (resolved.empty() || !fixture_home->IsParent(resolved)) {
      return {};
    }
  }
  std::string content;
  base::ReadFileToString(ini, &content);
  DictionaryValueINIParser parser;
  parser.Parse(content);
  auto dictionary = parser.root().Clone();
  for (int index = 0;; ++index) {
    const auto profile = "Profile" + base::NumberToString(index);
    if (!dictionary.Find(profile)) {
      break;
    }
    const auto* relative =
        dictionary.FindStringByDottedPath(profile + ".IsRelative");
    const auto* path = dictionary.FindStringByDottedPath(profile + ".Path");
    if (relative && *relative == "1" && path) {
      const auto resolved =
          ini.DirName().Append(base::FilePath::FromUTF8Unsafe(*path));
      dictionary.SetByDottedPath(profile + ".Path", resolved.value());
      dictionary.SetByDottedPath(profile + ".IsRelative", "0");
    }
  }
  base::ListValue profiles;
  for (const auto& details : GetFirefoxDetailsFromDictionary(dictionary, {})) {
    if (fixture_home) {
      // The explicit disposable fixture boundary must never follow custom INI
      // paths into the owner's source profile. This is fixture-only policy.
      if (!details.path.IsAbsolute() || details.path.ReferencesParent() ||
          !fixture_home->IsParent(details.path)) {
        continue;
      }
      const auto resolved = base::MakeAbsoluteFilePath(details.path);
      if (resolved.empty() || !fixture_home->IsParent(resolved)) {
        continue;
      }
    }
    if (!base::DirectoryExists(details.path)) {
      continue;
    }
    profiles.Append(base::DictValue()
                        .Set("id", details.path.value())
                        .Set("name", details.name.empty()
                                         ? "Default"
                                         : base::UTF16ToUTF8(details.name))
                        .Set("nativePath", details.path.value()));
  }
  return profiles;
}
}  // namespace
base::ListValue DiscoverSources() {
  bool fixture = false;
  const auto home = SourceHome(fixture);
  if (!home) {
    return {};
  }
  auto support = home->AppendASCII("Library/Application Support");
  base::ListValue sources;
  for (const auto& family : kFamilies) {
    // Supplied42653d0 admits only its actual installed application registry.
    // Edge remains a valid internal migrator family, not a chooser entry.
    if (std::string_view(family.id) == "edge" ||
        (!fixture && !InstalledSourceApplication(family.id))) {
      continue;
    }
    auto directory = support.AppendASCII(family.path);
    base::DictValue source;
    source.Set("id", family.id);
    source.Set("name", family.name);
    const auto canonical = base::MakeAbsoluteFilePath(directory);
    const bool available =
        family.firefox ||
        (base::DirectoryExists(directory) &&
         (!fixture || (!canonical.empty() && home->IsParent(canonical))));
    source.Set("installed",
               available && (fixture || InstalledSourceApplication(family.id)));
    source.Set("nativeFixture", fixture);
    if (!available) {
      source.Set("profiles", base::ListValue());
      source.Set("categories", base::ListValue());
      sources.Append(std::move(source));
      continue;
    }
    if (fixture) {
      if (!family.firefox) {
        directory = canonical;
      }
      source.Set("unsupportedReason",
                 "Fixture inventory does not access real "
                 "source Safe Storage credentials.");
    }
    base::ListValue profiles;
    if (family.firefox) {
      profiles = DiscoverFirefoxProfiles(support, fixture ? &*home : nullptr);
    } else {
      profiles = DiscoverChromiumProfiles(directory,
                                           std::string_view(family.id) == "atlas");
    }
    source.Set("profiles", std::move(profiles));
    base::ListValue categories;
    for (auto category : {"bookmarks", "history"}) {
      categories.Append(category);
    }
    if (family.firefox) {
      categories.Append("cookies");
    }
    if (!family.firefox) {
      categories.Append("preferences");
      if (!fixture && SupportsSourceKey(family.id)) {
        categories.Append("passwords");
        categories.Append("cookies");
      }
    }
    source.Set("categories", std::move(categories));
    source.Set("nativeFirefox", family.firefox);
    sources.Append(std::move(source));
  }
  base::DictValue safari;
  safari.Set("id", "safari");
  safari.Set("name", "Safari");
  safari.Set("installed", true);
  // Supplied4275f50 publishes no Safari profiles: the archive is the source.
  safari.Set("profiles", base::ListValue());
  safari.Set("categories", base::ListValue()
                               .Append("bookmarks")
                               .Append("history")
                               .Append("passwords")
                               .Append("paymentCards"));
  if (fixture || InstalledSourceApplication("safari")) {
    sources.Append(std::move(safari));
  }
  // Original fixed registry order is retained even when some apps are absent.
  base::ListValue ordered;
  for (const char* id : {"chrome", "brave", "safari", "firefox", "arc", "atlas",
                         "comet", "dia", "helium"}) {
    for (auto& source : sources) {
      if (source.GetDict().FindString("id") &&
          *source.GetDict().FindString("id") == id) {
        ordered.Append(source.Clone());
        break;
      }
    }
  }
  return ordered;
}
namespace {
base::DictValue ReadChromiumHistory(const base::FilePath& profile);
}  // namespace
base::DictValue ReadCategory(const base::FilePath& profile,
                             bool firefox,
                             std::string category) {
  base::DictValue result;
  auto error = [&](std::string message) {
    result.Set("error", std::move(message));
    return std::move(result);
  };
  if (!firefox && category == "history") {
    return ReadChromiumHistory(profile);
  }
  if (firefox && category == "cookies") {
    std::string snapshot_error;
    auto db = Snapshot(profile.AppendASCII("cookies.sqlite"), snapshot_error);
    if (!db) {
      return base::DictValue().Set("error", snapshot_error);
    }
    auto query = Prepare(
        db.get(),
        "SELECT "
        "host,name,path,value,creationTime,expiry,lastAccessed,isSecure,"
        "isHttpOnly,sameSite,originAttributes FROM moz_cookies LIMIT 50001");
    if (!query) {
      return base::DictValue().Set(
          "error", "Firefox cookie schema lacks required columns");
    }
    base::ListValue rows;
    size_t decoded_bytes = 0;
    int status;
    while ((status = sqlite3_step(query.get())) == SQLITE_ROW) {
      if (rows.size() >= 50000) {
        return base::DictValue().Set("error",
                                     "Firefox cookie row limit exceeded");
      }
      if (!Text(query.get(), 10).empty()) {
        return base::DictValue().Set(
            "error",
            "Firefox container or partition attributes require a separate "
            "context migrator");
      }
      base::DictValue row;
      for (auto [key, index] :
           {std::pair{"host", 0}, {"name", 1}, {"path", 2}, {"secret", 3}}) {
        row.Set(key, Text(query.get(), index));
      }
      for (auto [field, value] : row) {
        const auto& text = value.GetString();
        decoded_bytes += text.size();
        if (!base::IsStringUTF8(text)) {
          return base::DictValue().Set("error",
                                       "Firefox cookie contains invalid text");
        }
      }
      if (decoded_bytes > 32 * 1024 * 1024) {
        return base::DictValue().Set(
            "error", "Firefox decoded cookie size limit exceeded");
      }
      constexpr int64_t offset = 11644473600000000LL;
      const auto creation = sqlite3_column_int64(query.get(), 4),
                 expiry = sqlite3_column_int64(query.get(), 5),
                 accessed = sqlite3_column_int64(query.get(), 6);
      if (creation < 0 || accessed < 0 || creation > INT64_MAX - offset ||
          accessed > INT64_MAX - offset || expiry < 0 ||
          expiry > (INT64_MAX - offset) / 1000000) {
        return base::DictValue().Set(
            "error", "Firefox cookie timestamp is outside supported bounds");
      }
      row.Set("created", base::NumberToString(creation + offset));
      row.Set("accessed", base::NumberToString(accessed + offset));
      row.Set("expires",
              base::NumberToString(expiry ? expiry * 1000000 + offset : 0));
      row.Set("secure", !!sqlite3_column_int(query.get(), 7));
      row.Set("httpOnly", !!sqlite3_column_int(query.get(), 8));
      row.Set("sameSite", sqlite3_column_int(query.get(), 9));
      row.Set("priority", 1);
      row.Set("partition", "");
      row.Set("crossSite", false);
      row.Set("sourceScheme", 0);
      row.Set("sourcePort", -1);
      row.Set("sourceType", 3);
      row.Set("updated", base::NumberToString(accessed + offset));
      rows.Append(std::move(row));
    }
    if (status != SQLITE_DONE) {
      return base::DictValue().Set(
          "error", "Firefox cookie snapshot could not be read completely");
    }
    return base::DictValue().Set("cookies", std::move(rows));
  }
  if (category == "preferences") {
    if (firefox) {
      return error("Firefox preference migration is not supported");
    }
    auto prefs = JSON(profile.AppendASCII("Preferences"));
    if (!prefs) {
      return error("Source preferences are missing or invalid");
    }
    base::DictValue allowed;
    for (const auto* key :
         {"intl.accept_languages", "spellcheck.use_spelling_service",
          "spellcheck.dictionaries", "homepage", "homepage_is_newtabpage",
          "bookmark_bar.show_on_all_tabs"}) {
      if (const auto* value = prefs->FindByDottedPath(key)) {
        allowed.Set(key, value->Clone());
      }
    }
    result.Set("preferences", std::move(allowed));
    return result;
  }
  if (category == "bookmarks" && !firefox) {
    // Original4253e58 reads the source file without an arbitrary byte limit;
    // unreadable/invalid/missing roots contribute no ordinary bookmark rows.
    std::string text;
    std::optional<base::DictValue> source;
    if (base::ReadFileToString(profile.AppendASCII("Bookmarks"), &text)) {
      source = base::JSONReader::ReadDict(text, base::JSON_PARSE_RFC, 200);
    }
    const auto* roots = source ? source->FindDict("roots") : nullptr;
    base::ListValue entries;
    if (roots) {
      for (const auto* root : {"bookmark_bar", "other", "synced"}) {
        if (const auto* node = roots->FindDict(root)) {
          if (const auto* children = node->FindList("children")) {
            const size_t first = entries.size();
            for (const auto& child : *children) {
              if (child.is_dict()) {
                BookmarkTree(child.GetDict(), entries, {}, root);
              }
            }
            const auto* name = node->FindString("name");
            const std::string root_name =
                name && !name->empty()
                    ? *name
                    : std::string(std::string_view(root) == "bookmark_bar"
                                      ? "Bookmarks Bar"
                                      : std::string_view(root) == "other"
                                            ? "Other Bookmarks"
                                            : "Mobile Bookmarks");
            for (size_t index = first; index < entries.size(); ++index) {
              entries[index].GetDict().Set("sourceRootName", root_name);
            }
          }
        }
      }
    }
    result.Set("bookmarks", std::move(entries));
    return result;
  }
  if (category != "history" && category != "bookmarks") {
    return error(
        "This category requires a separately authorized native migrator");
  }
  std::string snapshot_error;
  auto db = Snapshot(profile.AppendASCII(firefox ? "places.sqlite" : "History"),
                     snapshot_error);
  if (!db) {
    return error(snapshot_error);
  }
  if (category == "history") {
    const char* query =
        firefox ? "SELECT "
                  "p.url,p.title,v.visit_date,v.visit_type,p.visit_count,p."
                  "typed FROM moz_historyvisits v JOIN moz_places p ON "
                  "p.id=v.place_id ORDER BY v.visit_date LIMIT 200001"
                : "SELECT url,title,visit_count,typed_count,last_visit_time,"
                  "hidden FROM urls LIMIT 200001";
    auto statement = Prepare(db.get(), query);
    if (!statement) {
      return error("Source history schema lacks required columns");
    }
    base::ListValue visits;
    size_t data_bytes = 0;
    int status;
    while ((status = sqlite3_step(statement.get())) == SQLITE_ROW) {
      if (visits.size() >= 200000) {
        return error(
            "History exceeds the bounded 200000-visit migration limit");
      }
      base::DictValue visit;
      const auto url = Text(statement.get(), 0),
                 title = Text(statement.get(), 1);
      data_bytes += url.size() + title.size() + 128;
      if (data_bytes > 64 * 1024 * 1024) {
        return error("History snapshot exceeds the 64 MiB decoded-row limit");
      }
      visit.Set("url", url);
      visit.Set("title", title);
      visit.Set("timeMicros", base::NumberToString(
                                  sqlite3_column_int64(statement.get(),
                                                       firefox ? 2 : 4)));
      if (firefox) {
        visit.Set("transition", sqlite3_column_int(statement.get(), 3));
      } else {
        visit.Set("chromiumSummary", true);
        visit.Set("hidden", !!sqlite3_column_int(statement.get(), 5));
      }
      visit.Set("visitCount",
                sqlite3_column_int(statement.get(), firefox ? 4 : 2));
      visit.Set("typedCount",
                sqlite3_column_int(statement.get(), firefox ? 5 : 3));
      visit.Set("unixTime", firefox);
      visits.Append(std::move(visit));
    }
    if (status != SQLITE_DONE) {
      return error("History snapshot failed during row reading");
    }
    result.Set("visits", std::move(visits));
    return result;
  }
  auto statement =
      Prepare(db.get(),
              "SELECT b.id,b.parent,b.type,b.title,p.url,b.dateAdded FROM "
              "moz_bookmarks b LEFT JOIN moz_places p ON p.id=b.fk ORDER BY "
              "b.position LIMIT 20001");
  if (!statement) {
    return error("Firefox bookmark schema lacks required columns");
  }
  base::ListValue entries;
  int status;
  while ((status = sqlite3_step(statement.get())) == SQLITE_ROW) {
    if (entries.size() >= 20000) {
      return error("Firefox bookmarks exceed the bounded migration limit");
    }
    base::DictValue row;
    row.Set("id",
            static_cast<double>(sqlite3_column_int64(statement.get(), 0)));
    row.Set("parent",
            static_cast<double>(sqlite3_column_int64(statement.get(), 1)));
    row.Set("type", sqlite3_column_int(statement.get(), 2));
    row.Set("title", Text(statement.get(), 3));
    row.Set("url", Text(statement.get(), 4));
    row.Set("createdUnixMicros",
            base::NumberToString(sqlite3_column_int64(statement.get(), 5)));
    entries.Append(std::move(row));
  }
  if (status != SQLITE_DONE) {
    return error("Firefox bookmark reading failed");
  }
  result.Set("firefoxBookmarks", std::move(entries));
  return result;
}

namespace {
// Original425a544..425a6b4 /425b3f0..425b524: prefer a physical copy of
// this one selected DB; on temp/copy failure open the actual source instead.
class ChromiumSourceSnapshot {
 public:
  bool Open(const base::FilePath& source) {
    base::FilePath selected = source;
    if (temporary_directory_.CreateUniqueTempDir()) {
      const auto copy = temporary_directory_.GetPath().Append(source.BaseName());
      if (base::CopyFile(source, copy)) {
        selected = copy;
      }
    }
    return database_.Open(selected);
  }
  sql::Database& database() { return database_; }

 private:
  // Destruction order is deliberate: real SQLite closes before temp removal.
  base::ScopedTempDir temporary_directory_;
  sql::Database database_{"Test"};  // Exact original source database tag.
};
// Original mode1 source worker4254500..4684 uses this same physical-copy
// owner and native SQL defaults. Missing/open/prepare failures leave no rows;
// Step ending (including an error) retains any rows already decoded.
base::DictValue ReadChromiumHistory(const base::FilePath& profile) {
  base::ListValue visits;
  const auto history = profile.AppendASCII("History");
  ChromiumSourceSnapshot snapshot;
  if (base::PathExists(history) && snapshot.Open(history)) {
    sql::Statement query(snapshot.database().GetUniqueStatement(
        "SELECT url, title, visit_count, typed_count, last_visit_time, hidden "
        "FROM urls"));
    if (query.is_valid()) {
      while (query.Step()) {
        const GURL url(query.ColumnString(0));
        if (!url.is_valid() || url.SchemeIs("chrome") ||
            url.SchemeIs("chrome-extension") || url.SchemeIs("devtools")) {
          continue;
        }
        base::DictValue visit;
        visit.Set("url", url.spec());
        visit.Set("title", base::UTF16ToUTF8(query.ColumnString16(1)));
        visit.Set("visitCount", query.ColumnInt(2));
        visit.Set("typedCount", query.ColumnInt(3));
        visit.Set("timeMicros", base::NumberToString(query.ColumnInt64(4)));
        visit.Set("hidden", query.ColumnBool(5));
        visit.Set("chromiumSummary", true);
        visit.Set("unixTime", false);
        visits.Append(std::move(visit));
      }
    }
  }
  return base::DictValue().Set("visits", std::move(visits));
}
std::string EncryptedSourceText(sql::Statement& statement, int column) {
  return statement.ColumnString(column);
}
base::DictValue ReadEncryptedCategoryImpl(const base::FilePath& profile,
                                          std::string category,
                                          const SourceKey& key,
                                          bool private_bytes) {
  base::DictValue result;
  auto fail = [&](const char* message) {
    result.clear();
    result.Set("error", message);
    return std::move(result);
  };
  const bool cookies = category == "cookies";
  if (!cookies && category != "passwords") {
    return fail("Unknown encrypted category");
  }
  // Supplied425b1e0..425b5c0 reads profile then account login stores.
  std::vector<base::FilePath> paths;
  if (cookies) {
    auto path = profile.AppendASCII("Network/Cookies");
    if (!base::PathExists(path)) {
      path = profile.AppendASCII("Cookies");
    }
    if (!base::PathExists(path)) {
      result.Set("cookies", base::ListValue());
      return result;
    }
    paths.push_back(std::move(path));
  } else {
    for (const char* name : {"Login Data", "Login Data For Account"}) {
      auto path = profile.AppendASCII(name);
      if (base::PathExists(path)) {
        paths.push_back(std::move(path));
      }
    }
    if (paths.empty()) {
      result.Set("passwords", base::ListValue());
      return result;
    }
  }
  base::ListValue rows;
  std::set<std::string> seen_passwords;
  size_t encrypted_values = 0;
  size_t decrypted_values = 0;
  for (const auto& path : paths) {
    ChromiumSourceSnapshot snapshot;
    if (!snapshot.Open(path)) {
      return fail("Source database could not be opened");
    }
    const std::string query_text =
        cookies
            ? "SELECT "
              "creation_utc,host_key,top_frame_site_key,name,value,encrypted_"
              "value,path,expires_utc,is_secure,is_httponly,last_access_utc,has_"
              "expires,is_persistent,priority,samesite,source_scheme,source_port,"
              "last_update_utc,source_type,has_cross_site_ancestor FROM cookies"
            : "SELECT "
              "origin_url,action_url,username_element,username_value,password_"
              "element,password_value,submit_element,signon_realm,date_created,"
              "blacklisted_by_user,scheme,password_type,times_used,display_name,"
              "icon_url,federation_url,skip_zero_click,generation_upload_status,"
              "date_last_used,date_password_modified,sender_email,sender_name,"
              "date_received,sharing_notification_displayed,sender_profile_"
              "image_url,date_last_filled,actor_login_approved FROM logins";
    sql::Statement query(snapshot.database().GetUniqueStatement(query_text));
    if (!query.is_valid()) {
      return fail("Encrypted source database lacks required columns");
    }
    while (query.Step()) {
      const bool blocked = !cookies && query.ColumnInt(9);
      const int column = 5;
      const auto blob = query.ColumnBlobAsString(column);
      const size_t length = blob.size();
      const auto host = cookies ? EncryptedSourceText(query, 1) : std::string();
      std::optional<std::string> plaintext;
      if (cookies) {
        // Supplied425a8f4..425a918 prefers a nonempty plaintext value even
        // when encrypted_value is also populated.
        plaintext = EncryptedSourceText(query, 4);
      }
      if (blocked) {
        plaintext = std::string();
      } else if (cookies && !plaintext->empty()) {
        // Source plaintext cookies do not participate in the decode counters.
      } else if (length) {
        ++encrypted_values;
        const std::string_view ciphertext(blob);
        // Both original readers call425cda0: non-v10 input is copied as-is;
        // v10 alone is AES-decoded with the already-authorized source key.
        plaintext = !ciphertext.starts_with("v10")
                        ? std::optional<std::string>(ciphertext)
                        : DecryptSourceValue(ciphertext, key);
        if (!plaintext) {
          continue;
        }
        if (cookies) {
          // Supplied425a938..425aa54 requires SHA256(host) on EVERY encrypted
          // cookie path, not a synthetic meta-version gate. Mismatch skips.
          const auto digest = crypto::hash::Sha256(host);
          if (plaintext->size() < digest.size() ||
              !std::ranges::equal(plaintext->substr(0, digest.size()), digest,
                                  [](char a, unsigned char b) {
                                    return static_cast<unsigned char>(a) == b;
                                  })) {
            continue;
          }
          plaintext->erase(0, digest.size());
        }
        ++decrypted_values;
      } else {
        plaintext = std::string();
      }
      if (!private_bytes && !base::IsStringUTF8(*plaintext)) {
        return fail(
            "Decoded category exceeds its bounds or contains invalid text");
      }
      base::DictValue row;
      auto stage_bytes = [&](std::string_view name, std::string bytes) {
        if (private_bytes) {
          SetEncryptedSourceBytes(row, name, std::move(bytes));
        } else {
          row.Set(name, std::move(bytes));
        }
      };
      stage_bytes("secret", std::move(*plaintext));
      if (cookies) {
        stage_bytes("host", host);
        stage_bytes("name", EncryptedSourceText(query, 3));
        stage_bytes("path", EncryptedSourceText(query, 6));
        for (auto [field, index] :
             {std::pair{"created", 0}, {"expires", 7}, {"accessed", 10}}) {
          row.Set(field,
                  base::NumberToString(query.ColumnInt64(index)));
        }
        row.Set("secure", !!query.ColumnInt(8));
        row.Set("httpOnly", !!query.ColumnInt(9));
        row.Set("sameSite", query.ColumnInt(14));
        row.Set("priority", query.ColumnInt(13));
        stage_bytes("partition", EncryptedSourceText(query, 2));
        row.Set("crossSite", !!query.ColumnInt(19));
        row.Set("sourceScheme", query.ColumnInt(15));
        row.Set("sourcePort", query.ColumnInt(16));
        row.Set("sourceType", query.ColumnInt(18));
        row.Set("updated",
                base::NumberToString(query.ColumnInt64(17)));
      } else {
        // Exact source425b820..425bda4 / original27-column SELECT.
        for (auto [field, index] : {std::pair{"url", 0},
                                    {"action", 1},
                                    {"usernameElement", 2},
                                    {"username", 3},
                                    {"passwordElement", 4},
                                    {"submitElement", 6},
                                    {"realm", 7},
                                    {"displayName", 13},
                                    {"iconUrl", 14},
                                    {"federationUrl", 15},
                                    {"senderEmail", 20},
                                    {"senderName", 21},
                                    {"senderProfileImageUrl", 24}}) {
          stage_bytes(field, EncryptedSourceText(query, index));
        }
        for (auto [field, index] :
             {std::pair{"created", 8}, {"used", 18}, {"modified", 19},
              {"received", 22}, {"filled", 25}}) {
          row.Set(field,
                  base::NumberToString(query.ColumnInt64(index)));
        }
        row.Set("timesUsed", query.ColumnInt(12));
        row.Set("scheme", query.ColumnInt(10));
        row.Set("passwordType", query.ColumnInt(11));
        row.Set("skipZeroClick", !!query.ColumnInt(16));
        row.Set("generationUploadStatus", query.ColumnInt(17));
        row.Set("sharingNotificationDisplayed", !!query.ColumnInt(23));
        row.Set("actorLoginApproved", !!query.ColumnInt(26));
        row.Set("blocked", blocked);
        if (blocked) {
          row.Set("username", "");
        }
      }
      if (!cookies) {
        // Original425b658..425b74c joins realm, UTF8 username, UTF8 password,
        // and blocked state with newlines; its set insertion keeps the first.
        // Original dedup converts the real UTF16 username/password back to
        // UTF8. Invalid input follows the native conversion, not raw-byte keys.
        auto text = [&](std::string_view name) {
          return *GetEncryptedSourceBytes(row, name);
        };
        const auto identity = std::string(text("realm")) + "\n" +
            base::UTF16ToUTF8(base::UTF8ToUTF16(text("username"))) + "\n" +
            base::UTF16ToUTF8(base::UTF8ToUTF16(text("secret"))) + "\n" +
            (blocked ? "1" : "0");
        if (!seen_passwords.insert(identity).second) {
          continue;
        }
      }
      if (!private_bytes) {
        for (auto [field, value] : row) {
          if (value.is_string() && !base::IsStringUTF8(value.GetString())) {
            return fail("Decoded source metadata contains invalid text");
          }
        }
      }
      rows.Append(std::move(row));
    }
    if (!query.Succeeded()) {
      return fail("Encrypted source snapshot failed while reading rows");
    }
  }
  // Original425a778/425b78c admit no encrypted attempts or at least one
  // successful decode. Row skips do not turn an all-failed source into success.
  if (encrypted_values && !decrypted_values) {
    return fail(cookies ? "Source cookies could not be decrypted"
                        : "Source passwords could not be decrypted");
  }
  result.Set(cookies ? "cookies" : "passwords", std::move(rows));
  return result;
}
}  // namespace
base::DictValue ReadEncryptedCategory(const base::FilePath& profile,
                                      std::string category,
                                      const SourceKey& key) {
  return ReadEncryptedCategoryImpl(profile, std::move(category), key, false);
}
base::DictValue ReadAuthorizedCategory(const base::FilePath& profile,
                                       bool firefox,
                                       std::string source,
                                       std::string category) {
  if ((firefox && category == "cookies") ||
      (category != "passwords" && category != "cookies")) {
    return ReadCategory(profile, firefox, category);
  }
  auto database = profile.AppendASCII(
      category == "passwords" ? "Login Data" : "Network/Cookies");
  if (category == "cookies" && !base::PathExists(database)) {
    database = profile.AppendASCII("Cookies");
  } else if (category == "passwords" && !base::PathExists(database)) {
    database = profile.AppendASCII("Login Data For Account");
  }
  if (!base::PathExists(database)) {
    return base::DictValue().Set("error",
                                 "Selected source database is unavailable");
  }
  std::string error;
  auto key = AuthorizeSourceKey(source, error);
  if (!key) {
    return base::DictValue().Set("error", error);
  }
  auto result = ReadEncryptedCategory(profile, category, *key);
  ClearSourceKey(*key);
  return result;
}
base::DictValue ReadChromiumMigrationSnapshot(
    const base::FilePath& profile,
    std::string source,
    std::vector<std::string> categories,
    bool include_extensions) {
  auto database_for = [&](std::string_view category) {
    auto path = profile.AppendASCII(category == "passwords" ? "Login Data"
                                                            : "Network/Cookies");
    if (!base::PathExists(path)) {
      path = profile.AppendASCII(category == "passwords"
                                     ? "Login Data For Account"
                                     : "Cookies");
    }
    return path;
  };
  bool needs_key = false;
  for (const auto& category : categories) {
    if ((category == "passwords" || category == "cookies") &&
        base::PathExists(database_for(category))) {
      needs_key = true;
    }
  }
  std::optional<SourceKey> key;
  if (needs_key) {
    std::string error;
    key = AuthorizeSourceKey(source, error);
    if (!key) {
      return base::DictValue().Set("error", error);
    }
  }
  base::ListValue snapshots;
  for (const auto& category : categories) {
    base::DictValue data;
    const bool encrypted = category == "passwords" || category == "cookies";
    if (encrypted && !base::PathExists(database_for(category))) {
      data.Set(category, base::ListValue());
    } else if (category == "bookmarks" &&
               !base::PathExists(profile.AppendASCII("Bookmarks"))) {
      data.Set("bookmarks", base::ListValue());
    } else if (category == "history" &&
               !base::PathExists(profile.AppendASCII("History"))) {
      data.Set("visits", base::ListValue());
    } else if (encrypted) {
      // Only the real optional admitted above can enter encrypted readers.
      if (!key) {
        return base::DictValue().Set(
            "error", "Source encrypted databases changed during snapshot");
      }
      data = ReadEncryptedCategoryImpl(profile, category, *key, true);
    } else {
      data = ReadCategory(profile, false, category);
    }
    if (const auto* error = data.FindString("error")) {
      return base::DictValue().Set("error", *error);
    }
    if (source == "arc" && category == "bookmarks") {
      if (auto* bookmarks = data.FindList("bookmarks")) {
        AppendArcSidebarBookmarks(profile, *bookmarks);
      }
    }
    snapshots.Append(std::move(data));
  }
  base::DictValue result;
  result.Set("snapshots", std::move(snapshots));
  if (include_extensions) {
    result.Set("extensions", ReadChromiumExtensionImports(profile));
  }
  return result;
}
}  // namespace aux_import

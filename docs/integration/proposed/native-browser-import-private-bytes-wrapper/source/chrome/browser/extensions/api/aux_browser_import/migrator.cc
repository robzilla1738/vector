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
#include "base/json/json_reader.h"
#include "base/path_service.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/extensions/api/aux_browser_import/encrypted_source_bytes.h"
#include "base/threading/platform_thread.h"
#include "crypto/hash.h"
#include "third_party/sqlite/sqlite3.h"
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
bool BookmarkTree(const base::DictValue& node,
                  base::ListValue& result,
                  const base::ListValue& path,
                  std::string root,
                  int depth) {
  if (depth > 64 || result.size() > 20000) {
    return false;
  }
  auto next = path.Clone();
  const auto *type = node.FindString("type"), *name = node.FindString("name");
  if (!type || !name) {
    return false;
  }
  if (*type != "folder" && *type != "url") {
    return false;
  }
  const bool folder = *type == "folder";
  base::DictValue row;
  row.Set("root", root);
  row.Set("path", path.Clone());
  row.Set("title", name->substr(0, 1024));
  row.Set("folder", folder);
  if (const auto* date = node.FindString("date_added")) {
    int64_t number = 0;
    if (base::StringToInt64(*date, &number)) {
      row.Set("createdWindowsMicros", base::NumberToString(number));
    }
  }
  if (!folder) {
    const auto* url = node.FindString("url");
    if (!url || url->size() > 8192) {
      return false;
    }
    row.Set("url", *url);
  }
  result.Append(std::move(row));
  if (folder) {
    next.Append(*name);
    if (const auto* children = node.FindList("children")) {
      for (const auto& child : *children) {
        if (!child.is_dict() ||
            !BookmarkTree(child.GetDict(), result, next, root, depth + 1)) {
          return false;
        }
      }
    }
  }
  return true;
}
// Original426793c admits actual directories; retain Aux's existing identifier,
// symlink and bounded-inventory checks at this external filesystem boundary.
bool AppendChromiumProfile(base::ListValue& profiles,
                           const base::FilePath& directory,
                           std::string_view id,
                           const base::DictValue* metadata) {
  if (profiles.size() >= 128 || id.empty() || id.find('/') != id.npos ||
      id.find("..") != id.npos || id.find('\0') != id.npos ||
      !base::IsStringUTF8(id)) {
    return false;
  }
  const auto path = directory.Append(base::FilePath::FromUTF8Unsafe(id));
  if (!base::DirectoryExists(path) || base::IsLink(path)) {
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
base::ListValue DiscoverChromiumProfiles(const base::FilePath& directory,
                                       bool atlas) {
  base::ListValue profiles;
  if (auto state = JSON(directory.AppendASCII("Local State"))) {
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
      if (id == "Default" || id.starts_with("Profile ") ||
          (atlas && id.starts_with("user-"))) {
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
        base::DirectoryExists(directory) &&
        (!fixture || (!canonical.empty() && home->IsParent(canonical)));
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
      directory = canonical;
      source.Set("unsupportedReason",
                 "Fixture inventory does not access real "
                 "source Safe Storage credentials.");
    }
    base::ListValue profiles;
    if (family.firefox) {
      base::FileEnumerator directories(directory, false,
                                       base::FileEnumerator::DIRECTORIES);
      for (auto path = directories.Next();
           !path.empty() && profiles.size() < 128; path = directories.Next()) {
        if (!base::IsLink(path) &&
            base::PathExists(path.AppendASCII("places.sqlite"))) {
          profiles.Append(base::DictValue()
                              .Set("id", path.BaseName().value())
                              .Set("name", path.BaseName().value())
                              .Set("nativePath", path.value()));
        }
      }
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
  safari.Set("profiles",
             base::ListValue().Append(
                 base::DictValue()
                     .Set("id", "archive")
                     .Set("name", "All profiles in selected export")));
  safari.Set("categories", base::ListValue()
                               .Append("bookmarks")
                               .Append("history")
                               .Append("passwords"));
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
base::DictValue ReadCategory(const base::FilePath& profile,
                             bool firefox,
                             std::string category) {
  base::DictValue result;
  auto error = [&](std::string message) {
    result.Set("error", std::move(message));
    return std::move(result);
  };
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
    auto bookmarks = JSON(profile.AppendASCII("Bookmarks"));
    const auto* roots = bookmarks ? bookmarks->FindDict("roots") : nullptr;
    if (!roots) {
      return error("Source bookmark roots are missing or invalid");
    }
    base::ListValue entries;
    for (const auto* root : {"bookmark_bar", "other", "synced"}) {
      if (const auto* node = roots->FindDict(root)) {
        if (const auto* children = node->FindList("children")) {
          for (const auto& child : *children) {
            if (!child.is_dict() ||
                !BookmarkTree(child.GetDict(), entries, {}, root, 0)) {
              return error(
                  "Bookmark hierarchy exceeds limits or contains invalid "
                  "records");
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
// Supplied encrypted readers use SQLite string lengths, without Text()'s
// inherited 8192-byte truncation. Native SQLite/allocation limits still apply.
std::string EncryptedSourceText(sqlite3_stmt* statement, int column) {
  const auto* value = sqlite3_column_text(statement, column);
  const int size = sqlite3_column_bytes(statement, column);
  return !value || size < 0 ? std::string()
                           : std::string(reinterpret_cast<const char*>(value), size);
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
    paths.push_back(std::move(path));
  } else {
    for (const char* name : {"Login Data", "Login Data For Account"}) {
      auto path = profile.AppendASCII(name);
      if (base::PathExists(path)) {
        paths.push_back(std::move(path));
      }
    }
    if (paths.empty()) {
      return fail("Selected source database is unavailable");
    }
  }
  base::ListValue rows;
  std::set<std::string> seen_passwords;
  size_t encrypted_values = 0;
  size_t decrypted_values = 0;
  for (const auto& path : paths) {
    std::string error;
    auto db = Snapshot(path, error);
    if (!db) {
      result.Set("error", error);
      return result;
    }
    auto query = Prepare(
        db.get(),
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
              "image_url,date_last_filled,actor_login_approved FROM logins");
    if (!query) {
      return fail("Encrypted source database lacks required columns");
    }
    int status;
    while ((status = sqlite3_step(query.get())) == SQLITE_ROW) {
      const bool blocked = !cookies && sqlite3_column_int(query.get(), 9);
      const int column = 5;
      auto* blob = sqlite3_column_blob(query.get(), column);
      const int length = sqlite3_column_bytes(query.get(), column);
      if (length < 0) {
        return fail("Encrypted source row has an invalid byte count");
      }
      const auto host = cookies ? EncryptedSourceText(query.get(), 1) : std::string();
      std::optional<std::string> plaintext;
      if (cookies) {
        // Supplied425a8f4..425a918 prefers a nonempty plaintext value even
        // when encrypted_value is also populated.
        plaintext = EncryptedSourceText(query.get(), 4);
      }
      if (blocked) {
        plaintext = std::string();
      } else if (cookies && !plaintext->empty()) {
        // Source plaintext cookies do not participate in the decode counters.
      } else if (length) {
        ++encrypted_values;
        const std::string_view ciphertext(static_cast<const char*>(blob), length);
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
        stage_bytes("name", EncryptedSourceText(query.get(), 3));
        stage_bytes("path", EncryptedSourceText(query.get(), 6));
        for (auto [field, index] :
             {std::pair{"created", 0}, {"expires", 7}, {"accessed", 10}}) {
          row.Set(field,
                  base::NumberToString(sqlite3_column_int64(query.get(), index)));
        }
        row.Set("secure", !!sqlite3_column_int(query.get(), 8));
        row.Set("httpOnly", !!sqlite3_column_int(query.get(), 9));
        row.Set("sameSite", sqlite3_column_int(query.get(), 14));
        row.Set("priority", sqlite3_column_int(query.get(), 13));
        stage_bytes("partition", EncryptedSourceText(query.get(), 2));
        row.Set("crossSite", !!sqlite3_column_int(query.get(), 19));
        row.Set("sourceScheme", sqlite3_column_int(query.get(), 15));
        row.Set("sourcePort", sqlite3_column_int(query.get(), 16));
        row.Set("sourceType", sqlite3_column_int(query.get(), 18));
        row.Set("updated",
                base::NumberToString(sqlite3_column_int64(query.get(), 17)));
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
          stage_bytes(field, EncryptedSourceText(query.get(), index));
        }
        for (auto [field, index] :
             {std::pair{"created", 8}, {"used", 18}, {"modified", 19},
              {"received", 22}, {"filled", 25}}) {
          row.Set(field,
                  base::NumberToString(sqlite3_column_int64(query.get(), index)));
        }
        row.Set("timesUsed", sqlite3_column_int(query.get(), 12));
        row.Set("scheme", sqlite3_column_int(query.get(), 10));
        row.Set("passwordType", sqlite3_column_int(query.get(), 11));
        row.Set("skipZeroClick", !!sqlite3_column_int(query.get(), 16));
        row.Set("generationUploadStatus", sqlite3_column_int(query.get(), 17));
        row.Set("sharingNotificationDisplayed", !!sqlite3_column_int(query.get(), 23));
        row.Set("actorLoginApproved", !!sqlite3_column_int(query.get(), 26));
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
    if (status != SQLITE_DONE) {
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
    std::vector<std::string> categories) {
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
    snapshots.Append(std::move(data));
  }
  return base::DictValue().Set("snapshots", std::move(snapshots));
}
}  // namespace aux_import

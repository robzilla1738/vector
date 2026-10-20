#include "chrome/browser/extensions/api/aux_browser_import/chromium_profile_clone.h"

#include <array>
#include <optional>
#include <set>
#include <string_view>
#include <utility>
#include <vector>

#include "base/files/file_enumerator.h"
#include "base/files/file_util.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/prefs/chrome_pref_service_factory.h"
#include "url/gurl.h"

namespace aux_import {
namespace {

using ExtensionIds = std::set<std::string>;

std::optional<base::DictValue> ReadPreferences(const base::FilePath& path) {
  std::string bytes;
  if (!base::ReadFileToString(path, &bytes))
    return std::nullopt;
  return base::JSONReader::ReadDict(bytes, base::JSON_PARSE_RFC, 200);
}

// Original4259adc/4259ef0 source inventories. Themes are excluded by unpacked
// manifest or stored manifest; the remaining update descriptors are installed
// by the real post-initialization destination owner, not this file worker.
struct ExtensionPlan {
  ExtensionIds themes;
  ExtensionIds reinstall;
  base::ListValue imports;
};

ExtensionPlan ReadExtensionPlan(const base::FilePath& source) {
  ExtensionPlan plan;
  base::FileEnumerator ids(source.AppendASCII("Extensions"), false,
                           base::FileEnumerator::DIRECTORIES);
  for (auto id = ids.Next(); !id.empty(); id = ids.Next()) {
    base::FileEnumerator versions(id, false, base::FileEnumerator::DIRECTORIES);
    for (auto version = versions.Next(); !version.empty();
         version = versions.Next()) {
      auto manifest = ReadPreferences(version.AppendASCII("manifest.json"));
      if (manifest && manifest->FindDict("theme")) {
        plan.themes.insert(id.BaseName().value());
        break;
      }
    }
  }
  auto secure = ReadPreferences(source.AppendASCII("Secure Preferences"));
  auto* settings = secure
      ? secure->FindDictByDottedPath("extensions.settings") : nullptr;
  if (!settings)
    return plan;
  for (const auto entry : *settings) {
    const auto* value = entry.second.GetIfDict();
    if (!value || plan.themes.contains(entry.first))
      continue;
    auto* manifest = value->FindDict("manifest");
    if (manifest && manifest->FindDict("theme"))
      continue;
    GURL update;
    auto* update_url = value->FindStringByDottedPath("manifest.update_url");
    if (update_url) {
      update = GURL(*update_url);
      if (!update.is_valid())
        continue;
    } else if (!value->FindBool("from_webstore").value_or(false)) {
      continue;
    }
    plan.reinstall.insert(entry.first);
    plan.imports.Append(base::DictValue().Set("id", entry.first).Set(
        "updateUrl", update.spec()));
  }
  return plan;
}

bool IsExcludedCache(std::string_view name) {
  constexpr std::array<std::string_view, 7> names = {
      "Cache", "GPUCache", "DawnCache", "Code Cache", "ShaderCache",
      "GrShaderCache", "DawnGraphiteCache"};
  for (auto candidate : names) {
    if (name == candidate)
      return true;
  }
  return false;
}

bool IsEncryptedStore(const std::vector<base::FilePath::StringType>& parts) {
  if (parts.empty() ||
      (parts.size() != 1 && (parts.size() != 2 || parts.front() != "Network")))
    return false;
  constexpr std::array<std::string_view, 8> names = {
      "Cookies", "Cookies-journal", "Extension Cookies",
      "Extension Cookies-journal", "Login Data", "Login Data-journal",
      "Login Data For Account", "Login Data For Account-journal"};
  for (auto candidate : names) {
    if (parts.back() == candidate)
      return true;
  }
  return false;
}

bool HasThemeComponent(
    const std::vector<base::FilePath::StringType>& parts,
    const ExtensionIds& themes) {
  for (const auto& part : parts) {
    if (!base::IsStringUTF8(part))
      continue;
    if (themes.contains(part))
      return true;
    for (const auto& id : themes) {
      if (base::StartsWith(part, "chrome-extension_" + id,
                           base::CompareCase::SENSITIVE))
        return true;
    }
  }
  return false;
}

// Root remains unchanged through recursion. All path filtering is relative to
// that actual source root. Native FileEnumerator/CopyFile own platform symlink
// semantics; no independent row/byte/file/depth cap or new link policy is added.
bool CopyProfileTree(const base::FilePath& root,
                     const base::FilePath& source,
                     const base::FilePath& target,
                     const ExtensionPlan& plan) {
  if (!base::CreateDirectory(target))
    return false;
  base::FileEnumerator entries(source, false,
      base::FileEnumerator::FILES | base::FileEnumerator::DIRECTORIES);
  for (auto path = entries.Next(); !path.empty(); path = entries.Next()) {
    const auto info = entries.GetInfo();
    base::FilePath relative;
    const bool has_relative = root.AppendRelativePath(path, &relative);
    if (has_relative && !relative.empty()) {
      const auto parts = relative.GetComponents();
      if (HasThemeComponent(parts, plan.themes))
        continue;
      if (info.IsDirectory()) {
        if (IsExcludedCache(relative.BaseName().value()))
          continue;
      } else {
        // Original only skips extension files; their directory tree may remain.
        if (parts.size() >= 2 && parts.front() == "Extensions" &&
            base::IsStringUTF8(parts[1]) && plan.reinstall.contains(parts[1]))
          continue;
        if (IsEncryptedStore(parts))
          continue;
      }
    }
    const auto destination = target.Append(path.BaseName());
    if (info.IsDirectory()) {
      if (!CopyProfileTree(root, path, destination, plan))
        return false;
    } else if (!base::CreateDirectory(destination.DirName()) ||
               !base::CopyFile(path, destination)) {
      return false;
    }
  }
  return true;
}

// Original425ee14: valid cryptographic scheme; precisely the source Comet home
// hosts and /b/home or /b/home/. No generic homepage/startup URL filtering.
bool IsCometHome(const std::string& value) {
  const GURL url(value);
  return url.is_valid() && url.SchemeIsCryptographic() &&
      (url.host() == "perplexity.ai" || url.host() == "www.perplexity.ai") &&
      (url.path() == "/b/home" || url.path() == "/b/home/");
}

bool RewritePreferences(const base::FilePath& path,
                        bool comet,
                        const std::u16string* name,
                        const ExtensionPlan& plan) {
  if (!base::PathExists(path))
    return true;
  auto preferences = ReadPreferences(path);
  if (!preferences)
    return false;
  if (name)
    preferences->SetByDottedPath("profile.name", base::UTF16ToUTF8(*name));
  preferences->RemoveByDottedPath("extensions.theme.id");
  preferences->RemoveByDottedPath("extensions.theme.pack");
  if (comet) {
    if (auto* url = preferences->FindStringByDottedPath(
            "newtab_page_location_override"); url && IsCometHome(*url))
      preferences->RemoveByDottedPath("newtab_page_location_override");
    if (auto* urls = preferences->FindListByDottedPath("session.startup_urls")) {
      for (auto it = urls->begin(); it != urls->end();) {
        if (it->is_string() && IsCometHome(it->GetString()))
          it = urls->erase(it);
        else
          ++it;
      }
      if (urls->empty() &&
          preferences->FindIntByDottedPath("session.restore_on_startup") == 4)
        preferences->SetByDottedPath("session.restore_on_startup", 5);
    }
    if (auto* url = preferences->FindStringByDottedPath("homepage");
        url && IsCometHome(*url)) {
      preferences->RemoveByDottedPath("homepage");
      preferences->SetByDottedPath("homepage_is_newtabpage", true);
    }
  }
  ExtensionIds settings_removed = plan.themes;
  for (const auto& id : plan.reinstall)
    settings_removed.erase(id);
  if (!settings_removed.empty()) {
    for (auto key : {"extensions.commands", "extensions.settings"}) {
      if (auto* dict = preferences->FindDictByDottedPath(key)) {
        for (const auto& id : settings_removed)
          dict->Remove(id);
      }
    }
    for (auto key : {"extensions.pinned_extensions", "extensions.toolbar"}) {
      if (auto* list = preferences->FindListByDottedPath(key)) {
        for (auto it = list->begin(); it != list->end();) {
          if (it->is_string() && plan.themes.contains(it->GetString()))
            it = list->erase(it);
          else
            ++it;
        }
      }
    }
  }
  std::string json;
  return base::JSONWriter::Write(*preferences, &json, 200) &&
         base::WriteFile(path, json);
}

}  // namespace

ChromiumCloneFilesResult PrepareChromiumCloneFiles(
    const base::FilePath& source_profile,
    const base::FilePath& target_profile,
    const std::string& source_id,
    const std::u16string& profile_name) {
  ChromiumCloneFilesResult result;
  if (!base::DirectoryExists(source_profile))
    return result;
  const auto plan = ReadExtensionPlan(source_profile);
  // Original worker removes its reserved new target before the recursive copy.
  base::DeletePathRecursively(target_profile);
  if (!CopyProfileTree(source_profile, source_profile, target_profile, plan) ||
      !RewritePreferences(target_profile.AppendASCII("Preferences"),
                          source_id == "comet", &profile_name, plan) ||
      !RewritePreferences(target_profile.AppendASCII("Secure Preferences"),
                          source_id == "comet", nullptr, plan)) {
    base::DeletePathRecursively(target_profile);
    return result;
  }
  result.success = true;
  result.extensions = plan.imports.Clone();
  return result;
}

bool InitializeChromiumCloneTrackedPreferences(
    const base::FilePath& target_profile) {
  auto preferences = ReadPreferences(target_profile.AppendASCII("Preferences"));
  if (!preferences)
    return false;
  const auto secure_path = target_profile.AppendASCII("Secure Preferences");
  if (base::PathExists(secure_path)) {
    auto secure = ReadPreferences(secure_path);
    if (!secure)
      return false;
    preferences->Merge(std::move(*secure));
    base::DeleteFile(secure_path);
  }
  preferences->RemoveByDottedPath("protection.macs");
  preferences->RemoveByDottedPath("protection.super_mac");
  // Original01ae39c0 is a literal Dict::Remove, not RemoveByDottedPath.
  preferences->Remove("prefs.tracked_preferences_reset");
  preferences->Remove("prefs.preference_reset_time");
  preferences->Remove("schedule_to_flush_to_disk");
  return chrome_prefs::InitializePrefsFromMasterPrefs(
      target_profile, std::move(*preferences), nullptr);
}

}  // namespace aux_import

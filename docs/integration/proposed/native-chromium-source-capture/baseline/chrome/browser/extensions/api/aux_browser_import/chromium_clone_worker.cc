#include "chrome/browser/extensions/api/aux_browser_import/chromium_clone_worker.h"

#include <algorithm>
#include <cstdint>
#include <utility>

#include "base/files/file_util.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/strings/string_number_conversions.h"
#include "base/time/time.h"
#include "base/uuid.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_profile_clone.h"
#include "chrome/browser/extensions/api/aux_browser_import/migrator.h"
#include "chrome/browser/extensions/api/aux_browser_import/source_crypto.h"

namespace aux_import {
namespace {

const char* SourceId(ChromiumCloneSource source) {
  switch (source) {
    case ChromiumCloneSource::kArc: return "arc";
    case ChromiumCloneSource::kBrave: return "brave";
    case ChromiumCloneSource::kAtlas: return "atlas";
    case ChromiumCloneSource::kChrome: return "chrome";
    case ChromiumCloneSource::kComet: return "comet";
    case ChromiumCloneSource::kDia: return "dia";
    case ChromiumCloneSource::kEdge: return "edge";
    case ChromiumCloneSource::kHelium: return "helium";
  }
}
const char* SourceName(ChromiumCloneSource source) {
  switch (source) {
    case ChromiumCloneSource::kArc: return "Arc";
    case ChromiumCloneSource::kBrave: return "Brave";
    case ChromiumCloneSource::kAtlas: return "ChatGPT Atlas";
    case ChromiumCloneSource::kChrome: return "Chrome";
    case ChromiumCloneSource::kComet: return "Comet";
    case ChromiumCloneSource::kDia: return "Dia";
    case ChromiumCloneSource::kEdge: return "Microsoft Edge";
    case ChromiumCloneSource::kHelium: return "Helium";
  }
}

// Original4259690 only tests the existence of these four database paths.
bool HasEncryptedData(const base::FilePath& profile) {
  return base::PathExists(profile.AppendASCII("Login Data")) ||
         base::PathExists(profile.AppendASCII("Login Data For Account")) ||
         base::PathExists(profile.AppendASCII("Cookies")) ||
         base::PathExists(profile.AppendASCII("Network/Cookies"));
}

std::string Now() {
  return base::NumberToString(
      base::Time::Now().ToDeltaSinceWindowsEpoch().InMicroseconds());
}

base::DictValue RootFolder(const char* name, const char* id, const char* guid) {
  return base::DictValue()
      .Set("children", base::ListValue())
      .Set("date_added", Now())
      .Set("date_last_used", "0")
      .Set("date_modified", "0")
      .Set("guid", guid)
      .Set("id", id)
      .Set("name", name)
      .Set("type", "folder");
}

// Original426de00/426ccc0 scans the complete JSON recursively, not only roots.
uint32_t MaxBookmarkId(const base::Value& value) {
  uint32_t largest = 0;
  if (value.is_dict()) {
    const auto& dict = value.GetDict();
    int id = 0;
    if (const auto* text = dict.FindString("id");
        text && base::StringToInt(*text, &id) && id > 0) {
      largest = static_cast<uint32_t>(id);
    }
    for (const auto item : dict)
      largest = std::max(largest, MaxBookmarkId(item.second));
  } else if (value.is_list()) {
    for (const auto& child : value.GetList())
      largest = std::max(largest, MaxBookmarkId(child));
  }
  return largest;
}

size_t Depth(const base::Value& row) {
  return row.GetDict().FindList("path")->size();
}

// The existing original Arc parser emits preorder rows, including every folder
// before its descendants. Consume by depth, not name: duplicate folder names
// are distinct native nodes. Original426cd6c assigns IDs AFTER child recursion.
base::DictValue SerializeArcNode(const base::ListValue& rows,
                                 size_t& index,
                                 uint32_t& next_id) {
  const auto& row = rows[index].GetDict();
  const size_t depth = Depth(rows[index]);
  const bool folder = row.FindBool("folder").value_or(false);
  const std::string name = *row.FindString("title");
  const std::string now = Now();
  base::DictValue node;
  ++index;
  if (folder) {
    base::ListValue children;
    while (index < rows.size() && Depth(rows[index]) > depth)
      children.Append(SerializeArcNode(rows, index, next_id));
    node.Set("children", std::move(children));
    node.Set("date_modified", now);
  } else {
    node.Set("url", *row.FindString("url"));
  }
  node.Set("date_added", now);
  node.Set("date_last_used", "0");
  node.Set("guid", base::Uuid::GenerateRandomV4().AsLowercaseString());
  node.Set("id", base::NumberToString(static_cast<int32_t>(next_id++)));
  node.Set("name", name);
  node.Set("type", folder ? "folder" : "url");
  return node;
}

// Original426c618 augments the COPIED Bookmarks JSON before profile creation.
// No source file is written; a merge failure only warns in original4255868.
bool MergeArcBookmarks(const base::FilePath& source_profile,
                        const base::FilePath& target_profile) {
  auto rows = ReadArcSidebarBookmarksForClone(source_profile);
  if (rows.empty())
    return true;
  const auto path = target_profile.AppendASCII("Bookmarks");
  base::DictValue document;
  if (base::PathExists(path)) {
    std::string json;
    if (!base::ReadFileToString(path, &json))
      return false;
    auto parsed = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC, 200);
    if (!parsed)
      return false;
    document = std::move(*parsed);
  } else {
    base::DictValue roots;
    roots.Set("bookmark_bar", RootFolder("Bookmarks Bar", "1",
        "0bc5d13f-2cba-5d74-951f-3f233fe6c908"));
    roots.Set("other", RootFolder("Other Bookmarks", "2",
        "82b081ec-3dd3-529c-8475-ab6c344590dd"));
    roots.Set("synced", RootFolder("Mobile Bookmarks", "3",
        "4cf2e351-0e85-532b-bb37-df045d8f8d0f"));
    document.Set("roots", std::move(roots));
    document.Set("version", 1);
  }
  auto* children = document.FindListByDottedPath("roots.bookmark_bar.children");
  auto* bar = document.FindDictByDottedPath("roots.bookmark_bar");
  if (!children || !bar)
    return false;
  uint32_t next_id = MaxBookmarkId(base::Value(document.Clone())) + 1;
  size_t index = 0;
  while (index < rows.size())
    children->Append(SerializeArcNode(rows, index, next_id));
  bar->Set("date_modified", Now());
  document.Remove("checksum");
  std::string json;
  return base::JSONWriter::Write(document, &json, 200) &&
         base::WriteFile(path, json);
}

std::optional<ChromiumClonePhoto> CopyChromePhoto(
    const base::FilePath& source_profile,
    const base::FilePath& target_profile) {
  constexpr char kDefaultName[] = "Google Profile Picture.png";
  std::string name = kDefaultName;
  std::string json;
  if (base::ReadFileToString(source_profile.DirName().AppendASCII("Local State"),
                             &json)) {
    auto state = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC, 200);
    auto* cache = state ? state->FindDictByDottedPath("profile.info_cache") : nullptr;
    auto* entry = cache ? cache->FindDict(source_profile.BaseName().value()) : nullptr;
    const auto* selected = entry ? entry->FindString("gaia_picture_file_name") : nullptr;
    if (selected && !selected->empty())
      name = *selected;
  }
  auto path = source_profile.Append(base::FilePath::FromUTF8Unsafe(name));
  if (!base::PathExists(path) && name != kDefaultName)
    path = source_profile.AppendASCII(kDefaultName);
  std::string bytes;
  if (!base::ReadFileToString(path, &bytes) || bytes.empty())
    return std::nullopt;
  if (!base::WriteFile(target_profile.AppendASCII(kDefaultName), bytes)) {
    LOG(WARNING) << "Failed to persist imported Chrome profile photo";
    return std::nullopt;
  }
  return ChromiumClonePhoto{
      "migrated-chromium-profile-photo://" + source_profile.BaseName().value(),
      std::move(bytes)};
}

}  // namespace

ChromiumCloneWorkerResult PrepareChromiumNewTarget(ChromiumCloneRequest request) {
  ChromiumCloneWorkerResult result;
  result.target_profile = request.target_profile;
  result.profile_name = request.profile_name;
  if (!base::DirectoryExists(request.source_profile))
    return result;

  std::optional<SourceKey> key;
  // Source enum2 is Atlas, NOT Chrome. Do not invent a key for its clone branch.
  if (request.source != ChromiumCloneSource::kAtlas &&
      HasEncryptedData(request.source_profile)) {
    if (!request.captured_source_password) {
      result.error = std::string("Could not access ") + SourceName(request.source) +
                     " encrypted data";
      return result;
    }
    key = DeriveSourceKey(*request.captured_source_password);
  }
  // Secret input is not retained in the worker receipt or any RPC/event.
  request.captured_source_password.reset();

  auto files = PrepareChromiumCloneFiles(
      request.source_profile, request.target_profile, SourceId(request.source),
      request.profile_name);
  if (!files.success)
    return result;
  if (request.source == ChromiumCloneSource::kArc &&
      !MergeArcBookmarks(request.source_profile, request.target_profile)) {
    LOG(WARNING) << "Failed to merge Arc pins into imported bookmarks.";
  }
  if (!InitializeChromiumCloneTrackedPreferences(request.target_profile)) {
    base::DeletePathRecursively(request.target_profile);
    return result;
  }

  result.cookies.Set("cookies", base::ListValue());
  result.passwords.Set("passwords", base::ListValue());
  if (key) {
    result.cookies = ReadEncryptedCategoryForClone(request.source_profile,
                                                  "cookies", *key);
    if (!result.cookies.FindString("error")) {
      result.passwords = ReadEncryptedCategoryForClone(request.source_profile,
                                                      "passwords", *key);
    }
    if (result.cookies.FindString("error") ||
        result.passwords.FindString("error")) {
      result.error = std::string("Could not read ") + SourceName(request.source) +
                     " cookies or passwords";
      base::DeletePathRecursively(request.target_profile);
      return result;
    }
  }
  result.extensions = std::move(files.extensions);
  if (request.source == ChromiumCloneSource::kChrome)
    result.photo = CopyChromePhoto(request.source_profile, request.target_profile);
  result.success = true;
  return result;
}

}  // namespace aux_import

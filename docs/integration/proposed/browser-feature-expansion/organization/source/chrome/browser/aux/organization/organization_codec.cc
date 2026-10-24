// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/organization/organization_codec.h"

#include <initializer_list>
#include <set>
#include <utility>

#include "base/check.h"
#include "base/strings/string_number_conversions.h"
#include "url/gurl.h"

namespace aux::organization {
namespace {
bool Keys(const base::DictValue& dict,
          std::initializer_list<std::string_view> allowed,
          std::string_view optional = {}) {
  if (dict.size() != allowed.size() + (!optional.empty() && dict.contains(optional) ? 1 : 0)) return false;
  for (const auto key : allowed) {
    if (!dict.contains(key)) return false;
  }
  return true;
}
const std::string* String(const base::DictValue& dict, std::string_view key) {
  return dict.FindString(key);
}
std::optional<uint64_t> Number(const base::DictValue& dict, std::string_view key) {
  const auto* text = String(dict, key);
  return text ? ParseCanonicalUint64(*text) : std::nullopt;
}
DecodeResult Fail(std::string error) { return {std::nullopt, std::move(error)}; }
bool Url(std::string_view value) {
  // No navigation occurs here. The real navigation owner still applies scheme,
  // file permission, routing and profile policy before opening a record.
  return !value.empty() && value.size() <= 32768 && GURL(value).is_valid();
}
}  // namespace
std::optional<uint64_t> ParseCanonicalUint64(std::string_view value) {
  if (value.empty() || (value.size() > 1 && value.front() == '0') ||
      value.size() > 20) return std::nullopt;
  for (const auto ch : value) {
    if (ch < '0' || ch > '9') return std::nullopt;
  }
  uint64_t result = 0;
  if (!base::StringToUint64(value, &result)) return std::nullopt;
  return result;
}
base::DictValue EncodeSnapshot(const Snapshot& snapshot) {
  CHECK(Validate(snapshot) == Error::kNone);
  base::DictValue value;
  value.Set("schemaVersion", static_cast<int>(snapshot.schema_version));
  value.Set("profileId", snapshot.profile_id);
  value.Set("revision", std::to_string(snapshot.revision));
  value.Set("bookmarksCollapsed", snapshot.bookmarks_collapsed);
  value.Set("pinsCollapsed", snapshot.pins_collapsed);
  base::ListValue spaces;
  for (const auto& [id, space] : snapshot.spaces) {
    base::DictValue row;
    row.Set("id", id); row.Set("name", space.name); row.Set("icon", space.icon);
    row.Set("order", std::to_string(space.order));
    spaces.Append(std::move(row));
  }
  value.Set("spaces", std::move(spaces));
  base::ListValue entries;
  for (const auto& [id, entry] : snapshot.entries) {
    base::DictValue row;
    row.Set("id", id);
    row.Set("kind", entry.kind == EntryKind::kTab ? "tab" : "folder");
    row.Set("spaceId", entry.space_id); row.Set("parentId", entry.parent_id);
    row.Set("title", entry.title); row.Set("launchUrl", entry.launch_url);
    row.Set("currentUrl", entry.current_url);
    row.Set("order", std::to_string(entry.order));
    row.Set("archived", entry.archived);
    row.Set("archiveOperationId", entry.archive_operation_id);
    row.Set("collapsed", entry.collapsed);
    row.Set("keepInSpace", entry.keep_in_space);
    entries.Append(std::move(row));
  }
  value.Set("entries", std::move(entries));
  base::ListValue replay;
  for (const auto& record : snapshot.replay) {
    base::DictValue row;
    row.Set("operationId", record.operation_id);
    row.Set("fingerprint", record.fingerprint);
    row.Set("baseRevision", std::to_string(record.base_revision));
    row.Set("revision", std::to_string(record.revision));
    replay.Append(std::move(row));
  }
  value.Set("replay", std::move(replay));
  return value;
}
DecodeResult DecodeSnapshot(const base::DictValue& value,
                            std::string_view expected_profile_id) {
  if (!Keys(value, {"schemaVersion", "profileId", "revision", "bookmarksCollapsed",
                    "pinsCollapsed", "spaces", "entries", "replay"}))
    return Fail("organization fields unknown or missing; original retained");
  if (value.FindInt("schemaVersion") != static_cast<int>(kSchemaVersion))
    return Fail("unsupported organization schema; original retained");
  const auto* profile = String(value, "profileId");
  const auto revision = Number(value, "revision");
  const auto bookmarks = value.FindBool("bookmarksCollapsed");
  const auto pins = value.FindBool("pinsCollapsed");
  const auto* spaces = value.FindList("spaces");
  const auto* entries = value.FindList("entries");
  const auto* replay = value.FindList("replay");
  if (!profile || *profile != expected_profile_id || !revision || !bookmarks ||
      !pins || !spaces || !entries || !replay || spaces->size() > kMaxSpaces ||
      entries->size() > kMaxEntries || replay->size() > kReplayLimit)
    return Fail("organization shape, capacity or profile mismatch");
  Snapshot snapshot;
  snapshot.profile_id = *profile; snapshot.revision = *revision;
  snapshot.bookmarks_collapsed = *bookmarks; snapshot.pins_collapsed = *pins;
  for (const auto& item : *spaces) {
    const auto* row = item.GetIfDict();
    if (!row || !Keys(*row, {"id", "name", "icon", "order"}))
      return Fail("unknown or invalid Space fields");
    const auto* id = String(*row, "id");
    const auto* name = String(*row, "name");
    const auto* icon = String(*row, "icon");
    const auto order = Number(*row, "order");
    if (!id || !name || !icon || !order ||
        !snapshot.spaces.emplace(*id, Space{*id, *name, *icon, *order}).second)
      return Fail("invalid or duplicate Space");
  }
  for (const auto& item : *entries) {
    const auto* row = item.GetIfDict();
    if (!row || !Keys(*row, {"id", "kind", "spaceId", "parentId", "title",
          "launchUrl", "currentUrl", "order", "archived", "archiveOperationId",
          "collapsed"}, "keepInSpace")) return Fail("unknown or invalid entry fields");
    const auto* id = String(*row, "id"); const auto* kind = String(*row, "kind");
    const auto* space = String(*row, "spaceId");
    const auto* parent = String(*row, "parentId");
    const auto* title = String(*row, "title");
    const auto* launch = String(*row, "launchUrl");
    const auto* current = String(*row, "currentUrl");
    const auto* batch = String(*row, "archiveOperationId");
    const auto order = Number(*row, "order");
    const auto archived = row->FindBool("archived");
    const auto collapsed = row->FindBool("collapsed");
    if (!id || !kind || !space || !parent || !title || !launch || !current ||
        !batch || !order || !archived || !collapsed ||
        (*kind != "tab" && *kind != "folder") ||
        (*kind == "tab" && (!Url(*launch) || !Url(*current))))
      return Fail("invalid entry");
    Entry entry;
    entry.id = *id; entry.kind = *kind == "tab" ? EntryKind::kTab : EntryKind::kFolder;
    entry.space_id = *space; entry.parent_id = *parent; entry.title = *title;
    entry.launch_url = *launch; entry.current_url = *current; entry.order = *order;
    entry.archived = *archived; entry.archive_operation_id = *batch;
    entry.collapsed = *collapsed;
    // Optional additive schema-v1 field: older snapshots mean false; malformed
    // present values refuse instead of silently stripping retention on rewrite.
    if (row->contains("keepInSpace") && !row->FindBool("keepInSpace"))
      return Fail("invalid keepInSpace");
    entry.keep_in_space = row->FindBool("keepInSpace").value_or(false);
    if (!snapshot.entries.emplace(*id, std::move(entry)).second)
      return Fail("duplicate entry ID");
  }
  for (const auto& item : *replay) {
    const auto* row = item.GetIfDict();
    if (!row || !Keys(*row, {"operationId", "fingerprint", "baseRevision", "revision"}))
      return Fail("unknown replay fields");
    const auto* operation = String(*row, "operationId");
    const auto* fingerprint = String(*row, "fingerprint");
    const auto from = Number(*row, "baseRevision");
    const auto to = Number(*row, "revision");
    if (!operation || !fingerprint || !from || !to) return Fail("invalid replay");
    snapshot.replay.push_back({*operation, *fingerprint, *from, *to});
  }
  if (Validate(snapshot) != Error::kNone) return Fail("organization invariant failed");
  return {std::move(snapshot), {}};
}
DecodeResult ImportLegacyPins(std::string profile_id,
                              const base::ListValue& legacy,
                              base::RepeatingCallback<std::string()> allocate_id) {
  if (!allocate_id || legacy.size() > kMaxEntries)
    return Fail("legacy migration unavailable or exceeds capacity");
  Snapshot snapshot;
  snapshot.profile_id = std::move(profile_id);
  Space initial{allocate_id.Run(), "Main", "", 0};
  snapshot.spaces.emplace(initial.id, initial);
  for (const auto& item : legacy) {
    const auto* row = item.GetIfDict();
    if (!row || !row->contains("url") || row->size() > 2 ||
        (row->size() == 2 && !row->contains("title")))
      return Fail("unknown legacy pin fields; original retained");
    const auto* url = String(*row, "url");
    const auto* title = String(*row, "title");
    if (!url || !Url(*url) || (row->contains("title") && !title))
      return Fail("invalid legacy pin; original retained");
    Entry entry;
    entry.id = allocate_id.Run(); entry.title = title ? *title : "";
    entry.launch_url = *url; entry.current_url = *url;
    entry.order = snapshot.entries.size();
    const auto id = entry.id;
    if (!snapshot.entries.emplace(id, std::move(entry)).second)
      return Fail("ID allocation collision; original retained");
  }
  if (Validate(snapshot) != Error::kNone) return Fail("invalid legacy projection");
  return {std::move(snapshot), {}};
}
bool CommandUrlsValid(const Command& command) {
  return (command.action != Action::kCreateTab &&
          command.action != Action::kUpdateTabUrl) || Url(command.url);
}
}  // namespace aux::organization

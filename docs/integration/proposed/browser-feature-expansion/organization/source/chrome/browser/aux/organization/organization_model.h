// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_MODEL_H_
#define CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_MODEL_H_

#include <cstdint>
#include <map>
#include <string>
#include <string_view>
#include <vector>

namespace aux::organization {
inline constexpr uint32_t kSchemaVersion = 1;
inline constexpr size_t kMaxEntries = 100000;
inline constexpr size_t kMaxSpaces = 1024;
inline constexpr size_t kMaxDepth = 128;
inline constexpr size_t kReplayLimit = 64;
inline constexpr size_t kUndoLimit = 32;
inline constexpr char kOrganizationPref[] = "aux.organization";

enum class EntryKind { kTab, kFolder };
struct Space {
  std::string id;
  std::string name;
  std::string icon;
  uint64_t order = 0;
  bool operator==(const Space&) const = default;
};
struct Entry {
  std::string id;
  EntryKind kind = EntryKind::kTab;
  // Empty space_id denotes profile-global pins, including folder descendants.
  std::string space_id;
  std::string parent_id;
  std::string title;
  std::string launch_url;
  std::string current_url;
  uint64_t order = 0;
  bool archived = false;
  std::string archive_operation_id;
  bool collapsed = false;
  bool operator==(const Entry&) const = default;
};
struct ReplayRecord {
  std::string operation_id;
  std::string fingerprint;
  uint64_t base_revision = 0;
  uint64_t revision = 0;
  bool operator==(const ReplayRecord&) const = default;
};
struct Snapshot {
  uint32_t schema_version = kSchemaVersion;
  std::string profile_id;
  uint64_t revision = 0;
  std::map<std::string, Space> spaces;
  std::map<std::string, Entry> entries;
  bool bookmarks_collapsed = false;
  bool pins_collapsed = false;
  std::vector<ReplayRecord> replay;
  bool operator==(const Snapshot&) const = default;
};
struct Context {
  std::string profile_id;
  std::string owner_generation;
  uint64_t expected_revision = 0;
  std::string operation_id;
};
// ID allocation and URL parsing are browser-owned; the model does not navigate.
// IDs are canonical UUIDs. URL fields must pass GURL validation at the native
// adapter. No command performs network I/O, closes or creates WebContents.
enum class Action {
  kCreateSpace, kRenameSpace, kMoveSpace, kRemoveEmptySpace,
  kCreateTab, kCreateFolder, kRenameEntry, kMoveEntry,
  kArchive, kRestore, kSetFolderCollapsed,
  kSetBookmarksCollapsed, kSetPinsCollapsed, kUpdateTabUrl,
};
struct Command {
  Action action = Action::kCreateSpace;
  std::string id;
  std::string space_id;
  std::string parent_id;
  std::string title;
  std::string icon;
  std::string url;
  uint64_t index = 0;
  bool value = false;
};
enum class Error {
  kNone, kReplay, kInvalid, kForeignProfile, kStaleRevision,
  kOperationConflict, kMissing, kCycle, kDepth, kCapacity,
  kProtectedPin, kNotEmpty, kOverflow, kBusy, kOwnerLost,
  kStorageRefused, kStorageFailed, kStorageUncertain, kUndoUnavailable,
};
struct Delta {
  uint64_t from_revision = 0;
  uint64_t to_revision = 0;
  std::string operation_id;
  std::vector<std::string> changed_spaces;
  std::vector<std::string> changed_entries;
  // A subscriber with another revision must request a full snapshot.
  bool sections_changed = false;
};
struct Mutation {
  Error error = Error::kInvalid;
  Snapshot snapshot;
  Delta delta;
};

bool IsCanonicalId(std::string_view id);
Error Validate(const Snapshot& snapshot);
std::string Fingerprint(const Command& command);
std::vector<std::string> OrderedChildren(const Snapshot& snapshot,
                                       std::string_view space_id,
                                       std::string_view parent_id,
                                       bool archived = false);
// Global pins are a separate projection shown in every Space of this profile.
bool IsGlobalPin(const Entry& entry);
// Close policy does not remove records. Callers must still consult all actual
// view protections before unloading; this is not authority to discard work.
enum class CloseDisposition { kUnloadView, kArchiveLogicalTab };
CloseDisposition GetCloseDisposition(const Entry& entry);
Mutation Apply(const Snapshot& current, const Context& context,
               const Command& command);
Mutation ApplyBatch(const Snapshot& current, const Context& context,
                    const std::vector<Command>& commands);
Mutation ApplyUndo(const Snapshot& current, const Snapshot& previous,
                   const Context& context, std::string_view token);
}  // namespace aux::organization
#endif

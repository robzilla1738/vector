// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/organization/organization_model.h"

#include <algorithm>
#include <limits>
#include <set>
#include <tuple>
#include <utility>

namespace aux::organization {
namespace {
bool Text(std::string_view value, size_t limit, bool empty = true) {
  return (empty || !value.empty()) && value.size() <= limit &&
         value.find('\0') == std::string_view::npos;
}
using Group = std::tuple<std::string, std::string, bool>;
Group GroupOf(const Entry& entry) {
  return {entry.space_id, entry.parent_id, entry.archived};
}
void Normalize(Snapshot& snapshot) {
  std::map<Group, std::vector<Entry*>> groups;
  for (auto& [id, entry] : snapshot.entries)
    groups[GroupOf(entry)].push_back(&entry);
  for (auto& [group, entries] : groups) {
    std::ranges::sort(entries, [](const auto* a, const auto* b) {
      return std::tie(a->order, a->id) < std::tie(b->order, b->id);
    });
    for (size_t i = 0; i < entries.size(); ++i)
      entries[i]->order = i;
  }
  std::vector<Space*> spaces;
  for (auto& [id, space] : snapshot.spaces)
    spaces.push_back(&space);
  std::ranges::sort(spaces, [](const auto* a, const auto* b) {
    return std::tie(a->order, a->id) < std::tie(b->order, b->id);
  });
  for (size_t i = 0; i < spaces.size(); ++i)
    spaces[i]->order = i;
}
std::vector<std::string> Subtree(const Snapshot& snapshot,
                               const std::string& root) {
  std::map<std::string, std::vector<std::string>> children;
  for (const auto& [id, entry] : snapshot.entries)
    children[entry.parent_id].push_back(id);
  std::vector<std::string> result{root};
  // Validate bounds/cycles before calling; no recursive C++ stack walk.
  for (size_t i = 0; i < result.size(); ++i) {
    if (auto it = children.find(result[i]); it != children.end())
      result.insert(result.end(), it->second.begin(), it->second.end());
  }
  return result;
}
Error CheckDestination(const Snapshot& snapshot, const Command& command) {
  if (!command.space_id.empty() && !snapshot.spaces.contains(command.space_id))
    return Error::kMissing;
  if (!command.parent_id.empty()) {
    auto it = snapshot.entries.find(command.parent_id);
    if (it == snapshot.entries.end())
      return Error::kMissing;
    if (it->second.kind != EntryKind::kFolder || it->second.archived ||
        it->second.space_id != command.space_id)
      return Error::kInvalid;
  }
  return Error::kNone;
}
void Place(Snapshot& snapshot, const std::string& id, uint64_t index) {
  auto& target = snapshot.entries.at(id);
  auto siblings = OrderedChildren(snapshot, target.space_id, target.parent_id,
                                  target.archived);
  std::erase(siblings, id);
  const auto position = static_cast<size_t>(
      std::min(index, static_cast<uint64_t>(siblings.size())));
  siblings.insert(siblings.begin() + position, id);
  for (size_t i = 0; i < siblings.size(); ++i)
    snapshot.entries.at(siblings[i]).order = i;
}
Delta Difference(const Snapshot& old, const Snapshot& next,
                 const std::string& operation) {
  Delta delta{old.revision, next.revision, operation, {}, {}, false};
  for (const auto& [id, space] : old.spaces) {
    auto it = next.spaces.find(id);
    if (it == next.spaces.end() || it->second != space)
      delta.changed_spaces.push_back(id);
  }
  for (const auto& [id, space] : next.spaces) {
    if (!old.spaces.contains(id))
      delta.changed_spaces.push_back(id);
  }
  for (const auto& [id, entry] : old.entries) {
    auto it = next.entries.find(id);
    if (it == next.entries.end() || it->second != entry)
      delta.changed_entries.push_back(id);
  }
  for (const auto& [id, entry] : next.entries) {
    if (!old.entries.contains(id))
      delta.changed_entries.push_back(id);
  }
  delta.sections_changed = old.bookmarks_collapsed != next.bookmarks_collapsed ||
                           old.pins_collapsed != next.pins_collapsed;
  return delta;
}
Error CheckContext(const Snapshot& current, const Context& context,
                   std::string_view fingerprint) {
  if (Validate(current) != Error::kNone ||
      !IsCanonicalId(context.operation_id) ||
      !Text(context.owner_generation, 256, false))
    return Error::kInvalid;
  if (context.profile_id != current.profile_id)
    return Error::kForeignProfile;
  for (const auto& replay : current.replay) {
    if (replay.operation_id == context.operation_id) {
      return replay.fingerprint == fingerprint &&
                     replay.base_revision == context.expected_revision
                 ? Error::kReplay : Error::kOperationConflict;
    }
  }
  if (context.expected_revision != current.revision)
    return Error::kStaleRevision;
  if (current.revision == std::numeric_limits<uint64_t>::max())
    return Error::kOverflow;
  return Error::kNone;
}
Mutation Finish(const Snapshot& current, Snapshot next, const Context& context,
                std::string fingerprint) {
  Normalize(next);
  next.revision = current.revision + 1;
  next.replay = current.replay;
  next.replay.push_back({context.operation_id, std::move(fingerprint),
                        current.revision, next.revision});
  if (next.replay.size() > kReplayLimit)
    next.replay.erase(next.replay.begin());
  const Error error = Validate(next);
  if (error != Error::kNone)
    return {error, {}, {}};
  Delta delta = Difference(current, next, context.operation_id);
  return {Error::kNone, std::move(next), std::move(delta)};
}
}  // namespace

bool IsCanonicalId(std::string_view id) {
  if (id.size() != 36)
    return false;
  bool nonzero = false;
  for (size_t i = 0; i < id.size(); ++i) {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      if (id[i] != '-') return false;
    } else {
      if (!((id[i] >= '0' && id[i] <= '9') ||
            (id[i] >= 'a' && id[i] <= 'f')))
        return false;
      nonzero |= id[i] != '0';
    }
  }
  return nonzero;
}
bool IsGlobalPin(const Entry& entry) { return entry.space_id.empty(); }
CloseDisposition GetCloseDisposition(const Entry& entry) {
  return IsGlobalPin(entry) ? CloseDisposition::kUnloadView
                            : CloseDisposition::kArchiveLogicalTab;
}
std::vector<std::string> OrderedChildren(const Snapshot& snapshot,
                                       std::string_view space_id,
                                       std::string_view parent_id,
                                       bool archived) {
  std::vector<const Entry*> entries;
  for (const auto& [id, entry] : snapshot.entries) {
    if (entry.space_id == space_id && entry.parent_id == parent_id &&
        entry.archived == archived)
      entries.push_back(&entry);
  }
  std::ranges::sort(entries, [](const auto* a, const auto* b) {
    return std::tie(a->order, a->id) < std::tie(b->order, b->id);
  });
  std::vector<std::string> result;
  for (const auto* entry : entries)
    result.push_back(entry->id);
  return result;
}
Error Validate(const Snapshot& snapshot) {
  if (snapshot.schema_version != kSchemaVersion ||
      !Text(snapshot.profile_id, 256, false) || snapshot.spaces.empty())
    return Error::kInvalid;
  if (snapshot.entries.size() > kMaxEntries ||
      snapshot.spaces.size() > kMaxSpaces || snapshot.replay.size() > kReplayLimit)
    return Error::kCapacity;
  std::set<uint64_t> space_orders;
  for (const auto& [id, space] : snapshot.spaces) {
    if (!IsCanonicalId(id) || id != space.id ||
        snapshot.entries.contains(id) || !Text(space.name, 1024, false) ||
        !Text(space.icon, 256) || space.order >= snapshot.spaces.size() ||
        !space_orders.insert(space.order).second)
      return Error::kInvalid;
  }
  std::map<Group, std::set<uint64_t>> orders;
  for (const auto& [id, entry] : snapshot.entries) {
    if (!IsCanonicalId(id) || id != entry.id || !Text(entry.title, 4096) ||
        !Text(entry.launch_url, 32768) || !Text(entry.current_url, 32768) ||
        (entry.kind != EntryKind::kTab && entry.kind != EntryKind::kFolder) ||
        (!entry.space_id.empty() && !snapshot.spaces.contains(entry.space_id)) ||
        (entry.archived ? !IsCanonicalId(entry.archive_operation_id)
                        : !entry.archive_operation_id.empty()) ||
        (entry.kind == EntryKind::kFolder &&
         (!entry.launch_url.empty() || !entry.current_url.empty())) ||
        (entry.kind == EntryKind::kTab &&
         (entry.launch_url.empty() || entry.current_url.empty() || entry.collapsed)))
      return Error::kInvalid;
    if (!orders[GroupOf(entry)].insert(entry.order).second)
      return Error::kInvalid;
    std::set<std::string> ancestors{id};
    const Entry* cursor = &entry;
    while (!cursor->parent_id.empty()) {
      if (!ancestors.insert(cursor->parent_id).second)
        return Error::kCycle;
      if (ancestors.size() > kMaxDepth)
        return Error::kDepth;
      auto parent = snapshot.entries.find(cursor->parent_id);
      if (parent == snapshot.entries.end() ||
          parent->second.kind != EntryKind::kFolder ||
          parent->second.space_id != cursor->space_id ||
          (parent->second.archived && !cursor->archived))
        return Error::kInvalid;
      cursor = &parent->second;
    }
  }
  for (const auto& [group, values] : orders) {
    if (!values.empty() && *values.rbegin() != values.size() - 1)
      return Error::kInvalid;
  }
  std::set<std::string> operations;
  uint64_t prior = 0;
  for (const auto& replay : snapshot.replay) {
    if (!IsCanonicalId(replay.operation_id) ||
        !operations.insert(replay.operation_id).second ||
        !Text(replay.fingerprint, 131072, false) ||
        replay.base_revision == std::numeric_limits<uint64_t>::max() ||
        replay.revision != replay.base_revision + 1 ||
        replay.revision > snapshot.revision || replay.revision <= prior)
      return Error::kInvalid;
    prior = replay.revision;
  }
  return Error::kNone;
}
std::string Fingerprint(const Command& command) {
  std::string result = std::to_string(static_cast<int>(command.action)) + ":";
  for (const auto* value : {&command.id, &command.space_id, &command.parent_id,
                            &command.title, &command.icon, &command.url}) {
    result += std::to_string(value->size()) + ":" + *value;
  }
  result += ":" + std::to_string(command.index) + ":" +
            (command.value ? "1" : "0");
  return result;
}
Mutation Apply(const Snapshot& current, const Context& context,
               const Command& command) {
  if (!Text(command.id, 36) || !Text(command.space_id, 36) ||
      !Text(command.parent_id, 36) || !Text(command.title, 4096) ||
      !Text(command.icon, 256) || !Text(command.url, 32768))
    return {Error::kInvalid, {}, {}};
  const std::string fingerprint = Fingerprint(command);
  if (const auto error = CheckContext(current, context, fingerprint);
      error != Error::kNone)
    return {error, {}, {}};
  if (!Text(command.title, 4096) || !Text(command.icon, 256) ||
      !Text(command.url, 32768))
    return {Error::kInvalid, {}, {}};
  Snapshot next = current;
  switch (command.action) {
    case Action::kCreateSpace: {
      if (!IsCanonicalId(command.id) || next.spaces.contains(command.id) ||
          next.entries.contains(command.id) || command.title.empty())
        return {Error::kInvalid, {}, {}};
      if (next.spaces.size() >= kMaxSpaces) return {Error::kCapacity, {}, {}};
      next.spaces.emplace(command.id, Space{command.id, command.title,
                                            command.icon, next.spaces.size()});
      break;
    }
    case Action::kRenameSpace: {
      auto it = next.spaces.find(command.id);
      if (it == next.spaces.end()) return {Error::kMissing, {}, {}};
      it->second.name = command.title;
      it->second.icon = command.icon;
      break;
    }
    case Action::kMoveSpace: {
      auto it = next.spaces.find(command.id);
      if (it == next.spaces.end()) return {Error::kMissing, {}, {}};
      const auto target = std::min(command.index,
                                  static_cast<uint64_t>(next.spaces.size() - 1));
      const auto old = it->second.order;
      for (auto& [id, space] : next.spaces) {
        if (space.order >= target && space.order < old) ++space.order;
        else if (space.order > old && space.order <= target) --space.order;
      }
      it->second.order = target;
      break;
    }
    case Action::kRemoveEmptySpace: {
      if (!next.spaces.contains(command.id)) return {Error::kMissing, {}, {}};
      if (next.spaces.size() == 1) return {Error::kNotEmpty, {}, {}};
      for (const auto& [id, entry] : next.entries) {
        if (entry.space_id == command.id) return {Error::kNotEmpty, {}, {}};
      }
      next.spaces.erase(command.id);
      break;
    }
    case Action::kCreateTab:
    case Action::kCreateFolder: {
      if (!IsCanonicalId(command.id) || next.entries.contains(command.id) ||
          next.spaces.contains(command.id)) return {Error::kInvalid, {}, {}};
      if (next.entries.size() >= kMaxEntries) return {Error::kCapacity, {}, {}};
      if (auto error = CheckDestination(next, command); error != Error::kNone)
        return {error, {}, {}};
      Entry entry;
      entry.id = command.id;
      entry.kind = command.action == Action::kCreateTab ? EntryKind::kTab
                                                       : EntryKind::kFolder;
      entry.space_id = command.space_id;
      entry.parent_id = command.parent_id;
      entry.title = command.title;
      if (entry.kind == EntryKind::kTab) {
        entry.launch_url = command.url;
        entry.current_url = command.url;
      }
      next.entries.emplace(command.id, std::move(entry));
      Place(next, command.id, command.index);
      break;
    }
    case Action::kRenameEntry:
    case Action::kMoveEntry:
    case Action::kArchive:
    case Action::kRestore:
    case Action::kSetFolderCollapsed:
    case Action::kUpdateTabUrl: {
      auto it = next.entries.find(command.id);
      if (it == next.entries.end()) return {Error::kMissing, {}, {}};
      auto& entry = it->second;
      if (command.action == Action::kRenameEntry) entry.title = command.title;
      else if (command.action == Action::kSetFolderCollapsed) {
        if (entry.kind != EntryKind::kFolder) return {Error::kInvalid, {}, {}};
        entry.collapsed = command.value;
      } else if (command.action == Action::kUpdateTabUrl) {
        if (entry.kind != EntryKind::kTab || entry.archived)
          return {Error::kInvalid, {}, {}};
        entry.current_url = command.url;
      } else if (command.action == Action::kMoveEntry) {
        if (entry.archived) return {Error::kInvalid, {}, {}};
        if (auto error = CheckDestination(next, command); error != Error::kNone)
          return {error, {}, {}};
        const auto subtree = Subtree(next, command.id);
        if (std::ranges::find(subtree, command.parent_id) != subtree.end())
          return {Error::kCycle, {}, {}};
        entry.parent_id = command.parent_id;
        for (const auto& id : subtree) next.entries.at(id).space_id = command.space_id;
        Place(next, command.id, command.index);
      } else {
        const bool archive = command.action == Action::kArchive;
        if (archive && IsGlobalPin(entry)) return {Error::kProtectedPin, {}, {}};
        if (!archive && !entry.parent_id.empty() &&
            next.entries.at(entry.parent_id).archived)
          return {Error::kInvalid, {}, {}};
        if (entry.archived == archive) return {Error::kInvalid, {}, {}};
        const std::string batch = entry.archive_operation_id;
        for (const auto& id : Subtree(next, command.id)) {
          auto& child = next.entries.at(id);
          // Restoring a folder must not revive children archived earlier.
          if ((archive && !child.archived) ||
              (!archive && child.archive_operation_id == batch)) {
            child.archived = archive;
            child.archive_operation_id = archive ? context.operation_id : "";
          }
        }
        Place(next, command.id, command.index);
      }
      break;
    }
    case Action::kSetBookmarksCollapsed:
      next.bookmarks_collapsed = command.value; break;
    case Action::kSetPinsCollapsed:
      next.pins_collapsed = command.value; break;
    default: return {Error::kInvalid, {}, {}};
  }
  return Finish(current, std::move(next), context, fingerprint);
}
Mutation ApplyUndo(const Snapshot& current, const Snapshot& previous,
                   const Context& context, std::string_view token) {
  const auto fingerprint = "undo:" + std::string(token);
  if (const auto error = CheckContext(current, context, fingerprint);
      error != Error::kNone) return {error, {}, {}};
  if (!IsCanonicalId(token) || previous.profile_id != current.profile_id ||
      Validate(previous) != Error::kNone || previous.revision >= current.revision)
    return {Error::kUndoUnavailable, {}, {}};
  return Finish(current, previous, context, fingerprint);
}
}  // namespace aux::organization

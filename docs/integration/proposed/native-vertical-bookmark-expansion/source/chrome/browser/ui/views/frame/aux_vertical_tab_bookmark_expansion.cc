// Copyright 2026 The Aux Authors
// Supplied behavior adapted to Chromium155. See the adjacent proposal evidence.
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmark_expansion.h"

#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "base/values.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/prefs/pref_service.h"

namespace aux {

void RegisterVerticalTabBookmarkExpansionPrefs(PrefRegistrySimple* registry) {
  registry->RegisterListPref(kExpandedBookmarkFolderIdsPref);
}

VerticalTabBookmarkExpansion::VerticalTabBookmarkExpansion(
    PrefService& prefs,
    RebuildCallback rebuild)
    : prefs_(prefs), rebuild_(std::move(rebuild)) {
  CHECK(prefs_->FindPreference(kExpandedBookmarkFolderIdsPref));
  ReadExpandedIds();
  registrar_.Init(&prefs_.get());
  registrar_.Add(
      kExpandedBookmarkFolderIdsPref,
      base::BindRepeating(&VerticalTabBookmarkExpansion::OnPreferenceChanged,
                          base::Unretained(this)));
}

VerticalTabBookmarkExpansion::~VerticalTabBookmarkExpansion() = default;

bool VerticalTabBookmarkExpansion::IsExpanded(int64_t id) const {
  return expanded_ids_.contains(id);
}

void VerticalTabBookmarkExpansion::ReadExpandedIds() {
  expanded_ids_.clear();
  for (const base::Value& value :
       prefs_->GetList(kExpandedBookmarkFolderIdsPref)) {
    if (!value.is_string()) {
      continue;
    }
    int64_t id = 0;
    if (base::StringToInt64(value.GetString(), &id)) {
      expanded_ids_.insert(id);
    }
  }
}

void VerticalTabBookmarkExpansion::OnPreferenceChanged() {
  const auto previous = expanded_ids_;
  ReadExpandedIds();
  if (expanded_ids_ != previous && rebuild_) {
    rebuild_.Run(false);
  }
}

void VerticalTabBookmarkExpansion::SaveExpandedIds() {
  base::ListValue values;
  for (int64_t id : expanded_ids_) {
    values.Append(base::NumberToString(id));
  }
  prefs_->SetList(kExpandedBookmarkFolderIdsPref, std::move(values));
}

bool VerticalTabBookmarkExpansion::ToggleFolder(
    const bookmarks::BookmarkNode* folder) {
  if (!folder || !folder->is_folder()) {
    return false;
  }
  if (expanded_ids_.contains(folder->id())) {
    // Descendant expansion is retained when only this folder is collapsed.
    expanded_ids_.erase(folder->id());
  } else {
    for (const auto* ancestor = folder; ancestor && ancestor->is_folder();
         ancestor = ancestor->parent()) {
      expanded_ids_.insert(ancestor->id());
    }
  }
  SaveExpandedIds();
  // SetList's synchronous pref notification sees the already updated set;
  // the original explicit folder-action rebuild is animated exactly once.
  if (rebuild_) {
    rebuild_.Run(true);
  }
  return true;
}

}  // namespace aux

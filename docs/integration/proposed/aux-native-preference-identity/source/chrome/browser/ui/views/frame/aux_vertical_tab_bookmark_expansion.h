// Copyright 2026 The Aux Authors
// Supplied behavior adapted to Chromium155. See the adjacent proposal evidence.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_TAB_BOOKMARK_EXPANSION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_TAB_BOOKMARK_EXPANSION_H_

#include <cstdint>

#include "base/containers/flat_set.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ref.h"
#include "components/prefs/pref_change_registrar.h"

class PrefRegistrySimple;
class PrefService;
namespace bookmarks {
class BookmarkNode;
}

namespace aux {

inline constexpr char kExpandedBookmarkFolderIdsPref[] =
    "aux.vertical_tabs.expanded_bookmark_folder_ids";
void RegisterVerticalTabBookmarkExpansionPrefs(PrefRegistrySimple* registry);

// The actual per-profile folder expansion state used by
// VerticalTabBookmarksView. The owning View handles its source coalesced
// rebuild/animation policy.
class VerticalTabBookmarkExpansion {
 public:
  using RebuildCallback = base::RepeatingCallback<void(bool animate)>;
  VerticalTabBookmarkExpansion(PrefService& prefs, RebuildCallback rebuild);
  ~VerticalTabBookmarkExpansion();

  VerticalTabBookmarkExpansion(const VerticalTabBookmarkExpansion&) = delete;
  VerticalTabBookmarkExpansion& operator=(const VerticalTabBookmarkExpansion&) =
      delete;

  const base::flat_set<int64_t>& expanded_ids() const { return expanded_ids_; }
  bool IsExpanded(int64_t id) const;
  // Only the source folder branch. URL activation is owned by the real View.
  bool ToggleFolder(const bookmarks::BookmarkNode* folder);

 private:
  void ReadExpandedIds();
  void OnPreferenceChanged();
  void SaveExpandedIds();

  const raw_ref<PrefService> prefs_;
  const RebuildCallback rebuild_;
  base::flat_set<int64_t> expanded_ids_;
  PrefChangeRegistrar registrar_;
};

}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_TAB_BOOKMARK_EXPANSION_H_

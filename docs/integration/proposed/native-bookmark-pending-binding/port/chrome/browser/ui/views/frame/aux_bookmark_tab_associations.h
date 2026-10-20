// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_TAB_ASSOCIATIONS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_TAB_ASSOCIATIONS_H_

#include <cstdint>
#include <map>
#include <set>

#include "base/memory/raw_ref.h"
#include "chrome/browser/ui/tabs/aux_bookmark_tab_representation.h"
#include "components/tabs/public/tab_interface.h"

class BrowserWindowInterface;
namespace bookmarks {
class BookmarkModel;
}

namespace aux {

class VerticalTabBookmarksView;

// The original region's f98 cache. Keys are genuine TabInterface handles;
// association never depends on a tab URL, title or native extension tab ID.
// This owner is retired/recreated with the region's real browser/profile owner.
class BookmarkTabAssociations {
 public:
  explicit BookmarkTabAssociations(BrowserWindowInterface& browser);
  ~BookmarkTabAssociations();

  // 4645e90: an existing cached association takes precedence over userdata.
  void Import(tabs::TabInterface* tab);
  // Original4646654 consumes only a real queued navigation and updates all
  // three association stores before clearing the genuine source fb0 handle.
  bool BindPendingNavigation(tabs::TabInterface* tab,
                             VerticalTabBookmarksView& bookmarks,
                             std::set<tabs::TabHandle>& handles_fb0);
  // 4646f58: invalidate only after the real BookmarkModel is loaded and the
  // source's transaction suppression flag is false. No synthetic model state.
  void Reconcile(tabs::TabInterface* tab,
                 const bookmarks::BookmarkModel* bookmark_model,
                 bool suppress_missing_node_invalidation);

  // Genuine task binding retires only an existing cached bookmark binding.
  // Clear userdata and persist the original session tombstones as well.
  void RemoveForTab(tabs::TabInterface* tab);

  const std::map<tabs::TabHandle, BookmarkTabRepresentation>& entries() const {
    return associations_;
  }

 private:
  void Persist(tabs::TabInterface& tab,
               const BookmarkTabRepresentation& representation);
  void PersistClear(tabs::TabInterface& tab);

  raw_ref<BrowserWindowInterface> browser_;
  std::map<tabs::TabHandle, BookmarkTabRepresentation> associations_;
};

}  // namespace aux
#endif

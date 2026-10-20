// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORDINARY_TAB_PROJECTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORDINARY_TAB_PROJECTION_H_
#include "base/functional/callback.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
class BrowserWindowInterface;
class Profile;
class TabCollectionNode;
class TabHoverCardController;
class VerticalPinnedTabEntriesView;
namespace tabs { class TabInterface; }
namespace aux {
class AuxChatsController;
class BookmarkTabAssociations;
// Original4642670 collection projection, separate from task/tab ownership.
// The actual AgentSessionTabsView supplies its genuine readonly predicate.
class AuxOrdinaryTabProjection final {
 public:
  using AgentRepresents = base::RepeatingCallback<bool(const tabs::TabInterface&)>;
  AuxOrdinaryTabProjection(BrowserWindowInterface&, AuxChatsController&,
      BookmarkTabAssociations&, VerticalPinnedTabEntriesView&,
      TabHoverCardController&, AgentRepresents);
  ~AuxOrdinaryTabProjection();
  // Reconcile actual Chats/Bookmarks associations first. Supply the actual
  // TabStripView.collection_node(), never a copied or test-only model.
  // Returns whether any genuine View visibility changed.
  bool Update(TabCollectionNode&);
  void Retire();
 private:
  bool ScopeCurrent() const;
  bool UpdateNode(TabCollectionNode&, bool& changed);
  bool Eligible(const tabs::TabInterface&);
  bool BookmarkRepresents(const tabs::TabInterface&) const;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ref<AuxChatsController> chats_;
  raw_ref<BookmarkTabAssociations> bookmarks_;
  raw_ref<VerticalPinnedTabEntriesView> pins_;
  raw_ref<TabHoverCardController> hover_;
  AgentRepresents agent_represents_;
  bool retired_ = false;
  base::WeakPtrFactory<AuxOrdinaryTabProjection> weak_{this};
};
}  // namespace aux
#endif

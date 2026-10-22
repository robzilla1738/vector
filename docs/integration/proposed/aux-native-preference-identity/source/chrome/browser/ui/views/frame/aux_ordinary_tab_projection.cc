// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_ordinary_tab_projection.h"
#include <utility>
#include <variant>
#include "base/check.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/aux_chat_tab_owner.h"
#include "chrome/browser/ui/tabs/tab_group_features.h"
#include "chrome/browser/ui/tabs/tab_group_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_associations.h"
#include "chrome/browser/ui/views/frame/aux_chats_controller.h"
#include "chrome/browser/ui/views/tabs/common/tab_collection_node.h"
#include "chrome/browser/ui/views/tabs/hovercard/tab_hover_card_controller.h"
#include "chrome/browser/ui/views/tabs/tab_slot_controller.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "components/prefs/pref_service.h"
#include "components/tabs/public/tab_collection.h"
#include "components/tabs/public/tab_group.h"
#include "components/tabs/public/tab_group_tab_collection.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/views/view.h"
namespace aux {
namespace {
bool AgentGroup(const TabCollectionNode& node) {
  if (node.type() != TabCollectionNode::Type::GROUP) return false;
  const auto* collection = std::get<tabs::ConstDanglingUntriagedTabCollection>(
      node.GetNodeData()).get();
  CHECK(collection);
  const auto* group = static_cast<const tabs::TabGroupTabCollection*>(collection)
      ->GetTabGroup();
  const auto* features = group ? group->GetTabGroupFeatures() : nullptr;
  return features && features->is_agent_group();
}
}  // namespace
AuxOrdinaryTabProjection::AuxOrdinaryTabProjection(BrowserWindowInterface& browser,
    AuxChatsController& chats, BookmarkTabAssociations& bookmarks,
    VerticalPinnedTabEntriesView& pins, TabHoverCardController& hover,
    AgentRepresents agent_represents)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()->GetWeakPtr()),
      chats_(chats), bookmarks_(bookmarks), pins_(pins), hover_(hover),
      agent_represents_(std::move(agent_represents)) {
  CHECK(agent_represents_);
}
AuxOrdinaryTabProjection::~AuxOrdinaryTabProjection() { Retire(); }
bool AuxOrdinaryTabProjection::ScopeCurrent() const {
  return !retired_ && browser_ && profile_ &&
      browser_->GetProfile() == profile_.get() && browser_->GetTabStripModel();
}
void AuxOrdinaryTabProjection::Retire() {
  retired_ = true;
  weak_.InvalidateWeakPtrs();
}
bool AuxOrdinaryTabProjection::BookmarkRepresents(const tabs::TabInterface& tab) const {
  // Original4642084 is bookmark representation eligibility only; not a
  // generic visibility predicate or URL-derived association.
  auto* prefs = profile_->GetPrefs();
  constexpr char kEnabled[] = "aux.vertical_tabs.bookmarks_section_enabled";
  if (prefs && prefs->FindPreference(kEnabled) && !prefs->GetBoolean(kEnabled))
    return false;
  const auto handle = tab.GetHandle();
  const auto& tasks = chats_->tabs();
  if (tab.IsPinned() || tab.GetSplit() || tasks.split_handles().contains(handle))
    return false;
  const auto association = tasks.Association(handle);
  if (!association && tasks.represented_new_chat() == handle) return false;
  return !association && bookmarks_->entries().contains(handle);
}
bool AuxOrdinaryTabProjection::Eligible(const tabs::TabInterface& tab) {
  const auto handle = tab.GetHandle();
  auto& tasks = chats_->tabs();
  if (pins_->RepresentsTab(tab)) return false;
  if (!tasks.Association(handle) && tasks.represented_new_chat() == handle)
    return false;
  if (BookmarkRepresents(tab)) return false;
  if (!tab.IsPinned() && !tab.GetSplit() && chats_->agent_installed() &&
      !tasks.split_handles().contains(handle) &&
      !tasks.ordinary_chat_tab_handles().contains(handle) && tasks.Association(handle))
    return false;
  // Actual5d0 helper4626ac0 is last; do not infer membership from URL/title.
  return !agent_represents_.Run(tab);
}
bool AuxOrdinaryTabProjection::Update(TabCollectionNode& root) {
  if (!ScopeCurrent()) return false;
  bool changed = false;
  UpdateNode(root, changed);
  return changed;
}
bool AuxOrdinaryTabProjection::UpdateNode(TabCollectionNode& node, bool& changed) {
  if (!ScopeCurrent()) return false;
  auto weak = weak_.GetWeakPtr();
  bool eligible = false;
  bool visible = false;
  if (node.type() == TabCollectionNode::Type::TAB) {
    const auto* tab = std::get<tabs::ConstDanglingUntriagedTabInterface>(
        node.GetNodeData()).get();
    CHECK(tab);
    eligible = Eligible(*tab);
    if (!weak || !ScopeCurrent()) return false;
    visible = eligible;
    // Original4642860..2b14: active tab and the active split's sibling bypass
    // collapse only; they do not bypass an actual section exclusion.
    auto* model = browser_->GetTabStripModel();
    const auto* active = model->GetActiveTab();
    const bool active_split = active && tab->GetSplit() &&
        active->GetSplit() == tab->GetSplit();
    if (visible && tab != active && !active_split && tab->GetGroup()) {
      const auto* groups = model->group_model();
      const auto* group = groups ? groups->GetTabGroup(*tab->GetGroup()) : nullptr;
      CHECK(group && group->visual_data());
      visible = !group->visual_data()->is_collapsed();
    }
  } else {
    for (const auto& child : node.children()) {
      const bool child_eligible = UpdateNode(*child, changed);
      if (!weak || !ScopeCurrent()) return false;
      eligible |= child_eligible;
    }
    // Only Group and Split container Views are changed. Parent strip/pinned/
    // unpinned containers retain their genuine native layout/lifecycle.
    if (node.type() != TabCollectionNode::Type::GROUP &&
        node.type() != TabCollectionNode::Type::SPLIT) return eligible;
    eligible = eligible && !AgentGroup(node);
    visible = eligible;
  }
  auto* view = node.view();
  if (!view || view->GetVisible() == visible) return eligible;
  if (!visible && node.type() == TabCollectionNode::Type::TAB) {
    hover_->UpdateHoverCard(nullptr, TabSlotController::kTabRemoved);
    if (!weak || !ScopeCurrent()) return false;
  }
  view->SetVisible(visible);
  changed = true;
  return eligible;
}
}  // namespace aux

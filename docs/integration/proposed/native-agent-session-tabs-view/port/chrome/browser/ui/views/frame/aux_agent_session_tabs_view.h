// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_SESSION_TABS_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_SESSION_TABS_VIEW_H_
#include <memory>
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/views/view.h"
class BrowserWindowInterface;
class TabStripModel;
class TabHoverCardController;
namespace tabs { class TabInterface; }
namespace aux {
class AgentSessionTabsSource;
class AgentSessionGroupView;
// Genuine original region5d0. Must be parented by the actual unpinned container
// beneath TabStripView before Refresh can create real collection-node rows.
class AgentSessionTabsView final : public views::View {
  METADATA_HEADER(AgentSessionTabsView, views::View)
 public:
  AgentSessionTabsView(BrowserWindowInterface&, TabStripModel&,
                       TabHoverCardController&, base::RepeatingClosure changed);
  ~AgentSessionTabsView() override;
  bool RepresentsTab(const tabs::TabInterface&) const;
  void ActiveTabChanged(const tabs::TabInterface*);
  void Retire();
  void Refresh();
  void SetExternalVisibility(bool visible);
  gfx::Size CalculatePreferredSize(const views::SizeBounds&) const override;
  void Layout(PassKey) override;
  void AddedToWidget() override;
 private:
  void QueueRefresh();
  void ToggleCollapsed();
  void LayoutChanged();
  const raw_ref<TabHoverCardController> hover_;
  base::RepeatingClosure changed_;
  std::unique_ptr<AgentSessionTabsSource> source_;
  raw_ptr<AgentSessionGroupView> group_ = nullptr;
  bool collapsed_ = false;
  bool external_visibility_ = true;
  bool refresh_pending_ = false;
  bool retired_ = false;
  base::WeakPtrFactory<AgentSessionTabsView> weak_{this};
};
}  // namespace aux
#endif

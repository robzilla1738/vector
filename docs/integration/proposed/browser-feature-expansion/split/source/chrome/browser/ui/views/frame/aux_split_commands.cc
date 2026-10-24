// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_split_commands.h"
#include <algorithm>
#include "chrome/browser/actor/ui/actor_ui_tab_controller.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/sessions/session_service.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_exclusion.h"
#include "components/tabs/public/split_tab_data.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/web_contents.h"

namespace aux {
namespace {
bool Eligible(BrowserWindowInterface& browser, tabs::TabInterface* tab) {
  auto* model = browser.GetTabStripModel();
  if (!tab || !model || model->closing_all() || model->GetIndexOfTab(tab) < 0 ||
      browser.GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      IsBookmarkTabExcluded(tab, model)) return false;
  auto* page = tab->GetContents();
  if (!page || page->GetBrowserContext() != browser.GetProfile() ||
      page->IsBeingCaptured()) return false;
  const auto* identity = PageIdentity::FromWebContents(page);
  if (identity && identity->runtime_owned()) return false;
  auto* actor_controller = actor::ui::ActorUiTabController::Get(tab->GetUnownedUserDataHost());
  if (actor_controller && !actor_controller->IsColdForAuxProfileSwitch()) return false;
  return !content::DevToolsAgentHost::HasFor(page) ||
         !content::DevToolsAgentHost::GetOrCreateFor(page)->IsAttached();
}
void Persist(BrowserWindowInterface& browser, tabs::TabInterface* tab) {
  if (!tab || !tab->GetSplit()) return;
  if (auto* service = SessionServiceFactory::GetForProfile(browser.GetProfile())) {
    const auto split = *tab->GetSplit();
    service->SetSplitTabData(browser.GetSessionID(), split,
        browser.GetTabStripModel()->GetSplitData(split)->visual_data());
  }
}
}  // namespace

bool CanJoinNativeSplit(BrowserWindowInterface& browser,
                        tabs::TabInterface* target, tabs::TabInterface* source) {
  if (target == source || !Eligible(browser, target) || !Eligible(browser, source) ||
      source->IsSplit() || target->IsPinned() != source->IsPinned() ||
      target->GetGroup() != source->GetGroup()) return false;
  if (!target->GetSplit()) return true;
  const auto members = browser.GetTabStripModel()->GetSplitData(*target->GetSplit())->ListTabs();
  return members.size() < split_tabs::SplitPaneTree::kMaxPanes &&
      std::ranges::all_of(members, [&](auto* member) { return Eligible(browser, member); });
}

bool JoinNativeSplit(BrowserWindowInterface& browser,
                     tabs::TabInterface* target, tabs::TabInterface* source,
                     split_tabs::SplitPaneTree::Axis axis, bool before) {
  if (!CanJoinNativeSplit(browser, target, source)) return false;
  auto* model = browser.GetTabStripModel();
  const bool joined = model->JoinTabToSplit(model->GetIndexOfTab(target),
      model->GetIndexOfTab(source), axis, before);
  if (joined) Persist(browser, target);
  return joined;
}

bool CycleNativeSplitPane(BrowserWindowInterface& browser, int direction) {
  auto* model = browser.GetTabStripModel();
  auto* active = model ? model->GetActiveTab() : nullptr;
  if (!active || !active->GetSplit() || !direction) return false;
  const auto members = model->GetSplitData(*active->GetSplit())->ListTabs();
  const auto current = std::ranges::find(members, active);
  if (current == members.end()) return false;
  const int count = static_cast<int>(members.size());
  const int next = (static_cast<int>(std::distance(members.begin(), current)) +
                    (direction > 0 ? 1 : count - 1)) % count;
  model->ActivateTabAt(model->GetIndexOfTab(members[next]));
  return true;
}

bool SetNativeSplitOrientation(BrowserWindowInterface& browser,
                               split_tabs::SplitPaneTree::Axis axis) {
  auto* model = browser.GetTabStripModel();
  auto* active = model ? model->GetActiveTab() : nullptr;
  if (!active || !active->GetSplit()) return false;
  model->UpdateSplitLayout(*active->GetSplit(),
      axis == split_tabs::SplitPaneTree::Axis::kHorizontal
          ? split_tabs::SplitTabLayout::kSideBySide : split_tabs::SplitTabLayout::kStacked);
  Persist(browser, active);
  return true;
}
}  // namespace aux

#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/tabs/pinned_tab_service.h"

#include <algorithm>
#include <utility>
#include <vector>

#include "base/functional/bind.h"
#include "chrome/browser/lifetime/application_lifetime_desktop.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/tabs/pinned_tab_codec.h"
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
#include "base/auto_reset.h"
#include "base/check.h"
#include <limits>
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/organization/organization_service.h"
#include "chrome/browser/ui/tabs/aux_organization_pin_adapter.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/sessions/session_restore.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include "components/sessions/content/session_tab_helper.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/web_contents.h"
#endif
#include "chrome/browser/ui/tabs/tab_strip_model.h"

PinnedTabService::PinnedTabService(Profile* profile) : profile_(profile) {
  closing_all_browsers_subscription_ = chrome::AddClosingAllBrowsersCallback(
      base::BindRepeating(&PinnedTabService::OnClosingAllBrowsersChanged,
                          base::Unretained(this)));

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  pinned_pref_changes_.Init(profile_->GetPrefs());
  pinned_pref_changes_.Add(
      aux::kPinnedTabEntriesPref,
      base::BindRepeating(&PinnedTabService::SchedulePinnedTabsReconciliation,
                          weak_factory_.GetWeakPtr()));
  if (auto* organization = aux::organization::OrganizationProfileServiceFactory::GetForProfile(profile_)) {
    organization_ready_ = organization->ObserveReady(base::BindRepeating(
        &PinnedTabService::BindOrganization, weak_factory_.GetWeakPtr()));
  }
  BindOrganization();
  session_restored_subscription_ =
      SessionRestore::RegisterOnSessionRestoredCallback(base::BindRepeating(
          &PinnedTabService::OnSessionRestored, weak_factory_.GetWeakPtr()));
#endif

  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [this](BrowserWindowInterface* browser) {
        OnBrowserCreated(browser);
        return true;
      });

  browser_collection_observation_.Observe(
      GlobalBrowserCollection::GetInstance());
}

PinnedTabService::~PinnedTabService() {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  TabStripModelObserver::StopObservingAll(this);
#endif
}

void PinnedTabService::OnClosingAllBrowsersChanged(bool closing) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  // 155 global-close signal is used only as an event guard. Saved entries
  // follow explicit pin/unpin mutations; closing live tabs does not erase them.
  closing_all_browsers_ = closing;
#else
  // Saving of tabs happens when the user exits the application or closes the
  // last browser window. After saving, `need_to_write_pinned_tabs_` is set to
  // false to make sure subsequent window closures don't overwrite the pinned
  // tab state. Saving is re-enabled when a browser window or tab is opened
  // again. Note, cancelling a shutdown (via onbeforeunload) will not re-enable
  // pinned tab saving immediately, to prevent the following situation:
  //   * two windows are open, one with pinned tabs
  //   * user exits
  //   * pinned tabs are saved
  //   * window with pinned tabs is closed
  //   * other window blocks close with onbeforeunload
  //   * user saves work, etc. then closes the window
  //   * pinned tabs are saved, without the window with the pinned tabs,
  //     over-writing the correct state.
  // Saving is re-enabled if a new tab or window is opened.
  if (closing && TabStripModelObserver::IsObservingAny(this)) {
    WritePinnedTabsIfNecessary();
  }
#endif
}

void PinnedTabService::OnBrowserCreated(BrowserWindowInterface* browser) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  ObserveBrowserIfOwned(browser);
#else
  if (browser->GetProfile() != profile_ ||
      browser->GetType() != BrowserWindowInterface::TYPE_NORMAL) {
    return;
  }

  need_to_write_pinned_tabs_ = true;
  // TODO(crbug.com/452120900): TabStripModel auto-unregistered by dtor
  browser->GetTabStripModel()->AddObserver(this);
#endif
}

void PinnedTabService::OnBrowserClosed(BrowserWindowInterface* browser) {
  if (browser->GetProfile() != profile_ ||
      browser->GetType() != BrowserWindowInterface::TYPE_NORMAL) {
    return;
  }

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (!profile_switch_pauses_.empty())
    return;
#endif
  browser->GetTabStripModel()->RemoveObserver(this);

#if !BUILDFLAG(ENABLE_AUX_BROWSER) || !BUILDFLAG(IS_MAC)
  // This happens when user closes each tab manually via the close button. In
  // this case WillCloseAllTabs() with closing_all() is not called. This causes
  // pinned tabs to reopen on the next startup. So we should call
  // WritePinnedTabsIfNecessary() to clear the data. See crbug.com/543307904.
  if (!TabStripModelObserver::IsObservingAny(this)) {
    WritePinnedTabsIfNecessary();
  }
#endif
}

void PinnedTabService::OnTabStripModelChanged(
    TabStripModel* tab_strip_model,
    const TabStripModelChange& change,
    const TabStripSelectionChange& selection) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (!profile_switch_pauses_.empty())
    return;
  if (change.type() == TabStripModelChange::kInserted) {
    for (const auto& inserted : change.GetInsert()->contents)
      CachePinnedEntryIdentity(inserted.tab);
  } else if (change.type() == TabStripModelChange::kRemoved) {
    for (const auto& removed : change.GetRemove()->contents) {
      if (removed.tab) {
        const auto handle = removed.tab->GetHandle();
        pinned_entry_urls_.erase(handle);
        organization_entry_ids_.erase(handle);
        organization_requests_.erase(handle);
      }
    }
  } else if (change.type() == TabStripModelChange::kReplaced) {
    CachePinnedEntryIdentity(change.GetReplace()->tab);
  }
  if ((change.type() == TabStripModelChange::kInserted ||
       change.type() == TabStripModelChange::kReplaced) &&
      !SessionRestore::IsRestoring(profile_))
    ReconcilePinnedEntries(tab_strip_model);
#else
  if (change.type() == TabStripModelChange::kInserted) {
    need_to_write_pinned_tabs_ = true;
  }
#endif
}

void PinnedTabService::OnTabPinnedStateChanged(tabs::TabInterface* tab,
                                               int index) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (!tab || organization_observer_change_ || closing_all_browsers_ ||
      !profile_switch_pauses_.empty() || !tab->GetContents() ||
      tab->GetContents()->GetBrowserContext() != profile_) return;
  if (organization_request_generation_ == std::numeric_limits<uint64_t>::max()) return;
  const uint64_t generation = ++organization_request_generation_;
  organization_requests_[tab->GetHandle()] = generation;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&PinnedTabService::ApplyOrganizationPinChange,
          weak_factory_.GetWeakPtr(), tab->GetHandle(), generation, tab->IsPinned()));
#else
  need_to_write_pinned_tabs_ = true;
#endif
}

void PinnedTabService::WillCloseAllTabs(TabStripModel* tab_strip_model) {
#if !BUILDFLAG(ENABLE_AUX_BROWSER) || !BUILDFLAG(IS_MAC)
  if (tab_strip_model->closing_all() &&
      TabStripModelObserver::CountObservedModels(this) == 1) {
    WritePinnedTabsIfNecessary();
  }
#endif
}

#if !BUILDFLAG(ENABLE_AUX_BROWSER) || !BUILDFLAG(IS_MAC)
void PinnedTabService::WritePinnedTabsIfNecessary() {
  if (need_to_write_pinned_tabs_) {
    PinnedTabCodec::WritePinnedTabs(profile_);
  }
  need_to_write_pinned_tabs_ = false;
}

#endif

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
void PinnedTabService::BindOrganization() {
  organization_changes_ = {};
  auto* owner = aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile_);
  if (!owner || !owner->model()) return;
  organization_changes_ = owner->model()->Observe(base::BindRepeating(
      [](base::WeakPtr<PinnedTabService> service, const aux::organization::Delta&) {
        if (service) service->SchedulePinnedTabsReconciliation();
      }, weak_factory_.GetWeakPtr()));
  ReconcileAfterSessionRestore();
}
void PinnedTabService::ApplyOrganizationPinChange(tabs::TabHandle handle,
                                                  uint64_t generation, bool pinned) {
  auto* tab = handle.Get();
  if (!tab || closing_all_browsers_ || !profile_switch_pauses_.empty() ||
      (!organization_requests_.contains(handle) || organization_requests_.at(handle) != generation) || tab->IsPinned() != pinned ||
      !tab->GetContents() || tab->GetContents()->GetBrowserContext() != profile_) return;
  auto* contents = tab->GetContents();
  auto* owner = aux::organization::OrganizationProfileServiceFactory::GetForProfile(profile_);
  auto* organization = owner ? owner->model() : nullptr;
  const auto id = aux::GetRememberedPinnedTabEntryId(*contents).value_or("");
  if (organization && !id.empty()) {
    auto found = organization->snapshot().entries.find(id);
    if (found != organization->snapshot().entries.end() &&
        aux::organization::IsGlobalPin(found->second) == pinned) {
      UpdatePinnedEntrySessionData(tab, GURL(found->second.launch_url));
      organization_requests_.erase(handle);
      return;
    }
  }
  auto done = base::BindOnce([](base::WeakPtr<PinnedTabService> service,
      tabs::TabHandle handle, uint64_t generation, bool wanted,
      bool success, std::string id) {
    if (!service) return;
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce([](base::WeakPtr<PinnedTabService> service,
            tabs::TabHandle handle, uint64_t generation, bool wanted,
            bool success, std::string id) {
          auto* tab = handle.Get();
          if (!service || !tab || !tab->GetContents() ||
              tab->GetContents()->GetBrowserContext() != service->profile_ ||
              (!service->organization_requests_.contains(handle) || service->organization_requests_.at(handle) != generation)) return;
          service->organization_requests_.erase(handle);
          if (success && !id.empty()) {
            aux::RememberPinnedTabEntryId(*tab->GetContents(), id);
            auto* owner = aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(service->profile_);
            auto* model = owner ? owner->model() : nullptr;
            if (model) {
              auto record = model->snapshot().entries.find(id);
              if (record != model->snapshot().entries.end()) {
                const GURL launch_url(record->second.launch_url);
                aux::RememberPinnedTabEntryUrl(*tab->GetContents(), launch_url);
                service->UpdatePinnedEntrySessionData(tab, launch_url);
              }
            }
          } else if (!success && tab->IsPinned() == wanted) {
            auto* browser = tab->GetBrowserWindowInterface();
            if (!browser || browser->GetProfile() != service->profile_) return;
            auto* model = browser->GetTabStripModel();
            const int index = model->GetIndexOfTab(tab);
            if (index != TabStripModel::kNoTab) {
              base::AutoReset<bool> changing(&service->organization_observer_change_, true);
              model->SetTabPinned(index, !wanted);
            }
          }
        }, service, handle, generation, wanted, success, std::move(id)));
  }, weak_factory_.GetWeakPtr(), handle, generation, pinned);
  if (!organization) { std::move(done).Run(false, {}); return; }
  if (pinned) {
    aux::CommitOrganizationPin(*profile_, contents->GetVisibleURL(), contents->GetTitle(),
        std::numeric_limits<size_t>::max(), id, std::move(done), true);
  } else if (!id.empty()) {
    auto* window = aux::AuxOrganizationWindowController::FromBrowser(tab->GetBrowserWindowInterface());
    if (!window) { std::move(done).Run(false, {}); return; }
    aux::UnpinOrganizationEntry(*profile_, id, window->ActiveSpaceId(), base::BindOnce(
        [](aux::PinCommitReply done, std::string id, bool success) {
          std::move(done).Run(success, std::move(id));
        }, std::move(done), id));
  } else std::move(done).Run(false, {});
}
void PinnedTabService::OnTabChangedAt(tabs::TabInterface* tab,
                                      TabChangeType type) {
  if (!tab || !profile_switch_pauses_.empty() ||
      type == TabChangeType::kAttentionOnly ||
      type == TabChangeType::kBlockedOnly)
    return;
  CachePinnedEntryIdentity(tab);
  if (type != TabChangeType::kAll || !tab->IsPinned())
    return;
  auto* contents = tab->GetContents();
  if (!contents || contents->GetBrowserContext() != profile_)
    return;
  if (auto url = aux::GetRememberedPinnedTabEntryUrl(*contents);
      url && url->is_valid()) {
    UpdatePinnedEntrySessionData(tab, *url);
  } else if (auto* browser = tab->GetBrowserWindowInterface();
             browser && browser->GetProfile() == profile_ &&
             !SessionRestore::IsRestoring(profile_)) {
    ReconcilePinnedEntries(browser->GetTabStripModel());
  }
}
void PinnedTabService::OnSessionRestored(Profile* profile, int) {
  if (profile != profile_)
    return;
  restore_reconciliation_pending_ = true;
  ReconcileAfterSessionRestore();
}
void PinnedTabService::ReconcileAfterSessionRestore() {
  if (!profile_switch_pauses_.empty())
    return;
  restore_reconciliation_pending_ = false;
  // Completion is emitted before the restorer leaves the active registry.
  // Original041d5f78 reconciles directly; do not recheck IsRestoring here.
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [this](BrowserWindowInterface* browser) {
        if (browser->GetProfile() == profile_ &&
            browser->GetType() == BrowserWindowInterface::TYPE_NORMAL)
          ReconcilePinnedEntries(browser->GetTabStripModel());
        return true;
      });
}
void PinnedTabService::SchedulePinnedTabsReconciliation() {
  if (reconciliation_pending_)
    return;
  reconciliation_pending_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE,
      base::BindOnce(&PinnedTabService::ReconcileRemovedPinnedEntries,
                     weak_factory_.GetWeakPtr()));
}
void PinnedTabService::ReconcileRemovedPinnedEntries() {
  reconciliation_pending_ = false;
  if (!profile_switch_pauses_.empty())
    return;
  const auto projected = aux::ReadOrganizationPinnedEntries(*profile_, true);
  const auto entries = projected ? *projected : aux::ReadPinnedTabEntries(*profile_->GetPrefs());
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [this, &entries](BrowserWindowInterface* browser) {
        if (browser->GetProfile() != profile_ ||
            browser->GetType() != BrowserWindowInterface::TYPE_NORMAL)
          return true;
        auto* model = browser->GetTabStripModel();
        std::vector<int> removed;
        for (int i = 0; i < model->count(); ++i) {
          auto* tab = model->GetTabAtIndex(i);
          auto* contents = tab->GetContents();
          if (!tab->IsPinned() || !contents || organization_requests_.contains(tab->GetHandle()) ||
              contents->GetBrowserContext() != profile_)
            continue;
          const auto url = aux::GetRememberedPinnedTabEntryUrl(*contents);
          const auto logical_id = aux::GetRememberedPinnedTabEntryId(*contents);
          if ((logical_id || (url && url->is_valid())) &&
              std::ranges::none_of(entries, [&url, &logical_id](const auto& entry) {
                return !entry.logical_id.empty() ? logical_id == entry.logical_id
                                                : url && entry.url == *url;
              }))
            removed.push_back(i);
        }
        if (!removed.empty()) {
          CHECK_CURRENTLY_ON(content::BrowserThread::UI);
          CHECK(!model->reentrancy_guard_);
          base::AutoReset<bool> changing(&model->reentrancy_guard_, true);
          model->SetTabsPinned(std::move(removed), false);
        }
        return true;
      });
}
void PinnedTabService::ReconcilePinnedEntries(TabStripModel* model) {
  if (!model || !profile_switch_pauses_.empty())
    return;
  const auto projected = aux::ReadOrganizationPinnedEntries(*profile_, true);
  const auto saved = projected ? *projected : aux::ReadPinnedTabEntries(*profile_->GetPrefs());
  if (projected) {
    std::set<std::string> used;
    for (auto* tab : *model) {
      if (tab->GetContents()) {
        if (auto id = aux::GetRememberedPinnedTabEntryId(*tab->GetContents())) used.insert(*id);
      }
    }
    for (auto* tab : *model) {
      auto* contents = tab->GetContents();
      if (!tab->IsPinned() || !contents || contents->GetBrowserContext() != profile_ ||
          aux::GetRememberedPinnedTabEntryId(*contents) || organization_requests_.contains(tab->GetHandle())) continue;
      const auto original = aux::GetRememberedPinnedTabEntryUrl(*contents).value_or(contents->GetVisibleURL());
      for (const auto& entry : saved) {
        if (entry.url == original && !used.contains(entry.logical_id)) {
          aux::RememberPinnedTabEntryId(*contents, entry.logical_id);
          used.insert(entry.logical_id);
          UpdatePinnedEntrySessionData(tab, entry.url);
          break;
        }
      }
    }
    return;
  }
  if (saved.empty())
    return;
  std::vector<GURL> remembered;
  std::vector<aux::PinnedTabEntryCandidate> candidates;
  std::vector<tabs::TabHandle> handles;
  for (auto* tab : *model) {
    auto* contents = tab->GetContents();
    if (!tab->IsPinned() || !contents ||
        contents->GetBrowserContext() != profile_)
      continue;
    if (auto url = aux::GetRememberedPinnedTabEntryUrl(*contents);
        url && url->is_valid()) {
      remembered.push_back(*url);
      continue;
    }
    aux::PinnedTabEntryCandidate candidate;
    candidate.visible_url = contents->GetVisibleURL();
    auto& navigation = contents->GetController();
    for (int i = 0; i < navigation.GetEntryCount(); ++i) {
      auto* entry = navigation.GetEntryAtIndex(i);
      candidate.history_urls.push_back(entry->GetURL());
      candidate.history_urls.push_back(entry->GetVirtualURL());
    }
    candidates.push_back(std::move(candidate));
    handles.push_back(tab->GetHandle());
  }
  const auto matches =
      aux::MatchPinnedTabEntryCandidates(saved, remembered, candidates);
  std::vector<tabs::TabHandle> changed;
  for (size_t i = 0; i < matches.size(); ++i) {
    if (!matches[i])
      continue;
    auto* tab = handles[i].Get();
    if (!tab || model->GetIndexOfTab(tab) == TabStripModel::kNoTab || !tab->IsPinned())
      continue;
    auto* contents = tab->GetContents();
    if (!contents || contents->GetBrowserContext() != profile_)
      continue;
    const GURL& url = saved[*matches[i]].url;
    aux::RememberPinnedTabEntryUrl(*contents, url);
    pinned_entry_urls_.insert_or_assign(tab->GetHandle(), url);
    UpdatePinnedEntrySessionData(tab, url);
    changed.push_back(tab->GetHandle());
  }
  // Source dispatches kAll only after all matching identities are installed.
  for (auto handle : changed) {
    if (auto* tab = handle.Get(); tab && model->GetIndexOfTab(tab) != TabStripModel::kNoTab)
      model->NotifyTabChanged(tab, TabChangeType::kAll);
  }
}
void PinnedTabService::UpdatePinnedEntrySessionData(tabs::TabInterface* tab,
                                                    const GURL& url) {
  if (!tab || !tab->GetContents() ||
      tab->GetContents()->GetBrowserContext() != profile_)
    return;
  auto* browser = tab->GetBrowserWindowInterface();
  if (!browser || browser->GetProfile() != profile_)
    return;
  const auto tab_id = sessions::SessionTabHelper::IdForTab(tab->GetContents());
  if (!tab_id.is_valid() || !browser->GetSessionID().is_valid())
    return;
  if (auto logical_id = aux::GetRememberedPinnedTabEntryId(*tab->GetContents()))
    organization_entry_ids_[tab->GetHandle()] = *logical_id;
  if (auto* service = SessionServiceFactory::GetForProfile(profile_)) {
    service->AddTabExtraData(browser->GetSessionID(), tab_id,
                             "pinned_tab_entry_url",
                             url.is_valid() ? url.spec() : std::string());
    service->AddTabExtraData(browser->GetSessionID(), tab_id,
        "aux_organization_tab_id", aux::GetRememberedPinnedTabEntryId(*tab->GetContents()).value_or(""));
  }
}
void PinnedTabService::CachePinnedEntryIdentity(tabs::TabInterface* tab) {
  if (!tab || !tab->IsPinned())
    return;
  auto* contents = tab->GetContents();
  if (!contents || contents->GetBrowserContext() != profile_)
    return;
  if (auto logical_id = aux::GetRememberedPinnedTabEntryId(*contents))
    organization_entry_ids_[tab->GetHandle()] = *logical_id;
  else if (auto cached = organization_entry_ids_.find(tab->GetHandle());
           cached != organization_entry_ids_.end())
    aux::RememberPinnedTabEntryId(*contents, cached->second);
  auto url = aux::GetRememberedPinnedTabEntryUrl(*contents);
  if (!url || !url->is_valid()) {
    auto cached = pinned_entry_urls_.find(tab->GetHandle());
    if (cached == pinned_entry_urls_.end())
      return;
    url = cached->second;
  }
  if (!url->is_valid())
    return;
  aux::RememberPinnedTabEntryUrl(*contents, *url);
  pinned_entry_urls_.insert_or_assign(tab->GetHandle(), *url);
}
void PinnedTabService::ObserveBrowserIfOwned(BrowserWindowInterface* browser) {
  if (!profile_switch_pauses_.empty() || browser->GetProfile() != profile_ ||
      browser->GetType() != BrowserWindowInterface::TYPE_NORMAL)
    return;
  auto* model = browser->GetTabStripModel();
  model->AddObserver(this);
  for (auto* tab : *model)
    CachePinnedEntryIdentity(tab);
  if (!SessionRestore::IsRestoring(profile_))
    ReconcilePinnedEntries(model);
}
void PinnedTabService::RefreshBrowserObservations() {
  TabStripModelObserver::StopObservingAll(this);
  if (!profile_switch_pauses_.empty())
    return;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [this](BrowserWindowInterface* browser) {
        ObserveBrowserIfOwned(browser);
        return true;
      });
}
base::WeakPtr<PinnedTabService>
PinnedTabService::GetWeakPtrForAuxProfileSwitch() {
  return weak_factory_.GetWeakPtr();
}
uint64_t PinnedTabService::PauseForAuxProfileSwitch() {
  const uint64_t token = ++next_profile_switch_pause_;
  CHECK(token);
  profile_switch_pauses_.insert(token);
  TabStripModelObserver::StopObservingAll(this);
  return token;
}
void PinnedTabService::ResumeAfterAuxProfileSwitch(uint64_t token) {
  if (!profile_switch_pauses_.erase(token) || !profile_switch_pauses_.empty())
    return;
  RefreshBrowserObservations();
  if (restore_reconciliation_pending_)
    ReconcileAfterSessionRestore();
  SchedulePinnedTabsReconciliation();
}
#endif

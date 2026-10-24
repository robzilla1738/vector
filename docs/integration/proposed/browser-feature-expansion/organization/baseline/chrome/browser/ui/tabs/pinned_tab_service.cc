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
      if (removed.tab)
        pinned_entry_urls_.erase(removed.tab->GetHandle());
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
  if (!tab || closing_all_browsers_ || !profile_switch_pauses_.empty())
    return;
  auto* contents = tab->GetContents();
  // The source service is profile-bound;155 owner transactions must not let
  // an old model observer write a target profile's tab into this profile.
  if (!contents || contents->GetBrowserContext() != profile_)
    return;
  const auto handle = tab->GetHandle();
  if (tab->IsPinned()) {
    const GURL url = contents->GetVisibleURL();
    if (!url.is_valid())
      return;
    pinned_entry_urls_.insert_or_assign(handle, url);
    aux::RememberPinnedTabEntryUrl(*contents, url);
    UpdatePinnedEntrySessionData(tab, url);
    aux::AddPinnedTabEntryIfAbsent(*profile_->GetPrefs(), url,
                                   contents->GetTitle());
  } else {
    GURL url;
    if (auto remembered = pinned_entry_urls_.find(handle);
        remembered != pinned_entry_urls_.end())
      url = remembered->second;
    else if (auto saved_url = aux::GetRememberedPinnedTabEntryUrl(*contents);
             saved_url && saved_url->is_valid())
      url = *saved_url;
    else
      url = contents->GetVisibleURL();
    pinned_entry_urls_.erase(handle);
    aux::ClearRememberedPinnedTabEntryUrl(*contents);
    UpdatePinnedEntrySessionData(tab, GURL());
    aux::RemoveFirstPinnedTabEntry(*profile_->GetPrefs(), url);
  }
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
  const auto entries = aux::ReadPinnedTabEntries(*profile_->GetPrefs());
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
          if (!tab->IsPinned() || !contents ||
              contents->GetBrowserContext() != profile_)
            continue;
          const auto url = aux::GetRememberedPinnedTabEntryUrl(*contents);
          if (url && url->is_valid() &&
              std::ranges::none_of(entries, [&url](const auto& entry) {
                return entry.url == *url;
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
  const auto saved = aux::ReadPinnedTabEntries(*profile_->GetPrefs());
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
  if (auto* service = SessionServiceFactory::GetForProfile(profile_)) {
    service->AddTabExtraData(browser->GetSessionID(), tab_id,
                             "pinned_tab_entry_url",
                             url.is_valid() ? url.spec() : std::string());
  }
}
void PinnedTabService::CachePinnedEntryIdentity(tabs::TabInterface* tab) {
  if (!tab || !tab->IsPinned())
    return;
  auto* contents = tab->GetContents();
  if (!contents || contents->GetBrowserContext() != profile_)
    return;
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

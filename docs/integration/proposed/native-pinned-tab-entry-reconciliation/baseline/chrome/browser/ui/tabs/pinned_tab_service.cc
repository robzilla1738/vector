// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/tabs/pinned_tab_service.h"

#include "base/functional/bind.h"
#include "chrome/browser/lifetime/application_lifetime_desktop.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/tabs/pinned_tab_codec.h"
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
#include "base/check.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include "content/public/browser/web_contents.h"
#endif
#include "chrome/browser/ui/tabs/tab_strip_model.h"

PinnedTabService::PinnedTabService(Profile* profile) : profile_(profile) {
  closing_all_browsers_subscription_ = chrome::AddClosingAllBrowsersCallback(
      base::BindRepeating(&PinnedTabService::OnClosingAllBrowsersChanged,
                          base::Unretained(this)));

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
    aux::AddPinnedTabEntryIfAbsent(*profile_->GetPrefs(), url,
                                   contents->GetTitle());
  } else {
    GURL url;
    if (auto remembered = pinned_entry_urls_.find(handle);
        remembered != pinned_entry_urls_.end())
      url = remembered->second;
    else if (auto remembered = aux::GetRememberedPinnedTabEntryUrl(*contents);
             remembered && remembered->is_valid())
      url = *remembered;
    else
      url = contents->GetVisibleURL();
    pinned_entry_urls_.erase(handle);
    aux::ClearRememberedPinnedTabEntryUrl(*contents);
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
}
#endif

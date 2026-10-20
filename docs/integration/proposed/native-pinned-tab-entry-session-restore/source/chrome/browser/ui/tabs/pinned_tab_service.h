// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_TABS_PINNED_TAB_SERVICE_H_
#define CHROME_BROWSER_UI_TABS_PINNED_TAB_SERVICE_H_

#include <cstdint>
#include <map>
#include <set>

#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/scoped_observation.h"
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/ui/browser_window/public/browser_collection_observer.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "components/keyed_service/core/keyed_service.h"
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
#include "base/memory/weak_ptr.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/tabs/public/tab_interface.h"
#include "url/gurl.h"
#endif

class Profile;
class BrowserWindowInterface;
class GlobalBrowserCollection;

// PinnedTabService is responsible for updating preferences with the set of
// pinned tabs to restore at startup. PinnedTabService listens for the
// appropriate set of notifications to know it should update preferences.
class PinnedTabService : public BrowserCollectionObserver,
                         public TabStripModelObserver,
                         public KeyedService {
 public:
  explicit PinnedTabService(Profile* profile);
  PinnedTabService(const PinnedTabService&) = delete;
  PinnedTabService& operator=(const PinnedTabService&) = delete;
  ~PinnedTabService() override;
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  // 155 same-window owner transaction adapter; no synthetic browser events.
  base::WeakPtr<PinnedTabService> GetWeakPtrForAuxProfileSwitch();
  uint64_t PauseForAuxProfileSwitch();
  void ResumeAfterAuxProfileSwitch(uint64_t token);
#endif

 private:
  // Invoked with true when all browsers start closing.
  void OnClosingAllBrowsersChanged(bool closing);

  // BrowserCollectionObserver:
  void OnBrowserCreated(BrowserWindowInterface* browser) override;
  void OnBrowserClosed(BrowserWindowInterface* browser) override;

  // TabStripModelObserver:
  void OnTabStripModelChanged(
      TabStripModel* tab_strip_model,
      const TabStripModelChange& change,
      const TabStripSelectionChange& selection) override;
  void OnTabPinnedStateChanged(tabs::TabInterface* tab, int index) override;
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  void OnTabChangedAt(tabs::TabInterface* tab, TabChangeType type) override;
#endif
  void WillCloseAllTabs(TabStripModel* tab_strip_model) override;

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  void ObserveBrowserIfOwned(BrowserWindowInterface* browser);
  void RefreshBrowserObservations();
  void CachePinnedEntryIdentity(tabs::TabInterface* tab);
  void OnSessionRestored(Profile* profile, int restored_tab_count);
  void ReconcileAfterSessionRestore();
  void SchedulePinnedTabsReconciliation();
  void ReconcileRemovedPinnedEntries();
  void ReconcilePinnedEntries(TabStripModel* model);
  void UpdatePinnedEntrySessionData(tabs::TabInterface* tab, const GURL& url);
#else
  // Writes the pinned tabs for `profile_`, but only if a new tab or browser
  // window has been added since the last time the method was called.
  void WritePinnedTabsIfNecessary();
#endif

  raw_ptr<Profile> profile_;

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  bool closing_all_browsers_ = false;
  bool reconciliation_pending_ = false;
  PrefChangeRegistrar pinned_pref_changes_;
  base::CallbackListSubscription session_restored_subscription_;
  bool restore_reconciliation_pending_ = false;
  std::map<tabs::TabHandle, GURL> pinned_entry_urls_;
  std::set<uint64_t> profile_switch_pauses_;
  uint64_t next_profile_switch_pause_ = 0;
#else
  bool need_to_write_pinned_tabs_ = true;
#endif

  base::ScopedObservation<GlobalBrowserCollection, BrowserCollectionObserver>
      browser_collection_observation_{this};

  base::CallbackListSubscription closing_all_browsers_subscription_;
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  base::WeakPtrFactory<PinnedTabService> weak_factory_{this};
#endif
};

#endif  // CHROME_BROWSER_UI_TABS_PINNED_TAB_SERVICE_H_

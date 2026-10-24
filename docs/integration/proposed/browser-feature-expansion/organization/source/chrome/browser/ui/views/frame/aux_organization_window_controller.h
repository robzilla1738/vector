// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_WINDOW_CONTROLLER_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_WINDOW_CONTROLLER_H_
#include <map>
#include <memory>
#include <set>
#include <string>
#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/values.h"
#include "chrome/browser/aux/organization/organization_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_delegate.h"
#include "components/tabs/public/tab_interface.h"
class BrowserWindowInterface;
class Profile;
namespace content { class WebContents; }
namespace aux {
class AuxOrganizationWindowController final : public OrganizationWindowDelegate,
                                              public TabStripModelObserver {
 public:
  explicit AuxOrganizationWindowController(BrowserWindowInterface&);
  ~AuxOrganizationWindowController() override;
  static AuxOrganizationWindowController* FromBrowser(BrowserWindowInterface*);
  static AuxOrganizationWindowController* GetForTabStripModel(TabStripModel*);
  void RebindForProfileSwitch();
  void Shutdown();
  // Bound to the supplied ordinary-row projection before its organization
  // filter. No URL guesses or recursive eligibility query.
  void SetOrdinaryEligibility(base::RepeatingCallback<bool(const tabs::TabInterface&)>);
  void RefreshOrdinaryEligibility();
  void RestoreActiveSpace(const std::string&);
  bool IsProjectionReady() const override;
  bool ShouldDisplayLogicalEntry(const std::string&) const override;
  std::string ActiveSpaceId() const override;
  std::string SelectedLogicalTabId() const override;
  bool SelectSpace(const std::string&) override;
  void OpenLogicalTab(const std::string&, base::OnceCallback<void(bool)>) override;
  void UnloadLogicalTab(const std::string&, base::OnceCallback<void(bool)>) override;
  void ArchiveLogicalEntry(const std::string&, base::OnceCallback<void(bool)>) override;
  void ArchiveFolderAndContents(const std::string&, base::OnceCallback<void(bool)>);
  base::CallbackListSubscription ObserveWindowState(base::RepeatingClosure) override;
  // Remote canonical URL changes never navigate a live page implicitly.
  bool HasPendingSharedUpdate(const std::string&) const;
  bool IsLogicalEntryProtected(const std::string&) const;
  void ApplyPendingSharedUpdate(const std::string&, base::OnceCallback<void(bool)>);
  base::ListValue SnapshotViews() const;
  // Root close gate: handled/refused means stop the original close. A browser
  // closing all tabs is separate and leaves its shared logical records intact.
  bool HandleClose(tabs::TabHandle);
  bool IsExplicitUnload(tabs::TabHandle) const;
  bool ready() const;
 private:
  class PageObserver;
  struct ViewRecord {
    std::string logical_id, view_id, document_id, loaded_url, shared_url, pending_shared_url;
    std::unique_ptr<PageObserver> observer;
  };
  void Bind();
  void QueueReconcile();
  void Reconcile();
  void PublishNavigation(tabs::TabHandle);
  void NavigationCommitted(tabs::TabHandle);
  void DocumentChanged(tabs::TabHandle);
  void PersistIdentity(tabs::TabHandle, const std::string&);
  void PersistSpace();
  void Notify();
  bool Current() const;
  bool Protected(tabs::TabInterface*) const;
  bool CloseViewNow(tabs::TabHandle);
  void ArchiveEntry(const std::string&, bool allow_pinned_folder, base::OnceCallback<void(bool)>);
  void EnsureSavedThenClose(tabs::TabHandle, base::OnceCallback<void(bool)>);
  void OnTabStripModelChanged(TabStripModel*, const TabStripModelChange&,
                              const TabStripSelectionChange&) override;
  void OnTabStripModelDestroyed(TabStripModel*) override;
  base::WeakPtr<BrowserWindowInterface> browser_;
  raw_ptr<Profile> profile_ = nullptr;
  raw_ptr<TabStripModel> model_ = nullptr;
  std::string active_space_, restored_space_;
  std::map<tabs::TabHandle, ViewRecord> views_;
  std::set<tabs::TabHandle> explicit_unloads_;
  std::set<tabs::TabHandle> dirty_navigation_;
  bool shutdown_ = false;
  bool reconcile_queued_ = false, registering_ = false, opening_ = false;
  base::CallbackListSubscription ready_subscription_, model_changes_, settled_, session_restored_;
  base::RepeatingClosureList observers_;
  base::RepeatingCallback<bool(const tabs::TabInterface&)> ordinary_eligible_;
  base::WeakPtrFactory<AuxOrganizationWindowController> weak_{this};
};
}  // namespace aux
#endif

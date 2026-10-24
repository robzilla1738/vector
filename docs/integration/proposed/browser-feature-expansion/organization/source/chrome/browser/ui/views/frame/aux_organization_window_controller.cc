// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include <algorithm>
#include <limits>
#include <utility>
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/uuid.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/actor/ui/actor_ui_tab_controller.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_exclusion.h"
#include "chrome/browser/aux/organization/organization_service.h"
#include "chrome/browser/media/webrtc/media_capture_devices_dispatcher.h"
#include "chrome/browser/media/webrtc/media_stream_capture_indicator.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/sessions/session_restore.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/browser_window/public/browser_window_features.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_user_gesture_details.h"
#include "chrome/browser/ui/views/frame/aux_organization_ui_commands.h"
#include "components/sessions/content/session_tab_helper.h"
#include "content/public/browser/download_manager.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
namespace aux {
namespace {
organization::OrganizationService* Organization(BrowserWindowInterface* browser) {
  if (!browser) return nullptr;
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser->GetProfile());
  return owner ? owner->model() : nullptr;
}
std::vector<organization::Command> NavigationCommands(const organization::Entry& entry,
                                                     content::WebContents& contents) {
  std::vector<organization::Command> commands;
  const GURL url = contents.GetLastCommittedURL();
  if (url.is_valid() && url.spec() != entry.current_url) {
    organization::Command command; command.action = organization::Action::kUpdateTabUrl;
    command.id = entry.id; command.url = url.spec(); commands.push_back(std::move(command));
  }
  // User-renamed titles are retained; URL commits do not silently rename them.
  return commands;
}
}  // namespace
class AuxOrganizationWindowController::PageObserver final : public content::WebContentsObserver {
 public:
  PageObserver(content::WebContents* contents, base::WeakPtr<AuxOrganizationWindowController> owner, tabs::TabHandle handle)
      : content::WebContentsObserver(contents), owner_(owner), handle_(handle) {}
  void DidFinishNavigation(content::NavigationHandle* navigation) override {
    if (owner_ && navigation->HasCommitted() && navigation->IsInPrimaryMainFrame()) owner_->NavigationCommitted(handle_);
  }
  void PrimaryPageChanged(content::Page&) override { if (owner_) owner_->DocumentChanged(handle_); }
 private:
  base::WeakPtr<AuxOrganizationWindowController> owner_;
  tabs::TabHandle handle_;
};
AuxOrganizationWindowController::AuxOrganizationWindowController(BrowserWindowInterface& browser)
    : browser_(browser.GetWeakPtr()) { RebindForProfileSwitch(); }
AuxOrganizationWindowController::~AuxOrganizationWindowController() { Shutdown(); }
void AuxOrganizationWindowController::Shutdown() {
  if (shutdown_) return;
  shutdown_ = true;
  weak_.InvalidateWeakPtrs();
  TabStripModelObserver::StopObservingAll(this);
  ready_subscription_ = {}; model_changes_ = {}; settled_ = {}; session_restored_ = {};
  ordinary_eligible_.Reset(); views_.clear(); explicit_unloads_.clear(); dirty_navigation_.clear();
  profile_ = nullptr; model_ = nullptr; active_space_.clear(); restored_space_.clear();
  Notify();
}
AuxOrganizationWindowController* AuxOrganizationWindowController::FromBrowser(BrowserWindowInterface* browser) {
  return browser ? browser->GetFeatures().aux_organization_window_controller() : nullptr;
}
AuxOrganizationWindowController* AuxOrganizationWindowController::GetForTabStripModel(TabStripModel* model) {
  AuxOrganizationWindowController* result = nullptr;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation([&](BrowserWindowInterface* browser) {
    if (browser->GetTabStripModel() != model) return true;
    result = FromBrowser(browser); return false;
  });
  return result;
}
bool AuxOrganizationWindowController::Current() const {
  return !shutdown_ && browser_ && profile_ && model_ && !profile_->IsOffTheRecord() &&
      browser_->GetProfile() == profile_ && browser_->GetTabStripModel() == model_;
}
bool AuxOrganizationWindowController::ready() const {
  auto* organization = Current() ? Organization(browser_.get()) : nullptr;
  if (!organization || organization->blocked() || !ordinary_eligible_ || !organization->snapshot().spaces.contains(active_space_)) return false;
  for (auto* tab : *model_) {
    auto* contents = tab->GetContents(); if (!contents || tab->IsPinned() || !ordinary_eligible_.Run(*tab)) continue;
    const auto* identity = PageIdentity::FromWebContents(contents);
    if (identity && identity->runtime_owned()) continue;
    const auto id = GetRememberedPinnedTabEntryId(*contents).value_or("");
    const auto entry = organization->snapshot().entries.find(id);
    if (entry == organization->snapshot().entries.end() || entry->second.archived || entry->second.kind != organization::EntryKind::kTab) return false;
  }
  return true;
}
bool AuxOrganizationWindowController::IsProjectionReady() const { return ready(); }
bool AuxOrganizationWindowController::ShouldDisplayLogicalEntry(const std::string& id) const {
  if (!Current() || !ordinary_eligible_) return false;
  for (auto* tab : *model_) {
    if (tab->GetContents() && GetRememberedPinnedTabEntryId(*tab->GetContents()) == id &&
        !tab->IsPinned() && !ordinary_eligible_.Run(*tab)) return false;
  }
  return true;
}
void AuxOrganizationWindowController::RebindForProfileSwitch() {
  if (shutdown_) return;
  TabStripModelObserver::StopObservingAll(this);
  weak_.InvalidateWeakPtrs(); ready_subscription_ = {}; model_changes_ = {}; settled_ = {}; session_restored_ = {};
  views_.clear(); explicit_unloads_.clear(); dirty_navigation_.clear();
  reconcile_queued_ = false; registering_ = false; opening_ = false;
  profile_ = browser_ ? browser_->GetProfile() : nullptr;
  model_ = browser_ ? browser_->GetTabStripModel() : nullptr;
  active_space_.clear(); restored_space_.clear(); ordinary_eligible_.Reset();
  if (!Current() || browser_->GetType() != BrowserWindowInterface::TYPE_NORMAL) return;
  model_->AddObserver(this);
  session_restored_ = SessionRestore::RegisterOnSessionRestoredCallback(base::BindRepeating(
      [](base::WeakPtr<AuxOrganizationWindowController> owner, Profile* profile, int) {
        if (owner && owner->profile_ == profile) owner->QueueReconcile();
      }, weak_.GetWeakPtr()));
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(profile_);
  if (owner) ready_subscription_ = owner->ObserveReady(base::BindRepeating(&AuxOrganizationWindowController::Bind, weak_.GetWeakPtr()));
  Bind();
}
void AuxOrganizationWindowController::SetOrdinaryEligibility(
    base::RepeatingCallback<bool(const tabs::TabInterface&)> eligible) {
  if (shutdown_) return;
  ordinary_eligible_ = std::move(eligible); QueueReconcile();
}
void AuxOrganizationWindowController::RefreshOrdinaryEligibility() { QueueReconcile(); }
void AuxOrganizationWindowController::Bind() {
  model_changes_ = {}; settled_ = {};
  if (!Current()) return;
  auto* organization = Organization(browser_.get()); if (!organization) return;
  model_changes_ = organization->Observe(base::BindRepeating(
      [](base::WeakPtr<AuxOrganizationWindowController> owner, const organization::Delta&) {
        if (owner) owner->QueueReconcile();
      }, weak_.GetWeakPtr()));
  settled_ = organization->ObserveSettled(base::BindRepeating(&AuxOrganizationWindowController::QueueReconcile, weak_.GetWeakPtr()));
  QueueReconcile();
}
void AuxOrganizationWindowController::RestoreActiveSpace(const std::string& id) {
  if (!organization::IsCanonicalId(id)) return;
  restored_space_ = id; QueueReconcile();
}
std::string AuxOrganizationWindowController::ActiveSpaceId() const { return Current() ? active_space_ : ""; }
std::string AuxOrganizationWindowController::SelectedLogicalTabId() const {
  if (!Current()) return {};
  auto* contents = model_->GetActiveWebContents();
  return contents ? GetRememberedPinnedTabEntryId(*contents).value_or("") : "";
}
void AuxOrganizationWindowController::PersistSpace() {
  if (!Current() || active_space_.empty() || !browser_->GetSessionID().is_valid()) return;
  if (auto* service = SessionServiceFactory::GetForProfile(profile_))
    service->AddWindowExtraData(browser_->GetSessionID(), "aux_organization_space_id", active_space_);
}
bool AuxOrganizationWindowController::SelectSpace(const std::string& id) {
  auto* organization = Current() ? Organization(browser_.get()) : nullptr;
  if (!organization || organization->blocked() || !organization->snapshot().spaces.contains(id)) return false;
  if (active_space_ != id) { active_space_ = id; PersistSpace(); Notify(); }
  // Selection changes organization only; it never moves or destroys a loaded page.
  return true;
}
void AuxOrganizationWindowController::QueueReconcile() {
  if (!Current() || reconcile_queued_) return;
  reconcile_queued_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&AuxOrganizationWindowController::Reconcile, weak_.GetWeakPtr()));
}
void AuxOrganizationWindowController::PersistIdentity(tabs::TabHandle handle, const std::string& id) {
  auto* tab = handle.Get();
  if (!Current() || !tab || model_->GetIndexOfTab(tab) < 0 || !tab->GetContents() ||
      tab->GetContents()->GetBrowserContext() != profile_) return;
  RememberPinnedTabEntryId(*tab->GetContents(), id);
  const auto tab_id = sessions::SessionTabHelper::IdForTab(tab->GetContents());
  if (tab_id.is_valid() && browser_->GetSessionID().is_valid()) {
    if (auto* service = SessionServiceFactory::GetForProfile(profile_))
      service->AddTabExtraData(browser_->GetSessionID(), tab_id, "aux_organization_tab_id", id);
  }
}
void AuxOrganizationWindowController::Reconcile() {
  reconcile_queued_ = false;
  if (!Current()) return;
  auto* organization = Organization(browser_.get());
  if (!organization || organization->blocked()) { Notify(); return; }
  const auto alive = weak_.GetWeakPtr();
  const auto& snapshot = organization->snapshot();
  if (!restored_space_.empty() && snapshot.spaces.contains(restored_space_)) {
    active_space_ = std::exchange(restored_space_, {}); PersistSpace();
  }
  if (!snapshot.spaces.contains(active_space_)) {
    const organization::Space* first = nullptr;
    for (const auto& [id, space] : snapshot.spaces) if (!first || space.order < first->order) first = &space;
    if (!first) return;
    active_space_ = first->id; PersistSpace();
  }
  std::vector<organization::Command> commands;
  std::vector<std::pair<tabs::TabHandle, std::string>> assigned;
  for (auto* tab : *model_) {
    auto* contents = tab->GetContents();
    if (!contents || contents->GetBrowserContext() != profile_) continue;
    auto existing = views_.find(tab->GetHandle());
    auto logical = GetRememberedPinnedTabEntryId(*contents).value_or("");
    if (logical.empty() && existing != views_.end()) { logical = existing->second.logical_id; PersistIdentity(tab->GetHandle(), logical); }
    if (!logical.empty() && snapshot.entries.contains(logical) && snapshot.entries.at(logical).kind == organization::EntryKind::kTab) {
      const auto& entry = snapshot.entries.at(logical);
      auto& view = views_[tab->GetHandle()];
      view.logical_id = logical;
      view.view_id = PageIdentity::GetOrCreate(profile_, contents);
      if (!view.observer || view.observer->web_contents() != contents) {
        view.observer = std::make_unique<PageObserver>(contents, weak_.GetWeakPtr(), tab->GetHandle());
        view.loaded_url = contents->GetLastCommittedURL().spec();
        view.document_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
      }
      if (view.loaded_url == entry.current_url) view.pending_shared_url.clear();
      if (view.shared_url != entry.current_url) {
        view.shared_url = entry.current_url;
        view.pending_shared_url = view.loaded_url == entry.current_url ? "" : entry.current_url;
      }
      continue;
    }
    // Restore retains an unknown ID until the authoritative snapshot is known;
    // never assign an existing record based on URL. Each ordinary tab gets its
    // own logical ID, even when several URLs are identical.
    if (tab->IsPinned() || tab->IsSplit() || IsBookmarkTabExcluded(tab, model_) ||
        !ordinary_eligible_ || !ordinary_eligible_.Run(*tab) ||
        registering_ || organization->pending() || opening_ ||
        SessionRestore::IsRestoring(profile_) || commands.size() == 512) continue;
    const auto* identity = PageIdentity::FromWebContents(contents);
    if (identity && identity->runtime_owned()) continue;
    const GURL url = contents->GetLastCommittedURL().is_valid() ? contents->GetLastCommittedURL() : contents->GetVisibleURL();
    if (!url.is_valid()) continue;
    organization::Command command; command.action = organization::Action::kCreateTab;
    command.id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    command.space_id = active_space_; command.title = base::UTF16ToUTF8(contents->GetTitle());
    command.url = url.spec(); command.index = std::numeric_limits<uint64_t>::max();
    assigned.push_back({tab->GetHandle(), command.id}); commands.push_back(std::move(command));
  }
  if (!commands.empty()) {
    auto context = CaptureOrganizationContext(*browser_);
    if (context) {
      registering_ = true;
      organization->ExecuteBatch(std::move(*context), std::move(commands), base::BindOnce(
          [](base::WeakPtr<AuxOrganizationWindowController> owner,
             std::vector<std::pair<tabs::TabHandle, std::string>> assigned, organization::CommitResult result) {
            if (!owner) return; owner->registering_ = false;
            if (result.error == organization::Error::kNone) {
              for (const auto& [handle, id] : assigned) {
                owner->PersistIdentity(handle, id); owner->dirty_navigation_.insert(handle);
              }
              owner->QueueReconcile();
            }
            owner->Notify();
          }, weak_.GetWeakPtr(), std::move(assigned)));
    }
  } else if (!organization->pending() && !dirty_navigation_.empty()) {
    const auto handle = *dirty_navigation_.begin(); dirty_navigation_.erase(handle);
    PublishNavigation(handle);
  }
  if (alive) Notify();
}
void AuxOrganizationWindowController::DocumentChanged(tabs::TabHandle handle) {
  auto it = views_.find(handle);
  if (it != views_.end()) it->second.document_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  NavigationCommitted(handle);
}
void AuxOrganizationWindowController::NavigationCommitted(tabs::TabHandle handle) {
  if (!Current()) return;
  auto it = views_.find(handle);
  if (it != views_.end() && handle.Get() && handle.Get()->GetContents())
    it->second.loaded_url = handle.Get()->GetContents()->GetLastCommittedURL().spec();
  dirty_navigation_.insert(handle); QueueReconcile();
}
void AuxOrganizationWindowController::PublishNavigation(tabs::TabHandle handle) {
  auto* organization = Current() ? Organization(browser_.get()) : nullptr;
  auto* tab = handle.Get();
  if (!organization || !tab || !tab->GetContents() || model_->GetIndexOfTab(tab) < 0) return;
  const auto id = GetRememberedPinnedTabEntryId(*tab->GetContents()).value_or("");
  const auto found = organization->snapshot().entries.find(id);
  if (found == organization->snapshot().entries.end() || found->second.archived) return;
  auto commands = NavigationCommands(found->second, *tab->GetContents());
  if (commands.empty()) { QueueReconcile(); return; }
  auto context = CaptureOrganizationContext(*browser_);
  if (!context) { dirty_navigation_.insert(handle); return; }
  organization->ExecuteBatch(std::move(*context), std::move(commands), base::BindOnce(
      [](base::WeakPtr<AuxOrganizationWindowController> owner, tabs::TabHandle handle, organization::CommitResult result) {
        if (!owner) return;
        if (result.error == organization::Error::kBusy || result.error == organization::Error::kStaleRevision)
          owner->dirty_navigation_.insert(handle);
        owner->QueueReconcile();
      }, weak_.GetWeakPtr(), handle));
}
bool AuxOrganizationWindowController::Protected(tabs::TabInterface* tab) const {
  if (!Current() || !tab || model_->GetIndexOfTab(tab) < 0 || tab->IsSplit()) return true;
  auto* contents = tab->GetContents();
  if (!contents || contents->GetBrowserContext() != profile_ || contents->IsLoading() ||
      contents->IsCurrentlyAudible() || contents->IsBeingCaptured() ||
      contents->NeedToFireBeforeUnloadOrUnloadEvents() || IsBookmarkTabExcluded(tab, model_)) return true;
  // Use actual selected-product activity owners. The older independent
  // EgressController/creator service is not in this build and is not authority.
  const auto* identity = PageIdentity::FromWebContents(contents);
  if (identity && identity->runtime_owned()) return true;
  if (content::DevToolsAgentHost::HasFor(contents) &&
      content::DevToolsAgentHost::GetOrCreateFor(contents)->IsAttached()) return true;
  auto* actor_controller = actor::ui::ActorUiTabController::Get(tab->GetUnownedUserDataHost());
  if (actor_controller && !actor_controller->IsColdForAuxProfileSwitch()) return true;
  const auto capture = MediaCaptureDevicesDispatcher::GetInstance()->GetMediaStreamCaptureIndicator();
  if (capture->IsCapturingUserMedia(contents) || capture->IsBeingMirrored(contents) ||
      capture->IsCapturingTab(contents) || capture->IsCapturingWindow(contents) || capture->IsCapturingDisplay(contents)) return true;
  // Conservative profile-wide protection until a download can be attributed
  // exactly to a view; unknown ownership never authorizes an unload.
  return profile_->GetDownloadManager()->InProgressCount() != 0;
}
void AuxOrganizationWindowController::OpenLogicalTab(const std::string& id, base::OnceCallback<void(bool)> reply) {
  auto* organization = Current() ? Organization(browser_.get()) : nullptr;
  if (!organization || organization->blocked() || organization->pending()) { std::move(reply).Run(false); return; }
  const auto found = organization->snapshot().entries.find(id);
  if (found == organization->snapshot().entries.end() || found->second.archived ||
      found->second.kind != organization::EntryKind::kTab) { std::move(reply).Run(false); return; }
  for (auto* tab : *model_) {
    if (tab->GetContents() && GetRememberedPinnedTabEntryId(*tab->GetContents()) == id) {
      model_->ActivateTabAt(model_->GetIndexOfTab(tab), TabStripUserGestureDetails(TabStripUserGestureDetails::GestureType::kNone));
      std::move(reply).Run(true); return;
    }
  }
  const auto entry = found->second; const GURL url(entry.current_url);
  if (!url.is_valid()) { std::move(reply).Run(false); return; }
  // The real navigator remains the owner of navigation policy, schemes and
  // permissions. No other window is focused, navigated, or detached.
  const auto alive = weak_.GetWeakPtr();
  opening_ = true;
  NavigateParams params(browser_.get(), url, ui::PAGE_TRANSITION_AUTO_BOOKMARK);
  params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  Navigate(&params);
  if (alive) opening_ = false;
  if (!alive || !Current() || !params.navigated_or_inserted_contents) { std::move(reply).Run(false); return; }
  auto* contents = params.navigated_or_inserted_contents.get();
  const int index = model_->GetIndexOfWebContents(contents);
  if (index < 0 || contents->GetBrowserContext() != profile_) { std::move(reply).Run(false); return; }
  PersistIdentity(model_->GetTabAtIndex(index)->GetHandle(), id);
  if (entry.space_id.empty()) model_->SetTabPinned(index, true);
  if (alive) QueueReconcile();
  std::move(reply).Run(static_cast<bool>(alive));
}
bool AuxOrganizationWindowController::IsExplicitUnload(tabs::TabHandle handle) const { return explicit_unloads_.contains(handle); }
bool AuxOrganizationWindowController::CloseViewNow(tabs::TabHandle handle) {
  auto* tab = handle.Get(); if (Protected(tab)) return false;
  const auto alive = weak_.GetWeakPtr();
  const int index = model_->GetIndexOfTab(tab);
  explicit_unloads_.insert(handle);
  model_->CloseWebContentsAt(index, CLOSE_USER_GESTURE);
  if (!alive) return !handle.Get();
  explicit_unloads_.erase(handle);
  return !handle.Get() || model_->GetIndexOfTab(handle.Get()) < 0;
}
void AuxOrganizationWindowController::EnsureSavedThenClose(tabs::TabHandle handle, base::OnceCallback<void(bool)> reply) {
  if (Protected(handle.Get())) { std::move(reply).Run(false); return; }
  auto* organization = Organization(browser_.get());
  auto* tab = handle.Get();
  const auto id = GetRememberedPinnedTabEntryId(*tab->GetContents()).value_or("");
  if (!organization || !organization->snapshot().entries.contains(id)) { std::move(reply).Run(false); return; }
  auto commands = NavigationCommands(organization->snapshot().entries.at(id), *tab->GetContents());
  if (commands.empty()) { std::move(reply).Run(CloseViewNow(handle)); return; }
  auto context = CaptureOrganizationContext(*browser_);
  if (!context) { std::move(reply).Run(false); return; }
  const std::string url = tab->GetContents()->GetLastCommittedURL().spec();
  organization->ExecuteBatch(std::move(*context), std::move(commands), base::BindOnce(
      [](base::WeakPtr<AuxOrganizationWindowController> owner, tabs::TabHandle handle, std::string url,
         base::OnceCallback<void(bool)> reply, organization::CommitResult result) {
        bool closed = false;
        if (owner && result.error == organization::Error::kNone && handle.Get() &&
            handle.Get()->GetContents() && handle.Get()->GetContents()->GetLastCommittedURL().spec() == url)
          closed = owner->CloseViewNow(handle);
        std::move(reply).Run(closed);
      }, weak_.GetWeakPtr(), handle, url, std::move(reply)));
}
void AuxOrganizationWindowController::UnloadLogicalTab(const std::string& id, base::OnceCallback<void(bool)> reply) {
  if (!Current()) { std::move(reply).Run(false); return; }
  for (auto* tab : *model_) if (tab->GetContents() && GetRememberedPinnedTabEntryId(*tab->GetContents()) == id) {
    EnsureSavedThenClose(tab->GetHandle(), std::move(reply)); return;
  }
  // Already-unloaded logical entries are successful only if they still exist.
  auto* organization = Organization(browser_.get());
  std::move(reply).Run(organization && organization->snapshot().entries.contains(id));
}
void AuxOrganizationWindowController::ArchiveLogicalEntry(const std::string& id, base::OnceCallback<void(bool)> reply) {
  ArchiveEntry(id, false, std::move(reply));
}
void AuxOrganizationWindowController::ArchiveFolderAndContents(const std::string& id, base::OnceCallback<void(bool)> reply) {
  ArchiveEntry(id, true, std::move(reply));
}
void AuxOrganizationWindowController::ArchiveEntry(const std::string& id, bool allow_pinned_folder,
                                                   base::OnceCallback<void(bool)> reply) {
  auto* organization = Current() ? Organization(browser_.get()) : nullptr;
  if (!organization || organization->pending() || organization->blocked()) { std::move(reply).Run(false); return; }
  const auto& snapshot = organization->snapshot();
  if (!snapshot.entries.contains(id)) { std::move(reply).Run(false); return; }
  const auto entry = snapshot.entries.at(id);
  if (entry.archived || (entry.space_id.empty() &&
      (!allow_pinned_folder || entry.kind != organization::EntryKind::kFolder ||
       !snapshot.spaces.contains(active_space_)))) { std::move(reply).Run(false); return; }
  std::set<std::string> subtree{id};
  for (size_t depth = 0; depth < organization::kMaxDepth; ++depth) {
    bool added = false;
    for (const auto& [entry_id, entry] : snapshot.entries)
      if (!entry.archived && subtree.contains(entry.parent_id) && subtree.insert(entry_id).second) added = true;
    if (!added) break;
  }
  std::vector<std::pair<base::WeakPtr<AuxOrganizationWindowController>, tabs::TabHandle>> targets;
  bool safe = true;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation([&](BrowserWindowInterface* browser) {
    if (browser->GetProfile() != profile_) return true;
    auto* controller = FromBrowser(browser);
    for (auto* tab : *browser->GetTabStripModel()) {
      auto* contents = tab->GetContents();
      if (!contents || !subtree.contains(GetRememberedPinnedTabEntryId(*contents).value_or(""))) continue;
      if (!controller || controller->Protected(tab)) { safe = false; return false; }
      // Do not archive a newly navigated view until its actual URL is durable.
      const auto logical = GetRememberedPinnedTabEntryId(*contents).value();
      if (contents->GetLastCommittedURL().spec() != snapshot.entries.at(logical).current_url) { safe = false; return false; }
      targets.push_back({controller->weak_.GetWeakPtr(), tab->GetHandle()});
    }
    return true;
  });
  if (!safe) { std::move(reply).Run(false); return; }
  auto context = CaptureOrganizationContext(*browser_);
  if (!context) { std::move(reply).Run(false); return; }
  const auto alive = weak_.GetWeakPtr();
  // Metadata is already durable before close. If any native removal refuses,
  // retain the entire logical subtree rather than claiming partial archive.
  for (const auto& [owner, handle] : targets) {
    if (!owner || !owner->CloseViewNow(handle)) { std::move(reply).Run(false); return; }
    if (!alive) { std::move(reply).Run(false); return; }
  }
  std::vector<organization::Command> commands;
  if (entry.space_id.empty()) {
    organization::Command move; move.action = organization::Action::kMoveEntry;
    move.id = id; move.space_id = active_space_; move.index = std::numeric_limits<uint64_t>::max();
    commands.push_back(std::move(move));
  }
  organization::Command command; command.action = organization::Action::kArchive; command.id = id;
  commands.push_back(std::move(command));
  auto* current = Current() ? Organization(browser_.get()) : nullptr;
  if (!current) { std::move(reply).Run(false); return; }
  current->ExecuteBatch(std::move(*context), std::move(commands), base::BindOnce(
      [](base::OnceCallback<void(bool)> reply, organization::CommitResult result) {
        std::move(reply).Run(result.error == organization::Error::kNone);
      }, std::move(reply)));
}
bool AuxOrganizationWindowController::HandleClose(tabs::TabHandle handle) {
  if (!Current() || model_->closing_all() || IsExplicitUnload(handle)) return false;
  auto* tab = handle.Get(); if (!tab || !tab->GetContents()) return false;
  const auto id = GetRememberedPinnedTabEntryId(*tab->GetContents()).value_or("");
  auto* organization = Organization(browser_.get());
  if (id.empty() || !organization || !organization->snapshot().entries.contains(id)) return false;
  const bool pin = organization::HasRetention(organization->snapshot(), id);
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE, base::BindOnce(
      [](base::WeakPtr<AuxOrganizationWindowController> owner, std::string id, bool pin) {
        if (!owner) return;
        auto done = base::BindOnce([](base::WeakPtr<AuxOrganizationWindowController> owner, bool) { if (owner) owner->Notify(); }, owner);
        if (pin) owner->UnloadLogicalTab(id, std::move(done)); else owner->ArchiveLogicalEntry(id, std::move(done));
      }, weak_.GetWeakPtr(), id, pin));
  return true;
}
bool AuxOrganizationWindowController::HasPendingSharedUpdate(const std::string& id) const {
  for (const auto& [handle, view] : views_) if (view.logical_id == id && !view.pending_shared_url.empty()) return true;
  return false;
}
bool AuxOrganizationWindowController::IsLogicalEntryProtected(const std::string& id) const {
  const auto* organization = Current() ? Organization(browser_.get()) : nullptr;
  if (!organization || organization->blocked() || organization->pending() || !organization->snapshot().entries.contains(id)) return true;
  if (organization::HasRetention(organization->snapshot(), id)) return true;
  const auto& entries = organization->snapshot().entries;
  for (const auto& [child_id, child] : entries) {
    if (child.archived || !child.keep_in_space) continue;
    std::string ancestor = child_id;
    for (size_t depth = 0; depth <= organization::kMaxDepth && !ancestor.empty(); ++depth) {
      if (ancestor == id) return true;
      const auto found = entries.find(ancestor); if (found == entries.end()) return true;
      ancestor = found->second.parent_id;
    }
  }
  for (const auto& [handle, view] : views_) {
    std::string ancestor = view.logical_id;
    for (size_t depth = 0; depth <= organization::kMaxDepth && !ancestor.empty(); ++depth) {
      if (ancestor == id) {
        if (Protected(handle.Get()) || !view.pending_shared_url.empty()) return true;
        break;
      }
      auto found = entries.find(ancestor); if (found == entries.end()) return true;
      ancestor = found->second.parent_id;
    }
  }
  return false;
}
void AuxOrganizationWindowController::ApplyPendingSharedUpdate(const std::string& id, base::OnceCallback<void(bool)> reply) {
  if (!Current()) { std::move(reply).Run(false); return; }
  for (const auto& [handle, view] : views_) if (view.logical_id == id && !view.pending_shared_url.empty()) {
    if (Protected(handle.Get())) { std::move(reply).Run(false); return; }
    const auto* organization = Organization(browser_.get());
    if (!organization || organization->pending() || !organization->snapshot().entries.contains(id) ||
        organization->snapshot().entries.at(id).current_url != view.pending_shared_url) { std::move(reply).Run(false); return; }
    const GURL url(view.pending_shared_url);
    auto* coordinator = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile_);
    if (!coordinator || organization->blocked()) { std::move(reply).Run(false); return; }
    // Explicit person action targets this exact view; it does not focus a
    // different tab or authorize a background/agent navigation.
    const auto alive = weak_.GetWeakPtr();
    auto* contents = handle.Get()->GetContents();
    contents->GetController().LoadURLWithParams(content::NavigationController::LoadURLParams(url));
    std::move(reply).Run(static_cast<bool>(alive));
    return;
  }
  std::move(reply).Run(false);
}
base::ListValue AuxOrganizationWindowController::SnapshotViews() const {
  base::ListValue result;
  if (!Current()) return result;
  for (const auto& [handle, view] : views_) {
    if (!handle.Get() || model_->GetIndexOfTab(handle.Get()) < 0) continue;
    auto* contents = handle.Get()->GetContents(); if (!contents) continue;
    const auto* organization = Organization(browser_.get()); if (!organization) continue;
    const auto entry = organization->snapshot().entries.find(view.logical_id);
    if (entry == organization->snapshot().entries.end()) continue;
    base::DictValue row; row.Set("id", view.logical_id); row.Set("viewId", view.view_id);
    row.Set("nativeTabId", sessions::SessionTabHelper::IdForTab(contents).id());
    row.Set("targetId", content::DevToolsAgentHost::GetOrCreateFor(contents)->GetId());
    row.Set("documentId", view.document_id); row.Set("title", base::UTF16ToUTF8(contents->GetTitle()));
    row.Set("url", contents->GetLastCommittedURL().spec()); row.Set("spaceId", entry->second.space_id);
    row.Set("pinned", organization::IsGlobalPin(entry->second));
    row.Set("retained", organization::HasRetention(organization->snapshot(), view.logical_id));
    row.Set("windowId", std::to_string(browser_->GetSessionID().id()));
    row.Set("pendingSharedUrl", view.pending_shared_url);
    row.Set("protected", organization::HasRetention(organization->snapshot(), view.logical_id) || Protected(handle.Get()) || !view.pending_shared_url.empty()); result.Append(std::move(row));
  }
  return result;
}
base::CallbackListSubscription AuxOrganizationWindowController::ObserveWindowState(base::RepeatingClosure callback) {
  return observers_.Add(std::move(callback));
}
void AuxOrganizationWindowController::Notify() { observers_.Notify(); }
void AuxOrganizationWindowController::OnTabStripModelChanged(TabStripModel* model,
    const TabStripModelChange& change, const TabStripSelectionChange&) {
  if (!Current() || model != model_) return;
  if (change.type() == TabStripModelChange::kRemoved) for (const auto& removed : change.GetRemove()->contents) {
    if (removed.tab) { views_.erase(removed.tab->GetHandle()); dirty_navigation_.erase(removed.tab->GetHandle()); }
  }
  QueueReconcile();
}
void AuxOrganizationWindowController::OnTabStripModelDestroyed(TabStripModel* model) {
  if (model_ != model) return;
  model_ = nullptr; views_.clear(); dirty_navigation_.clear();
}
}  // namespace aux

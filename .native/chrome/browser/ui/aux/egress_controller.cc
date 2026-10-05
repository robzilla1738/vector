// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/egress_controller.h"
#include <limits>
#include <cmath>

#include <algorithm>
#include <cctype>
#include <utility>

#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/time/time.h"
#include "base/task/sequenced_task_runner.h"
#include "base/unguessable_token.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_projection.h"
#include "chrome/browser/ui/aux/native_creator_close_receipt.h"
#include "chrome/browser/ui/aux/native_cdp_retirement_measurement.h"
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "content/public/browser/navigation_handle.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/document_user_data.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/security_principal.h"
#include "content/public/browser/site_instance.h"
#include "content/public/browser/storage_partition.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "net/http/http_request_headers.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/mojom/cookie_manager.mojom.h"
#include "url/origin.h"

namespace aux {
namespace {
const char kEgressKey = 0;
class EgressDocument : public content::DocumentUserData<EgressDocument> {
 public:
  ~EgressDocument() override = default;
  std::string token = base::UnguessableToken::Create().ToString();
  bool opaque_transport_used = false;
  bool protected_document = false;
  // A document can retain DOM values after its run ends. A later run must
  // create a fresh document instead of inheriting untracked saved credentials.
  std::string credential_run_id;

 private:
  explicit EgressDocument(content::RenderFrameHost* frame)
      : DocumentUserData(frame) {}
  friend class content::DocumentUserData<EgressDocument>;
  DOCUMENT_USER_DATA_KEY_DECL();
};
DOCUMENT_USER_DATA_KEY_IMPL(EgressDocument);
std::string FrameId(content::RenderFrameHost* frame) {
  const auto id = frame->GetGlobalId();
  return base::NumberToString(id.child_id.value()) + ":" +
         base::NumberToString(id.frame_routing_id);
}
std::string Origin(content::RenderFrameHost* frame) {
  return frame->GetLastCommittedURL().IsAboutBlank()
             ? "aux://blank"
             : frame->GetLastCommittedOrigin().Serialize();
}
std::string ReceiptField(std::string value) {
  if (value.empty()) return "none";
  value.resize(std::min(value.size(), size_t{128}));
  for (char& ch : value) {
    if (!((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
          (ch >= '0' && ch <= '9') || ch == ':' || ch == '-')) ch = '_';
  }
  return value;
}
const char kIsolationObserverKey = 0;
class IsolationObserver final : public content::WebContentsObserver,
                                public base::SupportsUserData::Data {
 public:
  IsolationObserver(content::WebContents* page,
                    base::WeakPtr<EgressController> controller,
                    std::string page_id)
      : content::WebContentsObserver(page),
        controller_(std::move(controller)), page_id_(std::move(page_id)) {}
  void WebContentsDestroyed() override {
    if (controller_) controller_->ReleaseIsolation(page_id_);
  }
 private:
  base::WeakPtr<EgressController> controller_;
  std::string page_id_;
};
base::DictValue Fault(const char* reason) {
  return base::DictValue().Set("error", base::DictValue()
                                            .Set("code", "permission_denied")
                                            .Set("message", reason));
}
base::DictValue Result(base::DictValue result) {
  return base::DictValue().Set("result", std::move(result));
}
std::string String(const base::DictValue& value, std::string_view key) {
  const auto* text = value.FindString(key);
  return text ? *text : "";
}
bool LiveFrame(content::RenderFrameHost* frame) {
  return frame && frame->IsActive() && frame->IsRenderFrameLive();
}
}  // namespace
NativePersonReadReceipt::NativePersonReadReceipt(
    content::WeakDocumentPtr document,
    std::string page_id,
    std::string control_generation,
    std::string retirement_generation)
    : document_(document),
      page_id_(std::move(page_id)),
      control_generation_(std::move(control_generation)),
      retirement_generation_(std::move(retirement_generation)) {}
NativePersonReadReceipt::NativePersonReadReceipt(
    const NativePersonReadReceipt&) = default;
NativePersonReadReceipt& NativePersonReadReceipt::operator=(
    const NativePersonReadReceipt&) = default;
NativePersonReadReceipt::NativePersonReadReceipt(
    NativePersonReadReceipt&&) = default;
NativePersonReadReceipt& NativePersonReadReceipt::operator=(
    NativePersonReadReceipt&&) = default;
NativePersonReadReceipt::~NativePersonReadReceipt() = default;
struct EgressController::PageState {
  bool guarded = false;
  bool person_controlled = false;
  std::string control_generation = base::UnguessableToken::Create().ToString();
  content::WeakDocumentPtr document;
  base::DictValue lease;
  base::DictValue acknowledged_context;
  std::string installed_document_token;
  std::string navigation_transition_id;
  content::WeakDocumentPtr navigation_transition_document;
  double navigation_transition_expiry = 0;
  base::TimeTicks navigation_transition_deadline;
  std::string dispatched_lease_id;
  uint64_t cdp_dispatch_count = 0;
  base::TimeTicks last_cdp_dispatch_ticks;
  std::optional<NativeCdpRetirementReceipt> cdp_retirement_receipt;
};
struct EgressController::PersonResume {
  std::string runtime_owner_incarnation;
  std::string page_id;
  content::WeakDocumentPtr document;
  std::string retired_generation;
  std::string authorized_generation;
  std::string owner_generation;
  uint64_t connection_generation = 0;
  base::TimeTicks deadline;
  bool consumed = false;
};
struct EgressController::RunIntent {
  std::string runtime_owner_incarnation;
  uint64_t generation = 0;
  std::string token;
  bool stopped = true;
};
struct EgressController::RunResume {
  std::string runtime_owner_incarnation;
  std::string run_id;
  std::string intent_token;
  std::string owner_generation;
  uint64_t generation = 0;
  base::TimeTicks deadline;
  bool consumed = false;
};
struct EgressController::Isolation {
  std::string runtime_owner_incarnation;
  std::string id;
  std::string run_id;
  std::string task_id;
  int task_revision;
  content::StoragePartitionConfig config;
  std::vector<std::string> ancestry;
  std::set<std::string> terminal_ancestors;
  std::vector<base::WeakPtr<content::WebContents>> registered_pages;
  uint64_t connection_generation = 0;
};
struct EgressController::CdpMeasurementOriginal final
    : content::WebContentsObserver {
  explicit CdpMeasurementOriginal(content::WebContents* original)
      : content::WebContentsObserver(original),
        document(original->GetPrimaryMainFrame()->GetWeakDocumentPtr()),
        page(original->GetWeakPtr()) {}
  void DidFinishNavigation(content::NavigationHandle* navigation) override {
    if (navigation->HasCommitted() && navigation->IsInPrimaryMainFrame() &&
        !navigation->IsSameDocument() &&
        document.AsRenderFrameHostIfValid() != navigation->GetRenderFrameHost())
      document_replaced = true;
  }
  void WebContentsDestroyed() override {
    // A missing WeakPtr alone is never accepted as original destruction proof.
    destroyed_ticks = base::TimeTicks::Now();
  }
  const content::WeakDocumentPtr document;
  const base::WeakPtr<content::WebContents> page;
  base::TimeTicks destroyed_ticks;
  bool document_replaced = false;
};
struct EgressController::CreatorState {
  std::string runtime_owner_incarnation;
  std::string creation_id = base::UnguessableToken::Create().ToString();
  uint64_t connection_generation = 0;
  int64_t blank_navigation_id = 0;
  int64_t early_blank_navigation_id = 0;
  content::WeakDocumentPtr early_blank_document;
  bool early_blank_ambiguous = false;
  content::WeakDocumentPtr document;
  content::WeakDocumentPtr source_document;
  bool has_source = false;
  base::WeakPtr<BrowserWindowInterface> original_owner;
  base::WeakPtr<content::WebContents> page;
  base::DictValue proof;
  std::string control_generation;
  base::TimeTicks deadline;
  bool installed = false;
  bool consumed = false;
  bool closing = false;
  bool blank_committed = false;
  base::OnceCallback<void(bool)> ready;
  base::OneShotTimer ready_timer;
};
namespace {
const char kCreatorNavigationObserverKey = 0;
class CreatorNavigationObserver final : public content::WebContentsObserver,
                                        public base::SupportsUserData::Data {
 public:
  CreatorNavigationObserver(content::WebContents* page,
      base::WeakPtr<EgressController> controller, std::string page_id)
      : content::WebContentsObserver(page), controller_(controller), page_id_(std::move(page_id)) {}
  void DidFinishNavigation(content::NavigationHandle* handle) override {
    if (controller_ && handle->HasCommitted() && handle->IsInPrimaryMainFrame() &&
        !handle->IsSameDocument())
      controller_->CreatorBlankCommitted(page_id_, handle->GetNavigationId(),
          handle->GetRenderFrameHost()->GetWeakDocumentPtr());
  }
 private:
  base::WeakPtr<EgressController> controller_;
  const std::string page_id_;
};
}  // namespace
struct EgressController::Credential {
  std::string origin;
  size_t length;
  std::set<std::string> hashes;
};
struct EgressController::Pending {
  EgressRequestContext context;
  network::ResourceRequest request;
  net::HttpRequestHeaders headers;
  bool final_headers;
  base::TimeTicks deadline;
  std::string lease_id;
  base::OnceCallback<void(bool)> callback;
};
struct EgressController::InFlight {
  EgressRequestContext context;
  base::DictValue lease;
  std::string phase;
  base::OnceCallback<void(bool)> callback;
};
EgressController* EgressController::ForProfile(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile) {
    return nullptr;
  }
  auto* existing =
      static_cast<EgressController*>(profile->GetUserData(&kEgressKey));
  if (existing) {
    return existing;
  }
  auto owned = std::unique_ptr<EgressController>(new EgressController(profile));
  auto* result = owned.get();
  profile->SetUserData(&kEgressKey, std::move(owned));
  return result;
}
EgressController::EgressController(Profile* profile)
    : profile_(profile),
      person_read_retirement_generation_(
          base::UnguessableToken::Create().ToString()) {
  person_read_mutation_subscription_ = owner_mutations_.Observe(
      base::BindRepeating(&EgressController::RetirePersonReads,
                         weak_factory_.GetWeakPtr()));
}
EgressController::~EgressController() {
  weak_factory_.InvalidateWeakPtrs();
  Disconnect();
}
base::WeakPtr<EgressController> EgressController::GetWeakPtr() {
  return weak_factory_.GetWeakPtr();
}
std::pair<std::string, content::StoragePartitionConfig>
EgressController::ReserveIsolation(const std::string& run_id,
                                   const std::string& task_id,
                                   int task_revision) {
  auto it = isolations_by_run_.find(run_id);
  if (it != isolations_by_run_.end()) {
    const auto& isolation = *it->second;
    if (isolation.task_id != task_id ||
        isolation.task_revision != task_revision) {
      return {};
    }
    return {isolation.id, isolation.config};
  }
  if (run_id.empty() || task_revision < 0 || isolations_by_run_.size() >= 128) {
    return {};
  }
  const std::string id = base::UnguessableToken::Create().ToString();
  return {id, content::StoragePartitionConfig::Create(profile_, "aux", id,
                                                       true)};
}
bool EgressController::RegisterIsolation(content::WebContents* page,
                                         const std::string& isolation_id,
                                         const std::string& run_id,
                                         const std::string& task_id,
                                         int task_revision,
                                         const std::vector<std::string>& ancestry,
                                         uint64_t connection_generation) {
  if (!connection_generation || connection_generation != admitted_runtime_generation_ || ancestry.empty() || ancestry.size() > 32 ||
      ancestry.front() != run_id ||
      std::set<std::string>(ancestry.begin(), ancestry.end()).size() != ancestry.size() ||
      std::ranges::any_of(ancestry, [](const auto& id) { return id.empty() || id.size() > 160; }))
    return false;
  auto* frame = page ? page->GetPrimaryMainFrame() : nullptr;
  if (!frame || isolation_id.empty() || run_id.empty()) {
    LOG(ERROR) << "AUX_ISOLATION_DIAG reason=missing_frame_or_scope";
    return false;
  }
  const auto expected = content::StoragePartitionConfig::Create(
      profile_, "aux", isolation_id, true);
  if (!frame->GetSiteInstance()) {
    LOG(ERROR) << "AUX_ISOLATION_DIAG reason=no_site_instance";
    return false;
  }
  const auto& site_config = frame->GetSiteInstance()->GetSecurityPrincipal()
                                .GetStoragePartitionConfig();
  const auto& storage_config = frame->GetStoragePartition()->GetConfig();
  if (site_config != expected || storage_config != expected) {
    LOG(ERROR) << "AUX_ISOLATION_DIAG reason=partition_mismatch"
               << " site_domain=" << site_config.partition_domain()
               << " site_name=" << site_config.partition_name()
               << " storage_domain=" << storage_config.partition_domain()
               << " storage_name=" << storage_config.partition_name();
    return false;
  }
  auto it = isolations_by_run_.find(run_id);
  if (it == isolations_by_run_.end()) {
    if (isolations_by_run_.size() >= 128) {
      LOG(ERROR) << "AUX_ISOLATION_DIAG reason=capacity";
      return false;
    }
    auto isolation = std::make_unique<Isolation>();
    isolation->id = isolation_id;
    isolation->run_id = run_id;
    isolation->task_id = task_id;
    isolation->task_revision = task_revision;
    isolation->config = expected;
    isolation->ancestry = ancestry;
    isolation->connection_generation = connection_generation;
    isolation->runtime_owner_incarnation = runtime_owner_incarnation_;
    if (!RunIntentCurrent(*isolation)) return false;
    it = isolations_by_run_.emplace(run_id, std::move(isolation)).first;
  } else if (it->second->id != isolation_id ||
             it->second->task_id != task_id ||
             it->second->task_revision != task_revision ||
             it->second->ancestry != ancestry ||
             it->second->connection_generation != connection_generation ||
             it->second->runtime_owner_incarnation != runtime_owner_incarnation_) {
    LOG(ERROR) << "AUX_ISOLATION_DIAG reason=run_scope_mismatch";
    return false;
  }
  if (!RunIntentCurrent(*it->second)) return false;
  const std::string page_id = PageIdentity::GetOrCreate(profile_, page);
  if (isolation_run_by_page_.contains(page_id)) {
    LOG(ERROR) << "AUX_ISOLATION_DIAG reason=duplicate_page";
    return false;
  }
  std::erase_if(it->second->registered_pages, [](const auto& original) { return !original; });
  it->second->registered_pages.push_back(page->GetWeakPtr());
  isolation_run_by_page_[page_id] = run_id;
  auto& state = pages_[page_id];
  if (!state) {
    state = std::make_unique<PageState>();
  }
  state->guarded = true;
  page->SetUserData(&kIsolationObserverKey,
                    std::make_unique<IsolationObserver>(page, GetWeakPtr(), page_id));
  authority_observers_.Notify();
  return true;
}
base::DictValue EgressController::RegisterCreatorPage(
    content::WebContents* page, int64_t navigation_id,
    uint64_t connection_generation, const base::DictValue* source,
    BrowserWindowInterface* unpublished_owner) {
  if (!page || page->GetBrowserContext() != profile_ || !connection_generation ||
      connection_generation != admitted_runtime_generation_ ||
      (navigation_id <= 0 && (!unpublished_owner || navigation_id != 0)) ||
      connection_generation > 9007199254740991ULL || creators_.size() >= 128 || !page->GetPrimaryMainFrame())
    return Fault("Original native creation identity is unavailable");
  const std::string page_id = PageIdentity::GetOrCreate(profile_, page);
  const auto* isolation = IsolationForPage(page_id, page->GetPrimaryMainFrame());
  auto state = pages_.find(page_id);
  if (!isolation || state == pages_.end() || state->second->person_controlled ||
      creators_.contains(page_id) || !state->second->lease.empty())
    return Fault("Original native creation scope changed");
  auto creator = std::make_unique<CreatorState>();
  BrowserWindowInterface* original_owner = unpublished_owner;
  if ((!unpublished_owner &&
       TabCatalog::GetForProfile(profile_)->FindPage(page_id, &original_owner) != page) ||
      !original_owner || original_owner->GetProfile() != profile_ ||
      !PageIdentity::FromWebContents(page)->runtime_owned())
    return Fault("Original creation owner changed");
  creator->original_owner = original_owner->GetWeakPtr();
  creator->page = page->GetWeakPtr();
  creator->connection_generation = connection_generation;
  creator->runtime_owner_incarnation = runtime_owner_incarnation_;
  creator->blank_navigation_id = navigation_id;
  creator->document = page->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  creator->control_generation = state->second->control_generation;
  if (source) {
    auto* source_page = TabCatalog::GetForProfile(profile_)->FindPage(String(*source, "tabId"));
    auto* source_frame = source_page ? source_page->GetPrimaryMainFrame() : nullptr;
    if (!LiveFrame(source_frame) || source_page->GetLastCommittedURL().spec() != String(*source, "expectedUrl") ||
        EgressDocument::GetOrCreateForCurrentDocument(source_frame)->token != String(*source, "documentToken"))
      return Fault("Original selected creation source changed");
    creator->source_document = source_frame->GetWeakDocumentPtr();
    creator->has_source = true;
  }
  const std::string creation_id = creator->creation_id;
  creators_[page_id] = std::move(creator);
  page->SetUserData(&kCreatorNavigationObserverKey,
      std::make_unique<CreatorNavigationObserver>(page, GetWeakPtr(), page_id));
  RefreshCreatorProof(page_id, "creation", page->GetPrimaryMainFrame()->GetWeakDocumentPtr(),
      static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch() + 8000),
      base::TimeTicks::Now() + base::Seconds(8));
  return Result(base::DictValue().Set("creationId", creation_id));
}
bool EgressController::BindCreatorBlankNavigation(const std::string& page_id,
    const std::string& creation_id, uint64_t generation, int64_t navigation_id) {
  auto it = creators_.find(page_id);
  if (it == creators_.end() || navigation_id <= 0 ||
      it->second->creation_id != creation_id || it->second->blank_navigation_id != 0 ||
      it->second->connection_generation != generation ||
      it->second->runtime_owner_incarnation != runtime_owner_incarnation_ ||
      generation != admitted_runtime_generation_ || it->second->early_blank_ambiguous)
    return false;
  const int64_t early_id = it->second->early_blank_navigation_id;
  if (early_id && early_id != navigation_id) return false;
  if (!early_id && !CurrentCreator(page_id, String(it->second->proof, "receiptId"), generation))
    return false;
  it->second->blank_navigation_id = navigation_id;
  const auto weak = GetWeakPtr();
  if (early_id) {
    const auto early_document = it->second->early_blank_document;
    CreatorBlankCommitted(page_id, navigation_id, early_document);
  }
  // Ready completion is external and may synchronously retire this exact
  // creator or controller. Never reuse its original iterator afterward.
  if (!weak) return false;
  const auto current = weak->creators_.find(page_id);
  if (current == weak->creators_.end() || current->second->creation_id != creation_id)
    return false;
  return weak->CurrentCreator(page_id, String(current->second->proof, "receiptId"), generation);
}
void EgressController::RefreshCreatorProof(const std::string& page_id,
    const std::string& phase, const content::WeakDocumentPtr& document, double expires_at,
    base::TimeTicks original_deadline) {
  auto it = creators_.find(page_id);
  auto state = pages_.find(page_id);
  auto* frame = document.AsRenderFrameHostIfValid();
  const auto* isolation = frame ? IsolationForPage(page_id, frame) : nullptr;
  if (it != creators_.end()) it->second->proof.clear();
  if (it == creators_.end() || state == pages_.end() || !isolation ||
      (!frame || !frame->IsActive()) || !std::isfinite(expires_at) || std::floor(expires_at) != expires_at) return;
  auto& creator = *it->second;
  creator.document = document;
  creator.control_generation = state->second->control_generation;
  creator.deadline = original_deadline;
  creator.proof = base::DictValue().Set("creationId", creator.creation_id)
      .Set("receiptId", base::UnguessableToken::Create().ToString()).Set("phase", phase)
      .Set("profileId", profile_->GetPath().BaseName().AsUTF8Unsafe()).Set("pageId", page_id)
      .Set("documentToken", EgressDocument::GetOrCreateForCurrentDocument(frame)->token)
      .Set("runId", isolation->run_id).Set("taskRevision", isolation->task_revision)
      .Set("isolationId", isolation->id).Set("controlGeneration", creator.control_generation)
      .Set("connectionGeneration", static_cast<double>(creator.connection_generation))
      .Set("expiresAt", expires_at);
  if (!isolation->task_id.empty()) creator.proof.Set("taskId", isolation->task_id);
}
void EgressController::WaitCreatorReady(const std::string& page_id,
    const std::string& creation_id, uint64_t generation, base::OnceCallback<void(bool)> done) {
  auto it = creators_.find(page_id);
  if (it == creators_.end() || it->second->creation_id != creation_id || it->second->ready ||
      !CurrentCreator(page_id, String(it->second->proof, "receiptId"), generation)) {
    std::move(done).Run(false); return;
  }
  if (it->second->blank_committed) { std::move(done).Run(true); return; }
  it->second->ready = std::move(done);
  it->second->ready_timer.Start(FROM_HERE,
      std::max(base::TimeDelta(), it->second->deadline - base::TimeTicks::Now()),
      base::BindOnce([](base::WeakPtr<EgressController> controller, std::string page_id, std::string creation_id) {
        if (!controller) return;
        auto it = controller->creators_.find(page_id);
        if (it == controller->creators_.end() || it->second->creation_id != creation_id) return;
        auto done = std::move(it->second->ready);
        it->second->proof.clear();
        if (done) std::move(done).Run(false);
      }, GetWeakPtr(), page_id, creation_id));
}
void EgressController::CreatorBlankCommitted(const std::string& page_id,
    int64_t navigation_id, const content::WeakDocumentPtr& document) {
  auto it = creators_.find(page_id);
  if (it == creators_.end() || it->second->installed || it->second->consumed ||
      (it->second->blank_navigation_id && navigation_id != it->second->blank_navigation_id)) return;
  auto* frame = document.AsRenderFrameHostIfValid();
  if (!it->second->blank_navigation_id) {
    if (it->second->early_blank_navigation_id) {
      it->second->early_blank_ambiguous = true;
      it->second->proof.clear();
      return;
    }
    it->second->early_blank_navigation_id = navigation_id;
    it->second->early_blank_document = document;
    return;
  }
  const auto state = pages_.find(page_id);
  if (state == pages_.end() || state->second->person_controlled ||
      state->second->control_generation != it->second->control_generation ||
      !LiveFrame(frame) || !frame->GetLastCommittedURL().IsAboutBlank() ||
      content::WebContents::FromRenderFrameHost(frame) != it->second->page.get()) {
    it->second->proof.clear(); return;
  }
  const double expires = it->second->proof.FindDouble("expiresAt").value_or(0);
  RefreshCreatorProof(page_id, "creation", document, expires, it->second->deadline);
  it->second->blank_committed = true;
  it->second->ready_timer.Stop();
  const bool current = CurrentCreator(page_id, String(it->second->proof, "receiptId"), it->second->connection_generation);
  auto done = std::move(it->second->ready);
  if (done) std::move(done).Run(current);
}
bool EgressController::CurrentCreator(const std::string& page_id,
    const std::string& receipt_id, uint64_t generation) {
  auto it = creators_.find(page_id); auto state = pages_.find(page_id);
  if (it == creators_.end() || state == pages_.end() || owner_mutations_.pending()) return false;
  const auto& creator = *it->second;
  auto* page = creator.page.get(); auto* frame = creator.document.AsRenderFrameHostIfValid();
  BrowserWindowInterface* owner = nullptr;
  auto* catalog = TabCatalog::GetForProfile(profile_);
  auto* identity = page ? PageIdentity::FromWebContents(page) : nullptr;
  if (creator.consumed || creator.proof.empty() || creator.connection_generation != generation ||
      generation != admitted_runtime_generation_ ||
      creator.runtime_owner_incarnation != runtime_owner_incarnation_ ||
      String(creator.proof, "receiptId") != receipt_id || state->second->person_controlled ||
      state->second->control_generation != creator.control_generation || !state->second->lease.empty() ||
      creator.deadline.is_null() || base::TimeTicks::Now() >= creator.deadline ||
      creator.proof.FindDouble("expiresAt").value_or(0) <= base::Time::Now().InMillisecondsFSinceUnixEpoch() ||
      !page || !frame || !frame->IsActive() ||
      (creator.blank_committed && !LiveFrame(frame)) || page->GetPrimaryMainFrame() != frame || !identity || !identity->runtime_owned() ||
      !catalog || catalog->FindPage(page_id, &owner) != page || !owner || owner != creator.original_owner.get() || owner->GetProfile() != profile_ ||
      !IsolationForPage(page_id, frame)) return false;
  if (creator.has_source) {
    auto* source_frame = creator.source_document.AsRenderFrameHostIfValid();
    auto* source_page = source_frame ? content::WebContents::FromRenderFrameHost(source_frame) : nullptr;
    if (!LiveFrame(source_frame) || !source_page || source_page->GetBrowserContext() != profile_ ||
        source_page->GetPrimaryMainFrame() != source_frame) return false;
  }
  const auto* isolation = IsolationForPage(page_id, frame);
  if (!RunIntentCurrent(*isolation, true) || String(creator.proof, "runId") != isolation->run_id ||
      String(creator.proof, "taskId") != isolation->task_id ||
      creator.proof.FindInt("taskRevision").value_or(-1) != isolation->task_revision ||
      String(creator.proof, "isolationId") != isolation->id ||
      String(creator.proof, "documentToken") != EgressDocument::GetOrCreateForCurrentDocument(frame)->token ||
      (String(creator.proof, "phase") == "creation" && !page->GetLastCommittedURL().IsAboutBlank() &&
          (creator.blank_committed || !page->GetLastCommittedURL().is_empty()))) return false;
  auto* model = owner->GetTabStripModel(); const int index = model->GetIndexOfWebContents(page);
  return index != TabStripModel::kNoTab && !model->GetSplitForTab(index) && !model->GetTabGroupForTab(index);
}
base::DictValue EgressController::CreatorCleanupProof(const base::DictValue& params,
    uint64_t generation) {
  const std::string page_id = String(params, "pageId"); auto it = creators_.find(page_id);
  if (params.size() != 2 || it == creators_.end() ||
      String(params, "creationId") != it->second->creation_id ||
      !CurrentCreator(page_id, String(it->second->proof, "receiptId"), generation))
    return Fault("The original temporary-page cleanup authority is unavailable");
  return Result(it->second->proof.Clone());
}
void EgressController::CloseCreatorPage(const base::DictValue& params,
    uint64_t generation, std::shared_ptr<std::atomic_bool> cancelled,
    base::OnceCallback<void(base::DictValue)> done) {
  const auto* proof = params.FindDict("proof");
  const std::string page_id = proof ? String(*proof, "pageId") : "";
  auto it = creators_.find(page_id);
  if (cancelled->load() || params.size() != 1 || !proof || it == creators_.end() || it->second->proof != *proof ||
      !CurrentCreator(page_id, String(*proof, "receiptId"), generation)) {
    std::move(done).Run(Fault("Original native creator cleanup was retired")); return;
  }
  auto* page = it->second->page.get(); BrowserWindowInterface* owner = nullptr;
  TabCatalog::GetForProfile(profile_)->FindPage(page_id, &owner);
  if (!owner || NativeCreatorCloseReceipt::FromWebContents(page)) {
    std::move(done).Run(Fault("Original native close invocation is already pending")); return;
  }
  const auto receipt_id = String(*proof, "receiptId");
  it->second->closing = true;
  NativeCreatorCloseReceipt::CreateForWebContents(page, it->second->deadline,
      base::BindRepeating([](base::WeakPtr<EgressController> controller,
          std::string page_id, std::string receipt_id, uint64_t generation,
          std::shared_ptr<std::atomic_bool> cancelled,
          base::WeakPtr<content::WebContents> original_page,
          content::WeakDocumentPtr original_document) {
        auto* view = original_page ? original_page->GetRenderWidgetHostView() : nullptr;
        return !cancelled->load() && controller &&
            controller->CurrentCreator(page_id, receipt_id, generation) && view &&
            view->HasNativeInputAdmissionForDocument(original_document);
      }, GetWeakPtr(), page_id, receipt_id, generation, cancelled,
          page->GetWeakPtr(), it->second->document),
      base::BindOnce([](base::WeakPtr<EgressController> controller, std::string page_id,
          std::string receipt_id, base::OnceCallback<void(base::DictValue)> done, bool closed) {
        if (controller) {
          auto it = controller->creators_.find(page_id);
          if (it != controller->creators_.end() && String(it->second->proof, "receiptId") == receipt_id)
            { it->second->consumed = true; it->second->closing = false; }
        }
        std::move(done).Run(closed ? Result(base::DictValue().Set("closed", true))
            : Fault("Original temporary-page close did not complete"));
      }, GetWeakPtr(), page_id, receipt_id, std::move(done)));
  auto* receipt = NativeCreatorCloseReceipt::FromWebContents(page);
  auto weak_receipt = receipt->GetWeakPtr();
  const auto invocation = receipt->token();
  receipt->authority_subscription_ = ObserveAuthority(base::BindRepeating(
      [](base::WeakPtr<EgressController> controller,
         base::WeakPtr<NativeCreatorCloseReceipt> receipt,
         std::string page_id, std::string receipt_id, uint64_t generation,
         base::UnguessableToken invocation) {
        if (receipt && (!controller ||
            !controller->CurrentCreator(page_id, receipt_id, generation)))
          receipt->Refuse(invocation);
      }, GetWeakPtr(), weak_receipt, page_id, receipt_id, generation, invocation));
  const auto original_document = it->second->document;
  auto original_page = page->GetWeakPtr();
  auto original_model = owner->GetTabStripModel()->GetWeakPtrForCreatorCleanup();
  auto* view = page->GetRenderWidgetHostView();
  if (!view) { weak_receipt->Refuse(invocation); return; }
  // Arm the original close deadline before waiting for actual associated
  // document binding. A late acknowledgement cannot extend this receipt.
  view->AwaitNativeInputAdmissionForDocument(original_document, base::BindOnce(
      [](base::WeakPtr<EgressController> controller,
          base::WeakPtr<NativeCreatorCloseReceipt> receipt,
          base::WeakPtr<TabStripModel> model,
          base::WeakPtr<content::WebContents> page,
          content::WeakDocumentPtr document, std::string page_id,
          std::string receipt_id, uint64_t generation,
          base::UnguessableToken invocation, bool ready) {
        if (!receipt) return;
        auto* view = page ? page->GetRenderWidgetHostView() : nullptr;
        if (!ready || !controller || !model || !page ||
            NativeCreatorCloseReceipt::FromWebContents(page.get()) != receipt.get() ||
            document.AsRenderFrameHostIfValid() != page->GetPrimaryMainFrame() ||
            !view || !view->HasNativeInputAdmissionForDocument(document) ||
            !controller->CurrentCreator(page_id, receipt_id, generation)) {
          receipt->Refuse(invocation);
          return;
        }
        if (!model->CloseWebContentsForCreatorCleanup(page.get(), TabCloseTypes::CLOSE_NONE,
                invocation) && receipt)
          receipt->Refuse(invocation);
      }, GetWeakPtr(), weak_receipt, original_model, original_page,
          original_document, page_id, receipt_id, generation, invocation));
}
void EgressController::IsolationReceipt(const std::string& event,
                                        const std::string& run_id,
                                        const std::string& page_id,
                                        const std::string& isolation_id,
                                        content::RenderFrameHost* frame,
                                        const std::string& reason) {
  if (isolation_receipt_count_++ >= 512) return;
  const auto* process = frame ? frame->GetProcess() : nullptr;
  const std::string document = frame && frame->IsRenderFrameLive()
      ? EgressDocument::GetOrCreateForCurrentDocument(frame)->token : "none";
  const std::string partition = frame && frame->GetStoragePartition() &&
      frame->GetStoragePartition()->GetConfig().in_memory()
      ? "memory-fixed" : "default";
  LOG(ERROR) << "AUX_ISOLATION event=" << ReceiptField(event)
             << " profile=" << ReceiptField(profile_->GetPath().BaseName().AsUTF8Unsafe())
             << " run=" << ReceiptField(run_id)
             << " page=" << ReceiptField(page_id)
             << " isolation=" << ReceiptField(isolation_id)
             << " process=" << (process ? process->GetID().value() : -1)
             << " document=" << ReceiptField(document)
             << " partition=" << partition
             << " reason=" << ReceiptField(reason);
}
bool EgressController::RunIntentCurrent(const Isolation& isolation, bool cleanup_only) const {
  if (!cleanup_only && !isolation.terminal_ancestors.empty()) return false;
  if (!admitted_runtime_generation_ || isolation.connection_generation != admitted_runtime_generation_ ||
      isolation.runtime_owner_incarnation != runtime_owner_incarnation_) return false;
  for (const auto& ancestor : isolation.ancestry) {
    auto it = run_intents_.find(ancestor);
    if (it == run_intents_.end() || it->second->generation != isolation.connection_generation ||
        it->second->runtime_owner_incarnation != runtime_owner_incarnation_)
      continue;
    if (it->second->stopped) return false;
    for (const auto& [id, resume] : run_resumes_) {
      if (resume->run_id == ancestor && resume->consumed &&
          (resume->deadline <= base::TimeTicks::Now() ||
           resume->owner_generation != person_read_retirement_generation_)) return false;
    }
  }
  return true;
}
base::DictValue EgressController::RetireTerminalRun(const std::string& run_id,
    uint64_t generation) {
  if (!generation || generation != admitted_runtime_generation_ || run_id.empty() ||
      run_id.size() > 160 || profile_->IsOffTheRecord())
    return Fault("Original terminal run connection is unavailable");
  for (auto& [id, isolation] : isolations_by_run_) {
    if (isolation->connection_generation == generation &&
        isolation->runtime_owner_incarnation == runtime_owner_incarnation_ &&
        std::ranges::find(isolation->ancestry, run_id) != isolation->ancestry.end())
      isolation->terminal_ancestors.insert(run_id);
  }
  PruneTerminalRegistrations();
  return Result(base::DictValue().Set("accepted", true));
}
void EgressController::PruneTerminalRegistrations() {
  std::set<std::string> roots;
  for (const auto& [id, isolation] : isolations_by_run_) {
    if (isolation->connection_generation == admitted_runtime_generation_ &&
        isolation->runtime_owner_incarnation == runtime_owner_incarnation_ && !isolation->ancestry.empty())
      roots.insert(isolation->ancestry.back());
  }
  for (const auto& root : roots) {
    std::set<std::string> family;
    bool complete = true;
    for (const auto& [id, isolation] : isolations_by_run_) {
      if (isolation->connection_generation != admitted_runtime_generation_ ||
          isolation->runtime_owner_incarnation != runtime_owner_incarnation_ ||
          isolation->ancestry.empty() || isolation->ancestry.back() != root) continue;
      family.insert(id);
      if (isolation->terminal_ancestors.size() != isolation->ancestry.size() ||
          std::ranges::any_of(isolation->registered_pages, [](const auto& original) { return !!original; })) complete = false;
    }
    for (const auto& [page, run] : isolation_run_by_page_) if (family.contains(run)) complete = false;
    for (const auto& [id, resume] : run_resumes_) if (resume->run_id == root || family.contains(resume->run_id)) complete = false;
    if (!complete) continue;
    if (cdp_measurement_ && cdp_measurement_->root_run() == root) {
      const std::vector<std::string> retired_family(family.begin(), family.end());
      if (cdp_measurement_->mode() == NativeCdpRetirementMeasurement::Mode::kStop &&
          retired_family == cdp_measurement_->registered_runs() &&
          cdp_measurement_->connection_generation() == admitted_runtime_generation_ &&
          cdp_measurement_->owner_incarnation() == runtime_owner_incarnation_ &&
          HasStoppedRunIntent(root, admitted_runtime_generation_))
        cdp_measurement_terminal_family_ = true;
      else
        cdp_measurement_->Refuse();
    }
    for (const auto& id : family) { isolations_by_run_.erase(id); run_intents_.erase(id); }
    run_intents_.erase(root);
  }
}
base::DictValue EgressController::CheckRunResume(const std::string& run_id,
    uint64_t generation) const {
  if (!generation || generation != admitted_runtime_generation_ || run_id.empty() ||
      run_id.size() > 160 || profile_->IsOffTheRecord() || owner_mutations_.pending() ||
      HasStoppedRunIntent(run_id, generation))
    return Fault("Original local-person run resume is required");
  for (const auto& [id, isolation] : isolations_by_run_) {
    if (isolation->run_id == run_id && isolation->connection_generation == generation &&
        isolation->runtime_owner_incarnation == runtime_owner_incarnation_ &&
        !RunIntentCurrent(*isolation))
      return Fault("Original ancestor run control remains stopped");
  }
  for (const auto& [id, resume] : run_resumes_) {
    if (resume->run_id == run_id && resume->generation == generation &&
        (!resume->consumed || resume->deadline <= base::TimeTicks::Now() ||
         resume->owner_generation != person_read_retirement_generation_))
      return Fault("Original run resume has not completed");
  }
  return base::DictValue().Set("result", base::DictValue().Set("accepted", true));
}
bool EgressController::HasStoppedRunIntent(const std::string& run_id,
    uint64_t generation) const {
  const auto it = run_intents_.find(run_id);
  return it != run_intents_.end() && it->second->generation == generation &&
      it->second->runtime_owner_incarnation == runtime_owner_incarnation_ && it->second->stopped;
}
bool EgressController::RetireRegisteredRun(const std::string& run_id,
    uint64_t generation) {
  return RetireRegisteredRunImpl(run_id, generation, nullptr);
}
bool EgressController::RetireRegisteredRunForMeasuredStop(
    const std::string& run_id, uint64_t generation,
    const NativeStopInputReceipt& input) {
  const bool original_input = CurrentCdpMeasurementInput() &&
      input.controller_.get() == this && input.owner_ &&
      input.owner_->GetProfile() == profile_ && input.run_id_ == run_id &&
      input.connection_generation_ == generation &&
      input.host_incarnation_ == runtime_owner_incarnation_ &&
      !input.id_.is_empty() &&
      input.shell_document_.AsRenderFrameHostIfValid() &&
      base::TimeTicks::Now() < input.deadline_;
  if (!original_input && cdp_measurement_) cdp_measurement_->Refuse();
  // Measurement refusal must never suppress the unchanged ordinary Stop.
  return RetireRegisteredRunImpl(run_id, generation,
                                original_input ? &input : nullptr);
}
bool EgressController::RetireRegisteredRunImpl(const std::string& run_id,
    uint64_t generation, const NativeStopInputReceipt* input) {
  if (!generation || generation != admitted_runtime_generation_ || run_id.empty() || run_id.size() > 160 || profile_->IsOffTheRecord() ||
      (!run_intents_.contains(run_id) && run_intents_.size() >= 256)) return false;
  auto intent = std::make_unique<RunIntent>();
  intent->generation = generation;
  intent->runtime_owner_incarnation = runtime_owner_incarnation_;
  intent->token = base::UnguessableToken::Create().ToString();
  run_intents_[run_id] = std::move(intent);
  std::set<std::string> retired;
  for (const auto& [page_id, child_id] : isolation_run_by_page_) {
    const auto isolation = isolations_by_run_.find(child_id);
    if (isolation == isolations_by_run_.end() || isolation->second->connection_generation != generation ||
        isolation->second->runtime_owner_incarnation != runtime_owner_incarnation_ ||
        std::ranges::find(isolation->second->ancestry, run_id) == isolation->second->ancestry.end()) continue;
    const auto state = pages_.find(page_id);
    if (state == pages_.end()) continue;
    retired.insert(page_id);
    const auto retired_generation = base::UnguessableToken::Create().ToString();
    if (input && cdp_measurement_) {
      auto* frame = state->second->document.AsRenderFrameHostIfValid();
      if (!LiveFrame(frame)) {
        cdp_measurement_->Refuse();
      } else {
        auto scope = base::DictValue()
            .Set("profileId", profile_->GetPath().BaseName().AsUTF8Unsafe())
            .Set("tabId", page_id).Set("isolationId", isolation->second->id)
            .Set("runId", isolation->second->run_id)
            .Set("taskRevision", isolation->second->task_revision)
            .Set("frameId", FrameId(frame))
            .Set("documentToken", EgressDocument::GetOrCreateForCurrentDocument(frame)->token)
            .Set("sourceOrigin", Origin(frame))
            .Set("controlGeneration", state->second->control_generation)
            .Set("retiredControlGeneration", retired_generation);
        if (!isolation->second->task_id.empty())
          scope.Set("taskId", isolation->second->task_id);
        const bool dispatched_original = state->second->dispatched_lease_id ==
            String(state->second->lease, "leaseId");
        cdp_measurement_->RetiredPage(page_id, state->second->lease, scope,
            input->event_ticks_, input->admitted_ticks_,
            dispatched_original ? state->second->last_cdp_dispatch_ticks : base::TimeTicks(),
            dispatched_original ? state->second->cdp_dispatch_count : 0, true);
      }
    }
    state->second->control_generation = retired_generation;
    state->second->acknowledged_context.clear();
    state->second->lease.clear();
    state->second->navigation_transition_id.clear();
    state->second->navigation_transition_document = {};
    state->second->navigation_transition_expiry = 0;
    state->second->navigation_transition_deadline = {};
    auto creator = creators_.find(page_id);
    if (creator != creators_.end()) creator->second->proof.clear();
  }
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks(retired, false);
  if (weak) authority_observers_.Notify();
  return true;
}
std::optional<std::string> EgressController::PrepareRunResume(
    const std::string& run_id, uint64_t generation) {
  const auto now = base::TimeTicks::Now();
  std::erase_if(run_resumes_, [now](const auto& row) { return !row.second->consumed && row.second->deadline <= now; });
  const auto intent = run_intents_.find(run_id);
  if (!HasStoppedRunIntent(run_id, generation) || owner_mutations_.pending() ||
      run_resumes_.size() >= 256) return std::nullopt;
  for (const auto& [id, prior] : run_resumes_) if (prior->run_id == run_id) return std::nullopt;
  auto resume = std::make_unique<RunResume>();
  resume->run_id = run_id;
  resume->intent_token = intent->second->token;
  resume->owner_generation = person_read_retirement_generation_;
  resume->generation = generation;
  resume->runtime_owner_incarnation = runtime_owner_incarnation_;
  resume->deadline = now + base::Seconds(8);
  const auto id = base::UnguessableToken::Create().ToString();
  run_resumes_.emplace(id, std::move(resume));
  return id;
}
base::DictValue EgressController::ConsumeRunResume(const std::string& run_id,
    const std::string& ticket_id, uint64_t generation) {
  auto resume = run_resumes_.find(ticket_id);
  auto intent = run_intents_.find(run_id);
  if (resume == run_resumes_.end() || intent == run_intents_.end() ||
      resume->second->run_id != run_id || resume->second->generation != generation ||
      resume->second->runtime_owner_incarnation != runtime_owner_incarnation_ ||
      resume->second->consumed || resume->second->deadline <= base::TimeTicks::Now() ||
      resume->second->owner_generation != person_read_retirement_generation_ || owner_mutations_.pending() ||
      intent->second->generation != generation || intent->second->runtime_owner_incarnation != runtime_owner_incarnation_ || !intent->second->stopped ||
      intent->second->token != resume->second->intent_token)
    return Fault("Original local-person run resume is unavailable");
  resume->second->consumed = true;
  intent->second->stopped = false;
  const auto deadline = resume->second->deadline;
  const auto expires = base::Time::Now().InMillisecondsSinceUnixEpoch() +
      (deadline - base::TimeTicks::Now()).InMilliseconds();
  for (const auto& [page_id, state] : pages_) {
    auto creator = creators_.find(page_id);
    auto* frame = state->document.AsRenderFrameHostIfValid();
    const auto* isolation = frame ? IsolationForPage(page_id, frame) : nullptr;
    if (creator == creators_.end() || !isolation || !LiveFrame(frame) ||
        creator->second->closing || creator->second->consumed ||
        creator->second->connection_generation != generation ||
        creator->second->runtime_owner_incarnation != runtime_owner_incarnation_ ||
        state->person_controlled || !state->lease.empty() ||
        creator->second->document.AsRenderFrameHostIfValid() != frame ||
        isolation->connection_generation != generation ||
        isolation->runtime_owner_incarnation != runtime_owner_incarnation_ ||
        std::ranges::find(isolation->ancestry, run_id) == isolation->ancestry.end())
      continue;
    // Only the consumed original local-person ticket renews publication.
    // Install still requires CurrentCreator and its unchanged owner guards.
    RefreshCreatorProof(page_id, "resumed_control", state->document,
        static_cast<double>(expires), deadline);
  }
  return Result(base::DictValue().Set("accepted", true));
}
bool EgressController::FinishRunResume(const std::string& ticket_id, bool success) {
  auto found = run_resumes_.find(ticket_id);
  if (found == run_resumes_.end()) return false;
  auto resume = std::move(found->second);
  run_resumes_.erase(found);
  auto intent = run_intents_.find(resume->run_id);
  if (intent == run_intents_.end() || intent->second->generation != resume->generation ||
      resume->runtime_owner_incarnation != runtime_owner_incarnation_ ||
      intent->second->runtime_owner_incarnation != runtime_owner_incarnation_ ||
      intent->second->token != resume->intent_token) return false;
  if (success && resume->consumed && resume->deadline > base::TimeTicks::Now() &&
      resume->owner_generation == person_read_retirement_generation_ && !owner_mutations_.pending()) return true;
  RetireRegisteredRun(resume->run_id, resume->generation);
  return false;
}
void EgressController::ReleaseIsolation(const std::string& page_id) {
  auto creator = creators_.find(page_id);
  base::OnceCallback<void(bool)> creator_ready;
  if (creator != creators_.end()) {
    creator->second->ready_timer.Stop();
    creator_ready = std::move(creator->second->ready);
    creators_.erase(creator);
  }
  base::ScopedClosureRunner complete_creator(base::BindOnce(
      [](base::OnceCallback<void(bool)> done) { if (done) std::move(done).Run(false); },
      std::move(creator_ready)));
  const auto owner = isolation_run_by_page_.find(page_id);
  if (owner == isolation_run_by_page_.end()) return;
  const std::string run_id = owner->second;
  isolation_run_by_page_.erase(owner);
  created_isolation_receipts_.erase(page_id);
  auto it = isolations_by_run_.find(run_id);
  if (it == isolations_by_run_.end()) return;
  const std::string isolation_id = it->second->id;
  const auto config = it->second->config;
  pages_.erase(page_id);
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks({page_id}, false);
  if (!weak) return;
  if (std::any_of(isolation_run_by_page_.begin(),
                  isolation_run_by_page_.end(),
                  [&run_id](const auto& entry) {
                    return entry.second == run_id;
                  })) {
    IsolationReceipt("released", run_id, page_id, isolation_id, nullptr,
                     "shared_partition_retained");
    return;
  }
  // Keep the original bounded registration for historical owner Stop ancestry.
  // Its last page and all partition data are retired independently below.
  credentials_by_run_.erase(run_id);
  PruneTerminalRegistrations();
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&EgressController::PruneTerminalRegistrations, weak));
  authority_observers_.Notify();
  if (!weak) return;
  auto* partition = profile_->GetStoragePartition(config, false);
  if (!partition) {
    IsolationReceipt("released", run_id, page_id, isolation_id, nullptr,
                     "partition_absent");
    return;
  }
  // REMOVE_DATA_MASK_ALL includes cookies. ClearData dereferences the cookie
  // filter, so a null filter DCHECK-aborts from WebContentsDestroyed on Quit.
  partition->ClearData(content::StoragePartition::REMOVE_DATA_MASK_ALL,
                       nullptr, {},
                       network::mojom::CookieDeletionFilter::New(), false,
                       base::Time(), base::Time::Max(),
                       base::BindOnce(&EgressController::IsolationReceipt,
                           GetWeakPtr(), "released", run_id, page_id,
                           isolation_id, nullptr, "clear_completed"));
}
bool EgressController::IsIsolatedPage(content::WebContents* page) const {
  const auto* identity = page ? PageIdentity::FromWebContents(page) : nullptr;
  return identity && isolation_run_by_page_.contains(identity->id());
}
bool EgressController::PersonReadPage(content::WebContents* page) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!page || page->GetBrowserContext() != profile_ ||
      profile_->IsOffTheRecord() || owner_mutations_.pending())
    return false;
  const auto* identity = PageIdentity::FromWebContents(page);
  auto* frame = page->GetPrimaryMainFrame();
  auto* catalog = TabCatalog::GetForProfile(profile_);
  if (!identity || identity->runtime_owned() || !LiveFrame(frame) ||
      !catalog || catalog->FindPage(identity->id()) != page ||
      isolation_run_by_page_.contains(identity->id()) ||
      !page->GetLastCommittedURL().SchemeIsHTTPOrHTTPS() ||
      IsProtected({frame->GetWeakDocumentPtr(), identity->id(), "person-read"}))
    return false;
  // An ordinary popup cannot borrow person admission from a task opener,
  // including the interval before its first installed request lease.
  auto* opener = page->GetFirstWebContentsInLiveOriginalOpenerChain();
  for (size_t depth = 0; opener && depth < 64; ++depth) {
    const auto* opener_identity = PageIdentity::FromWebContents(opener);
    if (opener->GetBrowserContext() != profile_ || !opener_identity ||
        opener_identity->runtime_owned() ||
        isolation_run_by_page_.contains(opener_identity->id()))
      return false;
    opener = opener->GetFirstWebContentsInLiveOriginalOpenerChain();
  }
  if (opener)
    return false;
  const auto it = pages_.find(identity->id());
  return it == pages_.end() ||
      (!it->second->guarded && !it->second->person_controlled &&
       it->second->lease.empty() &&
       it->second->navigation_transition_id.empty() &&
       !it->second->acknowledged_context.FindDict("isolation"));
}
std::optional<NativePersonReadReceipt> EgressController::CapturePersonRead(
    content::WebContents* page) {
  if (!PersonReadPage(page))
    return std::nullopt;
  const auto id = PageIdentity::FromWebContents(page)->id();
  auto& state = pages_[id];
  if (!state)
    state = std::make_unique<PageState>();
  return NativePersonReadReceipt(
      page->GetPrimaryMainFrame()->GetWeakDocumentPtr(), id,
      state->control_generation, person_read_retirement_generation_);
}
bool EgressController::MayReadPerson(const NativePersonReadReceipt& receipt) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* frame = receipt.document_.AsRenderFrameHostIfValid();
  auto* page = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  if (!PersonReadPage(page) || page->GetPrimaryMainFrame() != frame ||
      PageIdentity::FromWebContents(page)->id() != receipt.page_id_ ||
      person_read_retirement_generation_ != receipt.retirement_generation_)
    return false;
  const auto it = pages_.find(receipt.page_id_);
  return it != pages_.end() &&
      it->second->control_generation == receipt.control_generation_;
}
void EgressController::RetirePersonReads() {
  person_read_retirement_generation_ =
      base::UnguessableToken::Create().ToString();
  authority_observers_.Notify();
}
const EgressController::Isolation* EgressController::IsolationForPage(
    const std::string& page_id,
    content::RenderFrameHost* frame) const {
  auto owner = isolation_run_by_page_.find(page_id);
  if (owner == isolation_run_by_page_.end() || !frame ||
      !frame->GetSiteInstance()) {
    return nullptr;
  }
  auto it = isolations_by_run_.find(owner->second);
  if (it == isolations_by_run_.end() ||
      frame->GetSiteInstance()->GetSecurityPrincipal()
              .GetStoragePartitionConfig() != it->second->config ||
      frame->GetStoragePartition()->GetConfig() != it->second->config) {
    return nullptr;
  }
  return it->second.get();
}
base::DictValue EgressController::Context(const base::DictValue& params) {
  auto* catalog = TabCatalog::GetForProfile(profile_);
  auto* page = catalog ? catalog->FindPage(String(params, "tabId")) : nullptr;
  auto* frame = page ? page->GetPrimaryMainFrame() : nullptr;
  if (!LiveFrame(frame) ||
      page->GetLastCommittedURL().spec() != String(params, "expectedUrl")) {
    return Fault("The current native document changed");
  }
  const std::string page_id = PageIdentity::GetOrCreate(profile_, page);
  const Isolation* isolation = IsolationForPage(page_id, frame);
  if (isolation_run_by_page_.contains(page_id) && !isolation) {
    return Fault("The task tab left its native isolated partition");
  }
  auto& state = pages_[page_id];
  if (!state)
    state = std::make_unique<PageState>();
  base::DictValue context =
      base::DictValue()
          .Set("controlGeneration", state->control_generation)
          .Set("personControlled", state->person_controlled)
          .Set("profileId", profile_->GetPath().BaseName().AsUTF8Unsafe())
          .Set("tabId", page_id)
          .Set("frameId", FrameId(frame))
          .Set("documentToken",
               EgressDocument::GetOrCreateForCurrentDocument(frame)->token)
          .Set("sourceOrigin", Origin(frame));
  if (isolation) {
    if (created_isolation_receipts_.insert(page_id).second)
      IsolationReceipt("created", isolation->run_id, page_id, isolation->id,
                       frame, "registered");
    IsolationReceipt("context", isolation->run_id, page_id, isolation->id,
                     frame, "verified");
    base::DictValue scope;
    scope.Set("isolationId", isolation->id);
    scope.Set("runId", isolation->run_id);
    if (!isolation->task_id.empty()) {
      scope.Set("taskId", isolation->task_id);
    }
    scope.Set("taskRevision", isolation->task_revision);
    scope.Set("inMemory", true);
    scope.Set("cookies", "empty");
    context.Set("isolation", std::move(scope));
  }
  if (isolation && !state->acknowledged_context.empty() &&
      state->acknowledged_context != context) {
    return Fault("Document transition needs original navigation authority");
  }
  state->acknowledged_context = context.Clone();
  return Result(std::move(context));
}
base::DictValue EgressController::Install(const base::DictValue& params) {
  const auto* lease = params.FindDict("lease");
  if (!lease) {
    return Fault("Missing browser request lease");
  }
  const std::string page_id = String(*lease, "tabId");
  auto* catalog = TabCatalog::GetForProfile(profile_);
  auto* page = catalog ? catalog->FindPage(page_id) : nullptr;
  auto* frame = page ? page->GetPrimaryMainFrame() : nullptr;
  if (!LiveFrame(frame)) {
    return Fault("The native document is unavailable");
  }
  const auto existing = pages_.find(page_id);
  if (existing == pages_.end() || existing->second->person_controlled ||
      String(*lease, "controlGeneration") != existing->second->control_generation)
    return Fault("The native control generation was retired or not acknowledged");
  for (const auto& [id, resume] : person_resumes_) {
    if (resume->page_id == page_id && resume->consumed &&
        (resume->deadline <= base::TimeTicks::Now() ||
         resume->owner_generation != person_read_retirement_generation_))
      return Fault("Original person resume deadline or owner authority expired");
  }
  const Isolation* isolation = IsolationForPage(page_id, frame);
  if (!isolation || !RunIntentCurrent(*isolation) || String(*lease, "isolationId") != isolation->id ||
      String(*lease, "runId") != isolation->run_id ||
      String(*lease, "taskId") != isolation->task_id ||
      lease->FindInt("taskRevision").value_or(-1) !=
          isolation->task_revision) {
    return Fault("Browser request lease is not bound to this native task partition");
  }
  auto original_creator = creators_.find(page_id);
  if (original_creator != creators_.end()) {
    const auto& creator = *original_creator->second;
    auto* source_frame = creator.source_document.AsRenderFrameHostIfValid();
    auto* source_page = source_frame ? content::WebContents::FromRenderFrameHost(source_frame) : nullptr;
    if (creator.closing || creator.consumed || !creator.blank_committed ||
        (creator.has_source && (!LiveFrame(source_frame) || !source_page ||
            source_page->GetPrimaryMainFrame() != source_frame)) ||
        (existing->second->lease.empty() &&
            !CurrentCreator(page_id, String(creator.proof, "receiptId"), creator.connection_generation)))
      return Fault("Original creator/source cleanup or publication authority changed");
  }
  auto* document = EgressDocument::GetOrCreateForCurrentDocument(frame);
  const double now = base::Time::Now().InMillisecondsFSinceUnixEpoch();
  const double expires = lease->FindDouble("expiresAt").value_or(0);
  const double issued = lease->FindDouble("issuedAt").value_or(0);
  if (String(*lease, "profileId") !=
          profile_->GetPath().BaseName().AsUTF8Unsafe() ||
      String(*lease, "frameId") != FrameId(frame) ||
      String(*lease, "documentToken") != document->token ||
      String(*lease, "sourceOrigin") != Origin(frame) ||
      String(*lease, "leaseId").empty() || String(*lease, "runId").empty() ||
      expires <= now || expires > now + 31000 || issued > now + 1000 ||
      page->GetLastCommittedURL().spec() != String(params, "expectedUrl")) {
    return Fault("Native browser request identity or expiry mismatch");
  }
  auto& admission = *existing->second;
  const std::string transition = String(params, "navigationTransitionId");
  const bool replacing_document = !admission.installed_document_token.empty() &&
      admission.installed_document_token != document->token;
  if (replacing_document || !admission.navigation_transition_id.empty()) {
    if (transition.empty() || transition != admission.navigation_transition_id ||
        admission.navigation_transition_document.AsRenderFrameHostIfValid() != frame ||
        admission.navigation_transition_expiry <= now ||
        admission.navigation_transition_deadline.is_null() ||
        base::TimeTicks::Now() >= admission.navigation_transition_deadline ||
        expires > admission.navigation_transition_expiry) {
      return Fault("New document requires its exact original navigation transition");
    }
  } else if (!transition.empty()) {
    return Fault("No navigation transition is waiting for this document");
  }
  if (!document->credential_run_id.empty() &&
      document->credential_run_id != String(*lease, "runId")) {
    return Fault(
        "This document contains credentials from an earlier run; "
        "open a fresh page before agent control");
  }
  const std::string initial = String(*lease, "initialDestination");
  if (Origin(frame) == "aux://blank" ? !GURL(initial).SchemeIsHTTPOrHTTPS()
                                     : !initial.empty()) {
    return Fault("Initial navigation requires exact blank-tab authority");
  }
  bool child_opaque = false;
  std::erase_if(opaque_documents_, [](const auto& value) {
    return !value.AsRenderFrameHostIfValid();
  });
  for (const auto& value : opaque_documents_) {
    auto* child_frame = value.AsRenderFrameHostIfValid();
    auto* child = content::WebContents::FromRenderFrameHost(child_frame);
    for (size_t depth = 0; child && depth < 64; ++depth) {
      if (child == page) {
        child_opaque = true;
        break;
      }
      child = child->GetFirstWebContentsInLiveOriginalOpenerChain();
    }
  }
  if (ambiguous_transport_used_ || document->opaque_transport_used ||
      child_opaque) {
    return Fault(
        "This document has an existing uninspectable transport; open a fresh "
        "page before agent control");
  }
  auto& state = pages_[page_id];
  if (!state) {
    state = std::make_unique<PageState>();
  }
  if (!state->lease.empty() &&
      String(state->lease, "leaseId") != String(*lease, "leaseId")) {
    return Fault(
        "Previous request authority must be revoked before replacement");
  }
  if (String(state->lease, "leaseId") == String(*lease, "leaseId")) {
    auto old_identity = state->lease.Clone();
    auto new_identity = lease->Clone();
    old_identity.Remove("expiresAt");
    new_identity.Remove("expiresAt");
    if (old_identity != new_identity) {
      return Fault("Renewal cannot change request authority");
    }
  }
  state->guarded = true;
  document->protected_document = true;
  state->document = frame->GetWeakDocumentPtr();
  state->lease = lease->Clone();
  state->installed_document_token = document->token;
  auto creator = creators_.find(page_id);
  if (creator != creators_.end()) {
    creator->second->installed = true;
    creator->second->document = frame->GetWeakDocumentPtr();
    creator->second->control_generation = state->control_generation;
    creator->second->proof.clear();
    const auto installed_deadline = base::TimeTicks::Now() + base::Milliseconds(expires - now);
    // An initial replacement Install is not private runtime publication. Its
    // ACK/binding/cleanup remains bounded by the original START deadline.
    // Only a subsequent same-original renewal after actual publication may
    // use its genuinely installed lease deadline, when no transition remains.
    creator->second->deadline = state->navigation_transition_deadline.is_null()
        ? installed_deadline
        : std::min(installed_deadline, state->navigation_transition_deadline);
  }
  state->navigation_transition_id.clear();
  state->navigation_transition_document = {};
  state->navigation_transition_expiry = 0;
  state->navigation_transition_deadline = {};
  authority_observers_.Notify();
  RetryPending();
  return Result(base::DictValue().Set("accepted", true));
}
base::DictValue EgressController::Revoke(const base::DictValue& params) {
  const auto* lease = params.FindDict("lease");
  if (!lease || String(*lease, "leaseId").empty() ||
      String(*lease, "controlGeneration").empty() ||
      String(*lease, "profileId") !=
          profile_->GetPath().BaseName().AsUTF8Unsafe()) {
    return Fault("Missing exact original browser authority retirement");
  }
  const std::string page_id = String(*lease, "tabId");
  auto it = pages_.find(page_id);
  if (it == pages_.end()) {
    // A destroyed page cannot accept the queued original Install.
    return Result(base::DictValue().Set("accepted", true));
  }
  auto& state = *it->second;
  if (String(*lease, "controlGeneration") != state.control_generation) {
    // A retired generation can never Install again. Debt repayment must not
    // rotate or cancel a replacement generation's authority or requests.
    return Result(base::DictValue().Set("accepted", true));
  }
  const auto& context = state.acknowledged_context;
  const auto* isolation = context.FindDict("isolation");
  if (!isolation || String(*lease, "isolationId") != String(*isolation, "isolationId") ||
      String(*lease, "runId") != String(*isolation, "runId") ||
      String(*lease, "taskId") != String(*isolation, "taskId") ||
      lease->FindInt("taskRevision") != isolation->FindInt("taskRevision") ||
      String(*lease, "frameId") != String(context, "frameId") ||
      String(*lease, "documentToken") != String(context, "documentToken") ||
      String(*lease, "sourceOrigin") != String(context, "sourceOrigin")) {
    return Fault("Original native retirement scope changed");
  }
  if (!state.lease.empty()) {
    auto expected = lease->Clone();
    auto installed = state.lease.Clone();
    expected.Remove("expiresAt");
    installed.Remove("expiresAt");
    if (expected != installed)
      return Fault("Retirement cannot replace another installed authority");
  }
  // Context is already native-owned even before the worker's Install reaches
  // this sequence. Retire its generation before callbacks, so an acknowledged
  // mutation cannot be undone by that queued first Install.
  const std::string lease_id = String(*lease, "leaseId");
  auto creator = creators_.find(page_id);
  const bool actually_installed = !state.lease.empty();
  const double cleanup_expiry = actually_installed ? state.lease.FindDouble("expiresAt").value_or(0)
      : creator != creators_.end() ? creator->second->proof.FindDouble("expiresAt").value_or(0) : 0;
  const std::string cleanup_phase = actually_installed ? "installed_revoke"
      : creator != creators_.end() ? String(creator->second->proof, "phase") : "";
  state.control_generation = base::UnguessableToken::Create().ToString();
  state.acknowledged_context.clear();
  state.navigation_transition_id.clear();
  state.navigation_transition_document = {};
  state.navigation_transition_expiry = 0;
  state.navigation_transition_deadline = {};
  state.lease.clear();
  if (creator != creators_.end() && !cleanup_phase.empty())
    RefreshCreatorProof(page_id, cleanup_phase, creator->second->document,
        cleanup_expiry, creator->second->deadline);
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks({page_id}, false, lease_id);
  if (weak)
    authority_observers_.Notify();
  return Result(base::DictValue().Set("accepted", true));
}
std::optional<NativeCdpRetirementReceipt>
EgressController::RetireForNativePersonInput(
    content::WebContents* page, const content::WeakDocumentPtr& document,
    base::TimeTicks original_event_ticks, base::TimeTicks admitted_ticks,
    bool original_clock_valid) {
  auto* frame = document.AsRenderFrameHostIfValid();
  if (!page || page->GetBrowserContext() != profile_ || !LiveFrame(frame) ||
      page->GetPrimaryMainFrame() != frame)
    return std::nullopt;
  const auto page_id = PageIdentity::GetOrCreate(profile_, page);
  const auto* isolation = IsolationForPage(page_id, frame);
  if (!isolation)
    return std::nullopt;
  auto& state = pages_[page_id];
  if (!state)
    state = std::make_unique<PageState>();
  if (state->person_controlled)
    return std::nullopt;
  NativeCdpRetirementReceipt receipt;
  receipt.original_lease = state->lease.Clone();
  const auto retired_generation = base::UnguessableToken::Create().ToString();
  receipt.original_scope = base::DictValue()
      .Set("profileId", profile_->GetPath().BaseName().AsUTF8Unsafe())
      .Set("tabId", page_id)
      .Set("isolationId", isolation->id)
      .Set("runId", isolation->run_id)
      .Set("taskRevision", isolation->task_revision)
      .Set("frameId", FrameId(frame))
      .Set("documentToken", EgressDocument::GetOrCreateForCurrentDocument(frame)->token)
      .Set("sourceOrigin", Origin(frame))
      .Set("controlGeneration", state->control_generation)
      .Set("retiredControlGeneration", retired_generation);
  if (!isolation->task_id.empty())
    receipt.original_scope.Set("taskId", isolation->task_id);
  receipt.original_event_ticks = original_event_ticks;
  receipt.admitted_ticks = admitted_ticks;
  receipt.original_clock_valid = original_clock_valid;
  if (state->dispatched_lease_id == String(state->lease, "leaseId")) {
    receipt.last_dispatch_ticks = state->last_cdp_dispatch_ticks;
    receipt.dispatch_count = state->cdp_dispatch_count;
  }
  if (cdp_measurement_) cdp_measurement_->RetiredPage(page_id, receipt.original_lease,
      receipt.original_scope, receipt.original_event_ticks, receipt.admitted_ticks,
      receipt.last_dispatch_ticks, receipt.dispatch_count, receipt.original_clock_valid);
  state->cdp_retirement_receipt = NativeCdpRetirementReceipt{
      receipt.original_lease.Clone(), receipt.original_scope.Clone(),
      receipt.original_event_ticks,
      receipt.admitted_ticks, receipt.last_dispatch_ticks,
      receipt.dispatch_count, receipt.original_clock_valid};
  const std::string lease_id = String(state->lease, "leaseId");
  state->guarded = true;
  state->person_controlled = true;
  state->control_generation = retired_generation;
  state->acknowledged_context.clear();
  state->navigation_transition_id.clear();
  state->navigation_transition_document = {};
  state->navigation_transition_expiry = 0;
  state->navigation_transition_deadline = {};
  state->lease.clear();
  state->document = document;
  // State and generation retire synchronously before a native request callback
  // or runtime notification can reenter. No new Context grants rearm authority.
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks({page_id}, false, lease_id);
  if (weak)
    authority_observers_.Notify();
  return receipt;
}

std::optional<std::string> EgressController::PreparePersonResume(
    const std::string& page_id, uint64_t connection_generation) {
  const auto now = base::TimeTicks::Now();
  std::erase_if(person_resumes_, [now](const auto& row) {
    return !row.second->consumed && row.second->deadline <= now;
  });
  const auto it = pages_.find(page_id);
  if (!connection_generation || profile_->IsOffTheRecord() || owner_mutations_.pending() ||
      person_resumes_.size() >= 256 || it == pages_.end() ||
      !it->second->person_controlled || !it->second->lease.empty() ||
      !it->second->cdp_retirement_receipt)
    return std::nullopt;
  for (const auto& [id, ticket] : person_resumes_)
    if (ticket->page_id == page_id) return std::nullopt;
  auto* frame = it->second->document.AsRenderFrameHostIfValid();
  auto* page = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  auto* catalog = TabCatalog::GetForProfile(profile_);
  const auto* isolation = frame ? IsolationForPage(page_id, frame) : nullptr;
  const auto& scope = it->second->cdp_retirement_receipt->original_scope;
  if (!page || !LiveFrame(frame) || page->GetPrimaryMainFrame() != frame ||
      page->GetBrowserContext() != profile_ || !catalog ||
      catalog->FindPage(page_id) != page || !isolation || isolation->connection_generation != connection_generation ||
      isolation->runtime_owner_incarnation != runtime_owner_incarnation_ ||
      String(scope, "isolationId") != isolation->id ||
      String(scope, "runId") != isolation->run_id || String(scope, "taskId") != isolation->task_id ||
      scope.FindInt("taskRevision") != isolation->task_revision ||
      String(scope, "frameId") != FrameId(frame) ||
      String(scope, "documentToken") != EgressDocument::GetOrCreateForCurrentDocument(frame)->token)
    return std::nullopt;
  auto ticket = std::make_unique<PersonResume>();
  ticket->page_id = page_id;
  ticket->document = it->second->document;
  ticket->retired_generation = it->second->control_generation;
  ticket->owner_generation = person_read_retirement_generation_;
  ticket->connection_generation = connection_generation;
  ticket->runtime_owner_incarnation = runtime_owner_incarnation_;
  ticket->deadline = now + base::Seconds(8);
  const auto id = base::UnguessableToken::Create().ToString();
  person_resumes_.emplace(id, std::move(ticket));
  return id;
}

base::DictValue EgressController::ConsumePersonResume(
    const std::string& page_id, const std::string& ticket_id,
    uint64_t connection_generation) {
  auto ticket = person_resumes_.find(ticket_id);
  auto state = pages_.find(page_id);
  if (ticket == person_resumes_.end() || ticket->second->page_id != page_id || state == pages_.end() ||
      !connection_generation || profile_->IsOffTheRecord() || owner_mutations_.pending() ||
      ticket->second->consumed || ticket->second->deadline <= base::TimeTicks::Now() ||
      ticket->second->connection_generation != connection_generation ||
      ticket->second->runtime_owner_incarnation != runtime_owner_incarnation_ ||
      ticket->second->owner_generation != person_read_retirement_generation_ ||
      !state->second->person_controlled || !state->second->lease.empty() ||
      state->second->control_generation != ticket->second->retired_generation)
    return Fault("Original person resume authority is unavailable");
  auto* frame = ticket->second->document.AsRenderFrameHostIfValid();
  auto* page = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  auto* catalog = TabCatalog::GetForProfile(profile_);
  const auto* isolation = frame ? IsolationForPage(page_id, frame) : nullptr;
  if (!page || !LiveFrame(frame) || page->GetPrimaryMainFrame() != frame ||
      page->GetBrowserContext() != profile_ || !catalog ||
      catalog->FindPage(page_id) != page || !isolation || isolation->connection_generation != connection_generation ||
      isolation->runtime_owner_incarnation != runtime_owner_incarnation_ ||
      state->second->document.AsRenderFrameHostIfValid() != frame ||
      !state->second->cdp_retirement_receipt)
    return Fault("Original person resume document changed");
  const auto& scope = state->second->cdp_retirement_receipt->original_scope;
  if (String(scope, "isolationId") != isolation->id ||
      String(scope, "runId") != isolation->run_id || String(scope, "taskId") != isolation->task_id ||
      scope.FindInt("taskRevision") != isolation->task_revision ||
      String(scope, "frameId") != FrameId(frame) ||
      String(scope, "documentToken") != EgressDocument::GetOrCreateForCurrentDocument(frame)->token)
    return Fault("Original person resume task changed");
  // Consume before publishing. No lease is installed by returning control.
  ticket->second->consumed = true;
  state->second->person_controlled = false;
  state->second->control_generation = base::UnguessableToken::Create().ToString();
  ticket->second->authorized_generation = state->second->control_generation;
  state->second->acknowledged_context.clear();
  auto context = Context(base::DictValue().Set("tabId", page_id)
      .Set("expectedUrl", page->GetLastCommittedURL().spec()));
  auto* value = context.FindDict("result");
  if (!value) {
    state->second->person_controlled = true;
    state->second->control_generation = base::UnguessableToken::Create().ToString();
    return context;
  }
  const auto remaining = ticket->second->deadline - base::TimeTicks::Now();
  const auto expires_at = base::Time::Now().InMillisecondsSinceUnixEpoch() + remaining.InMilliseconds();
  auto creator = creators_.find(page_id);
  if (creator != creators_.end() && !creator->second->closing &&
      !creator->second->consumed &&
      creator->second->connection_generation == connection_generation &&
      creator->second->runtime_owner_incarnation == runtime_owner_incarnation_ &&
      creator->second->document.AsRenderFrameHostIfValid() == frame) {
    RefreshCreatorProof(page_id, "resumed_control", ticket->second->document,
        static_cast<double>(expires_at), ticket->second->deadline);
  }
  auto result = Result(base::DictValue().Set("accepted", true).Set("context", value->Clone())
      .Set("expiresAt", static_cast<double>(expires_at)));
  authority_observers_.Notify();
  return result;
}

bool EgressController::FinishPersonResume(const std::string& id, bool success) {
  auto it = person_resumes_.find(id);
  if (it == person_resumes_.end()) return false;
  auto original = std::move(it->second);
  person_resumes_.erase(it);
  if (!original->consumed || original->connection_generation != admitted_runtime_generation_ ||
      original->runtime_owner_incarnation != runtime_owner_incarnation_) return false;
  auto state = pages_.find(original->page_id);
  auto* frame = original->document.AsRenderFrameHostIfValid();
  if (state == pages_.end() || !frame ||
      state->second->document.AsRenderFrameHostIfValid() != frame ||
      state->second->control_generation != original->authorized_generation)
    return false;
  if (success && original->deadline > base::TimeTicks::Now() &&
      original->owner_generation == person_read_retirement_generation_ &&
      !owner_mutations_.pending() && !state->second->person_controlled) return true;
  const auto lease_id = String(state->second->lease, "leaseId");
  state->second->person_controlled = true;
  state->second->control_generation = base::UnguessableToken::Create().ToString();
  state->second->acknowledged_context.clear();
  state->second->lease.clear();
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks({original->page_id}, false, lease_id);
  if (weak) authority_observers_.Notify();
  return false;
}

EgressController* EgressController::ExistingForCdpMeasurement(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  return profile ? static_cast<EgressController*>(profile->GetUserData(&kEgressKey)) : nullptr;
}
bool EgressController::BeginCdpRetirementMeasurement(bool stop_family) {
  if (cdp_measurement_ || !admitted_runtime_generation_ || runtime_owner_incarnation_.empty() ||
      profile_->IsOffTheRecord() || owner_mutations_.pending()) return false;
  std::set<std::string> roots;
  for (const auto& [page_id, state] : pages_) {
    auto* frame = state->document.AsRenderFrameHostIfValid();
    const auto* isolation = frame ? IsolationForPage(page_id, frame) : nullptr;
    if (isolation && !state->lease.empty() && RunIntentCurrent(*isolation) &&
        isolation->connection_generation == admitted_runtime_generation_ &&
        isolation->runtime_owner_incarnation == runtime_owner_incarnation_ &&
        !isolation->ancestry.empty()) roots.insert(isolation->ancestry.back());
  }
  if (roots.size() != 1) return false;
  const auto root = *roots.begin();
  std::vector<std::string> registrations;
  for (const auto& [id, isolation] : isolations_by_run_) {
    if (isolation->connection_generation == admitted_runtime_generation_ &&
        isolation->runtime_owner_incarnation == runtime_owner_incarnation_ &&
        !isolation->ancestry.empty() && isolation->ancestry.back() == root)
      registrations.push_back(id);
  }
  std::map<std::string, NativeCdpRetirementMeasurement::OriginalPage> original;
  std::map<std::string, std::unique_ptr<CdpMeasurementOriginal>> documents;
  auto* catalog = TabCatalog::GetForProfile(profile_);
  // Every original registered family page must be accounted. Preparing,
  // detached, uninstalled, or changed pages are refusal, not empty workload.
  for (const auto& [page_id, run] : isolation_run_by_page_) {
    if (std::ranges::find(registrations, run) == registrations.end()) continue;
    auto state = pages_.find(page_id);
    auto* page = catalog ? catalog->FindPage(page_id) : nullptr;
    auto* frame = page ? page->GetPrimaryMainFrame() : nullptr;
    if (state == pages_.end() || !LiveFrame(frame) ||
        !Current({frame->GetWeakDocumentPtr(), page_id, "cdp", false}, state->second->lease) ||
        page->GetBrowserContext() != profile_ || !IsIsolatedPage(page)) return false;
    auto identity = std::make_unique<CdpMeasurementOriginal>(page);
    documents.emplace(page_id, std::move(identity));
    const auto count = state->second->dispatched_lease_id == String(state->second->lease, "leaseId")
        ? state->second->cdp_dispatch_count : 0;
    original.emplace(page_id, NativeCdpRetirementMeasurement::OriginalPage{state->second->lease.Clone(), count});
  }
  if (original.empty() || original.size() > 20 || (!stop_family && original.size() != 1)) return false;
  cdp_measurement_originals_ = std::move(documents);
  cdp_measurement_terminal_family_ = false;
  cdp_measurement_owner_retirement_ = person_read_retirement_generation_;
  cdp_measurement_failure_epoch_ = owner_mutations_.failure_epoch();
  cdp_measurement_ = std::make_unique<NativeCdpRetirementMeasurement>(stop_family
      ? NativeCdpRetirementMeasurement::Mode::kStop : NativeCdpRetirementMeasurement::Mode::kTakeover,
      root, runtime_owner_incarnation_, admitted_runtime_generation_, std::move(registrations), std::move(original));
  return true;
}
bool EgressController::CurrentCdpMeasurementInput() const {
  return cdp_measurement_ &&
      cdp_measurement_->mode() == NativeCdpRetirementMeasurement::Mode::kStop &&
      CurrentCdpMeasurementPages();
}
bool EgressController::CurrentCdpMeasurementPages() const {
  if (!cdp_measurement_ || !cdp_measurement_->current() ||
      owner_mutations_.pending() ||
      cdp_measurement_->connection_generation() != admitted_runtime_generation_ ||
      cdp_measurement_->owner_incarnation() != runtime_owner_incarnation_ ||
      cdp_measurement_owner_retirement_ != person_read_retirement_generation_ ||
      cdp_measurement_failure_epoch_ != owner_mutations_.failure_epoch())
    return false;
  auto* catalog = TabCatalog::GetForProfile(profile_);
  for (const auto& [page_id, original] : cdp_measurement_->original_pages()) {
    const auto state = pages_.find(page_id);
    const auto document = cdp_measurement_originals_.find(page_id);
    auto* page = catalog ? catalog->FindPage(page_id) : nullptr;
    auto* frame = page ? page->GetPrimaryMainFrame() : nullptr;
    if (state == pages_.end() || document == cdp_measurement_originals_.end() ||
        document->second->document_replaced || !document->second->destroyed_ticks.is_null() ||
        document->second->page.get() != page || !LiveFrame(frame) ||
        document->second->document.AsRenderFrameHostIfValid() != frame)
      return false;
    auto expected = original.lease.Clone();
    auto installed = state->second->lease.Clone();
    expected.Remove("expiresAt");
    installed.Remove("expiresAt");
    if (expected != installed ||
        !Current({frame->GetWeakDocumentPtr(), page_id, "cdp", false},
                 state->second->lease))
      return false;
  }
  return true;
}
base::DictValue EgressController::ReadCdpRetirementMeasurementArm() const {
  return cdp_measurement_ ? cdp_measurement_->ArmedRecord()
      : base::DictValue().Set("producer", "aux-native-cdp-retirement")
          .Set("version", 1).Set("status", "refused");
}
base::DictValue EgressController::CompleteCdpRetirementMeasurement() {
  if (!cdp_measurement_) return base::DictValue().Set("producer", "aux-native-cdp-retirement")
      .Set("version", 1).Set("status", "refused");
  auto original = std::move(cdp_measurement_);
  auto documents = std::move(cdp_measurement_originals_);
  bool current = admitted_runtime_generation_ == original->connection_generation() &&
      runtime_owner_incarnation_ == original->owner_incarnation() && !owner_mutations_.pending() &&
      cdp_measurement_owner_retirement_ == person_read_retirement_generation_ &&
      cdp_measurement_failure_epoch_ == owner_mutations_.failure_epoch();
  std::vector<std::string> registrations;
  for (const auto& [id, isolation] : isolations_by_run_) {
    if (isolation->connection_generation == admitted_runtime_generation_ &&
        isolation->runtime_owner_incarnation == runtime_owner_incarnation_ &&
        !isolation->ancestry.empty() && isolation->ancestry.back() == original->root_run())
      registrations.push_back(id);
  }
  current &= cdp_measurement_terminal_family_
      ? registrations.empty() : registrations == original->registered_runs();
  auto* catalog = TabCatalog::GetForProfile(profile_);
  std::set<std::string> current_pages;
  for (const auto& [page_id, run] : isolation_run_by_page_) {
    if (std::ranges::find(registrations, run) != registrations.end()) current_pages.insert(page_id);
  }
  // Teardown may remove original pages, but never admits an added/replaced one.
  for (const auto& page_id : current_pages)
    current &= documents.contains(page_id);
  for (const auto& [page_id, identity] : documents) {
    current &= !identity->document_replaced;
    if (!identity->destroyed_ticks.is_null()) {
      original->DocumentDestroyed(page_id, identity->destroyed_ticks);
      current &= original->mode() == NativeCdpRetirementMeasurement::Mode::kStop &&
          !identity->page && !current_pages.contains(page_id) &&
          (!catalog || !catalog->FindPage(page_id)) && !pages_.contains(page_id) &&
          (cdp_measurement_terminal_family_ ||
              HasStoppedRunIntent(original->root_run(), admitted_runtime_generation_));
      continue;
    }
    auto* frame = identity->document.AsRenderFrameHostIfValid();
    const auto state = pages_.find(page_id);
    const auto* isolation = frame ? IsolationForPage(page_id, frame) : nullptr;
    current &= frame && identity->page && current_pages.contains(page_id) && catalog &&
        catalog->FindPage(page_id) == identity->page.get() &&
        identity->page->GetPrimaryMainFrame() == frame && identity->page->GetBrowserContext() == profile_ &&
        isolation && isolation->connection_generation == admitted_runtime_generation_ &&
        isolation->runtime_owner_incarnation == runtime_owner_incarnation_ &&
        state != pages_.end() && state->second->lease.empty() &&
        original->original_pages().at(page_id).lease.FindDouble("expiresAt").value_or(0) >
            base::Time::Now().InMillisecondsFSinceUnixEpoch() &&
        state->second->navigation_transition_id.empty() &&
        (original->mode() == NativeCdpRetirementMeasurement::Mode::kStop
            ? HasStoppedRunIntent(original->root_run(), admitted_runtime_generation_)
            : state->second->person_controlled);
  }
  return original->Complete(current);
}

bool EgressController::RecordFinalCdpDispatch(
    const EgressRequestContext& context, const base::DictValue& original_lease) {
  if (owner_mutations_.pending() || !Current(context, original_lease))
    return false;
  auto it = pages_.find(context.page_id);
  if (it == pages_.end())
    return false;
  const auto creator = creators_.find(context.page_id);
  if (creator != creators_.end() && creator->second->has_source) {
    auto* source_frame = creator->second->source_document.AsRenderFrameHostIfValid();
    auto* source_page = source_frame
        ? content::WebContents::FromRenderFrameHost(source_frame) : nullptr;
    if (!LiveFrame(source_frame) || !source_page ||
        source_page->GetBrowserContext() != profile_ ||
        source_page->GetPrimaryMainFrame() != source_frame)
      return false;
  }
  auto expected = original_lease.Clone();
  auto installed = it->second->lease.Clone();
  expected.Remove("expiresAt");
  installed.Remove("expiresAt");
  if (expected != installed)
    return false;
  auto& state = *it->second;
  const auto lease_id = String(original_lease, "leaseId");
  if (state.dispatched_lease_id != lease_id) {
    state.dispatched_lease_id = lease_id;
    state.cdp_dispatch_count = 0;
    state.last_cdp_dispatch_ticks = {};
  }
  // Refuse overflow rather than wrap a qualification counter.
  if (state.cdp_dispatch_count == std::numeric_limits<uint64_t>::max())
    return false;
  ++state.cdp_dispatch_count;
  state.last_cdp_dispatch_ticks = base::TimeTicks::Now();
  if (cdp_measurement_) cdp_measurement_->ApprovedDispatch(context.page_id, original_lease,
      state.last_cdp_dispatch_ticks, state.cdp_dispatch_count);
  return true;
}

bool EgressController::HasOriginalCdpNavigationAuthority(
    const base::DictValue& original_lease,
    const content::WeakDocumentPtr& current_document) const {
  auto* frame = current_document.AsRenderFrameHostIfValid();
  if (!LiveFrame(frame) || owner_mutations_.pending() ||
      String(original_lease, "profileId") !=
          profile_->GetPath().BaseName().AsUTF8Unsafe())
    return false;
  const std::string page_id = String(original_lease, "tabId");
  auto* catalog = TabCatalog::GetForProfile(profile_);
  auto* page = catalog ? catalog->FindPage(page_id) : nullptr;
  auto it = pages_.find(page_id);
  const Isolation* isolation = IsolationForPage(page_id, frame);
  if (!page || page->GetBrowserContext() != profile_ ||
      page->GetPrimaryMainFrame() != frame || it == pages_.end() ||
      !isolation || !RunIntentCurrent(*isolation) || it->second->person_controlled ||
      String(original_lease, "controlGeneration") != it->second->control_generation ||
      String(original_lease, "isolationId") != isolation->id ||
      String(original_lease, "runId") != isolation->run_id ||
      String(original_lease, "taskId") != isolation->task_id ||
      original_lease.FindInt("taskRevision").value_or(-1) != isolation->task_revision ||
      it->second->lease.FindDouble("expiresAt").value_or(0) <=
          base::Time::Now().InMillisecondsFSinceUnixEpoch())
    return false;
  const auto creator = creators_.find(page_id);
  if (creator != creators_.end() && creator->second->has_source) {
    auto* source_frame = creator->second->source_document.AsRenderFrameHostIfValid();
    auto* source_page = source_frame
        ? content::WebContents::FromRenderFrameHost(source_frame) : nullptr;
    if (!LiveFrame(source_frame) || !source_page ||
        source_page->GetBrowserContext() != profile_ ||
        source_page->GetPrimaryMainFrame() != source_frame)
      return false;
  }
  auto expected = original_lease.Clone();
  auto installed = it->second->lease.Clone();
  expected.Remove("expiresAt");
  installed.Remove("expiresAt");
  return !installed.empty() && expected == installed;
}

base::DictValue EgressController::RetireCdpNavigation(
    const base::DictValue& original_lease,
    const content::WeakDocumentPtr& committed_document,
    double acknowledged_expires_at, base::TimeTicks original_command_deadline) {
  if (original_command_deadline.is_null() ||
      base::TimeTicks::Now() >= original_command_deadline ||
      !std::isfinite(acknowledged_expires_at) ||
      acknowledged_expires_at <= base::Time::Now().InMillisecondsFSinceUnixEpoch() ||
      acknowledged_expires_at > 9007199254740991.0 ||
      std::floor(acknowledged_expires_at) != acknowledged_expires_at ||
      !HasOriginalCdpNavigationAuthority(original_lease, committed_document))
    return Fault("Original navigation authority was retired before its receipt");
  auto* frame = committed_document.AsRenderFrameHostIfValid();
  auto* page = content::WebContents::FromRenderFrameHost(frame);
  auto* document = EgressDocument::GetOrCreateForCurrentDocument(frame);
  if (String(original_lease, "documentToken") == document->token)
    return Fault("Navigation has no committed replacement document");
  const std::string page_id = String(original_lease, "tabId");
  auto& state = *pages_.find(page_id)->second;
  const std::string original_lease_id = String(original_lease, "leaseId");
  const double installed_expiry = state.lease.FindDouble("expiresAt").value_or(0);
  if (acknowledged_expires_at > installed_expiry)
    return Fault("Original navigation acknowledgement exceeds installed authority");
  state.navigation_transition_id = base::UnguessableToken::Create().ToString();
  state.navigation_transition_document = committed_document;
  state.navigation_transition_expiry = acknowledged_expires_at;
  state.navigation_transition_deadline = original_command_deadline;
  state.control_generation = base::UnguessableToken::Create().ToString();
  state.lease.clear();
  state.acknowledged_context.clear();
  auto context = Context(base::DictValue().Set("tabId", page_id)
      .Set("expectedUrl", page->GetLastCommittedURL().spec()));
  auto* admitted = context.FindDict("result");
  if (!admitted) {
    state.navigation_transition_id.clear();
    state.navigation_transition_document = {};
    state.navigation_transition_expiry = 0;
    state.navigation_transition_deadline = {};
    return context;
  }
  auto creator = creators_.find(page_id);
  if (creator != creators_.end())
    RefreshCreatorProof(page_id, "committed_transition", committed_document,
        acknowledged_expires_at, std::min({creator->second->deadline,
            original_command_deadline,
            base::TimeTicks::Now() + base::Milliseconds(acknowledged_expires_at -
                base::Time::Now().InMillisecondsFSinceUnixEpoch())}));
  auto result = base::DictValue().Set("navigationTransitionId", state.navigation_transition_id)
      .Set("url", page->GetLastCommittedURL().spec())
      .Set("context", admitted->Clone());
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks({page_id}, false, original_lease_id);
  if (weak)
    authority_observers_.Notify();
  return Result(std::move(result));
}

bool EgressController::AdmitRuntimeConnection(uint64_t generation,
    const std::string& owner_incarnation) {
  if (!generation || generation > 9007199254740991ULL || owner_incarnation.empty() ||
      admitted_runtime_generation_ ||
      (owner_incarnation == runtime_owner_incarnation_ && generation <= retired_runtime_generation_)) return false;
  if (owner_incarnation != runtime_owner_incarnation_) {
    runtime_owner_incarnation_ = owner_incarnation;
    retired_runtime_generation_ = 0;
    std::erase_if(isolations_by_run_, [](const auto& row) {
      return std::ranges::none_of(row.second->registered_pages, [](const auto& original) { return !!original; });
    });
  }
  admitted_runtime_generation_ = generation;
  return true;
}
void EgressController::Disconnect() {
  if (cdp_measurement_) cdp_measurement_->Refuse();
  retired_runtime_generation_ = std::max(retired_runtime_generation_, admitted_runtime_generation_);
  admitted_runtime_generation_ = 0;
  person_resumes_.clear();
  run_resumes_.clear();
  run_intents_.clear();
  std::vector<base::OnceCallback<void(bool)>> creator_ready;
  for (auto& [id, creator] : creators_) {
    creator->proof.clear();
    creator->connection_generation = 0;
    creator->ready_timer.Stop();
    if (creator->ready) creator_ready.push_back(std::move(creator->ready));
  }
  base::ScopedClosureRunner complete_creator(base::BindOnce(
      [](std::vector<base::OnceCallback<void(bool)>> callbacks) {
        for (auto& done : callbacks) std::move(done).Run(false);
      }, std::move(creator_ready)));
  person_read_retirement_generation_ =
      base::UnguessableToken::Create().ToString();
  for (auto& [id, state] : pages_) {
    state->control_generation = base::UnguessableToken::Create().ToString();
    state->acknowledged_context.clear();
    state->navigation_transition_id.clear();
    state->navigation_transition_document = {};
    state->navigation_transition_expiry = 0;
    state->navigation_transition_deadline = {};
    state->lease.clear();
  }
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks({}, true);
  if (weak)
    authority_observers_.Notify();
}
void EgressController::CancelChecks(const std::set<std::string>& page_ids,
                                    bool all,
                                    const std::string& lease_id) {
  std::vector<base::OnceCallback<void(bool)>> callbacks;
  std::erase_if(pending_, [&](auto& item) {
    if (!all && !page_ids.contains(item->context.page_id) &&
        (lease_id.empty() || item->lease_id != lease_id)) {
      return false;
    }
    Receipt("pending", item->context.kind,
            item->final_headers ? "send" : "preflight", "authority_revoked",
            false);
    callbacks.push_back(std::move(item->callback));
    return true;
  });
  std::erase_if(in_flight_, [&](auto& item) {
    if (!all && !page_ids.contains(item.second->context.page_id) &&
        (lease_id.empty() ||
         String(item.second->lease, "leaseId") != lease_id)) {
      return false;
    }
    Receipt(item.first, item.second->context.kind, item.second->phase,
            "authority_revoked", false);
    callbacks.push_back(std::move(item.second->callback));
    return true;
  });
  if (pending_.empty()) {
    pending_timer_.Stop();
  }
  // The runtime reply now holds only an ID absent from in_flight_. It cannot
  // resume a request, even if a new lease is installed during these callbacks.
  for (auto& callback : callbacks) {
    std::move(callback).Run(false);
  }
}
bool EgressController::IsProtected(const EgressRequestContext& context) {
  if (context.ambiguous) {
    return std::ranges::any_of(
        pages_, [](const auto& item) { return item.second->guarded; });
  }
  auto it = pages_.find(context.page_id);
  if (it != pages_.end() && it->second->guarded) {
    return true;
  }
  auto* frame = context.document.AsRenderFrameHostIfValid();
  if (frame && EgressDocument::GetOrCreateForCurrentDocument(frame)
                   ->protected_document) {
    return true;
  }
  auto* child =
      frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  for (size_t depth = 0; child && depth < 64; ++depth) {
    child = child->GetFirstWebContentsInLiveOriginalOpenerChain();
    if (!child) {
      break;
    }
    auto owner = pages_.find(PageIdentity::GetOrCreate(profile_, child));
    if (owner != pages_.end() && owner->second->guarded) {
      auto& state = pages_[context.page_id];
      if (!state) {
        state = std::make_unique<PageState>();
      }
      state->guarded = true;
      return true;
    }
  }
  return false;
}
bool EgressController::MayContinue(const EgressRequestContext& context) {
  if (!IsProtected(context)) {
    return true;
  }
  auto it = pages_.find(context.page_id);
  return it != pages_.end() && Current(context, it->second->lease);
}
base::CallbackListSubscription EgressController::ObserveAuthority(
    base::RepeatingClosure callback) {
  return authority_observers_.Add(std::move(callback));
}
bool EgressController::AllowUninspectable(content::RenderFrameHost* frame,
                                          const std::string& kind) {
  if (!frame) {
    const bool guarded = IsProtected({.ambiguous = true});
    if (!guarded && kind != "speculation") {
      ambiguous_transport_used_ = true;
    }
    if (guarded) {
      Receipt("opaque", kind, "send", "ambiguous_provenance", false);
    }
    return !guarded;
  }
  auto* primary = frame->GetMainFrame();
  auto* page = content::WebContents::FromRenderFrameHost(frame);
  EgressRequestContext context{primary->GetWeakDocumentPtr(),
                               PageIdentity::GetOrCreate(profile_, page), kind};
  if (IsProtected(context)) {
    Receipt("opaque", kind, "send", "uninspectable_transport", false);
    return false;
  }
  if (kind != "speculation") {
    EgressDocument::GetOrCreateForCurrentDocument(primary)
        ->opaque_transport_used = true;
    opaque_documents_.push_back(primary->GetWeakDocumentPtr());
    if (opaque_documents_.size() > 4096) {
      ambiguous_transport_used_ = true;
    }
  }
  return true;
}
bool EgressController::ProtectCredential(content::RenderFrameHost* frame,
                                         std::u16string_view username,
                                         std::u16string_view password) {
  if (!LiveFrame(frame)) {
    return false;
  }
  auto* page = content::WebContents::FromRenderFrameHost(frame);
  const std::string id = PageIdentity::GetOrCreate(profile_, page);
  auto it = pages_.find(id);
  // Owner fills without an agent lease mark an opaque producer: a later agent
  // must use a fresh document rather than inherit an untracked saved secret.
  if (it == pages_.end() || it->second->lease.empty()) {
    EgressDocument::GetOrCreateForCurrentDocument(frame->GetMainFrame())
        ->opaque_transport_used = true;
    opaque_documents_.push_back(frame->GetMainFrame()->GetWeakDocumentPtr());
    return it == pages_.end() || !it->second->guarded;
  }
  EgressRequestContext context{frame->GetMainFrame()->GetWeakDocumentPtr(), id,
                               "form"};
  if (!Current(context, it->second->lease)) {
    return false;
  }
  const auto run = String(it->second->lease, "runId");
  auto& records = credentials_by_run_[run];
  if (credentials_by_run_.size() > 128 || records.size() > 62 ||
      password.empty()) {
    return false;
  }
  for (const auto value : {username, password}) {
    if (value.empty()) {
      continue;
    }
    auto normalized = EgressNormalize(base::UTF16ToUTF8(value));
    if (!normalized || normalized->empty() || normalized->size() > 1024) {
      return false;
    }
    const size_t length = std::min<size_t>(12, normalized->size());
    records.push_back({frame->GetLastCommittedOrigin().Serialize(), length,
                       EgressWindows(*normalized, length)});
  }
  EgressDocument::GetOrCreateForCurrentDocument(frame->GetMainFrame())
      ->credential_run_id = run;
  return true;
}
bool EgressController::Current(const EgressRequestContext& context,
                               const base::DictValue& lease) const {
  auto* frame = context.document.AsRenderFrameHostIfValid();
  if (context.ambiguous || !LiveFrame(frame)) {
    return false;
  }
  auto* page = content::WebContents::FromRenderFrameHost(frame);
  auto it = pages_.find(context.page_id);
  const Isolation* isolation = IsolationForPage(context.page_id, frame);
  if (!page || page->GetPrimaryMainFrame() != frame || it == pages_.end() ||
      it->second->person_controlled ||
      String(lease, "controlGeneration") != it->second->control_generation ||
      !isolation || !RunIntentCurrent(*isolation) || String(lease, "isolationId") != isolation->id ||
      String(lease, "runId") != isolation->run_id ||
      String(lease, "taskId") != isolation->task_id ||
      lease.FindInt("taskRevision").value_or(-1) !=
          isolation->task_revision ||
      String(it->second->lease, "leaseId") != String(lease, "leaseId")) {
    return false;
  }
  return String(lease, "documentToken") ==
             EgressDocument::GetOrCreateForCurrentDocument(frame)->token &&
         String(lease, "frameId") == FrameId(frame) &&
         String(lease, "sourceOrigin") == Origin(frame) &&
         it->second->lease.FindDouble("expiresAt").value_or(0) >
             base::Time::Now().InMillisecondsFSinceUnixEpoch();
}
base::DictValue EgressController::PermissionAuthority(
    content::RenderFrameHost* frame) {
  auto* page = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  if (!LiveFrame(frame) || !page || page->GetPrimaryMainFrame() != frame)
    return {};
  const auto id = PageIdentity::GetOrCreate(profile_, page);
  const auto it = pages_.find(id);
  if (it == pages_.end() || !it->second->guarded ||
      !Current({frame->GetWeakDocumentPtr(), id, "permission"}, it->second->lease))
    return {};
  return it->second->lease.Clone();
}
void EgressController::Check(const EgressRequestContext& context,
                             const network::ResourceRequest& request,
                             const net::HttpRequestHeaders& headers,
                             bool final_headers,
                             base::OnceCallback<void(bool)> callback) {
  const std::string request_id = base::UnguessableToken::Create().ToString();
  const std::string phase = final_headers ? "send" : "preflight";
  if (!IsProtected(context)) {
    std::move(callback).Run(true);
    return;
  }
  auto it = pages_.find(context.page_id);
  if (context.ambiguous || it == pages_.end() ||
      !Current(context, it->second->lease)) {
    auto* frame = context.document.AsRenderFrameHostIfValid();
    // A freshly committed document cannot inherit old authority. Hold bounded
    // subresources until runtime installs its new token; stale same-token
    // leases and destroyed documents are denied immediately.
    if (!context.ambiguous && frame && it != pages_.end() &&
        !it->second->lease.empty() &&
        it->second->document.AsRenderFrameHostIfValid() != frame &&
        pending_.size() < 64) {
      pending_.push_back(std::make_unique<Pending>(
          Pending{context, request, headers, final_headers,
                  base::TimeTicks::Now() + base::Seconds(5),
                  String(it->second->lease, "leaseId"), std::move(callback)}));
      if (!pending_timer_.IsRunning()) {
        pending_timer_.Start(FROM_HERE, base::Milliseconds(25),
                             base::BindOnce(&EgressController::RetryPending,
                                            weak_factory_.GetWeakPtr()));
      }
      return;
    }
    Receipt(request_id, context.kind, phase, "ambiguous_or_stale_document",
            false);
    std::move(callback).Run(false);
    return;
  }
  if (final_headers && headers.HasHeader("Cookie")) {
    Receipt(request_id, context.kind, phase, "uninspectable_cookie", false);
    std::move(callback).Run(false);
    return;
  }
  auto projected = ProjectEgressRequest(request, headers, final_headers);
  if (!projected) {
    Receipt(request_id, context.kind, phase, "incomplete_projection", false);
    std::move(callback).Run(false);
    return;
  }
  auto lease = it->second->lease.Clone();
  const std::string destination = url::Origin::Create(request.url).Serialize();
  const auto credentials = credentials_by_run_.find(String(lease, "runId"));
  if (credentials != credentials_by_run_.end()) {
    for (const auto& credential : credentials->second) {
      if (destination == credential.origin) {
        continue;
      }
      for (const auto& variant : projected->normalized) {
        const auto hashes = EgressWindows(variant, credential.length);
        if (std::ranges::any_of(hashes, [&](const auto& hash) {
              return credential.hashes.contains(hash);
            })) {
          Receipt(request_id, context.kind, phase, "protected_credential",
                  false);
          std::move(callback).Run(false);
          return;
        }
      }
    }
  }
  auto evidence = lease.Clone();
  evidence.Remove("sourceOrigin");
  evidence.Remove("initialDestination");
  evidence.Remove("recipientOrigins");
  evidence.Remove("issuedAt");
  evidence.Remove("expiresAt");
  evidence.Set("destination", destination);
  evidence.Set("kind", context.kind);
  const std::set<std::string> methods{"GET", "POST", "PUT", "PATCH", "DELETE"};
  evidence.Set("method",
               methods.contains(request.method) ? request.method : "OTHER");
  evidence.Set("byteCount", static_cast<int>(projected->body_bytes));
  evidence.Set("bodyComplete", true);
  evidence.Set("observedAt", static_cast<double>(static_cast<int64_t>(
      base::Time::Now().InMillisecondsFSinceUnixEpoch())));
  auto params =
      base::WriteJson(base::DictValue()
                          .Set("requestId", request_id)
                          .Set("evidence", std::move(evidence))
                          .Set("projection", std::move(projected->wire)));
  auto* runtime = AuxRuntimeHost::ForProfile(profile_);
  if (!runtime || !params) {
    std::move(callback).Run(false);
    return;
  }
  if (in_flight_.size() >= 256) {
    Receipt(request_id, context.kind, phase, "pending_request_limit", false);
    std::move(callback).Run(false);
    return;
  }
  in_flight_.emplace(
      request_id, std::make_unique<InFlight>(InFlight{
                      context, std::move(lease), phase, std::move(callback)}));
  runtime->CallInternal(
      "egress.request", std::move(*params),
      base::BindOnce(
          [](base::WeakPtr<EgressController> controller, std::string request_id,
             AuxRuntimeHost::Response response) {
            if (controller) {
              controller->Answer(request_id, response.ok, response.result_json,
                                 response.error_code);
            }
          },
          weak_factory_.GetWeakPtr(), request_id));
}
void EgressController::RetryPending() {
  std::vector<std::unique_ptr<Pending>> waiting;
  waiting.swap(pending_);
  for (auto& item : waiting) {
    if (MayContinue(item->context)) {
      Check(item->context, item->request, item->headers, item->final_headers,
            std::move(item->callback));
    } else if (!item->context.document.AsRenderFrameHostIfValid() ||
               !pages_.contains(item->context.page_id) ||
               pages_.at(item->context.page_id)->lease.empty() ||
               item->deadline <= base::TimeTicks::Now()) {
      Receipt("pending", item->context.kind,
              item->final_headers ? "send" : "preflight",
              "new_document_unavailable", false);
      std::move(item->callback).Run(false);
    } else {
      pending_.push_back(std::move(item));
    }
  }
  if (!pending_.empty() && !pending_timer_.IsRunning()) {
    pending_timer_.Start(FROM_HERE, base::Milliseconds(25),
                         base::BindOnce(&EgressController::RetryPending,
                                        weak_factory_.GetWeakPtr()));
  }
}
void EgressController::Answer(const std::string& request_id,
                              bool ok,
                              const std::string& result_json,
                              const std::string& error_code) {
  auto found = in_flight_.find(request_id);
  if (found == in_flight_.end()) {
    return;
  }
  auto request = std::move(found->second);
  in_flight_.erase(found);
  auto result = base::JSONReader::ReadDict(result_json, base::JSON_PARSE_RFC);
  const auto* decision = result ? result->FindDict("decision") : nullptr;
  const bool allowed = ok && result && decision &&
                       String(*result, "requestId") == request_id &&
                       String(*decision, "status") ==
                           (request->phase == "send" ? "allow" : "inspected") &&
                       Current(request->context, request->lease);
  std::string reason = decision ? String(*decision, "reason")
                                : ok ? "runtime_malformed_reply"
                                     : "runtime_unavailable";
  if (!decision && !ok && !error_code.empty() && error_code.size() <= 40 &&
      std::ranges::all_of(error_code, [](char c) {
        return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '_';
      })) {
    reason = "runtime_" + error_code;
  }
  Receipt(request_id, request->context.kind, request->phase, reason, allowed);
  std::move(request->callback).Run(allowed);
}
void EgressController::Receipt(const std::string& id,
                               const std::string& kind,
                               const std::string& phase,
                               const std::string& reason,
                               bool allowed) {
  // Bounded oracle receipt: no address, body, headers, fingerprints or secrets.
  if (receipt_count_++ < 256) {
    LOG(INFO) << "AUX_EGRESS id=" << id << " kind=" << kind
              << " phase=" << phase
              << " outcome=" << (allowed ? "admitted" : "denied")
              << " reason=" << reason;
  }
}
}  // namespace aux

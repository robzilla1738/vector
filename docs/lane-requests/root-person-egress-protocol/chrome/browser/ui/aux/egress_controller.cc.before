// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/egress_controller.h"
#include <limits>

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
#include "base/unguessable_token.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_projection.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/document_user_data.h"
#include "content/public/browser/render_frame_host.h"
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
  std::string dispatched_lease_id;
  uint64_t cdp_dispatch_count = 0;
  base::TimeTicks last_cdp_dispatch_ticks;
  std::optional<NativeCdpRetirementReceipt> cdp_retirement_receipt;
};
struct EgressController::Isolation {
  std::string id;
  std::string run_id;
  std::string task_id;
  int task_revision;
  content::StoragePartitionConfig config;
};
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
                                         int task_revision) {
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
    it = isolations_by_run_.emplace(run_id, std::move(isolation)).first;
  } else if (it->second->id != isolation_id ||
             it->second->task_id != task_id ||
             it->second->task_revision != task_revision) {
    LOG(ERROR) << "AUX_ISOLATION_DIAG reason=run_scope_mismatch";
    return false;
  }
  const std::string page_id = PageIdentity::GetOrCreate(profile_, page);
  if (isolation_run_by_page_.contains(page_id)) {
    LOG(ERROR) << "AUX_ISOLATION_DIAG reason=duplicate_page";
    return false;
  }
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
void EgressController::ReleaseIsolation(const std::string& page_id) {
  const auto owner = isolation_run_by_page_.find(page_id);
  if (owner == isolation_run_by_page_.end()) return;
  const std::string run_id = owner->second;
  isolation_run_by_page_.erase(owner);
  created_isolation_receipts_.erase(page_id);
  auto it = isolations_by_run_.find(run_id);
  if (it == isolations_by_run_.end()) return;
  const std::string isolation_id = it->second->id;
  CancelChecks({page_id}, false);
  pages_.erase(page_id);
  if (std::any_of(isolation_run_by_page_.begin(),
                  isolation_run_by_page_.end(),
                  [&run_id](const auto& entry) {
                    return entry.second == run_id;
                  })) {
    IsolationReceipt("released", run_id, page_id, isolation_id, nullptr,
                     "shared_partition_retained");
    return;
  }
  const auto config = it->second->config;
  isolations_by_run_.erase(it);
  credentials_by_run_.erase(run_id);
  authority_observers_.Notify();
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
  const Isolation* isolation = IsolationForPage(page_id, frame);
  if (!isolation || String(*lease, "isolationId") != isolation->id ||
      String(*lease, "runId") != isolation->run_id ||
      String(*lease, "taskId") != isolation->task_id ||
      lease->FindInt("taskRevision").value_or(-1) !=
          isolation->task_revision) {
    return Fault("Browser request lease is not bound to this native task partition");
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
        admission.navigation_transition_expiry <= now) {
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
  state->navigation_transition_id.clear();
  state->navigation_transition_document = {};
  state->navigation_transition_expiry = 0;
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
  state.control_generation = base::UnguessableToken::Create().ToString();
  state.acknowledged_context.clear();
  state.navigation_transition_id.clear();
  state.navigation_transition_document = {};
  state.navigation_transition_expiry = 0;
  state.lease.clear();
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

bool EgressController::RecordFinalCdpDispatch(
    const EgressRequestContext& context, const base::DictValue& original_lease) {
  if (owner_mutations_.pending() || !Current(context, original_lease))
    return false;
  auto it = pages_.find(context.page_id);
  if (it == pages_.end())
    return false;
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
      !isolation || it->second->person_controlled ||
      String(original_lease, "controlGeneration") != it->second->control_generation ||
      String(original_lease, "isolationId") != isolation->id ||
      String(original_lease, "runId") != isolation->run_id ||
      String(original_lease, "taskId") != isolation->task_id ||
      original_lease.FindInt("taskRevision").value_or(-1) != isolation->task_revision ||
      it->second->lease.FindDouble("expiresAt").value_or(0) <=
          base::Time::Now().InMillisecondsFSinceUnixEpoch())
    return false;
  auto expected = original_lease.Clone();
  auto installed = it->second->lease.Clone();
  expected.Remove("expiresAt");
  installed.Remove("expiresAt");
  return !installed.empty() && expected == installed;
}

base::DictValue EgressController::RetireCdpNavigation(
    const base::DictValue& original_lease,
    const content::WeakDocumentPtr& committed_document) {
  if (!HasOriginalCdpNavigationAuthority(original_lease, committed_document))
    return Fault("Original navigation authority was retired before its receipt");
  auto* frame = committed_document.AsRenderFrameHostIfValid();
  auto* page = content::WebContents::FromRenderFrameHost(frame);
  auto* document = EgressDocument::GetOrCreateForCurrentDocument(frame);
  if (String(original_lease, "documentToken") == document->token)
    return Fault("Navigation has no committed replacement document");
  const std::string page_id = String(original_lease, "tabId");
  auto& state = *pages_.find(page_id)->second;
  const std::string original_lease_id = String(original_lease, "leaseId");
  state.navigation_transition_id = base::UnguessableToken::Create().ToString();
  state.navigation_transition_document = committed_document;
  state.navigation_transition_expiry = state.lease.FindDouble("expiresAt").value_or(0);
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
    return context;
  }
  auto result = base::DictValue().Set("navigationTransitionId", state.navigation_transition_id)
      .Set("context", admitted->Clone());
  auto weak = weak_factory_.GetWeakPtr();
  CancelChecks({page_id}, false, original_lease_id);
  if (weak)
    authority_observers_.Notify();
  return Result(std::move(result));
}

void EgressController::Disconnect() {
  person_read_retirement_generation_ =
      base::UnguessableToken::Create().ToString();
  for (auto& [id, state] : pages_) {
    state->control_generation = base::UnguessableToken::Create().ToString();
    state->acknowledged_context.clear();
    state->navigation_transition_id.clear();
    state->navigation_transition_document = {};
    state->navigation_transition_expiry = 0;
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
      !isolation || String(lease, "isolationId") != isolation->id ||
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

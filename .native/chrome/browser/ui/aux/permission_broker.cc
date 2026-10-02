// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/permission_broker.h"

#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/unguessable_token.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "components/permissions/permission_request.h"
#include "components/permissions/request_type.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "url/origin.h"

namespace aux {
WEB_CONTENTS_USER_DATA_KEY_IMPL(PermissionBroker);
namespace {
bool Supported(permissions::RequestType type) {
  switch (type) {
    case permissions::RequestType::kNotifications:
    case permissions::RequestType::kClipboard:
    case permissions::RequestType::kIdleDetection:
    case permissions::RequestType::kLocalFonts:
    case permissions::RequestType::kMultipleDownloads:
    case permissions::RequestType::kKeyboardLock:
    case permissions::RequestType::kPointerLock:
      return true;
    default:
      return false;
  }
}
}  // namespace
PermissionBroker::PermissionBroker(content::WebContents* contents)
    : content::WebContentsUserData<PermissionBroker>(*contents),
      manager_(permissions::PermissionRequestManager::FromWebContents(contents)) {
  if (manager_) manager_->AddObserver(this);
  auto* profile = Profile::FromBrowserContext(contents->GetBrowserContext());
  egress_ = EgressController::ForProfile(profile)->GetWeakPtr();
  mutation_subscription_ = egress_->owner_mutations().Observe(base::BindRepeating(
      &PermissionBroker::OnOwnerMutationChanged, base::Unretained(this)));
  authority_subscription_ = egress_->ObserveAuthority(
      base::BindRepeating([](PermissionBroker* self) {
        if (!self->request_.empty() && !self->Current()) self->Cancel();
      }, base::Unretained(this)));
}
PermissionBroker::~PermissionBroker() {
  mutation_subscription_ = {};
  authority_subscription_ = {};
  Cancel();
  if (manager_) manager_->RemoveObserver(this);
}
void PermissionBroker::RetireReservation(const std::string& batch, const std::string& reservation) {
  if (request_.empty() || *request_.FindString("batchId") != batch) return;
  // A runtime reservation may be retired before its initial ALLOW reaches UI.
  // Same exact batch and authenticated transport fence that queued reply too.
  if (!reservation_id_.empty() && reservation_id_ != reservation) return;
  Cancel();
}
void PermissionBroker::Cancel() {
  if (runtime_ && !request_.empty() && !reservation_id_.empty()) {
    auto json = base::WriteJson(base::DictValue().Set("batchId", *request_.FindString("batchId"))
        .Set("reservationId", reservation_id_));
    if (json) runtime_->CallInternal("permission.finalize", std::move(*json),
        base::BindOnce([](AuxRuntimeHost::Response) {}));
  }
  if (runtime_ && !request_.empty()) {
    auto json = base::WriteJson(base::DictValue().Set("batchId", *request_.FindString("batchId")));
    if (json) runtime_->CallInternal("permission.invalidate", std::move(*json),
        base::BindOnce([](AuxRuntimeHost::Response) {}));
  }
  runtime_.reset();
  pending_approval_id_.clear();
  retry_.Stop();
  deadline_timer_.Stop();
  held_allow_ = false;
  fresh_inflight_ = false;
  fresh_nonce_ = 0;
  reservation_id_.clear();
  effect_receipt_.reset();
  weak_factory_.InvalidateWeakPtrs();
  request_.clear();
  authority_.clear();
  requests_.clear();
  document_ = {};
}
void PermissionBroker::OnPromptRemoved() {
  // A tab switch removes the view, not the manager's exact live request batch.
  if (!Current()) Cancel();
}
void PermissionBroker::OnPromptCreationFailedHiddenTab() { OnPromptAdded(); }
void PermissionBroker::OnRequestsFinalized() { Cancel(); }
void PermissionBroker::OnNavigation(content::NavigationHandle*) { Cancel(); }
void PermissionBroker::OnPermissionRequestManagerDestructed() {
  manager_ = nullptr;
  Cancel();
}
void PermissionBroker::OnPromptAdded() {
  if (!request_.empty() && Current()) return;
  Cancel();
  if (!manager_ || manager_->Requests().empty() || manager_->Requests().size() > 8)
    return;
  auto* first = manager_->Requests().front().get();
  auto* frame = content::RenderFrameHost::FromID(first->get_requesting_frame_id());
  auto* profile = Profile::FromBrowserContext(GetWebContents().GetBrowserContext());
  if (profile->IsOffTheRecord()) return;
  authority_ = EgressController::ForProfile(profile)->PermissionAuthority(frame);
  if (authority_.empty()) return;
  base::ListValue types;
  for (const auto& request : manager_->Requests()) {
    if (!Supported(request->request_type()) || request->IsEmbeddedPermissionElementInitiated() ||
        request->get_requesting_frame_id() != first->get_requesting_frame_id() ||
        request->requesting_origin() != first->requesting_origin() ||
        request->embedding_origin() != first->embedding_origin()) {
      Cancel();
      return;
    }
    requests_.push_back(request->GetWeakPtr());
    types.Append(permissions::PermissionKeyForRequestType(request->request_type()));
  }
  if (first->requesting_origin() != first->embedding_origin()) { Cancel(); return; }
  document_ = frame->GetWeakDocumentPtr();
  for (const char* key : {"leaseId", "isolationId", "profileId", "runId", "taskId",
                          "taskRevision", "tabId", "frameId", "documentToken", "documentEpoch"})
    if (const auto* value = authority_.Find(key)) request_.Set(key, value->Clone());
  request_.Set("batchId", base::UnguessableToken::Create().ToString());
  request_.Set("requestedAt", static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch()));
  request_.Set("requestingOrigin", url::Origin::Create(first->requesting_origin()).Serialize());
  request_.Set("embeddingOrigin", url::Origin::Create(first->embedding_origin()).Serialize());
  request_.Set("permissionTypes", std::move(types));
  mutation_failure_epoch_ = egress_->owner_mutations().failure_epoch();
  deadline_ = base::TimeTicks::Now() + base::Seconds(120);
  deadline_timer_.Start(FROM_HERE, base::Seconds(120), this, &PermissionBroker::Cancel);
  Request();
}
bool PermissionBroker::Current() {
  auto* frame = document_.AsRenderFrameHostIfValid();
  if (!egress_ || egress_->owner_mutations().failure_epoch() != mutation_failure_epoch_ ||
      !manager_ || !frame || request_.empty() || base::TimeTicks::Now() >= deadline_ ||
      !manager_->IsRequestInProgress() || manager_->Requests().size() != requests_.size())
    return false;
  auto* profile = Profile::FromBrowserContext(GetWebContents().GetBrowserContext());
  auto current_authority = EgressController::ForProfile(profile)->PermissionAuthority(frame);
  // Renewal extends the same immutable lease; expiry is already checked by
  // PermissionAuthority. A changed document/task/grant identity still cancels.
  current_authority.Remove("expiresAt");
  auto captured_authority = authority_.Clone();
  captured_authority.Remove("expiresAt");
  if (current_authority.empty() || current_authority != captured_authority)
    return false;
  for (size_t i = 0; i < requests_.size(); ++i)
    if (!requests_[i] || manager_->Requests()[i].get() != requests_[i].get()) return false;
  return true;
}
void PermissionBroker::Request() {
  if (!Current()) { Cancel(); return; }
  auto* profile = Profile::FromBrowserContext(GetWebContents().GetBrowserContext());
  auto json = base::WriteJson(request_);
  auto* runtime = AuxRuntimeHost::ForProfile(profile);
  if (!runtime || !json) { Cancel(); return; }
  runtime_ = runtime->GetWeakPtr();
  runtime->CallInternal("permission.request", std::move(*json), base::BindOnce(
      [](base::WeakPtr<PermissionBroker> self, AuxRuntimeHost::Response reply) {
        if (self) self->Answer(reply.ok, reply.result_json);
      }, weak_factory_.GetWeakPtr()));
}
void PermissionBroker::OnOwnerMutationChanged() {
  if (request_.empty()) return;
  if (!Current()) { Cancel(); return; }
  if (!egress_->owner_mutations().pending() && held_allow_) {
    held_allow_ = false;
    RequestFresh();
  }
}
void PermissionBroker::Answer(bool ok, const std::string& json) {
  if (!Current()) { Cancel(); return; }
  auto result = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
  const auto* batch = result ? result->FindString("batchId") : nullptr;
  if (!ok || !batch || *batch != *request_.FindString("batchId")) {
    Cancel(); return;
  }
  const auto* decision = result->FindString("decision");
  if (decision && *decision == "pending") {
    const auto* approval = result->FindString("approvalId");
    if (!approval || approval->empty() || (!pending_approval_id_.empty() && pending_approval_id_ != *approval)) { Cancel(); return; }
    pending_approval_id_ = *approval;
    retry_.Start(FROM_HERE, base::Seconds(1), this, &PermissionBroker::Request);
    return;
  }
  if (!decision || (*decision != "allow" && *decision != "deny")) { Cancel(); return; }
  const bool allow = *decision == "allow";
  if (!allow) { Dispatch(false); return; }
  const auto* reservation = result->FindString("reservationId");
  if (!reservation || reservation->size() != 36 || !reservation_id_.empty()) { Cancel(); return; }
  reservation_id_ = *reservation;
  retry_.Stop();
  if (egress_->owner_mutations().pending()) { held_allow_ = true; return; }
  RequestFresh();
}
void PermissionBroker::RequestFresh() {
  if (!Current() || !runtime_ || reservation_id_.empty() || fresh_inflight_ || fresh_nonce_ >= 256) { Cancel(); return; }
  if (egress_->owner_mutations().pending()) { held_allow_ = true; return; }
  const int nonce = ++fresh_nonce_;
  auto json = base::WriteJson(base::DictValue().Set("batchId", *request_.FindString("batchId"))
      .Set("reservationId", reservation_id_).Set("nonce", nonce));
  if (!json) { Cancel(); return; }
  fresh_inflight_ = true;
  runtime_->CallInternal("permission.revalidate", std::move(*json), base::BindOnce(
      [](base::WeakPtr<PermissionBroker> self, int nonce, AuxRuntimeHost::Response reply) {
        if (self) self->FreshAnswer(nonce, reply.ok, reply.result_json);
      }, weak_factory_.GetWeakPtr(), nonce));
}
void PermissionBroker::FreshAnswer(int nonce, bool ok, const std::string& json) {
  if (!Current() || !fresh_inflight_ || nonce != fresh_nonce_) { Cancel(); return; }
  fresh_inflight_ = false;
  auto result = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
  auto receipt = ok && result ? PermissionEffectReceipt::Parse(*result,
      *request_.FindString("batchId"), reservation_id_, nonce) : std::nullopt;
  if (!receipt) { Cancel(); return; }
  if (egress_->owner_mutations().pending()) { held_allow_ = true; return; }
  effect_receipt_ = std::move(receipt);
  Dispatch(true);
}
void PermissionBroker::Dispatch(bool allow) {
  // Revalidate the exact live request batch and lease immediately before effects.
  if (!Current()) { Cancel(); return; }
  auto* manager = manager_.get();
  std::vector<const permissions::PermissionRequest*> requests;
  for (const auto& request : requests_) requests.push_back(request.get());
  const auto self = weak_factory_.GetWeakPtr();
  const bool resolved = manager->ResolveRequestsFromBrowser(requests, allow, base::BindRepeating(
      [](base::WeakPtr<PermissionBroker> broker, bool allow) {
        if (!broker || !broker->Current()) return false;
        if (!allow) return true;
        auto* profile = Profile::FromBrowserContext(broker->GetWebContents().GetBrowserContext());
        return !broker->egress_->owner_mutations().pending() &&
            broker->effect_receipt_ && broker->effect_receipt_->CanGrant(profile);
      }, self, allow));
  // Finalization/destruction cancels through the real manager observer. Never
  // use the original broker pointer after effects.
  if (!self) return;
  if (allow && self->Current() && self->egress_->owner_mutations().pending()) {
    self->held_allow_ = true;
    self->effect_receipt_.reset();
    self->retry_.Stop();
    return;
  }
  if (!resolved && allow && self->Current()) {
    // Authority refused this queued ALLOW, not a durable site denial. Retire
    // only this exact untouched batch through the manager cancellation helpers.
    // Pending owner mutations above instead hold for fresh authorization.
    self->manager_->CancelRequestsFromBrowser(requests);
    // Manager effects/observers may destroy or finalize this broker.
    if (!self) return;
  }
  self->Cancel();
}
}  // namespace aux

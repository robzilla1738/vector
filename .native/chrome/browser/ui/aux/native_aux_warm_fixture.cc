// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_aux_warm_fixture.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <utility>
#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/ui/aux/native_aux_warm_creation_ticket.h"
#include "chrome/browser/ui/aux/native_aux_warm_owner.h"
#include "chrome/browser/ui/aux/native_presentation_record_codec.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "ui/views/widget/widget.h"
#include "content/public/browser/browser_thread.h"
namespace aux {
NativeAuxWarmFixture::NativeAuxWarmFixture(std::unique_ptr<NativeAuxWarmOwner> original)
    : original_(std::move(original)) {}
NativeAuxWarmFixture::~NativeAuxWarmFixture() {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  if (ticket_) ticket_->Cancel("aux_warm_fixture_retired");
  auto reply = std::move(complete_);
  if (reply) std::move(reply).Run(Refusal("aux_warm_fixture_retired"));
}
bool NativeAuxWarmFixture::MatchesOriginal(base::WeakPtr<WebUIBrowserUI> original) const {
  const auto* owner = ticket_ ? ticket_->owner() : original_.get();
  return !completed_ && owner && owner->MatchesOriginalDocument(original) &&
      (owner->BeforeCreation() || (ticket_ && ticket_->Stable()));
}
base::WeakPtr<BrowserWindowInterface> NativeAuxWarmFixture::CleanupWindow(
    base::WeakPtr<WebUIBrowserUI> original) const {
  if (!ticket_ || !child_bound_ || !ticket_->owner() ||
      !ticket_->owner()->MatchesOriginalDocument(original)) return {};
  const auto* owner = ticket_->owner();
  if (!(owner->WithCreated() || (ticket_->InActualCreation() && owner->DuringCreation()))) return {};
  return owner->created_browser();
}
base::DictValue NativeAuxWarmFixture::Refusal(const char* reason) const {
  auto record = base::DictValue().Set("producer", "aux-native-warm-window")
      .Set("version", 1).Set("status", "refused").Set("reason", reason)
      .Set("measured", false).Set("earliestPresentationProven", false);
  if (ticket_) {
    record.Set("requestNonce", ticket_->nonce().ToString());
    record.Set("sampleSequence", "2");
  }
  return record;
}
void NativeAuxWarmFixture::Prepare(base::WeakPtr<WebUIBrowserUI> original, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (reply.is_null()) return;
  if (used_ || !original_ || !original_->MatchesOriginalRequest(original)) {
    std::move(reply).Run(Refusal("unavailable_original_aux_warm_scope")); return;
  }
  used_ = true; original_ui_ = original;
  ticket_ = std::make_unique<NativeAuxWarmCreationTicket>(std::move(original_),
      base::BindOnce([](base::WeakPtr<NativeAuxWarmFixture> fixture,
                       base::WeakPtr<BrowserWindowInterface>, base::WeakPtr<views::Widget>) {
        if (fixture) fixture->Created();
      }, weak_factory_.GetWeakPtr()),
      base::BindOnce(&NativeAuxWarmFixture::Refused, weak_factory_.GetWeakPtr()),
      base::BindOnce(&NativeAuxWarmFixture::Observed, weak_factory_.GetWeakPtr()));
  const auto weak = weak_factory_.GetWeakPtr();
  if (!ticket_->Prepare() || !weak || !MatchesOriginal(original)) {
    if (weak) std::move(reply).Run(result_ ? result_->Clone() : Refusal("aux_warm_preparation_refused"));
    return;
  }
  deadline_ = ticket_->prepared_at() + base::Seconds(5);
  timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(
      &NativeAuxWarmFixture::Refused, weak_factory_.GetWeakPtr(), "aux_warm_fixture_timeout"));
  const auto* owner = ticket_->owner();
  const auto& launch = owner->original_launch();
  const auto& process = owner->original_process();
  auto ready = base::DictValue().Set("producer", "aux-native-warm-window")
      .Set("version", 1).Set("status", "ready").Set("measured", false)
      .Set("requestNonce", ticket_->nonce().ToString()).Set("sampleSequence", "2")
      .Set("windowId", owner->original_shell().window_id).Set("browserPid", launch.browser_pid)
      .Set("browserProcessUuid", process.process_uuid)
      .Set("browserProcessStart", base::NumberToString(process.process_start_absolute))
      .Set("trial", launch.trial).Set("launchReceiptNonce", launch.receipt_nonce)
      .Set("launchReceiptSha256", launch.original_receipt_sha256);
  AppendNativePresentationTick(ready, "preparedUs", ticket_->prepared_at());
  AppendNativePresentationTick(ready, "launchUs", launch.launch);
  if (!MatchesOriginal(original)) {
    std::move(reply).Run(Refusal("original_owner_changed_before_ready")); return;
  }
  std::move(reply).Run(std::move(ready));
}
void NativeAuxWarmFixture::Complete(base::WeakPtr<WebUIBrowserUI> original, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (reply.is_null()) return;
  if (!used_ || completed_ || complete_ || !ticket_ || !MatchesOriginal(original) ||
      deadline_.is_null() || base::TimeTicks::Now() > deadline_) {
    std::move(reply).Run(Refusal("unmatched_aux_warm_completion")); return;
  }
  complete_ = std::move(reply);
  Deliver();
}
void NativeAuxWarmFixture::Created() {
  if (child_bound_ || !ticket_ || !ticket_->InActualCreation()) {
    Refused("multiple_or_stale_aux_warm_child"); return;
  }
  child_bound_ = true;
}
void NativeAuxWarmFixture::Observed(base::DictValue record) {
  if (result_ || completed_) return;
  if (record.FindBool("measured").value_or(false) &&
      (!child_bound_ || !ticket_ || !ticket_->MeasuredDeliveryStable() ||
       !MatchesOriginal(original_ui_) || base::TimeTicks::Now() > deadline_)) {
    Refused("aux_warm_scope_changed_at_observation"); return;
  }
  result_ = std::move(record); Deliver();
}
void NativeAuxWarmFixture::Refused(const char* reason) {
  if (completed_ || result_) return;
  result_ = Refusal(reason); Deliver();
}
void NativeAuxWarmFixture::Deliver() {
  if (!result_ || !complete_) return;
  if (result_->FindBool("measured").value_or(false) &&
      (!ticket_ || !ticket_->MeasuredDeliveryStable() || !MatchesOriginal(original_ui_) ||
       base::TimeTicks::Now() > deadline_)) result_ = Refusal("aux_warm_owner_changed_before_receipt");
  completed_ = true; timeout_.Stop(); weak_factory_.InvalidateWeakPtrs();
  auto reply = std::move(complete_); auto result = std::move(*result_); result_.reset();
  // Retire async authority before serializing, retaining actual failure bytes.
  if (ticket_) ticket_->Cancel("aux_warm_fixture_complete");
  // Keep the original held lease and exact child capability for mailbox
  // inventory/cleanup; cancelled ticket authority cannot measure again.
  original_.reset();
  if (reply) std::move(reply).Run(std::move(result));
}
}  // namespace aux
#endif

// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_warm_creation_ticket.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <utility>
#include "base/no_destructor.h"
#include "content/public/browser/browser_thread.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_owner.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
namespace aux {
namespace {
base::WeakPtr<NativeStockWarmCreationTicket>& PublishedTicket() {
  static base::NoDestructor<base::WeakPtr<NativeStockWarmCreationTicket>> ticket;
  return *ticket;
}
void Unpublish(NativeStockWarmCreationTicket* actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (PublishedTicket().get() == actual) PublishedTicket().reset();
}
}  // namespace
NativeStockWarmCreationTicket::NativeStockWarmCreationTicket(
    std::unique_ptr<NativeStockWarmOwner> owner, Created created, Refused refused)
    : owner_(std::move(owner)), created_(std::move(created)), refused_(std::move(refused)) {}
NativeStockWarmCreationTicket::~NativeStockWarmCreationTicket() {
  Unpublish(this);
  weak_factory_.InvalidateWeakPtrs();
}
base::WeakPtr<NativeStockWarmCreationTicket>
NativeStockWarmCreationTicket::PreparedTicket() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  return PublishedTicket();
}
bool NativeStockWarmCreationTicket::InActualCreation() const {
  return entered_ && !ended_ && !failed_;
}
bool NativeStockWarmCreationTicket::Prepare() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  // Refuse ambiguity rather than replacing an existing owner's authority.
  if (PublishedTicket()) {
    Cancel("another_warm_ticket_is_prepared"); return false;
  }
  if (prepared_ || failed_ || !owner_ || !created_ || !refused_ || !owner_->BeforeCreation()) {
    Cancel("unavailable_original_warm_owner"); return false;
  }
  nonce_ = base::UnguessableToken::Create(); prepared_at_ = base::TimeTicks::Now(); prepared_ = true; PublishedTicket() = GetWeakPtr(); return true;
}
bool NativeStockWarmCreationTicket::BeginActualCommand(
    BrowserWindowInterface* original, int command) {
  if (!prepared_ || entered_ || failed_ || !owner_ || command != IDC_NEW_WINDOW ||
      owner_->original_browser().get() != original || !owner_->BeforeCreation() ||
      base::TimeTicks::Now() > prepared_at_ + base::Seconds(5)) {
    Cancel("invalid_original_warm_command"); return false;
  }
  const auto weak = weak_factory_.GetWeakPtr();
  auto input = ReadNativeWarmCurrentKeyDown(owner_->original_browser().get(),
      [weak] { return weak && weak->owner_ && weak->owner_->BeforeCreation(); });
  if (!weak) return false;
  if (!input || input->original_event_time < prepared_at_ || !owner_->BeforeCreation()) { Cancel("unavailable_original_warm_key"); return false; }
  entered_ = true; input_ = std::move(input); return true;
}
void NativeStockWarmCreationTicket::AddedToWidget(BrowserView* actual) {
  if (failed_ || !entered_ || ended_ || confirmed_ || !owner_ || !input_ || !actual) {
    Cancel("warm_view_outside_actual_creation"); return;
  }
  if (view_ || !owner_->BindCreated(actual->browser())) {
    Cancel("multiple_or_foreign_warm_views"); return;
  }
  view_ = actual->GetAsWeakPtr();
  if (!view_ || !owner_->DuringCreation()) { Cancel("stale_actual_warm_view"); return; }
  auto callback = std::move(created_);
  // The session installs early Display registration here, before native Show.
  // The callback may synchronously retire this ticket; access nothing afterward.
  if (callback) std::move(callback).Run(view_);
}
bool NativeStockWarmCreationTicket::ConfirmReturned(BrowserWindowInterface* actual_returned) {
  if (failed_ || !entered_ || ended_ || confirmed_ || !view_ || !owner_ ||
      owner_->created_browser().get() != actual_returned || view_->browser() != actual_returned ||
      !owner_->WithCreated()) { Cancel("unmatched_exact_warm_creation_return"); return false; }
  confirmed_ = true; return true;
}
void NativeStockWarmCreationTicket::EndActualCommand() {
  if (!entered_ || ended_ || !confirmed_ || !Stable()) {
    Cancel("unfinished_actual_warm_creation"); return;
  }
  ended_ = true; Unpublish(this);
}
bool NativeStockWarmCreationTicket::Stable() const {
  if (failed_ || !entered_ || !owner_ || !input_ || !view_ ||
      !(InActualCreation() && !confirmed_ ? owner_->DuringCreation() : owner_->WithCreated()) ||
      view_->browser() != owner_->created_browser().get()) return false;
  const auto now = base::TimeTicks::Now();
  return now >= input_->original_event_time && now <= input_->original_event_time + base::Seconds(5);
}
bool NativeStockWarmCreationTicket::Confirmed() const { return confirmed_ && Stable(); }
void NativeStockWarmCreationTicket::Cancel(const char* reason) {
  if (std::exchange(failed_, true)) return;
  Unpublish(this);
  weak_factory_.InvalidateWeakPtrs(); created_.Reset();
  auto callback = std::move(refused_);
  // Keep the original retained lease through caller/session teardown. The
  // callback may destroy this owner; no access follows its invocation.
  if (callback) std::move(callback).Run(reason);
}
const NativeStockWarmOwner* NativeStockWarmCreationTicket::owner() const { return owner_.get(); }
const std::optional<NativeWarmInput>& NativeStockWarmCreationTicket::input() const { return input_; }
const base::UnguessableToken& NativeStockWarmCreationTicket::nonce() const { return nonce_; }
base::TimeTicks NativeStockWarmCreationTicket::prepared_at() const { return prepared_at_; }
base::WeakPtr<NativeStockWarmCreationTicket> NativeStockWarmCreationTicket::GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
}  // namespace aux
#endif

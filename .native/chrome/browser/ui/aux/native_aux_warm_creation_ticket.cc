// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_aux_warm_creation_ticket.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <utility>
#include "base/no_destructor.h"
#include "chrome/browser/ui/aux/native_aux_warm_owner.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
base::WeakPtr<NativeAuxWarmCreationTicket>& PublishedTicket() {
  static base::NoDestructor<base::WeakPtr<NativeAuxWarmCreationTicket>> ticket;
  return *ticket;
}
base::WeakPtr<NativeAuxWarmCreationTicket>& CreatedTicket() {
  static base::NoDestructor<base::WeakPtr<NativeAuxWarmCreationTicket>> ticket;
  return *ticket;
}
void ClearCreated(NativeAuxWarmCreationTicket* actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (CreatedTicket().get() == actual) CreatedTicket().reset();
}
void Unpublish(NativeAuxWarmCreationTicket* actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (PublishedTicket().get() == actual) PublishedTicket().reset();
}
}  // namespace
NativeAuxWarmCreationTicket::NativeAuxWarmCreationTicket(
    std::unique_ptr<NativeAuxWarmOwner> owner, Created created, Refused refused, Observed observed)
    : owner_(std::move(owner)), created_(std::move(created)), refused_(std::move(refused)),
      observed_(std::move(observed)) {}
NativeAuxWarmCreationTicket::~NativeAuxWarmCreationTicket() {
  Unpublish(this); ClearCreated(this);
  weak_factory_.InvalidateWeakPtrs();
}
base::WeakPtr<NativeAuxWarmCreationTicket> NativeAuxWarmCreationTicket::PreparedTicket() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  return PublishedTicket();
}
base::WeakPtr<NativeAuxWarmCreationTicket> NativeAuxWarmCreationTicket::ForCreatedChild(
    BrowserWindowInterface* actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  const auto ticket = CreatedTicket();
  return ticket && ticket->OwnsCreatedChildForObservation(actual) && ticket ? ticket :
      base::WeakPtr<NativeAuxWarmCreationTicket>();
}
bool NativeAuxWarmCreationTicket::Prepare() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (PublishedTicket() || CreatedTicket() || prepared_ || failed_ || !owner_ || !created_ ||
      !refused_ || !observed_ || !owner_->BeforeCreation()) {
    Cancel("unavailable_original_aux_warm_owner"); return false;
  }
  nonce_ = base::UnguessableToken::Create();
  prepared_at_ = base::TimeTicks::Now(); deadline_ = prepared_at_ + base::Seconds(5);
  prepared_ = true; PublishedTicket() = GetWeakPtr(); return true;
}
bool NativeAuxWarmCreationTicket::WithinDeadline() const {
  const auto now = base::TimeTicks::Now();
  return prepared_ && !failed_ && now >= prepared_at_ && now <= deadline_ &&
      (!input_ || (now >= input_->original_event_time &&
                   now <= input_->original_event_time + base::Seconds(5)));
}
std::optional<base::UnguessableToken>
NativeAuxWarmCreationTicket::CaptureRegisteredShortcut(
    BrowserWindowInterface* original, std::string_view registered_command) {
  if (!WithinDeadline() || entered_ || input_ || !owner_ ||
      registered_command != "new-window" || owner_->original_browser().get() != original ||
      !owner_->BeforeCreation()) {
    Cancel("invalid_original_aux_warm_shortcut"); return std::nullopt;
  }
  const auto weak = GetWeakPtr();
  auto input = ReadNativeWarmCurrentKeyDown(original,
      [weak] { return weak && weak->owner_ && weak->owner_->BeforeCreation(); });
  if (!weak) return std::nullopt;
  if (!input || input->original_event_time < prepared_at_ ||
      !WithinDeadline() || !owner_->BeforeCreation()) {
    Cancel("unavailable_original_aux_warm_key"); return std::nullopt;
  }
  input_ = std::move(input);
  dispatch_receipt_ = base::UnguessableToken::Create();
  return dispatch_receipt_;
}
bool NativeAuxWarmCreationTicket::BeginActualCommand(
    base::WeakPtr<WebUIBrowserUI> original,
    const base::UnguessableToken& delivered_receipt) {
  if (!WithinDeadline() || entered_ || !input_ || !owner_ ||
      dispatch_receipt_.is_empty() || delivered_receipt != dispatch_receipt_ ||
      !owner_->MatchesOriginalRequest(original)) {
    Cancel("unmatched_original_aux_warm_dispatch"); return false;
  }
  // Consume once before the real production command runs. It conveys no new
  // permission: the ordinary registered dispatcher retains every effect check.
  dispatch_receipt_ = base::UnguessableToken(); entered_ = true; return true;
}
bool NativeAuxWarmCreationTicket::InActualCreation() const {
  return entered_ && !ended_ && !failed_ && WithinDeadline();
}
void NativeAuxWarmCreationTicket::AddedToWidget(
    BrowserWindowInterface* actual, views::Widget* widget) {
  if (!InActualCreation() || confirmed_ || !owner_ || !input_ || child_ || widget_ ||
      !actual || !widget || !owner_->BindCreated(actual, widget)) {
    Cancel("foreign_or_multiple_aux_warm_creation"); return;
  }
  child_ = owner_->created_browser(); widget_ = widget->GetWeakPtr();
  if (!child_ || !widget_ || !owner_->DuringCreation() || !WithinDeadline()) {
    Cancel("stale_constructing_aux_warm_child"); return;
  }
  if (CreatedTicket()) { Cancel("multiple_active_aux_warm_child"); return; }
  CreatedTicket() = GetWeakPtr();
  auto callback = std::move(created_);
  if (callback) std::move(callback).Run(child_, widget_);
  // Callback may retire the session and this ticket. No access follows.
}
bool NativeAuxWarmCreationTicket::OwnsCreatedChildForObservation(BrowserWindowInterface* actual) const {
  return WithinDeadline() && entered_ && input_ && child_ && widget_ && !widget_->IsClosed() &&
      child_.get() == actual && owner_ && child_.get() == owner_->created_browser().get() &&
      (InActualCreation() && !confirmed_ ? owner_->DuringCreation() : confirmed_ && owner_->WithCreated());
}
bool NativeAuxWarmCreationTicket::ConfirmReturned(BrowserWindowInterface* actual) {
  if (!InActualCreation() || confirmed_ || !child_ || !widget_ || !owner_ ||
      child_.get() != actual || owner_->created_browser().get() != actual ||
      !owner_->WithCreated()) {
    Cancel("unmatched_returned_aux_warm_window"); return false;
  }
  confirmed_ = true; return true;
}
void NativeAuxWarmCreationTicket::EndActualCommand() {
  if (!InActualCreation() || !confirmed_ || !Stable()) {
    Cancel("unfinished_actual_aux_warm_creation"); return;
  }
  ended_ = true; Unpublish(this);
}
bool NativeAuxWarmCreationTicket::Stable() const {
  return WithinDeadline() && entered_ && input_ && child_ && widget_ && !widget_->IsClosed() &&
      owner_ && child_.get() == owner_->created_browser().get() &&
      (InActualCreation() && !confirmed_ ? owner_->DuringCreation() : owner_->WithCreated());
}
bool NativeAuxWarmCreationTicket::Confirmed() const { return confirmed_ && Stable(); }
void NativeAuxWarmCreationTicket::Delivered(base::WeakPtr<WebUIBrowserUI> child, base::DictValue record) {
  if (!observed_) return;
  if (record.FindBool("measured").value_or(false) &&
      (!Confirmed() || !owner_ || !owner_->MatchesChild(child))) {
    Cancel("warm_child_changed_before_actual_delivery"); return;
  }
  if (record.FindBool("measured").value_or(false)) {
    auto* contents = child && child->web_ui() ? child->web_ui()->GetWebContents() : nullptr;
    auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
    const auto snapshot = ReadNativeGuestStageShellOwner(child);
    if (!frame || !snapshot || !child || !Confirmed() || !owner_->MatchesChild(child)) {
      Cancel("warm_document_changed_at_actual_delivery"); return;
    }
    observed_child_ = child; observed_document_ = frame->GetWeakDocumentPtr(); observed_shell_ = snapshot;
    if (!MeasuredDeliveryStable()) { Cancel("warm_document_changed_after_actual_delivery"); return; }
  }
  auto callback = std::move(observed_);
  if (callback) std::move(callback).Run(std::move(record));
  // The fixture callback may destroy this ticket. No access follows.
}
bool NativeAuxWarmCreationTicket::MeasuredDeliveryStable() const {
  auto* frame = observed_document_.AsRenderFrameHostIfValid();
  return Confirmed() && observed_child_ && observed_child_->web_ui() && frame &&
      observed_child_->web_ui()->GetWebContents()->GetPrimaryMainFrame() == frame &&
      observed_shell_ && owner_ && owner_->MatchesChild(observed_child_) &&
      ReadNativeGuestStageShellOwner(observed_child_) == observed_shell_ && observed_child_ &&
      observed_document_.AsRenderFrameHostIfValid() == frame && Confirmed();
}
void NativeAuxWarmCreationTicket::Cancel(const char* reason) {
  if (std::exchange(failed_, true)) return;
  Unpublish(this); ClearCreated(this); weak_factory_.InvalidateWeakPtrs(); created_.Reset(); observed_.Reset();
  auto callback = std::move(refused_);
  if (callback) std::move(callback).Run(reason);
}
const NativeAuxWarmOwner* NativeAuxWarmCreationTicket::owner() const { return owner_.get(); }
const std::optional<NativeWarmInput>& NativeAuxWarmCreationTicket::input() const { return input_; }
const base::UnguessableToken& NativeAuxWarmCreationTicket::nonce() const { return nonce_; }
base::TimeTicks NativeAuxWarmCreationTicket::prepared_at() const { return prepared_at_; }
base::WeakPtr<NativeAuxWarmCreationTicket> NativeAuxWarmCreationTicket::GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
}  // namespace aux
#endif

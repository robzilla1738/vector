// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_creator_close_receipt.h"

#include <utility>
#include <algorithm>
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/render_frame_host.h"

namespace aux {
NativeCreatorCloseReceipt::NativeCreatorCloseReceipt(
    content::WebContents* page, base::TimeTicks original_deadline,
    base::RepeatingCallback<bool()> current,
    base::OnceCallback<void(bool)> completion)
    : content::WebContentsUserData<NativeCreatorCloseReceipt>(*page),
      content::WebContentsObserver(page),
      original_document_(page->GetPrimaryMainFrame()->GetWeakDocumentPtr()),
      original_deadline_(original_deadline),
      current_(std::move(current)), completion_(std::move(completion)) {
  // The native creator/lease/transition admission supplies its existing
  // absolute deadline. Unload callbacks never start a fresh authority window.
  deadline_timer_.Start(
      FROM_HERE, std::max(base::TimeDelta(), original_deadline_ - base::TimeTicks::Now()),
      base::BindOnce(
          [](base::WeakPtr<NativeCreatorCloseReceipt> receipt,
             base::UnguessableToken token) {
            if (receipt) receipt->Refuse(token);
          }, weak_factory_.GetWeakPtr(), token_));
}
NativeCreatorCloseReceipt::~NativeCreatorCloseReceipt() {
  weak_factory_.InvalidateWeakPtrs();
  // Userdata removal/replacement is not evidence that its page was closed.
  Finish(false);
}
base::UnguessableToken NativeCreatorCloseReceipt::invocation() const {
  return active_ ? token_ : base::UnguessableToken();
}
bool NativeCreatorCloseReceipt::Current(const base::UnguessableToken& token) {
  if (token.is_empty() || token != token_ || retired_ || detaching_ ||
      !current_ || !completion_ || !web_contents() ||
      original_deadline_.is_null() || base::TimeTicks::Now() >= original_deadline_ ||
      original_document_.AsRenderFrameHostIfValid() !=
          web_contents()->GetPrimaryMainFrame()) return false;
  auto weak = weak_factory_.GetWeakPtr();
  auto current = current_;
  const bool valid = current.Run();
  return weak && valid && !retired_ && !detaching_ && web_contents() &&
      base::TimeTicks::Now() < original_deadline_ &&
      original_document_.AsRenderFrameHostIfValid() ==
          web_contents()->GetPrimaryMainFrame();
}
bool NativeCreatorCloseReceipt::Begin(const base::UnguessableToken& token) {
  if (active_ || !Current(token)) return false;
  active_ = true;
  return true;
}
void NativeCreatorCloseReceipt::End(const base::UnguessableToken& token) {
  if (token == token_) { active_ = false; detach_ready_ = false; }
}
bool NativeCreatorCloseReceipt::MayDetach(const base::UnguessableToken& token) {
  if (!active_ || !Current(token)) return false;
  // This callback-bearing check does not publish successful destruction.
  // The caller must recheck the original model/member after it returns.
  detach_ready_ = true;
  return true;
}
bool NativeCreatorCloseReceipt::ConsumeForDetach(
    const base::UnguessableToken& token) {
  // No callback or event-loop boundary between these original checks and the
  // irreversible effect. MayDetach alone cannot make destructor cleanup win.
  if (token.is_empty() || token != token_ || !active_ || !detach_ready_ ||
      retired_ || detaching_ || !completion_ || !web_contents() ||
      original_document_.AsRenderFrameHostIfValid() !=
          web_contents()->GetPrimaryMainFrame() ||
      original_deadline_.is_null() || base::TimeTicks::Now() >= original_deadline_)
    return false;
  detach_ready_ = false;
  detaching_ = true;
  active_ = false;
  return true;
}
void NativeCreatorCloseReceipt::CancelForHuman() {
  retired_ = true;
  active_ = false;
  detach_ready_ = false;
  current_.Reset();
  Finish(false);
}
void NativeCreatorCloseReceipt::Refuse(const base::UnguessableToken& token) {
  if (token != token_ || detaching_) return;
  retired_ = true;
  active_ = false;
  detach_ready_ = false;
  current_.Reset();
  Finish(false);
}
bool NativeCreatorCloseReceipt::MayContinue(const base::UnguessableToken& token) {
  return Current(token);
}
bool NativeCreatorCloseReceipt::QueueHumanClose(base::OnceClosure close) {
  if (!original_ack_pending_) return false;
  if (!human_close_) human_close_ = std::move(close);
  CancelForHuman();
  return true;
}
void NativeCreatorCloseReceipt::AwaitOriginalAck(const base::UnguessableToken& token) {
  if (token == token_ && !retired_ && !detaching_)
    original_ack_pending_ = true;
}
bool NativeCreatorCloseReceipt::OriginalAck(const base::UnguessableToken& token,
                                          bool await_unload) {
  if (token != token_) return false;
  const bool human_close = static_cast<bool>(human_close_);
  if (human_close && await_unload) return true;
  original_ack_pending_ = false;
  if (human_close_)
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, std::move(human_close_));
  return human_close;
}
void NativeCreatorCloseReceipt::Finish(bool closed) {
  if (!completion_) return;
  // Do not reenter tab-strip mutation while it owns its reentrancy guard.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(std::move(completion_), closed));
}
base::WeakPtr<NativeCreatorCloseReceipt>
NativeCreatorCloseReceipt::GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
void NativeCreatorCloseReceipt::PrimaryPageChanged(content::Page&) {
  // A replacement page retires the original callback identity. A queued human
  // invocation retains its own original document fence and cannot close this
  // replacement merely because the old renderer callback disappeared.
  Refuse(token_);
  OriginalAck(token_);
}
void NativeCreatorCloseReceipt::RenderFrameDeleted(content::RenderFrameHost*) {
  if (!original_document_.AsRenderFrameHostIfValid()) {
    Refuse(token_);
    OriginalAck(token_);
  }
}
void NativeCreatorCloseReceipt::WebContentsDestroyed() {
  human_close_.Reset();
  original_ack_pending_ = false;
  Finish(detaching_);
}
WEB_CONTENTS_USER_DATA_KEY_IMPL(NativeCreatorCloseReceipt);
}  // namespace aux

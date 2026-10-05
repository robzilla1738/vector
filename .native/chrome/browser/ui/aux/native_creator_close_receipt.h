// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_CREATOR_CLOSE_RECEIPT_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_CREATOR_CLOSE_RECEIPT_H_

#include "base/functional/callback.h"
#include "base/callback_list.h"
#include "base/memory/weak_ptr.h"
#include "base/unguessable_token.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/weak_document_ptr.h"

namespace aux {
class EgressController;
// Native-only one-use close invocation. An ordinary close cancels this receipt;
// its delayed renderer continuation cannot become a new human close.
class NativeCreatorCloseReceipt final
    : public content::WebContentsUserData<NativeCreatorCloseReceipt>,
      public content::WebContentsObserver {
 public:
  ~NativeCreatorCloseReceipt() override;
  const base::UnguessableToken& token() const { return token_; }
  base::UnguessableToken invocation() const;
  bool Begin(const base::UnguessableToken& token);
  void End(const base::UnguessableToken& token);
  bool MayDetach(const base::UnguessableToken& token);
  // Callback-free final consumption, only after original model/member checks.
  bool ConsumeForDetach(const base::UnguessableToken& token);
  void CancelForHuman();
  void Refuse(const base::UnguessableToken& token);
  // A separate genuine human close waits for the original agent callback to
  // retire; it never takes over that callback's token or current metadata.
  bool QueueHumanClose(base::OnceClosure close);
  void AwaitOriginalAck(const base::UnguessableToken& token);
  // Returns whether this ACK belongs to a separately queued human close.
  // Accepted beforeunload keeps that close queued until its final unload ACK.
  bool OriginalAck(const base::UnguessableToken& token,
                   bool await_unload = false);
  bool MayContinue(const base::UnguessableToken& token);
  base::WeakPtr<NativeCreatorCloseReceipt> GetWeakPtr();

 private:
  friend class EgressController;
  friend class NativeCreatorCloseReceiptBrowserTestPeer;
  friend class content::WebContentsUserData<NativeCreatorCloseReceipt>;
  NativeCreatorCloseReceipt(content::WebContents* page,
      base::TimeTicks original_deadline,
      base::RepeatingCallback<bool()> current,
      base::OnceCallback<void(bool)> completion);
  bool Current(const base::UnguessableToken& token);
  void Finish(bool closed);
  void PrimaryPageChanged(content::Page& page) override;
  void RenderFrameDeleted(content::RenderFrameHost* frame) override;
  void WebContentsDestroyed() override;
  WEB_CONTENTS_USER_DATA_KEY_DECL();
  const content::WeakDocumentPtr original_document_;
  const base::TimeTicks original_deadline_;
  const base::UnguessableToken token_ = base::UnguessableToken::Create();
  base::RepeatingCallback<bool()> current_;
  base::OnceCallback<void(bool)> completion_;
  bool active_ = false;
  bool retired_ = false;
  bool detaching_ = false;
  bool detach_ready_ = false;
  bool original_ack_pending_ = false;
  base::OnceClosure human_close_;
  base::OneShotTimer deadline_timer_;
  base::CallbackListSubscription authority_subscription_;
  base::WeakPtrFactory<NativeCreatorCloseReceipt> weak_factory_{this};
};
}  // namespace aux
#endif

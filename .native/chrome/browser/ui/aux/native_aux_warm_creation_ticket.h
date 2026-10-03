// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_AUX_WARM_CREATION_TICKET_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_AUX_WARM_CREATION_TICKET_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <memory>
#include <optional>
#include <string_view>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/unguessable_token.h"
#include "base/values.h"
#include "chrome/browser/ui/aux/native_warm_input.h"
#include "chrome/browser/ui/aux/native_guest_stage_owner.h"
#include "content/public/browser/weak_document_ptr.h"
class BrowserWindowInterface;
class WebUIBrowserUI;
namespace views { class Widget; }
namespace aux {
class NativeAuxWarmOwner;
// Measurement only: no command dispatch, window creation or capability grant.
// Native registered input and the corresponding authenticated shell request
// are separate phases because Aux dispatches its command through the shell.
class NativeAuxWarmCreationTicket final {
 public:
  using Created = base::OnceCallback<void(base::WeakPtr<BrowserWindowInterface>,
                                        base::WeakPtr<views::Widget>)>;
  using Refused = base::OnceCallback<void(const char*)>;
  using Observed = base::OnceCallback<void(base::DictValue)>;
  NativeAuxWarmCreationTicket(std::unique_ptr<NativeAuxWarmOwner> owner,
                             Created created, Refused refused, Observed observed);
  ~NativeAuxWarmCreationTicket();
  NativeAuxWarmCreationTicket(const NativeAuxWarmCreationTicket&) = delete;
  NativeAuxWarmCreationTicket& operator=(const NativeAuxWarmCreationTicket&) = delete;
  bool Prepare();
  static base::WeakPtr<NativeAuxWarmCreationTicket> PreparedTicket();
  // Native constructor lookup only: the exact already-bound BWI/widget, not a
  // caller-selected or next window. It survives synchronous command return.
  static base::WeakPtr<NativeAuxWarmCreationTicket> ForCreatedChild(BrowserWindowInterface* actual);
  // Hook only after the actual native accelerator registry resolves new-window.
  // The opaque receipt must accompany that event's invocation context, never
  // be inferred from a later id-only command or passed through public args.
  std::optional<base::UnguessableToken> CaptureRegisteredShortcut(
      BrowserWindowInterface* original, std::string_view registered_command);
  // Shared host hook must first authenticate the original current Request
  // WebUI document and its private invocation-context receipt.
  bool BeginActualCommand(base::WeakPtr<WebUIBrowserUI> original,
                          const base::UnguessableToken& delivered_receipt);
  bool InActualCreation() const;
  void AddedToWidget(BrowserWindowInterface* actual, views::Widget* widget);
  bool OwnsCreatedChildForObservation(BrowserWindowInterface* actual) const;
  bool ConfirmReturned(BrowserWindowInterface* actual);
  void EndActualCommand();
  bool Stable() const;
  bool Confirmed() const;
  void Delivered(base::WeakPtr<WebUIBrowserUI> child, base::DictValue record);
  bool MeasuredDeliveryStable() const;
  void Cancel(const char* reason = "aux_warm_creation_cancelled");
  const NativeAuxWarmOwner* owner() const;
  const std::optional<NativeWarmInput>& input() const;
  const base::UnguessableToken& nonce() const;
  base::TimeTicks prepared_at() const;
  base::WeakPtr<NativeAuxWarmCreationTicket> GetWeakPtr();
 private:
  bool WithinDeadline() const;
  std::unique_ptr<NativeAuxWarmOwner> owner_;
  Created created_;
  Refused refused_;
  Observed observed_;
  base::WeakPtr<BrowserWindowInterface> child_;
  base::WeakPtr<views::Widget> widget_;
  std::optional<NativeWarmInput> input_;
  base::WeakPtr<WebUIBrowserUI> observed_child_;
  content::WeakDocumentPtr observed_document_;
  std::optional<NativeGuestStageOwnedSnapshot> observed_shell_;
  base::UnguessableToken nonce_, dispatch_receipt_;
  base::TimeTicks prepared_at_, deadline_;
  bool prepared_ = false, entered_ = false, confirmed_ = false,
       ended_ = false, failed_ = false;
  base::WeakPtrFactory<NativeAuxWarmCreationTicket> weak_factory_{this};
};
}  // namespace aux
#endif
#endif

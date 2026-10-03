// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_WARM_CREATION_TICKET_H_
#define CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_WARM_CREATION_TICKET_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <memory>
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/unguessable_token.h"
#include "chrome/browser/ui/aux/native_warm_input.h"
class BrowserView;
class BrowserWindowInterface;
namespace aux {
class NativeStockWarmOwner;
// Native-owned preparation and exact synchronous creation provenance only.
// The session must additionally obtain original first full hardware delivery.
class NativeStockWarmCreationTicket final {
 public:
  using Created = base::OnceCallback<void(base::WeakPtr<BrowserView>)>;
  using Refused = base::OnceCallback<void(const char*)>;
  NativeStockWarmCreationTicket(std::unique_ptr<NativeStockWarmOwner> owner,
                               Created created, Refused refused);
  ~NativeStockWarmCreationTicket();
  NativeStockWarmCreationTicket(const NativeStockWarmCreationTicket&) = delete;
  NativeStockWarmCreationTicket& operator=(const NativeStockWarmCreationTicket&) = delete;
  // Called only by the private native fixture; preparing changes no UI.
  bool Prepare();
  // Native-only UI-thread hook lookup. A decoded operation cannot provide a
  // window selector; only this retained original owner can publish the ticket.
  static base::WeakPtr<NativeStockWarmCreationTicket> PreparedTicket();
  bool InActualCreation() const;
  bool BeginActualCommand(BrowserWindowInterface* original, int command);
  // Exact existing source hooks within that actual command transaction.
  void AddedToWidget(BrowserView* actual);
  bool ConfirmReturned(BrowserWindowInterface* actual_returned);
  void EndActualCommand();
  bool Stable() const;
  bool Confirmed() const;
  void Cancel(const char* reason = "warm_creation_cancelled");
  const NativeStockWarmOwner* owner() const;
  const std::optional<NativeWarmInput>& input() const;
  const base::UnguessableToken& nonce() const;
  base::TimeTicks prepared_at() const;
  base::WeakPtr<NativeStockWarmCreationTicket> GetWeakPtr();
 private:
  std::unique_ptr<NativeStockWarmOwner> owner_;
  Created created_;
  Refused refused_;
  base::WeakPtr<BrowserView> view_;
  std::optional<NativeWarmInput> input_;
  base::UnguessableToken nonce_;
  base::TimeTicks prepared_at_;
  bool prepared_ = false, entered_ = false, confirmed_ = false, ended_ = false, failed_ = false;
  base::WeakPtrFactory<NativeStockWarmCreationTicket> weak_factory_{this};
};
}  // namespace aux
#endif
#endif

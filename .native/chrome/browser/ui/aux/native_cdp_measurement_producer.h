// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_CDP_MEASUREMENT_PRODUCER_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_CDP_MEASUREMENT_PRODUCER_H_
#include <cstdint>
#include <memory>
#include <optional>
#include <string>
#include "base/memory/weak_ptr.h"
#include "base/values.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "base/functional/callback.h"
#include "base/unguessable_token.h"
#include "content/public/browser/weak_document_ptr.h"
class BrowserWindowInterface;
class AuxRuntimeHost;
namespace content { class NativePlatformInputAdmission; class RenderFrameHost; }
namespace aux {
class EgressController;
class NativeStopInputEndpoint;
// Only the owned fixture producer can construct this measurement receipt.
// It does not authorize Stop, resume, or any browser effect.
class NativeStopInputReceipt final {
 public:
  ~NativeStopInputReceipt();
 private:
  friend class NativeCdpMeasurementProducer;
  friend class NativeStopInputEndpoint;
  friend class EgressController;
  friend class ::AuxRuntimeHost;
  NativeStopInputReceipt();
  base::WeakPtr<BrowserWindowInterface> owner_;
  base::WeakPtr<EgressController> controller_;
  content::WeakDocumentPtr shell_document_;
  base::UnguessableToken id_;
  std::string run_id_;
  std::string host_incarnation_;
  uint64_t connection_generation_ = 0;
  base::TimeTicks event_ticks_, admitted_ticks_, deadline_;
};
// Created solely by fixed native fixture ingress after original unique-window
// admission. No caller run/page/document/PID/script selector exists here.
class NativeCdpMeasurementProducer final {
 public:
  enum class Operation { kPrepareTakeover, kPrepareStop, kComplete };
  explicit NativeCdpMeasurementProducer(BrowserWindowInterface* original_owner);
  ~NativeCdpMeasurementProducer();
  base::DictValue Run(Operation operation);
  void WaitForFreshDispatches(base::OnceCallback<void(bool)> callback);
  base::WeakPtr<NativeCdpMeasurementProducer> GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
  // Called only on the original shell's associated native input path.
  bool AdmitStopInput(const content::NativePlatformInputAdmission& admission);
  // Fixed renderer endpoint supplies a consumed private Event token and the
  // existing Stop run. No caller timestamp, child list, or authority enters.
  std::unique_ptr<NativeStopInputReceipt> TakeStopInput(
      const base::UnguessableToken& id, content::RenderFrameHost* original_shell,
      const std::string& run_id);
 private:
  friend class NativeStopInputEndpoint;
  void PollFreshDispatches();
  void FinishFreshDispatches(bool ready);
  bool OwnerCurrent() const;
  std::optional<base::TimeTicks> OriginalStopDeadline() const;
  base::WeakPtr<BrowserWindowInterface> owner_;
  base::WeakPtr<EgressController> controller_;
  uint64_t sequence_ = 0;
  bool armed_ = false;
  std::unique_ptr<NativeStopInputReceipt> stop_input_;
  base::OnceCallback<void(bool)> dispatch_ready_;
  base::RepeatingTimer dispatch_timer_;
  base::WeakPtrFactory<NativeCdpMeasurementProducer> weak_factory_{this};
};
}  // namespace aux
#endif

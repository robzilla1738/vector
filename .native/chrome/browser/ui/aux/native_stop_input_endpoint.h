// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_STOP_INPUT_ENDPOINT_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_STOP_INPUT_ENDPOINT_H_
#include <optional>
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/common/aux_stop_input.mojom.h"
#include "content/public/browser/weak_document_ptr.h"
#include "mojo/public/cpp/bindings/associated_receiver.h"
#include "mojo/public/cpp/bindings/associated_remote.h"
class BrowserWindowInterface;
class WebUIBrowserUI;
namespace content { class RenderFrameHost; }
namespace aux {
class NativeCdpMeasurementProducer;
// Owned by the original native fixture UI. Browser initiates the associated
// sink; it is not a public browser-interface binder or a generic RPC endpoint.
class NativeStopInputEndpoint final : public chrome::mojom::AuxStopInputSink {
 public:
  NativeStopInputEndpoint(content::RenderFrameHost* original_shell,
                         NativeCdpMeasurementProducer* original_producer);
  ~NativeStopInputEndpoint() override;
  void Prepare(base::OnceCallback<void(bool)> callback);
  void WaitForMeasuredCompletion(base::OnceCallback<void(bool)> callback);
 private:
  bool Current() const;
  void Prepared(bool ready);
  void Retire();
  void Stop(const std::optional<base::UnguessableToken>& original_input,
            const std::string& run_id, StopCallback callback) override;
  void Complete(bool measured, StopCallback callback, AuxRuntimeHost::Response response);
  content::WeakDocumentPtr shell_document_;
  base::WeakPtr<WebUIBrowserUI> ui_;
  base::WeakPtr<BrowserWindowInterface> owner_;
  base::WeakPtr<AuxRuntimeHost> host_;
  base::WeakPtr<NativeCdpMeasurementProducer> producer_;
  uint64_t connection_generation_ = 0;
  std::string host_incarnation_;
  bool ready_ = false;
  bool measured_completed_ = false, measured_accepted_ = false;
  base::TimeTicks original_deadline_;
  base::OnceCallback<void(bool)> completion_;
  base::OneShotTimer completion_timer_;
  base::OnceCallback<void(bool)> preparation_;
  base::OneShotTimer preparation_timer_;
  mojo::AssociatedReceiver<chrome::mojom::AuxStopInputSink> receiver_{this};
  mojo::AssociatedRemote<chrome::mojom::AuxStopInput> renderer_;
  base::WeakPtrFactory<NativeStopInputEndpoint> weak_factory_{this};
};
}  // namespace aux
#endif

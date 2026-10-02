// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_FRAME_CONTROLLER_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_FRAME_CONTROLLER_H_
#include <memory>
#include "base/memory/weak_ptr.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "third_party/blink/public/mojom/widget/native_startup_measurement.mojom-blink.h"
#include "third_party/blink/renderer/core/frame/native_startup_frame_measurement.h"
#include "third_party/blink/renderer/platform/heap/persistent.h"
namespace blink {
class Document;
class WidgetBase;
// Exclusive actual-widget slot reserved by WebFrameWidgetImpl BEFORE creation.
// Browser grants only its existing current private fixture scope, never a
// caller script or document/window selector. Hardware proof remains separate.
class CORE_EXPORT NativeStartupFrameController final : public mojom::blink::NativeStartupFrameLease {
 public:
  using Reply = base::OnceCallback<void(mojom::blink::NativeStartupFrameSubmissionPtr)>;
  NativeStartupFrameController(WidgetBase* widget, Document* document,
      NativeStartupFrameMeasurement::ScopeReader read_scope);
  ~NativeStartupFrameController() override;
  bool Begin(mojom::blink::NativeStartupFrameScopePtr scope,
      mojo::PendingReceiver<mojom::blink::NativeStartupFrameLease> lease, Reply result);
  void Stop() override;
  bool leased() const { return lease_.is_bound(); }
 private:
  std::optional<NativeStartupFrameScope> CurrentScope();
  std::optional<NativeStartupInteractiveWitness> CurrentWitness();
  void Finished(std::optional<NativeStartupFrameSubmission> result);
  base::WeakPtr<WidgetBase> widget_;
  WeakPersistent<Document> document_;
  NativeStartupFrameMeasurement::ScopeReader read_scope_;
  std::optional<NativeStartupFrameScope> expected_;
  mojom::blink::NativeStartupFrameScopePtr scope_;
  std::unique_ptr<NativeStartupFrameMeasurement> measurement_;
  Reply reply_;
  bool used_ = false;
  mojo::Receiver<mojom::blink::NativeStartupFrameLease> lease_{this};
  base::WeakPtrFactory<NativeStartupFrameController> weak_factory_{this};
};
}  // namespace blink
#endif

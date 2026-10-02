// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef THIRD_PARTY_BLINK_RENDERER_PLATFORM_WIDGET_COMPOSITING_WIDGET_COMPOSITOR_H_
#define THIRD_PARTY_BLINK_RENDERER_PLATFORM_WIDGET_COMPOSITING_WIDGET_COMPOSITOR_H_

#include "base/task/single_thread_task_runner.h"
#include "base/types/pass_key.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "mojo/public/cpp/bindings/pending_remote.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "third_party/blink/public/mojom/widget/platform_widget.mojom-blink.h"
#include "third_party/blink/renderer/platform/platform_export.h"
#include "third_party/blink/renderer/platform/widget/compositing/widget_swap_queue.h"
#include "third_party/blink/renderer/platform/wtf/thread_safe_ref_counted.h"

namespace cc {
class LayerTreeHost;
}

namespace blink {

class WidgetBase;

class WidgetCompositorPassKeyProvider {
 public:
  using PassKey = base::PassKey<WidgetCompositorPassKeyProvider>;

 private:
  static PassKey GetPassKey() { return PassKey(); }
  friend class FakeWidgetCompositor;
  friend class WidgetCompositor;
};

class PLATFORM_EXPORT WidgetCompositor
    : public ThreadSafeRefCounted<WidgetCompositor>,
      public mojom::blink::WidgetCompositor {
 public:
  static scoped_refptr<WidgetCompositor> Create(
      base::WeakPtr<WidgetBase> widget_base,
      scoped_refptr<base::SingleThreadTaskRunner> main_task_runner,
      scoped_refptr<base::SingleThreadTaskRunner> compositor_task_runner,
      mojo::PendingReceiver<mojom::blink::WidgetCompositor> receiver);

  WidgetCompositor(
      base::PassKey<WidgetCompositorPassKeyProvider>,
      base::WeakPtr<WidgetBase> widget_base,
      scoped_refptr<base::SingleThreadTaskRunner> main_task_runner,
      scoped_refptr<base::SingleThreadTaskRunner> compositor_task_runner);
  WidgetCompositor(const WidgetCompositor&) = delete;
  WidgetCompositor& operator=(const WidgetCompositor&) = delete;

  void Shutdown();

  // mojom::WidgetCompositor:
  void VisualStateRequest(VisualStateRequestCallback callback) override;
  void BeginNativeStartupFrame(
      mojom::blink::NativeStartupFrameScopePtr scope,
      mojo::PendingReceiver<mojom::blink::NativeStartupFrameLease> lease,
      BeginNativeStartupFrameCallback callback) override;
  void BeginNativeOrganizationWork(
      mojom::blink::NativeOrganizationWorkScopePtr scope,
      mojo::PendingReceiver<mojom::blink::NativeOrganizationWorkLease> lease,
      BeginNativeOrganizationWorkCallback callback) override;
  void MeasureCreatedGuestFrame(
      mojom::blink::NativeCreatedGuestFrameScopePtr scope,
      mojo::PendingRemote<mojom::blink::NativeCreatedGuestFrameReadiness> readiness,
        MeasureCreatedGuestFrameCallback callback) override;
  void MeasureNativeGuestStage(
      mojom::blink::NativeGuestStageScopePtr scope,
      mojo::PendingRemote<mojom::blink::NativeGuestStageReadiness> readiness,
      mojo::PendingReceiver<mojom::blink::NativeGuestStageInput> input,
      MeasureNativeGuestStageCallback callback) override;
  void BeginNativeGuestDocumentFrame(
      mojom::blink::NativeGuestDocumentFrameScopePtr scope,
      mojo::PendingReceiver<mojom::blink::NativeGuestDocumentFrameLease> lease,
      BeginNativeGuestDocumentFrameCallback callback) override;
  void MeasureNativeCommandPresentation(
      mojom::blink::NativeCommandPresentationScopePtr scope,
      mojo::PendingRemote<mojom::blink::NativeCommandPresentationReadiness> readiness,
      MeasureNativeCommandPresentationCallback callback) override;

  virtual cc::LayerTreeHost* LayerTreeHost() const;

 protected:
  friend ThreadSafeRefCounted<WidgetCompositor>;
  ~WidgetCompositor() override = default;

  void BindOnThread(
      mojo::PendingReceiver<mojom::blink::WidgetCompositor> receiver);

 private:
  void ResetOnThread();
  void BeginNativeStartupFrameOnMain(
      mojom::blink::NativeStartupFrameScopePtr scope,
      mojo::PendingReceiver<mojom::blink::NativeStartupFrameLease> lease,
      BeginNativeStartupFrameCallback callback);
  void NativeStartupFrameResponse(BeginNativeStartupFrameCallback callback,
      mojom::blink::NativeStartupFrameSubmissionPtr result);
  void BeginNativeOrganizationWorkOnMain(
      mojom::blink::NativeOrganizationWorkScopePtr scope,
      mojo::PendingReceiver<mojom::blink::NativeOrganizationWorkLease> lease,
      BeginNativeOrganizationWorkCallback callback);
  void NativeOrganizationWorkResponse(BeginNativeOrganizationWorkCallback callback, bool armed);
  void MeasureCreatedGuestFrameOnMain(
      mojom::blink::NativeCreatedGuestFrameScopePtr scope,
      mojo::PendingRemote<mojom::blink::NativeCreatedGuestFrameReadiness> readiness,
        MeasureCreatedGuestFrameCallback callback);
  void CreatedGuestFrameResponse(MeasureCreatedGuestFrameCallback callback,
      mojom::blink::NativeCreatedGuestFrameSubmissionPtr result);
  void MeasureNativeGuestStageOnMain(
      mojom::blink::NativeGuestStageScopePtr scope,
      mojo::PendingRemote<mojom::blink::NativeGuestStageReadiness> readiness,
      mojo::PendingReceiver<mojom::blink::NativeGuestStageInput> input,
      MeasureNativeGuestStageCallback callback);
  void NativeGuestStageResponse(MeasureNativeGuestStageCallback callback,
      mojom::blink::NativeGuestStageSubmissionPtr result);
  void BeginNativeGuestDocumentFrameOnMain(
      mojom::blink::NativeGuestDocumentFrameScopePtr scope,
      mojo::PendingReceiver<mojom::blink::NativeGuestDocumentFrameLease> lease,
      BeginNativeGuestDocumentFrameCallback callback);
  void NativeGuestDocumentFrameResponse(BeginNativeGuestDocumentFrameCallback callback, bool armed);
  void MeasureNativeCommandPresentationOnMain(
      mojom::blink::NativeCommandPresentationScopePtr scope,
      mojo::PendingRemote<mojom::blink::NativeCommandPresentationReadiness> readiness,
      MeasureNativeCommandPresentationCallback callback);
  void NativeCommandPresentationResponse(
      MeasureNativeCommandPresentationCallback callback,
      mojom::blink::NativeCommandPresentationResultPtr result);
  void CreateQueueSwapPromise(base::OnceCallback<void(int)> drain_callback,
                              base::OnceClosure swap_callback,
                              VisualStateRequestCallback callback);
  void VisualStateResponse();
  void DrainQueue(int source_frame_number);
  bool CalledOnValidCompositorThread();

  // Note that |widget_base_| is safe to be accessed on the main thread.
  base::WeakPtr<WidgetBase> widget_base_;
  scoped_refptr<base::SingleThreadTaskRunner> main_task_runner_;
  scoped_refptr<base::SingleThreadTaskRunner> compositor_task_runner_;
  mojo::Receiver<mojom::blink::WidgetCompositor> receiver_{this};
  std::unique_ptr<WidgetSwapQueue> swap_queue_;
};

}  // namespace blink

#endif  // THIRD_PARTY_BLINK_RENDERER_PLATFORM_WIDGET_COMPOSITING_WIDGET_COMPOSITOR_H_

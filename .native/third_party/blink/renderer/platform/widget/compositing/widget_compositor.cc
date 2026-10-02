// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "third_party/blink/renderer/platform/widget/compositing/widget_compositor.h"
#include "third_party/blink/public/mojom/widget/native_organization_work.mojom-blink.h"

#include <utility>
#include "mojo/public/cpp/bindings/remote.h"

#include "base/functional/callback_helpers.h"
#include "base/task/single_thread_task_runner.h"
#include "base/types/pass_key.h"
#include "cc/trees/layer_tree_host.h"
#include "third_party/blink/renderer/platform/widget/compositing/queue_report_time_swap_promise.h"
#include "third_party/blink/renderer/platform/widget/widget_base.h"
#include "third_party/blink/renderer/platform/widget/widget_base_client.h"

namespace blink {

// static
scoped_refptr<WidgetCompositor> WidgetCompositor::Create(
    base::WeakPtr<WidgetBase> widget_base,
    scoped_refptr<base::SingleThreadTaskRunner> main_task_runner,
    scoped_refptr<base::SingleThreadTaskRunner> compositor_task_runner,
    mojo::PendingReceiver<mojom::blink::WidgetCompositor> receiver) {
  auto compositor = base::MakeRefCounted<WidgetCompositor>(
      WidgetCompositorPassKeyProvider::GetPassKey(), std::move(widget_base),
      std::move(main_task_runner), std::move(compositor_task_runner));
  compositor->BindOnThread(std::move(receiver));
  return compositor;
}

WidgetCompositor::WidgetCompositor(
    base::PassKey<WidgetCompositorPassKeyProvider>,
    base::WeakPtr<WidgetBase> widget_base,
    scoped_refptr<base::SingleThreadTaskRunner> main_task_runner,
    scoped_refptr<base::SingleThreadTaskRunner> compositor_task_runner)
    : widget_base_(std::move(widget_base)),
      main_task_runner_(std::move(main_task_runner)),
      compositor_task_runner_(std::move(compositor_task_runner)),
      swap_queue_(std::make_unique<WidgetSwapQueue>()) {}

void WidgetCompositor::Shutdown() {
  if (!compositor_task_runner_) {
    ResetOnThread();
  } else {
    compositor_task_runner_->PostTask(
        FROM_HERE, base::BindOnce(&WidgetCompositor::ResetOnThread,
                                  scoped_refptr<WidgetCompositor>(this)));
  }
}

void WidgetCompositor::BindOnThread(
    mojo::PendingReceiver<mojom::blink::WidgetCompositor> receiver) {
  if (CalledOnValidCompositorThread()) {
    receiver_.Bind(std::move(receiver), compositor_task_runner_);
  } else {
    compositor_task_runner_->PostTask(
        FROM_HERE,
        base::BindOnce(&WidgetCompositor::BindOnThread, base::RetainedRef(this),
                       std::move(receiver)));
  }
}

void WidgetCompositor::ResetOnThread() {
  DCHECK(CalledOnValidCompositorThread());
  receiver_.reset();
}

void WidgetCompositor::VisualStateRequest(VisualStateRequestCallback callback) {
  DCHECK(CalledOnValidCompositorThread());

  auto drain_callback =
      base::BindOnce(&WidgetCompositor::DrainQueue, base::RetainedRef(this));
  auto swap_callback = base::BindOnce(&WidgetCompositor::VisualStateResponse,
                                      base::RetainedRef(this));
  if (!compositor_task_runner_) {
    CreateQueueSwapPromise(std::move(drain_callback), std::move(swap_callback),
                           std::move(callback));
  } else {
    main_task_runner_->PostTask(
        FROM_HERE,
        base::BindOnce(&WidgetCompositor::CreateQueueSwapPromise,
                       base::RetainedRef(this), std::move(drain_callback),
                       std::move(swap_callback), std::move(callback)));
  }
}

void WidgetCompositor::BeginNativeStartupFrame(
    mojom::blink::NativeStartupFrameScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeStartupFrameLease> lease,
    BeginNativeStartupFrameCallback callback) {
  DCHECK(CalledOnValidCompositorThread());
  main_task_runner_->PostTask(FROM_HERE, base::BindOnce(
      &WidgetCompositor::BeginNativeStartupFrameOnMain, base::RetainedRef(this),
      std::move(scope), std::move(lease), std::move(callback)));
}
void WidgetCompositor::BeginNativeStartupFrameOnMain(
    mojom::blink::NativeStartupFrameScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeStartupFrameLease> lease,
    BeginNativeStartupFrameCallback callback) {
  DCHECK(main_task_runner_->BelongsToCurrentThread());
  auto reply = base::BindOnce(&WidgetCompositor::NativeStartupFrameResponse,
      base::RetainedRef(this), std::move(callback));
  if (!widget_base_ || widget_base_->WillBeDestroyed() || !widget_base_->client() ||
      !scope || !lease.is_valid()) { std::move(reply).Run(nullptr); return; }
  widget_base_->client()->BeginNativeStartupFrame(std::move(scope), std::move(lease), std::move(reply));
}
void WidgetCompositor::NativeStartupFrameResponse(BeginNativeStartupFrameCallback callback,
    mojom::blink::NativeStartupFrameSubmissionPtr result) {
  if (!CalledOnValidCompositorThread()) {
    compositor_task_runner_->PostTask(FROM_HERE, base::BindOnce(
        &WidgetCompositor::NativeStartupFrameResponse, base::RetainedRef(this),
        std::move(callback), std::move(result))); return;
  }
  if (receiver_.is_bound()) std::move(callback).Run(std::move(result));
}
void WidgetCompositor::BeginNativeOrganizationWork(
    mojom::blink::NativeOrganizationWorkScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeOrganizationWorkLease> lease,
    BeginNativeOrganizationWorkCallback callback) {
  DCHECK(CalledOnValidCompositorThread());
  main_task_runner_->PostTask(FROM_HERE, base::BindOnce(
      &WidgetCompositor::BeginNativeOrganizationWorkOnMain, base::RetainedRef(this),
      std::move(scope), std::move(lease), std::move(callback)));
}
void WidgetCompositor::BeginNativeOrganizationWorkOnMain(
    mojom::blink::NativeOrganizationWorkScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeOrganizationWorkLease> lease,
    BeginNativeOrganizationWorkCallback callback) {
  DCHECK(main_task_runner_->BelongsToCurrentThread());
  auto reply = base::BindOnce(&WidgetCompositor::NativeOrganizationWorkResponse,
                             base::RetainedRef(this), std::move(callback));
  if (!widget_base_ || widget_base_->WillBeDestroyed() || !widget_base_->client() ||
      !scope || !lease.is_valid()) { std::move(reply).Run(false); return; }
  widget_base_->client()->BeginNativeOrganizationWork(
      std::move(scope), std::move(lease), std::move(reply));
}
void WidgetCompositor::NativeOrganizationWorkResponse(
    BeginNativeOrganizationWorkCallback callback, bool armed) {
  if (!CalledOnValidCompositorThread()) {
    compositor_task_runner_->PostTask(FROM_HERE, base::BindOnce(
        &WidgetCompositor::NativeOrganizationWorkResponse, base::RetainedRef(this),
        std::move(callback), armed)); return;
  }
  if (receiver_.is_bound()) std::move(callback).Run(armed);
}
void WidgetCompositor::MeasureCreatedGuestFrame(
    mojom::blink::NativeCreatedGuestFrameScopePtr scope,
    mojo::PendingRemote<mojom::blink::NativeCreatedGuestFrameReadiness> readiness,
    MeasureCreatedGuestFrameCallback callback) {
  DCHECK(CalledOnValidCompositorThread());
  main_task_runner_->PostTask(FROM_HERE, base::BindOnce(
      &WidgetCompositor::MeasureCreatedGuestFrameOnMain, base::RetainedRef(this),
      std::move(scope), std::move(readiness), std::move(callback)));
}
void WidgetCompositor::MeasureCreatedGuestFrameOnMain(
    mojom::blink::NativeCreatedGuestFrameScopePtr scope,
    mojo::PendingRemote<mojom::blink::NativeCreatedGuestFrameReadiness> readiness,
    MeasureCreatedGuestFrameCallback callback) {
  DCHECK(main_task_runner_->BelongsToCurrentThread());
  auto respond = base::BindOnce(&WidgetCompositor::CreatedGuestFrameResponse,
                               base::RetainedRef(this), std::move(callback));
  if (!widget_base_ || widget_base_->WillBeDestroyed() || !widget_base_->client() ||
      !scope || !readiness.is_valid()) {
    std::move(respond).Run(nullptr); return;
  }
  widget_base_->client()->MeasureCreatedGuestFrame(std::move(scope),
      std::move(readiness), std::move(respond));
}
void WidgetCompositor::CreatedGuestFrameResponse(MeasureCreatedGuestFrameCallback callback,
    mojom::blink::NativeCreatedGuestFrameSubmissionPtr result) {
  if (!CalledOnValidCompositorThread()) {
    compositor_task_runner_->PostTask(FROM_HERE, base::BindOnce(
        &WidgetCompositor::CreatedGuestFrameResponse, base::RetainedRef(this),
        std::move(callback), std::move(result))); return;
  }
  if (receiver_.is_bound()) std::move(callback).Run(std::move(result));
}
void WidgetCompositor::MeasureNativeGuestStage(
    mojom::blink::NativeGuestStageScopePtr scope,
    mojo::PendingRemote<mojom::blink::NativeGuestStageReadiness> readiness,
    mojo::PendingReceiver<mojom::blink::NativeGuestStageInput> input,
    MeasureNativeGuestStageCallback callback) {
  DCHECK(CalledOnValidCompositorThread());
  main_task_runner_->PostTask(FROM_HERE, base::BindOnce(
      &WidgetCompositor::MeasureNativeGuestStageOnMain, base::RetainedRef(this),
      std::move(scope), std::move(readiness), std::move(input), std::move(callback)));
}
void WidgetCompositor::MeasureNativeGuestStageOnMain(
    mojom::blink::NativeGuestStageScopePtr scope,
    mojo::PendingRemote<mojom::blink::NativeGuestStageReadiness> readiness,
    mojo::PendingReceiver<mojom::blink::NativeGuestStageInput> input,
    MeasureNativeGuestStageCallback callback) {
  DCHECK(main_task_runner_->BelongsToCurrentThread());
  auto respond = base::BindOnce(&WidgetCompositor::NativeGuestStageResponse,
                               base::RetainedRef(this), std::move(callback));
  if (!widget_base_ || widget_base_->WillBeDestroyed() || !widget_base_->client() ||
      !scope || !readiness.is_valid() || !input.is_valid()) {
    std::move(respond).Run(nullptr); return;
  }
  widget_base_->client()->MeasureNativeGuestStage(std::move(scope),
      std::move(readiness), std::move(input), std::move(respond));
}
void WidgetCompositor::NativeGuestStageResponse(MeasureNativeGuestStageCallback callback,
    mojom::blink::NativeGuestStageSubmissionPtr result) {
  if (!CalledOnValidCompositorThread()) {
    compositor_task_runner_->PostTask(FROM_HERE, base::BindOnce(
        &WidgetCompositor::NativeGuestStageResponse, base::RetainedRef(this),
        std::move(callback), std::move(result))); return;
  }
  if (receiver_.is_bound()) std::move(callback).Run(std::move(result));
}
void WidgetCompositor::BeginNativeGuestDocumentFrame(
    mojom::blink::NativeGuestDocumentFrameScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeGuestDocumentFrameLease> lease,
    BeginNativeGuestDocumentFrameCallback callback) {
  DCHECK(CalledOnValidCompositorThread());
  main_task_runner_->PostTask(FROM_HERE, base::BindOnce(
      &WidgetCompositor::BeginNativeGuestDocumentFrameOnMain, base::RetainedRef(this),
      std::move(scope), std::move(lease), std::move(callback)));
}
void WidgetCompositor::BeginNativeGuestDocumentFrameOnMain(
    mojom::blink::NativeGuestDocumentFrameScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeGuestDocumentFrameLease> lease,
    BeginNativeGuestDocumentFrameCallback callback) {
  DCHECK(main_task_runner_->BelongsToCurrentThread());
  auto respond = base::BindOnce(&WidgetCompositor::NativeGuestDocumentFrameResponse,
                               base::RetainedRef(this), std::move(callback));
  if (!widget_base_ || widget_base_->WillBeDestroyed() || !widget_base_->client() ||
      !scope || !lease.is_valid()) { std::move(respond).Run(false); return; }
  widget_base_->client()->BeginNativeGuestDocumentFrame(std::move(scope),
      std::move(lease), std::move(respond));
}
void WidgetCompositor::NativeGuestDocumentFrameResponse(
    BeginNativeGuestDocumentFrameCallback callback, bool armed) {
  if (!CalledOnValidCompositorThread()) {
    compositor_task_runner_->PostTask(FROM_HERE, base::BindOnce(
        &WidgetCompositor::NativeGuestDocumentFrameResponse, base::RetainedRef(this),
        std::move(callback), armed)); return;
  }
  if (receiver_.is_bound()) std::move(callback).Run(armed);
}

void WidgetCompositor::MeasureNativeCommandPresentation(
    mojom::blink::NativeCommandPresentationScopePtr scope,
    mojo::PendingRemote<mojom::blink::NativeCommandPresentationReadiness> readiness,
    MeasureNativeCommandPresentationCallback callback) {
  DCHECK(CalledOnValidCompositorThread());
  main_task_runner_->PostTask(FROM_HERE, base::BindOnce(
      &WidgetCompositor::MeasureNativeCommandPresentationOnMain,
      base::RetainedRef(this), std::move(scope), std::move(readiness), std::move(callback)));
}

void WidgetCompositor::MeasureNativeCommandPresentationOnMain(
    mojom::blink::NativeCommandPresentationScopePtr scope,
    mojo::PendingRemote<mojom::blink::NativeCommandPresentationReadiness> readiness,
    MeasureNativeCommandPresentationCallback callback) {
  DCHECK(main_task_runner_->BelongsToCurrentThread());
  auto respond = base::BindOnce(
      &WidgetCompositor::NativeCommandPresentationResponse,
      base::RetainedRef(this), std::move(callback));
  if (!widget_base_ || !scope || !readiness.is_valid()) {
    std::move(respond).Run(nullptr);
    return;
  }
  mojo::Remote<mojom::blink::NativeCommandPresentationReadiness> ready(
      std::move(readiness));
  auto prepared = base::BindOnce(
      [](mojo::Remote<mojom::blink::NativeCommandPresentationReadiness> ready,
         mojom::blink::NativeCommandPresentationScopePtr actual) {
        ready->Ready(std::move(actual));
      }, std::move(ready));
  widget_base_->client()->MeasureNativeCommandPresentation(
      std::move(scope), std::move(prepared), std::move(respond));
}

void WidgetCompositor::NativeCommandPresentationResponse(
    MeasureNativeCommandPresentationCallback callback,
    mojom::blink::NativeCommandPresentationResultPtr result) {
  if (!CalledOnValidCompositorThread()) {
    compositor_task_runner_->PostTask(FROM_HERE, base::BindOnce(
        &WidgetCompositor::NativeCommandPresentationResponse,
        base::RetainedRef(this), std::move(callback), std::move(result)));
    return;
  }
  if (receiver_.is_bound())
    std::move(callback).Run(std::move(result));
}

cc::LayerTreeHost* WidgetCompositor::LayerTreeHost() const {
  return widget_base_->LayerTreeHost();
}

void WidgetCompositor::CreateQueueSwapPromise(
    base::OnceCallback<void(int)> drain_callback,
    base::OnceClosure swap_callback,
    VisualStateRequestCallback callback) {
  DCHECK(main_task_runner_->BelongsToCurrentThread());

  bool first_message_for_frame = false;
  int source_frame_number = 0;
  if (widget_base_) {
    source_frame_number = LayerTreeHost()->SourceFrameNumber();
    swap_queue_->Queue(source_frame_number, std::move(callback),
                       &first_message_for_frame);
  }

  if (first_message_for_frame) {
    LayerTreeHost()->QueueSwapPromise(
        std::make_unique<QueueReportTimeSwapPromise>(
            source_frame_number, std::move(drain_callback),
            std::move(swap_callback), compositor_task_runner_));
    // Request a main frame if one is not already in progress. This might either
    // A) request a commit ahead of time or B) request a commit which is not
    // needed because there are not pending updates. If B) then the frame will
    // be aborted early and the swap promises will be broken (see
    // EarlyOut_NoUpdates).
    LayerTreeHost()->SetNeedsAnimateIfNotInsideMainFrame();

    // In web tests the request does not actually cause a commit, because the
    // compositor is scheduled by the test runner to avoid flakiness. So for
    // this case we must request a main frame.
    widget_base_->client()->ScheduleAnimationForWebTests();
  } else if (compositor_task_runner_) {
    // Delete callbacks on the compositor thread.
    compositor_task_runner_->PostTask(
        FROM_HERE, base::DoNothingWithBoundArgs(std::move(drain_callback),
                                                std::move(swap_callback)));
  }
}

void WidgetCompositor::VisualStateResponse() {
  DCHECK(CalledOnValidCompositorThread());
  Vector<VisualStateRequestCallback> callbacks;
  swap_queue_->GetCallbacks(&callbacks);
  for (auto& callback : callbacks)
    std::move(callback).Run();
}

void WidgetCompositor::DrainQueue(int source_frame_number) {
  DCHECK(CalledOnValidCompositorThread());
  swap_queue_->Drain(source_frame_number);
}

bool WidgetCompositor::CalledOnValidCompositorThread() {
  return !compositor_task_runner_ ||
         compositor_task_runner_->BelongsToCurrentThread();
}

}  // namespace blink

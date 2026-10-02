// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "third_party/blink/renderer/platform/widget/compositing/widget_compositor.h"

#include <tuple>

#include "base/memory/raw_ptr.h"
#include "base/task/single_thread_task_runner.h"
#include "base/test/task_environment.h"
#include "base/types/pass_key.h"
#include "base/unguessable_token.h"
#include "components/viz/common/surfaces/frame_sink_id.h"
#include "cc/test/layer_tree_test.h"
#include "cc/trees/layer_tree_host.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "third_party/blink/public/platform/scheduler/test/renderer_scheduler_test_support.h"
#include "third_party/blink/renderer/platform/widget/compositing/test/stub_widget_base_client.h"
#include "third_party/blink/renderer/platform/widget/widget_base.h"
#include "third_party/blink/renderer/platform/widget/widget_base_client.h"
#include "third_party/blink/renderer/platform/wtf/thread_safe_ref_counted.h"

namespace blink {

class FakeWidgetCompositor : public WidgetCompositor {
 public:
  static scoped_refptr<FakeWidgetCompositor> Create(
      cc::LayerTreeHost* layer_tree_host,
      base::WeakPtr<WidgetBase> widget_base,
      scoped_refptr<base::SingleThreadTaskRunner> main_task_runner,
      scoped_refptr<base::SingleThreadTaskRunner> compositor_task_runner,
      mojo::PendingReceiver<mojom::blink::WidgetCompositor> receiver) {
    auto compositor = base::MakeRefCounted<FakeWidgetCompositor>(
        WidgetCompositorPassKeyProvider::GetPassKey(), layer_tree_host,
        std::move(widget_base), std::move(main_task_runner),
        std::move(compositor_task_runner));
    compositor->BindOnThread(std::move(receiver));
    return compositor;
  }

  FakeWidgetCompositor(
      base::PassKey<WidgetCompositorPassKeyProvider> pass_key,
      cc::LayerTreeHost* layer_tree_host,
      base::WeakPtr<WidgetBase> widget_base,
      scoped_refptr<base::SingleThreadTaskRunner> main_task_runner,
      scoped_refptr<base::SingleThreadTaskRunner> compositor_task_runner)
      : WidgetCompositor(std::move(pass_key),
                         widget_base,
                         std::move(main_task_runner),
                         std::move(compositor_task_runner)),
        layer_tree_host_(layer_tree_host) {}

  cc::LayerTreeHost* LayerTreeHost() const override { return layer_tree_host_; }

  raw_ptr<cc::LayerTreeHost> layer_tree_host_;

 private:
  friend class ThreadSafeRefCounted<FakeWidgetCompositor>;
  ~FakeWidgetCompositor() override = default;
};

class WidgetCompositorTest : public cc::LayerTreeTest {
 public:
  using CompositorMode = cc::CompositorMode;

  void BeginTest() override {
    mojo::AssociatedRemote<mojom::blink::Widget> widget_remote;
    mojo::PendingAssociatedReceiver<mojom::blink::Widget> widget_receiver =
        widget_remote.BindNewEndpointAndPassDedicatedReceiver();

    mojo::AssociatedRemote<mojom::blink::WidgetHost> widget_host_remote;
    std::ignore = widget_host_remote.BindNewEndpointAndPassDedicatedReceiver();

    widget_base_ = std::make_unique<WidgetBase>(
        /*widget_base_client=*/&client_, widget_host_remote.Unbind(),
        std::move(widget_receiver),
        scheduler::GetSingleThreadTaskRunnerForTesting(),
        /*is_hidden=*/false,
        /*never_composited=*/false,
        /*is_for_child_local_root=*/false,
        /*is_for_scalable_page=*/true);

    widget_compositor_ = FakeWidgetCompositor::Create(
        layer_tree_host(), widget_base_->GetWeakPtr(),
        layer_tree_host()->GetTaskRunnerProvider()->MainThreadTaskRunner(),
        layer_tree_host()->GetTaskRunnerProvider()->ImplThreadTaskRunner(),
        remote_.BindNewPipeAndPassReceiver());

    remote_->VisualStateRequest(base::BindOnce(
        &WidgetCompositorTest::VisualStateResponse, base::Unretained(this)));
    PostSetNeedsCommitToMainThread();
  }

  void VisualStateResponse() {
    if (second_run_with_null_) {
      widget_base_.reset();
      remote_->VisualStateRequest(base::BindOnce(
          &WidgetCompositorTest::VisualStateResponse, base::Unretained(this)));
    }

    is_callback_run_ = true;
    widget_compositor_->Shutdown();
    widget_compositor_ = nullptr;
    EndTest();
  }

  void AfterTest() override { EXPECT_TRUE(is_callback_run_); }

 protected:
  void set_second_run_with_null() { second_run_with_null_ = true; }

 private:
  mojo::Remote<mojom::blink::WidgetCompositor> remote_;
  StubWidgetBaseClient client_;
  std::unique_ptr<WidgetBase> widget_base_;
  scoped_refptr<FakeWidgetCompositor> widget_compositor_;
  bool is_callback_run_ = false;
  bool second_run_with_null_ = false;
  base::test::SingleThreadTaskEnvironment task_environment_;
};

SINGLE_AND_MULTI_THREAD_TEST_F(WidgetCompositorTest);

class WidgetCompositorWithNullWidgetBaseTest : public WidgetCompositorTest {
  void BeginTest() override {
    set_second_run_with_null();
    WidgetCompositorTest::BeginTest();
  }
};

SINGLE_AND_MULTI_THREAD_TEST_F(WidgetCompositorWithNullWidgetBaseTest);

class NativeReadinessRefusalWitness final
    : public mojom::blink::NativeCommandPresentationReadiness {
 public:
  NativeReadinessRefusalWitness();
  ~NativeReadinessRefusalWitness() override;
  void Ready(mojom::blink::NativeCommandPresentationScopePtr) override {
    ++ready_count;
  }
  mojo::Receiver<mojom::blink::NativeCommandPresentationReadiness> receiver{this};
  unsigned ready_count = 0;
};

NativeReadinessRefusalWitness::NativeReadinessRefusalWitness() = default;
NativeReadinessRefusalWitness::~NativeReadinessRefusalWitness() = default;

// Typed private transport refusal tests. These are synthetic source tests,
// not presentation timing or fixture qualification evidence.
// Supply valid private Mojo transport fields so these tests reach the real
// missing-widget/unsupported-client refusal, rather than failing serialization.
// These tokens do not bind an owner or grant measurement authority.
mojom::blink::NativeCommandPresentationScopePtr NativeCommandRefusalScope() {
  auto scope = mojom::blink::NativeCommandPresentationScope::New();
  scope->frame_sink = viz::FrameSinkId(1, 1);
  return scope;
}
mojom::blink::NativeGuestStageScopePtr NativeGuestRefusalScope() {
  auto scope = mojom::blink::NativeGuestStageScope::New();
  scope->request_nonce = base::UnguessableToken::Create();
  scope->shell_sink = viz::FrameSinkId(1, 1);
  scope->display_sink = viz::FrameSinkId(1, 2);
  return scope;
}
mojom::blink::NativeGuestDocumentFrameScopePtr NativeDocumentRefusalScope() {
  auto scope = mojom::blink::NativeGuestDocumentFrameScope::New();
  scope->request_nonce = base::UnguessableToken::Create();
  scope->frame_sink = viz::FrameSinkId(1, 1);
  return scope;
}
mojom::blink::NativeCreatedGuestFrameScopePtr NativeCreatedRefusalScope() {
  auto scope = mojom::blink::NativeCreatedGuestFrameScope::New();
  scope->request_nonce = base::UnguessableToken::Create();
  scope->shell_sink = viz::FrameSinkId(1, 1);
  scope->display_sink = viz::FrameSinkId(1, 2);
  return scope;
}

TEST(WidgetCompositorNativePresentationTest, MissingActualWidgetRefuses) {
  base::test::SingleThreadTaskEnvironment task_environment;
  mojo::Remote<mojom::blink::WidgetCompositor> remote;
  auto compositor = WidgetCompositor::Create(
      {}, base::SingleThreadTaskRunner::GetCurrentDefault(), nullptr,
      remote.BindNewPipeAndPassReceiver());
  NativeReadinessRefusalWitness readiness;
  unsigned callbacks = 0;
  remote->MeasureNativeCommandPresentation(
      NativeCommandRefusalScope(),
      readiness.receiver.BindNewPipeAndPassRemote(),
      base::BindOnce([](unsigned* callbacks, mojom::blink::NativeCommandPresentationResultPtr result) {
        ++*callbacks;
        EXPECT_FALSE(result);
      }, base::Unretained(&callbacks)));
  task_environment.RunUntilIdle();
  EXPECT_EQ(callbacks, 1u);
  EXPECT_EQ(readiness.ready_count, 0u);
  compositor->Shutdown();
  remote.reset();
  task_environment.RunUntilIdle();
}

TEST(WidgetCompositorNativePresentationTest, UnsupportedWidgetClientRefuses) {
  base::test::SingleThreadTaskEnvironment task_environment;
  StubWidgetBaseClient client;
  mojo::AssociatedRemote<mojom::blink::Widget> widget_remote;
  mojo::AssociatedRemote<mojom::blink::WidgetHost> host_remote;
  std::ignore = host_remote.BindNewEndpointAndPassDedicatedReceiver();
  auto widget = std::make_unique<WidgetBase>(
      &client, host_remote.Unbind(),
      widget_remote.BindNewEndpointAndPassDedicatedReceiver(),
      scheduler::GetSingleThreadTaskRunnerForTesting(), false, false, false, true);
  mojo::Remote<mojom::blink::WidgetCompositor> remote;
  auto compositor = WidgetCompositor::Create(
      widget->GetWeakPtr(), base::SingleThreadTaskRunner::GetCurrentDefault(),
      nullptr, remote.BindNewPipeAndPassReceiver());
  NativeReadinessRefusalWitness readiness;
  unsigned callbacks = 0;
  remote->MeasureNativeCommandPresentation(
      NativeCommandRefusalScope(),
      readiness.receiver.BindNewPipeAndPassRemote(),
      base::BindOnce([](unsigned* callbacks, mojom::blink::NativeCommandPresentationResultPtr result) {
        ++*callbacks;
        EXPECT_FALSE(result);
      }, base::Unretained(&callbacks)));
  task_environment.RunUntilIdle();
  EXPECT_EQ(callbacks, 1u);
  EXPECT_EQ(readiness.ready_count, 0u);
  compositor->Shutdown();
  remote.reset();
  widget.reset();
  task_environment.RunUntilIdle();
}

class NativeGuestReadinessRefusalWitness final
    : public mojom::blink::NativeGuestStageReadiness {
 public:
  NativeGuestReadinessRefusalWitness();
  ~NativeGuestReadinessRefusalWitness() override;
  void Ready(mojom::blink::NativeGuestStageScopePtr,
      mojom::blink::NativeGuestStageWitnessPtr, ReadyCallback accepted) override {
    ++ready_count;
    std::move(accepted).Run(false);
  }
  void Started(mojom::blink::NativeGuestStageScopePtr) override { ++started_count; }
  mojo::Receiver<mojom::blink::NativeGuestStageReadiness> receiver{this};
  unsigned ready_count = 0;
  unsigned started_count = 0;
};
NativeGuestReadinessRefusalWitness::NativeGuestReadinessRefusalWitness() = default;
NativeGuestReadinessRefusalWitness::~NativeGuestReadinessRefusalWitness() = default;

TEST(WidgetCompositorNativeGuestTest, MissingActualWidgetRefusesBothPrivateRoutes) {
  base::test::SingleThreadTaskEnvironment environment;
  mojo::Remote<mojom::blink::WidgetCompositor> remote;
  auto compositor = WidgetCompositor::Create(
      {}, base::SingleThreadTaskRunner::GetCurrentDefault(), nullptr,
      remote.BindNewPipeAndPassReceiver());
  NativeGuestReadinessRefusalWitness readiness;
  mojo::Remote<mojom::blink::NativeGuestStageInput> input;
  mojo::Remote<mojom::blink::NativeGuestDocumentFrameLease> lease;
  unsigned callbacks = 0;
  remote->MeasureNativeGuestStage(NativeGuestRefusalScope(),
      readiness.receiver.BindNewPipeAndPassRemote(), input.BindNewPipeAndPassReceiver(),
      base::BindOnce([](unsigned* count, mojom::blink::NativeGuestStageSubmissionPtr result) {
        ++*count; EXPECT_FALSE(result);
      }, base::Unretained(&callbacks)));
  remote->BeginNativeGuestDocumentFrame(NativeDocumentRefusalScope(),
      lease.BindNewPipeAndPassReceiver(), base::BindOnce([](unsigned* count, bool armed) {
        ++*count; EXPECT_FALSE(armed);
      }, base::Unretained(&callbacks)));
  environment.RunUntilIdle();
  EXPECT_EQ(callbacks, 2u); EXPECT_EQ(readiness.ready_count, 0u);
  EXPECT_EQ(readiness.started_count, 0u);
  compositor->Shutdown(); remote.reset(); environment.RunUntilIdle();
}
TEST(WidgetCompositorNativeGuestTest, UnsupportedClientCannotArmOrClaimReadiness) {
  base::test::SingleThreadTaskEnvironment environment;
  StubWidgetBaseClient client;
  mojo::AssociatedRemote<mojom::blink::Widget> widget_remote;
  mojo::AssociatedRemote<mojom::blink::WidgetHost> host_remote;
  std::ignore = host_remote.BindNewEndpointAndPassDedicatedReceiver();
  auto widget = std::make_unique<WidgetBase>(&client, host_remote.Unbind(),
      widget_remote.BindNewEndpointAndPassDedicatedReceiver(),
      scheduler::GetSingleThreadTaskRunnerForTesting(), false, false, false, true);
  mojo::Remote<mojom::blink::WidgetCompositor> remote;
  auto compositor = WidgetCompositor::Create(widget->GetWeakPtr(),
      base::SingleThreadTaskRunner::GetCurrentDefault(), nullptr,
      remote.BindNewPipeAndPassReceiver());
  NativeGuestReadinessRefusalWitness readiness;
  mojo::Remote<mojom::blink::NativeGuestStageInput> input;
  mojo::Remote<mojom::blink::NativeGuestDocumentFrameLease> lease;
  unsigned callbacks = 0;
  remote->MeasureNativeGuestStage(NativeGuestRefusalScope(),
      readiness.receiver.BindNewPipeAndPassRemote(), input.BindNewPipeAndPassReceiver(),
      base::BindOnce([](unsigned* count, mojom::blink::NativeGuestStageSubmissionPtr result) {
        ++*count; EXPECT_FALSE(result);
      }, base::Unretained(&callbacks)));
  remote->BeginNativeGuestDocumentFrame(NativeDocumentRefusalScope(),
      lease.BindNewPipeAndPassReceiver(), base::BindOnce([](unsigned* count, bool armed) {
        ++*count; EXPECT_FALSE(armed);
      }, base::Unretained(&callbacks)));
  environment.RunUntilIdle();
  EXPECT_EQ(callbacks, 2u); EXPECT_EQ(readiness.ready_count, 0u);
  EXPECT_EQ(readiness.started_count, 0u);
  compositor->Shutdown(); remote.reset(); widget.reset(); environment.RunUntilIdle();
}

class NativeCreatedReadinessRefusalWitness final : public mojom::blink::NativeCreatedGuestFrameReadiness {
 public:
  NativeCreatedReadinessRefusalWitness();
  ~NativeCreatedReadinessRefusalWitness() override;
  void Ready(mojom::blink::NativeCreatedGuestFrameScopePtr,
      mojom::blink::NativeGuestStageWitnessPtr, ReadyCallback callback) override {
    ++ready_count; std::move(callback).Run(false);
  }
  mojo::Receiver<mojom::blink::NativeCreatedGuestFrameReadiness> receiver{this};
  unsigned ready_count = 0;
};
NativeCreatedReadinessRefusalWitness::NativeCreatedReadinessRefusalWitness() = default;
NativeCreatedReadinessRefusalWitness::~NativeCreatedReadinessRefusalWitness() = default;

TEST(WidgetCompositorNativeCreatedTest, MissingOrUnsupportedActualWidgetNeverClaimsReady) {
  base::test::SingleThreadTaskEnvironment environment;
  for (const bool supported_widget_object : {false, true}) {
    StubWidgetBaseClient client;
    mojo::AssociatedRemote<mojom::blink::Widget> widget_remote;
    mojo::AssociatedRemote<mojom::blink::WidgetHost> host_remote;
    std::ignore = host_remote.BindNewEndpointAndPassDedicatedReceiver();
    std::unique_ptr<WidgetBase> widget;
    if (supported_widget_object) widget = std::make_unique<WidgetBase>(&client, host_remote.Unbind(),
        widget_remote.BindNewEndpointAndPassDedicatedReceiver(),
        scheduler::GetSingleThreadTaskRunnerForTesting(), false, false, false, true);
    mojo::Remote<mojom::blink::WidgetCompositor> remote;
    auto compositor = WidgetCompositor::Create(widget ? widget->GetWeakPtr() : base::WeakPtr<WidgetBase>(),
        base::SingleThreadTaskRunner::GetCurrentDefault(), nullptr, remote.BindNewPipeAndPassReceiver());
    NativeCreatedReadinessRefusalWitness readiness;
    unsigned replies = 0;
    remote->MeasureCreatedGuestFrame(NativeCreatedRefusalScope(),
        readiness.receiver.BindNewPipeAndPassRemote(), base::BindOnce(
            [](unsigned* count, mojom::blink::NativeCreatedGuestFrameSubmissionPtr result) {
              ++*count; EXPECT_FALSE(result);
            }, base::Unretained(&replies)));
    environment.RunUntilIdle(); EXPECT_EQ(replies, 1u); EXPECT_EQ(readiness.ready_count, 0u);
    compositor->Shutdown(); remote.reset(); widget.reset(); environment.RunUntilIdle();
  }
}
}  // namespace blink

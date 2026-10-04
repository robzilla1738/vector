// Copyright 2026 The Aux Authors
#include "content/browser/renderer_host/render_frame_metadata_provider_impl.h"
#include "base/test/bind.h"
#include "base/test/task_environment.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace content {
namespace {
class CaptureFrameClient final : public FrameTokenMessageQueue::Client {
 public:
  void OnInvalidFrameToken(uint32_t) override {}
  std::string GetMainFrameLastCommittedURLSpec() override;
};
std::string CaptureFrameClient::GetMainFrameLastCommittedURLSpec() { return {}; }
TEST(AuxPersonCaptureActivationTest, OriginalQueueRequiresSubmittedToken) {
  base::test::TaskEnvironment tasks; CaptureFrameClient client;
  RenderFrameMetadataProviderImpl provider(base::SingleThreadTaskRunner::GetCurrentDefault(), &client);
  bool called = false; base::TimeTicks actual;
  provider.WaitForAuxPersonCaptureActivation(73, base::BindLambdaForTesting([&](base::TimeTicks time) { called = true; actual = time; }));
  const auto time = base::TimeTicks::Now();
  provider.DidProcessFrame(72, time); EXPECT_FALSE(called);
  provider.DidProcessFrame(73, time); EXPECT_TRUE(called); EXPECT_EQ(time, actual);
}
TEST(AuxPersonCaptureActivationTest, ZeroAndRetiredOriginalQueueRefuse) {
  base::test::TaskEnvironment tasks; CaptureFrameClient client;
  RenderFrameMetadataProviderImpl provider(base::SingleThreadTaskRunner::GetCurrentDefault(), &client);
  bool called = false; base::TimeTicks actual = base::TimeTicks::Now();
  provider.WaitForAuxPersonCaptureActivation(0, base::BindLambdaForTesting([&](base::TimeTicks time) { called = true; actual = time; }));
  EXPECT_TRUE(called); EXPECT_TRUE(actual.is_null()); called = false;
  provider.WaitForAuxPersonCaptureActivation(73, mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::OnceCallback<void(base::TimeTicks)>(base::BindLambdaForTesting([&](base::TimeTicks time) { called = true; actual = time; })), base::TimeTicks()));
  provider.ResetFrameTokenMessageQueue(); EXPECT_TRUE(called); EXPECT_TRUE(actual.is_null());
}
}  // namespace
}  // namespace content

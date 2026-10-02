// Copyright 2026 The Aux Authors
// Synthetic DOM/timeline source controls, never native startup measurement.
#include "third_party/blink/renderer/core/frame/native_startup_early_eligibility.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_binding_for_core.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_performance_mark_options.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/testing/page_test_base.h"
#include "third_party/blink/renderer/core/timing/dom_window_performance.h"
#include "third_party/blink/renderer/core/timing/window_performance.h"
#include "third_party/blink/renderer/platform/bindings/exception_state.h"
#include "third_party/blink/renderer/platform/bindings/script_state.h"
namespace blink {
class NativeStartupEarlyEligibilityTest : public PageTestBase {
 public:
  NativeStartupEarlyEligibilityTest();
  ~NativeStartupEarlyEligibilityTest() override;
 protected:
  void Fixture(const char* html) {
    GetDocument().SetURL(KURL("chrome://aux/"));
    SetBodyInnerHTML(html);
    UpdateAllLifecyclePhasesForTest();
  }
  void Mark() {
    auto* script = ToScriptStateForMainWorld(&GetFrame()); ASSERT_TRUE(script);
    ScriptState::Scope scope(script);
    DummyExceptionStateForTesting exception;
    DOMWindowPerformance::performance(*GetDocument().domWindow())->mark(
        script, AtomicString("aux-interactive"), PerformanceMarkOptions::Create(), exception);
    ASSERT_FALSE(exception.HadException());
  }
};
NativeStartupEarlyEligibilityTest::NativeStartupEarlyEligibilityTest() = default;
NativeStartupEarlyEligibilityTest::~NativeStartupEarlyEligibilityTest() = default;
TEST_F(NativeStartupEarlyEligibilityTest, UnmarkedOriginalDocumentCanArmBeforeComposerExists) {
  Fixture("<div>Loading the original shell</div>");
  EXPECT_TRUE(NativeStartupDocumentCanArm(GetDocument()));
  Fixture("<textarea></textarea><button disabled>Send</button>");
  EXPECT_TRUE(NativeStartupDocumentCanArm(GetDocument()));
}
TEST_F(NativeStartupEarlyEligibilityTest, PriorMarkRefusesEvenRemovedOrRemountedComposer) {
  Fixture("<textarea></textarea>"); Mark();
  EXPECT_FALSE(NativeStartupDocumentCanArm(GetDocument()));
  Fixture("<div>No input now</div>");
  EXPECT_FALSE(NativeStartupDocumentCanArm(GetDocument()));
  Fixture("<textarea data-aux-interactive-instance=composer-2></textarea>");
  EXPECT_FALSE(NativeStartupDocumentCanArm(GetDocument()));
}
TEST_F(NativeStartupEarlyEligibilityTest, HiddenDisabledOrUnmarkedInstalledInstanceCannotArmLate) {
  for (const char* html : {"<div hidden><textarea data-aux-interactive-instance=composer-1></textarea></div>",
      "<textarea disabled data-aux-interactive-instance=composer-1></textarea>",
      "<textarea data-aux-interactive-instance=composer-1></textarea>"}) {
    Fixture(html); EXPECT_FALSE(NativeStartupDocumentCanArm(GetDocument()));
  }
}
TEST_F(NativeStartupEarlyEligibilityTest, ForeignDocumentCannotBorrowAuxMarkFreeState) {
  Fixture("<textarea></textarea>");
  GetDocument().SetURL(KURL("https://example.invalid/"));
  EXPECT_FALSE(NativeStartupDocumentCanArm(GetDocument()));
}
}  // namespace blink

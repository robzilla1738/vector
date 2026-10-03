// Copyright 2026 The Aux Authors
// Synthetic DOM/timeline tests, never native hardware or startup evidence.
#include "third_party/blink/renderer/core/frame/native_startup_interactive_witness.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_binding_for_core.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_performance_mark_options.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/testing/page_test_base.h"
#include "third_party/blink/renderer/core/timing/dom_window_performance.h"
#include "third_party/blink/renderer/core/timing/window_performance.h"
#include "third_party/blink/renderer/platform/bindings/exception_state.h"
#include "third_party/blink/renderer/platform/bindings/script_state.h"
#include "third_party/blink/renderer/bindings/core/v8/script_value.h"
#include "v8/include/v8.h"
namespace blink {
class NativeStartupInteractiveWitnessTest : public PageTestBase {
 protected:
  void Fixture(const char* html) {
    GetDocument().SetURL(KURL("chrome://aux/"));
    SetBodyInnerHTML(html);
    UpdateAllLifecyclePhasesForTest();
  }
  void Mark(const char* instance) {
    auto* script = ToScriptStateForMainWorld(&GetFrame());
    ASSERT_TRUE(script);
    ScriptState::Scope scope(script);
    auto* isolate = script->GetIsolate();
    auto detail = v8::Object::New(isolate);
    ASSERT_TRUE(detail->CreateDataProperty(script->GetContext(),
        v8::String::NewFromUtf8Literal(isolate, "instance"),
        v8::String::NewFromUtf8(isolate, instance).ToLocalChecked()).FromMaybe(false));
    auto* options = PerformanceMarkOptions::Create();
    options->setDetail(ScriptValue(isolate, detail));
    DummyExceptionStateForTesting exception;
    DOMWindowPerformance::performance(*GetDocument().domWindow())->mark(
        script, AtomicString("aux-interactive"), options, exception);
    ASSERT_FALSE(exception.HadException());
  }
};
TEST_F(NativeStartupInteractiveWitnessTest, GenuineCurrentMarkAndEnabledInputMatch) {
  Fixture("<textarea data-aux-interactive-instance=composer-1></textarea><button disabled>Send</button>");
  EXPECT_FALSE(ReadNativeStartupInteractiveWitness(GetDocument()));
  Mark("composer-1");
  const auto sample = ReadNativeStartupInteractiveWitness(GetDocument());
  ASSERT_TRUE(sample);
  EXPECT_EQ(sample->document, GetDocument().Token());
  EXPECT_EQ(sample->composer_instance, "composer-1");
  EXPECT_FALSE(sample->observed_typeable_at.is_null());
}
TEST_F(NativeStartupInteractiveWitnessTest, PriorDocumentMarkCannotAuthorizeRemountedComposer) {
  Fixture("<textarea data-aux-interactive-instance=composer-1></textarea>");
  Mark("composer-1");
  ASSERT_TRUE(ReadNativeStartupInteractiveWitness(GetDocument()));
  Fixture("<textarea data-aux-interactive-instance=composer-2></textarea>");
  EXPECT_FALSE(ReadNativeStartupInteractiveWitness(GetDocument()));
  Mark("composer-2");
  EXPECT_FALSE(ReadNativeStartupInteractiveWitness(GetDocument()));
}
TEST_F(NativeStartupInteractiveWitnessTest, InheritedDisabledInvisibleAndCoveredInputRefused) {
  Mark("composer-1");
  for (const char* html : {
      "<fieldset disabled><textarea data-aux-interactive-instance=composer-1></textarea></fieldset>",
      "<div style='opacity:0'><textarea data-aux-interactive-instance=composer-1></textarea></div>",
      "<div hidden><textarea data-aux-interactive-instance=composer-1></textarea></div>",
      "<textarea readonly data-aux-interactive-instance=composer-1></textarea>",
      "<textarea data-aux-interactive-instance=composer-1></textarea><div style='position:fixed;inset:0;background:red'></div>"}) {
    Fixture(html);
    EXPECT_FALSE(ReadNativeStartupInteractiveWitness(GetDocument()));
  }
}
TEST_F(NativeStartupInteractiveWitnessTest, ForeignDocumentAndAmbiguousInputRefused) {
  Fixture("<textarea data-aux-interactive-instance=composer-1></textarea>");
  Mark("composer-1");
  GetDocument().SetURL(KURL("https://example.invalid/"));
  EXPECT_FALSE(ReadNativeStartupInteractiveWitness(GetDocument()));
  Fixture("<textarea data-aux-interactive-instance=composer-1></textarea><textarea data-aux-interactive-instance=composer-1></textarea>");
  EXPECT_FALSE(ReadNativeStartupInteractiveWitness(GetDocument()));
}
}  // namespace blink

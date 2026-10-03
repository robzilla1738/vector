// Copyright 2026 The Aux Authors
// Source controls only: injected C++ test tokens are not physical input proof.
#include "third_party/blink/public/web/web_dom_event.h"

#include "base/unguessable_token.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "third_party/blink/public/common/input/web_mouse_event.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_binding_for_core.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_binding_for_testing.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/dom/events/event.h"
#include "third_party/blink/renderer/core/dom/events/native_event_listener.h"
#include "third_party/blink/renderer/core/event_type_names.h"
#include "third_party/blink/renderer/core/frame/local_frame.h"
#include "third_party/blink/renderer/core/frame/settings.h"
#include "third_party/blink/renderer/core/html/html_element.h"
#include "third_party/blink/renderer/core/input/event_handler.h"
#include "third_party/blink/renderer/core/testing/page_test_base.h"
#include "third_party/blink/renderer/platform/bindings/script_state.h"
#include "third_party/blink/renderer/platform/bindings/exception_state.h"

namespace blink {
namespace {
class NativeStopProbe final : public NativeEventListener {
 public:
  explicit NativeStopProbe(ScriptState* state, const WebString& expected_run)
      : state_(state), expected_run_(expected_run) {}
  void Invoke(ExecutionContext*, Event* event) override {
    ScriptState::Scope scope(state_);
    const auto value = event->ToV8(state_);
    auto original = WebDOMEvent::FromV8Value(state_->GetIsolate(), value);
    wrapper_unwrapped_ = !original.IsNull();
    first_ = original.TakeNativeStopInputForCurrentDispatch(expected_run_);
    second_ = original.TakeNativeStopInputForCurrentDispatch(expected_run_);
    original_event_ = event;
  }
  void Trace(Visitor* visitor) const override {
    visitor->Trace(state_);
    visitor->Trace(original_event_);
    NativeEventListener::Trace(visitor);
  }
  bool wrapper_unwrapped() const { return wrapper_unwrapped_; }
  const base::UnguessableToken& first() const { return first_; }
  const base::UnguessableToken& second() const { return second_; }
  Event* original_event() const { return original_event_.Get(); }
 private:
  Member<ScriptState> state_;
  WebString expected_run_;
  Member<Event> original_event_;
  base::UnguessableToken first_, second_;
  bool wrapper_unwrapped_ = false;
};
}  // namespace

class WebNativeStopEventTest : public PageTestBase {
 protected:
  NativeStopProbe* Prepare(const WebString& requested_run = WebString("run"),
                           bool disabled = false) {
    GetDocument().GetSettings()->SetScriptEnabled(true);
    GetDocument().body()->SetInnerHTMLWithoutTrustedTypes(
        disabled ? "<button disabled id='stop' data-native-stop-run='run'>Stop</button>"
                 : "<button id='stop' data-native-stop-run='run'>Stop</button>");
    GetDocument().UpdateStyleAndLayout(DocumentUpdateReason::kTest);
    auto* state = ToScriptStateForMainWorld(&GetFrame());
    EXPECT_NE(state, nullptr);
    if (!state)
      return nullptr;
    EXPECT_TRUE(state->ContextIsValid());
    if (!state->ContextIsValid())
      return nullptr;
    auto* probe = MakeGarbageCollected<NativeStopProbe>(state, requested_run);
    GetDocument().body()->addEventListener(event_type_names::kClick, probe);
    return probe;
  }
  void Click(const base::UnguessableToken& id = {}) {
    WebMouseEvent down(WebInputEvent::Type::kMouseDown,
        gfx::PointF(12, 12), gfx::PointF(12, 12),
        WebPointerProperties::Button::kLeft, 1, WebInputEvent::kLeftButtonDown,
        WebInputEvent::GetStaticTimeStampForTests());
    down.SetFrameScale(1);
    GetFrame().GetEventHandler().HandleMousePressEvent(down);
    WebMouseEvent up(WebInputEvent::Type::kMouseUp,
        gfx::PointF(12, 12), gfx::PointF(12, 12),
        WebPointerProperties::Button::kLeft, 1, WebInputEvent::kNoModifiers,
        WebInputEvent::GetStaticTimeStampForTests());
    up.SetFrameScale(1);
    up.SetNativeMeasurementInputId(id);
    GetFrame().GetEventHandler().HandleMouseReleaseEvent(up);
  }
};

TEST_F(WebNativeStopEventTest, OriginalClickUsesInstalledV8WrapperAndConsumesOnce) {
  auto* probe = Prepare();
  ASSERT_NE(probe, nullptr);
  const auto id = base::UnguessableToken::Create();
  Click(id);
  ASSERT_TRUE(probe->wrapper_unwrapped());
  EXPECT_EQ(probe->first(), id);
  EXPECT_TRUE(probe->second().is_empty());
}
TEST_F(WebNativeStopEventTest, GenericInputDoesNotBecomeNativeFromTrustedClick) {
  auto* probe = Prepare();
  ASSERT_NE(probe, nullptr);
  Click();
  ASSERT_TRUE(probe->wrapper_unwrapped());
  EXPECT_TRUE(probe->first().is_empty());
}
TEST_F(WebNativeStopEventTest, DifferentOriginalRunRefusesAndOutsideDispatchStaysEmpty) {
  auto* probe = Prepare(WebString("foreign-run"));
  ASSERT_NE(probe, nullptr);
  Click(base::UnguessableToken::Create());
  ASSERT_TRUE(probe->wrapper_unwrapped());
  EXPECT_TRUE(probe->first().is_empty());
  ASSERT_NE(probe->original_event(), nullptr);
  WebDOMEvent old(probe->original_event());
  EXPECT_TRUE(old.TakeNativeStopInputForCurrentDispatch(WebString("run")).is_empty());
}
TEST_F(WebNativeStopEventTest, ScriptDispatchCannotBorrowAnUnconsumedOriginalToken) {
  auto* probe = Prepare(WebString("foreign-run"));
  ASSERT_NE(probe, nullptr);
  Click(base::UnguessableToken::Create());
  ASSERT_NE(probe->original_event(), nullptr);
  auto* original = probe->original_event();
  ASSERT_TRUE(original->isTrusted());
  EXPECT_FALSE(original->NativeMeasurementInputId().is_empty());
  DummyExceptionStateForTesting exception;
  GetDocument().getElementById(AtomicString("stop"))->dispatchEventForBindings(original, exception);
  EXPECT_FALSE(exception.HadException());
  EXPECT_FALSE(original->isTrusted());
  EXPECT_TRUE(probe->first().is_empty());
}
}  // namespace blink

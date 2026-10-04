// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_startup_interactive_witness.h"
#include <algorithm>
#include <cmath>
#include <string_view>
#include "third_party/blink/renderer/bindings/core/v8/v8_binding_for_core.h"
#include "third_party/blink/renderer/core/display_lock/display_lock_utilities.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/dom/document_lifecycle.h"
#include "third_party/blink/renderer/core/dom/element.h"
#include "third_party/blink/renderer/core/dom/static_node_list.h"
#include "third_party/blink/renderer/core/frame/local_dom_window.h"
#include "third_party/blink/renderer/core/frame/local_frame.h"
#include "third_party/blink/renderer/core/frame/local_frame_view.h"
#include "third_party/blink/renderer/core/html/forms/html_text_area_element.h"
#include "third_party/blink/renderer/core/layout/hit_test_location.h"
#include "third_party/blink/renderer/core/layout/hit_test_result.h"
#include "third_party/blink/renderer/core/layout/layout_view.h"
#include "third_party/blink/renderer/core/paint/paint_layer_scrollable_area.h"
#include "ui/gfx/geometry/point_conversions.h"
#include "ui/gfx/geometry/rect.h"
#include "third_party/blink/renderer/core/style/computed_style.h"
#include "third_party/blink/renderer/core/timing/dom_window_performance.h"
#include "third_party/blink/renderer/core/timing/performance_entry.h"
#include "third_party/blink/renderer/core/timing/performance_mark.h"
#include "third_party/blink/renderer/core/timing/window_performance.h"
#include "third_party/blink/renderer/platform/bindings/script_state.h"
#include "v8/include/v8.h"
namespace blink {
namespace {
bool CanonicalInstance(const String& instance) {
  if (!instance.starts_with("composer-") || instance.length() < 10 || instance.length() > 25 ||
      instance[9] < '1' || instance[9] > '9') return false;
  uint64_t number = 0;
  for (unsigned i = 9; i < instance.length(); ++i) {
    if (instance[i] < '0' || instance[i] > '9') return false;
    number = number * 10 + instance[i] - '0';
    if (number > 9007199254740991ULL) return false;
  }
  return true;
}
bool MatchesActualMark(Document& document, const String& instance) {
  auto* performance = DOMWindowPerformance::performance(*document.domWindow());
  const auto entries = performance->getEntriesByName(AtomicString("aux-interactive"), AtomicString("mark"));
  if (entries.size() != 1 || entries[0]->source() != document.domWindow() || !entries[0]->IsMark())
    return false;
  auto* script = ToScriptStateForMainWorld(document.GetFrame());
  if (!script || !script->ContextIsValid()) return false;
  ScriptState::Scope scope(script);
  // IsMark above proves the concrete type. PerformanceMark has no
  // DowncastTraits; this matches UserTiming::FindExistingMark's supported cast.
  const auto detail = static_cast<PerformanceMark*>(entries[0].Get())->detail(script).V8Value();
  if (detail.IsEmpty() || !detail->IsObject() || detail->IsProxy()) return false;
  const auto context = script->GetContext();
  const auto object = detail.As<v8::Object>();
  v8::Local<v8::Array> keys;
  if (!object->GetOwnPropertyNames(context).ToLocal(&keys) || keys->Length() != 1) return false;
  auto* isolate = script->GetIsolate();
  v8::Local<v8::Value> descriptor;
  if (!object->GetOwnPropertyDescriptor(context, v8::String::NewFromUtf8Literal(isolate, "instance"))
           .ToLocal(&descriptor) || !descriptor->IsObject()) return false;
  v8::Local<v8::Value> value;
  if (!descriptor.As<v8::Object>()->Get(context, v8::String::NewFromUtf8Literal(isolate, "value"))
           .ToLocal(&value) || !value->IsString() || value.As<v8::String>()->Length() > 25)
    return false;
  const v8::String::Utf8Value bytes(isolate, value);
  return *bytes && std::string_view(*bytes, bytes.length()) == instance.Utf8();
}
}  // namespace
std::optional<NativeStartupInteractiveWitness> ReadNativeStartupInteractiveWitness(Document& document) {
  if (document.Url().GetString() != "chrome://aux/" || !document.domWindow() || !document.GetFrame() ||
      !document.GetFrame()->IsOutermostMainFrame() || document.GetFrame()->GetDocument() != &document ||
      document.hidden() || !document.View() || document.Lifecycle().GetState() != DocumentLifecycle::kPaintClean)
    return std::nullopt;
  auto* candidates = document.QuerySelectorAll(AtomicString("textarea[data-aux-interactive-instance]"));
  if (!candidates || candidates->length() != 1) return std::nullopt;
  auto* input = DynamicTo<HTMLTextAreaElement>(candidates->item(0));
  if (!input || !input->isConnected() || input->IsDisabledFormControl() || input->IsReadOnly() ||
      !input->GetLayoutObject() || DisplayLockUtilities::IsDisplayLockedPreventingPaint(input))
    return std::nullopt;
  unsigned depth = 0;
  for (auto* ancestor = static_cast<Element*>(input); ancestor; ancestor = ancestor->parentElement()) {
    const auto* style = ancestor->GetComputedStyle();
    if (++depth > 128 || !style || style->Visibility() != EVisibility::kVisible || style->Opacity() <= 0 ||
        ancestor->hasAttribute(AtomicString("hidden")) || ancestor->hasAttribute(AtomicString("inert")) ||
        ancestor->getAttribute(AtomicString("aria-hidden")) == "true") return std::nullopt;
  }
  const auto instance = input->getAttribute(AtomicString("data-aux-interactive-instance"));
  if (!CanonicalInstance(instance)) return std::nullopt;
  const auto rect = input->GetBoundingClientRectNoLifecycleUpdate();
  const auto viewport = document.View()->GetLayoutSize();
  if (!std::isfinite(rect.x()) || !std::isfinite(rect.y()) || !std::isfinite(rect.width()) ||
      !std::isfinite(rect.height()) || rect.width() <= 0 || rect.height() <= 0) return std::nullopt;
  const double left = std::max(0.0, static_cast<double>(rect.x()));
  const double top = std::max(0.0, static_cast<double>(rect.y()));
  const double right = std::min(static_cast<double>(viewport.width()), static_cast<double>(rect.right()));
  const double bottom = std::min(static_cast<double>(viewport.height()), static_cast<double>(rect.bottom()));
  if (right <= left || bottom <= top || !document.GetLayoutView()) return std::nullopt;
  // ElementFromPoint updates to pre-paint and invalidates the paint-clean
  // witness itself. Hit-test the already painted original document instead,
  // retaining TreeScope's viewport/zoom and web-exposed retarget semantics.
  gfx::PointF point((left + right) / 2, (top + bottom) / 2);
  const float zoom = document.GetFrame()->LayoutZoomFactor();
  if (!std::isfinite(zoom) || zoom <= 0) return std::nullopt;
  auto* scrollable_area = document.View()->LayoutViewport();
  if (!scrollable_area) return std::nullopt;
  const auto visible = gfx::ScaleToRoundedRect(
      gfx::Rect(scrollable_area->VisibleContentRect(kExcludeScrollbars).size()),
      1 / zoom);
  if (!visible.Contains(gfx::ToRoundedPoint(point))) return std::nullopt;
  point.Scale(zoom);
  const HitTestLocation location(point);
  HitTestResult hit(HitTestRequest::kReadOnly | HitTestRequest::kActive, location);
  if (!document.GetLayoutView()->HitTestNoLifecycleUpdate(location, hit) ||
      document.ElementForHitTest(hit.InnerNode(), TreeScope::kWebExposed) != input ||
      document.Lifecycle().GetState() != DocumentLifecycle::kPaintClean || !MatchesActualMark(document, instance))
    return std::nullopt;
  return NativeStartupInteractiveWitness{document.Token(), instance.Utf8(), base::TimeTicks::Now()};
}
}  // namespace blink

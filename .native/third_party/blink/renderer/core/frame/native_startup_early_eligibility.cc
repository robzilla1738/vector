// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_startup_early_eligibility.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/dom/static_node_list.h"
#include "third_party/blink/renderer/core/frame/local_dom_window.h"
#include "third_party/blink/renderer/core/frame/local_frame.h"
#include "third_party/blink/renderer/core/timing/dom_window_performance.h"
#include "third_party/blink/renderer/core/timing/window_performance.h"
namespace blink {
bool NativeStartupDocumentCanArm(Document& document) {
  if (document.Url().GetString() != "chrome://aux/" || !document.domWindow() || !document.GetFrame() ||
      !document.GetFrame()->IsOutermostMainFrame() || document.GetFrame()->GetDocument() != &document) return false;
  // Early lease may arm before window visibility. Actual typeability and full
  // visible hardware coverage are independently required later.
  auto* performance = DOMWindowPerformance::performance(*document.domWindow());
  if (!performance->getEntriesByName(AtomicString("aux-interactive"), AtomicString("mark")).empty()) return false;
  const auto* instances = document.QuerySelectorAll(AtomicString("[data-aux-interactive-instance]"));
  // A hidden/disabled installed instance without its mark still refuses.
  // A retained prior mark above also fences removed or remounted composers.
  return instances && instances->length() == 0;
}
}  // namespace blink

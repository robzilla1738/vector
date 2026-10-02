// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_organization_work_witness.h"
#include <algorithm>
#include <cmath>
#include "base/check.h"
#include "base/json/json_reader.h"
#include "base/uuid.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_binding_for_core.h"
#include "third_party/blink/renderer/core/timing/performance_measure.h"
#include "third_party/blink/renderer/platform/bindings/script_state.h"
#include "v8/include/v8.h"
#include "third_party/blink/renderer/platform/scheduler/public/thread.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/dom/document_lifecycle.h"
#include "third_party/blink/renderer/core/dom/element.h"
#include "third_party/blink/renderer/core/dom/static_node_list.h"
#include "third_party/blink/renderer/core/frame/local_dom_window.h"
#include "third_party/blink/renderer/core/frame/local_frame.h"
#include "third_party/blink/renderer/core/timing/dom_window_performance.h"
#include "third_party/blink/renderer/core/timing/performance_entry.h"
#include "third_party/blink/renderer/core/timing/window_performance.h"
#include "third_party/blink/renderer/core/timing/time_clamper.h"
namespace blink {
namespace {
const char* MeasureName(NativeOrganizationWork work) {
  switch (work) {
    case NativeOrganizationWork::kAutoArchive: return "aux:autoArchive:cycle";
    case NativeOrganizationWork::kLiveFolderRefresh: return "aux:liveFolders:refresh";
  }
  return nullptr;
}
bool OwnedDocument(Document& document) {
  return document.Url().Protocol() == "chrome" && document.Url().Host() == "aux" &&
      document.domWindow() && document.GetFrame() &&
      document.GetFrame()->GetDocument() == &document &&
      document.GetFrame()->IsOutermostMainFrame();
}
}
NativeOrganizationWorkWitness::NativeOrganizationWorkWitness(
    Document& document, NativeOrganizationWork work) : document_(&document), work_(work) {
  if (!OwnedDocument(document) || !MeasureName(work)) return;
  // Construct the actual per-window producer before work begins. Chromium
  // uses PerformanceMonitor or the actual WebFrameWidget LoAF monitor.
  performance_ = DOMWindowPerformance::performance(*document.domWindow());
  time_origin_ = performance_->GetTimeOriginInternal();
  armed_at_ms_ = performance_->now();
  const auto entries = performance_->getEntriesByName(AtomicString(MeasureName(work)), AtomicString("measure"));
  if (time_origin_.is_null() || !std::isfinite(armed_at_ms_) || armed_at_ms_ < 0 || entries.size() > 20 ||
      performance_->getBufferedEntriesByType(AtomicString("longtask")).size() >= 200) return;
  for (const auto& entry : entries) previous_.emplace_back(entry.Get());
  // Observe real main-thread task completion independently of DOM timeline
  // subscription/LoAF delivery. No zero-entry inference establishes coverage.
  thread_ = Thread::Current();
  if (!thread_ || !thread_->IsCurrentThread()) return;
  tasks_.reserve(4096);
  thread_->AddTaskTimeObserver(this);
  armed_ = true;
}
NativeOrganizationWorkWitness::~NativeOrganizationWorkWitness() {
  if (thread_) {
    CHECK(thread_->IsCurrentThread());
    thread_->RemoveTaskTimeObserver(this);
  }
}
void NativeOrganizationWorkWitness::WillProcessTask(base::TimeTicks) {}
void NativeOrganizationWorkWitness::DidProcessTask(
    base::TimeTicks start, base::TimeTicks end, base::TimeTicks) {
  if (!armed_ || task_overflow_) return;
  if (start.is_null() || end < start ||
      (!completed_through_.is_null() && end < completed_through_) ||
      tasks_.size() >= 4096) {
    task_overflow_ = true;
    return;
  }
  tasks_.push_back(CompletedTask{start, end});
  completed_through_ = end;
}
std::optional<NativeOrganizationWorkSample> NativeOrganizationWorkWitness::Read(Document& document) {
  if (!armed_ || document_.Get() != &document || !OwnedDocument(document) || !performance_ ||
      DOMWindowPerformance::performance(*document.domWindow()) != performance_ ||
      performance_->GetTimeOriginInternal() != time_origin_) return std::nullopt;
  if (!document.View() || document.Lifecycle().GetState() != DocumentLifecycle::kPaintClean)
    return std::nullopt;
  const auto entries = performance_->getEntriesByName(AtomicString(MeasureName(work_)), AtomicString("measure"));
  if (entries.size() > 20) return std::nullopt;
  PerformanceEntry* selected = nullptr;
  for (const auto& entry : entries) {
    if (std::ranges::any_of(previous_, [entry](const auto& previous) { return previous.Get() == entry.Get(); })) continue;
    if (selected || entry->source() != document.domWindow() || !entry->IsMeasure()) return std::nullopt;
    selected = entry.Get();
  }
  if (!selected) return std::nullopt;
  // Only bounded primitive completion metadata from this actual owned shell.
  // No caller JSON, page text, selector, script execution or work substitution.
  auto* script_state = ToScriptStateForMainWorld(document.GetFrame());
  if (!script_state || !script_state->ContextIsValid()) return std::nullopt;
  ScriptState::Scope script_scope(script_state);
  const auto detail = static_cast<PerformanceMeasure*>(selected)->detail(script_state).V8Value();
  if (detail.IsEmpty() || !detail->IsString() ||
      detail.As<v8::String>()->Length() > 512) return std::nullopt;
  const v8::String::Utf8Value detail_bytes(script_state->GetIsolate(), detail);
  if (!*detail_bytes || detail_bytes.length() > 512) return std::nullopt;
  auto completed = base::JSONReader::ReadDict(
      std::string_view(*detail_bytes, detail_bytes.length()), base::JSON_PARSE_RFC);
  const auto units = completed ? completed->FindInt("units") : std::nullopt;
  const auto* operation = completed ? completed->FindString("operationId") : nullptr;
  const bool live = work_ == NativeOrganizationWork::kLiveFolderRefresh;
  const auto* folder = completed ? completed->FindString("folderId") : nullptr;
  if (!completed || completed->size() != (live ? 4u : 3u) ||
      completed->FindBool("committed") != true || !units || *units < 1 ||
      *units > (work_ == NativeOrganizationWork::kAutoArchive ? 20 : 25) ||
      !operation || !base::Uuid::ParseLowercase(*operation).is_valid())
    return std::nullopt;
  if (live) {
    if (!folder || folder->empty() || folder->size() > 200) return std::nullopt;
    auto* containers = document.QuerySelectorAll(AtomicString(".live-folder-rows[data-aux-live-folder-id]"));
    if (!containers || containers->length() > 500) return std::nullopt;
    Element* matched = nullptr;
    for (unsigned i = 0; i < containers->length(); ++i) {
      auto* row = containers->item(i);
      if (row->getAttribute(AtomicString("data-aux-live-folder-id")).Utf8() != *folder) continue;
      if (matched || !row->isConnected() || row->getAttribute(AtomicString("aria-busy")) != "false")
        return std::nullopt;
      matched = row;
    }
    auto* rows = matched ? matched->QuerySelectorAll(AtomicString(".live-folder-item")) : nullptr;
    if (!rows || rows->length() != static_cast<unsigned>(*units)) return std::nullopt;
  }
  const double start = selected->startTime(), duration = selected->duration(), end = start + duration;
  const double endpoint_error_ms = 2.0 * TimeClamper::kCoarseResolutionMicroseconds / 1000.0;
  // A new measure can reuse old marks. Require work to have genuinely begun
  // after preparation, even at the worst privacy-clamping endpoint error.
  if (!std::isfinite(start) || start < armed_at_ms_ + endpoint_error_ms || !std::isfinite(duration) || duration < 0 ||
      !std::isfinite(end) || end > performance_->now()) return std::nullopt;
  const auto tasks = performance_->getBufferedEntriesByType(AtomicString("longtask"));
  // The actual native buffer cap is200. Refuse a saturated history rather
  // than claiming absent long tasks after Chromium has dropped entries.
  if (tasks.size() >= 200) return std::nullopt;
  // Read must occur in a later completed task. A reply/microtask in the
  // task containing the end mark cannot hide its eventual long-task duration.
  if (!thread_ || task_overflow_ || completed_through_.is_null())
    return std::nullopt;
  const double completed_ms = (completed_through_ - time_origin_).InMillisecondsF();
  if (!std::isfinite(completed_ms) || completed_ms < end + endpoint_error_ms)
    return std::nullopt;
  NativeOrganizationWorkSample sample{
      start, duration, duration + endpoint_error_ms, true, 0, 0, 0, 0,
      completed_ms, *operation, static_cast<unsigned>(*units), folder ? *folder : ""};
  for (const auto& task : tasks_) {
    const double began = (task.start - time_origin_).InMillisecondsF();
    const double finished = (task.end - time_origin_).InMillisecondsF();
    if (began <= completed_ms &&
        finished >= start - endpoint_error_ms) {
      ++sample.completed_tasks;
      sample.maximum_task_ms = std::max(
          sample.maximum_task_ms, (task.end - task.start).InMillisecondsF());
    }
  }
  if (!sample.completed_tasks) return std::nullopt;
  for (const auto& task : tasks) {
    const double began = task->startTime(), elapsed = task->duration();
    if (task->source() != document.domWindow() || !std::isfinite(began) || began < 0 ||
        !std::isfinite(elapsed) || elapsed < 0 || !std::isfinite(began + elapsed)) return std::nullopt;
    // Expand both intervals conservatively for privacy-clamped endpoints.
    // A task close to the boundary must not disappear from the overlap gate.
    if (began <= completed_ms + endpoint_error_ms &&
        began + elapsed >= start - 2 * endpoint_error_ms) {
      ++sample.overlapping_long_tasks;
      sample.maximum_long_task_ms = std::max(sample.maximum_long_task_ms, elapsed);
    }
  }
  armed_ = false;
  return sample;
}
}  // namespace blink

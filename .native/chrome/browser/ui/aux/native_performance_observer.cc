// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license in the LICENSE file.
#include "chrome/browser/ui/aux/native_performance_observer.h"

#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>
#include <utility>
#include "base/command_line.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/process/process_metrics.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "content/public/browser/browser_child_process_host.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/weak_document_ptr.h"
#include "ui/compositor/compositor.h"
#include "ui/gfx/presentation_feedback.h"

namespace aux {
namespace {
constexpr unsigned kMaximumRecords = 4000;
unsigned records = 0;
const char* MetricName(PresentationMetric metric) {
  switch (metric) {
    case PresentationMetric::kCommandResults: return "command-results";
    case PresentationMetric::kSplitDrop: return "split-drop";
    case PresentationMetric::kClaim: return "claim";
    case PresentationMetric::kLittleWindow: return "little-window";
    case PresentationMetric::kPictureInPicture: return "picture-in-picture";
    case PresentationMetric::kTabSwitch: return "tab-switch";
  }
  return "unknown";
}
bool ValidTarget(const PerformanceTarget& target) {
  return target.window_id > 0 && target.content_id > 0 && target.process_id > 0 &&
         target.document_generation > 0;
}
void Emit(base::DictValue record) {
  if (!NativePerformanceObservationEnabled() || records >= kMaximumRecords) return;
  record.Set("producer", "aux-native-performance"); record.Set("version", 1);
  record.Set("pid", static_cast<int>(getpid()));
  record.Set("nativeUnixMs", base::Time::Now().InMillisecondsFSinceUnixEpoch());
  const auto json = base::WriteJson(record);
  if (!json || json->size() > 4096) return;
  ++records;
  fprintf(stderr, "AUX_NATIVE_PERFORMANCE_V1 %s\n", json->c_str());
  fflush(stderr);
}
void SetTarget(base::DictValue& record, const PerformanceTarget& target) {
  record.Set("windowId", target.window_id); record.Set("contentId", target.content_id);
  record.Set("rendererPid", target.process_id);
  record.Set("documentGeneration", base::NumberToString(target.document_generation));
}
}  // namespace

bool NativePerformanceObservationEnabled() {
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  return NativePerformanceObservationMetadataEnabled();
#else
  return false;
#endif
}
std::optional<base::TimeDelta> ValidatedPresentationInterval(
    base::TimeTicks input, base::TimeTicks matched, base::TimeTicks now,
    const gfx::PresentationFeedback& feedback) {
  if (input.is_null() || matched.is_null() || now.is_null() || matched < input ||
      feedback.failed() || !(feedback.flags & gfx::PresentationFeedback::kHWCompletion) ||
      feedback.timestamp.is_null() || feedback.timestamp < matched ||
      feedback.timestamp > now || feedback.timestamp - input > base::Seconds(5))
    return std::nullopt;
  return feedback.timestamp - input;
}
NativePresentationObserver::NativePresentationObserver(ui::Compositor* compositor,
                                                       TargetReader read_target)
    : compositor_(compositor), read_target_(std::move(read_target)) {
  if (compositor_ && !read_target_.is_null() && NativePerformanceObservationEnabled()) compositor_->AddObserver(this);
  else compositor_ = nullptr;
}
NativePresentationObserver::~NativePresentationObserver() {
  Cancel();
  if (compositor_) compositor_->RemoveObserver(this);
}
bool NativePresentationObserver::Arm(PresentationMetric metric, base::TimeTicks native_input) {
  if (!input_.is_null()) { Refuse("overlapping-input"); return false; }
  if (!compositor_ || read_target_.is_null() || !NativePerformanceObservationEnabled() || records >= kMaximumRecords ||
      native_input.is_null() || native_input <= last_input_ || native_input > base::TimeTicks::Now() ||
      base::TimeTicks::Now() - native_input > base::Seconds(1)) return false;
  auto target = read_target_.Run();
  if (!target || !ValidTarget(*target)) return false;
  target_ = target; metric_ = metric; input_ = native_input; last_input_ = native_input;
  timeout_.Start(FROM_HERE, base::Seconds(5),
                 base::BindOnce(&NativePresentationObserver::Refuse, base::Unretained(this),
                                "matching-presentation-timeout"));
  return true;
}
bool NativePresentationObserver::MatchSubmittedFrame(uint32_t token,
                                                     const PerformanceTarget& target) {
  if (input_.is_null() || !token || token <= last_token_ || token_ || !target_ ||
      target != *target_ || read_target_.Run() != target_ || !NativePerformanceObservationEnabled()) {
    if (!input_.is_null()) Refuse("invalid-matching-frame");
    return false;
  }
  token_ = token; last_token_ = token; matched_ = base::TimeTicks::Now();
  return true;
}
void NativePresentationObserver::OnDidPresentCompositorFrame(
    ui::Compositor* compositor, uint32_t token, const gfx::PresentationFeedback& feedback) {
  if (input_.is_null() || compositor != compositor_ || token != token_) return;
  const auto elapsed = ValidatedPresentationInterval(input_, matched_, base::TimeTicks::Now(), feedback);
  if (!elapsed || !NativePerformanceObservationEnabled() || read_target_.Run() != target_) {
    Refuse("invalid-presentation"); return;
  }
  base::DictValue record;
  record.Set("status", "measured"); record.Set("metric", MetricName(metric_));
  SetTarget(record, *target_);
  record.Set("clock", "base-TimeTicks");
  record.Set("inputTicksUs", base::NumberToString(input_.since_origin().InMicroseconds()));
  record.Set("matchingFrameTicksUs", base::NumberToString(matched_.since_origin().InMicroseconds()));
  record.Set("presentationTicksUs", base::NumberToString(feedback.timestamp.since_origin().InMicroseconds()));
  record.Set("elapsedMs", elapsed->InMillisecondsF());
  record.Set("rootFrameToken", base::NumberToString(token));
  record.Set("feedbackFlags", static_cast<int>(feedback.flags));
  record.Set("refreshIntervalUs", base::NumberToString(feedback.interval.InMicroseconds()));
  Emit(std::move(record)); Cancel();
}
void NativePresentationObserver::Refuse(const char* reason) {
  if (input_.is_null()) return;
  base::DictValue record;
  record.Set("status", "refused"); record.Set("metric", MetricName(metric_));
  record.Set("reason", reason);
  record.Set("clock", "base-TimeTicks");
  record.Set("inputTicksUs", base::NumberToString(input_.since_origin().InMicroseconds()));
  record.Set("matchingFrameTicksUs", base::NumberToString(matched_.since_origin().InMicroseconds()));
  record.Set("rootFrameToken", base::NumberToString(token_));
  if (target_) SetTarget(record, *target_);
  Emit(std::move(record)); Cancel();
}
void NativePresentationObserver::Cancel() {
  timeout_.Stop(); target_.reset(); input_ = base::TimeTicks();
  matched_ = base::TimeTicks(); token_ = 0;
}
void NativePresentationObserver::OnCompositingShuttingDown(ui::Compositor* compositor) {
  if (compositor != compositor_) return;
  Refuse("compositor-destroyed"); compositor_->RemoveObserver(this); compositor_ = nullptr;
}
std::optional<base::DictValue> MeasureCurrentShellMemory(
    content::WebContents* shell, NativePresentationObserver::TargetReader read_target) {
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  if (!NativePerformanceObservationEnabled() || read_target.is_null() || !shell || shell->IsBeingDestroyed()) return std::nullopt;
  const auto target = read_target.Run();
  if (!target || !ValidTarget(*target)) return std::nullopt;
  Profile* profile = Profile::FromBrowserContext(shell->GetBrowserContext());
  const base::FilePath selected(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"));
  if (!profile || profile->IsOffTheRecord() || profile->GetPath().DirName() != selected) return std::nullopt;
  auto* frame = shell->GetPrimaryMainFrame();
  if (!frame || !frame->IsRenderFrameLive() || frame->IsErrorDocument() || frame->GetLastCommittedURL().spec() != "chrome://aux/") return std::nullopt;
  const auto frame_id = frame->GetGlobalId();
  const auto document = frame->GetWeakDocumentPtr();
  auto* process = frame->GetProcess();
  if (!process || !process->GetProcess().IsValid()) return std::nullopt;
  const auto pid = process->GetProcess().Pid();
  if (pid != target->process_id) return std::nullopt;
  auto metrics = base::ProcessMetrics::CreateProcessMetrics(
      process->GetProcess().Handle(), content::BrowserChildProcessHost::GetPortProvider());
  if (!metrics) return std::nullopt;
  const auto read_start = base::TimeTicks::Now();
  const auto memory = metrics->GetMemoryInfo();
  const auto read_end = base::TimeTicks::Now();
  if (!memory.has_value()) {
    base::DictValue refused;
    refused.Set("status", "refused"); refused.Set("metric", "shell-process-memory");
    refused.Set("reason", "process-memory-unavailable");
    refused.Set("processUsageError", static_cast<int>(memory.error()));
    SetTarget(refused, *target); Emit(refused.Clone()); return refused;
  }
  if (memory->resident_set_bytes == 0 ||
      memory->physical_footprint_bytes == 0 || !NativePerformanceObservationEnabled() ||
      shell->IsBeingDestroyed() || document.AsRenderFrameHostIfValid() != frame ||
      read_target.Run() != target || shell->GetPrimaryMainFrame() != frame ||
      frame->GetGlobalId() != frame_id || !frame->IsRenderFrameLive() ||
      frame->GetLastCommittedURL().spec() != "chrome://aux/" ||
      frame->GetProcess() != process || !process->GetProcess().IsValid() || process->GetProcess().Pid() != pid) return std::nullopt;
  base::DictValue record;
  record.Set("metric", "shell-process-memory"); record.Set("status", "measured");
  SetTarget(record, *target);
  record.Set("frameRoutingId", frame_id.frame_routing_id);
  record.Set("sampleTicksUs", base::NumberToString(read_end.since_origin().InMicroseconds()));
  record.Set("readDurationUs", base::NumberToString((read_end - read_start).InMicroseconds()));
  record.Set("residentSetBytes", base::NumberToString(memory->resident_set_bytes));
  record.Set("physicalFootprintBytes", base::NumberToString(memory->physical_footprint_bytes));
  record.Set("internalBytes", base::NumberToString(memory->internal_bytes));
  record.Set("compressedBytes", base::NumberToString(memory->compressed_bytes));
  Emit(record.Clone());
  return record;
#else
  return std::nullopt;
#endif
}
}  // namespace aux

// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_ORGANIZATION_WORK_WITNESS_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_ORGANIZATION_WORK_WITNESS_H_
#include <array>
#include <optional>
#include <string>
#include "base/time/time.h"
#include "base/memory/raw_ptr.h"
#include "base/task/sequence_manager/task_time_observer.h"
#include "third_party/blink/renderer/core/core_export.h"
#include "third_party/blink/renderer/platform/heap/persistent.h"
#include "third_party/blink/renderer/platform/wtf/vector.h"
namespace blink {
class Document;
class PerformanceEntry;
class WindowPerformance;
class Thread;
enum class NativeOrganizationWork { kAutoArchive, kLiveFolderRefresh };
struct NativeOrganizationWorkSample {
  double start_ms;
  double duration_ms;
  // DOM User Timing is privacy-clamped. Gate the conservative clock-resolution upper
  // bound, never treat it as raw native clock precision.
  double duration_upper_bound_ms;
  bool long_task_coverage;
  // Qualification requires actual coverage AND zero overlapping long tasks.
  // The raw clamped maximum alone cannot prove a 50ms boundary.
  unsigned overlapping_long_tasks;
  double maximum_long_task_ms;
  unsigned completed_tasks;
  double maximum_task_ms;
  double completed_through_ms;
  std::string operation_id;
  unsigned units;
  std::string folder_id;
};
// Private browser fixture transport only. User Timing measures real whole
// asynchronous work; these endpoints never establish compositor presentation.
class CORE_EXPORT NativeOrganizationWorkWitness final
    : public base::sequence_manager::TaskTimeObserver {
 public:
  NativeOrganizationWorkWitness(Document&, NativeOrganizationWork);
  ~NativeOrganizationWorkWitness() override;
  NativeOrganizationWorkWitness(const NativeOrganizationWorkWitness&) = delete;
  NativeOrganizationWorkWitness& operator=(const NativeOrganizationWorkWitness&) = delete;
  bool armed() const { return armed_; }
  std::optional<NativeOrganizationWorkSample> Read(Document&);
 private:
  void WillProcessTask(base::TimeTicks) override;
  void DidProcessTask(base::TimeTicks, base::TimeTicks, base::TimeTicks) override;
  struct CompletedTask { base::TimeTicks start; base::TimeTicks end; };
  raw_ptr<Thread> thread_ = nullptr;
  Vector<CompletedTask> tasks_;
  base::TimeTicks completed_through_;
  bool task_overflow_ = false;
  WeakPersistent<Document> document_;
  WeakPersistent<WindowPerformance> performance_;
  NativeOrganizationWork work_;
  base::TimeTicks time_origin_;
  double armed_at_ms_ = 0;
  std::array<WeakPersistent<PerformanceEntry>, 20> previous_;
  std::size_t previous_count_ = 0;
  bool armed_ = false;
};
}  // namespace blink
#endif

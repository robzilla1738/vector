#include "chrome/browser/profiles/aux_async_profile_creation_admission.h"

#include <atomic>
#include <limits>
#include <mutex>
#include <set>

namespace aux {
namespace {
constexpr uint64_t kClosed = uint64_t{1} << 63;
constexpr uint64_t kActiveMask = kClosed - 1;
// One native process-owned state, unaffected by ProfileManager construction.
// The only admission transition is open-generation1 -> permanently closed.
constinit std::atomic<uint64_t> state{0};
struct Initializations {
  Initializations();
  ~Initializations();
  std::mutex mutex;
  std::set<const void*> unfinished;
  size_t unresolved = 0;
};
Initializations::Initializations() = default;
Initializations::~Initializations() = default;
Initializations& Records() {
  // Native process lifetime; no teardown callback may reset pending/unknown.
  static Initializations* const records = new Initializations;
  return *records;
}
void RecordUnresolved(Initializations& records) {
  if (records.unresolved != std::numeric_limits<size_t>::max())
    ++records.unresolved;
}

bool Acquire(uint64_t generation) {
  if (generation != 1)
    return false;
  uint64_t observed = state.load(std::memory_order_acquire);
  for (;;) {
    if ((observed & kClosed) || (observed & kActiveMask) == kActiveMask)
      return false;
    if (state.compare_exchange_weak(observed, observed + 1,
                                    std::memory_order_acq_rel,
                                    std::memory_order_acquire)) {
      return true;
    }
  }
}
}  // namespace

uint64_t CaptureAsyncProfileCreationGeneration() {
  return (state.load(std::memory_order_acquire) & kClosed) ? 0 : 1;
}
bool IsAsyncProfileCreationGenerationCurrent(uint64_t generation) {
  return generation == 1 && CaptureAsyncProfileCreationGeneration() == generation;
}
void CloseAsyncProfileCreationAdmission() {
  state.fetch_or(kClosed, std::memory_order_acq_rel);
}
AsyncProfileCreationAdmissionSnapshot InspectAsyncProfileCreationAdmission() {
  auto& records = Records();
  std::lock_guard<std::mutex> lock(records.mutex);
  const uint64_t observed = state.load(std::memory_order_acquire);
  return {(observed & kClosed) ? uint64_t{0} : uint64_t{1},
          (observed & kClosed) != 0,
          static_cast<size_t>(observed & kActiveMask),
          records.unfinished.size(), records.unresolved};
}
void ObserveAsyncProfileInitializationStarted(const void* profile) {
  auto& records = Records();
  std::lock_guard<std::mutex> lock(records.mutex);
  if (!profile || !records.unfinished.insert(profile).second)
    RecordUnresolved(records);
}
void ObserveAsyncProfileInitializationFinished(const void* profile) {
  auto& records = Records();
  std::lock_guard<std::mutex> lock(records.mutex);
  if (records.unfinished.erase(profile) != 1)
    RecordUnresolved(records);
}
void ObserveAsyncProfileInitializationAbandoned(const void* profile) {
  auto& records = Records();
  std::lock_guard<std::mutex> lock(records.mutex);
  if (records.unfinished.erase(profile) == 1)
    RecordUnresolved(records);
}
ScopedAsyncProfileCreationDispatch::ScopedAsyncProfileCreationDispatch(
    uint64_t generation) : admitted_(Acquire(generation)) {}
ScopedAsyncProfileCreationDispatch::~ScopedAsyncProfileCreationDispatch() {
  if (admitted_)
    state.fetch_sub(1, std::memory_order_acq_rel);
}
}  // namespace aux

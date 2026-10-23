#include "../source/AuxWorkerDrain.h"
#include <utility>
using D = AuxDevelopmentWorkerDrain;
constexpr bool AllResultsRemainMonotonic() {
  constexpr D values[] = {D::drained, D::pending, D::reentrant, D::untracked, D::wrongProcess};
  for (auto a : values) for (auto b : values) {
    const auto merged = AuxMergeWorkerDrain(a, b);
    if (AuxWorkerDrainRank(merged) < AuxWorkerDrainRank(a) ||
        AuxWorkerDrainRank(merged) < AuxWorkerDrainRank(b) ||
        merged != AuxMergeWorkerDrain(b, a)) return false;
    for (auto c : values) {
      if (AuxMergeWorkerDrain(merged, c) !=
          AuxMergeWorkerDrain(a, AuxMergeWorkerDrain(b, c))) return false;
    }
  }
  return true;
}
static_assert(AllResultsRemainMonotonic());
// Actual formerly lossy sequences from CloseAttempt and CloseAndDrain.
static_assert(AuxMergeWorkerDrain(D::wrongProcess,
    AuxWorkerDrainFromPdf(AuxPdfHostDrain::untracked)) == D::wrongProcess);
static_assert(AuxMergeWorkerDrain(D::untracked,
    AuxWorkerDrainFromUtility(AuxUtilityHostDrain::pending)) == D::untracked);
static_assert(AuxMergeWorkerDrain(D::reentrant,
    AuxWorkerDrainFromUtility(AuxUtilityHostDrain::pending)) == D::reentrant);
static_assert(AuxMergeWorkerDrain(D::drained,
    AuxWorkerDrainFromUtility(static_cast<AuxUtilityHostDrain>(99))) == D::untracked);
static_assert(AuxMergeWorkerDrain(static_cast<D>(99), D::pending) == D::untracked);
static_assert(noexcept(std::declval<AuxDevelopmentWorkerHost&>().CloseAndDrain()));

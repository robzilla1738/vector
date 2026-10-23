#pragma once
#include "AuxDevelopmentWorkerHost.h"
#include "../../../aux-native-pdf-host-consumer/source/AuxLoadedPdfLifetime.h"
#include "../../../aux-native-utility-host-consumer/source/AuxLoadedUtilityLifetime.h"

// Result precedence describes observed failure, never new custody or admission.
// Untracked outranks reentrancy/pending; a different process outranks all others.
constexpr unsigned AuxWorkerDrainRank(AuxDevelopmentWorkerDrain value) noexcept {
  switch (value) {
    case AuxDevelopmentWorkerDrain::drained: return 0;
    case AuxDevelopmentWorkerDrain::pending: return 1;
    case AuxDevelopmentWorkerDrain::reentrant: return 2;
    case AuxDevelopmentWorkerDrain::untracked: return 3;
    case AuxDevelopmentWorkerDrain::wrongProcess: return 4;
  }
  return 3;
}
constexpr AuxDevelopmentWorkerDrain AuxMergeWorkerDrain(
    AuxDevelopmentWorkerDrain left, AuxDevelopmentWorkerDrain right) noexcept {
  // Reject unknown enum representations rather than allowing them to mean drain.
  constexpr AuxDevelopmentWorkerDrain values[] = {
      AuxDevelopmentWorkerDrain::drained, AuxDevelopmentWorkerDrain::pending,
      AuxDevelopmentWorkerDrain::reentrant, AuxDevelopmentWorkerDrain::untracked,
      AuxDevelopmentWorkerDrain::wrongProcess};
  const auto a = AuxWorkerDrainRank(left), b = AuxWorkerDrainRank(right);
  return values[a > b ? a : b];
}
constexpr AuxDevelopmentWorkerDrain AuxWorkerDrainFromPdf(AuxPdfHostDrain value) noexcept {
  switch (value) {
    case AuxPdfHostDrain::notPresent:
    case AuxPdfHostDrain::drained: return AuxDevelopmentWorkerDrain::drained;
    case AuxPdfHostDrain::pending: return AuxDevelopmentWorkerDrain::pending;
    case AuxPdfHostDrain::untracked: return AuxDevelopmentWorkerDrain::untracked;
    case AuxPdfHostDrain::wrongProcess: return AuxDevelopmentWorkerDrain::wrongProcess;
  }
  return AuxDevelopmentWorkerDrain::untracked;
}
constexpr AuxDevelopmentWorkerDrain AuxWorkerDrainFromUtility(AuxUtilityHostDrain value) noexcept {
  switch (value) {
    case AuxUtilityHostDrain::notPresent:
    case AuxUtilityHostDrain::drained: return AuxDevelopmentWorkerDrain::drained;
    case AuxUtilityHostDrain::pending: return AuxDevelopmentWorkerDrain::pending;
    case AuxUtilityHostDrain::untracked: return AuxDevelopmentWorkerDrain::untracked;
    case AuxUtilityHostDrain::wrongProcess: return AuxDevelopmentWorkerDrain::wrongProcess;
  }
  return AuxDevelopmentWorkerDrain::untracked;
}

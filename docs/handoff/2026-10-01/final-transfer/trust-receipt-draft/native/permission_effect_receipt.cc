// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/permission_effect_receipt.h"
#include <cmath>
#include "base/time/time.h"
#include "chrome/browser/ui/aux/power_activity_mac.h"
namespace aux {
std::optional<PermissionEffectReceipt> PermissionEffectReceipt::Parse(
    const base::DictValue& value, const std::string& batch,
    const std::string& reservation, int nonce) {
  const auto* actual_batch = value.FindString("batchId");
  const auto* actual_reservation = value.FindString("reservationId");
  const auto* decision = value.FindString("decision");
  if (!actual_batch || *actual_batch != batch || !actual_reservation ||
      *actual_reservation != reservation || value.FindInt("nonce") != nonce ||
      !decision || *decision != "allow") return std::nullopt;
  PermissionEffectReceipt receipt;
  if (value.contains("overnight")) {
    const auto* overnight = value.FindDict("overnight");
    if (!overnight) return std::nullopt;
    const auto end = overnight->FindDouble("windowEnd");
    const auto ac = overnight->FindBool("requireAC");
    if (!end || !std::isfinite(*end) || *end < 0 || std::floor(*end) != *end || !ac)
      return std::nullopt;
    receipt.window_end_ = *end;
    receipt.require_ac_ = *ac;
  }
  return receipt;
}
bool PermissionEffectReceipt::CanGrant(Profile* profile) const {
  return !window_end_ ||
      (base::Time::Now().InMillisecondsFSinceUnixEpoch() < *window_end_ &&
       PowerActivityMac::AllowsBackgroundEffect(profile, require_ac_));
}
}  // namespace aux

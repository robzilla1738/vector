// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_PERMISSION_EFFECT_RECEIPT_H_
#define CHROME_BROWSER_UI_AUX_PERMISSION_EFFECT_RECEIPT_H_
#include <optional>
#include <string>
#include "base/values.h"
class Profile;
namespace aux {
// Authenticated runtime authority for ONE exact native batch/attempt.
class PermissionEffectReceipt {
 public:
  static std::optional<PermissionEffectReceipt> Parse(const base::DictValue& value,
      const std::string& batch, const std::string& reservation, int nonce);
  bool CanGrant(Profile* profile) const;
 private:
  std::optional<double> window_end_;
  bool require_ac_ = false;
};
}  // namespace aux
#endif

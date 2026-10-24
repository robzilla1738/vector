// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_FEATURE_STORE_FEATURE_PROFILE_STORE_H_
#define CHROME_BROWSER_AUX_FEATURE_STORE_FEATURE_PROFILE_STORE_H_
#include <optional>
#include <string_view>
#include "base/callback_list.h"
#include "base/functional/callback.h"
#include "base/values.h"
class Profile;
namespace aux::features {
// UI sequence only. Explicit native startup initialization; never redirects
// private profiles or treats unavailable/corrupt state as a fresh empty file.
void InitializeForProfile(Profile*);
// Includes real read/write I/O and pending UI settlement. This is one feature
// writer's exclusion, not a complete browser drain/custody certificate.
bool IsWritePending(Profile*);
base::CallbackListSubscription ObserveSettled(Profile*, base::RepeatingClosure);
base::CallbackListSubscription ObserveReady(Profile*, base::RepeatingClosure);
// nullopt means not ready/refused. An empty dict means ready but no value yet.
// Only "downloads" is admitted. Get does not initialize or do disk I/O.
std::optional<base::DictValue> GetNamespace(Profile*, std::string_view name);
// True only after actual completed atomic write and current native-owner check.
// On failure/stale owner call Initialize explicitly after settlement to reload.
void CommitNamespace(Profile*, std::string_view name, base::DictValue value,
                     base::OnceCallback<void(bool)> done);
}  // namespace aux::features
#endif

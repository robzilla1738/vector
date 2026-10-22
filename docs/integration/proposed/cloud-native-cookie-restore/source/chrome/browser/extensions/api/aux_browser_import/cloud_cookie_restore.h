// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CLOUD_COOKIE_RESTORE_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CLOUD_COOKIE_RESTORE_H_
#include <optional>
#include <string>
#include "base/functional/callback.h"
#include "base/values.h"
class Profile;
namespace aux_import {
// UI sequence, actual caller profile only. No profile/path lookup or fallback.
void RestoreCloudCookies(Profile* profile, const base::DictValue& options,
    base::OnceCallback<void(std::optional<base::Value>, std::string)> reply);
}  // namespace aux_import
#endif

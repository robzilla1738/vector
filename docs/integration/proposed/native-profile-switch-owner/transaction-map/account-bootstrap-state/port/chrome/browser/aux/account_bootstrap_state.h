// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_AUX_ACCOUNT_BOOTSTRAP_STATE_H_
#define CHROME_BROWSER_AUX_ACCOUNT_BOOTSTRAP_STATE_H_

#include <optional>
#include <string>
#include <string_view>

#include "base/files/file_path.h"
#include "base/values.h"

namespace aux {
// Supplied accounts reader semantics, independent of Vault lock state. The
// absent result means no readable accounts object, not an incomplete account.
std::optional<bool> EvaluateAccountBootstrapState(
    const base::Value& accounts,
    std::string_view profile_id,
    const base::FilePath& profile_path,
    std::string_view account_user_id);
std::optional<bool> ReadAccountBootstrapState(
    const base::FilePath& home,
    std::string profile_id,
    base::FilePath profile_path,
    std::string account_user_id);
}  // namespace aux
#endif  // CHROME_BROWSER_AUX_ACCOUNT_BOOTSTRAP_STATE_H_

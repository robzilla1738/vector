// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_AUX_PROFILE_ACCOUNT_METADATA_H_
#define CHROME_BROWSER_AUX_PROFILE_ACCOUNT_METADATA_H_

#include <map>
#include <string>

#include "base/files/file_path.h"
#include "base/values.h"

namespace aux {
using ProfileAccountEmails = std::map<base::FilePath, std::string>;
ProfileAccountEmails ProjectProfileAccountEmails(
    const base::DictValue& registry);
// Fixed Aux home/accounts.json only. Blocking: call on a MayBlock worker.
ProfileAccountEmails ReadProfileAccountEmails(const base::FilePath& home);
}  // namespace aux
#endif  // CHROME_BROWSER_AUX_PROFILE_ACCOUNT_METADATA_H_

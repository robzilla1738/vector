// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_MIGRATOR_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_MIGRATOR_H_
#include <vector>

#include "base/files/file_path.h"
#include "base/values.h"
#include "chrome/browser/extensions/api/aux_browser_import/source_crypto.h"
namespace aux_import {
// Worker-only bounded SQLite backup snapshots and JSON reads. Never writes to
// the source profile. Paths come exclusively from native installed discovery.
base::DictValue ReadCategory(const base::FilePath& profile,
                             bool firefox,
                             std::string category);
base::ListValue DiscoverSources();
// Supplied live/current-profile owner: finish the whole source snapshot before
// any destination effect; source-key admission is shared by encrypted stores.
base::DictValue ReadChromiumMigrationSnapshot(
    const base::FilePath& profile,
    std::string source,
    std::vector<std::string> categories);
// Results remain in native worker/UI memory; never returned to extension RPC.
base::DictValue ReadEncryptedCategory(const base::FilePath& profile,
                                      std::string category,
                                      const SourceKey& key);
base::DictValue ReadAuthorizedCategory(const base::FilePath& profile,
                                       bool firefox,
                                       std::string source,
                                       std::string category);
}  // namespace aux_import
#endif

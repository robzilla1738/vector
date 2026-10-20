// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef COMPONENTS_USER_DATA_IMPORTER_UTILITY_SAFARI_ARCHIVE_VALIDATOR_H_
#define COMPONENTS_USER_DATA_IMPORTER_UTILITY_SAFARI_ARCHIVE_VALIDATOR_H_
#include "base/files/file_path.h"
namespace user_data_importer {
// Supplied4250878: worker-only native archive open, then original ordered
// Bookmarks/SafariHistory/Passwords unzip probes. No source data is imported.
bool IsSafariExportArchive(const base::FilePath& path);
}  // namespace user_data_importer
#endif

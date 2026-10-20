// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "components/user_data_importer/utility/safari_archive_validator.h"
#include <string>
#include <vector>
#include "base/containers/span_rust.h"
#include "components/user_data_importer/utility/parsing_ffi/lib.rs.h"
namespace user_data_importer {
bool IsSafariExportArchive(const base::FilePath& path) {
  const std::string filename = path.AsUTF8Unsafe();
  if (filename.empty()) return false;
  const std::vector<uint8_t> filename_bytes(filename.begin(), filename.end());
  auto result = new_archive(base::SpanToRustSlice(filename_bytes));
  if (result->err()) return false;
  auto archive = result->unwrap();
  std::string output;
  // Original425099c..42509cc short-circuits on the first successful probe.
  // PaymentCards and StablePortabilityHistory alone do not admit the file.
  return archive->unzip(FileType::Bookmarks, output) ||
         archive->unzip(FileType::SafariHistory, output) ||
         archive->unzip(FileType::Passwords, output);
}
}  // namespace user_data_importer

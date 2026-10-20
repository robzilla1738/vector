// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_ENCRYPTED_SOURCE_BYTES_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_ENCRYPTED_SOURCE_BYTES_H_

#include <optional>
#include <string>
#include <string_view>
#include <utility>

#include "base/strings/string_util.h"
#include "base/values.h"

namespace aux_import {
// Private worker-to-UI staging only. These values are never RPC/status fields.
// Value strings require UTF8; native source strings may instead contain bytes.
inline void SetEncryptedSourceBytes(base::DictValue& row,
                                    std::string_view key,
                                    std::string value) {
  if (base::IsStringUTF8AllowingNoncharacters(value)) {
    row.Set(key, std::move(value));
  } else {
    base::Value::BlobStorage bytes(value.begin(), value.end());
    row.Set(key, base::Value(std::move(bytes)));
  }
}
inline std::optional<std::string_view> GetEncryptedSourceBytes(
    const base::DictValue& row, std::string_view key) {
  if (const auto* text = row.FindString(key)) {
    return *text;
  }
  if (const auto* bytes = row.FindBlob(key)) {
    return bytes->empty() ? std::string_view()
                         : std::string_view(reinterpret_cast<const char*>(bytes->data()),
                                            bytes->size());
  }
  return std::nullopt;
}
}  // namespace aux_import
#endif

// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SAFARI_IMPORT_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SAFARI_IMPORT_H_

#include <memory>
#include <string>

#include "base/functional/callback.h"

class Profile;
namespace aux_import {
// Owns the supplied Safari archive import through its actual native callbacks.
class SafariImport {
 public:
  using Update = base::RepeatingCallback<void(std::string state,
                                              std::string current_data_kind,
                                              double progress,
                                              std::string error)>;
  SafariImport(Profile* profile, bool bookmarks_only, Update update);
  ~SafariImport();
  SafariImport(const SafariImport&) = delete;
  SafariImport& operator=(const SafariImport&) = delete;
  void Start(std::string archive);
  void Cancel();

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};
}  // namespace aux_import
#endif

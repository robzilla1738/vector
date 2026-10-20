// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SAFARI_WEBUI_IMPORT_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SAFARI_WEBUI_IMPORT_H_
#include <memory>
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "chrome/browser/extensions/api/aux_browser_import/safari_import.h"
class Profile;
namespace aux_import {
// Original4250a14/4251694 owner; separate from extension byte-payload import.
class SafariWebUIImport {
 public:
  enum class TargetMode { kNewProfile = 0, kCurrentProfile = 1 };
  using OpenProfile = base::OnceCallback<void(const base::FilePath&)>;
  struct WebUILifecycle {
    base::OnceClosure retire_owner;
    OpenProfile open_profile;
    // Genuine initiating-window presence check belongs to the captured UI owner.
    // With no window the original emits invalid-file without showing an alert.
    base::OnceCallback<bool()> invalid_archive;
    base::RepeatingCallback<bool()> has_owner_window;
  };
  SafariWebUIImport(Profile*, SafariImport::Update);
  ~SafariWebUIImport();
  SafariWebUIImport(const SafariWebUIImport&) = delete;
  SafariWebUIImport& operator=(const SafariWebUIImport&) = delete;
  void Start(TargetMode, const base::FilePath& selected_archive, WebUILifecycle);
  void Cancel();
 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};
}  // namespace aux_import
#endif

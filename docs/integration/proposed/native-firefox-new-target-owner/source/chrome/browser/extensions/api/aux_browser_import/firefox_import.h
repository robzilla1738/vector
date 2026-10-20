// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_FIREFOX_IMPORT_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_FIREFOX_IMPORT_H_

#include <memory>
#include <optional>
#include <string>

#include "base/files/file_path.h"
#include "base/functional/callback.h"

class Profile;
namespace aux_import {
// Supplied public Firefox mode1 owner. Source discovery, host, utility and
// ProfileWriter remain Chromium's real implementation owners.
class FirefoxImport {
 public:
  using Update = base::RepeatingCallback<void(std::string state,
                                             std::string current_data_kind,
                                             double progress,
                                             std::string error)>;
  FirefoxImport(Profile* profile,
                std::optional<base::FilePath> selected_source_path,
                bool bookmarks_only,
                Update update);
  ~FirefoxImport();
  FirefoxImport(const FirefoxImport&) = delete;
  FirefoxImport& operator=(const FirefoxImport&) = delete;
  // Existing public extension path remains current-profile with no native UX.
  void Start();
  enum class TargetMode { kNewProfile = 0, kCurrentProfile = 1 };
  using OpenProfile = base::OnceCallback<void(const base::FilePath&)>;
  // The WebUI passes its actual chooser result and a genuine target loader.
  struct WebUILifecycle {
    base::RepeatingCallback<void(bool)> set_controls_enabled;
    base::OnceClosure retire_owner;
    OpenProfile open_profile;
  };
  void Start(TargetMode mode, WebUILifecycle lifecycle);
  void Cancel();

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};
}  // namespace aux_import
#endif

// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_FILE_OPERATION_LIFETIME_H_
#define CHROME_BROWSER_UI_AUX_FILE_OPERATION_LIFETIME_H_
#include <atomic>
#include <memory>
#include "base/callback_list.h"
#include "base/files/file_path.h"
namespace aux::files {
// UI-owned pending accounting outlives Profile user data. Workers receive only
// the immutable shared revocation flag, never a Profile or UI callback.
class FileOperationLifetime {
 public:
  explicit FileOperationLifetime(base::FilePath actual_profile_path);
  ~FileOperationLifetime();
  void Revoke();
  void Begin();
  void End();
  std::shared_ptr<const std::atomic_bool> authorization() const { return authorized_; }
 private:
  base::FilePath path_;
  std::shared_ptr<std::atomic_bool> authorized_;
  bool pending_ = false;
};
bool HasFileOperationsPending(const base::FilePath& actual_profile_path);
base::CallbackListSubscription ObserveFileOperationsSettled(
    const base::FilePath& actual_profile_path, base::RepeatingClosure);
}  // namespace aux::files
#endif

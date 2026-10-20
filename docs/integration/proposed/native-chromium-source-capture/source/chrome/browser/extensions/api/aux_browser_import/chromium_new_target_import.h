#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_NEW_TARGET_IMPORT_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_NEW_TARGET_IMPORT_H_
#include <memory>
#include <optional>
#include <string>
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_clone_worker.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_source_capture.h"
class Profile;
class ProfileManager;
class ScopedProfileKeepAlive;
namespace aux_import {
struct ChromiumNewTargetCompletion {
  bool success = false;
  base::FilePath target_profile;
  std::u16string profile_name;
  std::string error;
};

// UI-owned original mode0 coordinator. The real WebUI selection/window owner
// owns this object; destruction retires weak callbacks. It must outlive its
// accepted job and be destroyed before ProfileManager shutdown.
class ChromiumNewTargetImport {
 public:
  using Completion = base::OnceCallback<void(ChromiumNewTargetCompletion)>;
  explicit ChromiumNewTargetImport(ProfileManager& manager);
  ~ChromiumNewTargetImport();
  // Original Start ignores an additional request while already running.
  // Returns false in that case; no success/failure callback is fabricated.
  bool Start(ChromiumNewTargetSelection selection, Completion completed);
  bool running() const { return running_; }
 private:
  void Captured(ChromiumCapturedNewTargetSource captured);
  void Prepared(ChromiumCloneWorkerResult result);
  void Initialized(Profile* profile);
  void RestoreSecrets();
  void CookiesCompleted();
  void PasswordsCompleted();
  void MaybeComplete();
  void Fail(std::string error);
  void Finish(bool success, std::string error);
  raw_ptr<ProfileManager> manager_;
  Completion completed_;
  base::FilePath target_profile_;
  std::u16string profile_name_;
  std::optional<ChromiumCloneWorkerResult> receipt_;
  base::WeakPtr<Profile> profile_;
  std::unique_ptr<ScopedProfileKeepAlive> keep_alive_;
  bool running_ = false;
  bool cookies_done_ = false;
  bool passwords_done_ = false;
  base::WeakPtrFactory<ChromiumNewTargetImport> weak_{this};
};
}  // namespace aux_import
#endif

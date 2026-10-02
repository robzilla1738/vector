// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_LAUNCH_RECEIPT_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_LAUNCH_RECEIPT_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <sys/stat.h>
#include <memory>
#include "base/files/file_path.h"
#include "base/files/scoped_file.h"
#include <optional>
#include <string>
#include "base/time/time.h"
namespace aux {
class NativeStartupLaunchLease;
// Dedicated startup opt-in plus the existing private owned-fixture guard.
bool NativeStartupObservationEnabled();
struct NativeStartupLaunchReceipt {
  NativeStartupLaunchReceipt();
  ~NativeStartupLaunchReceipt();
  NativeStartupLaunchReceipt(NativeStartupLaunchReceipt&&);
  NativeStartupLaunchReceipt& operator=(NativeStartupLaunchReceipt&&);
  NativeStartupLaunchReceipt(const NativeStartupLaunchReceipt&) = delete;
  NativeStartupLaunchReceipt& operator=(const NativeStartupLaunchReceipt&) = delete;
  int launcher_pid = 0;
  int browser_pid = 0;
  std::string trial;
  std::string receipt_nonce;
  std::string helper_sha256;
  std::string helper_source_sha256;
  std::string helper_process_uuid;
  uint64_t helper_process_start = 0;
  uint64_t launch_mach_ticks = 0;
  uint64_t spawn_returned_mach_ticks = 0;
  base::TimeTicks launch;
  base::TimeTicks spawn_returned;
  std::string original_receipt_sha256;
  std::unique_ptr<NativeStartupLaunchLease> lease;
};
// Fixed owned-fixture metadata only; no caller path, PID or timestamp. Actual
// staged helper/source build attestation must additionally be paired by the
// original evidence consumer; these pins alone are not source-build proof.
// One successful admission per actual browser process, not per JS invocation.
std::optional<NativeStartupLaunchReceipt> ReadNativeStartupLaunchReceipt();
// Retains the ORIGINAL admitted descriptors and identities. The startup owner
// must additionally fence its current Profile/WeakDocument/window/frame scope
// before and after each async hop; this lease grants none of those authorities.
class NativeStartupLaunchLease {
 public:
  ~NativeStartupLaunchLease();
  NativeStartupLaunchLease(const NativeStartupLaunchLease&) = delete;
  NativeStartupLaunchLease& operator=(const NativeStartupLaunchLease&) = delete;
  bool Validate() const;
  // Continuity only: inputs come from the waiter's already-held original FDs.
  // This does not admit another root, filename, profile or measurement owner.
  bool MatchesInitialFiles(const struct stat& root, const struct stat& profile,
      const struct stat& metadata) const;
 private:
  friend class NativeStartupLaunchLeaseFileTest;
  struct State {
    State();
    ~State();
    base::ScopedFD parent, root, profile, metadata, receipt, executable;
    base::FilePath profile_path;
    std::string root_name, helper_path, metadata_bytes, receipt_bytes, helper_uuid;
    uint64_t helper_start = 0;
    pid_t browser_pid = 0, launcher_pid = 0;
    struct stat root_identity{}, profile_identity{}, metadata_identity{}, receipt_identity{}, executable_identity{};
  };
  bool ValidateOwnedFiles() const;
  explicit NativeStartupLaunchLease(std::unique_ptr<State> state);
  friend std::optional<NativeStartupLaunchReceipt> ReadNativeStartupLaunchReceipt();
  const std::unique_ptr<State> state_;
};
}  // namespace aux
#endif
#endif

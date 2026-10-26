// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_MESSAGING_AUX_NATIVE_HOST_LEASE_H_
#define CHROME_BROWSER_EXTENSIONS_API_MESSAGING_AUX_NATIVE_HOST_LEASE_H_
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include <sys/types.h>
#include "base/command_line.h"
#include "base/files/scoped_file.h"
#include "base/process/launch.h"
#include "base/process/mac/aux_browser_descendant_client.h"
#include "base/process/process.h"

namespace extensions {
class AuxNativeMessagingProfileOwner;
// One fixed-image, no-fork native host. Never a generic exec or task factory.
class AuxNativeHostLease final {
 public:
  static std::optional<std::string> CaptureProfileBinding(
      const base::FilePath& profile_path,const std::string& profile_id,int account_id);
  static std::shared_ptr<AuxNativeHostLease> Prepare(
      std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner, const std::string& extension_origin,
      const std::string& host_name, const base::FilePath& image,
      bool& durable_attempted);
  ~AuxNativeHostLease();
  base::Process Launch(const base::CommandLine& restricted_host,
                       const base::LaunchOptions& options);
  void ObservePipeClosed(uint32_t mask);
  void Reap(base::Process process);
  void Cancel();
  bool MatchesLeaseBytes(std::span<const uint8_t,16> lease) const;
  aux::browser_custody::Result Inspect() const;

 private:
  AuxNativeHostLease();
  bool ImageCurrent() const;
  bool Exchange(const std::string& phase, pid_t pid, int wait_status, int spawn_error);
  void SettleIfPhysical();
  const pid_t owner_;
  mutable std::mutex mutex_;
  std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner_;
  base::FilePath image_;
  base::ScopedFD image_fd_;
  uint64_t image_device_=0,image_inode_=0,image_size_=0;
  int64_t image_mtime_seconds_=0,image_mtime_nanos_=0;
  std::string image_sha256_,lease_id_,control_root_,task_root_;
  pid_t child_=-1;
  base::Time birth_;
  int raw_wait_status_=0,spawn_error_=0;
  uint32_t closed_pipes_=0;
  bool cancelled_=false,spawn_attempted_=false,reaped_=false;
  bool terminal_in_flight_=false,settled_=false,unknown_=false;
};
}
#endif

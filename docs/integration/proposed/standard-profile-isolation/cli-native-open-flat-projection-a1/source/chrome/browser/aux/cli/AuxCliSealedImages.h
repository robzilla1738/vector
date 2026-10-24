#pragma once
#include <Security/Security.h>
#include <bsm/audit.h>
#include <cstdint>
#include <memory>
#include <string>
#include <vector>
namespace aux::cli {
struct PeerBirth { int pid=-1; int version=-1; uint64_t seconds=0; uint64_t microseconds=0; };
// Constructed only from the real current signed bundle and fixed nested image.
// Copying image policy authenticates code, never a profile/installation owner.
class SealedImages final {
 public:
  static std::shared_ptr<const SealedImages> ForCurrentBrowser();
  static std::shared_ptr<const SealedImages> ForCurrentCli();
  static std::shared_ptr<const SealedImages> ForCurrentDaemon();
  ~SealedImages();
  bool RevalidateSelf() const;
  bool ValidateCliLaunchResources() const;
  bool CaptureCli(audit_token_t,PeerBirth*) const;
  bool SameCli(audit_token_t,const PeerBirth&) const;
  bool CaptureBrowser(audit_token_t,PeerBirth*) const;
  bool SameBrowser(audit_token_t,const PeerBirth&) const;
  const std::string& service() const;
  const std::string& cli_executable() const;
  SecRequirementRef cli_requirement() const;
  const std::vector<uint8_t>& cli_hash() const;
 private:
  struct Data;
  explicit SealedImages(std::unique_ptr<Data>);
  static std::shared_ptr<const SealedImages> Capture(int role);
  std::unique_ptr<Data> data_;
};
}

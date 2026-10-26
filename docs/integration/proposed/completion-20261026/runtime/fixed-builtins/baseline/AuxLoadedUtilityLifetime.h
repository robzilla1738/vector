#pragma once
#include <cstdint>
#include <memory>
#include <mutex>
#include <optional>
#include <set>
#include <string>
#include <unistd.h>

enum class AuxUtilityHostCapture { absent, current, refusedImage };
enum class AuxUtilityHostDrain { notPresent, drained, pending, untracked, wrongProcess };
// Native-only image custody, not signature authorization or profile admission.
// Production capture is called only after the actual signed owner factory.
class AuxLoadedUtilityLifetime final : public std::enable_shared_from_this<AuxLoadedUtilityLifetime> {
 public:
  static std::shared_ptr<AuxLoadedUtilityLifetime> CaptureAfterAuthenticatedOwner();
  ~AuxLoadedUtilityLifetime();
  AuxUtilityHostDrain CloseAndDrain();
  static size_t RetainedUnresolvedImages();
  // Native observer for closed image custody surviving a destroyed host.
  static AuxUtilityHostDrain InspectRetainedClosures();
  AuxUtilityHostCapture capture_status() const { return kind_; }
  // Environment cleanup never initiates process-wide utility closure. Once explicit
  // host close has initiated it, cleanup must preserve pending image custody.
  std::optional<AuxUtilityHostDrain> InspectIfClosureStarted();
 private:
  AuxLoadedUtilityLifetime();
  void Capture();
  const pid_t process_;
  std::mutex mutex_;
  bool closure_started_ = false;
  AuxUtilityHostCapture kind_ = AuxUtilityHostCapture::refusedImage;
  std::set<std::string> images_;
  void* image_ = nullptr;
  int32_t (*close_)() = nullptr;
  uint64_t (*pending_)() = nullptr;
};

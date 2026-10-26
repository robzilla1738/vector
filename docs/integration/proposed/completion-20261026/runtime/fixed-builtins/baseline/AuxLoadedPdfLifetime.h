#pragma once
#include <cstdint>
#include <memory>
#include <mutex>
#include <optional>
#include <set>
#include <string>
#include <unistd.h>

enum class AuxPdfHostCapture { absent, current, legacy, refusedImage };
enum class AuxPdfHostDrain { notPresent, drained, pending, untracked, wrongProcess };
// Native-only image custody, not signature authorization or profile admission.
// Production capture is called only after the actual signed owner factory.
class AuxLoadedPdfLifetime final : public std::enable_shared_from_this<AuxLoadedPdfLifetime> {
 public:
  static std::shared_ptr<AuxLoadedPdfLifetime> CaptureAfterAuthenticatedOwner();
  ~AuxLoadedPdfLifetime();
  AuxPdfHostDrain CloseAndDrain();
  static size_t RetainedUnresolvedImages();
  AuxPdfHostCapture capture_status() const { return kind_; }
  // Environment cleanup never initiates process-wide PDF closure. Once explicit
  // host close has initiated it, cleanup must preserve pending image custody.
  std::optional<AuxPdfHostDrain> InspectIfClosureStarted();
 private:
  AuxLoadedPdfLifetime();
  void Capture();
  const pid_t process_;
  std::mutex mutex_;
  bool closure_started_ = false;
  AuxPdfHostCapture kind_ = AuxPdfHostCapture::refusedImage;
  std::set<std::string> images_;
  void* image_ = nullptr;
  int32_t (*close_)() = nullptr;
  uint64_t (*pending_)() = nullptr;
};

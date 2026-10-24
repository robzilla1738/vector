// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_FEATURE_STORE_FEATURE_WRITE_PARTICIPANT_H_
#define CHROME_BROWSER_AUX_FEATURE_STORE_FEATURE_WRITE_PARTICIPANT_H_
#include <atomic>
#include <cstdint>
#include <memory>
#include "base/files/file_path.h"
#include "base/functional/callback.h"
namespace aux::features {
enum class NativeFeatureIoKind { kOrganization, kFeatureState, kDownloadTransaction, kChosenFiles };
enum class NativeFeatureIoOutcome { kCompleted, kRefused, kUncertain };
// These are observations of registered feature I/O only, never authority,
// credential custody, durability, or a whole-browser drain certificate.
struct NativeFeatureWriteObservation {
  bool wrong_process = false;
  bool admission_closed = false;
  uint64_t pending = 0;
  uint64_t settled = 0;
  uint64_t refused = 0;
  uint64_t uncertain = 0;
  uint64_t abandoned = 0;
};
class NativeFeatureIoTicket final {
 public:
  ~NativeFeatureIoTicket();
  NativeFeatureIoTicket(const NativeFeatureIoTicket&) = delete;
  NativeFeatureIoTicket& operator=(const NativeFeatureIoTicket&) = delete;
  bool IsCancelled() const;
  // Call only from the actual operation completion or a definite pre-submit
  // refusal. Dropped receivers/callbacks/destruction are not settlement.
  void Settle(NativeFeatureIoOutcome outcome);
 private:
  explicit NativeFeatureIoTicket(uint64_t id);
  const uint64_t id_;
  std::atomic_bool settled_{false};
  friend std::shared_ptr<NativeFeatureIoTicket> BeginNativeFeatureIo(
      const base::FilePath&, NativeFeatureIoKind, std::shared_ptr<std::atomic_bool>);
};
// The path is the actual native Profile::GetPath(), not renderer input. This
// registry never opens that path or substitutes for an existing write owner.
std::shared_ptr<NativeFeatureIoTicket> BeginNativeFeatureIo(
    const base::FilePath& native_profile_path, NativeFeatureIoKind kind,
    std::shared_ptr<std::atomic_bool> write_authorization = {});
bool IsNativeFeatureIoAdmissionClosed();
void CloseNativeFeatureIoAdmission();
bool IsNativeFeatureIoPendingForProfilePath(const base::FilePath& native_profile_path);
NativeFeatureWriteObservation InspectNativeFeatureWrites();
// Thread safe, irreversible in this process. Cancellation requests do not
// erase outstanding tickets. Replies are posted to the invoking sequence only
// once genuine completions leave zero pending; uncertainty remains explicit.
void CloseNativeFeatureWritesForMigration(
    base::OnceCallback<void(NativeFeatureWriteObservation)> done);
}  // namespace aux::features
#endif

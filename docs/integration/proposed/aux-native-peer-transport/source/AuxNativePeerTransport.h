#pragma once
#include <Security/Security.h>
#include <mach/mach.h>
#include <sys/types.h>
#include <cstdint>
#include <memory>
#include <span>

namespace aux::peer {
// Immutable code policy supplied by trusted native host policy. Copying this
// policy does not authenticate that host or establish profile writer custody.
class ExactCodePolicy final {
 public:
  static std::shared_ptr<const ExactCodePolicy> CopyNativePolicy(
      SecRequirementRef requirement, std::span<const uint8_t> cd_hash);
  ~ExactCodePolicy();
 private:
  ExactCodePolicy(SecRequirementRef requirement, std::span<const uint8_t> hash);
  struct Data;
  std::unique_ptr<Data> data_;
  friend class ParentTransport;
  friend struct NativeOperations;
};
class NativeSendRight final {
 public:
  // Adopts one real received send-right ref, not a descriptor supplied by JS.
  static NativeSendRight AdoptReceivedRight(mach_port_t right);
  NativeSendRight(NativeSendRight&& other) noexcept;
  NativeSendRight& operator=(NativeSendRight&& other) noexcept;
  ~NativeSendRight();
  NativeSendRight(const NativeSendRight&) = delete;
  NativeSendRight& operator=(const NativeSendRight&) = delete;
 private:
  explicit NativeSendRight(mach_port_t right);
  mach_port_t right_ = MACH_PORT_NULL;
  friend class ParentTransport;
  friend struct NativeOperations;
};
struct TransportSnapshot {
  uint64_t generation = 1;
  bool closed = false;
  bool wrong_process = false;
  uint64_t active_exchanges = 0;
  uint64_t active_receives = 0;
  uint64_t active_code_validations = 0;
  uint64_t authenticated_exchanges = 0;
  uint64_t rejected_peer_identities = 0;
  bool child_pid_version_observed = false;
};
enum class ExchangeStatus { authenticated, timedOut, refused, closed, wrongProcess };
struct ParentExchange {
  ExchangeStatus status = ExchangeStatus::refused;
  uint64_t transport_generation = 0;
  int peer_pid = -1;
  int peer_pid_version = -1;
};
class ParentTransport final {
 public:
  // Native launch owner calls only after its actual spawn. Kernel checks require
  // this process's live direct, waitable child; SIGCHLD auto-reaping is refused.
  static std::unique_ptr<ParentTransport> BindActualDirectChild(
      pid_t child, std::shared_ptr<const ExactCodePolicy> child_policy);
  ~ParentTransport();
  NativeSendRight CopySendRightForNativeHandoff();
  // One bounded native exchange. Real IPC/live Security operations occur here.
  ExchangeStatus ServiceOne(uint32_t timeout_ms);
  TransportSnapshot CloseAndInspect();
  TransportSnapshot Inspect() const;
 private:
  struct State;
  explicit ParentTransport(std::shared_ptr<State> state);
  std::shared_ptr<State> state_;
};
// Child native bootstrap consumes a private endpoint transferred by actual
// launch IPC. The peer is checked against its actual living parent, not a PID
// argument/ENV value. Success authenticates this exchange only, NEVER a cohort.
ParentExchange AuthenticateActualNativeParent(
    const NativeSendRight& endpoint,
    std::shared_ptr<const ExactCodePolicy> parent_policy,
    uint32_t timeout_ms);
}  // namespace aux::peer

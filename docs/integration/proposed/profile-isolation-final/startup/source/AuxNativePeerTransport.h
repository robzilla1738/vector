#pragma once
#include <Security/Security.h>
#include <mach/mach.h>
#include <sys/types.h>
#include <cstdint>
#include <memory>
#include <span>
#include <vector>
#include <chrono>
#include <optional>

namespace aux::peer {
// Immutable code policy supplied by trusted native host policy. Copying this
// policy does not authenticate that host or establish profile writer custody.
class BrowserPrivateRoots;
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
  bool is_valid() const;
  NativeSendRight CopyOwnedRight() const;
  mach_port_t ReleaseForNativeHandoff();
  mach_port_t BorrowNativeName() const;
  NativeSendRight(NativeSendRight&& other) noexcept;
  NativeSendRight& operator=(NativeSendRight&& other) noexcept;
  ~NativeSendRight();
  NativeSendRight(const NativeSendRight&) = delete;
  NativeSendRight& operator=(const NativeSendRight&) = delete;
 private:
  explicit NativeSendRight(mach_port_t right);
  mach_port_t right_ = MACH_PORT_NULL;
  pid_t process_ = -1;
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
  uint64_t active_selected_home_validations = 0;
  uint64_t authenticated_exchanges = 0;
  uint64_t authenticated_ready_home_exports = 0;
  uint64_t rejected_peer_identities = 0;
  uint64_t unresolved_reply_cleanup = 0;
  bool child_pid_version_observed = false;
  bool child_bound = false;
  bool selected_home_pending = false;
  uint64_t selected_home_cleanup_unresolved = 0;
  uint64_t unresolved_receive_cleanup = 0;
  int32_t last_receive_error = 0;
};
enum class ExchangeStatus { authenticated, timedOut, refused, closed, wrongProcess };
struct ParentExchange {
  ExchangeStatus status = ExchangeStatus::refused;
  uint64_t transport_generation = 0;
  int peer_pid = -1;
  int peer_pid_version = -1;
  bool right_cleanup_unresolved = false;
  int32_t receive_error = 0;
};
enum class DaemonAuthorityStatus { ready, pending, busy, refused, closed, timedOut,
                                   wrongProcess, cleanupUnresolved };
class DaemonAuthorityPublication;
struct DaemonAuthorityReply {
  DaemonAuthorityReply();
  DaemonAuthorityReply(DaemonAuthorityStatus result, std::vector<uint8_t> bytes);
  ~DaemonAuthorityReply();
  DaemonAuthorityReply(DaemonAuthorityReply&&) noexcept;
  DaemonAuthorityReply& operator=(DaemonAuthorityReply&&) noexcept;
  DaemonAuthorityReply(const DaemonAuthorityReply&) = delete;
  DaemonAuthorityReply& operator=(const DaemonAuthorityReply&) = delete;
  DaemonAuthorityStatus status = DaemonAuthorityStatus::refused;
  std::vector<uint8_t> payload;
 private:
  std::shared_ptr<DaemonAuthorityPublication> publication_;
  friend class AuthenticatedSelectedHomeTransfer;
};
class PreparedParentEndpoint;
class OwnedNativePeerChild;
class SelectedNativeHome;
// Observational only: constructed from completed genuine ready-home exchanges.
struct ReadyHomePulse {
  uint64_t generation;
  uint64_t exports;
  std::chrono::steady_clock::time_point observed;
};
// Internal transport product: only actual authenticated Mach FD receipt creates
// it; only the real owned child can promote it to a retained selected home.
class AuthenticatedSelectedHomeTransfer final {
 public:
  ~AuthenticatedSelectedHomeTransfer();
  DaemonAuthorityReply SignDaemonChallenge(std::span<const uint8_t> exact_message,
                                           uint32_t timeout_ms);
  DaemonAuthorityReply GetInstallationPublicKeys(uint32_t timeout_ms);
  DaemonAuthorityReply GetBrowserStartupLease(uint32_t timeout_ms);
  DaemonAuthorityReply GetAgentInboxV2MasterKey(uint32_t timeout_ms);
  // Caller invokes only after its actual owner/pulse publication fence.
  DaemonAuthorityStatus AcceptAuthorityReply(const DaemonAuthorityReply& reply,
                                            uint32_t timeout_ms);
  AuthenticatedSelectedHomeTransfer(const AuthenticatedSelectedHomeTransfer&) = delete;
  AuthenticatedSelectedHomeTransfer& operator=(const AuthenticatedSelectedHomeTransfer&) = delete;
 private:
  struct State;
  explicit AuthenticatedSelectedHomeTransfer(std::shared_ptr<State> state);
  int DuplicateRevalidatedDirectory();
  DaemonAuthorityReply RequestAuthority(uint32_t operation, std::span<const uint8_t> message, uint32_t timeout_ms);
  std::optional<ReadyHomePulse> InspectReadyPulse();
  std::shared_ptr<State> state_;
  friend class ParentTransport;
  friend class DaemonAuthorityPublication;
  friend class SelectedNativeHome;
  friend class OwnedNativePeerChild;
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
  friend class PreparedParentEndpoint;
  friend class OwnedNativePeerChild;
  friend class AuthenticatedSelectedHomeTransfer;
  std::shared_ptr<AuthenticatedSelectedHomeTransfer> TakeSelectedHomeTransfer();
  struct State;
  explicit ParentTransport(std::shared_ptr<State> state);
  std::shared_ptr<State> state_;
};
// Native launch prepares its actual receive right before spawn; binding can be
// completed only once using the actual live direct child after spawn returns.
class PreparedParentEndpoint final {
 public:
  ~PreparedParentEndpoint();
  static std::unique_ptr<PreparedParentEndpoint> PrepareBeforeSpawn(
      std::shared_ptr<const ExactCodePolicy> child_policy,
      std::shared_ptr<const BrowserPrivateRoots> browser_roots = {});
  NativeSendRight CopySendRightForNativeHandoff();
  std::unique_ptr<ParentTransport> BindActualDirectChild(pid_t child);
  TransportSnapshot CloseAndInspect();
  TransportSnapshot Inspect() const;
 private:
  explicit PreparedParentEndpoint(std::shared_ptr<ParentTransport::State> state);
  std::shared_ptr<ParentTransport::State> state_;
};
struct NativeParentConnectionSnapshot {
  bool closed = false;
  bool wrong_process = false;
  uint64_t active_checks = 0;
  int parent_pid = -1;
  int parent_pid_version = -1;
  uint64_t selected_home_cleanup_unresolved = 0;
  uint64_t unresolved_receive_cleanup = 0;
  uint64_t unresolved_send_cleanup = 0;
  int32_t last_receive_error = 0;
};
// Only a real live handshake can construct this retained native connection.
// The type authenticates a peer, NEVER profile/cohort/installer custody.
class AuthenticatedNativeParentConnection final {
 public:
  static std::unique_ptr<AuthenticatedNativeParentConnection> Connect(
      NativeSendRight endpoint,
      std::shared_ptr<const ExactCodePolicy> parent_policy, uint32_t timeout_ms);
  ~AuthenticatedNativeParentConnection();
  AuthenticatedNativeParentConnection(const AuthenticatedNativeParentConnection&) = delete;
  AuthenticatedNativeParentConnection& operator=(const AuthenticatedNativeParentConnection&) = delete;
  ExchangeStatus Revalidate(uint32_t timeout_ms);
  int32_t CopyBrowserPrivateRoot(uint32_t role, uint64_t* generation, int32_t* descriptor, uint32_t timeout_ms);
#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)
  // Descriptor source is ONLY actual ready-service C producer, never a caller FD.
  ParentExchange SendSelectedHome(uint64_t ready_service, uint32_t timeout_ms);
#endif
  int32_t StartPreparedDaemonAuthorityServer(uint64_t provider, uint32_t timeout_ms);
  int32_t ServicePreparedDaemonAuthorityServer(uint32_t timeout_ms);
  int32_t ClosePreparedDaemonAuthorityServer();
  NativeParentConnectionSnapshot CloseAndInspect();
  NativeParentConnectionSnapshot Inspect() const;
 private:
  struct State;
  explicit AuthenticatedNativeParentConnection(std::shared_ptr<State> state);
  friend struct AuthorityServer;
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

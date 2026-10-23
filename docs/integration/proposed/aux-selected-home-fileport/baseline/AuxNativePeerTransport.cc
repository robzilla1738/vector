#include "AuxNativePeerTransport.h"
#include "AuxNativePeerWire.h"
#include <bsm/libbsm.h>
#include <libproc.h>
#include <sys/proc_info.h>
#include <sys/wait.h>
#include <unistd.h>
#include <array>
#include <cstring>
#include <mutex>
#include <optional>
#include <functional>
#include <type_traits>
#include <utility>
#include <vector>

namespace aux::peer {
namespace {
using namespace detail;
struct BirthIdentity {
  pid_t pid;
  uint64_t seconds;
  uint64_t microseconds;
};
std::optional<BirthIdentity> ReadBirth(pid_t pid, pid_t expected_parent) {
  proc_bsdinfo info{};
  if (pid <= 1 || proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, &info, sizeof(info)) != static_cast<int>(sizeof(info)) ||
      info.pbi_start_tvsec == 0 ||
      info.pbi_pid != static_cast<uint32_t>(pid) ||
      (expected_parent > 0 && info.pbi_ppid != static_cast<uint32_t>(expected_parent)))
    return std::nullopt;
  return BirthIdentity{pid, info.pbi_start_tvsec, info.pbi_start_tvusec};
}
bool SameBirth(const BirthIdentity& identity, pid_t expected_parent) {
  auto now = ReadBirth(identity.pid, expected_parent);
  return now && now->seconds == identity.seconds &&
      now->microseconds == identity.microseconds;
}
bool WaitableLiveChild(pid_t child) {
  siginfo_t observed{};
  // Observation only: never reap, signal, stop or replace a process.
  return waitid(P_PID, static_cast<id_t>(child), &observed,
                WEXITED | WNOHANG | WNOWAIT) == 0 && observed.si_pid == 0;
}
class DestroyMessage {
 public:
  explicit DestroyMessage(mach_msg_header_t* value);
  ~DestroyMessage();
  void Disarm();
 private:
  std::optional<std::reference_wrapper<mach_msg_header_t>> value_;
  const pid_t process_ = getpid();
};
DestroyMessage::DestroyMessage(mach_msg_header_t* value) : value_(std::ref(*value)) {}
DestroyMessage::~DestroyMessage() {
  if (getpid() == process_ && value_) mach_msg_destroy(&value_->get());
}
void DestroyMessage::Disarm() { value_.reset(); }
class ReceiveRight {
 public:
  ReceiveRight();
  ~ReceiveRight();
  mach_port_t get() const;
 private:
  mach_port_t port_ = MACH_PORT_NULL;
  const pid_t process_ = getpid();
};
ReceiveRight::ReceiveRight() {
  if (mach_port_allocate(mach_task_self(), MACH_PORT_RIGHT_RECEIVE, &port_) != KERN_SUCCESS)
    port_ = MACH_PORT_NULL;
}
ReceiveRight::~ReceiveRight() {
  if (getpid() == process_ && port_ != MACH_PORT_NULL)
    mach_port_mod_refs(mach_task_self(), port_, MACH_PORT_RIGHT_RECEIVE, -1);
}
mach_port_t ReceiveRight::get() const { return getpid() == process_ ? port_ : MACH_PORT_NULL; }
constexpr mach_msg_option_t kReceiveOptions =
    MACH_RCV_MSG | MACH_RCV_TIMEOUT |
    MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0) |
    MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT);
}  // namespace

namespace {
struct ReleaseRequirement {
  const pid_t process = getpid();
  void operator()(SecRequirementRef requirement) const {
    if (getpid() == process && requirement) CFRelease(requirement);
  }
};
SecRequirementRef RetainRequirement(SecRequirementRef value) {
  CFRetain(value);
  return value;
}
using OwnedRequirement = std::unique_ptr<std::remove_pointer_t<SecRequirementRef>, ReleaseRequirement>;
}
struct ExactCodePolicy::Data {
  Data(SecRequirementRef value, std::span<const uint8_t> hash);
  ~Data();
  OwnedRequirement requirement;
  std::vector<uint8_t> cd_hash;
  const pid_t process = getpid();
};
ExactCodePolicy::Data::Data(SecRequirementRef value, std::span<const uint8_t> hash)
    : requirement(RetainRequirement(value)), cd_hash(hash.begin(), hash.end()) {}
ExactCodePolicy::Data::~Data() = default;
ExactCodePolicy::ExactCodePolicy(SecRequirementRef requirement, std::span<const uint8_t> hash)
    : data_(std::make_unique<Data>(requirement, hash)) {}
ExactCodePolicy::~ExactCodePolicy() = default;
std::shared_ptr<const ExactCodePolicy> ExactCodePolicy::CopyNativePolicy(
    SecRequirementRef requirement, std::span<const uint8_t> hash) {
  if (!requirement || CFGetTypeID(requirement) != SecRequirementGetTypeID() ||
      (hash.size() != 20 && hash.size() != 32)) return {};
  return std::shared_ptr<const ExactCodePolicy>(new ExactCodePolicy(requirement, hash));
}
struct NativeOperations {
  static mach_port_t Port(const NativeSendRight& right) {
    return getpid() == right.process_ ? right.right_ : MACH_PORT_NULL;
  }
  static bool Validate(audit_token_t token, const ExactCodePolicy& policy) {
    if (getpid() != policy.data_->process) return false;
    CFDataRef audit = CFDataCreate(kCFAllocatorDefault,
        reinterpret_cast<const UInt8*>(&token), sizeof(token));
    if (!audit) return false;
    const void* key = kSecGuestAttributeAudit;
    const void* value = audit;
    CFDictionaryRef attributes = CFDictionaryCreate(kCFAllocatorDefault, &key, &value, 1,
        &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFRelease(audit);
    if (!attributes) return false;
    SecCodeRef code = nullptr;
    OSStatus status = SecCodeCopyGuestWithAttributes(nullptr, attributes, kSecCSDefaultFlags, &code);
    CFRelease(attributes);
    if (status != errSecSuccess || !code) return false;
    status = SecCodeCheckValidity(code, kSecCSDefaultFlags, policy.data_->requirement.get());
    CFDictionaryRef information = nullptr;
    if (status == errSecSuccess)
      status = SecCodeCopySigningInformation(code, kSecCSSigningInformation, &information);
    CFRelease(code);
    bool valid = false;
    if (status == errSecSuccess && information) {
      CFTypeRef unique = CFDictionaryGetValue(information, kSecCodeInfoUnique);
      if (unique && CFGetTypeID(unique) == CFDataGetTypeID()) {
        auto bytes = static_cast<CFDataRef>(unique);
        valid = CFDataGetLength(bytes) == static_cast<CFIndex>(policy.data_->cd_hash.size()) &&
            std::memcmp(CFDataGetBytePtr(bytes), policy.data_->cd_hash.data(),
                        policy.data_->cd_hash.size()) == 0;
      }
    }
    if (information) CFRelease(information);
    return valid;
  }
};
NativeSendRight::NativeSendRight(mach_port_t value) : right_(value), process_(getpid()) {}
NativeSendRight NativeSendRight::AdoptReceivedRight(mach_port_t value) {
  mach_port_type_t type = 0;
  if (value == MACH_PORT_NULL || mach_port_type(mach_task_self(), value, &type) != KERN_SUCCESS ||
      !(type & MACH_PORT_TYPE_SEND)) return NativeSendRight(MACH_PORT_NULL);
  return NativeSendRight(value);
}
bool NativeSendRight::is_valid() const { return getpid() == process_ && right_ != MACH_PORT_NULL; }
NativeSendRight NativeSendRight::CopyOwnedRight() const {
  if (getpid() != process_ || right_ == MACH_PORT_NULL ||
      mach_port_mod_refs(mach_task_self(), right_, MACH_PORT_RIGHT_SEND, 1) != KERN_SUCCESS)
    return NativeSendRight(MACH_PORT_NULL);
  return NativeSendRight(right_);
}
mach_port_t NativeSendRight::BorrowNativeName() const {
  return getpid() == process_ ? right_ : MACH_PORT_NULL;
}
mach_port_t NativeSendRight::ReleaseForNativeHandoff() {
  if (getpid() != process_) return MACH_PORT_NULL;
  return std::exchange(right_, MACH_PORT_NULL);
}
NativeSendRight::NativeSendRight(NativeSendRight&& other) noexcept
    : right_(std::exchange(other.right_, MACH_PORT_NULL)),
      process_(std::exchange(other.process_, -1)) {}
NativeSendRight& NativeSendRight::operator=(NativeSendRight&& other) noexcept {
  if (this != &other) {
    if (getpid() == process_ && right_ != MACH_PORT_NULL)
      mach_port_deallocate(mach_task_self(), right_);
    right_ = std::exchange(other.right_, MACH_PORT_NULL);
    process_ = std::exchange(other.process_, -1);
  }
  return *this;
}
NativeSendRight::~NativeSendRight() {
  if (getpid() == process_ && right_ != MACH_PORT_NULL)
    mach_port_deallocate(mach_task_self(), right_);
}
struct ParentTransport::State {
  explicit State(std::shared_ptr<const ExactCodePolicy> value);
  ~State();
  const pid_t process = getpid();
  std::optional<BirthIdentity> child;
  const std::shared_ptr<const ExactCodePolicy> policy;
  ReceiveRight receiver;
  std::mutex mutex;
  TransportSnapshot snapshot;
  std::optional<int> child_pid_version;
};
ParentTransport::State::State(std::shared_ptr<const ExactCodePolicy> value)
    : policy(std::move(value)) {}
ParentTransport::State::~State() = default;
ParentTransport::ParentTransport(std::shared_ptr<State> state) : state_(std::move(state)) {}
ParentTransport::~ParentTransport() { CloseAndInspect(); }
std::unique_ptr<ParentTransport> ParentTransport::BindActualDirectChild(
    pid_t child, std::shared_ptr<const ExactCodePolicy> policy) {
  auto prepared = PreparedParentEndpoint::PrepareBeforeSpawn(std::move(policy));
  return prepared ? prepared->BindActualDirectChild(child) : nullptr;
}
PreparedParentEndpoint::PreparedParentEndpoint(std::shared_ptr<ParentTransport::State> state)
    : state_(std::move(state)) {}
PreparedParentEndpoint::~PreparedParentEndpoint() = default;
std::unique_ptr<PreparedParentEndpoint> PreparedParentEndpoint::PrepareBeforeSpawn(
    std::shared_ptr<const ExactCodePolicy> policy) {
  if (!policy) return {};
  auto state = std::make_shared<ParentTransport::State>(std::move(policy));
  if (state->receiver.get() == MACH_PORT_NULL) return {};
  return std::unique_ptr<PreparedParentEndpoint>(new PreparedParentEndpoint(std::move(state)));
}
NativeSendRight PreparedParentEndpoint::CopySendRightForNativeHandoff() {
  if (getpid() != state_->process) return NativeSendRight::AdoptReceivedRight(MACH_PORT_NULL);
  std::lock_guard<std::mutex> lock(state_->mutex);
  if (state_->snapshot.closed || state_->child ||
      mach_port_insert_right(mach_task_self(), state_->receiver.get(),
          state_->receiver.get(), MACH_MSG_TYPE_MAKE_SEND) != KERN_SUCCESS)
    return NativeSendRight::AdoptReceivedRight(MACH_PORT_NULL);
  return NativeSendRight::AdoptReceivedRight(state_->receiver.get());
}
std::unique_ptr<ParentTransport> PreparedParentEndpoint::BindActualDirectChild(pid_t child) {
  if (getpid() != state_->process || !WaitableLiveChild(child)) return {};
  auto birth = ReadBirth(child, state_->process);
  if (!birth || !WaitableLiveChild(child)) return {};
  std::lock_guard<std::mutex> lock(state_->mutex);
  if (state_->snapshot.closed || state_->child) return {};
  state_->child = *birth;
  state_->snapshot.child_bound = true;
  return std::unique_ptr<ParentTransport>(new ParentTransport(state_));
}
TransportSnapshot PreparedParentEndpoint::CloseAndInspect() {
  if (getpid() != state_->process)
    return TransportSnapshot{.generation = 0, .closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state_->mutex);
  if (!state_->snapshot.closed) {
    state_->snapshot.closed = true;
    ++state_->snapshot.generation;
  }
  return state_->snapshot;
}
TransportSnapshot PreparedParentEndpoint::Inspect() const {
  if (getpid() != state_->process)
    return TransportSnapshot{.generation = 0, .closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state_->mutex);
  return state_->snapshot;
}
NativeSendRight ParentTransport::CopySendRightForNativeHandoff() {
  auto state = state_;
  if (getpid() != state->process) return NativeSendRight(MACH_PORT_NULL);
  std::lock_guard<std::mutex> lock(state->mutex);
  if (state->snapshot.closed || mach_port_insert_right(mach_task_self(), state->receiver.get(),
      state->receiver.get(), MACH_MSG_TYPE_MAKE_SEND) != KERN_SUCCESS)
    return NativeSendRight(MACH_PORT_NULL);
  return NativeSendRight(state->receiver.get());
}
TransportSnapshot ParentTransport::CloseAndInspect() {
  auto state = state_;
  if (getpid() != state->process) return TransportSnapshot{.generation = 0, .closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state->mutex);
  if (!state->snapshot.closed) {
    state->snapshot.closed = true;
    ++state->snapshot.generation;
  }
  // Receive right remains retained by every live call; close is not a claim
  // that its Security validation/IPC thread has returned.
  return state->snapshot;
}
TransportSnapshot ParentTransport::Inspect() const {
  auto state = state_;
  if (getpid() != state->process) return TransportSnapshot{.generation = 0, .closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state->mutex);
  return state->snapshot;
}
ExchangeStatus ParentTransport::ServiceOne(uint32_t timeout_ms) {
  auto state = state_;
  if (getpid() != state->process) return ExchangeStatus::wrongProcess;
  if (!timeout_ms || timeout_ms > kMaximumTimeoutMs) return ExchangeStatus::refused;
  uint64_t generation;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->snapshot.closed) return ExchangeStatus::closed;
    if (!state->child) return ExchangeStatus::refused;
    generation = state->snapshot.generation;
    ++state->snapshot.active_exchanges;
    ++state->snapshot.active_receives;
  }
  auto finish_exchange = +[](State* retained) {
    if (getpid() != retained->process) return;
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_exchanges;
  };
  // Non-deleting scope guard; the actual shared state above owns its lifetime.
  std::unique_ptr<State, decltype(finish_exchange)> active(state.get(), finish_exchange);
  Received request{};
  auto result = mach_msg(&request.wire.header, kReceiveOptions, 0, sizeof(request),
      state->receiver.get(), timeout_ms, MACH_PORT_NULL);
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    --state->snapshot.active_receives;
    if (state->snapshot.closed) {
      if (result == KERN_SUCCESS) mach_msg_destroy(&request.wire.header);
      return ExchangeStatus::closed;
    }
  }
  if (result == MACH_RCV_TIMED_OUT) return ExchangeStatus::timedOut;
  if (result != KERN_SUCCESS) return ExchangeStatus::refused;
  DestroyMessage destroy(&request.wire.header);
  if (!ValidWire(request, kRequest) || request.wire.generation != 0 ||
      MACH_MSGH_BITS_REMOTE(request.wire.header.msgh_bits) != MACH_MSG_TYPE_PORT_SEND_ONCE)
    return ExchangeStatus::refused;
  const audit_token_t audit = request.trailer.msgh_audit;
  const int version = audit_token_to_pidversion(audit);
  bool valid = audit_token_to_pid(audit) == state->child->pid && version >= 0 &&
      SameBirth(*state->child, state->process) && WaitableLiveChild(state->child->pid);
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    ++state->snapshot.active_code_validations;
    valid = valid && (!state->child_pid_version || *state->child_pid_version == version);
  }
  if (valid) valid = NativeOperations::Validate(audit, *state->policy);
  valid = valid && SameBirth(*state->child, state->process) && WaitableLiveChild(state->child->pid);
  std::lock_guard<std::mutex> lock(state->mutex);
  --state->snapshot.active_code_validations;
  if (state->snapshot.closed || state->snapshot.generation != generation)
    return ExchangeStatus::closed;
  if (!valid || (state->child_pid_version && *state->child_pid_version != version)) {
    ++state->snapshot.rejected_peer_identities;
    return ExchangeStatus::refused;
  }
  Wire reply{};
  reply.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_MOVE_SEND_ONCE, 0);
  reply.header.msgh_size = sizeof(reply);
  reply.header.msgh_remote_port = request.wire.header.msgh_remote_port;
  reply.header.msgh_id = kReply;
  reply.generation = generation;
  reply.nonce = request.wire.nonce;
  // Transfer the received send-once right to the actual sent buffer. Kernel
  // pseudo-receive may rewrite that buffer on failure; never clean a stale copy.
  request.wire.header.msgh_remote_port = MACH_PORT_NULL;
  DestroyMessage reply_cleanup(&reply.header);
  result = mach_msg(&reply.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(reply), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) {
    if (!RecoverableSendError(result)) {
      // Kernel may have partially consumed rights. Do not guess or deallocate
      // a potentially reused name. Record unknown cleanup and close admission.
      reply_cleanup.Disarm();
      ++state->snapshot.unresolved_reply_cleanup;
      state->snapshot.closed = true;
      ++state->snapshot.generation;
    }
    return ExchangeStatus::refused;
  }
  reply_cleanup.Disarm();  // Successful send consumed its exact send-once right.
  state->child_pid_version = version;
  state->snapshot.child_pid_version_observed = true;
  ++state->snapshot.authenticated_exchanges;
  return ExchangeStatus::authenticated;
}
ParentExchange AuthenticateActualNativeParent(const NativeSendRight& endpoint,
    std::shared_ptr<const ExactCodePolicy> policy, uint32_t timeout_ms) {
  ParentExchange observation;
  if (!endpoint.is_valid() || !policy || !timeout_ms || timeout_ms > kMaximumTimeoutMs) return observation;
  const pid_t parent = getppid();
  auto birth = ReadBirth(parent, 0);
  if (!birth) return observation;
  ReceiveRight reply_port;
  if (reply_port.get() == MACH_PORT_NULL) return observation;
  Received exchange{};
  exchange.wire.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, MACH_MSG_TYPE_MAKE_SEND_ONCE);
  exchange.wire.header.msgh_size = sizeof(Wire);
  exchange.wire.header.msgh_remote_port = NativeOperations::Port(endpoint);
  exchange.wire.header.msgh_local_port = reply_port.get();
  exchange.wire.header.msgh_id = kRequest;
  arc4random_buf(exchange.wire.nonce.data(), exchange.wire.nonce.size());
  const auto nonce = exchange.wire.nonce;
  auto result = mach_msg(&exchange.wire.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(Wire), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) {
    if (RecoverableSendError(result)) {
      // Match libsyscall's unsent-message handling, including a pseudo-received
      // local MOVE right. The independent owned endpoint ref remains retained.
      const auto local = MACH_MSGH_BITS_LOCAL(exchange.wire.header.msgh_bits);
      if (local == MACH_MSG_TYPE_MOVE_SEND || local == MACH_MSG_TYPE_MOVE_SEND_ONCE) {
        mach_port_deallocate(mach_task_self(), exchange.wire.header.msgh_local_port);
        exchange.wire.header.msgh_local_port = MACH_PORT_NULL;
      }
      mach_msg_destroy(&exchange.wire.header);
    } else {
      observation.right_cleanup_unresolved = true;
    }
    if (result == MACH_SEND_TIMED_OUT) observation.status = ExchangeStatus::timedOut;
    return observation;
  }
  exchange = Received{};
  result = mach_msg(&exchange.wire.header, kReceiveOptions, 0,
      sizeof(exchange), reply_port.get(), timeout_ms, MACH_PORT_NULL);
  if (result == MACH_RCV_TIMED_OUT) {
    observation.status = ExchangeStatus::timedOut;
    return observation;
  }
  if (result != KERN_SUCCESS) return observation;
  DestroyMessage destroy(&exchange.wire.header);
  const auto audit = exchange.trailer.msgh_audit;
  if (!ValidWire(exchange, kReply) || exchange.wire.nonce != nonce ||
      exchange.wire.generation != 1 || audit_token_to_pid(audit) != parent ||
      audit_token_to_pidversion(audit) < 0 || getppid() != parent || !SameBirth(*birth, 0) ||
      !NativeOperations::Validate(audit, *policy) || getppid() != parent || !SameBirth(*birth, 0))
    return observation;
  observation.status = ExchangeStatus::authenticated;
  observation.transport_generation = exchange.wire.generation;
  observation.peer_pid = parent;
  observation.peer_pid_version = audit_token_to_pidversion(audit);
  return observation;
}
}  // namespace aux::peer

namespace aux::peer {
struct AuthenticatedNativeParentConnection::State {
  State(NativeSendRight right, std::shared_ptr<const ExactCodePolicy> value,
        BirthIdentity birth_value, ParentExchange verified);
  ~State();
  const pid_t process = getpid();
  NativeSendRight endpoint;
  const std::shared_ptr<const ExactCodePolicy> policy;
  const BirthIdentity birth;
  std::mutex mutex;
  NativeParentConnectionSnapshot snapshot;
};
AuthenticatedNativeParentConnection::State::State(NativeSendRight right,
    std::shared_ptr<const ExactCodePolicy> value, BirthIdentity birth_value, ParentExchange verified)
    : endpoint(std::move(right)), policy(std::move(value)), birth(birth_value) {
  snapshot.parent_pid = verified.peer_pid;
  snapshot.parent_pid_version = verified.peer_pid_version;
}
AuthenticatedNativeParentConnection::State::~State() = default;
AuthenticatedNativeParentConnection::AuthenticatedNativeParentConnection(std::shared_ptr<State> state)
    : state_(std::move(state)) {}
std::unique_ptr<AuthenticatedNativeParentConnection> AuthenticatedNativeParentConnection::Connect(
    NativeSendRight endpoint, std::shared_ptr<const ExactCodePolicy> policy, uint32_t timeout_ms) {
  // No externally supplied status/evidence can reach this constructor. This
  // observation is produced here by the actual kernel/live-code handshake.
  auto verified = AuthenticateActualNativeParent(endpoint, policy, timeout_ms);
  if (verified.status != ExchangeStatus::authenticated) return {};
  auto birth = ReadBirth(verified.peer_pid, 0);
  if (!birth || getppid() != verified.peer_pid) return {};
  return std::unique_ptr<AuthenticatedNativeParentConnection>(new AuthenticatedNativeParentConnection(
      std::make_shared<State>(std::move(endpoint), std::move(policy), *birth, verified)));
}
AuthenticatedNativeParentConnection::~AuthenticatedNativeParentConnection() { CloseAndInspect(); }
NativeParentConnectionSnapshot AuthenticatedNativeParentConnection::CloseAndInspect() {
  auto state = state_;
  if (getpid() != state->process)
    return NativeParentConnectionSnapshot{.closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state->mutex);
  state->snapshot.closed = true;
  return state->snapshot;
}
NativeParentConnectionSnapshot AuthenticatedNativeParentConnection::Inspect() const {
  auto state = state_;
  if (getpid() != state->process)
    return NativeParentConnectionSnapshot{.closed = true, .wrong_process = true};
  std::lock_guard<std::mutex> lock(state->mutex);
  return state->snapshot;
}
ExchangeStatus AuthenticatedNativeParentConnection::Revalidate(uint32_t timeout_ms) {
  auto state = state_;
  if (getpid() != state->process) return ExchangeStatus::wrongProcess;
  // NativeSendRight is non-default-constructible; its temporary is acquired
  // before dropping the lock and retained through the actual exchange.
  std::optional<NativeSendRight> endpoint;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->snapshot.closed) return ExchangeStatus::closed;
    endpoint.emplace(state->endpoint.CopyOwnedRight());
    if (!endpoint->is_valid()) {
      state->snapshot.closed = true;
      return ExchangeStatus::refused;
    }
    ++state->snapshot.active_checks;
  }
  auto finish_check = +[](State* retained) {
    if (getpid() != retained->process) return;
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_checks;
  };
  std::unique_ptr<State, decltype(finish_check)> retained(state.get(), finish_check);
  auto current = AuthenticateActualNativeParent(*endpoint, state->policy, timeout_ms);
  const bool same = current.status == ExchangeStatus::authenticated &&
      current.peer_pid == state->birth.pid && getppid() == state->birth.pid &&
      SameBirth(state->birth, 0) &&
      current.peer_pid_version == state->snapshot.parent_pid_version;
  std::lock_guard<std::mutex> lock(state->mutex);
  if (state->snapshot.closed) return ExchangeStatus::closed;
  if (!same) {
    // No reply is not evidence of peer loss. Retain the same immutable peer
    // binding for a later real handshake; this call grants no admission.
    if (current.status == ExchangeStatus::timedOut &&
        getppid() == state->birth.pid && SameBirth(state->birth, 0))
      return ExchangeStatus::timedOut;
    state->snapshot.closed = true;
    return current.status == ExchangeStatus::authenticated ? ExchangeStatus::refused : current.status;
  }
  return ExchangeStatus::authenticated;
}
}  // namespace aux::peer

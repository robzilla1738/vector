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
#include <stdexcept>
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
  explicit DestroyMessage(mach_msg_header_t* value) : value_(value) {}
  ~DestroyMessage() { if (value_) mach_msg_destroy(value_); }
  void Disarm() { value_ = nullptr; }
 private:
  mach_msg_header_t* value_;
};
class ReceiveRight {
 public:
  ReceiveRight() {
    if (mach_port_allocate(mach_task_self(), MACH_PORT_RIGHT_RECEIVE, &port_) != KERN_SUCCESS)
      throw std::runtime_error("Native receive right unavailable");
  }
  ~ReceiveRight() {
    if (port_ != MACH_PORT_NULL)
      mach_port_mod_refs(mach_task_self(), port_, MACH_PORT_RIGHT_RECEIVE, -1);
  }
  mach_port_t get() const { return port_; }
 private:
  mach_port_t port_ = MACH_PORT_NULL;
};
constexpr mach_msg_option_t kReceiveOptions =
    MACH_RCV_MSG | MACH_RCV_TIMEOUT |
    MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0) |
    MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT);
}  // namespace

struct ExactCodePolicy::Data {
  SecRequirementRef requirement;
  std::vector<uint8_t> cd_hash;
};
ExactCodePolicy::ExactCodePolicy(SecRequirementRef requirement, std::span<const uint8_t> hash)
    : data_(std::make_unique<Data>(Data{requirement,
          std::vector<uint8_t>(hash.begin(), hash.end())})) {
  CFRetain(requirement);
}
ExactCodePolicy::~ExactCodePolicy() { CFRelease(data_->requirement); }
std::shared_ptr<const ExactCodePolicy> ExactCodePolicy::CopyNativePolicy(
    SecRequirementRef requirement, std::span<const uint8_t> hash) {
  if (!requirement || CFGetTypeID(requirement) != SecRequirementGetTypeID() ||
      (hash.size() != 20 && hash.size() != 32)) return {};
  return std::shared_ptr<const ExactCodePolicy>(new ExactCodePolicy(requirement, hash));
}
struct NativeOperations {
  static mach_port_t Port(const NativeSendRight& right) { return right.right_; }
  static bool Validate(audit_token_t token, const ExactCodePolicy& policy) {
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
    status = SecCodeCheckValidity(code, kSecCSDefaultFlags, policy.data_->requirement);
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
NativeSendRight::NativeSendRight(mach_port_t value) : right_(value) {}
NativeSendRight NativeSendRight::AdoptReceivedRight(mach_port_t value) {
  mach_port_type_t type = 0;
  if (value == MACH_PORT_NULL || mach_port_type(mach_task_self(), value, &type) != KERN_SUCCESS ||
      !(type & MACH_PORT_TYPE_SEND)) throw std::invalid_argument("Actual native send right required");
  return NativeSendRight(value);
}
NativeSendRight::NativeSendRight(NativeSendRight&& other) noexcept
    : right_(std::exchange(other.right_, MACH_PORT_NULL)) {}
NativeSendRight& NativeSendRight::operator=(NativeSendRight&& other) noexcept {
  if (this != &other) {
    if (right_ != MACH_PORT_NULL) mach_port_deallocate(mach_task_self(), right_);
    right_ = std::exchange(other.right_, MACH_PORT_NULL);
  }
  return *this;
}
NativeSendRight::~NativeSendRight() {
  if (right_ != MACH_PORT_NULL) mach_port_deallocate(mach_task_self(), right_);
}
struct ParentTransport::State {
  State(BirthIdentity child_value, std::shared_ptr<const ExactCodePolicy> value)
      : child(child_value), policy(std::move(value)) {}
  const pid_t process = getpid();
  const BirthIdentity child;
  const std::shared_ptr<const ExactCodePolicy> policy;
  ReceiveRight receiver;
  std::mutex mutex;
  TransportSnapshot snapshot;
  std::optional<int> child_pid_version;
};
ParentTransport::ParentTransport(std::shared_ptr<State> state) : state_(std::move(state)) {}
ParentTransport::~ParentTransport() { CloseAndInspect(); }
std::unique_ptr<ParentTransport> ParentTransport::BindActualDirectChild(
    pid_t child, std::shared_ptr<const ExactCodePolicy> policy) {
  if (!policy || !WaitableLiveChild(child)) return {};
  auto birth = ReadBirth(child, getpid());
  if (!birth || !WaitableLiveChild(child)) return {};
  return std::unique_ptr<ParentTransport>(new ParentTransport(
      std::make_shared<State>(*birth, std::move(policy))));
}
NativeSendRight ParentTransport::CopySendRightForNativeHandoff() {
  auto state = state_;
  if (getpid() != state->process) throw std::runtime_error("Native process changed");
  std::lock_guard<std::mutex> lock(state->mutex);
  if (state->snapshot.closed || mach_port_insert_right(mach_task_self(), state->receiver.get(),
      state->receiver.get(), MACH_MSG_TYPE_MAKE_SEND) != KERN_SUCCESS)
    throw std::runtime_error("Native handoff closed");
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
    generation = state->snapshot.generation;
    ++state->snapshot.active_exchanges;
    ++state->snapshot.active_receives;
  }
  struct ActiveExchange {
    State* state;
    ~ActiveExchange() {
      std::lock_guard<std::mutex> lock(state->mutex);
      --state->snapshot.active_exchanges;
    }
  } active{state.get()};
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
  bool valid = audit_token_to_pid(audit) == state->child.pid && version >= 0 &&
      SameBirth(state->child, state->process) && WaitableLiveChild(state->child.pid);
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    ++state->snapshot.active_code_validations;
    valid = valid && (!state->child_pid_version || *state->child_pid_version == version);
  }
  if (valid) valid = NativeOperations::Validate(audit, *state->policy);
  valid = valid && SameBirth(state->child, state->process) && WaitableLiveChild(state->child.pid);
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
  result = mach_msg(&reply.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(reply), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) return ExchangeStatus::refused;
  destroy.Disarm();  // Reply consumed the one received send-once right.
  state->child_pid_version = version;
  state->snapshot.child_pid_version_observed = true;
  ++state->snapshot.authenticated_exchanges;
  return ExchangeStatus::authenticated;
}
ParentExchange AuthenticateActualNativeParent(const NativeSendRight& endpoint,
    std::shared_ptr<const ExactCodePolicy> policy, uint32_t timeout_ms) {
  ParentExchange observation;
  if (!policy || !timeout_ms || timeout_ms > kMaximumTimeoutMs) return observation;
  const pid_t parent = getppid();
  auto birth = ReadBirth(parent, 0);
  if (!birth) return observation;
  ReceiveRight reply_port;
  Received exchange{};
  exchange.wire.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, MACH_MSG_TYPE_MAKE_SEND_ONCE);
  exchange.wire.header.msgh_size = sizeof(Wire);
  exchange.wire.header.msgh_remote_port = NativeOperations::Port(endpoint);
  exchange.wire.header.msgh_local_port = reply_port.get();
  exchange.wire.header.msgh_id = kRequest;
  arc4random_buf(exchange.wire.nonce.data(), exchange.wire.nonce.size());
  const auto nonce = exchange.wire.nonce;
  auto result = mach_msg(&exchange.wire.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT | kReceiveOptions,
      sizeof(Wire), sizeof(exchange), reply_port.get(), timeout_ms, MACH_PORT_NULL);
  if (result == MACH_RCV_TIMED_OUT || result == MACH_SEND_TIMED_OUT) {
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

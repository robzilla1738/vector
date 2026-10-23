#include "AuxNativePeerTransport.h"
#include "AuxNativePeerWire.h"
#include "AuxSelectedHomePolicyBridge.h"
#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)
#include "AuxFreshColdBootstrapNativeBridge.h"
#endif
#include <sys/fileport.h>
#include <sys/acl.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <limits.h>
#include <cstdlib>
#include <string>
#include <bsm/libbsm.h>
#include <libproc.h>
#include <sys/proc_info.h>
#include <sys/wait.h>
#include <unistd.h>
#include <array>
#include <algorithm>
#include <atomic>
#include <limits>
#include <string.h>
#include <cstring>
#include <mutex>
#include <optional>
#include <functional>
#include <type_traits>
#include <utility>
#include <vector>

namespace aux::peer {
DaemonAuthorityReply::DaemonAuthorityReply() = default;
DaemonAuthorityReply::DaemonAuthorityReply(DaemonAuthorityStatus result, std::vector<uint8_t> bytes)
    : status(result), payload(std::move(bytes)) {}
DaemonAuthorityReply::~DaemonAuthorityReply() {
  if (!payload.empty()) memset_s(payload.data(), payload.size(), 0, payload.size());
}
DaemonAuthorityReply::DaemonAuthorityReply(DaemonAuthorityReply&& other) noexcept
    : status(other.status), payload(std::move(other.payload)),
      publication_(std::move(other.publication_)) { other.status = DaemonAuthorityStatus::refused; }
DaemonAuthorityReply& DaemonAuthorityReply::operator=(DaemonAuthorityReply&& other) noexcept {
  if (this != &other) {
    if (!payload.empty()) memset_s(payload.data(), payload.size(), 0, payload.size());
    status = other.status;
    payload = std::move(other.payload);
    publication_ = std::move(other.publication_);
    other.status = DaemonAuthorityStatus::refused;
  }
  return *this;
}
namespace {
void WipeBytes(std::span<uint8_t> bytes) {
  if (!bytes.empty()) memset_s(bytes.data(), bytes.size(), 0, bytes.size());
}
struct PayloadWiper {
  explicit PayloadWiper(std::span<uint8_t> value);
  ~PayloadWiper();
  std::span<uint8_t> bytes;
};
PayloadWiper::PayloadWiper(std::span<uint8_t> value) : bytes(value) {}
PayloadWiper::~PayloadWiper() { WipeBytes(bytes); }
void WipePayload(std::vector<uint8_t>& value) {
  WipeBytes(value);
  value.clear();
}
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
bool PrivateDirectory(int descriptor) {
  struct stat value{};
  if (descriptor < 0 || fstat(descriptor, &value) != 0 || value.st_uid != geteuid() ||
      !S_ISDIR(value.st_mode) || (value.st_mode & 07777) != 0700) return false;
  errno = 0;
  acl_t acl = acl_get_fd_np(descriptor, ACL_TYPE_EXTENDED);
  if (!acl && errno == ENOENT) return true;
  if (!acl) return false;
  acl_entry_t entry = nullptr;
  errno = 0;
  const bool valid = acl_valid(acl) == 0 && acl_get_entry(acl, ACL_FIRST_ENTRY, &entry) == -1 &&
      errno == EINVAL && entry == nullptr;
  acl_free(acl);
  return valid;
}
std::optional<std::string> PhysicalPath(int descriptor) {
  char reported[PATH_MAX]{};
  if (fcntl(descriptor, F_GETPATH, reported) != 0) return std::nullopt;
  char resolved[PATH_MAX]{};
  if (!realpath(reported, resolved)) return std::nullopt;
  return std::string(resolved);
}
bool FreshChildLeaf(const std::string& leaf) {
  if (!leaf.starts_with("aux-home-") || leaf.size() != 45) return false;
  for (size_t i = 9; i < leaf.size(); ++i) {
    const size_t index = i - 9;
    if (index == 8 || index == 13 || index == 18 || index == 23) {
      if (leaf[i] != '-') return false;
    } else if (!((leaf[i] >= '0' && leaf[i] <= '9') || (leaf[i] >= 'a' && leaf[i] <= 'f'))) return false;
  }
  return true;
}
bool SameDirectory(int left, int right) {
  struct stat a{}, b{};
  return fstat(left, &a) == 0 && fstat(right, &b) == 0 && a.st_dev == b.st_dev && a.st_ino == b.st_ino;
}
bool HomeMatchesParent(int home, int parent) {
  if (!PrivateDirectory(home) || !PrivateDirectory(parent) ||
      (fcntl(home, F_GETFL) & O_ACCMODE) != O_RDONLY) return false;
  auto home_path = PhysicalPath(home), parent_path = PhysicalPath(parent);
  if (!home_path || !parent_path || !home_path->starts_with(*parent_path + "/")) return false;
  auto leaf = home_path->substr(parent_path->size() + 1);
  if (!FreshChildLeaf(leaf)) return false;
  int opened = openat(parent, leaf.c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC);
  if (opened < 0) return false;
  const bool same = PrivateDirectory(opened) && SameDirectory(home, opened);
  close(opened);
  return same;
}
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
  static int AuthenticatedGuestParent(audit_token_t token, const ExactCodePolicy& policy) {
    if (getpid() != policy.data_->process) return -1;
    CFDataRef audit = CFDataCreate(kCFAllocatorDefault, reinterpret_cast<const UInt8*>(&token), sizeof(token));
    if (!audit) return -1;
    const void* key = kSecGuestAttributeAudit; const void* value = audit;
    CFDictionaryRef attrs = CFDictionaryCreate(kCFAllocatorDefault, &key, &value, 1,
        &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFRelease(audit);
    if (!attrs) return -1;
    SecCodeRef guest = nullptr;
    OSStatus result = SecCodeCopyGuestWithAttributes(nullptr, attrs, kSecCSDefaultFlags, &guest);
    CFRelease(attrs);
    if (result != errSecSuccess || !guest) return -1;
    SecStaticCodeRef code = nullptr;
    result = SecCodeCopyStaticCode(guest, kSecCSDefaultFlags, &code);
    CFRelease(guest);
    if (result != errSecSuccess || !code) return -1;
    int32_t descriptor = -1;
    const int32_t status = AuxCopyAuthenticatedFreshChildParentDescriptor(
        code, policy.data_->requirement, policy.data_->cd_hash.data(),
        static_cast<uint32_t>(policy.data_->cd_hash.size()), &descriptor);
    CFRelease(code);
    if (status != 0) { if (descriptor >= 0) close(descriptor); return -1; }
    return descriptor;
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
struct AuthorityClient {
  explicit AuthorityClient(NativeSendRight right);
  ~AuthorityClient();
  NativeSendRight endpoint;
  std::mutex mutex;
  bool closed = false;
  bool started = false;
  bool attempted = false;
  bool pending = false;
  uint32_t operation = 0;
  uint64_t sequence = 0;
  std::vector<uint8_t> completed;
  bool completed_error = false;
  std::array<uint8_t, 16> nonce{};
  std::array<uint8_t, 51> message{};
};
AuthorityClient::AuthorityClient(NativeSendRight right) : endpoint(std::move(right)) {}
AuthorityClient::~AuthorityClient() { WipePayload(completed); }
struct AuthorityServer;
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
  std::shared_ptr<AuthorityClient> authority;
  std::shared_ptr<AuthenticatedSelectedHomeTransfer> pending_home;
  // Retains the actual accepted identity even after its one-shot typed take.
  std::shared_ptr<AuthenticatedSelectedHomeTransfer> accepted_home;
  bool selected_home_taken = false;
  std::chrono::steady_clock::time_point last_ready_export;
};
ParentTransport::State::State(std::shared_ptr<const ExactCodePolicy> value)
    : policy(std::move(value)) {}
ParentTransport::State::~State() = default;
struct AuthenticatedSelectedHomeTransfer::State {
  State(std::shared_ptr<ParentTransport::State> owner_value, int home_value, int parent_value,
        audit_token_t token_value, int version_value, uint64_t generation_value)
      : owner(std::move(owner_value)), home(home_value), parent(parent_value),
        token(token_value), version(version_value), generation(generation_value) {}
  ~State() { if (getpid() == process) { close(home); close(parent); } }
  const pid_t process = getpid();
  const std::weak_ptr<ParentTransport::State> owner;
  const int home;
  const int parent;
  const audit_token_t token;
  const int version;
  const uint64_t generation;
};
class DaemonAuthorityPublication final {
 public:
  ~DaemonAuthorityPublication();
 private:
  friend class AuthenticatedSelectedHomeTransfer;
  DaemonAuthorityPublication(std::shared_ptr<AuthenticatedSelectedHomeTransfer::State> value,
                            std::shared_ptr<AuthorityClient> source);
  std::weak_ptr<AuthenticatedSelectedHomeTransfer::State> selected;
  std::weak_ptr<AuthorityClient> client;
  uint64_t sequence;
  uint32_t operation;
  std::array<uint8_t, 16> nonce;
  std::array<uint8_t, 51> message;
  bool acknowledged = false; // Protected by that exact client's mutex.
};
DaemonAuthorityPublication::DaemonAuthorityPublication(
    std::shared_ptr<AuthenticatedSelectedHomeTransfer::State> value,
    std::shared_ptr<AuthorityClient> source)
    : selected(value), client(source), sequence(source->sequence),
      operation(source->operation), nonce(source->nonce), message(source->message) {}
DaemonAuthorityPublication::~DaemonAuthorityPublication() = default;
AuthenticatedSelectedHomeTransfer::AuthenticatedSelectedHomeTransfer(std::shared_ptr<State> value) : state_(std::move(value)) {}
AuthenticatedSelectedHomeTransfer::~AuthenticatedSelectedHomeTransfer() = default;
int AuthenticatedSelectedHomeTransfer::DuplicateRevalidatedDirectory() {
  auto value = state_;
  auto owner = value->owner.lock();
  if (!owner) return -1;
  if (getpid() != value->process) return -1;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation ||
        !owner->child_pid_version || *owner->child_pid_version != value->version) return -1;
    ++owner->snapshot.active_selected_home_validations;
  }
  auto finish = +[](ParentTransport::State* retained) {
    if (getpid() != retained->process) return;
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_selected_home_validations;
  };
  std::unique_ptr<ParentTransport::State, decltype(finish)> active(owner.get(), finish);
  if (!owner->child || !SameBirth(*owner->child, owner->process) || !WaitableLiveChild(owner->child->pid) ||
      !NativeOperations::Validate(value->token, *owner->policy)) return -1;
  int checked_parent = NativeOperations::AuthenticatedGuestParent(value->token, *owner->policy);
  if (checked_parent < 0) return -1;
  const bool valid = SameDirectory(checked_parent, value->parent) && HomeMatchesParent(value->home, checked_parent);
  close(checked_parent);
  if (!valid || !SameBirth(*owner->child, owner->process) || !WaitableLiveChild(owner->child->pid)) return -1;
  int duplicate = fcntl(value->home, F_DUPFD_CLOEXEC, 0);
  if (duplicate < 0) return -1;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation) { close(duplicate); return -1; }
  }
  return duplicate;
}
std::optional<ReadyHomePulse> AuthenticatedSelectedHomeTransfer::InspectReadyPulse() {
  auto value = state_;
  if (getpid() != value->process) return std::nullopt;
  auto owner = value->owner.lock();
  if (!owner) return std::nullopt;
  std::lock_guard<std::mutex> lock(owner->mutex);
  if (owner->snapshot.closed || owner->snapshot.generation != value->generation ||
      owner->accepted_home.get() != this || !owner->snapshot.authenticated_ready_home_exports)
    return std::nullopt;
  return ReadyHomePulse{value->generation, owner->snapshot.authenticated_ready_home_exports,
                       owner->last_ready_export};
}
std::shared_ptr<AuthenticatedSelectedHomeTransfer> ParentTransport::TakeSelectedHomeTransfer() {
  auto state = state_;
  if (getpid() != state->process) return {};
  std::lock_guard<std::mutex> lock(state->mutex);
  if (state->snapshot.closed || state->selected_home_taken) return {};
  auto selected = std::move(state->pending_home);
  if (selected) state->selected_home_taken = true;
  state->snapshot.selected_home_pending = false;
  return selected;
}
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
  state_->authority.reset();
  state_->pending_home.reset();
  state_->accepted_home.reset();
  state_->snapshot.selected_home_pending = false;
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
  state->authority.reset();
  state->pending_home.reset();
  state->accepted_home.reset();
  state->snapshot.selected_home_pending = false;
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
  if (!ValidTimeout(timeout_ms)) return ExchangeStatus::refused;
  uint64_t generation;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->snapshot.closed) return ExchangeStatus::closed;
    if (!state->child) return ExchangeStatus::refused;
    generation = state->snapshot.generation;
    ++state->snapshot.active_exchanges; ++state->snapshot.active_receives;
  }
  auto finish_exchange = +[](State* retained) {
    if (getpid() != retained->process) return;
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_exchanges;
  };
  std::unique_ptr<State, decltype(finish_exchange)> active(state.get(), finish_exchange);
  // Mach writes the actual received wire and trailer at that wire's size;
  // never read the large-frame trailer offset for a normal v1 heartbeat.
  struct Incoming {
    mach_msg_header_t header{};
    std::array<uint8_t, sizeof(SelectedHomeReceived) - sizeof(mach_msg_header_t)> bytes{};
  };
  static_assert(sizeof(Incoming) == sizeof(SelectedHomeReceived));
  static_assert(std::is_trivially_copyable_v<Received>);
  static_assert(std::is_trivially_copyable_v<SelectedHomeReceived>);
  alignas(SelectedHomeReceived) Incoming incoming{};
  auto* header = &incoming.header;
  auto result = mach_msg(header, kReceiveOptions, 0, sizeof(incoming),
      state->receiver.get(), timeout_ms, MACH_PORT_NULL);
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    --state->snapshot.active_receives;
    if (result != KERN_SUCCESS && result != MACH_RCV_TIMED_OUT) {
      // XNU may copy out a partial body with real rights on BODY_ERROR.
      // Ownership is not established by a failed receive: retain uncertainty,
      // close admission, and never destroy a fabricated/copied descriptor list.
      ++state->snapshot.unresolved_receive_cleanup;
      state->snapshot.last_receive_error = result;
      state->snapshot.closed = true;
      ++state->snapshot.generation;
      return ExchangeStatus::refused;
    }
    if (state->snapshot.closed) {
      if (result == KERN_SUCCESS) mach_msg_destroy(header);
      return ExchangeStatus::closed;
    }
  }
  if (result == MACH_RCV_TIMED_OUT) return ExchangeStatus::timedOut;
  DestroyMessage destroy(header);
  const bool authority_registration = header->msgh_id == kAuthorityRegister;
  const bool selected_request = header->msgh_id == kSelectedHomeRequest;
  if (MACH_MSGH_BITS_REMOTE(header->msgh_bits) != MACH_MSG_TYPE_PORT_SEND_ONCE)
    return ExchangeStatus::refused;
  audit_token_t audit{};
  std::array<uint8_t, 32> nonce{};
  mach_port_t incoming_fileport = MACH_PORT_NULL;
  if (selected_request || authority_registration) {
    if (header->msgh_size != sizeof(SelectedHomeWire)) return ExchangeStatus::refused;
    SelectedHomeReceived parsed{};
    std::memcpy(&parsed, &incoming, sizeof(parsed));
    if (authority_registration) {
      if (parsed.wire.version != kAuthorityVersion) return ExchangeStatus::refused;
      parsed.wire.header.msgh_id = kSelectedHomeRequest;
      parsed.wire.version = kSelectedHomeVersion;
    }
    if (!ValidSelectedHomeWire(parsed)) return ExchangeStatus::refused;
    audit = parsed.trailer.msgh_audit;
    nonce = parsed.wire.nonce;
    incoming_fileport = parsed.wire.fileport.name;
  } else {
    if (header->msgh_size != sizeof(Wire)) return ExchangeStatus::refused;
    Received parsed{};
    std::memcpy(&parsed, &incoming, sizeof(parsed));
    if (!ValidWire(parsed, kRequest) || parsed.wire.generation != 0)
      return ExchangeStatus::refused;
    audit = parsed.trailer.msgh_audit;
    nonce = parsed.wire.nonce;
  }
  const int version = audit_token_to_pidversion(audit);
  bool valid = audit_token_to_pid(audit) == state->child->pid && version >= 0 &&
      SameBirth(*state->child, state->process) && WaitableLiveChild(state->child->pid);
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    ++state->snapshot.active_code_validations;
    valid = valid && (!state->child_pid_version || *state->child_pid_version == version);
  }
  if (valid) valid = NativeOperations::Validate(audit, *state->policy);
  std::shared_ptr<AuthenticatedSelectedHomeTransfer> selected;
  if (valid && selected_request) {
    // Only a kernel-delivered fileport from this exact owned live/code peer.
    int home = fileport_makefd(incoming_fileport);
    int parent = home >= 0 ? NativeOperations::AuthenticatedGuestParent(audit, *state->policy) : -1;
    valid = home >= 0 && parent >= 0 && HomeMatchesParent(home, parent) &&
        fcntl(home, F_SETFD, FD_CLOEXEC) == 0;
    if (valid) {
      selected = std::shared_ptr<AuthenticatedSelectedHomeTransfer>(new AuthenticatedSelectedHomeTransfer(
          std::make_shared<AuthenticatedSelectedHomeTransfer::State>(state, home, parent, audit, version, generation)));
    } else {
      if (home >= 0) close(home);
      if (parent >= 0) close(parent);
    }
  }
  valid = valid && SameBirth(*state->child, state->process) && WaitableLiveChild(state->child->pid);
  std::lock_guard<std::mutex> lock(state->mutex);
  --state->snapshot.active_code_validations;
  if (state->snapshot.closed || state->snapshot.generation != generation) return ExchangeStatus::closed;
  // Retry ACK is bound to the originally accepted real directory identity.
  // The new incoming FD was freshly audit/code/sealed-policy/path validated;
  // neither a nonce nor a status can replace a pending or already-taken home.
  const bool retry = selected_request && state->accepted_home;
  const bool same_selection = !retry || (selected &&
      state->accepted_home->state_->version == version &&
      state->accepted_home->state_->generation == generation &&
      SameDirectory(state->accepted_home->state_->home, selected->state_->home) &&
      SameDirectory(state->accepted_home->state_->parent, selected->state_->parent));
  if (!valid || !same_selection ||
      (state->child_pid_version && *state->child_pid_version != version)) {
    ++state->snapshot.rejected_peer_identities;
    return ExchangeStatus::refused;
  }
  std::shared_ptr<AuthorityClient> registered;
  if (authority_registration) {
    if (!state->accepted_home || !state->child_pid_version ||
        *state->child_pid_version != version) return ExchangeStatus::refused;
    if (state->authority && state->authority->endpoint.BorrowNativeName() != incoming_fileport)
      return ExchangeStatus::refused;
    if (!state->authority) {
      registered = std::make_shared<AuthorityClient>(
          NativeSendRight::AdoptReceivedRight(incoming_fileport));
      // The new RAII owner consumes the received descriptor on every outcome.
      auto* actual = reinterpret_cast<SelectedHomeWire*>(header);
      actual->fileport.name = MACH_PORT_NULL;
    }
  }
  Wire reply{};
  reply.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_MOVE_SEND_ONCE, 0);
  reply.header.msgh_size = sizeof(reply);
  reply.header.msgh_remote_port = header->msgh_remote_port;
  reply.header.msgh_id = authority_registration ? kAuthorityRegistered : selected_request ? kSelectedHomeReply : kReply;
  reply.version = authority_registration ? kAuthorityVersion : selected_request ? kSelectedHomeVersion : kVersion;
  reply.generation = generation; reply.nonce = nonce;
  header->msgh_remote_port = MACH_PORT_NULL;
  DestroyMessage reply_cleanup(&reply.header);
  result = mach_msg(&reply.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(reply), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) {
    if (!RecoverableSendError(result)) {
      reply_cleanup.Disarm(); ++state->snapshot.unresolved_reply_cleanup;
      if (selected_request) ++state->snapshot.selected_home_cleanup_unresolved;
      state->snapshot.closed = true; ++state->snapshot.generation;
    }
    return ExchangeStatus::refused;
  }
  reply_cleanup.Disarm();
  if (registered) state->authority = std::move(registered);
  state->child_pid_version = version; state->snapshot.child_pid_version_observed = true;
  ++state->snapshot.authenticated_exchanges;
  if (selected_request) {
    ++state->snapshot.authenticated_ready_home_exports;
    state->last_ready_export = std::chrono::steady_clock::now();
  }
  if (selected_request && !retry) {
    state->accepted_home = selected;
    state->pending_home = std::move(selected);
    state->snapshot.selected_home_pending = true;
  }
  return ExchangeStatus::authenticated;
}
ParentExchange AuthenticateActualNativeParent(const NativeSendRight& endpoint,
    std::shared_ptr<const ExactCodePolicy> policy, uint32_t timeout_ms) {
  ParentExchange observation;
  if (!endpoint.is_valid() || !policy || !ValidTimeout(timeout_ms)) return observation;
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
  if (result != KERN_SUCCESS) {
    observation.right_cleanup_unresolved = true;
    observation.receive_error = result;
    return observation;
  }
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
  std::shared_ptr<AuthorityServer> authority;
  bool authority_starting = false;
  bool authority_closed = false;
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
  if (!ValidTimeout(timeout_ms)) return {};
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
  if (!ValidTimeout(timeout_ms)) return ExchangeStatus::refused;
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
  if (current.right_cleanup_unresolved) {
    if (current.receive_error) {
      ++state->snapshot.unresolved_receive_cleanup;
      state->snapshot.last_receive_error = current.receive_error;
    } else {
      ++state->snapshot.unresolved_send_cleanup;
    }
    state->snapshot.closed = true;
  }
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
#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)
ParentExchange AuthenticatedNativeParentConnection::SendSelectedHome(uint64_t ready_service, uint32_t timeout_ms) {
  ParentExchange observation;
  auto state = state_;
  if (getpid() != state->process) { observation.status = ExchangeStatus::wrongProcess; return observation; }
  if (!ready_service || !ValidTimeout(timeout_ms)) return observation;
  const auto current = Revalidate(timeout_ms);
  if (current != ExchangeStatus::authenticated) { observation.status = current; return observation; }
  std::optional<NativeSendRight> endpoint;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->snapshot.closed) { observation.status = ExchangeStatus::closed; return observation; }
    endpoint.emplace(state->endpoint.CopyOwnedRight());
    if (!endpoint->is_valid()) return observation;
    ++state->snapshot.active_checks;
  }
  auto finish = +[](State* retained) {
    if (getpid() != retained->process) return;
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_checks;
  };
  std::unique_ptr<State, decltype(finish)> active(state.get(), finish);
  int32_t directory = -1;
  // This stronger producer refuses reserved/prepared/no-provider services and
  // revalidates actual terminal/scoped/current state around its real FD dup.
  const auto export_status = AuxCopyAuthenticatedFreshColdHomeDescriptor(ready_service, &directory);
  if (export_status == 1) {
    if (directory >= 0) { close(directory); return observation; }
    observation.status = ExchangeStatus::timedOut; return observation;
  }
  if (export_status != 0 || directory < 0) {
    if (directory >= 0) close(directory);
    return observation;
  }
  auto close_directory = +[](int32_t* owned) { if (*owned >= 0) close(*owned); };
  std::unique_ptr<int32_t, decltype(close_directory)> retained_directory(&directory, close_directory);
  if (!PrivateDirectory(directory)) return observation;
  ReceiveRight reply;
  if (reply.get() == MACH_PORT_NULL) return observation;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->snapshot.closed) { observation.status = ExchangeStatus::closed; return observation; }
  }
  fileport_t port = MACH_PORT_NULL;
  if (fileport_makeport(directory, &port) != 0 || port == MACH_PORT_NULL) return observation;
  SelectedHomeWire request{};
  request.header.msgh_bits = MACH_MSGH_BITS_COMPLEX |
      MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, MACH_MSG_TYPE_MAKE_SEND_ONCE);
  request.header.msgh_size = sizeof(request);
  request.header.msgh_remote_port = NativeOperations::Port(*endpoint);
  request.header.msgh_local_port = reply.get();
  request.header.msgh_id = kSelectedHomeRequest;
  request.body.msgh_descriptor_count = 1;
  request.fileport.name = port;
  request.fileport.type = MACH_MSG_PORT_DESCRIPTOR;
  request.fileport.disposition = MACH_MSG_TYPE_MOVE_SEND;
  arc4random_buf(request.nonce.data(), request.nonce.size());
  const auto nonce = request.nonce;
  auto result = mach_msg(&request.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(request), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) {
    if (RecoverableSendError(result)) {
      const auto local = MACH_MSGH_BITS_LOCAL(request.header.msgh_bits);
      if (local == MACH_MSG_TYPE_MOVE_SEND || local == MACH_MSG_TYPE_MOVE_SEND_ONCE) {
        mach_port_deallocate(mach_task_self(), request.header.msgh_local_port);
        request.header.msgh_local_port = MACH_PORT_NULL;
      }
      // Destroy only the actual kernel-rewritten buffer, including its real
      // fileport descriptor. Never clean a stale pre-send copy of the right.
      mach_msg_destroy(&request.header);
    } else {
      std::lock_guard<std::mutex> lock(state->mutex);
      ++state->snapshot.selected_home_cleanup_unresolved;
      state->snapshot.closed = true;
      observation.right_cleanup_unresolved = true;
    }
    if (result == MACH_SEND_TIMED_OUT) observation.status = ExchangeStatus::timedOut;
    return observation;
  }
  Received received{};
  result = mach_msg(&received.wire.header, kReceiveOptions, 0, sizeof(received),
      reply.get(), timeout_ms, MACH_PORT_NULL);
  if (result == MACH_RCV_TIMED_OUT) { observation.status = ExchangeStatus::timedOut; return observation; }
  if (result != KERN_SUCCESS) {
    std::lock_guard<std::mutex> lock(state->mutex);
    ++state->snapshot.unresolved_receive_cleanup;
    state->snapshot.last_receive_error = result;
    state->snapshot.closed = true;
    observation.right_cleanup_unresolved = true;
    observation.receive_error = result;
    return observation;
  }
  DestroyMessage destroy(&received.wire.header);
  const auto audit = received.trailer.msgh_audit;
  const bool valid = received.wire.header.msgh_size == sizeof(Wire) &&
      received.wire.header.msgh_id == kSelectedHomeReply &&
      !(received.wire.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) &&
      received.wire.version == kSelectedHomeVersion && received.wire.reserved == 0 &&
      received.wire.generation == 1 && received.wire.nonce == nonce &&
      received.trailer.msgh_trailer_type == MACH_MSG_TRAILER_FORMAT_0 &&
      received.trailer.msgh_trailer_size >= sizeof(mach_msg_audit_trailer_t) &&
      audit_token_to_pid(audit) == state->birth.pid &&
      audit_token_to_pidversion(audit) == state->snapshot.parent_pid_version &&
      getppid() == state->birth.pid && SameBirth(state->birth, 0) &&
      NativeOperations::Validate(audit, *state->policy) &&
      getppid() == state->birth.pid && SameBirth(state->birth, 0);
  std::lock_guard<std::mutex> lock(state->mutex);
  if (state->snapshot.closed) { observation.status = ExchangeStatus::closed; return observation; }
  if (!valid) { state->snapshot.closed = true; return observation; }
  observation.status = ExchangeStatus::authenticated;
  observation.transport_generation = received.wire.generation;
  observation.peer_pid = state->birth.pid;
  observation.peer_pid_version = state->snapshot.parent_pid_version;
  return observation;
}
#endif

#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)
#include "AuxPreparedDaemonAuthority.h"
struct AuthorityServer {
  AuthorityServer(std::shared_ptr<AuthenticatedNativeParentConnection::State> owner,
                  uint64_t provider_value, uint64_t backend_value);
  ~AuthorityServer();
  int32_t Register(uint32_t timeout_ms);
  int32_t Service(uint32_t timeout_ms);
  int32_t Close();
  const pid_t process = getpid();
  const std::weak_ptr<AuthenticatedNativeParentConnection::State> connection;
  const uint64_t provider;
  const uint64_t backend;
  ReceiveRight receiver;
  std::optional<NativeSendRight> send_right;
  std::mutex mutex;
  bool closed = false;
  std::atomic<uint64_t> generation{0};
  uint64_t active_receives = 0;
  uint64_t active_operations = 0;
  bool cleanup_unresolved = false;
};
AuthorityServer::AuthorityServer(std::shared_ptr<AuthenticatedNativeParentConnection::State> owner,
    uint64_t provider_value, uint64_t backend_value)
    : connection(owner), provider(provider_value), backend(backend_value) {
  if (receiver.get() != MACH_PORT_NULL &&
      mach_port_insert_right(mach_task_self(), receiver.get(), receiver.get(),
                             MACH_MSG_TYPE_MAKE_SEND) == KERN_SUCCESS)
    send_right.emplace(NativeSendRight::AdoptReceivedRight(receiver.get()));
}
AuthorityServer::~AuthorityServer() {
  if (getpid() == process) {
    Close();
    // Backend's real release retains pending/untracked exact owner itself.
    AuxReleasePreparedDaemonAuthority(backend);
  }
}
int32_t AuthorityServer::Close() {
  if (getpid() != process) return -2;
  {
    std::lock_guard<std::mutex> lock(mutex);
    closed = true;
  }
  const auto outcome = AuxClosePreparedDaemonAuthority(backend);
  std::lock_guard<std::mutex> lock(mutex);
  if (cleanup_unresolved) return 2;
  if (active_receives || active_operations) return 1;
  return outcome;
}
int32_t AuthorityServer::Register(uint32_t timeout_ms) {
  if (getpid() != process) return -3;
  auto state = connection.lock();
  if (!state || !send_right || !send_right->is_valid()) return -1;
  {
    std::lock_guard<std::mutex> lock(mutex);
    if (closed) return -2;
  }
  auto endpoint = [&] {
    std::lock_guard<std::mutex> lock(state->mutex);
    return state->endpoint.CopyOwnedRight();
  }();
  if (!endpoint.is_valid()) return -1;
  ReceiveRight reply;
  if (reply.get() == MACH_PORT_NULL) return -1;
  SelectedHomeReceived request{};
  request.wire.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND,
      MACH_MSG_TYPE_MAKE_SEND_ONCE) | MACH_MSGH_BITS_COMPLEX;
  request.wire.header.msgh_size = sizeof(SelectedHomeWire);
  request.wire.header.msgh_remote_port = endpoint.BorrowNativeName();
  request.wire.header.msgh_local_port = reply.get();
  request.wire.header.msgh_id = kAuthorityRegister;
  request.wire.body.msgh_descriptor_count = 1;
  request.wire.fileport.name = send_right->BorrowNativeName();
  request.wire.fileport.disposition = MACH_MSG_TYPE_COPY_SEND;
  request.wire.fileport.type = MACH_MSG_PORT_DESCRIPTOR;
  request.wire.version = kAuthorityVersion;
  arc4random_buf(request.wire.nonce.data(), request.wire.nonce.size());
  const auto nonce = request.wire.nonce;
  auto result = mach_msg(&request.wire.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(SelectedHomeWire), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) {
    if (RecoverableSendError(result)) {
      const auto local = MACH_MSGH_BITS_LOCAL(request.wire.header.msgh_bits);
      if (local == MACH_MSG_TYPE_MOVE_SEND || local == MACH_MSG_TYPE_MOVE_SEND_ONCE)
        mach_port_deallocate(mach_task_self(), request.wire.header.msgh_local_port);
    } else {
      std::lock_guard<std::mutex> lock(mutex);
      cleanup_unresolved = true; closed = true;
      return -4;
    }
    return 1;
  }
  Received response{};
  result = mach_msg(&response.wire.header, kReceiveOptions, 0, sizeof(response),
      reply.get(), timeout_ms, MACH_PORT_NULL);
  if (result == MACH_RCV_TIMED_OUT) return 1;
  if (result != KERN_SUCCESS) {
    std::lock_guard<std::mutex> lock(mutex);
    cleanup_unresolved = true; closed = true;
    return -4;
  }
  DestroyMessage destroy(&response.wire.header);
  auto checked = response;
  checked.wire.version = kVersion;
  const bool valid = ValidWire(checked, kAuthorityRegistered) &&
      response.wire.version == kAuthorityVersion && response.wire.nonce == nonce &&
      response.wire.generation != 0 &&
      audit_token_to_pid(response.trailer.msgh_audit) == state->birth.pid &&
      audit_token_to_pidversion(response.trailer.msgh_audit) == state->snapshot.parent_pid_version &&
      getppid() == state->birth.pid && SameBirth(state->birth, 0) &&
      NativeOperations::Validate(response.trailer.msgh_audit, *state->policy);
  std::lock_guard<std::mutex> parent_lock(state->mutex);
  std::lock_guard<std::mutex> lock(mutex);
  if (state->snapshot.closed || closed) return -2;
  if (!valid || (generation && generation != response.wire.generation)) {
    closed = true; return -1;
  }
  generation = response.wire.generation;
  return 0;
}
int32_t AuthorityServer::Service(uint32_t timeout_ms) {
  if (getpid() != process) return -3;
  auto state = connection.lock();
  if (!state || !ValidTimeout(timeout_ms)) return -1;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->snapshot.closed) return -2;
    ++state->snapshot.active_checks;
  }
  auto finish_check = +[](AuthenticatedNativeParentConnection::State* retained) {
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_checks;
  };
  std::unique_ptr<AuthenticatedNativeParentConnection::State, decltype(finish_check)> actual_call(state.get(), finish_check);
  {
    std::lock_guard<std::mutex> lock(mutex);
    if (closed || !generation) return -2;
    ++active_receives;
  }
  AuthorityReceived request{};
  const auto received = mach_msg(&request.wire.header, kReceiveOptions, 0, sizeof(request),
      receiver.get(), timeout_ms, MACH_PORT_NULL);
  {
    std::lock_guard<std::mutex> lock(mutex);
    --active_receives;
    if (received != KERN_SUCCESS && received != MACH_RCV_TIMED_OUT) {
      cleanup_unresolved = true; closed = true; return -4;
    }
    if (closed) {
      if (received == KERN_SUCCESS) mach_msg_destroy(&request.wire.header);
      return -2;
    }
    if (received == MACH_RCV_TIMED_OUT) return 1;
    ++active_operations;
  }
  auto finish = +[](AuthorityServer* server) {
    std::lock_guard<std::mutex> lock(server->mutex);
    --server->active_operations;
  };
  std::unique_ptr<AuthorityServer, decltype(finish)> active(this, finish);
  DestroyMessage destroy(&request.wire.header);
  const auto& wire = request.wire;
  bool valid = wire.header.msgh_size == sizeof(wire) && wire.header.msgh_id == kAuthorityRequest &&
      !(wire.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) &&
      MACH_MSGH_BITS_REMOTE(wire.header.msgh_bits) == MACH_MSG_TYPE_PORT_SEND_ONCE &&
      wire.version == kAuthorityVersion && wire.padding == 0 && wire.generation == generation &&
      (wire.operation == kSign || wire.operation == kPublicKeys || wire.operation == kObserve ||
       wire.operation == kInboxKey || wire.operation == kAcknowledge) && wire.sequence != 0 &&
      request.trailer.msgh_trailer_type == MACH_MSG_TRAILER_FORMAT_0 &&
      request.trailer.msgh_trailer_size >= sizeof(request.trailer) &&
      audit_token_to_pid(request.trailer.msgh_audit) == state->birth.pid &&
      audit_token_to_pidversion(request.trailer.msgh_audit) == state->snapshot.parent_pid_version &&
      getppid() == state->birth.pid && SameBirth(state->birth, 0);
  if (valid) valid = NativeOperations::Validate(request.trailer.msgh_audit, *state->policy);
  if (wire.operation != kSign)
    valid = valid && std::all_of(wire.message.begin(), wire.message.end(), [](uint8_t b) { return b == 0; });
  if (!valid) {
    std::lock_guard<std::mutex> lock(mutex); closed = true; return -1;
  }
  AuthorityReplyWire response{};
  PayloadWiper response_wiper(response.payload);
  response.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_MOVE_SEND_ONCE, 0);
  response.header.msgh_size = sizeof(response);
  response.header.msgh_remote_port = request.wire.header.msgh_remote_port;
  response.header.msgh_id = kAuthorityReply;
  response.generation = generation;
  response.sequence = wire.sequence;
  response.nonce = wire.nonce;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if (state->snapshot.closed) return -2;
  }
  // Guard validation reenters this same connection's Revalidate. All native
  // registry/connection/server locks above have been released before callbacks.
  if (wire.operation == kSign)
    response.status = AuxBeginPreparedDaemonSignature(backend, wire.sequence, wire.nonce.data(),
        wire.message.data(), response.payload.data(), response.payload.size(), &response.length);
  else if (wire.operation == kPublicKeys)
    response.status = AuxBeginPreparedDaemonPublicKeys(backend, wire.sequence, wire.nonce.data(),
        response.payload.data(), response.payload.size(), &response.length);
  else if (wire.operation == kInboxKey)
    response.status = AuxBeginPreparedDaemonInboxKey(backend, wire.sequence, wire.nonce.data(),
        response.payload.data(), response.payload.size(), &response.length);
  else if (wire.operation == kAcknowledge)
    response.status = AuxAckPreparedDaemonAuthority(backend, wire.sequence, wire.nonce.data());
  else
    response.status = AuxObservePreparedDaemonAuthority(backend, wire.sequence, wire.nonce.data(),
        response.payload.data(), response.payload.size(), &response.length);
  if (response.length > response.payload.size() ||
      (response.status != 0 && response.length != 0)) return -1;
  if (response.status != 0) WipeBytes(response.payload);
  {
    std::lock_guard<std::mutex> lock(mutex);
    if (closed) return -2;
  }
  if (getppid() != state->birth.pid || !SameBirth(state->birth, 0)) return -1;
  request.wire.header.msgh_remote_port = MACH_PORT_NULL;
  DestroyMessage reply_cleanup(&response.header);
  const auto sent = mach_msg(&response.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(response), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (sent != KERN_SUCCESS) {
    if (!RecoverableSendError(sent)) {
      reply_cleanup.Disarm();
      std::lock_guard<std::mutex> lock(mutex);
      cleanup_unresolved = true; closed = true; return -4;
    }
    return 1;
  }
  reply_cleanup.Disarm();
  return 0;
}
int32_t AuthenticatedNativeParentConnection::StartPreparedDaemonAuthorityServer(uint64_t provider,
    uint32_t timeout_ms) {
  if (!provider || !ValidTimeout(timeout_ms)) return -1;
  const auto checked = Revalidate(timeout_ms);
  if (checked != ExchangeStatus::authenticated) {
    if (checked == ExchangeStatus::timedOut) return 1;
    if (checked == ExchangeStatus::closed) return -2;
    if (checked == ExchangeStatus::wrongProcess) return -3;
    return -1;
  }
  std::shared_ptr<AuthorityServer> server;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    if (state_->snapshot.closed || state_->authority_closed) return -2;
    server = state_->authority;
    if (!server) {
      if (state_->authority_starting) return 1;
      state_->authority_starting = true;
    }
  }
  if (!server) {
    const auto backend = AuxCreatePreparedDaemonAuthority(provider);
    if (!backend) {
      std::lock_guard<std::mutex> lock(state_->mutex);
      state_->authority_starting = false;
      return -1;
    }
    auto created = std::make_shared<AuthorityServer>(state_, provider, backend);
    std::lock_guard<std::mutex> lock(state_->mutex);
    state_->authority_starting = false;
    // Preserve a late actual backend even after close so its pending/untracked
    // owner remains queryable; do not publish a listener after terminal close.
    if (!state_->authority) state_->authority = created;
    server = state_->authority;
    if (state_->snapshot.closed || state_->authority_closed) return -2;
  }
  if (server->provider != provider) return -1;
  return server->Register(timeout_ms);
}
int32_t AuthenticatedNativeParentConnection::ServicePreparedDaemonAuthorityServer(uint32_t timeout_ms) {
  if (getpid() != state_->process) return -3;
  std::shared_ptr<AuthorityServer> server;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    if (state_->snapshot.closed) return -2;
    server = state_->authority;
  }
  return server ? server->Service(timeout_ms) : -1;
}
int32_t AuthenticatedNativeParentConnection::ClosePreparedDaemonAuthorityServer() {
  if (getpid() != state_->process) return -2;
  std::shared_ptr<AuthorityServer> server;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    state_->authority_closed = true;
    if (state_->authority_starting) return 1;
    server = state_->authority;
  }
  return server ? server->Close() : 0;
}
#endif

DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::SignDaemonChallenge(
    std::span<const uint8_t> message, uint32_t timeout_ms) {
  constexpr char domain[] = "Aux Daemon Auth v1"; // Includes exact terminating NUL.
  if (message.size() != 51 || std::memcmp(message.data(), domain, sizeof(domain)) != 0)
    return {};
  return RequestAuthority(kSign, message, timeout_ms);
}
DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::GetInstallationPublicKeys(uint32_t timeout_ms) {
  return RequestAuthority(kPublicKeys, {}, timeout_ms);
}
DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::GetAgentInboxV2MasterKey(uint32_t timeout_ms) {
  return RequestAuthority(kInboxKey, {}, timeout_ms);
}
DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::RequestAuthority(
    uint32_t operation, std::span<const uint8_t> message, uint32_t timeout_ms) {
  if (!ValidTimeout(timeout_ms)) return {};
  const auto value = state_;
  if (getpid() != value->process) return {DaemonAuthorityStatus::wrongProcess, {}};
  int home = DuplicateRevalidatedDirectory();
  if (home < 0) return {};
  close(home);
  const auto owner = value->owner.lock();
  if (!owner) return {DaemonAuthorityStatus::closed, {}};
  std::shared_ptr<AuthorityClient> client;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation)
      return {DaemonAuthorityStatus::closed, {}};
    client = owner->authority;
    if (client) ++owner->snapshot.active_exchanges;
  }
  if (!client) return {};
  auto finish_call = +[](ParentTransport::State* retained) {
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_exchanges;
  };
  std::unique_ptr<ParentTransport::State, decltype(finish_call)> owned_call(owner.get(), finish_call);
  // One exact outstanding operation per native selected installation. This
  // serialization lock is not a browser/host lock and crosses no JS callback.
  std::lock_guard<std::mutex> serial(client->mutex);
  if (client->closed) return {DaemonAuthorityStatus::closed, {}};
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation) {
      WipePayload(client->completed);
      return {DaemonAuthorityStatus::closed, {}};
    }
  }
  std::array<uint8_t, 51> body{};
  std::copy(message.begin(), message.end(), body.begin());
  const bool same = client->started && client->operation == operation && client->message == body;
  if (client->pending && !same) return {DaemonAuthorityStatus::busy, {}};
  if (!same) {
    if (client->sequence == std::numeric_limits<uint64_t>::max()) return {};
    ++client->sequence;
    WipePayload(client->completed);
    client->attempted = false;
    client->completed_error = false;
    client->operation = operation;
    client->message = body;
    arc4random_buf(client->nonce.data(), client->nonce.size());
    client->started = true;
  }
  const bool observe = same && client->attempted;
  bool acknowledging = false;
  for (unsigned phase = 0; phase < 2; ++phase) {
  ReceiveRight reply;
  if (reply.get() == MACH_PORT_NULL) return {};
  AuthorityReceived request{};
  request.wire.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, MACH_MSG_TYPE_MAKE_SEND_ONCE);
  request.wire.header.msgh_size = sizeof(AuthorityWire);
  request.wire.header.msgh_remote_port = client->endpoint.BorrowNativeName();
  request.wire.header.msgh_local_port = reply.get();
  request.wire.header.msgh_id = kAuthorityRequest;
  request.wire.operation = acknowledging ? kAcknowledge : observe ? kObserve : operation;
  request.wire.generation = value->generation;
  request.wire.sequence = client->sequence;
  request.wire.nonce = client->nonce;
  if (!observe && !acknowledging) request.wire.message = body;
  // Once send is attempted the nonce is retained, including all timeout/error
  // outcomes. A later call can only observe it, never silently sign again.
  client->pending = true;
  client->attempted = true;
  auto result = mach_msg(&request.wire.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(AuthorityWire), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) {
    if (RecoverableSendError(result)) {
      const auto local = MACH_MSGH_BITS_LOCAL(request.wire.header.msgh_bits);
      if (local == MACH_MSG_TYPE_MOVE_SEND || local == MACH_MSG_TYPE_MOVE_SEND_ONCE)
        mach_port_deallocate(mach_task_self(), request.wire.header.msgh_local_port);
    } else {
      std::lock_guard<std::mutex> lock(owner->mutex);
      owner->snapshot.closed = true; ++owner->snapshot.generation;
      WipePayload(client->completed);
      return {DaemonAuthorityStatus::cleanupUnresolved, {}};
    }
    return {DaemonAuthorityStatus::timedOut, {}};
  }
  AuthorityReplyReceived response{};
  PayloadWiper response_wiper(response.wire.payload);
  result = mach_msg(&response.wire.header, kReceiveOptions, 0, sizeof(response),
      reply.get(), timeout_ms, MACH_PORT_NULL);
  if (result == MACH_RCV_TIMED_OUT) return {DaemonAuthorityStatus::timedOut, {}};
  if (result != KERN_SUCCESS) {
    std::lock_guard<std::mutex> lock(owner->mutex);
    owner->snapshot.closed = true; ++owner->snapshot.generation;
    WipePayload(client->completed);
    return {DaemonAuthorityStatus::cleanupUnresolved, {}};
  }
  DestroyMessage cleanup(&response.wire.header);
  const auto& wire = response.wire;
  if (wire.header.msgh_size != sizeof(wire) || wire.header.msgh_id != kAuthorityReply ||
      (wire.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) || wire.version != kAuthorityVersion ||
      wire.generation != value->generation || wire.sequence != client->sequence ||
      wire.nonce != client->nonce || wire.reserved != 0 ||
      wire.length > wire.payload.size() ||
      response.trailer.msgh_trailer_type != MACH_MSG_TRAILER_FORMAT_0 ||
      response.trailer.msgh_trailer_size < sizeof(response.trailer) ||
      audit_token_to_pid(response.trailer.msgh_audit) != owner->child->pid ||
      audit_token_to_pidversion(response.trailer.msgh_audit) != value->version ||
      !SameBirth(*owner->child, owner->process) || !WaitableLiveChild(owner->child->pid) ||
      !NativeOperations::Validate(response.trailer.msgh_audit, *owner->policy)) {
    WipePayload(client->completed); return {};
  }
  home = DuplicateRevalidatedDirectory();
  if (home < 0) { WipePayload(client->completed); return {}; }
  close(home);
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation)
      { WipePayload(client->completed); return {DaemonAuthorityStatus::closed, {}}; }
  }
  switch (wire.status) {
    case 0:
      if (acknowledging) {
        if (wire.length != 0 || (!client->completed_error && client->completed.empty())) return {};
        client->pending = false;
        if (client->completed_error) return {};
        return {DaemonAuthorityStatus::ready, client->completed};
      }
      if (!wire.length || (operation == kInboxKey && wire.length != 32)) return {};
      {
        std::vector<uint8_t> payload(wire.payload.begin(), wire.payload.begin() + wire.length);
        if (!client->completed.empty() && client->completed != payload) {
          WipePayload(payload); WipePayload(client->completed); return {};
        }
        if (client->completed.empty()) client->completed = std::move(payload);
        else WipePayload(payload);
      }
      {
        DaemonAuthorityReply ready(DaemonAuthorityStatus::ready, client->completed);
        ready.publication_ = std::shared_ptr<DaemonAuthorityPublication>(
            new DaemonAuthorityPublication(value, client));
        // Keep pending and backend completion intact until the genuine holder
        // publication fence explicitly accepts this exact native observation.
        return ready;
      }
    case 1: return {DaemonAuthorityStatus::pending, {}};
    case 2: return {DaemonAuthorityStatus::busy, {}};
    case 3:
      client->closed = true;
      WipePayload(client->completed);
      return {DaemonAuthorityStatus::closed, {}};
    case 4:
      if (acknowledging) return {};
      client->completed_error = true;
      acknowledging = true;
      continue;
    default: return {};
  }
  }
  return {DaemonAuthorityStatus::pending, {}};
}

DaemonAuthorityStatus AuthenticatedSelectedHomeTransfer::AcceptAuthorityReply(
    const DaemonAuthorityReply& reply_value, uint32_t timeout_ms) {
  const auto publication = reply_value.publication_;
  if (!publication || reply_value.status != DaemonAuthorityStatus::ready ||
      !ValidTimeout(timeout_ms)) return DaemonAuthorityStatus::refused;
  const auto value = publication->selected.lock();
  if (!value || value != state_) return DaemonAuthorityStatus::refused;
  if (getpid() != value->process) return DaemonAuthorityStatus::wrongProcess;
  int home = DuplicateRevalidatedDirectory();
  if (home < 0) return DaemonAuthorityStatus::refused;
  close(home);
  const auto owner = value->owner.lock();
  const auto client = publication->client.lock();
  if (!owner || !client) return DaemonAuthorityStatus::closed;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation ||
        owner->authority != client) return DaemonAuthorityStatus::closed;
    ++owner->snapshot.active_exchanges;
  }
  auto finish = +[](ParentTransport::State* retained) {
    std::lock_guard<std::mutex> lock(retained->mutex);
    --retained->snapshot.active_exchanges;
  };
  std::unique_ptr<ParentTransport::State, decltype(finish)> call(owner.get(), finish);
  std::lock_guard<std::mutex> serial(client->mutex);
  if (client->closed || client->sequence != publication->sequence ||
      client->operation != publication->operation || client->nonce != publication->nonce ||
      client->message != publication->message || client->completed_error ||
      client->completed.empty() || client->completed != reply_value.payload)
    return DaemonAuthorityStatus::refused;
  if (publication->acknowledged) return DaemonAuthorityStatus::ready;
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation) {
      WipePayload(client->completed); return DaemonAuthorityStatus::closed;
    }
  }
  ReceiveRight reply;
  if (reply.get() == MACH_PORT_NULL) return DaemonAuthorityStatus::refused;
  AuthorityReceived request{};
  request.wire.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, MACH_MSG_TYPE_MAKE_SEND_ONCE);
  request.wire.header.msgh_size = sizeof(AuthorityWire);
  request.wire.header.msgh_remote_port = client->endpoint.BorrowNativeName();
  request.wire.header.msgh_local_port = reply.get();
  request.wire.header.msgh_id = kAuthorityRequest;
  request.wire.operation = kAcknowledge;
  request.wire.generation = value->generation;
  request.wire.sequence = publication->sequence;
  request.wire.nonce = publication->nonce;
  auto result = mach_msg(&request.wire.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(AuthorityWire), 0, MACH_PORT_NULL, timeout_ms, MACH_PORT_NULL);
  if (result != KERN_SUCCESS) {
    if (RecoverableSendError(result)) {
      const auto local = MACH_MSGH_BITS_LOCAL(request.wire.header.msgh_bits);
      if (local == MACH_MSG_TYPE_MOVE_SEND || local == MACH_MSG_TYPE_MOVE_SEND_ONCE)
        mach_port_deallocate(mach_task_self(), request.wire.header.msgh_local_port);
      return DaemonAuthorityStatus::timedOut;
    }
    std::lock_guard<std::mutex> lock(owner->mutex);
    owner->snapshot.closed = true; ++owner->snapshot.generation;
    WipePayload(client->completed);
    return DaemonAuthorityStatus::cleanupUnresolved;
  }
  AuthorityReplyReceived response{};
  PayloadWiper response_wiper(response.wire.payload);
  result = mach_msg(&response.wire.header, kReceiveOptions, 0, sizeof(response),
      reply.get(), timeout_ms, MACH_PORT_NULL);
  if (result == MACH_RCV_TIMED_OUT) return DaemonAuthorityStatus::timedOut;
  if (result != KERN_SUCCESS) {
    std::lock_guard<std::mutex> lock(owner->mutex);
    owner->snapshot.closed = true; ++owner->snapshot.generation;
    WipePayload(client->completed);
    return DaemonAuthorityStatus::cleanupUnresolved;
  }
  DestroyMessage cleanup(&response.wire.header);
  const auto& wire = response.wire;
  if (wire.header.msgh_size != sizeof(wire) || wire.header.msgh_id != kAuthorityReply ||
      (wire.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) || wire.version != kAuthorityVersion ||
      wire.generation != value->generation || wire.sequence != publication->sequence ||
      wire.nonce != publication->nonce || wire.reserved != 0 || wire.length != 0 ||
      response.trailer.msgh_trailer_type != MACH_MSG_TRAILER_FORMAT_0 ||
      response.trailer.msgh_trailer_size < sizeof(response.trailer) ||
      audit_token_to_pid(response.trailer.msgh_audit) != owner->child->pid ||
      audit_token_to_pidversion(response.trailer.msgh_audit) != value->version ||
      !SameBirth(*owner->child, owner->process) || !WaitableLiveChild(owner->child->pid) ||
      !NativeOperations::Validate(response.trailer.msgh_audit, *owner->policy))
    return DaemonAuthorityStatus::refused;
  home = DuplicateRevalidatedDirectory();
  if (home < 0) return DaemonAuthorityStatus::refused;
  close(home);
  {
    std::lock_guard<std::mutex> lock(owner->mutex);
    if (owner->snapshot.closed || owner->snapshot.generation != value->generation)
      return DaemonAuthorityStatus::closed;
  }
  if (wire.status == 1) return DaemonAuthorityStatus::pending;
  if (wire.status == 3) {
    client->closed = true; WipePayload(client->completed);
    return DaemonAuthorityStatus::closed;
  }
  if (wire.status != 0) return DaemonAuthorityStatus::refused;
  publication->acknowledged = true;
  client->pending = false;
  return DaemonAuthorityStatus::ready;
}
}  // namespace aux::peer

#include "AuxDevelopmentWorkerHost.h"
#include "AuxWorkerDrain.h"
#include "AuxExecPrivateParent.h"
#include "AuxNativeExecReservation.h"
#include <fcntl.h>
#include <sys/stat.h>
#include <cstdlib>
#include <signal.h>
#include "AuxBrowserRootBridge.h"
#include "AuxStorageRootsBridge.h"
#include <array>
#include <cstring>
#include "AuxNativePtyReservation.h"
#include "AuxAuthenticatedPtyHelper.h"
#include "../../../aux-native-pdf-host-consumer/source/AuxLoadedPdfLifetime.h"
#include "../../../aux-native-utility-host-consumer/source/AuxLoadedUtilityLifetime.h"
#include "aux-owned-napi-adapter.h"
#include "aux-owned-command-dispatcher.h"
#include <node.h>
#include <uv.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/wait.h>
#include <mutex>
#include <unordered_map>
#include <vector>
#include <new>
#include <limits>


// Provided only by the actual Owner -> retained cold guard/parent root bridge.
// Native finite roles; no JS path, PID, profile selector or FD enters this ABI.
extern "C" int32_t AuxRetainPreparedFreshRuntimeProvider(uint64_t);
extern "C" void AuxReleasePreparedFreshRuntimeProvider(uint64_t);
extern "C" int32_t AuxClosePreparedFreshRuntimeCreation(uint64_t);
extern "C" int32_t AuxCreatePreparedFreshRuntimeOwner(uint64_t, uint64_t*, void**);
extern "C" void AuxReleaseSignedDevelopmentOwner(void*);
extern "C" int32_t AuxCloseDevelopmentOwnerOSAdmission(void*);

namespace {
// Captured at image initialization, not a lazy singleton in a fork child.
// Inspect before any host mutex or V8 API; inherited locks may be held forever.
const pid_t kHostProcess = getpid();
struct Owner {
  const uint64_t handle;
  void* const retained;
  Owner(uint64_t h, void* r) : handle(h), retained(r) {}
  ~Owner() { AuxReleaseSignedDevelopmentOwner(retained); }
};
struct Worker {
  const uint64_t generation;
  const pid_t process;
  node::Environment* const environment;
  v8::Isolate* const isolate;
  uv_loop_t* const loop;
  const pthread_t thread;
  std::mutex mutex;
  std::shared_ptr<Owner> owner;
  // Independent from the command owner: environment cleanup may retire that
  // owner before explicit process-PDF host closure.
  std::shared_ptr<AuxLoadedPdfLifetime> pdf;
  std::shared_ptr<AuxLoadedUtilityLifetime> utility;
  // Native producer reservations, never JS identities. A successful spawn
  // establishes only direct-child custody: descendants remain unknown.
  size_t pty_pending = 0;
  size_t pty_direct = 0;
  size_t pty_unknown = 0;
  bool pty_descendants_unknown = false;
  size_t exec_pending = 0;
  size_t exec_direct = 0;
  size_t exec_unknown = 0;
  bool exec_descendants_unknown = false;
  size_t broker_pending = 0;
  bool broker_untracked = false;
  bool broker_closed = false;
  bool terminal = false;
  bool initializing = true;
  bool retiring = false;
  AuxDevelopmentWorkerDrain retirement_failure = AuxDevelopmentWorkerDrain::drained;
  bool pdf_close_requested = false;
  bool pdf_close_unresolved = false;
  bool utility_close_requested = false;
  bool utility_close_unresolved = false;
  bool cleanup_completed = false;
  bool environment_detached = false;
  Worker(uint64_t g, node::Environment* e, v8::Isolate* i, uv_loop_t* l)
      : generation(g), process(getpid()), environment(e), isolate(i), loop(l), thread(pthread_self()) {}
  AuxDevelopmentWorkerDrain Close(bool close_process_images = false) noexcept {
    // Inspect before inherited mutexes or runtime APIs, including cleanup calls.
    if (getpid() != process) return AuxDevelopmentWorkerDrain::wrongProcess;
    auto observed = AuxDevelopmentWorkerDrain::drained;
    try {
      return CloseAttempt(close_process_images, observed);
    } catch (...) {
      // Image census/quarantine allocation can fail after admission was closed.
      // Keep the exact Owner in the native registry; neither destructor failure
      // nor retry can reinterpret this interrupted retirement as completion.
      std::lock_guard<std::mutex> lock(mutex);
      terminal = true;
      retiring = false;
      retirement_failure = AuxMergeWorkerDrain(retirement_failure,
          AuxMergeWorkerDrain(observed, AuxDevelopmentWorkerDrain::untracked));
      return retirement_failure;
    }
  }
  AuxDevelopmentWorkerDrain CloseAttempt(bool close_process_images,
                                        AuxDevelopmentWorkerDrain& result) {
    std::shared_ptr<Owner> captured;
    std::shared_ptr<AuxLoadedPdfLifetime> captured_pdf;
    std::shared_ptr<AuxLoadedUtilityLifetime> captured_utility;
    bool close_pdf = false;
    bool close_utility = false;
    {
      std::lock_guard<std::mutex> lock(mutex);
      terminal = true;
      broker_closed = true;
      if (close_process_images) { pdf_close_requested = true; pdf_close_unresolved = true; utility_close_requested = true; utility_close_unresolved = true; }
      close_pdf = pdf_close_requested;
      close_utility = utility_close_requested;
      if (retiring) return AuxMergeWorkerDrain(
          retirement_failure, AuxDevelopmentWorkerDrain::pending);
      if (!owner && initializing) return AuxDevelopmentWorkerDrain::pending;
      captured = owner;
      captured_pdf = pdf;
      captured_utility = utility;
      if (!captured && !captured_pdf && !captured_utility) {
        pdf_close_unresolved = false; // No successfully captured/owned image.
        utility_close_unresolved = false;
        return retirement_failure;
      }
      retiring = true;
    }
    // No host/worker lock crosses native retirement, OS drain or owner release.
    // A concurrent/reentrant close observes pending instead of deadlocking.
    int32_t status = captured ? AuxNativeContextRetire(captured->handle) : 0;
    result = AuxDevelopmentWorkerDrain::drained;
    if (status == -2) result = AuxDevelopmentWorkerDrain::reentrant;
    else if (status == -3) result = AuxDevelopmentWorkerDrain::untracked;
    else if (status == -4) result = AuxDevelopmentWorkerDrain::wrongProcess;
    else if (status != 0 && status != -1) result = AuxDevelopmentWorkerDrain::pending;
    if (captured && (status == 0 || status == -1 || status == -3)) {
      const int32_t os = AuxCloseDevelopmentOwnerOSAdmission(captured->retained);
      if (os == 2) result = AuxMergeWorkerDrain(result, AuxDevelopmentWorkerDrain::untracked);
      else if (os != 0) result = AuxMergeWorkerDrain(result, AuxDevelopmentWorkerDrain::pending);
    }
    // Only explicit host close initiates process-image-wide PDF closure.
    // Per-environment cleanup merely observes an already-started closure and
    // retains the same owner if its PDF image remains pending/untracked.
    auto pdf_status = !captured_pdf ? std::optional<AuxPdfHostDrain>() : close_pdf
        ? std::optional(captured_pdf->CloseAndDrain())
        : captured_pdf->InspectIfClosureStarted();
    if (pdf_status) result = AuxMergeWorkerDrain(result, AuxWorkerDrainFromPdf(*pdf_status));
    auto utility_status = !captured_utility ? std::optional<AuxUtilityHostDrain>() : close_utility
        ? std::optional(captured_utility->CloseAndDrain())
        : captured_utility->InspectIfClosureStarted();
    if (utility_status) result = AuxMergeWorkerDrain(result, AuxWorkerDrainFromUtility(*utility_status));
    {
      std::lock_guard<std::mutex> lock(mutex);
      retiring = false;
      // Explicit host close may have raced an already-running environment
      // cleanup. That cleanup did not initiate PDF closure; retain the worker
      // until the requested image drain is actually consumed, even if owner
      // was previously retired and the host itself has now been destroyed.
      if (close_pdf && (pdf_status == AuxPdfHostDrain::drained ||
                        pdf_status == AuxPdfHostDrain::notPresent || !captured_pdf))
        pdf_close_unresolved = false;
      if (!close_pdf && pdf_close_requested && result == AuxDevelopmentWorkerDrain::drained)
        result = AuxDevelopmentWorkerDrain::pending;
      if (close_utility && (utility_status == AuxUtilityHostDrain::drained ||
                            utility_status == AuxUtilityHostDrain::notPresent || !captured_utility))
        utility_close_unresolved = false;
      if (!close_utility && utility_close_requested && result == AuxDevelopmentWorkerDrain::drained)
        result = AuxDevelopmentWorkerDrain::pending;
      // PDF/utility drain cannot certify PTY closure. Close admission first,
      // then retain the authenticated Owner through all reservations, including
      // reentrant close during a producer's JS property/conversion callbacks.
      result = AuxMergeWorkerDrain(result, retirement_failure);
      if (pty_unknown || pty_descendants_unknown || exec_unknown || exec_descendants_unknown || broker_untracked) {
        result = AuxMergeWorkerDrain(result, AuxDevelopmentWorkerDrain::untracked);
      } else if ((pty_pending || pty_direct || exec_pending || exec_direct || broker_pending) && result == AuxDevelopmentWorkerDrain::drained) {
        result = AuxDevelopmentWorkerDrain::pending;
      }
      if (result == AuxDevelopmentWorkerDrain::drained) {
        // In-flight factory/attachment is not drained, even if the current
        // handle is already retired. Keep ownership until it unwinds.
        if (initializing) result = AuxDevelopmentWorkerDrain::pending;
        else owner.reset(); // captured retains it until after this lock exits.
      }
    }
    return result;
  }
  bool CanContinue() {
    std::lock_guard<std::mutex> lock(mutex);
    return !terminal;
  }

};
struct PtyHelper {
  void* capability = nullptr;
  ~PtyHelper() { if (capability) AuxAuthenticatedPtyHelperRelease(capability); }
};
enum class PtyPhase { pending, direct, unknown, settled, failed };
struct PtyReservation {
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Owner> owner;
  std::shared_ptr<PtyHelper> helper; // released after native creation or proven failure
  const pid_t process = getpid();
  PtyPhase phase = PtyPhase::pending; // Worker mutex protects mutable state.
  pid_t child = -1;
};
// Browser directories are retained as real native FD capabilities until the
// successful syscall or proven no-child failure. Their names are only policy
// inputs; the actual retained Owner/generation remains the admission authority.
struct ExecBrowserRoots {
  int fds[2] = {-1, -1};
  struct stat identities[2]{};
  uint64_t transport_generation = 0;
  AuxExecNativeDeniedRoots denied{};
  ~ExecBrowserRoots() { for (int fd : fds) if (fd >= 0) close(fd); }
};
struct ExecReservation {
  // Registry.retained owns every pending/successful/unknown Worker. A failed
  // inert token must not retain drained Worker/PDF/utility state forever.
  // Assigned only before registry publication; every read locks locally.
  std::weak_ptr<Worker> worker;
  std::shared_ptr<Owner> owner;
  std::shared_ptr<ExecBrowserRoots> roots;
  const pid_t process = getpid();
  PtyPhase phase = PtyPhase::pending;
  pid_t child = -1;
};
// Process-local real Environment identities, not serializable credentials.
// Active identities are removed at actual cleanup. Dead Environment addresses
// never identify quarantined ownership, even when Node reuses those addresses.
struct ProcessRegistry {
  std::mutex mutex;
  std::unordered_map<node::Environment*, std::shared_ptr<Worker>> active;
  // Reserved before protected initialization, including active generations.
  std::unordered_map<uint64_t, std::shared_ptr<Worker>> retained;
  // Stable native token addresses are retained as tombstones after failure;
  // neither Environment address reuse nor allocator reuse can redirect a token.
  std::unordered_map<void*, std::shared_ptr<PtyReservation>> pty;
  std::unordered_map<void*, std::shared_ptr<ExecReservation>> exec;
  uint64_t next_generation = 1;
};
ProcessRegistry& Registry() {
  // Intentional process lifetime: native host objects may outlive a module's
  // C++ static-destructor ordering. Pending custody must not be auto-released
  // by global destruction, and a dead global mutex cannot certify teardown.
  static auto* value = new ProcessRegistry;
  return *value;
}
uint64_t NextGeneration() {
  std::lock_guard<std::mutex> lock(Registry().mutex);
  if (Registry().next_generation == std::numeric_limits<uint64_t>::max()) return 0;
  return Registry().next_generation++;
}
void DetachCompletedEnvironment(const std::shared_ptr<Worker>& worker) {
  std::lock_guard<std::mutex> worker_lock(worker->mutex);
  if (!worker->cleanup_completed) return;
  worker->terminal = true; // Detachment cannot reopen producer admission.
  std::lock_guard<std::mutex> lock(Registry().mutex);
  if (!worker->environment_detached) {
    auto entry = Registry().active.find(worker->environment);
    if (entry != Registry().active.end() && entry->second == worker &&
        entry->second->generation == worker->generation) Registry().active.erase(entry);
    worker->environment_detached = true;
  }
  if (worker->retirement_failure == AuxDevelopmentWorkerDrain::drained && !worker->owner && !worker->initializing && !worker->pdf_close_unresolved && !worker->utility_close_unresolved && !worker->pty_pending && !worker->pty_direct && !worker->pty_unknown && !worker->pty_descendants_unknown && !worker->exec_pending && !worker->exec_direct && !worker->exec_unknown && !worker->exec_descendants_unknown && !worker->broker_pending && !worker->broker_untracked) Registry().retained.erase(worker->generation);
}
std::shared_ptr<PtyReservation> LookupPty(void* token) noexcept {
  if (getpid() != kHostProcess) return nullptr;
  std::lock_guard<std::mutex> lock(Registry().mutex);
  auto found = Registry().pty.find(token);
  return found == Registry().pty.end() ? nullptr : found->second;
}
bool CurrentWorker(const Worker& worker) {
  auto* isolate = v8::Isolate::GetCurrent();
  return getpid() == worker.process && pthread_equal(pthread_self(), worker.thread) &&
      isolate == worker.isolate && !isolate->GetCurrentContext().IsEmpty() &&
      node::GetCurrentEnvironment(isolate->GetCurrentContext()) == worker.environment &&
      node::GetCurrentEventLoop(isolate) == worker.loop;
}
struct Observation {
  napi_env expected;
  node::Environment* environment;
  v8::Isolate* isolate;
  pthread_t thread;
  bool matched = false;
};
napi_value ObserveCurrent(napi_env env, napi_callback_info info) {
  size_t argc = 0;
  void* data = nullptr;
  if (napi_get_cb_info(env, info, &argc, nullptr, nullptr, &data) != napi_ok || !data)
    return nullptr;
  auto* observation = static_cast<Observation*>(data);
  auto* isolate = v8::Isolate::GetCurrent();
  observation->matched = env == observation->expected && isolate == observation->isolate &&
      pthread_equal(pthread_self(), observation->thread) &&
      !isolate->GetCurrentContext().IsEmpty() &&
      node::GetCurrentEnvironment(isolate->GetCurrentContext()) == observation->environment;
  napi_value output = nullptr;
  napi_get_undefined(env, &output);
  return output;
}
bool SameRuntimeEnvironment(napi_env env, node::Environment* environment, v8::Isolate* isolate) {
  // A loop can be shared. Also enter a fresh native-only NAPI function owned by
  // this env, and compare the Environment observed by Node INSIDE that callback
  // with the actual native bootstrap context. No JS-visible function or handle
  // is published, and its stack callback data is used only synchronously.
  Observation observation{env, environment, isolate, pthread_self()};
  napi_value function, receiver, result;
  return napi_create_function(env, "auxObserveWorker", NAPI_AUTO_LENGTH,
      ObserveCurrent, &observation, &function) == napi_ok &&
      napi_get_undefined(env, &receiver) == napi_ok &&
      napi_call_function(env, receiver, function, 0, nullptr, &result) == napi_ok &&
      observation.matched && v8::Isolate::GetCurrent() == isolate &&
      node::GetCurrentEnvironment(isolate->GetCurrentContext()) == environment;
}
#include "AuxStorageRootsNapi.inc"
#include "AuxBrokerWritesNapi.inc"
#include "AuxBrokerAwaitedNapi.inc"
napi_value CaptureExecPrivateParent(napi_env env, napi_callback_info info) {
  if (getpid() != kHostProcess) return nullptr;
  auto refuse = [env]() -> napi_value {
    napi_throw_error(env, "AUX_EXEC_PRIVATE_PARENT_UNAVAILABLE", "Authenticated private-state owner is unavailable");
    return nullptr;
  };
  try {
    size_t argc = 1;
    napi_value unused;
    if (napi_get_cb_info(env, info, &argc, &unused, nullptr, nullptr) != napi_ok || argc != 0)
      return refuse(); // No caller path, owner selector, PID or approval flag.
    auto* isolate = v8::Isolate::GetCurrent();
    if (!isolate || isolate->GetCurrentContext().IsEmpty()) return refuse();
    auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
    std::shared_ptr<Worker> worker;
    {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      auto found = Registry().active.find(environment);
      if (found != Registry().active.end()) worker = found->second;
    }
    if (!worker || !SameRuntimeEnvironment(env, environment, isolate)) return refuse();
    std::shared_ptr<Owner> owner;
    {
      std::lock_guard<std::mutex> lock(worker->mutex);
      if (CurrentWorker(*worker) && !worker->terminal && !worker->initializing &&
          !worker->environment_detached) owner = worker->owner;
    }
    if (!owner) return refuse();
    std::array<char, 4096> parent{};
    uint32_t count = 0;
    // Both native ownership and the actual signed policy are revalidated.
    // Neither host lock crosses Swift/Security/file-identity inspection.
    if (AuxNativeContextValidateCurrentAuthority(owner->handle) != 0 ||
        AuxCopyAuthenticatedExecPrivateParent(parent.data(), parent.size(), &count) != 0 ||
        count < 2 || count > parent.size() || parent.front() != '/' ||
        parent[count - 1] != '\0' || std::memchr(parent.data(), '\0', count - 1) ||
        AuxNativeContextValidateCurrentAuthority(owner->handle) != 0) return refuse();
    bool current;
    {
      std::lock_guard<std::mutex> lock(worker->mutex);
      current = CurrentWorker(*worker) && !worker->terminal && !worker->initializing &&
          !worker->environment_detached && worker->owner == owner;
    }
    if (!current) return refuse();
    napi_value output, format, path;
    if (napi_create_object(env, &output) != napi_ok ||
        napi_create_string_utf8(env, "aux.native.exec-private-parent.v1", NAPI_AUTO_LENGTH, &format) != napi_ok ||
        napi_create_string_utf8(env, parent.data(), count - 1, &path) != napi_ok) return refuse();
    const napi_property_descriptor fields[] = {
      {"format", nullptr, nullptr, nullptr, nullptr, format, napi_enumerable, nullptr},
      {"privateParent", nullptr, nullptr, nullptr, nullptr, path, napi_enumerable, nullptr}
    };
    if (napi_define_properties(env, output, 2, fields) != napi_ok || napi_object_freeze(env, output) != napi_ok)
      return refuse();
    return output;
  } catch (...) { return refuse(); }
}
void ReleaseAdapterOwner(void* value) {
  delete static_cast<std::shared_ptr<Owner>*>(value);
}
void Cleanup(void* value) {
  auto* retained = static_cast<std::shared_ptr<Worker>*>(value);
  auto worker = *retained;
  worker->Close();
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    worker->cleanup_completed = true;
  }
  // If async custody is still pending/unknown, the process registry deliberately
  // retains this exact owner after env teardown. Never release it as "drained".
  DetachCompletedEnvironment(worker);
  delete retained;
}
class Initialization {
 public:
  explicit Initialization(std::shared_ptr<Worker> value) : worker(std::move(value)) {}
  ~Initialization() { if (!completed) Complete(false); }
  bool Complete(bool success) {
    bool closed;
    {
      std::lock_guard<std::mutex> lock(worker->mutex);
      worker->initializing = false;
      if (!success) worker->terminal = true;
      closed = worker->terminal;
      completed = true;
    }
    if (closed) worker->Close();
    DetachCompletedEnvironment(worker);
    return closed;
  }
 private:
  std::shared_ptr<Worker> worker;
  bool completed = false;
};

}

// These are native producer entry points only. In particular they are not
// properties on the owned NAPI dispatcher and accept no JS routing authority.
extern "C" void* AuxNativePtyBeginCurrent(void) noexcept {
  if (getpid() != kHostProcess) return nullptr;
  std::shared_ptr<PtyReservation> reservation;
  try {
    auto* isolate = v8::Isolate::GetCurrent();
    if (!isolate || isolate->GetCurrentContext().IsEmpty()) return nullptr;
    auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
    std::shared_ptr<Worker> worker;
    {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      auto found = Registry().active.find(environment);
      if (found == Registry().active.end()) return nullptr;
      worker = found->second;
    }
    // Allocate before counting admission, before external validation or JS.
    reservation = std::make_shared<PtyReservation>();
    auto helper = std::make_shared<PtyHelper>();
    {
      std::lock_guard<std::mutex> lock(worker->mutex);
      if (!CurrentWorker(*worker) || worker->terminal || worker->initializing ||
          worker->environment_detached || !worker->owner ||
          worker->pty_pending == std::numeric_limits<size_t>::max()) return nullptr;
      reservation->worker = worker;
      reservation->owner = worker->owner;
      std::lock_guard<std::mutex> registry_lock(Registry().mutex);
      if (!Registry().pty.emplace(reservation.get(), reservation).second) return nullptr;
      ++worker->pty_pending;
    }
    // Genuine pending ownership spans all Security/Swift calls. Neither host
    // lock crosses validation, and a concurrent Close cannot release Owner.
    auto owner = reservation->owner;
    const bool authenticated = AuxNativeContextValidateCurrentAuthority(owner->handle) == 0 &&
        AuxCaptureAuthenticatedPtyHelper(&helper->capability) == 0 && helper->capability &&
        AuxNativeContextValidateCurrentAuthority(owner->handle) == 0;
    bool bound = false;
    if (authenticated) {
      std::lock_guard<std::mutex> lock(worker->mutex);
      bound = CurrentWorker(*worker) && !worker->terminal && !worker->initializing &&
          !worker->environment_detached && worker->owner == owner &&
          reservation->phase == PtyPhase::pending;
      if (bound) reservation->helper = helper;
    }
    if (!bound) { AuxNativePtySpawnFailed(reservation.get()); return nullptr; }
    return reservation.get();
  } catch (...) {
    // Only Begin can allocate, before any child exists. An inserted pending
    // reservation must unwind its genuine count even if later preparation fails.
    if (reservation) AuxNativePtySpawnFailed(reservation.get());
    return nullptr;
  }
}
namespace {
struct PendingPty {
  std::shared_ptr<PtyReservation> reservation;
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Owner> owner;
  std::shared_ptr<PtyHelper> helper;
};
PendingPty CapturePendingPty(void* token) noexcept {
  auto reservation = LookupPty(token);
  if (!reservation || getpid() != reservation->process) return {};
  auto worker = reservation->worker;
  if (!worker) return {};
  std::lock_guard<std::mutex> lock(worker->mutex);
  if (reservation->phase != PtyPhase::pending || !CurrentWorker(*worker) ||
      worker->terminal || worker->initializing || worker->environment_detached ||
      worker->owner != reservation->owner || !reservation->helper) return {};
  return {reservation, worker, reservation->owner, reservation->helper};
}
bool StillPendingPty(const PendingPty& pending) noexcept {
  auto& worker = *pending.worker;
  std::lock_guard<std::mutex> lock(worker.mutex);
  return pending.reservation->phase == PtyPhase::pending && CurrentWorker(worker) &&
      !worker.terminal && !worker.initializing && !worker.environment_detached &&
      worker.owner == pending.owner && pending.reservation->helper == pending.helper;
}
} // namespace
extern "C" int32_t AuxNativePtyCanSpawn(void* token) noexcept {
  if (getpid() != kHostProcess) return 0;
  auto pending = CapturePendingPty(token);
  if (!pending.owner) return 0;
  // Actual signed helper + root-owned namespace are revalidated immediately
  // before each syscall, bracketed by exact authenticated Owner authority.
  return AuxNativeContextValidateCurrentAuthority(pending.owner->handle) == 0 &&
      AuxAuthenticatedPtyHelperRevalidate(pending.helper->capability) == 0 &&
      AuxNativeContextValidateCurrentAuthority(pending.owner->handle) == 0 &&
      StillPendingPty(pending);
}
extern "C" int32_t AuxNativePtyCopyHelperPath(void* token, char* output,
    uint32_t capacity, uint32_t* bytes_including_nul) noexcept {
  if (getpid() != kHostProcess) return -1;
  if (!output || !bytes_including_nul || !capacity || capacity > 4096) return -1;
  output[0] = '\0';
  *bytes_including_nul = 0;
  auto pending = CapturePendingPty(token);
  if (!pending.owner) return -1;
  const bool valid = AuxNativeContextValidateCurrentAuthority(pending.owner->handle) == 0 &&
      AuxAuthenticatedPtyHelperCopyPath(pending.helper->capability, output, capacity,
                                      bytes_including_nul) == 0 &&
      *bytes_including_nul > 1 && *bytes_including_nul <= capacity &&
      output[*bytes_including_nul - 1] == '\0' &&
      AuxNativeContextValidateCurrentAuthority(pending.owner->handle) == 0 &&
      StillPendingPty(pending);
  if (!valid) { output[0] = '\0'; *bytes_including_nul = 0; return -1; }
  return 0;
}
extern "C" void AuxNativePtySpawnFailed(void* token) noexcept {
  if (getpid() != kHostProcess) return;
  auto reservation = LookupPty(token);
  if (!reservation || getpid() != reservation->process) return;
  auto worker = reservation->worker;
  if (!worker) return;
  bool closed;
  std::shared_ptr<Owner> released_owner;
  std::shared_ptr<PtyHelper> released_helper;
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    // Native producer may report after reentrant Close, but only on its real
    // creator thread. Cleanup itself never cancels another pending producer.
    if (!pthread_equal(pthread_self(), worker->thread) ||
        reservation->phase != PtyPhase::pending) return;
    reservation->phase = PtyPhase::failed;
    --worker->pty_pending;
    closed = worker->terminal;
    released_owner = std::move(reservation->owner);
    released_helper = std::move(reservation->helper);
    // Keep Worker pointer stable in the tombstone for racing API lookups;
    // release only the duplicate Owner retain outside the worker lock.
  }
  // Close never releases ownership while the pending count is nonzero. Revisit
  // its actual owner after the failed creation unwinds, without faking drain.
  if (closed) worker->Close();
  DetachCompletedEnvironment(worker);
}
extern "C" void AuxNativePtyChildCreated(void* token, int64_t child) noexcept {
  if (getpid() != kHostProcess) return;
  auto reservation = LookupPty(token);
  if (!reservation || getpid() != reservation->process) return;
  auto worker = reservation->worker;
  if (!worker) return;
  std::shared_ptr<PtyHelper> released_helper;
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    if (!pthread_equal(pthread_self(), worker->thread) ||
        reservation->phase != PtyPhase::pending) return;
    --worker->pty_pending;
    worker->pty_descendants_unknown = true;
    // Success is recorded before releasing helper-validation descriptors. There
    // is no post-spawn validation that could reinterpret an actual child as failure.
    released_helper = std::move(reservation->helper);
    if (child <= 0 || child > std::numeric_limits<pid_t>::max()) {
      reservation->phase = PtyPhase::unknown;
      ++worker->pty_unknown;
      return;
    }
    reservation->child = static_cast<pid_t>(child);
    reservation->phase = PtyPhase::direct;
    ++worker->pty_direct;
  }
  // Last helper retain closes only validation FDs. Child/Owner custody remains.
}
extern "C" void AuxNativePtyDirectWaitResult(void* token, int64_t result,
                                             int32_t status) noexcept {
  if (getpid() != kHostProcess) return;
  auto reservation = LookupPty(token);
  if (!reservation || getpid() != reservation->process) return;
  auto worker = reservation->worker;
  if (!worker) return;
  std::lock_guard<std::mutex> lock(worker->mutex);
  if (reservation->phase != PtyPhase::direct) return;
  --worker->pty_direct;
  if (result == reservation->child && (WIFEXITED(status) || WIFSIGNALED(status))) {
    reservation->phase = PtyPhase::settled;
  } else {
    reservation->phase = PtyPhase::unknown;
    ++worker->pty_unknown;
  }
  // No second reaper, PID probe, JS onexit, or direct-child status can resolve
  // descendant custody. The exact Worker+Owner remain quarantined.
}


namespace {
std::shared_ptr<ExecReservation> LookupExec(void* token) noexcept {
  if (getpid() != kHostProcess) return nullptr;
  std::lock_guard<std::mutex> lock(Registry().mutex);
  auto found = Registry().exec.find(token);
  return found == Registry().exec.end() ? nullptr : found->second;
}
struct PendingExecCapture {
  std::shared_ptr<ExecReservation> reservation;
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Owner> owner;
  std::shared_ptr<ExecBrowserRoots> roots;
};
PendingExecCapture CapturePendingExec(void* token) noexcept {
  auto reservation = LookupExec(token);
  if (!reservation || getpid() != reservation->process) return {};
  auto worker = reservation->worker.lock();
  if (!worker) return {};
  std::lock_guard<std::mutex> lock(worker->mutex);
  if (reservation->phase != PtyPhase::pending || !CurrentWorker(*worker) ||
      worker->terminal || worker->initializing || worker->environment_detached ||
      !reservation->owner || worker->owner != reservation->owner) return {};
  return {reservation, worker, reservation->owner, reservation->roots};
}
bool StillPendingExec(const PendingExecCapture& pending) noexcept {
  auto& worker = *pending.worker;
  std::lock_guard<std::mutex> lock(worker.mutex);
  return pending.reservation->phase == PtyPhase::pending && CurrentWorker(worker) &&
      !worker.terminal && !worker.initializing && !worker.environment_detached &&
      worker.owner == pending.owner && pending.reservation->roots == pending.roots;
}
bool ReadExecRoot(int fd, char* path, struct stat* identity) noexcept {
  if (fd < 0 || fcntl(fd, F_SETFD, FD_CLOEXEC) != 0 ||
      fstat(fd, identity) != 0 || !S_ISDIR(identity->st_mode) ||
      fcntl(fd, F_GETPATH, path) != 0 || path[0] != '/' ||
      !std::memchr(path, '\0', AUX_EXEC_DENIED_PATH_CAPACITY) || path[1] == '\0') return false;
  char resolved[AUX_EXEC_DENIED_PATH_CAPACITY]{};
  struct stat named{};
  // Reject deleted/renamed/symlink-substituted names, not just a plausible FD.
  return realpath(path, resolved) && std::strcmp(path, resolved) == 0 &&
      stat(resolved, &named) == 0 && named.st_dev == identity->st_dev &&
      named.st_ino == identity->st_ino && S_ISDIR(named.st_mode);
}
std::shared_ptr<ExecBrowserRoots> CaptureExecRoots(const std::shared_ptr<Owner>& owner) {
  auto roots = std::make_shared<ExecBrowserRoots>();
  uint32_t parent_bytes = 0;
  if (AuxNativeContextValidateCurrentAuthority(owner->handle) != 0 ||
      AuxCopyAuthenticatedExecPrivateParent(roots->denied.paths[0],
          AUX_EXEC_DENIED_PATH_CAPACITY, &parent_bytes) != 0 ||
      parent_bytes < 2 || parent_bytes > AUX_EXEC_DENIED_PATH_CAPACITY ||
      roots->denied.paths[0][0] != '/' ||
      roots->denied.paths[0][parent_bytes - 1] != '\0' ||
      std::memchr(roots->denied.paths[0], '\0', parent_bytes - 1)) return {};
  for (uint32_t index = 0; index != 2; ++index) {
    uint64_t generation = 0;
    int32_t fd = -1;
    // role1=whole user-data, role2=Chromium-derived external cache. The Owner's
    // actual native dispatcher/retained parent chooses both; caller argv does not.
    const int32_t result = AuxNativeContextCopyBrowserRoot(owner->handle,
        index + 1, &generation, &fd);
    roots->fds[index] = fd;
    if (result != 0 || !generation ||
        (index && generation != roots->transport_generation) ||
        !ReadExecRoot(fd, roots->denied.paths[index + 1], &roots->identities[index])) return {};
    roots->transport_generation = generation;
  }
  roots->denied.version = 1;
  roots->denied.count = 3;
  if (AuxNativeContextValidateCurrentAuthority(owner->handle) != 0) return {};
  return roots;
}
bool SameExecRoots(const ExecBrowserRoots& left, const ExecBrowserRoots& right) noexcept {
  if (left.transport_generation != right.transport_generation ||
      std::memcmp(&left.denied, &right.denied, sizeof(left.denied))) return false;
  for (unsigned index = 0; index != 2; ++index)
    if (left.identities[index].st_dev != right.identities[index].st_dev ||
        left.identities[index].st_ino != right.identities[index].st_ino) return false;
  return true;
}
} // namespace
extern "C" void* AuxNativeExecBeginCurrent(void) noexcept {
  if (getpid() != kHostProcess) return nullptr;
  std::shared_ptr<ExecReservation> reservation;
  try {
    auto* isolate = v8::Isolate::GetCurrent();
    if (!isolate || isolate->GetCurrentContext().IsEmpty()) return nullptr;
    auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
    std::shared_ptr<Worker> worker;
    {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      auto found = Registry().active.find(environment);
      if (found == Registry().active.end()) return nullptr;
      worker = found->second;
    }
    reservation = std::make_shared<ExecReservation>();
    {
      std::lock_guard<std::mutex> lock(worker->mutex);
      if (!CurrentWorker(*worker) || worker->terminal || worker->initializing ||
          worker->environment_detached || !worker->owner ||
          worker->exec_pending == std::numeric_limits<size_t>::max()) return nullptr;
      reservation->worker = worker;
      reservation->owner = worker->owner;
      std::lock_guard<std::mutex> registry_lock(Registry().mutex);
      if (!Registry().exec.emplace(reservation.get(), reservation).second) return nullptr;
      ++worker->exec_pending;
    }
    auto pending = CapturePendingExec(reservation.get());
    if (!pending.owner || AuxNativeContextValidateCurrentAuthority(pending.owner->handle) != 0 ||
        !StillPendingExec(pending)) { AuxNativeExecSpawnFailed(reservation.get()); return nullptr; }
    return reservation.get();
  } catch (...) {
    if (reservation) AuxNativeExecSpawnFailed(reservation.get());
    return nullptr;
  }
}
extern "C" int32_t AuxNativeExecCopyDeniedRoots(void* token, AuxExecNativeDeniedRoots* output) noexcept {
  if (getpid() != kHostProcess || !output) return -1;
  *output = {};
  try {
    auto pending = CapturePendingExec(token);
    if (!pending.owner) return -1;
    auto roots = CaptureExecRoots(pending.owner);
    if (!roots || !StillPendingExec(pending)) return -1;
    if (pending.roots && !SameExecRoots(*pending.roots, *roots)) return -1;
    {
      std::lock_guard<std::mutex> lock(pending.worker->mutex);
      if (!CurrentWorker(*pending.worker) || pending.worker->terminal ||
          pending.worker->owner != pending.owner || pending.reservation->phase != PtyPhase::pending ||
          pending.reservation->roots != pending.roots) return -1;
      if (!pending.roots) pending.reservation->roots = roots;
    }
    *output = roots->denied;
    return 0;
  } catch (...) { return -1; }
}
extern "C" int32_t AuxNativeExecCanSpawn(void* token) noexcept {
  if (getpid() != kHostProcess) return 0;
  try {
    auto pending = CapturePendingExec(token);
    if (!pending.owner || !pending.roots) return 0;
    auto current_roots = CaptureExecRoots(pending.owner);
    return current_roots && SameExecRoots(*pending.roots, *current_roots) &&
        AuxNativeContextValidateCurrentAuthority(pending.owner->handle) == 0 && StillPendingExec(pending);
  } catch (...) { return 0; }
}
namespace {
thread_local void* active_exec_spawn = nullptr;
thread_local bool active_exec_child_created = false;
}
extern "C" int32_t AuxNativeExecEnterUvSpawn(void* token) noexcept {
  if (getpid() != kHostProcess || active_exec_spawn || !AuxNativeExecCanSpawn(token)) return -1;
  active_exec_spawn = token;
  active_exec_child_created = false;
  return 0;
}
extern "C" int32_t AuxNativeExecUvCanSpawn(void) noexcept {
  return getpid() == kHostProcess && active_exec_spawn && !active_exec_child_created &&
      AuxNativeExecCanSpawn(active_exec_spawn);
}
extern "C" void AuxNativeExecUvChildCreated(int64_t actual_child) noexcept {
  if (getpid() != kHostProcess || !active_exec_spawn || active_exec_child_created) return;
  // Actual C producer just returned successful posix_spawn. Mark the scope
  // created even if child metadata itself is invalid: cancellation is forbidden.
  AuxNativeExecChildCreated(active_exec_spawn, actual_child);
  active_exec_child_created = true;
}
extern "C" int32_t AuxNativeExecLeaveUvSpawn(void) noexcept {
  if (getpid() != kHostProcess || !active_exec_spawn) return -1;
  const bool created = active_exec_child_created;
  active_exec_spawn = nullptr;
  active_exec_child_created = false;
  return created ? 1 : 0;
}
extern "C" void AuxNativeExecSpawnFailed(void* token) noexcept {
  if (getpid() != kHostProcess) return;
  auto reservation = LookupExec(token);
  if (!reservation || getpid() != reservation->process) return;
  auto worker = reservation->worker.lock();
  if (!worker) return;
  std::shared_ptr<Owner> released_owner;
  std::shared_ptr<ExecBrowserRoots> released_roots;
  bool closed = false;
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    if (!pthread_equal(pthread_self(), worker->thread) || reservation->phase != PtyPhase::pending) return;
    --worker->exec_pending;
    reservation->phase = PtyPhase::failed;
    released_owner = std::move(reservation->owner);
    released_roots = std::move(reservation->roots);
    closed = worker->terminal;
  }
  if (closed) worker->Close();
  DetachCompletedEnvironment(worker);
}
extern "C" void AuxNativeExecChildCreated(void* token, int64_t child) noexcept {
  if (getpid() != kHostProcess) return;
  auto reservation = LookupExec(token);
  if (!reservation || getpid() != reservation->process) return;
  auto worker = reservation->worker.lock();
  if (!worker) return;
  std::shared_ptr<ExecBrowserRoots> released_roots;
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    if (!pthread_equal(pthread_self(), worker->thread) || reservation->phase != PtyPhase::pending) return;
    --worker->exec_pending;
    worker->exec_descendants_unknown = true;
    released_roots = std::move(reservation->roots);
    if (child <= 0 || child > std::numeric_limits<pid_t>::max()) {
      reservation->phase = PtyPhase::unknown;
      ++worker->exec_unknown;
      return;
    }
    reservation->child = static_cast<pid_t>(child);
    reservation->phase = PtyPhase::direct;
    ++worker->exec_direct;
  }
}
extern "C" void AuxNativeExecDirectExitObserved(void* token, int64_t child,
    int64_t exit_status, int32_t term_signal) noexcept {
  if (getpid() != kHostProcess) return;
  auto reservation = LookupExec(token);
  if (!reservation || getpid() != reservation->process) return;
  auto worker = reservation->worker.lock();
  if (!worker) return;
  std::lock_guard<std::mutex> lock(worker->mutex);
  // libuv's sole matching terminal wait calls this before JS. Creator thread
  // and actual handle PID must match; no current V8 context is required here.
  if (!pthread_equal(pthread_self(), worker->thread) || reservation->phase != PtyPhase::direct) return;
  --worker->exec_direct;
  if (child == reservation->child && exit_status >= 0 && term_signal >= 0 &&
      term_signal < NSIG && !(exit_status && term_signal)) reservation->phase = PtyPhase::settled;
  else { reservation->phase = PtyPhase::unknown; ++worker->exec_unknown; }
  // Never clear descendants_unknown or release successful Owner custody.
}

extern "C" void AuxNativeExecDirectWaitResult(void* token, int64_t waited,
    int32_t raw_status) noexcept {
  if (getpid() != kHostProcess) return;
  auto reservation = LookupExec(token);
  if (!reservation || getpid() != reservation->process) return;
  auto worker = reservation->worker.lock();
  if (!worker) return;
  std::lock_guard<std::mutex> lock(worker->mutex);
  if (reservation->phase != PtyPhase::direct) return;
  --worker->exec_direct;
  if (waited == reservation->child && (WIFEXITED(raw_status) || WIFSIGNALED(raw_status)))
    reservation->phase = PtyPhase::settled;
  else { reservation->phase = PtyPhase::unknown; ++worker->exec_unknown; }
  // Direct native observation never settles descendants or releases the Owner.
}

struct AuxDevelopmentWorkerHost::State {
  const pid_t process = getpid();
  uint64_t prepared_fresh_provider = 0;
  State() = default;
  explicit State(uint64_t provider) {
    if (!provider || AuxRetainPreparedFreshRuntimeProvider(provider)) closed = true;
    else prepared_fresh_provider = provider;
  }
  ~State() {
    if (prepared_fresh_provider) AuxReleasePreparedFreshRuntimeProvider(prepared_fresh_provider);
  }
  std::mutex mutex;
  bool closed = false;
  std::vector<std::shared_ptr<Worker>> workers;
};

AuxDevelopmentWorkerHost::AuxDevelopmentWorkerHost(uint64_t provider)
    : state_(std::make_shared<State>(provider)) {}
AuxDevelopmentWorkerHost::~AuxDevelopmentWorkerHost() { CloseAndDrain(); }

napi_status AuxDevelopmentWorkerHost::RegisterCurrentWorker(napi_env env, napi_value target) {
  if (!env || !target || getpid() != state_->process) return napi_invalid_arg;
  auto* isolate = v8::Isolate::GetCurrent();
  if (!isolate || isolate->GetCurrentContext().IsEmpty()) return napi_generic_failure;
  auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
  auto* loop = node::GetCurrentEventLoop(isolate);
  uv_loop_t* napi_loop = nullptr;
  // Both observations come from runtime APIs on this actual native callback.
  if (!environment || !loop || napi_get_uv_event_loop(env, &napi_loop) != napi_ok ||
      napi_loop != loop || !SameRuntimeEnvironment(env, environment, isolate))
    return napi_generic_failure;
  std::unique_lock<std::mutex> host_lock(state_->mutex);
  if (state_->closed) return napi_closing;
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Worker>* cleanup_retain = nullptr;
  try {
    uint64_t generation = NextGeneration();
    if (!generation) return napi_generic_failure;
    worker = std::make_shared<Worker>(generation, environment, isolate, loop);
    cleanup_retain = new std::shared_ptr<Worker>(worker);
    {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      if (Registry().active.count(environment)) { delete cleanup_retain; return napi_generic_failure; }
      Registry().active.emplace(environment, worker);
      Registry().retained.emplace(worker->generation, worker);
    }
    state_->workers.push_back(worker);
  } catch (...) {
    delete cleanup_retain;
    if (worker) {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      auto entry = Registry().active.find(environment);
      if (entry != Registry().active.end() && entry->second == worker) Registry().active.erase(entry);
      Registry().retained.erase(worker->generation);
    }
    return napi_generic_failure;
  }
  host_lock.unlock();
  Initialization initialization(worker);
  // Install lifetime ownership before any protected factory. Failure stays
  // reserved/closed for this environment rather than permitting a new attempt.
  napi_status status = napi_add_env_cleanup_hook(env, Cleanup, cleanup_retain);
  if (status != napi_ok) {
    // NAPI failure did not register ownership. The current actual Node
    // Environment still supports its native cleanup hook; preserve the failed
    // reservation until teardown without leaking the record or retrying it.
    node::AddEnvironmentCleanupHook(isolate, Cleanup, cleanup_retain);
    return status;
  }
  if (!worker->CanContinue()) return napi_closing;
  uint64_t handle = 0;
  void* retained_owner = nullptr;
  int32_t prepared = AuxCreatePreparedFreshRuntimeOwner(
      state_->prepared_fresh_provider, &handle, &retained_owner);
  if (prepared || !handle || !retained_owner) {
    if (handle) AuxNativeContextRetire(handle);
    if (retained_owner) AuxReleaseSignedDevelopmentOwner(retained_owner);
    return napi_generic_failure;
  }
  std::shared_ptr<Owner> captured;
  // This exact factory success authenticates the current loaded-image policy.
  // Capture only its fixed already-loaded PDF image; no caller/JS path or flag.
  std::shared_ptr<AuxLoadedPdfLifetime> captured_pdf;
  std::shared_ptr<AuxLoadedUtilityLifetime> captured_utility;
  try {
    captured_pdf = AuxLoadedPdfLifetime::CaptureAfterAuthenticatedOwner();
    captured_utility = AuxLoadedUtilityLifetime::CaptureAfterAuthenticatedOwner();
    captured = std::make_shared<Owner>(handle, retained_owner);
  }
  catch (...) {
    AuxNativeContextRetire(handle);
    AuxReleaseSignedDevelopmentOwner(retained_owner);
    return napi_generic_failure;
  }
  {
    std::lock_guard<std::mutex> lock(worker->mutex);
    worker->owner = captured;
    worker->pdf = captured_pdf;
    worker->utility = captured_utility;
  }
  if (captured_pdf->capture_status() == AuxPdfHostCapture::refusedImage ||
      captured_utility->capture_status() == AuxUtilityHostCapture::refusedImage)
    return napi_generic_failure; // Keep refused image ownership quarantined.
  // A factory finishing after host close is retained only for retirement;
  // it must never reach the NAPI attachment/publication path.
  if (!worker->CanContinue()) return napi_closing;
  auto* adapter_retain = new (std::nothrow) std::shared_ptr<Owner>(captured);
  if (!adapter_retain) return napi_generic_failure;
  // DefineProperty may synchronously execute a Proxy trap. There is NO host
  // or worker mutex held here. Close retires captured's handle immediately,
  // reports pending while initialization is active, and cannot be bypassed by
  // a trap retaining the function object. Completion refuses success if closed.
  status = AuxAttachOwnedDispatcher(env, target, handle, adapter_retain, ReleaseAdapterOwner);
  if (status == napi_ok && worker->CanContinue()) {
    const napi_property_descriptor properties[] = {
      {"captureExecPrivateParent",nullptr,CaptureExecPrivateParent,nullptr,nullptr,nullptr,napi_default,nullptr},
      {"captureStorageRoots",nullptr,CaptureStorageRoots,nullptr,nullptr,nullptr,napi_default,nullptr},
      {"assertBrokerOwner",nullptr,AssertBrokerOwner,nullptr,nullptr,nullptr,napi_default,nullptr},
      {"withBrokerSync",nullptr,WithBrokerSync,nullptr,nullptr,nullptr,napi_default,nullptr},
      {"withBrokerAwaited",nullptr,WithBrokerAwaited,nullptr,nullptr,nullptr,napi_default,nullptr},
      {"closeBrokerWriteAdmission",nullptr,CloseBrokerWriteAdmission,nullptr,nullptr,nullptr,napi_default,nullptr},
      {"noteUntrackedBrokerWork",nullptr,NoteUntrackedBrokerWork,nullptr,nullptr,nullptr,napi_default,nullptr}};
    status = napi_define_properties(env,target,6,properties);
  }
  const bool closed = initialization.Complete(status == napi_ok);
  return status == napi_ok && closed ? napi_closing : status;

}

AuxDevelopmentWorkerDrain AuxDevelopmentWorkerHost::CloseAndDrain() noexcept {
  if (getpid() != state_->process) return AuxDevelopmentWorkerDrain::wrongProcess;
  size_t worker_count;
  {
    std::lock_guard<std::mutex> lock(state_->mutex);
    state_->closed = true;
    // RegisterCurrentWorker holds this same mutex from its admission check
    // through push_back. Once closed, this vector cannot grow or erase.
    worker_count = state_->workers.size();
  }
  auto result = AuxDevelopmentWorkerDrain::drained;
  if (state_->prepared_fresh_provider) {
    const int32_t creation = AuxClosePreparedFreshRuntimeCreation(state_->prepared_fresh_provider);
    if (creation < 0 || creation == 2)
      result = AuxMergeWorkerDrain(result, AuxDevelopmentWorkerDrain::untracked);
    else if (creation == 1)
      result = AuxMergeWorkerDrain(result, AuxDevelopmentWorkerDrain::pending);
  }
  try {
    result = AuxMergeWorkerDrain(result, AuxWorkerDrainFromUtility(
        AuxLoadedUtilityLifetime::InspectRetainedClosures()));
  } catch (...) {
    // A failed image census is unknown, not an empty image set. Continue
    // closing actual workers; no snapshot allocation is needed for that pass.
    result = AuxMergeWorkerDrain(result, AuxDevelopmentWorkerDrain::untracked);
  }
  for (size_t i = 0; i < worker_count; ++i) {
    std::shared_ptr<Worker> worker;
    {
      std::lock_guard<std::mutex> lock(state_->mutex);
      worker = state_->workers[i]; // shared_ptr copy does not allocate.
    }
    result = AuxMergeWorkerDrain(result, worker->Close(true));
    DetachCompletedEnvironment(worker);
  }
  return result;
}

// Inactive executable successor. The packaged entry's first refusal is intact.
#include "AuxNativeEndpointDelivery.h"
#include "AuxTaskDescendantObserver.h"
#include "AuxInheritedCrashRegistration.h"
#include "AuxSealedOuterBrowserParent.h"
#include "AuxNativeParentConnectionBridge.h"
#include "AuxFreshColdBootstrapNativeBridge.h"
#include "AuxNativeNodeRunner.h"
#include <CoreFoundation/CoreFoundation.h>
#include <mach-o/dyld.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <cstdio>
#include <cstring>
#include <climits>
#include <cstdlib>
#include <memory>
#include <mutex>
#include <string>
#include <thread>
#include <libproc.h>
#include <sys/proc.h>
#include <signal.h>
#include <cerrno>
#include <vector>
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
// This private inline touches Environment's actual native immediate queue.
// Match the linked node_base target, not libnode's snapshot-only target.
#if !defined(HAVE_INSPECTOR) || HAVE_INSPECTOR != 1
#error "Aux ordinary shutdown requires the linked node_base Environment layout"
#endif
#include "env-inl.h"
#endif

// Native-only actual Swift provider C ABI, not exported to JavaScript.
extern "C" void AuxReleasePreparedFreshRuntimeProvider(uint64_t);
extern "C" int32_t AuxClosePreparedFreshRuntimeCreation(uint64_t);
// Root's strictly sealed embedded-daemon policy/image producer; no caller path.
extern "C" int32_t AuxPrepareSealedNativeDaemonImages(void);

namespace {
constexpr uint32_t kPeerTimeoutMs = 2000;
constexpr auto kPulseInterval = std::chrono::seconds(1);
// Peer loss still records a native failure. Give only the existing, actually
// registered SIGTERM listener the opportunity to drain its physical producers.
// No listener/exception retains the fatal Stop behavior; no timeout is clean.
void RequestPeerLossShutdown(node::Environment* environment) {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  environment->SetImmediateThreadsafe([](node::Environment* actual) {
    if (!actual->can_call_into_js()) {
      node::Stop(actual);
      return;
    }
    auto* isolate = actual->isolate();
    v8::HandleScope handles(isolate);
    v8::Context::Scope context_scope(actual->context());
    v8::TryCatch caught(isolate);
    v8::Local<v8::Value> args[] = {
        v8::String::NewFromUtf8Literal(isolate, "SIGTERM")};
    v8::Local<v8::Value> emitted;
    // EventEmitter.emit is true only if a real listener was invoked. The
    // supplied listener synchronously starts its idempotent shutdown routine.
    if (!node::MakeCallback(isolate, actual->process_object(), "emit", 1, args,
                            {0, 0}).ToLocal(&emitted) || !emitted->IsTrue()) {
      node::Stop(actual);
    }
  });
#else
  node::Stop(environment);
#endif
}

int Refuse(const char* stage, int status, int exit_code) {
  // Stage is always a source literal. Never print paths, policy or payloads.
  fprintf(stderr, "Aux native daemon refused at %s (status %d).\n", stage, status);
  return exit_code;
}

struct NativeLifetime {
  const pid_t process = getpid();
  uint64_t parent = 0;
  uint64_t service = 0;
  uint64_t provider = 0;
  int home_fd = -1;
  ~NativeLifetime() {
    if (getpid() != process) return; // Never touch inherited native registries.
    if (parent) {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
      // A browser-startup grant is NOT an ES CLEAN receipt. Keep its exact
      // registry-owned graph until physical process exit if still pending.
      if (AuxClosePreparedDaemonAuthorityServer(parent) != 0) return;
#else
      while (AuxClosePreparedDaemonAuthorityServer(parent) != 0)
        std::this_thread::sleep_for(std::chrono::milliseconds(250));
#endif
    }
    if (provider) {
      while (AuxClosePreparedFreshRuntimeCreation(provider) != 0)
        std::this_thread::sleep_for(std::chrono::milliseconds(250));
      AuxReleasePreparedFreshRuntimeProvider(provider);
    }
    if (service) AuxReleaseAuthenticatedFreshColdBootstrap(service);
    if (parent) AuxReleaseNativeParentConnection(parent);
    if (home_fd >= 0) close(home_fd);
  }
};

// Only from the actual ready service FD. Environment strings select no owner.
bool InstallReadyHomeEnvironment(NativeLifetime& lifetime) {
  int32_t descriptor = -1;
  if (AuxCopyAuthenticatedFreshColdHomeDescriptor(lifetime.service, &descriptor) != 0 ||
      descriptor < 0) return false;
  lifetime.home_fd = descriptor;
  struct stat before{}, current{};
  char path[PATH_MAX]{};
  if (fstat(descriptor, &before) != 0 || !S_ISDIR(before.st_mode) ||
      before.st_uid != geteuid() || (before.st_mode & 07777) != 0700 ||
      fcntl(descriptor, F_GETPATH, path) != 0 || path[0] != '/' ||
      lstat(path, &current) != 0 || current.st_dev != before.st_dev ||
      current.st_ino != before.st_ino) return false;
  const std::string runtime = std::string(path) + "/runtime";
  return setenv("AUX_HOME", path, 1) == 0 &&
         setenv("AUX_AGENT_RUNTIME_DIR", runtime.c_str(), 1) == 0;
}

std::string FilePath(const char* resource_url) {
  auto url = CFURLCreateWithBytes(kCFAllocatorDefault,
      reinterpret_cast<const UInt8*>(resource_url), strlen(resource_url),
      kCFStringEncodingUTF8, nullptr);
  if (!url) return {};
  UInt8 buffer[PATH_MAX]{};
  const bool valid = CFURLGetFileSystemRepresentation(url, true, buffer, sizeof(buffer));
  CFRelease(url);
  return valid ? reinterpret_cast<const char*>(buffer) : std::string();
}

// The native server is available before JS and owns its real backend through
// thread exit and actual close. No health result or JS value publishes it.
class AuthorityLoop final {
 public:
  explicit AuthorityLoop(NativeLifetime& lifetime) : lifetime_(lifetime) {
    worker_ = std::thread([this] {
      while (!stop_.load()) {
        const auto status = AuxServicePreparedDaemonAuthorityServer(lifetime_.parent, kPeerTimeoutMs);
        if (stop_.load()) return;
        if (status == 0 || status == 1) continue;
        failure_.store(status);
        node::Environment* environment = nullptr;
        {
          std::lock_guard<std::mutex> lock(mutex_);
          environment = environment_;
        }
        // Main joins this thread before freeing setup; no lock crosses Stop.
        if (environment) RequestPeerLossShutdown(environment);
        return;
      }
    });
  }
  ~AuthorityLoop() { StopAndDrain(); }
  int32_t failure() const { return failure_.load(); }
  void AttachActualEnvironment(node::Environment* environment) {
    {
      std::lock_guard<std::mutex> lock(mutex_);
      environment_ = environment;
    }
    if (failure_.load() != 0) node::Stop(environment);
  }
  void StopAndDrain() {
    stop_.store(true);
    // Close native admission before waiting; no timeout is successful drain.
    auto status = AuxClosePreparedDaemonAuthorityServer(lifetime_.parent);
    if (worker_.joinable()) worker_.join();
#if defined(AUX_FIXED_LINKED_PTY_POLICY) || !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP
    while (status != 0) {
      std::this_thread::sleep_for(std::chrono::milliseconds(250));
      status = AuxClosePreparedDaemonAuthorityServer(lifetime_.parent);
    }
#else
    // Own server work has physically joined. Pending browser grant state
    // remains in the native registry; this branch never emits CLEAN or
    // claims all-browser-writer drain. NativeLifetime retains it to exit.
    (void)status;
#endif
    std::lock_guard<std::mutex> lock(mutex_);
    environment_ = nullptr;
  }
 private:
  NativeLifetime& lifetime_;
  std::atomic<bool> stop_{false};
  std::atomic<int32_t> failure_{0};
  std::mutex mutex_;
  node::Environment* environment_ = nullptr;
  std::thread worker_;
};

// This thread authenticates/re-exports only the actual ready service. A v1
// heartbeat is never substituted for current provider/home readiness.
class ReadyPulse final {
 public:
  ReadyPulse(NativeLifetime& lifetime, node::CommonEnvironmentSetup& setup)
      : lifetime_(lifetime), environment_(setup.env()) {
    worker_ = std::thread([this] {
      std::unique_lock<std::mutex> lock(mutex_);
      while (!stop_) {
        if (wake_.wait_for(lock, kPulseInterval, [this] { return stop_; })) break;
        lock.unlock();
        const auto status = AuxSendAuthenticatedFreshColdHome(
            lifetime_.parent, lifetime_.service, kPeerTimeoutMs);
        // Timeout is not successful readiness or observed peer loss. Parent
        // expires its own real pulse; next attempt still authenticates same peer.
        if (status != 0 && status != 1) {
          fprintf(stderr, "Aux ready pulse refused: status %d\n", status);
          failed_.store(true);
          // Setup remains alive until this thread and actual native work join.
          RequestPeerLossShutdown(environment_);
          return;
        }
        lock.lock();
      }
    });
  }
  ~ReadyPulse() { StopAndJoin(); }
  bool failed() const { return failed_.load(); }
  void StopAndJoin() {
    {
      std::lock_guard<std::mutex> lock(mutex_);
      stop_ = true;
    }
    wake_.notify_all();
    if (worker_.joinable()) worker_.join();
  }
 private:
  NativeLifetime& lifetime_;
  node::Environment* const environment_;
  std::atomic<bool> failed_{false};
  std::mutex mutex_;
  std::condition_variable wake_;
  bool stop_ = false;
  std::thread worker_;
};

}  // namespace

// Private native observations for the ordinary-only root record. No source,
// path, Profile, rights or caller-selected current process is accepted.
extern "C" int32_t AuxCopyOrdinaryBrowserParentLifetime(
    int32_t* pid, uint64_t* seconds, uint64_t* microseconds) {
  if (!pid || !seconds || !microseconds) return -1;
  *pid = -1; *seconds = 0; *microseconds = 0;
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  const pid_t parent = getppid();
  proc_bsdinfo first{}, second{};
  if (parent <= 1 ||
      proc_pidinfo(parent, PROC_PIDTBSDINFO, 0, &first, sizeof(first)) != sizeof(first) ||
      first.pbi_pid != static_cast<uint32_t>(parent) || first.pbi_uid != geteuid() ||
      !first.pbi_start_tvsec || first.pbi_start_tvusec >= 1'000'000 ||
      getppid() != parent ||
      proc_pidinfo(parent, PROC_PIDTBSDINFO, 0, &second, sizeof(second)) != sizeof(second) ||
      second.pbi_start_tvsec != first.pbi_start_tvsec ||
      second.pbi_start_tvusec != first.pbi_start_tvusec || getppid() != parent) return -1;
  *pid = parent; *seconds = first.pbi_start_tvsec; *microseconds = first.pbi_start_tvusec;
  return 0;
#else
  return -1;
#endif
}
extern "C" int32_t AuxOrdinaryPriorBrowserHasExited(
    int32_t pid, uint64_t seconds, uint64_t microseconds) {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  if (pid <= 1 || !seconds || microseconds >= 1'000'000) return -1;
  proc_bsdinfo info{};
  if (proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, &info, sizeof(info)) == sizeof(info)) {
    if (info.pbi_pid != static_cast<uint32_t>(pid) || !info.pbi_start_tvsec ||
        info.pbi_start_tvusec >= 1'000'000) return -1;
    // A reused PID with a different actual birth proves this original exited.
    return info.pbi_start_tvsec != seconds || info.pbi_start_tvusec != microseconds ? 1 : 0;
  }
  errno = 0;
  return kill(pid, 0) == -1 && errno == ESRCH ? 1 : -1;
#else
  return -1;
#endif
}

int main(int argc, char** argv) {
  // No argument carries policy, source bytes, provider or a selected home.
  if (argc != 1 || !argv || !argv[0]) return Refuse("arguments", -1, 64);
  const int crash_registration = AuxCaptureInheritedCrashRegistration();
  if (crash_registration != 0)
    return Refuse("inherited-crash-registration", crash_registration, 78);
#if defined(AUX_FIXED_LINKED_PTY_POLICY) || !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP
  // Supervised mode still requires actual descendant admission before user code.
  const int descendants = aux::descendants::InitializeAtFreshDaemonEntry();
  if (descendants != 0) return Refuse("task-supervision", descendants, 78);
#endif
  // The ordinary candidate never initializes ES. The separate future fixed-linked
  // variant requires the same real early observer before any user code.
  // Both retain --no-addons and current native parent-lifetime interfaces.
  // Parent, sealed image, fresh installation and selected-home checks below
  // remain mandatory. No environment or argv value can enable task rights.
  NativeLifetime lifetime;
  const mach_port_t endpoint = AuxTakeNativeParentEndpointForBootstrap();
  if (endpoint == MACH_PORT_NULL) return Refuse("rendezvous", -1, 78);
  // Endpoint ownership is transferred on every path, including preload failure.
  const auto images_status = AuxPrepareSealedNativeDaemonImages();
  if (images_status != 0) {
    mach_port_deallocate(mach_task_self(), endpoint);
    return Refuse("images", images_status, 78);
  }
  const auto parent_status = AuxCreateSealedOuterBrowserParentConnection(endpoint, &lifetime.parent);
  if (parent_status != 0 || !lifetime.parent) return Refuse("parent", parent_status, 78);
  const auto bootstrap_status = AuxCreateAuthenticatedFreshColdBootstrap(lifetime.parent, &lifetime.service);
  if (bootstrap_status != 0 || !lifetime.service) return Refuse("bootstrap", bootstrap_status, 78);
  for (;;) {
    const auto phase = AuxAdvanceAuthenticatedFreshColdBootstrap(lifetime.service,
                                                               &lifetime.provider);
    if (phase == 0 && lifetime.provider) break;
    // Advance again only for actual synchronous progress. Ambiguous/Add-lost,
    // busy/blocked/guard-stopped results are never converted to fresh retries.
    if (phase != 1) return Refuse("readiness", phase, 75);
  }
  if (!InstallReadyHomeEnvironment(lifetime)) return Refuse("ready-home", -1, 78);
  const auto export_status = AuxSendAuthenticatedFreshColdHome(lifetime.parent, lifetime.service,
                                                             kPeerTimeoutMs);
  if (export_status != 0) return Refuse("home-export", export_status, 75);
  const auto authority_status = AuxStartPreparedDaemonAuthorityServer(
      lifetime.parent, lifetime.provider, kPeerTimeoutMs);
  if (authority_status != 0) return Refuse("authority-registration", authority_status, 75);
  AuthorityLoop authority(lifetime);

  void* source = nullptr;
  uintptr_t source_length = 0;
  char* resource_url = nullptr;
  const auto entry_status = AuxCopySealedNativeDaemonEntry(&source, &source_length, &resource_url);
  if (entry_status != 0 || !source || !source_length || !resource_url) {
    free(source);
    free(resource_url);
    return Refuse("entry", entry_status, 78);
  }
  // ModuleData stores borrowed string_views. Keep both native buffers
  // alive through LoadEnvironment, the event loop and environment teardown.
  const std::unique_ptr<void, decltype(&free)> entry_source(source, &free);
  const std::unique_ptr<char, decltype(&free)> entry_resource_url(resource_url, &free);
  node::ModuleData entry;
  entry.set_source({static_cast<const char*>(entry_source.get()), source_length});
  entry.set_format(node::ModuleFormat::kModule);
  entry.set_resource_name(entry_resource_url.get());
  const auto script_path = FilePath(entry_resource_url.get());
  if (script_path.empty()) return Refuse("entry-url", -1, 78);

  // Preserve supplied Node signal/default OpenSSL/stdio behavior and the exact
  // daemon launch flags. NODE_OPTIONS cannot inject code into this native path.
  if (authority.failure()) return Refuse("authority-server", authority.failure(), 75);
  auto initialized = node::InitializeOncePerProcess(
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
      {argv[0], "--disable-sigusr1", "--use-system-ca", "--no-addons", script_path},
#else
      {argv[0], "--disable-sigusr1", "--use-system-ca", script_path},
#endif
      {node::ProcessInitializationFlags::kDisableNodeOptionsEnv});
  if (initialized->early_return()) {
    const int result = initialized->exit_code();
    authority.StopAndDrain();
    node::TearDownOncePerProcess();
    return Refuse("Node-process", result, result);
  }
  std::vector<std::string> errors;
  auto setup = node::CommonEnvironmentSetup::Create(initialized->platform(), &errors,
                                                   initialized->args(), initialized->exec_args());
  if (!setup) {
    authority.StopAndDrain();
    node::TearDownOncePerProcess();
    return Refuse("Node-environment", 1, 1);
  }
  authority.AttachActualEnvironment(setup->env());
  auto host = std::make_shared<AuxDevelopmentWorkerHost>(lifetime.provider, setup->env());
  AuxNativeEnvironmentPreload preload(host, setup->env());
  ReadyPulse pulse(lifetime, *setup);
  const auto result = RunAuxNativeNodeEnvironment(*setup, entry, preload);
  pulse.StopAndJoin();
  authority.StopAndDrain();
  // Retain every actual object while drain is unresolved; no V8 disposal from
  // a timeout, missing callback or an untracked image. No readmission/reset.
  auto drain = result.native_drain;
  while (drain != AuxDevelopmentWorkerDrain::drained) {
    std::this_thread::sleep_for(std::chrono::milliseconds(250));
    drain = preload.CloseAndDrain();
  }
  const int exit_code = pulse.failed() || authority.failure() ? 1 : result.exit_code;
  if (authority.failure()) Refuse("authority-server", authority.failure(), exit_code);
  else if (pulse.failed()) Refuse("parent-readiness", -1, exit_code);
  else if (!result.entry_loaded) Refuse("Node-entry", result.exit_code, exit_code);
  setup.reset();
  node::TearDownOncePerProcess();
  return exit_code;
}

// Actual stopped direct child of the authenticated browser parent only.
extern "C" int32_t AuxNativeHostCopyStoppedBrowserChildLifetime(
    int32_t pid,uint64_t* seconds,uint64_t* microseconds) {
  if(!seconds||!microseconds)return -1;
  *seconds=0;*microseconds=0;
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  int32_t parent=-1;uint64_t parent_seconds=0,parent_micros=0;
  if(AuxCopyOrdinaryBrowserParentLifetime(&parent,&parent_seconds,&parent_micros)!=0)return -1;
  proc_bsdinfo first{},second{};
  if(pid<=1||proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&first,sizeof(first))!=sizeof(first)||
      proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&second,sizeof(second))!=sizeof(second)||
      first.pbi_pid!=uint32_t(pid)||second.pbi_pid!=first.pbi_pid||
      first.pbi_ppid!=uint32_t(parent)||second.pbi_ppid!=first.pbi_ppid||
      first.pbi_status!=SSTOP||second.pbi_status!=SSTOP||!first.pbi_start_tvsec||
      first.pbi_start_tvusec>=1'000'000||second.pbi_start_tvsec!=first.pbi_start_tvsec||
      second.pbi_start_tvusec!=first.pbi_start_tvusec||getppid()!=parent)return -1;
  int32_t checked=-1;uint64_t checked_seconds=0,checked_micros=0;
  if(AuxCopyOrdinaryBrowserParentLifetime(&checked,&checked_seconds,&checked_micros)!=0||
      checked!=parent||checked_seconds!=parent_seconds||checked_micros!=parent_micros)return -1;
  *seconds=first.pbi_start_tvsec;*microseconds=first.pbi_start_tvusec;return 0;
#else
  return -1;
#endif
}

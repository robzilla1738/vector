// Inactive executable successor. The packaged entry's first refusal is intact.
#include "AuxNativeEndpointDelivery.h"
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
#include <vector>

// Native-only actual Swift provider C ABI, not exported to JavaScript.
extern "C" void AuxReleasePreparedFreshRuntimeProvider(uint64_t);
extern "C" int32_t AuxClosePreparedFreshRuntimeCreation(uint64_t);
// Root's strictly sealed embedded-daemon policy/image producer; no caller path.
extern "C" int32_t AuxPrepareSealedNativeDaemonImages(void);

namespace {
constexpr uint32_t kPeerTimeoutMs = 2000;
constexpr auto kPulseInterval = std::chrono::seconds(1);
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
      while (AuxClosePreparedDaemonAuthorityServer(parent) != 0)
        std::this_thread::sleep_for(std::chrono::milliseconds(250));
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
        if (environment) node::Stop(environment);
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
    while (status != 0) {
      std::this_thread::sleep_for(std::chrono::milliseconds(250));
      status = AuxClosePreparedDaemonAuthorityServer(lifetime_.parent);
    }
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
          failed_.store(true);
          // Exact Node26 Stop→ExitEnv uses atomic stopping, V8 thread-safe
          // termination and SetImmediateThreadsafe; setup stays alive until join.
          node::Stop(environment_);
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

int main(int argc, char** argv) {
  // No argument carries policy, source bytes, provider or a selected home.
  if (argc != 1 || !argv || !argv[0]) return Refuse("arguments", -1, 64);
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
  node::ModuleData entry;
  entry.set_source({static_cast<const char*>(source), source_length});
  entry.set_format(node::ModuleFormat::kModule);
  entry.set_resource_name(resource_url);
  const auto script_path = FilePath(resource_url);
  free(source);
  free(resource_url);
  if (script_path.empty()) return Refuse("entry-url", -1, 78);

  // Preserve supplied Node signal/default OpenSSL/stdio behavior and the exact
  // daemon launch flags. NODE_OPTIONS cannot inject code into this native path.
  if (authority.failure()) return Refuse("authority-server", authority.failure(), 75);
  auto initialized = node::InitializeOncePerProcess(
      {argv[0], "--disable-sigusr1", "--use-system-ca", script_path},
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
  auto host = std::make_shared<AuxDevelopmentWorkerHost>(lifetime.provider);
  AuxNativeEnvironmentPreload preload(host);
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

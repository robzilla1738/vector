// Copyright 2026 Aux Authors. All rights reserved.
// Native lifecycle: docs/spec/native/platform.md P1/P2, daemon/core.md.
#include "chrome/browser/aux/daemon_supervisor.h"

#include "base/task/sequenced_task_runner.h"
#include "base/synchronization/lock.h"

#include "build/build_config.h"
#if BUILDFLAG(IS_POSIX)
#include <cerrno>
#include <signal.h>
#include <sys/wait.h>
#endif

#include "base/command_line.h"
#include "base/environment.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/path_service.h"
#include "base/process/launch.h"
#include "base/process/process_handle.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/aux/installation_auth.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/mojom/url_response_head.mojom.h"
namespace aux {
struct DaemonLaunchAdmission {
  base::Lock lock;
  bool open = true;
  uint64_t generation = 0;
};
struct DirectDaemonDrainResult {
  bool exited = false;
  std::optional<int> exit_code;
};
namespace {
constexpr auto kAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_owned_daemon",
    R"(semantics {sender:"Aux native browser" description:"Readiness, installation authentication and shutdown of the bundled local Aux daemon." trigger:"Browser startup, local service recovery or browser exit." data:"Local health metadata, installation challenge signature and short-lived authorization token." destination:LOCAL} policy {cookies_allowed:NO setting:"Required local Aux browser infrastructure." policy_exception_justification:"No remote service is contacted."})");
}  // namespace

base::Process DaemonSupervisor::RunAdmittedLaunch(
    std::shared_ptr<DaemonLaunchAdmission> admission,
    uint64_t generation,
    base::OnceCallback<base::Process()> launch) {
  if (peer::ReadNativeSelectedStateHome().route != peer::SelectedStateHomeRoute::unselected)
    return base::Process();
  base::AutoLock hold(admission->lock);
  if (!admission->open || admission->generation != generation) {
    return base::Process();
  }
  return std::move(launch).Run();
}

base::Process DaemonSupervisor::Launch(const BundlePaths& paths,
                     const base::FilePath& home,
                     uint16_t port,
                     bool allow_fallback,
                     std::shared_ptr<DaemonLaunchAdmission> admission,
                     uint64_t generation) {
  const auto root = base::MakeAbsoluteFilePath(paths.root);
  auto valid = [&](const base::FilePath& path) {
    const auto absolute = base::MakeAbsoluteFilePath(path);
    return !root.empty() && !absolute.empty() && root.IsParent(absolute) &&
           base::PathExists(absolute);
  };
  if (!valid(paths.agent_extension.AppendASCII("manifest.json"))) {
    return base::Process();
  }
  base::FilePath executable = paths.daemon_executable;
  if (allow_fallback) {
    // Explicit development mode runs the supplied code, never the retired
    // independent daemon. Missing resources are an actual launch failure.
    executable = paths.node;
  }
  if (!valid(executable) ||
      (executable == paths.node && !valid(paths.daemon_script))) {
    return base::Process();
  }
  base::CommandLine command(executable);
  if (executable == paths.node) {
    // Exact Node execution arguments from the supplied daemon SEA tail.
    command.AppendArg("--disable-sigusr1");
    command.AppendArg("--use-system-ca");
    command.AppendArgPath(paths.daemon_script);
  }
  base::LaunchOptions options;
  const auto canonical_home = base::MakeAbsoluteFilePath(home);
  const auto boundary = base::MakeAbsoluteFilePath(
      paths.root.AppendASCII("native/libaux-native-boundary.dylib"));
  int boundary_mode = 0;
  if (!home.IsAbsolute() || canonical_home.empty() || boundary.empty() ||
      !root.IsParent(boundary) ||
      !base::GetPosixFilePermissions(boundary, &boundary_mode) ||
      (boundary_mode & 0022)) return base::Process();
  options.environment["AUX_HOME"] = canonical_home.value();
  options.environment["DYLD_INSERT_LIBRARIES"] = boundary.value();
  // Runtime acceptance is inherited only; never manufacture it at startup.
  options.environment["AUX_PORT"] = base::NumberToString(port);
  // Bind supplied runtime discovery to this browser, never inherited endpoints.
  options.environment["AUX_HOST"] = "127.0.0.1";
  options.environment["AUX_BROWSER_CDP_HOST"] = "127.0.0.1:45203";
  options.environment["DAEMON_BASE_URL"] =
      "http://127.0.0.1:" + base::NumberToString(port);
  options.environment["AUX_BROWSER_PID"] =
      base::NumberToString(base::GetCurrentProcId());
  options.environment["AUX_HELPER_PATH"] =
      paths.root
          .AppendASCII(
              "apps/computer-use/Aux Computer "
              "Use.app/Contents/MacOS/aux-computer-use")
          .value();
  // Supplied lazy installer provisions the private mutable runtime cache.
  options.environment["AUX_AGENT_RUNTIME_DIR"] =
      canonical_home.AppendASCII("runtime").value();
  options.environment["AUX_COMPUTER_USE_SOURCE_APP"] =
      paths.root.AppendASCII("apps/computer-use/Aux Computer Use.app").value();
  const base::FilePath runtime = canonical_home.AppendASCII("runtime");
  std::string path = runtime.AppendASCII("bin").value();
  if (auto inherited = base::Environment::Create()->GetVar("PATH")) {
    path += ":" + *inherited;
  }
  options.environment["PATH"] = path;
  options.current_directory = paths.root;
  // Execute the actual spawn under the same generation lock as quiesce.
  // The closure owns its bound arguments and runs synchronously under the gate.
  return RunAdmittedLaunch(
      std::move(admission), generation,
      base::BindOnce([](const base::CommandLine& command,
                        const base::LaunchOptions& options) {
        return base::LaunchProcess(command, options);
      }, command, options));
}
namespace {
DirectDaemonDrainResult StopVerified(base::Process process,
                                     base::Time created,
                                     const base::FilePath& root) {
  int exit_code = -1;
  if (!process.IsValid()) return {};
  if (process.WaitForExitWithTimeout(base::Seconds(3), &exit_code)) {
    // POSIX Process may synthesize zero when a child was already reaped or a
    // non-child disappears. Its API cannot distinguish that from observed zero.
    return {true, exit_code == 0 ? std::nullopt : std::optional<int>(exit_code)};
  }
  const auto executable = base::GetProcessExecutablePath(process.Handle());
  const auto canonical_root = base::MakeAbsoluteFilePath(root);
  if (!canonical_root.empty() && !executable.empty() &&
      canonical_root.IsParent(base::MakeAbsoluteFilePath(executable)) &&
      base::GetParentProcessId(process.Handle()) == base::GetCurrentProcId() &&
      !created.is_null() && process.CreationTime() == created &&
      process.Terminate(0, false) &&
      process.WaitForExitWithTimeout(base::Seconds(2), &exit_code)) {
    // POSIX Process may synthesize zero when a child was already reaped or a
    // non-child disappears. Its API cannot distinguish that from observed zero.
    return {true, exit_code == 0 ? std::nullopt : std::optional<int>(exit_code)};
  }
  // Failure retains the original process handle in the UI-sequence owner.
  return {};
}
}  // namespace
std::optional<BundlePaths> BundlePaths::FromBrowserExecutable() {
  base::FilePath executable;
  if (!base::PathService::Get(base::FILE_EXE, &executable)) {
    return std::nullopt;
  }
  const auto contents = executable.DirName().DirName();
  if (contents.BaseName().value() != "Contents") {
    return std::nullopt;
  }
  BundlePaths paths;
  paths.root = contents.AppendASCII("Resources/aux");
  paths.daemon_executable = paths.root.AppendASCII(
      "apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon");
  paths.node = paths.root.AppendASCII("agent-runtime/node/bin/node");
  paths.daemon_script = paths.root.AppendASCII(
      "apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs");
  paths.agent_extension = paths.root.AppendASCII("apps/extension/dist");
  paths.vault_extension = paths.root.AppendASCII("apps/vault/dist");
  std::string marker;
  if (!base::ReadFileToString(paths.root.AppendASCII("bundle.json"), &marker)) {
    return std::nullopt;
  }
  auto bundle = base::JSONReader::ReadDict(marker, base::JSON_PARSE_RFC);
  if (!bundle || bundle->FindInt("version") != 1 ||
      !bundle->FindString("implementation") ||
      *bundle->FindString("implementation") != "supplied") {
    return std::nullopt;
  }
  if (const auto* runtime = bundle->FindString("daemonRuntime")) {
    if (*runtime == "provided-node-development") {
      paths.daemon_executable = paths.node;
    } else if (*runtime != "provided-sea") {
      return std::nullopt;
    }
  }
  return paths;
}
DaemonSupervisor::DaemonSupervisor(
    BundlePaths paths,
    base::FilePath home,
    uint16_t port,
    scoped_refptr<network::SharedURLLoaderFactory> factory,
    StateCallback changed,
    bool allow_node_fallback)
    : paths_(std::move(paths)),
      home_(std::move(home)),
      port_(port),
      factory_(std::move(factory)),
      changed_(std::move(changed)),
      allow_node_fallback_(allow_node_fallback),
      launch_admission_(std::make_shared<DaemonLaunchAdmission>()) {}
DaemonSupervisor::~DaemonSupervisor() = default;
std::unique_ptr<DaemonSupervisor> DaemonSupervisor::AdoptInstalledNativeChild(
    BundlePaths paths, uint16_t port,
    scoped_refptr<network::SharedURLLoaderFactory> factory, StateCallback changed) {
  auto selected = peer::ReadNativeSelectedStateHome();
  if (selected.route != peer::SelectedStateHomeRoute::current || selected.child_pid <= 1) return {};
  auto supervisor = std::make_unique<DaemonSupervisor>(
      std::move(paths), selected.path, port, std::move(factory), std::move(changed));
  supervisor->adopted_native_child_ = true;
  return supervisor;
}
std::optional<int> DaemonSupervisor::OwnedDaemonPid() const {
  if (!adopted_native_child_) return process_.IsValid() ? std::make_optional(process_.Pid()) : std::nullopt;
  auto selected = peer::ReadNativeSelectedStateHome();
  if (selected.route != peer::SelectedStateHomeRoute::current || selected.path != home_ ||
      selected.child_pid <= 1) return std::nullopt;
  return selected.child_pid;
}
bool DaemonSupervisor::CheckNativeSelection() {
  if (!adopted_native_child_ || OwnedDaemonPid()) return true;
  healthy_ = false;
  authorization_.clear();
  token_expires_ = base::TimeTicks();
  CompleteAuthorizationRequests(std::nullopt);
  auto selected = peer::ReadNativeSelectedStateHome();
  if (selected.route == peer::SelectedStateHomeRoute::closed ||
      selected.route == peer::SelectedStateHomeRoute::wrongProcess) {
    admission_closed_ = true;
    SetState(State::kFailed, "Selected native daemon closed");
    return false;
  }
  SetState(State::kStarting, "Waiting for current native provider readiness");
  timer_.Start(FROM_HERE, base::Milliseconds(250), this, &DaemonSupervisor::Poll);
  return false;
}
bool DaemonSupervisor::healthy() const {
  return healthy_ && (!adopted_native_child_ || OwnedDaemonPid().has_value());
}
const std::string& DaemonSupervisor::authorization() const {
  static const auto* empty = new std::string;
  if (adopted_native_child_ && !OwnedDaemonPid()) return *empty;
  return authorization_;
}
void DaemonSupervisor::SetState(State state, std::string error) {
  if (state_ != state) {
    LOG(INFO) << "Aux daemon state " << static_cast<int>(state)
              << " pid=" << OwnedDaemonPid().value_or(0)
              << " " << error;
  }
  state_ = state;
  if (state == State::kReady) {
    CompleteAuthorizationRequests(authorization_.empty()
                                      ? std::nullopt
                                      : std::make_optional(authorization_));
  } else if (state == State::kFailed || state == State::kStopping ||
             state == State::kStopped) {
    CompleteAuthorizationRequests(std::nullopt);
  }
  changed_.Run(state, std::move(error));
}
void DaemonSupervisor::Start() {
  if (adopted_native_child_) {
    if (admission_closed_ || (state_ != State::kStopped && state_ != State::kFailed)) return;
    if (!OwnedDaemonPid()) {
      SetState(State::kFailed, "Selected native daemon is unavailable");
      return;
    }
    activation_deadline_ = base::TimeTicks::Now() + base::Seconds(90);
    SetState(State::kStarting);
    Poll();
    return;  // Never launch/restart/reap a second Process for this native child.
  }
  if (peer::ReadNativeSelectedStateHome().route != peer::SelectedStateHomeRoute::unselected) {
    SetState(State::kFailed, "Selected native route refuses legacy daemon launch");
    return;
  }
  if (admission_closed_ || launch_pending_ || process_.IsValid() ||
      (state_ != State::kStopped && state_ != State::kFailed)) {
    return;
  }
  if (state_ == State::kFailed) {
    activation_deadline_ = base::TimeTicks();
  }
  if (!activation_deadline_.is_null() &&
      base::TimeTicks::Now() >= activation_deadline_) {
    SetState(State::kFailed, "Bundled daemon repeatedly exited before readiness");
    return;
  }
  healthy_ = false;
  SetState(State::kStarting);
  launch_pending_ = true;
  {
    base::AutoLock hold(launch_admission_->lock);
    launch_generation_ = ++launch_admission_->generation;
  }
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&Launch, paths_, home_, port_, allow_node_fallback_,
                     launch_admission_, launch_generation_),
      base::BindOnce(&DaemonSupervisor::DidLaunch, weak_.GetWeakPtr(),
                     launch_generation_));
}
void DaemonSupervisor::DidLaunch(uint64_t generation, base::Process process) {
  launch_pending_ = false;
  if (admission_closed_ || generation != launch_generation_ ||
      state_ == State::kStopping) {
    process_ = std::move(process);
    process_created_ =
        process_.IsValid() ? process_.CreationTime() : base::Time();
    FinishShutdown();
    return;
  }
  if (!process.IsValid()) {
    SetState(State::kFailed, "Bundled Aux components are unavailable");
    return;
  }
  process_ = std::move(process);
  process_created_ = process_.CreationTime();
  // Begin the cold-start allowance when the launched child is available, not
  // while its blocking launch task is still waiting for a worker.
  if (activation_deadline_.is_null()) {
    activation_deadline_ = base::TimeTicks::Now() + base::Seconds(90);
  }
  Poll();
}
void DaemonSupervisor::Request(
    std::string path,
    std::optional<std::string> body,
    base::OnceCallback<void(std::optional<std::string>)> done,
    std::optional<std::string> authorization_override) {
  if (adopted_native_child_ && !OwnedDaemonPid()) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(done), std::nullopt));
    return;
  }
  auto request = std::make_unique<network::ResourceRequest>();
  request->url = GURL("http://127.0.0.1:" + base::NumberToString(port_) + path);
  request->credentials_mode = network::mojom::CredentialsMode::kOmit;
  request->redirect_mode = network::mojom::RedirectMode::kError;
  const auto& authorization =
      authorization_override ? *authorization_override : authorization_;
  if (!authorization.empty()) {
    request->headers.SetHeader("Authorization", authorization);
  }
  if (body) {
    request->method = "POST";
  }
  loader_ = network::SimpleURLLoader::Create(std::move(request), kAnnotation);
  loader_->SetTimeoutDuration(base::Seconds(2));
  if (body) {
    loader_->AttachStringForUpload(*body, "application/json");
  }
  loader_->DownloadToString(factory_.get(), std::move(done), 65536);
}
void DaemonSupervisor::Poll() {
  if (admission_closed_ || !CheckNativeSelection()) return;
  Request("/health", std::nullopt,
          base::BindOnce(&DaemonSupervisor::DidReadHealth, weak_.GetWeakPtr()));
}
void DaemonSupervisor::DidReadHealth(std::optional<std::string> body) {
  if (admission_closed_ || state_ == State::kStopping) {
    return;
  }
  auto health = body ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                     : std::nullopt;
  const auto owned_pid = OwnedDaemonPid();
  const bool healthy = owned_pid && health && health->FindString("service") &&
                       *health->FindString("service") == "aux-daemon" &&
                       health->FindString("version") &&
                       *health->FindString("version") == "1.26.1016.1852" &&
                       health->FindBool("ready").value_or(false) &&
                       health->FindInt("pid") == *owned_pid;
  healthy_ = healthy;
  if (healthy) {
    if (authorization_.empty() ||
        token_expires_ <= base::TimeTicks::Now() + base::Minutes(5)) {
      Authenticate();
      return;
    }
    SetState(State::kReady);
    timer_.Start(FROM_HERE, base::Milliseconds(250), this, &DaemonSupervisor::Poll);
    return;
  }
  if (state_ == State::kReady) {
    authorization_.clear();
    SetState(State::kStarting);
    activation_deadline_ = base::TimeTicks::Now() + base::Seconds(90);
  }
  if (base::TimeTicks::Now() >= activation_deadline_) {
    SetState(State::kFailed, "Bundled daemon did not become ready");
    return;
  }
  if (adopted_native_child_) {
    timer_.Start(FROM_HERE, base::Milliseconds(250), this, &DaemonSupervisor::Poll);
    return;  // Its genuine native owner alone may observe/reap this child.
  }
  // Only restart a child after its freshly observed exit. Never adopt a health
  // PID.
  int exit_code = -1;
  bool exited =
      process_.WaitForExitWithTimeout(base::TimeDelta(), &exit_code);
#if BUILDFLAG(IS_POSIX)
  // Another child reaper can consume waitpid's exit status. ESRCH still proves
  // the original PID is absent; signal zero never sends a process signal.
  if (!exited && kill(process_.Pid(), 0) != 0 && errno == ESRCH) exited = true;
#endif
  if (!exited && !process_created_.is_null()) {
    const auto current = process_.CreationTime();
    // A reused PID is not our original child. Never signal or adopt it.
    exited = !current.is_null() && current != process_created_;
  }
  if (exited) {
    process_.Close();
    SetState(State::kStopped,
             "Bundled daemon exited before readiness (exit " +
                 base::NumberToString(exit_code) + ")");
    timer_.Start(FROM_HERE, base::Milliseconds(500), this,
                 &DaemonSupervisor::Start);
    return;
  }
  timer_.Start(FROM_HERE, base::Milliseconds(250), this,
               &DaemonSupervisor::Poll);
}
void DaemonSupervisor::CompleteAuthorizationRequests(
    std::optional<std::string> result) {
  auto waiters = std::move(authorization_waiters_);
  authorization_waiters_.clear();
  for (auto& waiter : waiters) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(waiter), result));
  }
}
void DaemonSupervisor::RequestAuthorization(bool force,
                                            AuthorizationCallback callback) {
  if (force) {
    authorization_.clear();
    token_expires_ = base::TimeTicks();
  }
  if (admission_closed_ || !healthy() || !OwnedDaemonPid() || state_ == State::kStopping ||
      state_ == State::kStopped) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), std::nullopt));
    return;
  }
  if (state_ != State::kAuthenticating && !force &&
      !authorization_.empty() && token_expires_ > base::TimeTicks::Now()) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback),
                                 std::make_optional(authorization_)));
    return;
  }
  authorization_waiters_.push_back(std::move(callback));
  if (state_ == State::kAuthenticating) {
    return;
  }
  // The supervisor has one loader: cancel a pending health poll before its
  // actual challenge/session exchange; never overlap two exchanges.
  timer_.Stop();
  loader_.reset();
  Authenticate();
}
void DaemonSupervisor::Authenticate() {
  if (admission_closed_ || !CheckNativeSelection()) return;
  SetState(State::kAuthenticating);
  if (adopted_native_child_ && native_challenge_id_ && native_challenge_) {
    ObserveNativeSignature();
    return;
  }
  Request(
      "/auth/daemon/challenge?clientKind=chromium", std::nullopt,
      base::BindOnce(&DaemonSupervisor::DidReadChallenge, weak_.GetWeakPtr()));
}
void DaemonSupervisor::DidReadChallenge(std::optional<std::string> body) {
  if (admission_closed_ || !CheckNativeSelection()) return;
  auto value = body ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                    : std::nullopt;
  const auto* id = value ? value->FindString("challengeId") : nullptr;
  const auto* challenge = value ? value->FindString("challenge") : nullptr;
  if (!id || id->empty() || !challenge || challenge->empty()) {
    SetState(State::kFailed, "Daemon authentication challenge unavailable");
    return;
  }
  if (adopted_native_child_) {
    if (native_challenge_id_ || native_challenge_) {
      SetState(State::kFailed, "A native daemon challenge is already pending");
      return;
    }
    native_challenge_id_ = *id;
    native_challenge_ = *challenge;
    ObserveNativeSignature();
    return;
  }
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock(), base::WithBaseSyncPrimitives()},
      base::BindOnce(&SignDaemonChallenge, home_, *challenge),
      base::BindOnce(&DaemonSupervisor::DidSignChallenge, weak_.GetWeakPtr(),
                     *id));
}
void DaemonSupervisor::ObserveNativeSignature() {
  if (admission_closed_ || native_sign_inflight_ || !native_challenge_id_ || !native_challenge_ ||
      !CheckNativeSelection()) return;
  if (native_completed_signature_) {
    DidSignChallenge(*native_challenge_id_, native_completed_signature_);
    return;
  }
  native_sign_inflight_ = true;
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock(), base::WithBaseSyncPrimitives()},
      base::BindOnce(&ObserveNativeDaemonChallenge, *native_challenge_),
      base::BindOnce(&DaemonSupervisor::DidObserveNativeSignature, weak_.GetWeakPtr(),
                     *native_challenge_id_, *native_challenge_));
}
void DaemonSupervisor::DidObserveNativeSignature(
    std::string id, std::string challenge, peer::NativeDaemonSignatureReply reply) {
  native_sign_inflight_ = false;
  if (admission_closed_ || !native_challenge_id_ || !native_challenge_ ||
      *native_challenge_id_ != id || *native_challenge_ != challenge) return;
  // Keep the genuine completed response before the UI-sequence publication
  // fence. Another finite operation may advance its transport cache later.
  if (reply.status == peer::DaemonAuthorityStatus::ready && reply.signature)
    native_completed_signature_ = std::move(reply.signature);
  if (!CheckNativeSelection()) return;
  switch (reply.status) {
    case peer::DaemonAuthorityStatus::ready:
      if (!native_completed_signature_) {
        SetState(State::kFailed, "Native daemon signature response is invalid");
        return;
      }
      DidSignChallenge(std::move(id), native_completed_signature_);
      return;
    case peer::DaemonAuthorityStatus::pending:
    case peer::DaemonAuthorityStatus::busy:
    case peer::DaemonAuthorityStatus::timedOut:
      // The native peer retains the exact nonce/body. Re-entering this finite
      // method observes that same attempt; never fetch a new server challenge.
      timer_.Start(FROM_HERE, base::Milliseconds(250), this, &DaemonSupervisor::ObserveNativeSignature);
      return;
    case peer::DaemonAuthorityStatus::refused:
    case peer::DaemonAuthorityStatus::closed:
    case peer::DaemonAuthorityStatus::wrongProcess:
    case peer::DaemonAuthorityStatus::cleanupUnresolved:
      SetState(State::kFailed, "Native daemon authority refused the pending challenge");
      return;
  }
}
void DaemonSupervisor::DidSignChallenge(std::string id,
                                        std::optional<std::string> signature) {
  if (admission_closed_ || state_ == State::kStopping || !CheckNativeSelection()) {
    return;
  }
  if (!signature) {
    SetState(State::kFailed, "Installation signing key missing or unsafe");
    return;
  }
  base::DictValue input;
  input.Set("challengeId", id);
  input.Set("signedChallenge", *signature);
  Request(
      "/auth/daemon/session", base::WriteJson(input),
      base::BindOnce(&DaemonSupervisor::DidReadSession, weak_.GetWeakPtr()));
}
void DaemonSupervisor::DidReadSession(std::optional<std::string> body) {
  if (admission_closed_ || !CheckNativeSelection()) return;
  auto value = body ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                    : std::nullopt;
  const auto* type = value ? value->FindString("token_type") : nullptr;
  const auto* token = value ? value->FindString("access_token") : nullptr;
  const auto seconds =
      value ? value->FindInt("expiresInSeconds") : std::nullopt;
  if (!type || *type != "AuxDaemonSessionToken" || !token || token->empty() ||
      !seconds || *seconds <= 0) {
    authorization_.clear();
    SetState(State::kFailed, "Daemon installation authorization failed");
    return;
  }
  if (adopted_native_child_) {
    native_challenge_id_.reset();
    native_challenge_.reset();
    native_completed_signature_.reset();
  }
  authorization_ = "AuxDaemonSessionToken " + *token;
  token_expires_ = base::TimeTicks::Now() + base::Seconds(*seconds);
  SetState(State::kReady);
  timer_.Start(FROM_HERE, base::Milliseconds(250), this, &DaemonSupervisor::Poll);
}
void DaemonSupervisor::QuiesceDirectDaemonForMigration(
    DirectDaemonQuiesceCallback done) {
  // Close admission synchronously, before any callback or asynchronous drain.
  admission_closed_ = true;
  {
    base::AutoLock hold(launch_admission_->lock);
    launch_admission_->open = false;
    launch_generation_ = ++launch_admission_->generation;
  }
  if (quiesce_result_) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(done), *quiesce_result_));
    return;
  }
  quiesce_waiters_.push_back(std::move(done));
  if (state_ == State::kStopping) return;
  healthy_ = false;
  timer_.Stop();
  loader_.reset();
  auto shutdown_authorization = std::move(authorization_);
  authorization_.clear();
  token_expires_ = base::TimeTicks();
  SetState(State::kStopping);
  if (launch_pending_) return;  // DidLaunch must collect even a stale child.
  if (adopted_native_child_) {
    Request("/shutdown", std::string("{}"),
            base::BindOnce([](base::WeakPtr<DaemonSupervisor> self, std::optional<std::string>) {
              if (self) self->FinishShutdown();
            }, weak_.GetWeakPtr()), std::move(shutdown_authorization));
    return;
  }
  if (!process_.IsValid()) {
    DidFinishShutdown({true, std::nullopt});
    return;
  }
  Request("/shutdown", std::string("{}"),
          base::BindOnce(
              [](base::WeakPtr<DaemonSupervisor> self,
                 std::optional<std::string>) {
                if (self) self->FinishShutdown();
              }, weak_.GetWeakPtr()), std::move(shutdown_authorization));
}
void DaemonSupervisor::Shutdown(base::OnceClosure done) {
  QuiesceDirectDaemonForMigration(base::BindOnce(
      [](base::OnceClosure done, DirectDaemonQuiesceResult) {
        std::move(done).Run();
      }, std::move(done)));
}
void DaemonSupervisor::FinishShutdown() {
  if (adopted_native_child_) {
    FinishNativeShutdown();
    return;
  }
  if (drain_pending_) return;
  loader_.reset();
  if (!process_.IsValid()) {
    DidFinishShutdown({true, std::nullopt});
    return;
  }
  drain_pending_ = true;
  // Keep the original owned handle even if waiting or ownership validation fails.
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock(), base::WithBaseSyncPrimitives()},
      base::BindOnce(&StopVerified, process_.Duplicate(), process_created_,
                     paths_.root),
      base::BindOnce(&DaemonSupervisor::DidFinishShutdown, weak_.GetWeakPtr()));
}
void DaemonSupervisor::FinishNativeShutdown() {
  loader_.reset();
  if (native_shutdown_deadline_.is_null())
    native_shutdown_deadline_ = base::TimeTicks::Now() + base::Seconds(5);
  native_close_observation_ = peer::CloseNativeSelectedStateHome();
  const auto& closed = *native_close_observation_;
  const bool exited = closed.child_close && closed.child_close->exit_observed_and_reaped &&
      !closed.child_close->exit_ownership_unknown && !closed.monitor_running &&
      !closed.monitor_join_pending && !closed.initialization_pending && !closed.active_reads;
  if (exited) {
    std::optional<int> code;
#if BUILDFLAG(IS_POSIX)
    if (WIFEXITED(closed.child_close->wait_status)) code = WEXITSTATUS(closed.child_close->wait_status);
#endif
    DidFinishShutdown({true, code});
    return;
  }
  if (base::TimeTicks::Now() < native_shutdown_deadline_) {
    timer_.Start(FROM_HERE, base::Milliseconds(250), this, &DaemonSupervisor::FinishNativeShutdown);
    return;
  }
  DidFinishShutdown({false, std::nullopt});  // Actual native owner/pending observations stay retained.
}
void DaemonSupervisor::DidFinishShutdown(DirectDaemonDrainResult drained) {
  drain_pending_ = false;
  const bool owned = adopted_native_child_ || process_.IsValid();
  DirectDaemonQuiesceResult result;
  result.outcome = !drained.exited
                       ? DirectDaemonQuiesceResult::Outcome::kDrainFailed
                       : owned ? DirectDaemonQuiesceResult::Outcome::kExited
                               : DirectDaemonQuiesceResult::Outcome::kNoOwnedProcess;
  result.exit_code = drained.exit_code;
  if (drained.exited && process_.IsValid()) process_.Close();
  authorization_.clear();
  activation_deadline_ = base::TimeTicks();
  quiesce_result_ = result;
  SetState(drained.exited ? State::kStopped : State::kFailed,
           drained.exited ? std::string()
                          : "Owned direct daemon drain could not be verified");
  auto waiters = std::move(quiesce_waiters_);
  for (auto& waiter : waiters) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(waiter), result));
  }
}
}  // namespace aux

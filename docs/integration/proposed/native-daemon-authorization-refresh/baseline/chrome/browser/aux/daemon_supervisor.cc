// Copyright 2026 Aux Authors. All rights reserved.
// Native lifecycle: docs/spec/native/platform.md P1/P2, daemon/core.md.
#include "chrome/browser/aux/daemon_supervisor.h"

#include "build/build_config.h"
#if BUILDFLAG(IS_POSIX)
#include <cerrno>
#include <signal.h>
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
namespace {
constexpr auto kAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_owned_daemon",
    R"(semantics {sender:"Aux native browser" description:"Readiness, installation authentication and shutdown of the bundled local Aux daemon." trigger:"Browser startup, local service recovery or browser exit." data:"Local health metadata, installation challenge signature and short-lived authorization token." destination:LOCAL} policy {cookies_allowed:NO setting:"Required local Aux browser infrastructure." policy_exception_justification:"No remote service is contacted."})");
base::Process Launch(const BundlePaths& paths,
                     const base::FilePath& home,
                     uint16_t port,
                     bool allow_fallback) {
  const auto root = base::MakeAbsoluteFilePath(paths.root);
  auto valid = [&](const base::FilePath& path) {
    const auto absolute = base::MakeAbsoluteFilePath(path);
    return !root.empty() && !absolute.empty() && root.IsParent(absolute) &&
           base::PathExists(absolute);
  };
  if (!valid(paths.agent_extension.AppendASCII("manifest.json")) ||
      !valid(paths.vault_extension.AppendASCII("manifest.json"))) {
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
  return base::LaunchProcess(command, options);
}
bool StopVerified(base::Process process,
                  base::Time created,
                  const base::FilePath& root) {
  if (!process.IsValid() ||
      process.WaitForExitWithTimeout(base::Seconds(3), nullptr)) {
    return true;
  }
  const auto executable = base::GetProcessExecutablePath(process.Handle());
  const auto canonical_root = base::MakeAbsoluteFilePath(root);
  if (!canonical_root.empty() && !executable.empty() &&
      canonical_root.IsParent(base::MakeAbsoluteFilePath(executable)) &&
      base::GetParentProcessId(process.Handle()) == base::GetCurrentProcId() &&
      !created.is_null() && process.CreationTime() == created) {
    return process.Terminate(0, false) &&
           process.WaitForExitWithTimeout(base::Seconds(2), nullptr);
  }
  return false;
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
      allow_node_fallback_(allow_node_fallback) {}
DaemonSupervisor::~DaemonSupervisor() = default;
void DaemonSupervisor::SetState(State state, std::string error) {
  if (state_ != state) {
    LOG(INFO) << "Aux daemon state " << static_cast<int>(state)
              << " pid=" << (process_.IsValid() ? process_.Pid() : 0)
              << " " << error;
  }
  state_ = state;
  changed_.Run(state, std::move(error));
}
void DaemonSupervisor::Start() {
  if (process_.IsValid() ||
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
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&Launch, paths_, home_, port_, allow_node_fallback_),
      base::BindOnce(&DaemonSupervisor::DidLaunch, weak_.GetWeakPtr()));
}
void DaemonSupervisor::DidLaunch(base::Process process) {
  launch_pending_ = false;
  if (state_ == State::kStopping) {
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
    base::OnceCallback<void(std::optional<std::string>)> done) {
  auto request = std::make_unique<network::ResourceRequest>();
  request->url = GURL("http://127.0.0.1:" + base::NumberToString(port_) + path);
  request->credentials_mode = network::mojom::CredentialsMode::kOmit;
  request->redirect_mode = network::mojom::RedirectMode::kError;
  if (!authorization_.empty()) {
    request->headers.SetHeader("Authorization", authorization_);
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
  Request("/health", std::nullopt,
          base::BindOnce(&DaemonSupervisor::DidReadHealth, weak_.GetWeakPtr()));
}
void DaemonSupervisor::DidReadHealth(std::optional<std::string> body) {
  if (state_ == State::kStopping) {
    return;
  }
  auto health = body ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                     : std::nullopt;
  const bool healthy = health && health->FindString("service") &&
                       *health->FindString("service") == "aside-daemon" &&
                       health->FindString("version") &&
                       *health->FindString("version") == "1.26.1016.1852" &&
                       health->FindBool("ready").value_or(false) &&
                       health->FindInt("pid") == process_.Pid();
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
void DaemonSupervisor::Authenticate() {
  SetState(State::kAuthenticating);
  Request(
      "/auth/daemon/challenge?clientKind=chromium", std::nullopt,
      base::BindOnce(&DaemonSupervisor::DidReadChallenge, weak_.GetWeakPtr()));
}
void DaemonSupervisor::DidReadChallenge(std::optional<std::string> body) {
  auto value = body ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                    : std::nullopt;
  const auto* id = value ? value->FindString("challengeId") : nullptr;
  const auto* challenge = value ? value->FindString("challenge") : nullptr;
  if (!id || id->empty() || !challenge || challenge->empty()) {
    SetState(State::kFailed, "Daemon authentication challenge unavailable");
    return;
  }
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&SignDaemonChallenge, home_, *challenge),
      base::BindOnce(&DaemonSupervisor::DidSignChallenge, weak_.GetWeakPtr(),
                     *id));
}
void DaemonSupervisor::DidSignChallenge(std::string id,
                                        std::optional<std::string> signature) {
  if (state_ == State::kStopping) {
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
  auto value = body ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                    : std::nullopt;
  const auto* type = value ? value->FindString("token_type") : nullptr;
  const auto* token = value ? value->FindString("access_token") : nullptr;
  const auto seconds =
      value ? value->FindInt("expiresInSeconds") : std::nullopt;
  if (!type || *type != "AsideDaemonSessionToken" || !token || token->empty() ||
      !seconds || *seconds <= 0) {
    authorization_.clear();
    SetState(State::kFailed, "Daemon installation authorization failed");
    return;
  }
  authorization_ = "AsideDaemonSessionToken " + *token;
  token_expires_ = base::TimeTicks::Now() + base::Seconds(*seconds);
  SetState(State::kReady);
  timer_.Start(FROM_HERE, base::Milliseconds(250), this, &DaemonSupervisor::Poll);
}
void DaemonSupervisor::Shutdown(base::OnceClosure done) {
  healthy_ = false;
  timer_.Stop();
  shutdown_done_ = std::move(done);
  SetState(State::kStopping);
  if (launch_pending_) {
    return;
  }
  if (!process_.IsValid()) {
    DidFinishShutdown(true);
    return;
  }
  Request(
      "/shutdown", std::string("{}"),
      base::BindOnce(
          [](base::WeakPtr<DaemonSupervisor> self, std::optional<std::string>) {
            if (self) {
              self->FinishShutdown();
            }
          },
          weak_.GetWeakPtr()));
}
void DaemonSupervisor::FinishShutdown() {
  loader_.reset();
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&StopVerified, std::move(process_), process_created_,
                     paths_.root),
      base::BindOnce(&DaemonSupervisor::DidFinishShutdown, weak_.GetWeakPtr()));
}
void DaemonSupervisor::DidFinishShutdown(bool stopped) {
  authorization_.clear();
  activation_deadline_ = base::TimeTicks();
  SetState(
      stopped ? State::kStopped : State::kFailed,
      stopped ? std::string() : "Owned daemon could not be safely stopped");
  if (shutdown_done_) {
    std::move(shutdown_done_).Run();
  }
}
}  // namespace aux

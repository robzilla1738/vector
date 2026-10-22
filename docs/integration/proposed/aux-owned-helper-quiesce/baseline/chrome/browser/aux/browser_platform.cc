// Copyright 2026 Aux Authors. All rights reserved.
// Supplied startup separates component readiness from daemon authentication.
#include "chrome/browser/aux/browser_platform.h"

#include "base/command_line.h"
#include "base/environment.h"
#include "base/functional/bind.h"
#include "base/logging.h"
#include "base/run_loop.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/thread_pool.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/aux/installation_auth.h"
namespace aux {
BrowserPlatform::BrowserPlatform() = default;
BrowserPlatform::~BrowserPlatform() = default;
BrowserPlatform& BrowserPlatform::Get() {
  static base::NoDestructor<BrowserPlatform> instance;
  return *instance;
}
bool BrowserPlatform::Start(
    scoped_refptr<network::SharedURLLoaderFactory> factory) {
  if (direct_daemon_admission_closed_) return false;
  if (supervisor_) {
    return components_.size() == 1;
  }
  auto paths = BundlePaths::FromBrowserExecutable();
  if (!paths) {
    return false;
  }
  auto home = StateHome();
  if (home.empty()) {
    return false;
  }
  base::RunLoop components_loop;
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&ReadBundledComponents, *paths),
      base::BindOnce(
          [](BrowserPlatform* self, base::OnceClosure quit,
             std::optional<std::vector<ComponentManifest>> components) {
            if (components) {
              self->components_ = std::move(*components);
            }
            std::move(quit).Run();
          },
          base::Unretained(this), components_loop.QuitClosure()));
  components_loop.Run();
  // A migration quiesce may run while the nested startup loop is waiting.
  if (direct_daemon_admission_closed_) return false;
  if (components_.size() != 1) {
    LOG(ERROR) << "Aux bundled extension resources are missing or invalid";
    return false;
  }
  uint16_t port = 21520;
  auto env = base::Environment::Create();
  if (auto text = env->GetVar("AUX_PORT"); text) {
    unsigned number = 0;
    if (!base::StringToUint(*text, &number) || number == 0 || number > 65535) {
      return false;
    }
    port = number;
  }
  supervisor_ = std::make_unique<DaemonSupervisor>(
      *paths, home, port, std::move(factory),
      base::BindRepeating(&BrowserPlatform::DidChangeDaemonState,
                          weak_.GetWeakPtr()),
      base::CommandLine::ForCurrentProcess()->HasSwitch(
          "aux-development-runtime"));
  supervisor_->Start();
  return true;
}
void BrowserPlatform::RequestDaemonAuthorization(
    bool force, DaemonAuthorizationCallback callback) {
  if (direct_daemon_admission_closed_ || !supervisor_) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), std::nullopt));
    return;
  }
  supervisor_->RequestAuthorization(force, std::move(callback));
}
base::CallbackListSubscription BrowserPlatform::ObserveDaemonAuthorization(
    base::RepeatingClosure callback) {
  return authorization_observers_.Add(std::move(callback));
}
void BrowserPlatform::DidChangeDaemonState(DaemonSupervisor::State state,
                                          std::string error) {
  if (state == DaemonSupervisor::State::kFailed) {
    LOG(ERROR) << error;
  }
  const bool authorized = state == DaemonSupervisor::State::kReady &&
      authorization().starts_with("AuxDaemonSessionToken ") &&
      authorization().size() > sizeof("AuxDaemonSessionToken ") - 1;
  const bool became_authorized = authorized && !authorization_was_available_;
  authorization_was_available_ = authorized;
  if (became_authorized) authorization_observers_.Notify();
  if (state != DaemonSupervisor::State::kReady || public_key_ || loading_key_) {
    return;
  }
  loading_key_ = true;
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&LoadInstallationPublicKey, StateHome()),
      base::BindOnce(
          [](base::WeakPtr<BrowserPlatform> self,
             std::optional<crypto::keypair::PublicKey> key) {
            if (self) {
              self->loading_key_ = false;
              self->public_key_ = std::move(key);
              if (self->public_key_) {
                self->cdp_authority_observers_.Notify();
              }
            }
          }, weak_.GetWeakPtr()));
}
bool BrowserPlatform::WaitForStartupReadiness(
    base::RepeatingCallback<bool()> extensions_ready) {
  if (startup_state_ == StartupState::kReady) {
    return true;
  }
  if (startup_state_ == StartupState::kFailed || !supervisor_) {
    return false;
  }
  base::RunLoop loop;
  bool ready = false;
  startup_waiters_.push_back(base::BindOnce(
      [](bool* ready, base::OnceClosure quit, bool result) {
        *ready = result;
        std::move(quit).Run();
      }, &ready, loop.QuitClosure()));
  if (startup_state_ == StartupState::kNotStarted) {
    startup_state_ = StartupState::kWaiting;
    startup_extensions_ready_ = std::move(extensions_ready);
    startup_deadline_ = base::TimeTicks::Now() + base::Seconds(10);
    startup_timer_.Start(FROM_HERE, base::Milliseconds(250), this,
                         &BrowserPlatform::CheckStartupReadiness);
    CheckStartupReadiness();
  }
  loop.Run();
  return ready;
}
void BrowserPlatform::CheckStartupReadiness() {
  if (startup_state_ != StartupState::kWaiting) {
    return;
  }
  const bool extensions_ready = startup_extensions_ready_.Run();
  const bool healthy = supervisor_ && supervisor_->healthy();
  if (!(extensions_ready && healthy) &&
      base::TimeTicks::Now() < startup_deadline_) {
    return;
  }
  startup_state_ = extensions_ready ? StartupState::kReady
                                    : StartupState::kFailed;
  if (!extensions_ready) {
    LOG(ERROR) << "Aux startup extensions did not become ready before the "
                  "startup readiness timeout";
  } else if (!healthy) {
    LOG(WARNING) << "Aux daemon did not become healthy before the startup "
                    "readiness timeout; continuing browser startup because "
                    "Aux extensions are ready";
  }
  startup_timer_.Stop();
  startup_extensions_ready_.Reset();
  auto waiters = std::move(startup_waiters_);
  for (auto& waiter : waiters) {
    std::move(waiter).Run(extensions_ready);
  }
}

void BrowserPlatform::QuiesceDirectDaemonForMigration(
    DirectDaemonQuiesceCallback done) {
  // Close separate carrier launches before waiting on the daemon. The daemon
  // result remains direct-daemon-only; callers must inspect carrier custody.
  CloseInstallationCarrierAdmission();
  direct_daemon_admission_closed_ = true;
  if (supervisor_) {
    supervisor_->QuiesceDirectDaemonForMigration(std::move(done));
    return;
  }
  DirectDaemonQuiesceResult result;
  result.outcome = DirectDaemonQuiesceResult::Outcome::kNoOwnedProcess;
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(std::move(done), result));
}
void BrowserPlatform::Shutdown() {
  CloseInstallationCarrierAdmission();
  direct_daemon_admission_closed_ = true;
  weak_.InvalidateWeakPtrs();
  startup_timer_.Stop();
  startup_extensions_ready_.Reset();
  startup_state_ = StartupState::kFailed;
  auto waiters = std::move(startup_waiters_);
  for (auto& waiter : waiters) {
    std::move(waiter).Run(false);
  }
  loading_key_ = false;
  if (!supervisor_) {
    return;
  }
  base::RunLoop loop;
  supervisor_->Shutdown(loop.QuitClosure());
  loop.Run();
  // Never discard the owned handle after an unverified drain.
  if (supervisor_->state() != DaemonSupervisor::State::kStopped) return;
  supervisor_.reset();
  components_.clear();
  public_key_.reset();
}
bool BrowserPlatform::RegisterProfileComponents(
    base::RepeatingCallback<std::string(base::DictValue, const base::FilePath&)>
        installer) {
  if (components_.size() != 1) {
    return false;
  }
  std::vector<ComponentManifest> copy;
  for (const auto& component : components_) {
    copy.push_back(
        {component.id, component.directory, component.manifest.Clone()});
  }
  return RegisterBundledComponents(std::move(copy), std::move(installer));
}
base::CallbackListSubscription BrowserPlatform::ObserveBrowserCdpAuthority(
    base::RepeatingClosure callback) {
  return cdp_authority_observers_.Add(std::move(callback));
}
CdpRequestFilter BrowserPlatform::CreateBrowserCdpFilter(uint16_t port) const {
  if (!public_key_) {
    return {};
  }
  return CreateCdpRequestFilter(std::make_shared<CdpAuthority>(
      *public_key_, port,
      std::set<std::string>{
          "chrome-extension://" + std::string(kAgentExtensionId),
          "chrome-extension://" + std::string(kVaultExtensionId),
          "devtools://devtools"}));
}
const std::string& BrowserPlatform::authorization() const {
  static const base::NoDestructor<std::string> empty;
  return supervisor_ ? supervisor_->authorization() : *empty;
}
}  // namespace aux

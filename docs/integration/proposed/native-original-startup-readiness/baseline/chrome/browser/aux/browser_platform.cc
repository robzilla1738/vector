// Copyright 2026 Aux Authors. All rights reserved.
// Browser-owned startup gate and component lifecycle: platform.md P1/P2/P5.
#include "chrome/browser/aux/browser_platform.h"

#include "base/command_line.h"
#include "base/environment.h"
#include "base/functional/bind.h"
#include "base/logging.h"
#include "base/run_loop.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/thread_pool.h"
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
  if (supervisor_) {
    return supervisor_->state() == DaemonSupervisor::State::kReady;
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
  if (components_.size() != 2) {
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
  base::RunLoop ready_loop;
  bool ready = false;
  // Detach stack-bound callback after the initial gate. Recovery keeps the
  // process owner alive and reports errors without retaining a startup stack.
  auto callback = base::BindRepeating(
      [](bool* ready, base::RepeatingClosure quit,
         DaemonSupervisor::State state, std::string error) {
        if (state == DaemonSupervisor::State::kReady) {
          *ready = true;
          quit.Run();
        } else if (state == DaemonSupervisor::State::kFailed) {
          LOG(ERROR) << error;
          quit.Run();
        }
      },
      &ready, ready_loop.QuitClosure());
  supervisor_ = std::make_unique<DaemonSupervisor>(
      *paths, home, port, std::move(factory), std::move(callback),
      base::CommandLine::ForCurrentProcess()->HasSwitch(
          "aux-development-runtime"));
  supervisor_->Start();
  ready_loop.Run();
  supervisor_->SetStateCallback(
      base::BindRepeating([](DaemonSupervisor::State state, std::string error) {
        if (state == DaemonSupervisor::State::kFailed) {
          LOG(ERROR) << error;
        }
      }));
  if (!ready) {
    Shutdown();
    return false;
  }
  base::RunLoop key_loop;
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&LoadInstallationPublicKey, home),
      base::BindOnce(
          [](BrowserPlatform* self, base::OnceClosure quit,
             std::optional<crypto::keypair::PublicKey> key) {
            self->public_key_ = std::move(key);
            std::move(quit).Run();
          },
          base::Unretained(this), key_loop.QuitClosure()));
  key_loop.Run();
  if (!public_key_) {
    Shutdown();
    return false;
  }
  return true;
}
void BrowserPlatform::Shutdown() {
  if (!supervisor_) {
    return;
  }
  base::RunLoop loop;
  supervisor_->Shutdown(loop.QuitClosure());
  loop.Run();
  supervisor_.reset();
  components_.clear();
  public_key_.reset();
}
bool BrowserPlatform::RegisterProfileComponents(
    base::RepeatingCallback<std::string(base::DictValue, const base::FilePath&)>
        installer) {
  if (components_.size() != 2) {
    return false;
  }
  std::vector<ComponentManifest> copy;
  for (const auto& component : components_) {
    copy.push_back(
        {component.id, component.directory, component.manifest.Clone()});
  }
  return RegisterBundledComponents(std::move(copy), std::move(installer));
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

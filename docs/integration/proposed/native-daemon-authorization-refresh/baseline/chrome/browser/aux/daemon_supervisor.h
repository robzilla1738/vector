// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_DAEMON_SUPERVISOR_H_
#define CHROME_BROWSER_AUX_DAEMON_SUPERVISOR_H_
#include <memory>
#include <optional>
#include <string>

#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/weak_ptr.h"
#include "base/process/process.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "services/network/public/cpp/simple_url_loader.h"
namespace aux {
struct BundlePaths {
  base::FilePath root, daemon_executable, node, daemon_script, agent_extension,
      vault_extension;
  static std::optional<BundlePaths> FromBrowserExecutable();
};
// UI-sequence owner. Must call Shutdown and retain until its completion before
// destruction.
class DaemonSupervisor {
 public:
  enum class State {
    kStopped,
    kStarting,
    kAuthenticating,
    kReady,
    kFailed,
    kStopping
  };
  using StateCallback = base::RepeatingCallback<void(State, std::string)>;
  DaemonSupervisor(BundlePaths paths,
                   base::FilePath home,
                   uint16_t port,
                   scoped_refptr<network::SharedURLLoaderFactory> factory,
                   StateCallback changed,
                   bool allow_node_fallback = false);
  ~DaemonSupervisor();
  void Start();
  void SetStateCallback(StateCallback callback) {
    changed_ = std::move(callback);
  }
  void Shutdown(base::OnceClosure done);
  State state() const { return state_; }
  bool healthy() const { return healthy_; }
  const std::string& authorization() const { return authorization_; }

 private:
  void SetState(State state, std::string error = {});
  void DidLaunch(base::Process process);
  void Poll();
  void DidReadHealth(std::optional<std::string> body);
  void Authenticate();
  void DidReadChallenge(std::optional<std::string> body);
  void DidSignChallenge(std::string id, std::optional<std::string> signature);
  void DidReadSession(std::optional<std::string> body);
  void Request(std::string path,
               std::optional<std::string> body,
               base::OnceCallback<void(std::optional<std::string>)> done);
  void FinishShutdown();
  void DidFinishShutdown(bool stopped);
  const BundlePaths paths_;
  const base::FilePath home_;
  const uint16_t port_;
  const scoped_refptr<network::SharedURLLoaderFactory> factory_;
  StateCallback changed_;
  const bool allow_node_fallback_;
  State state_ = State::kStopped;
  bool launch_pending_ = false;
  bool healthy_ = false;
  base::Process process_;
  base::Time process_created_;
  base::TimeTicks activation_deadline_, token_expires_;
  std::string authorization_;
  std::unique_ptr<network::SimpleURLLoader> loader_;
  base::OneShotTimer timer_;
  base::OnceClosure shutdown_done_;
  base::WeakPtrFactory<DaemonSupervisor> weak_{this};
};
}  // namespace aux
#endif

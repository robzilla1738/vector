// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NATIVE_TASK_FEED_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NATIVE_TASK_FEED_H_

#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>

#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "url/gurl.h"

class Profile;
namespace aux {
struct ProfileSecurityState;
}
namespace network {
class SimpleURLLoader;
}

struct AuxNativeTask {
  std::string id;
  std::u16string title;
  std::string status;
  bool unread = false;
  bool pinned = false;
  bool can_pin = false;
  struct PendingAction {
    std::string id;
    std::string kind;
    std::u16string title;
    std::u16string detail;
    bool operator==(const PendingAction&) const = default;
  };
  std::optional<PendingAction> pending_action;
  bool operator==(const AuxNativeTask&) const = default;
};

// Profile-bound authenticated projection for native task surfaces. It never
// falls back to another profile's current account or reads installation keys.
class AuxNativeTaskFeed {
 public:
  enum class State { kConnecting, kReady, kUnbound, kPrivate, kError };
  struct Snapshot {
    State state = State::kConnecting;
    std::vector<AuxNativeTask> tasks;
    std::u16string error;
  };
  using UpdatedCallback = base::RepeatingCallback<void(const Snapshot&)>;
  using ActionCallback = base::OnceCallback<void(std::optional<std::u16string>)>;

  AuxNativeTaskFeed(Profile* profile, UpdatedCallback updated);
  ~AuxNativeTaskFeed();
  AuxNativeTaskFeed(const AuxNativeTaskFeed&) = delete;
  AuxNativeTaskFeed& operator=(const AuxNativeTaskFeed&) = delete;

  enum class AgentTabsOperation { kList, kClose, kCleanup, kPolicy };
  using AgentTabsCallback = base::OnceCallback<void(
      std::optional<std::string>, std::optional<std::u16string>)>;
  // Injects verified account/profile/mode scope; never accepts an arbitrary URL.
  void RequestAgentTabs(AgentTabsOperation operation,
                        base::DictValue input,
                        AgentTabsCallback callback);
  void Start();
  void Stop();
  void Refresh();
  void PerformAction(const std::string& task_id,
                     const std::string& action,
                     base::DictValue body,
                     ActionCallback callback);
  const Snapshot& snapshot() const { return snapshot_; }
  base::WeakPtr<AuxNativeTaskFeed> GetWeakPtr() {
    return weak_factory_.GetWeakPtr();
  }

 private:
  using LoadCallback =
      base::OnceCallback<void(std::optional<std::string>, int)>;
  using AuthCallback = base::OnceCallback<void(bool)>;

  void DispatchAction(const std::string& task_id,
                      const std::string& action,
                      base::DictValue body,
                      ActionCallback callback);
  void OnAccountResolved(aux::ProfileSecurityState security);
  void EnsureAuthorization(AuthCallback callback);
  void VerifySecurity(
      base::OnceCallback<void(aux::ProfileSecurityState)> callback);
  void FetchTasks(bool authorized);
  void OnTasks(std::optional<std::string> body, int status);
  void Load(const GURL& url,
            std::optional<std::string> post_body,
            LoadCallback callback);
  void Fail(std::u16string error);
  GURL AccountUrl(const std::string& path) const;

  const raw_ptr<Profile> profile_;
  UpdatedCallback updated_;
  Snapshot snapshot_;
  base::RepeatingTimer timer_;
  std::map<uint64_t, std::unique_ptr<network::SimpleURLLoader>> loaders_;
  uint64_t next_request_id_ = 0;
  std::optional<int> account_id_;
  std::string authorization_;
  bool refresh_pending_ = false;
  base::WeakPtrFactory<AuxNativeTaskFeed> weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NATIVE_TASK_FEED_H_

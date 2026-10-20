// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_TRANSPORT_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_TRANSPORT_H_

#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "chrome/browser/ui/views/frame/aux_chats_model.h"

class BrowserWindowInterface;
class Profile;
namespace network { class SimpleURLLoader; }
namespace aux {
// Original region463db48/463dd90/463e350 owns one polling request, plus actual
// action requests. Its lifetime follows the real same-window profile owner.
class AuxChatsTransport {
 public:
  using Updated = base::RepeatingCallback<void(const std::vector<Chat>&)>;
  struct ActionResult {
    int status = 0;
    std::optional<base::Value> body;
    bool ok() const { return status == 200; }
  };
  using ActionDone = base::OnceCallback<void(ActionResult)>;
  explicit AuxChatsTransport(BrowserWindowInterface& browser, Updated updated);
  ~AuxChatsTransport();
  void Start();
  void Stop();
  void Refresh();
  // Captures actual current account/profile before auth and rechecks on reply.
  void PerformAction(std::string session, std::string action,
                     base::DictValue input, ActionDone done);
  bool running() const { return running_; }
  std::optional<int> account_id() const { return account_id_; }
 private:
  using AccountDone = base::OnceCallback<void(std::optional<int>)>;
  using Loaded = base::OnceCallback<void(int, std::optional<std::string>)>;
  bool ScopeCurrent() const;
  void ResolveAccount(AccountDone done);
  void PollAccount(std::optional<int> account);
  void PollAuthorized(int account, bool retried, std::optional<std::string> token);
  void PollLoaded(int account, bool retried, int status,
                  std::optional<std::string> body);
  void PollFinished();
  void Schedule();
  void ActionAuthorized(int account, std::string session, std::string action,
                        base::DictValue input, ActionDone done,
                        std::optional<std::string> token);
  void Load(std::string path, int account, std::string authorization,
            std::optional<std::string> input, Loaded loaded);
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  base::FilePath profile_path_;
  Updated updated_;
  bool running_ = false;
  bool poll_pending_ = false;
  std::optional<int> account_id_;
  base::OneShotTimer timer_;
  uint64_t next_request_ = 0;
  std::map<uint64_t, std::unique_ptr<network::SimpleURLLoader>> requests_;
  base::WeakPtrFactory<AuxChatsTransport> weak_{this};
};
}  // namespace aux
#endif

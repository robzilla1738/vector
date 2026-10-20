// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_SESSION_TABS_SOURCE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_SESSION_TABS_SOURCE_H_
#include <memory>
#include <optional>
#include <string>
#include <vector>
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/memory/raw_ptr.h"
#include "base/timer/timer.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "chrome/browser/ui/views/frame/aux_agent_session_tabs_model.h"
#include "components/tabs/public/tab_interface.h"
class BrowserWindowInterface;
class Profile;
class TabStripModel;
namespace network { class SimpleURLLoader; }
namespace aux {
// Original5d0 data owner: actual model handles/targets and authenticated supplied
// session ancestry. The visual owner must preserve its separate ancestor check.
class AgentSessionTabsSource final : public TabStripModelObserver {
 public:
  AgentSessionTabsSource(BrowserWindowInterface&, TabStripModel&,
                        base::RepeatingClosure changed);
  ~AgentSessionTabsSource() override;
  void Start();
  void Retire();
  bool RepresentsTab(const tabs::TabInterface&) const;
  const std::vector<tabs::TabHandle>& order() const { return order_; }
 private:
  using Loaded = base::OnceCallback<void(int, std::optional<std::string>)>;
  bool ScopeCurrent() const;
  bool PollAllowed() const;
  void Poll();
  void Authorized(std::optional<std::string> authorization);
  void Listed(int status, std::optional<std::string> body);
  void ResolveNext();
  void Resolved(size_t count, int status, std::optional<std::string> body);
  void Request(std::string method, base::DictValue input, bool batch,
               Loaded loaded);
  void Finished();
  void Reconcile();
  void OnTabStripModelChanged(TabStripModel*, const TabStripModelChange&,
                             const TabStripSelectionChange&) override;
  void OnTabChangedAt(tabs::TabInterface*, TabChangeType) override;
  void TabGroupedStateChanged(TabStripModel*,
      std::optional<tab_groups::TabGroupId>,
      std::optional<tab_groups::TabGroupId>, tabs::TabInterface*, int) override;
  void OnTabGroupChanged(const TabGroupChange&) override;
  void OnTabStripModelDestroyed(TabStripModel*) override;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<TabStripModel> tabs_;
  base::FilePath original_profile_path_;
  int account_ = -1;
  base::RepeatingClosure changed_;
  AgentSessionTabsModel graph_;
  AgentSessionTabsModel::Sessions sessions_;
  AgentSessionTabsModel::Sessions pending_sessions_;
  AgentSessionTabsModel::Targets pending_targets_;
  std::vector<std::string> targets_;
  std::vector<tabs::TabHandle> order_;
  size_t cursor_ = 0;
  bool running_ = false;
  bool polling_ = false;
  bool force_authorization_ = false;
  std::string authorization_;
  base::OneShotTimer timer_;
  std::unique_ptr<network::SimpleURLLoader> loader_;
  base::WeakPtrFactory<AgentSessionTabsSource> weak_{this};
};
}  // namespace aux
#endif

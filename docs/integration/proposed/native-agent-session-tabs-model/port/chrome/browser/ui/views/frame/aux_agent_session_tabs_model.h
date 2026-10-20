// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_SESSION_TABS_MODEL_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_SESSION_TABS_MODEL_H_

#include <map>
#include <optional>
#include <span>
#include <string>
#include <string_view>
#include "base/values.h"

namespace aux {
// Original AsideAgentSessionTabsView +370 and +388. These records describe
// supplied sessions, not native-created-tab ownership or arbitrary URL matches.
class AgentSessionTabsModel {
 public:
  struct Session {
    std::string parent_id;
    bool user_cli = false;
  };
  using Sessions = std::map<std::string, Session, std::less<>>;
  using Targets = std::map<std::string, std::string, std::less<>>;
  static base::DictValue ListInput(int account_id);
  static std::optional<Sessions> ParseSessions(std::string_view response);
  // A batch has exactly one result per requested target. Successful null data
  // means no association; a missing result.data or malformed envelope fails
  // the batch. Caller accumulates chunks of at most 32 before replacing state.
  static std::optional<Targets> ParseTargets(
      std::string_view response, std::span<const std::string> target_ids);
  void Replace(Sessions sessions, Targets targets);
  void Clear();
  std::optional<std::string> RootForTarget(std::string_view target_id) const;
 private:
  Sessions sessions_;
  Targets targets_;
};
}  // namespace aux
#endif

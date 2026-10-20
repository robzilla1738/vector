// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_agent_session_tabs_model.h"
#include <array>
#include "base/check.h"

int main() {
  using Model = aux::AgentSessionTabsModel;
  auto sessions = Model::ParseSessions(R"({"result":{"data":[
    {"id":"root","trigger":{"type":"user","source":"cli"}},
    {"id":"child","parentId":"root"},
    {"id":"client","trigger":{"type":"user","client":"cli"}},
    {"id":"wrong-type","trigger":{"type":"routine","source":"cli"}},
    {"id":"cycle-a","parentId":"cycle-b"},
    {"id":"cycle-b","parentId":"cycle-a"},
    {"id":"root","trigger":{"type":"routine"}}
  ]}})");
  CHECK(sessions);
  const std::array<std::string, 5> targets = {"t1", "t2", "t3", "t4", "t5"};
  auto resolved = Model::ParseTargets(R"([
    {"result":{"data":{"sessionId":"child"}}},
    {"result":{"data":{"sessionId":"client"}}},
    {"result":{"data":{"sessionId":"wrong-type"}}},
    {"result":{"data":{"sessionId":"cycle-a"}}},
    {"result":{"data":null}}
  ])", targets);
  CHECK(resolved);
  Model model;
  model.Replace(std::move(*sessions), std::move(*resolved));
  CHECK(model.RootForTarget("t1") == "root");
  CHECK(model.RootForTarget("t2") == "client");
  CHECK(!model.RootForTarget("t3"));
  CHECK(!model.RootForTarget("t4"));
  CHECK(!model.RootForTarget("t5"));
  CHECK(!Model::ParseSessions("{}"));
  CHECK(!Model::ParseTargets("[]", targets));
  CHECK(!Model::ParseTargets(R"([{"error":{}}])",
      std::span<const std::string>(targets).first(1)));
  CHECK(Model::ListInput(3).FindString("ephemeral") &&
        *Model::ListInput(3).FindString("ephemeral") == "include");
  model.Clear();
  CHECK(!model.RootForTarget("t1"));
}

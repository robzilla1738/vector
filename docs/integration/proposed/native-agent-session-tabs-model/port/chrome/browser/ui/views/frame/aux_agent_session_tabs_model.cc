// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_agent_session_tabs_model.h"

#include <set>
#include <utility>
#include "base/json/json_reader.h"

namespace aux {
base::DictValue AgentSessionTabsModel::ListInput(int account_id) {
  return base::DictValue().Set("accountId", account_id)
      .Set("ephemeral", "include").Set("archived", "include")
      .Set("parent", "all");
}

std::optional<AgentSessionTabsModel::Sessions>
AgentSessionTabsModel::ParseSessions(std::string_view response) {
  auto envelope = base::JSONReader::Read(response, base::JSON_PARSE_RFC);
  if (!envelope || !envelope->is_dict()) return std::nullopt;
  const auto* rows = envelope->GetDict().FindListByDottedPath("result.data");
  if (!rows) return std::nullopt;
  Sessions sessions;
  for (const auto& value : *rows) {
    const auto* row = value.GetIfDict();
    if (!row) continue;
    const auto* id = row->FindString("id");
    if (!id || id->empty()) continue;
    Session session;
    if (const auto* parent = row->FindString("parentId"))
      session.parent_id = *parent;
    if (const auto* trigger = row->FindDict("trigger")) {
      const auto* type = trigger->FindString("type");
      const auto* source = trigger->FindString("source");
      const auto* client = trigger->FindString("client");
      session.user_cli = type && *type == "user" &&
          ((source && *source == "cli") || (client && *client == "cli"));
    }
    // Original ordered-map insertion retains the first duplicate session ID.
    sessions.try_emplace(*id, std::move(session));
  }
  return sessions;
}

std::optional<AgentSessionTabsModel::Targets>
AgentSessionTabsModel::ParseTargets(
    std::string_view response, std::span<const std::string> target_ids) {
  auto envelope = base::JSONReader::Read(response, base::JSON_PARSE_RFC);
  if (!envelope || !envelope->is_list()) return std::nullopt;
  const auto& rows = envelope->GetList();
  if (rows.size() != target_ids.size()) return std::nullopt;
  Targets targets;
  for (size_t i = 0; i < rows.size(); ++i) {
    const auto* row = rows[i].GetIfDict();
    if (!row) return std::nullopt;
    const auto* data = row->FindByDottedPath("result.data");
    if (!data) return std::nullopt;
    if (const auto* object = data->GetIfDict()) {
      if (const auto* id = object->FindString("sessionId"))
        targets.insert_or_assign(target_ids[i], *id);
    }
  }
  return targets;
}

void AgentSessionTabsModel::Replace(Sessions sessions, Targets targets) {
  sessions_ = std::move(sessions);
  targets_ = std::move(targets);
}
void AgentSessionTabsModel::Clear() {
  sessions_.clear();
  targets_.clear();
}
std::optional<std::string> AgentSessionTabsModel::RootForTarget(
    std::string_view target_id) const {
  auto target = targets_.find(target_id);
  if (target == targets_.end()) return std::nullopt;
  std::string session = target->second;
  std::set<std::string> visited;
  while (!session.empty() && visited.insert(session).second) {
    const auto found = sessions_.find(session);
    if (found == sessions_.end()) return std::nullopt;
    if (found->second.user_cli) return session;
    session = found->second.parent_id;
  }
  return std::nullopt;
}
}  // namespace aux

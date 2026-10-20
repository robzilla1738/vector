// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chats_model.h"

#include <set>
#include <utility>

#include "base/json/json_reader.h"
#include "base/strings/utf_string_conversions.h"

namespace aux {
namespace {
ChatStatus ParseStatus(const std::string* status) {
  if (!status) return ChatStatus::kIdle;
  if (*status == "running") return ChatStatus::kRunning;
  if (*status == "completed" || *status == "finished-unread")
    return ChatStatus::kFinishedUnread;
  if (*status == "awaiting-approval") return ChatStatus::kAwaitingApproval;
  if (*status == "awaiting-answer") return ChatStatus::kAwaitingAnswer;
  if (*status == "awaiting-for-inbox-events") return ChatStatus::kAwaitingInboxEvents;
  if (*status == "error" || *status == "errored" || *status == "aborted" ||
      *status == "interrupted") return ChatStatus::kError;
  return ChatStatus::kIdle;
}
std::u16string Text(const base::DictValue& value, const char* key) {
  const auto* text = value.FindString(key);
  return text ? base::UTF8ToUTF16(*text) : std::u16string();
}
std::optional<ChatPopover> ParsePopover(const base::DictValue* value) {
  if (!value) return std::nullopt;
  const auto* id = value->FindString("id");
  if (!id || id->empty()) return std::nullopt;
  ChatPopover result;
  result.id = *id;
  if (const auto* kind = value->FindString("kind")) result.kind = *kind;
  result.title = Text(*value, "title");
  result.body = Text(*value, "body");
  if (const auto* actions = value->FindList("actions")) {
    for (const auto& action : *actions) {
      const auto* row = action.GetIfDict();
      if (!row) continue;
      const auto* action_id = row->FindString("id");
      const auto* label = row->FindString("label");
      if (!action_id || action_id->empty() || !label || label->empty()) continue;
      result.actions.push_back({*action_id, base::UTF8ToUTF16(*label),
                               row->FindBool("primary").value_or(false)});
    }
  }
  return result;
}
}  // namespace
std::optional<std::vector<Chat>> ParseChatsResponse(std::string_view json) {
  auto response = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
  if (!response) return std::nullopt;
  std::vector<Chat> result;
  std::set<std::string> ids;
  for (const char* key : {"pinned", "recents"}) {
    const auto* rows = response->FindList(key);
    if (!rows) continue;
    for (const auto& value : *rows) {
      const auto* row = value.GetIfDict();
      if (!row) continue;
      const auto* id = row->FindString("id");
      if (!id || id->empty() || !ids.insert(*id).second) continue;
      Chat chat;
      chat.id = *id;
      const auto* title = row->FindString("title");
      chat.title = title && !title->empty() ? base::UTF8ToUTF16(*title)
                                          : u"Untitled task";
      chat.status = ParseStatus(row->FindString("status"));
      chat.pinned = row->FindBool("pinned").value_or(false);
      chat.can_pin = row->FindBool("canPin").value_or(true);
      chat.popover = ParsePopover(row->FindDict("popover"));
      result.push_back(std::move(chat));
    }
  }
  return result;
}
}  // namespace aux

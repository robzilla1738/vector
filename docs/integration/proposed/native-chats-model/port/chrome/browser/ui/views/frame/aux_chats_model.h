// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_MODEL_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_MODEL_H_

#include <optional>
#include <string>
#include <string_view>
#include <vector>

#include "base/values.h"

namespace aux {
// Original466e2cc native model; numeric states are consumed by the real badges.
enum class ChatStatus {
  kIdle = 0, kRunning = 1, kFinishedUnread = 2, kAwaitingApproval = 3,
  kAwaitingAnswer = 4, kAwaitingInboxEvents = 5, kError = 6,
};
struct ChatAction {
  std::string id;
  std::u16string label;
  bool primary = false;
  bool operator==(const ChatAction&) const = default;
};
struct ChatPopover {
  std::string id;
  std::string kind;
  std::u16string title;
  std::u16string body;
  std::vector<ChatAction> actions;
  bool operator==(const ChatPopover&) const = default;
};
struct Chat {
  std::string id;
  std::u16string title;
  ChatStatus status = ChatStatus::kIdle;
  bool pinned = false;
  bool can_pin = true;
  std::optional<ChatPopover> popover;
  bool operator==(const Chat&) const = default;
};
// Original463e350/466e2cc: pinned precedes recents, duplicate IDs keep first.
// Invalid JSON/top-level dictionary is failure, not a successful empty feed.
// The source permits absent lists and skips malformed rows/actions individually.
std::optional<std::vector<Chat>> ParseChatsResponse(std::string_view json);
}  // namespace aux
#endif

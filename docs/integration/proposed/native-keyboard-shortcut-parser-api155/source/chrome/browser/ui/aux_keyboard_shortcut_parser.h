// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_AUX_KEYBOARD_SHORTCUT_PARSER_H_
#define CHROME_BROWSER_UI_AUX_KEYBOARD_SHORTCUT_PARSER_H_
#include <optional>
#include <string_view>
#include <utility>
#include "base/strings/string_split.h"
#include "ui/base/accelerators/accelerator.h"
#include "ui/events/event_constants.h"
namespace aux {
// Match precisely the key vocabulary emitted by the supplied capture hook,
// including backslash/minus, which ui::Command's extension grammar omits.
inline std::optional<ui::Accelerator> ParseKeyboardShortcut(
    std::string_view value) {
  const auto parts = base::SplitStringPiece(value, "+", base::KEEP_WHITESPACE,
                                            base::SPLIT_WANT_ALL);
  if (parts.size() < 2 || parts.size() > 5)
    return std::nullopt;
  int flags = 0;
  for (size_t i = 0; i + 1 < parts.size(); ++i) {
    int flag = 0;
    if (parts[i] == "Ctrl")
      flag = ui::EF_CONTROL_DOWN;
    else if (parts[i] == "Alt")
      flag = ui::EF_ALT_DOWN;
    else if (parts[i] == "Command")
      flag = ui::EF_COMMAND_DOWN;
    else if (parts[i] == "Shift")
      flag = ui::EF_SHIFT_DOWN;
    else
      return std::nullopt;
    if (flags & flag)
      return std::nullopt;
    flags |= flag;
  }
  if (!(flags & (ui::EF_CONTROL_DOWN | ui::EF_ALT_DOWN | ui::EF_COMMAND_DOWN)))
    return std::nullopt;
  const auto key = parts.back();
  ui::KeyboardCode code = ui::VKEY_UNKNOWN;
  if (key.size() == 1 && key[0] >= 'A' && key[0] <= 'Z')
    code = static_cast<ui::KeyboardCode>(ui::VKEY_A + key[0] - 'A');
  else if (key.size() == 1 && key[0] >= '0' && key[0] <= '9')
    code = static_cast<ui::KeyboardCode>(ui::VKEY_0 + key[0] - '0');
  else {
    constexpr std::pair<std::string_view, ui::KeyboardCode> keys[] = {
        {"Down", ui::VKEY_DOWN},     {"Left", ui::VKEY_LEFT},
        {"Right", ui::VKEY_RIGHT},   {"Up", ui::VKEY_UP},
        {"\\", ui::VKEY_OEM_5},      {"Comma", ui::VKEY_OEM_COMMA},
        {"Delete", ui::VKEY_DELETE}, {"End", ui::VKEY_END},
        {"Home", ui::VKEY_HOME},     {"Insert", ui::VKEY_INSERT},
        {"-", ui::VKEY_OEM_MINUS},   {"PageDown", ui::VKEY_NEXT},
        {"PageUp", ui::VKEY_PRIOR},  {"Period", ui::VKEY_OEM_PERIOD},
        {"Space", ui::VKEY_SPACE},   {"Tab", ui::VKEY_TAB}};
    for (const auto& [name, candidate] : keys)
      if (key == name)
        code = candidate;
  }
  if (code == ui::VKEY_UNKNOWN)
    return std::nullopt;
  return ui::Accelerator(code, flags);
}
}  // namespace aux
#endif

// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NEW_CHAT_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NEW_CHAT_VIEW_H_
#include <optional>
#include <string>
#include "base/functional/callback.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/views/view.h"
namespace aux {
class AuxNewChatButton;
class AuxNewChatNormalButton;
// Original AsideNewChatTabButtonContainer, with its normal native new-tab
// button and selected New Chat-tab row. A real represented handle controls
// presentation, never width/collapsed inference.
class AuxNewChatView final : public views::View {
  METADATA_HEADER(AuxNewChatView, views::View)
 public:
  AuxNewChatView(base::RepeatingClosure new_chat, std::u16string shortcut_help);
  ~AuxNewChatView() override;
  void SetRepresentedTab(std::optional<tabs::TabHandle> tab, bool active);
  std::optional<tabs::TabHandle> represented_tab() const { return tab_; }
 private:
  raw_ptr<AuxNewChatNormalButton> normal_ = nullptr;
  raw_ptr<AuxNewChatButton> selected_ = nullptr;
  std::optional<tabs::TabHandle> tab_;
};
}  // namespace aux
#endif

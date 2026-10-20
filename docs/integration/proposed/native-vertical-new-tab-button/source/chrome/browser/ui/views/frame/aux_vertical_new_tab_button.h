// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_NEW_TAB_BUTTON_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_NEW_TAB_BUTTON_H_

#include <memory>
#include <string>

#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/views/controls/button/label_button.h"

class BrowserWindowInterface;
namespace views {
class ActionViewController;
class FlexLayout;
class Label;
}  // namespace views
namespace aux {

// Supplied VerticalNewTabButton (4242e5c), not the circular toolbar button.
class AuxVerticalNewTabButton final : public views::LabelButton {
  METADATA_HEADER(AuxVerticalNewTabButton, views::LabelButton)
 public:
  enum class CornerMode { kAll, kBottomOnly, kTopOnly };
  explicit AuxVerticalNewTabButton(BrowserWindowInterface& browser);
  ~AuxVerticalNewTabButton() override;
  void RebindBrowser(BrowserWindowInterface& browser);
  void SetCompact(bool compact);
  void SetCornerMode(CornerMode mode);
  // The ordinary New Tab caller leaves this empty. The original base also
  // supports a hover-only shortcut label for callers that actually supply one.
  void SetShortcutText(const std::u16string& text);
  base::CallbackListSubscription AddBeforeInvokeCallback(
      base::RepeatingClosure callback);
  std::unique_ptr<views::ActionViewInterface> GetActionViewInterface() override;

 protected:
  void OnThemeChanged() override;
  void StateChanged(ButtonState old_state) override;
  void PaintButtonContents(gfx::Canvas* canvas) override;

 private:
  friend class AuxVerticalNewTabActionInterface;
  void UpdateColors();
  void UpdateShortcutVisibility();
  void UpdateHighlightPath();
  bool compact_ = false;
  CornerMode corner_mode_ = CornerMode::kAll;
  raw_ptr<views::Label> shortcut_ = nullptr;
  raw_ptr<views::FlexLayout> layout_ = nullptr;
  base::RepeatingClosureList before_invoke_;
  std::unique_ptr<views::ActionViewController> action_controller_;
  base::WeakPtrFactory<AuxVerticalNewTabButton> weak_factory_{this};
};
}  // namespace aux
#endif

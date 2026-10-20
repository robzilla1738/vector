// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHAT_ROW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHAT_ROW_H_

#include "base/functional/callback.h"
#include "chrome/browser/ui/views/frame/aux_chats_model.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/views/controls/button/button.h"

namespace views { class ImageButton; class ImageView; class Label; }
namespace aux {
// Original AsideTaskRowButton4671570: press selects, repeated mouse press
// settles the first selection and renames, hover action archives.
class AuxChatRow final : public views::Button {
  METADATA_HEADER(AuxChatRow, views::Button)
 public:
  using Action = base::RepeatingCallback<void(const std::string&)>;
  using Context = base::RepeatingCallback<void(views::View*, Chat,
                                               const ui::MouseEvent&)>;
  AuxChatRow(Chat chat, Action selected, Action rename, Action archive,
             Context context, bool show_all = false);
  ~AuxChatRow() override;
  const Chat& chat() const { return chat_; }
  void SetSelected(bool selected);
  gfx::Size CalculatePreferredSize(const views::SizeBounds&) const override;
  bool OnMousePressed(const ui::MouseEvent&) override;
 protected:
  void OnThemeChanged() override;
  void OnPaintBackground(gfx::Canvas*) override;
  void StateChanged(ButtonState old_state) override;
 private:
  void Pressed(const ui::Event&);
  void Archive();
  void Refresh();
  Chat chat_;
  Action selected_;
  Action rename_;
  Action archive_;
  Context context_;
  bool show_all_;
  bool is_selected_ = false;
  raw_ptr<views::Label> label_ = nullptr;
  raw_ptr<views::ImageView> pin_ = nullptr;
  raw_ptr<views::View> status_ = nullptr;
  raw_ptr<views::ImageButton> archive_button_ = nullptr;
};
}  // namespace aux
#endif

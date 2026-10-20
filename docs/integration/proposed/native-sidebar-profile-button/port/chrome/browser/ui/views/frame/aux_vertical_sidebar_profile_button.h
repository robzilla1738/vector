// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_BUTTON_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_BUTTON_H_

#include <optional>
#include <string>
#include <string_view>

#include "base/memory/raw_ptr.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/views/controls/button/button.h"

class ProfileMonogramAvatarView;
namespace gfx { struct VectorIcon; }
namespace views {
class BoxLayout;
class ImageView;
class Label;
}
namespace aux {

enum class SidebarProfileGlyph { kAccount, kGuest, kIncognito };
const gfx::VectorIcon& SidebarProfileVectorIcon(SidebarProfileGlyph glyph);

// Supplied VerticalTabSidebarProfileButton. Its separate real Widget/profile
// controller supplies the original state and menu callback. This renderer
// creates no profile, account, image, or menu result.
class VerticalTabSidebarProfileButton : public views::Button {
  METADATA_HEADER(VerticalTabSidebarProfileButton, views::Button)
 public:
  explicit VerticalTabSidebarProfileButton(PressedCallback callback);
  ~VerticalTabSidebarProfileButton() override;

  void SetDisplayName(std::u16string_view name, bool auth_paused);
  void SetAvatarImage(ui::ImageModel image, int diameter,
                      bool show_monogram, bool profile_image);
  void SetCompact(bool compact);
  void SetLabelSuppressed(bool suppressed);
  void SetWidthLimit(std::optional<int> width);
  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override;
  void OnThemeChanged() override;
  void AddedToWidget() override;

 protected:
  void PaintButtonContents(gfx::Canvas* canvas) override;
  void StateChanged(ButtonState old_state) override;

 private:
  void UpdateMode();
  void UpdateInsets();
  void UpdateColors();

  raw_ptr<views::BoxLayout> layout_;
  raw_ptr<views::View> avatar_;
  raw_ptr<views::ImageView> image_;
  raw_ptr<ProfileMonogramAvatarView> monogram_;
  raw_ptr<views::Label> name_;
  raw_ptr<views::Label> paused_;
  raw_ptr<views::ImageView> disclosure_;
  std::u16string display_name_;
  bool auth_paused_ = false;
  bool compact_ = false;
  bool label_suppressed_ = false;
  bool profile_image_ = false;
  int avatar_diameter_ = 20;
  std::optional<int> width_limit_;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_VERTICAL_SIDEBAR_PROFILE_BUTTON_H_

// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SECTION_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SECTION_VIEW_H_

#include <memory>
#include <string>

#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "ui/gfx/geometry/insets.h"
#include "ui/views/view.h"

namespace views { class Button; }
namespace ui { class MouseEvent; }
namespace aux {
class AuxSectionHeaderButton;

// Supplied AsideSectionView4662010/metadata4663164. The actual Bookmarks/Chats
// owners control expansion, rows and persistence; this base owns their views.
class AuxSectionView : public views::View {
  METADATA_HEADER(AuxSectionView, views::View)
 public:
  AuxSectionView(std::u16string title, bool disclosure,
                 base::RepeatingClosure primary, gfx::Insets section_insets,
                 base::RepeatingClosure secondary = {},
                 std::unique_ptr<views::View> accessory = {},
                 int content_top_margin = 4);
  ~AuxSectionView() override;
  using Context = base::RepeatingCallback<void(views::View*, const ui::MouseEvent&)>;
  // Preserve the real right-click anchor/event rather than querying cursor.
  void SetSectionContext(Context callback);
  views::Button* header_button() const;
  views::View* contents() const { return contents_; }
  void SetDisclosureOpen(bool open);
  void SetHeaderAlwaysShowAccessory(bool always_show);

 private:
  raw_ptr<AuxSectionHeaderButton> header_ = nullptr;
  raw_ptr<views::View> contents_ = nullptr;
};
}  // namespace aux
#endif

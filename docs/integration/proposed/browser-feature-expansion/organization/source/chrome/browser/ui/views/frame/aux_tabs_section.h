// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TABS_SECTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TABS_SECTION_H_

#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "chrome/browser/ui/views/frame/aux_section_view.h"

namespace views {
class Button;
}
namespace aux {
class AuxTabsHeaderActionButton;
// Original region670: non-disclosing Tabs section with genuine Tidy/Clear
// actors. The real region owns the actions, content and backend busy state.
class AuxTabsSection final : public AuxSectionView {
  METADATA_HEADER(AuxTabsSection, AuxSectionView)
 public:
  struct Actions {
    base::RepeatingClosure tidy;
    base::RepeatingClosure clear;
  };
  explicit AuxTabsSection(Actions actions);
  ~AuxTabsSection() override;
  views::Button* tidy_button() const;
  views::Button* clear_button() const;
  // Source464d4b0 presentation only. Does not start/complete work.
  void SetTidyBusy(bool busy);
  void SetSpaceSwitcher(std::unique_ptr<views::View> switcher);

 private:
  struct Accessory;
  static Accessory MakeAccessory(Actions actions);
  explicit AuxTabsSection(Accessory accessory);
  raw_ptr<views::View> accessory_ = nullptr;
  bool has_spaces_ = false;
  raw_ptr<AuxTabsHeaderActionButton> tidy_ = nullptr;
  raw_ptr<AuxTabsHeaderActionButton> clear_ = nullptr;
};
}  // namespace aux
#endif

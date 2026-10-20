// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_PAGE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_PAGE_H_

#include <string>
#include <vector>

#include "base/memory/raw_ptr.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/gfx/image/image_skia.h"
#include "ui/views/view.h"

class ProfileMonogramAvatarView;
namespace views {
class ImageView;
class Label;
class ScrollView;
}
namespace aux {
class ProfileSearchButton;

struct ProfilePreviewTab {
  std::u16string title;
  bool active = false;
  bool pinned = false;
  bool operator==(const ProfilePreviewTab&) const = default;
};

// Real supplied page renderer (ProfilePagePreviewPageView, original467dc80).
// Data is supplied by the actual profile/session producer; this view never
// loads profiles, fabricates cached tabs, or captures a replacement screenshot.
class ProfilePagePreviewPageView : public views::View {
  METADATA_HEADER(ProfilePagePreviewPageView, views::View)
 public:
  ProfilePagePreviewPageView();
  ~ProfilePagePreviewPageView() override;

  views::View* live_host() { return live_host_; }
  void SetProfile(const std::u16string& name, const gfx::ImageSkia& avatar);
  void SetFallbackData(std::vector<ProfilePreviewTab> tabs,
                       std::vector<std::u16string> bookmarks);
  void SetFallbackGeometry(const gfx::Rect& header,
                           const gfx::Rect& search,
                           const gfx::Rect& scroll);
  void SetCapturedImage(const gfx::ImageSkia& image);
  void ShowLiveContent(bool live);
  void Layout(PassKey) override;
  void OnThemeChanged() override;

 private:
  void RebuildRows();
  void UpdateColors();

  raw_ptr<views::ImageView> captured_image_;
  raw_ptr<views::View> live_host_;
  raw_ptr<views::View> fallback_;
  raw_ptr<views::View> header_;
  raw_ptr<views::ImageView> avatar_image_;
  raw_ptr<ProfileMonogramAvatarView> monogram_;
  raw_ptr<views::Label> name_;
  raw_ptr<views::ImageView> disclosure_;
  raw_ptr<ProfileSearchButton> search_;
  raw_ptr<views::ScrollView> scroll_;
  raw_ptr<views::View> rows_;
  gfx::Rect header_bounds_;
  gfx::Rect search_bounds_;
  gfx::Rect scroll_bounds_;
  std::vector<ProfilePreviewTab> tabs_;
  std::vector<std::u16string> bookmarks_;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_PAGE_H_

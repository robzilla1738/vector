// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/frame/themed_background.h"

#include <optional>

#include "chrome/browser/themes/theme_properties.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/ui/color/chrome_color_id.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/top_container_view.h"
#include "chrome/browser/ui/views/tabs/tab_strip.h"
#include "chrome/grit/theme_resources.h"
#include "ui/base/theme_provider.h"
#include "ui/color/color_id.h"
#include "ui/color/color_provider.h"
#include "ui/gfx/canvas.h"

#if BUILDFLAG(ENABLE_AUX_BROWSER)
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/ui/side_panel/side_panel_ui.h"
#include "ui/views/widget/widget.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/main_background_region_view.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/toolbar/toolbar_view.h"
#include "chrome/browser/ui/views/bookmarks/bookmark_bar_view.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/render_frame_host.h"
#include "extensions/common/constants.h"
#include "ui/native_theme/native_theme.h"
#include "ui/views/view_utils.h"
#endif

namespace {

bool WillPaintCustomImage(const views::View* view, int id) {
  const ui::ThemeProvider* const theme_provider = view->GetThemeProvider();
  return theme_provider->HasCustomImage(id);
}

bool IsFrameActive(const views::View* view) {
  return view->GetWidget() ? view->GetWidget()->ShouldPaintAsActive() : true;
}

std::pair<int, ui::ColorId> GetThemeChoiceInfo(
    ThemedBackground::ThemeChoice theme_choice,
    const views::View* view) {
  switch (theme_choice) {
    case ThemedBackground::ThemeChoice::kToolbarTheme:
      return {IDR_THEME_TOOLBAR, kColorToolbar};
    case ThemedBackground::ThemeChoice::kFrameTheme:
      if (IsFrameActive(view)) {
        return {IDR_THEME_FRAME, ui::kColorFrameActive};
      } else {
        return {IDR_THEME_FRAME_INACTIVE, ui::kColorFrameInactive};
      }
    default:
      NOTREACHED();
  }
}

}  // namespace

ThemedBackground::ThemedBackground(BrowserView* browser_view,
                                   ThemeChoice theme_choice)
    : browser_view_(browser_view), theme_choice_(theme_choice) {}

void ThemedBackground::Paint(gfx::Canvas* canvas, views::View* view) const {
  PaintBackground(canvas, view, browser_view_, theme_choice_);
}

bool ThemedBackground::PaintThemeCustomImage(gfx::Canvas* canvas,
                                             const views::View* view,
                                             const BrowserView* browser_view,
                                             ThemeChoice theme_choice) {
  int theme_resource_id = GetThemeChoiceInfo(theme_choice, view).first;

  if (!WillPaintCustomImage(view, theme_resource_id)) {
    return false;
  }

  const ui::ThemeProvider* const theme_provider = view->GetThemeProvider();
  PaintThemeAlignedImage(canvas, view, browser_view,
                         theme_provider->GetImageSkiaNamed(theme_resource_id));

  return true;
}

void ThemedBackground::PaintThemeAlignedImage(gfx::Canvas* canvas,
                                              const views::View* view,
                                              const BrowserView* browser_view,
                                              gfx::ImageSkia* image) {
  // Get the origin of this view and translate it to coordinate system of the
  // BrowserView.
  gfx::Point pos;
  views::View::ConvertPointToTarget(view, browser_view, &pos);

  // Add in the translation to account for positioning of the theme image
  // relative of the origin of BrowserView.
  pos.Offset(0, ThemeProperties::kFrameHeightAboveTabs);

  if (browser_view->theme_background_y_offset()) {
    pos.set_y(pos.y() + *browser_view->theme_background_y_offset());
  }

  // Make sure the the background will cover the entire clip path region.
  // TODO(crbug.com/41344902): Remove the clip code and just use local bounds
  // once the pixel canvas is enabled on all aura platforms.
  SkPath clip_path = view->clip_path();
  SkRect rect = clip_path.getBounds();
  const gfx::Rect bounds =
      !clip_path.isEmpty()
          ? gfx::Rect(rect.x(), rect.y(), rect.width(), rect.height())
          : view->GetLocalBounds();
  canvas->TileImageInt(*image, pos.x(), pos.y(), bounds.x(), bounds.y(),
                       bounds.width(), bounds.height(), 1.0f,
                       SkTileMode::kRepeat, SkTileMode::kMirror);
}

void ThemedBackground::PaintBackground(gfx::Canvas* canvas,
                                       const views::View* view,
                                       const BrowserView* browser_view,
                                       ThemeChoice theme_choice) {
  bool painted =
      PaintThemeCustomImage(canvas, view, browser_view, theme_choice);
  if (!painted) {
    SkColor color = view->GetColorProvider()->GetColor(
        GetThemeChoiceInfo(theme_choice, view).second);
#if BUILDFLAG(ENABLE_AUX_BROWSER)
#if BUILDFLAG(IS_MAC)
    // The visible bookmarks row is part of the same top-container surface.
    // Its parent already paints the actual page color or supplied 80% tint;
    // another bookmark-row fill would create a separate strip/double tint.
    if (theme_choice == ThemeChoice::kToolbarTheme &&
        views::IsViewClass<BookmarkBarView>(view) && view->parent() &&
        views::IsViewClass<TopContainerView>(view->parent()) &&
        browser_view->ShouldDrawVerticalTabStrip() &&
        !view->GetWidget()->GetCustomTheme() &&
        view->GetNativeTheme()->preferred_contrast() !=
            ui::NativeTheme::PreferredContrast::kMore) {
      return;
    }
#endif
    // The Agent panel has its own single native tint. Do not put Chromium's
    // opaque main-region matte behind it, including beside ordinary web pages.
    const auto* panel_ui = SidePanelUI::From(browser_view->browser());
    if (views::IsViewClass<MainBackgroundRegionView>(view) && panel_ui &&
        panel_ui->IsSidePanelEntryShowing(SidePanelEntryKey(
            SidePanelEntryId::kExtension, aux::kAgentExtensionId)) &&
        !view->GetWidget()->GetCustomTheme() &&
        view->GetNativeTheme()->preferred_contrast() !=
            ui::NativeTheme::PreferredContrast::kMore) {
      return;
    }
    // Supplied normal Agent pages paint --web-content-background at 80% over
    // the native material. Give the toolbar row one matching tint, rather than
    // stacking the upstream toolbar, top-container and main-region mattes.
    auto* tab =
        browser_view->browser()->GetTabStripModel()->GetActiveWebContents();
    // WebContents exposes the virtual chrome://newtab URL. Match the actual
    // committed primary document so the supplied override is recognized.
    const auto* frame = tab ? tab->GetPrimaryMainFrame() : nullptr;
    const bool supplied_page =
        frame && frame->GetLastCommittedURL().SchemeIs(extensions::kExtensionScheme) &&
        frame->GetLastCommittedURL().host() == aux::kAgentExtensionId;
    if (theme_choice == ThemeChoice::kToolbarTheme && supplied_page &&
        view->GetNativeTheme()->preferred_contrast() !=
            ui::NativeTheme::PreferredContrast::kMore) {
      if (view == browser_view->toolbar() ||
          views::IsViewClass<MainBackgroundRegionView>(view)) {
        return;
      }
      color = SkColorSetA(color, 204);  // Supplied CSS 80%, not a sampled color.
    }
#if BUILDFLAG(IS_MAC)
    // The supplied external-page toolbar follows its active document backdrop.
    // Read the real CSS background, not a fixed color sampled from a reference.
    if (theme_choice == ThemeChoice::kToolbarTheme && frame &&
        frame->GetLastCommittedURL().SchemeIsHTTPOrHTTPS() &&
        browser_view->ShouldDrawVerticalTabStrip() &&
        !view->GetWidget()->GetCustomTheme() &&
        view->GetNativeTheme()->preferred_contrast() !=
            ui::NativeTheme::PreferredContrast::kMore &&
        (view == browser_view->toolbar() ||
         views::IsViewClass<TopContainerView>(view))) {
      if (const auto page_background = tab->GetBackgroundColor();
          page_background && SkColorGetA(*page_background) == SK_AlphaOPAQUE) {
        color = *page_background;
      }
    }
#endif
#endif
    canvas->DrawColor(color);
  }
}

std::optional<SkColor> ThemedBackground::GetBackgroundColor(
    const views::View* view,
    const BrowserView* browser_view,
    ThemeChoice theme_choice) {
  std::pair<int, ui::ColorId> theme_choice_info =
      GetThemeChoiceInfo(theme_choice, view);
  const bool will_be_painted =
      WillPaintCustomImage(view, theme_choice_info.first);
  if (!will_be_painted) {
    return view->GetColorProvider()->GetColor(theme_choice_info.second);
  }

  return std::nullopt;
}

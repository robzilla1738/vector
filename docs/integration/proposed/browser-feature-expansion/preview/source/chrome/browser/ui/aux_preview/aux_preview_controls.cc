// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_preview/aux_preview_controls.h"
#include "chrome/browser/ui/aux_preview/aux_preview_controller.h"
#include <memory>
#include <string>
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/toolbar/toolbar_button.h"
#include "chrome/browser/ui/views/toolbar/toolbar_view.h"
#include "components/vector_icons/vector_icons.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/flex_layout.h"
#include "ui/views/view.h"
#include "ui/views/view_utils.h"
namespace aux::preview {
namespace {
class Controls final : public views::View, public content::WebContentsObserver {
  METADATA_HEADER(Controls, views::View)
 public:
  explicit Controls(BrowserWindowInterface* browser)
      : WebContentsObserver(browser->GetTabStripModel()->GetActiveWebContents()),
        browser_(browser->GetWeakPtr()) {
    SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetOrientation(views::LayoutOrientation::kHorizontal)
        .SetCrossAxisAlignment(views::LayoutAlignment::kCenter);
    back_ = AddChildView(std::make_unique<ToolbarButton>(
        base::BindRepeating(&Controls::GoBack, weak_.GetWeakPtr())));
    back_->SetVectorIcon(vector_icons::kArrowBackIcon);
    back_->SetTooltipText(u"Back");
    dismiss_ = AddChildView(std::make_unique<ToolbarButton>(
        base::BindRepeating(&Controls::Close, weak_.GetWeakPtr())));
    dismiss_->SetVectorIcon(vector_icons::kCloseIcon);
    dismiss_->SetTooltipText(u"Dismiss preview");
    promote_ = AddChildView(std::make_unique<ToolbarButton>(
        base::BindRepeating(&Controls::OpenAsTab, weak_.GetWeakPtr())));
    promote_->SetVectorIcon(vector_icons::kOpenInNewFlippableIcon);
    promote_->SetTooltipText(u"Open as a full tab");
    label_ = AddChildView(std::make_unique<views::Label>());
    label_->SetMaximumWidth(160);
    label_->SetEnabledColor(kColorToolbarText);
    label_->SetHorizontalAlignment(gfx::ALIGN_LEFT);
    subscription_ = ObservePresentation(browser, base::BindRepeating(&Controls::Refresh, weak_.GetWeakPtr()));
    Refresh();
  }
  void DidStopLoading() override { Refresh(); }
  void PrimaryPageChanged(content::Page&) override { Refresh(); }
  void DidStartLoading() override { Refresh(); }
 private:
  void Refresh() {
    if (!browser_) return;
    const auto state = Presentation(browser_.get());
    const bool promoting = state.FindBool("promoting").value_or(false);
    back_->SetEnabled(!promoting && state.FindBool("canBack").value_or(false));
    promote_->SetEnabled(!promoting);
    dismiss_->SetEnabled(!promoting);
    const auto* restriction = state.FindString("restriction");
    const auto* profile = state.FindString("profileName");
    const auto* mode = state.FindString("mode");
    const std::string title = mode && *mode == "quick" ? "Quick window" : "Peek";
    label_->SetText(base::UTF8ToUTF16(restriction && !restriction->empty()
        ? *restriction : title + " · " + (profile ? *profile : "Profile")));
    label_->SetTooltipText(label_->GetText());
    InvalidateLayout();
  }
  void GoBack() {
    if (!browser_) return;
    auto weak = weak_.GetWeakPtr();
    const bool moved = Back(browser_.get());
    if (!weak) return;
    if (!moved && web_contents())
      ReportRestriction(web_contents(), "Back is unavailable while this page has active work.");
    Refresh();
  }
  void Close() {
    if (!browser_) return;
    std::string reason;
    if (!Dismiss(browser_.get(), &reason) && web_contents())
      ReportRestriction(web_contents(), reason);
  }
  void OpenAsTab() {
    if (!browser_) return;
    Promote(browser_.get(), nullptr, {}, base::BindOnce(&Controls::OnPromoted, weak_.GetWeakPtr()));
  }
  void OnPromoted(base::DictValue result) {
    if (!result.FindBool("ok").value_or(false) && web_contents()) {
      const auto* error = result.FindString("error");
      ReportRestriction(web_contents(), error ? *error : "The tab could not be promoted.");
    }
    Refresh();
  }
  base::WeakPtr<BrowserWindowInterface> browser_;
  raw_ptr<ToolbarButton> back_ = nullptr;
  raw_ptr<ToolbarButton> dismiss_ = nullptr;
  raw_ptr<ToolbarButton> promote_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
  base::CallbackListSubscription subscription_;
  base::WeakPtrFactory<Controls> weak_{this};
};
BEGIN_METADATA(Controls)
END_METADATA
bool Decorate(BrowserWindowInterface* browser) {
  if (!browser || !GetKind(browser) || browser->GetType() != BrowserWindowInterface::TYPE_POPUP)
    return false;
  auto* view = BrowserView::GetBrowserViewForBrowser(browser);
  auto* toolbar = view ? view->toolbar() : nullptr;
  if (!toolbar || !toolbar->location_bar()) return false;
  // TYPE_POPUP uses the existing location-bar FlexLayout. The real location
  // input/security model remains in place; only native siblings are added.
  auto* controls = toolbar->AddChildViewAt(std::make_unique<Controls>(browser), 0);
  controls->SetProperty(views::kFlexBehaviorKey,
      views::FlexSpecification(views::LayoutOrientation::kHorizontal,
          views::MinimumFlexSizeRule::kPreferred, views::MaximumFlexSizeRule::kPreferred));
  toolbar->InvalidateLayout();
  return true;
}
}  // namespace
int NativePreviewControlsWidth(BrowserWindowInterface* browser) {
  if (!GetKind(browser)) return 0;
  auto* view = BrowserView::GetBrowserViewForBrowser(browser);
  auto* toolbar = view ? view->toolbar() : nullptr;
  if (!toolbar) return 0;
  for (const auto& child : toolbar->children())
    if (auto* controls = views::AsViewClass<Controls>(child.get()))
      return controls->GetPreferredSize().width();
  return 0;
}
void EnsureNativePreviewControls() {
  static bool installed = false;
  if (installed) return;
  SetNativeWindowDecorator(base::BindRepeating(&Decorate));
  installed = true;
}
}  // namespace aux::preview

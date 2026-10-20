// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"

#include <algorithm>
#include <memory>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_multi_source_observation.h"
#include "base/scoped_observation.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/tab_search_bubble_host.h"
#include "components/input/native_web_keyboard_event.h"
#include "content/public/browser/keyboard_event_processing_result.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_user_data.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/common/extension_set.h"
#include "third_party/blink/public/common/input/web_input_event.h"
#include "ui/base/accelerators/accelerator.h"
#include "ui/base/class_property.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/mojom/dialog_button.mojom.h"
#include "ui/events/event.h"
#include "ui/events/event_constants.h"
#include "ui/events/event_observer.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/linear_animation.h"
#include "ui/gfx/animation/tween.h"
#include "ui/views/bubble/bubble_dialog_delegate_view.h"
#include "ui/views/controls/webview/webview.h"
#include "ui/views/controls/webview/web_contents_set_background_color.h"
#include "third_party/skia/include/core/SkColor.h"
#include "ui/views/event_monitor.h"
#include "ui/views/layout/fill_layout.h"
#include "ui/views/view_tracker.h"
#include "ui/views/view_utils.h"
#include "ui/views/widget/widget.h"
#include "ui/views/widget/widget_observer.h"

namespace aux {
namespace {
constexpr gfx::Size kSearchSize(620, 340);
constexpr int kToggleModifiers = ui::EF_COMMAND_DOWN | ui::EF_SHIFT_DOWN;

bool AgentInstalled(Profile* profile) {
  auto* registry = profile ? extensions::ExtensionRegistry::Get(profile) : nullptr;
  return registry && registry->GetExtensionById(
      kAgentExtensionId, extensions::ExtensionRegistry::EVERYTHING);
}
GURL SearchURL() {
  // Original five-fragment descriptor ead56f8..ead5748; only Aux ID changes.
  return GURL("chrome-extension://" + std::string(kAgentExtensionId) +
              "/tabsearch.html");
}
bool ToggleKey(const ui::KeyEvent& event) {
  return event.key_code() == ui::VKEY_A &&
      (event.flags() & kToggleModifiers) == kToggleModifiers;
}
bool ToggleKey(const input::NativeWebKeyboardEvent& event) {
  constexpr int kModifiers = blink::WebInputEvent::kMetaKey |
                            blink::WebInputEvent::kShiftKey;
  return event.windows_key_code == ui::VKEY_A &&
      (event.GetModifiers() & kModifiers) == kModifiers;
}

class SearchBrowserBinding : public content::WebContentsUserData<SearchBrowserBinding> {
 public:
  BrowserWindowInterface* browser() {
    auto* browser = browser_.get();
    return browser && browser->GetProfile() == GetWebContents().GetBrowserContext()
        ? browser : nullptr;
  }
 private:
  friend class content::WebContentsUserData<SearchBrowserBinding>;
  SearchBrowserBinding(content::WebContents* contents, BrowserWindowInterface& browser)
      : content::WebContentsUserData<SearchBrowserBinding>(*contents),
        browser_(browser.GetWeakPtr()) {}
  base::WeakPtr<BrowserWindowInterface> browser_;
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
WEB_CONTENTS_USER_DATA_KEY_IMPL(SearchBrowserBinding);

class AuxTabSearchWebView : public views::WebView {
  METADATA_HEADER(AuxTabSearchWebView, views::WebView)
 public:
  AuxTabSearchWebView(Profile* profile, base::RepeatingClosure close)
      : views::WebView(profile), close_(std::move(close)) {
    SetPreferredSize(kSearchSize);
  }
  void CloseContents(content::WebContents* source) override {
    if (source == GetWebContents())
      close_.Run();
  }
  content::KeyboardEventProcessingResult PreHandleKeyboardEvent(
      content::WebContents* source,
      const input::NativeWebKeyboardEvent& event) override {
    if (source == GetWebContents() &&
        event.GetType() == blink::WebInputEvent::Type::kRawKeyDown &&
        ToggleKey(event)) {
      close_.Run();
    }
    // Original45a2284 returns1 (NOT_HANDLED), retaining renderer input.
    return content::KeyboardEventProcessingResult::NOT_HANDLED;
  }
  bool HandleKeyboardEvent(content::WebContents* source,
                          const input::NativeWebKeyboardEvent& event) override {
    views::WebView::HandleKeyboardEvent(source, event);
    return true;
  }
 private:
  base::RepeatingClosure close_;
};
BEGIN_METADATA(AuxTabSearchWebView)
END_METADATA

class AuxTabSearchContentsView : public views::View {
  METADATA_HEADER(AuxTabSearchContentsView, views::View)
 public:
  AuxTabSearchContentsView(Profile* profile, base::RepeatingClosure close)
      : close_(std::move(close)) {
    SetLayoutManager(std::make_unique<views::FillLayout>());
    SetPreferredSize(kSearchSize);
    webview_ = AddChildView(
        std::make_unique<AuxTabSearchWebView>(profile, close_));
    AddAccelerator(ui::Accelerator(ui::VKEY_ESCAPE, ui::EF_NONE));
    AddAccelerator(ui::Accelerator(ui::VKEY_A, kToggleModifiers));
    views::WebContentsSetBackgroundColor::CreateForWebContentsWithColor(
        webview_->GetWebContents(), SK_ColorTRANSPARENT);
    webview_->LoadInitialURL(SearchURL());
  }
  bool AcceleratorPressed(const ui::Accelerator& accelerator) override {
    if (accelerator.key_code() == ui::VKEY_ESCAPE ||
        (accelerator.key_code() == ui::VKEY_A &&
         (accelerator.modifiers() & kToggleModifiers) == kToggleModifiers)) {
      close_.Run();
      return true;
    }
    return false;
  }
  void FocusWebContents() {
    if (auto* contents = webview_->GetWebContents()) {
      contents->Focus();
      webview_->RequestFocus();
    }
  }
  void SetContentsVisible(bool visible) {
    if (auto* contents = webview_->GetWebContents()) {
      if (visible)
        contents->WasShown();
      else
        contents->WasHidden();
    }
  }
  void ReloadForNextShow() { webview_->LoadInitialURL(SearchURL()); }
  void BindBrowser(BrowserWindowInterface& browser) {
    if (auto* contents = webview_->GetWebContents())
      SearchBrowserBinding::CreateForWebContents(contents, browser);
  }
 private:
  const base::RepeatingClosure close_;
  raw_ptr<AuxTabSearchWebView> webview_ = nullptr;
};
BEGIN_METADATA(AuxTabSearchContentsView)
END_METADATA

class AuxTabSearchDelegate : public views::BubbleDialogDelegate {
 public:
  AuxTabSearchDelegate(views::View* browser_view,
                       std::unique_ptr<AuxTabSearchContentsView> contents)
      : views::BubbleDialogDelegate(browser_view, views::BubbleBorder::TOP_LEFT,
                                    views::BubbleBorder::DIALOG_SHADOW, false) {
    SetButtons(static_cast<int>(ui::mojom::DialogButton::kNone));
    SetShowCloseButton(false);
    set_margins(gfx::Insets());
    set_corner_radius(10);
    set_close_on_deactivate(false);
    set_adjust_if_offscreen(false);
    SetContentsView(std::move(contents));
  }
  void OnAnchorBoundsChanged() override {
    auto* parent = anchor_widget();
    auto* widget = GetWidget();
    if (!parent || !widget)
      return;
    const auto bounds = parent->GetWindowBoundsInScreen();
    widget->SetBounds(gfx::Rect(
        bounds.x() + (bounds.width() - kSearchSize.width()) / 2,
        bounds.y() + (bounds.height() - kSearchSize.height()) / 2,
        kSearchSize.width(), kSearchSize.height()));
  }
  void OnBeforeBubbleWidgetInit(views::Widget::InitParams* params,
                                views::Widget* widget) const override {
    // This actual upstream Mac name enables the supplied native visual effect
    // in NativeWidgetMac::PopulateCreateWindowParams; it is not branding.
    params->name = "DesktopMediaPickerVisualEffect";
    params->animation_enabled = false;
  }
};
}  // namespace

// One real browser Widget owns this coordinator. It retains its actual hidden
// search Widget/WebContents across ordinary opens, as originalBrowserView+618.
class AuxProfileSearchOwner : public gfx::AnimationDelegate,
                              public views::WidgetObserver,
                              public ui::EventObserver,
                              public TabStripModelObserver {
 public:
  AuxProfileSearchOwner(BrowserWindowInterface& browser, views::Widget& parent)
      : browser_(browser.GetWeakPtr()), parent_(parent.GetWeakPtr()) {
    widgets_.AddObservation(&parent);
  }
  ~AuxProfileSearchOwner() override { Retire(); }
  bool visible() const { return visible_; }
  views::Widget* widget() const { return widget_.get(); }

  bool Show(base::OnceClosure on_closed = {}) {
    auto* browser = browser_.get();
    auto* profile = browser ? browser->GetProfile() : nullptr;
    if (!browser || !parent_ || parent_->IsClosed() || !AgentInstalled(profile))
      return false;
    if (profile_.get() != profile)
      RetireWidget();
    if (!widget_ || widget_->IsClosed()) {
      auto alive = weak_factory_.GetWeakPtr();
      profile_ = profile->GetWeakPtr();
      auto contents = std::make_unique<AuxTabSearchContentsView>(
          profile, base::BindRepeating(&AuxProfileSearchOwner::CloseAndReload,
                                      weak_factory_.GetWeakPtr()));
      contents->BindBrowser(*browser);
      contents_.SetView(contents.get());
      auto delegate = std::make_unique<AuxTabSearchDelegate>(
          BrowserView::GetBrowserViewForBrowser(browser), std::move(contents));
      auto* widget = views::BubbleDialogDelegate::CreateBubbleDeprecated(
          std::move(delegate),
          views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET);
      if (!alive)
        return false;
      widget_ = widget->GetWeakPtr();
      widgets_.AddObservation(widget);
    }
    if (!on_closed.is_null())
      on_closed_ = std::move(on_closed);
    auto* contents = Contents();
    if (!contents || !widget_)
      return false;
    const auto target = CenteredBounds();
    if (visible_) {
      widget_->SetBounds(target);
      contents->FocusWebContents();
      return true;
    }
    reload_after_hide_ = false;
    visible_ = true;
    animation_.Stop();
    phase_ = Phase::kNone;
    from_bounds_ = ReducedBounds(target);
    to_bounds_ = target;
    from_opacity_ = 0.01f;
    to_opacity_ = 1;
    const bool animate = gfx::Animation::ShouldRenderRichAnimation();
    widget_->SetBounds(animate ? from_bounds_ : target);
    opacity_ = animate ? from_opacity_ : 1;
    widget_->SetOpacity(opacity_);
    widget_->Show();
    widget_->Activate();
    contents->SetContentsVisible(true);
    contents->FocusWebContents();
    // Original types descriptor d6e3e34 is exactly {kKeyPressed}.
    monitor_ = views::EventMonitor::CreateApplicationMonitor(
        this, parent_->GetNativeWindow(), {ui::EventType::kKeyPressed});
    model_.Observe(browser->GetTabStripModel());
    if (animate) {
      phase_ = Phase::kShowing;
      animation_.SetDuration(base::Milliseconds(120));
      animation_.Start();
    }
    return true;
  }
  void Hide() {
    if (!visible_)
      return;
    visible_ = false;
    monitor_.reset();
    model_.Reset();
    if (auto* contents = Contents())
      contents->SetContentsVisible(false);
    animation_.Stop();
    phase_ = Phase::kNone;
    if (!widget_)
      return;
    from_bounds_ = widget_->GetWindowBoundsInScreen();
    to_bounds_ = ReducedBounds(from_bounds_);
    from_opacity_ = opacity_;
    to_opacity_ = 0;
    if (gfx::Animation::ShouldRenderRichAnimation()) {
      phase_ = Phase::kHiding;
      animation_.SetDuration(base::Milliseconds(90));
      animation_.Start();
    } else {
      FinishHide();
    }
  }
  void CloseAndReload() {
    reload_after_hide_ = true;
    auto alive = weak_factory_.GetWeakPtr();
    Hide();
    if (alive && !visible_ && !animation_.is_animating())
      ReloadIfRequested();
  }
  void Retire() {
    weak_factory_.InvalidateWeakPtrs();
    RetireWidget();
    widgets_.RemoveAllObservations();
    parent_.reset();
  }

  void AnimationProgressed(const gfx::Animation* animation) override {
    CHECK_EQ(animation, &animation_);
    ApplyFrame(animation->GetCurrentValue());
  }
  void AnimationEnded(const gfx::Animation* animation) override {
    CHECK_EQ(animation, &animation_);
    const auto phase = phase_;
    auto alive = weak_factory_.GetWeakPtr();
    ApplyFrame(1);
    if (!alive)
      return;
    phase_ = Phase::kNone;
    if (phase == Phase::kHiding && !visible_)
      FinishHide();
  }
  void AnimationCanceled(const gfx::Animation* animation) override {
    CHECK_EQ(animation, &animation_);
    phase_ = Phase::kNone;
  }
  void OnEvent(const ui::Event& event) override {
    if (!visible_ || event.type() != ui::EventType::kKeyPressed)
      return;
    const auto& key = *event.AsKeyEvent();
    if (ToggleKey(key))
      CloseAndReload();
    else if (key.key_code() == ui::VKEY_ESCAPE)
      Hide();
  }
  void OnWidgetActivationChanged(views::Widget* widget, bool active) override {
    if (widget == widget_.get() && !active && visible_)
      Hide();
  }
  void OnWidgetDestroying(views::Widget* widget) override {
    if (widget == parent_.get()) {
      Retire();
      return;
    }
    if (widget == widget_.get()) {
      monitor_.reset();
      model_.Reset();
      animation_.Stop();
      phase_ = Phase::kNone;
      visible_ = false;
      contents_.SetView(nullptr);
      widgets_.RemoveObservation(widget);
      widget_.reset();
    }
  }
  void OnTabStripModelChanged(TabStripModel* model,
      const TabStripModelChange& change,
      const TabStripSelectionChange& selection) override {
    // Original45a2014: active contents change or real insertion closes it.
    if (visible_ && model_.IsObservingSource(model) &&
        (selection.active_tab_changed() ||
         change.type() == TabStripModelChange::kInserted)) {
      Hide();
    }
  }
  void OnTabStripModelDestroyed(TabStripModel* model) override {
    if (model_.IsObservingSource(model)) {
      model_.Reset();
      Hide();
    }
  }

 private:
  enum class Phase { kNone, kShowing, kHiding };
  AuxTabSearchContentsView* Contents() const {
    return views::AsViewClass<AuxTabSearchContentsView>(contents_.view());
  }
  gfx::Rect CenteredBounds() const {
    const auto bounds = parent_->GetWindowBoundsInScreen();
    return gfx::Rect(bounds.x() + (bounds.width() - kSearchSize.width()) / 2,
                     bounds.y() + (bounds.height() - kSearchSize.height()) / 2,
                     kSearchSize.width(), kSearchSize.height());
  }
  static gfx::Rect ReducedBounds(const gfx::Rect& bounds) {
    const int width = std::max(1, static_cast<int>(bounds.width() * 0.96f));
    const int height = std::max(1, static_cast<int>(bounds.height() * 0.96f));
    return gfx::Rect(bounds.CenterPoint().x() - width / 2,
                     bounds.CenterPoint().y() - height / 2, width, height);
  }
  void ApplyFrame(double progress) {
    if (!widget_)
      return;
    const auto curve = phase_ == Phase::kHiding ? gfx::Tween::EASE_IN
                                               : gfx::Tween::FAST_OUT_SLOW_IN;
    const double value = gfx::Tween::CalculateValue(curve, progress);
    widget_->SetBounds(gfx::Tween::RectValueBetween(value, from_bounds_, to_bounds_));
    opacity_ = static_cast<float>(gfx::Tween::DoubleValueBetween(
        value, from_opacity_, to_opacity_));
    widget_->SetOpacity(opacity_);
  }
  void FinishHide() {
    auto alive = weak_factory_.GetWeakPtr();
    if (widget_) {
      widget_->Hide();
      if (!alive)
        return;
      if (widget_)
        widget_->SetOpacity(1);
    }
    if (!alive)
      return;
    opacity_ = 1;
    ReloadIfRequested();
    if (!alive)
      return;
    auto on_closed = std::move(on_closed_);
    if (on_closed)
      std::move(on_closed).Run();
  }
  void ReloadIfRequested() {
    if (reload_after_hide_) {
      reload_after_hide_ = false;
      if (auto* contents = Contents())
        contents->ReloadForNextShow();
    }
  }
  void RetireWidget() {
    monitor_.reset();
    model_.Reset();
    animation_.Stop();
    phase_ = Phase::kNone;
    visible_ = false;
    reload_after_hide_ = false;
    if (widget_) {
      auto widget = widget_;
      widgets_.RemoveObservation(widget.get());
      widget_.reset();
      contents_.SetView(nullptr);
      widget->CloseNow();
    }
    profile_.reset();
  }

  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<views::Widget> parent_;
  base::WeakPtr<views::Widget> widget_;
  base::WeakPtr<Profile> profile_;
  views::ViewTracker contents_;
  base::ScopedMultiSourceObservation<views::Widget, views::WidgetObserver>
      widgets_{this};
  base::ScopedObservation<TabStripModel, TabStripModelObserver> model_{this};
  std::unique_ptr<views::EventMonitor> monitor_;
  gfx::LinearAnimation animation_{this};
  Phase phase_ = Phase::kNone;
  gfx::Rect from_bounds_;
  gfx::Rect to_bounds_;
  float from_opacity_ = 1;
  float to_opacity_ = 1;
  float opacity_ = 1;
  bool visible_ = false;
  bool reload_after_hide_ = false;
  base::OnceClosure on_closed_;
  base::WeakPtrFactory<AuxProfileSearchOwner> weak_factory_{this};
};
}  // namespace aux

DEFINE_UI_CLASS_PROPERTY_TYPE(aux::AuxProfileSearchOwner*)
namespace {
DEFINE_OWNED_UI_CLASS_PROPERTY_KEY(aux::AuxProfileSearchOwner,
                                   kAuxProfileSearchOwner)
aux::AuxProfileSearchOwner* SearchOwner(BrowserWindowInterface* browser,
                                       bool create) {
  auto* view = browser ? BrowserView::GetBrowserViewForBrowser(browser) : nullptr;
  auto* parent = view ? view->GetWidget() : nullptr;
  if (!parent || parent->IsClosed())
    return nullptr;
  auto* owner = parent->GetProperty(kAuxProfileSearchOwner);
  if (!owner && create)
    owner = parent->SetProperty(kAuxProfileSearchOwner,
        std::make_unique<aux::AuxProfileSearchOwner>(*browser, *parent));
  return owner;
}
}  // namespace

void ToggleAuxProfileSearch(BrowserWindowInterface* browser, views::View* anchor) {
  auto* view = browser ? BrowserView::GetBrowserViewForBrowser(browser) : nullptr;
  if (!view)
    return;
  if (!aux::AgentInstalled(browser->GetProfile())) {
    if (auto* owner = SearchOwner(browser, false))
      owner->Hide();
    if (auto* host = view->GetTabSearchBubbleHost())
      host->ShowTabSearchBubble(true);
    return;
  }
  if (auto* host = view->GetTabSearchBubbleHost())
    host->CloseTabSearchBubble();
  if (auto* owner = SearchOwner(browser, true)) {
    if (owner->visible())
      owner->CloseAndReload();
    else
      owner->Show();
  }
}
void CloseAuxProfileSearch(BrowserWindowInterface* browser) {
  if (auto* owner = SearchOwner(browser, false))
    owner->Hide();
  if (auto* view = browser ? BrowserView::GetBrowserViewForBrowser(browser) : nullptr) {
    if (auto* host = view->GetTabSearchBubbleHost())
      host->CloseTabSearchBubble();
  }
}
views::Widget* ShowAuxTabSearchBubble(BrowserWindowInterface* browser,
                                     views::View* anchor,
                                     base::OnceClosure on_closed) {
  auto* owner = SearchOwner(browser, true);
  return owner && owner->Show(std::move(on_closed)) ? owner->widget() : nullptr;
}

BrowserWindowInterface* GetAuxProfileSearchBrowser(content::WebContents* contents) {
  auto* binding = contents ? aux::SearchBrowserBinding::FromWebContents(contents) : nullptr;
  return binding ? binding->browser() : nullptr;
}

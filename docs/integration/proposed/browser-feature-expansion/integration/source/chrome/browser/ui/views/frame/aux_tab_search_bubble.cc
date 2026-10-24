// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"
#include "chrome/browser/ui/aux_media_commands.h"
#include "chrome/browser/ui/aux_developer_commands.h"

#include <algorithm>
#include <map>
#include <memory>
#include <utility>

#include "base/check.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/browser/autocomplete/autocomplete_classifier_factory.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/ui/aux_keyboard_shortcuts.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "components/omnibox/browser/autocomplete_classifier.h"
#include "components/omnibox/browser/autocomplete_match.h"
#include "components/omnibox/browser/omnibox_pref_names.h"
#include "components/prefs/pref_service.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_multi_source_observation.h"
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
  void Begin(AuxCommandBarMode mode) {
    proposal_.reset();
    mode_ = mode;
    generation_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
    auto* owner = browser();
    auto* tab = owner ? owner->GetActiveTabInterface() : nullptr;
    auto* contents = tab ? tab->GetContents() : nullptr;
    target_ = contents ? contents->GetWeakPtr() : nullptr;
    auto* entry = contents ? contents->GetController().GetLastCommittedEntry() : nullptr;
    navigation_id_ = entry ? entry->GetUniqueID() : 0;
  }
  void Invalidate() { generation_.clear(); target_.reset(); proposal_.reset(); }
  void SetProposal(base::DictValue proposal) { proposal_ = std::move(proposal); }
  const base::DictValue* proposal() const { return proposal_ ? &*proposal_ : nullptr; }
  void ConsumeProposal() { proposal_.reset(); }
  content::WebContents* target() { return target_.get(); }
  AuxCommandBarMode mode() const { return mode_; }
  const std::string& generation() const { return generation_; }
  bool current() {
    auto* owner = browser();
    auto* tab = owner ? owner->GetActiveTabInterface() : nullptr;
    auto* contents = tab ? tab->GetContents() : nullptr;
    if (generation_.empty() || !owner || contents != target_.get()) return false;
    if (contents && contents->GetBrowserContext() != owner->GetProfile()) return false;
    auto* entry = contents ? contents->GetController().GetLastCommittedEntry() : nullptr;
    return (entry ? entry->GetUniqueID() : 0) == navigation_id_;
  }
 private:
  friend class content::WebContentsUserData<SearchBrowserBinding>;
  SearchBrowserBinding(content::WebContents* contents, BrowserWindowInterface& browser)
      : content::WebContentsUserData<SearchBrowserBinding>(*contents),
        browser_(browser.GetWeakPtr()) {}
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<content::WebContents> target_;
  AuxCommandBarMode mode_ = AuxCommandBarMode::kSearchTabs;
  std::string generation_;
  int navigation_id_ = 0;
  std::optional<base::DictValue> proposal_;
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
  void BeginInvocation(AuxCommandBarMode mode,
                       std::optional<base::DictValue> proposal) {
    if (auto* binding = SearchBrowserBinding::FromWebContents(webview_->GetWebContents())) {
      binding->Begin(mode);
      if (proposal) binding->SetProposal(std::move(*proposal));
    }
    ReloadForNextShow();
  }
  void InvalidateInvocation() {
    if (auto* binding = SearchBrowserBinding::FromWebContents(webview_->GetWebContents()))
      binding->Invalidate();
  }
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

  bool Show(base::OnceClosure on_closed = {},
            AuxCommandBarMode mode = AuxCommandBarMode::kSearchTabs,
            std::optional<base::DictValue> proposal = std::nullopt) {
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
    contents->BeginInvocation(mode, std::move(proposal));
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
    observed_model_ = browser->GetTabStripModel();
    if (observed_model_)
      observed_model_->AddObserver(this);
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
    if (auto* contents = Contents()) contents->InvalidateInvocation();
    monitor_.reset();
    StopModelObservation();
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
      StopModelObservation();
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
    if (visible_ && observed_model_ == model &&
        (selection.active_tab_changed() ||
         change.type() == TabStripModelChange::kInserted)) {
      Hide();
    }
  }
  void OnTabStripModelDestroyed(TabStripModel* model) override {
    if (observed_model_ != model)
      return;
    //155's base observer has already removed the destroyed model from its
    // own registry before delivering this callback. Retire the SAME source.
    observed_model_ = nullptr;
    Hide();
  }

 private:
  enum class Phase { kNone, kShowing, kHiding };
  void StopModelObservation() {
    observed_model_ = nullptr;
    TabStripModelObserver::StopObservingAll(this);
  }
  AuxTabSearchContentsView* Contents() {
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
    StopModelObservation();
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
  raw_ptr<TabStripModel> observed_model_ = nullptr;
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

namespace {
base::DictValue CommandFailure(std::string error) {
  base::DictValue result;
  result.Set("success", false);
  result.Set("error", std::move(error));
  return result;
}
const char* CommandModeName(AuxCommandBarMode mode) {
  switch (mode) {
    case AuxCommandBarMode::kSearchTabs: return "tabs";
    case AuxCommandBarMode::kNewTab: return "new-tab";
    case AuxCommandBarMode::kNavigate: return "navigate";
    case AuxCommandBarMode::kCommands: return "commands";
    case AuxCommandBarMode::kTidy: return "tidy";
  }
}
}
bool ShowAuxCommandBar(BrowserWindowInterface* browser, AuxCommandBarMode mode) {
  auto* owner = SearchOwner(browser, true);
  return owner && owner->Show({}, mode);
}
base::DictValue GetAuxCommandContext(content::WebContents* sender) {
  auto* binding = sender ? aux::SearchBrowserBinding::FromWebContents(sender) : nullptr;
  if (!binding || !binding->current()) return CommandFailure("Command context expired");
  auto* browser = binding->browser();
  base::DictValue result;
  result.Set("success", true);
  result.Set("mode", CommandModeName(binding->mode()));
  result.Set("generation", binding->generation());
  result.Set("windowId", browser->GetSessionID().id());
  result.Set("nativeProfileId", browser->GetProfile()->GetPath().BaseName().AsUTF8Unsafe());
  result.Set("incognito", browser->GetProfile()->IsOffTheRecord());
  result.Set("alwaysShowFullUrl", browser->GetProfile()->GetPrefs()->GetBoolean(
      omnibox::kPreventUrlElisionsInOmnibox));
  if (auto* target = binding->target()) {
    result.Set("activeTabId", extensions::ExtensionTabUtil::GetTabId(target));
    result.Set("pictureInPicture", GetAuxVideoPictureInPictureState(target));
    result.Set("developer", GetAuxDeveloperCommandState(browser->GetProfile(), target));
    // The actual loaded URL, never a logical-tab URL from another view.
    result.Set("activeUrl", target->GetLastCommittedURL().spec());
  }
  result.Set("commands", aux::GetNavigationCommandCatalog(browser));
  base::ListValue native_tabs;
  if (auto* strip = browser->GetTabStripModel())
    for (int i = 0; i < strip->count(); ++i)
      native_tabs.Append(extensions::ExtensionTabUtil::GetTabId(strip->GetWebContentsAt(i)));
  result.Set("windowTabIds", std::move(native_tabs));
  auto* profile = browser->GetProfile();
  auto* owner = aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile);
  auto* model = owner && owner->EnsureCurrentBinding() ? owner->model() : nullptr;
  auto* controller = aux::AuxOrganizationWindowController::FromBrowser(browser);
  if (IsAuxLocalProfileAdmitted(profile) && owner &&
      model && !model->blocked() && !model->pending() && controller && controller->IsProjectionReady()) {
    const auto& snapshot = model->snapshot();
    const auto views = controller->SnapshotViews();
    std::map<std::string, const base::DictValue*> views_by_id;
    for (const auto& value : views) {
      const auto& view = value.GetDict();
      if (const auto* id = view.FindString("id")) views_by_id.try_emplace(*id, &view);
    }
    base::ListValue spaces, logical_tabs;
    for (const auto& [id, space] : snapshot.spaces)
      spaces.Append(base::DictValue().Set("id", id).Set("title", space.name)
          .Set("icon", space.icon).Set("order", base::NumberToString(space.order)));
    for (const auto& [id, entry] : snapshot.entries) {
      if (entry.archived || entry.kind != aux::organization::EntryKind::kTab) continue;
      base::DictValue row;
      row.Set("id", id);
      row.Set("title", entry.title);
      row.Set("url", entry.current_url);
      row.Set("spaceId", entry.space_id);
      row.Set("pinned", entry.space_id.empty());
      if (const auto found = views_by_id.find(id); found != views_by_id.end()) {
        const auto& view = *found->second;
        if (const auto native_id = view.FindInt("nativeTabId")) row.Set("nativeTabId", *native_id);
        // A live view's real URL/title always wins over shared canonical metadata.
        if (const auto* url = view.FindString("url")) row.Set("url", *url);
        if (const auto* title = view.FindString("title")) row.Set("title", *title);
      }
      logical_tabs.Append(std::move(row));
    }
    result.Set("organization", base::DictValue().Set("ownerGeneration", owner->owner_generation())
        .Set("revision", base::NumberToString(snapshot.revision))
        .Set("activeSpaceId", controller->ActiveSpaceId())
        .Set("spaces", std::move(spaces)).Set("tabs", std::move(logical_tabs)));
  }
  if (const auto* proposal = binding->proposal())
    result.Set("organizationProposal", proposal->Clone());
  return result;
}
void CommitAuxCommandAsync(content::WebContents* sender, const base::DictValue& request,
                           base::OnceCallback<void(base::DictValue)> reply) {
  const auto* kind = request.FindString("kind");
  if (!kind || (*kind != "activate-logical-tab" && *kind != "select-space")) {
    std::move(reply).Run(CommitAuxCommand(sender, request)); return;
  }
  auto* binding = sender ? aux::SearchBrowserBinding::FromWebContents(sender) : nullptr;
  const auto* generation = request.FindString("generation");
  const auto* owner_generation = request.FindString("organizationOwner");
  const auto* revision = request.FindString("organizationRevision");
  const auto* id = request.FindString("id");
  if (!binding || !binding->current() || !generation || *generation != binding->generation() ||
      !owner_generation || !revision || !id || id->empty() || id->size() > 64 ||
      owner_generation->size() > 256 || revision->size() > 20) {
    std::move(reply).Run(CommandFailure("The organization command expired; reopen the command bar")); return;
  }
  auto* browser = binding->browser();
  auto* profile = browser->GetProfile();
  auto* owner = aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile);
  auto* model = owner && owner->EnsureCurrentBinding() ? owner->model() : nullptr;
  auto* controller = aux::AuxOrganizationWindowController::FromBrowser(browser);
  if (!IsAuxLocalProfileAdmitted(profile) || !owner ||
      !model || model->blocked() || model->pending() || !controller || !controller->IsProjectionReady() ||
      owner->owner_generation() != *owner_generation || base::NumberToString(model->snapshot().revision) != *revision) {
    std::move(reply).Run(CommandFailure("Tabs or Spaces changed; reopen the command bar")); return;
  }
  std::string target_space;
  if (*kind == "select-space") {
    if (!model->snapshot().spaces.contains(*id)) {
      std::move(reply).Run(CommandFailure("This Space is no longer available")); return;
    }
    target_space = *id;
  } else {
    const auto entry = model->snapshot().entries.find(*id);
    if (entry == model->snapshot().entries.end() || entry->second.archived ||
        entry->second.kind != aux::organization::EntryKind::kTab) {
      std::move(reply).Run(CommandFailure("This tab is no longer available")); return;
    }
    target_space = entry->second.space_id;
  }
  const auto browser_weak = browser->GetWeakPtr();
  const auto profile_weak = profile->GetWeakPtr();
  const auto owner_token = owner->owner_generation();
  binding->Invalidate();
  if (!target_space.empty() && !controller->SelectSpace(target_space)) {
    std::move(reply).Run(CommandFailure("This window could not select the Space")); return;
  }
  auto completion = base::BindOnce([](base::WeakPtr<BrowserWindowInterface> browser,
      base::WeakPtr<Profile> profile, std::string owner_token,
      base::OnceCallback<void(base::DictValue)> reply, bool opened) {
    auto* owner = profile ? aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile.get()) : nullptr;
    if (!opened || !browser || !profile || browser->GetProfile() != profile.get() ||
        !IsAuxLocalProfileAdmitted(profile.get()) || !owner ||
        !owner->EnsureCurrentBinding() || owner->owner_generation() != owner_token) {
      std::move(reply).Run(CommandFailure("The tab or originating window changed; reopen the command bar")); return;
    }
    CloseAuxProfileSearch(browser.get());
    std::move(reply).Run(base::DictValue().Set("success", true));
  }, browser_weak, profile_weak, owner_token, std::move(reply));
  if (*kind == "select-space") { std::move(completion).Run(true); return; }
  // The native controller reuses this window's exact logical view or creates a
  // separate view here; it never steals another window or deduplicates by URL.
  controller = browser_weak && profile_weak && browser_weak->GetProfile() == profile_weak.get()
      ? aux::AuxOrganizationWindowController::FromBrowser(browser_weak.get()) : nullptr;
  auto* current_owner = profile_weak ? aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile_weak.get()) : nullptr;
  if (!controller || !controller->IsProjectionReady() || !current_owner ||
      !current_owner->EnsureCurrentBinding() || current_owner->owner_generation() != owner_token ||
      !IsAuxLocalProfileAdmitted(profile_weak.get())) {
    std::move(completion).Run(false); return;
  }
  controller->OpenLogicalTab(*id, std::move(completion));
}
base::DictValue CommitAuxCommand(content::WebContents* sender,
                                const base::DictValue& request) {
  auto* binding = sender ? aux::SearchBrowserBinding::FromWebContents(sender) : nullptr;
  const auto* generation = request.FindString("generation");
  const auto* kind = request.FindString("kind");
  if (!binding || !binding->current() || !generation ||
      *generation != binding->generation() || !kind)
    return CommandFailure("Command context expired; reopen the command bar");
  auto* browser = binding->browser();
  auto browser_weak = browser->GetWeakPtr();
  if (*kind == "command") {
    const auto command = request.FindInt("commandId");
    if (!command || !aux::IsNavigationCommand(*command) ||
        !chrome::IsCommandEnabled(browser, *command))
      return CommandFailure("Command is unavailable in this window");
    // Consume before dispatch: commands may reenter, close the active tab or
    // create a new invocation. A repeated/late renderer submission cannot replay.
    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!browser_weak || !chrome::ExecuteCommand(browser_weak.get(), *command))
      return CommandFailure("Command could not be completed");
  } else if (*kind == "activate-tab") {
    const auto tab_id = request.FindInt("tabId");
    auto* model = browser->GetTabStripModel();
    int index = -1;
    if (tab_id && model) {
      for (int i = 0; i < model->count(); ++i) {
        if (extensions::ExtensionTabUtil::GetTabId(model->GetWebContentsAt(i)) == *tab_id) {
          index = i;
          break;
        }
      }
    }
    // The shared logical-view resolver will supply a same-window view for tabs
    // projected from another window. Never focus a foreign window as fallback.
    if (index < 0) return CommandFailure("This tab has no view in the current window");
    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!browser_weak) return CommandFailure("Window closed");
    model->ActivateTabAt(index);
  } else if (*kind == "navigate") {
    const auto* text = request.FindString("text");
    if (!text || text->size() > 32768 ||
        base::TrimWhitespaceASCII(*text, base::TRIM_ALL).empty())
      return CommandFailure("Enter a URL or search");
    AutocompleteMatch match;
    auto* classifier = AutocompleteClassifierFactory::GetForProfile(browser->GetProfile());
    if (!classifier) return CommandFailure("Search is unavailable");
    classifier->Classify(base::UTF8ToUTF16(*text), false, false,
                        metrics::OmniboxEventProto::OTHER, &match, nullptr);
    const auto& url = match.destination_url;
    // Explicit user entry accepts ordinary browser navigation, not executable
    // payloads, arbitrary external protocols or raw local-file access.
    if (!url.is_valid() || !(url.SchemeIsHTTPOrHTTPS() || url.SchemeIs("chrome") ||
        (url.SchemeIs("about") && url.path() == "blank")))
      return CommandFailure("This address cannot be opened from the command bar");
    NavigateParams params(browser, url, match.transition);
    params.source_contents = binding->target();
    params.disposition = binding->mode() == AuxCommandBarMode::kNavigate
        ? WindowOpenDisposition::CURRENT_TAB : WindowOpenDisposition::NEW_FOREGROUND_TAB;
    if (params.disposition == WindowOpenDisposition::CURRENT_TAB && !binding->target())
      return CommandFailure("The selected page is no longer available");
    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!browser_weak) return CommandFailure("Window closed");
    Navigate(&params);
  } else {
    return CommandFailure("Unsupported command");
  }
  base::DictValue result;
  result.Set("success", true);
  return result;
}

bool ShowAuxOrganizationProposal(BrowserWindowInterface* browser,
                                 base::DictValue proposal) {
  const auto* id = proposal.FindString("proposalId");
  auto encoded = base::WriteJson(proposal);
  if (!id || id->empty() || id->size() > 64 || !encoded || encoded->size() > 131072)
    return false;
  auto* owner = SearchOwner(browser, true);
  return owner && owner->Show({}, AuxCommandBarMode::kTidy, std::move(proposal));
}
std::optional<base::DictValue> GetAuxOrganizationProposal(
    content::WebContents* sender, std::string_view proposal_id) {
  auto* binding = sender ? aux::SearchBrowserBinding::FromWebContents(sender) : nullptr;
  if (!binding || !binding->current() || binding->mode() != AuxCommandBarMode::kTidy)
    return std::nullopt;
  const auto* proposal = binding->proposal();
  const auto* id = proposal ? proposal->FindString("proposalId") : nullptr;
  if (!id || *id != proposal_id) return std::nullopt;
  return proposal->Clone();
}
bool ConsumeAuxOrganizationProposal(content::WebContents* sender,
                                    std::string_view proposal_id) {
  if (!GetAuxOrganizationProposal(sender, proposal_id)) return false;
  aux::SearchBrowserBinding::FromWebContents(sender)->ConsumeProposal();
  return true;
}

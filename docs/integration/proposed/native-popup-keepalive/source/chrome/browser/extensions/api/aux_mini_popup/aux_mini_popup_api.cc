// Copyright 2026 Aux Authors. All rights reserved.
// Independently authored native popup and global shortcut: apis-core A4.
#include "chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.h"

#include "base/auto_reset.h"
#include "base/functional/bind.h"
#include "base/logging.h"
#include "base/memory/raw_ptr.h"
#include "base/no_destructor.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/thread_pool.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/extensions/api/aux_account/aux_account_api.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/select_file_policy/chrome_select_file_policy.h"
#include "components/keep_alive_registry/keep_alive_types.h"
#include "components/keep_alive_registry/scoped_keep_alive.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_delegate.h"
#include "net/base/url_util.h"
#include "third_party/skia/include/core/SkColor.h"
#include "third_party/skia/include/core/SkRegion.h"
#include "ui/base/accelerators/accelerator.h"
#include "ui/base/accelerators/accelerator_manager.h"
#include "ui/base/accelerators/command.h"
#include "ui/base/accelerators/global_accelerator_listener/global_accelerator_listener.h"
#include "ui/base/window_open_disposition.h"
#include "ui/display/display.h"
#include "ui/display/screen.h"
#include "ui/gfx/animation/linear_animation.h"
#include "ui/gfx/animation/tween.h"
#include "ui/gfx/geometry/rounded_corners_f.h"
#include "ui/shell_dialogs/selected_file_info.h"
#include "ui/views/controls/webview/web_contents_set_background_color.h"
#include "ui/views/controls/webview/webview.h"
#include "ui/views/focus/focus_manager.h"
#include "ui/views/widget/widget.h"
#include "ui/views/widget/widget_delegate.h"
#include "ui/views/widget/widget_observer.h"
namespace extensions {
AuxMiniPopupFunction::AuxMiniPopupFunction() = default;
AuxMiniPopupFunction::~AuxMiniPopupFunction() {
  if (dialog_) {
    dialog_->ListenerDestroyed();
  }
}
void CaptureAuxPopupActivation();
void ClearAuxPopupActivation();
void RestoreAuxPopupActivation();
namespace {
constexpr char kEnabled[] = "aux.popup.enabled",
               kShortcut[] = "aux.popup.shortcut";
void ApplyTransparentPopupBackground(content::WebContents* contents) {
  using Background = views::WebContentsSetBackgroundColor;
  // The supplied helper updates an existing observer;155's create-only helper
  // needs its old color observer replaced before attachment.
  if (const auto* existing = Background::FromWebContents(contents);
      existing && existing->color() != SK_ColorTRANSPARENT) {
    contents->RemoveUserData(Background::UserDataKey());
  }
  Background::CreateForWebContentsWithColor(contents, SK_ColorTRANSPARENT);
  contents->SetPageBaseBackgroundColor(SK_ColorTRANSPARENT);
  if (auto* view = contents->GetRenderWidgetHostView()) {
    view->SetBackgroundColor(SK_ColorTRANSPARENT);
    view->SetBackgroundColorOverride(SK_ColorTRANSPARENT);
  }
}
base::ListValue ProfileIdentity(Profile* profile) {
  base::DictValue row;
  row.Set("profileId",
          aux::ProfileIdForPath(profile->GetOriginalProfile()->GetPath()));
  row.Set("profilePath", profile->GetOriginalProfile()->GetPath().value());
  base::ListValue result;
  result.Append(std::move(row));
  return result;
}
gfx::Rect InitialPopupBounds(const gfx::Size& size) {
  auto* screen = display::Screen::Get();
  const auto area =
      screen->GetDisplayNearestPoint(screen->GetCursorScreenPoint())
          .work_area();
  gfx::Rect bounds(area.x() + (area.width() - size.width()) / 2,
                   area.y() + area.height() / 3, size.width(), size.height());
  bounds.AdjustToFit(area);
  return bounds;
}

bool IsPopupMostlyVisible(const gfx::Rect& bounds) {
  SkRegion visible;
  for (const auto& display : display::Screen::Get()->GetAllDisplays()) {
    const auto intersection = gfx::IntersectRects(bounds, display.work_area());
    visible.op(SkIRect::MakeLTRB(intersection.x(), intersection.y(),
                                 intersection.right(), intersection.bottom()),
               SkRegion::kUnion_Op);
  }
  int64_t visible_area = 0;
  for (SkRegion::Iterator rectangle(visible); !rectangle.done();
       rectangle.next()) {
    visible_area += static_cast<int64_t>(rectangle.rect().width()) *
                    rectangle.rect().height();
  }
  return visible_area >
         static_cast<int64_t>(bounds.width()) * bounds.height() / 2;
}

class PopupBoundsAnimation : public gfx::LinearAnimation {
 public:
  PopupBoundsAnimation(views::Widget* widget, const gfx::Rect& target)
      : gfx::LinearAnimation(base::Milliseconds(180), 60, nullptr),
        widget_(widget),
        start_(widget->GetWindowBoundsInScreen()),
        target_(target) {}

 private:
  void AnimateToState(double state) override {
    if (!widget_->IsClosed()) {
      widget_->SetBounds(gfx::Tween::RectValueBetween(
          gfx::Tween::CalculateValue(gfx::Tween::EASE_IN_OUT_EMPHASIZED, state),
          start_, target_));
    }
  }

  const raw_ptr<views::Widget> widget_;
  const gfx::Rect start_;
  const gfx::Rect target_;
};

void SetPopupBounds(views::Widget* widget,
                    const gfx::Rect& target,
                    std::unique_ptr<PopupBoundsAnimation>& animation) {
  animation.reset();
  if (widget->GetWindowBoundsInScreen() == target) {
    return;
  }
  // Pre-show host setup remains immediate; supplied content resize calls are
  // accepted only for the live visible popup.
  if (!widget->IsVisible()) {
    widget->SetBoundsConstrained(target);
    return;
  }
  if (gfx::Animation::PrefersReducedMotion()) {
    widget->SetBounds(target);
    return;
  }
  animation = std::make_unique<PopupBoundsAnimation>(widget, target);
  animation->Start();
}

class PopupManager : public ui::GlobalAcceleratorListener::Observer,
                     public ui::AcceleratorTarget,
                     public views::WidgetObserver,
                     public ProfileObserver,
                     public content::WebContentsDelegate {
 public:
  static PopupManager& Get() {
    static base::NoDestructor<PopupManager> manager;
    return *manager;
  }
  void Initialize(Profile* profile) {
    ObservePreferences();
    auto* prefs = g_browser_process->local_state();
    if (!profile || profile->IsOffTheRecord() || registered_ ||
        !prefs || !prefs->GetBoolean(kEnabled)) {
      return;
    }
    if (auto error = Configure(profile, true, prefs->GetString(kShortcut))) {
      LOG(WARNING) << "Aux mini popup global shortcut unavailable: " << *error;
    }
  }
  void SetEnabledPreference(PrefService* prefs, bool enabled) {
    base::AutoReset<bool> writing(&writing_preference_, true);
    prefs->SetBoolean(kEnabled, enabled);
  }
  void SetShortcutPreference(PrefService* prefs, const std::string& shortcut) {
    base::AutoReset<bool> writing(&writing_preference_, true);
    prefs->SetString(kShortcut, shortcut);
  }
  void Shutdown() {
    pref_registrar_.Reset();
    if (registered_) {
      if (auto* listener = ui::GlobalAcceleratorListener::GetInstance()) {
        listener->UnregisterAccelerator(accelerator_, this);
      }
    }
    registered_ = false;
    accelerator_ = ui::Accelerator();
    Hide();
    DestroyWindows();
    dismiss_.Stop();
    profile_observer_.Reset();
    profile_.reset();
    keep_alive_.reset();
  }
  std::optional<std::string> Configure(Profile* profile,
                                       bool enabled,
                                       std::string shortcut) {
    auto* listener = ui::GlobalAcceleratorListener::GetInstance();
    const auto accelerator = ui::Command::StringToAccelerator(shortcut);
    if (enabled) {
      if (accelerator.key_code() == ui::VKEY_UNKNOWN) {
        return "Shortcut is not valid";
      }
      if (!listener || listener->IsShortcutHandlingSuspended()) {
        return "Global shortcut registration is unavailable";
      }
      if (!registered_ || accelerator_ != accelerator) {
        if (!listener->RegisterAccelerator(accelerator, this)) {
          return "Global shortcut is already in use or was denied";
        }
        if (registered_) {
          listener->UnregisterAccelerator(accelerator_, this);
        }
      }
      registered_ = true;
      accelerator_ = accelerator;
      if (!keep_alive_) {
        keep_alive_ = std::make_unique<ScopedKeepAlive>(
            KeepAliveOrigin::AUX_MINI_POPUP, KeepAliveRestartOption::ENABLED);
      }
      BindProfile(profile);
    } else {
      if (registered_ && listener) {
        listener->UnregisterAccelerator(accelerator_, this);
      }
      registered_ = false;
      accelerator_ = ui::Accelerator();
      Hide();
      DestroyWindows();
      dismiss_.Stop();
      size_ = gfx::Size(440, 92);
      keep_alive_.reset();
    }
    return std::nullopt;
  }
  void BindProfile(Profile* profile) {
    if (profile_.get() == profile) {
      return;
    }
    Hide();
    profile_observer_.Reset();
    DestroyWindows();
    // Hiding the old native windows can enqueue an activation dismissal.
    dismiss_.Stop();
    size_ = gfx::Size(440, 92);
    profile_ = profile->GetWeakPtr();
    profile_observer_.Observe(profile);
  }
  void ShowFor(Profile* profile) {
    BindProfile(profile);
    const uint64_t generation = ++generation_;
    FetchAuxProfileSecurity(
        aux::StateHome(), ProfileIdentity(profile),
        base::BindOnce(
            [](uint64_t generation, base::WeakPtr<Profile> profile,
               base::ListValue rows) {
              auto& manager = Get();
              if (manager.generation_ != generation || !profile ||
                  manager.profile_.get() != profile.get()) {
                return;
              }
              const bool locked =
                  rows.empty() ||
                  rows[0].GetDict().FindBool("isLocked").value_or(true);
              manager.Show(locked);
            },
            generation, profile->GetWeakPtr()));
  }
  void Show(bool locked) {
    const GURL url("chrome-extension://" + std::string(aux::kAgentExtensionId) +
                   (locked ? "/main.html#/" : "/minipopup.html#/"));
    if (!widget_ || widget_->IsClosed()) {
      DestroyWindows();
      delegate_ = std::make_unique<views::WidgetDelegate>();
      auto webview = std::make_unique<views::WebView>(profile_.get());
      webview_ = webview.get();
      ApplyTransparentPopupBackground(webview_->GetWebContents(url));
      delegate_->SetContentsView(std::move(webview));
      widget_ = std::make_unique<views::Widget>();
      views::Widget::InitParams params(
          views::Widget::InitParams::CLIENT_OWNS_WIDGET,
          views::Widget::InitParams::TYPE_POPUP);
      params.delegate = delegate_.get();
      params.name = "DesktopMediaPickerVisualEffect";
      params.rounded_corners = gfx::RoundedCornersF(16);
      params.opacity = views::Widget::InitParams::WindowOpacity::kTranslucent;
      widget_->Init(std::move(params));
      widget_->AddObserver(this);
      widget_->GetFocusManager()->RegisterAccelerator(
          ui::Accelerator(ui::VKEY_ESCAPE, ui::EF_NONE),
          ui::AcceleratorManager::kHighPriority, this);
      widget_->SetBoundsConstrained(InitialPopupBounds(size_));
    }
    if (loaded_entry_url_ != url ||
        webview_->GetWebContents()->GetBrowserContext() != profile_.get()) {
      webview_->LoadInitialURL(url);
      loaded_entry_url_ = url;
    }
    webview_->GetWebContents()->SetDelegate(this);
    if (!IsPopupMostlyVisible(widget_->GetWindowBoundsInScreen())) {
      widget_->SetBoundsConstrained(InitialPopupBounds(size_));
    }
    CaptureAuxPopupActivation();
    widget_->Show();
    webview_->RequestFocus();
  }
  void RequestHide() {
    RestoreAuxPopupActivation();
    Hide();
  }
  void Hide() {
    ClearAuxPopupActivation();
    ++generation_;
    dismiss_.Stop();
    bounds_animation_.reset();
    options_bounds_animation_.reset();
    if (options_) {
      options_->Hide();
    }
    if (widget_) {
      widget_->Hide();
    }
  }
  void DestroyWindows() {
    ClearAuxPopupActivation();
    picker_pending_ = false;
    loaded_entry_url_ = GURL();
    bounds_animation_.reset();
    options_bounds_animation_.reset();
    options_webview_ = nullptr;
    if (options_) {
      options_->RemoveObserver(this);
      options_.reset();
    }
    options_delegate_.reset();
    if (widget_) {
      widget_->RemoveObserver(this);
      if (widget_->GetFocusManager()) {
        widget_->GetFocusManager()->UnregisterAccelerators(this);
      }
      widget_.reset();
    }
    webview_ = nullptr;
    delegate_.reset();
  }
  void Resize(gfx::Size size) {
    size_ = size;
    if (!widget_ || widget_->IsClosed()) {
      return;
    }
    const auto current = widget_->GetWindowBoundsInScreen();
    gfx::Rect bounds(current.x() + (current.width() - size.width()) / 2,
                     current.y() + (current.height() - size.height()) / 2,
                     size.width(), size.height());
    bounds.AdjustToFit(display::Screen::Get()
                           ->GetDisplayNearestPoint(bounds.CenterPoint())
                           .work_area());
    SetPopupBounds(widget_.get(), bounds, bounds_animation_);
  }
  bool IsMainContents(content::WebContents* source) const {
    return widget_ && !widget_->IsClosed() && widget_->IsVisible() &&
           webview_ && source == webview_->web_contents();
  }
  bool IsOptionContents(content::WebContents* source) const {
    return options_ && !options_->IsClosed() && options_webview_ &&
           source == options_webview_->web_contents();
  }
  content::WebContents* AddNewContents(
      content::WebContents* source,
      std::unique_ptr<content::WebContents> new_contents,
      const GURL& target_url,
      WindowOpenDisposition disposition,
      const blink::mojom::WindowFeatures&,
      bool,
      bool* was_blocked) override {
    int left, top, width, height;
    std::string value;
    const auto read = [&](const char* key, int& result) {
      return net::GetValueForKeyInQuery(target_url, key, &value) &&
             base::StringToInt(value, &result);
    };
    if (!IsMainContents(source) ||
        disposition != WindowOpenDisposition::NEW_POPUP ||
        !target_url.SchemeIs("chrome-extension") ||
        target_url.host() != aux::kAgentExtensionId || !read("left", left) ||
        !read("top", top) || !read("width", width) || !read("height", height) ||
        width <= 0 || height <= 0) {
      if (was_blocked) {
        *was_blocked = true;
      }
      return nullptr;
    }
    options_bounds_animation_.reset();
    options_webview_ = nullptr;
    if (options_) {
      options_->RemoveObserver(this);
      options_.reset();
    }
    options_delegate_ = std::make_unique<views::WidgetDelegate>();
    auto contents = std::make_unique<views::WebView>(profile_.get());
    options_webview_ = contents.get();
    ApplyTransparentPopupBackground(new_contents.get());
    options_webview_->SetOwnedWebContents(std::move(new_contents));
    auto* child = options_webview_->GetWebContents();
    child->SetDelegate(this);
    options_delegate_->SetContentsView(std::move(contents));
    options_ = std::make_unique<views::Widget>();
    views::Widget::InitParams params(
        views::Widget::InitParams::CLIENT_OWNS_WIDGET,
        views::Widget::InitParams::TYPE_POPUP);
    params.delegate = options_delegate_.get();
    params.name = "DesktopMediaPickerVisualEffect";
    params.rounded_corners = gfx::RoundedCornersF(12);
    params.opacity = views::Widget::InitParams::WindowOpacity::kTranslucent;
    options_->Init(std::move(params));
    options_->AddObserver(this);
    gfx::Rect bounds(left, top, width, height);
    bounds.AdjustToFit(display::Screen::Get()
                           ->GetDisplayNearestPoint(bounds.CenterPoint())
                           .work_area());
    options_->SetBoundsConstrained(bounds);
    if (net::GetValueForKeyInQuery(target_url, "focus", &value) &&
        value == "false") {
      options_->ShowInactive();
    } else {
      options_->Show();
      options_webview_->RequestFocus();
    }
    return child;
  }
  void CloseContents(content::WebContents* source) override {
    if (IsOptionContents(source)) {
      options_bounds_animation_.reset();
      options_->Close();
    } else if (IsMainContents(source)) {
      RequestHide();
    }
  }
  std::optional<std::string> ResizeOptions(content::WebContents* source,
                                           gfx::Size size) {
    if (!IsOptionContents(source)) {
      return "Option window is unavailable for this calling page";
    }
    auto bounds = options_->GetWindowBoundsInScreen();
    bounds.set_y(bounds.bottom() - size.height());
    bounds.set_size(size);
    bounds.AdjustToFit(
        display::Screen::Get()
            ->GetDisplayNearestWindow(options_->GetNativeWindow())
            .work_area());
    SetPopupBounds(options_.get(), bounds, options_bounds_animation_);
    return std::nullopt;
  }
  void SetState(std::string state) {
    if (state == "compact") {
      Resize(gfx::Size(440, 92));
    } else if (state == "compact-with-attachments") {
      Resize(gfx::Size(440, 148));
    } else {
      Resize(gfx::Size(440, 534));
    }
  }
  void OnKeyPressed(const ui::Accelerator&) override {
    if (auto* active =
            GlobalBrowserCollection::GetInstance()->GetActiveBrowser()) {
      ShowFor(active->GetProfile());
    } else if (profile_) {
      ShowFor(profile_.get());
    }
  }
  void ExecuteCommand(const std::string&, const std::string&) override {
    OnKeyPressed(accelerator_);
  }
  bool AcceleratorPressed(const ui::Accelerator&) override {
    RequestHide();
    return true;
  }
  bool CanHandleAccelerators() const override {
    return widget_ && widget_->IsVisible();
  }
  void OnWidgetActivationChanged(views::Widget*, bool active) override {
    if (active) {
      dismiss_.Stop();
      return;
    }
    dismiss_.Start(FROM_HERE, base::Milliseconds(100), base::BindOnce([] {
                     auto& manager = Get();
                     if (!manager.picker_pending_ &&
                         (!manager.widget_ || !manager.widget_->IsActive()) &&
                         (!manager.options_ || !manager.options_->IsActive())) {
                       manager.Hide();
                     }
                   }));
  }
  void OnProfileWillBeDestroyed(Profile*) override {
    Hide();
    DestroyWindows();
    profile_observer_.Reset();
    profile_.reset();
    if (registered_) {
      if (auto* listener = ui::GlobalAcceleratorListener::GetInstance();
          listener) {
        listener->UnregisterAccelerator(accelerator_, this);
      }
    }
    registered_ = false;
    keep_alive_.reset();
  }
  std::optional<std::string> BeginDirectoryPicker(
      content::WebContents* source) {
    if (!widget_ || widget_->IsClosed() || !widget_->IsVisible() ||
        !OwnsPopupContents(source)) {
      return "Aux mini popup unavailable";
    }
    if (picker_pending_) {
      return "Folder picker request already in progress";
    }
    picker_pending_ = true;
    return std::nullopt;
  }
  void FinishDirectoryPicker(content::WebContents* source) {
    if (OwnsPopupContents(source)) {
      picker_pending_ = false;
    }
  }

 private:
  bool OwnsPopupContents(content::WebContents* source) const {
    return source &&
           ((webview_ && source == webview_->web_contents()) ||
            (options_webview_ && source == options_webview_->web_contents()));
  }
  friend class base::NoDestructor<PopupManager>;
  void ObservePreferences() {
    if (pref_registrar_.prefs() || !g_browser_process->local_state()) {
      return;
    }
    pref_registrar_.Init(g_browser_process->local_state());
    pref_registrar_.Add(
        kEnabled, base::BindRepeating(&PopupManager::EnabledPreferenceChanged,
                                      base::Unretained(this)));
    pref_registrar_.Add(
        kShortcut, base::BindRepeating(&PopupManager::ShortcutPreferenceChanged,
                                       base::Unretained(this)));
  }
  void EnabledPreferenceChanged() {
    if (writing_preference_) {
      return;
    }
    auto* prefs = pref_registrar_.prefs();
    if (prefs->GetBoolean(kEnabled)) {
      Initialize(ProfileManager::GetLastUsedProfileIfLoaded());
      return;
    }
    if (auto error = Configure(profile_.get(), false, std::string())) {
      LOG(WARNING) << "Aux mini popup global shortcut unavailable: " << *error;
    }
  }
  void ShortcutPreferenceChanged() {
    if (writing_preference_) {
      return;
    }
    if (registered_) {
      if (auto* listener = ui::GlobalAcceleratorListener::GetInstance()) {
        listener->UnregisterAccelerator(accelerator_, this);
      }
    }
    registered_ = false;
    accelerator_ = ui::Accelerator();
    keep_alive_.reset();
    auto* prefs = pref_registrar_.prefs();
    if (prefs->GetBoolean(kEnabled)) {
      Profile* profile = profile_.get();
      if (!profile) {
        profile = ProfileManager::GetLastUsedProfileIfLoaded();
      }
      if (profile && !profile->IsOffTheRecord()) {
        if (auto error = Configure(profile, true, prefs->GetString(kShortcut))) {
          LOG(WARNING) << "Aux mini popup global shortcut unavailable: " << *error;
        }
      }
    }
  }
  PopupManager() { ObservePreferences(); }
  ~PopupManager() override = default;
  base::WeakPtr<Profile> profile_;
  base::ScopedObservation<Profile, ProfileObserver> profile_observer_{this};
  std::unique_ptr<ScopedKeepAlive> keep_alive_;
  PrefChangeRegistrar pref_registrar_;
  bool writing_preference_ = false;
  ui::Accelerator accelerator_;
  bool registered_ = false, picker_pending_ = false;
  uint64_t generation_ = 0;
  gfx::Size size_{440, 92};
  GURL loaded_entry_url_;
  std::unique_ptr<views::WidgetDelegate> delegate_, options_delegate_;
  std::unique_ptr<views::Widget> widget_, options_;
  raw_ptr<views::WebView> webview_ = nullptr;
  raw_ptr<views::WebView> options_webview_ = nullptr;
  std::unique_ptr<PopupBoundsAnimation> bounds_animation_;
  std::unique_ptr<PopupBoundsAnimation> options_bounds_animation_;
  base::OneShotTimer dismiss_;
};
}  // namespace
void InitializeAuxMiniPopup(Profile* profile) {
  PopupManager::Get().Initialize(profile);
}
void ShutdownAuxMiniPopup() {
  PopupManager::Get().Shutdown();
}
void RegisterAuxPopupLocalStatePrefs(PrefRegistrySimple* registry) {
  registry->RegisterBooleanPref(kEnabled, false);
  registry->RegisterStringPref(kShortcut, "Command+Shift+Space");
}
ExtensionFunction::ResponseAction AuxMiniPopupFunction::RunAux() {
  const auto method = std::string_view(name()).substr(13);
  auto* prefs = g_browser_process->local_state();
  if (method == "getEnabled") {
    return RespondNow(WithArguments(prefs->GetBoolean(kEnabled)));
  }
  if (method == "getShortcut") {
    return RespondNow(WithArguments(prefs->GetString(kShortcut)));
  }
  auto& manager = PopupManager::Get();
  if (method == "hide") {
    if (!manager.IsMainContents(GetSenderWebContents())) {
      return RespondNow(Error("Popup is unavailable for this calling page"));
    }
    manager.RequestHide();
    return RespondNow(NoArguments());
  }
  if (method == "setEnabled") {
    if (args().size() != 1 || !args()[0].is_bool()) {
      return RespondNow(Error("Enabled flag required"));
    }
    if (prefs->IsManagedPreference(kEnabled)) {
      return RespondNow(Error("Popup setting is managed"));
    }
    if (auto error = manager.Configure(profile(), args()[0].GetBool(),
                                       prefs->GetString(kShortcut))) {
      return RespondNow(Error(*error));
    }
    manager.SetEnabledPreference(prefs, args()[0].GetBool());
    return RespondNow(NoArguments());
  }
  if (method == "setShortcut") {
    if (args().size() != 1 || !args()[0].is_string() ||
        args()[0].GetString().size() > 128) {
      return RespondNow(Error("Shortcut string required"));
    }
    if (prefs->IsManagedPreference(kShortcut)) {
      return RespondNow(Error("Shortcut is managed"));
    }
    if (auto error = manager.Configure(profile(), prefs->GetBoolean(kEnabled),
                                       args()[0].GetString())) {
      return RespondNow(Error(*error));
    }
    manager.SetShortcutPreference(prefs, args()[0].GetString());
    return RespondNow(NoArguments());
  }
  if (method == "setState") {
    if (args().size() != 1 || !args()[0].is_string() ||
        (args()[0].GetString() != "compact" &&
         args()[0].GetString() != "compact-with-attachments" &&
         args()[0].GetString() != "expanded")) {
      return RespondNow(Error("Invalid popup state"));
    }
    if (!manager.IsMainContents(GetSenderWebContents())) {
      return RespondNow(Error("Popup is unavailable for this calling page"));
    }
    manager.SetState(args()[0].GetString());
    return RespondNow(NoArguments());
  }
  if (method == "setSize" || method == "setOptionWindowSize") {
    if (args().size() != 2 || !args()[0].is_int() || !args()[1].is_int()) {
      return RespondNow(Error("Integer popup dimensions required"));
    }
    const int width = args()[0].GetInt(), height = args()[1].GetInt();
    if (width <= 0 || height <= 0) {
      return RespondNow(Error("Popup dimensions are outside supported bounds"));
    }
    if (method == "setSize") {
      if (!manager.IsMainContents(GetSenderWebContents())) {
        return RespondNow(Error("Popup is unavailable for this calling page"));
      }
      manager.Resize(gfx::Size(width, height));
    } else if (auto error = manager.ResizeOptions(GetSenderWebContents(),
                                                  gfx::Size(width, height))) {
      return RespondNow(Error(*error));
    }
    return RespondNow(NoArguments());
  }
  if (method == "switchProfile") {
    if (args().size() != 1 || !args()[0].is_int() || args()[0].GetInt() < 0) {
      return RespondNow(Error("Profile index required"));
    }
    const auto entries = g_browser_process->profile_manager()
                             ->GetProfileAttributesStorage()
                             .GetAllProfilesAttributesSortedForDisplay();
    const size_t index = args()[0].GetInt();
    if (index >= entries.size()) {
      return RespondNow(Error("Profile is no longer registered"));
    }
    auto* selected = g_browser_process->profile_manager()->GetProfileByPath(
        entries[index]->GetPath());
    if (!selected) {
      return RespondNow(Error("Selected profile is not loaded"));
    }
    manager.ShowFor(selected);
    return RespondNow(NoArguments());
  }
  if (method == "pickDirectory") {
    if (!args().empty() || !user_gesture()) {
      return RespondNow(Error("Directory selection requires a user gesture"));
    }
    auto* owner = GetSenderWebContents();
    if (!owner) {
      return RespondNow(Error("Calling page is unavailable"));
    }
    if (auto error = manager.BeginDirectoryPicker(owner)) {
      return RespondNow(Error(*error));
    }
    dialog_ = ui::SelectFileDialog::Create(
        this, std::make_unique<ChromeSelectFilePolicy>(owner));
    picker_hold_ = this;
    dialog_->SelectFile(ui::SelectFileDialog::SELECT_FOLDER, std::u16string(),
                        base::FilePath(), nullptr, 0,
                        base::FilePath::StringType(),
                        owner->GetTopLevelNativeWindow());
    return did_respond() ? AlreadyResponded() : RespondLater();
  }
  return RespondNow(Error("Unsupported popup method"));
}
void AuxMiniPopupFunction::FileSelected(const ui::SelectedFileInfo& file, int) {
  CompleteDirectory(file.local_path.value());
}
void AuxMiniPopupFunction::FileSelectionCanceled() {
  CompleteDirectory(std::nullopt);
}
void AuxMiniPopupFunction::CompleteDirectory(std::optional<std::string> path) {
  auto retained = std::move(picker_hold_);
  dialog_.reset();
  PopupManager::Get().FinishDirectoryPicker(GetSenderWebContents());
  Respond(path ? WithArguments(std::move(*path)) : NoArguments());
}
}  // namespace extensions

#include "chrome/browser/ui/views/frame/aux_shell_view.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "url/origin.h"
#include "base/json/json_writer.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "chrome/browser/ui/views/frame/aux_page_material.h"
#include "chrome/browser/themes/theme_service.h"
#include "chrome/browser/browser_process.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "chrome/browser/ui/views/frame/glass_frame_service.h"
#include "chrome/browser/themes/theme_service_factory.h"
#include "chrome/browser/ui/views/frame/top_container_view.h"
#include "ui/compositor/layer.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "chrome/browser/ui/views/frame/tab_strip_region_view.h"
#include "ui/views/controls/webview/web_contents_set_background_color.h"
#include "components/input/native_web_keyboard_event.h"
#include "ui/events/event.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include <algorithm>
#include "chrome/app/chrome_command_ids.h"
#include <cmath>
#include <map>
#include "content/public/browser/render_widget_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "third_party/blink/public/common/input/web_mouse_wheel_event.h"
#include "base/time/time.h"
#include <memory>
#include "base/command_line.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/hash/hash.h"
#include "base/memory/ref_counted_memory.h"
#include "base/no_destructor.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/thread_pool.h"
#include "base/unguessable_token.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"
#include "content/public/browser/web_ui_message_handler.h"
#include "content/public/browser/webui_config.h"
#include "content/public/browser/webui_config_map.h"
#include "content/public/browser/web_contents.h"
#include "services/network/public/mojom/content_security_policy.mojom.h"
#include "third_party/skia/include/core/SkColor.h"
#include "ui/base/page_transition_types.h"
#include "ui/views/widget/widget.h"
#include "ui/views/controls/native/native_view_host.h"
#include "ui/gfx/geometry/rounded_corners_f.h"

namespace {
auto& Shells() {
  static base::NoDestructor<std::map<content::WebContents*, AuxShellView*>> shells;
  return *shells;
}
class TabIdentity : public base::SupportsUserData::Data {
 public:
  explicit TabIdentity(std::string value) : id(std::move(value)) {}
  std::string id;
};
const char kTabIdentity[] = "aux-proof-tab";
std::string PageId(content::WebContents* contents) {
  auto* identity = static_cast<TabIdentity*>(contents->GetUserData(kTabIdentity));
  if (!identity) {
    contents->SetUserData(kTabIdentity, std::make_unique<TabIdentity>(
        "aux-" + content::DevToolsAgentHost::GetOrCreateFor(contents)->GetId()));
    identity = static_cast<TabIdentity*>(contents->GetUserData(kTabIdentity));
  }
  return identity->id;
}
base::Value Error(const std::string& message) {
  return base::Value(base::DictValue().Set("__auxError", message));
}
class AuxHandler : public content::WebUIMessageHandler {
 public:
  void RegisterMessages() override {
    web_ui()->RegisterMessageCallback("auxRequest", base::BindRepeating(&AuxHandler::Handle, base::Unretained(this)));
  }
  void Handle(const base::ListValue& args) {
    auto* contents = web_ui()->GetWebContents();
    auto found = Shells().find(contents);
    auto* frame = web_ui()->GetRenderFrameHost();
    if (found == Shells().end() || frame != contents->GetPrimaryMainFrame() ||
        frame->GetLastCommittedOrigin() != url::Origin::Create(GURL("chrome://aux/")) ||
        args.size() != 3 || !args[0].is_string() || !args[1].is_string() || !args[2].is_list()) return;
    AllowJavascript();
    auto result = found->second->Request(args[1].GetString(), args[2].GetList());
    CallJavascriptFunction("auxHostReply", args[0], result);
  }
};
scoped_refptr<base::RefCountedString> ReadAsset(base::FilePath root, std::string path) {
  if (path.empty() || path[0] == '?') path = "index.html";
  path = path.substr(0, path.find('?'));
  base::FilePath relative = base::FilePath::FromUTF8Unsafe(path);
  std::string bytes;
  if (relative.IsAbsolute() || relative.ReferencesParent() ||
      !base::ReadFileToStringWithMaxSize(root.Append(relative), &bytes, 8 * 1024 * 1024)) return nullptr;
  if (path == "index.html") {
    base::ReplaceFirstSubstringAfterOffset(&bytes, 0, "<head>", "<head><script src=\"/aux-host.js\"></script>");
  }
  return base::MakeRefCounted<base::RefCountedString>(std::move(bytes));
}
class AuxUI : public content::WebUIController {
 public:
  explicit AuxUI(content::WebUI* web_ui) : WebUIController(web_ui) {
    auto root = base::CommandLine::ForCurrentProcess()->GetSwitchValuePath("aux-shell-assets");
    auto* source = content::WebUIDataSource::CreateAndAdd(web_ui->GetWebContents()->GetBrowserContext(), "aux");
    source->DisableTrustedTypesCSP();
    source->OverrideContentSecurityPolicy(network::mojom::CSPDirectiveName::ScriptSrc, "script-src 'self';");
    source->OverrideContentSecurityPolicy(network::mojom::CSPDirectiveName::StyleSrc, "style-src 'self' 'unsafe-inline';");
    source->OverrideContentSecurityPolicy(network::mojom::CSPDirectiveName::ImgSrc, "img-src 'self' data: blob: https: http:;");
    source->OverrideContentSecurityPolicy(network::mojom::CSPDirectiveName::FontSrc, "font-src 'self' data:;");
    source->SetRequestFilter(base::BindRepeating([](const std::string&) { return true; }),
      base::BindRepeating([](base::FilePath root, const std::string& path, content::WebUIDataSource::GotDataCallback callback) {
        base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
          base::BindOnce(&ReadAsset, root, path), std::move(callback));
      }, root));
    web_ui->AddMessageHandler(std::make_unique<AuxHandler>());
  }
};
class AuxUIConfig : public content::DefaultWebUIConfig<AuxUI> {
 public:
  AuxUIConfig() : DefaultWebUIConfig("chrome", "aux") {}
};
}

AuxShellView::AuxShellView(BrowserView* browser) : views::WebView(browser->GetProfile()), browser_(browser) {
  static bool registered = false;
  if (!registered) { content::WebUIConfigMap::GetInstance().AddWebUIConfig(std::make_unique<AuxUIConfig>()); registered = true; }
  window_id_ = base::UnguessableToken::Create().ToString();
  profile_id_ = base::NumberToString(base::PersistentHash(browser->GetProfile()->GetPath().AsUTF8Unsafe()));
  auto* contents = GetWebContents(GURL("chrome://aux/"));
  Shells()[contents] = this;
  views::WebContentsSetBackgroundColor::CreateForWebContentsWithColor(contents, SK_ColorTRANSPARENT);
  LoadInitialURL(GURL("chrome://aux/?window=" + window_id_ + "&profile=" + profile_id_));
}
AuxShellView::~AuxShellView() { Shells().erase(web_contents()); }
void AuxShellView::ApplyLayout() {
  SetBoundsRect(browser_->GetLocalBounds());
  if (!pointer_monitor_ && GetWidget()) {
    pointer_monitor_ = views::EventMonitor::CreateWindowMonitor(this, GetWidget()->GetNativeWindow(), {ui::EventType::kMouseMoved, ui::EventType::kMousePressed, ui::EventType::kMouseExited});
  }
  auto* top = browser_->top_container();
  if (!top->layer()) top->SetPaintToLayer();
  top->layer()->SetOpacity(0);
  top->SetCanProcessEventsWithinSubtree(false);
  top->GetViewAccessibility().SetIsInvisible(true);
  top->GetViewAccessibility().SetIsLeaf(true);
  auto* strip = browser_->tab_strip_view();
  if (strip) {
    if (!strip->layer()) strip->SetPaintToLayer();
    strip->layer()->SetOpacity(0);
    strip->SetCanProcessEventsWithinSubtree(false);
    strip->GetViewAccessibility().SetIsInvisible(true);
    strip->GetViewAccessibility().SetIsLeaf(true);
  }
  auto* native = browser_->contents_container();
  // BrowserView layout requires this container to remain visible. Collapse its
  // bounds when Aux has no page stage rather than violating that invariant.
  native->SetBoundsRect(stage_visible_ ? stage_ : gfx::Rect());
  // A zero-sized Views ancestor does not hide a hosted macOS WebContents
  // surface. Hide the actual WebView while Aux owns the page area; keep the
  // outer container visible to satisfy BrowserView's layout invariant.
  if (auto* page_view = browser_->GetActiveContentsWebView()) {
    page_view->SetVisible(stage_visible_);
    page_view->holder()->SetNativeViewCornerRadii(gfx::RoundedCornersF(stage_radius_));
  }
  browser_->ReorderChildView(this, browser_->children().size() - 1);
  if (stage_visible_ && !overlay_) browser_->ReorderChildView(native, browser_->children().size() - 1);
}
void AuxShellView::SyncPageMaterial() {
  auto* wc = browser_->browser()->GetTabStripModel()->GetActiveWebContents();
  auto* frame = wc ? wc->GetPrimaryMainFrame() : nullptr;
  auto* prior = material_document_.AsRenderFrameHostIfValid();
  if (prior && prior != frame && prior->IsActive()) {
    prior->ExecuteJavaScriptInIsolatedWorld(base::UTF8ToUTF16(std::string(kAuxPageMaterial) + "({enabled:false});"), base::NullCallback(), ISOLATED_WORLD_ID_CHROME_INTERNAL);
  }
  if (!frame || !frame->GetLastCommittedURL().SchemeIsHTTPOrHTTPS()) {
    material_document_ = content::WeakDocumentPtr(); material_state_.clear(); return;
  }
  if (!frame->IsActive() || !frame->IsDOMContentLoaded()) return;
  base::DictValue state;
  state.Set("enabled", glass_enabled_ && stage_visible_ && PageId(wc) == stage_page_id_);
  state.Set("toolbar", toolbar_glass_);
  if (!sidebar_glass_.IsEmpty()) {
    state.Set("sidebar", base::DictValue().Set("x", sidebar_glass_.x()-stage_.x()).Set("y", sidebar_glass_.y()-stage_.y())
        .Set("width", sidebar_glass_.width()).Set("height", sidebar_glass_.height()));
  }
  auto json = base::WriteJson(state).value_or("{}");
  if (prior == frame && json == material_state_) return;
  material_document_ = frame->GetWeakDocumentPtr(); material_state_ = json;
  frame->ExecuteJavaScriptInIsolatedWorld(base::UTF8ToUTF16(std::string(kAuxPageMaterial) + "(" + json + ");"), base::NullCallback(), ISOLATED_WORLD_ID_CHROME_INTERNAL);
}
void AuxShellView::Emit(const std::string& event, base::Value payload) {
  auto* frame = web_contents()->GetPrimaryMainFrame();
  if (!frame || frame->GetLastCommittedOrigin() != url::Origin::Create(GURL("chrome://aux/"))) return;
  frame->ExecuteJavaScriptMethod(u"window", u"auxHostEvent", base::ListValue().Append(event).Append(std::move(payload)), base::NullCallback());
}
void AuxShellView::OnEvent(const ui::Event& event) {
  if (!event.IsMouseEvent() || !stage_visible_) return;
  auto point = event.AsMouseEvent()->root_location();
  views::View::ConvertPointToScreen(GetWidget()->GetRootView(), &point);
  const auto bounds = GetBoundsInScreen();
  // Crossing native child views emits an exit without leaving the window.
  // Keep the edge reveal alive until the pointer actually leaves its bounds.
  const bool inside = bounds.Contains(point);
  const bool near = inside && point.y() - bounds.y() < (near_edge_ ? 80 : 8);
  if (near != near_edge_) { near_edge_ = near; Emit("onToolbarEdge", base::Value(near)); }
  const bool left = inside && point.x() - bounds.x() <= 8 && point.y() - bounds.y() >= 48;
  if (left != near_sidebar_) { near_sidebar_ = left; Emit("onSidebarEdge", base::Value(left)); }
}
bool AuxShellView::HandleBrowserCommand(BrowserWindowInterface* browser, int command_id) {
  if (command_id != IDC_NEW_TAB && command_id != IDC_FOCUS_LOCATION) return false;
  for (const auto& entry : Shells()) {
    auto* shell = entry.second;
    if (shell->browser_->browser() != browser) continue;
    shell->RequestFocus();
    shell->Emit("onShortcut", base::Value(base::DictValue()
      .Set("commandId", command_id == IDC_NEW_TAB ? "new-tab" : "open-address")
      .Set("key", command_id == IDC_NEW_TAB ? "t" : "l")
      .Set("meta", true).Set("shift", false).Set("alt", false).Set("ctrl", false)));
    return true;
  }
  return false;
}
bool AuxShellView::HandleKey(const input::NativeWebKeyboardEvent& event) {
  if (event.GetType() != blink::WebInputEvent::Type::kRawKeyDown ||
      !(event.GetModifiers() & blink::WebInputEvent::kMetaKey) ||
      (event.GetModifiers() & (blink::WebInputEvent::kAltKey | blink::WebInputEvent::kControlKey))) return false;
  if (event.GetModifiers() & blink::WebInputEvent::kShiftKey) return false;
  const int key = event.windows_key_code;
  if (key != ui::VKEY_K && key != ui::VKEY_L && key != ui::VKEY_S && key != ui::VKEY_T && key != ui::VKEY_W) return false;
  RequestFocus();
  Emit("onShortcut", base::Value(base::DictValue().Set("key", std::string(1, static_cast<char>(key + 'a' - 'A')))
      .Set("meta", true).Set("shift", !!(event.GetModifiers() & blink::WebInputEvent::kShiftKey)).Set("alt", false).Set("ctrl", false)));
  return true;
}
base::Value AuxShellView::Request(const std::string& method, const base::ListValue& args) {
  auto* model = browser_->browser()->GetTabStripModel();
  if (method == "state") {
    SyncPageMaterial();
    base::ListValue tabs;
    for (int i = 0; i < model->count(); ++i) {
      auto* wc = model->GetWebContentsAt(i);
      if (wc->GetVisibleURL() == GURL("chrome://newtab/") ||
          wc->GetVisibleURL() == GURL("chrome://new-tab-page/")) {
        wc->GetController().LoadURL(GURL("about:blank"), content::Referrer(), ui::PAGE_TRANSITION_AUTO_TOPLEVEL, std::string());
      }
      tabs.Append(base::DictValue().Set("pageId", PageId(wc)).Set("targetId", content::DevToolsAgentHost::GetOrCreateFor(wc)->GetId())
        .Set("url", wc->GetVisibleURL().spec()).Set("title", wc->GetVisibleURL() == GURL("about:blank") ? "New Tab" : base::UTF16ToUTF8(wc->GetTitle()))
        .Set("loading", wc->IsLoading()).Set("muted", wc->IsAudioMuted()).Set("audible", wc->IsCurrentlyAudible())
        .Set("canGoBack", wc->GetController().CanGoBack()).Set("canGoForward", wc->GetController().CanGoForward()).Set("crashed", wc->IsCrashed()));
    }
    return base::Value(base::DictValue().Set("tabs", std::move(tabs)).Set("activePageId", model->GetActiveWebContents() ? PageId(model->GetActiveWebContents()) : ""));
  }
  if (method == "setAppearance") {
    if (args.empty() || !args[0].is_string()) return Error("Invalid appearance");
    const auto& theme = args[0].GetString();
    if (theme != "system" && theme != "dark" && theme != "light") return Error("Invalid appearance");
    ThemeServiceFactory::GetForProfile(browser_->GetProfile())->SetBrowserColorScheme(
        theme == "dark" ? ThemeService::BrowserColorScheme::kDark :
        theme == "light" ? ThemeService::BrowserColorScheme::kLight : ThemeService::BrowserColorScheme::kSystem);
    if (args.size() < 2 || !args[1].is_bool()) return Error("Invalid transparency preference");
    // The upstream service owns native material lifecycle, power/fullscreen
    // fallback and frame presentation synchronization. Aux owns the tint in CSS.
    glass_enabled_ = args[1].GetBool();
    SyncPageMaterial();
    auto* glass = GlassFrameService::GetInstance();
    if (!glass) return base::Value(false);
    g_browser_process->local_state()->SetBoolean(prefs::kGlassFrameEnabled, args[1].GetBool());
    return base::Value(glass->IsBrowserWindowEligible(browser_->browser()));
  }
  if (method == "toolbarGlass") {
    if (args.size() != 1 || !args[0].is_bool()) return Error("Invalid toolbar glass state");
    toolbar_glass_ = args[0].GetBool(); SyncPageMaterial(); return base::Value(true);
  }
  if (method == "sidebarGlass") {
    if (args.size() != 1 || (!args[0].is_none() && !args[0].is_dict())) return Error("Invalid sidebar glass bounds");
    sidebar_glass_ = gfx::Rect();
    if (args[0].is_dict()) {
      const auto& r = args[0].GetDict();
      auto value = [&](const char* key) { return r.FindDouble(key).value_or(r.FindInt(key).value_or(-1)); };
      const double x=value("x"), y=value("y"), w=value("width"), h=value("height");
      if (!std::isfinite(x) || !std::isfinite(y) || !std::isfinite(w) || !std::isfinite(h) ||
          x<0 || y<0 || w<=0 || h<=0 || x+w>20000 || y+h>20000) return Error("Invalid sidebar glass rectangle");
      sidebar_glass_ = gfx::Rect(x,y,w,h);
    }
    SyncPageMaterial(); return base::Value(true);
  }
  if (method == "toolbarTone") {
    auto* wc = model->GetActiveWebContents();
    const auto color = wc ? wc->GetBackgroundColor().value_or(SK_ColorWHITE) : SK_ColorWHITE;
    const double luminance = .2126 * SkColorGetR(color) + .7152 * SkColorGetG(color) + .0722 * SkColorGetB(color);
    return base::Value(luminance > 140 ? "light" : "dark");
  }
  if (method == "forwardPagePointer") {
    if (!stage_visible_ || args.size() != 1 || !args[0].is_dict()) return Error("No native pointer stage");
    const auto& message = args[0].GetDict();
    const auto* kind = message.FindString("kind");
    const auto x = message.FindDouble("x"), y = message.FindDouble("y");
    if (!kind || !x || !y || !std::isfinite(*x) || !std::isfinite(*y) ||
        !stage_.Contains(gfx::Point(*x, *y))) return Error("Pointer outside native stage");
    auto* wc = model->GetActiveWebContents();
    if (!wc || PageId(wc) != stage_page_id_) return Error("Native stage changed before pointer delivery");
    auto* view = wc->GetRenderWidgetHostView();
    if (!view) return Error("Native page view unavailable");
    int modifiers = 0;
    if (const auto* list = message.FindList("modifiers")) for (const auto& item : *list) {
      if (!item.is_string()) return Error("Invalid pointer modifier");
      const auto& value = item.GetString();
      if (value == "shift") modifiers |= blink::WebInputEvent::kShiftKey;
      else if (value == "control") modifiers |= blink::WebInputEvent::kControlKey;
      else if (value == "alt") modifiers |= blink::WebInputEvent::kAltKey;
      else if (value == "meta") modifiers |= blink::WebInputEvent::kMetaKey;
      else if (value == "leftbuttondown") modifiers |= blink::WebInputEvent::kLeftButtonDown;
      else if (value == "middlebuttondown") modifiers |= blink::WebInputEvent::kMiddleButtonDown;
      else if (value == "rightbuttondown") modifiers |= blink::WebInputEvent::kRightButtonDown;
      else return Error("Unknown pointer modifier");
    }
    auto* host = view->GetRenderWidgetHost();
    const gfx::PointF position(*x - stage_.x(), *y - stage_.y());
    if (*kind == "wheel") {
      const auto dx = message.FindDouble("deltaX"), dy = message.FindDouble("deltaY");
      if (!dx || !dy || !std::isfinite(*dx) || !std::isfinite(*dy)) return Error("Invalid wheel delta");
      blink::WebMouseWheelEvent event(blink::WebInputEvent::Type::kMouseWheel, modifiers, base::TimeTicks::Now());
      event.SetPositionInWidget(position); event.SetPositionInScreen(GetBoundsInScreen().x() + *x, GetBoundsInScreen().y() + *y);
      event.delta_x = -*dx; event.delta_y = -*dy;
      event.event_action = blink::WebMouseWheelEvent::EventAction::kScroll;
      host->ForwardWheelEvent(event);
    } else {
      const auto* button = message.FindString("button");
      if (!button || (*button != "left" && *button != "middle" && *button != "right")) return Error("Invalid pointer button");
      auto type = blink::WebInputEvent::Type::kMouseMove;
      if (*kind == "down") type = blink::WebInputEvent::Type::kMouseDown;
      else if (*kind == "up") type = blink::WebInputEvent::Type::kMouseUp;
      else if (*kind != "move") return Error("Invalid pointer action");
      blink::WebMouseEvent event(type, modifiers, base::TimeTicks::Now());
      event.SetPositionInWidget(position); event.SetPositionInScreen(GetBoundsInScreen().x() + *x, GetBoundsInScreen().y() + *y);
      event.button = *button == "left" ? blink::WebPointerProperties::Button::kLeft : *button == "middle" ? blink::WebPointerProperties::Button::kMiddle : blink::WebPointerProperties::Button::kRight;
      event.click_count = std::clamp(message.FindInt("clickCount").value_or(1), 0, 3);
      if (*kind == "down") view->Focus();
      host->ForwardMouseEvent(event);
    }
    return base::Value(true);
  }
  if (method == "setStage") {
    if (args.size() < 2 || !args[1].is_dict()) return Error("Invalid stage bounds");
    if (args.size() > 2 && args[2].is_string() && !args[2].GetString().empty()) return Error("Split native panes are not integrated yet");
    if (!args[0].is_none() && !args[0].is_string()) return Error("Invalid stage identity");
    if (args[0].is_string() && !args[0].GetString().empty() &&
        (!model->GetActiveWebContents() || PageId(model->GetActiveWebContents()) != args[0].GetString())) return Error("Stage is not the active native tab");
    const auto& bounds = args[1].GetDict();
    auto number = [&](const char* name) { return bounds.FindDouble(name).value_or(bounds.FindInt(name).value_or(0)); };
    const double radius = args.size() > 3 && args[3].is_double() ? args[3].GetDouble() : args.size() > 3 && args[3].is_int() ? args[3].GetInt() : 0;
    if (!std::isfinite(radius)) return Error("Invalid stage radius");
    stage_radius_ = std::clamp(radius, 0.0, 48.0);
    stage_ = gfx::Rect(number("x"), number("y"), number("width"), number("height"));
    stage_.Intersect(browser_->GetLocalBounds());
    stage_page_id_ = args[0].is_string() ? args[0].GetString() : "";
    stage_visible_ = args[0].is_string() && !args[0].GetString().empty() && !stage_.IsEmpty();
    ApplyLayout(); SyncPageMaterial(); return base::Value(true);
  }
  if (method == "overlay") {
    if (args.empty() || !args[0].is_bool()) return Error("Invalid overlay state");
    overlay_ = args[0].GetBool(); ApplyLayout(); return base::Value(true);
  }
  if (method == "focusShell") { RequestFocus(); return base::Value(true); }
  if (method != "tabCommand" || args.empty() || !args[0].is_dict()) return Error("Host method not integrated: " + method);
  const auto& command = args[0].GetDict();
  const auto* kind = command.FindString("kind");
  if (!kind) return Error("Missing tab command kind");
  const auto* requested_id = command.FindString("pageId");
  int index = -1;
  if (requested_id) for (int i = 0; i < model->count(); ++i) if (PageId(model->GetWebContentsAt(i)) == *requested_id) index = i;
  auto* wc = index >= 0 ? model->GetWebContentsAt(index) : nullptr;
  if (*kind == "open" || *kind == "navigate") {
    const auto* address = command.FindString("url"); GURL url(address ? *address : "about:blank");
    if (!url.is_valid() || !(url.SchemeIsHTTPOrHTTPS() || url == GURL("about:blank"))) return Error("Unsupported proof navigation URL");
    if (*kind == "open") {
      if (index >= 0) return Error("Tab identity already exists");
      auto created = content::WebContents::Create(content::WebContents::CreateParams(browser_->GetProfile()));
      wc = created.get();
      if (requested_id && requested_id->size() <= 128) wc->SetUserData(kTabIdentity, std::make_unique<TabIdentity>(*requested_id));
      model->AddWebContents(std::move(created), -1, ui::PAGE_TRANSITION_TYPED, command.FindBool("background").value_or(false) ? 0 : AddTabTypes::ADD_ACTIVE);
    }
    if (!wc) return Error("Tab is not owned by this window");
    wc->GetController().LoadURL(url, content::Referrer(), ui::PAGE_TRANSITION_TYPED, std::string());
    if (url == GURL("about:blank") && !command.FindBool("background").value_or(false)) RequestFocus();
  } else if (!wc) return Error("Tab is not owned by this window");
  else if (*kind == "activate") model->ActivateTabAt(index);
  else if (*kind == "close") { if (model->count() == 1) return Error("Closing the final native tab requires the window-lifecycle integration"); model->CloseWebContentsAt(index, TabCloseTypes::CLOSE_USER_GESTURE); wc = nullptr; }
  else if (*kind == "back") wc->GetController().GoBack();
  else if (*kind == "forward") wc->GetController().GoForward();
  else if (*kind == "reload") wc->GetController().Reload(command.FindBool("hard").value_or(false) ? content::ReloadType::BYPASSING_CACHE : content::ReloadType::NORMAL, true);
  else if (*kind == "stop") wc->Stop();
  else return Error("Tab command not integrated: " + *kind);
  return base::Value(base::DictValue().Set("status", "applied").Set("pageId", wc ? PageId(wc) : requested_id ? *requested_id : ""));
}

BEGIN_METADATA(AuxShellView)
END_METADATA

#include "chrome/browser/ui/views/frame/aux_shell_view.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "url/origin.h"
#include "chrome/browser/themes/theme_service.h"
#include "chrome/browser/themes/theme_service_factory.h"
#include "chrome/browser/ui/views/frame/top_container_view.h"
#include "ui/compositor/layer.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "chrome/browser/ui/views/frame/tab_strip_region_view.h"
#include "ui/views/controls/webview/web_contents_set_background_color.h"
#include <map>
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
  browser_->ReorderChildView(this, browser_->children().size() - 1);
  if (stage_visible_ && !overlay_) browser_->ReorderChildView(native, browser_->children().size() - 1);
}
base::Value AuxShellView::Request(const std::string& method, const base::ListValue& args) {
  auto* model = browser_->browser()->GetTabStripModel();
  if (method == "state") {
    base::ListValue tabs;
    for (int i = 0; i < model->count(); ++i) {
      auto* wc = model->GetWebContentsAt(i);
      if (wc->GetVisibleURL() == GURL("chrome://newtab/") ||
          wc->GetVisibleURL() == GURL("chrome://new-tab-page/")) {
        wc->GetController().LoadURL(GURL("about:blank"), content::Referrer(), ui::PAGE_TRANSITION_AUTO_TOPLEVEL, std::string());
      }
      tabs.Append(base::DictValue().Set("pageId", PageId(wc)).Set("targetId", content::DevToolsAgentHost::GetOrCreateFor(wc)->GetId())
        .Set("url", wc->GetVisibleURL().spec()).Set("title", base::UTF16ToUTF8(wc->GetTitle()))
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
    // Theme is applied. Native backdrop materials/window buttons remain unqualified.
    return base::Value(false);
  }
  if (method == "setStage") {
    if (args.size() < 2 || !args[1].is_dict()) return Error("Invalid stage bounds");
    if (args.size() > 2 && args[2].is_string() && !args[2].GetString().empty()) return Error("Split native panes are not integrated yet");
    const auto& bounds = args[1].GetDict();
    auto number = [&](const char* name) { return bounds.FindDouble(name).value_or(bounds.FindInt(name).value_or(0)); };
    stage_ = gfx::Rect(number("x"), number("y"), number("width"), number("height"));
    stage_.Intersect(browser_->GetLocalBounds());
    stage_visible_ = args[0].is_string() && !args[0].GetString().empty() && !stage_.IsEmpty();
    ApplyLayout(); return base::Value(true);
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

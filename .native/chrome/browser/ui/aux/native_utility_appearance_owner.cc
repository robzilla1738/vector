// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_utility_appearance_owner.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <set>
#include "base/command_line.h"
#include "base/files/file_path.h"
#include "base/strings/string_number_conversions.h"
#include "base/unguessable_token.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/little_window_controller.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/quick_ask_controller.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "content/browser/renderer_host/render_frame_host_impl.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/weak_document_ptr.h"
namespace aux {
namespace {
bool Token(const std::string* value) {
  if (!value) return false;
  const auto token = base::UnguessableToken::DeserializeFromString(*value);
  return token && token->ToString() == *value;
}
bool ValidOwner(const base::DictValue& value) {
  const auto* producer = value.FindString("producer");
  const auto version = value.FindInt("version"), window = value.FindInt("windowId");
  const auto* browser = value.FindString("browserWindowId");
  const auto* kind = value.FindString("windowKind");
  const auto* pages = value.FindList("pages");
  int id = 0;
  if (value.size() != 7 || !producer || *producer != "aux-native-utility-appearance-owner" ||
      version != 1 || !window || *window <= 0 || !browser ||
      !base::StringToInt(*browser, &id) || id <= 0 || base::NumberToString(id) != *browser ||
      !kind || (*kind != "normal" && *kind != "little") ||
      !Token(value.FindString("shellDocumentToken")) || !pages || pages->size() > 1 ||
      (*kind == "little" && pages->size() != 1)) return false;
  std::set<std::string> seen;
  int selected_count = 0;
  for (const auto& row : *pages) {
    const auto* page = row.GetIfDict();
    if (!page || page->size() != 3) return false;
    const auto* page_id = page->FindString("pageId");
    const auto selected = page->FindBool("selected");
    if (!page_id || !PageIdentity::IsValid(*page_id) || !seen.insert(*page_id).second ||
        !Token(page->FindString("documentToken")) || !selected.has_value()) return false;
    selected_count += *selected ? 1 : 0;
  }
  return selected_count <= 1 && (*kind != "little" || selected_count == 1);
}
}  // namespace
bool NativeUtilityAppearanceOwnerMatches(const base::DictValue& before,
                                        const base::DictValue& after) {
  return ValidOwner(before) && ValidOwner(after) && before == after;
}
std::optional<base::DictValue> ReadNativeUtilityAppearanceOwner(
    base::WeakPtr<WebUIBrowserUI> ui) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  // Cached retained fixture metadata only. Never resolve filesystem paths here.
  if (!ui || !NativeAppearanceObservationEnabled()) return std::nullopt;
  auto* web_ui = ui->web_ui();
  auto* shell = web_ui ? web_ui->GetWebContents() : nullptr;
  auto* frame = shell ? shell->GetPrimaryMainFrame() : nullptr;
  auto* window = shell ? WebUIBrowserWindow::FromWebShellWebContents(shell) : nullptr;
  auto* browser = window ? window->browser() : nullptr;
  auto* profile = web_ui ? Profile::FromWebUI(web_ui) : nullptr;
  const base::FilePath selected(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"));
  if (!shell || shell->IsBeingDestroyed() || !frame || !browser || !profile ||
      profile->IsOffTheRecord() || browser->GetProfile() != profile ||
      profile->GetPath().DirName() != selected ||
      browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      IsQuickAskWindow(browser) || frame != web_ui->GetRenderFrameHost() ||
      !frame->IsRenderFrameLive() || frame->IsErrorDocument() ||
      !frame->IsInLifecycleState(content::RenderFrameHost::LifecycleState::kActive) ||
      frame->GetLastCommittedURL().spec() != "chrome://aux/" ||
      browser->GetSessionID().id() <= 0) return std::nullopt;
  const bool little = IsLittleWindow(browser);
  auto* tabs = browser->GetTabStripModel();
  if (!tabs || (little && tabs->count() != 1)) return std::nullopt;
  auto* const original_window = window;
  const auto shell_weak = shell->GetWeakPtr();
  const auto document_weak = frame->GetWeakDocumentPtr();
  const auto browser_weak = browser->GetWeakPtr();
  // AppKit appearance readback may reenter. Never use a retained raw owner
  // until the original UI, shell document and browser have been reacquired.
  const auto native = window->GetAuxAppearanceSnapshot();
  if (!ui || !shell_weak || !browser_weak ||
      !NativeAppearanceObservationEnabled()) return std::nullopt;
  web_ui = ui->web_ui();
  shell = web_ui ? web_ui->GetWebContents() : nullptr;
  frame = document_weak.AsRenderFrameHostIfValid();
  window = shell ? WebUIBrowserWindow::FromWebShellWebContents(shell) : nullptr;
  if (!shell || shell != shell_weak.get() || shell->IsBeingDestroyed() ||
      !frame || frame != shell->GetPrimaryMainFrame() ||
      frame != web_ui->GetRenderFrameHost() || !window || window != original_window ||
      window->browser() != browser_weak.get()) return std::nullopt;
  browser = browser_weak.get();
  if (Profile::FromWebUI(web_ui) != profile || browser->GetProfile() != profile ||
      profile->IsOffTheRecord() || profile->GetPath().DirName() != selected ||
      browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      IsQuickAskWindow(browser) || IsLittleWindow(browser) != little ||
      !frame->IsRenderFrameLive() || frame->IsErrorDocument() ||
      !frame->IsInLifecycleState(content::RenderFrameHost::LifecycleState::kActive) ||
      frame->GetLastCommittedURL().spec() != "chrome://aux/") return std::nullopt;
  tabs = browser->GetTabStripModel();
  if (!tabs || (little && tabs->count() != 1)) return std::nullopt;
  const auto os_window = native.FindInt("windowId");
  if (!os_window || *os_window <= 0) return std::nullopt;
  base::ListValue pages;
  // Only the actual selected native guest is disclosed. This is not an
  // assertion of complete tab inventory and stays within the original 4 KiB
  // appearance transport bound even when the browser has many background tabs.
  if (auto* page = tabs->GetActiveWebContents()) {
    auto* identity = page ? PageIdentity::FromWebContents(page) : nullptr;
    auto* document = page ? page->GetPrimaryMainFrame() : nullptr;
    // FindPage/GetOrCreate could create or persist identity. Read existing data
    // directly from the exact current browser's native tab model instead.
    if (!page || page->IsBeingDestroyed() || page->GetBrowserContext() != profile ||
        !identity || !PageIdentity::IsValid(identity->id()) || identity->runtime_owned() ||
        !document || !document->IsRenderFrameLive() ||
        document->IsErrorDocument() ||
        !document->IsInLifecycleState(content::RenderFrameHost::LifecycleState::kActive)) return std::nullopt;
    base::DictValue item;
    item.Set("pageId", identity->id());
    item.Set("documentToken", static_cast<content::RenderFrameHostImpl*>(document)->GetDocumentToken().ToString());
    item.Set("selected", true);
    pages.Append(std::move(item));
  }
  if (little && tabs->GetActiveWebContents() != tabs->GetWebContentsAt(0)) return std::nullopt;
  base::DictValue result;
  result.Set("producer", "aux-native-utility-appearance-owner");
  result.Set("version", 1);
  result.Set("windowId", *os_window);
  result.Set("browserWindowId", base::NumberToString(browser->GetSessionID().id()));
  result.Set("windowKind", little ? "little" : "normal");
  result.Set("shellDocumentToken", static_cast<content::RenderFrameHostImpl*>(frame)->GetDocumentToken().ToString());
  result.Set("pages", std::move(pages));
  if (!ValidOwner(result)) return std::nullopt;
  return result;
}
}  // namespace aux
#endif

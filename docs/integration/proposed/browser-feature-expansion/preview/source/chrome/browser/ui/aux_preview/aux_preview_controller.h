// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_CONTROLLER_H_
#define CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_CONTROLLER_H_
#include <optional>
#include <string>
#include "base/functional/callback.h"
#include "base/callback_list.h"
#include "base/values.h"
#include "url/gurl.h"
class BrowserWindowInterface;
namespace content { class RenderFrameHost; class WebContents; }
namespace aux::preview {
inline constexpr char kPeekOrdinaryLinksPref[] = "aux.peek_links_enabled";
enum class Kind { kPeek, kQuick };
enum class Trigger { kContextMenu, kModifierClick, kOptInLinkClick };
// Native toolbar owner registers once; must install the real location bar plus
// back/dismiss/promote controls before any popup is shown. No JS registration.
void SetNativeWindowDecorator(base::RepeatingCallback<bool(BrowserWindowInterface*)>);
base::CallbackListSubscription ObservePresentation(BrowserWindowInterface*, base::RepeatingClosure);
struct OpenResult { BrowserWindowInterface* browser = nullptr; std::string error; };
// Native user intent only. These are NOT renderer-selected permission flags.
// The frame must belong to the active source tab/document at the actual event.
OpenResult OpenPeek(BrowserWindowInterface*, content::RenderFrameHost*,
                    const GURL&, Trigger);
bool CanOpenQuick(BrowserWindowInterface*);
OpenResult OpenQuick(BrowserWindowInterface*, const GURL&);
std::optional<Kind> GetKind(const BrowserWindowInterface*);
bool IsPeekContents(content::WebContents*);
bool IsPreviewContents(content::WebContents*);
// Root close path calls this before closing a marked window. False means retain
// the window and display the reason; never force-destroy active preview work.
bool CanClose(BrowserWindowInterface*, std::string* reason);
bool Dismiss(BrowserWindowInterface*, std::string* reason);
bool Back(BrowserWindowInterface*);
// Explicit actual native destination; null chooses/creates a same-profile main
// window through Chromium. Never retarget to another profile or clone the tab.
void Promote(BrowserWindowInterface* preview, BrowserWindowInterface* destination,
             const std::string& space_id,
             base::OnceCallback<void(base::DictValue)> done);
base::DictValue Presentation(BrowserWindowInterface*);
// Root popup/navigation delegation hooks call these before creating new windows
// or handling unsupported external protocols from Peek.
bool AllowNewContents(content::WebContents* source);
void ReportRestriction(content::WebContents*, std::string reason);
bool CurrentOwner(content::WebContents*);
}  // namespace aux::preview
#endif

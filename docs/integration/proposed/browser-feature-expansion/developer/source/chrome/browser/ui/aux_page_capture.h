// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_PAGE_CAPTURE_H_
#define CHROME_BROWSER_UI_AUX_PAGE_CAPTURE_H_
#include <string_view>
#include "base/functional/callback.h"
#include "base/values.h"
class Profile;
namespace content { class WebContents; class DevToolsAgentHost; }
// The installed-Agent wrapper supplies the actual native target and a callback
// bound to its window, active pane and profile admission generation.
base::DictValue BeginAuxPageSurfaceCapture(Profile*, content::WebContents*,
    std::string_view extension_document_id, base::RepeatingCallback<bool()> owner_current);
void CaptureAuxPageSurface(Profile*, std::string_view capability,
                            base::OnceCallback<void(base::DictValue)>);
base::DictValue ValidateAuxPageSurfaceCapture(Profile*, std::string_view capability);
void CancelAuxPageSurfaceCapture(Profile*, std::string_view capability);
// Same native DevTools dispatch/reply document lease used by supplied full-page
// capture. This does not create another debugging connection or renderer session.
base::RepeatingCallback<bool()> GetAuxPageCaptureDocumentGuard(
    content::DevToolsAgentHost*, std::string_view capability);
base::DictValue GetAuxPageCaptureTarget(Profile*, content::WebContents* actual_pane);
bool CanAuxCapturePage(content::WebContents*);
#endif

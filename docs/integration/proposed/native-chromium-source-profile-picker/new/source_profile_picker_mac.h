// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SOURCE_PROFILE_PICKER_MAC_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_SOURCE_PROFILE_PICKER_MAC_H_

#include <string>

#include "base/functional/callback_forward.h"
#include "base/values.h"
#include "ui/gfx/geometry/rect.h"

namespace content {
class WebContents;
}

namespace aux_import {
// UI thread only. Rows are the actual native discovery projection, retaining
// name/subtitle/id/nativePath. Only Continue invokes selected, with the whole
// chosen row. Dismissal or replacement never synthesizes a selection/cancel.
void ShowChromiumSourceProfilePicker(
    content::WebContents* web_contents,
    const gfx::Rect& button_bounds,
    std::u16string browser_name,
    base::ListValue profiles,
    base::OnceCallback<void(base::DictValue)> selected);
}  // namespace aux_import
#endif

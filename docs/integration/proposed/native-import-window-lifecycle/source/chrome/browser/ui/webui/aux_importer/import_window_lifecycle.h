// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_WINDOW_LIFECYCLE_H_
#define CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_WINDOW_LIFECYCLE_H_

#include "base/functional/callback.h"
#include "ui/gfx/native_ui_types.h"

namespace base { class FilePath; }
class BrowserWindowInterface;
namespace content { class WebContents; }

namespace aux_importer {
// Captures the actual initiating native window weakly. The callback never
// resolves a different browser/window after a profile transfer or tab move.
base::RepeatingCallback<void(bool)> CaptureImportWindowControls(
    content::WebContents& contents);

// Supplied 7acaadc: real profile load followed by the real browser-window
// creation/reuse path, with always_create=false and command-line URLs=false.
// The caller must supply the genuine post-load coordinator; the source's
// 458d2f0 callback is NOT a synonym for BrowserWindow::Activate().
void LoadImportedProfile(
    const base::FilePath& path,
    base::OnceCallback<void(BrowserWindowInterface*)> profile_window_ready);
}  // namespace aux_importer
#endif

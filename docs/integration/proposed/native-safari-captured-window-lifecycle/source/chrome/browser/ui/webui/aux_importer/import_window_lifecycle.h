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
// Actual standalone importer provenance, not merely a matching tab URL. Both
// capture helpers return empty for ordinary browser tabs. Owners must reject
// that context before starting work, rather than accepting an absent lifecycle.
bool IsStandaloneImportOwner(content::WebContents& contents);
// Capture the actual initiating owner once; presence is registry/context/native
// identity, not visibility or an invented successful account/profile state.
base::RepeatingCallback<bool()> CaptureImportOwnerPresence(
    content::WebContents& contents);
// True only after the real native warning is displayed. False requires the
// caller's actual weak WebUI invalid-file event; the two branches are exclusive.
base::OnceCallback<bool()> CaptureSafariInvalidArchiveWarning(
    content::WebContents& contents);
base::RepeatingCallback<void(bool)> CaptureImportWindowControls(
    content::WebContents& contents);

// Supplied 7acaadc: real profile load followed by the real browser-window
// creation/reuse path, with always_create=false and command-line URLs=false.
// The caller must supply the genuine post-load coordinator; the source's
// 458d2f0 callback is NOT a synonym for BrowserWindow::Activate().
// Actual458d5b0/718: retire the initiating native widget immediately. Weak
// native identity is retained, and the original NSWindow fallback is preserved.
base::OnceClosure CaptureImportOwnerRetirement(content::WebContents& contents);

// Actual458d2f0 completion: load the real profile/window, then request its
// existing source-owned account-password/bootstrap gate. No unlock is inferred.
void OpenImportedProfile(const base::FilePath& path);

void LoadImportedProfile(
    const base::FilePath& path,
    base::OnceCallback<void(BrowserWindowInterface*)> profile_window_ready);
}  // namespace aux_importer
#endif

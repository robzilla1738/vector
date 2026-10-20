// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/webui/aux_importer/import_window_lifecycle.h"

#import <AppKit/AppKit.h>

#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "chrome/browser/profiles/profile_window.h"
#include "content/public/browser/web_contents.h"

namespace aux_importer {
base::RepeatingCallback<void(bool)> CaptureImportWindowControls(
    content::WebContents& contents) {
  // gfx::NativeWindow is Chromium's WeakNSWindow, not an owning NSWindow*.
  return base::BindRepeating(
      [](gfx::NativeWindow owner, bool enabled) {
        NSWindow* window = owner.GetNativeNSWindow();
        if (!window) {
          return;
        }
        // Original458cf98 updates these exact three standard buttons only.
        [[window standardWindowButton:NSWindowCloseButton] setEnabled:enabled];
        [[window standardWindowButton:NSWindowMiniaturizeButton] setEnabled:enabled];
        [[window standardWindowButton:NSWindowZoomButton] setEnabled:enabled];
      },
      contents.GetTopLevelNativeWindow());
}

void LoadImportedProfile(
    const base::FilePath& path,
    base::OnceCallback<void(BrowserWindowInterface*)> profile_window_ready) {
  CHECK(profile_window_ready);
  profiles::SwitchToProfile(path, /*always_create=*/false,
                            std::move(profile_window_ready),
                            /*open_command_line_urls=*/false);
}
}  // namespace aux_importer

// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/webui/aux_importer/import_window_lifecycle.h"

#import <AppKit/AppKit.h>

#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "chrome/browser/profiles/profile_window.h"
#include "chrome/browser/aux/profile_gate.h"
#include "chrome/browser/ui/webui/aux_importer/import_completion_choice.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "ui/base/base_window.h"
#include "ui/views/widget/widget.h"
#include "content/public/browser/web_contents.h"

namespace aux_importer {
bool IsStandaloneImportOwner(content::WebContents& contents) {
  auto* browser = GlobalBrowserCollection::GetInstance()->FindBrowserWithTab(
      &contents);
  if (!browser || browser->GetType() != BrowserWindowInterface::TYPE_APP_POPUP) {
    return false;
  }
  const auto* init = BrowserInitState::From(browser);
  auto* tabs = browser->GetTabStripModel();
  const auto& url = contents.GetLastCommittedURL();
  return init && init->create_params().app_name == "aux-import-data" &&
         tabs && tabs->count() == 1 && tabs->GetWebContentsAt(0) == &contents &&
         url.SchemeIs("chrome") && url.host() == "aux-import-data";
}
namespace {
bool RetainsStandaloneOwner(
    const base::WeakPtr<content::WebContents>& contents,
    gfx::NativeWindow owner) {
  return contents && IsStandaloneImportOwner(*contents) &&
         contents->GetTopLevelNativeWindow().GetNativeNSWindow() ==
             owner.GetNativeNSWindow();
}
}  // namespace
base::RepeatingCallback<bool()> CaptureImportOwnerPresence(
    content::WebContents& contents) {
  return base::BindRepeating(
      [](base::WeakPtr<content::WebContents> contents, gfx::NativeWindow owner) {
        return owner.GetNativeNSWindow() &&
               RetainsStandaloneOwner(contents, owner);
      },
      contents.GetWeakPtr(), contents.GetTopLevelNativeWindow());
}

base::OnceCallback<bool()> CaptureSafariInvalidArchiveWarning(
    content::WebContents& contents) {
  return base::BindOnce(
      [](base::RepeatingCallback<bool()> owner_present) {
        if (!owner_present.Run()) {
          return false;
        }
        ShowSafariInvalidArchive();
        return true;
      },
      CaptureImportOwnerPresence(contents));
}

base::RepeatingCallback<void(bool)> CaptureImportWindowControls(
    content::WebContents& contents) {
  if (!IsStandaloneImportOwner(contents)) {
    return {};
  }
  // gfx::NativeWindow is Chromium's WeakNSWindow, not an owning NSWindow*.
  return base::BindRepeating(
      [](base::WeakPtr<content::WebContents> contents,
         gfx::NativeWindow owner, bool enabled) {
        if (!RetainsStandaloneOwner(contents, owner)) {
          return;
        }
        NSWindow* window = owner.GetNativeNSWindow();
        if (!window) {
          return;
        }
        // Original458cf98 updates these exact three standard buttons only.
        [[window standardWindowButton:NSWindowCloseButton] setEnabled:enabled];
        [[window standardWindowButton:NSWindowMiniaturizeButton] setEnabled:enabled];
        [[window standardWindowButton:NSWindowZoomButton] setEnabled:enabled];
      },
      contents.GetWeakPtr(), contents.GetTopLevelNativeWindow());
}

base::OnceClosure CaptureImportOwnerRetirement(content::WebContents& contents) {
  if (!IsStandaloneImportOwner(contents)) {
    return {};
  }
  return base::BindOnce(
      [](base::WeakPtr<content::WebContents> contents, gfx::NativeWindow owner) {
        if (!RetainsStandaloneOwner(contents, owner)) {
          return;
        }
        NSWindow* window = owner.GetNativeNSWindow();
        if (!window) {
          return;
        }
        if (auto* widget = views::Widget::GetWidgetForNativeWindow(owner)) {
          // Original2959bb0 is Widget::CloseNow, not Browser::WindowClosing.
          // The real Widget/Browser owners perform their own destruction.
          widget->CloseNow();
          return;
        }
        // Original458d6f4..708 and458d854..868 non-Views fallback.
        [window orderOut:nil];
        [window close];
      },
      contents.GetWeakPtr(), contents.GetTopLevelNativeWindow());
}

void OpenImportedProfile(const base::FilePath& path) {
  LoadImportedProfile(
      path, base::BindOnce([](BrowserWindowInterface* browser) {
        if (browser) {
          // Singleton2e84c48 is string-pinned AsideAccountPasswordGate.
          // Existing155 gate preserves original417c4ec policy/lifetime.
          aux::RequestProfileBootstrap(browser->GetProfile());
        }
      }));
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

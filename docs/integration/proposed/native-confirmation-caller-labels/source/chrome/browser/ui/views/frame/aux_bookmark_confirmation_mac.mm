// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_bookmark_confirmation.h"

#import <AppKit/AppKit.h>
#include <memory>
#include <utility>
#include "base/functional/callback.h"
#include "base/strings/sys_string_conversions.h"

namespace aux {
namespace {
struct ConfirmationState {
  ConfirmationState(NSAlert* value, base::OnceCallback<void(bool)> done)
      : alert(value), completion(std::move(done)) {}
  NSAlert* __strong alert;
  base::OnceCallback<void(bool)> completion;
};
}  // namespace

void PerformBookmarkDragDestinationFeedback() {
  id<NSHapticFeedbackPerformer> performer =
      [NSHapticFeedbackManager defaultPerformer];
  [performer performFeedbackPattern:NSHapticFeedbackPatternLevelChange
                    performanceTime:NSHapticFeedbackPerformanceTimeNow];
  [performer
      performFeedbackPattern:NSHapticFeedbackPatternLevelChange
             performanceTime:NSHapticFeedbackPerformanceTimeDrawCompleted];
}
void ShowAuxNativeConfirmation(gfx::NativeWindow parent,
                               const std::u16string& title,
                               const std::u16string& body,
                               const std::u16string& accept_label,
                               const std::u16string& cancel_label,
                               base::OnceCallback<void(bool)> completion) {
  NSAlert* alert = [[NSAlert alloc] init];
  alert.messageText = base::SysUTF16ToNSString(title.empty() ? body : title);
  alert.informativeText =
      base::SysUTF16ToNSString(title.empty() ? std::u16string() : body);
  alert.alertStyle = NSAlertStyleWarning;
  [alert addButtonWithTitle:base::SysUTF16ToNSString(accept_label)];
  NSButton* cancel =
      [alert addButtonWithTitle:base::SysUTF16ToNSString(cancel_label)];
  cancel.keyEquivalent = @"\e";
  NSWindow* window = parent.GetNativeNSWindow();
  if (window.sheetParent)
    window = window.sheetParent;
  if (window && !window.attachedSheet) {
    // Original4152898 retains its native alert through completion, clears
    // that ownership before invoking the one-shot action, and accepts only1000.
    // The model action itself is bound to the genuine view owner's WeakPtr.
    auto state =
        std::make_shared<ConfirmationState>(alert, std::move(completion));
    [alert beginSheetModalForWindow:window
                  completionHandler:^(NSModalResponse response) {
                    auto callback = std::move(state->completion);
                    state->alert = nil;
                    if (callback)
                      std::move(callback).Run(response ==
                                              NSAlertFirstButtonReturn);
                  }];
    return;
  }
  const NSModalResponse response = [alert runModal];
  if (completion)
    std::move(completion).Run(response == NSAlertFirstButtonReturn);
}
void ShowBookmarkDeleteConfirmation(gfx::NativeWindow parent,
                                    const std::u16string& title,
                                    const std::u16string& body,
                                    base::OnceCallback<void(bool)> completion) {
  ShowAuxNativeConfirmation(parent, title, body, u"Delete", u"Cancel",
                            std::move(completion));
}
}  // namespace aux

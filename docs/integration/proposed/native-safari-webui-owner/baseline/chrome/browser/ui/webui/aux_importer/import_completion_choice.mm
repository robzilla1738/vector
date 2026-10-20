// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/webui/aux_importer/import_completion_choice.h"
#import <AppKit/AppKit.h>
#include <utility>
#include "base/strings/sys_string_conversions.h"
namespace aux_importer {
void ShowNewProfileImportCompleted(const std::u16string& browser_name,
                                   base::OnceClosure open_profile) {
  NSAlert* alert = [[NSAlert alloc] init];
  alert.alertStyle = NSAlertStyleInformational;
  alert.messageText =
      base::SysUTF16ToNSString(browser_name + u" migration completed.");
  alert.informativeText = base::SysUTF16ToNSString(
      u"Your data was migrated from " + browser_name +
      u". Do you want to open the migrated profile now?");
  [alert addButtonWithTitle:@"Open Profile"];
  [alert addButtonWithTitle:@"Not Now"];
  if ([alert runModal] == NSAlertFirstButtonReturn)
    std::move(open_profile).Run();
}
void ShowCurrentProfileImportCompleted(const std::u16string& browser_name) {
  NSAlert* alert = [[NSAlert alloc] init];
  alert.alertStyle = NSAlertStyleInformational;
  alert.messageText =
      base::SysUTF16ToNSString(browser_name + u" import completed.");
  alert.informativeText = base::SysUTF16ToNSString(
      u"Your data was imported from " + browser_name + u".");
  [alert addButtonWithTitle:@"OK"];
  [alert runModal];
}
}  // namespace aux_importer

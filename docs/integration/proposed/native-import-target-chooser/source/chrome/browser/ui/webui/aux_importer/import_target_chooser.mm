// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/webui/aux_importer/import_target_chooser.h"
#import <AppKit/AppKit.h>
#include <utility>
#include "base/strings/sys_string_conversions.h"

namespace aux_importer {
void ShowImportTargetChooser(const std::u16string& browser_name,
                             ImportTargetChoiceCallback callback) {
  NSAlert* alert = [[NSAlert alloc] init];
  alert.alertStyle = NSAlertStyleInformational;
  alert.messageText =
      base::SysUTF16ToNSString(u"Import " + browser_name + u" Data");
  alert.informativeText = base::SysUTF16ToNSString(
      u"Where do you want to import " + browser_name + u" data?");
  [alert addButtonWithTitle:@"New Profile"];
  [alert addButtonWithTitle:@"Current Profile"];
  [alert addButtonWithTitle:@"Cancel"];
  const NSModalResponse response = [alert runModal];
  std::optional<ImportTargetChoice> choice;
  if (response == NSAlertFirstButtonReturn)
    choice = ImportTargetChoice::kNewProfile;
  else if (response == NSAlertSecondButtonReturn)
    choice = ImportTargetChoice::kCurrentProfile;
  std::move(callback).Run(choice);
}
}  // namespace aux_importer

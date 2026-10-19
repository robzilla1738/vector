// Copyright 2026 Aux Authors. All rights reserved.
#import <Foundation/Foundation.h>

#include "base/apple/bundle_locations.h"
#include "base/values.h"
#include "chrome/browser/mac/dock.h"
namespace extensions {
base::DictValue ReadAuxDockState() {
  auto state = dock::ChromeIsInTheDock();
  base::DictValue value;
  // Preserve the supplied macOS contract: only confirmed absence permits Add.
  // The original isAdded expression also covers an unreadable Dock state;
  // retain `known` so that uncertainty remains observable to newer consumers.
  value.Set("supported", true);
  value.Set("isAdded", state != dock::ChromeInDockStatus::kNotPresent);
  value.Set("canAdd", state == dock::ChromeInDockStatus::kNotPresent);
  value.Set("inDock", state == dock::ChromeInDockStatus::kPresent);
  value.Set("known", state != dock::ChromeInDockStatus::kFailure);
  return value;
}
base::DictValue AddAuxToDock() {
  auto result = dock::AddIcon(base::apple::OuterBundle().bundlePath, nil);
  auto state = ReadAuxDockState();
  state.Set("success", result != dock::AddIconStatus::kFailure);
  return state;
}
}  // namespace extensions

#pragma once
#include "AuxNativeEnvironmentPreload.h"

struct AuxNativeNodeRunResult {
  int exit_code;
  bool entry_loaded;
  AuxDevelopmentWorkerDrain native_drain;
};

// Native execution plumbing only. The actual cold caller must retain the
// initialized process/platform/setup, authenticate entry bytes and establish
// custody before constructing the provider-backed preload. No argv/JS value
// creates a host here. Invoke once on this Environment's owning thread.
// An unresolved drain requires retaining setup/platform/preload; this function
// never frees them or turns a return value into custody/activation authority.
AuxNativeNodeRunResult RunAuxNativeNodeEnvironment(
    node::CommonEnvironmentSetup& setup, const node::ModuleData& entry,
    AuxNativeEnvironmentPreload& preload);

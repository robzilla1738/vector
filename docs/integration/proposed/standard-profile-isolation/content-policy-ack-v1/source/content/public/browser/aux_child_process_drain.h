// Copyright 2026 The Aux Authors
#ifndef CONTENT_PUBLIC_BROWSER_AUX_CHILD_PROCESS_DRAIN_H_
#define CONTENT_PUBLIC_BROWSER_AUX_CHILD_PROCESS_DRAIN_H_
#include <cstddef>
#include <cstdint>
#include "content/common/content_export.h"
namespace content::aux_migration {
struct ChildProcessDrainSnapshot {
  bool admission_closed = false;
  bool wrong_process = false;
  bool accounting_unknown = false;
  size_t pending = 0;
  size_t unbound = 0;
  size_t uncertain = 0;
  uint64_t settled = 0;
  // Successful direct launches whose descendant write closure is unproved.
  // Reap alone cannot clear it. An exact authenticated renderer no-fork
  // receipt plus that original reap may discharge its own cohort only.
  // Zero remains no proof of delegated or browser-side writer settlement.
  uint64_t unobserved_descendant_cohorts = 0;
};
// mac content launch owner only. Neither a second reaper nor a descendant census.
CONTENT_EXPORT void CloseContentChildLaunchAdmission();
CONTENT_EXPORT ChildProcessDrainSnapshot InspectContentChildDrain();
// Native embedder-only, one immutable callback, invoked after the actual main
// loop and all its members have been destroyed, never on window/profile close.
CONTENT_EXPORT bool RegisterBrowserShutdownCompletion(void (*completed)());
CONTENT_EXPORT void ObserveBrowserMainLoopDestroyedForDrain();
}
#endif

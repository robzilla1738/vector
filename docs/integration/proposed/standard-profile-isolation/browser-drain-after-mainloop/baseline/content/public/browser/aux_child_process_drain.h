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
};
// mac content launch owner only. Neither a second reaper nor a descendant census.
CONTENT_EXPORT void CloseContentChildLaunchAdmission();
CONTENT_EXPORT ChildProcessDrainSnapshot InspectContentChildDrain();
}
#endif

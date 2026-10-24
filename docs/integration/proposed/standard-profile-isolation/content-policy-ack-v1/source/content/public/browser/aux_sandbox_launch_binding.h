// Copyright 2026 The Aux Authors
#ifndef CONTENT_PUBLIC_BROWSER_AUX_SANDBOX_LAUNCH_BINDING_H_
#define CONTENT_PUBLIC_BROWSER_AUX_SANDBOX_LAUNCH_BINDING_H_
#include <cstdint>
#include "base/process/process_handle.h"
#include "base/time/time.h"
#include "content/common/content_export.h"
namespace content {
class CONTENT_EXPORT AuxSandboxLaunchBinding {
 public:
  virtual ~AuxSandboxLaunchBinding() = default;
  virtual uint64_t generation() const = 0;
  // Called under the original launch record's sole-reaper mutex. Must be safe
  // off the UI thread, retain its native authority, and recheck after reads.
  virtual bool Validate(base::ProcessId pid, base::Time birth) const = 0;
};
}  // namespace content
#endif

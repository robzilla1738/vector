// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_WARM_INPUT_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_WARM_INPUT_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <cstdint>
#include <optional>
#include "base/time/time.h"
#include "base/functional/function_ref.h"
class BrowserWindowInterface;
namespace aux {
struct NativeWarmInput {
  base::TimeTicks original_event_time;
  double original_event_seconds = 0;
  uint64_t original_cg_timestamp_ns = 0;
  int window_number = 0;
  int64_t source_pid = 0;
  int64_t source_state = 0;
  uint16_t key_code = 0;
  uint64_t cg_flags = 0, modifier_flags = 0;
};
// Actual current AppKit event only. No caller PID, timestamp, event or window
// selector. This is measurement provenance, never input/effect authorization.
std::optional<NativeWarmInput> ReadNativeWarmCurrentKeyDown(
    BrowserWindowInterface* original, base::FunctionRef<bool()> original_stable);
}  // namespace aux
#endif
#endif

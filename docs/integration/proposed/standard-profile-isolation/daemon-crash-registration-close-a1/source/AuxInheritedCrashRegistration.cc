// Copyright 2026 The Aux Authors.
#include "AuxInheritedCrashRegistration.h"
#include <mach/mach.h>
#include <mach/machine/thread_status.h>
#include <servers/bootstrap.h>
#include <unistd.h>
#include <array>
#include <mutex>

namespace {
// Same actual Crashpad task registration on the supported macOS >=27 path.
// EXC_GUARD is delivered as EXC_CRASH on macOS >=13. Other masks are untouched.
constexpr exception_mask_t kMask = EXC_MASK_CRASH | EXC_MASK_RESOURCE;
constexpr size_t kMaxPorts = 32;  // Actual task_get_exception_ports MIG capacity.
struct Ports {
  std::array<exception_mask_t, kMaxPorts> masks{};
  std::array<exception_handler_t, kMaxPorts> ports{};
  std::array<exception_behavior_t, kMaxPorts> behaviors{};
  std::array<thread_state_flavor_t, kMaxPorts> flavors{};
  mach_msg_type_number_t count = kMaxPorts;
  bool Read() {
    if (task_get_exception_ports(mach_task_self(), kMask, masks.data(), &count,
                                ports.data(), behaviors.data(), flavors.data()) !=
        KERN_SUCCESS || count > kMaxPorts) return false;
    exception_mask_t found = 0;
    for (size_t i = 0; i < count; ++i) {
      if (!masks[i] || (masks[i] & ~kMask) || (found & masks[i]) ||
          ports[i] == MACH_PORT_DEAD) return false;
      found |= masks[i];
    }
    return found == kMask;
  }
  bool Same(const Ports& other) const {
    if (count != other.count) return false;
    for (size_t i = 0; i < count; ++i)
      if (masks[i] != other.masks[i] || ports[i] != other.ports[i] ||
          behaviors[i] != other.behaviors[i] || flavors[i] != other.flavors[i])
        return false;
    return true;
  }
  bool Release() {
    bool released = true;
    // Failed/malformed queries remain retained; never index using a bad count.
    for (size_t i = 0; i < kMaxPorts; ++i) {
      if (ports[i] == MACH_PORT_NULL) continue;
      if (ports[i] == MACH_PORT_DEAD ||
          mach_port_deallocate(mach_task_self(), ports[i]) != KERN_SUCCESS) {
        released = false;
        continue;
      }
      ports[i] = MACH_PORT_NULL;
    }
    return released;
  }
};
struct State {
  const pid_t process = getpid();
  std::mutex mutex;
  bool attempted = false;
  bool captured = false;
  bool closed = false;
  bool unknown = false;
  Ports inherited;
  Ports current;
  mach_port_t system = MACH_PORT_NULL;
};
State& Get() {
  // Retain uncertain rights and evidence through process exit. No destructor
  // can silently turn an unverified/partially closed registration into CLEAN.
  static auto* state = new State;
  return *state;
}
}

extern "C" int32_t AuxCaptureInheritedCrashRegistration() {
  try {
    auto& s = Get();
    std::lock_guard<std::mutex> lock(s.mutex);
    if (getpid() != s.process || s.attempted) return 2;
    s.attempted = true;
    s.captured = s.inherited.Read();
    s.unknown = !s.captured;
    return s.captured ? 0 : 2;
  } catch (...) { return 2; }
}

extern "C" int32_t AuxCloseInheritedCrashRegistration() {
  try {
    auto& s = Get();
    std::lock_guard<std::mutex> lock(s.mutex);
    if (getpid() != s.process || !s.captured || s.unknown) return 2;
    if (s.closed) return 0;
    if (!s.current.Read() || !s.inherited.Same(s.current)) {
      s.unknown = true;
      return 2;  // A changed/unverifiable registration is never overwritten.
    }
    // Same fixed system service used by upstream Crashpad. No caller port,
    // process, bootstrap namespace, path, or completion flag is accepted.
    if (bootstrap_look_up(bootstrap_port, "com.apple.ReportCrash", &s.system) !=
            BOOTSTRAP_SUCCESS ||
        s.system == MACH_PORT_NULL || s.system == MACH_PORT_DEAD ||
        task_set_exception_ports(mach_task_self(), kMask, s.system,
                                 EXCEPTION_STATE_IDENTITY | MACH_EXCEPTION_CODES,
                                 MACHINE_THREAD_STATE) != KERN_SUCCESS) {
      s.unknown = true;
      return 2;
    }
    // The own-task registration is now system-owned. Every retained snapshot
    // and query right must physically close too before the browser handler can
    // observe native no-senders. No rollback or false-success retry on failure.
    const bool inherited_released = s.inherited.Release();
    const bool current_released = s.current.Release();
    const bool system_released =
        mach_port_deallocate(mach_task_self(), s.system) == KERN_SUCCESS;
    if (system_released) s.system = MACH_PORT_NULL;
    if (!inherited_released || !current_released || !system_released) {
      s.unknown = true;
      return 2;
    }
    s.closed = true;
    return 0;
  } catch (...) { return 2; }
}

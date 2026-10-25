#pragma once
#include <cstdint>
#include <bsm/audit.h>
#include <mach/mach.h>
#include <functional>
#include <memory>

namespace aux::descendants {
// Native-only capabilities. Never exported as a JS handle, path, PID selector,
// serialized proof, or entitlement substitute.
class Cohort;
using Ticket = std::shared_ptr<Cohort>;
enum class Result { pending, settled, unknown, refused };

// Exactly once, at the fixed executable's first native main entry, before
// bootstrap/image loading/Node/worker creation. Refuses unavailable capability.
// This is NOT a late attach API for a process with pre-existing task children.
int InitializeAtFreshDaemonEntry() noexcept;
void CloseAdmission() noexcept;
Ticket Reserve(uint64_t native_owner_generation,
               std::function<void()> actual_settled) noexcept;
bool MaySpawn(const Ticket&) noexcept;
// Only original native successful-spawn callback supplies this PID. The ES
// birth's audit identity/time range must match before it can settle anything.
void DidCreate(const Ticket&, int64_t native_pid) noexcept;
void DidFailBeforeChild(const Ticket&) noexcept;
// Only the original sole native reaper may supply this terminal observation.
// A true value alone is not descendant settlement.
void DidObserveOriginalReap(const Ticket&, bool matched_terminal_result) noexcept;
Result Inspect(const Ticket&) noexcept;
Result InspectStream() noexcept;
// Native facts only. The caller supplies the genuine kernel Mach audit trailer,
// never a claimed PID/parent/JSON identity. Returns one actual live published
// reservation cohort; missing, ambiguous or not-yet-published membership stays
// unknown. This is NOT a Profile/account grant or a human-terminal classifier.
Ticket RetainActualClientCohort(const audit_token_t& kernel_peer) noexcept;
}  // namespace aux::descendants

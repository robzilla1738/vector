#pragma once
#include <cstdint>
#include <functional>
#include <memory>
#include "base/process/mac/aux_browser_descendant_cli_membership.h"

namespace aux::browser_descendants {
// Native-only capabilities. Never exported as a JS handle, path, PID selector,
// serialized proof, or entitlement substitute.
class Cohort;
using Ticket = std::shared_ptr<Cohort>;
enum class Result { pending, settled, unknown, refused };
// Primary executable implementation; Framework clients use the narrow main-image query.
CliClientMembership InspectActualCliClientInPrimaryImage(audit_token_t) noexcept;

// Exactly once, at the fixed executable's first native main entry, before
// bootstrap/image loading/Node/worker creation. Refuses unavailable capability.
// This is NOT a late attach API for a process with pre-existing task children.
int InitializeAtFreshBrowserEntry() noexcept;
bool TransferDaemon(const Ticket&, uint64_t authenticated_generation) noexcept;
Result InspectBrowserScope(uint64_t authenticated_generation) noexcept;
void CloseAdmission() noexcept;
Ticket Reserve(uint32_t native_launch_family,
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
}  // namespace aux::browser_descendants

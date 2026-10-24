// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux_browser_shutdown_drain.h"
#include <CommonCrypto/CommonDigest.h>
#include <algorithm>
#include <array>
#include <cstdlib>
#include <mutex>
#include <optional>
#include <unistd.h>
#include "base/functional/bind.h"
#include "base/no_destructor.h"
#include "base/run_loop.h"
#include "base/threading/platform_thread.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/AuxNativePeerTransport.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h"
#include "chrome/browser/ui/aux_owned_browser_quiesce.h"
namespace aux {
namespace {
struct ShutdownDrainState {
  ShutdownDrainState();
  ~ShutdownDrainState();
  const pid_t process = getpid();
  std::mutex mutex;
  bool started = false;
  bool provider_failed = false;
  bool frozen = false;
  bool main_loop_destroyed = false;
  bool acknowledged = false;
  bool final_wait_exhausted = false;
  std::array<uint8_t, 32> session{};
  std::optional<OwnedBrowserQuiesceObservation> observation;
  std::optional<peer::BrowserDrainReport> last_report;
};
ShutdownDrainState::ShutdownDrainState() { arc4random_buf(session.data(), session.size()); }
ShutdownDrainState::~ShutdownDrainState() = default;
ShutdownDrainState& State() { static base::NoDestructor<ShutdownDrainState> state; return *state; }
void Put(peer::BrowserDrainReport& report, size_t offset, uint64_t value, size_t bytes) {
  for (size_t i = 0; i < bytes; ++i) {
    report[offset + bytes - i - 1] = static_cast<uint8_t>(value & 255);
    value >>= 8;
  }
}
peer::BrowserDrainReport Report(uint64_t expected_generation,
                               const peer::BrowserDrainChallenge& challenge) {
  auto& state = State();
  peer::BrowserDrainReport report{};
  const auto native = peer::InspectNativeBrowserShutdown();
  std::lock_guard<std::mutex> lock(state.mutex);
  Put(report, 0, 1, 4);
  Put(report, 8, expected_generation, 8);
  Put(report, 24, native.phase, 4);
  std::copy(challenge.begin(), challenge.end(), report.begin() + 32);
  std::copy(state.session.begin(), state.session.end(), report.begin() + 96);
  uint32_t status = 1;
  if (getpid() != state.process || native.wrong_process || native.sequence_uncertain ||
      !expected_generation || native.admitted_generation != expected_generation ||
      state.provider_failed || state.final_wait_exhausted) status = 2;
  else if (state.frozen && state.observation) {
    auto observed = *state.observation;
    // These process-lifetime registries remain valid after Profile/UI teardown.
    // Their actual original worker/reaper completions are never replaced by the
    // earlier UI snapshot or the destruction of a host/callback receiver.
    observed.feature_writes = features::InspectNativeFeatureWrites();
    observed.content_children = content::aux_migration::InspectContentChildDrain();
    const auto messaging = extensions::AuxNativeMessagingLifetime::Inspect();
    observed.native_messaging = {messaging.admission_closed, messaging.wrong_process,
        messaging.accounting_unknown, messaging.unresolved, messaging.unbound,
        messaging.uncertain, messaging.settled};
    const auto readiness = EvaluateOwnedBrowserParticipantDrain(observed);
    const auto carriers = InspectInstallationCarrierCustody();
    if (readiness.unknown || carriers.unresolved_children) status = 2;
    else if (readiness.close_requested && readiness.process_shutdown &&
             !readiness.pending && native.admission_closed && native.phase == 6 &&
             !native.active_authority_reads && carriers.drained() &&
             state.main_loop_destroyed) status = 0;
    // Canonical digest binds the exact closed process cohort counters. It is
    // descriptive integrity inside authenticated IPC, not a signature/grant.
    peer::BrowserDrainReport cohort{};
    Put(cohort, 0, expected_generation, 8);
    Put(cohort, 8, native.phase, 8);
    Put(cohort, 16, observed.content_children.settled, 8);
    Put(cohort, 24, observed.native_messaging.settled, 8);
    Put(cohort, 32, observed.feature_writes.settled, 8);
    Put(cohort, 40, observed.feature_writes.refused, 8);
    Put(cohort, 48, observed.sessions ? observed.sessions->loaded_profile_count : 0, 8);
    Put(cohort, 56, observed.service_workers.observed_context_stop_callbacks, 8);
    std::copy(state.session.begin(), state.session.end(), cohort.begin() + 64);
    std::array<uint8_t, 32> digest{};
    CC_SHA256(cohort.data(), cohort.size(), digest.data());
    std::copy(digest.begin(), digest.end(), report.begin() + 64);
  }
  Put(report, 4, status, 4);
  if (status == 0) {
    Put(report, 16, 1, 8);  // One irreversible process-shutdown receipt.
    state.last_report = report;
  }
  return report;
}
void Acknowledged(const peer::BrowserDrainReport& report) {
  auto& state = State();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (getpid() == state.process && state.last_report && *state.last_report == report)
    state.acknowledged = true;
}
}  // namespace
void PrepareNativeBrowserShutdownDrain() {
  auto& state = State();
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (getpid() != state.process || state.started) return;
    state.started = true;
    state.provider_failed = !peer::RegisterBrowserDrainReportProvider(&Report, &Acknowledged) ||
        !content::aux_migration::RegisterBrowserShutdownCompletion(&FinishNativeBrowserShutdownDrain);
  }
  CloseInstallationCarrierAdmission();
  CloseOwnedBrowserParticipantsForShutdown(base::BindOnce(
      [](OwnedBrowserQuiesceObservation) {}));
  // Keep UI/session/worker callbacks running before ProfileManager destruction.
  // Content/native-host exits are allowed to settle later on their sole reapers.
  // A bounded wait is never converted into success.
  base::RunLoop loop;
  base::RepeatingTimer poll;
  const auto deadline = base::TimeTicks::Now() + base::Seconds(5);
  poll.Start(FROM_HERE, base::Milliseconds(25), base::BindRepeating([&] {
    auto observed = InspectOwnedBrowserParticipantQuiesce();
    auto before_children = observed;
    before_children.content_children.pending = 0;
    before_children.content_children.unbound = 0;
    before_children.native_messaging.pending = 0;
    before_children.native_messaging.unbound = 0;
    const auto ready = EvaluateOwnedBrowserParticipantDrain(before_children);
    if ((!ready.pending && !ready.unknown) || base::TimeTicks::Now() >= deadline) {
      std::lock_guard<std::mutex> lock(state.mutex);
      state.observation = std::move(observed);
      state.frozen = true;
      loop.Quit();
    }
  }));
  loop.Run();
}
void FinishNativeBrowserShutdownDrain() {
  auto& state = State();
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (getpid() != state.process || !state.started || state.main_loop_destroyed) return;
    state.main_loop_destroyed = true;
  }
  const auto deadline = base::TimeTicks::Now() + base::Seconds(10);
  for (;;) {
    bool acknowledged;
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      if (getpid() != state.process || !state.started) return;
      acknowledged = state.acknowledged;
    }
    // Do not close the peer before CLEAN ACK. Then retain the existing child
    // monitor/reaper until its actual exit result, never merely peer loss.
    if (acknowledged) {
      const auto closed = peer::CloseNativeSelectedStateHome();
      if (closed.child_close && closed.child_close->exit_observed_and_reaped &&
          !closed.child_close->exit_ownership_unknown && !closed.monitor_running &&
          !closed.monitor_join_pending && !closed.initialization_pending &&
          !closed.active_reads) return;
    }
    if (base::TimeTicks::Now() >= deadline) {
      std::lock_guard<std::mutex> lock(state.mutex);
      state.final_wait_exhausted = true;
      return;  // Retained ownership/pending evidence is not erased.
    }
    base::PlatformThread::Sleep(base::Milliseconds(25));
  }
}
}  // namespace aux

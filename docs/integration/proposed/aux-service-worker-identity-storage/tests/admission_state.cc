#include "content/browser/service_worker/aux_service_worker_admission_state.h"
#include <cassert>

using namespace content::aux_migration;
int main() {
  int context = 0, missing = 0;
  ObserveServiceWorkerContextRegistered(&context);
  ObserveServiceWorkerContextRegistered(&missing);
  const auto start = ObserveServiceWorkerStartRequested();
  const auto lost = ObserveServiceWorkerStartRequested();
  const auto stop = ObserveServiceWorkerContextStopRequested(&context, true);
  const auto no_core = ObserveServiceWorkerContextStopRequested(&missing, false);
  auto open = InspectServiceWorkerAdmissionState();
  assert(open.generation == 1 && open.pending_start_callbacks == 2);
  assert(open.pending_context_stop_callbacks == 2 && open.unavailable_context_cores == 1);
  CloseServiceWorkerAdmissionState();
  assert(!ServiceWorkerStartsAllowedForMigration());
  // The actual adapter turns this real late success into the caller's abort.
  assert(!ObserveServiceWorkerStartCallbackEntered(start, true));
  assert(InspectServiceWorkerAdmissionState().active_start_callback_dispatches == 1);
  ObserveServiceWorkerStartCallbackFinished(start);
  ObserveServiceWorkerStartCallbackLost(lost);
  {
    ScopedServiceWorkerStopCleanup cleanup;
    ObserveServiceWorkerContextStopCallback(stop);
    const auto during = InspectServiceWorkerAdmissionState();
    assert(during.observed_context_stop_callbacks == 1);
    assert(during.active_stop_cleanup_dispatches == 1);
  }
  ObserveServiceWorkerContextShutdown(&missing);
  ObserveServiceWorkerContextStopCallback(no_core);
  const auto dropped = ObserveServiceWorkerContextStopRequested(&context, true);
  ObserveServiceWorkerContextStopCallbackLost(dropped);
  ObserveServiceWorkerDetached();
  ObserveServiceWorkerStopped();
  ObserveServiceWorkerContextUnregistered(&context);
  ObserveServiceWorkerContextUnregistered(&missing);
  CloseServiceWorkerAdmissionState();
  const auto end = InspectServiceWorkerAdmissionState();
  assert(end.generation == 2 && end.start_admission_closed);
  assert(end.pending_start_callbacks == 0 && end.active_start_callback_dispatches == 0);
  assert(end.unresolved_start_callbacks == 1 && end.late_successful_start_callbacks == 1);
  assert(end.pending_context_stop_callbacks == 0 && end.observed_context_stop_callbacks == 2);
  assert(end.unresolved_context_stops == 2 && end.active_stop_cleanup_dispatches == 0);
  assert(end.detached_worker_observations == 1 && end.stopped_worker_notifications == 1);
}

#ifndef CONTENT_PUBLIC_BROWSER_AUX_SERVICE_WORKER_MIGRATION_H_
#define CONTENT_PUBLIC_BROWSER_AUX_SERVICE_WORKER_MIGRATION_H_

#include <cstddef>
#include <cstdint>
#include "content/common/content_export.h"

namespace content::aux_migration {
struct ServiceWorkerMigrationSnapshot {
  uint64_t generation;  // 1 open -> 2 permanently closed.
  bool start_admission_closed;
  size_t pending_start_callbacks;
  size_t active_start_callback_dispatches;
  size_t unresolved_start_callbacks;
  size_t late_successful_start_callbacks;
  size_t owned_context_wrappers;
  size_t pending_context_stop_callbacks;
  size_t observed_context_stop_callbacks;
  size_t active_stop_cleanup_dispatches;
  size_t unresolved_context_stops;
  size_t unavailable_context_cores;
  size_t detached_worker_observations;
  size_t stopped_worker_notifications;
};

// Actual UI-thread native participants only. No context/partition is created.
CONTENT_EXPORT void CloseServiceWorkerStartAdmissionForMigration();
CONTENT_EXPORT void StopAlreadyOwnedServiceWorkerContextsForMigration();
CONTENT_EXPORT ServiceWorkerMigrationSnapshot
InspectServiceWorkerMigrationAdmission();
}  // namespace content::aux_migration
#endif

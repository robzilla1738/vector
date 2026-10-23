#ifndef CONTENT_BROWSER_SERVICE_WORKER_AUX_SERVICE_WORKER_ADMISSION_STATE_H_
#define CONTENT_BROWSER_SERVICE_WORKER_AUX_SERVICE_WORKER_ADMISSION_STATE_H_

#include <cstdint>
#include "content/public/browser/aux_service_worker_migration.h"

namespace content::aux_migration {
// Source observations only. These functions neither select a context nor grant
// authority; actual wrapper/version callbacks supply their native owner keys.
void CloseServiceWorkerAdmissionState();
bool ServiceWorkerStartsAllowedForMigration();
ServiceWorkerMigrationSnapshot InspectServiceWorkerAdmissionState();
uint64_t ObserveServiceWorkerStartRequested();
bool ObserveServiceWorkerStartCallbackEntered(uint64_t token, bool succeeded);
void ObserveServiceWorkerStartCallbackFinished(uint64_t token);
void ObserveServiceWorkerStartCallbackLost(uint64_t token);
void ObserveServiceWorkerContextRegistered(const void* context);
void ObserveServiceWorkerContextUnregistered(const void* context);
void ObserveServiceWorkerContextShutdown(const void* context);
uint64_t ObserveServiceWorkerContextStopRequested(const void* context,
                                                bool core_available);
void ObserveServiceWorkerContextStopCallback(uint64_t token);
void ObserveServiceWorkerContextStopCallbackLost(uint64_t token);
class ScopedServiceWorkerStopCleanup final {
 public:
  ScopedServiceWorkerStopCleanup();
  ~ScopedServiceWorkerStopCleanup();
  ScopedServiceWorkerStopCleanup(const ScopedServiceWorkerStopCleanup&) = delete;
  ScopedServiceWorkerStopCleanup& operator=(const ScopedServiceWorkerStopCleanup&) = delete;
};
void ObserveServiceWorkerDetached();
void ObserveServiceWorkerStopped();
}  // namespace content::aux_migration
#endif

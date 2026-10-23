#ifndef CONTENT_BROWSER_SERVICE_WORKER_AUX_SERVICE_WORKER_MIGRATION_H_
#define CONTENT_BROWSER_SERVICE_WORKER_AUX_SERVICE_WORKER_MIGRATION_H_

#include "base/functional/callback_forward.h"
#include "content/browser/service_worker/aux_service_worker_admission_state.h"
#include "third_party/blink/public/common/service_worker/service_worker_status_code.h"

namespace content {
class ServiceWorkerContextWrapper;
namespace aux_migration {
void RegisterAlreadyOwnedServiceWorkerContext(ServiceWorkerContextWrapper* context);
void UnregisterAlreadyOwnedServiceWorkerContext(ServiceWorkerContextWrapper* context);
base::OnceCallback<void(blink::ServiceWorkerStatusCode)>
TrackServiceWorkerStartCallback(
    base::OnceCallback<void(blink::ServiceWorkerStatusCode)> callback);
}  // namespace aux_migration
}  // namespace content
#endif

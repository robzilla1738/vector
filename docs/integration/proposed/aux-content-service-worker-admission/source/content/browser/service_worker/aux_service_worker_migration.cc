#include "content/browser/service_worker/aux_service_worker_migration.h"

#include <memory>
#include <mutex>
#include <set>
#include <utility>
#include <vector>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/raw_ptr.h"
#include "content/browser/service_worker/service_worker_context_wrapper.h"
#include "content/public/browser/browser_thread.h"

namespace content::aux_migration {
namespace {
struct Registry {
  Registry();
  ~Registry();
  std::mutex mutex;
  std::set<raw_ptr<ServiceWorkerContextWrapper>> contexts;
  std::set<const void*> stop_requested;
};
Registry::Registry() = default;
Registry::~Registry() = default;
Registry& Owned() {
  static Registry* const registry = new Registry;
  return *registry;
}
class StartCompletion final {
 public:
  StartCompletion();
  ~StartCompletion();
  bool Enter(bool succeeded);
  void Finish();
 private:
  const uint64_t token_;
  bool finished_ = false;
};
StartCompletion::StartCompletion()
    : token_(ObserveServiceWorkerStartRequested()) {}
StartCompletion::~StartCompletion() {
  if (!finished_)
    ObserveServiceWorkerStartCallbackLost(token_);
}
bool StartCompletion::Enter(bool succeeded) {
  return ObserveServiceWorkerStartCallbackEntered(token_, succeeded);
}
void StartCompletion::Finish() {
  finished_ = true;
  ObserveServiceWorkerStartCallbackFinished(token_);
}
class StopCompletion final {
 public:
  explicit StopCompletion(scoped_refptr<ServiceWorkerContextWrapper> context);
  ~StopCompletion();
  void Run();
 private:
  const scoped_refptr<ServiceWorkerContextWrapper> context_;
  const uint64_t token_;
  bool finished_ = false;
};
StopCompletion::StopCompletion(scoped_refptr<ServiceWorkerContextWrapper> context)
    : context_(std::move(context)),
      token_(ObserveServiceWorkerContextStopRequested(
          context_.get(), context_->HasOwnedCoreForMigrationObservation())) {}
StopCompletion::~StopCompletion() {
  if (!finished_)
    ObserveServiceWorkerContextStopCallbackLost(token_);
}
void StopCompletion::Run() {
  finished_ = true;
  ObserveServiceWorkerContextStopCallback(token_);
}
}  // namespace

void CloseServiceWorkerStartAdmissionForMigration() {
  CHECK(BrowserThread::CurrentlyOn(BrowserThread::UI));
  CloseServiceWorkerAdmissionState();
}
ServiceWorkerMigrationSnapshot InspectServiceWorkerMigrationAdmission() {
  return InspectServiceWorkerAdmissionState();
}
void RegisterAlreadyOwnedServiceWorkerContext(ServiceWorkerContextWrapper* context) {
  CHECK(BrowserThread::CurrentlyOn(BrowserThread::UI));
  auto& owned = Owned();
  std::lock_guard<std::mutex> lock(owned.mutex);
  owned.contexts.insert(context);
  ObserveServiceWorkerContextRegistered(context);
}
void UnregisterAlreadyOwnedServiceWorkerContext(ServiceWorkerContextWrapper* context) {
  CHECK(BrowserThread::CurrentlyOn(BrowserThread::UI));
  auto& owned = Owned();
  std::lock_guard<std::mutex> lock(owned.mutex);
  owned.contexts.erase(context);
  owned.stop_requested.erase(context);
  ObserveServiceWorkerContextUnregistered(context);
}
void StopAlreadyOwnedServiceWorkerContextsForMigration() {
  CHECK(BrowserThread::CurrentlyOn(BrowserThread::UI));
  CloseServiceWorkerAdmissionState();
  std::vector<scoped_refptr<ServiceWorkerContextWrapper>> existing;
  {
    auto& owned = Owned();
    std::lock_guard<std::mutex> lock(owned.mutex);
    for (const auto& retained_key : owned.contexts) {
      auto* context = retained_key.get();
      if (owned.stop_requested.insert(context).second)
        existing.emplace_back(context);
    }
  }
  for (auto& context : existing) {
    // The actual already-owned ref is retained until the real callback is run
    // or dropped. No Registry lock crosses StopWorker/reentrant callbacks.
    auto completion = std::make_shared<StopCompletion>(context);
    context->StopAlreadyOwnedWorkersForMigration(base::BindOnce(
        [](std::shared_ptr<StopCompletion> observation) { observation->Run(); },
        std::move(completion)));
  }
}
base::OnceCallback<void(blink::ServiceWorkerStatusCode)>
TrackServiceWorkerStartCallback(
    base::OnceCallback<void(blink::ServiceWorkerStatusCode)> callback) {
  auto completion = std::make_shared<StartCompletion>();
  return base::BindOnce(
      [](std::shared_ptr<StartCompletion> observation,
         base::OnceCallback<void(blink::ServiceWorkerStatusCode)> original,
         blink::ServiceWorkerStatusCode status) {
        const bool current = observation->Enter(
            status == blink::ServiceWorkerStatusCode::kOk);
        if (!current && status == blink::ServiceWorkerStatusCode::kOk)
          status = blink::ServiceWorkerStatusCode::kErrorAbort;
        std::move(original).Run(status);
        observation->Finish();
      }, std::move(completion), std::move(callback));
}
}  // namespace content::aux_migration

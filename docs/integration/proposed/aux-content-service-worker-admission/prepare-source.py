#!/usr/bin/env python3
"""Create exact source successors; no native checkout writes or activation."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    specs = {}

    def add(path, label, find, replace):
        specs.setdefault(path, []).append((label, find, replace))

    wrapper = 'content/browser/service_worker/service_worker_context_wrapper.cc'
    version = 'content/browser/service_worker/service_worker_version.cc'
    embedded = 'content/browser/service_worker/embedded_worker_instance.cc'
    for path in [wrapper, version, embedded]:
        header = path[:-3] + '.h'
        anchor = '#include "' + header + '"'
        add(path, 'native participant include', anchor, anchor +
            '\n#include "content/browser/service_worker/aux_service_worker_migration.h"')
    anchor = '  core_observer_list_->AddObserver(this);\n}'
    add(wrapper, 'register only constructed existing wrapper', anchor,
        '  aux_migration::RegisterAlreadyOwnedServiceWorkerContext(this);\n' + anchor)
    anchor = 'ServiceWorkerContextWrapper::~ServiceWorkerContextWrapper() {\n  DCHECK_CURRENTLY_ON(BrowserThread::UI);'
    add(wrapper, 'remove exact native wrapper owner', anchor, anchor +
        '\n  aux_migration::UnregisterAlreadyOwnedServiceWorkerContext(this);')
    anchor = 'void ServiceWorkerContextWrapper::Shutdown() {\n  DCHECK_CURRENTLY_ON(BrowserThread::UI);'
    add(wrapper, 'shutdown invalidates pending core evidence', anchor, anchor +
        '\n  aux_migration::ObserveServiceWorkerContextShutdown(this);')
    anchor = 'void ServiceWorkerContextWrapper::StopAllServiceWorkers(\n    base::OnceClosure callback) {'
    add(wrapper, 'non-creating exact core observation', anchor,
        '''bool ServiceWorkerContextWrapper::HasOwnedCoreForMigrationObservation() const {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  return context_core_ != nullptr;
}

void ServiceWorkerContextWrapper::StopAlreadyOwnedWorkersForMigration(
    base::OnceClosure callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (!context_core_) {
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, std::move(callback));
    return;
  }
  // Retain all actual existing versions before StopWorker can reenter teardown.
  // No registration, context, StoragePartition or worker is created here.
  std::vector<scoped_refptr<ServiceWorkerVersion>> versions;
  for (const auto& [id, version] : context_core_->GetLiveVersions())
    versions.emplace_back(version.get());
  base::RepeatingClosure barrier =
      base::BarrierClosure(versions.size(), std::move(callback));
  for (const auto& version : versions)
    version->StopWorker(barrier);
}

''' + anchor)
    path = 'content/browser/service_worker/service_worker_context_wrapper.h'
    anchor = '  void StopAllServiceWorkers(base::OnceClosure callback) override;'
    add(path, 'declare non-creating observation and retained-version stop', anchor, anchor +
        '\n  bool HasOwnedCoreForMigrationObservation() const;'
        '\n  void StopAlreadyOwnedWorkersForMigration(base::OnceClosure callback);')

    anchor = '''  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  const bool is_browser_startup_complete =
      GetContentClient()->browser()->IsBrowserStartupComplete();'''
    add(version, 'central start and actual completion tracking', anchor, '''  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  callback = aux_migration::TrackServiceWorkerStartCallback(std::move(callback));
  if (!aux_migration::ServiceWorkerStartsAllowedForMigration()) {
    RunSoon(base::BindOnce(std::move(callback),
                          blink::ServiceWorkerStatusCode::kErrorAbort));
    return;
  }
  const bool is_browser_startup_complete =
      GetContentClient()->browser()->IsBrowserStartupComplete();''')
    anchor = '''void ServiceWorkerVersion::RunAfterStartWorker(
    ServiceWorkerMetrics::EventType purpose,
    StatusCallback callback) {'''
    add(version, 'actual running-worker reuse admission', anchor, anchor + '''
  callback = aux_migration::TrackServiceWorkerStartCallback(std::move(callback));
  if (!aux_migration::ServiceWorkerStartsAllowedForMigration()) {
    RunSoon(base::BindOnce(std::move(callback),
                          blink::ServiceWorkerStatusCode::kErrorAbort));
    return;
  }''')
    anchor = '''    scoped_refptr<ServiceWorkerRegistration> registration) {
  scoped_refptr<ServiceWorkerRegistration> protect = registration;
  if (status == blink::ServiceWorkerStatusCode::kErrorNotFound) {'''
    add(version, 'queued registration result rechecks close', anchor, '''    scoped_refptr<ServiceWorkerRegistration> registration) {
  if (!aux_migration::ServiceWorkerStartsAllowedForMigration()) {
    RunSoon(base::BindOnce(std::move(callback),
                          blink::ServiceWorkerStatusCode::kErrorAbort));
    return;
  }
  scoped_refptr<ServiceWorkerRegistration> protect = registration;
  if (status == blink::ServiceWorkerStatusCode::kErrorNotFound) {''')
    anchor = '''void ServiceWorkerVersion::StartWorkerInternal() {
  DCHECK_EQ(blink::EmbeddedWorkerStatus::kStopped, running_status());
  DCHECK(inflight_requests_.IsEmpty());
  DCHECK(request_timeouts_.empty());'''
    add(version, 'queued network restriction and restart recheck', anchor, anchor + '''
  if (!aux_migration::ServiceWorkerStartsAllowedForMigration()) {
    FinishStartWorker(blink::ServiceWorkerStatusCode::kErrorAbort);
    return;  // The failure callback may delete this version.
  }''')
    anchor = '          embedded_worker_->ResumeInitializingGlobalScope();'
    add(version, 'paired warmed global-scope resume admission', anchor, '''          if (!aux_migration::ServiceWorkerStartsAllowedForMigration()) {
            RunSoon(base::BindOnce(std::move(callback),
                                  blink::ServiceWorkerStatusCode::kErrorAbort));
            return;
          }
''' + anchor)
    anchor = '  bool should_restart = !start_callbacks_.empty();'
    add(version, 'stopping callbacks cannot reopen restart admission', anchor,
        '  bool should_restart = !start_callbacks_.empty() &&\n'
        '      aux_migration::ServiceWorkerStartsAllowedForMigration();')
    anchor = '''void ServiceWorkerVersion::OnStoppedInternal(
    blink::EmbeddedWorkerStatus old_status) {
  TRACE_EVENT0("ServiceWorker", "ServiceWorkerVersion::OnStoppedInternal");'''
    add(version, 'retain actual cleanup body after stop callback', anchor, anchor +
        '\n  aux_migration::ScopedServiceWorkerStopCleanup aux_cleanup;')
    anchor = '''void ServiceWorkerVersion::OnStopped(blink::EmbeddedWorkerStatus old_status) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);'''
    add(version, 'observe actual stopped notification only', anchor, anchor +
        '\n  aux_migration::ObserveServiceWorkerStopped();')
    anchor = '''void ServiceWorkerVersion::OnDetached(blink::EmbeddedWorkerStatus old_status) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);'''
    add(version, 'detachment is unresolved worker custody', anchor, anchor +
        '\n  aux_migration::ObserveServiceWorkerDetached();')
    anchor = '''    embedded_worker_->RemoveObserver(this);
    embedded_worker_->Detach();
    embedded_worker_ = std::make_unique<EmbeddedWorkerInstance>(this);'''
    add(version, 'timeout detach must not disappear behind stop callbacks', anchor,
        '    aux_migration::ObserveServiceWorkerDetached();\n' + anchor)

    anchor = '''  for (auto& observer : listener_list_)
    observer.OnStarting();

  // service_worker_route_id will be set later in SetupOnUIThread'''
    add(embedded, 'real embedded start uses original setup-failure cleanup', anchor, '''  for (auto& observer : listener_list_)
    observer.OnStarting();
  if (!aux_migration::ServiceWorkerStartsAllowedForMigration()) {
    OnSetupFailed(std::move(callback),
                  blink::ServiceWorkerStatusCode::kErrorAbort);
    return;  // Setup failure may delete this instance.
  }

  // service_worker_route_id will be set later in SetupOnUIThread''')
    anchor = '''  SendStartWorker(std::move(params));
  std::move(callback).Run(blink::ServiceWorkerStatusCode::kOk);'''
    add(embedded, 'paired dispatch refusal keeps original callback and cleanup', anchor, '''  if (!SendStartWorker(std::move(params))) {
    OnSetupFailed(std::move(callback),
                  blink::ServiceWorkerStatusCode::kErrorAbort);
    return;  // Setup failure may delete this instance.
  }
  std::move(callback).Run(blink::ServiceWorkerStatusCode::kOk);''')
    anchor = '''void EmbeddedWorkerInstance::SendStartWorker(
    blink::mojom::EmbeddedWorkerStartParamsPtr params) {'''
    add(embedded, 'paired dispatch bool reports no-message admission refusal', anchor,
        anchor.replace('void EmbeddedWorkerInstance', 'bool EmbeddedWorkerInstance'))
    anchor = '''  client_->StartWorker(std::move(params));

  starting_phase_ = is_script_streaming ? SCRIPT_STREAMING : SENT_START_WORKER;'''
    add(embedded, 'actual renderer message rechecks after setup callbacks', anchor, '''  if (!aux_migration::ServiceWorkerStartsAllowedForMigration())
    return false;
  client_->StartWorker(std::move(params));

  starting_phase_ = is_script_streaming ? SCRIPT_STREAMING : SENT_START_WORKER;''')
    anchor = '''  for (auto& observer : listener_list_)
    observer.OnStartWorkerMessageSent();
}'''
    add(embedded, 'paired dispatch success follows actual message', anchor,
        '  for (auto& observer : listener_list_)\n'
        '    observer.OnStartWorkerMessageSent();\n  return true;\n}')
    path = 'content/browser/service_worker/embedded_worker_instance.h'
    anchor = '  void SendStartWorker(blink::mojom::EmbeddedWorkerStartParamsPtr params);'
    add(path, 'paired private dispatcher declaration', anchor,
        '  bool SendStartWorker(blink::mojom::EmbeddedWorkerStartParamsPtr params);')

    records = []
    patch = ''
    pins_path = HERE / 'original-input-pins.json'
    pins = json.loads(pins_path.read_text())
    for path, edits in specs.items():
        original = (NATIVE / path).read_bytes()
        assert sha(original) == pins[path], path
        text = original.decode()
        reviewed = []
        for label, find, replace in edits:
            assert text.count(find) == 1, (path, label, text.count(find))
            text = text.replace(find, replace)
            reviewed.append({'name': label, 'find': find, 'replace': replace, 'count': 1})
        output = text.encode()
        target = HERE / 'source' / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(output)
        records.append({'path': path, 'inputSha256': sha(original),
                        'outputSha256': sha(output), 'edits': reviewed})
        patch += 'diff --git a/' + path + ' b/' + path + '\n'
        patch += ''.join(difflib.unified_diff(original.decode().splitlines(True),
                                            text.splitlines(True),
                                            fromfile='a/' + path, tofile='b/' + path))
    new_paths = [
        'content/public/browser/aux_service_worker_migration.h',
        'content/browser/service_worker/aux_service_worker_admission_state.h',
        'content/browser/service_worker/aux_service_worker_admission_state.cc',
        'content/browser/service_worker/aux_service_worker_migration.h',
        'content/browser/service_worker/aux_service_worker_migration.cc',
    ]
    for path in new_paths:
        output = (HERE / 'source' / path).read_bytes()
        records.append({'path': path, 'inputSha256': None, 'outputSha256': sha(output)})
        patch += 'diff --git a/' + path + ' b/' + path + '\nnew file mode 100644\n'
        patch += ''.join(difflib.unified_diff([], output.decode().splitlines(True),
                                            fromfile='/dev/null', tofile='b/' + path))
    (HERE / 'followup.patch').write_text(patch)
    (HERE / 'inputs.json').write_text(json.dumps({
        'format': 'aux.content-service-worker-admission.v1',
        'nativeSourceRoot': str(NATIVE), 'files': records,
        'patchSha256': sha(patch.encode()), 'applied': False, 'compiled': False,
        'storagePartitionsCreated': False, 'uiViewsChanged': False,
        'coldRefusalChanged': False,
    }, indent=2) + '\n')


if __name__ == '__main__':
    main()

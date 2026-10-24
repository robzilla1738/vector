"""Pin actual admission producer/consumers; no startup, build or ready event."""
import hashlib
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
ROOT_OBSERVATION = Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/browser-feature-expansion/completion-batch-a1/cold-entry-observation-a1.json')
sha = lambda b: hashlib.sha256(b).hexdigest()
inputs = []

def pin(path, facts):
    data = (ROOT / path).read_bytes()
    text = data.decode()
    anchors = []
    for find, count in facts:
        assert text.count(find) == count, (path, find, text.count(find))
        anchors.append({'find': find, 'count': count})
    inputs.append({'path': path, 'sha256': sha(data), 'anchors': anchors})

pin('chrome/browser/aux/AuxSelectedStateHome.cc', [
    ('bool AuthorizeNativeBrowserStartupBeforeLocalState() {', 1),
    ('  state.admitted_browser_roots = std::move(roots);\n  state.browser_generation = admitted_generation;\n  return true;', 1),
    ('    if (owner->AcceptAuthorityReply(reply, 2\'000) != DaemonAuthorityStatus::ready) return false;\n    if (!owner->BindBrowserDescendantScope(generation)) return false;', 1),
    ('  auto& state = CurrentState();\n  if (getpid() != state.process) return {.wrong_process = true};', 1),
])
pin('chrome/browser/aux/AuxSelectedStateHome.h', [
    ('bool AuthorizeNativeBrowserStartupBeforeLocalState();', 1),
    ('BrowserShutdownObservation InspectNativeBrowserShutdown();', 1),
])
pin('chrome/browser/metrics/chrome_feature_list_creator.cc', [
    ('void ChromeFeatureListCreator::CreatePrefService() {\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)', 1),
    ('  CHECK(aux::peer::AuthorizeNativeBrowserStartupBeforeLocalState());\n#endif\n  base::FilePath local_state_file;', 1),
])
pin('chrome/browser/ui/profiles/profile_customization_util.cc', [
    ('        if (weak_profile) aux::RequestProfileBootstrap(weak_profile.get());', 1),
    ('  if (!entry->IsOmitted()) {', 1),
])
pin('chrome/browser/aux/AuxNativePeerTransport.h', [
    ('using BrowserDrainAckObserver = void (*)(const BrowserDrainReport&);', 1),
    ('// Observational only: constructed from completed genuine ready-home exchanges.', 1),
])
pin('chrome/browser/aux/feature_store/feature_write_participant.h', [
    ('// These are observations of registered feature I/O only, never authority,', 1),
    ('void CloseNativeFeatureWritesForMigration(', 1),
])
root_bytes = ROOT_OBSERVATION.read_bytes()
root_evidence = json.loads(root_bytes)
assert root_evidence['coldEntryDefineInCommand'] is False
assert root_evidence['startupGateReferences'] == []
assert root_evidence['runtimeAdmissionAccepted'] is False
(HERE / 'root-cold-entry-observation-a1.json').write_bytes(root_bytes)
result = {'format': 'aux.profile-bootstrap.admission-inspection.actual.v1',
          'nativeRoot': str(ROOT), 'inputs': inputs,
          'rootObservationPath': str(ROOT_OBSERVATION), 'rootObservationSha256': sha(root_bytes),
          'admissionReadyEventFoundInPinnedProducerPublicApi': False,
          'existingSynchronousAdmissionProducer': 'AuthorizeNativeBrowserStartupBeforeLocalState',
          'currentCompileConsumesColdHook': False,
          'freshProfileRetryEventImplemented': False, 'admissionGuardWeakened': False,
          'nativeCheckoutChanged': False, 'nativeStartupExecuted': False,
          'runtimeAdmissionAccepted': False,
          'inference': 'No existing native late-ready event can honestly wake fresh-profile identity. The only pinned writer-admission producer synchronously precedes Local State in the dormant COLD hook. Root must integrate/activate that genuine pre-profile path; feature settlement, drain ACK, daemon authorization and ready-home pulses do not substitute for it.'}
(HERE / 'actual-admission-inspection-a3.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'inputs': len(inputs), 'anchors': sum(len(x['anchors']) for x in inputs),
                  'admissionReadyEventFound': False, 'runtimeAdmissionAccepted': False}))

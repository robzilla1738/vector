import hashlib
import json
import plistlib
import subprocess
from pathlib import Path

ROOT = Path('/Users/rcourson/Documents/Vibe/web')
APP = ROOT / 'out/provided-candidate-local-completion-20261025-a38/Aux.app'
DAEMON = APP / 'Contents/Resources/aux/apps/daemon/Aux Daemon.app'
HEADER = Path('/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/EndpointSecurity/ESClient.h')


def pin(path, needles):
    data = path.read_bytes()
    lines = data.decode().splitlines()
    matches = {needle: [index + 1 for index, line in enumerate(lines) if needle in line] for needle in needles}
    if any(not positions for positions in matches.values()):
        raise ValueError(f'Source boundary changed: {path}')
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'lines': matches}


entitlements = subprocess.run(['codesign', '-d', '--entitlements', ':-', str(DAEMON)], check=True, capture_output=True).stdout
names = sorted(plistlib.loads(entitlements))
helper = APP / 'Contents/Resources/aux/apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use'
imports = subprocess.run(['nm', '-u', str(helper)], check=True, capture_output=True, text=True).stdout.splitlines()
result = {
    'format': 'aux.advertised-tools.scope-review.v1',
    'publicOS': {key: subprocess.check_output(['sw_vers', flag], text=True).strip() for key, flag in [('version', '-productVersion'), ('build', '-buildVersion')]},
    'sdk': pin(HEADER, ['Create a new ES client scoped to descendant processes only.', 'Requires the com.apple.developer.endpoint-security.client entitlement.', 'Does NOT require root privilege.', 'Does NOT require TCC approval.', 'es_new_descendants_client(es_client_t']),
    'acceptedDaemon': {'path': str(DAEMON), 'executableSha256': hashlib.sha256((DAEMON / 'Contents/MacOS/aux-daemon').read_bytes()).hexdigest(), 'entitlementNamesOnly': names, 'hasDescendantEntitlement': 'com.apple.developer.endpoint-security.client' in names},
    'nativeHost': pin(ROOT / 'docs/integration/proposed/browser-feature-expansion/productivity-memory-native-a41/source/AuxDevelopmentWorkerHost.cc', ['if (kBrowserOnlyNativeStartup) return nullptr; // Before helper/owner/reservation.', 'if (kBrowserOnlyNativeStartup) return nullptr; // Before any child/ticket admission.', 'ReserveDescendantCohort']),
    'freshEntry': pin(ROOT / 'docs/integration/proposed/standard-profile-isolation/ordinary-fresh-browser-startup-a1/source/AuxNativeDaemonMain.cc', ['int main(int argc, char** argv)', 'InitializeAtFreshDaemonEntry()', 'AUX_BROWSER_ONLY_NATIVE_STARTUP']),
    'descendantOwner': pin(ROOT / 'docs/integration/proposed/standard-profile-isolation/cli-task-native-lineage-a37/source/AuxTaskDescendantObserver.cc', ['int InitializeAtFreshDaemonEntry()', 'es_new_descendants_client(', 'es_subscribe(', 'Fence(true)']),
    'fixedProcessOwner': pin(Path('/private/tmp/aux-browser-only-daemon-build-20261025-a72/source/AuxAccountMemoryHelper.mm'), ['(deny process-fork)', 'POSIX_SPAWN_CLOEXEC_DEFAULT|POSIX_SPAWN_START_SUSPENDED', 'owner_->PrepareLaunch()', 'owner_->SpawnStoppedAfterPrepared(', 'owner_->PublishSuspended(pid_)', 'owner_->ResumeStoppedAfterPublished(pid_)']),
    'computerUseHelper': {'path': str(helper), 'sha256': hashlib.sha256(helper.read_bytes()).hexdigest(), 'relevantImports': [line.strip() for line in imports if line.strip() in ['_posix_spawn', '_OBJC_CLASS_$_NSTask', '_fork', '_vfork', '_execve', '_system', '_popen']], 'cannotInferNoDescendantsFromImports': True},
    'sideEffects': {'helperExecuted': False, 'observerCreated': False, 'signingChanged': False, 'ownerStateRead': False},
}
print(json.dumps(result, indent=2))

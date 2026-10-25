"""Prepare an exact local-development review; never sign or execute code."""
import importlib.util
import json
from pathlib import Path
import plistlib
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
spec = importlib.util.spec_from_file_location('package_helpers', HERE.parents[1] / 'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
PACKAGE = ROOT / 'out/provided-candidate-fresh-browser-20261024-a42'
APP = PACKAGE / 'Aux.app'
DAEMON = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app'
PROFILE = ROOT / ('out/provided-candidate-local-browser-pass/Aux.app/' + DAEMON + '/Contents/embedded.provisionprofile')
MAGIC = {b'\xcf\xfa\xed\xfe', b'\xce\xfa\xed\xfe', b'\xfe\xed\xfa\xcf', b'\xfe\xed\xfa\xce', b'\xca\xfe\xba\xbe', b'\xbe\xba\xfe\xca'}


def main():
    receipt = p.read(PACKAGE / 'receipt.json')
    p.require(receipt['passed'] and not receipt['testable'] and not receipt['appExecuted'], 'Inactive exact candidate required')
    p.require(p.inventory(APP) == receipt['files'], 'Candidate changed')
    profile = plistlib.loads(subprocess.run(['/usr/bin/security', 'cms', '-D', '-i', str(PROFILE)], capture_output=True, check=True).stdout)
    profile_sha = 'faa4760e2746dcea329ad272390a33d9960c3419bb8b991654a35ac5b7ee1a6d'
    p.require(p.sha(PROFILE) == profile_sha, 'Reviewed existing wildcard profile changed')
    e = profile['Entitlements']
    p.require(e.get('com.apple.application-identifier', e.get('application-identifier')) == '9F2JXY8TCK.*' and
              e.get('keychain-access-groups') == ['9F2JXY8TCK.*'] and
              not e.get('com.apple.developer.endpoint-security.client'), 'Existing non-ES wildcard profile required')
    entitlements = {
        'browser-jit.plist': {'com.apple.security.cs.allow-jit': True},
        'daemon-local.plist': {
            'com.apple.application-identifier': '9F2JXY8TCK.dev.aux.browser.daemon',
            'com.apple.developer.team-identifier': '9F2JXY8TCK',
            'keychain-access-groups': ['9F2JXY8TCK.dev.aux.local'],
            'com.apple.security.cs.allow-jit': True,
        },
    }
    for name, values in entitlements.items():
        with (HERE / name).open('xb') as stream:
            plistlib.dump(values, stream, sort_keys=True)
    native = p.read(Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-ordinary-fresh-browser-build-20261024-a42b/app-inventory.json'))
    targets = []
    for row in native:
        if row['type'] != 'file':
            continue
        path = APP / row['path']
        with path.open('rb') as stream:
            magic = stream.read(4)
        if magic not in MAGIC:
            continue
        relative = row['path']
        entitlement = None
        if '/Contents/MacOS/' in relative or relative.startswith('Contents/MacOS/'):
            owner = relative.rsplit('/Contents/MacOS/', 1)[0] if '/Contents/MacOS/' in relative else '.'
            info = plistlib.loads((APP / owner / 'Contents/Info.plist').read_bytes())
            identifier = info['CFBundleIdentifier']
            entitlement = p.ref(HERE / 'browser-jit.plist')
        elif relative.endswith('/Aux Framework'):
            owner = 'Contents/Frameworks/Aux Framework.framework'
            info = plistlib.loads((path.parent / 'Resources/Info.plist').read_bytes())
            identifier = info['CFBundleIdentifier']
        else:
            owner = relative
            identifier = 'dev.aux.browser.' + path.name.replace('_', '-').removesuffix('.dylib')
        targets.append(dict(codeObject=owner, executable=relative, sha256=p.sha(path),
                            identifier=identifier, entitlements=entitlement))
    p.require(len(targets) == 16 and len({x['codeObject'] for x in targets}) == 16, 'Exact16 native objects required')
    targets.sort(key=lambda row: (row['codeObject'] == '.', row['codeObject'].count('/'), row['codeObject']), reverse=True)
    outer = next(row for row in targets if row['codeObject'] == '.')
    targets.remove(outer)
    executable = DAEMON + '/Contents/MacOS/aux-daemon'
    targets.append(dict(codeObject=DAEMON, executable=executable, sha256=p.sha(APP / executable),
                        identifier='dev.aux.browser.daemon', entitlements=p.ref(HERE / 'daemon-local.plist')))
    targets.append(outer)
    result = dict(format='aux.ordinary-fresh.local-signing.review.v1', approvalReady=True,
        app=str(APP), packageReceipt=p.ref(PACKAGE / 'receipt.json'),
        candidateInventorySha256=receipt['inventorySha256'],
        applyScript=p.ref(HERE / 'sign-reviewed.py'),
        identity='Apple Development: Robert Courson (68DV3N28DS)',
        identitySha1='47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90',
        team='9F2JXY8TCK', certificateSha256='ff0293a06f20704a1f3b3f2571b3362ef439a2dfb3b0bc90bcf3d5debfc73a1c',
        existingPublicProfile=dict(**p.ref(PROFILE), target=DAEMON + '/Contents/embedded.provisionprofile',
            expires=profile['ExpirationDate'].isoformat() + 'Z', newProvisioning=False),
        targetCount=len(targets), targetsInSigningOrder=targets,
        signingOptions=['runtime'], timestamp='none', scope=receipt['scope'],
        keychainAccessGroup='9F2JXY8TCK.dev.aux.local',
        proposedRuntimeOperation='Initialize new installation/authentication entries for this fixed disposable scope; test, close and reopen the same candidate only.',
        privilegedTasksEnabled=False, legacyProfilesAccepted=False,
        acceptedAppExcluded=True, ownerStateExcluded=True,
        signingPerformed=False, appExecuted=False, provisioning=False,
        newOSPermissions=False, notarization=False, distribution=False, release=False,
        inactiveHelpersExcluded=['CLI', 'Computer Use', 'memory', 'PDF', 'macOS utilities', 'PTY', 'native addons'])
    p.write_new(HERE / 'signing-review.json', result)
    print(json.dumps(dict(approvalReady=True, targetCount=len(targets), app=str(APP),
                         reviewSha256=p.sha(HERE / 'signing-review.json'), signingPerformed=False)))


if __name__ == '__main__':
    main()

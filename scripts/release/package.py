#!/usr/bin/env python3
"""Notarize, staple and package a Developer ID release assembled by assemble.py. Stops before upload.

    package.py --release out/release/1.0.0-12 [--notary-profile muse-desktop] [--skip-notarize]

Produces, next to Aux.app: Aux-<version>.dmg (signed, notarized, stapled), Aux-<version>.zip (the
Sparkle update archive of the stapled app), updates/appcast.xml signed with Aux's own EdDSA key
(Keychain account dev.aux.browser.sparkle), download.json for the getaux.co /download page, and
package-receipt.json. Uploading to the aux-downloads Blob store, deploying aux-web and publishing
the appcast are separate steps, each needing the owner's yes.
"""
import argparse
import hashlib
import json
import plistlib
import shutil
import subprocess
import sys
from pathlib import Path

SPARKLE_ACCOUNT = 'dev.aux.browser.sparkle'
DOWNLOADS = 'https://getaux.co/download'
CHECKOUT = Path('/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src')


def run(command, **kwargs):
    result = subprocess.run(command, capture_output=True, text=True, **kwargs)
    if result.returncode:
        raise SystemExit(f'{Path(command[0]).name} failed ({result.returncode}): {(result.stderr or result.stdout).strip()[:2000]}')
    return result


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1 << 20), b''):
            digest.update(block)
    return digest.hexdigest()


def notarize(path: Path, profile: str) -> dict:
    submit = path
    if path.suffix == '.app':
        submit = path.with_suffix('.notarize.zip')
        run(['ditto', '-c', '-k', '--sequesterRsrc', '--keepParent', str(path), str(submit)])
    result = json.loads(run(['xcrun', 'notarytool', 'submit', str(submit), '--keychain-profile', profile,
                             '--wait', '--output-format', 'json'], timeout=3600).stdout)
    if submit != path:
        submit.unlink()
    if result.get('status') != 'Accepted':
        raise SystemExit(f"notarization {result.get('id')} ended {result.get('status')}; see notarytool log")
    run(['xcrun', 'stapler', 'staple', str(path)])
    run(['xcrun', 'stapler', 'validate', str(path)])
    return {'id': result.get('id'), 'status': result['status']}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--release', type=Path, required=True)
    parser.add_argument('--notary-profile', default='muse-desktop')
    parser.add_argument('--skip-notarize', action='store_true', help='local dry run: package without Apple')
    parser.add_argument('--sparkle-bin', type=Path, default=CHECKOUT / 'third_party/aux_sparkle/bin')
    args = parser.parse_args()

    release = args.release.resolve()
    assembly = json.loads((release / 'receipt.json').read_text())
    if assembly['identity'] != 'developer-id' and not args.skip_notarize:
        raise SystemExit('only a developer-id assembly can be notarized; pass --skip-notarize for a dry run')
    app = release / 'Aux.app'
    info = plistlib.loads((app / 'Contents/Info.plist').read_bytes())
    version, build = info['CFBundleShortVersionString'], info['CFBundleVersion']
    receipt = {'format': 'aux.release-package.v1', 'version': version, 'build': build, 'notarization': {}}

    run(['codesign', '--verify', '--deep', '--strict', str(app)])
    if not args.skip_notarize:
        receipt['notarization']['app'] = notarize(app, args.notary_profile)
        run(['spctl', '--assess', '--type', 'execute', str(app)])

    # Sparkle update archive of the stapled app.
    archive = release / f'Aux-{version}.zip'
    run(['ditto', '-c', '-k', '--sequesterRsrc', '--keepParent', str(app), str(archive)])

    # Disk image with an Applications link.
    staging = release / 'dmg'
    shutil.rmtree(staging, ignore_errors=True)
    staging.mkdir()
    run(['ditto', str(app), str(staging / 'Aux.app')])
    (staging / 'Applications').symlink_to('/Applications')
    dmg = release / f'Aux-{version}.dmg'
    run(['hdiutil', 'create', '-volname', 'Aux', '-srcfolder', str(staging), '-fs', 'APFS',
         '-format', 'ULFO', '-ov', str(dmg)])
    shutil.rmtree(staging)
    if not args.skip_notarize:
        run(['codesign', '--force', '--sign', assembly['identitySha1'], '--timestamp', str(dmg)])
        receipt['notarization']['dmg'] = notarize(dmg, args.notary_profile)
        run(['spctl', '--assess', '--type', 'open', '--context', 'context:primary-signature', str(dmg)])

    # Signed appcast generated from the immutable archive.
    updates = release / 'updates'
    updates.mkdir(exist_ok=True)
    shutil.copy2(archive, updates / archive.name)
    run([str(args.sparkle_bin / 'generate_appcast'), '--account', SPARKLE_ACCOUNT,
         '--download-url-prefix', f'{DOWNLOADS}/', '-o', str(updates / 'appcast.xml'), str(updates)])
    run([str(args.sparkle_bin / 'sign_update'), '--account', SPARKLE_ACCOUNT, '--verify', str(archive),
         _edsignature(updates / 'appcast.xml', archive.name)])

    download = {'version': version, 'build': build, 'minimumSystemVersion': info.get('LSMinimumSystemVersion'),
                'architecture': 'arm64', 'dmg': {'name': dmg.name, 'bytes': dmg.stat().st_size, 'sha256': sha256(dmg)},
                'update': {'name': archive.name, 'bytes': archive.stat().st_size, 'sha256': sha256(archive)}}
    (release / 'download.json').write_text(json.dumps(download, indent=1) + '\n')
    receipt.update(download=download, notarized=not args.skip_notarize, published=False,
                   next=['Upload the DMG and update archive to the aux-downloads Blob store (owner yes)',
                         'Deploy aux-web with download.json and updates/appcast.xml (owner yes)',
                         'Publish the appcast entry (owner yes)'])
    (release / 'package-receipt.json').write_text(json.dumps(receipt, indent=1) + '\n')
    print(json.dumps({'dmg': str(dmg), 'notarized': receipt['notarized'], 'published': False}))
    return 0


def _edsignature(appcast: Path, name: str) -> str:
    import xml.etree.ElementTree as ET
    sparkle = '{http://www.andymatuschak.org/xml-namespaces/sparkle}'
    for enclosure in ET.parse(appcast).iter('enclosure'):
        if enclosure.get('url', '').endswith('/' + name):
            return enclosure.get(f'{sparkle}edSignature')
    raise SystemExit(f'{name} has no signed enclosure in the appcast')


if __name__ == '__main__':
    sys.exit(main())

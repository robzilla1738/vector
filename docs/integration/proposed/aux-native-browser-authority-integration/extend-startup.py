#!/usr/bin/env python3
"""Compose the pinned inactive startup caller in disposable source copies only."""
from pathlib import Path
import argparse
import difflib
import hashlib
import json
import os
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
PROPOSAL = REPO / 'docs/integration/proposed/aux-native-parent-cold-launch'
NATIVE = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
sha = lambda data: hashlib.sha256(data).hexdigest() if data is not None else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output == NATIVE or NATIVE in output.parents:
        raise SystemExit('Fresh non-native output required')
    pins = json.loads((HERE / 'startup-inputs.json').read_text())
    for path, expected in pins['workspaceInputs'].items():
        if sha((REPO / path).read_bytes()) != expected:
            raise SystemExit('Startup composition input drift: ' + path)
    initial = json.loads((HERE / 'metadata.json').read_text())
    environment = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    with tempfile.TemporaryDirectory(prefix='aux-startup-source-') as directory:
        root = Path(directory)
        environment['GIT_CEILING_DIRECTORIES'] = str(root)
        for row in initial['files']:
            path = NATIVE / row['path']
            raw = path.read_bytes() if path.exists() else None
            if sha(raw) != row['baselineSha256']:
                raise SystemExit('Native source drift: ' + row['path'])
            if raw is not None:
                target = root / row['path']
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(raw)

        def apply(patch):
            subprocess.run(['git', 'apply', '--check', '-'], input=patch, cwd=root, env=environment, check=True, capture_output=True)
            subprocess.run(['git', 'apply', '-'], input=patch, cwd=root, env=environment, check=True, capture_output=True)

        apply((HERE / 'native.patch').read_bytes())
        for row in initial['files']:
            if sha((root / row['path']).read_bytes()) != row['outputSha256']:
                raise SystemExit('Initial composed output drift')
        paths = ['chrome/browser/aux/BUILD.gn',
                 'chrome/browser/aux/native_peer_policy/AuxAuthenticatedChildParentPolicyReader.swift',
                 'chrome/browser/aux/AuxNativeParentColdLaunch.cc',
                 'chrome/browser/aux/AuxNativeParentColdLaunch.h',
                 'chrome/browser/chrome_browser_main.cc']
        main_path = root / paths[-1]
        raw_main = (NATIVE / paths[-1]).read_bytes()
        if sha(raw_main) != pins['nativeMainSha256']:
            raise SystemExit('Actual startup baseline drift')
        main_path.write_bytes(raw_main)
        before = {path: (root / path).read_bytes() if (root / path).exists() else None for path in paths}
        apply((PROPOSAL / 'chrome-main-hook.patch').read_bytes())
        for name in ['AuxNativeParentColdLaunch.cc', 'AuxNativeParentColdLaunch.h']:
            (root / 'chrome/browser/aux' / name).write_bytes((PROPOSAL / 'source' / name).read_bytes())
        reader = root / paths[1]
        if reader.read_bytes() != (PROPOSAL / 'baseline/AuxAuthenticatedChildParentPolicyReader.swift').read_bytes():
            raise SystemExit('Read-only parent reader lineage drift')
        reader.write_bytes((PROPOSAL / 'source/AuxAuthenticatedChildParentPolicyReader.swift').read_bytes())
        gn = root / paths[0]
        text = gn.read_text()
        anchor = '      "AuxNativePeerTransport.cc",\n'
        if text.count(anchor) != 1:
            raise SystemExit('Actual composed GN anchor drift')
        gn.write_text(text.replace(anchor, '      "AuxNativeParentColdLaunch.cc",\n      "AuxNativeParentColdLaunch.h",\n' + anchor))
        lines, records = [], []
        for path in sorted(paths):
            raw, data = before[path], (root / path).read_bytes()
            lines.append(f'diff --git a/{path} b/{path}\n')
            if raw is None:
                lines.append('new file mode 100644\n')
            lines += list(difflib.unified_diff(raw.decode().splitlines(True) if raw is not None else [], data.decode().splitlines(True), fromfile='a/' + path if raw is not None else '/dev/null', tofile='b/' + path))
            records.append({'path': path, 'baselineSha256': sha(raw), 'outputSha256': sha(data)})
        patch = ''.join(lines).encode()
        output.mkdir(parents=True)
        (output / 'native.patch').write_bytes(patch)
        (output / 'metadata.json').write_text(json.dumps({'files': records, 'patchSha256': sha(patch),
            'inputsSha256': sha((HERE / 'startup-inputs.json').read_bytes()), 'applied': False,
            'compiled': False, 'productHookDefaultOff': True}, indent=2) + '\n')
        print('Prepared five startup/parent-policy/GN records; no native mutation, GN generation or execution')


if __name__ == '__main__':
    main()

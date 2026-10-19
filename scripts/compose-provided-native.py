#!/usr/bin/env python3
"""Compose reviewed proposals in a fresh disposable copy, never the native checkout."""
import argparse
import difflib
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

repository = Path(__file__).resolve().parents[1]
proposals = repository / 'docs/integration/proposed'
sha = lambda raw: hashlib.sha256(raw).hexdigest()
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('native_root', type=Path)
parser.add_argument('--output', type=Path, default=repository / 'out/native-reuse-composition')
options = parser.parse_args()
native = options.native_root.resolve()
output = options.output.resolve()
if output.exists() or output == native or native in output.parents or output in native.parents:
    raise ValueError('Composition needs a fresh output outside the native checkout')

steps = [
    ('native-provided-entrypoints.patch', 'native-provided-entrypoints.json'),
    ('native-provided-profile-security.patch', 'native-provided-profile-security.json'),
    ('native-provided-supervisor.patch', 'native-provided-supervisor.json'),
    ('native-provided-capture-launch.patch', 'native-provided-capture-launch.json'),
    ('provided-native-auth/provided-native-auth.patch', 'provided-native-auth/source-sha256.json'),
    ('node-native-boundary/daemon-environment.patch', 'node-native-boundary/source-sha256.json'),
    ('node-native-boundary/remove-obsolete-importer-env.patch', None),
] + [(f'native-provided-{name}.patch', f'native-provided-{name}.json') for name in
     ['preference-results', 'dock-results', 'import-results', 'import-consent', 'omnibox-results']]

def safe(path):
    value = Path(path)
    if value.is_absolute() or '..' in value.parts or not value.parts:
        raise ValueError('Unsafe proposal path')
    return value

def metadata_pins(path):
    data = json.loads(path.read_text())
    if isinstance(data, dict) and 'files' in data:
        data = data['files']
    if isinstance(data, dict) and 'path' in data:
        data = [data]
    if isinstance(data, dict):
        return data
    return {item['path']: item.get('originalNativeSha256', item.get('sourceSha256')) for item in data}

baseline = {}
patches = []
for patch_path, metadata in steps:
    patch = (proposals / patch_path).read_bytes()
    paths = {safe(path) for path in re.findall(r'^\+\+\+ b/(.+)$', patch.decode(), re.M)}
    for path in paths:
        if path not in baseline:
            source = native / path
            baseline[path] = source.read_bytes() if source.exists() else None
    if metadata:
        for path, expected in metadata_pins(proposals / metadata).items():
            actual = baseline[safe(path)]
            if (sha(actual) if actual is not None else None) != expected:
                raise ValueError(f'Pinned native baseline drift: {path}')
    patches.append((patch_path, patch))

brand_manifest = json.loads((proposals / 'native-branding-assets/manifest.json').read_text())
if sha((repository / 'assets/brand/arch-mark.svg').read_bytes()) != brand_manifest['canonicalSvgSha256']:
    raise ValueError('Canonical branding changed after native replacements were proposed')
for item in brand_manifest['entries']:
    if sha((native / safe(item['target'])).read_bytes()) != item['baselineSha256'] or sha((repository / safe(item['replacement'])).read_bytes()) != item['replacementSha256']:
        raise ValueError(f'Native artwork baseline/replacement drift: {item["target"]}')
report = {'version': 1, 'compiled': False, 'appliedToNative': False, 'sourceRoot': str(native),
          'steps': [], 'files': [], 'wireEdits': [],
          'binaryAssets': brand_manifest['entries'],
          'excluded': ['Experimental disabled canary webview proposal']}
output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='aux-native-compose-') as directory:
    copy = Path(directory)
    for path, raw in baseline.items():
        if raw is not None:
            (copy / path).parent.mkdir(parents=True, exist_ok=True)
            (copy / path).write_bytes(raw)
    environment = dict(os.environ, GIT_CEILING_DIRECTORIES=str(copy.parent))
    for name, patch in patches:
        subprocess.run(['git', 'apply', '--check', '-'], input=patch, cwd=copy, env=environment, check=True)
        subprocess.run(['git', 'apply', '-'], input=patch, cwd=copy, env=environment, check=True)
        report['steps'].append({'patch': name, 'sha256': sha(patch)})

    # Owner-required original protocol bytes, after the historical proposals.
    wire_edits = {
        'chrome/browser/aux/daemon_supervisor.cc': [
            ('"aux-daemon"', '"aside-daemon"', 1),
            ('"AuxDaemonSessionToken"', '"AsideDaemonSessionToken"', 1),
            ('"AuxDaemonSessionToken "', '"AsideDaemonSessionToken "', 1)],
        'chrome/browser/aux/installation_auth.cc': [
            ('std::string("Aux Daemon Auth v1\\0", 19)', 'std::string("Aside Daemon Auth v1\\0", 21)', 1)],
        'chrome/browser/aux/auth_scheme_probe.cc': [
            ('std::string("Aux Daemon Auth v1\\0", 19)', 'std::string("Aside Daemon Auth v1\\0", 21)', 1)],
        'chrome/browser/devtools/aux_cdp_authority.cc': [
            ('"AuxSessionToken"', '"AsideSessionToken"', 1),
            ('"AuxSessionToken "', '"AsideSessionToken "', 1)],
    }
    for path, edits in wire_edits.items():
        target = copy / path
        text = target.read_text()
        for find, replace, count in edits:
            if text.count(find) != count:
                raise ValueError(f'Wire correction anchor drift: {path}: {find}')
            text = text.replace(find, replace)
            report['wireEdits'].append({'path': path, 'find': find, 'replace': replace, 'count': count})
        target.write_text(text)
    gn = copy / 'chrome/browser/aux/BUILD.gn'
    gn.write_text(gn.read_text() + '\nexecutable("auth_scheme_probe") {\n  testonly = true\n  sources = [ "auth_scheme_probe.cc" ]\n  deps = [ ":platform", "//base", "//crypto", "//net" ]\n}\n')
    report['generatedKeyProbeTarget'] = '//chrome/browser/aux:auth_scheme_probe'
    combined = []
    for path, before in sorted(baseline.items()):
        after = (copy / path).read_bytes()
        combined.extend(difflib.unified_diff((before or b'').decode().splitlines(True), after.decode().splitlines(True),
                       fromfile=f'a/{path}' if before is not None else '/dev/null', tofile=f'b/{path}'))
        report['files'].append({'path': str(path), 'sourceSha256': sha(before) if before is not None else None, 'outputSha256': sha(after)})
    raw_patch = ''.join(combined).encode()
    report['combinedPatchSha256'] = sha(raw_patch)
    # Verify the exact combined result independently from its individual steps.
    with tempfile.TemporaryDirectory(prefix='aux-native-replay-') as replay_dir:
        replay = Path(replay_dir)
        for path, raw in baseline.items():
            if raw is not None:
                (replay / path).parent.mkdir(parents=True, exist_ok=True)
                (replay / path).write_bytes(raw)
        subprocess.run(['git', 'apply', '-'], input=raw_patch, cwd=replay, env=dict(environment, GIT_CEILING_DIRECTORIES=str(replay.parent)), check=True)
        for item in report['files']:
            if sha((replay / item['path']).read_bytes()) != item['outputSha256']:
                raise ValueError('Combined replay differs from proposal composition')
    output.mkdir()
    (output / 'combined.patch').write_bytes(raw_patch)
    (output / 'manifest.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'output': str(output), 'steps': len(report['steps']), 'files': len(report['files']), 'compiled': False, 'appliedToNative': False}))

#!/usr/bin/env python3
"""Prepare a pinned native integration patch; never edit the native checkout."""
from pathlib import Path
import argparse
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
NATIVE = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
PROPOSALS = REPO / 'docs/integration/proposed'


def digest(raw):
    return hashlib.sha256(raw).hexdigest() if raw is not None else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output == NATIVE or NATIVE in output.parents:
        raise SystemExit('Fresh output outside native checkout required')
    pins = json.loads((HERE / 'inputs.json').read_text())
    for name, expected in pins['workspaceInputs'].items():
        if digest((REPO / name).read_bytes()) != expected:
            raise SystemExit('Integration input drift: ' + name)
    before, after, origins = {}, {}, {}

    def record(target, data, origin):
        raw = (NATIVE / target).read_bytes() if (NATIVE / target).exists() else None
        if target not in pins['nativeInputs'] or digest(raw) != pins['nativeInputs'][target]:
            raise SystemExit('Native baseline drift: ' + target)
        before[target], after[target], origins[target] = raw, data, origin

    for row in pins['copies']:
        record(row['target'], (REPO / row['source']).read_bytes(), row['source'])

    platform = 'chrome/browser/aux/BUILD.gn'
    text = (NATIVE / platform).read_text()
    anchor = '  deps = [ "//base", "//crypto", "//net", "//services/network/public/cpp", "//components/crx_file" ]\n'
    if text.count(anchor) != 1:
        raise SystemExit('Platform GN anchor drift')
    names = ['AuxNativePeerTransport.cc', 'AuxNativePeerTransport.h', 'AuxNativePeerWire.h',
             'AuxOwnedNativePeerChild.cc', 'AuxOwnedNativePeerChild.h',
             'AuxSelectedStateHome.cc', 'AuxSelectedStateHome.h', 'AuxSelectedHomePolicyBridge.h']
    block = '  if (is_mac) {\n    sources += [\n'
    block += ''.join('      "' + name + '",\n' for name in names)
    block += ('    ]\n    deps += [ "native_peer_policy:aux_parent_sealed_policy" ]\n'
              '    frameworks = [ "CoreFoundation.framework", "Security.framework" ]\n'
              '    libs = [ "bsm" ]\n  }\n')
    record(platform, text.replace(anchor, anchor + block).encode(), 'counted platform GN integration')

    notifications = 'chrome/browser/notifications/BUILD.gn'
    text = (NATIVE / notifications).read_text()
    anchor = '    sources = [ "aux_notification_inbox.cc", "aux_notification_inbox.h" ]'
    if text.count(anchor) != 1:
        raise SystemExit('Notification GN anchor drift')
    replacement = '    sources = [ "aux_notification_inbox.cc", "aux_notification_inbox.h", "aux_inbox_codec.cc", "aux_inbox_codec.h" ]'
    record(notifications, text.replace(anchor, replacement).encode(), 'counted notification codec GN integration')

    root_gn = 'BUILD.gn'
    text = (NATIVE / root_gn).read_text()
    if 'aux_native_inbox_v2_checks' in text:
        raise SystemExit('Optional fixture already registered')
    text += ('\n# Optional synthetic codec check; no browser/startup dependency.\n'
             'if (is_mac && enable_aux_browser) {\n'
             '  group("aux_native_inbox_v2_checks") {\n    testonly = true\n'
             '    deps = [ "//chrome/browser/aux/inbox_v2_fixture:aux_inbox_v2_codec_fixture" ]\n'
             '  }\n}\n')
    record(root_gn, text.encode(), 'optional test-only GN group')
    if set(before) != set(pins['nativeInputs']):
        raise SystemExit('Incomplete baseline coverage')
    lines, records = [], []
    for target in sorted(before):
        raw, data = before[target], after[target]
        lines.append(f'diff --git a/{target} b/{target}\n')
        if raw is None:
            lines.append('new file mode 100644\n')
        lines += list(difflib.unified_diff(raw.decode().splitlines(True) if raw is not None else [],
                      data.decode().splitlines(True), fromfile='a/' + target if raw is not None else '/dev/null', tofile='b/' + target))
        records.append({'path': target, 'baselineSha256': digest(raw), 'outputSha256': digest(data), 'origin': origins[target]})
    patch = ''.join(lines).encode()
    output.mkdir(parents=True)
    (output / 'native.patch').write_bytes(patch)
    (output / 'metadata.json').write_text(json.dumps({'files': records, 'compiled': False,
        'applied': False, 'patchSha256': digest(patch), 'inputsSha256': digest((HERE / 'inputs.json').read_bytes())}, indent=2) + '\n')
    print(f'Prepared {len(records)} source/GN records; no native mutation, GN generation, compilation or execution')


if __name__ == '__main__':
    main()

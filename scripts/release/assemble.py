#!/usr/bin/env python3
"""Assemble, sign and verify an Aux release app from a native build and the sealed components.

    assemble.py --native <src>/out/AuxFast/Aux.app --components <candidate>/Aux.app --out DIR --build N
                [--version 1.0.0] [--identity development|developer-id] [--daemon-profile PATH]
                [--computer-use-helper 'apps/computer-use-helper/.build/app/Aux Computer Use.app']
                [--memory-helper apps/memory-helper/.build/aux-memory]

The native build supplies everything outside Contents/Resources/aux; the sealed candidate supplies
the components. Package edits are exact and count-checked (package-edits.json). Nothing outside
--out is modified, nothing is launched, uploaded or notarized here.

development: the local Apple Development identity, no timestamp, nested third-party signatures kept.
developer-id: the Developer ID identity with secure timestamps; every nested Mach-O without a
Developer ID signature is re-signed, and re-signed runtime files are re-pinned for the daemon's
runtime seeder. Notarization and publication are separate steps (notarize.py).
"""
import argparse
import hashlib
import json
import plistlib
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEAM = '9F2JXY8TCK'
AUX = 'Contents/Resources/aux'
DAEMON_APP = f'{AUX}/apps/daemon/Aux Daemon.app'
NATIVE = f'{DAEMON_APP}/Contents/Resources/native'
FRAMEWORK = 'Contents/Frameworks/Aux Framework.framework'
VERSIONED = f'{FRAMEWORK}/Versions/155.0.8059.85'
MACHO_MAGIC = {b'\xcf\xfa\xed\xfe', b'\xca\xfe\xba\xbe', b'\xfe\xed\xfa\xcf', b'\xbe\xba\xfe\xca'}
MINIMUM_MACOS = (15, 0)

# Bundle code objects in signing order (inside out), with their identifier and entitlements.
TARGETS = [
    (f'{VERSIONED}/Libraries/libvulkan.dylib', 'dev.aux.browser.libvulkan', None),
    (f'{VERSIONED}/Libraries/libvk_swiftshader.dylib', 'dev.aux.browser.libvk-swiftshader', None),
    (f'{VERSIONED}/Libraries/libaperitif.dylib', 'dev.aux.browser.libaperitif', None),
    (f'{VERSIONED}/Helpers/web_app_shortcut_copier', 'dev.aux.browser.web-app-shortcut-copier', None),
    (f'{VERSIONED}/Helpers/chrome_crashpad_handler', 'dev.aux.browser.chrome-crashpad-handler', None),
    (f'{VERSIONED}/Helpers/app_mode_loader', 'dev.aux.browser.app-mode-loader', None),
    (f'{VERSIONED}/Helpers/Aux Helper.app', 'dev.aux.browser.helper', 'helper'),
    (f'{VERSIONED}/Helpers/Aux Helper (Renderer).app', 'dev.aux.browser.helper.renderer', 'helper'),
    (f'{VERSIONED}/Helpers/Aux Helper (GPU).app', 'dev.aux.browser.helper', 'helper'),
    (f'{VERSIONED}/Helpers/Aux Helper (Aperitif).app', 'dev.aux.browser.helper', 'helper'),
    (f'{VERSIONED}/Helpers/Aux Helper (Aperitif Renderer).app', 'dev.aux.browser.helper.renderer', 'helper'),
    (f'{VERSIONED}/Helpers/Aux Helper (Aperitif GPU).app', 'dev.aux.browser.helper', 'helper'),
    (f'{VERSIONED}/Helpers/Aux Helper (Aperitif Alerts).app', 'dev.aux.browser.framework.AlertNotificationService', 'helper'),
    (f'{VERSIONED}/Helpers/Aux Helper (Alerts).app', 'dev.aux.browser.framework.AlertNotificationService', 'helper'),
    (FRAMEWORK, 'dev.aux.browser.framework', None),
    (f'{DAEMON_APP}/Contents/Resources/memory-helper/aux-memory', 'dev.aux.browser.memory', None),
    (f'{AUX}/apps/cli/Aux CLI.app', 'dev.aux.browser.cli', None),
    (f'{AUX}/apps/computer-use/Aux Computer Use.app', 'dev.aux.browser.computer-use', 'computer-use'),
    (DAEMON_APP, 'dev.aux.browser.daemon', 'daemon'),
    ('.', 'dev.aux.browser', 'app'),
]
ENTITLEMENTS = {
    'helper': {'com.apple.security.cs.allow-jit': True},
    # Web content reaches the camera, microphone and location through the browser, as in Chrome.
    'app': {'com.apple.security.cs.allow-jit': True,
            'com.apple.security.device.audio-input': True,
            'com.apple.security.device.camera': True,
            'com.apple.security.personal-information.location': True,
            'com.apple.security.automation.apple-events': True},
    'computer-use': {'com.apple.security.automation.apple-events': True,
                     'com.apple.security.personal-information.addressbook': True},
    'daemon': {'com.apple.application-identifier': f'{TEAM}.dev.aux.browser.daemon',
               'com.apple.developer.team-identifier': TEAM,
               'com.apple.security.cs.allow-jit': True,
               'keychain-access-groups': [f'{TEAM}.dev.aux.local']},
}
USAGE = {
    'NSCameraUsageDescription': 'Once Aux has access, websites can ask you for permission to use your camera.',
    'NSMicrophoneUsageDescription': 'Once Aux has access, websites can ask you for permission to use your microphone.',
    'NSLocationUsageDescription': 'Once Aux has access, websites can ask you for permission to use your location.',
    'NSLocationWhenInUseUsageDescription': 'Once Aux has access, websites can ask you for permission to use your location.',
    'NSBluetoothAlwaysUsageDescription': 'Once Aux has access, websites can ask you for permission to use Bluetooth devices.',
}
# Only these keys ship; the browser and CLI validate them (aux_packaged_state_identity.h).
# The full stage provenance stays outside the app, in the release receipt folder.
RELEASE_MARKER_KEYS = ('version', 'implementation', 'daemonRuntime', 'identityProfile',
                       'stateIdentityVersion', 'nativeStartupMode', 'passwordManager')


def crash_upload_url(dsn: str) -> str:
    """Sentry's Crashpad minidump endpoint for a DSN (https://KEY@HOST/PROJECT)."""
    from urllib.parse import urlsplit
    parts = urlsplit(dsn.strip())
    project = parts.path.strip('/')
    if parts.scheme != 'https' or not parts.username or not parts.hostname or not project.isdigit():
        raise SystemExit('the Sentry DSN is not https://KEY@HOST/PROJECT')
    return f'https://{parts.hostname}/api/{project}/minidump/?sentry_key={parts.username}'


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(command, **kwargs):
    result = subprocess.run(command, capture_output=True, text=True, **kwargs)
    if result.returncode:
        raise SystemExit(f'{command[0]} failed ({result.returncode}): {result.stderr.strip()[:2000]}')
    return result


def apply_edits(app: Path, spec: dict) -> list:
    """Exact, count-checked text edits; a glob target spreads `total` across its matches."""
    applied = []
    for edit in spec['edits']:
        paths = sorted(app.glob(edit['target'])) if any(c in edit['target'] for c in '*?[') else [app / edit['target']]
        if not paths:
            raise SystemExit(f"no file matches {edit['target']}")
        texts = {p: p.read_text(encoding='utf-8') for p in paths}
        found = sum(t.count(edit['find']) for t in texts.values())
        expected = edit.get('total', edit.get('count'))
        if found != expected:
            raise SystemExit(f"{edit['target']}: expected {expected} of {edit['find'][:80]!r}, found {found}")
        for p, t in texts.items():
            if edit['find'] in t:
                p.write_text(t.replace(edit['find'], edit['replace']), encoding='utf-8')
                applied.append({'path': str(p.relative_to(app)), 'why': edit['why']})
    return applied


def macho(path: Path) -> bool:
    if path.is_symlink() or not path.is_file():
        return False
    with path.open('rb') as handle:
        return handle.read(4) in MACHO_MAGIC


def signing_details(path: Path) -> tuple[str, str | None]:
    """(first authority, identifier) of a file's current signature."""
    detail = subprocess.run(['codesign', '-dvv', str(path)], capture_output=True, text=True).stderr
    lines = detail.splitlines()
    names = [line[len('Authority='):] for line in lines if line.startswith('Authority=')]
    identifier = next((line[len('Identifier='):] for line in lines if line.startswith('Identifier=')), None)
    return names[0] if names else ('adhoc' if 'Signature=adhoc' in detail else 'unsigned'), identifier


def identity_sha1(kind: str) -> str:
    wanted = 'Developer ID Application: ' if kind == 'developer-id' else 'Apple Development: '
    listing = run(['security', 'find-identity', '-v', '-p', 'codesigning']).stdout
    for line in listing.splitlines():
        match = re.search(r'([0-9A-F]{40}) "(.+)"', line)
        if match and match.group(2).startswith(wanted) and (kind != 'developer-id' or f'({TEAM})' in match.group(2)):
            return match.group(1)
    raise SystemExit(f'No {wanted.strip()} identity for team {TEAM} in the login Keychain')


def repin_runtime(app: Path, changed: list) -> int:
    """Re-pin re-signed runtime files so the daemon's seeder still accepts the bundled runtime."""
    runtime = app / AUX / 'agent-runtime'
    relative = {str(p.relative_to(runtime)) for p in changed if runtime in p.parents}
    if not relative:
        return 0
    pins_path = app / NATIVE / 'runtime-source-pins.json'
    bootstrap = app / NATIVE / 'runtime-bootstrap.cjs'
    old = sha256(pins_path)
    pins = json.loads(pins_path.read_text())
    for entry in pins['files']:
        if entry['path'] in relative:
            if entry.get('anchors'):
                raise SystemExit(f"refusing to re-pin anchored text file {entry['path']}")
            data = (runtime / entry['path']).read_bytes()
            entry['size'], entry['sourceSha256'] = len(data), hashlib.sha256(data).hexdigest()
            relative.discard(entry['path'])
    if relative:
        raise SystemExit(f'unpinned runtime files changed: {sorted(relative)[:5]}')
    pins_path.write_text(json.dumps(pins, separators=(',', ':')))
    text = bootstrap.read_text()
    if text.count(old) != 1:
        raise SystemExit('runtime-bootstrap.cjs must pin the runtime inventory exactly once')
    bootstrap.write_text(text.replace(old, sha256(pins_path)))
    return len(changed)


# Whole-file replacements: (path under AUX, sha256 of the file it replaces,
# repo source, why). Refuses when the component changed underneath.
EXTENSION_ICONS = 'apps/extension/dist/icons'
FILE_REPLACEMENTS = [
    (f'{EXTENSION_ICONS}/favicon-dark.png',
     '42d9aa3c1c82c24a1db95e33a48f5d4112cf966dcccbeb1bbce07a2712a74208',
     'assets/brand/extension/favicon-dark.png',
     "Aux's own pages show the plain mark in tabs, light on dark, never the boxed app icon."),
    (f'{EXTENSION_ICONS}/favicon-light.png',
     '42d9aa3c1c82c24a1db95e33a48f5d4112cf966dcccbeb1bbce07a2712a74208',
     'assets/brand/extension/favicon-light.png',
     "Aux's own pages show the plain mark in tabs, dark on light, never the boxed app icon."),
]


def replace_files(app: Path) -> list:
    done = []
    for target, expected, source, why in FILE_REPLACEMENTS:
        path = app / AUX / target
        if sha256(path) != expected:
            raise SystemExit(f'{target}: unexpected contents; review the replacement')
        shutil.copyfile(HERE.parents[1] / source, path)
        done.append({'path': f'{AUX}/{target}', 'why': why, 'sha256': sha256(path)})
    return done


# The CLI launcher is built with the browser (target native_cli_open) and replaces the
# sealed component's copy, so the terminal commands match this browser's sources.
CLI_EXECUTABLE = 'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli'
CLI_SEALED_SHA256 = '6f022a2fff6656648905aaa1f1340c3ccbd98c3be91684f08a2114128c4bbf4d'


def replace_cli(app: Path, native: Path) -> list:
    path, source = app / AUX / CLI_EXECUTABLE, native.parent / 'native_cli_open'
    if sha256(path) != CLI_SEALED_SHA256:
        raise SystemExit(f'{CLI_EXECUTABLE}: unexpected contents; review the replacement')
    if not source.is_file():
        raise SystemExit(f'{source}: build the native_cli_open target first')
    shutil.copyfile(source, path)
    path.chmod(0o755)
    return [{'path': f'{AUX}/{CLI_EXECUTABLE}', 'why': 'CLI launcher built with this browser', 'sha256': sha256(path)}]


# Aux's own Computer Use helper (apps/computer-use-helper/build.sh) replaces the supplied one.
COMPUTER_USE_APP = f'{AUX}/apps/computer-use/Aux Computer Use.app'
COMPUTER_USE_POLICY = f'{DAEMON_APP}/Contents/Resources/AuxComputerUseHelperLaunchPolicy.json'
COMPUTER_USE_POLICY_KEYS = {'format', 'sourceSha256', 'sha256', 'bytes', 'identifier', 'team'}


def replace_computer_use_helper(app: Path, source: Path) -> tuple[list, list]:
    """Swap in an unsigned helper app and re-pin its launch policy (and anything else pinning the old
    executable) to the new bytes. sourceSha256 stays: aux-daemon compares it with a compiled constant.
    Signing later changes the executable again; step 4 re-pins that the same way."""
    info = plistlib.loads((source / 'Contents/Info.plist').read_bytes())
    if (info.get('CFBundleIdentifier'), info.get('CFBundleExecutable')) != ('dev.aux.browser.computer-use', 'aux-computer-use'):
        raise SystemExit(f'{source}: not an Aux Computer Use app')
    target, policy_path = app / COMPUTER_USE_APP, app / COMPUTER_USE_POLICY
    executable = 'Contents/MacOS/aux-computer-use'
    policy = json.loads(policy_path.read_text())
    old = target / executable
    if set(policy) != COMPUTER_USE_POLICY_KEYS or (policy['sha256'], policy['bytes']) != (sha256(old), old.stat().st_size):
        raise SystemExit(f'{COMPUTER_USE_POLICY}: does not pin the supplied helper; review the replacement')
    before = (policy['sha256'], policy['bytes'])
    shutil.rmtree(target)
    shutil.copytree(source, target, symlinks=True)
    new = target / executable
    new.chmod(0o755)
    cascade = repin_cascade(app, {before[0]: (sha256(new), before[1], new.stat().st_size)})
    pinned = json.loads(policy_path.read_text())
    if pinned != {**policy, 'sha256': sha256(new), 'bytes': new.stat().st_size}:
        raise SystemExit(f'{COMPUTER_USE_POLICY}: re-pin did not produce the expected record')
    return [{'path': COMPUTER_USE_APP, 'why': "Aux's own Computer Use helper", 'sha256': sha256(new)}], cascade


# Aux's own memory helper (apps/memory-helper/build.sh) replaces the supplied one the daemon launches.
MEMORY_HELPER = f'{DAEMON_APP}/Contents/Resources/memory-helper/aux-memory'
MEMORY_POLICY = f'{DAEMON_APP}/Contents/Resources/AuxMemoryHelperLaunchPolicy.json'
# The daemon hashes this unsigned copy against a compiled constant (the policy's sourceSha256), so
# signing must leave it exactly as supplied.
MEMORY_DISTRIBUTION = f'{AUX}/memory-distribution'
MEMORY_POLICY_KEYS = {'format', 'sourceSha256', 'sha256', 'bytes', 'identifier', 'team', 'modelDescriptorSha256'}


def replace_memory_helper(app: Path, source: Path) -> tuple[list, list]:
    """Swap in an unsigned aux-memory and re-pin its launch policy (and anything else pinning the old
    executable). sourceSha256 and the memory-distribution runtime copy stay: aux-daemon compares
    sourceSha256 with a compiled constant. Signing changes the executable again; step 4 re-pins it."""
    data = source.read_bytes()
    if data[:4] not in MACHO_MAGIC or b'__deunicode' not in data:
        raise SystemExit(f'{source}: not an aux-memory built by apps/memory-helper/build.sh')
    target, policy_path = app / MEMORY_HELPER, app / MEMORY_POLICY
    policy = json.loads(policy_path.read_text())
    if set(policy) != MEMORY_POLICY_KEYS or (policy['sha256'], policy['bytes']) != (sha256(target), target.stat().st_size):
        raise SystemExit(f'{MEMORY_POLICY}: does not pin the supplied helper; review the replacement')
    before = (policy['sha256'], policy['bytes'])
    target.write_bytes(data)
    target.chmod(0o755)
    cascade = repin_cascade(app, {before[0]: (sha256(target), before[1], target.stat().st_size)})
    if json.loads(policy_path.read_text()) != {**policy, 'sha256': sha256(target), 'bytes': target.stat().st_size}:
        raise SystemExit(f'{MEMORY_POLICY}: re-pin did not produce the expected record')
    return [{'path': MEMORY_HELPER, 'why': "Aux's own memory helper", 'sha256': sha256(target)}], cascade


# The PDF tools and their libraries rebuilt for macOS 15 (scripts/runtime/build-pdf-runtime.py).
PDF_RUNTIME_MANIFEST = HERE.parent / 'runtime/pdf-runtime-macos15.json'


def substitute_pdf_runtime(app: Path, built: Path, manifest: Path = PDF_RUNTIME_MANIFEST) -> list:
    """Swap the supplied files for the rebuilt ones. Both sides must match the manifest exactly.
    Returns (path, (old sha256, old size)) for each file to sign and re-pin: the replaced ones and
    the `relinked` supplied files that load them, since hardened runtime needs one team on both sides."""
    spec = json.loads(manifest.read_text())
    files = spec['files']
    runtime = app / AUX / 'agent-runtime'
    for rel, entry in files.items():
        if sha256(runtime / rel) != entry['originalSha256']:
            raise SystemExit(f'agent-runtime/{rel}: unexpected supplied contents; review the substitution')
        if not (built / rel).is_file() or sha256(built / rel) != entry['sha256']:
            raise SystemExit(f'{built / rel}: missing or not the built file the manifest records')
    replaced = []
    for rel in files:
        target = runtime / rel
        before = (sha256(target), target.stat().st_size)
        mode = target.stat().st_mode & 0o777
        shutil.copyfile(built / rel, target)
        target.chmod(mode)
        replaced.append((target, before))
    for rel in spec['relinked']:
        target = runtime / rel
        replaced.append((target, (sha256(target), target.stat().st_size)))
    return replaced


def above_minimum_macos(app: Path) -> list:
    """Runtime Mach-O files that declare a minimum macOS newer than the product's floor."""
    runtime = app / AUX / 'agent-runtime'
    declared = {path: run(['vtool', '-show-build', str(path)]).stdout for path in runtime.rglob('*') if macho(path)}
    return sorted(str(path.relative_to(runtime)) for path, build in declared.items()
                  if any((int(major), int(minor)) > MINIMUM_MACOS
                         for major, minor in re.findall(r'minos (\d+)\.(\d+)', build)))


def main_executable(app: Path, target: str) -> Path:
    """The file a target's signature covers as code: a loose file itself, a bundle's executable."""
    path = app / target
    if not path.is_dir():
        return path
    if target.endswith('.framework'):
        return path / path.stem
    info = plistlib.loads((path / 'Contents/Info.plist').read_bytes())
    return path / 'Contents/MacOS' / info['CFBundleExecutable']


TEXT_SUFFIXES = ('.json', '.js', '.mjs', '.cjs', '.md', '.txt', '.plist')


def enclosing_object(text: str, index: int) -> tuple[int, int] | None:
    """Span of the innermost {...} around index, skipping JSON strings; None outside one."""
    depth, start, in_string = 0, None, False
    # The digest sits inside a JSON string: begin before its opening quote.
    begin = index - 2 if index > 0 and text[index - 1] == '"' else index - 1
    for i in range(begin, -1, -1):
        ch = text[i]
        if ch == '"' and (i == 0 or text[i - 1] != '\\'):
            in_string = not in_string
        elif not in_string and ch == '}':
            depth += 1
        elif not in_string and ch == '{':
            if depth == 0:
                start = i
                break
            depth -= 1
    if start is None:
        return None
    depth, in_string = 0, False
    for i in range(start, len(text)):
        ch = text[i]
        if ch == '"' and text[i - 1] != '\\':
            in_string = not in_string
        elif not in_string and ch == '{':
            depth += 1
        elif not in_string and ch == '}':
            depth -= 1
            if depth == 0:
                return start, i + 1
    return None


def repin_text(text: str, old: str, new: str, old_size: int, new_size: int) -> str:
    """Swap a pinned digest; in the same object, a size/bytes field equal to the old size follows it."""
    pieces, cursor = [], 0
    while (index := text.find(old, cursor)) >= 0:
        span = enclosing_object(text, index)
        if span is None or span[0] < cursor:
            pieces.append(text[cursor:index] + new)
            cursor = index + len(old)
            continue
        start, end = span
        body = text[start:end].replace(old, new)
        for key in ('"size"', '"bytes"'):
            for sep in (':', ': '):
                body = body.replace(f'{key}{sep}{old_size},', f'{key}{sep}{new_size},').replace(
                    f'{key}{sep}{old_size}}}', f'{key}{sep}{new_size}}}')
        pieces.append(text[cursor:start] + body)
        cursor = end
    return ''.join(pieces) + text[cursor:]


def repin_cascade(app: Path, changes: dict) -> list:
    """Replace each changed file's old SHA-256 (and its recorded size) wherever the components
    pin it, then repeat for the pinning files that change in turn. changes maps an old digest to
    (new digest, old size, new size). A directory named exactly by a digest (memory runtimes are
    keyed by their runtime.json hash) is renamed with it; any other use in a path refuses."""
    root, log = app / AUX, []
    pending = dict(changes)
    while pending:
        old, (new, old_size, new_size) = pending.popitem()
        for path in sorted(root.rglob(f'*{old}*'), key=lambda p: -len(p.parts)):
            if path.name != old or not path.is_dir():
                raise SystemExit(f'digest {old[:12]} is part of a path name; refusing to re-pin it')
            path.rename(path.with_name(new))
            log.append({'path': str(path.relative_to(app)), 'renamedTo': new})
        texts = [p for p in root.rglob('*') if p.is_file() and not p.is_symlink()
                 and p.suffix in TEXT_SUFFIXES and '_CodeSignature' not in p.parts]
        for path in texts:
            text = path.read_text(encoding='utf-8', errors='surrogateescape')
            if old in text:
                before, size = sha256(path), path.stat().st_size
                path.write_text(repin_text(text, old, new, old_size, new_size), encoding='utf-8', errors='surrogateescape')
                log.append({'path': str(path.relative_to(app)), 'replaced': old})
                pending[before] = (sha256(path), size, path.stat().st_size)
    return log


def sign(app: Path, target: str, identifier: str, entitlements: str | None, identity: str,
         timestamp: bool, work: Path) -> dict:
    command = ['codesign', '--force', '--sign', identity, '--options', 'runtime',
               '--timestamp' if timestamp else '--timestamp=none', '--identifier', identifier]
    if entitlements:
        plist = work / f'{entitlements}.entitlements'
        command += ['--entitlements', str(plist)]
    run(command + [str(app / target)])
    run(['codesign', '--verify', '--strict', '-R',
         f'=anchor apple generic and identifier "{identifier}" and certificate leaf[subject.OU] = "{TEAM}"',
         str(app / target)])
    actual = run(['codesign', '-d', '--entitlements', ':-', str(app / target)]).stdout.strip()
    if (plistlib.loads(actual.encode()) if actual else {}) != (ENTITLEMENTS[entitlements] if entitlements else {}):
        raise SystemExit(f'entitlements differ after signing {target}')
    return {'target': target, 'identifier': identifier, 'entitlements': entitlements}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--native', type=Path, required=True)
    parser.add_argument('--components', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--version', default='1.0.0')
    parser.add_argument('--build', type=int, required=True)
    parser.add_argument('--identity', choices=('development', 'developer-id'), default='development')
    parser.add_argument('--daemon-profile', type=Path, help='Developer ID provisioning profile for the daemon')
    parser.add_argument('--release-addons', type=Path,
                        help='aux-pdf.node and aux-macos-utilities.node already signed with Developer ID; '
                             'their hashes are pinned in the browser and daemon policies')
    parser.add_argument('--crash-dsn-ref', help='op:// reference to the Sentry DSN, read with op-agents (never printed)')
    parser.add_argument('--daemon-executable', type=Path, help='relinked aux-daemon (scripts/candidate/relink_daemon.py)')
    parser.add_argument('--pdf-runtime', type=Path, nargs='?', const=HERE.parents[1] / 'out/runtime/pdf-macos15',
                        help='replace the runtime PDF tools with the macOS 15 rebuild (default out/runtime/pdf-macos15)')
    parser.add_argument('--runtime-macos15', action='store_true',
                        help='refuse a runtime with a Mach-O that declares a minimum macOS above 15.0')
    parser.add_argument('--computer-use-helper', type=Path,
                        help="unsigned Aux Computer Use.app from apps/computer-use-helper/build.sh; replaces the supplied helper")
    parser.add_argument('--memory-helper', type=Path,
                        help='unsigned aux-memory from apps/memory-helper/build.sh; replaces the helper the daemon launches')
    args = parser.parse_args()

    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    app, work = out / 'Aux.app', out / 'work'
    work.mkdir()
    release = args.identity == 'developer-id'
    if release and not args.daemon_profile:
        raise SystemExit('--daemon-profile is required for developer-id signing')
    identity = identity_sha1(args.identity)
    for name, value in ENTITLEMENTS.items():
        (work / f'{name}.entitlements').write_bytes(plistlib.dumps(value))

    # 1. Native app plus the sealed components; nothing else from the candidate.
    run(['ditto', str(args.native), str(app)])
    if (app / AUX).exists():
        raise SystemExit('the native build already contains Contents/Resources/aux')
    run(['ditto', str(args.components / AUX), str(app / AUX)])

    # 2. Package edits.
    edits = apply_edits(app, json.loads((HERE / 'package-edits.json').read_text()))
    edits += replace_files(app)
    edits += replace_cli(app, args.native)
    helper_cascade = []
    if args.computer_use_helper:
        helper_edits, helper_cascade = replace_computer_use_helper(app, args.computer_use_helper.resolve())
        edits += helper_edits
    if args.memory_helper:
        memory_edits, memory_cascade = replace_memory_helper(app, args.memory_helper.resolve())
        edits += memory_edits
        helper_cascade += memory_cascade
    # Component transforms written as modules (count-checked inside, see transforms.mjs).
    transforms = json.loads(run(['node', str(HERE / 'transforms.mjs'), str(app)]).stdout or '[]')
    marker_path = app / AUX / 'bundle.json'
    marker = json.loads(marker_path.read_text())
    shutil.copy2(marker_path, out / 'stage-provenance-bundle.json')
    release_marker = {key: marker[key] for key in RELEASE_MARKER_KEYS if key in marker}
    release_marker.update(product='Aux', productVersion=args.version, build=args.build)
    marker_path.write_text(json.dumps(release_marker, indent=1) + '\n')
    marker_path.chmod(0o644)

    info_path = app / 'Contents/Info.plist'
    info = plistlib.loads(info_path.read_bytes())
    info.update(CFBundleShortVersionString=args.version, CFBundleVersion=str(args.build))
    for key, text in USAGE.items():
        info.setdefault(key, text)
    crash_host = None
    if args.crash_dsn_ref:
        dsn = subprocess.run(['op-agents', 'read', args.crash_dsn_ref], capture_output=True, text=True)
        if dsn.returncode:
            raise SystemExit('could not read the Sentry DSN from 1Password')
        info['AuxCrashUploadURL'] = crash_upload_url(dsn.stdout)
        crash_host = info['AuxCrashUploadURL'].split('/')[2]
    info_path.write_bytes(plistlib.dumps(info))

    if args.daemon_executable:
        target = app / DAEMON_APP / 'Contents/MacOS/aux-daemon'
        shutil.copy2(args.daemon_executable, target)
        target.chmod(0o755)
    if args.daemon_profile:
        shutil.copy2(args.daemon_profile, app / DAEMON_APP / 'Contents/embedded.provisionprofile')

    # 3. Nested Mach-O files that are not bundle targets: keep third-party Developer ID
    # signatures; in developer-id mode re-sign everything else with Aux's.
    # Target executables are signed with their target in step 4, never here.
    covered = {main_executable(app, t) for t, _, _ in TARGETS if t != '.'}
    resigned, kept = [], {}
    # Rebuilt PDF tools are signed with Aux's identity in both modes, keeping their identifiers.
    pdf_runtime = substitute_pdf_runtime(app, args.pdf_runtime.resolve()) if args.pdf_runtime else []
    above = above_minimum_macos(app) if args.runtime_macos15 else []
    if above:
        raise SystemExit(f'{len(above)} runtime files need macOS above 15.0: {above[:5]}')
    for path, _ in pdf_runtime:
        run(['codesign', '--force', '--sign', identity, '--options', 'runtime',
             '--timestamp' if release else '--timestamp=none', '--identifier', path.stem, str(path)])
    resigned += pdf_runtime
    # The daemon policies pin these addons' exact bytes, and a timestamped signature
    # differs every time, so a release uses one fixed Developer ID copy of each.
    if args.release_addons:
        for name in ('aux-pdf.node', 'aux-macos-utilities.node'):
            target = app / NATIVE / name
            before = (sha256(target), target.stat().st_size)
            shutil.copy2(args.release_addons / name, target)
            resigned.append((target, before))
    for path in sorted((app / AUX).rglob('*'), key=lambda p: -len(p.parts)):
        if not macho(path) or path in covered or app / MEMORY_DISTRIBUTION in path.parents:
            continue
        current, identifier = signing_details(path)
        kept[current] = kept.get(current, 0) + 1
        if release and not current.startswith('Developer ID Application: '):
            before = (sha256(path), path.stat().st_size)
            # Keep the identifier: the daemon policy requires dev.aux.browser.runtime on its addons.
            keep = ['--identifier', identifier] if identifier and current != 'unsigned' else []
            run(['codesign', '--force', '--sign', identity, '--options', 'runtime', '--timestamp', *keep, str(path)])
            resigned.append((path, before))
    runtime = app / AUX / 'agent-runtime'
    pins = app / NATIVE / 'runtime-source-pins.json'
    pin_files = [pins, app / NATIVE / 'runtime-bootstrap.cjs']
    pins_before = {p: (sha256(p), p.stat().st_size) for p in pin_files}
    repinned = repin_runtime(app, [p for p, _ in resigned if runtime in p.parents])
    cascade = helper_cascade + repin_cascade(app, {
        **{old: (sha256(p), size, p.stat().st_size) for p, (old, size) in resigned if runtime not in p.parents},
        **{old: (sha256(p), size, p.stat().st_size) for p, (old, size) in pins_before.items() if sha256(p) != old}})

    # 4. Targets, inside out. A helper's launch policy pins its executable's hash, and
    # signing changes it, so each helper is re-pinned before the daemon seals the policy.
    signed = []
    for target, identifier, entitlements in TARGETS:
        executable = main_executable(app, target) if target != '.' else None
        before = (sha256(executable), executable.stat().st_size) if executable else None
        signed.append(sign(app, target, identifier, entitlements, identity, release, work))
        if executable and target.startswith(AUX) and target != DAEMON_APP and sha256(executable) != before[0]:
            cascade += repin_cascade(app, {before[0]: (sha256(executable), before[1], executable.stat().st_size)})
    run(['codesign', '--verify', '--deep', '--strict', str(app)])

    receipt = {
        'format': 'aux.release-assembly.v1', 'version': args.version, 'build': args.build,
        'identity': args.identity, 'identitySha1': identity,
        'daemonExecutable': {'path': str(args.daemon_executable), 'sha256': sha256(args.daemon_executable)} if args.daemon_executable else None, 'native': str(args.native), 'components': str(args.components),
        'componentsBundleSha256': sha256(out / 'stage-provenance-bundle.json'),
        'chromiumTreeManifestSha256': sha256(HERE.parents[1] / 'chromium/tree/manifest.json'),
        'crashUploadHost': crash_host, 'packageEdits': edits, 'transforms': transforms, 'nestedSignatures': kept, 'resignedNested': len(resigned),
        'repinnedRuntimeFiles': repinned, 'repinCascade': cascade, 'signed': signed, 'usageStrings': sorted(USAGE),
        'notarized': False, 'published': False,
    }
    (out / 'receipt.json').write_text(json.dumps(receipt, indent=1) + '\n')
    print(json.dumps({k: receipt[k] for k in ('version', 'build', 'identity', 'resignedNested', 'repinnedRuntimeFiles')}))
    return 0


if __name__ == '__main__':
    sys.exit(main())

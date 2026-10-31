#!/usr/bin/env python3
"""Build the one fixed signed agent runtime a release ships, and the pins compiled into the daemon.

    fix_runtime.py --components <candidate>/Aux.app --runtime out/runtime --out DIR

The daemon seeds a task home's runtime only if every file matches kAuxRuntimePins, a table compiled
into worker-host.o, and a timestamped signature differs every time. So the runtime is staged once:
Aux's rebuilt Mach-Os, clean text and pyc, one neutral text root, every Mach-O signed with Developer
ID. Assembly copies it and never signs it. Re-running this means a new daemon relink.

Writes under DIR: agent-runtime/, runtime-source-pins.json, runtime-text-root.json,
source/AuxRuntimeCachePins.inc, source/AuxRuntimePublication.inc, source/AuxDevelopmentWorkerHost.combined.cc,
worker-host.o, compile.json, pins.json.
"""
import argparse
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PROPOSED = ROOT / 'docs/integration/proposed'
TMP = '/private/tmp/'
PRESERVED = ROOT / 'out/live-inputs/tmp-preserved'
WORKER_RECIPE = PROPOSED / 'completion-20261026/runtime/final-daemon-pdf-abi/daemon-recipe.json'
VFS = PROPOSED / 'completion-20261026/runtime/fixed-builtins/root-compile-vfs.json'
FINAL_SOURCE = PROPOSED / 'completion-20261026/runtime/final-daemon/source'
CACHE_SOURCE = PROPOSED / 'profile-isolation-local-finish/runtime-cache-async-relink-a3/source'
RECORDED_ROOTS = ('/Users/rcourson/Documents/Vibe/web', '/Users/rcourson/Documents/Vibe/aux-completion-20261026/runtime')
# Headers the recorded compile took from since-deleted worktrees of this repository.
WORKTREES = ('aux-async-writes-final/', 'aux-worker-close-successor/')

# A real install location, in the shape runtime-bootstrap.cjs requires. Seeding replaces it with the
# task home's path; it names no machine or supplier.
TEXT_ROOT = '/Applications/Aux.app/Contents/Resources/aux/agent-runtime'
SUPPLIED_TEXT_ROOT = '/Users/rcourson/Documents/Vibe/web/out/provided-candidate-completion-20261026-a1/Aux.app/Contents/Resources/aux/agent-runtime'
SUPPLIED_ANCHOR = '/Users/runner/work/bro-components/bro-components/packages/aside-runtime/dist/aside-runtime-1.26.1019.335-darwin-arm64'
# Shipped text and pyc must not contain these. `/.aside` is Aside's home folder; a bare `.aside` is
# lxml's HTML builder (`E.aside`), upstream code that names an element.
FORBIDDEN = (b'/Users/rcourson', b'/Users/runner', b'bro-components', b'/.aside')


def load(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def rewrite_table(table: str, entries: dict) -> str:
    """The compiled table with this runtime's sizes and hashes, the neutral root as the anchor, and
    no identity anchors (the text ships final). Rows, order, modes and link targets stay."""
    table = table.replace(json.dumps(SUPPLIED_ANCHOR), json.dumps(TEXT_ROOT))
    table = re.sub(r'constexpr aux_runtime_cache::Anchor (\w+)\[\]=\{\n\{"ASIDE_",[^\n]*\n\};\n', '', table)

    def row(match: re.Match) -> str:
        path, mode, anchors, count = match.group('path'), match.group('mode'), match.group('anchors'), match.group('count')
        entry = entries.get(json.loads(f'"{path}"'))
        if entry is None:
            raise SystemExit(f'{path}: in the compiled table but not the runtime')
        if entry['anchors'] == 0:
            anchors, count = 'nullptr', '0'
        return f'{{"{path}",\'f\',{mode},{entry["size"]},"{entry["sha256"]}","",{anchors},{count}}},'
    table, rows = re.subn(r'^\{"(?P<path>(?:[^"\\]|\\.)*)",\'f\',(?P<mode>\d+),\d+,"[0-9a-f]{64}","",(?P<anchors>\w+),(?P<count>\d+)\},$',
                          row, table, flags=re.M)
    if rows != len(entries):
        raise SystemExit(f'{rows} compiled file rows, {len(entries)} runtime files')
    for digest in (SUPPLIED_ANCHOR, 'ASIDE_'):
        if digest in table:
            raise SystemExit(f'the compiled table still has {digest}')
    return table


def rewrite_pins(pins: dict, entries: dict) -> dict:
    """runtime-source-pins.json in the same terms as the compiled table."""
    for row in pins['files']:
        if row['type'] != 'file':
            continue
        entry = entries[row['path']]
        row['size'], row['sourceSha256'] = entry['size'], entry['sha256']
        anchors = row.pop('anchors', None)
        if entry['anchors']:
            row['anchors'] = [{**anchors[0], 'find': TEXT_ROOT}]
    return pins


def neutral_text(runtime: Path, pins: dict) -> list:
    """Point the relocatable files at the neutral root. Counts come from their pins."""
    changed = []
    for row in pins['files']:
        for anchor in row.get('anchors', ()):
            if anchor['find'] != SUPPLIED_ANCHOR:
                continue
            path = runtime / row['path']
            text = path.read_bytes().decode()
            if text.count(SUPPLIED_TEXT_ROOT) != anchor['count']:
                raise SystemExit(f"{row['path']}: expected {anchor['count']} of the supplied root")
            path.write_text(text.replace(SUPPLIED_TEXT_ROOT, TEXT_ROOT))
            path.chmod(row['mode'])
            changed.append(row['path'])
    return changed


def scan(runtime: Path, macho) -> list:
    """Every file that still names this machine or the supplier. Mach-O files are the rebuild's own."""
    found = []
    for path in runtime.rglob('*'):
        if path.is_symlink() or not path.is_file() or macho(path):
            continue
        data = path.read_bytes()
        if any(word in data for word in FORBIDDEN):
            found.append(str(path.relative_to(runtime)))
    return sorted(found)


def worker_host_compile(source: Path, out: Path) -> list:
    """The recorded worker-host compile against the current repository, taking the new table first.
    On the unchanged inputs it reproduces the linked object byte for byte."""
    recipe = json.loads(WORKER_RECIPE.read_text())
    command = next(c for c in recipe['commands'] if any(a.endswith('AuxDevelopmentWorkerHost.combined.cc') for a in c))

    def mapped(value: str) -> str:
        for recorded in RECORDED_ROOTS:
            value = value.replace(recorded, str(ROOT))
        if TMP in value and 'worker-host' not in value:
            head, tail = value.split(TMP, 1)
            if tail.startswith(WORKTREES):
                return head + str(ROOT) + tail[tail.index('/docs/integration/'):]
            return head + str(PRESERVED / tail)
        return value
    command = [mapped(a) for a in command]
    overlay = json.loads(VFS.read_text())
    recorded = RECORDED_ROOTS[0]
    roots = []
    for entry in overlay['roots']:
        target = entry['external-contents'].replace(recorded, str(ROOT))
        roots += [{**entry, 'external-contents': target}, {**entry, 'name': entry['name'].replace(recorded, str(ROOT)), 'external-contents': target}]
    (out / 'compile-vfs.json').write_text(json.dumps({**overlay, 'roots': roots}, indent=1) + '\n')
    command[command.index('-ivfsoverlay') + 1] = str(out / 'compile-vfs.json')
    for index, value in enumerate(command):
        if value.endswith('AuxDevelopmentWorkerHost.combined.cc'):
            command[index] = str(source / 'AuxDevelopmentWorkerHost.combined.cc')
        elif value.endswith('worker-host.o'):
            command[index] = str(out / 'worker-host.o')
        elif value.endswith('worker-host.d'):
            command[index] = str(out / 'worker-host.d')
    return [command[0], f'-I{source}', *command[1:]]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--components', type=Path, required=True)
    parser.add_argument('--runtime', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    assemble = load(ROOT / 'scripts/release/assemble.py', 'assemble')
    clean = load(ROOT / 'scripts/runtime/clean_runtime.py', 'clean_runtime')

    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    app = out / 'stage'
    stage = app / assemble.AUX / 'agent-runtime'
    stage.parent.mkdir(parents=True)
    source_runtime = args.components / assemble.AUX / 'agent-runtime'
    subprocess.run(['ditto', str(source_runtime), str(stage)], check=True)
    pins = json.loads((args.components / assemble.NATIVE / 'runtime-source-pins.json').read_text())

    rebuilt = assemble.substitute_runtime(app, args.runtime.resolve())
    above = assemble.above_minimum_macos(app)
    if above:
        raise SystemExit(f'{len(above)} runtime files need macOS above 15.0: {above[:5]}')
    neutral = neutral_text(stage, pins)
    cleaned = clean.clean_runtime(stage, stage / 'python/runtime/bin/python3')

    identity = assemble.identity_sha1('developer-id')
    entries = assemble.runtime_entries(app)
    with tempfile.TemporaryDirectory() as work:
        for path, _ in rebuilt:
            assemble.sign_runtime_file(path, entries[path][1], identity, True, Path(work))
    foreign = assemble.foreign_runtime_signatures(app, assemble.signing_details(rebuilt[0][0])[0])
    if foreign:
        raise SystemExit(f'{len(foreign)} runtime files are not signed by this build: {foreign[:5]}')
    leftover = scan(stage, assemble.macho)
    if leftover:
        raise SystemExit(f'{len(leftover)} runtime files still name this machine or the supplier: {leftover[:8]}')

    files = {}
    for row in pins['files']:
        if row['type'] != 'file':
            continue
        path = stage / row['path']
        data = path.read_bytes()
        if (path.stat().st_mode & 0o7777) != row['mode'] or path.stat().st_nlink != 1:
            raise SystemExit(f"{row['path']}: mode or link count differs from its pin")
        files[row['path']] = {'size': len(data), 'sha256': sha256(data), 'anchors': int(row['path'] in neutral)}
    table = rewrite_table((CACHE_SOURCE / 'AuxRuntimeCachePins.inc').read_text(), files)
    pins = rewrite_pins(pins, files)

    source = out / 'source'
    source.mkdir()
    (source / 'AuxRuntimeCachePins.inc').write_text(table)
    publication = (FINAL_SOURCE / 'AuxRuntimePublication.inc').read_text()
    declaration = f'constexpr char kBundledTextRoot[] = {json.dumps(SUPPLIED_TEXT_ROOT)};'
    if publication.count(declaration) != 1:
        raise SystemExit('AuxRuntimePublication.inc: expected the supplied text root once')
    (source / 'AuxRuntimePublication.inc').write_text(
        publication.replace(declaration, f'constexpr char kBundledTextRoot[] = {json.dumps(TEXT_ROOT)};'))
    # Quoted includes search the including file's folder first, so the host source moves too.
    shutil.copyfile(FINAL_SOURCE / 'AuxDevelopmentWorkerHost.combined.cc', source / 'AuxDevelopmentWorkerHost.combined.cc')

    command = worker_host_compile(source, out)
    (out / 'compile.json').write_text(json.dumps(command) + '\n')
    subprocess.run(command, check=True, cwd=ROOT)

    (app / assemble.AUX / 'agent-runtime').rename(out / 'agent-runtime')
    shutil.rmtree(app)
    pins_bytes = json.dumps(pins, separators=(',', ':')).encode()
    root_bytes = (json.dumps({'format': 'aux.runtime-text-root.v1', 'runtimeRoot': TEXT_ROOT}, indent=2) + '\n').encode()
    (out / 'runtime-source-pins.json').write_bytes(pins_bytes)
    (out / 'runtime-text-root.json').write_bytes(root_bytes)
    record = {'format': 'aux.release-runtime.v1', 'textRoot': TEXT_ROOT, 'files': len(files), 'relocated': len(neutral),
              'inventory': len(pins['files']), 'sourceVersion': pins['sourceVersion'],
              'pinsSha256': sha256(pins_bytes), 'textRootSha256': sha256(root_bytes),
              'tableSha256': sha256(table.encode()), 'cleaned': len(cleaned), 'signed': len(rebuilt)}
    (out / 'pins.json').write_text(json.dumps(record, indent=1) + '\n')
    print(json.dumps(record))
    return 0


if __name__ == '__main__':
    sys.exit(main())

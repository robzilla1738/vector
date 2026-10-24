#!/usr/bin/env python3
"""Prepare one FD-cleanup successor from the successful immutable a2 tuple."""
from pathlib import Path
import ast
import difflib
import hashlib
import json
import shlex
import sys

ROOT = Path('/Users/rcourson/Documents/Vibe/web')
HERE = Path(__file__).resolve().parent


def sha(path):
    with open(path, 'rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    assert len(sys.argv) <= 2
    cleanup = Path(sys.argv[1]).resolve() if len(sys.argv) == 2 else ROOT / 'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-fd-cleanup'
    cleanup_manifest_path = cleanup / 'manifest.json'
    cleanup_manifest = json.loads(cleanup_manifest_path.read_text())
    assert cleanup_manifest['format'] == 'aux.runtime-cache-fd-cleanup-files.v1'
    extra_pins = {str(cleanup_manifest_path): sha(cleanup_manifest_path)}
    for name, digest in cleanup_manifest['files'].items():
        path = cleanup / name
        assert sha(path) == digest
        extra_pins[str(path)] = digest
    overlay = json.loads((cleanup / 'overlay.json').read_text())
    assert overlay['format'] == 'aux.runtime-cache-fd-cleanup.v1'
    old_out = Path('/private/tmp/aux-runtime-cache-async-object-20261023-a2')
    base_path = old_out / 'daemon-inputs.json'
    compile_path = old_out / 'results.json'
    dep_path = old_out / 'worker-host.d'
    link_path = Path('/private/tmp/aux-runtime-cache-async-link-20261023-a2/results.json')
    old_recipe = ROOT / 'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-relink-a2'
    helper = ROOT / 'docs/integration/proposed/profile-isolation-continuation/build/link-daemon.py'
    lock = ROOT / 'scripts/native-build.py'
    base = json.loads(base_path.read_text())
    previous = json.loads(compile_path.read_text())
    link = json.loads(link_path.read_text())
    assert previous['passed'] and previous['compiled'] and previous['linked'] and previous['inputsUnchanged']
    assert previous['dependenciesMatch'] and previous['dependencyCount'] == 94
    assert previous['compileExitCode'] == 0 and previous['linkCheckerExitCode'] == 0
    assert previous['planSha256'] == sha(old_recipe / 'plan.json')
    assert previous['runnerSha256'] == sha(old_recipe / 'run.py')
    assert previous['daemonInputManifestSha256'] == sha(base_path)
    assert previous['daemonLinkReceiptSha256'] == sha(link_path)
    assert previous['dependencyFileSha256'] == sha(dep_path)
    assert link['passed'] and link['inputsUnchanged']
    assert link['manifestSha256'] == sha(base_path) and link['recipeSha256'] == sha(helper)
    assert previous['sameModuleABI'] and previous['samePrivateDefinitions']
    assert previous['executableSha256'] == link['executableSha256'] == sha(Path(base['output']) / 'Aux Daemon')
    compile_command = previous['compileCommand'].copy()
    old_source = compile_command[compile_command.index('-c') + 1]
    old_object = compile_command[compile_command.index('-o') + 1]
    assert previous['objectSha256'] == sha(old_object) == base['frozenFiles'][old_object]
    dependencies = shlex.split(dep_path.read_text().replace('\\\n', ' ').split(':', 1)[1])
    assert len({str(Path(p).resolve()) for p in dependencies}) == 94
    pins = dict(base['frozenFiles'])
    pins.update(extra_pins)
    replacements = {}
    old_source_dir = Path(old_source).parent
    for name in ['AuxDevelopmentWorkerHost.cc', 'AuxRuntimeCacheAsync.inc', 'AuxRuntimeCacheInspection.inc', 'AuxRuntimeCachePins.inc', 'AuxRuntimeMutablePins.inc']:
        src = old_source_dir / name
        dst = HERE / 'source' / name
        assert sha(src) == base['frozenFiles'][str(src)]
        assert str(src.resolve()) in {str(Path(p).resolve()) for p in dependencies}
        content = src.read_bytes()
        if name == 'AuxRuntimeCacheInspection.inc':
            assert sha(src) == overlay['inputSha256']
            before = content.decode()
            text = before
            for change in overlay['changes']:
                assert text.count(change['old']) == change['count'] == 1
                text = text.replace(change['old'], change['new'])
            content = text.encode()
            assert hashlib.sha256(content).hexdigest() == overlay['outputSha256'] == sha(cleanup / overlay['output'])
            (HERE / 'change.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True), text.splitlines(True), fromfile='a/AuxRuntimeCacheInspection.inc', tofile='b/AuxRuntimeCacheInspection.inc')))
        dst.parent.mkdir(exist_ok=True)
        dst.write_bytes(content)
        replacements[str(src)] = str(dst)
        pins[str(dst)] = sha(dst)
    for path in [base_path, compile_path, dep_path, link_path, Path(base['output']) / 'Aux Daemon', old_recipe / 'plan.json', old_recipe / 'run.py', helper, lock]:
        pins[str(path)] = sha(path)
    for path in dependencies:
        assert path in base['frozenFiles'] or str(Path(path).resolve()) in {str(Path(p).resolve()) for p in base['frozenFiles']}
        digest = sha(path)
        matching = [value for p, value in base['frozenFiles'].items() if str(Path(p).resolve()) == str(Path(path).resolve())]
        assert matching and all(value == digest for value in matching)
        pins[path] = digest
    for path, digest in pins.items():
        assert sha(path) == digest, 'Changed a2 input: ' + path
    for path in [compile_command[0], base['commands'][0][0], base['dyldInfo'], base['otool'], base['nm']]:
        assert path in pins and sha(path) == pins[path]
    out = Path('/private/tmp/aux-runtime-cache-async-object-20261023-a3')
    link_out = Path('/private/tmp/aux-runtime-cache-async-link-20261023-a3')
    assert not out.exists() and not link_out.exists()
    for flag, value in [('-c', replacements[old_source]), ('-o', str(out / 'worker-host.o')), ('-MF', str(out / 'worker-host.d'))]:
        assert compile_command.count(flag) == 1
        compile_command[compile_command.index(flag) + 1] = value
    assert len(base['commands']) == 1
    command = base['commands'][0].copy()
    assert command.count(old_object) == 1
    command[command.index(old_object)] = str(out / 'worker-host.o')
    command[command.index('-module-cache-path') + 1] = str(link_out / 'swift-cache')
    command[command.index('-o') + 1] = str(link_out / 'Aux Daemon')
    swifts = [p for p in command if p.endswith('.swift')]
    objects = [p for p in command if p.endswith('.o')]
    assert len(swifts) == 48 and len(objects) == 12
    plan = dict(format='aux.runtime-cache-async-relink.plan.v1', status='prepared-not-executed',
                predecessor='successful serialized a2', baseManifest=str(base_path),
                baseLinkReceipt=str(link_path), baseCompileReceipt=str(compile_path),
                baseDependencyFile=str(dep_path), nativeBuildLockRunner=str(lock), linkChecker=str(helper),
                oldSource=old_source, newSource=replacements[old_source], oldObject=old_object,
                objectOutput=str(out), linkOutput=str(link_out), compileCommand=compile_command,
                linkCommand=command, frozenFiles=pins, compileDependencies=dependencies,
                dependencyReplacements=replacements, expectedCanonicalDependencyCount=94,
                cleanupOverlay=overlay, cleanupManifest=str(cleanup_manifest_path),
                unchangedSwiftSources=swifts, unchangedNativeObjects=[p for p in objects if p != str(out / 'worker-host.o')],
                swiftSourceCount=48, nativeObjectCount=12, nativeObjectReplacements=1,
                historicalNonNativeCollateral=json.loads((old_recipe / 'plan.json').read_text())['historicalNonNativeCollateral'],
                productSigned=False, productExecuted=False, policyActivated=False,
                acceptedAppChanged=False, fullWriterIsolationProven=False, runResult=None)
    plan_path = HERE / 'plan.json'
    plan_path.write_text(json.dumps(plan, indent=2) + '\n')
    for path in [HERE / 'prepare.py', HERE / 'run.py']:
        ast.parse(path.read_text())
    (HERE / 'runner-inputs.json').write_text(json.dumps(dict(format='aux.runtime-cache-async-runner-pins.v1', files={str(p): sha(p) for p in [HERE / 'prepare.py', HERE / 'run.py', plan_path]}), indent=2) + '\n')
    manifest = dict(format='aux.runtime-cache-fd-cleanup-relink.proposal.v1', status='prepared-not-executed',
                    files={str(p.relative_to(HERE)): sha(p) for p in sorted(HERE.rglob('*')) if p.is_file() and p != HERE / 'manifest.json'},
                    inputInspectionSha256=overlay['inputSha256'], outputInspectionSha256=overlay['outputSha256'],
                    changedSourceFiles=1, canonicalDependencyCount=94, nativeInputsVerified=len(pins),
                    compiled=False, linked=False, executed=False, signed=False)
    (HERE / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(dict(prepared=str(HERE), pinsVerified=len(pins), canonicalDependencies=94, changedSourceFiles=1, compiled=False, linked=False)))


if __name__ == '__main__':
    main()

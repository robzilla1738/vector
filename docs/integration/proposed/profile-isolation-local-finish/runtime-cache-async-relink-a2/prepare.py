#!/usr/bin/env python3
"""Pin actual predecessor inputs and prepare commands; never invokes a compiler."""
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
    assert len(sys.argv) <= 3
    overlay_dir = Path(sys.argv[1]).resolve() if len(sys.argv) >= 2 else ROOT / 'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-integration'
    overlay_manifest_path = overlay_dir / 'manifest.json'
    overlay_manifest = json.loads(overlay_manifest_path.read_text())
    assert overlay_manifest['format'] == 'aux.runtime-cache-async-integration.v1'
    overlay_pins = {str(overlay_manifest_path): sha(overlay_manifest_path)}
    for item in overlay_manifest['files']:
        path = overlay_dir / item['path']
        assert sha(path) == item['sha256'], 'Changed overlay file: ' + str(path)
        overlay_pins[str(path)] = item['sha256']
    host_overlay = json.loads((overlay_dir / 'host-overlay.json').read_text())
    mutation_dir = Path(sys.argv[2]).resolve() if len(sys.argv) == 3 else ROOT / 'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-package-mutations'
    mutation_manifest_path = mutation_dir / 'manifest.json'
    mutation_manifest = json.loads(mutation_manifest_path.read_text())
    assert mutation_manifest['format'] == 'aux.runtime-cache-package-mutations.v1'
    mutation_pins = {str(mutation_manifest_path): sha(mutation_manifest_path)}
    for item in mutation_manifest['files']:
        path = mutation_dir / item['path']
        assert sha(path) == item['sha256'], 'Changed mutation overlay: ' + str(path)
        mutation_pins[str(path)] = item['sha256']
    mutation_overlay = json.loads((mutation_dir / 'overlay.json').read_text())
    assert mutation_overlay['format'] == 'aux.runtime-package-mutation-overlay.v1'
    evidence = json.loads((HERE / 'a1-evidence.json').read_text())
    for original, item in evidence['files'].items():
        assert sha(original) == item['sha256'] == sha(HERE / item['copy']), 'Changed a1 evidence: ' + original
    path_adaptations = json.loads((HERE / 'path-adaptations.json').read_text())
    base_path = ROOT / 'docs/integration/proposed/profile-isolation-protected-startup/integration/daemon-inputs.json'
    link_receipt = base_path.with_name('daemon-link.json')
    compile_path = Path('/private/tmp/aux-awaited-writes-native-20261023-r3/results.json')
    dep = compile_path.with_name('worker-host.d')
    fix_path = ROOT / 'docs/integration/proposed/profile-isolation-local-finish/runtime-host-registration-count/manifest.json'
    patch = fix_path.with_name('change.patch')
    helper = ROOT / 'docs/integration/proposed/profile-isolation-continuation/build/link-daemon.py'
    lock = ROOT / 'scripts/native-build.py'
    base = json.loads(base_path.read_text())
    compile_receipt = json.loads(compile_path.read_text())
    fix = json.loads(fix_path.read_text())
    link = json.loads(link_receipt.read_text())
    assert link['passed'] and link['manifestSha256'] == sha(base_path)
    assert link['recipeSha256'] == sha(helper) and compile_receipt['exitCode'] == 0
    old_source = fix['input']
    old_object = compile_receipt['command'][compile_receipt['command'].index('-o') + 1]
    assert sha(old_source) == fix['inputSha256']
    assert sha(old_object) == compile_receipt['objectSha256'] == base['frozenFiles'][old_object]
    assert sha(patch) == fix['patchSha256']
    text = Path(old_source).read_text()
    assert text.count(fix['old']) == fix['count'] == 1
    source = HERE / 'source/AuxDevelopmentWorkerHost.cc'
    source.parent.mkdir(exist_ok=True)
    source.write_text(text.replace(fix['old'], fix['new']))
    assert sha(source) == fix['outputSha256'] == host_overlay['baseAfterCountFixSha256']
    assert fix['inputSha256'] == host_overlay['originalSha256']
    projected = source.read_text()
    for change in host_overlay['changes']:
        assert projected.count(change['old']) == change['count'] == 1
        projected = projected.replace(change['old'], change['new'])
    source.write_text(projected)
    assert sha(source) == host_overlay['outputSha256'] == sha(overlay_dir / 'source/AuxDevelopmentWorkerHost.cc')
    assert sha(source) == path_adaptations['inputSha256']
    for change in path_adaptations['changes']:
        assert projected.count(change['old']) == change['count'] == 1
        assert sha(change['canonicalHeader']) == change['headerSha256']
        projected = projected.replace(change['old'], change['new'])
    source.write_text(projected)
    assert sha(source) == path_adaptations['outputSha256']
    additional_dependencies = []
    for name in ['AuxRuntimeCacheInspection.inc', 'AuxRuntimeCachePins.inc', 'AuxRuntimeCacheAsync.inc']:
        target = source.parent / name
        target.write_bytes((overlay_dir / 'source' / name).read_bytes())
        additional_dependencies.append(str(target))
    inspection = source.parent / 'AuxRuntimeCacheInspection.inc'
    assert sha(inspection) == mutation_overlay['inputInspectionSha256']
    inspection_text = inspection.read_text()
    for change in mutation_overlay['changes']:
        assert change['count'] > 0 and inspection_text.count(change['old']) == change['count']
        inspection_text = inspection_text.replace(change['old'], change['new'])
    inspection.write_text(inspection_text)
    assert sha(inspection) == mutation_overlay['outputInspectionSha256'] == sha(mutation_dir / 'source/AuxRuntimeCacheInspection.inc')
    assert mutation_overlay['addedInclude'] == 'AuxRuntimeMutablePins.inc'
    mutable_include = source.parent / mutation_overlay['addedInclude']
    mutable_include.write_bytes((mutation_dir / 'source' / mutation_overlay['addedInclude']).read_bytes())
    assert sha(mutable_include) == mutation_overlay['addedIncludeSha256']
    additional_dependencies.append(str(mutable_include))
    dependencies = shlex.split(dep.read_text().replace('\\\n', ' ').split(':', 1)[1])
    assert len(dependencies) == 92 and all(Path(p).is_absolute() for p in dependencies)
    for change in path_adaptations['changes']:
        aliases = [path for path in dependencies if str(Path(path).resolve()) == change['canonicalHeader']]
        assert len(aliases) == 2
        assert all(sha(path) == change['headerSha256'] for path in aliases)
    pins = dict(base['frozenFiles'])
    pins.update({change['canonicalHeader']: change['headerSha256'] for change in path_adaptations['changes']})
    for original, item in evidence['files'].items():
        pins[original] = item['sha256']
        pins[str(HERE / item['copy'])] = item['sha256']
    pins[str(HERE / 'a1-evidence.json')] = sha(HERE / 'a1-evidence.json')
    pins[str(HERE / 'path-adaptations.json')] = sha(HERE / 'path-adaptations.json')
    pins.update(overlay_pins)
    pins.update(mutation_pins)
    pins.update({path: sha(path) for path in additional_dependencies})
    collateral = []
    for path, digest in compile_receipt['files'].items():
        if path in dependencies:
            if path in pins:
                assert pins[path] == digest
            pins[path] = digest
        else:
            collateral.append(dict(path=path, historicalSha256=digest,
                                   currentSha256=sha(path), linkedOrCompiled=False,
                                   preservedByThisRecipe=False))
    for path in [base_path, link_receipt, compile_path, dep, fix_path, patch, helper, lock, source]:
        pins[str(path)] = sha(path)
    for path in dependencies:
        digest = sha(path)
        if path in pins:
            assert pins[path] == digest, 'Changed dependency: ' + path
        pins[path] = digest
    for path, digest in pins.items():
        assert sha(path) == digest, 'Changed native input: ' + path
    for path in [compile_receipt['command'][0], base['commands'][0][0], base['dyldInfo'], base['otool'], base['nm']]:
        pins[path] = sha(path)
    obj_out = Path('/private/tmp/aux-runtime-cache-async-object-20261023-a2')
    link_out = Path('/private/tmp/aux-runtime-cache-async-link-20261023-a2')
    assert not obj_out.exists() and not link_out.exists()
    compile_command = compile_receipt['command'].copy()
    for flag, value in [('-c', str(source)), ('-o', str(obj_out / 'worker-host.o')), ('-MF', str(obj_out / 'worker-host.d'))]:
        assert compile_command.count(flag) == 1
        compile_command[compile_command.index(flag) + 1] = value
    assert len(base['commands']) == 1
    command = base['commands'][0].copy()
    assert command.count(old_object) == 1
    command[command.index(old_object)] = str(obj_out / 'worker-host.o')
    command[command.index('-module-cache-path') + 1] = str(link_out / 'swift-cache')
    command[command.index('-o') + 1] = str(link_out / 'Aux Daemon')
    swifts = [p for p in command if p.endswith('.swift')]
    objects = [p for p in command if p.endswith('.o')]
    assert len(swifts) == 48 and len(objects) == 12
    plan = dict(format='aux.runtime-cache-async-relink.plan.v1', status='prepared-not-executed',
                baseManifest=str(base_path), baseLinkReceipt=str(link_receipt),
                baseCompileReceipt=str(compile_path), baseDependencyFile=str(dep),
                countPatchManifest=str(fix_path), countPatch=str(patch),
                nativeBuildLockRunner=str(lock), linkChecker=str(helper),
                oldSource=old_source, newSource=str(source), oldObject=old_object,
                objectOutput=str(obj_out), linkOutput=str(link_out),
                compileCommand=compile_command, linkCommand=command, frozenFiles=pins,
                compileDependencies=dependencies, additionalCompileDependencies=additional_dependencies,
                hostOverlayManifest=str(overlay_manifest_path), hostOverlayChanges=host_overlay['changes'],
                packageMutationManifest=str(mutation_manifest_path), packageMutationOverlay=mutation_overlay,
                pathAdaptations=path_adaptations, preservedFailedAttempt=str(HERE / 'a1-evidence.json'),
                historicalNonNativeCollateral=collateral,
                dependencyPinsMeaning='Current bytes of the actual prior compiler dependency list; previously receipted bytes separately verified where supplied. Not a new historical compile receipt.',
                unchangedSwiftSources=swifts,
                unchangedNativeObjects=[p for p in objects if p != str(obj_out / 'worker-host.o')],
                swiftSourceCount=48, nativeObjectCount=12, nativeObjectReplacements=1,
                productSigned=False, productExecuted=False, policyActivated=False,
                acceptedAppChanged=False, fullWriterIsolationProven=False, runResult=None)
    plan_path = HERE / 'plan.json'
    plan_path.write_text(json.dumps(plan, indent=2) + '\n')
    for path in [HERE / 'prepare.py', HERE / 'run.py']:
        ast.parse(path.read_text())
    runner_inputs = dict(format='aux.runtime-host-registration-runner-pins.v1',
                        files={str(path): sha(path) for path in [HERE / 'run.py', HERE / 'prepare.py', plan_path]})
    (HERE / 'runner-inputs.json').write_text(json.dumps(runner_inputs, indent=2) + '\n')
    source_patch = ''.join(difflib.unified_diff(
        text.splitlines(True), source.read_text().splitlines(True),
        fromfile='a/AuxDevelopmentWorkerHost.cc', tofile='b/AuxDevelopmentWorkerHost.cc'))
    (HERE / 'change.patch').write_text(source_patch)
    proposal = dict(format='aux.runtime-cache-async-relink.proposal.v1',
                    status='prepared-not-executed', input=old_source,
                    inputSha256=sha(old_source), output='source/AuxDevelopmentWorkerHost.cc',
                    outputSha256=sha(source), replacementCount=6, addedIncludes=additional_dependencies,
                    files={str(path.relative_to(HERE)): sha(path)
                           for path in sorted(HERE.rglob('*'))
                           if path.is_file() and path != HERE / 'manifest.json'},
                    checks=dict(pythonSyntaxParsed=True, exactCountPatch=True, exactAsyncOverlay=True, exactHeaderPathAdaptations=True, exactPackageMutationOverlay=True,
                                nativeInputsVerified=len(pins),
                                compilerDependencyPathsPinned=len(dependencies),
                                unchangedSwiftSources=48, unchangedOtherNativeObjects=11),
                    compiled=False, linked=False, executed=False, signed=False,
                    fullWriterIsolationProven=False)
    (HERE / 'manifest.json').write_text(json.dumps(proposal, indent=2) + '\n')
    print(json.dumps(dict(prepared=str(HERE), pinsVerified=len(pins), compileDependencies=len(dependencies),
                          sourceSha256=sha(source), swiftSourcesPreserved=48,
                          otherNativeObjectsPreserved=11, compiled=False, linked=False)))


if __name__ == '__main__':
    main()

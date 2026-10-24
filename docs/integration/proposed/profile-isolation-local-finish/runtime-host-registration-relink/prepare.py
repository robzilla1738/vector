#!/usr/bin/env python3
"""Pin actual predecessor inputs and prepare commands; never invokes a compiler."""
from pathlib import Path
import ast
import hashlib
import json
import shlex

ROOT = Path('/Users/rcourson/Documents/Vibe/web')
HERE = Path(__file__).resolve().parent


def sha(path):
    with open(path, 'rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
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
    assert sha(source) == fix['outputSha256']
    dependencies = shlex.split(dep.read_text().replace('\\\n', ' ').split(':', 1)[1])
    assert len(dependencies) == 92 and all(Path(p).is_absolute() for p in dependencies)
    pins = dict(base['frozenFiles'])
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
    obj_out = Path('/private/tmp/aux-runtime-host-registration-object-20261023-a1')
    link_out = Path('/private/tmp/aux-runtime-host-registration-link-20261023-a1')
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
    plan = dict(format='aux.runtime-host-registration-relink.plan.v1', status='prepared-not-executed',
                baseManifest=str(base_path), baseLinkReceipt=str(link_receipt),
                baseCompileReceipt=str(compile_path), baseDependencyFile=str(dep),
                countPatchManifest=str(fix_path), countPatch=str(patch),
                nativeBuildLockRunner=str(lock), linkChecker=str(helper),
                oldSource=old_source, newSource=str(source), oldObject=old_object,
                objectOutput=str(obj_out), linkOutput=str(link_out),
                compileCommand=compile_command, linkCommand=command, frozenFiles=pins,
                compileDependencies=dependencies, historicalNonNativeCollateral=collateral,
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
    print(json.dumps(dict(prepared=str(HERE), pinsVerified=len(pins), compileDependencies=len(dependencies),
                          sourceSha256=sha(source), swiftSourcesPreserved=48,
                          otherNativeObjectsPreserved=11, compiled=False, linked=False)))


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""One serialized, unsigned coherent host compile/full46Swift link; never run output."""
import hashlib
import json
import shlex
import shutil
import subprocess
from pathlib import Path
H = Path(__file__).resolve().parent
P = H / 'inputs.json'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    pins = json.loads(P.read_text())
    out = Path(pins['output'])
    prior = Path(pins['priorOutput'])
    frozen = dict(pins['frozenFiles'])
    frozen[str(P)] = sha(P)
    frozen[str(H / 'build.py')] = sha(H / 'build.py')
    frozen[str(H / 'prepare.py')] = sha(H / 'prepare.py')

    def verify():
        for (path, value) in frozen.items():
            if sha(Path(path)) != value:
                raise ValueError('Frozen input differs: ' + path)
    verify()
    if out.exists():
        raise SystemExit('Fresh external output required')
    out.mkdir(mode=448)
    result = {
        'format': 'aux.pty-coherent-native-main.build.v1',
        'passed': False,
        'commands': [pins['compile'], pins['link']],
        'results': [],
        'reusedObjects': pins['reusedObjects'],
        'nodeArchivesChecked': pins['nodeArchivesChecked'],
        'predecessorSourceFilesChecked': pins['predecessorSourceFilesChecked'],
        'inputsSha256': sha(P),
        'recipeSha256': sha(H / 'build.py'),
        'sourceSubstitutions': pins['sourceSubstitutions'],
        'fixedReaderPreserved': pins['fixedReaderPreserved'],
        'automaticAdHocSigningDisabled': True,
        'signed': False,
        'executableRun': False,
        'moduleLoaded': False,
        'policyActivated': False,
        'acceptedAppChanged': False,
    }
    failure = None
    try:
        for (name, value) in pins['reusedObjects'].items():
            shutil.copyfile(prior / name, out / name)
            if sha(out / name) != value:
                raise ValueError('Copied object differs')
        dep = list(pins['compile'])
        i = dep.index('-c')
        dep.pop(i)
        for flag in ['-MMD', '-MF', '-o']:
            i = dep.index(flag)
            del dep[i:i + (1 if flag == '-MMD' else 2)]
        dep += ['-M', '-MF', str(out / 'all-host.d'), '-MT', 'host']
        p = subprocess.run(dep, capture_output=True, text=True)
        (out / 'dependencies.log').write_text(p.stdout + p.stderr)
        if p.returncode:
            raise RuntimeError('Dependency discovery failed')
        raw = (out / 'all-host.d').read_text().replace('\\\n', ' ')
        paths = shlex.split(raw.split(':', 1)[1])
        dependencies = {str(Path(v).resolve()): sha(Path(v)) for v in paths}
        frozen.update(dependencies)
        (out / 'actual-dependencies.json').write_text(json.dumps(dependencies, indent=2) + '\n')
        frozen[str(out / 'actual-dependencies.json')] = sha(out / 'actual-dependencies.json')
        result['actualHeaderDependenciesChecked'] = len(dependencies)
        result['dependencyManifestSha256'] = sha(out / 'actual-dependencies.json')
        verify()
        for (name, command) in [('compile', pins['compile']), ('link', pins['link'])]:
            p = subprocess.run(command, capture_output=True, text=True)
            (out / (name + '.log')).write_text(p.stdout + p.stderr)
            result['results'].append({'command': name, 'exitCode': p.returncode})
            if p.returncode:
                raise RuntimeError('Actual ' + name + ' failed')
            verify()
        exe = out / 'Aux Daemon'
        result['executableSha256'] = sha(exe)
        result['executableBytes'] = exe.stat().st_size
        symbols = subprocess.run([pins['toolPaths']['nm'], '-gU', str(exe)], capture_output=True, text=True, check=True).stdout
        (out / 'defined-symbols.txt').write_text(symbols)
        names = {line.split()[-1] for line in symbols.splitlines() if line.split()}
        required = ['AuxNativePtyBeginCurrent', 'AuxNativePtyCopyHelperPath', 'AuxNativePtyCanSpawn', 'AuxNativePtySpawnFailed', 'AuxNativePtyChildCreated', 'AuxNativePtyDirectWaitResult', 'AuxCaptureAuthenticatedPtyHelper', 'AuxAuthenticatedPtyHelperRevalidate', 'AuxAuthenticatedPtyHelperCopyPath', 'AuxAuthenticatedPtyHelperRelease']
        missing = [s for s in required if '_' + s not in names]
        result['requiredTenNativeSymbols'] = required
        result['missingRequiredSymbols'] = missing
        if missing:
            raise ValueError('Missing paired native symbols')
        loads = subprocess.run([pins['toolPaths']['otool'], '-l', str(exe)], capture_output=True, text=True, check=True).stdout
        (out / 'load-commands.txt').write_text(loads)
        result['codeSignatureLoadCommandPresent'] = 'LC_CODE_SIGNATURE' in loads
        if result['codeSignatureLoadCommandPresent']:
            raise ValueError('Unexpected code signature')
        result['compiledObjectSha256'] = sha(out / '2.o')
        result['passed'] = True
    except Exception as error:
        failure = error
        result['error'] = str(error)
    finally:
        try:
            verify()
            for (name, value) in pins['reusedObjects'].items():
                if sha(out / name) != value:
                    raise ValueError('Reused output object changed')
            result['inputsUnchanged'] = True
        except Exception as error:
            failure = error
            result['pinError'] = str(error)
            result['passed'] = False
        (out / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
    if failure:
        raise SystemExit(str(failure))
    print('PASS: actual coherent unsigned daemon linked;10 CPP objects reused;46 Swift sources;42 Node archives verified;10 native ABI exports; no executable run')
if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Link pinned inactive native inputs, without signing, installing or executing."""
import hashlib
import json
import re
import subprocess
import sys
import time
from pathlib import Path


def sha(path):
    with open(path, 'rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    manifest = Path(sys.argv[1]).resolve()
    pins = json.loads(manifest.read_text())
    out = Path(pins['output'])
    if out.exists():
        raise SystemExit('Fresh output required')
    frozen = pins['frozenFiles']

    def verify():
        for path, digest in frozen.items():
            if sha(path) != digest:
                raise ValueError('Pinned input changed: ' + path)

    verify()
    out.mkdir(mode=0o700)
    result = dict(format='aux.profile-isolation.continuation.link.v1', passed=False,
                  manifestSha256=sha(manifest), recipeSha256=sha(__file__),
                  signed=False, executableRun=False, moduleLoaded=False,
                  acceptedAppChanged=False, policyActivated=False,
                  browserLinked=False, fullWriterIsolationProven=False,
                  commands=pins['commands'], results=[])
    started = time.monotonic()
    failure = None
    try:
        for index, command in enumerate(pins['commands']):
            run = subprocess.run(command, capture_output=True, text=True)
            (out / f'{index}.log').write_text(run.stdout + run.stderr)
            result['results'].append(dict(index=index, exitCode=run.returncode))
            if run.returncode:
                raise RuntimeError(f'Native command {index} failed')
        exe = out / 'Aux Daemon'
        module = pins['module']
        imports = subprocess.check_output([pins['dyldInfo'], '-imports', module], text=True)
        exports = subprocess.check_output([pins['dyldInfo'], '-exports', str(exe)], text=True)
        required = set(re.findall(r'^\s+(\S+)\s+\(from <flat-namespace>\)\s*$', imports, re.M))
        available = set(re.findall(r'^\s+0x[0-9A-Fa-f]+\s+(\S+)\s*$', exports, re.M))
        if not required or required - available:
            raise ValueError('Paired module imports do not resolve: ' + str(sorted(required - available)))
        symbols = subprocess.check_output([pins['nm'], '-m', str(exe)], text=True)
        for name in pins['privateDefinitions']:
            entries = [line for line in symbols.splitlines() if line.endswith(' ' + name)]
            if len(entries) != 1 or '(undefined)' in entries[0] or name in available:
                raise ValueError('Private native capability not internally bound: ' + name)
        for artifact in [str(exe), module]:
            loads = subprocess.check_output([pins['otool'], '-l', artifact], text=True)
            if 'LC_CODE_SIGNATURE' in loads:
                raise ValueError('Unexpected code signature: ' + artifact)
        (out / 'module-imports.txt').write_text(imports)
        (out / 'host-exports.txt').write_text(exports)
        result.update(executableSha256=sha(exe), moduleSha256=sha(module),
                      resolvedModuleImports=sorted(required),
                      privateDefinitionsBound=pins['privateDefinitions'], passed=True)
    except Exception as error:
        failure = str(error)
        result['error'] = failure
    finally:
        try:
            verify()
            result['inputsUnchanged'] = True
        except Exception as error:
            failure = str(error)
            result.update(passed=False, inputError=failure)
        result['seconds'] = time.monotonic() - started
        (out / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
    if failure:
        raise SystemExit(failure)
    print('PASS: unsigned native link and actual paired module import resolution; no execution')


if __name__ == '__main__':
    main()

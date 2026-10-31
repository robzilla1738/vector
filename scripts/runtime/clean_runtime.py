#!/usr/bin/env python3
"""Takes this machine and the supplier out of a staged agent runtime, before its pins are rewritten.

    python3 scripts/runtime/clean_runtime.py <agent-runtime> <python>

<python> is the runtime's own interpreter. Prints the changed paths as JSON, relative to the runtime;
assembly passes them to repin_runtime. Every .pyc is recompiled from the .py beside it with a
relative source path, so tracebacks and strings name no build folder. They stay unchecked-hash: a
seeded runtime's files are never edited, and file times change as it's copied.
"""
import json
import subprocess
import sys
from pathlib import Path

WORDING = [('prepare-python.py', 'Aside: could not clear quarantine', 'Aux: could not clear quarantine')]

RECOMPILE = r'''
import json, os, py_compile, sys
runtime = sys.argv[1]
changed, sourceless = [], []
tag = sys.implementation.cache_tag
for folder, _, names in os.walk(runtime):
    if os.path.basename(folder) != '__pycache__':
        continue
    for name in names:
        parts = name.split('.')
        if not name.endswith('.pyc') or tag not in parts:
            continue
        stem = '.'.join(parts[:parts.index(tag)])
        level = parts[parts.index(tag) + 1] if len(parts) > parts.index(tag) + 2 else ''
        target = os.path.join(folder, name)
        source = os.path.join(os.path.dirname(folder), stem + '.py')
        if not os.path.isfile(source):
            sourceless.append(os.path.relpath(target, runtime))
            continue
        relative = os.path.relpath(source, runtime)
        before = open(target, 'rb').read()
        mode = os.stat(target).st_mode
        os.chmod(target, mode | 0o200)
        py_compile.compile(source, cfile=target, dfile=relative, doraise=True, optimize=int(level[4:]) if level else 0,
                           invalidation_mode=py_compile.PycInvalidationMode.UNCHECKED_HASH)
        os.chmod(target, mode)
        if open(target, 'rb').read() != before:
            changed.append(os.path.relpath(target, runtime))
print(json.dumps({'changed': changed, 'sourceless': sourceless}))
'''


def clean_runtime(runtime: Path, python: Path) -> list:
    changed = []
    for name, find, replace in WORDING:
        path = runtime / name
        text = path.read_text()
        if text.count(find) != 1:
            raise SystemExit(f'{name}: expected one "{find}"')
        path.write_text(text.replace(find, replace))
        changed.append(name)
    result = json.loads(subprocess.run([python, '-I', '-S', '-B', '-c', RECOMPILE, runtime], capture_output=True, text=True, check=True).stdout)
    if result['sourceless']:
        raise SystemExit(f"compiled files with no source: {result['sourceless'][:5]}")
    return changed + result['changed']


if __name__ == '__main__':
    print(json.dumps(clean_runtime(Path(sys.argv[1]), Path(sys.argv[2]))))

#!/usr/bin/env python3
"""Future serialized, isolated official Node static build. Not executed by review."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tarfile

ARCHIVE_SHA = '0e179470097e247a0c0769b77cc1359fc3e1baf0686df89bafe1fb48cb1887f4'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    archive = args.archive.resolve(strict=True)
    output = args.output.resolve()
    if sha(archive) != ARCHIVE_SHA or output.exists():
        raise SystemExit('Exact official source archive and fresh output required')
    output.mkdir(parents=True)
    with tarfile.open(archive) as source:
        source.extractall(output, filter='data')
    tree = output / 'node-v26.5.0'
    # Default bundled dependency graph, snapshot and code-cache remain enabled.
    # --enable-static is the intentional change from the official executable.
    subprocess.run([sys.executable, 'configure', '--enable-static', '--dest-cpu=arm64'],
                   cwd=tree, check=True)
    subprocess.run(['make', '-j2'], cwd=tree, check=True)
    proposal = Path(__file__).resolve().parent
    component = proposal / 'source/AuxNativeEnvironmentPreload.cc'
    worker_headers = proposal.parent / 'aux-native-fresh-runtime-provider-quarantine/source'
    component_object = output / 'AuxNativeEnvironmentPreload.o'
    subprocess.run([
        'xcrun', 'clang++', '-std=c++20', '-arch', 'arm64',
        '-mmacosx-version-min=13.0', '-DNAPI_VERSION=8', '-fPIC',
        '-I', str(tree / 'src'), '-I', str(tree / 'deps/v8/include'),
        '-I', str(tree / 'deps/uv/include'), '-I', str(worker_headers),
        '-c', str(component), '-o', str(component_object),
    ], check=True)
    archives = sorted((tree / 'out/Release').rglob('*.a'))
    if not archives or not any(path.name == 'libnode.a' for path in archives):
        raise SystemExit('Static Node/dependency archive graph missing')
    receipt = {
        'format': 'aux.node-static.build.v1',
        'sourceArchiveSha256': ARCHIVE_SHA,
        'configure': ['--enable-static', '--dest-cpu=arm64'],
        'jobs': 2,
        'archives': [{'path': str(path.relative_to(tree)), 'sha256': sha(path)}
                     for path in archives],
        'configSha256': sha(tree / 'config.gypi'),
        'suppliedRuntimeReplaced': False,
        'preloadSourceSha256': sha(component),
        'preloadObjectSha256': sha(component_object),
        'embeddingLinked': False,
        'protectedExecution': False,
    }
    (output / 'static-build-receipt.json').write_text(
        json.dumps(receipt, indent=2) + '\n')

if __name__ == '__main__':
    main()

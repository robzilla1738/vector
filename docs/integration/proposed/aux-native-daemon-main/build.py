#!/usr/bin/env python3
"""Prepare or build the inactive executable; never run it or build Node itself."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
SOURCE_ARCHIVE = '0e179470097e247a0c0769b77cc1359fc3e1baf0686df89bafe1fb48cb1887f4'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node-tree', type=Path, required=True)
    parser.add_argument('--node-receipt', type=Path, required=True)
    parser.add_argument('--node-receipt-sha256', required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--execute', action='store_true')
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or REPO == output or REPO in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    pins = json.loads((HERE / 'inputs.json').read_text())
    receipt = args.node_receipt.resolve(strict=True)
    tree = args.node_tree.resolve(strict=True)
    if sha(receipt) != args.node_receipt_sha256:
        raise SystemExit('Externally reviewed Node build receipt hash differs')
    node = json.loads(receipt.read_text())
    if node['sourceArchiveSha256'] != SOURCE_ARCHIVE or node['configure'] != [
            '--enable-static', '--dest-cpu=arm64']:
        raise SystemExit('Wrong Node source/configuration')
    archives = [tree / entry['path'] for entry in node['archives']]
    libnode = [path for path in archives if path.name == 'libnode.a']
    if len(libnode) != 1 or len(set(archives)) != len(archives):
        raise SystemExit('Exact distinct Node archive graph required')
    artifact_pins = {str(receipt): args.node_receipt_sha256,
                     str(tree / 'config.gypi'): node['configSha256']}
    for entry, path in zip(node['archives'], archives):
        if not path.resolve().is_relative_to(tree):
            raise SystemExit('Archive outside reviewed Node tree')
        artifact_pins[str(path)] = entry['sha256']

    def verify():
        for name, digest in pins['files'].items():
            if sha(REPO / name) != digest:
                raise ValueError('Source/header pin changed: ' + name)
        for section in ['externalStaticReferences', 'nodeLifecycleReferences']:
            for name, digest in pins[section].items():
                if sha(Path(name)) != digest:
                    raise ValueError('Static reference changed: ' + name)
        for name, digest in artifact_pins.items():
            if sha(Path(name)) != digest:
                raise ValueError('Reviewed Node build artifact changed: ' + name)
        # Exact public header contract authenticated independently of artifacts.
        if sha(tree / 'src/node.h') != pins['officialNodeHeaderSha256']:
            raise ValueError('Node public API differs')

    verify()
    includes = [HERE / 'source', tree / 'src', tree / 'deps/v8/include',
                tree / 'deps/uv/include']
    includes += [REPO / path for path in pins['includeDirectories']]
    cpp_commands = []
    objects = []
    for index, name in enumerate(pins['cppSources']):
        obj = output / (str(index) + '.o')
        command = ['xcrun', 'clang++', '-std=c++20', '-arch', 'arm64',
                   '-mmacosx-version-min=13.0', '-DNAPI_VERSION=8',
                   '-DAUX_ATOMIC_CSK_DISPATCH=1', '-fPIC']
        for directory in includes:
            command += ['-I', str(directory)]
        command += ['-c', str(REPO / name), '-o', str(obj)]
        cpp_commands.append(command)
        objects.append(str(obj))
    link = ['xcrun', 'swiftc', '-target', 'arm64-apple-macos13.0',
            '-module-cache-path', str(output / 'swift-cache'),
            '-module-name', 'AuxNativeDaemonExecutable']
    for define in pins['swiftDefines']:
        link += ['-D', define]
    for framework in ['Foundation', 'CoreFoundation', 'Security', 'AppKit',
                      'QuickLookThumbnailing', 'ImageIO']:
        link += ['-framework', framework]
    link += [str(REPO / name) for name in pins['swiftSources']] + objects
    # No Chromium/base objects or custom libc++ archives enter this graph.
    link += ['-Xlinker', '-force_load', '-Xlinker', str(libnode[0])]
    link += [str(path) for path in archives if path != libnode[0]]
    link += ['-Xlinker', '-export_dynamic', '-Xlinker', '-lc++', '-Xlinker', '-lbsm',
             '-o', str(output / 'Aux Daemon')]
    result = {'format': 'aux.native-daemon-main.build.v1', 'executed': args.execute,
              'nativeExecutableRun': False, 'signed': False,
              'commands': cpp_commands + [link], 'results': [],
              'nodeReceiptSha256': args.node_receipt_sha256, 'passed': False}
    failure = None
    try:
        if args.execute:
            for index, command in enumerate(result['commands']):
                process = subprocess.run(command, capture_output=True, text=True)
                (output / (str(index) + '.log')).write_text(process.stdout + process.stderr)
                result['results'].append(process.returncode)
                if process.returncode:
                    raise RuntimeError('Build command failed: ' + str(index))
            result['executableSha256'] = sha(output / 'Aux Daemon')
        result['passed'] = True
    except Exception as error:
        failure = error
        result['error'] = str(error)
    finally:
        try:
            verify()
            result['inputsUnchanged'] = True
        except Exception as error:
            failure = error
            result['passed'] = False
            result['pinError'] = str(error)
        (output / 'plan-or-build.json').write_text(json.dumps(result, indent=2) + '\n')
    if failure:
        raise SystemExit(str(failure))


if __name__ == '__main__':
    main()

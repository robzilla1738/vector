#!/usr/bin/env python3
"""Read Mach-O metadata only; never load the module or run the executable."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def mach_o(path, kind):
    header = path.read_bytes()[:32]
    if len(header) != 32:
        raise ValueError('Truncated Mach-O')
    magic, cpu, _, filetype, *_ = struct.unpack('<8I', header)
    if magic != 0xfeedfacf or cpu != 0x100000c or filetype != kind:
        raise ValueError('Expected thin arm64 Mach-O role')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--main', type=Path, required=True)
    parser.add_argument('--main-sha256', required=True)
    parser.add_argument('--module', type=Path, required=True)
    parser.add_argument('--module-sha256', required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--reference', action='store_true', help='Label the supplied historical runtime, not the new native executable')
    parser.add_argument('--module-reference', action='store_true', help='Module imports are from the original reference artifact, not future signed output')
    args = parser.parse_args()
    if args.output.exists():
        raise SystemExit('Fresh output required')
    expected = {args.main: args.main_sha256, args.module: args.module_sha256}
    for path, digest in expected.items():
        if sha(path) != digest:
            raise SystemExit('Reviewed artifact hash differs')
    mach_o(args.main, 2)
    mach_o(args.module, 8)
    tool = Path(subprocess.check_output(['xcrun', '--find', 'dyld_info'], text=True).strip())
    imports = subprocess.check_output([str(tool), '-imports', str(args.module)], text=True)
    exports = subprocess.check_output([str(tool), '-exports', str(args.main)], text=True)
    flat = set(re.findall(r'^\s+(\S+)\s+\(from <flat-namespace>\)\s*$', imports, re.M))
    if not flat or any(not symbol.startswith('_napi_') for symbol in flat):
        raise SystemExit('Review changed non-system module imports')
    available = set(re.findall(r'^\s+0x[0-9A-Fa-f]+\s+(_napi_[A-Za-z0-9_]+)\s*$', exports, re.M))
    missing = sorted(flat - available)
    for path, digest in expected.items():
        if sha(path) != digest:
            raise SystemExit('Artifact changed during metadata inspection')
    result = {'format': 'aux.pty.main-export-proof.v1', 'referenceOnly': args.reference,
              'moduleReference': args.module_reference,
              'mainSha256': args.main_sha256, 'moduleSha256': args.module_sha256,
              'dyldInfoSha256': sha(tool), 'requiredFlatImports': sorted(flat),
              'mainNapiExports': len(available), 'missing': missing, 'passed': not missing,
              'executableRun': False, 'moduleLoaded': False, 'nodeApiInitialized': False,
              'signedPolicyAccepted': False, 'nativeCustodyProven': False}
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    if missing:
        raise SystemExit('Actual executable is missing required Node-API exports')
    print(f'PASS: {len(flat)} actual module imports present in executable export trie; metadata only')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Inspect exact linked artifacts only; preserve the initial overly strict gate."""
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess

HERE = Path(__file__).resolve().parent


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    pins_path = HERE / 'metadata-inputs.json'
    pins = json.loads(pins_path.read_text())
    source_pins = json.loads((HERE / 'inputs.json').read_text())
    frozen = dict(source_pins['frozenFiles'])
    frozen.update(pins['frozenFiles'])
    frozen[str(pins_path)] = sha(pins_path)
    frozen[str(HERE / 'check-link.py')] = sha(HERE / 'check-link.py')
    frozen.update(json.loads(Path(pins['dependencyManifest']).read_text()))

    def verify():
        for path, expected in frozen.items():
            if sha(Path(path)) != expected:
                raise ValueError('Frozen input/artifact differs: ' + path)

    verify()
    prior_result = json.loads(Path(pins['initialReceipt']).read_text())
    if prior_result['results'] != [
        {'command': 'compile', 'exitCode': 0},
        {'command': 'link', 'exitCode': 0},
    ] or not prior_result['inputsUnchanged']:
        raise ValueError('Actual successful compile and full link required')
    if prior_result['error'] != 'Missing paired native symbols':
        raise ValueError('Retain the exact original metadata-gate failure')
    main_path = Path(pins['main'])
    module_path = Path(pins['module'])
    for path, kind in [(main_path, 2), (module_path, 8)]:
        header = path.read_bytes()[:32]
        magic, cpu, _, actual_kind, *_ = struct.unpack('<8I', header)
        if magic != 0xfeedfacf or cpu != 0x100000c or actual_kind != kind:
            raise ValueError('Thin arm64 Mach-O role required')
    tool = pins['tools']['dyld_info']
    imports = subprocess.check_output([tool, '-imports', str(module_path)], text=True)
    exports = subprocess.check_output([tool, '-exports', str(main_path)], text=True)
    flat = set(re.findall(
        r'^\s+(\S+)\s+\(from <flat-namespace>\)\s*$', imports, re.M))
    if flat != set(pins['expectedFlatImports']):
        raise ValueError('Unexpected or missing finite flat-namespace import')
    available = set(re.findall(
        r'^\s+0x[0-9A-Fa-f]+\s+(\S+)\s*$', exports, re.M))
    missing = sorted(flat - available)
    if missing:
        raise ValueError('Actual export trie lacks module imports: ' + repr(missing))
    native_symbols = subprocess.check_output(
        [pins['tools']['nm'], '-m', str(main_path)], text=True)
    undefined = subprocess.check_output(
        [pins['tools']['nm'], '-u', str(main_path)], text=True)
    for symbol in pins['swiftInternalDefinitions']:
        lines = [line for line in native_symbols.splitlines()
                 if line.endswith(' ' + symbol)]
        if len(lines) != 1 or 'non-external (was a private external)' not in lines[0]:
            raise ValueError('Expected actual bound internal Swift definition: ' + symbol)
        if symbol in undefined.split():
            raise ValueError('Swift capability remains undefined: ' + symbol)
    loads = subprocess.check_output(
        [pins['tools']['otool'], '-l', str(main_path)], text=True)
    if 'LC_CODE_SIGNATURE' in loads:
        raise ValueError('Unexpected executable code signature')
    verify()
    output = Path(pins['output'])
    if output.exists():
        raise ValueError('Fresh metadata evidence required')
    result = {
        'format': 'aux.pty.coherent-main.post-link-metadata.v1',
        'passed': True,
        'mainSha256': sha(main_path),
        'moduleSha256': sha(module_path),
        'initialReceiptSha256': sha(Path(pins['initialReceipt'])),
        'originalGateFailureWasExternalVisibilityExpectation': True,
        'actualCompileAndFullLinkPassed': True,
        'finiteRequiredModuleImports': sorted(flat),
        'sixPtyApisInActualExportTrie': pins['ptyImports'],
        'swiftInternalDefinitionsBound': pins['swiftInternalDefinitions'],
        'swiftCapabilityUndefined': False,
        'codeSignatureLoadCommandPresent': False,
        'frozenInputsAndDependenciesUnchanged': True,
        'executableRun': False,
        'moduleLoaded': False,
        'signedPolicyAccepted': False,
        'nativeCustodyProven': False,
        'recipeSha256': sha(HERE / 'check-link.py'),
        'metadataInputsSha256': sha(pins_path),
    }
    output.write_text(json.dumps(result, indent=2) + '\n')
    output.with_name('module-imports.txt').write_text(imports)
    output.with_name('main-exports.txt').write_text(exports)
    print('PASS: finite actual module imports match main export trie; four Swift definitions bound internally; metadata only')


if __name__ == '__main__':
    main()

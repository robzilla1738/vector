#!/usr/bin/env python3
"""Static byte/operand verification only; never loads the target or Security API."""
import argparse, hashlib, importlib.util, json, pathlib, re, struct
ROOT = pathlib.Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--addon', required=True)
    parser.add_argument('--sdk-header', required=True)
    options = parser.parse_args()
    manifest = json.loads((ROOT/'storage-evidence.json').read_text())
    binary_path = pathlib.Path(options.addon)
    assert binary_path.stat().st_size <= 32*1024*1024
    binary = binary_path.read_bytes()
    assert sha(binary) == manifest['binarySha256']
    spec = importlib.util.spec_from_file_location('instruction_evidence', ROOT/'../aux-native-pq-continuation/verify-continuation.py')
    evidence = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(evidence)
    codes = {}
    for artifact in manifest['artifacts']:
        data = (ROOT/artifact['path']).read_bytes()
        assert len(data) <= 512*1024 and sha(data) == artifact['sha256']
        code = evidence.parse(data)
        assert len(code) == artifact['instructionCount']
        assert min(code) == artifact['start'] and max(code)+4 == artifact['end']
        assert sorted(code) == list(range(artifact['start'],artifact['end'],4))
        for address, instruction in code.items():
            offset = evidence.mapped_offset(binary,address,4)
            assert binary[offset:offset+4] == instruction['bytes']
        codes[artifact['path']] = code
    for anchor in manifest['anchors']:
        item = codes[anchor['artifact']][anchor['address']]
        assert item['op']+'\t'+item['args'] == anchor['instruction']
        if 'blTarget' in anchor:
            word = struct.unpack('<I',item['bytes'])[0]
            assert word>>26 == 0b100101
            delta = word & 0x03ffffff
            if delta & 0x02000000: delta -= 0x04000000
            assert anchor['address'] + 4*delta == anchor['blTarget']
    source = (ROOT/'source/RecoveredInstallStorageQueries.swift').read_bytes()
    assert sha(source) == manifest['sourceSha256']
    # The port constructs descriptions/projections; it cannot dispatch operations.
    assert not re.search(rb'\b(?:SecItem(?:Add|Update|Delete|CopyMatching)|SecAccessControlCreateWithFlags)\s*\(',source)
    assert b'.privateKeyUsage' in source and b'case securityFailure(OSStatus)' in source
    header = pathlib.Path(options.sdk_header).read_bytes()
    assert sha(header) == manifest['sdkHeaderSha256']
    assert re.search(rb'kSecAccessControlPrivateKeyUsage\s+API_AVAILABLE\([^\n]+\) = 1u << 30',header)
    print('PASS: complete original function instructions, query/status/delete-before-add/ACL anchors, SDK flag, no Security executor. No target or Keychain execution.')

if __name__ == '__main__': main()

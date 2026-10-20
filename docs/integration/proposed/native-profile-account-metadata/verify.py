"""Verify original metadata admission, unchanged protected reader and patch replay."""
from pathlib import Path
import hashlib
import json
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
proof = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
arm = Path(proof['arm64']['path']).read_bytes()
assert sha(arm) == proof['arm64']['sha256']
for row in proof['functions']:
    start = int(row['rva'], 16)
    assert sha(arm[start:start + row['bytes']]) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
assert sha((root / 'evidence/worker.c').read_bytes()) == proof['rea']['pseudocodeSha256']
assert sha((root / 'evidence/registry-parser.c').read_bytes()) == proof['suppliedParser']['sha256']


def word(address):
    return struct.unpack_from('<I', arm, address)[0]


def branch(address):
    instruction = word(address)
    assert instruction & 0xfc000000 == 0x94000000
    delta = instruction & 0x3ffffff
    if delta & 0x2000000:
        delta -= 0x4000000
    return address + 4 * delta


assert branch(0x4652f2c) == 0x4100b88
assert word(0xc786ecc) == 0xb50004c8  #Existing key skips insertion; no assignment.
source = root / 'source/chrome/browser/aux/profile_state.cc'
baseline = root / 'baseline/chrome/browser/aux/profile_state.cc'
old = baseline.read_text()
new = source.read_text()
reader = old[old.index('std::optional<base::DictValue> ReadMetadata'):old.index('}  // namespace')]
assert reader in new
expected = old.replace(
    '  auto registry =\n      ReadMetadata(home.AppendASCII("accounts.json"), 4 * 1024 * 1024);',
    '  auto registry = ReadPrivateAccountRegistry(home);')
expected = expected.replace('}  // namespace\nProfileSecurityState ReadProfileSecurity',
    '}  // namespace\nstd::optional<base::DictValue> ReadPrivateAccountRegistry(\n'
    '    const base::FilePath& home) {\n'
    '  return ReadMetadata(home.AppendASCII("accounts.json"), 4 * 1024 * 1024);\n'
    '}\n\nProfileSecurityState ReadProfileSecurity')
assert new == expected  #All version, identity and security classification unchanged.
with tempfile.TemporaryDirectory(prefix='aux-account-metadata-') as directory:
    target = Path(directory)
    for row in manifest['files']:
        if row['newFile']:
            assert row['baselineSha256'] is None
            continue
        data = (root / 'baseline' / row['path']).read_bytes()
        assert sha(data) == row['baselineSha256']
        output = target / row['path']
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        assert sha((target / row['path']).read_bytes()) == row['outputSha256']
        assert (target / row['path']).read_bytes() == (root / 'source' / row['path']).read_bytes()
print('PASS: supplied metadata pins, exact protected reader preservation and4-file replay; gtests unexecuted')

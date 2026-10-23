#!/usr/bin/env python3
"""Check prepared source/patch pins without reading credentials or running entrypoints."""
import argparse
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, default=ROOT)
    source_root = parser.parse_args().source_root
    inputs = json.loads((HERE / 'inputs.json').read_text())
    for relative, expected in inputs['files'].items():
        if digest(ROOT / relative) != expected:
            raise SystemExit('Changed proposal file: ' + relative)
    for relative, expected in inputs['sourceDependencies'].items():
        if digest(source_root / relative) != expected:
            raise SystemExit('Changed application contract: ' + relative)
    sdk = inputs['installedPublicSdkDeclaration']
    sdk_path = source_root / sdk['path']
    assert digest(sdk_path) == sdk['sha256']
    assert 'By default this is set to false' in sdk_path.read_text()
    original = (HERE / 'baseline/cloud-recovery.mjs').read_text()
    successor = (HERE / 'source/cloud-recovery-online.mjs').read_text()
    patch = ''.join(difflib.unified_diff(original.splitlines(True), successor.splitlines(True),
        fromfile='baseline/cloud-recovery.mjs', tofile='source/cloud-recovery-online.mjs'))
    assert patch == (HERE / 'capture.patch').read_text()
    assert "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY" in successor
    assert "pg_export_snapshot()" in successor and "'--snapshot=' + snapshot" in successor
    assert 'quiescedByOperator' not in successor
    assert "assert(!flags.includes('--quiesced')" in successor
    assert successor.index("await db.query('COMMIT')") < successor.index("const result = await writeBundle(")
    assert "readOnlineSnapshotObjects(db)" in successor
    assert "onlineBlobEntries(objects, get, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com')" in successor
    module = (HERE / 'source/online-recovery-objects.mjs').read_text()
    assert "FROM aux_users WHERE avatar_path IS NOT NULL" in module
    assert "purpose<>'inference'" in module and 'LIMIT 100001' in module
    assert 'Readable.from(checkedSource())' in module and '.compose(' not in module
    assert 'observed_sha256 = digest' in module and 'size !== Number(advertised)' in module
    auth = (source_root / 'services/aux-cloud/src/auth.ts').read_text()
    old = "{access:'private',contentType:type,addRandomSuffix:false}"
    new = "{access:'private',contentType:type,addRandomSuffix:false,allowOverwrite:false}"
    assert auth.count(old) == 1
    avatar_patch = ''.join(difflib.unified_diff(auth.splitlines(True), auth.replace(old, new).splitlines(True),
        fromfile='a/services/aux-cloud/src/auth.ts', tofile='b/services/aux-cloud/src/auth.ts'))
    assert avatar_patch == (HERE / 'avatar-immutability.patch').read_text()
    print('PASS: exact online capture/SDK/schema/patch contracts; no provider, entrypoint or database execution')


if __name__ == '__main__':
    main()

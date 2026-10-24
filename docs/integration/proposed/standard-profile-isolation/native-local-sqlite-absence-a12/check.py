"""Exact patch replay and bounded checks of the actual pinned SQL statements."""
import hashlib
import json
import re
import sqlite3
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
root = Path(plan['nativeRoot'])
tree = Path(tempfile.mkdtemp(prefix='aux-local-absence-replay-', dir='/private/tmp'))
git = lambda *args: subprocess.run(['git', '-C', str(tree), *map(str, args)],
                                  check=True, capture_output=True)
for fact in plan['facts']:
    data = (root / fact['path']).read_bytes()
    assert sha(data) == fact['sha256']
    for anchor in fact['anchors']:
        assert data.decode().count(anchor['find']) == anchor['count']
for row in plan['files']:
    original = (root / row['path']).read_bytes()
    assert sha(original) == row['inputSha256']
    current = original.decode()
    for anchor in row['anchors']:
        assert current.count(anchor['find']) == anchor['count'] == 1
        current = current.replace(anchor['find'], anchor['replace'])
    assert sha(current.encode()) == row['outputSha256']
    assert (HERE / 'source' / row['path']).read_bytes() == current.encode()
    target = tree / row['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(original)
git('init', '-q'); git('add', '--all')
git('apply', '--check', HERE / 'native.patch'); git('apply', HERE / 'native.patch')
for row in plan['files']:
    assert sha((tree / row['path']).read_bytes()) == row['outputSha256']
git('apply', '--reverse', '--check', HERE / 'native.patch'); git('diff', '--check')

# Exercise the pinned native SQL, with actual SQLite-assigned IDs. This is a
# synthetic SQL check, not native method execution or owner-database access.
local = (root / plan['files'][0]['path']).read_text()
entries = (root / plan['facts'][1]['path']).read_text()
def statement(source, name):
    body = re.search(r'const(?:expr)? (?:const )?char ' + name + r'\[\]\s*=\s*(.*?);\n',
                     source, re.S).group(1)
    return ''.join(json.loads('"' + part + '"') for part in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body))
create_maps = statement(local, 'kCreateMapUsageMetadataTable')
create_entries = statement(entries, 'kCreateMapEntriesTable')
find = statement(local, 'kSelectMapId')
delete_metadata = statement(local, 'kDeleteMapMetadata')
delete_entries = statement(entries, 'kDeleteAllEntries')
assert 'FOREIGN KEY' not in create_entries.upper() and 'REFERENCES' not in create_entries.upper()
con = sqlite3.connect(':memory:')
con.executescript(create_maps + ';' + create_entries + ';')
for key in (b'aux-target', b'unrelated'):
    con.execute('INSERT INTO maps(storage_key) VALUES(?)', (key,))
    actual_id = con.execute(find, (key,)).fetchone()[0]
    con.execute('INSERT INTO map_entries VALUES(?,0,?,?)', (actual_id, b'key', key))
con.commit()
target_id = con.execute(find, (b'aux-target',)).fetchone()[0]
con.execute('BEGIN')
con.execute(delete_metadata, (b'aux-target',))
assert con.execute(find, (b'aux-target',)).fetchone() is None
assert con.execute('SELECT COUNT(*) FROM map_entries WHERE map_id=?', (target_id,)).fetchone()[0] == 1
con.rollback()
for rollback in (True, False):
    con.execute('BEGIN')
    actual_id = con.execute(find, (b'aux-target',)).fetchone()[0]
    con.execute(delete_entries, (actual_id,))
    con.execute(delete_metadata, (b'aux-target',))
    if rollback:
        con.rollback()
        assert con.execute(find, (b'aux-target',)).fetchone()[0] == target_id
        assert con.execute('SELECT value FROM map_entries WHERE map_id=?', (target_id,)).fetchone()[0] == b'aux-target'
    else:
        con.commit()
        assert con.execute(find, (b'aux-target',)).fetchone() is None
        assert con.execute('SELECT COUNT(*) FROM map_entries WHERE map_id=?', (target_id,)).fetchone()[0] == 0
    assert con.execute('SELECT value FROM map_entries WHERE value=?', (b'unrelated',)).fetchone()[0] == b'unrelated'
result = {'passed': True, 'sourcePlanSha256': sha((HERE / 'source-plan.json').read_bytes()),
          'patchSha256': sha((HERE / 'native.patch').read_bytes()), 'files': 1, 'countedAnchors': 2,
          'exactReplayPassed': True, 'reverseCheckPassed': True, 'syntheticSqlCases': 3,
          'nativeCheckoutChanged': False, 'nativeCompiled': False, 'productExecuted': False,
          'runtimeAcceptance': False}
(HERE / 'actual-source-check-a12.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))

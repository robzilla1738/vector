"""Preserve actual SQLite map identity until its raw rows are removed."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
path = 'components/services/storage/dom_storage/sqlite/local_storage_sqlite.cc'
original = (NATIVE / path).read_bytes()
text = original.decode()
anchors = [
    {'find': '''  DB_RETURN_IF_ERROR(DeleteMapMetadata(metadata_to_delete));

  // Delete the key/value pairs in `maps_to_delete`.''',
     'replace': '''  // Keep metadata until its actual allocated map ID has been looked up.
  // There is no foreign-key cascade from maps to map_entries; deleting the
  // metadata first would make FindMapId report absence and orphan raw rows.
  // Both deletions remain in this transaction, so either failure rolls back.
  // Delete the key/value pairs in `maps_to_delete`.''', 'count': 1},
    {'find': '''      DB_RETURN_IF_ERROR(map_entries_table_->DeleteMap(*map_id));
    }
  }

  RETURN_STATUS_ON_ERROR(transaction.Commit());
  return DbStatus::OK();
}

DbStatus LocalStorageSqlite::DeleteSessions(''',
     'replace': '''      DB_RETURN_IF_ERROR(map_entries_table_->DeleteMap(*map_id));
    }
  }

  DB_RETURN_IF_ERROR(DeleteMapMetadata(metadata_to_delete));
  RETURN_STATUS_ON_ERROR(transaction.Commit());
  return DbStatus::OK();
}

DbStatus LocalStorageSqlite::DeleteSessions(''', 'count': 1},
]
for anchor in anchors:
    assert text.count(anchor['find']) == anchor['count'] == 1
    text = text.replace(anchor['find'], anchor['replace'])
out = HERE / 'source' / path
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(text)
facts = []
for rel, needles in {
    path: ['"row_id INTEGER PRIMARY KEY AUTOINCREMENT,"',
           '"CREATE UNIQUE INDEX maps_by_storage_key ON maps(storage_key)"',
           '"SELECT row_id FROM maps WHERE storage_key = ?"'],
    'components/services/storage/dom_storage/sqlite/map_entries_table.cc':
        ['"PRIMARY KEY(map_id, key)"', '"DELETE FROM map_entries WHERE map_id = ?"'],
}.items():
    data = (NATIVE / rel).read_bytes()
    facts.append({'path': rel, 'sha256': sha(data), 'anchors': [
        {'find': needle, 'count': data.decode().count(needle)} for needle in needles]})
    assert all(a['count'] > 0 for a in facts[-1]['anchors'])
plan = {'format': 'aux.local-sqlite-absence.source.v1', 'nativeRoot': str(NATIVE),
        'files': [{'path': path, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                   'output': str(out), 'anchors': anchors}], 'facts': facts,
        'nativeCheckoutChanged': False, 'nativeCompiled': False, 'productExecuted': False,
        'localAbsentAllocationImplemented': False, 'restartRecoveryImplemented': False}
(HERE / 'source-plan.json').write_text(json.dumps(plan, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(difflib.unified_diff(
    original.decode().splitlines(True), text.splitlines(True), fromfile='a/' + path, tofile='b/' + path)))
print(json.dumps({'files': 1, 'countedAnchors': len(anchors), 'inputSha256': sha(original),
                  'outputSha256': sha(text.encode())}))

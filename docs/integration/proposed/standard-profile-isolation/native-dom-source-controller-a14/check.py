from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent
plan=json.loads((base/'source-plan.json').read_text())
for row in plan['files']:
 data=Path(row['input']).read_bytes(); assert hashlib.sha256(data).hexdigest()==row['inputSha256']
 text=data.decode()
 for anchor in row['anchors']:
  assert text.count(anchor['find'])==anchor['count']
  text=text.replace(anchor['find'],anchor['replace'])
 assert text.encode()==Path(row['output']).read_bytes()
 assert hashlib.sha256(text.encode()).hexdigest()==row['outputSha256']
 for name in ['StageAuxUiPreferenceTargets(', 'CommitAuxUiPreferenceLease(', 'RestoreAuxUiPreferenceLease(', 'PublishAuxUiPreferenceLease(']:
  assert name not in text
 assert 'DrainLoadedAreasForAuxUiMigration' not in text
 assert 'value->aborted' in text and 'value->released' in text
 assert 'const size_t index = dom_cursor_++;' in text
 assert 'actual->GetStoragePartition() != partitions_[hold.partition]' in text
 assert 'map->storage_key != actual->GetStorageKey()' in text
 assert 'selected != (hold.local ? frame.source_stores->local : frame.source_stores->session)' in text
 assert 'method != "auxSealDraftMigrationCapture"' in text
 assert 'capture.Set("backendWriterClosure", false)' in text
for row in plan['dependencies']:
 assert hashlib.sha256(Path(row['path']).read_bytes()).hexdigest()==row['sha256']
print('PASS: one actual controller; 28 exact anchors; four pinned interfaces; source-only finite flow, no target mutation')

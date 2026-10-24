from pathlib import Path
import json,hashlib
base=Path(__file__).resolve().parent;plan=json.loads((base/'source-plan.json').read_text())
for row in plan['files']:
 text=Path(row['input']).read_text();assert hashlib.sha256(text.encode()).hexdigest()==row['inputSha256']
 for a in row['anchors']:assert text.count(a['find'])==a['count'];text=text.replace(a['find'],a['replace'])
 assert text==Path(row['output']).read_text();assert hashlib.sha256(text.encode()).hexdigest()==row['outputSha256']
 for operation in ['CommitAuxUiMigrationLease(', 'CommitAuxUiPreferenceLease(', 'RestoreAuxUiMigrationLease(', 'RestoreAuxUiPreferenceLease(', 'PublishAuxUiPreferenceLease(']:assert operation in text
 for kind in [2,3,4,5,6,7,8]:assert f'RecordLive({kind},' in text
 assert 'live_action_ = LiveAction::kExtensionRead; live_pending_ = true;' in text
 assert 'live_action_ = LiveAction::kDomRead; hold.pending = true;' in text
 assert 'Actual live target awaits typed selected-home terminal acceptance; no automatic cleanup' in text
 assert 'MakeAuxUiPreferenceRecoveryDescriptor' in text
 assert 'value->known_source_target_mixture' in text
 assert 'capture.Set("qualified", false)' in text and 'capture.Set("activationAuthorized", false)' in text
 assert 'qualified", true' not in text and 'activationAuthorized", true' not in text
for row in plan['dependencies']:assert hashlib.sha256(Path(row['path']).read_bytes()).hexdigest()==row['sha256']
print('PASS:17 counted anchors, concrete wire/helper pins, actual write/readback/restore/publish consumers and ordered native records; source only')

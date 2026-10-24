from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent;plan=json.loads((base/'source-plan.json').read_text())
for f in plan['files']:
 if f['input']:
  s=Path(f['input']).read_text();assert hashlib.sha256(s.encode()).hexdigest()==f['inputSha256']
  for a in f['anchors']:assert s.count(a['find'])==a['count'];s=s.replace(a['find'],a['replace'])
  assert s==Path(f['output']).read_text()
 else:s=Path(f['output']).read_text()
 assert hashlib.sha256(s.encode()).hexdigest()==f['outputSha256']
s=Path(plan['files'][0]['output']).read_text()
assert 'peer::AcceptNativeSelectedUiMigrationCompletion(*completion_fact_)' in s
assert 'AcknowledgeCompletion(std::move(*acknowledgement))' in s
assert 'live_records_.back()->ordinal != terminal_ordinal_' in s
assert 'std::ranges::equal(reply, expected_reply_)' in s
assert 'base::BindOnce(&Controller::RunLive' in s
assert 'Set("qualified", true)' not in s and 'Set("activationAuthorized", true)' not in s
print('PASS: counted real callsite/opaque fact/typed ACK/terminal binding; source only')

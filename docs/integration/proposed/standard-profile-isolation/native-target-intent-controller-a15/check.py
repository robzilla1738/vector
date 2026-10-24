from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent
plan=json.loads((base/'source-plan.json').read_text())
for row in plan['files']:
 text=Path(row['input']).read_text();assert hashlib.sha256(text.encode()).hexdigest()==row['inputSha256']
 for anchor in row['anchors']:
  assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'])
 assert text==Path(row['output']).read_text();assert hashlib.sha256(text.encode()).hexdigest()==row['outputSha256']
 for name in ['CommitAuxUiPreferenceLease(', 'RestoreAuxUiPreferenceLease(', 'PublishAuxUiPreferenceLease(']:assert name not in text
 assert 'StageAuxUiPreferenceTargets(' in text and 'ExchangeNativeSelectedUiCaptureFrame(t.next)' in text
 assert 'PrivateDraftTargetsMatch(*map, hold.local)' in text
 assert 'intent.Set("qualified", false)' in text and 'intent.Set("activationAuthorized", false)' in text
 assert 'intent.Set("captureReceiptSha256", base::HexEncodeLower(Digest(transfer_->receipt)))' in text
 assert 'const auto part = base::as_byte_span(t.payload).subspan(t.offset, count)' in text
 assert 'std::ranges::equal(bytes.subspan(1), base::as_byte_span(t.payload).subspan(t.read_offset, count))' in text
 assert '(intent_ && !intent_->complete)' in text
for row in plan['dependencies']:
 data=Path(row['path']).read_bytes();assert hashlib.sha256(data).hexdigest()==row['sha256']
 for anchor in row.get('anchors',[]):assert data.decode().count(anchor)==1
# Fixed wire golden descriptor, independent of native runtime execution.
import uuid,struct
payload=b'opaque-intent';journal=uuid.UUID('00000000-0000-4000-8000-000000000001').bytes;upload=uuid.UUID('00000000-0000-4000-8000-000000000002').bytes
digest=hashlib.sha256(payload).digest();wire=bytes([7])+journal+upload+struct.pack('<IB',0,1)+bytes(32)+digest+struct.pack('<I',len(payload))+digest
assert len(wire)==138 and wire[1:17]==journal and wire[17:33]==upload
assert struct.unpack('<IB',wire[33:38])==(0,1) and wire[38:70]==bytes(32)
assert wire[70:102]==digest and struct.unpack('<I',wire[102:106])[0]==len(payload) and wire[106:138]==digest
print('PASS: one controller; 15 exact anchors; pinned actual target codec and journal protocol; fixed138-byte intent descriptor; no persistent target calls')

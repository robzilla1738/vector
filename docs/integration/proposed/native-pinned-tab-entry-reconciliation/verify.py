"""Static original behavior and exact incremental proposal replay."""
from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
root=Path(__file__).resolve().parent
m=json.loads((root/'manifest.json').read_text());e=json.loads((root/'source-evidence.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
arm=Path(e['arm64']['path']).read_bytes();assert sha(arm)==e['arm64']['sha256']
sections=[];offset=32
for _ in range(struct.unpack_from('<I',arm,16)[0]):
 command,size=struct.unpack_from('<II',arm,offset)
 if command==0x19:
  for index in range(struct.unpack_from('<I',arm,offset+64)[0]):
   sections.append(struct.unpack_from('<QQI',arm,offset+72+index*80+32))
 offset+=size
def read(address,length):
 start,_,offset=next(row for row in sections if row[0]<=address<row[0]+row[1])
 return arm[offset+address-start:offset+address-start+length]
assert struct.unpack('<Q',read(0xe220848,8))[0]&0xfffffffff==0x41d79e4
assert struct.unpack_from('<I',arm,0x41d79e8)[0]==0x17ffffb6
assert read(0xcf019d6,len(b'pinned_tab_entry_url\0'))==b'pinned_tab_entry_url\0'
for row in e['functions']:
 start=int(row['rva'],16);assert sha(arm[start:start+row['bytes']])==row['sha256']
def target(address):
 instruction=struct.unpack_from('<I',arm,address)[0];assert instruction&0xfc000000==0x94000000
 delta=instruction&0x3ffffff
 if delta&0x2000000:delta-=0x4000000
 return address+4*delta
for address,destination in [(0x41d8520,0x41e5da0),(0x41d6ed0,0xf72a30),(0x41d6f80,0x4557cb4),(0x41d6ac4,0x15dae48),(0x41d82f8,0x7ae5e84),(0x41d5fb4,0x41d64d0)]:assert target(address)==destination
# Original pending byte set1 before post, reset0 at task entry; unpin bool0.
word=lambda a:struct.unpack_from('<I',arm,a)[0]
assert word(0x41d5e90)==0x39030008 and word(0x41d833c)==0x3903001f
assert word(0x41d851c)==0x52800002
assert word(0x41d6ecc)==0x52800022 # original INCLUDE_PRIVATE_REGISTRIES1
native=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in e['platformSources']:assert sha((native/row['path']).read_bytes())==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='aux-pinned-reconcile-') as directory:
 replay=Path(directory);subprocess.run(['git','init','-q',directory],check=True)
 for row in m['files']:
  path=row['path'];before=(root/'baseline'/path).read_bytes();assert sha(before)==row['baselineSha256'];assert sha((root/'source'/path).read_bytes())==row['outputSha256'];dest=replay/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(before)
 subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True);subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
 for row in m['files']:assert sha((replay/row['path']).read_bytes())==row['outputSha256']
service=(root/'source/chrome/browser/ui/tabs/pinned_tab_service.cc').read_text();model=(root/'source/chrome/browser/ui/tabs/aux_pinned_tab_entries.cc').read_text();header=(root/'source/chrome/browser/ui/tabs/tab_strip_model.h').read_text()
assert 'model->SetTabsPinned(std::move(removed), false)' in service
assert 'base::AutoReset<bool> changing(&model->reentrancy_guard_, true)' in service
assert 'friend class PinnedTabService;' in header
pref=service[service.index('void PinnedTabService::ReconcileRemovedPinnedEntries()'):service.index('void PinnedTabService::ReconcilePinnedEntries(')]
assert 'GetRememberedPinnedTabEntryUrl' in pref and 'GetVisibleURL' not in pref
assert 'Close' not in pref and 'Navigate' not in pref and 'SetTabPinned(' not in pref
assert 'if (reconciliation_pending_)' in service and 'weak_factory_.GetWeakPtr()' in service
assert 'INCLUDE_PRIVATE_REGISTRIES' in model and 'pass < 3' in model
assert 'entry->GetURL()' in service and 'entry->GetVirtualURL()' in service
assert '"pinned_tab_entry_url"' in service and 'TabChangeType::kAll' in service
# Root compiler-only fix must remain independently applicable to the18588 baseline.
assert 'else if (auto remembered = aux::GetRememberedPinnedTabEntryUrl' in service
print('Original coalesced unpin/adoption/session metadata pins +6-file replay PASS. C++ fixtures authored, uncompiled; profile-scoped async close registry explicitly pending.')

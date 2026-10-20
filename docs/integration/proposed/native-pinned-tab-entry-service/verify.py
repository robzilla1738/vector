"""Pin original native pin producer and replay bounded155 integration."""
from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
evidence=json.loads((root/'source-evidence.json').read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
arm=Path(evidence['arm64']['path']).read_bytes();assert sha(arm)==evidence['arm64']['sha256']
sections=[];offset=32
for _ in range(struct.unpack_from('<I',arm,16)[0]):
 command,size=struct.unpack_from('<II',arm,offset)
 if command==0x19:
  for index in range(struct.unpack_from('<I',arm,offset+64)[0]):sections.append(struct.unpack_from('<QQI',arm,offset+72+index*80+32))
 offset+=size
def read(address,length):
 start,_,offset=next(section for section in sections if section[0]<=address<section[0]+section[1])
 return arm[offset+address-start:offset+address-start+length]
for row in evidence['functions']:assert sha(read(int(row['rva'],16),row['bytes']))==row['sha256'],row['name']
for row in evidence['strings']:assert read(int(row['rva'],16),len(row['value'])+1)==row['value'].encode()+b'\0'
assert struct.unpack('<Q',read(0xe220808,8))[0]&0xfffffffff==0x41d79ec
for address,target in [(0x41d7ba8,0x41d4ccc),(0x41d7fa0,0x41d4f20),(0x41d4e2c,0x41d4a24),(0x41d50a4,0x41d4a24)]:
 instruction=struct.unpack('<I',read(address,4))[0];assert instruction&0xfc000000==0x94000000
 delta=instruction&0x3ffffff
 if delta&0x2000000:delta-=0x4000000
 assert address+4*delta==target
native=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:assert sha((native/row['path']).read_bytes())==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='aux-pin-service-') as directory:
 replay=Path(directory);subprocess.run(['git','init','-q',directory],check=True)
 for row in manifest['files']:
  path=row['path'];assert sha((root/'source'/path).read_bytes())==row['outputSha256']
  if row['baselineSha256'] is not None:
   data=(root/'baseline'/path).read_bytes();assert sha(data)==row['baselineSha256']
   target=replay/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
  else:assert not (native/path).exists(),path
 subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True)
 subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
 for row in manifest['files']:assert sha((replay/row['path']).read_bytes())==row['outputSha256']
# Evaluate only the explicit platform conditionals, not the C++ implementation.
def platform_branch(text,aux):
 stack=[];enabled=True;output=[]
 for line in text.splitlines():
  if line.startswith('#if ') and 'BUILDFLAG' in line:
   stack.append(enabled);condition=not aux if line.startswith('#if !') else aux;enabled=enabled and condition
  elif line=='#else':enabled=stack[-1] and not enabled
  elif line=='#endif':enabled=stack.pop()
  elif enabled:output.append(line)
 assert not stack
 return '\n'.join(output)
service=(root/'source/chrome/browser/ui/tabs/pinned_tab_service.cc').read_text()
aux=platform_branch(service,True);upstream=platform_branch(service,False)
assert 'PinnedTabCodec::WritePinnedTabs(profile_)' not in aux
assert upstream.count('PinnedTabCodec::WritePinnedTabs(profile_)')==1
assert 'need_to_write_pinned_tabs_ = true' in upstream and 'need_to_write_pinned_tabs_' not in aux
for text in ['contents->GetBrowserContext() != profile_', 'aux::AddPinnedTabEntryIfAbsent', 'aux::RemoveFirstPinnedTabEntry','profile_switch_pauses_.erase(token)','TabStripModelObserver::StopObservingAll(this)']:assert text in aux
identity=(root/'source/chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.cc').read_text()
actions=(root/'source/chrome/browser/ui/views/tabs/vertical/aux_pinned_tab_entry_actions.cc').read_text()
assert identity.count('const char kPinnedTabEntryUrlKey')==1
assert 'kPinnedTabEntryUrlKey' not in service and 'kPinnedTabEntryUrlKey' not in actions
assert 'SetUserData' not in actions and 'SetUserData' not in service
assert 'contents.RemoveUserData(&kPinnedTabEntryUrlKey)' in identity
factory=(root/'source/chrome/browser/ui/tabs/pinned_tab_service_factory.cc').read_text()
assert 'GetServiceForBrowserContext(profile, false)' in factory
model=(root/'source/chrome/browser/ui/tabs/aux_pinned_tab_entries.cc').read_text()
assert 'entries.erase(found)' in model and 'std::erase_if' not in model
assert 'entries.push_back({url, title})' in model
assert 'ExplicitUnpinRemovesOnlyFirstExactUrl' in (root/'source/chrome/browser/ui/tabs/aux_pinned_tab_entries_unittest.cc').read_text()
print('Original PinnedTabService producer/vtable/mutations pinned; single identity and Aux/non-Aux branches verified;11-file replay passes. No C++ build/runtime acceptance; full reconciliation/closing guard/root seam pending.')

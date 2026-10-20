"""Pin original menu identity/actions and replay the leaf-only adaptation."""
from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
root=Path(__file__).resolve().parent
evidence=json.loads((root/'source-evidence.json').read_text());manifest=json.loads((root/'manifest.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
arm=Path(evidence['arm64']['path']).read_bytes();assert sha(arm)==evidence['arm64']['sha256']
for row in evidence['functions']:
 start=int(row['rva'],16);assert sha(arm[start:start+row['bytes']])==row['sha256']
def target(address):
 instruction=struct.unpack_from('<I',arm,address)[0];assert instruction&0xfc000000==0x94000000
 delta=instruction&0x3ffffff
 if delta&0x2000000:delta-=0x4000000
 return address+delta*4
assert target(0x460ac44)==0x4124990 # actual native live-tab menu
assert target(0x4609b58)==0x41d4f20 # actual source remove-first mutation
pak=Path(evidence['locale']['path']).read_bytes();assert sha(pak)==evidence['locale']['sha256']
version,encoding,count,aliases=struct.unpack_from('<IBxxxHH',pak);assert version==5 and encoding==1
entries=[struct.unpack_from('<HI',pak,12+i*6) for i in range(count+1)]
index=next((i for i,(key,_) in enumerate(entries[:-1]) if key==11712),None)
if index is None:index=dict(struct.unpack_from('<HH',pak,12+(count+1)*6+i*4) for i in range(aliases))[11712]
assert pak[entries[index][1]:entries[index+1][1]].decode()=='Unpin'
native=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:assert sha((native/row['path']).read_bytes())==row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-pinned-menu-') as directory:
 replay=Path(directory);subprocess.run(['git','init','-q',directory],check=True)
 for row in manifest['files']:
  path=row['path'];before=(root/'baseline'/path).read_bytes();assert sha(before)==row['baselineSha256'];assert sha((root/'source'/path).read_bytes())==row['outputSha256'];dest=replay/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(before)
 subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True);subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
 for row in manifest['files']:assert sha((replay/row['path']).read_bytes())==row['outputSha256']
code=(root/'source/chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.cc').read_text()
assert code.count('menu_model_->AddItem(')==1 and 'IDS_TAB_CXMENU_UNPIN_TAB' in code
assert 'aux::RemoveFirstPinnedTabEntry' in code
assert 'TabMenuModelDelegate::From(browser_)' in code and 'tab->GetHandle(), region->GetTabStripCollectionController()' in code
assert 'ExpandOnHoverLockType::kKeepCurrentState' in code
assert code.index('CancelContextMenu();',code.index('PauseForProfileSwitch()'))<code.index('weak_factory_.InvalidateWeakPtrs()',code.index('PauseForProfileSwitch()'))
assert 'return command_id == 1 && !paused_ && menu_url_.is_valid();' in code
assert 'ConvertPointToScreen(this, &point)' in code and 'weak_factory_.GetWeakPtr()' in code
print('Pinned source/native menu and locale alias; leaf-only exact replay passed. No C++ build, dialog, or runtime acceptance.')

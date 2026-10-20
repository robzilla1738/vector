"""Static supplied leaf/glyph/lifecycle pins and exact incremental replay."""
from pathlib import Path
import hashlib,json,re,struct,subprocess,tempfile
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
evidence=json.loads((root/'source-evidence.json').read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
arm=Path(evidence['arm64']['path']).read_bytes()
assert sha(arm)==evidence['arm64']['sha256']
sections=[];offset=32
for _ in range(struct.unpack_from('<I',arm,16)[0]):
 command,size=struct.unpack_from('<II',arm,offset)
 if command==0x19:
  for index in range(struct.unpack_from('<I',arm,offset+64)[0]):
   sections.append(struct.unpack_from('<QQI',arm,offset+72+index*80+32))
 offset+=size
def read(address,length):
 start,_,offset=next(section for section in sections if section[0]<=address<section[0]+section[1])
 return arm[offset+address-start:offset+address-start+length]
for row in evidence['functions']:assert sha(read(int(row['rva'],16),row['bytes']))==row['sha256'],row['name']
native=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:assert sha((native/row['path']).read_bytes())==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='aux-native-pinned-leaf-') as directory:
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
# Reconstruct every generated icon scalar back to the exact provided bytes.
code=(root/'source/chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.cc').read_text()
commands=re.findall(r'  DECLARE_VECTOR_COMMAND\((\w+)\)',(native/'ui/gfx/vector_icon_types.h').read_text())
icon=code.split('constexpr gfx::PathElement kGlobePath[] = {',1)[1].split('};',1)[0]
rebuilt=b''
for token in icon.replace('\n',' ').split(','):
 token=token.strip()
 if not token:continue
 rebuilt+=struct.pack('<I',commands.index(token[5:])) if token.startswith('gfx::') else struct.pack('<f',float(token[:-1]))
assert rebuilt==read(0xce79914,302*4)
# Actual original operands:40/32 geometry comes from source's58/59 calls;
# no 155 numeric ColorIds or fallback CSS authority enter the port.
word=lambda address:struct.unpack('<I',read(address,4))[0]
assert word(0x460d878)==0x1e249000 # radius10
assert word(0x460d83c)==0x4f046400 # negative-zero inset, no invented0.5
assert word(0x460d894)==0xd2e81008 and word(0x460d8a4)==0xd2806029 # original fill flags/miter
assert word(0x35e7c84)==0x12b4c008 and word(0x35e7c88)==0x12b98009 # hover233 white59/33
assert word(0x460d1c8)==0x7100811f and word(0x460d1cc)==0x7a4d1904 # Space/Return
for expression in ['kEntryHeight = 40','kPreferredWidth = 32','kGap = 6','SetPaintToLayer(ui::LAYER_TEXTURED)','SetFillsBoundsOpaquely(false)','SkBlendMode::kSrc','rows * kEntryHeight','count % cap == 1','GestureType']:
 if expression!='GestureType':assert expression in code,expression
assert code.count('DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags)')==3
assert 'kStroke_Style' not in code and 'ColorId' not in code
assert 'ReadPinnedTabEntries' in code and 'FindPinnedTabEntry' in code
assert 'TabUIHelper::From' in code and 'AddTabUIChangeCallback' in code
region=(root/'source/chrome/browser/ui/views/frame/vertical_tab_strip_region_view.cc').read_text()
assert 'pinned_profile_switch_generation_ == generation' in region
assert region.index('pinned_tab_entries_->PauseForProfileSwitch()')<region.index('aux_sidebar_->BeginAuxProfileSwitch(target)')
assert 'pinned_tab_entries_->SetCompactPresentation' not in region # no guessed animation writer
sidebar=(root/'source/chrome/browser/ui/views/frame/aux_sidebar_view.cc').read_text()
assert '  AddPinnedTiles();' not in sidebar
print('Actual pinned leaf/glyph/paint/ownership pins and5-file replay pass. Not compiled/runtime-accepted; drag/menu/animated compact mapping explicitly pending.')

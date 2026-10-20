"""Pin actual empty-list registration and replay the narrow sync flag fix."""
from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
evidence=json.loads((root/'source-evidence.json').read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
arm=Path(evidence['arm64']['path']).read_bytes()
assert sha(arm)==evidence['arm64']['sha256']
for row in evidence['functions']:
 start=int(row['rva'],16)
 assert sha(arm[start:start+row['bytes']])==row['sha256']
word=lambda address:struct.unpack_from('<I',arm,address)[0]
assert word(0x3597aa4)==0x528000e1 # mov w1,7: List
assert word(0x3597ac0)==0x52800024 # mov w4,1: registration flags
assert word(0x3597ac4)==0x52800005 # mov w5,0: kOther
assert word(0x5cf60c)==0xa9007c1f and word(0x5cf610)==0xf900081f # zero List
assert word(0x5cf614)==0x528000e8
for address,target in [(0x3597aa8,0x5cf5b0),(0x3597ac8,0xbddc50)]:
 instruction=word(address);assert instruction&0xfc000000==0x94000000
 immediate=instruction&0x3ffffff
 if immediate&0x2000000:immediate-=0x4000000
 assert address+4*immediate==target
native=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:
 assert sha((native/row['path']).read_bytes())==row['sha256']
assert 'SYNCABLE_PREF = 1 << 0' in (native/'components/pref_registry/pref_registry_syncable.h').read_text()
with tempfile.TemporaryDirectory(prefix='aux-pinned-registration-') as directory:
 replay=Path(directory)
 subprocess.run(['git','init','-q',directory],check=True)
 for row in manifest['files']:
  path=row['path'];a=(root/'baseline'/path).read_bytes();b=(root/'source'/path).read_bytes()
  assert sha(a)==row['baselineSha256'] and sha(b)==row['outputSha256']
  target=replay/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(a)
 subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True)
 subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
 for row in manifest['files']:assert sha((replay/row['path']).read_bytes())==row['outputSha256']
print('Original empty List and registration flag1 pinned; incremental replay passes. No native writes/build/runtime acceptance.')

"""Pin the supplied persistent model and replay only absent native source files."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root/'manifest.json').read_text())
evidence = json.loads((root/'source-evidence.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

arm = Path(evidence['arm64']['path']).read_bytes()
assert hashlib.sha256(arm).hexdigest() == evidence['arm64']['sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I',arm,16)[0]):
    command,size = struct.unpack_from('<II',arm,pos)
    if command == 0x19:
        for i in range(struct.unpack_from('<I',arm,pos+64)[0]):
            sections.append(struct.unpack_from('<QQI',arm,pos+72+i*80+32))
    pos += size

def read(address,count):
    start,_,offset = next(s for s in sections if s[0] <= address < s[0]+s[1])
    return arm[offset+address-start:offset+address-start+count]

for row in evidence['functions']:
    assert hashlib.sha256(read(int(row['rva'],16),row['bytes'])).hexdigest() == row['sha256']
for row in evidence['strings']:
    assert read(int(row['rva'],16),len(row['value'])+1) == row['value'].encode()+b'\0'
native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:
    assert sha(native/row['path']) == row['sha256']
for address,target in [(0x4605224,0x41d4660),(0x4607558,0x4606b20),(0x4607560,0x46051e4)]:
    branch = struct.unpack('<I',read(address,4))[0]
    assert branch&0xfc000000 == 0x94000000
    immediate = branch&0x3ffffff
    if immediate&0x2000000:
        immediate -= 0x4000000
    assert address+immediate*4 == target
with tempfile.TemporaryDirectory(prefix='aux-pinned-model-') as directory:
    replay = Path(directory)
    subprocess.run(['git','init','-q',directory],check=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None
        assert not (native/row['path']).exists(), row['path']
        assert sha(root/'source'/row['path']) == row['outputSha256']
    subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True)
    subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
    for row in manifest['files']:
        assert sha(replay/row['path']) == row['outputSha256']
code = (root/'source/chrome/browser/ui/tabs/aux_pinned_tab_entries.cc').read_text()
assert code.count('RegisterListPref(kPinnedTabEntriesPref)') == 1
assert 'prefs.GetList(kPinnedTabEntriesPref)' in code
assert 'prefs.SetList(kPinnedTabEntriesPref, SerializePinnedTabEntries(entries))' in code
assert 'dictionary->FindString("url")' in code
assert 'dictionary->FindString("title")' in code
assert 'if (!url.is_valid())' in code
assert 'if (!entry.url.is_valid())' in code
assert 'entry.url.spec()' in code
assert 'if (!entry.title.empty())' in code
assert 'IndexOfFirstNonPinnedTab' not in code
assert 'TabStripModel' not in code
assert 'uuid' not in code.lower()
print('Pinned original persistent entry model and actual leaf topology; exact absent-file replay passes. C++ fixtures authored, not compiled/run; UI component not mounted.')

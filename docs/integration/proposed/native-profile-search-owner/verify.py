"""Original source pins and pure filesystem replay; no browser/native execution."""
from pathlib import Path
import hashlib,json,subprocess,tempfile,struct
r=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
e=json.loads((r/'source-evidence.json').read_text());b=Path(e['artifact']).read_bytes();assert sha(b)==e['sha256']
for x in e['extracts']:
 a,z=int(x['start'],16),int(x['stop'],16)
 assert sha(b[a:z])==x['bytesSha256']
 assert sha((r/x['file']).read_bytes())==x['extractSha256']
for x in e['urlFragments']:
 a=int(x['descriptor'],16);p,n=struct.unpack_from('<QQ',b,a);p&=0xffffffffffff
 assert p==int(x['address'],16) and n==x['length'] and b[p:p+n].decode()==x['value']
assert ''.join(x['value'] for x in e['urlFragments'])=='chrome-extension://fjdhphbdlfjogobdofoaagnlnkoibdge/tabsearch.html'
for x in e['retainedReaSnapshots']:assert sha(Path(x['path']).read_bytes())==x['sha256']
x=e['nativeVisualEffect'];assert sha(Path(x['path']).read_bytes())==x['sha256'];assert x['literal'] in Path(x['path']).read_text()
m=json.loads((r/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-search-owner-replay-') as d:
 t=Path(d);subprocess.run(['git','init','-q',d],check=True)
 for f in m['files']:
  old=Path(f['baselineSource']).read_bytes();assert sha(old)==f['baselineSha256']
  p=t/f['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(old)
 subprocess.run(['git','apply','--check',str(r/'native.patch')],cwd=t,check=True)
 subprocess.run(['git','apply',str(r/'native.patch')],cwd=t,check=True)
 for f in m['files']:
  assert sha((t/f['path']).read_bytes())==f['outputSha256']
  assert sha((r/'port'/f['path']).read_bytes())==f['outputSha256']
cc=(r/'port/chrome/browser/ui/views/frame/aux_tab_search_bubble.cc').read_text()
assert 'FetchProfileSecurity' not in cc and 'Checking this browser profile' not in cc
assert 'ExtensionRegistry::EVERYTHING' in cc and 'host->ShowTabSearchBubble(true)' in cc
assert 'base::Milliseconds(120)' in cc and 'base::Milliseconds(90)' in cc
assert 'DesktopMediaPickerVisualEffect' in cc
print('Pinned original native search contract and two-output independent replay PASS; no native/UI acceptance.')

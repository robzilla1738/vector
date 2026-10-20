"""Check supplied source and exact new-file replay without executing the target."""
from pathlib import Path
import hashlib,json,re,struct,subprocess,tempfile
root=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
e=json.loads((root/'source-evidence.json').read_text());raw=Path(e['artifact']).read_bytes();assert sha(raw)==e['sha256']
for x in e['extracts']:
 assert sha(raw[int(x['start'],16):int(x['stop'],16)])==x['bytesSha256']
 assert sha((root/x['file']).read_bytes())==x['extractSha256']
m=e['metadata'];addr=int(m['nameRva'],16);assert raw[addr:addr+len(m['name'])+1]==m['name'].encode()+b'\0'
for addr,expected in [('containerRva','TLBR'),('avatarMarginsRva','avatarMarginsTLBR'),('labelMarginsRva','labelMarginsTLBR')]:assert list(struct.unpack_from('<4i',raw,int(e['insets'][addr],16)))==e['insets'][expected]
names=['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
code=(root/'port/chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_icons.inc').read_text();arrays=re.findall(r'constexpr gfx::PathElement k\w+Path\[\] = \{(.*?)\};',code,re.S);assert len(arrays)==len(e['icons'])
for body,x in zip(arrays,e['icons']):
 encoded=bytearray()
 for t in body.split(','):
  t=t.strip()
  if not t:continue
  encoded.extend(struct.pack('<I',names.index(t[5:])) if t.startswith('gfx::') else struct.pack('<f',float(t[:-1])))
 start=int(x['pathRva'],16);assert len(encoded)==x['elements']*4;assert bytes(encoded)==raw[start:start+len(encoded)];assert sha(encoded)==x['sha256']
with tempfile.TemporaryDirectory(prefix='aux-sidebar-header-') as d:
 subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=d,env={'PATH':'/usr/bin:/bin','GIT_CEILING_DIRECTORIES':d},check=True)
 subprocess.run(['git','apply',str(root/'native.patch')],cwd=d,env={'PATH':'/usr/bin:/bin','GIT_CEILING_DIRECTORIES':d},check=True)
 for x in json.loads((root/'manifest.json').read_text())['files']:
  assert x['baselineSha256'] is None
  assert sha((Path(d)/x['path']).read_bytes())==x['outputSha256']==sha((root/'port'/x['path']).read_bytes())
print('Original header identity/insets, all991 glyph elements and3-file source replay PASS. No compile or UI acceptance.')

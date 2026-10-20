#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,struct,tempfile,subprocess
r=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest();e=json.loads((r/'source-evidence.json').read_text());b=Path(e['artifact']['path']).read_bytes();assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256']
 assert sha((r/(f['name']+'.asm')).read_bytes())==f['asmSha256']
assert struct.unpack_from('<4i',b,0xdf47a60)==(2,7,0,7)
assert struct.unpack_from('<4i',b,0xdf3e7d0)==(1,1,0,1)
assert struct.unpack_from('<4i',b,0xdf39a30)==(1,0,0,0)
assert struct.unpack_from('<3f',b,0xcf06638)==(8,8,0)
assert struct.unpack_from('<3f',b,0xcf06644)==(8,0,8)
# Rebuild original supplied glyph rawwords from copied C++ command/float data.
commands=['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
code=(r/'port/chrome/browser/ui/views/frame/aux_new_chat_icon.inc').read_text();data=bytearray()
for t in code.split('kNewChatPath[] = {',1)[1].split('};',1)[0].split(','):
 t=t.strip()
 if t:data.extend(struct.pack('<I',commands.index(t[5:])) if t.startswith('gfx::') else struct.pack('<f',float(t[:-1])))
assert len(data)==275*4 and sha(data)==e['newChatGlyph']['sha256']
p=Path(e['locale']['path']).read_bytes();assert sha(p)==e['locale']['sha256'];version,encoding,n,a=struct.unpack_from('<IB3xHH',p);assert(version,encoding)==(5,1)
t=[struct.unpack_from('<HI',p,12+i*6) for i in range(n+1)];aliases=dict(struct.unpack_from('<HH',p,12+(n+1)*6+i*4) for i in range(a));ids={v[0]:i for i,v in enumerate(t[:-1])};i=ids.get(11311,aliases.get(11311));assert p[t[i][1]:t[i+1][1]]==b'Show all'
j=json.loads((r/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-chats-section-') as d:
 subprocess.run(['git','init','-q',d],check=True);subprocess.run(['git','-C',d,'apply','--check',str(r/'native.patch')],check=True);subprocess.run(['git','-C',d,'apply',str(r/'native.patch')],check=True)
 for f in j['files']:
  assert f['baselineSha256'] is None
  data=(Path(d)/f['path']).read_bytes();assert sha(data)==f['outputSha256'] and data==(r/'port'/f['path']).read_bytes()
print('PASS source ranges, exactNewChat glyph/insets/hover radii, originallocale alias and five-file replay; uncompiled/unmounted')

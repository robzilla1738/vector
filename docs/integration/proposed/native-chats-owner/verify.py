#!/usr/bin/env python3
"""Static original-byte/geometry/glyph pins and pure temporary patch replay."""
from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
ROOT=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
e=json.loads((ROOT/'source-evidence.json').read_text())
b=Path(e['artifact']['path']).read_bytes()
assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256']
 assert sha((ROOT/(f['name']+'.asm')).read_bytes())==f['asmSha256']
commands=['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
code=(ROOT/'port/chrome/browser/ui/views/frame/aux_chat_icons.inc').read_text()
for icon in e['icons']:
 encoded=bytearray()
 for t in code.split('k'+icon['name']+'Path[] = {',1)[1].split('};',1)[0].split(','):
  t=t.strip()
  if t:encoded.extend(struct.pack('<I',commands.index(t[5:])) if t.startswith('gfx::') else struct.pack('<f',float(t[:-1])))
 assert len(encoded)==icon['elements']*4 and sha(encoded)==icon['sha256']
assert struct.unpack_from('<4f',b,0xdf42980)==(-4,-4,4,4)
assert struct.unpack_from('<4i',b,0xdf40a90)==(0,0,0,4)
# Native default and actual row both write controller notify enum1 (release).
assert struct.unpack_from('<I',b,0x136e85c)[0]==0xb9001ac8
assert struct.unpack_from('<I',b,0x467182c)[0]==0xb9001918
# The original animation is 33000us rather than a guessed display interval.
assert struct.unpack_from('<I',b,0x4674c48)[0]==0x52901d08
manifest=json.loads((ROOT/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-chats-owner-') as temporary:
 subprocess.run(['git','init','-q',temporary],check=True)
 subprocess.run(['git','-C',temporary,'apply','--check',str(ROOT/'native.patch')],check=True)
 subprocess.run(['git','-C',temporary,'apply',str(ROOT/'native.patch')],check=True)
 for f in manifest['files']:
  assert f['baselineSha256'] is None
  data=(Path(temporary)/f['path']).read_bytes()
  assert sha(data)==f['outputSha256'] and data==(ROOT/'port'/f['path']).read_bytes()
print('PASS original functions, exact441 glyph elements, dot/margin/notify/timer bytes and five-file patch replay; uncompiled/unmounted')

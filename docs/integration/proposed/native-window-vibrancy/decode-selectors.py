# Static decoder for the pinned supplied arm64 image. Never executes target code.
from pathlib import Path
import sys,struct,hashlib
b=Path(sys.argv[1]).read_bytes()
if hashlib.sha256(b).hexdigest()!='64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c':
 raise ValueError('Supplied arm64 image pin mismatch')
secs=[];pos=32
for _ in range(struct.unpack_from('<I',b,16)[0]):
 cmd,size=struct.unpack_from('<II',b,pos)
 if cmd==0x19:
  for j in range(struct.unpack_from('<I',b,pos+64)[0]):
   at=pos+72+j*80;name=b[at:at+16].rstrip(b'\0').decode();addr,length,off=struct.unpack_from('<QQI',b,at+32);secs.append((name,addr,length,off))
 pos+=size
def read(a,n):
 s=next(s for s in secs if s[1]<=a<s[1]+s[2]);o=s[3]+a-s[1];return b[o:o+n]
def word(a):return struct.unpack('<I',read(a,4))[0]
def qword(a):return struct.unpack('<Q',read(a,8))[0]
def cstr(a):return read(a,256).split(b'\0')[0].decode(errors='replace')
def adrp(ins,pc):
 imm=((ins>>5)&0x7ffff)<<2|((ins>>29)&3);imm=imm-0x200000 if imm&0x100000 else imm
 return (pc&~4095)+(imm<<12)
pos=32
for _ in range(struct.unpack_from('<I',b,16)[0]):
 cmd,size=struct.unpack_from('<II',b,pos)
 if cmd==0x80000034:co,cl=struct.unpack_from('<II',b,pos+8)
 pos+=size
v,starts,imports,symbols,count,fmt,sfmt=struct.unpack_from('<7I',b,co)
def imp(ptr):
 idx=ptr&0xffffff
 if fmt in (1,2):v=struct.unpack_from('<I',b,co+imports+idx*(4 if fmt==1 else 8))[0];no=v>>9
 else:v=struct.unpack_from('<Q',b,co+imports+idx*16)[0];no=v>>32
 off=co+symbols+no;return b[off:b.index(b'\0',off)].decode()
def stub(a):
 orig=a
 for _ in range(4):
  ins,nxt,br=struct.unpack('<3I',read(a,12))
  if ins&0x9f00001f==0x90000010 and nxt&0xffc003ff==0x91000210 and br==0xd61f0200:
   a=adrp(ins,a)+((nxt>>10)&4095);continue
  if ins&0x9f00001f==0x90000001 and nxt&0xffc003ff==0xf9400021:
   sel=adrp(ins,a)+((nxt>>10)&4095)*8;return f'objc:{cstr(qword(sel)&0xffffffff)}'
  if ins&0x9f00001f==0x90000010 and nxt&0xffc003ff==0xf9400210:
   ptr=adrp(ins,a)+((nxt>>10)&4095)*8;return imp(qword(ptr))
  return f'function:{a:x}'
for lo,hi in [(0x4384058,0x4384234),(0x43858d4,0x4385b8c),(0x438528c,0x438541c),(0x438541c,0x438560c)]:
 print('RANGE',hex(lo),hex(hi))
 for pc in range(lo,hi,4):
  ins=word(pc)
  if ins&0xfc000000==0x94000000:
   imm=ins&0x3ffffff;imm=imm-0x4000000 if imm&0x2000000 else imm;t=pc+4*imm
   print(hex(pc),hex(t),stub(t))
for a in [0xecee128,0xeced838,0xeb36018,0xeb36038,0xeb36058]:
 ptr=qword(a)
 print('DATA',hex(a),hex(ptr),imp(ptr) if ptr&(1<<63) else cstr(qword(a+16)&0xffffffff) if a<0xec00000 else 'ptr')

for a in [0xeb35ff8,0xeb36018,0xeb36038,0xeb36058,0xeb36078]:
 print('CFSTRING',hex(a),cstr(qword(a+16)&0xffffffff))
print('SELECTOR',hex(0xed08ba0),cstr(qword(0xed08ba0)&0xffffffff))
print('ALPHA',hex(0xdf4bd30),struct.unpack('<d',read(0xdf4bd30,8))[0])

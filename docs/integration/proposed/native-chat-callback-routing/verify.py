#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,struct
r=Path(__file__).resolve().parent;e=json.loads((r/'source-evidence.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest();b=Path(e['artifact']['path']).read_bytes();assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256']
 assert sha((r/(f['name']+'.asm')).read_bytes())==f['asmSha256']
for p in e['pointers']:assert hex(struct.unpack_from('<Q',b,int(p['address'],16))[0])==p['raw']
for p in e['literals']:
 v=p['value'].encode()+b'\0';assert b[int(p['address'],16):int(p['address'],16)+len(v)]==v and sha(v)==p['bytesSha256']
print('PASS original callback routing + positive AsideSectionDivider identity; source only')

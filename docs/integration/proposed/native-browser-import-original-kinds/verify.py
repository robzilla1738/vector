from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
root=Path(__file__).resolve().parent;proposals=root.parent;sha=lambda b:hashlib.sha256(b).hexdigest();e=json.loads((root/'source-evidence.json').read_text());m=json.loads((root/'manifest.json').read_text());b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256'];assert sha((proposals/e['priorEvidence']['path']).read_bytes())==e['priorEvidence']['sha256'];sections=[];p=32
for _ in range(struct.unpack_from('<I',b,16)[0]):
 c,s=struct.unpack_from('<II',b,p)
 if c==0x19:
  for i in range(struct.unpack_from('<I',b,p+64)[0]):sections.append(struct.unpack_from('<QQI',b,p+72+i*80+32))
 p+=s
def read(addr,size):
 start,length,offset=next(s for s in sections if s[0]<=addr and addr+size<=s[0]+s[1]);return b[offset+addr-start:offset+addr-start+size]
r=e['range'];start,end=int(r['start'],16),int(r['end'],16);assert sha(read(start,end-start))==r['sha256'];assert sha((proposals/'native-browser-import-discovery/evidence'/r['listing']).read_bytes())==r['listingSha256']
for item in e['literals']:assert read(int(item['address'],16),len(item['text'])+1)==item['text'].encode()+b'\0'
with tempfile.TemporaryDirectory(prefix='aux-original-import-kinds-') as directory:
 t=Path(directory)
 for f in m['files']:
  raw=(proposals/m['parent']/'source'/f['path']).read_bytes();assert sha(raw)==f['baselineSha256'];p=t/f['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
 subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=t,check=True);subprocess.run(['git','apply',str(root/'native.patch')],cwd=t,check=True)
 for f in m['files']:assert sha((t/f['path']).read_bytes())==f['outputSha256']
print('PASS: actual common/Safari descriptor strings and original image range; one-file parent replay')

from pathlib import Path
import struct,json,hashlib,gzip
root=Path('/Applications/Aside.app/Contents/Frameworks/Aside Framework.framework/Versions/1.0.928.1/Resources');out=Path('out/importer-ui-audit/extracted');out.mkdir(exist_ok=True);wanted=set(range(0x3b1a,0x3b26));results=[]
for path in [root/'resources.pak',root/'aside_resources.pak',root/'chrome_100_percent.pak',root/'chrome_200_percent.pak']:
 b=path.read_bytes();v=struct.unpack_from('<I',b)[0]
 if v==5:encoding=b[4];count,aliases=struct.unpack_from('<HH',b,8);base=12
 elif v==4:count=struct.unpack_from('<I',b,4)[0];base=9;aliases=0
 else:continue
 entries=[struct.unpack_from('<HI',b,base+6*i) for i in range(count+1)]
 for i,(id,off) in enumerate(entries[:-1]):
  if id not in wanted:continue
  raw=b[off:entries[i+1][1]];p=out/(path.stem+'-'+hex(id)+'.bin');p.write_bytes(raw);results.append({'pak':str(path),'pakSha256':hashlib.sha256(b).hexdigest(),'id':hex(id),'offset':off,'size':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'first':raw[:20].hex(),'extracted':str(p)})
Path('out/importer-ui-audit/pak-extraction.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results,indent=2))

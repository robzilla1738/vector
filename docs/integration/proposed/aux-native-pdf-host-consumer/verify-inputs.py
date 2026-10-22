from pathlib import Path
import hashlib,json,sys
here=Path(__file__).resolve().parent;root=here.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
pins=json.loads((here/'inputs.json').read_text())
for name,expected in pins['sources'].items():
 if sha(root/name)!=expected:raise ValueError('Source differs: '+name)
if sha(Path(sys.argv[1]))!=pins['nodeSha256'] or sha(Path(sys.argv[2]))!=pins['moduleSha256']:raise ValueError('Fixture binary differs')
print('PASS exact source/runtime/current own PDF input pins')

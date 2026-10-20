from pathlib import Path
import json,hashlib,itertools
root=Path('/Users/rcourson/Documents/Vibe/web');snap=root/'out/provided-ui-original-1.26.1016.1852';receipt=snap/'recovery-inventory.json';d=json.loads(receipt.read_text());sha=lambda b:hashlib.sha256(b).hexdigest();remaining=[]
for x in d['missing']:
 row=x['row'];src=root/'out/provided-reuse-v241-brand/ui'/x['component']/row['path'];output=src.read_text();anchors=row['anchors'];candidates=[];recipe=''
 inverse=output
 for a in reversed(anchors):
  if a['replace']:inverse=inverse.replace(a['replace'],a['find'])
 if x['path']=='assets/tool-definition-registry-Cc6FCFb2.js':
  text=output
  for a in reversed(anchors[1:]):
   assert text.count(a['replace'])==a['count'];text=text.replace(a['replace'],a['find'])
  positions=[];pos=0
  while (pos:=text.find('Aux',pos))>=0:positions.append(pos);pos+=3
  for selected in itertools.combinations(positions,6):
   candidate=text
   for pos in reversed(selected):candidate=candidate[:pos]+'Aside'+candidate[pos+3:]
   if sha(candidate.encode())==x['sha256']:candidates=[candidate];recipe='inverse exact geometry anchors, then six of ten Aux occurrences selected solely by original SHA256';break
 elif x['path']=='manifest.json':
  text=output
  # Invert precise identities before their shared-prefix inverse.
  order=[7,6,5,4,0,1,2,3]
  for idx in order:
   a=anchors[idx];text=text.replace(a['replace'],a['find'])
  candidates=[text];recipe='inverse precise identity replacements before shared prefix, then original SHA256 validation'
 elif x['path']=='content/content.js':
  text=inverse
  context='"http://0.0.0.0:5175"]'
  assert text.count(context)==1
  text=text.replace(context,'"http://0.0.0.0:5175","https://aside.at"]')
  candidates=[text];recipe='inverse stage anchors; restore removed origin after unique http://0.0.0.0:5175 array member; original SHA256 validation'
 else:
  candidates=[inverse];recipe='inverse broad bridge identifier covers installed-name substring; original SHA256 validation'
 success=False
 for text in candidates:
  b=text.encode()
  if sha(b)!=x['sha256']:continue
  replay=text
  for a in anchors:
   assert replay.count(a['find'])==a['count'],(x['path'],a['find'][:30],replay.count(a['find']),a['count'])
   replay=replay.replace(a['find'],a['replace'])
  assert replay==output
  dest=snap/x['component']/x['path'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b);d['records'].append({'component':x['component'],'path':x['path'],'sha256':x['sha256'],'size':len(b),'method':'exact-inverse-stage-anchors','recipe':recipe,'forwardReplay':'PASS'});success=True;print('RECOVERED',x['path'])
 if not success:remaining.append(x);print('FAILED',x['path'])
d['missing']=remaining;receipt.write_text(json.dumps(d,indent=2)+'\n')

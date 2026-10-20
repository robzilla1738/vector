from pathlib import Path
import json,hashlib,subprocess
root=Path('/Users/rcourson/Documents/Vibe/web');snap=root/'out/provided-ui-original-1.26.1016.1852';receipt=snap/'recovery-inventory.json';d=json.loads(receipt.read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
roots=[Path('/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1020.1855'),Path('/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1020.23'),Path('/Users/rcourson/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852'),Path('/Users/rcourson/AI Blueprints/06'),Path('/Users/rcourson/Downloads/aside-rea 2')]
wanted={x['sha256']:x for x in d['missing']};names={Path(x['path']).name for x in d['missing']};candidates=[]
for r in roots:
 if r.exists():
  for p in r.rglob('*'):
   if p.is_file() and p.name in names:candidates.append(p)
for p in candidates:
 b=p.read_bytes();h=sha(b)
 if h in wanted:
  row=wanted.pop(h);dest=snap/row['component']/row['path'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b);d['records'].append({'component':row['component'],'path':row['path'],'sha256':h,'size':len(b),'method':'static-hash-equality','recoverySource':str(p)});print('MATCH',row['path'],str(p))
d['missing']=list(wanted.values());receipt.write_text(json.dumps(d,indent=2)+'\n');print('Remaining',[(x['component'],x['path']) for x in d['missing']])

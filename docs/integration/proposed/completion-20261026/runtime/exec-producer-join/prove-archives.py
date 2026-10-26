"""Read-only exact archive/member/source proof; never load/link an artifact."""
from pathlib import Path
import hashlib,json,subprocess
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web')
sha=lambda b:hashlib.sha256(b).hexdigest()
plan=ROOT/'docs/integration/proposed/profile-isolation-continuation/build/archive-plan.json'
receipt=Path('/private/tmp/aux-isolated-node-archives-20261023/receipt.json')
compile_receipt=ROOT/'docs/integration/proposed/profile-isolation-next/spawn-custody/evidence/compile-r3.json'
p=json.loads(plan.read_text());r=json.loads(receipt.read_text());c=json.loads(compile_receipt.read_text())
assert r['passed'] and r['planSha256']==sha(plan.read_bytes())
records=[]
for original,actual in zip(p['archives'],r['archives']):
 archive=Path(actual['path']);assert sha(archive.read_bytes())==actual['sha256']
 for member in original['replacements']:
  data=subprocess.check_output(['/usr/bin/ar','-p',str(archive),member['member']]);assert sha(data)==member['sha256']
  object_path=Path(member['path']);assert sha(object_path.read_bytes())==member['sha256']
  kind={'process_wrap.o':('process-wrap','process_wrap.cc'),'spawn_sync.o':('spawn-sync','spawn_sync.cc'),'process.o':('libuv-process','process.c')}[member['member']]
  command=next(x['command'] for x in c['commands'] if x['name']==kind[0]);source=Path(next(x for x in command if x.endswith('/'+kind[1])))
  assert sha(source.read_bytes())==c['frozenFiles'][str(source)]
  tracked=ROOT/'docs/integration/proposed/profile-isolation-next/spawn-custody/source'/kind[1]
  assert tracked.read_bytes()==source.read_bytes()
  imports=subprocess.check_output(['/usr/bin/nm','-u',str(object_path)],text=True)
  records.append({'archive':str(archive),'archiveSha256':actual['sha256'],'member':member['member'],'memberSha256':sha(data),'actualCompiledObject':str(object_path),'actualCompiledSource':str(source),'sourceSha256':sha(source.read_bytes()),'trackedIdenticalSource':str(tracked),'compileCommand':command,'auxImports':[line.strip() for line in imports.splitlines() if 'AuxNativeExec' in line]})
(HERE/'archive-proof.json').write_text(json.dumps({'format':'aux.actual-retained-exec-producer-proof.v1','passed':True,'inputs':{str(x):sha(x.read_bytes()) for x in [plan,receipt,compile_receipt]},'records':records,'loaded':False,'linked':False,'executed':False},indent=2)+'\n')
print('Exact archive members/source compiler pins match:',len(records))

#!/usr/bin/env python3
"""Compose private supervised resources into copies of the current signed leaves."""
from pathlib import Path
import argparse,difflib,hashlib,json,subprocess
HERE=Path(__file__).resolve().parent;RUNTIME=HERE.parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web')
def sha(value):return hashlib.sha256(value).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args();out=Path(args.output);assert not out.exists();out.mkdir(mode=0o700)
selection=json.loads((ROOT/'docs/integration/proposed/completion-20261026/integrator/current-source-selection.json').read_text());base=Path(selection['candidate'])/'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development'
plans=[RUNTIME/'fixed-pty-linked/entry.anchors.json',RUNTIME/'exec-producer-join/entry.anchors.json',RUNTIME/'exec-session-runtime/entry.anchors.json',RUNTIME/'cli-repl-drain/entry.anchors.json']
records=[]
for name in ['index.mjs','aux-native-entry.mjs']:
 source=base/name;text=source.read_text();before=text;applied=[]
 if name=='index.mjs':
  # The original index still lacks the already accepted entry lifetime joins.
  lifetime=ROOT/'docs/integration/proposed/aux-native-exec-lifetime/edits.json'
  for index,anchor in enumerate(json.loads(lifetime.read_text())['edits']):
   if index==4: continue # preserve the later physical-close latch below
   assert text.count(anchor['find'])==1,(name,'lifetime',index)
   text=text.replace(anchor['find'],anchor['replace']);applied.append({'plan':str(lifetime),'anchor':index,'count':1})
  old='async function spawnSandboxed(Cn){let ei=await wrapSandboxCommand(Cn);Cn.signal?.throwIfAborted();'
  assert text.count(old)==1
  text=text.replace(old,old.replace('(Cn){','(Cn,onStart){')+'onStart?.();')
  loader=json.loads((ROOT/'docs/integration/proposed/aux-native-fixed-pty-loading/anchor.json').read_text())['anchor'].replace('let ei=path.dirname(process.execPath),ti=','let ei=__auxDaemonMacOS,ti=')
  replacement=json.loads(plans[0].read_text())['anchors'][0]['before']
  assert text.count(loader)==1
  text=text.replace(loader,replacement)
  applied.append({'plan':'current-index-lifetime-and-loader-rebase','count':1})
 for plan in plans:
  data=json.loads(plan.read_text())
  for index,anchor in enumerate(data['anchors']):
   anchor=dict(anchor)
   if plan.parent.name=='exec-session-runtime' and index==6:
    anchor['before']='ci.proc.auxPhysicalClose.then(auxBashClosed);let ui=new AbortController,di=()=>ui.abort(ni?.reason);'
    anchor['after']='ci.proc.auxPhysicalClose.then(auxBashClosed);ni=ci.accountSignal;let ui=new AbortController,di=()=>ui.abort(ni?.reason);'
   count=text.count(anchor['before']);assert count==anchor.get('count',1),(name,str(plan),index,count)
   text=text.replace(anchor['before'],anchor['after']);applied.append({'plan':str(plan),'anchor':index,'count':count})
  if 'selectedGuardAnchor' in data:
   anchor=data['selectedGuardAnchor'];assert text.count(anchor['before'])==1;text=text.replace(anchor['before'],anchor['after']);applied.append({'plan':str(plan),'anchor':'selectedGuardAnchor','count':1})
 original=(RUNTIME/'cli-repl-drain/source/selected-repl-resource.mjs').read_text().rstrip()
 successor=(HERE/'source/selected-repl-resource.mjs').read_text().rstrip()
 assert text.count(original)==1,(name,'generic factory source')
 text=text.replace(original,(HERE/'source/selected-repl-fs-resource.mjs').read_text().rstrip()+'\n'+successor)
 target=out/name;target.write_text(text);subprocess.run(['node','--check',str(target)],check=True)
 records.append({'input':str(source),'inputSha256':sha(before.encode()),'output':str(target),'outputSha256':sha(text.encode()),'anchors':applied,'genericFactoryCount':1,'parsePassed':True})
result={'format':'aux.supervised-current-resource-composition.v1','signedPredecessorInventory':selection['signedInventorySha256'],'records':records,'sourcePlans':{str(p):sha(p.read_bytes()) for p in plans},'activated':False,'candidateChanged':False,'providerCalls':0}
(out/'receipt.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'passed':True,'receipt':str(out/'receipt.json')}))

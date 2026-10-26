#!/usr/bin/env python3
"""Apply the final accepted chat-start repair to both frozen future resources."""
from pathlib import Path
import argparse,hashlib,json,subprocess
HERE=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args();out=Path(args.output);assert not out.exists()
plan_path=HERE/'final-resource-plan.json';plan=json.loads(plan_path.read_text());plan_hash=sha(plan_path)
pins={str(plan_path):plan_hash,plan['correctionProposal']:plan['correctionProposalSha256']}
for item in plan['checks']+plan['nativeReceipts']:pins[item['path']]=item['sha256']
for item in plan['resources']:pins[item['input']]=item['inputSha256']
def verify():
 for path,expected in pins.items():assert sha(path)==expected,('Frozen input changed',path)
verify();out.mkdir(mode=0o700)
receipt={'format':'aux.future-final-resource-composition.v1','planSha256':plan_hash,'correctionCommit':plan['correctionCommit'],'nativeReceipts':plan['nativeReceipts'],'resources':[],'checks':[],'passed':False,'nativeRebuilt':False,'signed':False,'appModified':False,'modelCalls':0}
try:
 for item in plan['resources']:
  text=Path(item['input']).read_text();counts=[]
  for rule in plan['rules']:
   count=text.count(rule['find']);assert count==rule['count'];text=text.replace(rule['find'],rule['replace']);counts.append(count)
  target=out/item['name'];target.write_text(text);assert sha(target)==item['outputSha256']
  commands=[['node','--check',str(target)]]+[['node',check['path'],str(target)] for check in plan['checks']]
  for index,command in enumerate(commands):
   done=subprocess.run(command,capture_output=True,text=True);log=out/(item['name']+f'.check-{index}.log');log.write_text(done.stdout+done.stderr)
   receipt['checks'].append({'resource':item['name'],'command':command,'exitCode':done.returncode,'log':str(log),'logSha256':sha(log)});assert done.returncode==0,(item['name'],index,str(log))
  receipt['resources'].append({**item,'output':str(target),'ruleCounts':counts})
 verify();receipt['passed']=True;receipt['inputPinsCheckedBeforeAndAfter']=True
finally:(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'receipt':str(out/'receipt.json'),'sha256':sha(out/'receipt.json')}))

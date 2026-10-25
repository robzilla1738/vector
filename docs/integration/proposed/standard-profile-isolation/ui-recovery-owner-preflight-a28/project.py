"""Extract one shared real A27 owner preflight; preserve its actual predicates."""
from pathlib import Path
import hashlib,json,difflib
H=Path(__file__).resolve().parent
A=H.parent/'ui-recovery-owner-adoption-a27'
sha=lambda b:hashlib.sha256(b).hexdigest()
s=(A/'runtime-output.js.txt').read_text()
first=s.index('function auxAdoptDraftMigrationRecovery(')
last=s.index('\nlet auxDraftMigrationLastHandoff=',first)
old=s[first:last]
pre_start=old.index('    auxAssertDraftMigrationOwners(leaseId,revision);')
pre_end=old.index('    lease.adoption=')
pre=old[pre_start:pre_end]
store_line='    if(!auxDraftRecoveryStoresEqual(currentCapture,capture))throw Error("Native desired stores are not actually observed");'
assert pre.count(store_line)==1
pre=pre.replace(store_line,'    if(requirePublishedStores&&!auxDraftRecoveryStoresEqual(currentCapture,capture))throw Error("Native desired stores are not actually observed");')
helper='''function auxDraftRecoveryPrepareOwnerPlan(leaseId,revision,plan,requirePublishedStores){
  const lease=auxDraftMigrationLease,raw=JSON.stringify(plan);
  if(typeof raw!=="string"||raw.length>67108864)throw Error("Owner adoption plan exceeds its bound");
'''+pre+'''  return{lease,raw,owners,memory,memoryJson,capture};
}
function auxCheckDraftMigrationRecoveryAdoption(leaseId,revision,plan){
  const lease=auxDraftMigrationLease;
  try{
    // A check happens BEFORE native physical Restore. The actual original
    // fresh renderer source remains sealed and must still validate strictly.
    const current=auxValidateDraftMigrationCapture(leaseId,revision);
    if(!current.ok)throw Error(current.error??"Fresh source lease changed before owner preflight");
    const prepared=auxDraftRecoveryPrepareOwnerPlan(leaseId,revision,plan,false);
    // Setter closures are discarded without invocation. No plan, memory,
    // owner, ACK, source baseline or adoption phase is changed by this read.
    return{format:"aux.ui-draft-owner-adoption-preflight.v1",ok:true,readOnly:true,retained:true,
      requestId:lease.requestId,leaseId,revision};
  }catch(error){return{format:"aux.ui-draft-owner-adoption-preflight.v1",ok:false,readOnly:true,
    retained:!!lease,requestId:lease?.requestId,leaseId:lease?.id,revision:lease?.revision,
    error:String(error?.message??error)}}
}
'''
replacement=old[:pre_start]+'''    const {owners,memory,memoryJson,capture}=auxDraftRecoveryPrepareOwnerPlan(leaseId,revision,plan,true);
'''+old[pre_end:]
assert replacement.count('lease.adoption={planJson:raw')==1
runtime=s[:first]+helper+replacement+s[last:]
(H/'runtime-output.js.txt').write_text(runtime)
codec='assets/draft-storage-ixLojjZ5.js'
original=(A/'source'/codec).read_text()
assert original.count(old)==1
before='auxReadDraftMigrationRecoveryHandoff};'
after='auxReadDraftMigrationRecoveryHandoff,auxCheckDraftMigrationRecoveryAdoption};'
assert original.count(before)==1
output=original.replace(old,helper+replacement).replace(before,after)
p=H/'source'/codec;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(output)
patch=[]
for line in difflib.unified_diff(original.splitlines(True),output.splitlines(True),fromfile='a/'+codec,tofile='b/'+codec):
 patch.append(line if line.endswith('\n') else line+'\n\\ No newline at end of file\n')
(H/'modules.patch').write_text(''.join(patch))
plan={'format':'aux.ui-recovery-owner-preflight.source.v1','predecessorCommit':'64a41fbe3','files':[{'path':codec,'input':str(A/'source'/codec),'inputSha256':sha(original.encode()),'output':str(p),'outputSha256':sha(output.encode()),'anchors':[{'find':old,'replace':helper+replacement,'count':1},{'find':before,'replace':after,'count':1}]}],'runtimeInputSha256':sha(s.encode()),'runtimeOutputSha256':sha(runtime.encode()),'activeAdaptersChanged':False,'nativeExecuted':False,'productExecuted':False}
(H/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
(H/'adapter-delta-request.json').write_text(json.dumps({'format':'aux.ui-recovery-owner-preflight.adapter-request.v1','predecessorCommit':'64a41fbe3','sourcePlan':'source-plan.json','runtimeReplacement':'runtime-output.js.txt','exportsAdded':['auxCheckDraftMigrationRecoveryAdoption'],'owner':'root','note':'Extracts the existing real A27 predicates once. Adopt keeps every prior check; only Check skips desired-store publication and invokes no setters.'},indent=2)+'\n')
print(json.dumps({'files':1,'countedAnchors':2,'sourcePlanSha256':sha((H/'source-plan.json').read_bytes())}))

from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent;root=base.parents[4];files=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
p=root/'vendor/provided/aux-ui-draft-closure-runtime.js.txt';old=p.read_text();s=old;rules=[]
def edit(a,b):
 global s
 assert s.count(a)==1,(s.count(a),a[:120]);s=s.replace(a,b);rules.append({'find':a,'replace':b,'count':1})
edit('function auxPrepareDraftMigrationCapture(requestId,wireFormat){','''function auxPrepareDraftMigrationRecoveryCapture(requestId,wireFormat){
  return auxPrepareDraftMigrationCapture(requestId,wireFormat,"recovery-read-only");
}
function auxPrepareDraftMigrationCapture(requestId,wireFormat,captureMode){
  if(captureMode!==undefined&&captureMode!=="recovery-read-only")
    return{format:auxDraftMigrationFormat,ok:false,error:"Unsupported Aux draft capture mode"};''')
edit('captureJson:null,memoryJson:null,sealed:false,revision:0', 'captureJson:null,memoryJson:null,ownerStateJson:null,recoveryReadOnly:captureMode==="recovery-read-only",sealed:false,revision:0')
edit('''    auxDraftMigrationFlushing=true;
    try{for(const {owner} of owners){
      const result=owner.flush();
      if(result&&typeof result.then==="function"){auxDraftMigrationUnknownWork.add("async-flush");throw Error("Asynchronous editor flush is unsupported")}
    }}finally{auxDraftMigrationFlushing=false}''','''    if(!lease.recoveryReadOnly){
      auxDraftMigrationFlushing=true;
      try{for(const {owner} of owners){
        const result=owner.flush();
        if(result&&typeof result.then==="function"){auxDraftMigrationUnknownWork.add("async-flush");throw Error("Asynchronous editor flush is unsupported")}
      }}finally{auxDraftMigrationFlushing=false}
    }''')
edit('''    lease.memoryJson=auxDraftMigrationMemorySignature();
    lease.captureJson=auxDraftMigrationCaptureJson();''','''    lease.memoryJson=auxDraftMigrationMemorySignature();
    const ownerStates=owners.map(({kind},index)=>({kind,signatureJson:lease.signatures[index]}));
    ownerStates.sort((a,b)=>a.kind<b.kind?-1:a.kind>b.kind?1:a.signatureJson<b.signatureJson?-1:a.signatureJson>b.signatureJson?1:0);
    lease.ownerStateJson=JSON.stringify(ownerStates);
    if(lease.ownerStateJson.length+lease.memoryJson.length>33554432)
      throw Error("Aux recovery owner state exceeds its bound");
    lease.captureJson=auxDraftMigrationCaptureJson();''')
edit('''leaseId:lease.id,revision:lease.revision,ownerCount:lease.signatures.length,sealed:lease.sealed};''','''leaseId:lease.id,revision:lease.revision,ownerCount:lease.signatures.length,sealed:lease.sealed,
    recoveryReadOnly:lease.recoveryReadOnly,ownerStateJson:lease.ownerStateJson,memoryStateJson:lease.memoryJson};''')
p.write_text(s);files.append({'path':str(p.relative_to(root)),'inputSha256':sha(old.encode()),'outputSha256':sha(s.encode()),'anchors':rules})
pins=root/'docs/integration/proposed/standard-profile-isolation/ui-editor-writer-closure-a1/inputs.json';old=pins.read_text();data=json.loads(old)
for f in data['files']:
 if f['path']=='assets/draft-storage-ixLojjZ5.js':
  rule=next(r for r in f['rules'] if '__AUX_CLOSURE_RUNTIME__' in r['replace'])
  rule['replace']=rule['replace'].replace('auxPrepareDraftMigrationCapture,','auxPrepareDraftMigrationCapture,auxPrepareDraftMigrationRecoveryCapture,')
data['runtimeSha256']=sha(s.encode());pins.write_text(json.dumps(data,indent=2)+'\n');files.append({'path':str(pins.relative_to(root)),'inputSha256':sha(old.encode()),'outputSha256':sha(pins.read_bytes()),'note':'same original/predecessor pins and counted rules; runtime SHA and one added finite export only'})
(base/'adapter-delta.json').write_text(json.dumps({'format':'aux.ui-recovery-owner-capture.v1','files':files},indent=2)+'\n')

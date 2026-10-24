#!/usr/bin/env python3
"""Definitive no-lease observation successor; never edits actual native files."""
from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent;BASE=HERE.parent/'native-dom-control-cohort-glue-a1/source';rows=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
def project(path,anchors):
 original=BASE/path;data=original.read_bytes();text=data.decode()
 for e in anchors:assert text.count(e['find'])==e['count']==1,(path,e['name']);text=text.replace(e['find'],e['replace'])
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 rows.append({'path':path,'inputSource':str(original),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'source':str(target),'anchors':anchors})
project('components/services/storage/public/mojom/local_storage_control.mojom',[
 edit('Distinct definitive no-lease observation, never inferred from absence','  bool released;\n};','  bool released;\n  // Same-service original attempt returned no lease and native cleanup completed.\n  bool aborted;\n};')])
for kind in ['local','session']:
 prefix='components/services/storage/dom_storage/'+kind+'_storage_impl'
 project(prefix+'.h',[
  edit('Finite definitive pre-gate result correlation','  std::optional<AuxUiReleasedReceipt> aux_ui_released_;','''  std::optional<AuxUiReleasedReceipt> aux_ui_released_;
  struct AuxUiAbortedReceipt {
    base::UnguessableToken request;
    uint64_t generation;
    std::string error;
  };
  std::optional<AuxUiAbortedReceipt> aux_ui_aborted_;''')])
 factory='''mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseAborted(
    const base::UnguessableToken& request, std::string error) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->ok = false;
  reply->held = false;
  reply->source_ready = false;
  reply->aborted = true;
  reply->request_id = request;
  reply->error = std::move(error);
  return reply;
}
'''
 begin='''  if (aux_ui_released_ && aux_ui_released_->request == request_id) {'''
 before='''  if (aux_ui_aborted_ && aux_ui_aborted_->request == request_id) {
    if (aux_ui_aborted_->generation == aux_ui_generation_)
      std::move(callback).Run(AuxDomLeaseAborted(request_id, aux_ui_aborted_->error));
    else
      std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
          "Retired original DOM request cannot prepare again"));
    return;
  }
'''
 oldlocal='''        if (!lease.has_value()) {
          owner->aux_ui_request_.reset();
          std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, nullptr,
              lease.error().ToString()));
          return;
        }'''
 oldsession='''        if (!lease.has_value()) {
          if (owner->ResumeAuxUiNamespaces(request)) {
            owner->aux_ui_frozen_namespaces_.clear();
            owner->aux_ui_namespaces_resumed_ = false;
            owner->aux_ui_namespace_error_.clear();
            owner->aux_ui_request_.reset();
          }
          std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, nullptr,
              lease.error().ToString()));
          return;
        }'''
 aborted='''          const std::string error = lease.error().ToString();
          owner->aux_ui_retired_requests_.insert(request);
          owner->aux_ui_aborted_ = AuxUiAbortedReceipt{request, generation, error};
          owner->aux_ui_request_.reset();
          // Only this actual no-lease callback and concrete native cleanup
          // create the observation. Timeout, missing owner and null-success
          // lease remain unknown and never enter this branch.
          std::move(callback).Run(AuxDomLeaseAborted(request, error));
          return;
'''
 new='''        if (!lease.has_value()) {
'''
 if kind=='session':new+='''          if (!owner->ResumeAuxUiNamespaces(request)) {
            std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, nullptr,
                owner->aux_ui_namespace_error_));
            return;
          }
          owner->aux_ui_frozen_namespaces_.clear();
          owner->aux_ui_namespaces_resumed_ = false;
          owner->aux_ui_namespace_error_.clear();
'''
 new+=aborted+'        }'
 cls=kind.title()+'StorageImpl'
 read='''void @CLASS@::ReadAuxUiPreferenceLease(const base::UnguessableToken& request_id, ReadAuxUiPreferenceLeaseCallback callback) {
'''.replace('@CLASS@',cls)
 observed='''  if (aux_ui_aborted_ && aux_ui_aborted_->request == request_id &&
      aux_ui_aborted_->generation == aux_ui_generation_) {
    std::move(callback).Run(AuxDomLeaseAborted(request_id, aux_ui_aborted_->error));
    return;
  }
'''
 project(prefix+'.cc',[
  edit('No-lease result has its own explicit correlated reply','mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseSnapshot(',factory+'mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseSnapshot('),
  edit('Retired failed Begin cannot recreate a hold',begin,before+begin),
  edit('Record only actual no-lease result after concrete native cleanup',oldsession if kind=='session'else oldlocal,new),
  edit('Read recovers only exact same-service-generation no-lease observation',read,read+observed)])
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.dom-cohort.control-result-observation.v1','predecessorCommit':'e638d5cd1','files':rows,'actualNativeMutation':False,'compilerRun':False,'runtimeAcceptance':False},indent=2)+'\n')
patch=''.join(''.join(difflib.unified_diff(Path(r['inputSource']).read_text().splitlines(True),Path(r['source']).read_text().splitlines(True),fromfile='a/'+r['path'],tofile='b/'+r['path']))for r in rows)
(HERE/'native.patch').write_text(patch)
print(json.dumps({'files':len(rows),'singleMatchAnchors':sum(len(r['anchors'])for r in rows),'actualNativeMutation':False,'compilerRun':False}))

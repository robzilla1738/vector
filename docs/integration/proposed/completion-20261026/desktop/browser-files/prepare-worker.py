#!/usr/bin/env python3
from pathlib import Path
import argparse,hashlib,json,difflib
H=Path(__file__).resolve().parent
DEFAULT=Path('/Users/rcourson/Documents/Vibe/aux-completion-20261026/runtime/docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/source')
p=argparse.ArgumentParser();p.add_argument('--source',type=Path,default=DEFAULT);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);plans=[]
for name,rules in [('AuxSelectedBuiltinOwner.inc',[
 ('struct FixedOutputs;','napi_value SelectedReadUploadFile(napi_env,napi_callback_info);\nnapi_value SelectedPublishBrowserDownload(napi_env,napi_callback_info);\nstruct FixedOutputs;'),
 ('{{"assertCurrent",SelectedAssert}', '{{"readUploadFile",SelectedReadUploadFile},{"publishBrowserDownload",SelectedPublishBrowserDownload},{"assertCurrent",SelectedAssert}')]),
 ('AuxDevelopmentWorkerHost.cc', [('#include "AuxFixedBuiltins.inc"','#include "AuxFixedBuiltins.inc"\n#include "AuxSelectedBrowserFiles.inc"')])]:
 source=a.source/name;s=source.read_text();before=s;anchors=[]
 for old,new in rules:
  assert s.count(old)==1,(name,old,s.count(old));s=s.replace(old,new);anchors.append({'before':old,'after':new,'count':1})
 target=a.out/name;target.write_text(s)
 plans.append({'path':name,'inputPath':str(source),'inputSha256':hashlib.sha256(before.encode()).hexdigest(),'outputSha256':hashlib.sha256(s.encode()).hexdigest(),'outputPath':str(target),'anchors':anchors})
name='AuxSelectedBrowserFiles.inc';s=(H/'source'/name).read_text();(a.out/name).write_text(s)
plans.append({'path':name,'new':True,'outputPath':str(a.out/name),'outputSha256':hashlib.sha256(s.encode()).hexdigest()})
(a.out/'worker-source-plan.json').write_text(json.dumps({'files':plans},indent=2)+'\n')

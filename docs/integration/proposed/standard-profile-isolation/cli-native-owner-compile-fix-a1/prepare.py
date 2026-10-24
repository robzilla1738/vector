#!/usr/bin/env python3
"""Four-file correction from actual compiler diagnostics. No native mutation."""
from pathlib import Path
import difflib,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda b:hashlib.sha256(b).hexdigest();rows=[]
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
def project(path,anchors):
 p=ROOT/path;original=p.read_bytes();text=original.decode()
 for e in anchors:assert text.count(e['find'])==e['count']==1,(path,e['name']);text=text.replace(e['find'],e['replace'])
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 before=HERE/'before'/path;before.parent.mkdir(parents=True,exist_ok=True);before.write_bytes(original)
 assert p.read_bytes()==original
 rows.append({'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'source':str(target),'beforeImage':str(before),'anchors':anchors})
project('base/process/mac/aux_browser_descendant_cli_membership.h',[
 edit('Actual audit_token_t declaration from the native Mach SDK','#include <bsm/audit.h>','#include <bsm/audit.h>\n#include <mach/mach.h>')])
project('chrome/browser/aux/cli/AuxCliIngress.cc',[
 edit('Preserve actual checked dynamic registration with one-call diagnostic scope',
 ' if(!state->images->RevalidateSelf()||bootstrap_register(bootstrap_port,const_cast<char*>(state->images->service().c_str()),send.value)!=KERN_SUCCESS||!state->images->RevalidateSelf())return{};',
 ''' if(!state->images->RevalidateSelf())return{};
 // A dynamic private service has no installed launchd declaration. check_in
 // would require unrelated installation and is not an equivalent replacement.
 // Keep this one real checked registration; do not suppress other diagnostics.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
 const auto registered=bootstrap_register(bootstrap_port,
     const_cast<char*>(state->images->service().c_str()),send.value);
#pragma clang diagnostic pop
 if(registered!=KERN_SUCCESS||!state->images->RevalidateSelf())return{};''')])
project('chrome/browser/aux/cli/AuxCliSealedImages.cc',[
 edit('Descriptor cleanup owns its vector without a native reference field',
 '  std::vector<int> held;struct Cleanup{std::vector<int>& values;~Cleanup(){for(auto it=values.rbegin();it!=values.rend();++it)close(*it);}}cleanup{held};',
 '  struct Cleanup{std::vector<int> values;~Cleanup(){for(auto it=values.rbegin();it!=values.rend();++it)close(*it);}}cleanup;\n  auto& held=cleanup.values;')])
project('chrome/browser/aux/cli/AuxCliOpenCommand.mm',[
 edit('Explicit process-lifetime holder dependency','#include "base/memory/weak_ptr.h"','#include "base/memory/weak_ptr.h"\n#include "base/no_destructor.h"'),
 edit('No exit-time service destruction or implicit thread join',
 'namespace {std::shared_ptr<NativeOpenService> service;bool start_attempted=false;}',
 '''namespace {
std::shared_ptr<NativeOpenService>& RetainedService(){
  // Actual Close/join and retained counters remain explicit. Static teardown
  // must not destroy a service/thread or manufacture a settled observation.
  static base::NoDestructor<std::shared_ptr<NativeOpenService>> service;
  return *service;
}
bool start_attempted=false;
}'''),
 edit('Actual startup uses retained process-lifetime service slot',
 '  start_attempted=true;Counters().started.store(true);service=std::make_shared<NativeOpenService>();',
 '  auto& service=RetainedService();\n  start_attempted=true;Counters().started.store(true);service=std::make_shared<NativeOpenService>();'),
 edit('Actual close still joins the retained receiver explicitly',
 '  admission_closed=true;Counters().closed.store(true);if(service)service->Close();',
 '  auto& service=RetainedService();\n  admission_closed=true;Counters().closed.store(true);if(service)service->Close();')])
logs=Path('/private/tmp/aux-feature-completion-native-compile-20261024-cli-storage-a12b')
pins=[]
for name in ['AuxCliSealedImages','AuxCliOpenCommand','AuxCliIngress','aux_browser_descendant_engine','aux_browser_descendant_bridge']:
 p=logs/(name+'.stderr');pins.append({'path':str(p),'sha256':sha(p.read_bytes())})
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.cli-native-owner.compile-fix.v1','files':rows,'diagnostics':pins,'actualNativeMutation':False,'compilerRun':False,'runtimeAcceptance':False},indent=2)+'\n')
patch=''.join(''.join(difflib.unified_diff(Path(r['beforeImage']).read_text().splitlines(True),Path(r['source']).read_text().splitlines(True),fromfile='a/'+r['path'],tofile='b/'+r['path']))for r in rows)
(HERE/'native.patch').write_text(patch)
print(json.dumps({'files':len(rows),'singleMatchAnchors':sum(len(r['anchors'])for r in rows),'actualNativeMutation':False,'compilerRun':False}))

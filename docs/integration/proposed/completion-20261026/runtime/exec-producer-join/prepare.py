from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
BASE=HERE.parent/'fixed-pty-retirement/source'
PRIOR=ROOT/'docs/integration/proposed/profile-isolation-next/spawn-custody/source'
sha=lambda b:hashlib.sha256(b).hexdigest()
records=[];patch=[]
def make(path,name,pairs):
 before=path.read_text();after=before
 for a,z in pairs:
  assert after.count(a)==1,(name,a[:100],after.count(a));after=after.replace(a,z)
 (HERE/'source'/name).write_text(after)
 records.append({'input':str(path),'inputSha256':sha(before.encode()),'output':str(ROOT/'docs/integration/proposed/completion-20261026/runtime/exec-producer-join/source'/name),'outputSha256':sha(after.encode()),'anchors':[{'before':a,'after':z,'count':1} for a,z in pairs]})
 patch.append(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(path),tofile=name)))
 return after
worker=(BASE/'AuxDevelopmentWorkerHost.cc').read_text()
# Shared template default remains empty for PTY; only exec captures selected.
pairs=[
 ('struct RuntimeScope;','struct RuntimeScope;\nstruct SelectedBuiltinScope;'),
 ('  bool physical_registered=false,reaper_thread_joined=false,transport_closed=false;','  bool physical_registered=false,reaper_thread_joined=false,transport_closed=false;\n  std::shared_ptr<SelectedBuiltinScope> selected_scope;'),
 ('  bool transport_settled=true,runtime_cohort_released=false;\n  // Registry.retained','  bool transport_settled=true,runtime_cohort_released=false;\n  std::shared_ptr<SelectedBuiltinScope> selected_scope;\n  // Registry.retained'),
 ('#include "AuxFixedPtyLinked.inc"','#include "AuxFixedPtyLinked.inc"\n#include "AuxSelectedExecProducer.inc"'),
 ('        std::shared_ptr<RuntimeScope> runtime;\n        bool closed', '        std::shared_ptr<RuntimeScope> runtime;\n        std::shared_ptr<SelectedBuiltinScope> selected;\n        bool closed'),
 ('if(item->transport_settled&&!item->runtime_cohort_released){item->runtime_cohort_released=true;runtime = item->runtime_scope;}', 'if(item->transport_settled&&!item->runtime_cohort_released){item->runtime_cohort_released=true;runtime = item->runtime_scope;selected=std::move(item->selected_scope);}'),
 ('        if (runtime) RuntimeChildCohortSettled(runtime);','        if (runtime) RuntimeChildCohortSettled(runtime);\n        if(selected)selected->Finish();'),
 ('extern "C" void* AuxNativeExecBeginCurrent(void) noexcept {', 'extern "C" void AuxNativeExecOriginalHandleClosed(void* token) noexcept {ObserveExecOriginalHandleClosed(token); }\nextern "C" void* AuxNativeExecBeginCurrent(void) noexcept {'),
 ('    reservation = std::make_shared<PtyReservation>();', '    auto selected=selected_exec_spawn;\n    if(!selected||!selected->Current(selected->env)||selected->captured.worker!=worker)return nullptr;\n    reservation = std::make_shared<PtyReservation>();'),
 ('    // Genuine pending ownership spans all Security/Swift calls.', '    if(!selected->Begin(selected->env)){AuxNativePtySpawnFailed(reservation.get());return nullptr;}\n    reservation->selected_scope=selected;\n    // Genuine pending ownership spans all Security/Swift calls.'),
 ('    reservation = std::make_shared<ExecReservation>();','    auto selected=selected_exec_spawn;\n    if(!selected||!selected->Current(selected->env)||selected->captured.worker!=worker)return nullptr;\n    reservation = std::make_shared<ExecReservation>();'),
 ('    auto pending = CapturePendingExec(reservation.get());','    if(!selected->Begin(selected->env)){AuxNativeExecSpawnFailed(reservation.get());return nullptr;}\n    reservation->selected_scope=selected;reservation->transport_settled=false;\n    auto pending = CapturePendingExec(reservation.get());'),
 ('    if (!pending.owner || !pending.roots) return 0;', '    if (!pending.owner || !pending.roots || !pending.reservation->selected_scope ||\n        !pending.reservation->selected_scope->Current(pending.reservation->selected_scope->env)) return 0;'),
 ('  std::shared_ptr<PtyHelper> released_helper;\n  {\n    std::lock_guard<std::mutex> lock(worker->mutex);\n    // Native producer', '  std::shared_ptr<PtyHelper> released_helper;\n  std::shared_ptr<SelectedBuiltinScope> released_selected;\n  {\n    std::lock_guard<std::mutex> lock(worker->mutex);\n    // Native producer'),
 ('    released_helper = std::move(reservation->helper);\n    // Keep Worker', '    released_helper = std::move(reservation->helper);\n    released_selected=std::move(reservation->selected_scope);\n    // Keep Worker'),
 ('  // Close never releases ownership while the pending count is nonzero.', '  if(released_selected)released_selected->Finish();\n  // Close never releases ownership while the pending count is nonzero.'),
 ('  std::shared_ptr<ExecBrowserRoots> released_roots;\n  bool closed = false;', '  std::shared_ptr<ExecBrowserRoots> released_roots;\n  std::shared_ptr<SelectedBuiltinScope> released_selected;\n  bool closed = false;'),
 ('    released_roots = std::move(reservation->roots);\n    closed = worker->terminal;', '    released_roots = std::move(reservation->roots);\n    released_selected=std::move(reservation->selected_scope);\n    closed = worker->terminal;'),
 ('  reservation->runtime_scope.reset();\n  if (closed) worker->Close();','  reservation->runtime_scope.reset();\n  if(released_selected)released_selected->Finish();\n  if (closed) worker->Close();')]
make(BASE/'AuxDevelopmentWorkerHost.cc','AuxDevelopmentWorkerHost.cc',pairs)
make(ROOT/'docs/integration/proposed/completion-20261026/runtime/final-daemon/source/AuxSelectedBuiltinOwner.inc','AuxSelectedBuiltinOwner.inc',[
 ('struct FixedOutputs;','napi_value SelectedWithExecSpawn(napi_env,napi_callback_info);\nstruct FixedOutputs;'),
 ('{{"readUploadFile",SelectedReadUploadFile}', '{{"withExecSpawn",SelectedWithExecSpawn},{"readUploadFile",SelectedReadUploadFile}')])
make(BASE/'AuxPtyPhysicalRetirement.inc','AuxPtyPhysicalRetirement.inc',[(
 '  std::shared_ptr<RuntimeScope> runtime;bool closed=false;', '  std::shared_ptr<RuntimeScope> runtime;std::shared_ptr<SelectedBuiltinScope> selected;bool closed=false;'),
 ('reservation->runtime_cohort_released=true;runtime=reservation->runtime_scope;', 'reservation->runtime_cohort_released=true;runtime=reservation->runtime_scope;selected=std::move(reservation->selected_scope);'),
 ('  if(runtime)RuntimeChildCohortSettled(runtime);','  if(runtime)RuntimeChildCohortSettled(runtime);\n  if(selected)selected->Finish();')])
for name,pairs in {
 'process_wrap.cc':[( '#include "AuxNativeExecReservation.h"','#include "AuxNativeExecReservation.h"\nextern "C" void AuxNativeExecOriginalHandleClosed(void*) noexcept;'),
 ('  uv_process_t process_;','  void OnClose() override {AuxNativeExecOriginalHandleClosed(aux_exec_reservation_);}\n  uv_process_t process_;')],
 'spawn_sync.cc':[( '#include "AuxNativeExecReservation.h"','#include "AuxNativeExecReservation.h"\nextern "C" void AuxNativeExecOriginalHandleClosed(void*) noexcept;'),
 ('  lifecycle_ = kHandlesClosed;','  lifecycle_ = kHandlesClosed;\n  AuxNativeExecOriginalHandleClosed(aux_exec_reservation_);')]
}.items():make(PRIOR/name,name,pairs)
(HERE/'changes.json').write_text(json.dumps({'format':'aux.selected-exec-producer-join.v1','records':records,'EntitlementRequired':True,'compiled':False,'activated':False,'candidateChanged':False},indent=2)+'\n')
(HERE/'source.patch').write_text(''.join(patch))
# Existing A38 source shapes survive preceding selected/desktop overlays; replay exact additions later.
entry=ROOT/'out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs'
s=entry.read_text();anchors=[]
def replace(a,z):
 global s
 assert s.count(a)==1,(a[:100],s.count(a));s=s.replace(a,z);anchors.append({'before':a,'after':z,'count':1})
replace('async function prepareSessionSpawn(Cn,ei){',(HERE/'source/selected-exec-resource.mjs').read_text()+'\nasync function prepareSessionSpawn(Cn,ei){')
replace('),{spawnOptions:{cwd:ii,env:fi,sandboxEnabled:ti.sandbox.enabled', '),auxPrepareSelectedExec(Cn,{spawnOptions:{cwd:ii,env:fi,sandboxEnabled:ti.sandbox.enabled')
replace('deniedPaths:ti.deniedPaths,detached:!0},release:ri}}catch(Cn){throw ri(),Cn}}','deniedPaths:ti.deniedPaths,detached:!0},release:ri})}catch(Cn){throw ri(),Cn}}')
replace('let ti=spawnCommand(ei.command,{cwd:ei.cwd,env:ei.env,stdio:[`ignore`,`pipe`,`pipe`],detached:Cn.detached??!1,windowsHide:!0});', 'let ti=auxInvokeSelectedExec(Cn,()=>spawnCommand(ei.command,{cwd:ei.cwd,env:ei.env,stdio:[`ignore`,`pipe`,`pipe`],detached:Cn.detached??!1,windowsHide:!0}));')
replace('ni=pty.spawn(ei,ti,{cwd:Cn.cwd,env:{...Cn.env,...PTY_ENV},name:`xterm-256color`,cols:Cn.cols??80,rows:Cn.rows??24,useConptyDll:process.platform===`win32`})','ni=auxInvokeSelectedExec(Cn,()=>pty.spawn(ei,ti,{cwd:Cn.cwd,env:{...Cn.env,...PTY_ENV},name:`xterm-256color`,cols:Cn.cols??80,rows:Cn.rows??24,useConptyDll:process.platform===`win32`}))')
(HERE/'entry.anchors.json').write_text(json.dumps({'input':str(entry),'inputSha256':sha(entry.read_bytes()),'requires':'Existing selected-builtin-resource auxCaptureReadFileScope/guard; no scope fallback','anchors':anchors,'projectedSha256':sha(s.encode()),'activated':False},indent=2)+'\n')
Path('/tmp/aux-selected-exec-entry-proposal.mjs').write_text(s)

from pathlib import Path
import json,hashlib,difflib
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');BASE=HERE.parent/'exec-producer-join/source';PTYPREV=HERE.parent/'fixed-pty-retirement/source';sha=lambda b:hashlib.sha256(b).hexdigest();records=[];patch=[]
def change(path,name,pairs):
 before=path.read_text();after=before
 for a,z in pairs:assert after.count(a)==1,(name,a[:90],after.count(a));after=after.replace(a,z)
 (HERE/'source'/name).write_text(after);records.append({'input':str(path),'inputSha256':sha(before.encode()),'outputSha256':sha(after.encode()),'output':name,'anchors':[{'before':a,'after':z,'count':1} for a,z in pairs]});patch.append(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(path),tofile=name)))
 return after
header=ROOT/'docs/integration/proposed/profile-isolation-next/containment/source/AuxExecSpawnEnvelope.h'
change(header,'AuxExecSpawnEnvelope.h',[
 ('#include "AuxNativeExecReservation.h"','#include "AuxNativeExecReservation.h"\n#include "AuxNativeExecTaskBoundary.h"\n#include <utility>'),
 ('const AuxExecNativeDeniedRoots& roots) noexcept {','const AuxExecNativeDeniedRoots& roots,const AuxExecNativeTaskBoundary& task) noexcept {'),
 ('    std::string policy = "(version 1)\\n(allow default)\\n";', '''    if(task.version!=1)return false;
    const char* task_paths[]={task.taskRoot,task.accountTaskRoot,task.workspace,task.application};
    for(const char* root:task_paths){const size_t length=strnlen(root,4096);if(length<=1||length>=4096||root[0]!='/'||strchr(root,'\\n')||strchr(root,'\\r')||!realpath(root,canonical)||strcmp(root,canonical)!=0)return false;}
    const std::string account_prefix=std::string(task.taskRoot)+"/u/";
    if(std::strncmp(task.accountTaskRoot,account_prefix.c_str(),account_prefix.size())!=0||!task.accountTaskRoot[account_prefix.size()]||strchr(task.accountTaskRoot+account_prefix.size(),'/'))return false;
    // Workspace membership comes from the held stored session/project owner.
    // It is not a broad filesystem allow or replacement for original permissions.
    std::string policy = "(version 1)\\n(allow default)\\n";
    policy += "(deny file-read* file-write* file-map-executable file-link (require-all (subpath (param \\\"AUX_NATIVE_TASK_ROOT\\\")) (require-not (subpath (param \\\"AUX_NATIVE_TASK_ACCOUNT\\\")))))\\n";
    policy += "(deny file-write-unlink (literal (param \\\"AUX_NATIVE_TASK_ACCOUNT\\\")) (path-ancestors (param \\\"AUX_NATIVE_TASK_ACCOUNT\\\")))\\n";
    policy += "(deny file-write* file-link (subpath (param \\\"AUX_NATIVE_APPLICATION\\\")))\\n";
    policy += "(deny file-write-unlink (literal (param \\\"AUX_NATIVE_APPLICATION\\\")) (path-ancestors (param \\\"AUX_NATIVE_APPLICATION\\\")))\\n";'''),
 ('    arguments_.emplace_back("--");','    for(const auto& item:std::vector<std::pair<const char*,const char*>>{{"AUX_NATIVE_TASK_ROOT",task.taskRoot},{"AUX_NATIVE_TASK_ACCOUNT",task.accountTaskRoot},{"AUX_NATIVE_APPLICATION",task.application}}){arguments_.emplace_back("-D");arguments_.push_back(std::string(item.first)+"="+item.second);}\n    arguments_.emplace_back("--");')])
worker=change(BASE/'AuxDevelopmentWorkerHost.cc','AuxDevelopmentWorkerHost.cc',[
 ('#include "AuxNativeExecReservation.h"','#include "AuxNativeExecReservation.h"\n#include "AuxNativeExecTaskBoundary.h"'),
 ('struct SelectedBuiltinScope;','struct SelectedBuiltinScope;\nstruct ExecTaskBoundary;'),
 ('  std::shared_ptr<ExecBrowserRoots> roots;\n  const pid_t process', '  std::shared_ptr<ExecBrowserRoots> roots;\n  std::shared_ptr<ExecTaskBoundary> task_boundary;\n  const pid_t process'),
 ('} // namespace\nextern "C" void AuxNativeExecOriginalHandleClosed', '#include "AuxExecTaskBoundary.inc"\n} // namespace\nextern "C" int32_t AuxNativeExecCopyTaskBoundary(void* token,AuxExecNativeTaskBoundary* result) noexcept {return CopyExecTaskBoundary(token,result);}\nextern "C" void AuxNativeExecOriginalHandleClosed'),
 ('    auto current_roots = CaptureExecRoots(pending.owner);','    auto current_roots = CaptureExecRoots(pending.owner);\n    auto current_task=CaptureExecTaskBoundary(pending.reservation->selected_scope);'),
 ('        current_roots && SameExecRoots(*pending.roots, *current_roots) &&','        current_roots && SameExecRoots(*pending.roots, *current_roots) &&\n        pending.reservation->task_boundary&&current_task&&SameExecTaskBoundary(*pending.reservation->task_boundary,*current_task)&&'),
 ('  std::shared_ptr<ExecBrowserRoots> released_roots;\n  std::shared_ptr<SelectedBuiltinScope> released_selected;', '  std::shared_ptr<ExecBrowserRoots> released_roots;\n  std::shared_ptr<ExecTaskBoundary> released_task;\n  std::shared_ptr<SelectedBuiltinScope> released_selected;'),
 ('  std::shared_ptr<ExecBrowserRoots> released_roots;\n  {', '  std::shared_ptr<ExecBrowserRoots> released_roots;\n  std::shared_ptr<ExecTaskBoundary> released_task;\n  {'),
 ('    released_roots = std::move(reservation->roots);\n    if (child', '    released_roots = std::move(reservation->roots);\n    released_task=std::move(reservation->task_boundary);\n    if (child'),
 ('    released_roots = std::move(reservation->roots);\n    released_selected=std::move(reservation->selected_scope);', '    released_roots = std::move(reservation->roots);\n    released_task=std::move(reservation->task_boundary);\n    released_selected=std::move(reservation->selected_scope);')])
for name in ['process_wrap.cc','spawn_sync.cc']:
 path=BASE/name;source=path.read_text();pair=(('!envelope.Prepare(options, denied_roots)','!envelope.Prepare(options, denied_roots,task_boundary)') if name=='process_wrap.cc' else ('!envelope.Prepare(uv_process_options_, denied_roots)','!envelope.Prepare(uv_process_options_, denied_roots,task_boundary)'))
 token='pending.token' if name=='process_wrap.cc' else 'aux_exec_pending_'
 # Capture task boundary before ordinary envelope construction; failure is known nochild.
 change(path,name,[( '#include "AuxNativeExecReservation.h"','#include "AuxNativeExecReservation.h"\n#include "AuxNativeExecTaskBoundary.h"'),
 ('  AuxExecNativeDeniedRoots denied_roots{};' if name=='spawn_sync.cc' else '    AuxExecNativeDeniedRoots denied_roots{};', ('  ' if name=='spawn_sync.cc' else '    ')+'AuxExecNativeTaskBoundary task_boundary{};\n'+('  ' if name=='spawn_sync.cc' else '    ')+'AuxExecNativeDeniedRoots denied_roots{};'),
 (('!envelope.Prepare(uv_process_options_, denied_roots)' if name=='spawn_sync.cc' else '!envelope.Prepare(options, denied_roots)'), 'AuxNativeExecCopyTaskBoundary('+token+',&task_boundary)!=0 ||\n'+('      ' if name=='spawn_sync.cc' else '        ')+pair[1])])
# Rebase the initializer/physical-retirement deltas onto the ACTUAL contained PTY.
original=ROOT/'docs/integration/proposed/profile-isolation-next/spawn-custody/source/pty.cc'
s=original.read_text();old=(HERE.parent/'fixed-pty-linked/changes.json');linked=json.loads(old.read_text())['records'][0]['anchors'];retired=json.loads((HERE.parent/'fixed-pty-retirement/changes.json').read_text())['records'][1]['anchors'];pairs=[]
for a in linked+retired:
 before,after=a['before'],a['after']
 if 'state_->reservation = reservation;\n    auto state = state_;' in before:
  before=before.replace('state_->reservation = reservation;','state_->reservation = reservation;\n    state_->exec_reservation = exec_reservation;');after=after.replace('state_->reservation = reservation;','state_->reservation = reservation;\n    state_->exec_reservation = exec_reservation;')
 if 'PreparedExitCallback exit_callback(' in before:
  before=before.replace('reservation.Handle());','reservation.Handle(), exec_reservation.Handle());');after=after.replace('reservation.Handle());','reservation.Handle(), exec_reservation.Handle());')
 if 'AuxNativePtyTransportClosed(token);' in after:after=after.replace('AuxNativePtyTransportClosed(token);','AuxNativePtyTransportClosed(token);AuxNativeExecOriginalHandleClosed(napi_get_exec_token_placeholder);')
 if 'napi_get_exec_token_placeholder' in after:
  # Callback data holds both native reservations; lifetime tombstones are stable.
  after=after.replace('napi_value closed;','struct TransportTokens{void* pty;void* exec;};\n  auto tokens=std::make_unique<TransportTokens>(TransportTokens{reservation.Handle(),exec_reservation.Handle()});\n  napi_value closed;').replace('void* token=nullptr;','void* data=nullptr;').replace('&token)!=napi_ok','&data)!=napi_ok').replace('AuxNativePtyTransportClosed(token);AuxNativeExecOriginalHandleClosed(napi_get_exec_token_placeholder);','auto* tokens=static_cast<TransportTokens*>(data);AuxNativePtyTransportClosed(tokens->pty);AuxNativeExecOriginalHandleClosed(tokens->exec);').replace('callback,reservation.Handle(),&closed','callback,tokens.get(),&closed').replace('  const napi_property_descriptor property', '  if(napi_add_finalizer(napiEnv,closed,tokens.get(),[](napi_env,void* data,void*){delete static_cast<TransportTokens*>(data);},nullptr,nullptr)!=napi_ok)throw Napi::Error::New(napiEnv,"PTY transport finalizer capture failed");\n  tokens.release();\n  const napi_property_descriptor property')
 pairs.append((before,after))
pairs += [('ScopedPtyMaster(int& fd,void* reservation) : fd_(fd),reservation_(reservation) {}', 'ScopedPtyMaster(int& fd,void* reservation,void* exec) : fd_(fd),reservation_(reservation),exec_reservation_(exec) {}'),
 ('if(close(fd_)==0)AuxNativePtyTransportClosed(reservation_);','if(close(fd_)==0){AuxNativePtyTransportClosed(reservation_);AuxNativeExecOriginalHandleClosed(exec_reservation_);}'),
 ('else if(!transferred_)AuxNativePtyTransportClosed(reservation_);','else if(!transferred_){AuxNativePtyTransportClosed(reservation_);AuxNativeExecOriginalHandleClosed(exec_reservation_);}'),
 ('  void* reservation_;','  void* reservation_;\n  void* exec_reservation_;'),
 ('#include "AuxNativeExecReservation.h"','#include "AuxNativeExecReservation.h"\n#include "AuxNativeExecTaskBoundary.h"\nextern "C" void AuxNativeExecOriginalHandleClosed(void*) noexcept;'),('  AuxExecNativeDeniedRoots denied_roots{};','  AuxExecNativeDeniedRoots denied_roots{};\n  AuxExecNativeTaskBoundary task_boundary{};'),('!envelope.Prepare(command, denied_roots)','AuxNativeExecCopyTaskBoundary(exec_reservation.Handle(),&task_boundary)!=0 ||\n      !envelope.Prepare(command, denied_roots,task_boundary)')]
change(original,'pty-linked.cc',pairs)
(HERE/'changes.json').write_text(json.dumps({'format':'aux.selected-exec-native-task-envelope.v1','records':records,'EntitlementRequired':True,'activated':False,'candidateChanged':False},indent=2)+'\n');(HERE/'source.patch').write_text(''.join(patch))

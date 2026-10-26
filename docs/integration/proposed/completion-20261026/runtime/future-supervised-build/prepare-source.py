from pathlib import Path
import json,hashlib,difflib
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');sha=lambda b:hashlib.sha256(b).hexdigest();records=[];patch=[]
def make(path,name,pairs):
 before=path.read_text();after=before
 for a,z in pairs:assert after.count(a)==1,(name,a[:90],after.count(a));after=after.replace(a,z)
 (HERE/'source'/name).write_text(after);records.append({'input':str(path),'inputSha256':sha(before.encode()),'output':name,'outputSha256':sha(after.encode()),'anchors':[{'before':a,'after':z,'count':1} for a,z in pairs]});patch.append(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(path),tofile=name)))
make(ROOT/'docs/integration/proposed/completion-20261026/runtime/native-host/source/daemon/AuxNativeDaemonMain.cc','AuxNativeDaemonMain.cc',[
 ('#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP\n    while', '#if defined(AUX_FIXED_LINKED_PTY_POLICY) || !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP\n    while'),
 ('#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP\n  // Supervised mode', '#if defined(AUX_FIXED_LINKED_PTY_POLICY) || !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP\n  // Supervised mode'),
 ('  // Browser-only mode never initializes ES and cannot launch supervised work.', '  // The ordinary candidate never initializes ES. The separate future fixed-linked\n  // variant requires the same real early observer before any user code.\n  // Both retain --no-addons and current native parent-lifetime interfaces.')])
make(ROOT/'docs/integration/proposed/completion-20261026/runtime/exec-task-envelope/source/AuxDevelopmentWorkerHost.cc','AuxDevelopmentWorkerHost.cc',[
 ('constexpr bool kBrowserOnlyNativeStartup = true;','constexpr bool kNativeCurrentUserStartup = true;'),
 ('constexpr bool kBrowserOnlyNativeStartup = false;','constexpr bool kNativeCurrentUserStartup = false;'),
 ('#endif\nnapi_value RefuseSupervisedTaskBinding', '#endif\n#if defined(AUX_FIXED_LINKED_PTY_POLICY) && AUX_FIXED_LINKED_PTY_POLICY\nconstexpr bool kBrowserOnlyNativeStartup = false;\n#else\nconstexpr bool kBrowserOnlyNativeStartup = kNativeCurrentUserStartup;\n#endif\nnapi_value RefuseSupervisedTaskBinding'),
 ('(kBrowserOnlyNativeStartup && !environment)', '(kNativeCurrentUserStartup && !environment)'),
 ('  if (kBrowserOnlyNativeStartup &&\n      (environment != state_->browser_service_environment', '  if (kNativeCurrentUserStartup &&\n      (environment != state_->browser_service_environment'),
 ('worker->ordinary_main_service = kBrowserOnlyNativeStartup && environment == state_->browser_service_environment;', 'worker->ordinary_main_service = kNativeCurrentUserStartup && environment == state_->browser_service_environment;')])
for path,name in [(ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/source/AuxMemoryMainOwner.inc','AuxMemoryMainOwner.inc'),(ROOT/'docs/integration/proposed/completion-20261026/integration/computer-use/source/AuxComputerUseMainOwner.inc','AuxComputerUseMainOwner.inc')]:
 before=path.read_text();pairs=[]
 # Native-current-user routing remains required in either finite/supervised mode.
 after=before.replace('!kBrowserOnlyNativeStartup','!kNativeCurrentUserStartup')
 assert after!=before
 make(path,name,[(before,after)])
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.future-fixed-linked-supervised-source.v1','records':records,'EntitlementRequired':True,'activated':False,'candidateChanged':False,'reviewChanged':False},indent=2)+'\n');(HERE/'source.patch').write_text(''.join(patch))

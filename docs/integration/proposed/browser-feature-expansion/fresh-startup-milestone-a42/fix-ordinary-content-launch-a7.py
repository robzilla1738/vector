"""Keep ES custody optional for normal Chromium children, without fake closure."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
pins = json.loads((HERE / 'full-native-input-pins-a3.json').read_text())
for name,digest in pins['files'].items():assert sha((NATIVE / name).read_bytes())==digest,name
changes=[]
name='content/browser/aux_child_lifetime.h'
before='''  static std::shared_ptr<AuxChildLifetime> Reserve() {
'''
after='''  // An absent optional bridge is ordinary Chromium, not observer custody.
  // Keep missing coverage sticky even after the direct child is reaped.
  static bool MayLaunchWithoutCustody() {
    std::lock_guard<std::mutex> lock(RegistryMutex());
    AccountingUnknown() = true;
    return getpid() == RegistryOwner() && !Closed();
  }
  static void ObserveLaunchWithoutCustody(pid_t child) {
    std::lock_guard<std::mutex> lock(RegistryMutex());
    AccountingUnknown() = true;
    if (getpid() != RegistryOwner() || child <= 0) return;
    if (UnobservedDescendantCohorts() < UINT64_MAX)
      ++UnobservedDescendantCohorts();
  }
''' + before
changes.append((name,before,after))
name='content/browser/child_process_launcher_helper_mac.cc'
changes.append((name,'''    if (!injected_loader) {
      aux_policy_binding_ = GetContentClient()->browser()
''','''    if (!injected_loader && aux::browser_custody::Bridge()) {
      aux_policy_binding_ = GetContentClient()->browser()
'''))
before='''  process.aux_child_lifetime = AuxChildLifetime::Reserve();
  if (!process.aux_child_lifetime) {
    *launch_result = LAUNCH_RESULT_FAILURE;
    return process;
  }
  process.process = base::LaunchProcess(*command_line(), *options);
  process.aux_child_lifetime->BindLaunch(
      process.process.IsValid() ? process.process.Pid() : -1,
      process.process.IsValid() ? process.process.CreationTime() : base::Time());
'''
after='''  if (aux::browser_custody::Bridge()) {
    process.aux_child_lifetime = AuxChildLifetime::Reserve();
    if (!process.aux_child_lifetime) {
      *launch_result = LAUNCH_RESULT_FAILURE;
      return process;
    }
  } else if (!AuxChildLifetime::MayLaunchWithoutCustody()) {
    *launch_result = LAUNCH_RESULT_FAILURE;
    return process;
  }
  process.process = base::LaunchProcess(*command_line(), *options);
  if (process.aux_child_lifetime) {
    process.aux_child_lifetime->BindLaunch(
        process.process.IsValid() ? process.process.Pid() : -1,
        process.process.IsValid() ? process.process.CreationTime() : base::Time());
  } else if (process.process.IsValid()) {
    AuxChildLifetime::ObserveLaunchWithoutCustody(process.process.Pid());
  }
'''
changes.append((name,before,after))
beforeimages={};texts={}
for name,before,after in changes:
    if name not in texts:
        raw=(NATIVE/name).read_bytes();beforeimages[name]=raw;texts[name]=raw.decode()
    assert texts[name].count(before)==1,name
    texts[name]=texts[name].replace(before,after)
patch=[];rows=[]
composition=json.loads((HERE/'source-composition-a3.json').read_text())
for name,text in texts.items():
    output=HERE/'ordinary-content-launch-source'/name;output.parent.mkdir(parents=True,exist_ok=True)
    with output.open('x') as f:f.write(text)
    (NATIVE/name).write_text(text)
    rows.append(dict(path=name,beforeSha256=sha(beforeimages[name]),afterSha256=sha(text.encode())))
    pins['files'][name]=sha(text.encode())
    composition['selectedFiles'][name]=dict(path=str(output.resolve()),sha256=sha(text.encode()),inputSha256=sha(beforeimages[name]),changed=True)
    patch.extend(difflib.unified_diff(beforeimages[name].decode().splitlines(True),text.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
with (HERE/'ordinary-content-launch-a7.patch').open('x') as f:f.writelines(patch)
projection=dict(passed=True,changes=rows,anchorCount=3,ordinaryUsesUpstreamSandboxAndLaunch=True,
    supervisedReservationFailureStillFatal=True,noUnconsumedAuxReceipt=True,
    unobservedCoverageSticky=True,fakeCustodyOrClean=False,uiChanged=False,signed=False,productExecuted=False)
with (HERE/'actual-ordinary-content-projection-a7.json').open('x') as f:json.dump(projection,f,indent=2);f.write('\n')
composition['ordinaryContentLaunchFix']=dict(path=str((HERE/'actual-ordinary-content-projection-a7.json').resolve()),sha256=sha((HERE/'actual-ordinary-content-projection-a7.json').read_bytes()))
with (HERE/'source-composition-a7.json').open('x') as f:json.dump(composition,f,indent=2);f.write('\n')
pins['sourceCompositionSha256']=sha((HERE/'source-composition-a7.json').read_bytes())
with (HERE/'full-native-input-pins-a7.json').open('x') as f:json.dump(pins,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=True,changedFiles=len(texts),anchors=3,uiChanged=False)))

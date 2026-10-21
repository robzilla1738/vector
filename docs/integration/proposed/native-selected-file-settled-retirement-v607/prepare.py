import difflib,hashlib,json,subprocess
from pathlib import Path
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');here=Path(__file__).resolve().parent
prior=here.parent/'native-file-operation-ownership-v607'
comp=Path('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-v607/manifest.json')
sha=lambda b:hashlib.sha256(b).hexdigest();pins={f['path']:f['outputSha256'] for f in json.loads(comp.read_text())['files']}
priorpins={f['path']:f['outputSha256'] for f in json.loads((prior/'files.json').read_text())['files']}
edits=[]
def edit(p,a,b):edits.append(dict(path=p,find=a,replace=b,count=1))
s='chrome/browser/ui/views/location_bar/omnibox_popup_file_selector'
edit(s+'.h','  bool CanRetireUnusedForAuxProfileSwitch() const;','''  // `context_owners_settled` is supplied only after the location bar verifies
  // its original renderer/native session, input and pending-context owners.
  bool CanRetireUnusedForAuxProfileSwitch(
      bool context_owners_settled = false) const;''')
edit(s+'.cc','''bool OmniboxPopupFileSelector::CanRetireUnusedForAuxProfileSwitch() const {''','''bool OmniboxPopupFileSelector::CanRetireUnusedForAuxProfileSwitch(
    bool context_owners_settled) const {
  const bool selected_context_released =
      aux_has_selected_files_ && context_owners_settled;''')
edit(s+'.cc','''  if (aux_ever_started_work_ && !aux_canceled_dialog_complete_) {''','''  if (aux_ever_started_work_ && !aux_canceled_dialog_complete_ &&
      !selected_context_released) {''')
edit(s+'.cc','''  if (web_contents_) {
    LOG(ERROR) << "Aux profile transition rejected: aim-cold.file-source-tab";''','''  if (web_contents_ && !selected_context_released) {
    LOG(ERROR) << "Aux profile transition rejected: aim-cold.file-source-tab";''')
edit(s+'.cc','''  if (edit_model_) {
    LOG(ERROR) << "Aux profile transition rejected: aim-cold.file-edit-model";''','''  if (edit_model_ && !selected_context_released) {
    LOG(ERROR) << "Aux profile transition rejected: aim-cold.file-edit-model";''')
c='chrome/browser/ui/contextual_search/searchbox_context_data.h'
edit(c,'''  // Transfers ownership of the pending context to caller.
  std::unique_ptr<Context> TakePendingContext();''','''  // Transfers ownership of the pending context to caller.
  std::unique_ptr<Context> TakePendingContext();

  // Admission reads ownership only; it must not consume a pending handoff.
  bool HasPendingContextForAuxProfileSwitch() const {
    return pending_context_ != nullptr;
  }''')
l='chrome/browser/ui/views/location_bar/location_bar_view.cc'
edit(l,'#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"','#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"\n#include "chrome/browser/ui/contextual_search/searchbox_context_data.h"')
edit(l,'''  if (omnibox_popup_file_selector_ &&
      !omnibox_popup_file_selector_->CanRetireUnusedForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: readiness.location.15";
    return false;
  }
''','')
edit(l,'''  if (!(omnibox_view_->CanPrepareForAuxProfileSwitch())) {
    LOG(ERROR) << "Aux profile transition rejected: readiness.location.20";
    return false;
  }
  return true;''','''  if (!(omnibox_view_->CanPrepareForAuxProfileSwitch())) {
    LOG(ERROR) << "Aux profile transition rejected: readiness.location.20";
    return false;
  }
  // These checks come AFTER the original AIM renderer-reset acknowledgment,
  // live context/session ownership, classic popup and native input guards.
  // The intermediate window-owned handoff must also be genuinely empty.
  const auto* context = browser_ ? SearchboxContextData::From(browser_) : nullptr;
  if (context && context->HasPendingContextForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: readiness.location.pending-context";
    return false;
  }
  if (omnibox_popup_file_selector_ &&
      !omnibox_popup_file_selector_->CanRetireUnusedForAuxProfileSwitch(
          /*context_owners_settled=*/context != nullptr)) {
    LOG(ERROR) << "Aux profile transition rejected: readiness.location.15";
    return false;
  }
  return true;''')
files=[];patch=[]
for p in dict.fromkeys(e['path'] for e in edits):
 isprior=p.startswith(s)
 before=((prior/'source'/p) if isprior else root/p).read_text()
 expected=priorpins[p] if isprior else pins.get(p) or sha(subprocess.check_output(['git','show','HEAD:'+p],cwd=root))
 assert sha(before.encode())==expected,p
 after=before
 for e in [x for x in edits if x['path']==p]:
  assert after.count(e['find'])==1,(p,e['find']);after=after.replace(e['find'],e['replace'])
 out=here/'source'/p;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(after)
 patch+=difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+p,tofile='b/'+p)
 files.append(dict(path=p,baselineSha256=sha(before.encode()),outputSha256=sha(after.encode()),baseline='70073e84b' if isprior else 'v607'))
(here/'native.patch').write_text(''.join(patch));(here/'files.json').write_text(json.dumps(dict(baseComposition='v607 + native-file-operation-ownership-v607',files=files,edits=edits),indent=2)+'\n');print(len(files),len(edits),sha(''.join(patch).encode()))

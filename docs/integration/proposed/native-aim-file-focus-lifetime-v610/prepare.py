import difflib,hashlib,json,subprocess
from pathlib import Path
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
here=Path(__file__).resolve().parent
composition=Path('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-v610/manifest.json')
sha=lambda b:hashlib.sha256(b).hexdigest()
pins={f['path']:f['outputSha256'] for f in json.loads(composition.read_text())['files']}
path='chrome/browser/ui/views/omnibox/omnibox_popup_aim_presenter.cc'
edits=[]
def edit(a,b):edits.append(dict(path=path,find=a,replace=b,count=1))
edit('''  widget_observation_.Reset();
  // Update the popup state manager''','''  widget_observation_.Reset();
  ResetFocusRestorationState();
  // Update the popup state manager''')
edit('''  is_restoring_focus_after_file_selection_ = true;
  if (!location_bar()) {''','''  // Retire the previous focus cycle before observing the next one. Its queued
  // callback must not focus a hidden popup or a later picker session.
  ResetFocusRestorationState();
  if (!location_bar()) {''')
edit('''    if (auto* fm = location_bar_widget->GetFocusManager()) {
      focus_manager_observation_.Observe(fm);''','''    if (auto* fm = location_bar_widget->GetFocusManager()) {
      is_restoring_focus_after_file_selection_ = true;
      focus_manager_observation_.Observe(fm);''')
edit('''  controller()->popup_state_manager()->SetPopupState(OmniboxPopupState::kNone);

  // Reset state and stop observing focus transitions.
  ResetFocusRestorationState();''','''  const auto weak_self = weak_factory_.GetWeakPtr();
  controller()->popup_state_manager()->SetPopupState(OmniboxPopupState::kNone);

  // Hide may already have retired this focus cycle or destroyed its owner.
  if (weak_self) {
    ResetFocusRestorationState();
  }''')
edit('''void OmniboxPopupAimPresenter::FinishFocusRestoration() {
  // Activate popup widget and focus WebContents.
  RequestFocus();
  // Focus the WebUI's text input element.
  if (auto* content =
          static_cast<OmniboxAimPopupWebUIContent*>(GetWebUIContent())) {
    content->FocusInput();
  }
  ResetFocusRestorationState();
}''','''void OmniboxPopupAimPresenter::FinishFocusRestoration() {
  if (!is_restoring_focus_after_file_selection_ || !IsShown() ||
      controller()->popup_state_manager()->popup_state() !=
          OmniboxPopupState::kAim) {
    ResetFocusRestorationState();
    return;
  }
  const auto weak_self = weak_factory_.GetWeakPtr();
  // Activation can synchronously hide/destroy the popup or start another cycle.
  RequestFocus();
  if (!weak_self) {
    return;
  }
  if (auto* content =
          static_cast<OmniboxAimPopupWebUIContent*>(GetWebUIContent())) {
    content->FocusInput();
  }
  if (weak_self) {
    ResetFocusRestorationState();
  }
}''')
edit('''void OmniboxPopupAimPresenter::ResetFocusRestorationState() {
  is_restoring_focus_after_file_selection_ = false;''','''void OmniboxPopupAimPresenter::ResetFocusRestorationState() {
  // This dedicated factory owns only deferred focus-restoration callbacks.
  // File reads, uploads and context handoffs have separate original owners.
  weak_factory_.InvalidateWeakPtrs();
  is_restoring_focus_after_file_selection_ = false;''')
before=(root/path).read_bytes();assert sha(before)==pins[path], 'native610 drift'
after=before.decode()
for e in edits:
 assert after.count(e['find'])==1,e['find']
 after=after.replace(e['find'],e['replace'])
out=here/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(after)
patch=''.join(difflib.unified_diff(before.decode().splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(here/'native.patch').write_text(patch)
(here/'files.json').write_text(json.dumps(dict(baseComposition='v610',compositionSha256=sha(composition.read_bytes()),files=[dict(path=path,baselineSha256=sha(before),outputSha256=sha(after.encode()))],edits=edits),indent=2)+'\n')
subprocess.run(['git','apply','--check',str(here/'native.patch')],cwd=root,check=True)
print('6 count-one edits, native610 hash pin and git apply --check passed')

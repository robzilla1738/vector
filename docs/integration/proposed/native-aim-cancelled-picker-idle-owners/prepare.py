#!/usr/bin/env python3
"""Construct proposal copies only; never changes the supplied native checkout."""
import difflib, hashlib, json
from pathlib import Path
ROOT = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
COMPOSITION = Path('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-v603/manifest.json')
HERE = Path(__file__).resolve().parent
sha = lambda b: hashlib.sha256(b).hexdigest()
manifest = json.loads(COMPOSITION.read_text())
pins = {f['path']: f['outputSha256'] for f in manifest['files']}
edits = []
def edit(path, before, after):
    edits.append(dict(path=path, find=before, replace=after, count=1))
sel = 'chrome/browser/ui/views/location_bar/omnibox_popup_file_selector'
edit(sel+'.h', '#include <optional>', '#include <cstdint>\n#include <optional>')
edit(sel+'.h', '  bool aux_ever_started_work_ = false;', '''  bool aux_ever_started_work_ = false;
  // Cancellation proves no upload work only when this owner never selected files.
  bool aux_has_selected_files_ = false;
  bool aux_canceled_dialog_complete_ = false;
  uint64_t aux_selection_generation_ = 0;''')
edit(sel+'.cc', '  if (aux_ever_started_work_) {', '  if (aux_ever_started_work_ && !aux_canceled_dialog_complete_) {')
edit(sel+'.cc', '''    bool was_ai_mode_open) {
  aux_ever_started_work_ = true;''', '''    bool was_ai_mode_open) {
  ++aux_selection_generation_;
  aux_canceled_dialog_complete_ = false;
  aux_ever_started_work_ = true;''')
edit(sel+'.cc', '''    const std::vector<ui::SelectedFileInfo>& files) {
  aux_ever_started_work_ = true;''', '''    const std::vector<ui::SelectedFileInfo>& files) {
  // Even rejected selections remain conservative: their context handoff has a
  // separate lifecycle, and cancellation cannot attest to its completion.
  aux_has_selected_files_ = true;
  aux_canceled_dialog_complete_ = false;
  aux_ever_started_work_ = true;''')
edit(sel+'.cc', '''void OmniboxPopupFileSelector::FileSelectionCanceled() {
  aux_ever_started_work_ = true;
  NotifyFileSelectionClosed();
  deactivation_blocker_.reset();
  file_dialog_.reset();
  if (was_ai_mode_open_) {
    OpenAiMode();
  }
}''', '''void OmniboxPopupFileSelector::FileSelectionCanceled() {
  aux_ever_started_work_ = true;
  const uint64_t generation = aux_selection_generation_;
  const auto weak_self = weak_factory_.GetWeakPtr();
  NotifyFileSelectionClosed();
  // A close callback may synchronously open another chooser. Its owners belong
  // to the new generation and must not be reset by the old cancellation.
  if (!weak_self || generation != aux_selection_generation_) {
    return;
  }
  deactivation_blocker_.reset();
  if (!weak_self || generation != aux_selection_generation_) {
    return;
  }
  file_dialog_.reset();
  if (!weak_self || generation != aux_selection_generation_) {
    return;
  }
  if (was_ai_mode_open_) {
    OpenAiMode();
  }
  if (!weak_self || generation != aux_selection_generation_ ||
      aux_has_selected_files_ || file_dialog_ || deactivation_blocker_) {
    return;
  }
  // No selection has ever scheduled reads or context handoffs for this owner.
  // Release only the canceled dialog's inputs. Admission still checks external
  // weak references, registered callbacks and the presenter's live idle state.
  web_contents_.reset();
  edit_model_ = nullptr;
  image_encoding_options_.reset();
  aux_canceled_dialog_complete_ = true;
}''')
edit(sel+'.cc', '''  if (file_chooser_closed_callback_) {
    file_chooser_closed_callback_.Run();
  }
  if (was_ai_mode_open_ && web_contents_ &&''', '''  if (file_chooser_closed_callback_) {
    const auto weak_self = weak_factory_.GetWeakPtr();
    const uint64_t generation = aux_selection_generation_;
    file_chooser_closed_callback_.Run();
    if (!weak_self || generation != aux_selection_generation_) {
      return;
    }
  }
  if (was_ai_mode_open_ && web_contents_ &&''')
drive = 'components/contextual_search/footprints/public/drive_disclaimer_controller.h'
edit(drive, ''' private:
  void OnShouldShowMobileConsentFlowResponse(''', '''  // The factory is held by each outstanding Footprints response callback.
  bool HasPendingRequestsForAuxProfileSwitch() const {
    return weak_factory_.HasWeakPtrs();
  }

 private:
  void OnShouldShowMobileConsentFlowResponse(''')
promo = 'chrome/browser/ui/views/search_ai_mode/signin_promo_controller.h'
edit(promo, '''  content::WebContents* web_contents() { return web_contents_.get(); }''', '''  content::WebContents* web_contents() { return web_contents_.get(); }
  bool HasActivePromoViewForAuxProfileSwitch() const {
    return promo_view_ != nullptr;
  }''')
edit(promo, '''  base::WeakPtr<ComposeboxDriveSignInPromoController> GetWeakPtr() {''', '''  bool CanRetireForAuxProfileSwitch() const {
    return !HasActivePromoViewForAuxProfileSwitch() &&
           !weak_ptr_factory_.HasWeakPtrs();
  }

  base::WeakPtr<ComposeboxDriveSignInPromoController> GetWeakPtr() {''')
handler = 'chrome/browser/ui/webui/cr_components/searchbox/contextual_searchbox_handler.cc'
edit(handler, '''  if (drive_picker_controller_ || drive_disclaimer_controller_ ||
      drive_picker_deactivation_blocker_ ||''', '''  if (drive_picker_controller_ ||
      (drive_disclaimer_controller_ &&
       drive_disclaimer_controller_->HasPendingRequestsForAuxProfileSwitch()) ||
      drive_picker_deactivation_blocker_ ||''')
edit(handler, '''  if (composebox_drive_signin_promo_controller_) {
    return false;
  }''', '''  if (composebox_drive_signin_promo_controller_ &&
      !composebox_drive_signin_promo_controller_->
          CanRetireForAuxProfileSwitch()) {
    return false;
  }''')
files=[]; patch=[]
for path in dict.fromkeys(e['path'] for e in edits):
    original = (ROOT/path).read_bytes()
    if path in pins:
        assert sha(original)==pins[path], f'v603 pin mismatch: {path}'
    before=original.decode(); after=before
    for e in (e for e in edits if e['path']==path):
        assert after.count(e['find'])==e['count'], f'anchor count mismatch: {path}'
        after=after.replace(e['find'],e['replace'])
    target=HERE/'sources'/path; target.parent.mkdir(parents=True, exist_ok=True); target.write_text(after)
    patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
    files.append(dict(path=path, baselineSha256=sha(original), outputSha256=sha(after.encode()), compositionTracked=path in pins))
(HERE/'native-aim-cancelled-picker-idle-owners.patch').write_text(''.join(patch))
(HERE/'manifest.json').write_text(json.dumps(dict(baseComposition='v603', compositionManifestSha256=sha(COMPOSITION.read_bytes()), files=files, edits=edits, compiled=False, appliedToNative=False),indent=2)+'\n')
print(json.dumps(dict(files=len(files),countCheckedEdits=len(edits),patchSha256=sha(''.join(patch).encode()))))

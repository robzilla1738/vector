import difflib, hashlib, json, subprocess
from pathlib import Path
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
here=Path(__file__).resolve().parent
composition=Path('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-v607/manifest.json')
sha=lambda b:hashlib.sha256(b).hexdigest()
pins={f['path']:f['outputSha256'] for f in json.loads(composition.read_text())['files']}
edits=[]
def edit(path,a,b): edits.append(dict(path=path,find=a,replace=b,count=1))
s='chrome/browser/ui/views/location_bar/omnibox_popup_file_selector'
edit(s+'.h','#include <cstdint>','#include <cstddef>\n#include <cstdint>')
edit(s+'.h','#include "base/functional/callback.h"','#include "base/functional/callback.h"\n#include "base/functional/callback_helpers.h"')
edit(s+'.h','  bool CanRetireUnusedForAuxProfileSwitch() const;','''  bool CanRetireUnusedForAuxProfileSwitch() const;
  // Reads and context handoffs use this selector's current source/options.
  // Do not replace them until every original callback has completed or retired.
  bool CanOpenFileUploadDialog() const;''')
edit(s+'.h','  bool aux_ever_started_work_ = false;','''  base::ScopedClosureRunner TrackAuxPendingFileOperation();
  size_t aux_pending_file_operations_ = 0;
  bool aux_ever_started_work_ = false;''')
edit(s+'.cc','bool OmniboxPopupFileSelector::CanRetireUnusedForAuxProfileSwitch() const {','''bool OmniboxPopupFileSelector::CanOpenFileUploadDialog() const {
  return !file_dialog_ && aux_pending_file_operations_ == 0;
}

base::ScopedClosureRunner
OmniboxPopupFileSelector::TrackAuxPendingFileOperation() {
  ++aux_pending_file_operations_;
  return base::ScopedClosureRunner(base::BindOnce(
      [](base::WeakPtr<OmniboxPopupFileSelector> self) {
        if (self) {
          --self->aux_pending_file_operations_;
        }
      }, weak_factory_.GetWeakPtr()));
}

bool OmniboxPopupFileSelector::CanRetireUnusedForAuxProfileSwitch() const {
  if (aux_pending_file_operations_ != 0) {
    LOG(ERROR) << "Aux profile transition rejected: file-read-or-context-handoff";
    return false;
  }''')
edit(s+'.cc','''    bool was_ai_mode_open) {
  ++aux_selection_generation_;''','''    bool was_ai_mode_open) {
  if (!CanOpenFileUploadDialog()) {
    return;
  }
  ++aux_selection_generation_;''')
edit(s+'.cc','''  if (file_chooser_opened_callback_) {
    file_chooser_opened_callback_.Run();
  }
  if (!OmniboxContextMenuController''','''  if (file_chooser_opened_callback_) {
    const auto weak_self = weak_factory_.GetWeakPtr();
    const uint64_t generation = aux_selection_generation_;
    file_chooser_opened_callback_.Run();
    if (!weak_self || generation != aux_selection_generation_) {
      return;
    }
  }
  if (!OmniboxContextMenuController''')
edit(s+'.cc','''  aux_has_selected_files_ = true;
  aux_canceled_dialog_complete_ = false;''','''  const auto weak_self = weak_factory_.GetWeakPtr();
  const uint64_t generation = aux_selection_generation_;
  // Keep inputs stable through synchronous validation/close/reopen callbacks too.
  auto selection_operation = TrackAuxPendingFileOperation();
  aux_has_selected_files_ = true;
  aux_canceled_dialog_complete_ = false;''')
edit(s+'.cc','''          base::unexpected(error_type));
      break;''','''          base::unexpected(error_type));
      if (!weak_self || generation != aux_selection_generation_) {
        return;
      }
      break;''')
edit(s+'.cc','''        base::BindOnce(&OmniboxPopupFileSelector::OnFileDataReady,
                       weak_factory_.GetWeakPtr()));''','''        base::BindOnce(
            [](base::ScopedClosureRunner,
               base::WeakPtr<OmniboxPopupFileSelector> self,
               std::unique_ptr<FileData> data) {
              if (self) {
                self->OnFileDataReady(std::move(data));
              }
            }, TrackAuxPendingFileOperation(), weak_factory_.GetWeakPtr()));''')
edit(s+'.cc','''  NotifyFileSelectionClosed();
  deactivation_blocker_.reset();
  file_dialog_.reset();

  if (!has_posted_tasks)''','''  NotifyFileSelectionClosed();
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

  if (!has_posted_tasks)''')
edit(s+'.cc','''    std::unique_ptr<FileData> file_data) {
  aux_ever_started_work_ = true;''','''    std::unique_ptr<FileData> file_data) {
  const auto weak_self = weak_factory_.GetWeakPtr();
  aux_ever_started_work_ = true;''')
edit(s+'.cc','''                               base::unexpected(file_data->error.value()));
    OpenAiMode();''','''                               base::unexpected(file_data->error.value()));
    if (!weak_self) {
      return;
    }
    OpenAiMode();''')
edit(s+'.cc','''                               base::ok(base::UnguessableToken::Create()));
    OpenAiMode();''','''                               base::ok(base::UnguessableToken::Create()));
    if (!weak_self) {
      return;
    }
    OpenAiMode();''')
edit(s+'.cc','''        base::BindOnce(&OmniboxPopupFileSelector::UpdateSearchboxContextData,
                       weak_factory_.GetWeakPtr(), mime_type,
                       std::move(image_data_url), file_name, raw_mime_type));''','''        base::BindOnce(
            [](base::ScopedClosureRunner,
               base::OnceCallback<void(base::expected<
                   base::UnguessableToken,
                   contextual_search::ContextUploadErrorType>)> reply,
               base::expected<base::UnguessableToken,
                              contextual_search::ContextUploadErrorType> result) {
              std::move(reply).Run(std::move(result));
            }, TrackAuxPendingFileOperation(),
            base::BindOnce(
                &OmniboxPopupFileSelector::UpdateSearchboxContextData,
                weak_factory_.GetWeakPtr(), mime_type,
                std::move(image_data_url), file_name, raw_mime_type)));''')
edit(s+'.cc','''  OpenAiMode();
  const std::string prefix = was_ai_mode_open_''','''  if (!weak_self) {
    return;
  }
  OpenAiMode();
  if (!weak_self) {
    return;
  }
  const std::string prefix = was_ai_mode_open_''')
c='chrome/browser/ui/omnibox/omnibox_context_menu_controller.cc'
edit(c,'''bool OmniboxContextMenuController::IsCommandIdEnabled(int command_id) const {
''','''bool OmniboxContextMenuController::IsCommandIdEnabled(int command_id) const {
  const auto input = input_type_for_command_id_.find(command_id);
  const bool is_file_command =
      command_id == IDC_OMNIBOX_CONTEXT_ADD_IMAGE ||
      command_id == IDC_OMNIBOX_CONTEXT_ADD_FILE ||
      (input != input_type_for_command_id_.end() &&
       (input->second == omnibox::InputType::INPUT_TYPE_LENS_IMAGE ||
        input->second == omnibox::InputType::INPUT_TYPE_LENS_FILE));
  if (is_file_command &&
      (!file_selector_ || !file_selector_->CanOpenFileUploadDialog())) {
    return false;
  }
''')
files=[];patch=[]
for path in dict.fromkeys(e['path'] for e in edits):
 before=(root/path).read_text()
 baseline=pins.get(path) or sha(subprocess.check_output(['git','show','HEAD:'+path],cwd=root))
 assert sha(before.encode())==baseline,path
 after=before
 for e in (e for e in edits if e['path']==path):
  assert after.count(e['find'])==1,(path,e['find']);after=after.replace(e['find'],e['replace'])
 out=here/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(after)
 patch+=difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path)
 files.append(dict(path=path,baselineSha256=sha(before.encode()),outputSha256=sha(after.encode())))
(here/'native.patch').write_text(''.join(patch))
(here/'files.json').write_text(json.dumps(dict(baseComposition='v607',compositionSha256=sha(composition.read_bytes()),files=files,edits=edits,compiled=False,applied=False),indent=2)+'\n')
print(len(files),len(edits),sha(''.join(patch).encode()))

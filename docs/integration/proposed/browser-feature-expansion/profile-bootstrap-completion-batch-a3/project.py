"""Count-checked A3 source overlay; shared native input stays read-only."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
A2 = HERE.parent / 'profile-window-completion-batch-a2/source-plan.json'
name = 'chrome/browser/ui/views/frame/aux_sidebar_view.cc'
sha = lambda data: hashlib.sha256(data).hexdigest()
original = (ROOT / name).read_bytes()
row = next(row for row in json.loads(A2.read_text())['files'] if row['path'] == name)
assert sha(original) == row['inputSha256']
text = original.decode()
anchors = []
for anchor in row['anchors']:
    assert text.count(anchor['find']) == anchor['count'] == 1
    text = text.replace(anchor['find'], anchor['replace'])
    anchors.append(dict(anchor, provenance='reviewed-a2'))
assert sha(text.encode()) == row['outputSha256']
a2_sha = sha(text.encode())


def edit(before, after):
    global text
    assert text.count(before) == 1, (before[:100], text.count(before))
    text = text.replace(before, after)
    anchors.append({'find': before, 'replace': after, 'count': 1, 'provenance': 'a3'})


edit('#include "chrome/browser/ui/browser_init_state.h"',
     '#include "chrome/browser/ui/browser_init_state.h"\n'
     '#include "chrome/browser/ui/unload_controller.h"\n'
     '#include "chrome/browser/lifetime/browser_shutdown.h"')
edit('''void RunProfileMenuAction(base::WeakPtr<BrowserWindowInterface> sender,
                          base::WeakPtr<Profile> source, std::string epoch,
                          base::OnceClosure action) {
  if (!sender || !source || epoch.empty() || sender->GetProfile() != source.get() ||
      aux::GetProfileCookieBindingEpoch(source.get()) != epoch ||
      aux::IsProfileCookieRestorePending(source.get())) return;
  std::move(action).Run();
}''', '''bool IsCurrentProfileMenuSource(base::WeakPtr<BrowserWindowInterface> sender,
                                base::WeakPtr<Profile> source,
                                const std::string& epoch) {
  const auto* unload = sender ? UnloadController::From(sender.get()) : nullptr;
  return sender && source && !epoch.empty() && source->IsRegularProfile() &&
      !source->IsOffTheRecord() && sender->GetProfile() == source.get() &&
      sender->GetWindow() && unload && !unload->is_attempting_to_close_browser() &&
      !unload->is_delete_scheduled() && !browser_shutdown::HasShutdownStarted() &&
      !browser_shutdown::IsTryingToQuit() &&
      aux::GetProfileCookieBindingEpoch(source.get()) == epoch &&
      !aux::IsProfileCookieRestorePending(source.get());
}
void RunProfileMenuAction(base::WeakPtr<BrowserWindowInterface> sender,
                          base::WeakPtr<Profile> source, std::string epoch,
                          base::OnceClosure action) {
  if (IsCurrentProfileMenuSource(sender, source, epoch)) std::move(action).Run();
}''')
edit('''void ShowEditProfileDialog(base::WeakPtr<BrowserWindowInterface> browser,
                           base::FilePath path) {
  if (!browser) {
    return;
  }
  auto* manager =''', '''void ShowEditProfileDialog(base::WeakPtr<BrowserWindowInterface> browser,
                           base::FilePath path) {
  const auto source = browser && browser->GetProfile()
      ? browser->GetProfile()->GetWeakPtr() : base::WeakPtr<Profile>();
  const auto epoch = source ? aux::GetProfileCookieBindingEpoch(source.get()) : std::string();
  if (!IsCurrentProfileMenuSource(browser, source, epoch)) return;
  auto* manager =''')
edit('''  std::u16string name = entry ? entry->GetLocalProfileName() : std::u16string();
  ui::DialogModel::Builder builder;''', '''  if (!entry || entry->IsOmitted()) return;
  std::u16string name = entry->GetLocalProfileName();
  ui::DialogModel::Builder builder;''')
edit('''              [](base::WeakPtr<BrowserWindowInterface> sender,
                 base::FilePath target, ui::DialogModel* dialog) {
                if (!sender) {
                  return;
                }
                auto* profile_manager =''', '''              [](base::WeakPtr<BrowserWindowInterface> sender,
                 base::WeakPtr<Profile> source, std::string epoch,
                 base::FilePath target, ui::DialogModel* dialog) {
                // A native modal can outlive the retired menu and an account
                // or profile switch. Keep the original source through Save.
                if (!IsCurrentProfileMenuSource(sender, source, epoch)) return;
                auto* profile_manager =''')
edit('''                if (!target_entry) {
                  return;
                }
                const std::u16string normalized''', '''                if (!target_entry || target_entry->IsOmitted()) {
                  return;
                }
                const std::u16string normalized''')
edit('''              browser, path, model),''', '''              browser, source, epoch, path, model),''')
edit('''              return browser && source && browser->GetProfile() == source.get() && state &&
                  state->IsCurrentAuxProfileSwitchRequest(generation) &&
                  aux::GetProfileCookieBindingEpoch(source.get()) == epoch &&
                  !aux::IsProfileCookieRestorePending(source.get());''', '''              return state && state->IsCurrentAuxProfileSwitchRequest(generation) &&
                  IsCurrentProfileMenuSource(browser, source, epoch);''')
edit('''  if (epoch.empty() || aux::IsProfileCookieRestorePending(source.get())) return;
  const uint64_t generation = state->BeginAuxProfileSwitchRequest();''', '''  if (!IsCurrentProfileMenuSource(sender, source, epoch)) return;
  const uint64_t generation = state->BeginAuxProfileSwitchRequest();''')
edit('''void ConfirmRemoveIndicatorProfile(
    base::WeakPtr<BrowserWindowInterface> browser,
    base::FilePath path) {
  if (!browser || !CanRemoveIndicatorProfile(browser.get(), path))
    return;''', '''void ConfirmRemoveIndicatorProfile(
    base::WeakPtr<BrowserWindowInterface> browser,
    base::FilePath path) {
  const auto source = browser && browser->GetProfile()
      ? browser->GetProfile()->GetWeakPtr() : base::WeakPtr<Profile>();
  const auto epoch = source ? aux::GetProfileCookieBindingEpoch(source.get()) : std::string();
  if (!IsCurrentProfileMenuSource(browser, source, epoch) ||
      !CanRemoveIndicatorProfile(browser.get(), path)) return;''')
edit('''                  [](base::WeakPtr<BrowserWindowInterface> sender,
                     base::FilePath target) {
                    if (!sender ||
                        !CanRemoveIndicatorProfile(sender.get(), target))''', '''                  [](base::WeakPtr<BrowserWindowInterface> sender,
                     base::WeakPtr<Profile> source, std::string epoch,
                     base::FilePath target) {
                    if (!IsCurrentProfileMenuSource(sender, source, epoch) ||
                        !CanRemoveIndicatorProfile(sender.get(), target))''')
edit('''                  browser, path),
              ui::DialogModel::Button::Params().SetLabel(u"Delete"))''', '''                  browser, source, epoch, path),
              ui::DialogModel::Button::Params().SetLabel(u"Delete"))''')

files, patches = [], []
def emit(a2_output=None):
    target = HERE / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)
    files.append({'path': name, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                  'output': str(target), 'anchors': list(anchors), 'a2OutputSha256': a2_output})
    patches.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                      fromfile='a/' + name, tofile='b/' + name))
emit(a2_sha)

name = 'chrome/browser/ui/views/frame/aux_profile_switch_request.cc'
original = (ROOT / name).read_bytes()
row = next(row for row in json.loads(A2.read_text())['files'] if row['path'] == name)
assert sha(original) == row['inputSha256']
text, anchors = original.decode(), []
for anchor in row['anchors']:
    assert text.count(anchor['find']) == anchor['count'] == 1
    text = text.replace(anchor['find'], anchor['replace'])
    anchors.append(dict(anchor, provenance='reviewed-a2'))
assert sha(text.encode()) == row['outputSha256']
a2_sha = sha(text.encode())
edit('#include "chrome/browser/profiles/profile.h"',
     '#include "chrome/browser/profiles/profile.h"\n#include "chrome/browser/aux/profile_identity.h"')
edit('  loading_ = true;\n  completion = base::BindOnce(&ProfileSwitchRequest::Complete,', '  const auto source = sender_ && sender_->GetProfile()\n      ? sender_->GetProfile()->GetWeakPtr() : base::WeakPtr<Profile>();\n  const auto epoch = source ? GetProfileCookieBindingEpoch(source.get()) : std::string();\n  if (!CurrentSwitchWindow(sender_, source) || epoch.empty() ||\n      IsProfileCookieRestorePending(source.get())) {\n    std::move(completion).Run(nullptr);\n    return;\n  }\n  loading_ = true;\n  completion = base::BindOnce(&ProfileSwitchRequest::Complete,')
edit('  if (!alive) {\n    return;\n  }\n  Dispatch(sender_, target, std::move(completion));', '  if (!alive) return;\n  // Restoring the borrowed native views can reenter a profile/account switch.\n  // The original intent must never dispatch against that replacement source.\n  if (!CurrentSwitchWindow(sender_, source) ||\n      GetProfileCookieBindingEpoch(source.get()) != epoch ||\n      IsProfileCookieRestorePending(source.get())) {\n    std::move(completion).Run(nullptr);\n    return;\n  }\n  Dispatch(sender_, target, std::move(completion));')
edit('  CHECK(!preview_->empty());\n  pending_.emplace(Pending{std::move(target), std::move(completion)});', '  CHECK(!preview_->empty());\n  const auto source = sender_ && sender_->GetProfile()\n      ? sender_->GetProfile()->GetWeakPtr() : base::WeakPtr<Profile>();\n  const auto epoch = source ? GetProfileCookieBindingEpoch(source.get()) : std::string();\n  if (!CurrentSwitchWindow(sender_, source) || epoch.empty() ||\n      IsProfileCookieRestorePending(source.get())) {\n    std::move(completion).Run(nullptr);\n    return;\n  }\n  pending_.emplace(Pending{std::move(target), std::move(completion), source, epoch});')
edit('  auto pending = std::move(*pending_);\n  pending_.reset();\n  Start(pending.target, std::move(pending.completion));', '  auto pending = std::move(*pending_);\n  pending_.reset();\n  // The 50ms frame-settle timer belongs to the actual source at queue time.\n  // A different profile/account in the same live window is not that source.\n  if (!CurrentSwitchWindow(sender_, pending.source) ||\n      GetProfileCookieBindingEpoch(pending.source.get()) != pending.source_epoch ||\n      IsProfileCookieRestorePending(pending.source.get())) {\n    std::move(pending.completion).Run(nullptr);\n    return;\n  }\n  Start(pending.target, std::move(pending.completion));')
emit(a2_sha)

name = 'chrome/browser/ui/views/frame/aux_profile_switch_request.h'
original = (ROOT / name).read_bytes()
text, anchors = original.decode(), []
edit('#include <optional>', '#include <optional>\n#include <string>')
edit('  // Completion receives the same actual sender only after real core success\n  // and activation. LoadProfileAsync can drop completion on null load failure.',
     '  // Completion receives the current switched sender or genuine separately\n  // recovered target after activation; failure or stale intent returns null.')
edit('    base::FilePath target;\n    Completion completion;\n  };', '    base::FilePath target;\n    Completion completion;\n    base::WeakPtr<Profile> source;\n    std::string source_epoch;\n  };')
emit()

result = {'format': 'aux.profile-bootstrap-completion.source.v1', 'nativeRoot': str(ROOT),
          'supersedes': {'sourcePlan': str(A2), 'sha256': sha(A2.read_bytes()),
                         'paths': [row['path'] for row in files if row['a2OutputSha256']]},
          'files': files,
          'nativeCheckoutChanged': False, 'uiStylesChanged': False,
          'nativeCompiled': False, 'productExecuted': False, 'runtimeAcceptance': False,
          'admissionReadyEventInvented': False, 'coldEntryActivated': False}
(HERE / 'source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'files': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files),
                  'newAnchors': sum(anchor['provenance'] == 'a3' for row in files for anchor in row['anchors']),
                  'nativeCheckoutChanged': False, 'coldEntryActivated': False}))

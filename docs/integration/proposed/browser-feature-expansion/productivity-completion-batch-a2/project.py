"""Project download recovery fixes without touching the frozen native build."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda value: hashlib.sha256(value).hexdigest()
files, patches = [], []


def project(name, edits):
    original = (ROOT / name).read_bytes()
    text = original.decode()
    anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (name, before[:120], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    output = HERE / 'source' / name
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    assert (ROOT / name).read_bytes() == original
    files.append({'path': name, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                  'source': str(output), 'anchors': anchors})
    patches.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                       fromfile='a/' + name, tofile='b/' + name))


name = 'chrome/browser/ui/aux_recent_files_service.cc'
project(name, [
    ('#include "base/functional/bind.h"',
     '#include "base/functional/bind.h"\n#include "base/functional/callback_helpers.h"'),
    ('''  bool SetPending(bool value) {
    if (pending == value) return true;
    if (value && !lifetime->Begin()) return false;
    pending = value;
    if (!value) lifetime->End();
    return true;
  }''',
     '''  bool SetPending(bool value, aux::features::NativeFeatureIoOutcome outcome =
                                 aux::features::NativeFeatureIoOutcome::kCompleted) {
    if (pending == value) return true;
    if (value && !lifetime->Begin()) return false;
    pending = value;
    if (!value) {
      // Settlement observers can replace the state's next owner/lifetime.
      // Retain this exact ticket owner until its End callback has returned.
      auto retained = lifetime;
      retained->End(outcome);
    }
    return true;
  }'''),
    ('''    if (receipt) receipt->Set("phase", result == Result::SUCCESS ? (undo ? "undone" : "complete") : "failed");''',
     '''    if (receipt) receipt->Set("phase", result == Result::SUCCESS ? (undo ? "undone" : "complete")
        : result == Result::FAILURE_UNKNOWN ? (undo ? "undo-planned" : "planned") : "failed");'''),
    ('''    if (result != Result::SUCCESS) {
      Finish(Error(result == Result::FAILURE_NAME_CONFLICT''',
     '''    if (result == Result::FAILURE_UNKNOWN) {
      Finish(Error("The rename may have completed; its prepared receipt is preserved for recovery.")); return;
    }
    if (result != Result::SUCCESS) {
      Finish(Error(result == Result::FAILURE_NAME_CONFLICT'''),
    ('''    base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
        base::BindOnce(&InspectRegularFileMove, fingerprint->Clone(), source, destination),''',
     '''    const bool posted = base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
        base::BindOnce(&InspectRegularFileMove, fingerprint->Clone(), source, destination),'''),
    ('''                       *phase == "undo-planned"));
  }
  void Conflict''',
     '''                       *phase == "undo-planned"));
    if (!posted) {
      // The inspection did not start. Its prepared receipt remains unresolved;
      // do not count this last incremented index as a completed recovery.
      state->lifetime->MarkUncertain();
      Finish();
    }
  }
  void Conflict'''),
    ('''      .Set("extension", path.Extension());
  base::ThreadPool::PostTaskAndReplyWithResult''',
     '''      .Set("extension", path.Extension());
  if (!state->SetPending(true)) {
    std::move(reply).Run(Error("File operations are closing; nothing was prepared.")); return;
  }
  auto [prepared_reply, refused_reply] = base::SplitOnceCallback(std::move(reply));
  const bool posted = base::ThreadPool::PostTaskAndReplyWithResult'''),
    ('''        std::move(reply).Run(Error("The file moved or is unavailable.")); return;''',
     '''        state->SetPending(false);
        std::move(reply).Run(Error("The file moved or is unavailable.")); return;'''),
    ('''      if (state->candidates.size() >= 64) { std::move(reply).Run(Error("Too many pending file reviews.")); return; }''',
     '''      if (state->candidates.size() >= 64) {
        state->SetPending(false);
        std::move(reply).Run(Error("Too many pending file reviews.")); return;
      }'''),
    ('''      metadata.Set("capability", token); metadata.Set("success", true);
      std::move(reply).Run(std::move(metadata));
    }, state, guid, path, metadata.Clone(), owner_epoch, std::move(reply)));''',
     '''      metadata.Set("capability", token); metadata.Set("success", true);
      state->SetPending(false);
      std::move(reply).Run(std::move(metadata));
    }, state, guid, path, metadata.Clone(), owner_epoch, std::move(prepared_reply)));
  if (!posted) {
    state->SetPending(false, aux::features::NativeFeatureIoOutcome::kRefused);
    std::move(refused_reply).Run(Error("The file review could not start; try again."));
  }'''),
])
name = 'chrome/browser/ui/aux_recent_files_move_mac.mm'
before = (ROOT / name).read_text()
after = (HERE / 'source/aux_recent_files_move_mac.mm').read_text()
project(name, [(before, after)])
name = 'chrome/browser/ui/aux_chosen_files_service.h'
project(name, [(
    'bool BeginVerifiedFileDrag(const base::FilePath&, const base::DictValue&, gfx::NativeView);',
    'bool BeginVerifiedFileDrag(Profile*, const base::FilePath&, const base::DictValue&,\n'
    '                            gfx::NativeView, base::RepeatingCallback<bool()> current);',
)])
name = 'chrome/browser/ui/aux_chosen_files_service.cc'
project(name, [(
    '''  if (!file || !view || !BeginVerifiedFileDrag(base::FilePath::FromUTF8Unsafe(*file->FindString("path")),
                                               *file->FindDict("fingerprint"), view)) return Error();''',
    '''  if (!file || !view) return Error();
  const auto path = base::FilePath::FromUTF8Unsafe(*file->FindString("path"));
  const auto fingerprint = std::make_shared<const base::DictValue>(file->FindDict("fingerprint")->Clone());
  const uint64_t epoch = state->epoch;
  auto current = base::BindRepeating([](std::shared_ptr<State> state, uint64_t epoch,
      const std::string& id, const base::FilePath& path,
      std::shared_ptr<const base::DictValue> expected) {
    if (state->epoch != epoch) return false;
    const auto* selected = Find(state, id);
    return selected &&
        *selected->FindString("path") == path.AsUTF8Unsafe() &&
        *selected->FindDict("fingerprint") == *expected;
  }, state, epoch, id, path, fingerprint);
  if (!BeginVerifiedFileDrag(state->profile.get(), path, *fingerprint, view, std::move(current))) return Error();''',
)])
name = 'chrome/browser/ui/aux_chosen_files_drag_mac.mm'
project(name, [
    ('#import <Cocoa/Cocoa.h>',
     '#import <Cocoa/Cocoa.h>\n'
     '#include "chrome/browser/profiles/profile.h"\n'
     '#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"\n'
     '#include "chrome/browser/ui/views/frame/browser_view.h"'),
    ('''bool BeginVerifiedFileDrag(const base::FilePath& path, const base::DictValue& expected,
                            gfx::NativeView native_view) {
  const auto actual = FingerprintRegularFile(path);
  if (!actual || *actual != expected || !native_view) return false;
  NSView* view = native_view.GetNativeNSView();
  if (!view || !view.window) return false;''',
     '''bool BeginVerifiedFileDrag(Profile* profile, const base::FilePath& path,
                            const base::DictValue& expected, gfx::NativeView native_view,
                            base::RepeatingCallback<bool()> current) {
  if (!profile || !native_view || !current) return false;
  auto profile_owner = profile->GetWeakPtr();
  if (!current.Run()) return false;
  NSView* view = native_view.GetNativeNSView();
  if (!view || !view.window) return false;
  auto* browser_view = BrowserView::GetBrowserViewForNativeWindow(gfx::NativeWindow(view.window));
  if (!browser_view || browser_view->GetProfile() != profile) return false;
  const auto window_owner = browser_view->browser()->GetWeakPtr();
  auto binding_current = [&] {
    if (!profile_owner || !window_owner || window_owner->GetProfile() != profile_owner.get() ||
        !current.Run() || !view.window) return false;
    auto* active_view = BrowserView::GetBrowserViewForNativeWindow(gfx::NativeWindow(view.window));
    return active_view && active_view->browser() == window_owner.get();
  };
  if (!binding_current()) return false;
  const auto actual = FingerprintRegularFile(path);
  if (!actual || *actual != expected) return false;'''),
    ('''  if (!host || !host->GetNSWindowMojo()) return false;
  host->GetNSWindowMojo()->BeginFileDrag''',
     '''  if (!host || !host->GetNSWindowMojo() || !binding_current()) return false;
  const auto after_release = FingerprintRegularFile(path);
  if (!after_release || *after_release != expected || !binding_current()) return false;
  host->GetNSWindowMojo()->BeginFileDrag'''),
])
result = {'format': 'aux.productivity-completion.source.v2', 'root': str(ROOT),
          'files': files, 'nativeCheckoutChanged': False, 'nativeBuildRun': False,
          'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'files': len(files), 'anchors': sum(len(row['anchors']) for row in files),
                  'nativeCheckoutChanged': False}))

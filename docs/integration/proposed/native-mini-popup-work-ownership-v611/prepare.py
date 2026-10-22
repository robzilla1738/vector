import difflib,hashlib,json,subprocess
from pathlib import Path
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
here=Path(__file__).resolve().parent
composition=Path('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-v611/manifest.json')
sha=lambda b:hashlib.sha256(b).hexdigest()
pins={f['path']:f['outputSha256'] for f in json.loads(composition.read_text())['files']}
path='chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc';edits=[]
def edit(a,b):edits.append(dict(path=path,find=a,replace=b,count=1))
edit('#include "content/public/browser/render_widget_host_view.h"','#include "content/public/browser/render_frame_host.h"\n#include "content/public/browser/render_widget_host_view.h"')
edit('#include "third_party/skia/include/core/SkColor.h"','#include "third_party/blink/public/mojom/frame/sudden_termination_disabler_type.mojom.h"\n#include "third_party/skia/include/core/SkColor.h"')
edit('''    auto* listener = ui::GlobalAcceleratorListener::GetInstance();
    const auto accelerator = aux::ParseKeyboardShortcut(shortcut).value_or(''','''    // Configuration may replace/destroy the old profile's renderer. Validate
    // its original pending owners before changing registration or preferences.
    if ((!enabled || profile_.get() != profile) && HasPendingWork()) {
      return "Finish the current popup file selection or pending work first";
    }
    auto* listener = ui::GlobalAcceleratorListener::GetInstance();
    const auto accelerator = aux::ParseKeyboardShortcut(shortcut).value_or(''')
edit('''      registered_ = true;
      accelerator_ = accelerator;''','''      registered_ = true;
      accelerator_ = accelerator;
      LOG(INFO) << "Aux mini popup global shortcut registered";''')
edit('''  void ShowFor(Profile* profile) {
    BindProfile(profile);''','''  std::optional<std::string> ShowFor(Profile* profile) {
    if (!profile) {
      return "Mini popup profile is unavailable";
    }
    if (profile_.get() != profile && HasPendingWork()) {
      return "Finish the current popup file selection or pending work first";
    }
    BindProfile(profile);''')
edit('''    Show();
  }

  void Show()''','''    Show();
    return std::nullopt;
  }

  void Show()''')
edit('''  void OnKeyPressed(const ui::Accelerator&) override {
    if (auto* active =
            GlobalBrowserCollection::GetInstance()->GetActiveBrowser()) {
      ShowFor(active->GetProfile());
    } else if (profile_) {
      ShowFor(profile_.get());
    }
  }''','''  void OnKeyPressed(const ui::Accelerator&) override {
    LOG(INFO) << "Aux mini popup global shortcut dispatched";
    Profile* selected = profile_.get();
    if (auto* active =
            GlobalBrowserCollection::GetInstance()->GetActiveBrowser()) {
      selected = active->GetProfile();
    }
    if (selected) {
      if (auto error = ShowFor(selected)) {
        LOG(WARNING) << "Aux mini popup could not open: " << *error;
      }
    }
  }''')
edit(''' private:
  enum class OptionsFocusState {''',''' private:
  bool HasPendingWork() const {
    if (picker_pending_) {
      return true;
    }
    bool pending = false;
    for (const auto* view : {webview_.get(), options_webview_.get()}) {
      if (!view || !view->web_contents()) {
        continue;
      }
      view->web_contents()->ForEachRenderFrameHost(
          [&](content::RenderFrameHost* frame) {
            if (frame->IsRenderFrameLive() &&
                frame->GetSuddenTerminationDisablerState(
                    blink::mojom::SuddenTerminationDisablerType::
                        kBeforeUnloadHandler)) {
              pending = true;
            }
          });
    }
    return pending;
  }
  enum class OptionsFocusState {''')
edit('''    manager.ShowFor(selected);
    return RespondNow(NoArguments());''','''    if (auto error = manager.ShowFor(selected)) {
      return RespondNow(Error(*error));
    }
    return RespondNow(NoArguments());''')
before=(root/path).read_bytes();assert sha(before)==pins[path], 'native611 drift'
after=before.decode()
for e in edits:
 assert after.count(e['find'])==1,e['find']
 after=after.replace(e['find'],e['replace'])
out=here/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(after)
(here/'native.patch').write_text(''.join(difflib.unified_diff(before.decode().splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path)))
(here/'files.json').write_text(json.dumps(dict(baseComposition='v611',compositionSha256=sha(composition.read_bytes()),files=[dict(path=path,baselineSha256=sha(before),outputSha256=sha(after.encode()))],edits=edits),indent=2)+'\n')
subprocess.run(['git','apply','--check',str(here/'native.patch')],cwd=root,check=True)
print(f'{len(edits)} count-one edits, native611 hash pin and git apply --check passed')

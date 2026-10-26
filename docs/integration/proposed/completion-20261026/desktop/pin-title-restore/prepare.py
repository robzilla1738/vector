from pathlib import Path
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
INTEGRATED = Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/completion-20261026/desktop/source')
CONTROLLER = 'chrome/browser/ui/views/frame/aux_organization_window_controller'
paths = [CONTROLLER + '.h', CONTROLLER + '.cc', 'chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.cc']
records, patch = [], []
for path in paths:
    source = INTEGRATED / path if path.startswith(CONTROLLER) else ROOT / path
    original = source.read_text()
    text = original
    anchors = []
    def edit(name, before, after):
        global text
        if text.count(before) != 1:
            raise ValueError((name, text.count(before)))
        text = text.replace(before, after)
        anchors.append(dict(name=name, before=before, after=after, expectedCount=1))
    if path.endswith('.h'):
        edit('one current native title query shared by publication and pin UI', '  organization::Entry EntryForDisplay(const organization::Entry&) const;', '''  organization::Entry EntryForDisplay(const organization::Entry&) const;
  // Restore/discard placeholders cannot replace the last committed title with
  // Chromium's display-URL fallback before an actual document has loaded.
  std::optional<std::u16string> ReadAutomaticTitle(tabs::TabInterface*) const;''')
    elif path == CONTROLLER + '.cc':
        edit('read raw committed title to distinguish display fallback', '#include "content/public/browser/navigation_controller.h"', '#include "content/public/browser/navigation_controller.h"\n#include "content/public/browser/navigation_entry.h"')
        edit('retry a genuinely untitled page only after load settles', '  void TitleWasSet(content::NavigationEntry*) override', '  void DidStopLoading() override { if (owner_) owner_->TitleChanged(handle_); }\n  void TitleWasSet(content::NavigationEntry*) override')
        edit('actual document readiness controls URL fallback', 'void AuxOrganizationWindowController::PublishTitle(tabs::TabHandle handle) {', '''std::optional<std::u16string> AuxOrganizationWindowController::ReadAutomaticTitle(
    tabs::TabInterface* tab) const {
  if (!Current() || !tab || model_->GetIndexOfTab(tab) < 0) return std::nullopt;
  auto* contents = tab->GetContents();
  if (!contents || contents->GetBrowserContext() != profile_) return std::nullopt;
  const auto* committed = contents->GetController().GetLastCommittedEntry();
  if (!committed) return std::nullopt;
  if (committed->GetTitle().empty() &&
      (contents->GetController().NeedsReload() || contents->IsLoading() ||
       !contents->GetPrimaryMainFrame()->IsRenderFrameLive())) return std::nullopt;
  return contents->GetTitle();
}
void AuxOrganizationWindowController::PublishTitle(tabs::TabHandle handle) {''')
        edit('never publish placeholder display URL as observed document title', '''  const auto title = base::UTF16ToUTF8(tab->GetContents()->GetTitle());
  if (!url.is_valid()''', '''  const auto observed_title = ReadAutomaticTitle(tab);
  if (!observed_title) return;
  const auto title = base::UTF16ToUTF8(*observed_title);
  if (!url.is_valid()''')
        edit('post-save comparison reads the same native title boundary', '''        // A newer document/title can arrive during storage. Never replay the''', '''        const auto current_title = owner->ReadAutomaticTitle(current_tab);
        // A newer document/title can arrive during storage. Never replay the''')
        edit('placeholder changes request a fresh read rather than replay', '              base::UTF16ToUTF8(current_tab->GetContents()->GetTitle()) != captured_title)))', '              !current_title || base::UTF16ToUTF8(*current_title) != captured_title)))')
        edit('ordinary logical rows retain committed title during restore', '''  if (entry.title_mode == organization::TitleMode::kAutomatic)
    shown.title = base::UTF16ToUTF8(contents->GetTitle());''', '''  if (entry.title_mode == organization::TitleMode::kAutomatic)
    if (const auto title = ReadAutomaticTitle(tab)) shown.title = base::UTF16ToUTF8(*title);''')
    else:
        edit('include owned optional title value', '#include <memory>', '#include <memory>\n#include <optional>')
        edit('current pin grid follows the same restore-aware boundary', '''        const auto title = helper->GetTitle();
        bool automatic_title = !projected;''', '''        bool automatic_title = !projected;''')
        edit('retain last saved pin title until a real title is available', '''        if (automatic_title && !title.empty())
          entry.title = title;''', '''        if (automatic_title) {
          auto* controller = aux::AuxOrganizationWindowController::FromBrowser(browser_);
          const auto title = projected
              ? (controller ? controller->ReadAutomaticTitle(tab) : std::nullopt)
              : std::make_optional(helper->GetTitle());
          if (title && !title->empty()) entry.title = *title;
        }''')
    output = HERE / 'source' / path
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    records.append(dict(path=path,inputSource=str(source),inputSha256=hashlib.sha256(original.encode()).hexdigest(),outputSha256=hashlib.sha256(text.encode()).hexdigest(),anchors=anchors))
    patch.extend(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'native.patch').write_text(''.join(patch))
(HERE/'source-plan.json').write_text(json.dumps(dict(format='aux.native.counted-projection.v1',nativeRoot=str(ROOT),predecessor='root integrated repaired pin/row unload controller overlay',files=records),indent=2)+'\n')
print(json.dumps([dict(path=r['path'],inputSha256=r['inputSha256'],outputSha256=r['outputSha256'],anchors=len(r['anchors']))for r in records],indent=2))

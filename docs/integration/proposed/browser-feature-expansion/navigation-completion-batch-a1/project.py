"""Project native navigation fixes from the actual current Chromium inputs."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
files, patch = [], []


def project(name, edits):
    original = (ROOT / name).read_bytes()
    text = original.decode()
    anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (name, before[:100], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    output = HERE / 'source' / name
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    files.append({'path': name, 'inputSha256': sha(original), 'output': str(output),
                  'outputSha256': sha(text.encode()), 'anchors': anchors})
    patch.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                    fromfile='a/' + name, tofile='b/' + name))


invocation = '''// A palette hide can synchronously change the active tab or profile. Keep
// these observations independently of its one-use binding, which is consumed
// before dispatch. This is view identity, not profile/startup authority.
struct CommandInvocation {
  CommandInvocation(BrowserWindowInterface* owner, content::WebContents* source)
      : browser(owner->GetWeakPtr()), profile(owner->GetProfile()->GetWeakPtr()),
        target(source ? source->GetWeakPtr() : nullptr), had_target(source != nullptr),
        epoch(aux::GetProfileCookieBindingEpoch(owner->GetProfile())) {
    auto* entry = source ? source->GetController().GetLastCommittedEntry() : nullptr;
    navigation_id = entry ? entry->GetUniqueID() : 0;
  }
  bool ProfileCurrent() const {
    return browser && profile && browser->GetProfile() == profile.get() &&
        aux::GetProfileCookieBindingEpoch(profile.get()) == epoch &&
        !aux::IsProfileCookieRestorePending(profile.get());
  }
  bool Current() const {
    if (!ProfileCurrent() || (had_target && !target)) return false;
    auto* active = browser->GetActiveTabInterface();
    if ((active ? active->GetContents() : nullptr) != target.get()) return false;
    if (target && target->GetBrowserContext() != profile.get()) return false;
    auto* entry = target ? target->GetController().GetLastCommittedEntry() : nullptr;
    return (entry ? entry->GetUniqueID() : 0) == navigation_id;
  }
  base::WeakPtr<BrowserWindowInterface> browser;
  base::WeakPtr<Profile> profile;
  base::WeakPtr<content::WebContents> target;
  bool had_target;
  std::string epoch;
  int navigation_id = 0;
};
'''
project('chrome/browser/ui/views/frame/aux_tab_search_bubble.cc', [
    ('    target_ = contents ? contents->GetWeakPtr() : nullptr;',
     '    target_ = contents ? contents->GetWeakPtr() : nullptr;\n    target_present_ = contents != nullptr;'),
    ('    if (generation_.empty() || !owner || contents != target_.get()) return false;',
     '    if (generation_.empty() || !owner || (target_present_ && !target_) ||\n        contents != target_.get()) return false;'),
    ('  base::WeakPtr<content::WebContents> target_;\n  std::string ask_profile_epoch_;',
     '  base::WeakPtr<content::WebContents> target_;\n  bool target_present_ = false;\n  std::string ask_profile_epoch_;'),
    ('  return registry && registry->GetExtensionById(\n      kAgentExtensionId, extensions::ExtensionRegistry::EVERYTHING);',
     '  return registry && registry->enabled_extensions().Contains(kAgentExtensionId);'),
    ('    if (contents && contents->GetBrowserContext() != owner->GetProfile()) return false;',
     '''    if (contents && contents->GetBrowserContext() != owner->GetProfile()) return false;
    if (ask_profile_epoch_ != GetProfileCookieBindingEpoch(owner->GetProfile()) ||
        IsProfileCookieRestorePending(owner->GetProfile())) return false;'''),
    ('const char* CommandModeName(AuxCommandBarMode mode) {', invocation + 'const char* CommandModeName(AuxCommandBarMode mode) {'),
    ('    // The actual loaded URL, never a logical-tab URL from another view.\n    result.Set("activeUrl", target->GetLastCommittedURL().spec());',
     '''    // Match the actual location control, including a pending typed URL.
    // A shared logical tab or the previous committed page never supplies it.
    result.Set("activeUrl", target->GetVisibleURL().spec());'''),
    ('''    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!browser_weak) return CommandFailure("Window closed");
    model->ActivateTabAt(index);''',
     '''    const auto selected = model->GetWebContentsAt(index)->GetWeakPtr();
    const CommandInvocation invocation(browser, binding->target());
    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!invocation.Current() || !selected)
      return CommandFailure("The originating window or tab changed");
    model = invocation.browser->GetTabStripModel();
    index = model ? model->GetIndexOfWebContents(selected.get()) : TabStripModel::kNoTab;
    if (index == TabStripModel::kNoTab ||
        selected->GetBrowserContext() != invocation.profile.get())
      return CommandFailure("This tab is no longer available in the originating window");
    model->ActivateTabAt(index);
    model = invocation.browser ? invocation.browser->GetTabStripModel() : nullptr;
    if (!invocation.ProfileCurrent() || !selected || !model ||
        model->GetActiveWebContents() != selected.get())
      return CommandFailure("The tab changed before it could be selected");'''),
    ('  } else if (*kind == "navigate") {',
     '''  } else if (*kind == "new-blank-tab") {
    if ((binding->mode() != AuxCommandBarMode::kNewTab && binding->mode() != AuxCommandBarMode::kCommands) ||
        browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
        !chrome::IsCommandEnabled(browser, IDC_NEW_TAB))
      return CommandFailure("A new tab is unavailable in this window");
    const CommandInvocation invocation(browser, binding->target());
    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!invocation.Current()) return CommandFailure("The originating window changed");
    // Invoke the real NewTab implementation directly. Dispatching IDC_NEW_TAB
    // would reopen this palette instead of honoring the explicit blank action.
    auto* opened = &chrome::NewTab(invocation.browser.get(), NewTabTypes::kNewTabCommand);
    auto* strip = invocation.browser ? invocation.browser->GetTabStripModel() : nullptr;
    if (!invocation.ProfileCurrent() || !strip ||
        strip->GetIndexOfWebContents(opened) == TabStripModel::kNoTab ||
        opened->GetBrowserContext() != invocation.profile.get() ||
        strip->GetActiveWebContents() != opened)
      return CommandFailure("The new tab was not opened in the originating window");
  } else if (*kind == "navigate") {'''),
    ('''    if (!text || text->size() > 32768 ||
        base::TrimWhitespaceASCII(*text, base::TRIM_ALL).empty())
      return CommandFailure("Enter a URL or search");
    AutocompleteMatch match;''',
     '''    if (!text || text->size() > 32768 || !base::IsStringUTF8(*text) ||
        base::TrimWhitespaceASCII(*text, base::TRIM_ALL).empty())
      return CommandFailure("Enter a URL or search");
    const CommandInvocation invocation(browser, binding->target());
    const auto disposition = binding->mode() == AuxCommandBarMode::kNavigate
        ? WindowOpenDisposition::CURRENT_TAB : WindowOpenDisposition::NEW_FOREGROUND_TAB;
    AutocompleteMatch match;'''),
    ('''    NavigateParams params(browser, url, match.transition);
    params.source_contents = binding->target();
    params.disposition = binding->mode() == AuxCommandBarMode::kNavigate
        ? WindowOpenDisposition::CURRENT_TAB : WindowOpenDisposition::NEW_FOREGROUND_TAB;
    if (params.disposition == WindowOpenDisposition::CURRENT_TAB && !binding->target())
      return CommandFailure("The selected page is no longer available");
    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!browser_weak) return CommandFailure("Window closed");
    Navigate(&params);''',
     '''    if (!invocation.Current() ||
        (disposition == WindowOpenDisposition::CURRENT_TAB && !invocation.target))
      return CommandFailure("The selected page is no longer available");
    binding->Invalidate();
    CloseAuxProfileSearch(browser);
    if (!invocation.Current()) return CommandFailure("The originating window changed");
    NavigateParams params(invocation.browser.get(), url, match.transition);
    params.source_contents = invocation.target.get();
    params.disposition = disposition;
    Navigate(&params);
    auto* opened = params.navigated_or_inserted_contents.get();
    auto* strip = invocation.browser ? invocation.browser->GetTabStripModel() : nullptr;
    if (!invocation.ProfileCurrent() || !strip || !opened ||
        strip->GetIndexOfWebContents(opened) == TabStripModel::kNoTab ||
        opened->GetBrowserContext() != invocation.profile.get() ||
        (disposition == WindowOpenDisposition::CURRENT_TAB && opened != invocation.target.get()))
      return CommandFailure("Navigation was not accepted in the originating window");
    // Current-tab beforeunload confirmation remains owned by Chromium. Do not
    // pretend that accepting this navigation means its network load finished.'''),
])

project('chrome/browser/ui/aux_preview/aux_preview_controller.cc', [
    ('''  auto* organization = aux::AuxOrganizationWindowController::FromBrowser(target);
  if (!organization || !organization->IsProjectionReady() ||
      (!space.empty() && !organization->SelectSpace(space))) {
    window->promoting = false; std::move(done).Run(Result(false, "Destination Space is unavailable or busy")); return;
  }
  const auto handle = model->GetTabAtIndex(0)->GetHandle();
  auto* contents = model->GetActiveWebContents();
  auto destination = target->GetWeakPtr();
  // Chromium transfers the real TabModel/WebContents and navigation history.
  // The source popup can close synchronously as its final tab leaves.
  chrome::MoveTabsToExistingWindow(browser, target, {0});
  const bool moved = destination && handle.Get() &&
      handle.Get()->GetContents() == contents &&
      handle.Get()->GetBrowserWindowInterface() == destination.get();''',
     '''  const auto handle = model->GetTabAtIndex(0)->GetHandle();
  const auto contents = model->GetActiveWebContents()->GetWeakPtr();
  auto destination = target->GetWeakPtr();
  auto* organization = aux::AuxOrganizationWindowController::FromBrowser(target);
  if (!organization || !organization->IsProjectionReady() ||
      (!space.empty() && !organization->SelectSpace(space))) {
    window->promoting = false; std::move(done).Run(Result(false, "Destination Space is unavailable or busy")); return;
  }
  // Space selection can synchronously project tabs, switch ownership or close
  // a window. Reacquire both real owners and the SAME source tab afterward.
  browser = window->browser.get();
  model = browser ? browser->GetTabStripModel() : nullptr;
  organization = destination ? aux::AuxOrganizationWindowController::FromBrowser(destination.get()) : nullptr;
  if (!Current(window) || !destination || BusyBrowser(destination.get()) ||
      destination->GetProfile() != window->profile.get() || Find(destination.get()) ||
      !organization || !organization->IsProjectionReady() ||
      (!space.empty() && organization->ActiveSpaceId() != space) ||
      !model || model->count() != 1 || !contents || !handle.Get() ||
      model->GetTabAtIndex(0) != handle.Get() ||
      model->GetActiveWebContents() != contents.get() || Protected(contents.get(), true)) {
    window->promoting = false; std::move(done).Run(Result(false, "The preview or destination changed before handoff")); return;
  }
  // Chromium transfers the real TabModel/WebContents and navigation history.
  // The source popup can close synchronously as its final tab leaves.
  chrome::MoveTabsToExistingWindow(browser, destination.get(), {0});
  const bool moved = destination && window->profile && contents && handle.Get() &&
      destination->GetProfile() == window->profile.get() &&
      aux::GetProfileCookieBindingEpoch(window->profile.get()) == window->epoch &&
      !aux::IsProfileCookieRestorePending(window->profile.get()) &&
      handle.Get()->GetContents() == contents.get() &&
      handle.Get()->GetBrowserWindowInterface() == destination.get();'''),
])

(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.navigation-completion.source.v1',
    'baselineCommit': 'e34540943', 'nativeRoot': str(ROOT), 'files': files,
    'nativeRootChanged': False, 'actualAppAcceptance': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files), 'nativeRootChanged': False}))

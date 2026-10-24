"""Counted native source overlays; active Chromium inputs are read-only."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda v: hashlib.sha256(v).hexdigest()
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

project('chrome/browser/ui/aux_keyboard_shortcuts.mm', [
    ('#include "components/prefs/scoped_user_pref_update.h"\n', ''),
    ('  if (parsed && value != Default(*binding) &&',
     '  if (parsed && parsed != ParseKeyboardShortcut(Default(*binding)) &&'),
    ('''  profile->GetPrefs()->SetDict(kOverrides, normalized.Clone());
  if (ShortcutOwner(profile) != owner || profile->GetPrefs()->GetDict(kOverrides) != normalized)
    return ShortcutFailure("Shortcut state changed during publication; reload settings");
  RefreshActiveMenu();
  auto result = GetShortcutProfile(profile);''',
     '''  const auto live_profile = profile->GetWeakPtr();
  profile->GetPrefs()->SetDict(kOverrides, normalized.Clone());
  // Preference/menu observers may synchronously retire or rebind the owner.
  if (!live_profile || ShortcutOwner(live_profile.get()) != owner ||
      live_profile->GetPrefs()->GetDict(kOverrides) != normalized)
    return ShortcutFailure("Shortcut state changed during publication; reload settings");
  RefreshActiveMenu();
  if (!live_profile || ShortcutOwner(live_profile.get()) != owner)
    return ShortcutFailure("Shortcut profile changed during menu refresh");
  auto result = GetShortcutProfile(live_profile.get());'''),
    ('''  auto* prefs = profile->GetPrefs();
  if (prefs->IsManagedPreference(kOverrides))
    return "Shortcuts are managed";
  {
    ScopedDictPrefUpdate update(prefs, kOverrides);
    update->Set(base::NumberToString(command), value);
  }
  RefreshActiveMenu();
  return std::nullopt;''',
     '''  // Single-row edits use the SAME prospective-table/OS reservation and
  // profile-CAS boundary as import. Never publish a chord the bulk editor would
  // reject, nor silently repair unknown persisted entries during one-row edit.
  const auto owner = ShortcutOwner(profile);
  if (owner.empty() || !profile->GetPrefs()->FindPreference(kOverrides))
    return "Shortcut profile authority unavailable";
  const auto revision = ShortcutRevision(profile, owner);
  if (revision.empty())
    return "Shortcut revision unavailable";
  auto mappings = profile->GetPrefs()->GetDict(kOverrides).Clone();
  mappings.Set(base::NumberToString(command), value);
  auto result = ImportShortcutProfile(profile, owner, revision, mappings);
  if (!result.FindBool("success").value_or(false)) {
    const auto* error = result.FindString("error");
    return error ? *error : "Shortcuts were not changed";
  }
  return std::nullopt;'''),
    ('''  if (auto error = SetKeyboardShortcut(profile, command, Default(*binding)))
    return error;
  if (command != kPopup) {
    ScopedDictPrefUpdate update(profile->GetPrefs(), kOverrides);
    update->Remove(base::NumberToString(command));
  }
  return std::nullopt;''',
     '''  // Import's normalization removes a default override in its one write.
  return SetKeyboardShortcut(profile, command, Default(*binding));'''),
])

project('chrome/browser/ui/views/frame/aux_tab_search_bubble.cc', [
    ('''constexpr int kToggleModifiers = ui::EF_COMMAND_DOWN | ui::EF_SHIFT_DOWN;''',
     '''constexpr int kShortcutModifiers = ui::EF_COMMAND_DOWN | ui::EF_CONTROL_DOWN |
                                   ui::EF_ALT_DOWN | ui::EF_SHIFT_DOWN;'''),
    ('''bool ToggleKey(const ui::KeyEvent& event) {
  return event.key_code() == ui::VKEY_A &&
      (event.flags() & kToggleModifiers) == kToggleModifiers;
}
 bool ToggleKey'''.replace('\n bool','\nbool'),
     '''bool ToggleKey(const ui::KeyEvent& event, Profile* profile) {
  ui::Accelerator toggle;
  return profile && GetKeyboardShortcut(profile, IDC_TAB_SEARCH, &toggle) &&
      ui::Accelerator(event.key_code(), event.flags() & kShortcutModifiers) == toggle;
}
bool ToggleKey'''),
    ('''bool ToggleKey(const input::NativeWebKeyboardEvent& event) {
  constexpr int kModifiers = blink::WebInputEvent::kMetaKey |
                            blink::WebInputEvent::kShiftKey;
  return event.windows_key_code == ui::VKEY_A &&
      (event.GetModifiers() & kModifiers) == kModifiers;
}''',
     '''bool ToggleKey(const input::NativeWebKeyboardEvent& event, Profile* profile) {
  int flags = 0;
  const int modifiers = event.GetModifiers();
  if (modifiers & blink::WebInputEvent::kMetaKey) flags |= ui::EF_COMMAND_DOWN;
  if (modifiers & blink::WebInputEvent::kControlKey) flags |= ui::EF_CONTROL_DOWN;
  if (modifiers & blink::WebInputEvent::kAltKey) flags |= ui::EF_ALT_DOWN;
  if (modifiers & blink::WebInputEvent::kShiftKey) flags |= ui::EF_SHIFT_DOWN;
  ui::Accelerator toggle;
  return profile && GetKeyboardShortcut(profile, IDC_TAB_SEARCH, &toggle) &&
      ui::Accelerator(static_cast<ui::KeyboardCode>(event.windows_key_code), flags) == toggle;
}'''),
    ('''        ToggleKey(event)) {''',
     '''        ToggleKey(event, Profile::FromBrowserContext(source->GetBrowserContext()))) {'''),
    ('''      : close_(std::move(close)) {
    SetLayoutManager''',
     '''      : close_(std::move(close)), profile_(profile->GetWeakPtr()) {
    SetLayoutManager'''),
    ('''    AddAccelerator(ui::Accelerator(ui::VKEY_A, kToggleModifiers));''',
     '''    RefreshToggleAccelerator();'''),
    ('''    if (accelerator.key_code() == ui::VKEY_ESCAPE ||
        (accelerator.key_code() == ui::VKEY_A &&
         (accelerator.modifiers() & kToggleModifiers) == kToggleModifiers)) {''',
     '''    ui::Accelerator toggle;
    if (accelerator.key_code() == ui::VKEY_ESCAPE ||
        (profile_ && GetKeyboardShortcut(profile_.get(), IDC_TAB_SEARCH, &toggle) &&
         accelerator == toggle)) {'''),
    ('''  void BeginInvocation(AuxCommandBarMode mode,
                       std::optional<base::DictValue> proposal) {
    if (auto* binding''',
     '''  void BeginInvocation(AuxCommandBarMode mode,
                       std::optional<base::DictValue> proposal) {
    RefreshToggleAccelerator();
    if (auto* binding'''),
    (''' private:
  const base::RepeatingClosure close_;
  raw_ptr<AuxTabSearchWebView> webview_ = nullptr;''',
     ''' private:
  void RefreshToggleAccelerator() {
    if (toggle_accelerator_)
      RemoveAccelerator(*toggle_accelerator_);
    toggle_accelerator_.reset();
    ui::Accelerator toggle;
    if (profile_ && GetKeyboardShortcut(profile_.get(), IDC_TAB_SEARCH, &toggle)) {
      toggle_accelerator_ = toggle;
      AddAccelerator(toggle);
    }
  }
  const base::RepeatingClosure close_;
  base::WeakPtr<Profile> profile_;
  std::optional<ui::Accelerator> toggle_accelerator_;
  raw_ptr<AuxTabSearchWebView> webview_ = nullptr;'''),
    ('''    if (ToggleKey(key))
      CloseAndReload();''',
     '''    if (ToggleKey(key, profile_.get()))
      CloseAndReload();'''),
])

project('chrome/browser/ui/aux_preview/aux_preview_controller.cc', [
    ('''  auto source_weak = source->GetWeakPtr();
  auto window = std::make_shared<Window>();''',
     '''  auto source_weak = source->GetWeakPtr();
  const auto source_contents = contents->GetWeakPtr();
  auto window = std::make_shared<Window>();'''),
    ('''  auto* browser = CreateBrowserWindow(std::move(params));''',
     '''  const auto source_current = [&]() {
    auto* live_frame = document.AsRenderFrameHostIfValid();
    return source_weak && source_contents && live_frame && live_frame->IsActive() &&
        !BusyBrowser(source_weak.get()) &&
        source_weak->GetProfile() == window->profile.get() &&
        source_weak->GetTabStripModel()->GetActiveWebContents() == source_contents.get() &&
        content::WebContents::FromRenderFrameHost(live_frame) == source_contents.get() &&
        !AgentOwned(source_contents.get());
  };
  auto* browser = CreateBrowserWindow(std::move(params));'''),
    ('''  if (!Current(window) || !source_weak || !document.AsRenderFrameHostIfValid() ||
      source_weak->GetProfile() != window->profile.get()) {''',
     '''  if (!Current(window) || !source_current()) {'''),
    ('''  if (!blank || !window->browser || !Decorator().Run(browser) || !Current(window) ||
      !source_weak || !document.AsRenderFrameHostIfValid() ||
      source_weak->GetProfile() != window->profile.get()) {''',
     '''  const auto blank_contents = blank ? blank->GetWeakPtr() : nullptr;
  if (!blank_contents || !window->browser || !Decorator().Run(window->browser.get()) ||
      !Current(window) || !source_current() || !blank_contents ||
      window->browser->GetTabStripModel()->count() != 1 ||
      window->browser->GetTabStripModel()->GetActiveWebContents() != blank_contents.get()) {'''),
    ('''    NavigateParams navigation(browser, url, ui::PAGE_TRANSITION_LINK);''',
     '''    NavigateParams navigation(window->browser.get(), url, ui::PAGE_TRANSITION_LINK);'''),
    ('''    if (!window->browser || !navigation.navigated_or_inserted_contents) {''',
     '''    if (!Current(window) || !blank_contents ||
        navigation.navigated_or_inserted_contents != blank_contents.get() ||
        window->browser->GetTabStripModel()->GetActiveWebContents() != blank_contents.get()) {'''),
    ('''  window->initialized = true;
  browser->GetWindow()->Show(); browser->GetWindow()->Activate();
  if (url.is_empty()) chrome::FocusLocationBar(browser);
  return {.browser = browser};''',
     '''  window->initialized = true;
  window->browser->GetWindow()->Show();
  if (!Current(window) || BusyBrowser(window->browser.get()))
    return {.error = "Preview owner changed while showing the window"};
  window->browser->GetWindow()->Activate();
  if (!Current(window) || BusyBrowser(window->browser.get()))
    return {.error = "Preview owner changed while activating the window"};
  if (url.is_empty()) chrome::FocusLocationBar(window->browser.get());
  if (!Current(window) || BusyBrowser(window->browser.get()))
    return {.error = "Preview owner changed before opening completed"};
  return {.browser = window->browser.get()};'''),
    ('''  const bool moved = destination && window->profile && contents && handle.Get() &&
      destination->GetProfile() == window->profile.get() &&
      aux::GetProfileCookieBindingEpoch(window->profile.get()) == window->epoch &&
      !aux::IsProfileCookieRestorePending(window->profile.get()) &&
      handle.Get()->GetContents() == contents.get() &&
      handle.Get()->GetBrowserWindowInterface() == destination.get();
  window->promoting = false;
  if (moved) {
    destination->GetWindow()->Show(); destination->GetWindow()->Activate();
    std::move(done).Run(Result(true));
  } else {''',
     '''  const auto moved_here = [&]() {
    const auto native = aux::peer::InspectNativeBrowserShutdown();
    return destination && window->profile && contents && handle.Get() &&
        !BusyBrowser(destination.get()) &&
        destination->GetProfile() == window->profile.get() &&
        aux::GetProfileCookieBindingEpoch(window->profile.get()) == window->epoch &&
        !aux::IsProfileCookieRestorePending(window->profile.get()) &&
        window->roots && window->roots->Revalidate() && window->generation &&
        native.admitted_generation == window->generation && !native.wrong_process &&
        !native.admission_closed && !native.sequence_uncertain &&
        handle.Get()->GetContents() == contents.get() &&
        handle.Get()->GetBrowserWindowInterface() == destination.get();
  };
  window->promoting = false;
  if (moved_here()) {
    destination->GetWindow()->Show();
    if (!moved_here()) {
      std::move(done).Run(Result(false, "Destination changed after handoff; the tab was not reopened"));
      return;
    }
    destination->GetWindow()->Activate();
    std::move(done).Run(moved_here() ? Result(true) :
        Result(false, "Destination changed during activation; the tab was not reopened"));
  } else {'''),
    ('''  window->promoting = true;
  window->changes.Notify();''',
     '''  const bool explicit_destination = destination != nullptr;
  const auto requested_destination = destination ? destination->GetWeakPtr() : nullptr;
  window->promoting = true;
  window->changes.Notify();'''),
    ('''  if (destination) { Move(window, space, std::move(done), destination); return; }''',
     '''  if (explicit_destination) {
    if (!requested_destination) {
      window->promoting = false;
      std::move(done).Run(Result(false, "The chosen destination closed"));
      return;
    }
    Move(window, space, std::move(done), requested_destination.get()); return;
  }'''),
])

project('chrome/browser/ui/aux_preview/aux_preview_controls.cc', [
    ('''    if (!moved && web_contents())
      ReportRestriction(web_contents(), "Back is unavailable while this page has active work.");
    Refresh();''',
     '''    if (!moved && web_contents())
      ReportRestriction(web_contents(), "Back is unavailable while this page has active work.");
    if (weak)
      Refresh();'''),
    ('''    std::string reason;
    if (!Dismiss(browser_.get(), &reason) && web_contents())
      ReportRestriction(web_contents(), reason);''',
     '''    std::string reason;
    const auto alive = weak_.GetWeakPtr();
    const bool dismissed = Dismiss(browser_.get(), &reason);
    if (alive && !dismissed && web_contents())
      ReportRestriction(web_contents(), reason);'''),
    ('''  void OnPromoted(base::DictValue result) {
    if (!result.FindBool("ok").value_or(false) && web_contents()) {''',
     '''  void OnPromoted(base::DictValue result) {
    const auto alive = weak_.GetWeakPtr();
    if (!result.FindBool("ok").value_or(false) && web_contents()) {'''),
    ('''      ReportRestriction(web_contents(), error ? *error : "The tab could not be promoted.");
    }
    Refresh();''',
     '''      ReportRestriction(web_contents(), error ? *error : "The tab could not be promoted.");
    }
    if (alive)
      Refresh();'''),
])

(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.navigation-completion.source.v1',
    'baselineCommit': 'd11d6108b', 'nativeRoot': str(ROOT), 'files': files,
    'nativeRootChanged': False, 'actualAppAcceptance': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files), 'nativeRootChanged': False}))

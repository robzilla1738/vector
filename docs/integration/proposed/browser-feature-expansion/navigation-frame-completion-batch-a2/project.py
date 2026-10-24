"""Project frame/theme lifecycle fixes; never modify the active native inputs."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda value: hashlib.sha256(value).hexdigest()
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


project('chrome/browser/ui/views/frame/aux_profile_preview_admission.h', [
    ('  void SetEdgeRetention(bool requested);',
     '''  void SetEdgeRetention(bool requested);
  // Native sidebar URL placement owns this request, independently of mouse
  // producers and the region's menu/drag locks.
  void SetNavigationRetention(bool requested);
  void ClearNavigationRetentionWithoutLayout() { navigation_retention_ = false; }'''),
    ('  bool edge_retention_ = false;',
     '  bool edge_retention_ = false;\n  bool navigation_retention_ = false;'),
    ('  void SetHoverExpanded(bool expanded);',
     '  void SetHoverExpanded(bool expanded);\n'
     '  // Called only by the real frame controller after its hide motion ends.\n'
     '  void HoverCollapseSettled();'),
])
project('chrome/browser/ui/views/frame/aux_profile_preview_admission.cc', [
    ('void ProfilePreviewAdmission::AcquireRetention() {',
     '''void ProfilePreviewAdmission::SetNavigationRetention(bool requested) {
  requested = requested && collapsed_;
  if (navigation_retention_ == requested) {
    if (requested && !retained_)
      AcquireRetention();
    return;
  }
  navigation_retention_ = requested;
  if (requested) {
    if (!retained_)
      AcquireRetention();
  } else if (retained_ && !browser_retention_ && !edge_retention_) {
    ScheduleRelease();
  }
}

void ProfilePreviewAdmission::AcquireRetention() {'''),
    ('void ProfilePreviewAdmission::ReleaseIfPointerOutside() {',
     '''void ProfilePreviewAdmission::ReleaseIfPointerOutside() {
  // A delayed release belongs to the request which scheduled it. A different
  // real producer may have acquired while the shared timer was pending.
  if (browser_retention_ || edge_retention_ || navigation_retention_) {
    ScheduleRetentionCheck();
    return;
  }'''),
    ('  if (delegate_->KeepExpandedLocked()) {',
     '  if (navigation_retention_ || delegate_->KeepExpandedLocked()) {'),
    ('  browser_retention_ = retained_ = false;',
     '  browser_retention_ = navigation_retention_ = retained_ = false;'),
    ('''  if (!retained_ || browser_retention_ || edge_retention_ || pointer_inside ||
      hover_expanded_)''',
     '''  if (!retained_ || browser_retention_ || edge_retention_ ||
      navigation_retention_ || pointer_inside || hover_expanded_)'''),
    ('  collapsed_ = collapsed;\n  uncollapsed_width_ = uncollapsed_width;',
     '''  collapsed_ = collapsed;
  if (!collapsed)
    navigation_retention_ = false;
  uncollapsed_width_ = uncollapsed_width;'''),
    ('''  if (edge_retention_ == requested)
    return;
  edge_retention_ = requested;''',
     '''  if (edge_retention_ == requested) {
    // A genuine force-collapse can retire the panel while preserving the edge
    // producer's latch. A later eligible event must be able to acquire again.
    if (requested && !retained_)
      AcquireRetention();
    return;
  }
  edge_retention_ = requested;'''),
    ('''  if (browser_retention_ || edge_retention_)
    return;
  auto weak = weak_factory_.GetWeakPtr();
  const bool inside = delegate_->RetainedPointerInside();
  if (weak && !inside)
    ClearRetention();
}''',
     '''  if (browser_retention_ || edge_retention_ || navigation_retention_) {
    ScheduleRetentionCheck();
    return;
  }
  auto weak = weak_factory_.GetWeakPtr();
  const bool inside = delegate_->RetainedPointerInside();
  if (!weak)
    return;
  if (!inside) {
    ClearRetention();
    // A successful release has started the real hide motion. Its completion,
    // not another timer tick, retires the retained geometry.
    if (!weak || !hover_expanded_)
      return;
  }
  // RetainingOneShotTimer stops before running its callback. Keep observing
  // the SAME retained owner while pointer/focus/menu/drag can still change.
  ScheduleRetentionCheck();
}'''),
    ('void ProfilePreviewAdmission::SetCollapseState(bool collapsed,',
     '''void ProfilePreviewAdmission::HoverCollapseSettled() {
  if (!retained_ || hover_expanded_ || browser_retention_ || edge_retention_ ||
      navigation_retention_)
    return;
  const auto weak = weak_factory_.GetWeakPtr();
  const bool locked = delegate_->KeepExpandedLocked();
  if (!weak || locked)
    return;
  // Keep full retained geometry throughout the existing slide-out. Only the
  // genuine completion may retire its offscreen surface/focus presentation.
  retained_ = false;
  retained_check_.Stop();
  delegate_->ApplyRetainedLayout();
}

void ProfilePreviewAdmission::SetCollapseState(bool collapsed,'''),
])
project('chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h', [
    ('  void SetAuxNavigationPlacementHold(bool held);',
     '''  void SetAuxNavigationPlacementHold(bool held);
  // Terminal detach/profile pause revokes ownership without starting layout.
  void ClearAuxNavigationPlacementHoldWithoutLayout();'''),
])
project('chrome/browser/ui/views/frame/vertical_tab_strip_region_view.cc', [
    ('''void VerticalTabStripRegionView::SetAuxNavigationPlacementHold(bool held) {
  if (aux_navigation_placement_hold_ == held)
    return;
  aux_navigation_placement_hold_ = held;
  // Root owns this placement lifetime. Do not count the hold as a menu lock
  // in the public input snapshot: that would make deferred relocation sticky.
  UpdateExpandOnHoverState();
}''',
     '''void VerticalTabStripRegionView::SetAuxNavigationPlacementHold(bool held) {
  const bool changed = aux_navigation_placement_hold_ != held;
  aux_navigation_placement_hold_ = held;
  // The real placement owner supplies focus/menu/drag deferral. Keep its
  // floating geometry distinct from mouse producers and public menu locks,
  // otherwise deferred relocation can become self-sustaining.
  const auto alive = aux_preview_weak_factory_.GetWeakPtr();
  if (aux_profile_preview_admission_) {
    aux_profile_preview_admission_->SetNavigationRetention(
        held && force_collapse_lock_count_ == 0 && GetWidget() && tab_strip_view());
    if (!alive)
      return;
  }
  if (changed)
    UpdateExpandOnHoverState();
}

void VerticalTabStripRegionView::ClearAuxNavigationPlacementHoldWithoutLayout() {
  aux_navigation_placement_hold_ = false;
  if (aux_profile_preview_admission_)
    aux_profile_preview_admission_->ClearNavigationRetentionWithoutLayout();
}'''),
    ('void VerticalTabStripRegionView::RemovedFromWidget() {',
     '''void VerticalTabStripRegionView::RemovedFromWidget() {
  // Like the native edge producer, detachment revokes without a new callback.
  ClearAuxNavigationPlacementHoldWithoutLayout();'''),
    ('''void VerticalTabStripRegionView::OnTabStripViewWillClear() {
  aux_empty_pinned_drop_active_ = false;
  aux_navigation_placement_hold_ = false;''',
     '''void VerticalTabStripRegionView::OnTabStripViewWillClear() {
  aux_empty_pinned_drop_active_ = false;
  ClearAuxNavigationPlacementHoldWithoutLayout();'''),
    ('''    // The recovered SlideAnimation owns region width and admission. The
    // frame controller owns its companion collapse and hover transitions.
    if (status == BrowserAnimationUpdate::kStarted)''',
     '''    // The recovered SlideAnimation owns region width and admission. The
    // frame controller owns its companion collapse and hover transitions.
    const auto alive = aux_preview_weak_factory_.GetWeakPtr();
    if (status == BrowserAnimationUpdate::kEnded &&
        controller->GetCurrentMotion(TabStripAnimations::kVerticalTabStrip) ==
            TabStripAnimations::kCollapseOnHover) {
      aux_profile_preview_admission_->HoverCollapseSettled();
      if (!alive)
        return;
    }
    if (status == BrowserAnimationUpdate::kStarted)'''),
])

project('chrome/browser/ui/views/frame/browser_view.cc', [
    ('''  aux_profile_switch_source_ = GetProfile()->GetWeakPtr();
  aux_profile_switch_target_ = target->GetWeakPtr();
  registrar_.Reset();''',
     '''  aux_profile_switch_source_ = GetProfile()->GetWeakPtr();
  aux_profile_switch_target_ = target->GetWeakPtr();
  // The source profile's deferred sidebar URL placement cannot retain the
  // target profile's hover surface through the paused rebind interval.
  if (vertical_tab_strip_region_view_)
    vertical_tab_strip_region_view_->ClearAuxNavigationPlacementHoldWithoutLayout();
  registrar_.Reset();'''),
])

project('chrome/browser/themes/aux_theme_editor.cc', [
    ('  ~Editor() override = default;\n  base::DictValue Saved() const {',
     '''  ~Editor() override = default;
  base::WeakPtr<Editor> GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
  Profile* profile() const { return profile_.get(); }
  base::DictValue Saved() const {'''),
    ('''    return !owner.empty() && owner.size() <= 256 && revision == revision_ &&
        (owner_.empty() || owner_ == owner);''',
     '''    return !writing_ && !owner.empty() && owner.size() <= 256 && revision == revision_ &&
        (owner_.empty() || owner_ == owner);'''),
    ('''  void WriteTokens(base::DictValue tokens, bool reset = false) {
    ClearPreview();
    writing_ = true;''',
     '''  void WriteTokens(base::DictValue tokens, bool reset = false) {
    const auto alive = weak_factory_.GetWeakPtr();
    ClearPreview();
    writing_ = true;'''),
    ('''      theme->UseDefaultTheme();
      theme->SetBrowserColorScheme(ThemeService::BrowserColorScheme::kSystem);''',
     '''      theme->UseDefaultTheme();
      if (!alive || !profile_)
        return;
      theme->SetBrowserColorScheme(ThemeService::BrowserColorScheme::kSystem);'''),
    ('''    profile_->GetPrefs()->SetDict(kThemeTokensPref, std::move(tokens));
    writing_ = false;
    Changed();''',
     '''    if (!alive || !profile_)
      return;
    if (!Available(profile_.get())) {
      writing_ = false;
      return;
    }
    profile_->GetPrefs()->SetDict(kThemeTokensPref, std::move(tokens));
    if (!alive)
      return;
    writing_ = false;
    Changed();'''),
    ('''  void WritePresets(base::ListValue presets) {
    writing_ = true;
    profile_->GetPrefs()->SetList(kThemePresetsPref, std::move(presets));
    writing_ = false;''',
     '''  void WritePresets(base::ListValue presets) {
    const auto alive = weak_factory_.GetWeakPtr();
    writing_ = true;
    profile_->GetPrefs()->SetList(kThemePresetsPref, std::move(presets));
    if (!alive)
      return;
    writing_ = false;'''),
    ('''    if (tokens.Remove("accent")) {
      writing_ = true;
      profile_->GetPrefs()->SetDict(kThemeTokensPref, std::move(tokens));
      writing_ = false;
    }
    ExternalChange();''',
     '''    if (tokens.Remove("accent")) {
      const auto alive = weak_factory_.GetWeakPtr();
      writing_ = true;
      profile_->GetPrefs()->SetDict(kThemeTokensPref, std::move(tokens));
      if (!alive)
        return;
      writing_ = false;
    }
    ExternalChange();'''),
    ('  SEQUENCE_CHECKER(sequence_);\n};\n\nEditor& GetEditor(Profile* profile) {',
     '''  SEQUENCE_CHECKER(sequence_);
  base::WeakPtrFactory<Editor> weak_factory_{this};
};

base::DictValue StateAfterChange(const base::WeakPtr<Editor>& editor) {
  if (!editor || !editor->profile())
    return Failure("The theme editor's profile closed before completion.");
  if (!Available(editor->profile()))
    return Failure("Theme editing is no longer available in this profile.");
  return editor->State();
}

Editor& GetEditor(Profile* profile) {'''),
    ('''  editor.SetPreview(owner, std::move(*valid));
  return editor.State();''',
     '''  const auto alive = editor.GetWeakPtr();
  editor.SetPreview(owner, std::move(*valid));
  return StateAfterChange(alive);'''),
    ('''  editor.WriteTokens(std::move(*valid));
  return editor.State();''',
     '''  const auto alive = editor.GetWeakPtr();
  editor.WriteTokens(std::move(*valid));
  return StateAfterChange(alive);'''),
    ('''base::DictValue Cancel(Profile* profile, std::string_view owner) {
  if (!Available(profile))
    return Failure("Theme editing is unavailable in this profile.");
  auto& editor = GetEditor(profile);
  if (editor.Owns(owner))
    editor.Expire();
  return editor.State();
}''',
     '''base::DictValue Cancel(Profile* profile, std::string_view owner) {
  if (!profile)
    return Failure("Theme editing is unavailable in this profile.");
  // Revocation is not a preference write. Policy/accessibility/profile changes
  // must not leave an old preview waiting to resurrect when editing returns.
  auto* editor = static_cast<Editor*>(profile->GetUserData(&kEditorDataKey));
  if (!editor)
    return GetState(profile);
  const auto alive = editor->GetWeakPtr();
  if (!owner.empty() && editor->Owns(owner))
    editor->Expire();
  return StateAfterChange(alive);
}'''),
    ('''  editor.WriteTokens(base::DictValue().Set("version", 1), true);
  return editor.State();''',
     '''  const auto alive = editor.GetWeakPtr();
  editor.WriteTokens(base::DictValue().Set("version", 1), true);
  return StateAfterChange(alive);'''),
    ('''  editor.WritePresets(std::move(presets));
  return editor.State();
}

base::DictValue DeletePreset''',
     '''  const auto alive = editor.GetWeakPtr();
  editor.WritePresets(std::move(presets));
  return StateAfterChange(alive);
}

base::DictValue DeletePreset'''),
    ('''  editor.WritePresets(std::move(presets));
  return editor.State();
}

base::DictValue ExportPreset''',
     '''  const auto alive = editor.GetWeakPtr();
  editor.WritePresets(std::move(presets));
  return StateAfterChange(alive);
}

base::DictValue ExportPreset'''),
])

(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.navigation-frame-completion.source.v1',
    'baselineCommit': '12fa305ef', 'nativeRoot': str(ROOT), 'files': files,
    'nativeRootChanged': False, 'actualAppAcceptance': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files), 'nativeRootChanged': False}))

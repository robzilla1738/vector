"""Count-checked productivity fixes over the current native source, read-only."""
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
    for find, replace, expected in edits:
        assert text.count(find) == expected, (name, find[:100], text.count(find), expected)
        text = text.replace(find, replace)
        anchors.append({'find': find, 'replace': replace, 'count': expected})
    target = HERE / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)
    assert (ROOT / name).read_bytes() == original
    files.append({'path': name, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                  'source': str(target), 'anchors': anchors})
    patch.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                       fromfile='a/' + name, tofile='b/' + name))


prefix = 'chrome/browser/ui/views/frame/'
project(prefix + 'multi_contents_view.h', [
    ('  void OnSwap();', '  void OnSwap();\n  void OnSwapBranch(uint32_t node);', 1),
])
project(prefix + 'multi_contents_view.cc', [
    ('''                          [](const auto& handle) { return handle->branch_node(); })) return;''',
     '''                          [](const auto& handle) { return handle->branch_node(); })) {
      // Different split trees reuse node IDs. Update retained handle axes when
      // switching panes as well as when changing the current tree's visuals.
      for (const auto& handle : branch_resize_areas_) {
        const auto* node = visual_data_.pane_tree()->Find(handle->branch_node());
        if (node) handle->SetLayout(node->axis == split_tabs::SplitPaneTree::Axis::kHorizontal
            ? split_tabs::SplitTabLayout::kSideBySide : split_tabs::SplitTabLayout::kStacked);
      }
      return;
    }''', 1),
    ('''  for (const auto& handle : branch_resize_areas_) {
    const auto* node = visual_data_.pane_tree()->Find(handle->branch_node());
    if (node) handle->SetLayout(node->axis == split_tabs::SplitPaneTree::Axis::kHorizontal
        ? split_tabs::SplitTabLayout::kSideBySide : split_tabs::SplitTabLayout::kStacked);
  }
  InvalidateLayout();''', '  InvalidateLayout();', 1),
    ('''void MultiContentsView::SetTargetContentBounds(''',
     '''void MultiContentsView::OnSwapBranch(uint32_t node) {
  if (!IsInSplitView() || !visual_data_.pane_tree()) return;
  const auto* branch = visual_data_.pane_tree()->Find(node);
  if (branch && !branch->slot) delegate_->ReversePaneBranch(node);
}

void MultiContentsView::SetTargetContentBounds(''', 1),
])
project(prefix + 'multi_contents_resize_area.cc', [
    ('    if (!branch_node_) multi_contents_view_->OnSwap();',
     '''    if (branch_node_) multi_contents_view_->OnSwapBranch(branch_node_);
    else multi_contents_view_->OnSwap();''', 2),
])
project(prefix + 'multi_contents_view_delegate.h', [
    ('  virtual void ResizePaneBranch(uint32_t, double, bool) {}',
     '  virtual void ResizePaneBranch(uint32_t, double, bool) {}\n  virtual void ReversePaneBranch(uint32_t node);', 1),
    ('  void ReverseWebContents() override;',
     '  void ReverseWebContents() override;\n  void ReversePaneBranch(uint32_t node) override;', 1),
])
project(prefix + 'multi_contents_view_delegate.cc', [
    ('MultiContentsViewDelegateImpl::MultiContentsViewDelegateImpl(',
     '''void MultiContentsViewDelegate::ReversePaneBranch(uint32_t) {}

MultiContentsViewDelegateImpl::MultiContentsViewDelegateImpl(''', 1),
    ('void MultiContentsViewDelegateImpl::ResizePaneBranch(uint32_t node,',
     '''void MultiContentsViewDelegateImpl::ReversePaneBranch(uint32_t node) {
  auto* active = tab_strip_model_->GetActiveTab();
  if (!active || !active->GetSplit()) return;
  const auto split = *active->GetSplit();
  const auto* data = tab_strip_model_->GetSplitData(split);
  if (!data || !data->visual_data()->pane_tree()) return;
  auto tree = *data->visual_data()->pane_tree();
  if (!tree.SwapBranch(node) || !tab_strip_model_->UpdateSplitPaneTree(split, tree, false)) return;
  // Preserve the genuine tabs, documents and active selection. Only this
  // branch's geometry changes, and the native session owns its restoration.
  if (auto* sessions = SessionServiceFactory::GetForProfile(browser_->GetProfile()))
    sessions->SetSplitTabData(browser_->GetSessionID(), split,
                             tab_strip_model_->GetSplitData(split)->visual_data());
}

void MultiContentsViewDelegateImpl::ResizePaneBranch(uint32_t node,''', 1),
])
project(prefix + 'aux_recent_files_section.cc', [
    ('''  RecentFileRow(std::u16string name, base::RepeatingClosure reveal,
                base::RepeatingClosure drag)
      : views::Button(std::move(reveal)), drag_(std::move(drag)) {''',
     '''  RecentFileRow(std::u16string name, bool available,
                base::RepeatingClosure reveal, base::RepeatingClosure drag)
      : views::Button(std::move(reveal)), drag_(std::move(drag)), available_(available) {''', 1),
    ('    label_ = AddChildView(std::make_unique<views::Label>(name));',
     '    label_ = AddChildView(std::make_unique<views::Label>(available_ ? name : name + u" — unavailable"));', 1),
    ('''    SetTooltipText(name + u" — drag to attach; click to show in Finder");
    GetViewAccessibility().SetName(name);''',
     '''    SetEnabled(available_);
    SetTooltipText(available_ ? name + u" — drag to attach; click to show in Finder"
                             : name + u" — unavailable. Select or download this file again.");
    GetViewAccessibility().SetName(available_ ? name : name + u" — unavailable");''', 1),
    ('    label_->SetEnabledColor(RowColor(*this, false));',
     '    label_->SetEnabledColor(RowColor(*this, !available_));', 1),
    ('  bool pressed_ = false, dragged_ = false;',
     '  bool pressed_ = false, dragged_ = false;\n  const bool available_;', 1),
    ('''    if (!id || !name || !file->FindBool("available").value_or(false)) continue;
    auto row = std::make_unique<RecentFileRow>(base::UTF8ToUTF16(*name),''',
     '''    if (!id || !name) continue;
    auto row = std::make_unique<RecentFileRow>(base::UTF8ToUTF16(*name),
        file->FindBool("available").value_or(false),''', 1),
])

result = {'format': 'aux.productivity-completion.source.v1', 'root': str(ROOT),
          'files': files, 'nativeCheckoutChanged': False,
          'nativeBuildRun': False, 'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'anchors': sum(len(row['anchors']) for row in files),
                  'nativeCheckoutChanged': False}))

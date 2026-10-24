"""Count-checked organization fixes over the actual current native input."""
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
        assert text.count(before) == 1, (name, before[:120], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    target = HERE / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)
    files.append({'path': name, 'inputSha256': sha(original),
                  'outputSha256': sha(text.encode()), 'output': str(target), 'anchors': anchors})
    patch.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                    fromfile='a/' + name, tofile='b/' + name))


prefix = 'chrome/browser/ui/views/frame/'
project(prefix + 'aux_organization_window_controller.h', [
    ('#include "base/callback_list.h"', '#include "base/callback_list.h"\n#include "base/timer/timer.h"'),
    ('  bool HasPendingSharedUpdate(const std::string&) const;',
     '  bool HasPendingSharedUpdate(const std::string&) const;\n'
     '  // Presentation follows this window\'s retained live page; shared topology\n'
     '  // and manually chosen titles stay authoritative in the logical record.\n'
     '  organization::Entry EntryForDisplay(const organization::Entry&) const;'),
    ('  bool cleanup_running_ = false, cleanup_waiting_ = false;',
     '  bool cleanup_running_ = false, cleanup_waiting_ = false;\n  base::RepeatingTimer cleanup_timer_;'),
])

controller = (ROOT / prefix / 'aux_organization_window_controller.cc').read_text()
start = controller.index('bool AuxOrganizationWindowController::HandleClose(tabs::TabHandle handle) {')
end = controller.index('bool AuxOrganizationWindowController::HasPendingSharedUpdate(', start)
project(prefix + 'aux_organization_window_controller.cc', [
    ('  shutdown_ = true;\n  weak_.InvalidateWeakPtrs();',
     '  shutdown_ = true;\n  cleanup_timer_.Stop();\n  weak_.InvalidateWeakPtrs();'),
    ('void AuxOrganizationWindowController::RebindForProfileSwitch() {\n  if (shutdown_) return;',
     'void AuxOrganizationWindowController::RebindForProfileSwitch() {\n  if (shutdown_) return;\n  cleanup_timer_.Stop();'),
    ('  settled_ = organization->ObserveSettled(base::BindRepeating(&AuxOrganizationWindowController::QueueReconcile, weak_.GetWeakPtr()));\n  QueueReconcile();',
     '  settled_ = organization->ObserveSettled(base::BindRepeating(&AuxOrganizationWindowController::QueueReconcile, weak_.GetWeakPtr()));\n'
     '  if (!cleanup_timer_.IsRunning())\n'
     '    cleanup_timer_.Start(FROM_HERE, base::Hours(1), base::BindRepeating(\n'
     '        &AuxOrganizationWindowController::QueueReconcile, weak_.GetWeakPtr()));\n'
     '  QueueReconcile();'),
    ('    if (!organization->TryClaimStartupCleanup()) return;',
     '    if (!organization->TryClaimCleanupPass()) return;'),
    (controller[start:end], '''bool AuxOrganizationWindowController::HandleClose(tabs::TabHandle handle) {
  if (!Current() || model_->closing_all() || IsExplicitUnload(handle)) return false;
  auto* tab = handle.Get(); if (!tab || !tab->GetContents() || tab->IsSplit()) return false;
  const auto id = GetRememberedPinnedTabEntryId(*tab->GetContents()).value_or("");
  auto* organization = Organization(browser_.get());
  if (id.empty() || !organization || !organization->snapshot().entries.contains(id)) return false;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE, base::BindOnce(
      [](base::WeakPtr<AuxOrganizationWindowController> owner, tabs::TabHandle target, std::string id) {
        auto* tab = target.Get();
        if (!owner || !owner->Current() || owner->model_->closing_all() || !tab || tab->IsSplit() ||
            owner->model_->GetIndexOfTab(tab) < 0 ||
            !tab->GetContents() || tab->GetContents()->GetBrowserContext() != owner->profile_ ||
            GetRememberedPinnedTabEntryId(*tab->GetContents()) != id) return;
        auto* current = Organization(owner->browser_.get());
        if (!current || current->blocked() || !current->snapshot().entries.contains(id)) return;
        // Retain the exact native tab and re-read retention after the posted
        // task. A pin/Keep change while queued must not become a shared close.
        if (current->snapshot().entries.at(id).archived) { owner->CloseViewNow(target); return; }
        auto done = base::BindOnce([](base::WeakPtr<AuxOrganizationWindowController> owner, bool) {
          if (owner) owner->Notify();
        }, owner);
        if (tab->IsPinned() || organization::HasRetention(current->snapshot(), id)) owner->UnloadLogicalTab(id, std::move(done));
        else owner->ArchiveLogicalEntry(id, std::move(done));
      }, weak_.GetWeakPtr(), handle, id));
  return true;
}
'''),
    ('bool AuxOrganizationWindowController::HasPendingSharedUpdate(const std::string& id) const {',
     '''organization::Entry AuxOrganizationWindowController::EntryForDisplay(const organization::Entry& entry) const {
  organization::Entry shown = entry;
  const auto* service = Current() ? Organization(browser_.get()) : nullptr;
  if (!service || service->blocked() || entry.archived || entry.kind != organization::EntryKind::kTab) return shown;
  const auto shared = service->snapshot().entries.find(entry.id);
  if (shared == service->snapshot().entries.end() || shared->second != entry) return shown;
  const auto handle = FindLocalView(entry.id);
  auto* tab = handle ? handle->Get() : nullptr;
  auto* contents = tab ? tab->GetContents() : nullptr;
  if (!contents || IsBookmarkTabExcluded(tab, model_) ||
      (!tab->IsPinned() && (!ordinary_eligible_ || !ordinary_eligible_.Run(*tab)))) return shown;
  const auto* identity = PageIdentity::FromWebContents(contents);
  if (identity && identity->runtime_owned()) return shown;
  const auto url = LogicalTabUrl(*contents);
  if (url.is_valid()) shown.current_url = url.spec();
  if (entry.title_mode == organization::TitleMode::kAutomatic)
    shown.title = base::UTF16ToUTF8(contents->GetTitle());
  return shown;
}
bool AuxOrganizationWindowController::HasPendingSharedUpdate(const std::string& id) const {'''),
])

project(prefix + 'aux_organization_tree_view.cc', [
    ('    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(',
     '''    auto shown = entry;
    if (owner_ && owner_->browser_)
      if (auto* controller = AuxOrganizationWindowController::FromBrowser(owner_->browser_.get()))
        shown = controller->EntryForDisplay(entry);
    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>('''),
    ('std::make_unique<views::Label>(base::UTF8ToUTF16(entry.title.empty() ? entry.current_url : entry.title),',
     'std::make_unique<views::Label>(base::UTF8ToUTF16(shown.title.empty() ? shown.current_url : shown.title),'),
    ('    SetTooltipText(base::UTF8ToUTF16(folder_ ? entry.title : entry.current_url));',
     '    SetTooltipText(base::UTF8ToUTF16(folder_ ? shown.title : shown.current_url));'),
    ('service->GetFaviconImageForPageURL(GURL(entry.current_url), base::BindOnce(',
     'service->GetFaviconImageForPageURL(GURL(shown.current_url), base::BindOnce('),
    ('        SetTooltipText(base::UTF8ToUTF16(entry.current_url) + u"\\nUpdated in another window. Right-click to use the shared URL or keep an independent copy.");',
     '        SetTooltipText(base::UTF8ToUTF16(shown.current_url) + u"\\nShared URL: " + base::UTF8ToUTF16(entry.current_url) +\n'
     '            u"\\nUpdated in another window. Right-click to use the shared URL or keep an independent copy.");'),
    ('  auto found = snapshot->entries.find(id); if (found == snapshot->entries.end() || found->second.archived) return;\n  if (found->second.archived) {',
     '  auto found = snapshot->entries.find(id); if (found == snapshot->entries.end()) return;\n  if (found->second.archived) {'),
    ('    } else if (left && row_by_id_.contains(entry.parent_id)) row_by_id_.at(entry.parent_id)->RequestFocus();',
     '''    } else if (left && row_by_id_.contains(entry.parent_id)) row_by_id_.at(entry.parent_id)->RequestFocus();
    else if (!left && entry.kind == organization::EntryKind::kFolder && !entry.collapsed) {
      const auto children = organization::OrderedChildren(*snapshot, entry.space_id, entry.id, entry.archived);
      if (!children.empty() && row_by_id_.contains(children.front())) row_by_id_.at(children.front())->RequestFocus();
    }'''),
    ('  Move(drag->id, target.space_id, folder ? target.id : target.parent_id,\n      folder ? kEnd : target.order + (drag->after ? 1 : 0), std::move(drag->context));',
     '''  uint64_t index = folder ? kEnd : target.order + (drag->after ? 1 : 0);
  const auto source = snapshot->entries.find(drag->id);
  // Drop targets describe the current list; the model inserts after removing
  // the source. Compensate exactly once within the same sibling group.
  if (!folder && source != snapshot->entries.end() && source->second.space_id == target.space_id &&
      source->second.parent_id == target.parent_id && source->second.order < index) --index;
  Move(drag->id, target.space_id, folder ? target.id : target.parent_id, index, std::move(drag->context));'''),
])

project(prefix + 'aux_spaces_switcher.h', [
    ('#include <memory>', '#include <memory>\n#include <optional>'),
    ('#include "base/time/time.h"', '#include "base/time/time.h"\n#include "chrome/browser/aux/organization/organization_model.h"'),
    ('  std::vector<std::string> menu_spaces_;',
     '  std::vector<std::string> menu_spaces_;\n  std::optional<organization::Context> menu_context_;\n  std::string menu_active_space_;'),
])
project(prefix + 'aux_spaces_switcher.cc', [
    ('void AuxSpacesSwitcher::ShowMenu() {\n  if (!browser_ || !GetWidget()) return;',
     'void AuxSpacesSwitcher::ShowMenu() {\n  if (!browser_ || !GetWidget()) return;\n'
     '  menu_context_ = CaptureOrganizationContext(*browser_);\n'
     '  if (!menu_context_) return;\n  menu_active_space_ = window_->ActiveSpaceId();'),
    ('void AuxSpacesSwitcher::ExecuteCommand(int command, int) {\n  if (!browser_) return;',
     '''void AuxSpacesSwitcher::ExecuteCommand(int command, int) {
  if (!browser_) return;
  const auto current = CaptureOrganizationContext(*browser_);
  if (!menu_context_ || !current || current->profile_id != menu_context_->profile_id ||
      current->owner_generation != menu_context_->owner_generation ||
      current->expected_revision != menu_context_->expected_revision ||
      window_->ActiveSpaceId() != menu_active_space_) {
    select_->SetTooltipText(u"The profile or tab list changed. Open the Space menu again."); return;
  }'''),
])

prefix = 'chrome/browser/aux/organization/'
project(prefix + 'organization_service.h', [
    ('#include "base/sequence_checker.h"', '#include "base/sequence_checker.h"\n#include "base/time/time.h"'),
    ('  bool TryClaimStartupCleanup();', '  // Shared across windows; one pass per hour, and immediately after policy changes.\n  bool TryClaimCleanupPass();'),
    ('  bool startup_cleanup_claimed_ = false;', '  base::TimeTicks next_cleanup_;'),
])
project(prefix + 'organization_service.cc', [
    ('bool OrganizationService::TryClaimStartupCleanup() {\n  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);\n  if (shutdown_ || blocked_ || pending_ || startup_cleanup_claimed_ || !snapshot_.cleanup_enabled) return false;\n  startup_cleanup_claimed_ = true; return true;\n}',
     '''bool OrganizationService::TryClaimCleanupPass() {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  if (shutdown_ || blocked_ || pending_ || !snapshot_.cleanup_enabled) return false;
  const auto now = base::TimeTicks::Now();
  if (!next_cleanup_.is_null() && now < next_cleanup_) return false;
  next_cleanup_ = now + base::Hours(1);
  return true;
}'''),
    ('  snapshot_ = std::move(pending->mutation.snapshot);\n  if (pending->make_undo) {',
     '''  const auto& next = pending->mutation.snapshot;
  if (snapshot_.cleanup_enabled != next.cleanup_enabled ||
      snapshot_.cleanup_inactivity_days != next.cleanup_inactivity_days ||
      snapshot_.cleanup_space_ids != next.cleanup_space_ids) next_cleanup_ = {};
  snapshot_ = std::move(pending->mutation.snapshot);
  if (pending->make_undo) {'''),
])

prefix = 'chrome/browser/ui/views/tabs/vertical/'
project(prefix + 'vertical_pinned_tab_entries_view.h', [
    ('    aux::PinnedTabEntry saved;\n    std::optional<int> live_index;',
     '    aux::PinnedTabEntry saved;\n    GURL display_url;  // Actual local page; never rewrites saved action state.\n    std::optional<int> live_index;'),
])
project(prefix + 'vertical_pinned_tab_entries_view.cc', [
    ('    const auto description = entry.title + (entry.shared_update\n        ? u"\\nUpdated in another window. Right-click to use the shared URL or keep an independent copy."\n        : std::u16string());',
     '    const auto description = entry.title + u"\\n" + base::UTF8ToUTF16(entry.display_url.spec()) + (entry.shared_update\n'
     '        ? u"\\nShared URL: " + base::UTF8ToUTF16(entry.saved.url.spec()) +\n'
     '            u"\\nUpdated in another window. Right-click to use the shared URL or keep an independent copy."\n'
     '        : std::u16string());'),
    ('    entry.saved = std::move(value);\n    entry.title =',
     '    entry.saved = std::move(value);\n    entry.display_url = entry.saved.url;\n    entry.title ='),
    ('      auto* tab = model_->GetTabAtIndex(*entry.live_index);\n      if (auto* helper = TabUIHelper::From(tab)) {',
     '''      auto* tab = model_->GetTabAtIndex(*entry.live_index);
      if (auto* contents = tab->GetContents(); contents && contents->GetLastCommittedURL().is_valid() &&
          contents->GetLastCommittedURL() != entry.display_url) {
        entry.display_url = contents->GetLastCommittedURL();
        entry.image = {};
        if (auto cached = icon_cache_.find(entry.display_url.spec()); cached != icon_cache_.end()) entry.image = cached->second;
      }
      if (auto* helper = TabUIHelper::From(tab)) {'''),
    ('          icon_cache_.insert_or_assign(entry.saved.url.spec(), entry.image);',
     '          icon_cache_.insert_or_assign(entry.display_url.spec(), entry.image);'),
    ('    if ((entry.saved.url.SchemeIs("chrome-extension") &&\n         entry.saved.url.host() == aux::kAgentExtensionId) ||\n        (entry.saved.url.SchemeIs("chrome") &&\n         entry.saved.url.host() == "newtab")) {',
     '    if ((entry.display_url.SchemeIs("chrome-extension") &&\n         entry.display_url.host() == aux::kAgentExtensionId) ||\n        (entry.display_url.SchemeIs("chrome") &&\n         entry.display_url.host() == "newtab")) {'),
    ('      RequestIcon(entry.saved.url);', '      RequestIcon(entry.display_url);'),
    ('      std::ranges::equal(entries_, entries, {},\n                         [](const Entry& entry) { return entry.saved.url; },\n                         [](const Entry& entry) { return entry.saved.url; });',
     '''      std::ranges::equal(entries_, entries, [](const Entry& left, const Entry& right) {
        return left.saved.logical_id == right.saved.logical_id && left.saved.url == right.saved.url;
      });'''),
    ('    // A changed ordered URL roster replaces the actual rows. The original',
     '    // A changed ordered logical-ID/URL roster replaces the actual rows. The original'),
])

result = {'format': 'aux.organization-completion.source.v1', 'nativeRoot': str(ROOT),
          'files': files, 'nativeCheckoutChanged': False, 'uiStylesChanged': False,
          'nativeCompiled': False, 'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files),
                  'nativeCheckoutChanged': False, 'uiStylesChanged': False}))

from pathlib import Path
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CONTROLLER = 'chrome/browser/ui/views/frame/aux_organization_window_controller'
records = []
patch = []
for path in [CONTROLLER + '.h', CONTROLLER + '.cc', 'chrome/browser/ui/unload_controller.cc']:
    original = (ROOT / path).read_text()
    text = original
    anchors = []
    def edit(name, before, after, count=1):
        global text
        if text.count(before) != count:
            raise ValueError((name, text.count(before), count))
        text = text.replace(before, after)
        anchors.append(dict(name=name, before=before, after=after, expectedCount=count))
    if path.endswith('.h'):
        edit('native cancellation reports the original row action', '  bool HandleClose(tabs::TabHandle);', '  bool HandleClose(tabs::TabHandle);\n  void CancelManualUnload(content::WebContents*);')
        edit('native policy refusal settles row unload', '  void OnTabStripModelDestroyed(TabStripModel*) override;', '  void OnTabStripModelDestroyed(TabStripModel*) override;\n  void OnTabCloseCancelled(const tabs::TabInterface*) override;')
        edit('exact document and terminal callback for unload only', '  void ContinueManualClose(ManualClose);', '''  void ContinueManualClose(ManualClose);
  struct ManualUnload {
    ~ManualUnload();
    content::WeakDocumentPtr document;
    base::OnceCallback<void(bool)> reply;
  };
  void FinishManualUnload(tabs::TabHandle, bool);
  std::map<tabs::TabHandle, ManualUnload> manual_unloads_;''')
    elif path == CONTROLLER + '.cc':
        edit('cancel terminal row requests on retirement', '  deferred_manual_closes_.clear();', '  deferred_manual_closes_.clear();\n  manual_unloads_.clear();', 2)
        edit('document replacement cannot inherit an unload intent', 'void AuxOrganizationWindowController::DocumentChanged(tabs::TabHandle handle) {', 'void AuxOrganizationWindowController::DocumentChanged(tabs::TabHandle handle) {\n  FinishManualUnload(handle, false);')
        edit('native unload dispatch also covers pinned retained views', '''      !tab->IsPinned() && !organization::HasRetention(organization->snapshot(), id) &&
      tab->GetContents()->NeedToFireBeforeUnloadOrUnloadEvents() &&''', '''      tab->GetContents()->NeedToFireBeforeUnloadOrUnloadEvents() &&''')
        edit('retained continuation waits for genuine storage settlement', '''    if (!current->snapshot().entries.at(request.logical).archived && !tab->IsPinned() &&
        !organization::HasRetention(current->snapshot(), request.logical) && !Protected(tab)) {''', '''    if (!current->snapshot().entries.at(request.logical).archived && !Protected(tab)) {''')
        edit('refused exact continuation settles the pending row request', 'void AuxOrganizationWindowController::ContinueManualClose(ManualClose request) {', '''void AuxOrganizationWindowController::ContinueManualClose(ManualClose request) {
  base::ScopedClosureRunner failed_unload(base::BindOnce(
      &AuxOrganizationWindowController::FinishManualUnload, weak_.GetWeakPtr(), request.target, false));''')
        edit('queued storage continuation retains its terminal callback', '      deferred_manual_closes_.insert_or_assign(target, std::move(request));', '      deferred_manual_closes_.insert_or_assign(target, std::move(request));\n      failed_unload.Release();')
        edit('row unload retains membership after native consent', '''  if (tab->IsPinned() || organization::HasRetention(current->snapshot(), request.logical))
    EnsureSavedThenClose(request.target, std::move(done));''', '''  if (manual_unloads_.contains(request.target)) {
    const auto pending = manual_unloads_.find(request.target);
    if (pending->second.document.AsRenderFrameHostIfValid() != contents->GetPrimaryMainFrame()) {
      FinishManualUnload(request.target, false);
      return;
    }
    auto pending_request = manual_unloads_.extract(request.target);
    failed_unload.Release();
    EnsureSavedThenClose(request.target, base::BindOnce(
        [](std::map<tabs::TabHandle, ManualUnload>::node_type pending, bool unloaded) {
          auto reply = std::move(pending.mapped().reply);
          if (reply) std::move(reply).Run(unloaded);
        }, std::move(pending_request)));
  } else if (tab->IsPinned() || organization::HasRetention(current->snapshot(), request.logical))
    EnsureSavedThenClose(request.target, std::move(done));''')
        edit('row unload uses real native beforeunload and accepted continuation', '''    EnsureSavedThenClose(tab->GetHandle(), std::move(reply)); return;
  }
  // Already-unloaded logical entries''', '''    if (Protected(tab, false) || manual_unloads_.contains(tab->GetHandle())) {
      std::move(reply).Run(false); return;
    }
    const auto handle = tab->GetHandle();
    auto& request = manual_unloads_[handle];
    request.document = tab->GetContents()->GetPrimaryMainFrame()->GetWeakDocumentPtr();
    request.reply = std::move(reply);
    // The original native close dispatches beforeunload. Its accepted close
    // re-enters HandleClose; that exact document is then saved and discarded.
    model_->CloseWebContentsAt(model_->GetIndexOfTab(tab), CLOSE_USER_GESTURE);
    return;
  }
  // Already-unloaded logical entries''')
        edit('settle callbacks without retaining an erased map element', 'void AuxOrganizationWindowController::UnloadLogicalTab(', '''AuxOrganizationWindowController::ManualUnload::~ManualUnload() {
  if (reply) std::move(reply).Run(false);
}
void AuxOrganizationWindowController::FinishManualUnload(tabs::TabHandle handle, bool unloaded) {
  auto request = manual_unloads_.extract(handle);
  if (request.empty()) return;
  auto reply = std::move(request.mapped().reply);
  if (reply) std::move(reply).Run(unloaded);
}
void AuxOrganizationWindowController::CancelManualUnload(content::WebContents* contents) {
  if (!Current() || !contents || contents->GetBrowserContext() != profile_) return;
  const int index = model_->GetIndexOfWebContents(contents);
  if (index >= 0) FinishManualUnload(model_->GetTabAtIndex(index)->GetHandle(), false);
}
void AuxOrganizationWindowController::UnloadLogicalTab(''')
        edit('native policy rejection retires the row request', 'void AuxOrganizationWindowController::OnTabStripModelDestroyed(TabStripModel* model) {', '''void AuxOrganizationWindowController::OnTabCloseCancelled(const tabs::TabInterface* tab) {
  if (tab) FinishManualUnload(tab->GetHandle(), false);
}
void AuxOrganizationWindowController::OnTabStripModelDestroyed(TabStripModel* model) {''')
        edit('model destruction refuses outstanding unloads', '  model_ = nullptr; views_.clear(); candidate_observers_.clear(); dirty_navigation_.clear(); dirty_activation_.clear();', '  model_ = nullptr; views_.clear(); candidate_observers_.clear(); dirty_navigation_.clear(); dirty_activation_.clear();\n  manual_unloads_.clear();')
        edit('physical removal retires outstanding row action', 'if (removed.tab) { deferred_manual_closes_.erase(removed.tab->GetHandle());', 'if (removed.tab) { FinishManualUnload(removed.tab->GetHandle(), false); deferred_manual_closes_.erase(removed.tab->GetHandle());')
    else:
        edit('existing close owner include', '#include "chrome/browser/ui/aux_preview/aux_preview_ingress.h"', '#include "chrome/browser/ui/aux_preview/aux_preview_ingress.h"\n#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"')
        edit('real beforeunload cancellation settles row action', '''bool UnloadController::BeforeUnloadFired(content::WebContents* contents,
                                         bool proceed) {
  if (!proceed) {''', '''bool UnloadController::BeforeUnloadFired(content::WebContents* contents,
                                         bool proceed) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (!proceed) {
    if (auto* owner = aux::AuxOrganizationWindowController::FromBrowser(browser_))
      owner->CancelManualUnload(contents);
  }
#endif
  if (!proceed) {''')
    output = HERE / 'source' / path
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    records.append(dict(path=path, inputSha256=hashlib.sha256(original.encode()).hexdigest(), outputSha256=hashlib.sha256(text.encode()).hexdigest(), anchors=anchors))
    patch.extend(difflib.unified_diff(original.splitlines(True), text.splitlines(True), fromfile='a/' + path, tofile='b/' + path))
(HERE / 'native.patch').write_text(''.join(patch))
(HERE / 'source-plan.json').write_text(json.dumps(dict(format='aux.native.counted-projection.v1', nativeRoot=str(ROOT), files=records), indent=2) + '\n')
print(json.dumps([dict(path=r['path'], anchors=len(r['anchors']), inputSha256=r['inputSha256'], outputSha256=r['outputSha256']) for r in records], indent=2))

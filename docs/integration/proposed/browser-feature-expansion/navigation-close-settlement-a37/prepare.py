from pathlib import Path
import json,hashlib,difflib
here=Path(__file__).resolve().parent;root=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');base='chrome/browser/ui/views/frame/aux_organization_window_controller';sha=lambda s:hashlib.sha256(s.encode()).hexdigest();records=[];patch=''
for suffix in ['.h','.cc']:
 rel=base+suffix;original=(root/rel).read_text();text=original;edits=[]
 def edit(name,before,after,count=1):
  global text
  assert text.count(before)==count,(name,text.count(before));text=text.replace(before,after);edits.append({'name':name,'before':before,'after':after,'expectedCount':count})
 if suffix=='.h':
  edit('actual document weak reference','#include "components/tabs/public/tab_interface.h"','#include "components/tabs/public/tab_interface.h"\n#include "content/public/browser/weak_document_ptr.h"')
  edit('retain exact existing close continuation','  class PageObserver;','''  class PageObserver;
  struct ManualClose {
    tabs::TabHandle target;
    content::WeakDocumentPtr document;
    base::WeakPtr<Profile> profile;
    std::string logical, view_document, url, generation;
  };
  void ContinueManualClose(ManualClose);''')
  edit('existing settlement-owned request queue','  std::set<tabs::TabHandle> explicit_unloads_;','  std::set<tabs::TabHandle> explicit_unloads_;\n  std::map<tabs::TabHandle, ManualClose> deferred_manual_closes_;')
 else:
  edit('status-only diagnostics','#include "base/functional/bind.h"','#include "base/functional/bind.h"\n#include "base/logging.h"')
  edit('real frame document API','#include "content/public/browser/web_contents.h"','#include "content/public/browser/web_contents.h"\n#include "content/public/browser/render_frame_host.h"')
  edit('retire close intents with existing controller lifecycle','  automatic_archive_.reset();','  deferred_manual_closes_.clear();\n  automatic_archive_.reset();',2)
  edit('wake exact retained request before fresh maintenance writes','''  if (!organization || organization->blocked()) { Notify(); return; }
  const auto alive = weak_.GetWeakPtr();''','''  if (!organization || organization->blocked()) { Notify(); return; }
  if (!deferred_manual_closes_.empty()) {
    // The existing ObserveSettled callback wakes this path. Never poll or
    // treat pending storage as success; prioritize the retained manual action.
    if (organization->pending()) return;
    auto first = deferred_manual_closes_.begin();
    auto request = std::move(first->second);
    deferred_manual_closes_.erase(first);
    const auto alive = weak_.GetWeakPtr();
    ContinueManualClose(std::move(request));
    if (alive) alive->QueueReconcile();
    return;
  }
  const auto alive = weak_.GetWeakPtr();''')
  edit('native unload before any mutation even while storage pending','  if (!organization->blocked() && !organization->pending() && !entry.archived &&','  if (!organization->blocked() && !entry.archived &&')
  start=text.index('  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask',text.index('bool AuxOrganizationWindowController::HandleClose('));end=text.index('\norganization::Entry AuxOrganizationWindowController::EntryForDisplay',start)
  before=text[start:end]
  after='''  auto* coordinator = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile_);
  const auto view = views_.find(handle);
  if (!coordinator || coordinator->model() != organization || view == views_.end() ||
      view->second.document_id.empty()) {
    LOG(ERROR) << "Aux manual close: continuation_refused=owner";
    return true;
  }
  ManualClose request{handle, tab->GetContents()->GetPrimaryMainFrame()->GetWeakDocumentPtr(),
      profile_->GetWeakPtr(), id, view->second.document_id,
      tab->GetContents()->GetLastCommittedURL().spec(), coordinator->owner_generation()};
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE, base::BindOnce(
      &AuxOrganizationWindowController::ContinueManualClose, weak_.GetWeakPtr(), std::move(request)));
  return true;
}
void AuxOrganizationWindowController::ContinueManualClose(ManualClose request) {
  auto* tab = request.target.Get();
  auto* contents = tab ? tab->GetContents() : nullptr;
  if (!Current() || model_->closing_all() || request.profile.get() != profile_ ||
      !tab || tab->IsSplit() || model_->GetIndexOfTab(tab) < 0 || !contents ||
      contents->GetBrowserContext() != profile_ ||
      request.document.AsRenderFrameHostIfValid() != contents->GetPrimaryMainFrame() ||
      contents->GetLastCommittedURL().spec() != request.url ||
      GetRememberedPinnedTabEntryId(*contents) != request.logical) {
    LOG(ERROR) << "Aux manual close: continuation_refused=identity";
    return;
  }
  auto* coordinator = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile_);
  auto* current = coordinator ? coordinator->model() : nullptr;
  const auto view = views_.find(request.target);
  if (!current || current->blocked() || coordinator->owner_generation() != request.generation ||
      !current->snapshot().entries.contains(request.logical) || view == views_.end() ||
      view->second.logical_id != request.logical || view->second.document_id != request.view_document) {
    LOG(ERROR) << "Aux manual close: continuation_refused=organization";
    return;
  }
  // A new unload obligation is not an accepted ACK and may not be archived.
  // The original native close handles beforeunload; this continuation only
  // resumes the exact unchanged document after that path or no-unload close.
  if (contents->NeedToFireBeforeUnloadOrUnloadEvents()) {
    LOG(ERROR) << "Aux manual close: continuation_refused=unload_changed";
    return;
  }
  if (current->pending()) {
    if (!current->snapshot().entries.at(request.logical).archived && !tab->IsPinned() &&
        !organization::HasRetention(current->snapshot(), request.logical) && !Protected(tab)) {
      const auto target = request.target;
      deferred_manual_closes_.insert_or_assign(target, std::move(request));
      LOG(ERROR) << "Aux manual close: deferred_for_storage=1";
    } else {
      LOG(ERROR) << "Aux manual close: continuation_refused=pending_protected";
    }
    return;
  }
  LOG(ERROR) << "Aux manual close: continuation_storage_settled=1";
  if (current->snapshot().entries.at(request.logical).archived) {
    CloseViewNow(request.target);
    return;
  }
  auto done = base::BindOnce([](base::WeakPtr<AuxOrganizationWindowController> owner, bool saved) {
    LOG(ERROR) << "Aux manual close: membership_saved=" << saved;
    if (owner) owner->Notify();
  }, weak_.GetWeakPtr());
  if (tab->IsPinned() || organization::HasRetention(current->snapshot(), request.logical))
    EnsureSavedThenClose(request.target, std::move(done));
  else
    ArchiveLogicalEntry(request.logical, std::move(done));
}'''
  edit('resume posted manual close only for original native owner and document',before,after)
  edit('retire removed tab close intent','if (removed.tab) { views_.erase(removed.tab->GetHandle());','if (removed.tab) { deferred_manual_closes_.erase(removed.tab->GetHandle()); views_.erase(removed.tab->GetHandle());')
 out=here/'source'/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text);records.append({'path':rel,'inputSha256':sha(original),'outputSha256':sha(text),'source':str(out),'anchors':edits});patch+=''.join(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel))
(here/'source-plan.json').write_text(json.dumps({'format':'aux.native.counted-projection.v1','nativeRoot':str(root),'purpose':'Retain exact accepted native close through real organization storage settlement','files':records},indent=2)+'\n');(here/'native.patch').write_text(patch);print(json.dumps([{'path':r['path'],'inputSha256':r['inputSha256'],'outputSha256':r['outputSha256'],'anchors':len(r['anchors'])}for r in records]))

from pathlib import Path
import json,hashlib,difflib
here=Path(__file__).resolve().parent;root=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');base='chrome/browser/ui/views/frame/aux_organization_window_controller';sha=lambda value:hashlib.sha256(value.encode()).hexdigest()
plans={base+'.h':[
 ('default protection remains strict','  bool Protected(tabs::TabInterface*) const;','  bool Protected(tabs::TabInterface*, bool include_unload_events = true) const;')],base+'.cc':[
 ('protection can classify original native unload delegation','bool AuxOrganizationWindowController::Protected(tabs::TabInterface* tab) const {','bool AuxOrganizationWindowController::Protected(tabs::TabInterface* tab, bool include_unload_events) const {'),
 ('all other protection predicates remain unchanged','      contents->NeedToFireBeforeUnloadOrUnloadEvents() || IsBookmarkTabExcluded(tab, model_)) return true;','      (include_unload_events && contents->NeedToFireBeforeUnloadOrUnloadEvents()) ||\n      IsBookmarkTabExcluded(tab, model_)) return true;'),
 ('manual ordinary close dispatches native unload before durable archive','''  if (id.empty() || !organization || !organization->snapshot().entries.contains(id)) return false;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask''','''  if (id.empty() || !organization || !organization->snapshot().entries.contains(id)) return false;
  const auto& entry = organization->snapshot().entries.at(id);
  if (!organization->blocked() && !organization->pending() && !entry.archived &&
      !tab->IsPinned() && !organization::HasRetention(organization->snapshot(), id) &&
      tab->GetContents()->NeedToFireBeforeUnloadOrUnloadEvents() &&
      !Protected(tab, false)) {
    // The supplied content script installs a visibilitychange listener on
    // ordinary pages. That listener requires native unload dispatch, but is
    // not evidence that the page must remain as an archived recovery view.
    // Continue the ORIGINAL close through TabStripModel/UnloadController.
    // A real beforeunload cancellation leaves the shared record untouched;
    // accepted native CloseContents re-enters with the unload bit cleared,
    // then the existing exact durable archive/close path runs below.
    return false;
  }
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask''')]
}
rows=[];patch=''
for rel,edits in plans.items():
 original=(root/rel).read_text();text=original;anchors=[]
 for name,before,after in edits:
  assert text.count(before)==1,(rel,name,text.count(before));text=text.replace(before,after);anchors.append({'name':name,'before':before,'after':after,'expectedCount':1})
 out=here/'source'/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':rel,'inputSha256':sha(original),'outputSha256':sha(text),'source':str(out),'anchors':anchors})
 patch+=''.join(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel))
(here/'source-plan.json').write_text(json.dumps({'format':'aux.native.counted-projection.v1','purpose':'Delegate ordinary manual native beforeunload before archiving so cancellation preserves live shared entry','nativeRoot':str(root),'files':rows},indent=2)+'\n');(here/'native.patch').write_text(patch);print(json.dumps([{'path':r['path'],'inputSha256':r['inputSha256'],'outputSha256':r['outputSha256'],'anchors':len(r['anchors'])}for r in rows]))

"""Payload-free existing-owner diagnostics; no projection/build/behavior change."""
from pathlib import Path
import difflib,hashlib,json
HERE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES={
'chrome/browser/ui/views/frame/aux_organization_tree_view.cc':[
('#include <algorithm>','#include <algorithm>\n#include <cstdio>'),
('''  ready_ = next_ready;
  CancelDrag();''','''  ready_ = next_ready;
  if (drag_) fprintf(stderr, "Aux split drag refresh-cancel moved=%d ready=%d\\n", drag_->moved, ready_);
  CancelDrag();'''),
('''  if (context) drag_ = Drag{id, {}, point, std::move(*context), false, false};''','''  fprintf(stderr, "Aux split drag begin context=%d\\n", context.has_value());
  if (context) drag_ = Drag{id, {}, point, std::move(*context), false, false};'''),
('''  drag_->moved = true; drag_->target.clear(); drag_->edge = DropEdge::kNone;''','''  const bool first_motion = !drag_->moved;
  const auto previous_edge = drag_->edge;
  drag_->moved = true; drag_->target.clear(); drag_->edge = DropEdge::kNone;'''),
('''    row->MarkDrop(over, edge);
  }
}
void AuxOrganizationTreeView::CancelDrag()''','''    row->MarkDrop(over, edge);
  }
  if (first_motion || previous_edge != drag_->edge)
    fprintf(stderr, "Aux split drag motion target=%d edge=%d\\n", !drag_->target.empty(), static_cast<int>(drag_->edge));
}
void AuxOrganizationTreeView::CancelDrag()'''),
('''  auto drag = std::move(drag_); CancelDrag();
  const auto* snapshot = Snapshot();''','''  auto drag = std::move(drag_); CancelDrag();
  const auto* snapshot = Snapshot();
  fprintf(stderr, "Aux split drag release retained=%d moved=%d target=%d edge=%d\\n",
      drag.has_value(), drag && drag->moved, drag && snapshot && snapshot->entries.contains(drag->target),
      drag ? static_cast<int>(drag->edge) : 0);'''),
('''        snapshot->revision != drag->context.expected_revision) return;''','''        snapshot->revision != drag->context.expected_revision) {
      fprintf(stderr, "Aux split drag stale-context\\n"); return;
    }'''),
('''        base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> owner, bool) {
          if (owner) owner->Refresh();''','''        base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> owner, bool success) {
          fprintf(stderr, "Aux split drag completed success=%d\\n", success);
          if (owner) owner->Refresh();''')],
'chrome/browser/ui/views/frame/aux_organization_window_controller.cc':[
('#include <algorithm>','#include <algorithm>\n#include <cstdio>'),
('''  if (!IsProjectionReady() || source == target) { std::move(reply).Run(false); return; }
  OpenLogicalTab(target, base::BindOnce(''','''  if (!IsProjectionReady() || source == target) {
    fprintf(stderr, "Aux split join projection-or-same-target refusal\\n");
    std::move(reply).Run(false); return;
  }
  OpenLogicalTab(target, base::BindOnce('''),
('''        if (!owner || !opened) { std::move(done).Run(false); return; }
        owner->OpenLogicalTab(source_id,''','''        fprintf(stderr, "Aux split join target-open owner=%d opened=%d\\n", !!owner, opened);
        if (!owner || !opened) { std::move(done).Run(false); return; }
        owner->OpenLogicalTab(source_id,'''),
('''              if (!current || !current->Current() || !source_opened) {
                std::move(completed).Run(false); return;
              }
              tabs::TabInterface* source_tab''','''              fprintf(stderr, "Aux split join source-open owner=%d opened=%d\\n", !!current, source_opened);
              if (!current || !current->Current() || !source_opened) {
                std::move(completed).Run(false); return;
              }
              tabs::TabInterface* source_tab'''),
('''              current->QueueReconcile();
              std::move(completed).Run(joined);''','''              fprintf(stderr, "Aux split join native-result target=%d source=%d source-split=%d target-split=%d joined=%d\\n",
                  target_tab != nullptr, source_tab != nullptr, source_tab && source_tab->IsSplit(),
                  target_tab && target_tab->IsSplit(), joined);
              current->QueueReconcile();
              std::move(completed).Run(joined);''')]
}
def main():
 rows=[];patch=[]
 for name,changes in CHANGES.items():
  baseline=HERE/'baseline'/name;source=HERE/'source'/name
  if not baseline.exists():
   baseline.parent.mkdir(parents=True,exist_ok=True);baseline.write_bytes((NATIVE/name).read_bytes())
  before=baseline.read_text();after=before
  for old,new in changes:
   if after.count(old)!=1:raise ValueError('Expected one anchor: '+name+': '+old[:70])
   after=after.replace(old,new)
  source.parent.mkdir(parents=True,exist_ok=True);source.write_text(after)
  rows.append({'path':name,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'anchors':len(changes)})
  patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
 (HERE/'native.patch').write_text(''.join(patch))
 (HERE/'source-plan.json').write_text(json.dumps({'scope':'diagnostics only; unresolved real drag admission failure','projected':False,'compiled':False,'files':rows,'anchors':sum(x['anchors'] for x in rows)},indent=2)+'\n')
 print('Counted diagnostic replay: '+str(sum(x['anchors'] for x in rows))+' anchors in '+str(len(rows))+' files; no projection.')
if __name__=='__main__':main()

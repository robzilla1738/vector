"""Counted desktop correction; source preparation only, never projection/build."""
from pathlib import Path
import difflib, hashlib, json
HERE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES={
'chrome/browser/ui/tabs/split_tab_menu_model.cc':[
('''  const bool is_pair = tab_strip_model_->GetSplitData(GetSplitTabId())->ListTabs().size() == 2;''','''  // Toolbar construction can precede the first tab; an empty model has no
  // split-specific actions. The toolbar rebuilds this menu when it opens.
  const auto* tab = split_tab_index_
      ? (tab_strip_model_->ContainsIndex(*split_tab_index_)
             ? tab_strip_model_->GetTabAtIndex(*split_tab_index_) : nullptr)
      : tab_strip_model_->GetActiveTab();
  const auto* split = tab && tab->IsSplit()
      ? tab_strip_model_->GetSplitData(*tab->GetSplit()) : nullptr;
  const bool is_pair = split && split->ListTabs().size() == 2;'''),
('''  const auto id = GetCommandIdEnum(command_id);
  if (id == CommandId::kReversePosition || id == CommandId::kCloseStartTab ||
      id == CommandId::kCloseEndTab || id == CommandId::kToggleOrientation) {
    return tab_strip_model_->GetSplitData(GetSplitTabId())->ListTabs().size() == 2;
  }
  return true;''','''  const auto* tab = split_tab_index_
      ? (tab_strip_model_->ContainsIndex(*split_tab_index_)
             ? tab_strip_model_->GetTabAtIndex(*split_tab_index_) : nullptr)
      : tab_strip_model_->GetActiveTab();
  const auto* split = tab && tab->IsSplit()
      ? tab_strip_model_->GetSplitData(*tab->GetSplit()) : nullptr;
  if (!split) return false;
  const auto id = GetCommandIdEnum(command_id);
  if (id == CommandId::kReversePosition || id == CommandId::kCloseStartTab ||
      id == CommandId::kCloseEndTab || id == CommandId::kToggleOrientation) {
    return split->ListTabs().size() == 2;
  }
  return true;''')],
'chrome/browser/ui/views/toolbar/split_tabs_button.cc':[
('''  split_tab_menu_ = std::make_unique<SplitTabMenuModel>(
      browser_->GetTabStripModel(),
      SplitTabMenuModel::MenuSource::kToolbarButton);
  browser->GetTabStripModel()->AddObserver(this);''','''  browser->GetTabStripModel()->AddObserver(this);'''),
('''    menu_runner_.reset();
    menu_model_adapter_.reset();

    menu_model_adapter_ =''','''    menu_runner_.reset();
    menu_model_adapter_.reset();
    // The active split may have gained/lost panes since the last opening.
    // Build only after a real split exists, before the adapter observes it.
    split_tab_menu_ = std::make_unique<SplitTabMenuModel>(
        browser_->GetTabStripModel(),
        SplitTabMenuModel::MenuSource::kToolbarButton);

    menu_model_adapter_ =''')]
}

def main():
 rows=[];patch=[]
 for name,changes in CHANGES.items():
  baseline=HERE/'baseline'/name;source=HERE/'source'/name
  if not baseline.exists():
   baseline.parent.mkdir(parents=True,exist_ok=True);baseline.write_bytes((NATIVE/name).read_bytes())
  before=baseline.read_text();after=before
  for old,new in changes:
   if after.count(old)!=1:raise ValueError(f'Expected one anchor: {name}: {old[:70]}')
   after=after.replace(old,new)
  source.parent.mkdir(parents=True,exist_ok=True);source.write_text(after)
  rows.append({'path':name,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'anchors':len(changes)})
  patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
 (HERE/'native.patch').write_text(''.join(patch))
 (HERE/'source-plan.json').write_text(json.dumps({'scope':'actual startup null-tab crash and current pair/N-pane menu ownership','projected':False,'compiled':False,'files':rows,'totalAnchors':sum(x['anchors'] for x in rows)},indent=2)+'\n')
 print(json.dumps({'files':len(rows),'anchors':sum(x['anchors'] for x in rows),'projected':False}))
if __name__=='__main__':main()

import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parent
proof = json.loads((root / 'source-evidence.json').read_text())
for row in proof['files']:
    assert hashlib.sha256((root / 'evidence' / row['path']).read_bytes()).hexdigest() == row['sha256']
collection = (root / 'evidence' / proof['files'][0]['path']).read_text()
model = (root / 'evidence' / proof['files'][1]['path']).read_text()
transfer = (root / 'evidence' / proof['files'][2]['path']).read_text()
assert 'std::unique_ptr<TabGroup> group_;' in collection
assert 'TabGroup* GetTabGroup() { return group_.get(); }' in collection
insert = model[model.index('gfx::Range TabStripModel::InsertDetachedTabGroupAt('):model.index('tabs::TabModel* TabStripModel::GetTabModelAtIndex')]
assert 'std::move(std::get<std::unique_ptr<tabs::TabGroupTabCollection>>' in insert
assert 'std::move(group_collection_unique_ptr)' in insert
impl = model[model.index('void TabStripModel::InsertDetachedTabGroupImpl('):model.index('std::unique_ptr<DetachedTab> TabStripModel::DetachTabImpl(')]
assert 'group_model_->AddTabGroup(group_collection->GetTabGroup(),' in impl
assert 'contents_data_->InsertTabCollectionAt(std::move(group_collection)' in impl
assert 'DetachTabsAndCollectionsForInsertion(indices)' in transfer
assert 'model->InsertDetachedTabGroupAt(std::move(detached), model->count())' in transfer
print('Pinned exact group/features ownership survives actual whole-group cache transfer. No runtime claim.')

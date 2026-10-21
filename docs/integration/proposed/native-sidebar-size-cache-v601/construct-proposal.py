from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
out=Path(__file__).resolve().parent
PINS={'chrome/browser/ui/views/frame/aux_sidebar_contents_view.h': '8022f93255a51a9eefb2f351276dfe56d3011d62f2287c49aa32d074958159d2', 'chrome/browser/ui/views/frame/aux_sidebar_contents_view.cc': '46b29875df1113d4a304e760642b571222b43b3cfa09bf4a398c7b86257cf79d'}
files=[];edits=[];patch=[]
def transform(path, replacements):
 old=(root/path).read_text();new=old
 assert hashlib.sha256(old.encode()).hexdigest()==PINS[path],path
 for a,b in replacements:
  assert new.count(a)==1,(path,a[:80],new.count(a))
  new=new.replace(a,b);edits.append({'path':path,'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1})
 dest=out/'sources'/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(new)
 files.append({'path':path,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(new.encode()).hexdigest()})
 patch.extend(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
transform('chrome/browser/ui/views/frame/aux_sidebar_contents_view.h',[
 ('#include "ui/views/view.h"','#include "ui/views/view.h"\n#include "ui/views/view_observer.h"'),
 ('class SidebarContentsView final : public views::View {','class SidebarContentsView final : public views::View, private views::ViewObserver {'),
 (' private:\n  void ClearSizeCache();',' private:\n  void OnViewLayoutInvalidated(views::View* observed_view) override;\n  void ClearSizeCache();')])
transform('chrome/browser/ui/views/frame/aux_sidebar_contents_view.cc',[
 ('  CHECK(right_click_);','  CHECK(right_click_);\n  AddObserver(this);'),
 ('SidebarContentsView::~SidebarContentsView() = default;','SidebarContentsView::~SidebarContentsView() {\n  RemoveObserver(this);\n}'),
 ('void SidebarContentsView::ClearSizeCache() {','''void SidebarContentsView::OnViewLayoutInvalidated(views::View* observed_view) {
  // Nested Tabs contents and collection animations propagate InvalidateLayout
  // through their parents, without a direct ChildPreferredSizeChanged call.
  // Preserve the supplied width cache, but retire it with the real layout cache.
  // Do not notify or invalidate here: View is already propagating that change.
  preferred_sizes_.clear();
}
void SidebarContentsView::ClearSizeCache() {''')])
(out/'native.patch').write_text(''.join(patch))
(out/'files.json').write_text(json.dumps({'baseComposition':'v601','files':files,'edits':edits},indent=2)+'\n')
print(json.dumps({'files':len(files),'anchors':len(edits)}))

from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');out=Path(__file__).resolve().parent
p='chrome/browser/ui/views/frame/layout/browser_view_tabbed_layout_impl.cc';old=(root/p).read_text()
assert hashlib.sha256(old.encode()).hexdigest()=='c389e60125d6985742e33fd68edb2855f4fd3fcbb2d10f6fe4d9550213400514'
a='''  if (aux_surface) {
    toolbar_corners[CornerOrientation::kTopLeading] =
        toolbar_background->GetWindowCorner(true);
    toolbar_corners[CornerOrientation::kTopTrailing] ='''
b='''  if (aux_surface) {
    // With no reserved sidebar width the toolbar begins after the Mac caption
    // buttons, inside the continuous window header. A window-radius cutout at
    // that interior edge leaves a material wedge above the sidebar toggle.
    // Floating hover panels reserve no width and round their own surface.
    toolbar_corners[CornerOrientation::kTopLeading] =
        layout_data_->horizontal_layout.vertical_tab_strip_width > 0
            ? toolbar_background->GetWindowCorner(true)
            : CustomCornersBackground::Corner{};
    toolbar_corners[CornerOrientation::kTopTrailing] ='''
assert old.count(a)==1
new=old.replace(a,b);dest=out/'sources'/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(new)
(out/'native.patch').write_text(''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+p,tofile='b/'+p)))
(out/'files.json').write_text(json.dumps({'baseComposition':'v605','files':[{'path':p,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(new.encode()).hexdigest()}],'edits':[{'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1}]},indent=2)+'\n')

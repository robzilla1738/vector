from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');out=Path(__file__).resolve().parent
p='chrome/browser/ui/views/frame/aux_sidebar_body.cc';old=(root/p).read_text()
assert hashlib.sha256(old.encode()).hexdigest()=='f3588e76ecbea22cd81c0b52eb6e6a2b9ac55eb873e647f4ef9778a669187878'
a='  tabs_contents->AddChildView(strip_.get());\n  strip_->SetExternalScrollMode(true);'
b='''  tabs_contents->AddChildView(strip_.get());
  // Retire temporarily returns the strip to the region's FlexLayout. Active
  // tab changes can synchronously lay out that empty/space-constrained host,
  // hiding its scale-to-zero child. That layout-owned visibility must not
  // become permanent when the same strip returns to this BoxLayout. Section
  // presentation owns collapsed visibility; the projection owns row exclusions.
  strip_->SetVisible(true);
  strip_->SetExternalScrollMode(true);'''
assert old.count(a)==1
new=old.replace(a,b)
dest=out/'sources'/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(new)
(out/'native.patch').write_text(''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+p,tofile='b/'+p)))
(out/'files.json').write_text(json.dumps({'baseComposition':'v602 (body unchanged from v601)','files':[{'path':p,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(new.encode()).hexdigest()}],'edits':[{'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1}]},indent=2)+'\n')

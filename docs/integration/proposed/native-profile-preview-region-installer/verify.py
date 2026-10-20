"""Pure filesystem/static verification. No native build or target execution."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
r=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
e=json.loads((r/'source-evidence.json').read_text())
assert sha(Path(e['artifact']).read_bytes())==e['sha256']
for p in e['proofs']:
 assert sha(Path(p['path']).read_bytes())==p['sha256']
m=json.loads((r/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-region-install-replay-') as d:
 t=Path(d);subprocess.run(['git','init','-q',d],check=True)
 for f in m['files']:
  b=Path(f['baselineSource']).read_bytes();assert sha(b)==f['baselineSha256']
  p=t/f['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 subprocess.run(['git','apply','--check',str(r/'native.patch')],cwd=t,check=True)
 subprocess.run(['git','apply',str(r/'native.patch')],cwd=t,check=True)
 for f in m['files']:
  assert sha((t/f['path']).read_bytes())==f['outputSha256']
  assert sha((r/'port'/f['path']).read_bytes())==f['outputSha256']
cc=(r/'port/chrome/browser/ui/views/frame/vertical_tab_strip_region_view.cc').read_text()
assert 'std::make_unique<aux::ProfilePreviewAdmission>' in cc
assert 'std::make_unique<aux::ProfilePreviewInput>' in cc
assert 'std::make_unique<aux::ProfilePreviewCaptureCache>' in cc
assert 'ShowAuxProfileActions(' in cc and 'ToggleAuxProfileSearch(' in cc
assert 'AdmitsProfilePreview(width())' in cc
assert 'if (!aux_profile_preview_admission_)\n    on_animation_update_subscription_' in cc
assert 'aux_profile_preview_input_->DetachFromWidget()' in cc
print('Original source pins and five-output independent installer replay PASS; not native/runtime acceptance.')

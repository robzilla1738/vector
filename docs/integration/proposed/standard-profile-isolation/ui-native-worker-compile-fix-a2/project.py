from pathlib import Path
import hashlib,json,re,difflib
BASE=Path(__file__).resolve().parent;NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');sha=lambda x:hashlib.sha256(x).hexdigest()
inputs=[('chrome/browser/aux/ui_storage_migration_worker.h','e994ad290428a766623326d510d0499a54a4d24982faab92d09eddc8f253ce26'),('chrome/browser/aux/ui_storage_migration_worker.cc','8add977c0034ee471d09bba85549f2a56aa3a4ca12ac5da66c3cc9f414a3d92a'),('chrome/browser/aux/ui_storage_migration_controller.cc','aae943357053ca41a6e7afac86541f78d66c3548c6b385bf1eeae502ce224515')]
files=[]
for path,pinned in inputs:
 original=(NATIVE/path).read_text();assert sha(original.encode())==pinned;s=original;anchors=[]
 def edit(find,replace,count=1):
  global s
  assert s.count(find)==count,(find[:90],s.count(find),count);s=s.replace(find,replace);anchors.append({'find':find,'replace':replace,'count':count})
 if path.endswith('.h'):edit('namespace extensions { class ExtensionFunction; }','class ExtensionFunction;')
 if 'extensions::ExtensionFunction' in s:edit('extensions::ExtensionFunction','ExtensionFunction',s.count('extensions::ExtensionFunction'))
 if path.endswith('.cc'):
  before=s
  for match in list(re.finditer(r'(?m)^([ \t]*)(\w+)\.Set\(',before)):
   start=match.start();end=before.index(';',start)+1;find=before[start:end]
   if not re.search(r'\)\s*\.Set\(',find):continue
   indent,var=match.group(1),match.group(2)
   replace=re.sub(r'\)\s*\.Set\(',lambda m:');\n'+indent+var+'.Set(',find)
   edit(find,replace)
 out=BASE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
 files.append({'path':path,'inputSha256':pinned,'outputSha256':sha(s.encode()),'output':str(out),'anchors':anchors})
 # No lvalue Set continuation survives; valid rvalue builders remain untouched.
 assert not re.search(r'(?m)^\s*\w+\.Set\([^;]*\)\s*\.Set\(',s)
 assert 'extensions::ExtensionFunction' not in s
receipt={'format':'aux.ui-native-worker-compile-fix.source.v1','files':files,'countedAnchors':sum(len(f['anchors']) for f in files),'actualValuesHeaderSha256':sha((NATIVE/'base/values.h').read_bytes()),'actualExtensionFunctionHeaderSha256':sha((NATIVE/'extensions/browser/extension_function.h').read_bytes()),'failedCompileLogSha256':sha(Path('/private/tmp/aux-feature-completion-native-compile-20261024-ui-worker-a6b/ui_storage_migration_worker.stderr').read_bytes()),'nativeTreeUnchanged':True,'nativeCompiled':False,'runtimeAccepted':False}
(BASE/'source-plan.json').write_text(json.dumps(receipt,indent=2)+'\n');(BASE/'native.patch').write_text(''.join(''.join(difflib.unified_diff((NATIVE/f['path']).read_text().splitlines(True),Path(f['output']).read_text().splitlines(True),fromfile='a/'+f['path'],tofile='b/'+f['path'])) for f in files));print(json.dumps({'files':len(files),'countedAnchors':receipt['countedAnchors'],'nativeTreeUnchanged':True}))

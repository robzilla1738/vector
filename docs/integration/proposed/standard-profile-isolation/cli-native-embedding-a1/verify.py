#!/usr/bin/env python3
"""Static proposal checks only. No compile/native API/product execution."""
from pathlib import Path
import difflib,hashlib,json,subprocess,tempfile
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda b:hashlib.sha256(b).hexdigest()
plan=json.loads((HERE/'source-plan.json').read_text());rows=plan['files']
checks=[]
for row in rows:
 original=(ROOT/row['path']).read_bytes();assert sha(original)==row['inputSha256']
 text=original.decode()
 for anchor in row['anchors']:
  assert text.count(anchor['find'])==anchor['count']==1
  text=text.replace(anchor['find'],anchor['replace'])
 assert sha(text.encode())==row['outputSha256']
 assert (HERE/'source'/row['path']).read_bytes()==text.encode()
checks.append('six native overlays replay exactly from unchanged inputs; eleven one-match anchors')
with tempfile.TemporaryDirectory(prefix='aux-cli-embedding-patch-') as temporary:
 stage=Path(temporary)
 for row in rows:
  target=stage/row['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((ROOT/row['path']).read_bytes())
 subprocess.run(['git','apply','--check',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 subprocess.run(['git','apply',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 for row in rows:assert sha((stage/row['path']).read_bytes())==row['outputSha256']
 subprocess.run(['git','apply','--reverse','--check',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 subprocess.run(['git','apply','--reverse',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 for row in rows:assert sha((stage/row['path']).read_bytes())==row['inputSha256']
checks.append('exact native patch applies and reverses in a disposable source-only directory')
sealed=json.loads((HERE/'sealed-entry-plan.json').read_text());text=Path(sealed['input']).read_text();assert sha(text.encode())==sealed['inputSha256']
for edit in sealed['changes']:
 assert text.count(edit['find'])==edit['count'];text=text.replace(edit['find'],edit['replace'])
assert sha(text.encode())==sealed['outputSha256'];assert (HERE/'source/daemon/AuxSealedNativeCliEntry.swift').read_text()==text
checks.append('current compiled sealed-entry reader preserved by seven exact counted substitutions')
files=[]
overlays={row['path']for row in rows}
for source in sorted((HERE/'source').rglob('*')):
 if not source.is_file():continue
 relative=source.relative_to(HERE/'source').as_posix()
 if relative in overlays:destination=relative;kind='existing-native-overlay'
 elif relative.startswith('common/')or relative.startswith('browser/'):destination='chrome/browser/aux/cli/'+source.name;kind='new-native-source'
 else:destination='native-cli/'+source.name;kind='new-native-executable-source'
 files.append({'source':str(source),'path':destination,'sha256':sha(source.read_bytes()),'kind':kind})
(HERE/'source-files.json').write_text(json.dumps({'format':'aux.cli-native-embedding.sources.v1','files':files,'sourceCount':len(files),'packageSelected':False},indent=2)+'\n')
checks.append('every proposed source has a hash and destination; no root registration/packaging mutation')
link=HERE.parent/'ui-native-capture-transport-a1/daemon-link-inputs.json'
linked=json.loads(link.read_text());dependencies={str(link):sha(link.read_bytes())}
for source in linked['sources']:
 actual=Path(source['path']);assert sha(actual.read_bytes())==source['sha256'];dependencies[str(actual)]=source['sha256']
extra=[HERE.parent/'ui-native-capture-transport-a1/actual-daemon-link-a3.json',ROOT/'chrome/browser/aux/AuxNativeParentColdLaunch.cc',ROOT/'chrome/browser/aux/AuxNativePeerTransport.h',ROOT/'chrome/browser/aux/AuxNativePeerTransport.cc',ROOT/'chrome/browser/aux/AuxNativePeerWire.h',ROOT/'chrome/browser/aux/AuxSelectedStateHome.h',ROOT/'chrome/browser/aux/AuxSelectedStateHome.cc',Path(sealed['input']),Path('/Users/rcourson/Documents/Vibe/web/out/aux-node-static-26.5.0/node-v26.5.0/lib/internal/bootstrap/switches/does_not_own_process_state.js'),Path('/Users/rcourson/Documents/Vibe/web/out/aux-node-static-26.5.0/node-v26.5.0/lib/internal/main/worker_thread.js'),HERE.parent/'cli-native-owner-a1/NATIVE-PAIRING.md',Path('/private/tmp/aux-cli-native-owner-source-20261024-a3/node-development/aux-native-cli-entry.mjs')]
for source in extra:dependencies[str(source)]=sha(source.read_bytes())
for row in rows:dependencies[str(ROOT/row['path'])]=row['inputSha256']
(HERE/'dependency-pins.json').write_text(json.dumps({'format':'aux.cli-native-embedding.dependencies.v1','files':[{'path':name,'sha256':value}for name,value in sorted(dependencies.items())],'sourceDependencyCount':len(dependencies),'nativeApiExecuted':False},indent=2)+'\n')
checks.append('actual current native source graph and Node Worker cwd implementation pinned without execution')
engine=(HERE/'source/base/process/mac/aux_browser_descendant_engine.cc').read_text();assert 'CliClientMembership::managed' in engine and 'CliClientMembership::unknown' in engine and 'CliClientMembership::unowned'not in engine
browser=(HERE/'source/browser/AuxBrowserCliInvocation.cc').read_text();assert 'case aux::browser_descendants::CliClientMembership::managed:return{};'in browser and 'case aux::browser_descendants::CliClientMembership::unknown:return{};'in browser
frontend=(HERE/'source/common/AuxNativeCliFrontend.cc').read_text();assert 'retained runtime join is not paired'in frontend
backend=(HERE/'source/daemon/AuxRetainedCliInvocation.h').read_text();assert backend.index(' private:')<backend.index('FromAuthenticatedBrowser')
checks.append('managed/unknown launch refused; private-child refusal and private uncalled retained factory remain')
for row in rows:assert sha((ROOT/row['path']).read_bytes())==row['inputSha256']
receipt={'format':'aux.cli-native-embedding.static-check.v1','passed':True,'checks':checks,'nativeOverlayCount':len(rows),'nativeAnchorCount':sum(len(row['anchors'])for row in rows),'sourceCount':len(files),'dependencyCount':len(dependencies),'nativeCheckoutChanged':False,'nativeBuildRun':False,'compilerRun':False,'nativeApiExecuted':False,'productExecuted':False,'signed':False,'packageSelected':False,'runtimeAcceptance':False}
(HERE/'static-check.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items()if k!='checks'}))

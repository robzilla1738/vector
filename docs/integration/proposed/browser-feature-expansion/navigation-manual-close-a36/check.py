from pathlib import Path
import json,hashlib
here=Path(__file__).resolve().parent;plan=json.loads((here/'source-plan.json').read_text());root=Path(plan['nativeRoot']);sha=lambda x:hashlib.sha256(x).hexdigest();rows=[];texts={}
for row in plan['files']:
 before=(root/row['path']).read_bytes();assert sha(before)==row['inputSha256'];text=before.decode()
 for edit in row['anchors']:
  assert text.count(edit['before'])==edit['expectedCount']==1
  text=text.replace(edit['before'],edit['after'])
 assert sha(text.encode())==row['outputSha256'];assert text==(here/'source'/row['path']).read_text();texts[row['path']]=(before.decode(),text)
 rows.append({'path':row['path'],'inputSha256':row['inputSha256'],'outputSha256':row['outputSha256'],'anchors':len(row['anchors']),'replayPassed':True})
cc=next(v for k,v in texts.items()if k.endswith('.cc'));old,new=cc
for first,last in [('bool AuxOrganizationWindowController::CloseViewNow','bool AuxOrganizationWindowController::UnloadViewNow'),('void AuxOrganizationWindowController::ArchiveEntry','bool AuxOrganizationWindowController::HandleClose'),('void AuxOrganizationWindowController::AutomaticArchiveCommitted','void AuxOrganizationWindowController::ContinueAutomaticArchive')]:
 def segment(text):return text[text.index(first):text.index(last,text.index(first)+len(first))]
 assert segment(old)==segment(new),first+' must remain exact'
assert new.count('Protected(tab, false)')==1
start=new.index('bool AuxOrganizationWindowController::HandleClose');end=new.index('organization::Entry AuxOrganizationWindowController::EntryForDisplay',start);close=new[start:end]
assert close.index('!Protected(tab, false)')<close.index('PostTask(')
assert '!entry.archived' in close and '!organization->blocked() && !organization->pending()' in close
bundle=Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/extension/dist')
manifest=json.loads((bundle/'manifest.json').read_text());assert any('<all_urls>' in v.get('matches',[]) and 'content/content.js' in v.get('js',[]) and v.get('run_at')=='document_idle'for v in manifest['content_scripts'])
script=(bundle/'content/content.js').read_text()
for anchor in ['if(window.top===window){xb(),Nb(),ob(),sb(),Yf();','function Yf(){if(Io||window.top!==window||Wf.has(window.location.origin))return;','ja().then(n),Ha(n),Jf(e,()=>t)','document.addEventListener("visibilitychange",i)']:assert script.count(anchor)==1
inputs=[bundle/'manifest.json',bundle/'content/content.js',Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/browser-fixture.py'),root/'content/browser/web_contents/web_contents_impl.cc',root/'chrome/browser/ui/unload_controller.cc']
result={'format':'aux.manual-close.source-check.v1','files':rows,'passiveListenerProof':'all-URLs document_idle -> unconditional top-window Yf -> Jf -> visibilitychange -> native NeedToFire includes visible lifecycle handler','reviewInputs':[{'path':str(p),'sha256':sha(p.read_bytes())}for p in inputs],'automatedAndCloseViewBodiesUnchanged':True,'archivedRecoveryUntouched':True,'nativeCompiled':False,'appTested':False,'runtimeAccepted':False};(here/'source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))

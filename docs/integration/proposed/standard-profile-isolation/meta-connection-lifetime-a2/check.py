import hashlib,json
from pathlib import Path
p=Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
m=json.loads((p/'native-replacements.json').read_text())
count=0
for row in m['files']:
    before=(p/'baseline'/row['path']).read_text()
    assert sha(before.encode())==row['beforeSha256']
    assert Path(row['baselineSource']).read_text()==before
    after=before
    for change in row['changes']:
        assert change['count']==after.count(change['find'])==1
        after=after.replace(change['find'],change['replace']);count+=1
    assert after==(p/'native-source'/row['path']).read_text()
    assert sha(after.encode())==row['afterSha256']
assert len(m['files'])==6 and count==12
impl=(p/'native-source/chrome/browser/profiles/profile_impl.cc').read_text()
assert 'devtools_browser_context_manager.h' not in impl
assert 'DevToolsBrowserContextManager' not in impl
body=impl[impl.index('void ProfileImpl::DestroyOffTheRecordProfile('):]
assert body.index('HasAuxMemoryOnlyStorageConfiguration')<body.index('otr_profiles_.erase(profile_id)')<body.index('std::move(aux_destroyed).Run')
manager=(p/'native-source/chrome/browser/devtools/devtools_browser_context_manager.cc').read_text()
body=manager[manager.index('void DevToolsBrowserContextManager::DisposeAuxBrowserContextAndObserve('):]
assert body.index('ObserveAuxOTRDestruction(')<body.index('aux_context_object_observers_.emplace')<body.index('DisposeBrowserContext(context')
assert body.index('CancelAuxOTRDestruction')<body.index('aux_context_object_observers_.erase(pending)')
a1=p.parent/'meta-connection-lifetime-a1'
review=json.loads((a1/'overlay.json').read_text())
for source in review['sourceFiles']:
    assert sha((a1/source['path']).read_bytes())==source['sha256']
inputs=[]
for f in ['chrome/browser/profiles/BUILD.gn','chrome/browser/devtools/BUILD.gn']:
    q=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')/f
    inputs.append({'path':str(q),'sha256':sha(q.read_bytes())})
(p/'manifest.json').write_text(json.dumps({'format':'aux.meta-context-profile-owned-callback.review.v1','predecessor':{'path':str(a1/'overlay.json'),'sha256':sha((a1/'overlay.json').read_bytes())},'nativeReplacementsSha256':sha((p/'native-replacements.json').read_bytes()),'patchSha256':sha((p/'native.patch').read_bytes()),'files':6,'anchors':12,'daemonChanges':0,'daemonStageAnchorsUnchanged':14,'gnInputs':inputs,'sourceReplayPassed':True,'callbackOrderingSourceCheckPassed':True,'nativeBuild':False,'runtimeExecuted':False},indent=2)+'\n')
print('Six-file/twelve-anchor immutable replay and callback ordering source checks passed; a1 daemon bytes unchanged.')

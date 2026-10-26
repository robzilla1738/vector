"""Counted source/lifecycle order checks only; no product execution."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent
plan=json.loads((HERE/'source-plan.json').read_text());rows=[]
for row in plan['files']:
 before=(HERE/'preimages'/row['path']).read_text();after=Path(row['source']).read_text()
 assert hashlib.sha256(before.encode()).hexdigest()==row['inputSha256'] and hashlib.sha256(after.encode()).hexdigest()==row['outputSha256']
 text=before
 for a in row['anchors']:assert text.count(a['find'])==a['count'];text=text.replace(a['find'],a['replace'],1)
 assert text==after
 for a in reversed(row['anchors']):assert text.count(a['replace'])==1;text=text.replace(a['replace'],a['find'],1)
 assert text==before
 rows.append({'path':row['path'],'inputSha256':row['inputSha256'],'outputSha256':row['outputSha256'],'countedAnchors':len(row['anchors']),'forwardReverseExact':True})
main=Path(plan['files'][0]['source']).read_text();start=main.index('void ChromeBrowserMainParts::PostMainMessageLoopRun()');body=main[start:main.index('  TRACE_EVENT_END',start)]
assert body.index('CloseNativeFeatureIoAdmission')<body.index('BrowserPlatform::Get().Shutdown')<body.index('BeginNativeBrowserShutdown')<body.index('PrepareNativeBrowserShutdownDrain')
assert body.count('BrowserPlatform::Get().Shutdown')==2
assert '#if BUILDFLAG(ENABLE_AUX_BROWSER) && (!defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP)' in body
assert 'ObserveNativeBrowserPartsDestroyed();' in main
supervisor=Path(plan['files'][1]['source']).read_text();start=supervisor.index('void DaemonSupervisor::FinishNativeShutdown()');body=supervisor[start:supervisor.index('void DaemonSupervisor::DidFinishShutdown',start)]
assert body.index('if (!original_child_exited)')<body.index('if (browser_shutdown.phase < 6)')<body.index('CloseNativeSelectedStateHome')
proof=body[body.index('if (browser_shutdown.phase < 6)'):body.index('  if (browser_shutdown.admission_closed')]
assert 'DidFinishShutdown({true, code})' in proof and 'WIFEXITED(child->wait_status)' in proof and 'WEXITSTATUS(child->wait_status)' in proof
assert 'code = 0' not in proof and 'CloseNativeSelectedStateHome' not in proof
assert 'DidFinishShutdown({false, std::nullopt})' in body and 'base::Seconds(5)' in body
result={'format':'aux.ordinary-prephase-order-source-check.v1','passed':True,'files':rows,'ordinaryFeatureCloseThenDaemonThenPhaseThenBrowserPrepare':True,'fullModeOriginalOrderPreserved':True,'ordinaryShutdownNotDuplicated':True,'directExitRequiresOriginalReap':True,'realNormalExitCodeOnlyAndSignalNeverZero':True,'globalParentLateCleanupUnchanged':True,'unknownDeadlineFailureRetained':True,'productExecuted':False,'nativeTreeMutated':False}
(HERE/'actual-source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))

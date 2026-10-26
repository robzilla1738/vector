from pathlib import Path
import json,hashlib,difflib
h=Path(__file__).resolve().parent;root=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');out=h/'browser-source';out.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest();records=[];patch=[]
fixed='(defined(AUX_FIXED_LINKED_PTY_POLICY) && AUX_FIXED_LINKED_PTY_POLICY)';ordinary='(!defined(AUX_FIXED_LINKED_PTY_POLICY) || !AUX_FIXED_LINKED_PTY_POLICY)'
def apply(path,pairs):
 source=root/path;before=source.read_text();text=before
 for a,b,n in pairs:
  assert text.count(a)==n,(path,a,text.count(a),n);text=text.replace(a,b)
 target=out/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 records.append({'path':path,'input':str(source),'inputSha256':sha(before.encode()),'output':str(target),'outputSha256':sha(text.encode()),'anchors':[{'before':a,'after':b,'count':n} for a,b,n in pairs]});patch.append(''.join(difflib.unified_diff(before.splitlines(True),text.splitlines(True),fromfile=str(source),tofile=str(target))))
positive='#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)';negative='#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)'
apply('base/process/mac/aux_browser_descendant_bridge.cc',[(positive,positive+' && '+ordinary,1),(negative,negative+' || '+fixed,1)])
a='#if defined(AUX_BROWSER_DESCENDANT_CUSTODY) && !defined(HELPER_EXECUTABLE) && !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)';apply('chrome/app/chrome_exe_main_mac.cc',[(a,a.replace('!defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)','(!defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || '+fixed+')'),2)])
apply('chrome/browser/aux/AuxOwnedNativePeerChild.cc',[(negative,negative+' || '+fixed,1)])
# UI capture's migration refusal is intentionally unchanged: migration is out of scope.
apply('chrome/browser/aux/AuxSelectedStateHome.cc',[(negative,negative+' || '+fixed,1)])
a=positive+' && AUX_BROWSER_ONLY_NATIVE_STARTUP';apply('chrome/browser/aux/daemon_supervisor.cc',[(a,a+' && '+ordinary,2)])
apply('chrome/browser/ui/aux_browser_shutdown_drain.cc',[(positive,positive+' && '+ordinary,2)])
a='#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP';b='#if BUILDFLAG(ENABLE_AUX_BROWSER) && (!defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP)';apply('chrome/browser/chrome_browser_main.cc',[(a,a+' && '+ordinary,1),(b,b[:-1]+' || '+fixed+')',1)])
apply('chrome/browser/aux/ordinary_startup_build.h',[('#define AUX_BROWSER_ONLY_NATIVE_STARTUP 1','#define AUX_BROWSER_ONLY_NATIVE_STARTUP 1\n// This copied header belongs only to the explicit inactive supervised cohort.\n#define AUX_FIXED_LINKED_PTY_POLICY 1',1)])
a='defines = [ "AUX_BROWSER_ONLY_NATIVE_STARTUP=1" ]';b='defines = [ "AUX_BROWSER_ONLY_NATIVE_STARTUP=1", "AUX_FIXED_LINKED_PTY_POLICY=1" ]'
apply('base/BUILD.gn',[(a,b,1)]);apply('chrome/browser/aux/BUILD.gn',[(a,b,2)])
a='defines = [ "AUX_BROWSER_DESCENDANT_CUSTODY", "AUX_BROWSER_ONLY_NATIVE_STARTUP=1" ]';apply('chrome/BUILD.gn',[(a,a.replace(' ]',', "AUX_FIXED_LINKED_PTY_POLICY=1" ]'),1)])
a='swiftflags = [ "-D", "AUX_BROWSER_ONLY_NATIVE_STARTUP" ]';apply('chrome/browser/aux/native_peer_policy/BUILD.gn',[(a,a.replace(' ]',', "-D", "AUX_FIXED_LINKED_PTY_POLICY" ]'),1)])
result={'format':'aux.future-supervised-browser-source.v1','activated':False,'sharedSourceChanged':False,'records':records,'retained':['current-user startup/state formats, path and signing validation','actual native owner/reaper and original early ES observer','original strict Crashpad registration close and descendant settlement','legacy migration refusal'],'selection':'Only this copied overlay/GN enables AUX_FIXED_LINKED_PTY_POLICY; the current local source and candidate are unchanged.'}
(h/'browser-source-plan.json').write_text(json.dumps(result,indent=2)+'\n');(h/'browser-source.patch').write_text(''.join(patch))
print({'files':len(records),'producerSources':sum(x['path'].endswith('.cc') for x in records)})

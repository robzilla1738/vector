import difflib,hashlib,json
from pathlib import Path
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
workspace=Path('/Users/rcourson/Documents/Vibe/web');here=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
comp=workspace/'out/native-reuse-composition-v607/manifest.json';pins={f['path']:f['outputSha256'] for f in json.loads(comp.read_text())['files']}
edits=[]
def edit(path,a,b):edits.append(dict(path=path,find=a,replace=b,count=1))
m='chrome/browser/ui/extensions/extension_side_panel_manager'
edit(m+'.h','  void PrepareForAuxProfileSwitch();','  bool CanRetireForAuxProfileSwitch() const;\n  void PrepareForAuxProfileSwitch();')
edit(m+'.cc','#include "content/public/browser/navigation_controller.h"','#include "content/public/browser/navigation_controller.h"\n#include "content/public/browser/render_frame_host.h"\n#include "third_party/blink/public/mojom/frame/sudden_termination_disabler_type.mojom.h"')
edit(m+'.cc','void ExtensionSidePanelManager::PrepareForAuxProfileSwitch() {','''bool ExtensionSidePanelManager::CanRetireForAuxProfileSwitch() const {
  // The supplied Agent owns asynchronous local FileReaders in its renderer.
  // Its beforeunload owner spans that queue and the attachment draft commit.
  // Do not confuse ordinary visibility/pagehide listeners with pending work.
  const auto it = coordinators_.find(aux::kAgentExtensionId);
  if (it == coordinators_.end() || !it->second->host()) {
    return true;
  }
  bool pending = false;
  it->second->host()->host_contents()->ForEachRenderFrameHost(
      [&](content::RenderFrameHost* frame) {
        if (frame->IsRenderFrameLive() &&
            frame->GetSuddenTerminationDisablerState(
                blink::mojom::SuddenTerminationDisablerType::kBeforeUnloadHandler)) {
          pending = true;
        }
      });
  return !pending;
}

void ExtensionSidePanelManager::PrepareForAuxProfileSwitch() {''')
p='chrome/browser/ui/browser_window/internal/browser_window_features_aux_profile_switch.cc'
edit(p,'''  if (!CanSwitchAuxAgentTabsProfile(&browser)) {''','''  if (features_->extension_side_panel_manager_ &&
      !features_->extension_side_panel_manager_->CanRetireForAuxProfileSwitch()) {
    LOG(ERROR) << "Aux profile transition rejected: agent-pending-local-file-read";
    return nullptr;
  }
  if (!CanSwitchAuxAgentTabsProfile(&browser)) {''')
files=[];patch=[]
for path in dict.fromkeys(e['path'] for e in edits):
 before=(root/path).read_text();assert sha(before.encode())==pins[path],path;after=before
 for e in [x for x in edits if x['path']==path]:
  assert after.count(e['find'])==1,path;after=after.replace(e['find'],e['replace'])
 out=here/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(after)
 patch+=difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path)
 files.append(dict(path=path,baselineSha256=sha(before.encode()),outputSha256=sha(after.encode())))
(here/'native.patch').write_text(''.join(patch));(here/'files.json').write_text(json.dumps(dict(baseComposition='v607',compositionSha256=sha(comp.read_bytes()),files=files,edits=edits),indent=2)+'\n')
path='agent/assets/permission-approval-D-GTf91U.js'
raw=(workspace/'out/provided-source-snapshot-1.26.1016.1852'/path).read_text();after=raw
ui=[]
def u(a,b):
 global after
 assert after.count(a)==1,a
 ui.append(dict(find=a,replace=b,count=1));after=after.replace(a,b)
u('ce=(0,a.useRef)([]);(0,a.useEffect)(()=>()=>{ie.current+=1', 'ce=(0,a.useRef)([]),auxFileUnload=(0,a.useRef)(null);const auxSetFileBusy=c=>{if(c&&!auxFileUnload.current){const d=x=>{x.preventDefault(),x.returnValue=""};auxFileUnload.current=d,window.addEventListener("beforeunload",d)}else!c&&auxFileUnload.current&&(window.removeEventListener("beforeunload",auxFileUnload.current),auxFileUnload.current=null)};(0,a.useEffect)(()=>()=>{auxSetFileBusy(!1),ie.current+=1')
u('vt=(0,a.useEffectEvent)(()=>pe(z.current));(0,a.useEffect)(()=>{vt()},[te])','vt=(0,a.useEffectEvent)(()=>{if(auxFileUnload.current&&ee.current===0&&ze.length===0&&Z.current===Y&&!U.current&&je){pe(z.current,te,!0),auxSetFileBusy(!1)}else pe(z.current)});(0,a.useEffect)(()=>{vt()},[te,ze])')
u('ce.current=[],ae.current=!1,ie.current+=1','ce.current=[],ae.current=!1,auxSetFileBusy(!1),ie.current+=1')
u('ge=async c=>{if(u||c.length===0)return;ee.current+=1;','ge=async c=>{if(u||c.length===0)return;auxSetFileBusy(!0),ee.current+=1;')
(here/'ui-transform.json').write_text(json.dumps(dict(path=path,sourceSha256=sha(raw.encode()),outputSha256=sha(after.encode()),edits=ui),indent=2)+'\n')
(here/'transformed-resource.js').write_text(after)
print('native',len(files),len(edits),'ui',len(ui),'patch',sha(''.join(patch).encode()))

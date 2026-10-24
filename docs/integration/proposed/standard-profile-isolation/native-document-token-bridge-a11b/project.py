from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent;NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');sha=lambda b:hashlib.sha256(b).hexdigest();files=[]
new={
'content/public/browser/aux_ui_migration_document.h':'''// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CONTENT_PUBLIC_BROWSER_AUX_UI_MIGRATION_DOCUMENT_H_
#define CONTENT_PUBLIC_BROWSER_AUX_UI_MIGRATION_DOCUMENT_H_
#include <optional>
#include "content/common/content_export.h"
#include "third_party/blink/public/common/tokens/tokens.h"
namespace content {
class RenderFrameHost;
// Factual join only. Resolve the exact real browser-owned host through its
// native registry, reject foreign/mock identities and unsupported lifecycle.
// This does not grant storage, Profile, path, startup or migration authority.
CONTENT_EXPORT std::optional<blink::DocumentToken>
GetDocumentTokenForAuxUiMigration(RenderFrameHost& frame);
}  // namespace content
#endif
''',
'content/browser/renderer_host/aux_ui_migration_document.cc':'''// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "content/public/browser/aux_ui_migration_document.h"
#include "content/browser/renderer_host/render_frame_host_impl.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
namespace content {
std::optional<blink::DocumentToken>
GetDocumentTokenForAuxUiMigration(RenderFrameHost& frame) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  auto* actual = RenderFrameHostImpl::FromID(frame.GetGlobalId());
  if (!actual || static_cast<RenderFrameHost*>(actual) != &frame ||
      !actual->IsActive() || !actual->IsRenderFrameLive() ||
      !actual->GetPendingCommitCrossDocumentNavigations().empty())
    return std::nullopt;
  // IsActive is exactly kActive (also rejecting pending lifecycle updates),
  // preserving existing GetDocumentToken pending/speculative restrictions.
  return actual->GetDocumentToken();
}
}  // namespace content
'''}
for path,text in new.items():
 assert not (NATIVE/path).exists();out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text);files.append({'path':path,'operation':'create','inputSha256':None,'expectedNativeTargetAbsent':True,'outputSha256':sha(text.encode()),'output':str(out),'anchors':[]})
path='chrome/browser/aux/ui_storage_migration_controller.cc';previous=HERE.parent/'ui-native-wire-controller-a12/source'/path;old=previous.read_text();text=old;anchors=[]
for find,replace in [
 ('#include "content/public/browser/browser_thread.h"','#include "content/public/browser/browser_thread.h"\n#include "content/public/browser/aux_ui_migration_document.h"'),
 ('actual->GetDocumentTokenForAuxUiMigration()', 'content::GetDocumentTokenForAuxUiMigration(*actual)'),
 ('frame->GetDocumentTokenForAuxUiMigration()', 'content::GetDocumentTokenForAuxUiMigration(*frame)')]:
 assert text.count(find)==1,(find,text.count(find));text=text.replace(find,replace);anchors.append({'find':find,'replace':replace,'count':1})
out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text);files.append({'path':path,'input':str(previous),'inputSha256':sha(old.encode()),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
unchanged=[]
for path in ['content/public/browser/render_frame_host.h','content/browser/renderer_host/render_frame_host_impl.h','content/browser/renderer_host/render_frame_host_impl.cc']:
 unchanged.append({'path':path,'requiredOriginalSha256':sha((NATIVE/path).read_bytes()),'doNotProjectA11VirtualAccessor':True})
plan={'format':'aux.native-document-token-bridge.source.v1','files':files,'countedAnchors':len(anchors),'requiredUnchangedNativeOwners':unchanged,'supersedes':'native-document-token-join-a11 three RFH/Impl virtual-accessor projections; keep controller facts via this bridge','priorController':'ui-native-wire-controller-a12','rootRegistrations':['content/public/browser/BUILD.gn:aux_ui_migration_document.h','content/browser/BUILD.gn:renderer_host/aux_ui_migration_document.cc'],'nativeTreeUnchanged':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'runtimeAccepted':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');(HERE/'native.patch').write_text(''.join(''.join(difflib.unified_diff((Path(f['input']).read_text() if f.get('input') else '').splitlines(True),Path(f['output']).read_text().splitlines(True),fromfile=('a/'+f['path'] if f.get('input') else '/dev/null'),tofile='b/'+f['path'])) for f in files));print(json.dumps({'files':len(files),'countedAnchors':len(anchors),'requiredUnchangedOwners':len(unchanged)}))

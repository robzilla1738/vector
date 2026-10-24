from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');sha=lambda x:hashlib.sha256(x).hexdigest();files=[]
def project(path,changes):
 old=(ROOT/path).read_text();text=old;anchors=[]
 for find,replace in changes:
  assert text.count(find)==1,(path,find[:90],text.count(find));text=text.replace(find,replace);anchors.append({'find':find,'replace':replace,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text);files.append({'path':path,'inputSha256':sha(old.encode()),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
project('content/public/browser/render_frame_host.h', [('''  virtual const blink::LocalFrameToken& GetFrameToken() const = 0;''','''  virtual const blink::LocalFrameToken& GetFrameToken() const = 0;

  // Factual native document join for the finite Aux storage cohort. Unsupported
  // hosts/mocks return no fact, never a generated/default token. This does not
  // authorize storage or replace WeakDocumentPtr/lifecycle ownership checks.
  virtual std::optional<blink::DocumentToken> GetDocumentTokenForAuxUiMigration() {
    return std::nullopt;
  }''')])
project('content/browser/renderer_host/render_frame_host_impl.h', [('''  const blink::LocalFrameToken& GetFrameToken() const override;''','''  const blink::LocalFrameToken& GetFrameToken() const override;
  std::optional<blink::DocumentToken> GetDocumentTokenForAuxUiMigration() override;''')])
project('content/browser/renderer_host/render_frame_host_impl.cc', [('''const perfetto::Track& RenderFrameHostImpl::GetTracingTrack() const {''','''std::optional<blink::DocumentToken>
RenderFrameHostImpl::GetDocumentTokenForAuxUiMigration() {
  if (!IsActive() || !IsRenderFrameLive() ||
      lifecycle_state() == LifecycleStateImpl::kPendingCommit ||
      lifecycle_state() == LifecycleStateImpl::kSpeculative ||
      !GetPendingCommitCrossDocumentNavigations().empty()) return std::nullopt;
  return GetDocumentToken();
}

const perfetto::Track& RenderFrameHostImpl::GetTracingTrack() const {''')])
project('chrome/browser/aux/ui_storage_migration_controller.cc', [
 ('''  extensions::ExtensionApiFrameIdMap::DocumentId document_id;''','''  extensions::ExtensionApiFrameIdMap::DocumentId document_id;
  std::optional<blink::LocalFrameToken> native_frame_token;
  std::optional<blink::DocumentToken> native_document_token;'''),
 ('''      extensions::ExtensionApiFrameIdMap::GetDocumentId(actual) == frame.document_id &&
      actual->GetLastCommittedOrigin() == extension_->origin();''','''      extensions::ExtensionApiFrameIdMap::GetDocumentId(actual) == frame.document_id &&
      frame.native_frame_token && actual->GetFrameToken() == *frame.native_frame_token &&
      frame.native_document_token && actual->GetDocumentTokenForAuxUiMigration() == frame.native_document_token &&
      actual->GetLastCommittedOrigin() == extension_->origin();'''),
 ('''    auto retained = std::make_unique<Frame>();''','''    const auto native_document = frame->GetDocumentTokenForAuxUiMigration();
    if (!native_document) return false;
    auto retained = std::make_unique<Frame>();
    retained->native_frame_token = frame->GetFrameToken();
    retained->native_document_token = native_document;'''),
 ('''    page.Set("nativeDocumentId", frame->document_id.ToString());''','''    page.Set("nativeDocumentId", frame->document_id.ToString());
    page.Set("nativeLocalFrameToken", frame->native_frame_token->ToString());
    page.Set("nativeBlinkDocumentToken", frame->native_document_token->ToString());''')
])
plan={'format':'aux.native-document-token-join.source.v1','nativeRoot':str(ROOT),'files':files,'countedAnchors':sum(len(f['anchors']) for f in files),'nativeTreeUnchanged':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'runtimeAccepted':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');(HERE/'native.patch').write_text(''.join(''.join(difflib.unified_diff((ROOT/f['path']).read_text().splitlines(True),Path(f['output']).read_text().splitlines(True),fromfile='a/'+f['path'],tofile='b/'+f['path'])) for f in files));print(json.dumps({'files':len(files),'countedAnchors':plan['countedAnchors']}))

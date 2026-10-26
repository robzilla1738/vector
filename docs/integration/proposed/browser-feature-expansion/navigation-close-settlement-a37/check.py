from pathlib import Path
import hashlib,json
here=Path(__file__).resolve().parent;plan=json.loads((here/'source-plan.json').read_text());root=Path(plan['nativeRoot']);sha=lambda value:hashlib.sha256(value).hexdigest();rows=[];cc=None
for row in plan['files']:
 original=(root/row['path']).read_bytes();assert sha(original)==row['inputSha256'];text=original.decode()
 for edit in row['anchors']:
  assert text.count(edit['before'])==edit['expectedCount'];text=text.replace(edit['before'],edit['after'])
 assert sha(text.encode())==row['outputSha256'];assert text==(here/'source'/row['path']).read_text()
 rows.append({'path':row['path'],'inputSha256':row['inputSha256'],'outputSha256':row['outputSha256'],'anchors':len(row['anchors']),'replayPassed':True})
 if row['path'].endswith('.cc'):cc=(original.decode(),text)
old,new=cc
for first,last in [('bool AuxOrganizationWindowController::CloseViewNow','bool AuxOrganizationWindowController::UnloadViewNow'),('void AuxOrganizationWindowController::ArchiveEntry','bool AuxOrganizationWindowController::HandleClose'),('void AuxOrganizationWindowController::AutomaticArchiveCommitted','void AuxOrganizationWindowController::ContinueAutomaticArchive')]:
 def part(text):return text[text.index(first):text.index(last,text.index(first)+len(first))]
 assert part(old)==part(new),first
handle=new[new.index('bool AuxOrganizationWindowController::HandleClose'):new.index('void AuxOrganizationWindowController::ContinueManualClose')]
assert 'if (!organization->blocked() && !entry.archived &&' in handle
assert '!organization->pending()' not in handle
continuation=new[new.index('void AuxOrganizationWindowController::ContinueManualClose'):new.index('organization::Entry AuxOrganizationWindowController::EntryForDisplay')]
for field in ['request.document.AsRenderFrameHostIfValid()','request.profile.get() != profile_','contents->GetLastCommittedURL().spec() != request.url','coordinator->owner_generation() != request.generation','view->second.document_id != request.view_document']:assert field in continuation
assert continuation.index('NeedToFireBeforeUnloadOrUnloadEvents()')<continuation.index('current->pending()')<continuation.index('ArchiveLogicalEntry(')
assert new.count('deferred_manual_closes_.clear()')==2
assert 'settled_ = organization->ObserveSettled(base::BindRepeating(&AuxOrganizationWindowController::QueueReconcile' in new
proof={p:sha((root/p).read_bytes()) for p in ['chrome/browser/aux/organization/organization_service.cc','chrome/browser/ui/unload_controller.cc','content/browser/renderer_host/render_frame_host_manager.cc']}
result={'format':'aux.manual-close.settlement.source-check.v1','files':rows,'existingSettlementWakePreserved':True,'pendingInitialNativeUnloadBeforeArchive':True,'exactDocumentAndOwnerRequired':True,'archiveAndCloseAndAutomaticBodiesUnchanged':True,'reviewInputs':proof,'compiled':False,'runtimeAccepted':False};(here/'source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))

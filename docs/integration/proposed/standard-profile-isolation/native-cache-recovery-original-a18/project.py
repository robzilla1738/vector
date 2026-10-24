"""Separate immutable fresh cache source from native-journal originals."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;PARENT=HERE.parent
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'third_party/blink/public/mojom/dom_storage/storage_area.mojom':('native-renderer-cache-lease-a8',[(
  '  array<AuxUiCacheEntry> staged_entries;\n};',
  '''  array<AuxUiCacheEntry> staged_entries;
  bool recovery_prepared;
  bool recovery_restored;
  array<AuxUiCacheEntry> recovery_source_entries;
  array<AuxUiCacheEntry> recovery_target_entries;
};'''),(
  '  ReleaseAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request,',
  '''  StageAuxUiCacheRecovery(mojo_base.mojom.UnguessableToken request,
      mojo_base.mojom.UnguessableToken token,
      array<AuxUiCacheEntry> expected_current,
      array<AuxUiCacheEntry> recorded_source,
      array<AuxUiCacheEntry> recorded_target) => (AuxUiCacheReply reply);
  RestoreAuxUiCacheRecovery(mojo_base.mojom.UnguessableToken request,
      mojo_base.mojom.UnguessableToken token) => (AuxUiCacheReply reply);
  ReleaseAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request,''')]),
 'third_party/blink/renderer/modules/storage/cached_storage_area.h':('native-cache-prelease-receipt-a13b',[(
  '    std::unique_ptr<StorageAreaMap> target;',
  '''    std::unique_ptr<StorageAreaMap> target;
    std::unique_ptr<StorageAreaMap> recovery_original;
    std::unique_ptr<StorageAreaMap> recovery_target;
    bool recovery_restored = false;'''),(
  '  void ReleaseAuxUiCacheMigration(const base::UnguessableToken& request,',
  '''  void StageAuxUiCacheRecovery(const base::UnguessableToken& request,
      const base::UnguessableToken& token,
      Vector<mojom::blink::AuxUiCacheEntryPtr> expected_current,
      Vector<mojom::blink::AuxUiCacheEntryPtr> recorded_source,
      Vector<mojom::blink::AuxUiCacheEntryPtr> recorded_target,
      StageAuxUiCacheRecoveryCallback callback) override;
  void RestoreAuxUiCacheRecovery(const base::UnguessableToken& request,
      const base::UnguessableToken& token,
      RestoreAuxUiCacheRecoveryCallback callback) override;
  void ReleaseAuxUiCacheMigration(const base::UnguessableToken& request,''')]),
 'third_party/blink/renderer/modules/storage/cached_storage_area.cc':('native-cache-prelease-receipt-a13b',[(
  '    const auto& expected = held.published ? held.target : held.original;',
  '    const auto& expected = held.recovery_restored ? held.recovery_original : held.published ? held.target : held.original;'),(
  '''  if (held.target) reply->staged_entries = AuxCacheWireEntries(AuxSelectedCacheEntries(*held.target, !IsSessionStorage()));
  return reply;''',
  '''  if (held.target) reply->staged_entries = AuxCacheWireEntries(AuxSelectedCacheEntries(*held.target, !IsSessionStorage()));
  reply->recovery_prepared = !!held.recovery_original;
  reply->recovery_restored = held.recovery_restored;
  if (held.recovery_original) reply->recovery_source_entries = AuxCacheWireEntries(AuxSelectedCacheEntries(*held.recovery_original, !IsSessionStorage()));
  if (held.recovery_target) reply->recovery_target_entries = AuxCacheWireEntries(AuxSelectedCacheEntries(*held.recovery_target, !IsSessionStorage()));
  return reply;'''),(
  '  if (!reply->ok || aux_ui_cache_lease_->published) {',
  '  if (!reply->ok || aux_ui_cache_lease_->published || aux_ui_cache_lease_->recovery_original) {'),(
  '  if (!reply->ok || !aux_ui_cache_lease_->target) {',
  '  if (!reply->ok || !aux_ui_cache_lease_->target || aux_ui_cache_lease_->recovery_original) {'),(
  '''  if (!reply->ok) { std::move(callback).Run(std::move(reply)); return; }
  map_ = AuxCloneCacheMap(*aux_ui_cache_lease_->original);''',
  '''  if (!reply->ok || aux_ui_cache_lease_->recovery_original) {
    reply->ok = false; std::move(callback).Run(std::move(reply)); return;
  }
  map_ = AuxCloneCacheMap(*aux_ui_cache_lease_->original);'''),(
  'void CachedStorageArea::ReleaseAuxUiCacheMigration(',
  (HERE/'renderer.inc').read_text()+'void CachedStorageArea::ReleaseAuxUiCacheMigration(')]),
 'components/services/storage/dom_storage/aux_ui_cache_cohort.h':('native-cohort-compile-fix-a17c',[(
  '  void Publish(Callback callback);',
  '''  void StageRecovery(const Entries& source, const Entries& target, Callback callback);
  void RestoreRecovery(Callback callback);
  void Publish(Callback callback);'''),(
  'enum class Operation { kPrepare, kRead, kValidate, kStage, kPublish, kRestore, kRelease };',
  'enum class Operation { kPrepare, kRead, kValidate, kStage, kPublish, kRestore, kRelease, kRecoveryStage, kRecoveryRestore };'),(
  '  Entries expected_target_;',
  '''  Entries expected_target_;
  bool recovery_plan_set_ = false;
  Entries recovery_source_;
  Entries recovery_target_;''')]),
 'components/services/storage/dom_storage/aux_ui_cache_cohort.cc':('native-cohort-compile-fix-a17c',[(
  'void AuxUiCacheCohort::Publish(Callback callback)',
  '''void AuxUiCacheCohort::StageRecovery(const Entries& source, const Entries& target, Callback callback) {
  if (recovery_plan_set_ && (!SameEntries(source, recovery_source_) || !SameEntries(target, recovery_target_))) {
    std::move(callback).Run(DbStatus::IOError("Original recovery cache plan is immutable")); return;
  }
  recovery_plan_set_ = true; recovery_source_ = CloneEntries(source); recovery_target_ = CloneEntries(target);
  Run(Operation::kRecoveryStage, source, target, std::move(callback));
}
void AuxUiCacheCohort::RestoreRecovery(Callback callback) { Run(Operation::kRecoveryRestore, {}, {}, std::move(callback)); }
void AuxUiCacheCohort::Publish(Callback callback)'''),(
  '''  if (!request_ || pending_ || (operation != Operation::kRelease && !SameEndpoints()) ||''',
  '''  if (!request_ || pending_ || (operation != Operation::kRelease && !SameEndpoints()) ||
      ((operation == Operation::kRecoveryStage || operation == Operation::kRecoveryRestore) && !prepared_) ||
      (recovery_plan_set_ && (operation == Operation::kStage || operation == Operation::kPublish || operation == Operation::kRestore)) ||
      (operation == Operation::kRecoveryRestore && !recovery_plan_set_) ||'''),(
  '''      case Operation::kRelease: NOTREACHED();''',
  '''      case Operation::kRecoveryStage:
        if (!node.original) { OneDone(DbStatus::IOError("Fresh actual cache source missing")); break; }
        observer->StageAuxUiCacheRecovery(*request_, *node.token,
            CloneEntries(node.original->source_entries), CloneEntries(source), CloneEntries(target), std::move(reply)); break;
      case Operation::kRecoveryRestore: observer->RestoreAuxUiCacheRecovery(*request_, *node.token, std::move(reply)); break;
      case Operation::kRelease: NOTREACHED();'''),(
  '''  if (operation == Operation::kStage &&
      (reply->published''',
  '''  if (recovery_plan_set_ && (!reply->recovery_prepared ||
      !SameEntries(reply->recovery_source_entries, recovery_source_) ||
      !SameEntries(reply->recovery_target_entries, recovery_target_) ||
      (operation == Operation::kRecoveryStage && reply->recovery_restored) ||
      (operation == Operation::kRecoveryRestore && !reply->recovery_restored))) {
    node.report = std::move(reply);
    OneDone(DbStatus::IOError("Actual separate journal-original cache readback differs")); return;
  }
  if (operation == Operation::kStage &&
      (reply->published'''),(
  '    expected_source_.clear(); expected_target_.clear();',
  '''    expected_source_.clear(); expected_target_.clear();
    recovery_plan_set_ = false; recovery_source_.clear(); recovery_target_.clear();''')]),
 'components/services/storage/dom_storage/async_dom_storage_database.h':('native-recovery-requalification-a17b',[(
  'enum class AuxUiCacheOperation { kRead, kValidate, kStage, kPublish, kRestore, kRelease };',
  'enum class AuxUiCacheOperation { kRead, kValidate, kStage, kPublish, kRestore, kRelease, kRecoveryStage, kRecoveryRestore };')]),
 'components/services/storage/dom_storage/storage_area_impl.cc':('native-cache-cohort-integration-a9',[(
  '    case Operation::kPublish: participant->Publish(std::move(reply)); break;',
  '''    case Operation::kRecoveryStage: {
      if (!aux_cache_map_) { std::move(reply).Run(DbStatus::IOError("Recorded recovery map missing")); return; }
      auto source = AuxUiCacheCohort::DecodeSelected(aux_cache_map_->source, aux_cache_map_->session_ids.empty());
      auto target = AuxUiCacheCohort::DecodeSelected(aux_cache_map_->target, aux_cache_map_->session_ids.empty());
      if (!source.has_value() || !target.has_value()) {
        std::move(reply).Run(DbStatus::NotSupported("Recovery original codec refused")); return;
      }
      participant->StageRecovery(source.value(), target.value(), std::move(reply)); break;
    }
    case Operation::kRecoveryRestore: participant->RestoreRecovery(std::move(reply)); break;
    case Operation::kPublish: participant->Publish(std::move(reply)); break;''')]),
}
# Existing test observers must implement the newly generated finite methods.
# They explicitly refuse; they are not runtime acceptance fixtures.
for path in ['components/services/storage/dom_storage/test_support/storage_area_test_util.h']:
 root=PARENT/'native-renderer-cache-lease-a8'/'source';text=(root/path).read_text()
 anchor='  void ReleaseAuxUiCacheMigration('
 indent='  '
 if anchor not in text:
  anchor='    void ReleaseAuxUiCacheMigration(';indent='    '
 assert text.count(anchor)==1,(path,text.count(anchor))
 api='blink::mojom::AuxUiCacheEntryPtr'
 methods=f'''{indent}void StageAuxUiCacheRecovery(const base::UnguessableToken&,
{indent}    const base::UnguessableToken&, std::vector<{api}>,
{indent}    std::vector<{api}>, std::vector<{api}>,
{indent}    StageAuxUiCacheRecoveryCallback callback) override {{
{indent}  std::move(callback).Run(blink::mojom::AuxUiCacheReply::New());
{indent}}}
{indent}void RestoreAuxUiCacheRecovery(const base::UnguessableToken&,
{indent}    const base::UnguessableToken&, RestoreAuxUiCacheRecoveryCallback callback) override {{
{indent}  std::move(callback).Run(blink::mojom::AuxUiCacheReply::New());
{indent}}}
'''
 changes[path]=('native-renderer-cache-lease-a8',[(anchor,methods+anchor)])
rows=[];patch=[]
for path,(base,edits) in changes.items():
 root=PARENT/base/'source';data=(root/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:80],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(root),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-cache-recovery-original.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':sum(len(r['anchors']) for r in rows)}))

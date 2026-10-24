"""Generate the four service owners using the frozen real A9 native APIs."""
def add_implementations(ROOT,HERE,project,edit):
 helpers='''namespace {
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseFailure(
    const std::optional<base::UnguessableToken>& request,
    const AsyncDomStorageDatabase::AuxUiMigrationLease* lease,
    std::string error) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->held = request.has_value();
  reply->request_id = request;
  if (lease) reply->token = lease->token();
  reply->error = std::move(error);
  return reply;
}
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseReleased(
    const base::UnguessableToken& request, const base::UnguessableToken& token) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  // Successful correlated observation only. No source_ready/cache/map or
  // ordinary writer readiness is inferred after the actual owner reopened.
  reply->ok = true;
  reply->held = false;
  reply->source_ready = false;
  reply->released = true;
  reply->request_id = request;
  reply->token = token;
  return reply;
}
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseSnapshot(
    const base::UnguessableToken& request,
    const AsyncDomStorageDatabase::AuxUiMigrationLease& lease,
    AsyncDomStorageDatabase::AuxUiSnapshot snapshot) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->ok = snapshot.source_ready && snapshot.native_error.empty();
  reply->held = true;
  reply->request_id = request;
  reply->token = lease.token();
  reply->error = std::move(snapshot.native_error);
  reply->matches_source = snapshot.matches_source;
  reply->matches_target = snapshot.matches_target;
  reply->file_data_synced = snapshot.file_data_synced;
  reply->ordinary_work_queued = snapshot.ordinary_work_queued;
  reply->target_attempted = snapshot.target_attempted;
  reply->source_ready = snapshot.source_ready;
  reply->private_target_staged = snapshot.private_target_staged;
  reply->cache_published = snapshot.cache_published;
  reply->source_topology_sha256 = std::move(snapshot.source_topology_sha256);
  reply->target_topology_sha256 = std::move(snapshot.target_topology_sha256);
  for (auto& map : snapshot.maps) {
    auto output = mojom::AuxUiDomMapSnapshot::New();
    output->storage_key = std::move(map.storage_key);
    output->session_ids = std::move(map.session_ids);
    output->map_ordinal = map.map_ordinal;
    output->map_id = map.map_id;
    output->source_persisted = map.source_persisted;
    output->source_map_sha256 = std::move(map.source_map_sha256);
    output->target_map_sha256 = std::move(map.target_map_sha256);
    for (auto& [key, value] : map.source)
      output->source_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    for (auto& [key, value] : map.target)
      output->target_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    for (auto& view : map.cache_views) {
      auto cached = mojom::AuxUiDomCacheView::New();
      cached->namespace_id = std::move(view.namespace_id);
      cached->cache = blink::mojom::AuxUiCacheReply::New();
      cached->cache->ok = reply->ok;
      cached->cache->held = true;
      cached->cache->tainted = !reply->ok;
      cached->cache->error = reply->error;
      cached->cache->request_id = request;
      cached->cache->published = view.published;
      // No private observer token is exported. Native controller joins these
      // factual frame/document stamps to the actual held browser documents.
      for (auto& document : view.documents)
        cached->cache->sources.push_back(blink::mojom::AuxUiCacheDocument::New(
            document.source_id, document.frame, document.document));
      for (const auto& [key, value] : view.source)
        cached->cache->source_entries.push_back(blink::mojom::AuxUiCacheEntry::New(
            std::vector<uint16_t>(key.begin(), key.end()),
            std::vector<uint16_t>(value.begin(), value.end())));
      for (const auto& [key, value] : view.staged)
        cached->cache->staged_entries.push_back(blink::mojom::AuxUiCacheEntry::New(
            std::vector<uint16_t>(key.begin(), key.end()),
            std::vector<uint16_t>(value.begin(), value.end())));
      output->cache_views.push_back(std::move(cached));
    }
    reply->maps.push_back(std::move(output));
  }
  return reply;
}
bool ConvertAuxDomTargets(std::vector<mojom::AuxUiDomTargetMapPtr> input,
    std::vector<AsyncDomStorageDatabase::AuxUiTargetMap>* output) {
  std::set<uint32_t> ordinals;
  std::vector<AsyncDomStorageDatabase::AuxUiTargetMap> converted;
  for (auto& map : input) {
    if (!map || !ordinals.insert(map->map_ordinal).second) return false;
    AsyncDomStorageDatabase::AuxUiTargetMap target;
    target.map_ordinal = map->map_ordinal;
    for (auto& entry : map->desired_selected_entries) {
      if (!entry || !target.desired_selected_entries.emplace(
              std::move(entry->key), std::move(entry->value)).second) return false;
    }
    converted.push_back(std::move(target));
  }
  *output = std::move(converted);
  return true;
}
}  // namespace

'''
 for kind in ['local','session']:
  cls=kind.title()+'StorageImpl';prefix='components/services/storage/dom_storage/'+kind+'_storage_impl'
  header=(ROOT/(prefix+'.h')).read_text();start=header.index('  void BeginAuxUiPreferenceLease(');end=header.index('\n\n',start)
  declarations='''  void BeginAuxUiPreferenceLease(const base::UnguessableToken& request_id, BeginAuxUiPreferenceLeaseCallback callback) override;
  void ReadAuxUiPreferenceLease(const base::UnguessableToken& request_id, ReadAuxUiPreferenceLeaseCallback callback) override;
  void ValidateAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, ValidateAuxUiPreferenceLeaseCallback callback) override;
  void StageAuxUiPreferenceTargets(const base::UnguessableToken& request_id, const base::UnguessableToken& token, std::vector<mojom::AuxUiDomTargetMapPtr> targets, StageAuxUiPreferenceTargetsCallback callback) override;
  void CommitAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, CommitAuxUiPreferenceLeaseCallback callback) override;
  void RestoreAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, RestoreAuxUiPreferenceLeaseCallback callback) override;
  void PublishAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, PublishAuxUiPreferenceLeaseCallback callback) override;
  void ReleaseAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, ReleaseAuxUiPreferenceLeaseCallback callback) override;'''
  old='''  std::optional<base::UnguessableToken> aux_ui_request_;
  std::unique_ptr<AsyncDomStorageDatabase::AuxUiMigrationLease> aux_ui_lease_;'''
  members='''  enum class AuxUiOperation { kRead, kValidate, kCommit, kRestore, kPublish };
  using AuxUiReplyCallback = base::OnceCallback<void(mojom::AuxUiDomLeaseReplyPtr)>;
  bool OwnsAuxUiLease(const base::UnguessableToken&, const base::UnguessableToken&, uint64_t generation) const;
  void RunAuxUiOperation(const base::UnguessableToken&, const base::UnguessableToken&, AuxUiOperation, AuxUiReplyCallback);
  static void CompleteAuxUiOperation(base::WeakPtr<@CLASS@>, base::UnguessableToken, base::UnguessableToken, uint64_t, AuxUiReplyCallback, StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot>);
  static DbStatus BeforeAuxUiLeaseReopen(base::WeakPtr<@CLASS@>, base::UnguessableToken, base::UnguessableToken, uint64_t);
  static void AuxUiLeaseReleased(base::WeakPtr<@CLASS@>, base::UnguessableToken, base::UnguessableToken, uint64_t, ReleaseAuxUiPreferenceLeaseCallback, DbStatus);
  std::optional<base::UnguessableToken> aux_ui_request_;
  std::unique_ptr<AsyncDomStorageDatabase::AuxUiMigrationLease> aux_ui_lease_;
  uint64_t aux_ui_generation_ = 0;
  bool aux_ui_release_pending_ = false;
  struct AuxUiReleasedReceipt {
    base::UnguessableToken request, token;
    uint64_t generation;
  };
  std::optional<AuxUiReleasedReceipt> aux_ui_released_;
  // Bounded process-local tombstones prevent old successful request replay
  // after the one detailed release observation has advanced to a newer attempt.
  std::set<base::UnguessableToken> aux_ui_retired_requests_;'''.replace('@CLASS@',cls)
  if kind=='session':members+='''
  bool ResumeAuxUiNamespaces(const base::UnguessableToken&);
  bool ReholdAuxUiNamespaces(const base::UnguessableToken&);
  std::vector<std::string> aux_ui_frozen_namespaces_;
  bool aux_ui_namespaces_resumed_ = false;
  std::string aux_ui_namespace_error_;'''
  header_edits=[edit('Complete finite native control overrides',header[start:end],declarations),edit('Opaque lease generation and actual async release callbacks',old,members)]
  if kind=='local':header_edits.append(edit('Explicit weak callback owner dependency','#include "base/memory/raw_ptr.h"','#include "base/memory/raw_ptr.h"\n#include "base/memory/weak_ptr.h"'))
  if kind=='session':header_edits.append(edit('Explicit bounded replay tombstone dependency','#include <optional>','#include <optional>\n#include <set>'))
  project(prefix+'.h',header_edits)
  begin='''void @CLASS@::BeginAuxUiPreferenceLease(
    const base::UnguessableToken& request_id,
    BeginAuxUiPreferenceLeaseCallback callback) {
  if (aux_ui_released_ && aux_ui_released_->request == request_id) {
    if (aux_ui_released_->generation == aux_ui_generation_)
      std::move(callback).Run(AuxDomLeaseReleased(request_id, aux_ui_released_->token));
    else
      std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
          "Retired original DOM request cannot prepare again"));
    return;
  }
  if (aux_ui_retired_requests_.contains(request_id) ||
      aux_ui_retired_requests_.size() >= 64) {
    std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
        "Retired original request or native transaction history limit"));
    return;
  }
  if (request_id.is_empty() || aux_ui_request_ ||
      aux_ui_generation_ == std::numeric_limits<uint64_t>::max() ||
      connection_state_ != CONNECTION_FINISHED || !database_ || in_memory_ ||
      storage_partition_directory_.empty()) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Existing disk backend required; discover the exact held request instead of rerunning Begin"));
    return;
  }
@PREFLIGHT@  aux_ui_request_ = request_id;
  const uint64_t generation = ++aux_ui_generation_;
@FREEZE@  database_->BeginAuxUiMigrationLease(base::BindOnce(
      [](base::WeakPtr<@CLASS@> owner, base::UnguessableToken request,
         uint64_t generation, BeginAuxUiPreferenceLeaseCallback callback,
         StatusOr<std::unique_ptr<AsyncDomStorageDatabase::AuxUiMigrationLease>> lease,
         AsyncDomStorageDatabase::AuxUiSnapshot snapshot) {
        if (!owner || owner->aux_ui_request_ != request ||
            owner->aux_ui_generation_ != generation) {
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
          return;
        }
        if (lease.has_value() && !lease.value()) {
          // An impossible/unknown native result cannot erase original custody.
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr,
              "Native DOM lease result omitted its retained owner"));
          return;
        }
        if (!lease.has_value()) {
@NOLEASE@          std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, nullptr,
              lease.error().ToString()));
          return;
        }
        // A real held lease remains discoverable even if cache preparation
        // refused or its result is uncertain. Never reset it for source_ready=false.
        owner->aux_ui_lease_ = std::move(lease).value();
        std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(snapshot)));
      }, weak_ptr_factory_.GetWeakPtr(), request_id, generation, std::move(callback)));
}
'''
  preflight=freeze=''
  nolease='          owner->aux_ui_request_.reset();\n'
  if kind=='session':
   preflight='''  for (const auto& [id, space] : namespaces_) {
    if (!space->CanFreezeAuxUiMigrationNamespace()) {
      std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
          "Session namespace has unresolved clone/population/bind work"));
      return;
    }
  }
'''
   freeze='''  for (const auto& [id, space] : namespaces_) {
    if (!space->FreezeAuxUiMigrationNamespace(request_id)) {
      if (ResumeAuxUiNamespaces(request_id)) {
        aux_ui_frozen_namespaces_.clear();
        aux_ui_namespaces_resumed_ = false;
        aux_ui_namespace_error_.clear();
        aux_ui_request_.reset();
      }
      std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, nullptr,
          "Native session namespace freeze changed after preflight"));
      return;
    }
    aux_ui_frozen_namespaces_.push_back(id);
  }
'''
   nolease='''          if (owner->ResumeAuxUiNamespaces(request)) {
            owner->aux_ui_frozen_namespaces_.clear();
            owner->aux_ui_namespaces_resumed_ = false;
            owner->aux_ui_namespace_error_.clear();
            owner->aux_ui_request_.reset();
          }
'''
  code=helpers+begin.replace('@CLASS@',cls).replace('@PREFLIGHT@',preflight).replace('@FREEZE@',freeze).replace('@NOLEASE@',nolease)
  code+='''bool @CLASS@::OwnsAuxUiLease(const base::UnguessableToken& request,
    const base::UnguessableToken& token, uint64_t generation) const {
  return aux_ui_request_ == request && aux_ui_lease_ && database_ &&
      aux_ui_lease_->token() == token && aux_ui_generation_ == generation;
}
void @CLASS@::CompleteAuxUiOperation(base::WeakPtr<@CLASS@> owner,
    base::UnguessableToken request, base::UnguessableToken token,
    uint64_t generation, AuxUiReplyCallback callback,
    StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> result) {
  if (!owner || !owner->OwnsAuxUiLease(request, token, generation)) {
    std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
  } else if (!result.has_value()) {
    std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(), result.error().ToString()));
  } else {
@NAMESPACEERROR@    std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(result).value()));
  }
}
void @CLASS@::RunAuxUiOperation(const base::UnguessableToken& request,
    const base::UnguessableToken& token, AuxUiOperation operation,
    AuxUiReplyCallback callback) {
  if (!OwnsAuxUiLease(request, token, aux_ui_generation_) || aux_ui_release_pending_) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact original native-held lease required; release may still be pending"));
    return;
  }
  auto completed = base::BindOnce(&@CLASS@::CompleteAuxUiOperation,
      weak_ptr_factory_.GetWeakPtr(), request, token, aux_ui_generation_, std::move(callback));
  switch (operation) {
    case AuxUiOperation::kRead: database_->ReadAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kValidate: database_->ValidateAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kCommit: database_->CommitAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kRestore: database_->RestoreAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kPublish: database_->PublishAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
  }
}
'''.replace('@CLASS@',cls).replace('@NAMESPACEERROR@','''    if (!owner->aux_ui_namespace_error_.empty()) {
      result.value().native_error = owner->aux_ui_namespace_error_;
      result.value().source_ready = false;
    }
'''if kind=='session'else'')
  for name in ['Read','Validate','Commit','Restore','Publish']:
   args='const base::UnguessableToken& request_id, '
   if name!='Read':args+='const base::UnguessableToken& token, '
   args+=name+'AuxUiPreferenceLeaseCallback callback'
   token='aux_ui_lease_ ? aux_ui_lease_->token() : base::UnguessableToken()'if name=='Read'else'token'
   observed=''
   if name=='Read':observed='''  if (aux_ui_released_ && aux_ui_released_->request == request_id &&
      aux_ui_released_->generation == aux_ui_generation_) {
    std::move(callback).Run(AuxDomLeaseReleased(request_id, aux_ui_released_->token));
    return;
  }
'''
   code+=f'''void {cls}::{name}AuxUiPreferenceLease({args}) {{
{observed}  RunAuxUiOperation(request_id, {token}, AuxUiOperation::k{name}, std::move(callback));
}}
'''
  code+='''void @CLASS@::StageAuxUiPreferenceTargets(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    std::vector<mojom::AuxUiDomTargetMapPtr> targets,
    StageAuxUiPreferenceTargetsCallback callback) {
  std::vector<AsyncDomStorageDatabase::AuxUiTargetMap> converted;
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_ ||
      !ConvertAuxDomTargets(std::move(targets), &converted)) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact lease and unique captured ordinals/raw selected keys required"));
    return;
  }
  database_->StageAuxUiMigrationTargets(*aux_ui_lease_, std::move(converted),
      base::BindOnce(&@CLASS@::CompleteAuxUiOperation, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_, std::move(callback)));
}
DbStatus @CLASS@::BeforeAuxUiLeaseReopen(base::WeakPtr<@CLASS@> owner,
    base::UnguessableToken request, base::UnguessableToken token, uint64_t generation) {
  if (!owner || !owner->aux_ui_release_pending_ ||
      !owner->OwnsAuxUiLease(request, token, generation))
    return DbStatus::IOError("Exact native service release owner changed");
@RESUME@  return DbStatus::OK();
}
void @CLASS@::AuxUiLeaseReleased(base::WeakPtr<@CLASS@> owner,
    base::UnguessableToken request, base::UnguessableToken token, uint64_t generation,
    ReleaseAuxUiPreferenceLeaseCallback callback, DbStatus status) {
  if (!owner || !owner->OwnsAuxUiLease(request, token, generation)) {
    std::move(callback).Run(false); return;
  }
  owner->aux_ui_release_pending_ = false;
  if (!status.ok()) {
@REHOLD@    std::move(callback).Run(false); return;
  }
@CLEAR@  // Record only after the actual asynchronous backend/cache/namespace
  // cleanup succeeded; a lost Mojo reply can then be discovered without rerun.
  owner->aux_ui_retired_requests_.insert(request);
  owner->aux_ui_released_ = AuxUiReleasedReceipt{request, token, generation};
  owner->aux_ui_lease_.reset();
  owner->aux_ui_request_.reset();
  std::move(callback).Run(true);
}
void @CLASS@::ReleaseAuxUiPreferenceLease(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    ReleaseAuxUiPreferenceLeaseCallback callback) {
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_) {
    std::move(callback).Run(false); return;
  }
  aux_ui_release_pending_ = true;
  // Only this concrete native service constructs the synchronous prerequisite;
  // no readiness callback, root or restore map comes from Mojo/UI callers.
  database_->ReleaseAuxUiMigrationLease(*aux_ui_lease_,
      base::BindOnce(&@CLASS@::BeforeAuxUiLeaseReopen, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_),
      base::BindOnce(&@CLASS@::AuxUiLeaseReleased, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_, std::move(callback)));
}

'''.replace('@CLASS@',cls).replace('@RESUME@','''  if (!owner->ResumeAuxUiNamespaces(request))
    return DbStatus::IOError(owner->aux_ui_namespace_error_);
'''if kind=='session'else'').replace('@REHOLD@','''    if (owner->aux_ui_namespaces_resumed_) owner->ReholdAuxUiNamespaces(request);
'''if kind=='session'else'').replace('@CLEAR@','''  owner->aux_ui_frozen_namespaces_.clear();
  owner->aux_ui_namespaces_resumed_ = false;
  owner->aux_ui_namespace_error_.clear();
'''if kind=='session'else'')
  if kind=='session':code+='''bool SessionStorageImpl::ReholdAuxUiNamespaces(const base::UnguessableToken& request) {
  bool held = true;
  for (const auto& id : aux_ui_frozen_namespaces_) {
    auto found = namespaces_.find(id);
    if (found == namespaces_.end() ||
        !found->second->ReholdAuxUiMigrationNamespaceAfterFailedResume(request)) held = false;
  }
  aux_ui_namespaces_resumed_ = false;
  if (!held) aux_ui_namespace_error_ = "Native namespace rehold uncertain; backend admission remains held";
  return held;
}
bool SessionStorageImpl::ResumeAuxUiNamespaces(const base::UnguessableToken& request) {
  // Preflight ALL actual retained namespace identities before changing any.
  for (const auto& id : aux_ui_frozen_namespaces_) {
    auto found = namespaces_.find(id);
    if (found == namespaces_.end() ||
        !found->second->CanResumeAuxUiMigrationNamespace(request)) {
      aux_ui_namespace_error_ = "Exact frozen namespace owner changed"; return false;
    }
  }
  std::vector<std::string> resumed;
  for (const auto& id : aux_ui_frozen_namespaces_) {
    auto found = namespaces_.find(id);
    if (!found->second->ResumeAuxUiMigrationNamespace(request)) {
      bool reheld = true;
      // Same owning task, before yielding or permitting backend ordinary work.
      for (const auto& prior : resumed) {
        auto actual = namespaces_.find(prior);
        if (actual == namespaces_.end() ||
            !actual->second->ReholdAuxUiMigrationNamespaceAfterFailedResume(request)) reheld = false;
      }
      aux_ui_namespace_error_ = reheld ? "Native namespace resume refused; exact holds restored"
          : "Native namespace rehold uncertain; backend admission remains held";
      return false;
    }
    resumed.push_back(id);
  }
  aux_ui_namespaces_resumed_ = true;
  aux_ui_namespace_error_.clear();
  return true;
}

'''
  text=(ROOT/(prefix+'.cc')).read_text();start=text.index('namespace {\nmojom::AuxUiDomLeaseReplyPtr AuxDomLeaseFailure(');end=text.index('void '+cls+'::DrainAuxUiMigration(',start)
  adds=[edit('Concrete held native cohort transaction and asynchronous release glue',text[start:end],code),edit('Explicit finite generation dependency','#include <utility>','#include <utility>\n#include <limits>')]
  if kind=='session':adds.append(edit('Duplicate ordinal conversion dependency','#include <limits>','#include <limits>\n#include <set>'))
  project(prefix+'.cc',adds)

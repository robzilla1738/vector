"""Materialize the fixed native API for parallel finite service glue."""
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
path='components/services/storage/dom_storage/async_dom_storage_database.h'
s=(ROOT/path).read_text()
EDITS=[]
def edit(before,after):
 global s
 assert s.count(before)==1,(before[:100],s.count(before))
 s=s.replace(before,after)
 EDITS.append((before,after))
edit('#include "base/check.h"','#include "base/check.h"\n#include "base/token.h"\n#include "base/memory/weak_ptr.h"\n#include "third_party/blink/public/common/tokens/tokens.h"')
edit('  // An interface that represents a source of commits.',(HERE/'async-cache-types.inc').read_text().rstrip()+'\n\n  // An interface that represents a source of commits.')
edit('    virtual base::OnceCallback<void(DbStatus)> GetCommitCompleteCallback() = 0;','    virtual base::OnceCallback<void(DbStatus)> GetCommitCompleteCallback() = 0;\n'+(HERE/'async-committer-methods.inc').read_text().rstrip())
edit('''    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> target;
  };''','''    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> target;
    uint32_t map_ordinal = 0;
    std::optional<int64_t> map_id;
    bool source_persisted = true;
    std::string source_map_sha256;
    std::string target_map_sha256;
    std::vector<AuxUiCacheView> cache_views;
  };
  struct AuxUiTargetMap {
    uint32_t map_ordinal = 0;
    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> desired_selected_entries;
  };''')
edit('''    bool target_attempted = false;
  };''','''    bool target_attempted = false;
    std::string native_error;
    bool source_ready = false;
    bool private_target_staged = false;
    bool cache_published = false;
    std::string source_topology_sha256;
    std::string target_topology_sha256;
  };''')
edit('  bool ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease);','''  void ValidateAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback);
  void StageAuxUiMigrationTargets(AuxUiMigrationLease& lease,
      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback);
  void PublishAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback);
  using AuxUiBeforeReopen = base::OnceCallback<DbStatus()>;
  void ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease,
      AuxUiBeforeReopen before_reopen, StatusCallback callback);
  void NotifyAuxUiMigrationRegistryChanged();''')
edit('  void RunAuxUiMigrationOperation(AuxUiMigrationLease& lease, int operation,\n                                  AuxUiReadCallback callback);','  void RunAuxUiMigrationOperation(AuxUiMigrationLease& lease, int operation,\n      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback);\n  struct AuxUiCacheRound;\n  bool CurrentAuxUiMigrationWriters(const std::shared_ptr<AuxUiMigrationLease::State>& state) const;\n  void RunAuxUiMigrationCaches(std::shared_ptr<AuxUiMigrationLease::State> state,\n      AuxUiCacheOperation operation, bool prepare, const AuxUiSnapshot& snapshot, StatusCallback callback);\n  void ContinueAuxUiMigrationCaches(std::shared_ptr<AuxUiCacheRound> round, DbStatus status);\n  void AttachAuxUiCacheObservations(const std::shared_ptr<AuxUiMigrationLease::State>& state,\n      AuxUiSnapshot& snapshot) const;\n  void RunAuxUiBackend(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,\n      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback);\n  void PreparedAuxUiMigration(std::shared_ptr<AuxUiMigrationLease::State> state,\n      AuxUiLeaseCallback callback, DbStatus status);\n  void CapturedAuxUiMigration(std::shared_ptr<AuxUiMigrationLease::State> state,\n      AuxUiLeaseCallback callback, StatusOr<AuxUiSnapshot> result);\n  void StagedAuxUiBegin(std::shared_ptr<AuxUiMigrationLease::State> state,\n      AuxUiLeaseCallback callback, DbStatus status);\n  void CompleteAuxUiBegin(std::shared_ptr<AuxUiMigrationLease::State> state,\n      AuxUiLeaseCallback callback, DbStatus status);\n  void CheckedAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,\n      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback, DbStatus status);\n  void BackendAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,\n      AuxUiReadCallback callback, StatusOr<AuxUiSnapshot> result);\n  void CachedAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,\n      AuxUiReadCallback callback, DbStatus status);\n  void CompleteAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state,\n      AuxUiReadCallback callback, DbStatus status);\n  void ReleasedAuxUiCaches(std::shared_ptr<AuxUiMigrationLease::State> state,\n      AuxUiBeforeReopen before_reopen, StatusCallback callback, DbStatus status);')
target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(s)
print(target)

ROWS=[(path,EDITS)]

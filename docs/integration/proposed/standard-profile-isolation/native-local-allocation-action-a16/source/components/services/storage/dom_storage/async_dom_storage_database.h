// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef COMPONENTS_SERVICES_STORAGE_DOM_STORAGE_ASYNC_DOM_STORAGE_DATABASE_H_
#define COMPONENTS_SERVICES_STORAGE_DOM_STORAGE_ASYNC_DOM_STORAGE_DATABASE_H_

#include <memory>
#include <optional>
#include <set>
#include <string>
#include <vector>

#include "base/check.h"
#include "base/token.h"
#include "base/memory/weak_ptr.h"
#include "third_party/blink/public/common/tokens/tokens.h"
#include "base/threading/sequence_bound.h"
#include "base/time/time.h"
#include "base/unguessable_token.h"
#include "base/trace_event/memory_allocator_dump_guid.h"
#include "components/services/storage/dom_storage/db_status.h"
#include "components/services/storage/dom_storage/dom_storage_database.h"
#include "components/services/storage/dom_storage/dom_storage_histogram_helper.h"
#include "third_party/blink/public/common/storage_key/storage_key.h"

namespace storage {

class AsyncDomStorageDatabase {
 public:
  using StatusCallback = base::OnceCallback<void(DbStatus)>;

  AsyncDomStorageDatabase(const AsyncDomStorageDatabase&) = delete;
  AsyncDomStorageDatabase& operator=(const AsyncDomStorageDatabase&) = delete;

  ~AsyncDomStorageDatabase();

  struct OpenOutcome {
    DbStatus open_status;
    std::optional<DomStorageDatabaseFactory::DestroyOutcome> destroy_outcome;
  };
  using OpenCallback = base::OnceCallback<void(OpenOutcome)>;

  // Creates an `AsyncDomStorageDatabase` then asynchronously opens the
  // database. Callers must wait to use `AsyncDomStorageDatabase` until
  // `callback` completes with an OK status. After failing to open,
  // `AsyncDomStorageDatabase` must be discarded.
  //
  // The new database is in-memory if `dir_to_open` is empty. If
  // `dir_to_destroy` is non-empty, the pre-existing on-disk database at that
  // location is destroyed before the new one is opened, and the destroy outcome
  // is passed to `callback`. `dir_to_destroy` may differ from `dir_to_open`.
  // E.g. recovery destroys the on-disk database then opens an in-memory DB by
  // passing an empty `dir_to_open`.
  static std::unique_ptr<AsyncDomStorageDatabase> Open(
      StorageType storage_type,
      const base::FilePath& dir_to_open,
      const std::optional<base::trace_event::MemoryAllocatorDumpGuid>&
          memory_dump_id,
      const base::FilePath& dir_to_destroy,
      OpenCallback callback);

  enum class AuxUiCacheOperation { kRead, kValidate, kStage, kPublish, kRestore, kRelease };
  struct AuxUiCacheDocument {
    base::Token source_id;
    blink::LocalFrameToken frame;
    blink::DocumentToken document;
  };
  struct AuxUiCacheView {
    std::string namespace_id;
    std::vector<AuxUiCacheDocument> documents;
    std::map<std::u16string, std::u16string> source;
    std::map<std::u16string, std::u16string> staged;
    bool published = false;
  };
  struct AuxUiMapSnapshot;

  // An interface that represents a source of commits. Practically speaking,
  // this is a `StorageAreaImpl`.
  class Committer {
   public:
    virtual std::optional<DomStorageDatabase::MapBatchUpdate>
    CollectCommit() = 0;
    virtual base::OnceCallback<void(DbStatus)> GetCommitCompleteCallback() = 0;
    // Unsupported producers refuse; actual StorageAreaImpl supplies native
    // receiver/observer custody and original map identity, not readiness input.
    virtual bool CanHoldAuxUiMigration(AsyncDomStorageDatabase* owner) const;
    virtual base::WeakPtr<Committer> GetAuxUiMigrationWeakPtr();
    virtual StatusOr<DomStorageDatabase::MapLocator> CopyAuxUiMigrationLocator() const;
    virtual void PrepareAuxUiMigrationCaches(const base::UnguessableToken& request,
                                            StatusCallback callback);
    virtual void RunAuxUiMigrationCaches(const base::UnguessableToken& request, AuxUiCacheOperation operation,
        const AuxUiMapSnapshot* map, StatusCallback callback);
    virtual std::vector<AuxUiCacheView> CopyAuxUiMigrationCacheViews() const;
    virtual bool MatchesAuxUiMigrationMap(const AuxUiMapSnapshot& map) const;
    virtual DbStatus AdoptAuxUiMigrationMap(const AuxUiMapSnapshot& map, bool target);
  };

  base::SequenceBound<std::unique_ptr<DomStorageDatabase>>& database() {
    return database_;
  }
  bool is_sqlite() const {
    CHECK(is_database_opened_);
    return is_sqlite_;
  }
  DatabaseMetricsType metrics_type() const { return metrics_type_; }

  // The functions below use `base::SequenceBound` to read and write
  // `database_` through the `DomStorageDatabase` interface. See function
  // comments in `dom_storage_database.h` for more details.
  using ReadMapKeyValuesCallback = base::OnceCallback<void(
      StatusOr<std::map<DomStorageDatabase::Key, DomStorageDatabase::Value>>)>;
  void ReadMapKeyValues(DomStorageDatabase::MapLocator map_locator,
                        ReadMapKeyValuesCallback callback);
  void CloneMap(DomStorageDatabase::MapLocator source_map,
                DomStorageDatabase::MapLocator target_map,
                StatusCallback callback);

  using ReadAllMetadataCallback =
      base::OnceCallback<void(StatusOr<DomStorageDatabase::Metadata>)>;
  void ReadAllMetadata(ReadAllMetadataCallback callback);

  void PutMetadata(DomStorageDatabase::Metadata metadata,
                   StatusCallback callback);
  void DeleteStorageKeysFromSession(
      std::string session_id,
      std::vector<blink::StorageKey> metadata_to_delete,
      std::vector<DomStorageDatabase::MapLocator> maps_to_delete,
      StatusCallback callback);
  void DeleteSessions(
      std::vector<std::string> session_ids,
      std::vector<DomStorageDatabase::MapLocator> maps_to_delete,
      StatusCallback callback);
  void PurgeOriginsForShutdown(std::set<url::Origin> origins);
  void CleanUpStaleData(StatusCallback callback);

  // Native, database-owned custody. The initial slice refuses every loaded
  // committer: changing persisted keys underneath native/renderer caches is
  // not a successful UI migration. No caller supplies a path, map or target.
  struct AuxUiMapSnapshot {
    blink::StorageKey storage_key;
    std::vector<std::string> session_ids;
    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> source;
    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> target;
    uint32_t map_ordinal = 0;
    std::optional<int64_t> map_id;
    bool source_persisted = true;
    std::string source_map_sha256;
    std::string target_map_sha256;
    std::vector<AuxUiCacheView> cache_views;
    bool allocation_requested = false;
    std::string allocation_action_sha256;
    std::optional<int64_t> allocated_map_id;
    bool allocation_observed = false;
  };
  struct AuxUiTargetMap {
    uint32_t map_ordinal = 0;
    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> desired_selected_entries;
  };
  struct AuxUiSnapshot {
    std::vector<AuxUiMapSnapshot> maps;
    bool matches_source = false;
    bool matches_target = false;
    bool file_data_synced = false;
    bool ordinary_work_queued = false;
    bool target_attempted = false;
    std::string native_error;
    bool source_ready = false;
    bool private_target_staged = false;
    bool cache_published = false;
    std::string source_topology_sha256;
    std::string target_topology_sha256;
    // Allocation action is not a physical topology digest. Until the real
    // allocator result is observed, physical target digests remain empty.
    std::string allocation_action_sha256;
  };
  class AuxUiMigrationLease {
   public:
    AuxUiMigrationLease(const AuxUiMigrationLease&) = delete;
    AuxUiMigrationLease& operator=(const AuxUiMigrationLease&) = delete;
    ~AuxUiMigrationLease();
    const base::UnguessableToken& token() const;
   private:
    friend class AsyncDomStorageDatabase;
    struct State;
    explicit AuxUiMigrationLease(std::shared_ptr<State> state);
    std::shared_ptr<State> state_;
  };
  using AuxUiLeaseCallback = base::OnceCallback<void(
      StatusOr<std::unique_ptr<AuxUiMigrationLease>>, AuxUiSnapshot)>;
  using AuxUiReadCallback = base::OnceCallback<void(StatusOr<AuxUiSnapshot>)>;
  void BeginAuxUiMigrationLease(AuxUiLeaseCallback callback);
  void ReadAuxUiMigrationLease(AuxUiMigrationLease& lease,
                               AuxUiReadCallback callback);
  void CommitAuxUiMigrationLease(AuxUiMigrationLease& lease,
                                 AuxUiReadCallback callback);
  void RestoreAuxUiMigrationLease(AuxUiMigrationLease& lease,
                                  AuxUiReadCallback callback);
  void ValidateAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback);
  void StageAuxUiMigrationTargets(AuxUiMigrationLease& lease,
      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback);
  void PublishAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback);
  using AuxUiBeforeReopen = base::OnceCallback<DbStatus()>;
  void ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease,
      AuxUiBeforeReopen before_reopen, StatusCallback callback);
  void NotifyAuxUiMigrationRegistryChanged();

  // All ordinary backend work keeps its original callback and ordering.
  // Attempted work taints a held source; it is never reported as quiescent.
  bool IsAuxUiMigrationHeld() const { return !!aux_ui_migration_gate_; }
  bool DeferForAuxUiMigration(base::OnceClosure operation);

  // Registers or unregisters `source` such that its commits will be batched
  // with other registered committers.
  void AddCommitter(Committer* source);
  void RemoveCommitter(Committer* source);

  // To be called by a committer when it has data that should be committed
  // without delay. Persists the list of pending `Commit` batches from
  // `committers_` using `RunDatabaseTask()`. After the database task, runs the
  // completed callback for each `Committer` that provided a `Commit`.
  void InitiateCommit();

  // Collects current commits and replies after previously queued DB tasks.
  // A successful reply includes their retained write status. The caller must
  // already hold writer quiescence; this does not close write admission, grant
  // migration authority or cover future renderer writes. After queued tasks,
  // the backend must acknowledge its explicit disk-sync operation.
  // A lost frontend/task returns failure, never successful completion.
  void DrainCommitsForAuxMigration(StatusCallback callback);

 private:
  explicit AsyncDomStorageDatabase(StorageType storage_type);
  void RunAuxUiMigrationOperation(AuxUiMigrationLease& lease, int operation,
      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback);
  struct AuxUiCacheRound;
  bool CurrentAuxUiMigrationWriters(const std::shared_ptr<AuxUiMigrationLease::State>& state) const;
  void RunAuxUiMigrationCaches(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiCacheOperation operation, bool prepare, const AuxUiSnapshot& snapshot, StatusCallback callback);
  void ContinueAuxUiMigrationCaches(std::shared_ptr<AuxUiCacheRound> round, DbStatus status);
  void AttachAuxUiCacheObservations(const std::shared_ptr<AuxUiMigrationLease::State>& state,
      AuxUiSnapshot& snapshot) const;
  void RunAuxUiBackend(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback);
  void PreparedAuxUiMigration(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiLeaseCallback callback, DbStatus status);
  void CapturedAuxUiMigration(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiLeaseCallback callback, StatusOr<AuxUiSnapshot> result);
  void StagedAuxUiBegin(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiLeaseCallback callback, DbStatus status);
  void CompleteAuxUiBegin(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiLeaseCallback callback, DbStatus status);
  void CheckedAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback, DbStatus status);
  void BackendAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
      AuxUiReadCallback callback, StatusOr<AuxUiSnapshot> result);
  void CachedAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
      AuxUiReadCallback callback, DbStatus status);
  void CompleteAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiReadCallback callback, DbStatus status);
  void ReleasedAuxUiCaches(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiBeforeReopen before_reopen, StatusCallback callback, DbStatus status);
  void ReleaseAuxUiMigrationGate(std::shared_ptr<AuxUiMigrationLease::State> state);

  std::string_view StorageTypeForHistograms() const;
  std::string GetHistogram(std::string_view operation) const;
  std::string GetDurationHistogram(std::string_view operation) const;

  // Runs `db_task` on the DB sequence, recording status and duration
  // histograms named after `operation`. Posts `callback` back to the calling
  // sequence.
  void RunTaskOnDbSequenceAndRecordHistograms(
      std::string_view operation,
      base::OnceCallback<DbStatus(DomStorageDatabase*)> db_task,
      StatusCallback callback);

  // Overload for operations returning StatusOr<T>.
  template <typename T>
  void RunTaskOnDbSequenceAndRecordHistograms(
      std::string_view operation,
      base::OnceCallback<StatusOr<T>(DomStorageDatabase*)> db_task,
      base::OnceCallback<void(StatusOr<T>)> callback);

  // Callback from DomStorageDatabaseFactory::Open(). Stores the opened
  // database and its resolved configuration. Then, runs `callback` with the
  // `DbStatus` from opening the database and the destroy outcome, if any.
  void OnDatabaseOpened(OpenCallback callback,
                        DomStorageDatabaseFactory::OpenResult result);

  // `database_` and `is_sqlite_` must not be used until `is_database_opened_`
  // is true.
  bool is_database_opened_ = false;
  bool aux_on_disk_ = false;
  std::shared_ptr<AuxUiMigrationLease::State> aux_ui_migration_gate_;
  base::SequenceBound<std::unique_ptr<DomStorageDatabase>> database_;
  bool is_sqlite_ = false;

  std::set<raw_ptr<Committer>> committers_;

  const StorageType storage_type_;
  DatabaseMetricsType metrics_type_;

  // Accessed only by tasks on database_'s sequence. Shared ownership keeps
  // the status alive when already-posted work outlives this frontend.
  struct AuxMigrationWriteStatus {
    std::optional<DbStatus> first_error;
  };
  const std::shared_ptr<AuxMigrationWriteStatus> aux_migration_write_status_ =
      std::make_shared<AuxMigrationWriteStatus>();

  base::WeakPtrFactory<AsyncDomStorageDatabase> weak_ptr_factory_{this};
};

}  // namespace storage

#endif  // COMPONENTS_SERVICES_STORAGE_DOM_STORAGE_ASYNC_DOM_STORAGE_DATABASE_H_

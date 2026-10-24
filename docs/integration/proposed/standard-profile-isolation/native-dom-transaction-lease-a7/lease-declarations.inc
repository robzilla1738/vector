  // Native, database-owned custody. The initial slice refuses every loaded
  // committer: changing persisted keys underneath native/renderer caches is
  // not a successful UI migration. No caller supplies a path, map or target.
  struct AuxUiMapSnapshot {
    blink::StorageKey storage_key;
    std::vector<std::string> session_ids;
    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> source;
    std::map<DomStorageDatabase::Key, DomStorageDatabase::Value> target;
  };
  struct AuxUiSnapshot {
    std::vector<AuxUiMapSnapshot> maps;
    bool matches_source = false;
    bool matches_target = false;
    bool file_data_synced = false;
    bool ordinary_work_queued = false;
    bool target_attempted = false;
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
  bool ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease);

  // All ordinary backend work keeps its original callback and ordering.
  // Attempted work taints a held source; it is never reported as quiescent.
  bool IsAuxUiMigrationHeld() const { return !!aux_ui_migration_gate_; }
  bool DeferForAuxUiMigration(base::OnceClosure operation);

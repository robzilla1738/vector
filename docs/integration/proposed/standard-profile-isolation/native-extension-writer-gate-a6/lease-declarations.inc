  // Native-only canonical Agent LOCAL writer closure. No renderer API, path,
  // profile selector or caller-provided readiness/commit flag exists.
  class AuxUiMigrationLease {
   public:
    ~AuxUiMigrationLease();
    AuxUiMigrationLease(const AuxUiMigrationLease&) = delete;
    AuxUiMigrationLease& operator=(const AuxUiMigrationLease&) = delete;
    std::array<std::optional<std::string>, 6> CopySourceRecords() const;
   private:
    friend class StorageFrontend;
    struct State;
    AuxUiMigrationLease(std::shared_ptr<State> state,
        std::unique_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture);
    std::shared_ptr<State> state_;
    std::unique_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture_;
  };
  struct AuxUiMigrationReadback {
    AuxUiMigrationReadback();
    AuxUiMigrationReadback(AuxUiMigrationReadback&&);
    AuxUiMigrationReadback& operator=(AuxUiMigrationReadback&&);
    ~AuxUiMigrationReadback();
    std::array<std::optional<std::string>, 6> records;
    bool matches_source = false;
    bool matches_target = false;
    bool commit_file_data_synced = false;
    bool ordinary_work_queued = false;
  };
  using AuxUiMigrationLeaseResult = base::expected<
      std::unique_ptr<AuxUiMigrationLease>, value_store::ValueStore::Status>;
  using AuxUiMigrationReadbackResult = base::expected<
      AuxUiMigrationReadback, value_store::ValueStore::Status>;
  void BeginAuxUiMigrationLease(scoped_refptr<const Extension> extension,
      base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback);
  bool ValidateAuxUiMigrationLease(const AuxUiMigrationLease& lease) const;
  void CommitAuxUiMigrationLease(AuxUiMigrationLease& lease,
      base::OnceCallback<void(value_store::ValueStore::Status)> callback);
  void ReadbackAuxUiMigrationLease(AuxUiMigrationLease& lease,
      base::OnceCallback<void(AuxUiMigrationReadbackResult)> callback);
  // Before target attempt this aborts the hold. After target attempt it only
  // releases an actually synced/read-back target with no queued old work.
  // False retains both the gate and original callbacks for explicit recovery.
  bool ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease);

  // Actual native factory registrations. Session wrapper construction/COW
  // attaches its existing observer/receiver cohort to this genuine data map.
  void AddAuxUiCacheCohort(AuxUiCacheCohort* cohort);
  void RemoveAuxUiCacheCohort(AuxUiCacheCohort* cohort);
  bool CanHoldAuxUiMigration(AsyncDomStorageDatabase* owner) const override;
  base::WeakPtr<AsyncDomStorageDatabase::Committer> GetAuxUiMigrationWeakPtr() override;
  StatusOr<DomStorageDatabase::MapLocator> CopyAuxUiMigrationLocator() const override;
  void PrepareAuxUiMigrationCaches(const base::UnguessableToken& request,
                                  AsyncDomStorageDatabase::StatusCallback callback) override;
  void RunAuxUiMigrationCaches(const base::UnguessableToken& request, AsyncDomStorageDatabase::AuxUiCacheOperation operation,
      const AsyncDomStorageDatabase::AuxUiMapSnapshot* map,
      AsyncDomStorageDatabase::StatusCallback callback) override;
  std::vector<AsyncDomStorageDatabase::AuxUiCacheView> CopyAuxUiMigrationCacheViews() const override;
  bool MatchesAuxUiMigrationMap(const AsyncDomStorageDatabase::AuxUiMapSnapshot& map) const override;
  DbStatus AdoptAuxUiMigrationMap(const AsyncDomStorageDatabase::AuxUiMapSnapshot& map, bool target) override;

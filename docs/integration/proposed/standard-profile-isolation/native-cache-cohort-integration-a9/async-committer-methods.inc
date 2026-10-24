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

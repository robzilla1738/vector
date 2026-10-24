  struct AuxUiCacheSource {
    base::Token source_id;
    LocalFrameToken frame;
    DocumentToken document;
    bool operator==(const AuxUiCacheSource&) const = default;
  };
  struct AuxUiCacheLease {
    base::UnguessableToken request;
    base::UnguessableToken token = base::UnguessableToken::Create();
    Vector<AuxUiCacheSource> sources;
    std::unique_ptr<StorageAreaMap> original;
    std::unique_ptr<StorageAreaMap> target;
    Vector<base::OnceClosure> deferred;
    bool tainted = false;
    bool published = false;
  };
  bool IsAuxUiMigrationOrigin() const;
  std::optional<Vector<AuxUiCacheSource>> CollectAuxUiCacheSources() const;
  mojom::blink::AuxUiCacheReplyPtr ReadAuxUiCacheReply(
      const base::UnguessableToken& request,
      const std::optional<base::UnguessableToken>& token);
  base::OnceClosure TrackAuxStorageCallback(base::OnceClosure callback);
  void BeginAuxUiCacheMigration(const base::UnguessableToken& request,
                                BeginAuxUiCacheMigrationCallback callback) override;
  void ReadAuxUiCacheMigration(const base::UnguessableToken& request,
                               ReadAuxUiCacheMigrationCallback callback) override;
  void ValidateAuxUiCacheMigration(const base::UnguessableToken& request,
      const base::UnguessableToken& token,
      ValidateAuxUiCacheMigrationCallback callback) override;
  void StageAuxUiCacheMigration(const base::UnguessableToken& request,
      const base::UnguessableToken& token,
      Vector<mojom::blink::AuxUiCacheEntryPtr> expected_source,
      Vector<mojom::blink::AuxUiCacheEntryPtr> target,
      StageAuxUiCacheMigrationCallback callback) override;
  void PublishAuxUiCacheMigration(const base::UnguessableToken& request,
      const base::UnguessableToken& token,
      PublishAuxUiCacheMigrationCallback callback) override;
  void RestoreAuxUiCacheMigration(const base::UnguessableToken& request,
      const base::UnguessableToken& token,
      RestoreAuxUiCacheMigrationCallback callback) override;
  void ReleaseAuxUiCacheMigration(const base::UnguessableToken& request,
      const base::UnguessableToken& token,
      ReleaseAuxUiCacheMigrationCallback callback) override;

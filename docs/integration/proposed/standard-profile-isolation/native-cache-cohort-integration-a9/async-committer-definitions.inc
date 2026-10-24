bool AsyncDomStorageDatabase::Committer::CanHoldAuxUiMigration(AsyncDomStorageDatabase*) const { return false; }
base::WeakPtr<AsyncDomStorageDatabase::Committer>
AsyncDomStorageDatabase::Committer::GetAuxUiMigrationWeakPtr() { return {}; }
StatusOr<DomStorageDatabase::MapLocator>
AsyncDomStorageDatabase::Committer::CopyAuxUiMigrationLocator() const {
  return base::unexpected(DbStatus::NotSupported("Actual native map owner is not instrumented"));
}
void AsyncDomStorageDatabase::Committer::PrepareAuxUiMigrationCaches(
    const base::UnguessableToken&, StatusCallback callback) {
  std::move(callback).Run(DbStatus::NotSupported("Actual cache owner is not instrumented"));
}
void AsyncDomStorageDatabase::Committer::RunAuxUiMigrationCaches(
    const base::UnguessableToken&, AuxUiCacheOperation, const AuxUiMapSnapshot*, StatusCallback callback) {
  std::move(callback).Run(DbStatus::NotSupported("Actual cache owner is not instrumented"));
}
std::vector<AsyncDomStorageDatabase::AuxUiCacheView>
AsyncDomStorageDatabase::Committer::CopyAuxUiMigrationCacheViews() const { return {}; }
bool AsyncDomStorageDatabase::Committer::MatchesAuxUiMigrationMap(const AuxUiMapSnapshot&) const { return false; }
DbStatus AsyncDomStorageDatabase::Committer::AdoptAuxUiMigrationMap(const AuxUiMapSnapshot&, bool) {
  return DbStatus::NotSupported("Actual native cache adoption is not instrumented");
}
void AsyncDomStorageDatabase::NotifyAuxUiMigrationRegistryChanged() {
  if (aux_ui_migration_gate_) aux_ui_migration_gate_->tainted = true;
}

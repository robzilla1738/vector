bool StorageAreaImpl::ObserveAuxUiMigrationCachePhase(
    const AsyncDomStorageDatabase::AuxUiMapSnapshot& map, bool target) const {
  if (!MatchesAuxUiMigrationMap(map) || has_pending_load_tasks() || commit_batch_ ||
      commit_batches_in_flight_ || !database_ || !database_->IsAuxUiMigrationHeld() ||
      !aux_cache_request_ || aux_cache_holds_.empty()) return false;
  const auto& expected = target ? map.target : map.source;
  const bool local = map_locator_->session_ids().empty();
  size_t found = 0;
  if (map_state_ == MapState::LOADED_KEYS_AND_VALUES) {
    for (const auto& [key, value] : keys_values_map_) {
      if (!AuxUiCacheCohort::IsReviewedKey(key, local)) continue;
      auto entry = expected.find(key);
      if (entry == expected.end() || entry->second != value) return false;
      ++found;
    }
    if (found != expected.size()) return false;
  } else if (map_state_ == MapState::LOADED_KEYS_ONLY) {
    for (const auto& [key, size] : keys_only_map_) {
      if (!AuxUiCacheCohort::IsReviewedKey(key, local)) continue;
      auto entry = expected.find(key);
      if (entry == expected.end() || entry->second.size() != size) return false;
      ++found;
    }
    if (found != expected.size()) return false;
  } else if (map_state_ != MapState::UNLOADED) {
    return false;
  }
  // Every real wrapper is retained, including actual zero-renderer cohorts.
  // No absent wrapper or generic all_of(empty) can certify a phase.
  if (aux_cache_holds_.size() != aux_cache_participants_.size() + 1) return false;
  for (const auto& participant : aux_cache_holds_)
    if (!participant || !participant->ObserveHeldPhase(*aux_cache_request_, target)) return false;
  return true;
}

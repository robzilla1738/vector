void CachedStorageArea::StageAuxUiCacheRecovery(
    const base::UnguessableToken& request, const base::UnguessableToken& token,
    Vector<mojom::blink::AuxUiCacheEntryPtr> expected_current,
    Vector<mojom::blink::AuxUiCacheEntryPtr> recorded_source,
    Vector<mojom::blink::AuxUiCacheEntryPtr> recorded_target,
    StageAuxUiCacheRecoveryCallback callback) {
  auto reply = ReadAuxUiCacheReply(request, token);
  if (!reply->ok || aux_ui_cache_lease_->published || aux_ui_cache_lease_->recovery_restored) {
    reply->ok = false; std::move(callback).Run(std::move(reply)); return;
  }
  auto current = AuxCacheReadEntries(expected_current, !IsSessionStorage());
  auto source = AuxCacheReadEntries(recorded_source, !IsSessionStorage());
  auto target = AuxCacheReadEntries(recorded_target, !IsSessionStorage());
  const auto actual = AuxSelectedCacheEntries(*aux_ui_cache_lease_->original, !IsSessionStorage());
  if (!current || !source || !target || *current != actual ||
      (actual != *source && actual != *target) || !AuxCacheCurrentTarget(*target, !IsSessionStorage())) {
    reply->ok = false; reply->error = "Fresh actual cache differs from recorded native alternatives";
    std::move(callback).Run(std::move(reply)); return;
  }
  auto& held = *aux_ui_cache_lease_;
  if (held.recovery_original) {
    if (AuxSelectedCacheEntries(*held.recovery_original, !IsSessionStorage()) != *source ||
        AuxSelectedCacheEntries(*held.recovery_target, !IsSessionStorage()) != *target) {
      reply->ok = false; reply->error = "Original recovery cache plan cannot be replaced";
    }
    std::move(callback).Run(std::move(reply)); return;
  }
  auto build = [&](const std::map<std::u16string, std::u16string>& selected)
      -> std::unique_ptr<StorageAreaMap> {
    auto result = AuxCloneCacheMap(*held.original);
    for (const auto& [key, value] : actual) result->RemoveItem(AuxCacheString(key), nullptr);
    for (const auto& [key, value] : selected)
      if (!result->SetItem(AuxCacheString(key), AuxCacheString(value), nullptr)) return nullptr;
    return result;
  };
  auto original = build(*source); auto destination = build(*target);
  if (!original || !destination) {
    reply->ok = false; reply->error = "Actual recovery cache quota refused";
    std::move(callback).Run(std::move(reply)); return;
  }
  // Fresh original is immutable. Journal original is separately retained;
  // neither ordinary reads nor callbacks/events change during preparation.
  held.recovery_original = std::move(original);
  held.recovery_target = std::move(destination);
  std::move(callback).Run(ReadAuxUiCacheReply(request, token));
}
void CachedStorageArea::RestoreAuxUiCacheRecovery(
    const base::UnguessableToken& request, const base::UnguessableToken& token,
    RestoreAuxUiCacheRecoveryCallback callback) {
  auto reply = ReadAuxUiCacheReply(request, token);
  if (!reply->ok || !aux_ui_cache_lease_->recovery_original) {
    reply->ok = false; std::move(callback).Run(std::move(reply)); return;
  }
  // The native owner must first restore/sync/read back the original physical
  // data under explicit recovery intent. This RPC supplies no such authority.
  map_ = AuxCloneCacheMap(*aux_ui_cache_lease_->recovery_original);
  aux_ui_cache_lease_->recovery_restored = true;
  std::move(callback).Run(ReadAuxUiCacheReply(request, token));
}

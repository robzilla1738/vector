// Exact current StorageArea target codec, pinned to actual GetKeyFormat(),
// GetValueFormat() and StringToUint8Vector(). This is target policy, never a
// guessed database/map-format observation. Existing untouched raw bytes stay exact.
std::optional<std::u16string> TargetLogicalKey(const std::vector<uint8_t>& raw, bool local) {
  auto bytes = base::span(raw);
  bool utf16 = false;
  if (local) {
    if (bytes.empty() || bytes.front() > 1) return std::nullopt;
    utf16 = bytes.front() == 0; bytes = bytes.subspan(1);
  } else utf16 = bytes.size() >= 2 && (bytes[0] == 0 || bytes[1] == 0);
  std::u16string key;
  if (utf16) {
    if (bytes.size() % 2) return std::nullopt;
    while (!bytes.empty()) {
      const auto part = bytes.first<2>();
      const auto unit = std::bit_cast<char16_t>(std::array<uint8_t, 2>{part[0], part[1]});
      if (unit < 32 || unit > 126) return std::nullopt;
      key.push_back(unit); bytes = bytes.subspan(2);
    }
  } else {
    for (const auto unit : bytes) {
      if (unit < 32 || unit > 126) return std::nullopt;
      key.push_back(unit);
    }
  }
  return key.empty() || key.size() > 8192 ? std::nullopt : std::optional(std::move(key));
}
std::vector<uint8_t> CurrentTargetKey(const std::u16string& key, bool local) {
  std::vector<uint8_t> result;
  if (local) result.push_back(1);
  for (const auto unit : key) result.push_back(static_cast<uint8_t>(unit));
  return result;
}
std::vector<uint8_t> CurrentTargetValue(const std::u16string& value, bool local) {
  std::vector<uint8_t> result;
  const bool latin1 = local && std::ranges::all_of(value, [](char16_t unit) { return unit <= 255; });
  if (local) result.push_back(latin1 ? 1 : 0);
  if (latin1) for (const auto unit : value) result.push_back(static_cast<uint8_t>(unit));
  else {
    const auto bytes = base::as_byte_span(value);
    result.insert(result.end(), bytes.begin(), bytes.end());
  }
  return result;
}
bool SameDomSource(const storage::mojom::AuxUiDomLeaseReply& first,
                   const storage::mojom::AuxUiDomLeaseReply& next) {
  if (first.source_topology_sha256 != next.source_topology_sha256 || first.maps.size() != next.maps.size()) return false;
  for (size_t i = 0; i < first.maps.size(); ++i) {
    if (!first.maps[i] || !next.maps[i]) return false;
    const auto& a = *first.maps[i]; const auto& b = *next.maps[i];
    if (a.map_ordinal != b.map_ordinal || a.storage_key != b.storage_key || a.session_ids != b.session_ids ||
        a.map_id != b.map_id || a.source_persisted != b.source_persisted ||
        a.source_map_sha256 != b.source_map_sha256 || a.source_entries != b.source_entries ||
        a.cache_views.size() != b.cache_views.size()) return false;
    for (size_t j = 0; j < a.cache_views.size(); ++j) {
      if (!a.cache_views[j] || !b.cache_views[j]) return false;
      const auto& av = *a.cache_views[j]; const auto& bv = *b.cache_views[j];
      if (av.namespace_id != bv.namespace_id || !av.cache || !bv.cache ||
          av.cache->sources != bv.cache->sources || av.cache->source_entries != bv.cache->source_entries) return false;
    }
  }
  return true;
}
std::optional<std::u16string> TargetLogicalValue(const std::vector<uint8_t>& raw, bool local) {
  auto bytes = base::span(raw); bool latin1 = false;
  if (local) {
    if (bytes.empty() || bytes.front() > 1) return std::nullopt;
    latin1 = bytes.front() == 1; bytes = bytes.subspan(1);
  }
  if (bytes.size() > 8388608 || (!latin1 && bytes.size() % 2)) return std::nullopt;
  std::u16string value;
  if (latin1) for (const auto unit : bytes) value.push_back(unit);
  else while (!bytes.empty()) {
    const auto part = bytes.first<2>();
    value.push_back(std::bit_cast<char16_t>(std::array<uint8_t, 2>{part[0], part[1]}));
    bytes = bytes.subspan(2);
  }
  return value.size() > 4194304 ? std::nullopt : std::optional(std::move(value));
}
bool PrivateDraftTargetsMatch(const storage::mojom::AuxUiDomMapSnapshot& map, bool local) {
  std::map<std::u16string, std::u16string> expected;
  for (const auto& entry : map.target_entries) {
    if (!entry) return false;
    auto key = TargetLogicalKey(entry->key, local);
    auto value = TargetLogicalValue(entry->value, local);
    if (!key || !value) return false;
    if (WireKey(*key, local) && !expected.emplace(std::move(*key), std::move(*value)).second) return false;
  }
  for (const auto& view : map.cache_views) {
    if (!view || !view->cache || !view->cache->ok || !view->cache->held ||
        view->cache->tainted || view->cache->published || !view->cache->error.empty()) return false;
    std::map<std::u16string, std::u16string> staged;
    size_t units = 0;
    for (const auto& entry : view->cache->staged_entries) {
      if (!entry || entry->key.size() > 4194304 || entry->value.size() > 4194304 ||
          units > 4194304 - entry->key.size() || units + entry->key.size() > 4194304 - entry->value.size()) return false;
      units += entry->key.size() + entry->value.size();
      std::u16string key(entry->key.begin(), entry->key.end());
      if (WireKey(key, local) && !staged.emplace(std::move(key),
          std::u16string(entry->value.begin(), entry->value.end())).second) return false;
    }
    if (expected != staged) return false;
  }
  return true;
}

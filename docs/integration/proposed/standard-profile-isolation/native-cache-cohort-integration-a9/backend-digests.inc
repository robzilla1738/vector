void AuxDigestNumber(std::string& bytes, uint64_t value) {
  for (int shift = 56; shift >= 0; shift -= 8) bytes.push_back(static_cast<char>(value >> shift));
}
void AuxDigestBytes(std::string& bytes, std::string_view value) {
  AuxDigestNumber(bytes, value.size()); bytes.append(value);
}
void AuxDigestRaw(std::string& bytes, const std::vector<uint8_t>& value) {
  AuxDigestNumber(bytes, value.size());
  bytes.append(base::as_string_view(base::span(value)));
}
void AuxDigestLocator(std::string& bytes, const DomStorageDatabase::MapLocator& locator) {
  AuxDigestBytes(bytes, locator.storage_key().Serialize());
  AuxDigestNumber(bytes, locator.map_id().has_value());
  if (locator.map_id()) AuxDigestNumber(bytes, static_cast<uint64_t>(*locator.map_id()));
  std::vector<std::string> sessions = locator.session_ids();
  std::sort(sessions.begin(), sessions.end());
  AuxDigestNumber(bytes, sessions.size());
  for (const auto& session : sessions) AuxDigestBytes(bytes, session);
}
std::string AuxFullMapDigest(const AuxDomMap& map, bool target, bool local) {
  std::string bytes("aux.ui-dom-complete-map.v1"); bytes.push_back('\0');
  AuxDigestLocator(bytes, map.locator);
  const auto& entries = target ? map.target : map.source;
  AuxDigestNumber(bytes, map.source_persisted || !entries.empty());
  for (const auto& time : {map.last_accessed, map.last_modified}) {
    AuxDigestNumber(bytes, time.has_value());
    if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
  }
  AuxDigestNumber(bytes, local && map.total_size.has_value());
  if (local && map.total_size) {
    size_t count = 0;
    for (const auto& [key, value] : entries) count += key.size() + value.size();
    AuxDigestNumber(bytes, target && map.target != map.source ? count : map.total_size->InBytes());
  }
  AuxDigestNumber(bytes, entries.size());
  for (const auto& [key, value] : entries) { AuxDigestRaw(bytes, key); AuxDigestRaw(bytes, value); }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
std::string AuxTopologyDigest(const AuxDomCapture& capture, bool target, bool local) {
  std::string bytes("aux.ui-dom-complete-topology.v1"); bytes.push_back('\0');
  AuxDigestNumber(bytes, local); AuxDigestNumber(bytes, capture.maps.size());
  for (const auto& map : capture.maps) {
    AuxDigestLocator(bytes, map.locator);
    AuxDigestNumber(bytes, map.source_persisted || !(target ? map.target : map.source).empty());
    AuxDigestBytes(bytes, AuxFullMapDigest(map, target, local));
  }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}

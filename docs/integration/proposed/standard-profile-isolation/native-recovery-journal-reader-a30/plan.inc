struct RecordedRecoveryOwner {
  std::string page_id, route, namespace_id, owner_state, memory_state, capture_json;
  WireStores stores;
};
struct RecordedRecoveryDomain {
  size_t partition = 0;
  bool local = false, partition_in_memory = false;
  std::string partition_domain, partition_name;
  storage::mojom::AuxUiDomRecoveryDescriptorPtr descriptor;
};
struct VerifiedRecoveryPlan {
  RecoveryJournalData journal;
  value_store::ValueStore::AuxUiPreferenceRecoveryDescriptor extension;
  std::vector<RecordedRecoveryOwner> owners;
  std::vector<RecordedRecoveryDomain> domains;
  std::string intent_sha, intent_receipt_sha;
};
bool RecoverySha(const std::string& text) {
  return text.size() == 64 && text.find_first_not_of("0123456789abcdef") == std::string::npos;
}
bool RecoveryRecords(const base::DictValue& value, std::string_view name,
    value_store::ValueStore::AuxUiPreferenceRecords& records) {
  const auto* entries = value.FindList(name);
  if (!entries || entries->size() != records.size()) return false;
  size_t total = 0;
  for (size_t i = 0; i < entries->size(); ++i) {
    if ((*entries)[i].is_none()) continue;
    const auto* raw = (*entries)[i].GetIfString();
    auto decoded = raw ? base::Base64Decode(*raw) : std::nullopt;
    if (!decoded || decoded->size() > 65536 || total > 65536 - decoded->size() || base::Base64Encode(*decoded) != *raw) return false;
    total += decoded->size(); records[i] = std::string(decoded->begin(), decoded->end());
  }
  return true;
}
bool RecoveryOptionalInteger(const base::DictValue& row, std::string_view name,
    std::optional<int64_t>& output) {
  const auto* value = row.Find(name);
  if (!value) return false;
  if (value->is_none()) { output.reset(); return true; }
  const auto* text = value->GetIfString(); int64_t parsed = 0;
  if (!text || !base::StringToInt64(*text, &parsed) || parsed < 0 || base::NumberToString(parsed) != *text) return false;
  output = parsed; return true;
}
bool RecoveryMetadata(const base::DictValue& row, std::string_view name,
    bool unsigned_value, std::optional<std::string>& output) {
  const auto* value = row.Find(name);
  if (!value) return false;
  if (value->is_none()) { output.reset(); return true; }
  const auto* text = value->GetIfString();
  if (!text || text->size() > 32) return false;
  if (unsigned_value) {
    uint64_t parsed = 0; if (!base::StringToUint64(*text, &parsed) || base::NumberToString(parsed) != *text) return false;
  } else {
    int64_t parsed = 0; if (!base::StringToInt64(*text, &parsed) || base::NumberToString(parsed) != *text) return false;
  }
  output = *text; return true;
}
bool RecoveryEntries(const base::Value* value,
    std::vector<blink::mojom::KeyValuePtr>& output, size_t& total) {
  const auto* entries = value ? value->GetIfList() : nullptr;
  if (!entries || entries->size() > 65536) return false;
  std::set<std::vector<uint8_t>> keys;
  for (const auto& raw : *entries) {
    const auto* row = raw.GetIfDict();
    const auto* key = row ? row->FindString("keyBase64") : nullptr;
    const auto* data = row ? row->FindString("valueBase64") : nullptr;
    auto decoded_key = key ? base::Base64Decode(*key) : std::nullopt;
    auto decoded_data = data ? base::Base64Decode(*data) : std::nullopt;
    if (!row || row->size() != 2 || !decoded_key || !decoded_data || decoded_key->empty() ||
        decoded_key->size() > 16 * 1024 * 1024 || decoded_data->size() > 16 * 1024 * 1024 ||
        total > 16 * 1024 * 1024 - decoded_key->size() ||
        total + decoded_key->size() > 16 * 1024 * 1024 - decoded_data->size() ||
        base::Base64Encode(*decoded_key) != *key || base::Base64Encode(*decoded_data) != *data ||
        !keys.insert(*decoded_key).second) return false;
    total += decoded_key->size() + decoded_data->size();
    output.push_back(blink::mojom::KeyValue::New(std::move(*decoded_key), std::move(*decoded_data)));
  }
  return true;
}
std::optional<RecordedRecoveryDomain> RecoveryDomain(const base::DictValue& value,
    const url::Origin& origin) {
  const auto partition = value.FindInt("partitionOrdinal");
  const auto* storage = value.FindString("storage");
  const auto* maps = value.FindList("maps");
  const auto* partition_domain = value.FindString("nativePartitionDomain");
  const auto* partition_name = value.FindString("nativePartitionName");
  const auto partition_in_memory = value.FindBool("nativePartitionInMemory");
  const auto* source_sha = value.FindString("sourceTopologySha256");
  const auto* target_sha = value.FindString("targetTopologySha256");
  const auto* action_sha = value.FindString("allocationActionSha256");
  if (!partition || *partition < 0 || *partition > 3 || !partition_domain || !partition_name ||
      partition_domain->size() > 8192 || partition_name->size() > 8192 || !partition_in_memory || !storage ||
      (*storage != "local-storage" && *storage != "session-storage") || !maps || maps->size() > 256 ||
      !source_sha || !RecoverySha(*source_sha) || !target_sha || (!target_sha->empty() && !RecoverySha(*target_sha)) ||
      !action_sha || (!action_sha->empty() && !RecoverySha(*action_sha))) return std::nullopt;
  RecordedRecoveryDomain result; result.partition = *partition; result.local = *storage == "local-storage";
  result.partition_domain = *partition_domain; result.partition_name = *partition_name;
  result.partition_in_memory = *partition_in_memory;
  result.descriptor = storage::mojom::AuxUiDomRecoveryDescriptor::New();
  result.descriptor->source_topology_sha256 = *source_sha;
  result.descriptor->target_topology_sha256 = *target_sha;
  result.descriptor->allocation_action_sha256 = *action_sha;
  std::set<uint32_t> ordinals; size_t total = 0;
  for (const auto& raw : *maps) {
    const auto* row = raw.GetIfDict();
    const auto ordinal = row ? row->FindInt("ordinal") : std::nullopt;
    const auto* key = row ? row->FindString("storageKey") : nullptr;
    auto parsed_key = key ? blink::StorageKey::Deserialize(*key) : std::nullopt;
    const auto persisted = row ? row->FindBool("sourcePersisted") : std::nullopt;
    const auto requested = row ? row->FindBool("allocationRequested") : std::nullopt;
    const auto observed = row ? row->FindBool("allocationObserved") : std::nullopt;
    const auto metadata = row ? row->FindBool("targetMetadataExplicit") : std::nullopt;
    const auto* map_source = row ? row->FindString("sourceMapSha256") : nullptr;
    const auto* map_target = row ? row->FindString("targetMapSha256") : nullptr;
    const auto* map_action = row ? row->FindString("allocationActionSha256") : nullptr;
    if (!row || !ordinal || *ordinal < 0 || static_cast<size_t>(*ordinal) >= maps->size() ||
        !ordinals.insert(*ordinal).second || !parsed_key || parsed_key->Serialize() != *key ||
        parsed_key->origin() != origin || !persisted || !requested || !observed || !metadata ||
        !map_source || !RecoverySha(*map_source) || !map_target || (!map_target->empty() && !RecoverySha(*map_target)) ||
        !map_action || (!map_action->empty() && !RecoverySha(*map_action))) return std::nullopt;
    auto output = storage::mojom::AuxUiDomRecoveryMap::New();
    output->map_ordinal = *ordinal; output->storage_key = std::move(*parsed_key);
    output->source_persisted = *persisted; output->allocation_requested = *requested;
    output->allocation_observed = *observed; output->target_metadata_is_explicit = *metadata;
    output->source_map_sha256 = *map_source; output->target_map_sha256 = *map_target;
    output->allocation_action_sha256 = *map_action;
    const auto* namespaces = row->FindList("nativeNamespaces");
    if (!namespaces || namespaces->size() > 256 || (result.local && !namespaces->empty())) return std::nullopt;
    std::set<std::string> unique_namespaces;
    for (const auto& ns : *namespaces) {
      const auto* text = ns.GetIfString();
      if (!text || text->empty() || text->size() > 8192 || !unique_namespaces.insert(*text).second) return std::nullopt;
      output->session_ids.push_back(*text);
    }
    if (!RecoveryOptionalInteger(*row, "originalMapId", output->map_id) ||
        !RecoveryOptionalInteger(*row, "allocatedMapId", output->allocated_map_id) ||
        !RecoveryMetadata(*row, "sourceLastAccessedUs", false, output->source_last_accessed_us) ||
        !RecoveryMetadata(*row, "sourceLastModifiedUs", false, output->source_last_modified_us) ||
        !RecoveryMetadata(*row, "sourceTotalSizeBytes", true, output->source_total_size_bytes) ||
        !RecoveryMetadata(*row, "targetLastAccessedUs", false, output->target_last_accessed_us) ||
        !RecoveryMetadata(*row, "targetLastModifiedUs", false, output->target_last_modified_us) ||
        !RecoveryMetadata(*row, "targetTotalSizeBytes", true, output->target_total_size_bytes) ||
        !RecoveryEntries(row->Find("sourceSelectedRaw"), output->source_entries, total) ||
        !RecoveryEntries(row->Find("targetSelectedRaw"), output->target_entries, total)) return std::nullopt;
    if (output->allocation_requested) {
      if (!result.local || output->source_persisted || output->map_id || !RecoverySha(output->allocation_action_sha256) ||
          output->allocation_observed != output->allocated_map_id.has_value()) return std::nullopt;
      if (!output->allocation_observed && !output->target_map_sha256.empty()) return std::nullopt;
    } else if (output->allocated_map_id || output->allocation_observed || !output->allocation_action_sha256.empty()) return std::nullopt;
    result.descriptor->maps.push_back(std::move(output));
  }
  return result;
}

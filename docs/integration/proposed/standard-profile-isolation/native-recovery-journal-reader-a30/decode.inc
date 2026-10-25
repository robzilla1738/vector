std::unique_ptr<VerifiedRecoveryPlan> Controller::DecodeRecoveryPlan(RecoveryJournalData journal) {
  auto capture = base::JSONReader::ReadDict(journal.capture, base::JSON_PARSE_RFC);
  if (!capture || !Text(*capture, "format", "aux.ui-storage.capture-input.v1") ||
      !Text(*capture, "nativeProfileId", profile_id_) || !Text(*capture, "bindingEpoch", binding_) ||
      !Text(*capture, "restoreEpoch", restoration_) || capture->FindBool("qualified") != false ||
      capture->FindBool("activationAuthorized") != false || journal.records.empty() ||
      journal.records.front().summary.ordinal != 0 || journal.records.front().summary.kind != 1) return nullptr;
  auto intent = base::JSONReader::ReadDict(journal.records.front().payload, base::JSON_PARSE_RFC);
  if (!intent || !Text(*intent, "format", "aux.ui-storage.native-target-intent.v1") ||
      !Text(*intent, "nativeProfileId", profile_id_) || !Text(*intent, "bindingEpoch", binding_) ||
      !Text(*intent, "restoreEpoch", restoration_) || !Text(*intent, "captureJournalId", journal.journal_id) ||
      !Text(*intent, "captureSha256", base::HexEncodeLower(journal.capture_digest)) ||
      !Text(*intent, "captureReceiptSha256", base::HexEncodeLower(Digest(journal.capture_receipt))) ||
      !Text(*intent, "phase", "unqualified-data") || intent->FindBool("qualified") != false ||
      intent->FindBool("activationAuthorized") != false) return nullptr;
  auto result = std::make_unique<VerifiedRecoveryPlan>();
  const auto* source_sha = intent->FindString("extensionSourceSha256");
  const auto* target_sha = intent->FindString("extensionTargetSha256");
  const auto* descriptor_sha = intent->FindString("extensionDescriptorSha256");
  if (!source_sha || !target_sha || !descriptor_sha || !RecoverySha(*source_sha) ||
      !RecoverySha(*target_sha) || !RecoverySha(*descriptor_sha) ||
      !RecoveryRecords(*intent, "extensionSource", result->extension.source) ||
      !RecoveryRecords(*intent, "extensionTarget", result->extension.target)) return nullptr;
  result->extension.source_sha256 = *source_sha; result->extension.target_sha256 = *target_sha;
  result->extension.descriptor_sha256 = *descriptor_sha;
  if (!value_store::ValueStore::ValidateAuxUiPreferenceRecoveryDescriptor(result->extension).ok()) return nullptr;
  const auto* domains = intent->FindList("domains");
  if (!domains || domains->empty() || domains->size() > 8 || domains->size() % 2) return nullptr;
  std::set<std::pair<size_t, bool>> unique_domains;
  for (const auto& raw : *domains) {
    const auto* row = raw.GetIfDict();
    auto decoded = row ? RecoveryDomain(*row, extension_->origin()) : std::nullopt;
    if (!decoded || !unique_domains.emplace(decoded->partition, decoded->local).second) return nullptr;
    // An unresolved old attempt remains uncertain, not falsely "not started".
    // The native helper uses uncertainty for readonly classification only.
    decoded->descriptor->target_attempt_uncertain = true;
    result->domains.push_back(std::move(*decoded));
  }
  const auto* pages = capture->FindList("pages");
  if (!pages || pages->empty() || pages->size() > 128) return nullptr;
  size_t owner_bytes = 0;
  for (const auto& raw : *pages) {
    const auto* page = raw.GetIfDict();
    const auto* envelope = page ? page->FindString("captureJson") : nullptr;
    const auto* ns = page ? page->FindString("sessionNamespace") : nullptr;
    const auto* page_id = page ? page->FindString("nativePageId") : nullptr;
    const auto* route = page ? page->FindString("nativeRoute") : nullptr;
    auto value = envelope ? base::JSONReader::ReadDict(*envelope, base::JSON_PARSE_RFC) : std::nullopt;
    const auto* owner_state = value ? value->FindString("ownerStateJson") : nullptr;
    const auto* memory_state = value ? value->FindString("memoryStateJson") : nullptr;
    const auto* raw_capture = value ? value->FindString("captureJson") : nullptr;
    const auto* units = value ? value->FindDict("storeUnits") : nullptr;
    auto stores = units ? ReadWireStores(*units, extension_->origin().Serialize()) : std::nullopt;
    if (!page || !envelope || !ns || ns->empty() || ns->size() > 8192 || !page_id ||
        (!page_id->empty() && !PageIdentity::IsValid(*page_id)) || !route ||
        (*route != "/newtab.html" && *route != "/main.html" && *route != "/sidepanel.html" && *route != "/minipopup.html") ||
        !value || !Text(*value, "format", "aux.ui-draft-capture-lease.v1") ||
        value->FindBool("ok") != true || value->FindBool("sealed") != true ||
        value->FindBool("recoveryReadOnly") != false || !owner_state || owner_state->empty() ||
        !memory_state || memory_state->empty() || !raw_capture || raw_capture->empty() || !stores ||
        owner_state->size() > 33554432 || memory_state->size() > 33554432 ||
        owner_bytes > kCaptureLimit - owner_state->size() ||
        owner_bytes + owner_state->size() > kCaptureLimit - memory_state->size()) return nullptr;
    owner_bytes += owner_state->size() + memory_state->size();
    RecordedRecoveryOwner owner; owner.page_id = *page_id; owner.route = *route; owner.namespace_id = *ns;
    owner.owner_state = *owner_state; owner.memory_state = *memory_state;
    owner.capture_json = *raw_capture; owner.stores = std::move(*stores);
    result->owners.push_back(std::move(owner));
  }
  result->intent_sha = base::HexEncodeLower(journal.records.front().summary.payloadSHA);
  result->intent_receipt_sha = base::HexEncodeLower(journal.records.front().summary.receiptSHA);
  for (size_t record_index = 1; record_index < journal.records.size(); ++record_index) {
    const auto& entry = journal.records[record_index];
    auto observed = base::JSONReader::ReadDict(entry.payload, base::JSON_PARSE_RFC);
    if (!observed || !Text(*observed, "format", "aux.ui-storage.native-transaction-observation.v1") ||
        !Text(*observed, "intentSha256", result->intent_sha) || observed->FindBool("qualified") != false ||
        observed->FindBool("activationAuthorized") != false ||
        observed->FindInt("recordKind") != entry.summary.kind) return nullptr;
    const auto* rows = observed->FindList("domains");
    if (!rows || rows->size() != result->domains.size()) return nullptr;
    std::set<std::pair<size_t, bool>> observed_domains;
    for (const auto& raw : *rows) {
      const auto* row = raw.GetIfDict(); const auto part = row ? row->FindInt("partitionOrdinal") : std::nullopt;
      const auto* storage = row ? row->FindString("storage") : nullptr;
      const auto* maps = row ? row->FindList("maps") : nullptr;
      if (!row || !part || *part < 0 || !storage || (*storage != "local-storage" && *storage != "session-storage") || !maps) return nullptr;
      auto domain = std::ranges::find_if(result->domains, [&](const auto& item) {
        return item.partition == static_cast<size_t>(*part) && item.local == (*storage == "local-storage");
      });
      if (domain == result->domains.end() ||
          !observed_domains.emplace(domain->partition, domain->local).second || maps->size() != domain->descriptor->maps.size() ||
          !Text(*row, "sourceTopologySha256", domain->descriptor->source_topology_sha256) ||
          !Text(*row, "allocationActionSha256", domain->descriptor->allocation_action_sha256)) return nullptr;
      if (const auto attempted = row->FindBool("targetAttempted"); attempted && *attempted)
        domain->descriptor->target_attempted = true;
      std::set<uint32_t> observed_maps;
      for (const auto& raw_map : *maps) {
        const auto* map = raw_map.GetIfDict(); const auto ordinal = map ? map->FindInt("ordinal") : std::nullopt;
        if (!map || !ordinal || *ordinal < 0 || !observed_maps.insert(static_cast<uint32_t>(*ordinal)).second) return nullptr;
        auto actual = std::ranges::find_if(domain->descriptor->maps,
            [&](const auto& candidate) { return candidate->map_ordinal == static_cast<uint32_t>(*ordinal); });
        if (actual == domain->descriptor->maps.end() ||
            !Text(*map, "storageKey", (*actual)->storage_key.Serialize()) ||
            !Text(*map, "sourceMapSha256", (*actual)->source_map_sha256) ||
            !Text(*map, "allocationActionSha256", (*actual)->allocation_action_sha256)) return nullptr;
        const auto allocated = map->FindBool("allocationObserved");
        std::optional<int64_t> id;
        if (!allocated || !RecoveryOptionalInteger(*map, "allocatedMapId", id) || *allocated != id.has_value()) return nullptr;
        if (*allocated) {
          const auto* sha = map->FindString("targetMapSha256");
          const auto* topology = row->FindString("targetTopologySha256");
          if (!(*actual)->allocation_requested || !sha || !RecoverySha(*sha) || !topology || !RecoverySha(*topology) ||
              ((*actual)->allocated_map_id && (*actual)->allocated_map_id != id) ||
              (!(*actual)->target_map_sha256.empty() && (*actual)->target_map_sha256 != *sha)) return nullptr;
          (*actual)->allocated_map_id = id; (*actual)->allocation_observed = true;
          (*actual)->target_map_sha256 = *sha; domain->descriptor->target_topology_sha256 = *topology;
        } else if ((*actual)->allocated_map_id) return nullptr;
      }
    }
  }
  result->journal = std::move(journal); return result;
}

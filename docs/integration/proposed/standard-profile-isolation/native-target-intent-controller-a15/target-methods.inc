bool Controller::BuildDomTargets() {
  if (!DomCurrent() || !PairDomSources() || !Inventory(false)) return false;
  size_t count = 0, units = 0;
  for (auto& hold : dom_holds_) {
    hold.targets.clear();
    for (const auto& map : hold.source->maps) {
      std::map<std::vector<uint8_t>, std::vector<uint8_t>> raw;
      std::map<std::u16string, std::vector<uint8_t>> logical;
      for (const auto& entry : map->target_entries) {
        if (!entry || ++count > 8192) return false;
        auto key = TargetLogicalKey(entry->key, hold.local);
        if (!key || !logical.emplace(*key, entry->key).second || !raw.emplace(entry->key, entry->value).second) return false;
      }
      std::map<std::u16string, std::pair<bool, std::u16string>> changes;
      for (const auto& view : map->cache_views) {
        for (const auto& source : view->cache->sources) {
          for (const auto& frame : frames_) {
            if (source->frame != frame->native_frame_token || source->document != frame->native_document_token) continue;
            for (const auto& mutation : frame->source_stores->mutations) {
              if (mutation.local != hold.local) continue;
              if (mutation.key.size() > 8192 || mutation.value.size() > 4194304 ||
                  units > 4194304 - mutation.key.size() ||
                  units + mutation.key.size() > 4194304 - mutation.value.size()) return false;
              units += mutation.key.size() + mutation.value.size();
              const auto desired = std::pair(mutation.remove, mutation.value);
              auto [at, inserted] = changes.emplace(mutation.key, desired);
              // Multiple actual views may report one shared Local intent; only
              // identical operations/units can coalesce. No winner is guessed.
              if (!inserted && at->second != desired) return false;
            }
          }
        }
      }
      for (const auto& [key, desired] : changes) {
        if (!WireKey(key, hold.local)) return false;
        const auto existing = logical.find(key);
        if (desired.first) {
          if (existing != logical.end()) raw.erase(existing->second);
        } else {
          const auto encoded_key = existing == logical.end() ? CurrentTargetKey(key, hold.local) : existing->second;
          raw[encoded_key] = CurrentTargetValue(desired.second, hold.local);
        }
      }
      auto plan = storage::mojom::AuxUiDomTargetMap::New(); plan->map_ordinal = map->map_ordinal;
      for (auto& [key, value] : raw)
        plan->desired_selected_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
      hold.targets.push_back(std::move(plan));
    }
  }
  return true;
}
void Controller::StageDomNext() {
  if (!DomCurrent() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Actual source holds changed before private target staging"); return;
  }
  if (dom_cursor_ == dom_holds_.size()) { cursor_ = 0; ValidateNext(); return; }
  const size_t index = dom_cursor_++; auto& hold = dom_holds_[index];
  auto controls = DomControls(index);
  std::vector<storage::mojom::AuxUiDomTargetMapPtr> targets;
  for (const auto& target : hold.targets) targets.push_back(target->Clone());
  hold.stage_attempted = true; hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::StagedDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->StageAuxUiPreferenceTargets(hold.request, *hold.token, std::move(targets), std::move(callback));
  else controls->session->StageAuxUiPreferenceTargets(hold.request, *hold.token, std::move(targets), std::move(callback));
}
void Controller::StagedDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  dom_holds_[index].pending = false;
  if (!AcceptDom(index, std::move(value))) {
    dom_holds_[index].unknown = true; Finish("Exact private native target staging refused"); return;
  }
  dom_holds_[index].staged = true; StageDomNext();
}
void Controller::BeginIntent() {
  if (!transfer_ || !transfer_->complete || !DomCurrent() || !PairDomSources() ||
      !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get()) ||
      !std::ranges::all_of(dom_holds_, [](const auto& hold) { return hold.staged; })) {
    Finish("Complete sealed capture and private actual targets required before immutable intent"); return;
  }
  base::DictValue intent;
  intent.Set("format", "aux.ui-storage.native-target-intent.v1");
  intent.Set("phase", "unqualified-data"); intent.Set("qualified", false);
  intent.Set("activationAuthorized", false);
  intent.Set("captureJournalId", transfer_->journal);
  intent.Set("captureSha256", base::HexEncodeLower(transfer_->digest));
  intent.Set("captureReceiptSha256", base::HexEncodeLower(Digest(transfer_->receipt)));
  intent.Set("nativeProfileId", profile_id_); intent.Set("bindingEpoch", binding_);
  intent.Set("restoreEpoch", restoration_);
  base::ListValue domains, extension_source, extension_target;
  for (const auto& hold : dom_holds_) {
    base::DictValue domain;
    domain.Set("partitionOrdinal", static_cast<int>(hold.partition));
    domain.Set("storage", hold.local ? "local-storage" : "session-storage");
    domain.Set("requestId", hold.request.ToString()); domain.Set("serviceToken", hold.token->ToString());
    domain.Set("controlGeneration", base::NumberToString(hold.generation));
    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);
    domain.Set("targetTopologySha256", hold.source->target_topology_sha256);
    base::ListValue maps;
    for (const auto& map : hold.source->maps) {
      base::DictValue fact;
      fact.Set("ordinal", static_cast<int>(map->map_ordinal));
      fact.Set("storageKey", map->storage_key.Serialize());
      fact.Set("sourceMapSha256", map->source_map_sha256); fact.Set("targetMapSha256", map->target_map_sha256);
      fact.Set("sourcePersisted", map->source_persisted);
      base::ListValue source, target, namespaces;
      const auto records = [](const auto& entries, base::ListValue& output) {
        for (const auto& entry : entries) {
          base::DictValue raw; raw.Set("keyBase64", base::Base64Encode(entry->key));
          raw.Set("valueBase64", base::Base64Encode(entry->value)); output.Append(std::move(raw));
        }
      };
      records(map->source_entries, source); records(map->target_entries, target);
      for (const auto& ns : map->session_ids) namespaces.Append(ns);
      fact.Set("sourceSelectedRaw", std::move(source)); fact.Set("targetSelectedRaw", std::move(target));
      fact.Set("nativeNamespaces", std::move(namespaces)); maps.Append(std::move(fact));
    }
    domain.Set("maps", std::move(maps)); domains.Append(std::move(domain));
  }
  for (const auto& raw : extension_lease_->CopySourceRecords())
    extension_source.Append(raw ? base::Value(base::Base64Encode(*raw)) : base::Value());
  for (const auto& raw : extension_lease_->CopyTargetRecords())
    extension_target.Append(raw ? base::Value(base::Base64Encode(*raw)) : base::Value());
  intent.Set("domains", std::move(domains)); intent.Set("extensionSource", std::move(extension_source));
  intent.Set("extensionTarget", std::move(extension_target));
  intent.Set("plannedOrder", base::ListValue().Append("extension-local").Append("dom-captured-order").Append("cache-publish-after-durable-target-facts"));
  auto encoded = base::WriteJson(intent);
  if (!encoded || encoded->empty() || encoded->size() > kCaptureLimit) {
    Finish("Exact immutable native intent exceeds its bound"); return;
  }
  intent_ = std::make_unique<IntentRecord>(); intent_->payload = std::move(*encoded);
  intent_->digest = Digest(intent_->payload); intent_->journal = transfer_->journal;
  intent_->upload = base::Uuid::GenerateRandomV4().AsLowercaseString();
  post_persist_validation_ = false; RunIntent();
}
void Controller::RunIntent() {
  if (!DomCurrent() || !PairDomSources() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get()) ||
      peer::InspectNativeBrowserShutdown().admitted_generation != transfer_->generation) {
    Finish("Original source/native journal generation changed during immutable intent"); return;
  }
  TransferIntentRecord(*intent_);  // One bounded native IPC on the actual owner sequence.
  if (!intent_->error.empty()) { Finish(intent_->error); return; }
  intent_validation_ = true; cursor_ = 0;
  // Keep all actual source leases while yielding between journal frames.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::ReadWorkerForValidation, weak_.GetWeakPtr()));
}

bool Controller::LiveOwners(bool restoration) {
  if (!Current() || !profile_ || !extension_lease_ || !Frontend::Get(profile_.get()) ||
      !Inventory(false) || dom_holds_.empty() || dom_holds_.size() > 8 ||
      !transfer_ || !transfer_->complete || !intent_ || !intent_->complete ||
      peer::InspectNativeBrowserShutdown().admitted_generation != transfer_->generation) return false;
  if (!restoration && (!FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get()))) return false;
  for (size_t i = 0; i < dom_holds_.size(); ++i) {
    const auto& hold = dom_holds_[i];
    if (!hold.token || !hold.source || !hold.staged || hold.released || hold.pending || !DomControls(i)) return false;
  }
  return true;
}
bool Controller::AcceptLiveDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  if (index >= dom_holds_.size() || !DomControls(index)) return false;
  auto& hold = dom_holds_[index];
  if (!value || !hold.source || value->request_id != hold.request || value->token != hold.token ||
      !value->held || value->released || value->aborted || !value->file_data_synced ||
      !value->error.empty() || !SameDomSource(*hold.source, *value) ||
      value->allocation_action_sha256 != hold.source->allocation_action_sha256 ||
      value->maps.size() != hold.targets.size() ||
      (!value->matches_source && !value->matches_target && !value->known_source_target_mixture) ||
      (value->known_source_target_mixture && (value->matches_source || value->matches_target))) return false;
  if (value->ordinary_work_queued) live_failure_ = "An ordinary native writer attempted work during target custody";
  bool pending_allocation = false;
  for (size_t i = 0; i < value->maps.size(); ++i) {
    const auto& map = value->maps[i]; const auto& prior = hold.source->maps[i];
    if (!map || !prior || map->allocation_requested != prior->allocation_requested ||
        map->allocation_action_sha256 != prior->allocation_action_sha256) return false;
    const auto target = std::ranges::find_if(hold.targets,
        [&](const auto& candidate) { return candidate->map_ordinal == map->map_ordinal; });
    if (target == hold.targets.end() || (*target)->desired_selected_entries != map->target_entries) return false;
    if (map->allocation_requested) {
      if (!hold.local || map->source_persisted || map->map_id || map->allocation_action_sha256.size() != 64 ||
          map->allocation_observed != map->allocated_map_id.has_value() ||
          (prior->allocated_map_id && prior->allocated_map_id != map->allocated_map_id)) return false;
      if (!map->allocation_observed) {
        pending_allocation = true;
        if (!map->target_map_sha256.empty() || map->allocated_map_id || value->matches_target) return false;
      } else if (*map->allocated_map_id < 0 || map->target_map_sha256.size() != 64 ||
          (!prior->target_map_sha256.empty() && prior->target_map_sha256 != map->target_map_sha256)) return false;
    } else if (map->allocated_map_id || map->allocation_observed ||
        map->target_map_sha256 != prior->target_map_sha256) return false;
    if (value->matches_target && !PrivateDraftTargetsMatch(*map, hold.local, value->cache_published)) return false;
  }
  if (pending_allocation ? !value->target_topology_sha256.empty() : value->target_topology_sha256.size() != 64) return false;
  if (!hold.source->target_topology_sha256.empty() &&
      hold.source->target_topology_sha256 != value->target_topology_sha256) return false;
  if (value->cache_published && !hold.publish_attempted) return false;
  if (!live_rollback_ && hold.published && !value->cache_published) return false;
  if (value->matches_target && (!value->source_ready || !value->private_target_staged)) return false;
  if (value->matches_source && !value->source_ready) return false;
  hold.target_seen = value->matches_target; hold.source_seen = value->matches_source;
  hold.mixed_seen = value->known_source_target_mixture; hold.published = value->cache_published;
  hold.unknown = false; hold.source = std::move(value);
  if (hold.mixed_seen) live_failure_ = "Known native source/target mixture requires exact original restoration";
  return true;
}
bool Controller::LiveStores(size_t index, const base::DictValue& value) const {
  if (index >= frames_.size()) return false;
  const auto& frame = *frames_[index];
  const auto* units = value.FindDict("storeUnits");
  auto actual = units ? ReadWireStores(*units, extension_->origin().Serialize()) : std::nullopt;
  if (!actual || !actual->mutations.empty() || !Text(value, "format", "aux.ui-draft-capture-lease.v1") ||
      value.FindBool("ok") != true || value.FindBool("sealed") != true ||
      !Text(value, "requestId", frame.request_id) || !Text(value, "leaseId", frame.lease_id) ||
      value.FindDouble("revision") != frame.revision) return false;
  std::optional<std::map<std::u16string, std::u16string>> local, session;
  for (const auto& hold : dom_holds_) for (const auto& map : hold.source->maps)
    for (const auto& view : map->cache_views) {
      if (!view || !view->cache) return false;
      const bool belongs = std::ranges::any_of(view->cache->sources, [&](const auto& source) {
        return source && source->frame == frame.native_frame_token && source->document == frame.native_document_token;
      });
      if (!belongs) continue;
      std::map<std::u16string, std::u16string> expected;
      const auto& entries = hold.published ? view->cache->staged_entries : view->cache->source_entries;
      for (const auto& entry : entries) {
        if (!entry || entry->key.size() > 8192 || entry->value.size() > 4194304) return false;
        std::u16string key(entry->key.begin(), entry->key.end());
        if (WireKey(key, hold.local) && !expected.emplace(std::move(key),
            std::u16string(entry->value.begin(), entry->value.end())).second) return false;
      }
      auto& target = hold.local ? local : session;
      if (target && *target != expected) return false;
      target = std::move(expected);
    }
  return local && session && actual->local == *local && actual->session == *session;
}
base::DictValue Controller::LiveFacts() const {
  base::DictValue fact;
  fact.Set("format", "aux.ui-storage.native-transaction-observation.v1");
  fact.Set("qualified", false); fact.Set("activationAuthorized", false);
  fact.Set("intentSha256", base::HexEncodeLower(intent_->digest));
  fact.Set("domainOrdinal", live_observation_domain_);
  fact.Set("restoration", live_rollback_); fact.Set("extensionTarget", live_extension_target_);
  fact.Set("extensionSynced", live_extension_synced_);
  base::ListValue domains;
  for (const auto& hold : dom_holds_) {
    base::DictValue domain; domain.Set("partitionOrdinal", static_cast<int>(hold.partition));
    domain.Set("storage", hold.local ? "local-storage" : "session-storage");
    domain.Set("requestId", hold.request.ToString()); domain.Set("serviceToken", hold.token->ToString());
    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);
    domain.Set("targetTopologySha256", hold.source->target_topology_sha256);
    domain.Set("allocationActionSha256", hold.source->allocation_action_sha256);
    domain.Set("matchesSource", hold.source_seen); domain.Set("matchesTarget", hold.target_seen);
    domain.Set("knownMixture", hold.mixed_seen); domain.Set("cachePublished", hold.published);
    domain.Set("fileDataSynced", hold.source->file_data_synced);
    base::ListValue maps;
    for (const auto& map : hold.source->maps) {
      base::DictValue row; row.Set("ordinal", static_cast<int>(map->map_ordinal));
      row.Set("storageKey", map->storage_key.Serialize()); row.Set("sourceMapSha256", map->source_map_sha256);
      row.Set("targetMapSha256", map->target_map_sha256); row.Set("allocationActionSha256", map->allocation_action_sha256);
      row.Set("allocationObserved", map->allocation_observed);
      row.Set("allocatedMapId", map->allocated_map_id ? base::Value(base::NumberToString(*map->allocated_map_id)) : base::Value());
      maps.Append(std::move(row));
    }
    domain.Set("maps", std::move(maps)); domains.Append(std::move(domain));
  }
  fact.Set("domains", std::move(domains)); return fact;
}
void Controller::StartLive() {
  if (!intent_ || !intent_->complete || intent_->payload.size() > 32 * 1024 * 1024 || dom_holds_.size() > 8 ||
      std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.source->maps.size() > 256; })) {
    Finish("Native transaction exceeds bounded journal/recovery reserve"); return;
  }
  live_active_ = true; live_action_ = LiveAction::kExtensionAttempt;
  live_record_bytes_ = intent_->payload.size(); live_domain_ = 0;
  for (auto& hold : dom_holds_) { hold.source_seen = true; hold.target_seen = false; }
  size_t maps = 0; for (const auto& hold : dom_holds_) maps += hold.source->maps.size();
  auto size_probe = base::WriteJson(LiveFacts());
  if (!size_probe || size_probe->size() + (maps + frames_.size() + dom_holds_.size()) * 128 + 4096 > 512 * 1024) {
    live_active_ = false; Finish("Native observation exceeds pre-target recovery record reserve"); return;
  }
  RunLive();
}
void Controller::RunLive() {
  if (!live_active_ || live_pending_) { HoldLive("Actual native transaction operation remains pending"); return; }
  if (!LiveOwners(live_rollback_)) {
    if (live_persistent_attempted_ && !live_rollback_ && Current() && Inventory(false)) {
      RollbackLive("Original forward writer qualification changed"); return;
    }
    HoldLive("Original native transaction owners remain unavailable"); return;
  }
  // After an actual mutation, first observe that SAME token. Never replay Commit
  // just because its callback was lost or rejected.
  if (live_action_ == LiveAction::kExtensionRead || live_action_ == LiveAction::kRestoreExtensionRead ||
      live_action_ == LiveAction::kDomRead || live_action_ == LiveAction::kRestoreDomRead ||
      live_action_ == LiveAction::kPublishRead) { ActLive(); return; }
  ValidateLive();
}
void Controller::ValidateLive() {
  live_pending_ = true;
  ReadUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::LiveWorker, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr())));
}
void Controller::LiveWorker(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  live_pending_ = false;
  if (!WorkerCorrelation(value, false) || !LiveOwners(live_rollback_) ||
      (!live_rollback_ && !HasValidUiStorageMigrationWorkerLease(profile_.get()))) {
    HoldLive("Actual retained worker identity/source pause could not be observed"); return;
  }
  live_cursor_ = 0; LiveFrameNext();
}
void Controller::LiveFrameNext() {
  if (!LiveOwners(live_rollback_)) { HoldLive("Actual native document cohort changed"); return; }
  if (live_cursor_ == frames_.size()) {
    live_pending_ = true;
    Frontend::Get(profile_.get())->ReadbackAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
        base::BindOnce(&Controller::LiveFrontend, weak_.GetWeakPtr()),
        base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
  }
  const size_t index = live_cursor_++; live_pending_ = true;
  Invoke(index, "auxObserveDraftMigrationTarget", base::ListValue().Append(frames_[index]->lease_id)
      .Append(frames_[index]->revision).Append("utf16-v1"),
      base::BindOnce(&Controller::LiveFrame, weak_.GetWeakPtr(), index));
}
void Controller::LiveFrame(size_t index, std::optional<base::DictValue> value, std::string) {
  live_pending_ = false;
  if (!value || !LiveStores(index, *value)) { HoldLive("Actual editor hold/current UTF16 store observation changed"); return; }
  LiveFrameNext();
}
void Controller::LiveFrontend(Frontend::AuxUiMigrationReadbackResult result) {
  live_pending_ = false;
  if (!result.has_value() || !LiveOwners(true) || !result->readback_file_data_synced ||
      (!result->matches_source && !result->matches_target) ||
      result->records != (result->matches_target ? extension_lease_->CopyTargetRecords() : extension_lease_->CopySourceRecords())) {
    HoldLive("Actual same-token extension readback remains unknown"); return;
  }
  live_extension_synced_ = true; live_extension_target_ = result->matches_target;
  if (result->ordinary_work_queued) live_failure_ = "An ordinary extension writer attempted work during custody";
  if (!live_failure_.empty() && !live_rollback_ && !live_record_) { RollbackLive(live_failure_); return; }
  live_cursor_ = 0; LiveDomNext();
}
void Controller::LiveDomNext() {
  if (!LiveOwners(live_rollback_)) { HoldLive("Actual native DOM transaction ownership changed"); return; }
  if (live_cursor_ == dom_holds_.size()) {
    if (!live_failure_.empty() && !live_rollback_ && !live_record_) { RollbackLive(live_failure_); return; }
    ActLive(); return;
  }
  const size_t index = live_cursor_++; auto& hold = dom_holds_[index];
  auto controls = DomControls(index); live_pending_ = true; hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::LiveDomValidated, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
  if (hold.local) controls->local->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
  else controls->session->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
}
void Controller::LiveDomValidated(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  live_pending_ = false; dom_holds_[index].pending = false;
  if (!AcceptLiveDom(index, std::move(value))) { HoldLive("Actual native source/target readback refused"); return; }
  LiveDomNext();
}
void Controller::RecordLive(uint8_t kind, LiveAction next) {
  if (live_record_ || live_records_.size() >= 62) { HoldLive("Original transaction record custody must settle"); return; }
  auto fact = LiveFacts(); fact.Set("recordKind", static_cast<int>(kind));
  auto encoded = base::WriteJson(fact);
  if (!encoded || encoded->empty() || encoded->size() > 512 * 1024 ||
      live_record_bytes_ > kCaptureLimit - encoded->size()) {
    HoldLive("Native immutable observation exceeds reserved recovery journal bound"); return;
  }
  live_record_ = std::make_unique<IntentRecord>(); live_record_->payload = std::move(*encoded);
  live_record_->digest = Digest(live_record_->payload); live_record_->journal = transfer_->journal;
  live_record_->upload = base::Uuid::GenerateRandomV4().AsLowercaseString();
  live_record_->ordinal = live_records_.size() + 1; live_record_->kind = kind;
  live_record_->intent_digest = intent_->digest;
  live_record_->previous_digest = live_records_.empty() ? intent_->receipt_digest : live_records_.back()->receipt_digest;
  live_after_record_ = next; StepLiveRecord();
}
void Controller::StepLiveRecord() {
  if (!live_record_ || !LiveOwners(live_rollback_)) { HoldLive("Original immutable transaction record owner changed"); return; }
  TransferIntentRecord(*live_record_);
  if (!live_record_->error.empty()) { HoldLive(live_record_->error); return; }
  if (live_record_->complete) {
    live_record_bytes_ += live_record_->payload.size(); live_records_.push_back(std::move(live_record_));
    live_action_ = live_after_record_;
  }
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::ActLive() {
  if (live_record_) { StepLiveRecord(); return; }
  if (!LiveOwners(live_rollback_)) { HoldLive("Actual native transaction custody changed"); return; }
  if (!live_failure_.empty() && !live_rollback_) { RollbackLive(live_failure_); return; }
  const auto schedule = [this] {
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
  };
  switch (live_action_) {
    case LiveAction::kExtensionAttempt:
      live_observation_domain_ = -1; RecordLive(2, LiveAction::kExtensionCommit); return;
    case LiveAction::kExtensionCommit: {
      if (live_extension_attempted_) { HoldLive("Original extension Commit cannot replay"); return; }
      live_extension_attempted_ = true; live_persistent_attempted_ = true;
      live_action_ = LiveAction::kExtensionRead; live_pending_ = true;
      Frontend::Get(profile_.get())->CommitAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveExtensionStatus, weak_.GetWeakPtr()),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
    }
    case LiveAction::kExtensionRead:
    case LiveAction::kRestoreExtensionRead:
      live_pending_ = true;
      Frontend::Get(profile_.get())->ReadbackAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveExtensionRead, weak_.GetWeakPtr()),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
    case LiveAction::kDomAttempt:
      if (live_domain_ == dom_holds_.size()) { live_action_ = LiveAction::kBackendsObserved; schedule(); return; }
      if (!live_extension_target_ || !live_extension_synced_ ||
          std::ranges::any_of(base::span(dom_holds_).first(live_domain_), [](const auto& hold) { return !hold.target_seen; })) {
        RollbackLive("Earlier backend target observation changed"); return;
      }
      live_observation_domain_ = static_cast<int>(live_domain_); RecordLive(2, LiveAction::kDomCommit); return;
    case LiveAction::kDomCommit: {
      auto& hold = dom_holds_[live_domain_]; auto controls = DomControls(live_domain_);
      if (hold.commit_attempted) { HoldLive("Original DOM Commit cannot replay"); return; }
      hold.commit_attempted = true; live_persistent_attempted_ = true;
      live_action_ = LiveAction::kDomRead; hold.pending = true; live_pending_ = true;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomStatus, weak_.GetWeakPtr(), live_domain_),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->CommitAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
      else controls->session->CommitAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback)); return;
    }
    case LiveAction::kDomRead:
    case LiveAction::kRestoreDomRead:
    case LiveAction::kPublishRead: {
      const size_t index = live_action_ == LiveAction::kRestoreDomRead ? live_domain_ - 1 : live_domain_;
      auto& hold = dom_holds_[index]; auto controls = DomControls(index);
      hold.pending = true; live_pending_ = true;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomRead, weak_.GetWeakPtr(), index),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
      else controls->session->ReadAuxUiPreferenceLease(hold.request, std::move(callback)); return;
    }
    case LiveAction::kBackendsObserved:
      if (!live_extension_target_ || !live_extension_synced_ ||
          std::ranges::any_of(dom_holds_, [](const auto& hold) {
            return !hold.target_seen || hold.mixed_seen || !hold.source->file_data_synced ||
                hold.source->target_topology_sha256.size() != 64 ||
                std::ranges::any_of(hold.source->maps, [](const auto& map) {
                  return map->target_map_sha256.size() != 64 || (map->allocation_requested && !map->allocation_observed);
                });
          })) { RollbackLive("All actual synchronized backend targets are required before publication"); return; }
      live_observation_domain_ = -2; live_domain_ = 0; RecordLive(6, LiveAction::kPublishAttempt); return;
    case LiveAction::kPublishAttempt:
      if (live_domain_ == dom_holds_.size()) { live_action_ = LiveAction::kComplete; schedule(); return; }
      live_observation_domain_ = static_cast<int>(live_domain_); RecordLive(7, LiveAction::kPublish); return;
    case LiveAction::kPublish: {
      auto& hold = dom_holds_[live_domain_]; auto controls = DomControls(live_domain_);
      if (!hold.target_seen || hold.publish_attempted) { HoldLive("Original publication must be observed instead of replayed"); return; }
      hold.publish_attempted = true; live_action_ = LiveAction::kPublishRead;
      hold.pending = true; live_pending_ = true;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomStatus, weak_.GetWeakPtr(), live_domain_),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->PublishAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
      else controls->session->PublishAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback)); return;
    }
    case LiveAction::kPublishAck:
      if (!dom_holds_[live_domain_].published || !dom_holds_[live_domain_].target_seen) {
        RollbackLive("Actual native cache publication is not acknowledged"); return;
      }
      RecordLive(8, LiveAction::kPublishAttempt); if (live_record_) ++live_domain_; return;
    case LiveAction::kComplete:
      if (!live_extension_target_ || !live_extension_synced_ ||
          std::ranges::any_of(dom_holds_, [](const auto& hold) { return !hold.published || !hold.target_seen || hold.mixed_seen; })) {
        RollbackLive("Final actual target/cache observation changed"); return;
      }
      live_target_complete_ = true;
      HoldLive("Actual live target awaits typed selected-home terminal acceptance; no automatic cleanup"); return;
    case LiveAction::kRestoreDomAttempt:
      while (live_domain_ > 0 && !dom_holds_[live_domain_ - 1].commit_attempted) --live_domain_;
      if (live_domain_ == 0) { live_action_ = LiveAction::kRestoreExtensionAttempt; schedule(); return; }
      live_observation_domain_ = static_cast<int>(live_domain_ - 1); RecordLive(4, LiveAction::kRestoreDom); return;
    case LiveAction::kRestoreDom: {
      const size_t index = live_domain_ - 1; auto& hold = dom_holds_[index]; auto controls = DomControls(index);
      hold.pending = true; live_pending_ = true; live_action_ = LiveAction::kRestoreDomRead;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveDomStatus, weak_.GetWeakPtr(), index),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()));
      if (hold.local) controls->local->RestoreAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
      else controls->session->RestoreAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback)); return;
    }
    case LiveAction::kRestoreExtensionAttempt:
      if (!live_extension_attempted_) { live_action_ = LiveAction::kRestored; schedule(); return; }
      live_observation_domain_ = -1; RecordLive(4, LiveAction::kRestoreExtension); return;
    case LiveAction::kRestoreExtension:
      live_action_ = LiveAction::kRestoreExtensionRead; live_pending_ = true;
      Frontend::Get(profile_.get())->RestoreAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::LiveExtensionStatus, weak_.GetWeakPtr()),
          base::BindOnce(&Controller::LiveLost, weak_.GetWeakPtr()))); return;
    case LiveAction::kRestored:
      if (live_extension_target_ && extension_lease_->CopyTargetRecords() != extension_lease_->CopySourceRecords()) {
        HoldLive("Actual original extension source is not restored"); return;
      }
      if (std::ranges::any_of(dom_holds_, [](const auto& hold) { return !hold.source_seen || hold.mixed_seen || hold.published; })) {
        HoldLive("Actual complete original DOM/cache sources are not restored"); return;
      }
      live_source_complete_ = true; live_active_ = false; cleanup_unknown_ = false;
      Finish("Exact original sources restored and read back; migration remains unqualified"); return;
  }
}
void Controller::LiveExtensionStatus(value_store::ValueStore::Status) {
  live_pending_ = false;
  // Even an error/drop may follow an actual write. Only the same-token physical
  // readback decides source/target and actual file-data sync, never callback status.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::LiveExtensionRead(Frontend::AuxUiMigrationReadbackResult result) {
  live_pending_ = false;
  if (!result.has_value() || !Current() || !Inventory(false) || !result->readback_file_data_synced ||
      (!result->matches_source && !result->matches_target) ||
      result->records != (result->matches_target ? extension_lease_->CopyTargetRecords() : extension_lease_->CopySourceRecords())) {
    HoldLive("Original extension physical outcome remains unknown"); return;
  }
  live_extension_synced_ = true; live_extension_target_ = result->matches_target;
  if (result->ordinary_work_queued) live_failure_ = "Ordinary extension work queued during migration";
  live_observation_domain_ = -1;
  if (live_action_ == LiveAction::kRestoreExtensionRead) {
    if (!result->matches_source || !result->source_file_data_synced) {
      HoldLive("Original extension source restore/readback is not acknowledged"); return;
    }
    RecordLive(5, LiveAction::kRestored); return;
  }
  if (!result->matches_target || !result->commit_file_data_synced) live_failure_ = "Extension target attempt did not yield its exact synced target";
  live_domain_ = 0; RecordLive(3, LiveAction::kDomAttempt);
}
void Controller::LiveDomStatus(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr) {
  live_pending_ = false; dom_holds_[index].pending = false;
  // Do not use a status payload as the fresh physical readback.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::LiveDomRead(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  live_pending_ = false; dom_holds_[index].pending = false;
  if (!AcceptLiveDom(index, std::move(value))) { HoldLive("Original DOM physical outcome remains unknown"); return; }
  const auto& hold = dom_holds_[index]; live_observation_domain_ = static_cast<int>(index);
  if (live_action_ == LiveAction::kRestoreDomRead) {
    if (!hold.source_seen || hold.published || hold.mixed_seen) {
      HoldLive("Exact original DOM/cache source restoration is not acknowledged"); return;
    }
    RecordLive(5, LiveAction::kRestoreDomAttempt); if (live_record_) --live_domain_; return;
  }
  if (live_action_ == LiveAction::kPublishRead) {
    if (!hold.target_seen || !hold.published || hold.mixed_seen) {
      RollbackLive("Actual same-token cache publication/readback did not complete"); return;
    }
    live_action_ = LiveAction::kPublishAck;
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr())); return;
  }
  if (!hold.target_seen || hold.mixed_seen) live_failure_ = "DOM target attempt requires exact original-source restoration";
  RecordLive(3, LiveAction::kDomAttempt); if (live_record_) ++live_domain_;
}
void Controller::LiveLost() {
  live_pending_ = false;
  for (auto& hold : dom_holds_) hold.pending = false;
  HoldLive("Actual native callback was lost; retain exact operation and observe original tokens");
}
void Controller::RollbackLive(std::string reason) {
  live_failure_ = std::move(reason);
  if (live_record_ && !live_record_->complete) { HoldLive("Immutable record must settle before restoration can be journaled"); return; }
  live_rollback_ = true; live_domain_ = dom_holds_.size(); live_action_ = LiveAction::kRestoreDomAttempt;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
}
void Controller::HoldLive(std::string reason) {
  error_ = std::move(reason); cleanup_unknown_ = true;
  // No timer/absent callback/data Boolean retires a physical operation, record,
  // service lease or producer. Begin resumes this exact native controller.
  ReplyResult();
}

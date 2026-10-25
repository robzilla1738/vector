bool Controller::RecoveryOwnersCurrent() {
  return recovery_mode_ && recovery_plan_ && journal_reader_ &&
      peer::InspectNativeBrowserShutdown().admitted_generation == journal_reader_->generation &&
      Current() && Inventory(false) &&
      HasValidUiStorageMigrationWorkerLease(profile_.get()) && FrontendCurrent() &&
      extension_lease_->IsRecoveryQualified() &&
      extension_lease_->RecoveryDescriptorSha256() == recovery_plan_->extension.descriptor_sha256;
}
void Controller::HoldRecovery(std::string reason) {
  // Recovery captures may describe a previous process's target. Generic abort
  // would restore that FRESH baseline, not the recorded original. Never reopen
  // writers or invoke normal Commit/Restore/cleanup from this retained phase.
  error_ = std::move(reason); recovery_pending_ = true; cleanup_unknown_ = true;
  ReplyResult();
}
bool Controller::MatchRecoveryOwners() {
  if (!recovery_plan_ || recovery_plan_->owners.size() != frames_.size() ||
      recovery_plan_->domains.size() != partitions_.size() * 2) return false;
  std::set<size_t> matched;
  for (auto& frame : frames_) {
    if (!DocumentCurrent(*frame) || !frame->source_stores || frame->native_page_id.empty()) return false;
    size_t matches = 0, ordinal = 0;
    for (size_t i = 0; i < recovery_plan_->owners.size(); ++i) {
      const auto& old = recovery_plan_->owners[i];
      if (old.page_id != frame->native_page_id || old.route != frame->native_route ||
          old.namespace_id != frame->namespace_id) continue;
      ++matches; ordinal = i;
    }
    // A persisted PageIdentity is read from the already restored native owner.
    // Neither a historical document token nor a renderer-reported scope picks
    // a current WebContents. Missing or ambiguous correspondence stays held.
    if (matches != 1 || !matched.insert(ordinal).second) return false;
    frame->recovery_owner = ordinal;
  }
  std::set<std::pair<size_t, bool>> actual_domains;
  for (auto& domain : recovery_plan_->domains) {
    size_t matches = 0, actual_ordinal = 0;
    for (size_t i = 0; i < partitions_.size(); ++i) {
      const auto config = partitions_[i]->GetConfig();
      if (config.partition_domain() == domain.partition_domain && config.partition_name() == domain.partition_name &&
          config.in_memory() == domain.partition_in_memory) { ++matches; actual_ordinal = i; }
    }
    if (matches != 1 || !actual_domains.emplace(actual_ordinal, domain.local).second) return false;
    domain.partition = actual_ordinal;
  }
  return true;
}
void Controller::ResumeRecoveryQualification() {
  if (!recovery_mode_ || !recovery_plan_ || !Current() || !Inventory(false)) {
    HoldRecovery("Actual recovery owner/binding changed; original journal remains retained"); return;
  }
  if (frontend_begin_unknown_) {
    auto* frontend = Frontend::Get(profile_.get());
    if (!frontend) { HoldRecovery("Actual original recovery frontend unavailable"); return; }
    auto observed = frontend->ObserveAuxUiMigrationLease(frontend_request_id_);
    if (!observed.has_value() || observed->preparation_pending || !observed->lease ||
        !observed->recovery_requested || !observed->recovery_qualified ||
        observed->recovery_descriptor_sha256 != recovery_plan_->extension.descriptor_sha256) {
      HoldRecovery("Original recovery frontend preparation is still unknown"); return;
    }
    extension_lease_ = std::move(observed->lease); frontend_begin_unknown_ = false;
    FrontendPrepared(Frontend::AuxUiMigrationLeaseResult(std::move(extension_lease_))); return;
  }
  if (!extension_lease_) {
    for (size_t i = 0; i < frames_.size(); ++i) {
      if (frames_[i]->prepared && !frames_[i]->cleanup_unknown) continue;
      cursor_ = i + 1;
      Invoke(i, "auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),
          base::BindOnce(&Controller::ObservePrepared, weak_.GetWeakPtr(), i)); return;
    }
    if (worker_attempted_) {
      ReadUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::WorkerPrepared, weak_.GetWeakPtr()),
          base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), false)));
    } else BeginWorker();
    return;
  }
  if (!recovery_fresh_sealed_) {
    // A lost initial DOM Begin is observed on its original native request.
    for (size_t i = 0; i < dom_holds_.size(); ++i) {
      auto& hold = dom_holds_[i];
      if (!hold.unknown) continue;
      auto controls = DomControls(i);
      if (!controls) { HoldRecovery("Original recovery DOM control generation changed"); return; }
      hold.pending = true; dom_cursor_ = i + 1;
      auto callback = mojo::WrapCallbackWithDropHandler(
          base::BindOnce(&Controller::BeganDom, weak_.GetWeakPtr(), i),
          base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), i));
      if (hold.local) controls->local->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
      else controls->session->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
      return;
    }
    recovery_cursor_ = 0; RecoverySealNext(); return;
  }
  recovery_cursor_ = 0; ReadRecoveryFrontend();
}
void Controller::RecoverySealNext() {
  if (!RecoveryOwnersCurrent() || !DomCurrent()) {
    HoldRecovery("Actual recovery holds changed before fresh renderer source seal"); return;
  }
  if (recovery_cursor_ == frames_.size()) {
    if (!PairDomSources() || !MatchRecoveryOwners()) {
      HoldRecovery("Fresh sealed cache/document or persisted-page correspondence does not match"); return;
    }
    recovery_fresh_sealed_ = true; recovery_cursor_ = 0; ReadRecoveryFrontend(); return;
  }
  const size_t index = recovery_cursor_++;
  Invoke(index, frames_[index]->sealed ? "auxValidateDraftMigrationCapture" : "auxSealDraftMigrationCapture",
      base::ListValue().Append(frames_[index]->lease_id).Append(frames_[index]->revision).Append("utf16-v1"),
      base::BindOnce(&Controller::RecoverySealed, weak_.GetWeakPtr(), index));
}
void Controller::RecoverySealed(size_t index, std::optional<base::DictValue> value, std::string) {
  if (!value || !AcceptLease(*frames_[index], *value, true)) {
    HoldRecovery("Original no-flush recovery renderer seal is refused or unknown"); return;
  }
  RecoverySealNext();
}
void Controller::ReadRecoveryFrontend() {
  if (!RecoveryOwnersCurrent()) { HoldRecovery("Actual original recovery frontend/worker hold changed"); return; }
  frontend_io_pending_ = true;
  Frontend::Get(profile_.get())->ReadbackAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::RecoveryFrontendRead, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::FrontendLost, weak_.GetWeakPtr(), false)));
}
void Controller::RecoveryFrontendRead(Frontend::AuxUiMigrationReadbackResult result) {
  frontend_io_pending_ = false; frontend_io_unknown_ = false;
  if (!result.has_value() || !RecoveryOwnersCurrent() || !result->readback_file_data_synced ||
      result->ordinary_work_queued || (!result->matches_source && !result->matches_target) ||
      (result->records != recovery_plan_->extension.source && result->records != recovery_plan_->extension.target)) {
    HoldRecovery("Fresh fixed-six recovery CAS/synchronized readback is unknown"); return;
  }
  recovery_extension_source_ = result->matches_source;
  recovery_extension_target_ = result->matches_target;
  recovery_cursor_ = 0; QualifyRecoveryDomNext();
}
void Controller::QualifyRecoveryDomNext() {
  if (!RecoveryOwnersCurrent() || !DomCurrent()) { HoldRecovery("Actual recovery cohort owner changed"); return; }
  if (recovery_cursor_ == dom_holds_.size()) {
    // All facts below are observations. This is not final writer closure or an
    // activation grant. Original restoration/adoption must first be protected
    // by a new durable branch intent; no old tail is overwritten here.
    recovery_qualified_ = true;
    HoldRecovery("Verified original journal joined to fresh held native owners; durable restoration/adoption remains pending"); return;
  }
  const size_t index = recovery_cursor_;
  auto& hold = dom_holds_[index]; auto controls = DomControls(index);
  if (!controls || !hold.token || hold.pending) { HoldRecovery("Original recovery DOM request/token unavailable"); return; }
  auto domain = std::ranges::find_if(recovery_plan_->domains, [&](const auto& item) {
    return item.partition == hold.partition && item.local == hold.local;
  });
  if (domain == recovery_plan_->domains.end()) { HoldRecovery("Recorded native domain correspondence is incomplete"); return; }
  hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::RecoveryDomRead, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::RecoveryDomLost, weak_.GetWeakPtr(), index));
  if (!hold.recovery_attempted) {
    hold.recovery_attempted = true;
    if (hold.local) controls->local->RequalifyAuxUiPreferenceLease(hold.request, *hold.token, domain->descriptor.Clone(), std::move(callback));
    else controls->session->RequalifyAuxUiPreferenceLease(hold.request, *hold.token, domain->descriptor.Clone(), std::move(callback));
  } else if (hold.recovery && !hold.recovery->source_absence_cancellation && !hold.recovery->recovery_cache_prepared && !hold.recovery_prepare_attempted) {
    hold.recovery_prepare_attempted = true;
    if (hold.local) controls->local->PrepareAuxUiPreferenceRecoveryCaches(hold.request, *hold.token, std::move(callback));
    else controls->session->PrepareAuxUiPreferenceRecoveryCaches(hold.request, *hold.token, std::move(callback));
  } else {
    // Unknown reply is observed on the SAME opaque request/token. Never replay
    // initial requalification or a mutating preparation to guess completion.
    if (hold.local) controls->local->ReadAuxUiPreferenceRecovery(hold.request, *hold.token, std::move(callback));
    else controls->session->ReadAuxUiPreferenceRecovery(hold.request, *hold.token, std::move(callback));
  }
}
void Controller::RecoveryDomLost(size_t index) {
  dom_holds_[index].pending = false;
  HoldRecovery("Original native recovery RPC outcome remains unknown; same request retained");
}
void Controller::RecoveryDomRead(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  auto& hold = dom_holds_[index]; hold.pending = false;
  auto domain = std::ranges::find_if(recovery_plan_->domains, [&](const auto& item) {
    return item.partition == hold.partition && item.local == hold.local;
  });
  if (!RecoveryOwnersCurrent() || !DomControls(index) || domain == recovery_plan_->domains.end() ||
      !value || value->request_id != hold.request || !value->held || value->released || value->aborted ||
      value->token != hold.token || !value->error.empty() || !value->file_data_synced ||
      value->ordinary_work_queued || value->source_ready ||
      (!value->matches_source && !value->matches_target && !value->known_source_target_mixture) ||
      value->source_topology_sha256 != domain->descriptor->source_topology_sha256 ||
      value->maps.size() != domain->descriptor->maps.size()) {
    HoldRecovery("Native original source/target requalification remains refused or unknown"); return;
  }
  // Exact selected raw bytes and original metadata stay paired to the verified
  // descriptor. The service separately proves full raw/unrelated-map topology.
  for (const auto& map : value->maps) {
    const auto original = std::ranges::find_if(domain->descriptor->maps,
        [&](const auto& item) { return map && item->map_ordinal == map->map_ordinal; });
    if (!map || original == domain->descriptor->maps.end() || map->storage_key != (*original)->storage_key ||
        map->session_ids != (*original)->session_ids || map->map_id != (*original)->map_id ||
        map->source_persisted != (*original)->source_persisted || map->source_entries != (*original)->source_entries ||
        map->target_entries != (*original)->target_entries || map->source_map_sha256 != (*original)->source_map_sha256 ||
        map->source_last_accessed_us != (*original)->source_last_accessed_us ||
        map->source_last_modified_us != (*original)->source_last_modified_us ||
        map->source_total_size_bytes != (*original)->source_total_size_bytes) {
      HoldRecovery("Original recovery raw records or metadata no longer pair"); return;
    }
  }
  hold.recovery = std::move(value);
  if (hold.recovery->source_absence_cancellation) {
    HoldRecovery("Native source-absence proof retained; original producer/source-proof handoff not yet joined"); return;
  }
  if (!hold.recovery->recovery_cache_prepared) {
    if (hold.recovery_prepare_attempted) { HoldRecovery("Original cache recovery preparation remains pending"); return; }
    QualifyRecoveryDomNext(); return;
  }
  ++recovery_cursor_; QualifyRecoveryDomNext();
}

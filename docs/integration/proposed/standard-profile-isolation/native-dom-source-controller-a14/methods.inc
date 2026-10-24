std::optional<content::DOMStorageContext::AuxUiMigrationControls>
Controller::DomControls(size_t index) const {
  if (!profile_ || index >= dom_holds_.size()) return std::nullopt;
  const auto& hold = dom_holds_[index];
  if (hold.partition >= partitions_.size()) return std::nullopt;
  auto* context = partitions_[hold.partition]->GetDOMStorageContext();
  if (!context) return std::nullopt;
  auto controls = context->GetExistingAuxUiMigrationControls();
  if (!controls || !controls->local || !controls->session || !controls->generation ||
      (hold.generation && hold.generation != controls->generation)) return std::nullopt;
  return controls;
}
bool Controller::DomCurrent() const {
  if (!Current() || dom_holds_.size() != partitions_.size() * 2 || dom_holds_.empty()) return false;
  for (size_t i = 0; i < dom_holds_.size(); ++i) {
    const auto& hold = dom_holds_[i];
    if (!hold.attempted || hold.pending || hold.unknown || hold.released || !hold.token ||
        !hold.source || !DomControls(i)) return false;
  }
  return true;
}
bool Controller::AcceptDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  if (index >= dom_holds_.size() || !DomControls(index)) return false;
  auto& hold = dom_holds_[index];
  if (!value || value->request_id != hold.request || !value->held || value->released || value->aborted ||
      !value->token || value->token->is_empty() || (hold.token && hold.token != value->token)) return false;
  // Binding an exact original held token permits cleanup even when subsequent
  // source/cache facts refuse. It does not turn those facts into readiness.
  hold.token = value->token;
  if (!value->ok || !value->error.empty() || !value->source_ready || !value->private_target_staged ||
      !value->matches_source || !value->file_data_synced || value->ordinary_work_queued ||
      value->target_attempted || value->cache_published || value->maps.size() > 4096 ||
      value->source_topology_sha256.size() != 64 || value->target_topology_sha256.size() != 64) return false;
  std::set<uint32_t> ordinals;
  for (const auto& map : value->maps) {
    if (!map || !ordinals.insert(map->map_ordinal).second || map->source_map_sha256.size() != 64 ||
        map->target_map_sha256.size() != 64 || map->source_entries.size() > 4096 ||
        map->cache_views.size() > 256) return false;
  }
  if (hold.source && (hold.source->maps != value->maps ||
      hold.source->source_topology_sha256 != value->source_topology_sha256 ||
      hold.source->target_topology_sha256 != value->target_topology_sha256)) return false;
  hold.source = std::move(value); hold.unknown = false;
  return true;
}
bool Controller::PairDomSources() const {
  if (!DomCurrent()) return false;
  std::vector<std::array<bool, 2>> covered(frames_.size(), {false, false});
  size_t units = 0, views = 0;
  for (const auto& hold : dom_holds_) {
    for (const auto& map : hold.source->maps) {
      for (const auto& view : map->cache_views) {
        if (!view || !view->cache || ++views > 1024) return false;
        const auto& cache = *view->cache;
        if (!cache.ok || !cache.held || cache.tainted || cache.published || !cache.error.empty() ||
            cache.sources.empty() || cache.sources.size() > 256 || cache.source_entries.size() > 4096 ||
            (hold.local && !view->namespace_id.empty()) ||
            (!hold.local && !std::ranges::contains(map->session_ids, view->namespace_id))) return false;
        std::map<std::u16string, std::u16string> selected;
        for (const auto& entry : cache.source_entries) {
          if (!entry || entry->key.size() > 4194304 || entry->value.size() > 4194304 ||
              units > 4194304 - entry->key.size() ||
              units + entry->key.size() > 4194304 - entry->value.size()) return false;
          units += entry->key.size() + entry->value.size();
          std::u16string key(entry->key.begin(), entry->key.end());
          if (!WireKey(key, hold.local)) continue;
          if (!selected.emplace(std::move(key), std::u16string(entry->value.begin(), entry->value.end())).second) return false;
        }
        std::set<base::Token> source_ids;
        for (const auto& source : cache.sources) {
          if (!source || !source_ids.insert(source->source_id).second) return false;
          size_t matches = 0;
          for (size_t i = 0; i < frames_.size(); ++i) {
            const auto& frame = *frames_[i];
            auto* actual = frame.document.AsRenderFrameHostIfValid();
            if (source->frame != frame.native_frame_token || source->document != frame.native_document_token) continue;
            if (!DocumentCurrent(frame) || !frame.sealed || !frame.source_stores || !actual ||
                actual->GetStoragePartition() != partitions_[hold.partition] ||
                map->storage_key != actual->GetStorageKey() ||
                (!hold.local && view->namespace_id != frame.namespace_id) ||
                selected != (hold.local ? frame.source_stores->local : frame.source_stores->session)) return false;
            covered[i][hold.local ? 0 : 1] = true; ++matches;
          }
          // No arbitrary renderer token can choose a document/root. Every
          // observer source must join exactly one already held actual document.
          if (matches != 1) return false;
        }
      }
    }
  }
  return std::ranges::all_of(covered, [](const auto& row) { return row[0] && row[1]; });
}
void Controller::BeginDomNext() {
  if (!Inventory(false) || !FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Actual source owners changed before DOM cohort closure"); return;
  }
  if (dom_cursor_ == dom_holds_.size()) {
    sealing_ = true; dom_cursor_ = 0; ValidateDomNext(); return;
  }
  const size_t index = dom_cursor_++;
  auto controls = DomControls(index);
  if (!controls) { Finish("Existing native DOM controls unavailable; no bind/open was attempted"); return; }
  auto& hold = dom_holds_[index];
  hold.generation = controls->generation; hold.attempted = true; hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::BeganDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->BeginAuxUiPreferenceLease(hold.request, std::move(callback));
  else controls->session->BeginAuxUiPreferenceLease(hold.request, std::move(callback));
}
void Controller::BeganDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  dom_holds_[index].pending = false;
  if (!AcceptDom(index, std::move(value))) {
    dom_holds_[index].unknown = true; Finish("Actual DOM source cohort refused or remains unknown"); return;
  }
  BeginDomNext();
}
void Controller::DomLost(size_t index) {
  dom_holds_[index].pending = false; dom_holds_[index].unknown = true;
  cleanup_unknown_ = true;
  if (dom_cleaning_) { ReplyResult(); return; }
  Finish("Original DOM cohort callback was lost; exact request remains retained");
}
void Controller::ValidateDomNext() {
  if (!Inventory(false) || !FrontendCurrent() || dom_holds_.empty() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original native DOM source holds changed"); return;
  }
  for (size_t i = 0; i < dom_holds_.size(); ++i) {
    const auto& hold = dom_holds_[i];
    if (!hold.attempted || hold.released || hold.pending || !hold.token || !hold.source || !DomControls(i)) {
      Finish("Original native DOM lease custody is unavailable"); return;
    }
  }
  if (dom_cursor_ == dom_holds_.size()) {
    if (sealing_) { cursor_ = 0; SealNext(); return; }
    if (!PairDomSources()) { Finish("Sealed UTF16 source does not pair with actual native cache documents"); return; }
    ValidationComplete(); return;
  }
  const size_t index = dom_cursor_++;
  auto controls = DomControls(index); auto& hold = dom_holds_[index];
  hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ValidatedDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.unknown) {
    // A lost validation is recovered by observing the original request/token;
    // never re-Begin or mistake callback destruction for physical completion.
    if (hold.local) controls->local->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
    else controls->session->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
  } else if (hold.local) controls->local->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
  else controls->session->ValidateAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
}
void Controller::ValidatedDom(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  dom_holds_[index].pending = false;
  if (!AcceptDom(index, std::move(value))) {
    dom_holds_[index].unknown = true; Finish("Original physical DOM/cache source validation refused"); return;
  }
  ValidateDomNext();
}
void Controller::SealNext() {
  if (!DomCurrent() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Actual all-store source holds changed before final renderer seal"); return;
  }
  if (cursor_ == frames_.size()) {
    sealing_ = false; cursor_ = 0; ValidateNext(); return;
  }
  const size_t index = cursor_++;
  Invoke(index, "auxSealDraftMigrationCapture", base::ListValue().Append(frames_[index]->lease_id)
      .Append(frames_[index]->revision).Append("utf16-v1"),
      base::BindOnce(&Controller::Sealed, weak_.GetWeakPtr(), index, false));
}
void Controller::Sealed(size_t index, bool observed,
    std::optional<base::DictValue> value, std::string error) {
  if (!value || !AcceptLease(*frames_[index], *value, true)) {
    if (!observed) {
      // A lost Seal may have completed. Observe the exact original lease;
      // never reflush, replace the lease or infer absence from a dropped reply.
      Invoke(index, "auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),
          base::BindOnce(&Controller::Sealed, weak_.GetWeakPtr(), index, true)); return;
    }
    Finish(error.empty() ? "Original renderer seal could not be observed" : std::move(error)); return;
  }
  SealNext();
}
void Controller::CleanupDomNext() {
  dom_cleaning_ = true;
  while (dom_cursor_ < dom_holds_.size() &&
      (!dom_holds_[dom_cursor_].attempted || dom_holds_[dom_cursor_].released)) ++dom_cursor_;
  if (dom_cursor_ == dom_holds_.size()) { dom_cleaning_ = false; CleanupFrontend(); return; }
  const size_t index = dom_cursor_++;
  auto& hold = dom_holds_[index];
  auto controls = DomControls(index);
  if (!controls || hold.pending) { cleanup_unknown_ = true; ReplyResult(); return; }
  hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ObservedDomCleanup, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
  else controls->session->ReadAuxUiPreferenceLease(hold.request, std::move(callback));
}
void Controller::ObservedDomCleanup(size_t index, storage::mojom::AuxUiDomLeaseReplyPtr value) {
  auto& hold = dom_holds_[index]; hold.pending = false;
  auto controls = DomControls(index);
  if (controls && value && value->request_id == hold.request && value->aborted &&
      !value->ok && !value->held && !value->released && !value->token && !value->source_ready &&
      !value->target_attempted && !value->error.empty() && !hold.token) {
    // The SAME actual service recorded its definitive no-lease backend failure.
    // This retires only our source attempt; it is not current writer readiness.
    hold.released = true; hold.unknown = false; CleanupDomNext(); return;
  }
  if (!controls || !value || value->request_id != hold.request || !value->token ||
      value->token->is_empty() || (hold.token && hold.token != value->token)) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }
  hold.token = value->token;
  if (value->ok && value->released && !value->held && !value->source_ready) {
    hold.released = true; hold.unknown = false; CleanupDomNext(); return;
  }
  if (!value->held || value->released || value->aborted || value->target_attempted || value->cache_published) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }
  hold.pending = true;
  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ReleasedDom, weak_.GetWeakPtr(), index),
      base::BindOnce(&Controller::DomLost, weak_.GetWeakPtr(), index));
  if (hold.local) controls->local->ReleaseAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
  else controls->session->ReleaseAuxUiPreferenceLease(hold.request, *hold.token, std::move(callback));
}
void Controller::ReleasedDom(size_t index, bool released) {
  auto& hold = dom_holds_[index]; hold.pending = false;
  if (!released || !DomControls(index)) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }
  hold.released = true; hold.unknown = false; CleanupDomNext();
}

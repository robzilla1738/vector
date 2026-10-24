void AsyncDomStorageDatabase::RunAuxUiBackend(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback) {
  const bool local = storage_type_ == StorageType::kLocalStorage;
  auto reply = base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback,
         StatusOr<AuxUiSnapshot> result) {
        if (!owner || owner->aux_ui_migration_gate_ != state)
          result = base::unexpected(DbStatus::IOError("Original native DB owner changed"));
        std::move(callback).Run(std::move(result));
      }, weak_ptr_factory_.GetWeakPtr(), state, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      StatusOr<AuxUiSnapshot>(base::unexpected(DbStatus::IOError("Actual backend reply lost"))));
  database_.PostTaskWithThisObject(base::BindOnce(
      [](std::shared_ptr<AuxDomCapture> capture,
         std::shared_ptr<AuxMigrationWriteStatus> writes, bool local, int operation,
         std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback,
         DomStorageDatabase* database) {
        auto run = [&]() -> StatusOr<AuxUiSnapshot> {
          const url::Origin agent = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
          if (operation == 0) {
            if (writes->first_error) return base::unexpected(*writes->first_error);
            auto metadata = database->ReadAllMetadata();
            if (!metadata.has_value()) return base::unexpected(metadata.error());
            for (auto& record : metadata->map_metadata) {
              if (record.map_locator.storage_key().origin() != agent) continue;
              AuxDomMap* existing = nullptr;
              for (auto& map : capture->maps) {
                if (map.locator.storage_key() == record.map_locator.storage_key() &&
                    (local || map.locator.map_id() == record.map_locator.map_id())) existing = &map;
              }
              if (existing) {
                if (local) return base::unexpected(DbStatus::NotSupported("Ambiguous native Local map metadata"));
                for (const auto& session : record.map_locator.session_ids()) {
                  if (std::ranges::contains(existing->locator.session_ids(), session))
                    return base::unexpected(DbStatus::NotSupported("Repeated native Session map reference"));
                  existing->locator.AddSession(session);
                }
              } else {
                capture->maps.push_back({std::move(record.map_locator), {}, {},
                    record.last_accessed, record.last_modified, record.total_size, true});
              }
            }
            for (auto& locator : capture->live_locators) {
              if (locator.storage_key().origin() != agent) continue;
              AuxDomMap* found = nullptr;
              for (auto& map : capture->maps) {
                if (map.locator.storage_key() == locator.storage_key() &&
                    (local || map.locator.map_id() == locator.map_id())) found = &map;
              }
              if (found) {
                for (const auto& session : locator.session_ids())
                  if (!std::ranges::contains(found->locator.session_ids(), session))
                    return base::unexpected(DbStatus::NotSupported("Live namespace is absent from persisted native topology"));
              } else {
                if (!local && (!locator.map_id() || locator.session_ids().empty()))
                  return base::unexpected(DbStatus::NotSupported("Actual registered Session locator required"));
                capture->maps.push_back({locator.Clone(), {}, {}, {}, {}, {}, false});
              }
            }
            if (capture->maps.size() > 256)
              return base::unexpected(DbStatus::NotSupported("Finite native map inventory exceeded"));
            std::sort(capture->maps.begin(), capture->maps.end(), [](const auto& a, const auto& b) {
              if (a.locator.storage_key().Serialize() != b.locator.storage_key().Serialize())
                return a.locator.storage_key().Serialize() < b.locator.storage_key().Serialize();
              return a.locator.map_id() < b.locator.map_id();
            });
            size_t bytes = 0;
            for (auto& map : capture->maps) {
              auto entries = database->ReadMapKeyValues(map.locator.Clone());
              if (!entries.has_value()) return base::unexpected(entries.error());
              if (!map.source_persisted && !entries->empty())
                return base::unexpected(DbStatus::NotSupported("Unindexed persisted UI map needs recovery"));
              for (const auto& [key, value] : *entries) {
                bytes += key.size() + value.size();
                if (bytes > 64 * 1024 * 1024) return base::unexpected(DbStatus::NotSupported("Finite native capture bound exceeded"));
              }
              DbStatus validated = AuxValidateEntries(*entries, local);
              if (!validated.ok()) return base::unexpected(validated);
              auto target = AuxBuildTarget(*entries, local);
              if (!target.has_value()) return base::unexpected(target.error());
              map.source = std::move(*entries); map.target = std::move(*target);
            }
            capture->captured = true;
          }
          if (!capture->captured) return base::unexpected(DbStatus::IOError("Original backend capture is incomplete"));
          auto before = AuxReadDomCapture(*capture, local, database);
          if (!before.has_value()) return base::unexpected(before.error());
          if (operation == 2) {
            if (capture->target_attempted || !before->matches_source || targets.size() != capture->maps.size())
              return base::unexpected(DbStatus::IOError("Complete original source target stage required"));
            std::set<uint32_t> ordinals;
            std::vector<AuxRawMap> proposed(capture->maps.size());
            size_t export_bytes = 0;
            for (const auto& target : targets) {
              if (target.map_ordinal >= capture->maps.size() || !ordinals.insert(target.map_ordinal).second)
                return base::unexpected(DbStatus::InvalidArgument("Invalid native target ordinal"));
              const auto& map = capture->maps[target.map_ordinal];
              AuxRawMap candidate = map.source;
              for (const auto& [key, value] : AuxSelectedEntries(map.source, local)) candidate.erase(key);
              for (const auto& [key, value] : target.desired_selected_entries) {
                int format;
                auto decoded = AuxDecodeKey(key, local, &format);
                bool current = false;
                if (decoded) for (const auto& rule : kAuxUiKeyRules)
                  if (!((rule.scope == 1 && !local) || (rule.scope == 2 && local)) &&
                      AuxUiKeyMatches(*decoded, rule.target, rule.prefix)) current = true;
                if (!current || (!local && format != 3))
                  return base::unexpected(DbStatus::NotSupported("Only current native Aux target key encoding is accepted"));
                candidate[key] = value;
                export_bytes += key.size() + value.size();
              }
              if (export_bytes > 16 * 1024 * 1024)
                return base::unexpected(DbStatus::NotSupported("Finite native target bound exceeded"));
              DbStatus valid = AuxValidateEntries(candidate, local);
              if (!valid.ok()) return base::unexpected(valid);
              auto canonical = AuxBuildTarget(candidate, local);
              if (!canonical.has_value() || canonical.value() != candidate)
                return base::unexpected(DbStatus::NotSupported("Ambiguous/non-current target key encoding"));
              if (!map.source_persisted && candidate != map.source)
                return base::unexpected(DbStatus::NotSupported("New persisted map creation/absence rollback is not implemented"));
              proposed[target.map_ordinal] = std::move(candidate);
            }
            for (size_t i = 0; i < capture->maps.size(); ++i) capture->maps[i].target = std::move(proposed[i]);
          } else if (operation == 3 || operation == 4) {
            if ((operation == 3 && (capture->target_attempted || !before->matches_source)) ||
                (operation == 4 && !before->matches_source && !before->matches_target))
              return base::unexpected(DbStatus::IOError("Exact retained source/target CAS required"));
            capture->target_attempted = true; capture->file_data_synced = false;
            std::vector<DomStorageDatabase::MapBatchUpdate> updates;
            for (const auto& map : capture->maps) {
              if (map.source == map.target) continue;
              const auto& desired = operation == 3 ? map.target : map.source;
              const auto& previous = operation == 3 ? map.source : map.target;
              DomStorageDatabase::MapBatchUpdate update(map.locator.Clone());
              for (const auto& [key, value] : previous) if (!desired.contains(key)) update.keys_to_delete.push_back(key);
              for (const auto& [key, value] : desired) {
                auto existing = previous.find(key);
                if (existing == previous.end() || existing->second != value) update.entries_to_add.emplace_back(key, value);
              }
              if (local) {
                update.map_usage.emplace();
                if (map.last_accessed) update.map_usage->SetLastAccessed(*map.last_accessed);
                if (map.last_modified && map.total_size) {
                  size_t count = 0;
                  for (const auto& [key, value] : desired) count += key.size() + value.size();
                  update.map_usage->SetLastModifiedAndTotalSize(*map.last_modified,
                      operation == 3 ? base::ByteSize(count) : *map.total_size);
                }
              }
              updates.push_back(std::move(update));
            }
            DbStatus update = database->UpdateMaps(std::move(updates));
            if (!update.ok()) return base::unexpected(update);
          }
          DbStatus sync = database->SyncForAuxMigration();
          if (!sync.ok()) return base::unexpected(sync);
          capture->file_data_synced = true;
          return AuxReadDomCapture(*capture, local, database);
        };
        std::move(callback).Run(run());
      }, state->backend, aux_migration_write_status_, local, operation, std::move(targets), std::move(guarded)));
}

"""Add service callers for the queued DB drain; no native-tree mutation."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OVERLAY = Path('/private/tmp/aux-dom-storage-service-overlay-20261024-a1')
OVERLAY.mkdir(mode=0o700, exist_ok=True)
files = []
patch = []
for stem, cls, collection in [
    ('local_storage_impl', 'LocalStorageImpl', 'areas_'),
    ('session_storage_impl', 'SessionStorageImpl', 'data_maps_'),
]:
    for suffix in ['h', 'cc']:
        relative = f'components/services/storage/dom_storage/{stem}.{suffix}'
        original = (ROOT / relative).read_text()
        text = original
        anchors = []

        def replace(before, after):
            global text
            assert text.count(before) == 1, (relative, before)
            text = text.replace(before, after)
            anchors.append({'find': before, 'replace': after, 'count': 1})

        if suffix == 'h':
            replace('  void Flush() override;', '''  void Flush() override;

  // Internal queue acknowledgment for currently loaded areas only. The native
  // owner must already quiesce writers and qualify complete target coverage.
  // Never opens/repairs a DB or claims fsync, capture or migration authority.
  void DrainLoadedAreasForAuxMigration(
      AsyncDomStorageDatabase::StatusCallback callback);''')
        else:
            if '#include "mojo/public/cpp/bindings/callback_helpers.h"' not in text:
                replace('#include "storage/common/database/database_identifier.h"', '#include "mojo/public/cpp/bindings/callback_helpers.h"\n#include "storage/common/database/database_identifier.h"')
            area = 'entry.second->storage_area()'
            method = f'''void {cls}::DrainLoadedAreasForAuxMigration(
    AsyncDomStorageDatabase::StatusCallback callback) {{
  if (connection_state_ != CONNECTION_FINISHED || !database_ || in_memory_ ||
      storage_partition_directory_.empty()) {{
    std::move(callback).Run(
        DbStatus::IOError("Aux migration requires an existing disk backend"));
    return;
  }}
  for (const auto& entry : {collection}) {{
    StorageAreaImpl* area = {area};
    if (!area->initialized() || area->has_pending_load_tasks() ||
        area->database() != database_.get()) {{
      std::move(callback).Run(
          DbStatus::IOError("Aux storage areas are not ready to drain"));
      return;
    }}
  }}
  // Loaded areas have no deferred load callbacks. Scheduling their immediate
  // commits posts existing batches before the DB queue sentinel below.
  for (const auto& entry : {collection}) {{
    {area}->ScheduleImmediateCommit();
  }}
  auto reply = base::BindOnce(
      [](base::WeakPtr<{cls}> owner,
         AsyncDomStorageDatabase::StatusCallback callback, DbStatus status) {{
        if (!owner || owner->connection_state_ != CONNECTION_FINISHED ||
            !owner->database_ || owner->in_memory_) {{
          status = DbStatus::IOError("Aux storage service changed during drain");
        }}
        std::move(callback).Run(std::move(status));
      }},
      weak_ptr_factory_.GetWeakPtr(), std::move(callback));
  database_->DrainCommitsForAuxMigration(
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(
          std::move(reply),
          DbStatus::IOError("Aux storage service drain reply was lost")));
}}

'''
            replace(f'void {cls}::Flush() {{', method + f'void {cls}::Flush() {{')
        destination = OVERLAY / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(text)
        sha = lambda value: hashlib.sha256(value.encode()).hexdigest()
        files.append({'path': relative, 'inputSha256': sha(original), 'outputSha256': sha(text), 'anchors': anchors})
        patch.extend(difflib.unified_diff(original.splitlines(True), text.splitlines(True), fromfile='a/' + relative, tofile='b/' + relative))
(HERE / 'service-source-plan.json').write_text(json.dumps({
    'format': 'aux.storage-service-drain.source.v1', 'overlay': str(OVERLAY),
    'files': files}, indent=2) + '\n')
(HERE / 'service-native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'overlay': str(OVERLAY)}))

"""Project the acknowledged native DOM service seam; native tree is read-only."""
import difflib
import hashlib
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
files, patch = [], []
sha = lambda data: hashlib.sha256(data).hexdigest()

def project(name, edits):
    original = (ROOT / name).read_bytes()
    text = original.decode()
    anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (name, before[:100], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    target = HERE / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)
    files.append({'path': name, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                  'output': str(target), 'anchors': anchors})
    patch.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                    fromfile='a/' + name, tofile='b/' + name))

for kind in ['local', 'session']:
    last = '  ForceKeepSessionState();\n};' if kind == 'local' else '  DeleteNamespace(string namespace_id, bool should_persist);\n};'
    project(f'components/services/storage/public/mojom/{kind}_storage_control.mojom', [
        (last, last[:-2] + '\n' +
         '  // Browser-only acknowledgment of the existing loaded-area DB queue\n'
         '  // and explicit backend file-data sync. It neither closes writers nor\n'
         '  // proves complete capture, directory sync or migration authority.\n'
         '  // An unopened/in-memory/failed backend refuses without opening it.\n'
         '  DrainAuxUiMigration() => (bool file_data_synced);\n};'),
    ])
    class_name = 'LocalStorageImpl' if kind == 'local' else 'SessionStorageImpl'
    project(f'components/services/storage/dom_storage/{kind}_storage_impl.h', [
        ('  void Flush() override;\n',
         '  void Flush() override;\n  void DrainAuxUiMigration(DrainAuxUiMigrationCallback callback) override;\n'),
        ('  // Never opens/repairs a DB or claims fsync, capture or migration authority.',
         '  // Acknowledges backend file-data sync, not directory/cross-store\n'
         '  // durability. Never opens/repairs a DB or grants migration authority.'),
    ])
    project(f'components/services/storage/dom_storage/{kind}_storage_impl.cc', [
        (f'void {class_name}::DrainLoadedAreasForAuxMigration(',
         f'''void {class_name}::DrainAuxUiMigration(DrainAuxUiMigrationCallback callback) {{
  DrainLoadedAreasForAuxMigration(base::BindOnce(
      [](DrainAuxUiMigrationCallback reply, DbStatus status) {{
        std::move(reply).Run(status.ok());
      }}, std::move(callback)));
}}

void {class_name}::DrainLoadedAreasForAuxMigration('''),
    ])
project('content/public/browser/dom_storage_context.h', [
    ('#include "base/functional/callback.h"',
     '#include "base/functional/callback.h"\n#include "content/common/content_export.h"'),
    ('  // Deletes the local storage for `storage_key`.',
     '''  // Native browser migration queue only. The actual service must already
  // have disk backends and loaded areas. Success covers queued file-data sync
  // only, not writer closure, full inventory, directory sync or target import.
  // Unsupported implementations and lost/rebound services refuse.
  CONTENT_EXPORT virtual void DrainLoadedAreasForAuxUiMigration(
      base::OnceCallback<void(bool)> callback);

  // Deletes the local storage for `storage_key`.'''),
])
project('content/browser/dom_storage/dom_storage_context_wrapper.h', [
    ('#include <map>', '#include <cstdint>\n#include <map>'),
    ('  void StartScavengingUnusedSessionStorage() override;',
     '  void StartScavengingUnusedSessionStorage() override;\n'
     '  void DrainLoadedAreasForAuxUiMigration(\n'
     '      base::OnceCallback<void(bool)> callback) override;'),
    ('  mojo::Remote<storage::mojom::LocalStorageControl> local_storage_control_;',
     '  mojo::Remote<storage::mojom::LocalStorageControl> local_storage_control_;\n'
     '  uint64_t aux_control_generation_ = 0;'),
])
project('content/browser/dom_storage/dom_storage_context_wrapper.cc', [
    ('#include "base/command_line.h"',
     '#include "base/command_line.h"\n#include "base/barrier_callback.h"'),
    ('#include "mojo/public/cpp/bindings/callback_helpers.h"',
     '#include "mojo/public/cpp/bindings/callback_helpers.h"') if '#include "mojo/public/cpp/bindings/callback_helpers.h"' in (ROOT/'content/browser/dom_storage/dom_storage_context_wrapper.cc').read_text() else
    ('#include "storage/browser/quota/special_storage_policy.h"',
     '#include "mojo/public/cpp/bindings/callback_helpers.h"\n#include "storage/browser/quota/special_storage_policy.h"'),
    ('namespace content {\n', '''namespace content {

void DOMStorageContext::DrainLoadedAreasForAuxUiMigration(
    base::OnceCallback<void(bool)> callback) {
  std::move(callback).Run(false);
}
'''),
    ('void DOMStorageContextWrapper::GetLocalStorageUsage(', '''void DOMStorageContextWrapper::DrainLoadedAreasForAuxUiMigration(
    base::OnceCallback<void(bool)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  // Use only the actual currently bound controls. Do not open/rebind a service
  // to manufacture an acknowledgment for a missing original queue.
  if (!partition_ || !local_storage_control_ || !session_storage_control_) {
    std::move(callback).Run(false);
    return;
  }
  const uint64_t generation = aux_control_generation_;
  auto joined = base::BarrierCallback<bool>(2, base::BindOnce(
      [](scoped_refptr<DOMStorageContextWrapper> owner, uint64_t generation,
         base::OnceCallback<void(bool)> callback, std::vector<bool> replies) {
        const bool current = owner->partition_ && owner->local_storage_control_ &&
            owner->session_storage_control_ && owner->aux_control_generation_ == generation;
        std::move(callback).Run(current && std::ranges::all_of(
            replies, [](bool synced) { return synced; }));
      }, base::WrapRefCounted(this), generation, std::move(callback)));
  local_storage_control_->DrainAuxUiMigration(
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(joined), false));
  session_storage_control_->DrainAuxUiMigration(
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(joined), false));
}

void DOMStorageContextWrapper::GetLocalStorageUsage('''),
    ('  partition_ = nullptr;\n', '  ++aux_control_generation_;\n  partition_ = nullptr;\n'),
    ('  session_storage_control_.reset();\n  partition_->GetStorageService()->BindSessionStorageControl(',
     '  ++aux_control_generation_;\n  session_storage_control_.reset();\n  partition_->GetStorageService()->BindSessionStorageControl('),
    ('  local_storage_control_.reset();\n  partition_->GetStorageService()->BindLocalStorageControl(',
     '  ++aux_control_generation_;\n  local_storage_control_.reset();\n  partition_->GetStorageService()->BindLocalStorageControl('),
])
result = {'format': 'aux.native-profile-migration-controller.source.v1', 'nativeRoot': str(ROOT),
          'files': files, 'nativeCheckoutChanged': False, 'uiStylesChanged': False,
          'nativeCompiled': False, 'productExecuted': False, 'runtimeAcceptance': False,
          'drainScope': 'existing-loaded-areas-and-backend-file-data-only',
          'writerClosureImplemented': False, 'captureQualification': False,
          'targetImportImplemented': False, 'activationAuthorized': False}
(HERE / 'source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'countedAnchors': sum(len(x['anchors']) for x in files),
                  'nativeCheckoutChanged': False, 'activationAuthorized': False}))

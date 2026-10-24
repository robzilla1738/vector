"""Bind the native preference capture through actual ValueStore decorators."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
PRIOR = HERE.parent / 'ui-extension-storage-migration-a1'
OVERLAY = Path('/private/tmp/aux-extension-native-binding-overlay-20261024-a1')
OVERLAY.mkdir(mode=0o700, exist_ok=True)
sha = lambda data: hashlib.sha256(data).hexdigest()
files = []
patch = []

def project(name, edits, previous=None):
    original = (ROOT / name).read_bytes()
    source = previous.read_bytes() if previous else original
    text = source.decode()
    anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (name, before, text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    target = OVERLAY / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)
    files.append({'path': name, 'originalSha256': sha(original),
                  'inputSha256': sha(source), 'outputSha256': sha(text.encode()),
                  **({'predecessor': str(previous)} if previous else {}),
                  'anchors': anchors})
    patch.extend(difflib.unified_diff(source.decode().splitlines(True), text.splitlines(True), fromfile='a/' + name, tofile='b/' + name))

CAPTURE = '''  // Native-only capture: private construction by the real LevelDB backend.
  // Copying its data grants no authority; commit requires the live opaque token.
  class AuxUiPreferenceCapture {
   public:
    ~AuxUiPreferenceCapture();
    std::array<std::optional<std::string>, 6> CopyRecordsForNativeJournal() const;

   private:
    friend class LeveldbValueStore;
    AuxUiPreferenceCapture();
    base::WeakPtr<ValueStore> owner;
    std::array<std::optional<std::string>, 6> records;
  };
  using AuxUiPreferenceCaptureResult =
      base::expected<std::unique_ptr<AuxUiPreferenceCapture>, Status>;

  // Unsupported backends refuse. These do not open/repair a DB, close writers
  // or authorize startup. Existing virtual slot ordering remains unchanged.
  virtual AuxUiPreferenceCaptureResult CaptureAuxUiPreferencesForMigration();
  virtual Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture);
'''
project('components/value_store/value_store.h', [
    ('#include <memory>', '#include <array>\n#include <memory>'),
    ('#include "base/functional/callback.h"', '#include "base/functional/callback.h"\n#include "base/memory/weak_ptr.h"\n#include "base/types/expected.h"'),
    ('  virtual WriteResult Clear() = 0;', '  virtual WriteResult Clear() = 0;\n\n' + CAPTURE),
])
project('components/value_store/value_store.cc', [(
    '}  // namespace value_store',
    '''ValueStore::AuxUiPreferenceCapture::AuxUiPreferenceCapture() = default;
ValueStore::AuxUiPreferenceCapture::~AuxUiPreferenceCapture() = default;

std::array<std::optional<std::string>, 6>
ValueStore::AuxUiPreferenceCapture::CopyRecordsForNativeJournal() const {
  return records;
}

ValueStore::AuxUiPreferenceCaptureResult
ValueStore::CaptureAuxUiPreferencesForMigration() {
  return base::unexpected(Status(OTHER_ERROR, "Aux migration backend unsupported"));
}

ValueStore::Status ValueStore::CommitAuxUiPreferenceMigration(
    std::unique_ptr<AuxUiPreferenceCapture> capture) {
  return Status(OTHER_ERROR, "Aux migration backend unsupported");
}

}  // namespace value_store''')])

name = 'components/value_store/leveldb_value_store.h'
previous = PRIOR / 'source' / name
text = previous.read_text()
start = text.index('  class AuxUiPreferenceCapture {')
end = text.index('\n  // Write directly to the backing levelDB.', start)
project(name, [(text[start:end], '''  AuxUiPreferenceCaptureResult CaptureAuxUiPreferencesForMigration() override;
  Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture) override;
''')], previous)
name = 'components/value_store/leveldb_value_store.cc'
project(name, [('LeveldbValueStore::AuxUiPreferenceCapture::AuxUiPreferenceCapture() = default;\nLeveldbValueStore::AuxUiPreferenceCapture::~AuxUiPreferenceCapture() = default;\n\n', '')], PRIOR / 'source' / name)

for stem, cls in [('settings_storage_quota_enforcer', 'SettingsStorageQuotaEnforcer'),
                  ('weak_unlimited_settings_storage', 'WeakUnlimitedSettingsStorage')]:
    prefix = 'extensions/browser/api/storage/' + stem
    project(prefix + '.h', [('  WriteResult Clear() override;', '''  WriteResult Clear() override;
  AuxUiPreferenceCaptureResult CaptureAuxUiPreferencesForMigration() override;
  Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture) override;''')])
    body = '''  // A sync error can have applied the batch. Invalidate on every attempt;
  // do not read/repair storage here or treat a failed result as success.
  usage_calculated_ = false;
  used_total_ = 0;
  used_per_setting_.clear();
''' if cls == 'SettingsStorageQuotaEnforcer' else ''
    methods = f'''ValueStore::AuxUiPreferenceCaptureResult
{cls}::CaptureAuxUiPreferencesForMigration() {{
  return delegate_->CaptureAuxUiPreferencesForMigration();
}}

ValueStore::Status {cls}::CommitAuxUiPreferenceMigration(
    std::unique_ptr<AuxUiPreferenceCapture> capture) {{
{body}  return delegate_->CommitAuxUiPreferenceMigration(std::move(capture));
}}

'''
    edits = [('}  // namespace extensions', methods + '}  // namespace extensions')]
    if cls == 'WeakUnlimitedSettingsStorage':
        edits.insert(0, ('#include "extensions/browser/api/storage/weak_unlimited_settings_storage.h"', '#include "extensions/browser/api/storage/weak_unlimited_settings_storage.h"\n\n#include <memory>\n#include <utility>'))
    project(prefix + '.cc', edits)

project('extensions/browser/api/storage/storage_frontend.h', [(
    '  // Deletes the settings for the given `extension_id` and synchronously invokes',
    '''  // Internal Aux migration routing only, not an extension API or admission.
  // The native owner must supply the actual regular profile/epoch and retain
  // writer/journal ownership across these asynchronous operations.
  using AuxUiPreferenceCaptureCallback = base::OnceCallback<void(
      value_store::ValueStore::AuxUiPreferenceCaptureResult)>;
  void CaptureAuxUiPreferencesForMigration(
      scoped_refptr<const Extension> extension,
      AuxUiPreferenceCaptureCallback callback);
  void CommitAuxUiPreferenceMigration(
      scoped_refptr<const Extension> extension,
      std::unique_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture,
      base::OnceCallback<void(value_store::ValueStore::Status)> callback);

  // Deletes the settings for the given `extension_id` and synchronously invokes'''), (
    '  // Constructor for tests.',
    '''  bool CanUseAuxUiMigrationBackend(const Extension& extension) const;

  // Constructor for tests.''')])

agent_id = json.loads((REPO / 'docs/design/extension-identities.json').read_text())['agent']['id']
assert agent_id == 'gokkffaiccpmoeodpmeamcjajcagjmkm'
FRONTEND = '''bool StorageFrontend::CanUseAuxUiMigrationBackend(
    const Extension& extension) const {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  const ExtensionRegistry* registry = ExtensionRegistry::Get(browser_context_);
  return !browser_context_->IsOffTheRecord() && registry &&
         extension.id() == "__AUX_AGENT_ID__" &&
         registry->enabled_extensions().GetByID(extension.id()) == &extension &&
         IsStorageEnabled(settings_namespace::LOCAL);
}

void StorageFrontend::CaptureAuxUiPreferencesForMigration(
    scoped_refptr<const Extension> extension,
    AuxUiPreferenceCaptureCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  using Result = ValueStore::AuxUiPreferenceCaptureResult;
  if (!extension || !CanUseAuxUiMigrationBackend(*extension)) {
    std::move(callback).Run(base::unexpected(
        ValueStore::Status(ValueStore::OTHER_ERROR, "Aux migration route refused")));
    return;
  }
  auto reply = base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         scoped_refptr<const Extension> extension,
         AuxUiPreferenceCaptureCallback callback, Result result) {
        if (!owner || !owner->CanUseAuxUiMigrationBackend(*extension)) {
          result = base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux migration route was lost"));
        }
        std::move(callback).Run(std::move(result));
      },
      weak_factory_.GetWeakPtr(), extension, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      Result(base::unexpected(ValueStore::Status(
          ValueStore::OTHER_ERROR, "Aux migration capture reply was lost"))));
  RunWithStorage(extension, settings_namespace::LOCAL, base::BindOnce(
      [](AuxUiPreferenceCaptureCallback callback, ValueStore* storage) {
        if (!storage) {
          std::move(callback).Run(base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux migration storage unavailable")));
          return;
        }
        std::move(callback).Run(storage->CaptureAuxUiPreferencesForMigration());
      },
      std::move(guarded)));
}

void StorageFrontend::CommitAuxUiPreferenceMigration(
    scoped_refptr<const Extension> extension,
    std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,
    base::OnceCallback<void(ValueStore::Status)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (!capture || !extension || !CanUseAuxUiMigrationBackend(*extension)) {
    std::move(callback).Run(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Aux migration route refused"));
    return;
  }
  auto reply = base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         scoped_refptr<const Extension> extension,
         base::OnceCallback<void(ValueStore::Status)> callback,
         ValueStore::Status result) {
        // Lost routing after commit can conceal a completed write. Keep it an
        // error/unknown outcome for journal readback; do not blindly retry.
        if (!owner || !owner->CanUseAuxUiMigrationBackend(*extension)) {
          result = ValueStore::Status(ValueStore::OTHER_ERROR,
                                     "Aux migration commit route was lost");
        }
        std::move(callback).Run(std::move(result));
      },
      weak_factory_.GetWeakPtr(), extension, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      ValueStore::Status(ValueStore::OTHER_ERROR,
                         "Aux migration commit reply was lost"));
  RunWithStorage(extension, settings_namespace::LOCAL, base::BindOnce(
      [](std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,
         base::OnceCallback<void(ValueStore::Status)> callback,
         ValueStore* storage) {
        if (!storage) {
          std::move(callback).Run(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux migration storage unavailable"));
          return;
        }
        std::move(callback).Run(
            storage->CommitAuxUiPreferenceMigration(std::move(capture)));
      },
      std::move(capture), std::move(guarded)));
}

'''.replace('__AUX_AGENT_ID__', agent_id)
project('extensions/browser/api/storage/storage_frontend.cc', [(
    '#include "base/strings/stringprintf.h"',
    '#include "base/strings/stringprintf.h"\n#include "base/task/bind_post_task.h"'), (
    '#include "third_party/leveldatabase/env_chromium.h"',
    '#include "third_party/leveldatabase/env_chromium.h"\n#include "mojo/public/cpp/bindings/callback_helpers.h"'), (
    'void StorageFrontend::RunWithStorage(', FRONTEND + 'void StorageFrontend::RunWithStorage(')])

project('extensions/browser/api/storage/BUILD.gn', [(
    '    "//extensions/common/api",\n  ]\n}',
    '    "//extensions/common/api",\n    "//mojo/public/cpp/bindings",\n  ]\n}')])

(HERE / 'source-plan.json').write_text(json.dumps({
    'format': 'aux.ui-extension-native-binding.source.v1', 'overlay': str(OVERLAY),
    'agentIdentitySha256': sha((REPO / 'docs/design/extension-identities.json').read_bytes()),
    'files': files}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'overlay': str(OVERLAY)}))

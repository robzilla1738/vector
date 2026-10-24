"""Project a bounded extension-storage migration without editing the native tree."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
SHA = lambda value: hashlib.sha256(value).hexdigest()

HEADER = '''
  // Backend-only preparation. Never opens, repairs or deletes a database.
  // Call on the owning backend sequence after profile writers are quiesced.
  // The capture is invalidated by intervening ordinary store operations.
  // These methods neither grant profile authority nor commit other UI stores.
  class AuxUiPreferenceCapture {
   public:
    ~AuxUiPreferenceCapture();

   private:
    friend class LeveldbValueStore;
    AuxUiPreferenceCapture();
    base::WeakPtr<LeveldbValueStore> owner;
    std::array<std::optional<std::string>, 6> records;
  };
  using AuxUiPreferenceCaptureResult =
      base::expected<std::unique_ptr<AuxUiPreferenceCapture>, Status>;
  AuxUiPreferenceCaptureResult CaptureAuxUiPreferencesForMigration();
  Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture);
'''

IMPLEMENTATION = '''
LeveldbValueStore::AuxUiPreferenceCapture::AuxUiPreferenceCapture() = default;
LeveldbValueStore::AuxUiPreferenceCapture::~AuxUiPreferenceCapture() = default;

LeveldbValueStore::AuxUiPreferenceCaptureResult
LeveldbValueStore::CaptureAuxUiPreferencesForMigration() {
  if (!db()) {
    return base::unexpected(Status(OTHER_ERROR,
                                  "Aux migration requires an open backend"));
  }
  auto capture = base::WrapUnique(new AuxUiPreferenceCapture());
  capture->owner = aux_migration_weak_factory_.GetWeakPtr();
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); ++i) {
    std::string raw;
    const leveldb::Status status =
        db()->Get(read_options(), kAuxUiPreferenceKeys[i], &raw);
    if (status.IsNotFound()) {
      continue;
    }
    if (!status.ok()) {
      return base::unexpected(ToValueStoreError(status));
    }
    std::optional<base::Value> value =
        base::JSONReader::Read(raw, base::JSON_PARSE_CHROMIUM_EXTENSIONS);
    if (!value || !IsValidAuxUiPreference(*value, i / 2)) {
      return base::unexpected(Status(CORRUPTION,
                                    "Invalid Aux migration preference"));
    }
    capture->records[i] = std::move(raw);
  }
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); i += 2) {
    if (capture->records[i] && capture->records[i + 1] &&
        capture->records[i] != capture->records[i + 1]) {
      return base::unexpected(Status(OTHER_ERROR,
                                    "Conflicting Aux migration preference"));
    }
  }
  return capture;
}

ValueStore::Status LeveldbValueStore::CommitAuxUiPreferenceMigration(
    std::unique_ptr<AuxUiPreferenceCapture> capture) {
  if (!capture || capture->owner.get() != this || !db()) {
    return Status(OTHER_ERROR, "Stale or foreign Aux preference capture");
  }
  // Consume all captures before touching the database. A failed sync can have
  // an unknown outcome; only a new native-authorized capture may retry.
  aux_migration_weak_factory_.InvalidateWeakPtrs();
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); ++i) {
    std::string raw;
    const leveldb::Status status =
        db()->Get(read_options(), kAuxUiPreferenceKeys[i], &raw);
    if (!status.ok() && !status.IsNotFound()) {
      return ToValueStoreError(status);
    }
    std::optional<std::string> current;
    if (status.ok()) {
      current = std::move(raw);
    }
    if (current != capture->records[i]) {
      return Status(OTHER_ERROR, "Aux preference changed after capture");
    }
  }
  leveldb::WriteBatch batch;
  for (size_t i = 0; i < kAuxUiPreferenceKeys.size(); i += 2) {
    if (capture->records[i]) {
      // Preserve exact original JSON bytes, including explicit false values.
      batch.Put(kAuxUiPreferenceKeys[i + 1], *capture->records[i]);
      batch.Delete(kAuxUiPreferenceKeys[i]);
    }
  }
  leveldb::WriteOptions options;
  options.sync = true;
  // An empty batch still requests sync; a retry must not mistake a previous
  // write with an unknown sync outcome for a durable completed migration.
  return ToValueStoreError(db()->Write(options, &batch));
}
'''

CONSTANTS = '''
constexpr std::array<const char*, 6> kAuxUiPreferenceKeys = {
    "aside.browserColorScheme", "aux.browserColorScheme.v2",
    "aside.capture.enabled", "aux.capture.enabled.v2",
    "aside.tabsTidy.customPrompt", "aux.tabsTidy.customPrompt.v2"};

bool IsValidAuxUiPreference(const base::Value& value, size_t family) {
  if (family == 1) {
    return value.is_bool();
  }
  if (!value.is_string()) {
    return false;
  }
  const std::string& text = value.GetString();
  if (family == 0) {
    return text == "system" || text == "light" || text == "dark";
  }
  // The supplied UI's 300-character limit counts UTF-16 code units.
  return base::UTF8ToUTF16(text).size() <= 300;
}
'''

files = []
patches = []
for name in ['leveldb_value_store.h', 'leveldb_value_store.cc']:
    relative = 'components/value_store/' + name
    original = (ROOT / relative).read_bytes()
    text = original.decode()
    anchors = []

    def replace(before, after):
        global text
        assert text.count(before) == 1, (relative, before)
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})

    if name.endswith('.h'):
        replace('#include <memory>', '#include <array>\n#include <memory>\n#include <optional>')
        replace('#include "base/compiler_specific.h"', '#include "base/compiler_specific.h"\n#include "base/memory/weak_ptr.h"\n#include "base/types/expected.h"')
        replace('  // Write directly to the backing levelDB.', HEADER + '\n  // Write directly to the backing levelDB.')
        replace('  ValueStore::Status WriteToDb(leveldb::WriteBatch* batch);', '  ValueStore::Status WriteToDb(leveldb::WriteBatch* batch);\n\n  base::WeakPtrFactory<LeveldbValueStore> aux_migration_weak_factory_{this};')
    else:
        replace('#include "base/notreached.h"', '#include "base/notreached.h"\n#include "base/memory/ptr_util.h"')
        replace('#include "base/strings/sys_string_conversions.h"', '#include "base/strings/sys_string_conversions.h"\n#include "base/strings/utf_string_conversions.h"')
        replace('const char kCannotSerialize[] = "Cannot serialize value to JSON";', 'const char kCannotSerialize[] = "Cannot serialize value to JSON";\n' + CONSTANTS)
        # Every ordinary entry point that may write, open or repair invalidates
        # captures, including read helpers whose existing corruption recovery
        # can delete a value or recreate its database. Delegating wrappers need
        # no second invalidation.
        for signature in [
            'ValueStore::ReadResult LeveldbValueStore::GetKeys() {',
            '    const std::vector<std::string>& keys) {',
            'ValueStore::ReadResult LeveldbValueStore::Get() {',
            '                                               const base::Value& value) {',
            '    const base::DictValue& settings) {',
            'ValueStore::WriteResult LeveldbValueStore::Clear() {',
            'bool LeveldbValueStore::WriteToDbForTest(leveldb::WriteBatch* batch) {',
        ]:
            # Get(vector) and Remove(vector) share a signature; count both
            # explicitly rather than allowing unconstrained replacement.
            count = 2 if signature == '    const std::vector<std::string>& keys) {' else 1
            assert text.count(signature) == count, (signature, text.count(signature))
            new = signature + '\n  aux_migration_weak_factory_.InvalidateWeakPtrs();'
            text = text.replace(signature, new)
            anchors.append({'find': signature, 'replace': new, 'count': count})
        replace('bool LeveldbValueStore::WriteToDbForTest(leveldb::WriteBatch* batch) {', IMPLEMENTATION + '\nbool LeveldbValueStore::WriteToDbForTest(leveldb::WriteBatch* batch) {')
    output = text.encode()
    path = HERE / 'source' / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(output)
    files.append({'path': relative, 'inputSha256': SHA(original), 'outputSha256': SHA(output), 'anchors': anchors})
    patches.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True), fromfile='a/' + relative, tofile='b/' + relative))

(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.extension-storage-migration.source.v1', 'files': files}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'files': len(files), 'countedAnchors': sum(sum(a['count'] for a in f['anchors']) for f in files)}))

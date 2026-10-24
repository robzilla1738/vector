"""Project a paired DOM-storage sync implementation into a private overlay."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
PREVIOUS = HERE.parent / 'ui-storage-native-drain-a1'
OVERLAY = Path('/private/tmp/aux-dom-storage-durable-overlay-20261024-a1')
OVERLAY.mkdir(mode=0o700, exist_ok=True)
PREFIX = 'components/services/storage/dom_storage/'
files = []
patch = []
sha = lambda value: hashlib.sha256(value).hexdigest()

SQL_HELPER = '''DbStatus SyncDatabaseForAuxMigration(sql::Database& database) {
  if (!database.is_open() || database.transaction_nesting() != 0) {
    return DbStatus::IOError("Aux sync requires an open idle SQLite backend");
  }
  {
    sql::Statement mode(database.GetUniqueStatement("PRAGMA journal_mode"));
    if (!mode.Step() || mode.ColumnString(0) != "wal") {
      return DbStatus::IOError("Aux sync requires an existing WAL database");
    }
  }
  int previous_mode;
  {
    sql::Statement mode(database.GetUniqueStatement("PRAGMA synchronous"));
    if (!mode.Step()) {
      return storage::FromSqliteCode(database);
    }
    previous_mode = mode.ColumnInt(0);
    if (previous_mode < 0 || previous_mode > 3) {
      return DbStatus::IOError("Unsupported SQLite synchronous mode");
    }
  }
  // A checkpoint may skip xSync when earlier OFF-mode checkpointing already
  // backfilled every page. Sync existing files before truncating that WAL.
  if (!database.SyncOpenFilesForAuxMigration()) {
    return DbStatus::IOError("SQLite migration pre-checkpoint sync failed");
  }
  // Do not weaken FULL/EXTRA. OFF/NORMAL temporarily become FULL so a
  // completed checkpoint requests a real WAL/database sync from the VFS.
  const bool change_mode = previous_mode < 2;
  DbStatus result = DbStatus::OK();
  if (change_mode && !database.Execute("PRAGMA synchronous=FULL")) {
    result = storage::FromSqliteCode(database);
  }
  if (result.ok()) {
    sql::Statement mode(database.GetUniqueStatement("PRAGMA synchronous"));
    if (!mode.Step() || mode.ColumnInt(0) < 2) {
      result = DbStatus::IOError("SQLite did not enable migration sync");
    }
  }
  // The mode query is finalized before checkpointing. TRUNCATE refuses busy
  // readers instead of reporting a partial passive checkpoint as completion.
  if (result.ok() && !database.CheckpointDatabase(/*truncate=*/true)) {
    result = storage::FromSqliteCode(database);
  }
  if (result.ok() && !database.SyncOpenFilesForAuxMigration()) {
    result = DbStatus::IOError("SQLite migration post-checkpoint sync failed");
  }
  // Capture checkpoint errors before this call overwrites SQLite's last code.
  // Restore the ordinary policy even on failure; restoration failure remains
  // an unknown migration outcome and cannot authorize profile activation.
  if (change_mode &&
      !(previous_mode == 0 ? database.Execute("PRAGMA synchronous=OFF")
                          : database.Execute("PRAGMA synchronous=NORMAL"))) {
    return DbStatus::IOError("Could not restore SQLite sync policy");
  }
  return result;
}

'''

def project(relative, edits, predecessor=None):
    original = (ROOT / relative).read_bytes()
    before = (predecessor.read_bytes() if predecessor else original)
    text = before.decode()
    anchors = []
    for find, replacement in edits:
        assert text.count(find) == 1, (relative, find)
        text = text.replace(find, replacement)
        anchors.append({'find': find, 'replace': replacement, 'count': 1})
    destination = OVERLAY / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(text)
    row = {'path': relative, 'originalSha256': sha(original),
           'inputSha256': sha(before), 'outputSha256': sha(text.encode()),
           'anchors': anchors}
    if predecessor:
        row['predecessor'] = str(predecessor)
    files.append(row)
    patch.extend(difflib.unified_diff(before.decode().splitlines(True), text.splitlines(True), fromfile='a/' + relative, tofile='b/' + relative))

project(PREFIX + 'dom_storage_database.h', [(
    '  virtual void SetDestructionCallbackForTesting(base::OnceClosure callback) = 0;',
    '''  virtual void SetDestructionCallbackForTesting(base::OnceClosure callback) = 0;

  // Migration-only backend sync. Call on the DB sequence with writers closed.
  // Keep this after existing virtual methods to retain their slot ordering.
  // Unsupported/test implementations refuse rather than simulate completion.
  virtual DbStatus SyncForAuxMigration();''')])
project(PREFIX + 'dom_storage_database.cc', [(
    'namespace storage {',
    '''namespace storage {

DbStatus DomStorageDatabase::SyncForAuxMigration() {
  return DbStatus::IOError("DOM storage sync is unsupported by this backend");
}
''')])

project('sql/database.h', [(
    '  bool CheckpointDatabase(bool truncate = false);',
    '''  bool CheckpointDatabase(bool truncate = false);

  // Migration-only sync of currently open main/journal files, journal first.
  // Requires this connection's sequence, an open disk DB and no transaction.
  // Never opens files or grants profile authority. Returns false on any error.
  bool SyncOpenFilesForAuxMigration();''')])
project('sql/database.cc', [(
    'bool Database::CheckpointDatabase(bool truncate) {',
    '''bool Database::SyncOpenFilesForAuxMigration() {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  if (!is_open() || in_memory_ || transaction_nesting_ != 0) {
    return false;
  }
  auto sync_file = [this](int operation, bool required) {
    sqlite3_file* file = nullptr;
    if (sqlite3_file_control(db_, "main", operation, &file) != SQLITE_OK) {
      return false;
    }
    // A journal can be unopened when no journal writes exist. The main file
    // is required; an unsupported xSync must never become a successful sync.
    if (!file || !file->pMethods) {
      return !required;
    }
    return file->pMethods->xSync &&
           file->pMethods->xSync(file, SQLITE_SYNC_FULL) == SQLITE_OK;
  };
  // SQLite's JOURNAL_POINTER returns the WAL file in WAL mode. Use the actual
  // VFS handles; do not bypass SandboxedVfs or reopen a path from caller data.
  return sync_file(SQLITE_FCNTL_JOURNAL_POINTER, false) &&
         sync_file(SQLITE_FCNTL_FILE_POINTER, true);
}

bool Database::CheckpointDatabase(bool truncate) {''')])

project(PREFIX + 'leveldb/dom_storage_database_leveldb.h', [(
    '  DbStatus RewriteDB();',
    '  DbStatus RewriteDB();\n\n  DbStatus SyncForAuxMigration();')])
project(PREFIX + 'leveldb/dom_storage_database_leveldb.cc', [(
    '#include "third_party/leveldatabase/src/include/leveldb/status.h"',
    '#include "third_party/leveldatabase/src/include/leveldb/status.h"\n#include "third_party/leveldatabase/src/include/leveldb/write_batch.h"'), (
    'bool DomStorageDatabaseLevelDB::ShouldFailAllCommitsForTesting() {',
    '''DbStatus DomStorageDatabaseLevelDB::SyncForAuxMigration() {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  if (!db_ || env_ || name_.empty() || fail_all_commits_for_testing_) {
    return DbStatus::IOError("Aux sync requires an available disk LevelDB");
  }
  leveldb::WriteBatch batch;
  leveldb::WriteOptions options;
  options.sync = true;
  return FromLevelDBStatus(db_->Write(options, &batch));
}

bool DomStorageDatabaseLevelDB::ShouldFailAllCommitsForTesting() {''')])

project(PREFIX + 'sqlite/sqlite_database_utils.h', [(
    '// Deletes the SQLite database file identified by `database_path`.',
    '''// Migration-only full WAL checkpoint; restores ordinary sync policy.
// Refuses in-memory/non-WAL databases and active transactions.
DbStatus SyncDatabaseForAuxMigration(sql::Database& database);

// Deletes the SQLite database file identified by `database_path`.''')])
project(PREFIX + 'sqlite/sqlite_database_utils.cc', [(
    '#include "sql/meta_table.h"', '#include "sql/meta_table.h"\n#include "sql/statement.h"'), (
    'DbStatus DestroyDatabase(const base::FilePath& database_path) {',
    SQL_HELPER + 'DbStatus DestroyDatabase(const base::FilePath& database_path) {')])

for engine, suffix in [('LevelDB', 'leveldb'), ('Sqlite', 'sqlite')]:
    for kind in ['local', 'session']:
        cls = kind.title() + 'Storage' + engine
        relative = PREFIX + f'{suffix}/{kind}_storage_{suffix}'
        project(relative + '.h', [(
            '  DbStatus CleanUpStaleData() override;',
            '  DbStatus CleanUpStaleData() override;\n  DbStatus SyncForAuxMigration() override;')])
        if suffix == 'leveldb':
            body = '''  if (!leveldb_) {
    return DbStatus::IOError("Aux sync requires an open LevelDB backend");
  }
  return leveldb_->SyncForAuxMigration();'''
        else:
            body = '''  if (!database_ || should_fail_commits_for_testing_) {
    return DbStatus::IOError("Aux sync requires an available SQLite backend");
  }
  return sqlite::SyncDatabaseForAuxMigration(*database_);'''
        project(relative + '.cc', [(
            f'DbStatus {cls}::CleanUpStaleData() {{',
            f'DbStatus {cls}::SyncForAuxMigration() {{\n{body}\n}}\n\nDbStatus {cls}::CleanUpStaleData() {{')])

async_header = PREFIX + 'async_dom_storage_database.h'
project(async_header, [(
    '  // migration authority, acknowledge fsync or cover future renderer writes.',
    '  // migration authority or cover future renderer writes. After queued tasks,\n  // the backend must acknowledge its explicit disk-sync operation.')], PREVIOUS / 'source' / async_header)
async_source = PREFIX + 'async_dom_storage_database.cc'
project(async_source, [(
    '''         DomStorageDatabase*) {
        std::move(callback).Run(state->first_error.value_or(DbStatus::OK()));''',
    '''         DomStorageDatabase* database) {
        if (!state->first_error) {
          DbStatus status = database->SyncForAuxMigration();
          if (!status.ok()) {
            state->first_error = std::move(status);
          }
        }
        std::move(callback).Run(state->first_error.value_or(DbStatus::OK()));''')], PREVIOUS / 'source' / async_source)

(HERE / 'source-plan.json').write_text(json.dumps({
    'format': 'aux.dom-storage-durable-drain.source.v1', 'overlay': str(OVERLAY),
    'predecessorPlanSha256': sha((PREVIOUS / 'source-plan.json').read_bytes()),
    'files': files}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'overlay': str(OVERLAY)}))

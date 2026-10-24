"""Compose real native writer/cache custody with the reviewed physical owner."""
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
path='components/services/storage/dom_storage/async_dom_storage_database.cc'
s=(ROOT/path).read_text()
EDITS=[]
def edit(before,after):
 global s
 assert s.count(before)==1,(before[:140],s.count(before))
 s=s.replace(before,after)
 EDITS.append((before,after))
edit('#include "base/files/file_path.h"','#include "base/files/file_path.h"\n#include "base/containers/span.h"\n#include "base/strings/string_view_util.h"\n#include "base/strings/string_number_conversions.h"\n#include "base/task/sequenced_task_runner.h"\n#include "crypto/hash.h"\n#include "components/services/storage/dom_storage/aux_ui_cache_cohort.h"')
edit('''  std::optional<base::ByteSize> total_size;
};
// Only DB-sequence''','''  std::optional<base::ByteSize> total_size;
  bool source_persisted = true;
};
// Only DB-sequence''')
edit('''  std::vector<AuxDomMap> maps;
  bool target_attempted''','''  std::vector<AuxDomMap> maps;
  std::vector<DomStorageDatabase::MapLocator> live_locators;
  bool captured = false;
  bool target_attempted''')
# Normalize only reviewed Session keys to the actual current UTF8 key codec.
edit('''      auto next = AuxEncodeKey(std::string(rule.target) + key->substr(rule.source.size()), format);''','''      auto next = AuxEncodeKey(std::string(rule.target) + key->substr(rule.source.size()), local ? format : 3);''')
edit('''  // A target encoded differently under the same logical key is also a''','''  if (!local) {
    for (const auto& [raw, value] : source) {
      int format; auto key = AuxDecodeKey(raw, false, &format);
      if (!key || format != 2 || !AuxKnownKey(*key, false)) continue;
      bool current = false;
      for (const auto& rule : kAuxUiKeyRules)
        if (rule.scope != 1 && AuxUiKeyMatches(*key, rule.target, rule.prefix)) current = true;
      if (!current) continue;
      auto canonical = AuxEncodeKey(*key, 3);
      auto existing = target.find(canonical);
      if (existing != target.end() && existing->second != value)
        return base::unexpected(DbStatus::InvalidArgument("Conflicting current Session key encodings"));
      target[canonical] = value; target.erase(raw);
    }
  }
  // A target encoded differently under the same logical key is also a''')
# This conversion is TYPE VALIDATION ONLY. No target byte is taken from it;
# the actual retained records + cache pairing remain numeric UTF16/raw bytes.
edit('''  if (!base::UTF16ToUTF8(units.data(), units.size(), &result)) return std::nullopt;''','''  result = base::UTF16ToUTF8(units);  // Validation projection only; never target data.''')
edit('base::JSONReader::ReadDict(*value, base::JSON_PARSE_RFC, 100)', 'base::JSONReader::ReadDict(*value, base::JSON_PARSE_RFC | base::JSON_REPLACE_INVALID_CHARACTERS, 100)')
edit('bool AuxSameLocator(const DomStorageDatabase::MapLocator& a,\n                    const DomStorageDatabase::MapLocator& b) {\n  return a.storage_key() == b.storage_key() && a.map_id() == b.map_id() &&\n         a.session_ids() == b.session_ids();\n}\n', '')
# Actual bounded byte boundaries use spans, not unchecked pointer arithmetic.
edit('      std::memcpy(&value, raw.data() + i, sizeof(value));','      base::byte_span_from_ref(value).copy_from(base::span(raw).subspan(i, sizeof(value)));')
edit('      const auto* bytes = reinterpret_cast<const uint8_t*>(&value);\n      raw.insert(raw.end(), bytes, bytes + sizeof(value));','      auto bytes = base::byte_span_from_ref(value);\n      raw.insert(raw.end(), bytes.begin(), bytes.end());')
edit('      std::memcpy(&unit, raw.data() + i, sizeof(unit));','      base::byte_span_from_ref(unit).copy_from(base::span(raw).subspan(i, sizeof(unit)));')
a=s.index('StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxReadDomCapture(')
b=s.index('\n}  // namespace',a)
old=s[a:b]
edit(old,(HERE/'backend-digests.inc').read_text().rstrip()+'\n'+(HERE/'backend-readback.inc').read_text().rstrip())
edit('''  bool resolved_and_synced = false;
};''','''  bool resolved_and_synced = false;
  bool source_ready = false;
  bool backend_captured = false;
  bool private_target_staged = false;
  bool cache_published = false;
  size_t prepared_writers = 0;
  std::vector<base::WeakPtr<Committer>> writers;
  AuxUiSnapshot snapshot;
};''')
a=s.index('void AsyncDomStorageDatabase::BeginAuxUiMigrationLease(')
b=s.index('// static\nstd::unique_ptr<AsyncDomStorageDatabase>',a)
old=s[a:b]
new='\n'.join((HERE/name).read_text().rstrip() for name in ['async-committer-definitions.inc','async-round.inc','backend-task.inc','async-pipeline.inc'])+'\n\n'
edit(old,new)
p=HERE/'source'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
print(p)

ROWS=[(path,EDITS)]

from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
path='third_party/blink/renderer/modules/storage/cached_storage_area.cc'
s=(ROOT/path).read_text();EDITS=[]
def edit(before,after):
 global s
 assert s.count(before)==1,(before[:100],s.count(before))
 s=s.replace(before,after);EDITS.append((before,after))
a=s.index('std::optional<AuxCacheEntries> AuxCacheExpectedTarget(')
b=s.index('std::unique_ptr<StorageAreaMap> AuxCloneCacheMap(',a)
edit(s[a:b],'''bool AuxCacheCurrentTarget(const AuxCacheEntries& target, bool local) {
  for (const auto& [key, value] : target) {
    auto ascii = AuxCacheAscii(key);
    if (!ascii) return false;
    bool current = false;
    for (const auto& rule : kAuxCacheRules) {
      if ((rule.scope == 1 && !local) || (rule.scope == 2 && local)) continue;
      current |= AuxCacheMatches(*ascii, rule.target, rule.prefix);
    }
    if (!current) return false;
  }
  return true;
}
''')
edit('''  auto derived = AuxCacheExpectedTarget(actual, !IsSessionStorage());
  if (!source || *source != actual || !proposed || !derived || *proposed != *derived) {
    reply->ok = false; reply->error = "Exact retained source and fixed Aux target required";''','''  // The actual privileged storage service has validated the complete native
  // ordinal plan against its retained raw source, schema, scope and digests.
  // This endpoint accepts only current reviewed keys under that same held
  // cache, allowing exact sealed memory intents without arbitrary roots.
  if (!source || *source != actual || !proposed || !AuxCacheCurrentTarget(*proposed, !IsSessionStorage())) {
    reply->ok = false; reply->error = "Exact retained source and current native-owned Aux target required";''')
p=HERE/'source'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
ROWS=[(path,EDITS)]
print(p)

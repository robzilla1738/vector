from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent;root=base.parents[4]
source=root/'docs/integration/proposed/standard-profile-isolation/native-target-intent-controller-a15/source/chrome/browser/aux/ui_storage_migration_controller.cc'
original=source.read_text();text=original;anchors=[]
def edit(a,b):
 global text
 assert text.count(a)==1,(text.count(a),a[:120]);text=text.replace(a,b);anchors.append({'find':a,'replace':b,'count':1})
edit('  std::array<uint8_t, 32> digest{}, receipt_digest{};','''  std::array<uint8_t, 32> digest{}, receipt_digest{}, previous_digest{}, intent_digest{};
  uint32_t ordinal = 0;
  uint8_t kind = 1;''')
edit('bool IntentReceipt(const IntentRecord& t, std::string_view receipt) {','''constexpr std::array<std::string_view, 8> kRecordKinds = {
  "pre-target-intent", "target-attempt", "store-readback", "restore-attempt",
  "source-readback", "backends-target-observed", "cache-publish-attempt", "cache-publish-ack"};
bool IntentReceipt(const IntentRecord& t, std::string_view receipt) {''')
edit('Text(*parsed, "transactionId", t.journal) && Text(*parsed, "ordinal", "0") &&\n      Text(*parsed, "kind", "pre-target-intent")', 'Text(*parsed, "transactionId", t.journal) && Text(*parsed, "ordinal", base::NumberToString(t.ordinal)) &&\n      t.kind >= 1 && t.kind <= kRecordKinds.size() && Text(*parsed, "kind", kRecordKinds[t.kind - 1])')
edit('Text(*parsed, "intentSha256", base::HexEncodeLower(t.digest)) &&\n      Text(*parsed, "previousRecordSha256", std::string(64, \'0\'))', 'Text(*parsed, "intentSha256", base::HexEncodeLower(t.intent_digest)) &&\n      Text(*parsed, "previousRecordSha256", base::HexEncodeLower(t.previous_digest))')
edit('if (journal.size() != 16 || upload.size() != 16 || t.payload.empty() || t.payload.size() > kCaptureLimit)', 'if (journal.size() != 16 || upload.size() != 16 || t.ordinal >= 64 || t.kind < 1 || t.kind > 8 ||\n      t.payload.empty() || t.payload.size() > kCaptureLimit)')
edit('t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, 0, 4);\n      t.next.push_back(1); t.next.insert(t.next.end(), 32, 0);\n      t.next.insert(t.next.end(), t.digest.begin(), t.digest.end());','t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, t.ordinal, 4);\n      t.next.push_back(t.kind); t.next.insert(t.next.end(), t.previous_digest.begin(), t.previous_digest.end());\n      t.next.insert(t.next.end(), t.intent_digest.begin(), t.intent_digest.end());')
edit('t.next = {10}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, 0, 4);','t.next = {10}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, t.ordinal, 4);')
edit('t.next = {11}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, 0, 4);','t.next = {11}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, t.ordinal, 4);')
edit('bytes[5] != 1 || IntegerAt(result.payload, 38, 4)', 'bytes[5] != t.kind || IntegerAt(result.payload, 38, 4)')
# Physical target digest is unknown before a real allocation. Action digest is distinct.
edit('''      value->source_topology_sha256.size() != 64 || value->target_topology_sha256.size() != 64) return false;
  std::set<uint32_t> ordinals;''','''      value->source_topology_sha256.size() != 64) return false;
  bool pending_allocation = false, requested_allocation = false;
  std::set<uint32_t> ordinals;''')
edit('''    if (!map || !ordinals.insert(map->map_ordinal).second || map->source_map_sha256.size() != 64 ||
        map->target_map_sha256.size() != 64 || map->source_entries.size() > 4096 ||
        map->cache_views.size() > 256) return false;
  }
  if (hold.source''','''    if (!map || !ordinals.insert(map->map_ordinal).second || map->source_map_sha256.size() != 64 ||
        map->source_entries.size() > 4096 || map->cache_views.size() > 256) return false;
    if (map->allocation_requested) {
      requested_allocation = true;
      if (!hold.local || map->source_persisted || map->map_id || map->allocation_action_sha256.size() != 64 ||
          map->allocation_observed != map->allocated_map_id.has_value()) return false;
      if (!map->allocation_observed) {
        pending_allocation = true;
        if (!map->target_map_sha256.empty()) return false;
      } else if (*map->allocated_map_id < 0 || map->target_map_sha256.size() != 64) return false;
    } else if (!map->allocation_action_sha256.empty() || map->allocated_map_id || map->allocation_observed ||
        map->target_map_sha256.size() != 64) return false;
  }
  if ((requested_allocation ? value->allocation_action_sha256.size() != 64 : !value->allocation_action_sha256.empty()) ||
      (pending_allocation ? !value->target_topology_sha256.empty() : value->target_topology_sha256.size() != 64)) return false;
  if (hold.source''')
edit('''    domain.Set("targetTopologySha256", hold.source->target_topology_sha256);
    base::ListValue maps;''','''    domain.Set("targetTopologySha256", hold.source->target_topology_sha256);
    domain.Set("allocationActionSha256", hold.source->allocation_action_sha256);
    base::ListValue maps;''')
edit('''      fact.Set("sourcePersisted", map->source_persisted);
      base::ListValue source, target, namespaces;''','''      fact.Set("sourcePersisted", map->source_persisted);
      fact.Set("originalMapId", map->map_id ? base::Value(base::NumberToString(*map->map_id)) : base::Value());
      fact.Set("allocationRequested", map->allocation_requested);
      fact.Set("allocationActionSha256", map->allocation_action_sha256);
      fact.Set("allocationObserved", map->allocation_observed);
      fact.Set("allocatedMapId", map->allocated_map_id ? base::Value(base::NumberToString(*map->allocated_map_id)) : base::Value());
      base::ListValue source, target, namespaces;''')
edit('  intent_->digest = Digest(intent_->payload); intent_->journal = transfer_->journal;','  intent_->digest = Digest(intent_->payload); intent_->intent_digest = intent_->digest; intent_->journal = transfer_->journal;')
output=base/'source/chrome/browser/aux/ui_storage_migration_controller.cc';output.parent.mkdir(parents=True,exist_ok=True);output.write_text(text)
sha=lambda x:hashlib.sha256(x).hexdigest()
wire=Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/native-dom-control-allocation-wire-a16/source/components/services/storage/public/mojom/local_storage_control.mojom')
plan={'format':'aux.native-allocation-intent-controller.v1','files':[{'path':'chrome/browser/aux/ui_storage_migration_controller.cc','input':str(source),'inputSha256':sha(original.encode()),'output':str(output),'outputSha256':sha(text.encode()),'anchors':anchors}],'dependencies':[{'path':str(wire),'sha256':sha(wire.read_bytes()),'role':'append-only actual allocation action/result observations'}]}
(base/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');print(len(anchors),len(text),sha(text.encode()))

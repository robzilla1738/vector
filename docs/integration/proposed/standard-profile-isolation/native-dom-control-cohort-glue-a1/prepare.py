#!/usr/bin/env python3
"""Six-file native control proposal. No actual projection/build/execution."""
from pathlib import Path
import difflib,hashlib,json,sys
sys.dont_write_bytecode = True
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda b:hashlib.sha256(b).hexdigest();rows=[]
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
def project(path,anchors):
 native=ROOT/path;before=native.read_bytes();text=before.decode()
 for item in anchors:
  assert text.count(item['find'])==item['count']==1,(path,item['name']);text=text.replace(item['find'],item['replace'])
 source=HERE/'source'/path;source.parent.mkdir(parents=True,exist_ok=True);source.write_text(text)
 original=HERE/'before'/path;original.parent.mkdir(parents=True,exist_ok=True);original.write_bytes(before)
 assert native.read_bytes()==before
 rows.append({'path':path,'inputSha256':sha(before),'outputSha256':sha(text.encode()),'source':str(source),'beforeImage':str(original),'anchors':anchors})
local_mojom=ROOT/'components/services/storage/public/mojom/local_storage_control.mojom'
source=local_mojom.read_text();start=source.index('// Only reviewed UI key families');end=source.index('// Controls the state of Local Storage',start)
structs='''// Only reviewed UI key families are exported. Raw unrelated entries remain
// private in the backend for exact full-map CAS and source restoration.
struct AuxUiDomCacheView {
  string namespace_id;
  // Observer data is factual until joined to the actual native document.
  // Its private cache-control token is never exported by this service.
  blink.mojom.AuxUiCacheReply cache;
};
struct AuxUiDomMapSnapshot {
  blink.mojom.StorageKey storage_key;
  array<string> session_ids;
  array<blink.mojom.KeyValue> source_entries;
  array<blink.mojom.KeyValue> target_entries;
  uint32 map_ordinal;
  int64? map_id;
  bool source_persisted;
  string source_map_sha256;
  string target_map_sha256;
  array<AuxUiDomCacheView> cache_views;
};
struct AuxUiDomTargetMap {
  // Ordinal only selects a map captured by this exact existing backend lease.
  uint32 map_ordinal;
  array<blink.mojom.KeyValue> desired_selected_entries;
};
struct AuxUiDomLeaseReply {
  bool ok;
  bool held;
  string error;
  mojo_base.mojom.UnguessableToken? request_id;
  mojo_base.mojom.UnguessableToken? token;
  array<AuxUiDomMapSnapshot> maps;
  bool matches_source;
  bool matches_target;
  bool file_data_synced;
  bool ordinary_work_queued;
  bool target_attempted;
  bool source_ready;
  bool private_target_staged;
  bool cache_published;
  string source_topology_sha256;
  string target_topology_sha256;
  // Exact same-service successful release observation; never writer readiness.
  bool released;
};

'''
def methods():return'''  // Browser-only native backend/cache cohort. The service captures actual
  // loaded owners; no caller supplies a root, Profile, map locator or restore map.
  BeginAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id)
      => (AuxUiDomLeaseReply reply);
  // Original-request discovery never reruns Begin after an uncertain reply.
  ReadAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id)
      => (AuxUiDomLeaseReply reply);
  // Preserve the existing control method ordinals; new operations append below.
  CommitAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                            mojo_base.mojom.UnguessableToken token)
      => (AuxUiDomLeaseReply reply);
  RestoreAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                             mojo_base.mojom.UnguessableToken token)
      => (AuxUiDomLeaseReply reply);
  // Reply follows actual asynchronous cache/namespace release, never queueing.
  ReleaseAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                             mojo_base.mojom.UnguessableToken token)
      => (bool released);
  ValidateAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                              mojo_base.mojom.UnguessableToken token)
      => (AuxUiDomLeaseReply reply);
  // Complete one row per captured ordinal; backend validates current reviewed
  // key families/schema/bounds and retains unrelated raw entries privately.
  StageAuxUiPreferenceTargets(mojo_base.mojom.UnguessableToken request_id,
                             mojo_base.mojom.UnguessableToken token,
                             array<AuxUiDomTargetMap> targets)
      => (AuxUiDomLeaseReply reply);
  PublishAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                             mojo_base.mojom.UnguessableToken token)
      => (AuxUiDomLeaseReply reply);
'''
for kind in ['local','session']:
 path=f'components/services/storage/public/mojom/{kind}_storage_control.mojom';text=(ROOT/path).read_text();begin=text.index('  // Native-only pending physical transaction.');end=text.index('\n};',begin)
 edits=[edit('Finite existing-backend transaction control surface',text[begin:end],methods())]
 if kind=='local':edits.insert(0,edit('Native retained topology/cache observations and bounded ordinal targets',source[start:source.index('// Controls the state of Local Storage',start)],structs))
 project(path,edits)
from implementation import add_implementations
add_implementations(ROOT,HERE,project,edit)
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.dom-cohort.controls.v1','files':rows,'actualNativeMutation':False,'compiled':False,'runtimeAcceptance':False},indent=2)+'\n')
patch=''.join(''.join(difflib.unified_diff((ROOT/r['path']).read_text().splitlines(True),Path(r['source']).read_text().splitlines(True),fromfile='a/'+r['path'],tofile='b/'+r['path']))for r in rows)
(HERE/'native.patch').write_text(patch)
print(json.dumps({'files':len(rows),'anchors':sum(len(r['anchors'])for r in rows),'actualNativeMutation':False}))

"""Pin and project actual renderer cache ownership; no native mutation."""
import difflib,hashlib,json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda data:hashlib.sha256(data).hexdigest()
files=[];patch=[]
def project(path,edits):
 original=(ROOT/path).read_bytes();text=original.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:140],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 files.append({'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors})
 patch.extend(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
wire='''// A cache-owner acknowledgment, not native profile/root/epoch authority.
// UTF16 code units preserve JavaScript strings without a lossy UTF8 roundtrip.
struct AuxUiCacheEntry {
  array<uint16> key;
  array<uint16> value;
};
struct AuxUiCacheDocument {
  mojo_base.mojom.Token source_id;
  LocalFrameToken frame;
  DocumentToken document;
};
struct AuxUiCacheReply {
  bool ok;
  bool held;
  bool tainted;
  bool published;
  string error;
  mojo_base.mojom.UnguessableToken? request_id;
  mojo_base.mojom.UnguessableToken? token;
  array<AuxUiCacheDocument> sources;
  array<AuxUiCacheEntry> source_entries;
  array<AuxUiCacheEntry> staged_entries;
};

'''
methods='''
  // Only the actual privileged storage service selects this observer endpoint.
  // The source remains script-visible until final publish. No productive
  // StorageEvents or ordinary storage writes are synthesized by these RPCs.
  BeginAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request)
      => (AuxUiCacheReply reply);
  ReadAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request)
      => (AuxUiCacheReply reply);
  ValidateAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request,
                              mojo_base.mojom.UnguessableToken token)
      => (AuxUiCacheReply reply);
  StageAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request,
                           mojo_base.mojom.UnguessableToken token,
                           array<AuxUiCacheEntry> expected_source,
                           array<AuxUiCacheEntry> target)
      => (AuxUiCacheReply reply);
  PublishAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request,
                             mojo_base.mojom.UnguessableToken token)
      => (AuxUiCacheReply reply);
  RestoreAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request,
                             mojo_base.mojom.UnguessableToken token)
      => (AuxUiCacheReply reply);
  ReleaseAuxUiCacheMigration(mojo_base.mojom.UnguessableToken request,
                             mojo_base.mojom.UnguessableToken token)
      => (bool released);
'''
project('third_party/blink/public/mojom/dom_storage/storage_area.mojom',[
 ('import "mojo/public/mojom/base/token.mojom";', 'import "mojo/public/mojom/base/token.mojom";\nimport "mojo/public/mojom/base/unguessable_token.mojom";\nimport "third_party/blink/public/mojom/tokens/tokens.mojom";'),
 ('interface StorageAreaObserver {',wire+'interface StorageAreaObserver {'),
 ('  ShouldSendOldValueOnMutations(bool value);','  ShouldSendOldValueOnMutations(bool value);\n'+methods),
])
path='third_party/blink/renderer/modules/storage/cached_storage_area.h'
project(path,[
 ('#include "base/token.h"', '#include <optional>\n\n#include "base/functional/callback.h"\n#include "base/memory/weak_ptr.h"\n#include "base/token.h"\n#include "base/unguessable_token.h"'),
 ('  // Allow this object to keep track of the Source instances corresponding to',
  (HERE/'cache-declarations.inc').read_text().rstrip()+'\n\n  // Allow this object to keep track of the Source instances corresponding to'),
 ('  const AreaType type_;', (HERE/'cache-private-declarations.inc').read_text().rstrip()+'\n\n  const AreaType type_;'),
 ('  std::unique_ptr<StorageAreaMap> map_;', '  std::unique_ptr<StorageAreaMap> map_;\n  std::unique_ptr<AuxUiCacheLease> aux_ui_cache_lease_;\n  size_t aux_storage_callbacks_pending_ = 0;'),
 ('  Persistent<GCedHeapHashMap<WeakMember<Source>, base::Token>> areas_;', '  Persistent<GCedHeapHashMap<WeakMember<Source>, base::Token>> areas_;\n  base::WeakPtrFactory<CachedStorageArea> aux_weak_{this};'),
])
path='third_party/blink/renderer/modules/storage/cached_storage_area.cc'
original=(ROOT/path).read_text()
edits=[
 ('#include <algorithm>','#include <algorithm>\n#include <map>\n#include <string>'),
 ('#include "third_party/blink/renderer/core/frame/local_dom_window.h"', '#include "third_party/blink/renderer/core/frame/local_dom_window.h"\n#include "third_party/blink/renderer/core/frame/local_frame.h"\n#include "third_party/blink/renderer/platform/weborigin/security_origin.h"'),
 ('unsigned CachedStorageArea::GetLength() {',(HERE/'cache-definitions.inc').read_text().rstrip()+'\n\nunsigned CachedStorageArea::GetLength() {'),
 ('base::IgnoreArgs<bool>(MakeVirtualTimePauserCallback(source))','base::IgnoreArgs<bool>(TrackAuxStorageCallback(MakeVirtualTimePauserCallback(source)))'),
 ('        MakeVirtualTimePauserCallback(source));', '        TrackAuxStorageCallback(MakeVirtualTimePauserCallback(source)));'),
 ('        std::move(new_observer), MakeVirtualTimePauserCallback(source));', '        std::move(new_observer), TrackAuxStorageCallback(MakeVirtualTimePauserCallback(source)));'),
 ('          /*source=*/nullptr, base::DoNothing());','          /*source=*/nullptr, TrackAuxStorageCallback(base::DoNothing()));'),
 ('          /*source=*/nullptr, base::DoNothing());','          /*source=*/nullptr, base::IgnoreArgs<bool>(TrackAuxStorageCallback(base::DoNothing())));'),
]
# The two reset-recovery paths have the same final source text. Match their
# full actual Delete/Put statement separately, preserving the bool callback.
edits=edits[:-2]
for method,body in [
 ('SetItem','  if (RejectAuxUiMigrationWrite()) return false;'),
 ('RemoveItem','''  if (aux_ui_cache_lease_) {
    aux_ui_cache_lease_->tainted = true;
    aux_ui_cache_lease_->deferred.push_back(BindOnce(&CachedStorageArea::RemoveItem,
        aux_weak_.GetWeakPtr(), key, WrapWeakPersistent(source)));
    return;
  }'''),
 ('Clear','''  if (aux_ui_cache_lease_) {
    aux_ui_cache_lease_->tainted = true;
    aux_ui_cache_lease_->deferred.push_back(BindOnce(&CachedStorageArea::Clear,
        aux_weak_.GetWeakPtr(), WrapWeakPersistent(source)));
    return;
  }'''),
 ('RegisterSource','  if (aux_ui_cache_lease_) aux_ui_cache_lease_->tainted = true;'),
 ('ResetConnection','''  if (aux_ui_cache_lease_) {
    aux_ui_cache_lease_->tainted = true;
    aux_ui_cache_lease_->deferred.push_back(BindOnce(&CachedStorageArea::ResetConnection,
        aux_weak_.GetWeakPtr(), std::move(new_area)));
    return;
  }'''),
 ('EvictCachedData','''  if (aux_ui_cache_lease_) {
    aux_ui_cache_lease_->tainted = true;
    aux_ui_cache_lease_->deferred.push_back(BindOnce(&CachedStorageArea::EvictCachedData,
        aux_weak_.GetWeakPtr()));
    return;
  }'''),
]:
 matches=list(re.finditer(r'(?:bool|void|base::Token) CachedStorageArea::'+method+r'\([\s\S]*?\) \{',original));assert len(matches)==1,method
 anchor=matches[0].group();edits.append((anchor,anchor+'\n'+body))
for method,args in {
 'KeyChanged':'key, new_value, old_value, std::move(source)',
 'KeyChangeFailed':'key, std::move(source)',
 'KeyDeleted':'key, old_value, std::move(source)',
 'AllDeleted':'was_nonempty, std::move(source)',
 'ShouldSendOldValueOnMutations':'value',
}.items():
 matches=list(re.finditer(r'void CachedStorageArea::'+method+r'\([\s\S]*?\) \{',original));assert len(matches)==1
 anchor=matches[0].group()
 edits.append((anchor,anchor+f'''
  if (aux_ui_cache_lease_) {{
    aux_ui_cache_lease_->tainted = true;
    aux_ui_cache_lease_->deferred.push_back(BindOnce(&CachedStorageArea::{method},
        aux_weak_.GetWeakPtr(), {args}));
    return;
  }}'''))
for method,callback in [('Delete','TrackAuxStorageCallback(base::DoNothing())'),('Put','base::IgnoreArgs<bool>(TrackAuxStorageCallback(base::DoNothing()))')]:
 pattern=r'      remote_area_->'+method+r'\([\s\S]*?/\*source=\*/nullptr, base::DoNothing\(\)\);'
 matches=list(re.finditer(pattern,original));assert len(matches)==1,(method,len(matches))
 anchor=matches[0].group();edits.append((anchor,anchor.replace('base::DoNothing()',callback)))
project(path,edits)
path='third_party/blink/renderer/modules/storage/storage_area.cc'
original=(ROOT/path).read_text();edits=[]
for method,result in [('setItem','NamedPropertySetterResult::kIntercepted'),('removeItem','NamedPropertyDeleterResult::kDidNotDelete'),('clear',None)]:
 pattern=r'(?:NamedPropertySetterResult|NamedPropertyDeleterResult|void) StorageArea::'+method+r'\([\s\S]*?\) \{'
 matches=list(re.finditer(pattern,original));assert len(matches)==1
 # Security checks retain their original precedence. Reject before optimistic
 # SetItem/Remove/Clear but only after original CanAccessStorage succeeded.
 start=matches[0].end();end=original.index('\n}',start)
 text=original[start:end]
 pos=text.index('\n  }')+len('\n  }')
 anchor=original[matches[0].start():start]+text[:pos]
 returns=('return '+result+';') if result else 'return;'
 edits.append((anchor,anchor+f'''
  if (cached_area_->RejectAuxUiMigrationWrite()) {{
    exception_state.ThrowDOMException(DOMExceptionCode::kInvalidStateError,
        "Aux is updating this profile's storage. Try again shortly.");
    {returns}
  }}'''))
project(path,edits)
# Existing non-production mock implementations must remain concrete when the
# real interface grows. They explicitly refuse these RPCs and do not pretend
# to own a cache. No new tests or acceptance fixtures are introduced.
mock='''// Compatibility only: these observers do not implement real cache custody.
class UnsupportedAuxMigrationObserver : public blink::mojom::StorageAreaObserver {
 public:
'''
for method in ['Begin','Read','Validate','Stage','Publish','Restore','Release']:
 args='const base::UnguessableToken& request, '
 if method not in ['Begin','Read']: args+='const base::UnguessableToken& token, '
 if method=='Stage': args+='std::vector<blink::mojom::AuxUiCacheEntryPtr> source, std::vector<blink::mojom::AuxUiCacheEntryPtr> target, '
 args+=f'{method}AuxUiCacheMigrationCallback callback'
 mock+=f'  void {method}AuxUiCacheMigration({args}) override {{\n'
 if method=='Release': mock+='    std::move(callback).Run(false);\n'
 else: mock+='    auto reply = blink::mojom::AuxUiCacheReply::New();\n    reply->error = "Observer has no actual Aux cache owner";\n    std::move(callback).Run(std::move(reply));\n'
 mock+='  }\n'
mock+='};\n\n'
project('components/services/storage/dom_storage/test_support/storage_area_test_util.h',[
 ('// Mock observer implementation for use with StorageArea.',mock+'// Mock observer implementation for use with StorageArea.'),
 ('class MockStorageAreaObserver : public blink::mojom::StorageAreaObserver {','class MockStorageAreaObserver : public UnsupportedAuxMigrationObserver {'),
])
project('components/services/storage/dom_storage/local_storage_impl_unittest.cc',[
 ('class TestStorageAreaObserver : public blink::mojom::StorageAreaObserver {','class TestStorageAreaObserver : public test::UnsupportedAuxMigrationObserver {'),
])
project('components/services/storage/dom_storage/storage_area_impl_unittest.cc',[
 ('                                public blink::mojom::StorageAreaObserver {','                                public test::UnsupportedAuxMigrationObserver {'),
])
result={'format':'aux.native-renderer-cache-lease.source.v1','nativeRoot':str(ROOT),'files':files,
 'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,
 'actualBackendCacheCohortConsumed':False,'crossStoreRecoveryImplemented':False,
 'directoryDurabilityProven':False,'activationAuthorized':False}
(HERE/'source-plan.json').write_text(json.dumps(result,indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(files),'countedAnchors':sum(len(row['anchors']) for row in files)}))

"""Keep exact actual renderer release correlation across a lost Mojo reply."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PARENT = HERE.parent
sha = lambda data: hashlib.sha256(data).hexdigest()
changes = {
 'third_party/blink/renderer/modules/storage/cached_storage_area.h': (
  'native-renderer-cache-lease-a8', [(
   '  std::unique_ptr<AuxUiCacheLease> aux_ui_cache_lease_;',
   '''  std::unique_ptr<AuxUiCacheLease> aux_ui_cache_lease_;
  // One exact past cleanup receipt; never current writer closure/readiness.
  std::optional<base::UnguessableToken> aux_ui_last_released_request_;
  std::optional<base::UnguessableToken> aux_ui_last_released_token_;''')]),
 'third_party/blink/renderer/modules/storage/cached_storage_area.cc': (
  'native-cache-cohort-integration-a9', [(
   '  if (!aux_ui_cache_lease_) { reply->error = "No retained Aux cache lease"; return reply; }',
   '''  if (!aux_ui_cache_lease_) {
    reply->request_id = request;
    // A known native token may be retired only by this exact real past
    // release, never from a bare absent-state observation.
    if (aux_ui_last_released_request_ == request)
      reply->token = aux_ui_last_released_token_;
    reply->error = "No retained Aux cache lease";
    return reply;
  }'''), (
   '''    reply->held = !!aux_ui_cache_lease_;
    reply->error = "Actual Aux cache is not ready for a new hold";''',
   '''    reply->held = !!aux_ui_cache_lease_;
    if (!aux_ui_cache_lease_) reply->request_id = request;
    reply->error = "Actual Aux cache is not ready for a new hold";'''), (
   '''    auto reply = mojom::blink::AuxUiCacheReply::New(); reply->error = "Unknown Aux cache document owner";''',
   '''    auto reply = mojom::blink::AuxUiCacheReply::New(); reply->request_id = request;
    reply->error = "Unknown Aux cache document owner";'''), (
   '''  if (!aux_ui_cache_lease_ || aux_ui_cache_lease_->request != request || aux_ui_cache_lease_->token != token) {
    std::move(callback).Run(false); return;
  }
  // Exact original-owner release is cleanup, never proof of physical success.''',
   '''  if (!aux_ui_cache_lease_) {
    std::move(callback).Run(aux_ui_last_released_request_ == request &&
                            aux_ui_last_released_token_ == token);
    return;
  }
  if (aux_ui_cache_lease_->request != request || aux_ui_cache_lease_->token != token) {
    std::move(callback).Run(false); return;
  }
  // Exact original-owner release is cleanup, never proof of physical success.'''), (
   '''  for (auto& operation : deferred) std::move(operation).Run();
  std::move(callback).Run(true);
}

unsigned CachedStorageArea::GetLength()''',
   '''  for (auto& operation : deferred) std::move(operation).Run();
  aux_ui_last_released_request_ = request;
  aux_ui_last_released_token_ = token;
  std::move(callback).Run(true);
}

unsigned CachedStorageArea::GetLength()''')]),
 'components/services/storage/dom_storage/aux_ui_cache_cohort.cc': (
  'native-cache-cohort-integration-a9', [(
   '''  } else if (reply && !reply->held &&
             (operation == Operation::kRead || operation == Operation::kPrepare)) {
    // An authenticated response from this exact observer proves only that it
    // has no retained hold. It cannot qualify capture and does not retire work.
    node.custody = Custody::kNotHeld;
  }''',
   '''  } else if (reply && !reply->held && reply->request_id == request_ &&
             (operation == Operation::kRead || operation == Operation::kPrepare) &&
             ((!node.token && !reply->token) ||
              (node.token && node.token == reply->token))) {
    // No known token: this exact observer reports our prepare never held.
    // Known token: require its exact real past-release receipt. Bare absence,
    // mismatched requests and successor leases never retire original custody.
    // Neither branch qualifies source capture or outstanding physical work.
    node.custody = Custody::kNotHeld;
  }''')]),
}
rows = []; patches = []; roots = {}
for path, (base, edits) in changes.items():
    root = PARENT / base / 'source'; roots[path] = str(root)
    original = (root / path).read_bytes(); text = original.decode(); anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (path, before[:70], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    out = HERE / 'source' / path; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(text)
    rows.append({'path': path, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                 'inputRoot': str(root), 'output': str(out), 'anchors': anchors})
    patches.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                     fromfile='a/' + path, tofile='b/' + path))
(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.cache-release-receipt.source.v1',
    'files': rows, 'nativeCheckoutChanged': False, 'nativeCompiled': False,
    'productExecuted': False, 'runtimeAcceptance': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'files': len(rows), 'countedAnchors': sum(len(r['anchors']) for r in rows)}))

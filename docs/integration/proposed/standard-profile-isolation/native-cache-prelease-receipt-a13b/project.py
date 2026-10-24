"""A tokenless not-started observation must come from a real prepare refusal."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = HERE.parent / 'native-cache-release-receipt-a13' / 'source'
sha = lambda data: hashlib.sha256(data).hexdigest()
changes = {
 'third_party/blink/renderer/modules/storage/cached_storage_area.h': [(
  '  std::optional<base::UnguessableToken> aux_ui_last_released_token_;',
  '''  std::optional<base::UnguessableToken> aux_ui_last_released_token_;
  // Minted only by a definitive prepare refusal before creating its lease.
  std::optional<base::UnguessableToken> aux_ui_last_refused_prepare_;''')],
 'third_party/blink/renderer/modules/storage/cached_storage_area.cc': [(
  '''    reply->request_id = request;
    // A known native token may be retired only by this exact real past
    // release, never from a bare absent-state observation.
    if (aux_ui_last_released_request_ == request)
      reply->token = aux_ui_last_released_token_;''',
  '''    // No state alone is unknown. Correlation must come from an actual
    // past release or a definitive pre-lease prepare refusal retained here.
    if (aux_ui_last_released_request_ == request) {
      reply->request_id = request;
      reply->token = aux_ui_last_released_token_;
    } else if (aux_ui_last_refused_prepare_ == request) {
      reply->request_id = request;
    }'''), (
  '''    if (!aux_ui_cache_lease_) reply->request_id = request;
    reply->error = "Actual Aux cache is not ready for a new hold";''',
  '''    if (!aux_ui_cache_lease_ && !request.is_empty()) {
      // This actual prepare invocation has created no lease or lease-owned
      // deferred work. It says nothing about other physical writers.
      aux_ui_last_refused_prepare_ = request;
      reply->request_id = request;
    }
    reply->error = "Actual Aux cache is not ready for a new hold";'''), (
  '''    auto reply = mojom::blink::AuxUiCacheReply::New(); reply->request_id = request;
    reply->error = "Unknown Aux cache document owner";''',
  '''    aux_ui_last_refused_prepare_ = request;
    auto reply = mojom::blink::AuxUiCacheReply::New(); reply->request_id = request;
    reply->error = "Unknown Aux cache document owner";'''), (
  '''  aux_ui_cache_lease_ = std::make_unique<AuxUiCacheLease>();
  aux_ui_cache_lease_->request = request;''',
  '''  aux_ui_last_refused_prepare_.reset();
  aux_ui_cache_lease_ = std::make_unique<AuxUiCacheLease>();
  aux_ui_cache_lease_->request = request;''')],
}
rows = []; patches = []
for path, edits in changes.items():
    original = (BASE / path).read_bytes(); text = original.decode(); anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (path, before[:70], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    out = HERE / 'source' / path; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(text)
    rows.append({'path': path, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                 'inputRoot': str(BASE), 'output': str(out), 'anchors': anchors})
    patches.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                     fromfile='a/' + path, tofile='b/' + path))
(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.cache-prelease-receipt.source.v1',
    'files': rows, 'nativeCheckoutChanged': False, 'nativeCompiled': False,
    'productExecuted': False, 'runtimeAcceptance': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'files': len(rows), 'countedAnchors': sum(len(r['anchors']) for r in rows)}))

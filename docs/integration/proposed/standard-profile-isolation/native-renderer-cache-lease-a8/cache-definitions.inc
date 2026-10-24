namespace {
struct AuxCacheRule { std::string_view source; std::string_view target; bool prefix; int scope; };
constexpr AuxCacheRule kAuxCacheRules[] = {
  {"aside.new-tab.omnibox-mode.v1", "aux.new-tab.omnibox-mode.v2", false, 1},
  {"aside.browserTabStyle", "aux.browserTabStyle.v2", false, 1},
  {"aside.last-final-confirm.v1", "aux.last-final-confirm.v2", false, 1},
  {"aside.last-permission-mode.v1", "aux.last-permission-mode.v2", false, 1},
  {"aside.new-tab.onboarding-helper-state.v1", "aux.new-tab.onboarding-helper-state.v2", false, 1},
  {"aside.chat-draft.v2:", "aux.chat-draft.v3:", true, 0},
  {"aside.chat-draft.v1:", "aux.chat-draft-text.v1:", true, 0},
  {"aside.sidepanel-new-session-settings.v1:", "aux.sidepanel-new-session-settings.v2:", true, 2},
  {"aside.chat-pending-new-session-message.v1", "aux.chat-pending-new-session-message.v2", false, 2},
};
using AuxCacheEntries = std::map<std::u16string, std::u16string>;
std::u16string AuxCacheUnits(const String& text) {
  std::u16string result;
  result.reserve(text.length());
  for (unsigned i = 0; i < text.length(); ++i) result.push_back(text[i]);
  return result;
}
String AuxCacheString(const std::u16string& text) {
  return String(base::span<const UChar>(text));
}
std::optional<std::string> AuxCacheAscii(const std::u16string& units) {
  std::string result;
  for (char16_t unit : units) {
    if (unit < 0x20 || unit > 0x7e) return std::nullopt;
    result.push_back(static_cast<char>(unit));
  }
  return result;
}
bool AuxCacheMatches(std::string_view key, std::string_view rule, bool prefix) {
  return prefix ? key.starts_with(rule) : key == rule;
}
bool AuxCacheKnownKey(std::string_view key, bool local) {
  for (const auto& rule : kAuxCacheRules) {
    if ((rule.scope == 1 && !local) || (rule.scope == 2 && local)) continue;
    if (AuxCacheMatches(key, rule.source, rule.prefix) ||
        AuxCacheMatches(key, rule.target, rule.prefix)) return true;
  }
  return false;
}
AuxCacheEntries AuxSelectedCacheEntries(const StorageAreaMap& map, bool local) {
  AuxCacheEntries entries;
  for (unsigned i = 0; i < map.GetLength(); ++i) {
    String key = map.GetKey(i);
    auto units = AuxCacheUnits(key);
    auto ascii = AuxCacheAscii(units);
    if (ascii && AuxCacheKnownKey(*ascii, local)) entries.emplace(std::move(units), AuxCacheUnits(map.GetItem(key)));
  }
  return entries;
}
Vector<mojom::blink::AuxUiCacheEntryPtr> AuxCacheWireEntries(const AuxCacheEntries& entries) {
  Vector<mojom::blink::AuxUiCacheEntryPtr> result;
  for (const auto& [key, value] : entries) {
    auto entry = mojom::blink::AuxUiCacheEntry::New();
    for (char16_t unit : key) entry->key.push_back(unit);
    for (char16_t unit : value) entry->value.push_back(unit);
    result.push_back(std::move(entry));
  }
  return result;
}
std::optional<AuxCacheEntries> AuxCacheReadEntries(
    const Vector<mojom::blink::AuxUiCacheEntryPtr>& entries, bool local) {
  AuxCacheEntries result;
  size_t units = 0;
  for (const auto& entry : entries) {
    if (!entry) return std::nullopt;
    units += entry->key.size() + entry->value.size();
    if (units > 8 * 1024 * 1024 || entry->key.size() > 8192) return std::nullopt;
    std::u16string key, value;
    for (uint16_t unit : entry->key) key.push_back(unit);
    for (uint16_t unit : entry->value) value.push_back(unit);
    auto ascii = AuxCacheAscii(key);
    if (!ascii || !AuxCacheKnownKey(*ascii, local) || !result.emplace(std::move(key), std::move(value)).second)
      return std::nullopt;
  }
  return result;
}
std::optional<AuxCacheEntries> AuxCacheExpectedTarget(AuxCacheEntries source, bool local) {
  const AuxCacheEntries original = source;
  for (const auto& [key, value] : original) {
    auto ascii = AuxCacheAscii(key);
    if (!ascii) return std::nullopt;
    for (const auto& rule : kAuxCacheRules) {
      if ((rule.scope == 1 && !local) || (rule.scope == 2 && local) ||
          !AuxCacheMatches(*ascii, rule.source, rule.prefix)) continue;
      std::string next = std::string(rule.target) + ascii->substr(rule.source.size());
      std::u16string target(next.begin(), next.end());
      auto existing = source.find(target);
      if (existing != source.end() && existing->second != value) return std::nullopt;
      source[target] = value;
      source.erase(key);
      break;
    }
  }
  return source;
}
std::unique_ptr<StorageAreaMap> AuxCloneCacheMap(const StorageAreaMap& source) {
  auto result = std::make_unique<StorageAreaMap>(source.quota());
  for (unsigned i = 0; i < source.GetLength(); ++i) {
    String key = source.GetKey(i);
    result->SetItemIgnoringQuota(key, source.GetItem(key));
  }
  return result;
}
}  // namespace

bool CachedStorageArea::IsAuxUiMigrationOrigin() const {
  return storage_key_.GetSecurityOrigin()->ToString() ==
      "chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm";
}
bool CachedStorageArea::RejectAuxUiMigrationWrite() {
  if (!aux_ui_cache_lease_) return false;
  aux_ui_cache_lease_->tainted = true;
  return true;
}
base::OnceClosure CachedStorageArea::TrackAuxStorageCallback(base::OnceClosure callback) {
  if (!IsAuxUiMigrationOrigin()) return callback;
  ++aux_storage_callbacks_pending_;
  // The actual physical reply, not a timeout or map clear, retires this work.
  // A dropped callback leaves the counter unresolved; no completion is made up.
  return BindOnce([](scoped_refptr<CachedStorageArea> owner, base::OnceClosure callback) {
    CHECK_GT(owner->aux_storage_callbacks_pending_, 0u);
    --owner->aux_storage_callbacks_pending_;
    std::move(callback).Run();
  }, scoped_refptr<CachedStorageArea>(this), std::move(callback));
}
std::optional<Vector<CachedStorageArea::AuxUiCacheSource>>
CachedStorageArea::CollectAuxUiCacheSources() const {
  Vector<AuxUiCacheSource> result;
  for (const auto& entry : *areas_) {
    Source* source = entry.key.Get();
    auto* window = source ? source->GetDOMWindow() : nullptr;
    auto* frame = window ? window->GetFrame() : nullptr;
    if (!frame || frame->DomWindow() != window) return std::nullopt;
    result.push_back({entry.value, frame->GetLocalFrameToken(), frame->GetDocumentToken()});
  }
  if (result.empty() || result.size() > 256) return std::nullopt;
  std::sort(result.begin(), result.end(), [](const auto& a, const auto& b) { return a.source_id < b.source_id; });
  return result;
}
mojom::blink::AuxUiCacheReplyPtr CachedStorageArea::ReadAuxUiCacheReply(
    const base::UnguessableToken& request,
    const std::optional<base::UnguessableToken>& token) {
  auto reply = mojom::blink::AuxUiCacheReply::New();
  if (!aux_ui_cache_lease_) { reply->error = "No retained Aux cache lease"; return reply; }
  auto& held = *aux_ui_cache_lease_;
  reply->held = true;
  reply->request_id = held.request;
  reply->token = held.token;
  reply->tainted = held.tainted;
  reply->published = held.published;
  auto sources = CollectAuxUiCacheSources();
  bool valid = request == held.request && (!token || *token == held.token) &&
      sources && *sources == held.sources && map_ && held.original &&
      remote_area_.is_bound() && receiver_.is_bound() &&
      aux_storage_callbacks_pending_ == 0 && pending_mutations_by_source_.empty() &&
      pending_mutations_by_key_.empty() && !held.tainted && !is_session_storage_for_prerendering_;
  if (valid) {
    const auto& expected = held.published ? held.target : held.original;
    valid = expected && AuxSelectedCacheEntries(*map_, !IsSessionStorage()) ==
        AuxSelectedCacheEntries(*expected, !IsSessionStorage());
  }
  if (!valid) { reply->error = "Actual cache/source/physical writer hold changed"; return reply; }
  reply->ok = true;
  for (const auto& source : held.sources) {
    auto stamp = mojom::blink::AuxUiCacheDocument::New();
    stamp->source_id = source.source_id; stamp->frame = source.frame; stamp->document = source.document;
    reply->sources.push_back(std::move(stamp));
  }
  reply->source_entries = AuxCacheWireEntries(AuxSelectedCacheEntries(*held.original, !IsSessionStorage()));
  if (held.target) reply->staged_entries = AuxCacheWireEntries(AuxSelectedCacheEntries(*held.target, !IsSessionStorage()));
  return reply;
}
void CachedStorageArea::BeginAuxUiCacheMigration(
    const base::UnguessableToken& request, BeginAuxUiCacheMigrationCallback callback) {
  if (request.is_empty() || aux_ui_cache_lease_ || !IsAuxUiMigrationOrigin() ||
      !map_ || !remote_area_.is_bound() || !receiver_.is_bound() ||
      is_session_storage_for_prerendering_ || aux_storage_callbacks_pending_ ||
      !pending_mutations_by_source_.empty() || !pending_mutations_by_key_.empty()) {
    auto reply = mojom::blink::AuxUiCacheReply::New();
    reply->held = !!aux_ui_cache_lease_;
    reply->error = "Actual Aux cache is not ready for a new hold";
    std::move(callback).Run(std::move(reply)); return;
  }
  auto sources = CollectAuxUiCacheSources();
  if (!sources) {
    auto reply = mojom::blink::AuxUiCacheReply::New(); reply->error = "Unknown Aux cache document owner";
    std::move(callback).Run(std::move(reply)); return;
  }
  aux_ui_cache_lease_ = std::make_unique<AuxUiCacheLease>();
  aux_ui_cache_lease_->request = request;
  aux_ui_cache_lease_->sources = std::move(*sources);
  aux_ui_cache_lease_->original = AuxCloneCacheMap(*map_);
  std::move(callback).Run(ReadAuxUiCacheReply(request, std::nullopt));
}
void CachedStorageArea::ReadAuxUiCacheMigration(
    const base::UnguessableToken& request, ReadAuxUiCacheMigrationCallback callback) {
  std::move(callback).Run(ReadAuxUiCacheReply(request, std::nullopt));
}
void CachedStorageArea::ValidateAuxUiCacheMigration(
    const base::UnguessableToken& request, const base::UnguessableToken& token,
    ValidateAuxUiCacheMigrationCallback callback) {
  std::move(callback).Run(ReadAuxUiCacheReply(request, token));
}
void CachedStorageArea::StageAuxUiCacheMigration(
    const base::UnguessableToken& request, const base::UnguessableToken& token,
    Vector<mojom::blink::AuxUiCacheEntryPtr> expected_source,
    Vector<mojom::blink::AuxUiCacheEntryPtr> target, StageAuxUiCacheMigrationCallback callback) {
  auto reply = ReadAuxUiCacheReply(request, token);
  if (!reply->ok || aux_ui_cache_lease_->published) {
    reply->ok = false; std::move(callback).Run(std::move(reply)); return;
  }
  auto source = AuxCacheReadEntries(expected_source, !IsSessionStorage());
  auto proposed = AuxCacheReadEntries(target, !IsSessionStorage());
  auto actual = AuxSelectedCacheEntries(*aux_ui_cache_lease_->original, !IsSessionStorage());
  auto derived = AuxCacheExpectedTarget(actual, !IsSessionStorage());
  if (!source || *source != actual || !proposed || !derived || *proposed != *derived) {
    reply->ok = false; reply->error = "Exact retained source and fixed Aux target required";
    std::move(callback).Run(std::move(reply)); return;
  }
  auto staged = AuxCloneCacheMap(*aux_ui_cache_lease_->original);
  for (const auto& [key, value] : actual) staged->RemoveItem(AuxCacheString(key), nullptr);
  for (const auto& [key, value] : *proposed) {
    if (!staged->SetItem(AuxCacheString(key), AuxCacheString(value), nullptr)) {
      reply->ok = false; reply->error = "Actual target cache quota refused";
      std::move(callback).Run(std::move(reply)); return;
    }
  }
  // Private only: no ordinary read view, StorageEvent, original callback,
  // backend write or admission state changes at this stage.
  aux_ui_cache_lease_->target = std::move(staged);
  std::move(callback).Run(ReadAuxUiCacheReply(request, token));
}
void CachedStorageArea::PublishAuxUiCacheMigration(
    const base::UnguessableToken& request, const base::UnguessableToken& token,
    PublishAuxUiCacheMigrationCallback callback) {
  auto reply = ReadAuxUiCacheReply(request, token);
  if (!reply->ok || !aux_ui_cache_lease_->target) {
    reply->ok = false; std::move(callback).Run(std::move(reply)); return;
  }
  // The genuine native controller must have committed/read back every backend
  // and its durable intent before requesting final publish. This RPC supplies
  // no such authority and performs no backend write or productive event.
  map_ = AuxCloneCacheMap(*aux_ui_cache_lease_->target);
  aux_ui_cache_lease_->published = true;
  std::move(callback).Run(ReadAuxUiCacheReply(request, token));
}
void CachedStorageArea::RestoreAuxUiCacheMigration(
    const base::UnguessableToken& request, const base::UnguessableToken& token,
    RestoreAuxUiCacheMigrationCallback callback) {
  auto reply = ReadAuxUiCacheReply(request, token);
  if (!reply->ok) { std::move(callback).Run(std::move(reply)); return; }
  map_ = AuxCloneCacheMap(*aux_ui_cache_lease_->original);
  aux_ui_cache_lease_->published = false;
  std::move(callback).Run(ReadAuxUiCacheReply(request, token));
}
void CachedStorageArea::ReleaseAuxUiCacheMigration(
    const base::UnguessableToken& request, const base::UnguessableToken& token,
    ReleaseAuxUiCacheMigrationCallback callback) {
  if (!aux_ui_cache_lease_ || aux_ui_cache_lease_->request != request || aux_ui_cache_lease_->token != token) {
    std::move(callback).Run(false); return;
  }
  // Exact original-owner release is cleanup, never proof of physical success.
  // Tainted source holds may be aborted, but target recovery remains native.
  scoped_refptr<CachedStorageArea> keep_alive(this);
  auto deferred = std::move(aux_ui_cache_lease_->deferred);
  aux_ui_cache_lease_.reset();
  for (auto& operation : deferred) std::move(operation).Run();
  std::move(callback).Run(true);
}

// Fixed-role, cooperative ChatGPT credential locks. No caller FD or path.
// Included after AuxBrokerWritesNapi.inc inside the selected host namespace.
struct ChatGPTCredentialLease {
  BrokerOwner captured;
  napi_env env = nullptr;
  uint64_t generation = 0;
  int control = -1, local = -1, directory = -1, descriptor = -1;
  struct stat control_stat {}, local_stat {}, directory_stat {}, lock_stat {};
  std::string root, name, digest;
  size_t active = 1;  // Initialization is physical work too.
  bool counted = false, closing = false, finished = false, unknown = false;
};
struct ChatGPTCredentialRegistry {
  std::mutex mutex;
  std::vector<std::shared_ptr<ChatGPTCredentialLease>> leases;
};
ChatGPTCredentialRegistry& ChatGPTCredentials() {
  static auto* registry = new ChatGPTCredentialRegistry;
  return *registry;
}
constexpr napi_type_tag kChatGPTCredentialTag{0x4155584348415447ULL, 0x50544c4f434b5631ULL};
bool ChatGPTSameObject(const struct stat& a, const struct stat& b) {
  return a.st_dev == b.st_dev && a.st_ino == b.st_ino;
}
bool ChatGPTPrivateDirectory(int fd, struct stat* st) {
  return fd >= 0 && fstat(fd, st) == 0 && S_ISDIR(st->st_mode) &&
      st->st_uid == getuid() && (st->st_mode & 077) == 0;
}
int ChatGPTOpenDirectory(int parent, const char* name) {
  if (mkdirat(parent, name, 0700) != 0 && errno != EEXIST) return -1;
  return openat(parent, name, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC);
}
bool ChatGPTNamespaceCurrent(const ChatGPTCredentialLease& lease) {
  struct stat local {}, directory {}, lock {}, named {};
  return lstat(lease.root.c_str(), &named) == 0 && ChatGPTSameObject(named, lease.directory_stat) && S_ISDIR(named.st_mode) &&
      fstatat(lease.control, "local-only", &local, AT_SYMLINK_NOFOLLOW) == 0 &&
      ChatGPTSameObject(local, lease.local_stat) && S_ISDIR(local.st_mode) &&
      local.st_uid == getuid() && (local.st_mode & 077) == 0 &&
      fstatat(lease.local, "chatgpt", &directory, AT_SYMLINK_NOFOLLOW) == 0 &&
      ChatGPTSameObject(directory, lease.directory_stat) && S_ISDIR(directory.st_mode) &&
      directory.st_uid == getuid() && (directory.st_mode & 077) == 0 &&
      fstatat(lease.directory, lease.name.c_str(), &lock, AT_SYMLINK_NOFOLLOW) == 0 &&
      ChatGPTSameObject(lock, lease.lock_stat) && S_ISREG(lock.st_mode) &&
      lock.st_nlink == 1 && lock.st_uid == getuid() && (lock.st_mode & 077) == 0;
}
bool ChatGPTAuthorityCurrent(ChatGPTCredentialLease& lease) {
  if (AuxNativeContextValidateCurrentAuthority(lease.captured.owner->handle) != 0) return false;
  uint64_t generation = 0; int control = -1, task = -1;
  const int result = AuxNativeContextCopyStorageRoots(lease.captured.owner->handle,
      &generation, &control, &task);
  struct stat st {};
  const bool current = result == 0 && generation == lease.generation &&
      ChatGPTPrivateDirectory(control, &st) && ChatGPTSameObject(st, lease.control_stat);
  bool closed = true;
  if (control >= 0 && close(control) != 0) closed = false;
  if (task >= 0 && close(task) != 0) closed = false;
  if (!closed) { std::lock_guard<std::mutex> lock(lease.captured.worker->mutex); lease.unknown = true; lease.captured.worker->broker_untracked = true; }
  return current && closed && ChatGPTNamespaceCurrent(lease);
}
// Closing requests do not certify a Promise/abort/GC as settled. The actual
// native close occurs only after the last admitted synchronous callback returns.
void ChatGPTFinishClose(const std::shared_ptr<ChatGPTCredentialLease>& lease) noexcept {
  if (getpid() != kHostProcess) return;
  bool remove = false;
  {
    std::lock_guard<std::mutex> lock(lease->captured.worker->mutex);
    lease->closing = true;
    if (lease->active || lease->finished) return;
    bool known = !lease->unknown;
    // Do not explicitly LOCK_UN first: close releases this exclusive open-file
    // description. No other native duplicate of it is created or exported.
    for (int* fd : {&lease->descriptor, &lease->directory, &lease->local, &lease->control}) {
      if (*fd >= 0) { const int owned = *fd; *fd = -1; if (close(owned) != 0) known = false; }
    }
    lease->finished = true;
    if (!known) { lease->unknown = true; lease->captured.worker->broker_untracked = true; }
    // Unknown is sticky and the counted native owner remains retained.
    if (known && lease->counted) { --lease->captured.worker->broker_pending; lease->counted = false; }
    remove = known;
  }
  if (remove) {
    auto& registry = ChatGPTCredentials(); std::lock_guard<std::mutex> lock(registry.mutex);
    registry.leases.erase(std::remove(registry.leases.begin(), registry.leases.end(), lease), registry.leases.end());
  }
}
void CloseChatGPTCredentialLocks(Worker* worker) noexcept {
  // Snapshot without holding registry across Worker locks. Allocation failure
  // leaves broker_pending nonzero and the caller's close attempt untracked.
  try {
    std::vector<std::shared_ptr<ChatGPTCredentialLease>> leases;
    { auto& registry = ChatGPTCredentials(); std::lock_guard<std::mutex> lock(registry.mutex);
      for (const auto& lease : registry.leases) if (lease->captured.worker.get() == worker) leases.push_back(lease); }
    for (const auto& lease : leases) ChatGPTFinishClose(lease);
  } catch (...) { std::lock_guard<std::mutex> lock(worker->mutex); worker->broker_untracked = true; }
}
void ChatGPTLeaseFinalizer(napi_env, void* data, void*) {
  auto* holder = static_cast<std::shared_ptr<ChatGPTCredentialLease>*>(data);
  ChatGPTFinishClose(*holder); delete holder;
}
std::shared_ptr<ChatGPTCredentialLease> ChatGPTToken(napi_env env, napi_value token) {
  bool tagged = false; void* data = nullptr;
  if (getpid() != kHostProcess || napi_check_object_type_tag(env, token, &kChatGPTCredentialTag, &tagged) != napi_ok ||
      !tagged || napi_unwrap(env, token, &data) != napi_ok || !data) return {};
  auto lease = *static_cast<std::shared_ptr<ChatGPTCredentialLease>*>(data);
  if (lease->env != env || !CurrentWorker(*lease->captured.worker)) return {};
  return lease;
}
bool ChatGPTMarkerValid(const std::string& marker, const std::string& digest) {
  auto* isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate); v8::TryCatch failure(isolate);
  auto context = isolate->GetCurrentContext();
  v8::Local<v8::String> text;
  v8::Local<v8::Value> parsed;
  if (!v8::String::NewFromUtf8(isolate, marker.data(), v8::NewStringType::kNormal,
      static_cast<int>(marker.size())).ToLocal(&text) ||
      !v8::JSON::Parse(context, text).ToLocal(&parsed) || !parsed->IsObject()) return false;
  auto object = parsed.As<v8::Object>(); v8::Local<v8::Value> schema, account;
  if (!object->HasOwnProperty(context, v8::String::NewFromUtf8Literal(isolate, "schema")).FromMaybe(false) ||
      !object->HasOwnProperty(context, v8::String::NewFromUtf8Literal(isolate, "account")).FromMaybe(false) ||
      !object->Get(context, v8::String::NewFromUtf8Literal(isolate, "schema")).ToLocal(&schema) ||
      !object->Get(context, v8::String::NewFromUtf8Literal(isolate, "account")).ToLocal(&account) ||
      !schema->IsString() || !account->IsString()) return false;
  v8::String::Utf8Value s(isolate, schema), a(isolate, account);
  return *s && *a && std::string(*s, s.length()) == "aux.chatgpt.auth-lock.v2" &&
      std::string(*a, a.length()) == digest;
}
napi_value BeginChatGPTCredentialLock(napi_env env, napi_callback_info info) {
  if (getpid() != kHostProcess) return nullptr;
  std::shared_ptr<ChatGPTCredentialLease> lease;
  try {
    auto captured = CaptureBrokerOwner(env);
    size_t argc = 2, bytes = 0; napi_value args[2]; napi_valuetype type;
    if (!captured.owner || napi_get_cb_info(env, info, &argc, args, nullptr, nullptr) != napi_ok || argc != 1 ||
        napi_typeof(env, args[0], &type) != napi_ok || type != napi_string ||
        napi_get_value_string_utf8(env, args[0], nullptr, 0, &bytes) != napi_ok || bytes == 0 || bytes > 262144)
      throw std::runtime_error("credential lock authority/key unavailable");
    std::string key(bytes + 1, '\0'); size_t copied = 0;
    if (napi_get_value_string_utf8(env, args[0], key.data(), key.size(), &copied) != napi_ok || copied != bytes)
      throw std::runtime_error("credential key unavailable");
    key.resize(bytes);
    if (key != "aux-local-default" && (key.compare(0, 8, "account:") != 0 || key.size() == 8))
      throw std::runtime_error("credential key role unavailable");
    lease = std::make_shared<ChatGPTCredentialLease>(); lease->captured = captured; lease->env = env;
    unsigned char hash[CC_SHA256_DIGEST_LENGTH]; CC_SHA256(key.data(), static_cast<CC_LONG>(key.size()), hash);
    constexpr char hex[] = "0123456789abcdef";
    for (unsigned char b : hash) { lease->digest.push_back(hex[b >> 4]); lease->digest.push_back(hex[b & 15]); }
    lease->name = lease->digest + ".lock";
    { std::lock_guard<std::mutex> lock(captured.worker->mutex);
      if (captured.worker->terminal || captured.worker->broker_closed || captured.worker->owner != captured.owner ||
          captured.worker->broker_pending == std::numeric_limits<size_t>::max()) throw std::runtime_error("credential admission closed");
      ++captured.worker->broker_pending; lease->counted = true; }
    { auto& registry = ChatGPTCredentials(); std::lock_guard<std::mutex> lock(registry.mutex); registry.leases.push_back(lease); }
    int task = -1;
    const int copied_roots = AuxNativeContextCopyStorageRoots(captured.owner->handle, &lease->generation, &lease->control, &task);
    if (task >= 0 && close(task) != 0) { { std::lock_guard<std::mutex> lock(captured.worker->mutex); lease->unknown = true; } throw std::runtime_error("credential root cleanup uncertain"); }
    if (copied_roots != 0 || !lease->generation || !ChatGPTPrivateDirectory(lease->control, &lease->control_stat))
      throw std::runtime_error("credential root unavailable");
    lease->local = ChatGPTOpenDirectory(lease->control, "local-only");
    if (!ChatGPTPrivateDirectory(lease->local, &lease->local_stat)) throw std::runtime_error("credential directory unavailable");
    lease->directory = ChatGPTOpenDirectory(lease->local, "chatgpt");
    if (!ChatGPTPrivateDirectory(lease->directory, &lease->directory_stat)) throw std::runtime_error("credential directory unavailable");
    char path[PATH_MAX];
    if (fcntl(lease->directory, F_GETPATH, path) != 0) throw std::runtime_error("credential namespace unavailable");
    lease->root = path;
    bool created = true;
    lease->descriptor = openat(lease->directory, lease->name.c_str(), O_RDWR | O_NONBLOCK | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC, 0600);
    if (lease->descriptor < 0 && errno == EEXIST) { created = false; lease->descriptor = openat(lease->directory, lease->name.c_str(), O_RDWR | O_NONBLOCK | O_NOFOLLOW | O_CLOEXEC); }
    if (lease->descriptor < 0 || fstat(lease->descriptor, &lease->lock_stat) != 0 || !S_ISREG(lease->lock_stat.st_mode) ||
        lease->lock_stat.st_uid != getuid() || (lease->lock_stat.st_mode & 077) || lease->lock_stat.st_nlink != 1 || lease->lock_stat.st_size >= 1024)
      throw std::runtime_error("unsafe credential lock");
    if (flock(lease->descriptor, LOCK_EX | LOCK_NB) != 0)
      throw std::runtime_error(errno == EWOULDBLOCK ? "another local credential operation is in progress" : "credential lock unavailable");
    if (created) {
      const std::string marker = "{\"schema\":\"aux.chatgpt.auth-lock.v2\",\"account\":\"" + lease->digest + "\"}";
      if (write(lease->descriptor, marker.data(), marker.size()) != static_cast<ssize_t>(marker.size()) || fsync(lease->descriptor) != 0)
        throw std::runtime_error("incomplete credential lock requires recovery review");
    } else {
      if (lease->lock_stat.st_size <= 0) throw std::runtime_error("incomplete credential lock requires recovery review");
      std::string marker(static_cast<size_t>(lease->lock_stat.st_size), '\0');
      if (pread(lease->descriptor, marker.data(), marker.size(), 0) != static_cast<ssize_t>(marker.size()) || !ChatGPTMarkerValid(marker, lease->digest))
        throw std::runtime_error("legacy or mismatched credential lock requires recovery review");
    }
    if (!ChatGPTAuthorityCurrent(*lease)) throw std::runtime_error("credential authority changed");
    napi_value token, root;
    if (napi_create_object(env, &token) != napi_ok || napi_type_tag_object(env, token, &kChatGPTCredentialTag) != napi_ok ||
        napi_create_string_utf8(env, lease->root.data(), lease->root.size(), &root) != napi_ok) throw std::runtime_error("credential token unavailable");
    const napi_property_descriptor property{"root", nullptr, nullptr, nullptr, nullptr, root, napi_default, nullptr};
    if (napi_define_properties(env, token, 1, &property) != napi_ok) throw std::runtime_error("credential token unavailable");
    auto* holder = new std::shared_ptr<ChatGPTCredentialLease>(lease);
    if (napi_wrap(env, token, holder, ChatGPTLeaseFinalizer, nullptr, nullptr) != napi_ok) { delete holder; throw std::runtime_error("credential token unavailable"); }
    { std::lock_guard<std::mutex> lock(captured.worker->mutex);
      if (captured.worker->terminal || captured.worker->broker_closed || lease->closing || captured.worker->owner != captured.owner)
        throw std::runtime_error("credential admission closed");
      --lease->active; }
    return token;
  } catch (const std::exception& error) {
    if (lease) { { std::lock_guard<std::mutex> lock(lease->captured.worker->mutex); lease->active = 0; } ChatGPTFinishClose(lease); }
    BrokerThrow(env, "AUX_CHATGPT_LOCK_UNAVAILABLE", error.what()); return nullptr;
  } catch (...) {
    if (lease) { { std::lock_guard<std::mutex> lock(lease->captured.worker->mutex); lease->active = 0; lease->unknown = true; } ChatGPTFinishClose(lease); }
    BrokerThrow(env, "AUX_CHATGPT_LOCK_UNKNOWN", "Credential lock outcome unknown"); return nullptr;
  }
}
napi_value CloseChatGPTCredentialLock(napi_env env, napi_callback_info info) {
  if (getpid() != kHostProcess) return nullptr;
  size_t argc = 2; napi_value args[2], result;
  if (napi_get_cb_info(env, info, &argc, args, nullptr, nullptr) != napi_ok || argc != 1) { BrokerThrow(env, "AUX_CHATGPT_LOCK_OWNER", "Exactly one native credential lease is required"); return nullptr; }
  auto lease = ChatGPTToken(env, args[0]);
  if (!lease) { BrokerThrow(env, "AUX_CHATGPT_LOCK_OWNER", "Credential lease belongs to another owner"); return nullptr; }
  ChatGPTFinishClose(lease); napi_get_undefined(env, &result); return result;
}
napi_value WithChatGPTCredentialLockSync(napi_env env, napi_callback_info info) {
  if (getpid() != kHostProcess) return nullptr;
  std::shared_ptr<ChatGPTCredentialLease> lease; bool active = false, invoked = false;
  try {
    size_t argc = 3; napi_value args[3], receiver, result; napi_valuetype type;
    if (napi_get_cb_info(env, info, &argc, args, nullptr, nullptr) != napi_ok || argc != 2 ||
        napi_typeof(env, args[1], &type) != napi_ok || type != napi_function || !(lease = ChatGPTToken(env, args[0])))
      throw std::runtime_error("credential synchronous scope unavailable");
    auto captured = CaptureBrokerOwner(env);
    { std::lock_guard<std::mutex> lock(lease->captured.worker->mutex);
      if (captured.owner != lease->captured.owner || captured.worker != lease->captured.worker || lease->closing || lease->finished ||
          lease->unknown || lease->captured.worker->broker_closed || lease->captured.worker->terminal ||
          lease->active == std::numeric_limits<size_t>::max()) throw std::runtime_error("credential admission closed");
      ++lease->active; active = true; }
    if (!ChatGPTAuthorityCurrent(*lease)) throw std::runtime_error("credential authority changed");
    if (napi_get_undefined(env, &receiver) != napi_ok) throw std::runtime_error("credential callback unavailable");
    invoked = true;
    const auto status = napi_call_function(env, receiver, args[1], 0, nullptr, &result);
    bool promise = false;
    const bool known = (status == napi_ok || status == napi_pending_exception) &&
        (status != napi_ok || (napi_is_promise(env, result, &promise) == napi_ok && !promise)) && ChatGPTAuthorityCurrent(*lease);
    bool close = false;
    { std::lock_guard<std::mutex> lock(lease->captured.worker->mutex);
      --lease->active; active = false;
      if (!known) { lease->unknown = true; lease->captured.worker->broker_untracked = true; }
      close = lease->closing; }
    if (close) ChatGPTFinishClose(lease);
    if (!known) { BrokerThrow(env, "AUX_CHATGPT_LOCK_UNKNOWN", "Credential scope did not complete synchronously with current authority"); return nullptr; }
    return status == napi_ok ? result : nullptr;
  } catch (...) {
    if (active) { std::lock_guard<std::mutex> lock(lease->captured.worker->mutex); --lease->active; if (invoked) { lease->unknown = true; lease->captured.worker->broker_untracked = true; } }
    if (lease) ChatGPTFinishClose(lease);
    BrokerThrow(env, "AUX_CHATGPT_LOCK_CLOSED", "Credential scope refused or closed"); return nullptr;
  }
}

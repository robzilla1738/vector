// These are source DATA. Actual Profile/document/cache/lease ownership is joined
// independently; no reported identity or writer Boolean grants native authority.
struct WireMutation {
  bool local = false, remove = false;
  std::u16string key, value;
};
struct WireStores {
  std::map<std::u16string, std::u16string> session, local;
  std::vector<WireMutation> mutations;
};
bool ReadWireUnits(const base::Value* value, std::u16string& output, size_t& total) {
  const auto* units = value ? value->GetIfList() : nullptr;
  if (!units || units->size() > 4194304 || total > 4194304 - units->size()) return false;
  output.clear(); output.reserve(units->size()); total += units->size();
  for (const auto& unit : *units) {
    const auto number = unit.GetIfInt();
    if (!number || *number < 0 || *number > 65535) return false;
    output.push_back(static_cast<char16_t>(*number));
  }
  return true;
}
bool WireKey(const std::u16string& units, bool local) {
  // Draft identities already have finite ASCII native schemas. Unknown Unicode
  // identities refuse; values remain exact UTF16, including lone surrogates.
  if (units.size() > 8192) return false;
  std::string key; key.reserve(units.size());
  for (const auto unit : units) {
    if (unit > 127) return false;
    key.push_back(static_cast<char>(unit));
  }
  return UiDraftKey(key, local);
}
bool ReadWireEntries(const base::Value* value, bool local,
                     std::map<std::u16string, std::u16string>& output,
                     size_t& count, size_t& total) {
  const auto* entries = value ? value->GetIfList() : nullptr;
  if (!entries || entries->size() > 4096 || count > 4096 - entries->size()) return false;
  count += entries->size();
  for (const auto& raw : *entries) {
    const auto* entry = raw.GetIfDict(); std::u16string key, data;
    if (!entry || entry->size() != 2 || !ReadWireUnits(entry->Find("key"), key, total) ||
        !WireKey(key, local) || !ReadWireUnits(entry->Find("value"), data, total) ||
        !output.emplace(std::move(key), std::move(data)).second) return false;
  }
  return true;
}
std::optional<WireStores> ReadWireStores(const base::DictValue& value,
                                       std::string_view actual_origin) {
  if (value.size() != 5 || !Text(value, "format", "aux.ui-draft-store-units.v1") ||
      !Text(value, "origin", actual_origin)) return std::nullopt;
  WireStores stores; size_t count = 0, total = 0;
  if (!ReadWireEntries(value.Find("sessionEntries"), false, stores.session, count, total) ||
      !ReadWireEntries(value.Find("localEntries"), true, stores.local, count, total)) return std::nullopt;
  const auto* changes = value.FindList("mutations");
  if (!changes || changes->size() > 4096 || count > 4096 - changes->size()) return std::nullopt;
  std::set<std::pair<bool, std::u16string>> changed;
  for (const auto& raw : *changes) {
    const auto* change = raw.GetIfDict();
    if (!change || (!Text(*change, "storage", "local-storage") && !Text(*change, "storage", "session-storage")) ||
        (!Text(*change, "operation", "set") && !Text(*change, "operation", "remove"))) return std::nullopt;
    WireMutation mutation;
    mutation.local = Text(*change, "storage", "local-storage");
    mutation.remove = Text(*change, "operation", "remove");
    if (change->size() != (mutation.remove ? 3u : 4u) ||
        !ReadWireUnits(change->Find("key"), mutation.key, total) || !WireKey(mutation.key, mutation.local) ||
        (!mutation.remove && !ReadWireUnits(change->Find("value"), mutation.value, total)) ||
        !changed.emplace(mutation.local, mutation.key).second) return std::nullopt;
    stores.mutations.push_back(std::move(mutation));
  }
  return stores;
}

// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/aux/account_bootstrap_state.h"

#include "base/files/file_util.h"
#include "base/json/json_reader.h"
#include "base/strings/string_number_conversions.h"

namespace aux {
namespace {
using Dict = base::DictValue;

std::string_view Text(const Dict* dict, std::string_view key) {
  const auto* value = dict ? dict->FindString(key) : nullptr;
  return value ? *value : std::string_view();
}
bool Flag(const Dict* dict, std::string_view key) {
  return dict && dict->FindBool(key).value_or(false);
}
const Dict* FindAccount(const Dict& state, std::optional<int> id,
                        std::string_view user = {}) {
  const auto* accounts = state.FindList("accounts");
  if (!accounts) return nullptr;
  for (const auto& value : *accounts) {
    const auto* account = value.GetIfDict();
    if (!account || !account->FindInt("id")) continue;
    if ((id && account->FindInt("id") == id) ||
        (!id && !user.empty() && Text(account, "userId") == user)) {
      return account;
    }
  }
  return nullptr;
}
const Dict* FindBinding(const Dict* bindings, std::string_view profile_id,
                        std::string_view path, bool local) {
  if (!bindings) return nullptr;
  const auto valid = [local](const Dict* row) {
    if (!row) return false;
    if (local) {
      const auto id = row->FindInt("accountId");
      return id && *id >= 0;
    }
    return !Text(row, "userId").empty();
  };
  if (!profile_id.empty()) {
    if (const auto* row = bindings->FindDict(profile_id); valid(row)) return row;
  }
  if (!path.empty()) {
    for (const auto [key, value] : *bindings) {
      if (key.empty()) continue;
      const auto* row = value.GetIfDict();
      if (valid(row) && Text(row, "profilePath") == path) return row;
    }
  }
  return nullptr;
}
bool HasSession(const Dict& state, const Dict* account) {
  const auto id = account ? account->FindInt("id") : std::nullopt;
  const auto* sessions = state.FindDict("sessions");
  const auto* session = sessions && id
      ? sessions->FindDict(base::NumberToString(*id)) : nullptr;
  // Match supplied reader's presence predicate; credentials are never retained
  // in an output structure, returned, or logged.
  return !Text(session, "accessToken").empty() &&
         !Text(session, "refreshToken").empty();
}
const Dict* Bootstrap(const Dict& state, const Dict* account) {
  const auto* global = state.FindDict("localBootstrap");
  if (!account) return global;
  const auto id = account->FindInt("id");
  if (!id || *id < 0) return nullptr;
  const auto* rows = state.FindDict("localBootstraps");
  size_t count = 0;
  bool has_zero = false;
  const Dict* exact = nullptr;
  if (rows) {
    for (const auto [key, value] : *rows) {
      int number = -1;
      const auto* row = value.GetIfDict();
      if (!base::StringToInt(key, &number) || number < 0 || !row) continue;
      ++count;
      has_zero |= number == 0;
      if (!exact && number == *id) exact = row;
    }
  }
  if (exact) return exact;
  // Original parser appends the historical global record when no account-0
  // record exists. That record participates in its vector size guard.
  if (global && !has_zero) ++count;
  return global && (*id == 0 || count <= 1) ? global : nullptr;
}
int LegacyState(const Dict& state, const Dict* account) {
  const auto* bootstrap = Bootstrap(state, account);
  const bool complete = Flag(bootstrap, "isComplete");
  const bool history = Flag(bootstrap, "hasEverBoundCloudUser");
  const bool pending = Text(bootstrap, "vaultSyncMode") == "pending_choice";
  const auto bound_user = Text(bootstrap, "boundUserId");
  const auto account_user = Text(account, "userId");
  if (account) {
    if ((HasSession(state, account) || Text(account, "authStatus") == "paused") &&
        !account_user.empty()) {
      if (complete && !pending && !bound_user.empty() &&
          bound_user == account_user) return 3;
      return history ? 1 : 0;
    }
    if (Text(account, "mode") == "local" && complete && !pending &&
        (bound_user.empty() || account_user.empty() || bound_user == account_user)) {
      return 3;
    }
  }
  return history ? 2 : complete && !pending ? 3 : 0;
}
bool LegacyComplete(const Dict& state, std::string_view profile_id,
                     std::string_view path, std::string_view user) {
  const auto* cloud = state.FindDict("profileBindings");
  const auto* local = state.FindDict("profileAccountBindings");
  if (const auto* binding = FindBinding(cloud, profile_id, path, false)) {
    if (const auto bound_user = Text(binding, "userId"); !bound_user.empty()) {
      return LegacyState(state, FindAccount(state, std::nullopt, bound_user)) == 3;
    }
    const auto* bootstrap = state.FindDict("localBootstrap");
    return Flag(bootstrap, "isComplete") &&
           Text(bootstrap, "vaultSyncMode") != "pending_choice";
  }
  if (!user.empty()) {
    return LegacyState(state, FindAccount(state, std::nullopt, user)) == 3;
  }
  if (const auto* binding = FindBinding(local, profile_id, path, true)) {
    const auto* account = FindAccount(state, binding->FindInt("accountId"));
    return account && LegacyState(state, account) == 3;
  }
  const auto* global = state.FindDict("localBootstrap");
  if (Flag(global, "hasEverBoundCloudUser") ||
      !Text(global, "boundUserId").empty() ||
      (cloud && !cloud->empty()) || (local && !local->empty())) return false;
  if (const auto* rows = state.FindDict("localBootstraps")) {
    for (const auto [key, value] : *rows) {
      int id = -1;
      const auto* row = value.GetIfDict();
      if (!base::StringToInt(key, &id) || id < 0 || !row) continue;
      if (Flag(row, "hasEverBoundCloudUser") || !Text(row, "boundUserId").empty()) {
        return false;
      }
    }
  }
  if (const auto* accounts = state.FindList("accounts")) {
    for (const auto& value : *accounts) {
      const auto* account = value.GetIfDict();
      if (!account || !account->FindInt("id")) continue;
      if (Text(account, "mode") == "cloud" || HasSession(state, account) ||
          Text(account, "authStatus") == "paused") return false;
    }
  }
  return Flag(global, "isComplete") &&
         Text(global, "vaultSyncMode") != "pending_choice";
}
bool Complete(const Dict& state, std::string_view id, std::string_view path,
              std::string_view user) {
  const Dict* account = nullptr;
  bool selected_binding = false;
  if (const auto* binding = FindBinding(
          state.FindDict("profileAccountBindings"), id, path, true)) {
    selected_binding = true;
    account = FindAccount(state, binding->FindInt("accountId"));
  }
  if (!selected_binding) {
    if (const auto* binding = FindBinding(
            state.FindDict("profileBindings"), id, path, false)) {
      selected_binding = true;
      account = FindAccount(state, std::nullopt, Text(binding, "userId"));
    }
  }
  if (!selected_binding && !user.empty()) account = FindAccount(state, std::nullopt, user);
  if (!selected_binding && user.empty()) {
    const auto* local = state.FindDict("profileAccountBindings");
    const auto* cloud = state.FindDict("profileBindings");
    if ((!local || local->empty()) && (!cloud || cloud->empty())) {
      account = FindAccount(state, state.FindInt("currentAccountId"));
    }
  }
  // Explicit null/empty/wrong-type field is a known false result. Only an
  // actually absent property permits the original legacy bootstrap fallback.
  if (account && account->contains("onboardingCompletedAt")) {
    return !Text(account, "onboardingCompletedAt").empty();
  }
  return LegacyComplete(state, id, path, user);
}
}  // namespace

std::optional<bool> EvaluateAccountBootstrapState(
    const base::Value& accounts, std::string_view profile_id,
    const base::FilePath& profile_path, std::string_view account_user_id) {
  const auto* parsed = accounts.GetIfDict();
  if (!parsed) return std::nullopt;
  Dict projected = parsed->Clone();
  // The supplied parser omits malformed/empty-ID bindings before resolution;
  // they do not count as real bindings in its no-bindings fallback guards.
  for (const auto name : {"profileAccountBindings", "profileBindings"}) {
    Dict rows;
    if (const auto* input = parsed->FindDict(name)) {
      for (const auto [id, value] : *input) {
        const auto* row = value.GetIfDict();
        if (id.empty() || !row) continue;
        if (std::string_view(name) == "profileAccountBindings") {
          const auto account = row->FindInt("accountId");
          if (!account || *account < 0) continue;
        } else if (Text(row, "userId").empty()) {
          continue;
        }
        rows.Set(id, row->Clone());
      }
    }
    projected.Set(name, std::move(rows));
  }
  if (const auto* rows = parsed->FindDict("localBootstraps")) {
    for (const auto [key, value] : *rows) {
      int id = -1;
      if (base::StringToInt(key, &id) && id == 0 && value.is_dict()) {
        // The supplied parser's account-0 row replaces its legacy default.
        projected.Set("localBootstrap", value.GetDict().Clone());
      }
    }
  }
  const auto* state = &projected;
  if (Complete(*state, profile_id, profile_path.value(), account_user_id)) return true;
  if (profile_path.empty()) return false;
  const auto normalized = profile_path.StripTrailingSeparators();
  for (const auto* bindings : {state->FindDict("profileAccountBindings"),
                               state->FindDict("profileBindings")}) {
    if (!bindings) continue;
    for (const auto [id, value] : *bindings) {
      const auto* binding = value.GetIfDict();
      const auto path = Text(binding, "profilePath");
      if (id.empty() || path.empty()) continue;
      if (bindings == state->FindDict("profileAccountBindings")) {
        const auto account = binding->FindInt("accountId");
        if (!account || *account < 0) continue;
      }
      if (base::FilePath(path).StripTrailingSeparators() == normalized &&
          Complete(*state, id, path, {})) return true;
    }
  }
  return false;
}
std::optional<bool> ReadAccountBootstrapState(
    const base::FilePath& home, std::string profile_id,
    base::FilePath profile_path, std::string account_user_id) {
  std::string text;
  if (!base::ReadFileToString(home.AppendASCII("accounts.json"), &text)) {
    return std::nullopt;
  }
  auto state = base::JSONReader::Read(text, base::JSON_PARSE_RFC, 200);
  return state ? EvaluateAccountBootstrapState(
                     *state, profile_id, profile_path, account_user_id)
               : std::nullopt;
}
}  // namespace aux

// Copyright 2026 Aux Authors. All rights reserved.
// Original4160ce0 selection +40ff8dc/40ff964/40ff848, without UI effects.
#include "chrome/browser/aux/account_profile_source.h"
#include "chrome/browser/aux/account_bootstrap_state.h"
#include "base/strings/string_number_conversions.h"
#include <utility>
namespace aux {
namespace {
using Dict = base::DictValue;
std::string Text(const Dict* row, const char* key) {
  const auto* value = row ? row->FindString(key) : nullptr;
  return value ? *value : std::string();
}
bool HasSession(const Dict& state, int id) {
  const auto* sessions = state.FindDict("sessions");
  const auto* row = sessions ? sessions->FindDict(base::NumberToString(id)) : nullptr;
  return !Text(row, "accessToken").empty() && !Text(row, "refreshToken").empty();
}
bool AnySession(const Dict& state) {
  const auto* rows = state.FindDict("sessions");
  if (!rows) return false;
  for (const auto [key, value] : *rows) {
    const auto* row = value.GetIfDict();
    if (!Text(row, "accessToken").empty() && !Text(row, "refreshToken").empty()) return true;
  }
  return false;
}
const Dict* FindAccount(const Dict& state, std::optional<int> id,
                        const std::string& user = {}) {
  const auto* rows = state.FindList("accounts");
  if (!rows) return nullptr;
  for (const auto& value : *rows) {
    const auto* row = value.GetIfDict();
    if (!row || !row->FindInt("id")) continue;
    if (id ? row->FindInt("id") == id : !user.empty() && Text(row, "userId") == user) return row;
  }
  return nullptr;
}
bool Authenticated(const Dict& state, const Dict* row) {
  return row && row->FindInt("id") &&
      (HasSession(state, *row->FindInt("id")) || Text(row, "authStatus") == "paused");
}
const Dict* SelectedAccount(const Dict& state) {
  const auto* row = FindAccount(state, state.FindInt("currentAccountId").value_or(0));
  if (row && (Authenticated(state, row) || !AnySession(state))) return row;
  const auto* rows = state.FindList("accounts");
  if (rows) for (const auto& value : *rows)
    if (const auto* candidate = value.GetIfDict(); Authenticated(state, candidate)) return candidate;
  return nullptr;
}
const Dict* CloudBinding(const Dict& state, const AccountProfileSourceInput& input) {
  const auto* rows = state.FindDict("profileBindings");
  if (!rows) return nullptr;
  if (!input.profile_id.empty()) {
    const auto* row = rows->FindDict(input.profile_id);
    if (!Text(row, "userId").empty()) return row;
  }
  if (!input.profile_path.empty()) for (const auto [key, value] : *rows) {
    const auto* row = value.GetIfDict();
    if (!key.empty() && !Text(row, "userId").empty() &&
        Text(row, "profilePath") == input.profile_path.value()) return row;
  }
  return nullptr;
}
bool ClaimedElsewhere(const Dict& state, const AccountProfileSourceInput& input,
                      const std::string& user, int id) {
  if (const auto* rows = state.FindDict("profileBindings"))
    for (const auto [key, value] : *rows) {
      const auto* row = value.GetIfDict();
      if (key.empty() || Text(row, "userId").empty()) continue;
      if (Text(row, "userId") == user || (id >= 0 && row->FindInt("accountId") == id)) return true;
    }
  for (const auto& claim : input.loaded_claims) {
    if (claim.profile_path == input.profile_path) continue;
    if ((!claim.user_id.empty() && claim.user_id == user) ||
        (id >= 0 && claim.account_id == id)) return true;
  }
  return false;
}
}  // namespace
std::optional<AccountProfileProjection> ProjectAccountProfileSource(
    const base::Value& value, const AccountProfileSourceInput& input) {
  const auto* state = value.GetIfDict();
  if (!state) return std::nullopt;
  AccountProfileProjection result;
  result.global_onboarding_complete = EvaluateAccountBootstrapState(
      value, input.profile_id, input.profile_path, input.stored_user_id).value_or(false);
  const auto* binding = CloudBinding(*state, input);
  auto user = binding ? Text(binding, "userId") : input.stored_user_id;
  if (user.empty() && input.stored_account_id && *input.stored_account_id >= 0)
    user = Text(FindAccount(*state, input.stored_account_id), "userId");
  const auto* selected = SelectedAccount(*state);
  if (input.allow_binding && input.is_last_used_loaded_profile && selected &&
      Authenticated(*state, selected) && user.empty() &&
      !Text(selected, "email").empty() && !Text(selected, "userId").empty() &&
      !ClaimedElsewhere(*state, input, Text(selected, "userId"), *selected->FindInt("id"))) {
    user = Text(selected, "userId");
    result.auto_bound = true;
  }
  const auto* account = user.empty() ? nullptr : FindAccount(*state, std::nullopt, user);
  const bool disconnected_unclaimed = account && !binding && !Authenticated(*state, account);
  if (disconnected_unclaimed) account = nullptr;
  // Missing real selected account never falls back to another current account.
  if (!account) {
    result.bootstrap_complete = (user.empty() || disconnected_unclaimed) && EvaluateLegacyAccountBootstrapState(
        value, input.profile_id, input.profile_path, {}).value_or(false);
    return result;
  }
  result.clear_binding = false;
  AccountProfileRecord record;
  record.id = *account->FindInt("id");
  record.user_id = user;
  record.name = Text(account, "name");
  record.email = Text(account, "email");
  record.picture_url = Text(account, "profileUrl");
  record.has_persisted_session = HasSession(*state, record.id);
  record.auth_paused = Text(account, "authStatus") == "paused";
  result.bootstrap_complete = EvaluateLegacyAccountBootstrapState(
      value, input.profile_id, input.profile_path, user).value_or(false);
  if (!input.profile_id.empty() && !record.user_id.empty() &&
      (!binding || Text(binding, "userId") != record.user_id ||
       binding->FindInt("accountId") != record.id ||
       Text(binding, "profilePath") != input.profile_path.value())) {
    Dict request;
    request.Set("profileId", input.profile_id);
    request.Set("userId", record.user_id);
    if (record.id >= 0) request.Set("accountId", record.id);
    if (!input.profile_path.empty()) request.Set("profilePath", input.profile_path.value());
    result.binding_to_persist = std::move(request);
  }
  result.account = std::move(record);
  return result;
}
}  // namespace aux

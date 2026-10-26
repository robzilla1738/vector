// Copyright 2026 Aux Authors. All rights reserved.
// Synthetic source-projection checks only. No files/Profile/daemon/network/OS.
#include "chrome/browser/aux/account_profile_source.h"
#include <utility>
#include "base/check.h"
#include "base/json/json_reader.h"
int main() {
  auto state = base::JSONReader::Read(R"({
    "currentAccountId":7,
    "accounts":[{"id":7,"userId":"fixture-user","name":"Fixture",
                 "email":"fixture@example.invalid","profileUrl":""}],
    "sessions":{"7":{"accessToken":"synthetic-presence-only",
                        "refreshToken":"synthetic-presence-only"}},
    "profileBindings":{}
  })", base::JSON_PARSE_RFC);
  CHECK(state);
  aux::AccountProfileSourceInput input;
  input.profile_path = base::FilePath("/disposable/Profile");
  input.profile_id = "fixture-profile";
  input.allow_binding = true;
  input.is_last_used_loaded_profile = true;
  auto chosen = aux::ProjectAccountProfileSource(*state, input);
  CHECK(chosen && chosen->auto_bound && !chosen->clear_binding);
  CHECK(chosen->account && chosen->account->id == 7);
  CHECK(chosen->binding_to_persist);
  input.is_last_used_loaded_profile = false;
  auto not_last = aux::ProjectAccountProfileSource(*state, input);
  CHECK(not_last && not_last->clear_binding && !not_last->auto_bound);
  input.is_last_used_loaded_profile = true;
  input.loaded_claims.push_back({base::FilePath("/disposable/Other"),
                                  "fixture-user", 7});
  auto claimed = aux::ProjectAccountProfileSource(*state, input);
  CHECK(claimed && claimed->clear_binding && !claimed->auto_bound);
  input.loaded_claims.clear();
  input.stored_user_id = "missing-user";
  auto missing = aux::ProjectAccountProfileSource(*state, input);
  CHECK(missing && missing->clear_binding && !missing->bootstrap_complete);
  input.stored_user_id = "fixture-user";
  state->GetDict().Set("sessions", base::DictValue());
  auto disconnected_unclaimed = aux::ProjectAccountProfileSource(*state, input);
  CHECK(disconnected_unclaimed && disconnected_unclaimed->clear_binding);
  base::DictValue binding;
  binding.Set("userId", "fixture-user");
  binding.Set("accountId", 7);
  binding.Set("profilePath", "/disposable/Profile");
  base::DictValue bindings;
  bindings.Set("fixture-profile", std::move(binding));
  state->GetDict().Set("profileBindings", std::move(bindings));
  auto disconnected_bound = aux::ProjectAccountProfileSource(*state, input);
  CHECK(disconnected_bound && !disconnected_bound->clear_binding);
  CHECK(disconnected_bound->account &&
        !disconnected_bound->account->has_persisted_session &&
        !disconnected_bound->account->auth_paused);
  auto local = base::JSONReader::Read(R"({
    "currentAccountId":7,
    "accounts":[{"id":0,"mode":"local","onboardingCompletedAt":"2026-10-26"},
                {"id":7,"mode":"local"}],
    "profileBindings":{}, "sessions":{},
    "profileAccountBindings":{"fixture-profile":{"profileId":"fixture-profile",
      "profilePath":"/disposable/Profile","accountId":0}}
  })", base::JSON_PARSE_RFC);
  CHECK(local);
  input.stored_user_id.clear(); input.stored_account_id.reset();
  input.allow_binding = false; input.is_last_used_loaded_profile = false;
  auto zero = aux::ProjectAccountProfileSource(*local, input);
  CHECK(zero && !zero->clear_binding && zero->account->id == 0);
  CHECK(zero->account->user_id.empty() && !zero->account->has_persisted_session);
  CHECK(zero->bootstrap_complete && !zero->auto_bound && !zero->binding_to_persist);
  input.profile_path = base::FilePath("/disposable/Other");
  CHECK(aux::ProjectAccountProfileSource(*local,input)->clear_binding);
  input.profile_path = base::FilePath("/disposable/Profile");
  input.profile_id = "other-profile";
  CHECK(aux::ProjectAccountProfileSource(*local,input)->clear_binding);
  input.profile_id = "fixture-profile";
  auto* local_row=local->GetDict().FindList("accounts")->front().GetIfDict();
  local_row->Set("mode","cloud");
  CHECK(aux::ProjectAccountProfileSource(*local,input)->clear_binding);
  local_row->Set("mode","local");local_row->Set("userId","not-local");
  CHECK(aux::ProjectAccountProfileSource(*local,input)->clear_binding);
  local_row->Remove("userId");
  local->GetDict().FindDict("profileAccountBindings")->FindDict("fixture-profile")->Set("accountId",99);
  CHECK(aux::ProjectAccountProfileSource(*local,input)->clear_binding);
  CHECK(!aux::ProjectAccountProfileSource(base::Value(), input));
}

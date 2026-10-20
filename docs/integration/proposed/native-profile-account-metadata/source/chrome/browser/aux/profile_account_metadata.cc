// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/aux/profile_account_metadata.h"

#include <optional>
#include <string_view>

#include "base/strings/string_number_conversions.h"
#include "chrome/browser/aux/profile_state.h"

namespace aux {
namespace {
std::string String(const base::DictValue& dict, const char* key) {
  const auto* value = dict.FindString(key);
  return value ? *value : std::string();
}

const base::DictValue* Account(const base::ListValue& accounts,
                               const std::string& user_id,
                               std::optional<int> account_id) {
  if (!user_id.empty()) {
    for (const auto& row : accounts) {
      if (row.is_dict() && String(row.GetDict(), "userId") == user_id) {
        return &row.GetDict();
      }
    }
  }
  if (account_id && *account_id >= 0) {
    for (const auto& row : accounts) {
      if (row.is_dict() && row.GetDict().FindInt("id") == account_id) {
        return &row.GetDict();
      }
    }
  }
  return nullptr;
}

bool HasPresentationSession(const base::DictValue& registry,
                            const base::DictValue& account) {
  if (String(account, "authStatus") == "paused") {
    return true;
  }
  const auto id = account.FindInt("id");
  const auto* sessions = registry.FindDict("sessions");
  const auto* session = id && *id >= 0 && sessions
                            ? sessions->FindDict(base::NumberToString(*id))
                            : nullptr;
  return session && !String(*session, "accessToken").empty() &&
         !String(*session, "refreshToken").empty();
}
}  // namespace

ProfileAccountEmails ProjectProfileAccountEmails(
    const base::DictValue& registry) {
  ProfileAccountEmails result;
  const auto* accounts = registry.FindList("accounts");
  if (!accounts) {
    return result;
  }
  for (const char* name : {"profileBindings", "profileAccountBindings"}) {
    const auto* bindings = registry.FindDict(name);
    if (!bindings) {
      continue;
    }
    for (const auto [key, value] : *bindings) {
      if (key.empty() || !value.is_dict()) {
        continue;
      }
      const auto& binding = value.GetDict();
      const auto user = name == std::string_view("profileBindings")
                            ? String(binding, "userId")
                            : std::string();
      const auto id = binding.FindInt("accountId");
      if ((name == std::string_view("profileBindings") && user.empty()) ||
          (name == std::string_view("profileAccountBindings") &&
           (!id || *id < 0))) {
        continue;
      }
      const auto path = String(binding, "profilePath");
      const auto* account = Account(*accounts, user, id);
      if (path.empty() || !account ||
          !HasPresentationSession(registry, *account)) {
        continue;
      }
      const auto email = String(*account, "email");
      if (!email.empty()) {
        // Original map insertion leaves the first path binding unchanged.
        result.try_emplace(base::FilePath::FromUTF8Unsafe(path), email);
      }
    }
  }
  return result;
}

ProfileAccountEmails ReadProfileAccountEmails(const base::FilePath& home) {
  const auto registry = ReadPrivateAccountRegistry(home);
  return registry ? ProjectProfileAccountEmails(*registry)
                  : ProfileAccountEmails();
}
}  // namespace aux

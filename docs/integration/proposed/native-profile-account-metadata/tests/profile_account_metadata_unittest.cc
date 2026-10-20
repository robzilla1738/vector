// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/aux/profile_account_metadata.h"
#include "chrome/browser/aux/profile_state.h"

#include <sys/stat.h>

#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/json/json_reader.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace aux {
TEST(ProfileAccountMetadata, ExactBindingAndPresentationPrecedence) {
  const auto registry = base::JSONReader::ReadDict(R"({
    "accounts":[
      {"id":1,"userId":"one","email":"one@example.test","authStatus":"paused"},
      {"id":2,"userId":"two","email":"two@example.test"},
      {"id":3,"email":"not-signed-in@example.test"},
      {"id":4,"email":"partial@example.test"}
    ],
    "sessions":{
      "2":{"accessToken":"fixture-access","refreshToken":"fixture-refresh"},
      "4":{"accessToken":"fixture-access"}
    },
    "profileBindings":{
      "old":{"userId":"one","accountId":2,"profilePath":"/disposable/duplicate"},
      "fallback":{"userId":"not-found","accountId":2,"profilePath":"/disposable/fallback"},
      "empty-user":{"userId":"","accountId":2,"profilePath":"/disposable/rejected"}
    },
    "profileAccountBindings":{
      "new":{"accountId":2,"profilePath":"/disposable/duplicate"},
      "numeric":{"accountId":2,"profilePath":"/disposable/numeric"},
      "unsigned":{"accountId":3,"profilePath":"/disposable/unsigned"},
      "partial":{"accountId":4,"profilePath":"/disposable/partial"},
      "negative":{"accountId":-1,"profilePath":"/disposable/negative"}
    }
  })",
                                                   base::JSON_PARSE_RFC);
  ASSERT_TRUE(registry);
  const auto emails = ProjectProfileAccountEmails(*registry);
  ASSERT_EQ(emails.size(), 3u);
  EXPECT_EQ(emails.at(base::FilePath("/disposable/duplicate")),
            "one@example.test");
  EXPECT_EQ(emails.at(base::FilePath("/disposable/fallback")),
            "two@example.test");
  EXPECT_EQ(emails.at(base::FilePath("/disposable/numeric")),
            "two@example.test");
}

TEST(ProfileAccountMetadata, ProtectedReaderRejectsPublicModeAndSymlink) {
  base::ScopedTempDir home;
  ASSERT_TRUE(home.CreateUniqueTempDir());
  const auto registry = home.GetPath().AppendASCII("accounts.json");
  ASSERT_TRUE(base::WriteFile(registry, "{}"));
  ASSERT_EQ(chmod(registry.value().c_str(), 0600), 0);
  EXPECT_TRUE(ReadPrivateAccountRegistry(home.GetPath()));
  ASSERT_EQ(chmod(registry.value().c_str(), 0644), 0);
  EXPECT_FALSE(ReadPrivateAccountRegistry(home.GetPath()));
  ASSERT_TRUE(base::DeleteFile(registry));
  const auto other = home.GetPath().AppendASCII("fixture.json");
  ASSERT_TRUE(base::WriteFile(other, "{}"));
  ASSERT_EQ(chmod(other.value().c_str(), 0600), 0);
  ASSERT_TRUE(base::CreateSymbolicLink(other, registry));
  EXPECT_FALSE(ReadPrivateAccountRegistry(home.GetPath()));
}
}  // namespace aux

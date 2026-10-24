// Copyright 2026 Aux Contributors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/value_store/leveldb_value_store.h"

#include "base/files/scoped_temp_dir.h"
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "third_party/leveldatabase/src/include/leveldb/write_batch.h"

namespace value_store {
namespace {

class AuxUiPreferenceMigrationTest : public testing::Test {
 protected:
  void SetUp() override {
    ASSERT_TRUE(directory_.CreateUniqueTempDir());
    store_ = std::make_unique<LeveldbValueStore>("Test", directory_.GetPath());
    ASSERT_TRUE(store_->Get().status().ok());
  }

  void Seed(const std::string& key, const base::Value& value) {
    ASSERT_TRUE(store_->Set(ValueStore::DEFAULTS, key, value).status().ok());
  }

  base::test::TaskEnvironment tasks_;
  base::ScopedTempDir directory_;
  std::unique_ptr<LeveldbValueStore> store_;
};

TEST_F(AuxUiPreferenceMigrationTest, PreservesFalseAndUnknownValuesAndReopens) {
  Seed("aside.capture.enabled", base::Value(false));
  Seed("aside.browserColorScheme", base::Value("dark"));
  Seed("aside.tabsTidy.customPrompt", base::Value("Group by project"));
  Seed("unrelated", base::Value("keep"));
  auto capture = store_->CaptureAuxUiPreferencesForMigration();
  ASSERT_TRUE(capture.has_value());
  ASSERT_TRUE(store_->CommitAuxUiPreferenceMigration(std::move(*capture)).ok());
  store_.reset();
  store_ = std::make_unique<LeveldbValueStore>("Test", directory_.GetPath());
  auto values = store_->Get();
  ASSERT_TRUE(values.status().ok());
  EXPECT_EQ(values.settings().FindBool("aux.capture.enabled.v2"), false);
  ASSERT_TRUE(values.settings().FindString("aux.browserColorScheme.v2"));
  EXPECT_EQ(*values.settings().FindString("aux.browserColorScheme.v2"), "dark");
  ASSERT_TRUE(values.settings().FindString("unrelated"));
  EXPECT_EQ(*values.settings().FindString("unrelated"), "keep");
  EXPECT_FALSE(values.settings().contains("aside.capture.enabled"));
  EXPECT_FALSE(values.settings().contains("aside.browserColorScheme"));
  EXPECT_FALSE(values.settings().contains("aside.tabsTidy.customPrompt"));
  auto retry = store_->CaptureAuxUiPreferencesForMigration();
  ASSERT_TRUE(retry.has_value());
  EXPECT_TRUE(store_->CommitAuxUiPreferenceMigration(std::move(*retry)).ok());
}

TEST_F(AuxUiPreferenceMigrationTest, ConflictingTargetLeavesBothValuesIntact) {
  Seed("aside.capture.enabled", base::Value(false));
  Seed("aux.capture.enabled.v2", base::Value(true));
  EXPECT_FALSE(store_->CaptureAuxUiPreferencesForMigration().has_value());
  auto values = store_->Get();
  ASSERT_TRUE(values.status().ok());
  EXPECT_EQ(values.settings().FindBool("aside.capture.enabled"), false);
  EXPECT_EQ(values.settings().FindBool("aux.capture.enabled.v2"), true);
}

TEST_F(AuxUiPreferenceMigrationTest, CorruptRawRecordIsNotDeletedOrRepaired) {
  leveldb::WriteBatch batch;
  batch.Put("aside.capture.enabled", "not valid JSON");
  ASSERT_TRUE(store_->WriteToDbForTest(&batch));
  EXPECT_FALSE(store_->CaptureAuxUiPreferencesForMigration().has_value());
  // A second migration capture must see the same corruption. Ordinary Get()
  // would remove it, so it deliberately is not used to check this path.
  EXPECT_FALSE(store_->CaptureAuxUiPreferencesForMigration().has_value());
}

TEST_F(AuxUiPreferenceMigrationTest, RejectsInterveningOperationsAndForeignStore) {
  Seed("aside.capture.enabled", base::Value(false));
  auto capture = store_->CaptureAuxUiPreferencesForMigration();
  ASSERT_TRUE(capture.has_value());
  Seed("unrelated", base::Value("changed"));
  EXPECT_FALSE(store_->CommitAuxUiPreferenceMigration(std::move(*capture)).ok());

  base::ScopedTempDir other_directory;
  ASSERT_TRUE(other_directory.CreateUniqueTempDir());
  LeveldbValueStore other("Test", other_directory.GetPath());
  ASSERT_TRUE(other.Get().status().ok());
  capture = store_->CaptureAuxUiPreferencesForMigration();
  ASSERT_TRUE(capture.has_value());
  EXPECT_FALSE(other.CommitAuxUiPreferenceMigration(std::move(*capture)).ok());
}

TEST_F(AuxUiPreferenceMigrationTest, UnopenedStoreDoesNotCreateDatabase) {
  base::ScopedTempDir unused_directory;
  ASSERT_TRUE(unused_directory.CreateUniqueTempDir());
  LeveldbValueStore unused("Test", unused_directory.GetPath().AppendASCII("absent"));
  EXPECT_FALSE(unused.CaptureAuxUiPreferencesForMigration().has_value());
  EXPECT_FALSE(unused.CommitAuxUiPreferenceMigration(nullptr).ok());
}

}  // namespace
}  // namespace value_store

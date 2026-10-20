// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/aux/account_bootstrap_state.h"

#include "base/json/json_reader.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace aux {
namespace {
std::optional<bool> Evaluate(std::string_view json,
                             std::string_view id = "fixture-profile",
                             std::string_view path = "/fixture/Profile 1") {
  auto value = base::JSONReader::Read(json, base::JSON_PARSE_RFC);
  EXPECT_TRUE(value.has_value());
  return value ? EvaluateAccountBootstrapState(
                     *value, id, base::FilePath(path), {}) : std::nullopt;
}
TEST(AccountBootstrapStateTest, UnknownObjectIsNotKnownIncomplete) {
  EXPECT_EQ(Evaluate("null"), std::nullopt);
  EXPECT_EQ(Evaluate("{}"), false);
}
TEST(AccountBootstrapStateTest, AnonymousLocalDoesNotFabricateOnboarding) {
  EXPECT_EQ(Evaluate(R"({"currentAccountId":0,"accounts":[
    {"id":0,"mode":"local","provider":"anonymous","onboardingCompletedAt":null}
  ]})"), false);
}
TEST(AccountBootstrapStateTest, ExplicitNullWinsOverLegacyComplete) {
  EXPECT_EQ(Evaluate(R"({"currentAccountId":0,"accounts":[
    {"id":0,"mode":"local","onboardingCompletedAt":null}],
    "localBootstrap":{"isComplete":true}})"), false);
  EXPECT_EQ(Evaluate(R"({"currentAccountId":0,"accounts":[
    {"id":0,"mode":"local"}],"localBootstrap":{"isComplete":true}})"), true);
}
TEST(AccountBootstrapStateTest, ActualBindingWinsOverOtherCurrentAccount) {
  EXPECT_EQ(Evaluate(R"({"currentAccountId":1,"accounts":[
    {"id":0,"onboardingCompletedAt":null},
    {"id":1,"onboardingCompletedAt":"fixture-completed"}],
    "profileAccountBindings":{"fixture-profile":{"accountId":0}}})"), false);
}
TEST(AccountBootstrapStateTest, MatchingNormalizedPathResolvesActualOtherKey) {
  EXPECT_EQ(Evaluate(R"({"accounts":[
    {"id":4,"onboardingCompletedAt":"fixture-completed"}],
    "profileAccountBindings":{"old-profile-id":{
      "accountId":4,"profilePath":"/fixture/Profile 1/"}}})"), true);
}
TEST(AccountBootstrapStateTest, CloudHistoryAndPendingChoiceRemainRealFailures) {
  EXPECT_EQ(Evaluate(R"({"localBootstrap":{
    "isComplete":true,"vaultSyncMode":"pending_choice"}})"), false);
  EXPECT_EQ(Evaluate(R"({"accounts":[{"id":0,"mode":"cloud"}],
    "localBootstrap":{"isComplete":true}})"), false);
}
TEST(AccountBootstrapStateTest, AccountZeroBootstrapIsActualLegacyDefault) {
  EXPECT_EQ(Evaluate(R"({"currentAccountId":0,"accounts":[{"id":0,"mode":"local"}],
    "localBootstrap":{"isComplete":false},
    "localBootstraps":{"0":{"isComplete":true}}})"), true);
}
}  // namespace
}  // namespace aux

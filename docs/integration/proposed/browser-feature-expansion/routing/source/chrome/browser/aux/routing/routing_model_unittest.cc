// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/routing/routing_model.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux::routing {
namespace {
Configuration Fixture() {
  Configuration c{.revision = "19b6f236-3f92-4358-8bd9-ddaa77b566f3"};
  c.rules.push_back({.id = "6bd41982-1ba0-45aa-b6da-1f070c16784b", .host = "example.org",
      .path = "/work", .subdomains = true,
      .destination = {"23919be8-58d6-4598-8865-c3e30b518e8b", ""}});
  return c;
}
TEST(AuxRoutingModel, NormalizedBoundedRoundTripRejectsUnknownOrUnsafeInput) {
  auto c = Fixture();
  EXPECT_TRUE(DecodeConfiguration(EncodeConfiguration(c)).config);
  auto unknown = EncodeConfiguration(c); unknown.Set("script", "bad");
  EXPECT_FALSE(DecodeConfiguration(unknown).config);
  for (const auto* host : {"example.org.evil/path", "user@example.org", "EXAMPLE.org", "example.org:443"}) {
    c.rules[0].host = host;
    EXPECT_FALSE(DecodeConfiguration(EncodeConfiguration(c)).config);
  }
  c = Fixture(); c.rules[0].path = "/work/../personal";
  EXPECT_FALSE(DecodeConfiguration(EncodeConfiguration(c)).config);
  c = Fixture(); c.rules.push_back(c.rules.front());
  EXPECT_FALSE(DecodeConfiguration(EncodeConfiguration(c)).config);
}
TEST(AuxRoutingModel, HostAndPathBoundariesCannotMatchLookalikesOrCredentials) {
  const auto c = Fixture();
  EXPECT_NE(Match(c, GURL("https://a.example.org/work/report")), nullptr);
  for (const auto* url : {"https://example.org.evil/work", "https://notexample.org/work",
      "https://example.org/workshop", "https://u:p@example.org/work", "file:///work"})
    EXPECT_EQ(Match(c, GURL(url)), nullptr);
}
TEST(AuxRoutingModel, DeterministicPrioritySpecificityThenUserOrder) {
  auto c = Fixture(); auto exact = c.rules.front();
  exact.id = "cd852c30-9f38-4aa6-bbfd-4d98f85cec72"; exact.subdomains = false;
  c.rules.push_back(exact);
  EXPECT_EQ(Match(c, GURL("https://example.org/work"))->id, exact.id);
  c.rules[0].priority = 1;
  EXPECT_EQ(Match(c, GURL("https://example.org/work"))->id, c.rules[0].id);
  c.rules[0].enabled = false;
  EXPECT_EQ(Match(c, GURL("https://example.org/work"))->id, exact.id);
}
}  // namespace
}  // namespace aux::routing

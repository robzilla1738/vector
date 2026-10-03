// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_private_fixture_methods.h"
#include "testing/gtest/include/gtest/gtest.h"
#include <initializer_list>
namespace aux {
TEST(NativePrivateFixtureMethodsTest, DisabledFixtureNeverAcceptsPrivateNames) {
  const base::Value args(base::ListValue{});
  for (const auto& method : kNativePrivateFixtureMethods)
    EXPECT_FALSE(NativePrivateFixtureMethodAccepts(method.name, args, false, false, false));
}
TEST(NativePrivateFixtureMethodsTest, DistinctNativeGatesAndWarmBothOptIns) {
  const base::Value args(base::ListValue{});
  EXPECT_TRUE(NativePrivateFixtureMethodAccepts("appearanceSnapshot", args, true, false, false));
  EXPECT_FALSE(NativePrivateFixtureMethodAccepts("prepareGuestTabSwitchPresentation", args, true, false, true));
  EXPECT_TRUE(NativePrivateFixtureMethodAccepts("prepareGuestTabSwitchPresentation", args, false, true, false));
  for (auto name : {"prepareAuxWarmWindow", "completeAuxWarmWindow"}) {
    EXPECT_FALSE(NativePrivateFixtureMethodAccepts(name, args, false, true, false));
    EXPECT_FALSE(NativePrivateFixtureMethodAccepts(name, args, false, false, true));
    EXPECT_TRUE(NativePrivateFixtureMethodAccepts(name, args, false, true, true));
  }
}
TEST(NativePrivateFixtureMethodsTest, ForeignUnknownAndMalformedArgumentsRefuse) {
  EXPECT_FALSE(NativePrivateFixtureMethodAccepts("new-window", base::Value(base::ListValue{}), true, true, true));
  EXPECT_FALSE(NativePrivateFixtureMethodAccepts("prepareForeignWindow", base::Value(base::ListValue{}), true, true, true));
  for (const auto& method : kNativePrivateFixtureMethods) {
    EXPECT_FALSE(NativePrivateFixtureMethodAccepts(method.name, base::Value(), true, true, true));
    EXPECT_FALSE(NativePrivateFixtureMethodAccepts(method.name, base::Value(base::DictValue{}), true, true, true));
    EXPECT_FALSE(NativePrivateFixtureMethodAccepts(method.name, base::Value(base::ListValue().Append(1)), true, true, true));
  }
}
}  // namespace aux

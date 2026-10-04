// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_PRIVATE_FIXTURE_METHODS_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_PRIVATE_FIXTURE_METHODS_H_
#include <string_view>
#include "base/values.h"
namespace aux {
enum class NativePrivateFixtureGate { kAppearance, kPerformance, kWarmStartup };
struct NativePrivateFixtureMethod {
  std::string_view name;
  NativePrivateFixtureGate gate;
};
inline constexpr NativePrivateFixtureMethod kNativePrivateFixtureMethods[] = {
  {"appearanceSnapshot", NativePrivateFixtureGate::kAppearance},
  {"pipAppearanceSnapshot", NativePrivateFixtureGate::kAppearance},
  {"commandPresentationSnapshot", NativePrivateFixtureGate::kPerformance},
  {"prepareGuestSplitDropPresentation", NativePrivateFixtureGate::kPerformance},
  {"prepareGuestDividerFramePresentation", NativePrivateFixtureGate::kPerformance},
  {"prepareGuestTabSwitchPresentation", NativePrivateFixtureGate::kPerformance},
  {"completeGuestPresentation", NativePrivateFixtureGate::kPerformance},
  {"preparePipWindowPresentation", NativePrivateFixtureGate::kPerformance},
  {"completePipWindowPresentation", NativePrivateFixtureGate::kPerformance},
  {"retirePipWindowPresentation", NativePrivateFixtureGate::kPerformance},
  {"prepareLittleWindowPresentation", NativePrivateFixtureGate::kPerformance},
  {"completeLittleWindowPresentation", NativePrivateFixtureGate::kPerformance},
  {"performanceFixtureNextRequest", NativePrivateFixtureGate::kPerformance},
  {"prepareCdpStopMeasurement", NativePrivateFixtureGate::kPerformance},
  {"prepareCdpTakeoverMeasurement", NativePrivateFixtureGate::kPerformance},
  {"completeCdpRetirementMeasurement", NativePrivateFixtureGate::kPerformance},
  {"sampleShellMemory", NativePrivateFixtureGate::kPerformance},
  {"sampleProcessMemory", NativePrivateFixtureGate::kPerformance},
  {"prepareSubagentMemoryWorkload", NativePrivateFixtureGate::kPerformance},
  {"prepareOrganizationAutoArchiveWork", NativePrivateFixtureGate::kPerformance},
  {"prepareOrganizationLiveFolderWork", NativePrivateFixtureGate::kPerformance},
  {"completeOrganizationWork", NativePrivateFixtureGate::kPerformance},
  {"prepareAuxWarmWindow", NativePrivateFixtureGate::kWarmStartup},
  {"completeAuxWarmWindow", NativePrivateFixtureGate::kWarmStartup},
};
constexpr bool NativePrivateFixtureMethodEnabled(const NativePrivateFixtureMethod& method,
    bool appearance, bool performance, bool startup) {
  switch (method.gate) {
    case NativePrivateFixtureGate::kAppearance: return appearance;
    case NativePrivateFixtureGate::kPerformance: return performance;
    case NativePrivateFixtureGate::kWarmStartup: return performance && startup;
  }
  return false;
}
inline bool NativePrivateFixtureMethodAccepts(std::string_view name, const base::Value& args,
    bool appearance, bool performance, bool startup) {
  if (!args.is_list() || !args.GetList().empty()) return false;
  for (const auto& method : kNativePrivateFixtureMethods) {
    if (method.name == name)
      return NativePrivateFixtureMethodEnabled(method, appearance, performance, startup);
  }
  return false;
}
}  // namespace aux
#endif

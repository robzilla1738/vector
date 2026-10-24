// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ROUTING_EXTERNAL_ROUTING_INGRESS_H_
#define CHROME_BROWSER_AUX_ROUTING_EXTERNAL_ROUTING_INGRESS_H_
#include "base/command_line.h"
#include "base/functional/callback.h"
#include "chrome/browser/ui/startup/startup_tab.h"
class Profile;
namespace aux::routing {
// Call only after native profile selection. Only receipt-marked tabs may acquire
// external authority. True transfers the entire ordered batch to this owner.
using NativeTabFallback = base::RepeatingCallback<void(const StartupTab&, Profile*)>;
bool MaybeRouteExternalTabs(Profile*, const StartupTabs&, NativeTabFallback);
// Actual ProcessSingleton argv receipt only. Ordinary HTTP(S) URL arguments and
// profile-directory/user-data-dir selectors; app/restore/private flags bypass.
using NativeCommandFallback =
    base::RepeatingCallback<void(const base::CommandLine&, Profile*)>;
bool MaybeRouteExternalCommandLine(Profile*, const base::CommandLine&,
                                   NativeCommandFallback);
}  // namespace aux::routing
#endif

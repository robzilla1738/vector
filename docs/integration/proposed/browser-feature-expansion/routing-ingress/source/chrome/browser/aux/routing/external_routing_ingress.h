// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ROUTING_EXTERNAL_ROUTING_INGRESS_H_
#define CHROME_BROWSER_AUX_ROUTING_EXTERNAL_ROUTING_INGRESS_H_
#include "base/command_line.h"
#include "base/functional/callback.h"
#include "chrome/browser/ui/startup/startup_tab.h"
class Profile;
class BrowserWindowInterface;
namespace aux::routing {
// Call only after native profile selection. Only receipt-marked tabs may acquire
// external authority. True transfers the entire ordered batch to this owner.
using NativeTabFallback = base::RepeatingCallback<void(const StartupTab&, Profile*)>;
bool MaybeRouteExternalTabs(Profile*, const StartupTabs&, NativeTabFallback,
                            base::OnceClosure settled = {},
                            base::RepeatingCallback<bool()> owner_current = {});
// Only called for actual initial argv after native startup admission.
bool MarkColdStartupArguments(const base::CommandLine&, StartupTabs*);
using StartupRoutingContinuation =
    base::OnceCallback<void(BrowserWindowInterface*, bool replace_empty_placeholder)>;
StartupRoutingContinuation PrepareColdStartupRouting(Profile*, StartupTabs*);
// Actual OS file-open receipts only; existing ChromeWeblocFile parser/resolver.
bool MaybeResolveExternalShortcutBatch(const StartupTabs&, NativeTabFallback,
    base::RepeatingCallback<void(const StartupTab&)> unresolved_native);
// Actual ProcessSingleton argv receipt only. Ordinary HTTP(S) URL arguments and
// profile-directory/user-data-dir selectors; app/restore/private flags bypass.
using NativeCommandFallback =
    base::RepeatingCallback<void(const base::CommandLine&, Profile*)>;
bool MaybeRouteExternalCommandLine(Profile*, const base::CommandLine&,
                                   NativeCommandFallback);
}  // namespace aux::routing
#endif

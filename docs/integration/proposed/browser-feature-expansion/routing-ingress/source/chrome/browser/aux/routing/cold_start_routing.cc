// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/routing/external_routing_ingress.h"
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/aux/routing/routing_service.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/simple_message_box.h"
#include "chrome/browser/ui/startup/startup_browser_creator_impl.h"
#include "chrome/browser/ui/startup/startup_types.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/common/url_constants.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/web_contents.h"
namespace aux::routing {
namespace {
void RefuseStartup() {
  chrome::ShowWarningMessageBoxAsync(gfx::NativeWindow(), u"Aux link routing paused",
      u"Startup links were not opened because their profile or routing rules "
      u"changed during startup. Check your routing settings and try again.");
}
}  // namespace
bool MarkColdStartupArguments(const base::CommandLine& command, StartupTabs* tabs) {
  if (command.GetArgs().empty() || command.GetArgs().size() != tabs->size()) return false;
  for (const auto& [name, value] : command.GetSwitches())
    if (name != "user-data-dir" && name != "profile-directory") return false;
  size_t index = 0;
  for (const auto& arg : command.GetArgs()) {
    const GURL url(arg);
    if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS() || (*tabs)[index++].url != url)
      return false;
  }
  for (auto& tab : *tabs) {
    tab.aux_native_external_receipt = true;
    tab.is_untrusted_launch = true;
  }
  return true;
}
StartupRoutingContinuation PrepareColdStartupRouting(Profile* profile, StartupTabs* tabs) {
  auto* local = g_browser_process ? g_browser_process->local_state() : nullptr;
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
      !local || !local->FindPreference(kRulesPref) || local->GetDict(kRulesPref).empty()) return {};
  bool handled = false;
  for (const auto& tab : *tabs) {
    if (!tab.aux_native_external_receipt) continue;
    auto result = Resolve(profile, {.url = tab.url, .authority = Authority::kExternal});
    handled |= result.FindBool("handled").value_or(true);
  }
  if (!handled) return {};
  StartupTabs external, retained;
  for (const auto& tab : *tabs)
    (tab.aux_native_external_receipt ? external : retained).push_back(tab);
  *tabs = std::move(retained);
  const auto admitted = aux::peer::InspectNativeBrowserShutdown();
  auto held_roots = aux::peer::CaptureActualChromiumBrowserRoots();
  const bool admitted_when_prepared = !profile->ShutdownStarted() &&
      !aux::IsProfileCookieRestorePending(profile) && held_roots &&
      held_roots->Revalidate() && admitted.admitted_generation &&
      !admitted.wrong_process && !admitted.admission_closed && !admitted.sequence_uncertain;
  // Snapshot before native restore/create; no raw profile or stack launcher
  // survives the continuation. Restore receives only its original native tabs.
  return base::BindOnce(
      [](base::WeakPtr<Profile> source, std::string epoch, uint64_t generation,
         std::shared_ptr<const aux::peer::BrowserPrivateRoots> roots,
         base::DictValue rules, StartupTabs pending, bool admitted_when_prepared,
         BrowserWindowInterface* browser, bool replace_placeholder) {
        auto* local = g_browser_process ? g_browser_process->local_state() : nullptr;
        const auto state = aux::peer::InspectNativeBrowserShutdown();
        if (!admitted_when_prepared || !source || source->ShutdownStarted() ||
            !browser || browser->GetProfile() != source.get() ||
            browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
            !roots || !roots->Revalidate() || !generation ||
            state.admitted_generation != generation || state.wrong_process ||
            state.admission_closed || state.sequence_uncertain ||
            aux::IsProfileCookieRestorePending(source.get()) ||
            aux::GetProfileCookieBindingEpoch(source.get()) != epoch ||
            !local || local->GetDict(kRulesPref) != rules) { RefuseStartup(); return; }
        auto target = browser->GetWeakPtr();
        auto first = std::make_shared<bool>(replace_placeholder);
        auto fallback = base::BindRepeating(
            [](base::WeakPtr<BrowserWindowInterface> target, std::shared_ptr<bool> first,
               const StartupTab& tab, Profile* selected) {
              if (!target || target->GetProfile() != selected) { RefuseStartup(); return; }
              auto* strip = target->GetTabStripModel();
              auto* active = strip->GetActiveWebContents();
              const bool replace = *first && strip->count() == 1 && active &&
                  (active->GetVisibleURL() == chrome::kChromeUINewTabURL ||
                   active->GetVisibleURL() == chrome::kChromeUINewTabPageURL);
              *first = false;
              base::CommandLine empty(base::CommandLine::NO_PROGRAM);
              StartupBrowserCreatorImpl launcher(base::FilePath(), empty,
                                                 chrome::startup::IsFirstRun::kNo);
              launcher.OpenTabsInBrowser(target.get(), chrome::startup::IsProcessStartup::kNo,
                  StartupTabs{tab}, replace ? StartupBrowserCreatorImpl::TabOverWrite::kYes
                                           : StartupBrowserCreatorImpl::TabOverWrite::kNo);
            }, target, first);
        auto current = base::BindRepeating(
            [](base::WeakPtr<BrowserWindowInterface> target) { return !!target; }, target);
        if (!MaybeRouteExternalTabs(source.get(), pending, std::move(fallback), {},
                                    std::move(current))) RefuseStartup();
      }, profile->GetWeakPtr(), aux::GetProfileCookieBindingEpoch(profile),
      aux::peer::InspectNativeBrowserShutdown().admitted_generation,
      std::move(held_roots), local->GetDict(kRulesPref).Clone(),
      std::move(external), admitted_when_prepared);
}
}  // namespace aux::routing

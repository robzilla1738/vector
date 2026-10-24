// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/routing/external_routing_ingress.h"
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/aux/routing/routing_service.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/simple_message_box.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
namespace aux::routing {
namespace {
bool Eligible(const StartupTab& tab) {
  return tab.aux_native_external_receipt && tab.url.SchemeIsHTTPOrHTTPS();
}
PrefService* Local() {
  return g_browser_process ? g_browser_process->local_state() : nullptr;
}
class ExternalBatch : public base::RefCounted<ExternalBatch> {
 public:
  ExternalBatch(Profile* profile, StartupTabs tabs, NativeTabFallback fallback,
                base::OnceClosure settled, base::RepeatingCallback<bool()> owner_current)
      : profile_(profile->GetWeakPtr()),
        epoch_(aux::GetProfileCookieBindingEpoch(profile)),
        roots_(aux::peer::CaptureActualChromiumBrowserRoots()),
        generation_(aux::peer::InspectNativeBrowserShutdown().admitted_generation),
        rules_(Local()->GetDict(kRulesPref).Clone()), tabs_(std::move(tabs)),
        fallback_(std::move(fallback)), settled_(std::move(settled)),
        owner_current_(std::move(owner_current)) {}
  void Start() { Next(); }
 private:
  friend class base::RefCounted<ExternalBatch>;
  ~ExternalBatch() = default;
  bool Current() const {
    const auto state = aux::peer::InspectNativeBrowserShutdown();
    return (!owner_current_ || owner_current_.Run()) &&
        profile_ && !profile_->ShutdownStarted() && profile_->IsRegularProfile() && !profile_->IsOffTheRecord() &&
        !aux::IsProfileCookieRestorePending(profile_.get()) && roots_ && roots_->Revalidate() &&
        generation_ && state.admitted_generation == generation_ &&
        !state.admission_closed && !state.wrong_process && !state.sequence_uncertain &&
        aux::GetProfileCookieBindingEpoch(profile_.get()) == epoch_ && Local() &&
        Local()->GetDict(kRulesPref) == rules_;
  }
  void Continue() {
    // Avoid recursion for long unmatched batches and for synchronous refusals.
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(&ExternalBatch::Next, base::RetainedRef(this)));
  }
  void Next() {
    if (index_ == tabs_.size()) { Finish(); return; }
    if (!Current()) {
      refused_ += tabs_.size() - index_;
      index_ = tabs_.size();
      Finish();
      return;
    }
    const auto& tab = tabs_[index_++];
    if (!Eligible(tab)) {
      NativeFallback(tab);
      Continue();
      return;
    }
    Intent intent{.url = tab.url, .authority = Authority::kExternal};
    // Open repeats resolution and checks native owner/rule epochs through every
    // asynchronous load. No route is inferred from a profile name or account.
    Open(profile_.get(), std::move(intent),
         base::BindOnce(&ExternalBatch::Opened, base::RetainedRef(this)));
  }
  void NativeFallback(const StartupTab& tab) {
    auto original = tab;
    original.aux_native_external_receipt = false;  // One-use native authority.
    fallback_.Run(original, profile_.get());
  }
  void Opened(base::DictValue result) {
    if (!Current()) {
      refused_ += 1 + tabs_.size() - index_;
      index_ = tabs_.size();
      Finish();
      return;
    }
    if (result.FindBool("ok").value_or(false) &&
        !result.FindBool("handled").value_or(true)) {
      NativeFallback(tabs_[index_ - 1]);
    } else if (!result.FindBool("ok").value_or(false)) {
      ++refused_;  // Deliberately consume; never fall back on matched refusal.
    }
    Continue();
  }
  void Finish() {
    if (refused_ == 0) {
      if (settled_) std::move(settled_).Run();
      return;
    }
    // One visible native warning for the batch, with no URL/query or account
    // details. Do not log URLs, and do not create a fallback browser/profile.
    chrome::ShowWarningMessageBoxAsync(
        gfx::NativeWindow(), u"Aux could not open a routed link",
        u"One or more links could not be opened because their routing profile "
        u"or Space is unavailable, or the profile changed while opening. "
        u"Check your link routing rules and try the links again.");
    if (settled_) std::move(settled_).Run();
  }
  base::WeakPtr<Profile> profile_;
  const std::string epoch_;
  const std::shared_ptr<const aux::peer::BrowserPrivateRoots> roots_;
  const uint64_t generation_;
  const base::DictValue rules_;
  const StartupTabs tabs_;
  NativeTabFallback fallback_;
  base::OnceClosure settled_;
  base::RepeatingCallback<bool()> owner_current_;
  size_t index_ = 0;
  size_t refused_ = 0;
};
}  // namespace
bool MaybeRouteExternalTabs(Profile* profile, const StartupTabs& tabs,
                            NativeTabFallback fallback, base::OnceClosure settled,
                            base::RepeatingCallback<bool()> owner_current) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
      !Local() || !Local()->FindPreference(kRulesPref) ||
      Local()->GetDict(kRulesPref).empty()) return false;
  bool handled = false;
  for (const auto& tab : tabs) {
    if (!Eligible(tab)) continue;
    const auto result = Resolve(profile, {.url = tab.url, .authority = Authority::kExternal});
    handled |= result.FindBool("handled").value_or(true);
  }
  if (!handled) return false;  // Original native batch is completely unchanged.
  base::MakeRefCounted<ExternalBatch>(profile, tabs, std::move(fallback),
      std::move(settled), std::move(owner_current))->Start();
  return true;
}
bool MaybeRouteExternalCommandLine(Profile* profile, const base::CommandLine& command,
                                   NativeCommandFallback fallback) {
  if (command.GetArgs().empty()) return false;
  for (const auto& [name, value] : command.GetSwitches()) {
    if (name != "profile-directory" && name != "user-data-dir") return false;
  }
  StartupTabs tabs;
  for (const auto& arg : command.GetArgs()) {
    GURL url(arg);  // Mac native argv is UTF-8. No search/fixup/scheme inference.
    if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS()) return false;
    tabs.emplace_back(url, true);
    tabs.back().aux_native_external_receipt = true;
  }
  return MaybeRouteExternalTabs(profile, tabs, base::BindRepeating(
      [](base::CommandLine original, NativeCommandFallback continuation,
         const StartupTab& tab, Profile* selected) {
        base::CommandLine single(original.GetProgram());
        for (const auto& [name, value] : original.GetSwitches())
          single.AppendSwitchNative(name, value);
        single.AppendArg(tab.url.spec());
        continuation.Run(single, selected);
      }, command, std::move(fallback)));
}
}  // namespace aux::routing

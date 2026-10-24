#import <AppKit/AppKit.h>
#import <LocalAuthentication/LocalAuthentication.h>
#include "AuxCliManualProfileApproval.h"
#include "chrome/browser/aux/cli/AuxCliIngress.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/profile_identity.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/sys_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "base/process/mac/aux_browser_descendant_cli_membership.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "content/public/browser/browser_thread.h"
#include "ui/base/base_window.h"
#include "ui/gfx/native_ui_types.h"
#include <signal.h>
#include <string>
#include <utility>
namespace aux::cli {
namespace {
constexpr auto kPromptLimit = base::Seconds(60);
constexpr auto kApprovalLifetime = base::Seconds(15);
// UI sequence only. A flood of authenticated CLI clients cannot stack prompts.
ManualProfileApprovalRequest* pending_request = nullptr;
struct ActualProfileBinding {
  base::WeakPtr<BrowserWindowInterface> browser;
  base::WeakPtr<Profile> profile;
  gfx::NativeWindow window;
  std::string profile_id, binding_epoch, restore_epoch;
  uint64_t admitted_generation = 0;
  bool Current(bool require_focus = true) const {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if (!browser || !profile || browser->GetProfile() != profile.get() ||
        !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
        !browser->GetWindow() ||
        browser->GetWindow()->GetNativeWindow() != window ||
        !window.GetNativeNSWindow() || ![window.GetNativeNSWindow() isVisible] ||
        (require_focus && (![window.GetNativeNSWindow() isKeyWindow] || !NSApp.active)) ||
        aux::GetProfileId(profile.get()) != profile_id ||
        aux::GetProfileCookieBindingEpoch(profile.get()) != binding_epoch ||
        aux::GetProfileCookieRestoreEpoch(profile.get()) != restore_epoch ||
        aux::IsProfileCookieRestorePending(profile.get())) return false;
    const auto admission = aux::peer::InspectNativeBrowserShutdown();
    return !admission.wrong_process && !admission.admission_closed &&
        !admission.sequence_uncertain && admitted_generation &&
        admission.admitted_generation == admitted_generation &&
        aux::peer::ReadNativeSelectedStateHome().route ==
            aux::peer::SelectedStateHomeRoute::current;
  }
};
}
struct ApprovedCliInvocation::State {
  ActualProfileBinding target;
  std::unique_ptr<Invocation> invocation;
  base::TimeTicks expires;
};
ApprovedCliInvocation::ApprovedCliInvocation(std::unique_ptr<State> state)
    : state_(std::move(state)) {}
ApprovedCliInvocation::~ApprovedCliInvocation() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  // This lease has not handed off to a child. An abandoned/expired approval
  // reports definite no-start rather than leaving the real terminal waiting.
  if (state_->invocation) state_->invocation->CompleteAfterObservedExit(78);
}
bool ApprovedCliInvocation::Current() const {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  return state_->invocation && base::TimeTicks::Now() < state_->expires &&
      state_->target.Current() && state_->invocation->Current() &&
      aux::browser_descendants::InspectActualCliClient(
          state_->invocation->KernelPeerForNativeAdmission()) !=
          aux::browser_descendants::CliClientMembership::managed;
}
Profile* ApprovedCliInvocation::RevalidatedNativeProfile() const {
  return Current() ? state_->target.profile.get() : nullptr;
}
std::unique_ptr<Invocation> ApprovedCliInvocation::ConsumeForNativeOpen(Profile* target) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!target || !Current() || state_->target.profile.get() != target) return {};
  return std::move(state_->invocation);
}
struct ManualProfileApprovalRequest::State {
  ActualProfileBinding target;
  std::unique_ptr<Invocation> invocation;
  Done done;
  LAContext* __strong context = nil;
  NSString* __strong reason = nil;
  base::OneShotTimer timeout;
  base::RepeatingTimer pending;
  bool finished = false;
  base::WeakPtrFactory<ManualProfileApprovalRequest> weak;
  explicit State(ManualProfileApprovalRequest* owner) : weak(owner) {}
};
ManualProfileApprovalRequest::ManualProfileApprovalRequest(std::unique_ptr<State> state)
    : state_(std::move(state)) {}
std::unique_ptr<ManualProfileApprovalRequest>
ManualProfileApprovalRequest::BeginForActualWindow(
    BrowserWindowInterface& browser, std::unique_ptr<Invocation> invocation,
    Done done) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto refuse = [&]() {
    if (invocation) invocation->CompleteAfterObservedExit(78);
    return std::unique_ptr<ManualProfileApprovalRequest>();
  };
  auto* profile = browser.GetProfile();
  if (pending_request || !invocation || !invocation->Current() || !done ||
      !profile || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
      !browser.GetWindow() || !g_browser_process ||
      !g_browser_process->profile_manager() ||
      aux::browser_descendants::InspectActualCliClient(
          invocation->KernelPeerForNativeAdmission()) ==
          aux::browser_descendants::CliClientMembership::managed) return refuse();
  auto* attributes = g_browser_process->profile_manager()
      ->GetProfileAttributesStorage().GetProfileAttributesWithPath(profile->GetPath());
  if (!attributes || attributes->GetName().empty()) return refuse();
  const auto admission = aux::peer::InspectNativeBrowserShutdown();
  ActualProfileBinding binding;
  binding.browser = browser.GetWeakPtr();
  binding.profile = profile->GetWeakPtr();
  binding.window = browser.GetWindow()->GetNativeWindow();
  binding.profile_id = aux::GetProfileId(profile);
  binding.binding_epoch = aux::GetProfileCookieBindingEpoch(profile);
  binding.restore_epoch = aux::GetProfileCookieRestoreEpoch(profile);
  binding.admitted_generation = admission.admitted_generation;
  if (binding.profile_id.empty() || binding.binding_epoch.empty() ||
      binding.restore_epoch.empty() || !binding.Current()) return refuse();
  // Capture the displayed name only from this actual loaded registered Profile.
  // Never include argv, tokens, URLs, environment or caller-supplied text.
  NSString* name = base::SysUTF16ToNSString(attributes->GetName());
  auto request = std::unique_ptr<ManualProfileApprovalRequest>(
      new ManualProfileApprovalRequest(nullptr));
  request->state_ = std::make_unique<State>(request.get());
  request->state_->target = std::move(binding);
  request->state_->invocation = std::move(invocation);
  request->state_->done = std::move(done);
  request->state_->reason = [NSString stringWithFormat:
      @"allow this Aux command-line request to use the browser profile “%@”", name];
  pending_request = request.get();
  request->BeginActualAuthentication();
  return request;
}
void ManualProfileApprovalRequest::BeginActualAuthentication() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto& s = *state_;
  s.context = [[LAContext alloc] init];
  s.context.touchIDAuthenticationAllowableReuseDuration = 0;
  s.context.localizedCancelTitle = @"Cancel";
  // Follow Chromium's TouchIdContext ownership pattern: the OS reply is on a
  // private queue; all weak Profile/window/epoch access returns to the UI.
  const auto ui = base::SingleThreadTaskRunner::GetCurrentDefault();
  const auto weak = s.weak.GetWeakPtr();
  s.timeout.Start(FROM_HERE, kPromptLimit,
      base::BindOnce(&ManualProfileApprovalRequest::Cancel, weak));
  s.pending.Start(FROM_HERE, base::Milliseconds(100),
      base::BindRepeating(&ManualProfileApprovalRequest::PollPendingInvocation, weak));
  [s.context evaluatePolicy:LAPolicyDeviceOwnerAuthentication
           localizedReason:s.reason
                     reply:^(BOOL success, NSError* error) {
    ui->PostTask(FROM_HERE,
        base::BindOnce(&ManualProfileApprovalRequest::AuthenticationReplied,
                       weak, success == YES && error == nil));
  }];
}
void ManualProfileApprovalRequest::PollPendingInvocation() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto& s = *state_;
  if (s.finished) return;
  if (!s.invocation || !s.invocation->Current() || !s.target.Current(false)) {
    Cancel(); return;
  }
  const int signal = s.invocation->PollSignal(0);
  if (signal == SIGINT || signal == SIGTERM || signal == SIGHUP) Cancel();
}
void ManualProfileApprovalRequest::AuthenticationReplied(bool actual_os_success) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto& s = *state_;
  if (s.finished) return;
  const bool admitted = actual_os_success && pending_request == this &&
      s.target.Current() && s.invocation && s.invocation->Current() &&
      aux::browser_descendants::InspectActualCliClient(
          s.invocation->KernelPeerForNativeAdmission()) !=
          aux::browser_descendants::CliClientMembership::managed;
  s.finished = true;
  s.timeout.Stop();
  s.pending.Stop();
  s.weak.InvalidateWeakPtrs();
  [s.context invalidate];
  if (pending_request == this) pending_request = nullptr;
  auto done = std::move(s.done);
  if (!admitted) { s.invocation->CompleteAfterObservedExit(78); std::move(done).Run({}); return; }
  auto approval = std::make_unique<ApprovedCliInvocation::State>();
  approval->target = std::move(s.target);
  approval->invocation = std::move(s.invocation);
  approval->expires = base::TimeTicks::Now() + kApprovalLifetime;
  auto grant = std::unique_ptr<ApprovedCliInvocation>(
      new ApprovedCliInvocation(std::move(approval)));
  std::move(done).Run(std::move(grant));
}
void ManualProfileApprovalRequest::Cancel() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!state_ || state_->finished) return;
  state_->finished = true;
  state_->timeout.Stop();
  state_->pending.Stop();
  state_->weak.InvalidateWeakPtrs();
  [state_->context invalidate];
  if (pending_request == this) pending_request = nullptr;
  if (state_->invocation) state_->invocation->CompleteAfterObservedExit(130);
  auto done = std::move(state_->done);
  if (done) std::move(done).Run({});
}
ManualProfileApprovalRequest::~ManualProfileApprovalRequest() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!state_) return;
  state_->finished = true;
  if (state_->invocation) state_->invocation->CompleteAfterObservedExit(78);
  state_->weak.InvalidateWeakPtrs();
  [state_->context invalidate];
  if (pending_request == this) pending_request = nullptr;
}
}

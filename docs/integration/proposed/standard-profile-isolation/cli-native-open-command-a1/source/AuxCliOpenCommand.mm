#import <AppKit/AppKit.h>
#include "AuxCliOpenCommand.h"
#include "AuxCliOpenArguments.h"
#include "AuxCliManualProfileApproval.h"
#include "chrome/browser/aux/cli/AuxCliIngress.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/profile_identity.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/threading/thread.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/keep_alive/profile_keep_alive_types.h"
#include "chrome/browser/profiles/keep_alive/scoped_profile_keep_alive.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/base_window.h"
#include "ui/base/window_open_disposition.h"
#include "ui/base/page_transition_types.h"
#include "url/gurl.h"
#include "ui/gfx/native_ui_types.h"
#include <signal.h>
#include <unistd.h>
#include <atomic>
#include <map>
#include <memory>
#include <set>
#include <utility>
namespace aux::cli {
class NativeOpenOperation;
namespace {
const pid_t kProcess = getpid();
constexpr size_t kPendingLimit = 64;
std::map<NativeOpenOperation*,std::shared_ptr<NativeOpenOperation>>& Pending(){
  static auto* pending = new std::map<NativeOpenOperation*,std::shared_ptr<NativeOpenOperation>>;
  return *pending;
}
bool admission_closed = true;  // Actual admission mutation stays on UI.
struct OpenCounters {
  std::atomic_bool started{false},closed{true},receiver_running{false};
  std::atomic_uint64_t queued{0},profile_operations{0};
};
OpenCounters& Counters(){static auto* counters=new OpenCounters;return *counters;}
bool ActualNativeReady(){
  const auto state=aux::peer::InspectNativeBrowserShutdown();
  return getpid()==kProcess && !state.wrong_process && !state.admission_closed &&
      !state.sequence_uncertain && state.admitted_generation &&
      aux::peer::ReadNativeSelectedStateHome().route==aux::peer::SelectedStateHomeRoute::current;
}
bool UsableWindow(BrowserWindowInterface* window){
  return window && window->GetType()==BrowserWindowInterface::TYPE_NORMAL &&
      window->GetProfile() && window->GetProfile()->IsRegularProfile() &&
      !window->GetProfile()->IsOffTheRecord() && window->GetWindow() &&
      window->GetWindow()->IsVisible();
}
base::WeakPtr<BrowserWindowInterface> SelectActualWindow(const std::string& selector){
  auto* collection=GlobalBrowserCollection::GetInstance();
  if(!collection || !g_browser_process || !g_browser_process->profile_manager())return{};
  if(selector.empty()){
    auto* active=collection->GetActiveBrowser();
    return UsableWindow(active)?active->GetWeakPtr():base::WeakPtr<BrowserWindowInterface>();
  }
  auto& attributes=g_browser_process->profile_manager()->GetProfileAttributesStorage();
  std::map<Profile*,base::WeakPtr<BrowserWindowInterface>> ids,names;
  // Creation order only chooses among windows of the SAME native Profile.
  // Multiple distinct matching Profiles always refuse, never first-match fallthrough.
  collection->ForEach([&](BrowserWindowInterface* window){
    if(!UsableWindow(window))return true;
    auto* profile=window->GetProfile();
    auto* entry=attributes.GetProfileAttributesWithPath(profile->GetPath());
    if(!entry)return true;
    if(aux::GetProfileId(profile)==selector)ids.try_emplace(profile,window->GetWeakPtr());
    if(base::UTF16ToUTF8(entry->GetName())==selector)names.try_emplace(profile,window->GetWeakPtr());
    return true;
  },BrowserCollection::Order::kCreation);
  if(!ids.empty())return ids.size()==1?ids.begin()->second:base::WeakPtr<BrowserWindowInterface>();
  return names.size()==1?names.begin()->second:base::WeakPtr<BrowserWindowInterface>();
}
}
class NativeOpenOperation final : public std::enable_shared_from_this<NativeOpenOperation> {
 public:
  static void Begin(std::unique_ptr<Invocation> invocation){
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if(!invocation)return;
    const auto arguments=ParseNativeOpenArguments(invocation->arguments().argv);
    const GURL url(arguments.url);
    if(admission_closed || !ActualNativeReady() || Pending().size()>=kPendingLimit ||
       arguments.status!=OpenParseStatus::accepted || !url.is_valid() ||
       !url.SchemeIsHTTPOrHTTPS() || url.has_username() || url.has_password()){
      invocation->CompleteAfterNativeOpenResult(64);return;
    }
    auto window=SelectActualWindow(arguments.profile);
    if(!window || !invocation->Current()){
      invocation->CompleteAfterNativeOpenResult(78);return;
    }
    auto operation=std::shared_ptr<NativeOpenOperation>(new NativeOpenOperation(std::move(invocation),window,url));
    if(!operation->TargetCurrent()){
      operation->invocation_->CompleteAfterNativeOpenResult(78);return;
    }
    // Register the exact native Profile BEFORE activation, permission callback,
    // or navigation. The three native switch/restore gates consult this record.
    Pending().emplace(operation.get(),operation);
    Counters().profile_operations.fetch_add(1);
    operation->focus_deadline_=base::TimeTicks::Now()+base::Seconds(3);
    window->GetWindow()->Activate();
    operation->focus_.Start(FROM_HERE,base::Milliseconds(50),
        base::BindRepeating([](std::weak_ptr<NativeOpenOperation> weak){
          if(auto operation=weak.lock())operation->FocusThenApprove();
        },std::weak_ptr<NativeOpenOperation>(operation)));
    operation->FocusThenApprove();
  }
  Profile* profile()const{return profile_.get();}
  void Cancel(int code=130){
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if(phase_==Phase::finished)return;
    if(phase_==Phase::navigating){canceled_during_navigation_=true;return;}
    Finish(code);
  }
 private:
  enum class Phase{focusing,approving,navigating,finished};
  NativeOpenOperation(std::unique_ptr<Invocation> invocation,
      base::WeakPtr<BrowserWindowInterface> window,GURL url)
      :invocation_(std::move(invocation)),window_(window),profile_(window->GetProfile()->GetWeakPtr()),url_(std::move(url)),
       profile_id_(aux::GetProfileId(profile_.get())),
       binding_epoch_(aux::GetProfileCookieBindingEpoch(profile_.get())),
       restore_epoch_(aux::GetProfileCookieRestoreEpoch(profile_.get())),
       generation_(aux::peer::InspectNativeBrowserShutdown().admitted_generation){}
  bool TargetCurrent()const{
    return !admission_closed && ActualNativeReady() && window_ && profile_ &&
        window_->GetProfile()==profile_.get() && UsableWindow(window_.get()) &&
        !profile_id_.empty() && !binding_epoch_.empty() && !restore_epoch_.empty() &&
        aux::GetProfileId(profile_.get())==profile_id_ &&
        aux::GetProfileCookieBindingEpoch(profile_.get())==binding_epoch_ &&
        aux::GetProfileCookieRestoreEpoch(profile_.get())==restore_epoch_ &&
        !aux::IsProfileCookieRestorePending(profile_.get()) &&
        aux::peer::InspectNativeBrowserShutdown().admitted_generation==generation_;
  }
  void FocusThenApprove(){
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    auto keep=shared_from_this();
    if(phase_!=Phase::focusing)return;
    if(!TargetCurrent() || !invocation_ || !invocation_->Current() ||
       base::TimeTicks::Now()>=focus_deadline_){Finish(78);return;}
    const int signal=invocation_->PollSignal(0);
    if(signal==SIGINT || signal==SIGTERM || signal==SIGHUP){Finish(130);return;}
    auto* native=window_->GetWindow()->GetNativeWindow().GetNativeNSWindow();
    if(!native || ![native isKeyWindow] || !NSApp.active)return;
    focus_.Stop();phase_=Phase::approving;
    request_=ManualProfileApprovalRequest::BeginForActualWindow(*window_,std::move(invocation_),
        base::BindOnce([](std::weak_ptr<NativeOpenOperation> weak,std::unique_ptr<ApprovedCliInvocation> approval){
          if(auto operation=weak.lock())operation->Approved(std::move(approval));
        },std::weak_ptr<NativeOpenOperation>(keep)));
    if(!request_)Finish(78);
  }
  void Approved(std::unique_ptr<ApprovedCliInvocation> approval){
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    auto keep=shared_from_this();
    if(phase_!=Phase::approving)return;
    if(!approval || !TargetCurrent() || approval->RevalidatedNativeProfile()!=profile_.get()){
      Finish(78);return;
    }
    auto retained_profile=ScopedProfileKeepAlive::TryAcquire(profile_.get(),ProfileKeepAliveOrigin::kBrowserWindow);
    if(!retained_profile){Finish(78);return;}
    invocation_=approval->ConsumeForNativeOpen(profile_.get());
    if(!invocation_ || !invocation_->Current() || !TargetCurrent()){Finish(78);return;}
    // The 15-second OS approval is now consumed. It is never used as a timer
    // for active navigation ownership, cancellation or lifecycle settlement.
    approval.reset();request_.reset();phase_=Phase::navigating;
    NavigateParams params(window_.get(),url_,ui::PAGE_TRANSITION_TYPED);
    params.disposition=WindowOpenDisposition::NEW_FOREGROUND_TAB;
    params.should_trigger_session_restore=false;
    auto navigation=Navigate(&params);
    bool started=false;
    // Navigate has returned to the same UI sequence. A live handle plus actual
    // parented WebContents proves native start/handoff, not network/page success.
    if(navigation && TargetCurrent() && params.browser==window_.get()){
      auto* contents=navigation->GetWebContents();
      started=contents && contents==params.navigated_or_inserted_contents &&
          contents->GetBrowserContext()==profile_.get() &&
          window_->GetTabStripModel()->GetIndexOfWebContents(contents)!=TabStripModel::kNoTab;
    }
    const int result=started&&!canceled_during_navigation_?0:75;
    Finish(result);
  }
  void Finish(int code){
    auto keep=shared_from_this();
    if(phase_==Phase::finished)return;
    phase_=Phase::finished;focus_.Stop();
    if(request_)request_->Cancel();
    request_.reset();
    if(invocation_)invocation_->CompleteAfterNativeOpenResult(code);
    invocation_.reset();
    if(Pending().erase(this)==1)Counters().profile_operations.fetch_sub(1);
  }
  std::unique_ptr<Invocation> invocation_;
  base::WeakPtr<BrowserWindowInterface> window_;
  base::WeakPtr<Profile> profile_;
  const GURL url_;
  const std::string profile_id_,binding_epoch_,restore_epoch_;
  const uint64_t generation_;
  Phase phase_=Phase::focusing;
  bool canceled_during_navigation_=false;
  base::TimeTicks focus_deadline_;
  base::RepeatingTimer focus_;
  std::unique_ptr<ManualProfileApprovalRequest> request_;
};
class NativeOpenService final : public std::enable_shared_from_this<NativeOpenService> {
 public:
  NativeOpenService():receiver_("Aux native CLI open"){}
  bool Start(){
    ui_=base::SingleThreadTaskRunner::GetCurrentDefault();ingress_=Ingress::CreateForActualBrowser();
    if(!ingress_ || !receiver_.Start()){closing_.store(true);return false;}
    running_.store(true);Counters().receiver_running.store(true);auto self=shared_from_this();
    if(!receiver_.task_runner()->PostTask(FROM_HERE,base::BindOnce(&NativeOpenService::ReceiveNext,self))){
      closing_.store(true);ingress_->CloseAdmission();receiver_.Stop();running_.store(false);Counters().receiver_running.store(false);return false;
    }
    return true;
  }
  void Close(){
    if(closing_.exchange(true))return;
    ingress_->CloseAdmission();receiver_.Stop();running_.store(false);Counters().receiver_running.store(false);
  }
 private:
  void ReceiveNext(){
    if(closing_.load())return;
    auto invocation=ingress_->ReceiveOne(250);
    if(invocation){
      if(closing_.load() || queued_.load()>=kPendingLimit)invocation->CompleteAfterNativeOpenResult(78);
      else{
        queued_.fetch_add(1);Counters().queued.fetch_add(1);auto self=shared_from_this();
        // A shared native receiver state survives a shutdown until every
        // actually posted UI request reports no-start or hands off natively.
        auto delivery=std::make_shared<std::unique_ptr<Invocation>>(std::move(invocation));
        if(!ui_->PostTask(FROM_HERE,base::BindOnce([](std::shared_ptr<NativeOpenService> service,
            std::shared_ptr<std::unique_ptr<Invocation>> actual){
          service->queued_.fetch_sub(1);Counters().queued.fetch_sub(1);
          if(service->closing_.load()){
            if(*actual)(*actual)->CompleteAfterNativeOpenResult(78);
          }else NativeOpenOperation::Begin(std::move(*actual));
        },self,delivery))){
          queued_.fetch_sub(1);Counters().queued.fetch_sub(1);if(*delivery)(*delivery)->CompleteAfterNativeOpenResult(78);
        }
      }
    }
    if(!closing_.load())receiver_.task_runner()->PostTask(FROM_HERE,
        base::BindOnce(&NativeOpenService::ReceiveNext,shared_from_this()));
  }
  std::unique_ptr<Ingress> ingress_;
  base::Thread receiver_;
  scoped_refptr<base::SingleThreadTaskRunner> ui_;
  std::atomic_bool closing_{false},running_{false};
  std::atomic_uint64_t queued_{0};
};
namespace {std::shared_ptr<NativeOpenService> service;bool start_attempted=false;}
bool StartNativeOpenServiceAtActualBrowserStartup(){
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if(getpid()!=kProcess || start_attempted || !ActualNativeReady())return false;
  start_attempted=true;Counters().started.store(true);service=std::make_shared<NativeOpenService>();
  if(!service->Start())return false;
  admission_closed=false;Counters().closed.store(false);return true;
}
void CloseNativeOpenServiceAdmission(){
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if(getpid()!=kProcess)return;
  admission_closed=true;Counters().closed.store(true);if(service)service->Close();
  // Cancellation can reenter this map through the actual OS reply callback.
  auto actual=Pending();for(auto& [identity,operation]:actual)operation->Cancel(78);
}
NativeOpenObservation InspectNativeOpenService(){
  if(getpid()!=kProcess){NativeOpenObservation invalid;invalid.wrong_process=true;return invalid;}
  auto& actual=Counters();
  return{actual.started.load(),actual.closed.load(),actual.receiver_running.load(),false,
         actual.queued.load(),actual.profile_operations.load()};
}
bool IsNativeCliOpenPendingForProfile(Profile* profile){
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if(getpid()!=kProcess || !profile)return true;
  for(const auto& [identity,operation]:Pending())if(operation->profile()==profile)return true;
  return false;
}
}

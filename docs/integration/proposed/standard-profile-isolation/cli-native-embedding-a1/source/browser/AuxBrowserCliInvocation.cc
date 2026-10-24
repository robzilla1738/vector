#include "AuxBrowserCliInvocation.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "base/command_line.h"
#include "base/process/mac/aux_browser_descendant_engine.h"
#include "base/files/file_path.h"
#include "base/process/launch.h"
#include <sys/wait.h>
#include <unistd.h>
#include <signal.h>
#include <utility>
namespace aux::cli {
BrowserInvocation::BrowserInvocation(std::unique_ptr<Invocation> invocation,std::unique_ptr<aux::peer::OwnedNativePeerChild> child):invocation_(std::move(invocation)),child_(std::move(child)){}
BrowserInvocation::~BrowserInvocation()=default;
std::unique_ptr<BrowserInvocation> BrowserInvocation::PrepareAndLaunch(std::unique_ptr<Invocation> invocation){
 const auto admission=aux::peer::InspectNativeBrowserShutdown();
 if(!invocation||!invocation->Current()||admission.wrong_process||admission.admission_closed||!admission.admitted_generation||aux::peer::ReadNativeSelectedStateHome().route!=aux::peer::SelectedStateHomeRoute::current)return{};
 // Code identity authenticates the client but does not authorize a new target.
 // No enum case currently proves a manual, unowned native Profile selection.
 // Keep both Aux-managed clients and ambiguous lineages refused until the real
 // profile/task registry and retained daemon gateway provide that capability.
 switch(aux::browser_descendants::InspectActualCliClient(invocation->KernelPeerForNativeAdmission())){
  case aux::browser_descendants::CliClientMembership::managed:return{};
  case aux::browser_descendants::CliClientMembership::unknown:return{};
 }
 const auto images=SealedImages::ForCurrentBrowser();if(!images||!images->ValidateCliLaunchResources())return{};
 auto policy=aux::peer::ExactCodePolicy::CopyNativePolicy(images->cli_requirement(),images->cli_hash());if(!policy)return{};
 base::CommandLine command(base::FilePath(images->cli_executable()));
 for(const auto& argument:invocation->arguments().argv)command.AppendArgNative(argument);
 base::LaunchOptions options;options.clear_environment=true;options.new_process_group=true;
 for(const auto& [name,value]:invocation->arguments().environment){if(!IsCliEnvironmentName(name))return{};options.environment[name]=value;}
 if(!options.environment.contains("PATH"))options.environment["PATH"]="/usr/bin:/bin:/usr/sbin:/sbin";
 options.current_directory_fd=invocation->directory();
 options.fds_to_remap={{invocation->input(),STDIN_FILENO},{invocation->output(),STDOUT_FILENO},{invocation->error(),STDERR_FILENO}};
 // Existing native producer captures actual Chromium roots and reserves its
 // real browser descendant ticket before this exact child's physical spawn.
 auto child=aux::peer::OwnedNativePeerChild::PrepareBeforeSpawn(std::move(command),std::move(options),std::move(policy));
 if(!child||!invocation->Current()||!images->RevalidateSelf()||aux::peer::ReadNativeSelectedStateHome().route!=aux::peer::SelectedStateHomeRoute::current)return{};
 // A failed bind may already have created a child. Retain it through Advance;
 // never send a synthetic failure completion or discard it on that Boolean.
 child->LaunchOnce();
 return std::unique_ptr<BrowserInvocation>(new BrowserInvocation(std::move(invocation),std::move(child)));
}
std::optional<int> BrowserInvocation::Advance(){
 if(completed_)return{};
 if(!client_retired_&&!invocation_->Current()){client_retired_=true;child_->SignalOwnedProcessGroup(SIGTERM);}
 const auto signal=invocation_->PollSignal(0);if(signal)child_->SignalOwnedProcessGroup(signal);
 child_->ServicePeerOnce(25);
 const auto observation=child_->ObserveAndReapExitedChild();
 if(observation.wrong_process||observation.exit_ownership_unknown)return{};
 if(observation.launch_failed||(!observation.launch_attempted&&observation.child_pid<0)){completed_=true;invocation_->CompleteAfterObservedExit(78);return 78;}
 if(!observation.exit_observed_and_reaped)return{};
 int code=78;if(WIFEXITED(observation.wait_status))code=WEXITSTATUS(observation.wait_status);else if(WIFSIGNALED(observation.wait_status))code=128+WTERMSIG(observation.wait_status);
 completed_=true;invocation_->CompleteAfterObservedExit(code);return code;
}
}

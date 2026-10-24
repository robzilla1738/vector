#include "AuxRetainedCliInvocation.h"
#include <CommonCrypto/CommonDigest.h>
#include <bsm/libbsm.h>
#include <unistd.h>
#include <cstring>
#include <mutex>
#include <vector>
#include <algorithm>
#include <limits>
extern "C" int32_t AuxRetainNativeParentConnection(uint64_t);
extern "C" void AuxReleaseNativeParentConnection(uint64_t);
extern "C" int32_t AuxRevalidateNativeParentConnection(uint64_t,uint32_t);
extern "C" int32_t AuxRetainPreparedFreshRuntimeProvider(uint64_t);
extern "C" void AuxReleasePreparedFreshRuntimeProvider(uint64_t);
extern "C" int32_t AuxCreatePreparedFreshRuntimeOwner(uint64_t,uint64_t*,void**);
extern "C" void AuxReleaseSignedDevelopmentOwner(void*);
extern "C" int32_t AuxNativeContextValidateCurrentAuthority(uint64_t);
extern "C" int32_t AuxNativeContextCopyStorageRoots(uint64_t,uint64_t*,int32_t*,int32_t*);
extern "C" char* AuxNativeContextRun(uint64_t,const uint8_t*,size_t,const uint8_t*,size_t);
extern "C" void AuxNativeResultFree(char*);
extern "C" int32_t AuxNativeContextRetire(uint64_t);
extern "C" int32_t AuxCloseDevelopmentOwnerOSAdmission(void*);
extern "C" int32_t AuxDevelopmentOwnerCleanSettlementStatus(void*);
namespace aux::cli {
namespace {
const pid_t kBackendProcess=getpid();
constexpr size_t kReplyLimit=32*1024*1024;
using Digest=std::array<uint8_t,32>;
Digest RequestDigest(std::string_view command,std::string_view input){
 CC_SHA256_CTX hash;CC_SHA256_Init(&hash);uint32_t size=command.size();std::array<uint8_t,4> prefix{static_cast<uint8_t>(size>>24),static_cast<uint8_t>(size>>16),static_cast<uint8_t>(size>>8),static_cast<uint8_t>(size)};
 CC_SHA256_Update(&hash,prefix.data(),prefix.size());CC_SHA256_Update(&hash,command.data(),command.size());CC_SHA256_Update(&hash,input.data(),input.size());Digest digest{};CC_SHA256_Final(digest.data(),&hash);return digest;
}
struct QuarantinedOwner{uint64_t parent=0,provider=0,handle=0;void* retained=nullptr;bool untracked=false;std::vector<uint8_t> reply;};
std::mutex& QuarantineMutex(){static auto* mutex=new std::mutex;return *mutex;}
std::vector<std::unique_ptr<QuarantinedOwner>>& Quarantine(){static auto* owners=new std::vector<std::unique_ptr<QuarantinedOwner>>;return *owners;}
void Wipe(std::vector<uint8_t>& bytes){if(!bytes.empty())memset_s(bytes.data(),bytes.size(),0,bytes.size());bytes.clear();}
}
struct RetainedInvocation::State {
 const pid_t process=getpid();std::mutex mutex;std::shared_ptr<const SealedImages> images;
 uint64_t parent=0,provider=0,handle=0;void* retained=nullptr;PeerBirth browser,cli;audit_token_t browser_token{},cli_token{};Nonce invocation{};
 bool closing=false,retiring=false,command_active=false,closed=false,unknown=false,retirement_unknown=false;size_t active=0;uint64_t sequence=0,retired_through=0;Digest request{};
 std::vector<uint8_t> response;bool completed=false;
 struct Lease {
  State* state=nullptr;
  explicit Lease(State& s){if(getpid()!=s.process)return;std::lock_guard<std::mutex> lock(s.mutex);if(s.closing||s.closed||!s.handle||s.active==std::numeric_limits<size_t>::max())return;s.active++;state=&s;}
  Lease(const Lease&)=delete;Lease&operator=(const Lease&)=delete;
  ~Lease(){if(state){std::lock_guard<std::mutex> lock(state->mutex);state->active--;}}
  explicit operator bool()const{return state!=nullptr;}
  bool Check()const{
   if(!state)return false;auto& s=*state;
   {std::lock_guard<std::mutex> lock(s.mutex);if(s.closing||s.closed)return false;}
   const bool valid=s.images->SameBrowser(s.browser_token,s.browser)&&audit_token_to_pid(s.browser_token)==getppid()&&s.images->SameCli(s.cli_token,s.cli)&&AuxRevalidateNativeParentConnection(s.parent,2000)==0&&AuxNativeContextValidateCurrentAuthority(s.handle)==0;
   std::lock_guard<std::mutex> lock(s.mutex);return valid&&!s.closing&&!s.closed;
  }
 };
};
RetainedInvocation::RetainedInvocation(std::unique_ptr<State> state):state_(std::move(state)){}
std::shared_ptr<RetainedInvocation> RetainedInvocation::FromAuthenticatedBrowser(uint64_t parent,uint64_t provider,audit_token_t browser,audit_token_t cli,Nonce nonce){
 if(!parent||!provider||std::all_of(nonce.begin(),nonce.end(),[](auto b){return b==0;}))return{};
 auto state=std::make_unique<State>();state->images=SealedImages::ForCurrentDaemon();state->browser_token=browser;state->cli_token=cli;state->invocation=nonce;
 if(!state->images||audit_token_to_pid(browser)!=getppid()||!state->images->CaptureBrowser(browser,&state->browser)||!state->images->CaptureCli(cli,&state->cli)||AuxRevalidateNativeParentConnection(parent,2000)!=0)return{};
 if(AuxRetainNativeParentConnection(parent)!=0)return{};state->parent=parent;
 if(AuxRetainPreparedFreshRuntimeProvider(provider)!=0){AuxReleaseNativeParentConnection(parent);return{};}state->provider=provider;
 // This factory imports the actual existing prepared target. It never acquires
 // another installer flock, reserves a fresh home or regenerates credentials.
 if(AuxCreatePreparedFreshRuntimeOwner(provider,&state->handle,&state->retained)!=0||!state->handle||!state->retained){if(state->handle||state->retained){auto held=std::make_unique<QuarantinedOwner>();held->parent=parent;held->provider=provider;held->handle=state->handle;held->retained=state->retained;held->untracked=true;std::lock_guard<std::mutex> lock(QuarantineMutex());Quarantine().push_back(std::move(held));return{};}AuxReleasePreparedFreshRuntimeProvider(provider);AuxReleaseNativeParentConnection(parent);return{};}
 auto result=std::shared_ptr<RetainedInvocation>(new RetainedInvocation(std::move(state)));
 if(!result->Current()){result->Close();return{};}return result;
}
bool RetainedInvocation::Current(){State::Lease lease(*state_);return lease&&lease.Check();}
NativeReply RetainedInvocation::Run(audit_token_t browser_request,uint64_t sequence,std::string_view command,std::string_view input){
 auto& s=*state_;State::Lease lease(s);if(!lease||!sequence||command.empty()||command.size()>128||input.size()>16384||command.find('\0')!=std::string_view::npos||input.find('\0')!=std::string_view::npos||!lease.Check()||!s.images->SameBrowser(browser_request,s.browser))return{};
 const auto digest=RequestDigest(command,input);
 {std::lock_guard<std::mutex> lock(s.mutex);if(s.closing||sequence<=s.retired_through)return{};
  if(s.sequence){if(s.sequence!=sequence||s.request!=digest)return{};if(s.unknown)return{NativeReplyStatus::unknown,{}};if(s.command_active)return{NativeReplyStatus::pending,{}};if(s.completed)return{NativeReplyStatus::completed,s.response};return{};}
  s.sequence=sequence;s.request=digest;s.command_active=true;
 }
 char* actual=AuxNativeContextRun(s.handle,reinterpret_cast<const uint8_t*>(command.data()),command.size(),reinterpret_cast<const uint8_t*>(input.data()),input.size());
 std::vector<uint8_t> bytes;bool known=false;
 if(actual){const auto length=strnlen(actual,kReplyLimit+1);if(length<=kReplyLimit){bytes.assign(reinterpret_cast<uint8_t*>(actual),reinterpret_cast<uint8_t*>(actual)+length);known=true;}AuxNativeResultFree(actual);}
 const bool current=lease.Check();
 std::lock_guard<std::mutex> lock(s.mutex);s.command_active=false;s.completed=known;s.unknown=!known;
 if(known)s.response=std::move(bytes);
 // Retain the exact reply even if its final guard/connection is lost. Do not
 // rerun a command or serialize success from an unvalidated/lost publication.
 if(!current||s.closing||!known)return{NativeReplyStatus::unknown,{}};
 return{NativeReplyStatus::completed,s.response};
}
bool RetainedInvocation::Acknowledge(audit_token_t browser_request,uint64_t sequence){
 auto& s=*state_;State::Lease lease(s);if(!lease||!lease.Check()||!s.images->SameBrowser(browser_request,s.browser))return false;std::lock_guard<std::mutex> lock(s.mutex);
 if(s.closing||s.command_active||!s.completed||sequence!=s.sequence||s.unknown)return false;
 Wipe(s.response);s.retired_through=s.sequence;s.sequence=0;s.completed=false;return true;
}
std::optional<NativeRootPair> RetainedInvocation::CopyCurrentRoots(audit_token_t browser_request){
 auto& s=*state_;State::Lease lease(s);if(!lease||!lease.Check()||!s.images->SameBrowser(browser_request,s.browser))return{};NativeRootPair roots;
 if(AuxNativeContextCopyStorageRoots(s.handle,&roots.generation,&roots.control,&roots.task)!=0||!roots.generation||roots.control<0||roots.task<0||!lease.Check()){
  if(roots.control>=0)close(roots.control);if(roots.task>=0&&roots.task!=roots.control)close(roots.task);return{};
 }
 return roots;
}
NativeReplyStatus RetainedInvocation::Close(){
 auto& s=*state_;if(getpid()!=s.process)return NativeReplyStatus::unknown;
 {std::lock_guard<std::mutex> lock(s.mutex);s.closing=true;if(s.closed)return NativeReplyStatus::completed;if(s.active||s.retiring)return NativeReplyStatus::pending;s.retiring=true;}
 const auto retired=AuxNativeContextRetire(s.handle),os=AuxCloseDevelopmentOwnerOSAdmission(s.retained),settled=AuxDevelopmentOwnerCleanSettlementStatus(s.retained);
 if(retired==-3||retired==-4||os==2||settled==2){std::lock_guard<std::mutex> lock(s.mutex);s.retiring=false;s.retirement_unknown=true;return NativeReplyStatus::unknown;}
 if((retired!=0&&retired!=-1)||os!=0||settled!=0){std::lock_guard<std::mutex> lock(s.mutex);s.retiring=false;return NativeReplyStatus::pending;}
 void* release=nullptr;uint64_t provider=0,parent=0;
 {std::lock_guard<std::mutex> lock(s.mutex);if(s.retirement_unknown){s.retiring=false;return NativeReplyStatus::unknown;}}
 {std::lock_guard<std::mutex> lock(s.mutex);if(s.closed)return NativeReplyStatus::completed;s.retiring=false;s.closed=true;release=s.retained;s.retained=nullptr;provider=s.provider;s.provider=0;parent=s.parent;s.parent=0;Wipe(s.response);}
 AuxReleaseSignedDevelopmentOwner(release);AuxReleasePreparedFreshRuntimeProvider(provider);AuxReleaseNativeParentConnection(parent);return NativeReplyStatus::completed;
}
RetainedInvocation::~RetainedInvocation(){
 if(getpid()!=state_->process)return;
 if(Close()==NativeReplyStatus::completed)return;
 auto retained=std::make_unique<QuarantinedOwner>();retained->parent=state_->parent;retained->provider=state_->provider;retained->handle=state_->handle;retained->retained=state_->retained;retained->untracked=state_->retirement_unknown;retained->reply=std::move(state_->response);
 std::lock_guard<std::mutex> lock(QuarantineMutex());Quarantine().push_back(std::move(retained));
}
size_t RetainedInvocation::UnresolvedNativeOwners(){if(getpid()!=kBackendProcess)return std::numeric_limits<size_t>::max();std::lock_guard<std::mutex> lock(QuarantineMutex());return Quarantine().size();}
size_t RetainedInvocation::PollUnresolvedNativeOwners(){
 if(getpid()!=kBackendProcess)return std::numeric_limits<size_t>::max();
 std::vector<std::unique_ptr<QuarantinedOwner>> pending;
 {std::lock_guard<std::mutex> lock(QuarantineMutex());pending.swap(Quarantine());}
 std::vector<std::unique_ptr<QuarantinedOwner>> unresolved;
 for(auto& owner:pending){
  if(!owner->handle||!owner->retained){unresolved.push_back(std::move(owner));continue;}
  const auto retired=AuxNativeContextRetire(owner->handle),os=AuxCloseDevelopmentOwnerOSAdmission(owner->retained),settled=AuxDevelopmentOwnerCleanSettlementStatus(owner->retained);
  if(retired==-3||retired==-4||os==2||settled==2)owner->untracked=true;
  if(owner->untracked||(retired!=0&&retired!=-1)||os!=0||settled!=0){unresolved.push_back(std::move(owner));continue;}
  Wipe(owner->reply);AuxReleaseSignedDevelopmentOwner(owner->retained);AuxReleasePreparedFreshRuntimeProvider(owner->provider);AuxReleaseNativeParentConnection(owner->parent);
 }
 std::lock_guard<std::mutex> lock(QuarantineMutex());for(auto& owner:unresolved)Quarantine().push_back(std::move(owner));return Quarantine().size();
}

}

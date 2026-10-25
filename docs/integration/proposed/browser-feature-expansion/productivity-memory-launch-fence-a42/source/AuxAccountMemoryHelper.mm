#include "AuxAccountMemoryHelper.h"
#import <Foundation/Foundation.h>
#include <Security/Security.h>
#include <CommonCrypto/CommonDigest.h>
#include <mach-o/dyld.h>
#include <sys/acl.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <libproc.h>
#include <sys/proc.h>
#include <spawn.h>
#include <poll.h>
#include <fcntl.h>
#include <unistd.h>
#include <signal.h>
#include <algorithm>
#include <climits>
#include <optional>
#include <stdexcept>
#include <string_view>
#include <utility>
#include <array>
#include <atomic>
#include <chrono>
#include <cmath>
#include <condition_variable>
#include <cstring>
#include <deque>
#include <limits>
#include <map>
#include <mutex>
#include <span>
#include <string>
#include <thread>
#include <vector>

namespace {
constexpr size_t kMessageLimit=1<<20,kQueueBytes=4<<20,kQueueCount=64;
constexpr char kMemorySourceSha[]="b4c7d12efa87ed88515092527c7d1e7d9b43e605f39f03543e2b0e8e7005b3c0";
#include "AuxMemoryModelPins.inc"
struct Fd {
  int value=-1;
  explicit Fd(int fd=-1):value(fd){}
  ~Fd(){if(value>=0)close(value);}
  Fd(Fd&& other) noexcept:value(std::exchange(other.value,-1)){}
  Fd& operator=(Fd&& other) noexcept {if(this!=&other){if(value>=0)close(value);value=std::exchange(other.value,-1);}return *this;}
  Fd(const Fd&)=delete;Fd& operator=(const Fd&)=delete;
};
bool Same(const struct stat& a,const struct stat& b){return a.st_dev==b.st_dev&&a.st_ino==b.st_ino&&a.st_mode==b.st_mode&&a.st_uid==b.st_uid&&a.st_gid==b.st_gid&&a.st_flags==b.st_flags&&a.st_size==b.st_size&&a.st_mtimespec.tv_sec==b.st_mtimespec.tv_sec&&a.st_mtimespec.tv_nsec==b.st_mtimespec.tv_nsec&&a.st_ctimespec.tv_sec==b.st_ctimespec.tv_sec&&a.st_ctimespec.tv_nsec==b.st_ctimespec.tv_nsec;}
bool Safe(int fd,bool directory,bool strict_private=false) {
  struct stat value{};if(fstat(fd,&value)||((value.st_mode&S_IFMT)!=(directory?S_IFDIR:S_IFREG))||
    (value.st_uid!=geteuid()&&value.st_uid!=0)||(value.st_mode&0022)||(!directory&&value.st_nlink!=1)||
    (strict_private&&(value.st_uid!=geteuid()||(value.st_mode&07777)!=0700)))return false;
  errno=0;acl_t acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED);if(!acl&&errno==ENOENT)return true;if(!acl)return false;
  acl_entry_t entry=nullptr;errno=0;bool okay=acl_valid(acl)==0&&acl_get_entry(acl,ACL_FIRST_ENTRY,&entry)==-1&&errno==EINVAL&&entry==nullptr;acl_free(acl);return okay;
}
std::string Path(int fd) {
  std::array<char,PATH_MAX> raw{},canonical{};
  if(fcntl(fd,F_GETPATH,raw.data())||!realpath(raw.data(),canonical.data()))throw std::runtime_error("Memory directory path is unavailable");
  const auto end=std::find(canonical.begin(),canonical.end(),'\0');return std::string(canonical.begin(),end);
}
Fd OpenRelative(int root,const std::string& relative,bool directory=false) {
  Fd current(fcntl(root,F_DUPFD_CLOEXEC,0));if(current.value<0)throw std::runtime_error("Memory root is unavailable");
  size_t start=0;
  for(;;){auto end=relative.find('/',start);auto part=relative.substr(start,end-start);
    if(part.empty()||part=="."||part==".."||part.find('\0')!=std::string::npos)throw std::runtime_error("Invalid fixed memory path");
    const bool last=end==std::string::npos;
    Fd next(openat(current.value,part.c_str(),O_RDONLY|O_CLOEXEC|O_NOFOLLOW|O_NONBLOCK|((!last||directory)?O_DIRECTORY:0)));
    if(next.value<0||!Safe(next.value,!last||directory))throw std::runtime_error("Fixed memory artifact is unavailable");
    struct stat named{},held{};if(fstatat(current.value,part.c_str(),&named,AT_SYMLINK_NOFOLLOW)||fstat(next.value,&held)||named.st_dev!=held.st_dev||named.st_ino!=held.st_ino)throw std::runtime_error("Fixed memory artifact changed");
    current=std::move(next);if(last)return current;start=end+1;
  }
}
std::string Read(int fd,uint64_t maximum) {
  struct stat before{},after{};if(fstat(fd,&before)||!S_ISREG(before.st_mode)||before.st_size<0||uint64_t(before.st_size)>maximum)throw std::runtime_error("Memory artifact exceeds bounds");
  std::string bytes;bytes.resize(size_t(before.st_size));size_t offset=0;
  while(offset<bytes.size()){auto target=std::span(bytes).subspan(offset);auto n=pread(fd,target.data(),target.size(),off_t(offset));if(n<0&&errno==EINTR)continue;if(n<=0)throw std::runtime_error("Memory artifact read failed");offset+=size_t(n);}
  if(fstat(fd,&after)||!Same(before,after))throw std::runtime_error("Memory artifact changed during read");return bytes;
}
std::string Digest(int fd,uint64_t bytes) {
  struct stat before{},after{};if(fstat(fd,&before)||before.st_size<0||uint64_t(before.st_size)!=bytes)throw std::runtime_error("Memory artifact size changed");
  CC_SHA256_CTX digest;CC_SHA256_Init(&digest);std::array<uint8_t,65536> buffer{};uint64_t offset=0;
  while(offset<bytes){const size_t limit=std::min<uint64_t>(buffer.size(),bytes-offset);auto n=pread(fd,buffer.data(),limit,off_t(offset));if(n<0&&errno==EINTR)continue;if(n<=0)throw std::runtime_error("Memory artifact digest failed");CC_SHA256_Update(&digest,buffer.data(),CC_LONG(n));offset+=uint64_t(n);}
  if(fstat(fd,&after)||!Same(before,after))throw std::runtime_error("Memory artifact changed during digest");
  std::array<uint8_t,32> result{};CC_SHA256_Final(result.data(),&digest);constexpr std::string_view hex="0123456789abcdef";std::string out;for(auto byte:result){out+=hex[byte>>4];out+=hex[byte&15];}return out;
}
bool Uuid(const std::string& value) {if(value.size()!=36)return false;for(size_t i=0;i<value.size();++i){if(i==8||i==13||i==18||i==23){if(value[i]!='-')return false;}else if(!((value[i]>='0'&&value[i]<='9')||(value[i]>='a'&&value[i]<='f')))return false;}return true;}
std::string CurrentBundle(){uint32_t size=PATH_MAX;std::array<char,PATH_MAX> path{},canonical{};if(_NSGetExecutablePath(path.data(),&size)||!realpath(path.data(),canonical.data()))throw std::runtime_error("Native memory host image is unavailable");auto end=std::find(canonical.begin(),canonical.end(),'\0');std::string full(canonical.begin(),end);constexpr std::string_view suffix="/Contents/MacOS/aux-daemon";if(!full.ends_with(suffix))throw std::runtime_error("Memory requires the exact native daemon image");return full.substr(0,full.size()-suffix.size());}
struct Prepared {
  std::vector<Fd> held;
  std::string executable,model,memory,control,task,data,cache;
};
// Reuse the existing native sandbox-exec path/parameter idiom. No shell or
// caller policy string. A fixed helper cannot fork/exec an unowned descendant.
constexpr char kSeatbelt[]=R"SB((version 1)
(allow default)
(deny network*)
(deny process-fork)
(deny process-exec (require-not (literal (param "AUX_MEMORY_IMAGE"))))
(deny file-read*
 (subpath (param "AUX_CONTROL"))
 (subpath (param "AUX_BROWSER_DATA"))
 (subpath (param "AUX_BROWSER_CACHE"))
 (require-all
  (subpath (param "AUX_TASK"))
  (require-not (subpath (param "AUX_MEMORY")))
  (require-not (subpath (param "AUX_MODEL")))))
(deny file-write*
 (subpath (param "AUX_CONTROL"))
 (subpath (param "AUX_BROWSER_DATA"))
 (subpath (param "AUX_BROWSER_CACHE"))
 (require-all
  (subpath (param "AUX_TASK"))
  (require-not (subpath (param "AUX_MEMORY")))))
(deny file-link
 (subpath (param "AUX_CONTROL")) (subpath (param "AUX_TASK"))
 (subpath (param "AUX_BROWSER_DATA")) (subpath (param "AUX_BROWSER_CACHE")))
)SB";
struct Event {std::string type,bytes;uint64_t id=0;int code=0;};
struct Write {uint64_t id;std::string bytes;size_t offset=0;};
struct ProcessRegistry {std::mutex mutex;std::map<const void*,std::shared_ptr<AuxAccountMemoryProcess>> values;};
ProcessRegistry& Processes(){static auto* state=new ProcessRegistry;return *state;}
}

class AuxAccountMemoryProcess final:public std::enable_shared_from_this<AuxAccountMemoryProcess> {
 public:
  explicit AuxAccountMemoryProcess(std::shared_ptr<AuxMemoryNativeOwner> owner):owner_(std::move(owner)) {
    Fd directory(owner_->DuplicateMemoryDirectory());if(directory.value<0)throw std::runtime_error("Memory account owner is unavailable");memory_=Path(directory.value);
  }
  const void* WorkerKey()const{return owner_->WorkerKey();}
  napi_value Publish(napi_env env,napi_value callback);
  void RequestStop(int signal=SIGTERM,bool abort_events=false) {
    std::lock_guard<std::mutex> lock(mutex_);stop_=true;
    if(pid_>0&&!reaped_&&!wait_unknown_)kill(pid_,signal);
    if(abort_events&&!channel_released_&&events_&&napi_acquire_threadsafe_function(events_)==napi_ok)
      napi_release_threadsafe_function(events_,napi_tsfn_abort);
  }
  AuxDevelopmentWorkerDrain CloseAndDrain() {
    RequestStop(SIGTERM,true);
    {std::lock_guard<std::mutex> lock(mutex_);if(!done_)return AuxDevelopmentWorkerDrain::pending;}
    Finish();std::lock_guard<std::mutex> lock(mutex_);
    return settled_?AuxDevelopmentWorkerDrain::drained:AuxDevelopmentWorkerDrain::untracked;
  }
  void Finish() {
    std::unique_lock<std::mutex> join(join_mutex_);
    if(thread_.joinable())thread_.join();
    bool physical=false;
    {std::lock_guard<std::mutex> lock(mutex_);physical=done_&&!wait_unknown_&&(no_child_||reaped_)&&input_.value<0&&output_.value<0&&error_.value<0;if(settled_)return;}
    if(!physical)return;
    if(!owner_->SettlePhysical(no_child_?0:pid_,raw_wait_status_,no_child_?spawn_error_:0))return;
    {std::lock_guard<std::mutex> lock(mutex_);settled_=true;}
    std::lock_guard<std::mutex> lock(Processes().mutex);Processes().values.erase(this);
  }
  ~AuxAccountMemoryProcess(){if(thread_.joinable())std::terminate();}
 private:
  struct JsHold {std::shared_ptr<AuxAccountMemoryProcess> value;};
  std::shared_ptr<AuxMemoryNativeOwner> owner_;
  const pid_t process_=getpid();
  std::string memory_;
  std::mutex mutex_,join_mutex_;
  std::thread thread_;
  napi_threadsafe_function events_=nullptr;
  int raw_wait_status_=0,spawn_error_=ECANCELED;
  bool stop_=false,reaped_=false,no_child_=true,wait_unknown_=false,done_=false,settled_=false,channel_released_=false,end_input_=false;
  pid_t pid_=-1;
  Fd input_,output_,error_;
  std::deque<Write> writes_;
  size_t queued_=0;
  std::atomic<size_t> data_events_{0};
  uint64_t next_write_=1,end_id_=0;
  std::vector<napi_deferred> close_promises_;
  std::map<uint64_t,napi_deferred> promises_; // Owning main Environment only.
  Prepared Prepare();
  void Run();
  void Spawn(Prepared&);
  bool Emit(Event event) {
    const bool data=event.type=="stdout"||event.type=="stderr";
    if(data){
      for(;;){
        {std::lock_guard<std::mutex> lock(mutex_);if(stop_)return true;}
        size_t count=data_events_.load();
        if(count<48&&data_events_.compare_exchange_weak(count,count+1))break;
        std::this_thread::sleep_for(std::chrono::milliseconds(2));
      }
    }
    auto* owned=new Event(std::move(event));
    const auto status=napi_call_threadsafe_function(events_,owned,napi_tsfn_nonblocking);
    if(status!=napi_ok){if(data)data_events_.fetch_sub(1);delete owned;RequestStop(SIGTERM);return false;}
    return true;
  }
  static void CallEvent(napi_env env,napi_value callback,void* context,void* data);
  static void FinalizeEvents(napi_env,void* data,void*){delete static_cast<JsHold*>(data);}
  static void FinalizeObject(napi_env,void* data,void*) {auto* hold=static_cast<JsHold*>(data);hold->value->RequestStop(SIGTERM,true);delete hold;}
  static std::shared_ptr<AuxAccountMemoryProcess> Get(napi_env env,napi_callback_info info,size_t* argc,napi_value* args) {
    napi_value self;void* raw=nullptr;
    if(napi_get_cb_info(env,info,argc,args,&self,nullptr)!=napi_ok||napi_unwrap(env,self,&raw)!=napi_ok||!raw)return {};
    return static_cast<JsHold*>(raw)->value;
  }
  napi_value Promise(napi_env env,uint64_t id){napi_deferred deferred;napi_value promise;if(napi_create_promise(env,&deferred,&promise)!=napi_ok)return nullptr;promises_.emplace(id,deferred);return promise;}
  std::string Normalize(napi_env,napi_value);
  static napi_value WriteInput(napi_env env,napi_callback_info info);
  static napi_value EndInput(napi_env env,napi_callback_info info);
  static napi_value Close(napi_env,napi_callback_info);
  static napi_value Kill(napi_env env,napi_callback_info info);
  friend napi_value AuxCreateAccountMemoryProcess(napi_env,napi_callback_info);
};

Prepared AuxAccountMemoryProcess::Prepare() {
  @autoreleasepool {
    if(!owner_->Current())throw std::runtime_error("Memory account binding changed");
    Prepared result;result.memory=memory_;
    int32_t control=-1,task=-1;uint64_t generation=0;
    const bool roots=owner_->CopyStorageRoots(&control,&task,&generation);
    result.held.emplace_back(control);result.held.emplace_back(task);
    if(!roots)throw std::runtime_error("Memory native roots are unavailable");
    result.task=Path(task);
    std::array<char,4096> parent{};uint32_t parent_bytes=0;
    if(!owner_->CopyPrivateParent(parent.data(),parent.size(),&parent_bytes)||parent_bytes<2||parent_bytes>parent.size()||parent[parent_bytes-1]!='\0')throw std::runtime_error("Memory control exclusion is unavailable");
    result.control=std::string(parent.begin(),parent.begin()+parent_bytes-1);
    for(uint32_t role=1;role<=2;++role){int32_t fd=-1;uint64_t observed=0;const bool okay=owner_->CopyBrowserRoot(role,&fd,&observed);result.held.emplace_back(fd);if(!okay||observed!=generation)throw std::runtime_error("Memory browser root binding changed");(role==1?result.data:result.cache)=Path(fd);}
    const auto bundle=CurrentBundle();Fd bundle_fd(open(bundle.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
    if(bundle_fd.value<0||!Safe(bundle_fd.value,true))throw std::runtime_error("Memory signed host is unavailable");
    auto policy_file=OpenRelative(bundle_fd.value,"Contents/Resources/AuxMemoryHelperLaunchPolicy.json");
    const auto bytes=Read(policy_file.value,16384);NSData* raw=[NSData dataWithBytes:bytes.data() length:bytes.size()];
    SecCodeRef dynamic=nullptr;SecStaticCodeRef code=nullptr;
    if(SecCodeCopySelf(kSecCSDefaultFlags,&dynamic)!=errSecSuccess||!dynamic)throw std::runtime_error("Memory host identity is unavailable");
    auto static_status=SecCodeCopyStaticCode(dynamic,kSecCSDefaultFlags,&code);CFRelease(dynamic);
    if(static_status!=errSecSuccess||!code)throw std::runtime_error("Memory host identity is unavailable");
    const SecCSFlags flags=kSecCSStrictValidate|kSecCSCheckAllArchitectures|kSecCSCheckNestedCode|kSecCSRestrictSymlinks|SecCSFlags(1u<<29);
    const auto checked=SecStaticCodeCheckValidity(code,flags,nullptr);
    const auto resource=checked==errSecSuccess?SecCodeValidateFileResource(code,CFSTR("Resources/AuxMemoryHelperLaunchPolicy.json"),(__bridge CFDataRef)raw,kSecCSDefaultFlags):checked;
    CFRelease(code);if(resource!=errSecSuccess)throw std::runtime_error("Memory launch resource is not sealed");
    NSError* error=nil;id parsed=[NSJSONSerialization JSONObjectWithData:raw options:0 error:&error];
    if(error||![parsed isKindOfClass:[NSDictionary class]])throw std::runtime_error("Memory launch resource is invalid");
    NSDictionary* policy=parsed;
    NSSet* expected=[NSSet setWithArray:@[@"format",@"sourceSha256",@"sha256",@"bytes",@"identifier",@"team",@"modelDescriptorSha256"]];
    if(![[NSSet setWithArray:policy.allKeys] isEqualToSet:expected]||![policy[@"format"] isEqual:@"aux.memory.fixed-helper-launch.v1"]||
      ![policy[@"sourceSha256"] isEqual:[NSString stringWithUTF8String:kMemorySourceSha]]||![policy[@"identifier"] isEqual:@"dev.aux.browser.memory"]||
      ![policy[@"team"] isEqual:@"9F2JXY8TCK"]||![policy[@"modelDescriptorSha256"] isEqual:[NSString stringWithUTF8String:kMemoryModelKey]]||
      ![policy[@"sha256"] isKindOfClass:[NSString class]]||![policy[@"bytes"] isKindOfClass:[NSNumber class]])throw std::runtime_error("Memory launch resource has an unsupported identity");
    NSString* hash=policy[@"sha256"];NSNumber* count=policy[@"bytes"];
    if(hash.length!=64||[hash rangeOfCharacterFromSet:[[NSCharacterSet characterSetWithCharactersInString:@"0123456789abcdef"] invertedSet]].location!=NSNotFound||
      CFGetTypeID((__bridge CFTypeRef)count)==CFBooleanGetTypeID()||count.doubleValue<1||count.doubleValue>16*1024*1024||std::floor(count.doubleValue)!=count.doubleValue)throw std::runtime_error("Memory launch artifact bounds are invalid");
    auto image=OpenRelative(bundle_fd.value,"Contents/Resources/memory-helper/aux-memory");
    struct stat image_stat{};if(fstat(image.value,&image_stat)||(image_stat.st_mode&0111)==0||Digest(image.value,count.unsignedLongLongValue)!=hash.UTF8String)throw std::runtime_error("Memory signed artifact does not match its launch record");
    result.executable=Path(image.value);
    CFURLRef url=CFURLCreateFromFileSystemRepresentation(kCFAllocatorDefault,reinterpret_cast<const UInt8*>(result.executable.data()),result.executable.size(),false);
    SecStaticCodeRef memory_code=nullptr;OSStatus status=url?SecStaticCodeCreateWithPath(url,kSecCSDefaultFlags,&memory_code):errSecParam;if(url)CFRelease(url);
    SecRequirementRef requirement=nullptr;
    const auto requirement_status=SecRequirementCreateWithString(CFSTR("anchor apple generic and identifier \"dev.aux.browser.memory\" and certificate leaf[subject.OU] = \"9F2JXY8TCK\""),kSecCSDefaultFlags,&requirement);
    if(status==errSecSuccess&&requirement_status==errSecSuccess&&memory_code&&requirement)status=SecStaticCodeCheckValidity(memory_code,flags,requirement);else status=errSecParam;
    if(memory_code)CFRelease(memory_code);if(requirement)CFRelease(requirement);
    if(status!=errSecSuccess)throw std::runtime_error("Memory helper signing identity is unavailable");
    result.held.emplace_back(std::move(image));result.held.emplace_back(std::move(policy_file));result.held.emplace_back(std::move(bundle_fd));
    const std::string prefix=std::string("models/")+kMemoryModelKey;
    auto current=OpenRelative(task,prefix+"/CURRENT");const auto selected=Read(current.value,36);
    if(!Uuid(selected))throw std::runtime_error("Memory model generation is invalid");
    auto model=OpenRelative(task,prefix+"/"+selected,true);result.model=Path(model.value);
    for(const auto& pin:kMemoryModelPins){
      {std::lock_guard<std::mutex> lock(mutex_);if(stop_)throw std::runtime_error("Memory preparation was cancelled");}
      auto file=OpenRelative(model.value,pin.path,pin.directory);struct stat metadata{};
      if(fstat(file.value,&metadata)||(metadata.st_mode&07777)!=pin.mode||(!pin.directory&&Digest(file.value,pin.bytes)!=pin.sha256))throw std::runtime_error("Memory model does not match the sealed supplied bytes");
      result.held.emplace_back(std::move(file));
    }
    result.held.emplace_back(std::move(current));result.held.emplace_back(std::move(model));
    if(!owner_->Current())throw std::runtime_error("Memory account binding changed during preparation");
    return result;
  }
}
void AuxAccountMemoryProcess::Spawn(Prepared& prepared) {
  std::array<int,2> in{-1,-1},out{-1,-1},err{-1,-1};
  auto pipe_owned=[](std::array<int,2>& pair){if(pipe(pair.data()))throw std::runtime_error("Memory pipe creation failed");for(int fd:pair)if(fcntl(fd,F_SETFD,FD_CLOEXEC))throw std::runtime_error("Memory pipe ownership failed");};
  try{pipe_owned(in);pipe_owned(out);pipe_owned(err);}catch{for(auto* pair:{&in,&out,&err})for(int fd:*pair)if(fd>=0)close(fd);throw;}
  Fd child_in(in[0]),parent_in(in[1]),parent_out(out[0]),child_out(out[1]),parent_err(err[0]),child_err(err[1]);
  posix_spawn_file_actions_t actions;posix_spawnattr_t attributes;
  if(posix_spawn_file_actions_init(&actions))throw std::runtime_error("Memory launch actions unavailable");
  const auto close_actions=[&]{posix_spawn_file_actions_destroy(&actions);};
  if(posix_spawnattr_init(&attributes)){close_actions();throw std::runtime_error("Memory launch attributes unavailable");}
  const auto clean=[&]{posix_spawnattr_destroy(&attributes);close_actions();};
  bool valid=true;
  for(const auto& pair:std::array<std::pair<int,int>,3>{{{child_in.value,STDIN_FILENO},{child_out.value,STDOUT_FILENO},{child_err.value,STDERR_FILENO}}})if(posix_spawn_file_actions_adddup2(&actions,pair.first,pair.second))valid=false;
  if(posix_spawnattr_setflags(&attributes,POSIX_SPAWN_CLOEXEC_DEFAULT|POSIX_SPAWN_START_SUSPENDED))valid=false;
  std::vector<std::string> argv{"/usr/bin/sandbox-exec"};
  auto parameter=[&](std::string key,const std::string& value){argv.emplace_back("-D");argv.emplace_back(std::move(key)+"="+value);};
  parameter("AUX_MEMORY_IMAGE",prepared.executable);parameter("AUX_CONTROL",prepared.control);parameter("AUX_TASK",prepared.task);parameter("AUX_MEMORY",prepared.memory);parameter("AUX_MODEL",prepared.model);parameter("AUX_BROWSER_DATA",prepared.data);parameter("AUX_BROWSER_CACHE",prepared.cache);
  argv.emplace_back("-p");argv.emplace_back(kSeatbelt);argv.emplace_back(prepared.executable);argv.emplace_back(prepared.model);argv.emplace_back("");
  std::vector<char*> pointers;for(auto& value:argv)pointers.push_back(value.data());pointers.push_back(nullptr);
  std::vector<std::string> env{"PATH=/usr/bin:/bin","ORT_DISABLE_TELEMETRY=1","HOME="+prepared.memory};std::vector<char*> environment;for(auto& value:env)environment.push_back(value.data());environment.push_back(nullptr);
  if(!valid){clean();throw std::runtime_error("Fixed memory spawn configuration is unavailable");}
  if(!owner_->PrepareLaunch()){clean();throw std::runtime_error("Memory lifetime reservation was not durably admitted");}
  int result=ECANCELED;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if(!stop_)result=owner_->SpawnStoppedAfterPrepared(&pid_,&actions,&attributes,pointers.data(),environment.data());
    spawn_error_=result;
    if(result==0){no_child_=false;input_=std::move(parent_in);output_=std::move(parent_out);error_=std::move(parent_err);}
  }
  clean();if(result!=0)throw std::runtime_error("Fixed memory helper could not start");
  // The original child cannot run a single helper instruction before its exact
  // kernel PID/birth is durably published under the actual retained owner.
  if(!owner_->PublishSuspended(pid_))throw std::runtime_error("Memory stopped-child publication is unknown");
  {std::lock_guard<std::mutex> lock(mutex_);if(stop_||!owner_->ResumeStoppedAfterPublished(pid_))throw std::runtime_error("Memory start was cancelled");}
  for(int fd:{input_.value,output_.value,error_.value})fcntl(fd,F_SETFL,fcntl(fd,F_GETFL)|O_NONBLOCK);
  Emit({"spawn",{},uint64_t(pid_)});
}
void AuxAccountMemoryProcess::Run() {
  int code=1,signal=0;
  try {
    auto prepared=Prepare();Spawn(prepared);
    std::optional<std::chrono::steady_clock::time_point> cancelling;
    for(;;) {
      uint64_t input_closed=0;
      {
        std::lock_guard<std::mutex> lock(mutex_);
        if(stop_&&!reaped_&&!wait_unknown_&&pid_>0){if(!cancelling)cancelling=std::chrono::steady_clock::now();if(std::chrono::steady_clock::now()-*cancelling>std::chrono::seconds(1))kill(pid_,SIGKILL);}
        if(input_.value>=0&&((end_input_&&writes_.empty())||reaped_||wait_unknown_)) {
          input_=Fd();input_closed=end_id_;end_id_=0;
        }
      }
      if(input_closed)Emit({"inputClosed",{},input_closed});
      std::array<pollfd,3> fds{};
      {std::lock_guard<std::mutex> lock(mutex_);fds={pollfd{input_.value,short(!writes_.empty()?POLLOUT:0),0},pollfd{output_.value,POLLIN,0},pollfd{error_.value,POLLIN,0}};}
      const int polled=poll(fds.data(),fds.size(),100);if(polled<0&&errno!=EINTR)throw std::runtime_error("Memory I/O observation failed");
      if(fds[0].fd>=0&&(fds[0].revents&(POLLOUT|POLLERR|POLLHUP))) {
        std::optional<uint64_t> written;
        {std::lock_guard<std::mutex> lock(mutex_);if(!writes_.empty()){
          auto& pending=writes_.front();auto bytes=std::span(pending.bytes).subspan(pending.offset);
          const auto count=write(input_.value,bytes.data(),bytes.size());
          if(count>0){pending.offset+=size_t(count);queued_-=size_t(count);if(pending.offset==pending.bytes.size()){written=pending.id;writes_.pop_front();}}
          else if(count<0&&errno!=EINTR&&errno!=EAGAIN){input_=Fd();writes_.clear();queued_=0;}
        }}
        if(written)Emit({"written",{},*written});
      }
      for(size_t index=1;index<3;++index)if(fds[index].fd>=0&&(fds[index].revents&(POLLIN|POLLHUP|POLLERR))) {
        std::array<char,65536> bytes{};const size_t capacity=index==1?bytes.size():4096;
        const auto count=read(fds[index].fd,bytes.data(),capacity);
        if(count>0)Emit({index==1?"stdout":"stderr",std::string(bytes.begin(),bytes.begin()+count)});
        else if(count==0||(count<0&&errno!=EAGAIN&&errno!=EINTR)){
          {std::lock_guard<std::mutex> lock(mutex_);(index==1?output_:error_)=Fd();}
          Emit({index==1?"stdoutEnd":"stderrEnd"});
        }
      }
      bool complete=false;
      {
        std::lock_guard<std::mutex> lock(mutex_);
        if(!reaped_&&!wait_unknown_) {
          int observed=0;const auto child=waitpid(pid_,&observed,WNOHANG);
          if(child==pid_){raw_wait_status_=observed;reaped_=true;if(WIFEXITED(observed))code=WEXITSTATUS(observed);else if(WIFSIGNALED(observed)){signal=WTERMSIG(observed);code=128+signal;}}
          else if(child<0&&errno!=EINTR){wait_unknown_=true;input_=Fd();output_=Fd();error_=Fd();}
        }
        complete=(reaped_||wait_unknown_)&&output_.value<0&&error_.value<0;
      }
      if(complete)break;
    }
  }catch(const std::exception& error){
    Emit({"error",error.what()});RequestStop(SIGKILL);
    pid_t child=-1;
    {std::lock_guard<std::mutex> lock(mutex_);if(!no_child_&&!reaped_&&!wait_unknown_)child=pid_;}
    if(child>0){int observed=0;pid_t result;do{result=waitpid(child,&observed,0);}while(result<0&&errno==EINTR);std::lock_guard<std::mutex> lock(mutex_);if(result==child){reaped_=true;raw_wait_status_=observed;}else wait_unknown_=true;}
  }
  {std::lock_guard<std::mutex> lock(mutex_);input_=Fd();output_=Fd();error_=Fd();writes_.clear();queued_=0;}
  bool unknown=false;{std::lock_guard<std::mutex> lock(mutex_);unknown=wait_unknown_;}
  if(unknown)Emit({"error","Memory child wait ownership is unknown"});
  {std::lock_guard<std::mutex> lock(mutex_);done_=true;}
  if(!unknown)Emit({"close",signal?std::to_string(signal):"",0,code});
  {std::lock_guard<std::mutex> lock(mutex_);channel_released_=true;}
  napi_release_threadsafe_function(events_,napi_tsfn_release);
}

std::string AuxAccountMemoryProcess::Normalize(napi_env env,napi_value value) {
  @autoreleasepool {
    bool buffer=false;void* bytes=nullptr;size_t count=0;
    if(napi_is_buffer(env,value,&buffer)!=napi_ok||!buffer||napi_get_buffer_info(env,value,&bytes,&count)!=napi_ok||!bytes||!count||count>kMessageLimit)throw std::runtime_error("Memory input exceeds bounds");
    NSData* data=[NSData dataWithBytes:bytes length:count];NSError* error=nil;id decoded=[NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
    if(error||![decoded isKindOfClass:[NSDictionary class]])throw std::runtime_error("Memory request is invalid JSON");
    NSDictionary* input=decoded;
    if(![[NSSet setWithArray:input.allKeys] isEqualToSet:[NSSet setWithArray:@[@"id",@"method",@"params"]]]||
       ![input[@"id"] isKindOfClass:[NSNumber class]]||![input[@"method"] isKindOfClass:[NSString class]]||![input[@"params"] isKindOfClass:[NSDictionary class]])throw std::runtime_error("Memory request shape is unsupported");
    NSNumber* id_value=input[@"id"];NSString* method=input[@"method"];NSDictionary* params=input[@"params"];
    if(CFGetTypeID((__bridge CFTypeRef)id_value)==CFBooleanGetTypeID()||id_value.doubleValue<1||id_value.doubleValue>9'007'199'254'740'991.0||std::floor(id_value.doubleValue)!=id_value.doubleValue)throw std::runtime_error("Memory request identity is invalid");
    NSSet* allowed=nil;
    if([method isEqual:@"shutdown"])allowed=[NSSet set];
    else if([method isEqual:@"status"]||[method isEqual:@"close"])allowed=[NSSet setWithObject:@"directory"];
    else if([method isEqual:@"sync"])allowed=[NSSet setWithArray:@[@"directory",@"rebuild"]];
    else if([method isEqual:@"search"])allowed=[NSSet setWithArray:@[@"directory",@"query",@"topK",@"alpha"]];
    if(!allowed||![[NSSet setWithArray:params.allKeys] isSubsetOfSet:allowed])throw std::runtime_error("Memory operation is not in the fixed protocol");
    if(params[@"rebuild"]&&CFGetTypeID((__bridge CFTypeRef)params[@"rebuild"])!=CFBooleanGetTypeID())throw std::runtime_error("Memory rebuild option is invalid");
    if([method isEqual:@"search"]){
      NSString* query=params[@"query"];NSNumber* top=params[@"topK"],*alpha=params[@"alpha"];
      if(![query isKindOfClass:[NSString class]]||[query lengthOfBytesUsingEncoding:NSUTF8StringEncoding]>65536||![top isKindOfClass:[NSNumber class]]||CFGetTypeID((__bridge CFTypeRef)top)==CFBooleanGetTypeID()||top.doubleValue<0||top.doubleValue>100||std::floor(top.doubleValue)!=top.doubleValue||
        (alpha&&(![alpha isKindOfClass:[NSNumber class]]||CFGetTypeID((__bridge CFTypeRef)alpha)==CFBooleanGetTypeID()||!std::isfinite(alpha.doubleValue))))throw std::runtime_error("Memory search exceeds bounds");
    }
    NSMutableDictionary* fixed=[params mutableCopy];
    if(![method isEqual:@"shutdown"])fixed[@"directory"]=[NSString stringWithUTF8String:memory_.c_str()];
    NSData* output=[NSJSONSerialization dataWithJSONObject:@{@"id":id_value,@"method":method,@"params":fixed} options:0 error:&error];
    if(error||!output||output.length+1>kMessageLimit)throw std::runtime_error("Memory request encoding exceeds bounds");
    std::string result(static_cast<const char*>(output.bytes),output.length);result+='\n';return result;
  }
}

napi_value AuxAccountMemoryProcess::WriteInput(napi_env env,napi_callback_info info) {
  try {
    size_t argc=1;napi_value input;auto self=Get(env,info,&argc,&input);
    if(!self||argc!=1||getpid()!=self->process_||!self->owner_->Current())throw std::runtime_error("Memory account owner is unavailable");
    auto bytes=self->Normalize(env,input);uint64_t id;
    {std::lock_guard<std::mutex> lock(self->mutex_);if(self->stop_||self->done_||self->end_input_||self->writes_.size()>=1||bytes.size()>kQueueBytes-self->queued_||self->next_write_>9'007'199'254'740'991ULL)throw std::runtime_error("Memory input is closed or backpressured");id=self->next_write_++;self->queued_+=bytes.size();self->writes_.push_back({id,std::move(bytes)});}
    return self->Promise(env,id);
  }catch(const std::exception& error){napi_throw_error(env,"AUX_MEMORY_INPUT_REFUSED",error.what());return nullptr;}
}
napi_value AuxAccountMemoryProcess::EndInput(napi_env env,napi_callback_info info) {
  size_t argc=0;auto self=Get(env,info,&argc,nullptr);if(!self||argc||getpid()!=self->process_){napi_throw_error(env,"AUX_MEMORY_INPUT_REFUSED","Memory input owner is unavailable");return nullptr;}
  uint64_t id;bool closed=false;
  {std::lock_guard<std::mutex> lock(self->mutex_);if(self->next_write_>9'007'199'254'740'991ULL||self->end_input_){napi_throw_error(env,"AUX_MEMORY_INPUT_REFUSED","Memory input is already closing");return nullptr;}id=self->next_write_++;self->end_input_=true;self->end_id_=id;closed=self->done_||(self->input_.value<0&&self->reaped_);}
  auto promise=self->Promise(env,id);
  if(closed){napi_value empty;napi_get_undefined(env,&empty);napi_resolve_deferred(env,self->promises_.at(id),empty);self->promises_.erase(id);}
  return promise;
}
napi_value AuxAccountMemoryProcess::Close(napi_env env,napi_callback_info info) {
  size_t argc=0;auto self=Get(env,info,&argc,nullptr);
  if(!self||argc||getpid()!=self->process_||self->close_promises_.size()>=8){napi_throw_error(env,"AUX_MEMORY_CLOSE_REFUSED","Memory close owner is unavailable");return nullptr;}
  napi_deferred deferred;napi_value promise;
  if(napi_create_promise(env,&deferred,&promise)!=napi_ok)return nullptr;
  bool done;{std::lock_guard<std::mutex> lock(self->mutex_);done=self->done_;}
  self->RequestStop();
  if(done){self->Finish();bool settled;{std::lock_guard<std::mutex> lock(self->mutex_);settled=self->settled_;}
    napi_value value;napi_get_undefined(env,&value);
    if(settled)napi_resolve_deferred(env,deferred,value);
    else{napi_value message,error;napi_create_string_utf8(env,"Native memory cleanup remains unknown",NAPI_AUTO_LENGTH,&message);napi_create_error(env,nullptr,message,&error);napi_reject_deferred(env,deferred,error);}
  }else self->close_promises_.push_back(deferred);
  return promise;
}
napi_value AuxAccountMemoryProcess::Kill(napi_env env,napi_callback_info info) {
  size_t argc=1;napi_value value;auto self=Get(env,info,&argc,&value);std::array<char,16> signal{};size_t count=0;
  if(!self||getpid()!=self->process_||argc!=1||napi_get_value_string_utf8(env,value,signal.data(),signal.size(),&count)!=napi_ok){napi_throw_error(env,"AUX_MEMORY_STOP_REFUSED","Memory stop owner is unavailable");return nullptr;}
  std::string_view selected(signal.data(),count);if(selected!="SIGTERM"&&selected!="SIGKILL"){napi_throw_error(env,"AUX_MEMORY_STOP_REFUSED","Unsupported fixed memory stop signal");return nullptr;}
  self->RequestStop(selected=="SIGKILL"?SIGKILL:SIGTERM);napi_value okay;napi_get_boolean(env,true,&okay);return okay;
}
napi_value AuxAccountMemoryProcess::Publish(napi_env env,napi_value callback) {
  napi_value name,object;napi_create_string_utf8(env,"Aux account memory",NAPI_AUTO_LENGTH,&name);
  auto* events_hold=new JsHold{shared_from_this()};
  if(napi_create_threadsafe_function(env,callback,nullptr,name,64,1,events_hold,FinalizeEvents,events_hold,CallEvent,&events_)!=napi_ok){delete events_hold;throw std::runtime_error("Memory event owner is unavailable");}
  auto abort_unstarted=[&]{ {std::lock_guard<std::mutex> lock(mutex_);channel_released_=true;}napi_release_threadsafe_function(events_,napi_tsfn_abort);};
  if(napi_create_object(env,&object)!=napi_ok){abort_unstarted();throw std::runtime_error("Memory process wrapper is unavailable");}
  auto* hold=new JsHold{shared_from_this()};
  if(napi_wrap(env,object,hold,FinalizeObject,nullptr,nullptr)!=napi_ok){delete hold;abort_unstarted();throw std::runtime_error("Memory process wrapper is unavailable");}
  const napi_property_descriptor fields[]={
    {"write",nullptr,WriteInput,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"endInput",nullptr,EndInput,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"kill",nullptr,Kill,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"close",nullptr,Close,nullptr,nullptr,nullptr,napi_default,nullptr}};
  if(napi_define_properties(env,object,std::size(fields),fields)!=napi_ok||napi_object_freeze(env,object)!=napi_ok){abort_unstarted();throw std::runtime_error("Memory process methods are unavailable");}
  {
    std::lock_guard<std::mutex> lock(Processes().mutex);
    if(Processes().values.size()>=64) {abort_unstarted();throw std::runtime_error("Native memory process limit reached");}
    Processes().values.emplace(this,shared_from_this());
  }
  try{thread_=std::thread([self=shared_from_this()]{self->Run();});}
  catch{std::lock_guard<std::mutex> lock(Processes().mutex);Processes().values.erase(this);abort_unstarted();throw;}
  return object;
}
void AuxAccountMemoryProcess::CallEvent(napi_env env,napi_value callback,void* context,void* data) {
  std::unique_ptr<Event> event(static_cast<Event*>(data));
  auto self=static_cast<JsHold*>(context)->value;
  if(event->type=="stdout"||event->type=="stderr")self->data_events_.fetch_sub(1);
  if(!env||!callback)return; // No callback disappearance can release a child.
  napi_value undefined;napi_get_undefined(env,&undefined);
  if(event->type=="written"||event->type=="inputClosed") {
    const auto pending=self->promises_.find(event->id);
    if(pending!=self->promises_.end()){napi_resolve_deferred(env,pending->second,undefined);self->promises_.erase(pending);}return;
  }
  if(event->type=="close"){
    self->Finish(); // Exact original thread has returned.
    bool settled;{std::lock_guard<std::mutex> lock(self->mutex_);settled=self->settled_;}
    for(auto deferred:self->close_promises_){
      if(settled)napi_resolve_deferred(env,deferred,undefined);
      else{napi_value message,error;napi_create_string_utf8(env,"Native memory cleanup remains unknown",NAPI_AUTO_LENGTH,&message);napi_create_error(env,nullptr,message,&error);napi_reject_deferred(env,deferred,error);}
    }
    self->close_promises_.clear();
  }
  if(event->type=="error"||event->type=="close") {
    napi_value message,error;napi_create_string_utf8(env,"Memory process closed before write completion",NAPI_AUTO_LENGTH,&message);napi_create_error(env,nullptr,message,&error);
    for(const auto& pending:self->promises_)napi_reject_deferred(env,pending.second,error);self->promises_.clear();
    if(event->type=="error"){for(auto deferred:self->close_promises_)napi_reject_deferred(env,deferred,error);self->close_promises_.clear();}
  }
  napi_value args[2];napi_create_string_utf8(env,event->type.data(),event->type.size(),&args[0]);args[1]=undefined;
  if(event->type=="stdout"||event->type=="stderr")napi_create_buffer_copy(env,event->bytes.size(),event->bytes.data(),nullptr,&args[1]);
  else if(event->type=="spawn")napi_create_double(env,double(event->id),&args[1]);
  else if(event->type=="error")napi_create_string_utf8(env,event->bytes.data(),event->bytes.size(),&args[1]);
  else if(event->type=="close") {
    napi_create_object(env,&args[1]);napi_value code,signal;napi_create_int32(env,event->code,&code);napi_set_named_property(env,args[1],"code",code);
    if(event->bytes.empty())napi_get_null(env,&signal);else napi_create_string_utf8(env,event->bytes.data(),event->bytes.size(),&signal);napi_set_named_property(env,args[1],"signal",signal);
  }
  if(napi_call_function(env,undefined,callback,2,args,nullptr)!=napi_ok)self->RequestStop(SIGTERM,true);
}

napi_value AuxCreateAccountMemoryProcess(napi_env env,napi_callback_info info) {
  std::shared_ptr<AuxMemoryNativeOwner> owner;
  try {
    size_t argc=2;napi_value args[2];napi_valuetype type;double numeric=0;
    if(napi_get_cb_info(env,info,&argc,args,nullptr,nullptr)!=napi_ok||argc!=2||
      napi_typeof(env,args[0],&type)!=napi_ok||type!=napi_number||napi_get_value_double(env,args[0],&numeric)!=napi_ok||
      !std::isfinite(numeric)||numeric<0||numeric>9'007'199'254'740'991.0||std::floor(numeric)!=numeric||
      napi_typeof(env,args[1],&type)!=napi_ok||type!=napi_function)throw std::runtime_error("Memory process arguments are invalid");
    owner=AuxMemoryNativeOwner::Capture(env,int64_t(numeric));
    if(!owner)throw std::runtime_error("Native registered account memory owner is unavailable");
    auto process=std::make_shared<AuxAccountMemoryProcess>(owner);
    return process->Publish(env,args[1]);
  }catch(const std::exception& error){
    if(owner)owner->SettlePhysical(); // Publish did not start a child thread.
    napi_throw_error(env,"AUX_MEMORY_HELPER_UNAVAILABLE",error.what());return nullptr;
  }
}
AuxDevelopmentWorkerDrain AuxCloseAccountMemoryProcessesForWorker(const void* key) noexcept {
  try {
    std::vector<std::shared_ptr<AuxAccountMemoryProcess>> children;
    {std::lock_guard<std::mutex> lock(Processes().mutex);for(const auto& pair:Processes().values)if(pair.second->WorkerKey()==key)children.push_back(pair.second);}
    auto result=AuxDevelopmentWorkerDrain::drained;
    for(const auto& child:children){auto current=child->CloseAndDrain();if(current==AuxDevelopmentWorkerDrain::untracked)return current;if(current!=AuxDevelopmentWorkerDrain::drained)result=current;}
    return result;
  }catch(...){return AuxDevelopmentWorkerDrain::untracked;}
}

void AuxRequestAccountMemoryStopForWorker(const void* key) noexcept {
  try{std::vector<std::shared_ptr<AuxAccountMemoryProcess>> children;
    {std::lock_guard<std::mutex> lock(Processes().mutex);for(const auto& pair:Processes().values)if(pair.second->WorkerKey()==key)children.push_back(pair.second);}
    for(const auto& child:children)child->RequestStop();
  }catch(...){} // Registry fence remains held; failure can never admit publication.
}
extern "C" __attribute__((visibility("hidden"))) int32_t AuxMemoryCopyCurrentLifetime(int32_t* pid,uint64_t* seconds,uint64_t* micros) {
  if(!pid||!seconds||!micros)return -1;*pid=-1;*seconds=0;*micros=0;
  proc_bsdinfo first{},second{};const pid_t current=getpid();
  if(current<=1||proc_pidinfo(current,PROC_PIDTBSDINFO,0,&first,sizeof(first))!=sizeof(first)||
     proc_pidinfo(current,PROC_PIDTBSDINFO,0,&second,sizeof(second))!=sizeof(second)||
     first.pbi_pid!=uint32_t(current)||second.pbi_pid!=first.pbi_pid||!first.pbi_start_tvsec||
     second.pbi_start_tvsec!=first.pbi_start_tvsec||second.pbi_start_tvusec!=first.pbi_start_tvusec||first.pbi_start_tvusec>=1000000)return -1;
  *pid=current;*seconds=first.pbi_start_tvsec;*micros=first.pbi_start_tvusec;return 0;
}
extern "C" __attribute__((visibility("hidden"))) int32_t AuxMemoryCopyStoppedChildLifetime(int32_t pid,uint64_t* seconds,uint64_t* micros) {
  if(!seconds||!micros)return -1;*seconds=0;*micros=0;
  proc_bsdinfo first{},second{};const pid_t parent=getpid();
  if(pid<=1||proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&first,sizeof(first))!=sizeof(first)||
     proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&second,sizeof(second))!=sizeof(second)||first.pbi_pid!=uint32_t(pid)||
     first.pbi_ppid!=uint32_t(parent)||second.pbi_ppid!=first.pbi_ppid||second.pbi_pid!=first.pbi_pid||
     first.pbi_status!=SSTOP||second.pbi_status!=SSTOP||!first.pbi_start_tvsec||first.pbi_start_tvusec>=1000000||
     second.pbi_start_tvsec!=first.pbi_start_tvsec||second.pbi_start_tvusec!=first.pbi_start_tvusec)return -1;
  *seconds=first.pbi_start_tvsec;*micros=first.pbi_start_tvusec;return 0;
}

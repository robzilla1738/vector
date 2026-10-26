// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/extensions/api/messaging/aux_native_host_lease.h"
#include <CommonCrypto/CommonDigest.h>
#include <algorithm>
#include <array>
#include <cerrno>
#include <csignal>
#include <fcntl.h>
#include <spawn.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <unistd.h>
#include "base/environment.h"
#include "base/uuid.h"
#include "chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h"
#include "base/files/file_util.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/posix/eintr_wrapper.h"
#include "base/strings/string_number_conversions.h"
#include "base/threading/platform_thread.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"

// Same private platform SPI already used by base/process/launch_mac.cc.
extern "C" int responsibility_spawnattrs_setdisclaim(posix_spawnattr_t,int);

namespace extensions {
namespace {
std::optional<base::DictValue> Request(const base::DictValue& request) {
  std::string bytes;
  if (!base::JSONWriter::Write(request,&bytes) || bytes.empty() || bytes.size()>8192)
    return std::nullopt;
  aux::peer::DaemonAuthorityReply reply;
  const auto deadline=base::TimeTicks::Now()+base::Seconds(4);
  do {
    reply=aux::peer::ExchangeNativeSelectedHostFrame(
        std::span(reinterpret_cast<const uint8_t*>(bytes.data()),bytes.size()));
    if(reply.status==aux::peer::DaemonAuthorityStatus::ready)break;
    if(reply.status!=aux::peer::DaemonAuthorityStatus::busy&&
        reply.status!=aux::peer::DaemonAuthorityStatus::pending&&
        reply.status!=aux::peer::DaemonAuthorityStatus::timedOut)return std::nullopt;
    // Re-observe this exact nonce/sequence/body. The authenticated backend
    // caches completion; this does not repeat a physical journal operation.
    base::PlatformThread::Sleep(base::Milliseconds(5));
  }while(base::TimeTicks::Now()<deadline);
  if(reply.status!=aux::peer::DaemonAuthorityStatus::ready || reply.payload.empty())
    return std::nullopt;
  auto object=base::JSONReader::ReadDict(std::string(reply.payload.begin(),reply.payload.end()),
                                      base::JSON_PARSE_RFC);
  return object;
}
bool LeaseId(const std::string& value) {
  if(value.size()!=36)return false;
  for(size_t index=0;index<value.size();++index) {
    if(index==8||index==13||index==18||index==23) {if(value[index]!='-')return false;}
    else if(!((value[index]>='0'&&value[index]<='9')||(value[index]>='a'&&value[index]<='f')))return false;
  }
  return true;
}
}
AuxNativeHostLease::AuxNativeHostLease():owner_(getpid()) {}
AuxNativeHostLease::~AuxNativeHostLease()=default;
std::optional<std::string> AuxNativeHostLease::CaptureProfileBinding(
    const base::FilePath& path,const std::string& profile_id,int account_id) {
  base::DictValue request;request.Set("phase","capture");request.Set("profilePath",path.value());
  request.Set("profileId",profile_id);request.Set("accountId",base::NumberToString(account_id));
  request.Set("captureNonce",base::Uuid::GenerateRandomV4().AsLowercaseString());
  auto reply=Request(request);if(!reply||reply->size()!=5)return std::nullopt;
  return base::WriteJson(*reply);
}
std::shared_ptr<AuxNativeHostLease> AuxNativeHostLease::Prepare(
    std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,const std::string& extension_origin,
    const std::string& host_name,const base::FilePath& image,bool& durable_attempted) {
  durable_attempted=false;
  if(!profile_owner||!profile_owner->current()||!profile_owner->profile_path().IsAbsolute()||!image.IsAbsolute())return {};
  base::FilePath canonical;
  if(!base::NormalizeFilePath(image,&canonical)||canonical!=image)return {};
  auto lease=std::shared_ptr<AuxNativeHostLease>(new AuxNativeHostLease);
  lease->image_=image;lease->profile_owner_=std::move(profile_owner);
  lease->image_fd_.reset(HANDLE_EINTR(open(image.value().c_str(),O_RDONLY|O_CLOEXEC|O_NOFOLLOW|O_NONBLOCK)));
  struct stat before{};
  if(!lease->image_fd_.is_valid()||fstat(lease->image_fd_.get(),&before)||!S_ISREG(before.st_mode)||
      !(before.st_mode&0111)||(before.st_mode&0022)||before.st_size<4||before.st_size>128*1024*1024)
    return {};
  std::array<uint8_t,4> magic{};
  if(pread(lease->image_fd_.get(),magic.data(),magic.size(),0)!=4)return {};
  // Scripts/interpreter chains cannot satisfy this one-image no-exec contract.
  const bool macho=(magic==std::array<uint8_t,4>{0xcf,0xfa,0xed,0xfe})||
      (magic==std::array<uint8_t,4>{0xce,0xfa,0xed,0xfe})||
      (magic==std::array<uint8_t,4>{0xca,0xfe,0xba,0xbe})||
      (magic==std::array<uint8_t,4>{0xca,0xfe,0xba,0xbf});
  if(!macho)return {};
  CC_SHA256_CTX digest;CC_SHA256_Init(&digest);
  std::array<uint8_t,16384> block{};off_t offset=0;
  while(offset<before.st_size) {
    const auto count=HANDLE_EINTR(pread(lease->image_fd_.get(),block.data(),
        std::min<off_t>(block.size(),before.st_size-offset),offset));
    if(count<=0)return {};
    CC_SHA256_Update(&digest,block.data(),static_cast<CC_LONG>(count));offset+=count;
  }
  std::array<uint8_t,CC_SHA256_DIGEST_LENGTH> hash{};CC_SHA256_Final(hash.data(),&digest);
  lease->image_sha256_=base::HexEncodeLower(hash);
  lease->image_device_=before.st_dev;lease->image_inode_=before.st_ino;lease->image_size_=before.st_size;
  lease->image_mtime_seconds_=before.st_mtimespec.tv_sec;lease->image_mtime_nanos_=before.st_mtimespec.tv_nsec;
  if(!lease->ImageCurrent())return {};
  base::DictValue request;
  request.Set("phase","prepare");request.Set("profilePath",lease->profile_owner_->profile_path().value());
  auto binding=base::JSONReader::ReadDict(lease->profile_owner_->binding(),base::JSON_PARSE_RFC);
  if(!binding||!lease->profile_owner_->current())return {};
  request.Set("binding",std::move(*binding));
  request.Set("intentId",base::Uuid::GenerateRandomV4().AsLowercaseString());
  request.Set("extensionOrigin",extension_origin);request.Set("hostName",host_name);
  request.Set("imageSha256",lease->image_sha256_);
  durable_attempted=true;
  auto reply=Request(request);
  if(!reply)return {};
  if(reply->size()==1&&reply->FindBool("noIntent").value_or(false)){durable_attempted=false;return {};}
  const auto* id=reply->FindString("leaseId");const auto* control=reply->FindString("controlRoot");
  const auto* task=reply->FindString("taskRoot");
  if(reply->size()!=3||!id||!LeaseId(*id)||!control||!task||*control==*task||
      !base::FilePath(*control).IsAbsolute()||!base::FilePath(*task).IsAbsolute()||
      *control=="/"||*task=="/")return {};
  lease->lease_id_=*id;lease->control_root_=*control;lease->task_root_=*task;
  return lease;
}
bool AuxNativeHostLease::ImageCurrent() const {
  struct stat held{},named{};
  return getpid()==owner_&&image_fd_.is_valid()&&fstat(image_fd_.get(),&held)==0&&
      lstat(image_.value().c_str(),&named)==0&&S_ISREG(held.st_mode)&&
      !(held.st_mode&0022)&&(held.st_mode&0111)&&
      uint64_t(held.st_dev)==image_device_&&uint64_t(held.st_ino)==image_inode_&&
      uint64_t(held.st_size)==image_size_&&held.st_mtimespec.tv_sec==image_mtime_seconds_&&
      held.st_mtimespec.tv_nsec==image_mtime_nanos_&&named.st_dev==held.st_dev&&named.st_ino==held.st_ino;
}
bool AuxNativeHostLease::Exchange(const std::string& phase,pid_t pid,int status,int error) {
  base::DictValue request;request.Set("phase",phase);request.Set("leaseId",lease_id_);
  request.Set("pid",base::NumberToString(pid));
  if(phase=="terminal") {
    request.Set("waitStatus",base::NumberToString(status));
    request.Set("spawnError",base::NumberToString(error));
  }
  auto reply=Request(request);const auto* id=reply?reply->FindString("leaseId"):nullptr;
  return reply&&reply->size()==1&&id&&*id==lease_id_;
}
base::Process AuxNativeHostLease::Launch(const base::CommandLine& restricted,
                                        const base::LaunchOptions& options) {
  std::vector<std::string> arguments=restricted.argv();
  auto policy=std::find(arguments.begin(),arguments.end(),"-p");
  if(restricted.GetProgram()!=base::FilePath("/usr/bin/sandbox-exec")||
      policy==arguments.end()||std::next(policy)==arguments.end()||!ImageCurrent()) {
    {std::lock_guard<std::mutex> lock(mutex_);spawn_attempted_=true;spawn_error_=EINVAL;}
    return base::Process();
  }
  auto& rules=*std::next(policy);
  rules+="\n(deny process-fork)\n(deny process-exec (require-not (literal (param \"AUX_HOST_IMAGE\"))))\n"
      "(deny file-read* file-write* file-link (subpath (param \"AUX_HOST_CONTROL\")) (subpath (param \"AUX_HOST_TASK\")))\n"
      "(deny file-read* (subpath (param \"AUX_DATA_ROOT\")) (subpath (param \"AUX_CACHE_ROOT\")))\n";
  std::vector<std::string> parameters{"-D","AUX_HOST_IMAGE="+image_.value(),
      "-D","AUX_HOST_CONTROL="+control_root_,"-D","AUX_HOST_TASK="+task_root_};
  size_t parent_index=0;
  for(auto root:{base::FilePath(control_root_),base::FilePath(task_root_)}) {
    for(auto parent=root.DirName();parent!=parent.DirName();parent=parent.DirName()) {
      const auto key="AUX_HOST_PARENT_"+base::NumberToString(parent_index++);
      parameters.emplace_back("-D");parameters.emplace_back(key+"="+parent.value());
      rules+="(deny file-write-unlink (literal (param \""+key+"\")))\n";
    }
  }
  const auto policy_index=std::distance(arguments.begin(),policy);
  arguments.insert(arguments.begin()+policy_index,parameters.begin(),parameters.end());
  auto environment=base::Environment::Create();
  std::vector<std::string> values{"PATH=/usr/bin:/bin:/usr/sbin:/sbin"};
  const std::array<base::cstring_view,4> names{"HOME","USER","LOGNAME","TMPDIR"};
  for(auto key:names) {
    auto value=environment->GetVar(key);
    if(value)values.emplace_back(std::string(key.c_str())+"="+*value);
  }
  std::vector<char*> argv,envp;
  for(auto& arg:arguments)argv.push_back(arg.data());argv.push_back(nullptr);
  for(auto& value:values)envp.push_back(value.data());envp.push_back(nullptr);
  posix_spawn_file_actions_t actions;posix_spawnattr_t attributes;
  int error=posix_spawn_file_actions_init(&actions);
  if(error) {std::lock_guard<std::mutex> lock(mutex_);spawn_attempted_=true;spawn_error_=error;return base::Process();}
  error=posix_spawnattr_init(&attributes);
  if(error) {posix_spawn_file_actions_destroy(&actions);std::lock_guard<std::mutex> lock(mutex_);spawn_attempted_=true;spawn_error_=error;return base::Process();}
  uint32_t destinations=0;
  for(const auto& [source,destination]:options.fds_to_remap) {
    if(source<3||destination<0||destination>2||(destinations&(1u<<destination))) {error=EINVAL;break;}
    destinations|=1u<<destination;
    error=posix_spawn_file_actions_adddup2(&actions,source,destination);if(error)break;
  }
  if(!error&&destinations!=7)error=EINVAL;
  if(!error)error=posix_spawn_file_actions_addchdir_np(&actions,options.current_directory.value().c_str());
  if(!error)error=posix_spawnattr_setflags(&attributes,POSIX_SPAWN_CLOEXEC_DEFAULT|POSIX_SPAWN_START_SUSPENDED);
  if(!error)error=responsibility_spawnattrs_setdisclaim(attributes,1);
  pid_t pid=-1;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if(spawn_attempted_||cancelled_||getpid()!=owner_||!ImageCurrent()||!profile_owner_->current())error=ECANCELED;
    spawn_attempted_=true;
    if(!error)error=posix_spawn(&pid,"/usr/bin/sandbox-exec",&actions,&attributes,argv.data(),envp.data());
    spawn_error_=error;
    if(!error)child_=pid;
  }
  posix_spawnattr_destroy(&attributes);posix_spawn_file_actions_destroy(&actions);
  if(error)return base::Process();
  base::Process process(pid);birth_=process.CreationTime();
  if(!birth_.is_null()&&Exchange("publish",pid,0,0)&&ImageCurrent()) {
    std::lock_guard<std::mutex> lock(mutex_);
    if(!cancelled_&&profile_owner_->current()&&kill(pid,SIGCONT)==0)return process;
  }
  // A real original child exists even when publication/resume failed.
  Reap(std::move(process));return base::Process();
}
void AuxNativeHostLease::ObservePipeClosed(uint32_t mask) {
  {std::lock_guard<std::mutex> lock(mutex_);closed_pipes_|=mask&3;}
  SettleIfPhysical();
}
void AuxNativeHostLease::Reap(base::Process process) {
  const auto pid=process.Pid();
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if(getpid()!=owner_||pid!=child_||reaped_){unknown_=true;return;}
    if(birth_.is_null())unknown_=true;
    else if(process.CreationTime()!=birth_){unknown_=true;return;}
  }
  int status=0;pid_t waited=HANDLE_EINTR(waitpid(pid,&status,WNOHANG));
  if(waited==0) {
    // This is the sole original reaper. A still-waitable child cannot have a
    // reused PID; no detached fallback reaper or process-group guess exists.
    if(kill(pid,SIGTERM)==0) {
      const auto deadline=base::TimeTicks::Now()+base::Seconds(2);
      while(waited==0&&base::TimeTicks::Now()<deadline) {
        base::PlatformThread::Sleep(base::Milliseconds(10));
        waited=HANDLE_EINTR(waitpid(pid,&status,WNOHANG));
      }
    }
    if(waited==0) {kill(pid,SIGKILL);waited=HANDLE_EINTR(waitpid(pid,&status,0));}
  }
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if(waited!=pid||(!WIFEXITED(status)&&!WIFSIGNALED(status)))unknown_=true;
    else{reaped_=true;raw_wait_status_=status;}
  }
  SettleIfPhysical();
}
void AuxNativeHostLease::SettleIfPhysical() {
  pid_t pid=0;int status=0,error=0;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if(getpid()!=owner_||unknown_||settled_||terminal_in_flight_||closed_pipes_!=3||!spawn_attempted_)return;
    if(child_>1&&!reaped_)return;
    if(child_>1){pid=child_;status=raw_wait_status_;}else error=spawn_error_;
    if(pid==0&&error<=0){unknown_=true;return;}
    terminal_in_flight_=true;
  }
  const bool accepted=Exchange("terminal",pid,status,error);
  std::lock_guard<std::mutex> lock(mutex_);
  terminal_in_flight_=false;settled_=accepted;unknown_|=!accepted;
}
bool AuxNativeHostLease::MatchesLeaseBytes(std::span<const uint8_t,16> lease) const {
  const auto hex=base::HexEncodeLower(lease);
  return lease_id_==hex.substr(0,8)+"-"+hex.substr(8,4)+"-"+hex.substr(12,4)+"-"+hex.substr(16,4)+"-"+hex.substr(20);
}
void AuxNativeHostLease::Cancel() {std::lock_guard<std::mutex> lock(mutex_);cancelled_=true;}
aux::browser_custody::Result AuxNativeHostLease::Inspect() const {
  std::lock_guard<std::mutex> lock(mutex_);
  if(getpid()!=owner_||unknown_)return aux::browser_custody::Result::kUnknown;
  return settled_?aux::browser_custody::Result::kSettled:aux::browser_custody::Result::kPending;
}
}

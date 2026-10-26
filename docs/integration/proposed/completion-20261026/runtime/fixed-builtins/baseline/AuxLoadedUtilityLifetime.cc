#include "AuxLoadedUtilityLifetime.h"
#include <CommonCrypto/CommonDigest.h>
#include <mach-o/dyld.h>
#include <dlfcn.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <array>
#include <filesystem>
#include <limits>
#include <vector>
#include <unordered_map>

namespace {
const pid_t kConsumerProcess=getpid();
constexpr char kCurrent[]="7aff7611505145a5629cf42496be506200e7c1026087b2e397057e646d220e5e";
struct Image {std::string path;const void* base;};
struct Quarantine {
  std::mutex mutex;
  std::unordered_map<const AuxLoadedUtilityLifetime*,std::shared_ptr<AuxLoadedUtilityLifetime>> images;
};
Quarantine& Retained(){static auto* registry=new Quarantine;return *registry;}
void Keep(const std::shared_ptr<AuxLoadedUtilityLifetime>& image){std::lock_guard lock(Retained().mutex);Retained().images.emplace(image.get(),image);}
void Release(const AuxLoadedUtilityLifetime* image){std::lock_guard lock(Retained().mutex);Retained().images.erase(image);}

bool System(const std::string& path) {return path.starts_with("/System/Library/")||path.starts_with("/usr/lib/");}
std::optional<std::string> Canonical(const char* path) {
  char* raw=realpath(path,nullptr);if(!raw)return {};std::string result(raw);free(raw);return result;
}
std::optional<std::vector<Image>> Images() {
  const auto count=_dyld_image_count();if(!count||count>4096)return {};
  std::vector<Image> result;std::set<std::string> seen;
  for(uint32_t i=0;i<count;++i){const auto* name=_dyld_get_image_name(i);if(!name)return {};std::string path(name);if(System(path))continue;
    auto canonical=Canonical(name);if(!canonical||*canonical!=path||!seen.insert(path).second)return {};
    result.push_back({path,_dyld_get_image_header(i)});
  }
  if(count!=_dyld_image_count())return {};return result;
}
std::set<std::string> Paths(const std::vector<Image>& images){std::set<std::string> paths;for(const auto& i:images)paths.insert(i.path);return paths;}
std::optional<std::string> ExpectedPath() {
  uint32_t count=0;_NSGetExecutablePath(nullptr,&count);if(!count||count>65536)return {};
  std::vector<char> buffer(count);if(_NSGetExecutablePath(buffer.data(),&count))return {};
  auto executable=Canonical(buffer.data());if(!executable)return {};
  auto macos=std::filesystem::path(*executable).parent_path();
  if(macos.filename()!="MacOS"||macos.parent_path().filename()!="Contents"||macos.parent_path().parent_path().extension()!=".app")return {};
  return (macos.parent_path()/"Resources/native/aux-macos-utilities.node").string();
}
std::optional<std::pair<std::string,size_t>> Hash(const std::string& path) {
  int fd=open(path.c_str(),O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC);if(fd<0)return {};
  struct stat before{},after{},entry{};std::optional<std::pair<std::string,size_t>> result;
  if(!fstat(fd,&before)&&S_ISREG(before.st_mode)&&before.st_uid==geteuid()&&before.st_nlink==1&&!(before.st_mode&0022)&&
      before.st_size==393720) {
    std::vector<unsigned char> bytes(static_cast<size_t>(before.st_size));size_t offset=0;
    while(offset<bytes.size()){auto amount=read(fd,bytes.data()+offset,bytes.size()-offset);if(amount<0&&errno==EINTR)continue;if(amount<=0)break;offset+=amount;}
    unsigned char extra;auto tail=read(fd,&extra,1);
    if(offset==bytes.size()&&tail==0&&!fstat(fd,&after)&&!lstat(path.c_str(),&entry)&&
      before.st_dev==after.st_dev&&before.st_ino==after.st_ino&&before.st_mode==after.st_mode&&before.st_uid==after.st_uid&&before.st_nlink==after.st_nlink&&before.st_size==after.st_size&&
      before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec&&before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec&&before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec&&before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec&&entry.st_dev==after.st_dev&&entry.st_ino==after.st_ino) {
      std::array<unsigned char,CC_SHA256_DIGEST_LENGTH> digest{};CC_SHA256(bytes.data(),static_cast<CC_LONG>(bytes.size()),digest.data());
      std::string text;constexpr char hex[]="0123456789abcdef";for(auto b:digest){text+=hex[b>>4];text+=hex[b&15];}result=std::pair(text,bytes.size());
    }
  }
  close(fd);return result;
}
bool OwnSymbol(void* symbol,const Image& image){Dl_info info{};return symbol&&dladdr(symbol,&info)&&info.dli_fname&&image.path==info.dli_fname&&info.dli_fbase==image.base;}
}
AuxLoadedUtilityLifetime::AuxLoadedUtilityLifetime():process_(kConsumerProcess){}
AuxLoadedUtilityLifetime::~AuxLoadedUtilityLifetime(){
  // The NOLOAD reference is intentionally process-retained. A host destructor
  // is not proof that pending/untracked image operations finished; never unload
  // code behind outstanding callbacks or manufacture teardown by dlclose.
}
std::shared_ptr<AuxLoadedUtilityLifetime> AuxLoadedUtilityLifetime::CaptureAfterAuthenticatedOwner(){auto value=std::shared_ptr<AuxLoadedUtilityLifetime>(new AuxLoadedUtilityLifetime);value->Capture();return value;}
void AuxLoadedUtilityLifetime::Capture(){
  if(getpid()!=kConsumerProcess)return;
  const auto images=Images();if(!images)return;images_=Paths(*images);
  std::vector<Image> candidates;for(const auto& image:*images)if(std::filesystem::path(image.path).filename()=="aux-macos-utilities.node")candidates.push_back(image);
  if(candidates.empty()){kind_=AuxUtilityHostCapture::absent;return;}
  auto expected=ExpectedPath();if(candidates.size()!=1||!expected||candidates[0].path!=*expected)return;
  auto hash=Hash(*expected);if(!hash)return;
  const bool current=hash->first==kCurrent&&hash->second==393720;
  if(!current)return;
  image_=dlopen(expected->c_str(),RTLD_NOLOAD|RTLD_LOCAL|RTLD_NOW);if(!image_)return;
  auto after=Images();if(!after||Paths(*after)!=images_)return;
  auto* close=dlsym(image_,"AuxMacUtilityCloseAdmissionAndDrain");auto* pending=dlsym(image_,"AuxMacUtilityPendingEnvironments");
  if(!OwnSymbol(close,candidates[0])||!OwnSymbol(pending,candidates[0]))return;
  close_=reinterpret_cast<int32_t(*)()>(close);pending_=reinterpret_cast<uint64_t(*)()>(pending);
  // The current module binds its PID at image load. Observe its actual native
  // pending state now; wrong-process remains refusal, never a new identity.
  if(pending_()==std::numeric_limits<uint64_t>::max())return;
  kind_=AuxUtilityHostCapture::current;
}
size_t AuxLoadedUtilityLifetime::RetainedUnresolvedImages(){if(getpid()!=kConsumerProcess)return std::numeric_limits<size_t>::max();std::lock_guard lock(Retained().mutex);return Retained().images.size();}
AuxUtilityHostDrain AuxLoadedUtilityLifetime::CloseAndDrain(){
  if(getpid()!=process_)return AuxUtilityHostDrain::wrongProcess;
  {std::lock_guard lock(mutex_);closure_started_=true;}
  auto finish=[&](AuxUtilityHostDrain result){
    if(result==AuxUtilityHostDrain::pending||result==AuxUtilityHostDrain::untracked)Keep(shared_from_this());
    else if(result==AuxUtilityHostDrain::drained||result==AuxUtilityHostDrain::notPresent)Release(this);
    return result;
  };
  const auto images=Images();if(!images||Paths(*images)!=images_)return finish(AuxUtilityHostDrain::untracked);
  if(kind_==AuxUtilityHostCapture::absent)return finish(AuxUtilityHostDrain::notPresent);
  if(kind_!=AuxUtilityHostCapture::current)return finish(AuxUtilityHostDrain::untracked);
  const auto closed=close_();const auto pending=pending_();
  if(closed<0||pending==std::numeric_limits<uint64_t>::max())return finish(AuxUtilityHostDrain::wrongProcess);
  if(closed==2)return finish(AuxUtilityHostDrain::untracked);
  if(closed==0&&pending==0)return finish(AuxUtilityHostDrain::drained);
  if(closed==1)return finish(AuxUtilityHostDrain::pending);
  return finish(AuxUtilityHostDrain::untracked);
}
std::optional<AuxUtilityHostDrain> AuxLoadedUtilityLifetime::InspectIfClosureStarted(){
  if(getpid()!=process_)return AuxUtilityHostDrain::wrongProcess;
  {std::lock_guard lock(mutex_);if(!closure_started_){
    if(kind_!=AuxUtilityHostCapture::refusedImage)return {};
    Keep(shared_from_this());return AuxUtilityHostDrain::untracked;
  }}
  return CloseAndDrain();
}

AuxUtilityHostDrain AuxLoadedUtilityLifetime::InspectRetainedClosures(){
 if(getpid()!=kConsumerProcess)return AuxUtilityHostDrain::wrongProcess;
 std::vector<std::shared_ptr<AuxLoadedUtilityLifetime>> images;
 {std::lock_guard lock(Retained().mutex);for(const auto& entry:Retained().images)images.push_back(entry.second);}
 auto result=AuxUtilityHostDrain::drained;
 for(const auto& image:images){auto status=image->InspectIfClosureStarted();
  if(!status)continue;
  if(*status==AuxUtilityHostDrain::wrongProcess)result=*status;
  else if(*status==AuxUtilityHostDrain::untracked&&result!=AuxUtilityHostDrain::wrongProcess)result=*status;
  else if(*status==AuxUtilityHostDrain::pending&&result==AuxUtilityHostDrain::drained)result=*status;
 }
 return result;
}

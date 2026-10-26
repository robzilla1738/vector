#include "AuxLoadedPdfLifetime.h"
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
constexpr char kCurrent[]="ed5b4faec15d3fc3c29a97f0dd304b388844cf0bf16fad5a69a62b357a52dcc0";
constexpr char kLegacy[]="6febb242a074317dba3edc1848fdfb77da468e32bb87acffdaa7f6143afece8e";
struct Image {std::string path;const void* base;};
struct Quarantine {
  std::mutex mutex;
  std::unordered_map<const AuxLoadedPdfLifetime*,std::shared_ptr<AuxLoadedPdfLifetime>> images;
};
Quarantine& Retained(){static auto* registry=new Quarantine;return *registry;}
void Keep(const std::shared_ptr<AuxLoadedPdfLifetime>& image){std::lock_guard lock(Retained().mutex);Retained().images.emplace(image.get(),image);}
void Release(const AuxLoadedPdfLifetime* image){std::lock_guard lock(Retained().mutex);Retained().images.erase(image);}

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
  return (macos.parent_path()/"Resources/native/aux-pdf.node").string();
}
std::optional<std::pair<std::string,size_t>> Hash(const std::string& path) {
  int fd=open(path.c_str(),O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC);if(fd<0)return {};
  struct stat before{},after{},entry{};std::optional<std::pair<std::string,size_t>> result;
  if(!fstat(fd,&before)&&S_ISREG(before.st_mode)&&before.st_uid==geteuid()&&before.st_nlink==1&&!(before.st_mode&0022)&&
      (before.st_size==9474752||before.st_size==9457632)) {
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
AuxLoadedPdfLifetime::AuxLoadedPdfLifetime():process_(getpid()){}
AuxLoadedPdfLifetime::~AuxLoadedPdfLifetime(){
  // The NOLOAD reference is intentionally process-retained. A host destructor
  // is not proof that pending/untracked image operations finished; never unload
  // code behind outstanding callbacks or manufacture teardown by dlclose.
}
std::shared_ptr<AuxLoadedPdfLifetime> AuxLoadedPdfLifetime::CaptureAfterAuthenticatedOwner(){auto value=std::shared_ptr<AuxLoadedPdfLifetime>(new AuxLoadedPdfLifetime);value->Capture();return value;}
void AuxLoadedPdfLifetime::Capture(){
  const auto images=Images();if(!images)return;images_=Paths(*images);
  std::vector<Image> candidates;for(const auto& image:*images)if(std::filesystem::path(image.path).filename()=="aux-pdf.node")candidates.push_back(image);
  if(candidates.empty()){kind_=AuxPdfHostCapture::absent;return;}
  auto expected=ExpectedPath();if(candidates.size()!=1||!expected||candidates[0].path!=*expected)return;
  auto hash=Hash(*expected);if(!hash)return;
  const bool current=hash->first==kCurrent&&hash->second==9474752;
  const bool legacy=hash->first==kLegacy&&hash->second==9457632;if(!current&&!legacy)return;
  image_=dlopen(expected->c_str(),RTLD_NOLOAD|RTLD_LOCAL|RTLD_NOW);if(!image_)return;
  auto after=Images();if(!after||Paths(*after)!=images_)return;
  if(legacy){kind_=AuxPdfHostCapture::legacy;return;} // Old v2 ABI has no lifetime exports.
  auto* close=dlsym(image_,"AuxPdfCloseAdmissionAndDrain");auto* pending=dlsym(image_,"AuxPdfPendingOperations");
  if(!OwnSymbol(close,candidates[0])||!OwnSymbol(pending,candidates[0]))return;
  close_=reinterpret_cast<int32_t(*)()>(close);pending_=reinterpret_cast<uint64_t(*)()>(pending);
  // The module currently initializes its PID lazily. Observe its actual native
  // count now to bind that state in this captured parent, before any later fork.
  // This does NOT prove refusal for a fork occurring before this capture.
  if(pending_()==std::numeric_limits<uint64_t>::max())return;
  kind_=AuxPdfHostCapture::current;
}
size_t AuxLoadedPdfLifetime::RetainedUnresolvedImages(){std::lock_guard lock(Retained().mutex);return Retained().images.size();}
AuxPdfHostDrain AuxLoadedPdfLifetime::CloseAndDrain(){
  if(getpid()!=process_)return AuxPdfHostDrain::wrongProcess;
  {std::lock_guard lock(mutex_);closure_started_=true;}
  auto finish=[&](AuxPdfHostDrain result){
    if(result==AuxPdfHostDrain::pending||result==AuxPdfHostDrain::untracked)Keep(shared_from_this());
    else if(result==AuxPdfHostDrain::drained||result==AuxPdfHostDrain::notPresent)Release(this);
    return result;
  };
  const auto images=Images();if(!images||Paths(*images)!=images_)return finish(AuxPdfHostDrain::untracked);
  if(kind_==AuxPdfHostCapture::absent)return finish(AuxPdfHostDrain::notPresent);
  if(kind_!=AuxPdfHostCapture::current)return finish(AuxPdfHostDrain::untracked);
  const auto closed=close_();const auto pending=pending_();
  if(closed<0||pending==std::numeric_limits<uint64_t>::max())return finish(AuxPdfHostDrain::wrongProcess);
  if(closed==0&&pending==0)return finish(AuxPdfHostDrain::drained);
  if(closed==1)return finish(AuxPdfHostDrain::pending);
  return finish(AuxPdfHostDrain::untracked);
}
std::optional<AuxPdfHostDrain> AuxLoadedPdfLifetime::InspectIfClosureStarted(){
  if(getpid()!=process_)return AuxPdfHostDrain::wrongProcess;
  {std::lock_guard lock(mutex_);if(!closure_started_){
    if(kind_!=AuxPdfHostCapture::refusedImage)return {};
    Keep(shared_from_this());return AuxPdfHostDrain::untracked;
  }}
  return CloseAndDrain();
}

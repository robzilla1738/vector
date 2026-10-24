// Signature/leaf/CDHash inspection ported from the actual reviewed native parent.
#include "AuxCliSealedImages.h"
#include <CommonCrypto/CommonDigest.h>
#include <bsm/libbsm.h>
#include <libproc.h>
#include <sys/proc_info.h>
#include <unistd.h>
#include <array>
#include <climits>
#include <cstdlib>
#include <cstring>
#include <optional>
#include <fcntl.h>
#include <sys/acl.h>
#include <sys/stat.h>
namespace aux::cli {
namespace {
template<class T> class Cf {
 public:
  Cf()=default; explicit Cf(T value):value_(value){}
  ~Cf(){if(value_)CFRelease(value_);}
  Cf(Cf&& other)noexcept:value_(other.value_){other.value_=nullptr;}
  Cf& operator=(Cf&& other)noexcept{if(this!=&other){if(value_)CFRelease(value_);value_=other.value_;other.value_=nullptr;}return *this;}
  Cf(const Cf&)=delete;Cf& operator=(const Cf&)=delete;
  T get()const{return value_;}explicit operator bool()const{return value_!=nullptr;}
  T* InitializeInto(){return &value_;}
 private:T value_=nullptr;
};
constexpr char kTeam[] = "9F2JXY8TCK";
constexpr std::array<uint8_t, 32> kCertificate = {
    0xff,0x02,0x93,0xa0,0x6f,0x20,0x70,0x4a,0x1f,0x3b,0x3f,0x25,0x71,0xb3,0x36,0x2e,
    0xf4,0x39,0xa2,0xdf,0xb3,0xb0,0xbc,0x90,0xbc,0xf3,0xd5,0xde,0xbf,0xc7,0x3a,0x1c};
constexpr char kDaemonSuffix[] = "/Contents/Resources/aux/apps/daemon/Aux Daemon.app";
constexpr SecCSFlags kStrict = kSecCSStrictValidate | kSecCSCheckAllArchitectures |
    kSecCSCheckNestedCode | kSecCSRestrictSymlinks | (1U << 29);
CFTypeRef Value(CFDictionaryRef dictionary, CFStringRef key, CFTypeID type) {
  auto* const value = CFDictionaryGetValue(dictionary, key);
  return value && CFGetTypeID(value) == type ? value : nullptr;
}
std::optional<std::string> Text(CFTypeRef value) {
  if (!value || CFGetTypeID(value) != CFStringGetTypeID()) return std::nullopt;
  std::array<char, PATH_MAX> text{};
  if (!CFStringGetCString(static_cast<CFStringRef>(value), text.data(), text.size(), kCFStringEncodingUTF8))
    return std::nullopt;
  return std::string(text.data());
}
std::optional<std::string> Path(CFURLRef url) {
  std::array<UInt8, PATH_MAX> bytes{};
  if (!CFURLGetFileSystemRepresentation(url, true, bytes.data(), bytes.size())) return std::nullopt;
  const auto path = std::string(reinterpret_cast<char*>(bytes.data()));
  std::array<char, PATH_MAX> physical{};
  if (!realpath(path.c_str(), physical.data()) || path != physical.data()) return std::nullopt;
  return path;
}
Cf<SecRequirementRef> Requirement(const char* identifier) {
  const auto text = std::string("anchor apple generic and identifier \"") + identifier +
      "\" and certificate leaf[subject.OU] = \"" + kTeam + "\"";
  Cf<CFStringRef> string(CFStringCreateWithCString(
      kCFAllocatorDefault, text.c_str(), kCFStringEncodingUTF8));
  Cf<SecRequirementRef> requirement;
  if (!string || SecRequirementCreateWithString(string.get(), kSecCSDefaultFlags,
                                                requirement.InitializeInto()) != errSecSuccess)
    return Cf<SecRequirementRef>();
  return requirement;
}
struct Image {
  std::string bundle;
  std::string executable;
  std::vector<uint8_t> cd_hash;
};
std::optional<Image> InspectImage(SecStaticCodeRef code, SecRequirementRef requirement,
                                  const char* identifier, const char* executable) {
  if (SecStaticCodeCheckValidity(code, kStrict, requirement) != errSecSuccess) return std::nullopt;
  Cf<CFDictionaryRef> info;
  if (SecCodeCopySigningInformation(code, kSecCSSigningInformation,
                                    info.InitializeInto()) != errSecSuccess || !info) return std::nullopt;
  if (Text(Value(info.get(), kSecCodeInfoIdentifier, CFStringGetTypeID())) != identifier ||
      Text(Value(info.get(), kSecCodeInfoTeamIdentifier, CFStringGetTypeID())) != kTeam) return std::nullopt;
  auto certificates = static_cast<CFArrayRef>(Value(info.get(), kSecCodeInfoCertificates, CFArrayGetTypeID()));
  if (!certificates || CFArrayGetCount(certificates) < 1) return std::nullopt;
  auto leaf = static_cast<SecCertificateRef>(const_cast<void*>(CFArrayGetValueAtIndex(certificates, 0)));
  if (!leaf || CFGetTypeID(leaf) != SecCertificateGetTypeID()) return std::nullopt;
  Cf<CFDataRef> certificate(SecCertificateCopyData(leaf));
  if (!certificate || CFDataGetLength(certificate.get()) <= 0 || CFDataGetLength(certificate.get()) > 65'536)
    return std::nullopt;
  std::array<uint8_t, 32> digest{};
  CC_SHA256(CFDataGetBytePtr(certificate.get()), static_cast<CC_LONG>(CFDataGetLength(certificate.get())), digest.data());
  if (digest != kCertificate) return std::nullopt;
  auto flags = static_cast<CFNumberRef>(Value(info.get(), kSecCodeInfoFlags, CFNumberGetTypeID()));
  uint32_t flag_bits = 0;
  if (!flags || !CFNumberGetValue(flags, kCFNumberSInt32Type, &flag_bits) || (flag_bits & 0x2)) return std::nullopt;
  auto plist = static_cast<CFDictionaryRef>(Value(info.get(), kSecCodeInfoPList, CFDictionaryGetTypeID()));
  if (!plist || Text(Value(plist, CFSTR("CFBundlePackageType"), CFStringGetTypeID())) != "APPL" ||
      Text(Value(plist, CFSTR("CFBundleIdentifier"), CFStringGetTypeID())) != identifier) return std::nullopt;
  const auto leaf_name = Text(Value(plist, CFSTR("CFBundleExecutable"), CFStringGetTypeID()));
  if (!leaf_name || leaf_name->empty() || leaf_name->find('/') != std::string::npos ||
      *leaf_name == "." || *leaf_name == ".." || (executable && *leaf_name != executable)) return std::nullopt;
  Cf<CFURLRef> location;
  if (SecCodeCopyPath(code, kSecCSDefaultFlags, location.InitializeInto()) != errSecSuccess || !location) return std::nullopt;
  auto bundle = Path(location.get());
  auto main = static_cast<CFURLRef>(Value(info.get(), kSecCodeInfoMainExecutable, CFURLGetTypeID()));
  auto main_path = main ? Path(main) : std::nullopt;
  auto hash = static_cast<CFDataRef>(Value(info.get(), kSecCodeInfoUnique, CFDataGetTypeID()));
  if (!bundle || !bundle->ends_with(".app") || !main_path ||
      *main_path != *bundle + "/Contents/MacOS/" + *leaf_name || !hash ||
      (CFDataGetLength(hash) != 20 && CFDataGetLength(hash) != 32)) return std::nullopt;
  // The preceding guard permits only20/32bytes; the copy range and owned
  // destination have exactly that verified CFData length.
  std::vector<uint8_t> captured_hash(static_cast<size_t>(CFDataGetLength(hash)));
  CFDataGetBytes(hash, CFRangeMake(0, CFDataGetLength(hash)), captured_hash.data());
  return Image{*bundle, *main_path, std::move(captured_hash)};
}

std::optional<PeerBirth> Birth(audit_token_t token) {
  if(audit_token_to_euid(token)!=geteuid())return{};
  const auto pid=audit_token_to_pid(token),version=audit_token_to_pidversion(token);
  proc_bsdinfo info{};
  if(pid<=1||version<0||proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&info,sizeof(info))!=sizeof(info)||info.pbi_pid!=static_cast<uint32_t>(pid)||!info.pbi_start_tvsec)return{};
  return PeerBirth{pid,version,info.pbi_start_tvsec,info.pbi_start_tvusec};
}
bool SameBirth(const PeerBirth& a,const PeerBirth& b){return a.pid==b.pid&&a.version==b.version&&a.seconds==b.seconds&&a.microseconds==b.microseconds;}
bool ValidateGuest(audit_token_t token,SecRequirementRef requirement,const std::vector<uint8_t>& hash){
  Cf<CFDataRef> audit(CFDataCreate(kCFAllocatorDefault,reinterpret_cast<const UInt8*>(&token),sizeof(token)));
  if(!audit)return false;const void* key=kSecGuestAttributeAudit;const void* value=audit.get();
  Cf<CFDictionaryRef> attributes(CFDictionaryCreate(kCFAllocatorDefault,&key,&value,1,&kCFTypeDictionaryKeyCallBacks,&kCFTypeDictionaryValueCallBacks));
  Cf<SecCodeRef> guest;
  if(!attributes||SecCodeCopyGuestWithAttributes(nullptr,attributes.get(),kSecCSDefaultFlags,guest.InitializeInto())!=errSecSuccess||!guest||SecCodeCheckValidity(guest.get(),kSecCSStrictValidate|(1U<<29),requirement)!=errSecSuccess)return false;
  Cf<CFDictionaryRef> info;if(SecCodeCopySigningInformation(guest.get(),kSecCSSigningInformation,info.InitializeInto())!=errSecSuccess||!info)return false;
  const auto unique=static_cast<CFDataRef>(Value(info.get(),kSecCodeInfoUnique,CFDataGetTypeID()));
  return unique&&CFDataGetLength(unique)==static_cast<CFIndex>(hash.size())&&std::memcmp(CFDataGetBytePtr(unique),hash.data(),hash.size())==0;
}
}
struct SealedImages::Data {
  const pid_t process=getpid();int role=0;Image own,browser,cli;
  Cf<SecRequirementRef> own_requirement,browser_requirement,cli_requirement;std::string locator;
};
SealedImages::SealedImages(std::unique_ptr<Data> data):data_(std::move(data)){}
SealedImages::~SealedImages()=default;
std::shared_ptr<const SealedImages> SealedImages::Capture(int role){
  if(role<0||role>2)return{};auto data=std::make_unique<Data>();data->role=role;
  data->browser_requirement=Requirement("dev.aux.browser");data->cli_requirement=Requirement("dev.aux.browser.cli");
  data->own_requirement=Requirement(role==0?"dev.aux.browser":role==1?"dev.aux.browser.cli":"dev.aux.browser.daemon");
  if(!data->browser_requirement||!data->cli_requirement||!data->own_requirement)return{};
  Cf<SecCodeRef> dynamic;Cf<SecStaticCodeRef> own;
  if(SecCodeCopySelf(kSecCSDefaultFlags,dynamic.InitializeInto())!=errSecSuccess||!dynamic||SecCodeCheckValidity(dynamic.get(),kSecCSStrictValidate|(1U<<29),data->own_requirement.get())!=errSecSuccess||SecCodeCopyStaticCode(dynamic.get(),kSecCSDefaultFlags,own.InitializeInto())!=errSecSuccess)return{};
  auto image=InspectImage(own.get(),data->own_requirement.get(),role==0?"dev.aux.browser":role==1?"dev.aux.browser.cli":"dev.aux.browser.daemon",role==0?nullptr:role==1?"aux-cli":"aux-daemon");
  if(!image)return{};data->own=*image;
  constexpr char cli_suffix[]="/Contents/Resources/aux/apps/cli/Aux CLI.app";
  std::string outer=image->bundle;
  if(role!=0){const char* suffix=role==1?cli_suffix:kDaemonSuffix;if(!outer.ends_with(suffix))return{};outer.resize(outer.size()-std::strlen(suffix));}
  auto read=[&](const std::string& path,SecRequirementRef requirement,const char* identifier,const char* executable)->std::optional<Image>{
    Cf<CFURLRef> url(CFURLCreateFromFileSystemRepresentation(kCFAllocatorDefault,reinterpret_cast<const UInt8*>(path.data()),path.size(),true));Cf<SecStaticCodeRef> code;
    if(!url||SecStaticCodeCreateWithPath(url.get(),kSecCSDefaultFlags,code.InitializeInto())!=errSecSuccess)return{};
    auto value=InspectImage(code.get(),requirement,identifier,executable);return value&&value->bundle==path?value:std::nullopt;
  };
  auto browser=read(outer,data->browser_requirement.get(),"dev.aux.browser",nullptr);
  auto cli=read(outer+cli_suffix,data->cli_requirement.get(),"dev.aux.browser.cli","aux-cli");
  if(!browser||!cli)return{};data->browser=*browser;data->cli=*cli;
  std::string locator=outer;locator.push_back('\0');locator.append(reinterpret_cast<const char*>(data->browser.cd_hash.data()),data->browser.cd_hash.size());locator.append(reinterpret_cast<const char*>(data->cli.cd_hash.data()),data->cli.cd_hash.size());locator+=std::to_string(geteuid());
  std::array<uint8_t,32> digest{};CC_SHA256(locator.data(),static_cast<CC_LONG>(locator.size()),digest.data());
  data->locator="dev.aux.browser.cli.";constexpr char hex[]="0123456789abcdef";for(const auto byte:digest){data->locator+=hex[byte>>4];data->locator+=hex[byte&15];}
  auto result=std::shared_ptr<const SealedImages>(new SealedImages(std::move(data)));return result->RevalidateSelf()?result:nullptr;
}
std::shared_ptr<const SealedImages> SealedImages::ForCurrentBrowser(){return Capture(0);}
std::shared_ptr<const SealedImages> SealedImages::ForCurrentCli(){return Capture(1);}
std::shared_ptr<const SealedImages> SealedImages::ForCurrentDaemon(){return Capture(2);}
bool SealedImages::RevalidateSelf()const{
  if(getpid()!=data_->process)return false;Cf<SecCodeRef> current;Cf<CFDictionaryRef> info;
  if(SecCodeCopySelf(kSecCSDefaultFlags,current.InitializeInto())!=errSecSuccess||!current||SecCodeCheckValidity(current.get(),kSecCSStrictValidate|(1U<<29),data_->own_requirement.get())!=errSecSuccess||SecCodeCopySigningInformation(current.get(),kSecCSSigningInformation,info.InitializeInto())!=errSecSuccess)return false;
  const auto unique=static_cast<CFDataRef>(Value(info.get(),kSecCodeInfoUnique,CFDataGetTypeID()));return unique&&CFDataGetLength(unique)==static_cast<CFIndex>(data_->own.cd_hash.size())&&std::memcmp(CFDataGetBytePtr(unique),data_->own.cd_hash.data(),data_->own.cd_hash.size())==0;
}
bool SealedImages::ValidateCliLaunchResources()const{
  if(!RevalidateSelf())return false;
  struct Cleanup{std::vector<int> values;~Cleanup(){for(auto it=values.rbegin();it!=values.rend();++it)close(*it);}}cleanup;
  auto& held=cleanup.values;
  auto metadata=[](int fd,bool directory,struct stat* out){
    if(fstat(fd,out)!=0||out->st_uid!=0||(out->st_mode&0022)|| (directory?!S_ISDIR(out->st_mode):(!S_ISREG(out->st_mode)||out->st_nlink!=1||out->st_size<=0||out->st_size>32*1024*1024)))return false;
    errno=0;acl_t acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED);if(!acl)return errno==ENOENT;acl_entry_t entry=nullptr;errno=0;const bool empty=acl_valid(acl)==0&&acl_get_entry(acl,ACL_FIRST_ENTRY,&entry)==-1&&errno==EINVAL&&entry==nullptr;acl_free(acl);return empty;
  };
  int parent=open("/",O_RDONLY|O_DIRECTORY|O_CLOEXEC);if(parent<0)return false;held.push_back(parent);struct stat ignored{};if(!metadata(parent,true,&ignored))return false;
  const std::string path=data_->cli.bundle+"/Contents/Resources/node-development/aux-native-cli-entry.mjs";
  size_t at=1;struct stat initial{};int entry=-1;
  while(at<path.size()){
    const auto end=path.find('/',at);const bool directory=end!=std::string::npos;const auto leaf=path.substr(at,directory?end-at:std::string::npos);
    if(leaf.empty()||leaf=="."||leaf=="..")return false;const int next=openat(parent,leaf.c_str(),O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK|(directory?O_DIRECTORY:0));
    if(next<0)return false;held.push_back(next);struct stat observed{};if(!metadata(next,directory,&observed))return false;
    if(!directory){entry=next;initial=observed;break;}parent=next;at=end+1;
  }
  if(entry<0)return false;std::vector<UInt8> bytes(static_cast<size_t>(initial.st_size));size_t offset=0;
  while(offset<bytes.size()){const auto count=pread(entry,bytes.data()+offset,bytes.size()-offset,offset);if(count<0&&errno==EINTR)continue;if(count<=0)return false;offset+=count;}
  constexpr char prefix[]="#!/usr/bin/env node\n/* aux-owned-cli-entry-v1 */\n";
  if(bytes.size()<sizeof(prefix)-1||std::memcmp(bytes.data(),prefix,sizeof(prefix)-1)!=0)return false;
  Cf<CFURLRef> url(CFURLCreateFromFileSystemRepresentation(kCFAllocatorDefault,reinterpret_cast<const UInt8*>(data_->cli.bundle.data()),data_->cli.bundle.size(),true));Cf<SecStaticCodeRef> code;
  if(!url||SecStaticCodeCreateWithPath(url.get(),kSecCSDefaultFlags,code.InitializeInto())!=errSecSuccess||SecStaticCodeCheckValidity(code.get(),kStrict,data_->cli_requirement.get())!=errSecSuccess)return false;
  Cf<CFDataRef> content(CFDataCreate(kCFAllocatorDefault,bytes.data(),bytes.size()));
  if(!content||SecCodeValidateFileResource(code.get(),CFSTR("Resources/node-development/aux-native-cli-entry.mjs"),content.get(),kSecCSDefaultFlags)!=errSecSuccess)return false;
  struct stat after{},named{};const bool same=metadata(entry,false,&after)&&fstatat(parent,"aux-native-cli-entry.mjs",&named,AT_SYMLINK_NOFOLLOW)==0&&initial.st_dev==after.st_dev&&initial.st_ino==after.st_ino&&initial.st_size==after.st_size&&initial.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec&&initial.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec&&initial.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec&&initial.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec&&named.st_dev==after.st_dev&&named.st_ino==after.st_ino;
  return same&&RevalidateSelf();
}
bool SealedImages::SameCli(audit_token_t token,const PeerBirth& birth)const{const auto before=Birth(token);if(!before||!SameBirth(*before,birth)||!RevalidateSelf()||!ValidateGuest(token,data_->cli_requirement.get(),data_->cli.cd_hash))return false;const auto after=Birth(token);return after&&SameBirth(*before,*after)&&RevalidateSelf();}
bool SealedImages::CaptureCli(audit_token_t token,PeerBirth* birth)const{const auto current=Birth(token);if(!birth||!current||!SameCli(token,*current))return false;*birth=*current;return true;}
bool SealedImages::SameBrowser(audit_token_t token,const PeerBirth& birth)const{const auto before=Birth(token);if(!before||!SameBirth(*before,birth)||!RevalidateSelf()||!ValidateGuest(token,data_->browser_requirement.get(),data_->browser.cd_hash))return false;const auto after=Birth(token);return after&&SameBirth(*before,*after)&&RevalidateSelf();}
bool SealedImages::CaptureBrowser(audit_token_t token,PeerBirth* birth)const{const auto current=Birth(token);if(!birth||!current||!SameBrowser(token,*current))return false;*birth=*current;return true;}
const std::string& SealedImages::service()const{return data_->locator;}
const std::string& SealedImages::cli_executable()const{return data_->cli.executable;}
SecRequirementRef SealedImages::cli_requirement()const{return data_->cli_requirement.get();}
const std::vector<uint8_t>& SealedImages::cli_hash()const{return data_->cli.cd_hash;}
}

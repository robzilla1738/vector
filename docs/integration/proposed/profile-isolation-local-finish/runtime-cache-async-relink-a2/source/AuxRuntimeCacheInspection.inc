// Private host implementation. Include in its anonymous namespace; no C ABI,
// JS pathname, caller FD, pin inventory or owner selector is exposed.
namespace aux_runtime_cache {
#include "AuxRuntimeMutablePins.inc"
enum class Status { kMatchingSeed, kIncomplete, kModifiedUnverified,
                    kNewerUnverified, kOtherVersionUnverified, kUnsafe, kCancelled };
struct Anchor { const char* find; const char* replacement; size_t count; bool runtime_root; };
struct Pin { const char* path; char type; unsigned mode; uint64_t size;
             const char* sha256; const char* target; const Anchor* anchors; size_t anchor_count; };
struct Result { Status status=Status::kUnsafe; size_t checked=0,missing=0,modified=0,unsafe=0; };
struct Fd {
  int fd=-1;
  explicit Fd(int value=-1):fd(value){}
  ~Fd(){if(fd>=0)close(fd);}
  Fd(const Fd&)=delete; Fd& operator=(const Fd&)=delete;
};
constexpr int kRead=O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC;
bool Same(const struct stat& a,const struct stat& b) {
  return a.st_dev==b.st_dev&&a.st_ino==b.st_ino&&a.st_size==b.st_size&&
    a.st_mtimespec.tv_sec==b.st_mtimespec.tv_sec&&a.st_mtimespec.tv_nsec==b.st_mtimespec.tv_nsec&&
    a.st_ctimespec.tv_sec==b.st_ctimespec.tv_sec&&a.st_ctimespec.tv_nsec==b.st_ctimespec.tv_nsec;
}
bool Private(const struct stat& st){return st.st_uid==geteuid()&&!(st.st_mode&0022);}
int Parent(int root,const char* relative) {
  int current=fcntl(root,F_DUPFD_CLOEXEC,0);
  if(current<0)return -1;
  std::string name(relative);size_t start=0,end=0;
  while((end=name.find('/',start))!=std::string::npos){
    const std::string part=name.substr(start,end-start);
    if(part.empty()||part=="."||part==".."){close(current);errno=EINVAL;return -1;}
    const int next=openat(current,part.c_str(),kRead|O_DIRECTORY);
    const int saved=errno;close(current);current=next;errno=saved;
    if(current<0)return -1;
    struct stat st{};if(fstat(current,&st)!=0||!S_ISDIR(st.st_mode)||!Private(st)){close(current);errno=EACCES;return -1;}
    start=end+1;
  }
  return current;
}
const char* Leaf(const char* path){const char* slash=strrchr(path,'/');return slash?slash+1:path;}
struct Read { bool ok=false,oversize=false;struct stat identity{};std::string text,hash; };
Read File(int parent,const char* name,uint64_t max,bool text,const std::function<bool()>& current) {
  Read result;Fd fd(openat(parent,name,kRead));if(fd.fd<0)return result;
  if(fstat(fd.fd,&result.identity)!=0||!S_ISREG(result.identity.st_mode)||
     !Private(result.identity)||result.identity.st_nlink!=1){errno=EACCES;return result;}
  if(result.identity.st_size<0||static_cast<uint64_t>(result.identity.st_size)>max){result.ok=true;result.oversize=true;return result;}
  CC_SHA256_CTX hash;CC_SHA256_Init(&hash);std::array<unsigned char,65536> buffer{};uint64_t total=0;
  for(;;){
    if(!current()){errno=ECANCELED;return result;}
    const ssize_t size=read(fd.fd,buffer.data(),buffer.size());
    if(size<0){if(errno==EINTR)continue;return result;}if(!size)break;
    if(static_cast<uint64_t>(size)>max-total){errno=EAGAIN;return result;}total+=size;
    CC_SHA256_Update(&hash,buffer.data(),static_cast<CC_LONG>(size));
    if(text)result.text.append(reinterpret_cast<const char*>(buffer.data()),size);
  }
  struct stat after{};if(fstat(fd.fd,&after)!=0||!Same(result.identity,after)||total!=static_cast<uint64_t>(after.st_size)){errno=EAGAIN;return result;}
  std::array<unsigned char,CC_SHA256_DIGEST_LENGTH> bytes{};CC_SHA256_Final(bytes.data(),&hash);
  constexpr char hex[]="0123456789abcdef";for(auto b:bytes){result.hash+=hex[b>>4];result.hash+=hex[b&15];}
  result.ok=true;return result;
}
bool ReverseText(std::string* text,const Pin& pin,const std::string& root) {
  if(text->find('\0')!=std::string::npos)return false;
  // Exact byte reversal plus original SHA is stronger than accepting arbitrary
  // decoded text. No lossy Unicode decoding is used.
  for(size_t i=pin.anchor_count;i>0;--i){
    const auto& a=pin.anchors[i-1];const std::string replacement=a.runtime_root?root:a.replacement;
    if(replacement.empty())return false;
    size_t count=0,pos=0;while((pos=text->find(replacement,pos))!=std::string::npos){++count;pos+=replacement.size();}
    if(count!=a.count)return false;
    pos=0;while((pos=text->find(replacement,pos))!=std::string::npos){text->replace(pos,replacement.size(),a.find);pos+=strlen(a.find);}
  }
  return true;
}
std::string Hash(const std::string& text) {
  std::array<unsigned char,CC_SHA256_DIGEST_LENGTH> bytes{};
  CC_SHA256(text.data(),static_cast<CC_LONG>(text.size()),bytes.data());
  std::string result;constexpr char hex[]="0123456789abcdef";for(auto b:bytes){result+=hex[b>>4];result+=hex[b&15];}return result;
}
bool Version(std::string* text) {
  while(!text->empty()&&(text->back()=='\n'||text->back()=='\r'||text->back()==' '||text->back()=='\t'))text->pop_back();
  if(text->empty())return false;
  auto alnum=[](char c){return(c>='0'&&c<='9')||(c>='A'&&c<='Z')||(c>='a'&&c<='z');};
  if(!alnum((*text)[0]))return false;
  for(char c:*text)if(!alnum(c)&&c!='.'&&c!='_'&&c!='-')return false;return true;
}
bool NumericNewer(const std::string& a,const std::string& b){
  auto split=[](const std::string& s,std::vector<std::string>* out){size_t start=0;for(size_t i=0;i<=s.size();++i){if(i<s.size()&&s[i]!='.'){if(s[i]<'0'||s[i]>'9')return false;continue;}auto v=s.substr(start,i-start);if(v.empty())return false;const auto n=v.find_first_not_of('0');out->push_back(n==std::string::npos?"0":v.substr(n));start=i+1;}return true;};
  std::vector<std::string> aa,bb;if(!split(a,&aa)||!split(b,&bb))return false;
  aa.resize(std::max(aa.size(),bb.size()),"0");bb.resize(aa.size(),"0");
  for(size_t i=0;i<aa.size();++i){if(aa[i].size()!=bb[i].size())return aa[i].size()>bb[i].size();if(aa[i]!=bb[i])return aa[i]>bb[i];}return false;
}
// Internal finite reader only. The sole product caller below selects the FD
// from the current retained Owner, never from JS or a serialized path.
Result Inspect(int root,const std::string& text_root,const Pin* pins,size_t count,
               const char* source_version,const std::function<bool()>& current) {
  Result result;struct stat directory{};
  if(!current()){result.status=Status::kCancelled;return result;}
  if(fstat(root,&directory)!=0||!S_ISDIR(directory.st_mode)||!Private(directory))return result;
  auto version=File(root,"version.txt",128,true,current);
  if(!version.ok){result.status=errno==ENOENT?Status::kIncomplete:Status::kUnsafe;return result;}
  const auto raw_version=version.text;
  if(version.oversize||!Version(&version.text))return result;
  if(version.text!=source_version){result.status=NumericNewer(version.text,source_version)?Status::kNewerUnverified:Status::kOtherVersionUnverified;return result;}
  auto fail=[&](const Pin& pin){if(errno==ENOENT){if(MissingMayBePackageMutation(pin.path))++result.modified;else ++result.missing;}else ++result.unsafe;};
  for(size_t i=0;i<count;++i){
    if(!current()){result.status=Status::kCancelled;return result;}
    const auto& pin=pins[i];Fd parent(Parent(root,pin.path));++result.checked;
    if(parent.fd<0){fail(pin);continue;}const char* name=Leaf(pin.path);
    if(pin.type=='d'){
      Fd fd(openat(parent.fd,name,kRead|O_DIRECTORY));struct stat st{};
      if(fd.fd<0||fstat(fd.fd,&st)!=0){fail(pin);continue;}
      if(!S_ISDIR(st.st_mode)||!Private(st)){++result.unsafe;continue;}
      if((st.st_mode&07777)!=pin.mode)++result.modified;
    }else if(pin.type=='l'){
      std::array<char,4096> target{};ssize_t size=readlinkat(parent.fd,name,target.data(),target.size());
      if(size<0){fail(pin);continue;}
      if(static_cast<size_t>(size)!=strlen(pin.target)||memcmp(target.data(),pin.target,size)!=0)++result.unsafe;
    }else{
      uint64_t growth=0;for(size_t j=0;j<pin.anchor_count;++j){const auto& a=pin.anchors[j];const size_t n=a.runtime_root?text_root.size():strlen(a.replacement),old=strlen(a.find);if(n>old)growth+=(n-old)*a.count;}
      auto read=File(parent.fd,name,pin.size+growth,pin.anchor_count>0,current);
      if(!read.ok){fail(pin);continue;}
      if(read.oversize){++result.modified;continue;}
      bool match=static_cast<uint64_t>(read.identity.st_size)==pin.size&&read.hash==pin.sha256;
      if(pin.anchor_count)match=ReverseText(&read.text,pin,text_root)&&read.text.size()==pin.size&&Hash(read.text)==pin.sha256;
      if(!match||(read.identity.st_mode&07777)!=pin.mode)++result.modified;
    }
  }
  auto after=File(root,"version.txt",128,true,current);
  if(!after.ok||after.oversize||after.text!=raw_version||!Same(version.identity,after.identity))++result.unsafe;
  result.status=!current()?Status::kCancelled:result.unsafe?Status::kUnsafe:result.missing?Status::kIncomplete:result.modified?Status::kModifiedUnverified:Status::kMatchingSeed;
  return result; // Every RAII reader/parent FD has closed before return.
}
} // namespace aux_runtime_cache

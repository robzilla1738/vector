// Included after AuxBrokerWritesNapi.inc in the actual authenticated main host.
// --no-addons remains set. These two fixed registrations cannot select an image,
// initializer, Environment, account, PID or protected owner from JavaScript.
// Exact two handle conversions from the paired Node v26.5.0
// src/js_native_api_v8.h:302-318. No Environment layout/internal flags imported.
// Copyright Node.js contributors. Used under the bundled Node MIT license.
static_assert(sizeof(v8::Local<v8::Value>)==sizeof(napi_value));
napi_value FixedNapiValue(v8::Local<v8::Value> local) {
  return reinterpret_cast<napi_value>(*local);
}
v8::Local<v8::Value> FixedV8Value(napi_value value) {
  v8::Local<v8::Value> local;
  memcpy(static_cast<void*>(&local),&value,sizeof(value));
  return local;
}
struct FixedCall {
  napi_env env;
  const bool utility;
  const std::string method;
  std::weak_ptr<Worker> worker;
  napi_ref original=nullptr;
  bool closed=false;
};
void FixedCleanup(void* data) {
  auto* retain=static_cast<std::shared_ptr<FixedCall>*>(data);
  auto call=*retain;call->closed=true;
  if(call->original){napi_delete_reference(call->env,call->original);call->original=nullptr;}
  delete retain;
}
void FixedFinalize(napi_env,void* data,void*) {
  delete static_cast<std::shared_ptr<FixedCall>*>(data);
}
bool FixedCurrent(napi_env env,const std::shared_ptr<Worker>& worker,bool utility) {
  auto captured=CaptureBrokerOwner(env);
  if(!captured.owner||captured.worker!=worker)return false;
  if(utility)return worker->utility&&worker->utility->CurrentInitializer();
  return worker->pdf&&worker->pdf->CurrentInitializer();
}
std::optional<std::filesystem::path> FixedContainingApp() {
  uint32_t size=0;_NSGetExecutablePath(nullptr,&size);
  if(!size||size>65536)return {};
  std::vector<char> value(size);
  if(_NSGetExecutablePath(value.data(),&size))return {};
  std::error_code error;
  auto path=std::filesystem::canonical(value.data(),error);
  if(error)return {};
  std::optional<std::filesystem::path> app;
  // The daemon is nested inside Aux.app: protect the outermost native app.
  for(auto part=path;part!=part.parent_path();part=part.parent_path())
    if(part.extension()==".app")app=part;
  return app;
}
bool FixedPathAllowed(const std::string& name,uint64_t handle,bool utility) {
  if(name.empty()||name.size()>=PATH_MAX||name.find('\0')!=std::string::npos)return false;
  const auto app=FixedContainingApp();if(!app)return false;
  std::error_code error;
  auto output=std::filesystem::weakly_canonical(std::filesystem::absolute(name,error),error);
  if(error)return false;
  auto contains=[](const auto& parent,const auto& child){
    auto p=parent.begin(),c=child.begin();
    for(;p!=parent.end();++p,++c)if(c==child.end()||*p!=*c)return false;
    return true;
  };
  struct stat entry{};
  if(lstat(output.c_str(),&entry)==0&&(!S_ISREG(entry.st_mode)&&!S_ISDIR(entry.st_mode)))return false;
  if(S_ISREG(entry.st_mode)&&entry.st_nlink!=1)return false;
  struct Roots {
    int32_t control=-1,task=-1;
    ~Roots(){if(control>=0)close(control);if(task>=0&&task!=control)close(task);}
  } roots;
  uint64_t generation=0;
  if(AuxNativeContextCopyStorageRoots(handle,&generation,&roots.control,&roots.task)!=0||!generation)return false;
  for(auto fd:{roots.control,roots.task}) {
    std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> path{};struct stat identity{};
    if(!ReadExecRoot(fd,path.data(),&identity))return false;
    const std::filesystem::path protected_root(path.data());
    // Supplied utility icon/preview callers use this exact installation cache.
    // It contains no account/authentication state. No selector admits another
    // Control subtree, and every actual write still uses staged publication.
    const bool preview_cache=utility&&fd==roots.control&&contains(protected_root/"cache/preview-images",output);
    if(!preview_cache&&(contains(protected_root,output)||contains(output,protected_root)))return false;
  }
  for(uint32_t role=1;role<=2;++role) {
    int32_t fd=-1;uint64_t generation=0;
    if(AuxNativeContextCopyBrowserRoot(handle,role,&generation,&fd)!=0||!generation){if(fd>=0)close(fd);return false;}
    std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> path{};struct stat identity{};
    const bool current=ReadExecRoot(fd,path.data(),&identity);close(fd);
    if(!current)return false;
    const std::filesystem::path protected_root(path.data());
    if(contains(protected_root,output)||contains(output,protected_root))return false;
  }
  return !contains(*app,output)&&!contains(output,*app);
}
bool FixedString(napi_env env,napi_value value,std::string& text) {
  size_t size=0;
  if(napi_get_value_string_utf8(env,value,nullptr,0,&size)!=napi_ok||size>16*1024*1024)return false;
  text.resize(size+1);size_t actual=0;
  if(napi_get_value_string_utf8(env,value,text.data(),text.size(),&actual)!=napi_ok||actual!=size)return false;
  text.resize(size);return text.find('\0')==std::string::npos;
}
// Finite fixed-image output producer. Image code writes only beneath actual
// retained TaskLayout custody; publication never follows a caller symlink.
struct FixedDescriptor {
  int value=-1;
  FixedDescriptor()=default;
  explicit FixedDescriptor(int fd):value(fd){}
  FixedDescriptor(const FixedDescriptor&)=delete;
  FixedDescriptor& operator=(const FixedDescriptor&)=delete;
  FixedDescriptor(FixedDescriptor&& other)noexcept:value(std::exchange(other.value,-1)){}
  FixedDescriptor& operator=(FixedDescriptor&& other)noexcept {
    if(this!=&other){if(value>=0)close(value);value=std::exchange(other.value,-1);}return *this;
  }
  ~FixedDescriptor(){if(value>=0)close(value);}
};
struct FixedPublication {
  std::string field,staged,requested,canonical_destination,leaf;
  bool directory=false;
  FixedDescriptor destination;
};
struct FixedOutputs {
  const pid_t process=getpid();
  const bool utility;
  std::mutex mutex;
  bool active=true;
  std::atomic<bool> selected_utility{false};
  Worker* worker=nullptr;
  std::atomic<bool> unknown{false};
  uint64_t generation=0;
  std::string leaf,path;
  FixedDescriptor parent,directory;
  std::vector<FixedPublication> publications;
  explicit FixedOutputs(bool u):utility(u){}
  bool Record(const char* phase,const std::string& destination="",const std::string& temporary="") {
    auto hex=[](const std::string& value){std::string encoded;constexpr char digits[]="0123456789abcdef";for(unsigned char c:value){encoded+=digits[c>>4];encoded+=digits[c&15];}return encoded;};
    std::string targets="[";
    for(const auto& publication:publications) {
      if(targets.size()>1)targets+=",";
      targets+="{\"field\":\""+publication.field+"\",\"directory\":"+(publication.directory?"true":"false")+
          ",\"requestedUtf8Hex\":\""+hex(publication.requested)+"\",\"destinationUtf8Hex\":\""+hex(publication.canonical_destination)+"\"}";
    }
    targets+="]";
    const auto bytes=std::string("{\"format\":\"aux.fixed-addon-output-invocation.v1\",\"phase\":\"")+phase+
        "\",\"producer\":\""+(utility?"macos-utilities":"pdf")+"\",\"pid\":\""+std::to_string(process)+
        "\",\"transportGeneration\":\""+std::to_string(generation)+"\",\"destinationUtf8Hex\":\""+hex(destination)+
        "\",\"temporaryLeafUtf8Hex\":\""+hex(temporary)+"\",\"publications\":"+targets+"}\n";
    if(bytes.size()>65536){unknown=true;return false;}
    FixedDescriptor file(openat(directory.value,".state.next",O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0600));
    if(file.value<0){unknown=true;return false;}
    size_t offset=0;
    while(offset<bytes.size()){auto count=write(file.value,bytes.data()+offset,bytes.size()-offset);if(count<0&&errno==EINTR)continue;if(count<=0){unknown=true;return false;}offset+=count;}
    if(fsync(file.value)!=0||renameat(directory.value,".state.next",directory.value,"state.json")!=0||
       fsync(directory.value)!=0||fsync(parent.value)!=0){unknown=true;return false;}
    return true;
  }
  // Called only after the image's true drain, or a synchronous PDF return.
  bool Remove() {
    if(getpid()!=process)return false;
    std::lock_guard lock(mutex);if(active||unknown)return false;
    std::error_code error;
    // This tree is inside the held private Task root, inaccessible to Aux
    // children. It contains only filenames/directory names made below.
    std::filesystem::remove_all(path,error);
    struct stat entry{};
    return !error&&fstatat(parent.value,leaf.c_str(),&entry,AT_SYMLINK_NOFOLLOW)!=0&&errno==ENOENT&&fsync(parent.value)==0;
  }
};
struct FixedOutputRegistry {
  std::mutex mutex;
  std::unordered_map<Worker*,std::vector<std::shared_ptr<FixedOutputs>>> retained;
};
FixedOutputRegistry& FixedOutputOwners(){static auto* value=new FixedOutputRegistry;return *value;}
bool CloseFixedOutputs(Worker* worker,bool pdf_drained,bool utility_drained) {
  if(getpid()!=kHostProcess)return false;
  std::vector<std::shared_ptr<FixedOutputs>> captured;
  {std::lock_guard lock(FixedOutputOwners().mutex);auto found=FixedOutputOwners().retained.find(worker);if(found==FixedOutputOwners().retained.end())return true;captured=found->second;}
  std::vector<std::shared_ptr<FixedOutputs>> removed;
  bool unknown=false;
  for(const auto& output:captured) {
    {std::lock_guard lock(output->mutex);unknown=unknown||output->unknown;}
    if(!output->selected_utility&&(output->utility?utility_drained:pdf_drained)&&output->Remove())removed.push_back(output);
  }
  if(unknown){std::lock_guard lock(worker->mutex);worker->broker_untracked=true;}
  std::lock_guard lock(FixedOutputOwners().mutex);
  auto found=FixedOutputOwners().retained.find(worker);if(found==FixedOutputOwners().retained.end())return true;
  for(const auto& output:removed)std::erase(found->second,output);
  if(found->second.empty()){FixedOutputOwners().retained.erase(found);return true;}
  return false;
}
bool FixedPrivateDirectory(int fd) {
  struct stat st{};
  return fd>=0&&fstat(fd,&st)==0&&S_ISDIR(st.st_mode)&&st.st_uid==geteuid()&&(st.st_mode&07777)==0700;
}
FixedDescriptor FixedOpenOutputDirectory(const std::filesystem::path& path) {
  if(!path.is_absolute())return {};
  FixedDescriptor parent(open("/",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
  if(parent.value<0)return {};
  for(const auto& part:path.relative_path()) {
    const auto name=part.string();if(name.empty()||name=="."||name=="..")return {};
    int next=openat(parent.value,name.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);
    if(next<0&&errno==ENOENT) {
      if(mkdirat(parent.value,name.c_str(),0700)!=0&&errno!=EEXIST)return {};
      next=openat(parent.value,name.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);
    }
    if(next<0)return {};
    close(parent.value);parent.value=next;
  }
  std::array<char,PATH_MAX> current{};
  if(fcntl(parent.value,F_GETPATH,current.data())!=0||std::filesystem::path(current.data())!=path)return {};
  return parent;
}
std::shared_ptr<FixedOutputs> BeginFixedOutputs(const BrokerOwner& owner,bool utility) {
  int32_t control=-1,task=-1;uint64_t generation=0;
  if(AuxNativeContextCopyStorageRoots(owner.owner->handle,&generation,&control,&task)!=0||!generation){if(control>=0)close(control);if(task>=0&&task!=control)close(task);return {};}
  FixedDescriptor control_root(control),task_root(task);
  std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> path{};struct stat identity{};
  if(!ReadExecRoot(task_root.value,path.data(),&identity))return {};
  if(mkdirat(task_root.value,"fixed-addon-outputs",0700)!=0&&errno!=EEXIST)return {};
  FixedDescriptor parent(openat(task_root.value,"fixed-addon-outputs",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
  if(!FixedPrivateDirectory(parent.value))return {};
  constexpr char marker[]="aux.fixed-addon-output-staging.v1\n";
  FixedDescriptor marker_fd(openat(parent.value,"format",O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0600));
  if(marker_fd.value>=0) {
    if(write(marker_fd.value,marker,sizeof(marker)-1)!=sizeof(marker)-1||fsync(marker_fd.value)!=0||
       fsync(parent.value)!=0||fsync(task_root.value)!=0)return {};
  } else if(errno!=EEXIST)return {};
  FixedDescriptor marker_read(openat(parent.value,"format",O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC));
  struct stat marker_stat{};std::array<char,sizeof(marker)> marker_bytes{};
  if(marker_read.value<0||fstat(marker_read.value,&marker_stat)!=0||!S_ISREG(marker_stat.st_mode)||
     marker_stat.st_uid!=geteuid()||(marker_stat.st_mode&07777)!=0600||marker_stat.st_nlink!=1||marker_stat.st_size!=sizeof(marker)-1||
     read(marker_read.value,marker_bytes.data(),marker_bytes.size())!=sizeof(marker)-1||memcmp(marker_bytes.data(),marker,sizeof(marker)-1))return {};
  auto outputs=std::make_shared<FixedOutputs>(utility);
  outputs->generation=generation;
  outputs->worker=owner.worker.get();
  outputs->parent=FixedDescriptor(fcntl(parent.value,F_DUPFD_CLOEXEC,0));
  if(outputs->parent.value<0)return {};
  // Kernel randomness, no supplied filename or authority token.
  std::array<unsigned char,16> random{};arc4random_buf(random.data(),random.size());
  constexpr char hex[]="0123456789abcdef";outputs->leaf="invocation-";
  for(auto byte:random){outputs->leaf+=hex[byte>>4];outputs->leaf+=hex[byte&15];}
  if(mkdirat(parent.value,outputs->leaf.c_str(),0700)!=0)return {};
  outputs->directory=FixedDescriptor(openat(parent.value,outputs->leaf.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
  if(!FixedPrivateDirectory(outputs->directory.value))return {};
  outputs->path=std::string(path.data())+"/fixed-addon-outputs/"+outputs->leaf;
  {std::lock_guard lock(FixedOutputOwners().mutex);FixedOutputOwners().retained[owner.worker.get()].push_back(outputs);}
  if(!outputs->Record("prepared"))return {};
  return outputs;
}
bool FixedPreparePublication(FixedOutputs& outputs,const std::string& field,const std::string& requested,bool directory,uint64_t handle,
    const std::shared_ptr<SelectedBuiltinScope>& selected,napi_env env) {
  if(!FixedPathAllowed(requested,handle,outputs.utility)&&!SelectedBuiltinPathAllowed(selected,env,requested,true))return false;
  std::error_code error;
  auto path=std::filesystem::absolute(requested,error).lexically_normal();if(error)return false;
  // Resolve aliases once, then retain the canonical destination rather than
  // following the caller alias again during publication. Returned paths retain
  // the supplied spelling (including ordinary /tmp and /var aliases).
  auto canonical=std::filesystem::weakly_canonical(path,error);if(error)return false;
  path=canonical;
  FixedPublication item;item.field=field;item.requested=requested;item.canonical_destination=path.string();item.directory=directory;
  item.leaf=path.filename().string();
  item.destination=FixedOpenOutputDirectory(directory?path:path.parent_path());
  if(item.destination.value<0)return false;
  item.staged=outputs.path+"/"+field;
  if(directory&&mkdirat(outputs.directory.value,field.c_str(),0700)!=0)return false;
  outputs.publications.push_back(std::move(item));return true;
}
// Timed-out utility callbacks retain their stage and may write later. Only a
// complete stable PNG snapshot is publishable while those callbacks remain live.
bool FixedValidPng(int fd,off_t size) {
  if(size<20||size>32*1024*1024)return false;
  auto read_at=[&](void* data,size_t count,off_t at){
    size_t read_count=0;
    while(read_count<count){auto n=pread(fd,static_cast<char*>(data)+read_count,count-read_count,at+read_count);if(n<0&&errno==EINTR)continue;if(n<=0)return false;read_count+=n;}return true;
  };
  std::array<unsigned char,8> signature{};
  constexpr std::array<unsigned char,8> expected{137,80,78,71,13,10,26,10};
  if(!read_at(signature.data(),signature.size(),0)||signature!=expected)return false;
  auto integer=[](const unsigned char* p){return (uint32_t(p[0])<<24)|(uint32_t(p[1])<<16)|(uint32_t(p[2])<<8)|p[3];};
  off_t offset=8;bool first=true;
  while(offset<size) {
    std::array<unsigned char,8> header{};
    if(size-offset<12||!read_at(header.data(),header.size(),offset))return false;
    const auto length=integer(header.data());
    if(length>uint64_t(size-offset-12))return false;
    if(first&&(length!=13||memcmp(header.data()+4,"IHDR",4)))return false;first=false;
    uint32_t crc=0xffffffff;
    auto add=[&](const unsigned char* bytes,size_t count){for(size_t i=0;i<count;++i){crc^=bytes[i];for(int bit=0;bit<8;++bit)crc=(crc>>1)^(0xedb88320u&uint32_t(-int32_t(crc&1)));}};
    add(header.data()+4,4);
    std::array<unsigned char,64*1024> buffer{};uint32_t consumed=0;
    while(consumed<length){const auto count=std::min<size_t>(buffer.size(),length-consumed);if(!read_at(buffer.data(),count,offset+8+consumed))return false;add(buffer.data(),count);consumed+=count;}
    std::array<unsigned char,4> stored{};
    if(!read_at(stored.data(),stored.size(),offset+8+length)||integer(stored.data())!=(crc^0xffffffff))return false;
    offset+=12+length;
    if(!memcmp(header.data()+4,"IEND",4))return length==0&&offset==size;
  }
  return false;
}
bool FixedCopyFile(FixedOutputs& owner,int source_parent,const char* source_leaf,int destination_parent,const char* destination_leaf,const std::string& destination_path) {
  if(!source_leaf||!destination_leaf||strchr(source_leaf,'/')||strchr(destination_leaf,'/')||!strcmp(destination_leaf,".")||!strcmp(destination_leaf,".."))return false;
  FixedDescriptor input(openat(source_parent,source_leaf,O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC));
  struct stat before{},after{};
  if(input.value<0||fstat(input.value,&before)!=0||!S_ISREG(before.st_mode)||before.st_uid!=geteuid()||before.st_nlink!=1||before.st_size<0||before.st_size>512*1024*1024)return false;
  if(owner.utility&&!FixedValidPng(input.value,before.st_size))return false;
  std::array<unsigned char,16> random{};arc4random_buf(random.data(),random.size());
  std::string temporary=".aux-fixed-publish-";constexpr char hex[]="0123456789abcdef";
  for(auto byte:random){temporary+=hex[byte>>4];temporary+=hex[byte&15];}
  if(!owner.Record("publishing",destination_path,temporary))return false;
  FixedDescriptor output(openat(destination_parent,temporary.c_str(),O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0600));
  if(output.value<0)return false;
  bool complete=true;off_t copied=0;std::array<char,64*1024> buffer{};
  while(copied<before.st_size) {
    auto count=read(input.value,buffer.data(),std::min<off_t>(buffer.size(),before.st_size-copied));
    if(count<0&&errno==EINTR)continue;if(count<=0){complete=false;break;}
    size_t offset=0;
    while(offset<static_cast<size_t>(count)){auto written=write(output.value,buffer.data()+offset,count-offset);if(written<0&&errno==EINTR)continue;if(written<=0){complete=false;break;}offset+=written;}
    if(!complete)break;copied+=count;
  }
  complete=complete&&fstat(input.value,&after)==0&&before.st_dev==after.st_dev&&before.st_ino==after.st_ino&&
      before.st_size==after.st_size&&before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec&&before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec&&
      before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec&&before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec&&fsync(output.value)==0;
  // renameat replaces an entry, never follows a target symlink/hardlink.
  if(complete)complete=renameat(destination_parent,temporary.c_str(),destination_parent,destination_leaf)==0;
  if(!complete)unlinkat(destination_parent,temporary.c_str(),0);
  if(complete)complete=fsync(destination_parent)==0&&owner.Record("published",destination_path,temporary);
  if(!complete)owner.unknown=true;
  return complete;
}
bool FixedPublish(FixedOutputs& outputs) {
  for(const auto& item:outputs.publications) {
    std::array<char,PATH_MAX> path{};
    const auto expected=item.directory?std::filesystem::path(item.canonical_destination):std::filesystem::path(item.canonical_destination).parent_path();
    if(fcntl(item.destination.value,F_GETPATH,path.data())!=0||std::filesystem::path(path.data())!=expected)return false;
    if(!item.directory) {
      struct stat st{};
      if(fstatat(outputs.directory.value,item.field.c_str(),&st,AT_SYMLINK_NOFOLLOW)!=0) {if(errno==ENOENT)continue;return false;}
      if(!FixedCopyFile(outputs,outputs.directory.value,item.field.c_str(),item.destination.value,item.leaf.c_str(),item.canonical_destination))return false;
      continue;
    }
    FixedDescriptor source(openat(outputs.directory.value,item.field.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
    if(!FixedPrivateDirectory(source.value))return false;
    int cursor=openat(source.value,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);
    DIR* stream=cursor>=0?fdopendir(cursor):nullptr;if(!stream){if(cursor>=0)close(cursor);return false;}
    bool complete=true;errno=0;
    while(auto* entry=readdir(stream)) {
      if(!strcmp(entry->d_name,".")||!strcmp(entry->d_name,".."))continue;
      if(!FixedCopyFile(outputs,source.value,entry->d_name,item.destination.value,entry->d_name,item.canonical_destination+"/"+entry->d_name)){complete=false;break;}
      errno=0;
    }
    if(errno!=0)complete=false;
    closedir(stream);if(!complete)return false;
  }
  return true;
}
bool FixedRewriteResult(v8::Local<v8::Context> context,v8::Local<v8::Value> value,const FixedOutputs& outputs,int depth=0) {
  if(depth>64)return false;
  if(!value->IsObject())return true;
  auto object=value.As<v8::Object>();v8::Local<v8::Array> names;
  if(!object->GetOwnPropertyNames(context).ToLocal(&names))return false;
  auto* isolate=v8::Isolate::GetCurrent();
  for(uint32_t index=0;index<names->Length();++index) {
    v8::Local<v8::Value> key,child;
    if(!names->Get(context,index).ToLocal(&key)||!object->Get(context,key).ToLocal(&child))return false;
    if(child->IsString()) {
      v8::String::Utf8Value text(isolate,child);if(!*text)return false;
      std::string current(*text,text.length());
      for(const auto& item:outputs.publications) {
        if(current==item.staged||(item.directory&&current.starts_with(item.staged+"/"))) {
          const auto changed=item.requested+current.substr(item.staged.size());v8::Local<v8::String> encoded;
          if(!v8::String::NewFromUtf8(isolate,changed.data(),v8::NewStringType::kNormal,changed.size()).ToLocal(&encoded)||object->Set(context,key,encoded).IsNothing())return false;
          break;
        }
      }
    } else if(!FixedRewriteResult(context,child,outputs,depth+1))return false;
  }
  return true;
}
bool RetireSelectedUtilityOutput(const std::shared_ptr<FixedOutputs>& outputs) {
  if(!outputs)return true;
  if(!outputs->Remove())return false;
  std::lock_guard lock(FixedOutputOwners().mutex);
  auto found=FixedOutputOwners().retained.find(outputs->worker);
  if(found==FixedOutputOwners().retained.end())return false;
  std::erase(found->second,outputs);
  if(found->second.empty())FixedOutputOwners().retained.erase(found);
  return true;
}
void MarkSelectedUtilityOutput(const std::shared_ptr<FixedOutputs>& outputs) {
  if(outputs){std::lock_guard lock(outputs->mutex);outputs->selected_utility=true;}
}
napi_value FixedFail(napi_env env,const char* message) {
  napi_throw_error(env,"AUX_FIXED_BUILTIN_REFUSED",message);return nullptr;
}
struct FixedInvocation {
  std::shared_ptr<Worker> worker;
  std::shared_ptr<FixedOutputs> outputs;
  explicit FixedInvocation(std::shared_ptr<Worker> w):worker(std::move(w)) {
    std::lock_guard lock(worker->mutex);++worker->broker_pending;
  }
  ~FixedInvocation() {
    try {
      if(outputs) {
        {std::lock_guard lock(outputs->mutex);outputs->active=false;}
        if(!outputs->utility)CloseFixedOutputs(worker.get(),true,false);
      }
    }catch(...){std::lock_guard lock(worker->mutex);worker->broker_untracked=true;}
    bool terminal;
    {std::lock_guard lock(worker->mutex);--worker->broker_pending;terminal=worker->terminal;}
    if(terminal)worker->Close();
  }
};
napi_value FixedRunImpl(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return FixedFail(env,"Fixed builtin process changed");
  size_t argc=3;napi_value args[3];void* data=nullptr;
  if(napi_get_cb_info(env,info,&argc,args,nullptr,&data)!=napi_ok||!data)return nullptr;
  auto call=*static_cast<std::shared_ptr<FixedCall>*>(data);
  auto worker=call->worker.lock();
  auto selected=CurrentSelectedBuiltinScope();
  if(!CurrentSelectedBuiltin(selected,env))return FixedFail(env,"Selected builtin owner closed");
  if(call->closed||env!=call->env||!worker||!FixedCurrent(env,worker,call->utility))
    return FixedFail(env,"Fixed builtin owner closed");
  auto* isolate=v8::Isolate::GetCurrent();auto context=isolate->GetCurrentContext();
  v8::Local<v8::Value> input;
  if(call->utility) {
    std::string command,json;
    if(argc!=2||!FixedString(env,args[0],command)||!FixedString(env,args[1],json))
      return FixedFail(env,"Fixed utility requires command and JSON strings");
    if(command!="generate-thumbnail"&&command!="list-open-apps"&&command!="app-icons"&&command!="copy-file")
      return FixedFail(env,"Application launch requires supervised execution authority");
    v8::Local<v8::String> encoded;
    if(!v8::String::NewFromUtf8(isolate,json.data(),v8::NewStringType::kNormal,static_cast<int>(json.size())).ToLocal(&encoded)||
       !v8::JSON::Parse(context,encoded).ToLocal(&input))return nullptr;
  } else {
    if(argc!=1)return FixedFail(env,"PDF method requires one object");
    // Snapshot all getters/toJSON before checking paths. The original image sees
    // this private plain JSON object, never mutable caller getters or Proxies.
    v8::Local<v8::String> encoded;
    if(!v8::JSON::Stringify(context,FixedV8Value(args[0])).ToLocal(&encoded)||
       !v8::JSON::Parse(context,encoded).ToLocal(&input))return nullptr;
    args[0]=FixedNapiValue(input);
  }
  if(!input->IsObject()||input->IsArray())return FixedFail(env,"Fixed builtin input must be an object");
  auto path_owner=CaptureBrokerOwner(env);
  if(!path_owner.owner||path_owner.worker!=worker)return FixedFail(env,"Fixed builtin owner closed");
  // Complete path-bearing native ABI: PDF filePath (merge: files[].filePath),
  // utility filePath for thumbnail/list-apps/clipboard. app-icons consumes only
  // OS bundle identifiers. No selected account/session owner is inferred from
  // this installation owner: private roots remain refused until that join.
  auto check_file=[&](v8::Local<v8::Value> object){
    if(!object->IsObject()||object->IsArray())return false;
    auto key=v8::String::NewFromUtf8Literal(isolate,"filePath");
    const auto present=object.As<v8::Object>()->HasOwnProperty(context,key);
    v8::Local<v8::Value> value;
    if(present.IsNothing()||!present.FromJust()||!object.As<v8::Object>()->Get(context,key).ToLocal(&value))return false;
    std::string path;
    return FixedString(env,FixedNapiValue(value),path)&&(FixedPathAllowed(path,path_owner.owner->handle,call->utility)||SelectedBuiltinPathAllowed(selected,env,path,false));
  };
  if(!call->utility&&call->method=="merge") {
    v8::Local<v8::Value> files;
    if(!input.As<v8::Object>()->Get(context,v8::String::NewFromUtf8Literal(isolate,"files")).ToLocal(&files)||!files->IsArray())
      return FixedFail(env,"PDF merge requires files");
    auto array=files.As<v8::Array>();
    for(uint32_t index=0;index<array->Length();++index) {
      v8::Local<v8::Value> file;
      if(!array->Get(context,index).ToLocal(&file)||!check_file(file))
        return FixedFail(env,"PDF input requires selected file authority outside private roots");
    }
  } else {
    std::string command;
    if(call->utility&&!FixedString(env,args[0],command))return FixedFail(env,"Invalid utility command");
    if((!call->utility||command!="app-icons")&&!check_file(input))
      return FixedFail(env,"Fixed input requires selected file authority outside private roots");
  }
  FixedInvocation invocation(worker);
  std::vector<const char*> fields;
  if(call->utility) {
    std::string command;
    if(!FixedString(env,args[0],command))return FixedFail(env,"Invalid utility command");
    if(command=="generate-thumbnail")fields={"iconOutputPath","thumbnailOutputPath"};
    if(command=="list-open-apps"||command=="app-icons")fields={"iconDirectory"};
  } else if(call->method=="merge"||call->method=="rotate"||call->method=="fillFormFields")fields={"outputPath"};
  else if(call->method=="split"||call->method=="renderPages")fields={"outputDir"};
  for(const auto* field:fields) {
    auto key=v8::String::NewFromUtf8(isolate,field).ToLocalChecked();
    auto present=input.As<v8::Object>()->HasOwnProperty(context,key);
    if(present.IsNothing())return nullptr;
    if(!present.FromJust())continue;
    v8::Local<v8::Value> value;
    if(!input.As<v8::Object>()->Get(context,key).ToLocal(&value))return nullptr;
    std::string path;
    if(!FixedString(env,FixedNapiValue(value),path))return FixedFail(env,"Invalid fixed output path");
    if(!invocation.outputs)invocation.outputs=BeginFixedOutputs(path_owner,call->utility);
    if(!invocation.outputs||!FixedPreparePublication(*invocation.outputs,field,path,
        !strcmp(field,"outputDir")||!strcmp(field,"iconDirectory"),path_owner.owner->handle,selected,env))
      return FixedFail(env,"Fixed builtin output authority unavailable");
    const auto& staged=invocation.outputs->publications.back().staged;
    v8::Local<v8::String> replacement;
    if(!v8::String::NewFromUtf8(isolate,staged.data(),v8::NewStringType::kNormal,staged.size()).ToLocal(&replacement)||
       input.As<v8::Object>()->Set(context,key,replacement).IsNothing())return nullptr;
  }
  if(call->utility&&invocation.outputs) {
    v8::Local<v8::String> encoded;
    if(!v8::JSON::Stringify(context,input).ToLocal(&encoded))return nullptr;
    args[1]=FixedNapiValue(encoded);
  }
  // Getters may synchronously close the actual owner during snapshotting.
  if(call->closed||!FixedCurrent(env,worker,call->utility)||!CurrentSelectedBuiltin(selected,env))return FixedFail(env,"Fixed builtin owner closed");
  if(invocation.outputs&&!invocation.outputs->Record("running"))
    return FixedFail(env,"Fixed output journal interrupted; staging preserved");
  napi_value original,receiver,result;
  if(call->utility&&selected) {
    std::string command,json;
    if(!FixedString(env,args[0],command)||!FixedString(env,args[1],json))return FixedFail(env,"Invalid selected utility input");
    auto response=RunSelectedUtility(selected,env,command,json,invocation.outputs);
    if(!response)return FixedFail(env,"Selected utility invocation failed; native custody retained");
    if(napi_create_string_utf8(env,response->data(),response->size(),&result)!=napi_ok)return nullptr;
  } else if(napi_get_reference_value(env,call->original,&original)!=napi_ok||
     napi_get_undefined(env,&receiver)!=napi_ok||
     napi_call_function(env,receiver,original,argc,args,&result)!=napi_ok)return nullptr;
  if(!invocation.outputs)return result;
  if(!FixedCurrent(env,worker,call->utility)||!CurrentSelectedBuiltin(selected,env))return FixedFail(env,"Fixed owner closed before publication");
  v8::Local<v8::Value> returned;
  if(call->utility) {
    const auto raw=FixedV8Value(result);
    if(!raw->IsString()||!v8::JSON::Parse(context,raw.As<v8::String>()).ToLocal(&returned))return nullptr;
  } else returned=FixedV8Value(result);
  // Original native return objects become private plain data before changing
  // paths. Any toJSON reentrancy precedes the final native authority check.
  v8::Local<v8::String> encoded;
  if(!v8::JSON::Stringify(context,returned).ToLocal(&encoded)||
     !v8::JSON::Parse(context,encoded).ToLocal(&returned)||
     !FixedRewriteResult(context,returned,*invocation.outputs))return nullptr;
  if(!FixedCurrent(env,worker,call->utility)||!CurrentSelectedBuiltin(selected,env))return FixedFail(env,"Fixed owner closed before publication");
  if(!FixedPublish(*invocation.outputs)) {
    invocation.outputs->unknown=true;
    return FixedFail(env,"Fixed output publication interrupted; private staging preserved for review");
  }
  if(call->utility) {
    if(!v8::JSON::Stringify(context,returned).ToLocal(&encoded))return nullptr;
    return FixedNapiValue(encoded);
  }
  return FixedNapiValue(returned);
}
napi_value FixedRun(napi_env env,napi_callback_info info) {
  try{return FixedRunImpl(env,info);}catch(...) {
    auto worker=CaptureBrokerForOneWayRevocation(env);
    if(worker){std::lock_guard lock(worker->mutex);worker->broker_untracked=true;}
    return FixedFail(env,"Fixed builtin interrupted; native custody retained");
  }
}
napi_value InitializeFixed(napi_env env,napi_value exports,bool utility) {
  auto captured=CaptureBrokerOwner(env);
  if(!captured.owner||!captured.worker->ordinary_main_service||!FixedCurrent(env,captured.worker,utility))
    return FixedFail(env,"Fixed builtin requires its actual authenticated main Environment");
  void* pointer=utility?captured.worker->utility->CurrentInitializer():captured.worker->pdf->CurrentInitializer();
  if(!pointer)return FixedFail(env,"Fixed builtin current image unavailable");
  auto original=reinterpret_cast<napi_addon_register_func>(pointer)(env,exports);
  if(!original)return nullptr;
  napi_value facade;
  if(napi_create_object(env,&facade)!=napi_ok)return nullptr;
  const std::vector<const char*> methods=utility?std::vector<const char*>{"run"}:
      std::vector<const char*>{"extractText","merge","rotate","split","getFormFields","renderPages","fillFormFields"};
  for(const auto* method:methods) {
    napi_value function; napi_valuetype type;
    if(napi_get_named_property(env,original,method,&function)!=napi_ok||
       napi_typeof(env,function,&type)!=napi_ok||type!=napi_function)return FixedFail(env,"Fixed builtin ABI changed");
    auto call=std::make_shared<FixedCall>(FixedCall{env,utility,method,captured.worker});
    if(napi_create_reference(env,function,1,&call->original)!=napi_ok)return nullptr;
    auto* cleanup=new std::shared_ptr<FixedCall>(call);
    if(napi_add_env_cleanup_hook(env,FixedCleanup,cleanup)!=napi_ok){FixedCleanup(cleanup);return nullptr;}
    auto* finalizer=new std::shared_ptr<FixedCall>(call);napi_value wrapper;
    if(napi_create_function(env,method,NAPI_AUTO_LENGTH,FixedRun,finalizer,&wrapper)!=napi_ok){delete finalizer;return nullptr;}
    if(napi_add_finalizer(env,wrapper,finalizer,FixedFinalize,nullptr,nullptr)!=napi_ok){delete finalizer;return nullptr;}
    const napi_property_descriptor property{method,nullptr,nullptr,nullptr,nullptr,wrapper,napi_default,nullptr};
    if(napi_define_properties(env,facade,1,&property)!=napi_ok)return nullptr;
  }
  return facade;
}
napi_value InitializeFixedPdf(napi_env env,napi_value exports){try{return InitializeFixed(env,exports,false);}catch(...){return FixedFail(env,"PDF initialization interrupted");}}
napi_value InitializeFixedUtility(napi_env env,napi_value exports){try{return InitializeFixed(env,exports,true);}catch(...){return FixedFail(env,"Utility initialization interrupted");}}
void RegisterFixedBuiltins(const std::shared_ptr<Worker>& worker) {
  if(!worker->ordinary_main_service||!worker->pdf||!worker->utility||
     !worker->pdf->CurrentInitializer()||!worker->utility->CurrentInitializer())return;
  // Worker inheritance is harmless: both initializers require the original
  // registered Environment through CaptureBrokerOwner before any image call.
  node::AddLinkedBinding(worker->environment,"aux_pdf_builtin",InitializeFixedPdf,8);
  node::AddLinkedBinding(worker->environment,"aux_macos_utilities_builtin",InitializeFixedUtility,8);
}

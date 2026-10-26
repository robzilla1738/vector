// Private selected-session readonly streams. Original file permission resolves
// the path before this deny-only native boundary; no FD or root is exposed.
constexpr napi_type_tag kSelectedReaderTag{0x4155585245414431ULL,0x53455353494f4e31ULL};
struct SelectedFileReader;
struct SelectedFileReaders {
  std::mutex mutex;
  std::vector<std::weak_ptr<SelectedFileReader>> files;
};
SelectedFileReaders& SelectedReaders(){static auto* value=new SelectedFileReaders;return *value;}
bool SelectedReaderIdentity(const struct stat& a,const struct stat& b) {
  return S_ISREG(a.st_mode)&&S_ISREG(b.st_mode)&&a.st_nlink==1&&b.st_nlink==1&&
      a.st_dev==b.st_dev&&a.st_ino==b.st_ino&&a.st_size==b.st_size&&
      a.st_mtimespec.tv_sec==b.st_mtimespec.tv_sec&&a.st_mtimespec.tv_nsec==b.st_mtimespec.tv_nsec&&
      a.st_ctimespec.tv_sec==b.st_ctimespec.tv_sec&&a.st_ctimespec.tv_nsec==b.st_ctimespec.tv_nsec;
}
struct SelectedFileReader {
  std::shared_ptr<SelectedBuiltinScope> scope;
  std::mutex mutex;
  int fd=-1,parent=-1;
  struct stat identity{};
  std::string leaf;
  off_t offset=0;
  bool stopped=false,finished=false,bound=false;
  bool Stable(){struct stat actual{},named{};return fd>=0&&fstat(fd,&actual)==0&&
      fstatat(parent,leaf.c_str(),&named,AT_SYMLINK_NOFOLLOW)==0&&
      SelectedReaderIdentity(identity,actual)&&SelectedReaderIdentity(identity,named);}
  bool Close(bool stop=false) {
    bool complete=true,physical=true,finish=false;
    {std::lock_guard lock(mutex);
      stopped=stopped||stop;
      if(finished)return !stopped;
      complete=!bound||Stable();
      if(fd>=0&&close(fd)!=0)physical=false;fd=-1;
      if(parent>=0&&close(parent)!=0)physical=false;parent=-1;
      finished=true;finish=true;
    }
    if(!physical)scope->MarkUnknown();
    if(finish)scope->Finish();
    return complete&&physical&&!stop;
  }
  ~SelectedFileReader(){Close();}
};
void StopSelectedFileReaders(SelectedBuiltinScope* scope) {
  std::vector<std::shared_ptr<SelectedFileReader>> files;
  {std::lock_guard lock(SelectedReaders().mutex);for(auto& weak:SelectedReaders().files)
    if(auto file=weak.lock();file&&file->scope.get()==scope)files.push_back(file);}
  for(auto& file:files)file->Close(true);
}
std::shared_ptr<SelectedFileReader> SelectedReaderInfo(napi_env env,napi_callback_info info) {
  napi_value self;size_t count=0;void* data=nullptr;
  if(napi_get_cb_info(env,info,&count,nullptr,&self,&data)!=napi_ok)return {};
  bool tagged=false;
  if(napi_check_object_type_tag(env,self,&kSelectedReaderTag,&tagged)!=napi_ok||!tagged)return {};
  void* wrapped=nullptr;
  if(napi_unwrap(env,self,&wrapped)!=napi_ok||!wrapped)return {};
  return *static_cast<std::shared_ptr<SelectedFileReader>*>(wrapped);
}
napi_value SelectedFileReadChunk(napi_env env,napi_callback_info info) {
  auto file=SelectedReaderInfo(env,info);
  if(!file||!file->scope->Current(env))return SelectedScopeFail(env,"Selected file owner closed");
  std::array<unsigned char,524288> bytes{};ssize_t count=-1;
  {
    std::lock_guard lock(file->mutex);
    if(file->finished||file->stopped||!file->Stable())return SelectedScopeFail(env,"Original selected file changed");
    do{count=pread(file->fd,bytes.data(),bytes.size(),file->offset);}while(count<0&&errno==EINTR);
    if(count<0||!file->Stable())return SelectedScopeFail(env,"Original selected read did not settle");
    file->offset+=count;
  }
  if(!file->scope->Current(env))return SelectedScopeFail(env,"Selected file owner closed during its read");
  napi_value result;
  if(napi_create_buffer_copy(env,static_cast<size_t>(count),bytes.data(),nullptr,&result)!=napi_ok)return nullptr;
  return result;
}
napi_value SelectedFileClose(napi_env env,napi_callback_info info) {
  auto file=SelectedReaderInfo(env,info);
  if(!file||!file->Close())return SelectedScopeFail(env,"Selected file close or identity did not settle");
  napi_value result;napi_get_undefined(env,&result);return result;
}
void SelectedFileFinalize(napi_env,void* data,void*) {
  delete static_cast<std::shared_ptr<SelectedFileReader>*>(data);
}
napi_value SelectedOpenReadFile(napi_env env,napi_callback_info info) {
  size_t count=1;napi_value args[1];auto scope=SelectedScopeInfo(env,info,count,args);std::string requested;
  if(!scope||count!=1||!SelectedReadString(env,args[0],requested,PATH_MAX)||!scope->Begin(env))
    return SelectedScopeFail(env,"Original selected file is unavailable");
  auto file=std::make_shared<SelectedFileReader>();file->scope=scope;
  std::error_code error;auto path=std::filesystem::canonical(requested,error);
  if(error||(!FixedPathAllowed(path.string(),scope->captured.owner->handle,false)&&!scope->Allows(env,path.string(),false)))
    return SelectedScopeFail(env,"File is outside the selected read boundary");
  FixedDescriptor parent(open("/",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
  for(const auto& part:path.parent_path().relative_path()) {
    const auto name=part.string();
    if(parent.value<0||name.empty()||name=="."||name=="..")return SelectedScopeFail(env,"Selected file directory changed");
    int next=openat(parent.value,name.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);
    if(next<0)return SelectedScopeFail(env,"Selected file directory changed");
    close(parent.value);parent.value=next;
  }
  file->leaf=path.filename().string();file->parent=parent.value;parent.value=-1;
  file->fd=openat(file->parent,file->leaf.c_str(),O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC);
  if(file->fd<0||fstat(file->fd,&file->identity)!=0||!S_ISREG(file->identity.st_mode)||
      file->identity.st_nlink!=1||file->identity.st_size<0||!file->Stable()||!scope->Current(env))
    return SelectedScopeFail(env,"Selected file must remain a regular single-link file");
  file->bound=true;
  std::array<char,PATH_MAX> parent_path{};
  if(fcntl(file->parent,F_GETPATH,parent_path.data())!=0||std::filesystem::path(parent_path.data())!=path.parent_path())
    return SelectedScopeFail(env,"Original selected file directory moved");
  {std::lock_guard lock(SelectedReaders().mutex);std::erase_if(SelectedReaders().files,[](auto& weak){return weak.expired();});SelectedReaders().files.push_back(file);}
  napi_value object,size;
  if(napi_create_object(env,&object)!=napi_ok||napi_create_double(env,static_cast<double>(file->identity.st_size),&size)!=napi_ok)return nullptr;
  const napi_property_descriptor methods[]={
    {"read",nullptr,SelectedFileReadChunk,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"close",nullptr,SelectedFileClose,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"size",nullptr,nullptr,nullptr,nullptr,size,napi_default,nullptr}};
  auto* retained=new std::shared_ptr<SelectedFileReader>(file);
  if(napi_type_tag_object(env,object,&kSelectedReaderTag)!=napi_ok||napi_wrap(env,object,retained,SelectedFileFinalize,nullptr,nullptr)!=napi_ok){delete retained;return nullptr;}
  if(napi_define_properties(env,object,std::size(methods),methods)!=napi_ok)return nullptr;
  return object;
}

// Private selected-session browser file helpers. The original file.access hook
// admits input/destination before this facade; native checks remain deny-only.
struct SelectedBrowserFileOperation {
  std::shared_ptr<SelectedBuiltinScope> scope;
  ~SelectedBrowserFileOperation(){scope->Finish();}
};
FixedDescriptor SelectedBrowserDirectory(const std::filesystem::path& path) {
  if(!path.is_absolute())return {};
  FixedDescriptor parent(open("/",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
  if(parent.value<0)return {};
  for(const auto& part:path.relative_path()) {
    const auto name=part.string();if(name.empty()||name=="."||name=="..")return {};
    int next=openat(parent.value,name.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);
    if(next<0)return {};
    close(parent.value);parent.value=next;
  }
  std::array<char,PATH_MAX> actual{};
  if(fcntl(parent.value,F_GETPATH,actual.data())!=0||std::filesystem::path(actual.data())!=path)return {};
  return parent;
}
bool SelectedBrowserSameFile(const struct stat& a,const struct stat& b) {
  return S_ISREG(a.st_mode)&&S_ISREG(b.st_mode)&&a.st_nlink==1&&b.st_nlink==1&&
      a.st_dev==b.st_dev&&a.st_ino==b.st_ino&&a.st_size==b.st_size&&
      a.st_mtimespec.tv_sec==b.st_mtimespec.tv_sec&&a.st_mtimespec.tv_nsec==b.st_mtimespec.tv_nsec&&
      a.st_ctimespec.tv_sec==b.st_ctimespec.tv_sec&&a.st_ctimespec.tv_nsec==b.st_ctimespec.tv_nsec;
}
napi_value SelectedReadUploadFile(napi_env env,napi_callback_info info) {
  size_t count=1;napi_value args[1];auto scope=SelectedScopeInfo(env,info,count,args);std::string requested;
  if(!scope||count!=1||!SelectedReadString(env,args[0],requested,PATH_MAX)||!scope->Begin(env))
    return SelectedScopeFail(env,"Original selected upload is unavailable");
  SelectedBrowserFileOperation operation{scope};
  std::error_code error;auto path=std::filesystem::canonical(requested,error);
  if(error||(!FixedPathAllowed(path.string(),scope->captured.owner->handle,false)&&!scope->Allows(env,path.string(),false)))
    return SelectedScopeFail(env,"Upload is outside the admitted file boundary");
  auto parent=SelectedBrowserDirectory(path.parent_path());const auto leaf=path.filename().string();
  FixedDescriptor input(parent.value<0?-1:openat(parent.value,leaf.c_str(),O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC));
  struct stat before{},after{},named{};
  constexpr size_t maximum=64*1024*1024;
  if(input.value<0||fstat(input.value,&before)!=0||!S_ISREG(before.st_mode)||before.st_nlink!=1||before.st_size<0||uint64_t(before.st_size)>maximum)
    return SelectedScopeFail(env,"Upload must be a stable regular file of at most 64 MiB");
  std::vector<unsigned char> bytes(static_cast<size_t>(before.st_size));size_t offset=0;
  while(offset<bytes.size()) {
    auto n=read(input.value,bytes.data()+offset,bytes.size()-offset);
    if(n<0&&errno==EINTR)continue;
    if(n<=0)return SelectedScopeFail(env,"Upload changed during its snapshot");
    offset+=static_cast<size_t>(n);
  }
  if(fstat(input.value,&after)!=0||fstatat(parent.value,leaf.c_str(),&named,AT_SYMLINK_NOFOLLOW)!=0||
      !SelectedBrowserSameFile(before,after)||!SelectedBrowserSameFile(before,named)||!scope->Current(env))
    return SelectedScopeFail(env,"Original upload identity changed");
  close(input.value);input.value=-1;close(parent.value);parent.value=-1;
  napi_value result,buffer,name;
  if(napi_create_object(env,&result)!=napi_ok||napi_create_buffer_copy(env,bytes.size(),bytes.data(),nullptr,&buffer)!=napi_ok||
      napi_create_string_utf8(env,leaf.data(),leaf.size(),&name)!=napi_ok||napi_set_named_property(env,result,"buffer",buffer)!=napi_ok||
      napi_set_named_property(env,result,"name",name)!=napi_ok)return nullptr;
  return result;
}
napi_value SelectedPublishBrowserDownload(napi_env env,napi_callback_info info) {
  size_t count=3;napi_value args[3];auto scope=SelectedScopeInfo(env,info,count,args);
  void* data=nullptr;size_t size=0;std::string name,destination;
  if(!scope||count<2||!SelectedReadString(env,args[1],name,1024)||
      napi_get_buffer_info(env,args[0],&data,&size)!=napi_ok||size>64*1024*1024||
      (count==3&&!SelectedReadString(env,args[2],destination,PATH_MAX))||!scope->Begin(env))
    return SelectedScopeFail(env,"Original browser download publication is unavailable");
  SelectedBrowserFileOperation operation{scope};
  FixedDescriptor parent;std::string leaf;
  if(destination.empty()) {
    int32_t fd=-1;
    if(AuxCopySelectedSessionDirectory(scope->captured.owner->handle,scope->session,2,&fd)!=0)
      return SelectedScopeFail(env,"Original task download directory is unavailable");
    parent=FixedDescriptor(fd);
    if(mkdirat(parent.value,"artifacts",0700)!=0&&errno!=EEXIST)
      return SelectedScopeFail(env,"Task artifact directory is unavailable");
    FixedDescriptor artifacts(openat(parent.value,"artifacts",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));
    struct stat artifact_identity{};
    if(artifacts.value<0||fstat(artifacts.value,&artifact_identity)!=0||!S_ISDIR(artifact_identity.st_mode)||
        artifact_identity.st_uid!=geteuid()||(artifact_identity.st_mode&0022))
      return SelectedScopeFail(env,"Task artifact directory changed");
    parent=std::move(artifacts);
    for(auto& c:name)if(!((c>='a'&&c<='z')||(c>='A'&&c<='Z')||(c>='0'&&c<='9')||c=='.'||c=='-'||c=='_'))c='_';
    if(name.empty()||name=="."||name=="..")name="download";
    name=name.substr(0,128);
  } else {
    std::error_code error;auto path=std::filesystem::weakly_canonical(std::filesystem::absolute(destination,error),error);
    if(error||(!FixedPathAllowed(path.string(),scope->captured.owner->handle,false)&&!scope->Allows(env,path.string(),true)))
      return SelectedScopeFail(env,"Download destination is outside the admitted file boundary");
    parent=FixedOpenOutputDirectory(path.parent_path());leaf=path.filename().string();
  }
  if(parent.value<0)return SelectedScopeFail(env,"Download destination directory is unavailable");
  std::array<unsigned char,16> random{};arc4random_buf(random.data(),random.size());
  constexpr char hex[]="0123456789abcdef";std::string nonce;
  for(auto byte:random){nonce+=hex[byte>>4];nonce+=hex[byte&15];}
  if(leaf.empty())leaf="browser-download-"+nonce+"-"+name;
  const auto temporary=".aux-browser-download-"+nonce+".part";
  FixedDescriptor output(openat(parent.value,temporary.c_str(),O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0600));
  if(output.value<0)return SelectedScopeFail(env,"Download stage is unavailable");
  size_t offset=0;
  while(offset<size) {
    auto n=write(output.value,static_cast<unsigned char*>(data)+offset,size-offset);
    if(n<0&&errno==EINTR)continue;
    if(n<=0)return SelectedScopeFail(env,"Download stage was interrupted");
    offset+=static_cast<size_t>(n);
  }
  struct stat stable{};std::array<char,PATH_MAX> parent_path{};
  if(fstat(output.value,&stable)!=0||!S_ISREG(stable.st_mode)||stable.st_nlink!=1||uint64_t(stable.st_size)!=size||
      fsync(output.value)!=0||fcntl(parent.value,F_GETPATH,parent_path.data())!=0||!scope->Current(env))
    return SelectedScopeFail(env,"Download stage did not settle");
  const auto published=(std::filesystem::path(parent_path.data())/leaf).string();
  if(!FixedPathAllowed(published,scope->captured.owner->handle,false)&&!scope->Allows(env,published,true))
    return SelectedScopeFail(env,"Original download destination changed");
  if(close(output.value)!=0){output.value=-1;scope->MarkUnknown();return SelectedScopeFail(env,"Download stage close is unknown");}output.value=-1;
  if(renameat(parent.value,temporary.c_str(),parent.value,leaf.c_str())!=0||fsync(parent.value)!=0||!scope->Current(env))
    return SelectedScopeFail(env,"Download publication did not settle");
  close(parent.value);parent.value=-1;
  napi_value result;if(napi_create_string_utf8(env,published.data(),published.size(),&result)!=napi_ok)return nullptr;
  return result;
}

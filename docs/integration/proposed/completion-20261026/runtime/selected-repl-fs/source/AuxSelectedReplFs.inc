// Existing selected owner; finite original Repl fs operations only. Preparation
// retains actual descriptors before the private original permission hook awaits.
struct SelectedFsOperation:std::enable_shared_from_this<SelectedFsOperation> {
  struct Target {FixedDescriptor parent,file;std::string path,parent_path,leaf;std::vector<std::string> missing;struct stat identity{};bool existed=false;};
  std::shared_ptr<SelectedBuiltinScope> scope;
  napi_env env=nullptr;
  std::string method;
  std::vector<Target> targets;
  std::mutex mutex;
  bool used=false,closed=false;
  bool CloseLocked(){
    if(closed)return false;closed=true;bool complete=true;
    for(auto& target:targets)for(auto* fd:{&target.file,&target.parent})if(fd->value>=0){const int actual=std::exchange(fd->value,-1);if(close(actual)!=0)complete=false;}
    if(!complete)scope->MarkUnknown();return true;
  }
  void Close(){if(getpid()!=kHostProcess)return;bool finish;{std::lock_guard lock(mutex);finish=CloseLocked();}if(finish)scope->Finish();}
  ~SelectedFsOperation(){Close();}
};
void StopSelectedFsOperations(SelectedBuiltinScope* scope){
  std::vector<std::shared_ptr<SelectedFsOperation>> operations;
  {std::lock_guard lock(scope->mutex);for(auto& weak:scope->fs_operations)if(auto operation=weak.lock())operations.push_back(operation);scope->fs_operations.clear();}
  for(auto& operation:operations)operation->Close();
}
const char* SelectedFsCode(int code){
  switch(code){case ENOENT:return "ENOENT";case EEXIST:return "EEXIST";case EACCES:return "EACCES";case EPERM:return "EPERM";case ENOTDIR:return "ENOTDIR";case EISDIR:return "EISDIR";case ENOTEMPTY:return "ENOTEMPTY";case EXDEV:return "EXDEV";case ELOOP:return "ELOOP";case EINVAL:return "EINVAL";case EBUSY:return "EBUSY";case EAGAIN:return "EAGAIN";case EMFILE:return "EMFILE";case ENFILE:return "ENFILE";case ENOSPC:return "ENOSPC";case EROFS:return "EROFS";case ENAMETOOLONG:return "ENAMETOOLONG";case EFBIG:return "EFBIG";default:return "EIO";}
}
napi_value SelectedFsError(napi_env env,const std::string& operation,const std::string& path,int code){
  napi_value message,error,value;const std::string text=std::string(SelectedFsCode(code))+": "+strerror(code)+", "+operation+" '"+path+"'";
  if(napi_create_string_utf8(env,text.data(),text.size(),&message)!=napi_ok||napi_create_error(env,nullptr,message,&error)!=napi_ok)return nullptr;
  auto field=[&](const char* key,const std::string& text){return napi_create_string_utf8(env,text.data(),text.size(),&value)==napi_ok&&napi_set_named_property(env,error,key,value)==napi_ok;};
  if(!field("code",SelectedFsCode(code))||!field("syscall",operation)||!field("path",path)||napi_create_int32(env,-code,&value)!=napi_ok||napi_set_named_property(env,error,"errno",value)!=napi_ok)return nullptr;
  napi_throw(env,error);return nullptr;
}
bool SelectedFsWithin(const std::string& path,const std::string& root){return path==root||(path.size()>root.size()&&path.starts_with(root)&&path[root.size()]=='/');}
// Every selected root comes from the live native account/session owner. Public
// paths are still subject to the original JS resolver and permission hook.
struct SelectedFsRoots {
  std::shared_ptr<SelectedBuiltinScope> scope;
  std::array<int32_t,7> fd{-1,-1,-1,-1,-1,-1,-1};
  std::array<std::string,7> path;
  ~SelectedFsRoots(){for(auto& value:fd)if(value>=0){const int actual=std::exchange(value,-1);if(close(actual)!=0)scope->MarkUnknown();}}
  bool Load(){
    const auto handle=scope->captured.owner->handle;uint64_t generation=0;
    if(AuxCopySelectedAccountDirectory(handle,scope->account,2,&fd[0])!=0||
       AuxCopySelectedSessionDirectory(handle,scope->session,2,&fd[1])!=0||
       AuxCopySelectedSessionDirectory(handle,scope->session,3,&fd[2])!=0||
       AuxNativeContextCopyStorageRoots(handle,&generation,&fd[3],&fd[4])!=0||!generation)return false;
    for(uint32_t role=1;role<=2;++role){generation=0;if(AuxNativeContextCopyBrowserRoot(handle,role,&generation,&fd[4+role])!=0||!generation)return false;}
    for(size_t i=0;i<fd.size();++i){std::array<char,PATH_MAX> value{};struct stat identity{};if(!ReadExecRoot(fd[i],value.data(),&identity))return false;path[i]=value.data();}
    return scope->Current(scope->env);
  }
  bool Allows(const std::string& value,bool mutation,bool root_operation){
    const auto app=FixedContainingApp();if(!app)return false;
    auto overlaps=[&](const std::string& root){return SelectedFsWithin(value,root)||SelectedFsWithin(root,value);};
    if(overlaps(app->string()))return false;
    // Task is the only protected tree with a selected-account exception.
    // A workspace can never override Control, browser, app or foreign Task.
    for(size_t i:{size_t(3),size_t(5),size_t(6)})if(overlaps(path[i]))return false;
    if(overlaps(path[4])&&!SelectedFsWithin(value,path[0]))return false;
    if(mutation&&!root_operation)for(size_t i=0;i<3;++i)if(SelectedFsWithin(path[i],value))return false;
    return scope->Current(scope->env);
  }
};
bool SelectedFsParentCurrent(const SelectedFsOperation::Target& target){
  std::array<char,PATH_MAX> path{};
  return target.parent.value>=0&&fcntl(target.parent.value,F_GETPATH,path.data())==0&&std::filesystem::path(path.data())==target.parent_path;
}
bool SelectedFsOpenParent(SelectedFsRoots& roots,const std::filesystem::path& parent,SelectedFsOperation::Target& target){
  std::filesystem::path start="/";int selected=-1;
  for(size_t i=0;i<3;++i)if(SelectedFsWithin(parent.string(),roots.path[i])&&roots.path[i].size()>start.string().size()){start=roots.path[i];selected=static_cast<int>(i);}
  target.parent=FixedDescriptor(selected<0?open("/",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC):fcntl(roots.fd[selected],F_DUPFD_CLOEXEC,0));
  if(target.parent.value<0)return false;
  const auto relative=parent.lexically_relative(start);
  for(const auto& part:relative){
    const auto leaf=part.string();if(leaf==".")continue;
    if(leaf.empty()||leaf==".."||leaf.find('/')!=std::string::npos){errno=EPERM;return false;}
    const int next=openat(target.parent.value,leaf.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC);
    if(next<0)return false;
    const int previous=std::exchange(target.parent.value,next);
    if(close(previous)!=0){roots.scope->MarkUnknown();return false;}
  }
  return SelectedFsParentCurrent(target)&&roots.scope->Current(roots.scope->env);
}
bool SelectedFsResolve(std::filesystem::path input,bool follow,std::filesystem::path& result){
  for(unsigned links=0;links<=40;++links){
    std::filesystem::path current="/";bool restarted=false;
    auto relative=input.relative_path();
    for(auto iterator=relative.begin();iterator!=relative.end();++iterator){
      const auto parent=current;current/=*iterator;
      if(current.string().size()>=PATH_MAX){errno=ENAMETOOLONG;return false;}
      struct stat identity{};
      if(lstat(current.c_str(),&identity)!=0){
        if(errno!=ENOENT)return false;
        for(++iterator;iterator!=relative.end();++iterator)current/=*iterator;
        result=current;if(result.string().size()>=PATH_MAX){errno=ENAMETOOLONG;return false;}return true;
      }
      auto next=iterator;++next;
      if(S_ISLNK(identity.st_mode)&&(follow||next!=relative.end())){
        if(links==40){errno=ELOOP;return false;}
        std::array<char,PATH_MAX> value{};const ssize_t size=readlink(current.c_str(),value.data(),value.size());
        if(size<0)return false;if(static_cast<size_t>(size)>=value.size()){errno=ENAMETOOLONG;return false;}
        std::filesystem::path target(std::string(value.data(),static_cast<size_t>(size)));
        input=target.is_absolute()?target:parent/target;
        for(;next!=relative.end();++next)input/=*next;
        input=input.lexically_normal();restarted=true;break;
      }
      if(next!=relative.end()&&!S_ISDIR(identity.st_mode)){errno=ENOTDIR;return false;}
    }
    if(!restarted){result=current;return true;}
  }
  errno=ELOOP;return false;
}
bool SelectedFsPrepareTarget(const std::shared_ptr<SelectedBuiltinScope>& scope,const std::string& method,const std::string& requested,bool destination,SelectedFsOperation::Target& target){
  std::error_code error;auto input=std::filesystem::absolute(requested,error).lexically_normal();
  if(error||input.string().size()>=PATH_MAX||!input.is_absolute()){errno=EINVAL;return false;}
  const bool follow=method=="readFile"||method=="stat"||method=="readdir"||method=="access"||method=="writeFile"||method=="copyFile"||method=="mkdir";
  std::filesystem::path actual;if(!SelectedFsResolve(input,follow,actual))return false;
  auto nearest=actual.parent_path();
  if(!std::filesystem::is_directory(nearest,error)){
    if(method!="mkdir"&&method!="rm"){errno=error?error.value():ENOENT;return false;}
    auto current=actual;
    for(;;){
      target.missing.insert(target.missing.begin(),current.filename().string());current=current.parent_path();
      struct stat st{};if(lstat(current.c_str(),&st)==0){if(!S_ISDIR(st.st_mode)){errno=ENOTDIR;return false;}break;}
      if(errno!=ENOENT||current==current.parent_path())return false;
    }
  }
  target.path=actual.string();target.leaf=actual.filename().string();
  if(target.leaf.empty()||target.leaf=="."||target.leaf==".."||target.leaf.find('/')!=std::string::npos){errno=EINVAL;return false;}
  const bool mutation=destination||method=="writeFile"||method=="mkdir"||method=="unlink"||method=="rm"||method=="rename";
  SelectedFsRoots roots{scope};
  if(!roots.Load()||!roots.Allows(target.path,mutation,method=="mkdir")){errno=EPERM;return false;}
  auto parent=actual.parent_path();if(!target.missing.empty()){parent=actual;for(size_t i=0;i<target.missing.size();++i)parent=parent.parent_path();}
  target.parent_path=parent.string();if(!SelectedFsOpenParent(roots,parent,target))return false;
  if(target.missing.empty()){
    target.existed=fstatat(target.parent.value,target.leaf.c_str(),&target.identity,AT_SYMLINK_NOFOLLOW)==0;
    if(!target.existed&&errno!=ENOENT)return false;
    if(target.existed&&S_ISREG(target.identity.st_mode)&&target.identity.st_nlink!=1&&method!="unlink"&&method!="rm"&&method!="rename"){errno=EPERM;return false;}
  }
  if(method=="readFile"||method=="readdir"||(method=="copyFile"&&!destination)){
    const auto before=target.identity;
    target.file=FixedDescriptor(openat(target.parent.value,target.leaf.c_str(),O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC));
    if(target.file.value<0||fstat(target.file.value,&target.identity)!=0)return false;
    if(!target.existed||before.st_dev!=target.identity.st_dev||before.st_ino!=target.identity.st_ino){errno=EAGAIN;return false;}
    if((method=="readFile"||method=="copyFile")&&(!S_ISREG(target.identity.st_mode)||target.identity.st_nlink!=1)){errno=S_ISDIR(target.identity.st_mode)?EISDIR:EPERM;return false;}
    if(method=="readdir"&&!S_ISDIR(target.identity.st_mode)){errno=ENOTDIR;return false;}
  }
  return scope->Current(scope->env);
}
bool SelectedFsBoolean(napi_env env,napi_value options,const char* name,bool& result){
  bool present=false;if(napi_has_named_property(env,options,name,&present)!=napi_ok)return false;if(!present)return true;
  napi_value value;return napi_get_named_property(env,options,name,&value)==napi_ok&&napi_get_value_bool(env,value,&result)==napi_ok;
}
bool SelectedFsUnsigned(napi_env env,napi_value options,const char* name,uint32_t& result){
  bool present=false;if(napi_has_named_property(env,options,name,&present)!=napi_ok)return false;if(!present)return true;
  napi_value value;return napi_get_named_property(env,options,name,&value)==napi_ok&&napi_get_value_uint32(env,value,&result)==napi_ok;
}
napi_value SelectedFsStat(napi_env env,const struct stat& st){
  napi_value result,value;if(napi_create_object(env,&result)!=napi_ok)return nullptr;
  auto number=[&](const char* key,double number){return napi_create_double(env,number,&value)==napi_ok&&napi_set_named_property(env,result,key,value)==napi_ok;};
  if(!number("dev",st.st_dev)||!number("mode",st.st_mode)||!number("nlink",st.st_nlink)||!number("uid",st.st_uid)||!number("gid",st.st_gid)||!number("rdev",st.st_rdev)||!number("blksize",st.st_blksize)||!number("ino",st.st_ino)||!number("size",st.st_size)||!number("blocks",st.st_blocks)||!number("atimeMs",st.st_atimespec.tv_sec*1000.0+st.st_atimespec.tv_nsec/1e6)||!number("mtimeMs",st.st_mtimespec.tv_sec*1000.0+st.st_mtimespec.tv_nsec/1e6)||!number("ctimeMs",st.st_ctimespec.tv_sec*1000.0+st.st_ctimespec.tv_nsec/1e6)||!number("birthtimeMs",st.st_birthtimespec.tv_sec*1000.0+st.st_birthtimespec.tv_nsec/1e6))return nullptr;
  return result;
}
struct SelectedFsCloseGuard {
  std::shared_ptr<SelectedBuiltinScope> scope;FixedDescriptor& descriptor;
  ~SelectedFsCloseGuard(){if(descriptor.value>=0){const int fd=std::exchange(descriptor.value,-1);if(close(fd)!=0)scope->MarkUnknown();}}
};
bool SelectedFsRemove(const std::shared_ptr<SelectedBuiltinScope>& scope,int parent,const std::string& leaf,bool recursive,bool force){
  if(!scope->Current(scope->env)){errno=EPERM;return false;}
  struct stat st{};if(fstatat(parent,leaf.c_str(),&st,AT_SYMLINK_NOFOLLOW)!=0)return force&&errno==ENOENT;
  if(S_ISDIR(st.st_mode)){
    if(!recursive){errno=EISDIR;return false;}
    FixedDescriptor directory(openat(parent,leaf.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC));SelectedFsCloseGuard directory_close{scope,directory};if(directory.value<0)return false;
    int cursor=openat(directory.value,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);DIR* stream=cursor<0?nullptr:fdopendir(cursor);if(!stream){if(cursor>=0&&close(cursor)!=0)scope->MarkUnknown();return false;}
    bool complete=true;int failure=0;errno=0;
    while(auto* entry=readdir(stream)){if(!strcmp(entry->d_name,".")||!strcmp(entry->d_name,".."))continue;if(!SelectedFsRemove(scope,directory.value,entry->d_name,true,force)){complete=false;failure=errno;break;}errno=0;}
    if(errno&&!failure){failure=errno;complete=false;}if(closedir(stream)!=0){scope->MarkUnknown();complete=false;failure=errno;}
    const bool closed=close(directory.value)==0;directory.value=-1;if(!closed){scope->MarkUnknown();return false;}if(!complete){errno=failure;return false;}
    struct stat named{};if(fstatat(parent,leaf.c_str(),&named,AT_SYMLINK_NOFOLLOW)!=0||st.st_dev!=named.st_dev||st.st_ino!=named.st_ino){errno=EAGAIN;return false;}
    if(unlinkat(parent,leaf.c_str(),AT_REMOVEDIR)!=0)return false;
  }else if(unlinkat(parent,leaf.c_str(),0)!=0)return force&&errno==ENOENT;
  if(fsync(parent)!=0){scope->MarkUnknown();return false;}return true;
}
bool SelectedFsPublish(SelectedFsOperation& operation,const void* bytes,size_t size,SelectedFsOperation::Target* source){
  auto& destination=operation.targets.back();auto scope=operation.scope;
  std::array<unsigned char,16> random{};arc4random_buf(random.data(),random.size());std::string temporary=".aux-selected-fs-";constexpr char hex[]="0123456789abcdef";
  for(auto byte:random){temporary+=hex[byte>>4];temporary+=hex[byte&15];}temporary+=".part";
  FixedDescriptor output(openat(destination.parent.value,temporary.c_str(),O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0666));if(output.value<0)return false;
  // Reuse the actual existing publication owner's durable cleanup/unknown rule.
  SelectedBrowserDownloadStage stage{scope,output,destination.parent,temporary};
  std::array<unsigned char,64*1024> buffer{};size_t offset=0;
  while(offset<size){
    if(!scope->Current(scope->env)){errno=EPERM;return false;}
    size_t count=std::min(buffer.size(),size-offset);const unsigned char* data=source?nullptr:static_cast<const unsigned char*>(bytes)+offset;
    if(source){ssize_t actual=pread(source->file.value,buffer.data(),count,offset);if(actual<0&&errno==EINTR)continue;if(actual<=0){errno=EAGAIN;return false;}count=static_cast<size_t>(actual);data=buffer.data();}
    size_t written=0;while(written<count){ssize_t n=write(output.value,data+written,count-written);if(n<0&&errno==EINTR)continue;if(n<=0)return false;written+=static_cast<size_t>(n);}offset+=count;
  }
  if(source){struct stat after{};if(fstat(source->file.value,&after)!=0||!SelectedBrowserSameFile(source->identity,after)){errno=EAGAIN;return false;}}
  struct stat prior{};
  if(fstatat(destination.parent.value,destination.leaf.c_str(),&prior,AT_SYMLINK_NOFOLLOW)==0){if(S_ISDIR(prior.st_mode)){errno=EISDIR;return false;}if(S_ISREG(prior.st_mode)&&!source&&fchmod(output.value,prior.st_mode&0777)!=0)return false;}
  else if(errno!=ENOENT)return false;
  if(source&&fchmod(output.value,source->identity.st_mode&0777)!=0)return false;
  if(fsync(output.value)!=0||!SelectedFsParentCurrent(destination)||!scope->Current(scope->env))return false;
  const int fd=std::exchange(output.value,-1);if(close(fd)!=0){scope->MarkUnknown();return false;}
  if(renameat(destination.parent.value,temporary.c_str(),destination.parent.value,destination.leaf.c_str())!=0)return false;
  stage.published=true;
  if(fsync(destination.parent.value)!=0||!scope->Current(scope->env)){scope->MarkUnknown();return false;}
  stage.complete=true;return true;
}
constexpr napi_type_tag kSelectedFsTag{0x6175787265706c66ULL,0x736f776e65727631ULL};
std::shared_ptr<SelectedFsOperation> SelectedFsInfo(napi_env env,napi_callback_info info,size_t& count,napi_value* args){
  if(getpid()!=kHostProcess)return {};
  napi_value self;void* data=nullptr;
  bool tagged=false;
  if(napi_get_cb_info(env,info,&count,args,&self,nullptr)!=napi_ok||napi_check_object_type_tag(env,self,&kSelectedFsTag,&tagged)!=napi_ok||!tagged||napi_unwrap(env,self,&data)!=napi_ok||!data)return {};
  auto operation=*static_cast<std::shared_ptr<SelectedFsOperation>*>(data);return operation->env==env?operation:nullptr;
}
napi_value SelectedFsClose(napi_env env,napi_callback_info info){
  size_t count=0;auto operation=SelectedFsInfo(env,info,count,nullptr);if(!operation)return SelectedFsError(env,"close","",EPERM);operation->Close();{std::lock_guard lock(operation->scope->mutex);if(operation->scope->unknown)return SelectedFsError(env,"close","",EIO);}napi_value result;napi_get_undefined(env,&result);return result;
}
napi_value SelectedFsExecute(napi_env env,napi_callback_info info){
  size_t count=1;napi_value args[1];auto operation=SelectedFsInfo(env,info,count,args);
  if(!operation)return SelectedFsError(env,"fs","",EPERM);
  std::unique_lock lock(operation->mutex);
  if(operation->closed||operation->used||!operation->scope->Current(env))return SelectedFsError(env,operation->method,operation->targets[0].path,EPERM);
  operation->used=true;
  struct Finish {SelectedFsOperation& operation;std::unique_lock<std::mutex>& lock;
    void Now(){if(!lock.owns_lock())return;const bool finish=operation.CloseLocked();lock.unlock();if(finish)operation.scope->Finish();}
    ~Finish(){Now();}
  }finish{*operation,lock};
  auto& target=operation->targets[0];auto scope=operation->scope;
  auto fail=[&](int code){return SelectedFsError(env,operation->method,target.path,code?code:EIO);};
  napi_value result;if(napi_get_undefined(env,&result)!=napi_ok)return nullptr;
  for(const auto& item:operation->targets){
    if(!SelectedFsParentCurrent(item))return fail(EAGAIN);
    if(item.missing.empty()){
      struct stat named{};const bool exists=fstatat(item.parent.value,item.leaf.c_str(),&named,AT_SYMLINK_NOFOLLOW)==0;
      if(!exists&&errno!=ENOENT)return fail(errno);
      if(exists!=item.existed||(exists&&(named.st_dev!=item.identity.st_dev||named.st_ino!=item.identity.st_ino||(named.st_mode&S_IFMT)!=(item.identity.st_mode&S_IFMT))))return fail(EAGAIN);
    }
  }
  if(operation->method=="readFile"){
    if(target.identity.st_size<0||uint64_t(target.identity.st_size)>std::numeric_limits<size_t>::max())return fail(EFBIG);
    const size_t size=static_cast<size_t>(target.identity.st_size);void* data=nullptr;
    if(napi_create_buffer(env,size,&data,&result)!=napi_ok)return nullptr;
    size_t offset=0;while(offset<size){if(!scope->Current(env))return fail(EPERM);auto n=pread(target.file.value,static_cast<char*>(data)+offset,std::min<size_t>(64*1024,size-offset),offset);if(n<0&&errno==EINTR)continue;if(n<=0)return fail(EAGAIN);offset+=static_cast<size_t>(n);}
    struct stat after{};if(fstat(target.file.value,&after)!=0||!SelectedBrowserSameFile(target.identity,after))return fail(EAGAIN);
  }else if(operation->method=="writeFile"){
    void* data=nullptr;size_t size=0;if(count!=1||napi_get_buffer_info(env,args[0],&data,&size)!=napi_ok)return fail(EINVAL);
    if(!SelectedFsPublish(*operation,data,size,nullptr))return fail(errno);
  }else if(operation->method=="copyFile"){
    if(target.identity.st_size<0||uint64_t(target.identity.st_size)>std::numeric_limits<size_t>::max())return fail(EFBIG);
    if(!SelectedFsPublish(*operation,nullptr,static_cast<size_t>(target.identity.st_size),&target))return fail(errno);
  }else if(operation->method=="stat"||operation->method=="lstat"){
    struct stat current{};
    if(fstatat(target.parent.value,target.leaf.c_str(),&current,AT_SYMLINK_NOFOLLOW)!=0)return fail(errno);
    result=SelectedFsStat(env,current);if(!result)return nullptr;
  }else if(operation->method=="access"){
    struct stat current{};if(fstatat(target.parent.value,target.leaf.c_str(),&current,AT_SYMLINK_NOFOLLOW)!=0)return fail(errno);
  }else if(operation->method=="readdir"){
    const int cursor=openat(target.file.value,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);DIR* stream=cursor<0?nullptr:fdopendir(cursor);
    if(!stream){if(cursor>=0&&close(cursor)!=0)scope->MarkUnknown();return fail(errno);}
    bool complete=napi_create_array(env,&result)==napi_ok;uint32_t index=0;int failure=0;errno=0;
    while(complete){auto* entry=readdir(stream);if(!entry){failure=errno;break;}if(!strcmp(entry->d_name,".")||!strcmp(entry->d_name,".."))continue;
      struct stat st{};if(!scope->Current(env)||fstatat(target.file.value,entry->d_name,&st,AT_SYMLINK_NOFOLLOW)!=0){failure=errno?errno:EPERM;complete=false;break;}
      napi_value item,name,mode;if(napi_create_object(env,&item)!=napi_ok||napi_create_string_utf8(env,entry->d_name,NAPI_AUTO_LENGTH,&name)!=napi_ok||napi_create_uint32(env,st.st_mode,&mode)!=napi_ok||napi_set_named_property(env,item,"name",name)!=napi_ok||napi_set_named_property(env,item,"mode",mode)!=napi_ok||napi_set_element(env,result,index++,item)!=napi_ok){complete=false;failure=EIO;break;}errno=0;
    }
    if(closedir(stream)!=0){scope->MarkUnknown();complete=false;failure=errno;}if(!complete||failure)return fail(failure);
  }else if(operation->method=="mkdir"){
    napi_value options;if(count)options=args[0];else if(napi_create_object(env,&options)!=napi_ok)return nullptr;
    bool recursive=false;uint32_t mode=0777;if(!SelectedFsBoolean(env,options,"recursive",recursive)||!SelectedFsUnsigned(env,options,"mode",mode))return fail(EINVAL);
    std::vector<std::string> leaves=target.missing.empty()?std::vector<std::string>{target.leaf}:target.missing;
    if(!recursive&&leaves.size()>1)return fail(ENOENT);
    FixedDescriptor parent(fcntl(target.parent.value,F_DUPFD_CLOEXEC,0));SelectedFsCloseGuard parent_close{scope,parent};if(parent.value<0)return fail(errno);
    bool complete=true;int failure=0;std::string first;
    for(const auto& leaf:leaves){
      if(!scope->Current(env)){complete=false;failure=EPERM;break;}
      if(mkdirat(parent.value,leaf.c_str(),mode)==0){if(first.empty()){std::array<char,PATH_MAX> path{};if(fcntl(parent.value,F_GETPATH,path.data())!=0){complete=false;failure=errno;break;}first=(std::filesystem::path(path.data())/leaf).string();}if(fsync(parent.value)!=0){scope->MarkUnknown();complete=false;failure=errno;break;}}
      else if(errno!=EEXIST||!recursive){complete=false;failure=errno;break;}
      FixedDescriptor next(openat(parent.value,leaf.c_str(),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC));SelectedFsCloseGuard next_close{scope,next};if(next.value<0){complete=false;failure=errno;break;}
      const int fd=std::exchange(parent.value,-1);if(close(fd)!=0){scope->MarkUnknown();complete=false;failure=errno;break;}parent=std::move(next);
    }
    const int fd=std::exchange(parent.value,-1);if(fd>=0&&close(fd)!=0){scope->MarkUnknown();complete=false;failure=errno;}if(!complete)return fail(failure);
    if(recursive&&!first.empty()&&napi_create_string_utf8(env,first.data(),first.size(),&result)!=napi_ok)return nullptr;
  }else if(operation->method=="unlink"){
    if(unlinkat(target.parent.value,target.leaf.c_str(),0)!=0)return fail(errno);
    if(fsync(target.parent.value)!=0){scope->MarkUnknown();return fail(errno);}
  }else if(operation->method=="rm"){
    napi_value options;if(count)options=args[0];else if(napi_create_object(env,&options)!=napi_ok)return nullptr;
    bool recursive=false,force=false;if(!SelectedFsBoolean(env,options,"recursive",recursive)||!SelectedFsBoolean(env,options,"force",force))return fail(EINVAL);
    if(!target.missing.empty()){struct stat named{};if(fstatat(target.parent.value,target.missing.front().c_str(),&named,AT_SYMLINK_NOFOLLOW)==0)return fail(EAGAIN);if(errno!=ENOENT)return fail(errno);if(!force)return fail(ENOENT);}
    else if(!SelectedFsRemove(scope,target.parent.value,target.leaf,recursive,force))return fail(errno);
  }else if(operation->method=="rename"){
    auto& destination=operation->targets[1];
    if(renameat(target.parent.value,target.leaf.c_str(),destination.parent.value,destination.leaf.c_str())!=0)return fail(errno);
    if(fsync(target.parent.value)!=0||fsync(destination.parent.value)!=0){scope->MarkUnknown();return fail(errno);}
  }else return fail(EINVAL);
  if(!scope->Current(env))return fail(EPERM);
  finish.Now();
  bool unknown;{std::lock_guard scope_lock(scope->mutex);unknown=scope->unknown;}if(unknown)return fail(EIO);
  return result;
}
void SelectedFsFinalize(napi_env,void* data,void*){delete static_cast<std::shared_ptr<SelectedFsOperation>*>(data);}
napi_value SelectedPrepareFs(napi_env env,napi_callback_info info){
  size_t count=3;napi_value args[3];auto scope=SelectedScopeInfo(env,info,count,args);std::string method,first,second;
  if(kBrowserOnlyNativeStartup||!scope||count<2||!SelectedReadString(env,args[0],method,64)||!SelectedReadString(env,args[1],first,PATH_MAX))return SelectedFsError(env,"prepare","",EPERM);
  const std::array<const char*,11> supported{"readFile","writeFile","mkdir","readdir","stat","lstat","unlink","rm","rename","copyFile","access"};
  if(std::none_of(supported.begin(),supported.end(),[&](const char* item){return method==item;}))return SelectedFsError(env,"prepare",first,EINVAL);
  const bool pair=method=="rename"||method=="copyFile";
  if((pair&&(count!=3||!SelectedReadString(env,args[2],second,PATH_MAX)))||(!pair&&count!=2)||!scope->Begin(env))return SelectedFsError(env,method,first,EPERM);
  auto operation=std::make_shared<SelectedFsOperation>();operation->scope=scope;operation->env=env;operation->method=method;
  operation->targets.emplace_back();
  if(!SelectedFsPrepareTarget(scope,method,first,false,operation->targets[0]))return SelectedFsError(env,method,first,errno?errno:EPERM);
  if(pair){operation->targets.emplace_back();if(!SelectedFsPrepareTarget(scope,method,second,true,operation->targets[1]))return SelectedFsError(env,method,second,errno?errno:EPERM);}
  napi_value object,paths,path;
  if(napi_create_object(env,&object)!=napi_ok||napi_create_array(env,&paths)!=napi_ok)return nullptr;
  for(size_t i=0;i<operation->targets.size();++i)if(napi_create_string_utf8(env,operation->targets[i].path.data(),operation->targets[i].path.size(),&path)!=napi_ok||napi_set_element(env,paths,i,path)!=napi_ok)return nullptr;
  const napi_property_descriptor methods[]={{"paths",nullptr,nullptr,nullptr,nullptr,paths,napi_default,nullptr},{"execute",nullptr,SelectedFsExecute,nullptr,nullptr,nullptr,napi_default,nullptr},{"close",nullptr,SelectedFsClose,nullptr,nullptr,nullptr,napi_default,nullptr}};
  auto retain=std::make_unique<std::shared_ptr<SelectedFsOperation>>(operation);
  if(napi_wrap(env,object,retain.get(),SelectedFsFinalize,nullptr,nullptr)!=napi_ok)return nullptr;retain.release();
  if(napi_type_tag_object(env,object,&kSelectedFsTag)!=napi_ok||napi_define_properties(env,object,std::size(methods),methods)!=napi_ok){operation->Close();return nullptr;}
  {std::lock_guard lock(scope->mutex);std::erase_if(scope->fs_operations,[](const auto& weak){return weak.expired();});scope->fs_operations.push_back(operation);}
  if(!scope->Current(env)){operation->Close();return SelectedFsError(env,method,first,EPERM);}return object;
}

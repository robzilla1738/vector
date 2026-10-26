// Finite native scratch directories; no caller path/name/root selector.
napi_value PrepareSelectedExecScratch(napi_env env,napi_callback_info info) {
  size_t count=0;auto scope=SelectedScopeInfo(env,info,count,nullptr);
  if(kBrowserOnlyNativeStartup||!scope||!scope->Begin(env))return SelectedScopeFail(env,"Selected command scratch owner unavailable");
  struct Exit {
    std::shared_ptr<SelectedBuiltinScope> scope;std::vector<int32_t> descriptors;
    ~Exit(){for(auto fd:descriptors)if(fd>=0&&close(fd)!=0)scope->MarkUnknown();scope->Finish();}
  }exit{scope,{}};
  int32_t root=-1;
  if(AuxCopySelectedSessionDirectory(scope->captured.owner->handle,scope->session,2,&root)!=0)return SelectedScopeFail(env,"Original Task session directory unavailable");
  exit.descriptors.push_back(root);
  auto child=[&](int32_t parent,const char* name)->int32_t {
    if(!scope->Current(env))return -1;
    if(mkdirat(parent,name,0700)!=0&&errno!=EEXIST)return -1;
    int32_t fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK);
    if(fd<0)return -1;exit.descriptors.push_back(fd);
    struct stat held{},named{};
    if(fstat(fd,&held)!=0||!S_ISDIR(held.st_mode)||held.st_uid!=geteuid()||(held.st_mode&07777)!=0700||
       !SelectedBrowserEmptyAcl(fd)||fstatat(parent,name,&named,AT_SYMLINK_NOFOLLOW)!=0||named.st_dev!=held.st_dev||named.st_ino!=held.st_ino)return -1;
    return fd;
  };
  const int32_t scratch=child(root,"exec");
  if(scratch<0)return SelectedScopeFail(env,"Selected command scratch root changed");
  napi_value object;if(napi_create_object(env,&object)!=napi_ok)return nullptr;
  for(const auto& item:std::array<std::pair<const char*,const char*>,4>{{{"home","home"},{"tmp","tmp"},{"cache","cache"},{"prefix","prefix"}}}) {
    const int32_t fd=child(scratch,item.second);std::array<char,PATH_MAX> path{};struct stat identity{};
    if(fd<0||!ReadExecRoot(fd,path.data(),&identity)||!scope->Allows(env,path.data(),true))return SelectedScopeFail(env,"Selected command scratch directory changed");
    napi_value value;if(napi_create_string_utf8(env,path.data(),NAPI_AUTO_LENGTH,&value)!=napi_ok)return nullptr;
    const napi_property_descriptor property{item.first,nullptr,nullptr,nullptr,nullptr,value,napi_default,nullptr};
    if(napi_define_properties(env,object,1,&property)!=napi_ok)return nullptr;
  }
  return scope->Current(env)?object:SelectedScopeFail(env,"Selected account changed during scratch creation");
}

// Included inside the real host's anonymous namespace after Environment checks.
bool ReadExecRoot(int fd, char* path, struct stat* identity) noexcept;
napi_value CaptureStorageRoots(napi_env env, napi_callback_info info) {
  if (getpid() != kHostProcess) return nullptr;
  auto refuse = [env]() -> napi_value {
    napi_throw_error(env,"AUX_STORAGE_ROOTS_UNAVAILABLE","Authenticated split storage owner is unavailable");return nullptr;
  };
  try {
    size_t argc=1;napi_value unused;
    if(napi_get_cb_info(env,info,&argc,&unused,nullptr,nullptr)!=napi_ok||argc!=0)return refuse();
    auto* isolate=v8::Isolate::GetCurrent();
    if(!isolate||isolate->GetCurrentContext().IsEmpty())return refuse();
    auto* environment=node::GetCurrentEnvironment(isolate->GetCurrentContext());
    std::shared_ptr<Worker> worker;
    {std::lock_guard<std::mutex> lock(Registry().mutex);auto found=Registry().active.find(environment);if(found!=Registry().active.end())worker=found->second;}
    if(!worker||!SameRuntimeEnvironment(env,environment,isolate))return refuse();
    std::shared_ptr<Owner> owner;
    {std::lock_guard<std::mutex> lock(worker->mutex);if(CurrentWorker(*worker)&&!worker->terminal&&!worker->initializing&&!worker->environment_detached)owner=worker->owner;}
    if(!owner)return refuse();
    struct Pair{int32_t control=-1,task=-1;~Pair(){if(control>=0)close(control);if(task>=0&&task!=control)close(task);}}pair;
    uint64_t generation=0;
    std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> control{},task{};struct stat a{},b{};
    if(AuxNativeContextValidateCurrentAuthority(owner->handle)!=0||
       AuxNativeContextCopyStorageRoots(owner->handle,&generation,&pair.control,&pair.task)!=0||!generation||pair.control==pair.task||
       !ReadExecRoot(pair.control,control.data(),&a)||!ReadExecRoot(pair.task,task.data(),&b)||
       (a.st_dev==b.st_dev&&a.st_ino==b.st_ino)||AuxNativeContextValidateCurrentAuthority(owner->handle)!=0)return refuse();
    auto nested=[](const char* child,const char* parent){const auto n=std::strlen(parent);return std::strncmp(child,parent,n)==0&&(child[n]=='/'||child[n]=='\0');};
    if(nested(control.data(),task.data())||nested(task.data(),control.data()))return refuse();
    bool current=false;
    {std::lock_guard<std::mutex> lock(worker->mutex);current=CurrentWorker(*worker)&&!worker->terminal&&!worker->initializing&&!worker->environment_detached&&worker->owner==owner;}
    if(!current)return refuse();
    napi_value output,format,version,own,transport,c,t;
    const auto ownText=std::to_string(worker->generation),generationText=std::to_string(generation);
    if(napi_create_object(env,&output)!=napi_ok||napi_create_string_utf8(env,"aux.native.storage-roots.v1",NAPI_AUTO_LENGTH,&format)!=napi_ok||
       napi_create_uint32(env,1,&version)!=napi_ok||napi_create_string_utf8(env,ownText.c_str(),NAPI_AUTO_LENGTH,&own)!=napi_ok||
       napi_create_string_utf8(env,generationText.c_str(),NAPI_AUTO_LENGTH,&transport)!=napi_ok||napi_create_string_utf8(env,control.data(),NAPI_AUTO_LENGTH,&c)!=napi_ok||napi_create_string_utf8(env,task.data(),NAPI_AUTO_LENGTH,&t)!=napi_ok)return refuse();
    const napi_property_descriptor fields[]={
      {"format",nullptr,nullptr,nullptr,nullptr,format,napi_enumerable,nullptr},
      {"layoutVersion",nullptr,nullptr,nullptr,nullptr,version,napi_enumerable,nullptr},
      {"ownerGeneration",nullptr,nullptr,nullptr,nullptr,own,napi_enumerable,nullptr},
      {"transportGeneration",nullptr,nullptr,nullptr,nullptr,transport,napi_enumerable,nullptr},
      {"controlHome",nullptr,nullptr,nullptr,nullptr,c,napi_enumerable,nullptr},
      {"taskHome",nullptr,nullptr,nullptr,nullptr,t,napi_enumerable,nullptr}};
    if(napi_define_properties(env,output,6,fields)!=napi_ok||napi_object_freeze(env,output)!=napi_ok)return refuse();return output;
  }catch(...){return refuse();}
}

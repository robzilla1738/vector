// Source proposal only. Keep ordinary startup and generic JS guard unchanged.
napi_value InitializeFixedPtyLinked(napi_env env,napi_value exports) {
  if(kBrowserOnlyNativeStartup)return RefuseSupervisedTaskBinding(env,nullptr);
  auto captured=CaptureBrokerOwner(env);
  if(!captured.owner||!captured.worker||!captured.worker->ordinary_main_service)
    return RefuseSupervisedTaskBinding(env,nullptr);
  // Actual fork admission remains AuxNativePtyBeginCurrent -> reservation ->
  // authenticated helper + native ES subscription/fence. Loading cannot mint it.
  return AuxInitializeFixedPty(env,exports);
}
void RegisterFixedPtyLinked(const std::shared_ptr<Worker>& worker) {
  if(kBrowserOnlyNativeStartup||!worker->ordinary_main_service||!worker->CanContinue())return;
  node::AddLinkedBinding(worker->environment,"aux_pty_builtin",InitializeFixedPtyLinked,8);
}

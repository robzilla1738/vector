// Included inside the actual WorkerHost anonymous namespace, after Registry.
// Private native observations only; no JS/NAPI export can call these functions.
int32_t ObserveOwnerCleanSettlement(void* retained_owner) noexcept {
  if (getpid() != kHostProcess || !retained_owner) return -1;
  try {
    std::vector<std::shared_ptr<Worker>> workers;
    std::vector<std::shared_ptr<HostCleanObservation>> hosts;
    {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      if (!Registry().native_shutdown_closed) return 1;
      workers.reserve(Registry().retained.size());
      for (const auto& item : Registry().retained) workers.push_back(item.second);
      hosts = Registry().hosts;
    }
    // Never acquire Worker under Registry: cleanup uses Worker -> Registry.
    // Unknown has precedence over pending across the complete retained cohort.
    bool matched = false;
    int32_t result = hosts.empty() ? 2 : 0;
    for (const auto& host : hosts) {
      std::lock_guard<std::mutex> lock(host->mutex);
      if (host->unknown) result = 2;
      else if ((!host->admission_closed || !host->factory_settled ||
                !host->images_settled) && result == 0) result = 1;
    }
    for (const auto& worker : workers) {
      std::lock_guard<std::mutex> lock(worker->mutex);
      if (worker->owner && worker->owner->retained == retained_owner) matched = true;
      if (worker->process != kHostProcess ||
          (worker->retirement_failure != AuxDevelopmentWorkerDrain::drained &&
           worker->retirement_failure != AuxDevelopmentWorkerDrain::pending) ||
          worker->pty_unknown || worker->pty_descendants_unknown ||
          worker->exec_unknown || worker->exec_descendants_unknown ||
          worker->broker_untracked || worker->runtime_scope_unknown) {
        result = 2;
      } else if ((!worker->terminal || !worker->broker_closed ||
                  worker->initializing || worker->retiring ||
                  (!worker->environment_detached && !worker->main_loop_returned) ||
                  worker->pdf_close_unresolved || worker->utility_close_unresolved ||
                  worker->pty_pending || worker->pty_direct ||
                  worker->exec_pending || worker->exec_direct ||
                  worker->broker_pending || worker->runtime_scope_pending) && result == 0) {
        result = 1;
      }
    }
    // An empty census or a stale/native-fabricated pointer is never proof.
    return matched ? result : -1;
  } catch (...) { return 2; }
}

void ObserveMainLoopReturned() noexcept {
  if (getpid() != kHostProcess) return;
  try {
    auto* isolate = v8::Isolate::GetCurrent();
    if (!isolate || isolate->GetCurrentContext().IsEmpty()) return;
    auto* environment = node::GetCurrentEnvironment(isolate->GetCurrentContext());
    std::shared_ptr<Worker> worker;
    {
      std::lock_guard<std::mutex> lock(Registry().mutex);
      auto found = Registry().active.find(environment);
      if (found == Registry().active.end()) return;
      worker = found->second;
    }
    std::lock_guard<std::mutex> lock(worker->mutex);
    if (!CurrentWorker(*worker)) return;
    // Called only by RunAuxNativeNodeEnvironment after SpinEventLoop returned.
    // It does not claim that setup or other Worker environments were destroyed.
    worker->main_loop_returned = true;
  } catch (...) {
    // Missing observation keeps the retained environment pending.
  }
}

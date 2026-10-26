// Process-local producer facts, never exposed as a token or completion flag.
extern "C" int32_t AuxNativePtyRetainPhysical(void* token) noexcept {
  if(getpid()!=kHostProcess)return 0;
  auto reservation=LookupPty(token);if(!reservation||reservation->process!=getpid())return 0;
  auto worker=reservation->worker;if(!worker)return 0;
  std::lock_guard lock(worker->mutex);
  if(reservation->phase!=PtyPhase::pending||reservation->physical_registered||
      !pthread_equal(pthread_self(),worker->thread)||worker->broker_pending>std::numeric_limits<size_t>::max()-2)return 0;
  reservation->physical_registered=true;reservation->transport_settled=false;
  worker->broker_pending+=2;return 1;
}
void ObservePtyPhysical(void* token,bool thread_joined) noexcept {
  if(getpid()!=kHostProcess)return;
  auto reservation=LookupPty(token);if(!reservation||reservation->process!=getpid())return;
  auto worker=reservation->worker;if(!worker)return;
  std::shared_ptr<RuntimeScope> runtime;std::shared_ptr<SelectedBuiltinScope> selected;bool closed=false;
  {
    std::lock_guard lock(worker->mutex);
    if(!reservation->physical_registered)return;
    auto& observed=thread_joined?reservation->reaper_thread_joined:reservation->transport_closed;
    if(observed)return;
    observed=true;
    if(!worker->broker_pending){worker->broker_untracked=true;return;}
    --worker->broker_pending;
    if(reservation->reaper_thread_joined&&reservation->transport_closed) {
      reservation->transport_settled=true;
      if(reservation->descendant_completed&&reservation->descendant_counted&&!reservation->runtime_cohort_released) {
        reservation->runtime_cohort_released=true;runtime=reservation->runtime_scope;selected=std::move(reservation->selected_scope);
      }
    }
    closed=worker->terminal;
  }
  if(runtime)RuntimeChildCohortSettled(runtime);
  if(selected)selected->Finish();
  if(closed)worker->Close();
  DetachCompletedEnvironment(worker);
}
extern "C" void AuxNativePtyReaperThreadJoined(void* token) noexcept {ObservePtyPhysical(token,true);}
extern "C" void AuxNativePtyTransportClosed(void* token) noexcept {ObservePtyPhysical(token,false);}

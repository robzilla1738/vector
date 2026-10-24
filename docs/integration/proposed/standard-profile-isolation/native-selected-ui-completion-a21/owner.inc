std::optional<UiStorageMigrationOwnerAck> AcceptNativeSelectedUiMigrationCompletion(
    UiStorageMigrationCompletion& completion) {
  auto& state = CurrentState();
  if (getpid() != state.process || !completion.IsCurrent() ||
      !completion.native_generation()) return std::nullopt;
  const std::string fingerprint(completion.terminal_fingerprint());
  if (fingerprint.size() != 64 || !std::all_of(fingerprint.begin(), fingerprint.end(),
      [](char value) { return (value >= '0' && value <= '9') ||
                            (value >= 'a' && value <= 'f'); })) return std::nullopt;
  std::shared_ptr<SelectedNativeHome> owner;
  std::shared_ptr<const BrowserPrivateRoots> roots;
  const uint64_t generation = completion.native_generation();
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (state.closed || state.browser_shutdown_phase || state.initializing ||
        !state.selected || !state.admitted_browser_roots ||
        state.browser_generation != generation) return std::nullopt;
    owner = state.selected;
    roots = state.admitted_browser_roots;
  }
  auto current = base::BindRepeating([](std::weak_ptr<SelectedNativeHome> weak_owner,
      std::shared_ptr<const BrowserPrivateRoots> expected_roots,
      uint64_t expected_generation) {
    auto& actual = CurrentState();
    auto retained = weak_owner.lock();
    if (getpid() != actual.process || !retained || !expected_roots->Revalidate()) return false;
    auto pulse = retained->InspectReadyPulse();
    auto child = retained->InspectOwnedChild();
    if (!pulse || !Fresh(*pulse) || pulse->generation != expected_generation ||
        child.closed || child.wrong_process || child.exit_observed_and_reaped ||
        child.exit_ownership_unknown || child.child_pid <= 1) return false;
    std::lock_guard<std::mutex> lock(actual.mutex);
    return !actual.closed && !actual.browser_shutdown_phase && !actual.initializing &&
        actual.selected == retained && actual.admitted_browser_roots == expected_roots &&
        actual.browser_generation == expected_generation;
  }, std::weak_ptr<SelectedNativeHome>(owner), roots, generation);
  if (!current.Run()) return std::nullopt;
  const auto frame = completion.TerminalReadFrame();
  // Read-only exact terminal-record discovery on the original native journal.
  // Neither a root/path nor a publication/readiness boolean is accepted here.
  if (frame.size() != 21 || frame.front() != 10) return std::nullopt;
  auto reply = ExchangeNativeSelectedUiCaptureFrame(frame);
  if (reply.status != DaemonAuthorityStatus::ready || !current.Run() ||
      !completion.IsCurrent() || completion.native_generation() != generation ||
      completion.terminal_fingerprint() != fingerprint ||
      !completion.MatchesTerminalReply(reply.payload)) return std::nullopt;
  // This ACK acknowledges the actual durable UI-transaction terminal record.
  // It cannot select an installation, change its format or admit other writers.
  return UiStorageMigrationOwnerAck(generation, fingerprint, std::move(current));
}


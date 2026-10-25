// Private native observations for the ordinary-only root record. No source,
// path, Profile, rights or caller-selected current process is accepted.
extern "C" int32_t AuxCopyOrdinaryBrowserParentLifetime(
    int32_t* pid, uint64_t* seconds, uint64_t* microseconds) {
  if (!pid || !seconds || !microseconds) return -1;
  *pid = -1; *seconds = 0; *microseconds = 0;
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  const pid_t parent = getppid();
  proc_bsdinfo first{}, second{};
  if (parent <= 1 ||
      proc_pidinfo(parent, PROC_PIDTBSDINFO, 0, &first, sizeof(first)) != sizeof(first) ||
      first.pbi_pid != static_cast<uint32_t>(parent) || first.pbi_uid != geteuid() ||
      !first.pbi_start_tvsec || first.pbi_start_tvusec >= 1'000'000 ||
      getppid() != parent ||
      proc_pidinfo(parent, PROC_PIDTBSDINFO, 0, &second, sizeof(second)) != sizeof(second) ||
      second.pbi_start_tvsec != first.pbi_start_tvsec ||
      second.pbi_start_tvusec != first.pbi_start_tvusec || getppid() != parent) return -1;
  *pid = parent; *seconds = first.pbi_start_tvsec; *microseconds = first.pbi_start_tvusec;
  return 0;
#else
  return -1;
#endif
}
extern "C" int32_t AuxOrdinaryPriorBrowserHasExited(
    int32_t pid, uint64_t seconds, uint64_t microseconds) {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  if (pid <= 1 || !seconds || microseconds >= 1'000'000) return -1;
  proc_bsdinfo info{};
  if (proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, &info, sizeof(info)) == sizeof(info)) {
    if (info.pbi_pid != static_cast<uint32_t>(pid) || !info.pbi_start_tvsec ||
        info.pbi_start_tvusec >= 1'000'000) return -1;
    // A reused PID with a different actual birth proves this original exited.
    return info.pbi_start_tvsec != seconds || info.pbi_start_tvusec != microseconds ? 1 : 0;
  }
  errno = 0;
  return kill(pid, 0) == -1 && errno == ESRCH ? 1 : -1;
#else
  return -1;
#endif
}

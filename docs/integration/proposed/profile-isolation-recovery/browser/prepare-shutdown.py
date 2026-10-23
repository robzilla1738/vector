#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,difflib,re
H=Path(__file__).resolve().parent;P=H.parents[1]
A=P/'profile-isolation-final/startup/source';B=Path('/private/tmp/aux-browser-final-transport-20261023/source')
base={};out={}
for name in ['AuxSelectedStateHome.h','AuxSelectedStateHome.cc']:
 base[name]=(A/name).read_text();out[name]=base[name]
def replace(name,old,new):
 assert out[name].count(old)==1,(name,old);out[name]=out[name].replace(old,new)
replace('AuxSelectedStateHome.h','// Fresh-only native retained grant;', '''// Factual native lifecycle observation. Even the final phase is not a whole-
// browser drain certificate and cannot authorize recovery or release a lease.
struct BrowserShutdownObservation {
  bool wrong_process = false;
  bool admission_closed = false;
  bool sequence_uncertain = false;
  uint32_t phase = 0;
  uint64_t admitted_generation = 0;
  uint64_t active_authority_reads = 0;
  bool monitor_running = false;
  bool whole_writer_drain_proven = false;
};
void BeginNativeBrowserShutdown();
void ObserveNativeBrowserProfileTeardown();
void ObserveNativeBrowserThreadsDestroyed();
void ObserveNativeBrowserProcessDestroyed();
void ObserveNativeBrowserPostShutdownIO();
void ObserveNativeBrowserPartsDestroyed();
BrowserShutdownObservation InspectNativeBrowserShutdown();
// Fresh-only native retained grant;''')
replace('AuxSelectedStateHome.cc','  bool browser_attempted = false;', '''  bool browser_attempted = false;
  uint32_t browser_shutdown_phase = 0;
  bool browser_shutdown_uncertain = false;
  std::optional<base::PlatformThreadRef> browser_shutdown_thread;''')
# Keep servicing native ownership during teardown; only new/public admission
# and in-flight result publication close. Never release retained root owners.
for start,end in [('DaemonAuthorityReply CallAuthority(', 'bool InstallNativeSelectedStateHome('),('bool InstallNativeSelectedStateHome(', 'SelectedStateHomeObservation CloseNativeSelectedStateHome()')]:
 text=out['AuxSelectedStateHome.cc'];i=text.index(start);j=text.index(end,i)
 segment=re.sub(r'\bstate\.closed\b(?!\s*=)', '(state.closed || state.browser_shutdown_phase != 0)',text[i:j])
 out['AuxSelectedStateHome.cc']=text[:i]+segment+text[j:]
needle='SelectedStateHomeObservation CloseNativeSelectedStateHome() {'
addition='''namespace {
void AdvanceNativeBrowserShutdown(uint32_t expected) {
  auto& state = CurrentState();
  if (getpid() != state.process) return;
  std::lock_guard<std::mutex> lock(state.mutex);
  const auto thread = base::PlatformThread::CurrentRef();
  if (expected == 1 && !state.browser_shutdown_thread)
    state.browser_shutdown_thread = thread;
  if (!state.browser_shutdown_thread || *state.browser_shutdown_thread != thread ||
      expected != state.browser_shutdown_phase + 1) {
    state.browser_shutdown_uncertain = true;
    // Even an out-of-order first observation closes future admissions.
    if (!state.browser_shutdown_phase) state.browser_shutdown_phase = 1;
    return;
  }
  state.browser_shutdown_phase = expected;
}
}
void BeginNativeBrowserShutdown() { AdvanceNativeBrowserShutdown(1); }
void ObserveNativeBrowserProfileTeardown() { AdvanceNativeBrowserShutdown(2); }
void ObserveNativeBrowserThreadsDestroyed() { AdvanceNativeBrowserShutdown(3); }
void ObserveNativeBrowserProcessDestroyed() { AdvanceNativeBrowserShutdown(4); }
void ObserveNativeBrowserPostShutdownIO() { AdvanceNativeBrowserShutdown(5); }
void ObserveNativeBrowserPartsDestroyed() { AdvanceNativeBrowserShutdown(6); }
BrowserShutdownObservation InspectNativeBrowserShutdown() {
  auto& state = CurrentState();
  if (getpid() != state.process) return {.wrong_process = true};
  std::lock_guard<std::mutex> lock(state.mutex);
  return {false, state.browser_shutdown_phase != 0,
          state.browser_shutdown_uncertain, state.browser_shutdown_phase,
          state.browser_generation, state.active_reads, state.monitor_running,
          false}; // Later content/service/file writers are not proven drained.
}
'''
replace('AuxSelectedStateHome.cc',needle,addition+needle)
name='chrome/browser/chrome_browser_main.cc';base[name]=(B/name).read_text();out[name]=base[name]
def hook(call):return '\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)\n  aux::peer::'+call+'();\n#endif\n'
replace(name,'void ChromeBrowserMainParts::PostMainMessageLoopRun() {','void ChromeBrowserMainParts::PostMainMessageLoopRun() {'+hook('BeginNativeBrowserShutdown'))
replace(name,'  browser_process_->StartTearDown();','  browser_process_->StartTearDown();'+hook('ObserveNativeBrowserProfileTeardown'))
replace(name,'void ChromeBrowserMainParts::PostDestroyThreads() {','void ChromeBrowserMainParts::PostDestroyThreads() {'+hook('ObserveNativeBrowserThreadsDestroyed'))
replace(name,'  browser_process_.reset();','  browser_process_.reset();'+hook('ObserveNativeBrowserProcessDestroyed'))
replace(name,'  browser_shutdown::ShutdownPostThreadsStop(restart_mode);','  browser_shutdown::ShutdownPostThreadsStop(restart_mode);'+hook('ObserveNativeBrowserPostShutdownIO'))
replace(name,'  shutdown_watchdog::OnShutdownComplete();','  shutdown_watchdog::OnShutdownComplete();'+hook('ObserveNativeBrowserPartsDestroyed'))
patch='';pins={}
for name,text in out.items():
 p=H/'source'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
 pins[name]={'before':hashlib.sha256(base[name].encode()).hexdigest(),'after':hashlib.sha256(text.encode()).hexdigest()}
 target=name if name.startswith('chrome/') else 'chrome/browser/aux/'+name
 patch+=''.join(difflib.unified_diff(base[name].splitlines(True),text.splitlines(True),fromfile='a/'+target,tofile='b/'+target))
(H/'shutdown.patch').write_text(patch);(H/'shutdown-inputs.json').write_text(json.dumps(pins,indent=2)+'\n')

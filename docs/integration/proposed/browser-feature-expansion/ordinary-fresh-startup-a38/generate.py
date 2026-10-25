from pathlib import Path
import hashlib,json,difflib
repo=Path('/Users/rcourson/.codex/worktrees/aux-features-navigation/web')
p=repo/'docs/integration/proposed/browser-feature-expansion/ordinary-fresh-startup-a38'
native=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
composition=Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/browser-feature-expansion/native-phase-integration-a24/source-composition.json')
selected=json.loads(composition.read_text())['selectedFiles'];rows=[];patches=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
def edit(path,changes):
 row=selected.get(path)
 source=Path(row['path']) if row else native/path
 data=source.read_bytes()
 if row:assert sha(data)==row['sha256'],path
 original=data.decode();text=original;anchors=[]
 for a,b,n in changes:
  assert text.count(a)==n,(path,a[:110],text.count(a),n)
  text=text.replace(a,b);anchors.append(dict(find=a,replace=b,count=n))
 out=p/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append(dict(path=path,input=str(source),inputSha256=sha(data),output=str(out),outputSha256=sha(text.encode()),anchors=anchors))
 patches.extend(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
header='chrome/browser/aux/ordinary_startup_build.h'
out=p/'source'/header;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes((p/'ordinary_startup_build.h').read_bytes())
rows.append(dict(path=header,inputAbsent=True,output=str(out),outputSha256=sha(out.read_bytes())))
edit('chrome/app/chrome_exe_main_mac.cc',[(
'#if defined(AUX_BROWSER_DESCENDANT_CUSTODY) && !defined(HELPER_EXECUTABLE)',
'#if defined(AUX_BROWSER_DESCENDANT_CUSTODY) && !defined(HELPER_EXECUTABLE) && !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)',2)])
edit('base/process/mac/aux_browser_descendant_bridge.cc',[(
'#include <unistd.h>\nnamespace {', '#include <unistd.h>\n#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)\nnamespace {',1),(
'}\nextern \"C\" __attribute__((visibility(\"default\")))', '}\n#endif\nextern \"C\" __attribute__((visibility(\"default\")))',1),(
'  return getpid()==kBrowserImageProcess?&kBridge:nullptr;',
'''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  // ES is unavailable in this explicit ordinary build. Optional child custody
  // must remain unavailable, never report a fake settled stream.
  return nullptr;
#else
  return getpid()==kBrowserImageProcess?&kBridge:nullptr;
#endif''',1)])
# Exact A24 GN targets only, not the later recovery proposal composition.
edit('base/BUILD.gn',[(
'  source_set("aux_browser_descendant_engine") {',
'  source_set("aux_browser_descendant_engine") {\n    defines = [ "AUX_BROWSER_ONLY_NATIVE_STARTUP=1" ]',1)])
edit('chrome/BUILD.gn',[(
'    if (enable_aux_browser) {\n      sources += [ \"app/aux_packaged_state_identity.h\" ]', '    if (enable_aux_browser) {\n      deps += [ \"//chrome/browser/aux:platform\" ]\n      sources += [ \"app/aux_packaged_state_identity.h\" ]',1),(
'      defines = [ "AUX_BROWSER_DESCENDANT_CUSTODY" ]',
'      defines = [ "AUX_BROWSER_DESCENDANT_CUSTODY", "AUX_BROWSER_ONLY_NATIVE_STARTUP=1" ]',1)])
edit('chrome/browser/aux/BUILD.gn',[(
'  sources = [\n    "feature_store/feature_write_participant.cc",',
'  sources = [\n    "ordinary_startup_build.h",\n    "feature_store/feature_write_participant.cc",',1),(
'  if (is_mac) {\n    sources += [',
'  if (is_mac) {\n    defines = [ "AUX_BROWSER_ONLY_NATIVE_STARTUP=1" ]\n    deps += [ "//chrome/browser:buildflags" ]\n    sources += [',1)])
edit('chrome/app/aux_packaged_state_identity.h',[(
'  // Deliberate unconditional refusal: no acceptance Boolean, environment flag\n  // or command-line override exists for state2 (or a future unknown version).', '  // Compatibility builds still refuse state2. The distinct compiled ordinary\n  // package mode below only permits attempting genuine native admission.',1),(
'  return state == 1 && (profile == "compatibility" || profile == "aux-v1");',
'''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  // This only permits ATTEMPTING actual ordinary native admission. It does not
  // accept legacy state, settle migration, or mint any startup authority.
  const auto* mode = marker->FindString("nativeStartupMode");
  return state == 2 && profile == "aux-v1" && mode && *mode == "ordinary-fresh-v1";
#else
  return state == 1 && (profile == "compatibility" || profile == "aux-v1");
#endif''',1)])
edit('chrome/app/chrome_main_delegate.cc',[(
'#include "chrome/browser/buildflags.h"  // nogncheck',
'#include "chrome/browser/buildflags.h"  // nogncheck\n#include "chrome/browser/aux/ordinary_startup_build.h"\n#if BUILDFLAG(IS_MAC) && defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)\n#include <algorithm>\n#include <string_view>\n#include <fcntl.h>\n#include <sys/stat.h>\n#include <unistd.h>\n#include "base/files/scoped_file.h"\n#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"\n#include "chrome/browser/aux/AuxNativeParentColdLaunch.h"\n#endif',1),(
'// Initializes the user data dir. Must be called before InitializeLocalState().',
(p/'early-user-data.inc').read_text()+'\n// Initializes the user data dir. Must be called before InitializeLocalState().',1),(
'void InitializeUserDataDir(base::CommandLine* command_line) {',
'''void InitializeUserDataDir(base::CommandLine* command_line) {
#if BUILDFLAG(IS_MAC) && defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  CHECK(ValidateOrdinaryUserDataSelection(command_line));
  return;
#endif''',1),(
'#if !defined(BUILDING_CHROME_RENDERER)\n  if (!aux::development_startup::Apply()) {',
'#if !defined(BUILDING_CHROME_RENDERER) && !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)\n  if (!aux::development_startup::Apply()) {',1),(
'std::optional<int> ChromeMainDelegate::BasicStartupComplete() {',
'''std::optional<int> ChromeMainDelegate::BasicStartupComplete() {
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && !defined(BUILDING_CHROME_RENDERER)
  auto* ordinary_command = base::CommandLine::ForCurrentProcess();
  if (ordinary_command->GetSwitchValueASCII(switches::kProcessType).empty()) {
    // Before Crashpad, logging, histograms, Local State or singleton writes.
    // Only an explicit existing private native path is eligible for the exact
    // daemon/root/generation receipt below; there is no historical acceptance.
    if (!aux::state_identity::PackagedIdentityAllowsStartup() ||
        !ValidateOrdinaryUserDataSelection(ordinary_command) ||
        !aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO() ||
        aux::peer::StartSealedNativeDaemonBeforeProfiles().route != aux::peer::SelectedStateHomeRoute::current ||
        !aux::peer::AuthorizeNativeBrowserStartupBeforeLocalState()) return 1;
  }
#endif''',1)])
edit('chrome/browser/metrics/chrome_feature_list_creator.cc',[(
'#include "chrome/browser/buildflags.h"',
'#include "chrome/browser/buildflags.h"\n#include "chrome/browser/aux/ordinary_startup_build.h"',1)])
edit('chrome/browser/chrome_browser_main.cc',[(
'#include "chrome/browser/aux/browser_platform.h"',
'#include "chrome/browser/aux/browser_platform.h"\n#include "chrome/browser/aux/ordinary_startup_build.h"',1),(
'#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY) && BUILDFLAG(IS_MAC)',
'#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY) && BUILDFLAG(IS_MAC) && !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)',1)])
edit('chrome/browser/aux/AuxSelectedStateHome.cc',[(
'    if (!owner->BindBrowserDescendantScope(generation)) return false;',
'''#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
    if (!owner->BindBrowserDescendantScope(generation)) return false;
#endif''',1),(
'DaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(std::span<const uint8_t> frame) {',
'''DaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(std::span<const uint8_t> frame) {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  // This bounded ordinary mode has no migration/privileged drain authority.
  return {DaemonAuthorityStatus::refused, {}};
#else''',1),(
'  return reply;\n}\nstd::optional<UiStorageMigrationOwnerAck> AcceptNativeSelectedUiMigrationCompletion(',
'  return reply;\n#endif\n}\nstd::optional<UiStorageMigrationOwnerAck> AcceptNativeSelectedUiMigrationCompletion(',1)])
edit('chrome/browser/aux/AuxOwnedNativePeerChild.cc',[(
'  state->descendant_ticket = aux::browser_custody::Reserve(aux::browser_custody::Family::kDaemon);',
'#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)\n  state->descendant_ticket = aux::browser_custody::Reserve(aux::browser_custody::Family::kDaemon);',1),(
'  State::RetainBeforeLaunch(state);\n  state->observation.launch_attempted = true;',
'''#endif
  // Ordinary mode still owns the real waitable child, Mach endpoint, audit/code
  // binding, birth observation and sole reaper. It has no ES ticket or CLEAN.
  State::RetainBeforeLaunch(state);
  state->observation.launch_attempted = true;''',1)])
edit('chrome/browser/ui/aux_browser_shutdown_drain.cc',[(
'#include "chrome/browser/ui/aux_browser_shutdown_drain.h"',
'#include "chrome/browser/ui/aux_browser_shutdown_drain.h"\n#include "chrome/browser/aux/ordinary_startup_build.h"',1),(
'peer::BrowserDrainReport Report(uint64_t expected_generation,', '[[maybe_unused]] peer::BrowserDrainReport Report(uint64_t expected_generation,',1),(
'void Acknowledged(const peer::BrowserDrainReport& report) {', '[[maybe_unused]] void Acknowledged(const peer::BrowserDrainReport& report) {',1),(
'    state.provider_failed = !peer::RegisterBrowserDrainReportProvider(&Report, &Acknowledged) ||\n        !content::aux_migration::RegisterBrowserShutdownCompletion(&FinishNativeBrowserShutdownDrain);',
'''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
    // Keep the real content teardown callback, without privileged ES reporting.
    state.provider_failed = !content::aux_migration::RegisterBrowserShutdownCompletion(&FinishNativeBrowserShutdownDrain);
#else
    state.provider_failed = !peer::RegisterBrowserDrainReportProvider(&Report, &Acknowledged) ||
        !content::aux_migration::RegisterBrowserShutdownCompletion(&FinishNativeBrowserShutdownDrain);
#endif''',1),(
'  const auto deadline = base::TimeTicks::Now() + base::Seconds(10);\n  for (;;) {',
'''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  // Called only after actual normal Profile/content/thread/session teardown.
  // Peer close ends this owned ordinary daemon session; it is not ES-CLEAN.
  const auto ordinary_deadline = base::TimeTicks::Now() + base::Seconds(5);
  for (;;) {
    const auto closed = peer::CloseNativeSelectedStateHome();
    if (closed.child_close && closed.child_close->exit_observed_and_reaped &&
        !closed.child_close->exit_ownership_unknown && !closed.monitor_running &&
        !closed.monitor_join_pending && !closed.initialization_pending && !closed.active_reads) return;
    if (base::TimeTicks::Now() >= ordinary_deadline) {
      std::lock_guard<std::mutex> lock(state.mutex);
      state.final_wait_exhausted = true;
      return;  // Exact pending child custody remains unknown, never CLEAN.
    }
    base::PlatformThread::Sleep(base::Milliseconds(25));
  }
#else
  const auto deadline = base::TimeTicks::Now() + base::Seconds(10);
  for (;;) {''',1),(
'    base::PlatformThread::Sleep(base::Milliseconds(25));\n  }\n}',
'    base::PlatformThread::Sleep(base::Milliseconds(25));\n  }\n#endif\n}',1)])
edit('chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences_api.cc',[(
'#include "chrome/browser/aux/ui_storage_migration_controller.h"',
'#include "chrome/browser/aux/ui_storage_migration_controller.h"\n#include "chrome/browser/aux/ordinary_startup_build.h"',1),(
'    if (kind && *kind == "prepare-ui-state-upgrade") {',
'''    if (kind && *kind == "prepare-ui-state-upgrade") {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
      return RespondNow(Error("UI state migration is unavailable in ordinary local mode"));
#else''',1),(
'      return did_respond() ? AlreadyResponded() : RespondLater();\n    }\n    CommitAuxCommandAsync',
'      return did_respond() ? AlreadyResponded() : RespondLater();\n#endif\n    }\n    CommitAuxCommandAsync',1)])
manifest={'format':'aux.ordinary-fresh-startup.native-source.v1','baseComposition':str(composition),'baseCompositionSha256':sha(composition.read_bytes()),'files':rows,'ordinaryMode':'ordinary-fresh-v1','macro':'AUX_BROWSER_ONLY_NATIVE_STARTUP=1','privilegedClean':False,'migrationEnabled':False,'actualNativeCheckoutChanged':False,'productExecuted':False}
(p/'source-plan.json').write_text(json.dumps(manifest,indent=2)+'\n');(p/'native.patch').write_text(''.join(patches))
print(json.dumps({'files':len(rows),'rules':sum(len(r.get('anchors',[])) for r in rows),'outputHashes':{r['path']:r['outputSha256'] for r in rows}}))

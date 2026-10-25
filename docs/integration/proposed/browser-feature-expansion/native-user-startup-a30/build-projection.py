from pathlib import Path
import json,hashlib,difflib
n=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');r=Path(__file__).parent
rules={}
h='chrome/browser/aux/AuxNativeParentColdLaunch.h'
rules[h]=[('#include "AuxSelectedStateHome.h"','#include "AuxSelectedStateHome.h"\n#include <optional>\n#include "base/files/file_path.h"'),('''SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles();''','''SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles();
// Native signed-image observations and fixed OS-user directories only. These
// never select legacy state, settle a writer, or authorize browser startup.
struct NativeUserStartupPaths {
  base::FilePath home;
  base::FilePath data;
  base::FilePath cache;
};
int InspectSealedNativeDaemonLaunchLocationMode();
std::optional<NativeUserStartupPaths> DeriveOrdinaryUserStartupPaths();
bool PrepareOrdinaryUserStartupPaths(const NativeUserStartupPaths&);
bool RevalidateOrdinaryUserStartupPaths(const NativeUserStartupPaths&);''')]
cold='chrome/browser/aux/AuxNativeParentColdLaunch.cc'
rules[cold]=[('#include <array>','#include <array>\n#include <algorithm>\n#include <cerrno>\n#include <dirent.h>\n#include <fcntl.h>\n#include <pwd.h>\n#include <set>\n#include <sys/acl.h>\n#include <sys/stat.h>\n#include "base/containers/span.h"\n#include "base/files/scoped_file.h"\n#include "base/logging.h"'),('''extern "C" int32_t AuxValidateEmbeddedNativeDaemonLaunchPolicy(
    const void*, const void*, const uint8_t*, uintptr_t);''','''extern "C" int32_t AuxValidateEmbeddedNativeDaemonLaunchPolicy(
    const void*, const void*, const uint8_t*, uintptr_t);
extern "C" int32_t AuxGetValidatedEmbeddedNativeDaemonLaunchLocationMode(
    const void*, const void*, const uint8_t*, uintptr_t);'''),('''struct StartupAttempt {
  const pid_t process = getpid();
  std::mutex mutex;
  bool attempted = false;
};''','''struct LocationPreflight {
  int mode = -1;
  std::string browser_bundle;
  std::vector<uint8_t> browser_hash, child_hash;
};
struct StartupAttempt {
  const pid_t process = getpid();
  std::mutex mutex;
  bool attempted = false;
  std::optional<LocationPreflight> location;
};''')]
s=(n/cold).read_text();begin=s.index('std::unique_ptr<OwnedNativePeerChild> PrepareCurrentSealedChild() {');end=s.index('  // Capture the exact reviewed child code',begin);old=s[begin:end]
# Preserve all actual preflight validations and then return their owned facts.
body=old.replace('std::unique_ptr<OwnedNativePeerChild> PrepareCurrentSealedChild() {','std::unique_ptr<SealedStartupPair> InspectCurrentSealedPair() {',1)
body = body.replace('''  if (!selected || selected->bundle != child_path ||
      AuxValidateEmbeddedNativeDaemonLaunchPolicy(child.get(), child_requirement.get(),
          selected->cd_hash.data(), selected->cd_hash.size()) != 0) return {};''', '''  if (!selected || selected->bundle != child_path) return {};''', 1)
body = body.replace('''std::unique_ptr<SealedStartupPair> InspectCurrentSealedPair() {''', '''std::unique_ptr<SealedStartupPair> InspectCurrentSealedPair() {
  if (CurrentAttempt().process != getpid()) return {};''', 1)
body += '''  const int mode = AuxGetValidatedEmbeddedNativeDaemonLaunchLocationMode(
      child.get(), child_requirement.get(), selected->cd_hash.data(), selected->cd_hash.size());
  if ((mode != 8 && mode != 9) || (mode == 8 &&
      AuxValidateEmbeddedNativeDaemonLaunchPolicy(child.get(), child_requirement.get(),
          selected->cd_hash.data(), selected->cd_hash.size()) != 0)) return {};
  auto result = std::make_unique<SealedStartupPair>();
  result->current = std::move(current);
  result->browser = std::move(browser);
  result->child = std::move(child);
  result->browser_requirement = std::move(browser_requirement);
  result->child_requirement = std::move(child_requirement);
  result->outer = *outer;
  result->selected = *selected;
  result->mode = mode;
  return result;
}
bool MatchesLocationPreflight(const SealedStartupPair& pair) {
  auto& attempt = CurrentAttempt();
  if (attempt.process != getpid()) return false;
  std::lock_guard<std::mutex> lock(attempt.mutex);
  if (!attempt.location) return pair.mode == 8;  // Existing fixed v8 caller.
  return attempt.location->mode == pair.mode &&
      attempt.location->browser_bundle == pair.outer.bundle &&
      attempt.location->browser_hash == pair.outer.cd_hash &&
      attempt.location->child_hash == pair.selected.cd_hash;
}
std::unique_ptr<OwnedNativePeerChild> PrepareCurrentSealedChild() {
  auto pair = InspectCurrentSealedPair();
  if (!pair || !MatchesLocationPreflight(*pair)) return {};
  if (pair->mode == 9) {
    const auto& prepared = PreparedDirectories();
    if (!prepared || !RevalidatePreparedDirectories(*prepared)) return {};
  }
  const auto* outer = &pair->outer;
  const auto* selected = &pair->selected;
  auto& current = pair->current;
  auto& browser = pair->browser;
  auto& browser_requirement = pair->browser_requirement;
  auto& child_requirement = pair->child_requirement;
'''
struct='''struct SealedStartupPair {
  base::apple::ScopedCFTypeRef<SecCodeRef> current;
  base::apple::ScopedCFTypeRef<SecStaticCodeRef> browser, child;
  base::apple::ScopedCFTypeRef<SecRequirementRef> browser_requirement, child_requirement;
  Image outer, selected;
  int mode = -1;
};
'''
rules[cold].append((old,(r/'directories.inc').read_text()+'\n'+struct+body))
public='''int InspectSealedNativeDaemonLaunchLocationMode() {
  auto pair = InspectCurrentSealedPair();
  if (!pair) return -1;
  auto& attempt = CurrentAttempt();
  if (attempt.process != getpid()) return -1;
  std::lock_guard<std::mutex> lock(attempt.mutex);
  if (attempt.location) {
    const auto& previous = *attempt.location;
    if (previous.mode != pair->mode || previous.browser_bundle != pair->outer.bundle ||
        previous.browser_hash != pair->outer.cd_hash || previous.child_hash != pair->selected.cd_hash)
      return -1;
  } else {
    attempt.location = LocationPreflight{pair->mode, pair->outer.bundle,
        pair->outer.cd_hash, pair->selected.cd_hash};
  }
  return pair->mode;
}
std::optional<NativeUserStartupPaths> DeriveOrdinaryUserStartupPaths() {
  if (InspectSealedNativeDaemonLaunchLocationMode() != 9) return std::nullopt;
  return DeriveCurrentOsUserPaths();
}
bool PrepareOrdinaryUserStartupPaths(const NativeUserStartupPaths& paths) {
  return InspectSealedNativeDaemonLaunchLocationMode() == 9 && PrepareCurrentUserDirectories(paths);
}
bool RevalidateOrdinaryUserStartupPaths(const NativeUserStartupPaths& paths) {
  const auto& prepared = PreparedDirectories();
  return prepared && SameUserPaths(prepared->paths, paths) && RevalidatePreparedDirectories(*prepared);
}

'''
rules[cold].append(('''SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles() {''',public+'''SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles() {'''))
marker='chrome/app/aux_packaged_state_identity.h'
rules[marker]=[('''inline bool PackagedIdentityMarkerAllowed(std::string_view json) {''','''inline bool PackagedIdentityMarkerAllowed(std::string_view json, int native_location_mode = 0) {'''),('''  return state == 2 && profile == "aux-v1" && mode && *mode == "ordinary-fresh-v1";''','''  if (state != 2 || profile != "aux-v1" || !mode) return false;
  if (*mode == "ordinary-fresh-v1") return native_location_mode == 0 || native_location_mode == 8;
  if (*mode == "ordinary-user-v1") return native_location_mode == 0 || native_location_mode == 9;
  return false;'''),('''inline bool PackagedIdentityMarkerAllowedAt(const base::FilePath& path) {''','''inline bool PackagedIdentityMarkerAllowedAt(const base::FilePath& path, int native_location_mode = 0) {'''),('''  return PackagedIdentityMarkerAllowed(bytes);''','''  return PackagedIdentityMarkerAllowed(bytes, native_location_mode);'''),('''inline bool PackagedIdentityAllowsStartup() {''','''inline bool PackagedIdentityAllowsStartup(int native_location_mode = 0) {'''),('''      app.AppendASCII("Contents/Resources/aux/bundle.json"));''','''      app.AppendASCII("Contents/Resources/aux/bundle.json"), native_location_mode);''')]
main='chrome/app/chrome_main_delegate.cc'
s=(n/main).read_text();start=s.index('// This path must already exist. No default, policy redirect, symlink expansion,');end=s.index('\n#endif\n\n// Initializes the user data dir.',start);old=s[start:end]
# The fixed v8 validation body remains verbatim in its separate function.
fixed=old.replace('bool ValidateOrdinaryUserDataSelection(base::CommandLine* command_line) {','bool ValidateFixedOrdinaryUserDataSelection(base::CommandLine* command_line) {',1)
# v8 helper behavior remains as-is, but wrapper validates its expected marker.
wrapper='''
bool LexicallyCanonicalOrdinaryHome(std::string_view path) {
  if (path.empty() || path.front() != '/' || path == "/" || path.back() == '/') return false;
  path.remove_prefix(1);
  while (!path.empty()) {
    const auto slash = path.find('/');
    const auto part = path.substr(0, slash);
    if (part.empty() || part == "." || part == "..") return false;
    if (slash == std::string_view::npos) return true;
    path.remove_prefix(slash + 1);
  }
  return false;
}
bool InstallOrdinaryUserPathServices(const aux::peer::NativeUserStartupPaths& paths) {
  return base::PathService::OverrideAndCreateIfNeeded(base::DIR_HOME, paths.home, true, false) &&
      base::PathService::OverrideAndCreateIfNeeded(base::DIR_APP_DATA,
          paths.home.AppendASCII("Library/Application Support"), true, false) &&
      base::PathService::OverrideAndCreateIfNeeded(base::DIR_CACHE,
          paths.home.AppendASCII("Library/Caches"), true, false) &&
      base::PathService::OverrideAndCreateIfNeeded(chrome::DIR_USER_DATA, paths.data, true, false);
}
bool ValidateOrdinaryUserDataSelection(base::CommandLine* command_line) {
  if (!command_line || command_line->HasSwitch(switches::kDiskCacheDir) ||
      command_line->HasSwitch(switches::kProfileDirectory)) return false;
  const auto requested = command_line->GetSwitchValuePath(switches::kUserDataDir);
  if (!command_line->GetSwitchValueASCII(switches::kProcessType).empty()) {
    // Native helpers already have seatbelt. Their parent supplies the explicit
    // fixed path; no user DB, policy/root reopen, mkdir or sandbox widening here.
    constexpr std::string_view suffix = "/Library/Application Support/Aux Browser/User Data";
    const std::string_view named = requested.value();
    if (!named.ends_with(suffix)) {
      return aux::state_identity::PackagedIdentityAllowsStartup(8) &&
          ValidateFixedOrdinaryUserDataSelection(command_line);
    }
    const auto home = named.substr(0, named.size() - suffix.size());
    if (!command_line->HasSwitch(switches::kUserDataDir) ||
        !LexicallyCanonicalOrdinaryHome(home) ||
        !aux::state_identity::PackagedIdentityAllowsStartup(9)) return false;
    const base::FilePath home_path(home);
    return InstallOrdinaryUserPathServices({home_path, requested,
        home_path.AppendASCII("Library/Caches/Aux Browser")});
  }
  // This validates the actual current signed browser+child pair and exact
  // sealed policy BEFORE deriving or creating any OS-user directory.
  const int mode = aux::peer::InspectSealedNativeDaemonLaunchLocationMode();
  if (!aux::state_identity::PackagedIdentityAllowsStartup(mode)) return false;
  if (mode == 8) return ValidateFixedOrdinaryUserDataSelection(command_line);
  if (mode != 9) return false;
  const auto paths = aux::peer::DeriveOrdinaryUserStartupPaths();
  if (!paths) return false;
  auto policy_path = paths->data;
  policy::path_parser::CheckUserDataDirPolicy(&policy_path);
  if (policy_path != paths->data) return false;
  if (command_line->HasSwitch(switches::kUserDataDir)) {
    // Only this process's already-retained native selection may appear on the
    // second initializer call. A caller-supplied owner path is never accepted.
    if (requested != paths->data || !aux::peer::RevalidateOrdinaryUserStartupPaths(*paths))
      return false;
  } else {
    if (!aux::peer::PrepareOrdinaryUserStartupPaths(*paths)) return false;
    command_line->AppendSwitchPath(switches::kUserDataDir, paths->data);
  }
  return InstallOrdinaryUserPathServices(*paths) &&
      aux::peer::RevalidateOrdinaryUserStartupPaths(*paths);
}
'''
rules[main]=[(old,fixed+wrapper)]
cache='chrome/common/chrome_paths_mac.mm'
rules[cache]=[('#include "base/base_paths.h"','#include "base/base_paths.h"\n#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)\n#include "chrome/common/chrome_paths.h"\n#endif'),('''  if (!app_data_dir.AppendRelativePath(profile_dir, &cache_dir))
    return;''','''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  base::FilePath selected;
  const auto native_user_root = app_data_dir.AppendASCII("Aux Browser/User Data");
  if (base::PathService::Get(chrome::DIR_USER_DATA, &selected) && selected == native_user_root &&
      (profile_dir == selected || selected.IsParent(profile_dir))) {
    auto native_cache = cache_dir.AppendASCII("Aux Browser");
    if (profile_dir == selected || selected.AppendRelativePath(profile_dir, &native_cache)) {
      *result = native_cache;
      return;
    }
    return;
  }
#endif
  if (!app_data_dir.AppendRelativePath(profile_dir, &cache_dir))
    return;''')]
m={'format':'aux.native.counted-projection.v1','purpose':'Consume validated sealed v9 native OS-user startup location without caller paths or legacy-state acceptance','nativeRoot':str(n),'files':[],'rootRegistrationRequired':{'commonMacDefine':'AUX_BROWSER_ONLY_NATIVE_STARTUP=1','cApi':'AuxGetValidatedEmbeddedNativeDaemonLaunchLocationMode','policyContract':'native-current-user-location-a29/consumer-contract.h'}};patch=[]
for rel,edits in rules.items():
 b=(n/rel).read_text();s=b;a=[]
 for old,new in edits:
  assert s.count(old)==1,(rel,old[:55],s.count(old));s=s.replace(old,new,1);a.append({'before':old,'after':new,'expectedCount':1})
 o=r/'source'/rel;o.parent.mkdir(parents=True,exist_ok=True);o.write_text(s)
 sha=lambda s:hashlib.sha256(s.encode()).hexdigest();m['files'].append({'path':rel,'inputSha256':sha(b),'outputSha256':sha(s),'source':str(o),'anchors':a});patch.extend(difflib.unified_diff(b.splitlines(True),s.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel,n=0))
(r/'source-plan.json').write_text(json.dumps(m,indent=2)+'\n');(r/'native-user-startup-a30.patch').write_text(''.join(patch));print(json.dumps([{k:f[k] for k in ['path','inputSha256','outputSha256']} for f in m['files']],indent=2))

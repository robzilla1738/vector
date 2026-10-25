#!/usr/bin/env python3
"""Materialize one counted browser-service-only successor; never compile/run it."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
P = ROOT / 'docs/integration/proposed'
MODE = '#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
rows = []


def materialize(source, name, changes):
    source = Path(source)
    original = source.read_text()
    current = original
    anchors = []
    for old, new in changes:
        assert current.count(old) == 1, (name, old[:120], current.count(old))
        current = current.replace(old, new, 1)
        anchors.append({'before': old, 'after': new, 'count': 1})
    baseline = HERE / 'baseline' / name
    output = HERE / 'source' / name
    baseline.parent.mkdir(parents=True, exist_ok=True)
    output.parent.mkdir(parents=True, exist_ok=True)
    baseline.write_text(original)
    output.write_text(current)
    rows.append({'input': str(source), 'inputSha256': digest(original.encode()),
                 'baseline': str(baseline.relative_to(HERE)),
                 'output': str(output.relative_to(HERE)),
                 'outputSha256': digest(current.encode()), 'anchors': anchors})


def digest(data):
    return hashlib.sha256(data).hexdigest()


materialize(P / 'standard-profile-isolation/daemon-crash-registration-close-a1/source/AuxNativeDaemonMain.cc', 'AuxNativeDaemonMain.cc', [
    ('#include <thread>\n', '#include <thread>\n#include <libproc.h>\n#include <signal.h>\n#include <cerrno>\n'),
    ('int main(int argc, char** argv) {\n', (HERE / 'ordinary-process-facts.inc').read_text() + '\nint main(int argc, char** argv) {\n'),
    ('    if (parent) {\n'
     '      while (AuxClosePreparedDaemonAuthorityServer(parent) != 0)\n'
     '        std::this_thread::sleep_for(std::chrono::milliseconds(250));\n'
     '    }',
     '    if (parent) {\n' + MODE +
     '      // A browser-startup grant is NOT an ES CLEAN receipt. Keep its exact\n'
     '      // registry-owned graph until physical process exit if still pending.\n'
     '      if (AuxClosePreparedDaemonAuthorityServer(parent) != 0) return;\n'
     '#else\n'
     '      while (AuxClosePreparedDaemonAuthorityServer(parent) != 0)\n'
     '        std::this_thread::sleep_for(std::chrono::milliseconds(250));\n'
     '#endif\n'
     '    }'),
    ('    while (status != 0) {\n'
     '      std::this_thread::sleep_for(std::chrono::milliseconds(250));\n'
     '      status = AuxClosePreparedDaemonAuthorityServer(lifetime_.parent);\n'
     '    }',
     '#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '    while (status != 0) {\n'
     '      std::this_thread::sleep_for(std::chrono::milliseconds(250));\n'
     '      status = AuxClosePreparedDaemonAuthorityServer(lifetime_.parent);\n'
     '    }\n'
     '#else\n'
     '    // Own server work has physically joined. Pending browser grant state\n'
     '    // remains in the native registry; this branch never emits CLEAN or\n'
     '    // claims all-browser-writer drain. NativeLifetime retains it to exit.\n'
     '    (void)status;\n'
     '#endif'),
    ('  // Fixed fresh native entry: before any bootstrap/image/Node/worker/user code.\n'
     '  // No late WorkerHost attach may substitute an empty descendant inventory.\n'
     '  const int descendants = aux::descendants::InitializeAtFreshDaemonEntry();\n'
     '  if (descendants != 0) return Refuse("task-supervision", descendants, 78);',
     '#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) || !AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '  // Supervised mode still requires actual descendant admission before user code.\n'
     '  const int descendants = aux::descendants::InitializeAtFreshDaemonEntry();\n'
     '  if (descendants != 0) return Refuse("task-supervision", descendants, 78);\n'
     '#endif\n'
     '  // Browser-only mode never initializes ES and cannot launch supervised work.\n'
     '  // Parent, sealed image, fresh installation and selected-home checks below\n'
     '  // remain mandatory. No environment or argv value can enable task rights.'),
    ('  auto host = std::make_shared<AuxDevelopmentWorkerHost>(lifetime.provider);\n'
     '  AuxNativeEnvironmentPreload preload(host);',
     '  auto host = std::make_shared<AuxDevelopmentWorkerHost>(lifetime.provider, setup->env());\n'
     '  AuxNativeEnvironmentPreload preload(host, setup->env());'),
    ('      {argv[0], "--disable-sigusr1", "--use-system-ca", script_path},',
     MODE +
     '      {argv[0], "--disable-sigusr1", "--use-system-ca", "--no-addons", script_path},\n'
     '#else\n'
     '      {argv[0], "--disable-sigusr1", "--use-system-ca", script_path},\n'
     '#endif'),
])

materialize('/private/tmp/aux-worker-close-successor/docs/integration/proposed/aux-native-worker-close-successor/source/AuxDevelopmentWorkerHost.h', 'AuxDevelopmentWorkerHost.h', [
    ('enum class AuxDevelopmentWorkerDrain', 'namespace node { class Environment; }\n\nenum class AuxDevelopmentWorkerDrain'),
    ('  explicit AuxDevelopmentWorkerHost(uint64_t prepared_fresh_provider);',
     '  explicit AuxDevelopmentWorkerHost(uint64_t prepared_fresh_provider,\n'
     '      node::Environment* browser_service_environment = nullptr);'),
])

worker = P / 'standard-profile-isolation/native-credential-lock-a1/source/AuxDevelopmentWorkerHost.cc'
changes = [
    ('const pid_t kHostProcess = getpid();',
     'const pid_t kHostProcess = getpid();\n' + MODE +
     'constexpr bool kBrowserOnlyNativeStartup = true;\n#else\n'
     'constexpr bool kBrowserOnlyNativeStartup = false;\n#endif\n'
     'napi_value RefuseSupervisedTaskBinding(napi_env env, napi_callback_info) {\n'
     '  napi_throw_error(env, "AUX_SUPERVISED_TASKS_DISABLED",\n'
     '      "Supervised task execution is disabled in this browser build");\n'
     '  return nullptr;\n}\n'),
    ('napi_value CaptureExecPrivateParent(napi_env env, napi_callback_info info) {\n',
     'napi_value CaptureExecPrivateParent(napi_env env, napi_callback_info info) {\n'
     '  if (kBrowserOnlyNativeStartup) return RefuseSupervisedTaskBinding(env, info);\n'),
    ('extern "C" void* AuxNativePtyBeginCurrent(void) noexcept {\n',
     'extern "C" void* AuxNativePtyBeginCurrent(void) noexcept {\n'
     '  if (kBrowserOnlyNativeStartup) return nullptr; // Before helper/owner/reservation.\n'),
    ('extern "C" void* AuxNativeExecBeginCurrent(void) noexcept {\n',
     'extern "C" void* AuxNativeExecBeginCurrent(void) noexcept {\n'
     '  if (kBrowserOnlyNativeStartup) return nullptr; // Before any child/ticket admission.\n'),
    ('  uint64_t prepared_fresh_provider = 0;\n',
     '  uint64_t prepared_fresh_provider = 0;\n'
     '  node::Environment* const browser_service_environment;\n'),
    ('  State() {\n', '  explicit State(node::Environment* environment) : browser_service_environment(environment) {\n'),
    ('  explicit State(uint64_t provider) : State() {\n'
     '    if (closed || !provider || AuxRetainPreparedFreshRuntimeProvider(provider)) closed = true;',
     '  State(uint64_t provider, node::Environment* environment) : State(environment) {\n'
     '    if ((kBrowserOnlyNativeStartup && !environment) || closed || !provider ||\n'
     '        AuxRetainPreparedFreshRuntimeProvider(provider)) closed = true;'),
    ('AuxDevelopmentWorkerHost::AuxDevelopmentWorkerHost(uint64_t provider)\n'
     '    : state_(std::make_shared<State>(provider)) {}',
     'AuxDevelopmentWorkerHost::AuxDevelopmentWorkerHost(uint64_t provider,\n'
     '    node::Environment* browser_service_environment)\n'
     '    : state_(std::make_shared<State>(provider, browser_service_environment)) {}'),
    ('  if (state_->closed) return napi_closing;\n',
     '  if (state_->closed) return napi_closing;\n'
     '  if (kBrowserOnlyNativeStartup &&\n'
     '      (environment != state_->browser_service_environment || !state_->workers.empty()))\n'
     '    return napi_generic_failure; // Only the actual embedding main Environment.\n'),
    ('  if (status == napi_ok && worker->CanContinue()) {\n'
     '    const napi_property_descriptor properties[] = {',
     '  if (status == napi_ok && worker->CanContinue()) {\n'
     '    napi_value supervised_tasks;\n'
     '    status = napi_get_boolean(env, !kBrowserOnlyNativeStartup, &supervised_tasks);\n'
     '    if (status == napi_ok) {\n'
     '      const napi_property_descriptor capability = {\n'
     '        "supervisedTasksEnabled", nullptr, nullptr, nullptr, nullptr,\n'
     '        supervised_tasks, napi_default, nullptr};\n'
     '      status = napi_define_properties(env, target, 1, &capability);\n'
     '    }\n'
     '  }\n'
     '  if (status == napi_ok && worker->CanContinue()) {\n'
     '    const napi_property_descriptor properties[] = {'),
    ('  aux::descendants::CloseAdmission();\n',
     '  if (!kBrowserOnlyNativeStartup) aux::descendants::CloseAdmission();\n'),
    ('  const auto descendant_stream = aux::descendants::InspectStream();\n'
     '  if (descendant_stream == aux::descendants::Result::unknown ||\n'
     '      descendant_stream == aux::descendants::Result::refused)\n'
     '    result = AuxDevelopmentWorkerDrain::untracked;\n'
     '  else if (descendant_stream == aux::descendants::Result::pending)\n'
     '    result = AuxDevelopmentWorkerDrain::pending;',
     '  if (!kBrowserOnlyNativeStartup) {\n'
     '    const auto descendant_stream = aux::descendants::InspectStream();\n'
     '    if (descendant_stream == aux::descendants::Result::unknown ||\n'
     '        descendant_stream == aux::descendants::Result::refused)\n'
     '      result = AuxDevelopmentWorkerDrain::untracked;\n'
     '    else if (descendant_stream == aux::descendants::Result::pending)\n'
     '      result = AuxDevelopmentWorkerDrain::pending;\n'
     '  }\n'
     '  // Browser-only settlement below covers actual provider/main/broker/image\n'
     '  // lifetimes. It neither observes nor reports an ES descendant census.'),
]
for callback in ['SeedBundledRuntime', 'AcquireRuntimeMutation', 'AcquireRuntimeUse']:
    old = f'nullptr,{callback},nullptr,nullptr,nullptr,napi_default,nullptr'
    changes.append((old, f'nullptr,kBrowserOnlyNativeStartup ? RefuseSupervisedTaskBinding : {callback},nullptr,nullptr,nullptr,napi_default,nullptr'))
materialize(worker, 'AuxDevelopmentWorkerHost.cc', changes)

materialize(P / 'aux-native-environment-preload/source/AuxNativeEnvironmentPreload.h', 'AuxNativeEnvironmentPreload.h', [
    ('      std::shared_ptr<AuxDevelopmentWorkerHost> native_host);',
     '      std::shared_ptr<AuxDevelopmentWorkerHost> native_host,\n'
     '      node::Environment* browser_service_environment = nullptr);'),
])
materialize(P / 'aux-native-environment-preload/source/AuxNativeEnvironmentPreload.cc', 'AuxNativeEnvironmentPreload.cc', [
    ('  explicit State(std::shared_ptr<AuxDevelopmentWorkerHost> value)\n'
     '      : host(std::move(value)) {}',
     '  State(std::shared_ptr<AuxDevelopmentWorkerHost> value, node::Environment* environment)\n'
     '      : host(std::move(value)), browser_service_environment(environment) {}'),
    ('  const std::shared_ptr<AuxDevelopmentWorkerHost> host;\n',
     '  const std::shared_ptr<AuxDevelopmentWorkerHost> host;\n'
     '  node::Environment* const browser_service_environment;\n'),
    ('    std::shared_ptr<AuxDevelopmentWorkerHost> native_host) {\n'
     '  if (!native_host) throw std::invalid_argument("Actual native host required");\n'
     '  state_ = std::make_shared<State>(std::move(native_host));',
     '    std::shared_ptr<AuxDevelopmentWorkerHost> native_host,\n'
     '    node::Environment* browser_service_environment) {\n'
     '  if (!native_host) throw std::invalid_argument("Actual native host required");\n' + MODE +
     '  if (!browser_service_environment)\n'
     '    throw std::invalid_argument("Actual main browser-service Environment required");\n#endif\n'
     '  state_ = std::make_shared<State>(std::move(native_host), browser_service_environment);'),
    ('    auto record = std::make_shared<EnvironmentRecord>();\n',
     MODE + '    // Node invokes this before child Worker user code. Main is the exact\n'
     '    // CommonEnvironmentSetup Environment, never whichever environment arrived first.\n'
     '    if (actual != state->browser_service_environment) {\n'
     '      ThrowPreload(isolate);\n'
     '      return;\n'
     '    }\n#endif\n'
     '    auto record = std::make_shared<EnvironmentRecord>();\n'),
])

materialize(P / 'aux-native-fresh-runtime-readiness/source/AuxPreparedFreshRuntimeProvider.swift', 'AuxPreparedFreshRuntimeProvider.swift', [
    ('            let custody=AuxOSJobCustody()\n'
     '            let utilities=AuxMacOSUtilityCommandCore(boundary:AuxAppKitUtilityBoundary(custody:custody))\n'
     '            owner=try AuxOwnedCommandDispatcher(scopedTerminal:scoped,macOSUtilities:utilities)',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '            // Retain the genuine installation/secure-store context, without\n'
     '            // issuing OS utility or supervised task capability to this owner.\n'
     '            owner=try AuxOwnedCommandDispatcher(scopedTerminal:scoped)\n'
     '#else\n'
     '            let custody=AuxOSJobCustody()\n'
     '            let utilities=AuxMacOSUtilityCommandCore(boundary:AuxAppKitUtilityBoundary(custody:custody))\n'
     '            owner=try AuxOwnedCommandDispatcher(scopedTerminal:scoped,macOSUtilities:utilities)\n'
     '#endif'),
])
materialize(P / 'standard-profile-isolation/ui-journal-readonly-inventory-a26/source/AuxOwnedCommandDispatcher.swift', 'AuxOwnedCommandDispatcher.swift', [
    ('    private func dispatchKnownCommand(_ entry:Entry,command:String,input:String)->String {\n',
     '    private func dispatchKnownCommand(_ entry:Entry,command:String,input:String)->String {\n'
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        if AuxMacOSUtilityCommandCore.commands.contains(command) {\n'
     '            return "{\\"error\\":\\"Supervised OS utility execution is disabled in this browser build\\",\\"code\\":\\"AUX_SUPERVISED_TASKS_DISABLED\\"}"\n'
     '        }\n'
     '#endif\n'),
])

materialize('/private/tmp/aux-browser-root-restart/docs/integration/proposed/profile-isolation-recovery/restart/source/AuxFreshBootstrapPolicy.swift', 'AuxFreshBootstrapPolicy.swift', [
    ('    var includesPdf:Bool{role == .daemon}\n'
     '    var includesMacUtilities:Bool{role == .daemon}',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '    var includesPdf:Bool{false}\n'
     '    var includesMacUtilities:Bool{false}\n'
     '#else\n'
     '    var includesPdf:Bool{role == .daemon}\n'
     '    var includesMacUtilities:Bool{role == .daemon}\n'
     '#endif'),
    ('        if role == .daemon {keys.formUnion(["pdfModule","macOSUtilitiesModule"]);try AuxFreshBootstrapPdfIdentity.validate(object["pdfModule"]);try AuxFreshBootstrapMacUtilitiesIdentity.validate(object["macOSUtilitiesModule"])}',
     '#if !AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        if role == .daemon {keys.formUnion(["pdfModule","macOSUtilitiesModule"]);try AuxFreshBootstrapPdfIdentity.validate(object["pdfModule"]);try AuxFreshBootstrapMacUtilitiesIdentity.validate(object["macOSUtilitiesModule"])}\n'
     '#endif'),
    ('        let containedPty=object["format"] as? String=="aux.fresh.bootstrap.policy.v6" || browserStartup',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        let containedPty=false\n'
     '#else\n'
     '        let containedPty=object["format"] as? String=="aux.fresh.bootstrap.policy.v6" || browserStartup\n'
     '#endif'),
    ('        let rebuiltPty=object["format"] as? String=="aux.fresh.bootstrap.policy.v4" || splitTask\n'
     '        let ptyVersion=object["format"] as? String=="aux.fresh.bootstrap.policy.v3" || rebuiltPty',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        let rebuiltPty=false,ptyVersion=false\n'
     '#else\n'
     '        let rebuiltPty=object["format"] as? String=="aux.fresh.bootstrap.policy.v4" || splitTask\n'
     '        let ptyVersion=object["format"] as? String=="aux.fresh.bootstrap.policy.v3" || rebuiltPty\n'
     '#endif'),
    ('        let splitTask=object["format"] as? String=="aux.fresh.bootstrap.policy.v5" || containedPty',
     '        let splitTask=object["format"] as? String=="aux.fresh.bootstrap.policy.v5" || containedPty || browserStartup'),
    ('        let embedded=object["format"] as? String=="aux.fresh.bootstrap.policy.v2" || ptyVersion',
     '        let embedded=object["format"] as? String=="aux.fresh.bootstrap.policy.v2" || ptyVersion || browserStartup'),
    ('        if browserStartup {\n'
     '            guard let b=object["browserStartup"] as? [String:Any],Set(b.keys)==["format","dataRoot","cacheRoot"],\n'
     '                  b["format"] as? String==(recoverable ? "aux.browser.recoverable-root-lease.v2":"aux.browser.fresh-root-lease.v1"),',
     '        if browserStartup {\n'
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '            guard recoverable else{throw AuxFreshBootstrapPolicyError.policy}\n'
     '            let expectedRootFormat="aux.browser.ordinary-root-lease.v1"\n'
     '#else\n'
     '            let expectedRootFormat=recoverable ? "aux.browser.recoverable-root-lease.v2":"aux.browser.fresh-root-lease.v1"\n'
     '#endif\n'
     '            guard let b=object["browserStartup"] as? [String:Any],Set(b.keys)==["format","dataRoot","cacheRoot"],\n'
     '                  b["format"] as? String==expectedRootFormat,'),
    ('        return .init(role:role,canonicalPrivateParent:parent,accessGroup:group,canonicalTaskParent:taskParent,browserStartupRoots:browserRoots,browserPreparedRecovery:recoverable,embeddedDaemon:embedded,ptyArtifacts:pty,includesRebuiltPtyModule:rebuiltPty,includesContainedPtyModule:containedPty)',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        guard recoverable,browserRoots != nil else{throw AuxFreshBootstrapPolicyError.policy}\n'
     '#endif\n'
     '        return .init(role:role,canonicalPrivateParent:parent,accessGroup:group,canonicalTaskParent:taskParent,browserStartupRoots:browserRoots,browserPreparedRecovery:recoverable,embeddedDaemon:embedded,ptyArtifacts:pty,includesRebuiltPtyModule:rebuiltPty,includesContainedPtyModule:containedPty)'),
    ('    guard policy.role != .daemon || (policy.includesContainedPtyModule && policy.browserStartupRoots != nil && policy.browserPreparedRecovery) else {throw AuxFreshBootstrapPolicyError.policy}',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '    guard policy.role == .daemon,policy.embeddedDaemon,policy.browserStartupRoots != nil,\n'
     '          policy.browserPreparedRecovery,!policy.includesPdf,!policy.includesMacUtilities,\n'
     '          !policy.includesRebuiltPtyModule,!policy.includesContainedPtyModule,policy.ptyArtifacts == nil else{throw AuxFreshBootstrapPolicyError.policy}\n'
     '#else\n'
     '    guard policy.role != .daemon || (policy.includesContainedPtyModule && policy.browserStartupRoots != nil && policy.browserPreparedRecovery) else {throw AuxFreshBootstrapPolicyError.policy}\n'
     '#endif'),
])

materialize('/private/tmp/aux-final-native-link/docs/integration/proposed/final-completion/native/exec-parent/source/AuxSignedFreshBootstrapPolicyLoader.swift', 'AuxSignedFreshBootstrapPolicyLoader.swift', [
    ('        // dlopen has no reviewed retained-FD loading API on macOS. Hold the\n',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        guard geteuid() != 0,!policy.contents.includesPdf,!policy.contents.includesMacUtilities,\n'
     '              policy.contents.ptyArtifacts == nil else{throw AuxFreshBootstrapPolicyError.policy}\n'
     '        // Main-only exact image census is checked by authenticatedBase.\n'
     '        // No addon constructor is run, and Node --no-addons prevents later loads.\n'
     '        let final=try authenticatedBase(preparing:false)\n'
     '        guard final.policySha256==policy.policySha256,final.bundlePath==policy.bundlePath,\n'
     '              final.hostCdHash==policy.hostCdHash else{throw AuxFreshBootstrapPolicyError.identity}\n'
     '#else\n'
     '        // dlopen has no reviewed retained-FD loading API on macOS. Hold the\n'),
    ('        guard final.policySha256==policy.policySha256,final.bundlePath==policy.bundlePath,final.hostCdHash==policy.hostCdHash else{throw AuxFreshBootstrapPolicyError.identity}\n'
     '    }\n}\n@_cdecl("AuxPrepareSealedNativeDaemonImages")',
     '        guard final.policySha256==policy.policySha256,final.bundlePath==policy.bundlePath,final.hostCdHash==policy.hostCdHash else{throw AuxFreshBootstrapPolicyError.identity}\n'
     '#endif\n'
     '    }\n}\n@_cdecl("AuxPrepareSealedNativeDaemonImages")'),
])

materialize(P / 'standard-profile-isolation/ui-native-capture-journal-a1/source/AuxFreshColdInstallerGuard.swift', 'AuxFreshColdInstallerGuard.swift', [
    ('enum AuxFreshColdGuardError:Error', (HERE / 'ordinary-lifetime.inc').read_text() + '\nenum AuxFreshColdGuardError:Error'),
    ('        let browserAdmission=try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:data.generation,data:data.descriptor,cache:cache.descriptor)',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        let browserLifetime=try AuxOrdinaryBrowserLifetime.capture(peer:peer)\n'
     '        let browserAdmission=try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:data.generation,data:data.descriptor,cache:cache.descriptor,ordinaryBrowser:browserLifetime)\n'
     '#else\n'
     '        let browserAdmission=try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:data.generation,data:data.descriptor,cache:cache.descriptor)\n'
     '#endif'),
])

materialize(P / 'standard-profile-isolation/ui-native-capture-journal-a1/source/AuxBrowserFreshRootAdmission.swift', 'AuxBrowserFreshRootAdmission.swift', [
    ('    private static let marker=".aux-browser-startup-lease.v2"',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '    private static let marker=".aux-browser-ordinary-lease.v1"\n'
     '#else\n'
     '    private static let marker=".aux-browser-startup-lease.v2"\n'
     '#endif\n'
     '    private let ordinaryBrowser:AuxOrdinaryBrowserLifetime?\n'
     '    private var ordinaryInstallationSha=""'),
    ('permitsExistingData:Bool,priorCleanReceipt:String) {\n',
     'permitsExistingData:Bool,priorCleanReceipt:String,ordinaryBrowser:AuxOrdinaryBrowserLifetime? = nil) {\n'),
    ('self.priorCleanReceipt=priorCleanReceipt\n',
     'self.priorCleanReceipt=priorCleanReceipt;self.ordinaryBrowser=ordinaryBrowser\n'),
    ('static func acquire(policy:AuxAuthenticatedFreshBootstrapPolicy,generation:UInt64,data:Int32,cache:Int32)throws->AuxBrowserFreshRootAdmission {\n',
     'static func acquire(policy:AuxAuthenticatedFreshBootstrapPolicy,generation:UInt64,data:Int32,cache:Int32,ordinaryBrowser:AuxOrdinaryBrowserLifetime? = nil)throws->AuxBrowserFreshRootAdmission {\n'
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        guard let browser=ordinaryBrowser else{throw AuxFreshColdGuardError.path}\n'
     '        return try acquireOrdinary(policy:policy,generation:generation,data:data,cache:cache,browser:browser)\n'
     '#else\n'),
    ('        // Missing/mixed/truncated/mismatched records never recreate or reset.\n    }',
     '        // Missing/mixed/truncated/mismatched records never recreate or reset.\n'
     '#endif\n    }'),
    ('    private func validateLocked()throws {\n',
     '    private func validateLocked()throws {\n'
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        try validateOrdinaryLocked()\n'
     '#else\n'),
    ('    }\n    func revalidate()throws {\n', '#endif\n    }\n    func revalidate()throws {\n'),
    ('    func receipt()throws->Data {\n',
     '    func receipt()throws->Data {\n'
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        return try ordinaryReceipt()\n'
     '#else\n'),
    ('        return bytes\n    }\n', '        return bytes\n#endif\n    }\n'),
    ('    func completeCleanShutdown(peer:AuxLiveNativeParentConnection)throws {\n',
     '    func completeCleanShutdown(peer:AuxLiveNativeParentConnection)throws {\n'
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n'
     '        throw AuxFreshColdGuardError.path // Ordinary mode never emits ES CLEAN.\n'
     '#else\n'),
    ('        pendingCleanAcknowledgement=nil\n    }\n    private static func metadata',
     '        pendingCleanAcknowledgement=nil\n#endif\n    }\n'
     + (HERE / 'ordinary-root-methods.inc').read_text() + '\n    private static func metadata'),
])

plan = {'format': 'aux.ordinary-fresh-browser-startup.source.v1',
        'mode': 'AUX_BROWSER_ONLY_NATIVE_STARTUP=1',
        'sourceCount': len(rows), 'anchorCount': sum(len(r['anchors']) for r in rows),
        'files': rows, 'productExecuted': False, 'compiled': False, 'signed': False,
        'selectedHomeContractUnchanged': True, 'esReadinessFabricated': False}
(HERE / 'source-plan.json').write_text(json.dumps(plan, indent=2) + '\n')
print(json.dumps({'sources': plan['sourceCount'], 'anchors': plan['anchorCount']}))

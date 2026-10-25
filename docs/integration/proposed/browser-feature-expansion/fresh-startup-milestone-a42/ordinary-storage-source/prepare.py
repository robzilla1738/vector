#!/usr/bin/env python3
"""Freeze exact A13 owners and emit the ordinary-storage successor only."""
from pathlib import Path
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
PROPOSED = ROOT / 'docs/integration/proposed'
BUILD = PROPOSED / 'browser-feature-expansion/fresh-startup-milestone-a42/actual-daemon-image-path-check-build-a13.json'
INPUTS = json.loads(BUILD.read_text())['inputFiles']
rows = []
patches = []


def sha(data):
    return hashlib.sha256(data).hexdigest()


def emit(path, changes):
    path = Path(path)
    before = path.read_text()
    assert sha(before.encode()) == INPUTS[str(path)], path
    after = before
    anchors = []
    for old, new in changes:
        assert after.count(old) == 1, (path.name, old[:100], after.count(old))
        after = after.replace(old, new, 1)
        anchors.append({'before': old, 'after': new, 'count': 1})
    (HERE / 'baseline').mkdir(exist_ok=True)
    (HERE / 'baseline' / path.name).write_text(before)
    (HERE / path.name).write_text(after)
    rows.append({'input': str(path), 'inputSha256': sha(before.encode()),
                 'output': str(ROOT / HERE.relative_to(Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web')) / path.name),
                 'outputSha256': sha(after.encode()), 'anchors': anchors})
    patches.extend(difflib.unified_diff(before.splitlines(True), after.splitlines(True),
                   fromfile='a/' + path.name, tofile='b/' + path.name))


loader = PROPOSED / 'browser-feature-expansion/fresh-startup-milestone-a42/image-path-check-source/AuxSignedFreshBootstrapPolicyLoader.swift'
emit(loader, [
    ('    // Native consumer revalidation; no captured bytes/Boolean substitute can\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func revalidateRetainedOrdinaryIdentity()throws {
        try AuxSignedFreshBootstrapPolicyLoader.revalidateRetainedOrdinaryPolicy(self)
    }
#endif
    // Native consumer revalidation; no captured bytes/Boolean substitute can
'''),
    ('    private static func canonical(_ path:String)throws->String {\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    static func revalidateRetainedOrdinaryPolicy(_ policy:AuxAuthenticatedFreshBootstrapPolicy)throws {
        guard getpid()==auxImagePreparationProcess else{throw AuxFreshBootstrapPolicyError.identity}
        ordinaryCodeLock.lock()
        guard let current=ordinaryCode else{ordinaryCodeLock.unlock();throw AuxFreshBootstrapPolicyError.identity}
        ordinaryCodeLock.unlock()
        guard policy.contents.role == .daemon,policy.contents.embeddedDaemon,
              !policy.contents.includesPdf,!policy.contents.includesMacUtilities,policy.contents.ptyArtifacts == nil,
              current.executablePath==policy.bundlePath+"/Contents/MacOS/"+policy.contents.role.executable else{throw AuxFreshBootstrapPolicyError.identity}
        try current.revalidate()
    }
#endif
    private static func canonical(_ path:String)throws->String {
'''),
])

guard_path = PROPOSED / 'standard-profile-isolation/ordinary-fresh-browser-startup-a1/source/AuxFreshColdInstallerGuard.swift'
emit(guard_path, [
    ('@_silgen_name("AuxCopyAuthenticatedBrowserDrainReport")', '''@_silgen_name("AuxInspectRetainedNativeParentConnection")
private func inspectRetainedNativeParent(_ id:UInt64)->Int32
@_silgen_name("AuxCopyAuthenticatedBrowserDrainReport")'''),
    ('    // Finite native capability. Every successful query transfers one new FD;\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func inspectRetained()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        let status=inspectRetainedNativeParent(handle)
        guard status==0 else{throw AuxFreshColdGuardError.peer(status)}
    }
#endif
    // Finite native capability. Every successful query transfers one new FD;
'''),
    ('    func duplicate(role:UInt32,peer:AuxLiveNativeParentConnection)throws->(generation:UInt64,descriptor:Int32) {\n', '''    var retainedGeneration:UInt64 { generation }
    func duplicate(role:UInt32,peer:AuxLiveNativeParentConnection)throws->(generation:UInt64,descriptor:Int32) {
'''),
    ('    func duplicateAuthenticatedBrowserRoot(role:UInt32)throws->(generation:UInt64,descriptor:Int32) {\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    var ordinaryStorageGeneration:UInt64 { browserRoots.retainedGeneration }
    func revalidateOrdinaryStorageBinding()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        try peer.inspectRetained()
        try policy.revalidateRetainedOrdinaryIdentity()
        try browserAdmission.revalidateOrdinaryStorageBinding(generation:ordinaryStorageGeneration)
        try Self.requirePrivate(parentFD,directory:true)
        try Self.requirePath(policy.contents.canonicalPrivateParent,fd:parentFD)
        try Self.requirePrivate(installerFD,directory:false)
        try Self.requireInstaller(parent:parentFD,fd:installerFD)
        guard let taskPath=policy.contents.canonicalTaskParent else{throw AuxFreshColdGuardError.path}
        try Self.requirePrivate(taskParentFD,directory:true)
        try Self.requirePath(taskPath,fd:taskParentFD)
        try peer.inspectRetained()
    }
#endif
    func duplicateAuthenticatedBrowserRoot(role:UInt32)throws->(generation:UInt64,descriptor:Int32) {
'''),
])

root_path = PROPOSED / 'standard-profile-isolation/ordinary-fresh-browser-startup-a1/source/AuxBrowserFreshRootAdmission.swift'
emit(root_path, [
    ('    private func validateOrdinaryLocked()throws {\n'
     '        guard phase == .prepared || phase == .admitted,let browser=ordinaryBrowser else{throw AuxFreshColdGuardError.path}\n'
     '        try policy.revalidateCurrentIdentity();try browser.requireCurrent()\n', '''    private func validateOrdinaryLocked()throws {
        try policy.revalidateCurrentIdentity()
        try validateRetainedOrdinaryLocked()
    }
    func revalidateOrdinaryStorageBinding(generation expected:UInt64)throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()}
        guard expected>0,expected==generation else{throw AuxFreshColdGuardError.path}
        try validateRetainedOrdinaryLocked()
    }
    private func validateRetainedOrdinaryLocked()throws {
        guard phase == .prepared || phase == .admitted,let browser=ordinaryBrowser else{throw AuxFreshColdGuardError.path}
        try browser.requireCurrent()
'''),
])

task_path = Path('/private/tmp/aux-profile-startup-next/docs/integration/proposed/profile-isolation-next/startup/v5-source/AuxNativeTaskLayout.swift')
task_body = task_path.read_text().split('    func revalidate()throws {\n', 1)[1].split('    func duplicateTaskHome()', 1)[0]
retained_body = task_body.replace('        try policy.revalidateCurrentIdentity();try Self.pathIdentity(parentPath,parent)',
                                  '        try Self.pathIdentity(parentPath,parent)').replace('        try policy.revalidateCurrentIdentity()\n', '')
emit(task_path, [
    ('    func duplicateTaskHome()throws->Int32 {\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func revalidateRetainedIdentity()throws {
''' + retained_body + '''    func duplicateRetainedTaskHome()throws->Int32 {
        try revalidateRetainedIdentity()
        let fd=fcntl(home,F_DUPFD_CLOEXEC,0)
        guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
        do{try revalidateRetainedIdentity();return fd}catch{close(fd);throw error}
    }
#endif
    func duplicateTaskHome()throws->Int32 {
'''),
])

stage_path = PROPOSED / 'standard-profile-isolation/ui-native-capture-journal-a1/source/AuxNativeFreshStageCoordinator.swift'
emit(stage_path, [
    ('    func revalidateNativeStageBinding() throws {\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func revalidateOrdinaryStorageBinding()throws {
        try coldGuard.revalidateOrdinaryStorageBinding()
        try taskLayout.revalidateRetainedIdentity()
        switch owner {
        case .fresh(let capture):
            try capture.home.validateRetainedIdentity()
            guard capture.scope==journal.scope,capture.transactionId==journal.reservationTransactionId,
                  capture.policy.policySha256==journal.policySha256,
                  try capture.home.currentReservationSha256()==journal.reservationSha256 else{throw NativeFreshBootstrapError.binding}
        case .resumed(let home):
            try home.validateRetainedIdentity()
            guard home.scope==journal.scope,home.transactionId==journal.reservationTransactionId,
                  try home.currentReservationSha256()==journal.reservationSha256 else{throw NativeFreshBootstrapError.binding}
        }
        guard authenticatedPolicy.policySha256==journal.policySha256,
              authenticatedPolicy.contents.accessGroup==journal.accessGroup,
              authenticatedPolicy.contents.role.rawValue==journal.role else{throw NativeFreshBootstrapError.binding}
    }
    func duplicateRetainedOrdinaryStorageRoots()throws->(generation:UInt64,control:Int32,task:Int32) {
        let task=try taskLayout.duplicateRetainedTaskHome()
        do {
            let control=try duplicateRetainedHomeDescriptor()
            return(coldGuard.ordinaryStorageGeneration,control,task)
        }catch{Darwin.close(task);throw error}
    }
#endif
    func revalidateNativeStageBinding() throws {
'''),
])

context_path = PROPOSED / 'aux-native-fresh-runtime-readiness/source/NativeFreshRuntimeCapturedContext.swift'
emit(context_path, [
    ('    private init(terminal:NativeFreshTerminalSelection,runtime:AuxRuntimeCapturedCommandContext){\n'
     '        owner=terminal.context;self.runtime=runtime\n'
     '        initialSha=terminal.initialJournalSha256;targetSha=terminal.targetJournalSha256\n'
     '    }', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    private let retainedInitialStore:PrivateNativeFreshBootstrapJournalStore
    private let retainedTargetStore:PrivateNativeFreshTargetJournalStore
#endif
    private init(terminal:NativeFreshTerminalSelection,runtime:AuxRuntimeCapturedCommandContext)throws {
        let owner=terminal.context
        self.owner=owner;self.runtime=runtime
        initialSha=terminal.initialJournalSha256;targetSha=terminal.targetJournalSha256
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        let fd=try owner.duplicateRetainedHomeDescriptor();defer{Darwin.close(fd)}
        retainedInitialStore=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:owner.canonicalHome,journal:owner.journal,retainedRootDescriptor:fd)
        retainedTargetStore=try PrivateNativeFreshTargetJournalStore(canonicalDisposableRoot:owner.canonicalHome,transactionId:owner.journal.reservationTransactionId,retainedRootDescriptor:fd)
#endif
    }'''),
    ('        let captured=NativeFreshRuntimeCapturedContext(terminal:terminal,runtime:runtime)',
     '        let captured=try NativeFreshRuntimeCapturedContext(terminal:terminal,runtime:runtime)'),
    ('    func revalidate()throws {\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func revalidateOrdinaryStorageBinding()throws {
        try owner.revalidateOrdinaryStorageBinding()
        guard initialSha==owner.durableJournalSha256,runtime.selection.scope==owner.journal.scope,
              runtime.selection.generationId==owner.journal.reservationTransactionId,
              runtime.selection.accessGroup==owner.journal.accessGroup,
              runtime.selection.targetHashes==owner.journal.targetHashes,
              let initial=try retainedInitialStore.loadRetained(),initial.journal==owner.journal,
              initial.sha256==initialSha,
              let current=try retainedTargetStore.loadRetained(),current.sha256==targetSha,
              current.journal.phase == .ready else{throw NativeFreshRuntimeConsumerError.binding}
        try NativeFreshTargetTransaction.validateBinding(current.journal,initial:owner.journal,initialSha256:initialSha)
    }
#endif
    func revalidate()throws {
'''),
])

for name, directory, return_type, error_type, load in [
    ('PrivateNativeFreshBootstrapJournalStore.swift', 'aux-native-fresh-retained-journal', 'StoredNativeFreshBootstrapJournal', 'NativeFreshBootstrapStoreError', '''        guard let bytes=try readFile("initial-journal.json") else{return nil}
        let journal=try decode(bytes)
        guard try readFile("initial-journal.json")==bytes else{throw NativeFreshBootstrapStoreError.corruptBinding}
        let result=StoredNativeFreshBootstrapJournal(journal:journal,sha256:nativeBootstrapHash(bytes))'''),
    ('PrivateNativeFreshTargetJournalStore.swift', 'aux-native-fresh-target-coordinator', 'StoredNativeFreshTargetCheckpoint', 'NativeFreshTargetStoreError', '        let result=try loadUnlocked()'),
]:
    path = PROPOSED / directory / 'source' / name
    anchor = '    func load()throws->StoredNativeFreshBootstrapJournal?{try locked{try loadUnlocked()}}' if 'Bootstrap' in name else '    func loadCurrent()throws->StoredNativeFreshTargetCheckpoint? { try locked{try loadUnlocked()} }'
    method = f'''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func loadRetained()throws->{return_type}? {{
        try validateDirectories()
        let fd=openat(directoryFD,"LOCK",O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC)
        guard fd>=0 else{{throw {error_type}.io(errno)}};defer{{close(fd)}}
        try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd)
        guard try Self.statFD(fd).st_size==0 else{{throw {error_type}.unsafeMetadata}}
        guard flock(fd,LOCK_SH|LOCK_NB)==0 else{{throw {error_type}.busy}}
        defer{{_ = flock(fd,LOCK_UN)}}
{load}
        try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd);try validateDirectories()
        return result
    }}
#endif
'''
    emit(path, [(anchor, method + anchor)])

provider_path = PROPOSED / 'standard-profile-isolation/ordinary-fresh-browser-startup-a1/source/AuxPreparedFreshRuntimeProvider.swift'
emit(provider_path, [
    ('            let current=try NativeFreshRuntimeCapturedContext.capture(entry.terminal)\n', '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
            let current=entry.preparedCapture
            try current.revalidateOrdinaryStorageBinding()
            descriptor=try current.owner.duplicateRetainedHomeDescriptor()
            try current.revalidateOrdinaryStorageBinding()
#else
            let current=try NativeFreshRuntimeCapturedContext.capture(entry.terminal)
'''),
    ('            try current.revalidateCurrentCommandBinding()\n        }catch {',
     '            try current.revalidateCurrentCommandBinding()\n#endif\n        }catch {'),
])

dispatcher_path = PROPOSED / 'browser-feature-expansion/fresh-startup-milestone-a42/callback-authority-source/AuxOwnedCommandDispatcher.swift'
dispatcher = dispatcher_path.read_text()
validation = dispatcher.split('    func validateCurrentAuthority(_ handle:UInt64)->Int32 {', 1)[1].split('    // Cancellation closes future commands', 1)[0]
ordinary_validation = validation.replace('requireFreshGuard(entry,moment:', 'requireOrdinaryStorageGuard(entry,moment:')
copy_roots = dispatcher.split('    func copyAuthenticatedStorageRoots(_ handle:UInt64)', 1)[1].split('    // Native synchronous action only.', 1)[0]
ordinary_copy_roots = copy_roots.replace('try requireFreshGuard(entry,moment:', 'try requireOrdinaryStorageGuard(entry,moment:').replace(
    '                let projection=try captured.owner.duplicateAuthenticatedTaskHome()\n'
    '                task=projection.descriptor\n'
    '                control=try captured.owner.duplicateRetainedHomeDescriptor()',
    '                let copied=try captured.owner.duplicateRetainedOrdinaryStorageRoots()\n'
    '                let projection=(generation:copied.generation,descriptor:copied.task)\n'
    '                task=copied.task;control=copied.control')
account_old = '''        try withEntry(handle){entry in
            guard let secure=entry.secureStore else{throw AuxAccountsCskError.unavailable}
            return try secure.withAccountRegistryLock {
                try self.guardedFreshAction(entry,before:.beforeAccountCallback,after:.afterAccountCallback,afterThrow:.afterThrownAccountCallback,body)
            }
        }'''
account_new = '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        try withEntry(handle,guardGenericAction:false){entry in
            try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction,validation:.ordinaryStorage){
                guard let secure=entry.secureStore else{throw AuxAccountsCskError.unavailable}
                return try secure.withAccountRegistryLock {
                    try self.guardedFreshAction(entry,before:.beforeAccountCallback,after:.afterAccountCallback,afterThrow:.afterThrownAccountCallback,validation:.ordinaryStorage,body)
                }
            }
        }
#else
''' + account_old + '\n#endif'
changes = [
    (account_old, account_new),
    ('    private func requireFreshGuard(_ entry:Entry,moment:AuxNativeFreshGuardMoment,operationError:Error?=nil)throws {\n', '''    private enum GuardValidation:Equatable {case full,ordinaryStorage}
    private func requireFreshGuard(_ entry:Entry,moment:AuxNativeFreshGuardMoment,operationError:Error?=nil)throws {
        try requireGuard(entry,moment:moment,operationError:operationError,validation:.full)
    }
    private func requireOrdinaryStorageGuard(_ entry:Entry,moment:AuxNativeFreshGuardMoment)throws {
        try requireGuard(entry,moment:moment,operationError:nil,validation:.ordinaryStorage)
    }
    private func requireGuard(_ entry:Entry,moment:AuxNativeFreshGuardMoment,operationError:Error?,validation:GuardValidation)throws {
'''),
    ('        guard let captured=entry.nativeFreshRuntime else{return}\n', '''        guard let captured=entry.nativeFreshRuntime else{
            guard validation == .full else{throw AuxDispatcherLifetimeError.invalidInput};return
        }
'''),
    ('        guard open || !requiresOpen else{throw AuxDispatcherLifetimeError.retiring}\n'
     '        do{try captured.revalidateCurrentCommandBinding()}\n        catch {', '''        guard open || !requiresOpen else{throw AuxDispatcherLifetimeError.retiring}
        do{
            switch validation {
            case .full:try captured.revalidateCurrentCommandBinding()
            case .ordinaryStorage:
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
                try captured.revalidateOrdinaryStorageBinding()
#else
                throw AuxDispatcherLifetimeError.invalidInput
#endif
            }
        }
        catch {'''),
    ('afterThrow:AuxNativeFreshGuardMoment,_ action:()throws->T)throws->T {\n'
     '        try requireFreshGuard(entry,moment:before)',
     'afterThrow:AuxNativeFreshGuardMoment,validation:GuardValidation = .full,_ action:()throws->T)throws->T {\n'
     '        try requireGuard(entry,moment:before,operationError:nil,validation:validation)'),
    ('            try requireFreshGuard(entry,moment:afterThrow,operationError:original);throw original',
     '            try requireGuard(entry,moment:afterThrow,operationError:original,validation:validation);throw original'),
    ('        try requireFreshGuard(entry,moment:after)\n        return result\n    }',
     '        try requireGuard(entry,moment:after,operationError:nil,validation:validation)\n        return result\n    }'),
    ('    func copyAuthenticatedStorageRoots(_ handle:UInt64)' + copy_roots,
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n    func copyAuthenticatedStorageRoots(_ handle:UInt64)' + ordinary_copy_roots +
     '\n#else\n    func copyAuthenticatedStorageRoots(_ handle:UInt64)' + copy_roots + '\n#endif\n'),
    ('    // Cancellation closes future commands',
     '#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n    func validateOrdinaryStorageAuthority(_ handle:UInt64)->Int32 {' + ordinary_validation + '#endif\n    // Cancellation closes future commands'),
    ('@_cdecl("AuxNativeContextCopyBrowserRoot")', '''@_cdecl("AuxNativeContextValidateOrdinaryStorageAuthority")
func auxNativeContextValidateOrdinaryStorageAuthority(_ handle:UInt64)->Int32 {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    return AuxCommandDispatcherRegistry.shared.validateOrdinaryStorageAuthority(handle)
#else
    return -1
#endif
}
@_cdecl("AuxNativeContextCopyBrowserRoot")'''),
]
emit(dispatcher_path, changes)

projection = {'format': 'aux.ordinary-storage.retained-source.v1',
              'baseline': str(BUILD), 'baselineSha256': sha(BUILD.read_bytes()),
              'files': rows, 'sourceCount': len(rows),
              'anchorCount': sum(len(r['anchors']) for r in rows),
              'cppRequirement': 'AuxInspectRetainedNativeParentConnection(uint64_t)->int32_t',
              'cppBrokerSymbol': 'AuxNativeContextValidateOrdinaryStorageAuthority(uint64_t)->int32_t',
              'compiled': False, 'signed': False, 'productExecuted': False}
(HERE / 'projection.json').write_text(json.dumps(projection, indent=2) + '\n')
(HERE / 'ordinary-storage.patch').write_text(''.join(patches))
print(json.dumps({'sources': len(rows), 'anchors': projection['anchorCount']}))

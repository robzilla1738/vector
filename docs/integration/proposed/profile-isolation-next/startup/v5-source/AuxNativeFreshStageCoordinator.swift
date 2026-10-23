// Inactive concrete fresh-only native producer. No caller review/capability flags.
import Foundation
import Security

struct NativeFreshStagedContext {
    let journal: NativeFreshBootstrapJournal
    let durableJournalSha256: String
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
    fileprivate init(journal: NativeFreshBootstrapJournal, sha256: String) {
        self.journal = journal; durableJournalSha256 = sha256
    }
#else
    private enum NativeOwner {
        case fresh(AuxFreshNativeSecureCapture)
        case resumed(AuxResumedFreshNativeHome)
    }
    private let coldGuard:AuxFreshColdInstallerGuard
    private let owner: NativeOwner
    private let taskLayout:AuxNativeTaskLayout
    fileprivate init(journal: NativeFreshBootstrapJournal, sha256: String, capture: AuxFreshNativeSecureCapture,coldGuard:AuxFreshColdInstallerGuard)throws {
        self.journal = journal; durableJournalSha256 = sha256; owner = .fresh(capture);self.coldGuard=coldGuard
        taskLayout=try coldGuard.reopenTaskLayout(journal:journal)
    }
    private init(journal: NativeFreshBootstrapJournal, sha256: String, resumed: AuxResumedFreshNativeHome,coldGuard:AuxFreshColdInstallerGuard)throws {
        self.journal = journal; durableJournalSha256 = sha256; owner = .resumed(resumed);self.coldGuard=coldGuard
        taskLayout=try coldGuard.reopenTaskLayout(journal:journal)
    }
    var canonicalHome: String {
        switch owner { case .fresh(let capture): return capture.home.canonicalHome
        case .resumed(let home): return home.canonicalHome }
    }
    var authenticatedPolicy: AuxAuthenticatedFreshBootstrapPolicy {
        switch owner { case .fresh(let capture): return capture.policy
        case .resumed(let home): return home.policy }
    }
    var targetProgressLease: AuxNativeFreshCohortLease {
        switch owner { case .fresh(let capture): return capture.home.targetProgressLease
        case .resumed(let home): return home.targetProgressLease }
    }
    func duplicateRetainedHomeDescriptor() throws -> Int32 {
        switch owner { case .fresh(let capture): return try capture.home.duplicateDirectoryForNativeBootstrap()
        case .resumed(let home): return try home.duplicateDirectoryForNativeBootstrap() }
    }
    func duplicateAuthenticatedBrowserRoot(role:UInt32)throws->(generation:UInt64,descriptor:Int32) {
        try revalidateNativeStageBinding()
        let root=try coldGuard.duplicateAuthenticatedBrowserRoot(role:role)
        do{try revalidateNativeStageBinding();return root}catch{Darwin.close(root.descriptor);throw error}
    }
    // Finite task-home capability for the future caller projection migration.
    // It does not expose any control root or accept an arbitrary account path.
    func duplicateAuthenticatedTaskHome()throws->(generation:UInt64,descriptor:Int32) {
        try revalidateNativeStageBinding()
        let browser=try coldGuard.duplicateAuthenticatedBrowserRoot(role:1)
        defer{Darwin.close(browser.descriptor)}
        let fd=try taskLayout.duplicateTaskHome()
        do{try revalidateNativeStageBinding();return(browser.generation,fd)}catch{Darwin.close(fd);throw error}
    }
    // The disk journal is only a locator/binding. Never return the private
    // provisional context before real protected-stage/authority authentication.
    static func resume(coldGuard:AuxFreshColdInstallerGuard) throws -> NativeFreshStagedContext {
        try coldGuard.revalidate()
        let policy=coldGuard.policy
        let retainedParent=try coldGuard.duplicateRetainedParentDescriptor();defer{Darwin.close(retainedParent)}
        let home = try AuxResumedFreshNativeHome.reopen(policy:policy,retainedParentDescriptor:retainedParent)
        let stored = try home.readExistingInitialJournal()
        let context = try NativeFreshStagedContext(journal: stored.journal, sha256: stored.sha256, resumed: home,coldGuard:coldGuard)
        _ = try AuxNativeFreshTargetBoundary(context: context)
        try context.revalidateNativeStageBinding()
        return context
    }
    func revalidateNativeStageBinding() throws {
        try coldGuard.revalidate()
        try taskLayout.revalidate()
        switch owner {
        case .fresh(let capture):
            try capture.policy.revalidateCurrentIdentity()
            try capture.home.validateRetainedIdentity()
            guard capture.scope == journal.scope, capture.transactionId == journal.reservationTransactionId,
                  capture.policy.policySha256 == journal.policySha256,
                  capture.policy.contents.accessGroup == journal.accessGroup,
                  capture.policy.contents.role.rawValue == journal.role,
                  try capture.home.currentReservationSha256() == journal.reservationSha256 else {
                throw NativeFreshBootstrapError.binding
            }
            let retainedRoot = try capture.home.duplicateDirectoryForNativeBootstrap()
            defer { Darwin.close(retainedRoot) }
            let store = try PrivateNativeFreshBootstrapJournalStore(
                canonicalDisposableRoot: capture.home.canonicalHome, journal: journal,
                retainedRootDescriptor: retainedRoot
            )
            guard let stored = try store.load(), stored.journal == journal,
                  stored.sha256 == durableJournalSha256 else { throw NativeFreshBootstrapError.binding }
        case .resumed(let home):
            let stored = try home.readExistingInitialJournal()
            guard stored.journal == journal, stored.sha256 == durableJournalSha256 else {
                throw NativeFreshBootstrapError.binding
            }
        }
    }
#endif
}
enum NativeFreshStageRead {case absent,bytes(Data),unavailable(Int32),invalid}
enum NativeFreshStageSubmitOutcome {
    case staged(NativeFreshStagedContext)
    case unresolved(String)
    // Only actual pre-Add read unavailability; same prepared draft may retry.
    case deferredBeforeAdd(Int32)
    case blocked(String)
}
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
// Captured effects exist only in this explicitly compiled fixture, never production.
enum NativeFreshStageFixtureEffects {
    static var read:((NativeFreshTargetSelector)->NativeFreshStageRead)!
    static var add:((NativeFreshTargetSelector,Data)->OSStatus)!
    static var revalidate:(()->Void)!
}
#endif
final class AuxNativeFreshStageCoordinator {
#if !AUX_NATIVE_FRESH_STAGE_FIXTURE
    private let coldGuard:AuxFreshColdInstallerGuard
    private let capture:AuxFreshNativeSecureCapture
#endif
    private let record:NativeFreshBootstrapJournal
    private let secretPayload:Data
    private let checkpoint:StoredNativeFreshBootstrapJournal
    private let store:PrivateNativeFreshBootstrapJournalStore
    private let lock=NSLock()
    private var attempted=false
    private var submitting=false
    private let process=getpid()
    private var terminalFailure:String?
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
    private init(record:NativeFreshBootstrapJournal,payload:Data,checkpoint:StoredNativeFreshBootstrapJournal,store:PrivateNativeFreshBootstrapJournalStore){self.record=record;secretPayload=payload;self.checkpoint=checkpoint;self.store=store}
    // No such initializer or captured-effect admission exists in production.
    static func capturedFixture(root:String,record:NativeFreshBootstrapJournal,payload:Data)throws->AuxNativeFreshStageCoordinator {
        guard nativeBootstrapHash(payload)==record.stagePayloadSha256 else{throw NativeFreshBootstrapError.binding}
        let store=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:root,journal:record)
        guard try store.load()==nil else{throw NativeFreshBootstrapError.existing}
        let checkpoint=try store.publish()
        return .init(record:record,payload:payload,checkpoint:checkpoint,store:store)
    }
#else
    private init(capture:AuxFreshNativeSecureCapture,coldGuard:AuxFreshColdInstallerGuard,record:NativeFreshBootstrapJournal,payload:Data,checkpoint:StoredNativeFreshBootstrapJournal,store:PrivateNativeFreshBootstrapJournalStore){self.coldGuard=coldGuard;self.capture=capture;self.record=record;secretPayload=payload;self.checkpoint=checkpoint;self.store=store}

    // Exact typed capture is privately produced by the actual signed-policy/home
    // SecItem probe. It owns the real home's one-shot attempt latch; no second
    // capture/alias can bypass that latch. No factory fallback after failure.
    static func prepare(capture:AuxFreshNativeSecureCapture,coldGuard:AuxFreshColdInstallerGuard)throws->AuxNativeFreshStageCoordinator {
        try coldGuard.revalidate()
        guard capture.policy.policySha256==coldGuard.policy.policySha256 else{throw NativeFreshBootstrapError.binding}
        let cohort=try AuxNativeFreshBootstrapFactory.prepare(capture:capture,coldGuard:coldGuard)
        try capture.policy.revalidateCurrentIdentity();try capture.home.validateRetainedIdentity()
        let reservationHash=try capture.home.currentReservationSha256()
        let bindings=capture.targetSelectors.map{NativeFreshTargetBinding(row:$0.row.rawValue,target:.init(service:$0.service,account:$0.account,accessGroup:$0.accessGroup))}
        let stage=capture.stageSelector
        let selector=NativeFreshTargetSelector(service:stage.service,account:stage.account,accessGroup:stage.accessGroup)
        let p=cohort.targetPayloads,payloads=["metadata":p.metadata,"signing":p.signing,"kem":p.kem,"wrappedRoot":p.wrappedRoot]
        guard cohort.sameRootVerified,cohort.signingContinuityVerified,!cohort.persistencePerformed,!cohort.commitAuthorized,
              payloads.mapValues(nativeBootstrapHash)==cohort.targetPayloadHashes else{throw NativeFreshBootstrapError.binding}
        let candidateHash=nativeBootstrapHash(try JSONSerialization.data(withJSONObject:["format":"aux.install.fresh.cohort.v1","targets":cohort.targetPayloadHashes,"public":cohort.publicDescriptor],options:[.sortedKeys,.withoutEscapingSlashes]))
        let stageObject:[String:Any]=["format":"aux.install.native-fresh.secure-stage.v2","reservationTransactionId":capture.transactionId,"reservationSha256":reservationHash,"policySha256":capture.policy.policySha256,"scope":capture.scope,"candidateSha256":candidateHash,"bindings":try JSONSerialization.jsonObject(with:JSONEncoder().encode(bindings)),"publicDescriptor":cohort.publicDescriptor,"targetHashes":cohort.targetPayloadHashes,"payloads":payloads.mapValues{$0.base64EncodedString()}]
        // Only the four exact representations/wrapped-root payloads enter the
        // fifth secure row. The plaintext DK itself is never serialized here.
        let secret=try JSONSerialization.data(withJSONObject:stageObject,options:[.sortedKeys,.withoutEscapingSlashes])
        guard !secret.isEmpty,secret.count<=16_384 else{throw NativeFreshBootstrapError.stage}
        let journal=NativeFreshBootstrapJournal(format:"aux.install.native-fresh.initial-journal.v2",reservationTransactionId:capture.transactionId,reservationSha256:reservationHash,policySha256:capture.policy.policySha256,scope:capture.scope,role:capture.policy.contents.role.rawValue,accessGroup:capture.policy.contents.accessGroup,targetBindings:bindings,stageSelector:selector,initialObservedAbsentRoles:["metadata","signing","kem","wrappedRoot","secureStage"],candidateSha256:candidateHash,publicDescriptor:cohort.publicDescriptor,targetHashes:cohort.targetPayloadHashes,stagePayloadSha256:nativeBootstrapHash(secret))
        try journal.validate()
        // This immutable v2 record combines initial draft + exact stage binding
        // in one durable nonsecret value, before the first stage Add is possible.
        let retainedRoot=try capture.home.duplicateDirectoryForNativeBootstrap();defer{Darwin.close(retainedRoot)}
        let store=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:capture.home.canonicalHome,journal:journal,retainedRootDescriptor:retainedRoot)
        guard try store.load()==nil else{throw NativeFreshBootstrapError.existing}
        let checkpoint=try store.publish()
        return .init(capture:capture,coldGuard:coldGuard,record:journal,payload:secret,checkpoint:checkpoint,store:store)
    }
#endif
    private func revalidate()throws {
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
        NativeFreshStageFixtureEffects.revalidate()
        guard let current=try store.load(),current.journal==record,current.sha256==checkpoint.sha256,
              nativeBootstrapHash(secretPayload)==record.stagePayloadSha256 else{throw NativeFreshBootstrapError.binding}
#else
        try coldGuard.revalidate()
        try capture.policy.revalidateCurrentIdentity();try capture.home.validateRetainedIdentity()
        guard try capture.home.currentReservationSha256()==record.reservationSha256,
              capture.scope==record.scope,capture.transactionId==record.reservationTransactionId,
              capture.policy.policySha256==record.policySha256,
              let current=try store.load(),current.journal==record,current.sha256==checkpoint.sha256,
              nativeBootstrapHash(secretPayload)==record.stagePayloadSha256 else{throw NativeFreshBootstrapError.binding}
#endif
    }
    private func read(_ selector:NativeFreshTargetSelector)->NativeFreshStageRead {
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
        return NativeFreshStageFixtureEffects.read(selector)
#else
        var result:CFTypeRef?
        let query:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:selector.service,kSecAttrAccount as String:selector.account,kSecAttrAccessGroup as String:selector.accessGroup,kSecUseDataProtectionKeychain as String:true,kSecUseAuthenticationUI as String:kSecUseAuthenticationUIFail,kSecReturnData as String:true,kSecMatchLimit as String:kSecMatchLimitOne]
        let status=SecItemCopyMatching(query as CFDictionary,&result)
        if status==errSecItemNotFound{return result==nil ? .absent:.invalid}
        guard status==errSecSuccess else{return .unavailable(status)}
        guard let result,CFGetTypeID(result)==CFDataGetTypeID()else{return .invalid}
        let bytes=result as! CFData,count=CFDataGetLength(bytes)
        guard count>0,count<=16_384,let base=CFDataGetBytePtr(bytes)else{return .invalid}
        return .bytes(Data(bytes:base,count:count))
#endif
    }
    private func addStage()->OSStatus {
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
        return NativeFreshStageFixtureEffects.add(record.stageSelector,secretPayload)
#else
        let selector=record.stageSelector
        let query:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:selector.service,kSecAttrAccount as String:selector.account,kSecAttrAccessGroup as String:selector.accessGroup,kSecUseDataProtectionKeychain as String:true,kSecUseAuthenticationUI as String:kSecUseAuthenticationUIFail,kSecAttrAccessible as String:kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,kSecValueData as String:secretPayload]
        return SecItemAdd(query as CFDictionary,nil)
#endif
    }
    private func block(_ reason:String)->NativeFreshStageSubmitOutcome {
        lock.lock();terminalFailure=reason;lock.unlock();return .blocked(reason)
    }
    // One process-local Add attempt only; error/unknown outcomes retain all state.
    // Loaded journals have no API that recreates this coordinator or replays Add.
    func submitStageOnce()throws->NativeFreshStageSubmitOutcome {
        guard getpid()==process else{throw NativeFreshBootstrapError.consumed}
        lock.lock()
        if let failure=terminalFailure{lock.unlock();return .blocked(failure)}
        guard !attempted,!submitting else{lock.unlock();throw NativeFreshBootstrapError.consumed}
        submitting=true;lock.unlock()
        defer{if getpid()==process{lock.lock();submitting=false;lock.unlock()}}
#if !AUX_NATIVE_FRESH_STAGE_FIXTURE
        guard let operation=capture.home.targetProgressLease.tryAcquire() else{throw NativeFreshBootstrapError.consumed}
        defer{operation.finish()}
#endif
        try revalidate()
        var unavailable:Int32?
        var conflict:String?
        // All five read observations precede any intent/Add consumption. A
        // definite conflict wins over a concurrent unavailable observation.
        for binding in record.targetBindings {
            switch read(binding.target) {
            case .absent:break
            case .unavailable(let status):if unavailable==nil{unavailable=status}
            case .bytes,.invalid:conflict="target-no-longer-absent"
            }
        }
        switch read(record.stageSelector) {
        case .absent:break
        case .unavailable(let status):if unavailable==nil{unavailable=status}
        case .bytes,.invalid:conflict="stage-no-longer-absent"
        }
        if let conflict{return block(conflict)}
        if let unavailable{return .deferredBeforeAdd(unavailable)}
        // Revalidate after callback-capable reads, immediately before consuming
        // the sole in-memory Add attempt. No regeneration or post-intent retry.
        try revalidate()
        guard getpid()==process else{throw NativeFreshBootstrapError.consumed}
        lock.lock();attempted=true;lock.unlock()
        let status=addStage()
        guard status==errSecSuccess else{return .unresolved("stage-add-non-success-observe-without-replay")}
        return try observeStageAfterAttempt()
    }
    // Matching observation after a lost/uncertain in-process Add needs no replay.
    // This is not a new-process home-adoption or full installation recovery API.
    func observeStageWithoutReplay()throws->NativeFreshStageSubmitOutcome {
        guard getpid()==process else{throw NativeFreshBootstrapError.consumed}
        lock.lock();guard !submitting else{lock.unlock();throw NativeFreshBootstrapError.consumed};submitting=true;lock.unlock()
        defer{if getpid()==process{lock.lock();submitting=false;lock.unlock()}}
#if !AUX_NATIVE_FRESH_STAGE_FIXTURE
        guard let operation=capture.home.targetProgressLease.tryAcquire() else{throw NativeFreshBootstrapError.consumed}
        defer{operation.finish()}
#endif
        return try observeStageAfterAttempt()
    }
    private func observeStageAfterAttempt()throws->NativeFreshStageSubmitOutcome {
        guard getpid()==process else{throw NativeFreshBootstrapError.consumed}
        lock.lock();let wasAttempted=attempted,failure=terminalFailure;lock.unlock();guard wasAttempted else{throw NativeFreshBootstrapError.consumed}
        if let failure{return .blocked(failure)}
        try revalidate()
        switch read(record.stageSelector) {
        case .absent:return .unresolved("stage-absent-no-replay")
        case .unavailable:return .unresolved("stage-unavailable-no-replay")
        case .invalid:return block("stage-invalid")
        case .bytes(let bytes):
            guard nativeBootstrapHash(bytes)==record.stagePayloadSha256 else{return block("stage-mismatch")}
            try revalidate()
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
            return .staged(.init(journal:record,sha256:checkpoint.sha256))
#else
            return .staged(try .init(journal:record,sha256:checkpoint.sha256,capture:capture,coldGuard:coldGuard))
#endif
        }
    }
}

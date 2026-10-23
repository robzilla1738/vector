// Inactive concrete fresh-only native producer. No caller review/capability flags.
import Foundation
import Security
import Darwin

struct NativeFreshStagedContext {
    let journal:NativeFreshBootstrapJournal
    let durableJournalSha256:String
    private let sensitiveStagePayload:Data
    fileprivate init(journal:NativeFreshBootstrapJournal,sha256:String,payload:Data){self.journal=journal;durableJournalSha256=sha256;sensitiveStagePayload=payload}
}
enum NativeFreshStageRead {case absent,bytes(Data),unavailable(Int32),invalid}
enum NativeFreshStageSubmitOutcome {
    case staged(NativeFreshStagedContext)
    case unresolved(String)
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
    private let capture:AuxFreshNativeSecureCapture
#endif
    private let record:NativeFreshBootstrapJournal
    private let secretPayload:Data
    private let checkpoint:StoredNativeFreshBootstrapJournal
    private let store:PrivateNativeFreshBootstrapJournalStore
    private let lock=NSLock()
    private var attempted=false
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
    private init(capture:AuxFreshNativeSecureCapture,record:NativeFreshBootstrapJournal,payload:Data,checkpoint:StoredNativeFreshBootstrapJournal,store:PrivateNativeFreshBootstrapJournalStore){self.capture=capture;self.record=record;secretPayload=payload;self.checkpoint=checkpoint;self.store=store}

    // Exact typed capture is privately produced by the actual signed-policy/home
    // SecItem probe. It owns the real home's one-shot attempt latch; no second
    // capture/alias can bypass that latch. No factory fallback after failure.
    static func prepare(capture:AuxFreshNativeSecureCapture)throws->AuxNativeFreshStageCoordinator {
        let cohort=try AuxNativeFreshBootstrapFactory.prepare(capture:capture)
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
        let retainedRoot=try capture.home.duplicateDirectoryForNativeBootstrap()
        defer{Darwin.close(retainedRoot)}
        let store=try PrivateNativeFreshBootstrapJournalStore(
            canonicalDisposableRoot:capture.home.canonicalHome,journal:journal,
            retainedRootDescriptor:retainedRoot)
        guard try store.load()==nil else{throw NativeFreshBootstrapError.existing}
        let checkpoint=try store.publish()
        return .init(capture:capture,record:journal,payload:secret,checkpoint:checkpoint,store:store)
    }
#endif
    private func revalidate()throws {
#if AUX_NATIVE_FRESH_STAGE_FIXTURE
        NativeFreshStageFixtureEffects.revalidate()
        guard let current=try store.load(),current.journal==record,current.sha256==checkpoint.sha256,
              nativeBootstrapHash(secretPayload)==record.stagePayloadSha256 else{throw NativeFreshBootstrapError.binding}
#else
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
        lock.lock();guard !attempted else{lock.unlock();throw NativeFreshBootstrapError.consumed};attempted=true;lock.unlock()
        try revalidate()
        for binding in record.targetBindings {guard case .absent=read(binding.target)else{return block("target-no-longer-absent")}}
        guard case .absent=read(record.stageSelector)else{return block("stage-no-longer-absent")}
        // Absence queries can run authentication/UI/system callbacks. Revalidate
        // actual policy/home/journal after all five reads, immediately before Add.
        try revalidate()
        let status=addStage()
        guard status==errSecSuccess else{return .unresolved("stage-add-non-success-observe-without-replay")}
        return try observeStageWithoutReplay()
    }
    // Matching observation after a lost/uncertain in-process Add needs no replay.
    // This is not a new-process home-adoption or full installation recovery API.
    func observeStageWithoutReplay()throws->NativeFreshStageSubmitOutcome {
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
            return .staged(.init(journal:record,sha256:checkpoint.sha256,payload:bytes))
        }
    }
}

// FIXTURE ONLY trusted producer: no current installation, migration or storage read.
import Foundation
import CryptoKit
import Security
// Native finite fixture policy, never parsed from JS or process environment.
private let fixtureLogicalKeys:Set<String>=["fixture.credential","fixture.blocked","fixture.write-failure","fixture.add-race","fixture.invalid","fixture.clear-failure"]
private let secureCountLock=NSLock()
private var secureCalls:UInt64=0
private func counted(){secureCountLock.lock();secureCalls += 1;secureCountLock.unlock()}
@_cdecl("AuxFixtureSecureCallCount")
func auxFixtureSecureCallCount()->UInt64{secureCountLock.lock();defer{secureCountLock.unlock()};return secureCalls}
private final class CapturedCredentialBoundary:AuxSecureStoreBoundary {
    private let review:ReviewedAuxSecureStoreScope
    private var values=[AuxSecureStoreSelector:Data]()
    init(review:ReviewedAuxSecureStoreScope){self.review=review
        values[try! review.selector("fixture.write-failure")]=Data("retained-synthetic".utf8)
        values[try! review.selector("fixture.clear-failure")]=Data("retained-clear".utf8)
    }
    private func isKey(_ selector:AuxSecureStoreSelector,_ key:String)->Bool{selector == (try! review.selector(key))}
    func read(_ selector:AuxSecureStoreSelector)->CapturedAuxSecureRead {counted()
        if isKey(selector,"fixture.blocked"){return .failure(errSecInteractionNotAllowed)}
        if isKey(selector,"fixture.invalid"){return .invalid}
        return values[selector].map{.bytes($0)} ?? .missing
    }
    func update(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {counted()
        if isKey(selector,"fixture.write-failure"){return errSecInteractionNotAllowed}
        if values[selector]==nil{return errSecItemNotFound}
        values[selector]=data;return errSecSuccess
    }
    func add(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {counted()
        if isKey(selector,"fixture.add-race") || values[selector] != nil{return errSecDuplicateItem}
        values[selector]=data;return errSecSuccess
    }
    func clear(_ selector:AuxSecureStoreSelector)->OSStatus {counted()
        if isKey(selector,"fixture.clear-failure"){return errSecInteractionNotAllowed}
        return values.removeValue(forKey:selector)==nil ? errSecItemNotFound:errSecSuccess
    }
}


private func minimalOwner()throws->AuxOwnedCommandDispatcher {
    var raw=Data(repeating:0,count:32);raw[31]=15
    let signing=try P256.Signing.PrivateKey(rawRepresentation:raw)
    raw[31]=16;let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:raw)
    let root=Data(repeating:15,count:32)
    let wrap=try AuxNativeEnvelopeV2.wrap(root:root,existingPublicKey:kem.publicKey.x963Representation)
    let metadata=Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8)
    let rows=["metadata":metadata,"signing":signing.rawRepresentation,"kem":kem.rawRepresentation,"wrappedRoot":try wrap.auxJson()]
    let hashes=rows.mapValues{SHA256.hash(data:$0).map{String(format:"%02x",$0)}.joined()}
    let selection=try AuxRuntimeSelection(scope:String(repeating:"f",count:64),generationId:UUID().uuidString,accessGroup:"TEST.aux.synthetic",scheme:"p256_v1",signingPublicKey:signing.publicKey.x963Representation,kemPublicKey:kem.publicKey.x963Representation,targetHashes:hashes)
    let captured=AuxRuntimeTargetRows(metadata:.bytes(metadata),signing:.bytes(signing.rawRepresentation),kem:.bytes(kem.rawRepresentation),wrappedRoot:.bytes(try wrap.auxJson()))
    let context=try AuxRuntimeCapturedCommandContext.validate(selection:selection,rows:captured)
    let corrupt=AuxRuntimeTargetRows(metadata:.bytes(metadata),signing:.bytes(Data([1])),kem:.bytes(kem.rawRepresentation),wrappedRoot:.bytes(try wrap.auxJson()))
    var refused=false
    do{_ = try AuxRuntimeCapturedCommandContext.validate(selection:selection,rows:corrupt)}catch{refused=true}
    precondition(refused)
    // Direct runtime owner has no credential capability; use the same genuine core.
    let direct=try AuxOwnedCommandDispatcher(runtimeCaptured:context)
    let directStatus=try AuxCommandDispatcherRegistry.shared.withContext(direct.handle){$0.run(command:"install-status")}
    let statusObject=try strictEnvelopeObject(Data(directStatus.utf8))
    precondition(statusObject["installed"] as? Bool==true)
    try direct.retire()
    let policy=try ImmutableAuxLogicalKeyPolicy(allowedLogicalKeys:fixtureLogicalKeys)
    let secureReview=try ReviewedAuxSecureStoreScope(scope:selection.scope,accessGroup:selection.accessGroup,allowedLogicalKeys:fixtureLogicalKeys)
    let paired=try ScopedAuxCommandContext.runtime(terminal:context,policy:policy,boundary:CapturedCredentialBoundary(review:secureReview))
    precondition(paired.evidence.scope==selection.scope && paired.evidence.runtimeGenerationId==selection.generationId && paired.evidence.runtimeSelectionSha256?.count==64)
    precondition(paired.evidence.journalSha256==nil && paired.evidence.transactionId==nil && paired.evidence.securityReviewSha256==nil && !paired.evidence.runtimeAdmissionVerified)
    return try AuxOwnedCommandDispatcher(scopedTerminal:paired)
}
private final class FixtureCounts {
    let lock=NSLock();var created:UInt64=0;var released:UInt64=0
}
private let fixtureCounts=FixtureCounts()
@_cdecl("AuxFixtureCreateOwner")
func auxFixtureCreateOwner(_ handle:UnsafeMutablePointer<UInt64>?)->UnsafeMutableRawPointer? {
    guard let handle else{return nil}
    do {
        let owner=try minimalOwner()
        handle.pointee=owner.handle
        fixtureCounts.lock.lock();fixtureCounts.created += 1;fixtureCounts.lock.unlock()
        return Unmanaged.passRetained(owner).toOpaque()
    }catch{return nil}
}
@_cdecl("AuxFixtureReleaseOwner")
func auxFixtureReleaseOwner(_ pointer:UnsafeMutableRawPointer?) {
    guard let pointer else{return}
    Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(pointer).release()
    fixtureCounts.lock.lock();fixtureCounts.released += 1;fixtureCounts.lock.unlock()
}
@_cdecl("AuxFixtureCreatedCount")
func auxFixtureCreatedCount()->UInt64 {
    fixtureCounts.lock.lock();defer{fixtureCounts.lock.unlock()};return fixtureCounts.created
}
@_cdecl("AuxFixtureReleasedCount")
func auxFixtureReleasedCount()->UInt64 {
    fixtureCounts.lock.lock();defer{fixtureCounts.lock.unlock()};return fixtureCounts.released
}

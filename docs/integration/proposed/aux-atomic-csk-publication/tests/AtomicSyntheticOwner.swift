// TEST ONLY native producer. No current installation or Security invocation.
import Foundation
import CryptoKit
import Security
import Darwin
private final class CapturedCskBoundary:AuxSecureStoreBoundary {
    private let path=atomicFixtureHome+"/captured-csk-envelope.json"
    func read(_ selector:AuxSecureStoreSelector)->CapturedAuxSecureRead {
        guard FileManager.default.fileExists(atPath:path)else{return .missing}
        return (try? Data(contentsOf:URL(fileURLWithPath:path))).map{.bytes($0)} ?? .invalid
    }
    func update(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {return errSecInteractionNotAllowed}
    func clear(_ selector:AuxSecureStoreSelector)->OSStatus{return errSecInteractionNotAllowed}
    func add(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {
        let fd=open(path,O_WRONLY|O_CREAT|O_EXCL|O_CLOEXEC|O_NOFOLLOW,0o600)
        if fd<0{return errno==EEXIST ? errSecDuplicateItem:errSecIO};defer{close(fd)}
        return data.withUnsafeBytes{Darwin.write(fd,$0.baseAddress,$0.count)}==data.count ? errSecSuccess:errSecIO
    }
}
@_cdecl("AuxFixtureCreateOwner")
func atomicFixtureCreateOwner(_ handle:UnsafeMutablePointer<UInt64>?)->UnsafeMutableRawPointer? {
    guard let handle else{return nil}
    do {
        var raw=Data(repeating:0,count:32);raw[31]=15
        let signing=try P256.Signing.PrivateKey(rawRepresentation:raw)
        raw[31]=16;let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:raw)
        let wrap=try AuxNativeEnvelopeV2.wrap(root:Data(repeating:15,count:32),existingPublicKey:kem.publicKey.x963Representation)
        let metadata=Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8)
        let rows=["metadata":metadata,"signing":signing.rawRepresentation,"kem":kem.rawRepresentation,"wrappedRoot":try wrap.auxJson()]
        let hashes=rows.mapValues{SHA256.hash(data:$0).map{String(format:"%02x",$0)}.joined()}
        let scope=SHA256.hash(data:Data(atomicFixtureHome.utf8)).map{String(format:"%02x",$0)}.joined()
        let selection=try AuxRuntimeSelection(scope:scope,generationId:UUID().uuidString,accessGroup:"TEST.aux.synthetic",scheme:"p256_v1",signingPublicKey:signing.publicKey.x963Representation,kemPublicKey:kem.publicKey.x963Representation,targetHashes:hashes)
        let context=try AuxRuntimeCapturedCommandContext.validate(selection:selection,rows:.init(metadata:.bytes(metadata),signing:.bytes(signing.rawRepresentation),kem:.bytes(kem.rawRepresentation),wrappedRoot:.bytes(try wrap.auxJson())))
        let scoped=try ScopedAuxCommandContext.runtime(terminal:context,policy:.sourceKnownV2(),boundary:CapturedCskBoundary(),atomicAccountHome:atomicFixtureHome)
        let owner=try AuxOwnedCommandDispatcher(scopedTerminal:scoped);handle.pointee=owner.handle
        return Unmanaged.passRetained(owner).toOpaque()
    }catch{return nil}
}
@_cdecl("AuxFixtureReleaseOwner")
func atomicFixtureReleaseOwner(_ pointer:UnsafeMutableRawPointer?) {if let pointer{Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(pointer).release()}}

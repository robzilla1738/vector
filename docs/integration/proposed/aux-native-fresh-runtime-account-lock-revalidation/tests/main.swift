import Foundation
import CryptoKit
import Security
import Darwin

var checks=0
func check(_ b:Bool){precondition(b);checks += 1}
func refuses(_ body:()throws->Void){do{try body();preconditionFailure()}catch{checks += 1}}
func hash(_ d:Data)->String{SHA256.hash(data:d).map{String(format:"%02x",$0)}.joined()}
let signer=try P256.Signing.PrivateKey(rawRepresentation:Data(repeating:1,count:32))
let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:Data(repeating:2,count:32))
let root=Data(repeating:0x35,count:32)
let wrapped=try AuxNativeEnvelopeV2.wrap(root:root,existingPublicKey:kem.publicKey.x963Representation).auxJson()
let payloads=["metadata":Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8),"signing":signer.rawRepresentation,"kem":kem.rawRepresentation,"wrappedRoot":wrapped]
let temp=FileManager.default.temporaryDirectory.appendingPathComponent("aux-runtime-retained-fd-"+UUID().uuidString)
try FileManager.default.createDirectory(at:temp,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
guard let ptr=realpath(temp.path,nil)else{fatalError()};let home=String(cString:ptr);free(ptr)
defer{try? FileManager.default.removeItem(atPath:home);try? FileManager.default.removeItem(atPath:home+"-moved")}
let fd=open(home,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
check(fd>=0)
let selected=try AuxRuntimeSelection(scope:hash(Data(home.utf8)),generationId:UUID().uuidString,accessGroup:"TEST.aux.fixture",scheme:"p256_v1",signingPublicKey:signer.publicKey.x963Representation,kemPublicKey:kem.publicKey.x963Representation,targetHashes:payloads.mapValues(hash))
let context=try AuxRuntimeCapturedCommandContext.validate(selection:selected,rows:.init(metadata:.bytes(payloads["metadata"]!),signing:.bytes(payloads["signing"]!),kem:.bytes(payloads["kem"]!),wrappedRoot:.bytes(payloads["wrappedRoot"]!)))
struct NoEffects:AuxSecureStoreBoundary{
 func read(_ s:AuxSecureStoreSelector)->CapturedAuxSecureRead{fatalError("unexpected read")}
 func update(_ s:AuxSecureStoreSelector,data:Data)->OSStatus{fatalError("unexpected update")}
 func add(_ s:AuxSecureStoreSelector,data:Data)->OSStatus{fatalError("unexpected add")}
 func clear(_ s:AuxSecureStoreSelector)->OSStatus{fatalError("unexpected clear")}
}
let review=try ReviewedAuxSecureStoreScope(scope:selected.scope,accessGroup:selected.accessGroup,allowedLogicalKeys:["aux.csk_1"])
let coordinator=try AuxAccountsCskCoordinator(home:home,review:review,installation:context.core,boundary:NoEffects(),retainedHomeDescriptor:fd)
close(fd)
try coordinator.withAccountRegistryLock{check(true)} // owns duplicate after caller closes
refuses{_ = try AuxAccountsCskCoordinator(home:home,review:review,installation:context.core,boundary:NoEffects(),retainedHomeDescriptor:-1)}

// Actual contention is observed only after a real failed nonblocking flock.
enum AuxRetainedAccountFDTestHooks {static var observedContention:(()->Void)?}
let entered=DispatchSemaphore(value:0),done=DispatchSemaphore(value:0)
let resultLock=NSLock();var refused=false
let heldDirectory=open(home,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
let heldLock=openat(heldDirectory,".aux-accounts-csk.lock",O_RDWR|O_NOFOLLOW|O_CLOEXEC)
check(heldLock>=0 && flock(heldLock,LOCK_EX|LOCK_NB)==0)
AuxRetainedAccountFDTestHooks.observedContention={entered.signal()}
DispatchQueue.global().async {
    var outcome=false
    do{try coordinator.withAccountRegistryLock{}}catch{outcome=true}
    resultLock.lock();refused=outcome;resultLock.unlock();done.signal()
}
check(entered.wait(timeout:.now()+5) == .success)
try FileManager.default.moveItem(atPath:home,toPath:home+"-moved")
try FileManager.default.createDirectory(atPath:home,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
_ = flock(heldLock,LOCK_UN);close(heldLock);close(heldDirectory)
check(done.wait(timeout:.now()+5) == .success)
resultLock.lock();let observedRefusal=refused;resultLock.unlock();check(observedRefusal)
print("PASS:\(checks) retained account-home FD checks including actual lock contention/path replacement; zero Security/effect calls")

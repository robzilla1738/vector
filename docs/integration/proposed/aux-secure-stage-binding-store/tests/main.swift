import Foundation
import Darwin
let scope=String(repeating:"e",count:64)
let fresh=try AuxFreshInstallationFactory.prepare(admission:.init(scope:scope,metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent,newScopeExplicitlyReviewed:true),secureEnclaveAvailable:false,macOS26Available:false)
let cohort=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(fresh)
let captures=CallerCapturedFreshTargets(metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent)
let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".install.v2",account:"aux."+scope+"."+$0,accessGroup:"TEST.aux.synthetic"))}
let review=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:captures)
let journal=try FreshInstallationTransaction.prepare(candidate:cohort,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:captures)
let selector=ReviewedFreshSecureStageSelector(service:"aux."+scope+".install.secure-stage.v1",account:"aux."+scope+".fresh."+journal.transactionId.lowercased(),accessGroup:"TEST.aux.synthetic")
let intent=try FreshSecureStage.prepareAdd(cohort:cohort,journal:journal,checkpoint:journal.checkpoint(),selector:selector,capturedStage:.absent)
let raw=FileManager.default.temporaryDirectory.appendingPathComponent("aux-stage-binding-"+UUID().uuidString).path
try FileManager.default.createDirectory(atPath:raw,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? FileManager.default.removeItem(atPath:raw)}
let path=realpath(raw,nil)!,root=String(cString:path);free(path)
let store=try PrivateFreshSecureStageBindingStore(canonicalDisposableRoot:root,journal:journal,selector:selector)
let initial=try store.load()
precondition(initial==nil)
let stored=try store.publish(intent.binding)
let loaded=try PrivateFreshSecureStageBindingStore(canonicalDisposableRoot:root,journal:journal,selector:selector).load()!
precondition(loaded.sha256==stored.sha256)
let idempotent=try store.publish(intent.binding)
precondition(idempotent.sha256==stored.sha256)
let add=try intent.addRequest(checkpoint:loaded.acknowledgement)
_ = try FreshSecureStage.restore(journal:journal,checkpoint:journal.checkpoint(),selector:selector,binding:loaded.binding,stageCheckpoint:loaded.acknowledgement,captured:.bytes(add.secretPayload))
let bindingPath=root+"/.aux-secure-stage-binding-"+journal.transactionId.lowercased()+"/binding.json"
let disk=try Data(contentsOf:URL(fileURLWithPath:bindingPath))
let object=try strictEnvelopeObject(disk)
precondition(object["payloads"]==nil && !String(decoding:disk,as:UTF8.self).contains(fresh.root.base64EncodedString()))
let changed=FreshSecureStageBinding(format:intent.binding.format,transactionId:intent.binding.transactionId,scope:intent.binding.scope,candidateSha256:intent.binding.candidateSha256,initialDraftSha256:intent.binding.initialDraftSha256,secretPayloadSha256:String(repeating:"0",count:64),service:selector.service,account:selector.account,accessGroup:selector.accessGroup)
do { _ = try store.publish(changed);fatalError("replacement accepted") } catch SecureStageBindingStoreError.mismatch {}
// Partial or FIFO file is retained and refused; no destructive repair.
let partialJournal=try FreshInstallationTransaction.prepare(candidate:cohort,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:captures)
let partialSelector=ReviewedFreshSecureStageSelector(service:selector.service,account:"aux."+scope+".fresh."+partialJournal.transactionId.lowercased(),accessGroup:selector.accessGroup)
let partialStore=try PrivateFreshSecureStageBindingStore(canonicalDisposableRoot:root,journal:partialJournal,selector:partialSelector)
let directory=root+"/.aux-secure-stage-binding-"+partialJournal.transactionId.lowercased()
let fd=open(directory+"/binding.json",O_WRONLY|O_CREAT|O_EXCL,0o600);precondition(fd>=0);precondition(write(fd,"{",1)==1);close(fd)
do { _ = try partialStore.load();fatalError("partial binding accepted") } catch {}
precondition(FileManager.default.fileExists(atPath:directory+"/binding.json"))
precondition(unlink(directory+"/binding.json")==0 && mkfifo(directory+"/binding.json",0o600)==0)
do { _ = try partialStore.load();fatalError("FIFO binding accepted") } catch SecureStageBindingStoreError.unsafeMetadata {}
print("private nonsecret stage-binding durable create/reopen/restore/mismatch/partial/FIFO checks passed")

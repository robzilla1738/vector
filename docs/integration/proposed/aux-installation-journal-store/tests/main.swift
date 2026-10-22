// Actual filesystem cases only under the explicit private disposable fixture root.
let fixture=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))) as! [String:String]
func bytes(_ key:String)->Data{Data(base64Encoded:fixture[key]!)!}
let originals=CapturedInstallationRows(metadata:.data(bytes("metadata")),signing:.data(bytes("signing")),kem:.data(bytes("kem")),wrappedRoot:.data(bytes("wrapped")))
guard case .complete(let snapshot)=inspectCapturedInstallation(originals)else{preconditionFailure()}
let candidate=try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:bytes("signingPublic"),kem:bytes("kemPublic")),verificationChallenge:bytes("syntheticChallenge"))
let missing=CapturedInstallationRows(metadata:.missing,signing:.missing,kem:.missing,wrappedRoot:.missing)
let roles=["metadata","signing","kem","wrappedRoot"],bindings=roles.map{InstallationRowBinding(row:$0,original:.init(service:"aux.synthetic.original.install",account:"aux.synthetic.original."+$0,accessGroup:"TEST.synthetic.aux"),target:.init(service:"aux.synthetic.target.install",account:"aux.synthetic.target."+$0,accessGroup:"TEST.synthetic.aux"))}
let id="D1CCAAE0-661B-45C5-AE07-10D6F518233C",root=CommandLine.arguments[2],directory=".aux-installation-journal-"+id.lowercased()
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func fails(_ body:()throws->Void){do{try body();preconditionFailure()}catch{checks += 1}}
func privateRoot(_ name:String)throws->String {let value=root+"/"+name;guard mkdir(value,0o700)==0 else{throw InstallationJournalStoreError.io(errno)};return value}
let primary=try privateRoot("primary"),store=try PrivateInstallationJournalStore(canonicalDisposableRoot:primary,transactionId:id)
check(try store.loadCurrent()==nil)
let draft=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:id,bindings:bindings,originals:originals,targets:missing)
let first=try store.commit(draft,expectedHead:nil)
let draftHash=try draft.checkpoint().journalSha256;check(first.sha256==draftHash)
let intent=try AdditiveInstallationTransaction.intendNext(draft,checkpoint:first.acknowledgement,originals:originals,targets:missing)
let staged=try store.stage(intent,expectedHead:first.sha256)
// Actual publication interruption: checkpoint is fsynced but HEAD was never changed.
check(try store.loadCurrent()!.sha256==first.sha256)
let reopened=try PrivateInstallationJournalStore(canonicalDisposableRoot:primary,transactionId:id)
check(try reopened.loadCurrent()!.journal.phase == .draft)
let durableIntent=try reopened.publish(staged,expectedHead:first.sha256)
let intentHash=try intent.checkpoint().journalSha256;check(durableIntent.journal.phase == .intent && durableIntent.sha256==intentHash)
check(try AdditiveInstallationJournal.decode(Data(contentsOf:URL(fileURLWithPath:primary+"/"+directory+"/"+staged.file))).phase == .intent)
fails{_ = try store.publish(staged,expectedHead:first.sha256)}
// A second caller publishes a different valid successor between stage and publish.
let awaiting=try AdditiveInstallationTransaction.capturedAddStatus(intent,checkpoint:durableIntent.acknowledgement,status:0)
let interrupted=try store.stage(awaiting,expectedHead:durableIntent.sha256)
let abandoned=try AdditiveInstallationTransaction.abandon(intent,checkpoint:durableIntent.acknowledgement)
let winning=try reopened.commit(abandoned,expectedHead:durableIntent.sha256)
fails{_ = try store.publish(interrupted,expectedHead:durableIntent.sha256)}
check(try store.loadCurrent()!.sha256==winning.sha256)
check(FileManager.default.fileExists(atPath:primary+"/"+directory+"/"+interrupted.file))
check(FileManager.default.fileExists(atPath:primary+"/"+directory+"/"+staged.file))
let lockPath=primary+"/"+directory+"/LOCK",lock=open(lockPath,O_RDWR|O_NOFOLLOW)
precondition(lock>=0 && flock(lock,LOCK_EX|LOCK_NB)==0)
fails{_ = try reopened.loadCurrent()}
_ = flock(lock,LOCK_UN);close(lock)
let alias=root+"/root-alias";precondition(symlink(primary,alias)==0)
fails{_ = try PrivateInstallationJournalStore(canonicalDisposableRoot:alias,transactionId:id)}
let unsafe=try privateRoot("unsafe-mode");precondition(chmod(unsafe,0o755)==0)
fails{_ = try PrivateInstallationJournalStore(canonicalDisposableRoot:unsafe,transactionId:id)}
let headPath=primary+"/"+directory+"/HEAD.json";precondition(chmod(headPath,0o644)==0)
fails{_ = try store.loadCurrent()};precondition(chmod(headPath,0o600)==0)
let symlinkRoot=try privateRoot("symlink-head"),symlinkStore=try PrivateInstallationJournalStore(canonicalDisposableRoot:symlinkRoot,transactionId:id)
let link=symlinkRoot+"/"+directory+"/HEAD.json";precondition(symlink("missing-target.json",link)==0)
fails{_ = try symlinkStore.loadCurrent()}
check((try? FileManager.default.destinationOfSymbolicLink(atPath:link))=="missing-target.json")
let headBytes=try Data(contentsOf:URL(fileURLWithPath:headPath));check(headBytes.count<=16_384)
let blockedRoot=try privateRoot("initial-blocked"),blockedStore=try PrivateInstallationJournalStore(canonicalDisposableRoot:blockedRoot,transactionId:id)
let denied=CapturedInstallationRows(metadata:.securityFailure(-34018),signing:.missing,kem:.missing,wrappedRoot:.missing)
let blocked=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:id,bindings:bindings,originals:originals,targets:denied)
let persistedBlocked=try blockedStore.commit(blocked,expectedHead:nil)
check(persistedBlocked.journal.phase == .blocked)
var counterfeit=blocked;counterfeit.revision += 1;counterfeit.phase = .draft;counterfeit.failure=nil
fails{_ = try blockedStore.commit(counterfeit,expectedHead:persistedBlocked.sha256)}
let fifoRoot=try privateRoot("fifo-head"),fifoStore=try PrivateInstallationJournalStore(canonicalDisposableRoot:fifoRoot,transactionId:id)
let fifoPath=fifoRoot+"/"+directory+"/HEAD.json";precondition(mkfifo(fifoPath,0o600)==0)
fails{_ = try fifoStore.loadCurrent()}
var fifoStat=stat();check(lstat(fifoPath,&fifoStat)==0 && fifoStat.st_mode & mode_t(S_IFMT)==mode_t(S_IFIFO))
print(String(data:try JSONSerialization.data(withJSONObject:["checks":checks,"filesystemOnly":true,"securityExecuted":false,"interruptedEvidenceRetained":true,"authorityExclusiveProof":false]),encoding:.utf8)!)

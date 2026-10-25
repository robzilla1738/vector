// Inactive in-process lifetime boundary. Not host authentication/admission.
import Foundation
import Darwin
import CryptoKit
@_silgen_name("AuxDevelopmentOwnerCleanSettlementStatus") private func nativeOwnerCleanSettlement(_ owner:UnsafeMutableRawPointer)->Int32

enum AuxDispatcherLifetimeError:Error { case invalidHandle,retiring,reentrantRetirement,reentrantCall,exhaustedHandles,invalidInput }

// Contains no globally selected scope. Entries are immutable distinct contexts;
// integer IDs are never pointers and never reused during this process lifetime.
final class AuxCommandDispatcherRegistry {
    static let shared=AuxCommandDispatcherRegistry()
    private enum Phase { case open,retiring,closed }
    private struct RetainedRead {
        let command:String
        let inputSha256:Data
        let response:String
    }
    // Pinned actual core routes: these return reads, public material/signatures
    // or imported root bytes. init aliases only return existing captured keys;
    // actual absent-state generation is refused by the unchanged core.
    private static let readOnlyCommands:Set<String>=["install-status","keys-status","get-public-keys","public-keys","install-init","init-keys","cdp-sign","dk-unwrap","secure-read","inbox-key-v2"]
    private static func requestDigest(_ input:String)->Data{Data(SHA256.hash(data:Data(input.utf8)))}
    private final class Entry {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        var nativeFreshRuntime:NativeFreshRuntimeCapturedContext? = nil
        var uiCaptureUpload:UiCaptureUpload? = nil
        var uiCaptureDownload:UiCaptureDownload? = nil
        var uiTransactionUpload:UiTransactionUpload? = nil
        var uiTransactionDownload:UiTransactionDownload? = nil
        var uiTransactionInventory:UiTransactionInventoryDownload? = nil
        var nativeGuardFailure:AuxNativeFreshGuardFailure? = nil
        var pendingPostGuardObservation:AuxNativeFreshGuardFailure? = nil
        // Exact completed read reply stays private process memory only. Never
        // persist/log the response (which may contain credential/root bytes).
        var retainedRead:RetainedRead? = nil
        var reconcilingRead=false
#endif
        let core:AuxInstallationCommandCore
#if AUX_MACOS_UTILITY_DISPATCH
        let macOSUtilities:AuxMacOSUtilityCommandCore?
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
        let secureStore:AuxSecureStoreCommandCore?
#endif
        let execution=NSLock() // Serialize operations on one imported authority.
        var phase=Phase.open
        var active=0
        // Exact Entry retains browser custody before any durable grant attempt.
        // No destructor, missing ACK, timeout or external handle can clear it.
        var browserGrantUnresolved=false
#if !AUX_MINIMAL_RUNTIME_DISPATCH
        init(_ context:CapturedTerminalCommandContext){
            core=context.core
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=nil
#endif
        }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
        init(_ context:AuxRuntimeCapturedCommandContext){
            core=context.core
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=nil
#endif
        }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
        init(_ context:RecoveredFreshTerminalCommandContext){
            core=context.core
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=nil
#endif
        }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
        init(_ context:ScopedAuxCommandContext){
            core=context.installation;secureStore=context.secureStore
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            nativeFreshRuntime=context.nativeFreshRuntime
#endif
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
        }
#endif
#if AUX_MACOS_UTILITY_DISPATCH
        // This wrapper only composes an already sealed context with a host-owned
        // immutable utility capability. It cannot create an installation authority.
        init(wrapping entry:Entry,utilities:AuxMacOSUtilityCommandCore){
            core=entry.core;macOSUtilities=utilities
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            nativeFreshRuntime=entry.nativeFreshRuntime
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=entry.secureStore
#endif
        }
#endif
    }
    private let process=getpid()
    private let condition=NSCondition()
    private var entries=[UInt64:Entry]()
    private var next:UInt64=1
    private let threadKey="aux.native.dispatcher.active-handles.v1"
    private init(){}
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:CapturedTerminalCommandContext)throws->UInt64 {
        try insert(Entry(context))
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:AuxRuntimeCapturedCommandContext)throws->UInt64 {try insert(Entry(context))}
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    fileprivate func install(_ context:RecoveredFreshTerminalCommandContext)throws->UInt64 {
        try insert(Entry(context))
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    fileprivate func install(_ context:ScopedAuxCommandContext)throws->UInt64 {try insert(Entry(context))}
#endif
#if AUX_MACOS_UTILITY_DISPATCH
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:CapturedTerminalCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:AuxRuntimeCapturedCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    fileprivate func install(_ context:RecoveredFreshTerminalCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    fileprivate func install(_ context:ScopedAuxCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#endif
    private func insert(_ entry:Entry)throws->UInt64 {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();defer{condition.unlock()}
        guard next<UInt64.max else{throw AuxDispatcherLifetimeError.exhaustedHandles}
        let handle=next;next += 1;entries[handle]=entry;return handle
    }
    // Trusted in-process operation seam. Scope is not an action argument.
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
    // This private store can only be entered through the retained Entry below.
    // It stores unqualified capture data; it cannot authorize a migration.
    private final class UiCaptureJournal {
        enum Failure:Error {case invalid,unsafe,incomplete,binding,io(Int32)}
        private let context:NativeFreshStagedContext
        private let generation:UInt64
        private let rootFD:Int32
        private let directoryFD:Int32
        private let directoryName:String
        private let transaction:String
        private let process=getpid()
        private static let prefix=".aux-ui-capture-v1-"
        private static let limit=64*1024*1024

        private static func metadata(_ fd:Int32,directory:Bool)throws->stat {
            var value=stat()
            guard fstat(fd,&value)==0 else{throw Failure.io(errno)}
            let flags=fcntl(fd,F_GETFD)
            guard value.st_uid==geteuid(),(value.st_mode & 0o7777)==(directory ? 0o700:0o600),
                  (value.st_mode & S_IFMT)==(directory ? S_IFDIR:S_IFREG),
                  directory || (value.st_nlink==1 && value.st_size>=0 && value.st_size<=limit),
                  flags>=0,flags & FD_CLOEXEC != 0 else{throw Failure.unsafe}
            errno=0
            let acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
            if acl==nil && errno==ENOENT{return value}
            guard let acl else{throw Failure.unsafe}
            defer{acl_free(UnsafeMutableRawPointer(acl))}
            var entry:acl_entry_t?
            errno=0
            guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry) == -1,
                  errno==EINVAL,entry==nil else{throw Failure.unsafe}
            return value
        }
        private static func sameEntry(parent:Int32,name:String,fd:Int32,directory:Bool)throws {
            var named=stat()
            guard fstatat(parent,name,&named,AT_SYMLINK_NOFOLLOW)==0 else{throw Failure.io(errno)}
            let retained=try metadata(fd,directory:directory)
            guard named.st_dev==retained.st_dev,named.st_ino==retained.st_ino,
                  named.st_mode==retained.st_mode,named.st_uid==retained.st_uid else{throw Failure.binding}
        }
        private static func sync(_ fd:Int32)throws {
            guard fsync(fd)==0 else{throw Failure.io(errno)}
        }
        private static func validateOwner(_ context:NativeFreshStagedContext,
                                          root:Int32,generation:UInt64)throws {
            try context.verifyUiCaptureJournalAdmission()
            try context.revalidateNativeStageBinding()
            let current=try context.duplicateAuthenticatedBrowserRoot(role:1)
            defer{Darwin.close(current.descriptor)}
            let before=try metadata(root,directory:true)
            let after=try metadata(current.descriptor,directory:true)
            guard generation != 0,current.generation==generation,
                  before.st_dev==after.st_dev,before.st_ino==after.st_ino else{throw Failure.binding}
        }
        private init(context:NativeFreshStagedContext,transaction:String,create:Bool)throws {
            guard UUID(uuidString:transaction)?.uuidString.lowercased()==transaction else{throw Failure.invalid}
            let root=try context.duplicateAuthenticatedBrowserRoot(role:1)
            var rootFD=root.descriptor,directoryFD:Int32 = -1
            defer{if rootFD>=0{Darwin.close(rootFD)};if directoryFD>=0{Darwin.close(directoryFD)}}
            try Self.validateOwner(context,root:rootFD,generation:root.generation)
            let name=Self.prefix+transaction
            if create {
                // EXCL-by-mkdir: a collision is never adopted or overwritten.
                guard mkdirat(rootFD,name,0o700)==0 else{throw Failure.io(errno)}
                try Self.sync(rootFD)
            }
            directoryFD=openat(rootFD,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard directoryFD>=0 else{throw Failure.io(errno)}
            try Self.sameEntry(parent:rootFD,name:name,fd:directoryFD,directory:true)
            try Self.validateOwner(context,root:rootFD,generation:root.generation)
            self.context=context;generation=root.generation;self.rootFD=rootFD;self.directoryFD=directoryFD
            directoryName=name;self.transaction=transaction
            rootFD = -1;directoryFD = -1
        }
        deinit {if getpid()==process{Darwin.close(directoryFD);Darwin.close(rootFD)}}
        private func revalidate()throws {
            guard getpid()==process else{throw Failure.binding}
            try Self.validateOwner(context,root:rootFD,generation:generation)
            try Self.sameEntry(parent:rootFD,name:directoryName,fd:directoryFD,directory:true)
        }
        private func writeNew(_ name:String,_ bytes:Data)throws {
            guard !bytes.isEmpty,bytes.count<=Self.limit else{throw Failure.invalid}
            try revalidate()
            let fd=openat(directoryFD,name,O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK,0o600)
            guard fd>=0 else{throw Failure.io(errno)}
            defer{Darwin.close(fd)}
            _ = try Self.metadata(fd,directory:false)
            var offset=0
            while offset<bytes.count {
                let amount=bytes.withUnsafeBytes{Darwin.write(fd,$0.baseAddress!.advanced(by:offset),bytes.count-offset)}
                if amount<0 && errno==EINTR{continue}
                guard amount>0 else{throw Failure.io(errno)}
                offset += amount
            }
            try Self.sync(fd)
            try Self.sameEntry(parent:directoryFD,name:name,fd:fd,directory:false)
            guard try Self.metadata(fd,directory:false).st_size==bytes.count else{throw Failure.incomplete}
            try Self.sync(directoryFD)
            try revalidate()
        }
        private func read(_ name:String,limit:Int=64*1024*1024)throws->Data {
            try revalidate()
            let fd=openat(directoryFD,name,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC)
            guard fd>=0 else{if errno==ENOENT{throw Failure.incomplete};throw Failure.io(errno)}
            defer{Darwin.close(fd)}
            let before=try Self.metadata(fd,directory:false)
            guard before.st_size<=limit else{throw Failure.invalid}
            try Self.sameEntry(parent:directoryFD,name:name,fd:fd,directory:false)
            var bytes=[UInt8](repeating:0,count:Int(before.st_size)),offset=0
            while offset<bytes.count {
                let remaining=bytes.count-offset
                let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),remaining)}
                if amount<0 && errno==EINTR{continue}
                guard amount>0 else{throw Failure.incomplete}
                offset += amount
            }
            var extra:UInt8=0
            guard Darwin.read(fd,&extra,1)==0 else{throw Failure.incomplete}
            let after=try Self.metadata(fd,directory:false)
            guard before.st_size==after.st_size,
                  before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,
                  before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
                  before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,
                  before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw Failure.binding}
            try Self.sameEntry(parent:directoryFD,name:name,fd:fd,directory:false)
            try revalidate()
            return Data(bytes)
        }
        private static func hash(_ data:Data)->String {
            SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined()
        }
        private static func encode(_ value:[String:Any])throws->Data {
            try JSONSerialization.data(withJSONObject:value,options:[.sortedKeys,.withoutEscapingSlashes])
        }
        private static func binding(context:NativeFreshStagedContext,transaction:String,
                                    generation:UInt64,root:stat,capture:Data)throws->Data {
            try encode(["format":"aux.ui-storage.capture-binding.v1",
                "phase":"captured-unqualified","activationAuthorized":false,
                "transactionId":transaction,"generation":String(generation),
                "policySha256":context.journal.policySha256,
                "initialJournalSha256":context.durableJournalSha256,
                "rootDevice":String(root.st_dev),"rootInode":String(root.st_ino),
                "captureSha256":hash(capture),"captureBytes":capture.count])
        }
        private static func receipt(transaction:String,binding:Data,capture:Data)throws->Data {
            try encode(["format":"aux.ui-storage.capture-receipt.v1",
                "phase":"captured-unqualified","activationAuthorized":false,
                "transactionId":transaction,"bindingSha256":hash(binding),
                "captureSha256":hash(capture)])
        }
        // Immutable transaction DATA, never a migration/profile grant. The
        // authenticated native controller joins these bytes to real live holds.
        struct TransactionDescriptor {
            let ordinal:Int
            let kind:UInt8
            let previous:Data
            let intent:Data
            let count:Int
            let digest:Data
        }
        struct TransactionRecord {
            let descriptor:TransactionDescriptor
            let receipt:Data
            let payload:Data
            var digest:Data {Data(SHA256.hash(data:receipt))}
        }
        private static let transactionKinds = ["pre-target-intent", "target-attempt",
            "store-readback", "restore-attempt", "source-readback",
            "backends-target-observed", "cache-publish-attempt", "cache-publish-ack"]
        private static func recordName(_ ordinal:Int,_ suffix:String)throws->String {
            guard (0..<64).contains(ordinal),["payload","binding","READY"].contains(suffix)
                else{throw Failure.invalid}
            return String(format:"transaction-r%02d",ordinal)+"."+suffix
        }
        private static func digestText(_ data:Data)->String {
            data.map{String(format:"%02x",$0)}.joined()
        }
        private func hasRecordFile(_ ordinal:Int,_ suffix:String)throws->Bool {
            try revalidate()
            var value=stat()
            let name=try Self.recordName(ordinal,suffix)
            if fstatat(directoryFD,name,&value,AT_SYMLINK_NOFOLLOW)==0 {
                guard (value.st_mode & S_IFMT)==S_IFREG,value.st_uid==geteuid(),
                      (value.st_mode & 0o7777)==0o600,value.st_nlink==1 else{throw Failure.unsafe}
                return true
            }
            guard errno==ENOENT else{throw Failure.io(errno)}
            return false
        }
        private func syncRecordFile(_ name:String)throws {
            try revalidate()
            let fd=openat(directoryFD,name,O_RDWR|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC)
            guard fd>=0 else{throw Failure.io(errno)}
            defer{Darwin.close(fd)}
            try Self.sameEntry(parent:directoryFD,name:name,fd:fd,directory:false)
            try Self.sync(fd)
            try Self.sameEntry(parent:directoryFD,name:name,fd:fd,directory:false)
            try Self.sync(directoryFD)
            try revalidate()
        }
        private func transactionBinding(_ d:TransactionDescriptor,writerGeneration:UInt64,
            captureReceipt:Data,capture:Data,sourceGeneration:UInt64)throws->Data {
            try transactionBinding(d,writerGeneration:writerGeneration,
                captureReceiptSha256:Self.hash(captureReceipt),captureSha256:Self.hash(capture),
                sourceGeneration:sourceGeneration)
        }
        // The private scanner computes these hashes once for the actual loaded
        // capture. Binding bytes are identical; no hash comes from a caller.
        private func transactionBinding(_ d:TransactionDescriptor,writerGeneration:UInt64,
            captureReceiptSha256:String,captureSha256:String,sourceGeneration:UInt64)throws->Data {
            guard (0..<64).contains(d.ordinal),(1...8).contains(d.kind),
                  d.previous.count==32,d.intent.count==32,d.digest.count==32,
                  d.count>0,d.count<=Self.limit,writerGeneration != 0 else{throw Failure.invalid}
            let root=try Self.metadata(rootFD,directory:true)
            return try Self.encode([
                "format":"aux.ui-storage.transaction-binding.v1",
                "phase":"unqualified-data","qualified":false,"activationAuthorized":false,
                "transactionId":transaction,"ordinal":String(d.ordinal),
                "kind":Self.transactionKinds[Int(d.kind)-1],
                "writerGeneration":String(writerGeneration),
                "captureSourceGeneration":String(sourceGeneration),
                "captureReceiptSha256":captureReceiptSha256,"captureSha256":captureSha256,
                "policySha256":context.journal.policySha256,
                "initialJournalSha256":context.durableJournalSha256,
                "rootDevice":String(root.st_dev),"rootInode":String(root.st_ino),
                "previousRecordSha256":Self.digestText(d.previous),
                "intentSha256":Self.digestText(d.intent),
                "payloadSha256":Self.digestText(d.digest),"payloadBytes":String(d.count)])
        }
        private func transactionReceipt(_ d:TransactionDescriptor,binding:Data)throws->Data {
            try Self.encode(["format":"aux.ui-storage.transaction-receipt.v1",
                "phase":"unqualified-data","qualified":false,"activationAuthorized":false,
                "transactionId":transaction,"ordinal":String(d.ordinal),
                "kind":Self.transactionKinds[Int(d.kind)-1],
                "bindingSha256":Self.hash(binding),"payloadSha256":Self.digestText(d.digest),
                "previousRecordSha256":Self.digestText(d.previous),"intentSha256":Self.digestText(d.intent)])
        }
        private static func sameDescriptor(_ a:TransactionDescriptor,_ b:TransactionDescriptor)->Bool {
            a.ordinal==b.ordinal && a.kind==b.kind && a.previous==b.previous &&
                a.intent==b.intent && a.count==b.count && a.digest==b.digest
        }
        private struct TransactionScan {
            var records=[TransactionRecord]()
            var firstUncertain:Int? = nil
            var tailStatus:UInt8=0
            var tailPresent=false
        }
        // This retained object owns the actual admitted root/directory, not a
        // caller path or authority reconstructed from a UUID/generation value.
        final class TransactionInventory {
            private let owner:UiCaptureJournal
            let records:[TransactionRecord]
            let sourceGeneration:UInt64
            let firstUncertain:Int?
            let tailStatus:UInt8
            let tailPresent:Bool
            var currentGeneration:UInt64 {owner.generation}
            init(owner:UiCaptureJournal,records:[TransactionRecord],sourceGeneration:UInt64,
                 firstUncertain:Int?,tailStatus:UInt8,tailPresent:Bool) {
                self.owner=owner;self.records=records;self.sourceGeneration=sourceGeneration
                self.firstUncertain=firstUncertain;self.tailStatus=tailStatus;self.tailPresent=tailPresent
            }
            func revalidate()throws {try owner.revalidate()}
            func record(_ ordinal:Int)throws->TransactionRecord {
                try revalidate()
                guard records.indices.contains(ordinal),records[ordinal].descriptor.ordinal==ordinal
                    else{throw Failure.incomplete}
                let record=records[ordinal]
                try revalidate()
                return record
            }
        }
        private func readTransactionRecord(_ ordinal:Int,previous:Data,intent:Data?,remaining:Int,
            captureReceiptSha256:String,captureSha256:String,sourceGeneration:UInt64,
            synchronize:Bool,tolerateMalformed:Bool)throws->TransactionRecord {
            let payloadName=try Self.recordName(ordinal,"payload")
            let bindingName=try Self.recordName(ordinal,"binding")
            let readyName=try Self.recordName(ordinal,"READY")
            // Strict legacy discovery/load still performs its original sync.
            // Frame13 only reads and never settles a physical upload outcome.
            if synchronize {for name in [payloadName,bindingName,readyName] {try syncRecordFile(name)}}
            let payload=try read(payloadName)
            let binding=try read(bindingName,limit:16_384)
            let receipt=try read(readyName,limit:16_384)
            guard !payload.isEmpty,payload.count<=remaining else{throw Failure.binding}
            let json:Any
            do {json=try JSONSerialization.jsonObject(with:binding)}
            catch {if tolerateMalformed {throw Failure.binding};throw error}
            guard let b=json as? [String:Any],
                  let generationText=b["writerGeneration"] as? String,
                  let writerGeneration=UInt64(generationText),writerGeneration != 0,
                  String(writerGeneration)==generationText,
                  let kindText=b["kind"] as? String,
                  let kindIndex=Self.transactionKinds.firstIndex(of:kindText)
                else{throw Failure.binding}
            let digest=Data(SHA256.hash(data:payload))
            let descriptor=TransactionDescriptor(ordinal:ordinal,kind:UInt8(kindIndex+1),
                previous:previous,intent:intent ?? digest,count:payload.count,digest:digest)
            guard ordinal != 0 || descriptor.kind==1,
                  ordinal == 0 || descriptor.kind != 1,
                  try transactionBinding(descriptor,writerGeneration:writerGeneration,
                    captureReceiptSha256:captureReceiptSha256,captureSha256:captureSha256,
                    sourceGeneration:sourceGeneration)==binding,
                  try transactionReceipt(descriptor,binding:binding)==receipt else{throw Failure.binding}
            return TransactionRecord(descriptor:descriptor,receipt:receipt,payload:payload)
        }
        private func transactionScan(captureReceipt:Data,capture:Data,sourceGeneration:UInt64,
            throughOrdinal:Int?=nil,allowUncertainTail:Bool=false)throws->TransactionScan {
            var scan=TransactionScan(),total=0,ended=false
            var firstHole:Int?=nil
            if let last=throughOrdinal {guard (0..<64).contains(last) else{throw Failure.invalid}}
            let captureReceiptSha256=Self.hash(captureReceipt),captureSha256=Self.hash(capture)
            for ordinal in 0..<64 {
                if let last=throughOrdinal,ordinal>last {break}
                let ready=try hasRecordFile(ordinal,"READY")
                let payloadExists=try hasRecordFile(ordinal,"payload")
                let bindingExists=try hasRecordFile(ordinal,"binding")
                let present=ready || payloadExists || bindingExists
                if ended {
                    if present {
                        guard allowUncertainTail else{throw Failure.incomplete}
                        scan.tailPresent=true
                        if scan.firstUncertain==nil {scan.firstUncertain=firstHole ?? ordinal;scan.tailStatus=2}
                    }
                    continue
                }
                if !ready || !payloadExists || !bindingExists {
                    if present {
                        guard allowUncertainTail else{throw Failure.incomplete}
                        scan.firstUncertain=ordinal;scan.tailStatus=1;scan.tailPresent=true
                    }
                    firstHole=ordinal;ended=true;continue
                }
                do {
                    let record=try readTransactionRecord(ordinal,
                        previous:scan.records.last?.digest ?? Data(repeating:0,count:32),
                        intent:scan.records.first?.descriptor.intent,remaining:Self.limit-total,
                        captureReceiptSha256:captureReceiptSha256,captureSha256:captureSha256,
                        sourceGeneration:sourceGeneration,synchronize:!allowUncertainTail,
                        tolerateMalformed:allowUncertainTail)
                    total += record.payload.count;scan.records.append(record)
                } catch let failure as Failure {
                    guard allowUncertainTail else{throw failure}
                    switch failure {
                    case .binding,.invalid,.incomplete:
                        // Content/partial evidence is retained uncertainty. Root,
                        // context and directory admission are rechecked below.
                        scan.firstUncertain=ordinal;scan.tailStatus=3;scan.tailPresent=true
                        firstHole=ordinal;ended=true
                    case .unsafe:throw failure
                    case .io(_):throw failure
                    }
                }
            }
            try revalidate()
            return scan
        }
        private func transactionRecords(captureReceipt:Data,capture:Data,sourceGeneration:UInt64,throughOrdinal:Int?=nil)throws->[TransactionRecord] {
            // The default remains strict: any partial/gapped tail refuses and
            // legacy frame10 still validates only its requested complete prefix.
            try transactionScan(captureReceipt:captureReceipt,capture:capture,
                sourceGeneration:sourceGeneration,throughOrdinal:throughOrdinal).records
        }
        static func inventory(context:NativeFreshStagedContext,transaction:String)throws->TransactionInventory {
            let capture=try load(context:context,transaction:transaction)
            let store=try UiCaptureJournal(context:context,transaction:transaction,create:false)
            let scan=try store.transactionScan(captureReceipt:capture.receipt,capture:capture.capture,
                sourceGeneration:capture.sourceGeneration,allowUncertainTail:true)
            try store.revalidate()
            return TransactionInventory(owner:store,records:scan.records,sourceGeneration:capture.sourceGeneration,
                firstUncertain:scan.firstUncertain,tailStatus:scan.tailStatus,tailPresent:scan.tailPresent)
        }
        static func records(context:NativeFreshStagedContext,transaction:String,throughOrdinal:Int?=nil)throws->[TransactionRecord] {
            let capture=try load(context:context,transaction:transaction)
            let store=try UiCaptureJournal(context:context,transaction:transaction,create:false)
            return try store.transactionRecords(captureReceipt:capture.receipt,
                capture:capture.capture,sourceGeneration:capture.sourceGeneration,throughOrdinal:throughOrdinal)
        }
        static func persistRecord(context:NativeFreshStagedContext,transaction:String,
            descriptor:TransactionDescriptor,payload:Data)throws->TransactionRecord {
            guard (0..<64).contains(descriptor.ordinal),(1...8).contains(descriptor.kind),
                  descriptor.count>0,descriptor.count<=Self.limit,
                  payload.count==descriptor.count,
                  Data(SHA256.hash(data:payload))==descriptor.digest else{throw Failure.invalid}
            let capture=try load(context:context,transaction:transaction)
            let store=try UiCaptureJournal(context:context,transaction:transaction,create:false)
            let records=try store.transactionRecords(captureReceipt:capture.receipt,
                capture:capture.capture,sourceGeneration:capture.sourceGeneration)
            if descriptor.ordinal<records.count {
                let existing=records[descriptor.ordinal]
                guard sameDescriptor(existing.descriptor,descriptor),existing.payload==payload else{throw Failure.binding}
                return existing
            }
            guard descriptor.ordinal==records.count,records.count<64,
                  descriptor.previous==(records.last?.digest ?? Data(repeating:0,count:32)),
                  descriptor.intent==(records.first?.descriptor.intent ?? descriptor.digest),
                  (descriptor.ordinal==0 ? descriptor.kind==1:descriptor.kind != 1),
                  records.reduce(0,{$0+$1.payload.count})<=Self.limit-payload.count else{throw Failure.binding}
            let binding=try store.transactionBinding(descriptor,writerGeneration:store.generation,
                captureReceipt:capture.receipt,capture:capture.capture,sourceGeneration:capture.sourceGeneration)
            let receipt=try store.transactionReceipt(descriptor,binding:binding)
            try store.writeNew(recordName(descriptor.ordinal,"payload"),payload)
            try store.writeNew(recordName(descriptor.ordinal,"binding"),binding)
            guard try store.read(recordName(descriptor.ordinal,"payload"))==payload,
                  try store.read(recordName(descriptor.ordinal,"binding"),limit:16_384)==binding else{throw Failure.binding}
            try store.writeNew(recordName(descriptor.ordinal,"READY"),receipt)
            let observed=try store.transactionRecords(captureReceipt:capture.receipt,
                capture:capture.capture,sourceGeneration:capture.sourceGeneration)
            guard observed.count==descriptor.ordinal+1,
                  sameDescriptor(observed[descriptor.ordinal].descriptor,descriptor),
                  observed[descriptor.ordinal].payload==payload else{throw Failure.binding}
            return observed[descriptor.ordinal]
        }

        static func list(context:NativeFreshStagedContext)throws->[String] {
            let root=try context.duplicateAuthenticatedBrowserRoot(role:1)
            defer{Darwin.close(root.descriptor)}
            try validateOwner(context,root:root.descriptor,generation:root.generation)
            // dup/fcntl would share the retained root's directory cursor.
            // Open a separate description so repeated discovery scans start
            // at the beginning without altering any other root consumer.
            let copied=openat(root.descriptor,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard copied>=0 else{throw Failure.io(errno)}
            do {try sameEntry(parent:root.descriptor,name:".",fd:copied,directory:true)}
            catch {Darwin.close(copied);throw error}
            guard let stream=fdopendir(copied) else{let code=errno;Darwin.close(copied);throw Failure.io(code)}
            defer{closedir(stream)}
            var transactions=[String](),scanned=0
            while true {
                errno=0
                guard let entry=readdir(stream) else{guard errno==0 else{throw Failure.io(errno)};break}
                scanned += 1
                guard scanned<=16_384 else{throw Failure.invalid}
                let length=Int(entry.pointee.d_namlen)+1
                guard length>0,length<=1024 else{throw Failure.invalid}
                let name=withUnsafePointer(to:&entry.pointee.d_name){pointer in
                    pointer.withMemoryRebound(to:CChar.self,capacity:length){String(cString:$0)}
                }
                if !name.hasPrefix(prefix){continue}
                let transaction=String(name.dropFirst(prefix.count))
                guard UUID(uuidString:transaction)?.uuidString.lowercased()==transaction else{throw Failure.invalid}
                var value=stat()
                guard fstatat(root.descriptor,name,&value,AT_SYMLINK_NOFOLLOW)==0 else{throw Failure.io(errno)}
                guard value.st_uid==geteuid(),(value.st_mode & 0o7777)==0o700,
                      (value.st_mode & S_IFMT)==S_IFDIR else{throw Failure.unsafe}
                transactions.append(transaction)
                guard transactions.count<=256 else{throw Failure.invalid}
            }
            try validateOwner(context,root:root.descriptor,generation:root.generation)
            return transactions.sorted()
        }
        static func persist(context:NativeFreshStagedContext,capture:Data)throws->Data {
            guard !capture.isEmpty,capture.count<=limit,
                  let value=try JSONSerialization.jsonObject(with:capture) as? [String:Any],
                  value["format"] as? String == "aux.ui-storage.capture-input.v1" else{throw Failure.invalid}
            guard try list(context:context).count<256 else{throw Failure.invalid}
            let store=try UiCaptureJournal(context:context,transaction:UUID().uuidString.lowercased(),create:true)
            let root=try metadata(store.rootFD,directory:true)
            let bindingBytes=try binding(context:context,transaction:store.transaction,
                                         generation:store.generation,root:root,capture:capture)
            try store.writeNew("capture.json",capture)
            try store.writeNew("binding.json",bindingBytes)
            guard try store.read("capture.json")==capture,
                  try store.read("binding.json",limit:16_384)==bindingBytes else{throw Failure.binding}
            let receipt=try Self.receipt(transaction:store.transaction,binding:bindingBytes,capture:capture)
            // Only this final immutable record publishes a complete capture.
            // Failed/partial directories stay intact for explicit recovery.
            try store.writeNew("READY",receipt)
            guard try store.read("READY",limit:16_384)==receipt else{throw Failure.binding}
            try store.revalidate()
            return receipt
        }
        static func load(context:NativeFreshStagedContext,transaction:String)throws->(receipt:Data,capture:Data,sourceGeneration:UInt64,currentGeneration:UInt64) {
            let store=try UiCaptureJournal(context:context,transaction:transaction,create:false)
            let receipt=try store.read("READY",limit:16_384)
            let binding=try store.read("binding.json",limit:16_384)
            let capture=try store.read("capture.json")
            guard let b=try JSONSerialization.jsonObject(with:binding) as? [String:Any],
                  let sourceGeneration=b["generation"] as? String,
                  let parsed=UInt64(sourceGeneration),parsed != 0,String(parsed)==sourceGeneration else{throw Failure.binding}
            let root=try metadata(store.rootFD,directory:true)
            let expected=try Self.binding(context:context,transaction:transaction,generation:parsed,root:root,capture:capture)
            guard expected==binding,
                  try Self.receipt(transaction:transaction,binding:expected,capture:capture)==receipt else{throw Failure.binding}
            // A previous generation's capture remains data, not current proof.
            // Native migration must requalify every view/store/owner separately.
            try store.revalidate()
            return(receipt,capture,parsed,store.generation)
        }
    }
    // Finite, native-peer-only transfer of unqualified capture data. The real
    // Entry execution lock serializes frames; no caller chooses a root/handle.
    private final class UiCaptureUpload {
        let id:Data
        let count:Int
        let digest:Data
        var bytes=Data()
        var receipt:Data?
        var physicalOutcomeUnknown=false
        init(id:Data,count:Int,digest:Data){self.id=id;self.count=count;self.digest=digest}
    }
    private struct UiCaptureDownload {
        let id:Data
        let capture:Data
    }
    private final class UiTransactionUpload {
        let id:Data
        let transaction:String
        let descriptor:UiCaptureJournal.TransactionDescriptor
        var bytes=Data()
        var receipt:Data?
        var recordDigest:Data?
        var physicalOutcomeUnknown=false
        init(id:Data,transaction:String,descriptor:UiCaptureJournal.TransactionDescriptor) {
            self.id=id;self.transaction=transaction;self.descriptor=descriptor
        }
        func matches(transaction:String,descriptor:UiCaptureJournal.TransactionDescriptor)->Bool {
            let d=self.descriptor
            return self.transaction==transaction && d.ordinal==descriptor.ordinal && d.kind==descriptor.kind &&
                d.previous==descriptor.previous && d.intent==descriptor.intent &&
                d.count==descriptor.count && d.digest==descriptor.digest
        }
    }
    private struct UiTransactionDownload {
        let transaction:String
        let record:UiCaptureJournal.TransactionRecord
        let inventory:UiCaptureJournal.TransactionInventory?
        init(transaction:String,record:UiCaptureJournal.TransactionRecord,
             inventory:UiCaptureJournal.TransactionInventory?=nil) {
            self.transaction=transaction;self.record=record;self.inventory=inventory
        }
    }
    private struct UiTransactionInventoryDownload {
        let id:Data
        let transaction:String
        let inventory:UiCaptureJournal.TransactionInventory
    }

    private enum UiCaptureFrameError:Error {case invalid,conflict,incomplete,unknown}
    private static func captureInteger(_ bytes:Data,_ offset:Int,_ count:Int)throws->UInt64 {
        guard offset>=0,count>0,count<=8,offset<=bytes.count-count else{throw UiCaptureFrameError.invalid}
        return (0..<count).reduce(UInt64(0)){$0 | UInt64(bytes[offset+$1]) << (8*$1)}
    }
    private static func captureIntegerBytes(_ value:UInt64,_ count:Int)->Data {
        Data((0..<count).map{UInt8(truncatingIfNeeded:value >> (8*$0))})
    }
    private static func captureUUID(_ bytes:Data)throws->String {
        guard bytes.count==16 else{throw UiCaptureFrameError.invalid}
        let hex=bytes.map{String(format:"%02x",$0)}.joined()
        let groups=[8,4,4,4,12]
        var cursor=hex.startIndex,parts=[String]()
        for length in groups {
            let end=hex.index(cursor,offsetBy:length)
            parts.append(String(hex[cursor..<end]));cursor=end
        }
        let result=parts.joined(separator:"-")
        guard UUID(uuidString:result)?.uuidString.lowercased()==result else{throw UiCaptureFrameError.invalid}
        return result
    }
    private static func captureUUIDBytes(_ text:String)throws->Data {
        guard UUID(uuidString:text)?.uuidString.lowercased()==text else{throw UiCaptureFrameError.invalid}
        let hex=Array(text.replacingOccurrences(of:"-",with:"").utf8)
        func nibble(_ value:UInt8)->UInt8{value<=57 ? value-48:value-87}
        return Data(stride(from:0,to:32,by:2).map{nibble(hex[$0])*16+nibble(hex[$0+1])})
    }
    func exchangeUiStorageCaptureFrame(_ handle:UInt64,frame:Data)throws->Data {
        guard frame.startIndex==0,!frame.isEmpty,frame.count<=8192 else{throw UiCaptureFrameError.invalid}
        return try withEntry(handle,guardGenericAction:false){entry in
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            return try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction){
                try captured.owner.verifyUiCaptureJournalAdmission()
                switch frame[0] {
                case 1: // Begin: operation, upload UUID, total LE32, SHA256.
                    guard frame.count==53 else{throw UiCaptureFrameError.invalid}
                    let id=Data(frame[1..<17]),count=Int(try Self.captureInteger(frame,17,4))
                    _ = try Self.captureUUID(id)
                    guard count>0,count<=64*1024*1024 else{throw UiCaptureFrameError.invalid}
                    let digest=Data(frame[21..<53])
                    if let previous=entry.uiCaptureUpload {
                        if previous.id==id {
                            guard previous.count==count,previous.digest==digest,
                                  !previous.physicalOutcomeUnknown else{throw UiCaptureFrameError.conflict}
                            return Data([1])+Self.captureIntegerBytes(UInt64(previous.bytes.count),4)
                        }
                        // Partial/unknown work cannot be discarded by a new UUID.
                        guard previous.receipt != nil,!previous.physicalOutcomeUnknown else{throw UiCaptureFrameError.incomplete}
                    }
                    entry.uiCaptureUpload=UiCaptureUpload(id:id,count:count,digest:digest)
                    return Data([1])+Self.captureIntegerBytes(0,4)
                case 2: // Append: operation, upload UUID, exact offset LE32, bytes.
                    guard frame.count>21,let upload=entry.uiCaptureUpload,
                          frame[1..<17]==upload.id,upload.receipt==nil,
                          !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,17,4)),chunk=Data(frame[21...])
                    guard offset==upload.bytes.count,chunk.count<=upload.count-offset else{throw UiCaptureFrameError.conflict}
                    upload.bytes.append(chunk)
                    return Data([2])+Self.captureIntegerBytes(UInt64(upload.bytes.count),4)
                case 3: // Persist once. A failed physical attempt is never rerun.
                    guard frame.count==17,let upload=entry.uiCaptureUpload,
                          frame[1..<17]==upload.id else{throw UiCaptureFrameError.invalid}
                    if let receipt=upload.receipt{return Data([3])+receipt}
                    guard !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.unknown}
                    guard upload.bytes.count==upload.count,
                          Data(SHA256.hash(data:upload.bytes))==upload.digest else{throw UiCaptureFrameError.incomplete}
                    upload.physicalOutcomeUnknown=true
                    let receipt=try UiCaptureJournal.persist(context:captured.owner,capture:upload.bytes)
                    upload.receipt=receipt;upload.physicalOutcomeUnknown=false
                    return Data([3])+receipt
                case 4: // Discover immutable/partial journal IDs; no promotion.
                    guard frame.count==1 else{throw UiCaptureFrameError.invalid}
                    let ids=try UiCaptureJournal.list(context:captured.owner)
                    var reply=Data([4])+Self.captureIntegerBytes(UInt64(ids.count),4)
                    for id in ids {reply.append(try Self.captureUUIDBytes(id))}
                    return reply
                case 5: // Load from the actual owner; cache only validated data.
                    guard frame.count==17 else{throw UiCaptureFrameError.invalid}
                    let id=Data(frame[1..<17])
                    let loaded=try UiCaptureJournal.load(context:captured.owner,transaction:Self.captureUUID(id))
                    entry.uiCaptureDownload=UiCaptureDownload(id:id,capture:loaded.capture)
                    var reply=Data([5])
                    reply.append(Self.captureIntegerBytes(UInt64(loaded.capture.count),4))
                    reply.append(Self.captureIntegerBytes(loaded.sourceGeneration,8))
                    reply.append(Self.captureIntegerBytes(loaded.currentGeneration,8))
                    reply.append(Data(SHA256.hash(data:loaded.capture)))
                    reply.append(Self.captureIntegerBytes(UInt64(loaded.receipt.count),4))
                    reply.append(loaded.receipt)
                    return reply
                case 6: // Read a bounded slice of that exact validated capture.
                    guard frame.count==25,let loaded=entry.uiCaptureDownload,
                          frame[1..<17]==loaded.id else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,17,4)),count=Int(try Self.captureInteger(frame,21,4))
                    guard count>0,count<=8191,offset<=loaded.capture.count-count else{throw UiCaptureFrameError.invalid}
                    return Data([6])+loaded.capture[offset..<offset+count]
                case 7: // Finite descriptor only; persistence is a separate physical action.
                    guard frame.count==138 else{throw UiCaptureFrameError.invalid}
                    let transaction=try Self.captureUUID(Data(frame[1..<17]))
                    let id=Data(frame[17..<33]);_ = try Self.captureUUID(id)
                    let ordinal=Int(try Self.captureInteger(frame,33,4)),kind=frame[37]
                    let count=Int(try Self.captureInteger(frame,102,4))
                    guard (0..<64).contains(ordinal),(1...8).contains(kind),count>0,count<=64*1024*1024
                        else{throw UiCaptureFrameError.invalid}
                    let descriptor=UiCaptureJournal.TransactionDescriptor(ordinal:ordinal,kind:kind,
                        previous:Data(frame[38..<70]),intent:Data(frame[70..<102]),
                        count:count,digest:Data(frame[106..<138]))
                    if let previous=entry.uiTransactionUpload {
                        if previous.id==id {
                            guard previous.matches(transaction:transaction,descriptor:descriptor),
                                  !previous.physicalOutcomeUnknown else{throw UiCaptureFrameError.conflict}
                            return Data([7])+Self.captureIntegerBytes(UInt64(previous.bytes.count),4)
                        }
                        guard previous.receipt != nil,!previous.physicalOutcomeUnknown
                            else{throw UiCaptureFrameError.incomplete}
                    }
                    // The UUID is only a locator for an actual complete native
                    // capture journal under this retained authenticated root.
                    _ = try UiCaptureJournal.load(context:captured.owner,transaction:transaction)
                    entry.uiTransactionUpload=UiTransactionUpload(id:id,transaction:transaction,descriptor:descriptor)
                    return Data([7])+Self.captureIntegerBytes(0,4)
                case 8:
                    guard frame.count>21,let upload=entry.uiTransactionUpload,
                          frame[1..<17]==upload.id,upload.receipt==nil,
                          !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,17,4)),chunk=Data(frame[21...])
                    guard offset==upload.bytes.count,offset<=upload.descriptor.count,
                          chunk.count<=upload.descriptor.count-offset else{throw UiCaptureFrameError.conflict}
                    upload.bytes.append(chunk)
                    return Data([8])+Self.captureIntegerBytes(UInt64(upload.bytes.count),4)
                case 9:
                    guard frame.count==17,let upload=entry.uiTransactionUpload,
                          frame[1..<17]==upload.id else{throw UiCaptureFrameError.invalid}
                    if let receipt=upload.receipt,let digest=upload.recordDigest {
                        return Data([9])+digest+Self.captureIntegerBytes(UInt64(receipt.count),4)+receipt
                    }
                    guard !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.unknown}
                    guard upload.bytes.count==upload.descriptor.count,
                          Data(SHA256.hash(data:upload.bytes))==upload.descriptor.digest else{throw UiCaptureFrameError.incomplete}
                    upload.physicalOutcomeUnknown=true
                    let record=try UiCaptureJournal.persistRecord(context:captured.owner,
                        transaction:upload.transaction,descriptor:upload.descriptor,payload:upload.bytes)
                    upload.receipt=record.receipt;upload.recordDigest=record.digest;upload.physicalOutcomeUnknown=false
                    return Data([9])+record.digest+Self.captureIntegerBytes(UInt64(record.receipt.count),4)+record.receipt
                case 10:
                    guard frame.count==21 else{throw UiCaptureFrameError.invalid}
                    let transaction=try Self.captureUUID(Data(frame[1..<17]))
                    let ordinal=Int(try Self.captureInteger(frame,17,4))
                    guard (0..<64).contains(ordinal) else{throw UiCaptureFrameError.invalid}
                    let records=try UiCaptureJournal.records(context:captured.owner,transaction:transaction,throughOrdinal:ordinal)
                    guard ordinal<records.count else{throw UiCaptureFrameError.incomplete}
                    let record=records[ordinal]
                    entry.uiTransactionDownload=UiTransactionDownload(transaction:transaction,record:record)
                    // Exact physical sync/readback can settle a lost Persist.
                    // A different record cannot clear the older unknown write.
                    if let upload=entry.uiTransactionUpload,
                       upload.matches(transaction:transaction,descriptor:record.descriptor),
                       upload.bytes==record.payload {
                        upload.receipt=record.receipt;upload.recordDigest=record.digest;upload.physicalOutcomeUnknown=false
                    }
                    var reply=Data([10])
                    reply.append(Self.captureIntegerBytes(UInt64(record.payload.count),4))
                    reply.append(record.descriptor.kind);reply.append(record.digest)
                    reply.append(Self.captureIntegerBytes(UInt64(record.receipt.count),4))
                    reply.append(record.receipt)
                    return reply
                case 11:
                    guard frame.count==29,let loaded=entry.uiTransactionDownload,
                          try Self.captureUUID(Data(frame[1..<17]))==loaded.transaction,
                          Int(try Self.captureInteger(frame,17,4))==loaded.record.descriptor.ordinal
                        else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,21,4)),count=Int(try Self.captureInteger(frame,25,4))
                    guard count>0,count<=8191,offset<=loaded.record.payload.count-count
                        else{throw UiCaptureFrameError.invalid}
                    try loaded.inventory?.revalidate()
                    let reply=Data([11])+loaded.record.payload[offset..<offset+count]
                    try loaded.inventory?.revalidate()
                    return reply
                case 12:
                    guard frame.count==17 else{throw UiCaptureFrameError.invalid}
                    let transaction=try Self.captureUUID(Data(frame[1..<17]))
                    let records=try UiCaptureJournal.records(context:captured.owner,transaction:transaction)
                    var reply=Data([12])+Self.captureIntegerBytes(UInt64(records.count),4)
                    for record in records {
                        reply.append(Self.captureIntegerBytes(UInt64(record.descriptor.ordinal),4))
                        reply.append(record.descriptor.kind);reply.append(record.digest)
                        reply.append(record.descriptor.digest)
                    }
                    return reply
                case 13:
                    guard frame.count==17 || frame.count==37 else{throw UiCaptureFrameError.invalid}
                    let transaction=try Self.captureUUID(Data(frame[1..<17]))
                    if frame.count==17 {
                        let inventory=try UiCaptureJournal.inventory(context:captured.owner,transaction:transaction)
                        let id=try Self.captureUUIDBytes(UUID().uuidString.lowercased())
                        guard inventory.records.count<=64 else{throw UiCaptureFrameError.invalid}
                        var reply=Data([13,0]);reply.append(id)
                        reply.append(Self.captureIntegerBytes(inventory.sourceGeneration,8))
                        reply.append(Self.captureIntegerBytes(inventory.currentGeneration,8))
                        reply.append(Self.captureIntegerBytes(UInt64(inventory.records.count),4))
                        reply.append(Self.captureIntegerBytes(UInt64(inventory.firstUncertain ?? 64),4))
                        reply.append(inventory.tailStatus);reply.append(inventory.tailPresent ? 1:0)
                        for record in inventory.records {
                            reply.append(Self.captureIntegerBytes(UInt64(record.descriptor.ordinal),4))
                            reply.append(record.descriptor.kind);reply.append(record.digest)
                            reply.append(record.descriptor.digest)
                        }
                        guard reply.count<=8192 else{throw UiCaptureFrameError.invalid}
                        try inventory.revalidate()
                        // Replacing read caches never changes any upload,
                        // unknown persistence result or pending mutable action.
                        if entry.uiTransactionDownload?.inventory != nil {entry.uiTransactionDownload=nil}
                        entry.uiTransactionInventory=UiTransactionInventoryDownload(id:id,
                            transaction:transaction,inventory:inventory)
                        return reply
                    }
                    guard let cached=entry.uiTransactionInventory,cached.transaction==transaction,
                          frame[17..<33]==cached.id else{throw UiCaptureFrameError.invalid}
                    let ordinal=Int(try Self.captureInteger(frame,33,4))
                    let record=try cached.inventory.record(ordinal)
                    guard record.receipt.count<=8192-63 else{throw UiCaptureFrameError.invalid}
                    var reply=Data([13,1]);reply.append(cached.id)
                    reply.append(Self.captureIntegerBytes(UInt64(ordinal),4))
                    reply.append(Self.captureIntegerBytes(UInt64(record.payload.count),4))
                    reply.append(record.descriptor.kind);reply.append(record.digest)
                    reply.append(Self.captureIntegerBytes(UInt64(record.receipt.count),4));reply.append(record.receipt)
                    try cached.inventory.revalidate()
                    entry.uiTransactionDownload=UiTransactionDownload(transaction:transaction,
                        record:record,inventory:cached.inventory)
                    // Deliberately do not settle uiTransactionUpload here.
                    // Only the unchanged strict synced frame10 may do that.
                    return reply
                default:throw UiCaptureFrameError.invalid
                }
            }
        }
    }

    // Native-only seams: not registered in the string command dispatcher or
    // NAPI. withEntry retains the real owner, active count and execution lock
    // through every physical write/fsync/read and the final guard observation.
    func prepareUiStorageCaptureJournal(_ handle:UInt64,capture:Data)throws->Data {
        try withEntry(handle,guardGenericAction:false){entry in
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            return try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction){
                try UiCaptureJournal.persist(context:captured.owner,capture:capture)
            }
        }
    }
    func readUiStorageCaptureJournal(_ handle:UInt64,transaction:String)throws->(receipt:Data,capture:Data,sourceGeneration:UInt64,currentGeneration:UInt64) {
        try withEntry(handle,guardGenericAction:false){entry in
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            return try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction){
                try UiCaptureJournal.load(context:captured.owner,transaction:transaction)
            }
        }
    }
    func listUiStorageCaptureJournals(_ handle:UInt64)throws->[String] {
        try withEntry(handle,guardGenericAction:false){entry in
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            return try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction){
                try UiCaptureJournal.list(context:captured.owner)
            }
        }
    }
#endif

    func withContext<T>(_ handle:UInt64,_ action:(AuxInstallationCommandCore)throws->T)throws->T {
        try withEntry(handle){try action($0.core)}
    }
    fileprivate func withCommandHandler<T>(_ handle:UInt64,_ action:((String,String)throws->String)throws->T)throws->T {
        try withEntry(handle,guardGenericAction:false){entry in
            try action({command,input in try self.runKnownCommand(entry,command:command,input:input)})
        }
    }
    private func dispatchKnownCommand(_ entry:Entry,command:String,input:String)->String {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        if AuxMacOSUtilityCommandCore.commands.contains(command) {
            return "{\"error\":\"Supervised OS utility execution is disabled in this browser build\",\"code\":\"AUX_SUPERVISED_TASKS_DISABLED\"}"
        }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
        var secureCommands=["secure-save","secure-read","secure-clear"]
#if AUX_ATOMIC_CSK_DISPATCH
        secureCommands.append("csk-publish-absent-or-same")
#endif
        if let secure=entry.secureStore,secureCommands.contains(command){return secure.run(command:command,input:input)}
#endif
#if AUX_MACOS_UTILITY_DISPATCH
        if let reply=entry.macOSUtilities?.run(command:command,input:input){return reply}
#endif
        return entry.core.run(command:command,input:input)
    }
    private func runKnownCommand(_ entry:Entry,command:String,input:String)throws->String {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if let previous=try reconcileRetainedRead(entry) {
            // Same explicit request gets the ORIGINAL result; no repeated sign,
            // unwrap, credential query or native action occurs. A new request
            // acknowledges the reconciled read and runs only its new action.
            if previous.command==command,previous.inputSha256==Self.requestDigest(input){return previous.response}
        }
#endif
        try requireFreshGuard(entry,moment:.beforeAction)
        let result=dispatchKnownCommand(entry,command:command,input:input)
        do{try requireFreshGuard(entry,moment:.afterAction)}
        catch {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            // Only this actual source-known route can bind a completed result.
            // Generic trusted closures/account callbacks never enter this path.
            if let failure=error as? AuxNativeFreshGuardFailure,
               failure.disposition == .postOutcomeUnknown,Self.readOnlyCommands.contains(command) {
                condition.lock()
                if entry.nativeGuardFailure==nil,entry.pendingPostGuardObservation != nil {
                    entry.retainedRead=RetainedRead(command:command,inputSha256:Self.requestDigest(input),response:result)
                }
                condition.unlock()
            }
#endif
            throw error
        }
        return result
    }
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
    private func reconcileRetainedRead(_ entry:Entry,closing:Bool=false)throws->RetainedRead? {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock()
        if let lost=entry.nativeGuardFailure{condition.unlock();throw lost}
        guard let pending=entry.pendingPostGuardObservation else{condition.unlock();return nil}
        let permitted=entry.phase == .open || (closing && entry.phase == .retiring)
        guard permitted,let read=entry.retainedRead,let captured=entry.nativeFreshRuntime else{condition.unlock();throw pending}
        guard !entry.reconcilingRead else{condition.unlock();throw AuxDispatcherLifetimeError.reentrantRetirement}
        entry.reconcilingRead=true;condition.unlock()
        defer{if getpid()==process{condition.lock();entry.reconcilingRead=false;condition.broadcast();condition.unlock()}}
        // The actual command has already returned. This checks only current
        // authority; it cannot repeat or reinterpret an unknown write/CAS.
        do{try captured.revalidateCurrentCommandBinding()}
        catch {
            let disposition=classifyAuxNativeFreshGuard(error)
            if disposition == .provenBindingLoss {
                let lost=AuxNativeFreshGuardFailure(moment:.beforeAction,underlying:error,operationError:nil,disposition:.provenBindingLoss)
                condition.lock();entry.nativeGuardFailure=lost;entry.phase = .retiring
                // This reply can never be released under lost authority. Drop
                // only its private response reference; retain failure/context.
                // Swift String storage zeroization is NOT claimed.
                entry.retainedRead=nil
                condition.broadcast();condition.unlock()
#if AUX_MACOS_UTILITY_DISPATCH
                entry.macOSUtilities?.closeAdmission()
#endif
                throw lost
            }
            // Retain exact prior reply/failure on timeout, locked DP or unknown
            // read errors. Later native requests may freshly observe again.
            throw AuxNativeFreshGuardFailure(moment:.beforeAction,underlying:error,operationError:nil,disposition:disposition)
        }
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();defer{condition.unlock()}
        if let lost=entry.nativeGuardFailure{throw lost}
        guard (entry.phase == .open || (closing && entry.phase == .retiring)),entry.pendingPostGuardObservation != nil else{throw AuxDispatcherLifetimeError.retiring}
        entry.pendingPostGuardObservation=nil;entry.retainedRead=nil
        return read
    }
#endif
#if AUX_ATOMIC_CSK_DISPATCH && AUX_SCOPED_SECURE_STORE_DISPATCH
    func withAccountRegistryLock(_ handle:UInt64,_ body:()throws->Int32)throws->Int32 {
        try withEntry(handle){entry in
            guard let secure=entry.secureStore else{throw AuxAccountsCskError.unavailable}
            return try secure.withAccountRegistryLock {
                try self.guardedFreshAction(entry,before:.beforeAccountCallback,after:.afterAccountCallback,afterThrow:.afterThrownAccountCallback,body)
            }
        }
    }
#endif
    private func withEntry<T>(_ handle:UInt64,guardGenericAction:Bool=true,_ action:(Entry)throws->T)throws->T {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        let threadActive=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        guard threadActive[handle,default:0]==0 else{throw AuxDispatcherLifetimeError.reentrantCall}
        condition.lock()
        guard let entry=entries[handle]else{condition.unlock();throw AuxDispatcherLifetimeError.invalidHandle}
        guard entry.phase == .open else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}
        entry.active += 1
        condition.unlock()
        entry.execution.lock()
        var active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        active[handle,default:0] += 1;Thread.current.threadDictionary[threadKey]=active
        defer {
          if getpid()==process {
            var current=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
            let count=current[handle,default:1]-1
            if count==0{current.removeValue(forKey:handle)}else{current[handle]=count}
            Thread.current.threadDictionary[threadKey]=current
            entry.execution.unlock()
            condition.lock();entry.active -= 1
            if entry.active==0 && entry.phase == .retiring && !hasRetainedLifetime(entry) {
                entry.phase = .closed;entries.removeValue(forKey:handle)
            }
            condition.broadcast();condition.unlock()
            withExtendedLifetime(entry){} // No imported-owner destructor under registry lock.
          }
        }
        if guardGenericAction{return try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction){try action(entry)}}
        return try action(entry)
    }
    private func hasRetainedLifetime(_ entry:Entry)->Bool {
        entry.browserGrantUnresolved || hasUntrackedFreshGuard(entry)
    }
    private func hasUntrackedFreshGuard(_ entry:Entry)->Bool {
        #if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        return entry.nativeGuardFailure != nil || entry.pendingPostGuardObservation != nil
#else
        return false
#endif
    }
    private func requireFreshGuard(_ entry:Entry,moment:AuxNativeFreshGuardMoment,operationError:Error?=nil)throws {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        guard let captured=entry.nativeFreshRuntime else{return}
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();let prior=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation;let open=entry.phase == .open;condition.unlock()
        if let prior{throw prior}
        let requiresOpen=moment == .beforeAction || moment == .beforeAccountCallback
        guard open || !requiresOpen else{throw AuxDispatcherLifetimeError.retiring}
        do{try captured.revalidateCurrentCommandBinding()}
        catch {
            // Type and finite status only: no paths, keys, rows or error payloads.
            fputs("Aux native guard refused: \(String(reflecting:type(of:error)))\n",stderr)
            if case AuxFreshColdGuardError.peer(let status)=error {
                fputs("Aux native guard peer status: \(status)\n",stderr)
            }
            let classified=classifyAuxNativeFreshGuard(error)
            let disposition:AuxNativeFreshGuardDisposition=classified == .provenBindingLoss ? .provenBindingLoss : (moment.beforeProtectedBoundary ? classified:.postOutcomeUnknown)
            let failure=AuxNativeFreshGuardFailure(moment:moment,underlying:error,operationError:operationError,disposition:disposition)
            // Read-only pre-timeout/unavailable failures refuse this call but
            // permit a later real guard check. They do not poison the owner.
            if disposition == .retryableNoCommand || disposition == .unknownNoCommand{throw failure}
            condition.lock()
            if disposition == .provenBindingLoss {
                entry.nativeGuardFailure=entry.nativeGuardFailure ?? failure;entry.phase = .retiring
                entry.retainedRead=nil // Never retain a now-unusable secret reply.
            }else{
                // An operation may already have happened. Retain an unresolved
                // observation fence, not a permanent identity-loss assertion.
                entry.pendingPostGuardObservation=entry.pendingPostGuardObservation ?? failure
            }
            let retained=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation!;condition.broadcast();condition.unlock()
#if AUX_MACOS_UTILITY_DISPATCH
            if disposition == .provenBindingLoss{entry.macOSUtilities?.closeAdmission()}
#endif
            throw retained
        }
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();let later=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation;let stillOpen=entry.phase == .open;condition.unlock()
        if let later{throw later}
        guard stillOpen || !requiresOpen else{throw AuxDispatcherLifetimeError.retiring}
#endif
    }
    private func guardedFreshAction<T>(_ entry:Entry,before:AuxNativeFreshGuardMoment,after:AuxNativeFreshGuardMoment,afterThrow:AuxNativeFreshGuardMoment,_ action:()throws->T)throws->T {
        try requireFreshGuard(entry,moment:before)
        let result:T
        do{result=try action()}
        catch{
            let original=error
            // An inner acquired callback already records its exact boundary;
            // don't relabel a before-callback timeout as an attempted command.
            if original is AuxNativeFreshGuardFailure{throw original}
            try requireFreshGuard(entry,moment:afterThrow,operationError:original);throw original
        }
        try requireFreshGuard(entry,moment:after)
        return result
    }
    // Owner destruction cannot wait on its own lease; close now and let the
    // last acquired operation remove the entry. No further acquisition succeeds.
    fileprivate func closeOwner(_ handle:UInt64) {
        guard getpid()==process else{return}
        condition.lock()
        guard let entry=entries[handle]else{condition.unlock();return}
        defer{condition.unlock();withExtendedLifetime(entry){}}
        entry.phase = .retiring
#if AUX_MACOS_UTILITY_DISPATCH
        entry.macOSUtilities?.closeAdmission()
#endif
        if entry.active==0 && !hasRetainedLifetime(entry){entry.phase = .closed;entries.removeValue(forKey:handle)}
        condition.broadcast()
    }
    func isAccepting(_ handle:UInt64)->Bool {
        guard getpid()==process else{return false}
        condition.lock();defer{condition.unlock()}
        guard let entry=entries[handle],entry.phase == .open else{return false}
        return !hasUntrackedFreshGuard(entry)
    }
    // 0 idle/no unknown result;1 acquired native call;2 completed unknown read;
    // 3 completed unknown generic/write;4 proven binding loss;-1 no owned entry;
    // -4 wrong process. This says NOTHING about separate OS/PDF image custody.
    func observeOperationState(_ handle:UInt64)->Int32 {
        guard getpid()==process else{return -4}
        condition.lock();defer{condition.unlock()}
        guard let entry=entries[handle]else{return -1}
        if entry.active>0{return 1}
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if entry.reconcilingRead{return 1}
#endif
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if entry.nativeGuardFailure != nil{return 4}
        if entry.pendingPostGuardObservation != nil{return entry.retainedRead == nil ? 3:2}
#endif
        return 0
    }
    // Exact existing owner only; this observation creates no capability and
    // performs no command/callback. Both internal authority reads are guarded
    // by the context itself. A transient failure has no action to quarantine.
    // Native metadata accessor for the exact retained current context. It never
    // accepts a parent handle/path from JavaScript or a captured evidence row.
    func browserStartupReceipt(_ handle:UInt64)throws->Data {
        try withEntry(handle,guardGenericAction:false){entry in
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            try requireFreshGuard(entry,moment:.beforeAction)
            condition.lock()
            guard entry.phase == .open else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}
            entry.browserGrantUnresolved=true
            condition.unlock()
            let receipt=try captured.owner.browserStartupReceipt()
            guard receipt.count==72 else{throw AuxDispatcherLifetimeError.invalidInput}
            try requireFreshGuard(entry,moment:.beforeAction)
            return receipt
#else
            throw AuxDispatcherLifetimeError.invalidInput
#endif
        }
    }
    func copyAuthenticatedBrowserRoot(_ handle:UInt64,role:UInt32)throws->(generation:UInt64,descriptor:Int32) {
        guard role == 1 || role == 2 else{throw AuxDispatcherLifetimeError.invalidInput}
        return try withEntry(handle,guardGenericAction:false){entry in
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            try requireFreshGuard(entry,moment:.beforeAction)
            var descriptor:Int32 = -1
            do {
                let copied=try captured.owner.duplicateAuthenticatedBrowserRoot(role:role)
                descriptor=copied.descriptor
                guard copied.generation != 0,descriptor>=0 else{throw AuxDispatcherLifetimeError.invalidInput}
                // This is a read-only FD handoff, not a dispatched command. A
                // failed final validation closes it; no status grants admission.
                try requireFreshGuard(entry,moment:.beforeAction)
                return copied
            }catch{if descriptor>=0{Darwin.close(descriptor)};throw error}
#else
            throw AuxDispatcherLifetimeError.invalidInput
#endif
        }
    }
    // One actual current native context produces this pair. No JS path/account
    // can choose the control/task home, and v1-v4 layouts have no task capability.
    func copyAuthenticatedStorageRoots(_ handle:UInt64)throws->(generation:UInt64,control:Int32,task:Int32) {
        try withEntry(handle,guardGenericAction:false){entry in
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            try requireFreshGuard(entry,moment:.beforeAction)
            var control:Int32 = -1,task:Int32 = -1
            do {
                let projection=try captured.owner.duplicateAuthenticatedTaskHome()
                task=projection.descriptor
                control=try captured.owner.duplicateRetainedHomeDescriptor()
                guard projection.generation != 0,control>=0,task>=0 else{throw AuxDispatcherLifetimeError.invalidInput}
                try requireFreshGuard(entry,moment:.beforeAction)
                return(projection.generation,control,task)
            }catch{if control>=0{Darwin.close(control)};if task>=0{Darwin.close(task)};throw error}
#else
            throw AuxDispatcherLifetimeError.invalidInput
#endif
        }
    }
    // Native synchronous action only. The C++ lease remains alive beyond this
    // method's postguard; no JS callback, path, pin inventory or fd is admitted.
    func withRuntimePublication(_ handle:UInt64,expected:UInt64,
        invoked:inout Bool,action:(Int32,Int32,UInt64)->Void)throws {
        try withEntry(handle){entry in
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            guard let captured=entry.nativeFreshRuntime,expected != 0 else{throw AuxDispatcherLifetimeError.invalidInput}
            let projection=try captured.owner.duplicateAuthenticatedTaskHome()
            defer{Darwin.close(projection.descriptor)}
            guard projection.generation==expected,projection.descriptor>=0 else{throw AuxDispatcherLifetimeError.invalidInput}
            let bundle=captured.owner.authenticatedPolicy.bundlePath
            let suffix="/apps/daemon/Aux Daemon.app"
            guard bundle.hasSuffix(suffix) else{throw AuxDispatcherLifetimeError.invalidInput}
            let source=String(bundle.dropLast(suffix.count))+"/agent-runtime"
            // Walk the fixed policy-derived distribution without following any
            // intermediate symlink. Source bytes are fully checked against the
            // compiled inventory by the native publication worker.
            var fd=Darwin.open("/",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
            guard fd>=0 else{throw AuxDispatcherLifetimeError.invalidInput}
            defer{Darwin.close(fd)}
            for part in source.split(separator:"/") {
                guard part != ".",part != ".." else{throw AuxDispatcherLifetimeError.invalidInput}
                let next=Darwin.openat(fd,String(part),O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
                guard next>=0 else{throw AuxDispatcherLifetimeError.invalidInput}
                Darwin.close(fd);fd=next
            }
            var st=stat()
            guard fstat(fd,&st)==0,st.st_uid==geteuid(),st.st_mode & 0o022==0 else{throw AuxDispatcherLifetimeError.invalidInput}
            try requireFreshGuard(entry,moment:.beforeAction)
            invoked=true
            action(projection.descriptor,fd,projection.generation)
#else
            throw AuxDispatcherLifetimeError.invalidInput
#endif
        }
    }
    func validateCurrentAuthority(_ handle:UInt64)->Int32 {
        do {
            guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
            let active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
            if active[handle,default:0]>0 {
                // An authenticated account-lock callback may perform guarded
                // filesystem writes. Its outer withEntry already holds this
                // exact entry's execution lock and active lifetime on this
                // thread. Revalidate it; do not open a nested command or return
                // a cached admission result. Command re-entry stays forbidden.
                condition.lock()
                guard let entry=entries[handle] else{condition.unlock();throw AuxDispatcherLifetimeError.invalidHandle}
                guard entry.phase == .open,entry.active>0 else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}
                condition.unlock()
                try requireFreshGuard(entry,moment:.beforeAction)
            }else{
                try withEntry(handle,guardGenericAction:false){entry in try requireFreshGuard(entry,moment:.beforeAction)}
            }
            return 0
        }catch let failure as AuxNativeFreshGuardFailure {
            switch failure.disposition {
            case .provenBindingLoss:return 3
            case .postOutcomeUnknown:return 2
            case .retryableNoCommand,.unknownNoCommand:return 1
            }
        }catch AuxDispatcherLifetimeError.invalidHandle{return -1}
        catch AuxNativeFreshGuardProcessError.wrongProcess{return -2}
        catch AuxDispatcherLifetimeError.retiring{return 3}
        catch{return 1}
    }
    // Cancellation closes future commands while preserving this exact Entry.
    // Returning pending is custody, not a settled retirement or recovery grant.
    func closeBrowserAdmission(_ handle:UInt64)->Int32 {
        guard getpid()==process else{return -2}
        condition.lock()
        guard let entry=entries[handle] else{condition.unlock();return -1}
        entry.phase = .retiring
        entry.browserGrantUnresolved=true
        condition.broadcast();condition.unlock()
#if AUX_MACOS_UTILITY_DISPATCH
        entry.macOSUtilities?.closeAdmission()
#endif
        withExtendedLifetime(entry){}
        return 1
    }
    // No JS/exported handle endpoint invokes this. The exact retained Swift
    // Owner supplies its own opaque identity to the real native WorkerHost.
    func completeBrowserCleanShutdown(_ handle:UInt64,ownerPointer:UnsafeMutableRawPointer)throws {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        let active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        guard active[handle,default:0]==0 else{throw AuxDispatcherLifetimeError.reentrantRetirement}
        condition.lock()
        guard let entry=entries[handle],entry.phase == .retiring,entry.active==0,
              entry.browserGrantUnresolved,!hasUntrackedFreshGuard(entry) else{
            condition.unlock();throw AuxDispatcherLifetimeError.retiring
        }
        entry.active += 1 // retain owner and pending completion through both fsyncs
        condition.unlock()
        entry.execution.lock()
        defer {
            entry.execution.unlock()
            condition.lock();entry.active -= 1;condition.broadcast();condition.unlock()
            withExtendedLifetime(entry){}
        }
        // This native query must resolve the actual retained owner, not trust
        // status flags from the embedding or a renderer. Pending/unknown refuses.
        guard nativeOwnerCleanSettlement(ownerPointer)==0 else{throw AuxDispatcherLifetimeError.retiring}
#if AUX_MACOS_UTILITY_DISPATCH
        if let utility=entry.macOSUtilities {
            switch utility.closeAdmissionAndDrain(timeout:0) {
            case .notPresent,.drained:break
            case .pending,.untracked:throw AuxDispatcherLifetimeError.retiring
            }
        }
#endif
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
        try captured.revalidateCurrentCommandBinding()
        guard nativeOwnerCleanSettlement(ownerPointer)==0 else{throw AuxDispatcherLifetimeError.retiring}
        try captured.owner.completeBrowserCleanShutdown()
#else
        throw AuxDispatcherLifetimeError.invalidInput
#endif
        condition.lock();defer{condition.unlock()}
        // The retired entry never reopened during the physical finalization.
        // Other calls were refused while active=1 and root Host admission closed.
        guard entry.phase == .retiring,entry.active==1,!hasUntrackedFreshGuard(entry) else{throw AuxDispatcherLifetimeError.retiring}
        entry.browserGrantUnresolved=false
        condition.broadcast()
    }
    func retire(_ handle:UInt64)throws {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        let active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        guard active[handle,default:0]==0 else{throw AuxDispatcherLifetimeError.reentrantRetirement}
        condition.lock()
        guard let entry=entries[handle]else{condition.unlock();throw AuxDispatcherLifetimeError.invalidHandle}
        entry.phase = .retiring
#if AUX_MACOS_UTILITY_DISPATCH
        entry.macOSUtilities?.closeAdmission()
#endif
        // Do not wait or remove an Entry holding an untracked browser grant.
        // No public callback exists to relabel that grant as drained.
        guard !entry.browserGrantUnresolved else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}
        while entry.active>0 {condition.wait()}
        condition.unlock()
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        // Explicit native close acknowledges any completed READ reply only
        // after real current authority revalidation, with no mutex over it.
        // Unknown writes/generic callbacks cannot pass this reconciliation.
        _ = try reconcileRetainedRead(entry,closing:true)
#endif
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();defer{condition.unlock();withExtendedLifetime(entry){}}
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if let failure=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation{throw failure}
#endif
        guard !entry.browserGrantUnresolved else{throw AuxDispatcherLifetimeError.retiring}
        entry.phase = .closed
        entries.removeValue(forKey:handle);condition.broadcast()
    }
}

// Only the trusted Swift host can construct an owner from a checked captured
// context. No C/JS factory accepts scope, JSON rows or arbitrary core callbacks.
final class AuxOwnedCommandDispatcher {
    let handle:UInt64
    func completeBrowserCleanShutdown()throws {
        try AuxCommandDispatcherRegistry.shared.completeBrowserCleanShutdown(handle,ownerPointer:Unmanaged.passUnretained(self).toOpaque())
    }
#if AUX_MACOS_UTILITY_DISPATCH
    // Retain exact immutable custody after registry retirement. This is a native
    // query capability, not a new JS handle or host acceptance declaration.
    private let macOSUtilities:AuxMacOSUtilityCommandCore?
#endif
    func closeOSAdmissionAndDrain(timeout:TimeInterval)->AuxOSDrainResult {
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities?.closeAdmissionAndDrain(timeout:timeout) ?? .notPresent
#else
        .notPresent
#endif
    }
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    init(capturedTerminal:CapturedTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(capturedTerminal)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    init(runtimeCaptured:AuxRuntimeCapturedCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(runtimeCaptured)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    // Declaration composition only: the sealed type validates actual recovered
    // terminal evidence. This flag supplies no runtime admission or bypass.
    init(recoveredFreshTerminal:RecoveredFreshTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(recoveredFreshTerminal)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
    convenience init(nativeFresh:NativeFreshRuntimeCapturedContext)throws {
        try self.init(scopedTerminal:ScopedAuxCommandContext.nativeFresh(nativeFresh))
    }
#endif
    init(scopedTerminal:ScopedAuxCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(scopedTerminal)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_MACOS_UTILITY_DISPATCH
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    init(capturedTerminal:CapturedTerminalCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(capturedTerminal,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    init(runtimeCaptured:AuxRuntimeCapturedCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(runtimeCaptured,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
    }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    init(recoveredFreshTerminal:RecoveredFreshTerminalCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(recoveredFreshTerminal,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    init(scopedTerminal:ScopedAuxCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(scopedTerminal,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
    }
#endif
#endif
    func retire()throws{try AuxCommandDispatcherRegistry.shared.retire(handle)}
    deinit{AuxCommandDispatcherRegistry.shared.closeOwner(handle)}
}

private func dispatcherCString(_ text:String)->UnsafeMutablePointer<CChar>? { strdup(text) }
private func dispatcherError(_ error:Error)->UnsafeMutablePointer<CChar>? {
    let text:String
    switch error {
    case AuxDispatcherLifetimeError.invalidHandle:text="Invalid dispatcher handle"
    case AuxDispatcherLifetimeError.retiring:text="Dispatcher is retiring"
    case AuxDispatcherLifetimeError.invalidInput:text="Invalid native command input"
    case let failure as AuxNativeFreshGuardFailure:
        switch failure.moment {
        case .beforeAction,.beforeAccountCallback:text="Fresh native guard unavailable before command boundary"
        default:text="Fresh native guard unavailable; command outcome unknown"
        }
    case AuxNativeFreshGuardProcessError.wrongProcess:text="Wrong native dispatcher process"
    default:text="Native dispatcher operation failed"
    }
    return dispatcherCString("{\"error\":\""+text+"\"}")
}
private func dispatcherString(_ pointer:UnsafePointer<UInt8>?,_ length:Int,_ maximum:Int)throws->String {
    guard length>=0,length<=maximum else{throw AuxDispatcherLifetimeError.invalidInput}
    if length==0{return ""}
    guard let pointer,let text=String(data:Data(bytes:pointer,count:length),encoding:.utf8),!text.contains("\0")else{throw AuxDispatcherLifetimeError.invalidInput}
    return text
}

// New INTERNAL context-bearing ABI, deliberately not a fake original Run ABI.
// Caller must supply valid readable buffers for lengths on a valid owned handle.
// Handle lookup occurs BEFORE any caller input pointer is dereferenced.
@_cdecl("AuxNativeContextRun")
func auxNativeContextRun(_ handle:UInt64,_ command:UnsafePointer<UInt8>?,_ commandLength:Int,
                         _ input:UnsafePointer<UInt8>?,_ inputLength:Int)->UnsafeMutablePointer<CChar>? {
    do {
        return try AuxCommandDispatcherRegistry.shared.withCommandHandler(handle){run in
            let name=try dispatcherString(command,commandLength,128)
            let value=try dispatcherString(input,inputLength,16_384)
            return dispatcherCString(try run(name,value))
        }
    }catch{return dispatcherError(error)}
}
// Standard owned C result: copy string first, then free exactly once. A pointer
// not returned by ContextRun is not a permitted argument (ordinary C contract).
@_cdecl("AuxNativeResultFree")
func auxNativeResultFree(_ result:UnsafeMutablePointer<CChar>?){free(result)}
@_cdecl("AuxNativeContextRetire")
func auxNativeContextRetire(_ handle:UInt64)->Int32 {
    do{try AuxCommandDispatcherRegistry.shared.retire(handle);return 0}
    catch AuxDispatcherLifetimeError.invalidHandle{return -1}
    catch AuxDispatcherLifetimeError.reentrantRetirement{return -2}
    catch is AuxNativeFreshGuardFailure{return -3}
    catch AuxNativeFreshGuardProcessError.wrongProcess{return -4}
    catch{return -5}
}

#if AUX_ATOMIC_CSK_DISPATCH && AUX_SCOPED_SECURE_STORE_DISPATCH
@_cdecl("AuxNativeContextWithAccountRegistryLock")
func auxNativeContextWithAccountRegistryLock(_ handle:UInt64,_ body:(@convention(c)(UnsafeMutableRawPointer?)->Int32)?,_ context:UnsafeMutableRawPointer?)->Int32 {
    guard let body else{return -1}
    do{return try AuxCommandDispatcherRegistry.shared.withAccountRegistryLock(handle){body(context)}}catch{return -2}
}
#endif

@_cdecl("AuxNativeContextObserveOperationState")
func auxNativeContextObserveOperationState(_ handle:UInt64)->Int32{AuxCommandDispatcherRegistry.shared.observeOperationState(handle)}

@_cdecl("AuxNativeContextValidateCurrentAuthority")
func auxNativeContextValidateCurrentAuthority(_ handle:UInt64)->Int32{AuxCommandDispatcherRegistry.shared.validateCurrentAuthority(handle)}

@_cdecl("AuxNativeContextCopyBrowserRoot")
func auxNativeContextCopyBrowserRoot(_ owner:UInt64,_ role:UInt32,
    _ generation:UnsafeMutablePointer<UInt64>?,_ descriptor:UnsafeMutablePointer<Int32>?)->Int32 {
    if let generation{generation.pointee=0};if let descriptor{descriptor.pointee = -1}
    guard let generation,let descriptor,role == 1 || role == 2 else{return -1}
    do {
        let copied=try AuxCommandDispatcherRegistry.shared.copyAuthenticatedBrowserRoot(owner,role:role)
        generation.pointee=copied.generation;descriptor.pointee=copied.descriptor;return 0
    }catch AuxNativeFreshGuardProcessError.wrongProcess{return -3}
    catch AuxDispatcherLifetimeError.retiring{return -2}
    catch{return -1}
}

// Native-only paired finite storage locator bridge; outputs are initialized on
// every refusal. Returned descriptors remain capabilities, not JS path setters.
@_cdecl("AuxNativeContextCopyStorageRoots")
func auxNativeContextCopyStorageRoots(_ handle:UInt64,_ generation:UnsafeMutablePointer<UInt64>?,_ control:UnsafeMutablePointer<Int32>?,_ task:UnsafeMutablePointer<Int32>?)->Int32 {
    generation?.pointee=0;control?.pointee = -1;task?.pointee = -1
    guard let generation,let control,let task else{return -1}
    do{let roots=try AuxCommandDispatcherRegistry.shared.copyAuthenticatedStorageRoots(handle)
        generation.pointee=roots.generation;control.pointee=roots.control;task.pointee=roots.task;return 0
    }catch{return -1}
}

// Native callback is synchronous and cannot escape borrowed directory FDs.
@_cdecl("AuxNativeContextWithRuntimePublication")
func auxNativeContextWithRuntimePublication(_ handle:UInt64,_ generation:UInt64,
    _ action:(@convention(c)(UnsafeMutableRawPointer?,Int32,Int32,UInt64)->Void)?,
    _ context:UnsafeMutableRawPointer?)->Int32 {
    guard let action,let context,generation != 0 else{return -1}
    var invoked=false
    do {
        try AuxCommandDispatcherRegistry.shared.withRuntimePublication(handle,expected:generation,invoked:&invoked){task,source,current in
            action(context,task,source,current)
        }
        return 0
    } catch {return invoked ? 2:-1}
}

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
                let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),bytes.count-offset)}
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
            try withEntry(handle,guardGenericAction:false){entry in try requireFreshGuard(entry,moment:.beforeAction)}
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

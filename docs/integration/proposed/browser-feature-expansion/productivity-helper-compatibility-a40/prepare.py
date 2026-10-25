from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
BUILD=ROOT/'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/actual-daemon-ordinary-storage-locks-build-a16.json'
inputs=json.loads(BUILD.read_text())['inputFiles']
rows=[];patch=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
def emit(name,changes):
 matches=[Path(p) for p in inputs if Path(p).name==name];assert len(matches)==1
 p=matches[0];b=p.read_text();assert sha(b.encode())==inputs[str(p)]
 a=b;anchors=[]
 for old,new in changes:
  assert a.count(old)==1,(name,old[:70],a.count(old));a=a.replace(old,new,1);anchors.append({'before':old,'after':new,'count':1})
 (HERE/'baseline').mkdir(exist_ok=True);(HERE/'baseline'/name).write_text(b);(HERE/'source'/name).write_text(a)
 rows.append({'input':str(p),'inputSha256':sha(b.encode()),'output':str(ROOT/HERE.relative_to(Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web'))/'source'/name),'outputSha256':sha(a.encode()),'anchors':anchors})
 patch.extend(difflib.unified_diff(b.splitlines(True),a.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
resolver='''    // Native caller already retains its actual dispatcher Entry. Account is
    // lookup data only; no current-account/path fallback or session export.
    func registeredMemoryAccount(_ account:Int64)throws->AuxMemoryAccountIdentity {
        try withDirectoryLock {directory in
            let fd=openat(directory,"accounts.json",O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard fd>=0 else{throw AuxMemoryAccountError.unavailable};defer{close(fd)}
            var before=stat(),named=stat()
            guard fstat(fd,&before)==0,(before.st_mode&S_IFMT)==S_IFREG,before.st_uid==geteuid(),
                  before.st_nlink==1,before.st_mode&0o077==0,before.st_size>0,before.st_size<=4*1024*1024,
                  fstatat(directory,"accounts.json",&named,AT_SYMLINK_NOFOLLOW)==0,
                  named.st_dev==before.st_dev,named.st_ino==before.st_ino else{throw AuxMemoryAccountError.unavailable}
            var bytes=Data(count:Int(before.st_size)),offset=0
            while offset<bytes.count {
                let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),$0.count-offset)}
                if amount<0 && errno==EINTR{continue};guard amount>0 else{throw AuxMemoryAccountError.unavailable};offset += amount
            }
            let identity=try AuxMemoryAccountIdentity.decode(bytes,account:account)
            var after=stat(),entry=stat()
            guard fstat(fd,&after)==0,fstatat(directory,"accounts.json",&entry,AT_SYMLINK_NOFOLLOW)==0,
                  entry.st_dev==before.st_dev,entry.st_ino==before.st_ino,
                  after.st_size==before.st_size,after.st_mode==before.st_mode,after.st_uid==before.st_uid,
                  after.st_nlink==before.st_nlink,after.st_flags==before.st_flags,
                  after.st_mtimespec.tv_sec==before.st_mtimespec.tv_sec,after.st_mtimespec.tv_nsec==before.st_mtimespec.tv_nsec,
                  after.st_ctimespec.tv_sec==before.st_ctimespec.tv_sec,after.st_ctimespec.tv_nsec==before.st_ctimespec.tv_nsec
            else{throw AuxMemoryAccountError.changed}
            return identity
        }
    }
'''
emit('AuxAccountsCskCoordinator.swift',[('    private let info=Data("aux.dk.csk.v2".utf8)',resolver+'    private let info=Data("aux.dk.csk.v2".utf8)')])
emit('AuxSecureStore.swift',[('    func withAccountRegistryLock<T>(_ body:()throws->T)throws->T {','''    func registeredMemoryAccount(_ account:Int64)throws->AuxMemoryAccountIdentity {
        guard let accounts else{throw AuxMemoryAccountError.unavailable}
        return try accounts.registeredMemoryAccount(account)
    }
    func withAccountRegistryLock<T>(_ body:()throws->T)throws->T {''')])
methods='''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    private func withMemoryRegistryCallback<T>(_ handle:UInt64,_ body:()throws->T)throws->T {
        let key="aux.native.memory.registry-callback.v1"
        var held=Thread.current.threadDictionary[key] as? [UInt64:Int] ?? [:]
        held[handle,default:0] += 1;Thread.current.threadDictionary[key]=held
        defer{var current=Thread.current.threadDictionary[key] as? [UInt64:Int] ?? [:];let remaining=(current[handle] ?? 1)-1;if remaining==0{current.removeValue(forKey:handle)}else{current[handle]=remaining};Thread.current.threadDictionary[key]=current}
        return try body()
    }
    // Refusal fence only. The actual registered FileJsonStore producer passes
    // its exact pending accounts.json bytes while holding the existing lock.
    func validateMemoryRegistryTarget(_ handle:UInt64,bytes:Data)throws {
        guard getpid()==process else{throw AuxMemoryAccountError.changed}
        let held=Thread.current.threadDictionary["aux.native.memory.registry-callback.v1"] as? [UInt64:Int] ?? [:]
        guard held[handle,default:0]>0 else{throw AuxMemoryAccountError.unavailable}
        condition.lock()
        guard let entry=entries[handle],entry.phase == .open,entry.active>0 else{condition.unlock();throw AuxMemoryAccountError.unavailable}
        let owners=Array(entry.memoryAccounts.values);condition.unlock()
        try requireOrdinaryStorageGuard(entry,moment:.beforeAction)
        for owner in owners{guard try AuxMemoryAccountIdentity.decode(bytes,account:owner.identity.accountId)==owner.identity else{throw AuxMemoryAccountError.changed}}
        try requireOrdinaryStorageGuard(entry,moment:.afterAction)
    }
    // This C boundary is consumed only by the real embedding main Environment
    // producer; it is not registered as a page, generic Worker or command API.
    func captureMemoryAccount(_ handle:UInt64,account:Int64)throws->UInt64 {
        try withEntry(handle,guardGenericAction:false){entry in
            try requireOrdinaryStorageGuard(entry,moment:.beforeAction)
            guard let captured=entry.nativeFreshRuntime,let secure=entry.secureStore else{throw AuxMemoryAccountError.unavailable}
            let identity=try secure.registeredMemoryAccount(account)
            let roots=try captured.owner.duplicateRetainedOrdinaryStorageRoots()
            defer{Darwin.close(roots.control);Darwin.close(roots.task)}
            guard roots.generation>0 else{throw AuxMemoryAccountError.unavailable}
            let owner=try AuxRegisteredMemoryAccountOwner(identity:identity,controlRoot:roots.control,taskRoot:roots.task)
            try owner.revalidate(secure.registeredMemoryAccount(account))
            try requireOrdinaryStorageGuard(entry,moment:.afterAction)
            condition.lock();defer{condition.unlock()}
            guard entry.phase == .open,entry.memoryAccounts.count<64,nextMemoryAccount<UInt64.max,
                  !entry.memoryAccounts.values.contains(where:{$0.identity.accountId==account}) else{throw AuxMemoryAccountError.exhausted}
            let id=nextMemoryAccount;nextMemoryAccount += 1;entry.memoryAccounts[id]=owner
            return id
        }
    }
    func copyMemoryDirectory(_ handle:UInt64,owner id:UInt64)throws->Int32 {
        try withEntry(handle,guardGenericAction:false){entry in
            try requireOrdinaryStorageGuard(entry,moment:.beforeAction)
            condition.lock();let owner=entry.memoryAccounts[id];condition.unlock()
            guard let owner,let secure=entry.secureStore else{throw AuxMemoryAccountError.unavailable}
            try owner.revalidate(secure.registeredMemoryAccount(owner.identity.accountId))
            let fd=try owner.duplicateMemoryDirectory()
            do{try requireOrdinaryStorageGuard(entry,moment:.afterAction);return fd}catch{Darwin.close(fd);throw error}
        }
    }
    func validateMemoryAccount(_ handle:UInt64,owner id:UInt64)throws {
        try withEntry(handle,guardGenericAction:false){entry in
            try requireOrdinaryStorageGuard(entry,moment:.beforeAction)
            condition.lock();let owner=entry.memoryAccounts[id];condition.unlock()
            guard let owner,let secure=entry.secureStore else{throw AuxMemoryAccountError.unavailable}
            try owner.revalidate(secure.registeredMemoryAccount(owner.identity.accountId))
            try requireOrdinaryStorageGuard(entry,moment:.afterAction)
        }
    }
    // Only the native physical-launch/reaper owner calls this after definite
    // pre-child failure or original reap plus closed native stdio. No JS hook.
    func releaseMemoryAccount(_ handle:UInt64,owner id:UInt64)->Int32 {
        guard getpid()==process else{return -2}
        condition.lock();guard let entry=entries[handle],let owner=entry.memoryAccounts.removeValue(forKey:id) else{condition.unlock();return -1}
        if entry.active==0 && entry.phase == .retiring && !hasRetainedLifetime(entry){entry.phase = .closed;entries.removeValue(forKey:handle)}
        condition.broadcast();condition.unlock();withExtendedLifetime(owner){};return 0
    }
#endif
'''
exports='''@_cdecl("AuxValidateRegisteredMemoryRegistryTarget")
func auxValidateRegisteredMemoryRegistryTarget(_ handle:UInt64,_ bytes:UnsafePointer<UInt8>?,_ count:UInt32)->Int32 {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    guard let bytes,count>0,count<=4*1024*1024 else{return -1}
    do{try AuxCommandDispatcherRegistry.shared.validateMemoryRegistryTarget(handle,bytes:Data(bytes:bytes,count:Int(count)));return 0}catch{return -1}
#else
    return -1
#endif
}
// Private native helper adapters. The linked binding must select the actual
// main Environment's retained dispatcher; no JS-supplied dispatcher is valid.
@_cdecl("AuxCaptureRegisteredMemoryAccount")
func auxCaptureRegisteredMemoryAccount(_ handle:UInt64,_ account:Int64,_ owner:UnsafeMutablePointer<UInt64>?)->Int32 {
    guard let owner else{return -1};owner.pointee=0
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    do{owner.pointee=try AuxCommandDispatcherRegistry.shared.captureMemoryAccount(handle,account:account);return 0}catch{return -1}
#else
    return -1
#endif
}
@_cdecl("AuxCopyRegisteredMemoryDirectory")
func auxCopyRegisteredMemoryDirectory(_ handle:UInt64,_ owner:UInt64,_ descriptor:UnsafeMutablePointer<Int32>?)->Int32 {
    guard let descriptor else{return -1};descriptor.pointee = -1
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    do{descriptor.pointee=try AuxCommandDispatcherRegistry.shared.copyMemoryDirectory(handle,owner:owner);return 0}catch{return -1}
#else
    return -1
#endif
}
@_cdecl("AuxValidateRegisteredMemoryAccount")
func auxValidateRegisteredMemoryAccount(_ handle:UInt64,_ owner:UInt64)->Int32 {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    do{try AuxCommandDispatcherRegistry.shared.validateMemoryAccount(handle,owner:owner);return 0}catch{return -1}
#else
    return -1
#endif
}
@_cdecl("AuxReleaseRegisteredMemoryAccount")
func auxReleaseRegisteredMemoryAccount(_ handle:UInt64,_ owner:UInt64)->Int32 {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    return AuxCommandDispatcherRegistry.shared.releaseMemoryAccount(handle,owner:owner)
#else
    return -1
#endif
}
'''
emit('AuxOwnedCommandDispatcher.swift',[
 ('                    try self.guardedFreshAction(entry,before:.beforeAccountCallback,after:.afterAccountCallback,afterThrow:.afterThrownAccountCallback,validation:.ordinaryStorage,body)',
  '                    try self.withMemoryRegistryCallback(handle){try self.guardedFreshAction(entry,before:.beforeAccountCallback,after:.afterAccountCallback,afterThrow:.afterThrownAccountCallback,validation:.ordinaryStorage,body)}'),
 ('        let core:AuxInstallationCommandCore','''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        var memoryAccounts=[UInt64:AuxRegisteredMemoryAccountOwner]()
#endif
        let core:AuxInstallationCommandCore'''),
 ('    private var next:UInt64=1','''    private var next:UInt64=1
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    private var nextMemoryAccount:UInt64=1
#endif'''),
 ('    private func hasRetainedLifetime(_ entry:Entry)->Bool {\n        entry.browserGrantUnresolved || hasUntrackedFreshGuard(entry)\n    }','''    private func hasRetainedLifetime(_ entry:Entry)->Bool {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        if !entry.memoryAccounts.isEmpty{return true}
#endif
        return entry.browserGrantUnresolved || hasUntrackedFreshGuard(entry)
    }'''),
 ('        if entry.active>0{return 1}','''        if entry.active>0{return 1}
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        if !entry.memoryAccounts.isEmpty{return 1}
#endif'''),
 ('    func retire(_ handle:UInt64)throws {',methods+'    func retire(_ handle:UInt64)throws {'),
 ('        while entry.active>0 {condition.wait()}','''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        guard entry.memoryAccounts.isEmpty else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}
#endif
        while entry.active>0 {condition.wait()}'''),
 ('        entry.phase = .closed\n        entries.removeValue(forKey:handle);condition.broadcast()','''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        guard entry.memoryAccounts.isEmpty else{throw AuxDispatcherLifetimeError.retiring}
#endif
        entry.phase = .closed
        entries.removeValue(forKey:handle);condition.broadcast()'''),
 ('@_cdecl("AuxNativeContextCopyBrowserRoot")',exports+'@_cdecl("AuxNativeContextCopyBrowserRoot")'),
])
new=HERE/'source/AuxRegisteredMemoryAccountOwner.swift'
rows.append({'create':True,'output':str(ROOT/HERE.relative_to(Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web'))/'source'/new.name),'outputSha256':sha(new.read_bytes())})
(HERE/'projection.json').write_text(json.dumps({'format':'aux.memory-account-native-owner.v1','baseline':str(BUILD),'files':rows,'anchorCount':sum(len(x.get('anchors',[])) for x in rows),'sourceCount':len(rows),'nativeBuilt':False,'productExecuted':False},indent=2)+'\n')
(HERE/'account-memory-owner.patch').write_text(''.join(patch));print(json.dumps({'sources':len(rows),'anchors':sum(len(x.get('anchors',[]))for x in rows)}))

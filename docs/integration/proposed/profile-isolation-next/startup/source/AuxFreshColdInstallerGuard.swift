// Real source-paired peer/FD ownership, not a Boolean custody receipt.
import Foundation
import Darwin
@_silgen_name("AuxRetainNativeParentConnection") private func retainNativeParent(_ id:UInt64)->Int32
@_silgen_name("AuxReleaseNativeParentConnection") private func releaseNativeParent(_ id:UInt64)
@_silgen_name("AuxRevalidateNativeParentConnection") private func revalidateNativeParent(_ id:UInt64,_ timeout:UInt32)->Int32

@_silgen_name("AuxCopyAuthenticatedNativeParentBrowserRoot") private func copyNativeParentBrowserRoot(_ id:UInt64,_ role:UInt32,_ generation:UnsafeMutablePointer<UInt64>,_ descriptor:UnsafeMutablePointer<Int32>)->Int32

enum AuxFreshColdGuardError:Error {case peer(Int32),path,metadata,installerBusy,io(Int32),wrongProcess}
final class AuxLiveNativeParentConnection {
    private let process=getpid()
    private let handle:UInt64
    private init(_ handle:UInt64){self.handle=handle}
    // Existing actual private-Connect registry only. No observed status/JSON or
    // requirement/evidence bytes accepted here; arbitrary IDs cannot mint peers.
    static func retainingNativeConnection(_ handle:UInt64)throws->AuxLiveNativeParentConnection {
        let status=retainNativeParent(handle);guard status==0 else{throw AuxFreshColdGuardError.peer(status)}
        let peer=AuxLiveNativeParentConnection(handle)
        try peer.revalidate();return peer
    }
    func revalidate()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        let status=revalidateNativeParent(handle,2_000)
        guard status==0 else{throw AuxFreshColdGuardError.peer(status)}
    }
    // Finite native capability. Every successful query transfers one new FD;
    // no path, caller PID, environment field or claimed generation is accepted.
    func copyAuthenticatedBrowserRoot(role:UInt32)throws->(generation:UInt64,descriptor:Int32) {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        guard role==1 || role==2 else{throw AuxFreshColdGuardError.metadata}
        try revalidate()
        var generation:UInt64=0,descriptor:Int32 = -1
        let status=copyNativeParentBrowserRoot(handle,role,&generation,&descriptor)
        do {
            guard status==0,generation != 0,descriptor>=0 else{throw AuxFreshColdGuardError.peer(status)}
            var value=stat();let flags=fcntl(descriptor,F_GETFD)
            guard fstat(descriptor,&value)==0,(value.st_mode&S_IFMT)==S_IFDIR,value.st_uid==geteuid(),
                  flags>=0,flags&FD_CLOEXEC != 0 else{throw AuxFreshColdGuardError.metadata}
            try revalidate()
            return(generation,descriptor)
        }catch{if descriptor>=0{close(descriptor)};throw error}
    }
    deinit{if getpid()==process{releaseNativeParent(handle)}}
}
// Bound together at acquisition, retained through the real fresh/resumed Owner.
// These roots establish browser provenance, never all-writer closure or task IO policy.
private final class AuxAuthenticatedBrowserRootSet {
    private let process=getpid()
    private let generation:UInt64
    private let data:Int32
    private let cache:Int32
    private init(generation:UInt64,data:Int32,cache:Int32){self.generation=generation;self.data=data;self.cache=cache}
    static func capture(peer:AuxLiveNativeParentConnection)throws->AuxAuthenticatedBrowserRootSet {
        let data=try peer.copyAuthenticatedBrowserRoot(role:1)
        var transferred=false
        do {
            let cache=try peer.copyAuthenticatedBrowserRoot(role:2)
            guard data.generation==cache.generation else{close(cache.descriptor);throw AuxFreshColdGuardError.path}
            let roots=AuxAuthenticatedBrowserRootSet(generation:data.generation,data:data.descriptor,cache:cache.descriptor)
            transferred=true
            // Transfer before revalidation; failure releases only the new owner.
            try roots.revalidate(peer:peer)
            return roots
        }catch{if !transferred{close(data.descriptor)};throw error}
    }
    private func requireSame(_ held:Int32,_ observed:Int32)throws {
        var a=stat(),b=stat()
        guard fstat(held,&a)==0,fstat(observed,&b)==0,a.st_dev==b.st_dev,a.st_ino==b.st_ino,
              (a.st_mode&S_IFMT)==S_IFDIR,a.st_uid==geteuid() else{throw AuxFreshColdGuardError.path}
    }
    func revalidate(peer:AuxLiveNativeParentConnection)throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        let observedData=try peer.copyAuthenticatedBrowserRoot(role:1);defer{close(observedData.descriptor)}
        let observedCache=try peer.copyAuthenticatedBrowserRoot(role:2);defer{close(observedCache.descriptor)}
        guard observedData.generation==generation,observedCache.generation==generation else{throw AuxFreshColdGuardError.path}
        try requireSame(data,observedData.descriptor);try requireSame(cache,observedCache.descriptor)
        try peer.revalidate()
    }
    func duplicate(role:UInt32,peer:AuxLiveNativeParentConnection)throws->(generation:UInt64,descriptor:Int32) {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        guard role==1 || role==2 else{throw AuxFreshColdGuardError.metadata}
        try revalidate(peer:peer)
        let fd=fcntl(role==1 ? data:cache,F_DUPFD_CLOEXEC,0)
        guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
        do{try revalidate(peer:peer);return(generation,fd)}catch{close(fd);throw error}
    }
    deinit{if getpid()==process{close(data);close(cache)}}
}
final class AuxFreshColdInstallerGuard {
    static let installerName=".aux-native-cold-installer.v1"
    let policy:AuxAuthenticatedFreshBootstrapPolicy
    private let peer:AuxLiveNativeParentConnection
    private let browserRoots:AuxAuthenticatedBrowserRootSet
    private let process=getpid()
    private let parentFD:Int32
    private let installerFD:Int32
    private init(policy:AuxAuthenticatedFreshBootstrapPolicy,peer:AuxLiveNativeParentConnection,parentFD:Int32,installerFD:Int32,browserRoots:AuxAuthenticatedBrowserRootSet){
        self.policy=policy;self.peer=peer;self.parentFD=parentFD;self.installerFD=installerFD;self.browserRoots=browserRoots
    }
    static func acquire(peer:AuxLiveNativeParentConnection)throws->AuxFreshColdInstallerGuard {
        try peer.revalidate()
        let policy=try AuxSignedFreshBootstrapPolicyLoader.load()
        let browserRoots=try AuxAuthenticatedBrowserRootSet.capture(peer:peer)
        let path=policy.contents.canonicalPrivateParent
        guard let canonical=realpath(path,nil)else{throw AuxFreshColdGuardError.io(errno)}
        defer{free(canonical)}
        guard String(cString:canonical)==path else{throw AuxFreshColdGuardError.path}
        let parent=open(path,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard parent>=0 else{throw AuxFreshColdGuardError.io(errno)}
        var installer:Int32 = -1
        var objectOwnsDescriptors=false
        do {
            try requirePrivate(parent,directory:true);try requirePath(path,fd:parent)
            try requireFreshParentInventory(policy:policy,parentFD:parent)
            installer=openat(parent,installerName,O_RDWR|O_CREAT|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK,0o600)
            guard installer>=0 else{throw AuxFreshColdGuardError.io(errno)}
            try requirePrivate(installer,directory:false);try requireInstaller(parent:parent,fd:installer)
            guard flock(installer,LOCK_EX|LOCK_NB)==0 else{
                if errno==EWOULDBLOCK || errno==EAGAIN{throw AuxFreshColdGuardError.installerBusy}
                throw AuxFreshColdGuardError.io(errno)
            }
            // Actual owner retains both descriptors and the live parent object.
            let guardOwner=AuxFreshColdInstallerGuard(policy:policy,peer:peer,parentFD:parent,installerFD:installer,browserRoots:browserRoots)
            // Ownership moved before callback-capable revalidation. Destruction
            // alone closes these FDs on failure; no duplicate close/reopen path.
            objectOwnsDescriptors=true
            try guardOwner.revalidate()
            try requireFreshParentInventory(policy:policy,parentFD:parent)
            return guardOwner
        }catch{
            if !objectOwnsDescriptors{if installer>=0{close(installer)};close(parent)}
            throw error
        }
    }
    func revalidate()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        try peer.revalidate();try policy.revalidateCurrentIdentity()
        try browserRoots.revalidate(peer:peer)
        try Self.requirePrivate(parentFD,directory:true)
        try Self.requirePath(policy.contents.canonicalPrivateParent,fd:parentFD)
        try Self.requirePrivate(installerFD,directory:false)
        try Self.requireInstaller(parent:parentFD,fd:installerFD)
    }
    func duplicateAuthenticatedBrowserRoot(role:UInt32)throws->(generation:UInt64,descriptor:Int32) {
        try revalidate()
        let root=try browserRoots.duplicate(role:role,peer:peer)
        do{try revalidate();return root}catch{close(root.descriptor);throw error}
    }
    func createFreshHome()throws->AuxFreshNativeHome {
        try revalidate()
        return try AuxFreshNativeHome.create(inCanonicalPrivateParent:policy.contents.canonicalPrivateParent,retainedParentDescriptor:parentFD)
    }
    func duplicateRetainedParentDescriptor()throws->Int32 {
        try revalidate()
        let fd=fcntl(parentFD,F_DUPFD_CLOEXEC,0)
        guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)};return fd
    }
    private static func requireFreshParentInventory(policy:AuxAuthenticatedFreshBootstrapPolicy,parentFD:Int32)throws {
        var marker=stat();let exists=fstatat(parentFD,AuxFreshNativeHome.reservationName,&marker,AT_SYMLINK_NOFOLLOW)==0
        if !exists && errno != ENOENT{throw AuxFreshColdGuardError.io(errno)}
        var allowed:Set<String>=[".","..",installerName]
        if exists {
            // Pure existing-only FD owner: malformed/partial reservation never
            // authorizes creating a lock in an unknown legacy/owner directory.
            let owner=try AuxResumedFreshNativeHome.reopen(policy:policy,retainedParentDescriptor:parentFD)
            allowed.insert(AuxFreshNativeHome.reservationName)
            allowed.insert(String(owner.canonicalHome.split(separator:"/").last!))
        }
        let copied=openat(parentFD,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard copied>=0 else{throw AuxFreshColdGuardError.io(errno)}
        guard let stream=fdopendir(copied)else{let error=errno;close(copied);throw AuxFreshColdGuardError.io(error)}
        defer{closedir(stream)};errno=0
        while let entry=readdir(stream) {
            let name=withUnsafePointer(to:&entry.pointee.d_name){$0.withMemoryRebound(to:CChar.self,capacity:Int(entry.pointee.d_namlen)+1){String(cString:$0)}}
            guard allowed.contains(name)else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            errno=0
        }
        guard errno==0 else{throw AuxFreshColdGuardError.io(errno)}
    }
    private static func requirePath(_ path:String,fd:Int32)throws {
        var held=stat(),entry=stat()
        guard fstat(fd,&held)==0,lstat(path,&entry)==0,held.st_dev==entry.st_dev,held.st_ino==entry.st_ino else{throw AuxFreshColdGuardError.path}
    }
    private static func requireInstaller(parent:Int32,fd:Int32)throws {
        var held=stat(),entry=stat()
        guard fstat(fd,&held)==0,fstatat(parent,installerName,&entry,AT_SYMLINK_NOFOLLOW)==0,
              held.st_dev==entry.st_dev,held.st_ino==entry.st_ino else{throw AuxFreshColdGuardError.path}
    }
    private static func requirePrivate(_ fd:Int32,directory:Bool)throws {
        var value=stat()
        guard fstat(fd,&value)==0,value.st_uid==geteuid(),(value.st_mode&S_IFMT)==(directory ? S_IFDIR:S_IFREG),
              value.st_mode&0o7777==(directory ? 0o700:0o600),directory || (value.st_nlink==1 && value.st_size==0)else{throw AuxFreshColdGuardError.metadata}
        errno=0;let acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        if acl==nil && errno==ENOENT{return}
        guard let acl else{throw AuxFreshColdGuardError.metadata};defer{acl_free(UnsafeMutableRawPointer(acl))}
        var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry) == -1,errno==EINVAL,entry==nil else{throw AuxFreshColdGuardError.metadata}
    }
    deinit{if getpid()==process{close(installerFD);close(parentFD)}} // no unlock/unlink/replacement API
}

// Real source-paired peer/FD ownership, not a Boolean custody receipt.
import Foundation
import Darwin
@_silgen_name("AuxRetainNativeParentConnection") private func retainNativeParent(_ id:UInt64)->Int32
@_silgen_name("AuxReleaseNativeParentConnection") private func releaseNativeParent(_ id:UInt64)
@_silgen_name("AuxRevalidateNativeParentConnection") private func revalidateNativeParent(_ id:UInt64,_ timeout:UInt32)->Int32

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
    deinit{if getpid()==process{releaseNativeParent(handle)}}
}
final class AuxFreshColdInstallerGuard {
    static let installerName=".aux-native-cold-installer.v1"
    let policy:AuxAuthenticatedFreshBootstrapPolicy
    private let peer:AuxLiveNativeParentConnection
    private let process=getpid()
    private let parentFD:Int32
    private let installerFD:Int32
    private init(policy:AuxAuthenticatedFreshBootstrapPolicy,peer:AuxLiveNativeParentConnection,parentFD:Int32,installerFD:Int32){
        self.policy=policy;self.peer=peer;self.parentFD=parentFD;self.installerFD=installerFD
    }
    static func acquire(peer:AuxLiveNativeParentConnection)throws->AuxFreshColdInstallerGuard {
        try peer.revalidate()
        let policy=try AuxSignedFreshBootstrapPolicyLoader.load()
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
            let guardOwner=AuxFreshColdInstallerGuard(policy:policy,peer:peer,parentFD:parent,installerFD:installer)
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
        try Self.requirePrivate(parentFD,directory:true)
        try Self.requirePath(policy.contents.canonicalPrivateParent,fd:parentFD)
        try Self.requirePrivate(installerFD,directory:false)
        try Self.requireInstaller(parent:parentFD,fd:installerFD)
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

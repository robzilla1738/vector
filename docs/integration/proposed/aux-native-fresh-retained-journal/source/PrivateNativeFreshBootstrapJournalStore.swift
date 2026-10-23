// Source-pinned successor of reviewed private fresh journal FD mechanics.
// Typed NONSECRET v2 initial journal only. No secret byte/path callback API or Security calls.
import Foundation
import Darwin

enum NativeFreshBootstrapStoreError:Error { case unsafePath,unsafeMetadata,io(Int32),busy,corruptBinding,mismatch,wrongPhase }
struct StoredNativeFreshBootstrapJournal {
    let journal:NativeFreshBootstrapJournal
    let sha256:String
}
final class PrivateNativeFreshBootstrapJournalStore {
    private let root:String
    private let transactionId:String
    private let expectedJournal:NativeFreshBootstrapJournal
    private let directoryName:String
    private let rootFD:Int32
    private let directoryFD:Int32
    init(canonicalDisposableRoot:String,journal:NativeFreshBootstrapJournal,
         retainedRootDescriptor:Int32? = nil)throws {
        try journal.validate()
        let transactionId=journal.transactionId
        guard canonicalDisposableRoot.hasPrefix("/"),let uuid=UUID(uuidString:transactionId),uuid.uuidString==transactionId,
              let resolved=realpath(canonicalDisposableRoot,nil)else{throw NativeFreshBootstrapStoreError.unsafePath}
        defer{free(resolved)}
        guard String(cString:resolved)==canonicalDisposableRoot else{throw NativeFreshBootstrapStoreError.unsafePath}
        let rootFD:Int32
        if let retainedRootDescriptor {
            rootFD=fcntl(retainedRootDescriptor,F_DUPFD_CLOEXEC,0)
        } else {
            rootFD=open(canonicalDisposableRoot,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
        }
        guard rootFD>=0 else{throw NativeFreshBootstrapStoreError.io(errno)}
        do {
            try Self.metadata(rootFD,directory:true)
            try Self.requireRootIdentity(canonicalDisposableRoot,fd:rootFD)
            let name=".aux-native-fresh-initial-journal-v2-"+transactionId.lowercased()
            if mkdirat(rootFD,name,0o700) != 0 && errno != EEXIST{throw NativeFreshBootstrapStoreError.io(errno)}
            try Self.sync(rootFD)
            let directoryFD=openat(rootFD,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
            guard directoryFD>=0 else{throw NativeFreshBootstrapStoreError.io(errno)}
            do { try Self.metadata(directoryFD,directory:true);try Self.sameEntry(parent:rootFD,name:name,fd:directoryFD) }
            catch { close(directoryFD);throw error }
            self.expectedJournal=journal;self.root=canonicalDisposableRoot;self.transactionId=transactionId;self.directoryName=name;self.rootFD=rootFD;self.directoryFD=directoryFD
        }catch{close(rootFD);throw error}
    }
    deinit{close(directoryFD);close(rootFD)}
    private static func statFD(_ fd:Int32)throws->stat { var value=stat();guard fstat(fd,&value)==0 else{throw NativeFreshBootstrapStoreError.io(errno)};return value }
    private static func metadata(_ fd:Int32,directory:Bool)throws {
        let value=try statFD(fd)
        guard value.st_uid==getuid(),value.st_mode & mode_t(S_IFMT)==mode_t(directory ? S_IFDIR:S_IFREG),
              value.st_mode & 0o7777 == (directory ? 0o700:0o600),directory || (value.st_nlink==1 && value.st_size>=0 && value.st_size<=16_384)else{throw NativeFreshBootstrapStoreError.unsafeMetadata}
        // POSIX mode bits alone do not exclude inherited extended ACL grants.
        errno=0
        let capturedACL=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        // Darwin reports ENOENT for no extended ACL on an already-valid fd.
        if capturedACL==nil && errno==ENOENT{return}
        guard let acl=capturedACL else{throw NativeFreshBootstrapStoreError.unsafeMetadata}
        defer{acl_free(UnsafeMutableRawPointer(acl))}
        guard acl_valid(acl)==0 else{throw NativeFreshBootstrapStoreError.unsafeMetadata}
        var entry:acl_entry_t?
        errno=0
        let result=acl_get_entry(acl,0,&entry) // Darwin ACL_FIRST_ENTRY=0; success (0) means an entry exists.
        guard result == -1,errno==EINVAL,entry==nil else{throw NativeFreshBootstrapStoreError.unsafeMetadata}
    }
    private static func sameEntry(parent:Int32,name:String,fd:Int32)throws {
        var entry=stat();guard fstatat(parent,name,&entry,AT_SYMLINK_NOFOLLOW)==0 else{throw NativeFreshBootstrapStoreError.io(errno)}
        let current=try statFD(fd)
        guard entry.st_dev==current.st_dev,entry.st_ino==current.st_ino,entry.st_mode==current.st_mode,entry.st_uid==current.st_uid else{throw NativeFreshBootstrapStoreError.unsafePath}
    }
    private static func sync(_ fd:Int32)throws { guard fsync(fd)==0 else{throw NativeFreshBootstrapStoreError.io(errno)} }
    private static func requireRootIdentity(_ path:String,fd:Int32)throws {
        let current=open(path,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
        guard current>=0 else{throw NativeFreshBootstrapStoreError.io(errno)}
        defer{close(current)}
        let retained=try statFD(fd),observed=try statFD(current)
        guard retained.st_dev==observed.st_dev,retained.st_ino==observed.st_ino else{
            throw NativeFreshBootstrapStoreError.unsafePath
        }
    }
    private func validateDirectories()throws {
        try Self.metadata(rootFD,directory:true);try Self.metadata(directoryFD,directory:true)
        guard let resolved=realpath(root,nil)else{throw NativeFreshBootstrapStoreError.unsafePath};defer{free(resolved)}
        guard String(cString:resolved)==root else{throw NativeFreshBootstrapStoreError.unsafePath}
        let fresh=open(root,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fresh>=0 else{throw NativeFreshBootstrapStoreError.io(errno)};defer{close(fresh)}
        let before=try Self.statFD(rootFD),after=try Self.statFD(fresh)
        guard before.st_dev==after.st_dev,before.st_ino==after.st_ino else{throw NativeFreshBootstrapStoreError.unsafePath}
        try Self.sameEntry(parent:rootFD,name:directoryName,fd:directoryFD)
    }
    private func locked<T>(_ action:()throws->T)throws->T {
        try validateDirectories()
        let fd=openat(directoryFD,"LOCK",O_RDWR|O_CREAT|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC,0o600)
        guard fd>=0 else{throw NativeFreshBootstrapStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd)
        guard try Self.statFD(fd).st_size==0 else{throw NativeFreshBootstrapStoreError.unsafeMetadata}
        guard flock(fd,LOCK_EX|LOCK_NB)==0 else{throw NativeFreshBootstrapStoreError.busy}
        defer{_ = flock(fd,LOCK_UN)}
        try Self.sync(fd);try Self.sync(directoryFD);try validateDirectories()
        let result=try action();try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd);try validateDirectories();return result
    }
    private func readFile(_ name:String)throws->Data? {
        let fd=openat(directoryFD,name,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC)
        if fd<0 {if errno==ENOENT{return nil};throw NativeFreshBootstrapStoreError.io(errno)}
        defer{close(fd)};try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd)
        let before=try Self.statFD(fd);let size=Int(before.st_size);var bytes=[UInt8](repeating:0,count:size);var offset=0
        while offset<bytes.count {
            let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),size-offset)}
            if amount<0 && errno==EINTR{continue};guard amount>0 else{throw NativeFreshBootstrapStoreError.corruptBinding};offset += amount
        }
        var trailing:UInt8=0
        guard Darwin.read(fd,&trailing,1)==0 else{throw NativeFreshBootstrapStoreError.corruptBinding}
        let after=try Self.statFD(fd);try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd)
        guard before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
              before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw NativeFreshBootstrapStoreError.corruptBinding}
        return Data(bytes)
    }
    private func exclusiveWrite(_ name:String,bytes:Data)throws {
        guard bytes.count<=16_384 else{throw NativeFreshBootstrapStoreError.corruptBinding}
        let fd=openat(directoryFD,name,O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0o600)
        guard fd>=0 else{throw NativeFreshBootstrapStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);var offset=0
        while offset<bytes.count {
            let amount=bytes.withUnsafeBytes{Darwin.write(fd,$0.baseAddress!.advanced(by:offset),bytes.count-offset)}
            if amount<0 && errno==EINTR{continue};guard amount>0 else{throw NativeFreshBootstrapStoreError.io(errno)};offset += amount
        }
        try Self.sync(fd);try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd);try Self.sync(directoryFD)
    }
    private func syncFile(_ name:String)throws {
        let fd=openat(directoryFD,name,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw NativeFreshBootstrapStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd);try Self.sync(fd);try Self.sync(directoryFD)
    }
    private func decode(_ bytes:Data)throws->NativeFreshBootstrapJournal {
        let journal=try NativeFreshBootstrapJournal.decode(bytes)
        guard journal==expectedJournal,try journal.encoded()==bytes else{throw NativeFreshBootstrapStoreError.mismatch}
        return journal
    }
    private func loadUnlocked()throws->StoredNativeFreshBootstrapJournal? {
        guard let bytes=try readFile("initial-journal.json") else{return nil}
        let journal=try decode(bytes)
        try syncFile("initial-journal.json")
        guard try readFile("initial-journal.json")==bytes else{throw NativeFreshBootstrapStoreError.corruptBinding}
        return .init(journal:journal,sha256:nativeBootstrapHash(bytes))
    }
    func load()throws->StoredNativeFreshBootstrapJournal?{try locked{try loadUnlocked()}}
    // Typed immutable nonsecret record only; no arbitrary secret Data/path API.
    func publish()throws->StoredNativeFreshBootstrapJournal {
        try locked {
            let bytes=try expectedJournal.encoded();_ = try decode(bytes)
            if let existing=try readFile("initial-journal.json") {
                guard existing==bytes else{throw NativeFreshBootstrapStoreError.mismatch}
            } else {try exclusiveWrite("initial-journal.json",bytes:bytes)}
            try syncFile("initial-journal.json")
            guard let stored=try loadUnlocked(),stored.sha256==nativeBootstrapHash(bytes)else{throw NativeFreshBootstrapStoreError.corruptBinding}
            return stored
        }
    }
}

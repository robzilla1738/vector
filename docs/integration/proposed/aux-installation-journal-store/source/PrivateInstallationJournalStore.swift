// External journal storage only. No Security, profile or authority operations.
import Foundation
import CryptoKit
import Darwin

enum InstallationJournalStoreError:Error { case unsafePath,unsafeMetadata,io(Int32),busy,staleHead,invalidSuccessor,corruptCheckpoint }
struct StagedInstallationCheckpoint {
    let transactionId:String;let revision:Int;let file:String;let sha256:String
}
struct StoredInstallationCheckpoint {
    let journal:AdditiveInstallationJournal
    let sha256:String
    var acknowledgement:AssertedDurableCheckpoint { .init(journalSha256:sha256) }
}
private struct InstallationJournalHead:Codable {
    let format:String;let transactionId:String;let revision:Int;let file:String;let sha256:String
}
private func journalStoreHash(_ data:Data)->String { SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined() }

final class PrivateInstallationJournalStore {
    private let root:String
    private let transactionId:String
    private let directoryName:String
    private let rootFD:Int32
    private let directoryFD:Int32
    init(canonicalDisposableRoot:String,transactionId:String)throws {
        guard canonicalDisposableRoot.hasPrefix("/"),let uuid=UUID(uuidString:transactionId),uuid.uuidString==transactionId,
              let resolved=realpath(canonicalDisposableRoot,nil)else{throw InstallationJournalStoreError.unsafePath}
        defer{free(resolved)}
        guard String(cString:resolved)==canonicalDisposableRoot else{throw InstallationJournalStoreError.unsafePath}
        let rootFD=open(canonicalDisposableRoot,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
        guard rootFD>=0 else{throw InstallationJournalStoreError.io(errno)}
        do {
            try Self.metadata(rootFD,directory:true)
            let name=".aux-installation-journal-"+transactionId.lowercased()
            if mkdirat(rootFD,name,0o700) != 0 && errno != EEXIST{throw InstallationJournalStoreError.io(errno)}
            try Self.sync(rootFD)
            let directoryFD=openat(rootFD,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
            guard directoryFD>=0 else{throw InstallationJournalStoreError.io(errno)}
            do { try Self.metadata(directoryFD,directory:true);try Self.sameEntry(parent:rootFD,name:name,fd:directoryFD) }
            catch { close(directoryFD);throw error }
            self.root=canonicalDisposableRoot;self.transactionId=transactionId;self.directoryName=name;self.rootFD=rootFD;self.directoryFD=directoryFD
        }catch{close(rootFD);throw error}
    }
    deinit{close(directoryFD);close(rootFD)}
    private static func statFD(_ fd:Int32)throws->stat { var value=stat();guard fstat(fd,&value)==0 else{throw InstallationJournalStoreError.io(errno)};return value }
    private static func metadata(_ fd:Int32,directory:Bool)throws {
        let value=try statFD(fd)
        guard value.st_uid==getuid(),value.st_mode & mode_t(S_IFMT)==mode_t(directory ? S_IFDIR:S_IFREG),
              value.st_mode & 0o7777 == (directory ? 0o700:0o600),directory || (value.st_nlink==1 && value.st_size>=0 && value.st_size<=16_384)else{throw InstallationJournalStoreError.unsafeMetadata}
        // POSIX mode bits alone do not exclude inherited extended ACL grants.
        errno=0
        let capturedACL=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        // Darwin reports ENOENT for no extended ACL on an already-valid fd.
        if capturedACL==nil && errno==ENOENT{return}
        guard let acl=capturedACL else{throw InstallationJournalStoreError.unsafeMetadata}
        defer{acl_free(UnsafeMutableRawPointer(acl))}
        guard acl_valid(acl)==0 else{throw InstallationJournalStoreError.unsafeMetadata}
        var entry:acl_entry_t?
        errno=0
        let result=acl_get_entry(acl,0,&entry) // Darwin ACL_FIRST_ENTRY=0; success (0) means an entry exists.
        guard result == -1,errno==EINVAL,entry==nil else{throw InstallationJournalStoreError.unsafeMetadata}
    }
    private static func sameEntry(parent:Int32,name:String,fd:Int32)throws {
        var entry=stat();guard fstatat(parent,name,&entry,AT_SYMLINK_NOFOLLOW)==0 else{throw InstallationJournalStoreError.io(errno)}
        let current=try statFD(fd)
        guard entry.st_dev==current.st_dev,entry.st_ino==current.st_ino,entry.st_mode==current.st_mode,entry.st_uid==current.st_uid else{throw InstallationJournalStoreError.unsafePath}
    }
    private static func sync(_ fd:Int32)throws { guard fsync(fd)==0 else{throw InstallationJournalStoreError.io(errno)} }
    private func validateDirectories()throws {
        try Self.metadata(rootFD,directory:true);try Self.metadata(directoryFD,directory:true)
        guard let resolved=realpath(root,nil)else{throw InstallationJournalStoreError.unsafePath};defer{free(resolved)}
        guard String(cString:resolved)==root else{throw InstallationJournalStoreError.unsafePath}
        let fresh=open(root,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fresh>=0 else{throw InstallationJournalStoreError.io(errno)};defer{close(fresh)}
        let before=try Self.statFD(rootFD),after=try Self.statFD(fresh)
        guard before.st_dev==after.st_dev,before.st_ino==after.st_ino else{throw InstallationJournalStoreError.unsafePath}
        try Self.sameEntry(parent:rootFD,name:directoryName,fd:directoryFD)
    }
    private func locked<T>(_ action:()throws->T)throws->T {
        try validateDirectories()
        let fd=openat(directoryFD,"LOCK",O_RDWR|O_CREAT|O_NOFOLLOW|O_CLOEXEC,0o600)
        guard fd>=0 else{throw InstallationJournalStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd)
        guard try Self.statFD(fd).st_size==0 else{throw InstallationJournalStoreError.unsafeMetadata}
        guard flock(fd,LOCK_EX|LOCK_NB)==0 else{throw InstallationJournalStoreError.busy}
        defer{_ = flock(fd,LOCK_UN)}
        try Self.sync(fd);try Self.sync(directoryFD);try validateDirectories()
        let result=try action();try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd);try validateDirectories();return result
    }
    private func readFile(_ name:String)throws->Data? {
        let fd=openat(directoryFD,name,O_RDONLY|O_NOFOLLOW|O_CLOEXEC)
        if fd<0 {if errno==ENOENT{return nil};throw InstallationJournalStoreError.io(errno)}
        defer{close(fd)};try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd)
        let before=try Self.statFD(fd);let size=Int(before.st_size);var bytes=[UInt8](repeating:0,count:size);var offset=0
        while offset<bytes.count {
            let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),size-offset)}
            if amount<0 && errno==EINTR{continue};guard amount>0 else{throw InstallationJournalStoreError.corruptCheckpoint};offset += amount
        }
        let after=try Self.statFD(fd);try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd)
        guard before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
              before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw InstallationJournalStoreError.corruptCheckpoint}
        return Data(bytes)
    }
    private func exclusiveWrite(_ name:String,bytes:Data)throws {
        guard bytes.count<=16_384 else{throw InstallationJournalStoreError.corruptCheckpoint}
        let fd=openat(directoryFD,name,O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0o600)
        guard fd>=0 else{throw InstallationJournalStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);var offset=0
        while offset<bytes.count {
            let amount=bytes.withUnsafeBytes{Darwin.write(fd,$0.baseAddress!.advanced(by:offset),bytes.count-offset)}
            if amount<0 && errno==EINTR{continue};guard amount>0 else{throw InstallationJournalStoreError.io(errno)};offset += amount
        }
        try Self.sync(fd);try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd);try Self.sync(directoryFD)
    }
    private func syncFile(_ name:String)throws {
        let fd=openat(directoryFD,name,O_RDONLY|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw InstallationJournalStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd);try Self.sync(fd);try Self.sync(directoryFD)
    }
    private func filename(_ journal:AdditiveInstallationJournal,hash:String)->String { String(format:"revision-%07d-",journal.revision)+hash+".json" }
    private func loadUnlocked()throws->StoredInstallationCheckpoint? {
        guard let headBytes=try readFile("HEAD.json")else{return nil}
        let object=try strictEnvelopeObject(headBytes)
        guard Set(object.keys)==["format","transactionId","revision","file","sha256"]else{throw InstallationJournalStoreError.corruptCheckpoint}
        let head=try JSONDecoder().decode(InstallationJournalHead.self,from:headBytes)
        guard head.format=="aux.install.journal.head.v1",head.transactionId==transactionId,head.sha256.count==64,head.sha256.allSatisfy({"0123456789abcdef".contains($0)}),
              head.revision>=0,head.revision<=1_000_000,head.file==String(format:"revision-%07d-",head.revision)+head.sha256+".json",
              let bytes=try readFile(head.file),journalStoreHash(bytes)==head.sha256 else{throw InstallationJournalStoreError.corruptCheckpoint}
        let journal=try AdditiveInstallationJournal.decode(bytes)
        guard journal.transactionId==transactionId,journal.revision==head.revision,try journal.encoded()==bytes else{throw InstallationJournalStoreError.corruptCheckpoint}
        return .init(journal:journal,sha256:head.sha256)
    }
    private func successor(_ next:AdditiveInstallationJournal,expected:String?)throws {
        let current=try loadUnlocked();guard current?.sha256==expected else{throw InstallationJournalStoreError.staleHead}
        guard next.transactionId==transactionId else{throw InstallationJournalStoreError.invalidSuccessor}
        _ = try AdditiveInstallationJournal.decode(next.encoded())
        guard let old=current?.journal else {
            guard (next.revision==0 && next.phase == .draft)||(next.revision==1 && next.phase == .blocked),next.intended.isEmpty,next.verified.isEmpty else{throw InstallationJournalStoreError.invalidSuccessor};return
        }
        let sameBindings=zip(next.bindings,old.bindings).allSatisfy{$0.row==$1.row && $0.original==$1.original && $0.target==$1.target}
        guard next.revision==old.revision+1,next.candidateSha256==old.candidateSha256,next.format==old.format,sameBindings,
              next.originalHashes==old.originalHashes,next.targetHashes==old.targetHashes,
              Array(next.intended.prefix(old.intended.count))==old.intended,Array(next.verified.prefix(old.verified.count))==old.verified,
              next.intended.count<=old.intended.count+1,next.verified.count<=old.verified.count+1,
              next.phase != .abandoned || (next.intended==old.intended && next.verified==old.verified),
              old.phase != .abandoned,old.phase != .blocked || next.phase == .abandoned else{throw InstallationJournalStoreError.invalidSuccessor}
    }
    func loadCurrent()throws->StoredInstallationCheckpoint? { try locked{try loadUnlocked()} }
    // Stage is deliberately separate: a crash here leaves an immutable orphan,
    // while HEAD still points at the prior durable checkpoint. No evidence deleted.
    func stage(_ journal:AdditiveInstallationJournal,expectedHead:String?)throws->StagedInstallationCheckpoint {
        try locked {
            try successor(journal,expected:expectedHead)
            let bytes=try journal.encoded(),hash=journalStoreHash(bytes),name=filename(journal,hash:hash)
            if let existing=try readFile(name){guard existing==bytes else{throw InstallationJournalStoreError.corruptCheckpoint}}
            else{try exclusiveWrite(name,bytes:bytes)}
            try syncFile(name)
            return .init(transactionId:transactionId,revision:journal.revision,file:name,sha256:hash)
        }
    }
    func publish(_ staged:StagedInstallationCheckpoint,expectedHead:String?)throws->StoredInstallationCheckpoint {
        try locked {
            guard staged.transactionId==transactionId,staged.revision>=0,staged.revision<=1_000_000,
                  staged.sha256.count==64,staged.sha256.allSatisfy({"0123456789abcdef".contains($0)}),
                  staged.file==String(format:"revision-%07d-",staged.revision)+staged.sha256+".json",
                  let bytes=try readFile(staged.file),journalStoreHash(bytes)==staged.sha256 else{throw InstallationJournalStoreError.corruptCheckpoint}
            let journal=try AdditiveInstallationJournal.decode(bytes)
            guard journal.revision==staged.revision,try journal.encoded()==bytes else{throw InstallationJournalStoreError.corruptCheckpoint}
            try successor(journal,expected:expectedHead)
            try syncFile(staged.file)
            let head=InstallationJournalHead(format:"aux.install.journal.head.v1",transactionId:transactionId,revision:journal.revision,file:staged.file,sha256:staged.sha256)
            let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
            let temporary="HEAD-"+UUID().uuidString+".next"
            try exclusiveWrite(temporary,bytes:encoder.encode(head))
            guard renameat(directoryFD,temporary,directoryFD,"HEAD.json")==0 else{throw InstallationJournalStoreError.io(errno)}
            try Self.sync(directoryFD)
            guard let loaded=try loadUnlocked(),loaded.sha256==staged.sha256 else{throw InstallationJournalStoreError.corruptCheckpoint}
            return loaded
        }
    }
    func commit(_ journal:AdditiveInstallationJournal,expectedHead:String?)throws->StoredInstallationCheckpoint { try publish(stage(journal,expectedHead:expectedHead),expectedHead:expectedHead) }
}

// Clearly versioned fresh-only copy of reviewed private journal mechanics.
// External journal storage only. No Security, profile or authority operations.
import Foundation
import CryptoKit
import Darwin

enum FreshInstallationJournalStoreError:Error { case unsafePath,unsafeMetadata,io(Int32),busy,staleHead,invalidSuccessor,corruptCheckpoint }
struct StagedFreshInstallationCheckpoint {
    let transactionId:String;let revision:Int;let file:String;let sha256:String
}
struct StoredFreshInstallationCheckpoint {
    let journal:FreshInstallationJournal
    let sha256:String
    var acknowledgement:AssertedFreshDurableCheckpoint { .init(journalSha256:sha256) }
}
private struct FreshInstallationJournalHead:Codable {
    let format:String;let transactionId:String;let revision:Int;let file:String;let sha256:String
}
private func freshStoreHash(_ data:Data)->String { SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined() }

final class PrivateFreshInstallationJournalStore {
    private let root:String
    private let transactionId:String
    private let directoryName:String
    private let rootFD:Int32
    private let directoryFD:Int32
    init(canonicalDisposableRoot:String,transactionId:String)throws {
        guard canonicalDisposableRoot.hasPrefix("/"),let uuid=UUID(uuidString:transactionId),uuid.uuidString==transactionId,
              let resolved=realpath(canonicalDisposableRoot,nil)else{throw FreshInstallationJournalStoreError.unsafePath}
        defer{free(resolved)}
        guard String(cString:resolved)==canonicalDisposableRoot else{throw FreshInstallationJournalStoreError.unsafePath}
        let rootFD=open(canonicalDisposableRoot,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
        guard rootFD>=0 else{throw FreshInstallationJournalStoreError.io(errno)}
        do {
            try Self.metadata(rootFD,directory:true)
            let name=".aux-fresh-installation-journal-"+transactionId.lowercased()
            if mkdirat(rootFD,name,0o700) != 0 && errno != EEXIST{throw FreshInstallationJournalStoreError.io(errno)}
            try Self.sync(rootFD)
            let directoryFD=openat(rootFD,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
            guard directoryFD>=0 else{throw FreshInstallationJournalStoreError.io(errno)}
            do { try Self.metadata(directoryFD,directory:true);try Self.sameEntry(parent:rootFD,name:name,fd:directoryFD) }
            catch { close(directoryFD);throw error }
            self.root=canonicalDisposableRoot;self.transactionId=transactionId;self.directoryName=name;self.rootFD=rootFD;self.directoryFD=directoryFD
        }catch{close(rootFD);throw error}
    }
    deinit{close(directoryFD);close(rootFD)}
    private static func statFD(_ fd:Int32)throws->stat { var value=stat();guard fstat(fd,&value)==0 else{throw FreshInstallationJournalStoreError.io(errno)};return value }
    private static func metadata(_ fd:Int32,directory:Bool)throws {
        let value=try statFD(fd)
        guard value.st_uid==getuid(),value.st_mode & mode_t(S_IFMT)==mode_t(directory ? S_IFDIR:S_IFREG),
              value.st_mode & 0o7777 == (directory ? 0o700:0o600),directory || (value.st_nlink==1 && value.st_size>=0 && value.st_size<=16_384)else{throw FreshInstallationJournalStoreError.unsafeMetadata}
        // POSIX mode bits alone do not exclude inherited extended ACL grants.
        errno=0
        let capturedACL=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        // Darwin reports ENOENT for no extended ACL on an already-valid fd.
        if capturedACL==nil && errno==ENOENT{return}
        guard let acl=capturedACL else{throw FreshInstallationJournalStoreError.unsafeMetadata}
        defer{acl_free(UnsafeMutableRawPointer(acl))}
        guard acl_valid(acl)==0 else{throw FreshInstallationJournalStoreError.unsafeMetadata}
        var entry:acl_entry_t?
        errno=0
        let result=acl_get_entry(acl,0,&entry) // Darwin ACL_FIRST_ENTRY=0; success (0) means an entry exists.
        guard result == -1,errno==EINVAL,entry==nil else{throw FreshInstallationJournalStoreError.unsafeMetadata}
    }
    private static func sameEntry(parent:Int32,name:String,fd:Int32)throws {
        var entry=stat();guard fstatat(parent,name,&entry,AT_SYMLINK_NOFOLLOW)==0 else{throw FreshInstallationJournalStoreError.io(errno)}
        let current=try statFD(fd)
        guard entry.st_dev==current.st_dev,entry.st_ino==current.st_ino,entry.st_mode==current.st_mode,entry.st_uid==current.st_uid else{throw FreshInstallationJournalStoreError.unsafePath}
    }
    private static func sync(_ fd:Int32)throws { guard fsync(fd)==0 else{throw FreshInstallationJournalStoreError.io(errno)} }
    private func validateDirectories()throws {
        try Self.metadata(rootFD,directory:true);try Self.metadata(directoryFD,directory:true)
        guard let resolved=realpath(root,nil)else{throw FreshInstallationJournalStoreError.unsafePath};defer{free(resolved)}
        guard String(cString:resolved)==root else{throw FreshInstallationJournalStoreError.unsafePath}
        let fresh=open(root,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fresh>=0 else{throw FreshInstallationJournalStoreError.io(errno)};defer{close(fresh)}
        let before=try Self.statFD(rootFD),after=try Self.statFD(fresh)
        guard before.st_dev==after.st_dev,before.st_ino==after.st_ino else{throw FreshInstallationJournalStoreError.unsafePath}
        try Self.sameEntry(parent:rootFD,name:directoryName,fd:directoryFD)
    }
    private func locked<T>(_ action:()throws->T)throws->T {
        try validateDirectories()
        let fd=openat(directoryFD,"LOCK",O_RDWR|O_CREAT|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC,0o600)
        guard fd>=0 else{throw FreshInstallationJournalStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd)
        guard try Self.statFD(fd).st_size==0 else{throw FreshInstallationJournalStoreError.unsafeMetadata}
        guard flock(fd,LOCK_EX|LOCK_NB)==0 else{throw FreshInstallationJournalStoreError.busy}
        defer{_ = flock(fd,LOCK_UN)}
        try Self.sync(fd);try Self.sync(directoryFD);try validateDirectories()
        let result=try action();try Self.sameEntry(parent:directoryFD,name:"LOCK",fd:fd);try validateDirectories();return result
    }
    private func readFile(_ name:String)throws->Data? {
        let fd=openat(directoryFD,name,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC)
        if fd<0 {if errno==ENOENT{return nil};throw FreshInstallationJournalStoreError.io(errno)}
        defer{close(fd)};try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd)
        let before=try Self.statFD(fd);let size=Int(before.st_size);var bytes=[UInt8](repeating:0,count:size);var offset=0
        while offset<bytes.count {
            let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),size-offset)}
            if amount<0 && errno==EINTR{continue};guard amount>0 else{throw FreshInstallationJournalStoreError.corruptCheckpoint};offset += amount
        }
        var trailing:UInt8=0
        guard Darwin.read(fd,&trailing,1)==0 else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
        let after=try Self.statFD(fd);try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd)
        guard before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
              before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
        return Data(bytes)
    }
    private func exclusiveWrite(_ name:String,bytes:Data)throws {
        guard bytes.count<=16_384 else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
        let fd=openat(directoryFD,name,O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0o600)
        guard fd>=0 else{throw FreshInstallationJournalStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);var offset=0
        while offset<bytes.count {
            let amount=bytes.withUnsafeBytes{Darwin.write(fd,$0.baseAddress!.advanced(by:offset),bytes.count-offset)}
            if amount<0 && errno==EINTR{continue};guard amount>0 else{throw FreshInstallationJournalStoreError.io(errno)};offset += amount
        }
        try Self.sync(fd);try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd);try Self.sync(directoryFD)
    }
    private func syncFile(_ name:String)throws {
        let fd=openat(directoryFD,name,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw FreshInstallationJournalStoreError.io(errno)};defer{close(fd)}
        try Self.metadata(fd,directory:false);try Self.sameEntry(parent:directoryFD,name:name,fd:fd);try Self.sync(fd);try Self.sync(directoryFD)
    }
    private func filename(_ journal:FreshInstallationJournal,hash:String)->String { String(format:"revision-%07d-",journal.revision)+hash+".json" }
    private func loadUnlocked()throws->StoredFreshInstallationCheckpoint? {
        guard let headBytes=try readFile("HEAD.json")else{return nil}
        let object=try strictEnvelopeObject(headBytes)
        guard Set(object.keys)==["format","transactionId","revision","file","sha256"]else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
        let head=try JSONDecoder().decode(FreshInstallationJournalHead.self,from:headBytes)
        guard head.format=="aux.install.fresh.journal.head.v1",head.transactionId==transactionId,head.sha256.count==64,head.sha256.allSatisfy({"0123456789abcdef".contains($0)}),
              head.revision>=0,head.revision<=1_000_000,head.file==String(format:"revision-%07d-",head.revision)+head.sha256+".json",
              let bytes=try readFile(head.file),freshStoreHash(bytes)==head.sha256 else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
        let journal=try FreshInstallationJournal.decode(bytes)
        guard journal.transactionId==transactionId,journal.revision==head.revision,try journal.encoded()==bytes else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
        return .init(journal:journal,sha256:head.sha256)
    }
    private func successor(_ next:FreshInstallationJournal,expected:String?)throws {
        let current=try loadUnlocked();guard current?.sha256==expected else{throw FreshInstallationJournalStoreError.staleHead}
        guard next.transactionId==transactionId else{throw FreshInstallationJournalStoreError.invalidSuccessor}
        _ = try FreshInstallationJournal.decode(next.encoded())
        guard let old=current?.journal else {
            guard next.revision==0 && next.phase == .draft,next.intended.isEmpty,next.verified.isEmpty else{throw FreshInstallationJournalStoreError.invalidSuccessor};return
        }
        guard next.scope==old.scope,next.newScopeReviewId==old.newScopeReviewId,next.legacyObservedAbsentRoles==old.legacyObservedAbsentRoles,next.bindings==old.bindings,next.publicDescriptor==old.publicDescriptor,
              next.initialObservedAbsentRoles==old.initialObservedAbsentRoles,
              next.revision==old.revision+1,next.candidateSha256==old.candidateSha256,next.format==old.format,
              next.targetHashes==old.targetHashes else{throw FreshInstallationJournalStoreError.invalidSuccessor}
        let valid:Bool
        if next.phase == .blocked {
            valid = old.phase != .blocked && old.phase != .ready && next.intended==old.intended && next.verified==old.verified
        } else {
            switch (old.phase,next.phase) {
            case (.draft,.intent): valid = next.intended==old.intended+[freshRoles[old.verified.count]] && next.verified==old.verified
            case (.intent,.awaitingReadback): valid = next.intended==old.intended && next.verified==old.verified
            case (.awaitingReadback,.draft),(.awaitingReadback,.ready): valid = next.intended==old.intended && next.verified==old.verified+[old.intended.last!]
            default: valid = false
            }
        }
        guard valid else{throw FreshInstallationJournalStoreError.invalidSuccessor}
    }

    func loadCurrent()throws->StoredFreshInstallationCheckpoint? { try locked{try loadUnlocked()} }
    // Stage is deliberately separate: a crash here leaves an immutable orphan,
    // while HEAD still points at the prior durable checkpoint. No evidence deleted.
    func stage(_ journal:FreshInstallationJournal,expectedHead:String?)throws->StagedFreshInstallationCheckpoint {
        try locked {
            try successor(journal,expected:expectedHead)
            let bytes=try journal.encoded(),hash=freshStoreHash(bytes),name=filename(journal,hash:hash)
            if let existing=try readFile(name){guard existing==bytes else{throw FreshInstallationJournalStoreError.corruptCheckpoint}}
            else{try exclusiveWrite(name,bytes:bytes)}
            try syncFile(name)
            return .init(transactionId:transactionId,revision:journal.revision,file:name,sha256:hash)
        }
    }
    func publish(_ staged:StagedFreshInstallationCheckpoint,expectedHead:String?)throws->StoredFreshInstallationCheckpoint {
        try locked {
            guard staged.transactionId==transactionId,staged.revision>=0,staged.revision<=1_000_000,
                  staged.sha256.count==64,staged.sha256.allSatisfy({"0123456789abcdef".contains($0)}),
                  staged.file==String(format:"revision-%07d-",staged.revision)+staged.sha256+".json",
                  let bytes=try readFile(staged.file),freshStoreHash(bytes)==staged.sha256 else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
            let journal=try FreshInstallationJournal.decode(bytes)
            guard journal.revision==staged.revision,try journal.encoded()==bytes else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
            try successor(journal,expected:expectedHead)
            try syncFile(staged.file)
            let head=FreshInstallationJournalHead(format:"aux.install.fresh.journal.head.v1",transactionId:transactionId,revision:journal.revision,file:staged.file,sha256:staged.sha256)
            let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
            let temporary="HEAD-"+UUID().uuidString+".next"
            try exclusiveWrite(temporary,bytes:encoder.encode(head))
            guard renameat(directoryFD,temporary,directoryFD,"HEAD.json")==0 else{throw FreshInstallationJournalStoreError.io(errno)}
            try Self.sync(directoryFD)
            guard let loaded=try loadUnlocked(),loaded.sha256==staged.sha256 else{throw FreshInstallationJournalStoreError.corruptCheckpoint}
            return loaded
        }
    }
    func commit(_ journal:FreshInstallationJournal,expectedHead:String?)throws->StoredFreshInstallationCheckpoint { try publish(stage(journal,expectedHead:expectedHead),expectedHead:expectedHead) }
}

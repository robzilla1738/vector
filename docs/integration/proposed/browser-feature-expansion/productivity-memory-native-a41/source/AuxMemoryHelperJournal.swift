// One finite helper lease journal. No caller paths, roots or readiness flags.
import Foundation
import CryptoKit
import Darwin
@_silgen_name("AuxMemoryCopyCurrentLifetime") private func memoryCurrentLifetime(_ pid:UnsafeMutablePointer<Int32>,_ seconds:UnsafeMutablePointer<UInt64>,_ micros:UnsafeMutablePointer<UInt64>)->Int32
@_silgen_name("AuxCopyOrdinaryBrowserParentLifetime") private func memoryBrowserLifetime(_ pid:UnsafeMutablePointer<Int32>,_ seconds:UnsafeMutablePointer<UInt64>,_ micros:UnsafeMutablePointer<UInt64>)->Int32
@_silgen_name("AuxMemoryCopyStoppedChildLifetime") private func memoryStoppedLifetime(_ pid:Int32,_ seconds:UnsafeMutablePointer<UInt64>,_ micros:UnsafeMutablePointer<UInt64>)->Int32

enum AuxMemoryJournalError:Error {case unavailable,unknown,conflict}
final class AuxMemoryHelperJournal {
    private let process=getpid()
    private let root:Int32
    private var directory:Int32 = -1
    private let leaseId=UUID().uuidString.lowercased()
    private let base:[String:Any]
    private var recorded:Data?
    private var phase=""
    private var child:[String:String]?
    private var unknown=false
    private var retired=false
    private static let leaf=".aux-memory-helper-lifetimes.v1"
    init(owner:AuxRegisteredMemoryAccountOwner,context:NativeFreshRuntimeCapturedContext)throws {
        let journal=context.owner.journal
        guard let transaction=UUID(uuidString:journal.reservationTransactionId),owner.transportGeneration>0,
              [journal.scope,journal.reservationSha256,journal.policySha256].allSatisfy({$0.count==64&&$0.allSatisfy{"0123456789abcdef".contains($0)}})
        else{throw AuxMemoryJournalError.unavailable}
        root=try owner.duplicateTaskRootDirectory()
        func lifetime(_ browser:Bool)throws->[String:String] {
            var pid:Int32 = -1,seconds:UInt64=0,micros:UInt64=0
            let status=browser ? memoryBrowserLifetime(&pid,&seconds,&micros):memoryCurrentLifetime(&pid,&seconds,&micros)
            guard status==0,pid>1,seconds>0,micros<1_000_000 else{throw AuxMemoryJournalError.unavailable}
            return ["pid":String(pid),"seconds":String(seconds),"microseconds":String(micros)]
        }
        func hex(_ value:Data)->String{value.map{String(format:"%02x",$0)}.joined()}
        do {
            base=["format":"aux.memory.helper-lifetime.v1","leaseId":leaseId,
                  "controlScope":journal.scope,"controlTransactionId":transaction.uuidString,
                  "controlReservationSha256":journal.reservationSha256,"policySha256":journal.policySha256,
                  "transportGeneration":String(owner.transportGeneration),"accountId":String(owner.identity.accountId),
                  "accountIncarnation":owner.identity.incarnation.uuidString,"profileId":owner.identity.profileId.uuidString,
                  "profilePathSha256":hex(owner.identity.profilePathSha256),"recordSha256":hex(owner.identity.recordSha256),
                  "daemon":try lifetime(false),"browser":try lifetime(true)]
        }catch{close(root);throw error}
    }
    deinit{if getpid()==process{if directory>=0{close(directory)};close(root)}}
    private func safe(_ fd:Int32,directory:Bool)throws->stat {
        var value=stat()
        guard fstat(fd,&value)==0,(value.st_mode&S_IFMT)==(directory ? S_IFDIR:S_IFREG),value.st_uid==geteuid(),
              value.st_mode&0o7777==(directory ? 0o700:0o600),directory || (value.st_nlink==1&&value.st_size>0&&value.st_size<=16_384)
        else{throw AuxMemoryJournalError.unavailable}
        errno=0;let captured=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        if captured==nil&&errno==ENOENT{return value}
        guard let acl=captured else{throw AuxMemoryJournalError.unavailable};defer{acl_free(UnsafeMutableRawPointer(acl))}
        var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry)==(-1),errno==EINVAL,entry==nil else{throw AuxMemoryJournalError.unavailable}
        return value
    }
    private func directoryCurrent()throws {
        guard getpid()==process,directory>=0 else{throw AuxMemoryJournalError.unavailable}
        _ = try safe(root,directory:true);let held=try safe(directory,directory:true);var named=stat()
        guard fstatat(root,Self.leaf,&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==held.st_dev,named.st_ino==held.st_ino else{throw AuxMemoryJournalError.conflict}
    }
    private func read()throws->Data {
        try directoryCurrent()
        let fd=openat(directory,leaseId+".json",O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC)
        guard fd>=0 else{throw AuxMemoryJournalError.unavailable};defer{close(fd)}
        let before=try safe(fd,directory:false);var named=stat()
        guard fstatat(directory,leaseId+".json",&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==before.st_dev,named.st_ino==before.st_ino else{throw AuxMemoryJournalError.conflict}
        var bytes=Data(count:Int(before.st_size)),offset=0
        while offset<bytes.count{let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),$0.count-offset)};if amount<0&&errno==EINTR{continue};guard amount>0 else{throw AuxMemoryJournalError.unavailable};offset += amount}
        let after=try safe(fd,directory:false)
        guard before.st_dev==after.st_dev,before.st_ino==after.st_ino,before.st_size==after.st_size,
              before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
              before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw AuxMemoryJournalError.conflict}
        _ = try strictEnvelopeObject(bytes);try directoryCurrent();return bytes
    }
    private func publish(_ next:[String:Any],phase nextPhase:String)throws {
        guard !unknown else{throw AuxMemoryJournalError.unknown}
        try directoryCurrent()
        if let recorded{guard try read()==recorded else{throw AuxMemoryJournalError.conflict}}
        else{var entry=stat();guard fstatat(directory,leaseId+".json",&entry,AT_SYMLINK_NOFOLLOW)<0,errno==ENOENT else{throw AuxMemoryJournalError.conflict}}
        let bytes=try JSONSerialization.data(withJSONObject:next,options:[.sortedKeys,.withoutEscapingSlashes])
        guard bytes.count>0,bytes.count<=16_384 else{throw AuxMemoryJournalError.unavailable}
        let temporary="."+leaseId+"-"+UUID().uuidString.lowercased()+".next"
        unknown=true // Retain any failed/lost filesystem mutation; no replay.
        let fd=openat(directory,temporary,O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0o600)
        guard fd>=0 else{throw AuxMemoryJournalError.unknown}
        do {
            var offset=0
            while offset<bytes.count{let amount=bytes.withUnsafeBytes{Darwin.write(fd,$0.baseAddress!.advanced(by:offset),$0.count-offset)};if amount<0&&errno==EINTR{continue};guard amount>0 else{throw AuxMemoryJournalError.unknown};offset += amount}
            guard fsync(fd)==0 else{throw AuxMemoryJournalError.unknown}
            close(fd)
        }catch{close(fd);throw error}
        guard renameat(directory,temporary,directory,leaseId+".json")==0,fsync(directory)==0 else{throw AuxMemoryJournalError.unknown}
        guard try read()==bytes else{throw AuxMemoryJournalError.unknown}
        recorded=bytes;phase=nextPhase;unknown=false
    }
    func prepare()throws {
        guard getpid()==process,!unknown else{throw AuxMemoryJournalError.unknown}
        if let recorded{guard phase=="prepared",try read()==recorded else{throw AuxMemoryJournalError.conflict};return}
        // Actual retained task root only. No account/profile directory scan.
        if mkdirat(root,Self.leaf,0o700)<0&&errno != EEXIST{unknown=true;throw AuxMemoryJournalError.unknown}
        directory=openat(root,Self.leaf,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
        guard directory>=0 else{unknown=true;throw AuxMemoryJournalError.unknown}
        try directoryCurrent()
        let cursor=openat(directory,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
        guard cursor>=0,let stream=fdopendir(cursor) else{if cursor>=0{close(cursor)};throw AuxMemoryJournalError.unavailable};defer{closedir(stream)}
        var count=0
        errno=0
        while let row=readdir(stream){let name=withUnsafePointer(to:&row.pointee.d_name){$0.withMemoryRebound(to:CChar.self,capacity:256){String(cString:$0)}};if name=="."||name==".."{continue};count += 1;guard count<256 else{throw AuxMemoryJournalError.unavailable};errno=0}
        guard errno==0 else{throw AuxMemoryJournalError.unavailable}
        var next=base;next["phase"]="prepared";try publish(next,phase:"prepared")
        guard fsync(root)==0 else{unknown=true;throw AuxMemoryJournalError.unknown}
    }
    func publishSuspended(_ pid:Int32)throws {
        guard getpid()==process,!unknown,phase=="prepared",let recorded,try read()==recorded else{throw AuxMemoryJournalError.conflict}
        var seconds:UInt64=0,micros:UInt64=0
        guard memoryStoppedLifetime(pid,&seconds,&micros)==0,pid>1,seconds>0,micros<1_000_000 else{throw AuxMemoryJournalError.unavailable}
        let facts=["pid":String(pid),"seconds":String(seconds),"microseconds":String(micros)]
        child=facts
        var next=base;next["phase"]="spawned";next["helper"]=facts;try publish(next,phase:"spawned")
    }
    // Invoked only by joined native process owner after exact original wait and
    // closed stdio, or definite native no-child spawn failure. No JS endpoint.
    func terminal(pid:Int32,waitStatus:Int32,spawnError:Int32)throws {
        guard getpid()==process,!unknown else{throw AuxMemoryJournalError.unknown}
        if retired{return}
        if phase=="reaped"||phase=="not-spawned"{guard let recorded,try read()==recorded else{throw AuxMemoryJournalError.conflict};try retireTerminal();return}
        if recorded==nil,phase.isEmpty,pid==0,spawnError>0,waitStatus==0 {
            try directoryCurrent();var named=stat()
            guard fstatat(directory,leaseId+".json",&named,AT_SYMLINK_NOFOLLOW)<0,errno==ENOENT else{throw AuxMemoryJournalError.conflict}
            retired=true;return // Definite original no-spawn; no journal mutation was issued.
        }
        var next=base
        if pid>1 {
            guard phase=="spawned",let child,child["pid"]==String(pid),waitStatus>=0,spawnError==0 else{throw AuxMemoryJournalError.conflict}
            next["phase"]="reaped";next["helper"]=child;next["waitStatus"]=String(waitStatus);try publish(next,phase:"reaped")
        }else {
            guard phase=="prepared",child==nil,spawnError>0,waitStatus==0 else{throw AuxMemoryJournalError.conflict}
            next["phase"]="not-spawned";next["spawnError"]=String(spawnError);try publish(next,phase:"not-spawned")
        }
        try retireTerminal()
    }
    private func retireTerminal()throws {
        guard !unknown,!retired,phase=="reaped"||phase=="not-spawned",let recorded,try read()==recorded else{throw AuxMemoryJournalError.conflict}
        let fd=openat(directory,leaseId+".json",O_RDONLY|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC)
        guard fd>=0 else{throw AuxMemoryJournalError.unknown};defer{close(fd)}
        let held=try safe(fd,directory:false);var named=stat()
        guard fstatat(directory,leaseId+".json",&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==held.st_dev,named.st_ino==held.st_ino,try read()==recorded else{throw AuxMemoryJournalError.conflict}
        unknown=true
        guard unlinkat(directory,leaseId+".json",0)==0,fsync(directory)==0 else{throw AuxMemoryJournalError.unknown}
        try directoryCurrent()
        guard fstatat(directory,leaseId+".json",&named,AT_SYMLINK_NOFOLLOW)<0,errno==ENOENT else{throw AuxMemoryJournalError.unknown}
        retired=true;unknown=false
    }
    func canRelease()throws->Bool {
        guard getpid()==process,!unknown else{return false}
        if !retired{try retireTerminal()}
        try directoryCurrent();var named=stat()
        return retired && fstatat(directory,leaseId+".json",&named,AT_SYMLINK_NOFOLLOW)<0 && errno==ENOENT
    }
}

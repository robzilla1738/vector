// Fresh-only sealed-policy reservation. No old profile adoption or caller roots.
import Foundation
import CryptoKit
import Darwin
final class AuxBrowserFreshRootAdmission {
    private static let marker=".aux-browser-startup-lease.v1"
    private let process=getpid()
    private let policy:AuxAuthenticatedFreshBootstrapPolicy
    private let generation:UInt64
    private let paths:[String]
    private let roots:[Int32]
    private let markers:[Int32]
    private let records:[Data]
    private init(policy:AuxAuthenticatedFreshBootstrapPolicy,generation:UInt64,paths:[String],roots:[Int32],markers:[Int32],records:[Data]) {
        self.policy=policy;self.generation=generation;self.paths=paths;self.roots=roots;self.markers=markers;self.records=records
    }
    static func acquire(policy:AuxAuthenticatedFreshBootstrapPolicy,generation:UInt64,data:Int32,cache:Int32)throws->AuxBrowserFreshRootAdmission {
        try policy.revalidateCurrentIdentity()
        guard generation != 0,let paths=policy.contents.browserStartupRoots,paths.count==2 else{throw AuxFreshColdGuardError.path}
        var roots=[Int32](),markers=[Int32](),records=[Data]();var transferred=false
        defer{if !transferred{for fd in markers+roots{close(fd)}}}
        for (i,source) in [data,cache].enumerated() {
            let root=fcntl(source,F_DUPFD_CLOEXEC,0)
            guard root>=0 else{throw AuxFreshColdGuardError.io(errno)};roots.append(root)
            try metadata(root,directory:true);try pathIdentity(paths[i],root)
            // Both roots must be empty before any durable mutation, including
            // before the first marker. Unknown/legacy content is never adopted.
            try inventory(root,allowed:[".",".."])
        }
        for i in roots.indices {
            let fd=openat(roots[i],marker,O_RDWR|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK,0o600)
            guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)};markers.append(fd)
            try metadata(fd,directory:false);try entry(roots[i],marker,fd)
            guard flock(fd,LOCK_EX|LOCK_NB)==0 else{throw AuxFreshColdGuardError.installerBusy}
            var root=stat();guard fstat(roots[i],&root)==0 else{throw AuxFreshColdGuardError.metadata}
            let record=try JSONSerialization.data(withJSONObject:["format":"aux.browser.fresh-root-lease.v1","policySha256":policy.policySha256,"role":i+1,"device":String(root.st_dev),"inode":String(root.st_ino),"generation":String(generation)],options:[.sortedKeys,.withoutEscapingSlashes])
            records.append(record)
            try record.withUnsafeBytes {raw in
                var offset=0
                while offset<raw.count {
                    let written=Darwin.write(fd,raw.baseAddress!.advanced(by:offset),raw.count-offset)
                    if written<0 && errno==EINTR{continue}
                    guard written>0 else{throw AuxFreshColdGuardError.io(errno)};offset += written
                }
            }
            guard fsync(fd)==0,fsync(roots[i])==0 else{throw AuxFreshColdGuardError.io(errno)}
        }
        for root in roots{try inventory(root,allowed:[".","..",marker])}
        let owned=AuxBrowserFreshRootAdmission(policy:policy,generation:generation,paths:paths,roots:roots,markers:markers,records:records)
        transferred=true;try owned.revalidate();return owned
        // On any partial failure markers remain. No unlink, repair, adoption,
        // generation replay or fallback: a later process requires explicit recovery.
    }
    func revalidate()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        try policy.revalidateCurrentIdentity()
        for i in roots.indices {
            try Self.metadata(roots[i],directory:true);try Self.pathIdentity(paths[i],roots[i])
            try Self.metadata(markers[i],directory:false);try Self.entry(roots[i],Self.marker,markers[i])
            var value=stat();guard fstat(markers[i],&value)==0,value.st_size==records[i].count else{throw AuxFreshColdGuardError.metadata}
            var bytes=Data(count:records[i].count)
            let actual=bytes.withUnsafeMutableBytes{pread(markers[i],$0.baseAddress!,$0.count,0)}
            guard actual==bytes.count,bytes==records[i] else{throw AuxFreshColdGuardError.path}
        }
    }
    func receipt()throws->Data {
        try revalidate()
        var g=generation.littleEndian
        var bytes=withUnsafeBytes(of:&g){Data($0)}
        for path in paths {bytes.append(contentsOf:SHA256.hash(data:Data(path.utf8)))}
        return bytes //72 bytes, only actual current retained Owner can publish.
    }
    private static func metadata(_ fd:Int32,directory:Bool)throws {
        var value=stat();guard fstat(fd,&value)==0,value.st_uid==geteuid(),(value.st_mode&S_IFMT)==(directory ? S_IFDIR:S_IFREG),value.st_mode&0o7777==(directory ? 0o700:0o600),directory || value.st_nlink==1 else{throw AuxFreshColdGuardError.metadata}
        errno=0;let acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        if acl==nil && errno==ENOENT{return}
        guard let acl else{throw AuxFreshColdGuardError.metadata};defer{acl_free(UnsafeMutableRawPointer(acl))}
        var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry) == -1,errno==EINVAL,entry==nil else{throw AuxFreshColdGuardError.metadata}
    }
    private static func entry(_ parent:Int32,_ name:String,_ fd:Int32)throws {
        var held=stat(),actual=stat();guard fstat(fd,&held)==0,fstatat(parent,name,&actual,AT_SYMLINK_NOFOLLOW)==0,held.st_dev==actual.st_dev,held.st_ino==actual.st_ino else{throw AuxFreshColdGuardError.path}
    }
    private static func pathIdentity(_ path:String,_ fd:Int32)throws {
        guard let canonical=realpath(path,nil) else{throw AuxFreshColdGuardError.path};defer{free(canonical)}
        var located=[CChar](repeating:0,count:Int(MAXPATHLEN))
        guard String(cString:canonical)==path,fcntl(fd,F_GETPATH,&located)==0,String(cString:located)==path else{throw AuxFreshColdGuardError.path}
        var held=stat(),actual=stat();guard fstat(fd,&held)==0,lstat(path,&actual)==0,held.st_dev==actual.st_dev,held.st_ino==actual.st_ino else{throw AuxFreshColdGuardError.path}
    }
    private static func inventory(_ fd:Int32,allowed:Set<String>)throws {
        let copied=openat(fd,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard copied>=0 else{throw AuxFreshColdGuardError.io(errno)}
        guard let stream=fdopendir(copied)else{let error=errno;close(copied);throw AuxFreshColdGuardError.io(error)};defer{closedir(stream)}
        errno=0
        while let entry=readdir(stream) {
            let name=withUnsafePointer(to:&entry.pointee.d_name){$0.withMemoryRebound(to:CChar.self,capacity:Int(entry.pointee.d_namlen)+1){String(cString:$0)}}
            guard allowed.contains(name)else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState};errno=0
        }
        guard errno==0 else{throw AuxFreshColdGuardError.io(errno)}
    }
    deinit{if getpid()==process{for fd in markers+roots{close(fd)}}}
}

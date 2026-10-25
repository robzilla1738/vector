// Fresh-only split layout producer. Native authenticated policy/real home inputs
// only; no JS/env roots and no migration/adoption of previous account data.
import Foundation
import Darwin

final class AuxNativeTaskLayout {
    private static let reservationName=".aux-task-installation.v1"
    private let process=getpid()
    private let policy:AuxAuthenticatedFreshBootstrapPolicy
    private let parentPath:String
    private let name:String
    private let expected:Data
    private let parent:Int32
    private let reservation:Int32
    private let home:Int32
    private init(policy:AuxAuthenticatedFreshBootstrapPolicy,parentPath:String,name:String,expected:Data,parent:Int32,reservation:Int32,home:Int32){
        self.policy=policy;self.parentPath=parentPath;self.name=name;self.expected=expected
        self.parent=parent;self.reservation=reservation;self.home=home
    }
    // v1-v4 remain decodable evidence, but cannot admit this new split layout.
    static func openAuthenticatedParent(policy:AuxAuthenticatedFreshBootstrapPolicy)throws->Int32 {
        try policy.revalidateCurrentIdentity()
        guard let path=policy.contents.canonicalTaskParent else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        let control=policy.contents.canonicalPrivateParent
        guard path != control,!path.hasPrefix(control+"/"),!control.hasPrefix(path+"/") else{throw AuxFreshColdGuardError.path}
        guard let canonical=realpath(path,nil) else{throw AuxFreshColdGuardError.io(errno)}
        defer{free(canonical)}
        guard String(cString:canonical)==path else{throw AuxFreshColdGuardError.path}
        let fd=open(path,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
        do{try metadata(fd,directory:true);try pathIdentity(path,fd);try policy.revalidateCurrentIdentity();return fd}
        catch{close(fd);throw error}
    }
    private static func binding(policy:AuxAuthenticatedFreshBootstrapPolicy,scope:String,transaction:String,reservationHash:String)throws->(String,Data) {
        guard UUID(uuidString:transaction)?.uuidString==transaction,
              [scope,reservationHash,policy.policySha256].allSatisfy({$0.utf8.count==64 && $0.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}) else{throw NativeFreshBootstrapError.binding}
        let name="aux-task-"+transaction.lowercased()
        let bytes=try JSONSerialization.data(withJSONObject:["format":"aux.native.task-reservation.v1","taskHome":name,"controlScope":scope,"controlTransactionId":transaction,"controlReservationSha256":reservationHash,"policySha256":policy.policySha256],options:[.sortedKeys,.withoutEscapingSlashes])
        return(name,bytes)
    }
    static func create(policy:AuxAuthenticatedFreshBootstrapPolicy,home:AuxFreshNativeHome,retainedTaskParent:Int32)throws->AuxNativeTaskLayout {
        try home.validateRetainedIdentity()
        return try acquire(policy:policy,scope:home.scope,transaction:home.transactionId,reservationHash:home.currentReservationSha256(),retainedTaskParent:retainedTaskParent,create:true)
    }
    static func reopen(policy:AuxAuthenticatedFreshBootstrapPolicy,journal:NativeFreshBootstrapJournal,retainedTaskParent:Int32)throws->AuxNativeTaskLayout {
        try journal.validate()
        guard journal.policySha256==policy.policySha256 else{throw NativeFreshBootstrapError.binding}
        return try acquire(policy:policy,scope:journal.scope,transaction:journal.reservationTransactionId,reservationHash:journal.reservationSha256,retainedTaskParent:retainedTaskParent,create:false)
    }
    private static func acquire(policy:AuxAuthenticatedFreshBootstrapPolicy,scope:String,transaction:String,reservationHash:String,retainedTaskParent:Int32,create:Bool)throws->AuxNativeTaskLayout {
        // 'create' is private implementation flow, never a public admission flag.
        let checked=try openAuthenticatedParent(policy:policy);defer{close(checked)}
        try same(checked,retainedTaskParent)
        let parent=fcntl(retainedTaskParent,F_DUPFD_CLOEXEC,0)
        guard parent>=0 else{throw AuxFreshColdGuardError.io(errno)}
        var reservation:Int32 = -1,home:Int32 = -1;var transferred=false
        do {
            let(name,bytes)=try binding(policy:policy,scope:scope,transaction:transaction,reservationHash:reservationHash)
            if create{try inventory(parent,allowed:[".",".."])}
            reservation=openat(parent,reservationName,(create ? O_RDWR|O_CREAT|O_EXCL:O_RDONLY)|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK,0o600)
            guard reservation>=0 else{throw AuxFreshColdGuardError.io(errno)}
            try metadata(reservation,directory:false);try entry(parent,reservationName,reservation)
            if create {
                try sync(parent)
                try bytes.withUnsafeBytes { raw in
                    var offset=0
                    while offset<raw.count {
                        let count=Darwin.write(reservation,raw.baseAddress!.advanced(by:offset),raw.count-offset)
                        if count<0 && errno==EINTR{continue}
                        guard count>0 else{throw AuxFreshColdGuardError.io(errno)};offset += count
                    }
                }
                try sync(reservation);try sync(parent)
                guard mkdirat(parent,name,0o700)==0 else{throw AuxFreshColdGuardError.io(errno)}
            }
            home=openat(parent,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard home>=0 else{throw AuxFreshColdGuardError.io(errno)}
            try metadata(home,directory:true);try entry(parent,name,home)
            if create{try sync(home);try sync(parent);try inventory(home,allowed:[".",".."])}
            let owner=AuxNativeTaskLayout(policy:policy,parentPath:policy.contents.canonicalTaskParent!,name:name,expected:bytes,parent:parent,reservation:reservation,home:home)
            transferred=true
            try owner.revalidate()
            return owner
        }catch{if !transferred{if home>=0{close(home)};if reservation>=0{close(reservation)};close(parent)};throw error}
        // Partial durable marker/directory remains. Resume is existing-only;
        // missing/truncated/mismatched records never trigger recreation/reset.
    }
    func revalidate()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        try policy.revalidateCurrentIdentity();try Self.pathIdentity(parentPath,parent)
        try Self.metadata(parent,directory:true);try Self.metadata(reservation,directory:false);try Self.metadata(home,directory:true)
        try Self.entry(parent,Self.reservationName,reservation);try Self.entry(parent,name,home)
        var value=stat();guard fstat(reservation,&value)==0,value.st_size==expected.count,value.st_size<=4096 else{throw NativeFreshBootstrapError.binding}
        var bytes=Data(count:expected.count)
        try bytes.withUnsafeMutableBytes { raw in
            var offset=0
            while offset<raw.count {
                let count=pread(reservation,raw.baseAddress!.advanced(by:offset),raw.count-offset,off_t(offset))
                if count<0 && errno==EINTR{continue}
                guard count>0 else{throw AuxFreshColdGuardError.io(errno)};offset += count
            }
        }
        guard bytes==expected else{throw NativeFreshBootstrapError.binding}
        try Self.inventory(parent,allowed:[".","..",Self.reservationName,name])
        try Self.entry(parent,Self.reservationName,reservation);try Self.pathIdentity(parentPath,parent)
        try policy.revalidateCurrentIdentity()
    }
    func duplicateTaskHome()throws->Int32 {
        try revalidate();let fd=fcntl(home,F_DUPFD_CLOEXEC,0)
        guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
        do{try revalidate();return fd}catch{close(fd);throw error}
    }
    private static func metadata(_ fd:Int32,directory:Bool)throws {
        var value=stat();guard fstat(fd,&value)==0,value.st_uid==geteuid(),(value.st_mode&S_IFMT)==(directory ? S_IFDIR:S_IFREG),value.st_mode&0o7777==(directory ? 0o700:0o600),directory || value.st_nlink==1 else{throw AuxFreshColdGuardError.metadata}
        errno=0;let acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        if acl==nil && errno==ENOENT{return}
        guard let acl else{throw AuxFreshColdGuardError.metadata};defer{acl_free(UnsafeMutableRawPointer(acl))}
        var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry) == -1,errno==EINVAL,entry==nil else{throw AuxFreshColdGuardError.metadata}
    }
    private static func same(_ a:Int32,_ b:Int32)throws {
        var x=stat(),y=stat();guard fstat(a,&x)==0,fstat(b,&y)==0,x.st_dev==y.st_dev,x.st_ino==y.st_ino else{throw AuxFreshColdGuardError.path}
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
    private static func sync(_ fd:Int32)throws{guard fsync(fd)==0 else{throw AuxFreshColdGuardError.io(errno)}}
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
    deinit{if getpid()==process{close(home);close(reservation);close(parent)}}
}

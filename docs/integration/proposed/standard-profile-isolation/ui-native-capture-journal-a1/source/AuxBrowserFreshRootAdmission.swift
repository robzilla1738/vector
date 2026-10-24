// Standard profile isolation: paired, authenticated-owner clean shutdown permits reopen.
// Interrupted ADMITTED/partial/mixed records remain unknown; never reset user data.
import Foundation
import CryptoKit
import Darwin
final class AuxBrowserFreshRootAdmission {
    private static let marker=".aux-browser-startup-lease.v2"
    private let process=getpid()
    private let policy:AuxAuthenticatedFreshBootstrapPolicy
    private let generation:UInt64
    private let paths:[String]
    private let roots:[Int32]
    private let markers:[Int32]
    private var records:[Data]
    private let reservation:String
    private let lock=NSLock()
    private enum Phase{case prepared,admitted,clean,failed}
    private let permitsExistingData:Bool
    private let priorCleanReceipt:String
    private var pendingCleanAcknowledgement:Data?
    private var phase=Phase.prepared
    private init(policy:AuxAuthenticatedFreshBootstrapPolicy,generation:UInt64,paths:[String],roots:[Int32],markers:[Int32],records:[Data],reservation:String,permitsExistingData:Bool,priorCleanReceipt:String) {
        self.policy=policy;self.generation=generation;self.paths=paths;self.roots=roots;self.markers=markers;self.records=records;self.reservation=reservation;self.permitsExistingData=permitsExistingData;self.priorCleanReceipt=priorCleanReceipt
    }
    static func acquire(policy:AuxAuthenticatedFreshBootstrapPolicy,generation:UInt64,data:Int32,cache:Int32)throws->AuxBrowserFreshRootAdmission {
        try policy.revalidateCurrentIdentity()
        guard generation != 0,policy.contents.browserPreparedRecovery,
              let paths=policy.contents.browserStartupRoots,paths.count==2 else{throw AuxFreshColdGuardError.path}
        var roots=[Int32](),markers=[Int32](),records=[Data]();var transferred=false
        defer{if !transferred{for fd in markers+roots{close(fd)}}}
        var existing=[Bool]()
        for (i,source) in [data,cache].enumerated() {
            let root=fcntl(source,F_DUPFD_CLOEXEC,0)
            guard root>=0 else{throw AuxFreshColdGuardError.io(errno)};roots.append(root)
            try metadata(root,directory:true);try pathIdentity(paths[i],root)
            // Existing contents are considered only after BOTH exact records
            // establish clean provenance. Missing markers still require emptiness.
            var st=stat();let status=fstatat(root,marker,&st,AT_SYMLINK_NOFOLLOW)
            if status != 0 && errno != ENOENT{throw AuxFreshColdGuardError.io(errno)}
            existing.append(status==0)
        }
        guard existing[0]==existing[1] else{throw AuxFreshColdGuardError.path}
        let reopening=existing[0]
        for root in roots {
            let fd=openat(root,marker,O_RDWR|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK|(reopening ? 0:O_CREAT|O_EXCL),0o600)
            guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)};markers.append(fd)
            try metadata(fd,directory:false);try entry(root,marker,fd)
            guard flock(fd,LOCK_EX|LOCK_NB)==0 else{throw AuxFreshColdGuardError.installerBusy}
        }
        // Locks exclude concurrent Aux owners, never prove writer settlement.
        var permitsExistingData=false,priorCleanReceipt=""
        let reservation:String
        if reopening {
            for fd in markers {records.append(try readRecord(fd))}
            let first=try decodeRecord(records[0],policy:policy,role:1,root:roots[0])
            let second=try decodeRecord(records[1],policy:policy,role:2,root:roots[1])
            guard first==second else{throw AuxFreshColdGuardError.path}
            guard first.phase=="prepared" || first.phase=="clean" else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            permitsExistingData=first.existing || first.phase=="clean"
            priorCleanReceipt=first.cleanReceipt
            reservation=first.phase=="clean" ? UUID().uuidString:first.reservation
            if !permitsExistingData {for root in roots{try inventory(root,allowed:[".","..",marker])}}
        }else {
            for root in roots{try inventory(root,allowed:[".","..",marker])}
            reservation=UUID().uuidString
        }
        // Explicit canonical v2 PREPARED -> v3 migration; v2 ADMITTED cannot
        // reach here. Consume clean provenance before granting any browser work.
        records=[]
        for i in roots.indices {
            let record=try bindingV3(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"prepared",existing:permitsExistingData,cleanReceipt:priorCleanReceipt)
            try writeRecord(record,fd:markers[i]);guard fsync(roots[i])==0 else{throw AuxFreshColdGuardError.io(errno)}
            records.append(record)
        }
        let owned=AuxBrowserFreshRootAdmission(policy:policy,generation:generation,paths:paths,roots:roots,markers:markers,records:records,reservation:reservation,permitsExistingData:permitsExistingData,priorCleanReceipt:priorCleanReceipt)
        transferred=true;try owned.revalidate();return owned
        // Missing/mixed/truncated/mismatched records never recreate or reset.
    }
    private static func binding(policy:AuxAuthenticatedFreshBootstrapPolicy,role:Int,root:Int32,reservation:String,generation:UInt64,phase:String)throws->Data {
        var value=stat();guard fstat(root,&value)==0 else{throw AuxFreshColdGuardError.metadata}
        return try JSONSerialization.data(withJSONObject:["format":"aux.browser.recoverable-root-lease.v2","policySha256":policy.policySha256,"role":role,"device":String(value.st_dev),"inode":String(value.st_ino),"generation":String(generation),"reservation":reservation,"phase":phase],options:[.sortedKeys,.withoutEscapingSlashes])
    }
    private struct Stored:Equatable {
        let reservation:String
        let generation:UInt64
        let phase:String
        let existing:Bool
        let cleanReceipt:String
    }
    private static func bindingV3(policy:AuxAuthenticatedFreshBootstrapPolicy,role:Int,root:Int32,reservation:String,generation:UInt64,phase:String,existing:Bool,cleanReceipt:String)throws->Data {
        var value=stat();guard fstat(root,&value)==0 else{throw AuxFreshColdGuardError.metadata}
        return try JSONSerialization.data(withJSONObject:["format":"aux.browser.recoverable-root-lease.v3","policySha256":policy.policySha256,"role":role,"device":String(value.st_dev),"inode":String(value.st_ino),"generation":String(generation),"reservation":reservation,"phase":phase,"existingData":existing,"cleanReceiptSha256":cleanReceipt],options:[.sortedKeys,.withoutEscapingSlashes])
    }
    private static func decodeRecord(_ record:Data,policy:AuxAuthenticatedFreshBootstrapPolicy,role:Int,root:Int32)throws->Stored {
        let object=try strictEnvelopeObject(record)
        guard let reservation=object["reservation"] as? String,UUID(uuidString:reservation)?.uuidString==reservation,
              let g=object["generation"] as? String,let generation=UInt64(g),generation>0,String(generation)==g else{throw AuxFreshColdGuardError.path}
        if object["format"] as? String == "aux.browser.recoverable-root-lease.v2" {
            guard record == (try binding(policy:policy,role:role,root:root,reservation:reservation,generation:generation,phase:"prepared")) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            return Stored(reservation:reservation,generation:generation,phase:"prepared",existing:false,cleanReceipt:"")
        }
        guard let phase=object["phase"] as? String,["prepared","admitted","clean"].contains(phase),
              let existing=object["existingData"] as? Bool,let receipt=object["cleanReceiptSha256"] as? String,
              receipt.isEmpty || (receipt.count==64 && receipt.allSatisfy({"0123456789abcdef".contains($0)})),
              !(existing || phase=="clean") || !receipt.isEmpty,
              record == (try bindingV3(policy:policy,role:role,root:root,reservation:reservation,generation:generation,phase:phase,existing:existing,cleanReceipt:receipt)) else{throw AuxFreshColdGuardError.path}
        return Stored(reservation:reservation,generation:generation,phase:phase,existing:existing,cleanReceipt:receipt)
    }
    private static func readRecord(_ fd:Int32)throws->Data {
        var st=stat();guard fstat(fd,&st)==0,st.st_size>0,st.st_size<=4096 else{throw AuxFreshColdGuardError.metadata}
        var data=Data(count:Int(st.st_size));var offset=0
        try data.withUnsafeMutableBytes {raw in
            while offset<raw.count {
                let n=pread(fd,raw.baseAddress!.advanced(by:offset),raw.count-offset,off_t(offset))
                if n<0 && errno==EINTR{continue};guard n>0 else{throw AuxFreshColdGuardError.io(errno)};offset += n
            }
        };return data
    }
    private static func writeRecord(_ record:Data,fd:Int32)throws {
        guard ftruncate(fd,0)==0 else{throw AuxFreshColdGuardError.io(errno)}
        try record.withUnsafeBytes {raw in
            var offset=0
            while offset<raw.count {
                let n=pwrite(fd,raw.baseAddress!.advanced(by:offset),raw.count-offset,off_t(offset))
                if n<0 && errno==EINTR{continue};guard n>0 else{throw AuxFreshColdGuardError.io(errno)};offset += n
            }
        }
        guard fsync(fd)==0 else{throw AuxFreshColdGuardError.io(errno)}
    }
    // Both inventories are checked together while this Owner still withholds
    // the first browser grant. Use only its retained authenticated root FDs.
    private func validateStartupInventoriesLocked()throws {
        if !permitsExistingData {for root in roots{try Self.inventory(root,allowed:[".","..",Self.marker])}}
    }
    private func validateLocked()throws {
        guard phase != .failed else{throw AuxFreshColdGuardError.path}
        try policy.revalidateCurrentIdentity()
        for i in roots.indices {
            try Self.metadata(roots[i],directory:true);try Self.pathIdentity(paths[i],roots[i])
            try Self.metadata(markers[i],directory:false);try Self.entry(roots[i],Self.marker,markers[i])
            guard try Self.readRecord(markers[i])==records[i] else{throw AuxFreshColdGuardError.path}
        }
        if phase == .prepared {
            // An observed unexpected entry permanently refuses this startup
            // Owner; removing the entry later cannot turn it into a grant.
            do{try validateStartupInventoriesLocked()}catch{phase = .failed;throw error}
        }
    }
    func revalidate()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()};try validateLocked()
    }
    // Read-only: journal copies cannot invalidate the fresh PREPARED inventory.
    func verifyUiCaptureJournalAdmission()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()}
        try validateLocked()
        guard phase == .admitted else{throw AuxFreshColdGuardError.path}
    }
    func receipt()throws->Data {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()};try validateLocked()
        guard phase == .prepared || phase == .admitted else{throw AuxFreshColdGuardError.path}
        if phase == .prepared {
            // Poison BEFORE any durable write. A late/partial result cannot be
            // retried into a fresh grant, and no receipt leaves before both fsyncs.
            phase = .failed
            var admitted=[Data]()
            for i in roots.indices {
                if !permitsExistingData {try Self.inventory(roots[i],allowed:[".","..",Self.marker])}
                let record=try Self.bindingV3(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"admitted",existing:permitsExistingData,cleanReceipt:priorCleanReceipt)
                try Self.writeRecord(record,fd:markers[i]);admitted.append(record)
            }
            records=admitted;phase = .admitted
            do {
                try validateLocked()
                // The first root may have changed while the other marker was
                // written. Recheck the entire pair after both durable writes
                // and before any receipt bytes can leave this Owner.
                try validateStartupInventoriesLocked()
            }catch{phase = .failed;throw error}
        }
        var g=generation.littleEndian
        var bytes=withUnsafeBytes(of:&g){Data($0)}
        for path in paths {bytes.append(contentsOf:SHA256.hash(data:Data(path.utf8)))}
        return bytes
    }
    // Called only by the retained authenticated Owner after registry admission
    // is closed and every daemon/worker/utility writer has physically settled.
    // The peer method independently demands an authenticated all-browser report;
    // caller-supplied records, masks, PIDs and elapsed time cannot mint one.
    func completeCleanShutdown(peer:AuxLiveNativeParentConnection)throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()};try validateLocked()
        if phase == .clean {
            guard let report=pendingCleanAcknowledgement else{return}
            try peer.acknowledgeBrowserDrainReceipt(report)
            pendingCleanAcknowledgement=nil;return
        }
        guard phase == .admitted else{throw AuxFreshColdGuardError.path}
        let report=try peer.authenticatedBrowserDrainReceipt(generation:generation)
        try validateLocked()
        let digest=SHA256.hash(data:report).map{String(format:"%02x",$0)}.joined()
        phase = .failed // partial writes stay unknown; never retry into CLEAN
        var clean=[Data]()
        for i in roots.indices {
            let record=try Self.bindingV3(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"clean",existing:true,cleanReceipt:digest)
            try Self.writeRecord(record,fd:markers[i]);guard fsync(roots[i])==0 else{throw AuxFreshColdGuardError.io(errno)}
            clean.append(record)
        }
        records=clean;phase = .clean;pendingCleanAcknowledgement=report
        do{try validateLocked()}catch{phase = .failed;throw error}
        // This ACK informs the parent of already durable CLEAN. Its loss keeps
        // the parent observer unknown; it cannot undo physical settled writes.
        // Retain the exact report for idempotent ACK retry, never rewrite CLEAN.
        try peer.acknowledgeBrowserDrainReceipt(report)
        pendingCleanAcknowledgement=nil
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

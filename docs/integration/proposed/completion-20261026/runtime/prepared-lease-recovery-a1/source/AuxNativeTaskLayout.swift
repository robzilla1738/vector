// Fresh-only split layout producer. Native authenticated policy/real home inputs
// only; no JS/env roots and no migration/adoption of previous account data.
import Foundation
import Darwin
@_silgen_name("AuxOrdinaryPriorBrowserHasExited")
private func memoryHelperPriorProcessExited(_ pid:Int32,_ seconds:UInt64,_ microseconds:UInt64)->Int32

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
    // Read-only before browser lease markers are acquired. These descriptors
    // come from the actual authenticated policy/native guard, never a path or
    // caller readiness flag. Existing records must prove the same real pair.
    static func preflightExistingPair(policy:AuxAuthenticatedFreshBootstrapPolicy,
        retainedControlParent:Int32,retainedTaskParent:Int32)throws {
        try policy.revalidateCurrentIdentity()
        let checked=try openAuthenticatedParent(policy:policy);defer{close(checked)}
        try same(checked,retainedTaskParent)
        try metadata(retainedControlParent,directory:true)
        try pathIdentity(policy.contents.canonicalPrivateParent,retainedControlParent)
        var control=stat(),task=stat()
        let controlStatus=fstatat(retainedControlParent,AuxFreshNativeHome.reservationName,&control,AT_SYMLINK_NOFOLLOW)
        guard controlStatus==0 || errno==ENOENT else{throw AuxFreshColdGuardError.io(errno)}
        let taskStatus=fstatat(retainedTaskParent,reservationName,&task,AT_SYMLINK_NOFOLLOW)
        guard taskStatus==0 || errno==ENOENT else{throw AuxFreshColdGuardError.io(errno)}
        guard (controlStatus==0)==(taskStatus==0) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        if controlStatus != 0 {
            try inventory(retainedTaskParent,allowed:[".",".."])
        }else{
            let home=try AuxResumedFreshNativeHome.reopen(policy:policy,retainedParentDescriptor:retainedControlParent)
            // Use the actual existing-only TaskLayout owner/codec. It verifies
            // raw reservation bytes, scope, transaction, policy hash and home
            // topology; create:false is private native flow and never replays.
            let layout=try acquire(policy:policy,scope:home.scope,transaction:home.transactionId,
                reservationHash:home.currentReservationSha256(),retainedTaskParent:retainedTaskParent,create:false)
            try layout.requireNoUnresolvedMemoryHelperLifetimes();try home.validateRetainedIdentity()
        }
        try pathIdentity(policy.contents.canonicalPrivateParent,retainedControlParent)
        try same(checked,retainedTaskParent);try policy.revalidateCurrentIdentity()
    }
    // Startup-only. A live current owner may legitimately have a helper; normal
    // revalidation must not invoke this prior-owner custody observation.
    func requireNoUnresolvedMemoryHelperLifetimes()throws {
        try revalidate()
        let processes=try Self.memoryHelperProcesses(home:home,expected:expected)
        for process in processes {
            guard memoryHelperPriorProcessExited(process.pid,process.seconds,process.microseconds)==1 else {
                throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
            }
        }
        for process in try Self.nativeHostProcesses(home:home,expected:expected) {
            guard memoryHelperPriorProcessExited(process.pid,process.seconds,process.microseconds)==1 else {
                throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
            }
        }
        for process in try Self.memoryHelperProcesses(home:home,expected:expected,family:.computerUse) {
            guard memoryHelperPriorProcessExited(process.pid,process.seconds,process.microseconds)==1 else {
                throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
            }
        }
        try Self.requireNoInterruptedFixedAddonOutputs(home:home)
        try revalidate()
    }
    // Finite fixed-image staging format. Startup is read-only: even a published
    // prior invocation is preserved until its interrupted producer/publication
    // has been reviewed. PID absence never manufactures callback settlement.
    private static func requireNoInterruptedFixedAddonOutputs(home:Int32)throws {
        do {
            let name="fixed-addon-outputs"
            let directory=openat(home,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            if directory<0 {
                var missing=stat()
                guard errno==ENOENT,fstatat(home,name,&missing,AT_SYMLINK_NOFOLLOW)<0,errno==ENOENT else{throw AuxFreshColdGuardError.path}
                return
            }
            defer{close(directory)}
            try metadata(directory,directory:true);try entry(home,name,directory)
            let marker=openat(directory,"format",O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard marker>=0 else{throw AuxFreshColdGuardError.path};defer{close(marker)}
            try metadata(marker,directory:false);try entry(directory,"format",marker)
            let expected=Data("aux.fixed-addon-output-staging.v1\n".utf8)
            var before=stat();guard fstat(marker,&before)==0,before.st_size==expected.count else{throw AuxFreshColdGuardError.metadata}
            var bytes=Data(count:expected.count)
            let count=bytes.withUnsafeMutableBytes{pread(marker,$0.baseAddress,$0.count,0)}
            var after=stat()
            guard count==expected.count,bytes==expected,fstat(marker,&after)==0,
                  before.st_dev==after.st_dev,before.st_ino==after.st_ino,before.st_size==after.st_size,
                  before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
                  before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw AuxFreshColdGuardError.metadata}
            try inventory(directory,allowed:[".","..","format"])
            try metadata(directory,directory:true);try entry(directory,"format",marker);try entry(home,name,directory)
        }catch {
            fputs("Aux fixed-addon output staging is interrupted or unknown; all bytes were preserved. Review the fixed-addon-outputs directory before retrying startup.\n",stderr)
            throw AuxFixedAddonOutputRecoveryError.interruptedOutputPreserved
        }
    }
    private struct MemoryHelperProcess {
        let pid:Int32
        let seconds:UInt64
        let microseconds:UInt64
    }
    private enum FiniteHelperFamily {
        case memory,computerUse
        var directory:String {self == .memory ? ".aux-memory-helper-lifetimes.v1":".aux-computer-use-helper-lifetimes.v1"}
        var format:String {self == .memory ? "aux.memory.helper-lifetime.v1":"aux.computer-use.helper-lifetime.v1"}
    }
    // Decoder yields kernel queries, never a clean/ready flag. Persisted PID,
    // account and generation fields are data; only the native process observer
    // can establish that each original finite process has actually exited.
    private static func decodeMemoryHelperProcesses(_ bytes:Data,filename:String,expected:Data,family:FiniteHelperFamily = .memory)throws->[MemoryHelperProcess] {
        let record=try strictEnvelopeObject(bytes),binding=try strictEnvelopeObject(expected)
        func text(_ object:[String:Any],_ key:String)throws->String {
            guard let value=object[key] as? String else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState};return value
        }
        func unsigned(_ object:[String:Any],_ key:String,_ maximum:UInt64,_ minimum:UInt64=0)throws->UInt64 {
            let raw=try text(object,key)
            guard let value=UInt64(raw),String(value)==raw,value>=minimum,value<=maximum else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState};return value
        }
        func canonicalUuid(_ object:[String:Any],_ key:String,lowercase:Bool=false)throws->String {
            let raw=try text(object,key)
            guard let value=UUID(uuidString:raw),(lowercase ? value.uuidString.lowercased():value.uuidString)==raw else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState};return raw
        }
        func hash(_ key:String)throws {
            let raw=try text(record,key)
            guard raw.utf8.count==64,raw.utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        }
        func process(_ key:String)throws->MemoryHelperProcess {
            guard let value=record[key] as? [String:Any],Set(value.keys)==["pid","seconds","microseconds"] else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            return try .init(pid:Int32(unsigned(value,"pid",UInt64(Int32.max),2)),seconds:unsigned(value,"seconds",UInt64.max,1),microseconds:unsigned(value,"microseconds",999_999))
        }
        guard try text(record,"format")==family.format else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        let lease=try canonicalUuid(record,"leaseId",lowercase:true)
        guard filename==lease+".json" else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        for key in ["controlScope","controlReservationSha256","policySha256","profilePathSha256","recordSha256"] {try hash(key)}
        _=try canonicalUuid(record,"controlTransactionId")
        _=try canonicalUuid(record,"accountIncarnation");_=try canonicalUuid(record,"profileId")
        for key in ["controlScope","controlTransactionId","controlReservationSha256","policySha256"] {
            guard try text(record,key)==text(binding,key) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        }
        _=try unsigned(record,"transportGeneration",UInt64.max,1)
        _=try unsigned(record,"accountId",9_007_199_254_740_991)
        let phase=try text(record,"phase")
        let base:Set<String>=["format","leaseId","controlScope","controlTransactionId","controlReservationSha256","policySha256","transportGeneration","accountId","accountIncarnation","profileId","profilePathSha256","recordSha256","daemon","browser","phase"]
        let extra:Set<String>
        switch phase {
        case "prepared":extra=[]
        case "spawned":extra=["helper"]
        case "reaped":extra=["helper","waitStatus"]
        case "not-spawned":extra=["spawnError"]
        default:throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
        }
        guard Set(record.keys)==base.union(extra) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        let daemon=try process("daemon"),browser=try process("browser")
        guard daemon.pid != browser.pid else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        // A missing PID publication can hide a successful suspended spawn, and
        // parent absence alone cannot resolve that. A hidden memory helper is
        // still a live aux-memory process (reparented to launchd), so only a
        // complete census with none settles it; the caller then requires the
        // recorded daemon and browser to have exited.
        if phase=="prepared" {
            guard family == .memory,noLiveMemoryHelperImage() else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            return [daemon,browser]
        }
        if phase=="not-spawned" {
            _=try unsigned(record,"spawnError",UInt64(Int32.max),1)
            return [daemon,browser]
        }
        let helper=try process("helper")
        guard helper.pid != daemon.pid,helper.pid != browser.pid else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        if phase=="reaped" {
            let raw=try text(record,"waitStatus")
            guard let value=Int32(raw),String(value)==raw else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        }
        return [daemon,browser,helper]
    }
    // False unless every same-user process path was read and none is aux-memory.
    private static func noLiveMemoryHelperImage()->Bool {
        let estimate=proc_listallpids(nil,0)
        guard estimate>0 else{return false}
        var pids=[pid_t](repeating:0,count:Int(estimate)+256)
        let count=proc_listallpids(&pids,Int32(pids.count*MemoryLayout<pid_t>.size))
        guard count>0,Int(count)<pids.count else{return false}
        var path=[CChar](repeating:0,count:4096)
        for pid in pids.prefix(Int(count)) where pid>0 {
            var info=proc_bsdinfo()
            let size=proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&info,Int32(MemoryLayout<proc_bsdinfo>.size))
            if size<=0 {continue}  // exited, or not visible to this user
            guard size==Int32(MemoryLayout<proc_bsdinfo>.size) else{return false}
            if info.pbi_uid != geteuid() {continue}
            guard proc_pidpath(pid,&path,UInt32(path.count))>0 else{return false}
            if String(cString:path).hasSuffix("/aux-memory") {return false}
        }
        return true
    }
    private static func memoryHelperRecordNames(_ directory:Int32)throws->Set<String> {
        let copied=openat(directory,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard copied>=0 else{throw AuxFreshColdGuardError.io(errno)}
        guard let stream=fdopendir(copied)else{let error=errno;close(copied);throw AuxFreshColdGuardError.io(error)};defer{closedir(stream)}
        var names=Set<String>();errno=0
        while let item=readdir(stream) {
            let name=withUnsafePointer(to:&item.pointee.d_name){$0.withMemoryRebound(to:CChar.self,capacity:Int(item.pointee.d_namlen)+1){String(cString:$0)}}
            if name != "." && name != ".." {
                guard name.hasSuffix(".json"),let id=UUID(uuidString:String(name.dropLast(5))),id.uuidString.lowercased()+".json"==name,
                      names.insert(name).inserted,names.count<=256 else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            }
            errno=0
        }
        guard errno==0 else{throw AuxFreshColdGuardError.io(errno)};return names
    }
    private static func memoryHelperProcesses(home:Int32,expected:Data,family:FiniteHelperFamily = .memory)throws->[MemoryHelperProcess] {
        let memoryHelperDirectory=family.directory
        let directory=openat(home,memoryHelperDirectory,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        if directory<0 {
            guard errno==ENOENT else{throw AuxFreshColdGuardError.io(errno)}
            var absent=stat();guard fstatat(home,memoryHelperDirectory,&absent,AT_SYMLINK_NOFOLLOW) != 0,errno==ENOENT else{throw AuxFreshColdGuardError.path}
            return []
        }
        defer{close(directory)}
        try metadata(directory,directory:true);try entry(home,memoryHelperDirectory,directory)
        let names=try memoryHelperRecordNames(directory);var processes=[MemoryHelperProcess]()
        for name in names.sorted() {
            let fd=openat(directory,name,O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
            defer{close(fd)}
            try metadata(fd,directory:false);try entry(directory,name,fd)
            var before=stat();guard fstat(fd,&before)==0,before.st_size>0,before.st_size<=16_384 else{throw AuxFreshColdGuardError.metadata}
            var bytes=Data(count:Int(before.st_size))
            try bytes.withUnsafeMutableBytes { raw in
                var offset=0
                while offset<raw.count {
                    let count=pread(fd,raw.baseAddress!.advanced(by:offset),raw.count-offset,off_t(offset))
                    if count<0 && errno==EINTR{continue}
                    guard count>0 else{throw AuxFreshColdGuardError.io(errno)};offset += count
                }
            }
            var after=stat();guard fstat(fd,&after)==0,before.st_dev==after.st_dev,before.st_ino==after.st_ino,
                before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
                before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw AuxFreshColdGuardError.metadata}
            try metadata(fd,directory:false);try entry(directory,name,fd)
            processes += try decodeMemoryHelperProcesses(bytes,filename:name,expected:expected,family:family)
        }
        guard try memoryHelperRecordNames(directory)==names else{throw AuxFreshColdGuardError.path}
        try metadata(directory,directory:true);try entry(home,memoryHelperDirectory,directory)
        return processes
    }
    private struct NativeHostProcess {
        let pid:Int32
        let seconds:UInt64
        let microseconds:UInt64
    }
    private static let nativeHostDirectory=".aux-native-host-lifetimes.v1"
    // Decoder yields kernel queries, never a clean/ready flag. Persisted PID,
    // account and generation fields are data; only the native process observer
    // can establish that each original finite process has actually exited.
    private static func decodeNativeHostProcesses(_ bytes:Data,filename:String,expected:Data)throws->[NativeHostProcess] {
        let record=try strictEnvelopeObject(bytes),binding=try strictEnvelopeObject(expected)
        func text(_ object:[String:Any],_ key:String)throws->String {
            guard let value=object[key] as? String else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState};return value
        }
        func unsigned(_ object:[String:Any],_ key:String,_ maximum:UInt64,_ minimum:UInt64=0)throws->UInt64 {
            let raw=try text(object,key)
            guard let value=UInt64(raw),String(value)==raw,value>=minimum,value<=maximum else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState};return value
        }
        func canonicalUuid(_ object:[String:Any],_ key:String,lowercase:Bool=false)throws->String {
            let raw=try text(object,key)
            guard let value=UUID(uuidString:raw),(lowercase ? value.uuidString.lowercased():value.uuidString)==raw else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState};return raw
        }
        func hash(_ key:String)throws {
            let raw=try text(record,key)
            guard raw.utf8.count==64,raw.utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        }
        func process(_ key:String)throws->NativeHostProcess {
            guard let value=record[key] as? [String:Any],Set(value.keys)==["pid","seconds","microseconds"] else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            return try .init(pid:Int32(unsigned(value,"pid",UInt64(Int32.max),2)),seconds:unsigned(value,"seconds",UInt64.max,1),microseconds:unsigned(value,"microseconds",999_999))
        }
        guard try text(record,"format")=="aux.native-host-lifetime.v1" else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        let lease=try canonicalUuid(record,"leaseId",lowercase:true)
        guard filename==lease+".json" else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        for key in ["controlScope","controlReservationSha256","policySha256","profilePathSha256","recordSha256","extensionOriginSha256","nativeHostNameSha256","hostImageSha256"] {try hash(key)}
        _=try canonicalUuid(record,"controlTransactionId")
        _=try canonicalUuid(record,"accountIncarnation");_=try canonicalUuid(record,"profileId");_=try canonicalUuid(record,"intentId",lowercase:true)
        for key in ["controlScope","controlTransactionId","controlReservationSha256","policySha256"] {
            guard try text(record,key)==text(binding,key) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        }
        _=try unsigned(record,"transportGeneration",UInt64.max,1)
        _=try unsigned(record,"accountId",9_007_199_254_740_991)
        let phase=try text(record,"phase")
        let base:Set<String>=["format","leaseId","controlScope","controlTransactionId","controlReservationSha256","policySha256","transportGeneration","accountId","accountIncarnation","profileId","profilePathSha256","recordSha256","daemon","browser","phase","extensionOriginSha256","nativeHostNameSha256","hostImageSha256","intentId"]
        let extra:Set<String>
        switch phase {
        case "prepared":extra=[]
        case "spawned":extra=["helper"]
        case "reaped":extra=["helper","waitStatus"]
        case "not-spawned":extra=["spawnError"]
        default:throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
        }
        guard Set(record.keys)==base.union(extra) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        let daemon=try process("daemon"),browser=try process("browser")
        guard daemon.pid != browser.pid else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        // A missing PID publication can hide a successful suspended spawn.
        // Parent absence alone cannot resolve that uncertainty.
        guard phase != "prepared" else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        if phase=="not-spawned" {
            _=try unsigned(record,"spawnError",UInt64(Int32.max),1)
            return [daemon,browser]
        }
        let helper=try process("helper")
        guard helper.pid != daemon.pid,helper.pid != browser.pid else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        if phase=="reaped" {
            let raw=try text(record,"waitStatus")
            guard let value=Int32(raw),String(value)==raw else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        }
        return [daemon,browser,helper]
    }
    private static func nativeHostRecordNames(_ directory:Int32)throws->Set<String> {
        let copied=openat(directory,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard copied>=0 else{throw AuxFreshColdGuardError.io(errno)}
        guard let stream=fdopendir(copied)else{let error=errno;close(copied);throw AuxFreshColdGuardError.io(error)};defer{closedir(stream)}
        var names=Set<String>();errno=0
        while let item=readdir(stream) {
            let name=withUnsafePointer(to:&item.pointee.d_name){$0.withMemoryRebound(to:CChar.self,capacity:Int(item.pointee.d_namlen)+1){String(cString:$0)}}
            if name != "." && name != ".." {
                guard name.hasSuffix(".json"),let id=UUID(uuidString:String(name.dropLast(5))),id.uuidString.lowercased()+".json"==name,
                      names.insert(name).inserted,names.count<=256 else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            }
            errno=0
        }
        guard errno==0 else{throw AuxFreshColdGuardError.io(errno)};return names
    }
    private static func nativeHostProcesses(home:Int32,expected:Data)throws->[NativeHostProcess] {
        let directory=openat(home,nativeHostDirectory,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        if directory<0 {
            guard errno==ENOENT else{throw AuxFreshColdGuardError.io(errno)}
            var absent=stat();guard fstatat(home,nativeHostDirectory,&absent,AT_SYMLINK_NOFOLLOW) != 0,errno==ENOENT else{throw AuxFreshColdGuardError.path}
            return []
        }
        defer{close(directory)}
        try metadata(directory,directory:true);try entry(home,nativeHostDirectory,directory)
        let names=try nativeHostRecordNames(directory);var processes=[NativeHostProcess]()
        for name in names.sorted() {
            let fd=openat(directory,name,O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
            defer{close(fd)}
            try metadata(fd,directory:false);try entry(directory,name,fd)
            var before=stat();guard fstat(fd,&before)==0,before.st_size>0,before.st_size<=16_384 else{throw AuxFreshColdGuardError.metadata}
            var bytes=Data(count:Int(before.st_size))
            try bytes.withUnsafeMutableBytes { raw in
                var offset=0
                while offset<raw.count {
                    let count=pread(fd,raw.baseAddress!.advanced(by:offset),raw.count-offset,off_t(offset))
                    if count<0 && errno==EINTR{continue}
                    guard count>0 else{throw AuxFreshColdGuardError.io(errno)};offset += count
                }
            }
            var after=stat();guard fstat(fd,&after)==0,before.st_dev==after.st_dev,before.st_ino==after.st_ino,
                before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,
                before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw AuxFreshColdGuardError.metadata}
            try metadata(fd,directory:false);try entry(directory,name,fd)
            processes += try decodeNativeHostProcesses(bytes,filename:name,expected:expected)
        }
        guard try nativeHostRecordNames(directory)==names else{throw AuxFreshColdGuardError.path}
        try metadata(directory,directory:true);try entry(home,nativeHostDirectory,directory)
        return processes
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
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func revalidateRetainedIdentity()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        try Self.pathIdentity(parentPath,parent)
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
    }
    func duplicateRetainedTaskHome()throws->Int32 {
        try revalidateRetainedIdentity()
        let fd=fcntl(home,F_DUPFD_CLOEXEC,0)
        guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
        do{try revalidateRetainedIdentity();return fd}catch{close(fd);throw error}
    }
#endif
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

// Actionable recovery identity; no automatic cleanup/replay or ready flag.
enum AuxFixedAddonOutputRecoveryError:Error {case interruptedOutputPreserved}

// Native main-service memory scope only; never a general task/exec grant.
import Foundation
import CoreFoundation
import CryptoKit
import Darwin

enum AuxMemoryAccountError:Error {case unavailable,changed,unsafeDirectory,exhausted}
struct AuxMemoryAccountIdentity:Equatable {
    let accountId:Int64
    let incarnation:UUID
    let profileId:UUID
    let profilePathSha256:Data
    let recordSha256:Data
    static func decode(_ bytes:Data,account:Int64)throws->Self {
        guard account>=0,account<=9_007_199_254_740_991,bytes.count<=4*1024*1024 else{throw AuxMemoryAccountError.unavailable}
        let registry=try strictEnvelopeObject(bytes)
        func integer(_ value:Any?)->Int64? {
            guard let n=value as? NSNumber,CFGetTypeID(n) != CFBooleanGetTypeID(),n.doubleValue>=0,
                  n.doubleValue<=9_007_199_254_740_991,n.doubleValue.rounded()==n.doubleValue else{return nil}
            return n.int64Value
        }
        guard integer(registry["version"])==1,let accounts=registry["accounts"] as? [[String:Any]],accounts.count<=4096,
              let bindings=registry["profileAccountBindings"] as? [String:Any],bindings.count<=4096 else{throw AuxMemoryAccountError.unavailable}
        var ids=Set<Int64>()
        for row in accounts {guard let id=integer(row["id"]),ids.insert(id).inserted else{throw AuxMemoryAccountError.unavailable}}
        let selected=accounts.filter{integer($0["id"])==account}
        guard selected.count==1,let rawIncarnation=selected[0]["incarnationId"] as? String,
              let incarnation=UUID(uuidString:rawIncarnation),integer(selected[0]["createdAt"]) != nil,
              let mode=selected[0]["mode"] as? String,["local","cloud"].contains(mode),
              let provider=selected[0]["provider"] as? String,["anonymous","email","google"].contains(provider)
        else{throw AuxMemoryAccountError.unavailable}
        var matching=[(String,[String:Any])]()
        for (key,value) in bindings {
            guard let row=value as? [String:Any],let id=integer(row["accountId"]) else{throw AuxMemoryAccountError.unavailable}
            if id==account{matching.append((key,row))}
        }
        guard matching.count==1,let profile=UUID(uuidString:matching[0].0),
              matching[0].1["profileId"] as? String==matching[0].0,
              let path=matching[0].1["profilePath"] as? String,path.hasPrefix("/"),path.utf8.count<4096,!path.utf8.contains(0),
              integer(matching[0].1["updatedAt"]) != nil else{throw AuxMemoryAccountError.unavailable}
        // Display names, email/plan metadata and unrelated current selection
        // cannot retarget a helper. These are the actual ownership/epoch facts.
        var ownership=[String:Any]()
        for key in ["id","mode","provider","userId","authStatus","createdAt","incarnationId"] {if let value=selected[0][key]{ownership[key]=value}}
        let accountBytes=try JSONSerialization.data(withJSONObject:ownership,options:[.sortedKeys,.withoutEscapingSlashes])
        let bindingBytes=try JSONSerialization.data(withJSONObject:matching[0].1,options:[.sortedKeys,.withoutEscapingSlashes])
        var sealed=Data("aux.memory.registered-account.v1\0".utf8)
        for value in [accountBytes,bindingBytes] {
            var count=UInt64(value.count).littleEndian
            withUnsafeBytes(of:&count){sealed.append(contentsOf:$0)};sealed.append(value)
        }
        return .init(accountId:account,incarnation:incarnation,profileId:profile,
                     profilePathSha256:Data(SHA256.hash(data:Data(path.utf8))),recordSha256:Data(SHA256.hash(data:sealed)))
    }
}

// Actual held root/entry descriptors; paths are derived from native FDs only.
final class AuxRegisteredMemoryAccountOwner {
    private let process=getpid()
    let identity:AuxMemoryAccountIdentity
    let transportGeneration:UInt64
    private let taskRootIndex:Int
    private struct Directory {
        let descriptor:Int32
        let path:String
        let captured:stat
    }
    private var directories=[Directory]()
    private let memoryIndex:Int
    init(identity:AuxMemoryAccountIdentity,controlRoot:Int32,taskRoot:Int32,transportGeneration:UInt64)throws {
        guard transportGeneration>0 else{throw AuxMemoryAccountError.unavailable}
        self.identity=identity;self.transportGeneration=transportGeneration
        var held=[Directory]()
        func capture(_ fd:Int32)throws->Directory {
            let value=try Self.metadata(fd)
            var name=[CChar](repeating:0,count:Int(PATH_MAX))
            guard fcntl(fd,F_GETPATH,&name)==0 else{throw AuxMemoryAccountError.unsafeDirectory}
            let path=String(cString:name)
            let directory=Directory(descriptor:fd,path:path,captured:value)
            try Self.revalidate(directory);return directory
        }
        func root(_ original:Int32)throws->Int32 {
            let fd=fcntl(original,F_DUPFD_CLOEXEC,0);guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory}
            do{held.append(try capture(fd));return fd}catch{close(fd);throw error}
        }
        func child(_ parent:Int32,_ name:String)throws->Int32 {
            let fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory}
            do {
                let directory=try capture(fd);var entry=stat()
                guard fstatat(parent,name,&entry,AT_SYMLINK_NOFOLLOW)==0,
                      entry.st_dev==directory.captured.st_dev,entry.st_ino==directory.captured.st_ino else{throw AuxMemoryAccountError.unsafeDirectory}
                held.append(directory);return fd
            }catch{close(fd);throw error}
        }
        do {
            let control=try root(controlRoot),controlUsers=try child(control,"u")
            _ = try child(controlUsers,String(identity.accountId))
            let taskIndex=held.count
            let task=try root(taskRoot),taskUsers=try child(task,"u"),account=try child(taskUsers,String(identity.accountId))
            _ = try child(account,"memory")
            memoryIndex=held.count-1;taskRootIndex=taskIndex;directories=held
        }catch{for directory in held.reversed(){close(directory.descriptor)};throw error}
    }
    private static func metadata(_ fd:Int32)throws->stat {
        var value=stat()
        guard fstat(fd,&value)==0,(value.st_mode&S_IFMT)==S_IFDIR,value.st_uid==geteuid(),value.st_mode&0o7777==0o700 else{throw AuxMemoryAccountError.unsafeDirectory}
        errno=0;let raw=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        if raw==nil && errno==ENOENT{return value}
        guard let acl=raw else{throw AuxMemoryAccountError.unsafeDirectory};defer{acl_free(UnsafeMutableRawPointer(acl))}
        var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry)==(-1),errno==EINVAL,entry==nil else{throw AuxMemoryAccountError.unsafeDirectory}
        return value
    }
    private static func revalidate(_ directory:Directory)throws {
        let value=try metadata(directory.descriptor)
        guard let raw=realpath(directory.path,nil) else{throw AuxMemoryAccountError.unsafeDirectory};defer{free(raw)}
        var named=stat()
        guard String(cString:raw)==directory.path,lstat(directory.path,&named)==0,
              named.st_dev==value.st_dev,named.st_ino==value.st_ino,named.st_mode==value.st_mode,
              value.st_dev==directory.captured.st_dev,value.st_ino==directory.captured.st_ino,
              value.st_mode==directory.captured.st_mode,value.st_uid==directory.captured.st_uid,
              value.st_gid==directory.captured.st_gid,value.st_flags==directory.captured.st_flags else{throw AuxMemoryAccountError.changed}
    }
    func revalidate(_ current:AuxMemoryAccountIdentity)throws {
        guard getpid()==process,current==identity else{throw AuxMemoryAccountError.changed}
        for directory in directories{try Self.revalidate(directory)}
    }
    // Private native journal producer only, never exported by NAPI/C.
    func duplicateTaskRootDirectory()throws->Int32 {
        guard getpid()==process else{throw AuxMemoryAccountError.changed}
        for directory in directories{try Self.revalidate(directory)}
        let fd=fcntl(directories[taskRootIndex].descriptor,F_DUPFD_CLOEXEC,0)
        guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory};return fd
    }
    func duplicateMemoryDirectory()throws->Int32 {
        guard getpid()==process else{throw AuxMemoryAccountError.changed}
        for directory in directories{try Self.revalidate(directory)}
        let fd=fcntl(directories[memoryIndex].descriptor,F_DUPFD_CLOEXEC,0)
        guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory};return fd
    }
    deinit{if getpid()==process{for directory in directories.reversed(){close(directory.descriptor)}}}
}

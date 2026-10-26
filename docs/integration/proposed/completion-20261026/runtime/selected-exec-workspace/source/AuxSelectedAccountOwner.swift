// Finite registered-account/session custody for builtin files and Computer Use.
// Reuses the accepted memory owner identity and actual retained native roots.
import Foundation
import Darwin
import SQLite3

final class AuxSelectedAccountOwner {
    let process=getpid()
    let identity:AuxMemoryAccountIdentity
    let expectedIdentity:Data
    let transportGeneration:UInt64
    fileprivate struct Directory {
        let descriptor:Int32
        let path:String
        let captured:stat
        let privateMode:Bool
        init(taking fd:Int32,privateMode:Bool=true)throws {
            self.privateMode=privateMode;descriptor=fd;captured=try Self.metadata(fd,privateMode:privateMode)
            var raw=[CChar](repeating:0,count:Int(PATH_MAX))
            guard fcntl(fd,F_GETPATH,&raw)==0 else{throw AuxMemoryAccountError.unsafeDirectory}
            path=String(cString:raw);try revalidate()
        }
        static func metadata(_ fd:Int32,privateMode:Bool)throws->stat {
            var st=stat()
            guard fstat(fd,&st)==0,(st.st_mode&S_IFMT)==S_IFDIR,st.st_uid==geteuid(),
                  (privateMode ? st.st_mode&0o7777==0o700:st.st_mode&0o7022==0) else{throw AuxMemoryAccountError.unsafeDirectory}
            errno=0;let raw=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
            if raw==nil&&errno==ENOENT{return st}
            guard let acl=raw else{throw AuxMemoryAccountError.unsafeDirectory};defer{acl_free(UnsafeMutableRawPointer(acl))}
            var entry:acl_entry_t?;errno=0
            guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry)==(-1),errno==EINVAL,entry==nil else{throw AuxMemoryAccountError.unsafeDirectory}
            return st
        }
        func revalidate()throws {
            let st=try Self.metadata(descriptor,privateMode:privateMode)
            guard let canonical=realpath(path,nil) else{throw AuxMemoryAccountError.changed};defer{free(canonical)}
            var named=stat()
            guard String(cString:canonical)==path,lstat(path,&named)==0,
                  st.st_dev==captured.st_dev,st.st_ino==captured.st_ino,st.st_mode==captured.st_mode,
                  st.st_uid==captured.st_uid,st.st_gid==captured.st_gid,st.st_flags==captured.st_flags,
                  named.st_dev==st.st_dev,named.st_ino==st.st_ino else{throw AuxMemoryAccountError.changed}
        }
        func duplicate()throws->Int32 {
            try revalidate();let fd=fcntl(descriptor,F_DUPFD_CLOEXEC,0)
            guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory};return fd
        }
    }
    fileprivate var directories=[Directory]()
    private let controlAccountIndex:Int
    private let taskAccountIndex:Int
    fileprivate let taskRootIndex:Int
    init(identity:AuxMemoryAccountIdentity,expectedIdentity:Data,controlRoot:Int32,taskRoot:Int32,transportGeneration:UInt64)throws {
        guard transportGeneration>0 else{throw AuxMemoryAccountError.unavailable}
        self.identity=identity;self.expectedIdentity=expectedIdentity;self.transportGeneration=transportGeneration
        var held=[Directory]()
        func root(_ original:Int32)throws->Int32 {
            let fd=fcntl(original,F_DUPFD_CLOEXEC,0)
            guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory}
            do{held.append(try Directory(taking:fd));return fd}catch{close(fd);throw error}
        }
        func child(_ parent:Int32,_ name:String)throws->Int32 {
            let fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory}
            do{let value=try Directory(taking:fd);var named=stat()
                guard fstatat(parent,name,&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==value.captured.st_dev,named.st_ino==value.captured.st_ino else{throw AuxMemoryAccountError.changed}
                held.append(value);return fd
            }catch{close(fd);throw error}
        }
        do {
            let control=try root(controlRoot),users=try child(control,"u")
            _ = try child(users,String(identity.accountId));controlAccountIndex=held.count-1
            taskRootIndex=held.count
            let task=try root(taskRoot),taskUsers=try child(task,"u")
            _ = try child(taskUsers,String(identity.accountId));taskAccountIndex=held.count-1
            directories=held
        }catch{for directory in held.reversed(){close(directory.descriptor)};throw error}
    }
    func revalidate(_ current:AuxMemoryAccountIdentity)throws {
        guard getpid()==process,current==identity else{throw AuxMemoryAccountError.changed}
        for directory in directories{try directory.revalidate()}
    }
    func duplicateTaskRootDirectory()throws->Int32 {try directories[taskRootIndex].duplicate()}
    func duplicateControlAccountDirectory()throws->Int32 {try directories[controlAccountIndex].duplicate()}
    func duplicateTaskAccountDirectory()throws->Int32 {try directories[taskAccountIndex].duplicate()}
    fileprivate var controlAccount:Directory{directories[controlAccountIndex]}
    fileprivate var taskAccount:Directory{directories[taskAccountIndex]}
    deinit{if getpid()==process{for directory in directories.reversed(){close(directory.descriptor)}}}
}

// Native membership source: actual selected account's stored session/project row.
private struct AuxSelectedWorkspaceRecord:Equatable {
    let sessionId:String
    let sessionCreated:Int64
    let projectId:String?
    let projectCreated:Int64?
    let path:String
}
private final class AuxSelectedWorkspaceOwner {
    let record:AuxSelectedWorkspaceRecord
    let directory:AuxSelectedAccountOwner.Directory
    let parent:Int32
    let name:String
    let process=getpid()
    init(record:AuxSelectedWorkspaceRecord,account:AuxSelectedAccountOwner)throws {
        self.record=record
        guard record.path.hasPrefix("/"),record.path.utf8.count<Int(PATH_MAX),!record.path.utf8.contains(0),
              let raw=realpath(record.path,nil) else{throw AuxMemoryAccountError.unsafeDirectory}
        let canonical=String(cString:raw);free(raw)
        guard canonical==record.path else{throw AuxMemoryAccountError.changed}
        func within(_ path:String,_ root:String)->Bool{path==root||path.hasPrefix(root+"/")}
        let taskRoot=account.directories[account.taskRootIndex].path
        let controlRoot=account.directories[0].path
        guard !within(canonical,controlRoot),!within(controlRoot,canonical),
              !within(canonical,taskRoot)||within(canonical,account.taskAccount.path) else{throw AuxMemoryAccountError.unsafeDirectory}
        var cursor=open("/",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
        guard cursor>=0 else{throw AuxMemoryAccountError.unsafeDirectory}
        do {
            let parts=canonical.dropFirst().split(separator:"/",omittingEmptySubsequences:false).map(String.init)
            guard let leaf=parts.last,!leaf.isEmpty else{throw AuxMemoryAccountError.unsafeDirectory}
            for part in parts.dropLast() {
                guard !part.isEmpty,part != ".",part != ".." else{throw AuxMemoryAccountError.unsafeDirectory}
                let next=openat(cursor,part,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
                guard next>=0 else{throw AuxMemoryAccountError.unsafeDirectory};close(cursor);cursor=next
            }
            let fd=openat(cursor,leaf,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory}
            do {
                let held=try AuxSelectedAccountOwner.Directory(taking:fd,privateMode:false)
                var named=stat();guard fstatat(cursor,leaf,&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==held.captured.st_dev,named.st_ino==held.captured.st_ino else{throw AuxMemoryAccountError.changed}
                directory=held;parent=cursor;name=leaf;cursor = -1
            }catch{close(fd);throw error}
        }catch{if cursor>=0{close(cursor)};throw error}
    }
    func revalidate(_ current:AuxSelectedWorkspaceRecord)throws {
        guard getpid()==process,current==record else{throw AuxMemoryAccountError.changed}
        try directory.revalidate();var named=stat()
        guard fstatat(parent,name,&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==directory.captured.st_dev,named.st_ino==directory.captured.st_ino else{throw AuxMemoryAccountError.changed}
    }
    deinit{if getpid()==process{close(directory.descriptor);close(parent)}}
}

final class AuxSelectedSessionOwner {
    let account:AuxSelectedAccountOwner
    let accountLease:UInt64
    let sessionId:String
    private var workspace:AuxSelectedWorkspaceOwner?
    private let createdAt:Int64
    private let database:Int32
    private let databaseIdentity:stat
    private let control:AuxSelectedAccountOwner.Directory
    private let task:AuxSelectedAccountOwner.Directory
    init(account:AuxSelectedAccountOwner,accountLease:UInt64,sessionId:String)throws {
        guard !sessionId.isEmpty,sessionId.utf8.count<=128,sessionId.utf8.allSatisfy({(65...90).contains($0)||(97...122).contains($0)||(48...57).contains($0)||$0==45||$0==95}) else{throw AuxMemoryAccountError.unavailable}
        self.account=account;self.accountLease=accountLease;self.sessionId=sessionId
        let db=openat(account.controlAccount.descriptor,"state.db",O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard db>=0 else{throw AuxMemoryAccountError.unavailable}
        var held=[Int32]()
        do {
            let metadata=try Self.databaseMetadata(db)
            let creation=try Self.storedCreation(account:account,session:sessionId,database:db,identity:metadata)
            func child(_ parent:Int32,_ name:String)throws->AuxSelectedAccountOwner.Directory {
                let fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
                guard fd>=0 else{throw AuxMemoryAccountError.unsafeDirectory}
                held.append(fd);let directory=try AuxSelectedAccountOwner.Directory(taking:fd,privateMode:false);var named=stat()
                guard fstatat(parent,name,&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==directory.captured.st_dev,named.st_ino==directory.captured.st_ino else{throw AuxMemoryAccountError.changed}
                return directory
            }
            let controlSessions=try child(account.controlAccount.descriptor,"sessions")
            // Supplied storage uses YYYY-MM-DD_id and an existing-only fallback.
            // Never choose arbitrarily if more than one real membership matches.
            let cursor=openat(controlSessions.descriptor,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
            guard cursor>=0,let stream=fdopendir(cursor) else{if cursor>=0{close(cursor)};throw AuxMemoryAccountError.unavailable}
            var names=[String]();errno=0
            while let row=readdir(stream) {
                let name=withUnsafePointer(to:&row.pointee.d_name){$0.withMemoryRebound(to:CChar.self,capacity:256){String(cString:$0)}}
                if name.utf8.count==11+sessionId.utf8.count,name.hasSuffix("_"+sessionId),name.prefix(10).enumerated().allSatisfy({[4,7].contains($0.offset) ? $0.element=="-":$0.element.isASCII&&$0.element.isNumber}) {names.append(name)}
                guard names.count<=64 else{closedir(stream);throw AuxMemoryAccountError.unavailable};errno=0
            }
            let readError=errno;closedir(stream);guard readError==0 else{throw AuxMemoryAccountError.unavailable}
            let formatter=DateFormatter();formatter.calendar=Calendar(identifier:.gregorian);formatter.locale=Locale(identifier:"en_US_POSIX");formatter.timeZone=TimeZone.current;formatter.dateFormat="yyyy-MM-dd"
            let expected=formatter.string(from:Date(timeIntervalSince1970:Double(creation)))+"_"+sessionId
            func hasMessages(_ name:String)->Bool {
                let directory=openat(controlSessions.descriptor,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
                guard directory>=0 else{return false};defer{close(directory)}
                var st=stat();return fstatat(directory,"messages.jsonl",&st,AT_SYMLINK_NOFOLLOW)==0&&(st.st_mode&S_IFMT)==S_IFREG&&st.st_uid==geteuid()&&st.st_nlink==1
            }
            let selected:String
            if names.contains(expected),hasMessages(expected){selected=expected}
            else {let populated=names.filter(hasMessages);guard populated.count==1 || (populated.isEmpty&&names.count==1) else{throw AuxMemoryAccountError.unavailable};selected=populated.first ?? names[0]}
            let stored=try child(controlSessions.descriptor,selected)
            let taskSessions=try child(account.taskAccount.descriptor,"sessions")
            let transient=try child(taskSessions.descriptor,sessionId)
            // Keep only roots needed by the finite consumer, plus account's real
            // ancestry. Session parent entries are revalidated by canonical FD.
            try stored.revalidate();try transient.revalidate()
            guard try Self.storedCreation(account:account,session:sessionId,database:db,identity:metadata)==creation else{throw AuxMemoryAccountError.changed}
            for fd in held where fd != stored.descriptor && fd != transient.descriptor{close(fd)}
            held=[];control=stored;task=transient;database=db;databaseIdentity=metadata;createdAt=creation
        }catch{for fd in held{close(fd)};close(db);throw error}
    }
    private static func databaseMetadata(_ fd:Int32)throws->stat {
        var st=stat()
        guard fstat(fd,&st)==0,(st.st_mode&S_IFMT)==S_IFREG,st.st_uid==geteuid(),st.st_nlink==1,st.st_mode&0o022==0,st.st_size>0,st.st_size<=Int64(4)*1024*1024*1024 else{throw AuxMemoryAccountError.unavailable}
        return st
    }
    private static func storedCreation(account:AuxSelectedAccountOwner,session:String,database:Int32,identity:stat)throws->Int64 {
        try account.controlAccount.revalidate()
        let st=try databaseMetadata(database);var named=stat()
        guard st.st_dev==identity.st_dev,st.st_ino==identity.st_ino,
              fstatat(account.controlAccount.descriptor,"state.db",&named,AT_SYMLINK_NOFOLLOW)==0,named.st_dev==st.st_dev,named.st_ino==st.st_ino else{throw AuxMemoryAccountError.changed}
        var connection:OpaquePointer?
        let path=account.controlAccount.path+"/state.db"
        guard sqlite3_open_v2(path,&connection,SQLITE_OPEN_READONLY|SQLITE_OPEN_NOFOLLOW,nil)==SQLITE_OK,let connection else{if let connection{sqlite3_close(connection)};throw AuxMemoryAccountError.unavailable}
        defer{sqlite3_close(connection)}
        sqlite3_busy_timeout(connection,50)
        guard sqlite3_exec(connection,"PRAGMA query_only=ON; PRAGMA trusted_schema=OFF;",nil,nil,nil)==SQLITE_OK else{throw AuxMemoryAccountError.unavailable}
        var query:OpaquePointer?
        guard sqlite3_prepare_v2(connection,"SELECT id,created_at FROM main.sessions WHERE id=?1 LIMIT 2",-1,&query,nil)==SQLITE_OK,let query else{throw AuxMemoryAccountError.unavailable}
        defer{sqlite3_finalize(query)}
        let transient=unsafeBitCast(-1,to:sqlite3_destructor_type.self)
        guard sqlite3_bind_text(query,1,session,-1,transient)==SQLITE_OK,sqlite3_step(query)==SQLITE_ROW,
              sqlite3_column_type(query,0)==SQLITE_TEXT,sqlite3_column_type(query,1)==SQLITE_INTEGER,
              let id=sqlite3_column_text(query,0),String(cString:id)==session else{throw AuxMemoryAccountError.unavailable}
        let created=sqlite3_column_int64(query,1)
        guard created>0,created<=253_402_300_799,sqlite3_step(query)==SQLITE_DONE else{throw AuxMemoryAccountError.unavailable}
        var final=stat();guard fstatat(account.controlAccount.descriptor,"state.db",&final,AT_SYMLINK_NOFOLLOW)==0,final.st_dev==st.st_dev,final.st_ino==st.st_ino else{throw AuxMemoryAccountError.changed}
        try account.controlAccount.revalidate();return created
    }
    func revalidate()throws {
        guard getpid()==account.process else{throw AuxMemoryAccountError.changed}
        for directory in account.directories{try directory.revalidate()}
        try control.revalidate();try task.revalidate()
        if let workspace{try workspace.revalidate(storedWorkspace())}
        guard try Self.storedCreation(account:account,session:sessionId,database:database,identity:databaseIdentity)==createdAt else{throw AuxMemoryAccountError.changed}
    }
    private func storedWorkspace()throws->AuxSelectedWorkspaceRecord {
        guard try Self.storedCreation(account:account,session:sessionId,database:database,identity:databaseIdentity)==createdAt else{throw AuxMemoryAccountError.changed}
        var connection:OpaquePointer?
        guard sqlite3_open_v2(account.controlAccount.path+"/state.db",&connection,SQLITE_OPEN_READONLY|SQLITE_OPEN_NOFOLLOW,nil)==SQLITE_OK,let connection else{if let connection{sqlite3_close(connection)};throw AuxMemoryAccountError.unavailable}
        defer{sqlite3_close(connection)};sqlite3_busy_timeout(connection,50)
        guard sqlite3_exec(connection,"PRAGMA query_only=ON; PRAGMA trusted_schema=OFF;",nil,nil,nil)==SQLITE_OK else{throw AuxMemoryAccountError.unavailable}
        var query:OpaquePointer?
        let sql="SELECT s.id,s.created_at,s.project_id,p.id,p.created_at,p.workspace_path FROM main.sessions AS s LEFT JOIN main.projects AS p ON p.id=s.project_id WHERE s.id=?1 LIMIT 2"
        guard sqlite3_prepare_v2(connection,sql,-1,&query,nil)==SQLITE_OK,let query else{throw AuxMemoryAccountError.unavailable}
        defer{sqlite3_finalize(query)}
        guard sqlite3_bind_text(query,1,sessionId,-1,unsafeBitCast(-1,to:sqlite3_destructor_type.self))==SQLITE_OK,sqlite3_step(query)==SQLITE_ROW,
              sqlite3_column_type(query,0)==SQLITE_TEXT,let id=sqlite3_column_text(query,0),String(cString:id)==sessionId,
              sqlite3_column_type(query,1)==SQLITE_INTEGER,sqlite3_column_int64(query,1)==createdAt else{throw AuxMemoryAccountError.changed}
        let record:AuxSelectedWorkspaceRecord
        if sqlite3_column_type(query,2)==SQLITE_NULL {
            guard (3...5).allSatisfy({sqlite3_column_type(query,Int32($0))==SQLITE_NULL}) else{throw AuxMemoryAccountError.changed}
            record = .init(sessionId:sessionId,sessionCreated:createdAt,projectId:nil,projectCreated:nil,path:account.taskAccount.path)
        }else {
            guard sqlite3_column_type(query,2)==SQLITE_TEXT,let project=sqlite3_column_text(query,2),
                  sqlite3_column_type(query,3)==SQLITE_TEXT,let selected=sqlite3_column_text(query,3),
                  String(cString:project)==String(cString:selected),sqlite3_column_bytes(query,2)>0,sqlite3_column_bytes(query,2)<=512,
                  sqlite3_column_type(query,4)==SQLITE_INTEGER,sqlite3_column_int64(query,4)>0,
                  sqlite3_column_type(query,5)==SQLITE_TEXT,let path=sqlite3_column_text(query,5),sqlite3_column_bytes(query,5)>0,sqlite3_column_bytes(query,5)<Int32(PATH_MAX) else{throw AuxMemoryAccountError.unavailable}
            let projectName=String(cString:project),workspacePath=String(cString:path)
            guard projectName.utf8.count==Int(sqlite3_column_bytes(query,2)),workspacePath.utf8.count==Int(sqlite3_column_bytes(query,5)) else{throw AuxMemoryAccountError.unavailable}
            record = .init(sessionId:sessionId,sessionCreated:createdAt,projectId:projectName,projectCreated:sqlite3_column_int64(query,4),path:workspacePath)
        }
        guard sqlite3_step(query)==SQLITE_DONE,try Self.storedCreation(account:account,session:sessionId,database:database,identity:databaseIdentity)==createdAt else{throw AuxMemoryAccountError.changed}
        return record
    }
    func duplicateDirectory(role:UInt32)throws->Int32 {
        try revalidate()
        switch role {
        case 1:return try control.duplicate()
        case 2:return try task.duplicate()
        case 3:
            let current=try storedWorkspace()
            if let workspace{try workspace.revalidate(current);return try workspace.directory.duplicate()}
            let captured=try AuxSelectedWorkspaceOwner(record:current,account:account)
            try captured.revalidate(storedWorkspace());workspace=captured
            return try captured.directory.duplicate()
        default:throw AuxMemoryAccountError.unavailable
        }
    }
    deinit{if getpid()==account.process{close(database);close(control.descriptor);close(task.descriptor)}}
}

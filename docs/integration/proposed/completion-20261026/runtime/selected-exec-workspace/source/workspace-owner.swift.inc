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

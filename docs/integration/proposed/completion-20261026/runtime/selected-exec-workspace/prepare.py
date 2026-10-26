from pathlib import Path
import json,hashlib,difflib
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');BASE=ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/source'
sha=lambda b:hashlib.sha256(b).hexdigest()
p=BASE/'AuxSelectedAccountOwner.swift';before=p.read_text();after=before
pairs=[
 ('    private let taskRootIndex:Int','    fileprivate let taskRootIndex:Int'),
 ('final class AuxSelectedSessionOwner {',(HERE/'source/workspace-owner.swift.inc').read_text()+'\nfinal class AuxSelectedSessionOwner {'),
 ('    private let createdAt:Int64','    private var workspace:AuxSelectedWorkspaceOwner?\n    private let createdAt:Int64'),
 ('        try control.revalidate();try task.revalidate()','        try control.revalidate();try task.revalidate()\n        if let workspace{try workspace.revalidate(storedWorkspace())}'),
 ('        switch role{case 1:return try control.duplicate();case 2:return try task.duplicate();default:throw AuxMemoryAccountError.unavailable}', '''        switch role {
        case 1:return try control.duplicate()
        case 2:return try task.duplicate()
        case 3:
            let current=try storedWorkspace()
            if let workspace{try workspace.revalidate(current);return try workspace.directory.duplicate()}
            let captured=try AuxSelectedWorkspaceOwner(record:current,account:account)
            try captured.revalidate(storedWorkspace());workspace=captured
            return try captured.directory.duplicate()
        default:throw AuxMemoryAccountError.unavailable
        }'''),
 ('    func duplicateDirectory(role:UInt32)throws->Int32 {', '''    private func storedWorkspace()throws->AuxSelectedWorkspaceRecord {
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
    func duplicateDirectory(role:UInt32)throws->Int32 {''')]
for a,z in pairs:assert after.count(a)==1,(a[:80],after.count(a));after=after.replace(a,z)
(HERE/'source/AuxSelectedAccountOwner.swift').write_text(after)
(HERE/'changes.json').write_text(json.dumps({'format':'aux.selected-session-native-workspace-source.v1','input':str(p),'inputSha256':sha(before.encode()),'outputSha256':sha(after.encode()),'anchors':[{'before':a,'after':z,'count':1} for a,z in pairs],'EntitlementRequired':True,'activated':False,'candidateChanged':False},indent=2)+'\n')
(HERE/'source.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(p),tofile='AuxSelectedAccountOwner.swift')))

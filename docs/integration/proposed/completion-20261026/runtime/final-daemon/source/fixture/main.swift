// Actual owner+SQLite/data fixture; not installation/native admission proof.
import Foundation
import Darwin
import SQLite3
func require(_ value:Bool,_ message:String)throws {if !value{throw NSError(domain:message,code:1)}}
let input=try Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))
let emitted=try JSONSerialization.jsonObject(with:input) as! [String:Any]
let registry=emitted["registry"] as! [String:Any],session=emitted["session"] as! [String:Any]
let sessionId=session["id"] as! String,created=(session["created_at"] as! NSNumber).int64Value
let controlName=emitted["controlName"] as! String
let identity=try AuxMemoryAccountIdentity.decode(JSONSerialization.data(withJSONObject:registry),account:0)
var template=Array((CommandLine.arguments[2]+"/private-roots.XXXXXX\0").utf8).map{CChar(bitPattern:$0)}
guard let raw=mkdtemp(&template) else{fatalError("mkdtemp")};let root=String(cString:raw)
print("Synthetic fixture roots retained at: \(root)")
func directory(_ suffix:String,_ mode:mode_t=0o700)throws {let path=root+"/"+suffix;try FileManager.default.createDirectory(atPath:path,withIntermediateDirectories:true,attributes:[.posixPermissions:NSNumber(value:mode)]);try require(chmod(path,mode)==0,"chmod")}
for path in ["Control","Task","Control/u","Control/u/0","Task/u","Task/u/0"]{try directory(path)}
for path in ["Control/u/0/sessions","Control/u/0/sessions/"+controlName,"Task/u/0/sessions","Task/u/0/sessions/"+sessionId]{try directory(path,0o755)}
let messages=root+"/Control/u/0/sessions/"+controlName+"/messages.jsonl"
try Data("{}\n".utf8).write(to:URL(fileURLWithPath:messages));_ = chmod(messages,0o600)
var database:OpaquePointer?
try require(sqlite3_open_v2(root+"/Control/u/0/state.db",&database,SQLITE_OPEN_READWRITE|SQLITE_OPEN_CREATE,nil)==SQLITE_OK,"SQLite open")
defer{sqlite3_close(database)}
try require(sqlite3_exec(database,"PRAGMA journal_mode=WAL; CREATE TABLE sessions(id TEXT PRIMARY KEY,created_at INTEGER NOT NULL); INSERT INTO sessions VALUES('fixture_session',\(created));",nil,nil,nil)==SQLITE_OK,"actual emitted session schema")
_ = chmod(root+"/Control/u/0/state.db",0o600)
let control=open(root+"/Control",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC),task=open(root+"/Task",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
try require(control>=0&&task>=0,"real root descriptors");defer{close(control);close(task)}
let account=try AuxSelectedAccountOwner(identity:identity,expectedIdentity:Data(),controlRoot:control,taskRoot:task,transportGeneration:1)
// Producer emitted America/Chicago date. Consumer runs UTC: exact recognized
// existing-only fallback must retain the emitted path, never invent a UTC dir.
NSTimeZone.default=TimeZone(secondsFromGMT:0)!
let owner=try AuxSelectedSessionOwner(account:account,accountLease:1,sessionId:sessionId)
let held=try owner.duplicateDirectory(role:1);defer{close(held)}
var path=[CChar](repeating:0,count:Int(PATH_MAX));try require(fcntl(held,F_GETPATH,&path)==0,"held path")
try require(String(cString:path)==root+"/Control/u/0/sessions/"+controlName,"actual local-date directory retained across timezone change")
try require(sqlite3_exec(database,"UPDATE sessions SET created_at=created_at+1 WHERE id='fixture_session'",nil,nil,nil)==SQLITE_OK,"membership update")
var rejected=false;do{try owner.revalidate()}catch{rejected=true};try require(rejected,"changed stored membership must refuse")
try require(sqlite3_exec(database,"UPDATE sessions SET created_at=created_at-1 WHERE id='fixture_session'",nil,nil,nil)==SQLITE_OK,"fixture restore")
let second="2024-12-30_"+sessionId;try directory("Control/u/0/sessions/"+second,0o755)
try Data("{}\n".utf8).write(to:URL(fileURLWithPath:root+"/Control/u/0/sessions/"+second+"/messages.jsonl"));_ = chmod(root+"/Control/u/0/sessions/"+second+"/messages.jsonl",0o600)
rejected=false;do{_ = try AuxSelectedSessionOwner(account:account,accountLease:2,sessionId:sessionId)}catch{rejected=true};try require(rejected,"ambiguous dated directories must refuse")
print("PASS actual A51 account/date producer + real SQLite/private FDs: exact existing directory, changed membership refusal, ambiguity refusal")

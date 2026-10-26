#!/usr/bin/env python3
"""Prepare the finite native-host daemon journal and authenticated transport."""
from pathlib import Path
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[5]
CHROMIUM = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
DAEMON = Path('/private/tmp/aux-browser-only-daemon-build-20261025-a61/source')
A72 = Path('/private/tmp/aux-browser-only-daemon-build-20261025-a72/source')
files = []

def output(name, original_path, content, anchors=None):
    original = original_path.read_text() if original_path else ''
    for folder, body in [('baseline', original), ('source', content)]:
        target = HERE / folder / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(body)
    files.append({'path': name, 'input': str(original_path) if original_path else None,
                  'before': hashlib.sha256(original.encode()).hexdigest() if original_path else None,
                  'after': hashlib.sha256(content.encode()).hexdigest(), 'anchors': anchors or []})

def edit(name, original_path, replacements):
    text = original_path.read_text()
    anchors = []
    for old, new in replacements:
        count = text.count(old)
        if count != 1:
            raise RuntimeError(f'{name}: expected 1 anchor, found {count}: {old[:90]}')
        text = text.replace(old, new, 1)
        anchors.append({'old': old, 'new': new, 'count': 1})
    output(name, original_path, text, anchors)

# Keep the memory journal/schema intact; use its existing durable-file idiom.
original = A72 / 'AuxMemoryHelperJournal.swift'
text = original.read_text().replace('AuxMemoryJournalError', 'AuxNativeHostJournalError').replace('AuxMemoryHelperJournal', 'AuxNativeHostJournal')
text = text.replace('AuxMemoryCopyStoppedChildLifetime', 'AuxNativeHostCopyStoppedBrowserChildLifetime')
text = text.replace('memoryStoppedLifetime', 'nativeHostStoppedLifetime')
text = text.replace('private let leaseId=', 'let leaseId=')
text = text.replace('.aux-memory-helper-lifetimes.v1', '.aux-native-host-lifetimes.v1').replace('aux.memory.helper-lifetime.v1', 'aux.native-host-lifetime.v1')
text = text.replace('init(owner:AuxRegisteredMemoryAccountOwner,context:NativeFreshRuntimeCapturedContext)throws {', '''init(identity:AuxMemoryAccountIdentity,taskRoot:Int32,generation:UInt64,
         context:NativeFreshRuntimeCapturedContext,extensionOrigin:String,
         hostName:String,imageSha256:String)throws {''')
text = text.replace('owner.transportGeneration', 'generation').replace('owner.identity.', 'identity.')
text = text.replace('root=try owner.duplicateTaskRootDirectory()', '''root=fcntl(taskRoot,F_DUPFD_CLOEXEC,0)
        guard root>=0 else{throw AuxNativeHostJournalError.unavailable}''')
text = text.replace('"daemon":try lifetime(false),"browser":try lifetime(true)]', '''"extensionOriginSha256":hex(Data(SHA256.hash(data:Data(extensionOrigin.utf8)))),
                  "nativeHostNameSha256":hex(Data(SHA256.hash(data:Data(hostName.utf8)))),
                  "hostImageSha256":imageSha256,
                  "daemon":try lifetime(false),"browser":try lifetime(true)]''')
text = text.replace('guard let transaction=UUID(uuidString:journal.reservationTransactionId),generation>0,', '''guard let transaction=UUID(uuidString:journal.reservationTransactionId),generation>0,
              imageSha256.count==64,imageSha256.allSatisfy({"0123456789abcdef".contains($0)}),''')
output('daemon/AuxNativeHostJournal.swift', None, text)

accounts = A72 / 'AuxAccountsCskCoordinator.swift'
edit('daemon/AuxAccountsCskCoordinator.swift', accounts, [
('    func memoryRegistryMatches(_ bytes:Data)throws->Bool {try registeredMemoryRegistryBytes()==bytes}', '''    func registeredNativeHostProfile(_ path:String)throws->AuxMemoryAccountIdentity {
        let bytes=try registeredMemoryRegistryBytes(),registry=try strictEnvelopeObject(bytes)
        guard let bindings=registry["profileAccountBindings"] as? [String:Any],bindings.count<=4096 else{throw AuxMemoryAccountError.unavailable}
        let matches=bindings.values.compactMap{$0 as? [String:Any]}.filter{$0["profilePath"] as? String==path}
        guard matches.count==1,let account=integer(matches[0]["accountId"]) else{throw AuxMemoryAccountError.unavailable}
        return try AuxMemoryAccountIdentity.decode(bytes,account:account)
    }
    func memoryRegistryMatches(_ bytes:Data)throws->Bool {try registeredMemoryRegistryBytes()==bytes}'''),
])
secure = DAEMON / 'AuxSecureStore.swift'
edit('daemon/AuxSecureStore.swift', secure, [
('    func withAccountRegistryLock<T>(_ body:()throws->T)throws->T {', '''    func registeredNativeHostProfile(_ path:String)throws->AuxMemoryAccountIdentity {
        guard let accounts else{throw AuxMemoryAccountError.unavailable}
        return try accounts.registeredNativeHostProfile(path)
    }
    func withAccountRegistryLock<T>(_ body:()throws->T)throws->T {'''),
])

dispatcher = DAEMON / 'AuxOwnedCommandDispatcher.swift'
methods = '''    // Only the authenticated native browser transport calls this finite
    // protocol. No daemon HTTP/JS/Worker method accepts a lease or terminal flag.
    func exchangeNativeHostFrame(_ handle:UInt64,frame:Data)throws->Data {
        guard frame.count>0,frame.count<=8192 else{throw AuxDispatcherLifetimeError.invalidInput}
        let request=try strictEnvelopeObject(frame)
        guard let phase=request["phase"] as? String else{throw AuxDispatcherLifetimeError.invalidInput}
        func text(_ key:String)throws->String {
            guard let value=request[key] as? String,!value.isEmpty,value.utf8.count<4096,!value.utf8.contains(0) else{throw AuxDispatcherLifetimeError.invalidInput};return value
        }
        func integer(_ key:String,_ minimum:Int64,_ maximum:Int64)throws->Int64 {
            let value=try text(key)
            guard let number=Int64(value),String(number)==value,number>=minimum,number<=maximum else{throw AuxDispatcherLifetimeError.invalidInput};return number
        }
        return try withEntry(handle,guardGenericAction:false){entry in
            guard let secure=entry.secureStore,let context=entry.nativeFreshRuntime else{throw AuxMemoryAccountError.unavailable}
            try requireOrdinaryStorageGuard(entry,moment:.beforeAction)
            let lease:NativeHostLease
            switch phase {
            case "prepare":
                do {
                guard Set(request.keys)==["phase","profilePath","extensionOrigin","hostName","imageSha256"] else{throw AuxDispatcherLifetimeError.invalidInput}
                let path=try text("profilePath"),origin=try text("extensionOrigin"),host=try text("hostName"),image=try text("imageSha256")
                guard path.hasPrefix("/"),origin.hasPrefix("chrome-extension://"),origin.hasSuffix("/"),
                      origin.dropFirst(19).dropLast().count==32,
                      origin.dropFirst(19).dropLast().allSatisfy({("a"..."p").contains(String($0))}),
                      host.utf8.count<=255,!host.hasPrefix("."),!host.hasSuffix("."),!host.contains(".."),
                      host.allSatisfy({$0.isASCII && ($0.isLowercase || $0.isNumber || $0=="_" || $0==".")})
                else{throw AuxDispatcherLifetimeError.invalidInput}
                let identity=try secure.registeredNativeHostProfile(path)
                let roots=try context.owner.duplicateRetainedOrdinaryStorageRoots()
                defer{Darwin.close(roots.control);Darwin.close(roots.task)}
                let journal=try AuxNativeHostJournal(identity:identity,taskRoot:roots.task,generation:roots.generation,
                    context:context,extensionOrigin:origin,hostName:host,imageSha256:image)
                func rootPath(_ fd:Int32)throws->String {
                    var bytes=[CChar](repeating:0,count:Int(PATH_MAX))
                    guard fcntl(fd,F_GETPATH,&bytes)==0 else{throw AuxMemoryAccountError.unsafeDirectory}
                    return String(cString:bytes)
                }
                lease=try NativeHostLease(profilePath:path,identity:identity,journal:journal,
                    controlRoot:rootPath(roots.control),taskRoot:rootPath(roots.task))
                condition.lock()
                guard entry.nativeHostLeases.count<256,entry.pendingMemoryRegistryTarget==nil else{condition.unlock();throw AuxMemoryAccountError.exhausted}
                entry.nativeHostLeases[journal.leaseId]=lease
                condition.unlock()
                }catch{
                    return try JSONSerialization.data(withJSONObject:["noIntent":true],options:[.sortedKeys])
                }
                try lease.journal.prepare() // Retained before any durable mutation.
            case "publish", "terminal":
                let id=try text("leaseId")
                guard let uuid=UUID(uuidString:id),uuid.uuidString.lowercased()==id else{throw AuxDispatcherLifetimeError.invalidInput}
                condition.lock();let existing=entry.nativeHostLeases[id];condition.unlock()
                guard let existing else{throw AuxMemoryAccountError.unavailable};lease=existing
                guard try secure.registeredNativeHostProfile(lease.profilePath)==lease.identity else{throw AuxMemoryAccountError.changed}
                if phase=="publish" {
                    guard Set(request.keys)==["phase","leaseId","pid"] else{throw AuxDispatcherLifetimeError.invalidInput}
                    try lease.journal.publishSuspended(Int32(integer("pid",2,Int64(Int32.max))))
                }else{
                    guard Set(request.keys)==["phase","leaseId","pid","waitStatus","spawnError"] else{throw AuxDispatcherLifetimeError.invalidInput}
                    try lease.journal.terminal(pid:Int32(integer("pid",0,Int64(Int32.max))),
                        waitStatus:Int32(integer("waitStatus",0,Int64(Int32.max))),
                        spawnError:Int32(integer("spawnError",0,Int64(Int32.max))))
                    guard try lease.journal.canRelease() else{throw AuxMemoryAccountError.unavailable}
                    condition.lock();entry.nativeHostLeases.removeValue(forKey:id);condition.broadcast();condition.unlock()
                }
            default:throw AuxDispatcherLifetimeError.invalidInput
            }
            try requireOrdinaryStorageGuard(entry,moment:.afterAction)
            var response=["leaseId":lease.journal.leaseId]
            if phase=="prepare"{response["controlRoot"]=lease.controlRoot;response["taskRoot"]=lease.taskRoot}
            return try JSONSerialization.data(withJSONObject:response,options:[.sortedKeys,.withoutEscapingSlashes])
        }
    }
'''
edit('daemon/AuxOwnedCommandDispatcher.swift', dispatcher, [
('    private final class Entry {', '''    private final class NativeHostLease {
        let profilePath:String
        let identity:AuxMemoryAccountIdentity
        let journal:AuxNativeHostJournal
        let controlRoot:String
        let taskRoot:String
        init(profilePath:String,identity:AuxMemoryAccountIdentity,journal:AuxNativeHostJournal,controlRoot:String,taskRoot:String){
            self.profilePath=profilePath;self.identity=identity;self.journal=journal
            self.controlRoot=controlRoot;self.taskRoot=taskRoot
        }
    }
    private final class Entry {'''),
('        var memoryAccounts=[UInt64:AuxRegisteredMemoryAccountOwner]()', '''        var nativeHostLeases=[String:NativeHostLease]()
        var memoryAccounts=[UInt64:AuxRegisteredMemoryAccountOwner]()'''),
('let owners=Array(entry.memoryAccounts.values),pending=entry.pendingMemoryRegistryTarget;', 'let owners=Array(entry.memoryAccounts.values),hosts=Array(entry.nativeHostLeases.values),pending=entry.pendingMemoryRegistryTarget;'),
('let changed=owners.contains{(try? AuxMemoryAccountIdentity.decode(bytes,account:$0.identity.accountId)) != $0.identity}', '''let changed=owners.contains{(try? AuxMemoryAccountIdentity.decode(bytes,account:$0.identity.accountId)) != $0.identity} ||
            hosts.contains{(try? AuxMemoryAccountIdentity.decode(bytes,account:$0.identity.accountId)) != $0.identity}'''),
('    func captureMemoryAccount(_ handle:UInt64,account:Int64)throws->UInt64 {', methods + '    func captureMemoryAccount(_ handle:UInt64,account:Int64)throws->UInt64 {'),
('if !entry.memoryAccounts.isEmpty{return true}', 'if !entry.memoryAccounts.isEmpty || !entry.nativeHostLeases.isEmpty{return true}'),
('if !entry.memoryAccounts.isEmpty{return 1}', 'if !entry.memoryAccounts.isEmpty || !entry.nativeHostLeases.isEmpty{return 1}'),
('guard entry.memoryAccounts.isEmpty else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}', 'guard entry.memoryAccounts.isEmpty,entry.nativeHostLeases.isEmpty else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}'),
])

prepared = REPO / 'docs/integration/proposed/standard-profile-isolation/ui-native-capture-transport-a1/source/AuxPreparedDaemonAuthority.swift'
edit('daemon/AuxPreparedDaemonAuthority.swift', prepared, [
('case signature,publicKeys,inboxKey,browserStartup,uiCapture}', 'case signature,publicKeys,inboxKey,browserStartup,uiCapture,nativeHost}'),
('case .browserStartup,.uiCapture:command=', 'case .browserStartup,.uiCapture,.nativeHost:command='),
('    if request.kind == .uiCapture {', '''    if request.kind == .nativeHost {
        do {
            var reply=try AuxCommandDispatcherRegistry.shared.exchangeNativeHostFrame(entry.owner.handle,frame:request.message)
            guard !reply.isEmpty,reply.count<=8192 else{return .failed}
            return .completed(DaemonAuthorityPayload(&reply))
        }catch{return .failed}
    }
    if request.kind == .uiCapture {'''),
('}else if kind == .uiCapture {', '}else if kind == .uiCapture || kind == .nativeHost {'),
])
p=HERE/'source/daemon/AuxPreparedDaemonAuthority.swift'
p.write_text(p.read_text()+'''
@_cdecl("AuxBeginPreparedNativeHost")
func AuxBeginPreparedNativeHost(_ id:UInt64,_ sequence:UInt64,_ nonce:UnsafePointer<UInt8>?,_ message:UnsafePointer<UInt8>?,_ count:UInt32,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,sequence:sequence,nonce:nonce,kind:.nativeHost,message:message,output:output,capacity:capacity,written:written,messageCount:count)
}
''')
files[-1]['after']=hashlib.sha256(p.read_bytes()).hexdigest()

layout = REPO / 'docs/integration/proposed/browser-feature-expansion/native-memory-lifetime-startup-a31/source/AuxNativeTaskLayout.swift'
text=layout.read_text()
start=text.index('    private struct MemoryHelperProcess {')
end=text.index('    }\n',text.index('        return processes\n',start))+6
host_reader=text[start:end].replace('MemoryHelper','NativeHost').replace('memoryHelper','nativeHost').replace('.aux-memory-helper-lifetimes.v1','.aux-native-host-lifetimes.v1').replace('aux.memory.helper-lifetime.v1','aux.native-host-lifetime.v1')
host_reader=host_reader.replace('"recordSha256"] {try hash(key)}', '"recordSha256","extensionOriginSha256","nativeHostNameSha256","hostImageSha256"] {try hash(key)}')
host_reader=host_reader.replace('"daemon","browser","phase"]', '"daemon","browser","phase","extensionOriginSha256","nativeHostNameSha256","hostImageSha256"]')
text=text[:end]+host_reader+text[end:]
old='''        for process in processes {
            guard memoryHelperPriorProcessExited(process.pid,process.seconds,process.microseconds)==1 else {
                throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
            }
        }
        try revalidate()'''
new='''        for process in processes {
            guard memoryHelperPriorProcessExited(process.pid,process.seconds,process.microseconds)==1 else {
                throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
            }
        }
        for process in try Self.nativeHostProcesses(home:home,expected:expected) {
            guard memoryHelperPriorProcessExited(process.pid,process.seconds,process.microseconds)==1 else {
                throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState
            }
        }
        try revalidate()'''
assert text.count(old)==1
text=text.replace(old,new)
# Include only the fixed new journal leaf in the actual TaskLayout inventory.
text=text.replace('".aux-memory-helper-lifetimes.v1"', '".aux-memory-helper-lifetimes.v1"')
output('daemon/AuxNativeTaskLayout.swift',layout,text,[{'kind':'paired native-host decoder/reader', 'count':1}])

main = REPO/'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4/daemon-build/peer-loss-layout-a7/source/AuxNativeDaemonMain.cc'
text=main.read_text().replace('#include <libproc.h>', '#include <libproc.h>\n#include <sys/proc.h>')+'''
// Actual stopped direct child of the authenticated browser parent only.
extern "C" int32_t AuxNativeHostCopyStoppedBrowserChildLifetime(
    int32_t pid,uint64_t* seconds,uint64_t* microseconds) {
  if(!seconds||!microseconds)return -1;
  *seconds=0;*microseconds=0;
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  int32_t parent=-1;uint64_t parent_seconds=0,parent_micros=0;
  if(AuxCopyOrdinaryBrowserParentLifetime(&parent,&parent_seconds,&parent_micros)!=0)return -1;
  proc_bsdinfo first{},second{};
  if(pid<=1||proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&first,sizeof(first))!=sizeof(first)||
      proc_pidinfo(pid,PROC_PIDTBSDINFO,0,&second,sizeof(second))!=sizeof(second)||
      first.pbi_pid!=uint32_t(pid)||second.pbi_pid!=first.pbi_pid||
      first.pbi_ppid!=uint32_t(parent)||second.pbi_ppid!=first.pbi_ppid||
      first.pbi_status!=SSTOP||second.pbi_status!=SSTOP||!first.pbi_start_tvsec||
      first.pbi_start_tvusec>=1'000'000||second.pbi_start_tvsec!=first.pbi_start_tvsec||
      second.pbi_start_tvusec!=first.pbi_start_tvusec||getppid()!=parent)return -1;
  int32_t checked=-1;uint64_t checked_seconds=0,checked_micros=0;
  if(AuxCopyOrdinaryBrowserParentLifetime(&checked,&checked_seconds,&checked_micros)!=0||
      checked!=parent||checked_seconds!=parent_seconds||checked_micros!=parent_micros)return -1;
  *seconds=first.pbi_start_tvsec;*microseconds=first.pbi_start_tvusec;return 0;
#else
  return -1;
#endif
}
'''
output('daemon/AuxNativeDaemonMain.cc',main,text)

# Shared native transport remains on the existing exact peer/nonce/sequence/ACK path.
wire='chrome/browser/aux/AuxNativePeerWire.h'
edit(wire, CHROMIUM/wire, [('kBrowserStartup = 6, kUiCapture = 7;', 'kBrowserStartup = 6, kUiCapture = 7, kNativeHost = 8;')])
for name, declaration in [('AuxNativePeerTransport.h','  DaemonAuthorityReply ExchangeUiCaptureFrame('),('AuxOwnedNativePeerChild.h','  DaemonAuthorityReply ExchangeUiCaptureFrame(')]:
    path='chrome/browser/aux/'+name
    edit(path,CHROMIUM/path,[(declaration, '  DaemonAuthorityReply ExchangeNativeHostFrame(std::span<const uint8_t> frame, uint32_t timeout_ms);\n'+declaration)])
path='chrome/browser/aux/AuxNativePeerTransport.cc'
edit(path,CHROMIUM/path,[
('extern "C" int32_t AuxBeginPreparedUiCapture(', 'extern "C" int32_t AuxBeginPreparedNativeHost(uint64_t,uint64_t,const uint8_t*,\n    const uint8_t*,uint32_t,uint8_t*,uint32_t,uint32_t*);\nextern "C" int32_t AuxBeginPreparedUiCapture('),
('wire.operation == kUiCapture || wire.operation == kAcknowledge)', 'wire.operation == kUiCapture || wire.operation == kNativeHost || wire.operation == kAcknowledge)'),
('wire.operation == kUiCapture ? wire.message_length > 0', '(wire.operation == kUiCapture || wire.operation == kNativeHost) ? wire.message_length > 0'),
('  else if (wire.operation == kUiCapture)\n', '''  else if (wire.operation == kNativeHost)
    response.status = AuxBeginPreparedNativeHost(backend,wire.sequence,wire.nonce.data(),
        wire.message.data(),wire.message_length,response.payload.data(),response.payload.size(),&response.length);
  else if (wire.operation == kUiCapture)
'''),
('DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::ExchangeUiCaptureFrame(', '''DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::ExchangeNativeHostFrame(
    std::span<const uint8_t> frame, uint32_t timeout_ms) {
  if (frame.empty() || frame.size() > 8192) return {};
  return RequestAuthority(kNativeHost, frame, timeout_ms);
}
DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::ExchangeUiCaptureFrame('''),
])
path='chrome/browser/aux/AuxOwnedNativePeerChild.cc'
text=(CHROMIUM/path).read_text()
start=text.index('DaemonAuthorityReply SelectedNativeHome::ExchangeUiCaptureFrame(')
end=text.index('\nDaemonAuthority',start+1)
method=text[start:end].replace('ExchangeUiCaptureFrame','ExchangeNativeHostFrame')
output(path,CHROMIUM/path,text[:start]+method+'\n'+text[start:],[{'kind':'existing owner revalidation wrapper', 'count':1}])
path='chrome/browser/aux/AuxSelectedStateHome.h'
edit(path,CHROMIUM/path,[('DaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(', 'DaemonAuthorityReply ExchangeNativeSelectedHostFrame(std::span<const uint8_t> frame);\nDaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(')])
path='chrome/browser/aux/AuxSelectedStateHome.cc'
text=(CHROMIUM/path).read_text();start=text.index('DaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(');end=text.index('std::optional<UiStorageMigrationOwnerAck>',start)
method=text[start:end].replace('ExchangeNativeSelectedUiCaptureFrame','ExchangeNativeSelectedHostFrame').replace('ExchangeUiCaptureFrame','ExchangeNativeHostFrame')
method=method.replace('''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  // This bounded ordinary mode has no migration/privileged drain authority.
  return {DaemonAuthorityStatus::refused, {}};
#else
''','').replace('#endif\n','')
output(path,CHROMIUM/path,text[:start]+method+text[start:],[{'kind':'ordinary selected host finite route using original owner fences', 'count':1}])

patch=[]
for item in files:
    name=item['path']
    patch.extend(difflib.unified_diff((HERE/'baseline'/name).read_text().splitlines(True),
                                   (HERE/'source'/name).read_text().splitlines(True),fromfile='a/'+name,tofile='b/'+name))
(HERE/'backend.patch').write_text(''.join(patch))
(HERE/'changes.json').write_text(json.dumps({'format':'aux.native-host-journal-backend.v1','files':files},indent=2)+'\n')
print(json.dumps({'files':len(files)}))

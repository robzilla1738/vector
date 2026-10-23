// Finite native daemon authority, not a generic Run service or custody grant.
import Foundation
import Darwin

private let daemonAuthorityProcess=getpid()
private let daemonAuthorityLock=NSLock()
private var daemonAuthorityNext:UInt64=1
private var daemonAuthorities=[UInt64:PreparedDaemonAuthority]()
private let daemonAuthPrefix=Data("Aux Daemon Auth v1\0".utf8) //19 exact bytes.
private enum DaemonAuthorityKind:Equatable{case signature,publicKeys,inboxKey}
// Exact backend-owned cache allocation; no Data COW alias can retain its old
// cache buffer after wipe. This does not promise zeroization of Foundation's
// transient JSON/base64 String copies or separately owned transport buffers.
private final class DaemonAuthorityPayload {
    let count:Int
    private var storage:UnsafeMutableRawPointer?
    init(_ bytes:inout Data){
        count=bytes.count;storage=UnsafeMutableRawPointer.allocate(byteCount:count,alignment:1)
        bytes.withUnsafeBytes{source in storage!.copyMemory(from:source.baseAddress!,byteCount:count)}
        bytes.resetBytes(in:0..<bytes.count)
    }
    func copy(to output:UnsafeMutablePointer<UInt8>)->Bool {
        guard let storage else{return false}
        output.update(from:storage.assumingMemoryBound(to:UInt8.self),count:count);return true
    }
    func wipe(){if let storage{_ = memset_s(storage,count,0,count);storage.deallocate();self.storage=nil}}
    deinit{wipe()}
}
private enum DaemonAuthorityResult{case running,pending,completed(DaemonAuthorityPayload),failed}
private final class DaemonAuthorityRequest {
    let sequence:UInt64
    let nonce:Data
    let kind:DaemonAuthorityKind
    let message:Data
    let command:String
    let input:String
    var result=DaemonAuthorityResult.running
    var acknowledged=false
    init(sequence:UInt64,nonce:Data,kind:DaemonAuthorityKind,message:Data){
        self.sequence=sequence;self.nonce=nonce;self.kind=kind;self.message=message
        switch kind {
        case .signature:command="cdp-sign"
        case .publicKeys:command="get-public-keys"
        case .inboxKey:command="inbox-key-v2"
        }
        input=kind == .signature ? "{\"challenge\":\""+message.base64EncodedString()+"\"}":"{}"
    }
    func wipePayload(){if case .completed(let payload)=result{payload.wipe()};result = .failed}
}
private final class PreparedDaemonAuthority {
    let provider:UInt64
    let owner:AuxOwnedCommandDispatcher
    var current:DaemonAuthorityRequest?
    var retiredThrough:UInt64=0
    var active=false
    var closing=false
    var retiring=false
    var released=false
    var closeResult:Int32=1
    init(provider:UInt64,owner:AuxOwnedCommandDispatcher){self.provider=provider;self.owner=owner}
    deinit{if getpid()==daemonAuthorityProcess{AuxReleasePreparedFreshRuntimeProvider(provider)}}
}
private func validDaemonAuthMessage(_ message:Data)->Bool {
    message.count==51 && message.prefix(19)==daemonAuthPrefix
}
private func daemonAuthorityPayload(_ response:String,kind:DaemonAuthorityKind)->DaemonAuthorityPayload? {
    guard let object=try? strictEnvelopeObject(Data(response.utf8))else{return nil}
    if kind == .signature {
        guard Set(object.keys)==["signature"],let encoded=object["signature"] as? String,
              var bytes=Data(base64Encoded:encoded),!bytes.isEmpty,bytes.count<=8192,
              bytes.base64EncodedString()==encoded else{return nil}
        return DaemonAuthorityPayload(&bytes)
    }
    if kind == .inboxKey {
        guard Set(object.keys)==["key"],let encoded=object["key"] as? String,
              var bytes=Data(base64Encoded:encoded),bytes.count==32,
              bytes.base64EncodedString()==encoded else{return nil}
        return DaemonAuthorityPayload(&bytes)
    }
    guard Set(object.keys)==["scheme","sig","kem"],let scheme=object["scheme"] as? String,
          ["p256_v1","pq_v1"].contains(scheme) else{return nil}
    for key in ["sig","kem"] {
        guard let encoded=object[key] as? String,let bytes=Data(base64Encoded:encoded),
              !bytes.isEmpty,bytes.count<=8192,bytes.base64EncodedString()==encoded else{return nil}
    }
    var bytes=Data(response.utf8)
    return bytes.count<=8192 ? DaemonAuthorityPayload(&bytes):nil // Actual core response, not a rewritten key schema.
}
private func callPreparedDaemonAuthority(_ entry:PreparedDaemonAuthority,_ request:DaemonAuthorityRequest)->DaemonAuthorityResult {
    let response:String?=request.command.utf8CString.withUnsafeBufferPointer{command in
        request.input.utf8CString.withUnsafeBufferPointer{input in
            guard let pointer=auxNativeContextRun(entry.owner.handle,
                UnsafeRawPointer(command.baseAddress!).assumingMemoryBound(to:UInt8.self),command.count-1,
                UnsafeRawPointer(input.baseAddress!).assumingMemoryBound(to:UInt8.self),input.count-1)else{return nil}
            defer{auxNativeResultFree(pointer)}
            return String(cString:pointer)
        }
    }
    let state=auxNativeContextObserveOperationState(entry.owner.handle)
    if state==1 || state==2{return .pending}
    guard state==0,let response,let payload=daemonAuthorityPayload(response,kind:request.kind)else{return .failed}
    return .completed(payload)
}
@_cdecl("AuxCreatePreparedDaemonAuthority")
func AuxCreatePreparedDaemonAuthority(_ provider:UInt64)->UInt64 {
    guard getpid()==daemonAuthorityProcess else{return 0}
    // Reserve routing BEFORE any retained provider/protected owner exists.
    // Exhaustion therefore cannot strand an unpublished successful owner.
    daemonAuthorityLock.lock()
    guard daemonAuthorityNext<UInt64.max else{daemonAuthorityLock.unlock();return 0}
    let id=daemonAuthorityNext;daemonAuthorityNext += 1;daemonAuthorityLock.unlock()
    guard AuxRetainPreparedFreshRuntimeProvider(provider)==0 else{return 0}
    var handle:UInt64=0,retained:UnsafeMutableRawPointer?
    guard AuxCreatePreparedFreshRuntimeOwner(provider,&handle,&retained)==0,handle != 0,let retained else{
        AuxReleasePreparedFreshRuntimeProvider(provider);return 0
    }
    // This exact producer returns one retained AuxOwnedCommandDispatcher. No
    // arbitrary raw owner/core pointer is accepted from the outside.
    let owner=Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(retained).takeRetainedValue()
    let entry=PreparedDaemonAuthority(provider:provider,owner:owner)
    guard getpid()==daemonAuthorityProcess else{return 0}
    daemonAuthorityLock.lock()
    daemonAuthorities[id]=entry
    daemonAuthorityLock.unlock();return id
}
private func emitPreparedDaemonAuthority(_ result:DaemonAuthorityResult,_ output:UnsafeMutablePointer<UInt8>,_ written:UnsafeMutablePointer<UInt32>)->Int32 {
    switch result {
    case .running:return 2
    case .pending:return 1
    case .failed:return 4
    case .completed(let bytes):
        guard bytes.count>0,bytes.count<=8192 else{return 4}
        guard bytes.copy(to:output)else{return 4}
        written.pointee=UInt32(bytes.count);return 0
    }
}
private enum DaemonAuthorityTask:Equatable{case execute,recover,cached}
private func operatePreparedDaemonAuthority(_ id:UInt64,sequence:UInt64,nonce:UnsafePointer<UInt8>?,kind:DaemonAuthorityKind?,message:UnsafePointer<UInt8>?,output:UnsafeMutablePointer<UInt8>?,capacity:UInt32,written:UnsafeMutablePointer<UInt32>?)->Int32 {
    guard getpid()==daemonAuthorityProcess else{return -2}
    daemonAuthorityLock.lock()
    guard let entry=daemonAuthorities[id]else{daemonAuthorityLock.unlock();return -1}
    daemonAuthorityLock.unlock()
    guard sequence>0,let nonce,let output,let written,capacity==8192 else{return -1}
    written.pointee=0
    let token=Data(bytes:nonce,count:16)
    let bytes:Data
    if kind == .signature {
        guard let message else{return -1};bytes=Data(bytes:message,count:51)
        guard validDaemonAuthMessage(bytes)else{return -1}
    }else{bytes=Data()}
    daemonAuthorityLock.lock()
    guard !entry.closing else{daemonAuthorityLock.unlock();return 3}
    guard sequence>entry.retiredThrough else{daemonAuthorityLock.unlock();return 3}
    guard !entry.active else{daemonAuthorityLock.unlock();return 2}
    let request:DaemonAuthorityRequest,task:DaemonAuthorityTask
    if let previous=entry.current,sequence==previous.sequence {
        guard previous.nonce==token else{daemonAuthorityLock.unlock();return 3}
        if let kind,kind != previous.kind || bytes != previous.message{daemonAuthorityLock.unlock();return 3}
        switch previous.result {
        case .completed:task = .cached // Must freshly validate EXACT owner before publication.
        case .failed:daemonAuthorityLock.unlock();return 4
        case .running:daemonAuthorityLock.unlock();return 2
        case .pending:
            guard kind==nil else{daemonAuthorityLock.unlock();return 1}
            task = .recover
        }
        request=previous
    }else {
        guard let kind else{daemonAuthorityLock.unlock();return 3}
        if let previous=entry.current {
            guard sequence>previous.sequence else{daemonAuthorityLock.unlock();return 3}
            guard previous.acknowledged else{daemonAuthorityLock.unlock();return 2}
            guard previous.sequence<UInt64.max,sequence==previous.sequence+1 else{daemonAuthorityLock.unlock();return 5}
            // Explicit ACK plus a new exact next sequence retires only the old
            // completed reply. High-watermark permanently rejects its replay.
            entry.retiredThrough=previous.sequence
            previous.wipePayload()
        }else{guard sequence==1 else{daemonAuthorityLock.unlock();return 3}}
        request=DaemonAuthorityRequest(sequence:sequence,nonce:token,kind:kind,message:bytes)
        entry.current=request;task = .execute
    }
    entry.active=true
    if task != .cached{request.result = .running}
    daemonAuthorityLock.unlock()
    let result:DaemonAuthorityResult
    var validation:Int32=0
    switch task {
    case .cached:
        validation=auxNativeContextValidateCurrentAuthority(entry.owner.handle)
        result=request.result
    case .recover:
        let current=auxNativeContextObserveOperationState(entry.owner.handle)
        if current==2{result=callPreparedDaemonAuthority(entry,request)}
        else if current==1{result = .pending}
        else{result = .failed} // Never rerun if no actual retained read exists.
    case .execute:result=callPreparedDaemonAuthority(entry,request)
    }
    guard getpid()==daemonAuthorityProcess else{return -2}
    let lost=auxNativeContextObserveOperationState(entry.owner.handle)==4 || validation==3 || validation < 0
    daemonAuthorityLock.lock()
    if task != .cached{request.result=result}
    entry.active=false
    if lost{entry.closing=true;entry.closeResult=2;request.wipePayload()}
    let status:Int32=entry.closing ? 3:(validation==0 ? emitPreparedDaemonAuthority(result,output,written):1)
    let close=entry.closing;daemonAuthorityLock.unlock()
    if close{_ = AuxClosePreparedDaemonAuthority(id)}
    withExtendedLifetime(entry){}
    return status
}
@_cdecl("AuxBeginPreparedDaemonSignature")
func AuxBeginPreparedDaemonSignature(_ id:UInt64,_ sequence:UInt64,_ nonce:UnsafePointer<UInt8>?,_ message:UnsafePointer<UInt8>?,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,sequence:sequence,nonce:nonce,kind:.signature,message:message,output:output,capacity:capacity,written:written)
}
@_cdecl("AuxBeginPreparedDaemonPublicKeys")
func AuxBeginPreparedDaemonPublicKeys(_ id:UInt64,_ sequence:UInt64,_ nonce:UnsafePointer<UInt8>?,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,sequence:sequence,nonce:nonce,kind:.publicKeys,message:nil,output:output,capacity:capacity,written:written)
}
@_cdecl("AuxBeginPreparedDaemonInboxKey")
func AuxBeginPreparedDaemonInboxKey(_ id:UInt64,_ sequence:UInt64,_ nonce:UnsafePointer<UInt8>?,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,sequence:sequence,nonce:nonce,kind:.inboxKey,message:nil,output:output,capacity:capacity,written:written)
}
@_cdecl("AuxObservePreparedDaemonAuthority")
func AuxObservePreparedDaemonAuthority(_ id:UInt64,_ sequence:UInt64,_ nonce:UnsafePointer<UInt8>?,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,sequence:sequence,nonce:nonce,kind:nil,message:nil,output:output,capacity:capacity,written:written)
}
@_cdecl("AuxAckPreparedDaemonAuthority")
func AuxAckPreparedDaemonAuthority(_ id:UInt64,_ sequence:UInt64,_ nonce:UnsafePointer<UInt8>?)->Int32 {
    guard getpid()==daemonAuthorityProcess else{return -2}
    daemonAuthorityLock.lock()
    guard let entry=daemonAuthorities[id]else{daemonAuthorityLock.unlock();return -1}
    daemonAuthorityLock.unlock()
    guard let nonce else{return -1};let token=Data(bytes:nonce,count:16)
    daemonAuthorityLock.lock();defer{daemonAuthorityLock.unlock();withExtendedLifetime(entry){}}
    guard !entry.closing else{return 3}
    guard let current=entry.current,current.sequence==sequence,current.nonce==token else{return 2}
    guard !entry.active else{return 1}
    switch current.result {
    case .running,.pending:return 1
    case .completed,.failed:current.acknowledged=true;return 0
    }
}
@_cdecl("AuxClosePreparedDaemonAuthority")
func AuxClosePreparedDaemonAuthority(_ id:UInt64)->Int32 {
    guard getpid()==daemonAuthorityProcess else{return -2}
    daemonAuthorityLock.lock()
    guard let entry=daemonAuthorities[id]else{daemonAuthorityLock.unlock();return -1}
    entry.closing=true
    guard !entry.active,!entry.retiring else{daemonAuthorityLock.unlock();return 1}
    entry.retiring=true;daemonAuthorityLock.unlock()
    let retired=auxNativeContextRetire(entry.owner.handle)
    let state=auxNativeContextObserveOperationState(entry.owner.handle)
    guard getpid()==daemonAuthorityProcess else{return -2}
    let status:Int32=(retired==0 || retired == -1) ? 0:(state==4 || state==3 || retired == -4 ? 2:1)
    daemonAuthorityLock.lock();entry.retiring=false;entry.closeResult=status
    if status==0{entry.current?.wipePayload();entry.current=nil}
    if status==0 && entry.released{daemonAuthorities.removeValue(forKey:id)}
    daemonAuthorityLock.unlock();withExtendedLifetime(entry){}
    return status
}
@_cdecl("AuxReleasePreparedDaemonAuthority")
func AuxReleasePreparedDaemonAuthority(_ id:UInt64) {
    guard getpid()==daemonAuthorityProcess else{return}
    daemonAuthorityLock.lock()
    guard let entry=daemonAuthorities[id],!entry.released else{daemonAuthorityLock.unlock();return}
    entry.released=true;entry.closing=true;daemonAuthorityLock.unlock()
    _ = AuxClosePreparedDaemonAuthority(id)
    withExtendedLifetime(entry){}
}

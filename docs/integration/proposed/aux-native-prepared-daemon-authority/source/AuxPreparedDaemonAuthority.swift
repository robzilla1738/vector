// Finite native daemon authority, not a generic Run service or custody grant.
import Foundation
import Darwin

private let daemonAuthorityProcess=getpid()
private let daemonAuthorityLock=NSLock()
private var daemonAuthorityNext:UInt64=1
private var daemonAuthorities=[UInt64:PreparedDaemonAuthority]()
private var unpublishedDaemonAuthorities=[PreparedDaemonAuthority]()
private let daemonAuthPrefix=Data("Aux Daemon Auth v1\0".utf8) //19 exact bytes.
private enum DaemonAuthorityKind:Equatable{case signature,publicKeys}
private enum DaemonAuthorityResult{case running,pending,completed(Data),failed}
private final class DaemonAuthorityRequest {
    let kind:DaemonAuthorityKind
    let message:Data
    let command:String
    let input:String
    var result=DaemonAuthorityResult.running
    init(kind:DaemonAuthorityKind,message:Data){
        self.kind=kind;self.message=message
        command=kind == .signature ? "cdp-sign":"get-public-keys"
        input=kind == .signature ? "{\"challenge\":\""+message.base64EncodedString()+"\"}":"{}"
    }
}
private final class PreparedDaemonAuthority {
    let provider:UInt64
    let owner:AuxOwnedCommandDispatcher
    var requests=[Data:DaemonAuthorityRequest]()
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
private func daemonAuthorityPayload(_ response:String,kind:DaemonAuthorityKind)->Data? {
    guard let object=try? strictEnvelopeObject(Data(response.utf8))else{return nil}
    if kind == .signature {
        guard Set(object.keys)==["signature"],let encoded=object["signature"] as? String,
              let bytes=Data(base64Encoded:encoded),!bytes.isEmpty,bytes.count<=8192,
              bytes.base64EncodedString()==encoded else{return nil}
        return bytes
    }
    guard Set(object.keys)==["scheme","sig","kem"],let scheme=object["scheme"] as? String,
          ["p256_v1","pq_v1"].contains(scheme) else{return nil}
    for key in ["sig","kem"] {
        guard let encoded=object[key] as? String,let bytes=Data(base64Encoded:encoded),
              !bytes.isEmpty,bytes.count<=8192,bytes.base64EncodedString()==encoded else{return nil}
    }
    let bytes=Data(response.utf8)
    return bytes.count<=8192 ? bytes:nil // Actual core response, not a rewritten key schema.
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
    guard getpid()==daemonAuthorityProcess,AuxRetainPreparedFreshRuntimeProvider(provider)==0 else{return 0}
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
    guard daemonAuthorityNext<UInt64.max else{
        entry.closing=true;unpublishedDaemonAuthorities.append(entry);daemonAuthorityLock.unlock();return 0
    }
    let id=daemonAuthorityNext;daemonAuthorityNext += 1;daemonAuthorities[id]=entry
    daemonAuthorityLock.unlock();return id
}
private func emitPreparedDaemonAuthority(_ result:DaemonAuthorityResult,_ output:UnsafeMutablePointer<UInt8>,_ written:UnsafeMutablePointer<UInt32>)->Int32 {
    switch result {
    case .running:return 2
    case .pending:return 1
    case .failed:return 4
    case .completed(let bytes):
        guard !bytes.isEmpty,bytes.count<=8192 else{return 4}
        bytes.copyBytes(to:output,count:bytes.count);written.pointee=UInt32(bytes.count);return 0
    }
}
private func operatePreparedDaemonAuthority(_ id:UInt64,nonce:UnsafePointer<UInt8>?,kind:DaemonAuthorityKind?,message:UnsafePointer<UInt8>?,output:UnsafeMutablePointer<UInt8>?,capacity:UInt32,written:UnsafeMutablePointer<UInt32>?)->Int32 {
    guard getpid()==daemonAuthorityProcess else{return -2}
    daemonAuthorityLock.lock()
    guard let entry=daemonAuthorities[id]else{daemonAuthorityLock.unlock();return -1}
    daemonAuthorityLock.unlock()
    // Lookup precedes dereferencing any caller buffers. Native caller owns them.
    guard let nonce,let output,let written,capacity==8192 else{return -1}
    written.pointee=0
    let token=Data(bytes:nonce,count:16)
    let bytes:Data
    if kind == .signature {
        guard let message else{return -1};bytes=Data(bytes:message,count:51)
        guard validDaemonAuthMessage(bytes)else{return -1}
    }else{bytes=Data()}
    daemonAuthorityLock.lock()
    guard !entry.closing else{daemonAuthorityLock.unlock();return 3}
    let request:DaemonAuthorityRequest
    let observing:Bool
    if let previous=entry.requests[token] {
        if let kind,kind != previous.kind || bytes != previous.message{daemonAuthorityLock.unlock();return 3}
        if kind != nil {
            // Begin never reruns an uncertain/attempted request. Observe is the
            // only recovery route, including after transport reply timeout.
            let status=emitPreparedDaemonAuthority(previous.result,output,written)
            daemonAuthorityLock.unlock();return status
        }
        switch previous.result {
        case .pending:break
        default:let status=emitPreparedDaemonAuthority(previous.result,output,written);daemonAuthorityLock.unlock();return status
        }
        request=previous;observing=true
    }else {
        guard let kind else{daemonAuthorityLock.unlock();return -1}
        guard entry.requests.count<32 else{daemonAuthorityLock.unlock();return 5}
        guard !entry.active,!entry.requests.values.contains(where:{if case .pending=$0.result{return true};return false})else{daemonAuthorityLock.unlock();return 2}
        request=DaemonAuthorityRequest(kind:kind,message:bytes);entry.requests[token]=request;observing=false
    }
    guard !entry.active else{daemonAuthorityLock.unlock();return 2}
    entry.active=true;request.result = .running;daemonAuthorityLock.unlock()
    let result:DaemonAuthorityResult
    if observing {
        // A dedicated private owner has no other command callers. Only an
        // actual retained read result may reach ContextRun again; that exact
        // current implementation resolves it without repeating cdp-sign/read.
        let current=auxNativeContextObserveOperationState(entry.owner.handle)
        if current==2{result=callPreparedDaemonAuthority(entry,request)}
        else if current==1{result = .pending}
        else{result = .failed}
    }else{result=callPreparedDaemonAuthority(entry,request)}
    guard getpid()==daemonAuthorityProcess else{return -2}
    let lost=auxNativeContextObserveOperationState(entry.owner.handle)==4
    daemonAuthorityLock.lock();request.result=result;entry.active=false
    if lost{entry.closing=true;entry.closeResult=2}
    let status=entry.closing ? 3:emitPreparedDaemonAuthority(result,output,written)
    let close=entry.closing;daemonAuthorityLock.unlock()
    // No mutex crosses native retirement/revalidation or imported-owner deinit.
    if close{_ = AuxClosePreparedDaemonAuthority(id)}
    withExtendedLifetime(entry){}
    return status
}
@_cdecl("AuxBeginPreparedDaemonSignature")
func AuxBeginPreparedDaemonSignature(_ id:UInt64,_ nonce:UnsafePointer<UInt8>?,_ message:UnsafePointer<UInt8>?,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,nonce:nonce,kind:.signature,message:message,output:output,capacity:capacity,written:written)
}
@_cdecl("AuxBeginPreparedDaemonPublicKeys")
func AuxBeginPreparedDaemonPublicKeys(_ id:UInt64,_ nonce:UnsafePointer<UInt8>?,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,nonce:nonce,kind:.publicKeys,message:nil,output:output,capacity:capacity,written:written)
}
@_cdecl("AuxObservePreparedDaemonAuthority")
func AuxObservePreparedDaemonAuthority(_ id:UInt64,_ nonce:UnsafePointer<UInt8>?,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,nonce:nonce,kind:nil,message:nil,output:output,capacity:capacity,written:written)
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

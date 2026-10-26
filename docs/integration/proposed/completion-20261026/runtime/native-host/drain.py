#!/usr/bin/env python3
"""Cancel affected native hosts before account-incarnation registry publication."""
from pathlib import Path
import difflib
import hashlib
import json
HERE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
REPO=HERE.parents[5]
plan=json.loads((HERE/'changes.json').read_text())
def save(name,text,parent=None):
    p=HERE/'source'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
    row=next((x for x in plan['files'] if x['path']==name),None)
    if row is None:
        assert parent
        old=parent.read_text();b=HERE/'baseline'/name;b.parent.mkdir(parents=True,exist_ok=True);b.write_text(old)
        row={'path':name,'input':str(parent),'before':hashlib.sha256(old.encode()).hexdigest(),'anchors':[]};plan['files'].append(row)
    row['after']=hashlib.sha256(text.encode()).hexdigest();row['drainStage']='affected native host cancellation before account publication'
def source(name):return (HERE/'source'/name).read_text()

name='chrome/browser/aux/AuxNativePeerWire.h';text=source(name).replace('constexpr mach_msg_id_t kReply = 0x41555852;', 'constexpr mach_msg_id_t kNativeHostStopRequest = 0x41555864;\nconstexpr mach_msg_id_t kReply = 0x41555852;');save(name,text)
name='chrome/browser/aux/AuxNativePeerTransport.h';text=source(name).replace('  int32_t CopyBrowserPrivateRoot(', '  int32_t RequestNativeHostStop(std::span<const uint8_t,16> lease, uint32_t timeout_ms);\n  int32_t CopyBrowserPrivateRoot(');save(name,text)
name='chrome/browser/aux/AuxNativePeerTransport.cc';text=source(name)
text=text.replace('#include "AuxNativePeerWire.h"', '''#include "AuxNativePeerWire.h"
#if !defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)
extern "C" void AuxStopBrowserNativeHostLeaseV1(const uint8_t*);
#endif''')
text=text.replace('  const bool browser_roots_request = header->msgh_id == kBrowserRootsRequest;', '  const bool native_host_stop_request = header->msgh_id == kNativeHostStopRequest;\n  const bool browser_roots_request = header->msgh_id == kBrowserRootsRequest;')
text=text.replace('browser_drain_ack ? kBrowserDrainAck : kRequest)', 'browser_drain_ack ? kBrowserDrainAck :\n            native_host_stop_request ? kNativeHostStopRequest : kRequest)')
text=text.replace('((browser_drain_request || browser_drain_ack) ? parsed.wire.generation == 0', '((browser_drain_request || browser_drain_ack || native_host_stop_request) ? parsed.wire.generation == 0')
needle='''  Wire reply{};
  reply.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_MOVE_SEND_ONCE, 0);'''
replacement='''  if(native_host_stop_request) {
    if(expected_browser_generation!=generation)return ExchangeStatus::refused;
#if !defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)
    // Cancellation only: the authenticated ACK never claims pipe/reap drain.
    AuxStopBrowserNativeHostLeaseV1(nonce.data());
#else
    return ExchangeStatus::refused;
#endif
  }
  Wire reply{};
  reply.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_MOVE_SEND_ONCE, 0);'''
assert text.count(needle)==1;text=text.replace(needle,replacement)
marker='int32_t AuthenticatedNativeParentConnection::CopyBrowserPrivateRoot('
method='''int32_t AuthenticatedNativeParentConnection::RequestNativeHostStop(
    std::span<const uint8_t,16> lease,uint32_t timeout_ms) {
  auto state=state_;
  if(getpid()!=state->process||!ValidTimeout(timeout_ms))return -1;
  if(Revalidate(timeout_ms)!=ExchangeStatus::authenticated)return -1;
  std::optional<NativeSendRight> endpoint;
  {
    std::lock_guard<std::mutex> lock(state->mutex);
    if(state->snapshot.closed)return -2;
    endpoint.emplace(state->endpoint.CopyOwnedRight());
    if(!endpoint->is_valid())return -1;
    ++state->snapshot.active_checks;
  }
  auto finish=+[](State* retained){std::lock_guard<std::mutex> lock(retained->mutex);--retained->snapshot.active_checks;};
  std::unique_ptr<State,decltype(finish)> active(state.get(),finish);
  ReceiveRight receiver;if(receiver.get()==MACH_PORT_NULL)return -1;
  Wire request{};
  request.header.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND,MACH_MSG_TYPE_MAKE_SEND_ONCE);
  request.header.msgh_size=sizeof(request);request.header.msgh_remote_port=endpoint->BorrowNativeName();
  request.header.msgh_local_port=receiver.get();request.header.msgh_id=kNativeHostStopRequest;
  request.generation=state->transport_generation;
  arc4random_buf(request.nonce.data(),request.nonce.size());
  std::copy(lease.begin(),lease.end(),request.nonce.begin());
  const auto nonce=request.nonce;
  auto status=mach_msg(&request.header,MACH_SEND_MSG|MACH_SEND_TIMEOUT,sizeof(request),0,MACH_PORT_NULL,timeout_ms,MACH_PORT_NULL);
  if(status!=KERN_SUCCESS) {
    if(RecoverableSendError(status)) {
      const auto local=MACH_MSGH_BITS_LOCAL(request.header.msgh_bits);
      if(local==MACH_MSG_TYPE_MOVE_SEND||local==MACH_MSG_TYPE_MOVE_SEND_ONCE)
        mach_port_deallocate(mach_task_self(),request.header.msgh_local_port);
      return -1;
    }
    std::lock_guard<std::mutex> lock(state->mutex);
    ++state->snapshot.unresolved_send_cleanup;state->snapshot.closed=true;return -2;
  }
  Received response{};
  status=mach_msg(&response.wire.header,kReceiveOptions,0,sizeof(response),receiver.get(),timeout_ms,MACH_PORT_NULL);
  if(status==MACH_RCV_TIMED_OUT)return 1;
  if(status!=KERN_SUCCESS) {
    std::lock_guard<std::mutex> lock(state->mutex);
    ++state->snapshot.unresolved_receive_cleanup;state->snapshot.closed=true;return -2;
  }
  DestroyMessage cleanup(&response.wire.header);
  const auto audit=response.trailer.msgh_audit;
  if(!ValidWire(response,kReply)||response.wire.nonce!=nonce||response.wire.generation!=state->transport_generation||
      audit_token_to_pid(audit)!=state->birth.pid||audit_token_to_pidversion(audit)!=state->snapshot.parent_pid_version||
      getppid()!=state->birth.pid||!SameBirth(state->birth,0)||!NativeOperations::Validate(audit,*state->policy))return -1;
  return 0; // Stop was requested, not physical settlement.
}
'''
assert marker in text;text=text.replace(marker,method+marker);save(name,text)

name='chrome/browser/extensions/api/messaging/aux_native_host_lease.h';text=source(name).replace('  void Cancel();','  void Cancel();\n  bool MatchesLeaseBytes(std::span<const uint8_t,16> lease) const;');save(name,text)
name='chrome/browser/extensions/api/messaging/aux_native_host_lease.cc';text=source(name).replace('void AuxNativeHostLease::Cancel()', '''bool AuxNativeHostLease::MatchesLeaseBytes(std::span<const uint8_t,16> lease) const {
  const auto hex=base::HexEncodeLower(lease);
  return lease_id_==hex.substr(0,8)+"-"+hex.substr(8,4)+"-"+hex.substr(12,4)+"-"+hex.substr(16,4)+"-"+hex.substr(20);
}
void AuxNativeHostLease::Cancel()''');save(name,text)
name='chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h';text=source(name).replace('  void RequestStop() {','''  static void StopLease(std::span<const uint8_t,16> lease) {
    std::vector<std::shared_ptr<AuxNativeMessagingLifetime>> entries;
    {std::lock_guard<std::mutex> lock(RegistryMutex());entries=Registry();}
    for(const auto& entry:entries) {
      bool matches=false;
      {std::lock_guard<std::mutex> lock(entry->mutex);matches=entry->ordinary_lease_&&entry->ordinary_lease_->MatchesLeaseBytes(lease);}
      if(matches)entry->RequestStop();
    }
  }
  void RequestStop() {''');save(name,text)
name='chrome/browser/extensions/api/messaging/native_message_process_host.cc';text=source(name)
text+='''
#if BUILDFLAG(IS_MAC)
// Called only from the existing authenticated browser parent-peer receiver.
extern "C" void AuxStopBrowserNativeHostLeaseV1(const uint8_t* lease) {
  if(lease)extensions::AuxNativeMessagingLifetime::StopLease(std::span<const uint8_t,16>(lease,16));
}
#endif
''';save(name,text)

parent=REPO/'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/ordinary-storage-native/AuxNativeParentConnectionBridge.cc'
text=parent.read_text()+'''
#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)
extern "C" int32_t AuxRequestAuthenticatedNativeHostStop(uint64_t handle,const uint8_t* lease) {
  if(!lease)return -1;
  try {
    if(getpid()!=Connections().process)return -3;
    auto actual=ActualAuthorityConnection(handle);
    return actual?actual->RequestNativeHostStop(std::span<const uint8_t,16>(lease,16),2'000):-1;
  }catch(...){return -1;}
}
#endif
'''
save('daemon/AuxNativeParentConnectionBridge.cc',text,parent)
parent=REPO/'docs/integration/proposed/browser-feature-expansion/native-memory-lifetime-startup-a31/source/AuxFreshColdInstallerGuard.swift'
text=parent.read_text().replace('final class AuxLiveNativeParentConnection {','''@_silgen_name("AuxRequestAuthenticatedNativeHostStop") private func requestAuthenticatedNativeHostStop(_ handle:UInt64,_ lease:UnsafePointer<UInt8>)->Int32
final class AuxLiveNativeParentConnection {''')
text=text.replace('    func revalidate()throws {','''    func requestNativeHostStop(_ lease:UUID)throws {
        try revalidate();var bytes=lease.uuid
        let status=withUnsafeBytes(of:&bytes){requestAuthenticatedNativeHostStop(handle,$0.baseAddress!.assumingMemoryBound(to:UInt8.self))}
        guard status==0 else{throw AuxFreshColdGuardError.peer(status)}
    }
    func revalidate()throws {''',1)
text=text.replace('    func verifyUiCaptureJournalAdmission()throws {','''    func requestNativeHostStop(_ lease:UUID)throws {try peer.requestNativeHostStop(lease)}
    func verifyUiCaptureJournalAdmission()throws {''')
save('daemon/AuxFreshColdInstallerGuard.swift',text,parent)
parent=REPO/'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/ordinary-storage-source/AuxNativeFreshStageCoordinator.swift'
text=parent.read_text().replace('    func duplicateRetainedOrdinaryStorageRoots()throws->(generation:UInt64,control:Int32,task:Int32) {','''    func requestNativeHostStop(_ lease:UUID)throws {try coldGuard.requestNativeHostStop(lease)}
    func duplicateRetainedOrdinaryStorageRoots()throws->(generation:UInt64,control:Int32,task:Int32) {''')
save('daemon/AuxNativeFreshStageCoordinator.swift',text,parent)

name='daemon/AuxOwnedCommandDispatcher.swift';text=source(name)
text=text.replace('        let taskRoot:String\n', '        let taskRoot:String\n        var stopRequested=false\n')
text=text.replace('''        if let pending, pending != bytes{throw AuxMemoryAccountError.changed}
        let changed=owners.contains''','''        if let pending,pending != bytes {
            let stillBlocked=owners.contains{(try? AuxMemoryAccountIdentity.decode(pending,account:$0.identity.accountId)) != $0.identity} ||
                hosts.contains{(try? AuxMemoryAccountIdentity.decode(pending,account:$0.identity.accountId)) != $0.identity}
            guard !stillBlocked else{throw AuxMemoryAccountError.changed}
            // The previous callback refused before atomicWriteFileSyncBody.
            // Only after its affected actual owners settle may a new target
            // supersede that unsubmitted proposal, under the same registry lock.
            condition.lock();entry.pendingMemoryRegistryTarget=nil;condition.unlock()
        }
        let changed=owners.contains''')
old='''        if changed{condition.lock();entry.pendingMemoryRegistryTarget=bytes;condition.unlock();return false}'''
new='''        if changed {
            condition.lock();entry.pendingMemoryRegistryTarget=bytes;condition.unlock()
            guard let context=entry.nativeFreshRuntime else{throw AuxMemoryAccountError.unavailable}
            for host in hosts where (try? AuxMemoryAccountIdentity.decode(bytes,account:host.identity.accountId)) != host.identity {
                host.stopRequested=true
                guard let lease=UUID(uuidString:host.journal.leaseId) else{throw AuxMemoryAccountError.unavailable}
                // Request cancellation only; do not wait while holding the
                // account-registry lock. Terminal publication happens after this
                // callback refuses and releases the original writer's lock.
                try context.owner.requestNativeHostStop(lease)
            }
            return false
        }'''
assert old in text;text=text.replace(old,new)
text=text.replace('''                if phase=="publish" {
                    guard Set(request.keys)''','''                if phase=="publish" {
                    guard !lease.stopRequested else{throw AuxMemoryAccountError.changed}
                    guard Set(request.keys)''')
save(name,text)
patch=[]
for row in plan['files']:
    name=row['path'];patch.extend(difflib.unified_diff((HERE/'baseline'/name).read_text().splitlines(True),source(name).splitlines(True),fromfile='a/'+name,tofile='b/'+name))
(HERE/'changes.json').write_text(json.dumps(plan,indent=2)+'\n');(HERE/'native-host.patch').write_text(''.join(patch))
print(json.dumps({'pairedFiles':len(plan['files'])}))

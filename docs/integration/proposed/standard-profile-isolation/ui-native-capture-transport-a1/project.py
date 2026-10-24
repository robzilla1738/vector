"""Pair the authenticated native peer and retained journal without changing UI."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PRIOR = HERE.parent / 'ui-native-capture-journal-a1'
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
SOURCE = HERE / 'source'
sha = lambda data: hashlib.sha256(data).hexdigest()
files, patches = [], []


def project(path, name, edits):
    original = path.read_bytes()
    text = original.decode()
    anchors = []
    for old, new in edits:
        assert text.count(old) == 1, (name, old[:120], text.count(old))
        text = text.replace(old, new)
        anchors.append({'find': old, 'replace': new, 'count': 1})
    target = SOURCE / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)
    files.append({'input': str(path), 'path': name, 'inputSha256': sha(original),
                  'output': str(target), 'outputSha256': sha(text.encode()), 'anchors': anchors})
    patches.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                       fromfile='a/' + name, tofile='b/' + name))


def cpp(name, edits):
    project(ROOT / 'chrome/browser/aux' / name, 'chrome/browser/aux/' + name, edits)


cpp('AuxNativePeerWire.h', [
    ('kAuthorityVersion = 5;', 'kAuthorityVersion = 6;'),
    ('kBrowserStartup = 6;', 'kBrowserStartup = 6, kUiCapture = 7;'),
    ('  std::array<uint8_t, 51> message{};\n  uint8_t padding = 0;',
     '  uint32_t message_length = 0;\n  uint32_t reserved = 0;\n  std::array<uint8_t, 8192> message{};'),
])
cpp('AuxNativePeerTransport.h', [
    ('  DaemonAuthorityReply GetBrowserStartupLease(uint32_t timeout_ms);',
     '  DaemonAuthorityReply GetBrowserStartupLease(uint32_t timeout_ms);\n'
     '  // Finite capture-data frames only; no profile/migration admission.\n'
     '  DaemonAuthorityReply ExchangeUiCaptureFrame(std::span<const uint8_t> frame, uint32_t timeout_ms);'),
])
cpp('AuxNativePeerTransport.cc', [
    ('#include "AuxFreshColdBootstrapNativeBridge.h"',
     '#include "AuxFreshColdBootstrapNativeBridge.h"\n'
     'extern "C" int32_t AuxBeginPreparedUiCapture(uint64_t, uint64_t, const uint8_t*,\n'
     '    const uint8_t*, uint32_t, uint8_t*, uint32_t, uint32_t*);'),
    ('  std::array<uint8_t, 51> message{};', '  std::vector<uint8_t> message;'),
    ('AuthorityClient::~AuthorityClient() { WipePayload(completed); }',
     'AuthorityClient::~AuthorityClient() { WipePayload(completed); WipePayload(message); }'),
    ('  std::array<uint8_t, 51> message;', '  std::vector<uint8_t> message;'),
    ('DaemonAuthorityPublication::~DaemonAuthorityPublication() = default;',
     'DaemonAuthorityPublication::~DaemonAuthorityPublication() { WipePayload(message); }'),
    ('  DestroyMessage destroy(&request.wire.header);\n  const auto& wire = request.wire;\n  bool valid = wire.header.msgh_size',
     '  DestroyMessage destroy(&request.wire.header);\n  PayloadWiper request_wiper(request.wire.message);\n'
     '  const auto& wire = request.wire;\n  bool valid = wire.header.msgh_size'),
    ('wire.version == kAuthorityVersion && wire.padding == 0 && wire.generation == generation &&',
     'wire.version == kAuthorityVersion && wire.reserved == 0 && wire.generation == generation &&'),
    ('wire.operation == kInboxKey || wire.operation == kBrowserStartup || wire.operation == kAcknowledge)',
     'wire.operation == kInboxKey || wire.operation == kBrowserStartup || wire.operation == kUiCapture || wire.operation == kAcknowledge)'),
    ('  if (wire.operation != kSign)\n    valid = valid && std::all_of(wire.message.begin(), wire.message.end(), [](uint8_t b) { return b == 0; });',
     '''  valid = valid && wire.message_length <= wire.message.size();
  if (valid) {
    const bool valid_length = wire.operation == kSign ? wire.message_length == 51 :
        wire.operation == kUiCapture ? wire.message_length > 0 : wire.message_length == 0;
    valid = valid_length && std::all_of(wire.message.begin() + wire.message_length,
        wire.message.end(), [](uint8_t b) { return b == 0; });
  }'''),
    ('  else if (wire.operation == kAcknowledge)\n    response.status',
     '''  else if (wire.operation == kUiCapture)
    response.status = AuxBeginPreparedUiCapture(backend, wire.sequence, wire.nonce.data(),
        wire.message.data(), wire.message_length, response.payload.data(), response.payload.size(), &response.length);
  else if (wire.operation == kAcknowledge)
    response.status'''),
    ('DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::RequestAuthority(',
     '''DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::ExchangeUiCaptureFrame(
    std::span<const uint8_t> frame, uint32_t timeout_ms) {
  if (frame.empty() || frame.size() > 8192) return {};
  return RequestAuthority(kUiCapture, frame, timeout_ms);
}
DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::RequestAuthority('''),
    ('  if (!ValidTimeout(timeout_ms)) return {};\n  const auto value = state_;',
     '  if (!ValidTimeout(timeout_ms) || message.size() > 8192) return {};\n  const auto value = state_;'),
    ('  std::array<uint8_t, 51> body{};\n  std::copy(message.begin(), message.end(), body.begin());',
     '  std::vector<uint8_t> body(message.begin(), message.end());\n  PayloadWiper body_wiper(body);'),
    ('    client->message = body;', '    WipePayload(client->message);\n    client->message = body;'),
    ('  if (!observe && !acknowledging) request.wire.message = body;',
     '''  PayloadWiper request_wiper(request.wire.message);
  if (!observe && !acknowledging) {
    request.wire.message_length = static_cast<uint32_t>(body.size());
    std::copy(body.begin(), body.end(), request.wire.message.begin());
  }'''),
])
cpp('AuxOwnedNativePeerChild.h', [
    ('  DaemonAuthorityReply GetBrowserStartupLease(uint32_t timeout_ms);',
     '  DaemonAuthorityReply GetBrowserStartupLease(uint32_t timeout_ms);\n'
     '  DaemonAuthorityReply ExchangeUiCaptureFrame(std::span<const uint8_t> frame, uint32_t timeout_ms);'),
])
cpp('AuxOwnedNativePeerChild.cc', [
    ('DaemonAuthorityReply SelectedNativeHome::GetAgentInboxV2MasterKey(uint32_t timeout_ms) {',
     '''DaemonAuthorityReply SelectedNativeHome::ExchangeUiCaptureFrame(
    std::span<const uint8_t> frame, uint32_t timeout_ms) {
  auto before = InspectOwnedChild();
  if (before.closed || before.wrong_process || before.exit_observed_and_reaped || before.exit_ownership_unknown)
    return {DaemonAuthorityStatus::closed, {}};
  auto reply = state_->transfer->ExchangeUiCaptureFrame(frame, timeout_ms);
  auto after = InspectOwnedChild();
  if (after.closed || after.wrong_process || after.exit_observed_and_reaped ||
      after.exit_ownership_unknown || after.child_pid != before.child_pid)
    return {DaemonAuthorityStatus::closed, {}};
  return reply;
}
DaemonAuthorityReply SelectedNativeHome::GetAgentInboxV2MasterKey(uint32_t timeout_ms) {'''),
])
cpp('AuxSelectedStateHome.h', [
    ('NativeDaemonSignatureReply ObserveNativeSelectedDaemonChallenge(std::string_view encoded_message);',
     '// Native-only capture data route, never migration/profile authority.\n'
     'DaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(std::span<const uint8_t> frame);\n'
     'NativeDaemonSignatureReply ObserveNativeSelectedDaemonChallenge(std::string_view encoded_message);'),
])
cpp('AuxSelectedStateHome.cc', [
    ('// No caller path, token, FD, generation or readiness flag can mint admission.',
     '''DaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(std::span<const uint8_t> frame) {
  auto& state = CurrentState();
  if (getpid() != state.process) return {DaemonAuthorityStatus::wrongProcess, {}};
  if (frame.empty() || frame.size() > 8192) return {};
  std::shared_ptr<SelectedNativeHome> owner;
  std::shared_ptr<const BrowserPrivateRoots> roots;
  uint64_t generation = 0;
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    if (state.closed || state.browser_shutdown_phase || state.initializing ||
        !state.selected || !state.admitted_browser_roots || !state.browser_generation) return {};
    owner = state.selected; roots = state.admitted_browser_roots;
    generation = state.browser_generation;
    ++state.active_reads;
  }
  auto finish = +[](State* held) { std::lock_guard<std::mutex> lock(held->mutex); --held->active_reads; };
  std::unique_ptr<State, decltype(finish)> active(&state, finish);
  auto valid = [&] {
    auto pulse = owner->InspectReadyPulse();
    auto child = owner->InspectOwnedChild();
    if (!pulse || !Fresh(*pulse) || pulse->generation != generation || !roots->Revalidate() ||
        child.closed || child.wrong_process || child.exit_observed_and_reaped ||
        child.exit_ownership_unknown || child.child_pid <= 1) return false;
    std::lock_guard<std::mutex> lock(state.mutex);
    return !state.closed && !state.browser_shutdown_phase && state.selected == owner &&
        state.admitted_browser_roots == roots && state.browser_generation == generation;
  };
  if (!valid()) return {};
  auto reply = owner->ExchangeUiCaptureFrame(frame, 2'000);
  if (reply.status != DaemonAuthorityStatus::ready) return reply;
  // A lost holder fence/ACK is unknown, not proof that physical IO did not run.
  if (!valid()) return {};
  auto accepted = owner->AcceptAuthorityReply(reply, 2'000);
  if (accepted != DaemonAuthorityStatus::ready) return {accepted, {}};
  if (!valid()) return {};
  return reply;
}
// No caller path, token, FD, generation or readiness flag can mint admission.'''),
])

composition = json.loads((PRIOR / 'daemon-source-composition.json').read_text())
assert composition['sourceAssociationPassed'] and composition['sourceCount'] == 48
for row in composition['sources']:
    assert sha(Path(row['path']).read_bytes()) == row['sha256']
dispatcher = Path(next(row['path'] for row in composition['sources'] if Path(row['path']).name == 'AuxOwnedCommandDispatcher.swift'))
frames = (SOURCE / 'frames.inc.swift').read_text()
project(dispatcher, 'AuxOwnedCommandDispatcher.swift', [
    ('                let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),bytes.count-offset)}',
     '                let remaining=bytes.count-offset\n'
     '                let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),remaining)}'),
    ('        var nativeFreshRuntime:NativeFreshRuntimeCapturedContext? = nil',
     '        var nativeFreshRuntime:NativeFreshRuntimeCapturedContext? = nil\n'
     '        var uiCaptureUpload:UiCaptureUpload? = nil\n'
     '        var uiCaptureDownload:UiCaptureDownload? = nil'),
    ('    // Native-only seams: not registered in the string command dispatcher or',
     frames + '\n    // Native-only seams: not registered in the string command dispatcher or'),
])
authority = Path(next(row['path'] for row in composition['sources'] if Path(row['path']).name == 'AuxPreparedDaemonAuthority.swift'))
project(authority, 'AuxPreparedDaemonAuthority.swift', [
    ('case signature,publicKeys,inboxKey,browserStartup}', 'case signature,publicKeys,inboxKey,browserStartup,uiCapture}'),
    ('        case .browserStartup:command="" // Native capability route, never generic command dispatch.',
     '        case .browserStartup,.uiCapture:command="" // Native-only routes, never generic command dispatch.'),
    ('    let response:String?=request.command.utf8CString.withUnsafeBufferPointer{command in',
     '''    if request.kind == .uiCapture {
        do {
            var reply=try AuxCommandDispatcherRegistry.shared.exchangeUiStorageCaptureFrame(entry.owner.handle,frame:request.message)
            guard !reply.isEmpty,reply.count<=8192 else{return .failed}
            return .completed(DaemonAuthorityPayload(&reply))
        }catch{return .failed}
    }
    let response:String?=request.command.utf8CString.withUnsafeBufferPointer{command in'''),
    ('capacity:UInt32,written:UnsafeMutablePointer<UInt32>?)->Int32 {\n    guard getpid()==daemonAuthorityProcess else{return -2}',
     'capacity:UInt32,written:UnsafeMutablePointer<UInt32>?,messageCount:UInt32=0)->Int32 {\n    guard getpid()==daemonAuthorityProcess else{return -2}'),
    ('    }else{bytes=Data()}\n    daemonAuthorityLock.lock()',
     '''    }else if kind == .uiCapture {
        guard let message,messageCount>0,messageCount<=8192 else{return -1}
        bytes=Data(bytes:message,count:Int(messageCount))
    }else{bytes=Data()}
    daemonAuthorityLock.lock()'''),
    ('@_cdecl("AuxBeginPreparedDaemonSignature")',
     '''@_cdecl("AuxBeginPreparedUiCapture")
func AuxBeginPreparedUiCapture(_ id:UInt64,_ sequence:UInt64,_ nonce:UnsafePointer<UInt8>?,_ message:UnsafePointer<UInt8>?,_ count:UInt32,_ output:UnsafeMutablePointer<UInt8>?,_ capacity:UInt32,_ written:UnsafeMutablePointer<UInt32>?)->Int32 {
    operatePreparedDaemonAuthority(id,sequence:sequence,nonce:nonce,kind:.uiCapture,message:message,output:output,capacity:capacity,written:written,messageCount:count)
}
@_cdecl("AuxBeginPreparedDaemonSignature")'''),
])
manifest = {'format': 'aux.ui-native-capture-transport.source.v1', 'files': files,
            'swiftPredecessor': str(PRIOR / 'daemon-source-composition.json'),
            'swiftPredecessorSha256': sha((PRIOR / 'daemon-source-composition.json').read_bytes()),
            'swiftSources': composition['sources'], 'authorityWireVersion': 6,
            'rootSelectionFromCaller': False, 'migrationActivationAuthorized': False}
(HERE / 'source-plan.json').write_text(json.dumps(manifest, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'projectedFiles': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files),
                  'nativeCheckoutChanged': False, 'authorityWireVersion': 6}))

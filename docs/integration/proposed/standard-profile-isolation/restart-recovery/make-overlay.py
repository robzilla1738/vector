from pathlib import Path
import json,hashlib,difflib
p=Path(__file__).resolve().parent;changes=[]
def edit(name,old,new):
 f=p/'source'/name;s=f.read_text();assert s.count(old)==1,(name,old[:100]);f.write_text(s.replace(old,new));changes.append({'path':name,'find':old,'replace':new,'count':1})
for f in (p/'baseline').glob('*.swift'):(p/'source'/f.name).write_bytes(f.read_bytes())
n='AuxBrowserFreshRootAdmission.swift'
edit(n,'// Recover only interrupted pre-grant preparation; admitted roots stay refused.','// Standard profile isolation: paired, authenticated-owner clean shutdown permits reopen.\n// Interrupted ADMITTED/partial/mixed records remain unknown; never reset user data.')
edit(n,'private enum Phase{case prepared,admitted,failed}','private enum Phase{case prepared,admitted,clean,failed}\n    private let permitsExistingData:Bool\n    private let priorCleanReceipt:String\n    private var pendingCleanAcknowledgement:Data?')
edit(n,'records:[Data],reservation:String) {','records:[Data],reservation:String,permitsExistingData:Bool,priorCleanReceipt:String) {')
edit(n,'self.records=records;self.reservation=reservation','self.records=records;self.reservation=reservation;self.permitsExistingData=permitsExistingData;self.priorCleanReceipt=priorCleanReceipt')
edit(n,'            // Even recovery admits only directories containing the exact marker.\n            // Existing Local State, profile files, v1 markers and unknowns refuse.\n            try inventory(root,allowed:[".","..",marker])','            // Existing contents are considered only after BOTH exact records\n            // establish clean provenance. Missing markers still require emptiness.')
a='''        // Lock acquisition is exclusion only, never evidence browser work drained.''';b='''        // Missing/mixed/truncated/mismatched records never recreate or reset.'''
s=(p/'source'/n).read_text();old=s[s.index(a):s.index(b)]
new='''        // Locks exclude concurrent Aux owners, never prove writer settlement.
        var permitsExistingData=false,priorCleanReceipt=""
        let reservation:String
        if reopening {
            for fd in markers {records.append(try readRecord(fd))}
            let first=try decodeRecord(records[0],policy:policy,role:1,root:roots[0])
            let second=try decodeRecord(records[1],policy:policy,role:2,root:roots[1])
            guard first==second else{throw AuxFreshColdGuardError.path}
            guard first.phase=="prepared" || first.phase=="clean" else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            permitsExistingData=first.existing || first.phase=="clean"
            priorCleanReceipt=first.cleanReceipt
            reservation=first.phase=="clean" ? UUID().uuidString:first.reservation
            if !permitsExistingData {for root in roots{try inventory(root,allowed:[".","..",marker])}}
        }else {
            for root in roots{try inventory(root,allowed:[".","..",marker])}
            reservation=UUID().uuidString
        }
        // Explicit canonical v2 PREPARED -> v3 migration; v2 ADMITTED cannot
        // reach here. Consume clean provenance before granting any browser work.
        records=[]
        for i in roots.indices {
            let record=try bindingV3(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"prepared",existing:permitsExistingData,cleanReceipt:priorCleanReceipt)
            try writeRecord(record,fd:markers[i]);guard fsync(roots[i])==0 else{throw AuxFreshColdGuardError.io(errno)}
            records.append(record)
        }
        let owned=AuxBrowserFreshRootAdmission(policy:policy,generation:generation,paths:paths,roots:roots,markers:markers,records:records,reservation:reservation,permitsExistingData:permitsExistingData,priorCleanReceipt:priorCleanReceipt)
        transferred=true;try owned.revalidate();return owned
'''
edit(n,old,new)
a='''    private static func preparedReservation(''';s=(p/'source'/n).read_text();old=s[s.index(a):s.index('    private static func readRecord(',s.index(a))]
new='''    private struct Stored:Equatable {
        let reservation:String
        let generation:UInt64
        let phase:String
        let existing:Bool
        let cleanReceipt:String
    }
    private static func bindingV3(policy:AuxAuthenticatedFreshBootstrapPolicy,role:Int,root:Int32,reservation:String,generation:UInt64,phase:String,existing:Bool,cleanReceipt:String)throws->Data {
        var value=stat();guard fstat(root,&value)==0 else{throw AuxFreshColdGuardError.metadata}
        return try JSONSerialization.data(withJSONObject:["format":"aux.browser.recoverable-root-lease.v3","policySha256":policy.policySha256,"role":role,"device":String(value.st_dev),"inode":String(value.st_ino),"generation":String(generation),"reservation":reservation,"phase":phase,"existingData":existing,"cleanReceiptSha256":cleanReceipt],options:[.sortedKeys,.withoutEscapingSlashes])
    }
    private static func decodeRecord(_ record:Data,policy:AuxAuthenticatedFreshBootstrapPolicy,role:Int,root:Int32)throws->Stored {
        let object=try strictEnvelopeObject(record)
        guard let reservation=object["reservation"] as? String,UUID(uuidString:reservation)?.uuidString==reservation,
              let g=object["generation"] as? String,let generation=UInt64(g),generation>0,String(generation)==g else{throw AuxFreshColdGuardError.path}
        if object["format"] as? String == "aux.browser.recoverable-root-lease.v2" {
            guard record == (try binding(policy:policy,role:role,root:root,reservation:reservation,generation:generation,phase:"prepared")) else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            return Stored(reservation:reservation,generation:generation,phase:"prepared",existing:false,cleanReceipt:"")
        }
        guard let phase=object["phase"] as? String,["prepared","admitted","clean"].contains(phase),
              let existing=object["existingData"] as? Bool,let receipt=object["cleanReceiptSha256"] as? String,
              receipt.isEmpty || (receipt.count==64 && receipt.allSatisfy({"0123456789abcdef".contains($0)})),
              !(existing || phase=="clean") || !receipt.isEmpty,
              record == (try bindingV3(policy:policy,role:role,root:root,reservation:reservation,generation:generation,phase:phase,existing:existing,cleanReceipt:receipt)) else{throw AuxFreshColdGuardError.path}
        return Stored(reservation:reservation,generation:generation,phase:phase,existing:existing,cleanReceipt:receipt)
    }
'''
edit(n,old,new)
edit(n,'        for root in roots{try Self.inventory(root,allowed:[".","..",Self.marker])}','        if !permitsExistingData {for root in roots{try Self.inventory(root,allowed:[".","..",Self.marker])}}')
edit(n,'        if phase == .prepared {\n            // Poison BEFORE','        guard phase == .prepared || phase == .admitted else{throw AuxFreshColdGuardError.path}\n        if phase == .prepared {\n            // Poison BEFORE')
edit(n,'                try Self.inventory(roots[i],allowed:[".","..",Self.marker])\n                let record=try Self.binding(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"admitted")','                if !permitsExistingData {try Self.inventory(roots[i],allowed:[".","..",Self.marker])}\n                let record=try Self.bindingV3(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"admitted",existing:permitsExistingData,cleanReceipt:priorCleanReceipt)')
edit(n,'    private static func metadata(','''    // Called only by the retained authenticated Owner after registry admission
    // is closed and every daemon/worker/utility writer has physically settled.
    // The peer method independently demands an authenticated all-browser report;
    // caller-supplied records, masks, PIDs and elapsed time cannot mint one.
    func completeCleanShutdown(peer:AuxLiveNativeParentConnection)throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()};try validateLocked()
        if phase == .clean {
            guard let report=pendingCleanAcknowledgement else{return}
            try peer.acknowledgeBrowserDrainReceipt(report)
            pendingCleanAcknowledgement=nil;return
        }
        guard phase == .admitted else{throw AuxFreshColdGuardError.path}
        let report=try peer.authenticatedBrowserDrainReceipt(generation:generation)
        try validateLocked()
        let digest=SHA256.hash(data:report).map{String(format:"%02x",$0)}.joined()
        phase = .failed // partial writes stay unknown; never retry into CLEAN
        var clean=[Data]()
        for i in roots.indices {
            let record=try Self.bindingV3(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"clean",existing:true,cleanReceipt:digest)
            try Self.writeRecord(record,fd:markers[i]);guard fsync(roots[i])==0 else{throw AuxFreshColdGuardError.io(errno)}
            clean.append(record)
        }
        records=clean;phase = .clean;pendingCleanAcknowledgement=report
        do{try validateLocked()}catch{phase = .failed;throw error}
        // This ACK informs the parent of already durable CLEAN. Its loss keeps
        // the parent observer unknown; it cannot undo physical settled writes.
        // Retain the exact report for idempotent ACK retry, never rewrite CLEAN.
        try peer.acknowledgeBrowserDrainReceipt(report)
        pendingCleanAcknowledgement=nil
    }
    private static func metadata(''')
# Peer callback is authenticated native-only, never exposed through NAPI/request fields.
n='AuxFreshColdInstallerGuard.swift'
edit(n,'import Darwin','import Darwin\nimport Security\n@_silgen_name("AuxCopyAuthenticatedBrowserDrainReport") private func copyAuthenticatedBrowserDrainReport(_ handle:UInt64,_ generation:UInt64,_ challenge:UnsafePointer<UInt8>,_ report:UnsafeMutablePointer<UInt8>)->Int32\n@_silgen_name("AuxAcknowledgeAuthenticatedBrowserDrainReport") private func acknowledgeAuthenticatedBrowserDrainReport(_ handle:UInt64,_ report:UnsafePointer<UInt8>)->Int32')
edit(n,'    deinit{if getpid()==process{releaseNativeParent(handle)}}','''    func authenticatedBrowserDrainReceipt(generation:UInt64)throws->Data {
        guard getpid()==process,generation>0 else{throw AuxFreshColdGuardError.wrongProcess}
        // Fresh challenge is generated here, never supplied by JavaScript or a
        // previous disk record. Native transport authenticates the retained peer.
        var challenge=[UInt8](repeating:0,count:32),report=[UInt8](repeating:0,count:128)
        guard SecRandomCopyBytes(kSecRandomDefault,challenge.count,&challenge)==errSecSuccess else{throw AuxFreshColdGuardError.metadata}
        let status=challenge.withUnsafeBufferPointer { input in report.withUnsafeMutableBufferPointer { output in
            copyAuthenticatedBrowserDrainReport(handle,generation,input.baseAddress!,output.baseAddress!)
        }}
        guard status==0 else{throw AuxFreshColdGuardError.peer(status)}
        func be(_ offset:Int,_ count:Int)->UInt64 {report[offset..<offset+count].reduce(UInt64(0)){($0<<8)|UInt64($1)}}
        guard be(0,4)==1,be(4,4)==0,be(8,8)==generation,be(16,8)>0,
              be(24,4)==6,be(28,4)==0,Array(report[32..<64])==challenge,
              report[64..<96].contains(where:{$0 != 0}),report[96..<128].contains(where:{$0 != 0}) else{throw AuxFreshColdGuardError.metadata}
        // status=settled must mean all physical browser/service/descendant
        // writers settled, not merely phase 6 or an absent/disconnected peer.
        return Data(report)
    }
    func acknowledgeBrowserDrainReceipt(_ report:Data)throws {
        guard getpid()==process,report.count==128 else{throw AuxFreshColdGuardError.wrongProcess}
        let status=report.withUnsafeBytes { bytes in acknowledgeAuthenticatedBrowserDrainReport(handle,bytes.bindMemory(to:UInt8.self).baseAddress!) }
        guard status==0 else{throw AuxFreshColdGuardError.peer(status)}
    }
    deinit{if getpid()==process{releaseNativeParent(handle)}}''')
edit(n,'    func createFreshHome()throws->AuxFreshNativeHome {','''    func completeBrowserCleanShutdown()throws {
        try revalidate()
        try browserAdmission.completeCleanShutdown(peer:peer)
        // Transport stays retained through durable completion; it is released
        // by the real Owner only after registry clean acknowledgement.
    }
    func createFreshHome()throws->AuxFreshNativeHome {''')
n='AuxNativeFreshStageCoordinator.swift'
edit(n,'    // Finite task-home capability for the future caller projection migration.','''    func completeBrowserCleanShutdown()throws {
        try revalidateNativeStageBinding()
        try coldGuard.completeBrowserCleanShutdown()
    }
    // Finite task-home capability for the future caller projection migration.''')
n='AuxOwnedCommandDispatcher.swift'
edit(n,'import CryptoKit','import CryptoKit\n@_silgen_name("AuxDevelopmentOwnerCleanSettlementStatus") private func nativeOwnerCleanSettlement(_ owner:UnsafeMutableRawPointer)->Int32')
edit(n,'    func retire(_ handle:UInt64)throws {',(p/'dispatcher-method.inc').read_text()+'    func retire(_ handle:UInt64)throws {')
edit(n,'    let handle:UInt64','    let handle:UInt64\n    func completeBrowserCleanShutdown()throws {\n        try AuxCommandDispatcherRegistry.shared.completeBrowserCleanShutdown(handle,ownerPointer:Unmanaged.passUnretained(self).toOpaque())\n    }')
manifest={'format':'aux.standard-restart.overlay.v1','changes':changes,'sources':[]}
for name in ['AuxBrowserFreshRootAdmission.swift','AuxFreshColdInstallerGuard.swift','AuxNativeFreshStageCoordinator.swift','AuxOwnedCommandDispatcher.swift']:
 before=(p/'baseline'/name).read_bytes();after=(p/'source'/name).read_bytes();manifest['sources'].append({'name':name,'inputSha256':hashlib.sha256(before).hexdigest(),'outputSha256':hashlib.sha256(after).hexdigest()});(p/(name+'.patch')).write_text(''.join(difflib.unified_diff(before.decode().splitlines(True),after.decode().splitlines(True),fromfile='a/'+name,tofile='b/'+name)))
(p/'overlay.json').write_text(json.dumps(manifest,indent=2)+'\n')

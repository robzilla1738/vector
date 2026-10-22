// Inactive captured-data binding only. No storage executor, admission or activation.
import Foundation
import CryptoKit

enum TerminalCommandContextError:Error { case notTerminal,selectorBinding,capture,publicDescriptor }
struct CapturedTerminalCommandEvidence {
    let mode:String
    let transactionId:String
    let journalSha256:String
    let selectorBindingsSha256:String
    let authorityProvenanceVerified=false
    let writerAdmissionVerified=false
    let activeSelectionPerformed=false
}
struct CapturedTerminalCommandContext {
    let core:AuxInstallationCommandCore
    let evidence:CapturedTerminalCommandEvidence
    private init(authority:AuxCapturedCommandAuthority,mode:String,transactionId:String,journal:String,bindings:String) {
        core = .init(context:.installed(authority))
        evidence = .init(mode:mode,transactionId:transactionId,journalSha256:journal,selectorBindingsSha256:bindings)
    }
    private static func hash(_ data:Data)->String { SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined() }
    private static func bindingHash<T:Encodable>(_ bindings:T)throws->String {
        let e=JSONEncoder();e.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        return hash(try e.encode(bindings))
    }
    private static func authority(rows:[String:Data],signingPublic:Data,kemPublic:Data)throws->AuxCapturedCommandAuthority {
        guard Set(rows.keys)==["metadata","signing","kem","wrappedRoot"] else{throw TerminalCommandContextError.capture}
        let metadata=try InstallationAuthorityMetadata(json:rows["metadata"]!)
        switch metadata.scheme {
        case .p256:return try AuxCapturedCommandAuthority.p256(metadata:metadata,
            signingPrivate:rows["signing"]!,signingPublic:signingPublic,
            kemPrivate:rows["kem"]!,kemPublic:kemPublic,wrappedRoot:rows["wrappedRoot"]!)
        case .pq:
            guard #available(macOS 26.0, *) else{throw EnvelopePortError.unsupportedAuthority}
            return try AuxCapturedCommandAuthority.pq(metadata:metadata,
                signingPrivate:rows["signing"]!,signingPublic:signingPublic,
                kemPrivate:rows["kem"]!,kemPublic:kemPublic,wrappedRoot:rows["wrappedRoot"]!)
        }
    }
    static func existing(checkpoint:StoredInstallationCheckpoint,review:ReviewedInstallationSelectorBindings,
                         candidate:PreparedInstallationCandidate,originals:CapturedInstallationRows,
                         targets:CapturedInstallationRows)throws->Self {
        let journal=checkpoint.journal
        try AdditiveInstallationTransaction.validateCandidateBinding(journal,candidate:candidate)
        let bindings=try bindingHash(journal.bindings)
        guard bindings==review.reviewSha256 else{throw TerminalCommandContextError.selectorBinding}
        // Checks ready phase, exact acknowledgement and all original/target hashes.
        _ = try AdditiveInstallationTransaction.verifiedReceipt(journal,checkpoint:checkpoint.acknowledgement,originals:originals,targets:targets)
        var rows=[String:Data]()
        for row in InstallationRow.allCases {
            guard case .data(let data)=targets.result(row)else{throw TerminalCommandContextError.capture}
            rows[row.rawValue]=data
        }
        let context=try authority(rows:rows,signingPublic:candidate.signingPublicKey,kemPublic:candidate.kemPublicKey)
        return .init(authority:context,mode:"existing-migration",transactionId:journal.transactionId,journal:checkpoint.sha256,bindings:bindings)
    }
    static func fresh(checkpoint:StoredFreshInstallationCheckpoint,candidate:PreparedFreshAuxCohort,
                      targets:CallerCapturedFreshTargets)throws->Self {
        let journal=checkpoint.journal
        try FreshInstallationTransaction.validateCandidateBinding(journal,candidate:candidate)
        guard journal.phase == .ready,try journal.checkpoint().journalSha256==checkpoint.sha256 else{throw TerminalCommandContextError.notTerminal}
        var rows=[String:Data]()
        for row in freshRoles {
            guard case .bytes(let data)=targets.value(row),data.count<=16_384,
                  hash(data)==journal.targetHashes[row] else{throw TerminalCommandContextError.capture}
            rows[row]=data
        }
        func publicBytes(_ key:String)throws->Data {
            guard let text=journal.publicDescriptor[key],let bytes=Data(base64Encoded:text),
                  bytes.base64EncodedString()==text else{throw TerminalCommandContextError.publicDescriptor}
            return bytes
        }
        let context=try authority(rows:rows,signingPublic:publicBytes("sig_pub"),kemPublic:publicBytes("kem_pub"))
        guard context.scheme==journal.publicDescriptor["scheme"] else{throw TerminalCommandContextError.publicDescriptor}
        return .init(authority:context,mode:"fresh",transactionId:journal.transactionId,journal:checkpoint.sha256,bindings:try bindingHash(journal.bindings))
    }
}

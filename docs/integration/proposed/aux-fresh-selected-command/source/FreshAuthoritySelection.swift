// External/native preparation content, never an admission credential.
import Foundation

enum FreshSelectionError:Error {case binding,missing,conflict,notReady,input}
struct FreshAuthoritySelection:Codable,Equatable {
    let format:String
    let transactionId:String;let scope:String;let accessGroup:String
    let newScopeReviewId:String;let candidateSha256:String;let journalSha256:String
    let stageBindingSha256:String;let stagePayloadSha256:String
    let securityReviewSha256:String;let selectorBindingsSha256:String
    let targetHashes:[String:String];let publicDescriptor:[String:String]
    static func prepare(stored:StoredFreshInstallationCheckpoint,review:ReviewedFreshSecurityBoundary,
                        terminal:RecoveredFreshTerminalCommandContext)throws->Self {
        let j=stored.journal,e=terminal.evidence
        guard j.phase == .ready,try j.checkpoint().journalSha256==stored.sha256,
              e.mode=="recovered-fresh",e.transactionId==j.transactionId,e.scope==j.scope,
              e.newScopeReviewId==j.newScopeReviewId,e.journalSha256==stored.sha256,
              e.securityReviewSha256==review.reviewSha256,
              review.transactionId==j.transactionId,review.scope==j.scope,
              review.candidateSha256==j.candidateSha256,review.targetHashes==j.targetHashes,
              review.publicDescriptor==j.publicDescriptor,review.targetBindings==j.bindings else{throw FreshSelectionError.binding}
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        guard e.selectorBindingsSha256==freshJournalHash(try encoder.encode(j.bindings)) else{throw FreshSelectionError.binding}
        let result=Self(format:"aux.install.fresh.selection.v1",transactionId:j.transactionId,scope:j.scope,
            accessGroup:review.stage.accessGroup,newScopeReviewId:j.newScopeReviewId,candidateSha256:j.candidateSha256,
            journalSha256:stored.sha256,stageBindingSha256:e.stageBindingSha256,stagePayloadSha256:e.stagePayloadSha256,
            securityReviewSha256:e.securityReviewSha256,selectorBindingsSha256:e.selectorBindingsSha256,
            targetHashes:j.targetHashes,publicDescriptor:j.publicDescriptor)
        let runtime=try result.runtimeSelection()
        for (role,binding) in zip(freshRoles,j.bindings) {
            let s=try runtime.selector(role)
            guard binding.row==role,binding.target.service==s.service,binding.target.account==s.account,
                  binding.target.accessGroup==s.accessGroup else{throw FreshSelectionError.binding}
        }
        try result.authenticate(terminal)
        return result
    }
    func runtimeSelection()throws->AuxRuntimeSelection {
        guard format=="aux.install.fresh.selection.v1",UUID(uuidString:newScopeReviewId)?.uuidString==newScopeReviewId,
              Set(publicDescriptor.keys)==["scheme","sig_pub","kem_pub"],
              let scheme=publicDescriptor["scheme"],let s=publicDescriptor["sig_pub"],let k=publicDescriptor["kem_pub"],
              let sig=Data(base64Encoded:s),sig.base64EncodedString()==s,let kem=Data(base64Encoded:k),kem.base64EncodedString()==k,
              [candidateSha256,journalSha256,stageBindingSha256,stagePayloadSha256,securityReviewSha256,selectorBindingsSha256].allSatisfy({$0.utf8.count==64 && $0.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}) else{throw FreshSelectionError.binding}
        return try .init(scope:scope,generationId:transactionId,accessGroup:accessGroup,scheme:scheme,
                         signingPublicKey:sig,kemPublicKey:kem,targetHashes:targetHashes)
    }
    func authenticate(_ terminal:RecoveredFreshTerminalCommandContext)throws {
        let e=terminal.evidence
        guard e.mode=="recovered-fresh",e.transactionId==transactionId,e.scope==scope,e.newScopeReviewId==newScopeReviewId,
              e.journalSha256==journalSha256,e.stageBindingSha256==stageBindingSha256,e.stagePayloadSha256==stagePayloadSha256,
              e.securityReviewSha256==securityReviewSha256,e.selectorBindingsSha256==selectorBindingsSha256 else{throw FreshSelectionError.binding}
        _ = try runtimeSelection()
    }
    func encoded()throws->Data {
        _ = try runtimeSelection()
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        let data=try encoder.encode(self);guard data.count<=16_384 else{throw FreshSelectionError.binding};return data
    }
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","transactionId","scope","accessGroup","newScopeReviewId","candidateSha256","journalSha256","stageBindingSha256","stagePayloadSha256","securityReviewSha256","selectorBindingsSha256","targetHashes","publicDescriptor"] else{throw FreshSelectionError.binding}
        let value=try JSONDecoder().decode(Self.self,from:bytes)
        guard try value.encoded()==bytes else{throw FreshSelectionError.binding};return value
    }
}
struct StoredFreshAuthoritySelection {
    let record:FreshAuthoritySelection;let sha256:String
    let state2LaunchAuthorized=false
    let writerAdmissionVerified=false
    let authorityProvenanceVerified=false
}

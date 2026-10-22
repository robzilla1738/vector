// Optional EXTERNAL migration-tool binding; not the production minimal reader.
// Actual host inspection must precede construction of any Security executor.
import Foundation

struct AuxObservedSelectedHostBinding {
    let observed:AuxObservedCleanHost
    let context:CapturedTerminalCommandContext
    let selectionSha256:String
    let state2LaunchAuthorized=false
    let writerCustodyVerified=false
    let authorityProvenanceVerified=false
    private init(observed:AuxObservedCleanHost,context:CapturedTerminalCommandContext,selectionSha256:String){self.observed=observed;self.context=context;self.selectionSha256=selectionSha256}
    static func existing(observed:AuxObservedCleanHost,policy:AuxCleanHostPolicy,store:PrivateInstallationJournalStore,review:ReviewedInstallationSelectorBindings,candidate:PreparedInstallationCandidate,originals:CapturedInstallationRows,targets:CapturedInstallationRows)throws->Self {
        guard try observed.policySha256==policy.policySha256,observed.scope==policy.scope,observed.accessGroup==policy.accessGroup,observed.role==policy.role,
              let checkpoint=try store.loadCurrent()else{throw AuxCleanHostError.selection}
        let selection=try store.loadSelection(),record=selection.record
        guard record.phase == .selected,record.candidate.stateIdentityVersion==2,record.candidate.installationCandidateSha256==checkpoint.journal.candidateSha256,
              record.terminalJournalSha256==checkpoint.sha256,record.selectorBindingsSha256==review.reviewSha256 else{throw AuxCleanHostError.selection}
        let service="aux."+policy.scope+".installation.v2"
        let account=["metadata":"meta","signing":"sig","kem":"kem","wrappedRoot":"dk"]
        guard checkpoint.journal.bindings.allSatisfy({binding in binding.target.service==service && binding.target.account==service+"."+(account[binding.row] ?? "INVALID") && binding.target.accessGroup==policy.accessGroup})else{throw AuxCleanHostError.selection}
        // Exact ready checkpoint, review/candidate/original/target hashes and
        // recovered Aux-v2 authority import/open. Does not execute a SecItem call.
        let context=try CapturedTerminalCommandContext.existing(checkpoint:checkpoint,review:review,candidate:candidate,originals:originals,targets:targets)
        guard context.evidence.journalSha256==record.terminalJournalSha256,context.evidence.selectorBindingsSha256==record.selectorBindingsSha256 else{throw AuxCleanHostError.selection}
        // Recheck the external selection HEAD after crypto work; not an all-
        // writers fence or atomicity claim with uncooperating mutations.
        guard try store.loadSelection().sha256==selection.sha256,try store.loadCurrent()?.sha256==checkpoint.sha256 else{throw AuxCleanHostError.selection}
        return .init(observed:observed,context:context,selectionSha256:selection.sha256)
    }
}

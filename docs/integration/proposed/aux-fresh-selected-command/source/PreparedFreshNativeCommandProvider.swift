// Native-only PREPARATION composition. No JS registration/admission capability.
// The real never-used scope/history/cohort producer remains a prerequisite.
import Foundation

enum PreparedFreshCommandOutcome {
    case progressed
    case unresolved
    case blocked
    case selected(SelectedFreshCommandContext)
}
struct SelectedFreshCommandContext {
    let runtime:AuxRuntimeCapturedCommandContext
    let durableSelection:StoredFreshAuthoritySelection
    let initializationReply:String
    private init(runtime:AuxRuntimeCapturedCommandContext,selection:StoredFreshAuthoritySelection)throws {
        self.runtime=runtime;durableSelection=selection
        initializationReply=runtime.core.run(command:"install-init")
        let reply=try strictEnvelopeObject(Data(initializationReply.utf8))
        guard Set(reply.keys)==["scheme","sig_pub","kem_pub"],
              reply["scheme"] as? String==selection.record.publicDescriptor["scheme"],
              reply["sig_pub"] as? String==selection.record.publicDescriptor["sig_pub"],
              reply["kem_pub"] as? String==selection.record.publicDescriptor["kem_pub"] else{throw FreshSelectionError.binding}
    }
    fileprivate static func prepare(selection:StoredFreshAuthoritySelection,
                                    terminal:RecoveredFreshTerminalCommandContext,
                                    targets:CallerCapturedFreshTargets)throws->Self {
        try selection.record.authenticate(terminal)
        func row(_ role:String)->AuxRuntimeTargetRead {
            switch targets.value(role) {
            case .absent:return .missing
            case .bytes(let data):return .bytes(data)
            case .unavailable:return .unavailable
            case .invalid:return .invalid
            }
        }
        let runtime=try AuxRuntimeCapturedCommandContext.validate(selection:selection.record.runtimeSelection(),rows:.init(metadata:row("metadata"),signing:row("signing"),kem:row("kem"),wrappedRoot:row("wrappedRoot")))
        return try .init(runtime:runtime,selection:selection)
    }
}
final class PreparedFreshNativeCommandProvider {
    private let root:String
    private let boundary:FreshInstallationSecurityBoundary
    // Constructing this source adapter performs no Security call. Methods do;
    // it must remain unregistered until real native admission authorizes them.
    init(canonicalDisposableRoot:String,review:ReviewedFreshSecurityBoundary) {
        root=canonicalDisposableRoot;boundary=ExactFreshDataProtectionBoundary(review:review)
    }
#if AUX_FRESH_COMMAND_FIXTURE
    init(canonicalDisposableRoot:String,capturedBoundary:FreshInstallationSecurityBoundary) {
        root=canonicalDisposableRoot;boundary=capturedBoundary
    }
#endif
    private func validateRuntimeBindings()throws {
        let review=boundary.review,d=review.publicDescriptor
        guard Set(d.keys)==["scheme","sig_pub","kem_pub"],let scheme=d["scheme"],
              let sigText=d["sig_pub"],let kemText=d["kem_pub"],
              let sig=Data(base64Encoded:sigText),sig.base64EncodedString()==sigText,
              let kem=Data(base64Encoded:kemText),kem.base64EncodedString()==kemText,
              review.targetBindings.map(\.row)==freshRoles else{throw FreshSelectionError.binding}
        let selected=try AuxRuntimeSelection(scope:review.scope,generationId:review.transactionId,accessGroup:review.stage.accessGroup,
            scheme:scheme,signingPublicKey:sig,kemPublicKey:kem,targetHashes:review.targetHashes)
        for (role,binding) in zip(freshRoles,review.targetBindings) {
            let expected=try selected.selector(role)
            guard binding.target.service==expected.service,binding.target.account==expected.account,
                  binding.target.accessGroup==expected.accessGroup else{throw FreshSelectionError.binding}
        }
    }
    private func store()throws->PrivateFreshInstallationJournalStore {
        try .init(canonicalDisposableRoot:root,transactionId:boundary.review.transactionId)
    }
    private func coordinator()->FreshSecurityStepCoordinator {
        .init(canonicalDisposableRoot:root,boundary:boundary)
    }
    // Explicit external pre-generated cohort + CallerAsserted review. This API
    // does not generate authority or relabel those assertions authenticated.
    // No public install-init callback invokes it in the shipped/current graph.
    func beginCallerReviewedInitialization(cohort:PreparedFreshAuxCohort,
                                          review:CallerAssertedNeverUsedScopeReview)throws->PreparedFreshCommandOutcome {
        try validateRuntimeBindings()
        return try map(coordinator().begin(cohort:cohort,review:review))
    }
    // Exactly one durable coordinator step; uncertain Adds remain observation-
    // only under the existing coordinator. No missing state causes generation.
    func advancePreparedInitialization()throws->PreparedFreshCommandOutcome {
        try validateRuntimeBindings()
        return try map(coordinator().advanceOne())
    }
    private func map(_ outcome:FreshCoordinatorOutcome)throws->PreparedFreshCommandOutcome {
        switch outcome {
        case .progressed:return .progressed
        case .unresolved:return .unresolved
        case .blocked:return .blocked
        case .ready(let terminal):
            let journalStore=try store()
            guard let current=try journalStore.loadCurrent()else{throw FreshSelectionError.missing}
            let record=try FreshAuthoritySelection.prepare(stored:current,review:boundary.review,terminal:terminal)
            _ = try journalStore.publishFreshSelection(record,terminal:terminal)
            // Reopen durable selection and independently re-capture/revalidate
            // terminal/stage/targets before returning any runtime/core context.
            return .selected(try recoverSelectedCommandContext())
        }
    }
    // Restart never calls begin, a factory or an Add. It requires a durable
    // selection AND ready journal before the coordinator can observe terminal.
    func recoverSelectedCommandContext()throws->SelectedFreshCommandContext {
        try validateRuntimeBindings()
        let journalStore=try store()
        guard let selected=try journalStore.loadFreshSelection(),
              let current=try journalStore.loadCurrent(),current.journal.phase == .ready else{throw FreshSelectionError.notReady}
        guard case .ready(let terminal)=try coordinator().advanceOne()else{throw FreshSelectionError.notReady}
        let expected=try FreshAuthoritySelection.prepare(stored:current,review:boundary.review,terminal:terminal)
        guard expected==selected.record else{throw FreshSelectionError.binding}
        // Re-fsync a same-content selected pointer after restart, then read it
        // back before producing the exact install-init JSON/public authority.
        _ = try journalStore.publishFreshSelection(expected,terminal:terminal)
        guard let reopened=try journalStore.loadFreshSelection(),reopened.record==expected,reopened.sha256==selected.sha256 else{throw FreshSelectionError.conflict}
        return try .prepare(selection:reopened,terminal:terminal,targets:boundary.captureTargets())
    }
}

// External migration-tool consumer only. Captured terminal/selection are not
// native provenance, custody, entitlement review or activation authority.
import Foundation

enum ExistingTerminalCskError: Error { case terminal, selection, scope, changed }

private final class ExistingSelectedInstallationFence {
    let terminal: CapturedTerminalCommandContext
    private let store: PrivateInstallationJournalStore
    private let selectionSha256: String
    private let installationSha256: String

    init(terminal: CapturedTerminalCommandContext, store: PrivateInstallationJournalStore,
         binding: CapturedHistoricalAuxCredentialBinding) throws {
        guard terminal.evidence.mode == "existing-migration",
              let checkpoint = try store.loadCurrent(), checkpoint.journal.phase == .ready,
              checkpoint.sha256 == terminal.evidence.journalSha256,
              checkpoint.journal.transactionId == terminal.evidence.transactionId else {
            throw ExistingTerminalCskError.terminal
        }
        let selected = try store.loadSelection()
        try selected.record.authenticate(terminal)
        guard selected.record.phase == .selected,
              selected.record.candidate.stateIdentityVersion == 2,
              selected.record.terminalJournalSha256 == checkpoint.sha256,
              selected.record.candidate.installationCandidateSha256 == checkpoint.journal.candidateSha256,
              selected.record.selectorBindingsSha256 == terminal.evidence.selectorBindingsSha256,
              selectionHash(try selectionEncode(checkpoint.journal.bindings)) == terminal.evidence.selectorBindingsSha256 else {
            throw ExistingTerminalCskError.selection
        }
        let scope = CapturedHistoricalAuxCredentialBinding.scope
        let group = CapturedHistoricalAuxCredentialBinding.group
        let service = "aux." + scope + ".installation.v2"
        let suffixes = ["metadata": "meta", "signing": "sig", "kem": "kem", "wrappedRoot": "dk"]
        guard checkpoint.journal.bindings.count == 4,
              Set(checkpoint.journal.bindings.map(\.row)) == Set(suffixes.keys),
              checkpoint.journal.bindings.allSatisfy({ row in
                  row.target.service == service && row.target.account == service + "." + suffixes[row.row]! && row.target.accessGroup == group
              }), binding.source.accessGroup == group, binding.target.accessGroup == group,
              binding.target.service == "aux." + scope + ".secure.v2." + binding.logicalKeyHash,
              binding.target.account == binding.target.service else { throw ExistingTerminalCskError.scope }
        self.terminal = terminal; self.store = store
        selectionSha256 = selected.sha256; installationSha256 = checkpoint.sha256
        try validate()
    }

    func validate() throws {
        guard let current = try store.loadCurrent(), current.sha256 == installationSha256,
              current.journal.phase == .ready,
              current.journal.transactionId == terminal.evidence.transactionId else { throw ExistingTerminalCskError.changed }
        let selected = try store.loadSelection()
        try selected.record.authenticate(terminal)
        guard selected.sha256 == selectionSha256, selected.record.phase == .selected,
              selected.record.terminalJournalSha256 == installationSha256 else { throw ExistingTerminalCskError.changed }
    }
}

// Recheck the actual selected pointer/current checkpoint around every captured
// credential boundary callback. This is not atomic with uncooperating writers.
private struct SelectedExistingCredentialBoundary: AuxCopyOnlyCredentialBoundary {
    let fence: ExistingSelectedInstallationFence
    let underlying: AuxCopyOnlyCredentialBoundary
    func readSource(_ source: AuxSecureStoreSelector) -> CapturedAuxCredentialRow {
        do {
            try fence.validate(); let result = underlying.readSource(source)
            try fence.validate(); return result
        } catch { return .invalid }
    }
    func readTarget(_ target: AuxSecureStoreSelector) -> CapturedAuxCredentialRow {
        do {
            try fence.validate(); let result = underlying.readTarget(target)
            try fence.validate(); return result
        } catch { return .invalid }
    }
    func addTarget(_ target: AuxSecureStoreSelector, bytes: Data) throws -> CapturedAuxCredentialAddStatus {
        try fence.validate()
        let status = try underlying.addTarget(target, bytes: bytes)
        // A changed selection after an actual Add is unknown to the handoff,
        // never a successful return or permission to replay its consumed Add.
        try fence.validate()
        return status
    }
}

final class ExistingTerminalCskHandoff {
    private let fence: ExistingSelectedInstallationFence
    private let handoff: DurableCapturedCskHandoff
    private init(fence: ExistingSelectedInstallationFence, handoff: DurableCapturedCskHandoff) {
        self.fence = fence; self.handoff = handoff
    }
    // No caller root argument. The actual preserved installation authority
    // unwraps its Aux-v2 root only inside the command-core callback. This root is
    // the same one authenticated by the existing-migration terminal binder.
    static func begin(terminal: CapturedTerminalCommandContext, installationStore: PrivateInstallationJournalStore,
                      canonicalDisposableRoot: String, binding: CapturedHistoricalAuxCredentialBinding,
                      accountId: Int64, expectedOwner: CapturedCskOwner?, preparedBytes: Data,
                      boundary: AuxCopyOnlyCredentialBoundary) throws -> ExistingTerminalCskHandoff {
        let fence = try ExistingSelectedInstallationFence(terminal: terminal, store: installationStore, binding: binding)
        let selected = SelectedExistingCredentialBoundary(fence: fence, underlying: boundary)
        let handoff = try terminal.core.withCskPublicationRoot { root in
            try fence.validate()
            let handoff = try DurableCapturedCskHandoff.begin(
                canonicalDisposableRoot: canonicalDisposableRoot, binding: binding, accountId: accountId,
                expectedOwner: expectedOwner, capturedRoot: root, preparedBytes: preparedBytes, boundary: selected
            )
            try fence.validate()
            return handoff
        }
        return .init(fence: fence, handoff: handoff)
    }
    // Loaded CSK journals stay observation-only. No randomized rewrap or Add
    // capability is recreated, including a loaded draft/intent or absent target.
    static func resume(terminal: CapturedTerminalCommandContext, installationStore: PrivateInstallationJournalStore,
                       canonicalDisposableRoot: String, transactionId: String,
                       binding: CapturedHistoricalAuxCredentialBinding, accountId: Int64,
                       expectedOwner: CapturedCskOwner?, boundary: AuxCopyOnlyCredentialBoundary) throws -> ExistingTerminalCskHandoff {
        let fence = try ExistingSelectedInstallationFence(terminal: terminal, store: installationStore, binding: binding)
        let selected = SelectedExistingCredentialBoundary(fence: fence, underlying: boundary)
        let handoff = try terminal.core.withCskPublicationRoot { root in
            try fence.validate()
            let handoff = try DurableCapturedCskHandoff.resume(
                canonicalDisposableRoot: canonicalDisposableRoot, transactionId: transactionId, binding: binding,
                accountId: accountId, expectedOwner: expectedOwner, capturedRoot: root, boundary: selected
            )
            try fence.validate()
            return handoff
        }
        return .init(fence: fence, handoff: handoff)
    }
    var transactionId: String { handoff.transactionId }
    func performOneStep() throws -> DurableCskHandoffOutcome {
        try fence.validate()
        let outcome = try handoff.performOneStep()
        try fence.validate()
        return outcome
    }
}

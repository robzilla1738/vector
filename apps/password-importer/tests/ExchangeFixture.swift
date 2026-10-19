import AuthenticationServices
import Foundation

if #available(macOS 26.0, *) {
    let password = ASImportableEditableField(id: nil, fieldType: .concealedString, value: "synthetic fixture password")
    let username = ASImportableEditableField(id: nil, fieldType: .string, value: "fixture-user")
    let note = ASImportableEditableField(id: nil, fieldType: .string, value: "synthetic fixture note")
    let item = ASImportableItem(id: Data([2]), created: Date(), lastModified: Date(), title: "Fixture login", scope: ASImportableCredentialScope(urls: [URL(string: "https://fixture.invalid")!]), credentials: [
        .basicAuthentication(.init(userName: username, password: password)), .note(.init(content: note)),
        .passkey(.init(credentialID: Data([3]), relyingPartyIdentifier: "fixture.invalid", userName: "fixture-user", userDisplayName: "Fixture", userHandle: Data([4]), key: Data([5])))])
    let account = ASImportableAccount(id: Data([1]), userName: "fixture-user", email: "fixture@example.invalid", collections: [], items: [item])
    let data = ASExportedCredentialData(accounts: [account], formatVersion: .v1, exporterRelyingPartyIdentifier: "fixture.invalid", exporterDisplayName: "Fixture", timestamp: Date())
    let result = try normalizeExchange(data)
    precondition(result.records.count == 2 && result.unsupported.isEmpty)
    precondition(result.records[0]["password"] as? String == password.value)
    precondition(result.records[0]["notes"] as? String == note.value)
    precondition(result.records[1]["privateKey"] as? String == Data([5]).base64EncodedString())
    print("SDK credential mapping fixture passed (no OS token or export)")
} else { print("SDK credential mapping fixture requires macOS26") }

// External migration/source-port component; no state I/O or authority creation.
import Foundation

enum EnvelopePortError: Error { case malformedRecord, unsupportedFormat, unsupportedAuthority, pqNotRecovered, authorityMismatch, rootMismatch }

// JSONSerialization validates grammar; bounded walk additionally rejects duplicate
// decoded member names, including escaped aliases, before interpreting any record.
func strictEnvelopeObject(_ data: Data) throws -> [String: Any] {
    guard data.count <= 16_384, let object = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw EnvelopePortError.malformedRecord }
    let bytes = [UInt8](data); var index = 0; var nodes = 0
    func whitespace() { while index < bytes.count && [9,10,13,32].contains(bytes[index]) { index += 1 } }
    func string() throws -> String {
        let start = index; index += 1
        while index < bytes.count { let byte = bytes[index]; index += 1
            if byte == 34 { return try JSONDecoder().decode(String.self, from: Data(bytes[start..<index])) }
            if byte == 92 { index += 1 }
        }; throw EnvelopePortError.malformedRecord
    }
    func value(_ depth: Int) throws {
        nodes += 1; guard depth <= 32, nodes <= 1_000 else { throw EnvelopePortError.malformedRecord }; whitespace()
        guard index < bytes.count else { throw EnvelopePortError.malformedRecord }
        if bytes[index] == 34 { _ = try string(); return }
        if bytes[index] == 123 {
            index += 1; whitespace(); var names = Set<String>()
            if index < bytes.count && bytes[index] != 125 { while true {
                whitespace(); let name = try string(); guard names.insert(name).inserted else { throw EnvelopePortError.malformedRecord }
                whitespace(); guard index < bytes.count && bytes[index] == 58 else { throw EnvelopePortError.malformedRecord }; index += 1
                try value(depth+1); whitespace(); if index >= bytes.count || bytes[index] != 44 { break }; index += 1
            }}; guard index < bytes.count && bytes[index] == 125 else { throw EnvelopePortError.malformedRecord }; index += 1
        } else if bytes[index] == 91 {
            index += 1; whitespace(); if index < bytes.count && bytes[index] != 93 { while true { try value(depth+1); whitespace(); if index >= bytes.count || bytes[index] != 44 { break }; index += 1 }}
            guard index < bytes.count && bytes[index] == 93 else { throw EnvelopePortError.malformedRecord }; index += 1
        } else { while index < bytes.count && ![9,10,13,32,44,93,125].contains(bytes[index]) { index += 1 } }
    }
    try value(0); whitespace(); guard index == bytes.count else { throw EnvelopePortError.malformedRecord }; return object
}

struct InstallationAuthorityMetadata {
    enum Scheme: String { case p256 = "p256_v1", pq = "pq_v1" }
    enum Storage: String { case secureEnclave = "secure_enclave", software }
    let scheme: Scheme; let storage: Storage
    init(json: Data) throws {
        let record = try strictEnvelopeObject(json)
        guard Set(record.keys).isSubset(of: ["scheme","key_storage"]), let name = record["scheme"] as? String, let scheme = Scheme(rawValue: name) else { throw EnvelopePortError.malformedRecord }
        self.scheme = scheme
        if let stored = record["key_storage"] { guard let string = stored as? String, let storage = Storage(rawValue: string) else { throw EnvelopePortError.malformedRecord }; self.storage = storage }
        else { self.storage = .secureEnclave } // Original resolvedKeyStorage at0x31a50.
    }
}

struct P256DkEnvelope {
    enum Version { case legacyV1, auxV2 }
    let version: Version; let ephemeralPublicKey: Data; let nonce: Data; let ciphertextAndTag: Data
    init(version: Version, ephemeralPublicKey: Data, nonce: Data, ciphertextAndTag: Data) throws {
        guard ephemeralPublicKey.count == 65, ephemeralPublicKey.first == 4, nonce.count == 12, ciphertextAndTag.count >= 16, ciphertextAndTag.count <= 4_096 else { throw EnvelopePortError.malformedRecord }
        self.version = version; self.ephemeralPublicKey = ephemeralPublicKey; self.nonce = nonce; self.ciphertextAndTag = ciphertextAndTag
    }
    init(json: Data) throws {
        let record = try strictEnvelopeObject(json); let version: Version
        if record["format"] == nil { version = .legacyV1; guard Set(record.keys) == ["scheme","purpose","ephemeral_public_key","nonce","ciphertext"], record["scheme"] as? String == "p256_v1" else { throw EnvelopePortError.unsupportedFormat } }
        else { version = .auxV2; guard Set(record.keys) == ["format","scheme","purpose","ephemeral_public_key","nonce","ciphertext"], record["format"] as? String == "aux.wrap.dk.v2", record["scheme"] as? String == "p256_v2" else { throw EnvelopePortError.unsupportedFormat } }
        guard record["purpose"] as? String == "dk" else { throw EnvelopePortError.unsupportedFormat }
        func base64(_ key: String) throws -> Data { guard let text = record[key] as? String, let decoded = Data(base64Encoded: text), decoded.base64EncodedString() == text else { throw EnvelopePortError.malformedRecord }; return decoded }
        try self.init(version: version, ephemeralPublicKey: base64("ephemeral_public_key"), nonce: base64("nonce"), ciphertextAndTag: base64("ciphertext"))
    }
    func auxJson() throws -> Data {
        guard version == .auxV2 else { throw EnvelopePortError.unsupportedFormat }
        return try JSONSerialization.data(withJSONObject: ["format":"aux.wrap.dk.v2","scheme":"p256_v2","purpose":"dk","ephemeral_public_key":ephemeralPublicKey.base64EncodedString(),"nonce":nonce.base64EncodedString(),"ciphertext":ciphertextAndTag.base64EncodedString()], options: [.sortedKeys])
    }
}

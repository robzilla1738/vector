// Compile-only proposed native container port. No KEM or authority operation here.
import Foundation

struct PqDkEnvelope {
    enum Version { case legacyV1, auxV2 }
    let version: Version
    let encapsulatedKey: Data
    let nonce: Data
    let ciphertextAndTag: Data
    init(version: Version, encapsulatedKey: Data, nonce: Data, ciphertextAndTag: Data) throws {
        guard !encapsulatedKey.isEmpty, encapsulatedKey.count <= 8_192, nonce.count == 12,
              ciphertextAndTag.count >= 17, ciphertextAndTag.count <= 4_096 else { throw EnvelopePortError.malformedRecord }
        self.version = version; self.encapsulatedKey = encapsulatedKey; self.nonce = nonce; self.ciphertextAndTag = ciphertextAndTag
    }
    init(json: Data) throws {
        let record = try strictEnvelopeObject(json)
        let version: Version
        if record["format"] == nil {
            version = .legacyV1
            guard Set(record.keys) == ["scheme","purpose","encapsulated_key","nonce","ciphertext"], record["scheme"] as? String == "pq_v1" else { throw EnvelopePortError.unsupportedFormat }
        } else {
            version = .auxV2
            guard Set(record.keys) == ["format","scheme","purpose","encapsulated_key","nonce","ciphertext"], record["format"] as? String == "aux.wrap.dk.v2", record["scheme"] as? String == "pq_v2" else { throw EnvelopePortError.unsupportedFormat }
        }
        guard record["purpose"] as? String == "dk" else { throw EnvelopePortError.unsupportedFormat }
        func base64(_ key: String) throws -> Data {
            guard let text = record[key] as? String, let data = Data(base64Encoded:text), data.base64EncodedString() == text else { throw EnvelopePortError.malformedRecord }; return data
        }
        try self.init(version:version, encapsulatedKey:base64("encapsulated_key"), nonce:base64("nonce"), ciphertextAndTag:base64("ciphertext"))
    }
    func auxJson() throws -> Data {
        guard version == .auxV2 else { throw EnvelopePortError.unsupportedFormat }
        return try JSONSerialization.data(withJSONObject:["format":"aux.wrap.dk.v2","scheme":"pq_v2","purpose":"dk","encapsulated_key":encapsulatedKey.base64EncodedString(),"nonce":nonce.base64EncodedString(),"ciphertext":ciphertextAndTag.base64EncodedString()],options:[.sortedKeys])
    }
}

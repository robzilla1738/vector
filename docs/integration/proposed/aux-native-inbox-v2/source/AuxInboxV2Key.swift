// Fixed native purpose only. This primitive does not establish authority.
import Foundation
import CryptoKit

enum AuxInboxV2KeyError:Error {case invalidRoot}
enum AuxInboxV2Key {
    static let info=Data("aux.agent-inbox.master-key.v2".utf8)
    static func derive(from root:Data)throws->Data {
        guard root.count==32 else{throw AuxInboxV2KeyError.invalidRoot}
        let key=HKDF<SHA256>.deriveKey(inputKeyMaterial:SymmetricKey(data:root),
            salt:Data(),info:info,outputByteCount:32)
        return key.withUnsafeBytes{Data($0)}
    }
}

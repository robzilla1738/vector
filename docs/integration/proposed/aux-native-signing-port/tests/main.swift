// Only fixed synthetic SOFTWARE authority and challenge from the private fixture.
let fixtureData = try Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))
let fixture = try JSONSerialization.jsonObject(with:fixtureData) as! [String:String]
func bytes(_ name:String) -> Data { Data(base64Encoded:fixture[name]!)! }
func check(_ value:Bool) { precondition(value) }
let metadata = try InstallationAuthorityMetadata(json:Data(#"{"scheme":"p256_v1","key_storage":"software"}"#.utf8))
let authority = try ExistingP256SigningAuthority(metadata:metadata, privateRepresentation:bytes("syntheticPrivate"), expectedPublicKey:bytes("publicKey"))
check(authority.publicKeyBase64 == fixture["publicKey"])
let challenge = bytes("syntheticAuxChallenge"), nodeSignature = bytes("nodeSignature")
check(try authority.verifies(signature:nodeSignature, challenge:challenge))
var altered = challenge; altered[0] ^= 1
check(try !authority.verifies(signature:nodeSignature, challenge:altered))
let reply = try authority.signatureReply(for:challenge)
check(Set(reply.keys) == ["signature"])
let signature = Data(base64Encoded:reply["signature"]!)!
check(signature.first == 0x30 && signature.count >= 68 && signature.count <= 72)
check(try authority.verifies(signature:signature, challenge:challenge))
do {
    _ = try ExistingP256SigningAuthority(metadata:metadata, privateRepresentation:bytes("syntheticPrivate"), expectedPublicKey:Data(repeating:0,count:65))
    preconditionFailure("Expected public authority mismatch")
} catch EnvelopePortError.authorityMismatch { }
let pqMetadata = try InstallationAuthorityMetadata(json:Data(#"{"scheme":"pq_v1"}"#.utf8))
do {
    _ = try ExistingP256SigningAuthority(metadata:pqMetadata, privateRepresentation:bytes("syntheticPrivate"), expectedPublicKey:bytes("publicKey"))
    preconditionFailure("Expected scheme refusal before import")
} catch EnvelopePortError.unsupportedAuthority { }
let output:[String:Any] = ["signature":reply["signature"]!,"publicKey":authority.publicKeyBase64,"softwareChecks":8,"enclaveExecuted":false,"pqExecuted":false,"keychainExecuted":false]
print(String(data:try JSONSerialization.data(withJSONObject:output,options:[.sortedKeys]),encoding:.utf8)!)

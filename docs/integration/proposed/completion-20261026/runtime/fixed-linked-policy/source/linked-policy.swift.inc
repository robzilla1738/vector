// Explicit source-only successor. This resource does not grant ES authority.
enum AuxFreshBootstrapLinkedPtyIdentity {
    static let format="aux.pty.fixed-linked-helper.v1"
    static let binding="aux_pty_builtin"
    static let rawHelperSha256="b9cf27a0832388cf154434f192d59739b2ce4c18463d7b4387b0c49e2857f79f"
    static func decode(_ value:Any?)throws->AuxFreshBootstrapPtyArtifact {
        guard let object=value as? [String:Any],Set(object.keys)==["format","binding","napi","spawnHelper"],
              object["format"] as? String==format,object["binding"] as? String==binding,
              let napi=object["napi"] as? NSNumber,CFGetTypeID(napi) != CFBooleanGetTypeID(),napi.intValue==8,napi.doubleValue==8,
              let fields=object["spawnHelper"] as? [String:Any],Set(fields.keys)==["path","identifier","sourceSha256","sha256","bytes","architecture"],
              fields["path"] as? String==AuxFreshBootstrapPtyArtifacts.helperPath,
              fields["identifier"] as? String==AuxFreshBootstrapPtyArtifacts.helperIdentifier,
              fields["sourceSha256"] as? String==rawHelperSha256,fields["architecture"] as? String=="arm64",
              let digest=fields["sha256"] as? String,digest.count==64,digest.utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}),digest != rawHelperSha256,
              let bytes=fields["bytes"] as? NSNumber,CFGetTypeID(bytes) != CFBooleanGetTypeID(),bytes.doubleValue==Double(bytes.intValue),bytes.intValue>=68_464,bytes.intValue<=32*1024*1024 else{throw AuxFreshBootstrapPolicyError.policy}
        return .init(relativePath:AuxFreshBootstrapPtyArtifacts.helperPath,identifier:AuxFreshBootstrapPtyArtifacts.helperIdentifier,sha256:digest,bytes:bytes.intValue)
    }
}

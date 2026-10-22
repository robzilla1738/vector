// Source-only real Security adapter. No method here is executed by the fixture.
import Foundation
import CryptoKit
import Security

enum FreshSecurityBoundaryError:Error { case review,request }
struct ReviewedFreshSecurityBoundary {
    let transactionId:String;let scope:String;let targetBindings:[FreshTargetBinding]
    let legacyBindings:[FreshTargetBinding];let stage:ReviewedFreshSecureStageSelector
    let candidateSha256:String;let targetHashes:[String:String];let publicDescriptor:[String:String]
    let reviewSha256:String
    init(journal:FreshInstallationJournal,legacyBindings:[FreshTargetBinding],stage:ReviewedFreshSecureStageSelector,expectedReviewSha256:String)throws {
        try journal.validate();try stage.validate(journal)
        guard legacyBindings.map(\.row)==freshRoles else{throw FreshSecurityBoundaryError.review}
        var identities=Set<String>()
        for b in journal.bindings+legacyBindings {
            let s=b.target
            guard [s.service,s.account,s.accessGroup].allSatisfy({!$0.isEmpty && $0.utf8.count<=512 && !$0.utf8.contains(0)}),
                  s.service.hasPrefix("aux."+journal.scope+"."),s.account.hasPrefix("aux."+journal.scope+"."),
                  s.accessGroup==stage.accessGroup,
                  identities.insert(try JSONEncoder().encode(s).base64EncodedString()).inserted,
                  s.service != stage.service || s.account != stage.account else{throw FreshSecurityBoundaryError.review}
        }
        let digest=try Self.digest(journal:journal,legacyBindings:legacyBindings,stage:stage)
        guard digest==expectedReviewSha256 else{throw FreshSecurityBoundaryError.review}
        transactionId=journal.transactionId;scope=journal.scope;targetBindings=journal.bindings;self.legacyBindings=legacyBindings;self.stage=stage;candidateSha256=journal.candidateSha256;targetHashes=journal.targetHashes;publicDescriptor=journal.publicDescriptor;reviewSha256=digest
    }
    static func digest(journal:FreshInstallationJournal,legacyBindings:[FreshTargetBinding],stage:ReviewedFreshSecureStageSelector)throws->String {
        let bindings=try JSONSerialization.jsonObject(with:JSONEncoder().encode(journal.bindings))
        let legacy=try JSONSerialization.jsonObject(with:JSONEncoder().encode(legacyBindings))
        return freshJournalHash(try JSONSerialization.data(withJSONObject:["transactionId":journal.transactionId,"scope":journal.scope,"candidateSha256":journal.candidateSha256,"targetHashes":journal.targetHashes,"publicDescriptor":journal.publicDescriptor,"targets":bindings,"legacy":legacy,"stage":["service":stage.service,"account":stage.account,"accessGroup":stage.accessGroup]],options:[.sortedKeys,.withoutEscapingSlashes]))
    }
}
protocol FreshInstallationSecurityBoundary {
    var review:ReviewedFreshSecurityBoundary {get}
    func captureLegacy()->CallerCapturedFreshTargets
    func captureTargets()->CallerCapturedFreshTargets
    func captureStage()->CallerCapturedSecureStage
    func addStage(_ request:SensitiveFreshSecureStageAdd)throws->CapturedFreshAddStatus
    func addTarget(_ request:FreshCreateOnlyRequest)throws->CapturedFreshAddStatus
}
struct ExactFreshDataProtectionBoundary:FreshInstallationSecurityBoundary {
    let review:ReviewedFreshSecurityBoundary
    // Query construction is pure; fixture may inspect these without invoking Security.
    static func readQuery(_ selector:FreshTargetSelector)->[String:Any] {
        [kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:selector.service,kSecAttrAccount as String:selector.account,kSecAttrAccessGroup as String:selector.accessGroup,kSecUseDataProtectionKeychain as String:true,kSecUseAuthenticationUI as String:kSecUseAuthenticationUIFail,kSecReturnData as String:true,kSecMatchLimit as String:kSecMatchLimitOne]
    }
    static func addQuery(_ selector:FreshTargetSelector,payload:Data)->[String:Any] {
        [kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:selector.service,kSecAttrAccount as String:selector.account,kSecAttrAccessGroup as String:selector.accessGroup,kSecUseDataProtectionKeychain as String:true,kSecUseAuthenticationUI as String:kSecUseAuthenticationUIFail,kSecAttrAccessible as String:kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,kSecValueData as String:payload]
    }
    static func captured(status:OSStatus,result:CFTypeRef?)->CallerCapturedFreshRead {
        if status==errSecItemNotFound{return .absent}
        guard status==errSecSuccess else{return .unavailable(status)}
        guard let result,CFGetTypeID(result)==CFDataGetTypeID() else{return .invalid}
        let data=result as! CFData,count=CFDataGetLength(data)
        guard count>0,count<=16_384,let bytes=CFDataGetBytePtr(data) else{return .invalid}
        return .bytes(Data(bytes:bytes,count:count))
    }
    private func read(_ selector:FreshTargetSelector)->CallerCapturedFreshRead {
        var result:CFTypeRef?
        let status=SecItemCopyMatching(Self.readQuery(selector) as CFDictionary,&result)
        return Self.captured(status:status,result:result)
    }
    private func captures(_ bindings:[FreshTargetBinding])->CallerCapturedFreshTargets {
        .init(metadata:read(bindings[0].target),signing:read(bindings[1].target),kem:read(bindings[2].target),wrappedRoot:read(bindings[3].target))
    }
    func captureLegacy()->CallerCapturedFreshTargets {captures(review.legacyBindings)}
    func captureTargets()->CallerCapturedFreshTargets {captures(review.targetBindings)}
    func captureStage()->CallerCapturedSecureStage {
        switch read(.init(service:review.stage.service,account:review.stage.account,accessGroup:review.stage.accessGroup)) {
        case .absent:return .absent;case .bytes(let b):return .bytes(b);case .unavailable:return .unavailable;case .invalid:return .invalid
        }
    }
    private func status(_ status:OSStatus)->CapturedFreshAddStatus {
        if status==errSecSuccess{return .added};if status==errSecDuplicateItem{return .duplicate};return .failed(status)
    }
    func addStage(_ request:SensitiveFreshSecureStageAdd)throws->CapturedFreshAddStatus {
        guard request.selector.service==review.stage.service,request.selector.account==review.stage.account,request.selector.accessGroup==review.stage.accessGroup,
              request.operation=="add-only-if-absent",!request.deletePermitted,!request.overwritePermitted,
              !request.secretPayload.isEmpty,request.secretPayload.count<=16_384 else{throw FreshSecurityBoundaryError.request}
        let object=try strictEnvelopeObject(request.secretPayload)
        guard Set(object.keys)==["format","transactionId","scope","candidateSha256","bindings","publicDescriptor","targetHashes","payloads"],object["format"] as? String=="aux.install.fresh.secure-stage.v1",object["transactionId"] as? String==review.transactionId,object["scope"] as? String==review.scope,
              object["candidateSha256"] as? String==review.candidateSha256,object["targetHashes"] as? [String:String]==review.targetHashes,object["publicDescriptor"] as? [String:String]==review.publicDescriptor,
              request.intentJournalSha256.utf8.count==64,request.intentJournalSha256.utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}),
              let payloads=object["payloads"] as? [String:String],Set(payloads.keys)==Set(freshRoles),freshRoles.allSatisfy({role in guard let text=payloads[role],let data=Data(base64Encoded:text),data.base64EncodedString()==text else{return false};return freshJournalHash(data)==review.targetHashes[role]}) else{throw FreshSecurityBoundaryError.request}
        guard let rawBindings=object["bindings"],let bindingObjects=rawBindings as? [[String:Any]],bindingObjects.count==4 else{throw FreshSecurityBoundaryError.request}
        for binding in bindingObjects {
            guard Set(binding.keys)==["row","target"],let selected=binding["target"] as? [String:Any],Set(selected.keys)==["service","account","accessGroup"] else{throw FreshSecurityBoundaryError.request}
        }
        guard try JSONDecoder().decode([FreshTargetBinding].self,from:JSONSerialization.data(withJSONObject:rawBindings))==review.targetBindings else{throw FreshSecurityBoundaryError.request}
        let selector=FreshTargetSelector(service:review.stage.service,account:review.stage.account,accessGroup:review.stage.accessGroup)
        return status(SecItemAdd(Self.addQuery(selector,payload:request.secretPayload) as CFDictionary,nil))
    }
    func addTarget(_ request:FreshCreateOnlyRequest)throws->CapturedFreshAddStatus {
        guard request.transactionId==review.transactionId,let binding=review.targetBindings.first(where:{$0.row==request.row}),request.selector==binding.target,
              request.operation=="add-only-if-absent",!request.deletePermitted,!request.overwritePermitted,
              request.durableIntentSha256.utf8.count==64,request.durableIntentSha256.utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}),!request.payload.isEmpty,request.payload.count<=16_384,freshJournalHash(request.payload)==review.targetHashes[request.row] else{throw FreshSecurityBoundaryError.request}
        return status(SecItemAdd(Self.addQuery(request.selector,payload:request.payload) as CFDictionary,nil))
    }
}

// External migration-tool source only. NOT activated or runtime-verified.
// Calling this API performs real Data Protection Keychain operations; compiling
// it or constructing a selector review does not authorize those operations.
import Foundation
import Security
import CryptoKit

enum InstallationSecurityExecutorError:Error { case invalidReview, invalidRequest }
struct ReviewedInstallationSelectorBindings {
    let reviewId:String
    let reviewSha256:String
    fileprivate let bindings:[InstallationRowBinding]
    // Caller supplies the exact reviewed original selectors; none is inferred
    // from logical names, the process environment, an app name or a home path.
    init(reviewId:String,bindings:[InstallationRowBinding],expectedReviewSha256:String)throws {
        guard UUID(uuidString:reviewId) != nil,bindings.map(\.row)==["metadata","signing","kem","wrappedRoot"] else{throw InstallationSecurityExecutorError.invalidReview}
        var originals=Set<TransactionSelector>(),targets=Set<TransactionSelector>()
        for binding in bindings {
            for selector in [binding.original,binding.target] {
                guard [selector.service,selector.account,selector.accessGroup].allSatisfy({ !$0.isEmpty && $0.utf8.count<=512 && !$0.utf8.contains(0) })else{throw InstallationSecurityExecutorError.invalidReview}
            }
            guard binding.target.service.hasPrefix("aux."),binding.target.account.hasPrefix("aux."),
                  ![binding.target.service,binding.target.account,binding.target.accessGroup].contains(where:{$0.lowercased().contains("aside")}),
                  originals.insert(binding.original).inserted,targets.insert(binding.target).inserted else{throw InstallationSecurityExecutorError.invalidReview}
        }
        guard originals.isDisjoint(with:targets)else{throw InstallationSecurityExecutorError.invalidReview}
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        let bytes=try encoder.encode(bindings)
        guard bytes.count<=16_384 else{throw InstallationSecurityExecutorError.invalidReview}
        let actual=SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()
        guard actual==expectedReviewSha256 else{throw InstallationSecurityExecutorError.invalidReview}
        self.reviewId=reviewId;self.reviewSha256=actual;self.bindings=bindings
    }
    fileprivate func binding(_ row:InstallationRow)->InstallationRowBinding { bindings.first{$0.row==row.rawValue}! }
}

// Hashability here is value identity only, never Keychain identity/provenance.
extension TransactionSelector:Hashable {
    func hash(into hasher:inout Hasher){hasher.combine(service);hasher.combine(account);hasher.combine(accessGroup)}
}

enum ExternalInstallationSecurityExecutor {
    // Decoding is factored so an executor caller cannot silently conflate a
    // permission failure, missing row and malformed successful result.
    static func capturedResult(status:OSStatus,result:CFTypeRef?)->CapturedInstallRead {
        if status==errSecItemNotFound{return .missing}
        guard status==errSecSuccess else{return .securityFailure(status)}
        guard let result,CFGetTypeID(result)==CFDataGetTypeID() else{return .invalidSuccessResult}
        // Safe after exact CFData type-ID validation, before bounded copying.
        let data=result as! CFData
        let count=CFDataGetLength(data)
        guard count>=0,count<=16_384 else{return .invalidSuccessResult}
        if count==0{return .data(Data())} // The inspector, not the executor, rejects an empty installation row.
        guard let pointer=CFDataGetBytePtr(data)else{return .invalidSuccessResult}
        return .data(Data(bytes:pointer,count:count))
    }
    private static func selector(_ binding:TransactionSelector)->ExplicitInstallSelector {
        .init(service:binding.service,account:binding.account,accessGroup:binding.accessGroup)
    }
    private static func read(_ selected:TransactionSelector)->CapturedInstallRead {
        var query=RecoveredInstallStorageQueries.read(selector(selected))
        // Explicit migration adaptation: a read must fail instead of presenting
        // an authentication dialog. Original query attributes otherwise retained.
        query[kSecUseAuthenticationUI as String]=kSecUseAuthenticationUIFail
        var result:CFTypeRef?
        let status=SecItemCopyMatching(query as CFDictionary,&result)
        return capturedResult(status:status,result:result)
    }
    static func captureOriginals(_ review:ReviewedInstallationSelectorBindings)->CapturedInstallationRows {
        // Deliberately no default legacy selector/group or target-to-source retry.
        .init(metadata:read(review.binding(.metadata).original),signing:read(review.binding(.signing).original),kem:read(review.binding(.kem).original),wrappedRoot:read(review.binding(.wrappedRoot).original))
    }
    static func captureTargets(_ review:ReviewedInstallationSelectorBindings)->CapturedInstallationRows {
        .init(metadata:read(review.binding(.metadata).target),signing:read(review.binding(.signing).target),kem:read(review.binding(.kem).target),wrappedRoot:read(review.binding(.wrappedRoot).target))
    }
    static func addOnly(_ request:PreparedAddOnlyRequest,review:ReviewedInstallationSelectorBindings)throws->OSStatus {
        guard let role=InstallationRow(rawValue:request.row),request.selector==review.binding(role).target,
              request.operation=="add-only-if-absent",!request.overwritePermitted,!request.deletePermitted,
              UUID(uuidString:request.transactionId) != nil,request.intentCheckpointSha256.count==64,
              request.intentCheckpointSha256.allSatisfy({"0123456789abcdef".contains($0)}),
              !request.payload.isEmpty,request.payload.count<=16_384 else{throw InstallationSecurityExecutorError.invalidRequest}
        let query=RecoveredInstallStorageQueries.addPayload(selector(request.selector),data:request.payload)
        // One create-only call: duplicate or any other failure returns unchanged.
        // No preceding deletion, update, overwrite, initialization or retry.
        return SecItemAdd(query as CFDictionary,nil)
    }
}

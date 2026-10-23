// Inactive native-only capability pairing. No JS factory or runtime admission.
import Foundation
import CryptoKit
import Darwin

enum ScopedAuxCommandContextError:Error {case binding,scope,logicalPolicy}
struct ImmutableAuxLogicalKeyPolicy {
    fileprivate let keys:Set<String>
    let sha256:String
    fileprivate let sourceKnownFamilies:AuxSourceKnownLogicalKeyFamilies?
    init(allowedLogicalKeys:Set<String>)throws {
        guard !allowedLogicalKeys.isEmpty,allowedLogicalKeys.count<=1024,
              allowedLogicalKeys.allSatisfy({!$0.isEmpty && $0.utf8.count<=512 && !$0.utf8.contains(0)}) else{throw ScopedAuxCommandContextError.logicalPolicy}
        keys=allowedLogicalKeys;sourceKnownFamilies=nil
        // Canonical exact UTF8 bytes; no Unicode normalization or raw-key receipt.
        let encoded=allowedLogicalKeys.map{Data($0.utf8)}.sorted{$0.lexicographicallyPrecedes($1)}.map{$0.base64EncodedString()}
        sha256=SHA256.hash(data:try JSONSerialization.data(withJSONObject:["format":"aux.secure.logical-key-policy.v1","utf8Base64":encoded],options:[.sortedKeys,.withoutEscapingSlashes])).map{String(format:"%02x",$0)}.joined()
    }
    private init(sourceKnownFamilies:AuxSourceKnownLogicalKeyFamilies) {
        keys=[];self.sourceKnownFamilies=sourceKnownFamilies
        sha256=SHA256.hash(data:Data(AuxSourceKnownLogicalKeyFamilies.format.utf8)).map{String(format:"%02x",$0)}.joined()
    }
    // Trusted native producer only: future valid accounts do not change this
    // versioned source grammar or require per-account policy resource signing.
    static func sourceKnownV2()->Self{Self(sourceKnownFamilies:.reviewedV2())}

}
struct ScopedAuxCommandEvidence {
    let mode:String;let transactionId:String?;let journalSha256:String?
    let runtimeGenerationId:String?;let runtimeSelectionSha256:String?
    let installationBindingsSha256:String;let scope:String;let accessGroupSha256:String
    let logicalKeyPolicySha256:String;let securityReviewSha256:String?
    let runtimeAdmissionVerified=false
}
struct ScopedAuxCommandContext {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
    private(set) var nativeFreshOwner:NativeFreshStagedContext? = nil
#endif
    let installation:AuxInstallationCommandCore
    let secureStore:AuxSecureStoreCommandCore
    let evidence:ScopedAuxCommandEvidence
    private struct Selector {let service:String;let account:String;let group:String}
    private init(installation:AuxInstallationCommandCore,mode:String,transactionId:String?,journal:String?,
                 bindingHash:String,selectors:[Selector],expectedScope:String?,securityReview:String?,reserved:[Selector]=[],
                 policy:ImmutableAuxLogicalKeyPolicy,boundary:AuxSecureStoreBoundary,runtimeGeneration:String?=nil,runtimeSelection:String?=nil,atomicAccountHome:String?=nil,retainedAccountHomeDescriptor:Int32?=nil)throws {
        guard selectors.count==4,let first=selectors.first else{throw ScopedAuxCommandContextError.binding}
        func prefix(_ value:String)throws->String {
            let parts=value.split(separator:".",omittingEmptySubsequences:false)
            guard parts.count>=3,parts[0]=="aux",parts[1].utf8.count==64,
                  parts[1].utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}) else{throw ScopedAuxCommandContextError.scope}
            return String(parts[1])
        }
        let scope=try prefix(first.service)
        guard expectedScope==nil || expectedScope==scope else{throw ScopedAuxCommandContextError.scope}
        var identities=Set<String>()
        for s in selectors {
            guard try prefix(s.service)==scope,try prefix(s.account)==scope,s.group==first.group,
                  !s.group.isEmpty,s.group.utf8.count<=512,s.group.contains(".aux."),s.group.utf8.allSatisfy({(48...57).contains($0)||(65...90).contains($0)||(97...122).contains($0)||[45,46,95].contains($0)}),
                  identities.insert(try JSONEncoder().encode([s.service,s.account,s.group]).base64EncodedString()).inserted else{throw ScopedAuxCommandContextError.binding}
        }
        let review:ReviewedAuxSecureStoreScope
        if let families=policy.sourceKnownFamilies {
            // Every accepted key maps only to this hash namespace. Refuse any
            // protected selector already occupying it, without enumerating keys.
            let securePrefix="aux."+scope+".secure.v2."
            guard (selectors+reserved).allSatisfy({!$0.service.hasPrefix(securePrefix) && !$0.account.hasPrefix(securePrefix)}) else{throw ScopedAuxCommandContextError.binding}
            review=try .init(scope:scope,accessGroup:first.group,sourceKnownFamilies:families)
        } else {review=try .init(scope:scope,accessGroup:first.group,allowedLogicalKeys:policy.keys)}
        // Fixed logical keys must not select any installation/stage/source row.
        let protected=Set((selectors+reserved).map{AuxSecureStoreSelector(service:$0.service,account:$0.account,accessGroup:$0.group)})
        for key in policy.keys {guard !protected.contains(try review.selector(key)) else{throw ScopedAuxCommandContextError.binding}}
        self.installation=installation
#if AUX_ATOMIC_CSK_DISPATCH
        if let home=atomicAccountHome {secureStore=try .init(review:review,boundary:boundary,installation:installation,accountHome:home,retainedAccountHomeDescriptor:retainedAccountHomeDescriptor)}
        else {secureStore = .init(review:review,boundary:boundary)}
#else
        guard atomicAccountHome==nil && retainedAccountHomeDescriptor==nil else{throw ScopedAuxCommandContextError.scope}
        secureStore = .init(review:review,boundary:boundary)
#endif
        evidence = .init(mode:mode,transactionId:transactionId,journalSha256:journal,runtimeGenerationId:runtimeGeneration,runtimeSelectionSha256:runtimeSelection,installationBindingsSha256:bindingHash,scope:scope,
            accessGroupSha256:Self.hash(Data(first.group.utf8)),logicalKeyPolicySha256:policy.sha256,securityReviewSha256:securityReview)
    }
    private static func hash(_ data:Data)->String{SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined()}
    private static func bindingHash<T:Encodable>(_ value:T)throws->String {
        let e=JSONEncoder();e.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];return hash(try e.encode(value))
    }
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    static func existing(terminal:CapturedTerminalCommandContext,bindings:[InstallationRowBinding],
                         policy:ImmutableAuxLogicalKeyPolicy,boundary:AuxSecureStoreBoundary)throws->Self {
        let digest=try bindingHash(bindings)
        guard terminal.evidence.mode=="existing-migration",bindings.map(\.row)==freshRoles,
              digest==terminal.evidence.selectorBindingsSha256 else{throw ScopedAuxCommandContextError.binding}
        return try .init(installation:terminal.core,mode:terminal.evidence.mode,transactionId:terminal.evidence.transactionId,journal:terminal.evidence.journalSha256,
            bindingHash:digest,selectors:bindings.map{.init(service:$0.target.service,account:$0.target.account,group:$0.target.accessGroup)},expectedScope:nil,securityReview:nil,reserved:bindings.map{.init(service:$0.original.service,account:$0.original.account,group:$0.original.accessGroup)},policy:policy,boundary:boundary)
    }
    static func capturedFresh(terminal:CapturedTerminalCommandContext,bindings:[FreshTargetBinding],
                              policy:ImmutableAuxLogicalKeyPolicy,boundary:AuxSecureStoreBoundary)throws->Self {
        let digest=try bindingHash(bindings)
        guard terminal.evidence.mode=="fresh",bindings.map(\.row)==freshRoles,
              digest==terminal.evidence.selectorBindingsSha256 else{throw ScopedAuxCommandContextError.binding}
        return try .init(installation:terminal.core,mode:terminal.evidence.mode,transactionId:terminal.evidence.transactionId,journal:terminal.evidence.journalSha256,
            bindingHash:digest,selectors:bindings.map{.init(service:$0.target.service,account:$0.target.account,group:$0.target.accessGroup)},expectedScope:nil,securityReview:nil,policy:policy,boundary:boundary)
    }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    static func recoveredFresh(terminal:RecoveredFreshTerminalCommandContext,review:ReviewedFreshSecurityBoundary,
                               policy:ImmutableAuxLogicalKeyPolicy,boundary:AuxSecureStoreBoundary)throws->Self {
        let digest=try bindingHash(review.targetBindings)
        guard terminal.evidence.scope==review.scope,terminal.evidence.transactionId==review.transactionId,
              terminal.evidence.securityReviewSha256==review.reviewSha256,
              terminal.evidence.selectorBindingsSha256==digest,
              review.targetBindings.allSatisfy({$0.target.accessGroup==review.stage.accessGroup}) else{throw ScopedAuxCommandContextError.binding}
        return try .init(installation:terminal.core,mode:terminal.evidence.mode,transactionId:terminal.evidence.transactionId,journal:terminal.evidence.journalSha256,
            bindingHash:digest,selectors:review.targetBindings.map{.init(service:$0.target.service,account:$0.target.account,group:$0.target.accessGroup)},expectedScope:review.scope,securityReview:review.reviewSha256,reserved:[.init(service:review.stage.service,account:review.stage.account,group:review.stage.accessGroup)],policy:policy,boundary:boundary)
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
    static func nativeFresh(_ captured:NativeFreshRuntimeCapturedContext)throws->Self {
        guard let lease=captured.owner.targetProgressLease.tryAcquire()else{throw NativeFreshRuntimeConsumerError.busy}
        defer{lease.finish()}
        try captured.revalidate()
        let fd=try captured.owner.duplicateRetainedHomeDescriptor();defer{Darwin.close(fd)}
        var result=try runtime(terminal:captured.runtime,policy:.sourceKnownV2(),boundary:ActualAuxSecureStoreBoundary(),
            atomicAccountHome:captured.owner.canonicalHome,retainedAccountHomeDescriptor:fd)
        result.nativeFreshOwner=captured.owner
        try captured.revalidate()
        return result
    }
#endif
    static func runtimeSourceKnownFamiliesV2(terminal:AuxRuntimeCapturedCommandContext,boundary:AuxSecureStoreBoundary)throws->Self {
        try runtime(terminal:terminal,policy:.sourceKnownV2(),boundary:boundary)
    }
    static func runtime(terminal:AuxRuntimeCapturedCommandContext,
                        policy:ImmutableAuxLogicalKeyPolicy,boundary:AuxSecureStoreBoundary,atomicAccountHome:String?=nil,retainedAccountHomeDescriptor:Int32?=nil)throws->Self {
        let selection=terminal.selection
        let selected=try AuxRuntimeSelection.roles.map{try selection.selector($0)}
        let bindings=zip(AuxRuntimeSelection.roles,selected).map{role,s in
            ["row":role,"service":s.service,"account":s.account,"accessGroup":s.accessGroup]
        }
        let digest=hash(try JSONSerialization.data(withJSONObject:bindings,options:[.sortedKeys,.withoutEscapingSlashes]))
        let selectionDigest=hash(try JSONSerialization.data(withJSONObject:[
            "format":"aux.runtime.secure-command-selection.v1","scope":selection.scope,
            "generationId":selection.generationId,"accessGroup":selection.accessGroup,
            "scheme":selection.scheme,"signingPublicKey":selection.signingPublicKey.base64EncodedString(),
            "kemPublicKey":selection.kemPublicKey.base64EncodedString(),"targetHashes":selection.targetHashes
        ],options:[.sortedKeys,.withoutEscapingSlashes]))
        return try .init(installation:terminal.core,mode:"runtime-target-capture",transactionId:nil,journal:nil,
            bindingHash:digest,selectors:selected.map{.init(service:$0.service,account:$0.account,group:$0.accessGroup)},
            expectedScope:selection.scope,securityReview:nil,policy:policy,boundary:boundary,
            runtimeGeneration:selection.generationId,runtimeSelection:selectionDigest,atomicAccountHome:atomicAccountHome,retainedAccountHomeDescriptor:retainedAccountHomeDescriptor)
    }
#endif

}

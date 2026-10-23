// Native-only nonsecret observations. Never persist results/keys/credentials.
import Foundation
enum AuxNativeFreshGuardProcessError:Error{case wrongProcess}
enum AuxNativeFreshGuardMoment:Equatable{case beforeAction,afterAction,afterThrownAction,beforeAccountCallback,afterAccountCallback,afterThrownAccountCallback
    var beforeProtectedBoundary:Bool{self == .beforeAction || self == .beforeAccountCallback}
}
enum AuxNativeFreshGuardDisposition:Equatable{case retryableNoCommand,unknownNoCommand,postOutcomeUnknown,provenBindingLoss}
struct AuxNativeFreshGuardFailure:Error {
    let moment:AuxNativeFreshGuardMoment
    let underlying:Error
    let operationError:Error?
    let disposition:AuxNativeFreshGuardDisposition
}
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
func classifyAuxNativeFreshGuard(_ error:Error)->AuxNativeFreshGuardDisposition {
    if let e=error as? AuxFreshColdGuardError {
        switch e {
        case .peer(1):return .retryableNoCommand // Actual same-peer heartbeat timeout.
        case .peer(-1),.peer(-2),.peer(-3),.path,.metadata,.wrongProcess:return .provenBindingLoss
        default:return .unknownNoCommand
        }
    }
    if let e=error as? AuxRuntimeCaptureError {
        switch e {
        case .unavailable:return .retryableNoCommand // Explicit DP read unavailable, never absence.
        case .policy,.missing,.invalid,.changed:return .provenBindingLoss
        default:return .unknownNoCommand
        }
    }
    if let e=error as? NativeFreshRuntimeConsumerError {
        switch e{case .binding:return .provenBindingLoss;case .busy:return .retryableNoCommand}
    }
    if let e=error as? AuxFreshBootstrapPolicyError {
        switch e{case .signature:return .unknownNoCommand;default:return .provenBindingLoss}
    }
    if let e=error as? NativeFreshBootstrapError {
        switch e{case .binding,.record:return .provenBindingLoss;default:return .unknownNoCommand}
    }
    if let e=error as? NativeFreshTargetError,case .binding=e{return .provenBindingLoss}
    return .unknownNoCommand // Never promote unknown OS/read errors to lost authority.
}

#endif

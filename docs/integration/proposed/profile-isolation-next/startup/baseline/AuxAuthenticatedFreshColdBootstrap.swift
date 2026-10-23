// Native child-bootstrap service SOURCE ONLY. Upstream cold/cohort admission is
// a caller precondition, not established by a signature, token or this service.
import Foundation
import Darwin

enum AuxFreshColdBootstrapStep {case guardCheck,reservation,freshCapture,generationAndDraft,stageSubmit,stageObserve,resume,targets,provider}
enum AuxFreshColdBootstrapOutcome {
    case progressed(AuxFreshColdBootstrapStep)
    case busy
    case stageUnresolved(String)
    case stageDeferredBeforeAdd(Int32)
    case stageBlocked(String)
    case target(NativeFreshTargetOutcome)
    case ready(AuxPreparedFreshRuntimeProvider)
    case failed(AuxFreshColdBootstrapStep,Error)
    indirect case guardStopped(Error,AuxFreshColdBootstrapOutcome)
}
enum AuxFreshColdBootstrapError:Error {case legacyOrUnknownExistingState,invalidReservation,pathChanged,busy,noSelectedHome,io(Int32)}
final class AuxAuthenticatedFreshColdBootstrap {
    private enum Phase {
        case authenticated
        indirect case guardStopped(Error,AuxFreshColdBootstrapOutcome,Phase)
        case reserved(AuxFreshNativeHome)
        case captured(AuxFreshNativeSecureCapture)
        case generationStopped(AuxFreshNativeSecureCapture,Error)
        case prepared(AuxNativeFreshStageCoordinator)
        case attempted(AuxNativeFreshStageCoordinator)
        case stageBlocked(AuxNativeFreshStageCoordinator,String)
        case resumeOnly
        case staged(NativeFreshStagedContext)
        case targets(AuxNativeFreshTargetCoordinator)
        case targetBlocked(AuxNativeFreshTargetCoordinator,StoredNativeFreshTargetCheckpoint)
        case terminal(NativeFreshTerminalSelection)
        case provider(AuxPreparedFreshRuntimeProvider)
    }
    private let process=getpid()
    private let guardOwner:AuxFreshColdInstallerGuard
    private var policy:AuxAuthenticatedFreshBootstrapPolicy{guardOwner.policy}
    private let lock=NSLock()
    private var advancing=false
    private var phase=Phase.authenticated
    private var observed:AuxFreshColdBootstrapOutcome?
    private init(guardOwner:AuxFreshColdInstallerGuard){self.guardOwner=guardOwner}
    // Actual sealed-resource authentication, not supplied policy JSON/flags.
    static func authenticate(connectedParent:AuxLiveNativeParentConnection)throws->AuxAuthenticatedFreshColdBootstrap {
        .init(guardOwner:try AuxFreshColdInstallerGuard.acquire(peer:connectedParent))
    }
    var lastOutcome:AuxFreshColdBootstrapOutcome?{guard getpid()==process else{return .failed(.guardCheck,AuxFreshColdGuardError.wrongProcess)};lock.lock();defer{lock.unlock()};return observed}
    func copySelectedHomeDescriptor()throws->Int32 {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock()
        guard !advancing else{lock.unlock();throw AuxFreshColdBootstrapError.busy}
        guard case .provider(let provider)=phase else{lock.unlock();throw AuxFreshColdBootstrapError.noSelectedHome}
        advancing=true;lock.unlock()
        defer{if getpid()==process{lock.lock();advancing=false;lock.unlock()}}
        return try provider.copyReadyHomeDescriptor()
    }
    private func set(_ phase:Phase){lock.lock();self.phase=phase;lock.unlock()}
    func advance()->AuxFreshColdBootstrapOutcome {
        guard getpid()==process else{return .failed(.guardCheck,AuxFreshColdGuardError.wrongProcess)}
        lock.lock()
        guard !advancing else{lock.unlock();return .busy}
        advancing=true;let current=phase;lock.unlock()
        let outcome:AuxFreshColdBootstrapOutcome
        do {
            try guardOwner.revalidate()
            let actual=step(current)
            do{try guardOwner.revalidate();outcome=actual}
            catch {
                // Preserve actual partial progress and the genuine owner; never
                // publish a newly prepared provider after losing the live guard.
                if case .ready(let provider)=actual{_ = provider.closeCreationAdmission()}
                lock.lock();let retainedPhase=phase;phase = .guardStopped(error,actual,retainedPhase);lock.unlock()
                outcome = .guardStopped(error,actual)
            }
        }catch{outcome = .failed(.guardCheck,error)}
        guard getpid()==process else{return .failed(.guardCheck,AuxFreshColdGuardError.wrongProcess)}
        lock.lock();observed=outcome;advancing=false;lock.unlock()
        return outcome
    }
    private func stage(_ outcome:NativeFreshStageSubmitOutcome,coordinator:AuxNativeFreshStageCoordinator)->AuxFreshColdBootstrapOutcome {
        switch outcome {
        case .staged(let context):set(.staged(context));return .progressed(.stageObserve)
        case .unresolved(let reason):return .stageUnresolved(reason)
        case .deferredBeforeAdd(let status):set(.prepared(coordinator));return .stageDeferredBeforeAdd(status)
        case .blocked(let reason):set(.stageBlocked(coordinator,reason));return .stageBlocked(reason)
        }
    }
    private func step(_ current:Phase)->AuxFreshColdBootstrapOutcome {
        switch current {
        case .guardStopped(let error,let actual,_):return .guardStopped(error,actual)
        case .authenticated:
            do {
                try policy.revalidateCurrentIdentity()
                let existing=try reservationExistsOrRequireEmptyParent()
                try policy.revalidateCurrentIdentity()
                if existing {set(.resumeOnly);return .progressed(.reservation)}
                // O_EXCL fixed reservation is the actual race-closing creator;
                // a failed create NEVER falls back to adoption/new UUID retry.
                let home=try guardOwner.createFreshHome();set(.reserved(home))
                return .progressed(.reservation)
            }catch{return .failed(.reservation,error)}
        case .reserved(let home):
            do {
                let capture=try AuxFreshNativeSecureCapture.capture(policy:policy,home:home)
                set(.captured(capture));return .progressed(.freshCapture)
            }catch{return .failed(.freshCapture,error)}
        case .captured(let capture):
            // BEFORE any generation call, poison this service's generation path.
            // The actual shared home's own one-shot latch independently enforces
            // this across aliases. Errors cannot reach another fresh factory.
            set(.generationStopped(capture,AuxFreshHomeError.generationAlreadyAttempted))
            do {
                let coordinator=try AuxNativeFreshStageCoordinator.prepare(capture:capture,coldGuard:guardOwner)
                set(.prepared(coordinator));return .progressed(.generationAndDraft)
            }catch{set(.generationStopped(capture,error));return .failed(.generationAndDraft,error)}
        case .generationStopped(_,let error):return .failed(.generationAndDraft,error)
        case .prepared(let coordinator):
            // Durable draft already exists. Any thrown/unknown submit can only
            // observe the same stage next time, never submit or generate again.
            set(.attempted(coordinator))
            do{return stage(try coordinator.submitStageOnce(),coordinator:coordinator)}
            catch{return .failed(.stageSubmit,error)}
        case .attempted(let coordinator):
            do{return stage(try coordinator.observeStageWithoutReplay(),coordinator:coordinator)}
            catch{return .failed(.stageObserve,error)}
        case .stageBlocked(_,let reason):return .stageBlocked(reason)
        case .resumeOnly:
            do {
                let context=try NativeFreshStagedContext.resume(coldGuard:guardOwner)
                set(.staged(context));return .progressed(.resume)
            }catch{return .failed(.resume,error)} // No fallback, even if partial/absent/locked.
        case .staged(let context):
            do{set(.targets(try AuxNativeFreshTargetCoordinator(context:context)));return .progressed(.targets)}
            catch{return .failed(.targets,error)}
        case .targets(let coordinator):
            do {
                let outcome=try coordinator.advanceOne()
                switch outcome {
                case .ready(let terminal):set(.terminal(terminal));return .progressed(.targets)
                case .blocked(let checkpoint):set(.targetBlocked(coordinator,checkpoint));return .target(outcome)
                case .progressed,.unresolved:return .target(outcome)
                }
            }catch{return .failed(.targets,error)}
        case .targetBlocked(_,let checkpoint):return .target(.blocked(checkpoint))
        case .terminal(let terminal):
            do{let provider=try AuxPreparedFreshRuntimeProvider.prepare(terminal:terminal);set(.provider(provider));return .ready(provider)}
            catch{return .failed(.provider,error)}
        case .provider(let provider):return .ready(provider)
        }
    }
    // Fixed, nonsecret reservation inventory only. It cannot prove foreign
    // writers absent. Existing unknown contents refuse fresh admission; an
    // existing marker always selects resume-only, even if its payload is broken.
    private func reservationExistsOrRequireEmptyParent()throws->Bool {
        let parent=policy.contents.canonicalPrivateParent
        guard let canonical=realpath(parent,nil)else{throw AuxFreshColdBootstrapError.io(errno)}
        defer{free(canonical)}
        guard String(cString:canonical)==parent else{throw AuxFreshColdBootstrapError.pathChanged}
        let fd=try guardOwner.duplicateRetainedParentDescriptor();defer{close(fd)}
        func checkIdentity()throws {
            var held=stat(),entry=stat()
            guard fstat(fd,&held)==0,lstat(parent,&entry)==0,held.st_dev==entry.st_dev,held.st_ino==entry.st_ino,
                  (held.st_mode&S_IFMT)==S_IFDIR,held.st_uid==geteuid(),held.st_mode&0o7777==0o700 else{throw AuxFreshColdBootstrapError.pathChanged}
            errno=0;let acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
            if acl==nil && errno==ENOENT{return}
            guard let acl else{throw AuxFreshColdBootstrapError.pathChanged};defer{acl_free(UnsafeMutableRawPointer(acl))}
            var entryACL:acl_entry_t?;errno=0
            guard acl_valid(acl)==0,acl_get_entry(acl,0,&entryACL) == -1,errno==EINVAL,entryACL==nil else{throw AuxFreshColdBootstrapError.pathChanged}
        }
        try checkIdentity()
        var marker=stat()
        if fstatat(fd,AuxFreshNativeHome.reservationName,&marker,AT_SYMLINK_NOFOLLOW)==0 {
            // Even symlink/invalid marker remains existing: real resumed owner
            // will reject it; never treat malformed state as permission to reset.
            try checkIdentity();return true
        }
        guard errno==ENOENT else{throw AuxFreshColdBootstrapError.io(errno)}
        let copied=openat(fd,".",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard copied>=0 else{throw AuxFreshColdBootstrapError.io(errno)}
        guard let stream=fdopendir(copied)else{let error=errno;close(copied);throw AuxFreshColdBootstrapError.io(error)}
        defer{closedir(stream)}
        errno=0
        while let entry=readdir(stream) {
            let name=withUnsafePointer(to:&entry.pointee.d_name){$0.withMemoryRebound(to:CChar.self,capacity:Int(entry.pointee.d_namlen)+1){String(cString:$0)}}
            guard name=="." || name==".." || name==AuxFreshColdInstallerGuard.installerName else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            errno=0
        }
        guard errno==0 else{throw AuxFreshColdBootstrapError.io(errno)}
        try checkIdentity();return false
    }
    // C creation below accepts only an existing actual private peer connection,
    // then performs real guard acquisition. Neither C nor Swift accepts claimed
    // rows/home/policy/status. Native entry must retain registration before Node.
    func registerForNativeEmbedding()throws->AuxFreshColdBootstrapRegistration {
        try guardOwner.revalidate()
        return try .init(service:self)
    }
}

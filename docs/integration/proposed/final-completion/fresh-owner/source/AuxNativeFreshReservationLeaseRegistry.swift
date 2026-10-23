// Mechanical process alias coordination only; no custody/admission grant.
import Darwin
import Foundation

enum AuxNativeFreshReservationLeaseRegistry {
    private final class RegistryState {
        let creatorProcess=getpid()
        let lock=Unmanaged.passRetained(NSLock())
        var leases:[String:AuxNativeFreshCohortLease]=[:]
        deinit{if creatorProcess == getpid(){lock.release()}}
    }
    private static let state=RegistryState()
    private static func currentState() throws -> RegistryState {
        let selected=state
        guard selected.creatorProcess == getpid() else{throw AuxFreshHomeError.foreignProcess}
        return selected
    }
    static func requireCurrentProcess() throws { _ = try currentState() }

    // Only real private owner constructors consume this result. An obtained
    // lease cannot construct a home, capture, staged context or Add ticket.
    static func lease(parentFD: Int32, reservationFD: Int32) throws -> AuxNativeFreshCohortLease {
        let selected = try currentState()
        var parent = stat(), reservation = stat()
        guard fstat(parentFD, &parent) == 0, fstat(reservationFD, &reservation) == 0 else {
            throw AuxFreshHomeError.io(errno)
        }
        guard parent.st_uid == getuid(), reservation.st_uid == getuid(),
              parent.st_mode & mode_t(S_IFMT) == mode_t(S_IFDIR),
              reservation.st_mode & mode_t(S_IFMT) == mode_t(S_IFREG) else {
            throw AuxFreshHomeError.unsafeMetadata
        }
        let key = "\(parent.st_dev):\(parent.st_ino):\(reservation.st_dev):\(reservation.st_ino)"
        selected.lock.takeUnretainedValue().lock()
        defer { selected.lock.takeUnretainedValue().unlock() }
        if let lease = selected.leases[key] { return lease }
        let lease = AuxNativeFreshCohortLease()
        selected.leases[key] = lease
        return lease
    }
}

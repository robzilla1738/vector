// Mechanical process alias coordination only; no custody/admission grant.
import Darwin
import Foundation

enum AuxNativeFreshReservationLeaseRegistry {
    private static let lock = NSLock()
    private static var leases: [String: AuxNativeFreshCohortLease] = [:]

    // Only real private owner constructors consume this result. An obtained
    // lease cannot construct a home, capture, staged context or Add ticket.
    static func lease(parentFD: Int32, reservationFD: Int32) throws -> AuxNativeFreshCohortLease {
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
        lock.lock()
        defer { lock.unlock() }
        if let lease = leases[key] { return lease }
        let lease = AuxNativeFreshCohortLease()
        leases[key] = lease
        return lease
    }
}

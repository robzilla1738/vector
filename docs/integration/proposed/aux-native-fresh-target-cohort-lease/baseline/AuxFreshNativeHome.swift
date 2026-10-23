// Native first-use filesystem producer. No Security, authority or launch calls.
import CryptoKit
import Darwin
import Foundation

enum AuxFreshHomeError: Error {
    case unsafePath, unsafeMetadata, existingReservation, pathChanged, notEmpty
    case generationAlreadyAttempted
    case io(Int32)
}

final class AuxFreshNativeHome {
    static let reservationName = ".aux-first-installation.v1"

    let canonicalHome: String
    let scope: String
    let transactionId: String
    private let reservationBytes: Data
    private let canonicalParent: String
    private let childName: String
    private let parentFD: Int32
    private let reservationFD: Int32
    private let homeFD: Int32
    private let generationAttemptLock = NSLock()
    private var generationAttempted = false

    // Only the successful O_EXCL/mkdirat creator can construct this owner.
    // Existing reservations/children are never adopted, removed or retried.
    static func create(inCanonicalPrivateParent parent: String) throws -> AuxFreshNativeHome {
        try requireCanonical(parent)
        let parentFD = open(parent, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard parentFD >= 0 else { throw AuxFreshHomeError.io(errno) }
        var reservationFD: Int32 = -1
        var homeFD: Int32 = -1
        do {
            try requirePrivate(parentFD, directory: true)
            try requirePathIdentity(parent, fd: parentFD)
            reservationFD = openat(
                parentFD, reservationName,
                O_RDWR | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK, 0o600
            )
            if reservationFD < 0 {
                if errno == EEXIST { throw AuxFreshHomeError.existingReservation }
                throw AuxFreshHomeError.io(errno)
            }
            try requirePrivate(reservationFD, directory: false)
            try sync(parentFD)

            let transactionId = UUID().uuidString
            let name = "aux-home-" + UUID().uuidString.lowercased()
            let home = parent + "/" + name
            let scope = SHA256.hash(data: Data(home.utf8))
                .map { String(format: "%02x", $0) }.joined()
            let reservation = try JSONSerialization.data(withJSONObject: [
                "format": "aux.first-installation.reservation.v1",
                "home": name, "scope": scope, "transactionId": transactionId,
            ], options: [.sortedKeys, .withoutEscapingSlashes])
            try writeAll(reservation, fd: reservationFD)
            try sync(reservationFD)
            try sync(parentFD)
            try requirePathIdentity(parent, fd: parentFD)
            try requireEntry(parent: parentFD, name: reservationName, fd: reservationFD)

            guard mkdirat(parentFD, name, 0o700) == 0 else { throw AuxFreshHomeError.io(errno) }
            homeFD = openat(
                parentFD, name, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK
            )
            guard homeFD >= 0 else { throw AuxFreshHomeError.io(errno) }
            try requirePrivate(homeFD, directory: true)
            try requireEntry(parent: parentFD, name: name, fd: homeFD)
            try sync(homeFD)
            try sync(parentFD)
            try requirePathIdentity(parent, fd: parentFD)
            try requireEntry(parent: parentFD, name: reservationName, fd: reservationFD)
            try requireEmptyDirectory(homeFD)
            return AuxFreshNativeHome(
                parent: parent, name: name, scope: scope,
                transactionId: transactionId, reservation: reservation,
                parentFD: parentFD, reservationFD: reservationFD, homeFD: homeFD
            )
        } catch {
            if homeFD >= 0 { close(homeFD) }
            if reservationFD >= 0 { close(reservationFD) }
            close(parentFD)
            // Failed/partial reservations and homes remain on disk for recovery.
            throw error
        }
    }

    private init(
        parent: String, name: String, scope: String,
        transactionId: String, reservation: Data,
        parentFD: Int32, reservationFD: Int32, homeFD: Int32
    ) {
        canonicalParent = parent
        childName = name
        canonicalHome = parent + "/" + name
        self.scope = scope
        self.transactionId = transactionId
        reservationBytes = reservation
        self.parentFD = parentFD
        self.reservationFD = reservationFD
        self.homeFD = homeFD
    }

    deinit {
        close(homeFD)
        close(reservationFD)
        close(parentFD)
    }

    func validateRetainedIdentity() throws {
        try Self.requireCanonical(canonicalParent)
        try Self.requirePrivate(parentFD, directory: true)
        try Self.requirePrivate(homeFD, directory: true)
        try Self.requirePrivate(reservationFD, directory: false)
        try Self.requirePathIdentity(canonicalParent, fd: parentFD)
        try Self.requireEntry(parent: parentFD, name: childName, fd: homeFD)
        try Self.requireEntry(parent: parentFD, name: Self.reservationName, fd: reservationFD)
        var captured = Data(count: reservationBytes.count + 1)
        let count = captured.withUnsafeMutableBytes {
            pread(reservationFD, $0.baseAddress, $0.count, 0)
        }
        guard count == reservationBytes.count,
              captured.prefix(count) == reservationBytes else { throw AuxFreshHomeError.pathChanged }
    }

    // Operation state on this real private-init owner, not an admission claim.
    // Consume before callbacks; failures never silently permit another factory.
    func claimInitialAuthorityGenerationAttempt() throws {
        generationAttemptLock.lock()
        defer { generationAttemptLock.unlock() }
        guard !generationAttempted else { throw AuxFreshHomeError.generationAlreadyAttempted }
        generationAttempted = true
    }

    func currentReservationSha256() throws -> String {
        try validateRetainedIdentity()
        return SHA256.hash(data: reservationBytes).map { String(format: "%02x", $0) }.joined()
    }

    func requireEmptyBeforeAuthorityGeneration() throws {
        try validateRetainedIdentity()
        try Self.requireEmptyDirectory(homeFD)
        try validateRetainedIdentity()
    }

    private static func requireEmptyDirectory(_ fd: Int32) throws {
        let duplicate = fcntl(fd, F_DUPFD_CLOEXEC, 0)
        guard duplicate >= 0 else { throw AuxFreshHomeError.io(errno) }
        guard let directory = fdopendir(duplicate) else {
            let status = errno
            close(duplicate)
            throw AuxFreshHomeError.io(status)
        }
        defer { closedir(directory) }
        rewinddir(directory)
        errno = 0
        while let entry = readdir(directory) {
            let name = withUnsafePointer(to: &entry.pointee.d_name) {
                $0.withMemoryRebound(to: CChar.self, capacity: Int(MAXNAMLEN) + 1) {
                    String(cString: $0)
                }
            }
            guard name == "." || name == ".." else { throw AuxFreshHomeError.notEmpty }
            errno = 0
        }
        guard errno == 0 else { throw AuxFreshHomeError.io(errno) }
    }

    // This is an actual duplicate of the retained directory, not a receipt or
    // launch grant. Callers own closing it; no process is started here.
    func duplicateDirectoryForNativeBootstrap() throws -> Int32 {
        try validateRetainedIdentity()
        let duplicate = fcntl(homeFD, F_DUPFD_CLOEXEC, 0)
        guard duplicate >= 0 else { throw AuxFreshHomeError.io(errno) }
        return duplicate
    }

    private static func requireCanonical(_ path: String) throws {
        guard path.hasPrefix("/"), !path.utf8.contains(0),
              let resolved = realpath(path, nil) else { throw AuxFreshHomeError.unsafePath }
        defer { free(resolved) }
        guard String(cString: resolved) == path else { throw AuxFreshHomeError.unsafePath }
    }

    private static func metadata(_ fd: Int32) throws -> stat {
        var value = stat()
        guard fstat(fd, &value) == 0 else { throw AuxFreshHomeError.io(errno) }
        return value
    }

    private static func requirePrivate(_ fd: Int32, directory: Bool) throws {
        let value = try metadata(fd)
        guard value.st_uid == getuid(),
              value.st_mode & mode_t(S_IFMT) == mode_t(directory ? S_IFDIR : S_IFREG),
              value.st_mode & 0o7777 == (directory ? 0o700 : 0o600),
              directory || (value.st_nlink == 1 && value.st_size >= 0 && value.st_size <= 1024)
        else { throw AuxFreshHomeError.unsafeMetadata }
        errno = 0
        let captured = acl_get_fd_np(fd, ACL_TYPE_EXTENDED)
        if captured == nil && errno == ENOENT { return }
        guard let acl = captured else { throw AuxFreshHomeError.unsafeMetadata }
        defer { acl_free(UnsafeMutableRawPointer(acl)) }
        guard acl_valid(acl) == 0 else { throw AuxFreshHomeError.unsafeMetadata }
        var entry: acl_entry_t?
        errno = 0
        let result = acl_get_entry(acl, 0, &entry)
        guard result == -1, errno == EINVAL, entry == nil else {
            throw AuxFreshHomeError.unsafeMetadata
        }
    }

    private static func requirePathIdentity(_ path: String, fd: Int32) throws {
        let current = open(path, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard current >= 0 else { throw AuxFreshHomeError.io(errno) }
        defer { close(current) }
        let before = try metadata(fd)
        let after = try metadata(current)
        guard before.st_dev == after.st_dev, before.st_ino == after.st_ino else {
            throw AuxFreshHomeError.pathChanged
        }
    }

    private static func requireEntry(parent: Int32, name: String, fd: Int32) throws {
        var entry = stat()
        guard fstatat(parent, name, &entry, AT_SYMLINK_NOFOLLOW) == 0 else {
            throw AuxFreshHomeError.io(errno)
        }
        let held = try metadata(fd)
        guard entry.st_dev == held.st_dev, entry.st_ino == held.st_ino,
              entry.st_mode == held.st_mode, entry.st_uid == held.st_uid else {
            throw AuxFreshHomeError.pathChanged
        }
    }

    private static func sync(_ fd: Int32) throws {
        guard fsync(fd) == 0 else { throw AuxFreshHomeError.io(errno) }
    }

    private static func writeAll(_ data: Data, fd: Int32) throws {
        try data.withUnsafeBytes { bytes in
            var offset = 0
            while offset < bytes.count {
                let count = write(fd, bytes.baseAddress!.advanced(by: offset), bytes.count - offset)
                if count < 0 && errno == EINTR { continue }
                guard count > 0 else { throw AuxFreshHomeError.io(errno) }
                offset += count
            }
        }
    }
}

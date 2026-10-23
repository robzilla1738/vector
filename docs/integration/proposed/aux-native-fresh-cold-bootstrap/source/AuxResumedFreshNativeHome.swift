// Existing-only FD reader. No factory, generation, Security or launch calls.
import CryptoKit
import Darwin
import Foundation

final class AuxResumedFreshNativeHome {
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
    let policy: AuxAuthenticatedFreshBootstrapPolicy
    let targetProgressLease: AuxNativeFreshCohortLease
    private static let registryLock = NSLock()
    private static var registry: [String: WeakResumedFreshHome] = [:]

    // Only an actually authenticated policy can locate this existing owner.
    // Disk metadata is a bounded locator; protected-stage authentication is a
    // separate prerequisite before any staged context may be returned.
    static func reopen(policy: AuxAuthenticatedFreshBootstrapPolicy,retainedParentDescriptor:Int32? = nil) throws -> AuxResumedFreshNativeHome {
        try policy.revalidateCurrentIdentity()
        let parent = policy.contents.canonicalPrivateParent
        try requireCanonical(parent)
        let parentFD:Int32
        if let retainedParentDescriptor{parentFD=fcntl(retainedParentDescriptor,F_DUPFD_CLOEXEC,0)}
        else{parentFD=open(parent,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)}
        guard parentFD >= 0 else { throw AuxFreshHomeError.io(errno) }
        var reservationFD: Int32 = -1
        var homeFD: Int32 = -1
        var parentOwnedByObject = false
        do {
            try requirePrivate(parentFD, directory: true)
            try requirePathIdentity(parent, fd: parentFD)
            reservationFD = openat(parentFD, reservationName, O_RDONLY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
            guard reservationFD >= 0 else { throw AuxFreshHomeError.io(errno) }
            let reservation = try readRegular(reservationFD, maximum: 1024)
            try requireEntry(parent: parentFD, name: reservationName, fd: reservationFD)
            let object = try strictEnvelopeObject(reservation)
            guard Set(object.keys) == ["format", "home", "scope", "transactionId"],
                  object["format"] as? String == "aux.first-installation.reservation.v1",
                  let name = object["home"] as? String, name.hasPrefix("aux-home-"),
                  let childUUID = UUID(uuidString: String(name.dropFirst(9))),
                  name == "aux-home-" + childUUID.uuidString.lowercased(),
                  let transactionId = object["transactionId"] as? String,
                  UUID(uuidString: transactionId)?.uuidString == transactionId else {
                throw AuxFreshHomeError.unsafeMetadata
            }
            let home = parent + "/" + name
            let scope = SHA256.hash(data: Data(home.utf8)).map { String(format: "%02x", $0) }.joined()
            guard object["scope"] as? String == scope else { throw AuxFreshHomeError.unsafeMetadata }
            homeFD = openat(parentFD, name, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
            guard homeFD >= 0 else { throw AuxFreshHomeError.io(errno) }
            try requirePrivate(homeFD, directory: true)
            try requireEntry(parent: parentFD, name: name, fd: homeFD)
            try policy.revalidateCurrentIdentity()
            try requirePathIdentity(parent, fd: parentFD)
            try requireEntry(parent: parentFD, name: reservationName, fd: reservationFD)
            guard try readRegular(reservationFD, maximum: 1024) == reservation else { throw AuxFreshHomeError.pathChanged }
            let owner = AuxResumedFreshNativeHome(
                parent: parent, name: name, scope: scope, transactionId: transactionId,
                reservation: reservation, parentFD: parentFD, reservationFD: reservationFD,
                homeFD: homeFD, policy: policy,
                targetProgressLease: try AuxNativeFreshReservationLeaseRegistry.lease(parentFD: parentFD, reservationFD: reservationFD)
            )
            // Ownership of the descriptors passed to the private object.
            parentOwnedByObject = true
            reservationFD = -1; homeFD = -1
            return try canonicalOwner(owner)
        } catch {
            if homeFD >= 0 { close(homeFD) }
            if reservationFD >= 0 { close(reservationFD) }
            if !parentOwnedByObject { close(parentFD) }
            throw error
        }
    }

    private init(
        parent: String, name: String, scope: String,
        transactionId: String, reservation: Data,
        parentFD: Int32, reservationFD: Int32, homeFD: Int32,
        policy: AuxAuthenticatedFreshBootstrapPolicy,
        targetProgressLease: AuxNativeFreshCohortLease
    ) {
        self.policy = policy
        self.targetProgressLease = targetProgressLease
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

    func currentReservationSha256() throws -> String {
        try validateRetainedIdentity()
        return SHA256.hash(data: reservationBytes).map { String(format: "%02x", $0) }.joined()
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

    private static func requirePrivate(_ fd: Int32, directory: Bool, maximum: Int64 = 1024) throws {
        let value = try metadata(fd)
        guard value.st_uid == getuid(),
              value.st_mode & mode_t(S_IFMT) == mode_t(directory ? S_IFDIR : S_IFREG),
              value.st_mode & 0o7777 == (directory ? 0o700 : 0o600),
              directory || (value.st_nlink == 1 && value.st_size >= 0 && value.st_size <= maximum)
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

    private static func readRegular(_ fd: Int32, maximum: Int64) throws -> Data {
        try requirePrivate(fd, directory: false, maximum: maximum)
        let before = try metadata(fd)
        var bytes = Data(count: Int(before.st_size) + 1)
        var count = -1
        repeat {
            count = bytes.withUnsafeMutableBytes { pread(fd, $0.baseAddress, $0.count, 0) }
        } while count < 0 && errno == EINTR
        let after = try metadata(fd)
        guard count == Int(before.st_size),
              before.st_size == after.st_size,
              before.st_mtimespec.tv_sec == after.st_mtimespec.tv_sec,
              before.st_mtimespec.tv_nsec == after.st_mtimespec.tv_nsec,
              before.st_ctimespec.tv_sec == after.st_ctimespec.tv_sec,
              before.st_ctimespec.tv_nsec == after.st_ctimespec.tv_nsec else {
            throw AuxFreshHomeError.pathChanged
        }
        return Data(bytes.prefix(count))
    }

    private static func canonicalOwner(_ proposed: AuxResumedFreshNativeHome) throws -> AuxResumedFreshNativeHome {
        let reservation = try metadata(proposed.reservationFD)
        let parent = try metadata(proposed.parentFD)
        let key = "\(parent.st_dev):\(parent.st_ino):\(reservation.st_dev):\(reservation.st_ino)"
        registryLock.lock()
        let existing = registry[key]?.value
        if existing == nil { registry[key] = WeakResumedFreshHome(proposed) }
        registryLock.unlock()
        let selected = existing ?? proposed
        guard selected.policy.policySha256 == proposed.policy.policySha256,
              selected.policy.bundlePath == proposed.policy.bundlePath,
              selected.policy.hostCdHash == proposed.policy.hostCdHash,
              selected.canonicalHome == proposed.canonicalHome,
              selected.scope == proposed.scope, selected.transactionId == proposed.transactionId,
              selected.reservationBytes == proposed.reservationBytes else { throw AuxFreshHomeError.pathChanged }
        try selected.validateRetainedIdentity()
        return selected
    }

    // Fixed existing-only path derived from retained reservation. No mkdir,
    // lock creation, publication, arbitrary filename or missing-to-empty path.
    func readExistingInitialJournal() throws -> StoredNativeFreshBootstrapJournal {
        try policy.revalidateCurrentIdentity()
        try validateRetainedIdentity()
        let name = ".aux-native-fresh-initial-journal-v2-" + transactionId.lowercased()
        let directory = openat(homeFD, name, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard directory >= 0 else { throw AuxFreshHomeError.io(errno) }
        defer { close(directory) }
        try Self.requirePrivate(directory, directory: true)
        try Self.requireEntry(parent: homeFD, name: name, fd: directory)
        let file = openat(directory, "initial-journal.json", O_RDONLY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard file >= 0 else { throw AuxFreshHomeError.io(errno) }
        defer { close(file) }
        let bytes = try Self.readRegular(file, maximum: 16_384)
        try Self.requireEntry(parent: directory, name: "initial-journal.json", fd: file)
        let journal = try NativeFreshBootstrapJournal.decode(bytes)
        guard try journal.encoded() == bytes,
              journal.reservationTransactionId == transactionId,
              journal.scope == scope, journal.reservationSha256 == (try currentReservationSha256()),
              journal.policySha256 == policy.policySha256,
              journal.role == policy.contents.role.rawValue,
              journal.accessGroup == policy.contents.accessGroup else { throw NativeFreshBootstrapError.binding }
        try policy.revalidateCurrentIdentity()
        try validateRetainedIdentity()
        try Self.requireEntry(parent: homeFD, name: name, fd: directory)
        try Self.requireEntry(parent: directory, name: "initial-journal.json", fd: file)
        guard try Self.readRegular(file, maximum: 16_384) == bytes else { throw AuxFreshHomeError.pathChanged }
        return .init(journal: journal, sha256: nativeBootstrapHash(bytes))
    }
}

private final class WeakResumedFreshHome {
    weak var value: AuxResumedFreshNativeHome?
    init(_ value: AuxResumedFreshNativeHome) { self.value = value }
}

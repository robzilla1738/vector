// Fixed native launcher receipt writer. Source-only pending builder compilation.
// No path/op/file selector: only the admitted direct-child fixture root is input.
import Darwin
import Foundation

enum StartupReceiptError: Error { case invalidFixture, invalidReceipt, io }
final class OwnedStartupReceiptDirectory {
  private let parent: Int32
  private let root: Int32
  private let profile: Int32
  private let name: String
  private let rootIdentity: stat
  private let profileIdentity: stat
  private static let receipt = "startup-launch-receipt.json"

  private static func owned(_ info: stat) -> Bool {
    (info.st_mode & S_IFMT) == S_IFDIR && info.st_uid == geteuid() &&
      (info.st_mode & 0o777) == 0o700
  }
  private static func same(_ a: stat, _ b: stat) -> Bool {
    owned(a) && owned(b) && a.st_dev == b.st_dev && a.st_ino == b.st_ino
  }
  init(rootName: String) throws {
    let prefix = "aux-native-journey-"
    let allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
    guard rootName.hasPrefix(prefix), rootName.count > prefix.count, rootName.utf8.count <= 128,
          rootName.allSatisfy({ allowed.contains($0) }) else {
      throw StartupReceiptError.invalidFixture
    }
    let parentFd = open("/private/tmp", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC)
    guard parentFd >= 0 else { throw StartupReceiptError.io }
    let rootFd = openat(parentFd, rootName, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC)
    guard rootFd >= 0 else { close(parentFd); throw StartupReceiptError.invalidFixture }
    let profileFd = openat(rootFd, "profile", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC)
    guard profileFd >= 0 else { close(rootFd); close(parentFd); throw StartupReceiptError.invalidFixture }
    var r = stat(), p = stat(), rootPath = stat(), profilePath = stat()
    guard fstat(rootFd, &r) == 0, fstat(profileFd, &p) == 0,
          fstatat(parentFd, rootName, &rootPath, AT_SYMLINK_NOFOLLOW) == 0,
          fstatat(rootFd, "profile", &profilePath, AT_SYMLINK_NOFOLLOW) == 0,
          Self.same(r, rootPath), Self.same(p, profilePath) else {
      close(profileFd); close(rootFd); close(parentFd); throw StartupReceiptError.invalidFixture
    }
    parent = parentFd; root = rootFd; profile = profileFd; name = rootName
    rootIdentity = r; profileIdentity = p
  }
  deinit { close(profile); close(root); close(parent) }
  func validate() throws {
    var r = stat(), path = stat(), p = stat(), profilePath = stat()
    guard fstat(root, &r) == 0, fstatat(parent, name, &path, AT_SYMLINK_NOFOLLOW) == 0,
          fstat(profile, &p) == 0, fstatat(root, "profile", &profilePath, AT_SYMLINK_NOFOLLOW) == 0,
          Self.same(r, rootIdentity), Self.same(path, rootIdentity),
          Self.same(p, profileIdentity), Self.same(profilePath, profileIdentity) else {
      throw StartupReceiptError.invalidFixture
    }
  }
  // Fixed build identity only. Retain the descriptor until explicit post-spawn
  // revalidation; a replacement path cannot turn one build into another.
  func openBuildIdentity() throws -> OwnedStartupBuildIdentity {
    try validate()
    return try OwnedStartupBuildIdentity(root: root)
  }
  func publish(_ bytes: Data) throws {
    guard !bytes.isEmpty, bytes.count <= 2048 else { throw StartupReceiptError.invalidReceipt }
    try validate()
    let temporary = "startup-launch-receipt-\(getpid())-\(UUID().uuidString.lowercased()).tmp"
    let fd = openat(root, temporary, O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC, 0o600)
    guard fd >= 0 else { throw StartupReceiptError.io }
    defer { close(fd); unlinkat(root, temporary, 0) }
    var original = stat()
    guard fstat(fd, &original) == 0, (original.st_mode & S_IFMT) == S_IFREG,
          original.st_uid == geteuid(), (original.st_mode & 0o777) == 0o600, original.st_nlink == 1 else {
      throw StartupReceiptError.invalidReceipt
    }
    try bytes.withUnsafeBytes { buffer in
      guard let start = buffer.baseAddress else { throw StartupReceiptError.invalidReceipt }
      var offset = 0
      while offset < buffer.count {
        let count = write(fd, start.advanced(by: offset), buffer.count - offset)
        if count < 0 && errno == EINTR { continue }
        guard count > 0 else { throw StartupReceiptError.io }
        offset += count
      }
    }
    guard fsync(fd) == 0 else { throw StartupReceiptError.io }
    try validate()
    // Atomic exclusive publication: existing file/symlink/receipt never replaced.
    guard renameatx_np(root, temporary, root, Self.receipt, UInt32(RENAME_EXCL)) == 0,
          fsync(root) == 0 else { throw StartupReceiptError.io }
    var published = stat(), current = stat()
    guard fstat(fd, &current) == 0,
          fstatat(root, Self.receipt, &published, AT_SYMLINK_NOFOLLOW) == 0,
          published.st_dev == original.st_dev, published.st_ino == original.st_ino,
          current.st_dev == original.st_dev, current.st_ino == original.st_ino,
          (published.st_mode & S_IFMT) == S_IFREG, published.st_uid == geteuid(),
          (published.st_mode & 0o777) == 0o600, published.st_nlink == 1,
          published.st_size == bytes.count, current.st_size == bytes.count else {
      throw StartupReceiptError.invalidReceipt
    }
    try validate()
  }
}

final class OwnedStartupBuildIdentity {
  private let root: Int32
  private let fd: Int32
  private let identity: stat
  let bytes: Data
  private static let filename = "startup-build.json"
  private static func valid(_ value: stat) -> Bool {
    (value.st_mode & S_IFMT) == S_IFREG && value.st_uid == geteuid() &&
      (value.st_mode & 0o777) == 0o600 && value.st_nlink == 1 &&
      value.st_size > 0 && value.st_size <= 2048
  }
  private static func same(_ a: stat, _ b: stat) -> Bool {
    valid(a) && valid(b) && a.st_dev == b.st_dev && a.st_ino == b.st_ino &&
      a.st_size == b.st_size && a.st_mtimespec.tv_sec == b.st_mtimespec.tv_sec &&
      a.st_mtimespec.tv_nsec == b.st_mtimespec.tv_nsec &&
      a.st_ctimespec.tv_sec == b.st_ctimespec.tv_sec && a.st_ctimespec.tv_nsec == b.st_ctimespec.tv_nsec
  }
  private static func readBytes(_ fd: Int32, _ count: Int) throws -> Data {
    var result = Data(count: count)
    try result.withUnsafeMutableBytes { buffer in
      guard let start = buffer.baseAddress else { throw StartupReceiptError.invalidReceipt }
      var offset = 0
      while offset < count {
        let n = pread(fd, start.advanced(by: offset), count - offset, off_t(offset))
        if n < 0 && errno == EINTR { continue }
        guard n > 0 else { throw StartupReceiptError.io }
        offset += n
      }
    }
    return result
  }
  init(root: Int32) throws {
    let ownedRoot = dup(root)
    guard ownedRoot >= 0 else { throw StartupReceiptError.io }
    let opened = openat(ownedRoot, Self.filename, O_RDONLY | O_NOFOLLOW | O_CLOEXEC)
    guard opened >= 0 else { close(ownedRoot); throw StartupReceiptError.invalidReceipt }
    var initial = stat(), path = stat(), after = stat()
    do {
      guard fstat(opened, &initial) == 0, Self.valid(initial),
            fstatat(ownedRoot, Self.filename, &path, AT_SYMLINK_NOFOLLOW) == 0,
            Self.same(initial, path) else { throw StartupReceiptError.invalidReceipt }
      let value = try Self.readBytes(opened, Int(initial.st_size))
      guard fstat(opened, &after) == 0, Self.same(initial, after),
            fstatat(ownedRoot, Self.filename, &path, AT_SYMLINK_NOFOLLOW) == 0,
            Self.same(initial, path) else { throw StartupReceiptError.invalidReceipt }
      self.root = ownedRoot; fd = opened; identity = initial; bytes = value
    } catch { close(opened); close(ownedRoot); throw error }
  }
  deinit { close(fd); close(root) }
  func validate() throws {
    var current = stat(), path = stat()
    guard fstat(fd, &current) == 0, Self.same(identity, current),
          fstatat(root, Self.filename, &path, AT_SYMLINK_NOFOLLOW) == 0,
          Self.same(identity, path), try Self.readBytes(fd, Int(identity.st_size)) == bytes else {
      throw StartupReceiptError.invalidReceipt
    }
  }
}

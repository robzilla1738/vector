// Fixed supplied entry resource. No argv path, source text or hash is accepted.
import Foundation
import Security
import Darwin

enum AuxSealedDaemonEntryError: Error { case role, file, changed, signature(OSStatus), allocation }

private func sealedEntryMetadata(_ descriptor: Int32, directory: Bool) throws -> stat {
    var value = stat()
    guard fstat(descriptor, &value) == 0,
          value.st_mode & S_IFMT == (directory ? S_IFDIR : S_IFREG),
          value.st_uid == geteuid() || value.st_uid == 0,
          value.st_mode & 0o022 == 0,
          directory || (value.st_nlink == 1 && value.st_size > 0 && value.st_size <= 32 * 1024 * 1024) else {
        throw AuxSealedDaemonEntryError.file
    }
    errno = 0
    let acl = acl_get_fd_np(descriptor, ACL_TYPE_EXTENDED)
    if acl == nil && errno == ENOENT { return value }
    guard let acl else { throw AuxSealedDaemonEntryError.file }
    defer { acl_free(UnsafeMutableRawPointer(acl)) }
    var entry: acl_entry_t?
    errno = 0
    guard acl_valid(acl) == 0, acl_get_entry(acl, 0, &entry) == -1,
          errno == EINVAL, entry == nil else { throw AuxSealedDaemonEntryError.file }
    return value
}

private func sealedEntrySame(_ descriptor: Int32, _ initial: stat) throws {
    let current = try sealedEntryMetadata(descriptor, directory: false)
    guard current.st_dev == initial.st_dev, current.st_ino == initial.st_ino,
          current.st_size == initial.st_size, current.st_mode == initial.st_mode,
          current.st_uid == initial.st_uid,
          current.st_mtimespec.tv_sec == initial.st_mtimespec.tv_sec,
          current.st_mtimespec.tv_nsec == initial.st_mtimespec.tv_nsec,
          current.st_ctimespec.tv_sec == initial.st_ctimespec.tv_sec,
          current.st_ctimespec.tv_nsec == initial.st_ctimespec.tv_nsec else {
        throw AuxSealedDaemonEntryError.changed
    }
}

private func loadSealedNativeDaemonEntry() throws -> (Data, String) {
    let policy = try AuxSignedFreshBootstrapPolicyLoader.load()
    guard policy.contents.role == .daemon else { throw AuxSealedDaemonEntryError.role }
    let root = open(policy.bundlePath, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
    guard root >= 0 else { throw AuxSealedDaemonEntryError.file }
    var descriptors = [root]
    defer { for descriptor in descriptors.reversed() { close(descriptor) } }
    _ = try sealedEntryMetadata(root, directory: true)
    for name in ["Contents", "Resources", "node-development"] {
        let next = openat(descriptors.last!, name, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard next >= 0 else { throw AuxSealedDaemonEntryError.file }
        descriptors.append(next)
        _ = try sealedEntryMetadata(next, directory: true)
    }
    let parent = descriptors.last!
    let file = openat(parent, "index.mjs", O_RDONLY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
    guard file >= 0 else { throw AuxSealedDaemonEntryError.file }
    descriptors.append(file)
    let initial = try sealedEntryMetadata(file, directory: false)
    var bytes = Data(count: Int(initial.st_size))
    try bytes.withUnsafeMutableBytes { buffer in
        var offset = 0
        while offset < buffer.count {
            let count = pread(file, buffer.baseAddress!.advanced(by: offset), buffer.count - offset, off_t(offset))
            if count < 0 && errno == EINTR { continue }
            guard count > 0 else { throw AuxSealedDaemonEntryError.file }
            offset += count
        }
    }
    try sealedEntrySame(file, initial)
    var entry = stat()
    guard fstatat(parent, "index.mjs", &entry, AT_SYMLINK_NOFOLLOW) == 0,
          entry.st_dev == initial.st_dev, entry.st_ino == initial.st_ino else {
        throw AuxSealedDaemonEntryError.changed
    }
    var dynamic: SecCode?
    var status = SecCodeCopySelf([], &dynamic)
    guard status == errSecSuccess, let dynamic else { throw AuxSealedDaemonEntryError.signature(status) }
    var code: SecStaticCode?
    status = SecCodeCopyStaticCode(dynamic, [], &code)
    guard status == errSecSuccess, let code else { throw AuxSealedDaemonEntryError.signature(status) }
    status = SecCodeValidateFileResource(code, "Resources/node-development/index.mjs" as CFString, bytes as CFData, [])
    guard status == errSecSuccess else { throw AuxSealedDaemonEntryError.signature(status) }
    try sealedEntrySame(file, initial)
    try policy.revalidateCurrentIdentity()
    return (bytes, URL(fileURLWithPath: policy.bundlePath + "/Contents/Resources/node-development/index.mjs").absoluteString)
}

// Plain malloc buffers cross the native C boundary, never Swift/C++ containers.
// Caller copies them into Node ModuleData, then frees both with free().
@_cdecl("AuxCopySealedNativeDaemonEntry")
func AuxCopySealedNativeDaemonEntry(_ source: UnsafeMutablePointer<UnsafeMutableRawPointer?>?,
                                  _ length: UnsafeMutablePointer<UInt>?,
                                  _ resource: UnsafeMutablePointer<UnsafeMutablePointer<CChar>?>?) -> Int32 {
    guard let source, let length, let resource else { return -1 }
    source.pointee = nil; length.pointee = 0; resource.pointee = nil
    do {
        let (bytes, name) = try loadSealedNativeDaemonEntry()
        guard let copy = malloc(bytes.count) else { throw AuxSealedDaemonEntryError.allocation }
        guard let url = strdup(name) else { free(copy); throw AuxSealedDaemonEntryError.allocation }
        bytes.copyBytes(to: copy.assumingMemoryBound(to: UInt8.self), count: bytes.count)
        source.pointee = copy; length.pointee = UInt(bytes.count); resource.pointee = url
        return 0
    } catch { return -1 }
}

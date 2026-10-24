// Fixed supplied entry resource. No argv path, source text or hash is accepted.
import Foundation
import Security
import Darwin

enum AuxSealedCliEntryError: Error { case role, file, changed, signature(OSStatus), allocation }

private func cliSealedEntryMetadata(_ descriptor: Int32, directory: Bool) throws -> stat {
    var value = stat()
    guard fstat(descriptor, &value) == 0,
          value.st_mode & S_IFMT == (directory ? S_IFDIR : S_IFREG),
          value.st_uid == geteuid() || value.st_uid == 0,
          value.st_mode & 0o022 == 0,
          directory || (value.st_nlink == 1 && value.st_size > 0 && value.st_size <= 32 * 1024 * 1024) else {
        throw AuxSealedCliEntryError.file
    }
    errno = 0
    let acl = acl_get_fd_np(descriptor, ACL_TYPE_EXTENDED)
    if acl == nil && errno == ENOENT { return value }
    guard let acl else { throw AuxSealedCliEntryError.file }
    defer { acl_free(UnsafeMutableRawPointer(acl)) }
    var entry: acl_entry_t?
    errno = 0
    guard acl_valid(acl) == 0, acl_get_entry(acl, 0, &entry) == -1,
          errno == EINVAL, entry == nil else { throw AuxSealedCliEntryError.file }
    return value
}

private func cliSealedEntrySame(_ descriptor: Int32, _ initial: stat) throws {
    let current = try cliSealedEntryMetadata(descriptor, directory: false)
    guard current.st_dev == initial.st_dev, current.st_ino == initial.st_ino,
          current.st_size == initial.st_size, current.st_mode == initial.st_mode,
          current.st_uid == initial.st_uid,
          current.st_mtimespec.tv_sec == initial.st_mtimespec.tv_sec,
          current.st_mtimespec.tv_nsec == initial.st_mtimespec.tv_nsec,
          current.st_ctimespec.tv_sec == initial.st_ctimespec.tv_sec,
          current.st_ctimespec.tv_nsec == initial.st_ctimespec.tv_nsec else {
        throw AuxSealedCliEntryError.changed
    }
}

private func loadSealedNativeCliEntry() throws -> (Data, String) {
    let policy = try AuxSignedFreshBootstrapPolicyLoader.load()
    guard policy.contents.role == .cli else { throw AuxSealedCliEntryError.role }
    let root = open(policy.bundlePath, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
    guard root >= 0 else { throw AuxSealedCliEntryError.file }
    var descriptors = [root]
    defer { for descriptor in descriptors.reversed() { close(descriptor) } }
    _ = try cliSealedEntryMetadata(root, directory: true)
    for name in ["Contents", "Resources", "node-development"] {
        let next = openat(descriptors.last!, name, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard next >= 0 else { throw AuxSealedCliEntryError.file }
        descriptors.append(next)
        _ = try cliSealedEntryMetadata(next, directory: true)
    }
    let parent = descriptors.last!
    let file = openat(parent, "aux-native-cli-entry.mjs", O_RDONLY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
    guard file >= 0 else { throw AuxSealedCliEntryError.file }
    descriptors.append(file)
    let initial = try cliSealedEntryMetadata(file, directory: false)
    var bytes = Data(count: Int(initial.st_size))
    try bytes.withUnsafeMutableBytes { buffer in
        var offset = 0
        while offset < buffer.count {
            let count = pread(file, buffer.baseAddress!.advanced(by: offset), buffer.count - offset, off_t(offset))
            if count < 0 && errno == EINTR { continue }
            guard count > 0 else { throw AuxSealedCliEntryError.file }
            offset += count
        }
    }
    try cliSealedEntrySame(file, initial)
    var entry = stat()
    guard fstatat(parent, "aux-native-cli-entry.mjs", &entry, AT_SYMLINK_NOFOLLOW) == 0,
          entry.st_dev == initial.st_dev, entry.st_ino == initial.st_ino else {
        throw AuxSealedCliEntryError.changed
    }
    var dynamic: SecCode?
    var status = SecCodeCopySelf([], &dynamic)
    guard status == errSecSuccess, let dynamic else { throw AuxSealedCliEntryError.signature(status) }
    var code: SecStaticCode?
    status = SecCodeCopyStaticCode(dynamic, [], &code)
    guard status == errSecSuccess, let code else { throw AuxSealedCliEntryError.signature(status) }
    status = SecCodeValidateFileResource(code, "Resources/node-development/aux-native-cli-entry.mjs" as CFString, bytes as CFData, [])
    guard status == errSecSuccess else { throw AuxSealedCliEntryError.signature(status) }
    try cliSealedEntrySame(file, initial)
    try policy.revalidateCurrentIdentity()
    return (bytes, URL(fileURLWithPath: policy.bundlePath + "/Contents/Resources/node-development/aux-native-cli-entry.mjs").absoluteString)
}

// Plain malloc buffers cross the native C boundary, never Swift/C++ containers.
// Caller copies them into Node ModuleData, then frees both with free().
@_cdecl("AuxCopySealedNativeCliEntry")
func AuxCopySealedNativeCliEntry(_ source: UnsafeMutablePointer<UnsafeMutableRawPointer?>?,
                                  _ length: UnsafeMutablePointer<UInt>?,
                                  _ resource: UnsafeMutablePointer<UnsafeMutablePointer<CChar>?>?) -> Int32 {
    guard let source, let length, let resource else { return -1 }
    source.pointee = nil; length.pointee = 0; resource.pointee = nil
    do {
        let (bytes, name) = try loadSealedNativeCliEntry()
        guard let copy = malloc(bytes.count) else { throw AuxSealedCliEntryError.allocation }
        guard let url = strdup(name) else { free(copy); throw AuxSealedCliEntryError.allocation }
        bytes.copyBytes(to: copy.assumingMemoryBound(to: UInt8.self), count: bytes.count)
        source.pointee = copy; length.pointee = UInt(bytes.count); resource.pointee = url
        return 0
    } catch { return -1 }
}

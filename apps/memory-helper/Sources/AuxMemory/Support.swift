import CryptoKit
import Foundation

struct HelperError: Error, CustomStringConvertible {
    let description: String
    init(_ description: String) { self.description = description }
}

/// A read-only memory map of a model file.
final class MappedFile {
    let pointer: UnsafeRawPointer
    let count: Int

    init(_ url: URL) throws {
        let fd = open(url.path, O_RDONLY | O_CLOEXEC)
        guard fd >= 0 else { throw HelperError("Cannot read local memory model \(url.lastPathComponent)") }
        defer { close(fd) }
        var info = stat()
        guard fstat(fd, &info) == 0, info.st_size > 0 else { throw HelperError("Invalid local model file size: \(url.lastPathComponent)") }
        count = Int(info.st_size)
        guard let base = mmap(nil, count, PROT_READ, MAP_PRIVATE, fd, 0), base != MAP_FAILED else {
            throw HelperError("Cannot read local memory model \(url.lastPathComponent)")
        }
        pointer = UnsafeRawPointer(base)
    }

    deinit { munmap(UnsafeMutableRawPointer(mutating: pointer), count) }

    func u32(at offset: Int) -> UInt32 { UInt32(littleEndian: pointer.loadUnaligned(fromByteOffset: offset, as: UInt32.self)) }
}

func sha256Hex(_ data: some DataProtocol) -> String {
    SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
}

func sha256Hex(_ text: String) -> String { sha256Hex(Data(text.utf8)) }

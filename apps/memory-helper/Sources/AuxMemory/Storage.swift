import Foundation

/// One indexed chunk: its id, text, and source record (the chunk without its text).
struct Doc {
    let id: String
    let text: String
    let source: JSON
}

/// A committed generation: `docs[i]` owns row `i` of `vectors`.
struct Snapshot {
    var generation: Int
    var docs: [Doc]
    var vectors: [Float]   // count × 384, row-major

    static let empty = Snapshot(generation: 0, docs: [], vectors: [])
    func vector(_ i: Int) -> ArraySlice<Float> { vectors[(i * Embedder.dimensions)..<((i + 1) * Embedder.dimensions)] }
}

/// The on-disk index (spec 2.2):
///
///     <directory>/memory-index-local.json
///     <directory>/.local-memory/writer.lock
///     <directory>/.local-memory/memory/CURRENT            "gen-NNNNNNNNNN"
///     <directory>/.local-memory/memory/gen-NNNNNNNNNN/    COMMITTED session.json docs.json index.mossvec
enum Storage {
    static let indexName = "memory"
    static let manifestName = "memory-index-local.json"

    static func generationName(_ n: Int) -> String { "gen-" + String(format: "%010d", n) }

    static func generationNumber(_ name: String) -> Int? {
        guard name.hasPrefix("gen-"), name.utf8.count == 14 else { return nil }
        let digits = name.dropFirst(4)
        guard digits.allSatisfy({ $0.isASCII && $0.isNumber }) else { return nil }
        return Int(digits)
    }

    // MARK: Reading

    /// The CURRENT generation, or the newest committed one when CURRENT is unusable (which is then
    /// repaired). Unreadable generations are skipped, never deleted.
    static func load(index: URL, modelId: String) throws -> Snapshot? {
        let fm = FileManager.default
        guard fm.fileExists(atPath: index.path) else { return nil }
        let current = (try? String(contentsOf: index.appendingPathComponent("CURRENT"), encoding: .utf8)).flatMap(generationNumber)
        if let current, let snapshot = try? read(index: index, generation: current, modelId: modelId) { return snapshot }
        let names = (try? fm.contentsOfDirectory(atPath: index.path)) ?? []
        for n in names.compactMap(generationNumber).sorted(by: >) where n != current {
            guard let snapshot = try? read(index: index, generation: n, modelId: modelId) else {
                log("Preserving invalid memory snapshot: \(generationName(n))")
                continue
            }
            do { try writeCurrent(index: index, generation: n) } catch {
                log("Could not repair memory snapshot CURRENT: \(error)")
            }
            return snapshot
        }
        if !names.isEmpty { throw HelperError("No valid committed snapshot") }
        return nil
    }

    static func read(index: URL, generation: Int, modelId: String) throws -> Snapshot {
        let name = generationName(generation)
        let dir = index.appendingPathComponent(name)
        guard (try? String(contentsOf: dir.appendingPathComponent("COMMITTED"), encoding: .utf8)) == name else {
            throw HelperError("No valid committed snapshot")
        }
        let session = try JSON.parse(Array(Data(contentsOf: dir.appendingPathComponent("session.json"))))
        guard session["modelId"]?.string == modelId, session["name"]?.string == indexName, session["generation"]?.string == name,
              session["dimension"]?.int == Embedder.dimensions, let ids = session["docIds"]?.array?.compactMap(\.string)
        else { throw HelperError("Snapshot model/name/generation differs") }
        guard case .array(let entries)? = try? JSON.parse(Array(Data(contentsOf: dir.appendingPathComponent("docs.json")))) else {
            throw HelperError("Snapshot document count differs")
        }
        let docs: [Doc] = try entries.map {
            guard let id = $0["id"]?.string, let text = $0["text"]?.string, let payload = $0["payload"]?.string else {
                throw HelperError("Snapshot document IDs differ")
            }
            return Doc(id: id, text: text, source: try JSON.parse(Array(payload.utf8)))
        }
        guard docs.count == ids.count else { throw HelperError("Snapshot document count differs") }
        guard docs.map(\.id) == ids else { throw HelperError("Snapshot document IDs differ") }
        let vectors = try Mossvec.read(Data(contentsOf: dir.appendingPathComponent("index.mossvec")), rows: docs.count)
        return Snapshot(generation: generation, docs: docs, vectors: vectors)
    }

    // MARK: Writing

    /// Writes the generation, marks it committed, swaps CURRENT, keeps one previous generation,
    /// then rewrites the manifest.
    static func commit(_ snapshot: Snapshot, directory: URL, index: URL, modelId: String, now: Date = Date()) throws {
        let fm = FileManager.default
        let name = generationName(snapshot.generation)
        let dir = index.appendingPathComponent(name)
        try fm.createDirectory(at: index, withIntermediateDirectories: true)
        if fm.fileExists(atPath: dir.path) { try fm.removeItem(at: dir) }
        try fm.createDirectory(at: dir, withIntermediateDirectories: false)

        let docs = JSON.array(snapshot.docs.map { .object([("id", .string($0.id)), ("text", .string($0.text)), ("payload", .string($0.source.serialized))]) })
        try write(Data(docs.serialized.utf8), to: dir.appendingPathComponent("docs.json"))
        let temporary = dir.appendingPathComponent("index.tmp")
        try write(Mossvec.encode(snapshot.vectors, rows: snapshot.docs.count), to: temporary)
        try rename(temporary, dir.appendingPathComponent("index.mossvec"))
        let session = JSON.object([
            "dimension": .int(Embedder.dimensions), "docIds": .array(snapshot.docs.map { .string($0.id) }),
            "generation": .string(name), "manifestSha256": .null, "modelArtifactVersion": .null, "modelId": .string(modelId),
            "name": .string(indexName), "updatedAt": .string(timestamp(now)),
        ] as [String: JSON])
        try write(Data(session.serialized.utf8), to: dir.appendingPathComponent("session.json"))
        try write(Data(name.utf8), to: dir.appendingPathComponent("COMMITTED"))
        try fsyncDirectory(dir)
        try writeCurrent(index: index, generation: snapshot.generation)

        for entry in (try? fm.contentsOfDirectory(atPath: index.path)) ?? [] {
            guard let n = generationNumber(entry), n != snapshot.generation, n != snapshot.generation - 1 else { continue }
            try? fm.removeItem(at: index.appendingPathComponent(entry))
        }

        var entries: [String: JSON] = [:]
        for doc in snapshot.docs { entries[doc.id] = doc.source }
        let manifest = JSON.object(["entries": .object(entries), "version": .int(1)] as [String: JSON])
        let tmp = directory.appendingPathComponent(".local-memory.memory-index-local.tmp")
        try write(Data(manifest.serialized.utf8), to: tmp)
        try rename(tmp, directory.appendingPathComponent(manifestName))
    }

    static func writeCurrent(index: URL, generation: Int) throws {
        let tmp = index.appendingPathComponent("CURRENT.tmp.\(UUID().uuidString.lowercased())")
        try write(Data(generationName(generation).utf8), to: tmp)
        try rename(tmp, index.appendingPathComponent("CURRENT"))
        try fsyncDirectory(index)
    }

    static func write(_ data: Data, to url: URL) throws {
        let fd = open(url.path, O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0o644)
        guard fd >= 0 else { throw OSError.current() }
        defer { close(fd) }
        try data.withUnsafeBytes { raw in
            var offset = 0
            while offset < raw.count {
                let n = Foundation.write(fd, raw.baseAddress! + offset, raw.count - offset)
                if n < 0 { if errno == EINTR { continue }; throw OSError.current() }
                offset += n
            }
        }
        guard fsync(fd) == 0 else { throw OSError.current() }
    }

    static func rename(_ from: URL, _ to: URL) throws {
        guard Foundation.rename(from.path, to.path) == 0 else { throw OSError.current() }
    }

    static func fsyncDirectory(_ url: URL) throws {
        let fd = open(url.path, O_RDONLY | O_CLOEXEC)
        guard fd >= 0 else { throw OSError.current() }
        defer { close(fd) }
        _ = fsync(fd)
    }

    /// RFC 3339 with milliseconds and Z, as chrono's `to_rfc3339_opts(Millis, true)` writes it.
    static func timestamp(_ date: Date) -> String {
        var seconds = time_t(floor(date.timeIntervalSince1970))
        let millis = Int((date.timeIntervalSince1970 - Double(seconds)) * 1000)
        var t = tm()
        gmtime_r(&seconds, &t)
        return String(format: "%04d-%02d-%02dT%02d:%02d:%02d.%03dZ", Int(t.tm_year) + 1900, Int(t.tm_mon) + 1, Int(t.tm_mday),
                      Int(t.tm_hour), Int(t.tm_min), Int(t.tm_sec), millis)
    }
}

/// `index.mossvec` v2, f32 rows (spec 2.2): a 256-byte header, then per row
/// `u64 ordinal, f32 norm, u32 0, f32[384]`, all little-endian.
enum Mossvec {
    static let headerSize = 256
    static let stride = 16 + 4 * Embedder.dimensions

    static func encode(_ vectors: [Float], rows: Int) -> Data {
        var out = Data(count: headerSize + rows * stride)
        out.withUnsafeMutableBytes { raw in
            let p = raw.baseAddress!
            p.copyMemory(from: Array("MOSS".utf8), byteCount: 4)
            p.storeBytes(of: UInt16(2).littleEndian, toByteOffset: 4, as: UInt16.self)
            p.storeBytes(of: UInt16(1).littleEndian, toByteOffset: 6, as: UInt16.self)
            p.storeBytes(of: UInt32(Embedder.dimensions).littleEndian, toByteOffset: 8, as: UInt32.self)
            p.storeBytes(of: UInt32(stride).littleEndian, toByteOffset: 12, as: UInt32.self)
            p.storeBytes(of: UInt64(rows).littleEndian, toByteOffset: 16, as: UInt64.self)
            p.storeBytes(of: UInt64(headerSize).littleEndian, toByteOffset: 24, as: UInt64.self)
            for i in 0..<rows {
                let row = p + headerSize + i * stride
                let v = vectors[(i * Embedder.dimensions)..<((i + 1) * Embedder.dimensions)]
                row.storeBytes(of: UInt64(i).littleEndian, toByteOffset: 0, as: UInt64.self)
                row.storeBytes(of: norm(v).bitPattern.littleEndian, toByteOffset: 8, as: UInt32.self)
                row.storeBytes(of: UInt32(0), toByteOffset: 12, as: UInt32.self)
                for (k, x) in v.enumerated() { row.storeBytes(of: x.bitPattern.littleEndian, toByteOffset: 16 + 4 * k, as: UInt32.self) }
            }
        }
        return out
    }

    static func read(_ data: Data, rows: Int) throws -> [Float] {
        guard data.count >= headerSize else { throw HelperError("Truncated mossvec header") }
        return try data.withUnsafeBytes { raw -> [Float] in
            let p = raw.baseAddress!
            func u16(_ o: Int) -> UInt16 { UInt16(littleEndian: p.loadUnaligned(fromByteOffset: o, as: UInt16.self)) }
            func u32(_ o: Int) -> UInt32 { UInt32(littleEndian: p.loadUnaligned(fromByteOffset: o, as: UInt32.self)) }
            func u64(_ o: Int) -> UInt64 { UInt64(littleEndian: p.loadUnaligned(fromByteOffset: o, as: UInt64.self)) }
            guard Array(raw[0..<4]) == Array("MOSS".utf8), u16(4) == 2, u32(8) == UInt32(Embedder.dimensions) else {
                throw HelperError("Invalid mossvec header/dimension")
            }
            guard u16(6) == 1 else { throw HelperError("SQ8 requires mossvec v2") }
            guard u32(12) == UInt32(stride) else { throw HelperError("Invalid mossvec stride") }
            let header = Int(u64(24))
            guard u64(16) == UInt64(rows) else { throw HelperError("Snapshot vector/document count differs") }
            guard header >= 32, data.count >= header + rows * stride else { throw HelperError("Truncated binary data or length overflow") }
            var vectors = [Float](repeating: 0, count: rows * Embedder.dimensions)
            for i in 0..<rows {
                let row = header + i * stride
                guard u64(row) == UInt64(i) else { throw HelperError("Invalid mossvec ordinal") }
                for k in 0..<Embedder.dimensions {
                    vectors[i * Embedder.dimensions + k] = Float(bitPattern: u32(row + 16 + 4 * k))
                }
            }
            return vectors
        }
    }

    /// Sequential f32 sum of squares, then the square root: the norm stored beside each row.
    static func norm(_ v: ArraySlice<Float>) -> Float {
        var sum: Float = 0
        for x in v {
            let square = x * x
            sum = sum + square
        }
        return sum.squareRoot()
    }
}

/// An errno failure, described the way Rust's io::Error displays it.
struct OSError: Error, CustomStringConvertible {
    let code: Int32
    static func current() -> OSError { OSError(code: errno) }
    var description: String { "\(String(cString: strerror(code))) (os error \(code))" }
}

func log(_ message: String) {
    FileHandle.standardError.write(Data((message + "\n").utf8))
}

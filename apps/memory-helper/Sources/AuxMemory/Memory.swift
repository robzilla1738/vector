import Foundation

/// The model bundle, the shared query embedder and the open memory accounts.
final class Memory {
    static let coreMLModelId = "bekko-a8m@c721113d59a1d91b447450324f51c4b3332c924a:row-i8-coreml-f32-512:v2"
    static let maxAccounts = 8

    let modelDirectory: URL
    let modelId: String
    private let fingerprint: [String: [Int]]
    private let lock = NSLock()
    private var shared: Embedder?
    private var accounts: [String: Account] = [:]

    init(modelDirectory: URL) throws {
        self.modelDirectory = modelDirectory
        let descriptor = modelDirectory.appendingPathComponent("model.json")
        guard let data = FileManager.default.contents(atPath: descriptor.path) else {
            var info = stat()
            let error = stat(descriptor.path, &info) == 0 ? OSError(code: EACCES) : OSError.current()
            throw HelperError("Cannot read local memory model \(descriptor.path): \(error)")
        }
        guard let manifest = try? JSON.parse(Array(data)), manifest["formatVersion"]?.int == 1, let id = manifest["id"]?.string,
              case .object(let files)? = manifest["files"]
        else { throw HelperError("Unsupported local model bundle") }
        guard id == Self.coreMLModelId else { throw HelperError("Unsupported local model bundle") }
        modelId = id
        var fingerprint: [String: [Int]] = [:]
        for (path, entry) in files {
            let url = modelDirectory.appendingPathComponent(path)
            var info = stat()
            guard stat(url.path, &info) == 0, entry["bytes"]?.int == Int(info.st_size) else {
                throw HelperError("Invalid local model file size: \(path)")
            }
            fingerprint[path] = [Int(info.st_dev), Int(info.st_ino), Int(info.st_size), Int(info.st_mtimespec.tv_sec), Int(info.st_mtimespec.tv_nsec)]
        }
        self.fingerprint = fingerprint
    }

    private func checkUnchanged() throws {
        for (path, expected) in fingerprint {
            var info = stat()
            let now = stat(modelDirectory.appendingPathComponent(path).path, &info) == 0
                ? [Int(info.st_dev), Int(info.st_ino), Int(info.st_size), Int(info.st_mtimespec.tv_sec), Int(info.st_mtimespec.tv_nsec)] : []
            if now != expected { throw HelperError("Model bundle changed while the process was running") }
        }
    }

    /// A fresh embedder; a bulk build gets an accelerated one, and the shared one stays as it is.
    func makeEmbedder(accelerated: Bool = false) throws -> Embedder {
        try checkUnchanged()
        return try Embedder(directory: modelDirectory, accelerated: accelerated)
    }

    /// The shared query embedder, loaded on first use.
    func embedder() throws -> Embedder {
        lock.lock(); defer { lock.unlock() }
        if let shared { return shared }
        let e = try makeEmbedder()
        shared = e
        return e
    }

    var modelLoaded: Bool { lock.lock(); defer { lock.unlock() }; return shared != nil }

    func account(_ path: String) throws -> Account {
        guard path.hasPrefix("/") else { throw HelperError("Memory directory must be absolute") }
        guard let real = realpath(path, nil) else { throw OSError.current() }
        let canonical = String(cString: real)
        free(real)
        lock.lock(); defer { lock.unlock() }
        if let account = accounts[canonical] { return account }
        guard accounts.count < Self.maxAccounts else { throw HelperError("Too many active memory accounts") }
        let account = try Account(directory: URL(fileURLWithPath: canonical, isDirectory: true), memory: self)
        accounts[canonical] = account
        return account
    }

    func close(_ path: String) throws {
        guard path.hasPrefix("/") else { throw HelperError("Memory directory must be absolute") }
        guard let real = realpath(path, nil) else { throw OSError.current() }
        let canonical = String(cString: real)
        free(real)
        lock.lock()
        let account = accounts.removeValue(forKey: canonical)
        if accounts.isEmpty { shared = nil }
        lock.unlock()
        account?.close()
    }
}

/// One memory directory: its writer lock, committed snapshot, in-memory sparse index and sync.
final class Account {
    let directory: URL
    let index: URL
    unowned let memory: Memory
    private var lockDescriptor: Int32
    private let state = NSLock()
    private var snapshot: Snapshot?
    private var sparse: (generation: Int, count: Int, index: SparseIndex)?
    private var syncing = false
    private var everSynced = false           // a sync has started in this process
    private var waiters: [(Result<JSON, Error>) -> Void] = []
    private var lastError: String?
    private var fileHashes: [String: String] = [:]   // path → sha256 of the bytes last indexed
    private var progress: (processed: Int, total: Int)?
    private var closed = false
    private let syncQueue = DispatchQueue(label: "aux.memory.sync")

    static let maxWaiters = 64
    static let maxSourceBytes = 16 << 20

    init(directory: URL, memory: Memory) throws {
        self.directory = directory
        self.memory = memory
        let local = directory.appendingPathComponent(".local-memory")
        index = local.appendingPathComponent(Storage.indexName)
        if mkdir(local.path, 0o777) != 0 && errno != EEXIST { throw OSError.current() }
        let fd = open(local.appendingPathComponent("writer.lock").path, O_RDWR | O_CREAT | O_CLOEXEC, 0o644)
        guard fd >= 0 else { throw OSError.current() }
        guard flock(fd, LOCK_EX | LOCK_NB) == 0 else {
            let error = OSError.current()
            Foundation.close(fd)
            // Rust's File::try_lock describes contention this way.
            let reason = error.code == EWOULDBLOCK ? "lock acquisition failed because the operation would block" : "\(error)"
            throw HelperError("Memory index is already owned or cannot be locked: \(reason)")
        }
        lockDescriptor = fd
        do { snapshot = try Storage.load(index: index, modelId: memory.modelId) } catch {
            log("Preserving invalid memory snapshot: \(error)")
            let aside = local.appendingPathComponent("memory.invalid-\(Int(Date().timeIntervalSince1970 * 1000))")
            _ = Foundation.rename(index.path, aside.path)
            snapshot = nil
        }
    }

    func close() {
        state.lock()
        closed = true
        let fd = lockDescriptor
        lockDescriptor = -1
        state.unlock()
        if fd >= 0 { Foundation.close(fd) }
    }

    // MARK: Status

    func status() -> JSON {
        state.lock(); defer { state.unlock() }
        let count = snapshot?.docs.count ?? 0
        return .object([
            "count": .int(count), "error": lastError.map(JSON.string) ?? .null, "indexing": .bool(syncing),
            "modelId": .string(memory.modelId), "modelLoaded": .bool(memory.modelLoaded),
            "processedFiles": progress.map { .int($0.processed) } ?? .null,
            "totalFiles": progress.map { .int($0.total) } ?? .null,
        ] as [String: JSON])
    }

    // MARK: Sync

    /// Runs a sync, or joins the one already running. A rebuild cannot join.
    func sync(rebuild: Bool, completion: @escaping (Result<JSON, Error>) -> Void) {
        state.lock()
        if syncing {
            defer { state.unlock() }
            if rebuild { return completion(.failure(HelperError("A memory sync is already running"))) }
            guard waiters.count < Self.maxWaiters else { return completion(.failure(HelperError("Too many waiting sync requests"))) }
            waiters.append(completion)
            return
        }
        syncing = true
        everSynced = true
        waiters = [completion]
        state.unlock()
        syncQueue.async { [self] in
            let result: Result<JSON, Error>
            do { result = .success(try runSync(rebuild: rebuild)) } catch { result = .failure(error) }
            state.lock()
            syncing = false
            progress = nil
            if case .failure(let error) = result {
                lastError = "\(error)"
                log("Memory sync failed: \(error)")
            } else {
                lastError = nil
            }
            let done = waiters
            waiters = []
            state.unlock()
            done.forEach { $0(result) }
        }
    }

    /// Files go in byte order of their paths. A file whose bytes this process already indexed is
    /// skipped; otherwise each chunk is inserted (new id, embedded now and appended) or its record
    /// updated in place (same id, different record), then the file's ids that no longer appear are
    /// removed. Ids of deleted files go last. Each of those, plus a rebuild's reset, is a change; a
    /// checkpoint generation is committed every max(256, size at the last commit / 4) changes, and
    /// the rest at the end. `changed` in the reply counts them all.
    private func runSync(rebuild: Bool) throws -> JSON {
        let files = try sources()
        state.lock()
        let previous = snapshot
        var hashes = rebuild ? [:] : fileHashes
        if closed { state.unlock(); throw HelperError("Memory account closed") }
        progress = (0, files.count)
        state.unlock()

        let bulk = rebuild || previous == nil
        let embedder = bulk ? try memory.makeEmbedder(accelerated: true) : try memory.embedder()
        var work = Working(bulk ? .empty : previous!)
        var generation = previous?.generation ?? 0
        var base = previous?.docs.count ?? 0
        var pending = 0, added = 0, changed = 0
        func change() throws {
            pending += 1
            changed += 1
            guard pending >= max(256, base / 4) else { return }
            generation += 1
            let checkpoint = work.snapshot(generation: generation)
            try Storage.commit(checkpoint, directory: directory, index: index, modelId: memory.modelId)
            state.lock(); snapshot = checkpoint; state.unlock()
            base = checkpoint.docs.count
            pending = 0
        }

        let present = Set(files.map(\.path))
        let idsByPath = work.idsByPath()
        if rebuild { try change() }
        for (index, file) in files.enumerated() {
            defer { state.lock(); progress = (index + 1, files.count); state.unlock() }
            if hashes[file.path] == file.hash { continue }
            var seen = Set<String>()
            for chunk in Chunker.chunk(path: file.path, text: file.text) {
                seen.insert(chunk.id)
                let doc = Doc(id: chunk.id, text: chunk.text, source: chunk.source())
                if let slot = work.slot(chunk.id) {
                    if work.docs[slot].source != doc.source { work.docs[slot] = doc; try change() }
                } else {
                    work.append(doc, try embedder.embed(doc.text))
                    added += 1
                    try change()
                }
            }
            for id in idsByPath[file.path] ?? [] where !seen.contains(id) && work.remove(id) { try change() }
            hashes[file.path] = file.hash
        }
        for path in idsByPath.keys.sorted(by: { Array($0.utf8).lexicographicallyPrecedes(Array($1.utf8)) }) where !present.contains(path) {
            for id in idsByPath[path]! where work.remove(id) { try change() }
        }
        hashes = hashes.filter { present.contains($0.key) }
        if pending > 0 || previous == nil {
            generation += 1
            let final = work.snapshot(generation: generation)
            try Storage.commit(final, directory: directory, index: index, modelId: memory.modelId)
            state.lock(); snapshot = final; state.unlock()
        }
        state.lock()
        fileHashes = hashes
        let count = snapshot?.docs.count ?? 0
        state.unlock()
        return syncReply(added: added, changed: changed, count: count, files: files.count)
    }

    private func syncReply(added: Int, changed: Int, count: Int, files: Int) -> JSON {
        .object(["added": .int(added), "changed": .int(changed), "count": .int(count), "files": .int(files)] as [String: JSON])
    }

    /// Every `*.md` regular file under the directory, skipping dot names and symbolic links, in
    /// byte order of their relative paths.
    private func sources() throws -> [(path: String, text: String, hash: String)] {
        var found: [String] = []
        func walk(_ relative: String) throws {
            let absolute = relative.isEmpty ? directory.path : directory.path + "/" + relative
            guard let dir = opendir(absolute) else {
                if relative.isEmpty { throw OSError.current() }
                return
            }
            defer { closedir(dir) }
            while let entry = readdir(dir) {
                let name = withUnsafeBytes(of: entry.pointee.d_name) { raw in
                    String(decoding: raw.prefix(Int(entry.pointee.d_namlen)), as: UTF8.self)
                }
                if name.hasPrefix(".") { continue }
                let path = relative.isEmpty ? name : relative + "/" + name
                var info = stat()
                guard lstat(directory.path + "/" + path, &info) == 0 else { continue }
                switch info.st_mode & S_IFMT {
                case S_IFDIR: try walk(path)
                case S_IFREG where name.hasSuffix(".md"): found.append(path)
                default: break
                }
            }
        }
        try walk("")
        found.sort { Array($0.utf8).lexicographicallyPrecedes(Array($1.utf8)) }
        return found.compactMap { path in
            let absolute = directory.path + "/" + path
            guard let data = FileManager.default.contents(atPath: absolute), data.count <= Self.maxSourceBytes else {
                log("Skipping memory source \(absolute): Invalid or oversized memory source file")
                return nil
            }
            return (path, String(decoding: data, as: UTF8.self), sha256Hex(data))
        }
    }

    // MARK: Search

    /// The first search in a process also starts a catch-up sync in the background; with no
    /// snapshot yet it can only report that the index is being built.
    func search(query: String, topK: Int, alpha: Double?) throws -> JSON {
        let started = DispatchTime.now()
        state.lock()
        let catchUp = !everSynced
        state.unlock()
        if catchUp { sync(rebuild: false) { _ in } }
        state.lock()
        let current = snapshot
        let indexing = syncing
        state.unlock()
        guard let current else { throw HelperError("Memory index is being initialized; retry shortly") }
        let docs = try Search.run(snapshot: current, query: query, topK: topK, alpha: alpha, embedder: memory.embedder(),
                                  sparse: sparseIndex(for: current))
        let elapsed = Double(DispatchTime.now().uptimeNanoseconds - started.uptimeNanoseconds) / 1_000_000
        return .object([
            "docs": .array(docs), "indexName": .string(Storage.indexName), "indexing": .bool(indexing),
            "query": .string(query), "timeTakenInMs": .double(elapsed),
        ] as [String: JSON])
    }

    private func sparseIndex(for snapshot: Snapshot) -> SparseIndex {
        state.lock(); defer { state.unlock() }
        if let sparse, sparse.generation == snapshot.generation, sparse.count == snapshot.docs.count { return sparse.index }
        let built = SparseIndex(texts: snapshot.docs.map(\.text))
        sparse = (snapshot.generation, snapshot.docs.count, built)
        return built
    }
}

/// The index while a sync edits it: slots in document order, removed ones left as holes.
private struct Working {
    var docs: [Doc] = []
    private var vectors: [Float] = []
    private var alive: [Bool] = []
    private var slots: [String: Int] = [:]

    init(_ snapshot: Snapshot) {
        docs = snapshot.docs
        vectors = snapshot.vectors
        alive = Array(repeating: true, count: docs.count)
        for (i, doc) in docs.enumerated() { slots[doc.id] = i }
    }

    func slot(_ id: String) -> Int? { slots[id] }

    mutating func append(_ doc: Doc, _ vector: [Float]) {
        slots[doc.id] = docs.count
        docs.append(doc)
        vectors += vector
        alive.append(true)
    }

    /// False when the id isn't indexed (already removed).
    mutating func remove(_ id: String) -> Bool {
        guard let i = slots.removeValue(forKey: id) else { return false }
        alive[i] = false
        return true
    }

    /// Ids per source path, in document order.
    func idsByPath() -> [String: [String]] {
        var out: [String: [String]] = [:]
        for (i, doc) in docs.enumerated() where alive[i] { out[doc.source["path"]?.string ?? "", default: []].append(doc.id) }
        return out
    }

    func snapshot(generation: Int) -> Snapshot {
        var s = Snapshot(generation: generation, docs: [], vectors: [])
        let d = Embedder.dimensions
        for i in docs.indices where alive[i] {
            s.docs.append(docs[i])
            s.vectors += vectors[(i * d)..<((i + 1) * d)]
        }
        return s
    }
}

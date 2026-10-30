import Foundation

// aux-memory <modelDirectory> <onnxRuntimeLibrary|"">
//
// Newline-delimited JSON over stdio (docs/spec/memory-helper.md 1.5). A request the protocol
// can't parse is fatal (exit 1); stdin EOF ends the process at once.

setvbuf(stdout, nil, _IOFBF, 1 << 16)
signal(SIGPIPE, SIG_IGN)

let arguments = CommandLine.arguments
guard arguments.count >= 2 else {
    log("Expected model directory")
    exit(1)
}
guard SparseText.available else {
    log("Invalid local model tokenizer")
    exit(1)
}

let memory: Memory
do { memory = try Memory(modelDirectory: URL(fileURLWithPath: arguments[1], isDirectory: true)) } catch {
    log("\(error)")
    exit(1)
}

let output = NSLock()
func reply(_ id: UInt64, _ result: Result<JSON, Error>) {
    let line: JSON
    switch result {
    case .success(let value): line = .object([("id", .uint(id)), ("result", value)])
    case .failure(let error): line = .object([("error", .string("\(error)")), ("id", .uint(id))])
    }
    var text = line.serialized
    text += "\n"
    output.lock()
    fputs(text, stdout)
    fflush(stdout)
    output.unlock()
}

let work = DispatchQueue(label: "aux.memory.requests", attributes: .concurrent)

func handle(_ request: Request) {
    let id = request.id
    switch request.command {
    case .shutdown:
        reply(id, .success(.object([("shutdown", .bool(true))])))
        exit(0)
    case .sync(let directory, let rebuild):
        do { try memory.account(directory).sync(rebuild: rebuild) { reply(id, $0) } } catch { reply(id, .failure(error)) }
    default:
        work.async {
            reply(id, Result {
                switch request.command {
                case .status(let directory): return try memory.account(directory).status()
                case .close(let directory): try memory.close(directory); return .object([(String, JSON)]())
                case .search(let directory, let query, let topK, let alpha):
                    guard query.utf8.count <= 65_536, topK <= 100, alpha?.isFinite ?? true else {
                        throw HelperError("Invalid memory search bounds")
                    }
                    return try memory.account(directory).search(query: query, topK: topK, alpha: alpha)
                case .embed(let text): return .array(try memory.embedder().embed(text).map { .double(Double($0)) })
                case .chunk(let path, let text): return .array(Chunker.chunk(path: path, text: text).map { $0.source(includingText: true) })
                case .sync, .shutdown: fatalError("handled above")
                }
            })
        }
    }
}

// Read lines from stdin; each must be a complete request of at most 1 MiB.
let limit = 1 << 20
var pending: [UInt8] = []
var buffer = [UInt8](repeating: 0, count: 1 << 16)
while true {
    let n = read(0, &buffer, buffer.count)
    if n < 0 { if errno == EINTR { continue }; exit(1) }
    if n == 0 {
        if pending.isEmpty { exit(0) }
        log("Truncated memory request")
        exit(1)
    }
    pending += buffer[0..<n]
    while let newline = pending.firstIndex(of: 0x0A) {
        let line = Array(pending[..<newline])
        pending.removeSubrange(...newline)
        do { handle(try Request(line)) } catch {
            log("\(error)")
            exit(1)
        }
    }
    if pending.count > limit {
        log("Memory request exceeds size limit")
        exit(1)
    }
}

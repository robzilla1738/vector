/// A request line, decoded as strictly as the reference's serde types: `id` is a u64, `method`
/// selects the variant and `params` must be an object holding that variant's fields (unknown
/// fields are ignored). Anything else is a protocol error.
struct Request {
    enum Command {
        case status(String)
        case sync(String, rebuild: Bool)
        case search(String, query: String, topK: Int, alpha: Double?)
        case close(String)
        case shutdown
        case embed(String)
        case chunk(path: String, text: String)
    }

    struct Invalid: Error, CustomStringConvertible { let description: String }

    let id: UInt64
    let command: Command

    static let methods = ["search", "sync", "close", "status", "embed", "chunk", "shutdown"]

    init(_ line: [UInt8]) throws {
        guard line.count <= 1 << 20 else { throw Invalid(description: "Memory request exceeds size limit") }
        let value: JSON
        do { value = try JSON.parse(line) } catch let error as JSON.ParseError { throw Invalid(description: error.message) }
        guard case .object(let fields) = value else { throw Invalid(description: "invalid type: expected struct Request") }
        var seen = Set<String>()
        for (key, _) in fields where ["id", "method", "params"].contains(key) {
            guard seen.insert(key).inserted else { throw Invalid(description: "duplicate field `\(key)`") }
        }
        guard let rawID = value["id"] else { throw Invalid(description: "missing field `id`") }
        switch rawID {
        case .int(let i) where i >= 0: id = UInt64(i)
        case .uint(let u): id = u
        default: throw Invalid(description: "invalid value for `id`, expected u64")
        }
        guard let method = value["method"] else { throw Invalid(description: "missing field `method`") }
        guard case .string(let name) = method, Self.methods.contains(name) else {
            throw Invalid(description: "unknown variant, expected one of `search`, `sync`, `close`, `status`, `embed`, `chunk`, `shutdown`")
        }
        guard let params = value["params"] else { throw Invalid(description: "missing field `params`") }
        guard case .object(let p) = params else { throw Invalid(description: "invalid type, expected struct variant Command") }
        var names = Set<String>()
        for (key, _) in p { guard names.insert(key).inserted else { throw Invalid(description: "duplicate field `\(key)`") } }
        let get = { (key: String) in p.first { $0.0 == key }?.1 }
        func string(_ key: String) throws -> String {
            guard let v = get(key) else { throw Invalid(description: "missing field `\(key)`") }
            guard case .string(let s) = v else { throw Invalid(description: "invalid type for `\(key)`, expected a string") }
            return s
        }
        switch name {
        case "status": command = .status(try string("directory"))
        case "close": command = .close(try string("directory"))
        case "shutdown": command = .shutdown
        case "embed": command = .embed(try string("text"))
        case "chunk": command = .chunk(path: try string("path"), text: try string("text"))
        case "sync":
            let directory = try string("directory")
            var rebuild = false
            if let v = get("rebuild") {
                guard case .bool(let b) = v else { throw Invalid(description: "invalid type for `rebuild`, expected a boolean") }
                rebuild = b
            }
            command = .sync(directory, rebuild: rebuild)
        default:   // search
            let directory = try string("directory"), query = try string("query")
            guard let k = get("topK") else { throw Invalid(description: "missing field `topK`") }
            guard case .int(let topK) = k, topK >= 0, topK <= Int(UInt32.max) else {
                throw Invalid(description: "invalid value for `topK`, expected u32")
            }
            var alpha: Double?
            switch get("alpha") {
            case nil, .null?: alpha = nil
            case .int(let i)?: alpha = Double(i)
            case .uint(let u)?: alpha = Double(u)
            case .double(let d)?: alpha = d
            default: throw Invalid(description: "invalid type for `alpha`, expected f64")
            }
            command = .search(directory, query: query, topK: topK, alpha: alpha)
        }
    }
}

import Foundation

typealias JSON = [String: Any]

/// The only writer of stdout in observer mode: one JSON object per line, from one serial queue.
enum Output {
    private static let queue = DispatchQueue(label: "dev.aux.computer-use.output")

    static func send(_ type: String, _ fields: JSON = [:]) {
        var line = fields
        line["type"] = type
        guard let data = encode(line) else { return }
        queue.async { writeLine(data) }
    }

    /// Writes one line to stdout with write(2). A closed pipe means the daemon is gone: exit quietly.
    static func writeLine(_ data: Data) {
        let line = data + Data([0x0A])
        line.withUnsafeBytes { buffer in
            var offset = 0
            while offset < buffer.count {
                let written = write(STDOUT_FILENO, buffer.baseAddress! + offset, buffer.count - offset)
                if written < 0 {
                    if errno == EINTR { continue }
                    exit(0)
                }
                offset += written
            }
        }
    }

    /// Waits for every queued line to reach stdout (before exit).
    static func flush() { queue.sync {} }

    static func encode(_ object: Any) -> Data? {
        guard JSONSerialization.isValidJSONObject(object) else { return nil }
        return try? JSONSerialization.data(withJSONObject: object, options: [.withoutEscapingSlashes])
    }

    static func log(_ message: String) {
        FileHandle.standardError.write(Data("aux-computer-use: \(message)\n".utf8))
    }
}

func nowMs() -> Double { (Date().timeIntervalSince1970 * 1000).rounded() }

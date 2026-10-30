import Foundation

/// JSON with ordered objects, written exactly like serde_json's compact form (ryu floats,
/// minimal escapes) so the files and replies match the reference byte for byte.
indirect enum JSON: Equatable {
    case null
    case bool(Bool)
    case int(Int)
    case uint(UInt64)
    case double(Double)
    case string(String)
    case array([JSON])
    case object([(String, JSON)])

    static func == (a: JSON, b: JSON) -> Bool {
        switch (a, b) {
        case (.null, .null): true
        case let (.bool(x), .bool(y)): x == y
        case let (.int(x), .int(y)): x == y
        case let (.uint(x), .uint(y)): x == y
        case let (.double(x), .double(y)): x == y
        case let (.string(x), .string(y)): x == y
        case let (.array(x), .array(y)): x == y
        case let (.object(x), .object(y)): x.count == y.count && zip(x, y).allSatisfy { $0.0 == $1.0 && $0.1 == $1.1 }
        default: false
        }
    }

    /// An object with keys in sorted (byte) order, as serde_json's BTreeMap-backed maps write them.
    static func object(_ fields: [String: JSON]) -> JSON {
        .object(fields.sorted { Array($0.key.utf8).lexicographicallyPrecedes(Array($1.key.utf8)) })
    }

    subscript(key: String) -> JSON? {
        guard case .object(let fields) = self else { return nil }
        return fields.first { $0.0 == key }?.1
    }

    var string: String? { if case .string(let s) = self { s } else { nil } }
    var int: Int? { if case .int(let i) = self { i } else { nil } }
    var bool: Bool? { if case .bool(let b) = self { b } else { nil } }
    var array: [JSON]? { if case .array(let a) = self { a } else { nil } }
    var number: Double? {
        switch self {
        case .int(let i): Double(i)
        case .double(let d): d
        default: nil
        }
    }

    // MARK: Writing

    var serialized: String {
        var out = ""
        write(into: &out)
        return out
    }

    func write(into out: inout String) {
        switch self {
        case .null: out += "null"
        case .bool(let b): out += b ? "true" : "false"
        case .int(let i): out += String(i)
        case .uint(let u): out += String(u)
        case .double(let d): out += d.isFinite ? Self.ryu(d) : "null"
        case .string(let s): Self.quote(s, into: &out)
        case .array(let items):
            out += "["
            for (i, item) in items.enumerated() {
                if i > 0 { out += "," }
                item.write(into: &out)
            }
            out += "]"
        case .object(let fields):
            out += "{"
            for (i, (key, value)) in fields.enumerated() {
                if i > 0 { out += "," }
                Self.quote(key, into: &out)
                out += ":"
                value.write(into: &out)
            }
            out += "}"
        }
    }

    static func quote(_ s: String, into out: inout String) {
        out += "\""
        for scalar in s.unicodeScalars {
            switch scalar {
            case "\"": out += "\\\""
            case "\\": out += "\\\\"
            case "\u{08}": out += "\\b"
            case "\u{0C}": out += "\\f"
            case "\n": out += "\\n"
            case "\r": out += "\\r"
            case "\t": out += "\\t"
            case let c where c.value < 0x20: out += String(format: "\\u%04x", c.value)
            default: out.unicodeScalars.append(scalar)
            }
        }
        out += "\""
    }

    /// The ryu crate's `format64`: shortest round-trip digits, laid out as serde_json prints them.
    static func ryu(_ value: Double) -> String {
        if value == 0 { return value.sign == .minus ? "-0.0" : "0.0" }
        let (digits, exponent) = shortestDigits(abs(value))
        let length = digits.count
        let point = length + exponent   // position of the decimal point
        var out = value < 0 ? "-" : ""
        if exponent >= 0 && point <= 16 {
            out += digits + String(repeating: "0", count: exponent) + ".0"
        } else if point > 0 && point <= 16 {
            out += digits.prefix(point) + "." + digits.dropFirst(point)
        } else if point > -5 && point <= 0 {
            out += "0." + String(repeating: "0", count: -point) + digits
        } else if length == 1 {
            out += digits + "e" + String(point - 1)
        } else {
            out += digits.prefix(1) + "." + digits.dropFirst() + "e" + String(point - 1)
        }
        return out
    }

    /// (decimal digits without leading or trailing zeros, exponent) with value = digits × 10^exponent.
    static func shortestDigits(_ value: Double) -> (String, Int) {
        let text = "\(value)"   // Swift prints the shortest round-trip representation
        var mantissa = text, exponent = 0
        if let e = text.firstIndex(where: { $0 == "e" || $0 == "E" }) {
            mantissa = String(text[..<e])
            exponent = Int(text[text.index(after: e)...].replacingOccurrences(of: "+", with: ""))!
        }
        var digits = mantissa
        if let dot = mantissa.firstIndex(of: ".") {
            let fraction = mantissa[mantissa.index(after: dot)...]
            digits = String(mantissa[..<dot]) + fraction
            exponent -= fraction.count
        }
        let trimmedLeading = digits.drop { $0 == "0" }
        var result = String(trimmedLeading)
        while result.hasSuffix("0") { result.removeLast(); exponent += 1 }
        return (result, exponent)
    }

    // MARK: Parsing

    struct ParseError: Error { let message: String }

    static func parse(_ data: [UInt8]) throws -> JSON {
        var parser = Parser(bytes: data)
        parser.skipWhitespace()
        let value = try parser.value(depth: 0)
        parser.skipWhitespace()
        guard parser.index == data.count else { throw ParseError(message: "trailing characters") }
        return value
    }

    private struct Parser {
        let bytes: [UInt8]
        var index = 0

        mutating func skipWhitespace() {
            while index < bytes.count, [0x20, 0x09, 0x0A, 0x0D].contains(bytes[index]) { index += 1 }
        }

        mutating func value(depth: Int) throws -> JSON {
            guard depth < 128 else { throw ParseError(message: "recursion limit exceeded") }
            guard index < bytes.count else { throw ParseError(message: "EOF while parsing a value") }
            switch bytes[index] {
            case UInt8(ascii: "{"):
                index += 1
                var fields: [(String, JSON)] = []
                skipWhitespace()
                if peek(UInt8(ascii: "}")) { index += 1; return .object(fields) }
                while true {
                    skipWhitespace()
                    guard peek(UInt8(ascii: "\"")) else { throw ParseError(message: "key must be a string") }
                    let key = try string()
                    skipWhitespace()
                    guard peek(UInt8(ascii: ":")) else { throw ParseError(message: "expected `:`") }
                    index += 1
                    skipWhitespace()
                    fields.append((key, try value(depth: depth + 1)))
                    skipWhitespace()
                    if peek(UInt8(ascii: ",")) { index += 1; continue }
                    if peek(UInt8(ascii: "}")) { index += 1; return .object(fields) }
                    throw ParseError(message: "expected `,` or `}`")
                }
            case UInt8(ascii: "["):
                index += 1
                var items: [JSON] = []
                skipWhitespace()
                if peek(UInt8(ascii: "]")) { index += 1; return .array(items) }
                while true {
                    skipWhitespace()
                    items.append(try value(depth: depth + 1))
                    skipWhitespace()
                    if peek(UInt8(ascii: ",")) { index += 1; continue }
                    if peek(UInt8(ascii: "]")) { index += 1; return .array(items) }
                    throw ParseError(message: "expected `,` or `]`")
                }
            case UInt8(ascii: "\""): return .string(try string())
            case UInt8(ascii: "t"): try literal("true"); return .bool(true)
            case UInt8(ascii: "f"): try literal("false"); return .bool(false)
            case UInt8(ascii: "n"): try literal("null"); return .null
            default: return try number()
            }
        }

        func peek(_ c: UInt8) -> Bool { index < bytes.count && bytes[index] == c }

        mutating func literal(_ word: String) throws {
            let w = Array(word.utf8)
            guard index + w.count <= bytes.count, Array(bytes[index..<(index + w.count)]) == w else {
                throw ParseError(message: "expected value")
            }
            index += w.count
        }

        mutating func number() throws -> JSON {
            let start = index
            if peek(UInt8(ascii: "-")) { index += 1 }
            guard index < bytes.count, (48...57).contains(bytes[index]) else { throw ParseError(message: "expected value") }
            if bytes[index] == 48 { index += 1 } else { while index < bytes.count, (48...57).contains(bytes[index]) { index += 1 } }
            var integer = true
            if peek(UInt8(ascii: ".")) {
                integer = false; index += 1
                guard index < bytes.count, (48...57).contains(bytes[index]) else { throw ParseError(message: "invalid number") }
                while index < bytes.count, (48...57).contains(bytes[index]) { index += 1 }
            }
            if peek(UInt8(ascii: "e")) || peek(UInt8(ascii: "E")) {
                integer = false; index += 1
                if peek(UInt8(ascii: "+")) || peek(UInt8(ascii: "-")) { index += 1 }
                guard index < bytes.count, (48...57).contains(bytes[index]) else { throw ParseError(message: "invalid number") }
                while index < bytes.count, (48...57).contains(bytes[index]) { index += 1 }
            }
            let text = String(decoding: bytes[start..<index], as: UTF8.self)
            if integer, let i = Int(text) { return .int(i) }
            if integer, let u = UInt64(text) { return .uint(u) }
            guard let d = Double(text), d.isFinite else { throw ParseError(message: "number out of range") }
            return .double(d)
        }

        mutating func string() throws -> String {
            index += 1
            var out = [UInt8]()
            while true {
                guard index < bytes.count else { throw ParseError(message: "EOF while parsing a string") }
                let c = bytes[index]
                index += 1
                switch c {
                case UInt8(ascii: "\""):
                    guard let s = String(validating: out, as: UTF8.self) else { throw ParseError(message: "invalid unicode code point") }
                    return s
                case UInt8(ascii: "\\"):
                    guard index < bytes.count else { throw ParseError(message: "EOF while parsing a string") }
                    let e = bytes[index]
                    index += 1
                    switch e {
                    case UInt8(ascii: "\""): out.append(0x22)
                    case UInt8(ascii: "\\"): out.append(0x5C)
                    case UInt8(ascii: "/"): out.append(0x2F)
                    case UInt8(ascii: "b"): out.append(0x08)
                    case UInt8(ascii: "f"): out.append(0x0C)
                    case UInt8(ascii: "n"): out.append(0x0A)
                    case UInt8(ascii: "r"): out.append(0x0D)
                    case UInt8(ascii: "t"): out.append(0x09)
                    case UInt8(ascii: "u"):
                        var scalar = try hex4()
                        if (0xD800...0xDBFF).contains(scalar) {
                            guard peek(UInt8(ascii: "\\")), index + 1 < bytes.count, bytes[index + 1] == UInt8(ascii: "u") else {
                                throw ParseError(message: "lone leading surrogate in hex escape")
                            }
                            index += 2
                            let low = try hex4()
                            guard (0xDC00...0xDFFF).contains(low) else { throw ParseError(message: "lone leading surrogate in hex escape") }
                            scalar = 0x10000 + ((scalar - 0xD800) << 10) + (low - 0xDC00)
                        } else if (0xDC00...0xDFFF).contains(scalar) {
                            throw ParseError(message: "lone trailing surrogate in hex escape")
                        }
                        out += Array(String(Unicode.Scalar(scalar)!).utf8)
                    default: throw ParseError(message: "invalid escape")
                    }
                case 0..<0x20: throw ParseError(message: "control character (\\u0000-\\u001F) found while parsing a string")
                default: out.append(c)
                }
            }
        }

        mutating func hex4() throws -> UInt32 {
            guard index + 4 <= bytes.count, let v = UInt32(String(decoding: bytes[index..<(index + 4)], as: UTF8.self), radix: 16) else {
                throw ParseError(message: "invalid escape")
            }
            index += 4
            return v
        }
    }
}

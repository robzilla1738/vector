import Foundation

/// A chunk of a memory source file. Offsets, lengths and line numbers count UTF-16 code units, as
/// the reference chunker does (it was written against JavaScript strings).
struct Chunk {
    var id: String
    var path: String
    var title: String
    var headings: [String]
    var charOffset: Int
    var lineStart: Int
    var lineEnd: Int
    var hash: String
    var windowFrom: String?
    var windowTo: String?
    var text: String

    /// The source record: every field but `text`, keys sorted.
    func source(includingText: Bool = false) -> JSON {
        var object: [String: JSON] = [
            "charOffset": .int(charOffset), "hash": .string(hash), "headings": .array(headings.map(JSON.string)),
            "id": .string(id), "lineEnd": .int(lineEnd), "lineStart": .int(lineStart), "path": .string(path),
            "title": .string(title),
        ]
        if let windowFrom { object["windowFrom"] = .string(windowFrom) }
        if let windowTo { object["windowTo"] = .string(windowTo) }
        if includingText { object["text"] = .string(text) }
        return .object(object)
    }
}

enum Chunker {
    static let size = 1024           // 256 tokens × 4 characters
    static let overlap = 152
    static let window = 256
    static let contextAwarenessMax = 1433   // floor(size × 1.4)

    static func chunk(path: String, text: String) -> [Chunk] {
        if let date = contextAwarenessDate(path) { return contextAwareness(path: path, text: Array(text.utf16), date: date) }
        return markdown(path: path, text: Array(text.utf16))
    }

    // MARK: Markdown

    static func markdown(path: String, text u: [UInt16]) -> [Chunk] {
        let headings = extractHeadings(u)
        var stem = path.hasSuffix(".md") ? String(path.dropLast(3)) : path
        if let slash = stem.lastIndex(of: "/") { stem = String(stem[stem.index(after: slash)...]) }
        return split(u).enumerated().map { index, range in
            let stack = headingStack(headings, at: range.lowerBound)
            let piece = Array(u[range])
            let text = lossy(piece)
            let hash = sha256Hex(text)
            let line = lineNumber(u, at: range.lowerBound)
            var newlines = piece.reduce(0) { $0 + ($1 == nl ? 1 : 0) }
            if piece.last == nl { newlines -= 1 }
            return Chunk(id: sha256Hex("\(path):\(index):\(hash)"), path: path, title: stack.last ?? stem,
                         headings: stack, charOffset: range.lowerBound, lineStart: line, lineEnd: line + newlines,
                         hash: hash, text: text)
        }
    }

    struct Break { let position: Int; let score: Double }

    /// splitMarkdownIntoChunks: windows of `size` cut at the best-scoring break near the end,
    /// moved to a line boundary, with `overlap` carried into the next window.
    static func split(_ u: [UInt16], size: Int = size, overlap: Int = overlap, window: Int = window) -> [Range<Int>] {
        let n = u.count
        if n <= size { return [0..<n] }
        let breaks = breakPoints(u), fences = codeFences(u)
        var chunks: [Range<Int>] = []
        var start = 0
        while start < n {
            let limit = boundary(u, min(start + size, n))
            var cut = limit
            if cut < n {
                let best = bestCutoff(breaks, limit, window, fences)
                if best > start && best <= limit { cut = best }
                cut = lineBoundaryEnd(u, start, cut)
            }
            if cut <= start { cut = boundary(u, min(start + size, n)) }
            chunks.append(start..<cut)
            if cut >= n { break }
            let back = max(0, cut - overlap)
            let previous = chunks[chunks.count - 1].lowerBound
            start = lineStart(u, back)
            if start <= previous {
                start = lineEnd(u, back)
                if start >= cut { start = cut - overlap }
            }
            if start <= previous { start = cut }
            start = boundary(u, start)
        }
        return chunks
    }

    /// A position moved back off the middle of a surrogate pair, as the reference slices.
    static func boundary(_ u: [UInt16], _ i: Int) -> Int {
        i > 0 && i < u.count && (0xDC00...0xDFFF).contains(u[i]) && (0xD800...0xDBFF).contains(u[i - 1]) ? i - 1 : i
    }

    /// BREAK_PATTERNS, each scanned like JavaScript's matchAll; the highest score wins a position.
    static func breakPoints(_ u: [UInt16]) -> [Break] {
        var best: [Int: Double] = [:]
        func add(_ position: Int, _ score: Double) {
            if let current = best[position], current >= score { return }
            best[position] = score
        }
        let n = u.count
        func at(_ i: Int) -> UInt16? { i < n ? u[i] : nil }
        // \n#{k}(?!#), k = 1…6
        for i in 0..<n where u[i] == nl {
            var j = i + 1
            while j < n, u[j] == hash { j += 1 }
            let k = j - i - 1
            if (1...6).contains(k) { add(i, Double(110 - 10 * k)) }
        }
        // \n``` (80), consumed four at a time
        var i = 0
        while i < n {
            if isFence(u, i) { add(i, 80); i += 4 } else { i += 1 }
        }
        // \n(?:---|\*\*\*|___)\s*\n (60)
        i = 0
        while i < n {
            if u[i] == nl, i + 3 < n, let m = at(i + 1), [dash, star, underscore].contains(m), u[i + 2] == m, u[i + 3] == m {
                var j = i + 4, lastNewline = -1
                while j < n, isWhitespace(u[j]) { if u[j] == nl { lastNewline = j }; j += 1 }
                if lastNewline >= 0 { add(i, 60); i = lastNewline + 1; continue }
            }
            i += 1
        }
        // \n\n+ (20)
        i = 0
        while i < n {
            if u[i] == nl, at(i + 1) == nl {
                add(i, 20)
                var j = i + 1
                while j < n, u[j] == nl { j += 1 }
                i = j
            } else { i += 1 }
        }
        // \n[-*]\s (5)
        i = 0
        while i < n {
            if u[i] == nl, let m = at(i + 1), m == dash || m == star, let w = at(i + 2), isWhitespace(w) { add(i, 5); i += 3 } else { i += 1 }
        }
        // \n\d+\.\s (5)
        i = 0
        while i < n {
            if u[i] == nl, let d = at(i + 1), isDigit(d) {
                var j = i + 2
                while j < n, isDigit(u[j]) { j += 1 }
                if at(j) == dot, let w = at(j + 1), isWhitespace(w) { add(i, 5); i = j + 2; continue }
            }
            i += 1
        }
        // \n (1)
        for i in 0..<n where u[i] == nl { add(i, 1) }
        return best.map { Break(position: $0.key, score: $0.value) }.sorted { $0.position < $1.position }
    }

    static func codeFences(_ u: [UInt16]) -> [Range<Int>] {
        var fences: [Range<Int>] = [], open = false, start = 0, i = 0
        while i < u.count {
            guard isFence(u, i) else { i += 1; continue }
            if open { fences.append(start..<(i + 4)); open = false } else { start = i; open = true }
            i += 4
        }
        if open { fences.append(start..<u.count) }
        return fences
    }

    static func bestCutoff(_ breaks: [Break], _ target: Int, _ window: Int, _ fences: [Range<Int>]) -> Int {
        let from = target - window
        var bestScore = -1.0, best = target
        for b in breaks {
            if b.position < from { continue }
            if b.position > target { break }
            if fences.contains(where: { b.position > $0.lowerBound && b.position < $0.upperBound }) { continue }
            let distance = Double(target - b.position) / Double(window)
            let score = b.score * (1 - distance * distance * 0.7)
            if score > bestScore { bestScore = score; best = b.position }
        }
        return best
    }

    static func lineStart(_ u: [UInt16], _ i: Int) -> Int {
        if i <= 0 { return 0 }
        var j = min(i, u.count) - 1
        while j >= 0, u[j] != nl { j -= 1 }
        return j + 1
    }

    static func lineEnd(_ u: [UInt16], _ i: Int) -> Int {
        if i >= u.count { return u.count }
        var j = i
        while j < u.count, u[j] != nl { j += 1 }
        return j < u.count ? j + 1 : u.count
    }

    static func lineBoundaryEnd(_ u: [UInt16], _ start: Int, _ cut: Int) -> Int {
        if cut >= u.count { return u.count }
        if u[cut] == nl { return cut + 1 }
        let line = lineStart(u, cut)
        return line > start ? line : cut
    }

    // MARK: Headings

    struct Heading { let level: Int; let text: String; let position: Int }

    static func extractHeadings(_ u: [UInt16]) -> [Heading] {
        var headings: [Heading] = []
        let front = frontMatterLength(u)
        if let h = heading(u, at: front) { headings.append(Heading(level: h.level, text: h.text, position: 0)) }
        var i = 0
        while i < u.count {
            guard u[i] == nl, let h = heading(u, at: i + 1) else { i += 1; continue }
            if i >= front { headings.append(Heading(level: h.level, text: h.text, position: i)) }
            i = h.end
        }
        return headings.enumerated().sorted { ($0.element.position, $0.offset) < ($1.element.position, $1.offset) }.map(\.element)
    }

    /// `(#{1,6})\s+(.+)` anchored at `i`, with JavaScript backtracking; the text is trimmed.
    static func heading(_ u: [UInt16], at i: Int) -> (level: Int, text: String, end: Int)? {
        let n = u.count
        var j = i
        while j < n, u[j] == hash { j += 1 }
        let level = j - i
        guard (1...6).contains(level), j < n, isWhitespace(u[j]) else { return nil }
        var e = j
        while e < n, isWhitespace(u[e]) { e += 1 }
        var start = e
        if e == n {
            // \s+ ran to the end: give characters back until `.` can match one.
            start = -1
            var s = n - 1
            while s > j { if !isLineTerminator(u[s]) { start = s; break }; s -= 1 }
            guard start >= 0 else { return nil }
        }
        var end = start
        while end < n, !isLineTerminator(u[end]) { end += 1 }
        return (level, trim(Array(u[start..<end])), end)
    }

    /// `^---\n[\s\S]*?\n---\n+`
    static func frontMatterLength(_ u: [UInt16]) -> Int {
        guard u.count >= 4, u[0] == dash, u[1] == dash, u[2] == dash, u[3] == nl else { return 0 }
        var i = 4
        while i + 4 < u.count {
            if u[i] == nl, u[i + 1] == dash, u[i + 2] == dash, u[i + 3] == dash, u[i + 4] == nl {
                var end = i + 5
                while end < u.count, u[end] == nl { end += 1 }
                return end
            }
            i += 1
        }
        return 0
    }

    static func headingStack(_ headings: [Heading], at position: Int) -> [String] {
        var stack: [String?] = []
        for h in headings {
            if h.position > position { break }
            if stack.count > h.level - 1 { stack.removeSubrange((h.level - 1)...) }
            while stack.count < h.level - 1 { stack.append(nil) }
            stack.append(h.text)
        }
        return stack.compactMap { $0 }.filter { !$0.isEmpty }
    }

    static func lineNumber(_ u: [UInt16], at position: Int) -> Int {
        var line = 1
        for i in 0..<min(position, u.count) where u[i] == nl { line += 1 }
        return line
    }

    // MARK: Context awareness day pages

    static func contextAwarenessDate(_ path: String) -> String? {
        let prefix = "episodic/context-awareness-", u = Array(path.utf8)
        guard path.hasPrefix(prefix), path.hasSuffix(".md"), u.count == prefix.utf8.count + 13 else { return nil }
        let date = Array(u[prefix.utf8.count..<(prefix.utf8.count + 10)])
        for (k, c) in date.enumerated() {
            if k == 4 || k == 7 { if c != UInt8(ascii: "-") { return nil } } else if !(48...57).contains(c) { return nil }
        }
        return String(decoding: date, as: UTF8.self)
    }

    private struct Window {
        var header: String, title: String, lineStart: Int, lineEnd: Int, charOffset: Int
        var body: [[UInt16]] = []
        var windowFrom: String? = nil, windowTo: String? = nil
    }

    static func contextAwareness(path: String, text u: [UInt16], date: String) -> [Chunk] {
        let lines = u.split(separator: nl, omittingEmptySubsequences: false).map(Array.init)
        var windows: [Window] = []
        var current: Int? = nil
        var pageTitle = path
        var offset = 0
        for (index, line) in lines.enumerated() {
            if let (range, label) = windowHeading(line) {
                let parts = range.split(separator: "–", omittingEmptySubsequences: false).map(String.init)
                windows.append(Window(header: "[\(date) \(range) · \(stripSessionMarker(label))]", title: "\(range) — \(label)",
                                      lineStart: index + 1, lineEnd: index + 1, charOffset: offset,
                                      windowFrom: "\(date)T\(parts.count > 0 ? parts[0] : "")",
                                      windowTo: "\(date)T\(parts.count > 1 ? parts[1] : "")"))
                current = windows.count - 1
            } else if isDayOverview(line) {
                windows.append(Window(header: "[\(date) · day overview]", title: "Day overview", lineStart: index + 1,
                                      lineEnd: index + 1, charOffset: offset))
                current = windows.count - 1
            } else if starts(line, "# ") || starts(line, "## ") || starts(line, "Threads this day: ") {
                if starts(line, "# ") { pageTitle = trim(Array(line.dropFirst(2))) }
                current = nil
            } else if let c = current {
                windows[c].body.append(line)
                if !trim(line).isEmpty { windows[c].lineEnd = index + 1 }
            }
            offset += line.count + 1
        }
        if windows.isEmpty { return markdown(path: path, text: u) }
        var chunks: [Chunk] = []
        for window in windows {
            let body = cleanBody(window.body)
            if body.isEmpty { continue }
            let pieces: [[UInt16]] = window.header.utf16.count + body.count > contextAwarenessMax
                ? split(body).map { Array(trimUnits(Array(body[$0]))) } : [body]
            for (index, piece) in pieces.enumerated() where !piece.isEmpty {
                let text = window.header + "\n" + lossy(piece)
                let hash = sha256Hex(text)
                chunks.append(Chunk(id: sha256Hex("\(path):\(window.title):\(index):\(hash):ca2"), path: path, title: window.title,
                                    headings: [pageTitle, window.title], charOffset: window.charOffset,
                                    lineStart: window.lineStart, lineEnd: window.lineEnd, hash: hash,
                                    windowFrom: window.windowFrom, windowTo: window.windowTo, text: text))
            }
        }
        return chunks
    }

    /// `^### (\d{2}:\d{2}–\d{2}:\d{2}) — (.*)$` on one line.
    static func windowHeading(_ line: [UInt16]) -> (String, String)? {
        let prefix = Array("### ".utf16)
        guard line.count >= 4 + 11 + 3, Array(line[0..<4]) == prefix else { return nil }
        let r = Array(line[4..<15])
        let digits = [0, 1, 3, 4, 6, 7, 9, 10]
        guard digits.allSatisfy({ isDigit(r[$0]) }), r[2] == colon, r[8] == colon, r[5] == 0x2013 else { return nil }
        guard Array(line[15..<18]) == Array(" — ".utf16) else { return nil }
        let label = Array(line[18...])
        guard !label.contains(where: isLineTerminator) else { return nil }
        return (lossy(r), lossy(label))
    }

    /// ` ⟨s:[^⟩]+⟩$` removed (first match).
    static func stripSessionMarker(_ label: String) -> String {
        let u = Array(label.utf16)
        let marker: [UInt16] = [space, 0x27E8, UInt16(UInt8(ascii: "s")), colon]
        guard u.count >= 6, u.last == 0x27E9 else { return label }
        for i in 0...(u.count - 6) where Array(u[i..<(i + 4)]) == marker {
            let inner = u[(i + 4)..<(u.count - 1)]
            if !inner.isEmpty, !inner.contains(0x27E9) { return lossy(Array(u[0..<i])) }
        }
        return label
    }

    static func isDayOverview(_ line: [UInt16]) -> Bool {
        let p = Array("## Day overview".utf16)
        return line.count >= p.count && Array(line[0..<p.count]) == p && line[p.count...].allSatisfy(isWhitespace)
    }

    static func cleanBody(_ lines: [[UInt16]]) -> [UInt16] {
        var kept: [[UInt16]] = [], skipping = false
        for line in lines {
            if starts(line, "Sources: ") { continue }
            if isRelevantPriorContext(line) { skipping = true; continue }
            if skipping {
                if isBoldLine(line) { skipping = false } else { continue }
            }
            kept.append(line)
        }
        var joined: [UInt16] = []
        for (i, line) in kept.enumerated() {
            if i > 0 { joined.append(nl) }
            joined += line
        }
        // \n{3,} → \n\n
        var collapsed: [UInt16] = [], run = 0
        for c in joined {
            if c == nl { run += 1; if run <= 2 { collapsed.append(c) } } else { run = 0; collapsed.append(c) }
        }
        return Array(trimUnits(collapsed))
    }

    static func isRelevantPriorContext(_ line: [UInt16]) -> Bool {
        let p = Array("**Relevant prior context**".utf16)
        return line.count >= p.count && Array(line[0..<p.count]) == p && line[p.count...].allSatisfy(isWhitespace)
    }

    /// `^\*\*[^*].*\*\*\s*$`
    static func isBoldLine(_ line: [UInt16]) -> Bool {
        var e = line.count
        while e > 0, isWhitespace(line[e - 1]) { e -= 1 }
        guard e >= 5, line[0] == star, line[1] == star, line[2] != star, line[e - 1] == star, line[e - 2] == star else { return false }
        return !line[3..<(e - 2)].contains(where: isLineTerminator)
    }

    // MARK: Characters (JavaScript definitions)

    static let nl = UInt16(UInt8(ascii: "\n")), hash = UInt16(UInt8(ascii: "#")), dash = UInt16(UInt8(ascii: "-")), star = UInt16(UInt8(ascii: "*"))
    static let underscore = UInt16(UInt8(ascii: "_")), dot = UInt16(UInt8(ascii: ".")), colon = UInt16(UInt8(ascii: ":")), space = UInt16(UInt8(ascii: " "))

    static func isFence(_ u: [UInt16], _ i: Int) -> Bool {
        i + 3 < u.count && u[i] == nl && u[i + 1] == 0x60 && u[i + 2] == 0x60 && u[i + 3] == 0x60
    }

    static func isDigit(_ c: UInt16) -> Bool { c >= 48 && c <= 57 }

    static func isLineTerminator(_ c: UInt16) -> Bool { c == 0x0A || c == 0x0D || c == 0x2028 || c == 0x2029 }

    /// JavaScript `\s` and `String.prototype.trim`.
    static func isWhitespace(_ c: UInt16) -> Bool {
        switch c {
        case 0x09...0x0D, 0x20, 0xA0, 0x1680, 0x2000...0x200A, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF: true
        default: false
        }
    }

    static func trimUnits(_ u: [UInt16]) -> ArraySlice<UInt16> {
        var s = 0, e = u.count
        while s < e, isWhitespace(u[s]) { s += 1 }
        while e > s, isWhitespace(u[e - 1]) { e -= 1 }
        return u[s..<e]
    }

    static func trim(_ u: [UInt16]) -> String { lossy(Array(trimUnits(u))) }

    static func starts(_ line: [UInt16], _ prefix: String) -> Bool {
        let p = Array(prefix.utf16)
        return line.count >= p.count && Array(line[0..<p.count]) == p
    }

    /// UTF-16 to a string, with each unpaired surrogate replaced by U+FFFD.
    static func lossy(_ u: [UInt16]) -> String {
        var scalars = String.UnicodeScalarView()
        var it = u.makeIterator()
        var decoder = UTF16()
        loop: while true {
            switch decoder.decode(&it) {
            case .scalarValue(let s): scalars.append(s)
            case .error: scalars.append("\u{FFFD}")
            case .emptyInput: break loop
            }
        }
        return String(scalars)
    }
}

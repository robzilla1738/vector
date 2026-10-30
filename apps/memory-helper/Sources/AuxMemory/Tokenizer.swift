import Foundation

/// Gemma-vocabulary BPE over the model's compact tokenizer (spec 3): added tokens are split out of
/// the raw text first (longest match), then each run goes through Metaspace and rank-ordered BPE
/// with byte fallback. Matched bitwise against the supplied helper through `embed`.
final class Tokenizer {
    struct Added { let content: [Unicode.Scalar]; let id: Int32; let lstrip: Bool }

    let bos: Int32, eos: Int32
    private let chars: [UInt32: Int32]
    private let bytes: [Int32?]
    private let added: [Added]
    private let addedFirst: [UInt32: [Int]]   // first scalar → added indices, longest first
    private let merges: MappedFile             // (left, right, rank, merged) u32 LE, sorted by (left, right)
    private let mergeCount: Int

    init(directory: URL) throws {
        let json = try JSONSerialization.jsonObject(with: Data(contentsOf: directory.appendingPathComponent("tokenizer-compact.json")))
        guard let root = json as? [String: Any], let bos = root["bos"] as? Int, let eos = root["eos"] as? Int,
              let addedList = root["added"] as? [[String: Any]], let byteList = root["bytes"] as? [Any],
              let charList = root["chars"] as? [[Int]], byteList.count == 256
        else { throw HelperError("Invalid local model tokenizer") }
        self.bos = Int32(bos); self.eos = Int32(eos)
        var chars = [UInt32: Int32](minimumCapacity: charList.count)
        for pair in charList where pair.count == 2 { chars[UInt32(pair[0])] = Int32(pair[1]) }
        self.chars = chars
        bytes = byteList.map { ($0 as? Int).map(Int32.init) }
        let added = try addedList.map {
            guard let content = $0["content"] as? String, let id = $0["id"] as? Int else { throw HelperError("Invalid local model tokenizer") }
            return Added(content: Array(content.unicodeScalars), id: Int32(id), lstrip: $0["lstrip"] as? Bool ?? false)
        }
        self.added = added
        var first = [UInt32: [Int]]()
        for (index, token) in added.enumerated() where !token.content.isEmpty {
            first[token.content[0].value, default: []].append(index)
        }
        addedFirst = first.mapValues { $0.sorted { added[$0].content.count > added[$1].content.count } }
        merges = try MappedFile(directory.appendingPathComponent("tokenizer-merges.u32"))
        guard merges.count % 16 == 0 else { throw HelperError("Invalid local model tokenizer") }
        mergeCount = merges.count / 16
    }

    /// BOS + tokens + EOS, truncated to `limit` with EOS kept last.
    func encode(_ text: String, limit: Int) throws -> [Int32] {
        var ids: [Int32] = [bos]
        try tokens(text, into: &ids)
        if ids.count > limit - 1 { ids.removeLast(ids.count - (limit - 1)) }
        ids.append(eos)
        return ids
    }

    func tokens(_ text: String, into ids: inout [Int32]) throws {
        let scalars = Array(text.unicodeScalars)
        var start = 0, index = 0
        while index < scalars.count {
            guard let match = matchAdded(scalars, at: index) else { index += 1; continue }
            var end = index
            if added[match].lstrip { while end > start, isWhitespace(scalars[end - 1]) { end -= 1 } }
            try segment(scalars[start..<end], into: &ids)
            ids.append(added[match].id)
            index += added[match].content.count
            start = index
        }
        try segment(scalars[start..<scalars.count], into: &ids)
    }

    /// Metaspace, prepend always, split: spaces become "▁", a leading "▁" is added, and each
    /// "▁"-led word is merged on its own.
    private func segment(_ raw: ArraySlice<Unicode.Scalar>, into ids: inout [Int32]) throws {
        guard !raw.isEmpty else { return }
        var text = raw.map { $0 == " " ? Self.space : $0 }
        if text[0] != Self.space { text.insert(Self.space, at: 0) }
        var wordStart = 0
        for i in 1..<text.count where text[i] == Self.space {
            try bpe(text[wordStart..<i], into: &ids)
            wordStart = i
        }
        try bpe(text[wordStart..<text.count], into: &ids)
    }

    private static let space: Unicode.Scalar = "\u{2581}"

    private func isWhitespace(_ s: Unicode.Scalar) -> Bool { s.properties.isWhitespace || s == "\u{2581}" }

    private func matchAdded(_ s: [Unicode.Scalar], at i: Int) -> Int? {
        guard let candidates = addedFirst[s[i].value] else { return nil }
        for c in candidates {
            let content = added[c].content
            if i + content.count <= s.count, s[i..<(i + content.count)].elementsEqual(content) { return c }
        }
        return nil
    }

    private func merge(_ left: Int32, _ right: Int32) -> (rank: UInt32, merged: Int32)? {
        var lo = 0, hi = mergeCount
        let key = (UInt64(UInt32(bitPattern: left)) << 32) | UInt64(UInt32(bitPattern: right))
        while lo < hi {
            let mid = (lo + hi) / 2
            let l = merges.u32(at: mid * 16), r = merges.u32(at: mid * 16 + 4)
            let k = (UInt64(l) << 32) | UInt64(r)
            if k == key { return (merges.u32(at: mid * 16 + 8), Int32(bitPattern: merges.u32(at: mid * 16 + 12))) }
            if k < key { lo = mid + 1 } else { hi = mid }
        }
        return nil
    }

    /// Lowest rank first, leftmost on ties, as in the reference BPE.
    private func bpe(_ run: ArraySlice<Unicode.Scalar>, into ids: inout [Int32]) throws {
        guard !run.isEmpty else { return }
        var symbols: [Int32] = []
        symbols.reserveCapacity(run.count)
        for scalar in run {
            if let id = chars[scalar.value] { symbols.append(id); continue }
            for byte in String(scalar).utf8 {
                guard let id = bytes[Int(byte)] else { throw HelperError("Missing byte fallback token") }
                symbols.append(id)
            }
        }
        // Doubly linked list plus a heap of candidate pairs keyed by (rank, position).
        var next = Array(1...symbols.count), prev = Array(-1..<(symbols.count - 1))
        var alive = [Bool](repeating: true, count: symbols.count)
        var heap = Heap()
        func push(_ i: Int) {
            let j = next[i]
            guard j < symbols.count, let m = merge(symbols[i], symbols[j]) else { return }
            heap.push(.init(rank: m.rank, position: i, left: symbols[i], right: symbols[j], merged: m.merged))
        }
        for i in 0..<(symbols.count - 1) { push(i) }
        while let top = heap.pop() {
            let i = top.position
            guard alive[i], symbols[i] == top.left, next[i] < symbols.count else { continue }
            let j = next[i]
            guard alive[j], symbols[j] == top.right else { continue }
            symbols[i] = top.merged
            alive[j] = false
            next[i] = next[j]
            if next[j] < symbols.count { prev[next[j]] = i }
            if prev[i] >= 0 { push(prev[i]) }
            push(i)
        }
        for i in 0..<symbols.count where alive[i] { ids.append(symbols[i]) }
    }
}

private struct Heap {
    struct Item { let rank: UInt32; let position: Int; let left: Int32; let right: Int32; let merged: Int32 }
    private var items: [Item] = []
    private static func less(_ a: Item, _ b: Item) -> Bool { a.rank != b.rank ? a.rank < b.rank : a.position < b.position }
    mutating func push(_ item: Item) {
        items.append(item)
        var i = items.count - 1
        while i > 0 {
            let parent = (i - 1) / 2
            guard Self.less(items[i], items[parent]) else { break }
            items.swapAt(i, parent); i = parent
        }
    }
    mutating func pop() -> Item? {
        guard !items.isEmpty else { return nil }
        let top = items[0]
        let last = items.removeLast()
        if !items.isEmpty {
            items[0] = last
            var i = 0
            while true {
                let l = 2 * i + 1, r = l + 1
                var m = i
                if l < items.count, Self.less(items[l], items[m]) { m = l }
                if r < items.count, Self.less(items[r], items[m]) { m = r }
                if m == i { break }
                items.swapAt(i, m); i = m
            }
        }
        return top
    }
}

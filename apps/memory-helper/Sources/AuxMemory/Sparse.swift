import Foundation
import MachO

/// The lexical side of hybrid search, matching the reference's bm25 crate setup: deunicode
/// transliteration, lowercase, Unicode word bounds, NLTK English stopwords, the Snowball English
/// stemmer, then Okapi BM25 over the chunk texts. The index lives in memory only.
enum SparseText {
    /// deunicode's tables, copied from the supplied helper (scripts/memory-helper/extract-deunicode.py)
    /// and linked into this executable's `__TEXT,__deunicode` section.
    private static let table: (pointers: UnsafeRawPointer, count: Int, mapping: UnsafeRawPointer, mappingCount: Int)? = {
        var size: UInt = 0
        let header = UnsafeRawPointer(#dsohandle).assumingMemoryBound(to: mach_header_64.self)
        guard let base = getsectiondata(header, "__TEXT", "__deunicode", &size), size >= 4 else { return nil }
        let raw = UnsafeRawPointer(base)
        let count = Int(UInt32(littleEndian: raw.loadUnaligned(as: UInt32.self)))
        guard Int(size) >= 4 + 3 * count else { return nil }
        return (raw + 4, count, raw + 4 + 3 * count, Int(size) - 4 - 3 * count)
    }()

    static var available: Bool { table != nil }

    /// deunicode_with_tofu(text, "[?]")
    static func transliterate(_ text: String) -> [UInt8] {
        var out: [UInt8] = []
        out.reserveCapacity(text.utf8.count)
        for scalar in text.unicodeScalars {
            if scalar.isASCII { out.append(UInt8(scalar.value)); continue }
            guard let t = table, Int(scalar.value) < t.count else { out += Array("[?]".utf8); continue }
            let entry = t.pointers + 3 * Int(scalar.value)
            let b0 = entry.load(as: UInt8.self), b1 = entry.load(fromByteOffset: 1, as: UInt8.self)
            let length = Int(entry.load(fromByteOffset: 2, as: UInt8.self))
            if length == 255 { out += Array("[?]".utf8); continue }
            if length <= 2 {
                if length >= 1 { out.append(b0) }
                if length == 2 { out.append(b1) }
            } else {
                let offset = Int(b0) | Int(b1) << 8
                guard offset + length <= t.mappingCount else { out += Array("[?]".utf8); continue }
                out += UnsafeRawBufferPointer(start: t.mapping + offset, count: length)
            }
        }
        return out
    }

    static func tokens(_ text: String) -> [String] {
        var stems: [String: String] = [:]
        return tokens(text, stems: &stems)
    }

    /// `stems` memoizes the stemmer across the documents of one index build.
    static func tokens(_ text: String, stems: inout [String: String]) -> [String] {
        let ascii = transliterate(text).map { $0 >= 65 && $0 <= 90 ? $0 + 32 : $0 }
        return words(ascii).compactMap { word in
            if stopwords.contains(word) { return nil }
            if let stem = stems[word] { return stem }
            let stem = EnglishStemmer.stem(word)
            stems[word] = stem
            return stem
        }
    }

    // MARK: UAX #29 word bounds over ASCII (deunicode output is ASCII)

    private enum Class { case letter, numeric, extendNumLet, midLetter, midNum, midNumLet, singleQuote, cr, lf, newline, space, other }

    private static func classify(_ c: UInt8) -> Class {
        switch c {
        case 0x41...0x5A, 0x61...0x7A: .letter
        case 0x30...0x39: .numeric
        case 0x5F: .extendNumLet
        case 0x3A: .midLetter
        case 0x2C, 0x3B: .midNum
        case 0x2E: .midNumLet
        case 0x27: .singleQuote
        case 0x0D: .cr
        case 0x0A: .lf
        case 0x0B, 0x0C: .newline
        case 0x20: .space
        default: .other
        }
    }

    /// unicode_words: word-bound segments that contain an alphanumeric character.
    static func words(_ s: [UInt8]) -> [String] {
        guard !s.isEmpty else { return [] }
        let c = s.map(classify)
        func midLetterQ(_ x: Class) -> Bool { x == .midLetter || x == .midNumLet || x == .singleQuote }
        func midNumQ(_ x: Class) -> Bool { x == .midNum || x == .midNumLet || x == .singleQuote }
        func breaks(_ i: Int) -> Bool {   // boundary between i-1 and i
            let a = c[i - 1], b = c[i]
            if a == .cr && b == .lf { return false }
            if [.cr, .lf, .newline].contains(a) || [.cr, .lf, .newline].contains(b) { return true }
            if a == .space && b == .space { return false }
            if a == .letter && b == .letter { return false }
            if a == .letter && midLetterQ(b) && i + 1 < c.count && c[i + 1] == .letter { return false }
            if midLetterQ(a) && b == .letter && i >= 2 && c[i - 2] == .letter { return false }
            if a == .numeric && b == .numeric { return false }
            if a == .letter && b == .numeric { return false }
            if a == .numeric && b == .letter { return false }
            if midNumQ(a) && b == .numeric && i >= 2 && c[i - 2] == .numeric { return false }
            if a == .numeric && midNumQ(b) && i + 1 < c.count && c[i + 1] == .numeric { return false }
            if [.letter, .numeric, .extendNumLet].contains(a) && b == .extendNumLet { return false }
            if a == .extendNumLet && [.letter, .numeric].contains(b) { return false }
            return true
        }
        var out: [String] = [], start = 0
        func flush(_ end: Int) {
            let piece = s[start..<end]
            if piece.contains(where: { classify($0) == .letter || classify($0) == .numeric }) {
                out.append(String(decoding: piece, as: UTF8.self))
            }
        }
        for i in 1..<s.count where breaks(i) { flush(i); start = i }
        flush(s.count)
        return out
    }

    /// NLTK's English list as the stop-words crate ships it.
    static let stopwords: Set<String> = Set("""
    i me my myself we our ours ourselves you you're you've you'll you'd your yours yourself yourselves he him his \
    himself she she's her hers herself it it's its itself they them their theirs themselves what which who whom this \
    that that'll these those am is are was were be been being have has had having do does did doing a an the and but \
    if or because as until while of at by for with about against between into through during before after above below \
    to from up down in out on off over under again further then once here there when where why how all any both each \
    few more most other some such no nor not only own same so than too very s t can will just don don't should \
    should've now d ll m o re ve y ain aren aren't couldn couldn't didn didn't doesn doesn't hadn hadn't hasn hasn't \
    haven haven't isn isn't ma mightn mightn't mustn mustn't needn needn't shan shan't shouldn shouldn't wasn wasn't \
    weren weren't won won't wouldn wouldn't
    """.split(separator: " ").map(String.init))
}

/// Okapi BM25 as the bm25 crate computes it (f32 throughout): per-occurrence term weights from
/// `tf·(k1+1) / (tf + k1·(1 − b + b·|d|/avgdl))`, and `ln(1 + (N − n + 0.5)/(n + 0.5))` IDF.
struct SparseIndex {
    static let k1: Float = 1.2, b: Float = 0.75

    private var postings: [String: [(doc: Int, weight: Float)]] = [:]
    private(set) var count = 0

    /// Documents without tokens are left out, so they count toward neither N nor avgdl.
    init(texts: [String]) {
        var stems: [String: String] = [:]
        let tokenized = texts.map { SparseText.tokens($0, stems: &stems) }
        let indexed = tokenized.filter { !$0.isEmpty }
        let total = indexed.reduce(0) { $0 + $1.count }
        let avgdl: Float = indexed.isEmpty ? 256 : Float(total) / Float(indexed.count)
        count = indexed.count
        for (doc, tokens) in tokenized.enumerated() where !tokens.isEmpty {
            var frequency: [String: Int] = [:]
            for t in tokens { frequency[t, default: 0] += 1 }
            let length = Float(tokens.count)
            for (term, tf) in frequency {
                let f = Float(tf)
                let weight = f * (Self.k1 + 1) / (f + Self.k1 * (1 - Self.b + Self.b * (length / avgdl)))
                postings[term, default: []].append((doc, weight))
            }
        }
    }

    /// Documents with a positive score, best first; ties keep document order.
    func search(_ query: String) -> [(doc: Int, score: Float)] {
        var scores: [Int: Float] = [:]
        let n = Float(count)
        for term in SparseText.tokens(query) {
            guard let list = postings[term] else { continue }
            let df = Float(list.count)
            let idf = (1 + (n - df + 0.5) / (df + 0.5)).log()
            for (doc, weight) in list { scores[doc, default: 0] += idf * weight }
        }
        return scores.filter { $0.value > 0 }.map { ($0.key, $0.value) }
            .sorted { $0.score != $1.score ? $0.score > $1.score : $0.doc < $1.doc }
    }
}

private extension Float {
    func log() -> Float { Foundation.log(self) }
}

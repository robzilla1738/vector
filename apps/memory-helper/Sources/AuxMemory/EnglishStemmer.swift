/// The Snowball English (Porter2) stemmer, as rust-stemmers 1.2 generates it. Tokens are ASCII
/// (they come out of deunicode), so the word is handled as bytes.
enum EnglishStemmer {
    static func stem(_ word: String) -> String {
        var w = Array(word.utf8)
        if let special = exception1(w) { return special }
        guard w.count >= 3 else { return word }
        var yFound = false
        // prelude
        if w.first == q { w.removeFirst() }
        if w.first == y { w[0] = Y; yFound = true }
        if w.count > 1 {
            for i in 1..<w.count where w[i] == y && isVowel(w[i - 1]) { w[i] = Y; yFound = true }
        }
        let (p1, p2) = regions(w)
        var s = Stem(w: w, p1: p1, p2: p2)
        s.step1a()
        if !s.exception2() {
            s.step1b(); s.step1c(); s.step2(); s.step3(); s.step4(); s.step5()
        }
        if yFound { s.w = s.w.map { $0 == Y ? y : $0 } }
        return String(decoding: s.w, as: UTF8.self)
    }

    static let y = UInt8(ascii: "y"), Y = UInt8(ascii: "Y"), q = UInt8(ascii: "'")

    static func isVowel(_ c: UInt8) -> Bool { "aeiouy".utf8.contains(c) }

    private static func exception1(_ w: [UInt8]) -> String? {
        switch String(decoding: w, as: UTF8.self) {
        case "skis": "ski"
        case "skies": "sky"
        case "dying": "die"
        case "lying": "lie"
        case "tying": "tie"
        case "idly": "idl"
        case "gently": "gentl"
        case "ugly": "ugli"
        case "early": "earli"
        case "only": "onli"
        case "singly": "singl"
        case let s where ["sky", "news", "howe", "atlas", "cosmos", "bias", "andes"].contains(s): s
        default: nil
        }
    }

    /// p1 and p2: after the first non-vowel that follows a vowel (with the gener/commun/arsen exceptions).
    private static func regions(_ w: [UInt8]) -> (Int, Int) {
        func afterVowelConsonant(from start: Int) -> Int {
            var i = start
            while i < w.count, !isVowel(w[i]) { i += 1 }
            guard i < w.count else { return w.count }
            while i < w.count, isVowel(w[i]) { i += 1 }
            return i < w.count ? i + 1 : w.count
        }
        var p1 = w.count
        let text = String(decoding: w, as: UTF8.self)
        if let prefix = ["gener", "commun", "arsen"].first(where: { text.hasPrefix($0) }) {
            p1 = prefix.utf8.count
        } else {
            p1 = afterVowelConsonant(from: 0)
        }
        let p2 = p1 < w.count ? afterVowelConsonant(from: p1) : w.count
        return (p1, p2)
    }

    private struct Stem {
        var w: [UInt8]
        let p1: Int, p2: Int

        func ends(_ suffix: String) -> Bool {
            let s = Array(suffix.utf8)
            return w.count >= s.count && Array(w[(w.count - s.count)...]) == s
        }

        /// The longest suffix in `list` that the word ends with.
        func longest(_ list: [String]) -> String? {
            list.filter(ends).max { $0.utf8.count < $1.utf8.count }
        }

        mutating func replace(_ suffix: String, _ with: String) {
            w.removeLast(suffix.utf8.count)
            w += Array(with.utf8)
        }

        func hasVowel(before end: Int) -> Bool { w[0..<max(0, end)].contains(where: EnglishStemmer.isVowel) }

        /// shortv at `end` (backward): non-v_WXY v non-v, or non-v v at the start of the word.
        func shortVowel(_ end: Int) -> Bool {
            func v(_ i: Int) -> Bool { EnglishStemmer.isVowel(w[i]) }
            if end >= 3 {
                let last = w[end - 1]
                if !v(end - 1) && !"wxY".utf8.contains(last) && v(end - 2) && !v(end - 3) { return true }
            }
            return end == 2 && !v(1) && v(0)
        }

        mutating func step1a() {
            if let s = longest(["'", "'s", "'s'"]) { w.removeLast(s.utf8.count) }
            guard let s = longest(["sses", "ied", "ies", "s", "us", "ss"]) else { return }
            switch s {
            case "sses": replace(s, "ss")
            case "ied", "ies": replace(s, w.count - 3 > 1 ? "i" : "ie")
            case "s":
                // next gopast v: a vowel before the letter preceding the s
                if w.count >= 2 && hasVowel(before: w.count - 2) { w.removeLast() }
            default: break
            }
        }

        func exception2() -> Bool {
            ["inning", "outing", "canning", "herring", "earring", "proceed", "exceed", "succeed"]
                .contains(String(decoding: w, as: UTF8.self))
        }

        mutating func step1b() {
            guard let s = longest(["eed", "eedly", "ed", "edly", "ing", "ingly"]) else { return }
            let start = w.count - s.utf8.count
            if s == "eed" || s == "eedly" {
                if start >= p1 { replace(s, "ee") }
                return
            }
            guard hasVowel(before: start) else { return }
            w.removeLast(s.utf8.count)
            if ends("at") || ends("bl") || ends("iz") {
                w.append(UInt8(ascii: "e"))
            } else if ["bb", "dd", "ff", "gg", "mm", "nn", "pp", "rr", "tt"].contains(where: ends) {
                w.removeLast()
            } else if w.count == p1 && shortVowel(w.count) {
                w.append(UInt8(ascii: "e"))
            }
        }

        mutating func step1c() {
            guard let last = w.last, last == y || last == Y, w.count >= 3, !EnglishStemmer.isVowel(w[w.count - 2]) else { return }
            w[w.count - 1] = UInt8(ascii: "i")
        }

        mutating func step2() {
            let list = ["tional", "enci", "anci", "abli", "entli", "izer", "ization", "ational", "ation", "ator", "alism",
                        "aliti", "alli", "fulness", "ousli", "ousness", "iveness", "iviti", "biliti", "bli", "ogi", "fulli",
                        "lessli", "li"]
            guard let s = longest(list), w.count - s.utf8.count >= p1 else { return }
            switch s {
            case "tional": replace(s, "tion")
            case "enci": replace(s, "ence")
            case "anci": replace(s, "ance")
            case "abli": replace(s, "able")
            case "entli": replace(s, "ent")
            case "izer", "ization": replace(s, "ize")
            case "ational", "ation", "ator": replace(s, "ate")
            case "alism", "aliti", "alli": replace(s, "al")
            case "fulness": replace(s, "ful")
            case "ousli", "ousness": replace(s, "ous")
            case "iveness", "iviti": replace(s, "ive")
            case "biliti", "bli": replace(s, "ble")
            case "ogi": if w.count >= 4 && w[w.count - 4] == UInt8(ascii: "l") { replace(s, "og") }
            case "fulli": replace(s, "ful")
            case "lessli": replace(s, "less")
            case "li": if w.count >= 3 && "cdeghkmnrt".utf8.contains(w[w.count - 3]) { w.removeLast(2) }
            default: break
            }
        }

        mutating func step3() {
            let list = ["tional", "ational", "alize", "icate", "iciti", "ical", "ful", "ness", "ative"]
            guard let s = longest(list), w.count - s.utf8.count >= p1 else { return }
            switch s {
            case "tional": replace(s, "tion")
            case "ational": replace(s, "ate")
            case "alize": replace(s, "al")
            case "icate", "iciti", "ical": replace(s, "ic")
            case "ful", "ness": w.removeLast(s.utf8.count)
            case "ative": if w.count - 5 >= p2 { w.removeLast(5) }
            default: break
            }
        }

        mutating func step4() {
            let list = ["al", "ance", "ence", "er", "ic", "able", "ible", "ant", "ement", "ment", "ent", "ism", "ate",
                        "iti", "ous", "ive", "ize", "ion"]
            guard let s = longest(list), w.count - s.utf8.count >= p2 else { return }
            if s == "ion" {
                let before = w.count - 4
                if before >= 0 && (w[before] == UInt8(ascii: "s") || w[before] == UInt8(ascii: "t")) { w.removeLast(3) }
            } else {
                w.removeLast(s.utf8.count)
            }
        }

        mutating func step5() {
            guard let last = w.last else { return }
            let start = w.count - 1
            if last == UInt8(ascii: "e") {
                if start >= p2 || (start >= p1 && !shortVowel(start)) { w.removeLast() }
            } else if last == UInt8(ascii: "l") {
                if start >= p2 && start >= 1 && w[start - 1] == UInt8(ascii: "l") { w.removeLast() }
            }
        }
    }
}

//! A tiny backtracking matcher for `urlMatches` `/regex/` patterns.
//!
//! Supported: literals, `.`, `*`, `+`, `?`, `^`, `$`, escapes (`\.`, `\/`,
//! `\d`, `\w`, `\s`), bracket classes (`[a-z]`, `[^0-9]`) and top-level
//! alternation `|`. Groups and counted repetition are not supported and
//! produce `capability_unsupported`, so a caller can fall back to Chromium.

use ve_core::{Error, Result};

#[derive(Clone, Debug)]
enum Atom {
    Any,
    Char(char),
    Class { negated: bool, items: Vec<ClassItem> },
    Start,
    End,
}

#[derive(Clone, Debug)]
enum ClassItem {
    Char(char),
    Range(char, char),
    Digit,
    Word,
    Space,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Quant {
    One,
    Star,
    Plus,
    Opt,
}

#[derive(Clone, Debug)]
struct Piece {
    atom: Atom,
    quant: Quant,
}

/// A compiled pattern.
#[derive(Clone, Debug)]
pub struct Pattern {
    alternatives: Vec<Vec<Piece>>,
    case_insensitive: bool,
}

fn class_item_matches(item: &ClassItem, c: char) -> bool {
    match item {
        ClassItem::Char(x) => *x == c,
        ClassItem::Range(a, b) => (*a..=*b).contains(&c),
        ClassItem::Digit => c.is_ascii_digit(),
        ClassItem::Word => c.is_alphanumeric() || c == '_',
        ClassItem::Space => c.is_whitespace(),
    }
}

fn atom_matches(atom: &Atom, c: char, ci: bool) -> bool {
    match atom {
        Atom::Any => c != '\n',
        Atom::Char(x) => {
            if ci {
                x.to_lowercase().eq(c.to_lowercase())
            } else {
                *x == c
            }
        }
        Atom::Class { negated, items } => {
            let hit = items.iter().any(|i| {
                class_item_matches(i, c)
                    || (ci
                        && (class_item_matches(i, c.to_ascii_lowercase())
                            || class_item_matches(i, c.to_ascii_uppercase())))
            });
            hit != *negated
        }
        Atom::Start | Atom::End => false,
    }
}

impl Pattern {
    /// Compiles `/body/flags` or a bare body. Only the `i` flag is honoured.
    pub fn compile(source: &str) -> Result<Self> {
        let (body, flags) = if let Some(rest) = source.strip_prefix('/')
            && let Some(idx) = rest.rfind('/')
        {
            (&rest[..idx], &rest[idx + 1..])
        } else {
            (source, "")
        };
        let case_insensitive = flags.contains('i');
        let mut alternatives = Vec::new();
        for alt in split_top_level(body) {
            alternatives.push(parse_sequence(alt)?);
        }
        Ok(Self {
            alternatives,
            case_insensitive,
        })
    }

    /// Whether the pattern matches anywhere in `text`.
    #[must_use]
    pub fn is_match(&self, text: &str) -> bool {
        let chars: Vec<char> = text.chars().collect();
        self.alternatives.iter().any(|seq| {
            (0..=chars.len()).any(|start| self.match_here(seq, 0, &chars, start).is_some())
        })
    }

    fn match_here(&self, seq: &[Piece], pi: usize, text: &[char], ti: usize) -> Option<usize> {
        let Some(piece) = seq.get(pi) else {
            return Some(ti);
        };
        match piece.atom {
            Atom::Start => {
                return (ti == 0)
                    .then(|| self.match_here(seq, pi + 1, text, ti))
                    .flatten();
            }
            Atom::End => {
                return (ti == text.len())
                    .then(|| self.match_here(seq, pi + 1, text, ti))
                    .flatten();
            }
            _ => {}
        }
        let ci = self.case_insensitive;
        let one = |i: usize| text.get(i).is_some_and(|&c| atom_matches(&piece.atom, c, ci));
        match piece.quant {
            Quant::One => {
                if one(ti) {
                    self.match_here(seq, pi + 1, text, ti + 1)
                } else {
                    None
                }
            }
            Quant::Opt => {
                if one(ti)
                    && let Some(end) = self.match_here(seq, pi + 1, text, ti + 1)
                {
                    return Some(end);
                }
                self.match_here(seq, pi + 1, text, ti)
            }
            Quant::Star | Quant::Plus => {
                let mut count = 0;
                while one(ti + count) {
                    count += 1;
                }
                let min = usize::from(piece.quant == Quant::Plus);
                let mut k = count;
                loop {
                    if k < min {
                        return None;
                    }
                    if let Some(end) = self.match_here(seq, pi + 1, text, ti + k) {
                        return Some(end);
                    }
                    if k == 0 {
                        return None;
                    }
                    k -= 1;
                }
            }
        }
    }
}

fn split_top_level(body: &str) -> Vec<&str> {
    let mut out = Vec::new();
    let mut start = 0;
    let mut escaped = false;
    let mut in_class = false;
    for (i, c) in body.char_indices() {
        if escaped {
            escaped = false;
            continue;
        }
        match c {
            '\\' => escaped = true,
            '[' => in_class = true,
            ']' => in_class = false,
            '|' if !in_class => {
                out.push(&body[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    out.push(&body[start..]);
    out
}

fn parse_sequence(body: &str) -> Result<Vec<Piece>> {
    let chars: Vec<char> = body.chars().collect();
    let mut pieces: Vec<Piece> = Vec::new();
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        let atom = match c {
            '.' => Atom::Any,
            '^' => Atom::Start,
            '$' => Atom::End,
            '(' | ')' | '{' | '}' => {
                return Err(Error::capability_unsupported(format!(
                    "regex feature {c:?} is not supported by the engine's matcher"
                )));
            }
            '*' | '+' | '?' => {
                let Some(last) = pieces.last_mut() else {
                    return Err(Error::invalid_params("regex: nothing to repeat"));
                };
                if last.quant != Quant::One {
                    return Err(Error::capability_unsupported(
                        "regex: stacked quantifiers are not supported",
                    ));
                }
                last.quant = match c {
                    '*' => Quant::Star,
                    '+' => Quant::Plus,
                    _ => Quant::Opt,
                };
                i += 1;
                continue;
            }
            '\\' => {
                i += 1;
                let Some(&e) = chars.get(i) else {
                    return Err(Error::invalid_params("regex: trailing backslash"));
                };
                match e {
                    'd' => Atom::Class {
                        negated: false,
                        items: vec![ClassItem::Digit],
                    },
                    'D' => Atom::Class {
                        negated: true,
                        items: vec![ClassItem::Digit],
                    },
                    'w' => Atom::Class {
                        negated: false,
                        items: vec![ClassItem::Word],
                    },
                    'W' => Atom::Class {
                        negated: true,
                        items: vec![ClassItem::Word],
                    },
                    's' => Atom::Class {
                        negated: false,
                        items: vec![ClassItem::Space],
                    },
                    'S' => Atom::Class {
                        negated: true,
                        items: vec![ClassItem::Space],
                    },
                    'n' => Atom::Char('\n'),
                    't' => Atom::Char('\t'),
                    other => Atom::Char(other),
                }
            }
            '[' => {
                i += 1;
                let negated = chars.get(i) == Some(&'^');
                if negated {
                    i += 1;
                }
                let mut items = Vec::new();
                let mut closed = false;
                while i < chars.len() {
                    let x = chars[i];
                    if x == ']' {
                        closed = true;
                        break;
                    }
                    if x == '\\' {
                        i += 1;
                        match chars.get(i) {
                            Some('d') => items.push(ClassItem::Digit),
                            Some('w') => items.push(ClassItem::Word),
                            Some('s') => items.push(ClassItem::Space),
                            Some(&o) => items.push(ClassItem::Char(o)),
                            None => return Err(Error::invalid_params("regex: bad class")),
                        }
                    } else if chars.get(i + 1) == Some(&'-')
                        && chars.get(i + 2).is_some_and(|&n| n != ']')
                    {
                        items.push(ClassItem::Range(x, chars[i + 2]));
                        i += 2;
                    } else {
                        items.push(ClassItem::Char(x));
                    }
                    i += 1;
                }
                if !closed {
                    return Err(Error::invalid_params("regex: unterminated class"));
                }
                Atom::Class { negated, items }
            }
            other => Atom::Char(other),
        };
        pieces.push(Piece {
            atom,
            quant: Quant::One,
        });
        i += 1;
    }
    Ok(pieces)
}

/// `urlMatches` semantics: `/regex/` → regex, else substring.
pub fn url_matches(pattern: &str, url: &str) -> Result<bool> {
    if pattern.len() >= 2 && pattern.starts_with('/') && pattern[1..].contains('/') {
        let compiled = Pattern::compile(pattern)?;
        return Ok(compiled.is_match(url));
    }
    Ok(url.contains(pattern))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_common_url_patterns() {
        assert!(url_matches("/records", "https://a.test/records/17").unwrap());
        assert!(!url_matches("/orders", "https://a.test/records/17").unwrap());
        assert!(url_matches(r"/\/records\/\d+$/", "https://a.test/records/17").unwrap());
        assert!(!url_matches(r"/\/records\/\d+$/", "https://a.test/records/").unwrap());
        assert!(url_matches("/^https:.*done/", "https://a.test/x?done").unwrap());
        assert!(url_matches("/RECORDS/i", "https://a.test/records").unwrap());
        assert!(url_matches("/cart|checkout/", "https://a.test/checkout").unwrap());
        assert!(url_matches("/[a-c]+\\.test/", "https://abc.test/").unwrap());
        assert!(!url_matches("/[^a-z]/", "abc").unwrap());
        assert!(url_matches("/colou?r/", "color").unwrap());
        assert!(url_matches("/x+y/", "xxy").unwrap());
        assert!(!url_matches("/x+y/", "y").unwrap());
        let groups = url_matches("/(a|b)/", "a").unwrap_err();
        assert_eq!(groups.code(), ve_core::ErrorCode::CapabilityUnsupported);
        let bad = url_matches("/*/", "a").unwrap_err();
        assert_eq!(bad.code(), ve_core::ErrorCode::InvalidParams);
        assert!(url_matches("/records/", "/records/").unwrap(), "regex 'records'");
    }
}

//! Port of `apps/desktop/renderer/src/intent.ts` + `chrome.ts` URL rules.

/// Detected command-bar intent.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Intent {
    /// Navigate to a URL.
    Navigate {
        /// Absolute URL.
        url: String,
        /// Chip label.
        display: String,
    },
    /// Web search.
    Search {
        /// Query.
        query: String,
        /// Search-engine URL.
        url: String,
    },
    /// Agent run.
    Run {
        /// Goal text.
        goal: String,
        /// `page` or `new`.
        scope: RunScope,
    },
    /// Palette command.
    Command {
        /// Query after `/`.
        query: String,
    },
    /// Empty field.
    Empty,
}

/// Agent run target.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RunScope {
    /// Current page.
    Page,
    /// New tab / task.
    New,
}

/// Context for [`detect_intent`].
#[derive(Clone, Copy, Debug)]
pub struct IntentContext<'a> {
    /// A live page is available for deictic / page-scoped runs.
    pub has_page: bool,
    /// Search template with `%s`.
    pub search_engine: Option<&'a str>,
}

const IMPERATIVE: &[&str] = &[
    "find", "open", "go", "book", "buy", "order", "add", "remove", "delete", "fill", "submit",
    "click", "log", "sign", "check", "compare", "summarise", "summarize", "extract", "collect",
    "list", "download", "upload", "send", "reply", "write", "draft", "create", "make", "schedule",
    "cancel", "change", "update", "set", "turn", "search", "look", "get", "grab", "scrape", "read",
    "translate", "explain", "tell", "show", "pull", "export", "save", "close", "scroll", "navigate",
    "visit", "watch", "track", "monitor", "apply", "register", "renew", "pay", "transfer", "post",
    "tweet", "email", "message", "call", "play", "pause", "mute", "unsubscribe", "follow", "like",
    "share", "rename", "move", "copy", "paste", "sort", "filter", "group", "count", "calculate",
    "convert",
];

const QUESTION: &[&str] = &[
    "who", "what", "when", "where", "why", "how", "which", "is", "are", "was", "were", "do",
    "does", "did", "can", "could", "should", "would", "will",
];

const DEICTIC: &[&str] = &[
    "this page", "this tab", "this site", "on this", "here", "these", "this form", "this table",
    "this article", "this one",
];

const OBJECT: &[&str] = &[
    "the", "this", "that", "these", "those", "my", "our", "your", "a", "an", "all", "every", "each",
    "me", "it", "them", "into", "from", "for", "to", "on", "in", "with",
];

fn first_word(v: &str) -> &str {
    v.split(|c: char| !c.is_ascii_alphabetic())
        .find(|w| !w.is_empty())
        .unwrap_or("")
}

fn contains_phrase(hay: &str, needles: &[&str]) -> bool {
    let lower = hay.to_ascii_lowercase();
    needles.iter().any(|n| {
        lower
            .split(|c: char| !(c.is_ascii_alphanumeric() || c == ' '))
            .any(|_| lower.contains(n))
            || lower.contains(n)
    })
}

fn word_in(hay: &str, words: &[&str]) -> bool {
    let lower = hay.to_ascii_lowercase();
    lower
        .split(|c: char| !c.is_ascii_alphanumeric())
        .any(|w| words.contains(&w))
}

fn has_scheme(v: &str) -> bool {
    let l = v.to_ascii_lowercase();
    l.starts_with("http://")
        || l.starts_with("https://")
        || l.starts_with("about:")
        || l.starts_with("chrome://")
        || l.starts_with("file://")
        || l.starts_with("view-source:")
        || l.starts_with("data:")
}

fn looks_dotted_host(v: &str) -> bool {
    if v.contains(' ') {
        return false;
    }
    if v.eq_ignore_ascii_case("localhost") || v.starts_with("localhost:") {
        return true;
    }
    let host = v.split('/').next().unwrap_or(v);
    let host = host.split(':').next().unwrap_or(host);
    host.contains('.') && host.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
}

/// URL-like input (scheme, localhost, dotted host).
#[must_use]
pub fn is_url_like(v: &str) -> bool {
    let v = v.trim();
    has_scheme(v) || v.eq_ignore_ascii_case("localhost") || looks_dotted_host(v)
}

fn is_local(s: &str) -> bool {
    let l = s.to_ascii_lowercase();
    l.starts_with("localhost")
        || l.starts_with("127.")
        || l.starts_with("0.0.0.0")
        || l.starts_with("192.168.")
        || l.starts_with("10.")
        || l.contains(".local")
}

/// URL-like input becomes http(s); otherwise a search URL.
#[must_use]
pub fn to_url(v: &str, search_engine: Option<&str>) -> String {
    let s = v.trim();
    if has_scheme(s) {
        return s.to_string();
    }
    if is_url_like(s) && !s.contains(' ') {
        let scheme = if is_local(s) { "http" } else { "https" };
        return format!("{scheme}://{s}");
    }
    let tpl = search_engine.unwrap_or("https://duckduckgo.com/?q=%s");
    let q = url::form_urlencoded::byte_serialize(s.as_bytes()).collect::<String>();
    if tpl.contains("%s") {
        tpl.replace("%s", &q)
    } else {
        format!("{tpl}{q}")
    }
}

/// Detect command-bar intent.
#[must_use]
pub fn detect_intent(raw: &str, ctx: IntentContext<'_>) -> Intent {
    let v = raw.trim();
    if v.is_empty() {
        return Intent::Empty;
    }
    if let Some(rest) = v.strip_prefix('/') {
        return Intent::Command {
            query: rest.trim().to_string(),
        };
    }
    if let Some(rest) = v.strip_prefix('>') {
        let goal = rest.trim();
        return if goal.is_empty() {
            Intent::Empty
        } else {
            Intent::Run {
                goal: goal.to_string(),
                scope: if ctx.has_page {
                    RunScope::Page
                } else {
                    RunScope::New
                },
            }
        };
    }
    if let Some(rest) = v.strip_prefix('?') {
        let q = rest.trim();
        return Intent::Search {
            query: q.to_string(),
            url: to_url(q, ctx.search_engine),
        };
    }
    if !v.contains(char::is_whitespace) && is_url_like(v) {
        let url = to_url(v, ctx.search_engine);
        let display = url
            .trim_start_matches("https://")
            .trim_start_matches("http://")
            .trim_end_matches('/')
            .to_string();
        return Intent::Navigate { url, display };
    }

    let words: Vec<&str> = v.split_whitespace().collect();
    let ends_question = v.ends_with('?');
    let looks_question = QUESTION
        .iter()
        .any(|w| first_word(v).eq_ignore_ascii_case(w))
        || ends_question;
    let deictic = contains_phrase(v, DEICTIC) || word_in(v, &["here", "it", "these"]);
    let object_marker = word_in(v, OBJECT);
    let imperative = IMPERATIVE
        .iter()
        .any(|w| first_word(v).eq_ignore_ascii_case(w))
        && (object_marker || deictic || words.len() >= 4);

    let lower = v.to_ascii_lowercase();
    for prefix in ["search for ", "search ", "look up ", "google "] {
        if let Some(rest) = lower.strip_prefix(prefix)
            && !deictic
            && !rest.is_empty()
        {
            let q = v[prefix.len()..].trim();
            return Intent::Search {
                query: q.to_string(),
                url: to_url(q, ctx.search_engine),
            };
        }
    }

    if looks_question && !imperative {
        if deictic && ctx.has_page {
            return Intent::Run {
                goal: v.to_string(),
                scope: RunScope::Page,
            };
        }
        return Intent::Search {
            query: v.to_string(),
            url: to_url(v, ctx.search_engine),
        };
    }

    if imperative {
        return Intent::Run {
            goal: v.to_string(),
            scope: if ctx.has_page {
                RunScope::Page
            } else {
                RunScope::New
            },
        };
    }

    if words.len() >= 6 {
        return Intent::Run {
            goal: v.to_string(),
            scope: if ctx.has_page {
                RunScope::Page
            } else {
                RunScope::New
            },
        };
    }
    Intent::Search {
        query: v.to_string(),
        url: to_url(v, ctx.search_engine),
    }
}

/// Chip label beside the command field.
#[must_use]
pub fn intent_label(intent: &Intent) -> &'static str {
    match intent {
        Intent::Navigate { .. } => "Open",
        Intent::Search { .. } => "Search",
        Intent::Run {
            scope: RunScope::Page,
            ..
        } => "Ask on this page",
        Intent::Run {
            scope: RunScope::New,
            ..
        } => "New task",
        Intent::Command { .. } => "Command",
        Intent::Empty => "",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ctx(has_page: bool) -> IntentContext<'static> {
        IntentContext {
            has_page,
            search_engine: None,
        }
    }

    #[test]
    fn url_navigates() {
        match detect_intent("example.com", ctx(false)) {
            Intent::Navigate { url, .. } => assert!(url.starts_with("https://example.com")),
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn question_is_search() {
        match detect_intent("what is rust", ctx(false)) {
            Intent::Search { .. } => {}
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn slash_is_command() {
        match detect_intent("/settings", ctx(false)) {
            Intent::Command { query } => assert_eq!(query, "settings"),
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn force_run() {
        match detect_intent("> summarise this page", ctx(true)) {
            Intent::Run {
                scope: RunScope::Page,
                ..
            } => {}
            other => panic!("{other:?}"),
        }
    }
}

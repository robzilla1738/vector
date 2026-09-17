//! HTML parsing for the Vector Engine.
//!
//! This crate wraps the `html5ever` tokenizer and tree builder — a mature,
//! spec-complete HTML5 parser — and feeds its output directly into a
//! [`ve_dom::Document`] through the [`TreeSink`](html5ever::tree_builder::TreeSink)
//! bridge in [`sink`]. The engine therefore owns the DOM representation while
//! borrowing battle-tested tokenisation and tree construction.
//!
//! # Contract
//!
//! * [`parse_document`] always succeeds: HTML has no fatal errors. Recoverable
//!   parse errors are collected in [`ParseOutcome::errors`] for diagnostics.
//! * Element and attribute names are stored lower-cased for the HTML namespace
//!   (as html5ever produces them). Foreign content keeps its case and prefix
//!   (`xlink:href`).
//! * `<template>` contents are parsed into a detached
//!   [`DocumentFragment`](ve_dom::NodeKind::DocumentFragment) reachable via
//!   [`Document::template_contents`](ve_dom::Document::template_contents).
//! * Quirks mode is propagated to the document.
//! * Scripting is reported as **disabled** by default (so `<noscript>` content
//!   is parsed as HTML). A page with a VM attached sets
//!   [`ParseOptions::scripting_enabled`] so `<noscript>` is raw text. Script
//!   execution happens after parsing; `document.write` is not supported.

#![forbid(unsafe_code)]

pub mod decode;
pub mod meta;
pub mod sink;

use html5ever::tendril::{StrTendril, TendrilSink};
use html5ever::tree_builder::TreeBuilderOpts;
use html5ever::{ParseOpts, Parser, QualName, parse_document as h5_parse_document, parse_fragment};
use ve_core::{NodeId, Stage};
use ve_dom::Document;

pub use decode::{
    Charset, CharsetSource, Decoded, decode_html_bytes, decode_windows_1252, sniff_meta_charset,
};
pub use meta::{DocumentMeta, MetaRefresh, document_meta, parse_refresh_content};
pub use sink::DomSink;

/// The result of parsing a document.
#[derive(Debug)]
pub struct ParseOutcome {
    /// The constructed document.
    pub document: Document,
    /// Recoverable parse errors, in the order they were reported.
    pub errors: Vec<String>,
    /// First element the tree builder created (fragment context, or `<html>`).
    pub context_element: Option<NodeId>,
}

/// Options for document and fragment parsing.
#[derive(Clone, Copy, Debug)]
pub struct ParseOptions {
    /// Tree-builder scripting flag (`<noscript>` handling).
    pub scripting_enabled: bool,
    /// Streaming chunk size in bytes (character-aligned).
    pub chunk_size: usize,
}

impl Default for ParseOptions {
    fn default() -> Self {
        Self {
            scripting_enabled: false,
            chunk_size: 16 * 1024,
        }
    }
}

/// Parses a complete HTML document from a string.
///
/// The input is treated as already-decoded text; byte decoding and charset
/// sniffing happen in the network layer.
#[must_use]
pub fn parse_document(html: &str) -> ParseOutcome {
    let span = Stage::Parse.span();
    let _guard = span.enter();
    let opts = parse_opts(false);
    let sink = DomSink::new(Document::new());
    let outcome = h5_parse_document(sink, opts).one(html);
    tracing::debug!(
        nodes = outcome.document.node_count(),
        errors = outcome.errors.len(),
        "parsed"
    );
    outcome
}

fn parse_opts(scripting_enabled: bool) -> ParseOpts {
    ParseOpts {
        tree_builder: TreeBuilderOpts {
            scripting_enabled,
            ..TreeBuilderOpts::default()
        },
        ..ParseOpts::default()
    }
}

/// An incremental document parser: feed decoded text as it arrives from the
/// network, then [`DocumentParser::finish`]. Each chunk is processed
/// immediately, so a consumer can inspect a partially built document between
/// chunks (the `<head>` is usually complete after the first few KB, which is
/// when the router's static classification can start).
pub struct DocumentParser {
    inner: Parser<DomSink>,
    chunks: usize,
    bytes: usize,
}

impl std::fmt::Debug for DocumentParser {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DocumentParser")
            .field("chunks", &self.chunks)
            .field("bytes", &self.bytes)
            .finish()
    }
}

impl Default for DocumentParser {
    fn default() -> Self {
        Self::new()
    }
}

impl DocumentParser {
    /// Creates a parser for a fresh document.
    #[must_use]
    pub fn new() -> Self {
        Self::with_options(ParseOptions::default())
    }

    /// Creates a parser with `options`.
    #[must_use]
    pub fn with_options(options: ParseOptions) -> Self {
        Self {
            inner: h5_parse_document(
                DomSink::new(Document::new()),
                parse_opts(options.scripting_enabled),
            ),
            chunks: 0,
            bytes: 0,
        }
    }

    /// Feeds one chunk of decoded text.
    pub fn feed(&mut self, chunk: &str) {
        self.chunks += 1;
        self.bytes += chunk.len();
        self.inner.process(StrTendril::from(chunk));
    }

    /// Number of chunks fed so far.
    #[must_use]
    pub fn chunks(&self) -> usize {
        self.chunks
    }

    /// Total characters (bytes of UTF-8) fed so far.
    #[must_use]
    pub fn bytes_fed(&self) -> usize {
        self.bytes
    }

    /// Signals end-of-file and returns the document.
    #[must_use]
    pub fn finish(self) -> ParseOutcome {
        let span = Stage::Parse.span();
        let _guard = span.enter();
        let outcome = self.inner.finish();
        tracing::debug!(
            nodes = outcome.document.node_count(),
            errors = outcome.errors.len(),
            chunks = self.chunks,
            "parsed (streaming)"
        );
        outcome
    }
}

/// Parses a document from decoded text delivered in chunks (streaming
/// pipeline entry point used by the page loader).
#[must_use]
pub fn parse_document_chunks<'a>(chunks: impl IntoIterator<Item = &'a str>) -> ParseOutcome {
    let mut parser = DocumentParser::new();
    for chunk in chunks {
        parser.feed(chunk);
    }
    parser.finish()
}

/// Parses `html` as a fragment of `context_local` (an HTML element local name)
/// into `doc`. Returns the document and the parsed nodes, in tree order.
/// Used by `innerHTML` (plan A14).
///
/// html5ever's fragment algorithm creates a temporary `<html>` root under the
/// document and inserts into an implied `<body>` (or `<head>` / the root,
/// depending on `context_local`). This function detaches those inserted
/// nodes and destroys the temporary tree so the caller can reparent them.
#[must_use]
pub fn parse_fragment_into(
    doc: Document,
    context_local: &str,
    html: &str,
    scripting_enabled: bool,
) -> (Document, Vec<NodeId>) {
    let span = Stage::Parse.span();
    let _guard = span.enter();
    let root = doc.root();
    let before: Vec<NodeId> = doc.children(root).collect();
    let context_name = QualName::new(
        None,
        html5ever::ns!(html),
        html5ever::LocalName::from(context_local),
    );
    let sink = DomSink::for_existing(doc);
    let outcome = parse_fragment(
        sink,
        parse_opts(scripting_enabled),
        context_name,
        Vec::new(),
        scripting_enabled,
    )
    .one(html);
    let mut doc = outcome.document;
    let after: Vec<NodeId> = doc.children(doc.root()).collect();
    let Some(fragment_html) = after
        .into_iter()
        .find(|&id| !before.contains(&id) && doc.element(id).is_some_and(|e| e.is_html("html")))
    else {
        if let Some(context) = outcome.context_element {
            let _ = doc.destroy(context);
        }
        return (doc, Vec::new());
    };
    let container = fragment_container(&doc, fragment_html, context_local);
    let kids: Vec<NodeId> = doc.children(container).collect();
    for &kid in &kids {
        let _ = doc.remove(kid);
    }
    let _ = doc.destroy(fragment_html);
    if let Some(context) = outcome.context_element {
        let _ = doc.destroy(context);
    }
    (doc, kids)
}

fn fragment_container(doc: &Document, fragment_html: NodeId, context_local: &str) -> NodeId {
    let ctx = context_local.to_ascii_lowercase();
    if ctx == "html" {
        return fragment_html;
    }
    let want = if matches!(
        ctx.as_str(),
        "head"
            | "title"
            | "base"
            | "basefont"
            | "bgsound"
            | "link"
            | "meta"
            | "noframes"
            | "noscript"
            | "style"
            | "template"
    ) {
        "head"
    } else {
        "body"
    };
    doc.children(fragment_html)
        .find(|&c| doc.element(c).is_some_and(|e| e.is_html(want)))
        .unwrap_or(fragment_html)
}

/// Decodes raw bytes (BOM / transport charset / `<meta charset>` / UTF-8) and
/// parses them in chunks of at most `chunk_size` bytes (split on character
/// boundaries). Returns the outcome together with the charset decision.
#[must_use]
pub fn parse_document_bytes(
    bytes: &[u8],
    transport_charset: Option<&str>,
    chunk_size: usize,
) -> (ParseOutcome, Decoded) {
    parse_document_bytes_with(
        bytes,
        transport_charset,
        ParseOptions {
            scripting_enabled: false,
            chunk_size,
        },
    )
}

/// [`parse_document_bytes`] with full [`ParseOptions`].
#[must_use]
pub fn parse_document_bytes_with(
    bytes: &[u8],
    transport_charset: Option<&str>,
    options: ParseOptions,
) -> (ParseOutcome, Decoded) {
    let decoded = decode_html_bytes(bytes, transport_charset);
    let mut parser = DocumentParser::with_options(options);
    let text = decoded.text.as_str();
    let chunk_size = options.chunk_size.max(1);
    let mut start = 0;
    while start < text.len() {
        let mut end = (start + chunk_size).min(text.len());
        while end < text.len() && !text.is_char_boundary(end) {
            end += 1;
        }
        parser.feed(&text[start..end]);
        start = end;
    }
    (parser.finish(), decoded)
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_dom::{NodeKind, QuirksMode};

    #[test]
    fn streaming_parse_matches_one_shot_parse() {
        let html = "<!DOCTYPE html><title>Stream</title><body><p id=a>Hello <b>wor";
        let tail = "ld</b> and more</p><ul><li>one<li>two</ul></body>";
        let one_shot = parse_document(&format!("{html}{tail}")).document;
        let streamed = parse_document_chunks([html, tail]).document;
        assert_eq!(streamed.title(), one_shot.title());
        assert_eq!(streamed.node_count(), one_shot.node_count());
        let p = streamed.element_by_id("a").unwrap();
        assert_eq!(streamed.text_content(p), "Hello world and more");

        let mut parser = DocumentParser::new();
        parser.feed("<title>T</title><p>par");
        parser.feed("tial");
        assert_eq!((parser.chunks(), parser.bytes_fed()), (2, 26));
        let doc = parser.finish().document;
        assert_eq!(doc.text_content(doc.body().unwrap()), "partial");
    }

    #[test]
    fn byte_parsing_decodes_and_chunks_on_char_boundaries() {
        let html = "<!doctype html><meta charset=latin1><title>Ünïcode</title><p>naïve café</p>";
        // Encode as windows-1252.
        let bytes: Vec<u8> = html
            .chars()
            .map(|c| {
                let cp = c as u32;
                assert!(cp < 256);
                cp as u8
            })
            .collect();
        let (outcome, decoded) = parse_document_bytes(&bytes, None, 7);
        assert_eq!(decoded.charset, Charset::Windows1252);
        assert_eq!(decoded.source, CharsetSource::Meta);
        assert_eq!(outcome.document.title().as_deref(), Some("Ünïcode"));
        let body = outcome.document.body().unwrap();
        assert_eq!(outcome.document.text_content(body), "naïve café");

        let (utf8, decoded) = parse_document_bytes("<p>日本語</p>".as_bytes(), None, 2);
        assert_eq!(decoded.source, CharsetSource::Default);
        let body = utf8.document.body().unwrap();
        assert_eq!(utf8.document.text_content(body), "日本語");
    }

    #[test]
    fn builds_a_full_tree_with_template_contents() {
        let html = r#"<!DOCTYPE html><html><head><title>T</title></head>
<body><p id=a class="x y">Hi <b>there</b> &amp; bye</p>
<template><span>tpl</span></template></body></html>"#;
        let ParseOutcome { document: doc, .. } = parse_document(html);
        assert_eq!(doc.quirks_mode(), QuirksMode::NoQuirks);
        assert_eq!(doc.title().as_deref(), Some("T"));

        let p = doc.element_by_id("a").expect("p#a");
        assert!(doc.element(p).unwrap().has_class("y"));
        assert_eq!(doc.text_content(p), "Hi there & bye");
        let kids: Vec<_> = doc.children(p).collect();
        assert_eq!(kids.len(), 3, "text, <b>, text");
        assert!(doc.get(kids[0]).unwrap().is_text());
        assert!(doc.element(kids[1]).unwrap().is_html("b"));

        let doctype = doc.children(doc.root()).next().unwrap();
        assert!(
            matches!(&doc.get(doctype).unwrap().kind, NodeKind::Doctype { name, .. } if name == "html")
        );

        let template = doc
            .elements()
            .find(|&e| doc.element(e).unwrap().is_html("template"))
            .unwrap();
        assert_eq!(
            doc.children(template).count(),
            0,
            "template children live in the fragment"
        );
        let frag = doc.template_contents(template).expect("template contents");
        assert_eq!(doc.text_content(frag), "tpl");
    }

    #[test]
    fn missing_doctype_means_quirks_and_implied_elements() {
        let ParseOutcome {
            document: doc,
            errors,
            ..
        } = parse_document("<p>lonely<p>second");
        assert_eq!(doc.quirks_mode(), QuirksMode::Quirks);
        assert!(doc.head().is_some());
        let body = doc.body().unwrap();
        let ps: Vec<_> = doc
            .children(body)
            .filter(|&c| doc.element(c).is_some_and(|e| e.is_html("p")))
            .collect();
        assert_eq!(ps.len(), 2);
        assert_eq!(doc.text_content(ps[1]), "second");
        assert!(!errors.is_empty(), "missing doctype is reported");
    }

    #[test]
    fn fragment_parse_inserts_into_an_existing_document() {
        let doc = parse_document("<div id=host>keep</div>").document;
        let host = doc.element_by_id("host").unwrap();
        let (mut doc, kids) = parse_fragment_into(doc, "div", "<span>a</span>b", false);
        assert_eq!(kids.len(), 2);
        for k in kids {
            doc.append_child(host, k).unwrap();
        }
        assert_eq!(doc.text_content(host), "keepab");
    }

    #[test]
    fn fragment_parse_script_with_scripting_enabled() {
        let doc = parse_document("<body><p id=keep>keep</p></body>").document;
        let keep = doc.element_by_id("keep");
        let (doc, kids) = parse_fragment_into(
            doc,
            "body",
            r#"<script id="document-write">mark();</script>"#,
            true,
        );
        assert_eq!(kids.len(), 1, "kids={}", kids.len());
        assert!(
            doc.element(kids[0])
                .is_some_and(|e| e.is_html("script") && e.id() == Some("document-write")),
            "not a script"
        );
        assert_eq!(doc.text_content(kids[0]), "mark();");
        assert!(
            keep.is_some_and(|id| doc.contains(id) && doc.element_by_id("keep") == Some(id)),
            "original tree was destroyed"
        );
    }

    #[test]
    fn fragment_parse_xhtml_iframe_keeps_script() {
        let html = r#"<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml">
    <body>
        <div id="container"></div>
    </body>
    <script>window.top.postMessage("subframe-loaded");</script>
</html>"#;
        let doc = parse_document("<body></body>").document;
        let (doc, kids) = parse_fragment_into(doc, "body", html, true);
        let scripts: Vec<_> = kids
            .iter()
            .copied()
            .chain(kids.iter().flat_map(|&k| doc.descendants(k)))
            .filter(|&id| doc.element(id).is_some_and(|e| e.is_html("script")))
            .collect();
        assert!(!scripts.is_empty(), "kids={} scripts=0", kids.len());
        assert!(
            scripts
                .iter()
                .any(|&id| doc.text_content(id).contains("subframe-loaded")),
            "script text={:?}",
            scripts
                .iter()
                .map(|&id| doc.text_content(id))
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn scripting_enabled_leaves_noscript_unparsed() {
        let html = "<noscript><p id=x>hidden</p></noscript>";
        let off = parse_document(html).document;
        assert!(off.element_by_id("x").is_some());
        let mut parser = DocumentParser::with_options(ParseOptions {
            scripting_enabled: true,
            chunk_size: 1024,
        });
        parser.feed(html);
        let on = parser.finish().document;
        assert!(on.element_by_id("x").is_none());
    }
}

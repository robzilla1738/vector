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
//! * Scripting is reported as **disabled** to the tree builder (so `<noscript>`
//!   content is parsed). Script execution is `ve-script`'s job and happens
//!   after parsing in M0; document.write is not supported yet.

#![forbid(unsafe_code)]

pub mod decode;
pub mod meta;
pub mod sink;

use html5ever::tendril::{StrTendril, TendrilSink};
use html5ever::tree_builder::TreeBuilderOpts;
use html5ever::{ParseOpts, Parser, parse_document as h5_parse_document};
use ve_core::Stage;
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
}

/// Parses a complete HTML document from a string.
///
/// The input is treated as already-decoded text; byte decoding and charset
/// sniffing happen in the network layer.
#[must_use]
pub fn parse_document(html: &str) -> ParseOutcome {
    let span = Stage::Parse.span();
    let _guard = span.enter();
    let opts = ParseOpts {
        tree_builder: TreeBuilderOpts {
            scripting_enabled: false,
            ..TreeBuilderOpts::default()
        },
        ..ParseOpts::default()
    };
    let sink = DomSink::new(Document::new());
    let outcome = h5_parse_document(sink, opts).one(html);
    tracing::debug!(
        nodes = outcome.document.node_count(),
        errors = outcome.errors.len(),
        "parsed"
    );
    outcome
}

fn parse_opts() -> ParseOpts {
    ParseOpts {
        tree_builder: TreeBuilderOpts {
            scripting_enabled: false,
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
        Self {
            inner: h5_parse_document(DomSink::new(Document::new()), parse_opts()),
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

/// Decodes raw bytes (BOM / transport charset / `<meta charset>` / UTF-8) and
/// parses them in chunks of at most `chunk_size` bytes (split on character
/// boundaries). Returns the outcome together with the charset decision.
#[must_use]
pub fn parse_document_bytes(
    bytes: &[u8],
    transport_charset: Option<&str>,
    chunk_size: usize,
) -> (ParseOutcome, Decoded) {
    let decoded = decode_html_bytes(bytes, transport_charset);
    let mut parser = DocumentParser::new();
    let text = decoded.text.as_str();
    let chunk_size = chunk_size.max(1);
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
}

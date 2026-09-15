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

pub mod sink;

use html5ever::tendril::TendrilSink;
use html5ever::tree_builder::TreeBuilderOpts;
use html5ever::{ParseOpts, parse_document as h5_parse_document};
use ve_core::Stage;
use ve_dom::Document;

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

#[cfg(test)]
mod tests {
    use super::*;
    use ve_dom::{NodeKind, QuirksMode};

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

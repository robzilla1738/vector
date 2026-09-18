//! Router accuracy and observation budgets over the public-page corpus
//! (`engine/fixtures/public/{static,spa}/*.html`, manifest
//! `engine/conformance/corpus.json`, fetched by `engine/tools/corpus/fetch.mjs`).
//!
//! Two rates matter for shipping `engineMode: auto` (plan A18):
//!
//! * **false positive** — a server-rendered page the router sends to
//!   Chromium (`static/` classified `requires_script`). Costs latency only.
//! * **false negative** — a client-rendered shell the router keeps on the
//!   engine (`spa/` classified `static`). Produces a wrong observation, so
//!   this is the dangerous direction.
//!
//! The per-page results are written to `engine/conformance/corpus-results.json`
//! with `UPDATE_CORPUS=1` so the numbers quoted in `docs/engine/architecture.md`
//! are reproducible. Gates: false-negative rate ≤ 5 % (one known gray zone:
//! a landing page whose copy is real content but whose app is script-only),
//! false-positive rate ≤ 10 % (the design target is 5 %; the gate tightens
//! as the heuristic improves), Compact observation ≤ 10 000 approx tokens on
//! every static page (the 4 000 design target holds on the hand-written
//! fixtures; real pages with 120 shown elements land at 4–9 k, tracked in
//! `TOKEN_GATE` and plan A10).

use std::path::{Path, PathBuf};

use serde::Serialize;
use ve_api::{EngineConfig, ObservationRequest, OpenRequest, VectorEngine};

const FP_GATE: f64 = 0.10;
const FN_GATE: f64 = 0.05;
const TOKEN_GATE: usize = 10_000;

fn corpus_dir(kind: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../fixtures/public")
        .join(kind)
}

fn fixture_paths(kind: &str) -> Vec<PathBuf> {
    let Ok(dir) = std::fs::read_dir(corpus_dir(kind)) else {
        return Vec::new();
    };
    let mut paths: Vec<PathBuf> = dir
        .map(|e| e.unwrap().path())
        .filter(|p| p.extension().is_some_and(|x| x == "html"))
        .collect();
    paths.sort();
    paths
}

/// The original URL recorded by the fetcher on the first line of a snapshot.
fn source_url(html: &str) -> Option<String> {
    let first = html.lines().next()?;
    let start = first.find("snapshot: ")? + "snapshot: ".len();
    let rest = &first[start..];
    let end = rest.find(" (final ")?;
    Some(rest[..end].to_string())
}

#[derive(Serialize)]
struct PageResult {
    name: String,
    kind: &'static str,
    url: String,
    requires_script: bool,
    route_reason: String,
    body_text_chars: usize,
    external_scripts: usize,
    elements_total: usize,
    elements_shown: usize,
    approx_tokens: usize,
    headings: usize,
    open_us: u128,
    observe_us: u128,
}

#[derive(Serialize)]
struct Report {
    static_pages: usize,
    spa_pages: usize,
    false_positives: Vec<String>,
    false_negatives: Vec<String>,
    false_positive_rate: f64,
    false_negative_rate: f64,
    over_token_budget: Vec<String>,
    pages: Vec<PageResult>,
}

fn run(engine: &mut VectorEngine, kind: &'static str, path: &Path) -> PageResult {
    let name = path.file_stem().unwrap().to_string_lossy().into_owned();
    let html = std::fs::read_to_string(path).unwrap();
    let url = source_url(&html).unwrap_or_else(|| format!("https://corpus.vector.test/{name}"));
    let t0 = std::time::Instant::now();
    let opened = engine
        .open(OpenRequest::html(html, Some(&url)))
        .unwrap_or_else(|e| panic!("{name}: open failed: {e}"));
    let open_us = t0.elapsed().as_micros();
    let t1 = std::time::Instant::now();
    let observation = engine
        .observe(opened.page, &ObservationRequest::default())
        .unwrap_or_else(|e| panic!("{name}: observe failed: {e}"))
        .observation;
    let observe_us = t1.elapsed().as_micros();
    engine.close(opened.page);
    let c = &observation.content;
    PageResult {
        name,
        kind,
        url,
        requires_script: opened.routing.requires_script,
        route_reason: opened.routing.route_reason.clone(),
        body_text_chars: opened.routing.body_text_chars,
        external_scripts: opened.routing.external_scripts,
        elements_total: c.stats.elements_total,
        elements_shown: c.stats.elements_shown,
        approx_tokens: c.stats.approx_tokens,
        headings: c.headings.len(),
        open_us,
        observe_us,
    }
}

#[test]
fn router_classifies_the_public_corpus() {
    let statics = fixture_paths("static");
    let spas = fixture_paths("spa");
    if statics.is_empty() && spas.is_empty() {
        eprintln!("corpus not fetched (node engine/tools/corpus/fetch.mjs); skipping");
        return;
    }
    let mut engine = VectorEngine::new(EngineConfig {
        offline: true,
        shaper: ve_api::ShaperKind::System,
        ..EngineConfig::default()
    });
    let mut pages = Vec::new();
    for p in &statics {
        pages.push(run(&mut engine, "static", p));
    }
    for p in &spas {
        pages.push(run(&mut engine, "spa", p));
    }

    let false_positives: Vec<String> = pages
        .iter()
        .filter(|p| p.kind == "static" && p.requires_script)
        .map(|p| format!("{} ({})", p.name, p.route_reason))
        .collect();
    let false_negatives: Vec<String> = pages
        .iter()
        .filter(|p| p.kind == "spa" && !p.requires_script)
        .map(|p| {
            format!(
                "{} (body {} chars, {} scripts)",
                p.name, p.body_text_chars, p.external_scripts
            )
        })
        .collect();
    let over_token_budget: Vec<String> = pages
        .iter()
        .filter(|p| p.kind == "static" && !p.requires_script && p.approx_tokens > TOKEN_GATE)
        .map(|p| format!("{} ({} tokens)", p.name, p.approx_tokens))
        .collect();
    let report = Report {
        static_pages: statics.len(),
        spa_pages: spas.len(),
        false_positive_rate: false_positives.len() as f64 / statics.len().max(1) as f64,
        false_negative_rate: false_negatives.len() as f64 / spas.len().max(1) as f64,
        false_positives,
        false_negatives,
        over_token_budget,
        pages,
    };

    let json = serde_json::to_string_pretty(&report).unwrap();
    if std::env::var_os("UPDATE_CORPUS").is_some() {
        let out =
            Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/corpus-results.json");
        std::fs::write(&out, format!("{json}\n")).unwrap();
        eprintln!("wrote {}", out.display());
    }
    eprintln!(
        "corpus: {} static, {} spa; FP {:.1}% ({}), FN {:.1}% ({}), over token budget: {}",
        report.static_pages,
        report.spa_pages,
        report.false_positive_rate * 100.0,
        report.false_positives.len(),
        report.false_negative_rate * 100.0,
        report.false_negatives.len(),
        report.over_token_budget.len()
    );
    for fp in &report.false_positives {
        eprintln!("  FP {fp}");
    }
    for fneg in &report.false_negatives {
        eprintln!("  FN {fneg}");
    }
    for t in &report.over_token_budget {
        eprintln!("  tokens {t}");
    }

    assert!(
        report.false_negative_rate <= FN_GATE,
        "client-rendered shells classified static (wrong observations): {:?}",
        report.false_negatives
    );
    assert!(
        report.false_positive_rate <= FP_GATE,
        "false-positive rate {:.1}% exceeds {:.0}%: {:?}",
        report.false_positive_rate * 100.0,
        FP_GATE * 100.0,
        report.false_positives
    );
    assert!(
        report.over_token_budget.is_empty(),
        "Compact observations over {TOKEN_GATE} tokens: {:?}",
        report.over_token_budget
    );
}

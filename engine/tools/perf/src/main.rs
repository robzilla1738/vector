//! Per-stage performance harness.
//!
//! Runs the pipeline stages (parse → style → layout → snapshot → paint) over
//! a document `N` times, timing each stage with [`StageTimer`], and emits a
//! JSON summary (min / p50 / mean / max microseconds per stage). Set
//! `RUST_LOG=trace` to also stream `tracing` spans.

use std::path::PathBuf;

use anyhow::{Context, Result};
use clap::Parser;
use serde::Serialize;
use ve_a11y::{AccessibilityTree, BuildOptions, SemanticSnapshot, SnapshotFormat};
use ve_core::{Size, Stage, StageTimer};
use ve_gfx::DisplayList;
use ve_layout::LayoutEngine;
use ve_style::{MediaEnv, StyleEngine};

/// Command line options.
#[derive(Parser, Debug)]
#[command(name = "perf", about = "Times each Vector Engine pipeline stage")]
struct Args {
    /// HTML file to measure (a generated fixture is used when omitted).
    #[arg(long)]
    input: Option<PathBuf>,
    /// Number of timed iterations.
    #[arg(long, default_value_t = 20)]
    iterations: u32,
    /// Viewport width in CSS pixels.
    #[arg(long, default_value_t = 1280.0)]
    width: f32,
    /// Viewport height in CSS pixels.
    #[arg(long, default_value_t = 720.0)]
    height: f32,
    /// Write the JSON report here instead of stdout.
    #[arg(long)]
    out: Option<PathBuf>,
    /// Number of sections in the generated fixture.
    #[arg(long, default_value_t = 200)]
    fixture_sections: usize,
}

#[derive(Serialize)]
struct StageSummary {
    stage: Stage,
    samples: usize,
    min_us: u64,
    p50_us: u64,
    mean_us: u64,
    max_us: u64,
}

#[derive(Serialize)]
struct Report {
    engine_version: &'static str,
    input: String,
    iterations: u32,
    viewport: Size,
    nodes: usize,
    snapshot_nodes: usize,
    display_items: usize,
    stages: Vec<StageSummary>,
    samples: Vec<ve_core::StageSample>,
}

fn fixture(sections: usize) -> String {
    let mut html = String::from(
        "<!DOCTYPE html><html><head><title>perf fixture</title><style>\
         body{font-family:sans-serif;margin:0;padding:16px} section{margin:12px 0;padding:8px;border:1px solid #ccc}\
         h2{font-size:1.4em} .row{display:flex;gap:8px} .row div{flex:1;padding:4px;background:#f4f4f4}\
         ul{padding-left:24px} input{width:200px} .muted{color:#666} @media (max-width:600px){.row{display:block}}\
         </style></head><body><h1>Performance fixture</h1><nav><a href='#a'>A</a> <a href='#b'>B</a></nav>",
    );
    for i in 0..sections {
        html.push_str(&format!(
            "<section id='s{i}'><h2>Section {i}</h2><p class='muted'>Paragraph {i} with <b>bold</b>, <i>italic</i> and a \
             <a href='/{i}'>link</a>. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\
             <div class='row'><div>Cell one</div><div>Cell two</div><div>Cell three</div></div>\
             <ul><li>Item one</li><li>Item two</li><li>Item three</li></ul>\
             <form><label for='i{i}'>Field {i}</label><input id='i{i}' value='v{i}'><button>Go</button></form></section>"
        ));
    }
    html.push_str("</body></html>");
    html
}

fn summarize(timer: &StageTimer, stage: Stage) -> Option<StageSummary> {
    let mut v: Vec<u64> = timer
        .samples()
        .iter()
        .filter(|s| s.stage == stage)
        .map(|s| s.micros)
        .collect();
    if v.is_empty() {
        return None;
    }
    v.sort_unstable();
    let sum: u64 = v.iter().sum();
    Some(StageSummary {
        stage,
        samples: v.len(),
        min_us: v[0],
        p50_us: v[v.len() / 2],
        mean_us: sum / v.len() as u64,
        max_us: v[v.len() - 1],
    })
}

fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .with_writer(std::io::stderr)
        .init();
    let args = Args::parse();
    let (input, html) = match &args.input {
        Some(path) => (
            path.display().to_string(),
            std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?,
        ),
        None => (
            format!("<generated fixture, {} sections>", args.fixture_sections),
            fixture(args.fixture_sections),
        ),
    };
    let viewport = Size::new(args.width, args.height);
    let mut timer = StageTimer::new();
    let mut layout_engine = LayoutEngine::new();
    let (mut nodes, mut snapshot_nodes, mut display_items) = (0, 0, 0);

    for _ in 0..args.iterations.max(1) {
        let doc = timer.time(Stage::Parse, || ve_html::parse_document(&html).document);
        let styles = timer.time(Stage::Style, || {
            let mut engine = StyleEngine::new();
            engine.media = MediaEnv::screen(viewport.width, viewport.height);
            engine.add_document_styles(&doc);
            engine.compute(&doc)
        });
        let layout = timer.time(Stage::Layout, || {
            layout_engine.layout(&doc, &styles, viewport)
        });
        let snapshot = timer.time(Stage::Snapshot, || {
            let bounds = |id| layout.rect_of(id);
            let tree = AccessibilityTree::build(
                &doc,
                &BuildOptions {
                    styles: Some(&styles),
                    bounds: Some(&bounds),
                    focused: None,
                },
            );
            SemanticSnapshot::capture(&tree, SnapshotFormat::Compact)
        });
        let list = timer.time(Stage::Paint, || DisplayList::from_layout(&layout, &styles));
        nodes = doc.node_count();
        snapshot_nodes = snapshot.nodes.len();
        display_items = list.len();
    }

    let report = Report {
        engine_version: ve_api::VERSION,
        input,
        iterations: args.iterations,
        viewport,
        nodes,
        snapshot_nodes,
        display_items,
        stages: Stage::ALL
            .iter()
            .filter_map(|s| summarize(&timer, *s))
            .collect(),
        samples: timer.samples().to_vec(),
    };
    let json = serde_json::to_string_pretty(&report)?;
    match &args.out {
        Some(path) => {
            std::fs::write(path, json).with_context(|| format!("writing {}", path.display()))?
        }
        None => println!("{json}"),
    }
    for s in &report.stages {
        eprintln!(
            "{:<9} p50 {:>8} us  mean {:>8} us  max {:>8} us",
            s.stage, s.p50_us, s.mean_us, s.max_us
        );
    }
    Ok(())
}

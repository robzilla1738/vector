//! Performance harness for the engine's agent path (architecture §12).
//!
//! Runs the static fixture corpus (`engine/fixtures/static/*.html`) through
//! the public facade on a warm engine, `N` iterations per metric, and reports
//! p50 / p95 / max microseconds per fixture and pooled across fixtures.
//! `--gate m1` compares the pooled p95 against the M1 acceptance gates and
//! exits non-zero when one is exceeded:
//!
//! | metric | what is timed | M1 p95 gate |
//! |---|---|---|
//! | `observe` | `observe()` (Compact, defaults) incl. `settle()` | 5 ms |
//! | `open_to_observe` | `open(file:)` → `observe()` → `close()` | 50 ms |
//! | `click_step` | one-step `click` program incl. `settle()` | 2 ms |
//! | `fill_step` | one-step `fill` program incl. `settle()` | 2 ms |
//! | `program_10` | a 10-step program (fill/type/check/press/scroll/select/extract/click) | 20 ms |
//! | `diff_after_edit` | `changes_between` of two Compact observations after one field edit | 0.5 ms |
//!
//! Build with `--release`; debug numbers are several times slower.

use std::path::{Path, PathBuf};
use std::time::Instant;

use anyhow::{Context, Result, bail};
use clap::Parser;
use serde::Serialize;
use serde_json::{Value, json};
use ve_api::{
    EngineConfig, ExecuteRequest, NativeBrowser, NativeEvent, NetworkPolicy, ObservationContent,
    ObservationRequest, OpenRequest, PageId, Program, ScrollPhase, VectorEngine,
};
use ve_core::Size;

/// Command line options.
#[derive(Parser, Debug)]
#[command(
    name = "perf",
    about = "Times the Vector Engine agent path over the static fixture corpus"
)]
struct Args {
    /// Fixture directory (default: `engine/fixtures/static` next to this tool).
    #[arg(long)]
    fixtures: Option<PathBuf>,
    /// A single HTML file to measure instead of the corpus.
    #[arg(long)]
    input: Option<PathBuf>,
    /// Timed iterations per metric and fixture.
    #[arg(long, default_value_t = 200)]
    iterations: u32,
    /// Warm-up iterations (not reported).
    #[arg(long, default_value_t = 10)]
    warmup: u32,
    /// Milestone gate to enforce (`m1`).
    #[arg(long)]
    gate: Option<String>,
    /// Report gate failures but exit 0.
    #[arg(long)]
    no_fail: bool,
    /// Viewport width in CSS pixels.
    #[arg(long, default_value_t = 1280.0)]
    width: f32,
    /// Viewport height in CSS pixels.
    #[arg(long, default_value_t = 720.0)]
    height: f32,
    /// Write the JSON report here instead of stdout.
    #[arg(long)]
    out: Option<PathBuf>,
    /// Replay input JSON and print a frame trace (`H0-A1`).
    #[arg(long)]
    frames: bool,
}

const METRICS: [&str; 6] = [
    "observe",
    "open_to_observe",
    "click_step",
    "fill_step",
    "program_10",
    "diff_after_edit",
];

fn m1_gate_us(metric: &str) -> Option<u64> {
    Some(match metric {
        "observe" => 5_000,
        "open_to_observe" => 50_000,
        "click_step" | "fill_step" => 2_000,
        "program_10" => 20_000,
        "diff_after_edit" => 500,
        _ => return None,
    })
}

#[derive(Serialize, Clone)]
struct Summary {
    samples: usize,
    p50_us: u64,
    p95_us: u64,
    max_us: u64,
}

fn summarize(samples: &[u64]) -> Summary {
    let mut v = samples.to_vec();
    v.sort_unstable();
    let rank = |p: f64| -> u64 {
        if v.is_empty() {
            return 0;
        }
        let idx = ((p * v.len() as f64).ceil() as usize).clamp(1, v.len()) - 1;
        v[idx]
    };
    Summary {
        samples: v.len(),
        p50_us: rank(0.50),
        p95_us: rank(0.95),
        max_us: v.last().copied().unwrap_or(0),
    }
}

#[derive(Serialize)]
struct FixtureReport {
    name: String,
    bytes: usize,
    nodes: usize,
    elements: usize,
    approx_tokens: usize,
    route_reason: String,
    targets: Value,
    metrics: std::collections::BTreeMap<String, Summary>,
}

#[derive(Serialize)]
struct GateResult {
    metric: String,
    gate_us: u64,
    p95_us: u64,
    pass: bool,
}

#[derive(Serialize)]
struct Report {
    engine_version: &'static str,
    profile: &'static str,
    backend: &'static str,
    security_mode: &'static str,
    os: String,
    arch: &'static str,
    rss_bytes: Option<u64>,
    host_package_energy_uj: Option<u64>,
    iterations: u32,
    viewport: Size,
    fixtures: Vec<FixtureReport>,
    pooled: std::collections::BTreeMap<String, Summary>,
    layout_100: Option<Summary>,
    gate: Option<String>,
    gates: Vec<GateResult>,
    all_gates_pass: bool,
}

/// Targets chosen from the fixture's first observation.
struct Targets {
    /// A control whose activation stays on the page (checkbox, radio, summary).
    click: Option<String>,
    /// A text-like field.
    text: Option<String>,
    /// A `<select>`.
    select: Option<String>,
}

fn pick_targets(content: &ObservationContent) -> Targets {
    let by_role = |roles: &[&str]| {
        content
            .elements
            .iter()
            .find(|e| {
                e.role.as_deref().is_some_and(|r| roles.contains(&r)) && e.disabled != Some(true)
            })
            .map(|e| e.reference.clone())
    };
    let click = by_role(&["checkbox"])
        .or_else(|| by_role(&["radio"]))
        .or_else(|| {
            content
                .elements
                .iter()
                .find(|e| e.tag == "summary")
                .map(|e| e.reference.clone())
        })
        .or_else(|| {
            content
                .elements
                .iter()
                .find(|e| {
                    e.tag == "button"
                        && e.type_.as_deref() == Some("button")
                        && e.disabled != Some(true)
                })
                .map(|e| e.reference.clone())
        });
    let text = content
        .form_fields
        .iter()
        .find(|f| {
            matches!(
                f.type_.as_str(),
                "text" | "search" | "email" | "tel" | "textarea" | "url"
            )
        })
        .map(|f| f.reference.clone());
    let select = content
        .form_fields
        .iter()
        .find(|f| f.type_ == "select" || f.type_ == "select-one")
        .map(|f| f.reference.clone());
    Targets {
        click,
        text,
        select,
    }
}

fn one_step(op: &str, target: &str, extra: Value) -> Program {
    let mut step = json!({ "id": "s1", "op": op, "target": target });
    if let Some(obj) = extra.as_object() {
        for (k, v) in obj {
            step[k] = v.clone();
        }
    }
    Program::from_value(json!([step])).expect("valid step")
}

fn push_step(steps: &mut Vec<Value>, mut step: Value) {
    step["id"] = json!(format!("s{}", steps.len() + 1));
    steps.push(step);
}

fn ten_step_program(t: &Targets, iteration: u32) -> Program {
    let mut steps: Vec<Value> = Vec::new();
    if let Some(text) = &t.text {
        push_step(
            &mut steps,
            json!({ "op": "fill", "target": text, "value": format!("perf {iteration}") }),
        );
        push_step(
            &mut steps,
            json!({ "op": "type", "target": text, "value": " more" }),
        );
    }
    if let Some(click) = &t.click {
        push_step(&mut steps, json!({ "op": "check", "target": click }));
        push_step(&mut steps, json!({ "op": "uncheck", "target": click }));
    }
    push_step(&mut steps, json!({ "op": "press", "key": "Tab" }));
    push_step(&mut steps, json!({ "op": "scroll", "direction": "down" }));
    if let Some(click) = &t.click {
        push_step(&mut steps, json!({ "op": "hover", "target": click }));
    }
    push_step(
        &mut steps,
        json!({ "op": "extract", "fields": [{ "name": "title", "selector": "h1" }] }),
    );
    push_step(&mut steps, json!({ "op": "scroll", "direction": "top" }));
    if let Some(click) = &t.click {
        push_step(&mut steps, json!({ "op": "click", "target": click }));
    }
    while steps.len() < 10 {
        push_step(
            &mut steps,
            json!({ "op": "scroll", "direction": "down", "amount": 40 }),
        );
    }
    steps.truncate(10);
    Program::from_value(Value::Array(steps)).expect("valid program")
}

fn time_us(f: impl FnOnce()) -> u64 {
    let start = Instant::now();
    f();
    u64::try_from(start.elapsed().as_micros()).unwrap_or(u64::MAX)
}

fn run_program(engine: &mut VectorEngine, page: PageId, program: &Program) -> Result<()> {
    let result = engine
        .execute(
            page,
            &ExecuteRequest {
                program: program.clone(),
                return_observation: None,
            },
        )?
        .result;
    if !result.ok() {
        let failure = result.first_failure().and_then(|s| s.error.clone());
        bail!(
            "program failed: {} ({failure:?})",
            result.error.unwrap_or_default()
        );
    }
    Ok(())
}

fn measure_fixture(
    engine: &mut VectorEngine,
    path: &Path,
    iterations: u32,
    warmup: u32,
) -> Result<FixtureReport> {
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();
    let url = url::Url::from_file_path(path.canonicalize()?)
        .map_err(|()| anyhow::anyhow!("{}: not an absolute path", path.display()))?
        .to_string();
    let bytes = std::fs::metadata(path)?.len() as usize;
    let request = ObservationRequest::default();
    let mut metrics: std::collections::BTreeMap<String, Vec<u64>> = METRICS
        .iter()
        .map(|m| ((*m).to_owned(), Vec::with_capacity(iterations as usize)))
        .collect();

    // Warm-up and target discovery.
    let mut first: Option<(ObservationContent, usize, String)> = None;
    for _ in 0..warmup.max(1) {
        let opened = engine.open(OpenRequest::url(&url))?;
        let obs = engine.observe(opened.page, &request)?.observation.content;
        if first.is_none() {
            let nodes = engine.page(opened.page)?.document().node_count();
            first = Some((obs, nodes, opened.routing.route_reason.clone()));
        }
        engine.close(opened.page);
    }
    let (content, nodes, route_reason) = first.expect("warm-up ran");
    let targets = pick_targets(&content);

    // open_to_observe: cold page on a warm engine.
    for _ in 0..iterations {
        let mut page = None;
        let us = time_us(|| {
            let opened = engine.open(OpenRequest::url(&url)).expect("open");
            let _ = engine.observe(opened.page, &request).expect("observe");
            page = Some(opened.page);
        });
        if let Some(p) = page {
            engine.close(p);
        }
        metrics.get_mut("open_to_observe").unwrap().push(us);
    }

    // The remaining metrics run on one long-lived page.
    let page = engine.open(OpenRequest::url(&url))?.page;
    for _ in 0..iterations {
        let us = time_us(|| {
            engine.observe(page, &request).expect("observe");
        });
        metrics.get_mut("observe").unwrap().push(us);
    }

    if let Some(click) = &targets.click {
        let program = one_step("click", click, json!({}));
        run_program(engine, page, &program).with_context(|| format!("{name}: click warm-up"))?;
        for _ in 0..iterations {
            let us = time_us(|| run_program(engine, page, &program).expect("click"));
            metrics.get_mut("click_step").unwrap().push(us);
        }
    }

    if let Some(text) = &targets.text {
        for i in 0..iterations {
            let program = one_step("fill", text, json!({ "value": format!("perf {i}") }));
            let us = time_us(|| run_program(engine, page, &program).expect("fill"));
            metrics.get_mut("fill_step").unwrap().push(us);
        }

        // diff_after_edit: two Compact observations around one field edit.
        let before = engine.observe(page, &request)?.observation.content;
        run_program(
            engine,
            page,
            &one_step("fill", text, json!({ "value": "edited value" })),
        )?;
        let after = engine.observe(page, &request)?.observation.content;
        for _ in 0..iterations {
            let us = time_us(|| {
                let (lines, _delta) = ve_a11y::changes_between(&before, &after);
                std::hint::black_box(lines);
            });
            metrics.get_mut("diff_after_edit").unwrap().push(us);
        }
    }

    let program = ten_step_program(&targets, 0);
    run_program(engine, page, &program).with_context(|| format!("{name}: 10-step warm-up"))?;
    for i in 0..iterations {
        let program = ten_step_program(&targets, i);
        let us = time_us(|| run_program(engine, page, &program).expect("program"));
        metrics.get_mut("program_10").unwrap().push(us);
    }
    engine.close(page);

    Ok(FixtureReport {
        name,
        bytes,
        nodes,
        elements: content.elements.len(),
        approx_tokens: content.stats.approx_tokens,
        route_reason,
        targets: json!({ "click": targets.click, "text": targets.text, "select": targets.select }),
        metrics: metrics
            .iter()
            .filter(|(_, v)| !v.is_empty())
            .map(|(k, v)| (k.clone(), summarize(v)))
            .collect(),
    })
}

fn default_fixtures_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/static")
}

fn measure_layout_list(
    engine: &mut VectorEngine,
    n: usize,
    iterations: u32,
    warmup: u32,
) -> Result<Summary> {
    let items: String = (0..n).map(|i| format!("<li>item {i}</li>")).collect();
    let html = format!("<!doctype html><title>todo</title><ul id=list>{items}</ul>");
    let mut samples = Vec::new();
    for i in 0..(warmup + iterations) {
        let started = Instant::now();
        let opened = engine.open(OpenRequest::html(&html, Some("https://speedometer.test/")))?;
        let _ = engine.observe(opened.page, &ObservationRequest::default())?;
        engine.close(opened.page);
        if i >= warmup {
            samples.push(u64::try_from(started.elapsed().as_micros()).unwrap_or(u64::MAX));
        }
    }
    Ok(summarize(&samples))
}

fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .with_writer(std::io::stderr)
        .init();
    let args = Args::parse();
    if args.frames {
        return run_frames(&args);
    }
    let paths: Vec<PathBuf> = match &args.input {
        Some(p) => vec![p.clone()],
        None => {
            let dir = args.fixtures.clone().unwrap_or_else(default_fixtures_dir);
            let mut v: Vec<PathBuf> = std::fs::read_dir(&dir)
                .with_context(|| format!("reading {}", dir.display()))?
                .filter_map(|e| e.ok().map(|e| e.path()))
                .filter(|p| p.extension().is_some_and(|x| x == "html"))
                .collect();
            v.sort();
            if v.is_empty() {
                bail!("no .html fixtures in {}", dir.display());
            }
            v
        }
    };
    let viewport = Size::new(args.width, args.height);
    let mut engine = VectorEngine::new(EngineConfig {
        viewport,
        offline: true,
        policy: NetworkPolicy::permissive(),
        ..EngineConfig::default()
    });

    let mut fixtures = Vec::new();
    for path in &paths {
        let report = measure_fixture(&mut engine, path, args.iterations.max(1), args.warmup)
            .with_context(|| format!("measuring {}", path.display()))?;
        eprintln!(
            "{:<26} nodes {:>5} elements {:>3} tokens {:>4} route {}",
            report.name, report.nodes, report.elements, report.approx_tokens, report.route_reason
        );
        for (metric, s) in &report.metrics {
            eprintln!(
                "    {:<17} p50 {:>8} us  p95 {:>8} us  max {:>8} us",
                metric, s.p50_us, s.p95_us, s.max_us
            );
        }
        fixtures.push(report);
    }
    // Pooled across fixtures: the pooled p95 is the worst per-fixture p95
    // (the conservative reading of "p95 on fixtures"), p50 the median of
    // per-fixture p50s.
    let pooled: std::collections::BTreeMap<String, Summary> = fixtures
        .iter()
        .flat_map(|f| f.metrics.iter())
        .fold(
            std::collections::BTreeMap::<String, Vec<&Summary>>::new(),
            |mut acc, (k, s)| {
                acc.entry(k.clone()).or_default().push(s);
                acc
            },
        )
        .into_iter()
        .map(|(k, list)| {
            let mut p50s: Vec<u64> = list.iter().map(|s| s.p50_us).collect();
            p50s.sort_unstable();
            (
                k,
                Summary {
                    samples: list.iter().map(|s| s.samples).sum(),
                    p50_us: p50s[p50s.len() / 2],
                    p95_us: list.iter().map(|s| s.p95_us).max().unwrap_or(0),
                    max_us: list.iter().map(|s| s.max_us).max().unwrap_or(0),
                },
            )
        })
        .collect();

    let layout_iters = args.iterations.clamp(1, 30);
    let layout_100 = measure_layout_list(&mut engine, 100, layout_iters, args.warmup.min(5))?;
    eprintln!(
        "layout_100            p50 {:>8} us  p95 {:>8} us  max {:>8} us",
        layout_100.p50_us, layout_100.p95_us, layout_100.max_us
    );

    let mut gates = Vec::new();
    if let Some(gate) = &args.gate {
        if gate != "m1" {
            bail!("unknown gate {gate:?} (supported: m1)");
        }
        for metric in METRICS {
            let Some(gate_us) = m1_gate_us(metric) else {
                continue;
            };
            let p95_us = pooled.get(metric).map_or(u64::MAX, |s| s.p95_us);
            gates.push(GateResult {
                metric: metric.to_owned(),
                gate_us,
                p95_us,
                pass: p95_us <= gate_us,
            });
        }
    }
    let all_gates_pass = gates.iter().all(|g| g.pass);
    let report = Report {
        engine_version: ve_api::VERSION,
        profile: if cfg!(debug_assertions) {
            "debug"
        } else {
            "release"
        },
        backend: "vector-engine",
        security_mode: "production",
        os: std::env::consts::OS.to_owned(),
        arch: std::env::consts::ARCH,
        rss_bytes: ve_core::process_rss_bytes(),
        host_package_energy_uj: ve_core::host_package_energy_uj(),
        iterations: args.iterations,
        viewport,
        fixtures,
        pooled,
        layout_100: Some(layout_100),
        gate: args.gate.clone(),
        gates,
        all_gates_pass,
    };

    eprintln!(
        "\n{:<17} {:>10} {:>10} {:>10}",
        "pooled", "p50 us", "p95 us", "max us"
    );
    for (metric, s) in &report.pooled {
        eprintln!(
            "{:<17} {:>10} {:>10} {:>10}",
            metric, s.p50_us, s.p95_us, s.max_us
        );
    }
    if !report.gates.is_empty() {
        eprintln!("\ngate {}:", report.gate.as_deref().unwrap_or(""));
        for g in &report.gates {
            eprintln!(
                "  {:<17} p95 {:>8} us  gate {:>8} us  {}",
                g.metric,
                g.p95_us,
                g.gate_us,
                if g.pass { "PASS" } else { "FAIL" }
            );
        }
    }
    if report.profile == "debug" {
        eprintln!("\nnote: debug build — run with --release for gate numbers");
    }

    let json = serde_json::to_string_pretty(&report)?;
    match &args.out {
        Some(path) => {
            std::fs::write(path, json).with_context(|| format!("writing {}", path.display()))?
        }
        None => println!("{json}"),
    }
    if !all_gates_pass && !args.no_fail {
        std::process::exit(1);
    }
    Ok(())
}

fn run_frames(args: &Args) -> Result<()> {
    let html = args.input.as_ref().map_or_else(
        || {
            Ok::<String, anyhow::Error>(
                "<html><body style='height:4000px'>scroll</body></html>".into(),
            )
        },
        |p| std::fs::read_to_string(p).map_err(Into::into),
    )?;
    let mut browser = NativeBrowser::with_config(EngineConfig {
        viewport: Size::new(args.width, args.height),
        offline: true,
        ..EngineConfig::default()
    });
    browser.handle_event(NativeEvent::NewTab {
        html,
        url: "about:blank".into(),
    })?;
    let _ = browser.present();
    let before = browser.from_layout_calls();
    for _ in 0..8 {
        browser.handle_event(NativeEvent::Wheel {
            dx: 0.0,
            dy: 40.0,
            phase: ScrollPhase::Changed,
        })?;
        let _ = browser.present();
    }
    let after = browser.from_layout_calls();
    let report = json!({
        "security_mode": "production",
        "fromLayoutBeforeScroll": before,
        "fromLayoutAfterScroll": after,
        "fromLayoutDuringScroll": after.saturating_sub(before),
    });
    let json = serde_json::to_string_pretty(&report)?;
    match &args.out {
        Some(path) => std::fs::write(path, json)?,
        None => println!("{json}"),
    }
    Ok(())
}

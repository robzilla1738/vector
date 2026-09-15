//! Web Platform Tests geometry runner (architecture §12).
//!
//! Walks a WPT checkout and runs every **reftest** through the engine's own
//! parser, cascade and layout with the deterministic [`MetricShaper`]. A
//! reftest passes when the *geometry signature* of the test document matches
//! that of one of its `<link rel="match">` references within a tolerance:
//! the multiset of painted boxes (visible rectangle, background colour,
//! border widths) and text fragments (visible rectangle, text) in paint
//! order. Pixels are never rasterised; this is exactly the information the
//! semantic snapshot consumes, so it is what conformance is measured on.
//!
//! Tests without a reference (`testharness.js` tests, which need script) are
//! reported as `NOTRUN`; `rel="mismatch"`-only and `-manual` tests are
//! `SKIP`; a panic anywhere in the pipeline is `ERROR`.
//!
//! The per-milestone manifest (`engine/conformance/m1.txt`) lists the tests
//! that must pass. It only grows: `--update-manifest` appends new passes; a
//! manifest test that no longer passes is a regression and makes the runner
//! exit non-zero.
//!
//! [`MetricShaper`]: ve_layout::MetricShaper

use std::collections::{BTreeMap, BTreeSet};
use std::panic::{AssertUnwindSafe, catch_unwind};
use std::path::{Path, PathBuf};
use std::time::Instant;

use anyhow::{Context, Result};
use clap::Parser;
use serde::Serialize;
use ve_core::{Rect, Size};
use ve_dom::Document;
use ve_layout::{LayoutEngine, LayoutTree};
use ve_style::{MediaEnv, StyleEngine, StyleTree, Visibility};

/// The M1 WPT subsets (architecture §12), relative to the checkout root.
const M1_SUBSETS: &[&str] = &[
    "css/CSS2/normal-flow",
    "css/CSS2/box-display",
    "css/CSS2/positioning",
    "css/css-flexbox",
    "css/css-grid/alignment",
    "css/selectors",
    "css/mediaqueries",
    "accname",
    "html-aam",
];

/// Command line options.
#[derive(Parser, Debug)]
#[command(
    name = "wpt-runner",
    about = "Runs WPT reftests through the Vector Engine, comparing fragment geometry"
)]
struct Args {
    /// Path to a WPT checkout (sparse is fine).
    #[arg(long)]
    wpt_dir: PathBuf,
    /// Subdirectories (relative to the checkout) to run; defaults to the M1 set.
    #[arg(long)]
    subdir: Vec<String>,
    /// Only run tests whose path contains this substring.
    #[arg(long)]
    filter: Option<String>,
    /// Write the JSON report here instead of stdout.
    #[arg(long)]
    out: Option<PathBuf>,
    /// List matching tests without running them.
    #[arg(long)]
    list: bool,
    /// Stop after this many tests.
    #[arg(long)]
    limit: Option<usize>,
    /// Manifest of tests that must pass.
    #[arg(long, default_value = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/m1.txt"))]
    manifest: PathBuf,
    /// Append newly passing tests to the manifest.
    #[arg(long)]
    update_manifest: bool,
    /// Geometry tolerance in CSS pixels.
    #[arg(long, default_value_t = 1.0)]
    tolerance: f32,
    /// Viewport as `WIDTHxHEIGHT`.
    #[arg(long, default_value = "800x600")]
    viewport: String,
    /// Print the differing signature items of failing tests.
    #[arg(long)]
    verbose: bool,
    /// Print each test path before running it.
    #[arg(long)]
    progress: bool,
    /// Per-test wall-clock limit in seconds (a test exceeding it is `TIMEOUT`).
    #[arg(long, default_value_t = 20)]
    timeout_secs: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, PartialOrd, Ord)]
#[serde(rename_all = "UPPERCASE")]
enum Status {
    Pass,
    Fail,
    NotRun,
    Skip,
    Error,
    Timeout,
}

#[derive(Serialize)]
struct TestResult {
    /// Path relative to the checkout root, with `/` separators.
    path: String,
    status: Status,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    references: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    detail: Option<String>,
    duration_ms: u64,
}

#[derive(Serialize, Default)]
struct Counts {
    total: usize,
    pass: usize,
    fail: usize,
    notrun: usize,
    skip: usize,
    error: usize,
    timeout: usize,
}

impl Counts {
    fn add(&mut self, status: Status) {
        self.total += 1;
        match status {
            Status::Pass => self.pass += 1,
            Status::Fail => self.fail += 1,
            Status::NotRun => self.notrun += 1,
            Status::Skip => self.skip += 1,
            Status::Error => self.error += 1,
            Status::Timeout => self.timeout += 1,
        }
    }
}

#[derive(Serialize)]
struct ManifestReport {
    path: String,
    size: usize,
    /// Manifest tests in this run that did not pass.
    regressions: Vec<String>,
    /// Passing tests not (yet) in the manifest.
    new_passes: usize,
    updated: bool,
}

#[derive(Serialize)]
struct Report {
    wpt_dir: String,
    viewport: String,
    tolerance: f32,
    totals: Counts,
    per_dir: BTreeMap<String, Counts>,
    manifest: ManifestReport,
    results: Vec<TestResult>,
}

const SKIP_DIRS: &[&str] = &[
    "resources",
    "support",
    "tools",
    "common",
    "fonts",
    "images",
    "interfaces",
    "reference",
    ".git",
    "conformance-checkers",
];

const TEST_EXTENSIONS: &[&str] = &["html", "htm", "xht", "xhtml"];

fn has_test_ext(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| TEST_EXTENSIONS.iter().any(|t| e.eq_ignore_ascii_case(t)))
}

fn collect_tests(dir: &Path, out: &mut Vec<PathBuf>) -> Result<()> {
    let mut entries: Vec<_> = std::fs::read_dir(dir)
        .with_context(|| format!("reading {}", dir.display()))?
        .collect::<std::io::Result<_>>()?;
    entries.sort_by_key(std::fs::DirEntry::path);
    for entry in entries {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().into_owned();
        if path.is_dir() {
            if !SKIP_DIRS.contains(&name.as_str()) {
                collect_tests(&path, out)?;
            }
        } else if has_test_ext(&path) && !is_reference_name(&name) {
            out.push(path);
        }
    }
    Ok(())
}

/// Reference files are named `*-ref.*`, `*-ref-NNN.*` or `*-notref*`.
fn is_reference_name(name: &str) -> bool {
    let stem = name.rsplit_once('.').map_or(name, |(s, _)| s);
    stem.ends_with("-ref")
        || stem.contains("-ref-")
        || stem.contains("-notref")
        || stem.ends_with("-reference")
}

fn rel_path(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .components()
        .map(|c| c.as_os_str().to_string_lossy().into_owned())
        .collect::<Vec<_>>()
        .join("/")
}

/// The reporting group of a test: the longest matching M1 subset, else its
/// first two path components.
fn group_of(rel: &str) -> String {
    M1_SUBSETS
        .iter()
        .filter(|s| rel.starts_with(&format!("{s}/")))
        .max_by_key(|s| s.len())
        .map_or_else(
            || rel.split('/').take(2).collect::<Vec<_>>().join("/"),
            |s| (*s).to_owned(),
        )
}

/// Parses `WIDTHxHEIGHT`.
fn parse_viewport(s: &str) -> Result<Size> {
    let (w, h) = s
        .split_once('x')
        .with_context(|| format!("viewport `{s}` is not WIDTHxHEIGHT"))?;
    Ok(Size::new(w.trim().parse()?, h.trim().parse()?))
}

/// A laid-out document.
struct Rendered {
    doc: Document,
    styles: StyleTree,
    layout: LayoutTree,
}

fn render(html: &str, viewport: Size) -> Rendered {
    let doc = ve_html::parse_document(html).document;
    let mut engine = StyleEngine::new();
    engine.media = MediaEnv::screen(viewport.width, viewport.height);
    engine.add_document_styles(&doc);
    let styles = engine.compute(&doc);
    let layout = LayoutEngine::new().layout(&doc, &styles, viewport);
    Rendered {
        doc,
        styles,
        layout,
    }
}

/// `<link rel="match|mismatch" href>` references of a parsed test document.
fn references(r: &Rendered) -> (Vec<String>, Vec<String>) {
    let mut matches = Vec::new();
    let mut mismatches = Vec::new();
    for id in r.doc.elements() {
        if !r.doc.element(id).is_some_and(|e| e.is_html("link")) {
            continue;
        }
        let Some(rel) = r.doc.attribute(id, "rel") else {
            continue;
        };
        let Some(href) = r.doc.attribute(id, "href") else {
            continue;
        };
        let tokens: Vec<String> = rel
            .split_ascii_whitespace()
            .map(str::to_ascii_lowercase)
            .collect();
        if tokens.iter().any(|t| t == "match") {
            matches.push(href.to_owned());
        } else if tokens.iter().any(|t| t == "mismatch") {
            mismatches.push(href.to_owned());
        }
    }
    (matches, mismatches)
}

/// One element of a geometry signature.
#[derive(Clone, Debug, PartialEq)]
enum Item {
    /// A painted box: visible rectangle, background colour, border widths.
    Box {
        rect: Rect,
        color: [u8; 4],
        borders: [f32; 4],
    },
    /// A text fragment: visible rectangle and its text.
    Text { rect: Rect, text: String },
}

impl Item {
    fn rect(&self) -> Rect {
        match self {
            Item::Box { rect, .. } | Item::Text { rect, .. } => *rect,
        }
    }

    /// Sort key: kind, then quantised position and size.
    fn key(&self) -> (u8, i64, i64, i64, i64, String) {
        let q = |v: f32| (v * 2.0).round() as i64;
        let r = self.rect();
        let (kind, extra) = match self {
            Item::Box { color, borders, .. } => (0, format!("{color:?}{borders:?}")),
            Item::Text { text, .. } => (1, text.clone()),
        };
        (kind, q(r.y()), q(r.x()), q(r.width()), q(r.height()), extra)
    }

    fn matches(&self, other: &Item, tolerance: f32) -> bool {
        let close = |a: Rect, b: Rect| {
            (a.x() - b.x()).abs() <= tolerance
                && (a.y() - b.y()).abs() <= tolerance
                && (a.width() - b.width()).abs() <= tolerance
                && (a.height() - b.height()).abs() <= tolerance
        };
        match (self, other) {
            (
                Item::Box {
                    rect: a,
                    color: ca,
                    borders: ba,
                },
                Item::Box {
                    rect: b,
                    color: cb,
                    borders: bb,
                },
            ) => {
                close(*a, *b)
                    && ca == cb
                    && ba.iter().zip(bb).all(|(x, y)| (x - y).abs() <= tolerance)
            }
            (Item::Text { rect: a, text: ta }, Item::Text { rect: b, text: tb }) => {
                close(*a, *b) && ta == tb
            }
            _ => false,
        }
    }
}

fn rgba(c: ve_style::Rgba) -> [u8; 4] {
    [c.r, c.g, c.b, (c.a * 255.0).round() as u8]
}

/// Builds the geometry signature of a rendered document.
fn signature(r: &Rendered) -> Vec<Item> {
    let viewport = Rect::new(0.0, 0.0, r.layout.viewport.width, r.layout.viewport.height);
    let mut items = Vec::new();
    for item in r.layout.paint_order() {
        let Some(node) = item.node else { continue };
        let style = r.styles.style(node);
        if style.visibility != Visibility::Visible || style.opacity <= 0.0 {
            continue;
        }
        let clip = r.layout.clip_of(node);
        let visible = match clip {
            Some(c) => item.rect.intersection(&c),
            None => Some(item.rect),
        };
        let Some(visible) = visible.and_then(|v| v.intersection(&viewport)) else {
            continue;
        };
        if let Some(text) = item.text.clone() {
            if text.trim().is_empty() {
                continue;
            }
            let color = style.color;
            let bg = style.background_color.resolve(style.color);
            if color.a <= 0.0 || (color == bg && !bg.is_transparent()) {
                continue;
            }
            items.push(Item::Text {
                rect: visible,
                text,
            });
            continue;
        }
        let bg = style.background_color.resolve(style.color);
        let borders = [
            style.border_top(),
            style.border_right(),
            style.border_bottom(),
            style.border_left(),
        ];
        let has_border = borders.iter().any(|b| *b > 0.0)
            && !style.border_top_color.resolve(style.color).is_transparent();
        if bg.is_transparent() && !has_border {
            continue;
        }
        if visible.width() <= 0.0 || visible.height() <= 0.0 {
            continue;
        }
        items.push(Item::Box {
            rect: visible,
            color: if bg.is_transparent() {
                [0; 4]
            } else {
                rgba(bg)
            },
            borders: if has_border { borders } else { [0.0; 4] },
        });
    }
    items.sort_by_key(Item::key);
    items
}

/// Compares two signatures; returns a description of the first difference.
fn compare(test: &[Item], reference: &[Item], tolerance: f32) -> Option<String> {
    if test.len() != reference.len() {
        return Some(format!(
            "{} painted items in test, {} in reference",
            test.len(),
            reference.len()
        ));
    }
    // Greedy matching within tolerance (items are sorted, so a local search
    // suffices for the small jitter tolerance allows).
    let mut used = vec![false; reference.len()];
    for t in test {
        let window = 8;
        let start = reference
            .binary_search_by_key(&t.key(), Item::key)
            .unwrap_or_else(|i| i)
            .saturating_sub(window);
        let end = (start + 2 * window + 1).min(reference.len());
        let found = (start..end).find(|&i| !used[i] && t.matches(&reference[i], tolerance));
        match found {
            Some(i) => used[i] = true,
            None => return Some(format!("no reference item matches {t:?}")),
        }
    }
    None
}

fn resolve_reference(wpt_dir: &Path, test: &Path, href: &str) -> PathBuf {
    let href = href.split(['#', '?']).next().unwrap_or(href);
    if let Some(abs) = href.strip_prefix('/') {
        wpt_dir.join(abs)
    } else {
        test.parent()
            .map_or_else(|| PathBuf::from(href), |p| p.join(href))
    }
}

struct Runner {
    wpt_dir: PathBuf,
    viewport: Size,
    tolerance: f32,
    verbose: bool,
}

impl Runner {
    fn render_file(&self, path: &Path) -> Result<Rendered, String> {
        let html = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        if html.len() > 512 * 1024 {
            return Err("file too large".into());
        }
        let viewport = self.viewport;
        catch_unwind(AssertUnwindSafe(|| render(&html, viewport)))
            .map_err(|_| "panic during parse/style/layout".to_owned())
    }

    fn run_test(&self, path: &Path) -> TestResult {
        let start = Instant::now();
        let rel = rel_path(&self.wpt_dir, path);
        let finish = |status, references, detail: Option<String>| TestResult {
            path: rel.clone(),
            status,
            references,
            detail,
            duration_ms: u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX),
        };
        if rel.contains("-manual") {
            return finish(Status::Skip, Vec::new(), Some("manual test".into()));
        }
        let test = match self.render_file(path) {
            Ok(r) => r,
            Err(e) => return finish(Status::Error, Vec::new(), Some(e)),
        };
        let (matches, mismatches) = references(&test);
        if matches.is_empty() {
            let detail = if mismatches.is_empty() {
                "no rel=match reference (testharness or visual test)"
            } else {
                "mismatch-only reference"
            };
            let status = if mismatches.is_empty() {
                Status::NotRun
            } else {
                Status::Skip
            };
            return finish(status, mismatches, Some(detail.into()));
        }
        let test_sig = match catch_unwind(AssertUnwindSafe(|| signature(&test))) {
            Ok(s) => s,
            Err(_) => return finish(Status::Error, matches, Some("panic in signature".into())),
        };
        let mut last_detail = None;
        let mut had_error = false;
        for href in &matches {
            let ref_path = resolve_reference(&self.wpt_dir, path, href);
            let reference = match self.render_file(&ref_path) {
                Ok(r) => r,
                Err(e) => {
                    had_error = true;
                    last_detail = Some(format!("{href}: {e}"));
                    continue;
                }
            };
            let ref_sig = match catch_unwind(AssertUnwindSafe(|| signature(&reference))) {
                Ok(s) => s,
                Err(_) => {
                    had_error = true;
                    last_detail = Some(format!("{href}: panic in signature"));
                    continue;
                }
            };
            match compare(&test_sig, &ref_sig, self.tolerance) {
                None => return finish(Status::Pass, matches, None),
                Some(diff) => {
                    if self.verbose {
                        eprintln!("FAIL {rel} vs {href}: {diff}");
                        eprintln!("  test:      {test_sig:?}");
                        eprintln!("  reference: {ref_sig:?}");
                    }
                    last_detail = Some(format!("{href}: {diff}"));
                }
            }
        }
        let status = if had_error && matches.len() == 1 {
            Status::Error
        } else {
            Status::Fail
        };
        finish(status, matches, last_detail)
    }
}

fn read_manifest(path: &Path) -> BTreeSet<String> {
    std::fs::read_to_string(path)
        .map(|s| {
            s.lines()
                .map(str::trim)
                .filter(|l| !l.is_empty() && !l.starts_with('#'))
                .map(str::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

fn write_manifest(path: &Path, tests: &BTreeSet<String>) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let mut out = String::from(
        "# WPT reftests that pass the Vector Engine geometry runner (engine/tools/wpt-runner).\n\
         # This manifest only grows: every test listed here must keep passing.\n",
    );
    for t in tests {
        out.push_str(t);
        out.push('\n');
    }
    std::fs::write(path, out).with_context(|| format!("writing {}", path.display()))
}

fn main() -> Result<()> {
    let args = Args::parse();
    let viewport = parse_viewport(&args.viewport)?;
    let subdirs: Vec<String> = if args.subdir.is_empty() {
        M1_SUBSETS.iter().map(|s| (*s).to_owned()).collect()
    } else {
        args.subdir.clone()
    };
    let mut tests = Vec::new();
    for sub in &subdirs {
        let dir = args.wpt_dir.join(sub);
        if dir.is_dir() {
            collect_tests(&dir, &mut tests)?;
        } else {
            eprintln!("warning: {} is not in the checkout", dir.display());
        }
    }
    if let Some(filter) = &args.filter {
        tests.retain(|p| rel_path(&args.wpt_dir, p).contains(filter.as_str()));
    }
    if let Some(limit) = args.limit {
        tests.truncate(limit);
    }
    if args.list {
        for t in &tests {
            println!("{}", rel_path(&args.wpt_dir, t));
        }
        return Ok(());
    }

    if !args.verbose {
        // Panics are reported per test; keep stderr readable.
        std::panic::set_hook(Box::new(|_| {}));
    }
    let runner = std::sync::Arc::new(Runner {
        wpt_dir: args.wpt_dir.clone(),
        viewport,
        tolerance: args.tolerance,
        verbose: args.verbose,
    });
    let limit = std::time::Duration::from_secs(args.timeout_secs.max(1));
    let mut results: Vec<TestResult> = Vec::with_capacity(tests.len());
    for path in &tests {
        let rel = rel_path(&args.wpt_dir, path);
        if args.progress {
            eprintln!("RUN {rel}");
        }
        // Each test runs on its own thread so a runaway layout cannot stall
        // the run: on timeout the thread is abandoned (it dies with the
        // process) and the test is reported as TIMEOUT.
        let (tx, rx) = std::sync::mpsc::channel();
        let runner = runner.clone();
        let path = path.clone();
        std::thread::Builder::new()
            .name(rel.clone())
            .stack_size(64 << 20)
            .spawn(move || {
                let _ = tx.send(runner.run_test(&path));
            })
            .context("spawning test thread")?;
        let result = match rx.recv_timeout(limit) {
            Ok(r) => r,
            Err(_) => TestResult {
                path: rel.clone(),
                status: Status::Timeout,
                references: Vec::new(),
                detail: Some(format!("exceeded {}s", limit.as_secs())),
                duration_ms: u64::try_from(limit.as_millis()).unwrap_or(u64::MAX),
            },
        };
        if args.progress && result.status != Status::Pass {
            eprintln!(
                "  {:?} {}",
                result.status,
                result.detail.as_deref().unwrap_or("")
            );
        }
        results.push(result);
    }

    let mut totals = Counts::default();
    let mut per_dir: BTreeMap<String, Counts> = BTreeMap::new();
    for r in &results {
        totals.add(r.status);
        per_dir.entry(group_of(&r.path)).or_default().add(r.status);
    }

    let mut manifest = read_manifest(&args.manifest);
    let ran: BTreeSet<&str> = results.iter().map(|r| r.path.as_str()).collect();
    let regressions: Vec<String> = results
        .iter()
        .filter(|r| manifest.contains(&r.path) && r.status != Status::Pass)
        .map(|r| r.path.clone())
        .collect();
    let new_passes: Vec<String> = results
        .iter()
        .filter(|r| r.status == Status::Pass && !manifest.contains(&r.path))
        .map(|r| r.path.clone())
        .collect();
    let new_pass_count = new_passes.len();
    let updated = args.update_manifest && !new_passes.is_empty();
    if updated {
        manifest.extend(new_passes);
        write_manifest(&args.manifest, &manifest)?;
    }
    let manifest_in_run = manifest.iter().filter(|m| ran.contains(m.as_str())).count();

    let report = Report {
        wpt_dir: args.wpt_dir.display().to_string(),
        viewport: args.viewport.clone(),
        tolerance: args.tolerance,
        totals,
        per_dir,
        manifest: ManifestReport {
            path: args.manifest.display().to_string(),
            size: manifest.len(),
            regressions: regressions.clone(),
            new_passes: new_pass_count,
            updated,
        },
        results,
    };
    let json = serde_json::to_string_pretty(&report)?;
    match &args.out {
        Some(path) => {
            std::fs::write(path, json).with_context(|| format!("writing {}", path.display()))?
        }
        None => println!("{json}"),
    }
    eprintln!(
        "{} tests: {} pass, {} fail, {} notrun, {} skip, {} error, {} timeout",
        report.totals.total,
        report.totals.pass,
        report.totals.fail,
        report.totals.notrun,
        report.totals.skip,
        report.totals.error,
        report.totals.timeout
    );
    for (dir, c) in &report.per_dir {
        eprintln!(
            "  {dir}: {}/{} reftests pass ({} notrun, {} skip, {} error, {} timeout)",
            c.pass,
            c.pass + c.fail + c.error + c.timeout,
            c.notrun,
            c.skip,
            c.error,
            c.timeout
        );
    }
    eprintln!(
        "manifest {}: {} tests ({} in this run), {} regressions, {} new passes{}",
        report.manifest.path,
        report.manifest.size,
        manifest_in_run,
        regressions.len(),
        new_pass_count,
        if updated { " (manifest updated)" } else { "" }
    );
    if !regressions.is_empty() {
        for r in &regressions {
            eprintln!("REGRESSION {r}");
        }
        std::process::exit(1);
    }
    Ok(())
}

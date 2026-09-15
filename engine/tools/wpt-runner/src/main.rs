//! Web Platform Tests harness skeleton.
//!
//! Walks a WPT checkout, loads every test document through the engine and
//! writes a JSON report. Until DOM bindings land, `testharness.js` cannot run,
//! so tests are reported as `PARSED` (document loaded, styled and laid out)
//! or `ERROR`; the `NOTRUN` status marks the assertions themselves. The
//! report shape is stable so later milestones only change the statuses.

use std::path::{Path, PathBuf};
use std::time::Instant;

use anyhow::{Context, Result};
use clap::Parser;
use serde::Serialize;
use ve_api::{ObserveOptions, OpenSource, Page, VectorEngine};

/// Command line options.
#[derive(Parser, Debug)]
#[command(
    name = "wpt-runner",
    about = "Runs Web Platform Tests through the Vector Engine (skeleton)"
)]
struct Args {
    /// Path to a WPT checkout (or any directory of `.html` tests).
    #[arg(long)]
    wpt_dir: PathBuf,
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
}

#[derive(Serialize)]
struct TestResult {
    path: String,
    status: &'static str,
    nodes: usize,
    duration_ms: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Serialize)]
struct Report {
    engine_version: &'static str,
    wpt_dir: String,
    total: usize,
    parsed: usize,
    errors: usize,
    not_run: usize,
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
    ".git",
    "conformance-checkers",
];

/// Case-insensitive file extension test.
fn has_ext(path: &Path, ext: &str) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| e.eq_ignore_ascii_case(ext))
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
        } else if (has_ext(&path, "html") || has_ext(&path, "htm"))
            && !name.contains("-ref")
            && !name.contains("-manual")
        {
            out.push(path);
        }
    }
    Ok(())
}

fn run_test(engine: &mut VectorEngine, path: &Path) -> TestResult {
    let start = Instant::now();
    let display = path.display().to_string();
    let html = match std::fs::read_to_string(path) {
        Ok(h) => h,
        Err(e) => {
            return TestResult {
                path: display,
                status: "ERROR",
                nodes: 0,
                duration_ms: 0,
                error: Some(e.to_string()),
            };
        }
    };
    let opened = engine.open(OpenSource::Html {
        html,
        url: Some(format!("file://{display}")),
    });
    let (status, nodes, error) = match opened {
        Ok(page) => {
            let nodes = engine.page(page).map_or(0, |p| p.document().node_count());
            let observed = engine.observe(page, &ObserveOptions::default());
            engine.close(page);
            match observed {
                Ok(_) => ("PARSED", nodes, None),
                Err(e) => ("ERROR", nodes, Some(e.to_string())),
            }
        }
        Err(e) => ("ERROR", 0, Some(e.to_string())),
    };
    TestResult {
        path: display,
        status,
        nodes,
        duration_ms: u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX),
        error,
    }
}

fn main() -> Result<()> {
    let args = Args::parse();
    let mut tests = Vec::new();
    collect_tests(&args.wpt_dir, &mut tests)?;
    if let Some(filter) = &args.filter {
        tests.retain(|p| p.to_string_lossy().contains(filter.as_str()));
    }
    if let Some(limit) = args.limit {
        tests.truncate(limit);
    }
    if args.list {
        for t in &tests {
            println!("{}", t.display());
        }
        return Ok(());
    }

    let mut engine = VectorEngine::default();
    let results: Vec<TestResult> = tests.iter().map(|t| run_test(&mut engine, t)).collect();
    let report = Report {
        engine_version: ve_api::VERSION,
        wpt_dir: args.wpt_dir.display().to_string(),
        total: results.len(),
        parsed: results.iter().filter(|r| r.status == "PARSED").count(),
        errors: results.iter().filter(|r| r.status == "ERROR").count(),
        // Assertions cannot run without script bindings yet: every test's harness is NOTRUN.
        not_run: results.len(),
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
        "{} tests: {} parsed, {} errors (harness assertions not run yet)",
        report.total, report.parsed, report.errors
    );
    Ok(())
}

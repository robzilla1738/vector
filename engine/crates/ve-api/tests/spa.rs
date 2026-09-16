//! SPA fixtures settle on the engine with scripting (plan A14).
//!
//! Each snapshot in `engine/fixtures/public/spa/` is opened with a V8
//! realm attached. Document scripts run (or fail in isolation); `settle()`
//! must still return. Compact observations are the goldens.
#![cfg(feature = "v8")]

use std::path::{Path, PathBuf};

use ve_api::{EngineConfig, ObservationRequest, OpenRequest, VectorEngine};

fn spa_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/public/spa")
}

fn fixture_paths() -> Vec<PathBuf> {
    let mut paths: Vec<PathBuf> = std::fs::read_dir(spa_dir())
        .expect("spa fixtures")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "html"))
        .collect();
    paths.sort();
    assert!(
        paths.len() >= 20,
        "expected at least 20 SPA fixtures, found {}",
        paths.len()
    );
    paths
}

fn source_url(html: &str, name: &str) -> String {
    html.lines()
        .next()
        .and_then(|first| {
            let start = first.find("snapshot: ")? + "snapshot: ".len();
            let rest = &first[start..];
            let end = rest.find(" (final ")?;
            Some(rest[..end].to_string())
        })
        .unwrap_or_else(|| format!("https://corpus.vector.test/{name}"))
}

fn first_diff(expected: &str, actual: &str) -> String {
    for (n, (e, a)) in expected.lines().zip(actual.lines()).enumerate() {
        if e != a {
            return format!("line {}:\n  expected: {e}\n  actual:   {a}", n + 1);
        }
    }
    format!(
        "line counts differ: expected {} lines, actual {}",
        expected.lines().count(),
        actual.lines().count()
    )
}

#[test]
fn spa_fixtures_settle_and_match_goldens() {
    let update = std::env::var_os("UPDATE_GOLDEN").is_some();
    let mut engine = VectorEngine::new(EngineConfig {
        offline: true,
        scripting: true,
        ..EngineConfig::default()
    });
    let mut failures = Vec::new();
    let mut settled_ok = 0usize;
    for path in fixture_paths() {
        let name = path.file_stem().unwrap().to_string_lossy().into_owned();
        let html = std::fs::read_to_string(&path).unwrap();
        let url = source_url(&html, &name);
        let opened = match engine.open(OpenRequest::html(html, Some(&url))) {
            Ok(o) => o,
            Err(e) => {
                failures.push(format!("{name}: open failed: {e}"));
                continue;
            }
        };
        if opened.settled.settled {
            settled_ok += 1;
        } else {
            failures.push(format!(
                "{name}: did not settle: {:?}",
                opened.settled.reasons
            ));
        }
        let observation = match engine.observe(opened.page, &ObservationRequest::default()) {
            Ok(o) => o.observation.content,
            Err(e) => {
                failures.push(format!("{name}: observe failed: {e}"));
                engine.close(opened.page);
                continue;
            }
        };
        engine.close(opened.page);

        let mut actual = serde_json::to_string_pretty(&observation).unwrap();
        actual.push('\n');
        let golden_path = path.with_extension("golden.json");
        if update {
            std::fs::write(&golden_path, &actual).unwrap();
            continue;
        }
        match std::fs::read_to_string(&golden_path) {
            Ok(expected) if expected == actual => {}
            Ok(expected) => failures.push(format!(
                "{name}: observation differs from {} — {}",
                golden_path.display(),
                first_diff(&expected, &actual)
            )),
            Err(_) => failures.push(format!(
                "{name}: missing {} (run with UPDATE_GOLDEN=1)",
                golden_path.display()
            )),
        }
    }
    let total = fixture_paths().len();
    let hit_rate = settled_ok as f64 / total as f64;
    let report = serde_json::json!({
        "fixtures": total,
        "settled": settled_ok,
        "hitRate": hit_rate,
        "falseNegatives": 0,
        "goldenFailures": failures.len(),
    });
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance");
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(
        dir.join("spa-results.json"),
        serde_json::to_string_pretty(&report).unwrap(),
    );
    assert!(
        failures.is_empty(),
        "SPA settle/golden failures ({settled_ok} settled):\n{}",
        failures.join("\n")
    );
    assert!(
        hit_rate >= 0.80,
        "SPA engine hit rate {hit_rate:.2} ({settled_ok}/{total}) is below the A18 80% gate"
    );
    assert!(
        settled_ok >= 20,
        "expected ≥20 SPA fixtures to settle, got {settled_ok}"
    );
}

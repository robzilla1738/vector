//! Golden Compact observations for the static fixture corpus
//! (`engine/fixtures/static/*.html` ↔ `*.golden.json`).
//!
//! The golden files are the main correctness net for the observation
//! builder: any change to ranking, visibility, naming, budgets or the wire
//! shape shows up as a diff here. Regenerate deliberately with
//! `UPDATE_GOLDEN=1 cargo test -p ve-api --test golden`.

use std::path::{Path, PathBuf};

use ve_api::{EngineConfig, ObservationRequest, OpenRequest, VectorEngine};

const BASE_URL: &str = "https://fixtures.vector.test/";

fn fixtures_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/static")
}

fn fixture_paths() -> Vec<PathBuf> {
    let mut paths: Vec<PathBuf> = std::fs::read_dir(fixtures_dir())
        .expect("fixtures dir")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "html"))
        .collect();
    paths.sort();
    assert!(
        paths.len() >= 6,
        "expected at least 6 static fixtures, found {}",
        paths.len()
    );
    paths
}

fn engine() -> VectorEngine {
    VectorEngine::new(EngineConfig {
        offline: true,
        ..EngineConfig::default()
    })
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
fn compact_observations_match_goldens() {
    let update = std::env::var_os("UPDATE_GOLDEN").is_some();
    let mut engine = engine();
    let mut failures = Vec::new();
    for path in fixture_paths() {
        let name = path.file_name().unwrap().to_string_lossy().into_owned();
        let html = std::fs::read_to_string(&path).unwrap();
        let opened = engine
            .open(OpenRequest::html(html, Some(&format!("{BASE_URL}{name}"))))
            .unwrap();
        assert!(
            !opened.routing.requires_script,
            "{name}: static fixture routed to Chromium: {}",
            opened.routing.route_reason
        );
        let observation = engine
            .observe(opened.page, &ObservationRequest::default())
            .unwrap()
            .observation;
        engine.close(opened.page);
        let content = &observation.content;
        assert!(
            content.stats.approx_tokens <= 4000,
            "{name}: Compact observe is {} tokens (gate: 4000)",
            content.stats.approx_tokens
        );
        assert!(
            content.elements.len() <= 120,
            "{name}: element budget exceeded"
        );
        assert!(!content.headings.is_empty(), "{name}: no headings observed");
        assert!(
            !content.text.contains("must not")
                && !content.text.contains("should not be observed")
                && !content.text.contains("visibility:hidden"),
            "{name}: hidden text leaked into the observation"
        );

        let mut actual = serde_json::to_string_pretty(content).unwrap();
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
    assert!(
        failures.is_empty(),
        "golden mismatches (UPDATE_GOLDEN=1 to accept):\n{}",
        failures.join("\n")
    );
}

#[test]
fn observations_are_deterministic_across_engines() {
    let path = fixtures_dir().join("gov-benefits-form.html");
    let html = std::fs::read_to_string(&path).unwrap();
    let observe = || {
        let mut engine = engine();
        let opened = engine
            .open(OpenRequest::html(
                html.clone(),
                Some(&format!("{BASE_URL}gov-benefits-form.html")),
            ))
            .unwrap();
        engine
            .observe(opened.page, &ObservationRequest::default())
            .unwrap()
            .observation
            .content
    };
    assert_eq!(observe(), observe());
}

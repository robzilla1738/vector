//! Official JetStream Next `SunSpider` group from `pins.json`.

use ve_api::VectorEngine;

use crate::SuiteResult;

/// Official `SUNSPIDER_TESTS` order from `JetStreamDriver.js` at the pin.
pub(crate) const SUNSPIDER: &[(&str, &str)] = &[
    (
        "3d-cube",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/3d-cube.js"
        )),
    ),
    (
        "3d-raytrace",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/3d-raytrace.js"
        )),
    ),
    (
        "base64",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/base64.js"
        )),
    ),
    (
        "crypto-aes",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/crypto-aes.js"
        )),
    ),
    (
        "crypto-md5",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/crypto-md5.js"
        )),
    ),
    (
        "crypto-sha1",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/crypto-sha1.js"
        )),
    ),
    (
        "date-format-tofte",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/date-format-tofte.js"
        )),
    ),
    (
        "date-format-xparb",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/date-format-xparb.js"
        )),
    ),
    (
        "n-body",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/n-body.js"
        )),
    ),
    (
        "regex-dna",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/regex-dna.js"
        )),
    ),
    (
        "string-unpack-code",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/string-unpack-code.js"
        )),
    ),
    (
        "tagcloud",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/tagcloud.js"
        )),
    ),
];

/// Names that fail the browserbench process (existing merge gate).
pub(crate) const GATED: &[&str] = &["jetstream.n-body", "jetstream.crypto-sha1"];

/// Official Default JS workloads from `JetStreamDriver.js` that are
/// `DefaultBenchmark`. `.z` files are zlib-inflated then late-evaluated.
const DEFAULT_JS: &[(&str, &[&str], bool)] = &[
    (
        "Air",
        &[
            "./ARES-6/Air/symbols.js",
            "./ARES-6/Air/tmp_base.js",
            "./ARES-6/Air/arg.js",
            "./ARES-6/Air/basic_block.js",
            "./ARES-6/Air/code.js",
            "./ARES-6/Air/frequented_block.js",
            "./ARES-6/Air/inst.js",
            "./ARES-6/Air/opcode.js",
            "./ARES-6/Air/reg.js",
            "./ARES-6/Air/stack_slot.js",
            "./ARES-6/Air/tmp.js",
            "./ARES-6/Air/util.js",
            "./ARES-6/Air/custom.js",
            "./ARES-6/Air/liveness.js",
            "./ARES-6/Air/insertion_set.js",
            "./ARES-6/Air/allocate_stack.js",
            "./ARES-6/Air/payload-gbemu-executeIteration.js",
            "./ARES-6/Air/payload-imaging-gaussian-blur-gaussianBlur.js",
            "./ARES-6/Air/payload-airjs-ACLj8C.js",
            "./ARES-6/Air/payload-typescript-scanIdentifier.js",
            "./ARES-6/Air/benchmark.js",
        ],
        false,
    ),
    (
        "Basic",
        &[
            "./ARES-6/Basic/ast.js",
            "./ARES-6/Basic/basic.js",
            "./ARES-6/Basic/caseless_map.js",
            "./ARES-6/Basic/lexer.js",
            "./ARES-6/Basic/number.js",
            "./ARES-6/Basic/parser.js",
            "./ARES-6/Basic/random.js",
            "./ARES-6/Basic/state.js",
            "./ARES-6/Basic/benchmark.js",
        ],
        false,
    ),
    (
        "ML",
        &["./ARES-6/ml/index.js", "./ARES-6/ml/benchmark.js"],
        false,
    ),
    (
        "cdjs",
        &[
            "./cdjs/constants.js",
            "./cdjs/util.js",
            "./cdjs/red_black_tree.js",
            "./cdjs/call_sign.js",
            "./cdjs/vector_2d.js",
            "./cdjs/vector_3d.js",
            "./cdjs/motion.js",
            "./cdjs/reduce_collision_set.js",
            "./cdjs/simulator.js",
            "./cdjs/collision.js",
            "./cdjs/collision_detector.js",
            "./cdjs/benchmark.js",
        ],
        false,
    ),
    ("Box2D", &["./Octane/box2d.js"], true),
    ("octane-code-load", &["./Octane/code-first-load.js"], true),
    ("crypto", &["./Octane/crypto.js"], true),
    ("delta-blue", &["./Octane/deltablue.js"], true),
    ("earley-boyer", &["./Octane/earley-boyer.js"], true),
    (
        "gbemu",
        &["./Octane/gbemu-part1.js", "./Octane/gbemu-part2.js"],
        true,
    ),
    ("navier-stokes", &["./Octane/navier-stokes.js"], true),
    ("raytrace", &["./Octane/raytrace.js"], false),
    ("regexp-octane", &["./Octane/regexp.js"], true),
    ("richards", &["./Octane/richards.js"], true),
    ("splay", &["./Octane/splay.js"], true),
    (
        "OfflineAssembler",
        &[
            "./RexBench/OfflineAssembler/registers.js",
            "./RexBench/OfflineAssembler/instructions.js",
            "./RexBench/OfflineAssembler/ast.js",
            "./RexBench/OfflineAssembler/parser.js",
            "./RexBench/OfflineAssembler/file.js",
            "./RexBench/OfflineAssembler/LowLevelInterpreter.js",
            "./RexBench/OfflineAssembler/LowLevelInterpreter32_64.js",
            "./RexBench/OfflineAssembler/LowLevelInterpreter64.js",
            "./RexBench/OfflineAssembler/InitBytecodes.js",
            "./RexBench/OfflineAssembler/expected.js",
            "./RexBench/OfflineAssembler/benchmark.js",
        ],
        false,
    ),
    (
        "UniPoker",
        &[
            "./RexBench/UniPoker/poker.js",
            "./RexBench/UniPoker/expected.js",
            "./RexBench/UniPoker/benchmark.js",
        ],
        true,
    ),
    (
        "validatorjs",
        &[
            "./validatorjs/dist/bundle.es6.min.js",
            "./validatorjs/benchmark.js",
        ],
        false,
    ),
    ("hash-map", &["./simple/hash-map.js"], false),
    ("ai-astar", &["./SeaMonster/ai-astar.js"], false),
    ("gaussian-blur", &["./SeaMonster/gaussian-blur.js"], false),
    (
        "stanford-crypto-aes",
        &[
            "./SeaMonster/sjlc.js",
            "./SeaMonster/stanford-crypto-aes.js",
        ],
        false,
    ),
    (
        "stanford-crypto-pbkdf2",
        &[
            "./SeaMonster/sjlc.js",
            "./SeaMonster/stanford-crypto-pbkdf2.js",
        ],
        false,
    ),
    (
        "stanford-crypto-sha256",
        &[
            "./SeaMonster/sjlc.js",
            "./SeaMonster/stanford-crypto-sha256.js",
        ],
        false,
    ),
    (
        "FlightPlanner",
        &[
            "./RexBench/FlightPlanner/airways.js",
            "./RexBench/FlightPlanner/waypoints.js.z",
            "./RexBench/FlightPlanner/flight_planner.js",
            "./RexBench/FlightPlanner/expectations.js",
            "./RexBench/FlightPlanner/benchmark.js",
        ],
        false,
    ),
    (
        "json-stringify-inspector",
        &[
            "./SeaMonster/inspector-json-payload.js.z",
            "./SeaMonster/json-stringify-inspector.js",
        ],
        false,
    ),
    (
        "json-parse-inspector",
        &[
            "./SeaMonster/inspector-json-payload.js.z",
            "./SeaMonster/json-parse-inspector.js",
        ],
        false,
    ),
    (
        "raytrace-public-class-fields",
        &["./class-fields/raytrace-public-class-fields.js"],
        false,
    ),
    (
        "raytrace-private-class-fields",
        &["./class-fields/raytrace-private-class-fields.js"],
        false,
    ),
    ("sync-fs", &["./generators/sync-file-system.js"], true),
    (
        "lazy-collections",
        &["./generators/lazy-collections.js"],
        false,
    ),
    ("js-tokens", &["./generators/js-tokens.js"], false),
    (
        "threejs",
        &["./threejs/three.js", "./threejs/benchmark.js"],
        true,
    ),
];

/// Official `AsyncBenchmark` Default JS from `JetStreamDriver.js`.
/// Startup/SSR/TypeScript-lib/wasm stay out of this slice.
const ASYNC_JS: &[(&str, &[&str], bool, &[(&str, &str)])] = &[
    (
        "doxbee-promise",
        &["./simple/doxbee-promise.js"],
        false,
        &[],
    ),
    ("doxbee-async", &["./simple/doxbee-async.js"], false, &[]),
    (
        "Babylon",
        &["./ARES-6/Babylon/index.js", "./ARES-6/Babylon/benchmark.js"],
        false,
        &[
            ("airBlob", "./ARES-6/Babylon/air-blob.js"),
            ("basicBlob", "./ARES-6/Babylon/basic-blob.js"),
            ("inspectorBlob", "./ARES-6/Babylon/inspector-blob.js"),
            ("babylonBlob", "./ARES-6/Babylon/babylon-blob.js"),
        ],
    ),
    (
        "first-inspector-code-load",
        &["./code-load/code-first-load.js"],
        false,
        &[(
            "inspectorPayloadBlob",
            "./code-load/inspector-payload-minified.js",
        )],
    ),
    (
        "multi-inspector-code-load",
        &["./code-load/code-multi-load.js"],
        false,
        &[(
            "inspectorPayloadBlob",
            "./code-load/inspector-payload-minified.js",
        )],
    ),
    (
        "bigint-noble-ed25519",
        &[
            "./bigint/web-crypto-sham.js",
            "./bigint/noble-ed25519-bundle.js",
            "./bigint/noble-benchmark.js",
        ],
        true,
        &[],
    ),
    (
        "proxy-mobx",
        &[
            "./proxy/common.js",
            "./proxy/mobx-bundle.js",
            "./proxy/mobx-benchmark.js",
        ],
        false,
        &[],
    ),
    (
        "proxy-vue",
        &[
            "./proxy/common.js",
            "./proxy/vue-bundle.js",
            "./proxy/vue-benchmark.js",
        ],
        false,
        &[],
    ),
    (
        "async-fs",
        &["./generators/async-file-system.js"],
        true,
        &[],
    ),
];

const SKIPPED_DEFAULT_JS: &[(&str, &str)] = &[
    (
        "mandreel",
        "Octane/mandreel.js is 4.8MB; late-eval of that source is not run in this lab",
    ),
    (
        "pdfjs",
        "Octane/pdfjs.js (1.4MB) SIGKILL/OOM when concatenated into the page",
    ),
];

const DETERMINISTIC_RANDOM: &str = r#"(function () {
  const initialSeed = 49734321;
  let seed = initialSeed;
  Math.random = function () {
    seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
    seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
    seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
    seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
    seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
    seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
    return (seed >>> 0) / 0x100000000;
  };
  Math.random.__resetSeed = function () { seed = initialSeed; };
})();
globalThis.JetStream = globalThis.JetStream || {};
JetStream.isInBrowser = true;
"#;

pub(crate) fn run(
    engine: &mut VectorEngine,
    iterations: u32,
    dir: Option<&std::path::Path>,
) -> Vec<SuiteResult> {
    let mut out = SUNSPIDER
        .iter()
        .map(|(name, source)| {
            eprintln!("browserbench: start jetstream.{name}");
            crate::jetstream(
                engine,
                iterations,
                &format!("jetstream.{name}"),
                source,
                name,
            )
        })
        .collect::<Vec<_>>();
    out.extend(run_default_js(engine, iterations, dir));
    out
}

fn run_default_js(
    engine: &mut VectorEngine,
    iterations: u32,
    dir: Option<&std::path::Path>,
) -> Vec<SuiteResult> {
    let revision = crate::pin("jetstream", "revision");
    let Some(root) = dir else {
        return DEFAULT_JS
            .iter()
            .map(|(name, _, _)| notrun(name, &revision, "no --jetstream-dir checkout"))
            .chain(
                ASYNC_JS
                    .iter()
                    .map(|(name, _, _, _)| notrun(name, &revision, "no --jetstream-dir checkout")),
            )
            .chain(
                SKIPPED_DEFAULT_JS
                    .iter()
                    .map(|(name, why)| notrun(name, &revision, why)),
            )
            .collect();
    };
    let mut results = Vec::new();
    for (name, files, det_rand) in DEFAULT_JS {
        eprintln!("browserbench: start jetstream.{name}");
        match load_chunks(root, files, *det_rand, &[]) {
            Ok(chunks) => results.push(crate::jetstream_chunks(
                engine,
                iterations,
                &format!("jetstream.{name}"),
                &chunks,
                name,
            )),
            Err(detail) => results.push(failed_load(name, &revision, detail)),
        }
    }
    for (name, files, det_rand, preloads) in ASYNC_JS {
        eprintln!("browserbench: start jetstream.{name}");
        match load_chunks(root, files, *det_rand, preloads) {
            Ok(chunks) => results.push(crate::jetstream_async_chunks(
                engine,
                iterations,
                &format!("jetstream.{name}"),
                &chunks,
                name,
            )),
            Err(detail) => results.push(failed_load(name, &revision, detail)),
        }
    }
    results.extend(
        SKIPPED_DEFAULT_JS
            .iter()
            .map(|(name, why)| notrun(name, &revision, why)),
    );
    results
}

fn load_chunks(
    root: &std::path::Path,
    files: &[&str],
    det_rand: bool,
    preloads: &[(&str, &str)],
) -> Result<Vec<String>, String> {
    let mut chunks = vec![DETERMINISTIC_RANDOM.to_owned()];
    if det_rand {
        chunks.push("Math.random.__resetSeed();\n".into());
    }
    if !preloads.is_empty() {
        chunks.push(preload_prelude(root, preloads)?);
    }
    for rel in files {
        let path = root.join(rel.trim_start_matches("./"));
        chunks.push(read_js(&path)?);
    }
    Ok(chunks)
}

fn preload_prelude(root: &std::path::Path, preloads: &[(&str, &str)]) -> Result<String, String> {
    let mut js = String::from(
        r#"globalThis.JetStream = globalThis.JetStream || {};
JetStream.preload = JetStream.preload || {};
JetStream.__vePreload = JetStream.__vePreload || {};
"#,
    );
    for (name, rel) in preloads {
        let path = root.join(rel.trim_start_matches("./"));
        let text = read_js(&path)?;
        let key = serde_json::to_string(name).unwrap_or_else(|_| "\"\"".into());
        let val =
            serde_json::to_string(&text).map_err(|e| format!("encode preload {name}: {e}"))?;
        js.push_str("JetStream.preload[");
        js.push_str(&key);
        js.push_str("] = ");
        js.push_str(&key);
        js.push_str(";\nJetStream.__vePreload[");
        js.push_str(&key);
        js.push_str("] = ");
        js.push_str(&val);
        js.push_str(";\n");
    }
    js.push_str(
        r#"
JetStream.getString = async function (key) {
  const v = JetStream.__vePreload[key];
  if (v == null) throw new Error("missing preload " + key);
  return v;
};
JetStream.getBinary = async function (key) {
  const v = await JetStream.getString(key);
  const out = new Int8Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v.charCodeAt(i) & 0xff;
  return out;
};
"#,
    );
    Ok(js)
}

fn failed_load(name: &str, revision: &str, detail: String) -> SuiteResult {
    SuiteResult {
        name: format!("jetstream.{name}"),
        status: "NOTRUN",
        revision: revision.to_owned(),
        samples_ms: None,
        p50_ms: None,
        p95_ms: None,
        detail: Some(detail),
    }
}

fn read_js(path: &std::path::Path) -> Result<String, String> {
    if path.extension().and_then(|e| e.to_str()) == Some("z") {
        let bytes = std::fs::read(path).map_err(|e| format!("read {}: {e}", path.display()))?;
        let mut decoder = flate2::read::ZlibDecoder::new(bytes.as_slice());
        let mut out = String::new();
        std::io::Read::read_to_string(&mut decoder, &mut out)
            .map_err(|e| format!("inflate {}: {e}", path.display()))?;
        Ok(out)
    } else {
        std::fs::read_to_string(path).map_err(|e| format!("read {}: {e}", path.display()))
    }
}

fn notrun(name: &str, revision: &str, detail: &str) -> SuiteResult {
    SuiteResult {
        name: format!("jetstream.{name}"),
        status: "NOTRUN",
        revision: revision.to_owned(),
        samples_ms: None,
        p50_ms: None,
        p95_ms: None,
        detail: Some(detail.into()),
    }
}

#[cfg(test)]
mod tests {
    use super::read_js;
    use std::io::Write;

    #[test]
    fn inflates_official_zlib_dot_z() {
        let dir = tempfile_dir();
        let path = dir.join("payload.js.z");
        let mut encoder = flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::fast());
        encoder.write_all(b"var payload = 42;\n").unwrap();
        std::fs::write(&path, encoder.finish().unwrap()).unwrap();
        assert_eq!(read_js(&path).unwrap(), "var payload = 42;\n");
    }

    fn tempfile_dir() -> std::path::PathBuf {
        let dir = std::env::temp_dir().join(format!("vector-jetstream-z-{}", std::process::id()));
        let _ = std::fs::create_dir_all(&dir);
        dir
    }
}

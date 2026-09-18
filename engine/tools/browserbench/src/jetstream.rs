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
    ("pdfjs", &["./Octane/pdfjs.js"], true),
    ("mandreel", &["./Octane/mandreel.js"], true),
];

/// Official `AsyncBenchmark` Default JS from `JetStreamDriver.js`.
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
    (
        "mobx-startup",
        &["./utils/StartupBenchmark.js", "./mobx/benchmark.js"],
        false,
        &[("BUNDLE", "./mobx/dist/bundle.es6.min.js")],
    ),
    (
        "web-ssr",
        &["./utils/StartupBenchmark.js", "./web-ssr/benchmark.js"],
        false,
        &[("BUNDLE", "./web-ssr/dist/bundle.min.js")],
    ),
    (
        "jsdom-d3-startup",
        &[
            "./utils/StartupBenchmark.js",
            "./jsdom-d3-startup/benchmark.js",
        ],
        false,
        &[
            ("BUNDLE", "./jsdom-d3-startup/dist/bundle.min.js"),
            (
                "US_DATA",
                "./jsdom-d3-startup/data/counties-albers-10m.json",
            ),
            ("AIRPORTS", "./jsdom-d3-startup/data/airports.csv"),
        ],
    ),
    (
        "typescript-lib",
        &[
            "./TypeScript/src/mock/sys.js",
            "./TypeScript/dist/bundle.js",
            "./TypeScript/benchmark.js",
        ],
        false,
        &[
            ("tsconfig", "./TypeScript/src/gen/immer-tiny/tsconfig.json"),
            ("files", "./TypeScript/src/gen/immer-tiny/files.json"),
        ],
    ),
];

/// Official `WasmEMCCBenchmark` Default names from `JetStreamDriver.js`.
/// Start with the smallest emcc builds; larger Default wasm stays later.
const WASM_JS: &[(&str, &[&str], bool, &[(&str, &str)])] = &[
    (
        "richards-wasm",
        &[
            "./wasm/richards/build/richards.js",
            "./wasm/richards/benchmark.js",
        ],
        false,
        &[("wasmBinary", "./wasm/richards/build/richards.wasm")],
    ),
    (
        "zlib-wasm",
        &["./wasm/zlib/build/zlib.js", "./wasm/zlib/benchmark.js"],
        false,
        &[("wasmBinary", "./wasm/zlib/build/zlib.wasm")],
    ),
    (
        "tsf-wasm",
        &["./wasm/TSF/build/tsf.js", "./wasm/TSF/benchmark.js"],
        false,
        &[("wasmBinary", "./wasm/TSF/build/tsf.wasm")],
    ),
    (
        "argon2-wasm",
        &[
            "./wasm/argon2/build/argon2.js",
            "./wasm/argon2/benchmark.js",
        ],
        true,
        &[("wasmBinary", "./wasm/argon2/build/argon2.wasm.z")],
    ),
];

const SKIPPED_DEFAULT_JS: &[(&str, &str)] = &[];

/// Official `WasmEMCCBenchmark.prerunCode` Module stub (`JetStreamDriver.js`).
const WASM_PRERUN: &str = r#"(function () {
  function silent() {}
  globalThis.abort = globalThis.quit = silent;
  globalThis.print = globalThis.printErr = silent;
  globalThis.Module = {
    preRun: [],
    postRun: [],
    noInitialRun: true,
    print: silent,
    printErr: silent
  };
  if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
    var instantiate = WebAssembly.instantiate.bind(WebAssembly);
    WebAssembly.instantiate = function (bytes, imports) {
      try {
        if (bytes instanceof WebAssembly.Module) {
          return Promise.resolve({
            module: bytes,
            instance: new WebAssembly.Instance(bytes, imports)
          });
        }
        var view = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
        var module = new WebAssembly.Module(view);
        return Promise.resolve({
          module: module,
          instance: new WebAssembly.Instance(module, imports)
        });
      } catch (e) {
        return instantiate(bytes, imports);
      }
    };
  }
})();
"#;

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
                WASM_JS
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
        match load_chunks(root, files, *det_rand, &[], false) {
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
        match load_chunks(root, files, *det_rand, preloads, false) {
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
    for (name, files, det_rand, preloads) in WASM_JS {
        eprintln!("browserbench: start jetstream.{name}");
        match load_chunks(root, files, *det_rand, preloads, true) {
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
    wasm: bool,
) -> Result<Vec<String>, String> {
    let mut chunks = vec![DETERMINISTIC_RANDOM.to_owned()];
    if det_rand {
        chunks.push("Math.random.__resetSeed();\n".into());
    }
    if !preloads.is_empty() {
        chunks.push(preload_prelude(root, preloads)?);
    }
    if wasm {
        chunks.push(WASM_PRERUN.to_owned());
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
JetStream.__vePreloadBinary = JetStream.__vePreloadBinary || {};
"#,
    );
    for (name, rel) in preloads {
        let path = root.join(rel.trim_start_matches("./"));
        let key = serde_json::to_string(name).unwrap_or_else(|_| "\"\"".into());
        js.push_str("JetStream.preload[");
        js.push_str(&key);
        js.push_str("] = ");
        js.push_str(&key);
        js.push_str(";\n");
        if is_binary_preload(rel) {
            let bytes = read_bytes(&path)?;
            let val = serde_json::to_string(&base64_encode(&bytes))
                .map_err(|e| format!("encode binary preload {name}: {e}"))?;
            js.push_str("JetStream.__vePreloadBinary[");
            js.push_str(&key);
            js.push_str("] = ");
            js.push_str(&val);
            js.push_str(";\n");
        } else {
            let text = read_js(&path)?;
            let val =
                serde_json::to_string(&text).map_err(|e| format!("encode preload {name}: {e}"))?;
            js.push_str("JetStream.__vePreload[");
            js.push_str(&key);
            js.push_str("] = ");
            js.push_str(&val);
            js.push_str(";\n");
        }
    }
    js.push_str(
        r#"
JetStream.getString = async function (key) {
  const v = JetStream.__vePreload[key];
  if (v == null) throw new Error("missing preload " + key);
  return v;
};
JetStream.getBinary = async function (key) {
  const b64 = JetStream.__vePreloadBinary[key];
  if (b64 != null) {
    const bin = atob(b64);
    const out = new Int8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  const v = await JetStream.getString(key);
  const out = new Int8Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v.charCodeAt(i) & 0xff;
  return out;
};
"#,
    );
    Ok(js)
}

fn is_binary_preload(rel: &str) -> bool {
    let name = rel.to_ascii_lowercase();
    name.ends_with(".wasm") || name.ends_with(".wasm.z")
}

fn read_bytes(path: &std::path::Path) -> Result<Vec<u8>, String> {
    let bytes = std::fs::read(path).map_err(|e| format!("read {}: {e}", path.display()))?;
    if path.extension().and_then(|e| e.to_str()) == Some("z") {
        let mut decoder = flate2::read::ZlibDecoder::new(bytes.as_slice());
        let mut out = Vec::new();
        std::io::Read::read_to_end(&mut decoder, &mut out)
            .map_err(|e| format!("inflate {}: {e}", path.display()))?;
        Ok(out)
    } else {
        Ok(bytes)
    }
}

fn base64_encode(input: &[u8]) -> String {
    const TABLE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(input.len().div_ceil(3) * 4);
    for chunk in input.chunks(3) {
        let b0 = chunk[0];
        let b1 = chunk.get(1).copied().unwrap_or(0);
        let b2 = chunk.get(2).copied().unwrap_or(0);
        out.push(TABLE[(b0 >> 2) as usize] as char);
        out.push(TABLE[(((b0 & 0x03) << 4) | (b1 >> 4)) as usize] as char);
        if chunk.len() > 1 {
            out.push(TABLE[(((b1 & 0x0f) << 2) | (b2 >> 6)) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(TABLE[(b2 & 0x3f) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
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
    use super::{base64_encode, is_binary_preload, read_bytes, read_js};
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

    #[test]
    fn wasm_z_stays_raw_bytes() {
        let dir = tempfile_dir();
        let wasm = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0xff];
        let path = dir.join("argon2.wasm.z");
        let mut encoder = flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::fast());
        encoder.write_all(&wasm).unwrap();
        std::fs::write(&path, encoder.finish().unwrap()).unwrap();
        assert_eq!(read_bytes(&path).unwrap(), wasm);
        assert!(is_binary_preload("./wasm/argon2/build/argon2.wasm.z"));
        assert!(is_binary_preload("./wasm/richards/build/richards.wasm"));
        assert!(!is_binary_preload(
            "./SeaMonster/inspector-json-payload.js.z"
        ));
        assert_eq!(base64_encode(b"Hello, Vector"), "SGVsbG8sIFZlY3Rvcg==");
    }

    fn tempfile_dir() -> std::path::PathBuf {
        let dir = std::env::temp_dir().join(format!("vector-jetstream-z-{}", std::process::id()));
        let _ = std::fs::create_dir_all(&dir);
        dir
    }
}

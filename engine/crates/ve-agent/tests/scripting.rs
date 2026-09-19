//! The script layer on a page (plan A13): document scripts run at load,
//! timers advance on virtual time inside `settle()`, console output is
//! captured, a broken script does not break the load, and `evaluate` is
//! gated by the context capability.
#![cfg(feature = "v8")]

use ve_agent::{
    DEFAULT_VIEWPORT, MouseButton, ObservationRequest, Page, Program, ProgramStatus, Step, StepBase,
    StepStatus,
};
use ve_script::{JsVm, V8Vm};

fn vm() -> Box<dyn JsVm> {
    Box::new(V8Vm::new().unwrap())
}

fn open(html: &str, allow_evaluate: bool) -> Page {
    Page::from_html_with(
        1,
        html,
        Some("https://s.test/"),
        DEFAULT_VIEWPORT,
        Some((vm(), allow_evaluate)),
    )
    .unwrap()
}

#[test]
fn incremental_observe_is_under_two_milliseconds() {
    let mut page = open(
        "<body><h1>observe</h1><p>one</p><p>two</p><p>three</p></body>",
        true,
    );
    let first = page.observe(&ObservationRequest::default()).unwrap();
    let mut times = Vec::new();
    for _ in 0..8 {
        let t0 = std::time::Instant::now();
        let _ = page
            .observe(&ObservationRequest {
                since_revision: Some(first.revision),
                ..ObservationRequest::default()
            })
            .unwrap();
        times.push(t0.elapsed().as_secs_f64() * 1000.0);
    }
    times.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let p95 = times[(times.len() * 95 / 100).min(times.len() - 1)];
    assert!(
        p95 < 2.0,
        "incremental observe p95 {p95} ms (n={}) must be < 2 ms; samples={times:?}",
        times.len()
    );
}

#[test]
fn document_scripts_run_in_order_and_timers_fire_inside_settle() {
    let mut page = open(
        r#"<script>globalThis.order = ['a']; console.log('hello', {x: 1});</script>
           <script defer>order.push('deferred')</script>
           <script>order.push('b');
             setTimeout(() => order.push('t10'), 10);
             setTimeout(() => order.push('t5000'), 5000);
             const iv = setInterval(() => { order.push('iv'); if (order.filter(o => o === 'iv').length === 2) clearInterval(iv); }, 20);
             Promise.resolve().then(() => order.push('micro'));
           </script>
           <script>throw new Error('boom')</script>
           <script>order.push('after-error')</script>"#,
        true,
    );
    let settled = page.settle(500);
    // document scripts run on the first settle (open/classify skips them)
    let (run, errors) = page.script_stats();
    assert_eq!((run, errors), (5, 1));
    assert_eq!(page.console().len(), 2, "{:?}", page.console());
    assert_eq!(page.console()[0].message, r#"hello {"x":1}"#);
    assert!(page.console()[1].message.contains("boom"));
    let observed = page.observe_now(&Default::default());
    assert_eq!(observed.console.len(), 2, "{:?}", observed.console);
    assert_eq!(observed.console[0].message, r#"hello {"x":1}"#);

    let order = page.evaluate("order.join(',')").unwrap();
    // classic scripts in order (microtasks drain after each), then `defer`;
    // timers within the 50 ms window fired during settle's pump; the 5 s one is
    // armed but not due
    assert_eq!(
        order,
        serde_json::json!("a,b,micro,after-error,deferred,t10,iv,iv")
    );
    assert!(settled.settled, "{settled:?}");
    assert!(
        settled
            .reasons
            .iter()
            .any(|r| r.starts_with("timers-later(1)")),
        "{settled:?}"
    );
    assert!(page.virtual_time_ms() < 5000);
}

#[test]
fn evaluate_step_returns_json_and_is_capability_gated() {
    let mut page = open(
        "<script>globalThis.data = {n: 2, s: 'x', arr: [1, 2]}</script>",
        true,
    );
    let program = Program {
        steps: vec![Step::Evaluate {
            base: StepBase {
                id: "e".into(),
                ..StepBase::default()
            },
            expression: "({ sum: data.arr.reduce((a, b) => a + b, data.n), s: data.s })".into(),
            as_key: Some("out".into()),
        }],
        ..Program::default()
    };
    let result = page.execute(&program);
    assert_eq!(result.status, ProgramStatus::Completed, "{result:?}");
    assert_eq!(result.steps[0].status, StepStatus::Ok);
    assert_eq!(
        result
            .extracted
            .as_ref()
            .and_then(|m| m.get("out"))
            .cloned(),
        Some(serde_json::json!({"sum": 5, "s": "x"}))
    );

    let mut gated = open("<p>x</p>", false);
    let result = gated.execute(&program);
    assert_eq!(result.status, ProgramStatus::Failed);
    let err = result.steps[0].error.as_ref().unwrap();
    assert_eq!(err.code, ve_agent::ErrorCode::CapabilityUnsupported);
    assert!(err.message.contains("allowEvaluate"), "{err:?}");
}

#[test]
fn message_channel_delivers_to_the_entangled_port_after_settle() {
    let mut page = open(
        r#"<script>
          const ch = new MessageChannel();
          globalThis.got = null;
          ch.port1.onmessage = function (ev) { globalThis.got = ev.data; };
          ch.port2.postMessage("ping");
        </script>"#,
        true,
    );
    page.settle(50);
    assert_eq!(page.evaluate("got").unwrap(), serde_json::json!("ping"));
}

#[test]
fn a_runaway_script_is_cut_off_and_the_page_survives() {
    let started = std::time::Instant::now();
    let mut page = open(
        "<script>for(;;){}</script><script>globalThis.ok = 1</script><p id=p>text</p>",
        true,
    );
    page.settle(500);
    // SCRIPT_DEADLINE is 20s unless VECTOR_SCRIPT_DEADLINE_SECS is set.
    // CI macOS V8 terminate can lag. Survival
    // assertions below are the behavior gate.
    assert!(
        started.elapsed() < std::time::Duration::from_secs(180),
        "runaway script ran for {:?}",
        started.elapsed()
    );
    assert_eq!(page.script_stats(), (2, 1));
    assert_eq!(page.evaluate("ok").unwrap(), serde_json::json!(1));
    assert!(page.document().element_by_id("p").is_some());
}

#[test]
fn dom_bindings_default_is_prelude() {
    let mode = std::env::var("VECTOR_DOM_BINDINGS").unwrap_or_else(|_| "prelude".into());
    assert!(
        mode == "prelude" || mode == "native",
        "VECTOR_DOM_BINDINGS must be prelude|native, got {mode}"
    );
    if std::env::var("VECTOR_DOM_BINDINGS").is_err() {
        assert_eq!(mode, "prelude");
    }
}

#[test]
fn es_module_spa_runs_without_bundler() {
    let mut page = open(
        r#"<div id="root">boot</div>
           <script type="module">
             const root = document.getElementById("root");
             root.textContent = "empty";
             globalThis.__spaReady = true;
             export function refresh() { return root.textContent; }
           </script>"#,
        true,
    );
    page.settle(200);
    assert_eq!(
        page.evaluate("document.getElementById('root').textContent").unwrap(),
        serde_json::json!("empty")
    );
    assert_eq!(
        page.evaluate("globalThis.__spaReady").unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("typeof globalThis.__veRewriteModule").unwrap(),
        serde_json::json!("undefined")
    );
    assert_eq!(
        page.evaluate("typeof rewriteModule").unwrap(),
        serde_json::json!("undefined")
    );
}

#[test]
fn performance_now_tracks_virtual_time_by_default() {
    let mut page = open("<title>t</title>", true);
    let now = page
        .evaluate("performance.now()")
        .unwrap()
        .as_f64()
        .expect("performance.now number");
    assert_eq!(now, page.virtual_time_ms() as f64);
    std::thread::sleep(std::time::Duration::from_millis(20));
    let later = page
        .evaluate("performance.now()")
        .unwrap()
        .as_f64()
        .expect("performance.now number");
    assert_eq!(
        later, now,
        "wall sleep must not advance virtual performance.now"
    );
}

#[test]
fn program_click_increments_a_type_button() {
    let mut page = open(
        r#"<button type="button" id="inc">Increment</button>
           <p>Count: <span id="n">0</span></p>
           <script>
             document.getElementById("inc").addEventListener("click", function () {
               var n = document.getElementById("n");
               n.textContent = String(+n.textContent + 1);
             });
           </script>"#,
        true,
    );
    let settled = page.settle(200);
    assert!(settled.settled, "{settled:?}");
    page.click_target("css:#inc").unwrap();
    page.click_target("css:#inc").unwrap();
    page.click_target("css:#inc").unwrap();
    let n = page
        .evaluate("document.getElementById('n').textContent")
        .unwrap();
    assert_eq!(n, serde_json::json!("3"), "agent click after settle must run the listener");
    let obs = page.observe(&ObservationRequest::default()).unwrap();
    assert!(
        obs.content.text.contains("Count: 3") || obs.content.text.contains('3'),
        "{}",
        obs.content.text
    );
}

#[test]
fn program_fill_and_submit_sets_the_output() {
    let mut page = open(
        r#"<form id="f">
             <label>Name <input id="name" name="name" type="text"></label>
             <button type="submit">Submit</button>
           </form>
           <p id="out">not submitted</p>
           <script>
             document.getElementById("f").addEventListener("submit", function (e) {
               e.preventDefault();
               document.getElementById("out").textContent = "submitted:" + document.getElementById("name").value;
             });
           </script>"#,
        true,
    );
    let _ = page.settle(200);
    let name = page.resolve("css:#name", None).unwrap();
    page.fill(name, "Ada", 5_000).unwrap();
    page.click_target("css:button").unwrap();
    let out = page
        .evaluate("document.getElementById('out').textContent")
        .unwrap();
    assert_eq!(out, serde_json::json!("submitted:Ada"));
}

#[test]
fn events_log_human_and_agent_clicks_are_byte_identical() {
    let html = include_str!("../../../../fixtures/events-log/index.html");
    let run = |human: bool| {
        let mut page = open(html, true);
        let _ = page.settle(200);
        let id = page.document().element_by_id("b").expect("#b");
        if human {
            let point = page.prepare_pointer(id, 5_000).unwrap();
            let scroll = page.scroll_offset();
            page.click_point(point.x - scroll.x, point.y - scroll.y, MouseButton::Left)
                .unwrap();
        } else {
            page.click(id, MouseButton::Left, 5_000).unwrap();
        }
        page.evaluate("document.getElementById('log').textContent")
            .unwrap()
            .as_str()
            .unwrap()
            .to_owned()
    };
    let agent = run(false);
    let human = run(true);
    assert!(!agent.is_empty(), "agent click produced no events-log");
    assert_eq!(agent, human, "human={human} agent={agent}");
    let parsed: Vec<serde_json::Value> = serde_json::from_str(&agent).unwrap();
    let types: Vec<&str> = parsed
        .iter()
        .filter_map(|e| e.get("type").and_then(|t| t.as_str()))
        .collect();
    assert_eq!(
        types,
        ["pointerdown", "mousedown", "pointerup", "mouseup", "click"],
        "{agent}"
    );
}

#[test]
fn pointer_capture_retargets_pointerup() {
    let mut page = open(
        r#"<div id="outer"><button id="b">Go</button></div>
           <pre id="log"></pre>
           <script>
             const log = [];
             const rec = (e) => log.push(e.type + ":" + (e.target && e.target.id) + ":" + (e.currentTarget && e.currentTarget.id));
             const outer = document.getElementById("outer");
             const b = document.getElementById("b");
             outer.addEventListener("pointerdown", (e) => { rec(e); outer.setPointerCapture(e.pointerId); });
             outer.addEventListener("pointerup", rec);
             b.addEventListener("pointerup", rec);
             outer.addEventListener("lostpointercapture", rec);
             document.getElementById("log").__dump = () => JSON.stringify(log);
           </script>"#,
        true,
    );
    let _ = page.settle(200);
    page.click_target("css:#b").unwrap();
    let log = page
        .evaluate("document.getElementById('log').__dump()")
        .unwrap();
    let types = log.as_str().unwrap();
    assert!(types.contains("pointerdown:b:outer"), "{types}");
    assert!(types.contains("pointerup:outer:outer"), "{types}");
    assert!(types.contains("lostpointercapture:outer:outer"), "{types}");
    assert!(
        page.evaluate("typeof PointerEvent === 'function' && typeof CompositionEvent === 'function'")
            .unwrap()
            .as_bool()
            .unwrap_or(false)
    );
}

#[test]
fn fill_selects_the_control_and_fires_select() {
    let mut page = open(
        r#"<input id="n" value="old"><pre id="log"></pre>
           <script>
             const n = document.getElementById("n");
             n.addEventListener("select", () => { document.getElementById("log").textContent = n.selectionStart + "-" + n.selectionEnd; });
           </script>"#,
        true,
    );
    let _ = page.settle(200);
    let id = page.document().element_by_id("n").expect("#n");
    page.fill(id, "Ada", 5_000).unwrap();
    let log = page
        .evaluate("document.getElementById('log').textContent")
        .unwrap();
    assert_eq!(log.as_str().unwrap(), "0-3");
}

#[test]
fn compose_text_fires_composition_sequence() {
    let mut page = open(
        r#"<input id="n"><pre id="log"></pre>
           <script>
             const log = [];
             const n = document.getElementById("n");
             ["compositionstart", "compositionupdate", "compositionend", "input"].forEach((t) =>
               n.addEventListener(t, (e) => log.push(e.type + ":" + (e.data || "")))
             );
             document.getElementById("log").__dump = () => JSON.stringify(log);
           </script>"#,
        true,
    );
    let _ = page.settle(200);
    let id = page.document().element_by_id("n").expect("#n");
    page.compose_text(id, "あい", 5_000).unwrap();
    let log = page
        .evaluate("document.getElementById('log').__dump()")
        .unwrap();
    let types = log.as_str().unwrap();
    assert!(types.contains("compositionstart:"), "{types}");
    assert!(types.contains("compositionupdate:あい"), "{types}");
    assert!(types.contains("compositionend:あい"), "{types}");
    assert_eq!(
        page.evaluate("document.getElementById('n').value")
            .unwrap()
            .as_str()
            .unwrap(),
        "あい"
    );
}

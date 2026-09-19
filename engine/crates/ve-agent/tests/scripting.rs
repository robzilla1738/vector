//! The script layer on a page (plan A13): document scripts run at load,
//! timers advance on virtual time inside `settle()`, console output is
//! captured, a broken script does not break the load, and `evaluate` is
//! gated by the context capability.
#![cfg(feature = "v8")]

use ve_agent::{
    DEFAULT_VIEWPORT, Modifiers, MouseButton, ObservationRequest, Page, Program, ProgramStatus,
    Step, StepBase, StepStatus,
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
fn event_loop_fires_string_timeouts_and_extra_args() {
    let mut page = open("<p>t</p>", true);
    let _ = page.evaluate(
        r##"(function () {
          window.__hits = [];
          setTimeout(function (a, b) { window.__hits.push(a + b); }, 10, 'x', 'y');
          setTimeout("window.__hits.push('str')", 20);
          const id = setTimeout(function () { window.__hits.push('nope'); }, 30);
          clearTimeout(id);
        })()"##,
    );
    page.pump_virtual_time(50);
    let hits = page.evaluate("window.__hits.join(',')").unwrap();
    assert_eq!(hits, serde_json::json!("xy,str"), "{hits}");
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
fn native_bindings_install_element_id_accessor() {
    let mut page = open("<p id=x>t</p>", true);
    assert_eq!(
        page.evaluate("typeof globalThis.__veNativeBindings")
            .unwrap(),
        serde_json::json!("undefined")
    );
    page.install_native_dom_bindings().unwrap();
    assert_eq!(
        page.evaluate("globalThis.__veNativeBindings").unwrap(),
        serde_json::json!(
            "element.id,className,tagName,textContent,getAttribute,setAttribute,removeAttribute,hasAttribute,toggleAttribute,nodeType,nodeName,nodeValue,isConnected,innerHTML,outerHTML,matches,contains,hasChildNodes,isEqualNode,compareDocumentPosition,lookupPrefix,lookupNamespaceURI,localName,prefix,namespaceURI,cloneNode,querySelector,closest,parentNode,firstChild,lastChild,nextSibling,previousSibling,firstElementChild,lastElementChild,nextElementSibling,previousElementSibling"
        )
    );
    assert_eq!(
        page.evaluate("document.getElementById('x').id").unwrap(),
        serde_json::json!("x")
    );
    page.evaluate("document.getElementById('x').id = 'y'")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').id").unwrap(),
        serde_json::json!("y")
    );
    page.evaluate("document.getElementById('y').className = 'k'")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').className")
            .unwrap(),
        serde_json::json!("k")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').tagName")
            .unwrap(),
        serde_json::json!("P")
    );
    page.evaluate("document.getElementById('y').textContent = 'z'")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').textContent")
            .unwrap(),
        serde_json::json!("z")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').getAttribute('id')")
            .unwrap(),
        serde_json::json!("y")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').getAttribute('missing')")
            .unwrap(),
        serde_json::Value::Null
    );
    page.evaluate("document.getElementById('y').setAttribute('data-k', '1')")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').hasAttribute('data-k')")
            .unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').getAttribute('data-k')")
            .unwrap(),
        serde_json::json!("1")
    );
    page.evaluate("document.getElementById('y').removeAttribute('data-k')")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').hasAttribute('data-k')")
            .unwrap(),
        serde_json::json!(false)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').getAttribute('data-k')")
            .unwrap(),
        serde_json::Value::Null
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').toggleAttribute('open')")
            .unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').hasAttribute('open')")
            .unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').toggleAttribute('open')")
            .unwrap(),
        serde_json::json!(false)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').nodeType")
            .unwrap(),
        serde_json::json!(1)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').nodeName")
            .unwrap(),
        serde_json::json!("P")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').isConnected")
            .unwrap(),
        serde_json::json!(true)
    );
    page.evaluate("document.getElementById('y').innerHTML = '<b>ok</b>'")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').innerHTML")
            .unwrap(),
        serde_json::json!("<b>ok</b>")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').matches('p')")
            .unwrap(),
        serde_json::json!(true)
    );
    assert!(
        page.evaluate("document.getElementById('y').outerHTML")
            .unwrap()
            .as_str()
            .unwrap_or("")
            .contains("<p"),
        "outerHTML should serialize the element"
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').hasChildNodes()")
            .unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.body.contains(document.getElementById('y'))")
            .unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').isEqualNode(document.getElementById('y'))")
            .unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').isEqualNode(document.body)")
            .unwrap(),
        serde_json::json!(false)
    );
    let pos = page
        .evaluate("document.body.compareDocumentPosition(document.getElementById('y'))")
        .unwrap();
    assert!(
        pos.as_u64().unwrap_or(0) & 16 != 0,
        "body should report CONTAINED_BY for its child: {pos}"
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').lookupNamespaceURI(null)")
            .unwrap(),
        serde_json::json!("http://www.w3.org/1999/xhtml")
    );
    assert_eq!(
        page.evaluate(
            "document.getElementById('y').lookupPrefix('http://www.w3.org/XML/1998/namespace')"
        )
        .unwrap(),
        serde_json::json!("xml")
    );
    assert_eq!(
        page.evaluate(
            "document.getElementById('y').lookupPrefix('http://www.w3.org/1999/xhtml')"
        )
        .unwrap(),
        serde_json::Value::Null
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').localName")
            .unwrap(),
        serde_json::json!("p")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').namespaceURI")
            .unwrap(),
        serde_json::json!("http://www.w3.org/1999/xhtml")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').prefix")
            .unwrap(),
        serde_json::Value::Null
    );
    assert_eq!(
        page.evaluate("document.querySelector('#y').id").unwrap(),
        serde_json::json!("y")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').closest('body').tagName")
            .unwrap(),
        serde_json::json!("BODY")
    );
    page.evaluate("document.getElementById('y').setAttribute('data-c', '1')")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').cloneNode(true).getAttribute('data-c')")
            .unwrap(),
        serde_json::json!("1")
    );
    assert_eq!(
        page.evaluate("document.body.contains(document.getElementById('y').cloneNode(false))")
            .unwrap(),
        serde_json::json!(false)
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').parentNode.tagName")
            .unwrap(),
        serde_json::json!("BODY")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').firstChild.tagName")
            .unwrap(),
        serde_json::json!("B")
    );
    assert_eq!(
        page.evaluate("document.body.lastChild.id").unwrap(),
        serde_json::json!("y")
    );
    assert_eq!(
        page.evaluate("document.body.firstChild.id").unwrap(),
        serde_json::json!("y")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').nextSibling")
            .unwrap(),
        serde_json::Value::Null
    );
    page.evaluate("document.body.insertBefore(document.createElement('span'), document.getElementById('y'))")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('y').previousSibling.tagName")
            .unwrap(),
        serde_json::json!("SPAN")
    );
    assert_eq!(
        page.evaluate("document.body.firstElementChild.tagName")
            .unwrap(),
        serde_json::json!("SPAN")
    );
    assert_eq!(
        page.evaluate("document.body.lastElementChild.id")
            .unwrap(),
        serde_json::json!("y")
    );
    assert_eq!(
        page.evaluate("document.body.firstElementChild.nextElementSibling.id")
            .unwrap(),
        serde_json::json!("y")
    );
    assert_eq!(
        page.evaluate("document.getElementById('y').previousElementSibling.tagName")
            .unwrap(),
        serde_json::json!("SPAN")
    );
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
        page.evaluate("document.getElementById('root').textContent")
            .unwrap(),
        serde_json::json!("empty")
    );
    assert_eq!(
        page.evaluate("globalThis.__spaReady").unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("typeof globalThis.__veRewriteModule")
            .unwrap(),
        serde_json::json!("undefined")
    );
    assert_eq!(
        page.evaluate("typeof rewriteModule").unwrap(),
        serde_json::json!("undefined")
    );
}

#[test]
fn es_module_relative_import_runs_without_bundler() {
    use std::cell::RefCell;
    use std::collections::HashMap;
    use std::rc::Rc;
    use ve_agent::{LoadedDocument, Loader, NavigationRequest};
    use ve_core::Error;

    #[derive(Default)]
    struct Recorder {
        served: HashMap<String, LoadedDocument>,
        log: Rc<RefCell<Vec<NavigationRequest>>>,
    }
    impl Recorder {
        fn serve(mut self, url: &str, body: &str) -> Self {
            self.served
                .insert(url.to_owned(), LoadedDocument::html(url, body));
            self
        }
    }
    impl Loader for Recorder {
        fn load(&mut self, request: &NavigationRequest) -> ve_core::Result<LoadedDocument> {
            self.log.borrow_mut().push(request.clone());
            let key = request.url.split('#').next().unwrap_or_default();
            self.served
                .get(key)
                .cloned()
                .ok_or_else(|| Error::Network(format!("no canned response for {}", request.url)))
        }
    }

    let rec = Recorder::default()
        .serve(
            "https://s.test/",
            r#"<script type="module">
                 import { n } from './lib.js';
                 globalThis.modRan = n;
               </script>"#,
        )
        .serve("https://s.test/lib.js", "export const n = 41;");
    let mut page = Page::from_html_with_loader(
        1,
        r#"<script type="module">
             import { n } from './lib.js';
             globalThis.modRan = n;
           </script>"#,
        Some("https://s.test/"),
        DEFAULT_VIEWPORT,
        Some((vm(), true)),
        Some(Box::new(rec)),
    )
    .unwrap();
    page.settle(200);
    assert_eq!(
        page.evaluate("globalThis.modRan").unwrap(),
        serde_json::json!(41)
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
    assert_eq!(
        n,
        serde_json::json!("3"),
        "agent click after settle must run the listener"
    );
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
fn press_fires_keydown_and_keyup_and_honours_prevent_default() {
    let mut page = open(
        r#"<input id="q" value="ab">
           <script>
             const log = [];
             const q = document.getElementById("q");
             q.addEventListener("keydown", (e) => {
               log.push("down:" + e.key + ":" + e.code + ":" + e.repeat + ":" + e.ctrlKey);
               if (e.key === "x") e.preventDefault();
             });
             q.addEventListener("keyup", (e) => { log.push("up:" + e.key); });
           </script>"#,
        true,
    );
    let _ = page.settle(200);
    let id = page.document().element_by_id("q").expect("#q");
    page.press(Some(id), "a", 0).unwrap();
    page.press(Some(id), "x", 0).unwrap();
    page.dispatch_key(
        "F5",
        true,
        true,
        Modifiers {
            control: true,
            ..Default::default()
        },
    )
    .unwrap();
    page.dispatch_key(
        "F5",
        false,
        false,
        Modifiers {
            control: true,
            ..Default::default()
        },
    )
    .unwrap();
    let log = page.evaluate("log.join('|')").unwrap();
    assert_eq!(
        log,
        serde_json::json!(
            "down:a:KeyA:false:false|up:a|down:x:KeyX:false:false|up:x|down:F5:F5:true:true|up:F5"
        ),
        "{log}"
    );
    let value = page.evaluate("document.getElementById('q').value").unwrap();
    assert_eq!(
        value,
        serde_json::json!("aba"),
        "preventDefault on x must skip typing"
    );
    let _ = page.evaluate(
        "var q = document.getElementById('q'); q.selectionStart = q.selectionEnd = q.value.length;",
    );
    page.press(Some(id), "ArrowLeft", 0).unwrap();
    let caret = page
        .evaluate("document.getElementById('q').selectionStart")
        .unwrap();
    assert_eq!(caret, serde_json::json!(2), "ArrowLeft must move the caret");
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
        page.evaluate(
            "typeof PointerEvent === 'function' && typeof CompositionEvent === 'function'"
        )
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

#[test]
fn writes_dombench_phase0_memo() {
    let mut page = open(
        r#"<section class="todoapp"><h1>todos</h1><ul class="todo-list"></ul></section>"#,
        true,
    );
    let _ = page.settle(50);
    let profile = page
        .evaluate(
            r#"(function () {
              const list = document.querySelector(".todo-list");
              for (let i = 0; i < 100; i++) {
                const li = document.createElement("li");
                const lab = document.createElement("label");
                lab.textContent = "todo " + i;
                li.appendChild(lab);
                list.appendChild(li);
                if (i % 3 === 0) li.className = "completed";
                if (i % 5 === 0 && list.firstChild) list.removeChild(list.firstChild);
              }
              return __veDomProfile();
            })()"#,
        )
        .unwrap();
    let nodes = profile
        .get("nodes")
        .and_then(serde_json::Value::as_u64)
        .expect("nodes.size");
    assert!(
        nodes > 0,
        "Phase-0 wrapper map must be populated: {profile}"
    );
    let rss = ve_core::process_rss_bytes();
    let evidence = serde_json::json!({
        "backend": "vector-engine",
        "security_mode": "production",
        "not_a_published_score": true,
        "handles": "numeric_u64",
        "wrapper": "WeakRef+FinalizationRegistry",
        "listeners": "WeakMap",
        "VECTOR_DOM_PROFILE": true,
        "VECTOR_DOM_BINDINGS": std::env::var("VECTOR_DOM_BINDINGS").unwrap_or_else(|_| "prelude".into()),
        "todoMvcIterations": 100,
        "nodesSize": nodes,
        "rssBytes": rss,
        "test": "writes_dombench_phase0_memo",
        "notes": "100 add/toggle/remove cycles on a TodoMVC-shaped list; nodes is prelude WeakMap size after the loop."
    });
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../docs/engine/evidence/dombench-latest.json");
    std::fs::write(
        &path,
        format!("{}\n", serde_json::to_string_pretty(&evidence).unwrap()),
    )
    .unwrap();
}

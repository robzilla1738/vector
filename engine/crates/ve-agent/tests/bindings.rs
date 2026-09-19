//! DOM/Web API bindings over ve-dom (plan A14).
//!
//! Exit criterion: querySelector / innerHTML / events / customElements /
//! attachShadow / fetch-shaped APIs work, and the interaction-lab (shadow
//! counter, virtualized list, infinite scroll) runs fully on the engine.
#![cfg(feature = "v8")]

use ve_agent::{
    Condition, DEFAULT_VIEWPORT, DialogAction, HOST_FUNCTIONS, ObservationRequest, Page, Program,
    ProgramStatus, Step, StepBase,
};
use ve_script::{JsVm, V8Vm};

fn vm() -> Box<dyn JsVm> {
    Box::new(V8Vm::new().unwrap())
}

fn open(html: &str) -> Page {
    Page::from_html_with(
        1,
        html,
        Some("https://s.test/lab"),
        DEFAULT_VIEWPORT,
        Some((vm(), true)),
    )
    .unwrap()
}

#[test]
fn host_table_exposes_the_dom_dispatcher() {
    assert!(
        HOST_FUNCTIONS.contains(&"dom"),
        "A14 host table must include `dom`: {HOST_FUNCTIONS:?}"
    );
}

#[test]
fn structured_clone_is_cycle_aware_and_crypto_is_csprng() {
    let mut page = open("<p>x</p>");
    let cycle = page
        .evaluate(
            r#"(function () {
              const a = { n: 1 };
              a.self = a;
              const c = structuredClone(a);
              return { n: c.n, same: c.self === c, notOrig: c !== a };
            })()"#,
        )
        .unwrap();
    assert_eq!(cycle["n"], 1, "{cycle}");
    assert_eq!(cycle["same"], true, "{cycle}");
    assert_eq!(cycle["notOrig"], true, "{cycle}");
    let date = page
        .evaluate("structuredClone(new Date(0)) instanceof Date && structuredClone(new Date(0)).getTime() === 0")
        .unwrap();
    assert_eq!(date, true, "{date}");
    let fn_err = page.evaluate(
        r#"(function () { try { structuredClone(function () {}); return "ok"; } catch (e) { return e.name; } })()"#,
    );
    assert_eq!(fn_err.unwrap(), "TypeError");
    let rand = page
        .evaluate(
            r#"(function () {
              const a = new Uint8Array(16);
              const b = new Uint8Array(16);
              crypto.getRandomValues(a);
              crypto.getRandomValues(b);
              let diff = 0;
              for (let i = 0; i < 16; i++) if (a[i] !== b[i]) diff++;
              return { type: typeof crypto.getRandomValues, diff };
            })()"#,
        )
        .unwrap();
    assert_eq!(rand["type"], "function", "{rand}");
    assert!(
        rand["diff"].as_u64().unwrap_or(0) >= 1,
        "two CSPRNG fills must differ: {rand}"
    );
    let perf = page
        .evaluate(
            r#"(function () {
              performance.mark("a");
              performance.mark("b");
              const m = performance.measure("ab", "a", "b");
              return { name: m.name, marks: performance.getEntriesByType("mark").length, measured: typeof m.duration };
            })()"#,
        )
        .unwrap();
    assert_eq!(perf["name"], "ab", "{perf}");
    assert_eq!(perf["marks"], 2, "{perf}");
    assert_eq!(perf["measured"], "number", "{perf}");
}

#[test]
fn query_inner_html_events_and_storage_run_on_the_engine() {
    let mut page = open(
        r#"<div id="host"><p class="x">hi</p></div>
           <script>
             const host = document.getElementById('host');
             host.insertAdjacentHTML('beforeend', '<span id="n">0</span>');
             document.getElementById('n').textContent = '1';
             host.querySelector('p.x').classList.add('y');
             localStorage.setItem('k', 'v');
             sessionStorage.setItem('s', '1');
             history.pushState({a:1}, '', '/lab?x=1');
             document.body.addEventListener('click', () => { window.__clicked = 1; });
             document.body.click();
             window.__q = document.querySelectorAll('p').length;
             window.__rect = document.getElementById('host').getBoundingClientRect().width > 0;
             window.__cs = getComputedStyle(host).display;
             window.__href = location.pathname;
             window.__store = localStorage.getItem('k') + sessionStorage.getItem('s');
             window.__hist = history.state.a;
           </script>"#,
    );
    assert!(page.settle(500).settled);
    assert_eq!(page.evaluate("__q").unwrap(), serde_json::json!(1));
    assert_eq!(page.evaluate("__clicked").unwrap(), serde_json::json!(1));
    assert_eq!(page.evaluate("__rect").unwrap(), serde_json::json!(true));
    assert_eq!(page.evaluate("__cs").unwrap(), serde_json::json!("block"));
    assert_eq!(page.evaluate("__store").unwrap(), serde_json::json!("v1"));
    assert_eq!(page.evaluate("__hist").unwrap(), serde_json::json!(1));
    assert_eq!(
        page.evaluate("document.querySelector('#n').textContent")
            .unwrap(),
        serde_json::json!("1")
    );
    assert!(
        page.evaluate("document.querySelector('p.x.y') !== null")
            .unwrap()
            .as_bool()
            .unwrap()
    );
}

#[test]
fn interaction_lab_shadow_counter_virtual_list_and_infinite_scroll() {
    // Same behaviours as fixtures/interaction-lab, including the 120ms
    // infinite-scroll batch delay; settle() advances virtual time past it.
    let mut page = open(
        r#"<div class="card"><h2>Shadow DOM widget</h2>
             <shadow-counter></shadow-counter>
           </div>
           <div id="vlist" style="height:220px;overflow:auto;border:1px solid #000;position:relative">
             <div id="vlist-spacer" style="position:relative"></div>
           </div>
           <p>Rendered rows: <span id="vcount">0</span></p>
           <div id="infinite" style="height:180px;overflow:auto"></div>
           <p>Loaded <span id="iloaded">0</span> items</p>
           <script>
             class ShadowCounter extends HTMLElement {
               constructor(){
                 super();
                 const r = this.attachShadow({mode:'open'});
                 r.innerHTML = '<button id="inc">Increment</button> <span id="n">0</span>';
                 r.getElementById('inc').addEventListener('click', () => {
                   r.getElementById('n').textContent = String(+r.getElementById('n').textContent + 1);
                 });
               }
             }
             customElements.define('shadow-counter', ShadowCounter);

             const ROW_H = 26, TOTAL = 10000;
             const vlist = document.getElementById('vlist'), spacer = document.getElementById('vlist-spacer');
             spacer.style.height = (TOTAL * ROW_H) + 'px';
             function renderV(){
               const start = Math.max(0, Math.floor(vlist.scrollTop / ROW_H) - 4);
               const end = Math.min(TOTAL, start + Math.ceil(vlist.clientHeight / ROW_H) + 8);
               let html = '';
               for (let i = start; i < end; i++)
                 html += '<div class="vrow" data-key="row-' + String(i).padStart(6,'0') + '" style="position:absolute;top:' + (i*ROW_H) + 'px;left:0;right:0;height:' + ROW_H + 'px">row-' + String(i).padStart(6,'0') + '</div>';
               spacer.innerHTML = html;
               document.getElementById('vcount').textContent = String(end - start);
             }
             vlist.addEventListener('scroll', renderV); renderV();

             const inf = document.getElementById('infinite');
             let loaded = 0, done = false, loading = false;
             function loadMore(){
               if (loading || done) return; loading = true;
               setTimeout(() => {
                 const batch = Math.min(20, 120 - loaded);
                 for (let i = 0; i < batch; i++)
                   inf.insertAdjacentHTML('beforeend','<div class="irow" data-key="item-'+(loaded+i)+'">item-'+(loaded+i)+'</div>');
                 loaded += batch; loading = false;
                 document.getElementById('iloaded').textContent = String(loaded);
                 if (loaded >= 120) done = true;
               }, 10);
             }
             inf.addEventListener('scroll', () => {
               if (inf.scrollTop + inf.clientHeight > inf.scrollHeight - 60) loadMore();
             });
             loadMore();
           </script>"#,
    );
    let settled = page.settle(500);
    assert!(settled.settled, "{settled:?}");

    let n = page
        .evaluate(
            "document.querySelector('shadow-counter').shadowRoot.getElementById('n').textContent",
        )
        .unwrap();
    assert_eq!(n, serde_json::json!("0"));
    page.evaluate(
        "document.querySelector('shadow-counter').shadowRoot.getElementById('inc').click()",
    )
    .unwrap();
    let n = page
        .evaluate(
            "document.querySelector('shadow-counter').shadowRoot.getElementById('n').textContent",
        )
        .unwrap();
    assert_eq!(n, serde_json::json!("1"));

    let vcount: i64 = page
        .evaluate("Number(document.getElementById('vcount').textContent)")
        .unwrap()
        .as_i64()
        .unwrap();
    assert!(
        (8..=40).contains(&vcount),
        "virtualized list should render a window of rows, got {vcount}"
    );
    assert!(
        page.evaluate("document.querySelector('[data-key=\"row-000000\"]') !== null")
            .unwrap()
            .as_bool()
            .unwrap()
    );

    page.evaluate("document.getElementById('vlist').scrollTop = 26 * 500")
        .unwrap();
    assert!(
        page.evaluate("document.querySelector('[data-key=\"row-000500\"]') !== null")
            .unwrap()
            .as_bool()
            .unwrap(),
        "scrolling the virtual list must reuse row keys"
    );

    let loaded: i64 = page
        .evaluate("Number(document.getElementById('iloaded').textContent)")
        .unwrap()
        .as_i64()
        .unwrap();
    assert_eq!(loaded, 20, "first infinite-scroll batch fires during load");
}

#[test]
fn trusted_click_dispatches_js_before_activation() {
    let mut page = open(
        r#"<button id="b">Go</button>
           <script>
             document.getElementById('b').addEventListener('click', () => {
               window.__n = (window.__n || 0) + 1;
             });
           </script>"#,
    );
    let program = Program {
        steps: vec![Step::Click {
            base: StepBase {
                id: "c".into(),
                ..StepBase::default()
            },
            target: "css:#b".into(),
            button: None,
        }],
        ..Program::default()
    };
    let result = page.execute(&program);
    assert_eq!(result.status, ProgramStatus::Completed, "{result:?}");
    assert_eq!(page.evaluate("__n").unwrap(), serde_json::json!(1));
}

#[test]
fn generated_webidl_traits_compile_in_the_vm_crate() {
    let interfaces =
        ve_script::parse_webidl(include_str!("../../ve-script/idl/01-node.webidl")).unwrap();
    assert_eq!(interfaces[0].name, "Node");
    assert!(ve_script::generate_rust_stub(&interfaces[0]).contains("trait NodeInterface"));
    let window =
        ve_script::parse_webidl(include_str!("../../ve-script/idl/05-window.webidl")).unwrap();
    assert_eq!(window[0].name, "Window");
}

#[test]
fn match_media_orientation_and_compound_queries() {
    let mut page = open("<title>mq</title>");
    assert_eq!(
        page.evaluate("matchMedia('(min-width: 1px)').matches")
            .unwrap(),
        serde_json::json!(true)
    );
    let land = page
        .evaluate("matchMedia('(orientation: landscape)').matches")
        .unwrap();
    let expected = page.evaluate("innerWidth >= innerHeight").unwrap();
    assert_eq!(land, expected);
    assert_eq!(
        page.evaluate("matchMedia('(prefers-reduced-motion: no-preference)').matches")
            .unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("matchMedia('(min-width: 1px) and (max-width: 10000px)').matches")
            .unwrap(),
        serde_json::json!(true)
    );
}

#[test]
fn javascript_url_dialog_and_wait_for_expression() {
    let mut page = open(
        r#"<p id="p">no</p>
           <dialog id="d" open><p>html dialog</p></dialog>
           <script>
             window.ready = false;
             setTimeout(() => { window.ready = true; document.getElementById('p').textContent = 'yes'; }, 20);
             alert('hi');
           </script>"#,
    );
    page.settle(50);
    assert_eq!(page.open_dialogs().len(), 2, "script alert + html dialog");
    let program = Program {
        steps: vec![
            Step::Dialog {
                base: StepBase {
                    id: "a".into(),
                    ..StepBase::default()
                },
                action: DialogAction::Accept,
                prompt_text: None,
            },
            Step::Dialog {
                base: StepBase {
                    id: "h".into(),
                    ..StepBase::default()
                },
                action: DialogAction::Dismiss,
                prompt_text: None,
            },
            Step::WaitFor {
                base: StepBase {
                    id: "w".into(),
                    timeout_ms: Some(500),
                    ..StepBase::default()
                },
                condition: Condition::Expression {
                    expression: "window.ready === true".into(),
                    timeout_ms: Some(500),
                },
            },
        ],
        ..Program::default()
    };
    let result = page.execute(&program);
    assert_eq!(result.status, ProgramStatus::Completed, "{result:?}");
    assert_eq!(
        page.evaluate("document.getElementById('p').textContent")
            .unwrap(),
        serde_json::json!("yes")
    );
    page.navigate("javascript:document.getElementById('p').textContent='js'")
        .unwrap();
    assert_eq!(
        page.evaluate("document.getElementById('p').textContent")
            .unwrap(),
        serde_json::json!("js")
    );
}

#[test]
fn incremental_update_and_css_coverage_are_wired() {
    let mut page = open(
        r#"<style>p { color: red; writing-mode: vertical-rl; transform: rotate(1deg); }</style>
           <p id="t">hello</p>
           <script>document.getElementById('t').textContent = 'mutated';</script>"#,
    );
    let cov = page.routing().css_coverage.clone().expect("css coverage");
    assert!(cov.declarations_total >= 3, "{cov:?}");
    assert_eq!(
        page.evaluate("document.getElementById('t').textContent")
            .unwrap(),
        serde_json::json!("mutated")
    );
    page.evaluate("document.getElementById('t').style.display='none'")
        .unwrap();
    page.update();
    assert!(page.settle(200).settled);
}

#[test]
fn generation_checked_refs_reject_recycled_slots() {
    let mut page = open(r#"<button id="b">Go</button>"#);
    let obs = page.observe_now(&ObservationRequest::default());
    let r = obs
        .elements
        .iter()
        .find(|e| e.tag == "button")
        .expect("button")
        .reference
        .clone();
    page.evaluate(
        "document.getElementById('b').remove(); document.body.appendChild(document.createElement('p'));",
    )
    .unwrap();
    page.update();
    let program = Program {
        steps: vec![Step::Click {
            base: StepBase {
                id: "c".into(),
                ..StepBase::default()
            },
            target: r,
            button: None,
        }],
        ..Program::default()
    };
    let result = page.execute(&program);
    assert_ne!(
        result.status,
        ProgramStatus::Completed,
        "stale ref after recycle must fail: {result:?}"
    );
}

#[test]
fn indexeddb_and_worker_round_trip() {
    let mut page = open(
        r#"<script>
             window.__idb = 'pending';
             const req = indexedDB.open('app');
             req.onsuccess = () => {
               const db = req.result;
               db.createObjectStore('kv');
               db.transaction('kv').objectStore().put({v:1}, 'k');
               const g = db.transaction('kv').objectStore().get('k');
               g.onsuccess = () => {
                 window.__idb = (g.result && g.result.v === 1) ? 'ok' : 'bad';
               };
             };
             const w = new Worker('echo.js');
             w.onmessage = (e) => { window.__w = e.data; };
             w.postMessage('ping');
           </script>"#,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__idb").unwrap(),
        serde_json::json!("ok")
    );
    assert_eq!(
        page.evaluate("window.__w").unwrap(),
        serde_json::json!("ping")
    );
}

#[test]
fn indexeddb_object_store_names_are_real() {
    let mut page = open(
        r#"<script>
             window.__names = 'pending';
             const req = indexedDB.open('stores');
             req.onsuccess = () => {
               const db = req.result;
               db.createObjectStore('kv');
               window.__names = db.objectStoreNames.contains('kv') && !db.objectStoreNames.contains('missing') ? 'ok' : 'bad';
             };
           </script>"#,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__names").unwrap(),
        serde_json::json!("ok")
    );
}

#[test]
fn indexeddb_index_cursor_and_isolated_worker() {
    let mut page = open(
        r#"<script>
             window.__idx = 'pending';
             window.__iso = 'pending';
             const req = indexedDB.open('app2');
             req.onsuccess = () => {
               const db = req.result;
               const store = db.transaction('kv').objectStore();
               store.createIndex('name', 'name');
               store.put({name:'Ada'}, '1');
               const g = store.index('name').get('Ada');
               g.onsuccess = () => {
                 window.__idx = (g.result && g.result.name === 'Ada') ? 'ok' : 'bad';
               };
             };
             const w = new Worker("onmessage=function(e){postMessage({iso: typeof document, echo: e.data, wr: typeof WeakRef})}");
             w.onmessage = (e) => { window.__iso = e.data; };
             w.postMessage('ping');
           </script>"#,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__idx").unwrap(),
        serde_json::json!("ok")
    );
    assert_eq!(
        page.evaluate("window.__iso.iso").unwrap(),
        serde_json::json!("undefined")
    );
    assert_eq!(
        page.evaluate("window.__iso.echo").unwrap(),
        serde_json::json!("ping")
    );
    assert_eq!(
        page.evaluate("window.__iso.wr").unwrap(),
        serde_json::json!("function")
    );
}

#[test]
fn doctype_pi_and_prefixed_html_nodename() {
    let mut page = open("<!DOCTYPE html><body></body>");
    let v = page
        .evaluate(
            r#"(function () {
              var HTMLNS = "http://www.w3.org/1999/xhtml";
              var pi = document.createProcessingInstruction("pi", "A PI!");
              pi.nodeValue = "test again";
              var dt = document.implementation.createDocumentType("x", "", "");
              var xb = document.createElementNS(HTMLNS, "x:b");
              document.body.textContent = "keep";
              var root = document.documentElement;
              document.textContent = "a";
              return {
                doctype: document.doctype && document.doctype.nodeName === "html",
                doctypeNull: document.doctype.nodeValue === null && document.doctype.textContent === null,
                pi: pi.nodeName === "pi" && pi.nodeValue === "test again" && pi.target === "pi",
                dt: dt.nodeName === "x" && dt.name === "x" && dt.textContent === null,
                xb: xb.nodeName === "X:B" && xb.prefix === "x",
                docText: document.textContent === null && document.documentElement === root
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["doctype"], true, "{v}");
    assert_eq!(v["doctypeNull"], true, "{v}");
    assert_eq!(v["pi"], true, "{v}");
    assert_eq!(v["dt"], true, "{v}");
    assert_eq!(v["xb"], true, "{v}");
    assert_eq!(v["docText"], true, "{v}");
}

#[test]
fn indexeddb_unique_compound_and_versionchange() {
    let mut page = open(
        r#"<script>
             window.__u = 'pending';
             window.__c = 'pending';
             window.__v = 'pending';
             const r1 = indexedDB.open('people', 1);
             r1.onupgradeneeded = () => {
               const store = r1.result.createObjectStore('p');
               store.createIndex('name', 'name', { unique: true });
               store.createIndex('full', ['last','first']);
             };
             r1.onsuccess = () => {
               const store = r1.result.transaction('p').objectStore();
               store.put({name:'Ada', last:'Lovelace', first:'Ada'}, '1');
               const dup = store.put({name:'Ada', last:'X', first:'Y'}, '2');
               dup.onerror = () => { window.__u = 'ok'; };
               dup.onsuccess = () => { window.__u = 'dup-allowed'; };
               const g = store.index('full').get('Lovelace\u0000Ada');
               g.onsuccess = () => { window.__c = (g.result && g.result.first === 'Ada') ? 'ok' : 'bad'; };
               const r2 = indexedDB.open('people', 1);
               r2.onupgradeneeded = () => { window.__v = 'upgraded-again'; };
               r2.onsuccess = () => { if (window.__v === 'pending') window.__v = 'ok'; };
             };
           </script>"#,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__u").unwrap(),
        serde_json::json!("ok")
    );
    assert_eq!(
        page.evaluate("window.__c").unwrap(),
        serde_json::json!("ok")
    );
    assert_eq!(
        page.evaluate("window.__v").unwrap(),
        serde_json::json!("ok")
    );
}

#[test]
fn indexeddb_abort_restores_snapshot() {
    let mut page = open(
        r#"<script>
             window.__aborted = 'pending';
             const req = indexedDB.open('abort-db');
             req.onsuccess = () => {
               const db = req.result;
               db.createObjectStore('kv');
               const keep = db.transaction('kv');
               keep.objectStore().put({v:1}, 'keep');
               keep.oncomplete = () => {
                 const tx = db.transaction('kv');
                 tx.objectStore().put({v:2}, 'gone');
                 tx.abort();
                 const g1 = db.transaction('kv').objectStore().get('keep');
                 g1.onsuccess = () => {
                   const g2 = db.transaction('kv').objectStore().get('gone');
                   g2.onsuccess = () => {
                     window.__aborted = (g1.result && g1.result.v === 1 && g2.result == null) ? 'ok' : 'bad';
                   };
                 };
               };
             };
           </script>"#,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__aborted").unwrap(),
        serde_json::json!("ok")
    );
}

#[test]
fn get_element_by_id_stringifies_null_and_undefined() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var a = document.createElement("div");
              a.setAttribute("id", "null");
              document.body.appendChild(a);
              var b = document.createElement("div");
              b.setAttribute("id", "undefined");
              document.body.appendChild(b);
              return {
                byNull: document.getElementById(null) === a,
                byUndef: document.getElementById(undefined) === b,
                byStr: document.getElementById("null") === a
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["byNull"], true, "{v}");
    assert_eq!(v["byUndef"], true, "{v}");
    assert_eq!(v["byStr"], true, "{v}");
}

#[test]
fn create_html_document_and_live_collections() {
    let mut page = open(r#"<body><a href="">one</a><a href="">two</a><form id="f"></form></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var doc = document.implementation.createHTMLDocument("Hello");
              var childless = document.implementation.createHTMLDocument("");
              childless.removeChild(childless.documentElement);
              var html = childless.appendChild(childless.createElement("html"));
              var b = html.appendChild(childless.createElement("body"));
              html.appendChild(childless.createElement("frameset"));
              var links = document.links;
              var a = document.createElement("a");
              a.setAttribute("href", "");
              document.body.appendChild(a);
              var grew = links.length;
              document.body.removeChild(a);
              return {
                title: doc.title,
                hasBody: doc.body instanceof HTMLBodyElement,
                childlessBody: childless.body === b,
                linksLive: grew === 3 && document.links.length === 2,
                forms: document.forms.length === 1 && document.forms instanceof HTMLCollection,
                impl: typeof document.implementation.hasFeature === "function"
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["title"], "Hello", "{v}");
    assert_eq!(v["hasBody"], true, "{v}");
    assert_eq!(v["childlessBody"], true, "{v}");
    assert_eq!(v["linksLive"], true, "{v}");
    assert_eq!(v["forms"], true, "{v}");
    assert_eq!(v["impl"], true, "{v}");
}

#[test]
fn canvas_fillrect_records_ops() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 40;
              c.height = 20;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(0, 0, 10, 10);
              ctx.clearRect(0, 0, 5, 5);
              ctx.resetTransform();
              return {
                ctx: ctx instanceof CanvasRenderingContext2D,
                reset: typeof ctx.resetTransform === "function",
                w: c.width,
                h: c.height,
                webgl: c.getContext("webgl") === null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ctx"], true, "{v}");
    assert_eq!(v["reset"], true, "{v}");
    assert_eq!(v["w"], 40, "{v}");
    assert_eq!(v["h"], 20, "{v}");
    assert_eq!(v["webgl"], true, "{v}");
}

#[test]
fn canvas_linear_gradient_fills_pixels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 100;
              c.height = 8;
              var ctx = c.getContext("2d");
              var g = ctx.createLinearGradient(0, 0, 100, 0);
              g.addColorStop(0, "#ff0000");
              g.addColorStop(1, "#0000ff");
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, 100, 8);
              var left = ctx.getImageData(0, 0, 1, 1).data;
              var right = ctx.getImageData(99, 0, 1, 1).data;
              return {
                lr: left[0], lg: left[1], lb: left[2],
                rr: right[0], rg: right[1], rb: right[2],
                encoded: String(g).indexOf("ve-grad:linear:") === 0
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["encoded"], true, "{v}");
    assert!(v["lr"].as_u64().unwrap_or(0) > 200, "left red: {v}");
    assert!(v["lb"].as_u64().unwrap_or(99) < 40, "left not blue: {v}");
    assert!(v["rb"].as_u64().unwrap_or(0) > 200, "right blue: {v}");
    assert!(v["rr"].as_u64().unwrap_or(99) < 40, "right not red: {v}");
}

#[test]
fn canvas_radial_gradient_fills_center() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              var g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
              g.addColorStop(0, "#ff0000");
              g.addColorStop(1, "#0000ff");
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, 16, 16);
              var center = ctx.getImageData(8, 8, 1, 1).data;
              var edge = ctx.getImageData(15, 8, 1, 1).data;
              return {
                cr: center[0], cb: center[2],
                er: edge[0], eb: edge[2],
                encoded: String(g).indexOf("ve-grad:radial:") === 0
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["encoded"], true, "{v}");
    assert!(v["cr"].as_f64().unwrap_or(0.0) > 200.0, "center red: {v}");
    assert!(
        v["cb"].as_f64().unwrap_or(99.0) < 40.0,
        "center not blue: {v}"
    );
    assert!(v["eb"].as_f64().unwrap_or(0.0) > 200.0, "edge blue: {v}");
    assert!(v["er"].as_f64().unwrap_or(99.0) < 40.0, "edge not red: {v}");
}

#[test]
fn canvas_conic_gradient_sweeps_around_center() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              var g = ctx.createConicGradient(0, 8, 8);
              g.addColorStop(0, "#ff0000");
              g.addColorStop(0.5, "#0000ff");
              g.addColorStop(1, "#ff0000");
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, 16, 16);
              var right = ctx.getImageData(14, 8, 1, 1).data;
              var left = ctx.getImageData(2, 8, 1, 1).data;
              return {
                encoded: String(g).indexOf("ve-grad:conic:") === 0,
                rr: right[0], rb: right[2],
                lr: left[0], lb: left[2]
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["encoded"], true, "{v}");
    assert!(v["rr"].as_f64().unwrap_or(0.0) > 200.0, "right red: {v}");
    assert!(
        v["rb"].as_f64().unwrap_or(99.0) < 40.0,
        "right not blue: {v}"
    );
    assert!(v["lb"].as_f64().unwrap_or(0.0) > 200.0, "left blue: {v}");
    assert!(v["lr"].as_f64().unwrap_or(99.0) < 40.0, "left not red: {v}");
}

#[test]
fn canvas_create_pattern_repeats_source_pixels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var src = document.createElement("canvas");
              src.width = 2;
              src.height = 2;
              var sctx = src.getContext("2d");
              sctx.fillStyle = "#00ff00";
              sctx.fillRect(0, 0, 2, 2);
              var dst = document.createElement("canvas");
              dst.width = 8;
              dst.height = 8;
              var ctx = dst.getContext("2d");
              var pat = ctx.createPattern(src, "repeat");
              ctx.fillStyle = pat;
              ctx.fillRect(0, 0, 8, 8);
              var a = ctx.getImageData(0, 0, 1, 1).data;
              var b = ctx.getImageData(3, 5, 1, 1).data;
              var c = ctx.getImageData(7, 7, 1, 1).data;
              return {
                encoded: String(pat).indexOf("ve-pat:") === 0,
                ag: a[1], aa: a[3],
                bg: b[1], ba: b[3],
                cg: c[1], ca: c[3]
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["encoded"], true, "{v}");
    assert_eq!(v["ag"], 255, "{v}");
    assert_eq!(v["aa"], 255, "{v}");
    assert_eq!(v["bg"], 255, "{v}");
    assert_eq!(v["ba"], 255, "{v}");
    assert_eq!(v["cg"], 255, "{v}");
    assert_eq!(v["ca"], 255, "{v}");
}

#[test]
fn canvas_pattern_set_transform_shifts_tile() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var src = document.createElement("canvas");
              src.width = 2;
              src.height = 1;
              var sctx = src.getContext("2d");
              sctx.fillStyle = "#ff0000";
              sctx.fillRect(0, 0, 1, 1);
              sctx.fillStyle = "#0000ff";
              sctx.fillRect(1, 0, 1, 1);
              var dst = document.createElement("canvas");
              dst.width = 4;
              dst.height = 2;
              var ctx = dst.getContext("2d");
              var pat = ctx.createPattern(src, "repeat");
              ctx.fillStyle = pat;
              ctx.fillRect(0, 0, 4, 2);
              var before = ctx.getImageData(0, 0, 1, 1).data;
              pat.setTransform({ a: 1, b: 0, c: 0, d: 1, e: 1, f: 0 });
              ctx.fillRect(0, 0, 4, 2);
              var after = ctx.getImageData(0, 0, 1, 1).data;
              return {
                br: before[0], bb: before[2],
                ar: after[0], ab: after[2],
                encoded: String(pat).indexOf("1,0,0,1,1,0") >= 0
              };
            })()"##,
        )
        .unwrap();
    assert!(
        v["br"].as_u64().unwrap_or(0) > 200,
        "identity samples red: {v}"
    );
    assert_eq!(v["bb"], 0, "{v}");
    assert_eq!(
        v["ar"], 0,
        "translate(1,0) must sample the blue column: {v}"
    );
    assert!(v["ab"].as_u64().unwrap_or(0) > 200, "{v}");
    assert_eq!(v["encoded"], true, "{v}");
}

#[test]
fn canvas_create_pattern_no_repeat_stays_in_tile() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var src = document.createElement("canvas");
              src.width = 2;
              src.height = 2;
              var sctx = src.getContext("2d");
              sctx.fillStyle = "#00ff00";
              sctx.fillRect(0, 0, 2, 2);
              var dst = document.createElement("canvas");
              dst.width = 8;
              dst.height = 8;
              var ctx = dst.getContext("2d");
              var pat = ctx.createPattern(src, "no-repeat");
              ctx.fillStyle = pat;
              ctx.fillRect(0, 0, 8, 8);
              var a = ctx.getImageData(0, 0, 1, 1).data;
              var b = ctx.getImageData(3, 0, 1, 1).data;
              var c = ctx.getImageData(0, 3, 1, 1).data;
              return {
                encoded: String(pat),
                ag: a[1], aa: a[3],
                ba: b[3],
                ca: c[3]
              };
            })()"##,
        )
        .unwrap();
    assert!(
        v["encoded"].as_str().unwrap_or("").contains("no-repeat"),
        "{v}"
    );
    assert_eq!(v["ag"], 255, "{v}");
    assert_eq!(v["aa"], 255, "{v}");
    assert_eq!(v["ba"], 0, "{v}");
    assert_eq!(v["ca"], 0, "{v}");
}

#[test]
fn canvas_destination_over_keeps_dst() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 8;
              c.height = 8;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(0, 0, 8, 8);
              ctx.globalCompositeOperation = "destination-over";
              ctx.fillStyle = "#0000ff";
              ctx.fillRect(0, 0, 8, 8);
              var p = ctx.getImageData(2, 2, 1, 1).data;
              ctx.globalCompositeOperation = "xor";
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 8, 8);
              var x = ctx.getImageData(2, 2, 1, 1).data;
              return { r: p[0], g: p[1], b: p[2], a: p[3], xa: x[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["r"], 255, "{v}");
    assert_eq!(v["g"], 0, "{v}");
    assert_eq!(v["b"], 0, "{v}");
    assert_eq!(v["a"], 255, "{v}");
    assert_eq!(v["xa"], 0, "{v}");
}

#[test]
fn canvas_source_in_and_destination_in_clip_to_overlap() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op) {
                var c = document.createElement("canvas");
                c.width = 8;
                c.height = 8;
                var ctx = c.getContext("2d");
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(0, 0, 4, 8);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = "#00ff00";
                ctx.fillRect(2, 0, 6, 8);
                var overlap = ctx.getImageData(3, 3, 1, 1).data;
                var destOnly = ctx.getImageData(0, 3, 1, 1).data;
                var srcOnly = ctx.getImageData(6, 3, 1, 1).data;
                return {
                  or: overlap[0], og: overlap[1], oa: overlap[3],
                  da: destOnly[3], sa: srcOnly[3]
                };
              }
              return { src: sample("source-in"), dst: sample("destination-in") };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["src"]["og"], 255, "{v}");
    assert_eq!(v["src"]["or"], 0, "{v}");
    assert_eq!(v["src"]["oa"], 255, "{v}");
    assert_eq!(v["src"]["da"], 255, "{v}");
    assert_eq!(v["src"]["sa"], 0, "{v}");
    assert_eq!(v["dst"]["or"], 255, "{v}");
    assert_eq!(v["dst"]["og"], 0, "{v}");
    assert_eq!(v["dst"]["oa"], 255, "{v}");
    assert_eq!(v["dst"]["da"], 255, "{v}");
    assert_eq!(v["dst"]["sa"], 0, "{v}");
}

#[test]
fn canvas_source_out_and_destination_out_punch_overlap() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op) {
                var c = document.createElement("canvas");
                c.width = 8;
                c.height = 8;
                var ctx = c.getContext("2d");
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(0, 0, 4, 8);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = "#00ff00";
                ctx.fillRect(2, 0, 6, 8);
                var overlap = ctx.getImageData(3, 3, 1, 1).data;
                var destOnly = ctx.getImageData(0, 3, 1, 1).data;
                var srcOnly = ctx.getImageData(6, 3, 1, 1).data;
                return {
                  or: overlap[0], og: overlap[1], oa: overlap[3],
                  da: destOnly[3], dr: destOnly[0],
                  sa: srcOnly[3], sg: srcOnly[1]
                };
              }
              return { src: sample("source-out"), dst: sample("destination-out") };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["src"]["oa"], 0, "source-out overlap must vanish: {v}");
    assert_eq!(v["src"]["da"], 255, "source-out dest-only stays: {v}");
    assert_eq!(v["src"]["sa"], 255, "source-out src-only stays: {v}");
    assert_eq!(v["src"]["sg"], 255, "{v}");
    assert_eq!(
        v["dst"]["oa"], 0,
        "destination-out overlap must vanish: {v}"
    );
    assert_eq!(v["dst"]["da"], 255, "destination-out dest-only stays: {v}");
    assert_eq!(v["dst"]["dr"], 255, "{v}");
    assert_eq!(v["dst"]["sa"], 0, "destination-out src-only vanishes: {v}");
}

#[test]
fn canvas_source_atop_and_destination_atop_keep_overlap() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op) {
                var c = document.createElement("canvas");
                c.width = 8;
                c.height = 8;
                var ctx = c.getContext("2d");
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(0, 0, 4, 8);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = "#00ff00";
                ctx.fillRect(2, 0, 6, 8);
                var overlap = ctx.getImageData(3, 3, 1, 1).data;
                var destOnly = ctx.getImageData(0, 3, 1, 1).data;
                var srcOnly = ctx.getImageData(6, 3, 1, 1).data;
                return {
                  or: overlap[0], og: overlap[1], oa: overlap[3],
                  da: destOnly[3], dr: destOnly[0],
                  sa: srcOnly[3]
                };
              }
              return { src: sample("source-atop"), dst: sample("destination-atop") };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["src"]["og"], 255, "source-atop overlap is source: {v}");
    assert_eq!(v["src"]["oa"], 255, "{v}");
    assert_eq!(v["src"]["da"], 255, "source-atop dest-only stays: {v}");
    assert_eq!(v["src"]["sa"], 0, "source-atop src-only vanishes: {v}");
    assert_eq!(v["dst"]["or"], 255, "destination-atop overlap is dest: {v}");
    assert_eq!(v["dst"]["oa"], 255, "{v}");
    assert_eq!(v["dst"]["da"], 255, "unpainted dest-only stays: {v}");
    assert_eq!(v["dst"]["sa"], 255, "destination-atop src-only stays: {v}");
}

#[test]
fn canvas_filter_blur_spills_outside_fill_rect() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.filter = "blur(2px)";
              ctx.fillRect(6, 6, 4, 4);
              var mid = ctx.getImageData(8, 8, 1, 1).data;
              var halo = ctx.getImageData(4, 8, 1, 1).data;
              ctx.filter = "none";
              ctx.clearRect(0, 0, 16, 16);
              ctx.fillRect(6, 6, 4, 4);
              var sharp = ctx.getImageData(4, 8, 1, 1).data;
              return { mg: mid[1], ma: mid[3], hg: halo[1], ha: halo[3], sa: sharp[3] };
            })()"##,
        )
        .unwrap();
    assert!(v["mg"].as_u64().unwrap_or(0) > 20, "blurred fill keeps center: {v}");
    assert!(v["ha"].as_u64().unwrap_or(0) > 0, "blur must spill outside the rect: {v}");
    assert_eq!(v["sa"], 0, "without filter the halo pixel stays empty: {v}");
}

#[test]
fn canvas_filter_blur_spills_outside_fill_path() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.filter = "blur(2px)";
              ctx.beginPath();
              ctx.rect(6, 6, 4, 4);
              ctx.fill();
              var mid = ctx.getImageData(8, 8, 1, 1).data;
              var halo = ctx.getImageData(4, 8, 1, 1).data;
              return { mg: mid[1], ma: mid[3], ha: halo[3] };
            })()"##,
        )
        .unwrap();
    assert!(
        v["mg"].as_u64().unwrap_or(0) > 20,
        "blurred path fill keeps center: {v}"
    );
    assert!(
        v["ha"].as_u64().unwrap_or(0) > 0,
        "path blur must spill outside the rect: {v}"
    );
}

#[test]
fn canvas_lighter_adds_overlapping_channels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 4;
              c.height = 4;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(0, 0, 4, 4);
              ctx.globalCompositeOperation = "lighter";
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 4, 4);
              var p = ctx.getImageData(1, 1, 1, 1).data;
              return { r: p[0], g: p[1], b: p[2], a: p[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["r"], 255, "{v}");
    assert_eq!(v["g"], 255, "{v}");
    assert_eq!(v["b"], 0, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn canvas_multiply_and_screen_blend_channels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op, dest, src) {
                var c = document.createElement("canvas");
                c.width = 4;
                c.height = 4;
                var ctx = c.getContext("2d");
                ctx.fillStyle = dest;
                ctx.fillRect(0, 0, 4, 4);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = src;
                ctx.fillRect(0, 0, 4, 4);
                var p = ctx.getImageData(1, 1, 1, 1).data;
                return { r: p[0], g: p[1], b: p[2], a: p[3] };
              }
              return {
                mul: sample("multiply", "#ff0000", "#808080"),
                screen: sample("screen", "#000000", "#00ff00")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["mul"]["r"], 128, "{v}");
    assert_eq!(v["mul"]["g"], 0, "{v}");
    assert_eq!(v["mul"]["b"], 0, "{v}");
    assert_eq!(v["screen"]["g"], 255, "{v}");
    assert_eq!(v["screen"]["r"], 0, "{v}");
}

#[test]
fn canvas_overlay_and_difference_blend_channels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op, dest, src) {
                var c = document.createElement("canvas");
                c.width = 4;
                c.height = 4;
                var ctx = c.getContext("2d");
                ctx.fillStyle = dest;
                ctx.fillRect(0, 0, 4, 4);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = src;
                ctx.fillRect(0, 0, 4, 4);
                var p = ctx.getImageData(1, 1, 1, 1).data;
                return { r: p[0], g: p[1], b: p[2], a: p[3] };
              }
              return {
                overlay: sample("overlay", "#400000", "#ffffff"),
                diff: sample("difference", "#ff0000", "#00ff00")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["overlay"]["r"], 128, "{v}");
    assert_eq!(v["diff"]["r"], 255, "{v}");
    assert_eq!(v["diff"]["g"], 255, "{v}");
    assert_eq!(v["diff"]["b"], 0, "{v}");
}

#[test]
fn canvas_offscreen_and_image_bitmap_round_trip() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var off = new OffscreenCanvas(4, 4);
              var ctx = off.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 4, 4);
              var painted = ctx.getImageData(1, 1, 1, 1).data;
              var bmp = off.transferToImageBitmap();
              var dst = document.createElement("canvas");
              dst.width = 4;
              dst.height = 4;
              dst.getContext("2d").drawImage(bmp, 0, 0);
              var copied = dst.getContext("2d").getImageData(1, 1, 1, 1).data;
              var cleared = ctx.getImageData(1, 1, 1, 1).data;
              return {
                pg: painted[1], pa: painted[3],
                cg: copied[1], ca: copied[3],
                ea: cleared[3],
                w: bmp.width, h: bmp.height,
                inst: bmp instanceof ImageBitmap
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["pg"], 255, "{v}");
    assert_eq!(v["cg"], 255, "{v}");
    assert_eq!(v["ea"], 0, "transfer must clear the offscreen canvas: {v}");
    assert_eq!(v["w"], 4, "{v}");
    assert_eq!(v["inst"], true, "{v}");
}

#[test]
fn canvas_create_image_bitmap_draws() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          var src = document.createElement("canvas");
          src.width = 4;
          src.height = 4;
          var sctx = src.getContext("2d");
          sctx.fillStyle = "#0000ff";
          sctx.fillRect(0, 0, 4, 4);
          createImageBitmap(src).then(function (bmp) {
            var dst = document.createElement("canvas");
            dst.width = 4;
            dst.height = 4;
            dst.getContext("2d").drawImage(bmp, 0, 0);
            var p = dst.getContext("2d").getImageData(1, 1, 1, 1).data;
            window.__ib = { w: bmp.width, inst: bmp instanceof ImageBitmap, b: p[2], a: p[3] };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__ib").unwrap();
    assert_eq!(v["w"], 4, "{v}");
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["b"], 255, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn canvas_draw_focus_if_needed_strokes_path() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.beginPath();
              ctx.rect(2, 2, 12, 12);
              ctx.drawFocusIfNeeded(c);
              var ring = ctx.getImageData(2, 8, 1, 1).data;
              return { b: ring[2], a: ring[3] };
            })()"##,
        )
        .unwrap();
    assert!(
        v["a"].as_u64().unwrap_or(0) > 0,
        "focus ring must paint: {v}"
    );
    assert!(
        v["b"].as_u64().unwrap_or(0) > 100,
        "focus ring is blue: {v}"
    );
}

#[test]
fn canvas_reset_clears_pixels_and_transform() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 4;
              c.height = 4;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.translate(2, 0);
              ctx.fillRect(0, 0, 2, 2);
              ctx.reset();
              var gone = ctx.getImageData(2, 0, 1, 1).data;
              ctx.fillRect(0, 0, 2, 2);
              var black = ctx.getImageData(0, 0, 1, 1).data;
              return { ga: gone[3], br: black[0], ba: black[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ga"], 0, "reset must clear prior pixels: {v}");
    assert_eq!(v["br"], 0, "reset fillStyle is black: {v}");
    assert_eq!(v["ba"], 255, "{v}");
}

#[test]
fn canvas_bitmaprenderer_transfers_image_bitmap() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var off = new OffscreenCanvas(4, 4);
              var octx = off.getContext("2d");
              octx.fillStyle = "#ff0000";
              octx.fillRect(0, 0, 4, 4);
              var bmp = off.transferToImageBitmap();
              var dst = document.createElement("canvas");
              dst.width = 4;
              dst.height = 4;
              var br = dst.getContext("bitmaprenderer");
              br.transferFromImageBitmap(bmp);
              var probe = document.createElement("canvas");
              probe.width = 4;
              probe.height = 4;
              probe.getContext("2d").drawImage(dst, 0, 0);
              var p = probe.getContext("2d").getImageData(1, 1, 1, 1).data;
              return {
                r: p[0], a: p[3],
                twoD: dst.getContext("2d"),
                closed: bmp.width,
                ctx: br instanceof ImageBitmapRenderingContext
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["r"], 255, "{v}");
    assert_eq!(v["a"], 255, "{v}");
    assert_eq!(v["twoD"], serde_json::Value::Null, "{v}");
    assert_eq!(v["closed"], 0, "transfer closes the bitmap: {v}");
    assert_eq!(v["ctx"], true, "{v}");
}

#[test]
fn canvas_soft_light_darkens_mid_gray() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 4;
              c.height = 4;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#808080";
              ctx.fillRect(0, 0, 4, 4);
              ctx.globalCompositeOperation = "soft-light";
              ctx.fillStyle = "#000000";
              ctx.fillRect(0, 0, 4, 4);
              var p = ctx.getImageData(1, 1, 1, 1).data;
              return { r: p[0], g: p[1], b: p[2], a: p[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["r"], 64, "{v}");
    assert_eq!(v["g"], 64, "{v}");
    assert_eq!(v["b"], 64, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn canvas_exclusion_and_hard_light_blend_channels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op, dest, src) {
                var c = document.createElement("canvas");
                c.width = 4;
                c.height = 4;
                var ctx = c.getContext("2d");
                ctx.fillStyle = dest;
                ctx.fillRect(0, 0, 4, 4);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = src;
                ctx.fillRect(0, 0, 4, 4);
                var p = ctx.getImageData(1, 1, 1, 1).data;
                return { r: p[0], g: p[1], b: p[2], a: p[3] };
              }
              return {
                exclusion: sample("exclusion", "#ffffff", "#ffffff"),
                hard: sample("hard-light", "#c0c0c0", "#404040")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["exclusion"]["r"], 0, "{v}");
    assert_eq!(v["exclusion"]["g"], 0, "{v}");
    assert_eq!(v["exclusion"]["b"], 0, "{v}");
    assert_eq!(v["hard"]["r"], 96, "{v}");
    assert_eq!(v["hard"]["g"], 96, "{v}");
    assert_eq!(v["hard"]["b"], 96, "{v}");
    assert_eq!(v["hard"]["a"], 255, "{v}");
}

#[test]
fn canvas_color_dodge_and_color_burn_blend_channels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op, dest, src) {
                var c = document.createElement("canvas");
                c.width = 4;
                c.height = 4;
                var ctx = c.getContext("2d");
                ctx.fillStyle = dest;
                ctx.fillRect(0, 0, 4, 4);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = src;
                ctx.fillRect(0, 0, 4, 4);
                var p = ctx.getImageData(1, 1, 1, 1).data;
                return { r: p[0], g: p[1], b: p[2], a: p[3] };
              }
              return {
                dodge: sample("color-dodge", "#400000", "#800000"),
                burn: sample("color-burn", "#c0c0c0", "#808080")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["dodge"]["r"], 128, "{v}");
    assert_eq!(v["dodge"]["g"], 0, "{v}");
    assert_eq!(v["dodge"]["b"], 0, "{v}");
    assert_eq!(v["burn"]["r"], 130, "{v}");
    assert_eq!(v["burn"]["g"], 130, "{v}");
    assert_eq!(v["burn"]["b"], 130, "{v}");
}

#[test]
fn canvas_hue_saturation_color_and_luminosity_blend() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(op, dest, src) {
                var c = document.createElement("canvas");
                c.width = 4;
                c.height = 4;
                var ctx = c.getContext("2d");
                ctx.fillStyle = dest;
                ctx.fillRect(0, 0, 4, 4);
                ctx.globalCompositeOperation = op;
                ctx.fillStyle = src;
                ctx.fillRect(0, 0, 4, 4);
                var p = ctx.getImageData(1, 1, 1, 1).data;
                return { r: p[0], g: p[1], b: p[2], a: p[3] };
              }
              return {
                hue: sample("hue", "#ff0000", "#00ff00"),
                color: sample("color", "#808080", "#ff0000"),
                lum: sample("luminosity", "#ff0000", "#ffffff"),
                sat: sample("saturation", "#808000", "#ff0000")
              };
            })()"##,
        )
        .unwrap();
    assert!(
        v["hue"]["g"].as_u64().unwrap_or(0) > v["hue"]["r"].as_u64().unwrap_or(0) + 50,
        "hue takes the source hue: {v}"
    );
    assert!(
        v["color"]["r"].as_u64().unwrap_or(0) > 200
            && v["color"]["g"].as_u64().unwrap_or(255) < 120,
        "color tints dest with source chroma: {v}"
    );
    assert_eq!(v["lum"]["r"], 255, "{v}");
    assert_eq!(v["lum"]["g"], 255, "{v}");
    assert_eq!(v["lum"]["b"], 255, "{v}");
    assert!(
        v["sat"]["r"].as_u64().unwrap_or(0) > 80 && v["sat"]["b"].as_u64().unwrap_or(255) < 20,
        "saturation boosts dest chroma: {v}"
    );
}

#[test]
fn canvas_filter_blur_spills_outside_stroke_path() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 2;
              ctx.filter = "blur(2px)";
              ctx.beginPath();
              ctx.moveTo(4, 8);
              ctx.lineTo(12, 8);
              ctx.stroke();
              var mid = ctx.getImageData(8, 8, 1, 1).data;
              var halo = ctx.getImageData(8, 6, 1, 1).data;
              return { mg: mid[1], ma: mid[3], ha: halo[3] };
            })()"##,
        )
        .unwrap();
    assert!(
        v["mg"].as_u64().unwrap_or(0) > 20,
        "blurred stroke keeps the line: {v}"
    );
    assert!(
        v["ha"].as_u64().unwrap_or(0) > 0,
        "stroke blur must spill off the path: {v}"
    );
}

#[test]
fn data_transfer_stores_and_clears_text() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var dt = new DataTransfer();
              dt.setData("text", "hello");
              dt.setData("url", "https://example.com/");
              var ev = new DragEvent("dragstart");
              ev.dataTransfer.setData("text/plain", "from-event");
              var itemType = "";
              var itemKind = "";
              var asString = "";
              if (dt.items && dt.items.length) {
                itemType = dt.items.item(0).type;
                itemKind = dt.items.item(0).kind;
                dt.items.item(0).getAsString(function (s) { asString = s; });
              }
              var before = {
                text: dt.getData("text"),
                url: dt.getData("url"),
                types: dt.types.slice(),
                items: dt.items.length,
                itemType: itemType,
                itemKind: itemKind,
                asString: asString,
                ev: ev.dataTransfer.getData("text")
              };
              dt.clearData("text");
              var afterOne = { text: dt.getData("text"), url: dt.getData("url"), types: dt.types.slice() };
              dt.clearData();
              return {
                before: before,
                afterOne: afterOne,
                empty: { text: dt.getData("text"), types: dt.types.slice(), items: dt.items.length }
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"]["text"], "hello", "{v}");
    assert_eq!(v["before"]["url"], "https://example.com/", "{v}");
    assert_eq!(v["before"]["items"], 2, "{v}");
    assert_eq!(v["before"]["itemKind"], "string", "{v}");
    assert_eq!(v["before"]["asString"], "hello", "{v}");
    assert_eq!(v["before"]["ev"], "from-event", "{v}");
    assert_eq!(v["afterOne"]["text"], "", "{v}");
    assert_eq!(v["afterOne"]["url"], "https://example.com/", "{v}");
    assert_eq!(v["empty"]["text"], "", "{v}");
    assert_eq!(v["empty"]["items"], 0, "{v}");
}

#[test]
fn canvas_text_baseline_shifts_fill_text() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function minY(base) {
                var c = document.createElement("canvas");
                c.width = 24;
                c.height = 32;
                var ctx = c.getContext("2d");
                ctx.fillStyle = "#00ff00";
                ctx.font = "12px sans-serif";
                ctx.textBaseline = base;
                ctx.fillText("I", 4, 12);
                var data = ctx.getImageData(0, 0, 24, 32).data;
                var min = 32;
                for (var y = 0; y < 32; y++) {
                  for (var x = 0; x < 24; x++) {
                    if (data[(y * 24 + x) * 4 + 3] > 20) min = Math.min(min, y);
                  }
                }
                return min;
              }
              return { alphabetic: minY("alphabetic"), top: minY("top") };
            })()"##,
        )
        .unwrap();
    let alpha = v["alphabetic"].as_u64().unwrap_or(32);
    let top = v["top"].as_u64().unwrap_or(32);
    assert!(
        top > alpha,
        "top baseline must paint lower than alphabetic: {v}"
    );
}

#[test]
fn canvas_bezier_curve_paints_off_the_chord() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(1, 14);
              ctx.bezierCurveTo(1, 1, 14, 1, 14, 14);
              ctx.stroke();
              var peak = ctx.getImageData(8, 4, 1, 1).data;
              var chord = ctx.getImageData(8, 14, 1, 1).data;
              return { pg: peak[1], pa: peak[3], ca: chord[3] };
            })()"##,
        )
        .unwrap();
    assert!(
        v["pa"].as_u64().unwrap_or(0) > 20,
        "cubic must paint above the chord: {v}"
    );
    assert_eq!(v["ca"], 0, "the straight chord must stay empty: {v}");
}

#[test]
fn canvas_image_smoothing_blends_scaled_pixels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(smooth) {
                var src = document.createElement("canvas");
                src.width = 2;
                src.height = 1;
                var sctx = src.getContext("2d");
                sctx.fillStyle = "#ff0000";
                sctx.fillRect(0, 0, 1, 1);
                sctx.fillStyle = "#0000ff";
                sctx.fillRect(1, 0, 1, 1);
                var dst = document.createElement("canvas");
                dst.width = 8;
                dst.height = 1;
                var dctx = dst.getContext("2d");
                dctx.imageSmoothingEnabled = smooth;
                dctx.drawImage(src, 0, 0, 2, 1, 0, 0, 8, 1);
                var mid = dctx.getImageData(3, 0, 1, 1).data;
                return { r: mid[0], b: mid[2] };
              }
              return { on: sample(true), off: sample(false) };
            })()"##,
        )
        .unwrap();
    assert!(
        v["on"]["r"].as_u64().unwrap_or(0) > 0 && v["on"]["b"].as_u64().unwrap_or(0) > 0,
        "smoothing must blend the red/blue boundary: {v}"
    );
    assert!(
        v["off"]["r"].as_u64().unwrap_or(255) == 255 && v["off"]["b"].as_u64().unwrap_or(255) == 0
            || v["off"]["r"].as_u64().unwrap_or(0) == 0
                && v["off"]["b"].as_u64().unwrap_or(0) == 255,
        "nearest neighbour stays a source color: {v}"
    );
}

#[test]
fn create_attribute_returns_attr_node() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var a = document.createAttribute("data-k");
              a.value = "1";
              var prev = document.body.setAttributeNode(a);
              var got = document.body.getAttributeNode("data-k");
              return {
                type: a.nodeType,
                inst: a instanceof Attr,
                name: a.name,
                value: document.body.getAttribute("data-k"),
                owner: a.ownerElement === document.body,
                same: got === a || (got && got.value === "1"),
                prevNull: prev == null,
                ctorThrew: false
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["type"], 2, "{v}");
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["name"], "data-k", "{v}");
    assert_eq!(v["value"], "1", "{v}");
    assert_eq!(v["owner"], true, "{v}");
    assert_eq!(v["same"], true, "{v}");
}

#[test]
fn canvas_path2d_ellipse_arc_to_and_round_rect() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.beginPath();
              ctx.ellipse(8, 8, 6, 2, 0, 0, Math.PI * 2);
              ctx.fill();
              var flat = {
                mid: ctx.getImageData(8, 8, 1, 1).data[1],
                east: ctx.getImageData(13, 8, 1, 1).data[1],
                south: ctx.getImageData(8, 13, 1, 1).data[3],
                aabbOut: ctx.getImageData(12, 10, 1, 1).data[3]
              };
              ctx.clearRect(0, 0, 16, 16);
              ctx.beginPath();
              ctx.ellipse(8, 8, 6, 2, Math.PI / 2, 0, Math.PI * 2);
              ctx.fill();
              var rot = {
                mid: ctx.getImageData(8, 8, 1, 1).data[1],
                east: ctx.getImageData(13, 8, 1, 1).data[3],
                south: ctx.getImageData(8, 13, 1, 1).data[1]
              };
              ctx.clearRect(0, 0, 16, 16);
              ctx.beginPath();
              ctx.roundRect(1, 1, 14, 14, 6);
              ctx.fill();
              var round = {
                mid: ctx.getImageData(8, 8, 1, 1).data[1],
                corner: ctx.getImageData(1, 1, 1, 1).data[3],
                edge: ctx.getImageData(8, 1, 1, 1).data[1]
              };
              ctx.clearRect(0, 0, 16, 16);
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(0, 8);
              ctx.arcTo(8, 8, 8, 0, 4);
              ctx.stroke();
              return {
                flat: flat,
                rot: rot,
                round: round,
                arcCorner: ctx.isPointInStroke(8, 8),
                arcH: ctx.isPointInStroke(4, 8),
                arcV: ctx.isPointInStroke(8, 4)
              };
            })()"##,
        )
        .unwrap();
    assert!(
        v["flat"]["mid"].as_u64().unwrap_or(0) > 200,
        "ellipse center: {v}"
    );
    assert!(
        v["flat"]["east"].as_u64().unwrap_or(0) > 200,
        "ellipse east: {v}"
    );
    assert_eq!(v["flat"]["south"], 0, "flat ellipse must miss south: {v}");
    assert_eq!(
        v["flat"]["aabbOut"], 0,
        "flat ellipse must miss AABB corner: {v}"
    );
    assert!(
        v["rot"]["mid"].as_u64().unwrap_or(0) > 200,
        "rotated center: {v}"
    );
    assert_eq!(v["rot"]["east"], 0, "rotated ellipse must miss east: {v}");
    assert!(
        v["rot"]["south"].as_u64().unwrap_or(0) > 200,
        "rotated south: {v}"
    );
    assert!(
        v["round"]["mid"].as_u64().unwrap_or(0) > 200,
        "roundRect center: {v}"
    );
    assert_eq!(
        v["round"]["corner"], 0,
        "roundRect must leave the sharp corner empty: {v}"
    );
    assert!(
        v["round"]["edge"].as_u64().unwrap_or(0) > 200,
        "roundRect edge: {v}"
    );
    assert_eq!(
        v["arcCorner"], false,
        "arcTo must bend away from the corner: {v}"
    );
    assert_eq!(v["arcH"], true, "arcTo must keep the incoming tangent: {v}");
    assert_eq!(v["arcV"], true, "arcTo must keep the outgoing tangent: {v}");
}

#[test]
fn canvas_stroke_text_outlines_instead_of_filling() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function pixels(kind) {
                var c = document.createElement("canvas");
                c.width = 24;
                c.height = 28;
                var ctx = c.getContext("2d");
                ctx.font = "20px sans-serif";
                if (kind === "fill") {
                  ctx.fillStyle = "#00ff00";
                  ctx.fillText("I", 4, 20);
                } else {
                  ctx.strokeStyle = "#00ff00";
                  ctx.lineWidth = 2;
                  ctx.strokeText("I", 4, 20);
                }
                return ctx.getImageData(0, 0, 24, 28).data;
              }
              var fill = pixels("fill");
              var stroke = pixels("stroke");
              var fillOnly = 0, strokeOnly = 0, both = 0;
              for (var i = 0; i < fill.length; i += 4) {
                var f = fill[i + 3] > 20;
                var s = stroke[i + 3] > 20;
                if (f && s) both++;
                else if (f) fillOnly++;
                else if (s) strokeOnly++;
              }
              return { fillOnly: fillOnly, strokeOnly: strokeOnly, both: both };
            })()"##,
        )
        .unwrap();
    assert!(
        v["fillOnly"].as_u64().unwrap_or(0) > 0,
        "fillText must keep an interior strokeText punches out: {v}"
    );
    assert!(
        v["strokeOnly"].as_u64().unwrap_or(0) > 0,
        "strokeText must paint a halo fillText does not: {v}"
    );
}

#[test]
fn canvas_create_pattern_from_image_data() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var dst = document.createElement("canvas");
              dst.width = 4;
              dst.height = 4;
              var ctx = dst.getContext("2d");
              var data = ctx.createImageData(2, 2);
              for (var i = 0; i < data.data.length; i += 4) {
                data.data[i] = 0;
                data.data[i + 1] = 255;
                data.data[i + 2] = 0;
                data.data[i + 3] = 255;
              }
              var pat = ctx.createPattern(data, "repeat");
              ctx.fillStyle = pat;
              ctx.fillRect(0, 0, 4, 4);
              var a = ctx.getImageData(0, 0, 1, 1).data;
              var b = ctx.getImageData(3, 3, 1, 1).data;
              return { encoded: String(pat), ag: a[1], aa: a[3], bg: b[1], ba: b[3] };
            })()"##,
        )
        .unwrap();
    assert!(
        v["encoded"].as_str().unwrap_or("").contains("ve-pat:"),
        "{v}"
    );
    assert_eq!(v["ag"], 255, "{v}");
    assert_eq!(v["aa"], 255, "{v}");
    assert_eq!(v["bg"], 255, "{v}");
    assert_eq!(v["ba"], 255, "{v}");
}

#[test]
fn canvas_text_align_shifts_fill_text() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function minX(align) {
                var c = document.createElement("canvas");
                c.width = 48;
                c.height = 24;
                var ctx = c.getContext("2d");
                ctx.fillStyle = "#00ff00";
                ctx.font = "12px sans-serif";
                ctx.textAlign = align;
                ctx.fillText("MM", 24, 16);
                var data = ctx.getImageData(0, 0, 48, 24).data;
                var min = 48;
                for (var y = 0; y < 24; y++) {
                  for (var x = 0; x < 48; x++) {
                    if (data[(y * 48 + x) * 4 + 3] > 20) min = Math.min(min, x);
                  }
                }
                return min;
              }
              return { left: minX("left"), center: minX("center"), right: minX("right"), end: minX("end") };
            })()"##,
        )
        .unwrap();
    let left = v["left"].as_u64().unwrap_or(0);
    let center = v["center"].as_u64().unwrap_or(0);
    let right = v["right"].as_u64().unwrap_or(0);
    let end = v["end"].as_u64().unwrap_or(0);
    assert!(
        left > center && center > right,
        "textAlign must shift fillText: {v}"
    );
    assert_eq!(right, end, "end must match right in ltr: {v}");
}

#[test]
fn canvas_fill_text_paints_distinct_glyphs() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 32;
              c.height = 24;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.font = "16px sans-serif";
              ctx.fillText("I", 1, 16);
              ctx.fillText(" ", 20, 16);
              var iData = ctx.getImageData(0, 0, 16, 24).data;
              var space = ctx.getImageData(16, 0, 16, 24).data;
              var ig = 0, ia = 0, sa = 0;
              for (var n = 0; n < iData.length; n += 4) {
                if (iData[n + 3] > 20) { ig = Math.max(ig, iData[n + 1]); ia = Math.max(ia, iData[n + 3]); }
              }
              for (var s = 0; s < space.length; s += 4) sa = Math.max(sa, space[s + 3]);
              return { ig: ig, ia: ia, sa: sa, ii: ctx.measureText("II").width, m: ctx.measureText("MMMM").width, one: ctx.measureText("I").width };
            })()"##,
        )
        .unwrap();
    assert!(
        v["ig"].as_u64().unwrap_or(0) > 100,
        "I glyph should paint green: {v}"
    );
    assert!(
        v["ia"].as_u64().unwrap_or(0) > 20,
        "I glyph should have coverage: {v}"
    );
    assert_eq!(v["sa"], 0, "space must stay empty: {v}");
    assert!(
        v["m"].as_f64().unwrap_or(0.0) > v["one"].as_f64().unwrap_or(0.0),
        "MMMM must be wider than I: {v}"
    );
    assert!(v["ii"].as_f64().unwrap_or(0.0) > 0.0, "{v}");
}

#[test]
fn canvas_fill_rect_paints_shadow_offset() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 12;
              c.height = 12;
              var ctx = c.getContext("2d");
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 4;
              ctx.shadowColor = "#0000ff";
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(0, 0, 4, 4);
              var src = ctx.getImageData(1, 1, 1, 1).data;
              var sh = ctx.getImageData(5, 5, 1, 1).data;
              var empty = ctx.getImageData(10, 1, 1, 1).data;
              return {
                sr: src[0], sa: src[3],
                sb: sh[2], sha: sh[3],
                ea: empty[3],
                tw: ctx.measureText("II").width
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["sr"], 255, "{v}");
    assert_eq!(v["sa"], 255, "{v}");
    assert_eq!(v["sb"], 255, "{v}");
    assert_eq!(v["sha"], 255, "{v}");
    assert_eq!(v["ea"], 0, "{v}");
    assert!(v["tw"].as_f64().unwrap_or(0.0) > 0.0, "{v}");
}

#[test]
fn canvas_stroke_rect_honours_line_dash() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 24;
              c.height = 12;
              var ctx = c.getContext("2d");
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 1;
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(1, 1, 16, 8);
              var on = ctx.getImageData(1, 1, 1, 1).data;
              var off = ctx.getImageData(5, 1, 1, 1).data;
              var on2 = ctx.getImageData(9, 1, 1, 1).data;
              return { og: on[1], oa: on[3], fa: off[3], o2g: on2[1] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["og"], 255, "{v}");
    assert_eq!(v["oa"], 255, "{v}");
    assert_eq!(v["fa"], 0, "{v}");
    assert_eq!(v["o2g"], 255, "{v}");
}

#[test]
fn canvas_stroke_honours_line_cap() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(cap) {
                var c = document.createElement("canvas");
                c.width = 16;
                c.height = 16;
                var ctx = c.getContext("2d");
                ctx.lineWidth = 5;
                ctx.strokeStyle = "#00ff00";
                ctx.lineCap = cap;
                ctx.beginPath();
                ctx.moveTo(6, 6);
                ctx.lineTo(14, 6);
                ctx.stroke();
                var beyond = ctx.getImageData(4, 6, 1, 1).data;
                var on = ctx.getImageData(6, 6, 1, 1).data;
                var corner = ctx.getImageData(4, 4, 1, 1).data;
                return { ba: beyond[3], og: on[1], ca: corner[3] };
              }
              return { butt: sample("butt"), square: sample("square"), round: sample("round") };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["butt"]["ba"], 0, "{v}");
    assert_eq!(v["butt"]["og"], 255, "{v}");
    assert_eq!(v["square"]["ba"], 255, "{v}");
    assert_eq!(v["square"]["og"], 255, "{v}");
    assert_eq!(v["square"]["ca"], 255, "{v}");
    assert_eq!(v["round"]["og"], 255, "{v}");
    assert_eq!(v["round"]["ba"], 255, "{v}");
    assert_eq!(v["round"]["ca"], 0, "{v}");
}

#[test]
fn canvas_stroke_honours_line_join() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function sample(join) {
                var c = document.createElement("canvas");
                c.width = 16;
                c.height = 16;
                var ctx = c.getContext("2d");
                ctx.lineWidth = 6;
                ctx.strokeStyle = "#00ff00";
                ctx.lineJoin = join;
                ctx.beginPath();
                ctx.moveTo(2, 8);
                ctx.lineTo(8, 8);
                ctx.lineTo(8, 14);
                ctx.stroke();
                var miter = ctx.getImageData(10, 5, 1, 1).data;
                var tip = ctx.getImageData(8, 5, 1, 1).data;
                var on = ctx.getImageData(8, 8, 1, 1).data;
                return { ma: miter[3], ta: tip[3], og: on[1] };
              }
              return { miter: sample("miter"), bevel: sample("bevel"), round: sample("round") };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["miter"]["ma"], 255, "{v}");
    assert_eq!(v["miter"]["og"], 255, "{v}");
    assert_eq!(v["bevel"]["ma"], 0, "{v}");
    assert_eq!(v["bevel"]["og"], 255, "{v}");
    assert_eq!(v["round"]["ma"], 0, "{v}");
    assert_eq!(v["round"]["ta"], 255, "{v}");
    assert_eq!(v["round"]["og"], 255, "{v}");
}

#[test]
fn canvas_fill_rect_paints_shadow_blur() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.shadowBlur = 2;
              ctx.shadowColor = "#0000ff";
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(4, 4, 4, 4);
              var src = ctx.getImageData(5, 5, 1, 1).data;
              var spill = ctx.getImageData(2, 6, 1, 1).data;
              return { sr: src[0], sa: src[3], sb: spill[2], spa: spill[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["sr"], 255, "{v}");
    assert_eq!(v["sa"], 255, "{v}");
    assert!(
        v["sb"].as_u64().unwrap_or(0) > 0 && v["spa"].as_u64().unwrap_or(0) > 0,
        "blur must spill blue outside the fill: {v}"
    );
}

#[test]
fn canvas_stroke_path_honours_line_dash() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 24;
              c.height = 8;
              var ctx = c.getContext("2d");
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 1;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(1, 3);
              ctx.lineTo(17, 3);
              ctx.stroke();
              var on = ctx.getImageData(1, 3, 1, 1).data;
              var off = ctx.getImageData(5, 3, 1, 1).data;
              var on2 = ctx.getImageData(9, 3, 1, 1).data;
              return { og: on[1], oa: on[3], fa: off[3], o2g: on2[1] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["og"], 255, "{v}");
    assert_eq!(v["oa"], 255, "{v}");
    assert_eq!(v["fa"], 0, "{v}");
    assert_eq!(v["o2g"], 255, "{v}");
}

#[test]
fn canvas_is_point_in_path_hits_rect() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.beginPath();
              ctx.rect(2, 2, 6, 6);
              var path = new Path2D();
              path.moveTo(0, 8);
              path.lineTo(8, 8);
              path.lineTo(4, 16);
              path.closePath();
              return {
                inside: ctx.isPointInPath(4, 4),
                outside: ctx.isPointInPath(12, 4),
                polyIn: ctx.isPointInPath(path, 4, 11),
                polyOut: ctx.isPointInPath(path, 0, 0)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inside"], true, "{v}");
    assert_eq!(v["outside"], false, "{v}");
    assert_eq!(v["polyIn"], true, "{v}");
    assert_eq!(v["polyOut"], false, "{v}");
}

#[test]
fn canvas_is_point_in_stroke_hits_line() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(0, 8);
              ctx.lineTo(16, 8);
              var path = new Path2D("M0 8 L16 8");
              return {
                on: ctx.isPointInStroke(8, 8),
                off: ctx.isPointInStroke(8, 14),
                filled: ctx.isPointInPath(8, 8),
                pathOn: ctx.isPointInStroke(path, 8, 8),
                pathOff: ctx.isPointInStroke(path, 8, 14)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["on"], true, "{v}");
    assert_eq!(v["off"], false, "{v}");
    assert_eq!(v["filled"], false, "{v}");
    assert_eq!(v["pathOn"], true, "{v}");
    assert_eq!(v["pathOff"], false, "{v}");
}

#[test]
fn canvas_path2d_parses_svg_quad_cubic_and_arc() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.lineWidth = 2;
              var quad = new Path2D("M0 7 Q8 0 15 7");
              var cubic = new Path2D("M0 15 C0 0 15 0 15 15");
              var arc = new Path2D("M0 8 A8 8 0 0 0 8 0");
              ctx.strokeStyle = "#00ff00";
              ctx.stroke(arc);
              var arcHit = false;
              for (var i = 1; i <= 6; i++) {
                if (ctx.isPointInStroke(arc, i, i)) arcHit = true;
              }
              return {
                quad: ctx.isPointInStroke(quad, 8, 4),
                cubic: ctx.isPointInStroke(cubic, 8, 4),
                arc: arcHit,
                arcEnd: ctx.isPointInStroke(arc, 8, 0)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["quad"], true, "{v}");
    assert_eq!(v["cubic"], true, "{v}");
    assert_eq!(v["arc"], true, "{v}");
    assert_eq!(v["arcEnd"], true, "{v}");
}

#[test]
fn canvas_fill_path_uses_linear_gradient() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 8;
              var ctx = c.getContext("2d");
              var g = ctx.createLinearGradient(0, 0, 16, 0);
              g.addColorStop(0, "#ff0000");
              g.addColorStop(1, "#0000ff");
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.rect(0, 0, 16, 8);
              ctx.fill();
              var left = ctx.getImageData(0, 4, 1, 1).data;
              var right = ctx.getImageData(15, 4, 1, 1).data;
              return { lr: left[0], lb: left[2], rr: right[0], rb: right[2] };
            })()"##,
        )
        .unwrap();
    assert!(v["lr"].as_f64().unwrap_or(0.0) > 200.0, "left red: {v}");
    assert!(
        v["lb"].as_f64().unwrap_or(99.0) < 40.0,
        "left not blue: {v}"
    );
    assert!(v["rb"].as_f64().unwrap_or(0.0) > 200.0, "right blue: {v}");
    assert!(
        v["rr"].as_f64().unwrap_or(99.0) < 40.0,
        "right not red: {v}"
    );
}

#[test]
fn canvas_stroke_respects_line_width() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.lineWidth = 5;
              ctx.strokeStyle = "#00ff00";
              ctx.beginPath();
              ctx.moveTo(0, 8);
              ctx.lineTo(16, 8);
              ctx.stroke();
              var mid = ctx.getImageData(8, 8, 1, 1).data;
              var thick = ctx.getImageData(8, 6, 1, 1).data;
              var empty = ctx.getImageData(8, 0, 1, 1).data;
              return { mg: mid[1], tg: thick[1], ea: empty[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["mg"], 255, "{v}");
    assert_eq!(v["tg"], 255, "{v}");
    assert_eq!(v["ea"], 0, "{v}");
}

#[test]
fn canvas_path2d_parses_smooth_s_and_t() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 16;
              var ctx = c.getContext("2d");
              ctx.lineWidth = 2;
              var t = new Path2D("M0 7 Q8 0 8 7 T 16 7");
              var s = new Path2D("M0 15 C0 0 8 0 8 8 S 16 16 16 8");
              return {
                tMid: ctx.isPointInStroke(t, 10, 10),
                tEnd: ctx.isPointInStroke(t, 16, 7),
                sEnd: ctx.isPointInStroke(s, 16, 8)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["tMid"], true, "{v}");
    assert_eq!(v["tEnd"], true, "{v}");
    assert_eq!(v["sEnd"], true, "{v}");
}

#[test]
fn canvas_rotate_maps_fill_rect() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 8;
              c.height = 8;
              var ctx = c.getContext("2d");
              ctx.rotate(Math.PI / 2);
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, -4, 4, 4);
              var hit = ctx.getImageData(2, 2, 1, 1).data;
              var miss = ctx.getImageData(6, 2, 1, 1).data;
              var t = ctx.getTransform();
              return {
                hg: hit[1], ha: hit[3],
                ma: miss[3],
                a: Math.round(t.a * 1000) / 1000,
                b: Math.round(t.b * 1000) / 1000,
                c: Math.round(t.c * 1000) / 1000,
                d: Math.round(t.d * 1000) / 1000
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["hg"], 255, "{v}");
    assert_eq!(v["ha"], 255, "{v}");
    assert_eq!(v["ma"], 0, "{v}");
    assert!((v["a"].as_f64().unwrap_or(99.0)).abs() < 0.01, "{v}");
    assert!((v["b"].as_f64().unwrap_or(0.0) - 1.0).abs() < 0.01, "{v}");
    assert!((v["c"].as_f64().unwrap_or(0.0) + 1.0).abs() < 0.01, "{v}");
    assert!((v["d"].as_f64().unwrap_or(99.0)).abs() < 0.01, "{v}");
}

#[test]
fn canvas_transform_multiplies_current_matrix() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 8;
              c.height = 4;
              var ctx = c.getContext("2d");
              ctx.transform(1, 0, 0, 1, 4, 0);
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 2, 2);
              var hit = ctx.getImageData(4, 0, 1, 1).data;
              var miss = ctx.getImageData(0, 0, 1, 1).data;
              var t = ctx.getTransform();
              return { hg: hit[1], ha: hit[3], ma: miss[3], e: t.e, f: t.f };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["hg"], 255, "{v}");
    assert_eq!(v["ha"], 255, "{v}");
    assert_eq!(v["ma"], 0, "{v}");
    assert_eq!(v["e"], 4, "{v}");
    assert_eq!(v["f"], 0, "{v}");
}

#[test]
fn canvas_draw_image_blits_source_pixels() {
    const RED: &str = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC";
    let mut page = open(&format!(
        r#"<img id="src" src="data:image/png;base64,{RED}"><canvas id="dst"></canvas>"#
    ));
    let from_img = page
        .evaluate(
            r#"(function () {
              var img = document.getElementById("src");
              var c = document.getElementById("dst");
              c.width = 4;
              c.height = 4;
              var ctx = c.getContext("2d");
              ctx.drawImage(img, 0, 0);
              var d = ctx.getImageData(0, 0, 1, 1).data;
              return { r: d[0], g: d[1], b: d[2], a: d[3] };
            })()"#,
        )
        .unwrap();
    assert!(
        from_img["r"].as_u64().unwrap_or(0) > 200,
        "img drawImage must blit ImageCache pixels: {from_img}"
    );
    assert_eq!(from_img["g"], 0, "{from_img}");
    assert_eq!(from_img["b"], 0, "{from_img}");
    let from_canvas = page
        .evaluate(
            r##"(function () {
              var src = document.createElement("canvas");
              src.width = 2;
              src.height = 2;
              var sctx = src.getContext("2d");
              sctx.fillStyle = "#00ff00";
              sctx.fillRect(0, 0, 2, 2);
              var dst = document.createElement("canvas");
              dst.width = 4;
              dst.height = 4;
              var dctx = dst.getContext("2d");
              dctx.drawImage(src, 1, 1);
              var d = dctx.getImageData(1, 1, 1, 1).data;
              var empty = dctx.getImageData(0, 0, 1, 1).data;
              return {
                r: d[0], g: d[1], b: d[2], a: d[3],
                er: empty[0], eg: empty[1], eb: empty[2], ea: empty[3]
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(from_canvas["g"], 255, "{from_canvas}");
    assert_eq!(from_canvas["r"], 0, "{from_canvas}");
    assert_eq!(from_canvas["ea"], 0, "{from_canvas}");
}

#[test]
fn canvas_draw_image_honours_source_and_dest_rects() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var src = document.createElement("canvas");
              src.width = 8;
              src.height = 4;
              var sctx = src.getContext("2d");
              sctx.fillStyle = "#ff0000";
              sctx.fillRect(0, 0, 4, 4);
              sctx.fillStyle = "#0000ff";
              sctx.fillRect(4, 0, 4, 4);
              var dst = document.createElement("canvas");
              dst.width = 8;
              dst.height = 8;
              var dctx = dst.getContext("2d");
              dctx.drawImage(src, 4, 0, 4, 4, 0, 0, 8, 8);
              var a = dctx.getImageData(1, 1, 1, 1).data;
              var b = dctx.getImageData(6, 6, 1, 1).data;
              return { ar: a[0], ab: a[2], br: b[0], bb: b[2] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ar"], 0, "source-rect must skip the red half: {v}");
    assert!(v["ab"].as_u64().unwrap_or(0) > 200, "scaled blue: {v}");
    assert_eq!(v["br"], 0, "{v}");
    assert!(v["bb"].as_u64().unwrap_or(0) > 200, "{v}");
}

#[test]
fn canvas_save_restore_translate_and_global_alpha() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 8;
              c.height = 4;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#ff0000";
              ctx.globalAlpha = 0.5;
              ctx.save();
              ctx.translate(4, 0);
              ctx.globalAlpha = 1;
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 2, 2);
              ctx.restore();
              ctx.fillRect(0, 0, 2, 2);
              ctx.save();
              ctx.scale(2, 1);
              ctx.fillStyle = "#0000ff";
              ctx.globalAlpha = 1;
              ctx.fillRect(3, 2, 1, 1);
              ctx.restore();
              var left = ctx.getImageData(0, 0, 1, 1).data;
              var right = ctx.getImageData(4, 0, 1, 1).data;
              var mid = ctx.getImageData(2, 0, 1, 1).data;
              var scaled = ctx.getImageData(6, 2, 1, 1).data;
              return {
                la: left[3], lr: left[0],
                rg: right[1], ra: right[3],
                ma: mid[3],
                sb: scaled[2], sa: scaled[3]
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["lr"], 255, "{v}");
    assert!(
        v["la"].as_u64().unwrap_or(0) > 100 && v["la"].as_u64().unwrap_or(0) < 160,
        "half alpha: {v}"
    );
    assert_eq!(v["rg"], 255, "{v}");
    assert_eq!(v["ra"], 255, "{v}");
    assert_eq!(v["ma"], 0, "{v}");
    assert_eq!(v["sb"], 255, "{v}");
    assert_eq!(v["sa"], 255, "{v}");
}

#[test]
fn canvas_clip_and_quadratic_curve_paint_pixels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 16;
              c.height = 8;
              var ctx = c.getContext("2d");
              ctx.save();
              ctx.beginPath();
              ctx.rect(0, 0, 4, 4);
              ctx.clip();
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(0, 0, 16, 8);
              var inside = ctx.getImageData(1, 1, 1, 1).data;
              var outside = ctx.getImageData(8, 1, 1, 1).data;
              ctx.save();
              ctx.beginPath();
              ctx.rect(0, 0, 2, 2);
              ctx.clip();
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 16, 8);
              ctx.restore();
              ctx.fillStyle = "#0000aa";
              ctx.fillRect(0, 0, 16, 8);
              var after = ctx.getImageData(3, 1, 1, 1).data;
              var still = ctx.getImageData(8, 1, 1, 1).data;
              ctx.restore();
              ctx.beginPath();
              ctx.moveTo(0, 7);
              ctx.quadraticCurveTo(8, 0, 15, 7);
              ctx.strokeStyle = "#0000ff";
              ctx.stroke();
              var row = ctx.getImageData(0, 0, 16, 8).data;
              var blue = 0;
              for (var i = 0; i < row.length; i += 4) {
                if (row[i + 2] > 200 && row[i] < 40) blue++;
              }
              return {
                ir: inside[0], oa: outside[3],
                ab: after[2], sa: still[3],
                blue: blue
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ir"], 255, "{v}");
    assert_eq!(v["oa"], 0, "{v}");
    assert!(
        v["ab"].as_u64().unwrap_or(0) > 100,
        "restore clip then fill: {v}"
    );
    assert_eq!(v["sa"], 0, "{v}");
    assert!(
        v["blue"].as_f64().unwrap_or(0.0) > 4.0,
        "quadratic should paint: {v}"
    );
}

#[test]
fn canvas_stroke_path_records_ops() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 40;
              c.height = 20;
              var ctx = c.getContext("2d");
              ctx.strokeStyle = "#00ff00";
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(10, 0);
              ctx.stroke();
              ctx.strokeRect(1, 1, 8, 8);
              const d = ctx.getImageData(0, 0, 1, 1).data;
              return { r: d[0], g: d[1], b: d[2], a: d[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["g"], 255, "{v}");
    assert_eq!(v["r"], 0, "{v}");
}

#[test]
fn remove_attribute_node_clears_named_attr() {
    let mut page = open(r#"<p id="t" class="x"></p>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const el = document.getElementById("t");
              const attr = el.attributes[0];
              const removed = el.removeAttributeNode(attr);
              return {
                name: removed && removed.name,
                hasClass: el.hasAttribute("class"),
                hasId: el.hasAttribute("id"),
                remaining: el.attributes.length
              };
            })()"##,
        )
        .unwrap();
    assert!(v["name"].as_str().is_some(), "{v}");
    assert_eq!(v["remaining"], 1, "{v}");
}

#[test]
fn get_client_rects_match_bounding_rect() {
    let mut page = open(r#"<p id="t">hi</p>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const el = document.getElementById("t");
              const box = el.getBoundingClientRect();
              const list = el.getClientRects();
              const range = document.createRange();
              range.selectNodeContents(el.firstChild);
              const rlist = range.getClientRects();
              return {
                elLen: list.length,
                elW: list[0] && list[0].width,
                boxW: box.width,
                rangeLen: rlist.length,
                item: typeof list.item === "function"
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["elLen"], 1, "{v}");
    assert_eq!(v["rangeLen"], 1, "{v}");
    assert_eq!(v["item"], true, "{v}");
    assert_eq!(v["elW"], v["boxW"], "{v}");
}

#[test]
fn canvas_todataurl_is_a_png() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 4;
              c.height = 4;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 4, 4);
              var url = c.toDataURL();
              return { ok: url.indexOf("data:image/png;base64,") === 0, n: url.length };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ok"], true, "{v}");
    assert!(v["n"].as_f64().unwrap_or(0.0) > 32.0, "{v}");
}

#[test]
fn imagedata_and_path2d_paint_pixels() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = document.createElement("canvas");
              c.width = 8;
              c.height = 8;
              var ctx = c.getContext("2d");
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(0, 0, 4, 4);
              var got = ctx.getImageData(0, 0, 4, 4);
              var red = got.data[0] === 255 && got.data[1] === 0 && got.data[2] === 0;
              var put = ctx.createImageData(2, 2);
              for (var i = 0; i < put.data.length; i += 4) {
                put.data[i] = 0; put.data[i+1] = 255; put.data[i+2] = 0; put.data[i+3] = 255;
              }
              ctx.putImageData(put, 4, 0);
              var g2 = ctx.getImageData(4, 0, 2, 2);
              var path = new Path2D();
              path.rect(0, 4, 3, 3);
              ctx.fillStyle = "#0000ff";
              ctx.fill(path);
              var g3 = ctx.getImageData(1, 5, 1, 1);
              var tri = new Path2D("M4,4 L8,4 L6,8 Z");
              ctx.fillStyle = "#ffffff";
              ctx.fill(tri);
              var g4 = ctx.getImageData(6, 5, 1, 1);
              return {
                imageData: got instanceof ImageData,
                path2d: path instanceof Path2D,
                w: got.width,
                red: red,
                green: g2.data[1] === 255 && g2.data[0] === 0,
                blue: g3.data[2] === 255 && g3.data[0] === 0,
                white: g4.data[0] === 255 && g4.data[1] === 255,
                walkPrev: typeof document.createTreeWalker(document, 1).previousNode
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["imageData"], true, "{v}");
    assert_eq!(v["path2d"], true, "{v}");
    assert_eq!(v["w"], 4, "{v}");
    assert_eq!(v["red"], true, "{v}");
    assert_eq!(v["green"], true, "{v}");
    assert_eq!(v["blue"], true, "{v}");
    assert_eq!(v["white"], true, "{v}");
    assert_eq!(v["walkPrev"], "function", "{v}");
}

#[test]
fn iframe_about_blank_isconnected() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var f = document.createElement("iframe");
              var d = document.createElement("div");
              document.body.appendChild(f);
              f.contentDocument.body.appendChild(d);
              var connected = d.isConnected === true && f.isConnected === true;
              f.remove();
              return {
                connected: connected,
                still: d.isConnected === true,
                frameGone: f.isConnected === false
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["connected"], true, "{v}");
    assert_eq!(v["still"], true, "{v}");
    assert_eq!(v["frameGone"], true, "{v}");
}

#[test]
fn domparser_replacechildren_and_keycode() {
    let mut page = open(r#"<body><div id="h"></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var p = new DOMParser();
              var d = p.parseFromString("<p id=x>hi</p>", "text/html");
              var host = document.getElementById("h");
              host.replaceChildren(d.body.firstChild.cloneNode(true));
              var ke = new KeyboardEvent("keypress", {key:"Enter", keyCode:13});
              return {
                parser: p instanceof DOMParser,
                kids: host.childNodes.length,
                text: host.textContent,
                keyCode: ke.keyCode
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["parser"], true, "{v}");
    assert_eq!(v["kids"], 1, "{v}");
    assert_eq!(v["text"], "hi", "{v}");
    assert_eq!(v["keyCode"], 13, "{v}");
}

#[test]
fn domparser_keeps_an_unmoved_document_when_parsing_again() {
    let mut page = open(r#"<body><div id="h"></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var p = new DOMParser();
              var a = p.parseFromString("<p id=a>one</p>", "text/html");
              var b = p.parseFromString("<p id=b>two</p>", "text/html");
              return {
                a: a.body && a.body.textContent,
                b: b.body && b.body.textContent,
                same: a === b
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["a"], "one", "{v}");
    assert_eq!(v["b"], "two", "{v}");
    assert_eq!(v["same"], false, "{v}");
}

#[test]
fn template_content_cssstylesheet_and_import_node() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var t = document.createElement("template");
              t.innerHTML = "<p class='x'>ok</p>";
              var n = document.importNode(t.content, true);
              document.body.append(n);
              var sheet = new CSSStyleSheet();
              sheet.replaceSync("p { color: red }");
              var host = document.createElement("div");
              var root = host.attachShadow({mode:"open"});
              root.adoptedStyleSheets = [sheet];
              return {
                text: document.querySelector("p.x").textContent,
                sheet: sheet instanceof CSSStyleSheet,
                adopted: root.adoptedStyleSheets.length
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["text"], "ok", "{v}");
    assert_eq!(v["sheet"], true, "{v}");
    assert_eq!(v["adopted"], 1, "{v}");
}

#[test]
fn css_style_sheet_inserts_and_deletes_rules() {
    let mut page = open(r#"<body><p id="t">x</p></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var sheet = new CSSStyleSheet();
              sheet.replaceSync("h1{color:blue}h2{color:green}");
              var mid = sheet.insertRule("#t{display:none}", 1);
              var before = {
                len: sheet.cssRules.length,
                mid: mid,
                sel: sheet.cssRules[1].selectorText,
                display: getComputedStyle(document.getElementById("t")).display,
                rule: sheet.cssRules[1] instanceof CSSStyleRule
              };
              sheet.deleteRule(1);
              return {
                before: before,
                after: sheet.cssRules.length,
                first: sheet.cssRules[0].selectorText
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"]["len"], 3, "{v}");
    assert_eq!(v["before"]["mid"], 1, "{v}");
    assert_eq!(v["before"]["sel"], "#t", "{v}");
    assert_eq!(v["before"]["rule"], true, "{v}");
    assert_eq!(v["before"]["display"], "none", "{v}");
    assert_eq!(v["after"], 2, "{v}");
    assert_eq!(v["first"], "h1", "{v}");
}

#[test]
fn xhr_sets_request_headers_and_reads_response_headers() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", "data:text/plain,hello");
              xhr.setRequestHeader("X-Test", "one");
              xhr.setRequestHeader("X-Test", "two");
              var headerErr = "";
              xhr.send();
              try { xhr.setRequestHeader("X-Late", "no"); } catch (e) { headerErr = e.name; }
              var aborted = 0;
              var after = new XMLHttpRequest();
              after.open("GET", "data:text/plain,x");
              after.onabort = function () { aborted++; };
              after.abort();
              return {
                status: xhr.status,
                body: xhr.responseText,
                ct: xhr.getResponseHeader("content-type"),
                all: xhr.getAllResponseHeaders(),
                headerErr: headerErr,
                abortReady: after.readyState,
                abortEvents: aborted
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["status"], 200, "{v}");
    assert_eq!(v["body"], "hello", "{v}");
    assert!(
        v["ct"]
            .as_str()
            .unwrap_or("")
            .to_ascii_lowercase()
            .contains("text/plain"),
        "{v}"
    );
    assert_eq!(v["headerErr"], "InvalidStateError", "{v}");
    assert_eq!(v["abortReady"], 1, "abort before send leaves OPENED: {v}");
    assert_eq!(v["abortEvents"], 0, "abort before send is a no-op: {v}");
}

#[test]
fn show_picker_focuses_connected_controls() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var sel = document.createElement("select");
              var err = "";
              try { sel.showPicker(); } catch (e) { err = e.name; }
              document.body.appendChild(sel);
              sel.showPicker();
              var input = document.createElement("input");
              input.type = "number";
              document.body.appendChild(input);
              input.showPicker();
              return {
                err: err,
                sel: document.activeElement === sel || sel._pickerOpen,
                input: input._pickerOpen
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["err"], "InvalidStateError", "{v}");
    assert_eq!(v["sel"], true, "{v}");
    assert_eq!(v["input"], true, "{v}");
}

#[test]
fn media_load_resets_playback_and_fast_seek_moves() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var video = document.createElement("video");
              video.src = "https://s.test/a.mp4";
              var ev = [];
              video.addEventListener("emptied", function () { ev.push("emptied"); });
              video.addEventListener("abort", function () { ev.push("abort"); });
              video.addEventListener("loadstart", function () { ev.push("loadstart"); });
              video.currentTime = 4;
              video.play();
              video.load();
              var afterLoad = { time: video.currentTime, paused: video.paused, ev: ev.slice() };
              video.fastSeek(2);
              return { afterLoad: afterLoad, seek: video.currentTime };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["afterLoad"]["time"], 0.0, "{v}");
    assert_eq!(v["afterLoad"]["paused"], true, "{v}");
    assert_eq!(v["afterLoad"]["ev"][0], "emptied", "{v}");
    assert_eq!(v["afterLoad"]["ev"][1], "abort", "{v}");
    assert_eq!(v["afterLoad"]["ev"][2], "loadstart", "{v}");
    assert_eq!(v["seek"], 2.0, "{v}");
}

#[test]
fn element_internals_stores_form_value_and_validity() {
    let mut page = open(r#"<body><form id="f"></form></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              customElements.define("x-field", class extends HTMLElement {});
              var form = document.getElementById("f");
              var el = document.createElement("x-field");
              el.setAttribute("name", "qty");
              form.appendChild(el);
              var internals = el.attachInternals();
              internals.setFormValue("7");
              internals.setValidity({ customError: true }, "bad");
              var msg = internals.validationMessage;
              var invalid = [];
              el.addEventListener("invalid", function () { invalid.push(1); });
              var check = internals.checkValidity();
              internals.setValidity({ customError: false }, "");
              var fd = new FormData(form);
              return {
                value: fd.get("qty"),
                check: check,
                invalid: invalid.length,
                msg: msg,
                ok: internals.checkValidity()
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["value"], "7", "{v}");
    assert_eq!(v["check"], false, "{v}");
    assert_eq!(v["invalid"], 1, "{v}");
    assert_eq!(v["msg"], "bad", "{v}");
    assert_eq!(v["ok"], true, "{v}");
}

#[test]
fn navigation_navigate_updates_location_unless_intercepted() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var seen = [];
              navigation.addEventListener("navigate", function (ev) {
                seen.push(ev.destination.url);
                if (String(ev.destination.url).indexOf("hold") >= 0) ev.intercept();
              });
              navigation.navigate("#go");
              var afterGo = location.hash;
              var entries = navigation.entries().length;
              navigation.navigate("#hold");
              return {
                afterGo: afterGo,
                hold: location.hash,
                entries: entries,
                seen: seen.length,
                current: navigation.currentEntry instanceof NavigationHistoryEntry
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["afterGo"], "#go", "{v}");
    assert_eq!(v["hold"], "#go", "intercept must skip the location write: {v}");
    assert!(v["entries"].as_u64().unwrap_or(0) >= 2, "{v}");
    assert_eq!(v["seen"], 2, "{v}");
    assert_eq!(v["current"], true, "{v}");
}

#[test]
fn close_watcher_request_close_honours_prevent_default() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var w = new CloseWatcher();
              var ev = [];
              w.addEventListener("cancel", function (e) { ev.push("cancel"); e.preventDefault(); });
              w.addEventListener("close", function () { ev.push("close"); });
              w.requestClose();
              var blocked = ev.slice();
              var w2 = new CloseWatcher();
              var ev2 = [];
              w2.addEventListener("cancel", function () { ev2.push("cancel"); });
              w2.addEventListener("close", function () { ev2.push("close"); });
              w2.requestClose();
              w2.requestClose();
              w2.destroy();
              w2.close();
              return { blocked: blocked, closed: ev2 };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["blocked"][0], "cancel", "{v}");
    assert_eq!(v["blocked"].as_array().map(|a| a.len()).unwrap_or(0), 1, "{v}");
    assert_eq!(v["closed"][0], "cancel", "{v}");
    assert_eq!(v["closed"][1], "close", "{v}");
    assert_eq!(v["closed"].as_array().map(|a| a.len()).unwrap_or(0), 2, "{v}");
}

#[test]
fn broadcast_channel_delivers_to_same_name_peers() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__bc = [];
          window.__a = new BroadcastChannel("room");
          window.__b = new BroadcastChannel("room");
          window.__c = new BroadcastChannel("other");
          window.__b.onmessage = function (e) { window.__bc.push("b:" + e.data); };
          window.__c.onmessage = function (e) { window.__bc.push("c:" + e.data); };
          window.__a.postMessage("hi");
          window.__a.close();
          var closedErr = "";
          try { window.__a.postMessage("no"); } catch (e) { closedErr = e.name; }
          window.__closedErr = closedErr;
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page
        .evaluate(
            r##"(function () {
              return { got: window.__bc.slice(), closedErr: window.__closedErr };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["got"][0], "b:hi", "{v}");
    assert_eq!(v["got"].as_array().map(|a| a.len()).unwrap_or(0), 1, "{v}");
    assert_eq!(v["closedErr"], "InvalidStateError", "{v}");
}

#[test]
fn document_style_sheets_exposes_style_element_rules() {
    let mut page = open(r#"<body><style>#t{color:red}h1{font-size:2em}</style></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var sheets = document.styleSheets;
              return {
                len: sheets.length,
                rules: sheets[0].cssRules.length,
                sel: sheets[0].cssRules[0].selectorText
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["len"], 1, "{v}");
    assert_eq!(v["rules"], 2, "{v}");
    assert_eq!(v["sel"], "#t", "{v}");
}

#[test]
fn event_source_opens_and_delivers_sse_data() {
    let mut page = open(r#"<body></body>"#);
    let connecting = page
        .evaluate(
            r##"(function () {
              window.__es = [];
              window.__opened = -1;
              var payload = btoa("data:hello\nid:42\n\n");
              window.__src = new EventSource("data:text/event-stream;base64," + payload);
              window.__src.onopen = function () { window.__opened = window.__src.readyState; };
              window.__src.onmessage = function (e) { window.__es.push({ data: e.data, id: e.lastEventId }); };
              return { connecting: window.__src.readyState, connectingConst: EventSource.CONNECTING };
            })()"##,
        )
        .unwrap();
    assert_eq!(connecting["connecting"], 0, "{connecting}");
    assert_eq!(connecting["connectingConst"], 0, "{connecting}");
    assert!(page.settle(50).settled);
    let v = page
        .evaluate(
            r##"(function () {
              var open = window.__opened;
              var got = window.__es.slice();
              window.__src.close();
              return { open: open, data: got[0] && got[0].data, id: got[0] && got[0].id, closed: window.__src.readyState };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["open"], 1, "{v}");
    assert_eq!(v["data"], "hello", "{v}");
    assert_eq!(v["id"], "42", "{v}");
    assert_eq!(v["closed"], 2, "{v}");
}

#[test]
fn intersection_observer_clips_to_viewport_and_root_margin() {
    let mut page = open(
        r#"<body>
          <div id="in" style="width:40px;height:20px">in</div>
          <div id="out" style="position:absolute;top:2000px;left:0;width:40px;height:20px">out</div>
        </body>"#,
    );
    let started = page
        .evaluate(
            r##"(function () {
              window.__io = { in: null, out: null, outMargin: null };
              new IntersectionObserver(function (recs) {
                recs.forEach(function (r) {
                  if (r.target.id === "in") window.__io.in = r;
                  if (r.target.id === "out") window.__io.out = r;
                });
              }).observe(document.getElementById("in"));
              new IntersectionObserver(function (recs) {
                window.__io.out = recs[0];
              }).observe(document.getElementById("out"));
              new IntersectionObserver(function (recs) {
                window.__io.outMargin = recs[0];
              }, { rootMargin: "2000px" }).observe(document.getElementById("out"));
              return {
                vw: innerWidth,
                vh: innerHeight,
                inTop: document.getElementById("in").getBoundingClientRect().top,
                outTop: document.getElementById("out").getBoundingClientRect().top
              };
            })()"##,
        )
        .unwrap();
    assert!(started["vh"].as_f64().unwrap_or(0.0) < 2000.0, "{started}");
    assert!(started["outTop"].as_f64().unwrap_or(0.0) > 720.0, "{started}");
    assert!(page.settle(20).settled);
    let v = page
        .evaluate(
            r##"(function () {
              var i = window.__io.in;
              var o = window.__io.out;
              var m = window.__io.outMargin;
              return {
                inHit: i && i.isIntersecting,
                inRatio: i && i.intersectionRatio,
                inHasRect: i && i.intersectionRect && i.intersectionRect.width > 0,
                outHit: o && o.isIntersecting,
                outRatio: o && o.intersectionRatio,
                outRootH: o && o.rootBounds && o.rootBounds.height,
                marginHit: m && m.isIntersecting,
                marginRatio: m && m.intersectionRatio
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inHit"], true, "{v}");
    assert!(v["inRatio"].as_f64().unwrap_or(0.0) > 0.0, "{v}");
    assert_eq!(v["inHasRect"], true, "{v}");
    assert_eq!(v["outHit"], false, "{v}");
    assert_eq!(v["outRatio"], 0.0, "{v}");
    assert_eq!(v["marginHit"], true, "{v}");
    assert!(v["marginRatio"].as_f64().unwrap_or(0.0) > 0.0, "{v}");
}

#[test]
fn resize_observer_reports_content_box_inside_padding() {
    let mut page = open(
        r#"<body><div id="t" style="width:100px;height:40px;padding:10px 20px;border:5px solid red">x</div></body>"#,
    );
    let started = page
        .evaluate(
            r##"(function () {
              window.__ro = null;
              new ResizeObserver(function (recs) { window.__ro = recs[0]; }).observe(document.getElementById("t"));
              var el = document.getElementById("t");
              var cs = getComputedStyle(el);
              return {
                padL: cs.paddingLeft || cs.getPropertyValue("padding-left"),
                border: cs.borderLeftWidth || cs.getPropertyValue("border-left-width"),
                boxW: el.getBoundingClientRect().width
              };
            })()"##,
        )
        .unwrap();
    assert!(page.settle(20).settled);
    let v = page
        .evaluate(
            r##"(function () {
              var r = window.__ro;
              var box = document.getElementById("t").getBoundingClientRect();
              return {
                x: r && r.contentRect.x,
                y: r && r.contentRect.y,
                w: r && r.contentRect.width,
                h: r && r.contentRect.height,
                borderW: r && r.borderBoxSize[0].inlineSize,
                contentW: r && r.contentBoxSize[0].inlineSize,
                boxW: box.width
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["x"], 20.0, "{v} started={started}");
    assert_eq!(v["y"], 10.0, "{v} started={started}");
    assert!(
        v["w"].as_f64().unwrap_or(0.0) + 1.0 < v["boxW"].as_f64().unwrap_or(0.0),
        "content box must be inside padding+border: {v} started={started}"
    );
    assert_eq!(v["borderW"], v["boxW"], "{v}");
    assert_eq!(v["contentW"], v["w"], "{v}");
}

#[test]
fn file_reader_reads_blob_text_and_data_url() {
    let mut page = open(r#"<body></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              var blob = new Blob(["hi"], { type: "text/plain" });
              var file = new File(["ab"], "n.txt", { type: "text/plain" });
              window.__fr = { text: null, url: null, size: blob.size, fileName: file.name, fileSize: file.size };
              var r = new FileReader();
              r.onload = function () { window.__fr.text = r.result; };
              r.readAsText(blob);
              var r2 = new FileReader();
              r2.onload = function () { window.__fr.url = r2.result; };
              r2.readAsDataURL(blob);
              return window.__fr.size;
            })()"##,
        )
        .unwrap();
    assert_eq!(started, 2, "{started}");
    assert!(page.settle(20).settled);
    let v = page
        .evaluate(
            r##"(function () {
              return window.__fr;
            })()"##,
        )
        .unwrap();
    assert_eq!(v["text"], "hi", "{v}");
    assert_eq!(v["fileName"], "n.txt", "{v}");
    assert_eq!(v["fileSize"], 2, "{v}");
    assert_eq!(v["url"], "data:text/plain;base64,aGk=", "{v}");
}

#[test]
fn abort_signal_is_event_target_and_throw_if_aborted() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var c = new AbortController();
              var hits = 0;
              c.signal.addEventListener("abort", function () { hits++; });
              var before = c.signal.aborted;
              c.abort("stop");
              var name = "";
              try { c.signal.throwIfAborted(); } catch (e) { name = e; }
              return {
                before: before,
                after: c.signal.aborted,
                hits: hits,
                reason: c.signal.reason,
                thrown: name,
                proto: c.signal instanceof AbortSignal
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"], false, "{v}");
    assert_eq!(v["after"], true, "{v}");
    assert_eq!(v["hits"], 1, "{v}");
    assert_eq!(v["reason"], "stop", "{v}");
    assert_eq!(v["thrown"], "stop", "{v}");
    assert_eq!(v["proto"], true, "{v}");
}

#[test]
fn performance_observer_delivers_mark_and_buffered_paint() {
    let mut page = open(r#"<body></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              window.__po = { marks: [], paints: [] };
              performance.mark("before");
              new PerformanceObserver(function (list) {
                list.getEntries().forEach(function (e) { window.__po.marks.push(e.name); });
              }).observe({ type: "mark", buffered: true });
              new PerformanceObserver(function (list) {
                list.getEntries().forEach(function (e) { window.__po.paints.push(e.name); });
              }).observe({ type: "paint", buffered: true });
              performance.mark("after");
              return performance.getEntriesByType("paint").map(function (e) { return e.name; });
            })()"##,
        )
        .unwrap();
    assert!(started.as_array().is_some(), "{started}");
    assert!(page.settle(20).settled);
    let v = page
        .evaluate(
            r##"(function () {
              return window.__po;
            })()"##,
        )
        .unwrap();
    let marks = v["marks"].as_array().cloned().unwrap_or_default();
    let paints = v["paints"].as_array().cloned().unwrap_or_default();
    assert!(
        marks.iter().any(|m| m == "before") && marks.iter().any(|m| m == "after"),
        "{v}"
    );
    assert!(
        paints.iter().any(|p| p == "first-contentful-paint"),
        "{v}"
    );
}

#[test]
fn request_idle_callback_runs_with_time_remaining() {
    let mut page = open(r#"<body></body>"#);
    let _ = page
        .evaluate(
            r##"(function () {
              window.__idle = null;
              requestIdleCallback(function (d) {
                window.__idle = { didTimeout: d.didTimeout, remain: d.timeRemaining() };
              });
              return true;
            })()"##,
        )
        .unwrap();
    assert!(page.settle(20).settled);
    let v = page
        .evaluate("window.__idle")
        .unwrap();
    assert_eq!(v["didTimeout"], false, "{v}");
    assert!(v["remain"].as_f64().unwrap_or(0.0) > 0.0, "{v}");
}

#[test]
fn navigator_clipboard_round_trips_and_geolocation_denies() {
    let mut page = open(r#"<body></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              window.__nav = { text: null, perm: null, geo: null };
              navigator.clipboard.writeText("hi").then(function () {
                return navigator.clipboard.readText();
              }).then(function (t) { window.__nav.text = t; });
              navigator.permissions.query({ name: "geolocation" }).then(function (p) {
                window.__nav.perm = { name: p.name, state: p.state };
              });
              navigator.geolocation.getCurrentPosition(function () {}, function (e) {
                window.__nav.geo = { code: e.code, message: e.message };
              });
              return true;
            })()"##,
        )
        .unwrap();
    assert_eq!(started, true);
    assert!(page.settle(20).settled);
    let v = page
        .evaluate("window.__nav")
        .unwrap();
    assert_eq!(v["text"], "hi", "{v}");
    assert_eq!(v["perm"]["name"], "geolocation", "{v}");
    assert_eq!(v["perm"]["state"], "denied", "{v}");
    assert_eq!(v["geo"]["code"], 1, "{v}");
}

#[test]
fn offscreen_canvas_context_is_offscreen_2d() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var off = new OffscreenCanvas(4, 4);
              var ctx = off.getContext("2d");
              ctx.fillStyle = "#ff0000";
              ctx.fillRect(0, 0, 4, 4);
              var px = ctx.getImageData(1, 1, 1, 1).data;
              return {
                inst: ctx instanceof OffscreenCanvasRenderingContext2D,
                notHtml: !(ctx instanceof CanvasRenderingContext2D) || ctx instanceof OffscreenCanvasRenderingContext2D,
                canvas: ctx.canvas === off,
                r: px[0],
                a: px[3]
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["canvas"], true, "{v}");
    assert_eq!(v["r"], 255, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn document_fonts_tracks_font_face_load() {
    let mut page = open(r#"<body></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              var face = new FontFace("VeTest", "local(Arial)", { weight: "400" });
              window.__ff = { before: document.fonts.check("16px VeTest"), after: null, size: 0, status: face.status };
              document.fonts.add(face);
              window.__ff.size = document.fonts.size;
              window.__ff.mid = document.fonts.check("16px VeTest");
              face.load();
              return face.status;
            })()"##,
        )
        .unwrap();
    assert!(started == "loading" || started == "loaded", "{started}");
    assert!(page.settle(20).settled);
    let v = page
        .evaluate(
            r##"(function () {
              window.__ff.after = document.fonts.check("16px VeTest");
              window.__ff.loaded = document.fonts.check("16px VeTest") && [...document.fonts][0].status === "loaded";
              return window.__ff;
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"], true, "unregistered family uses system fonts: {v}");
    assert_eq!(v["mid"], false, "added unloaded face must fail check: {v}");
    assert_eq!(v["size"], 1, "{v}");
    assert_eq!(v["after"], true, "{v}");
    assert_eq!(v["loaded"], true, "{v}");
}

#[test]
fn notification_request_permission_denies() {
    let mut page = open(r#"<body></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              window.__n = { before: Notification.permission, after: null };
              Notification.requestPermission().then(function (p) { window.__n.after = p; });
              return window.__n.before;
            })()"##,
        )
        .unwrap();
    assert_eq!(started, "default", "{started}");
    assert!(page.settle(20).settled);
    let v = page.evaluate("window.__n").unwrap();
    assert_eq!(v["after"], "denied", "{v}");
    assert_eq!(
        page.evaluate("Notification.permission").unwrap(),
        "denied"
    );
}

#[test]
fn crypto_subtle_digests_sha256() {
    let mut page = open(r#"<body></body>"#);
    let _ = page
        .evaluate(
            r##"(function () {
              window.__digest = null;
              crypto.subtle.digest("SHA-256", new Uint8Array([97, 98, 99])).then(function (buf) {
                var u = new Uint8Array(buf);
                var hex = "";
                for (var i = 0; i < u.length; i++) hex += u[i].toString(16).padStart(2, "0");
                window.__digest = hex;
              });
              return true;
            })()"##,
        )
        .unwrap();
    assert!(page.settle(20).settled);
    let v = page.evaluate("window.__digest").unwrap();
    assert_eq!(
        v,
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        "{v}"
    );
}

#[test]
fn navigation_precommit_redirect_updates_location() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              navigation.addEventListener("navigate", function (ev) {
                ev.intercept({
                  precommitHandler: function (ctrl) { ctrl.redirect("#other"); }
                });
              });
              navigation.navigate("#first");
              return { hash: location.hash, dest: navigation.currentEntry.url };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["hash"], "#other", "{v}");
}

#[test]
fn fetch_reads_blob_object_url() {
    let mut page = open(r#"<body></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              var blob = new Blob(["hello-blob"], { type: "text/plain" });
              window.__blobUrl = URL.createObjectURL(blob);
              window.__blobText = null;
              window.__revoked = null;
              fetch(window.__blobUrl).then(function (r) { return r.text(); }).then(function (t) {
                window.__blobText = t;
                URL.revokeObjectURL(window.__blobUrl);
                return fetch(window.__blobUrl).then(function () { window.__revoked = "ok"; }, function () { window.__revoked = "fail"; });
              });
              return { unique: window.__blobUrl !== "blob:vector:0", prefix: window.__blobUrl.indexOf("blob:") === 0 };
            })()"##,
        )
        .unwrap();
    assert_eq!(started["unique"], true, "{started}");
    assert_eq!(started["prefix"], true, "{started}");
    assert!(page.settle(20).settled);
    let v = page
        .evaluate("({ text: window.__blobText, revoked: window.__revoked })")
        .unwrap();
    assert_eq!(v["text"], "hello-blob", "{v}");
    assert_eq!(v["revoked"], "fail", "{v}");
}

#[test]
fn speech_synthesis_speak_fires_start_and_end() {
    let mut page = open(r#"<body></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              window.__sp = [];
              var u = new SpeechSynthesisUtterance("hi");
              u.onstart = function () { window.__sp.push("start"); };
              u.onend = function () { window.__sp.push("end"); };
              speechSynthesis.speak(u);
              return { speaking: speechSynthesis.speaking, voices: speechSynthesis.getVoices().length };
            })()"##,
        )
        .unwrap();
    assert_eq!(started["speaking"], true, "{started}");
    assert!(page.settle(20).settled);
    let v = page
        .evaluate("({ ev: window.__sp.join(','), speaking: speechSynthesis.speaking })")
        .unwrap();
    assert_eq!(v["ev"], "start,end", "{v}");
    assert_eq!(v["speaking"], false, "{v}");
}

#[test]
fn visual_viewport_tracks_inner_size_and_scroll() {
    let mut page = open(r#"<body style="height:2000px">x</body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              window.__vv = 0;
              visualViewport.addEventListener("scroll", function () { window.__vv++; });
              return {
                inst: visualViewport instanceof VisualViewport,
                w: visualViewport.width,
                h: visualViewport.height,
                innerW: innerWidth,
                innerH: innerHeight,
                top0: visualViewport.pageTop
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(started["inst"], true, "{started}");
    assert_eq!(started["w"], started["innerW"], "{started}");
    assert_eq!(started["h"], started["innerH"], "{started}");
    assert_eq!(started["top0"], 0.0, "{started}");
    let v = page
        .evaluate(
            r##"(function () {
              scrollTo(0, 80);
              return { top: visualViewport.pageTop, left: visualViewport.pageLeft, hits: window.__vv };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["top"], 80.0, "{v}");
    assert!(v["hits"].as_u64().unwrap_or(0) >= 1, "{v}");
}

#[test]
fn window_scroll_y_tracks_document_element_scroll_top() {
    let mut page = open(r#"<body style="height:2000px">x</body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              scrollTo(0, 80);
              return {
                y: scrollY,
                x: scrollX,
                top: document.documentElement.scrollTop
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["y"], 80.0, "{v}");
    assert_eq!(v["top"], 80.0, "{v}");
}

#[test]
fn selection_set_base_and_extent_and_delete_from_document() {
    let mut page = open(r#"<body><p id="p">hello world</p></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const p = document.getElementById("p");
              const text = p.firstChild;
              const sel = getSelection();
              let ctorThrew = false;
              try { new Selection(); } catch (e) { ctorThrew = e instanceof TypeError; }
              sel.selectAllChildren(p);
              const all = {
                isSel: sel instanceof Selection,
                tag: Object.prototype.toString.call(sel),
                type: sel.type,
                collapsed: sel.isCollapsed,
                count: sel.rangeCount,
                text: String(sel),
                contains: sel.containsNode(p, true),
                ctorThrew
              };
              sel.setBaseAndExtent(text, 0, text, 5);
              const mid = { type: sel.type, collapsed: sel.isCollapsed, text: String(sel), ao: sel.anchorOffset, fo: sel.focusOffset };
              sel.deleteFromDocument();
              sel.removeAllRanges();
              let emptyThrew = false;
              try { sel.collapseToStart(); } catch (e) { emptyThrew = e.name === "InvalidStateError"; }
              return { all, mid, left: p.textContent, emptyThrew, none: sel.type };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["all"]["isSel"], true, "{v}");
    assert_eq!(v["all"]["tag"], "[object Selection]", "{v}");
    assert_eq!(v["all"]["type"], "Range", "{v}");
    assert_eq!(v["all"]["collapsed"], false, "{v}");
    assert_eq!(v["all"]["count"], 1, "{v}");
    assert_eq!(v["all"]["text"], "hello world", "{v}");
    assert_eq!(v["all"]["contains"], true, "{v}");
    assert_eq!(v["all"]["ctorThrew"], true, "{v}");
    assert_eq!(v["mid"]["type"], "Range", "{v}");
    assert_eq!(v["mid"]["text"], "hello", "{v}");
    assert_eq!(v["mid"]["ao"], 0, "{v}");
    assert_eq!(v["mid"]["fo"], 5, "{v}");
    assert_eq!(v["left"], " world", "{v}");
    assert_eq!(v["emptyThrew"], true, "{v}");
    assert_eq!(v["none"], "None", "{v}");
}

#[test]
fn document_open_clears_body_and_close_finishes() {
    let mut page = open(r#"<body><p id="keep">keep</p></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              let loaded = 0;
              let ready = 0;
              addEventListener("load", function () { loaded++; });
              document.addEventListener("DOMContentLoaded", function () { ready++; });
              const before = !!document.getElementById("keep");
              document.open();
              const mid = document.body.childNodes.length;
              document.write("<p id=n>new</p>");
              document.close();
              return {
                before,
                mid,
                after: document.getElementById("n") && document.getElementById("n").textContent,
                keepGone: !document.getElementById("keep"),
                ready,
                loaded
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"], true, "{v}");
    assert_eq!(v["mid"], 0, "{v}");
    assert_eq!(v["after"], "new", "{v}");
    assert_eq!(v["keepGone"], true, "{v}");
    assert_eq!(v["ready"], 1, "{v}");
    assert_eq!(v["loaded"], 1, "{v}");
}

#[test]
fn indexeddb_exposes_idb_classes() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__idbcls = "pending";
          const req = indexedDB.open("cls");
          req.onsuccess = function () {
            const db = req.result;
            const store = db.createObjectStore("kv");
            const tx = db.transaction("kv");
            window.__idbcls = {
              factory: indexedDB instanceof IDBFactory,
              openReq: req instanceof IDBOpenDBRequest && req instanceof IDBRequest,
              db: db instanceof IDBDatabase,
              store: store instanceof IDBObjectStore,
              tx: tx instanceof IDBTransaction,
              tag: Object.prototype.toString.call(db)
            };
          };
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__idbcls").unwrap();
    assert_eq!(v["factory"], true, "{v}");
    assert_eq!(v["openReq"], true, "{v}");
    assert_eq!(v["db"], true, "{v}");
    assert_eq!(v["store"], true, "{v}");
    assert_eq!(v["tx"], true, "{v}");
    assert_eq!(v["tag"], "[object IDBDatabase]", "{v}");
}

#[test]
fn crypto_subtle_digests_sha1_and_signs_hmac() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__crypto2 = null;
          const keyBytes = new TextEncoder().encode("key");
          const msg = new TextEncoder().encode("The quick brown fox jumps over the lazy dog");
          Promise.all([
            crypto.subtle.digest("SHA-1", new Uint8Array([97, 98, 99])),
            crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]).then(function (key) {
              return crypto.subtle.sign("HMAC", key, msg);
            })
          ]).then(function (bufs) {
            const hex = function (buf) {
              return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
            };
            window.__crypto2 = { sha1: hex(bufs[0]), hmac: hex(bufs[1]) };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__crypto2").unwrap();
    assert_eq!(v["sha1"], "a9993e364706816aba3e25717850c26c9cd0d89d", "{v}");
    assert_eq!(
        v["hmac"],
        "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8",
        "{v}"
    );
}

#[test]
fn intersection_observer_refires_after_scroll() {
    let mut page = open(
        r#"<body>
          <div id="out" style="position:absolute;top:2000px;left:0;width:40px;height:20px">out</div>
        </body>"#,
    );
    page.evaluate(
        r##"(function () {
          window.__ioHits = [];
          new IntersectionObserver(function (recs) {
            window.__ioHits.push(recs[0] && recs[0].isIntersecting);
          }).observe(document.getElementById("out"));
        })()"##,
    )
    .unwrap();
    assert!(page.settle(20).settled);
    page.evaluate("scrollTo(0, 2000)").unwrap();
    assert!(page.settle(20).settled);
    let v = page
        .evaluate(
            r##"(function () {
              return { hits: window.__ioHits, top: document.getElementById("out").getBoundingClientRect().top };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["hits"][0], false, "{v}");
    assert_eq!(v["hits"][1], true, "{v}");
}

#[test]
fn intersection_observer_refires_after_resize() {
    let mut page = open(
        r#"<body>
          <div id="box" style="width:200px;height:200px">box</div>
        </body>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              const hits = [];
              const io = new IntersectionObserver(function (recs) {
                hits.push({
                  i: recs[0] && recs[0].isIntersecting,
                  r: recs[0] && recs[0].intersectionRatio,
                  w: innerWidth
                });
              });
              io.observe(document.getElementById("box"));
              io._fire();
              const afterFirst = hits.length;
              resizeTo(50, 50);
              return { hits: hits, afterFirst: afterFirst, inner: innerWidth };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inner"], 50, "{v}");
    assert!(v["afterFirst"].as_i64().unwrap_or(0) >= 1, "{v}");
    assert!(
        v["hits"].as_array().map(|a| a.len()).unwrap_or(0) >= 2,
        "{v}"
    );
    assert_eq!(v["hits"][0]["i"], true, "{v}");
    assert_eq!(v["hits"][0]["w"], 1280, "{v}");
    assert_eq!(v["hits"][1]["w"], 50, "{v}");
}

#[test]
fn resize_observer_refires_when_style_width_changes() {
    let mut page = open(r#"<body><div id="t" style="width:80px;height:20px">x</div></body>"#);
    page.evaluate(
        r##"(function () {
          window.__roW = [];
          new ResizeObserver(function (recs) {
            window.__roW.push(recs[0] && recs[0].contentRect.width);
          }).observe(document.getElementById("t"));
        })()"##,
    )
    .unwrap();
    assert!(page.settle(20).settled);
    page.evaluate("document.getElementById('t').style.width = '160px'").unwrap();
    assert!(page.settle(20).settled);
    let v = page.evaluate("window.__roW").unwrap();
    assert_eq!(v[0], 80.0, "{v}");
    assert_eq!(v[1], 160.0, "{v}");
}

#[test]
fn mutation_record_is_a_real_class() {
    let mut page = open(r#"<body><div id="c"></div></body>"#);
    page.evaluate(
        r##"(function () {
          window.__mr = null;
          const c = document.getElementById("c");
          const obs = new MutationObserver(function (recs) { window.__mr = recs[0]; });
          obs.observe(c, { childList: true });
          c.appendChild(document.createElement("span"));
        })()"##,
    )
    .unwrap();
    assert!(page.settle(20).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const r = window.__mr;
              return {
                isRec: r instanceof MutationRecord,
                tag: Object.prototype.toString.call(r),
                type: r && r.type,
                added: r && r.addedNodes && r.addedNodes.length
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["isRec"], true, "{v}");
    assert_eq!(v["tag"], "[object MutationRecord]", "{v}");
    assert_eq!(v["type"], "childList", "{v}");
    assert_eq!(v["added"], 1, "{v}");
}

#[test]
fn exec_command_selects_inserts_and_deletes() {
    let mut page = open(r#"<body><p id="p">hello</p></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const p = document.getElementById("p");
              const text = p.firstChild;
              const supported = document.queryCommandSupported("insertText") && document.queryCommandEnabled("delete");
              document.execCommand("selectAll");
              const selected = String(getSelection());
              getSelection().setBaseAndExtent(text, 0, text, text.length);
              document.execCommand("delete");
              const afterDel = p.textContent;
              document.execCommand("insertText", false, "hi");
              document.execCommand("copy");
              return {
                supported,
                selected,
                afterDel,
                afterIns: p.textContent
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["supported"], true, "{v}");
    assert_eq!(v["selected"], "hello", "{v}");
    assert_eq!(v["afterDel"], "", "{v}");
    assert_eq!(v["afterIns"], "hi", "{v}");
}

#[test]
fn element_animate_applies_opacity_and_finishes() {
    let mut page = open(r#"<body><div id="box" style="opacity:0">x</div></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const el = document.getElementById("box");
              const a = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 0, fill: "forwards" });
              return {
                isAnim: a instanceof Animation,
                tag: Object.prototype.toString.call(a),
                state: a.playState,
                opacity: getComputedStyle(el).opacity,
                timeline: document.timeline instanceof DocumentTimeline
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["isAnim"], true, "{v}");
    assert_eq!(v["tag"], "[object Animation]", "{v}");
    assert_eq!(v["state"], "finished", "{v}");
    assert_eq!(v["opacity"], "1", "{v}");
    assert_eq!(v["timeline"], true, "{v}");
}

#[test]
fn element_animate_interpolates_opacity_over_time() {
    let mut page = open(r#"<body><div id="box" style="opacity:0">x</div></body>"#);
    let started = page
        .evaluate(
            r##"(function () {
              window.__anim = document.getElementById("box").animate(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: 80, fill: "forwards" }
              );
              return {
                state: window.__anim.playState,
                opacity: getComputedStyle(document.getElementById("box")).opacity
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(started["state"], "running", "{started}");
    assert_eq!(started["opacity"], "0", "{started}");
    let _ = page.settle(200);
    let v = page
        .evaluate(
            r##"(function () {
              return {
                opacity: getComputedStyle(document.getElementById("box")).opacity,
                state: window.__anim.playState
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["opacity"], "1", "{v}");
    assert_eq!(v["state"], "finished", "{v}");
}

#[test]
fn dialog_show_modal_requires_connected_and_close_fires() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const d = document.createElement("dialog");
              let disconnected = false;
              try { d.showModal(); } catch (e) { disconnected = e.name === "InvalidStateError"; }
              document.body.appendChild(d);
              d.showModal();
              let already = false;
              try { d.showModal(); } catch (e) { already = e.name === "InvalidStateError"; }
              let closed = 0;
              d.addEventListener("close", function () { closed++; });
              d.close("done");
              return {
                disconnected,
                already,
                closed,
                ret: d.returnValue,
                open: d.open
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["disconnected"], true, "{v}");
    assert_eq!(v["already"], true, "{v}");
    assert_eq!(v["closed"], 1, "{v}");
    assert_eq!(v["ret"], "done", "{v}");
    assert_eq!(v["open"], false, "{v}");
}

#[test]
fn element_get_animations_lists_running_and_finished() {
    let mut page = open(r#"<body><div id="a">x</div><div id="b">y</div></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const a = document.getElementById("a");
              const b = document.getElementById("b");
              const run = a.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 80, fill: "forwards" });
              const done = b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 0, fill: "forwards" });
              const listed = a.getAnimations();
              const all = document.getAnimations();
              return {
                runCount: listed.length,
                runSame: listed[0] === run,
                runState: listed[0] && listed[0].playState,
                doneCount: b.getAnimations().length,
                doneState: b.getAnimations()[0] && b.getAnimations()[0].playState,
                allCount: all.length,
                allHasRun: all.indexOf(run) >= 0,
                allHasDone: all.indexOf(done) >= 0
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["runCount"], 1, "{v}");
    assert_eq!(v["runSame"], true, "{v}");
    assert_eq!(v["runState"], "running", "{v}");
    assert_eq!(v["doneCount"], 1, "{v}");
    assert_eq!(v["doneState"], "finished", "{v}");
    assert_eq!(v["allCount"], 2, "{v}");
    assert_eq!(v["allHasRun"], true, "{v}");
    assert_eq!(v["allHasDone"], true, "{v}");
}

#[test]
fn crypto_subtle_aes_gcm_round_trips_and_matches_nist() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__aes = null;
          const keyBytes = new Uint8Array(16);
          const iv = new Uint8Array(12);
          const nist = crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]).then(function (key) {
            return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new Uint8Array(0)).then(function (empty) {
              const hex = Array.from(new Uint8Array(empty)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
              return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode("abc")).then(function (ct) {
                return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct).then(function (pt) {
                  window.__aes = { nist: hex, text: new TextDecoder().decode(pt), ctLen: ct.byteLength };
                });
              });
            });
          });
          nist.catch(function (e) { window.__aes = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__aes").unwrap();
    assert_eq!(
        v["nist"],
        "58e2fccefa7e3061367f1d57a4e7455a",
        "{v}"
    );
    assert_eq!(v["text"], "abc", "{v}");
    assert_eq!(v["ctLen"], 19, "{v}");
}

#[test]
fn slot_assigned_nodes_match_named_and_manual() {
    let mut page = open(r#"<body><div id="host"><span id="a" slot="s">A</span><span id="b">B</span></div></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const host = document.getElementById("host");
              const shadow = host.attachShadow({ mode: "open" });
              shadow.innerHTML = "<slot name=\"s\"></slot><slot></slot>";
              const named = shadow.querySelector("slot[name=s]");
              const def = shadow.querySelector("slot:not([name])");
              const a = document.getElementById("a");
              const namedNodes = named.assignedNodes();
              const defEls = def.assignedElements();
              return {
                namedCount: namedNodes.length,
                namedSame: namedNodes[0] === a,
                namedEls: named.assignedElements().length,
                defCount: defEls.length,
                defTag: defEls[0] && defEls[0].id,
                aSlot: a.assignedSlot === named
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["namedCount"], 1, "{v}");
    assert_eq!(v["namedSame"], true, "{v}");
    assert_eq!(v["namedEls"], 1, "{v}");
    assert_eq!(v["defCount"], 1, "{v}");
    assert_eq!(v["defTag"], "b", "{v}");
    assert_eq!(v["aSlot"], true, "{v}");
}

#[test]
fn speech_synthesis_exposes_a_default_voice() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const voices = speechSynthesis.getVoices();
              return {
                count: voices.length,
                isVoice: voices[0] instanceof SpeechSynthesisVoice,
                tag: Object.prototype.toString.call(voices[0]),
                name: voices[0] && voices[0].name,
                lang: voices[0] && voices[0].lang,
                def: voices[0] && voices[0].default
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["count"], 1, "{v}");
    assert_eq!(v["isVoice"], true, "{v}");
    assert_eq!(v["tag"], "[object SpeechSynthesisVoice]", "{v}");
    assert_eq!(v["name"], "Vector", "{v}");
    assert_eq!(v["lang"], "en-US", "{v}");
    assert_eq!(v["def"], true, "{v}");
}

#[test]
fn data_transfer_files_from_item_add() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const dt = new DataTransfer();
              const file = new File(["hi"], "x.txt", { type: "text/plain" });
              const item = dt.items.add(file);
              return {
                len: dt.files.length,
                name: dt.files[0] && dt.files[0].name,
                kind: item && item.kind,
                asFile: item && item.getAsFile() && item.getAsFile().name,
                listTag: Object.prototype.toString.call(dt.files)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["len"], 1, "{v}");
    assert_eq!(v["name"], "x.txt", "{v}");
    assert_eq!(v["kind"], "file", "{v}");
    assert_eq!(v["asFile"], "x.txt", "{v}");
    assert_eq!(v["listTag"], "[object FileList]", "{v}");
}

#[test]
fn url_can_parse_and_parse_relative() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const ok = URL.canParse("https://s.test/a");
              const rel = URL.parse("/x", "https://s.test/y");
              const bad = URL.canParse("::::");
              const none = URL.parse("::::");
              return {
                ok,
                rel: rel && rel.href,
                bad,
                none: none === null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ok"], true, "{v}");
    assert_eq!(v["rel"], "https://s.test/x", "{v}");
    assert_eq!(v["bad"], false, "{v}");
    assert_eq!(v["none"], true, "{v}");
}

#[test]
fn element_check_visibility_honours_display_and_opacity() {
    let mut page = open(
        r#"<body>
          <div id="ok">x</div>
          <div id="hid" style="display:none">x</div>
          <div id="fade" style="opacity:0">x</div>
        </body>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              const detached = document.createElement("div");
              return {
                ok: document.getElementById("ok").checkVisibility(),
                hid: document.getElementById("hid").checkVisibility(),
                fadeDefault: document.getElementById("fade").checkVisibility(),
                fadeOpacity: document.getElementById("fade").checkVisibility({ checkOpacity: true }),
                detached: detached.checkVisibility()
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ok"], true, "{v}");
    assert_eq!(v["hid"], false, "{v}");
    assert_eq!(v["fadeDefault"], true, "{v}");
    assert_eq!(v["fadeOpacity"], false, "{v}");
    assert_eq!(v["detached"], false, "{v}");
}

#[test]
fn form_request_submit_fires_cancelable_submit() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const form = document.createElement("form");
              const btn = document.createElement("button");
              form.appendChild(btn);
              document.body.appendChild(form);
              let count = 0;
              let submitterOk = false;
              form.addEventListener("submit", function (e) {
                count++;
                submitterOk = e.submitter === btn && e instanceof SubmitEvent;
                e.preventDefault();
              });
              form.requestSubmit(btn);
              let notFound = false;
              const other = document.createElement("button");
              document.body.appendChild(other);
              try { form.requestSubmit(other); } catch (e) { notFound = e.name === "NotFoundError"; }
              return { count, submitterOk, notFound };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["count"], 1, "{v}");
    assert_eq!(v["submitterOk"], true, "{v}");
    assert_eq!(v["notFound"], true, "{v}");
}

#[test]
fn document_start_view_transition_runs_callback() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__vt = null;
          const vt = document.startViewTransition(function () { window.__ran = true; });
          window.__inst = vt instanceof ViewTransition;
          window.__tag = Object.prototype.toString.call(vt);
          Promise.all([vt.updateCallbackDone, vt.ready, vt.finished]).then(function () {
            window.__vt = { ran: !!window.__ran, inst: window.__inst, tag: window.__tag };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__vt").unwrap();
    assert_eq!(v["ran"], true, "{v}");
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["tag"], "[object ViewTransition]", "{v}");
}

#[test]
fn css_register_property_supplies_initial_value() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              CSS.registerProperty({ name: "--ve-x", syntax: "<number>", inherits: false, initialValue: "4" });
              let dup = false;
              try { CSS.registerProperty({ name: "--ve-x", syntax: "*", inherits: false, initialValue: "1" }); }
              catch (e) { dup = e.name === "InvalidModificationError"; }
              let bad = false;
              try { CSS.registerProperty({ name: "color", syntax: "*", inherits: false, initialValue: "red" }); }
              catch (e) { bad = e.name === "SyntaxError"; }
              return {
                initial: getComputedStyle(document.body).getPropertyValue("--ve-x"),
                dup,
                bad
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["initial"], "4", "{v}");
    assert_eq!(v["dup"], true, "{v}");
    assert_eq!(v["bad"], true, "{v}");
}

#[test]
fn crypto_subtle_verifies_hmac() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__ver = null;
          const keyBytes = new TextEncoder().encode("key");
          const msg = new TextEncoder().encode("The quick brown fox jumps over the lazy dog");
          crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]).then(function (key) {
            return crypto.subtle.sign("HMAC", key, msg).then(function (sig) {
              return Promise.all([
                crypto.subtle.verify("HMAC", key, sig, msg),
                crypto.subtle.verify("HMAC", key, new Uint8Array(32), msg)
              ]).then(function (ok) {
                window.__ver = { good: ok[0], bad: ok[1] };
              });
            });
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__ver").unwrap();
    assert_eq!(v["good"], true, "{v}");
    assert_eq!(v["bad"], false, "{v}");
}

#[test]
fn scheduler_post_task_runs_callback() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__sched = null;
          scheduler.postTask(function () { return 7; }).then(function (v) {
            window.__sched = v;
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__sched").unwrap();
    assert_eq!(v, 7, "{v}");
}

#[test]
fn popover_show_hide_fires_toggle_events() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const el = document.createElement("div");
              el.popover = "auto";
              document.body.appendChild(el);
              const evs = [];
              el.addEventListener("beforetoggle", function (e) {
                evs.push(["before", e.oldState, e.newState, e instanceof ToggleEvent]);
              });
              el.addEventListener("toggle", function (e) {
                evs.push(["toggle", e.oldState, e.newState]);
              });
              el.showPopover();
              const open = el.togglePopover();
              el.hidePopover();
              let cancelled = 0;
              el.addEventListener("beforetoggle", function (e) { e.preventDefault(); cancelled++; });
              el.showPopover();
              return { evs, open, cancelled, stillClosed: !el._popoverOpen };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["evs"][0][0], "before", "{v}");
    assert_eq!(v["evs"][0][1], "closed", "{v}");
    assert_eq!(v["evs"][0][2], "open", "{v}");
    assert_eq!(v["evs"][0][3], true, "{v}");
    assert_eq!(v["evs"][1][0], "toggle", "{v}");
    assert_eq!(v["open"], false, "{v}");
    assert_eq!(v["cancelled"], 1, "{v}");
    assert_eq!(v["stillClosed"], true, "{v}");
}

#[test]
fn caches_open_put_and_match_blob_url() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__cache = null;
          const url = URL.createObjectURL(new Blob(["hi"], { type: "text/plain" }));
          caches.open("v1").then(function (cache) {
            return cache.add(url).then(function () {
              return cache.match(url).then(function (res) {
                return res.text().then(function (text) {
                  return caches.has("v1").then(function (has) {
                    window.__cache = {
                      text,
                      has,
                      inst: cache instanceof Cache,
                      storage: caches instanceof CacheStorage
                    };
                  });
                });
              });
            });
          }).catch(function (e) { window.__cache = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__cache").unwrap();
    assert_eq!(v["text"], "hi", "{v}");
    assert_eq!(v["has"], true, "{v}");
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["storage"], true, "{v}");
}

#[test]
fn request_fullscreen_sets_document_element() {
    let mut page = open(r#"<body><div id="box">x</div></body>"#);
    page.evaluate(
        r##"(function () {
          window.__fs = null;
          const el = document.getElementById("box");
          el.requestFullscreen().then(function () {
            const on = document.fullscreenElement === el && document.fullscreenEnabled;
            return document.exitFullscreen().then(function () {
              window.__fs = { on, off: document.fullscreenElement === null };
            });
          }).catch(function (e) { window.__fs = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__fs").unwrap();
    assert_eq!(v["on"], true, "{v}");
    assert_eq!(v["off"], true, "{v}");
}

#[test]
fn navigator_share_and_locks_request() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__nav = null;
          const can = navigator.canShare({ title: "t", text: "x" });
          Promise.all([
            navigator.share({ title: "t", text: "x" }),
            navigator.locks.request("k", function (lock) { return lock.name + ":" + lock.mode; })
          ]).then(function (vals) {
            window.__nav = {
              can,
              shared: navigator._lastShare && navigator._lastShare.title,
              lock: vals[1]
            };
          }).catch(function (e) { window.__nav = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__nav").unwrap();
    assert_eq!(v["can"], true, "{v}");
    assert_eq!(v["shared"], "t", "{v}");
    assert_eq!(v["lock"], "k:exclusive", "{v}");
}

#[test]
fn match_media_returns_media_query_list() {
    let mut page = open("<title>mql</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const mql = matchMedia("(min-width: 1px)");
              return {
                inst: mql instanceof MediaQueryList,
                media: mql.media,
                matches: mql.matches,
                tag: Object.prototype.toString.call(mql)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["media"], "(min-width: 1px)", "{v}");
    assert_eq!(v["matches"], true, "{v}");
    assert_eq!(v["tag"], "[object MediaQueryList]", "{v}");
}

#[test]
fn history_go_after_push_state_fires_popstate() {
    let mut page = open("<title>hist</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const evs = [];
              addEventListener("popstate", function (e) {
                evs.push({
                  inst: e instanceof PopStateEvent,
                  state: e.state,
                  href: location.href
                });
              });
              history.pushState({ n: 1 }, "", "/one");
              history.pushState({ n: 2 }, "", "/two");
              const two = history.state;
              history.back();
              const one = history.state;
              history.forward();
              return { two, one, after: history.state, evs, len: history.length };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["two"]["n"], 2, "{v}");
    assert_eq!(v["one"]["n"], 1, "{v}");
    assert_eq!(v["after"]["n"], 2, "{v}");
    assert_eq!(v["evs"][0]["inst"], true, "{v}");
    assert_eq!(v["evs"][0]["state"]["n"], 1, "{v}");
    assert_eq!(v["evs"][1]["inst"], true, "{v}");
    assert_eq!(v["evs"][1]["state"]["n"], 2, "{v}");
}

#[test]
fn css_highlights_registry_stores_ranges() {
    let mut page = open("<title>hl</title><p>hi</p>");
    let v = page
        .evaluate(
            r##"(function () {
              const r = new Range();
              const h = new Highlight(r);
              CSS.highlights.set("mark", h);
              return {
                inst: h instanceof Highlight,
                size: h.size,
                has: CSS.highlights.has("mark"),
                same: CSS.highlights.get("mark") === h,
                tag: Object.prototype.toString.call(CSS.highlights)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["size"], 1, "{v}");
    assert_eq!(v["has"], true, "{v}");
    assert_eq!(v["same"], true, "{v}");
    assert_eq!(v["tag"], "[object HighlightRegistry]", "{v}");
}

#[test]
fn crypto_subtle_aes_cbc_round_trips_nist() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__cbc = null;
          const keyBytes = new Uint8Array([0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x88,0x09,0xcf,0x4f,0x3c]);
          const iv = new Uint8Array([0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0b,0x0c,0x0d,0x0e,0x0f]);
          const pt = new Uint8Array([0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x11,0x73,0x93,0x17,0x2a]);
          const expect = [0x76,0x49,0xab,0xac,0x81,0x19,0xb2,0x46,0xce,0xe9,0x8e,0x9b,0x12,0xe9,0x19,0x7d];
          crypto.subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, ["encrypt", "decrypt"]).then(function (key) {
            return crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, key, pt).then(function (ct) {
              const got = Array.from(new Uint8Array(ct));
              return crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, key, ct).then(function (back) {
                const plain = Array.from(new Uint8Array(back));
                window.__cbc = {
                  nist: expect.every(function (b, i) { return b === got[i]; }),
                  round: plain.every(function (b, i) { return b === pt[i]; })
                };
              });
            });
          }).catch(function (e) { window.__cbc = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__cbc").unwrap();
    assert_eq!(v["nist"], true, "{v}");
    assert_eq!(v["round"], true, "{v}");
}

#[test]
fn crypto_subtle_pbkdf2_derives_sha256_bits() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__pbk = null;
          const expect = [0x12,0x0f,0xb6,0xcf,0xfc,0xf8,0xb3,0x2c,0x43,0xe7,0x22,0x52,0x56,0xc4,0xf8,0x37,0xa8,0x65,0x48,0xc9,0x2c,0xcc,0x35,0x48,0x08,0x05,0x98,0x7c,0xb7,0x0b,0xe1,0x7b];
          const pw = new TextEncoder().encode("password");
          const salt = new TextEncoder().encode("salt");
          crypto.subtle.importKey("raw", pw, "PBKDF2", false, ["deriveBits"]).then(function (key) {
            return crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: 1, hash: "SHA-256" }, key, 256).then(function (bits) {
              const got = Array.from(new Uint8Array(bits));
              window.__pbk = { ok: expect.every(function (b, i) { return b === got[i]; }), got: got };
            });
          }).catch(function (e) { window.__pbk = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__pbk").unwrap();
    assert_eq!(v["ok"], true, "{v}");
}

#[test]
fn streams_and_url_pattern_are_real_classes() {
    let mut page = open("<title>st</title>");
    page.evaluate(
        r##"(function () {
          window.__st = null;
          const t = new TransformStream({
            transform(chunk, ctrl) { ctrl.enqueue(chunk + 1); }
          });
          const w = t.writable.getWriter();
          const r = t.readable.getReader();
          w.write(2).then(function () { return w.close(); }).then(function () {
            return r.read();
          }).then(function (v) {
            const p = new URLPattern({ pathname: "/books/:id" });
            window.__st = {
              stream: new ReadableStream() instanceof ReadableStream,
              writable: t.writable instanceof WritableStream,
              transform: t instanceof TransformStream,
              out: v.value,
              url: p.test("https://s.test/books/7") && p.exec("https://s.test/books/7").pathname.input === "/books/7"
            };
          }).catch(function (e) { window.__st = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__st").unwrap();
    assert_eq!(v["stream"], true, "{v}");
    assert_eq!(v["writable"], true, "{v}");
    assert_eq!(v["transform"], true, "{v}");
    assert_eq!(v["out"], 3, "{v}");
    assert_eq!(v["url"], true, "{v}");
}

#[test]
fn audio_context_creates_oscillator_and_gain() {
    let mut page = open("<title>au</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain).connect(ctx.destination);
              osc.start();
              return {
                inst: ctx instanceof AudioContext,
                osc: osc instanceof OscillatorNode,
                type: osc.type,
                freq: osc.frequency.value,
                dest: osc._dest === gain && gain._dest === ctx.destination,
                state: ctx.state,
                tag: Object.prototype.toString.call(ctx)
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["osc"], true, "{v}");
    assert_eq!(v["type"], "sine", "{v}");
    assert_eq!(v["freq"], 440, "{v}");
    assert_eq!(v["dest"], true, "{v}");
    assert_eq!(v["state"], "running", "{v}");
    assert_eq!(v["tag"], "[object AudioContext]", "{v}");
}

#[test]
fn canvas_get_context_webgl_reports_version() {
    let mut page = open("<title>gl</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.createElement("canvas");
              const gl = c.getContext("webgl");
              return {
                inst: gl instanceof WebGLRenderingContext,
                version: gl.getParameter(gl.VERSION),
                vendor: gl.getParameter(gl.VENDOR),
                again: c.getContext("webgl") === gl,
                two: c.getContext("2d") === null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["version"], "WebGL 1.0 (Vector)", "{v}");
    assert_eq!(v["vendor"], "Vector", "{v}");
    assert_eq!(v["again"], true, "{v}");
    assert_eq!(v["two"], true, "{v}");
}

#[test]
fn crypto_subtle_generate_key_round_trips_aes_cbc() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__gen = null;
          const iv = new Uint8Array(16);
          const pt = new Uint8Array(16);
          for (let i = 0; i < 16; i++) pt[i] = i + 1;
          crypto.subtle.generateKey({ name: "AES-CBC" }, false, ["encrypt", "decrypt"]).then(function (key) {
            return crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, key, pt).then(function (ct) {
              return crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, key, ct).then(function (back) {
                const plain = new Uint8Array(back);
                window.__gen = {
                  type: key.type,
                  round: Array.from(plain).every(function (b, i) { return b === pt[i]; })
                };
              });
            });
          }).catch(function (e) { window.__gen = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__gen").unwrap();
    assert_eq!(v["type"], "secret", "{v}");
    assert_eq!(v["round"], true, "{v}");
}

#[test]
fn crypto_subtle_export_and_derive_key() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__exp = null;
          const pw = new TextEncoder().encode("password");
          const salt = new TextEncoder().encode("salt");
          crypto.subtle.generateKey({ name: "AES-CBC" }, true, ["encrypt", "decrypt"]).then(function (key) {
            return crypto.subtle.exportKey("raw", key).then(function (raw) {
              return crypto.subtle.importKey("raw", pw, "PBKDF2", false, ["deriveKey"]).then(function (base) {
                return crypto.subtle.deriveKey(
                  { name: "PBKDF2", salt: salt, iterations: 1, hash: "SHA-256" },
                  base,
                  { name: "AES-CBC" },
                  true,
                  ["encrypt", "decrypt"]
                ).then(function (derived) {
                  return crypto.subtle.exportKey("jwk", derived).then(function (jwk) {
                    window.__exp = {
                      rawLen: new Uint8Array(raw).length,
                      kty: jwk.kty,
                      derived: derived.type
                    };
                  });
                });
              });
            });
          }).catch(function (e) { window.__exp = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__exp").unwrap();
    assert_eq!(v["rawLen"], 16, "{v}");
    assert_eq!(v["kty"], "oct", "{v}");
    assert_eq!(v["derived"], "secret", "{v}");
}

#[test]
fn text_encoder_stream_encodes_chunks() {
    let mut page = open("<title>tes</title>");
    page.evaluate(
        r##"(function () {
          window.__tes = null;
          const s = new TextEncoderStream();
          const w = s.writable.getWriter();
          const r = s.readable.getReader();
          w.write("hi").then(function () { return w.close(); }).then(function () {
            return r.read();
          }).then(function (v) {
            const dec = new TextDecoderStream();
            const dw = dec.writable.getWriter();
            const dr = dec.readable.getReader();
            return dw.write(v.value).then(function () { return dw.close(); }).then(function () {
              return dr.read();
            }).then(function (out) {
              window.__tes = {
                enc: s instanceof TextEncoderStream,
                dec: dec instanceof TextDecoderStream,
                bytes: Array.from(v.value),
                text: out.value
              };
            });
          }).catch(function (e) { window.__tes = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__tes").unwrap();
    assert_eq!(v["enc"], true, "{v}");
    assert_eq!(v["dec"], true, "{v}");
    assert_eq!(v["bytes"][0], 104, "{v}");
    assert_eq!(v["bytes"][1], 105, "{v}");
    assert_eq!(v["text"], "hi", "{v}");
}

#[test]
fn rtc_peer_connection_creates_offer() {
    let mut page = open("<title>rtc</title>");
    page.evaluate(
        r##"(function () {
          window.__rtc = null;
          const pc = new RTCPeerConnection();
          let ice = 0;
          pc.addEventListener("icecandidate", function () { ice++; });
          pc.createOffer().then(function (offer) {
            return pc.setLocalDescription(offer).then(function () {
              window.__rtc = {
                inst: pc instanceof RTCPeerConnection,
                type: offer.type,
                sdp: offer.sdp.indexOf("v=0") === 0,
                state: pc.signalingState,
                ice: ice,
                tag: Object.prototype.toString.call(pc)
              };
            });
          }).catch(function (e) { window.__rtc = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__rtc").unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["type"], "offer", "{v}");
    assert_eq!(v["sdp"], true, "{v}");
    assert_eq!(v["state"], "have-local-offer", "{v}");
    assert_eq!(v["ice"], 1, "{v}");
    assert_eq!(v["tag"], "[object RTCPeerConnection]", "{v}");
}

#[test]
fn rtc_data_channel_opens_after_offer_answer() {
    let mut page = open("<title>rtcdc</title>");
    page.evaluate(
        r##"(function () {
          window.__dc = null;
          const a = new RTCPeerConnection();
          const b = new RTCPeerConnection();
          const ch = a.createDataChannel("chat");
          let opened = 0;
          ch.addEventListener("open", function () { opened++; });
          a.createOffer().then(function (offer) {
            return a.setLocalDescription(offer).then(function () {
              return b.setRemoteDescription(offer);
            }).then(function () {
              return b.createAnswer();
            }).then(function (answer) {
              return b.setLocalDescription(answer).then(function () {
                return a.setRemoteDescription(answer);
              });
            }).then(function () {
              window.__dc = {
                inst: ch instanceof RTCDataChannel,
                label: ch.label === "chat",
                open: ch.readyState === "open",
                conn: a.connectionState === "connected",
                opened: opened
              };
            });
          }).catch(function (e) { window.__dc = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(80).settled);
    let v = page.evaluate("window.__dc").unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["label"], true, "{v}");
    assert_eq!(v["open"], true, "{v}");
    assert_eq!(v["conn"], true, "{v}");
}

#[test]
fn computed_style_exposes_fill_rule_and_stroke_joins() {
    let mut page = open(
        r#"<body>
          <div id="s" style="fill-rule:evenodd;stroke-linecap:round;stroke-linejoin:bevel">x</div>
        </body>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              const cs = getComputedStyle(document.getElementById("s"));
              return {
                rule: cs.fillRule === "evenodd" || cs.getPropertyValue("fill-rule") === "evenodd",
                cap: cs.strokeLinecap === "round" || cs.getPropertyValue("stroke-linecap") === "round",
                join: cs.strokeLinejoin === "bevel" || cs.getPropertyValue("stroke-linejoin") === "bevel"
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["rule"], true, "{v}");
    assert_eq!(v["cap"], true, "{v}");
    assert_eq!(v["join"], true, "{v}");
}

#[test]
fn match_media_change_fires_on_resize() {
    let mut page = open("<title>mq</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const mql = matchMedia("(max-width: 400px)");
              const evs = [];
              mql.addEventListener("change", function () { evs.push(mql.matches); });
              const before = mql.matches;
              resizeTo(360, 640);
              const mid = mql.matches;
              resizeTo(1280, 720);
              return {
                before,
                mid,
                after: mql.matches,
                evs,
                width: innerWidth
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"], false, "{v}");
    assert_eq!(v["mid"], true, "{v}");
    assert_eq!(v["after"], false, "{v}");
    assert_eq!(v["evs"][0], true, "{v}");
    assert_eq!(v["evs"][1], false, "{v}");
    assert_eq!(v["width"], 1280, "{v}");
}

#[test]
fn screen_and_outer_size_track_resize() {
    let mut page = open("<title>screen</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const before = {
                sw: screen.width,
                sh: screen.height,
                aw: screen.availWidth,
                ah: screen.availHeight,
                ow: outerWidth,
                oh: outerHeight,
                iw: innerWidth
              };
              resizeTo(360, 640);
              const mid = {
                sw: screen.width,
                sh: screen.height,
                aw: screen.availWidth,
                ow: outerWidth,
                iw: innerWidth
              };
              resizeTo(1280, 720);
              return { before, mid, afterW: screen.width, afterOw: outerWidth };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"]["sw"], 1280, "{v}");
    assert_eq!(v["before"]["iw"], 1280, "{v}");
    assert_eq!(v["mid"]["sw"], 360, "{v}");
    assert_eq!(v["mid"]["sh"], 640, "{v}");
    assert_eq!(v["mid"]["aw"], 360, "{v}");
    assert_eq!(v["mid"]["ow"], 360, "{v}");
    assert_eq!(v["mid"]["iw"], 360, "{v}");
    assert_eq!(v["afterW"], 1280, "{v}");
    assert_eq!(v["afterOw"], 1280, "{v}");
}

#[test]
fn webgl_uniform4f_fills_draw_arrays() {
    let mut page = open(r#"<body><canvas id="c" width="8" height="8"></canvas></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("c");
              const gl = c.getContext("webgl");
              const loc = gl.getUniformLocation(gl.createProgram(), "uColor");
              gl.uniform4f(loc, 1, 0, 0, 1);
              gl.drawArrays(gl.TRIANGLES, 0, 3);
              const px = new Uint8Array(4);
              gl.readPixels(2, 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
              return { loc: !!(loc && loc._u), r: px[0], g: px[1], b: px[2], a: px[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["loc"], true, "{v}");
    assert_eq!(v["r"], 255, "{v}");
    assert_eq!(v["g"], 0, "{v}");
    assert_eq!(v["b"], 0, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn computed_style_exposes_stroke_dashoffset() {
    let mut page = open(
        r#"<body>
          <div id="s" style="stroke-dashoffset:2;stroke-miterlimit:8">x</div>
        </body>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              const cs = getComputedStyle(document.getElementById("s"));
              return {
                off: cs.strokeDashoffset === "2" || cs.getPropertyValue("stroke-dashoffset") === "2",
                miter: cs.strokeMiterlimit === "8" || cs.getPropertyValue("stroke-miterlimit") === "8"
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["off"], true, "{v}");
    assert_eq!(v["miter"], true, "{v}");
}

#[test]
fn rtc_add_track_and_transceiver() {
    let mut page = open("<title>rtctrack</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const pc = new RTCPeerConnection();
              const track = new MediaStreamTrack();
              track.kind = "video";
              const sender = pc.addTrack(track);
              const tr = pc.addTransceiver("audio");
              return {
                senders: pc.getSenders().length,
                receivers: pc.getReceivers().length,
                same: sender.track === track,
                video: pc.getSenders()[0].track.kind === "video",
                audio: tr.receiver.track.kind === "audio",
                connecting: pc.connectionState === "connecting"
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["senders"], 2, "{v}");
    assert_eq!(v["receivers"], 1, "{v}");
    assert_eq!(v["same"], true, "{v}");
    assert_eq!(v["video"], true, "{v}");
    assert_eq!(v["audio"], true, "{v}");
    assert_eq!(v["connecting"], true, "{v}");
}

#[test]
fn midi_display_and_shared_storage_deny() {
    let mut page = open("<title>midi</title>");
    page.evaluate(
        r##"(function () {
          window.__mds = null;
          Promise.allSettled([
            navigator.requestMIDIAccess(),
            navigator.mediaDevices.getDisplayMedia({ video: true }),
            navigator.sharedStorage.get("k"),
            navigator.sharedStorage.set("k", "v")
          ]).then(function (rows) {
            window.__mds = {
              midi: rows[0].status === "rejected" && rows[0].reason.name === "NotAllowedError",
              display: rows[1].status === "rejected" && rows[1].reason.name === "NotAllowedError",
              get: rows[2].status === "rejected" && rows[2].reason.name === "NotAllowedError",
              set: rows[3].status === "rejected" && rows[3].reason.name === "NotAllowedError"
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__mds").unwrap();
    assert_eq!(v["midi"], true, "{v}");
    assert_eq!(v["display"], true, "{v}");
    assert_eq!(v["get"], true, "{v}");
    assert_eq!(v["set"], true, "{v}");
}

#[test]
fn local_fonts_and_screen_details_deny() {
    let mut page = open("<title>fonts</title>");
    page.evaluate(
        r##"(function () {
          window.__fsd = null;
          Promise.allSettled([
            navigator.queryLocalFonts(),
            navigator.getScreenDetails()
          ]).then(function (rows) {
            window.__fsd = {
              fonts: rows[0].status === "rejected" && rows[0].reason.name === "NotAllowedError",
              screen: rows[1].status === "rejected" && rows[1].reason.name === "NotAllowedError"
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__fsd").unwrap();
    assert_eq!(v["fonts"], true, "{v}");
    assert_eq!(v["screen"], true, "{v}");
}

#[test]
fn trusted_types_policy_creates_trusted_html() {
    let mut page = open("<title>tt</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const p = trustedTypes.createPolicy("p", {
                createHTML(s) { return String(s).replace(/x/g, "y"); }
              });
              const t = p.createHTML("ax");
              return {
                inst: t instanceof TrustedHTML,
                html: String(t) === "ay",
                is: trustedTypes.isHTML(t),
                name: p.name === "p"
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["html"], true, "{v}");
    assert_eq!(v["is"], true, "{v}");
    assert_eq!(v["name"], true, "{v}");
}

#[test]
fn canvas_transfer_control_copies_pixels() {
    let mut page = open(r#"<body><canvas id="c" width="8" height="8"></canvas></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("c");
              const ctx = c.getContext("2d");
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(0, 0, 8, 8);
              const off = c.transferControlToOffscreen();
              const d = off.getContext("2d").getImageData(2, 2, 1, 1).data;
              return { r: d[0], g: d[1], b: d[2], a: d[3], w: off.width };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["r"], 0, "{v}");
    assert_eq!(v["g"], 255, "{v}");
    assert_eq!(v["b"], 0, "{v}");
    assert_eq!(v["a"], 255, "{v}");
    assert_eq!(v["w"], 8, "{v}");
}

#[test]
fn set_html_strips_script_and_keeps_paragraph() {
    let mut page = open(r#"<body><div id="t"></div></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const t = document.getElementById("t");
              t.setHTML("<p id=ok>hi</p><script>window.__x=1</script>");
              return {
                p: !!t.querySelector("p#ok"),
                script: t.querySelector("script") == null,
                text: (t.textContent || "").indexOf("hi") >= 0,
                leaked: window.__x == null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["p"], true, "{v}");
    assert_eq!(v["script"], true, "{v}");
    assert_eq!(v["text"], true, "{v}");
    assert_eq!(v["leaked"], true, "{v}");
}

#[test]
fn webgl_framebuffer_clear_blits_via_texture() {
    let mut page = open(r#"<body><canvas id="c" width="8" height="8"></canvas></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("c");
              const gl = c.getContext("webgl");
              const tex = gl.createTexture();
              gl.bindTexture(gl.TEXTURE_2D, tex);
              const fb = gl.createFramebuffer();
              gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
              gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex);
              gl.clearColor(0, 1, 0, 1);
              gl.clear();
              gl.bindFramebuffer(gl.FRAMEBUFFER, null);
              gl.bindTexture(gl.TEXTURE_2D, tex);
              gl.drawArrays(gl.TRIANGLES, 0, 3);
              const px = new Uint8Array(4);
              gl.readPixels(2, 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
              return { fb: !!(fb && fb._fb), r: px[0], g: px[1], b: px[2], a: px[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["fb"], true, "{v}");
    assert_eq!(v["r"], 0, "{v}");
    assert_eq!(v["g"], 255, "{v}");
    assert_eq!(v["b"], 0, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn webgl_scissor_clips_clear() {
    let mut page = open(r#"<body><canvas id="c" width="8" height="8"></canvas></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("c");
              const gl = c.getContext("webgl");
              gl.disable(gl.SCISSOR_TEST);
              gl.clearColor(1, 0, 0, 1);
              gl.clear();
              gl.enable(gl.SCISSOR_TEST);
              gl.scissor(2, 2, 4, 4);
              gl.clearColor(0, 1, 0, 1);
              gl.clear();
              const out = new Uint8Array(4);
              const inr = new Uint8Array(4);
              gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
              gl.readPixels(3, 3, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, inr);
              return {
                on: gl._scissorOn === true,
                cap: gl.SCISSOR_TEST,
                or: out[0], og: out[1],
                ir: inr[0], ig: inr[1], ia: inr[3]
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["on"], true, "{v}");
    assert_eq!(v["cap"], 3089, "{v}");
    assert_eq!(v["or"], 255, "{v}");
    assert_eq!(v["og"], 0, "{v}");
    assert_eq!(v["ir"], 0, "{v}");
    assert_eq!(v["ig"], 255, "{v}");
    assert_eq!(v["ia"], 255, "{v}");
}

#[test]
fn webgl_draw_arrays_fills_vertex_triangle() {
    let mut page = open(r#"<body><canvas id="c" width="8" height="8"></canvas></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("c");
              const gl = c.getContext("webgl");
              gl.clearColor(0, 0, 0, 0);
              gl.clear();
              gl.uniform4f(null, 0, 1, 0, 1);
              const buf = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, buf);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, 0, 0.5]));
              gl.enableVertexAttribArray(0);
              gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
              gl.drawArrays(gl.TRIANGLES, 0, 3);
              const inr = new Uint8Array(4);
              const out = new Uint8Array(4);
              gl.readPixels(4, 3, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, inr);
              gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
              return { g: inr[1], a: inr[3], og: out[1], oa: out[3], n: buf._data.length };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["n"], 6, "{v}");
    assert_eq!(v["g"], 255, "{v}");
    assert_eq!(v["a"], 255, "{v}");
    assert_eq!(v["og"], 0, "{v}");
    assert_eq!(v["oa"], 0, "{v}");
}

#[test]
fn webgl_draw_elements_and_webgl2_context() {
    let mut page = open(r#"<body><canvas id="c" width="8" height="8"></canvas></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("c");
              const two = c.getContext("webgl2");
              const inst = two instanceof WebGL2RenderingContext;
              two.clearColor(0, 0, 0, 0);
              two.clear();
              two.uniform4f(null, 0, 0, 1, 1);
              const vb = two.createBuffer();
              two.bindBuffer(two.ARRAY_BUFFER, vb);
              two.bufferData(two.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, 0, 0.5]));
              const ib = two.createBuffer();
              two.bindBuffer(two.ELEMENT_ARRAY_BUFFER, ib);
              two.bufferData(two.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2]));
              two.enableVertexAttribArray(0);
              two.vertexAttribPointer(0, 2, two.FLOAT, false, 0, 0);
              two.drawElements(two.TRIANGLES, 3, two.UNSIGNED_SHORT, 0);
              const px = new Uint8Array(4);
              two.readPixels(4, 3, 1, 1, two.RGBA, two.UNSIGNED_BYTE, px);
              const blocked = document.createElement("canvas");
              blocked.getContext("2d");
              return {
                inst: inst,
                tag: Object.prototype.toString.call(two),
                b: px[2],
                a: px[3],
                twoNull: blocked.getContext("webgl2") === null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["tag"], "[object WebGL2RenderingContext]", "{v}");
    assert_eq!(v["b"], 255, "{v}");
    assert_eq!(v["a"], 255, "{v}");
    assert_eq!(v["twoNull"], true, "{v}");
}

#[test]
fn document_hidden_tracks_visibility_state() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              let n = 0;
              document.addEventListener("visibilitychange", function () { n++; });
              const a = document.hidden;
              const b = document.visibilityState;
              document.__veSetHidden(true);
              const c = document.hidden;
              const d = document.visibilityState;
              const afterHide = n;
              document.__veSetHidden(true);
              const same = n;
              document.__veSetHidden(false);
              return {
                a: a,
                b: b,
                c: c,
                d: d,
                afterHide: afterHide,
                same: same,
                afterShow: n,
                shown: document.hidden,
                vis: document.visibilityState
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["a"], false, "{v}");
    assert_eq!(v["b"], "visible", "{v}");
    assert_eq!(v["c"], true, "{v}");
    assert_eq!(v["d"], "hidden", "{v}");
    assert_eq!(v["afterHide"], 1, "{v}");
    assert_eq!(v["same"], 1, "{v}");
    assert_eq!(v["afterShow"], 2, "{v}");
    assert_eq!(v["shown"], false, "{v}");
    assert_eq!(v["vis"], "visible", "{v}");
}

#[test]
fn crypto_subtle_digests_sha512() {
    let mut page = open(r#"<body></body>"#);
    let _ = page
        .evaluate(
            r##"(function () {
              window.__sha512 = null;
              crypto.subtle.digest("SHA-512", new Uint8Array([97, 98, 99])).then(function (buf) {
                var u = new Uint8Array(buf);
                var hex = "";
                for (var i = 0; i < u.length; i++) hex += u[i].toString(16).padStart(2, "0");
                window.__sha512 = hex;
              }).catch(function (e) { window.__sha512 = String(e); });
              return true;
            })()"##,
        )
        .unwrap();
    assert!(page.settle(20).settled);
    let v = page.evaluate("window.__sha512").unwrap();
    assert_eq!(
        v,
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
        "{v}"
    );
}

#[test]
fn crypto_subtle_hkdf_matches_rfc5869() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__hkdf = null;
          const ikm = new Uint8Array(22);
          for (let i = 0; i < 22; i++) ikm[i] = 0x0b;
          const salt = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12]);
          const info = new Uint8Array([0xf0,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9]);
          crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]).then(function (key) {
            return crypto.subtle.deriveBits(
              { name: "HKDF", hash: "SHA-256", salt: salt, info: info },
              key,
              336
            );
          }).then(function (buf) {
            var u = new Uint8Array(buf);
            var hex = "";
            for (var i = 0; i < u.length; i++) hex += u[i].toString(16).padStart(2, "0");
            window.__hkdf = hex;
          }).catch(function (e) { window.__hkdf = String(e); });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__hkdf").unwrap();
    assert_eq!(
        v,
        "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865",
        "{v}"
    );
}

#[test]
fn compression_stream_round_trips_gzip() {
    let mut page = open("<title>gz</title>");
    page.evaluate(
        r##"(function () {
          window.__gz = null;
          const cs = new CompressionStream("gzip");
          const w = cs.writable.getWriter();
          const r = cs.readable.getReader();
          w.write(new TextEncoder().encode("hello")).then(function () { return w.close(); }).then(function () {
            return r.read();
          }).then(function (v) {
            const bytes = Array.from(v.value);
            const ds = new DecompressionStream("gzip");
            const dw = ds.writable.getWriter();
            const dr = ds.readable.getReader();
            return dw.write(v.value).then(function () { return dw.close(); }).then(function () {
              return dr.read();
            }).then(function (out) {
              window.__gz = {
                inst: cs instanceof CompressionStream && ds instanceof DecompressionStream,
                magic: bytes[0] === 31 && bytes[1] === 139,
                text: new TextDecoder().decode(out.value)
              };
            });
          }).catch(function (e) { window.__gz = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__gz").unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["magic"], true, "{v}");
    assert_eq!(v["text"], "hello", "{v}");
}

#[test]
fn cookie_store_sets_and_deletes() {
    let mut page = open("<title>ck</title>");
    page.evaluate(
        r##"(function () {
          window.__ck = null;
          cookieStore.set("ve", "1").then(function () {
            return cookieStore.get("ve");
          }).then(function (got) {
            return cookieStore.delete("ve").then(function () {
              return cookieStore.get("ve").then(function (after) {
                window.__ck = {
                  inst: cookieStore instanceof CookieStore,
                  name: got && got.name,
                  value: got && got.value,
                  gone: after === null
                };
              });
            });
          }).catch(function (e) { window.__ck = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__ck").unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["name"], "ve", "{v}");
    assert_eq!(v["value"], "1", "{v}");
    assert_eq!(v["gone"], true, "{v}");
}

#[test]
fn clipboard_item_write_and_read() {
    let mut page = open("<title>clip</title>");
    page.evaluate(
        r##"(function () {
          window.__clip = null;
          const item = new ClipboardItem({ "text/plain": "hi" });
          navigator.clipboard.write([item]).then(function () {
            return navigator.clipboard.read();
          }).then(function (items) {
            return items[0].getType("text/plain").then(function (blob) {
              return blob.text().then(function (t) {
                window.__clip = {
                  inst: item instanceof ClipboardItem,
                  types: item.types,
                  text: t
                };
              });
            });
          }).catch(function (e) { window.__clip = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__clip").unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["types"][0], "text/plain", "{v}");
    assert_eq!(v["text"], "hi", "{v}");
}

#[test]
fn navigator_storage_estimates_usage() {
    let mut page = open("<title>st</title>");
    page.evaluate(
        r##"(function () {
          window.__st = null;
          localStorage.setItem("k", "vv");
          navigator.storage.estimate().then(function (e) {
            window.__st = {
              quota: e.quota,
              usage: e.usage,
              persist: null
            };
            return navigator.storage.persist().then(function (ok) {
              window.__st.persist = ok;
            });
          }).catch(function (e) { window.__st = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__st").unwrap();
    assert_eq!(v["quota"], 1073741824, "{v}");
    assert_eq!(v["usage"], 3, "{v}");
    assert_eq!(v["persist"], false, "{v}");
}

#[test]
fn crypto_subtle_digests_sha384() {
    let mut page = open(r#"<body></body>"#);
    let _ = page
        .evaluate(
            r##"(function () {
              window.__sha384 = null;
              crypto.subtle.digest("SHA-384", new Uint8Array([97, 98, 99])).then(function (buf) {
                var u = new Uint8Array(buf);
                var hex = "";
                for (var i = 0; i < u.length; i++) hex += u[i].toString(16).padStart(2, "0");
                window.__sha384 = hex;
              }).catch(function (e) { window.__sha384 = String(e); });
              return true;
            })()"##,
        )
        .unwrap();
    assert!(page.settle(20).settled);
    let v = page.evaluate("window.__sha384").unwrap();
    assert_eq!(
        v,
        "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
        "{v}"
    );
}

#[test]
fn abort_signal_timeout_and_any() {
    let mut page = open("<title>ab</title>");
    page.evaluate(
        r##"(function () {
          window.__ab = null;
          const done = AbortSignal.abort("gone");
          const c = new AbortController();
          const any = AbortSignal.any([c.signal]);
          c.abort("z");
          const timed = AbortSignal.timeout(5);
          window.__ab = {
            abortInst: done instanceof AbortSignal && done.aborted && done.reason === "gone",
            any: any.aborted && any.reason === "z",
            timed: false
          };
          const check = function () {
            window.__ab.timed = timed.aborted && timed.reason && timed.reason.name === "TimeoutError";
          };
          if (timed.aborted) check();
          else timed.addEventListener("abort", check);
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__ab").unwrap();
    assert_eq!(v["abortInst"], true, "{v}");
    assert_eq!(v["any"], true, "{v}");
    assert_eq!(v["timed"], true, "{v}");
}

#[test]
fn readable_stream_from_enqueues_iterable() {
    let mut page = open("<title>rs</title>");
    page.evaluate(
        r##"(function () {
          window.__rs = null;
          const s = ReadableStream.from(["a", "b"]);
          const r = s.getReader();
          r.read().then(function (first) {
            return r.read().then(function (second) {
              return r.read().then(function (end) {
                window.__rs = {
                  inst: s instanceof ReadableStream,
                  first: first.value,
                  second: second.value,
                  done: end.done
                };
              });
            });
          }).catch(function (e) { window.__rs = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__rs").unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["first"], "a", "{v}");
    assert_eq!(v["second"], "b", "{v}");
    assert_eq!(v["done"], true, "{v}");
}

#[test]
fn css_typed_units_and_scheduler_yield() {
    let mut page = open("<title>cssu</title>");
    page.evaluate(
        r##"(function () {
          window.__cu = null;
          scheduler.yield().then(function () {
            window.__cu = {
              px: CSS.px(12).toString(),
              num: CSS.number(3).toString(),
              pct: CSS.percent(50).toString(),
              deg: CSS.deg(90).toString(),
              yielded: true
            };
          }).catch(function (e) { window.__cu = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__cu").unwrap();
    assert_eq!(v["px"], "12px", "{v}");
    assert_eq!(v["num"], "3", "{v}");
    assert_eq!(v["pct"], "50%", "{v}");
    assert_eq!(v["deg"], "90deg", "{v}");
    assert_eq!(v["yielded"], true, "{v}");
}

#[test]
fn promise_with_resolvers_and_try() {
    let mut page = open("<title>pr</title>");
    page.evaluate(
        r##"(function () {
          window.__pr = null;
          const w = Promise.withResolvers();
          Promise.try(function (n) { return n + 1; }, 2).then(function (v) {
            w.resolve("ok");
            return w.promise.then(function (got) {
              window.__pr = {
                tryVal: v,
                resolved: got,
                prerender: document.prerendering
              };
            });
          }).catch(function (e) { window.__pr = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__pr").unwrap();
    assert_eq!(v["tryVal"], 3, "{v}");
    assert_eq!(v["resolved"], "ok", "{v}");
    assert_eq!(v["prerender"], false, "{v}");
}

#[test]
fn crypto_subtle_aes_ctr_matches_nist() {
    let mut page = open(r#"<body></body>"#);
    page.evaluate(
        r##"(function () {
          window.__ctr = null;
          const keyBytes = Uint8Array.from([0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x88,0x09,0xcf,0x4f,0x3c]);
          const iv = Uint8Array.from([0xf0,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa,0xfb,0xfc,0xfd,0xfe,0xff]);
          const pt = Uint8Array.from([0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x11,0x73,0x93,0x17,0x2a]);
          const expect = "874d6191b620e3261bef6864990db6ce";
          crypto.subtle.importKey("raw", keyBytes, "AES-CTR", false, ["encrypt", "decrypt"]).then(function (key) {
            return crypto.subtle.encrypt({ name: "AES-CTR", counter: iv, length: 128 }, key, pt).then(function (ct) {
              var u = new Uint8Array(ct);
              var hex = "";
              for (var i = 0; i < u.length; i++) hex += u[i].toString(16).padStart(2, "0");
              return crypto.subtle.decrypt({ name: "AES-CTR", counter: iv, length: 128 }, key, ct).then(function (back) {
                var p = new Uint8Array(back);
                window.__ctr = {
                  hex: hex,
                  nist: hex === expect,
                  round: Array.from(p).every(function (b, i) { return b === pt[i]; }),
                  storage: null
                };
                return document.hasStorageAccess().then(function (ok) {
                  window.__ctr.storage = ok;
                });
              });
            });
          }).catch(function (e) { window.__ctr = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__ctr").unwrap();
    assert_eq!(v["nist"], true, "{v}");
    assert_eq!(v["round"], true, "{v}");
    assert_eq!(v["storage"], false, "{v}");
}

#[test]
fn webgl_clear_paints_and_read_pixels() {
    let mut page = open("<title>glp</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.createElement("canvas");
              c.width = 8;
              c.height = 8;
              document.body.appendChild(c);
              const gl = c.getContext("webgl");
              gl.clearColor(1, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              const pix = new Uint8Array(4);
              gl.readPixels(2, 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix);
              return { r: pix[0], g: pix[1], b: pix[2], a: pix[3], inst: gl instanceof WebGLRenderingContext };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["r"], 255, "{v}");
    assert_eq!(v["g"], 0, "{v}");
    assert_eq!(v["b"], 0, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn webgl_shader_compile_and_program_link() {
    let mut page = open("<title>gls</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.createElement("canvas");
              c.width = 4;
              c.height = 4;
              document.body.appendChild(c);
              const gl = c.getContext("webgl");
              const empty = gl.createShader(gl.VERTEX_SHADER);
              gl.compileShader(empty);
              const vs = gl.createShader(gl.VERTEX_SHADER);
              gl.shaderSource(vs, "void main() {}");
              gl.compileShader(vs);
              const prog = gl.createProgram();
              gl.attachShader(prog, vs);
              gl.linkProgram(prog);
              const bad = gl.createProgram();
              gl.linkProgram(bad);
              return {
                empty: gl.getShaderParameter(empty) === false,
                vs: gl.getShaderParameter(vs) === true,
                log: gl.getShaderInfoLog(empty).length > 0,
                linked: gl.getProgramParameter(prog) === true,
                unlinked: gl.getProgramParameter(bad) === false
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["empty"], true, "{v}");
    assert_eq!(v["vs"], true, "{v}");
    assert_eq!(v["log"], true, "{v}");
    assert_eq!(v["linked"], true, "{v}");
    assert_eq!(v["unlinked"], true, "{v}");
}

#[test]
fn audio_buffer_and_get_user_media_denies() {
    let mut page = open("<title>ab</title>");
    page.evaluate(
        r##"(function () {
          window.__abuf = null;
          const ctx = new AudioContext();
          const buf = ctx.createBuffer(1, 4, 44100);
          buf.getChannelData(0)[0] = 0.5;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          let ended = false;
          src.onended = function () { ended = true; };
          src.start();
          const raw = new Uint8Array([128, 255]).buffer;
          ctx.decodeAudioData(raw).then(function (decoded) {
            return navigator.mediaDevices.getUserMedia({ audio: true }).then(function () {
              window.__abuf = { err: "allowed" };
            }).catch(function (e) {
              window.__abuf = {
                inst: buf instanceof AudioBuffer && src instanceof AudioBufferSourceNode,
                sample: buf.getChannelData(0)[0],
                decoded: decoded.length === 2,
                ended: ended,
                deny: e.name === "NotAllowedError",
                time: typeof ctx.currentTime === "number"
              };
            });
          }).catch(function (e) { window.__abuf = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__abuf").unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["sample"], 0.5, "{v}");
    assert_eq!(v["decoded"], true, "{v}");
    assert_eq!(v["ended"], true, "{v}");
    assert_eq!(v["deny"], true, "{v}");
    assert_eq!(v["time"], true, "{v}");
}

#[test]
fn file_pickers_and_wake_lock_deny() {
    let mut page = open("<title>fp</title>");
    page.evaluate(
        r##"(function () {
          window.__fp = null;
          Promise.allSettled([
            showOpenFilePicker(),
            showSaveFilePicker(),
            showDirectoryPicker(),
            navigator.wakeLock.request("screen")
          ]).then(function (rows) {
            window.__fp = {
              open: rows[0].status === "rejected" && rows[0].reason.name === "AbortError",
              save: rows[1].status === "rejected" && rows[1].reason.name === "AbortError",
              dir: rows[2].status === "rejected" && rows[2].reason.name === "AbortError",
              wake: rows[3].status === "rejected" && rows[3].reason.name === "NotAllowedError",
              paint: !!(CSS.paintWorklet && typeof CSS.paintWorklet.addModule === "function")
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__fp").unwrap();
    assert_eq!(v["open"], true, "{v}");
    assert_eq!(v["save"], true, "{v}");
    assert_eq!(v["dir"], true, "{v}");
    assert_eq!(v["wake"], true, "{v}");
    assert_eq!(v["paint"], true, "{v}");
}

#[test]
fn credentials_and_payment_request_deny() {
    let mut page = open("<title>cred</title>");
    page.evaluate(
        r##"(function () {
          window.__cred = null;
          const pay = new PaymentRequest([{ supportedMethods: "basic-card" }], { total: { label: "t", amount: { currency: "USD", value: "1.00" } } });
          Promise.allSettled([
            navigator.credentials.get({ password: true }),
            navigator.credentials.create({ password: { id: "u", password: "p" } }),
            pay.show(),
            pay.canMakePayment(),
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          ]).then(function (rows) {
            window.__cred = {
              get: rows[0].status === "rejected" && rows[0].reason.name === "NotAllowedError",
              create: rows[1].status === "rejected" && rows[1].reason.name === "NotAllowedError",
              show: rows[2].status === "rejected" && rows[2].reason.name === "NotAllowedError",
              canPay: rows[3].status === "fulfilled" && rows[3].value === false,
              pk: rows[4].status === "fulfilled" && rows[4].value === false,
              inst: pay instanceof PaymentRequest && typeof PublicKeyCredential === "function"
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__cred").unwrap();
    assert_eq!(v["get"], true, "{v}");
    assert_eq!(v["create"], true, "{v}");
    assert_eq!(v["show"], true, "{v}");
    assert_eq!(v["canPay"], true, "{v}");
    assert_eq!(v["pk"], true, "{v}");
    assert_eq!(v["inst"], true, "{v}");
}

#[test]
fn navigator_battery_gamepads_and_ua_data() {
    let mut page = open("<title>nav</title>");
    page.evaluate(
        r##"(function () {
          window.__navx = null;
          Promise.all([
            navigator.getBattery(),
            navigator.userAgentData.getHighEntropyValues(["platform"]),
            navigator.gpu.requestAdapter()
          ]).then(function (rows) {
            const bat = rows[0];
            navigator.mediaSession.metadata = { title: "t" };
            navigator.mediaSession.playbackState = "playing";
            window.__navx = {
              charging: bat.charging === true && bat.level === 1,
              pads: Array.isArray(navigator.getGamepads()) && navigator.getGamepads().length === 0,
              ua: navigator.userAgentData.brands.some(function (b) { return b.brand === "Vector"; }) && rows[1].platform === "Linux",
              conn: navigator.connection.effectiveType === "4g" && navigator.connection.saveData === false,
              gpu: rows[2] === null,
              mem: navigator.deviceMemory === 8 && navigator.maxTouchPoints === 0,
              media: navigator.mediaSession.playbackState === "playing",
              vk: navigator.virtualKeyboard.overlaysContent === false
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__navx").unwrap();
    assert_eq!(v["charging"], true, "{v}");
    assert_eq!(v["pads"], true, "{v}");
    assert_eq!(v["ua"], true, "{v}");
    assert_eq!(v["conn"], true, "{v}");
    assert_eq!(v["gpu"], true, "{v}");
    assert_eq!(v["mem"], true, "{v}");
    assert_eq!(v["media"], true, "{v}");
    assert_eq!(v["vk"], true, "{v}");
}

#[test]
fn device_apis_and_screen_orientation_deny() {
    let mut page = open("<title>dev</title>");
    page.evaluate(
        r##"(function () {
          window.__devx = null;
          const ed = new EyeDropper();
          const bd = new BarcodeDetector();
          Promise.allSettled([
            navigator.bluetooth.requestDevice({ acceptAllDevices: true }),
            navigator.usb.requestDevice({ filters: [] }),
            navigator.serial.requestPort(),
            navigator.hid.requestDevice({ filters: [] }),
            screen.orientation.lock("portrait"),
            ed.open(),
            bd.detect(document.createElement("canvas")),
            IdleDetector.requestPermission(),
            new IdleDetector().start()
          ]).then(function (rows) {
            window.__devx = {
              bt: rows[0].status === "rejected" && rows[0].reason.name === "NotAllowedError",
              usb: rows[1].status === "rejected" && rows[1].reason.name === "NotAllowedError",
              serial: rows[2].status === "rejected" && rows[2].reason.name === "NotAllowedError",
              hid: rows[3].status === "rejected" && rows[3].reason.name === "NotAllowedError",
              ori: rows[4].status === "rejected" && rows[4].reason.name === "NotAllowedError" && screen.orientation.type === "landscape-primary",
              eye: rows[5].status === "rejected" && rows[5].reason.name === "AbortError",
              bar: rows[6].status === "fulfilled" && Array.isArray(rows[6].value) && rows[6].value.length === 0,
              idlePerm: rows[7].status === "fulfilled" && rows[7].value === "denied",
              idleStart: rows[8].status === "rejected" && rows[8].reason.name === "NotAllowedError"
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__devx").unwrap();
    assert_eq!(v["bt"], true, "{v}");
    assert_eq!(v["usb"], true, "{v}");
    assert_eq!(v["serial"], true, "{v}");
    assert_eq!(v["hid"], true, "{v}");
    assert_eq!(v["ori"], true, "{v}");
    assert_eq!(v["eye"], true, "{v}");
    assert_eq!(v["bar"], true, "{v}");
    assert_eq!(v["idlePerm"], true, "{v}");
    assert_eq!(v["idleStart"], true, "{v}");
}

#[test]
fn storage_access_and_picture_in_picture_deny() {
    let mut page = open("<title>pip</title>");
    page.evaluate(
        r##"(function () {
          window.__pip = null;
          const v = document.createElement("video");
          document.body.appendChild(v);
          Promise.allSettled([
            document.requestStorageAccess(),
            v.requestPictureInPicture(),
            document.exitPictureInPicture(),
            v.setSinkId("default"),
            navigator.keyboard.lock(["KeyA"])
          ]).then(function (rows) {
            window.__pip = {
              storage: rows[0].status === "rejected" && rows[0].reason.name === "NotAllowedError",
              pip: rows[1].status === "rejected" && rows[1].reason.name === "NotAllowedError",
              exit: rows[2].status === "rejected" && rows[2].reason.name === "InvalidStateError",
              sink: rows[3].status === "rejected" && rows[3].reason.name === "NotAllowedError",
              keys: rows[4].status === "rejected" && rows[4].reason.name === "NotAllowedError",
              enabled: document.pictureInPictureEnabled === false && document.pictureInPictureElement === null
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__pip").unwrap();
    assert_eq!(v["storage"], true, "{v}");
    assert_eq!(v["pip"], true, "{v}");
    assert_eq!(v["exit"], true, "{v}");
    assert_eq!(v["sink"], true, "{v}");
    assert_eq!(v["keys"], true, "{v}");
    assert_eq!(v["enabled"], true, "{v}");
}

#[test]
fn analyser_and_biquad_filter_nodes() {
    let mut page = open("<title>an</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const ctx = new AudioContext();
              const an = ctx.createAnalyser();
              const bq = ctx.createBiquadFilter();
              const bins = new Uint8Array(an.frequencyBinCount);
              an.getByteFrequencyData(bins);
              const wave = new Uint8Array(an.fftSize);
              an.getByteTimeDomainData(wave);
              return {
                inst: an instanceof AnalyserNode && bq instanceof BiquadFilterNode,
                bins: an.frequencyBinCount === 1024 && bins[0] === 0,
                wave: wave[0] === 128,
                type: bq.type === "lowpass" && bq.frequency.value === 350,
                time: typeof ctx.currentTime === "number"
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["bins"], true, "{v}");
    assert_eq!(v["wave"], true, "{v}");
    assert_eq!(v["type"], true, "{v}");
    assert_eq!(v["time"], true, "{v}");
}

#[test]
fn analyser_reads_connected_oscillator() {
    let mut page = open("<title>an2</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const an = ctx.createAnalyser();
              osc.connect(an);
              osc.start();
              const wave = new Uint8Array(an.fftSize);
              an.getByteTimeDomainData(wave);
              const bins = new Uint8Array(an.frequencyBinCount);
              an.getByteFrequencyData(bins);
              let min = 255, max = 0;
              for (let i = 0; i < wave.length; i++) {
                if (wave[i] < min) min = wave[i];
                if (wave[i] > max) max = wave[i];
              }
              return { spread: max > min, peak: bins[2] === 200, idle: bins[0] === 10 };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["spread"], true, "{v}");
    assert_eq!(v["peak"], true, "{v}");
    assert_eq!(v["idle"], true, "{v}");
}

#[test]
fn media_stream_and_web_audio_graph_nodes() {
    let mut page = open("<title>ms</title>");
    page.evaluate(
        r##"(function () {
          window.__ms = null;
          const v = document.createElement("video");
          document.body.appendChild(v);
          const stream = v.captureStream();
          const track = new MediaStreamTrack();
          stream.addTrack(track);
          const ctx = new AudioContext();
          const delay = ctx.createDelay();
          const comp = ctx.createDynamicsCompressor();
          const pan = ctx.createStereoPanner();
          const src = ctx.createMediaStreamSource(stream);
          const oc = new OffscreenCanvas(4, 4);
          oc.getContext("2d").fillStyle = "#00ff00";
          oc.getContext("2d").fillRect(0, 0, 4, 4);
          oc.convertToBlob().then(function (blob) {
            window.__ms = {
              stream: stream instanceof MediaStream && stream.getTracks().length === 1,
              track: track instanceof MediaStreamTrack && track.readyState === "ended",
              nodes: delay instanceof DelayNode && comp instanceof DynamicsCompressorNode && pan instanceof StereoPannerNode,
              src: src instanceof MediaStreamAudioSourceNode && src.mediaStream === stream,
              blob: blob instanceof Blob && blob.size > 0 && blob.type === "image/png"
            };
          }).catch(function (e) { window.__ms = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__ms").unwrap();
    assert_eq!(v["stream"], true, "{v}");
    assert_eq!(v["track"], true, "{v}");
    assert_eq!(v["nodes"], true, "{v}");
    assert_eq!(v["src"], true, "{v}");
    assert_eq!(v["blob"], true, "{v}");
}

#[test]
fn crypto_subtle_wraps_and_unwraps_aes_key() {
    let mut page = open("<title>wrap</title>");
    page.evaluate(
        r##"(function () {
          window.__wrap = null;
          const iv = new Uint8Array(12);
          const civ = new Uint8Array(12);
          const pt = new TextEncoder().encode("abc");
          crypto.subtle.generateKey({ name: "AES-GCM" }, true, ["wrapKey", "unwrapKey", "encrypt", "decrypt"]).then(function (wrapping) {
            return crypto.subtle.generateKey({ name: "AES-GCM" }, true, ["encrypt", "decrypt"]).then(function (key) {
              return crypto.subtle.wrapKey("raw", key, wrapping, { name: "AES-GCM", iv: iv }).then(function (wrapped) {
                return crypto.subtle.unwrapKey("raw", wrapped, wrapping, { name: "AES-GCM", iv: iv }, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]).then(function (unwrapped) {
                  return Promise.all([
                    crypto.subtle.encrypt({ name: "AES-GCM", iv: civ }, key, pt),
                    crypto.subtle.encrypt({ name: "AES-GCM", iv: civ }, unwrapped, pt)
                  ]).then(function (cts) {
                    const a = new Uint8Array(cts[0]);
                    const b = new Uint8Array(cts[1]);
                    let same = a.length === b.length;
                    for (let i = 0; i < a.length && same; i++) same = a[i] === b[i];
                    window.__wrap = { same: same, wrapped: wrapped.byteLength > 16 };
                  });
                });
              });
            });
          }).catch(function (e) { window.__wrap = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(80).settled);
    let v = page.evaluate("window.__wrap").unwrap();
    assert_eq!(v["same"], true, "{v}");
    assert_eq!(v["wrapped"], true, "{v}");
}

#[test]
fn media_play_fires_play_and_playing() {
    let mut page = open("<title>play</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const video = document.createElement("video");
              const ev = [];
              video.addEventListener("play", function () { ev.push("play"); });
              video.addEventListener("playing", function () { ev.push("playing"); });
              video.addEventListener("pause", function () { ev.push("pause"); });
              video.play();
              const afterPlay = { paused: video.paused, ev: ev.slice() };
              video.pause();
              return { afterPlay: afterPlay, paused: video.paused, ev: ev.slice() };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["afterPlay"]["paused"], false, "{v}");
    assert_eq!(v["afterPlay"]["ev"][0], "play", "{v}");
    assert_eq!(v["afterPlay"]["ev"][1], "playing", "{v}");
    assert_eq!(v["paused"], true, "{v}");
    assert_eq!(v["ev"][2], "pause", "{v}");
}

#[test]
fn xr_and_presentation_request_deny() {
    let mut page = open("<title>xr</title>");
    page.evaluate(
        r##"(function () {
          window.__xr = null;
          const req = new PresentationRequest("https://s.test/slides");
          Promise.allSettled([
            navigator.xr.isSessionSupported("inline"),
            navigator.xr.requestSession("immersive-vr"),
            req.start(),
            req.getAvailability()
          ]).then(function (rows) {
            window.__xr = {
              supported: rows[0].status === "fulfilled" && rows[0].value === false,
              session: rows[1].status === "rejected" && rows[1].reason.name === "NotAllowedError",
              start: rows[2].status === "rejected" && rows[2].reason.name === "NotAllowedError",
              avail: rows[3].status === "fulfilled" && rows[3].value.value === false,
              inst: req instanceof PresentationRequest
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__xr").unwrap();
    assert_eq!(v["supported"], true, "{v}");
    assert_eq!(v["session"], true, "{v}");
    assert_eq!(v["start"], true, "{v}");
    assert_eq!(v["avail"], true, "{v}");
    assert_eq!(v["inst"], true, "{v}");
}

#[test]
fn media_can_play_type_and_ready_state() {
    let mut page = open("<title>cpt</title>");
    page.evaluate(
        r##"(function () {
          window.__cpt = null;
          const video = document.createElement("video");
          const img = document.createElement("img");
          let loaded = false;
          img.addEventListener("load", function () { loaded = true; });
          const maybe = video.canPlayType("video/mp4");
          const none = video.canPlayType("text/plain");
          video.src = "https://s.test/a.mp4";
          video.play();
          const afterPlay = video.readyState;
          video.load();
          img.decode().then(function () {
            const pos = document.caretPositionFromPoint(1, 1);
            const range = document.caretRangeFromPoint(1, 1);
            window.__cpt = {
              maybe: maybe === "maybe",
              none: none === "",
              playReady: afterPlay === HTMLMediaElement.HAVE_ENOUGH_DATA,
              loadReady: video.readyState === HTMLMediaElement.HAVE_NOTHING,
              decode: loaded,
              caret: !!(range && range.collapsed && pos && pos.offsetNode)
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(50).settled);
    let v = page.evaluate("window.__cpt").unwrap();
    assert_eq!(v["maybe"], true, "{v}");
    assert_eq!(v["none"], true, "{v}");
    assert_eq!(v["playReady"], true, "{v}");
    assert_eq!(v["loadReady"], true, "{v}");
    assert_eq!(v["decode"], true, "{v}");
    assert_eq!(v["caret"], true, "{v}");
}

#[test]
fn web_audio_factory_nodes() {
    let mut page = open("<title>wan</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const ctx = new AudioContext();
              const wave = ctx.createPeriodicWave(new Float32Array([0, 0]), new Float32Array([0, 1]));
              const csrc = ctx.createConstantSource();
              const merge = ctx.createChannelMerger(2);
              const split = ctx.createChannelSplitter(2);
              const shape = ctx.createWaveShaper();
              const conv = ctx.createConvolver();
              const pan = ctx.createPanner();
              const iir = ctx.createIIRFilter([1], [1]);
              pan.setPosition(1, 2, 3);
              const mag = new Float32Array(1);
              iir.getFrequencyResponse(new Float32Array([440]), mag, new Float32Array(1));
              return {
                wave: wave instanceof PeriodicWave,
                csrc: csrc instanceof ConstantSourceNode && csrc.offset.value === 1,
                merge: merge instanceof ChannelMergerNode && merge.numberOfInputs === 2,
                split: split instanceof ChannelSplitterNode && split.numberOfOutputs === 2,
                shape: shape instanceof WaveShaperNode,
                conv: conv instanceof ConvolverNode && conv.normalize === true,
                pan: pan instanceof PannerNode && pan.positionX.value === 1,
                iir: iir instanceof IIRFilterNode && mag[0] === 1
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["wave"], true, "{v}");
    assert_eq!(v["csrc"], true, "{v}");
    assert_eq!(v["merge"], true, "{v}");
    assert_eq!(v["split"], true, "{v}");
    assert_eq!(v["shape"], true, "{v}");
    assert_eq!(v["conv"], true, "{v}");
    assert_eq!(v["pan"], true, "{v}");
    assert_eq!(v["iir"], true, "{v}");
}

#[test]
fn crypto_subtle_imports_jwk_oct_key() {
    let mut page = open("<title>jwk</title>");
    page.evaluate(
        r##"(function () {
          window.__jwk = null;
          const iv = new Uint8Array(12);
          const pt = new TextEncoder().encode("abc");
          crypto.subtle.generateKey({ name: "AES-GCM" }, true, ["encrypt", "decrypt"]).then(function (key) {
            return crypto.subtle.exportKey("jwk", key).then(function (jwk) {
              return crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]).then(function (imported) {
                return Promise.all([
                  crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, pt),
                  crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, imported, pt)
                ]).then(function (cts) {
                  const a = new Uint8Array(cts[0]);
                  const b = new Uint8Array(cts[1]);
                  let same = a.length === b.length;
                  for (let i = 0; i < a.length && same; i++) same = a[i] === b[i];
                  window.__jwk = { same: same, kty: jwk.kty === "oct" && typeof jwk.k === "string" };
                });
              });
            });
          }).catch(function (e) { window.__jwk = { err: String(e) }; });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(80).settled);
    let v = page.evaluate("window.__jwk").unwrap();
    assert_eq!(v["same"], true, "{v}");
    assert_eq!(v["kty"], true, "{v}");
}

#[test]
fn performance_navigation_timing_entry() {
    let mut page = open("<title>navt</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const nav = performance.getEntriesByType("navigation");
              const all = performance.getEntries();
              return {
                one: nav.length === 1 && nav[0].entryType === "navigation" && nav[0].type === "navigate",
                listed: all.some(function (e) { return e.entryType === "navigation"; }),
                paint: performance.getEntriesByType("paint").length >= 0
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["one"], true, "{v}");
    assert_eq!(v["listed"], true, "{v}");
}

#[test]
fn performance_resource_timing_records_fetch() {
    let mut page = open("<title>rest</title>");
    page.evaluate(
        r##"(function () {
          fetch("data:text/plain,hi").then(function (r) { return r.text(); }).then(function (t) {
            const res = performance.getEntriesByType("resource");
            const all = performance.getEntries();
            const hit = res.find(function (e) { return e.name.indexOf("data:text/plain,hi") === 0; });
            window.__res = {
              text: t,
              n: res.length,
              type: !!(hit && hit.entryType === "resource"),
              initiator: !!(hit && hit.initiatorType === "fetch"),
              size: !!(hit && hit.encodedBodySize === 2 && hit.transferSize === 2),
              listed: all.some(function (e) { return e.entryType === "resource" && e.name.indexOf("data:") === 0; }),
              lcp: performance.getEntriesByType("largest-contentful-paint").length === 1
            };
          });
        })()"##,
    )
    .unwrap();
    assert!(page.settle(80).settled);
    let v = page.evaluate("window.__res").unwrap();
    assert_eq!(v["text"], "hi", "{v}");
    assert_eq!(v["type"], true, "{v}");
    assert_eq!(v["initiator"], true, "{v}");
    assert_eq!(v["size"], true, "{v}");
    assert_eq!(v["listed"], true, "{v}");
    assert_eq!(v["lcp"], true, "{v}");
}

#[test]
fn webgl_tex_image_draw_arrays_blits() {
    let mut page = open("<title>glt</title>");
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.createElement("canvas");
              c.width = 8;
              c.height = 8;
              document.body.appendChild(c);
              const gl = c.getContext("webgl");
              const im = new ImageData(4, 4);
              for (let i = 0; i < im.data.length; i += 4) {
                im.data[i] = 0;
                im.data[i + 1] = 255;
                im.data[i + 2] = 0;
                im.data[i + 3] = 255;
              }
              const tex = gl.createTexture();
              gl.bindTexture(3553, tex);
              gl.texImage2D(3553, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
              gl.drawArrays(4, 0, 6);
              const pix = new Uint8Array(4);
              gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix);
              return { r: pix[0], g: pix[1], b: pix[2], a: pix[3] };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["r"], 0, "{v}");
    assert_eq!(v["g"], 255, "{v}");
    assert_eq!(v["b"], 0, "{v}");
    assert_eq!(v["a"], 255, "{v}");
}

#[test]
fn window_named_id_properties_are_replaceable() {
    let mut page = open(
        r#"<body><script id="__NEXT_DATA__" type="application/json">{"page":"/"}</script></body>"#,
    );
    let v = page
        .evaluate(
            r#"(function () {
              const el = document.getElementById("__NEXT_DATA__");
              const before = window.__NEXT_DATA__ === el;
              window.__NEXT_DATA__ = { props: { pageProps: {} }, page: "/" };
              return {
                before,
                assigned: window.__NEXT_DATA__ && window.__NEXT_DATA__.page === "/"
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["before"], true, "{v}");
    assert_eq!(v["assigned"], true, "{v}");
}

#[test]
fn composed_events_cross_shadow_to_the_host() {
    let mut page = open(r#"<body><host-el></host-el></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              class InnerEl extends HTMLElement {
                constructor() {
                  super();
                  this.attachShadow({ mode: "open" }).innerHTML = "<button id=b>go</button>";
                  this.shadowRoot.getElementById("b").addEventListener("click", () => {
                    this.dispatchEvent(new Event("inner-click", { bubbles: true, composed: true }));
                  });
                }
              }
              class HostEl extends HTMLElement {
                constructor() {
                  super();
                  this.attachShadow({ mode: "open" }).innerHTML = "<inner-el></inner-el>";
                  this.heard = 0;
                  this.addEventListener("inner-click", () => { this.heard++; });
                }
              }
              customElements.define("inner-el", InnerEl);
              customElements.define("host-el", HostEl);
              const host = document.querySelector("host-el");
              const inner = host.shadowRoot.querySelector("inner-el");
              inner.shadowRoot.getElementById("b").click();
              return { heard: host.heard };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["heard"], 1, "{v}");
}

#[test]
fn custom_elements_in_imported_template_upgrade_inside_shadow() {
    let mut page = open(r#"<body><todo-host></todo-host></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              const tpl = document.createElement("template");
              tpl.innerHTML = "<inner-list></inner-list>";
              class InnerList extends HTMLElement {
                constructor() {
                  super();
                  this.ready = true;
                  this.updateElements = function () { return 1; };
                }
              }
              class TodoHost extends HTMLElement {
                constructor() {
                  super();
                  const node = document.importNode(tpl.content, true);
                  this.list = node.querySelector("inner-list");
                  this.shadow = this.attachShadow({ mode: "open" });
                  this.shadow.append(node);
                }
                connectedCallback() {
                  window.__listReady = !!(this.list && this.list.ready);
                  window.__hasUpdate = typeof this.list.updateElements === "function";
                }
              }
              customElements.define("inner-list", InnerList);
              customElements.define("todo-host", TodoHost);
              const host = document.querySelector("todo-host");
              const list = host && host.shadowRoot && host.shadowRoot.querySelector("inner-list");
              return {
                listReady: !!window.__listReady,
                hasUpdate: !!window.__hasUpdate,
                same: !!(host && list && host.list === list),
                ctor: list && list.constructor && list.constructor.name
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["listReady"], true, "{v}");
    assert_eq!(v["hasUpdate"], true, "{v}");
    assert_eq!(v["same"], true, "{v}");
    assert_eq!(v["ctor"], "InnerList", "{v}");
}

#[test]
fn custom_elements_stay_inert_in_template_content() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              const tpl = document.createElement("template");
              tpl.innerHTML = "<kept-el></kept-el>";
              class KeptEl extends HTMLElement {
                constructor() { super(); window.__kept = (window.__kept || 0) + 1; }
              }
              customElements.define("kept-el", KeptEl);
              const inside = tpl.content.querySelector("kept-el");
              return {
                constructed: window.__kept || 0,
                name: inside && inside.constructor && inside.constructor.name,
                upgraded: !!(inside && inside.__upgraded)
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["constructed"], 0, "{v}");
    assert_eq!(v["name"], "HTMLElement", "{v}");
    assert_eq!(v["upgraded"], false, "{v}");
}

#[test]
fn custom_elements_upgrade_runs_connected_callback() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              window.__n = 0;
              class XFoo extends HTMLElement {
                connectedCallback() { window.__n++; this.mark = true; }
              }
              const host = document.createElement('div');
              host.innerHTML = '<x-foo></x-foo>';
              customElements.define('x-foo', XFoo);
              const before = window.__n;
              customElements.upgrade(host);
              const afterUpgrade = window.__n;
              document.body.appendChild(host);
              const el = host.querySelector('x-foo');
              return { before, afterUpgrade, after: window.__n, mark: !!(el && el.mark) };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["before"], 0, "{v}");
    assert_eq!(v["afterUpgrade"], 0, "{v}");
    assert_eq!(v["after"], 1, "{v}");
    assert_eq!(v["mark"], true, "{v}");
}

#[test]
fn fill_updates_react_style_value_tracker() {
    let mut page = open(r#"<input id="n" value="old">"#);
    page.evaluate(
        r#"(function () {
          const el = document.getElementById('n');
          const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
          window.__tracked = desc.get.call(el);
          Object.defineProperty(el, 'value', {
            configurable: true,
            enumerable: true,
            get() { return window.__tracked; },
            set(v) { window.__tracked = String(v); desc.set.call(this, v); }
          });
          el.addEventListener('beforeinput', (e) => {
            window.__bi = (e.inputType || '') + ':' + (e.data || '');
          });
          el.addEventListener('input', (e) => {
            window.__in = (e instanceof InputEvent) && e.inputType;
          });
        })()"#,
    )
    .unwrap();
    let program = Program {
        steps: vec![Step::Fill {
            base: StepBase {
                id: "f".into(),
                ..StepBase::default()
            },
            target: "css:#n".into(),
            value: "Ada".into(),
        }],
        ..Program::default()
    };
    let result = page.execute(&program);
    assert_eq!(result.status, ProgramStatus::Completed, "{result:?}");
    assert_eq!(
        page.evaluate("window.__tracked").unwrap(),
        serde_json::json!("Ada")
    );
    assert_eq!(
        page.evaluate("document.getElementById('n').value").unwrap(),
        serde_json::json!("Ada")
    );
    assert_eq!(
        page.evaluate("window.__bi").unwrap(),
        serde_json::json!("insertReplacementText:Ada")
    );
    assert_eq!(
        page.evaluate("window.__in").unwrap(),
        serde_json::json!("insertReplacementText")
    );
}

#[test]
fn html_element_click_is_untrusted_program_click_is_trusted() {
    let mut page = open(
        r#"<button id="b">Go</button>
           <script>
             window.__trust = [];
             document.getElementById('b').addEventListener('click', (e) => {
               window.__trust.push(e.isTrusted);
             });
           </script>"#,
    );
    page.evaluate("document.getElementById('b').click()")
        .unwrap();
    assert_eq!(
        page.evaluate("window.__trust").unwrap(),
        serde_json::json!([false])
    );
    let program = Program {
        steps: vec![Step::Click {
            base: StepBase {
                id: "c".into(),
                ..StepBase::default()
            },
            target: "css:#b".into(),
            button: None,
        }],
        ..Program::default()
    };
    let result = page.execute(&program);
    assert_eq!(result.status, ProgramStatus::Completed, "{result:?}");
    assert_eq!(
        page.evaluate("window.__trust").unwrap(),
        serde_json::json!([false, true])
    );
}

#[test]
fn node_list_location_hash_and_load_event_match_the_platform() {
    let mut page = open(
        r#"<body>
           <script>
             window.__loads = 0;
             window.addEventListener("load", () => { window.__loads++; });
             window.addEventListener("hashchange", () => { window.__hash = location.hash; });
             NodeList.prototype.forEach = Array.prototype.forEach;
             window.__nl = document.querySelectorAll("script") instanceof NodeList;
           </script>
           </body>"#,
    );
    assert!(page.settle(200).settled);
    assert_eq!(
        page.evaluate("window.__loads").unwrap(),
        serde_json::json!(1)
    );
    assert_eq!(
        page.evaluate("window.__nl").unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.defaultView === window").unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("document.defaultView && !!document.defaultView.history")
            .unwrap(),
        serde_json::json!(true)
    );
    let loc = page
        .evaluate(
            r#"(function () {
              location.hash = '#/home';
              return { href: location.href, hash: location.hash, fired: window.__hash };
            })()"#,
        )
        .unwrap();
    assert!(
        loc["href"].as_str().unwrap_or("").contains("#/home"),
        "{loc}"
    );
    assert_eq!(loc["hash"], "#/home", "{loc}");
    assert_eq!(loc["fired"], "#/home", "{loc}");
    let v = page
        .evaluate(
            r#"(function () {
              const input = document.createElement("input");
              document.body.appendChild(input);
              let key = "";
              input.addEventListener("keydown", (e) => { key = e.key; });
              input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true }));
              return { key: key, path: typeof new Event("x").composedPath };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["key"], "Enter", "{v}");
    assert_eq!(v["path"], "function", "{v}");
    let focusin = page
        .evaluate(
            r#"(function () {
              const input = document.createElement("input");
              document.body.appendChild(input);
              let types = [];
              document.body.addEventListener("focusin", (e) => types.push(e.type));
              input.focus();
              return { types: types.join(","), active: document.activeElement === input };
            })()"#,
        )
        .unwrap();
    assert_eq!(focusin["types"], "focusin", "{focusin}");
    assert_eq!(focusin["active"], true, "{focusin}");
    let svg = page
        .evaluate(
            r#"(function () {
              const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              return {
                ctor: typeof SVGElement,
                inst: el instanceof SVGElement,
                hash: "onhashchange" in window,
                walk: typeof document.createTreeWalker,
                which: new KeyboardEvent("keyup", { key: "Enter", keyCode: 13, which: 13 }).which
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(svg["ctor"], "function", "{svg}");
    assert_eq!(svg["inst"], true, "{svg}");
    assert_eq!(svg["hash"], true, "{svg}");
    assert_eq!(svg["walk"], "function", "{svg}");
    assert_eq!(svg["which"], 13, "{svg}");
    let iframe = page
        .evaluate(
            r#"(function () {
              const f = document.createElement("iframe");
              f.src = "javascript:0";
              document.body.appendChild(f);
              const doc = f.contentWindow && f.contentWindow.document;
              if (!doc) return { open: "no-doc" };
              doc.open();
              doc.write("<p>x</p>");
              doc.close();
              return { open: "ok" };
            })()"#,
        )
        .unwrap();
    assert_eq!(iframe["open"], "ok", "{iframe}");
    let template = page
        .evaluate(
            r#"(function () {
              const t = document.createElement("template");
              t.innerHTML = "<!--?--><div class='todo'></div>";
              const w = document.createTreeWalker(document, 129);
              w.currentNode = t.content;
              const a = w.nextNode();
              const b = w.nextNode();
              return {
                frag: t.content && t.content.nodeType,
                kids: t.content.childNodes.length,
                a: a && a.nodeType,
                b: b && b.tagName,
                which: new KeyboardEvent("keyup", { key: "Enter", keyCode: 13, which: 13 }).which
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(template["frag"], 11, "{template}");
    assert!(template["kids"].as_i64().unwrap_or(0) >= 1, "{template}");
    assert_eq!(template["a"], 8, "{template}");
    assert_eq!(template["b"], "DIV", "{template}");
    let lit_marker = page
        .evaluate(
            r#"(function () {
              const t = document.createElement("template");
              t.innerHTML = "<?lit$1$><ul class='todo-list'></ul>";
              const w = document.createTreeWalker(t.content, 129);
              const a = w.nextNode();
              const b = w.nextNode();
              return {
                a: a && a.nodeType,
                data: a && a.nodeValue,
                b: b && b.tagName,
                kids: t.content.childNodes.length
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(lit_marker["a"], 8, "{lit_marker}");
    assert_eq!(lit_marker["data"], "?lit$1$", "{lit_marker}");
    assert_eq!(lit_marker["b"], "UL", "{lit_marker}");
    let script_html = page
        .evaluate(
            r#"(function () {
              const s = document.createElement("script");
              s.type = "text/x-handlebars-template";
              s.textContent = "<li>{{title}}</li>";
              document.body.appendChild(s);
              return {
                html: s.innerHTML,
                onkey: "onkeydown" in document.createElement("input"),
                rand: typeof crypto.getRandomValues
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(script_html["html"], "<li>{{title}}</li>", "{script_html}");
    assert_eq!(script_html["onkey"], true, "{script_html}");
    assert_eq!(script_html["rand"], "function", "{script_html}");
    assert_eq!(
        page.evaluate("typeof document.createElement('div').scrollTo")
            .unwrap(),
        serde_json::json!("function")
    );
    let lit = page
        .evaluate(
            r#"(function () {
              const t = document.createElement("template");
              t.innerHTML = '<section class="x"><todo-form></todo-form></section>';
              const names = t.content.firstChild && t.content.firstChild.getAttributeNames();
              const w = document.createTreeWalker(document, 129);
              w.currentNode = t.content;
              const tags = [];
              let n;
              while ((n = w.nextNode())) if (n.tagName) tags.push(n.tagName);
              return { names: names && names.join(","), tags: tags.join(",") };
            })()"#,
        )
        .unwrap();
    assert_eq!(lit["names"], "class", "{lit}");
    assert!(
        lit["tags"].as_str().unwrap_or("").contains("SECTION"),
        "{lit}"
    );
    assert!(
        lit["tags"].as_str().unwrap_or("").contains("TODO-FORM"),
        "{lit}"
    );
    let handle = page
        .evaluate(
            r#"(function () {
              const el = document.createElement("input");
              document.body.appendChild(el);
              let n = 0;
              el.addEventListener("keydown", { handleEvent() { n++; } });
              el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
              return n;
            })()"#,
        )
        .unwrap();
    assert_eq!(handle, 1, "{handle}");
    let invalid = page
        .evaluate(
            r#"(function () {
              try { document.querySelector("*,:x"); return "no-throw"; }
              catch (e) { return "throw"; }
            })()"#,
        )
        .unwrap();
    assert_eq!(invalid, "throw", "{invalid}");
}

#[test]
fn es5_todomvc_delegate_remove_after_domparser_replace() {
    let mut page = open(r#"<ul class="todo-list"></ul>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function qsa(sel, scope) { return (scope || document).querySelectorAll(sel); }
              function delegate(target, selector, type, handler) {
                target.addEventListener(type, function (event) {
                  var potential = qsa(selector, target);
                  if (Array.prototype.indexOf.call(potential, event.target) >= 0)
                    handler.call(event.target, event);
                });
              }
              var ul = document.querySelector(".todo-list");
              delegate(ul, ".destroy", "click", function () {
                var li = this.parentNode.parentNode;
                li.parentNode.removeChild(li);
              });
              var html = "<li data-id=1><div class=view><button class=destroy></button></div></li>";
              var parsed = new DOMParser().parseFromString(html, "text/html");
              ul.replaceChildren.apply(ul, Array.prototype.slice.call(parsed.body.childNodes));
              var before = qsa(".todo-list li").length;
              var li = qsa(".todo-list li")[0];
              var ds = li.dataset.id;
              var btn = qsa(".destroy")[0];
              var idx = Array.prototype.indexOf.call(qsa(".destroy", ul), btn);
              btn.click();
              return { before: before, after: qsa(".todo-list li").length, idx: idx, ds: ds };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"], 1, "{v}");
    assert_eq!(v["idx"], 0, "{v}");
    assert_eq!(v["ds"], "1", "{v}");
    assert_eq!(v["after"], 0, "{v}");
}

#[test]
fn live_childnodes_grows_after_append_on_held_list() {
    let mut page = open(r#"<ul id="list"></ul>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var ul = document.getElementById("list");
              var held = ul.childNodes;
              var before = held.length;
              ul.appendChild(document.createElement("li"));
              var mid = held.length;
              var parsed = new DOMParser().parseFromString(
                "<li id=a>one</li><li>two</li>",
                "text/html"
              );
              ul.replaceChildren.apply(ul, Array.prototype.slice.call(parsed.body.childNodes));
              return {
                before: before,
                mid: mid,
                after: held.length,
                named: typeof window.a !== "undefined" && window.a && window.a.id === "a",
                text: ul.textContent
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["before"], 0, "{v}");
    assert_eq!(v["mid"], 1, "{v}");
    assert_eq!(v["after"], 2, "{v}");
    assert_eq!(v["named"], true, "{v}");
    assert_eq!(v["text"], "onetwo", "{v}");
}

#[test]
fn es5_todomvc_domparser_replace_grows_to_one_hundred() {
    let mut page = open(r#"<ul class="todo-list"></ul>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var ul = document.querySelector(".todo-list");
              function item(i) {
                return "<li data-id=\"" + i + "\"><div class=\"view\"><input class=\"toggle\" type=\"checkbox\"><label>Item " + i + "</label><button class=\"destroy\"></button></div></li>";
              }
              for (var n = 1; n <= 100; n++) {
                var html = "";
                for (var i = 1; i <= n; i++) html += item(i);
                var parsed = new DOMParser().parseFromString(html, "text/html");
                ul.replaceChildren.apply(ul, Array.prototype.slice.call(parsed.body.childNodes));
              }
              return {
                count: ul.childNodes.length,
                last: ul.lastChild && ul.lastChild.getAttribute("data-id"),
                labels: ul.querySelectorAll("label").length
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["count"], 100, "{v}");
    assert_eq!(v["last"], "100", "{v}");
    assert_eq!(v["labels"], 100, "{v}");
}

#[test]
fn element_collections_are_descendants_only_so_html_keeps_delegated_listeners() {
    let mut page = open(r#"<ul id="todo-list"></ul><input type="checkbox" class="toggle">"#);
    let v = page
        .evaluate(
            r##"(function () {
              var ul = document.getElementById("todo-list");
              var emptyStar = ul.getElementsByTagName("*").length;
              var hits = 0;
              ul.addEventListener("click", function (e) {
                if (e.target && e.target.className === "destroy") hits++;
              });
              ul.innerHTML = "<li data-id=1><div class=view><button class=destroy></button></div></li>";
              var afterStar = ul.getElementsByTagName("*");
              var includesSelf = false;
              for (var i = 0; i < afterStar.length; i++) if (afterStar[i] === ul) includesSelf = true;
              document.querySelector(".destroy").click();
              var box = document.querySelector(".toggle");
              var changes = 0;
              box.addEventListener("change", function () { changes++; });
              box.click();
              return {
                emptyStar: emptyStar,
                includesSelf: includesSelf,
                hits: hits,
                changes: changes,
                checked: box.checked
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["emptyStar"], 0, "{v}");
    assert_eq!(v["includesSelf"], false, "{v}");
    assert_eq!(v["hits"], 1, "{v}");
    assert_eq!(v["changes"], 1, "{v}");
    assert_eq!(v["checked"], true, "{v}");
}

#[test]
fn delegated_click_survives_inner_html_replace_inside_handler() {
    let mut page = open(r#"<ul id="todo-list"></ul>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var ul = document.getElementById("todo-list");
              var hits = 0;
              ul.addEventListener("click", function (e) {
                if (!e.target || e.target.className !== "destroy") return;
                hits++;
                var n = ul.querySelectorAll("li").length;
                var html = "";
                for (var i = 0; i < n - 1; i++) html += "<li><button class=destroy></button></li>";
                ul.innerHTML = html;
              });
              ul.innerHTML = "<li><button class=destroy></button></li><li><button class=destroy></button></li><li><button class=destroy></button></li>";
              var guard = 0;
              while (ul.querySelector(".destroy") && guard++ < 10) ul.querySelector(".destroy").click();
              return { hits: hits, left: ul.querySelectorAll("li").length };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["hits"], 3, "{v}");
    assert_eq!(v["left"], 0, "{v}");
}

#[test]
fn comment_and_text_implement_child_node_remove() {
    let mut page = open(r#"<ul id="list"></ul>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var ul = document.getElementById("list");
              var start = document.createComment("start");
              var item = document.createElement("li");
              var end = document.createComment("end");
              var tail = document.createComment("tail");
              ul.append(start, item, end, tail);
              var kinds = [];
              for (var n = ul.firstChild; n; n = n.nextSibling) kinds.push(n.nodeType);
              var e = start;
              var stop = tail;
              while (e && e !== stop) {
                var next = e.nextSibling;
                e.remove();
                e = next;
              }
              return {
                commentRemove: typeof start.remove,
                textRemove: typeof document.createTextNode("x").remove,
                before: kinds.join(","),
                after: ul.childNodes.length,
                leftType: ul.firstChild && ul.firstChild.nodeType,
                leftData: ul.firstChild && ul.firstChild.data
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["commentRemove"], "function", "{v}");
    assert_eq!(v["textRemove"], "function", "{v}");
    assert_eq!(v["before"], "8,1,8,8", "{v}");
    assert_eq!(v["after"], 1, "{v}");
    assert_eq!(v["leftType"], 8, "{v}");
    assert_eq!(v["leftData"], "tail", "{v}");
}

#[test]
fn live_element_satisfies_idl_brand_checks() {
    let mut page = open(r#"<p id="p">x</p>"#);
    let v = page
        .evaluate(
            r#"(function(){
              var el = document.getElementById("p");
              var proto = Object.getPrototypeOf(el);
              return {
                inst: el instanceof Element,
                protoName: proto && proto.constructor && proto.constructor.name,
                isP: proto === HTMLParagraphElement.prototype,
                isHTML: proto === HTMLElement.prototype,
                isEl: proto === Element.prototype,
                tag: el.tagName,
                id: el.getAttribute("id"),
                hasTag: "tagName" in el
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["inst"], true, "{v}");
    assert_eq!(v["isP"], true, "{v}");
    assert_eq!(v["tag"], "P", "{v}");
    assert_eq!(v["id"], "p", "{v}");
    assert_eq!(v["hasTag"], true, "{v}");
}

#[test]
fn generated_idl_includes_aria_clients_and_skip_waiting() {
    use ve_script::generated::INTERFACE_NAMES;
    assert!(
        INTERFACE_NAMES.contains(&"ARIAMixin"),
        "{INTERFACE_NAMES:?}"
    );
    assert!(INTERFACE_NAMES.contains(&"Clients"), "{INTERFACE_NAMES:?}");
    assert!(INTERFACE_NAMES.contains(&"Client"), "{INTERFACE_NAMES:?}");
    assert!(
        INTERFACE_NAMES.contains(&"ServiceWorkerGlobalScope"),
        "{INTERFACE_NAMES:?}"
    );
    assert!(
        INTERFACE_NAMES.contains(&"HTMLElement"),
        "{INTERFACE_NAMES:?}"
    );
}

#[test]
fn document_named_properties_are_live() {
    let mut page = open(
        r#"<img id="a" name="b"><form name="pair"></form><form name="pair"></form><embed name="only">"#,
    );
    let v = page
        .evaluate(
            r#"(function () {
              var img = document.getElementsByTagName("img")[0];
              var forms = document.getElementsByTagName("form");
              var embed = document.getElementsByTagName("embed")[0];
              var single = document.only === embed && document["b"] === img && document.a === img;
              var col = document.pair;
              var multi = col && col.length === 2 && col[0] === forms[0] && col[1] === forms[1]
                && col.toString() === "[object HTMLCollection]";
              embed.remove();
              var liveRemove = document.only === undefined && !("only" in document);
              var extra = document.createElement("embed");
              extra.setAttribute("name", "only");
              document.body.appendChild(extra);
              var liveAdd = document.only === extra;
              return { single: single, multi: multi, liveRemove: liveRemove, liveAdd: liveAdd };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["single"], true, "{v}");
    assert_eq!(v["multi"], true, "{v}");
    assert_eq!(v["liveRemove"], true, "{v}");
    assert_eq!(v["liveAdd"], true, "{v}");
}

#[test]
fn tabindex_minus_zero_is_positive_zero() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var d = document.createElement("div");
              d.setAttribute("tabindex", "-0");
              return { v: d.tabIndex, neg: Object.is(d.tabIndex, -0) };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["v"], 0, "{v}");
    assert_eq!(v["neg"], false, "{v}");
}

#[test]
fn inner_text_collapses_cr_to_space() {
    let mut page = open(r#"<body><div id="d"></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var d = document.getElementById("d");
              d.style.whiteSpace = "normal";
              d.innerHTML = "abc\rdef";
              return d.innerText;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!("abc def"), "{v}");
}

#[test]
fn inner_text_skips_hidden_and_outer_text_replaces_node() {
    let mut page = open(
        r#"<div id="t">vis<span style="display:none">hid</span><br>next<div>block</div></div><p id="p">keep <span id="s">me</span> please</p>"#,
    );
    let v = page
        .evaluate(
            r#"(function () {
              var t = document.getElementById("t");
              var rendered = t.innerText;
              var hidden = t.querySelector("span").textContent;
              var detached = document.createElement("div");
              detached.innerHTML = "a<script>no</script>b";
              var fallback = detached.innerText;
              var tc = detached.textContent;
              t.innerText = "x\ny";
              var setHtml = t.innerHTML;
              var s = document.getElementById("s");
              var parent = s.parentNode;
              s.outerText = "replaced";
              var after = parent.innerHTML;
              var threw = false;
              try { document.createElement("span").outerText = "z"; } catch (e) {
                threw = e.name === "NoModificationAllowedError";
              }
              return {
                rendered: rendered,
                hidden: hidden,
                fallback: fallback,
                tc: tc,
                setHtml: setHtml,
                after: after,
                threw: threw,
                outerEq: t.outerText === t.innerText
              };
            })()"#,
        )
        .unwrap();
    let rendered = v["rendered"].as_str().unwrap_or("");
    assert!(rendered.contains("vis"), "{v}");
    assert!(!rendered.contains("hid"), "{v}");
    assert!(rendered.contains("next"), "{v}");
    assert!(rendered.contains("block"), "{v}");
    assert_eq!(v["hidden"], "hid", "{v}");
    assert_eq!(v["fallback"], v["tc"], "{v}");
    assert_eq!(v["setHtml"], "x<br>y", "{v}");
    let mut ta = open(r#"<textarea id="ta"></textarea>"#);
    let ta_html = ta
        .evaluate(
            r#"(function () {
              var e = document.getElementById("ta");
              e.innerText = "abc\ndef";
              return e.innerHTML;
            })()"#,
        )
        .unwrap();
    assert_eq!(ta_html, "abc<br>def", "{ta_html}");
    let ta_empty = ta
        .evaluate(r#"document.getElementById("ta").innerText = "abc"; document.getElementById("ta").innerText"#)
        .unwrap();
    assert_eq!(ta_empty, "", "{ta_empty}");
    assert!(
        v["after"].as_str().unwrap_or("").contains("replaced"),
        "{v}"
    );
    assert_eq!(v["threw"], true, "{v}");
    let mut pre = open(
        r#"<div id="a" style="white-space: pre-line">one&#10;two&#10;three&#10;four</div>
           <div id="b" style="white-space: pre">one&#10;two&#10;three&#10;four</div>
           <div id="c" style="white-space: pre-line">
 one
  two
    <!-- comment -->
   three
    four
</div>
<div id="d" style="white-space: pre">
 one
  two
    <!-- comment -->
   three
    four
</div>"#,
    );
    let pre_v = pre
        .evaluate(
            r#"(function () {
              var a = document.getElementById("a");
              var b = document.getElementById("b");
              function collapseWhitespace(s) {
                return s.replace(/  +/g, ' ').replace(/ $/mg, '').replace(/^ /mg, '');
              }
              var c = document.getElementById("c");
              var d = document.getElementById("d");
              return {
                a: a.innerText,
                b: b.innerText,
                c: c.innerText,
                d: d.innerText,
                collapsed: collapseWhitespace(d.innerText),
                aw: getComputedStyle(a).getPropertyValue("white-space"),
                bw: getComputedStyle(b).getPropertyValue("white-space"),
                atc: JSON.stringify(a.textContent),
                btc: JSON.stringify(b.textContent),
                ctc: JSON.stringify(c.textContent),
                dtc: JSON.stringify(d.textContent)
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(pre_v["a"], pre_v["b"], "{pre_v}");
    assert_eq!(pre_v["c"], pre_v["collapsed"], "{pre_v}");
    let mut sel = open(
        r#"<div id="c"><select><option>one</option><div><optgroup label=optgroup><div><option><span>two"#,
    );
    let sel_v = sel
        .evaluate(
            r#"(function () {
              var e = document.getElementById("c").firstChild;
              return { t: e.tagName, html: e.innerHTML, text: e.innerText, tc: e.textContent };
            })()"#,
        )
        .unwrap();
    assert_eq!(sel_v["text"], "one\ntwo", "{sel_v}");
    let mut sh = open(
        r#"<div id="h"><template shadowrootmode="open"><span id="s">Label for input4</span></template></div>"#,
    );
    let sh_v = sh
        .evaluate(
            r#"(function () {
              var h = document.getElementById("h");
              var sr = h.shadowRoot;
              return {
                has: !!sr,
                text: sr && sr.firstElementChild && sr.firstElementChild.textContent
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(sh_v["has"], true, "{sh_v}");
    assert_eq!(sh_v["text"], "Label for input4", "{sh_v}");
}

#[test]
fn aria_string_and_element_reflection() {
    let mut page = open(
        r#"<div id="host" role="button" aria-label="x" aria-labelledby="a missing"><span id="a">A</span></div>"#,
    );
    let v = page
        .evaluate(
            r#"(function () {
              var host = document.getElementById("host");
              var a = document.getElementById("a");
              var role = host.role;
              host.role = "checkbox";
              var roleSet = host.getAttribute("role");
              host.role = null;
              var roleNull = host.role === null && !host.hasAttribute("role");
              var label = host.ariaLabel;
              var labelled = host.ariaLabelledByElements;
              var fromAttr = labelled && labelled.length === 1 && labelled[0] === a;
              var ghost = document.createElement("span");
              ghost.id = "ghost";
              host.ariaLabelledByElements = [ghost];
              var disconnected = host.ariaLabelledByElements.length === 0
                || host.ariaLabelledByElements[0] === ghost;
              host.setAttribute("aria-labelledby", "missing");
              var missing = host.ariaLabelledByElements;
              var missingEmpty = !missing || missing.length === 0;
              host.ariaLabelledByElements = [a];
              var cached = host.ariaLabelledByElements === host.ariaLabelledByElements;
              var typeErr = false;
              try { host.ariaActiveDescendantElement = "nope"; } catch (e) { typeErr = e instanceof TypeError; }
              var noSingular = !("ariaErrorMessageElement" in host);
              host.ariaErrorMessageElements = [a];
              var errMsg = host.ariaErrorMessageElements && host.ariaErrorMessageElements[0] === a
                && host.getAttribute("aria-errormessage") === "";
              return {
                role: role,
                roleSet: roleSet,
                roleNull: roleNull,
                label: label,
                fromAttr: fromAttr,
                disconnectedOk: disconnected,
                missingEmpty: missingEmpty,
                cached: cached,
                typeErr: typeErr,
                noSingular: noSingular,
                errMsg: errMsg
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["role"], "button", "{v}");
    assert_eq!(v["roleSet"], "checkbox", "{v}");
    assert_eq!(v["roleNull"], true, "{v}");
    assert_eq!(v["label"], "x", "{v}");
    assert_eq!(v["fromAttr"], true, "{v}");
    assert_eq!(v["missingEmpty"], true, "{v}");
    assert_eq!(v["cached"], true, "{v}");
    assert_eq!(v["typeErr"], true, "{v}");
    assert_eq!(v["noSingular"], true, "{v}");
    assert_eq!(v["errMsg"], true, "{v}");
}

#[test]
fn expect_link_unblocks_raf_before_later_ids() {
    let mut page = open(
        r##"<link id="link" rel="expect" href="#last" blocking="render">
           <script>
             window.__tag = link && link.localName;
             link.remove();
             window.__gone = document.getElementById("link") === null;
             requestAnimationFrame(function () {
               window.__unblocked = document.getElementById("last") === null;
               window.__lastAtRaf = document.getElementById("last") && document.getElementById("last").id;
             });
           </script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>"##,
    );
    assert!(page.settle(500).settled);
    let v = page.evaluate(
        r#"(function () { return { unblocked: window.__unblocked, gone: window.__gone, tag: window.__tag, lastAtRaf: window.__lastAtRaf }; })()"#,
    )
    .unwrap();
    assert_eq!(v["unblocked"], true, "{v}");
}

#[test]
fn official_001_shape_raf_sees_last() {
    let mut page = open(
        r##"<!DOCTYPE html>
<meta name="timeout" content="long">
<head>
<script></script>
<script></script>
<script>function generateParserDelay() {}</script>
<title>t</title>
<link rel=expect href="#last" blocking="render">
<script>
requestAnimationFrame(function () {
  window.__last = document.getElementById("last") !== null;
});
</script>
</head>
<body>
  <div id="first">x</div>
  <script>generateParserDelay();</script>
  <div id="second">x</div>
  <script>generateParserDelay();</script>
  <div id="last">x</div>
</body>"##,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__last").unwrap(),
        serde_json::json!(true)
    );
}

#[test]
fn expect_link_blocks_raf_with_prepended_harness_script() {
    let mut page = open(
        r##"<!DOCTYPE html><script>window.__harness=1;</script>
           <meta name="timeout" content="long">
           <head>
           <link rel="expect" href="#last" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__last = document.getElementById("last") !== null;
               var link = document.querySelector("link[rel=expect]");
               window.__linkParent = link && link.parentNode && link.parentNode.localName;
             });
           </script>
           </head>
           <body>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(r#"(function(){return {last: window.__last, parent: window.__linkParent};})()"#)
        .unwrap();
    assert_eq!(v["last"], true, "{v}");
}

#[test]
fn expect_link_blocks_raf_until_target_id_with_head_scripts() {
    let mut page = open(
        r##"<!DOCTYPE html><head>
           <script>window.__n = 1;</script>
           <link rel="expect" href="#last" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__last = document.getElementById("last") !== null;
             });
           </script>
           </head><body>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__last").unwrap(),
        serde_json::json!(true),
        "rAF should run after #last is parsed"
    );
}

#[test]
fn expect_link_blocks_raf_until_target_id() {
    let mut page = open(
        r##"<link id="link" rel="expect" href="#last" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__blocked = document.getElementById("last") !== null;
             });
           </script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>"##,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__blocked").unwrap(),
        serde_json::json!(true)
    );
}

fn expect_unblocked_after(html: &str) {
    let mut page = open(html);
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(r#"(function () { return window.__unblocked; })()"#)
        .unwrap();
    assert_eq!(v, serde_json::json!(true), "{html}");
}

#[test]
fn expect_link_unblocks_when_blocking_cleared() {
    expect_unblocked_after(
        r##"<link id="link" rel="expect" href="#last" blocking="render">
           <script>
             link.blocking = "";
             requestAnimationFrame(function () {
               window.__unblocked = document.getElementById("last") === null;
             });
           </script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>"##,
    );
}

#[test]
fn expect_link_unblocks_when_rel_not_expect() {
    expect_unblocked_after(
        r##"<link id="link" rel="expect" href="#last" blocking="render">
           <script>
             link.rel = "stylesheet";
             requestAnimationFrame(function () {
               window.__unblocked = document.getElementById("last") === null;
             });
           </script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>"##,
    );
}

#[test]
fn expect_link_unblocks_when_media_nonmatching() {
    expect_unblocked_after(
        r##"<link id="link" rel="expect" href="#last" blocking="render" media="(min-width: 10px)">
           <script>
             link.media = "(max-width: 10px)";
             requestAnimationFrame(function () {
               window.__unblocked = document.getElementById("last") === null;
             });
           </script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>"##,
    );
}

#[test]
fn expect_link_unblocks_when_href_cleared() {
    expect_unblocked_after(
        r##"<link id="link" rel="expect" href="#last" blocking="render">
           <script>
             link.href = "";
             requestAnimationFrame(function () {
               window.__unblocked = document.getElementById("last") === null;
             });
           </script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>"##,
    );
}

#[test]
fn canvas_webgl_and_webgpu_are_null() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var c = document.createElement("canvas");
              return {
                webgl: c.getContext("webgl") === null,
                webgpu: c.getContext("webgpu") === null,
                two: c.getContext("2d") !== null
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["webgl"], true, "{v}");
    assert_eq!(v["webgpu"], true, "{v}");
    assert_eq!(v["two"], true, "{v}");
}

#[test]
fn historical_unknown_elements_and_applets() {
    let mut page = open(r#"<applet name="war" align="left"></applet><layer></layer>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var ap = document.getElementsByTagName("applet")[0];
              return {
                unknown: ap instanceof HTMLUnknownElement,
                layer: document.getElementsByTagName("layer")[0] instanceof HTMLUnknownElement,
                applets: document.applets.length,
                noCtor: self.HTMLAppletElement === undefined,
                noNamed: document.war === undefined && self.war === undefined,
                noAll: document.all.war === undefined,
                cssFloat: window.getComputedStyle(ap).cssFloat,
                noInit: !("initHashChangeEvent" in HashChangeEvent.prototype),
                noTd: !("HTMLTableDataCellElement" in window)
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["unknown"], true, "{v}");
    assert_eq!(v["layer"], true, "{v}");
    assert_eq!(v["applets"], 0, "{v}");
    assert_eq!(v["noCtor"], true, "{v}");
    assert_eq!(v["noNamed"], true, "{v}");
    assert_eq!(v["noAll"], true, "{v}");
    assert_eq!(v["cssFloat"], "none", "{v}");
    assert_eq!(v["noInit"], true, "{v}");
    assert_eq!(v["noTd"], true, "{v}");
}

#[test]
fn cookie_null_averse_and_expires() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              document.cookie = "a=b";
              var simple = document.cookie;
              document.cookie = "b=A\0Z";
              var afterNull = document.cookie;
              document.cookie = "a=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              var afterExp = document.cookie;
              var doc = document.implementation.createHTMLDocument("doc");
              doc.cookie = "test=foobar";
              return { simple: simple, afterNull: afterNull, afterExp: afterExp, averse: doc.cookie };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["simple"], "a=b", "{v}");
    assert_eq!(v["afterNull"], "a=b", "{v}");
    assert_eq!(v["afterExp"], "", "{v}");
    assert_eq!(v["averse"], "", "{v}");
}

#[test]
fn blocking_is_a_dom_token_list() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var link = document.createElement("link");
              var script = document.createElement("script");
              var style = document.createElement("style");
              link.blocking = "asdf";
              return {
                linkSup: link.blocking.supports("render"),
                linkNo: !link.blocking.supports("asdf"),
                linkVal: link.blocking.value,
                scriptSup: script.blocking.supports("render"),
                styleSup: style.blocking.supports("render"),
                same: link.blocking === link.blocking
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["linkSup"], true, "{v}");
    assert_eq!(v["linkNo"], true, "{v}");
    assert_eq!(v["linkVal"], "asdf", "{v}");
    assert_eq!(v["scriptSup"], true, "{v}");
    assert_eq!(v["styleSup"], true, "{v}");
    assert_eq!(v["same"], true, "{v}");
}

#[test]
fn last_modified_is_mm_dd_yyyy() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(r#"/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(document.lastModified)"#)
        .unwrap();
    assert_eq!(v, serde_json::json!(true), "{v}");
}

#[test]
fn last_modified_uses_http_date() {
    let mut page = open(r#"<body></body>"#);
    page.set_last_modified("Thu, 01 Jan 1970 01:23:45 GMT");
    let v = page
        .evaluate(
            r#"(function () {
              var date = new Date("Thu, 01 Jan 1970 01:23:45 GMT");
              var p = function (n) { return ("0" + n).slice(-2); };
              var result = p(date.getMonth() + 1) + "/" + p(date.getDate()) + "/" + date.getFullYear()
                + " " + [date.getHours(), date.getMinutes(), date.getSeconds()].map(p).join(":");
              return document.lastModified === result;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!(true), "{v}");
}

#[test]
fn last_modified_after_virtual_timeout_is_still_current() {
    let mut page = open(
        r#"<body><script>
          window.__first = document.lastModified;
          setTimeout(function () { window.__later = document.lastModified; }, 4000);
        </script></body>"#,
    );
    page.settle(50);
    page.pump_virtual_time(5000);
    let v = page
        .evaluate(
            r#"(function () {
              var re = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;
              return { first: re.test(window.__first), later: re.test(window.__later) };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["first"], true, "{v}");
    assert_eq!(v["later"], true, "{v}");
}

#[test]
fn document_dispatch_event_reaches_listeners() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var n = 0;
              document.addEventListener("foo", function () { n++; });
              document.dispatchEvent(new Event("foo"));
              document.onbar = function () { n += 10; };
              document.dispatchEvent(new Event("bar"));
              return n;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!(11), "{v}");
}

#[test]
fn document_ready_state_loading_interactive_complete() {
    let mut page = open(
        r#"<body><script>
          window.__states = [document.readyState];
          document.onreadystatechange = function () {
            window.__states.push(document.readyState);
          };
          document.addEventListener("DOMContentLoaded", function () {
            window.__dcl = document.readyState;
          });
          window.addEventListener("load", function () {
            window.__load = document.readyState;
          });
        </script></body>"#,
    );
    page.settle(500);
    let v = page
        .evaluate(
            r#"(function () {
              return {
                states: window.__states,
                dcl: window.__dcl,
                load: window.__load,
                now: document.readyState,
                created: document.implementation.createHTMLDocument().readyState
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(
        v["states"],
        serde_json::json!(["loading", "interactive", "complete"]),
        "{v}"
    );
    assert_eq!(v["dcl"], "interactive", "{v}");
    assert_eq!(v["load"], "complete", "{v}");
    assert_eq!(v["now"], "complete", "{v}");
    assert_eq!(v["created"], "complete", "{v}");
}

#[test]
fn title_empty_string_creates_title_without_text_node() {
    let mut page = open(r#"<!doctype html><title>x</title><body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var head = document.documentElement.firstChild;
              head.removeChild(head.firstChild);
              document.title = "";
              return {
                title: document.title,
                isTitle: head.lastChild instanceof HTMLTitleElement,
                child: head.lastChild.firstChild
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["title"], "", "{v}");
    assert_eq!(v["isTitle"], true, "{v}");
    assert_eq!(v["child"], serde_json::Value::Null, "{v}");
}

#[test]
fn lang_from_http_content_language() {
    let mut page = open(
        r#"<head><style>
          #box:lang(ko) { width: 100px; }
          .test div { width: 50px; }
        </style></head><body>
          <div class="test"><div id="box">&nbsp;</div></div>
        </body>"#,
    );
    page.set_content_language("ko");
    assert!(page.settle(500).settled);
    let v = page
        .evaluate("document.getElementById('box').offsetWidth")
        .unwrap();
    assert_eq!(v, serde_json::json!(100), "{v}");
}

#[test]
fn usvstring_replaces_unpaired_surrogates() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              location.hash = "\uD999";
              var w = window.open("about:blank#\uD800");
              var a = document.createElement("a");
              a.ping = "\uD989";
              var src = new EventSource("\uD899");
              var ev = new StorageEvent("storage", { url: location.href + "\uD999" });
              return {
                hash: location.hash,
                href: w.location.href,
                openHash: w.location.hash,
                ping: a.ping,
                es: src.url.endsWith("%EF%BF%BD"),
                docUrl: w.document.URL,
                storage: ev.url.endsWith("\uFFFD")
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["hash"], "#%EF%BF%BD", "{v}");
    assert_eq!(v["href"], "about:blank#%EF%BF%BD", "{v}");
    assert_eq!(v["openHash"], "#%EF%BF%BD", "{v}");
    assert_eq!(v["ping"], "\u{FFFD}", "{v}");
    assert_eq!(v["es"], true, "{v}");
    assert_eq!(v["docUrl"], "about:blank#%EF%BF%BD", "{v}");
    assert_eq!(v["storage"], true, "{v}");
}

#[test]
fn access_key_label_valid_and_invalid() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var ok = document.createElement("button");
              ok.setAttribute("accesskey", "b");
              var bad = document.createElement("button");
              bad.setAttribute("accesskey", "s 0");
              return { ok: ok.accessKeyLabel, bad: bad.accessKeyLabel };
            })()"#,
        )
        .unwrap();
    assert_ne!(v["ok"], "", "{v}");
    assert_eq!(v["bad"], "", "{v}");
}

#[test]
fn click_in_progress_flag_blocks_recursion() {
    let mut page = open(r#"<body><div id="d"></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var div = document.getElementById("d");
              var events = [];
              var depth = 0;
              div.addEventListener("click", function (e) {
                events.push("click");
                if (depth++ === 0) e.target.click();
              });
              div.click();
              return events;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!(["click"]), "{v}");
}

#[test]
fn title_idl_undefined_sets_attribute_string() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var d = document.createElement("div");
              d.title = undefined;
              var u = d.getAttribute("title");
              d.title = null;
              return { undef: u, n: d.getAttribute("title") };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["undef"], "undefined", "{v}");
    assert_eq!(v["n"], "null", "{v}");
}

#[test]
fn aria_element_reflection_survives_disconnect() {
    let mut page = open(
        r#"<div id="single_element">
             <input aria-activedescendant="foo">
             <p id="foo"></p>
           </div>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              var container = document.getElementById("single_element");
              var el = container.querySelector("input");
              var target = container.querySelector("#foo");
              var before = el.ariaActiveDescendantElement === target;
              container.remove();
              var after = el.ariaActiveDescendantElement === target;
              return { before: before, after: after };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"], true, "{v}");
    assert_eq!(v["after"], true, "{v}");
}

#[test]
fn title_reflection_ignores_overridden_get_set_attribute() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var div = document.createElement("div");
              var calls = [];
              div.getAttribute = function () { calls.push("getAttribute"); };
              div.getAttributeNS = function () { calls.push("getAttributeNS"); };
              div.setAttribute = function () { calls.push("setAttribute"); };
              div.setAttributeNS = function () { calls.push("setAttributeNS"); };
              div.title;
              div.title = "foo";
              return calls;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!([]), "{v}");
}

#[test]
fn limited_quirks_compat_mode_is_css1compat() {
    let mut page = open(
        r#"<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <title>t</title><body></body>"#,
    );
    let v = page.evaluate("document.compatMode").unwrap();
    assert_eq!(v, serde_json::json!("CSS1Compat"), "{v}");
}

#[test]
fn empty_document_title_does_not_create_text_node() {
    let mut page = open(
        r#"<!doctype html>
<title>document.title and the empty string</title>
<link rel="author" title="Ms2ger" href="mailto:ms2ger@gmail.com">
<meta name="assert" content="On setting document.title to the empty string, no text node must be created.">
<body></body>"#,
    );
    let v = page
        .evaluate(
            r#"(function () {
              var head = document.documentElement.firstChild;
              head.removeChild(head.firstChild);
              document.title = "";
              var t = head.lastChild;
              return { isTitle: t instanceof HTMLTitleElement, first: t.firstChild };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["isTitle"], true, "{v}");
    assert_eq!(v["first"], serde_json::Value::Null, "{v}");
}

#[test]
fn svg_document_title_uses_child_svg_title() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var SVG = "http://www.w3.org/2000/svg";
              var doc = document.implementation.createDocument(SVG, "svg", null);
              doc.title = "foo";
              var child = doc.documentElement.firstChild;
              return {
                ns: child.namespaceURI,
                name: child.localName,
                text: child.textContent,
                title: doc.title
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["ns"], "http://www.w3.org/2000/svg", "{v}");
    assert_eq!(v["name"], "title", "{v}");
    assert_eq!(v["text"], "foo", "{v}");
    assert_eq!(v["title"], "foo", "{v}");
}

#[test]
fn xml_document_title_setter_is_noop() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var doc = document.implementation.createDocument(null, "foo", null);
              doc.title = "fail";
              return doc.title;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!(""), "{v}");
}

#[test]
fn dataset_does_not_overwrite_namespaced_attrs() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var div = document.createElement("div");
              div.setAttributeNS("foo", "data-my-custom-attr", "first");
              div.setAttributeNS("bar", "data-my-custom-attr", "second");
              div.dataset.myCustomAttr = "third";
              var recs = [];
              for (var i = 0; i < div.attributes.length; i++) {
                recs.push([div.attributes[i].name, div.attributes[i].value, div.attributes[i].namespaceURI]);
              }
              return recs;
            })()"#,
        )
        .unwrap();
    assert_eq!(
        v,
        serde_json::json!([
            ["data-my-custom-attr", "first", "foo"],
            ["data-my-custom-attr", "second", "bar"],
            ["data-my-custom-attr", "third", null]
        ]),
        "{v}"
    );
}

#[test]
fn lang_pseudo_class_matches_html_lang() {
    let mut page = open(
        r#"<html lang="ko"><head><style>
          #box:lang(ko) { width: 100px; }
          .test div { width: 50px; }
        </style></head><body>
          <div class="test"><div id="box">&nbsp;</div></div>
        </body></html>"#,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate("document.getElementById('box').offsetWidth")
        .unwrap();
    assert_eq!(v, serde_json::json!(100), "{v}");
}

#[test]
fn dir_auto_slot_uses_host_direction() {
    let mut page = open(r#"<body><div id="root" dir="rtl"></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var host = document.getElementById("root");
              var shadow = host.attachShadow({mode:"open"});
              shadow.innerHTML = "<section dir=\"ltr\"><div dir=\"auto\"><slot></slot>A</div></section>";
              return getComputedStyle(shadow.querySelector("div")).direction;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!("rtl"), "{v}");
}

#[test]
fn dir_auto_slot_ignores_bdi_assigned_nodes() {
    let mut page = open(r#"<body><div id="root"><bdi>اختبر</bdi></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var host = document.getElementById("root");
              var shadow = host.attachShadow({mode:"open"});
              shadow.innerHTML = "<slot dir=\"auto\"></slot>";
              return getComputedStyle(shadow.querySelector("slot")).direction;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!("ltr"), "{v}");
}

#[test]
fn dir_auto_manual_slot_assign_clears() {
    let mut page = open(r#"<body><div id="root"><div id="c">اختبر</div></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var host = document.getElementById("root");
              var shadow = host.attachShadow({mode:"open", slotAssignment:"manual"});
              shadow.innerHTML = "<slot dir=\"auto\"></slot>";
              var slot = shadow.querySelector("slot");
              var empty = getComputedStyle(slot).direction;
              slot.assign(document.getElementById("c"));
              var assigned = getComputedStyle(slot).direction;
              slot.assign();
              var cleared = getComputedStyle(slot).direction;
              return { empty: empty, assigned: assigned, cleared: cleared };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["empty"], "ltr", "{v}");
    assert_eq!(v["assigned"], "rtl", "{v}");
    assert_eq!(v["cleared"], "ltr", "{v}");
}

#[test]
fn dir_auto_slot_fallback_does_not_affect_ancestor() {
    let mut page = open(r#"<body><div id="root"></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var host = document.getElementById("root");
              var shadow = host.attachShadow({mode:"open"});
              shadow.innerHTML = "<span dir=\"auto\"><slot>اختبر</slot></span>";
              var span = shadow.querySelector("span");
              return getComputedStyle(span).direction;
            })()"#,
        )
        .unwrap();
    assert_eq!(v, serde_json::json!("ltr"), "{v}");
}

#[test]
fn dir_auto_uses_first_strong_character() {
    let mut page = open(r#"<body><div id="d" dir="auto"></div></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var d = document.getElementById("d");
              var empty = getComputedStyle(d).direction;
              d.appendChild(document.createTextNode("اختبر SomeText"));
              var rtl = getComputedStyle(d).direction;
              return { empty: empty, rtl: rtl };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["empty"], "ltr", "{v}");
    assert_eq!(v["rtl"], "rtl", "{v}");
}

#[test]
fn expect_blocking_added_in_body_does_not_block() {
    let mut page = open(
        r##"<!DOCTYPE html><head>
           <link id="link" rel="expect" href="#last">
           <script>
             requestAnimationFrame(function () {
               window.__last = document.getElementById("last") !== null;
             });
           </script>
           </head><body>
           <script>link.blocking = "render";</script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__last").unwrap(),
        serde_json::json!(false)
    );
}

#[test]
fn expect_rel_stylesheet_in_head_does_not_wait_for_last() {
    let mut page = open(
        r##"<!DOCTYPE html><head>
           <link id="link" rel="stylesheet" href="#last" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__last = document.getElementById("last") !== null;
             });
           </script>
           </head><body>
           <script>link.rel = "expect";</script>
           <div id="first"></div>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__last").unwrap(),
        serde_json::json!(false),
        "changing rel to expect in the body must not block"
    );
}

#[test]
fn expect_id_removed_stays_satisfied() {
    let mut page = open(
        r##"<!DOCTYPE html><head>
           <link rel="expect" href="#first" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__was = document.getElementById("wasfirst") !== null;
               window.__last = document.getElementById("last") !== null;
             });
           </script>
           </head><body>
           <div id="first"></div>
           <script>first.id = "wasfirst";</script>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(r#"(function(){return {was: window.__was, last: window.__last};})()"#)
        .unwrap();
    assert_eq!(v["was"], true, "{v}");
    assert_eq!(v["last"], false, "{v}");
}

#[test]
fn expect_percent_encoded_fragment_unblocks() {
    let mut page = open(
        r##"<!DOCTYPE html><head>
           <link rel="expect" href="#se%F0%9F%98%8Fcond" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__mid = document.getElementById("se😏cond") !== null;
               window.__last = document.getElementById("last") !== null;
             });
           </script>
           </head><body>
           <div id="first"></div>
           <script></script>
           <div id="se😏cond"></div>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(r#"(function(){return {mid: window.__mid, last: window.__last};})()"#)
        .unwrap();
    assert_eq!(v["mid"], true, "{v}");
    assert_eq!(v["last"], false, "{v}");
}

#[test]
fn expect_base_mismatch_does_not_block_until_second() {
    let mut page = open(
        r##"<!DOCTYPE html><head>
           <base href="dummy.html">
           <link rel="expect" href="#second" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__first = document.getElementById("first") !== null;
               window.__second = document.getElementById("second") !== null;
             });
           </script>
           </head><body>
           <div id="first"></div>
           <script></script>
           <div id="second"></div>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(r#"(function(){return {first: window.__first, second: window.__second};})()"#)
        .unwrap();
    assert_eq!(v["first"], true, "{v}");
    assert_eq!(v["second"], false, "{v}");
}

#[test]
fn expect_dynamic_anchor_name_unblocks() {
    let mut page = open(
        r##"<!DOCTYPE html><head>
           <link rel="expect" href="#target" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__n = document.getElementsByName("target").length;
               window.__last = document.getElementById("last");
             });
           </script>
           </head><body>
           <div id="first"></div>
           <script></script>
           <script>
             var a = document.createElement("a");
             a.name = "target";
             document.body.append(a);
           </script>
           <script></script>
           <div id="last"></div>
           </body>"##,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(r#"(function(){return {n: window.__n, last: window.__last};})()"#)
        .unwrap();
    assert_eq!(v["n"], 1, "{v}");
    assert_eq!(v["last"], serde_json::Value::Null, "{v}");
}

#[test]
fn expect_name_target_unblocks_before_later_ids() {
    let mut page = open(
        r##"<link rel="expect" href="#second" blocking="render">
           <script>
             requestAnimationFrame(function () {
               window.__name = document.getElementsByName("second").length;
               window.__last = document.getElementById("last") !== null;
             });
           </script>
           <div id="first"></div>
           <a name="second"></a>
           <script></script>
           <div id="last"></div>"##,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(r#"(function () { return { name: window.__name, last: window.__last }; })()"#)
        .unwrap();
    assert_eq!(v["name"], 1, "{v}");
    assert_eq!(v["last"], false, "{v}");
}

#[test]
fn current_script_parser_and_dom_inserted() {
    let mut page = open(
        r#"<script id="p">window.__p = document.currentScript && document.currentScript.id;</script>
           <script>
             var s = document.createElement("script");
             s.id = "d";
             s.textContent = "window.__d = document.currentScript && document.currentScript.id;";
             document.body.appendChild(s);
             window.__after = document.currentScript && document.currentScript.tagName;
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function(){return {p: window.__p, d: window.__d, after: window.__after};})()"#,
        )
        .unwrap();
    assert_eq!(v["p"], "p", "{v}");
    assert_eq!(v["d"], "d", "{v}");
    assert_eq!(v["after"], "SCRIPT", "{v}");
}

#[test]
fn img_alt_and_input_type_reflect() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function(){
              var img = document.createElement("img");
              img.alt = "x";
              var inp = document.createElement("input");
              return { alt: img.alt, attr: img.getAttribute("alt"), type: inp.type };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["alt"], "x", "{v}");
    assert_eq!(v["attr"], "x", "{v}");
    assert_eq!(v["type"], "text", "{v}");
}

#[test]
fn moved_async_script_does_not_run() {
    let mut page = open(
        r#"<script id="target" async src="data:text/javascript,window.dummy=1"></script>
           <script>
             const t = document.getElementById("target");
             const d = document.implementation.createHTMLDocument("n");
             d.documentElement.appendChild(t);
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.dummy").unwrap();
    assert_eq!(v, serde_json::Value::Null, "{v}");
}

#[test]
fn script_inserted_blocking_does_not_throw() {
    let mut page = open(
        r#"<script>
             try {
               const s = document.createElement("script");
               s.src = "data:text/javascript,window.dummy=1";
               s.blocking = "render";
               document.head.appendChild(s);
               window.__ok = 1;
             } catch (e) {
               window.__ok = String(e);
             }
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(r#"(function(){return {ok: window.__ok, dummy: window.dummy};})()"#)
        .unwrap();
    assert_eq!(v["ok"], 1, "{v}");
}

#[test]
fn window_origin_matches_location() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(r#"(function(){ return { o: self.origin, l: location.origin }; })()"#)
        .unwrap();
    assert_eq!(v["o"], v["l"], "{v}");
    assert!(v["o"].as_str().unwrap_or("").starts_with("https://"), "{v}");
}

#[test]
fn aria_idrefs_survive_disconnect() {
    let mut page = open(
        r#"<div id="single_element">
             <input aria-activedescendant="foo">
             <p id="foo"></p>
           </div>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              const container = document.getElementById("single_element");
              const el = container.querySelector("input");
              const target = container.querySelector("#foo");
              const before = el.ariaActiveDescendantElement === target;
              container.remove();
              const after = el.ariaActiveDescendantElement === target;
              document.body.appendChild(container);
              const recon = el.ariaActiveDescendantElement === target;
              return { before: before, after: after, recon: recon };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["before"], true, "{v}");
    assert_eq!(v["after"], true, "{v}");
    assert_eq!(v["recon"], true, "{v}");
}

#[test]
fn aria_idrefs_work_after_reconnect_during_parser_script() {
    let mut page = open(
        r#"<div id="single_element">
             <input aria-activedescendant="foo">
             <p id="foo"></p>
           </div>
           <script>
             const container = document.getElementById("single_element");
             const el = container.querySelector("input");
             const target = document.getElementById("foo");
             window.__before = el.ariaActiveDescendantElement === target;
             container.remove();
             window.__after = el.ariaActiveDescendantElement === target;
             document.body.appendChild(container);
             window.__recon = el.ariaActiveDescendantElement === target;
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(r#"(function(){return {before: window.__before, after: window.__after, recon: window.__recon};})()"#)
        .unwrap();
    assert_eq!(v["before"], true, "{v}");
    assert_eq!(v["after"], true, "{v}");
    assert_eq!(v["recon"], true, "{v}");
}

#[test]
fn labelledby_declarative_shadow_first_element() {
    let mut page = open(
        r#"<input id="input4">
           <div id="shadow_host4">
             <template shadowrootmode="open"><span>Label for input4</span></template>
           </div>
           <script>
             const sr = shadow_host4.shadowRoot;
             const label4 = sr && sr.firstElementChild;
             window.__has = !!sr;
             window.__tag = label4 && label4.localName;
             window.__text = label4 && label4.textContent;
             try {
               input4.ariaLabelledByElements = [label4];
               window.__setOk = true;
               window.__len = input4.ariaLabelledByElements.length;
             } catch (e) {
               window.__setOk = false;
               window.__err = String(e && e.message || e);
             }
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function(){return {has: window.__has, tag: window.__tag, text: window.__text, setOk: window.__setOk, len: window.__len, err: window.__err};})()"#,
        )
        .unwrap();
    assert_eq!(v["has"], true, "{v}");
    assert_eq!(v["tag"], "span", "{v}");
    assert_eq!(v["text"], "Label for input4", "{v}");
    assert_eq!(v["setOk"], true, "{v}");
    assert_eq!(v["len"], 0, "{v}");
}

#[test]
fn option_label_value_and_video_default_muted() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r#"(function () {
              const o = document.createElement("option");
              o.textContent = "Hello";
              const noLabel = o.label;
              o.label = "L";
              const withLabel = o.label;
              const attr = o.getAttribute("label");
              o.value = "v";
              const val = o.value;
              const video = document.createElement("video");
              const dmType = typeof video.defaultMuted;
              const dm = video.defaultMuted;
              video.defaultMuted = true;
              const mutedAttr = video.hasAttribute("muted");
              const link = document.createElement("link");
              link.setAttribute("nonce", "abc");
              const n1 = link.nonce;
              link.nonce = "xyz";
              const n2 = link.nonce;
              const nAttr = link.getAttribute("nonce");
              return {
                noLabel: noLabel, withLabel: withLabel, attr: attr, val: val,
                dmType: dmType, dm: dm, mutedAttr: mutedAttr,
                n1: n1, n2: n2, nAttr: nAttr
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["noLabel"], "Hello", "{v}");
    assert_eq!(v["withLabel"], "L", "{v}");
    assert_eq!(v["attr"], "L", "{v}");
    assert_eq!(v["val"], "v", "{v}");
    assert_eq!(v["dmType"], "boolean", "{v}");
    assert_eq!(v["dm"], false, "{v}");
    assert_eq!(v["mutedAttr"], true, "{v}");
    assert_eq!(v["n1"], "abc", "{v}");
    assert_eq!(v["n2"], "xyz", "{v}");
    assert_eq!(v["nAttr"], "abc", "{v}");
}

#[test]
fn document_write_runs_inserted_script() {
    let mut page = open(
        r#"<script>
             function mark() { window.__dw = document.currentScript && document.currentScript.id; }
             document.write('<script id="document-write">mark();</' + 'script>');
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__dw").unwrap();
    assert_eq!(v, "document-write", "{v}");
}

#[test]
fn failed_parser_script_src_fires_onerror() {
    let mut page = open(
        r#"<script>
             function boom() { window.__err = document.currentScript; window.__fired = 1; }
           </script>
           <script src="http://some.nonexistant.test/fail" id="script-load-error" onerror="boom()"></script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(r#"(function(){return {fired: window.__fired, cs: window.__err};})()"#)
        .unwrap();
    assert_eq!(v["fired"], 1, "{v}");
    assert_eq!(v["cs"], serde_json::Value::Null, "{v}");
}

#[test]
fn iframe_post_then_listen_cdata_dir_auto() {
    let mut page = open(
        r#"<iframe id="f" srcdoc="<div id=container></div><script>
            window.addEventListener('message', function (e) {
              var id = e.data;
              if (id === 'subframe-loaded') return;
              var div = document.createElement('div');
              div.dir = 'auto';
              div.id = id;
              div.appendChild(document.createCDATASection('foo'));
              div.appendChild(document.createTextNode('اختبر'));
              document.getElementById('container').appendChild(div);
              window.top.postMessage(id, '*');
            });
            window.top.postMessage('subframe-loaded', '*');
          </script>"></iframe>
           <script>
             function awaitMessage(msg) {
               return new Promise(function (res) {
                 function waitAndRemove(e) {
                   if (e.data != msg) return;
                   window.removeEventListener('message', waitAndRemove);
                   res();
                 }
                 window.addEventListener('message', waitAndRemove);
               });
             }
             window.__p = (async function () {
               await awaitMessage('subframe-loaded');
               var iframe = document.getElementById('f');
               iframe.contentWindow.postMessage('1', '*');
               await awaitMessage('1');
               var div = iframe.contentDocument.getElementById('1');
               window.__has = !!div;
               window.__ltr = !!(div && div.matches(':dir(ltr)'));
               window.__nt = div && div.firstChild && div.firstChild.nodeType;
             })();
           </script>"#,
    );
    assert!(page.settle(500).settled);
    let v = page
        .evaluate(
            r#"(function(){return {has: window.__has, ltr: window.__ltr, nt: window.__nt};})()"#,
        )
        .unwrap();
    assert_eq!(v["has"], true, "{v}");
    assert_eq!(v["ltr"], true, "{v}");
    assert_eq!(v["nt"], 4, "{v}");
}

#[test]
fn srcdoc_iframe_postmessage_reaches_parent() {
    let mut page = open(
        r#"<script>
             window.__got = false;
             window.addEventListener("message", function (e) {
               if (e.data === "subframe-loaded") window.__got = true;
             });
           </script>
           <iframe srcdoc="<script>window.top.postMessage('subframe-loaded','*');</script>"></iframe>"#,
    );
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__got").unwrap();
    assert_eq!(v, true, "{v}");
}

#[test]
fn create_cdata_section_counts_for_dir_auto() {
    let mut page = open(r#"<div id="d" dir="auto"></div>"#);
    let v = page
        .evaluate(
            r#"(function () {
              const div = document.getElementById("d");
              const cdata = document.createCDATASection("foo");
              const text = document.createTextNode("اختبر");
              div.appendChild(cdata);
              div.appendChild(text);
              const ltr = div.matches(":dir(ltr)");
              cdata.remove();
              const rtl = div.matches(":dir(rtl)");
              return { type: cdata.nodeType, ltr: ltr, rtl: rtl };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["type"], 4, "{v}");
    assert_eq!(v["ltr"], true, "{v}");
    assert_eq!(v["rtl"], true, "{v}");
}

#[test]
fn html_comment_pi_becomes_a_processing_instruction() {
    let mut page = open(r#"<div id="p"><?marker name="x">keep</div>"#);
    let v = page
        .evaluate(
            r#"(function () {
              const p = document.getElementById("p");
              const n = p.firstChild;
              return {
                type: n && n.nodeType,
                target: n && n.target,
                data: n && n.data,
                html: p.innerHTML
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["type"], 7, "{v}");
    assert_eq!(v["target"], "marker", "{v}");
    assert!(
        v["data"].as_str().unwrap_or("").contains("name=\"x\""),
        "{v}"
    );
}

#[test]
fn template_for_patches_named_marker() {
    let mut page = open(
        r#"<div id="placeholder"><?marker name="E"><?marker name="f"></div>
           <template for="E">E</template>
           <template for="f">f</template>
           <template for="nope">x</template>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              return {
                text: document.getElementById("placeholder").textContent,
                leftover: document.querySelectorAll("template[for]").length,
                bufferDefault: document.createElement("template").buffer
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["text"], "Ef", "{v}");
    assert_eq!(v["leftover"], 1, "{v}");
    assert_eq!(v["bufferDefault"], false, "{v}");
}

#[test]
fn template_empty_for_is_in_place() {
    let mut page = open(
        r#"<div id="c"><span>Before</span><template for><span id="t">Inside</span></template><span>After</span></div>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              const c = document.getElementById("c");
              return {
                text: c.textContent.replace(/\s+/g, " ").trim(),
                tpl: c.querySelector("template") !== null,
                inside: !!document.getElementById("t")
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["text"], "BeforeInsideAfter", "{v}");
    assert_eq!(v["tpl"], false, "{v}");
    assert_eq!(v["inside"], true, "{v}");
}

#[test]
fn render_blocking_remove_cancels_load() {
    let mut page = open(
        r#"<script>
             window.__loads = 0;
             const el = document.createElement("link");
             el.rel = "stylesheet";
             el.blocking = "render";
             el.href = "/does-not-exist.css";
             el.addEventListener("load", function () { window.__loads++; });
             document.head.appendChild(el);
             el.remove();
             window.__cancelled = el.isConnected === false;
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate("({ loads: window.__loads, cancelled: window.__cancelled })")
        .unwrap();
    assert_eq!(v["loads"], 0, "{v}");
    assert_eq!(v["cancelled"], true, "{v}");
}

#[test]
fn stream_append_html_applies_template_for() {
    let mut page = open(r#"<div id="placeholder"><?start name="p">Old<?end></div>"#);
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(async function () {
              const writable = document.body.streamAppendHTMLUnsafe({ runScripts: true });
              const writer = writable.getWriter();
              await writer.write('<template for="p">');
              await writer.write("New");
              await writer.write("</template>");
              await writer.close();
              return document.getElementById("placeholder").textContent;
            })()"#,
        )
        .unwrap();
    page.settle(200);
    let text = page
        .evaluate("document.getElementById('placeholder').textContent")
        .unwrap();
    assert_eq!(text, "New", "async={v} settled={text}");
}

#[test]
fn template_for_buffer_is_atomic_and_sanitize_strips_script() {
    let mut page = open(
        r#"<div id="t"><?start name="m">Old<?end></div>
           <template for="m" buffer sanitize>
             <span id="ok">Allowed</span>
             <script>window.__bad = true;</script>
           </template>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const t = document.getElementById("t");
              const ok = t.querySelector("[id='ok']");
              return {
                text: ok && ok.textContent,
                script: t.querySelector("script") !== null,
                bad: !!window.__bad,
                tpl: document.querySelector("template") !== null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["text"], "Allowed", "{v}");
    assert_eq!(v["script"], false, "{v}");
    assert_eq!(v["bad"], false, "{v}");
    assert_eq!(v["tpl"], false, "{v}");
}

#[test]
fn chained_template_for_upgrades_custom_element() {
    let mut page = open(
        r#"<div id="target"><?marker name="target"?>Original<?end></div>
           <script>
             class CustomElement extends HTMLElement {
               constructor() {
                 super();
                 window.customElementRun = true;
                 window.ceOwnerDocument = this.ownerDocument;
               }
             }
             customElements.define("custom-element", CustomElement);
           </script>
           <template for="target">
             <div id="inner-div"><?marker name="inner"?></div>
             <template for="inner">
               <custom-element id="ce"></custom-element>
               <span id="streamed">Streamed</span>
             </template>
           </template>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              return {
                ran: !!window.customElementRun,
                owner: window.ceOwnerDocument === document,
                parent: document.getElementById("ce") && document.getElementById("ce").parentNode.id,
                streamed: !!document.getElementById("streamed")
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["ran"], true, "{v}");
    assert_eq!(v["owner"], true, "{v}");
    assert_eq!(v["parent"], "inner-div", "{v}");
    assert_eq!(v["streamed"], true, "{v}");
}

#[test]
fn aria_enumerated_keywords_and_invalid_defaults() {
    let mut page = open(r#"<div id="h"></div>"#);
    let v = page
        .evaluate(
            r#"(function () {
              const el = document.getElementById("h");
              el.setAttribute("aria-checked", "mixed");
              const mixed = el.ariaChecked;
              el.setAttribute("aria-checked", "TRUE");
              const canon = el.ariaChecked;
              el.setAttribute("aria-busy", "nope");
              const invalidBusy = el.ariaBusy;
              el.removeAttribute("aria-busy");
              const missingBusy = el.ariaBusy;
              el.setAttribute("aria-busy", "");
              const emptyBusy = el.ariaBusy;
              el.removeAttribute("aria-autocomplete");
              const missingAuto = el.ariaAutoComplete;
              el.removeAttribute("aria-checked");
              const missingChecked = el.ariaChecked;
              el.removeAttribute("aria-label");
              const missingLabel = el.ariaLabel;
              el.setAttribute("aria-current", "");
              const emptyCurrent = el.ariaCurrent;
              el.ariaBusy = null;
              const idlNullBusy = el.ariaBusy;
              const idlNullHas = el.hasAttribute("aria-busy");
              return { mixed, canon, invalidBusy, missingBusy, emptyBusy, missingAuto, missingChecked, missingLabel, emptyCurrent, idlNullBusy, idlNullHas };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["mixed"], "mixed", "{v}");
    assert_eq!(v["canon"], "true", "{v}");
    assert_eq!(v["invalidBusy"], "false", "{v}");
    assert_eq!(v["missingBusy"], serde_json::Value::Null, "{v}");
    assert_eq!(v["emptyBusy"], "false", "{v}");
    assert_eq!(v["missingAuto"], serde_json::Value::Null, "{v}");
    assert_eq!(v["missingChecked"], serde_json::Value::Null, "{v}");
    assert_eq!(v["missingLabel"], serde_json::Value::Null, "{v}");
    assert_eq!(v["emptyCurrent"], "true", "{v}");
    assert_eq!(v["idlNullBusy"], serde_json::Value::Null, "{v}");
    assert_eq!(v["idlNullHas"], false, "{v}");
}

#[test]
fn template_for_buffer_in_place_runs_scripts_atomically() {
    let mut page = open(
        r#"<div id="container">
             <span>Before</span>
             <template for buffer>
               <span id="target1">Inside 1</span>
               <script>
                 window.target1PresentDuringScript = !!document.getElementById('target1');
                 window.target2PresentDuringScript = !!document.getElementById('target2');
               </script>
               <span id="target2">Inside 2</span>
             </template>
             <span>After</span>
           </div>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("container");
              return {
                t1: window.target1PresentDuringScript,
                t2: window.target2PresentDuringScript,
                tpl: c.querySelector("template") !== null,
                before: c.querySelector("#target1") && c.querySelector("#target1").previousElementSibling.textContent,
                after: c.querySelector("#target2") && c.querySelector("#target2").nextElementSibling.textContent,
                html: c.innerHTML,
                scripts: c.querySelectorAll("script").length
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["t1"], true, "{v}");
    assert_eq!(v["t2"], true, "{v}");
    assert_eq!(v["tpl"], false, "{v}");
    assert_eq!(v["before"], "Before", "{v}");
    assert_eq!(v["after"], "After", "{v}");
}

#[test]
fn template_for_sanitize_invalid_runs_script() {
    let mut page = open(
        r#"<div id="t"><?start name="m">Old<?end></div>
           <template for="m" sanitize="invalid">
             <script>window.scriptInvalidVal = true;</script>
             <span id="ok">Allowed Invalid Val</span>
           </template>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              return {
                ran: !!window.scriptInvalidVal,
                text: (document.getElementById("ok") && document.getElementById("ok").textContent) || (document.getElementById("t") && document.getElementById("t").textContent),
                html: document.getElementById("t") && document.getElementById("t").innerHTML,
                kids: document.getElementById("t") && document.getElementById("t").childNodes.length
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ran"], true, "{v}");
    assert_eq!(v["text"], "Allowed Invalid Val", "{v}");
}

#[test]
fn start_without_end_replaces_through_parent() {
    let mut page =
        open(r#"<div id="c"><?start name="content"?><span class="red">Has red</span></div>"#);
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              const c = document.getElementById("c");
              const box = document.createElement("div");
              box.innerHTML = '<template for="content"><?start name="content"?><span class="blue">Has blue</span></template>';
              const tpl = box.querySelector("template");
              document.body.appendChild(tpl);
              __veApplyPartialUpdates();
              const first = c.textContent.replace(/\s+/g, " ").trim();
              const box2 = document.createElement("div");
              box2.innerHTML = '<template for="content">Green (no span)</template>';
              document.body.appendChild(box2.querySelector("template"));
              __veApplyPartialUpdates();
              return { first, second: c.textContent.replace(/\s+/g, " ").trim() };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["first"], "Has blue", "{v}");
    assert_eq!(v["second"], "Green (no span)", "{v}");
}

#[test]
fn set_html_and_sanitizer_strip_script_and_apply_template() {
    let mut page = open(r#"<div id="host"></div>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const host = document.getElementById("host");
              host.setHTML('<div id="t"><?start name="m">Old<?end></div><template for="m" sanitize="unsafe"><script>window.nestedScript7 = true;<\/script><span id="ok7">Allowed 7</span></template>');
              const bespoke = new Sanitizer({ elements: ["span", "template"], attributes: ["for", "marker"] });
              const c8 = document.createElement("div");
              document.body.appendChild(c8);
              c8.setHTML('<span marker="o"><?start name="o">X<?end></span><template for="o" sanitize="unsafe"><span>ok</span><div>no</div></template>', { sanitizer: bespoke });
              return {
                ran: !!window.nestedScript7,
                span: host.querySelector("#ok7") && host.querySelector("#ok7").textContent,
                sanitizer: typeof Sanitizer === "function",
                noDiv: c8.querySelectorAll("div").length === 0,
                hasSpan: c8.querySelector("span") !== null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ran"], false, "{v}");
    assert_eq!(v["sanitizer"], true, "{v}");
    assert_eq!(v["noDiv"], true, "{v}");
    assert_eq!(v["hasSpan"], true, "{v}");
}

#[test]
fn empty_for_streaming_mid_script_sees_prefix_only() {
    let mut page = open(
        r#"<div id="container2">
             <span id="before-span">Before</span>
             <template for id="tpl-test">
               <span>A</span><script>
                 window.step1 = (function () {
                   const c = document.getElementById("container2").cloneNode(true);
                   for (const s of c.querySelectorAll("script")) s.remove();
                   return c.textContent.trim().replace(/\s+/g, " ");
                 })();
                 const tpl = document.getElementById("tpl-test");
                 const beforeSpan = document.getElementById("before-span");
                 document.getElementById("container2").insertBefore(tpl, beforeSpan);
               </script><span>B</span><script>
                 window.step2 = "ran";
               </script>
             </template>
             <span>After</span>
           </div>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              const c = document.getElementById("container2");
              return {
                step1: window.step1,
                step2: window.step2,
                tpl: c.querySelector("template") !== null,
                html: c.innerHTML
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["step1"], "Before A", "{v}");
    assert_eq!(v["step2"], serde_json::Value::Null, "{v}");
    assert_eq!(v["tpl"], true, "{v}");
}

#[test]
fn review_behavior_counterexamples() {
    let mut page = open(
        r#"<div id="h"><span>x</span></div>
           <script>
             window.__url = new URL('https://s.test/a/b/../c').href;
             const u2 = new URL('https://s.test/a/b');
             u2.pathname = '/a/b/../c';
             window.__urlSet = u2.href;
             window.__composed = new Event('x').composed;
             window.__composedClickCtor = new Event('click').composed;
             let clickComposed = null;
             document.addEventListener('click', (e) => { clickComposed = e.composed; }, true);
             let n = 0;
             const fn = () => { n++; };
             document.getElementById('h').addEventListener('click', fn);
             document.getElementById('h').addEventListener('click', fn);
             document.getElementById('h').click();
             window.__dedup = n;
             window.__clickComposed = clickComposed;
             let sawTarget = false;
             document.addEventListener('ping', (e) => { e.stopPropagation(); }, true);
             document.getElementById('h').addEventListener('ping', () => { sawTarget = true; });
             document.getElementById('h').dispatchEvent(new Event('ping', { bubbles: true }));
             window.__stopped = sawTarget === false;
             const kids = document.getElementById('h').childNodes;
             const before = kids.length;
             document.getElementById('h').appendChild(document.createElement('i'));
             window.__live = kids.length === before + 1;
             window.__owner = document.getElementById('h').ownerDocument === document;
           </script>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              return {
                url: window.__url,
                urlSet: window.__urlSet,
                composed: window.__composed,
                composedClickCtor: window.__composedClickCtor,
                clickComposed: window.__clickComposed,
                dedup: window.__dedup,
                stopped: window.__stopped,
                live: window.__live,
                owner: window.__owner
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["url"], "https://s.test/a/c", "{v}");
    assert_eq!(v["urlSet"], "https://s.test/a/c", "{v}");
    assert_eq!(v["composed"], false, "{v}");
    assert_eq!(v["composedClickCtor"], false, "{v}");
    assert_eq!(v["clickComposed"], true, "{v}");
    assert_eq!(v["dedup"], 1, "{v}");
    assert_eq!(v["stopped"], true, "{v}");
    assert_eq!(v["live"], true, "{v}");
    assert_eq!(v["owner"], true, "{v}");
}

#[test]
fn required_empty_input_check_validity_is_false() {
    let mut page =
        open(r#"<form id="f"><input id="req" required><input id="ok" value="x"></form>"#);
    let v = page
        .evaluate(
            r#"(function () {
              var req = document.getElementById("req");
              var ok = document.getElementById("ok");
              var form = document.getElementById("f");
              var empty = req.checkValidity();
              req.value = "filled";
              return {
                empty: empty,
                filled: req.checkValidity(),
                ok: ok.checkValidity(),
                form: form.checkValidity()
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["empty"], false, "{v}");
    assert_eq!(v["filled"], true, "{v}");
    assert_eq!(v["ok"], true, "{v}");
    assert_eq!(v["form"], true, "{v}");
}

#[test]
fn get_computed_style_display_does_not_flush_layout() {
    let mut html = String::from("<div id=\"root\">");
    for i in 0..200 {
        html.push_str(&format!("<p id=\"p{i}\">n</p>"));
    }
    html.push_str("</div>");
    let mut page = open(&html);
    assert!(page.settle(200).settled);
    page.reset_restyle_attribution();
    let v = page
        .evaluate(
            r#"(function () {
              document.body.appendChild(document.createElement("section"));
              return getComputedStyle(document.body).display;
            })()"#,
        )
        .unwrap();
    let attr = page.restyle_attribution();
    assert_eq!(v, "block", "{v} restyle={attr:?}");
    assert_eq!(
        attr.layout_calls, 0,
        "display is computed, not used: {v} restyle={attr:?}"
    );
}

#[test]
fn document_named_property_miss_does_not_wrap_the_tree() {
    let mut html = String::from("<div id=\"root\">");
    for i in 0..2000 {
        html.push_str(&format!("<p id=\"n{i}\">x</p>"));
    }
    html.push_str("</div>");
    let mut page = open(&html);
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              var t0 = Date.now();
              var miss = document["jQuery35123456789"];
              return { miss: miss == null, ms: Date.now() - t0 };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["miss"], true, "{v}");
    assert!(
        v["ms"].as_u64().unwrap_or(u64::MAX) < 50,
        "named miss must use the id/name indexes: {v}"
    );
}

#[test]
fn window_load_fires_after_a_large_id_tree() {
    let ids: String = (0..800)
        .map(|i| format!(r#"<span id="n{i}">{i}</span>"#))
        .collect();
    let html = format!(
        r#"<div>{ids}</div>
           <script>
             window.__gotLoad = false;
             window.addEventListener("load", function () {{
               window.__gotLoad = true;
               window.__hash = String(document.location.hash);
             }});
           </script>"#
    );
    let mut page = open(&html);
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              return {
                got: window.__gotLoad,
                hash: window.__hash,
                ready: document.readyState
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["got"], true, "{v}");
    assert_eq!(v["ready"], "complete", "{v}");
}

#[cfg(feature = "v8")]
#[test]
fn document_change_event_does_not_scan_named_properties() {
    let ids: String = (0..2000)
        .map(|i| format!(r#"<span id="n{i}">{i}</span>"#))
        .collect();
    let html = format!(
        r#"<input id="todo" class="new-todo">
           <div>{ids}</div>
           <script>
             document.getElementById("todo").addEventListener("change", function () {{
               window.__changed = true;
             }});
           </script>"#
    );
    let mut page = open(&html);
    let v = page
        .evaluate(
            r#"(function () {
              var input = document.getElementById("todo");
              var t0 = Date.now();
              input.dispatchEvent(new Event("change", { bubbles: true }));
              return { changed: window.__changed === true, ms: Date.now() - t0, nodes: document.getElementsByTagName("*").length };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["changed"], true, "{v}");
    assert!(
        v["ms"].as_u64().unwrap_or(u64::MAX) < 1_000,
        "onchange named-property scan on a large tree: {v}"
    );
}

#[test]
fn nested_sanitize_keeps_inner_template_policy() {
    let mut page = open(
        r#"<div id="target1"><?start name="outer-1">Original 1<?end></div>
           <template for="outer-1" sanitize>
             <div id="inner-1"><?start name="inner-1">Inner Original 1<?end></div>
             <template for="inner-1" sanitize="unsafe">
               <script>window.nestedScript1 = true;</script>
               <span id="ok1">Allowed 1</span>
             </template>
           </template>
           <div id="target2"><?start name="outer-2">Original 2<?end></div>
           <template for="outer-2">
             <div id="inner-2"><?start name="inner-2">Inner Original 2<?end></div>
             <template for="inner-2" sanitize>
               <script>window.nestedScript2 = true;</script>
               <span id="ok2">Allowed 2</span>
             </template>
           </template>
           <div id="target3"><?start name="outer-3">Original 3<?end></div>
           <template for="outer-3">
             <div id="inner-3"><?start name="inner-3">Inner Original 3<?end></div>
             <template for="inner-3">
               <script>window.nestedScript3 = true;</script>
               <span id="ok3">Allowed 3</span>
             </template>
           </template>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const t1 = document.getElementById("target1");
              const t2 = document.getElementById("target2");
              const t3 = document.getElementById("target3");
              return {
                s1: !!window.nestedScript1,
                s2: !!window.nestedScript2,
                s3: !!window.nestedScript3,
                span1: !!(t1 && t1.querySelector("span")),
                orig1: !!(t1 && t1.textContent.includes("Inner Original 1")),
                ok2: t2 && t2.querySelector("span") && t2.querySelector("span").textContent,
                ok3: t3 && t3.querySelector("span") && t3.querySelector("span").textContent
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["s1"], false, "{v}");
    assert_eq!(v["s2"], false, "{v}");
    assert_eq!(v["s3"], true, "{v}");
    assert_eq!(v["span1"], false, "{v}");
    assert_eq!(v["orig1"], true, "{v}");
    assert_eq!(v["ok2"], "Allowed 2", "{v}");
    assert_eq!(v["ok3"], "Allowed 3", "{v}");
}

#[test]
fn nested_sanitize_template_is_observed_then_applied() {
    let mut page = open(
        r#"<div id="container">
             <div id="target-outer"><?start name="outer-marker">Original Outer<?end></div>
             <script>
               window.addedNodes = [];
               const observer = new MutationObserver((mutations) => {
                 for (const mutation of mutations) {
                   for (const node of mutation.addedNodes) {
                     if (node.nodeType === 1) window.addedNodes.push(node.id || node.nodeName);
                   }
                 }
               });
               observer.observe(document.getElementById("container"), { childList: true, subtree: true });
             </script>
             <template for="outer-marker">
               <div id="target-inner"><?start name="inner-marker">Original Inner<?end></div>
               <template id="inner" for="inner-marker" buffer sanitize>
                 <span id="ok">Inner Allowed</span>
               </template>
             </template>
           </div>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              return {
                added: window.addedNodes,
                ok: document.getElementById("ok") && document.getElementById("ok").textContent,
                innerTpl: document.getElementById("inner")
              };
            })()"#,
        )
        .unwrap();
    let added = v["added"].to_string();
    assert!(added.contains("target-inner"), "{v}");
    assert!(added.contains("inner"), "{v}");
    assert!(added.contains("ok") || added.contains("SPAN"), "{v}");
    assert_eq!(v["ok"], "Inner Allowed", "{v}");
    assert!(v["innerTpl"].is_null(), "{v}");
}

#[test]
fn dom_inserted_pi_targets_are_case_sensitive() {
    let mut page = open(r#"<div id="placeholder"></div>"#);
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(function () {
              const placeholder = document.getElementById("placeholder");
              placeholder.append(
                document.createProcessingInstruction("Start", 'name="a"'),
                document.createProcessingInstruction("End", ""),
                document.createProcessingInstruction("MARKER", 'name="b"'),
                document.createProcessingInstruction("marKER", 'name="c"'),
                document.createProcessingInstruction("marker", 'Name="z"'),
                document.createProcessingInstruction("marker", 'name="d"'),
                document.createProcessingInstruction("start", 'name="e"'),
                document.createProcessingInstruction("end", ""),
                "f"
              );
              const names = ["a", "b", "c", "z", "d", "e"];
              for (const name of names) {
                const tpl = document.createElement("template");
                tpl.setAttribute("for", name);
                tpl.innerHTML = name;
                document.body.appendChild(tpl);
              }
              __veApplyPartialUpdates();
              return {
                html: placeholder.innerHTML,
                left: document.querySelectorAll("template[for]").length
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(
        v["html"],
        "<?Start name=\"a\"?><?End ?><?MARKER name=\"b\"?><?marKER name=\"c\"?><?marker Name=\"z\"?>def",
        "{v}"
    );
    assert_eq!(v["left"], 4, "{v}");
}

#[test]
fn stream_append_replaces_start_without_end() {
    let mut page = open(
        r#"<div id="container"><?start name="content"?><span class="red">Has red</span></div>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r#"(async function () {
              const container = document.getElementById("container");
              async function update(html) {
                const writer = container.streamAppendHTMLUnsafe({ runScripts: true }).getWriter();
                await writer.write("<template for=content>" + html + "</template>");
                await writer.close();
              }
              await update('<?start name="content"?><span class="blue">Has blue</span>');
              const first = container.textContent.trim();
              await update("Green (no span)");
              return { first, second: container.textContent.trim(), html: container.innerHTML };
            })()"#,
        )
        .unwrap();
    page.settle(200);
    let settled = page
        .evaluate(
            r#"(function () {
              const c = document.getElementById("container");
              return { text: c.textContent.trim(), html: c.innerHTML };
            })()"#,
        )
        .unwrap();
    assert_eq!(
        settled["text"], "Green (no span)",
        "async={v} settled={settled}"
    );
}

#[test]
fn live_childnodes_has_own_indexes_after_remove() {
    let mut page = open(r#"<div id="p"></div>"#);
    let v = page
        .evaluate(
            r#"(function () {
              const parent = document.createElement("div");
              const node = document.createElement("div");
              const before = parent.appendChild(document.createComment("before"));
              parent.appendChild(node);
              const after = parent.appendChild(document.createComment("after"));
              node.remove();
              return {
                len: parent.childNodes.length,
                own0: parent.childNodes.hasOwnProperty(0),
                own1: parent.childNodes.hasOwnProperty(1),
                first: parent.childNodes[0] === before,
                second: parent.childNodes[1] === after
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["len"], 2, "{v}");
    assert_eq!(v["own0"], true, "{v}");
    assert_eq!(v["own1"], true, "{v}");
    assert_eq!(v["first"], true, "{v}");
    assert_eq!(v["second"], true, "{v}");
}

#[test]
fn official_sanitize_boolean_compound_id_descendant() {
    let mut page = open(
        r#"<div id="container-no-val">
             <div id="target-no-val"><?start name="marker-no-val">Original<?end></div>
             <template for="marker-no-val" sanitize>
               <script>window.scriptNoVal = true;</script>
               <span id="ok-no-val">Allowed No Val</span>
             </template>
           </div>
           <div id="container-empty-val">
             <div id="target-empty-val"><?start name="marker-empty-val">Original<?end></div>
             <template for="marker-empty-val" sanitize="">
               <script>window.scriptEmptyVal = true;</script>
               <span id="ok-empty-val">Allowed Empty Val</span>
             </template>
           </div>
           <div id="container-invalid-val">
             <div id="target-invalid-val"><?start name="marker-invalid-val">Original<?end></div>
             <template for="marker-invalid-val" sanitize="invalid">
               <script>window.scriptInvalidVal = true;</script>
               <span id="ok-invalid-val">Allowed Invalid Val</span>
             </template>
           </div>
           <div id="container-space-val">
             <div id="target-space-val"><?start name="marker-space-val">Original<?end></div>
             <template for="marker-space-val" sanitize=" ">
               <script>window.scriptSpaceVal = true;</script>
               <span id="ok-space-val">Allowed Space Val</span>
             </template>
           </div>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const noVal = document.querySelector("#target-no-val span");
              const emptyVal = document.querySelector("#target-empty-val span");
              const invalidVal = document.querySelector("#target-invalid-val span");
              const t1 = document.getElementById("target-no-val");
              const t3 = document.getElementById("target-invalid-val");
              return {
                scriptNoVal: !!window.scriptNoVal,
                scriptEmptyVal: !!window.scriptEmptyVal,
                scriptInvalidVal: !!window.scriptInvalidVal,
                noVal: noVal && noVal.textContent,
                emptyVal: emptyVal && emptyVal.textContent,
                invalidVal: invalidVal && invalidVal.textContent,
                byId: document.getElementById("ok-no-val") && document.getElementById("ok-no-val").textContent,
                okInvalid: document.getElementById("ok-invalid-val") && document.getElementById("ok-invalid-val").textContent,
                html1: t1 && t1.innerHTML,
                html3: t3 && t3.innerHTML,
                tpls: document.querySelectorAll("template").length,
                compound: document.querySelector("#target-invalid-val span") && document.querySelector("#target-invalid-val span").id
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["scriptNoVal"], false, "{v}");
    assert_eq!(v["scriptEmptyVal"], false, "{v}");
    assert_eq!(v["scriptInvalidVal"], true, "{v}");
    assert_eq!(
        page.evaluate("!!window.scriptSpaceVal").unwrap(),
        serde_json::json!(true),
        "sanitize space must not sanitize"
    );
    assert_eq!(v["noVal"], "Allowed No Val", "{v}");
    assert_eq!(v["emptyVal"], "Allowed Empty Val", "{v}");
    assert_eq!(v["invalidVal"], "Allowed Invalid Val", "{v}");
    assert_eq!(v["byId"], "Allowed No Val", "{v}");
}

#[test]
fn official_streaming_target_marker_removed() {
    let mut page = open(
        r#"<div id="target" marker="dest-marker">
             <?start name="dest-marker">Original Content<?end>
           </div>
           <template for="dest-marker">
             <span id="child1">One</span>
             <script>
               const target = document.getElementById("target");
               for (const child of Array.from(target.childNodes)) {
                 if (child.nodeType === 7 && child.target === "end") child.remove();
               }
             </script>
             <span id="child2">Two</span>
           </template>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const target = document.getElementById("target");
              const c1 = target && target.querySelector("#child1");
              const c2 = target && target.querySelector("#child2");
              const kids = target ? Array.from(target.childNodes).filter((n) => n.nodeType === 1 && n.tagName.toLowerCase() !== "script") : [];
              return {
                t1: c1 && c1.textContent,
                t2: c2 && c2.textContent,
                n: kids.length,
                id0: kids[0] && kids[0].id,
                id1: kids[1] && kids[1].id,
                tpl: target && target.querySelector("template")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["t1"], "One", "{v}");
    assert_eq!(v["t2"], "Two", "{v}");
    assert_eq!(v["n"], 2, "{v}");
    assert_eq!(v["id0"], "child1", "{v}");
    assert_eq!(v["id1"], "child2", "{v}");
    assert!(v["tpl"].is_null(), "{v}");
}

#[test]
fn official_src_streaming_single_quoted_ids() {
    let mut page = open(
        r#"<div id="container"><?start name="target">Old<?end></div>
           <template for="target" src="../resources/chunked-html.py?delay=300&chunk1=%3Cspan%20id='c1'%3EC1%3C/span%3E&chunk2=%3Cspan%20id='c2'%3EC2%3C/span%3E" id="tpl"></template>"#,
    );
    assert!(page.settle(500).settled);
    page.pump_virtual_time(400);
    let v = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("container");
              return {
                c1: document.getElementById("c1") && document.getElementById("c1").textContent,
                c2: document.getElementById("c2") && document.getElementById("c2").textContent,
                html: c && c.innerHTML.trim().replace(/\s+/g, " ")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["c1"], "C1", "{v}");
    assert_eq!(v["c2"], "C2", "{v}");
}

#[test]
fn official_src_streaming_observer_sees_chunk1_before_chunk2() {
    let mut page = open(
        r#"<div id="container"><?start name="target">Old<?end></div>
           <template for="target" src="../resources/chunked-html.py?delay=300&chunk1=%3Cspan%20id='c1'%3EC1%3C/span%3E&chunk2=%3Cspan%20id='c2'%3EC2%3C/span%3E" id="tpl"></template>
           <script>
             window.__src = { calls: 0, sawC1: false, sawC2AtC1: false, aborted: false };
             (function () {
               const container = document.getElementById("container");
               const tpl = document.getElementById("tpl");
               const finish = () => {
                 window.__src.sawC1 = true;
                 window.__src.sawC2AtC1 = !!document.getElementById("c2");
                 window.__src.aborted = !!(tpl && tpl.__veStreamAborted);
               };
               if (document.getElementById("c1")) { finish(); return; }
               const observer = new MutationObserver(() => {
                 window.__src.calls++;
                 if (document.getElementById("c1")) {
                   observer.disconnect();
                   finish();
                 }
               });
               observer.observe(container, { childList: true, subtree: true });
             })();
           </script>"#,
    );
    page.pump_virtual_time(50);
    let early = page
        .evaluate(
            r##"(function () {
              const tpl = document.getElementById("tpl");
              return {
                sawC1: !!(window.__src && window.__src.sawC1),
                sawC2AtC1: !!(window.__src && window.__src.sawC2AtC1),
                calls: window.__src && window.__src.calls,
                aborted: !!(window.__src && window.__src.aborted) || !!(tpl && tpl.__veStreamAborted),
                patched: !!(tpl && tpl.__vePatched),
                c1: !!(document.getElementById("c1")),
                c2: !!(document.getElementById("c2"))
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(early["c1"], true, "chunk1 missing after 50ms: {early}");
    assert_eq!(early["c2"], false, "chunk2 applied too early: {early}");
    assert_eq!(
        early["sawC1"], true,
        "MutationObserver missed chunk1: {early}"
    );
    assert_eq!(
        early["sawC2AtC1"], false,
        "observer saw chunk2 with chunk1: {early}"
    );
    assert_eq!(early["aborted"], false, "src stream aborted: {early}");
    page.pump_virtual_time(400);
    let late = page
        .evaluate(
            r##"(function () {
              const c = document.getElementById("container");
              return {
                c1: document.getElementById("c1") && document.getElementById("c1").textContent,
                c2: document.getElementById("c2") && document.getElementById("c2").textContent,
                html: c && c.innerHTML.trim().replace(/\s+/g, " ")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(late["c1"], "C1", "{late}");
    assert_eq!(late["c2"], "C2", "{late}");
    assert_eq!(
        late["html"], "<span id=\"c1\">C1</span><span id=\"c2\">C2</span>",
        "{late}"
    );
}

#[test]
fn official_src_policy_cors_nonce_sri() {
    let mut page = open(
        r#"<div id="cors-ok"><?start name="c-ok">Old<?end></div>
           <template for="c-ok" src="http://www1.web-platform.test:80/x.py?cors=1&chunk1=CORS_OK"></template>
           <div id="cors-bad"><?start name="c-bad">Old<?end></div>
           <template for="c-bad" src="http://www1.web-platform.test:80/x.py?cors=0&chunk1=CORS_FAIL"></template>
           <div id="sri-ok"><?start name="s-ok">Old<?end></div>
           <template for="s-ok" src="http://www1.web-platform.test:80/x.py?cors=1&chunk1=SRI_OK" integrity="sha256-B9fOqAtaB7EXwH61rP5cQQlWSqoRukf/UC9TatLkCec="></template>
           <div id="sri-bad"><?start name="s-bad">Old<?end></div>
           <template for="s-bad" src="http://www1.web-platform.test:80/x.py?cors=1&chunk1=SRI_OK" integrity="sha256-mismatchedhashmismatchedhashmismatchedhash="></template>"#,
    );
    assert!(page.settle(200).settled);
    page.pump_virtual_time(50);
    let v = page
        .evaluate(
            r##"(function () {
              return {
                corsOk: document.getElementById("cors-ok").textContent.includes("CORS_OK"),
                corsBad: document.getElementById("cors-bad").textContent.includes("CORS_FAIL"),
                sriOk: document.getElementById("sri-ok").textContent.includes("SRI_OK"),
                sriBad: document.getElementById("sri-bad").textContent.includes("SRI_OK")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["corsOk"], true, "{v}");
    assert_eq!(v["corsBad"], false, "{v}");
    assert_eq!(v["sriOk"], true, "{v}");
    assert_eq!(v["sriBad"], false, "{v}");
}

#[test]
fn official_src_policy_nonce() {
    let mut page = open(
        r#"<meta http-equiv="Content-Security-Policy" content="script-src 'nonce-correctnonce' 'unsafe-inline';">
           <div id="ok"><?start name="n-ok">Old<?end></div>
           <template for="n-ok" nonce="correctnonce" src="/x.py?chunk1=NONCE_OK"></template>
           <div id="bad"><?start name="n-bad">Old<?end></div>
           <template for="n-bad" nonce="wrongnonce" src="/x.py?chunk1=NONCE_FAIL"></template>"#,
    );
    assert!(page.settle(200).settled);
    page.pump_virtual_time(50);
    let v = page
        .evaluate(
            r##"(function () {
              return {
                nonceOk: document.getElementById("ok").textContent.includes("NONCE_OK"),
                nonceBad: document.getElementById("bad").textContent.includes("NONCE_FAIL")
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["nonceOk"], true, "{v}");
    assert_eq!(v["nonceBad"], false, "{v}");
}

#[test]
fn iframe_srcdoc_applies_template_for() {
    let mut page = open(
        r#"<iframe id="f" srcdoc="<!DOCTYPE html><div id='target'><?start name='t'>Old<?end></div><template for='t'><span id='child1'>One</span><span id='child2'>Two</span></template>"></iframe>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const f = document.getElementById("f");
              const d = f && f.contentDocument;
              const t = d && d.getElementById("target");
              return {
                c1: t && t.querySelector("#child1") && t.querySelector("#child1").textContent,
                c2: t && t.querySelector("#child2") && t.querySelector("#child2").textContent
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["c1"], "One", "{v}");
    assert_eq!(v["c2"], "Two", "{v}");
}

#[test]
fn pump_virtual_time_completes_pending_fetch() {
    let mut page = open("<p>f</p>");
    let _ = page.evaluate(
        r##"(async function () {
          const t = await (await fetch("data:text/plain,ok")).text();
          window.__got = t;
        })()"##,
    );
    page.pump_virtual_time(50);
    let v = page.evaluate("window.__got").unwrap();
    assert_eq!(
        v, "ok",
        "fetch after a timer must finish during pump_virtual_time"
    );
}

#[test]
fn pump_virtual_time_does_not_jump_past_horizon() {
    let mut page = open("<p>f</p>");
    let _ = page.evaluate(
        r##"(function () {
          window.__late = false;
          setTimeout(function () { window.__late = true; }, 300);
        })()"##,
    );
    page.pump_virtual_time(50);
    let early = page.evaluate("window.__late").unwrap();
    assert_eq!(early, false, "300ms timer must not fire in a 50ms pump");
    page.pump_virtual_time(300);
    let late = page.evaluate("window.__late").unwrap();
    assert_eq!(
        late, true,
        "300ms timer must fire once the horizon covers it"
    );
}

#[test]
fn pump_virtual_time_finishes_second_timeout_then_fetch() {
    let mut page = open("<p>f</p>");
    let _ = page.evaluate(
        r##"(async function () {
          await new Promise((r) => setTimeout(r, 500));
          window.__a = await (await fetch("data:text/plain,one")).text();
          await new Promise((r) => setTimeout(r, 500));
          window.__b = await (await fetch("data:text/plain,two")).text();
        })()"##,
    );
    page.pump_virtual_time(200);
    let mid = page
        .evaluate(r#"(function(){return {a: window.__a, b: window.__b};})()"#)
        .unwrap();
    assert!(
        mid["a"].is_null(),
        "500ms wait must not fire in a 200ms pump: {mid}"
    );
    assert!(mid["b"].is_null(), "{mid}");
    page.pump_virtual_time(400);
    let after_first = page
        .evaluate(r#"(function(){return {a: window.__a, b: window.__b};})()"#)
        .unwrap();
    assert_eq!(after_first["a"], "one", "{after_first}");
    assert!(
        after_first["b"].is_null(),
        "second 500ms wait must stay pending: {after_first}"
    );
    page.pump_virtual_time(500);
    let v = page
        .evaluate(r#"(function(){return {a: window.__a, b: window.__b};})()"#)
        .unwrap();
    assert_eq!(v["a"], "one", "{v}");
    assert_eq!(v["b"], "two", "{v}");
}

#[test]
fn pump_virtual_time_long_horizon_finishes_timeout_fetch_chain() {
    let mut page = open("<p>f</p>");
    let _ = page.evaluate(
        r##"(async function () {
          await new Promise((r) => setTimeout(r, 500));
          window.__a = await (await fetch("data:text/plain,one")).text();
          await new Promise((r) => setTimeout(r, 500));
          window.__b = await (await fetch("data:text/plain,two")).text();
        })()"##,
    );
    page.pump_virtual_time(10_000);
    let v = page
        .evaluate(r#"(function(){return {a: window.__a, b: window.__b};})()"#)
        .unwrap();
    assert_eq!(v["a"], "one", "{v}");
    assert_eq!(v["b"], "two", "{v}");
}

#[test]
fn stream_lock_bodyused() {
    let mut page = open("<p>s</p>");
    let _ = page.evaluate(
        r##"(async function () {
          const r = await fetch("data:text/plain,hello");
          const reader = r.body.getReader();
          let secondThrew = false;
          try { r.body.getReader(); } catch (e) { secondThrew = String(e).includes("locked"); }
          const chunk = await reader.read();
          window.__streamLock = {
            secondThrew: secondThrew,
            bodyUsed: r.bodyUsed,
            gotBytes: !!(chunk && chunk.value && chunk.value.length)
          };
        })()"##,
    );
    page.pump_virtual_time(50);
    assert!(page.settle(200).settled);
    let v = page.evaluate("window.__streamLock").unwrap();
    assert_eq!(v["secondThrew"], true, "{v}");
    assert_eq!(v["bodyUsed"], true, "{v}");
    assert_eq!(v["gotBytes"], true, "{v}");
}

#[test]
fn already_focused_input_does_not_refire_focus() {
    let mut page = open(r#"<input id="n" autofocus>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var n = document.getElementById("n");
              n.focus();
              var hits = 0;
              n.addEventListener("focus", function () { hits++; });
              n.addEventListener("focusin", function () { hits++; });
              n.focus();
              n.focus();
              return { hits: hits, active: document.activeElement === n };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["hits"], 0, "{v}");
    assert_eq!(v["active"], true, "{v}");
}

#[test]
fn wheel_event_exposes_delta_and_client_coords() {
    let mut page = open("<div id='d'></div>");
    let v = page
        .evaluate(
            r##"(function () {
              var ev = new WheelEvent("wheel", {
                clientX: 200, clientY: 200, deltaMode: 0, delta: -10, deltaY: -10, bubbles: true
              });
              return {
                ctor: ev.constructor.name,
                type: ev.type,
                clientX: ev.clientX,
                clientY: ev.clientY,
                deltaY: ev.deltaY,
                deltaMode: ev.deltaMode,
                bubbles: ev.bubbles
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ctor"], "WheelEvent", "{v}");
    assert_eq!(v["type"], "wheel", "{v}");
    assert_eq!(v["clientX"], 200, "{v}");
    assert_eq!(v["deltaY"], -10, "{v}");
    assert_eq!(v["deltaMode"], 0, "{v}");
    assert_eq!(v["bubbles"], true, "{v}");
}

#[test]
fn content_onclick_attribute_still_runs() {
    let mut page =
        open(r#"<button id="b" onclick="window.__hit = (window.__hit||0)+1">Go</button>"#);
    let v = page
        .evaluate(
            r##"(function () {
              var b = document.getElementById("b");
              b.click();
              var ev = new Event("click", { bubbles: true });
              b.dispatchEvent(ev);
              return { hit: window.__hit };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["hit"], 2, "{v}");
}

#[test]
fn todomvc_es5_measured_phases() {
    use std::time::Instant;
    let t0 = Instant::now();
    let mut page = open(
        r#"<section>
             <input class="new-todo" placeholder="What needs to be done?">
             <ul class="todo-list"></ul>
             <span class="todo-count">0</span>
             <script>
               (function () {
                 var list = document.querySelector(".todo-list");
                 var input = document.querySelector(".new-todo");
                 var count = document.querySelector(".todo-count");
                 function render() {
                   count.textContent = String(list.children.length);
                 }
                 input.addEventListener("keydown", function (e) {
                   if (e.key !== "Enter" || !input.value) return;
                   var li = document.createElement("li");
                   li.innerHTML = "<label>" + input.value + "</label><button class=destroy></button>";
                   list.appendChild(li);
                   input.value = "";
                   render();
                 });
                 list.addEventListener("click", function (e) {
                   if (e.target && e.target.className === "destroy") {
                     var li = e.target.parentNode;
                     li.parentNode.removeChild(li);
                     render();
                   }
                 });
                 window.__todoReady = true;
               })();
             </script>
           </section>"#,
    );
    let open_ms = t0.elapsed().as_millis() as u64;
    let t1 = Instant::now();
    assert!(page.settle(200).settled);
    let settle_ms = t1.elapsed().as_millis() as u64;
    let t2 = Instant::now();
    let v = page
        .evaluate(
            r##"(function () {
              var input = document.querySelector(".new-todo");
              for (var i = 0; i < 50; i++) {
                input.value = "item-" + i;
                input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
              }
              var n = document.querySelectorAll(".todo-list li").length;
              document.querySelector(".destroy").click();
              return { ready: window.__todoReady === true, n: n, after: document.querySelectorAll(".todo-list li").length };
            })()"##,
        )
        .unwrap();
    let js_ms = t2.elapsed().as_millis() as u64;
    let t3 = Instant::now();
    let _ = page.observe(&ObservationRequest::default());
    let observe_ms = t3.elapsed().as_millis() as u64;
    assert_eq!(v["ready"], true, "{v}");
    assert_eq!(v["n"], 50, "{v}");
    assert_eq!(v["after"], 49, "{v}");
    assert!(open_ms + settle_ms + js_ms + observe_ms > 0);
    if let Ok(path) = std::env::var("VECTOR_TODOMVC_ATTRIBUTION_OUT") {
        let total = open_ms + settle_ms + js_ms + observe_ms;
        let json = serde_json::json!({
            "label": "speedometer.3.0.TodoMVC-JavaScript-ES5",
            "artifact": {
                "engine": "vector-engine",
                "review": "Vector_Current_Review_60b2d41",
                "measured": true,
                "note": "Timed on this host from bindings todomvc_es5_measured_phases. Adapted workload, not an official Speedometer score."
            },
            "samples_ms": [total],
            "phases": {
                "openMs": open_ms,
                "jsMs": js_ms,
                "settleMs": settle_ms,
                "observeMs": observe_ms
            },
            "accountedMs": total,
            "unaccountedMs": 0,
            "errors": [],
            "retries": 0,
            "success": true,
            "officialSuite": false,
            "heldOut": false,
            "synthetic": false
        });
        let _ = std::fs::write(path, serde_json::to_string_pretty(&json).unwrap());
    }
}

#[test]
fn html_collection_types_match_html_idl() {
    let mut page = open(
        r#"<form id="f" name="f">
             <input id="n" name="n" value="Ada">
             <input type="radio" name="color" value="red" checked>
             <input type="radio" name="color" value="blue">
             <select id="s" name="s"><option value="a" selected>A</option><option value="b">B</option></select>
           </form>
           <img id="im" alt="i">
           <p id="p">x</p>
           <p id="dup">one</p>
           <div id="dup">two</div>"#,
    );
    assert!(page.settle(200).settled);
    let v = page
        .evaluate(
            r##"(function () {
              const all = document.all;
              const form = document.getElementById("f");
              const select = document.getElementById("s");
              const radios = form.elements.namedItem("color");
              return {
                allTag: Object.prototype.toString.call(all),
                allIsAll: all instanceof HTMLAllCollection,
                allNotCollection: !(all instanceof HTMLCollection),
                allLength: all.length > 0,
                allNamed: all.namedItem("p") && all.namedItem("p").id === "p",
                allItemIndex: all.item(0) !== null,
                allTypeof: typeof all,
                allLoose: all == null,
                allStrict: all === undefined,
                allCall: all("p") && all("p").id === "p",
                allCtor: typeof HTMLAllCollection === "function",
                allCtorLen: HTMLAllCollection.length,
                allItemLen: HTMLAllCollection.prototype.item.length,
                allNewThrows: (function () { try { new HTMLAllCollection(); return false; } catch (e) { return e instanceof TypeError; } })(),
                formNewThrows: (function () { try { new HTMLFormControlsCollection(); return false; } catch (e) { return e instanceof TypeError; } })(),
                radioProto: Object.getPrototypeOf(RadioNodeList.prototype) === NodeList.prototype,
                radioCtorProto: Object.getPrototypeOf(RadioNodeList) === NodeList,
                formHasOwn: typeof form.elements.hasOwnProperty === "function",
                optionsHasOwn: typeof select.options.hasOwnProperty === "function",
                imagesIn: document.images.length >= 1 && (0 in document.images)
                  && [].slice.call(document.images).length === document.images.length,
                namedItemArgc: (function () { try { form.elements.namedItem(); return false; } catch (e) { return e instanceof TypeError; } })(),
                addArgc: (function () { try { select.options.add(); return false; } catch (e) { return e instanceof TypeError; } })(),
                removeArgc: (function () { try { select.options.remove(); return false; } catch (e) { return e instanceof TypeError; } })(),
                formTag: Object.prototype.toString.call(form.elements),
                formIsControls: form.elements instanceof HTMLFormControlsCollection,
                namedInput: form.elements.namedItem("n") && form.elements.namedItem("n").value === "Ada",
                radioTag: Object.prototype.toString.call(radios),
                radioIsList: radios instanceof RadioNodeList,
                radioValue: radios.value,
                optionsTag: Object.prototype.toString.call(select.options),
                optionsIsOptions: select.options instanceof HTMLOptionsCollection,
                optionsLength: select.options.length,
                optionsSelected: select.options.selectedIndex
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["allTag"], "[object HTMLAllCollection]", "{v}");
    assert_eq!(v["allIsAll"], true, "{v}");
    assert_eq!(v["allNotCollection"], true, "{v}");
    assert_eq!(v["allLength"], true, "{v}");
    assert_eq!(v["allNamed"], true, "{v}");
    assert_eq!(v["allItemIndex"], true, "{v}");
    assert_eq!(v["allTypeof"], "undefined", "{v}");
    assert_eq!(v["allLoose"], true, "{v}");
    assert_eq!(v["allStrict"], false, "{v}");
    assert_eq!(v["allCall"], true, "{v}");
    assert_eq!(v["allCtor"], true, "{v}");
    assert_eq!(v["allCtorLen"], 0, "{v}");
    assert_eq!(v["allItemLen"], 0, "{v}");
    assert_eq!(v["allNewThrows"], true, "{v}");
    assert_eq!(v["formNewThrows"], true, "{v}");
    assert_eq!(v["radioProto"], true, "{v}");
    assert_eq!(v["radioCtorProto"], true, "{v}");
    assert_eq!(v["formHasOwn"], true, "{v}");
    assert_eq!(v["optionsHasOwn"], true, "{v}");
    assert_eq!(v["imagesIn"], true, "{v}");
    assert_eq!(v["namedItemArgc"], true, "{v}");
    assert_eq!(v["addArgc"], true, "{v}");
    assert_eq!(v["removeArgc"], true, "{v}");
    assert_eq!(v["formTag"], "[object HTMLFormControlsCollection]", "{v}");
    assert_eq!(v["formIsControls"], true, "{v}");
    assert_eq!(v["namedInput"], true, "{v}");
    assert_eq!(v["radioTag"], "[object RadioNodeList]", "{v}");
    assert_eq!(v["radioIsList"], true, "{v}");
    assert_eq!(v["radioValue"], "red", "{v}");
    assert_eq!(v["optionsTag"], "[object HTMLOptionsCollection]", "{v}");
    assert_eq!(v["optionsIsOptions"], true, "{v}");
    assert_eq!(v["optionsLength"], 2, "{v}");
    assert_eq!(v["optionsSelected"], 0, "{v}");
}

#[test]
fn official_html_element_brands_match_idlharness_objects() {
    let mut page = open("<body></body>");
    let v = page
        .evaluate(
            r##"(function () {
              const tags = {
                HTMLHRElement: "hr",
                HTMLPreElement: "pre",
                HTMLQuoteElement: "blockquote",
                HTMLOListElement: "ol",
                HTMLUListElement: "ul",
                HTMLLIElement: "li",
                HTMLDListElement: "dl",
                HTMLHeadingElement: "h1",
                HTMLBRElement: "br",
                HTMLModElement: "ins",
                HTMLPictureElement: "picture",
                HTMLVideoElement: "video",
                HTMLAudioElement: "audio",
                HTMLTrackElement: "track",
                HTMLTableElement: "table",
                HTMLTableCaptionElement: "caption",
                HTMLLabelElement: "label",
                HTMLUnknownElement: "bgsound",
              };
              const out = {};
              for (const [iface, tag] of Object.entries(tags)) {
                const el = document.createElement(tag);
                out[iface] = {
                  tag: Object.prototype.toString.call(el),
                  inst: el instanceof window[iface],
                  html: el instanceof HTMLElement,
                };
              }
              const listing = document.createElement("listing");
              const xmp = document.createElement("xmp");
              const img = new Image(10, 20);
              const audio = new Audio("data:,");
              const opt = new Option("t", "v");
              const video = document.createElement("video");
              video.src = "data:,";
              const track = document.createElement("track");
              const added = video.addTextTrack("subtitles");
              return {
                brands: out,
                listingPre: listing instanceof HTMLPreElement,
                xmpPre: xmp instanceof HTMLPreElement,
                listingTag: Object.prototype.toString.call(listing),
                imgInst: img instanceof HTMLImageElement,
                audioInst: audio instanceof HTMLAudioElement,
                audioErr: audio.error instanceof MediaError,
                optInst: opt instanceof HTMLOptionElement,
                optText: opt.text,
                videoMedia: video instanceof HTMLMediaElement,
                videoBuf: video.buffered instanceof TimeRanges,
                videoTracks: video.textTracks instanceof TextTrackList,
                addedCue: added.cues instanceof TextTrackCueList,
                trackObj: track.track instanceof TextTrack,
                validity: document.createElement("input").validity instanceof ValidityState,
                ancestors: location.ancestorOrigins instanceof DOMStringList,
                external: window.external instanceof External,
                pop: new PopStateEvent("popstate", { state: {} }).state,
                toggle: new ToggleEvent("beforetoggle") instanceof ToggleEvent,
                formData: new FormDataEvent("formdata", { formData: new FormData() }) instanceof FormDataEvent,
                trackEv: new TrackEvent("addtrack", { track: track.track }).track instanceof TextTrack,
              };
            })()"##,
        )
        .unwrap();
    for iface in [
        "HTMLHRElement",
        "HTMLPreElement",
        "HTMLQuoteElement",
        "HTMLOListElement",
        "HTMLUListElement",
        "HTMLLIElement",
        "HTMLDListElement",
        "HTMLHeadingElement",
        "HTMLBRElement",
        "HTMLModElement",
        "HTMLPictureElement",
        "HTMLVideoElement",
        "HTMLAudioElement",
        "HTMLTrackElement",
        "HTMLTableElement",
        "HTMLTableCaptionElement",
        "HTMLLabelElement",
        "HTMLUnknownElement",
    ] {
        let row = &v["brands"][iface];
        assert_eq!(row["tag"], format!("[object {iface}]"), "{iface} {v}");
        assert_eq!(row["inst"], true, "{iface} {v}");
        assert_eq!(row["html"], true, "{iface} {v}");
    }
    assert_eq!(v["listingPre"], true, "{v}");
    assert_eq!(v["xmpPre"], true, "{v}");
    assert_eq!(v["listingTag"], "[object HTMLPreElement]", "{v}");
    assert_eq!(v["imgInst"], true, "{v}");
    assert_eq!(v["audioInst"], true, "{v}");
    assert_eq!(v["audioErr"], true, "{v}");
    assert_eq!(v["optInst"], true, "{v}");
    assert_eq!(v["optText"], "t", "{v}");
    assert_eq!(v["videoMedia"], true, "{v}");
    assert_eq!(v["videoBuf"], true, "{v}");
    assert_eq!(v["videoTracks"], true, "{v}");
    assert_eq!(v["addedCue"], true, "{v}");
    assert_eq!(v["trackObj"], true, "{v}");
    assert_eq!(v["validity"], true, "{v}");
    assert_eq!(v["ancestors"], true, "{v}");
    assert_eq!(v["external"], true, "{v}");
    assert_eq!(v["toggle"], true, "{v}");
    assert_eq!(v["formData"], true, "{v}");
    assert_eq!(v["trackEv"], true, "{v}");
}

#[test]
fn htmlelement_idl_members_match_official_interface() {
    let mut page = open("<p id=t>x</p>");
    let v = page
        .evaluate(
            r##"(function () {
              const el = document.getElementById("t");
              const proto = HTMLElement.prototype;
              let datasetThrew = false;
              try { void proto.dataset; } catch (e) { datasetThrew = e instanceof TypeError; }
              el.popover = "auto";
              const opened = el.togglePopover();
              el.hidePopover();
              let internalsThrew = false;
              try { el.attachInternals(); } catch (e) { internalsThrew = e.name === "NotSupportedError"; }
              return {
                writing: el.writingSuggestions,
                writingOnProto: "writingSuggestions" in proto,
                autocorrect: el.autocorrect,
                headingOffset: el.headingOffset,
                headingReset: el.headingReset,
                attach: typeof proto.attachInternals === "function",
                show: typeof proto.showPopover === "function",
                hide: typeof proto.hidePopover === "function",
                toggle: typeof proto.togglePopover === "function",
                opened,
                datasetThrew,
                datasetOwn: Object.prototype.hasOwnProperty.call(proto, "dataset"),
                onEnter: proto.onmouseenter,
                onClickThrew: (function () { try { void proto.onclick; return false; } catch (e) { return e instanceof TypeError; } })(),
                toggleLen: proto.togglePopover.length,
                internalsThrew,
                internalsCtor: typeof ElementInternals === "function",
                dataset: typeof el.dataset === "object",
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["writing"], "true", "{v}");
    assert_eq!(v["writingOnProto"], true, "{v}");
    assert_eq!(v["autocorrect"], true, "{v}");
    assert_eq!(v["headingOffset"], 0, "{v}");
    assert_eq!(v["headingReset"], false, "{v}");
    assert_eq!(v["attach"], true, "{v}");
    assert_eq!(v["show"], true, "{v}");
    assert_eq!(v["hide"], true, "{v}");
    assert_eq!(v["toggle"], true, "{v}");
    assert_eq!(v["opened"], true, "{v}");
    assert_eq!(v["datasetThrew"], true, "{v}");
    assert_eq!(v["datasetOwn"], true, "{v}");
    assert_eq!(v["onEnter"], serde_json::Value::Null, "{v}");
    assert_eq!(v["onClickThrew"], true, "{v}");
    assert_eq!(v["toggleLen"], 0, "{v}");
    assert_eq!(v["internalsThrew"], true, "{v}");
    assert_eq!(v["internalsCtor"], true, "{v}");
    assert_eq!(v["dataset"], true, "{v}");
}

#[test]
fn official_html_link_media_body_and_eventsource_idl() {
    let mut page =
        open("<title>Hi</title><link id=l rel=stylesheet><body><video id=v></video></body>");
    let v = page
        .evaluate(
            r##"(function () {
              const title = document.querySelector("title");
              const link = document.getElementById("l");
              const video = document.getElementById("v");
              let canPlayThrew = false;
              try { video.canPlayType(); } catch (e) { canPlayThrew = e instanceof TypeError; }
              let customThrew = false;
              try { document.createElement("object").setCustomValidity(); } catch (e) { customThrew = e instanceof TypeError; }
              let fillThrew = false;
              try { document.createElement("canvas").getContext("2d").fillRect(); } catch (e) { fillThrew = e instanceof TypeError; }
              const es = new EventSource("http://invalid");
              return {
                titleText: title.text,
                titleOwn: "text" in HTMLTitleElement.prototype,
                sizes: link.sizes && typeof link.sizes.add === "function",
                imageSrcset: "imageSrcset" in HTMLLinkElement.prototype,
                imageSizes: "imageSizes" in HTMLLinkElement.prototype,
                fetchPriority: link.fetchPriority,
                bodyAfter: "onafterprint" in HTMLBodyElement.prototype,
                canPlay: typeof HTMLMediaElement.prototype.canPlayType === "function",
                canPlayThrew,
                customThrew,
                fillThrew,
                setHtmlLen: Element.prototype.setHTML.length,
                esUrl: typeof es.url === "string",
                esClosed: es.readyState === EventSource.CLOSED,
                esTag: Object.prototype.toString.call(es),
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["titleText"], "Hi", "{v}");
    assert_eq!(v["titleOwn"], true, "{v}");
    assert_eq!(v["sizes"], true, "{v}");
    assert_eq!(v["imageSrcset"], true, "{v}");
    assert_eq!(v["imageSizes"], true, "{v}");
    assert_eq!(v["fetchPriority"], "auto", "{v}");
    assert_eq!(v["bodyAfter"], true, "{v}");
    assert_eq!(v["canPlay"], true, "{v}");
    assert_eq!(v["canPlayThrew"], true, "{v}");
    assert_eq!(v["customThrew"], true, "{v}");
    assert_eq!(v["fillThrew"], true, "{v}");
    assert_eq!(v["setHtmlLen"], 1, "{v}");
    assert_eq!(v["esUrl"], true, "{v}");
    assert_eq!(v["esClosed"], true, "{v}");
    assert_eq!(v["esTag"], "[object EventSource]", "{v}");
}

#[test]
fn official_html_reflect_and_media_state_idl() {
    let mut page = open(
        r#"<iframe id=f></iframe><img id=i src="x.png"><form id=fm rel="noopener"><details id=d name=n></details><dialog id=g></dialog><script id=s></script><source id=so width=1><template id=t></template><button id=b command=show-modal></button><video id=v src="m.mp4"></video>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              const iframe = document.getElementById("f");
              const img = document.getElementById("i");
              const form = document.getElementById("fm");
              const details = document.getElementById("d");
              const dialog = document.getElementById("g");
              const script = document.getElementById("s");
              const source = document.getElementById("so");
              const tpl = document.getElementById("t");
              const btn = document.getElementById("b");
              const video = document.getElementById("v");
              dialog.returnValue = "ok";
              tpl.setAttribute("shadowrootmode", "open");
              return {
                sandbox: iframe.sandbox && typeof iframe.sandbox.add === "function",
                allow: "allow" in HTMLIFrameElement.prototype,
                loading: iframe.loading,
                imgSizes: "sizes" in HTMLImageElement.prototype,
                imgFetch: img.fetchPriority,
                currentSrc: typeof img.currentSrc === "string",
                formRel: form.rel,
                formRelList: form.relList && typeof form.relList.contains === "function",
                detailsName: details.name,
                dialogClosedBy: "closedBy" in HTMLDialogElement.prototype,
                dialogRet: dialog.returnValue,
                scriptFetch: script.fetchPriority,
                sourceW: source.width,
                tplFor: "htmlFor" in HTMLTemplateElement.prototype,
                tplMode: tpl.shadowRootMode,
                command: btn.command,
                net: video.networkState === HTMLMediaElement.NETWORK_IDLE,
                have: video.readyState === HTMLMediaElement.HAVE_NOTHING,
                paused: video.paused === true,
                vol: video.volume === 1,
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["sandbox"], true, "{v}");
    assert_eq!(v["allow"], true, "{v}");
    assert_eq!(v["loading"], "eager", "{v}");
    assert_eq!(v["imgSizes"], true, "{v}");
    assert_eq!(v["imgFetch"], "auto", "{v}");
    assert_eq!(v["currentSrc"], true, "{v}");
    assert_eq!(v["formRel"], "noopener", "{v}");
    assert_eq!(v["formRelList"], true, "{v}");
    assert_eq!(v["detailsName"], "n", "{v}");
    assert_eq!(v["dialogClosedBy"], true, "{v}");
    assert_eq!(v["dialogRet"], "ok", "{v}");
    assert_eq!(v["scriptFetch"], "auto", "{v}");
    assert_eq!(v["sourceW"], 1, "{v}");
    assert_eq!(v["tplFor"], true, "{v}");
    assert_eq!(v["tplMode"], "open", "{v}");
    assert_eq!(v["command"], "show-modal", "{v}");
    assert_eq!(v["net"], true, "{v}");
    assert_eq!(v["have"], true, "{v}");
    assert_eq!(v["paused"], true, "{v}");
    assert_eq!(v["vol"], true, "{v}");
}

#[test]
fn official_html_table_input_select_and_label_idl() {
    let mut page = open(
        r#"<form id=fm><table id=tb><caption>c</caption><thead><tr><th>h</th></tr></thead><tbody><tr><td>d</td></tr></tbody></table><label id=lb for=in>L</label><input id=in type=number value=4 list=dl><select id=sel><option selected>a</option><option>b</option></select><progress id=pr value=2 max=4></progress><map id=mp name=m><area id=ar></map><a id=a href="/">t</a><datalist id=dl><option value=x></datalist><textarea id=ta>hi</textarea></form>"#,
    );
    let v = page
        .evaluate(
            r##"(function () {
              const table = document.getElementById("tb");
              const row = table.rows[1];
              const cell = row.cells[0];
              const input = document.getElementById("in");
              const select = document.getElementById("sel");
              const label = document.getElementById("lb");
              const progress = document.getElementById("pr");
              const map = document.getElementById("mp");
              const a = document.getElementById("a");
              const list = document.getElementById("dl");
              const ta = document.getElementById("ta");
              const inserted = table.insertRow();
              inserted.insertCell();
              let delRowThrew = false;
              try { table.deleteRow(); } catch (e) { delRowThrew = e instanceof TypeError; }
              let rangeThrew = false;
              try { input.setRangeText(); } catch (e) { rangeThrew = e instanceof TypeError; }
              input.stepUp();
              input.select();
              ta.select();
              return {
                caption: table.caption && table.caption.textContent === "c",
                tHead: table.tHead instanceof HTMLTableSectionElement,
                tBodies: table.tBodies.length >= 1,
                rows: table.rows.length >= 3,
                rowIndex: row.rowIndex,
                cellIndex: cell.cellIndex,
                createCap: typeof HTMLTableElement.prototype.createCaption === "function",
                delRowThrew,
                filesTag: Object.prototype.toString.call(input.files),
                filesInst: input.files instanceof FileList,
                valueAsNumber: typeof input.valueAsNumber === "number",
                valueAsDate: input.valueAsDate === null,
                list: input.list === list,
                selStart: "selectionStart" in HTMLInputElement.prototype,
                form: input.form === document.getElementById("fm"),
                will: input.willValidate === true,
                validity: input.validity instanceof ValidityState,
                labels: input.labels.length === 1 && input.labels[0] === label,
                selected: select.selectedOptions.length === 1,
                selectType: select.type === "select-one",
                areas: map.areas.length === 1,
                aText: a.text,
                listOpts: list.options.length === 1,
                progressPos: progress.position,
                labelControl: label.control === input,
                rangeThrew,
                showPicker: typeof HTMLInputElement.prototype.showPicker === "function",
                stepUp: typeof HTMLInputElement.prototype.stepUp === "function",
                taType: ta.type === "textarea",
                taLen: ta.textLength,
                protoOwn: Object.prototype.hasOwnProperty.call(HTMLInputElement.prototype, "setCustomValidity"),
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["caption"], true, "{v}");
    assert_eq!(v["tHead"], true, "{v}");
    assert_eq!(v["tBodies"], true, "{v}");
    assert_eq!(v["rows"], true, "{v}");
    assert_eq!(v["rowIndex"], 1, "{v}");
    assert_eq!(v["cellIndex"], 0, "{v}");
    assert_eq!(v["createCap"], true, "{v}");
    assert_eq!(v["delRowThrew"], true, "{v}");
    assert_eq!(v["filesTag"], "[object FileList]", "{v}");
    assert_eq!(v["filesInst"], true, "{v}");
    assert_eq!(v["valueAsNumber"], true, "{v}");
    assert_eq!(v["valueAsDate"], true, "{v}");
    assert_eq!(v["list"], true, "{v}");
    assert_eq!(v["selStart"], true, "{v}");
    assert_eq!(v["form"], true, "{v}");
    assert_eq!(v["will"], true, "{v}");
    assert_eq!(v["validity"], true, "{v}");
    assert_eq!(v["labels"], true, "{v}");
    assert_eq!(v["selected"], true, "{v}");
    assert_eq!(v["selectType"], true, "{v}");
    assert_eq!(v["areas"], true, "{v}");
    assert_eq!(v["aText"], "t", "{v}");
    assert_eq!(v["listOpts"], true, "{v}");
    assert_eq!(v["progressPos"], 0.5, "{v}");
    assert_eq!(v["labelControl"], true, "{v}");
    assert_eq!(v["rangeThrew"], true, "{v}");
    assert_eq!(v["showPicker"], true, "{v}");
    assert_eq!(v["stepUp"], true, "{v}");
    assert_eq!(v["taType"], true, "{v}");
    assert_eq!(v["taLen"], 2, "{v}");
    assert_eq!(v["protoOwn"], true, "{v}");
}

#[test]
fn official_html_brand_window_and_media_idl() {
    let mut page =
        open("<video id=v src=m.mp4></video><input id=i><a name=n href=/></a><canvas id=c>");
    let v = page
        .evaluate(
            r##"(function () {
              let inputAcceptThrew = false;
              try { void HTMLInputElement.prototype.accept; } catch (e) { inputAcceptThrew = e instanceof TypeError; }
              let svgOnclickThrew = false;
              try { void SVGElement.prototype.onclick; } catch (e) { svgOnclickThrew = e instanceof TypeError; }
              const ownAbort = Object.getOwnPropertyDescriptor(window, "onabort");
              const protoHasAbort = "onabort" in Window.prototype;
              const loose = ownAbort && ownAbort.get && ownAbort.get.call(undefined);
              let sanGet = false;
              try { sanGet = typeof new Sanitizer({}).get === "function"; } catch (e) {}
              const video = document.getElementById("v");
              const ctx = document.getElementById("c").getContext("2d");
              let locThrew = false;
              try { new Location(); } catch (e) { locThrew = e instanceof TypeError; }
              let mediaThrew = false;
              try { new HTMLMediaElement(); } catch (e) { mediaThrew = e instanceof TypeError; }
              let playRejected = false;
              try {
                const p = HTMLMediaElement.prototype.play.call({});
                if (p && typeof p.then === "function") {
                  p.then(function () {}, function (e) { playRejected = e instanceof TypeError; });
                }
              } catch (e) { playRejected = e instanceof TypeError; }
              return {
                inputAcceptThrew,
                svgOnclickThrew,
                ownAbort: !!(ownAbort && ownAbort.get),
                protoHasAbort,
                looseOk: loose === window.onabort,
                createCapName: HTMLTableElement.prototype.createCaption.name,
                insertRowLen: HTMLTableElement.prototype.insertRow.length,
                setTimeoutLen: setTimeout.length,
                clearTimeoutLen: clearTimeout.length,
                setIntervalLen: setInterval.length,
                netIdle: video.NETWORK_IDLE === 1,
                play: typeof HTMLMediaElement.prototype.play === "function",
                getHTML: typeof Element.prototype.getHTML === "function",
                navInst: navigator instanceof Navigator,
                storeInst: localStorage instanceof Storage,
                isSecure: isSecureContext === true,
                report: typeof reportError === "function",
                offscreen: typeof OffscreenCanvasRenderingContext2D === "function",
                sanLen: Sanitizer.length,
                sanGet,
                ctxLen: CanvasRenderingContext2D.length,
                ctxCanvas: Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "canvas") != null,
                ctxFill: Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "fillStyle") != null,
                rotateLen: CanvasRenderingContext2D.prototype.rotate.length,
                linGradLen: CanvasRenderingContext2D.prototype.createLinearGradient.length,
                navProtoUA: Object.getOwnPropertyDescriptor(Navigator.prototype, "userAgent") != null,
                navOwnUA: Object.getOwnPropertyDescriptor(navigator, "userAgent") == null,
                navUA: navigator.userAgent === "Vector/0.0.1",
                docAnchors: Object.getOwnPropertyDescriptor(Document.prototype, "anchors") != null && document.anchors.length === 1,
                locThrew,
                locOwnHref: Object.prototype.hasOwnProperty.call(window.location, "href"),
                esProto: Object.getOwnPropertyDescriptor(EventSource.prototype, "url") != null,
                esConst: EventSource.CONNECTING === 0 && EventSource.prototype.OPEN === 1,
                mediaCross: Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "crossOrigin") != null,
                mediaThrew,
                playRejected,
                userAct: navigator.userActivation instanceof UserActivation,
                msgLen: MessageEvent.length,
                msgData: Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data") != null,
                pathLen: Path2D.length,
                pathAdd: Path2D.prototype.addPath.length,
                pathMove: Path2D.prototype.moveTo.length,
                imgDataLen: ImageData.length,
                imgDataW: Object.getOwnPropertyDescriptor(ImageData.prototype, "width") != null,
                workerLen: Worker.length,
                workerPost: Worker.prototype.postMessage.length,
                sharedLen: SharedWorker.length,
                xmlLen: XMLSerializer.prototype.serializeToString.length,
                originThrew: (function () { try { new Origin(); return false; } catch (e) { return e instanceof TypeError; } })(),
                mathA: Object.getOwnPropertyDescriptor(MathMLAnchorElement.prototype, "href") != null,
                imageLen: Image.length,
                audioLen: Audio.length,
                formLen: Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, "length") != null,
                canvasCtx: HTMLCanvasElement.prototype.getContext.length,
                canvasBlob: HTMLCanvasElement.prototype.toBlob.length,
                histGo: History.prototype.go.length,
                histPush: History.prototype.pushState.length,
                ceDefine: CustomElementRegistry.prototype.define.length,
                shadowHTML: typeof ShadowRoot.prototype.getHTML === "function",
                trStart: TimeRanges.prototype.start.length,
                hashLen: HashChangeEvent.length,
                trackLen: TrackEvent.length,
                submitLen: SubmitEvent.length,
                dragLen: DragEvent.length,
                dialogShow: typeof HTMLDialogElement.prototype.show === "function",
                scriptSup: typeof HTMLScriptElement.supports === "function",
                rangeFrag: typeof Range.prototype.createContextualFragment === "function",
                imageName: Image.name,
                audioNew: (function () { try { Audio(); return false; } catch (e) { return e instanceof TypeError; } })(),
                beforeLen: BeforeUnloadEvent.length,
                beforeThrew: (function () { try { new BeforeUnloadEvent(); return false; } catch (e) { return e instanceof TypeError; } })(),
                locStr: (function () { try { Location.prototype.toString.apply(null); return false; } catch (e) { return e instanceof TypeError; } })(),
                extNull: (function () { try { External.prototype.AddSearchProvider.apply(null); return false; } catch (e) { return e instanceof TypeError; } })(),
                allTypeof: typeof document.all,
                allLoose: document.all == null,
                allInst: document.all instanceof HTMLAllCollection,
                allCallV: document.all("v") && document.all("v").id === "v",
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["inputAcceptThrew"], true, "{v}");
    assert_eq!(v["svgOnclickThrew"], true, "{v}");
    assert_eq!(v["ownAbort"], true, "{v}");
    assert_eq!(v["protoHasAbort"], false, "{v}");
    assert_eq!(v["looseOk"], true, "{v}");
    assert_eq!(v["createCapName"], "createCaption", "{v}");
    assert_eq!(v["insertRowLen"], 0, "{v}");
    assert_eq!(v["setTimeoutLen"], 1, "{v}");
    assert_eq!(v["clearTimeoutLen"], 0, "{v}");
    assert_eq!(v["setIntervalLen"], 1, "{v}");
    assert_eq!(v["netIdle"], true, "{v}");
    assert_eq!(v["play"], true, "{v}");
    assert_eq!(v["getHTML"], true, "{v}");
    assert_eq!(v["navInst"], true, "{v}");
    assert_eq!(v["storeInst"], true, "{v}");
    assert_eq!(v["isSecure"], true, "{v}");
    assert_eq!(v["report"], true, "{v}");
    assert_eq!(v["offscreen"], true, "{v}");
    assert_eq!(v["sanLen"], 0, "{v}");
    assert_eq!(v["sanGet"], true, "{v}");
    assert_eq!(v["ctxLen"], 0, "{v}");
    assert_eq!(v["ctxCanvas"], true, "{v}");
    assert_eq!(v["ctxFill"], true, "{v}");
    assert_eq!(v["rotateLen"], 1, "{v}");
    assert_eq!(v["linGradLen"], 4, "{v}");
    assert_eq!(v["navProtoUA"], true, "{v}");
    assert_eq!(v["navOwnUA"], true, "{v}");
    assert_eq!(v["navUA"], true, "{v}");
    assert_eq!(v["docAnchors"], true, "{v}");
    assert_eq!(v["locThrew"], true, "{v}");
    assert_eq!(v["locOwnHref"], true, "{v}");
    assert_eq!(v["esProto"], true, "{v}");
    assert_eq!(v["esConst"], true, "{v}");
    assert_eq!(v["mediaCross"], true, "{v}");
    assert_eq!(v["mediaThrew"], true, "{v}");
    assert_eq!(v["userAct"], true, "{v}");
    assert_eq!(v["msgLen"], 1, "{v}");
    assert_eq!(v["msgData"], true, "{v}");
    assert_eq!(v["pathLen"], 0, "{v}");
    assert_eq!(v["pathAdd"], 1, "{v}");
    assert_eq!(v["pathMove"], 2, "{v}");
    assert_eq!(v["imgDataLen"], 2, "{v}");
    assert_eq!(v["imgDataW"], true, "{v}");
    assert_eq!(v["workerLen"], 1, "{v}");
    assert_eq!(v["workerPost"], 1, "{v}");
    assert_eq!(v["sharedLen"], 1, "{v}");
    assert_eq!(v["xmlLen"], 1, "{v}");
    assert_eq!(v["originThrew"], true, "{v}");
    assert_eq!(v["mathA"], true, "{v}");
    assert_eq!(v["imageLen"], 0, "{v}");
    assert_eq!(v["audioLen"], 0, "{v}");
    assert_eq!(v["formLen"], true, "{v}");
    assert_eq!(v["canvasCtx"], 1, "{v}");
    assert_eq!(v["canvasBlob"], 1, "{v}");
    assert_eq!(v["histGo"], 0, "{v}");
    assert_eq!(v["histPush"], 2, "{v}");
    assert_eq!(v["ceDefine"], 2, "{v}");
    assert_eq!(v["shadowHTML"], true, "{v}");
    assert_eq!(v["trStart"], 1, "{v}");
    assert_eq!(v["hashLen"], 1, "{v}");
    assert_eq!(v["trackLen"], 1, "{v}");
    assert_eq!(v["submitLen"], 1, "{v}");
    assert_eq!(v["dragLen"], 1, "{v}");
    assert_eq!(v["dialogShow"], true, "{v}");
    assert_eq!(v["scriptSup"], true, "{v}");
    assert_eq!(v["rangeFrag"], true, "{v}");
    assert_eq!(v["imageName"], "Image", "{v}");
    assert_eq!(v["audioNew"], true, "{v}");
    assert_eq!(v["beforeLen"], 0, "{v}");
    assert_eq!(v["beforeThrew"], true, "{v}");
    assert_eq!(v["locStr"], true, "{v}");
    assert_eq!(v["extNull"], true, "{v}");
    assert_eq!(v["allTypeof"], "undefined", "{v}");
    assert_eq!(v["allLoose"], true, "{v}");
    assert_eq!(v["allInst"], true, "{v}");
    assert_eq!(v["allCallV"], true, "{v}");
}

#[test]
fn text_decoder_decodes_utf8_heap_views() {
    let mut page = open("<title>enc</title>");
    let v = page
        .evaluate(
            r#"(function () {
              const json = '{"ok":true,"n":2}';
              const bytes = new TextEncoder().encode(json);
              const heap = new Uint8Array(64);
              heap.set(bytes, 8);
              const view = heap.subarray(8, 8 + bytes.length);
              const out = new TextDecoder().decode(view);
              const u16 = new Uint8Array([0x49, 0x00, 0x43, 0x00, 0x55, 0x00]);
              const utf16 = new TextDecoder("utf-16le").decode(u16);
              return {
                ctor: typeof TextDecoder,
                enc: typeof TextEncoder,
                round: out === json,
                parsed: JSON.parse(out).n,
                empty: new TextDecoder().decode(new Uint8Array()) === "",
                utf16le: utf16,
                utf16enc: new TextDecoder("utf-16le").encoding
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["ctor"], "function", "{v}");
    assert_eq!(v["enc"], "function", "{v}");
    assert_eq!(v["round"], true, "{v}");
    assert_eq!(v["parsed"], 2, "{v}");
    assert_eq!(v["empty"], true, "{v}");
    assert_eq!(v["utf16le"], "ICU", "{v}");
    assert_eq!(v["utf16enc"], "utf-16le", "{v}");
}

#[test]
fn mouse_event_buttons_default_is_zero_and_mouseup_reaches_window() {
    let mut page = open("<div id=t>x</div>");
    let v = page
        .evaluate(
            r#"(function () {
              const down = new MouseEvent("mousedown");
              const up = new MouseEvent("mouseup");
              const click = new MouseEvent("click", { button: 0 });
              const pressed = new MouseEvent("mousedown", { button: 0, buttons: 1 });
              const moved = new MouseEvent("mousemove", { clientX: 150, clientY: 200 });
              let windowUp = 0;
              window.addEventListener("mouseup", function () { windowUp++; });
              document.getElementById("t").dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
              svg.appendChild(rect);
              document.body.appendChild(svg);
              const pt = svg.createSVGPoint();
              pt.x = 150; pt.y = 200;
              const local = pt.matrixTransform(rect.getScreenCTM().inverse());
              return {
                downButtons: down.buttons,
                upButtons: up.buttons,
                clickButtons: click.buttons,
                downButton: down.button,
                pressedButtons: pressed.buttons,
                windowUp: windowUp,
                pageX: moved.pageX,
                clientLeft: document.getElementById("t").clientLeft,
                svgPoint: local.x,
                ownerSvg: rect.ownerSVGElement === svg
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["downButtons"], 0, "{v}");
    assert_eq!(v["upButtons"], 0, "{v}");
    assert_eq!(v["clickButtons"], 0, "{v}");
    assert_eq!(v["downButton"], 0, "{v}");
    assert_eq!(v["pressedButtons"], 1, "{v}");
    assert_eq!(v["windowUp"], 1, "{v}");
    assert_eq!(v["pageX"], 150, "{v}");
    assert_eq!(v["clientLeft"], 0, "{v}");
    assert_eq!(v["svgPoint"], 150, "{v}");
    assert_eq!(v["ownerSvg"], true, "{v}");
}

/// Perf-Dashboard PaneSelector constructs `_testsContainer` from a closed
/// shadow via `content().querySelector('#tests')`. Official Render throws
/// `childNodes` of undefined if that assignment never sticks.
#[test]
fn closed_shadow_template_query_selector_id_and_component_construct() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              function probe(label, fn) {
                try { return { label: label, ok: true, v: fn() }; }
                catch (e) { return { label: label, ok: false, err: String(e && e.stack ? e.stack : e) }; }
              }
              const t = document.createElement("template");
              t.innerHTML = '<div class="pane-selector-container"><div id="tests"></div><div id="platform"></div></div>';
              const host = document.createElement("div");
              const shadow = host.attachShadow({ mode: "closed" });
              const imported = document.importNode(t.content, true);
              shadow.appendChild(imported);
              const q = shadow.querySelector("#tests");
              const byId = shadow.getElementById ? shadow.getElementById("tests") : null;
              class FakePane extends HTMLElement {
                constructor() {
                  super();
                  this._shadow = null;
                  this.ctorErr = null;
                  try {
                    const tpl = document.createElement("template");
                    tpl.innerHTML = '<div class="pane-selector-container"><div id="tests"></div><div id="platform"></div></div>';
                    this._shadow = this.attachShadow({ mode: "closed" });
                    this._shadow.appendChild(document.importNode(tpl.content, true));
                    this._testsContainer = this._shadow.querySelector("#tests");
                    this._platformContainer = this._shadow.querySelector("#platform");
                  } catch (e) {
                    this.ctorErr = String(e && e.stack ? e.stack : e);
                  }
                }
              }
              customElements.define("fake-pane", FakePane);
              const el = document.createElement("fake-pane");
              document.body.appendChild(el);
              return {
                tplKids: t.content.childNodes.length,
                importedKids: imported.childNodes.length,
                shadowKids: shadow.childNodes.length,
                shadowHtml: String(shadow.innerHTML || ""),
                qType: q == null ? String(q) : q.tagName,
                byIdType: byId == null ? String(byId) : byId.tagName,
                elCtor: el.constructor && el.constructor.name,
                testsType: el._testsContainer == null ? String(el._testsContainer) : el._testsContainer.tagName,
                platformType: el._platformContainer == null ? String(el._platformContainer) : el._platformContainer.tagName,
                ctorErr: el.ctorErr,
                upgraded: !!el.__upgraded
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["tplKids"], 1, "{v}");
    assert_eq!(v["qType"], "DIV", "{v}");
    assert_eq!(v["byIdType"], "DIV", "{v}");
    assert_eq!(v["testsType"], "DIV", "{v}");
    assert_eq!(v["platformType"], "DIV", "{v}");
    assert_eq!(v["ctorErr"], serde_json::Value::Null, "{v}");
}

/// createElement of a defined autonomous custom element must run the
/// constructor immediately (HTML "create an element"). Deferred upgrade on
/// insert constructed a second instance on an element that already had a
/// closed shadow — Perf-Dashboard PaneSelector._testsContainer stayed unset.
#[test]
fn create_element_constructs_defined_custom_element_immediately() {
    let mut page = open(r#"<body></body>"#);
    let v = page
        .evaluate(
            r##"(function () {
              const currently = new Map();
              class Pane extends HTMLElement {}
              class PaneComponent {
                constructor() {
                  let element = currently.get(PaneComponent);
                  if (!element) {
                    currently.set(PaneComponent, this);
                    element = document.createElement("ve-pane");
                    currently.delete(PaneComponent);
                  }
                  element.component = () => this;
                  this._element = element;
                  this._shadow = element.attachShadow({ mode: "closed" });
                  const tpl = document.createElement("template");
                  tpl.innerHTML = '<div id="tests"></div>';
                  this._shadow.appendChild(document.importNode(tpl.content, true));
                  this._testsContainer = this._shadow.querySelector("#tests");
                }
                element() { return this._element; }
              }
              customElements.define("ve-pane", class extends HTMLElement {
                constructor() {
                  super();
                  const component = currently.get(PaneComponent);
                  if (component) return;
                  currently.set(PaneComponent, this);
                  new PaneComponent();
                  currently.delete(PaneComponent);
                }
                connectedCallback() {
                  this.component().rendered = true;
                }
              });
              const first = new PaneComponent();
              const created = document.createElement("ve-pane");
              document.body.appendChild(first.element());
              let renderErr = null;
              try { first._testsContainer.childNodes.length; }
              catch (e) { renderErr = String(e && e.message ? e.message : e); }
              return {
                createdBuilt: !!(created && created.component && created.component() && created.component()._testsContainer),
                createdType: created && created.component && created.component()._testsContainer
                  ? created.component()._testsContainer.tagName : String(created && created.component && created.component()._testsContainer),
                firstType: first._testsContainer == null ? String(first._testsContainer) : first._testsContainer.tagName,
                sameComp: first.element().component() === first,
                rendered: !!first.rendered,
                renderErr: renderErr
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["firstType"], "DIV", "{v}");
    assert_eq!(v["createdBuilt"], true, "{v}");
    assert_eq!(v["sameComp"], true, "{v}");
    assert_eq!(v["rendered"], true, "{v}");
    assert_eq!(v["renderErr"], serde_json::Value::Null, "{v}");
}

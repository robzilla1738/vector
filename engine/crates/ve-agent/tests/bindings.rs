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
    let cov = page.routing().css_coverage.expect("css coverage");
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
              return {
                ctx: ctx instanceof CanvasRenderingContext2D,
                w: c.width,
                h: c.height,
                webgl: c.getContext("webgl") === null
              };
            })()"##,
        )
        .unwrap();
    assert_eq!(v["ctx"], true, "{v}");
    assert_eq!(v["w"], 40, "{v}");
    assert_eq!(v["h"], 20, "{v}");
    assert_eq!(v["webgl"], true, "{v}");
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
              const el = host.querySelector('x-foo');
              return { before, after: window.__n, mark: !!(el && el.mark) };
            })()"#,
        )
        .unwrap();
    assert_eq!(v["before"], 0, "{v}");
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

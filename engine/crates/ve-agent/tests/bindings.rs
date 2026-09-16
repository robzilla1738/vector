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

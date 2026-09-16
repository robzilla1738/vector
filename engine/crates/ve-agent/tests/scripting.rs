//! The script layer on a page (plan A13): document scripts run at load,
//! timers advance on virtual time inside `settle()`, console output is
//! captured, a broken script does not break the load, and `evaluate` is
//! gated by the context capability.
#![cfg(feature = "v8")]

use ve_agent::{DEFAULT_VIEWPORT, Page, Program, ProgramStatus, Step, StepBase, StepStatus};
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
    // load ran: classic in order, then defer; the throwing script was isolated
    let (run, errors) = page.script_stats();
    assert_eq!((run, errors), (5, 1));
    assert_eq!(page.console().len(), 2, "{:?}", page.console());
    assert_eq!(page.console()[0].message, r#"hello {"x":1}"#);
    assert!(page.console()[1].message.contains("boom"));

    let order = page.evaluate("order.join(',')").unwrap();
    // classic scripts in order (microtasks drain after each), then `defer`;
    // timers within the 50 ms window fired during load's pump; the 5 s one is
    // armed but not due
    assert_eq!(
        order,
        serde_json::json!("a,b,micro,after-error,deferred,t10,iv,iv")
    );
    let settled = page.settle(500);
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
fn a_runaway_script_is_cut_off_and_the_page_survives() {
    let started = std::time::Instant::now();
    let mut page = open(
        "<script>for(;;){}</script><script>globalThis.ok = 1</script><p id=p>text</p>",
        true,
    );
    assert!(started.elapsed() < std::time::Duration::from_secs(20));
    assert_eq!(page.script_stats(), (2, 1));
    assert_eq!(page.evaluate("ok").unwrap(), serde_json::json!(1));
    assert!(page.document().element_by_id("p").is_some());
}

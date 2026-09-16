//! Iframes, downloads and HTML5 drag (plan A16).

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use ve_agent::{
    DEFAULT_VIEWPORT, Format, LoadedDocument, Loader, NavigationRequest, ObservationRequest, Page,
    Program, ProgramStatus, Step, StepBase,
};
use ve_core::{Error, Result};

#[derive(Default)]
struct Recorder {
    served: HashMap<String, LoadedDocument>,
    log: Rc<RefCell<Vec<NavigationRequest>>>,
}

impl Recorder {
    fn serve(mut self, url: &str, html: &str) -> Self {
        self.served
            .insert(url.to_owned(), LoadedDocument::html(url, html));
        self
    }
}

impl Loader for Recorder {
    fn load(&mut self, request: &NavigationRequest) -> Result<LoadedDocument> {
        self.log.borrow_mut().push(request.clone());
        let key = request.url.split('#').next().unwrap_or_default();
        self.served
            .get(key)
            .cloned()
            .ok_or_else(|| Error::Network(format!("no canned response for {}", request.url)))
    }
}

fn open(html: &str) -> Page {
    let rec = Recorder::default()
        .serve("https://t.test/", html)
        .serve("https://t.test/child.html", "<p id=\"in\">inside</p>")
        .serve("https://t.test/file.txt", "hello-download");
    Page::open(1, Box::new(rec), "https://t.test/", DEFAULT_VIEWPORT).unwrap()
}

#[test]
fn srcdoc_iframe_exposes_content_document() {
    let page = Page::from_html(
        1,
        r#"<iframe id="f" srcdoc="<p id=x>hi</p>"></iframe>"#,
        Some("https://t.test/"),
        DEFAULT_VIEWPORT,
    );
    let frames = page
        .observe_now(&ObservationRequest {
            format: Format::Full,
            ..ObservationRequest::default()
        })
        .frames;
    assert!(
        frames.len() >= 2 && frames.iter().any(|f| f.frame != "main" && f.same_origin),
        "srcdoc iframe is same-origin: {frames:?}"
    );
}

#[test]
fn same_origin_iframe_src_is_fetched_and_parsed() {
    let page = open(r#"<iframe id="f" src="/child.html"></iframe>"#);
    assert!(
        page.load_stats().frames >= 1,
        "iframe document should load: {:?}",
        page.load_stats()
    );
}

#[test]
fn download_attribute_writes_a_file() {
    let dir = std::env::temp_dir().join(format!("ve-dl-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    let mut page = open(r#"<a id="d" href="/file.txt" download="got.txt">x</a>"#);
    page.set_download_dir(&dir);
    let program = Program {
        steps: vec![Step::Click {
            base: StepBase {
                id: "c".into(),
                ..StepBase::default()
            },
            target: "css:#d".into(),
            button: None,
        }],
        ..Program::default()
    };
    let result = page.execute(&program);
    assert_eq!(result.status, ProgramStatus::Completed, "{result:?}");
    assert_eq!(page.downloads().len(), 1);
    let rec = &page.downloads()[0];
    assert_eq!(rec.filename, "got.txt");
    assert_eq!(
        std::fs::read_to_string(&rec.path).unwrap(),
        "hello-download"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn cross_origin_iframe_is_a_separate_context() {
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<iframe id="f" name="emb" src="https://other.test/x.html"></iframe>"#,
        )
        .serve(
            "https://other.test/x.html",
            r#"<p id="secret">nope</p><script>window.leaked = 1</script>"#,
        );
    let page = Page::open(1, Box::new(rec), "https://t.test/", DEFAULT_VIEWPORT).unwrap();
    assert!(
        page.load_stats().frames >= 1,
        "cross-origin iframe document should load into an isolated context: {:?}",
        page.load_stats()
    );
    assert_eq!(page.isolated_frame_count(), 1);
    let frames = page
        .observe_now(&ObservationRequest {
            format: Format::Full,
            ..ObservationRequest::default()
        })
        .frames;
    assert!(
        frames
            .iter()
            .any(|f| !f.same_origin && f.url.contains("other.test")),
        "observation lists the cross-origin frame: {frames:?}"
    );
}

#[cfg(feature = "v8")]
#[test]
fn cross_origin_iframe_scripts_do_not_run_in_the_parent_realm() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<iframe id="f" src="https://other.test/x.html"></iframe>"#,
        )
        .serve(
            "https://other.test/x.html",
            r#"<script>window.leaked = 1; document.title = 'child'</script>"#,
        );
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(500).settled);
    let leaked = page.evaluate("typeof window.leaked").unwrap();
    assert_eq!(leaked, serde_json::json!("undefined"), "{leaked}");
    let doc = page
        .evaluate("document.getElementById('f').contentDocument")
        .unwrap();
    assert!(doc.is_null(), "parent must not see contentDocument: {doc}");
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_respond_prefix_intercepts_fetch() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   fetch('/data.json').then(r => r.text()).then(t => { window.__sw = t; })
                 );
               </script>"#,
        )
        .serve("https://t.test/sw.js", "respond:from-sw")
        .serve("https://t.test/data.json", "from-network");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__sw").unwrap(),
        serde_json::json!("from-sw"),
        "respond: prefix is the SW subset intercept; other scripts must not steal fetch"
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_respond_with_response_intercepts_fetch() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   fetch('/data.json').then(r => r.text()).then(t => { window.__sw = t; })
                 );
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('fetch', event => { event.respondWith(new Response('from-sw-script')); });",
        )
        .serve("https://t.test/data.json", "from-network");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__sw").unwrap(),
        serde_json::json!("from-sw-script")
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_without_respond_prefix_does_not_steal_fetch() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   fetch('/data.json').then(r => r.text()).then(t => { window.__sw = t; })
                 );
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('fetch', function() {})",
        )
        .serve("https://t.test/data.json", "from-network");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__sw").unwrap(),
        serde_json::json!("from-network")
    );
}

#[test]
fn drag_to_dispatches_html5_events_when_scripting() {
    #[cfg(feature = "v8")]
    {
        use ve_script::{JsVm, V8Vm};
        let rec = Recorder::default().serve(
            "https://t.test/",
            r#"<div id="a">a</div><div id="b">b</div>
               <script>
                 window.seq = [];
                 for (const id of ['a','b']) {
                   const el = document.getElementById(id);
                   for (const t of ['dragstart','dragenter','dragover','drop','dragend'])
                     el.addEventListener(t, () => { window.seq.push(id+':'+t); });
                 }
               </script>"#,
        );
        let mut page = Page::open_with(
            1,
            Box::new(rec),
            "https://t.test/",
            DEFAULT_VIEWPORT,
            Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
        )
        .unwrap();
        let program = Program {
            steps: vec![Step::DragTo {
                base: StepBase {
                    id: "d".into(),
                    ..StepBase::default()
                },
                target: "css:#a".into(),
                to: "css:#b".into(),
            }],
            ..Program::default()
        };
        let result = page.execute(&program);
        assert_eq!(result.status, ProgramStatus::Completed, "{result:?}");
        let seq = page.evaluate("window.seq.join(',')").unwrap();
        let s = seq.as_str().unwrap_or("");
        assert!(s.contains("a:dragstart"), "{s}");
        assert!(s.contains("b:drop"), "{s}");
        assert!(s.contains("a:dragend"), "{s}");
    }
}

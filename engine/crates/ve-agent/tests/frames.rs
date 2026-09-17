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

#[cfg(feature = "v8")]
#[test]
fn service_worker_register_exposes_activated_worker() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(r => {
                   window.__state = r.active && r.active.state;
                   window.__url = r.active && r.active.scriptURL;
                 });
               </script>"#,
        )
        .serve("https://t.test/sw.js", "respond:from-sw");
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
        page.evaluate("window.__state").unwrap(),
        serde_json::json!("activated")
    );
    assert!(
        page.evaluate("String(window.__url)")
            .unwrap()
            .as_str()
            .unwrap()
            .contains("sw.js"),
        "{}",
        page.evaluate("window.__url").unwrap()
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_install_and_activate_fire() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(r => {
                   window.__install = r.installFired;
                   window.__activate = r.activateFired;
                   window.__state = r.active && r.active.state;
                   window.__installing = r.installing;
                 });
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('install', e => e.waitUntil(self.skipWaiting())); self.addEventListener('activate', function() {});",
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
    assert_eq!(
        page.evaluate("window.__install").unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("window.__activate").unwrap(),
        serde_json::json!(true)
    );
    assert_eq!(
        page.evaluate("window.__state").unwrap(),
        serde_json::json!("activated")
    );
    assert!(page.evaluate("window.__installing").unwrap().is_null());
}

#[cfg(feature = "v8")]
#[test]
fn worker_import_scripts_concatenates_fetched_files() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 const w = new Worker('w.js');
                 w.onmessage = (e) => { window.__w = e.data; };
                 w.postMessage('ping');
               </script>"#,
        )
        .serve(
            "https://t.test/w.js",
            "importScripts('lib.js');\nonmessage=function(e){postMessage(FLAG+e.data)}",
        )
        .serve("https://t.test/lib.js", "var FLAG='ok-';");
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
        page.evaluate("window.__w").unwrap(),
        serde_json::json!("ok-ping")
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_respond_with_status() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   fetch('/data.json').then(r => r.text().then(t => {
                     window.__sw = t;
                     window.__status = r.status;
                   }))
                 );
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('fetch', event => { event.respondWith(new Response('created', {status: 201})); });",
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
        serde_json::json!("created")
    );
    assert_eq!(
        page.evaluate("window.__status").unwrap(),
        serde_json::json!(201)
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_respond_with_redirect() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   fetch('/data.json').then(r => r.text().then(t => {
                     window.__sw = t;
                     window.__status = r.status;
                   }))
                 );
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('fetch', event => { event.respondWith(Response.redirect('/gone')); });",
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
        page.evaluate("window.__status").unwrap(),
        serde_json::json!(302)
    );
    assert_eq!(
        page.evaluate("window.__sw").unwrap(),
        serde_json::json!("/gone")
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_fetch_sees_request_url_on_isolate() {
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
            "self.addEventListener('fetch', event => { event.respondWith(new Response(event.request.url.indexOf('data.json') >= 0 ? 'from-sw-url' : 'miss')); });",
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
        serde_json::json!("from-sw-url")
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_realm_persists_state_across_fetches() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(() => { window.__reg = 1; });
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('fetch', event => { self.__n = (self.__n || 0) + 1; event.respondWith(new Response(String(self.__n))); });",
        )
        .serve("https://t.test/a", "net-a")
        .serve("https://t.test/b", "net-b");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(2000).settled);
    assert_eq!(page.evaluate("window.__reg").unwrap(), serde_json::json!(1));
    assert!(
        page.evaluate("fetch('/a').then(r => r.text()).then(t => { window.__a = t; })")
            .is_ok()
    );
    assert!(page.settle(2000).settled);
    assert_eq!(
        page.evaluate("window.__a").unwrap(),
        serde_json::json!("1"),
        "first fetch must see a live isolate"
    );
    assert!(
        page.evaluate("fetch('/b').then(r => r.text()).then(t => { window.__b = t; })")
            .is_ok()
    );
    assert!(page.settle(2000).settled);
    assert_eq!(
        page.evaluate("window.__b").unwrap(),
        serde_json::json!("2"),
        "second fetch must reuse the same isolate"
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_import_scripts_loads_fetched_file() {
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
            "importScripts('lib.js');\nself.addEventListener('fetch', event => { event.respondWith(new Response(FLAG)); });",
        )
        .serve("https://t.test/lib.js", "var FLAG='from-import';")
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
        serde_json::json!("from-import")
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_clients_claim_sets_controller() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(r => {
                   window.__claimed = r.claimed;
                   window.__controller = navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL;
                 });
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('install', e => e.waitUntil(self.skipWaiting())); self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));",
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
    assert_eq!(
        page.evaluate("window.__claimed").unwrap(),
        serde_json::json!(true)
    );
    assert!(
        page.evaluate("String(window.__controller)")
            .unwrap()
            .as_str()
            .unwrap()
            .contains("sw.js"),
        "{}",
        page.evaluate("window.__controller").unwrap()
    );
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_waiting_skip_waiting_promotes() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw1.js').then(r => {
                   window.__first = r.active && r.active.scriptURL;
                   window.__firstWaiting = r.waiting;
                   return navigator.serviceWorker.register('/sw2.js');
                 }).then(r => {
                   window.__secondActive = r.active && r.active.scriptURL;
                   window.__waiting = !!(r.waiting && r.waiting.scriptURL.indexOf('sw2') >= 0);
                   window.__waitingUrl = r.waiting && r.waiting.scriptURL;
                   r.waiting.postMessage('skip');
                   return navigator.serviceWorker.register('/sw2.js');
                 }).then(r => {
                   window.__afterActive = r.active && r.active.scriptURL;
                   window.__afterWaiting = r.waiting;
                 });
               </script>"#,
        )
        .serve(
            "https://t.test/sw1.js",
            "self.addEventListener('install', e => e.waitUntil(self.skipWaiting())); self.addEventListener('activate', function() {});",
        )
        .serve(
            "https://t.test/sw2.js",
            "self.addEventListener('install', function() {}); self.addEventListener('activate', function() {}); self.addEventListener('message', function() { self.skipWaiting(); });",
        );
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(2000).settled);
    assert!(
        page.evaluate("String(window.__first)")
            .unwrap()
            .as_str()
            .unwrap()
            .contains("sw1.js"),
        "{}",
        page.evaluate("window.__first").unwrap()
    );
    assert_eq!(
        page.evaluate("window.__waiting").unwrap(),
        serde_json::json!(true)
    );
    assert!(
        page.evaluate("String(window.__afterActive)")
            .unwrap()
            .as_str()
            .unwrap()
            .contains("sw2.js"),
        "{}",
        page.evaluate("window.__afterActive").unwrap()
    );
    assert!(page.evaluate("window.__afterWaiting").unwrap().is_null());
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_clients_match_all() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   Promise.all([
                     fetch('/controlled').then(r => r.text()),
                     fetch('/all').then(r => r.text())
                   ]).then(t => { window.__controlled = t[0]; window.__all = t[1]; })
                 );
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('install', e => e.waitUntil(self.skipWaiting())); self.addEventListener('activate', e => e.waitUntil(self.clients.claim())); self.addEventListener('fetch', event => { var include = event.request.url.indexOf('all') >= 0; event.respondWith(self.clients.matchAll({includeUncontrolled: include}).then(function (cs) { return new Response(String(cs.length)+':'+(cs[0]&&cs[0].type)); })); });",
        )
        .serve("https://t.test/controlled", "net")
        .serve("https://t.test/all", "net");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(2000).settled);
    let controlled = page.evaluate("window.__controlled").unwrap();
    let all = page.evaluate("window.__all").unwrap();
    assert!(
        controlled.as_str().unwrap_or("").starts_with("1:"),
        "controlled={controlled}"
    );
    assert!(all.as_str().unwrap_or("").starts_with("1:"), "all={all}");
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_client_post_message_reaches_page() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 navigator.serviceWorker.addEventListener('message', e => { window.__fromSw = e.data; });
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   fetch('/ping').then(r => r.text()).then(t => { window.__body = t; })
                 );
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('install', e => e.waitUntil(self.skipWaiting())); self.addEventListener('activate', e => e.waitUntil(self.clients.claim())); self.addEventListener('fetch', event => { event.respondWith(self.clients.matchAll().then(function (cs) { if (cs[0] && cs[0].postMessage) cs[0].postMessage('from-sw'); return new Response('ok'); })); });",
        )
        .serve("https://t.test/ping", "net");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(2000).settled);
    let body = page.evaluate("window.__body").unwrap();
    let msg = page.evaluate("window.__fromSw").unwrap();
    assert_eq!(body.as_str(), Some("ok"), "{body}");
    assert_eq!(msg.as_str(), Some("from-sw"), "{msg}");
}

#[cfg(feature = "v8")]
#[test]
fn service_worker_match_all_includes_dedicated_worker_clients() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve(
            "https://t.test/",
            r#"<script>
                 const w = new Worker('onmessage=function(e){postMessage(e.data)}');
                 navigator.serviceWorker.register('/sw.js').then(() =>
                   fetch('/clients').then(r => r.text()).then(t => { window.__clients = t; })
                 );
               </script>"#,
        )
        .serve(
            "https://t.test/sw.js",
            "self.addEventListener('install', e => e.waitUntil(self.skipWaiting())); self.addEventListener('activate', e => e.waitUntil(self.clients.claim())); self.addEventListener('fetch', event => { event.respondWith(self.clients.matchAll({includeUncontrolled:true}).then(function (cs) { return new Response(cs.map(c => c.type).sort().join(',')); })); });",
        )
        .serve("https://t.test/clients", "net");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(2000).settled);
    let types = page.evaluate("window.__clients").unwrap();
    let s = types.as_str().unwrap_or("");
    assert!(s.contains("window"), "{types}");
    assert!(s.contains("worker"), "{types}");
}

#[cfg(feature = "v8")]
#[test]
fn shared_worker_port_round_trip() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default().serve(
        "https://t.test/",
        r#"<script>
             const w = new SharedWorker('onconnect=function(e){}');
             w.port.onmessage = (e) => { window.__shared = e.data; };
             w.port.postMessage('hi');
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
    assert!(page.settle(2000).settled);
    let got = page.evaluate("window.__shared").unwrap();
    assert!(got.as_str().is_some(), "{got}");
}

#[cfg(feature = "v8")]
#[test]
fn iframe_post_message_same_origin_and_origin_mismatch() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default().serve(
        "https://t.test/",
        r#"<iframe id="f" srcdoc="<p id=in>inside</p>"></iframe>"#,
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
    let meta = page
        .evaluate(
            r#"(function () {
              const f = document.getElementById('f');
              const w = f.contentWindow;
              window.__got = null;
              w.addEventListener('message', (e) => {
                window.__got = { data: e.data, origin: e.origin, hasSource: !!e.source };
              });
              w.postMessage('nope', 'https://evil.test');
              w.postMessage('hello', 'https://t.test');
              return {
                hasDoc: f.contentDocument !== null,
                pm: typeof w.postMessage === 'function'
              };
            })()"#,
        )
        .unwrap();
    assert_eq!(meta["hasDoc"], true, "{meta}");
    assert_eq!(meta["pm"], true, "{meta}");
    assert!(page.settle(200).settled);
    assert_eq!(
        page.evaluate("window.__got.data").unwrap(),
        serde_json::json!("hello")
    );
    assert_eq!(
        page.evaluate("window.__got.origin").unwrap(),
        serde_json::json!("https://t.test")
    );
    assert_eq!(
        page.evaluate("window.__got.hasSource").unwrap(),
        serde_json::json!(true)
    );
}

#[cfg(feature = "v8")]
#[test]
fn fetch_stays_pending_until_settle() {
    use ve_script::{JsVm, V8Vm};
    let rec = Recorder::default()
        .serve("https://t.test/", "<p>ok</p>")
        .serve("https://t.test/data.json", "later");
    let mut page = Page::open_with(
        1,
        Box::new(rec),
        "https://t.test/",
        DEFAULT_VIEWPORT,
        Some((Box::new(V8Vm::new().unwrap()) as Box<dyn JsVm>, true)),
    )
    .unwrap();
    assert!(page.settle(500).settled);
    page.evaluate(
        r#"window.__done = null; fetch('/data.json').then(r => r.text()).then(t => { window.__done = t; });"#,
    )
    .unwrap();
    assert_eq!(
        page.evaluate("window.__done").unwrap(),
        serde_json::json!(null),
        "fetchPoll must not complete the job before settle"
    );
    assert!(page.settle(500).settled);
    assert_eq!(
        page.evaluate("window.__done").unwrap(),
        serde_json::json!("later")
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

//! In-engine step semantics (architecture §6) exercised through
//! `Page::execute` with contract-shaped programs and a recording loader.

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use ve_agent::{
    DEFAULT_VIEWPORT, ErrorCode, InFlightSummary, LoadedDocument, Loader, NavMethod,
    NavigationRequest, ObservationRequest, Page, Program, ProgramResult, ProgramStatus, StepStatus,
};
use ve_core::{Error, Result};

const ORIGIN: &str = "https://t.test/";

/// Serves canned documents by absolute URL (query included) and records
/// every navigation request.
#[derive(Default)]
struct Recorder {
    served: HashMap<String, LoadedDocument>,
    log: Rc<RefCell<Vec<NavigationRequest>>>,
    in_flight: Vec<InFlightSummary>,
}

impl Recorder {
    fn serve(mut self, url: &str, html: &str) -> Self {
        self.served
            .insert(url.to_owned(), LoadedDocument::html(url, html));
        self
    }
    fn log(&self) -> Rc<RefCell<Vec<NavigationRequest>>> {
        self.log.clone()
    }
}

impl Loader for Recorder {
    fn load(&mut self, request: &NavigationRequest) -> Result<LoadedDocument> {
        self.log.borrow_mut().push(request.clone());
        let key = request.url.split('#').next().unwrap_or_default();
        self.served
            .get(key)
            .cloned()
            .or_else(|| {
                // Fall back to a path match so query strings need not be enumerated.
                let path = key.split('?').next().unwrap_or_default();
                self.served.get(path).cloned()
            })
            .ok_or_else(|| Error::Network(format!("no canned response for {}", request.url)))
    }
    fn in_flight(&self, _page: u64) -> Vec<InFlightSummary> {
        self.in_flight.clone()
    }
}

fn page_with(html: &str, recorder: Recorder) -> Page {
    Page::from_html(1, html, Some(ORIGIN), DEFAULT_VIEWPORT).with_loader(Box::new(recorder))
}

fn new_page(html: &str) -> Page {
    page_with(html, Recorder::default())
}

fn run(page: &mut Page, program: &str) -> ProgramResult {
    page.execute(&Program::from_json(program).expect("program parses"))
}

fn assert_ok(result: &ProgramResult) {
    assert_eq!(
        result.status,
        ProgramStatus::Completed,
        "program failed: {:?}\n{:#?}",
        result.error,
        result.steps
    );
}

fn error_code(result: &ProgramResult, step: usize) -> ErrorCode {
    result.steps[step]
        .error
        .as_ref()
        .unwrap_or_else(|| panic!("step {step} has no error: {:#?}", result.steps[step]))
        .code
}

fn reference(page: &Page, target: &str) -> String {
    let id = page.resolve_all(target, None).expect("target resolves")[0];
    page.ref_of(id)
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

#[test]
fn link_click_navigates_and_history_traverses() {
    let recorder = Recorder::default()
        .serve(
            "https://t.test/next",
            "<title>Next</title><h1>Second</h1><a href=/>Home</a>",
        )
        .serve(ORIGIN, "<title>Home</title><a href=/next>Next</a>");
    let log = recorder.log();
    let mut page = page_with(
        "<title>Home</title><a href=/next>Next</a><a href='#bottom'>Down</a><p id=bottom>end</p>",
        recorder,
    );
    let epoch = page.generation();

    let result = run(
        &mut page,
        r##"[{"id":"c","op":"click","target":"text=Next"}]"##,
    );
    assert_ok(&result);
    assert_eq!(page.url(), "https://t.test/next");
    assert_eq!(page.title(), "Next");
    assert_eq!(
        page.generation(),
        epoch + 1,
        "a new document bumps the epoch"
    );
    assert_eq!(page.history(), (2, 1));
    let requests = log.borrow();
    assert_eq!(requests.len(), 1);
    assert_eq!(requests[0].method, NavMethod::Get);
    assert_eq!(requests[0].referrer.as_deref(), Some(ORIGIN));
    drop(requests);

    let result = run(
        &mut page,
        r##"[{"id":"b","op":"back"},{"id":"f","op":"forward"},{"id":"r","op":"reload"}]"##,
    );
    assert_ok(&result);
    assert!(
        result.steps[0]
            .detail
            .as_deref()
            .unwrap()
            .contains("back to https://t.test/")
    );
    assert_eq!(page.url(), "https://t.test/next");
    assert_eq!(page.history(), (2, 1));
    assert_eq!(
        log.borrow().len(),
        2,
        "back/forward restore the cached entry; only reload refetches"
    );

    // Same-document fragment navigation scrolls instead of fetching.
    let mut page =
        new_page("<a href='#bottom'>Down</a><div style='height:3000px'></div><p id=bottom>end</p>");
    let result = run(
        &mut page,
        r##"[{"id":"c","op":"click","target":"text=Down"}]"##,
    );
    assert_ok(&result);
    assert!(
        page.scroll_offset().y > 0.0,
        "fragment click scrolls to the target"
    );
    assert_eq!(page.generation(), 0, "no new document");
    assert!(page.url().ends_with("#bottom"));
}

#[test]
fn navigate_step_validates_urls_and_reports_network_failures() {
    let mut page = new_page("<p>x</p>");
    let result = run(
        &mut page,
        r##"[{"id":"n","op":"navigate","url":"javascript:alert(1)"}]"##,
    );
    assert_eq!(result.status, ProgramStatus::Failed);
    assert_eq!(error_code(&result, 0), ErrorCode::CapabilityUnsupported);

    let result = run(
        &mut page,
        r##"[{"id":"n","op":"navigate","url":"https://t.test/missing"}]"##,
    );
    assert_eq!(result.status, ProgramStatus::Failed);
    assert_eq!(error_code(&result, 0), ErrorCode::BackendUnavailable);
    assert_eq!(page.url(), ORIGIN, "the old document stays");
}

#[test]
fn immediate_meta_refresh_is_followed_during_settle() {
    let recorder =
        Recorder::default().serve("https://t.test/dest", "<title>Dest</title><p>arrived</p>");
    let mut page = page_with(
        r##"<meta http-equiv="refresh" content="0; url=/dest"><p>redirecting…</p>"##,
        recorder,
    );
    let settled = page.settle(2000);
    assert!(settled.settled, "{settled:?}");
    assert_eq!(page.url(), "https://t.test/dest");
    assert_eq!(page.title(), "Dest");
    assert_eq!(
        page.history(),
        (1, 0),
        "refresh replaces rather than pushes"
    );
}

#[test]
fn documents_are_decoded_with_the_declared_charset() {
    let recorder = Recorder::default();
    let mut loader = recorder;
    loader.served.insert(
        "https://t.test/latin1".into(),
        LoadedDocument {
            url: "https://t.test/latin1".into(),
            bytes: b"<title>Caf\xe9 \xa9</title><h1>Cr\xe8me</h1>".to_vec(),
            content_type: Some("text/html; charset=windows-1252".into()),
            status: 200,
        },
    );
    let page = Page::open(
        1,
        Box::new(loader),
        "https://t.test/latin1",
        DEFAULT_VIEWPORT,
    )
    .unwrap();
    assert_eq!(page.title(), "Café ©");
    assert_eq!(page.status(), 200);
    let content = page.observe_now(&ObservationRequest::default());
    assert_eq!(content.headings, vec!["Crème".to_owned()]);
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

#[test]
fn get_submission_encodes_the_entry_list_with_the_submitter() {
    let recorder = Recorder::default().serve("https://t.test/search", "<title>Results</title>");
    let log = recorder.log();
    let mut page = page_with(
        r##"<form action="/search" method="get">
             <label for=q>Query</label><input id=q name=q value="">
             <input type=hidden name=lang value="en">
             <label><input type=checkbox name=exact checked> Exact</label>
             <select name=sort><option value=rel>Relevance</option><option value=new selected>Newest</option></select>
             <button name=go value=1>Search</button>
             <button name=lucky value=1>Lucky</button>
           </form>"##,
        recorder,
    );
    let result = run(
        &mut page,
        r##"[{"id":"f","op":"fill","target":"label=Query","value":"boots & co"},
            {"id":"c","op":"click","target":"role=button[name=\"Search\"]"}]"##,
    );
    assert_ok(&result);
    let requests = log.borrow();
    assert_eq!(requests.len(), 1);
    assert_eq!(requests[0].method, NavMethod::Get);
    assert_eq!(
        requests[0].url, "https://t.test/search?q=boots+%26+co&lang=en&exact=on&sort=new&go=1",
        "only the clicked submitter participates"
    );
    assert!(requests[0].body.is_none());
}

#[test]
fn post_submission_uses_the_form_enctype() {
    let recorder = Recorder::default()
        .serve("https://t.test/save", "<title>Saved</title>")
        .serve("https://t.test/upload", "<title>Uploaded</title>");
    let log = recorder.log();
    let mut page = page_with(
        r##"<form id=a action="/save" method="post"><input name=title value="Hello world"><textarea name=notes>a=b</textarea><button>Save</button></form>
           <form id=b action="/upload" method="post" enctype="multipart/form-data"><input name=kind value=doc><input type=file name=file><button>Upload</button></form>"##,
        recorder,
    );
    let result = run(
        &mut page,
        r##"[{"id":"s","op":"click","target":"text=Save"}]"##,
    );
    assert_ok(&result);
    {
        let requests = log.borrow();
        assert_eq!(requests[0].method, NavMethod::Post);
        assert_eq!(requests[0].url, "https://t.test/save");
        assert_eq!(
            requests[0].content_type.as_deref(),
            Some("application/x-www-form-urlencoded")
        );
        assert_eq!(
            String::from_utf8(requests[0].body.clone().unwrap()).unwrap(),
            "title=Hello+world&notes=a%3Db"
        );
    }
    // The page navigated away; reload the compound document to submit the second form.
    let mut page = page_with(
        r##"<form id=b action="/upload" method="post" enctype="multipart/form-data"><input name=kind value=doc><input type=file name=file><button>Upload</button></form>"##,
        Recorder::default().serve("https://t.test/upload", "<title>Uploaded</title>"),
    );
    let result = run(
        &mut page,
        r##"[{"id":"u","op":"upload","target":"css:input[type=file]","files":["/tmp/report.pdf"]},
            {"id":"s","op":"click","target":"text=Upload"}]"##,
    );
    assert_ok(&result);
    assert_eq!(page.title(), "Uploaded");
}

#[test]
fn enter_submits_tab_follows_order_space_toggles() {
    let recorder = Recorder::default().serve("https://t.test/go", "<title>Went</title>");
    let log = recorder.log();
    let mut page = page_with(
        r##"<input id=first name=first><input id=second name=second tabindex=2><a id=link href=/x>Link</a>
           <label><input id=cb type=checkbox name=cb> Agree</label>
           <form action="/go" method=get><input id=q name=q><button>Go</button></form>"##,
        recorder,
    );
    let first = reference(&page, "css:#first");
    let second = reference(&page, "css:#second");
    let link = reference(&page, "css:#link");
    let cb = reference(&page, "css:#cb");

    let result = run(
        &mut page,
        &format!(
            r##"[{{"id":"1","op":"click","target":"{first}"}},
                {{"id":"2","op":"press","key":"Tab"}},
                {{"id":"3","op":"press","key":"Tab"}},
                {{"id":"4","op":"press","key":"Shift+Tab"}}]"##
        ),
    );
    assert_ok(&result);
    // Tab order: tabindex=0 elements in tree order (first, link, cb, q, Go), then tabindex=2 (second).
    assert_eq!(
        result.steps[1].detail.as_deref(),
        Some(format!("focus moved to {link}").as_str())
    );
    assert_eq!(
        result.steps[2].detail.as_deref(),
        Some(format!("focus moved to {cb}").as_str())
    );
    assert_eq!(
        result.steps[3].detail.as_deref(),
        Some(format!("focus moved to {link}").as_str())
    );
    let _ = second;

    let result = run(
        &mut page,
        &format!(r##"[{{"id":"s","op":"press","target":"{cb}","key":"Space"}}]"##),
    );
    assert_ok(&result);
    assert!(
        page.document()
            .is_checked(page.resolve_all(&cb, None).unwrap()[0])
    );

    let result = run(
        &mut page,
        r##"[{"id":"f","op":"fill","target":"css:#q","value":"tea"},{"id":"e","op":"press","key":"Enter"}]"##,
    );
    assert_ok(&result);
    assert_eq!(page.title(), "Went");
    assert_eq!(log.borrow()[0].url, "https://t.test/go?q=tea");

    let mut page = new_page("<input id=q>");
    let result = run(&mut page, r##"[{"id":"k","op":"press","key":"Hyper+Q"}]"##);
    assert_eq!(result.status, ProgramStatus::Failed);
    assert_eq!(error_code(&result, 0), ErrorCode::InvalidParams);
}

#[test]
fn check_uncheck_radio_label_forwarding_select_and_details() {
    let mut page = new_page(
        r##"<label for=cb>Newsletter</label><input id=cb type=checkbox name=nl>
           <label><input type=radio name=size value=s> Small</label><label><input type=radio name=size value=l checked> Large</label>
           <label for=color>Colour</label><select id=color name=color><option value="">Any</option><option value=red>Red</option><option value=blue>Blue</option></select>
           <select id=multi multiple><option value=a>A</option><option value=b>B</option><option value=c>C</option></select>
           <details id=d><summary>More</summary><p>Hidden until opened</p></details>"##,
    );
    let cb = page.resolve_all("css:#cb", None).unwrap()[0];
    let result = run(
        &mut page,
        r##"[{"id":"1","op":"check","target":"label=Newsletter"},
            {"id":"2","op":"check","target":"label=Newsletter"},
            {"id":"3","op":"uncheck","target":"css:#cb"},
            {"id":"4","op":"click","target":"text=Newsletter"}]"##,
    );
    assert_ok(&result);
    assert!(
        result.steps[1]
            .detail
            .as_deref()
            .unwrap()
            .contains("already checked=true")
    );
    assert!(
        page.document().is_checked(cb),
        "clicking the label forwards to the control"
    );

    let small = page.resolve_all("css:input[value=s]", None).unwrap()[0];
    let large = page.resolve_all("css:input[value=l]", None).unwrap()[0];
    let result = run(
        &mut page,
        r##"[{"id":"r","op":"check","target":"label=Small"}]"##,
    );
    assert_ok(&result);
    assert!(page.document().is_checked(small) && !page.document().is_checked(large));
    let result = run(
        &mut page,
        r##"[{"id":"r","op":"uncheck","target":"label=Small"}]"##,
    );
    assert_eq!(error_code(&result, 0), ErrorCode::StepFailed);

    let result = run(
        &mut page,
        r##"[{"id":"1","op":"select","target":"label=Colour","value":"blue"},
            {"id":"2","op":"extract","fields":[{"name":"colour","selector":"#color","attribute":"value"}]},
            {"id":"3","op":"select","target":"css:#color","value":"Red"},
            {"id":"4","op":"extract","fields":[{"name":"colour2","selector":"#color","attribute":"value"}]},
            {"id":"5","op":"select","target":"css:#multi","value":["a","c"]},
            {"id":"6","op":"select","target":"css:#color","value":"purple"}]"##,
    );
    assert_eq!(result.status, ProgramStatus::Failed);
    let extracted = result.extracted.as_ref().unwrap();
    assert_eq!(extracted["colour"], "blue", "select by value");
    assert_eq!(extracted["colour2"], "red", "select by label");
    let multi = page.resolve_all("css:#multi option", None).unwrap();
    assert!(
        page.document().is_selected(multi[0])
            && !page.document().is_selected(multi[1])
            && page.document().is_selected(multi[2])
    );
    assert_eq!(error_code(&result, 5), ErrorCode::NotFound);

    let details = page.resolve_all("css:#d", None).unwrap()[0];
    let result = run(
        &mut page,
        r##"[{"id":"s","op":"click","target":"text=More"}]"##,
    );
    assert_ok(&result);
    assert!(page.document().attribute(details, "open").is_some());
    assert!(page.shown_text().contains("Hidden until opened"));
    let result = run(
        &mut page,
        r##"[{"id":"s","op":"click","target":"text=More"}]"##,
    );
    assert_ok(&result);
    assert!(page.document().attribute(details, "open").is_none());
}

#[test]
fn fill_replaces_type_appends_and_labels_ignore_control_values() {
    let mut page = new_page(
        r##"<label for=n>Name</label><input id=n value="old">
           <label><input type=radio name=h value=yes> Yes</label>
           <textarea id=t></textarea><input id=ro readonly value=fixed>"##,
    );
    let result = run(
        &mut page,
        r##"[{"id":"1","op":"fill","target":"label=Name","value":"Ada"},
            {"id":"2","op":"type","target":"css:#n","value":" Lovelace"},
            {"id":"3","op":"type","target":"css:#t","value":"line 1\nline 2"},
            {"id":"4","op":"extract","fields":[{"name":"n","selector":"#n","attribute":"value"},{"name":"t","selector":"#t","attribute":"value"}]},
            {"id":"5","op":"fill","target":"css:#ro","value":"nope","optional":true},
            {"id":"6","op":"fill","target":"label=Yes","value":"x"}]"##,
    );
    assert_eq!(result.status, ProgramStatus::Failed);
    let extracted = result.extracted.as_ref().unwrap();
    assert_eq!(extracted["n"], "Ada Lovelace");
    assert_eq!(extracted["t"], "line 1\nline 2");
    assert_eq!(result.steps[4].status, StepStatus::Failed, "read-only");
    assert_eq!(error_code(&result, 4), ErrorCode::StepFailed);
    assert_eq!(
        error_code(&result, 5),
        ErrorCode::InvalidParams,
        "radio is not a text control"
    );

    let content = page.observe_now(&ObservationRequest::default());
    let radio = content
        .form_fields
        .iter()
        .find(|f| f.type_ == "radio")
        .expect("radio field");
    assert_eq!(
        radio.label.as_deref(),
        Some("Yes"),
        "value attribute must not leak into the name"
    );
}

// ---------------------------------------------------------------------------
// Pointer, scroll, waitFor, extract, collectScroll, screenshot, unsupported ops
// ---------------------------------------------------------------------------

#[test]
fn scroll_click_point_and_hover() {
    let mut page = new_page(
        r##"<button id=b style="position:absolute;left:100px;top:40px;width:80px;height:30px">Hit</button>
           <div style="height:4000px"></div><p id=end>end</p>"##,
    );
    let result = run(
        &mut page,
        r##"[{"id":"1","op":"scroll","direction":"down"},
            {"id":"2","op":"scroll","direction":"bottom"},
            {"id":"3","op":"scroll","direction":"top"},
            {"id":"4","op":"clickPoint","x":140,"y":55},
            {"id":"5","op":"hover","target":"css:#b"},
            {"id":"6","op":"scroll","direction":"down","amount":100}]"##,
    );
    assert_ok(&result);
    assert!(
        result.steps[0]
            .detail
            .as_deref()
            .unwrap()
            .starts_with("scrolled viewport to y=720")
    );
    assert!(result.steps[1].detail.as_deref().unwrap().contains("(max "));
    assert!(result.steps[2].detail.as_deref().unwrap().contains("y=0"));
    let b = reference(&page, "css:#b");
    assert!(
        result.steps[3].detail.as_deref().unwrap().contains(&b),
        "clickPoint hit-tests to the button: {:?}",
        result.steps[3].detail
    );
    assert_eq!(
        page.focused(),
        Some(page.resolve_all("css:#b", None).unwrap()[0])
    );
    assert_eq!(page.scroll_offset().y, 100.0);
}

#[test]
fn wait_for_conditions_and_capability_gaps() {
    let mut page = new_page(
        r##"<h1>Ready</h1><p id=gone style="display:none">Secret</p><button id=b>Go</button>"##,
    );
    let b = reference(&page, "css:#b");
    let result = run(
        &mut page,
        &format!(
            r##"[{{"id":"1","op":"waitFor","condition":{{"kind":"textVisible","text":"Ready"}}}},
                {{"id":"2","op":"waitFor","condition":{{"kind":"selector","selector":"#gone","state":"hidden"}}}},
                {{"id":"3","op":"waitFor","condition":{{"kind":"selector","selector":"#gone","state":"attached"}}}},
                {{"id":"4","op":"waitFor","condition":{{"kind":"refReady","ref":"{b}"}}}},
                {{"id":"5","op":"waitFor","condition":{{"kind":"urlMatches","pattern":"t.test"}}}},
                {{"id":"6","op":"waitFor","condition":{{"kind":"navigationSettled"}}}},
                {{"id":"7","op":"waitFor","condition":{{"kind":"settled"}}}},
                {{"id":"8","op":"waitFor","condition":{{"kind":"textVisible","text":"Secret","timeoutMs":20}}}}]"##
        ),
    );
    assert_eq!(result.status, ProgramStatus::Failed);
    for i in 0..7 {
        assert_eq!(
            result.steps[i].status,
            StepStatus::Ok,
            "{:#?}",
            result.steps[i]
        );
    }
    assert_eq!(error_code(&result, 7), ErrorCode::ConditionTimeout);
    let detail = result.steps[7]
        .error
        .as_ref()
        .unwrap()
        .detail
        .as_ref()
        .unwrap();
    assert_eq!(detail["timeoutMs"], 20);

    let result = run(
        &mut page,
        r##"[{"id":"e","op":"waitFor","condition":{"kind":"expression","expression":"document.readyState === 'complete'"},"optional":true},
            {"id":"d","op":"waitFor","condition":{"kind":"downloadCompleted","timeoutMs":0},"optional":true},
            {"id":"x","op":"evaluate","expression":"1+1","optional":true},
            {"id":"g","op":"dialog","action":"accept","optional":true},
            {"id":"dl","op":"expectDownload","optional":true}]"##,
    );
    assert_eq!(
        result.status,
        ProgramStatus::Completed,
        "optional steps do not fail the program"
    );
    // expression + evaluate still need a VM.
    // downloads (A16) time out immediately when none completed; dialog (A15)
    // fails with step_failed when none is open.
    assert_eq!(error_code(&result, 0), ErrorCode::CapabilityUnsupported);
    assert_eq!(error_code(&result, 1), ErrorCode::ConditionTimeout);
    assert_eq!(error_code(&result, 2), ErrorCode::CapabilityUnsupported);
    assert_eq!(error_code(&result, 3), ErrorCode::StepFailed);
    assert_eq!(error_code(&result, 4), ErrorCode::StepFailed);

    // `expect` after a step uses the same conditions.
    let result = run(
        &mut page,
        r##"[{"id":"c","op":"click","target":"css:#b","expect":[{"kind":"textVisible","text":"Nope"}]}]"##,
    );
    assert_eq!(error_code(&result, 0), ErrorCode::ConditionTimeout);
}

#[test]
fn extract_and_collect_scroll() {
    let items: String = (1..=30)
        .map(|i| format!("<li data-id=\"{i}\">Item {i}</li>"))
        .collect();
    let mut page = new_page(&format!(
        r##"<h1>Catalog</h1><a id=l href="/p/1">First</a><a href="/p/2">Second</a>
           <input id=q value="abc"><ul id=list style="height:200px;overflow:auto">{items}<li data-id="3">Item 3</li></ul>"##
    ));
    let result = run(
        &mut page,
        r##"[{"id":"x","op":"extract","as":"page","fields":[
              {"name":"title","selector":"h1"},
              {"name":"first","selector":"#l","attribute":"href"},
              {"name":"links","selector":"a","all":true},
              {"name":"q","selector":"#q"},
              {"name":"missing","selector":"#nope"},
              {"name":"attr","selector":"#l","attribute":"id"}]},
            {"id":"c","op":"collectScroll","item":"#list li","key":"data-id","limit":100,"maxScrolls":10}]"##,
    );
    assert_ok(&result);
    let ex = result.extracted.as_ref().unwrap();
    assert_eq!(ex["page"]["title"], "Catalog");
    assert_eq!(
        ex["page"]["first"], "https://t.test/p/1",
        "href is resolved"
    );
    assert_eq!(ex["page"]["links"].as_array().unwrap().len(), 2);
    assert_eq!(ex["page"]["q"], "abc", "form controls extract their value");
    assert!(ex["page"]["missing"].is_null());
    assert_eq!(ex["page"]["attr"], "l");
    let collected = &ex["items"];
    assert_eq!(collected["collected"], 30, "dedupe by key: {collected}");
    assert_eq!(collected["items"][0]["key"], "1");
    assert_eq!(collected["items"][0]["text"], "Item 1");
}

#[test]
fn screenshot_upload_and_unsupported_targets() {
    let mut page = new_page(
        r##"<h1 style="color:#c00">Shot</h1><input id=f type=file><input id=g type=file multiple>"##,
    );
    let result = run(
        &mut page,
        r##"[{"id":"s","op":"screenshot","fullPage":false,"artifact":"shot-1"},
            {"id":"u","op":"upload","target":"css:#f","files":["/tmp/a.txt"]},
            {"id":"v","op":"upload","target":"css:#g","files":["/tmp/a.txt","/tmp/b.txt"]},
            {"id":"w","op":"upload","target":"css:#f","files":["/tmp/a.txt","/tmp/b.txt"]},
            {"id":"x","op":"click","target":"xpath://h1","optional":true}]"##,
    );
    assert_eq!(result.status, ProgramStatus::Failed);
    assert_eq!(result.steps[0].status, StepStatus::Ok);
    assert_eq!(
        result.steps[0].artifact_ids.as_deref(),
        Some(&["shot-1".to_owned()][..])
    );
    let shot = page.last_screenshot().expect("screenshot kept");
    assert_eq!(&shot.png[..8], b"\x89PNG\r\n\x1a\n");
    assert_eq!((shot.width, shot.height), (1280, 720));
    assert_eq!(result.steps[1].status, StepStatus::Ok);
    assert_eq!(result.steps[2].status, StepStatus::Ok);
    assert_eq!(
        error_code(&result, 3),
        ErrorCode::InvalidParams,
        "multiple files need `multiple`"
    );
    let f = page.resolve_all("css:#f", None).unwrap()[0];
    assert_eq!(page.files(f), vec!["/tmp/a.txt".to_owned()]);
    let content = page.observe_now(&ObservationRequest::default());
    let file_field = content
        .elements
        .iter()
        .find(|e| e.type_.as_deref() == Some("file"))
        .unwrap();
    assert_eq!(file_field.value.as_deref(), Some("/tmp/a.txt"));
}

// ---------------------------------------------------------------------------
// Targets, actionability, epochs, settle
// ---------------------------------------------------------------------------

#[test]
fn actionability_names_the_failing_predicate() {
    let mut page = new_page(
        r##"<button id=dis disabled>Off</button>
           <fieldset disabled><button id=infs>In fieldset</button></fieldset>
           <button id=hid style="display:none">Hidden</button>
           <button id=vis style="visibility:hidden">Invisible</button>
           <button id=ok>Fine</button>
           <div style="position:relative"><button id=cov>Covered</button>
             <div id=cover style="position:absolute;left:0;top:0;width:400px;height:100px;background:#fff"></div></div>"##,
    );
    let result = run(
        &mut page,
        r##"[{"id":"1","op":"click","target":"css:#dis","timeoutMs":10,"optional":true},
            {"id":"2","op":"click","target":"css:#infs","timeoutMs":10,"optional":true},
            {"id":"3","op":"click","target":"css:#hid","timeoutMs":10,"optional":true},
            {"id":"4","op":"click","target":"css:#vis","timeoutMs":10,"optional":true},
            {"id":"5","op":"click","target":"css:#cov","timeoutMs":10,"optional":true},
            {"id":"6","op":"click","target":"css:#ok"}]"##,
    );
    assert_eq!(result.status, ProgramStatus::Completed);
    let predicate = |i: usize| -> String {
        let err = result.steps[i].error.as_ref().unwrap();
        assert_eq!(err.code, ErrorCode::StepFailed, "step {i}: {err:?}");
        err.detail
            .as_ref()
            .and_then(|d| d["predicate"].as_str())
            .unwrap_or_else(|| panic!("step {i} lacks detail.predicate: {err:?}"))
            .to_owned()
    };
    assert_eq!(predicate(0), "enabled");
    assert_eq!(predicate(1), "enabled");
    assert_eq!(predicate(2), "shown");
    assert_eq!(predicate(3), "shown");
    assert_eq!(predicate(4), "unoccluded");
    assert_eq!(result.steps[5].status, StepStatus::Ok);
}

#[test]
fn target_resolution_errors_carry_exact_codes_and_candidates() {
    let buttons: String = (0..7)
        .map(|i| format!("<button class=dup>Dup {i}</button>"))
        .collect();
    let mut page = new_page(&format!(
        "<div id=root>{buttons}<button id=one>One</button><span id=gone>bye</span></div>"
    ));
    let gone_ref = reference(&page, "css:#gone");
    let gone = page.resolve_all("css:#gone", None).unwrap()[0];
    let epoch = page.generation();

    let result = run(
        &mut page,
        r##"[{"id":"a","op":"click","target":"css:.dup","optional":true},
            {"id":"b","op":"click","target":"css:#nothing","optional":true},
            {"id":"c","op":"click","target":"r999999","optional":true},
            {"id":"d","op":"click","target":"role=button[name=\"One\"]"},
            {"id":"e","op":"click","target":"text=Dup 3"}]"##,
    );
    assert_eq!(
        result.status,
        ProgramStatus::Completed,
        "{:?}",
        result.error
    );
    let ambiguous = result.steps[0].error.as_ref().unwrap();
    assert_eq!(ambiguous.code, ErrorCode::TargetAmbiguous);
    let candidates = ambiguous.detail.as_ref().unwrap()["candidates"]
        .as_array()
        .unwrap();
    assert_eq!(
        candidates.len(),
        5,
        "first five candidate refs: {candidates:?}"
    );
    assert!(
        candidates
            .iter()
            .all(|c| c["ref"].as_str().is_some_and(|r| r.starts_with('r')))
    );
    assert_eq!(error_code(&result, 1), ErrorCode::NotFound);
    assert_eq!(
        error_code(&result, 2),
        ErrorCode::NotFound,
        "never-allocated ref"
    );
    assert_eq!(result.steps[3].status, StepStatus::Ok);
    assert_eq!(
        result.steps[4].status,
        StepStatus::Ok,
        "exact text match wins over substring"
    );

    // Detach the span, then use its old ref: tombstone → target_detached.
    page.document_mut().remove(gone).unwrap();
    let result = run(
        &mut page,
        &format!(r##"[{{"id":"g","op":"click","target":"{gone_ref}"}}]"##),
    );
    assert_eq!(error_code(&result, 0), ErrorCode::TargetDetached);

    // Epoch mismatch → target_detached before anything runs.
    let one = reference(&page, "css:#one");
    let program = serde_json::json!({
        "documentEpoch": epoch + 1,
        "steps": [{ "id": "s", "op": "click", "target": one }]
    });
    let result = page.execute(&Program::from_value(program).unwrap());
    assert_eq!(error_code(&result, 0), ErrorCode::TargetDetached);
}

#[test]
fn programs_skip_after_failure_and_honour_optional() {
    let mut page = new_page("<button id=a>A</button><button id=b>B</button>");
    let result = run(
        &mut page,
        r##"[{"id":"1","op":"click","target":"css:#a"},
            {"id":"2","op":"click","target":"css:#missing"},
            {"id":"3","op":"click","target":"css:#b"}]"##,
    );
    assert_eq!(result.status, ProgramStatus::Failed);
    assert_eq!(result.steps[0].status, StepStatus::Ok);
    assert_eq!(result.steps[1].status, StepStatus::Failed);
    assert_eq!(result.steps[2].status, StepStatus::Skipped);
    assert!(result.error.as_deref().unwrap().starts_with("2: "));
    assert_eq!(result.steps[2].duration_ms, 0);
    assert!(result.steps[0].started_at > 1_600_000_000_000);
}

#[test]
fn settle_reports_blocking_fetches_and_layout_state() {
    let recorder = Recorder {
        in_flight: vec![
            InFlightSummary {
                url: "https://t.test/api".into(),
                age_ms: 10,
                background: false,
            },
            InFlightSummary {
                url: "https://t.test/stream".into(),
                age_ms: 10,
                background: true,
            },
            InFlightSummary {
                url: "https://t.test/slow".into(),
                age_ms: 5_000,
                background: false,
            },
        ],
        ..Recorder::default()
    };
    let mut page = page_with("<p>x</p>", recorder);
    let settled = page.settle(500);
    assert!(!settled.settled);
    assert_eq!(
        settled.reasons,
        vec!["fetch(1)".to_owned(), "fetch-old(2)".to_owned()]
    );
    assert_eq!(
        settled.detail().as_deref(),
        Some("settled=false: fetch(1) fetch-old(2)")
    );
    let result = run(
        &mut page,
        r##"[{"id":"s","op":"scroll","direction":"down"}]"##,
    );
    assert_ok(&result);
    assert!(
        result.steps[0]
            .detail
            .as_deref()
            .unwrap()
            .ends_with("; settled=false: fetch(1) fetch-old(2)")
    );

    let mut page = new_page("<p>x</p>");
    let settled = page.settle(500);
    assert!(settled.settled && settled.reasons.is_empty());
    let observation = page.observe(&ObservationRequest::default()).unwrap();
    assert!(observation.settled.settled);
    assert_eq!(observation.document_epoch, 0);
}

#[test]
fn observe_reports_changes_since_and_epoch_rollover() {
    let recorder = Recorder::default().serve(
        "https://t.test/two",
        "<title>Two</title><h1>Second page</h1>",
    );
    let mut page = page_with(
        r##"<title>One</title><label for=n>Name</label><input id=n><a href=/two>Two</a>"##,
        recorder,
    );
    let first = page.observe(&ObservationRequest::default()).unwrap();
    assert_ok(&run(
        &mut page,
        r##"[{"id":"f","op":"fill","target":"label=Name","value":"Ada"}]"##,
    ));
    let second = page
        .observe(&ObservationRequest {
            since_revision: Some(first.revision),
            ..ObservationRequest::default()
        })
        .unwrap();
    assert!(second.revision > first.revision);
    let changes = second.changes_since.as_ref().expect("changesSince");
    assert!(changes.iter().any(|c| c.contains("Ada")), "{changes:?}");
    assert!(second.delta.is_none(), "Compact carries lines only");

    assert_ok(&run(
        &mut page,
        r##"[{"id":"c","op":"click","target":"text=Two"}]"##,
    ));
    let third = page
        .observe(&ObservationRequest {
            since_revision: Some(second.revision),
            ..ObservationRequest::default()
        })
        .unwrap();
    assert_eq!(third.document_epoch, 1);
    let changes = third.changes_since.as_ref().expect("epoch change reported");
    assert!(
        changes.iter().any(|c| c.contains("document epoch 0 → 1")),
        "{changes:?}"
    );
    assert!(changes.iter().any(|c| c.contains("~ url")), "{changes:?}");

    // Unknown revision: full snapshot, no delta.
    let fourth = page
        .observe(&ObservationRequest {
            since_revision: Some(999_999),
            ..ObservationRequest::default()
        })
        .unwrap();
    assert!(fourth.changes_since.is_none());
}

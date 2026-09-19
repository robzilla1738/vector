//! Subresource pipeline (plan A11): external stylesheets (+ `@import`),
//! image natural sizes and external scripts are fetched at load in one
//! batch and feed the cascade, layout and the page's script list.

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use ve_agent::{
    DEFAULT_VIEWPORT, Format, LoadedDocument, LoadedResource, Loader, NavigationRequest,
    ObservationRequest, Page, SubresourceRequest,
};
use ve_core::{Error, Result};

/// 8×4 opaque PNG (header is all `imagesize` needs).
const PNG_8X4: &[u8] = &[
    0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, b'I', b'H', b'D', b'R', 0, 0, 0,
    8, 0, 0, 0, 4, 8, 2, 0, 0, 0, 0, 0, 0, 0,
];

#[derive(Default)]
struct Site {
    docs: HashMap<String, String>,
    files: HashMap<String, (Vec<u8>, &'static str)>,
    /// every subresource batch the page asked for (URLs, in order)
    batches: Rc<RefCell<Vec<Vec<String>>>>,
}

impl Loader for Site {
    fn load(&mut self, request: &NavigationRequest) -> Result<LoadedDocument> {
        self.docs
            .get(&request.url)
            .map(|html| LoadedDocument::html(&request.url, html))
            .ok_or_else(|| Error::Network(format!("no doc {}", request.url)))
    }
    fn fetch_subresources(
        &mut self,
        requests: &[SubresourceRequest],
    ) -> Vec<Result<LoadedResource>> {
        self.batches
            .borrow_mut()
            .push(requests.iter().map(|r| r.url.clone()).collect());
        requests
            .iter()
            .map(|r| match self.files.get(&r.url) {
                Some((bytes, ct)) => Ok(LoadedResource {
                    url: r.url.clone(),
                    bytes: bytes.clone(),
                    content_type: Some((*ct).to_owned()),
                    status: 200,
                    corp: None,
                }),
                None => Ok(LoadedResource {
                    url: r.url.clone(),
                    bytes: Vec::new(),
                    content_type: None,
                    status: 404,
                    corp: None,
                }),
            })
            .collect()
    }
    fn preconnect(&mut self, urls: &[String]) {
        self.batches
            .borrow_mut()
            .push(urls.iter().map(|u| format!("preconnect:{u}")).collect());
    }
}

#[test]
fn stylesheets_imports_images_and_scripts_load_in_batches() {
    let mut site = Site::default();
    site.docs.insert(
        "https://s.test/".into(),
        r#"<!doctype html><html><head>
             <style>#x{margin:0}</style>
             <link rel=stylesheet href="/css/a.css">
             <link rel=stylesheet href="/css/print.css" media=print>
             <link rel="alternate stylesheet" href="/css/alt.css">
             <script src="/js/app.js" defer></script>
             <script type="application/ld+json">{"a":1}</script>
           </head><body style="margin:0">
             <div id=x>box</div>
             <img id=i src="/img/i.png">
             <img id=j src="/img/i.png" width=16>
             <img id=k src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAIAAAAAAAAAAAAAAA==">
             <script>inline()</script>
           </body></html>"#
            .into(),
    );
    site.files.insert(
        "https://s.test/css/a.css".into(),
        (
            b"@charset \"utf-8\"; @import url(\"b.css\"); #x{width:100px;height:10px}".to_vec(),
            "text/css",
        ),
    );
    // the import is fetched in a second batch and precedes a.css in the cascade,
    // so a.css's height wins over b.css's, while b.css's color survives
    site.files.insert(
        "https://s.test/css/b.css".into(),
        (b"#x{height:30px;color:rgb(1,2,3)}".to_vec(), "text/css"),
    );
    site.files.insert(
        "https://s.test/img/i.png".into(),
        (PNG_8X4.to_vec(), "image/png"),
    );
    site.files.insert(
        "https://s.test/js/app.js".into(),
        (b"console.log(1)".to_vec(), "text/javascript"),
    );
    let batches = site.batches.clone();

    let mut page = Page::open(1, Box::new(site), "https://s.test/", DEFAULT_VIEWPORT).unwrap();

    // two batches: the discovered resources, then the @import
    let b = batches.borrow();
    assert_eq!(b.len(), 2, "batches: {b:?}");
    assert_eq!(
        b[0],
        vec![
            "https://s.test/css/a.css",
            "https://s.test/js/app.js",
            "https://s.test/img/i.png",
            "https://s.test/img/i.png"
        ],
        "print/alternate sheets, JSON blocks and sized/data images are not fetched"
    );
    assert_eq!(b[1], vec!["https://s.test/css/b.css"]);
    drop(b);

    let stats = page.load_stats().clone();
    assert_eq!(
        (stats.stylesheets, stats.images, stats.scripts, stats.failed),
        (2, 3, 1, 0)
    );

    let obs = page
        .observe(&ObservationRequest {
            format: Format::Full,
            ..ObservationRequest::default()
        })
        .unwrap()
        .content;
    let rect = |id: &str| {
        let node = page.document().element_by_id(id).unwrap();
        page.layout_tree().rect_of(node).unwrap()
    };
    let x = rect("x");
    assert_eq!(
        (x.width(), x.height()),
        (100.0, 10.0),
        "a.css applies, and wins over its import"
    );
    let i = rect("i");
    assert_eq!(
        (i.width(), i.height()),
        (8.0, 4.0),
        "natural size from the fetched PNG header"
    );
    let j = rect("j");
    assert_eq!(
        (j.width(), j.height()),
        (16.0, 8.0),
        "width attribute scales by the natural ratio"
    );
    let k = rect("k");
    assert_eq!(
        (k.width(), k.height()),
        (8.0, 4.0),
        "data: image decoded without a fetch"
    );
    assert!(obs.elements.iter().all(|e| e.tag != "script"));

    let scripts = page.scripts();
    assert_eq!(scripts.len(), 2);
    assert_eq!(scripts[0].url.as_deref(), Some("https://s.test/js/app.js"));
    assert_eq!(scripts[0].source, "console.log(1)");
    assert!(scripts[0].defer && !scripts[0].module && !scripts[0].failed);
    assert_eq!(scripts[1].url, None);
    assert_eq!(scripts[1].source.trim(), "inline()");
}

#[test]
fn a_failed_stylesheet_or_script_does_not_break_the_load() {
    let mut site = Site::default();
    site.docs.insert(
        "https://s.test/".into(),
        r#"<link rel=stylesheet href="/missing.css"><script src="/missing.js"></script><p id=p>ok</p>"#.into(),
    );
    let page = Page::open(1, Box::new(site), "https://s.test/", DEFAULT_VIEWPORT).unwrap();
    assert_eq!(page.load_stats().failed, 2);
    assert!(page.scripts()[0].failed);
    assert!(page.document().element_by_id("p").is_some());
}

#[test]
fn font_face_src_is_fetched_and_installed() {
    let mut site = Site::default();
    site.docs.insert(
        "https://s.test/".into(),
        r#"<!doctype html><html><head>
             <style>
               @font-face { font-family: InterTest; src: url("/fonts/inter.ttf"); }
               p { font-family: InterTest, sans-serif }
             </style>
           </head><body><p id=p>Hi</p></body></html>"#
            .into(),
    );
    let font_bytes = std::fs::read("/usr/share/fonts/truetype/macos/Inter-Regular.ttf")
        .unwrap_or_else(|_| b"not-a-font".to_vec());
    site.files.insert(
        "https://s.test/fonts/inter.ttf".into(),
        (font_bytes, "font/ttf"),
    );
    let batches = site.batches.clone();
    let page = Page::open(1, Box::new(site), "https://s.test/", DEFAULT_VIEWPORT).unwrap();
    let b = batches.borrow();
    assert!(
        b.iter()
            .any(|batch| batch.iter().any(|u| u.ends_with("/fonts/inter.ttf"))),
        "font-face src must be fetched: {b:?}"
    );
    assert_eq!(page.load_stats().fonts, 1);
}

#[test]
fn css_animation_interpolates_opacity_from_keyframes() {
    let mut page = Page::from_html(
        1,
        r#"<style>
            @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
            #box { animation: fade 1000ms; width: 10px; height: 10px }
           </style><div id=box>x</div>"#,
        None,
        DEFAULT_VIEWPORT,
    );
    let id = page.document().element_by_id("box").unwrap();
    assert!(
        (page.style_tree().style(id).opacity - 0.0).abs() < 1e-4,
        "t=0 uses the from keyframe"
    );
    page.pump_virtual_time(500);
    page.update();
    let mid = page.style_tree().style(id).opacity;
    assert!(
        (mid - 0.5).abs() < 0.05,
        "mid-animation opacity was {mid}"
    );
}

#[test]
fn css_animation_respects_delay_and_fill() {
    let mut page = Page::from_html(
        1,
        r#"<style>
            @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
            #box { animation: fade 1000ms 500ms both; width: 10px; height: 10px }
           </style><div id=box>x</div>"#,
        None,
        DEFAULT_VIEWPORT,
    );
    let id = page.document().element_by_id("box").unwrap();
    assert!(
        (page.style_tree().style(id).opacity - 0.0).abs() < 1e-4,
        "backwards fill uses the from keyframe during delay"
    );
    page.pump_virtual_time(500);
    page.update();
    assert!(
        (page.style_tree().style(id).opacity - 0.0).abs() < 0.05,
        "animation starts after delay"
    );
    page.pump_virtual_time(500);
    page.update();
    let mid = page.style_tree().style(id).opacity;
    assert!((mid - 0.5).abs() < 0.08, "mid-active opacity was {mid}");
    page.pump_virtual_time(2000);
    page.update();
    assert!(
        (page.style_tree().style(id).opacity - 1.0).abs() < 0.05,
        "forwards fill holds the last keyframe"
    );
}

#[test]
fn preconnect_and_prefetch_are_issued() {
    let mut site = Site::default();
    site.docs.insert(
        "https://s.test/".into(),
        r#"<!doctype html><html><head>
             <link rel=preconnect href="https://cdn.test">
             <link rel="dns-prefetch" href="https://fonts.test">
             <link rel=prefetch href="/next.html">
             <link rel=stylesheet href="/css/a.css">
           </head><body><p id=p>ok</p></body></html>"#
            .into(),
    );
    site.files.insert(
        "https://s.test/css/a.css".into(),
        (b"#p{color:rgb(1,2,3)}".to_vec(), "text/css"),
    );
    site.files.insert(
        "https://s.test/next.html".into(),
        (b"<p>next</p>".to_vec(), "text/html"),
    );
    let batches = site.batches.clone();
    let page = Page::open(1, Box::new(site), "https://s.test/", DEFAULT_VIEWPORT).unwrap();
    let stats = page.load_stats();
    assert_eq!(stats.preconnects, 2, "{stats:?}");
    assert_eq!(stats.prefetches, 1, "{stats:?}");
    assert_eq!(stats.stylesheets, 1, "{stats:?}");
    let b = batches.borrow();
    assert!(
        b.iter().any(|batch| batch.iter().any(|u| u.starts_with("preconnect:https://cdn.test"))),
        "preconnect batch: {b:?}"
    );
    assert!(
        b.iter().any(|batch| batch.iter().any(|u| u == "https://s.test/next.html")),
        "prefetch in fetch batch: {b:?}"
    );
}

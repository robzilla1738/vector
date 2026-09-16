//! Post-layout routing: a document full of hidden text must not stay on the
//! engine just because `classify()` saw the HTML.

use ve_agent::{DEFAULT_VIEWPORT, Page};

fn lorem() -> String {
    "Lorem ipsum dolor sit amet consectetur adipiscing elit. ".repeat(20)
}

#[test]
fn hidden_document_text_is_routed_to_chromium() {
    let page = Page::from_html(
        1,
        &format!(
            "<style>main{{display:none}}</style>\
             <header style=\"height:48px;background:#111\"></header>\
             <main><h1>News</h1><p>{}</p></main>",
            lorem()
        ),
        Some("https://news.test/"),
        DEFAULT_VIEWPORT,
    );
    assert!(
        page.routing().requires_script,
        "{}",
        page.routing().route_reason
    );
    assert!(
        page.routing().route_reason.starts_with("empty-viewport"),
        "{}",
        page.routing().route_reason
    );
}

#[test]
fn visible_document_text_stays_on_the_engine() {
    let page = Page::from_html(
        1,
        &format!("<main><h1>Guide</h1><p>{}</p></main>", lorem()),
        Some("https://docs.test/"),
        DEFAULT_VIEWPORT,
    );
    assert!(
        !page.routing().requires_script,
        "{}",
        page.routing().route_reason
    );
}

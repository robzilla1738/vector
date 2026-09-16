//! Held-out semantic query vs full observation (VEC-015 / M3).

use ve_agent::{DEFAULT_VIEWPORT, ObservationRequest, Page, Scope};

#[test]
fn scoped_forms_query_is_narrower_than_full() {
    let links: String = (0..20)
        .map(|i| format!(r#"<a href="/item/{i}">item {i}</a>"#))
        .collect();
    let html = format!(
        "<body>{links}<form><label>Q <input name=q></label><button>Go</button></form></body>"
    );
    let mut page = Page::from_html(1, &html, Some("https://t.test/task"), DEFAULT_VIEWPORT);
    let full = page
        .observe(&ObservationRequest {
            scope: Scope::Full,
            ..ObservationRequest::default()
        })
        .unwrap();
    let forms = page
        .observe(&ObservationRequest {
            scope: Scope::Forms,
            ..ObservationRequest::default()
        })
        .unwrap();
    assert!(
        !full.content.links.is_empty(),
        "full projection keeps links: {:?}",
        full.content.links.len()
    );
    assert!(
        forms.content.links.is_empty(),
        "forms scope must drop unrelated links"
    );
    assert!(
        !forms.content.form_fields.is_empty(),
        "forms scope keeps the held-out task's fields"
    );
    assert!(
        forms.content.elements.len() <= full.content.elements.len(),
        "forms {} full {}",
        forms.content.elements.len(),
        full.content.elements.len()
    );
}

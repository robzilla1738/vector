//! Form submission: form owner, the entry list ("constructing the form data
//! set"), and the three encodings (`application/x-www-form-urlencoded`,
//! `multipart/form-data`, `text/plain`).

use ve_core::NodeId;
use ve_dom::{Document, ElementData};

/// HTTP method of a submission.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FormMethod {
    /// `GET`: entries become the query string.
    Get,
    /// `POST`: entries become the body.
    Post,
    /// `dialog`: closes the enclosing `<dialog>`.
    Dialog,
}

/// Body encoding.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Enctype {
    /// `application/x-www-form-urlencoded`.
    UrlEncoded,
    /// `multipart/form-data`.
    Multipart,
    /// `text/plain`.
    TextPlain,
}

/// One entry of the form data set.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Entry {
    /// Field name.
    pub name: String,
    /// Field value (or file name for file inputs).
    pub value: String,
    /// `true` when the entry came from a file input.
    pub is_file: bool,
}

/// A fully resolved submission.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Submission {
    /// Method.
    pub method: FormMethod,
    /// Action URL as written (unresolved).
    pub action: String,
    /// Encoding.
    pub enctype: Enctype,
    /// Entries in tree order.
    pub entries: Vec<Entry>,
    /// `target` attribute.
    pub target: Option<String>,
}

/// The form owner of `control`: the `form` attribute's element, else the
/// nearest `<form>` ancestor.
#[must_use]
pub fn form_owner(doc: &Document, control: NodeId) -> Option<NodeId> {
    if let Some(form_id) = doc.attribute(control, "form")
        && let Some(form) = doc.element_by_id(form_id)
        && doc.element(form).is_some_and(|e| e.is_html("form"))
    {
        return Some(form);
    }
    doc.ancestors(control)
        .find(|&a| doc.element(a).is_some_and(|e| e.is_html("form")))
}

fn in_disabled_fieldset(doc: &Document, id: NodeId) -> bool {
    doc.ancestors(id).any(|a| {
        doc.element(a)
            .is_some_and(|e| e.is_html("fieldset") && e.has_attr("disabled"))
    })
}

/// Whether `id` is a submit button (`button` without `type=button|reset`,
/// `input[type=submit|image]`).
#[must_use]
pub fn is_submit_button(e: &ElementData) -> bool {
    match e.name.as_str() {
        "button" => !e
            .attr("type")
            .is_some_and(|t| t.eq_ignore_ascii_case("button") || t.eq_ignore_ascii_case("reset")),
        "input" => e
            .attr("type")
            .is_some_and(|t| t.eq_ignore_ascii_case("submit") || t.eq_ignore_ascii_case("image")),
        _ => false,
    }
}

/// The form's default button: the first submit button in tree order whose
/// form owner is `form`.
#[must_use]
pub fn default_button(doc: &Document, form: NodeId) -> Option<NodeId> {
    doc.elements().find(|&id| {
        doc.element(id).is_some_and(is_submit_button)
            && !doc.attribute(id, "disabled").is_some()
            && form_owner(doc, id) == Some(form)
    })
}

/// Constructs the form data set for `form` with `submitter` (a submit
/// button whose name/value participate), per HTML "constructing the entry
/// list". `files` supplies the selected file names for file inputs.
#[must_use]
pub fn entry_list(
    doc: &Document,
    form: NodeId,
    submitter: Option<NodeId>,
    files: &dyn Fn(NodeId) -> Vec<String>,
) -> Vec<Entry> {
    let mut entries = Vec::new();
    for id in doc.elements() {
        let Some(e) = doc.element(id) else { continue };
        if !matches!(e.name.as_str(), "input" | "select" | "textarea" | "button") {
            continue;
        }
        if form_owner(doc, id) != Some(form) {
            continue;
        }
        if e.has_attr("disabled") || in_disabled_fieldset(doc, id) {
            continue;
        }
        if doc.ancestors(id).any(|a| doc.element(a).is_some_and(|p| p.is_html("datalist"))) {
            continue;
        }
        let is_button = e.is_html("button")
            || (e.is_html("input")
                && e.attr("type").is_some_and(|t| {
                    matches!(
                        t.to_ascii_lowercase().as_str(),
                        "submit" | "button" | "reset" | "image"
                    )
                }));
        if is_button && submitter != Some(id) {
            continue;
        }
        let Some(name) = e.attr("name").filter(|n| !n.is_empty()) else {
            continue;
        };
        let name = name.to_owned();
        match e.name.as_str() {
            "select" => {
                for option in doc.descendants(id).filter(|&d| {
                    doc.element(d).is_some_and(|o| o.is_html("option") && !o.has_attr("disabled"))
                }) {
                    if doc.is_selected(option) {
                        let value = doc
                            .attribute(option, "value")
                            .map_or_else(|| doc.text_content(option).trim().to_owned(), str::to_owned);
                        entries.push(Entry {
                            name: name.clone(),
                            value,
                            is_file: false,
                        });
                    }
                }
                // A single-select with nothing explicitly selected submits its first option.
                if !e.has_attr("multiple")
                    && !doc.descendants(id).any(|d| {
                        doc.element(d).is_some_and(|o| o.is_html("option")) && doc.is_selected(d)
                    })
                    && let Some(first) = doc
                        .descendants(id)
                        .find(|&d| doc.element(d).is_some_and(|o| o.is_html("option") && !o.has_attr("disabled")))
                {
                    let value = doc
                        .attribute(first, "value")
                        .map_or_else(|| doc.text_content(first).trim().to_owned(), str::to_owned);
                    entries.push(Entry {
                        name,
                        value,
                        is_file: false,
                    });
                }
            }
            "textarea" => entries.push(Entry {
                name,
                value: doc.form_value(id).unwrap_or_default(),
                is_file: false,
            }),
            "input" => {
                let ty = e
                    .attr("type")
                    .map(str::to_ascii_lowercase)
                    .unwrap_or_else(|| "text".into());
                match ty.as_str() {
                    "checkbox" | "radio" => {
                        if doc.is_checked(id) {
                            entries.push(Entry {
                                name,
                                value: e.attr("value").unwrap_or("on").to_owned(),
                                is_file: false,
                            });
                        }
                    }
                    "file" => {
                        let selected = files(id);
                        if selected.is_empty() {
                            entries.push(Entry {
                                name,
                                value: String::new(),
                                is_file: true,
                            });
                        } else {
                            for f in selected {
                                entries.push(Entry {
                                    name: name.clone(),
                                    value: f,
                                    is_file: true,
                                });
                            }
                        }
                    }
                    "image" => {
                        entries.push(Entry {
                            name: format!("{name}.x"),
                            value: "0".into(),
                            is_file: false,
                        });
                        entries.push(Entry {
                            name: format!("{name}.y"),
                            value: "0".into(),
                            is_file: false,
                        });
                    }
                    _ => entries.push(Entry {
                        name,
                        value: doc.form_value(id).unwrap_or_default(),
                        is_file: false,
                    }),
                }
            }
            "button" => entries.push(Entry {
                name,
                value: e.attr("value").unwrap_or_default().to_owned(),
                is_file: false,
            }),
            _ => {}
        }
    }
    entries
}

/// Resolves method, action, enctype and target for `form` submitted by
/// `submitter` (`formmethod` / `formaction` / `formenctype` / `formtarget`
/// override the form's attributes).
#[must_use]
pub fn plan_submission(
    doc: &Document,
    form: NodeId,
    submitter: Option<NodeId>,
    files: &dyn Fn(NodeId) -> Vec<String>,
) -> Submission {
    let attr = |name: &str, override_name: &str| -> Option<String> {
        submitter
            .and_then(|s| doc.attribute(s, override_name))
            .or_else(|| doc.attribute(form, name))
            .map(str::to_owned)
    };
    let method = match attr("method", "formmethod")
        .map(|m| m.to_ascii_lowercase())
        .as_deref()
    {
        Some("post") => FormMethod::Post,
        Some("dialog") => FormMethod::Dialog,
        _ => FormMethod::Get,
    };
    let enctype = match attr("enctype", "formenctype")
        .map(|m| m.to_ascii_lowercase())
        .as_deref()
    {
        Some("multipart/form-data") => Enctype::Multipart,
        Some("text/plain") => Enctype::TextPlain,
        _ => Enctype::UrlEncoded,
    };
    Submission {
        method,
        action: attr("action", "formaction").unwrap_or_default(),
        enctype,
        entries: entry_list(doc, form, submitter, files),
        target: attr("target", "formtarget"),
    }
}

/// `application/x-www-form-urlencoded` serialisation.
#[must_use]
pub fn urlencode(entries: &[Entry]) -> String {
    entries
        .iter()
        .map(|e| {
            format!(
                "{}={}",
                form_urlencode_component(&e.name),
                form_urlencode_component(&e.value)
            )
        })
        .collect::<Vec<_>>()
        .join("&")
}

/// Percent-encodes per the urlencoded serializer (space → `+`).
#[must_use]
pub fn form_urlencode_component(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for b in s.bytes() {
        match b {
            b'*' | b'-' | b'.' | b'_' | b'0'..=b'9' | b'A'..=b'Z' | b'a'..=b'z' => {
                out.push(b as char);
            }
            b' ' => out.push('+'),
            other => out.push_str(&format!("%{other:02X}")),
        }
    }
    out
}

/// `multipart/form-data` body and its `Content-Type` (with boundary).
#[must_use]
pub fn multipart(entries: &[Entry], boundary: &str) -> (Vec<u8>, String) {
    let mut body = Vec::new();
    for e in entries {
        body.extend_from_slice(format!("--{boundary}\r\n").as_bytes());
        let name = e.name.replace('"', "%22");
        if e.is_file {
            let filename = e
                .value
                .rsplit(['/', '\\'])
                .next()
                .unwrap_or("")
                .replace('"', "%22");
            body.extend_from_slice(
                format!(
                    "Content-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\nContent-Type: application/octet-stream\r\n\r\n"
                )
                .as_bytes(),
            );
            // File contents are not read by the engine (caller-vetted paths only).
        } else {
            body.extend_from_slice(
                format!("Content-Disposition: form-data; name=\"{name}\"\r\n\r\n").as_bytes(),
            );
            body.extend_from_slice(e.value.as_bytes());
        }
        body.extend_from_slice(b"\r\n");
    }
    body.extend_from_slice(format!("--{boundary}--\r\n").as_bytes());
    (body, format!("multipart/form-data; boundary={boundary}"))
}

/// `text/plain` body.
#[must_use]
pub fn text_plain(entries: &[Entry]) -> String {
    entries
        .iter()
        .map(|e| format!("{}={}\r\n", e.name, e.value))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    const FORM: &str = r#"<form id=f method=post action="/save" enctype="multipart/form-data">
        <input name=title value="Hello world">
        <input type=checkbox name=flag checked><input type=checkbox name=off>
        <input type=radio name=r value=a><input type=radio name=r value=b checked>
        <select name=status><option value="">All</option><option value=draft selected>Draft</option></select>
        <select name=first><option value=x>X</option><option value=y>Y</option></select>
        <textarea name=notes>line</textarea>
        <input type=hidden name=csrf value=tok>
        <fieldset disabled><input name=locked value=1></fieldset>
        <input value=nameless-skipped>
        <input type=file name=doc>
        <button name=do value=save formmethod=get formaction="/quick">Save</button>
        <button type=button name=nope value=1>Noop</button>
        </form><input name=outside form=f value=out>"#;

    fn doc() -> Document {
        ve_html::parse_document(FORM).document
    }

    #[test]
    fn entry_list_follows_the_spec() {
        let doc = doc();
        let form = doc.element_by_id("f").unwrap();
        let entries = entry_list(&doc, form, None, &|_| vec![]);
        let pairs: Vec<(String, String)> =
            entries.iter().map(|e| (e.name.clone(), e.value.clone())).collect();
        assert_eq!(
            pairs,
            vec![
                ("title".into(), "Hello world".into()),
                ("flag".into(), "on".into()),
                ("r".into(), "b".into()),
                ("status".into(), "draft".into()),
                ("first".into(), "x".into()),
                ("notes".into(), "line".into()),
                ("csrf".into(), "tok".into()),
                ("doc".into(), String::new()),
                ("outside".into(), "out".into()),
            ]
        );
        assert!(entries[7].is_file);
        let save = doc
            .elements()
            .find(|&e| doc.attribute(e, "name") == Some("do"))
            .unwrap();
        let with_submitter = entry_list(&doc, form, Some(save), &|_| vec!["/tmp/a.pdf".into()]);
        assert!(with_submitter.iter().any(|e| e.name == "do" && e.value == "save"));
        assert!(with_submitter.iter().any(|e| e.name == "doc" && e.value == "/tmp/a.pdf"));
        assert!(!with_submitter.iter().any(|e| e.name == "nope"));
        assert_eq!(default_button(&doc, form), Some(save));
        assert_eq!(form_owner(&doc, save), Some(form));
    }

    #[test]
    fn submission_plan_honours_submitter_overrides() {
        let doc = doc();
        let form = doc.element_by_id("f").unwrap();
        let plain = plan_submission(&doc, form, None, &|_| vec![]);
        assert_eq!((plain.method, plain.enctype, plain.action.as_str()), (FormMethod::Post, Enctype::Multipart, "/save"));
        let save = doc
            .elements()
            .find(|&e| doc.attribute(e, "name") == Some("do"))
            .unwrap();
        let quick = plan_submission(&doc, form, Some(save), &|_| vec![]);
        assert_eq!((quick.method, quick.action.as_str()), (FormMethod::Get, "/quick"));
    }

    #[test]
    fn encodings() {
        let entries = vec![
            Entry {
                name: "q".into(),
                value: "a b&c=d/é".into(),
                is_file: false,
            },
            Entry {
                name: "f".into(),
                value: "/tmp/x y.txt".into(),
                is_file: true,
            },
        ];
        assert_eq!(urlencode(&entries), "q=a+b%26c%3Dd%2F%C3%A9&f=%2Ftmp%2Fx+y.txt");
        let (body, ct) = multipart(&entries, "XYZ");
        let text = String::from_utf8(body).unwrap();
        assert_eq!(ct, "multipart/form-data; boundary=XYZ");
        assert!(text.starts_with("--XYZ\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\na b&c=d/é\r\n--XYZ\r\n"));
        assert!(text.contains("name=\"f\"; filename=\"x y.txt\""));
        assert!(text.ends_with("--XYZ--\r\n"));
        assert_eq!(text_plain(&entries), "q=a b&c=d/é\r\nf=/tmp/x y.txt\r\n");
    }
}

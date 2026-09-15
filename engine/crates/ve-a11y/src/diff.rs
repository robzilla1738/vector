//! Observation diffs: the `changesSince` strings `renderObservation` prints
//! verbatim, and the structured Full `delta` (architecture §5, "Diff format").
//!
//! ```text
//! + r48 button "Delete"              (new element)
//! - r12                              (removed)
//! ~ r7 value="" → "Ada"             (field changed)
//! ~ r31 checked=false → true
//! ~ r5 name="Save" → "Saving…"
//! ~ url /records → /records/17
//! ~ text +3/-1 lines near "Status"
//! ```

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::observation::{ElementRef, ObservationContent};

/// One changed field.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldChange {
    /// `r<index>`.
    #[serde(rename = "ref")]
    pub reference: String,
    /// `value`, `checked`, `name`, `disabled`, `selected`, `href`.
    pub field: String,
    /// Previous value.
    pub from: serde_json::Value,
    /// New value.
    pub to: serde_json::Value,
}

/// One text line operation.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TextOp {
    /// `+` or `-`.
    pub op: String,
    /// The line.
    pub line: String,
}

/// Structured delta (Full format).
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObservationDelta {
    /// Elements present only now.
    pub added: Vec<ElementRef>,
    /// Refs present only before.
    pub removed: Vec<String>,
    /// Field changes on surviving refs.
    pub changed: Vec<FieldChange>,
    /// Text line operations.
    pub text_ops: Vec<TextOp>,
}

impl ObservationDelta {
    /// Nothing changed.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.added.is_empty()
            && self.removed.is_empty()
            && self.changed.is_empty()
            && self.text_ops.is_empty()
    }
}

fn quote(s: &str) -> String {
    serde_json::to_string(s).unwrap_or_else(|_| format!("\"{s}\""))
}

fn describe(e: &ElementRef) -> String {
    let mut out = e.role.clone().unwrap_or_else(|| e.tag.clone());
    if let Some(name) = &e.name {
        out.push(' ');
        out.push_str(&quote(name));
    }
    out
}

/// Shortens a URL for the `~ url` line: the path (+ query) when the origin is
/// unchanged, the full URL otherwise.
fn short_url(url: &str, other: &str) -> String {
    match (url::Url::parse(url), url::Url::parse(other)) {
        (Ok(a), Ok(b)) if a.origin() == b.origin() && a.scheme() != "data" => {
            let mut s = a.path().to_owned();
            if let Some(q) = a.query() {
                s.push('?');
                s.push_str(q);
            }
            if let Some(f) = a.fragment() {
                s.push('#');
                s.push_str(f);
            }
            s
        }
        _ => url.to_owned(),
    }
}

fn opt_json<T: Serialize>(v: Option<&T>) -> serde_json::Value {
    v.map_or(serde_json::Value::Null, |x| {
        serde_json::to_value(x).unwrap_or_default()
    })
}

fn fmt_value(v: &serde_json::Value) -> String {
    match v {
        serde_json::Value::Null => "\"\"".into(),
        serde_json::Value::String(s) => quote(s),
        other => other.to_string(),
    }
}

/// Multiset difference of text lines with an anchor: the last unchanged line
/// before the first change (or the first changed line itself).
fn text_diff(old: &str, new: &str) -> (Vec<TextOp>, Option<String>) {
    if old == new {
        return (Vec::new(), None);
    }
    let old_lines: Vec<&str> = old.lines().collect();
    let new_lines: Vec<&str> = new.lines().collect();
    let mut old_counts: HashMap<&str, usize> = HashMap::new();
    for l in &old_lines {
        *old_counts.entry(l).or_default() += 1;
    }
    let mut new_counts: HashMap<&str, usize> = HashMap::new();
    for l in &new_lines {
        *new_counts.entry(l).or_default() += 1;
    }
    let mut ops = Vec::new();
    let mut anchor: Option<String> = None;
    let mut last_common: Option<&str> = None;
    for l in &new_lines {
        let old_n = old_counts.get(l).copied().unwrap_or(0);
        let new_n = new_counts.get(l).copied().unwrap_or(0);
        if new_n > old_n {
            if anchor.is_none() {
                anchor = Some(last_common.unwrap_or(l).to_owned());
            }
            ops.push(TextOp {
                op: "+".into(),
                line: (*l).to_owned(),
            });
            // Consume one occurrence so duplicates are counted once each.
            *new_counts.get_mut(l).expect("present") -= 1;
        } else {
            last_common = Some(l);
        }
    }
    last_common = None;
    for l in &old_lines {
        let old_n = old_counts.get(l).copied().unwrap_or(0);
        let new_n = new_counts.get(l).copied().unwrap_or(0);
        if old_n > new_n {
            if anchor.is_none() {
                anchor = Some(last_common.unwrap_or(l).to_owned());
            }
            ops.push(TextOp {
                op: "-".into(),
                line: (*l).to_owned(),
            });
            *old_counts.get_mut(l).expect("present") -= 1;
        } else {
            last_common = Some(l);
        }
    }
    (ops, anchor)
}

fn anchor_text(anchor: &str) -> String {
    let trimmed = anchor.trim_start_matches('#').trim();
    let short: String = trimmed.chars().take(24).collect();
    if short.chars().count() < trimmed.chars().count() {
        format!("{short}…")
    } else {
        short
    }
}

/// Computes `changesSince` lines and the structured delta between two
/// observations of the same page.
#[must_use]
pub fn changes_between(
    previous: &ObservationContent,
    current: &ObservationContent,
) -> (Vec<String>, ObservationDelta) {
    let span = ve_core::Stage::Snapshot.span();
    let _guard = span.enter();
    let mut lines = Vec::new();
    let mut delta = ObservationDelta::default();

    if previous.url != current.url {
        lines.push(format!(
            "~ url {} → {}",
            short_url(&previous.url, &current.url),
            short_url(&current.url, &previous.url)
        ));
    }

    let old: HashMap<&str, &ElementRef> = previous
        .elements
        .iter()
        .map(|e| (e.reference.as_str(), e))
        .collect();
    let new: HashMap<&str, &ElementRef> = current
        .elements
        .iter()
        .map(|e| (e.reference.as_str(), e))
        .collect();

    for e in &current.elements {
        match old.get(e.reference.as_str()) {
            None => {
                lines.push(format!("+ {} {}", e.reference, describe(e)));
                delta.added.push(e.clone());
            }
            Some(o) => {
                let fields: [(&str, serde_json::Value, serde_json::Value); 6] = [
                    (
                        "value",
                        opt_json(o.value.as_ref()),
                        opt_json(e.value.as_ref()),
                    ),
                    (
                        "checked",
                        opt_json(o.checked.as_ref()),
                        opt_json(e.checked.as_ref()),
                    ),
                    ("name", opt_json(o.name.as_ref()), opt_json(e.name.as_ref())),
                    (
                        "selected",
                        opt_json(o.selected.as_ref()),
                        opt_json(e.selected.as_ref()),
                    ),
                    (
                        "disabled",
                        opt_json(o.disabled.as_ref()),
                        opt_json(e.disabled.as_ref()),
                    ),
                    ("href", opt_json(o.href.as_ref()), opt_json(e.href.as_ref())),
                ];
                for (field, from, to) in fields {
                    if from == to {
                        continue;
                    }
                    let (from_text, to_text) = match field {
                        "checked" | "disabled" => (
                            from.as_bool().unwrap_or(false).to_string(),
                            to.as_bool().unwrap_or(false).to_string(),
                        ),
                        _ => (fmt_value(&from), fmt_value(&to)),
                    };
                    lines.push(format!("~ {} {field}={from_text} → {to_text}", e.reference));
                    delta.changed.push(FieldChange {
                        reference: e.reference.clone(),
                        field: field.to_owned(),
                        from,
                        to,
                    });
                }
            }
        }
    }
    for e in &previous.elements {
        if !new.contains_key(e.reference.as_str()) {
            lines.push(format!("- {}", e.reference));
            delta.removed.push(e.reference.clone());
        }
    }

    let (ops, anchor) = text_diff(&previous.text, &current.text);
    if !ops.is_empty() {
        let added = ops.iter().filter(|o| o.op == "+").count();
        let removed = ops.len() - added;
        let near = anchor
            .map(|a| format!(" near {}", quote(&anchor_text(&a))))
            .unwrap_or_default();
        lines.push(format!("~ text +{added}/-{removed} lines{near}"));
        delta.text_ops = ops;
    }
    (lines, delta)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn element(reference: &str, role: &str, name: &str) -> ElementRef {
        ElementRef {
            reference: reference.into(),
            frame: "main".into(),
            tag: "div".into(),
            role: Some(role.into()),
            name: (!name.is_empty()).then(|| name.to_owned()),
            ..ElementRef::default()
        }
    }

    #[test]
    fn diff_lines_follow_the_documented_formats() {
        let mut before = ObservationContent {
            url: "https://app.test/records".into(),
            text: "Records\nStatus\nRow 1\nRow 2".into(),
            ..ObservationContent::default()
        };
        before.elements = vec![
            element("r5", "button", "Save"),
            element("r7", "textbox", "Name"),
            element("r12", "link", "Edit"),
            element("r31", "checkbox", "Agree"),
        ];
        before.elements[1].value = Some(String::new());
        before.elements[3].checked = Some(false);

        let mut after = before.clone();
        after.url = "https://app.test/records/17".into();
        after.text = "Records\nStatus\nRow 1\nRow 3\nRow 4\nRow 5".into();
        after.elements[0].name = Some("Saving…".into());
        after.elements[1].value = Some("Ada".into());
        after.elements[3].checked = Some(true);
        after.elements.remove(2);
        after.elements.push(element("r48", "button", "Delete"));

        let (lines, delta) = changes_between(&before, &after);
        assert_eq!(
            lines,
            vec![
                "~ url /records → /records/17",
                "~ r5 name=\"Save\" → \"Saving…\"",
                "~ r7 value=\"\" → \"Ada\"",
                "~ r31 checked=false → true",
                "+ r48 button \"Delete\"",
                "- r12",
                "~ text +3/-1 lines near \"Row 1\"",
            ]
        );
        assert_eq!(delta.added.len(), 1);
        assert_eq!(delta.removed, vec!["r12"]);
        assert_eq!(delta.changed.len(), 3);
        assert_eq!(delta.changed[1].field, "value");
        assert_eq!(delta.changed[1].to, "Ada");
        assert_eq!(delta.text_ops.len(), 4);
        assert!(!delta.is_empty());

        let (none, empty) = changes_between(&after, &after);
        assert!(none.is_empty() && empty.is_empty());
    }

    #[test]
    fn cross_origin_urls_are_printed_in_full() {
        let before = ObservationContent {
            url: "https://a.test/x".into(),
            ..ObservationContent::default()
        };
        let after = ObservationContent {
            url: "https://b.test/y".into(),
            ..ObservationContent::default()
        };
        let (lines, _) = changes_between(&before, &after);
        assert_eq!(lines, vec!["~ url https://a.test/x → https://b.test/y"]);
    }

    #[test]
    fn text_anchor_prefers_the_preceding_unchanged_line() {
        let (ops, anchor) = text_diff("# Title\nA\nB", "# Title\nA\nB\nC");
        assert_eq!(ops.len(), 1);
        assert_eq!(anchor.as_deref(), Some("B"));
        let (ops, anchor) = text_diff("A\nB", "Z\nA\nB");
        assert_eq!(ops[0].line, "Z");
        assert_eq!(
            anchor.as_deref(),
            Some("Z"),
            "no preceding line: the change itself"
        );
        assert_eq!(
            anchor_text("# A very long heading that keeps going"),
            "A very long heading that…"
        );
    }
}

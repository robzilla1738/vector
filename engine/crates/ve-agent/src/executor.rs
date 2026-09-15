//! The step interpreter.

use std::collections::HashSet;
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use ve_core::{Error, NodeId, Result, Revision, Stage};

use crate::page::{Page, outer_html};
use crate::readiness::Readiness;
use crate::steps::{ExtractKind, Presence, Program, Step, Target, WaitCondition};

/// Outcome of one step.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum StepStatus {
    /// The step completed.
    Ok,
    /// The step failed.
    Failed {
        /// Error message.
        error: String,
    },
    /// The step was not run because an earlier step failed.
    Skipped,
}

/// Record of one executed step.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepResult {
    /// Position in the program.
    pub index: usize,
    /// Action name.
    pub action: String,
    /// Outcome.
    #[serde(flatten)]
    pub status: StepStatus,
    /// Step-specific output (extracted value, scroll position, matched refs…).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output: Option<Value>,
    /// Wall-clock duration.
    pub duration_ms: u64,
    /// Readiness after the step settled.
    pub readiness: Readiness,
}

/// Result of running a program.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionReport {
    /// Whether every step succeeded.
    pub ok: bool,
    /// Per-step results.
    pub results: Vec<StepResult>,
    /// Values collected by `extract` and `collectScroll`, keyed by name.
    pub extracted: Map<String, Value>,
    /// Document revision after the last step.
    pub final_revision: Revision,
    /// Final URL.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
}

impl ExecutionReport {
    /// Serialises the report to JSON.
    #[must_use]
    pub fn to_json(&self) -> Value {
        serde_json::to_value(self).expect("report is serialisable")
    }

    /// The first failure, if any.
    #[must_use]
    pub fn first_error(&self) -> Option<&str> {
        self.results.iter().find_map(|r| match &r.status {
            StepStatus::Failed { error } => Some(error.as_str()),
            _ => None,
        })
    }
}

/// Interprets programs against a [`Page`].
#[derive(Clone, Copy, Debug)]
pub struct Executor {
    /// Virtual time advanced per `waitFor` poll.
    pub poll_interval: Duration,
}

impl Default for Executor {
    fn default() -> Self {
        Self {
            poll_interval: Duration::from_millis(50),
        }
    }
}

impl Executor {
    /// Creates an executor with default settings.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Runs `program` to completion (or first failure when `stop_on_error`).
    pub fn run(&self, page: &mut dyn Page, program: &Program) -> ExecutionReport {
        let span = Stage::Agent.span();
        let _guard = span.enter();
        let budget = program.options.max_tasks_per_settle;
        let mut results = Vec::with_capacity(program.steps.len());
        let mut extracted = Map::new();
        let mut failed = false;

        for (index, step) in program.steps.iter().enumerate() {
            if failed && program.options.stop_on_error {
                results.push(StepResult {
                    index,
                    action: step.action().to_owned(),
                    status: StepStatus::Skipped,
                    output: None,
                    duration_ms: 0,
                    readiness: page.readiness(),
                });
                continue;
            }
            let start = Instant::now();
            page.settle(budget);
            let outcome = self.run_step(page, program, step, &mut extracted);
            let readiness = page.settle(budget);
            let (status, output) = match outcome {
                Ok(output) => (StepStatus::Ok, output),
                Err(e) => {
                    failed = true;
                    (
                        StepStatus::Failed {
                            error: e.to_string(),
                        },
                        None,
                    )
                }
            };
            tracing::debug!(index, action = step.action(), ?status, "step");
            results.push(StepResult {
                index,
                action: step.action().to_owned(),
                status,
                output,
                duration_ms: u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX),
                readiness,
            });
        }
        ExecutionReport {
            ok: !failed,
            results,
            extracted,
            final_revision: page.document().revision(),
            url: page.url().map(str::to_owned),
        }
    }

    fn first(page: &dyn Page, target: &Target) -> Result<NodeId> {
        Ok(page.resolve(target)?[0])
    }

    fn run_step(
        &self,
        page: &mut dyn Page,
        program: &Program,
        step: &Step,
        extracted: &mut Map<String, Value>,
    ) -> Result<Option<Value>> {
        match step {
            Step::Click { target } => {
                let id = Self::first(page, target)?;
                page.click(id)?;
                Ok(Some(json!({ "ref": id.to_string() })))
            }
            Step::Fill { target, value } => {
                let id = Self::first(page, target)?;
                page.fill(id, value)?;
                Ok(Some(json!({ "ref": id.to_string() })))
            }
            Step::Select { target, value } => {
                let id = Self::first(page, target)?;
                page.select(id, value)?;
                Ok(Some(json!({ "ref": id.to_string() })))
            }
            Step::Press { key, target } => {
                let id = target.as_ref().map(|t| Self::first(page, t)).transpose()?;
                page.press(id, key)?;
                Ok(page.focused().map(|f| json!({ "focused": f.to_string() })))
            }
            Step::Scroll { target, dx, dy } => {
                let id = target.as_ref().map(|t| Self::first(page, t)).transpose()?;
                let state = page.scroll(id, *dx, *dy)?;
                Ok(Some(serde_json::to_value(state)?))
            }
            Step::Navigate { url } => {
                page.navigate(url)?;
                page.settle(program.options.max_tasks_per_settle);
                if let Some(error) = page.take_last_error() {
                    return Err(Error::Network(error));
                }
                Ok(Some(json!({ "url": page.url() })))
            }
            Step::WaitFor {
                condition,
                timeout_ms,
            } => {
                let timeout =
                    Duration::from_millis(timeout_ms.unwrap_or(program.options.default_timeout_ms));
                self.wait_for(
                    page,
                    condition,
                    timeout,
                    program.options.max_tasks_per_settle,
                )
            }
            Step::Extract { name, what, target } => {
                let value = self.extract(page, target.as_ref(), what)?;
                extracted.insert(name.clone(), value.clone());
                Ok(Some(value))
            }
            Step::CollectScroll {
                name,
                item_selector,
                container,
                max_scrolls,
                step_px,
            } => {
                let value = self.collect_scroll(
                    page,
                    container.as_ref(),
                    item_selector,
                    *max_scrolls,
                    *step_px,
                    program.options.max_tasks_per_settle,
                )?;
                extracted.insert(name.clone(), value.clone());
                Ok(Some(value))
            }
        }
    }

    fn condition_holds(page: &dyn Page, condition: &WaitCondition) -> Result<bool> {
        Ok(match condition {
            WaitCondition::Ready => page.readiness().is_ready(),
            WaitCondition::Selector { selector, state } => {
                let matches = match page.resolve(&Target::selector(selector)) {
                    Ok(m) => m,
                    Err(Error::NoMatch(_)) => Vec::new(),
                    Err(e) => return Err(e),
                };
                match state {
                    Presence::Present => !matches.is_empty(),
                    Presence::Absent => matches.is_empty(),
                    Presence::Visible => matches.iter().any(|&id| {
                        page.style_tree().is_displayed(id)
                            && page
                                .layout_tree()
                                .rect_of(id)
                                .is_some_and(|r| !r.is_empty())
                    }),
                }
            }
            WaitCondition::Text { contains } => {
                let root = page.document().body().unwrap_or(page.document().root());
                page.document()
                    .text_content(root)
                    .contains(contains.as_str())
            }
            WaitCondition::Time { .. } => true,
        })
    }

    fn wait_for(
        &self,
        page: &mut dyn Page,
        condition: &WaitCondition,
        timeout: Duration,
        budget: usize,
    ) -> Result<Option<Value>> {
        if let WaitCondition::Time { ms } = condition {
            page.advance_time(Duration::from_millis(*ms));
            page.settle(budget);
            return Ok(Some(json!({ "waitedMs": ms })));
        }
        let mut waited = Duration::ZERO;
        loop {
            page.settle(budget);
            if Self::condition_holds(page, condition)? {
                return Ok(Some(json!({ "waitedMs": waited.as_millis() as u64 })));
            }
            if waited >= timeout {
                return Err(Error::Timeout {
                    stage: Stage::Agent,
                    millis: u64::try_from(timeout.as_millis()).unwrap_or(u64::MAX),
                });
            }
            let step = self.poll_interval.min(timeout.saturating_sub(waited));
            page.advance_time(step);
            waited += step;
        }
    }

    fn extract(
        &self,
        page: &mut dyn Page,
        target: Option<&Target>,
        what: &ExtractKind,
    ) -> Result<Value> {
        let ids = match target {
            Some(t) => page.resolve(t)?,
            None => page.document().document_element().into_iter().collect(),
        };
        if let ExtractKind::Count = what {
            return Ok(json!(ids.len()));
        }
        if let ExtractKind::Snapshot { format } = what {
            return Ok(match target {
                None => page.snapshot(*format).to_json(),
                Some(_) => {
                    let snaps: Vec<Value> = ids
                        .iter()
                        .filter_map(|&id| page.snapshot_of(id, *format))
                        .map(|s| s.to_json())
                        .collect();
                    if snaps.len() == 1 {
                        snaps.into_iter().next().unwrap_or(Value::Null)
                    } else {
                        Value::Array(snaps)
                    }
                }
            });
        }
        let doc = page.document();
        let one = |id: NodeId| -> Value {
            match what {
                ExtractKind::Text => json!(
                    doc.text_content(id)
                        .split_whitespace()
                        .collect::<Vec<_>>()
                        .join(" ")
                ),
                ExtractKind::Html => json!(outer_html(doc, id)),
                ExtractKind::Attribute { name } => {
                    doc.attribute(id, name).map_or(Value::Null, |v| json!(v))
                }
                ExtractKind::Value => {
                    let value = if doc.element(id).is_some_and(|e| e.is_html("select")) {
                        doc.descendants(id)
                            .filter(|&d| doc.element(d).is_some_and(|e| e.is_html("option")))
                            .find(|&d| doc.is_selected(d))
                            .map(|d| {
                                doc.attribute(d, "value").map_or_else(
                                    || doc.text_content(d).trim().to_owned(),
                                    str::to_owned,
                                )
                            })
                    } else {
                        doc.form_value(id)
                    };
                    value.map_or(Value::Null, |v| json!(v))
                }
                ExtractKind::Rect => page.layout_tree().rect_of(id).map_or(
                    Value::Null,
                    |r| json!({ "x": r.x(), "y": r.y(), "width": r.width(), "height": r.height() }),
                ),
                ExtractKind::Snapshot { .. } | ExtractKind::Count => Value::Null,
            }
        };
        let mut values: Vec<Value> = ids.into_iter().map(one).collect();
        Ok(if values.len() == 1 {
            values.remove(0)
        } else {
            Value::Array(values)
        })
    }

    fn collect_scroll(
        &self,
        page: &mut dyn Page,
        container: Option<&Target>,
        item_selector: &str,
        max_scrolls: u32,
        step_px: f32,
        budget: usize,
    ) -> Result<Value> {
        let container_id = container.map(|t| Self::first(page, t)).transpose()?;
        let mut seen: HashSet<NodeId> = HashSet::new();
        let mut items: Vec<Value> = Vec::new();
        let mut scrolls = 0u32;
        let collect = |page: &dyn Page,
                       seen: &mut HashSet<NodeId>,
                       items: &mut Vec<Value>|
         -> Result<usize> {
            let matches = match page.resolve(&Target::selector(item_selector)) {
                Ok(m) => m,
                Err(Error::NoMatch(_)) => Vec::new(),
                Err(e) => return Err(e),
            };
            let doc = page.document();
            let mut added = 0;
            for id in matches {
                if container_id.is_some_and(|c| !doc.is_ancestor_of(c, id)) || !seen.insert(id) {
                    continue;
                }
                items.push(json!({ "ref": id.to_string(), "text": doc.text_content(id).split_whitespace().collect::<Vec<_>>().join(" ") }));
                added += 1;
            }
            Ok(added)
        };
        collect(page, &mut seen, &mut items)?;
        while scrolls < max_scrolls {
            let state = page.scroll(container_id, 0.0, step_px)?;
            scrolls += 1;
            page.settle(budget);
            let added = collect(page, &mut seen, &mut items)?;
            if state.at_bottom() && added == 0 {
                break;
            }
        }
        Ok(json!({ "items": items, "count": items.len(), "scrolls": scrolls }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::page::DomPage;

    const HTML: &str = r#"<title>Shop</title><body>
        <form><label for=q>Search</label><input id=q placeholder="Find"><button>Go</button></form>
        <input type=checkbox id=c><label for=c>Remember</label>
        <select id=size><option value=s>Small<option value=m>Medium</select>
        <details><summary>Details</summary><p class=hidden-body>Body copy</p></details>
        <ul id=feed><li>Item 1</li><li>Item 2</li></ul>
        <a href="/next" id=next>Next</a></body>"#;

    #[test]
    fn runs_a_program_and_reports_each_step() {
        let program = Program::from_json(
            r##"[
            {"action": "fill", "target": {"by": "label", "label": "Search"}, "value": "boots"},
            {"action": "click", "target": {"by": "text", "text": "Remember"}},
            {"action": "select", "target": {"by": "selector", "selector": "#size"}, "value": "Medium"},
            {"action": "click", "target": {"by": "role", "role": "button", "name": "Details"}},
            {"action": "waitFor", "condition": {"type": "selector", "selector": ".hidden-body", "state": "visible"}, "timeoutMs": 500},
            {"action": "extract", "name": "query", "what": {"type": "value"}, "target": {"by": "selector", "selector": "#q"}},
            {"action": "extract", "name": "size", "what": {"type": "value"}, "target": {"by": "selector", "selector": "#size"}},
            {"action": "extract", "name": "items", "what": {"type": "text"}, "target": {"by": "selector", "selector": "#feed li"}},
            {"action": "extract", "name": "count", "what": {"type": "count"}, "target": {"by": "selector", "selector": "li"}},
            {"action": "extract", "name": "snap", "what": {"type": "snapshot"}},
            {"action": "press", "key": "Tab"},
            {"action": "scroll", "dy": 100}
        ]"##,
        )
        .unwrap();
        let mut page = DomPage::from_html(HTML, Some("https://shop.test/"));
        let report = Executor::new().run(&mut page, &program);
        assert!(report.ok, "{:?}", report.first_error());
        assert_eq!(report.results.len(), 12);
        assert!(report.results.iter().all(|r| r.readiness.is_ready()));
        assert_eq!(report.extracted["query"], "boots");
        assert_eq!(report.extracted["size"], "m");
        assert_eq!(report.extracted["items"], json!(["Item 1", "Item 2"]));
        assert_eq!(report.extracted["count"], 2);
        assert_eq!(report.extracted["snap"]["format"], "compact");
        assert!(
            page.document()
                .is_checked(page.document().element_by_id("c").unwrap())
        );
        let waited = report.results[4].output.as_ref().unwrap()["waitedMs"]
            .as_u64()
            .unwrap();
        assert_eq!(waited, 0, "details opened synchronously");
        assert_eq!(report.to_json()["results"][0]["status"], "ok");
    }

    #[test]
    fn failures_stop_or_continue_and_wait_for_times_out_in_virtual_time() {
        let mut program = Program::from_json(
            r##"[
            {"action": "click", "target": {"by": "selector", "selector": "#missing"}},
            {"action": "extract", "name": "title", "what": {"type": "text"}, "target": {"by": "selector", "selector": "title"}}
        ]"##,
        )
        .unwrap();
        let mut page = DomPage::from_html(HTML, None);
        let report = Executor::new().run(&mut page, &program);
        assert!(!report.ok);
        assert!(matches!(
            report.results[0].status,
            StepStatus::Failed { .. }
        ));
        assert_eq!(report.results[1].status, StepStatus::Skipped);
        assert!(report.first_error().unwrap().contains("#missing"));

        program.options.stop_on_error = false;
        let report = Executor::new().run(&mut page, &program);
        assert_eq!(report.extracted["title"], "Shop");

        let wait = Program::from_json(r#"[{"action": "waitFor", "condition": {"type": "text", "contains": "never"}, "timeoutMs": 200}]"#).unwrap();
        let start = Instant::now();
        let report = Executor::new().run(&mut page, &wait);
        assert!(
            report
                .first_error()
                .unwrap()
                .contains("timed out after 200 ms")
        );
        assert!(
            start.elapsed() < Duration::from_millis(150),
            "virtual time does not sleep"
        );
    }

    #[test]
    fn collect_scroll_and_navigation() {
        let tall: String = (1..=40)
            .map(|i| format!("<li style='height:50px'>Row {i}</li>"))
            .collect();
        let html = format!("<style>body{{margin:0}}</style><ul>{tall}</ul>");
        let mut page = DomPage::from_html_with_viewport(
            &html,
            Some("https://feed.test/"),
            ve_core::Size::new(800.0, 400.0),
        )
        .with_loader(Box::new(|url: &str| {
            Ok(crate::page::LoadedDocument {
                url: url.to_owned(),
                html: "<h1>Second</h1>".into(),
            })
        }));
        let program = Program::from_json(
            r#"[
            {"action": "collectScroll", "name": "rows", "itemSelector": "li", "maxScrolls": 3, "stepPx": 400},
            {"action": "navigate", "url": "/second"},
            {"action": "extract", "name": "h1", "what": {"type": "text"}, "target": {"by": "role", "role": "heading"}}
        ]"#,
        )
        .unwrap();
        let report = Executor::new().run(&mut page, &program);
        assert!(report.ok, "{:?}", report.first_error());
        let rows = &report.extracted["rows"];
        assert_eq!(
            rows["count"], 40,
            "all rows are in the DOM already; dedupe keeps each once"
        );
        assert_eq!(rows["scrolls"], 3);
        assert_eq!(report.extracted["h1"], "Second");
        assert_eq!(report.url.as_deref(), Some("https://feed.test/second"));
    }
}

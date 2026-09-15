//! `Page::execute(program) -> ProgramResult` (architecture §6).
//!
//! Per step: check the document epoch when a ref is involved, resolve the
//! target, run the op, `settle()`, verify `expect`, record a [`StepOutcome`].
//! Time inside waits is virtual: nothing in M1 changes without a step, so a
//! condition that does not hold after settling fails immediately with
//! `condition_timeout` (the wait budget is reported, not slept).

use std::time::Instant;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use ve_a11y::{ObservationRequest, ref_for};
use ve_core::{Error, ErrorCode, Result, Stage};

use crate::page::{
    DEFAULT_TIMEOUT_MS, EngineObservation, Page, SETTLE_NAVIGATION_MS, SETTLE_STEP_MS,
    now_millis, outer_html,
};
use crate::regex_lite::url_matches;
use crate::steps::{
    Condition, ExtractField, MouseButton, Program, ProgramResult, ProgramStatus, SelectorState,
    Settled, Step, StepError, StepOutcome, StepStatus,
};

/// `pages.execute` request: a program plus an optional observation to take
/// in the same round trip.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteRequest {
    /// The program.
    pub program: Program,
    /// Observe (Compact by default) after the program finishes.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub return_observation: Option<ObservationRequest>,
}

impl ExecuteRequest {
    /// Parses either `{ program, returnObservation? }` or a bare program /
    /// step array.
    pub fn from_json(json: &str) -> Result<Self> {
        let value: Value = serde_json::from_str(json)
            .map_err(|e| Error::invalid_params(format!("execute request: {e}")))?;
        if let Some(obj) = value.as_object()
            && obj.contains_key("program")
        {
            let program = Program::from_value(obj["program"].clone())?;
            let return_observation = match obj.get("returnObservation") {
                None | Some(Value::Null) => None,
                Some(Value::Bool(true)) => Some(ObservationRequest::default()),
                Some(Value::Bool(false)) => None,
                Some(other) => Some(
                    serde_json::from_value(other.clone())
                        .map_err(|e| Error::invalid_params(format!("returnObservation: {e}")))?,
                ),
            };
            return Ok(Self {
                program,
                return_observation,
            });
        }
        Ok(Self {
            program: Program::from_value(value)?,
            return_observation: None,
        })
    }
}

/// `{ result, observation? }`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteResult {
    /// The program result.
    pub result: ProgramResult,
    /// The requested observation.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub observation: Option<EngineObservation>,
}

fn merge_extracted(into: &mut Map<String, Value>, from: &Map<String, Value>) {
    for (k, v) in from {
        into.insert(k.clone(), v.clone());
    }
}

/// What a step produced besides success.
#[derive(Default)]
struct StepOutput {
    detail: Option<String>,
    extracted: Option<Map<String, Value>>,
    artifact_ids: Option<Vec<String>>,
    /// Settle budget after this step.
    settle_ms: u64,
}

impl StepOutput {
    fn detail(text: impl Into<String>) -> Self {
        Self {
            detail: Some(text.into()),
            settle_ms: SETTLE_STEP_MS,
            ..Self::default()
        }
    }

    fn navigation(text: impl Into<String>) -> Self {
        Self {
            detail: Some(text.into()),
            settle_ms: SETTLE_NAVIGATION_MS,
            ..Self::default()
        }
    }
}

impl Page {
    /// Executes a flat program.
    pub fn execute(&mut self, program: &Program) -> ProgramResult {
        self.execute_with_observation(program, None).result
    }

    /// Executes a program and optionally observes in the same call.
    pub fn execute_with_observation(
        &mut self,
        program: &Program,
        return_observation: Option<&ObservationRequest>,
    ) -> ExecuteResult {
        let span = Stage::Agent.span();
        let _guard = span.enter();
        let epoch = program.document_epoch;
        let mut outcomes = Vec::with_capacity(program.steps.len());
        let mut extracted = Map::new();
        let mut failed: Option<String> = None;
        let mut cancelled = false;
        let mut last_settled = Settled {
            settled: true,
            ..Settled::default()
        };

        for step in &program.steps {
            if failed.is_some() || cancelled {
                outcomes.push(StepOutcome {
                    step_id: step.id().clone(),
                    op: step.op().into(),
                    status: StepStatus::Skipped,
                    started_at: now_millis(),
                    duration_ms: 0,
                    detail: None,
                    error: None,
                    extracted: None,
                    artifact_ids: None,
                });
                continue;
            }
            let started_at = now_millis();
            let start = Instant::now();
            let step_span = tracing::info_span!("agent.step", op = step.op(), id = step.id());
            let _step_guard = step_span.enter();
            let result = if self.take_cancelled() {
                cancelled = true;
                Err(Error::coded(ErrorCode::Cancelled, "program cancelled"))
            } else {
                self.run_step(step, epoch, &extracted)
            };
            let (mut status, mut detail, mut error, mut step_extracted, artifact_ids, settle_ms) =
                match result {
                    Ok(out) => (
                        StepStatus::Ok,
                        out.detail,
                        None,
                        out.extracted,
                        out.artifact_ids,
                        out.settle_ms,
                    ),
                    Err(e) => (
                        StepStatus::Failed,
                        None,
                        Some(StepError::from(&e)),
                        None,
                        None,
                        SETTLE_STEP_MS,
                    ),
                };
            let settled = self.settle(settle_ms);
            if let Some(nav_error) = self.take_navigation_error()
                && status == StepStatus::Ok
            {
                status = StepStatus::Failed;
                error = Some(StepError::from(&Error::Network(nav_error)));
            }
            if status == StepStatus::Ok
                && let Some(expect) = &step.base().expect
            {
                for condition in expect {
                    let timeout = condition
                        .timeout_ms()
                        .or(step.base().timeout_ms)
                        .unwrap_or(DEFAULT_TIMEOUT_MS);
                    match self.evaluate_condition(condition, epoch, 0) {
                        Ok(true) => {}
                        Ok(false) => {
                            status = StepStatus::Failed;
                            error = Some(StepError::from(&Error::coded_with(
                                ErrorCode::ConditionTimeout,
                                format!(
                                    "expect {} did not hold after {timeout} ms",
                                    condition.kind()
                                ),
                                json!({ "condition": condition, "timeoutMs": timeout }),
                            )));
                            break;
                        }
                        Err(e) => {
                            status = StepStatus::Failed;
                            error = Some(StepError::from(&e));
                            break;
                        }
                    }
                }
            }
            if let Some(unsettled) = settled.detail() {
                detail = Some(match detail {
                    Some(d) => format!("{d}; {unsettled}"),
                    None => unsettled,
                });
            }
            if status == StepStatus::Ok
                && let Some(map) = &step_extracted
            {
                merge_extracted(&mut extracted, map);
            } else {
                step_extracted = None;
            }
            if status == StepStatus::Failed {
                let message = error
                    .as_ref()
                    .map_or_else(|| "step failed".to_owned(), |e| e.message.clone());
                if cancelled || error.as_ref().is_some_and(|e| e.code == ErrorCode::Cancelled) {
                    cancelled = true;
                } else if !step.is_optional() {
                    failed = Some(format!("{}: {message}", step.id()));
                }
            }
            tracing::debug!(id = step.id(), op = step.op(), ?status, "step");
            last_settled = settled;
            outcomes.push(StepOutcome {
                step_id: step.id().clone(),
                op: step.op().into(),
                status,
                started_at,
                duration_ms: u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX),
                detail,
                error,
                extracted: step_extracted,
                artifact_ids,
            });
        }

        let status = if cancelled {
            ProgramStatus::Cancelled
        } else if failed.is_some() {
            ProgramStatus::Failed
        } else {
            ProgramStatus::Completed
        };
        let observation = return_observation.map(|request| {
            let settled = if last_settled.settled {
                last_settled.clone()
            } else {
                self.settle(SETTLE_STEP_MS)
            };
            self.observe_after_settle(request, settled)
        });
        ExecuteResult {
            result: ProgramResult {
                status,
                steps: outcomes,
                extracted: (!extracted.is_empty()).then_some(extracted),
                error: failed.or_else(|| cancelled.then(|| "program cancelled".to_owned())),
            },
            observation,
        }
    }

    fn timeout_of(step: &Step) -> u64 {
        step.base().timeout_ms.unwrap_or(DEFAULT_TIMEOUT_MS)
    }

    fn run_step(
        &mut self,
        step: &Step,
        epoch: Option<u64>,
        extracted_so_far: &Map<String, Value>,
    ) -> Result<StepOutput> {
        let timeout = Self::timeout_of(step);
        let _ = extracted_so_far;
        match step {
            Step::Navigate { url, .. } => {
                self.navigate(url)?;
                Ok(StepOutput::navigation(format!("navigating to {url}")))
            }
            Step::Back { .. } => {
                self.back()?;
                Ok(StepOutput::navigation(format!("back to {}", self.url())))
            }
            Step::Forward { .. } => {
                self.forward()?;
                Ok(StepOutput::navigation(format!("forward to {}", self.url())))
            }
            Step::Reload { .. } => {
                self.reload()?;
                Ok(StepOutput::navigation(format!("reloaded {}", self.url())))
            }
            Step::Stop { .. } => {
                let stopped = self.stop();
                Ok(StepOutput::detail(if stopped {
                    "cancelled pending navigation"
                } else {
                    "nothing to stop"
                }))
            }
            Step::Click { target, button, .. } => {
                let id = self.resolve(target, epoch)?;
                let detail = self.click(id, button.unwrap_or_default(), timeout)?;
                Ok(if self.navigation_pending() {
                    StepOutput::navigation(detail)
                } else {
                    StepOutput::detail(detail)
                })
            }
            Step::Dblclick { target, .. } => {
                let id = self.resolve(target, epoch)?;
                let detail = self.dblclick(id, timeout)?;
                Ok(StepOutput::detail(detail))
            }
            Step::Hover { target, .. } => {
                let id = self.resolve(target, epoch)?;
                Ok(StepOutput::detail(self.hover(id, timeout)?))
            }
            Step::Fill { target, value, .. } => {
                let id = self.resolve(target, epoch)?;
                Ok(StepOutput::detail(self.fill(id, value, timeout)?))
            }
            Step::Type { target, value, .. } => {
                let id = self.resolve(target, epoch)?;
                let detail = self.type_text(id, value, timeout)?;
                Ok(if self.navigation_pending() {
                    StepOutput::navigation(detail)
                } else {
                    StepOutput::detail(detail)
                })
            }
            Step::Press { key, target, .. } => {
                let id = target
                    .as_deref()
                    .map(|t| self.resolve(t, epoch))
                    .transpose()?;
                let detail = self.press(id, key, timeout)?;
                Ok(if self.navigation_pending() {
                    StepOutput::navigation(detail)
                } else {
                    StepOutput::detail(detail)
                })
            }
            Step::Check { target, .. } => {
                let id = self.resolve(target, epoch)?;
                Ok(StepOutput::detail(self.set_checked(id, true, timeout)?))
            }
            Step::Uncheck { target, .. } => {
                let id = self.resolve(target, epoch)?;
                Ok(StepOutput::detail(self.set_checked(id, false, timeout)?))
            }
            Step::Select { target, value, .. } => {
                let id = self.resolve(target, epoch)?;
                Ok(StepOutput::detail(self.select_values(
                    id,
                    &value.values(),
                    timeout,
                )?))
            }
            Step::Scroll {
                target,
                direction,
                amount,
                ..
            } => {
                let id = target
                    .as_deref()
                    .map(|t| self.resolve(t, epoch))
                    .transpose()?;
                let state = self.scroll(id, *direction, *amount)?;
                Ok(StepOutput::detail(format!(
                    "scrolled {} to y={} (max {})",
                    state.container.clone().unwrap_or_else(|| "viewport".into()),
                    state.y,
                    state.max_y
                )))
            }
            Step::DragTo { target, to, .. } => {
                let source = self.resolve(target, epoch)?;
                let dest = self.resolve(to, epoch)?;
                self.prepare_pointer(source, timeout)?;
                self.prepare_pointer(dest, timeout)?;
                self.focus(Some(source));
                Ok(StepOutput::detail(format!(
                    "pointer drag {} → {} (HTML5 drag events arrive with the script layer)",
                    ref_for(source),
                    ref_for(dest)
                )))
            }
            Step::ClickPoint { x, y, button, .. } => {
                let detail = self.click_point(*x, *y, button.unwrap_or_default())?;
                Ok(if self.navigation_pending() {
                    StepOutput::navigation(detail)
                } else {
                    StepOutput::detail(detail)
                })
            }
            Step::WaitFor { condition, .. } => self.wait_for(condition, epoch, timeout),
            Step::Screenshot {
                full_page,
                artifact,
                ..
            } => {
                let shot = self.screenshot(full_page.unwrap_or(false))?;
                let label = artifact.clone().unwrap_or_else(|| "screenshot".into());
                Ok(StepOutput {
                    detail: Some(format!(
                        "png {}x{} @{}x ({} bytes)",
                        shot.width,
                        shot.height,
                        shot.scale,
                        shot.png.len()
                    )),
                    extracted: None,
                    artifact_ids: Some(vec![label]),
                    settle_ms: SETTLE_STEP_MS,
                })
            }
            Step::Extract { fields, as_key, .. } => {
                let values = self.extract(fields, epoch)?;
                let mut map = Map::new();
                match as_key {
                    Some(key) => {
                        map.insert(key.clone(), Value::Object(values));
                    }
                    None => map = values,
                }
                Ok(StepOutput {
                    detail: Some(format!("extracted {} field(s)", fields.len())),
                    extracted: Some(map),
                    artifact_ids: None,
                    settle_ms: SETTLE_STEP_MS,
                })
            }
            Step::Upload { target, files, .. } => {
                let id = self.resolve(target, epoch)?;
                Ok(StepOutput::detail(self.upload(id, files, timeout)?))
            }
            Step::ExpectDownload { .. } => Err(Error::capability_unsupported(
                "downloads are not supported in this milestone",
            )),
            Step::CollectScroll {
                as_key,
                item,
                container,
                key,
                fields,
                limit,
                max_scrolls,
                ..
            } => {
                let value = self.collect_scroll(
                    item,
                    container.as_deref(),
                    key.as_deref(),
                    fields.as_deref().unwrap_or(&[]),
                    *limit,
                    max_scrolls.unwrap_or(20),
                    epoch,
                )?;
                let collected = value["collected"].as_u64().unwrap_or(0);
                let mut map = Map::new();
                map.insert(as_key.clone().unwrap_or_else(|| "items".into()), value);
                Ok(StepOutput {
                    detail: Some(format!("collected {collected} item(s)")),
                    extracted: Some(map),
                    artifact_ids: None,
                    settle_ms: SETTLE_STEP_MS,
                })
            }
            Step::Dialog { action, .. } => {
                let dialogs = self.open_dialogs();
                if dialogs.is_empty() {
                    return Err(Error::coded_with(
                        ErrorCode::CapabilityUnsupported,
                        "script dialogs (alert/confirm/prompt) need the script layer; no dialog is pending",
                        json!({ "action": action }),
                    ));
                }
                Err(Error::capability_unsupported(
                    "resolving <dialog> elements through the dialog op needs the script layer; click its buttons instead",
                ))
            }
            Step::Evaluate { .. } => Err(Error::capability_unsupported(
                "evaluate needs the script layer (ve-script) and a context created with allowEvaluate",
            )),
        }
    }

    // ---------------------------------------------------------------------
    // waitFor
    // ---------------------------------------------------------------------

    /// Evaluates a condition against the current (settled) state.
    pub fn evaluate_condition(
        &mut self,
        condition: &Condition,
        epoch: Option<u64>,
        since_request_id: u64,
    ) -> Result<bool> {
        Ok(match condition {
            Condition::TextVisible { text, .. } => {
                let wanted = text.split_whitespace().collect::<Vec<_>>().join(" ");
                self.update();
                self.shown_text().contains(&wanted)
            }
            Condition::Selector {
                selector, state, ..
            } => {
                let matches = match self.resolve_all(selector, epoch) {
                    Ok(m) => m,
                    Err(e) if e.code() == ErrorCode::NotFound => Vec::new(),
                    Err(e) if e.code() == ErrorCode::TargetDetached => Vec::new(),
                    Err(e) => return Err(e),
                };
                self.update();
                let any_shown = matches.iter().any(|&id| self.classify(id).shown);
                match state {
                    SelectorState::Attached => !matches.is_empty(),
                    SelectorState::Detached => matches.is_empty(),
                    SelectorState::Visible => any_shown,
                    SelectorState::Hidden => !any_shown,
                }
            }
            Condition::RefReady { reference, .. } => {
                let id = self.resolve_ref(reference, epoch)?;
                self.actionable(id, 0).is_ok()
            }
            Condition::UrlMatches { pattern, .. } => url_matches(pattern, self.url())?,
            Condition::NavigationSettled { .. } => {
                let settled = self.settle(SETTLE_NAVIGATION_MS);
                settled.settled && !self.navigation_pending()
            }
            Condition::Settled { .. } => self.settle(SETTLE_STEP_MS).settled,
            Condition::DownloadCompleted { .. } => {
                return Err(Error::capability_unsupported(
                    "downloads are not supported in this milestone",
                ));
            }
            Condition::Response {
                url_includes,
                status,
                ..
            } => self.completed_responses().iter().any(|r| {
                r.request_id >= since_request_id
                    && r.url.contains(url_includes.as_str())
                    && status.is_none_or(|s| s == r.status)
            }),
            Condition::Expression { .. } => {
                return Err(Error::capability_unsupported(
                    "waitFor expression needs the script layer",
                ));
            }
        })
    }

    fn wait_for(
        &mut self,
        condition: &Condition,
        epoch: Option<u64>,
        step_timeout: u64,
    ) -> Result<StepOutput> {
        let timeout = condition.timeout_ms().unwrap_or(step_timeout);
        let budget = if matches!(condition, Condition::NavigationSettled { .. }) {
            SETTLE_NAVIGATION_MS
        } else {
            SETTLE_STEP_MS
        };
        let settled = self.settle(budget);
        let started = Instant::now();
        // Re-evaluated at every readiness transition; in M1 the only
        // time-driven transition is a delayed <meta refresh>, so the loop
        // advances virtual time to it when that would still be in budget.
        let mut waited_virtual = 0u64;
        loop {
            if self.evaluate_condition(condition, epoch, 0)? {
                return Ok(StepOutput {
                    detail: Some(format!(
                        "{} held after {} ms{}",
                        condition.kind(),
                        waited_virtual + u64::try_from(started.elapsed().as_millis()).unwrap_or(0),
                        settled.detail().map(|d| format!(" ({d})")).unwrap_or_default()
                    )),
                    extracted: None,
                    artifact_ids: None,
                    settle_ms: budget,
                })
            }
            let refresh_in_ms = self
                .meta()
                .refresh
                .as_ref()
                .filter(|r| r.seconds > 0 && r.url.is_some())
                .map(|r| r.seconds * 1000);
            match refresh_in_ms {
                Some(delay) if waited_virtual + delay <= timeout && self.follow_delayed_refresh() => {
                    waited_virtual += delay;
                    self.advance_virtual_time(delay);
                    self.settle(SETTLE_NAVIGATION_MS);
                    continue;
                }
                _ => {}
            }
            return Err(Error::coded_with(
                ErrorCode::ConditionTimeout,
                format!(
                    "waitFor {} did not hold within {timeout} ms (page settled; nothing pending)",
                    condition.kind()
                ),
                json!({ "condition": condition, "timeoutMs": timeout, "url": self.url() }),
            ));
        }
    }

    /// Follows a delayed `<meta refresh>` now (virtual time). Returns
    /// `false` when there is none to follow.
    fn follow_delayed_refresh(&mut self) -> bool {
        let Some(refresh) = self.meta().refresh.clone() else {
            return false;
        };
        let Some(target) = refresh.url.as_deref().and_then(|u| self.resolve_url(u)) else {
            return false;
        };
        if target.starts_with("javascript:") {
            return false;
        }
        self.navigate(&target).is_ok()
    }

    // ---------------------------------------------------------------------
    // extract / collectScroll
    // ---------------------------------------------------------------------

    fn field_value(&self, id: ve_core::NodeId, attribute: Option<&str>) -> Value {
        let doc = self.document();
        match attribute {
            Some(attr) => match attr {
                "textContent" | "innerText" => json!(self.visible_text(id)),
                "outerHTML" => json!(outer_html(doc, id)),
                "innerHTML" => {
                    let inner: String = doc.children(id).map(|c| outer_html(doc, c)).collect();
                    json!(inner)
                }
                "value" => doc.form_value(id).map_or(Value::Null, |v| json!(v)),
                "checked" => json!(doc.is_checked(id)),
                "href" | "src" | "action" => doc
                    .attribute(id, attr)
                    .and_then(|h| self.resolve_url(h))
                    .or_else(|| doc.attribute(id, attr).map(str::to_owned))
                    .map_or(Value::Null, |v| json!(v)),
                _ => doc.attribute(id, attr).map_or(Value::Null, |v| json!(v)),
            },
            None => {
                if doc.element(id).is_some_and(|e| {
                    matches!(e.name.as_str(), "input" | "textarea" | "select")
                }) {
                    return doc.form_value(id).map_or(Value::Null, |v| json!(v));
                }
                json!(self.visible_text(id))
            }
        }
    }

    /// `extract`: one pass resolving every field against the arena.
    pub fn extract(
        &mut self,
        fields: &[ExtractField],
        epoch: Option<u64>,
    ) -> Result<Map<String, Value>> {
        self.update();
        let mut out = Map::new();
        for field in fields {
            let value = match &field.selector {
                None => json!(self.shown_text()),
                Some(selector) => {
                    let matches = match self.resolve_all(selector, epoch) {
                        Ok(m) => m,
                        Err(e) if e.code() == ErrorCode::NotFound => Vec::new(),
                        Err(e) => return Err(e),
                    };
                    if field.all == Some(true) {
                        Value::Array(
                            matches
                                .iter()
                                .map(|&id| self.field_value(id, field.attribute.as_deref()))
                                .collect(),
                        )
                    } else {
                        matches
                            .first()
                            .map_or(Value::Null, |&id| {
                                self.field_value(id, field.attribute.as_deref())
                            })
                    }
                }
            };
            out.insert(field.name.clone(), value);
        }
        Ok(out)
    }

    #[allow(clippy::too_many_arguments)]
    fn collect_scroll(
        &mut self,
        item: &str,
        container: Option<&str>,
        key: Option<&str>,
        fields: &[ExtractField],
        limit: Option<usize>,
        max_scrolls: usize,
        epoch: Option<u64>,
    ) -> Result<Value> {
        let container_id = container
            .map(|c| self.resolve(c, epoch))
            .transpose()?;
        let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
        let mut items: Vec<Value> = Vec::new();
        let mut scrolls = 0usize;
        let mut idle_rounds = 0usize;
        let mut last_height = self.layout_tree().content_height();
        loop {
            self.update();
            let matches = match self.resolve_all(item, epoch) {
                Ok(m) => m,
                Err(e) if e.code() == ErrorCode::NotFound => Vec::new(),
                Err(e) => return Err(e),
            };
            let mut added = 0usize;
            for id in matches {
                if let Some(c) = container_id
                    && !self.document().is_ancestor_of(c, id)
                {
                    continue;
                }
                let dedupe = match key {
                    Some(attr) => self
                        .document()
                        .attribute(id, attr)
                        .map(str::to_owned)
                        .unwrap_or_else(|| self.visible_text(id)),
                    None => self.visible_text(id),
                };
                if !seen.insert(dedupe.clone()) {
                    continue;
                }
                let mut entry = Map::new();
                entry.insert("ref".into(), json!(ref_for(id)));
                entry.insert("text".into(), json!(self.visible_text(id)));
                if let Some(attr) = key {
                    entry.insert("key".into(), json!(dedupe));
                }
                for field in fields {
                    let value = match &field.selector {
                        None => self.field_value(id, field.attribute.as_deref()),
                        Some(selector) => {
                            let within: Vec<ve_core::NodeId> = self
                                .resolve_all(selector, epoch)
                                .unwrap_or_default()
                                .into_iter()
                                .filter(|&m| m == id || self.document().is_ancestor_of(id, m))
                                .collect();
                            within
                                .first()
                                .map_or(Value::Null, |&m| self.field_value(m, field.attribute.as_deref()))
                        }
                    };
                    entry.insert(field.name.clone(), value);
                }
                items.push(Value::Object(entry));
                added += 1;
                if limit.is_some_and(|l| items.len() >= l) {
                    break;
                }
            }
            if limit.is_some_and(|l| items.len() >= l) || scrolls >= max_scrolls {
                break;
            }
            let state = self.scroll(container_id, crate::steps::ScrollDirection::Down, None)?;
            scrolls += 1;
            self.settle(SETTLE_STEP_MS);
            let height = self.layout_tree().content_height();
            if added == 0 && (height - last_height).abs() < 0.5 {
                idle_rounds += 1;
            } else {
                idle_rounds = 0;
            }
            last_height = height;
            if idle_rounds >= 2 || (state.at_bottom() && added == 0) {
                break;
            }
        }
        Ok(json!({ "items": items, "collected": items.len(), "scrolls": scrolls }))
    }

    /// Convenience for embedders: click by target string.
    pub fn click_target(&mut self, target: &str) -> Result<String> {
        let id = self.resolve(target, None)?;
        self.click(id, MouseButton::Left, DEFAULT_TIMEOUT_MS)
    }
}

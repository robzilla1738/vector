//! The program model, mirroring `packages/contracts/src/program.ts`
//! op-for-op: [`Step`] ↔ `StepSchema`, [`Condition`] ↔ `ConditionSchema`,
//! [`Program`] ↔ `ProgramSchema` (flat `steps`; control-flow `nodes` stay
//! with the runtime interpreter in M1), [`StepOutcome`] ↔ `StepOutcomeSchema`
//! and [`ProgramResult`] ↔ `ProgramResultSchema`. Serde field names are the
//! wire names, so JSON the runtime validated with zod is the engine's input.

use serde::{Deserialize, Serialize};
use ve_core::{Error, Result};

/// Mouse button.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MouseButton {
    /// Primary.
    #[default]
    Left,
    /// Secondary (`contextmenu`).
    Right,
    /// Auxiliary.
    Middle,
}

/// Required selector state for `waitFor { kind: "selector" }`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SelectorState {
    /// In the tree.
    Attached,
    /// Attached and shown.
    #[default]
    Visible,
    /// Not shown (or absent).
    Hidden,
    /// Not in the tree.
    Detached,
}

/// `ConditionSchema`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum Condition {
    /// Shown text contains `text`.
    TextVisible {
        /// Substring.
        text: String,
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// A selector reaches `state`.
    Selector {
        /// CSS selector (or target string).
        selector: String,
        /// Required state.
        #[serde(default)]
        state: SelectorState,
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// A ref passes actionability.
    RefReady {
        /// `r<index>`.
        #[serde(rename = "ref")]
        reference: String,
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// The URL contains `pattern` (or matches `/regex/`).
    UrlMatches {
        /// Substring or `/regex/`.
        pattern: String,
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// A navigation completed and the page settled.
    NavigationSettled {
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// Quiescence.
    Settled {
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// A download finished.
    DownloadCompleted {
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// A response whose URL contains `urlIncludes` completed.
    Response {
        /// URL substring.
        url_includes: String,
        /// Required status.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        status: Option<u16>,
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// Page JavaScript (needs `ve-script`; `capability_unsupported` in M1).
    Expression {
        /// JS expression.
        expression: String,
        /// Timeout.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
}

impl Condition {
    /// The `kind` string.
    #[must_use]
    pub fn kind(&self) -> &'static str {
        match self {
            Self::TextVisible { .. } => "textVisible",
            Self::Selector { .. } => "selector",
            Self::RefReady { .. } => "refReady",
            Self::UrlMatches { .. } => "urlMatches",
            Self::NavigationSettled { .. } => "navigationSettled",
            Self::Settled { .. } => "settled",
            Self::DownloadCompleted { .. } => "downloadCompleted",
            Self::Response { .. } => "response",
            Self::Expression { .. } => "expression",
        }
    }

    /// The condition's own timeout, if any.
    #[must_use]
    pub fn timeout_ms(&self) -> Option<u64> {
        match self {
            Self::TextVisible { timeout_ms, .. }
            | Self::Selector { timeout_ms, .. }
            | Self::RefReady { timeout_ms, .. }
            | Self::UrlMatches { timeout_ms, .. }
            | Self::NavigationSettled { timeout_ms }
            | Self::Settled { timeout_ms }
            | Self::DownloadCompleted { timeout_ms }
            | Self::Response { timeout_ms, .. }
            | Self::Expression { timeout_ms, .. } => *timeout_ms,
        }
    }
}

/// One field of an `extract` (or `collectScroll.fields`).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractField {
    /// Result key.
    pub name: String,
    /// CSS selector (or target string); whole page text when absent.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
    /// Attribute to read instead of text.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attribute: Option<String>,
    /// Collect every match.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub all: Option<bool>,
}

/// Scroll direction.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ScrollDirection {
    /// Towards the top.
    Up,
    /// Towards the bottom.
    #[default]
    Down,
    /// To the top.
    Top,
    /// To the bottom.
    Bottom,
}

/// `dialog` action.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DialogAction {
    /// Accept.
    Accept,
    /// Dismiss.
    Dismiss,
}

/// `select.value`: one value or several.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SelectValue {
    /// Single option.
    One(String),
    /// Several options (multi-select).
    Many(Vec<String>),
}

impl SelectValue {
    /// The requested values.
    #[must_use]
    pub fn values(&self) -> Vec<&str> {
        match self {
            Self::One(v) => vec![v.as_str()],
            Self::Many(v) => v.iter().map(String::as_str).collect(),
        }
    }
}

/// Fields shared by every step (`stepBase`).
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepBase {
    /// Unique within the program.
    pub id: String,
    /// Per-step timeout.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout_ms: Option<u64>,
    /// Failure does not fail the program.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub optional: Option<bool>,
    /// Verified after the step.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expect: Option<Vec<Condition>>,
}

/// `StepSchema`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "op", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum Step {
    /// Load a URL.
    Navigate {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Absolute URL (relative resolved against the page).
        url: String,
    },
    /// History back.
    Back {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
    },
    /// History forward.
    Forward {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
    },
    /// Reload.
    Reload {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
    },
    /// Stop loading.
    Stop {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
    },
    /// Click.
    Click {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
        /// Button.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        button: Option<MouseButton>,
    },
    /// Double click.
    Dblclick {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
    },
    /// Hover.
    Hover {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
    },
    /// Replace a field's value.
    Fill {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
        /// New value.
        value: String,
    },
    /// Type per grapheme.
    Type {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
        /// Text.
        value: String,
        /// Delay between keys (virtual).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        delay_ms: Option<u64>,
    },
    /// Press a key chord.
    Press {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// `Enter`, `Tab`, `Control+A`, …
        key: String,
        /// Element to focus first.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        target: Option<String>,
    },
    /// Check.
    Check {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
    },
    /// Uncheck.
    Uncheck {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
    },
    /// Choose option(s).
    Select {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
        /// Value(s).
        value: SelectValue,
    },
    /// Scroll.
    Scroll {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target (viewport when absent).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        target: Option<String>,
        /// Direction.
        #[serde(default)]
        direction: ScrollDirection,
        /// Pixels (a viewport when absent).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        amount: Option<f32>,
    },
    /// Drag.
    DragTo {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Source.
        target: String,
        /// Destination.
        to: String,
    },
    /// Click at viewport coordinates.
    ClickPoint {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// CSS px.
        x: f32,
        /// CSS px.
        y: f32,
        /// Button.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        button: Option<MouseButton>,
    },
    /// Wait for a condition.
    WaitFor {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// The condition.
        condition: Condition,
    },
    /// Screenshot.
    Screenshot {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Whole document.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        full_page: Option<bool>,
        /// Artifact label.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        artifact: Option<String>,
    },
    /// Extract.
    Extract {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Fields.
        fields: Vec<ExtractField>,
        /// Result key.
        #[serde(default, skip_serializing_if = "Option::is_none", rename = "as")]
        as_key: Option<String>,
    },
    /// Upload.
    Upload {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Target.
        target: String,
        /// Absolute paths.
        files: Vec<String>,
    },
    /// Wait for a download.
    ExpectDownload {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Save name.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        save_as: Option<String>,
    },
    /// Scroll-and-collect.
    CollectScroll {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Result key.
        #[serde(default, skip_serializing_if = "Option::is_none", rename = "as")]
        as_key: Option<String>,
        /// Item selector.
        item: String,
        /// Scroller selector.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        container: Option<String>,
        /// Dedupe attribute.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        key: Option<String>,
        /// Per-item fields.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        fields: Option<Vec<ExtractField>>,
        /// Stop at this many items.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        limit: Option<usize>,
        /// Maximum scrolls.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        max_scrolls: Option<usize>,
        /// Accepted and ignored.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        settle_ms: Option<u64>,
    },
    /// Resolve a dialog.
    Dialog {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Action.
        action: DialogAction,
        /// Prompt text.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        prompt_text: Option<String>,
    },
    /// Evaluate JS (`capability_unsupported` in M1).
    Evaluate {
        /// Base fields.
        #[serde(flatten)]
        base: StepBase,
        /// Expression.
        expression: String,
        /// Result key.
        #[serde(default, skip_serializing_if = "Option::is_none", rename = "as")]
        as_key: Option<String>,
    },
}

impl Step {
    /// The `op` string.
    #[must_use]
    pub fn op(&self) -> &'static str {
        match self {
            Self::Navigate { .. } => "navigate",
            Self::Back { .. } => "back",
            Self::Forward { .. } => "forward",
            Self::Reload { .. } => "reload",
            Self::Stop { .. } => "stop",
            Self::Click { .. } => "click",
            Self::Dblclick { .. } => "dblclick",
            Self::Hover { .. } => "hover",
            Self::Fill { .. } => "fill",
            Self::Type { .. } => "type",
            Self::Press { .. } => "press",
            Self::Check { .. } => "check",
            Self::Uncheck { .. } => "uncheck",
            Self::Select { .. } => "select",
            Self::Scroll { .. } => "scroll",
            Self::DragTo { .. } => "dragTo",
            Self::ClickPoint { .. } => "clickPoint",
            Self::WaitFor { .. } => "waitFor",
            Self::Screenshot { .. } => "screenshot",
            Self::Extract { .. } => "extract",
            Self::Upload { .. } => "upload",
            Self::ExpectDownload { .. } => "expectDownload",
            Self::CollectScroll { .. } => "collectScroll",
            Self::Dialog { .. } => "dialog",
            Self::Evaluate { .. } => "evaluate",
        }
    }

    /// The shared base fields.
    #[must_use]
    pub fn base(&self) -> &StepBase {
        match self {
            Self::Navigate { base, .. }
            | Self::Back { base }
            | Self::Forward { base }
            | Self::Reload { base }
            | Self::Stop { base }
            | Self::Click { base, .. }
            | Self::Dblclick { base, .. }
            | Self::Hover { base, .. }
            | Self::Fill { base, .. }
            | Self::Type { base, .. }
            | Self::Press { base, .. }
            | Self::Check { base, .. }
            | Self::Uncheck { base, .. }
            | Self::Select { base, .. }
            | Self::Scroll { base, .. }
            | Self::DragTo { base, .. }
            | Self::ClickPoint { base, .. }
            | Self::WaitFor { base, .. }
            | Self::Screenshot { base, .. }
            | Self::Extract { base, .. }
            | Self::Upload { base, .. }
            | Self::ExpectDownload { base, .. }
            | Self::CollectScroll { base, .. }
            | Self::Dialog { base, .. }
            | Self::Evaluate { base, .. } => base,
        }
    }

    /// The step id.
    #[must_use]
    pub fn id(&self) -> &str {
        &self.base().id
    }

    /// Whether the step is `optional`.
    #[must_use]
    pub fn is_optional(&self) -> bool {
        self.base().optional == Some(true)
    }
}

/// `ProgramSchema` (flat `steps` form).
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Program {
    /// Target page (informational; the page is chosen by the caller).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub page_id: Option<String>,
    /// Document epoch the refs belong to.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub document_epoch: Option<u64>,
    /// Steps in order.
    #[serde(default)]
    pub steps: Vec<Step>,
    /// Control-flow form: not interpreted in-engine (M1).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub nodes: Option<Vec<serde_json::Value>>,
    /// Version.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
    /// Name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Inputs.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub inputs: Option<serde_json::Map<String, serde_json::Value>>,
    /// Budget.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub budget: Option<serde_json::Value>,
    /// Conflict keys.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub conflicts: Option<Vec<String>>,
    /// Resume checkpoint.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub resume_from: Option<String>,
}

impl Program {
    /// A program from steps.
    #[must_use]
    pub fn new(steps: Vec<Step>) -> Self {
        Self {
            steps,
            ..Self::default()
        }
    }

    /// Parses a program: a `ProgramSchema` object, or a bare array of steps.
    pub fn from_json(json: &str) -> Result<Self> {
        let value: serde_json::Value =
            serde_json::from_str(json).map_err(|e| Error::invalid_params(format!("program: {e}")))?;
        Self::from_value(value)
    }

    /// Parses a program from a JSON value.
    pub fn from_value(value: serde_json::Value) -> Result<Self> {
        if value.is_array() {
            let steps: Vec<Step> = serde_json::from_value(value)
                .map_err(|e| Error::invalid_params(format!("program steps: {e}")))?;
            return Ok(Self::new(steps));
        }
        let program: Self = serde_json::from_value(value)
            .map_err(|e| Error::invalid_params(format!("program: {e}")))?;
        if program.steps.is_empty() && program.nodes.is_some() {
            return Err(Error::capability_unsupported(
                "control-flow programs (`nodes`) are interpreted by the runtime; the engine executes flat `steps`",
            ));
        }
        Ok(program)
    }

    /// Serialises to JSON.
    #[must_use]
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::to_value(self).expect("program is serialisable")
    }
}

/// `StepOutcome.status`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StepStatus {
    /// Completed.
    Ok,
    /// Failed.
    Failed,
    /// Not run.
    Skipped,
}

/// `StepOutcome.error`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct StepError {
    /// `VectorErrorCode`.
    pub code: ve_core::ErrorCode,
    /// Message.
    pub message: String,
    /// Structured detail (candidates, predicate…).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<serde_json::Value>,
}

impl From<&Error> for StepError {
    fn from(e: &Error) -> Self {
        Self {
            code: e.code(),
            message: e.to_string(),
            detail: e.detail().cloned(),
        }
    }
}

/// `StepOutcomeSchema`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepOutcome {
    /// Step id.
    pub step_id: String,
    /// Op.
    pub op: String,
    /// Status.
    pub status: StepStatus,
    /// Unix milliseconds.
    pub started_at: u64,
    /// Wall-clock duration.
    pub duration_ms: u64,
    /// Human-readable detail (`settled=false: fetch(2)`, `navigated to …`).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
    /// Error.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<StepError>,
    /// Extracted values.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extracted: Option<serde_json::Map<String, serde_json::Value>>,
    /// Artifact ids (screenshots).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub artifact_ids: Option<Vec<String>>,
}

/// `ProgramResult.status`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProgramStatus {
    /// Every non-optional step succeeded.
    Completed,
    /// A step failed.
    Failed,
    /// Cancelled.
    Cancelled,
}

/// `ProgramResultSchema`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgramResult {
    /// Status.
    pub status: ProgramStatus,
    /// Outcomes in order.
    pub steps: Vec<StepOutcome>,
    /// Merged extracted values.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extracted: Option<serde_json::Map<String, serde_json::Value>>,
    /// First failure message.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl ProgramResult {
    /// `true` when completed.
    #[must_use]
    pub fn ok(&self) -> bool {
        self.status == ProgramStatus::Completed
    }

    /// The first failed step.
    #[must_use]
    pub fn first_failure(&self) -> Option<&StepOutcome> {
        self.steps.iter().find(|s| s.status == StepStatus::Failed)
    }

    /// JSON.
    #[must_use]
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::to_value(self).expect("result is serialisable")
    }
}

/// `settle()` outcome (architecture §6).
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settled {
    /// All conditions held at one instant.
    pub settled: bool,
    /// Milliseconds spent (wall clock).
    pub waited_ms: u64,
    /// Why the page is not settled (`fetch(2)`, `navigation`, `timers(1)`).
    pub reasons: Vec<String>,
}

impl Settled {
    /// `settled=false: timers(1) fetch(2)` or `None` when settled.
    #[must_use]
    pub fn detail(&self) -> Option<String> {
        (!self.settled).then(|| format!("settled=false: {}", self.reasons.join(" ")))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn steps_round_trip_with_contract_field_names() {
        let json = r#"{
          "pageId": "p1", "documentEpoch": 3,
          "steps": [
            {"id": "s1", "op": "navigate", "url": "https://a.test/"},
            {"id": "s2", "op": "click", "target": "r12", "button": "left", "timeoutMs": 100},
            {"id": "s3", "op": "fill", "target": "css:#q", "value": "boots", "optional": true},
            {"id": "s4", "op": "type", "target": "r3", "value": "ab", "delayMs": 0},
            {"id": "s5", "op": "press", "key": "Control+Shift+A"},
            {"id": "s6", "op": "select", "target": "r4", "value": ["a", "b"]},
            {"id": "s7", "op": "scroll", "direction": "bottom"},
            {"id": "s8", "op": "clickPoint", "x": 10, "y": 20},
            {"id": "s9", "op": "waitFor", "condition": {"kind": "selector", "selector": ".ok", "state": "hidden", "timeoutMs": 5}},
            {"id": "s10", "op": "extract", "fields": [{"name": "t", "selector": "h1", "all": true}], "as": "page"},
            {"id": "s11", "op": "collectScroll", "item": "li", "key": "data-id", "limit": 10, "settleMs": 50},
            {"id": "s12", "op": "dialog", "action": "accept", "promptText": "x"},
            {"id": "s13", "op": "evaluate", "expression": "1+1", "as": "two"},
            {"id": "s14", "op": "screenshot", "fullPage": true},
            {"id": "s15", "op": "upload", "target": "r9", "files": ["/tmp/a.txt"]},
            {"id": "s16", "op": "dragTo", "target": "r1", "to": "r2"},
            {"id": "s17", "op": "waitFor", "condition": {"kind": "expression", "expression": "true"}},
            {"id": "s18", "op": "back"}, {"id": "s19", "op": "forward"}, {"id": "s20", "op": "reload"}, {"id": "s21", "op": "stop"},
            {"id": "s22", "op": "check", "target": "r5"}, {"id": "s23", "op": "uncheck", "target": "r5"},
            {"id": "s24", "op": "hover", "target": "r6"}, {"id": "s25", "op": "dblclick", "target": "r6"},
            {"id": "s26", "op": "expectDownload", "saveAs": "x.csv"},
            {"id": "s27", "op": "waitFor", "condition": {"kind": "response", "urlIncludes": "/api", "status": 200}}
          ]
        }"#;
        let program = Program::from_json(json).unwrap();
        assert_eq!(program.page_id.as_deref(), Some("p1"));
        assert_eq!(program.document_epoch, Some(3));
        assert_eq!(program.steps.len(), 27);
        let ops: Vec<&str> = program.steps.iter().map(Step::op).collect();
        assert_eq!(&ops[..5], ["navigate", "click", "fill", "type", "press"]);
        assert_eq!(program.steps[1].base().timeout_ms, Some(100));
        assert!(program.steps[2].is_optional());
        assert!(matches!(&program.steps[5], Step::Select { value: SelectValue::Many(v), .. } if v.len() == 2));
        assert!(matches!(&program.steps[6], Step::Scroll { direction: ScrollDirection::Bottom, amount: None, .. }));
        assert!(matches!(&program.steps[8], Step::WaitFor { condition: Condition::Selector { state: SelectorState::Hidden, timeout_ms: Some(5), .. }, .. }));
        assert!(matches!(&program.steps[9], Step::Extract { as_key: Some(k), fields, .. } if k == "page" && fields[0].all == Some(true)));
        assert!(matches!(&program.steps[26], Step::WaitFor { condition: Condition::Response { status: Some(200), .. }, .. }));

        let again = Program::from_value(program.to_json()).unwrap();
        assert_eq!(again, program);
        let serialized = program.to_json();
        assert_eq!(serialized["steps"][1]["op"], "click");
        assert_eq!(serialized["steps"][1]["timeoutMs"], 100);
        assert_eq!(serialized["steps"][9]["as"], "page");
        assert_eq!(serialized["steps"][8]["condition"]["kind"], "selector");
        assert!(serialized["steps"][0].get("timeoutMs").is_none(), "absent optionals are omitted");
    }

    #[test]
    fn bare_arrays_and_errors() {
        let bare = Program::from_json(r#"[{"id":"a","op":"reload"}]"#).unwrap();
        assert_eq!(bare.steps[0].op(), "reload");
        let bad = Program::from_json(r#"[{"id":"a","op":"teleport"}]"#).unwrap_err();
        assert_eq!(bad.code(), ve_core::ErrorCode::InvalidParams);
        let not_json = Program::from_json("nope").unwrap_err();
        assert_eq!(not_json.code(), ve_core::ErrorCode::InvalidParams);
        let nodes = Program::from_json(r#"{"pageId":"p","nodes":[{"kind":"checkpoint"}]}"#).unwrap_err();
        assert_eq!(nodes.code(), ve_core::ErrorCode::CapabilityUnsupported);
        let selector_default: Condition =
            serde_json::from_str(r#"{"kind":"selector","selector":"x"}"#).unwrap();
        assert!(matches!(selector_default, Condition::Selector { state: SelectorState::Visible, .. }));
        assert_eq!(selector_default.kind(), "selector");
    }

    #[test]
    fn outcomes_serialize_like_the_contract() {
        let outcome = StepOutcome {
            step_id: "s1".into(),
            op: "click".into(),
            status: StepStatus::Failed,
            started_at: 1_700_000_000_000,
            duration_ms: 3,
            detail: Some("settled=false: fetch(1)".into()),
            error: Some(StepError::from(&Error::coded_with(
                ve_core::ErrorCode::TargetAmbiguous,
                "3 matches",
                serde_json::json!({"candidates": ["r1", "r2", "r3"]}),
            ))),
            extracted: None,
            artifact_ids: None,
        };
        let json = serde_json::to_value(&outcome).unwrap();
        assert_eq!(json["stepId"], "s1");
        assert_eq!(json["status"], "failed");
        assert_eq!(json["durationMs"], 3);
        assert_eq!(json["error"]["code"], "target_ambiguous");
        assert_eq!(json["error"]["detail"]["candidates"][2], "r3");
        assert!(json.get("extracted").is_none());
        let result = ProgramResult {
            status: ProgramStatus::Completed,
            steps: vec![outcome],
            extracted: None,
            error: None,
        };
        assert_eq!(result.to_json()["status"], "completed");
        assert!(result.ok());
        let settled = Settled {
            settled: false,
            waited_ms: 2,
            reasons: vec!["timers(1)".into(), "fetch(2)".into()],
        };
        assert_eq!(settled.detail().as_deref(), Some("settled=false: timers(1) fetch(2)"));
        assert_eq!(Settled { settled: true, ..Settled::default() }.detail(), None);
    }
}

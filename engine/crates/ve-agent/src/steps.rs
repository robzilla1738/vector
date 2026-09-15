//! The program model: [`Program`], [`Step`], [`Target`] and friends.
//!
//! Everything here is plain data with a stable JSON encoding, so programs can
//! be produced by any agent runtime and replayed. Example:
//!
//! ```json
//! {
//!   "steps": [
//!     { "action": "fill", "target": { "by": "label", "label": "Email" }, "value": "a@b.c" },
//!     { "action": "click", "target": { "by": "role", "role": "button", "name": "Sign in" } },
//!     { "action": "waitFor", "condition": { "type": "selector", "selector": ".dashboard", "state": "visible" } },
//!     { "action": "extract", "name": "title", "what": { "type": "text" }, "target": { "by": "selector", "selector": "h1" } }
//!   ]
//! }
//! ```

use serde::{Deserialize, Serialize};
use ve_a11y::SnapshotFormat;
use ve_core::NodeId;

/// How a step addresses elements.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "by", rename_all = "camelCase")]
pub enum Target {
    /// A CSS selector; matches in document order.
    Selector {
        /// The selector.
        selector: String,
    },
    /// A snapshot reference such as `n12.0` (or its packed integer form).
    Ref {
        /// The reference.
        #[serde(rename = "ref")]
        reference: String,
    },
    /// Elements whose visible text equals (or, failing that, contains) `text`.
    Text {
        /// The text to look for.
        text: String,
    },
    /// Accessibility role, optionally with an accessible name.
    Role {
        /// ARIA role name (`button`, `link`, `textbox`, …).
        role: String,
        /// Accessible name to match exactly (case-insensitive).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        name: Option<String>,
    },
    /// A form control by its accessible name / label text.
    Label {
        /// The label text.
        label: String,
    },
}

impl Target {
    /// A selector target.
    pub fn selector(selector: impl Into<String>) -> Self {
        Self::Selector {
            selector: selector.into(),
        }
    }

    /// A reference target.
    #[must_use]
    pub fn reference(id: NodeId) -> Self {
        Self::Ref {
            reference: id.to_string(),
        }
    }

    /// A role target.
    pub fn role(role: impl Into<String>, name: Option<&str>) -> Self {
        Self::Role {
            role: role.into(),
            name: name.map(str::to_owned),
        }
    }

    /// Parses a reference target's id.
    #[must_use]
    pub fn parse_reference(reference: &str) -> Option<NodeId> {
        reference
            .parse::<NodeId>()
            .ok()
            .or_else(|| reference.parse::<u64>().ok().map(NodeId::from_u64))
    }
}

impl std::fmt::Display for Target {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Selector { selector } => write!(f, "selector `{selector}`"),
            Self::Ref { reference } => write!(f, "ref {reference}"),
            Self::Text { text } => write!(f, "text {text:?}"),
            Self::Role {
                role,
                name: Some(n),
            } => write!(f, "{role} {n:?}"),
            Self::Role { role, name: None } => write!(f, "role {role}"),
            Self::Label { label } => write!(f, "label {label:?}"),
        }
    }
}

/// Required state of a selector in a `waitFor`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Presence {
    /// At least one element matches.
    #[default]
    Present,
    /// No element matches.
    Absent,
    /// At least one match is rendered (has a non-empty box).
    Visible,
}

/// What a `waitFor` step waits for.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum WaitCondition {
    /// The page is ready (quiescent event loop, clean style and layout).
    Ready,
    /// A selector reaches the given state.
    Selector {
        /// CSS selector.
        selector: String,
        /// Required state.
        #[serde(default)]
        state: Presence,
    },
    /// The document's text contains `contains`.
    Text {
        /// Substring to look for.
        contains: String,
    },
    /// A fixed amount of virtual time passes.
    Time {
        /// Milliseconds.
        ms: u64,
    },
}

/// What an `extract` step reads.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ExtractKind {
    /// Normalised text content.
    Text,
    /// Serialised outer HTML.
    Html,
    /// A content attribute.
    Attribute {
        /// Attribute name.
        name: String,
    },
    /// Current value of a form control.
    Value,
    /// A semantic snapshot of the target's subtree (or the page).
    Snapshot {
        /// Snapshot format.
        #[serde(default)]
        format: SnapshotFormat,
    },
    /// Border-box rectangle from layout.
    Rect,
    /// Number of matching elements.
    Count,
}

/// One action.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(
    tag = "action",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Step {
    /// Activates an element (buttons, links, checkboxes, options, summaries).
    Click {
        /// The element.
        target: Target,
    },
    /// Replaces the value of a text control and focuses it.
    Fill {
        /// The control.
        target: Target,
        /// New value.
        value: String,
    },
    /// Chooses an option of a `<select>` by value or visible text.
    Select {
        /// The select (or an option inside it).
        target: Target,
        /// Option value or text.
        value: String,
    },
    /// Presses a key (`Enter`, `Tab`, `Escape`, `Backspace`, ` `, or a character).
    Press {
        /// Key name.
        key: String,
        /// Element to focus first (defaults to the focused element).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        target: Option<Target>,
    },
    /// Scrolls the page or a scroll container by a delta in CSS pixels.
    Scroll {
        /// Scroll container (page if omitted).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        target: Option<Target>,
        /// Horizontal delta.
        #[serde(default)]
        dx: f32,
        /// Vertical delta.
        #[serde(default)]
        dy: f32,
    },
    /// Loads a new document.
    Navigate {
        /// Absolute or page-relative URL.
        url: String,
    },
    /// Waits (in virtual time) until a condition holds.
    WaitFor {
        /// The condition.
        condition: WaitCondition,
        /// Timeout in milliseconds (program default if omitted).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        timeout_ms: Option<u64>,
    },
    /// Reads data into the report under `name`.
    Extract {
        /// Result key.
        name: String,
        /// What to read.
        what: ExtractKind,
        /// Element(s) to read from (document element if omitted).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        target: Option<Target>,
    },
    /// Scrolls repeatedly, collecting items matching `item_selector` until no
    /// new items appear or the scroll limit is reached (infinite feeds).
    CollectScroll {
        /// Result key.
        name: String,
        /// Selector for items to collect.
        item_selector: String,
        /// Scroll container (page if omitted).
        #[serde(default, skip_serializing_if = "Option::is_none")]
        container: Option<Target>,
        /// Maximum number of scroll steps.
        #[serde(default = "default_max_scrolls")]
        max_scrolls: u32,
        /// Pixels per scroll step.
        #[serde(default = "default_step_px")]
        step_px: f32,
    },
}

fn default_max_scrolls() -> u32 {
    10
}

fn default_step_px() -> f32 {
    600.0
}

impl Step {
    /// The action name as it appears in JSON.
    #[must_use]
    pub fn action(&self) -> &'static str {
        match self {
            Self::Click { .. } => "click",
            Self::Fill { .. } => "fill",
            Self::Select { .. } => "select",
            Self::Press { .. } => "press",
            Self::Scroll { .. } => "scroll",
            Self::Navigate { .. } => "navigate",
            Self::WaitFor { .. } => "waitFor",
            Self::Extract { .. } => "extract",
            Self::CollectScroll { .. } => "collectScroll",
        }
    }
}

/// Program-wide options.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ProgramOptions {
    /// Abort on the first failed step (default `true`).
    pub stop_on_error: bool,
    /// Default `waitFor` timeout in milliseconds (default 5000).
    pub default_timeout_ms: u64,
    /// Maximum event-loop tasks run per settle (default 10 000).
    pub max_tasks_per_settle: usize,
}

impl Default for ProgramOptions {
    fn default() -> Self {
        Self {
            stop_on_error: true,
            default_timeout_ms: 5000,
            max_tasks_per_settle: 10_000,
        }
    }
}

/// A sequence of steps with options.
#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Program {
    /// Steps in execution order.
    pub steps: Vec<Step>,
    /// Options.
    #[serde(default)]
    pub options: ProgramOptions,
}

impl Program {
    /// Creates a program with default options.
    #[must_use]
    pub fn new(steps: Vec<Step>) -> Self {
        Self {
            steps,
            options: ProgramOptions::default(),
        }
    }

    /// Parses a program from JSON (an object with `steps`, or a bare array of steps).
    pub fn from_json(json: &str) -> ve_core::Result<Self> {
        let value: serde_json::Value = serde_json::from_str(json)?;
        if value.is_array() {
            let steps: Vec<Step> = serde_json::from_value(value)?;
            return Ok(Self::new(steps));
        }
        Ok(serde_json::from_value(value)?)
    }

    /// Serialises to JSON.
    #[must_use]
    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).expect("program is serialisable")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn programs_round_trip_through_json() {
        let json = r#"{
            "steps": [
                {"action": "fill", "target": {"by": "label", "label": "Email"}, "value": "a@b.c"},
                {"action": "click", "target": {"by": "role", "role": "button", "name": "Go"}},
                {"action": "waitFor", "condition": {"type": "selector", "selector": ".ok", "state": "visible"}, "timeoutMs": 100},
                {"action": "extract", "name": "n", "what": {"type": "attribute", "name": "href"}, "target": {"by": "ref", "ref": "n4.0"}},
                {"action": "collectScroll", "name": "items", "itemSelector": "li"},
                {"action": "scroll", "dy": 100}
            ],
            "options": {"stopOnError": false}
        }"#;
        let program = Program::from_json(json).unwrap();
        assert_eq!(program.steps.len(), 6);
        assert!(!program.options.stop_on_error);
        assert_eq!(program.options.default_timeout_ms, 5000, "defaults fill in");
        assert!(matches!(
            &program.steps[2],
            Step::WaitFor {
                condition: WaitCondition::Selector {
                    state: Presence::Visible,
                    ..
                },
                timeout_ms: Some(100)
            }
        ));
        assert!(matches!(
            &program.steps[4],
            Step::CollectScroll {
                max_scrolls: 10,
                container: None,
                ..
            }
        ));
        assert!(
            matches!(&program.steps[3], Step::Extract { target: Some(Target::Ref { reference }), .. } if Target::parse_reference(reference) == Some(NodeId::new(4, 0)))
        );

        let again = Program::from_json(&program.to_json()).unwrap();
        assert_eq!(again, program);
        let bare = Program::from_json(r#"[{"action": "navigate", "url": "about:blank"}]"#).unwrap();
        assert_eq!(bare.steps[0].action(), "navigate");
        assert!(Program::from_json(r#"{"steps": [{"action": "teleport"}]}"#).is_err());
        assert_eq!(Target::parse_reference("42"), Some(NodeId::from_u64(42)));
    }
}

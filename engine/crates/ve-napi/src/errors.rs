//! Error mapping from engine errors to the runtime's `VectorErrorCode`
//! taxonomy (architecture §6, "Error taxonomy").

use serde_json::{Value, json};

/// A structured error crossing the Node boundary.
#[derive(Clone, Debug, PartialEq)]
pub struct ApiError {
    /// One of the `VectorErrorCode` strings.
    pub code: &'static str,
    /// Human readable message.
    pub message: String,
    /// Optional structured detail.
    pub detail: Option<Value>,
}

impl ApiError {
    /// Creates an error with a code and message.
    pub fn new(code: &'static str, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            detail: None,
        }
    }

    /// `capability_unsupported` with a detail object.
    pub fn unsupported(what: impl Into<String>) -> Self {
        let what = what.into();
        Self {
            code: "capability_unsupported",
            message: format!("unsupported by the vector engine in this milestone: {what}"),
            detail: Some(json!({ "reason": what })),
        }
    }

    /// `invalid_params`.
    pub fn invalid(message: impl Into<String>) -> Self {
        Self::new("invalid_params", message)
    }

    /// Attaches structured detail.
    #[must_use]
    pub fn with_detail(mut self, detail: Value) -> Self {
        self.detail = Some(detail);
        self
    }

    /// JSON form `{ code, message, detail? }`.
    #[must_use]
    pub fn to_json(&self) -> Value {
        let mut v = json!({ "code": self.code, "message": self.message });
        if let Some(d) = &self.detail {
            v["detail"] = d.clone();
        }
        v
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}

impl From<ve_core::Error> for ApiError {
    fn from(e: ve_core::Error) -> Self {
        use ve_core::Error as E;
        let message = e.to_string();
        match e {
            E::InvalidNodeId(_) => Self::new("target_detached", message),
            E::NotAnElement(_) | E::NoMatch(_) => Self::new("not_found", message),
            E::Parse { .. } | E::Serialization(_) => Self::new("invalid_params", message),
            E::Unsupported(what) => Self::unsupported(what),
            E::Network(_) => {
                Self::new("step_failed", message).with_detail(json!({ "kind": "network" }))
            }
            E::Script(_) => Self::new("step_failed", message),
            E::Timeout { .. } => Self::new("condition_timeout", message),
            E::InvalidState(ref s) if s.starts_with("no such page") => {
                Self::new("target_detached", message)
            }
            E::InvalidState(ref s) if s.starts_with("page limit") => Self::new("conflict", message),
            E::InvalidState(_) => Self::new("step_failed", message),
            _ => Self::new("internal", message),
        }
    }
}

impl From<serde_json::Error> for ApiError {
    fn from(e: serde_json::Error) -> Self {
        Self::invalid(format!("invalid JSON: {e}"))
    }
}

/// Classifies an error *message* produced by `ve-agent`'s executor, which
/// flattens typed errors to strings. Used only where the typed error is not
/// reachable (`waitFor`, `collectScroll`).
#[must_use]
pub fn code_from_message(message: &str) -> &'static str {
    if message.starts_with("timed out") {
        "condition_timeout"
    } else if message.starts_with("no element matches") {
        "not_found"
    } else if message.starts_with("unsupported") {
        "capability_unsupported"
    } else if message.starts_with("stale or unknown node") {
        "target_detached"
    } else {
        // network failures included: they are step failures, not capability gaps
        "step_failed"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_engine_errors_to_runtime_codes() {
        let cases: Vec<(ve_core::Error, &str)> = vec![
            (
                ve_core::Error::InvalidNodeId(ve_core::NodeId::new(1, 0)),
                "target_detached",
            ),
            (ve_core::Error::NoMatch("#x".into()), "not_found"),
            (ve_core::Error::parse("ref", "bad"), "invalid_params"),
            (
                ve_core::Error::unsupported("hover"),
                "capability_unsupported",
            ),
            (ve_core::Error::Network("boom".into()), "step_failed"),
            (
                ve_core::Error::Timeout {
                    stage: ve_core::Stage::Agent,
                    millis: 5,
                },
                "condition_timeout",
            ),
            (
                ve_core::Error::InvalidState("no such page 3".into()),
                "target_detached",
            ),
            (
                ve_core::Error::InvalidState("n1.0 is disabled".into()),
                "step_failed",
            ),
        ];
        for (err, code) in cases {
            assert_eq!(ApiError::from(err).code, code);
        }
        assert_eq!(
            code_from_message("timed out after 5 ms during agent"),
            "condition_timeout"
        );
        assert_eq!(code_from_message("no element matches `x`"), "not_found");
        let j = ApiError::unsupported("hover").to_json();
        assert_eq!(j["code"], "capability_unsupported");
        assert_eq!(j["detail"]["reason"], "hover");
    }
}

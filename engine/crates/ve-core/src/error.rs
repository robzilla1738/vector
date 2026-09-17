//! The engine-wide error type and the agent-facing error taxonomy.
//!
//! Every error that reaches an agent, the C ABI or the Node bindings is
//! reported as `{ code, message, detail }` where `code` is exactly one of the
//! runtime's `VectorErrorCode` strings (architecture §6, "Error taxonomy").
//! Subsystems keep their richer internal variants; [`Error::code`] maps each
//! of them onto the taxonomy so callers can branch on a stable string.

use serde::{Deserialize, Serialize};

use crate::id::NodeId;
use crate::trace::Stage;

/// Result alias using the engine-wide [`Error`].
pub type Result<T, E = Error> = std::result::Result<T, E>;

/// The agent-facing error code. Serialises to the exact `VectorErrorCode`
/// string used by `packages/contracts/src/errors.ts`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
    /// Selector target matched nothing, or a ref never existed.
    NotFound,
    /// Malformed step JSON, unknown key chord, bad URL.
    InvalidParams,
    /// Ref tombstoned or document epoch mismatch.
    TargetDetached,
    /// Selector target matched more than one shown element.
    TargetAmbiguous,
    /// Network failure or missing transport.
    BackendUnavailable,
    /// The build or milestone lacks the required subsystem.
    CapabilityUnsupported,
    /// An actionability predicate failed within the timeout.
    StepFailed,
    /// A `waitFor` / `expect` condition timed out.
    ConditionTimeout,
    /// The program was cancelled.
    Cancelled,
    /// Concurrent use of the same page.
    Conflict,
    /// Engine panic or bug caught at the boundary.
    Internal,
}

impl ErrorCode {
    /// The wire string (`snake_case`).
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::NotFound => "not_found",
            Self::InvalidParams => "invalid_params",
            Self::TargetDetached => "target_detached",
            Self::TargetAmbiguous => "target_ambiguous",
            Self::BackendUnavailable => "backend_unavailable",
            Self::CapabilityUnsupported => "capability_unsupported",
            Self::StepFailed => "step_failed",
            Self::ConditionTimeout => "condition_timeout",
            Self::Cancelled => "cancelled",
            Self::Conflict => "conflict",
            Self::Internal => "internal",
        }
    }
}

impl std::fmt::Display for ErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Errors that cross crate boundaries inside the engine.
///
/// Subsystems are free to keep richer internal error enums; they convert
/// into this type when reporting to the facade (`ve-api`) or to agents. The
/// variants are intentionally coarse so that agents can branch on them.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum Error {
    /// The node id does not resolve (never existed, or its slot was reused).
    #[error("stale or unknown node reference {0}")]
    InvalidNodeId(NodeId),

    /// The node exists but is not an element (e.g. a text node).
    #[error("node {0} is not an element")]
    NotAnElement(NodeId),

    /// A selector or textual target matched nothing.
    #[error("no element matches `{0}`")]
    NoMatch(String),

    /// Input could not be parsed (CSS, selectors, URLs, JSON programs, …).
    #[error("{context}: {message}")]
    Parse {
        /// What was being parsed.
        context: &'static str,
        /// Human readable detail.
        message: String,
    },

    /// A capability that is not compiled in or not implemented yet.
    #[error("unsupported: {0}")]
    Unsupported(String),

    /// The network layer failed.
    #[error("network: {0}")]
    Network(String),

    /// Script evaluation failed.
    #[error("script: {0}")]
    Script(String),

    /// An operation did not complete within its deadline.
    #[error("timed out after {millis} ms during {stage}")]
    Timeout {
        /// The pipeline stage that was waited on.
        stage: Stage,
        /// The deadline in milliseconds.
        millis: u64,
    },

    /// A JSON (de)serialisation failure at an API boundary.
    #[error("serialization: {0}")]
    Serialization(#[from] serde_json::Error),

    /// The operation is not valid in the current state.
    #[error("invalid state: {0}")]
    InvalidState(String),

    /// An error already classified with an agent-facing [`ErrorCode`] and an
    /// optional structured detail (e.g. candidate refs for
    /// `target_ambiguous`, the failing predicate for `step_failed`).
    #[error("{message}")]
    Coded {
        /// The taxonomy code.
        code: ErrorCode,
        /// Human readable message.
        message: String,
        /// Structured detail for the planner.
        detail: Option<serde_json::Value>,
    },
}

/// The wire form of an error: `{ "code", "message", "detail"? }`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ErrorPayload {
    /// Taxonomy code.
    pub code: ErrorCode,
    /// Message.
    pub message: String,
    /// Structured detail.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<serde_json::Value>,
}

impl Error {
    /// Convenience constructor for [`Error::Parse`].
    pub fn parse(context: &'static str, message: impl Into<String>) -> Self {
        Self::Parse {
            context,
            message: message.into(),
        }
    }

    /// Convenience constructor for [`Error::Unsupported`].
    pub fn unsupported(what: impl Into<String>) -> Self {
        Self::Unsupported(what.into())
    }

    /// An error with an explicit taxonomy code and no detail.
    pub fn coded(code: ErrorCode, message: impl Into<String>) -> Self {
        Self::Coded {
            code,
            message: message.into(),
            detail: None,
        }
    }

    /// An error with an explicit taxonomy code and structured detail.
    pub fn coded_with(
        code: ErrorCode,
        message: impl Into<String>,
        detail: serde_json::Value,
    ) -> Self {
        Self::Coded {
            code,
            message: message.into(),
            detail: Some(detail),
        }
    }

    /// `not_found`.
    pub fn not_found(message: impl Into<String>) -> Self {
        Self::coded(ErrorCode::NotFound, message)
    }

    /// `invalid_params`.
    pub fn invalid_params(message: impl Into<String>) -> Self {
        Self::coded(ErrorCode::InvalidParams, message)
    }

    /// `target_detached`.
    pub fn target_detached(message: impl Into<String>) -> Self {
        Self::coded(ErrorCode::TargetDetached, message)
    }

    /// `step_failed`.
    pub fn step_failed(message: impl Into<String>) -> Self {
        Self::coded(ErrorCode::StepFailed, message)
    }

    /// `condition_timeout`.
    pub fn condition_timeout(message: impl Into<String>) -> Self {
        Self::coded(ErrorCode::ConditionTimeout, message)
    }

    /// `capability_unsupported`.
    pub fn capability_unsupported(message: impl Into<String>) -> Self {
        let message = message.into();
        Self::coded_with(
            ErrorCode::CapabilityUnsupported,
            message.clone(),
            serde_json::json!({
                "op": message,
                "engine": crate::VERSION,
            }),
        )
    }

    /// `internal`.
    pub fn internal(message: impl Into<String>) -> Self {
        Self::coded(ErrorCode::Internal, message)
    }

    /// The agent-facing code of this error.
    #[must_use]
    pub fn code(&self) -> ErrorCode {
        match self {
            Self::InvalidNodeId(_) => ErrorCode::TargetDetached,
            Self::NotAnElement(_) | Self::NoMatch(_) => ErrorCode::NotFound,
            Self::Parse { .. } | Self::Serialization(_) => ErrorCode::InvalidParams,
            Self::Unsupported(_) => ErrorCode::CapabilityUnsupported,
            Self::Network(_) => ErrorCode::BackendUnavailable,
            Self::Script(_) => ErrorCode::Internal,
            Self::Timeout { .. } => ErrorCode::ConditionTimeout,
            Self::InvalidState(_) => ErrorCode::StepFailed,
            Self::Coded { code, .. } => *code,
        }
    }

    /// Structured detail, if any.
    #[must_use]
    pub fn detail(&self) -> Option<&serde_json::Value> {
        match self {
            Self::Coded { detail, .. } => detail.as_ref(),
            _ => None,
        }
    }

    /// The wire payload.
    #[must_use]
    pub fn payload(&self) -> ErrorPayload {
        ErrorPayload {
            code: self.code(),
            message: self.to_string(),
            detail: self.detail().cloned(),
        }
    }

    /// `{ "error": { "code", "message", "detail"? } }` as a JSON value.
    #[must_use]
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::json!({ "error": self.payload() })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn codes_serialize_to_exact_wire_strings() {
        let all = [
            (ErrorCode::NotFound, "not_found"),
            (ErrorCode::InvalidParams, "invalid_params"),
            (ErrorCode::TargetDetached, "target_detached"),
            (ErrorCode::TargetAmbiguous, "target_ambiguous"),
            (ErrorCode::BackendUnavailable, "backend_unavailable"),
            (ErrorCode::CapabilityUnsupported, "capability_unsupported"),
            (ErrorCode::StepFailed, "step_failed"),
            (ErrorCode::ConditionTimeout, "condition_timeout"),
            (ErrorCode::Cancelled, "cancelled"),
            (ErrorCode::Conflict, "conflict"),
            (ErrorCode::Internal, "internal"),
        ];
        for (code, text) in all {
            assert_eq!(code.as_str(), text);
            assert_eq!(serde_json::to_string(&code).unwrap(), format!("\"{text}\""));
            assert_eq!(code.to_string(), text);
        }
    }

    #[test]
    fn legacy_variants_map_onto_the_taxonomy() {
        assert_eq!(
            Error::InvalidNodeId(NodeId::new(1, 0)).code(),
            ErrorCode::TargetDetached
        );
        assert_eq!(Error::NoMatch("x".into()).code(), ErrorCode::NotFound);
        assert_eq!(Error::parse("url", "bad").code(), ErrorCode::InvalidParams);
        assert_eq!(
            Error::unsupported("x").code(),
            ErrorCode::CapabilityUnsupported
        );
        assert_eq!(
            Error::Network("down".into()).code(),
            ErrorCode::BackendUnavailable
        );
        assert_eq!(
            Error::Timeout {
                stage: Stage::Agent,
                millis: 5
            }
            .code(),
            ErrorCode::ConditionTimeout
        );
        assert_eq!(
            Error::InvalidState("x".into()).code(),
            ErrorCode::StepFailed
        );
        let ambiguous = Error::coded_with(
            ErrorCode::TargetAmbiguous,
            "2 matches",
            serde_json::json!({ "candidates": ["r1", "r2"] }),
        );
        let json = ambiguous.to_json();
        assert_eq!(json["error"]["code"], "target_ambiguous");
        assert_eq!(json["error"]["message"], "2 matches");
        assert_eq!(json["error"]["detail"]["candidates"][1], "r2");
        let plain = Error::not_found("nope").to_json();
        assert!(plain["error"].get("detail").is_none());
        let unsupported = Error::capability_unsupported("xpath").to_json();
        assert_eq!(unsupported["error"]["detail"]["op"], "xpath");
        assert_eq!(unsupported["error"]["detail"]["engine"], crate::VERSION);
    }
}

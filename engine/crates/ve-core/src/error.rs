//! The engine-wide error type.

use crate::id::NodeId;
use crate::trace::Stage;

/// Result alias using the engine-wide [`Error`].
pub type Result<T, E = Error> = std::result::Result<T, E>;

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
}

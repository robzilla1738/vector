//! Errors crossing the Node boundary: `{ code, message, detail? }` where
//! `code` is an exact `VectorErrorCode` (architecture §6, "Error taxonomy").
//!
//! The engine (`ve-api`) already reports coded errors; this type exists for
//! the few failures the binding layer detects itself (unknown page, bad
//! JSON, stopped thread) and to carry engine payloads through unchanged.

use serde_json::{Value, json};

/// A structured error crossing the Node boundary.
#[derive(Clone, Debug, PartialEq)]
pub struct ApiError {
    /// One of the `VectorErrorCode` strings.
    pub code: String,
    /// Human readable message.
    pub message: String,
    /// Optional structured detail.
    pub detail: Option<Value>,
}

impl ApiError {
    /// Creates an error with a code and message.
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            detail: None,
        }
    }

    /// `invalid_params`.
    pub fn invalid(message: impl Into<String>) -> Self {
        Self::new("invalid_params", message)
    }

    /// `target_detached` for a page the binding does not track.
    #[must_use]
    pub fn no_such_page(page: u64) -> Self {
        Self::new("target_detached", format!("no such page {page}"))
    }

    /// `backend_unavailable` for a stopped engine thread.
    #[must_use]
    pub fn thread_stopped() -> Self {
        Self::new("backend_unavailable", "engine thread has stopped")
    }

    /// Attaches structured detail.
    #[must_use]
    pub fn with_detail(mut self, detail: Value) -> Self {
        self.detail = Some(detail);
        self
    }

    /// Re-wraps an engine `{"ok":false,"error":{…}}` reply (or a bare
    /// error object). Unknown shapes become `internal`.
    #[must_use]
    pub fn from_engine(reply: &Value) -> Self {
        let error = reply.get("error").unwrap_or(reply);
        let code = error
            .get("code")
            .and_then(Value::as_str)
            .unwrap_or("internal");
        let message = error
            .get("message")
            .and_then(Value::as_str)
            .map_or_else(|| reply.to_string(), str::to_owned);
        Self {
            code: code.to_owned(),
            message,
            detail: error.get("detail").cloned(),
        }
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

    /// The full reply `{ ok: false, error }`.
    #[must_use]
    pub fn to_reply(&self) -> Value {
        json!({ "ok": false, "error": self.to_json() })
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}

impl From<ve_core::Error> for ApiError {
    fn from(e: ve_core::Error) -> Self {
        Self {
            code: e.code().as_str().to_owned(),
            message: e.to_string(),
            detail: e.detail().cloned(),
        }
    }
}

impl From<serde_json::Error> for ApiError {
    fn from(e: serde_json::Error) -> Self {
        Self::invalid(format!("invalid JSON: {e}"))
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
            (ve_core::Error::invalid_params("bad"), "invalid_params"),
            (
                ve_core::Error::capability_unsupported("hover"),
                "capability_unsupported",
            ),
            (ve_core::Error::not_found("no such page 3"), "not_found"),
        ];
        for (err, code) in cases {
            assert_eq!(ApiError::from(err).code, code);
        }
        let engine = json!({ "ok": false, "error": { "code": "conflict", "message": "busy", "detail": { "page": 1 } } });
        let e = ApiError::from_engine(&engine);
        assert_eq!(e.code, "conflict");
        assert_eq!(e.message, "busy");
        assert_eq!(e.detail.unwrap()["page"], 1);
        assert_eq!(
            ApiError::from_engine(&json!({ "weird": true })).code,
            "internal"
        );
        let j = ApiError::no_such_page(7).to_reply();
        assert_eq!(j["ok"], false);
        assert_eq!(j["error"]["code"], "target_detached");
        let bad: Result<Value, serde_json::Error> = serde_json::from_str("nope");
        assert_eq!(ApiError::from(bad.unwrap_err()).code, "invalid_params");
    }
}

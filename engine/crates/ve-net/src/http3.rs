//! HTTP/3 advertisement tracking (plan A23).
//!
//! The hyper transport speaks HTTP/1.1 and HTTP/2. When a response carries
//! `Alt-Svc: h3=…` we record it so the embedder (and the top-100 checklist)
//! can see that the origin offered HTTP/3 even if this process did not
//! switch protocols.

use http::header::{HeaderMap, HeaderValue};

/// Returns `true` when `headers` advertise HTTP/3 via `Alt-Svc`.
#[must_use]
pub fn advertises_http3(headers: &HeaderMap) -> bool {
    headers.get_all("alt-svc").iter().any(value_has_h3)
}

fn value_has_h3(v: &HeaderValue) -> bool {
    v.to_str()
        .is_ok_and(|s| s.to_ascii_lowercase().contains("h3="))
}

/// Protocols a context has observed on the wire.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct ProtocolSupport {
    /// HTTP/1.1 was used.
    pub http1: bool,
    /// HTTP/2 (ALPN `h2`) was used.
    pub http2: bool,
    /// An origin advertised HTTP/3.
    pub http3: bool,
    /// A WebSocket handshake was attempted.
    pub websocket: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use http::header::HeaderName;

    #[test]
    fn alt_svc_h3_is_detected() {
        let mut headers = HeaderMap::new();
        headers.append(
            HeaderName::from_static("alt-svc"),
            HeaderValue::from_static(r#"h3=":443"; ma=86400, h3-29=":443""#),
        );
        assert!(advertises_http3(&headers));
        headers.clear();
        headers.insert("alt-svc", HeaderValue::from_static("h2=\":443\""));
        assert!(!advertises_http3(&headers));
    }
}

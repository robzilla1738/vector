//! Hermetic replay transport (VEC-024).
//!
//! Looks up `METHOD URL` in a map and never opens a socket. A missing key is
//! nondeterminism: [`NetError::Blocked`], not a live fetch.

use std::collections::HashMap;

use crate::transport::Transport;
use crate::{NetError, Request, Response};

/// Archive-backed [`Transport`]. Missing entries do not hit the network.
#[derive(Clone, Debug, Default)]
pub struct ReplayTransport {
    entries: HashMap<String, Response>,
}

impl ReplayTransport {
    /// Empty archive.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Records `response` for `METHOD URL`.
    pub fn insert(&mut self, method: &str, url: &str, response: Response) {
        self.entries.insert(format!("{method} {url}"), response);
    }
}

impl Transport for ReplayTransport {
    fn send(&self, request: &Request) -> Result<Response, NetError> {
        let key = format!("{} {}", request.method, request.url);
        self.entries
            .get(&key)
            .cloned()
            .ok_or_else(|| NetError::Blocked(format!("replay nondeterminism: {key}")))
    }

    fn name(&self) -> &'static str {
        "replay"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ContextId, NetworkContext, Request};
    use http::StatusCode;
    use http::header::HeaderMap;
    use url::Url;

    #[test]
    fn missing_archive_is_blocked_nondeterminism() {
        let t = ReplayTransport::new();
        let req = Request::get("https://example.test/").unwrap();
        assert!(matches!(
            t.send(&req),
            Err(NetError::Blocked(s)) if s.contains("replay nondeterminism")
        ));
        let mut ctx = NetworkContext::new(ContextId(1), Box::new(ReplayTransport::new()));
        assert!(matches!(ctx.fetch(req), Err(NetError::Blocked(_))));
    }

    #[test]
    fn archived_get_is_served_without_the_network() {
        let mut t = ReplayTransport::new();
        t.insert(
            "GET",
            "https://example.test/",
            Response::new(
                Url::parse("https://example.test/").unwrap(),
                StatusCode::OK,
                HeaderMap::new(),
                "archived",
            ),
        );
        let mut ctx = NetworkContext::new(ContextId(1), Box::new(t));
        let r = ctx
            .fetch(Request::get("https://example.test/").unwrap())
            .unwrap();
        assert_eq!(r.text(), "archived");
    }
}

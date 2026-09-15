//! Networking for the Vector Engine.
//!
//! # Contract
//!
//! * A [`NetworkContext`] is the unit of isolation: it owns a [`CookieJar`],
//!   an [`HttpCache`] and a [`Transport`]. Two contexts never share state, so
//!   an embedder can run many independent "profiles" in one process.
//! * [`NetworkContext::fetch`] implements the engine-side parts of Fetch that
//!   do not depend on the wire: cookie attachment and storage, cache lookup /
//!   storage, redirect following, `data:` and `about:` URLs. The wire itself
//!   is behind the [`Transport`] trait.
//! * The default build has **no** real transport (pure Rust, no TLS): use
//!   [`MockTransport`] for tests or enable the `http` feature for
//!   [`HyperTransport`] (hyper 1 + rustls + HTTP/1.1 and HTTP/2).
//! * Everything is synchronous from the caller's point of view; the hyper
//!   transport runs its own single-threaded tokio runtime. Streaming bodies
//!   and progress events are a follow-up.

#![forbid(unsafe_code)]

pub mod cache;
pub mod cookie;
#[cfg(feature = "http")]
pub mod hyper_transport;
pub mod transport;

use std::time::SystemTime;

use bytes::Bytes;
use http::header::{HeaderMap, HeaderName, HeaderValue};
use http::{Method, StatusCode};
use url::Url;
use ve_core::Stage;

pub use cache::{CacheLookup, HttpCache};
pub use cookie::{Cookie, CookieJar, SameSite};
#[cfg(feature = "http")]
pub use hyper_transport::HyperTransport;
pub use transport::{MockTransport, NullTransport, Transport};

/// Errors from the network layer.
#[derive(Debug, thiserror::Error)]
pub enum NetError {
    /// The URL could not be parsed.
    #[error("invalid url: {0}")]
    InvalidUrl(#[from] url::ParseError),
    /// The scheme is not fetchable (`javascript:`, `mailto:` …).
    #[error("unsupported scheme `{0}`")]
    UnsupportedScheme(String),
    /// No transport is configured for network schemes.
    #[error("no network transport configured (enable the `http` feature or supply a Transport)")]
    NoTransport,
    /// The transport failed.
    #[error("transport: {0}")]
    Transport(String),
    /// Malformed HTTP data.
    #[error("http: {0}")]
    Http(String),
    /// Redirect chain exceeded the limit.
    #[error("too many redirects (limit {0})")]
    TooManyRedirects(u8),
}

impl From<NetError> for ve_core::Error {
    fn from(e: NetError) -> Self {
        ve_core::Error::Network(e.to_string())
    }
}

/// An outgoing request.
#[derive(Clone, Debug)]
pub struct Request {
    /// HTTP method.
    pub method: Method,
    /// Absolute URL.
    pub url: Url,
    /// Request headers.
    pub headers: HeaderMap,
    /// Request body.
    pub body: Option<Bytes>,
}

impl Request {
    /// A `GET` request for `url`.
    pub fn get(url: &str) -> Result<Self, NetError> {
        Ok(Self {
            method: Method::GET,
            url: Url::parse(url)?,
            headers: HeaderMap::new(),
            body: None,
        })
    }

    /// Adds a header (invalid names/values are ignored).
    #[must_use]
    pub fn header(mut self, name: &str, value: &str) -> Self {
        if let (Ok(n), Ok(v)) = (HeaderName::try_from(name), HeaderValue::from_str(value)) {
            self.headers.insert(n, v);
        }
        self
    }

    fn cache_key(&self) -> String {
        format!("{} {}", self.method, self.url)
    }
}

/// A complete response.
#[derive(Clone, Debug)]
pub struct Response {
    /// Final URL after redirects.
    pub url: Url,
    /// Status code.
    pub status: StatusCode,
    /// Response headers.
    pub headers: HeaderMap,
    /// Body bytes.
    pub body: Bytes,
    /// Whether the response was served from the cache.
    pub from_cache: bool,
}

impl Response {
    /// Builds a response (used by transports and tests).
    #[must_use]
    pub fn new(url: Url, status: StatusCode, headers: HeaderMap, body: impl Into<Bytes>) -> Self {
        Self {
            url,
            status,
            headers,
            body: body.into(),
            from_cache: false,
        }
    }

    /// The `Content-Type` header.
    #[must_use]
    pub fn content_type(&self) -> Option<&str> {
        self.headers
            .get(http::header::CONTENT_TYPE)
            .and_then(|v| v.to_str().ok())
    }

    /// The MIME essence (`text/html`) without parameters.
    #[must_use]
    pub fn mime_type(&self) -> Option<String> {
        self.content_type().map(|ct| {
            ct.split(';')
                .next()
                .unwrap_or("")
                .trim()
                .to_ascii_lowercase()
        })
    }

    /// Body decoded as UTF-8 (lossy). Charset sniffing is a follow-up.
    #[must_use]
    pub fn text(&self) -> String {
        String::from_utf8_lossy(&self.body).into_owned()
    }

    /// Whether the status is 2xx.
    #[must_use]
    pub fn is_success(&self) -> bool {
        self.status.is_success()
    }
}

/// Identifies a [`NetworkContext`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct ContextId(pub u64);

/// An isolated networking profile.
pub struct NetworkContext {
    /// Identifier.
    pub id: ContextId,
    /// Cookies for this context.
    pub cookies: CookieJar,
    /// HTTP cache for this context.
    pub cache: HttpCache,
    /// `User-Agent` sent with every request.
    pub user_agent: String,
    /// Maximum redirects followed per fetch.
    pub max_redirects: u8,
    transport: Box<dyn Transport>,
}

impl std::fmt::Debug for NetworkContext {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("NetworkContext")
            .field("id", &self.id)
            .field("cookies", &self.cookies.len())
            .field("cache_entries", &self.cache.len())
            .field("transport", &self.transport.name())
            .finish_non_exhaustive()
    }
}

/// Default `User-Agent`.
pub const DEFAULT_USER_AGENT: &str = concat!(
    "Mozilla/5.0 (compatible; VectorEngine/",
    env!("CARGO_PKG_VERSION"),
    ")"
);

impl NetworkContext {
    /// Creates a context over `transport`.
    #[must_use]
    pub fn new(id: ContextId, transport: Box<dyn Transport>) -> Self {
        Self {
            id,
            cookies: CookieJar::new(),
            cache: HttpCache::new(HttpCache::DEFAULT_MAX_BYTES),
            user_agent: DEFAULT_USER_AGENT.to_owned(),
            max_redirects: 20,
            transport,
        }
    }

    /// A context that can only resolve `data:` / `about:` URLs.
    #[must_use]
    pub fn offline(id: ContextId) -> Self {
        Self::new(id, Box::new(NullTransport))
    }

    /// Fetches `request`, following redirects, using the current time.
    pub fn fetch(&mut self, request: Request) -> Result<Response, NetError> {
        self.fetch_at(request, SystemTime::now())
    }

    /// Like [`Self::fetch`] with an explicit clock (deterministic tests).
    pub fn fetch_at(
        &mut self,
        mut request: Request,
        now: SystemTime,
    ) -> Result<Response, NetError> {
        let span = Stage::Fetch.span();
        let _guard = span.enter();
        let mut redirects = 0u8;
        loop {
            match request.url.scheme() {
                "data" => return data_url(&request.url),
                "about" => {
                    let mut headers = HeaderMap::new();
                    headers.insert(
                        http::header::CONTENT_TYPE,
                        HeaderValue::from_static("text/html;charset=utf-8"),
                    );
                    return Ok(Response::new(
                        request.url.clone(),
                        StatusCode::OK,
                        headers,
                        Bytes::new(),
                    ));
                }
                "http" | "https" => {}
                other => return Err(NetError::UnsupportedScheme(other.to_owned())),
            }

            if request.method == Method::GET
                && let CacheLookup::Fresh(mut cached) = self.cache.lookup(&request.cache_key(), now)
            {
                tracing::debug!(url = %request.url, "cache hit");
                cached.from_cache = true;
                return Ok(cached);
            }

            request
                .headers
                .entry(http::header::USER_AGENT)
                .or_insert_with(|| HeaderValue::from_str(&self.user_agent).expect("valid ua"));
            request
                .headers
                .entry(http::header::ACCEPT)
                .or_insert(HeaderValue::from_static(
                    "text/html,application/xhtml+xml,*/*;q=0.8",
                ));
            if let Some(cookie) = self.cookies.header_for(&request.url, now) {
                if let Ok(v) = HeaderValue::from_str(&cookie) {
                    request.headers.insert(http::header::COOKIE, v);
                }
            } else {
                request.headers.remove(http::header::COOKIE);
            }

            let response = self.transport.send(&request)?;
            for set_cookie in response.headers.get_all(http::header::SET_COOKIE) {
                if let Ok(text) = set_cookie.to_str()
                    && let Some(cookie) = Cookie::parse(text, &request.url, now)
                {
                    self.cookies.store(cookie);
                }
            }

            if response.status.is_redirection()
                && let Some(location) = response
                    .headers
                    .get(http::header::LOCATION)
                    .and_then(|v| v.to_str().ok())
                && let Ok(target) = request.url.join(location)
            {
                redirects += 1;
                if redirects > self.max_redirects {
                    return Err(NetError::TooManyRedirects(self.max_redirects));
                }
                tracing::debug!(from = %request.url, to = %target, status = %response.status, "redirect");
                let keep_method = matches!(response.status.as_u16(), 307 | 308);
                if !keep_method {
                    request.method = Method::GET;
                    request.body = None;
                    request.headers.remove(http::header::CONTENT_TYPE);
                    request.headers.remove(http::header::CONTENT_LENGTH);
                }
                request.url = target;
                continue;
            }

            if request.method == Method::GET {
                self.cache
                    .store(request.cache_key(), &request.headers, &response, now);
            }
            return Ok(response);
        }
    }

    /// The transport's name.
    #[must_use]
    pub fn transport_name(&self) -> &'static str {
        self.transport.name()
    }
}

/// Decodes a `data:` URL into a response.
fn data_url(url: &Url) -> Result<Response, NetError> {
    let rest = url.as_str().strip_prefix("data:").unwrap_or_default();
    let (meta, payload) = rest
        .split_once(',')
        .ok_or_else(|| NetError::Http("data: URL without comma".into()))?;
    let mut mime = String::new();
    let mut base64 = false;
    for (i, part) in meta.split(';').enumerate() {
        let part = part.trim();
        if part.eq_ignore_ascii_case("base64") {
            base64 = true;
        } else if i == 0 {
            mime = if part.is_empty() {
                "text/plain;charset=US-ASCII".to_owned()
            } else {
                part.to_owned()
            };
        } else {
            mime.push(';');
            mime.push_str(part);
        }
    }
    let decoded_percent = percent_decode(payload);
    let body = if base64 {
        let compact: Vec<u8> = decoded_percent
            .iter()
            .copied()
            .filter(|b| !b.is_ascii_whitespace())
            .collect();
        base64_decode(&compact)
            .ok_or_else(|| NetError::Http("invalid base64 in data: URL".into()))?
    } else {
        decoded_percent
    };
    let mut headers = HeaderMap::new();
    if let Ok(v) = HeaderValue::from_str(&mime) {
        headers.insert(http::header::CONTENT_TYPE, v);
    }
    Ok(Response::new(url.clone(), StatusCode::OK, headers, body))
}

fn percent_decode(input: &str) -> Vec<u8> {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%'
            && i + 2 < bytes.len()
            && let Some(hex) = input.get(i + 1..i + 3)
            && let Ok(v) = u8::from_str_radix(hex, 16)
        {
            out.push(v);
            i += 3;
            continue;
        }
        out.push(bytes[i]);
        i += 1;
    }
    out
}

/// Standard (and URL-safe) base64 decoding with optional padding.
fn base64_decode(input: &[u8]) -> Option<Vec<u8>> {
    fn val(c: u8) -> Option<u32> {
        Some(match c {
            b'A'..=b'Z' => u32::from(c - b'A'),
            b'a'..=b'z' => u32::from(c - b'a') + 26,
            b'0'..=b'9' => u32::from(c - b'0') + 52,
            b'+' | b'-' => 62,
            b'/' | b'_' => 63,
            _ => return None,
        })
    }
    let trimmed: Vec<u8> = input.iter().copied().filter(|&c| c != b'=').collect();
    let mut out = Vec::with_capacity(trimmed.len() * 3 / 4);
    for chunk in trimmed.chunks(4) {
        let mut acc = 0u32;
        for &c in chunk {
            acc = (acc << 6) | val(c)?;
        }
        match chunk.len() {
            4 => out.extend_from_slice(&[(acc >> 16) as u8, (acc >> 8) as u8, acc as u8]),
            3 => out.extend_from_slice(&[(acc >> 10) as u8, (acc >> 2) as u8]),
            2 => out.push((acc >> 4) as u8),
            _ => return None,
        }
    }
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn data_urls_decode_text_and_base64() {
        let mut ctx = NetworkContext::offline(ContextId(1));
        let r = ctx
            .fetch(Request::get("data:text/html,%3Ch1%3EHi%3C%2Fh1%3E").unwrap())
            .unwrap();
        assert_eq!(r.mime_type().as_deref(), Some("text/html"));
        assert_eq!(r.text(), "<h1>Hi</h1>");
        let r = ctx
            .fetch(Request::get("data:text/plain;base64,SGVsbG8sIFZlY3Rvcg==").unwrap())
            .unwrap();
        assert_eq!(r.text(), "Hello, Vector");
        let r = ctx.fetch(Request::get("data:,plain").unwrap()).unwrap();
        assert_eq!(r.mime_type().as_deref(), Some("text/plain"));
        assert!(matches!(
            ctx.fetch(Request::get("https://example.com/").unwrap()),
            Err(NetError::NoTransport)
        ));
        assert!(matches!(
            ctx.fetch(Request::get("mailto:x@y").unwrap()),
            Err(NetError::UnsupportedScheme(_))
        ));
    }

    #[test]
    fn fetch_attaches_cookies_follows_redirects_and_caches() {
        let mock = MockTransport::new();
        mock.respond(
            "https://example.com/login",
            302,
            &[
                ("Location", "/home"),
                ("Set-Cookie", "sid=abc; Path=/; HttpOnly"),
            ],
            "",
        );
        mock.respond(
            "https://example.com/home",
            200,
            &[
                ("Cache-Control", "max-age=60"),
                ("Content-Type", "text/html"),
            ],
            "<p>home</p>",
        );
        let log = mock.log();
        let mut ctx = NetworkContext::new(ContextId(7), Box::new(mock));
        let t0 = SystemTime::UNIX_EPOCH + Duration::from_secs(1_700_000_000);

        let r = ctx
            .fetch_at(Request::get("https://example.com/login").unwrap(), t0)
            .unwrap();
        assert_eq!(r.status, 200);
        assert_eq!(r.url.as_str(), "https://example.com/home");
        assert!(!r.from_cache);
        {
            let requests = log.borrow();
            assert_eq!(requests.len(), 2);
            assert!(requests[0].headers.get("cookie").is_none());
            assert_eq!(
                requests[1].headers.get("cookie").unwrap(),
                "sid=abc",
                "cookie from redirect attached"
            );
            assert!(
                requests[1]
                    .headers
                    .get("user-agent")
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .contains("VectorEngine")
            );
        }

        let again = ctx
            .fetch_at(
                Request::get("https://example.com/home").unwrap(),
                t0 + Duration::from_secs(30),
            )
            .unwrap();
        assert!(again.from_cache);
        assert_eq!(log.borrow().len(), 2, "served from cache");

        let stale = ctx
            .fetch_at(
                Request::get("https://example.com/home").unwrap(),
                t0 + Duration::from_secs(120),
            )
            .unwrap();
        assert!(!stale.from_cache);
        assert_eq!(log.borrow().len(), 3, "expired entry refetched");
        assert_eq!(ctx.cookies.len(), 1);
    }
}

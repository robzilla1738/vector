//! Networking for the Vector Engine.
//!
//! # Contract
//!
//! * A [`NetworkContext`] is the unit of isolation: it owns a [`CookieJar`],
//!   an [`HttpCache`], a [`NetworkPolicy`] and a [`Transport`]. Two contexts
//!   never share state, so an embedder can run many independent "profiles"
//!   in one process.
//! * [`NetworkContext::fetch`] implements the engine-side parts of Fetch that
//!   do not depend on the wire: policy enforcement, cookie attachment and
//!   storage, cache lookup / storage, redirect following, `data:`, `about:`
//!   and `file:` URLs. The wire itself is behind the [`Transport`] trait.
//! * Every request carries attribution ([`Request::page`],
//!   [`Request::initiator`], [`Request::background`]); the context keeps the
//!   in-flight set and a bounded log of completed responses so `settle()`
//!   (architecture §6, condition 3) and `waitFor { kind: "response" }` can be
//!   answered without callbacks.
//! * The default build has **no** real transport (pure Rust, no TLS): use
//!   [`MockTransport`] for tests or enable the `http` feature for
//!   [`HyperTransport`] (hyper 1 + rustls + HTTP/1.1 and HTTP/2).
//! * Everything is synchronous from the caller's point of view; the hyper
//!   transport runs its own single-threaded tokio runtime. Streaming bodies
//!   and progress events are a follow-up.

#![forbid(unsafe_code)]

pub mod broker;
pub mod cache;
pub mod cookie;
pub mod http3;
#[cfg(feature = "http")]
pub mod hyper_transport;
pub mod policy;
pub mod transport;
pub mod websocket;
pub mod wire;

use std::collections::VecDeque;
use std::time::{Instant, SystemTime};

use bytes::Bytes;
use http::header::{HeaderMap, HeaderName, HeaderValue};
use http::{Method, StatusCode};
use serde::{Deserialize, Serialize};
use url::Url;
use ve_core::Stage;

pub use broker::{FetchJob, NetworkBroker};
pub use cache::{CacheLookup, HttpCache};
pub use cookie::{BrowserCookie, Cookie, CookieJar, SameSite};
pub use http3::{ProtocolSupport, advertises_http3};
#[cfg(feature = "http")]
pub use hyper_transport::HyperTransport;
pub use policy::NetworkPolicy;
pub use transport::{FnTransport, MockTransport, NullTransport, Transport};
pub use websocket::WebSocketClient;
pub use wire::{WireRequest, WireResponse};

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
    /// The request was refused by the context's [`NetworkPolicy`].
    #[error("blocked by network policy: {0}")]
    Blocked(String),
    /// A `file:` URL could not be read.
    #[error("file: {0}")]
    Io(String),
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
        match e {
            NetError::InvalidUrl(_) => ve_core::Error::parse("url", e.to_string()),
            NetError::UnsupportedScheme(_) | NetError::Blocked(_) => {
                ve_core::Error::invalid_params(e.to_string())
            }
            other => ve_core::Error::Network(other.to_string()),
        }
    }
}

/// Who issued a request (architecture §8, attribution).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Initiator {
    /// A top-level navigation (open, link activation, form submission).
    #[default]
    Navigation,
    /// The HTML parser (stylesheets, images, scripts).
    Parser,
    /// Page script (`fetch`, `XMLHttpRequest`).
    Script,
    /// An agent step (`upload`, `waitFor response` probes).
    Agent,
    /// Speculative prefetch.
    Prefetch,
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
    /// The page this request is attributed to (engine page id), if any.
    pub page: Option<u64>,
    /// What issued the request.
    pub initiator: Initiator,
    /// Background requests (streams, beacons) never block `settle()`.
    pub background: bool,
}

impl Request {
    /// A `GET` request for `url`.
    pub fn get(url: &str) -> Result<Self, NetError> {
        Ok(Self {
            method: Method::GET,
            url: Url::parse(url)?,
            headers: HeaderMap::new(),
            body: None,
            page: None,
            initiator: Initiator::Navigation,
            background: false,
        })
    }

    /// A `POST` request with a body and `Content-Type`.
    pub fn post(url: &str, body: impl Into<Bytes>, content_type: &str) -> Result<Self, NetError> {
        let mut request = Self::get(url)?;
        request.method = Method::POST;
        request.body = Some(body.into());
        request = request.header("content-type", content_type);
        Ok(request)
    }

    /// Adds a header (invalid names/values are ignored).
    #[must_use]
    pub fn header(mut self, name: &str, value: &str) -> Self {
        if let (Ok(n), Ok(v)) = (HeaderName::try_from(name), HeaderValue::from_str(value)) {
            self.headers.insert(n, v);
        }
        self
    }

    /// Attributes the request to a page.
    #[must_use]
    pub fn for_page(mut self, page: u64) -> Self {
        self.page = Some(page);
        self
    }

    /// Sets the initiator.
    #[must_use]
    pub fn with_initiator(mut self, initiator: Initiator) -> Self {
        self.initiator = initiator;
        self
    }

    /// Marks the request as background (never blocks readiness).
    #[must_use]
    pub fn background(mut self) -> Self {
        self.background = true;
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

    /// The `charset` parameter of `Content-Type`, lower-cased, if present.
    #[must_use]
    pub fn charset(&self) -> Option<String> {
        self.content_type()?
            .split(';')
            .skip(1)
            .map(str::trim)
            .find_map(|p| {
                let (k, v) = p.split_once('=')?;
                k.trim()
                    .eq_ignore_ascii_case("charset")
                    .then(|| v.trim().trim_matches('"').to_ascii_lowercase())
            })
    }

    /// Body decoded as UTF-8 (lossy). Charset-aware decoding of HTML lives in
    /// `ve-html` (`decode_html_bytes`), which also honours `<meta charset>`.
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
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(transparent)]
pub struct ContextId(pub u64);

/// A request that has been issued and not yet completed.
#[derive(Clone, Debug)]
pub struct InFlight {
    /// Sequence number (monotonic per context).
    pub request_id: u64,
    /// The page the request is attributed to.
    pub page: Option<u64>,
    /// URL as issued.
    pub url: Url,
    /// Initiator.
    pub initiator: Initiator,
    /// Background flag.
    pub background: bool,
    /// When the request was issued.
    pub issued_at: Instant,
}

/// Metadata of a completed exchange (the `onResponse` payload, body omitted).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompletedResponse {
    /// Sequence number (monotonic per context).
    pub request_id: u64,
    /// The page the request was attributed to.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub page: Option<u64>,
    /// Final URL.
    pub url: String,
    /// Method.
    pub method: String,
    /// Status code (0 when the transport failed).
    pub status: u16,
    /// `Content-Type` header.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub content_type: Option<String>,
    /// Body size in bytes.
    pub body_bytes: usize,
    /// Wall-clock start, milliseconds since the Unix epoch.
    pub started_at: u64,
    /// Wall-clock end, milliseconds since the Unix epoch.
    pub ended_at: u64,
    /// Served from cache.
    pub from_cache: bool,
}

/// An isolated networking profile.
pub struct NetworkContext {
    /// Identifier.
    pub id: ContextId,
    /// Cookies for this context.
    pub cookies: CookieJar,
    /// HTTP cache for this context.
    pub cache: HttpCache,
    /// Request policy (loopback blocking, allowlist, `file:` access).
    pub policy: NetworkPolicy,
    /// `User-Agent` sent with every request.
    pub user_agent: String,
    /// Maximum redirects followed per fetch.
    pub max_redirects: u8,
    /// Maximum retained [`CompletedResponse`] records.
    pub completed_capacity: usize,
    transport: Box<dyn Transport>,
    /// Protocols observed on this context (plan A23).
    pub protocols: crate::http3::ProtocolSupport,
    in_flight: Vec<InFlight>,
    completed: VecDeque<CompletedResponse>,
    next_request_id: u64,
}

impl std::fmt::Debug for NetworkContext {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("NetworkContext")
            .field("id", &self.id)
            .field("cookies", &self.cookies.len())
            .field("cache_entries", &self.cache.len())
            .field("policy", &self.policy)
            .field("transport", &self.transport.name())
            .finish_non_exhaustive()
    }
}

/// Default `User-Agent`. Wikimedia and others refuse tokens without a
/// contact URL, so the product token carries one (their UA policy).
pub const DEFAULT_USER_AGENT: &str = concat!(
    "Mozilla/5.0 (compatible; VectorEngine/",
    env!("CARGO_PKG_VERSION"),
    "; +https://github.com/vector-browser/vector)"
);

fn unix_millis(t: SystemTime) -> u64 {
    t.duration_since(SystemTime::UNIX_EPOCH)
        .map_or(0, |d| u64::try_from(d.as_millis()).unwrap_or(u64::MAX))
}

impl NetworkContext {
    /// Creates a context over `transport` with the default (secure) policy.
    #[must_use]
    pub fn new(id: ContextId, transport: Box<dyn Transport>) -> Self {
        Self {
            id,
            cookies: CookieJar::new(),
            cache: HttpCache::new(HttpCache::DEFAULT_MAX_BYTES),
            policy: NetworkPolicy::default(),
            user_agent: DEFAULT_USER_AGENT.to_owned(),
            max_redirects: 20,
            completed_capacity: 256,
            transport,
            protocols: crate::http3::ProtocolSupport::default(),
            in_flight: Vec::new(),
            completed: VecDeque::new(),
            next_request_id: 0,
        }
    }

    /// A context that can only resolve `data:` / `about:` (and, if the policy
    /// allows, `file:`) URLs.
    #[must_use]
    pub fn offline(id: ContextId) -> Self {
        Self::new(id, Box::new(NullTransport))
    }

    /// Replaces the policy.
    #[must_use]
    pub fn with_policy(mut self, policy: NetworkPolicy) -> Self {
        self.policy = policy;
        self
    }

    /// Fetches `request`, following redirects, using the current time.
    pub fn fetch(&mut self, request: Request) -> Result<Response, NetError> {
        self.fetch_at(request, SystemTime::now())
    }

    /// Like [`Self::fetch`] with an explicit clock (deterministic tests).
    pub fn fetch_at(&mut self, request: Request, now: SystemTime) -> Result<Response, NetError> {
        let span = Stage::Fetch.span();
        let _guard = span.enter();
        self.next_request_id += 1;
        let request_id = self.next_request_id;
        let started = Instant::now();
        let started_at = unix_millis(now);
        let method = request.method.to_string();
        let page = request.page;
        self.in_flight.push(InFlight {
            request_id,
            page,
            url: request.url.clone(),
            initiator: request.initiator,
            background: request.background,
            issued_at: started,
        });
        let result = self.fetch_inner(request, now);
        self.in_flight.retain(|r| r.request_id != request_id);
        let ended_at = started_at + u64::try_from(started.elapsed().as_millis()).unwrap_or(0);
        let record = match &result {
            Ok(response) => CompletedResponse {
                request_id,
                page,
                url: response.url.to_string(),
                method,
                status: response.status.as_u16(),
                content_type: response.content_type().map(str::to_owned),
                body_bytes: response.body.len(),
                started_at,
                ended_at,
                from_cache: response.from_cache,
            },
            Err(e) => CompletedResponse {
                request_id,
                page,
                url: e.to_string(),
                method,
                status: 0,
                content_type: None,
                body_bytes: 0,
                started_at,
                ended_at,
                from_cache: false,
            },
        };
        if self.completed.len() >= self.completed_capacity.max(1) {
            self.completed.pop_front();
        }
        self.completed.push_back(record);
        result
    }

    fn fetch_inner(&mut self, mut request: Request, now: SystemTime) -> Result<Response, NetError> {
        let mut redirects = 0u8;
        loop {
            let prepared = match self.prepare(request, now)? {
                Prepared::Done(response) => return Ok(*response),
                Prepared::Send(p) => *p,
            };
            let response = self.transport.send(&prepared.request)?;
            if crate::http3::advertises_http3(&response.headers) {
                self.protocols.http3 = true;
            }
            match prepared.request.url.scheme() {
                "http" | "https" => self.protocols.http1 = true,
                "ws" | "wss" => self.protocols.websocket = true,
                _ => {}
            }
            match self.finish(prepared, response, now, &mut redirects)? {
                Finished::Done(response) => return Ok(response),
                Finished::Redirect(next) => request = next,
            }
        }
    }

    /// Fetches several requests in one batch: cache hits are answered
    /// immediately, the misses go to the transport together
    /// ([`Transport::send_many`]) and redirects are followed individually.
    /// Results are in request order. Every request is logged as
    /// in-flight/completed exactly like [`Self::fetch`], so `settle()` sees
    /// the batch.
    pub fn fetch_many(&mut self, requests: Vec<Request>) -> Vec<Result<Response, NetError>> {
        self.fetch_many_at(requests, SystemTime::now())
    }

    /// Like [`Self::fetch_many`] with an explicit clock.
    pub fn fetch_many_at(
        &mut self,
        requests: Vec<Request>,
        now: SystemTime,
    ) -> Vec<Result<Response, NetError>> {
        let span = Stage::Fetch.span();
        let _guard = span.enter();
        let started = Instant::now();
        let started_at = unix_millis(now);
        let mut results: Vec<Option<Result<Response, NetError>>> =
            (0..requests.len()).map(|_| None).collect();
        let mut meta = Vec::with_capacity(requests.len());
        let mut pending: Vec<(usize, PreparedRequest)> = Vec::new();
        for (i, request) in requests.into_iter().enumerate() {
            self.next_request_id += 1;
            meta.push((
                self.next_request_id,
                request.page,
                request.method.to_string(),
            ));
            self.in_flight.push(InFlight {
                request_id: self.next_request_id,
                page: request.page,
                url: request.url.clone(),
                initiator: request.initiator,
                background: request.background,
                issued_at: started,
            });
            match self.prepare(request, now) {
                Ok(Prepared::Done(r)) => results[i] = Some(Ok(*r)),
                Ok(Prepared::Send(p)) => pending.push((i, *p)),
                Err(e) => results[i] = Some(Err(e)),
            }
        }
        let wire: Vec<Request> = pending.iter().map(|(_, p)| p.request.clone()).collect();
        let responses = self.transport.send_many(&wire);
        for ((i, prepared), response) in pending.into_iter().zip(responses) {
            let mut redirects = 0u8;
            results[i] = Some(match response {
                Err(e) => Err(e),
                Ok(response) => match self.finish(prepared, response, now, &mut redirects) {
                    Ok(Finished::Done(r)) => Ok(r),
                    Ok(Finished::Redirect(next)) => self.fetch_inner(next, now),
                    Err(e) => Err(e),
                },
            });
        }
        let ended_at = started_at + u64::try_from(started.elapsed().as_millis()).unwrap_or(0);
        for ((request_id, page, method), result) in meta.into_iter().zip(results.iter()) {
            self.in_flight.retain(|r| r.request_id != request_id);
            let record = match result.as_ref().expect("every slot filled") {
                Ok(response) => CompletedResponse {
                    request_id,
                    page,
                    url: response.url.to_string(),
                    method,
                    status: response.status.as_u16(),
                    content_type: response.content_type().map(str::to_owned),
                    body_bytes: response.body.len(),
                    started_at,
                    ended_at,
                    from_cache: response.from_cache,
                },
                Err(e) => CompletedResponse {
                    request_id,
                    page,
                    url: e.to_string(),
                    method,
                    status: 0,
                    content_type: None,
                    body_bytes: 0,
                    started_at,
                    ended_at,
                    from_cache: false,
                },
            };
            if self.completed.len() >= self.completed_capacity.max(1) {
                self.completed.pop_front();
            }
            self.completed.push_back(record);
        }
        results
            .into_iter()
            .map(|r| r.expect("every slot filled"))
            .collect()
    }

    /// Everything before the wire: scheme dispatch, policy, cache lookup
    /// (fresh hit answers here), conditional headers, UA/Accept/Cookie.
    fn prepare(&mut self, mut request: Request, now: SystemTime) -> Result<Prepared, NetError> {
        match request.url.scheme() {
            "data" => return data_url(&request.url).map(|r| Prepared::Done(Box::new(r))),
            "about" => {
                let mut headers = HeaderMap::new();
                headers.insert(
                    http::header::CONTENT_TYPE,
                    HeaderValue::from_static("text/html;charset=utf-8"),
                );
                return Ok(Prepared::Done(Box::new(Response::new(
                    request.url.clone(),
                    StatusCode::OK,
                    headers,
                    Bytes::new(),
                ))));
            }
            "file" => {
                self.policy.check(&request.url)?;
                return file_url(&request.url).map(|r| Prepared::Done(Box::new(r)));
            }
            "http" | "https" => {}
            other => return Err(NetError::UnsupportedScheme(other.to_owned())),
        }
        crate::policy::strip_userinfo(&mut request.url);
        self.policy.check_request(&request)?;

        // Cache: a fresh entry is served directly; a stale one with
        // validators is revalidated conditionally and a 304 refreshes it
        // (RFC 9111 §4.3) — one round trip with no body instead of a
        // full transfer.
        let mut stale: Option<Response> = None;
        if request.method == Method::GET {
            match self.cache.lookup(&request.cache_key(), now) {
                CacheLookup::Fresh(mut cached) => {
                    tracing::debug!(url = %request.url, "cache hit");
                    cached.from_cache = true;
                    return Ok(Prepared::Done(Box::new(cached)));
                }
                CacheLookup::Stale {
                    response,
                    etag,
                    last_modified,
                } if etag.is_some() || last_modified.is_some() => {
                    if let Some(v) = etag.as_deref().and_then(|v| HeaderValue::from_str(v).ok()) {
                        request.headers.insert(http::header::IF_NONE_MATCH, v);
                    }
                    if let Some(v) = last_modified
                        .as_deref()
                        .and_then(|v| HeaderValue::from_str(v).ok())
                    {
                        request.headers.insert(http::header::IF_MODIFIED_SINCE, v);
                    }
                    stale = Some(response);
                }
                CacheLookup::Stale { .. } | CacheLookup::Miss => {}
            }
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
        Ok(Prepared::Send(Box::new(PreparedRequest { request, stale })))
    }

    /// Everything after the wire: 304 → cached body, Set-Cookie, redirect
    /// decision, cache store.
    fn finish(
        &mut self,
        prepared: PreparedRequest,
        mut response: Response,
        now: SystemTime,
        redirects: &mut u8,
    ) -> Result<Finished, NetError> {
        let PreparedRequest {
            mut request,
            mut stale,
        } = prepared;
        if response.status == StatusCode::NOT_MODIFIED
            && let Some(mut cached) = stale.take()
        {
            tracing::debug!(url = %request.url, "revalidated (304)");
            // the 304 carries fresh metadata (Date, Cache-Control, ETag…)
            for (name, value) in &response.headers {
                cached.headers.insert(name.clone(), value.clone());
            }
            cached.from_cache = true;
            self.cache
                .store(request.cache_key(), &request.headers, &cached, now);
            response = cached;
        }
        request.headers.remove(http::header::IF_NONE_MATCH);
        request.headers.remove(http::header::IF_MODIFIED_SINCE);
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
            *redirects += 1;
            if *redirects > self.max_redirects {
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
            return Ok(Finished::Redirect(request));
        }

        if request.method == Method::GET && !response.from_cache {
            self.cache
                .store(request.cache_key(), &request.headers, &response, now);
        }
        Ok(Finished::Done(response))
    }

    /// The transport's name.
    #[must_use]
    pub fn transport_name(&self) -> &'static str {
        self.transport.name()
    }

    /// Requests currently in flight (attributed to `page` when given).
    #[must_use]
    pub fn in_flight(&self, page: Option<u64>) -> Vec<&InFlight> {
        self.in_flight
            .iter()
            .filter(|r| page.is_none() || r.page == page)
            .collect()
    }

    /// Completed exchanges, oldest first (attributed to `page` when given).
    #[must_use]
    pub fn completed(&self, page: Option<u64>) -> Vec<&CompletedResponse> {
        self.completed
            .iter()
            .filter(|r| page.is_none() || r.page == page)
            .collect()
    }

    /// The sequence number the next request will receive; callers remember it
    /// to look only at responses completed after a given point.
    #[must_use]
    pub fn next_request_id(&self) -> u64 {
        self.next_request_id + 1
    }
}

/// Guesses a `Content-Type` from a file extension.
fn mime_for_path(path: &std::path::Path) -> &'static str {
    match path
        .extension()
        .and_then(|e| e.to_str())
        .map(str::to_ascii_lowercase)
        .as_deref()
    {
        Some("html" | "htm" | "xhtml") => "text/html",
        Some("css") => "text/css",
        Some("js" | "mjs") => "text/javascript",
        Some("json") => "application/json",
        Some("txt" | "md") => "text/plain",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("jpg" | "jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("webp") => "image/webp",
        Some("pdf") => "application/pdf",
        _ => "application/octet-stream",
    }
}

/// Reads a `file:` URL from disk.
/// A request that must go to the wire, with the stale cache entry it may
/// revalidate.
struct PreparedRequest {
    request: Request,
    stale: Option<Response>,
}

enum Prepared {
    /// Answered without the network (`data:` / `about:` / `file:` / fresh cache).
    Done(Box<Response>),
    Send(Box<PreparedRequest>),
}

enum Finished {
    Done(Response),
    /// Follow this request next.
    Redirect(Request),
}

/// Decodes a `Content-Encoding` body (`gzip`, `deflate`, `br`, possibly
/// comma-chained) into identity bytes. Pure Rust; used by the transport and
/// by anything replaying a stored encoded body.
pub fn decode_body(encoding: &str, raw: &[u8]) -> Result<Bytes, NetError> {
    use std::io::Read;
    // codings are listed in application order; undo them last-first
    let mut data: Vec<u8> = raw.to_vec();
    for coding in encoding.split(',').map(str::trim).rev() {
        let mut out = Vec::with_capacity(data.len() * 3);
        match coding.to_ascii_lowercase().as_str() {
            "" | "identity" => continue,
            "gzip" | "x-gzip" => flate2::read::MultiGzDecoder::new(&data[..])
                .read_to_end(&mut out)
                .map_err(|e| NetError::Http(format!("gzip: {e}")))?,
            "deflate" => {
                // RFC 9110 deflate is zlib-wrapped, but raw deflate is common
                if flate2::read::ZlibDecoder::new(&data[..])
                    .read_to_end(&mut out)
                    .is_err()
                {
                    out.clear();
                    flate2::read::DeflateDecoder::new(&data[..])
                        .read_to_end(&mut out)
                        .map_err(|e| NetError::Http(format!("deflate: {e}")))?;
                }
                out.len()
            }
            "br" => brotli::Decompressor::new(&data[..], 8 * 1024)
                .read_to_end(&mut out)
                .map_err(|e| NetError::Http(format!("brotli: {e}")))?,
            other => {
                return Err(NetError::Http(format!(
                    "unsupported content-encoding `{other}`"
                )));
            }
        };
        data = out;
    }
    Ok(Bytes::from(data))
}

fn file_url(url: &Url) -> Result<Response, NetError> {
    let path = url
        .to_file_path()
        .map_err(|()| NetError::Io(format!("{url} is not a local file path")))?;
    let body =
        std::fs::read(&path).map_err(|e| NetError::Io(format!("{}: {e}", path.display())))?;
    let mut headers = HeaderMap::new();
    headers.insert(
        http::header::CONTENT_TYPE,
        HeaderValue::from_static(mime_for_path(&path)),
    );
    headers.insert(
        http::header::CACHE_CONTROL,
        HeaderValue::from_static("no-store"),
    );
    Ok(Response::new(url.clone(), StatusCode::OK, headers, body))
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
pub fn base64_decode(input: &[u8]) -> Option<Vec<u8>> {
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

/// Standard base64 encoding with padding (used for screenshot payloads).
#[must_use]
pub fn base64_encode(input: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(input.len().div_ceil(3) * 4);
    for chunk in input.chunks(3) {
        let b = [
            chunk[0],
            *chunk.get(1).unwrap_or(&0),
            *chunk.get(2).unwrap_or(&0),
        ];
        let n = (u32::from(b[0]) << 16) | (u32::from(b[1]) << 8) | u32::from(b[2]);
        out.push(TABLE[((n >> 18) & 63) as usize] as char);
        out.push(TABLE[((n >> 12) & 63) as usize] as char);
        out.push(if chunk.len() > 1 {
            TABLE[((n >> 6) & 63) as usize] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            TABLE[(n & 63) as usize] as char
        } else {
            '='
        });
    }
    out
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
        assert_eq!(r.charset().as_deref(), Some("us-ascii"));
        assert!(matches!(
            ctx.fetch(Request::get("https://example.com/").unwrap()),
            Err(NetError::NoTransport)
        ));
        assert!(matches!(
            ctx.fetch(Request::get("mailto:x@y").unwrap()),
            Err(NetError::UnsupportedScheme(_))
        ));
        assert_eq!(ctx.completed(None).len(), 5, "every fetch is logged");
        assert_eq!(
            ctx.completed(None)[3].status,
            0,
            "failures logged with status 0"
        );
    }

    #[test]
    fn stale_entries_are_revalidated_and_a_304_refreshes_them() {
        let mock = MockTransport::new();
        let log = mock.log();
        let hits = std::rc::Rc::new(std::cell::Cell::new(0u32));
        let h = hits.clone();
        mock.respond_with("https://example.com/doc", move |req| {
            h.set(h.get() + 1);
            if req
                .headers
                .get("if-none-match")
                .is_some_and(|v| v == "\"v1\"")
            {
                MockTransport::response(
                    req,
                    304,
                    &[("ETag", "\"v1\""), ("Cache-Control", "max-age=60")],
                    "",
                )
            } else {
                MockTransport::response(
                    req,
                    200,
                    &[
                        ("ETag", "\"v1\""),
                        ("Cache-Control", "max-age=10"),
                        ("Content-Type", "text/html"),
                    ],
                    "<p>v1</p>",
                )
            }
        });
        let mut ctx = NetworkContext::new(ContextId(1), Box::new(mock));
        let t0 = SystemTime::UNIX_EPOCH + Duration::from_secs(1_700_000_000);
        let first = ctx
            .fetch_at(Request::get("https://example.com/doc").unwrap(), t0)
            .unwrap();
        assert_eq!(first.text(), "<p>v1</p>");
        assert!(!first.from_cache);
        // still fresh: served from cache, origin not contacted
        let hit = ctx
            .fetch_at(
                Request::get("https://example.com/doc").unwrap(),
                t0 + Duration::from_secs(5),
            )
            .unwrap();
        assert!(hit.from_cache);
        assert_eq!(hits.get(), 1);
        // stale: conditional request, 304, body comes from the cache
        let reval = ctx
            .fetch_at(
                Request::get("https://example.com/doc").unwrap(),
                t0 + Duration::from_secs(20),
            )
            .unwrap();
        assert_eq!(hits.get(), 2);
        assert_eq!(reval.status, 200, "the caller never sees the 304");
        assert_eq!(reval.text(), "<p>v1</p>");
        assert!(reval.from_cache);
        assert_eq!(
            log.borrow()
                .last()
                .unwrap()
                .headers
                .get("if-none-match")
                .unwrap(),
            "\"v1\""
        );
        // the 304's Cache-Control (max-age=60) extended the freshness
        let again = ctx
            .fetch_at(
                Request::get("https://example.com/doc").unwrap(),
                t0 + Duration::from_secs(60),
            )
            .unwrap();
        assert!(again.from_cache);
        assert_eq!(
            hits.get(),
            2,
            "no round trip while the refreshed entry is fresh"
        );
    }

    #[test]
    fn content_encodings_decode_to_identity() {
        use std::io::Write;
        let text = "<html>".repeat(500);
        let mut gz = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::fast());
        gz.write_all(text.as_bytes()).unwrap();
        let gz = gz.finish().unwrap();
        assert_eq!(decode_body("gzip", &gz).unwrap(), text.as_bytes());
        let mut zl = flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::fast());
        zl.write_all(text.as_bytes()).unwrap();
        assert_eq!(
            decode_body("deflate", &zl.finish().unwrap()).unwrap(),
            text.as_bytes()
        );
        let mut br = Vec::new();
        {
            let mut w = brotli::CompressorWriter::new(&mut br, 4096, 5, 22);
            w.write_all(text.as_bytes()).unwrap();
        }
        assert_eq!(decode_body("br", &br).unwrap(), text.as_bytes());
        assert_eq!(decode_body("identity", b"x").unwrap(), &b"x"[..]);
        assert!(decode_body("zstd", b"x").is_err());
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
                ("Content-Type", "text/html; charset=ISO-8859-1"),
            ],
            "<p>home</p>",
        );
        let log = mock.log();
        let mut ctx = NetworkContext::new(ContextId(7), Box::new(mock));
        let t0 = SystemTime::UNIX_EPOCH + Duration::from_secs(1_700_000_000);

        let r = ctx
            .fetch_at(
                Request::get("https://example.com/login")
                    .unwrap()
                    .for_page(3),
                t0,
            )
            .unwrap();
        assert_eq!(r.status, 200);
        assert_eq!(r.url.as_str(), "https://example.com/home");
        assert_eq!(r.charset().as_deref(), Some("iso-8859-1"));
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
        let done = ctx.completed(Some(3));
        assert_eq!(done.len(), 1);
        assert_eq!(done[0].url, "https://example.com/home");
        assert_eq!(done[0].status, 200);
        assert!(ctx.completed(Some(99)).is_empty());
        assert!(
            ctx.in_flight(None).is_empty(),
            "synchronous fetch leaves nothing in flight"
        );

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

    #[test]
    fn post_requests_carry_body_and_content_type_and_redirect_to_get() {
        let mock = MockTransport::new();
        mock.respond(
            "https://example.com/submit",
            303,
            &[("Location", "/done")],
            "",
        );
        mock.respond("https://example.com/done", 200, &[], "ok");
        let log = mock.log();
        let mut ctx = NetworkContext::new(ContextId(1), Box::new(mock));
        let r = ctx
            .fetch(
                Request::post(
                    "https://example.com/submit",
                    "a=1&b=2",
                    "application/x-www-form-urlencoded",
                )
                .unwrap(),
            )
            .unwrap();
        assert_eq!(r.text(), "ok");
        let requests = log.borrow();
        assert_eq!(requests[0].method, Method::POST);
        assert_eq!(requests[0].body.as_deref(), Some(&b"a=1&b=2"[..]));
        assert_eq!(
            requests[0].headers.get("content-type").unwrap(),
            "application/x-www-form-urlencoded"
        );
        assert_eq!(requests[1].method, Method::GET, "303 switches to GET");
        assert!(requests[1].body.is_none());
    }

    #[test]
    fn file_urls_are_policy_gated_and_typed_by_extension() {
        let dir = std::env::temp_dir().join(format!("ve-net-file-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("page.html");
        std::fs::write(&path, "<title>File</title>").unwrap();
        let url = Url::from_file_path(&path).unwrap();

        let mut locked = NetworkContext::offline(ContextId(1));
        assert!(matches!(
            locked.fetch(Request::get(url.as_str()).unwrap()),
            Err(NetError::Blocked(_))
        ));

        let mut open = NetworkContext::offline(ContextId(1)).with_policy(NetworkPolicy {
            allow_file: true,
            ..NetworkPolicy::default()
        });
        let r = open.fetch(Request::get(url.as_str()).unwrap()).unwrap();
        assert_eq!(r.mime_type().as_deref(), Some("text/html"));
        assert_eq!(r.text(), "<title>File</title>");
        let missing = Url::from_file_path(dir.join("missing.html")).unwrap();
        assert!(matches!(
            open.fetch(Request::get(missing.as_str()).unwrap()),
            Err(NetError::Io(_))
        ));
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn base64_round_trip() {
        for input in [&b""[..], b"f", b"fo", b"foo", b"foob", b"fooba", b"foobar"] {
            let encoded = base64_encode(input);
            assert_eq!(
                base64_decode(encoded.as_bytes()).unwrap(),
                input,
                "{encoded}"
            );
        }
        assert_eq!(base64_encode(b"Hello, Vector"), "SGVsbG8sIFZlY3Rvcg==");
    }
}

//! In-memory HTTP cache (RFC 9111 freshness subset).
//!
//! Stores complete `GET` responses keyed by `"METHOD url"`. Freshness comes
//! from `Cache-Control: max-age` / `s-maxage`, falling back to the 10 %
//! heuristic on `Last-Modified` when the response carries no explicit
//! lifetime and the status allows it. `no-store` responses (or requests) are
//! never stored; `Vary: *` is treated as uncacheable. Validation
//! (`If-None-Match` / `If-Modified-Since`) is exposed through
//! [`CacheLookup::Stale`] but the revalidation round-trip is not yet wired
//! into [`crate::NetworkContext::fetch`].

use std::collections::{HashMap, VecDeque};
use std::time::{Duration, SystemTime};

use http::StatusCode;
use http::header::{HeaderMap, HeaderValue};

use crate::Response;
use crate::cookie::parse_http_date;

/// The outcome of a cache lookup.
#[derive(Debug)]
pub enum CacheLookup {
    /// A fresh response that may be used without contacting the origin.
    Fresh(Response),
    /// A stored but stale response with its validators.
    Stale {
        /// The stale response.
        response: Response,
        /// `ETag` validator.
        etag: Option<String>,
        /// `Last-Modified` validator.
        last_modified: Option<String>,
    },
    /// Nothing stored.
    Miss,
}

#[derive(Clone, Debug)]
struct Entry {
    response: Response,
    stored_at: SystemTime,
    freshness: Duration,
    size: usize,
}

/// Bounded LRU-ish (FIFO eviction) response cache.
#[derive(Clone, Debug)]
pub struct HttpCache {
    entries: HashMap<String, Entry>,
    order: VecDeque<String>,
    bytes: usize,
    max_bytes: usize,
}

fn directive<'a>(headers: &'a HeaderMap, name: &str) -> impl Iterator<Item = &'a str> {
    headers
        .get_all(http::header::CACHE_CONTROL)
        .iter()
        .filter_map(|v| v.to_str().ok())
        .flat_map(|v| v.split(','))
        .map(str::trim)
        .filter(move |d| {
            d.split('=')
                .next()
                .is_some_and(|k| k.trim().eq_ignore_ascii_case(name))
        })
}

fn directive_value(headers: &HeaderMap, name: &str) -> Option<u64> {
    directive(headers, name)
        .next()?
        .split_once('=')?
        .1
        .trim()
        .trim_matches('"')
        .parse()
        .ok()
}

fn header_str(headers: &HeaderMap, name: http::header::HeaderName) -> Option<String> {
    headers
        .get(name)
        .and_then(|v: &HeaderValue| v.to_str().ok())
        .map(str::to_owned)
}

impl HttpCache {
    /// Default capacity: 32 MiB.
    pub const DEFAULT_MAX_BYTES: usize = 32 * 1024 * 1024;

    /// Creates a cache holding at most `max_bytes` of bodies.
    #[must_use]
    pub fn new(max_bytes: usize) -> Self {
        Self {
            entries: HashMap::new(),
            order: VecDeque::new(),
            bytes: 0,
            max_bytes,
        }
    }

    /// Number of stored responses.
    #[must_use]
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Whether the cache is empty.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Total body bytes stored.
    #[must_use]
    pub fn bytes(&self) -> usize {
        self.bytes
    }

    /// Removes everything.
    pub fn clear(&mut self) {
        self.entries.clear();
        self.order.clear();
        self.bytes = 0;
    }

    /// Computes how long a response may be served without revalidation.
    /// Returns `None` if the response must not be stored.
    #[must_use]
    pub fn freshness_lifetime(response: &Response, now: SystemTime) -> Option<Duration> {
        let h = &response.headers;
        if directive(h, "no-store").next().is_some() || directive(h, "private").next().is_some() {
            return None;
        }
        if h.get(http::header::VARY)
            .is_some_and(|v| v.to_str().is_ok_and(|s| s.trim() == "*"))
        {
            return None;
        }
        if let Some(secs) = directive_value(h, "s-maxage").or_else(|| directive_value(h, "max-age"))
        {
            return Some(Duration::from_secs(secs));
        }
        if let Some(expires) = header_str(h, http::header::EXPIRES) {
            let date = header_str(h, http::header::DATE)
                .and_then(|d| parse_http_date(&d))
                .unwrap_or(now);
            return Some(
                parse_http_date(&expires)
                    .and_then(|e| e.duration_since(date).ok())
                    .unwrap_or(Duration::ZERO),
            );
        }
        // Heuristic freshness: 10 % of the time since Last-Modified, for
        // statuses that are cacheable by default (RFC 9111 §4.2.2).
        let heuristic_ok = matches!(
            response.status.as_u16(),
            200 | 203 | 204 | 206 | 300 | 301 | 308 | 404 | 405 | 410 | 414 | 501
        );
        if heuristic_ok
            && let Some(lm) =
                header_str(h, http::header::LAST_MODIFIED).and_then(|s| parse_http_date(&s))
            && let Ok(age) = now.duration_since(lm)
        {
            return Some((age / 10).min(Duration::from_secs(24 * 3600)));
        }
        None
    }

    /// Stores `response` for `key` if it is cacheable.
    pub fn store(
        &mut self,
        key: String,
        request_headers: &HeaderMap,
        response: &Response,
        now: SystemTime,
    ) {
        if directive(request_headers, "no-store").next().is_some() {
            return;
        }
        if !matches!(
            response.status,
            StatusCode::OK
                | StatusCode::NON_AUTHORITATIVE_INFORMATION
                | StatusCode::NO_CONTENT
                | StatusCode::MOVED_PERMANENTLY
                | StatusCode::NOT_FOUND
                | StatusCode::GONE
                | StatusCode::PERMANENT_REDIRECT
        ) {
            return;
        }
        let Some(freshness) = Self::freshness_lifetime(response, now) else {
            return;
        };
        let size = response.body.len();
        if size > self.max_bytes {
            return;
        }
        self.remove(&key);
        while self.bytes + size > self.max_bytes {
            let Some(oldest) = self.order.pop_front() else {
                break;
            };
            if let Some(e) = self.entries.remove(&oldest) {
                self.bytes -= e.size;
            }
        }
        let mut stored = response.clone();
        stored.from_cache = false;
        self.entries.insert(
            key.clone(),
            Entry {
                response: stored,
                stored_at: now,
                freshness,
                size,
            },
        );
        self.order.push_back(key);
        self.bytes += size;
    }

    /// Looks up `key` at `now`.
    #[must_use]
    pub fn lookup(&self, key: &str, now: SystemTime) -> CacheLookup {
        let Some(entry) = self.entries.get(key) else {
            return CacheLookup::Miss;
        };
        let age = now
            .duration_since(entry.stored_at)
            .unwrap_or(Duration::ZERO);
        let must_revalidate = directive(&entry.response.headers, "no-cache")
            .next()
            .is_some();
        if age < entry.freshness && !must_revalidate {
            CacheLookup::Fresh(entry.response.clone())
        } else {
            CacheLookup::Stale {
                response: entry.response.clone(),
                etag: header_str(&entry.response.headers, http::header::ETAG),
                last_modified: header_str(&entry.response.headers, http::header::LAST_MODIFIED),
            }
        }
    }

    /// Removes an entry.
    pub fn remove(&mut self, key: &str) {
        if let Some(e) = self.entries.remove(key) {
            self.bytes -= e.size;
            self.order.retain(|k| k != key);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use url::Url;

    fn response(headers: &[(&str, &str)], body: &str) -> Response {
        let mut map = HeaderMap::new();
        for (k, v) in headers {
            map.append(
                http::header::HeaderName::try_from(*k).unwrap(),
                HeaderValue::from_str(v).unwrap(),
            );
        }
        Response::new(
            Url::parse("https://x.test/a").unwrap(),
            StatusCode::OK,
            map,
            body.to_owned(),
        )
    }

    fn t(secs: u64) -> SystemTime {
        SystemTime::UNIX_EPOCH + Duration::from_secs(1_700_000_000 + secs)
    }

    #[test]
    fn freshness_rules() {
        assert_eq!(
            HttpCache::freshness_lifetime(
                &response(&[("Cache-Control", "public, max-age=120")], ""),
                t(0)
            ),
            Some(Duration::from_secs(120))
        );
        assert_eq!(
            HttpCache::freshness_lifetime(
                &response(&[("Cache-Control", "s-maxage=5, max-age=120")], ""),
                t(0)
            ),
            Some(Duration::from_secs(5))
        );
        assert_eq!(
            HttpCache::freshness_lifetime(&response(&[("Cache-Control", "no-store")], ""), t(0)),
            None
        );
        assert_eq!(
            HttpCache::freshness_lifetime(&response(&[("Vary", "*")], ""), t(0)),
            None
        );
        assert_eq!(
            HttpCache::freshness_lifetime(&response(&[], ""), t(0)),
            None,
            "no validators, no heuristic"
        );
        let lm = response(&[("Last-Modified", "Tue, 14 Nov 2023 22:13:20 GMT")], "");
        // 1_700_000_000 is exactly that date; 1000 s later -> 100 s heuristic.
        assert_eq!(
            HttpCache::freshness_lifetime(&lm, t(1000)),
            Some(Duration::from_secs(100))
        );
    }

    #[test]
    fn store_lookup_and_eviction() {
        let mut cache = HttpCache::new(10);
        let req = HeaderMap::new();
        cache.store(
            "GET a".into(),
            &req,
            &response(
                &[("Cache-Control", "max-age=60"), ("ETag", "\"v1\"")],
                "12345",
            ),
            t(0),
        );
        assert!(
            matches!(cache.lookup("GET a", t(30)), CacheLookup::Fresh(r) if r.text() == "12345")
        );
        assert!(
            matches!(cache.lookup("GET a", t(61)), CacheLookup::Stale { etag: Some(e), .. } if e == "\"v1\"")
        );
        assert!(matches!(cache.lookup("GET b", t(0)), CacheLookup::Miss));

        cache.store(
            "GET b".into(),
            &req,
            &response(&[("Cache-Control", "max-age=60")], "67890"),
            t(0),
        );
        assert_eq!((cache.len(), cache.bytes()), (2, 10));
        cache.store(
            "GET c".into(),
            &req,
            &response(&[("Cache-Control", "max-age=60")], "x"),
            t(0),
        );
        assert_eq!(cache.len(), 2, "oldest evicted to fit");
        assert!(matches!(cache.lookup("GET a", t(0)), CacheLookup::Miss));

        let mut no_store_req = HeaderMap::new();
        no_store_req.insert(
            http::header::CACHE_CONTROL,
            HeaderValue::from_static("no-store"),
        );
        cache.store(
            "GET d".into(),
            &no_store_req,
            &response(&[("Cache-Control", "max-age=60")], "x"),
            t(0),
        );
        assert!(matches!(cache.lookup("GET d", t(0)), CacheLookup::Miss));

        cache.store(
            "GET e".into(),
            &req,
            &response(&[("Cache-Control", "max-age=60, no-cache")], "x"),
            t(0),
        );
        assert!(
            matches!(cache.lookup("GET e", t(0)), CacheLookup::Stale { .. }),
            "no-cache always revalidates"
        );
    }
}

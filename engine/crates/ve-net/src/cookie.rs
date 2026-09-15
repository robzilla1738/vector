//! Cookies (RFC 6265 storage model, plus `SameSite` parsing).

use std::time::{Duration, SystemTime};

use serde::{Deserialize, Serialize};
use url::Url;

/// `SameSite` attribute.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default)]
pub enum SameSite {
    /// Sent with all requests (requires `Secure`).
    None,
    /// Sent with same-site requests and top-level navigations.
    #[default]
    Lax,
    /// Sent with same-site requests only.
    Strict,
}

/// A stored cookie.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Cookie {
    /// Name.
    pub name: String,
    /// Value.
    pub value: String,
    /// Domain (lower-case, no leading dot).
    pub domain: String,
    /// `true` if no `Domain` attribute was given: matches the exact host only.
    pub host_only: bool,
    /// Path.
    pub path: String,
    /// Expiry (`None` = session cookie).
    pub expires: Option<SystemTime>,
    /// `Secure`.
    pub secure: bool,
    /// `HttpOnly`.
    pub http_only: bool,
    /// `SameSite`.
    pub same_site: SameSite,
}

/// Default path per RFC 6265 §5.1.4.
fn default_path(url: &Url) -> String {
    let path = url.path();
    if !path.starts_with('/') {
        return "/".into();
    }
    match path.rfind('/') {
        Some(0) | None => "/".into(),
        Some(i) => path[..i].to_owned(),
    }
}

/// Parses an HTTP-date in the three RFC 7231 formats (`Sun, 06 Nov 1994
/// 08:49:37 GMT`, RFC 850, asctime). Returns `None` for anything else.
#[must_use]
pub fn parse_http_date(s: &str) -> Option<SystemTime> {
    let cleaned = s.replace([',', '-'], " ");
    let parts: Vec<&str> = cleaned.split_whitespace().collect();
    // RFC 1123 / RFC 850: Wdy DD Mon YYYY HH:MM:SS GMT ; asctime: Wdy Mon DD HH:MM:SS YYYY
    let (day, mon, year, time) = match parts.as_slice() {
        [_, dd, mm, yyyy, hms, ..] if dd.chars().all(|c| c.is_ascii_digit()) => {
            (*dd, *mm, *yyyy, *hms)
        }
        [_, mm, dd, hms, yyyy] => (*dd, *mm, *yyyy, *hms),
        _ => return None,
    };
    let day: u32 = day.parse().ok()?;
    let month = match mon.to_ascii_lowercase().as_str() {
        "jan" => 1,
        "feb" => 2,
        "mar" => 3,
        "apr" => 4,
        "may" => 5,
        "jun" => 6,
        "jul" => 7,
        "aug" => 8,
        "sep" => 9,
        "oct" => 10,
        "nov" => 11,
        "dec" => 12,
        _ => return None,
    };
    let mut year: i64 = year.parse().ok()?;
    if year < 100 {
        year += if year < 70 { 2000 } else { 1900 };
    }
    let mut hms = time.split(':');
    let hours: u64 = hms.next()?.parse().ok()?;
    let minutes: u64 = hms.next()?.parse().ok()?;
    let seconds: u64 = hms.next()?.parse().ok()?;
    let days = days_from_civil(year, month, day)?;
    let secs = u64::try_from(days).ok()? * 86_400 + hours * 3600 + minutes * 60 + seconds;
    Some(SystemTime::UNIX_EPOCH + Duration::from_secs(secs))
}

/// Days since 1970-01-01 for a proleptic Gregorian date (Howard Hinnant's algorithm).
fn days_from_civil(y: i64, m: u32, d: u32) -> Option<i64> {
    if !(1..=12).contains(&m) || !(1..=31).contains(&d) || y < 1970 {
        return None;
    }
    let y = if m <= 2 { y - 1 } else { y };
    let era = y.div_euclid(400);
    let yoe = y - era * 400;
    let mp = i64::from((m + 9) % 12);
    let doy = (153 * mp + 2) / 5 + i64::from(d) - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    Some(era * 146_097 + doe - 719_468)
}

impl Cookie {
    /// Parses a `Set-Cookie` header value received from `request_url` at `now`.
    /// Returns `None` if the cookie must be rejected (bad name, foreign
    /// domain, `__Secure-` prefix without `Secure`, …).
    #[must_use]
    pub fn parse(header: &str, request_url: &Url, now: SystemTime) -> Option<Self> {
        let mut parts = header.split(';');
        let (name, value) = parts.next()?.split_once('=')?;
        let name = name.trim();
        let value = value.trim().trim_matches('"');
        if name.is_empty() || name.contains(|c: char| c.is_control() || c.is_whitespace()) {
            return None;
        }
        let host = request_url.host_str()?.to_ascii_lowercase();
        let mut cookie = Self {
            name: name.to_owned(),
            value: value.to_owned(),
            domain: host.clone(),
            host_only: true,
            path: default_path(request_url),
            expires: None,
            secure: false,
            http_only: false,
            same_site: SameSite::Lax,
        };
        let mut max_age: Option<i64> = None;
        let mut expires: Option<SystemTime> = None;
        for attr in parts {
            let (key, val) = attr
                .split_once('=')
                .map_or((attr.trim(), ""), |(k, v)| (k.trim(), v.trim()));
            match key.to_ascii_lowercase().as_str() {
                "domain" => {
                    let d = val.trim_start_matches('.').to_ascii_lowercase();
                    if d.is_empty() {
                        continue;
                    }
                    // Reject domains that do not cover the request host (and public suffixes, roughly).
                    if !(host == d || host.ends_with(&format!(".{d}"))) || !d.contains('.') {
                        return None;
                    }
                    cookie.domain = d;
                    cookie.host_only = false;
                }
                "path" if val.starts_with('/') => val.clone_into(&mut cookie.path),
                "max-age" => max_age = val.parse().ok(),
                "expires" => expires = parse_http_date(val),
                "secure" => cookie.secure = true,
                "httponly" => cookie.http_only = true,
                "samesite" => {
                    cookie.same_site = match val.to_ascii_lowercase().as_str() {
                        "strict" => SameSite::Strict,
                        "none" => SameSite::None,
                        _ => SameSite::Lax,
                    }
                }
                _ => {}
            }
        }
        cookie.expires = match max_age {
            Some(age) if age <= 0 => Some(SystemTime::UNIX_EPOCH),
            Some(age) => Some(now + Duration::from_secs(age.unsigned_abs())),
            None => expires,
        };
        if cookie.same_site == SameSite::None && !cookie.secure {
            return None;
        }
        if cookie.name.starts_with("__Secure-") && !cookie.secure {
            return None;
        }
        if cookie.name.starts_with("__Host-")
            && (!cookie.secure || !cookie.host_only || cookie.path != "/")
        {
            return None;
        }
        if cookie.secure && request_url.scheme() != "https" && host != "localhost" {
            return None;
        }
        Some(cookie)
    }

    /// Whether the cookie has expired at `now`.
    #[must_use]
    pub fn is_expired(&self, now: SystemTime) -> bool {
        self.expires.is_some_and(|e| e <= now)
    }

    /// RFC 6265 §5.1.3 domain matching.
    #[must_use]
    pub fn domain_matches(&self, host: &str) -> bool {
        let host = host.to_ascii_lowercase();
        if self.host_only {
            host == self.domain
        } else {
            host == self.domain || host.ends_with(&format!(".{}", self.domain))
        }
    }

    /// RFC 6265 §5.1.4 path matching.
    #[must_use]
    pub fn path_matches(&self, path: &str) -> bool {
        path == self.path
            || (path.starts_with(&self.path)
                && (self.path.ends_with('/') || path[self.path.len()..].starts_with('/')))
    }

    /// Whether the cookie should be sent with a request to `url`.
    #[must_use]
    pub fn matches(&self, url: &Url, now: SystemTime) -> bool {
        if self.is_expired(now) {
            return false;
        }
        let Some(host) = url.host_str() else {
            return false;
        };
        if self.secure && url.scheme() != "https" && host != "localhost" {
            return false;
        }
        self.domain_matches(host) && self.path_matches(url.path())
    }
}

/// The portable cookie shape shared with the runtime's `BrowserDriver`
/// (`BrowserCookie` in `packages/browser-driver/src/types.ts`).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserCookie {
    /// Name.
    pub name: String,
    /// Value.
    pub value: String,
    /// Domain; a leading dot marks a domain (non host-only) cookie.
    pub domain: String,
    /// Path.
    pub path: String,
    /// `Secure`.
    pub secure: bool,
    /// `HttpOnly`.
    pub http_only: bool,
    /// `Strict` | `Lax` | `None`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub same_site: Option<String>,
    /// Unix seconds; absent for session cookies.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expires: Option<f64>,
}

impl From<&Cookie> for BrowserCookie {
    fn from(c: &Cookie) -> Self {
        Self {
            name: c.name.clone(),
            value: c.value.clone(),
            domain: if c.host_only {
                c.domain.clone()
            } else {
                format!(".{}", c.domain)
            },
            path: c.path.clone(),
            secure: c.secure,
            http_only: c.http_only,
            same_site: Some(
                match c.same_site {
                    SameSite::None => "None",
                    SameSite::Lax => "Lax",
                    SameSite::Strict => "Strict",
                }
                .to_owned(),
            ),
            expires: c.expires.and_then(|e| {
                e.duration_since(SystemTime::UNIX_EPOCH)
                    .ok()
                    .map(|d| d.as_secs_f64())
            }),
        }
    }
}

impl From<BrowserCookie> for Cookie {
    fn from(b: BrowserCookie) -> Self {
        let host_only = !b.domain.starts_with('.');
        Self {
            name: b.name,
            value: b.value,
            domain: b.domain.trim_start_matches('.').to_ascii_lowercase(),
            host_only,
            path: if b.path.starts_with('/') {
                b.path
            } else {
                "/".into()
            },
            expires: b
                .expires
                .map(|secs| SystemTime::UNIX_EPOCH + Duration::from_secs_f64(secs.max(0.0))),
            secure: b.secure,
            http_only: b.http_only,
            same_site: match b.same_site.as_deref() {
                Some(s) if s.eq_ignore_ascii_case("strict") => SameSite::Strict,
                Some(s) if s.eq_ignore_ascii_case("none") => SameSite::None,
                _ => SameSite::Lax,
            },
        }
    }
}

/// Per-context cookie storage.
#[derive(Clone, Debug, Default)]
pub struct CookieJar {
    cookies: Vec<Cookie>,
}

impl CookieJar {
    /// Empty jar.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Stores a cookie, replacing one with the same name, domain and path.
    /// Storing an already-expired cookie deletes the existing one.
    pub fn store(&mut self, cookie: Cookie) {
        self.cookies.retain(|c| {
            !(c.name == cookie.name && c.domain == cookie.domain && c.path == cookie.path)
        });
        if !cookie.is_expired(SystemTime::UNIX_EPOCH) {
            self.cookies.push(cookie);
        }
    }

    /// Cookies applicable to `url`, longest path first then creation order.
    #[must_use]
    pub fn cookies_for(&self, url: &Url, now: SystemTime) -> Vec<&Cookie> {
        let mut out: Vec<&Cookie> = self
            .cookies
            .iter()
            .filter(|c| c.matches(url, now))
            .collect();
        out.sort_by_key(|c| std::cmp::Reverse(c.path.len()));
        out
    }

    /// The `Cookie` request header value for `url`, if any cookie applies.
    #[must_use]
    pub fn header_for(&self, url: &Url, now: SystemTime) -> Option<String> {
        let cookies = self.cookies_for(url, now);
        (!cookies.is_empty()).then(|| {
            cookies
                .iter()
                .map(|c| format!("{}={}", c.name, c.value))
                .collect::<Vec<_>>()
                .join("; ")
        })
    }

    /// Removes expired cookies.
    pub fn purge_expired(&mut self, now: SystemTime) {
        self.cookies.retain(|c| !c.is_expired(now));
    }

    /// Removes every cookie.
    pub fn clear(&mut self) {
        self.cookies.clear();
    }

    /// Number of stored cookies.
    #[must_use]
    pub fn len(&self) -> usize {
        self.cookies.len()
    }

    /// Whether the jar is empty.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.cookies.is_empty()
    }

    /// All cookies.
    pub fn iter(&self) -> impl Iterator<Item = &Cookie> {
        self.cookies.iter()
    }

    /// Exports every cookie in the portable [`BrowserCookie`] shape.
    #[must_use]
    pub fn export(&self) -> Vec<BrowserCookie> {
        self.cookies.iter().map(BrowserCookie::from).collect()
    }

    /// Imports cookies in the portable shape. Returns the number stored.
    pub fn import(&mut self, cookies: impl IntoIterator<Item = BrowserCookie>) -> usize {
        let mut n = 0;
        for c in cookies {
            if c.name.is_empty() || c.domain.trim_matches('.').is_empty() {
                continue;
            }
            self.store(Cookie::from(c));
            n += 1;
        }
        n
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn now() -> SystemTime {
        SystemTime::UNIX_EPOCH + Duration::from_secs(1_700_000_000)
    }

    #[test]
    fn parses_attributes_and_rejects_invalid_cookies() {
        let url = Url::parse("https://shop.example.com/cart/items").unwrap();
        let c = Cookie::parse("sid=\"abc\"; Domain=.example.com; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Strict", &url, now()).unwrap();
        assert_eq!(
            (c.name.as_str(), c.value.as_str(), c.domain.as_str()),
            ("sid", "abc", "example.com")
        );
        assert!(!c.host_only && c.secure && c.http_only);
        assert_eq!(c.same_site, SameSite::Strict);
        assert_eq!(c.expires, Some(now() + Duration::from_secs(3600)));

        let d = Cookie::parse("pref=1", &url, now()).unwrap();
        assert_eq!(d.path, "/cart", "default path is the request directory");
        assert!(d.host_only && d.expires.is_none());

        assert!(
            Cookie::parse("x=1; Domain=evil.com", &url, now()).is_none(),
            "foreign domain"
        );
        assert!(
            Cookie::parse("x=1; SameSite=None", &url, now()).is_none(),
            "SameSite=None requires Secure"
        );
        assert!(Cookie::parse("__Host-x=1; Secure; Path=/x", &url, now()).is_none());
        assert!(Cookie::parse("=nope", &url, now()).is_none());
        let http = Url::parse("http://shop.example.com/").unwrap();
        assert!(
            Cookie::parse("x=1; Secure", &http, now()).is_none(),
            "secure cookie over http"
        );

        let e = Cookie::parse("t=1; Expires=Sun, 06 Nov 1994 08:49:37 GMT", &url, now()).unwrap();
        assert_eq!(
            e.expires,
            Some(SystemTime::UNIX_EPOCH + Duration::from_secs(784_111_777))
        );
        assert!(e.is_expired(now()));
    }

    #[test]
    fn jar_matches_domain_path_scheme_and_expiry() {
        let origin = Url::parse("https://shop.example.com/").unwrap();
        let mut jar = CookieJar::new();
        jar.store(Cookie::parse("a=1; Domain=example.com; Path=/", &origin, now()).unwrap());
        jar.store(Cookie::parse("b=2; Path=/admin", &origin, now()).unwrap());
        jar.store(Cookie::parse("c=3; Secure", &origin, now()).unwrap());
        jar.store(Cookie::parse("d=4; Max-Age=10", &origin, now()).unwrap());
        assert_eq!(jar.len(), 4);

        let h = |u: &str, t: SystemTime| jar.header_for(&Url::parse(u).unwrap(), t);
        assert_eq!(
            h("https://shop.example.com/", now()).unwrap(),
            "a=1; c=3; d=4"
        );
        assert_eq!(
            h("https://shop.example.com/admin/users", now()).unwrap(),
            "b=2; a=1; c=3; d=4",
            "longest path first"
        );
        assert_eq!(
            h("https://shop.example.com/administrator", now()).unwrap(),
            "a=1; c=3; d=4",
            "/admin does not match /administrator"
        );
        assert_eq!(
            h("https://other.example.com/", now()).unwrap(),
            "a=1",
            "domain cookie only"
        );
        assert_eq!(
            h("http://shop.example.com/", now()).unwrap(),
            "a=1; d=4",
            "secure cookie withheld over http"
        );
        assert_eq!(
            h("https://shop.example.com/", now() + Duration::from_secs(11)).unwrap(),
            "a=1; c=3",
            "d expired"
        );
        assert_eq!(h("https://example.org/", now()), None);

        jar.store(
            Cookie::parse("a=; Domain=example.com; Path=/; Max-Age=0", &origin, now())
                .unwrap_or_else(|| Cookie {
                    name: "a".into(),
                    value: String::new(),
                    domain: "example.com".into(),
                    host_only: false,
                    path: "/".into(),
                    expires: Some(SystemTime::UNIX_EPOCH),
                    secure: false,
                    http_only: false,
                    same_site: SameSite::Lax,
                }),
        );
        assert_eq!(jar.len(), 3, "Max-Age=0 deletes");
        jar.purge_expired(now() + Duration::from_secs(100));
        assert_eq!(jar.len(), 2);
    }

    #[test]
    fn browser_cookie_shape_round_trips() {
        let origin = Url::parse("https://shop.example.com/").unwrap();
        let mut jar = CookieJar::new();
        jar.store(
            Cookie::parse(
                "sid=abc; Domain=example.com; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=60",
                &origin,
                now(),
            )
            .unwrap(),
        );
        jar.store(Cookie::parse("host=1", &origin, now()).unwrap());
        let exported = jar.export();
        let json = serde_json::to_value(&exported).unwrap();
        assert_eq!(json[0]["domain"], ".example.com");
        assert_eq!(json[0]["httpOnly"], true);
        assert_eq!(json[0]["sameSite"], "Strict");
        assert_eq!(json[0]["expires"], 1_700_000_060.0);
        assert_eq!(
            json[1]["domain"], "shop.example.com",
            "host-only has no dot"
        );
        assert!(json[1].get("expires").is_none(), "session cookie");

        let mut other = CookieJar::new();
        let imported: Vec<BrowserCookie> = serde_json::from_value(json).unwrap();
        assert_eq!(other.import(imported), 2);
        assert_eq!(
            other.header_for(&Url::parse("https://api.example.com/").unwrap(), now()),
            Some("sid=abc".into()),
            "domain cookie applies to subdomains after import"
        );
        assert_eq!(
            other.import([BrowserCookie {
                name: String::new(),
                value: "x".into(),
                domain: "a.test".into(),
                path: "/".into(),
                secure: false,
                http_only: false,
                same_site: None,
                expires: None,
            }]),
            0,
            "nameless cookies are dropped"
        );
    }
}

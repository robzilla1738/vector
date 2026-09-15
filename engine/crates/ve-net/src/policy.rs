//! Per-context request policy (architecture §8 / §10).
//!
//! The policy is checked before any bytes leave the process: loopback and
//! link-local destinations are refused by default (the runtime's own control
//! ports live there), an optional host allowlist restricts everything else,
//! and `file:` access is opt-in for fixtures and benchmarks.

use serde::{Deserialize, Serialize};
use url::{Host, Url};

use crate::NetError;

/// What a [`crate::NetworkContext`] is allowed to fetch.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct NetworkPolicy {
    /// Refuse `localhost`, `*.localhost`, `127.0.0.0/8`, `::1`, `0.0.0.0`,
    /// `169.254.0.0/16` and `fe80::/10` unless the host is on the allowlist.
    pub block_loopback: bool,
    /// Host patterns that are always allowed (and, when non-empty, the *only*
    /// hosts allowed for `http(s)`). A pattern is an exact host, a
    /// `*.example.com` wildcard, or `host:port`.
    pub allowlist: Vec<String>,
    /// Allow `file:` URLs (fixtures, benchmarks). Off by default.
    pub allow_file: bool,
    /// Refuse plain `http:` (mixed-content style policy for locked-down
    /// contexts). Off by default.
    pub https_only: bool,
}

impl Default for NetworkPolicy {
    fn default() -> Self {
        Self {
            block_loopback: true,
            allowlist: Vec::new(),
            allow_file: false,
            https_only: false,
        }
    }
}

/// Whether `host` names a loopback / link-local / unspecified address.
#[must_use]
pub fn is_loopback_host(host: &Host<&str>) -> bool {
    match host {
        Host::Domain(d) => {
            let d = d.to_ascii_lowercase();
            d == "localhost" || d.ends_with(".localhost") || d == "0.0.0.0"
        }
        Host::Ipv4(ip) => ip.is_loopback() || ip.is_unspecified() || ip.is_link_local(),
        Host::Ipv6(ip) => {
            ip.is_loopback()
                || ip.is_unspecified()
                || (ip.segments()[0] & 0xffc0) == 0xfe80
                || ip
                    .to_ipv4_mapped()
                    .is_some_and(|v4| v4.is_loopback() || v4.is_unspecified() || v4.is_link_local())
        }
    }
}

fn pattern_matches(pattern: &str, host: &str, port: Option<u16>) -> bool {
    let pattern = pattern.to_ascii_lowercase();
    let (pattern_host, pattern_port) = match pattern.rsplit_once(':') {
        Some((h, p)) if !h.contains(':') && p.parse::<u16>().is_ok() => {
            (h.to_owned(), p.parse::<u16>().ok())
        }
        _ => (pattern.clone(), None),
    };
    if pattern_port.is_some() && pattern_port != port {
        return false;
    }
    if let Some(suffix) = pattern_host.strip_prefix("*.") {
        host == suffix || host.ends_with(&format!(".{suffix}"))
    } else {
        host == pattern_host
    }
}

impl NetworkPolicy {
    /// A permissive policy for tests and local fixtures: loopback allowed,
    /// `file:` allowed, no allowlist.
    #[must_use]
    pub fn permissive() -> Self {
        Self {
            block_loopback: false,
            allowlist: Vec::new(),
            allow_file: true,
            https_only: false,
        }
    }

    /// Whether `host` (with optional port) is on the allowlist.
    #[must_use]
    pub fn is_allowlisted(&self, host: &str, port: Option<u16>) -> bool {
        let host = host.to_ascii_lowercase();
        self.allowlist
            .iter()
            .any(|p| pattern_matches(p, &host, port))
    }

    /// Checks whether `url` may be fetched.
    pub fn check(&self, url: &Url) -> Result<(), NetError> {
        match url.scheme() {
            "file" => {
                if self.allow_file {
                    Ok(())
                } else {
                    Err(NetError::Blocked("file: URLs are disabled".into()))
                }
            }
            "http" | "https" => {
                if self.https_only && url.scheme() == "http" {
                    return Err(NetError::Blocked(format!("plain http refused: {url}")));
                }
                let Some(host) = url.host() else {
                    return Err(NetError::Blocked(format!("url without host: {url}")));
                };
                let host_text = host.to_string();
                let port = url.port_or_known_default();
                let allowlisted = self.is_allowlisted(&host_text, port)
                    || (url.port().is_none() && self.is_allowlisted(&host_text, None));
                if allowlisted {
                    return Ok(());
                }
                if self.block_loopback && is_loopback_host(&host) {
                    return Err(NetError::Blocked(format!(
                        "loopback destination {host_text} (set blockLoopback=false or allowlist it)"
                    )));
                }
                if !self.allowlist.is_empty() {
                    return Err(NetError::Blocked(format!(
                        "{host_text} is not on the allowlist"
                    )));
                }
                Ok(())
            }
            _ => Ok(()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn check(policy: &NetworkPolicy, url: &str) -> bool {
        policy.check(&Url::parse(url).unwrap()).is_ok()
    }

    #[test]
    fn default_policy_blocks_loopback_and_file_only() {
        let p = NetworkPolicy::default();
        assert!(check(&p, "https://example.com/"));
        assert!(check(&p, "http://example.com/"));
        assert!(!check(&p, "http://localhost:4810/"));
        assert!(!check(&p, "http://app.localhost/"));
        assert!(!check(&p, "http://127.0.0.1/"));
        assert!(!check(&p, "http://127.8.8.8/"));
        assert!(!check(&p, "http://[::1]/"));
        assert!(!check(&p, "http://0.0.0.0/"));
        assert!(!check(&p, "http://169.254.169.254/latest/meta-data"));
        assert!(!check(&p, "http://[fe80::1]/"));
        assert!(!check(&p, "file:///etc/hosts"));
        assert!(check(&p, "data:text/html,x"));
        assert!(check(&p, "about:blank"));
    }

    #[test]
    fn allowlist_and_wildcards() {
        let p = NetworkPolicy {
            allowlist: vec!["localhost:4810".into(), "*.example.com".into()],
            ..NetworkPolicy::default()
        };
        assert!(
            check(&p, "http://localhost:4810/records"),
            "allowlisted loopback"
        );
        assert!(!check(&p, "http://localhost:4811/"), "port must match");
        assert!(check(&p, "https://api.example.com/"));
        assert!(
            check(&p, "https://example.com/"),
            "wildcard covers the bare domain"
        );
        assert!(!check(&p, "https://evil.test/"), "allowlist is exclusive");
        let permissive = NetworkPolicy::permissive();
        assert!(check(&permissive, "http://127.0.0.1:9/"));
        assert!(check(&permissive, "file:///tmp/x.html"));
        let https_only = NetworkPolicy {
            https_only: true,
            ..NetworkPolicy::default()
        };
        assert!(!check(&https_only, "http://example.com/"));
        assert!(check(&https_only, "https://example.com/"));
    }

    #[test]
    fn policy_json_uses_camel_case_and_defaults() {
        let parsed: NetworkPolicy =
            serde_json::from_str(r#"{"blockLoopback": false, "allowFile": true}"#).unwrap();
        assert!(!parsed.block_loopback && parsed.allow_file && parsed.allowlist.is_empty());
        let json = serde_json::to_value(NetworkPolicy::default()).unwrap();
        assert_eq!(json["blockLoopback"], true);
        assert_eq!(json["allowFile"], false);
    }
}

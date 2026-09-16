//! Per-context request policy (architecture §8 / §10).
//!
//! The privileged broker applies this before any bytes leave the process:
//! scheme, destination, private/loopback addresses, an optional host
//! allowlist, `file:` opt-in, and a separate agent-egress grant. Hostname
//! checks are not enough — resolved addresses are revalidated to catch DNS
//! rebinding.

use std::net::IpAddr;

use serde::{Deserialize, Serialize};
use url::{Host, Url};

use crate::{Initiator, NetError, Request};

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
    /// Allow RFC1918 / ULA / CGNAT destinations that are not loopback.
    /// Off by default; local fixtures must be allowlisted instead.
    pub allow_private_network: bool,
    /// When true, [`Initiator::Agent`] may use the same destinations as the page.
    /// When false, agent-initiated `http(s)` needs [`Self::agent_allowlist`]
    /// or the document allowlist.
    pub allow_agent_egress: bool,
    /// Extra hosts the agent may contact when [`Self::allow_agent_egress`] is false.
    pub agent_allowlist: Vec<String>,
}

impl Default for NetworkPolicy {
    fn default() -> Self {
        Self {
            block_loopback: true,
            allowlist: Vec::new(),
            allow_file: false,
            https_only: false,
            allow_private_network: false,
            allow_agent_egress: false,
            agent_allowlist: Vec::new(),
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

/// RFC1918, unique-local, CGNAT, loopback, link-local, unspecified.
#[must_use]
pub fn is_private_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v) => {
            v.is_private()
                || v.is_loopback()
                || v.is_link_local()
                || v.is_unspecified()
                || (v.octets()[0] == 100 && v.octets()[1] & 0xc0 == 64)
        }
        IpAddr::V6(v) => {
            v.is_loopback()
                || v.is_unspecified()
                || v.is_unique_local()
                || (v.segments()[0] & 0xffc0) == 0xfe80
                || v.to_ipv4_mapped()
                    .is_some_and(|v4| is_private_ip(IpAddr::V4(v4)))
        }
    }
}

/// Strip URL userinfo so credentials never ride the wire.
pub fn strip_userinfo(url: &mut Url) {
    let _ = url.set_username("");
    let _ = url.set_password(None);
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
    /// `file:` allowed, no allowlist. Callers must opt in explicitly.
    #[must_use]
    pub fn permissive() -> Self {
        Self {
            block_loopback: false,
            allowlist: Vec::new(),
            allow_file: true,
            https_only: false,
            allow_private_network: true,
            allow_agent_egress: true,
            agent_allowlist: Vec::new(),
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

    /// Whether `host` is on the agent egress list.
    #[must_use]
    pub fn is_agent_allowlisted(&self, host: &str, port: Option<u16>) -> bool {
        let host = host.to_ascii_lowercase();
        self.agent_allowlist
            .iter()
            .any(|p| pattern_matches(p, &host, port))
    }

    /// Checks whether `url` may be fetched as a document/script request.
    pub fn check(&self, url: &Url) -> Result<(), NetError> {
        match url.scheme() {
            "data" | "about" | "blob" => Ok(()),
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
                if !self.allow_private_network {
                    if let Host::Ipv4(ip) = host
                        && is_private_ip(IpAddr::V4(ip))
                        && !is_loopback_host(&host)
                    {
                        return Err(NetError::Blocked(format!(
                            "private-network destination {host_text} requires allowPrivateNetwork or an allowlist"
                        )));
                    }
                    if let Host::Ipv6(ip) = host
                        && is_private_ip(IpAddr::V6(ip))
                        && !is_loopback_host(&host)
                    {
                        return Err(NetError::Blocked(format!(
                            "private-network destination {host_text} requires allowPrivateNetwork or an allowlist"
                        )));
                    }
                }
                if !self.allowlist.is_empty() {
                    return Err(NetError::Blocked(format!(
                        "{host_text} is not on the allowlist"
                    )));
                }
                Ok(())
            }
            other => Err(NetError::UnsupportedScheme(other.to_owned())),
        }
    }

    /// Policy plus initiator: agent requests need an extra grant.
    pub fn check_request(&self, request: &Request) -> Result<(), NetError> {
        self.check(&request.url)?;
        if request.initiator != Initiator::Agent {
            return Ok(());
        }
        match request.url.scheme() {
            "http" | "https" => {}
            _ => return Ok(()),
        }
        if self.allow_agent_egress {
            return Ok(());
        }
        let Some(host) = request.url.host() else {
            return Err(NetError::Blocked("agent egress url without host".into()));
        };
        let host_text = host.to_string();
        let port = request.url.port_or_known_default();
        if self.is_allowlisted(&host_text, port)
            || self.is_agent_allowlisted(&host_text, port)
            || (request.url.port().is_none() && self.is_agent_allowlisted(&host_text, None))
        {
            return Ok(());
        }
        Err(NetError::Blocked(format!(
            "agent egress to {host_text} denied (allowAgentEgress or agentAllowlist)"
        )))
    }

    /// Revalidate a resolved address (DNS rebinding). Allowlisted hostnames
    /// may resolve to loopback (fixture servers).
    pub fn check_resolved(&self, url: &Url, addr: IpAddr) -> Result<(), NetError> {
        if let Some(host) = url.host() {
            let host_text = host.to_string();
            let port = url.port_or_known_default();
            if self.is_allowlisted(&host_text, port)
                || (url.port().is_none() && self.is_allowlisted(&host_text, None))
            {
                return Ok(());
            }
        }
        if self.block_loopback && (addr.is_loopback() || addr.is_unspecified()) {
            return Err(NetError::Blocked(format!(
                "resolved to loopback {addr} (DNS rebinding)"
            )));
        }
        if !self.allow_private_network && is_private_ip(addr) {
            return Err(NetError::Blocked(format!(
                "resolved to private {addr} (DNS rebinding / private-network)"
            )));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::{Ipv4Addr, Ipv6Addr};

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
        assert!(!check(&p, "javascript:alert(1)"));
        assert!(!check(&p, "ftp://example.com/"));
        assert!(!check(&p, "http://10.0.0.1/"));
        assert!(!check(&p, "http://192.168.1.1/"));
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
        assert!(!parsed.allow_private_network && !parsed.allow_agent_egress);
        let json = serde_json::to_value(NetworkPolicy::default()).unwrap();
        assert_eq!(json["blockLoopback"], true);
        assert_eq!(json["allowFile"], false);
        assert_eq!(json["allowPrivateNetwork"], false);
    }

    #[test]
    fn dns_rebinding_resolved_addresses() {
        let p = NetworkPolicy::default();
        let public = Url::parse("https://evil.test/").unwrap();
        assert!(
            p.check_resolved(&public, IpAddr::V4(Ipv4Addr::new(93, 184, 216, 34)))
                .is_ok()
        );
        assert!(
            p.check_resolved(&public, IpAddr::V4(Ipv4Addr::LOCALHOST))
                .is_err()
        );
        assert!(
            p.check_resolved(&public, IpAddr::V4(Ipv4Addr::new(169, 254, 169, 254)))
                .is_err()
        );
        assert!(
            p.check_resolved(&public, IpAddr::V6(Ipv6Addr::LOCALHOST))
                .is_err()
        );
        let fixture = Url::parse("http://127.0.0.1:4810/").unwrap();
        let listed = NetworkPolicy {
            allowlist: vec!["127.0.0.1:4810".into()],
            ..NetworkPolicy::default()
        };
        assert!(
            listed
                .check_resolved(&fixture, IpAddr::V4(Ipv4Addr::LOCALHOST))
                .is_ok()
        );
    }

    #[test]
    fn agent_egress_is_denied_by_default() {
        let p = NetworkPolicy::default();
        let mut req = Request::get("https://example.com/").unwrap();
        req.initiator = Initiator::Agent;
        assert!(p.check_request(&req).is_err());
        req.initiator = Initiator::Script;
        assert!(p.check_request(&req).is_ok());
        let granted = NetworkPolicy {
            allow_agent_egress: true,
            ..NetworkPolicy::default()
        };
        req.initiator = Initiator::Agent;
        assert!(granted.check_request(&req).is_ok());
        let listed = NetworkPolicy {
            agent_allowlist: vec!["example.com".into()],
            ..NetworkPolicy::default()
        };
        assert!(listed.check_request(&req).is_ok());
    }

    #[test]
    fn strip_userinfo_removes_credentials() {
        let mut url = Url::parse("https://user:secret@example.com/path").unwrap();
        strip_userinfo(&mut url);
        assert!(url.username().is_empty());
        assert!(url.password().is_none());
        assert_eq!(url.as_str(), "https://example.com/path");
    }
}

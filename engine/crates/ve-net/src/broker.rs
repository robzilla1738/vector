//! Parent-owned network broker (plan A21 / VEC-003).
//!
//! Browsing contexts never hold a socket. They submit [`FetchJob`]s to a
//! [`NetworkBroker`] that owns the [`Transport`] and the authoritative
//! [`crate::NetworkPolicy`]. The child's claimed context id is ignored; the
//! parent stamps the handshake identity.

use std::net::ToSocketAddrs;
use std::rc::Rc;

use crate::policy::strip_userinfo;
use crate::transport::Transport;
use crate::{NetError, NetworkPolicy, Request, Response};

/// A fetch submitted by a browsing context.
#[derive(Clone, Debug)]
pub struct FetchJob {
    /// Context id stamped by the privileged parent (never from the child).
    pub context: u32,
    /// The request.
    pub request: Request,
}

/// Owns the process-wide transport and policy. Contexts call [`Self::fetch`]
/// or use the broker itself as a [`Transport`].
#[derive(Clone)]
pub struct NetworkBroker {
    inner: Rc<dyn Transport>,
    policy: NetworkPolicy,
    /// Trusted context id. `0` means "any" (in-process tests).
    context_id: u32,
}

impl std::fmt::Debug for NetworkBroker {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("NetworkBroker")
            .field("transport", &self.inner.name())
            .field("context_id", &self.context_id)
            .finish_non_exhaustive()
    }
}

impl NetworkBroker {
    /// Wraps `transport` as the sole wire owner with a default (strict) policy.
    #[must_use]
    pub fn new(transport: Box<dyn Transport>) -> Self {
        Self::with_policy(transport, NetworkPolicy::default(), 0)
    }

    /// Privileged broker bound to `context_id` and `policy`.
    #[must_use]
    pub fn with_policy(
        transport: Box<dyn Transport>,
        policy: NetworkPolicy,
        context_id: u32,
    ) -> Self {
        Self {
            inner: Rc::from(transport),
            policy,
            context_id,
        }
    }

    /// Performs `job.request` after policy, credential stripping, and resolved-IP checks.
    pub fn fetch(&self, mut job: FetchJob) -> Result<Response, NetError> {
        if self.context_id != 0 && job.context != self.context_id {
            return Err(NetError::Blocked(format!(
                "forged context {} (broker owns {})",
                job.context, self.context_id
            )));
        }
        strip_userinfo(&mut job.request.url);
        self.policy.check_request(&job.request)?;
        self.check_resolved(&job.request)?;
        self.inner.send(&job.request)
    }

    fn check_resolved(&self, request: &Request) -> Result<(), NetError> {
        match request.url.scheme() {
            "http" | "https" => {}
            _ => return Ok(()),
        }
        let Some(host) = request.url.host_str() else {
            return Ok(());
        };
        let port = request.url.port_or_known_default().unwrap_or(80);
        let addrs = match (host, port).to_socket_addrs() {
            Ok(a) => a,
            Err(_) => return Ok(()),
        };
        for addr in addrs {
            self.policy.check_resolved(&request.url, addr.ip())?;
        }
        Ok(())
    }
}

impl Transport for NetworkBroker {
    fn send(&self, request: &Request) -> Result<Response, NetError> {
        self.fetch(FetchJob {
            context: self.context_id,
            request: request.clone(),
        })
    }

    fn send_many(&self, requests: &[Request]) -> Vec<Result<Response, NetError>> {
        requests.iter().map(|r| self.send(r)).collect()
    }

    fn name(&self) -> &'static str {
        "broker"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::transport::NullTransport;
    use crate::{Initiator, Request};

    #[test]
    fn broker_runs_jobs_without_leaking_the_transport() {
        let broker = NetworkBroker::new(Box::new(NullTransport));
        let job = FetchJob {
            context: 1,
            request: Request::get("https://example.test/").unwrap(),
        };
        assert!(broker.fetch(job).is_err());
        let clone = broker.clone();
        assert_eq!(clone.name(), "broker");
    }

    #[test]
    fn forged_context_is_rejected() {
        let broker =
            NetworkBroker::with_policy(Box::new(NullTransport), NetworkPolicy::permissive(), 7);
        let job = FetchJob {
            context: 99,
            request: Request::get("https://example.test/").unwrap(),
        };
        let err = broker.fetch(job).unwrap_err().to_string();
        assert!(err.contains("forged context"), "{err}");
    }

    #[test]
    fn page_cannot_skip_policy_by_declaring_agent() {
        let broker =
            NetworkBroker::with_policy(Box::new(NullTransport), NetworkPolicy::default(), 1);
        let mut request = Request::get("https://example.test/").unwrap();
        request.initiator = Initiator::Agent;
        let err = broker
            .fetch(FetchJob {
                context: 1,
                request,
            })
            .unwrap_err()
            .to_string();
        assert!(
            err.contains("agent egress") || err.contains("blocked"),
            "{err}"
        );
    }

    #[test]
    fn denied_scheme_never_hits_the_wire() {
        let broker =
            NetworkBroker::with_policy(Box::new(NullTransport), NetworkPolicy::default(), 1);
        let request = Request::get("javascript:alert(1)").unwrap_or_else(|_| {
            let mut r = Request::get("https://example.test/").unwrap();
            r.url = url::Url::parse("javascript:alert(1)").unwrap();
            r
        });
        assert!(matches!(
            broker.fetch(FetchJob {
                context: 1,
                request
            }),
            Err(NetError::UnsupportedScheme(_) | NetError::Blocked(_) | NetError::InvalidUrl(_))
        ));
    }

    #[test]
    fn credentials_are_stripped_before_send() {
        let seen = std::rc::Rc::new(std::cell::RefCell::new(String::new()));
        let seen2 = seen.clone();
        let t = crate::FnTransport::new(move |req: &Request| {
            *seen2.borrow_mut() = req.url.to_string();
            Err(NetError::Transport("stop".into()))
        });
        let broker = NetworkBroker::with_policy(Box::new(t), NetworkPolicy::permissive(), 1);
        let request = Request::get("https://user:pass@example.test/x").unwrap();
        let _ = broker.fetch(FetchJob {
            context: 1,
            request,
        });
        assert_eq!(*seen.borrow(), "https://example.test/x");
    }
}

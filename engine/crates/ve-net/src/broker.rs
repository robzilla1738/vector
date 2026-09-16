//! Parent-owned network broker (plan A21).
//!
//! Browsing contexts never hold a socket. They submit [`FetchJob`]s to a
//! [`NetworkBroker`] that owns the [`Transport`]. Two contexts sharing one
//! broker still keep separate cookie jars (those live on [`crate::NetworkContext`]);
//! the broker only multiplexes the wire. The engine holds one broker and
//! clones it into every context.

use std::rc::Rc;

use crate::transport::Transport;
use crate::{NetError, Request, Response};

/// A fetch submitted by a browsing context.
#[derive(Clone, Debug)]
pub struct FetchJob {
    /// Context id (attribution / isolation accounting).
    pub context: u32,
    /// The request.
    pub request: Request,
}

/// Owns the process-wide transport. Contexts call [`Self::fetch`] or use
/// the broker itself as a [`Transport`].
#[derive(Clone)]
pub struct NetworkBroker {
    inner: Rc<dyn Transport>,
}

impl std::fmt::Debug for NetworkBroker {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("NetworkBroker")
            .field("transport", &self.inner.name())
            .finish_non_exhaustive()
    }
}

impl NetworkBroker {
    /// Wraps `transport` as the sole wire owner.
    #[must_use]
    pub fn new(transport: Box<dyn Transport>) -> Self {
        Self {
            inner: Rc::from(transport),
        }
    }

    /// Performs `job.request` on the shared transport.
    pub fn fetch(&self, job: FetchJob) -> Result<Response, NetError> {
        let _ = job.context;
        self.inner.send(&job.request)
    }
}

impl Transport for NetworkBroker {
    fn send(&self, request: &Request) -> Result<Response, NetError> {
        self.inner.send(request)
    }

    fn send_many(&self, requests: &[Request]) -> Vec<Result<Response, NetError>> {
        self.inner.send_many(requests)
    }

    fn name(&self) -> &'static str {
        "broker"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Request;
    use crate::transport::NullTransport;

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
}

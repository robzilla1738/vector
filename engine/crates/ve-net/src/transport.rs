//! The [`Transport`] trait and the built-in non-network implementations.

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use http::StatusCode;
use http::header::{HeaderMap, HeaderName, HeaderValue};

use crate::{NetError, Request, Response};

/// Sends a single request and returns the complete response. Redirects,
/// cookies and caching are handled by [`crate::NetworkContext`], not here.
pub trait Transport {
    /// Performs the exchange.
    fn send(&self, request: &Request) -> Result<Response, NetError>;

    /// Human readable backend name.
    fn name(&self) -> &'static str;
}

/// A transport that refuses every network request.
#[derive(Debug, Default, Clone, Copy)]
pub struct NullTransport;

impl Transport for NullTransport {
    fn send(&self, _request: &Request) -> Result<Response, NetError> {
        Err(NetError::NoTransport)
    }

    fn name(&self) -> &'static str {
        "null"
    }
}

/// A dynamic mock route: computes the response from the request.
pub type DynRoute = Box<dyn Fn(&Request) -> Response>;

/// Canned responses keyed by URL, with a log of every request seen. Intended
/// for tests and offline fixtures. Exact-URL routes are tried first, then
/// dynamic prefix routes in registration order.
#[derive(Default)]
pub struct MockTransport {
    routes: RefCell<HashMap<String, Response>>,
    dynamic: RefCell<Vec<(String, DynRoute)>>,
    log: Rc<RefCell<Vec<Request>>>,
}

impl std::fmt::Debug for MockTransport {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("MockTransport")
            .field("routes", &self.routes.borrow().len())
            .field("dynamic", &self.dynamic.borrow().len())
            .finish_non_exhaustive()
    }
}

impl MockTransport {
    /// Creates an empty mock.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Registers a response for `url`.
    pub fn respond(&self, url: &str, status: u16, headers: &[(&str, &str)], body: &str) {
        let mut map = HeaderMap::new();
        for (k, v) in headers {
            if let (Ok(name), Ok(value)) = (HeaderName::try_from(*k), HeaderValue::from_str(v)) {
                map.append(name, value);
            }
        }
        let parsed = url::Url::parse(url).expect("mock url is absolute");
        let response = Response::new(
            parsed.clone(),
            StatusCode::from_u16(status).expect("valid status"),
            map,
            body.to_owned(),
        );
        self.routes
            .borrow_mut()
            .insert(parsed.to_string(), response);
    }

    /// Registers a dynamic route for every URL starting with `url_prefix`
    /// (compared on the URL without its query string, so form `GET`
    /// submissions match). The closure builds the response from the request.
    pub fn respond_with(&self, url_prefix: &str, route: impl Fn(&Request) -> Response + 'static) {
        self.dynamic
            .borrow_mut()
            .push((url_prefix.to_owned(), Box::new(route)));
    }

    /// Builds a plain response for use inside dynamic routes.
    #[must_use]
    pub fn response(
        request: &Request,
        status: u16,
        headers: &[(&str, &str)],
        body: &str,
    ) -> Response {
        let mut map = HeaderMap::new();
        for (k, v) in headers {
            if let (Ok(name), Ok(value)) = (HeaderName::try_from(*k), HeaderValue::from_str(v)) {
                map.append(name, value);
            }
        }
        Response::new(
            request.url.clone(),
            StatusCode::from_u16(status).unwrap_or(StatusCode::OK),
            map,
            body.to_owned(),
        )
    }

    /// Shared handle to the request log.
    #[must_use]
    pub fn log(&self) -> Rc<RefCell<Vec<Request>>> {
        self.log.clone()
    }
}

impl Transport for MockTransport {
    fn send(&self, request: &Request) -> Result<Response, NetError> {
        self.log.borrow_mut().push(request.clone());
        if let Some(mut response) = self.routes.borrow().get(&request.url.to_string()).cloned() {
            response.url = request.url.clone();
            return Ok(response);
        }
        let mut without_query = request.url.clone();
        without_query.set_query(None);
        without_query.set_fragment(None);
        let without_query = without_query.to_string();
        let dynamic = self.dynamic.borrow();
        if let Some((_, route)) = dynamic
            .iter()
            .find(|(prefix, _)| without_query.starts_with(prefix.as_str()))
        {
            return Ok(route(request));
        }
        Err(NetError::Transport(format!(
            "no mock route for {}",
            request.url
        )))
    }

    fn name(&self) -> &'static str {
        "mock"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mock_serves_routes_and_logs_requests() {
        let mock = MockTransport::new();
        mock.respond("https://a.test/x", 201, &[("X-Test", "1")], "body");
        let req = Request::get("https://a.test/x")
            .unwrap()
            .header("Accept", "text/plain");
        let res = mock.send(&req).unwrap();
        assert_eq!((res.status.as_u16(), res.text().as_str()), (201, "body"));
        assert_eq!(res.headers.get("x-test").unwrap(), "1");
        assert!(matches!(
            mock.send(&Request::get("https://a.test/missing").unwrap()),
            Err(NetError::Transport(_))
        ));
        assert_eq!(mock.log().borrow().len(), 2);
        assert!(matches!(
            NullTransport.send(&req),
            Err(NetError::NoTransport)
        ));

        mock.respond_with("https://a.test/echo", |r| {
            MockTransport::response(r, 200, &[], r.url.query().unwrap_or(""))
        });
        let echoed = mock
            .send(&Request::get("https://a.test/echo?q=boots&n=2").unwrap())
            .unwrap();
        assert_eq!(
            echoed.text(),
            "q=boots&n=2",
            "dynamic route ignores the query when matching"
        );
    }
}

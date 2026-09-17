//! CORS for script-initiated fetch (VEC-009).
//!
//! Navigation is not gated. Same-origin script fetch is allowed. Cross-origin
//! script fetch needs `Access-Control-Allow-Origin` `*` or the request origin.

use url::Url;

use crate::{Initiator, NetError, Request, Response};

/// True when a script-initiated cross-origin request is not a CORS-simple request.
#[must_use]
pub fn needs_preflight(request: &Request) -> bool {
    if request.initiator != Initiator::Script {
        return false;
    }
    let Some(origin) = script_origin(request) else {
        return false;
    };
    if same_origin(&origin, &request.url) {
        return false;
    }
    !is_simple_cors_request(request)
}

fn is_simple_cors_request(request: &Request) -> bool {
    if !matches!(request.method.as_str(), "GET" | "HEAD" | "POST") {
        return false;
    }
    request.headers.keys().all(|name| {
        matches!(
            name.as_str(),
            "accept"
                | "accept-language"
                | "content-language"
                | "content-type"
                | "origin"
                | "referer"
                | "user-agent"
        )
    })
}

/// Validates an OPTIONS preflight response for `request`.
pub fn check_preflight(request: &Request, response: &Response) -> Result<(), NetError> {
    check_cors(request, response)?;
    if is_simple_cors_request(request) {
        return Ok(());
    }
    let method = request.method.as_str();
    let allowed = response
        .headers
        .get(http::header::ACCESS_CONTROL_ALLOW_METHODS)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if allowed == "*"
        || allowed
            .split(',')
            .any(|m| m.trim().eq_ignore_ascii_case(method))
    {
        return Ok(());
    }
    Err(NetError::Blocked("cors-preflight".into()))
}

/// Refuses a cross-origin [`Initiator::Script`] response that is not CORS-allowed.
pub fn check_cors(request: &Request, response: &Response) -> Result<(), NetError> {
    if request.initiator != Initiator::Script {
        return Ok(());
    }
    let Some(origin) = script_origin(request) else {
        return Ok(());
    };
    if same_origin(&origin, &request.url) {
        return Ok(());
    }
    let allowed = response
        .headers
        .get(http::header::ACCESS_CONTROL_ALLOW_ORIGIN)
        .and_then(|v| v.to_str().ok())
        .map(str::trim);
    match allowed {
        Some("*") => Ok(()),
        Some(value) if value == origin_serialized(&origin) => Ok(()),
        _ => Err(NetError::Blocked("cors".into())),
    }
}

fn script_origin(request: &Request) -> Option<Url> {
    if let Some(origin) = &request.origin {
        return Some(origin.clone());
    }
    request
        .headers
        .get(http::header::ORIGIN)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| Url::parse(s).ok())
}

fn same_origin(origin: &Url, url: &Url) -> bool {
    match (origin.origin(), url.origin()) {
        (url::Origin::Tuple(s1, h1, p1), url::Origin::Tuple(s2, h2, p2)) => {
            s1 == s2 && h1 == h2 && p1 == p2
        }
        _ => false,
    }
}

fn origin_serialized(url: &Url) -> String {
    match url.origin() {
        url::Origin::Tuple(..) => url.origin().ascii_serialization(),
        url::Origin::Opaque(_) => "null".into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ContextId, Initiator, Request};
    use crate::{MockTransport, NetworkContext};
    use http::StatusCode;
    use http::header::{HeaderMap, HeaderValue};

    fn response(url: &str, acao: Option<&str>) -> Response {
        let mut headers = HeaderMap::new();
        if let Some(v) = acao
            && let Ok(value) = HeaderValue::from_str(v)
        {
            headers.insert(http::header::ACCESS_CONTROL_ALLOW_ORIGIN, value);
        }
        Response::new(Url::parse(url).unwrap(), StatusCode::OK, headers, "ok")
    }

    #[test]
    fn navigation_is_not_cors_gated() {
        let req = Request::get("https://b.test/x").unwrap();
        assert!(check_cors(&req, &response("https://b.test/x", None)).is_ok());
    }

    #[test]
    fn same_origin_script_fetch_is_allowed() {
        let req = Request::get("https://a.test/x")
            .unwrap()
            .with_initiator(Initiator::Script)
            .with_origin(Url::parse("https://a.test/").unwrap());
        assert!(check_cors(&req, &response("https://a.test/x", None)).is_ok());
    }

    #[test]
    fn cross_origin_script_fetch_without_acao_is_blocked() {
        let req = Request::get("https://b.test/x")
            .unwrap()
            .with_initiator(Initiator::Script)
            .with_origin(Url::parse("https://a.test/").unwrap());
        assert!(matches!(
            check_cors(&req, &response("https://b.test/x", None)),
            Err(NetError::Blocked(s)) if s == "cors"
        ));
    }

    #[test]
    fn cross_origin_script_fetch_with_matching_acao_is_allowed() {
        let req = Request::get("https://b.test/x")
            .unwrap()
            .with_initiator(Initiator::Script)
            .header("origin", "https://a.test");
        assert!(check_cors(&req, &response("https://b.test/x", Some("https://a.test"))).is_ok());
        assert!(check_cors(&req, &response("https://b.test/x", Some("*"))).is_ok());
    }

    #[test]
    fn network_context_applies_cors_on_script_fetch() {
        let mock = MockTransport::new();
        mock.respond("https://b.test/x", 200, &[], "ok");
        mock.respond(
            "https://b.test/y",
            200,
            &[("Access-Control-Allow-Origin", "https://a.test")],
            "ok",
        );
        let mut ctx = NetworkContext::new(ContextId(1), Box::new(mock));
        let denied = Request::get("https://b.test/x")
            .unwrap()
            .with_initiator(Initiator::Script)
            .with_origin(Url::parse("https://a.test/").unwrap());
        assert!(matches!(
            ctx.fetch(denied),
            Err(NetError::Blocked(s)) if s == "cors"
        ));
        let allowed = Request::get("https://b.test/y")
            .unwrap()
            .with_initiator(Initiator::Script)
            .with_origin(Url::parse("https://a.test/").unwrap());
        assert_eq!(ctx.fetch(allowed).unwrap().text(), "ok");
        let nav = Request::get("https://b.test/x").unwrap();
        assert_eq!(ctx.fetch(nav).unwrap().text(), "ok");
    }

    #[test]
    fn put_needs_preflight_and_acam() {
        let mut put = Request::get("https://b.test/x").unwrap();
        put.method = http::Method::PUT;
        put = put
            .with_initiator(Initiator::Script)
            .with_origin(Url::parse("https://a.test/").unwrap());
        assert!(needs_preflight(&put));
        let mut headers = HeaderMap::new();
        headers.insert(
            http::header::ACCESS_CONTROL_ALLOW_ORIGIN,
            HeaderValue::from_static("https://a.test"),
        );
        headers.insert(
            http::header::ACCESS_CONTROL_ALLOW_METHODS,
            HeaderValue::from_static("PUT"),
        );
        let ok = Response::new(
            Url::parse("https://b.test/x").unwrap(),
            StatusCode::OK,
            headers,
            "",
        );
        assert!(check_preflight(&put, &ok).is_ok());
        let denied = response("https://b.test/x", Some("https://a.test"));
        assert!(matches!(
            check_preflight(&put, &denied),
            Err(NetError::Blocked(s)) if s == "cors-preflight"
        ));
    }
}

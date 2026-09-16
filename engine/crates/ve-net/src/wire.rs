//! JSON wire types for the parent network broker (plan A21).
//!
//! Context processes cannot open sockets. They serialise a [`Request`] to
//! [`WireRequest`], the parent runs it on [`crate::NetworkBroker`], and the
//! [`WireResponse`] comes back over the control pipe.

use bytes::Bytes;
use http::header::{HeaderMap, HeaderName, HeaderValue};
use http::{Method, StatusCode};
use serde::{Deserialize, Serialize};
use url::Url;

use crate::{Initiator, NetError, Request, Response, base64_decode, base64_encode};

/// A [`Request`] that can cross a process boundary.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WireRequest {
    /// HTTP method.
    pub method: String,
    /// Absolute URL.
    pub url: String,
    /// Header pairs in send order.
    pub headers: Vec<(String, String)>,
    /// Body, standard base64.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body_b64: Option<String>,
    /// Attributed page.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub page: Option<u64>,
    /// Initiator.
    pub initiator: Initiator,
    /// Background flag.
    pub background: bool,
}

impl From<&Request> for WireRequest {
    fn from(request: &Request) -> Self {
        Self {
            method: request.method.to_string(),
            url: request.url.to_string(),
            headers: request
                .headers
                .iter()
                .filter_map(|(k, v)| Some((k.to_string(), v.to_str().ok()?.to_owned())))
                .collect(),
            body_b64: request.body.as_ref().map(|b| base64_encode(b)),
            page: request.page,
            initiator: request.initiator,
            background: request.background,
        }
    }
}

impl TryFrom<WireRequest> for Request {
    type Error = NetError;

    fn try_from(wire: WireRequest) -> Result<Self, Self::Error> {
        let method: Method = wire
            .method
            .parse()
            .map_err(|e| NetError::Http(format!("method: {e}")))?;
        let mut headers = HeaderMap::new();
        for (k, v) in wire.headers {
            if let (Ok(name), Ok(value)) = (HeaderName::try_from(k), HeaderValue::from_str(&v)) {
                headers.append(name, value);
            }
        }
        let body = match wire.body_b64 {
            Some(b64) => Some(Bytes::from(
                base64_decode(b64.as_bytes()).ok_or_else(|| NetError::Http("body b64".into()))?,
            )),
            None => None,
        };
        Ok(Self {
            method,
            url: Url::parse(&wire.url)?,
            headers,
            body,
            page: wire.page,
            initiator: wire.initiator,
            background: wire.background,
        })
    }
}

/// A [`Response`] that can cross a process boundary.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WireResponse {
    /// Final URL.
    pub url: String,
    /// Status code.
    pub status: u16,
    /// Header pairs.
    pub headers: Vec<(String, String)>,
    /// Body, standard base64.
    pub body_b64: String,
    /// Served from cache.
    pub from_cache: bool,
}

impl From<&Response> for WireResponse {
    fn from(response: &Response) -> Self {
        Self {
            url: response.url.to_string(),
            status: response.status.as_u16(),
            headers: response
                .headers
                .iter()
                .filter_map(|(k, v)| Some((k.to_string(), v.to_str().ok()?.to_owned())))
                .collect(),
            body_b64: base64_encode(&response.body),
            from_cache: response.from_cache,
        }
    }
}

impl TryFrom<WireResponse> for Response {
    type Error = NetError;

    fn try_from(wire: WireResponse) -> Result<Self, Self::Error> {
        let mut headers = HeaderMap::new();
        for (k, v) in wire.headers {
            if let (Ok(name), Ok(value)) = (HeaderName::try_from(k), HeaderValue::from_str(&v)) {
                headers.append(name, value);
            }
        }
        let status = StatusCode::from_u16(wire.status)
            .map_err(|e| NetError::Http(format!("status: {e}")))?;
        Ok(Self {
            url: Url::parse(&wire.url)?,
            status,
            headers,
            body: Bytes::from(
                base64_decode(wire.body_b64.as_bytes())
                    .ok_or_else(|| NetError::Http("body b64".into()))?,
            ),
            from_cache: wire.from_cache,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn request_roundtrips() {
        let req = Request::get("https://a.test/x?q=1")
            .unwrap()
            .header("x-a", "1")
            .with_initiator(Initiator::Script);
        let wire = WireRequest::from(&req);
        let back = Request::try_from(wire).unwrap();
        assert_eq!(back.url.as_str(), req.url.as_str());
        assert_eq!(back.method, req.method);
        assert_eq!(back.initiator, Initiator::Script);
    }
}

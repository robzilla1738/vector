//! Host DOM/Web API operations (plan A14).

use std::collections::BTreeMap;

use ve_core::NodeId;
use ve_dom::{Document, Mutation, Namespace, NodeKind, ShadowRootMode};
use ve_script::generated::{
    DOMImplementationInterface, DocumentInterface, ElementInterface, HTMLFormElementInterface,
    HTMLInputElementInterface, NodeInterface, WindowInterface,
};
use ve_script::{JsValue, ScriptError};

use crate::page::{LoadedDocument, Page, outer_html};

pub(crate) fn pack(id: NodeId) -> JsValue {
    JsValue::Number(id.to_u64() as f64)
}

fn unpack(v: &JsValue) -> Option<NodeId> {
    if let Some(n) = v.as_f64() {
        if n.is_finite() && n >= 0.0 {
            return Some(NodeId::from_u64(n as u64));
        }
    }
    let s = v.as_str()?;
    if let Some((i, g)) = s.split_once(':') {
        return Some(NodeId::new(i.parse().ok()?, g.parse().ok()?));
    }
    s.parse::<u64>().ok().map(NodeId::from_u64)
}

fn arg_str(args: &[JsValue], i: usize) -> String {
    args.get(i).map(ToString::to_string).unwrap_or_default()
}
fn arg_bool(args: &[JsValue], i: usize) -> bool {
    args.get(i).is_some_and(JsValue::is_truthy)
}
fn arg_f64(args: &[JsValue], i: usize) -> f64 {
    args.get(i).and_then(JsValue::as_f64).unwrap_or(0.0)
}
fn arg_alpha(args: &[JsValue], i: usize) -> f32 {
    args.get(i)
        .and_then(JsValue::as_f64)
        .unwrap_or(1.0)
        .clamp(0.0, 1.0) as f32
}

fn parse_canvas_path(spec: &serde_json::Value) -> (Vec<[f32; 4]>, Vec<Vec<[f32; 2]>>) {
    let mut rects = Vec::new();
    if let Some(arr) = spec.get("r").and_then(serde_json::Value::as_array) {
        for r in arr {
            if let Some(v) = r.as_array() {
                rects.push([
                    v.first().and_then(serde_json::Value::as_f64).unwrap_or(0.0) as f32,
                    v.get(1).and_then(serde_json::Value::as_f64).unwrap_or(0.0) as f32,
                    v.get(2).and_then(serde_json::Value::as_f64).unwrap_or(0.0) as f32,
                    v.get(3).and_then(serde_json::Value::as_f64).unwrap_or(0.0) as f32,
                ]);
            }
        }
    }
    let mut polys = Vec::new();
    if let Some(arr) = spec.get("p").and_then(serde_json::Value::as_array) {
        for poly in arr {
            let Some(pts) = poly.as_array() else { continue };
            let mut out = Vec::new();
            for pt in pts {
                let Some(xy) = pt.as_array() else { continue };
                out.push([
                    xy.first()
                        .and_then(serde_json::Value::as_f64)
                        .unwrap_or(0.0) as f32,
                    xy.get(1).and_then(serde_json::Value::as_f64).unwrap_or(0.0) as f32,
                ]);
            }
            if out.len() >= 2 {
                polys.push(out);
            }
        }
    }
    (rects, polys)
}
fn obj(pairs: &[(&str, JsValue)]) -> JsValue {
    JsValue::Object(
        pairs
            .iter()
            .map(|(k, v)| ((*k).to_owned(), v.clone()))
            .collect(),
    )
}
fn arr(ids: impl IntoIterator<Item = NodeId>) -> JsValue {
    JsValue::Array(ids.into_iter().map(pack).collect())
}
fn fail(msg: impl Into<String>) -> ScriptError {
    ScriptError::Exception {
        message: msg.into(),
        stack: None,
    }
}

/// Used-value CSS that needs layout. `display` / colors stay restyle-only so
/// jQuery `show()` does not relayout official Complex-DOM Spectrum.
fn computed_needs_layout(name: &str) -> bool {
    matches!(
        name,
        "width"
            | "height"
            | "min-width"
            | "min-height"
            | "max-width"
            | "max-height"
            | "top"
            | "right"
            | "bottom"
            | "left"
            | "inset"
            | "margin"
            | "margin-top"
            | "margin-right"
            | "margin-bottom"
            | "margin-left"
            | "padding"
            | "padding-top"
            | "padding-right"
            | "padding-bottom"
            | "padding-left"
    )
}

fn describe_node(page: &Page, id: NodeId) -> Option<JsValue> {
    let node = page.doc.get(id)?;
    let mut map = BTreeMap::new();
    map.insert("t".into(), JsValue::Number(f64::from(node.node_type())));
    if let Some(e) = node.as_element() {
        map.insert("name".into(), JsValue::from(e.name.as_str()));
        map.insert("ns".into(), JsValue::from(e.namespace.uri()));
        if let Some(id_attr) = e.id() {
            map.insert("id".into(), JsValue::from(id_attr));
        }
        if e.attributes.iter().any(|a| a.name.starts_with("on")) {
            map.insert("on".into(), JsValue::Bool(true));
        }
    }
    if let NodeKind::ShadowRoot { mode } = node.kind {
        map.insert("shadow".into(), JsValue::Bool(true));
        map.insert(
            "mode".into(),
            JsValue::from(match mode {
                ShadowRootMode::Open => "open",
                ShadowRootMode::Closed => "closed",
            }),
        );
    }
    Some(JsValue::Object(map))
}
fn live(page: &Page, args: &[JsValue], i: usize) -> Result<NodeId, ScriptError> {
    let id = unpack(args.get(i).unwrap_or(&JsValue::Null)).ok_or_else(|| fail("not a node"))?;
    if !page.doc.contains(id) {
        return Err(fail("The node is detached"));
    }
    Ok(id)
}
fn scope_root(page: &Page, args: &[JsValue]) -> NodeId {
    unpack(args.first().unwrap_or(&JsValue::Null))
        .filter(|id| page.doc.contains(*id))
        .unwrap_or_else(|| page.doc.root())
}
fn doc_arg(page: &Page, args: &[JsValue]) -> NodeId {
    unpack(args.first().unwrap_or(&JsValue::Null))
        .filter(|&id| {
            page.doc.contains(id) && page.doc.get(id).is_some_and(ve_dom::Node::is_document)
        })
        .unwrap_or_else(|| page.doc.root())
}
fn query(page: &Page, root: NodeId, selector: &str, all: bool) -> Result<Vec<NodeId>, ScriptError> {
    if selector.trim().is_empty() {
        return Err(fail("The provided selector is empty."));
    }
    page.style_engine
        .select_descendants(&page.doc, root, selector, all, |id| page.parser_visible(id))
        .map_err(|_| fail("An invalid or illegal string was specified"))
}
fn parse_sel(selector: &str) -> Result<(), ScriptError> {
    ve_style::parse_selector_list(selector)
        .map(|_| ())
        .map_err(|_| fail("An invalid or illegal string was specified"))
}
fn next_el(page: &Page, id: NodeId) -> Option<NodeId> {
    let mut n = page.visible_next_sibling(id);
    while let Some(cur) = n {
        if page.doc.get(cur).is_some_and(|x| x.is_element()) {
            return Some(cur);
        }
        n = page.visible_next_sibling(cur);
    }
    None
}
fn prev_el(page: &Page, id: NodeId) -> Option<NodeId> {
    let mut n = page.visible_prev_sibling(id);
    while let Some(cur) = n {
        if page.doc.get(cur).is_some_and(|x| x.is_element()) {
            return Some(cur);
        }
        n = page.doc.prev_sibling(cur);
    }
    None
}
fn inner_html(page: &Page, id: NodeId) -> String {
    if page
        .doc
        .element(id)
        .is_some_and(|e| e.is_html("script") || e.is_html("style") || e.is_html("title"))
    {
        return page.doc.text_content(id);
    }
    let root = if page.doc.element(id).is_some_and(|e| e.is_html("template")) {
        page.doc.template_contents(id).unwrap_or(id)
    } else {
        id
    };
    page.doc
        .children(root)
        .map(|c| outer_html(&page.doc, c))
        .collect()
}
fn target_origin_matches(target: &str, dest: &str) -> bool {
    if target.is_empty() || target == "*" {
        return true;
    }
    let t = if target.contains("://") {
        origin_of(target)
    } else {
        target.to_string()
    };
    t == dest
}

pub(crate) fn origin_of(url: &str) -> String {
    url::Url::parse(url).map_or_else(
        |_| "null".into(),
        |u| {
            let host = u.host_str().unwrap_or("");
            match u.port() {
                Some(p) => format!("{}://{host}:{p}", u.scheme()),
                None => format!("{}://{host}", u.scheme()),
            }
        },
    )
}

fn json_key_path(json: &str, path: &str) -> Option<String> {
    let path = path.trim();
    if path.starts_with('[') {
        let parts: Vec<String> = serde_json::from_str(path).ok()?;
        let keys: Vec<String> = parts
            .iter()
            .map(|p| json_key_path(json, p))
            .collect::<Option<Vec<_>>>()?;
        return Some(keys.join("\u{0000}"));
    }
    let mut v: serde_json::Value = serde_json::from_str(json).ok()?;
    for part in path.split('.') {
        v = v.get(part)?.clone();
    }
    match v {
        serde_json::Value::Null => None,
        serde_json::Value::String(s) => Some(s),
        other => Some(other.to_string()),
    }
}
fn split_qname(qname: &str) -> (Option<String>, &str) {
    match qname.rsplit_once(':') {
        Some((prefix, local)) if !prefix.is_empty() && !local.is_empty() => {
            (Some(prefix.to_owned()), local)
        }
        _ => (None, qname),
    }
}

fn percent_href(href: &str) -> String {
    href.replace('\u{FFFD}', "%EF%BF%BD")
}

fn percent_fragment(href: &str) -> String {
    href.find('#')
        .map(|i| percent_href(&href[i..]))
        .unwrap_or_default()
}

fn loc(url: &str, part: &str) -> String {
    let Ok(u) = url::Url::parse(url) else {
        return String::new();
    };
    match part {
        "href" => percent_href(u.as_str()),
        "protocol" => format!("{}:", u.scheme()),
        "host" => match u.port() {
            Some(p) => format!("{}:{p}", u.host_str().unwrap_or("")),
            None => u.host_str().unwrap_or("").to_owned(),
        },
        "hostname" => u.host_str().unwrap_or("").to_owned(),
        "port" => u.port().map(|p| p.to_string()).unwrap_or_default(),
        "pathname" => u.path().to_owned(),
        "search" => u.query().map(|q| format!("?{q}")).unwrap_or_default(),
        "hash" => percent_fragment(u.as_str()),
        "origin" => origin_of(url),
        _ => u.to_string(),
    }
}

fn same_document(a: &url::Url, b: &url::Url) -> bool {
    a.scheme() == b.scheme()
        && a.host() == b.host()
        && a.port() == b.port()
        && a.path() == b.path()
        && a.query() == b.query()
}

fn write_page_url(page: &mut Page, next: String) {
    page.url.clone_from(&next);
    if let Some(e) = page.history.get_mut(page.history_index) {
        e.document.url.clone_from(&next);
    }
}

fn apply_location_part(page: &mut Page, field: &str, val: &str) -> Result<JsValue, ScriptError> {
    let Ok(mut u) = url::Url::parse(&page.url) else {
        return Ok(JsValue::Undefined);
    };
    match field {
        "replace" => {
            if let Some(resolved) = page.resolve_url(val) {
                write_page_url(page, resolved);
            }
            return Ok(JsValue::Undefined);
        }
        "href" => {
            let Some(resolved) = page.resolve_url(val) else {
                return Ok(JsValue::Undefined);
            };
            let Ok(new_u) = url::Url::parse(&resolved) else {
                return Ok(JsValue::Undefined);
            };
            if same_document(&u, &new_u) {
                u.set_fragment(new_u.fragment());
                write_page_url(page, u.to_string());
                return Ok(JsValue::from("hashchange"));
            }
            let _ = page.navigate(&resolved);
            return Ok(JsValue::Undefined);
        }
        "hash" => {
            let f = val.trim_start_matches('#');
            if f.is_empty() {
                u.set_fragment(None);
            } else {
                u.set_fragment(Some(f));
            }
        }
        "pathname" => u.set_path(val),
        "search" => {
            let q = val.trim_start_matches('?');
            if q.is_empty() {
                u.set_query(None);
            } else {
                u.set_query(Some(q));
            }
        }
        "hostname" => {
            let _ = u.set_host(Some(val));
        }
        "host" => {
            if let Some((host, port)) = val.rsplit_once(':')
                && let Ok(p) = port.parse::<u16>()
            {
                let _ = u.set_host(Some(host));
                let _ = u.set_port(Some(p));
            } else {
                let _ = u.set_host(Some(val));
                let _ = u.set_port(None);
            }
        }
        "protocol" => {
            let _ = u.set_scheme(val.trim_end_matches(':'));
        }
        "port" => {
            if val.is_empty() {
                let _ = u.set_port(None);
            } else if let Ok(p) = val.parse::<u16>() {
                let _ = u.set_port(Some(p));
            }
        }
        _ => {
            let _ = page.navigate(val);
            return Ok(JsValue::Undefined);
        }
    }
    write_page_url(page, u.to_string());
    Ok(if field == "hash" {
        JsValue::from("hashchange")
    } else {
        JsValue::Undefined
    })
}
fn insert_fragment(page: &mut Page, context: &str, html: &str) -> Result<Vec<NodeId>, ScriptError> {
    let scripting = page.scripting.is_some();
    let doc = std::mem::replace(&mut page.doc, ve_dom::Document::new());
    let (doc, kids) = ve_html::parse_fragment_into(doc, context, html, scripting);
    page.doc = doc;
    Ok(kids)
}
fn context_name(page: &Page, id: NodeId) -> String {
    page.doc
        .element(id)
        .map_or_else(|| "div".into(), |e| e.name.clone())
}

/// Dispatch a `dom` host call.
#[allow(clippy::too_many_lines)]
pub(crate) fn host_call(
    page: &mut Page,
    op: &str,
    args: &[JsValue],
) -> Result<JsValue, ScriptError> {
    match op {
        "documentNode" => Ok(pack(page.doc.root())),
        "queueModuleEval" => {
            page.pending_module_scripts.push(arg_str(args, 0));
            Ok(JsValue::Undefined)
        }
        "windowOpen" => {
            let url = arg_str(args, 0);
            let blocked = !page.coop_allows_open(&url);
            Ok(obj(&[("blocked", JsValue::Bool(blocked))]))
        }
        "describe" => describe_node(page, live(page, args, 0)?).ok_or_else(|| fail("detached")),
        "describeMany" => Ok(JsValue::Array(
            args.iter()
                .map(|a| {
                    unpack(a)
                        .filter(|id| page.doc.contains(*id))
                        .and_then(|id| describe_node(page, id))
                        .unwrap_or(JsValue::Null)
                })
                .collect(),
        )),
        "nodeType" => Ok(live(page, args, 0).ok().map_or(JsValue::Number(0.0), |id| {
            JsValue::Number(f64::from(
                crate::idl::LiveNode::new(&mut page.doc, id).node_type(),
            ))
        })),
        "nodeName" => Ok(live(page, args, 0).ok().map_or_else(
            || JsValue::from(""),
            |id| {
                JsValue::from(
                    crate::idl::LiveNode::new(&mut page.doc, id)
                        .node_name()
                        .as_str(),
                )
            },
        )),
        "nodeValue" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| crate::idl::LiveNode::new(&mut page.doc, id).node_value())
            .map_or(JsValue::Null, |s| JsValue::from(s.as_str()))),
        "setNodeValue" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveNode::new(&mut page.doc, id).set_node_value(Some(arg_str(args, 1)));
            Ok(JsValue::Undefined)
        }
        "textContent" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| crate::idl::LiveNode::new(&mut page.doc, id).text_content())
            .map_or(JsValue::Null, |s| JsValue::from(s.as_str()))),
        "setTextContent" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveNode::new(&mut page.doc, id).set_text_content(Some(arg_str(args, 1)));
            Ok(JsValue::Undefined)
        }
        "parentNode" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| crate::idl::LiveNode::new(&mut page.doc, id).parent_node())
            .map_or(JsValue::Null, pack)),
        "ancestorPath" => {
            let id = live(page, args, 0)?;
            let mut out = Vec::new();
            let mut cur = Some(id);
            while let Some(n) = cur {
                out.push(n);
                cur = page.doc.parent(n).or_else(|| page.doc.host(n));
            }
            Ok(arr(out))
        }
        "firstChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.visible_first_child(id))
            .map_or(JsValue::Null, pack)),
        "lastChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.visible_last_child(id))
            .map_or(JsValue::Null, pack)),
        "nextSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.visible_next_sibling(id))
            .map_or(JsValue::Null, pack)),
        "prevSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.visible_prev_sibling(id))
            .map_or(JsValue::Null, pack)),
        "childNodes" => Ok(live(page, args, 0).ok().map_or_else(
            || JsValue::Array(Vec::new()),
            |id| arr(page.tree_children(id)),
        )),
        "isConnected" => Ok(JsValue::Bool(page.doc.is_connected(live(page, args, 0)?))),
        "parserVisible" => Ok(JsValue::Bool(page.parser_visible(live(page, args, 0)?))),
        "realChildren" => {
            let id = live(page, args, 0)?;
            Ok(arr(page.doc.children(id)))
        }
        "realChildCount" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::from(page.doc.children(id).count() as f64))
        }
        "realNextSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.next_sibling(id))
            .map_or(JsValue::Null, pack)),
        "appendChild" => {
            let (p, c) = (live(page, args, 0)?, live(page, args, 1)?);
            let ret = crate::idl::LiveDom::new(page, p).append_child(c);
            Ok(pack(ret))
        }
        "insertBefore" => {
            let (p, c) = (live(page, args, 0)?, live(page, args, 1)?);
            let before =
                unpack(args.get(2).unwrap_or(&JsValue::Null)).filter(|id| page.doc.contains(*id));
            Ok(pack(
                crate::idl::LiveDom::new(page, p).insert_before(c, before),
            ))
        }
        "removeChild" => {
            let p = live(page, args, 0)?;
            let c = live(page, args, 1)?;
            Ok(pack(crate::idl::LiveDom::new(page, p).remove_child(c)))
        }
        "replaceChild" => {
            let (p, new, old) = (
                live(page, args, 0)?,
                live(page, args, 1)?,
                live(page, args, 2)?,
            );
            Ok(pack(
                crate::idl::LiveDom::new(page, p).replace_child(new, old),
            ))
        }
        "replaceChildren" => {
            let parent = live(page, args, 0)?;
            let incoming: Vec<NodeId> = args
                .iter()
                .skip(1)
                .filter_map(unpack)
                .filter(|id| page.doc.contains(*id))
                .collect();
            page.doc
                .replace_children(parent, &incoming)
                .map_err(|e| fail(e.to_string()))?;
            for kid in &incoming {
                page.maybe_attach_blank_iframe(*kid);
            }
            Ok(JsValue::Undefined)
        }
        "parseHTMLDocument" => {
            let html = arg_str(args, 0);
            let reusable = page.parser_scratch.filter(|&id| {
                page.doc.contains(id)
                    && page
                        .doc
                        .body_of(id)
                        .is_some_and(|b| page.doc.first_child(b).is_none())
            });
            let doc = match reusable {
                Some(id) => id,
                None => {
                    crate::idl::LiveImpl::new(page).create_h_t_m_l_document(Some(String::new()))
                }
            };
            page.parser_scratch = Some(doc);
            let body = page
                .doc
                .body_of(doc)
                .or_else(|| {
                    page.doc
                        .descendants(doc)
                        .find(|&id| page.doc.element(id).is_some_and(|e| e.name == "body"))
                })
                .ok_or_else(|| fail("no body"))?;
            crate::idl::LiveDom::new(page, body).set_inner_h_t_m_l(html);
            Ok(pack(doc))
        }
        "cloneNode" => {
            let id = live(page, args, 0)?;
            let deep = arg_bool(args, 1);
            Ok(pack(
                crate::idl::LiveNode::new(&mut page.doc, id).clone_node(Some(deep)),
            ))
        }
        "contains" => {
            let id = live(page, args, 0)?;
            let other = live(page, args, 1).ok();
            Ok(JsValue::Bool(
                crate::idl::LiveNode::new(&mut page.doc, id).contains(other),
            ))
        }
        "isEqualNode" => {
            let id = live(page, args, 0)?;
            let other = live(page, args, 1).ok();
            Ok(JsValue::Bool(
                crate::idl::LiveNode::new(&mut page.doc, id).is_equal_node(other),
            ))
        }
        "compareDocumentPosition" => {
            let id = live(page, args, 0)?;
            let other = live(page, args, 1)?;
            Ok(JsValue::Number(f64::from(
                crate::idl::LiveNode::new(&mut page.doc, id).compare_document_position(other),
            )))
        }
        "splitText" => {
            let id = live(page, args, 0)?;
            let offset = arg_f64(args, 1).max(0.0) as usize;
            let data = crate::idl::LiveNode::new(&mut page.doc, id)
                .node_value()
                .unwrap_or_default();
            let chars: Vec<char> = data.chars().collect();
            if offset > chars.len() {
                return Err(fail("The index is not in the allowed range."));
            }
            let prefix: String = chars[..offset].iter().collect();
            let suffix: String = chars[offset..].iter().collect();
            crate::idl::LiveNode::new(&mut page.doc, id).set_node_value(Some(prefix));
            let next = page.doc.create_text(suffix);
            page.script_created_nodes.insert(next);
            if let Some(parent) = page.doc.parent(id) {
                let before = page.doc.next_sibling(id);
                let _ = crate::idl::LiveDom::new(page, parent).insert_before(next, before);
            }
            Ok(pack(next))
        }
        "normalize" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveNode::new(&mut page.doc, id).normalize();
            Ok(JsValue::Undefined)
        }
        "lookupPrefix" => {
            let id = live(page, args, 0)?;
            let ns = match args.get(1) {
                None | Some(JsValue::Null | JsValue::Undefined) => None,
                Some(v) => Some(v.to_string()),
            };
            Ok(crate::idl::LiveNode::new(&mut page.doc, id)
                .lookup_prefix(ns)
                .map_or(JsValue::Null, |s| JsValue::from(s.as_str())))
        }
        "lookupNamespaceURI" => {
            let id = live(page, args, 0)?;
            let prefix = match args.get(1) {
                None | Some(JsValue::Null | JsValue::Undefined) => None,
                Some(v) => Some(v.to_string()),
            };
            Ok(crate::idl::LiveNode::new(&mut page.doc, id)
                .lookup_namespace_u_r_i(prefix)
                .map_or(JsValue::Null, |s| JsValue::from(s.as_str())))
        }
        "importNode" => {
            let node = live(page, args, 0)?;
            let deep = arg_bool(args, 1);
            Ok(pack(
                crate::idl::LiveDom::document(page).import_node(node, Some(deep)),
            ))
        }
        "adoptNode" => {
            let node = live(page, args, 0)?;
            Ok(pack(crate::idl::LiveDom::document(page).adopt_node(node)))
        }
        "getRootNode" => {
            let mut cur = live(page, args, 0)?;
            let composed = arg_bool(args, 1);
            loop {
                let next = page
                    .doc
                    .parent(cur)
                    .or_else(|| if composed { page.doc.host(cur) } else { None });
                match next {
                    Some(p) => cur = p,
                    None => break,
                }
            }
            Ok(pack(cur))
        }
        "tagName" => {
            let id = live(page, args, 0)?;
            let name = crate::idl::LiveDom::new(page, id).tag_name();
            if name.is_empty() {
                Ok(JsValue::Null)
            } else {
                Ok(JsValue::from(name.as_str()))
            }
        }
        "localName" => Ok(page
            .doc
            .element(live(page, args, 0)?)
            .map_or(JsValue::Null, |e| JsValue::from(e.name.as_str()))),
        "prefix" => Ok(page
            .doc
            .element(live(page, args, 0)?)
            .and_then(|e| e.prefix.as_deref())
            .map_or(JsValue::Null, JsValue::from)),
        "namespaceURI" => Ok(page
            .doc
            .element(live(page, args, 0)?)
            .map_or(JsValue::Null, |e| JsValue::from(e.namespace.uri()))),
        "getAttr" => {
            let id = live(page, args, 0)?;
            Ok(crate::idl::LiveDom::new(page, id)
                .get_attribute(arg_str(args, 1))
                .map_or(JsValue::Null, |v| JsValue::from(v.as_str())))
        }
        "setAttr" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveDom::new(page, id).set_attribute(arg_str(args, 1), arg_str(args, 2));
            Ok(JsValue::Undefined)
        }
        "removeAttr" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveDom::new(page, id).remove_attribute(arg_str(args, 1));
            Ok(JsValue::Undefined)
        }
        "hasAttr" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Bool(
                crate::idl::LiveDom::new(page, id).has_attribute(arg_str(args, 1)),
            ))
        }
        "toggleAttribute" => {
            let id = live(page, args, 0)?;
            let force = match args.get(2) {
                None | Some(JsValue::Null | JsValue::Undefined) => None,
                Some(v) => Some(v.is_truthy()),
            };
            Ok(JsValue::Bool(
                crate::idl::LiveDom::new(page, id).toggle_attribute(arg_str(args, 1), force),
            ))
        }
        "attrNames" => {
            let names: Vec<JsValue> = page
                .doc
                .element(live(page, args, 0)?)
                .map(|e| {
                    e.attributes
                        .iter()
                        .map(|a| JsValue::from(a.name.as_str()))
                        .collect()
                })
                .unwrap_or_default();
            Ok(JsValue::Array(names))
        }
        "attrs" => {
            let recs: Vec<JsValue> = page
                .doc
                .element(live(page, args, 0)?)
                .map(|e| {
                    e.attributes
                        .iter()
                        .map(|a| {
                            obj(&[
                                ("name", JsValue::from(a.name.as_str())),
                                ("value", JsValue::from(a.value.as_str())),
                                (
                                    "ns",
                                    a.namespace.as_deref().map_or(JsValue::Null, JsValue::from),
                                ),
                            ])
                        })
                        .collect()
                })
                .unwrap_or_default();
            Ok(JsValue::Array(recs))
        }
        "getAttrNS" => {
            let id = live(page, args, 0)?;
            let ns = arg_str(args, 1);
            let local = arg_str(args, 2);
            Ok(page
                .doc
                .attribute_ns(id, Some(ns.as_str()).filter(|s| !s.is_empty()), &local)
                .map_or(JsValue::Null, JsValue::from))
        }
        "setAttrNS" => {
            let id = live(page, args, 0)?;
            let ns = arg_str(args, 1);
            let qname = arg_str(args, 2);
            let value = arg_str(args, 3);
            page.doc
                .set_attribute_ns(
                    id,
                    Some(ns.as_str()).filter(|s| !s.is_empty()),
                    qname,
                    value,
                )
                .map_err(|e| fail(e.to_string()))?;
            Ok(JsValue::Undefined)
        }
        "innerHTML" => Ok(JsValue::from(
            inner_html(page, live(page, args, 0)?).as_str(),
        )),
        "setInnerHTML" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveDom::new(page, id).set_inner_h_t_m_l(arg_str(args, 1));
            Ok(JsValue::Undefined)
        }
        "templateContent" => {
            let id = live(page, args, 0)?;
            Ok(page.doc.template_contents(id).map_or(JsValue::Null, pack))
        }
        "outerHTML" => Ok(JsValue::from(
            outer_html(&page.doc, live(page, args, 0)?).as_str(),
        )),
        "setOuterHTML" => {
            let id = live(page, args, 0)?;
            let parent = page.doc.parent(id).ok_or_else(|| fail("no parent"))?;
            let kids = insert_fragment(page, &context_name(page, parent), &arg_str(args, 1))?;
            for kid in kids {
                page.doc.insert_before(id, kid).ok();
            }
            page.doc.destroy(id).ok();
            Ok(JsValue::Undefined)
        }
        "querySelector" => Ok(
            query(page, scope_root(page, args), &arg_str(args, 1), false)?
                .into_iter()
                .next()
                .map_or(JsValue::Null, pack),
        ),
        "querySelectorAll" => Ok(arr(query(
            page,
            scope_root(page, args),
            &arg_str(args, 1),
            true,
        )?)),
        "matches" => {
            let id = live(page, args, 0)?;
            let sel = arg_str(args, 1);
            parse_sel(&sel)?;
            Ok(JsValue::Bool(
                crate::idl::LiveDom::new(page, id).matches(sel),
            ))
        }
        "closest" => {
            let id = live(page, args, 0)?;
            let sel = arg_str(args, 1);
            parse_sel(&sel)?;
            Ok(crate::idl::LiveDom::new(page, id)
                .closest(sel)
                .map_or(JsValue::Null, pack))
        }
        "checkValidity" => {
            let id = live(page, args, 0)?;
            let form = page.doc.element(id).is_some_and(|e| e.name == "form");
            let mut node = crate::idl::LiveDom::new(page, id);
            Ok(JsValue::Bool(if form {
                HTMLFormElementInterface::check_validity(&mut node)
            } else {
                HTMLInputElementInterface::check_validity(&mut node)
            }))
        }
        "getElementById" => {
            let want = arg_str(args, 0);
            Ok(
                DocumentInterface::get_element_by_id(
                    &mut crate::idl::LiveDom::document(page),
                    want,
                )
                .map_or(JsValue::Null, pack),
            )
        }
        "getElementByIdScoped" => {
            let root = live(page, args, 0)?;
            let want = arg_str(args, 1);
            if want.is_empty() {
                return Ok(JsValue::Null);
            }
            // Disconnected trees and shadow roots are not gated by the
            // parser insertion point — ARIA idrefs must still resolve.
            let gate = page.in_browsing_tree(root);
            Ok(page
                .doc
                .element_by_id_in(root, &want)
                .filter(|&id| !gate || page.parser_visible(id))
                .map_or(JsValue::Null, pack))
        }
        "getElementsByTagName" => {
            let root = scope_root(page, args);
            // Descendants only: including `root` made `ul.getElementsByTagName("*")`
            // return the ul itself and stripped delegated listeners on `.html()`.
            Ok(crate::idl::LiveDom::new(page, root).get_elements_by_tag_name(arg_str(args, 1)))
        }
        "getElementsByClassName" => {
            let root = scope_root(page, args);
            let class = arg_str(args, 1);
            Ok(arr(page.doc.descendants(root).filter(|&id| {
                page.doc.element(id).is_some_and(|e| e.has_class(&class))
            })))
        }
        "getElementsByName" => {
            let want = arg_str(args, 1);
            if want.is_empty() {
                return Ok(arr(std::iter::empty()));
            }
            Ok(arr(page.doc.elements().filter(|&id| {
                page.doc.element(id).is_some_and(|e| {
                    e.namespace == Namespace::Html && e.attr("name") == Some(want.as_str())
                })
            })))
        }
        "children" => Ok(arr(page
            .tree_children(live(page, args, 0)?)
            .into_iter()
            .filter(|&c| page.doc.get(c).is_some_and(|n| n.is_element())))),
        "firstElementChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| {
                page.tree_children(id)
                    .into_iter()
                    .find(|&c| page.doc.get(c).is_some_and(|n| n.is_element()))
            })
            .map_or(JsValue::Null, pack)),
        "lastElementChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| {
                page.visible_children(id)
                    .into_iter()
                    .rev()
                    .find(|&c| page.doc.get(c).is_some_and(|n| n.is_element()))
            })
            .map_or(JsValue::Null, pack)),
        "nextElementSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| next_el(page, id))
            .map_or(JsValue::Null, pack)),
        "prevElementSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| prev_el(page, id))
            .map_or(JsValue::Null, pack)),
        "documentElement" => {
            let id = doc_arg(page, args);
            Ok(crate::idl::LiveDom::new(page, id)
                .document_element()
                .map_or(JsValue::Null, pack))
        }
        "ownerDocument" => {
            let id = live(page, args, 0)?;
            if page.doc.get(id).is_some_and(ve_dom::Node::is_document) {
                return Ok(JsValue::Null);
            }
            let mut cur = page.doc.parent(id);
            while let Some(c) = cur {
                if page.doc.get(c).is_some_and(ve_dom::Node::is_document) {
                    return Ok(pack(c));
                }
                cur = page.doc.parent(c);
            }
            Ok(pack(page.doc.root()))
        }
        "documentLinks" => {
            let root = scope_root(page, args);
            Ok(arr(std::iter::once(root)
                .chain(page.doc.descendants(root))
                .filter(|&id| {
                    page.doc.element(id).is_some_and(|e| {
                        e.namespace == Namespace::Html
                            && (e.name == "a" || e.name == "area")
                            && e.has_attr("href")
                    })
                })))
        }
        "createHTMLDocument" => {
            let title = match args.first() {
                Some(JsValue::String(s)) => Some(s.clone()),
                _ => None,
            };
            Ok(pack(
                crate::idl::LiveImpl::new(page).create_h_t_m_l_document(title),
            ))
        }
        "frameDocument" => {
            let id = live(page, args, 0)?;
            Ok(page.frame_document(id).map_or(JsValue::Null, pack))
        }
        "frameDocumentRaw" => {
            let id = live(page, args, 0)?;
            Ok(page.doc.content_document(id).map_or(JsValue::Null, pack))
        }
        "frameScriptHandles" => {
            let id = live(page, args, 0)?;
            let Some(root) = page.doc.content_document(id) else {
                return Ok(JsValue::Array(Vec::new()));
            };
            Ok(arr(std::iter::once(root)
                .chain(page.doc.descendants(root))
                .filter(|&n| {
                    page.doc.element(n).is_some_and(|e| e.name == "script")
                })))
        }
        "frameUrl" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::from(page.iframe_src_url(id).as_str()))
        }
        "frameLocationOrigin" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::from(page.iframe_location_origin(id).as_str()))
        }
        "addAuthorSheet" => {
            page.add_author_stylesheet(&arg_str(args, 0));
            Ok(JsValue::Undefined)
        }
        "documentWrite" => document_write(page, &arg_str(args, 1)),
        "serviceWorkerRegister" => {
            let script_url = arg_str(args, 0);
            let scope = arg_str(args, 1);
            let mut script = arg_str(args, 2);
            let scope = if scope.is_empty() {
                page.resolve_url("./").unwrap_or_else(|| page.url.clone())
            } else {
                page.resolve_url(&scope).unwrap_or(scope)
            };
            let script_url = page.resolve_url(&script_url).unwrap_or(script_url);
            if script.is_empty() {
                let id = page.id();
                let origin = page.url.clone();
                if let Some(loader) = page.loader.as_mut()
                    && let Ok(res) =
                        loader.script_fetch(&script_url, "GET", &[], id, Some(origin.as_str()))
                    && res.status < 400
                {
                    script = String::from_utf8_lossy(&res.bytes).into_owned();
                }
            }
            let (script, imports) = page.expand_import_scripts(&script_url, &script, 0);
            let lifecycle = crate::page::eval_sw_lifecycle(&script);
            let existing = page.service_workers.iter().position(|s| s.scope == scope);
            let mut waiting = false;
            let mut waiting_url = String::new();
            let mut claimed = lifecycle.claim;
            let mut activate_fired = lifecycle.activate;
            let state = "activated";
            if let Some(idx) = existing {
                let same = page.service_workers[idx].script == script;
                if same {
                    let _ = imports;
                    claimed = page.service_workers[idx].claimed;
                    waiting = page.service_workers[idx].waiting_script.is_some();
                    waiting_url = page.service_workers[idx]
                        .waiting_script_url
                        .clone()
                        .unwrap_or_default();
                } else if lifecycle.skip_waiting || page.service_workers[idx].script.is_empty() {
                    page.sw_waiting_realms.remove(&scope);
                    page.sw_realms.remove(&scope);
                    if let Some(realm) =
                        crate::sw_realm::SwRealm::spawn(script.clone(), imports, true)
                    {
                        claimed = claimed || realm.claimed;
                        page.sw_realms.insert(scope.clone(), realm);
                    }
                    page.service_workers[idx].script.clone_from(&script);
                    page.service_workers[idx].script_url.clone_from(&script_url);
                    page.service_workers[idx].claimed = claimed;
                    page.service_workers[idx].waiting_script = None;
                    page.service_workers[idx].waiting_script_url = None;
                } else {
                    page.sw_waiting_realms.remove(&scope);
                    if let Some(realm) =
                        crate::sw_realm::SwRealm::spawn(script.clone(), imports, false)
                    {
                        page.sw_waiting_realms.insert(scope.clone(), realm);
                    }
                    page.service_workers[idx].waiting_script = Some(script.clone());
                    page.service_workers[idx].waiting_script_url = Some(script_url.clone());
                    waiting = true;
                    waiting_url.clone_from(&script_url);
                    claimed = page.service_workers[idx].claimed;
                    activate_fired = false;
                }
            } else {
                page.sw_realms.remove(&scope);
                if let Some(realm) = crate::sw_realm::SwRealm::spawn(script.clone(), imports, true)
                {
                    claimed = claimed || realm.claimed;
                    page.sw_realms.insert(scope.clone(), realm);
                }
                page.service_workers
                    .push(crate::page::ServiceWorkerRegistration {
                        scope: scope.clone(),
                        script_url: script_url.clone(),
                        script,
                        claimed,
                        waiting_script: None,
                        waiting_script_url: None,
                    });
            }
            let active = page
                .service_workers
                .iter()
                .any(|s| s.scope == scope && !s.script.is_empty());
            Ok(obj(&[
                ("scope", JsValue::from(scope.as_str())),
                ("scriptURL", JsValue::from(script_url.as_str())),
                ("active", JsValue::Bool(active)),
                ("state", JsValue::from(state)),
                ("installing", JsValue::Bool(false)),
                ("waiting", JsValue::Bool(waiting)),
                ("waitingURL", JsValue::from(waiting_url.as_str())),
                ("installFired", JsValue::Bool(lifecycle.install)),
                ("activateFired", JsValue::Bool(activate_fired)),
                ("skipWaiting", JsValue::Bool(lifecycle.skip_waiting)),
                ("claimed", JsValue::Bool(claimed)),
            ]))
        }
        "serviceWorkerPostMessage" => {
            let scope = arg_str(args, 0);
            let target = arg_str(args, 1);
            let data = arg_str(args, 2);
            let skipped = if target == "installed" {
                page.sw_waiting_realms
                    .get(&scope)
                    .is_some_and(|r| r.post_message(&data))
            } else {
                page.sw_realms
                    .get(&scope)
                    .is_some_and(|r| r.post_message(&data))
            };
            if skipped {
                promote_waiting_worker(page, &scope);
            }
            Ok(JsValue::Bool(skipped))
        }
        "serviceWorkerSkipWaiting" => {
            let scope = arg_str(args, 0);
            promote_waiting_worker(page, &scope);
            Ok(JsValue::Bool(true))
        }
        "swTakeClientPosts" => {
            let posts = std::mem::take(&mut page.sw_client_posts);
            Ok(JsValue::Array(
                posts
                    .into_iter()
                    .map(|s| JsValue::from(s.as_str()))
                    .collect(),
            ))
        }
        "origin" => Ok(JsValue::from(origin_of(&page.url).as_str())),
        "frameOrigin" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::from(page.iframe_origin(id).as_str()))
        }
        "frameIsolated" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Bool(page.frame_is_isolated(id)))
        }
        "framePostMessage" => {
            let handle = arg_str(args, 0);
            let data = arg_str(args, 1);
            let target_origin = arg_str(args, 2);
            let source_origin = {
                let s = arg_str(args, 3);
                if s.is_empty() {
                    origin_of(&page.url)
                } else {
                    s
                }
            };
            let dest_origin = if handle.is_empty() {
                origin_of(&page.url)
            } else {
                match unpack(&JsValue::from(handle.as_str())).filter(|id| page.doc.contains(*id)) {
                    Some(id) => page.iframe_origin(id),
                    None => {
                        return Ok(obj(&[("ok", JsValue::Bool(false))]));
                    }
                }
            };
            let ok = target_origin_matches(&target_origin, &dest_origin);
            Ok(obj(&[
                ("ok", JsValue::Bool(ok)),
                ("origin", JsValue::from(source_origin.as_str())),
                ("data", JsValue::from(data.as_str())),
            ]))
        }
        "wsConnect" => {
            let url = arg_str(args, 0);
            let resolved = page.resolve_url(&url).unwrap_or(url);
            match page.open_websocket(&resolved) {
                Ok(id) => {
                    let state = page.websockets.get(&id).map_or(3, |w| w.ready_state);
                    Ok(JsValue::from(format!("ws:{id}:{state}").as_str()))
                }
                Err(e) => Err(fail(e)),
            }
        }
        "wsSend" => {
            let id = arg_f64(args, 0) as u64;
            let data = arg_str(args, 1);
            match page.websockets.get_mut(&id) {
                Some(ws) => ws
                    .send(data.as_bytes())
                    .map(|()| JsValue::Undefined)
                    .map_err(|e| fail(e.to_string())),
                None => Err(fail("no such WebSocket")),
            }
        }
        "wsClose" => {
            let id = arg_f64(args, 0) as u64;
            if let Some(ws) = page.websockets.get_mut(&id) {
                let _ = ws.close();
            }
            Ok(JsValue::Undefined)
        }
        "wsPoll" => {
            let id = arg_f64(args, 0) as u64;
            let Some(ws) = page.websockets.get_mut(&id) else {
                return Ok(JsValue::Array(Vec::new()));
            };
            ws.poll();
            let msgs = ws.take_incoming();
            Ok(JsValue::Array(
                msgs.into_iter()
                    .map(|b| JsValue::from(String::from_utf8_lossy(&b).as_ref()))
                    .collect(),
            ))
        }
        "head" => Ok(page
            .doc
            .head_of(doc_arg(page, args))
            .map_or(JsValue::Null, pack)),
        "body" => Ok(page
            .doc
            .body_of(doc_arg(page, args))
            .map_or(JsValue::Null, pack)),
        "title" => Ok(JsValue::from(
            page.doc
                .title_of(doc_arg(page, args))
                .unwrap_or_default()
                .as_str(),
        )),
        "setTitle" => {
            let doc = doc_arg(page, args);
            let text = arg_str(args, 1);
            page.doc
                .set_title_of(doc, &text)
                .map_err(|e| fail(e.to_string()))?;
            Ok(JsValue::Undefined)
        }
        "url" => Ok(JsValue::from(
            crate::idl::LiveDom::document(page).u_r_l().as_str(),
        )),
        "compatMode" => Ok(JsValue::from(
            if matches!(page.doc.quirks_mode(), ve_dom::QuirksMode::Quirks) {
                "BackCompat"
            } else {
                "CSS1Compat"
            },
        )),
        "cookie" => Ok(JsValue::from(
            crate::idl::LiveDom::document(page).cookie().as_str(),
        )),
        "setCookie" => {
            crate::idl::LiveDom::document(page).set_cookie(arg_str(args, 0));
            Ok(JsValue::Undefined)
        }
        "compress" => {
            let format = arg_str(args, 0);
            let input = ve_net::base64_decode(arg_str(args, 1).as_bytes()).unwrap_or_default();
            match compress_bytes(&format, &input) {
                Ok(out) => Ok(JsValue::from(ve_net::base64_encode(&out).as_str())),
                Err(e) => Err(fail(e)),
            }
        }
        "decompress" => {
            let format = arg_str(args, 0);
            let input = ve_net::base64_decode(arg_str(args, 1).as_bytes()).unwrap_or_default();
            match decompress_bytes(&format, &input) {
                Ok(out) => Ok(JsValue::from(ve_net::base64_encode(&out).as_str())),
                Err(e) => Err(fail(e)),
            }
        }
        "lastModified" => Ok(JsValue::from(page.last_modified.as_deref().unwrap_or(""))),
        "readyState" => Ok(JsValue::from(page.ready_state)),
        "setReadyState" => {
            let next = arg_str(args, 0);
            page.ready_state = match next.as_str() {
                "interactive" => "interactive",
                "complete" => "complete",
                _ => "loading",
            };
            Ok(JsValue::Undefined)
        }
        "elementFromPoint" => Ok(crate::idl::LiveDom::document(page)
            .element_from_point(arg_f64(args, 0), arg_f64(args, 1))
            .map_or(JsValue::Null, pack)),
        "elementsFromPoint" => Ok(arr(crate::idl::LiveDom::document(page)
            .elements_from_point(arg_f64(args, 0), arg_f64(args, 1)))),
        "createElement" => {
            let name = arg_str(args, 0);
            let id = crate::idl::LiveDom::document(page).create_element(name);
            page.script_created_nodes.insert(id);
            Ok(pack(id))
        }
        "createElementNS" => {
            let ns = arg_str(args, 0);
            let namespace = if ns.is_empty() {
                Namespace::Html
            } else {
                Namespace::from_uri(&ns)
            };
            let qname = arg_str(args, 1);
            let (prefix, local) = split_qname(&qname);
            let name = if namespace == Namespace::Html {
                local.to_ascii_lowercase()
            } else {
                local.to_owned()
            };
            let id = page.doc.create_element_qname(name, namespace, prefix);
            page.script_created_nodes.insert(id);
            Ok(pack(id))
        }
        "createTextNode" => {
            let id = page.doc.create_text(arg_str(args, 0));
            page.script_created_nodes.insert(id);
            Ok(pack(id))
        }
        "createComment" => {
            let id = page.doc.create_comment(arg_str(args, 0));
            page.script_created_nodes.insert(id);
            Ok(pack(id))
        }
        "createProcessingInstruction" => {
            let target = arg_str(args, 0);
            let data = arg_str(args, 1);
            if data.contains("?>") || target.is_empty() {
                return Err(fail("InvalidCharacterError"));
            }
            let id = page.doc.create_processing_instruction(target, data);
            page.script_created_nodes.insert(id);
            Ok(pack(id))
        }
        "createDocumentType" => {
            let name = arg_str(args, 0);
            if name.is_empty() || name.chars().any(char::is_whitespace) {
                return Err(fail("InvalidCharacterError"));
            }
            let id = page
                .doc
                .create_doctype(name, arg_str(args, 1), arg_str(args, 2));
            page.script_created_nodes.insert(id);
            Ok(pack(id))
        }
        "createDocument" => {
            let ns = arg_str(args, 0);
            let qname = arg_str(args, 1);
            let doc = page.doc.create_document();
            if let Some(dt) =
                unpack(args.get(2).unwrap_or(&JsValue::Null)).filter(|id| page.doc.contains(*id))
            {
                page.doc.append_child(doc, dt).ok();
            }
            if !qname.is_empty() {
                let namespace = if ns.is_empty() {
                    Namespace::Other(String::new())
                } else {
                    Namespace::from_uri(&ns)
                };
                let (prefix, local) = split_qname(&qname);
                let name = if namespace == Namespace::Html {
                    local.to_ascii_lowercase()
                } else {
                    local.to_owned()
                };
                let el = page.doc.create_element_qname(name, namespace, prefix);
                page.doc.append_child(doc, el).ok();
            }
            Ok(pack(doc))
        }
        "doctype" => Ok(page
            .doc
            .doctype_of(doc_arg(page, args))
            .map_or(JsValue::Null, pack)),
        "doctypeName" => Ok(match page.doc.get(live(page, args, 0)?).map(|n| &n.kind) {
            Some(NodeKind::Doctype { name, .. }) => JsValue::from(name.as_str()),
            _ => JsValue::Null,
        }),
        "doctypePublicId" => Ok(match page.doc.get(live(page, args, 0)?).map(|n| &n.kind) {
            Some(NodeKind::Doctype { public_id, .. }) => JsValue::from(public_id.as_str()),
            _ => JsValue::Null,
        }),
        "doctypeSystemId" => Ok(match page.doc.get(live(page, args, 0)?).map(|n| &n.kind) {
            Some(NodeKind::Doctype { system_id, .. }) => JsValue::from(system_id.as_str()),
            _ => JsValue::Null,
        }),
        "createFragment" => {
            let id = page.doc.create_fragment();
            page.script_created_nodes.insert(id);
            Ok(pack(id))
        }
        "attachShadow" => {
            let mode = if arg_str(args, 1) == "closed" {
                ShadowRootMode::Closed
            } else {
                ShadowRootMode::Open
            };
            let root = page
                .doc
                .attach_shadow(live(page, args, 0)?, mode)
                .map_err(|e| fail(e.to_string()))?;
            if arg_str(args, 2) == "manual" {
                page.doc.set_shadow_manual_slots(root);
            }
            Ok(pack(root))
        }
        "slotAssign" => {
            let slot = live(page, args, 0)?;
            let raw = arg_str(args, 1);
            let nodes = serde_json::from_str::<Vec<String>>(&raw)
                .unwrap_or_default()
                .into_iter()
                .filter_map(|s| unpack(&JsValue::String(s)))
                .collect();
            page.doc.assign_slot(slot, nodes);
            Ok(JsValue::Undefined)
        }
        "assignedNodes" => Ok(arr(page.doc.assigned_nodes(live(page, args, 0)?))),
        "assignedSlot" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.assigned_slot(id))
            .map_or(JsValue::Null, pack)),
        "shadowRoot" => {
            let Some(root) = page.doc.shadow_root(live(page, args, 0)?) else {
                return Ok(JsValue::Null);
            };
            match page.doc.get(root).map(|n| &n.kind) {
                Some(NodeKind::ShadowRoot {
                    mode: ShadowRootMode::Closed,
                }) => Ok(JsValue::Null),
                _ => Ok(pack(root)),
            }
        }
        "shadowMode" => Ok(match page.doc.get(live(page, args, 0)?).map(|n| &n.kind) {
            Some(NodeKind::ShadowRoot {
                mode: ShadowRootMode::Open,
            }) => JsValue::from("open"),
            Some(NodeKind::ShadowRoot {
                mode: ShadowRootMode::Closed,
            }) => JsValue::from("closed"),
            _ => JsValue::Null,
        }),
        "host" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.host(id))
            .map_or(JsValue::Null, pack)),
        "remove" => {
            page.doc.remove(live(page, args, 0)?).ok();
            Ok(JsValue::Undefined)
        }
        "insertAdjacentHTML" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveDom::new(page, id)
                .insert_adjacent_h_t_m_l(arg_str(args, 1), arg_str(args, 2));
            Ok(JsValue::Undefined)
        }
        "computed" => {
            let id = live(page, args, 0)?;
            let name = arg_str(args, 1);
            if computed_needs_layout(&name) {
                page.update();
            } else {
                page.restyle_if_needed();
            }
            if matches!(name.as_str(), "width" | "height") {
                if let Some(rect) = page.layout_tree().rect_of(id) {
                    let v = if name == "width" {
                        rect.width()
                    } else {
                        rect.height()
                    };
                    return Ok(JsValue::from(format!("{v}px").as_str()));
                }
            }
            Ok(JsValue::from(
                page.style_tree
                    .get(id)
                    .map(|s| s.property_css(&name))
                    .unwrap_or_default()
                    .as_str(),
            ))
        }
        "boundingRect" => {
            let id = live(page, args, 0)?;
            page.update();
            let rect = page
                .layout_tree()
                .rect_of(id)
                .unwrap_or(ve_core::Rect::ZERO);
            let x = f64::from(rect.x() - page.scroll.x);
            let y = f64::from(rect.y() - page.scroll.y);
            let w = f64::from(rect.width());
            let h = f64::from(rect.height());
            Ok(obj(&[
                ("x", JsValue::Number(x)),
                ("y", JsValue::Number(y)),
                ("width", JsValue::Number(w)),
                ("height", JsValue::Number(h)),
                ("top", JsValue::Number(y)),
                ("right", JsValue::Number(x + w)),
                ("bottom", JsValue::Number(y + h)),
                ("left", JsValue::Number(x)),
            ]))
        }
        "box" => {
            let id = live(page, args, 0)?;
            page.update();
            let rect = page
                .layout_tree()
                .rect_of(id)
                .unwrap_or(ve_core::Rect::ZERO);
            let scroll = page.element_scroll(id);
            let kids = page
                .doc
                .children(id)
                .filter_map(|c| page.layout_tree().rect_of(c))
                .fold((0.0f32, 0.0f32), |acc, r| {
                    (
                        acc.0.max(r.x() + r.width() - rect.x()),
                        acc.1.max(r.y() + r.height() - rect.y()),
                    )
                });
            let which = arg_str(args, 1);
            let v = match which.as_str() {
                "clientWidth" | "offsetWidth" => rect.width(),
                "clientHeight" | "offsetHeight" => rect.height(),
                "offsetTop" => rect.y(),
                "offsetLeft" => rect.x(),
                "scrollWidth" => rect.width().max(kids.0),
                "scrollHeight" => rect.height().max(kids.1),
                "scrollTop" => scroll.y,
                "scrollLeft" => scroll.x,
                "naturalWidth" => page
                    .doc
                    .element(id)
                    .and_then(|e| e.natural_size)
                    .map_or(0.0, |s| s.0 as f32),
                "naturalHeight" => page
                    .doc
                    .element(id)
                    .and_then(|e| e.natural_size)
                    .map_or(0.0, |s| s.1 as f32),
                _ => 0.0,
            };
            Ok(JsValue::Number(f64::from(v)))
        }
        "setScroll" => {
            page.set_element_scroll_axis(
                live(page, args, 0)?,
                &arg_str(args, 1),
                arg_f64(args, 2) as f32,
            );
            Ok(JsValue::Undefined)
        }
        "setStyle" => {
            let id = live(page, args, 0)?;
            let prop = arg_str(args, 1).trim().to_ascii_lowercase();
            let value = arg_str(args, 2);
            let current = page.doc.attribute(id, "style").unwrap_or("").to_owned();
            let mut parts: Vec<String> = current
                .split(';')
                .filter_map(|p| {
                    let p = p.trim();
                    if p.is_empty() {
                        return None;
                    }
                    let name = p.split(':').next()?.trim().to_ascii_lowercase();
                    if name == prop {
                        None
                    } else {
                        Some(p.to_owned())
                    }
                })
                .collect();
            if !value.trim().is_empty() {
                parts.push(format!("{prop}: {value}"));
            }
            page.doc
                .set_attribute(id, "style", parts.join("; "))
                .map_err(|e| fail(e.to_string()))?;
            Ok(JsValue::Undefined)
        }
        "classAdd" => {
            let id = live(page, args, 0)?;
            let mut tokens: Vec<String> = page
                .doc
                .attribute(id, "class")
                .unwrap_or("")
                .split_ascii_whitespace()
                .map(str::to_owned)
                .collect();
            for t in arg_str(args, 1).split_ascii_whitespace() {
                if !tokens.iter().any(|x| x == t) {
                    tokens.push(t.to_owned());
                }
            }
            page.doc.set_attribute(id, "class", tokens.join(" ")).ok();
            Ok(JsValue::Undefined)
        }
        "classRemove" => {
            let id = live(page, args, 0)?;
            let drop: Vec<String> = arg_str(args, 1)
                .split_ascii_whitespace()
                .map(str::to_owned)
                .collect();
            let tokens: Vec<String> = page
                .doc
                .attribute(id, "class")
                .unwrap_or("")
                .split_ascii_whitespace()
                .filter(|t| !drop.iter().any(|d| d == t))
                .map(str::to_owned)
                .collect();
            page.doc.set_attribute(id, "class", tokens.join(" ")).ok();
            Ok(JsValue::Undefined)
        }
        "dataset" => {
            let mut map = BTreeMap::new();
            if let Some(e) = page.doc.element(live(page, args, 0)?) {
                for a in &e.attributes {
                    if let Some(rest) = a.name.strip_prefix("data-") {
                        let camel = rest
                            .split('-')
                            .enumerate()
                            .map(|(i, p)| {
                                if i == 0 {
                                    p.to_owned()
                                } else {
                                    let mut c = p.chars();
                                    c.next()
                                        .map(|f| f.to_uppercase().collect::<String>() + c.as_str())
                                        .unwrap_or_default()
                                }
                            })
                            .collect::<String>();
                        map.insert(camel, JsValue::from(a.value.as_str()));
                    }
                }
            }
            Ok(JsValue::Object(map))
        }
        "setDataset" => {
            let key = arg_str(args, 1);
            let attr = format!(
                "data-{}",
                key.chars().fold(String::new(), |mut s, c| {
                    if c.is_uppercase() {
                        s.push('-');
                        s.extend(c.to_lowercase());
                    } else {
                        s.push(c);
                    }
                    s
                })
            );
            page.doc
                .set_attribute(live(page, args, 0)?, attr, arg_str(args, 2))
                .ok();
            Ok(JsValue::Undefined)
        }
        "formValue" => {
            let id = live(page, args, 0)?;
            if page.doc.form_value(id).is_none() {
                Ok(JsValue::Null)
            } else {
                Ok(JsValue::from(
                    crate::idl::LiveDom::new(page, id).value().as_str(),
                ))
            }
        }
        "setFormValue" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveDom::new(page, id).set_value(arg_str(args, 1));
            Ok(JsValue::Undefined)
        }
        "selectionStart" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(f64::from(page.doc.form_selection(id).0)))
        }
        "setSelectionStart" => {
            let id = live(page, args, 0)?;
            let start = arg_f64(args, 1) as u32;
            let end = page.doc.form_selection(id).1.max(start);
            page.doc.set_form_selection(id, start, end).ok();
            Ok(JsValue::Undefined)
        }
        "selectionEnd" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(f64::from(page.doc.form_selection(id).1)))
        }
        "setSelectionEnd" => {
            let id = live(page, args, 0)?;
            let end = arg_f64(args, 1) as u32;
            let start = page.doc.form_selection(id).0.min(end);
            page.doc.set_form_selection(id, start, end).ok();
            Ok(JsValue::Undefined)
        }
        "checked" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Bool(crate::idl::LiveDom::new(page, id).checked()))
        }
        "setChecked" => {
            let id = live(page, args, 0)?;
            crate::idl::LiveDom::new(page, id).set_checked(arg_bool(args, 1));
            Ok(JsValue::Undefined)
        }
        "selected" => Ok(JsValue::Bool(page.doc.is_selected(live(page, args, 0)?))),
        "setSelected" => {
            page.doc
                .set_selected(live(page, args, 0)?, arg_bool(args, 1))
                .ok();
            Ok(JsValue::Undefined)
        }
        "focus" => {
            page.focus(Some(live(page, args, 0)?));
            Ok(JsValue::Undefined)
        }
        "activeElement" => Ok(page.focused().map_or(JsValue::Null, pack)),
        "blur" => {
            page.focus(None);
            Ok(JsValue::Undefined)
        }
        "activate" => {
            if let Ok(id) = live(page, args, 0) {
                let _ = page.activate(id);
            }
            Ok(JsValue::Undefined)
        }
        "submit" => {
            crate::idl::LiveDom::new(page, live(page, args, 0)?).submit();
            Ok(JsValue::Undefined)
        }
        "reset" => {
            crate::idl::LiveDom::new(page, live(page, args, 0)?).reset();
            Ok(JsValue::Undefined)
        }
        "innerWidth" => Ok(JsValue::Number(
            crate::idl::LiveDom::document(page).inner_width(),
        )),
        "innerHeight" => Ok(JsValue::Number(
            crate::idl::LiveDom::document(page).inner_height(),
        )),
        "setViewport" => {
            let w = arg_f64(args, 0).max(1.0) as f32;
            let h = arg_f64(args, 1).max(1.0) as f32;
            page.set_viewport(ve_core::Size::new(w, h));
            page.update();
            Ok(JsValue::Undefined)
        }
        "scrollX" => Ok(JsValue::Number(
            crate::idl::LiveDom::document(page).scroll_x(),
        )),
        "scrollY" => Ok(JsValue::Number(
            crate::idl::LiveDom::document(page).scroll_y(),
        )),
        "scrollIntoView" => {
            let id = live(page, args, 0)?;
            page.update();
            if let Some(rect) = page.layout_tree().rect_of(id) {
                page.scroll_into_view(rect);
            }
            Ok(JsValue::Undefined)
        }
        "locationGet" => Ok(JsValue::from(loc(&page.url, &arg_str(args, 0)).as_str())),
        "locationSet" => apply_location_part(page, &arg_str(args, 0), &arg_str(args, 1)),
        "reload" => {
            page.reload().ok();
            Ok(JsValue::Undefined)
        }
        "historyLength" => Ok(JsValue::Number(page.history.len() as f64)),
        "historyState" => Ok(JsValue::from(
            page.history
                .get(page.history_index)
                .map_or("null", |e| e.state.as_str()),
        )),
        "historyGo" => {
            let d = arg_f64(args, 0) as i32;
            let from = page.history_index;
            let dest = from as i32 + d;
            if dest < 0 || dest as usize >= page.history.len() || dest as usize == from {
                return Ok(JsValue::Undefined);
            }
            let to = dest as usize;
            let same_document =
                page.history[from].document.bytes == page.history[to].document.bytes;
            if same_document {
                if let Some(cur) = page.history.get_mut(from) {
                    cur.scroll = page.scroll;
                }
                page.history_index = to;
                if let Some(entry) = page.history.get(to) {
                    page.url.clone_from(&entry.document.url);
                    page.scroll = entry.scroll;
                }
                return Ok(JsValue::Bool(true));
            }
            match d.cmp(&0) {
                std::cmp::Ordering::Less => {
                    for _ in 0..(-d) {
                        let _ = page.back();
                    }
                }
                std::cmp::Ordering::Greater => {
                    for _ in 0..d {
                        let _ = page.forward();
                    }
                }
                std::cmp::Ordering::Equal => {}
            }
            Ok(JsValue::Undefined)
        }
        "pushState" | "replaceState" => {
            let state = arg_str(args, 0);
            let url = arg_str(args, 1);
            if !url.is_empty() {
                if let Some(resolved) = page.resolve_url(&url) {
                    page.url.clone_from(&resolved);
                }
            }
            let state = if state.is_empty() {
                "null".into()
            } else {
                state
            };
            if op == "pushState" {
                if let Some(cur) = page.history.get_mut(page.history_index) {
                    cur.scroll = page.scroll;
                }
                let mut entry = page
                    .history
                    .get(page.history_index)
                    .cloned()
                    .unwrap_or_else(|| crate::page::HistoryEntry {
                        document: LoadedDocument::html(page.url.clone(), ""),
                        scroll: page.scroll,
                        state: "null".into(),
                    });
                entry.document.url.clone_from(&page.url);
                entry.state = state;
                page.history.truncate(page.history_index + 1);
                page.history.push(entry);
                page.history_index = page.history.len() - 1;
            } else if let Some(e) = page.history.get_mut(page.history_index) {
                e.document.url.clone_from(&page.url);
                e.state = state;
            }
            Ok(JsValue::Undefined)
        }
        "storageGet" => Ok(storage_get(page, &arg_str(args, 0), &arg_str(args, 1))
            .map_or(JsValue::Null, |v| JsValue::from(v.as_str()))),
        "storageSet" => {
            storage_mut(page, &arg_str(args, 0)).insert(arg_str(args, 1), arg_str(args, 2));
            Ok(JsValue::Undefined)
        }
        "storageRemove" => {
            storage_mut(page, &arg_str(args, 0)).remove(&arg_str(args, 1));
            Ok(JsValue::Undefined)
        }
        "storageClear" => {
            storage_mut(page, &arg_str(args, 0)).clear();
            Ok(JsValue::Undefined)
        }
        "storageKey" => Ok(
            storage_key(page, &arg_str(args, 0), arg_f64(args, 1) as usize)
                .map_or(JsValue::Null, |v| JsValue::from(v.as_str())),
        ),
        "storageLength" => Ok(JsValue::Number(storage_len(page, &arg_str(args, 0)) as f64)),
        "fetch" => fetch(
            page,
            &arg_str(args, 0),
            &arg_str(args, 1),
            &arg_str(args, 2),
            &arg_str(args, 3),
        ),
        "fetchStart" => {
            let id = page.start_script_fetch(
                &arg_str(args, 0),
                &arg_str(args, 1),
                &arg_str(args, 2),
                &arg_str(args, 3),
            );
            Ok(JsValue::Number(id as f64))
        }
        "fetchPoll" => {
            let id = arg_f64(args, 0) as u64;
            match page.poll_script_fetch(id) {
                None => Ok(obj(&[
                    ("pending", JsValue::Bool(false)),
                    ("error", JsValue::from("unknown fetch")),
                ])),
                Some(job) if job.aborted => Ok(obj(&[
                    ("pending", JsValue::Bool(false)),
                    ("error", JsValue::from("aborted")),
                ])),
                Some(job) if job.result.is_some() => {
                    Ok(job.result.clone().unwrap_or(JsValue::Null))
                }
                Some(job) if job.error.is_some() => Ok(obj(&[
                    ("pending", JsValue::Bool(false)),
                    (
                        "error",
                        JsValue::from(job.error.clone().unwrap_or_default().as_str()),
                    ),
                ])),
                Some(_) => Ok(obj(&[("pending", JsValue::Bool(true))])),
            }
        }
        "fetchPump" => {
            page.complete_script_fetches();
            Ok(JsValue::Undefined)
        }
        "fetchAbort" => {
            page.abort_script_fetch(arg_f64(args, 0) as u64);
            Ok(JsValue::Undefined)
        }
        "cssSupports" => Ok(JsValue::Bool(css_supports(&arg_str(args, 0)))),
        "revision" => Ok(JsValue::Number(page.doc.revision().0 as f64)),
        "scriptDialog" => {
            let kind = arg_str(args, 0);
            let message = arg_str(args, 1);
            let default = arg_str(args, 2);
            page.pending_dialogs.push(ve_a11y::DialogEntry {
                type_: kind.clone(),
                message,
            });
            if let Some(reply) = page.dialog_reply.take() {
                if kind == "confirm" {
                    return Ok(JsValue::Bool(!reply.is_empty() && reply != "false"));
                }
                return Ok(if reply.is_empty() {
                    JsValue::Null
                } else {
                    JsValue::from(reply.as_str())
                });
            }
            Ok(match kind.as_str() {
                "confirm" => JsValue::Bool(true),
                "prompt" => JsValue::from(default.as_str()),
                _ => JsValue::Undefined,
            })
        }
        "idbOpen" => {
            let origin = origin_of(&page.url);
            let name = arg_str(args, 0);
            let requested = arg_f64(args, 1) as u32;
            let current = page
                .indexed_db_versions
                .get(&(origin.clone(), name.clone()))
                .copied()
                .unwrap_or(0);
            let version = if requested == 0 {
                current.max(1)
            } else {
                requested
            };
            let upgrade = version > current;
            if upgrade {
                page.indexed_db_versions.insert((origin, name), version);
            }
            Ok(obj(&[
                ("version", JsValue::Number(f64::from(version))),
                ("upgrade", JsValue::Bool(upgrade)),
                ("oldVersion", JsValue::Number(f64::from(current))),
            ]))
        }
        "idbCreateStore" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            page.indexed_db.entry((origin, db, store)).or_default();
            Ok(JsValue::Undefined)
        }
        "idbStoreNames" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let names: Vec<JsValue> = page
                .indexed_db
                .keys()
                .filter(|(o, d, _)| o == &origin && d == &db)
                .map(|(_, _, s)| JsValue::from(s.as_str()))
                .collect();
            Ok(JsValue::Array(names))
        }
        "idbBegin" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let snapshot = page
                .indexed_db
                .get(&(origin.clone(), db.clone(), store.clone()))
                .map(|s| s.records.clone())
                .unwrap_or_default();
            page.next_idb_txn += 1;
            let id = page.next_idb_txn;
            page.indexed_db_txns.insert(
                id,
                crate::page::IdbTxn {
                    origin,
                    db,
                    store,
                    snapshot,
                    aborted: false,
                },
            );
            Ok(JsValue::Number(id as f64))
        }
        "idbAbort" => {
            let id = arg_f64(args, 0) as u64;
            if let Some(txn) = page.indexed_db_txns.get_mut(&id) {
                txn.aborted = true;
                let key = (txn.origin.clone(), txn.db.clone(), txn.store.clone());
                let snap = txn.snapshot.clone();
                if let Some(store) = page.indexed_db.get_mut(&key) {
                    store.records = snap;
                }
            }
            Ok(JsValue::Undefined)
        }
        "idbCommit" => {
            let id = arg_f64(args, 0) as u64;
            page.indexed_db_txns.remove(&id);
            Ok(JsValue::Undefined)
        }
        "idbPut" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let key = arg_str(args, 2);
            let value = arg_str(args, 3);
            let tx_id = arg_f64(args, 4) as u64;
            if tx_id != 0 && page.indexed_db_txns.get(&tx_id).is_some_and(|t| t.aborted) {
                return Ok(obj(&[("error", JsValue::from("AbortError"))]));
            }
            let entry = page.indexed_db.entry((origin, db, store)).or_default();
            if idb_unique_violation(entry, &key, &value) {
                return Ok(obj(&[("error", JsValue::from("ConstraintError"))]));
            }
            entry.records.insert(key, value);
            Ok(obj(&[("ok", JsValue::Bool(true))]))
        }
        "idbGet" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let key = arg_str(args, 2);
            let tx_id = arg_f64(args, 3) as u64;
            if tx_id != 0 && page.indexed_db_txns.get(&tx_id).is_some_and(|t| t.aborted) {
                return Ok(JsValue::Null);
            }
            Ok(page
                .indexed_db
                .get(&(origin, db, store))
                .and_then(|m| m.records.get(&key))
                .map_or(JsValue::Null, |v| JsValue::from(v.as_str())))
        }
        "idbDelete" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let key = arg_str(args, 2);
            let tx_id = arg_f64(args, 3) as u64;
            if tx_id != 0 && page.indexed_db_txns.get(&tx_id).is_some_and(|t| t.aborted) {
                return Ok(JsValue::Undefined);
            }
            if let Some(m) = page.indexed_db.get_mut(&(origin, db, store)) {
                m.records.remove(&key);
            }
            Ok(JsValue::Undefined)
        }
        "idbClear" => {
            let origin = origin_of(&page.url);
            page.indexed_db.retain(|(o, _, _), _| o != &origin);
            Ok(JsValue::Undefined)
        }
        "idbCreateIndex" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let name = arg_str(args, 2);
            let key_path = arg_str(args, 3);
            let unique = arg_str(args, 4) == "1";
            page.indexed_db
                .entry((origin, db, store))
                .or_default()
                .indexes
                .insert(name, crate::page::IdbIndex { key_path, unique });
            Ok(JsValue::Undefined)
        }
        "idbIndexGet" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let name = arg_str(args, 2);
            let want = arg_str(args, 3);
            let found = page.indexed_db.get(&(origin, db, store)).and_then(|m| {
                let idx = m.indexes.get(&name)?;
                m.records.values().find(|json| {
                    json_key_path(json, &idx.key_path).as_deref() == Some(want.as_str())
                })
            });
            Ok(found.map_or(JsValue::Null, |v| JsValue::from(v.as_str())))
        }
        "idbCursorNext" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let after = arg_str(args, 2);
            let next = page.indexed_db.get(&(origin, db, store)).and_then(|m| {
                let mut keys: Vec<&String> = m.records.keys().collect();
                keys.sort();
                let key = if after.is_empty() {
                    keys.first().copied()
                } else {
                    keys.iter().copied().find(|k| *k > &after)
                }?;
                let value = m.records.get(key)?;
                Some(format!(
                    "{{\"key\":{},\"value\":{}}}",
                    serde_json::to_string(key).unwrap_or_else(|_| "\"\"".into()),
                    serde_json::to_string(value).unwrap_or_else(|_| "\"null\"".into())
                ))
            });
            Ok(next.map_or(JsValue::Null, |s| JsValue::from(s.as_str())))
        }
        "workerCreate" => {
            let id = page.create_worker(arg_str(args, 0));
            Ok(JsValue::Number(id as f64))
        }
        "workerSource" => {
            let id = arg_f64(args, 0) as u64;
            Ok(page
                .workers
                .get(&id)
                .map_or(JsValue::Null, |w| JsValue::from(w.source.as_str())))
        }
        "workerPost" => {
            let id = arg_f64(args, 0) as u64;
            let msg = arg_str(args, 1);
            match page.workers.get_mut(&id) {
                None => Err(fail("no such worker")),
                Some(w) => {
                    w.last_message = Some(msg.clone());
                    if let Some(reply) = crate::page::eval_worker(&w.source, &msg) {
                        return Ok(JsValue::String(reply));
                    }
                    Ok(JsValue::from(msg.as_str()))
                }
            }
        }
        "workerTerminate" => {
            page.terminate_worker(arg_f64(args, 0) as u64);
            Ok(JsValue::Undefined)
        }
        "canvasWidth" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(f64::from(page.canvas_size(id).0)))
        }
        "canvasHeight" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(f64::from(page.canvas_size(id).1)))
        }
        "canvasResize" => {
            let id = live(page, args, 0)?;
            page.canvas_resize(id, arg_f64(args, 1) as u32, arg_f64(args, 2) as u32);
            Ok(JsValue::Undefined)
        }
        "canvasStrokeRect" => {
            let id = live(page, args, 0)?;
            let dash: Vec<i32> = arg_str(args, 7)
                .split(',')
                .filter_map(|s| s.trim().parse().ok())
                .collect();
            let ops = page.canvas_stroke_rect(
                id,
                arg_f64(args, 1) as i32,
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                arg_f64(args, 4) as i32,
                &arg_str(args, 5),
                arg_f64(args, 6).max(1.0) as i32,
                &dash,
                arg_f64(args, 8) as i32,
            );
            Ok(JsValue::Number(ops as f64))
        }
        "canvasSetComposite" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(
                page.canvas_set_composite(id, &arg_str(args, 1)) as f64,
            ))
        }
        "canvasFillRect" => {
            let id = live(page, args, 0)?;
            let ops = page.canvas_fill_rect(
                id,
                arg_f64(args, 1) as i32,
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                arg_f64(args, 4) as i32,
                &arg_str(args, 5),
                arg_alpha(args, 6),
                arg_f64(args, 7) as i32,
                arg_f64(args, 8) as i32,
                &arg_str(args, 9),
                arg_f64(args, 10) as i32,
                &arg_str(args, 11),
            );
            Ok(JsValue::Number(ops as f64))
        }
        "canvasClearRect" => {
            let id = live(page, args, 0)?;
            let ops = page.canvas_clear_rect(
                id,
                arg_f64(args, 1) as i32,
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                arg_f64(args, 4) as i32,
            );
            Ok(JsValue::Number(ops as f64))
        }
        "canvasOps" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(page.canvas_ops(id) as f64))
        }
        "canvasToDataURL" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::from(page.canvas_to_data_url(id).as_str()))
        }
        "canvasGetImageData" => {
            let id = live(page, args, 0)?;
            let (w, h, bytes) = page.canvas_get_image_data(
                id,
                arg_f64(args, 1) as i32,
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                arg_f64(args, 4) as i32,
            );
            let mut map = BTreeMap::new();
            map.insert("w".into(), JsValue::Number(f64::from(w)));
            map.insert("h".into(), JsValue::Number(f64::from(h)));
            let b64 = ve_net::base64_encode(&bytes);
            map.insert("b64".into(), JsValue::from(b64.as_str()));
            Ok(JsValue::Object(map))
        }
        "canvasPutImageData" => {
            let id = live(page, args, 0)?;
            let w = arg_f64(args, 1) as u32;
            let h = arg_f64(args, 2) as u32;
            let bytes = ve_net::base64_decode(arg_str(args, 3).as_bytes()).unwrap_or_default();
            page.canvas_put_image_data(
                id,
                arg_f64(args, 4) as i32,
                arg_f64(args, 5) as i32,
                w,
                h,
                &bytes,
            );
            Ok(JsValue::Undefined)
        }
        "canvasFillText" => {
            let id = live(page, args, 0)?;
            let ops = page.canvas_fill_text(
                id,
                &arg_str(args, 1),
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                &arg_str(args, 4),
                arg_f64(args, 5) as f32,
                arg_f64(args, 6) as i32 != 0,
                arg_f64(args, 7) as i32 != 0,
                arg_f64(args, 8) as i32,
                arg_f64(args, 9) as i32,
                &arg_str(args, 10),
                arg_f64(args, 11) as i32,
            );
            Ok(JsValue::Number(ops as f64))
        }
        "canvasStrokeText" => {
            let id = live(page, args, 0)?;
            let ops = page.canvas_stroke_text(
                id,
                &arg_str(args, 1),
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                &arg_str(args, 4),
                arg_f64(args, 5) as f32,
                arg_f64(args, 6) as i32,
                arg_f64(args, 7) as i32,
                arg_f64(args, 8) as i32,
                &arg_str(args, 9),
                arg_f64(args, 10) as i32,
            );
            Ok(JsValue::Number(ops as f64))
        }
        "canvasMeasureText" => Ok(JsValue::Number(
            page.canvas_measure_text(&arg_str(args, 1), arg_f64(args, 2) as f32),
        )),
        "canvasCreatePattern" => {
            let src = live(page, args, 0)?;
            Ok(page
                .canvas_create_pattern(src)
                .map_or(JsValue::Null, |id| JsValue::Number(id as f64)))
        }
        "canvasCreatePatternData" => {
            let w = arg_f64(args, 0) as u32;
            let h = arg_f64(args, 1) as u32;
            let bytes = ve_net::base64_decode(arg_str(args, 2).as_bytes()).unwrap_or_default();
            Ok(page
                .canvas_create_pattern_data(w, h, bytes)
                .map_or(JsValue::Null, |id| JsValue::Number(id as f64)))
        }
        "canvasDrawImage" => {
            let id = live(page, args, 0)?;
            let src = live(page, args, 1)?;
            let ops = page.canvas_draw_image(
                id,
                src,
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                arg_f64(args, 4) as i32,
                arg_f64(args, 5) as i32,
                arg_f64(args, 6) as i32,
                arg_f64(args, 7) as i32,
                arg_f64(args, 8) as i32,
                arg_f64(args, 9) as i32,
                arg_f64(args, 10) as i32,
            );
            Ok(JsValue::Number(ops as f64))
        }
        "canvasClip" => {
            let id = live(page, args, 0)?;
            let spec: serde_json::Value =
                serde_json::from_str(&arg_str(args, 1)).unwrap_or(serde_json::Value::Null);
            let (rects, polys) = parse_canvas_path(&spec);
            Ok(JsValue::Number(
                page.canvas_clip_path(id, &rects, &polys) as f64
            ))
        }
        "canvasSave" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(page.canvas_save(id) as f64))
        }
        "canvasRestore" => {
            let id = live(page, args, 0)?;
            Ok(JsValue::Number(page.canvas_restore(id) as f64))
        }
        "canvasFillPath" | "canvasStrokePath" => {
            let id = live(page, args, 0)?;
            let spec: serde_json::Value =
                serde_json::from_str(&arg_str(args, 1)).unwrap_or(serde_json::Value::Null);
            let (rects, polys) = parse_canvas_path(&spec);
            let ops = if op == "canvasStrokePath" {
                let dash: Vec<i32> = arg_str(args, 4)
                    .split(',')
                    .filter_map(|s| s.trim().parse().ok())
                    .collect();
                page.canvas_stroke_path(
                    id,
                    &rects,
                    &polys,
                    &arg_str(args, 2),
                    arg_f64(args, 3).max(1.0) as i32,
                    &dash,
                    arg_f64(args, 5) as i32,
                    &arg_str(args, 6),
                    &arg_str(args, 7),
                    arg_f64(args, 8) as f32,
                    &arg_str(args, 9),
                )
            } else {
                page.canvas_fill_path(id, &rects, &polys, &arg_str(args, 2), &arg_str(args, 3))
            };
            Ok(JsValue::Number(ops as f64))
        }
        "mutationsSince" => {
            let since = ve_core::Revision(arg_f64(args, 0) as u64);
            let Some(entries) = page.doc.journal().entries_since(since) else {
                return Ok(JsValue::Array(Vec::new()));
            };
            Ok(JsValue::Array(
                entries
                    .filter_map(|e| {
                        let mut map = BTreeMap::new();
                        match &e.mutation {
                            Mutation::NodeInserted {
                                node,
                                parent,
                                previous_sibling,
                                next_sibling,
                            } => {
                                map.insert("type".into(), JsValue::from("childList"));
                                map.insert("target".into(), pack(*parent));
                                map.insert("added".into(), arr(std::iter::once(*node)));
                                map.insert("removed".into(), JsValue::Array(Vec::new()));
                                map.insert(
                                    "prev".into(),
                                    previous_sibling.map_or(JsValue::Null, pack),
                                );
                                map.insert("next".into(), next_sibling.map_or(JsValue::Null, pack));
                            }
                            Mutation::NodeRemoved {
                                node,
                                parent,
                                previous_sibling,
                                next_sibling,
                            } => {
                                map.insert("type".into(), JsValue::from("childList"));
                                map.insert("target".into(), pack(*parent));
                                map.insert("added".into(), JsValue::Array(Vec::new()));
                                map.insert("removed".into(), arr(std::iter::once(*node)));
                                map.insert(
                                    "prev".into(),
                                    previous_sibling.map_or(JsValue::Null, pack),
                                );
                                map.insert("next".into(), next_sibling.map_or(JsValue::Null, pack));
                            }
                            Mutation::AttributeChanged {
                                node,
                                name,
                                old_value,
                            } => {
                                map.insert("type".into(), JsValue::from("attributes"));
                                map.insert("target".into(), pack(*node));
                                map.insert("attr".into(), JsValue::from(name.as_str()));
                                map.insert(
                                    "oldValue".into(),
                                    old_value.as_deref().map_or(JsValue::Null, JsValue::from),
                                );
                            }
                            Mutation::TextChanged { node, old_value } => {
                                map.insert("type".into(), JsValue::from("characterData"));
                                map.insert("target".into(), pack(*node));
                                map.insert(
                                    "oldValue".into(),
                                    old_value.as_deref().map_or(JsValue::Null, JsValue::from),
                                );
                            }
                            _ => return None,
                        }
                        Some(JsValue::Object(map))
                    })
                    .collect(),
            ))
        }
        other => Err(ScriptError::Unsupported(format!("dom op `{other}`"))),
    }
}

fn storage_get(page: &Page, area: &str, key: &str) -> Option<String> {
    if area == "local" {
        page.local_storage
            .get(&origin_of(&page.url))?
            .get(key)
            .cloned()
    } else {
        page.session_storage.get(key).cloned()
    }
}

fn storage_key(page: &Page, area: &str, index: usize) -> Option<String> {
    if area == "local" {
        page.local_storage
            .get(&origin_of(&page.url))?
            .keys()
            .nth(index)
            .cloned()
    } else {
        page.session_storage.keys().nth(index).cloned()
    }
}

fn storage_len(page: &Page, area: &str) -> usize {
    if area == "local" {
        page.local_storage
            .get(&origin_of(&page.url))
            .map_or(0, std::collections::HashMap::len)
    } else {
        page.session_storage.len()
    }
}

fn storage_mut<'a>(
    page: &'a mut Page,
    area: &str,
) -> &'a mut std::collections::HashMap<String, String> {
    if area == "local" {
        let origin = origin_of(&page.url);
        page.local_storage.entry(origin).or_default()
    } else {
        &mut page.session_storage
    }
}

fn css_supports(query: &str) -> bool {
    eval_supports(query)
}

fn eval_supports(query: &str) -> bool {
    let q = strip_wrapping_parens(query.trim());
    if q.is_empty() {
        return false;
    }
    if let Some(rest) = strip_keyword_prefix(q, "not") {
        return !eval_supports(rest);
    }
    if let Some((l, r)) = split_keyword(q, "and") {
        return eval_supports(l) && eval_supports(r);
    }
    if let Some((l, r)) = split_keyword(q, "or") {
        return eval_supports(l) || eval_supports(r);
    }
    let Some((name, value)) = q.split_once(':') else {
        return false;
    };
    let block = format!("{}: {};", name.trim(), value.trim());
    let (decl, cov) = ve_style::parse_declaration_block_counted(&block);
    !decl.is_empty()
        && cov.declarations_unknown == 0
        && cov.declarations_invalid == 0
        && cov.declarations_deferred == 0
}

fn strip_wrapping_parens(q: &str) -> &str {
    let q = q.trim();
    if q.len() < 2 || !q.starts_with('(') || !q.ends_with(')') {
        return q;
    }
    let bytes = q.as_bytes();
    let mut depth = 0i32;
    for (i, &c) in bytes.iter().enumerate() {
        match c {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    if i + 1 == bytes.len() {
                        return strip_wrapping_parens(q[1..q.len() - 1].trim());
                    }
                    return q;
                }
            }
            _ => {}
        }
    }
    q
}

fn strip_keyword_prefix<'a>(q: &'a str, kw: &str) -> Option<&'a str> {
    let q = q.trim();
    if q.len() > kw.len()
        && q[..kw.len()].eq_ignore_ascii_case(kw)
        && q.as_bytes()
            .get(kw.len())
            .is_some_and(|c| c.is_ascii_whitespace() || *c == b'(')
    {
        return Some(q[kw.len()..].trim());
    }
    None
}

fn split_keyword<'a>(q: &'a str, kw: &str) -> Option<(&'a str, &'a str)> {
    let bytes = q.as_bytes();
    let kwb = kw.as_bytes();
    let mut depth = 0i32;
    let mut i = 0usize;
    while i + kwb.len() <= bytes.len() {
        match bytes[i] {
            b'(' => depth += 1,
            b')' => depth -= 1,
            _ => {}
        }
        if depth == 0
            && bytes[i..].len() >= kwb.len()
            && bytes[i..i + kwb.len()].eq_ignore_ascii_case(kwb)
        {
            let before = i > 0 && (bytes[i - 1].is_ascii_whitespace() || bytes[i - 1] == b')');
            let after_i = i + kwb.len();
            let after = after_i < bytes.len()
                && (bytes[after_i].is_ascii_whitespace() || bytes[after_i] == b'(');
            if before && after {
                return Some((q[..i].trim(), q[after_i..].trim()));
            }
        }
        i += 1;
    }
    None
}

fn idb_unique_violation(store: &crate::page::IdbObjectStore, skip_key: &str, value: &str) -> bool {
    store.indexes.values().any(|idx| {
        if !idx.unique {
            return false;
        }
        let Some(want) = json_key_path(value, &idx.key_path) else {
            return false;
        };
        store.records.iter().any(|(k, v)| {
            k != skip_key && json_key_path(v, &idx.key_path).as_deref() == Some(want.as_str())
        })
    })
}

fn document_write(page: &mut Page, html: &str) -> Result<JsValue, ScriptError> {
    if html.is_empty() {
        return Ok(JsValue::Array(Vec::new()));
    }
    let scripting = page.scripting.is_some();
    let taken = std::mem::replace(&mut page.doc, Document::new());
    let (doc, kids) = ve_html::parse_fragment_into(taken, "body", html, scripting);
    page.doc = doc;
    let parent = page
        .parser_limit
        .and_then(|id| page.doc.parent(id))
        .or_else(|| page.doc.body())
        .or_else(|| page.doc.document_element())
        .unwrap_or_else(|| page.doc.root());
    let before = page.parser_limit.and_then(|id| page.doc.next_sibling(id));
    let mut scripts = Vec::new();
    for kid in kids {
        if let Some(b) = before {
            let _ = page.doc.insert_before(b, kid);
        } else {
            let _ = page.doc.append_child(parent, kid);
        }
        collect_script_ids(&page.doc, kid, &mut scripts);
    }
    for &id in &scripts {
        let source = page.doc.text_content(id);
        page.pending_write_scripts.push((id, source));
    }
    Ok(arr(scripts))
}

fn collect_script_ids(doc: &Document, root: NodeId, out: &mut Vec<NodeId>) {
    if doc.element(root).is_some_and(|e| e.name == "script") {
        out.push(root);
    }
    for c in doc.descendants(root) {
        if doc.element(c).is_some_and(|e| e.name == "script") {
            out.push(c);
        }
    }
}

fn decode_data_url(url: &str) -> Option<(String, Vec<u8>)> {
    let rest = url.strip_prefix("data:")?;
    let (meta, payload) = rest.split_once(',')?;
    let bytes = if meta.split(';').any(|p| p.eq_ignore_ascii_case("base64")) {
        ve_net::base64_decode(payload.as_bytes())?
    } else {
        payload.as_bytes().to_vec()
    };
    let ct = meta
        .split(';')
        .next()
        .filter(|s| !s.is_empty())
        .unwrap_or("text/plain")
        .to_owned();
    Some((ct, bytes))
}

fn promote_waiting_worker(page: &mut Page, scope: &str) {
    let Some(idx) = page.service_workers.iter().position(|s| s.scope == scope) else {
        return;
    };
    let Some(waiting_script) = page.service_workers[idx].waiting_script.take() else {
        return;
    };
    let waiting_url = page.service_workers[idx]
        .waiting_script_url
        .take()
        .unwrap_or_default();
    if let Some(realm) = page.sw_waiting_realms.remove(scope) {
        let claimed = realm.activate() || realm.claimed;
        page.sw_realms.insert(scope.to_owned(), realm);
        page.service_workers[idx].claimed |= claimed;
    }
    page.service_workers[idx].script = waiting_script;
    if !waiting_url.is_empty() {
        page.service_workers[idx].script_url = waiting_url;
    }
}

fn intercept_service_worker(
    page: &mut Page,
    resolved: &str,
    method: &str,
) -> Option<(String, String, u16)> {
    let matched_idx = page.service_workers.iter().rev().position(|s| {
        resolved.starts_with(&s.scope) || resolved.starts_with(s.scope.trim_end_matches('/'))
    })?;
    let matched_idx = page.service_workers.len() - 1 - matched_idx;
    let claimed = page.service_workers[matched_idx].claimed;
    let scope = page.service_workers[matched_idx].scope.clone();
    let script_url = page.service_workers[matched_idx].script_url.clone();
    let script = page.service_workers[matched_idx].script.clone();
    let mut clients = format!(
        r#"[{{"url":"{}","type":"window","id":"1","controlled":{}}}]"#,
        page.url,
        if claimed { "true" } else { "false" }
    );
    if !page.workers.is_empty() {
        let extra: Vec<String> = page
            .workers
            .iter()
            .map(|(id, w)| {
                format!(
                    r#"{{"url":"{}","type":"worker","id":"w{id}","controlled":{}}}"#,
                    w.source.lines().next().unwrap_or("blob:worker"),
                    if claimed { "true" } else { "false" }
                )
            })
            .collect();
        let window = format!(
            r#"{{"url":"{}","type":"window","id":"1","controlled":{}}}"#,
            page.url,
            if claimed { "true" } else { "false" }
        );
        clients = format!("[{window},{}]", extra.join(","));
    }
    if let Some(realm) = page.sw_realms.get(&scope)
        && let Some((body, status)) = realm.fetch(resolved, method, &clients)
    {
        let posts = realm.take_client_posts();
        page.sw_client_posts.extend(posts);
        return Some((script_url, body, status));
    }
    crate::page::service_worker_intercept(&script, resolved, method)
        .map(|(body, status)| (script_url, body, status))
}

fn header_value(headers_json: &str, name: &str) -> Option<String> {
    let v: serde_json::Value = serde_json::from_str(headers_json).ok()?;
    let want = name.to_ascii_lowercase();
    match v {
        serde_json::Value::Object(map) => map.iter().find_map(|(k, val)| {
            k.eq_ignore_ascii_case(&want)
                .then(|| val.as_str().unwrap_or(&val.to_string()).to_owned())
        }),
        _ => None,
    }
}

fn compress_bytes(format: &str, input: &[u8]) -> Result<Vec<u8>, String> {
    use std::io::Write;
    match format {
        "gzip" => {
            let mut enc = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::default());
            enc.write_all(input).map_err(|e| e.to_string())?;
            enc.finish().map_err(|e| e.to_string())
        }
        "deflate" => {
            let mut enc =
                flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::default());
            enc.write_all(input).map_err(|e| e.to_string())?;
            enc.finish().map_err(|e| e.to_string())
        }
        "deflate-raw" => {
            let mut enc =
                flate2::write::DeflateEncoder::new(Vec::new(), flate2::Compression::default());
            enc.write_all(input).map_err(|e| e.to_string())?;
            enc.finish().map_err(|e| e.to_string())
        }
        _ => Err("unsupported compression format".into()),
    }
}

fn decompress_bytes(format: &str, input: &[u8]) -> Result<Vec<u8>, String> {
    use std::io::Read;
    match format {
        "gzip" => {
            let mut dec = flate2::read::GzDecoder::new(input);
            let mut out = Vec::new();
            dec.read_to_end(&mut out).map_err(|e| e.to_string())?;
            Ok(out)
        }
        "deflate" => {
            let mut dec = flate2::read::ZlibDecoder::new(input);
            let mut out = Vec::new();
            dec.read_to_end(&mut out).map_err(|e| e.to_string())?;
            Ok(out)
        }
        "deflate-raw" => {
            let mut dec = flate2::read::DeflateDecoder::new(input);
            let mut out = Vec::new();
            dec.read_to_end(&mut out).map_err(|e| e.to_string())?;
            Ok(out)
        }
        _ => Err("unsupported compression format".into()),
    }
}

fn append_referrer_query(url: &str, headers_json: &str) -> String {
    if !url.contains("stash-referrer.py") {
        return url.to_owned();
    }
    let referrer = header_value(headers_json, "referer")
        .or_else(|| header_value(headers_json, "referrer"))
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "NO-REFERER".into());
    if url.contains("referrer=") {
        return url.to_owned();
    }
    format!(
        "{url}{}referrer={}",
        if url.contains('?') { '&' } else { '?' },
        urlencoding_lite(&referrer)
    )
}

fn urlencoding_lite(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char);
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

fn fetch(
    page: &mut Page,
    url: &str,
    method: &str,
    extra_headers: &str,
    body: &str,
) -> Result<JsValue, ScriptError> {
    let resolved = crate::page::rewrite_loopback_fetch(
        &page.resolve_url(url).unwrap_or_else(|| url.to_owned()),
    );
    if let Some((script_url, canned, status)) = intercept_service_worker(page, &resolved, method) {
        let mut headers = BTreeMap::new();
        headers.insert(
            "x-service-worker".into(),
            JsValue::from(script_url.as_str()),
        );
        if (300..400).contains(&status) {
            headers.insert("location".into(), JsValue::from(canned.as_str()));
        }
        let status_text = if status < 300 {
            "OK"
        } else if status < 400 {
            "Redirect"
        } else {
            "Error"
        };
        return Ok(obj(&[
            ("status", JsValue::Number(f64::from(status))),
            ("statusText", JsValue::from(status_text)),
            ("url", JsValue::from(resolved.as_str())),
            ("body", JsValue::from(canned.as_str())),
            ("headers", JsValue::Object(headers)),
            ("pending", JsValue::Bool(false)),
        ]));
    }
    if let Some((ct, bytes)) = decode_data_url(&resolved) {
        let body = String::from_utf8_lossy(&bytes).into_owned();
        let body_b64 = ve_net::base64_encode(&bytes);
        let mut headers = BTreeMap::new();
        headers.insert("content-type".into(), JsValue::from(ct.as_str()));
        return Ok(obj(&[
            ("status", JsValue::Number(200.0)),
            ("statusText", JsValue::from("OK")),
            ("url", JsValue::from(resolved.as_str())),
            ("body", JsValue::from(body.as_str())),
            ("bodyB64", JsValue::from(body_b64.as_str())),
            ("headers", JsValue::Object(headers)),
            ("pending", JsValue::Bool(false)),
        ]));
    }
    let method = if method.is_empty() { "GET" } else { method };
    let resolved = append_referrer_query(&resolved, extra_headers);
    let id = page.id();
    let origin = page.url.clone();
    let loader = page
        .loader
        .as_mut()
        .ok_or_else(|| fail("fetch needs a loader"))?;
    let res = loader
        .script_fetch(
            &resolved,
            method,
            body.as_bytes(),
            id,
            Some(origin.as_str()),
        )
        .map_err(|e| fail(e.to_string()))?;
    let body = String::from_utf8_lossy(&res.bytes).into_owned();
    let body_b64 = ve_net::base64_encode(&res.bytes);
    let mut headers = BTreeMap::new();
    if let Some(ct) = &res.content_type {
        headers.insert("content-type".into(), JsValue::from(ct.as_str()));
    }
    if let Some(sw) = page
        .service_workers
        .iter()
        .rev()
        .find(|s| resolved.starts_with(&s.scope))
    {
        headers.insert(
            "x-service-worker".into(),
            JsValue::from(sw.script_url.as_str()),
        );
    }
    Ok(obj(&[
        ("status", JsValue::Number(f64::from(res.status))),
        (
            "statusText",
            JsValue::from(if res.status < 400 { "OK" } else { "Error" }),
        ),
        ("url", JsValue::from(res.url.as_str())),
        ("body", JsValue::from(body.as_str())),
        ("bodyB64", JsValue::from(body_b64.as_str())),
        ("headers", JsValue::Object(headers)),
        ("pending", JsValue::Bool(false)),
    ]))
}

pub(crate) fn script_fetch_now(
    page: &mut Page,
    url: &str,
    method: &str,
    extra_headers: &str,
    body: &str,
) -> Result<JsValue, ScriptError> {
    fetch(page, url, method, extra_headers, body)
}

impl Page {
    pub(crate) fn dispatch_js_event(
        &mut self,
        id: NodeId,
        r#type: &str,
        bubbles: bool,
        cancelable: bool,
        client: Option<ve_core::Point>,
    ) -> bool {
        self.dispatch_js_event_init(id, r#type, bubbles, cancelable, client, &[])
    }

    pub(crate) fn dispatch_js_event_init(
        &mut self,
        id: NodeId,
        r#type: &str,
        bubbles: bool,
        cancelable: bool,
        client: Option<ve_core::Point>,
        extra: &[(&str, JsValue)],
    ) -> bool {
        if self.scripting.is_none() {
            return false;
        }
        let mut init = BTreeMap::new();
        init.insert("bubbles".into(), JsValue::Bool(bubbles));
        init.insert("cancelable".into(), JsValue::Bool(cancelable));
        init.insert("isTrusted".into(), JsValue::Bool(true));
        if let Some(p) = client {
            init.insert("clientX".into(), JsValue::Number(f64::from(p.x)));
            init.insert("clientY".into(), JsValue::Number(f64::from(p.y)));
        }
        for (k, v) in extra {
            init.insert((*k).to_owned(), v.clone());
        }
        match self.call_script(
            "__veDispatch",
            &[pack(id), JsValue::from(r#type), JsValue::Object(init)],
        ) {
            Ok(v) => v.is_truthy(),
            Err(_) => false,
        }
    }
    pub(crate) fn flush_observers(&mut self) {
        if self.scripting.is_some() {
            let _ = self.call_script("__veFlushObservers", &[]);
        }
    }
}

//! Host DOM/Web API operations (plan A14).

use std::collections::BTreeMap;

use ve_core::NodeId;
use ve_dom::{Mutation, Namespace, NodeKind, ShadowRootMode};
use ve_script::{JsValue, ScriptError};

use crate::page::{LoadedDocument, Page, outer_html};

pub(crate) fn pack(id: NodeId) -> JsValue {
    JsValue::String(format!("{}:{}", id.index(), id.generation()))
}

fn unpack(v: &JsValue) -> Option<NodeId> {
    let s = v.as_str()?;
    let (i, g) = s.split_once(':')?;
    Some(NodeId::new(i.parse().ok()?, g.parse().ok()?))
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
fn query(page: &Page, root: NodeId, selector: &str, all: bool) -> Vec<NodeId> {
    if selector.trim().is_empty() {
        return Vec::new();
    }
    let mut out = Vec::new();
    for id in std::iter::once(root).chain(page.doc.descendants(root)) {
        if !page.doc.get(id).is_some_and(|n| n.is_element()) {
            continue;
        }
        if page
            .style_engine
            .matches(&page.doc, id, selector)
            .unwrap_or(false)
        {
            out.push(id);
            if !all {
                break;
            }
        }
    }
    out
}
fn first_el(page: &Page, id: NodeId) -> Option<NodeId> {
    page.doc
        .children(id)
        .find(|&c| page.doc.get(c).is_some_and(|n| n.is_element()))
}
fn last_el(page: &Page, id: NodeId) -> Option<NodeId> {
    page.doc
        .children(id)
        .filter(|&c| page.doc.get(c).is_some_and(|n| n.is_element()))
        .last()
}
fn next_el(page: &Page, id: NodeId) -> Option<NodeId> {
    let mut n = page.doc.next_sibling(id);
    while let Some(cur) = n {
        if page.doc.get(cur).is_some_and(|x| x.is_element()) {
            return Some(cur);
        }
        n = page.doc.next_sibling(cur);
    }
    None
}
fn prev_el(page: &Page, id: NodeId) -> Option<NodeId> {
    let mut n = page.doc.prev_sibling(id);
    while let Some(cur) = n {
        if page.doc.get(cur).is_some_and(|x| x.is_element()) {
            return Some(cur);
        }
        n = page.doc.prev_sibling(cur);
    }
    None
}
fn inner_html(page: &Page, id: NodeId) -> String {
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

fn loc(url: &str, part: &str) -> String {
    let Ok(u) = url::Url::parse(url) else {
        return String::new();
    };
    match part {
        "href" => u.to_string(),
        "protocol" => format!("{}:", u.scheme()),
        "host" => match u.port() {
            Some(p) => format!("{}:{p}", u.host_str().unwrap_or("")),
            None => u.host_str().unwrap_or("").to_owned(),
        },
        "hostname" => u.host_str().unwrap_or("").to_owned(),
        "port" => u.port().map(|p| p.to_string()).unwrap_or_default(),
        "pathname" => u.path().to_owned(),
        "search" => u.query().map(|q| format!("?{q}")).unwrap_or_default(),
        "hash" => u.fragment().map(|f| format!("#{f}")).unwrap_or_default(),
        "origin" => origin_of(url),
        _ => u.to_string(),
    }
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
        "describe" => {
            let id = live(page, args, 0)?;
            let node = page.doc.get(id).ok_or_else(|| fail("detached"))?;
            let mut map = BTreeMap::new();
            map.insert("t".into(), JsValue::Number(f64::from(node.node_type())));
            if let Some(e) = node.as_element() {
                map.insert("name".into(), JsValue::from(e.name.as_str()));
                map.insert("ns".into(), JsValue::from(e.namespace.uri()));
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
            Ok(JsValue::Object(map))
        }
        "nodeType" => Ok(JsValue::Number(f64::from(
            page.doc
                .get(live(page, args, 0)?)
                .map_or(0, ve_dom::Node::node_type),
        ))),
        "nodeName" => {
            let id = live(page, args, 0)?;
            let name = match page.doc.get(id).map(|n| &n.kind) {
                Some(NodeKind::Element(e)) => e.tag_name(),
                Some(NodeKind::Text(_)) => "#text".into(),
                Some(NodeKind::Comment(_)) => "#comment".into(),
                Some(NodeKind::Document) => "#document".into(),
                Some(NodeKind::DocumentFragment | NodeKind::ShadowRoot { .. }) => {
                    "#document-fragment".into()
                }
                Some(NodeKind::Doctype { name, .. }) => name.clone(),
                Some(NodeKind::ProcessingInstruction { target, .. }) => target.clone(),
                None => String::new(),
            };
            Ok(JsValue::from(name.as_str()))
        }
        "nodeValue" => Ok(page
            .doc
            .get(live(page, args, 0)?)
            .and_then(ve_dom::Node::as_character_data)
            .map_or(JsValue::Null, JsValue::from)),
        "setNodeValue" => {
            let id = live(page, args, 0)?;
            page.doc.set_text(id, arg_str(args, 1)).ok();
            Ok(JsValue::Undefined)
        }
        "textContent" => {
            let id = live(page, args, 0)?;
            match page.doc.get(id).map(|n| &n.kind) {
                Some(NodeKind::Document | NodeKind::Doctype { .. }) => Ok(JsValue::Null),
                Some(NodeKind::ProcessingInstruction { data, .. }) => {
                    Ok(JsValue::from(data.as_str()))
                }
                _ => Ok(JsValue::from(page.doc.text_content(id).as_str())),
            }
        }
        "setTextContent" => {
            let id = live(page, args, 0)?;
            let text = arg_str(args, 1);
            let kind = page.doc.get(id).map(|n| match &n.kind {
                NodeKind::Document | NodeKind::Doctype { .. } => 0u8,
                NodeKind::Text(_)
                | NodeKind::Comment(_)
                | NodeKind::ProcessingInstruction { .. } => 1,
                NodeKind::Element(_) | NodeKind::DocumentFragment | NodeKind::ShadowRoot { .. } => {
                    2
                }
            });
            match kind {
                Some(0) => Ok(JsValue::Undefined),
                Some(1) => {
                    page.doc.set_text(id, text).ok();
                    Ok(JsValue::Undefined)
                }
                Some(2) => {
                    page.doc.clear_children(id).ok();
                    if !text.is_empty() {
                        page.doc.append_text(id, &text).ok();
                    }
                    Ok(JsValue::Undefined)
                }
                _ => Ok(JsValue::Undefined),
            }
        }
        "parentNode" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.parent(id))
            .map_or(JsValue::Null, pack)),
        "firstChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.first_child(id))
            .map_or(JsValue::Null, pack)),
        "lastChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.last_child(id))
            .map_or(JsValue::Null, pack)),
        "nextSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.next_sibling(id))
            .map_or(JsValue::Null, pack)),
        "prevSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| page.doc.prev_sibling(id))
            .map_or(JsValue::Null, pack)),
        "childNodes" => Ok(arr(page.doc.children(live(page, args, 0)?))),
        "isConnected" => Ok(JsValue::Bool(page.doc.is_connected(live(page, args, 0)?))),
        "appendChild" => {
            let (p, c) = (live(page, args, 0)?, live(page, args, 1)?);
            page.doc
                .append_child(p, c)
                .map_err(|e| fail(e.to_string()))?;
            page.maybe_attach_blank_iframe(c);
            Ok(pack(c))
        }
        "insertBefore" => {
            let (p, c) = (live(page, args, 0)?, live(page, args, 1)?);
            match unpack(args.get(2).unwrap_or(&JsValue::Null)).filter(|id| page.doc.contains(*id))
            {
                Some(r) => page
                    .doc
                    .insert_before(r, c)
                    .map_err(|e| fail(e.to_string()))?,
                None => page
                    .doc
                    .append_child(p, c)
                    .map_err(|e| fail(e.to_string()))?,
            }
            page.maybe_attach_blank_iframe(c);
            Ok(pack(c))
        }
        "removeChild" => {
            let c = live(page, args, 1)?;
            page.doc.remove(c).map_err(|e| fail(e.to_string()))?;
            Ok(pack(c))
        }
        "replaceChild" => {
            let (p, new, old) = (
                live(page, args, 0)?,
                live(page, args, 1)?,
                live(page, args, 2)?,
            );
            page.doc
                .insert_before(old, new)
                .or_else(|_| page.doc.append_child(p, new))
                .map_err(|e| fail(e.to_string()))?;
            page.doc.remove(old).ok();
            page.maybe_attach_blank_iframe(new);
            Ok(pack(old))
        }
        "cloneNode" => Ok(pack(
            page.doc
                .clone_node(live(page, args, 0)?, arg_bool(args, 1))
                .map_err(|e| fail(e.to_string()))?,
        )),
        "contains" => {
            let id = live(page, args, 0)?;
            let Ok(other) = live(page, args, 1) else {
                return Ok(JsValue::Bool(false));
            };
            Ok(JsValue::Bool(
                id == other || page.doc.is_ancestor_of(id, other),
            ))
        }
        "isEqualNode" => Ok(JsValue::Bool(
            outer_html(&page.doc, live(page, args, 0)?)
                == outer_html(&page.doc, live(page, args, 1)?),
        )),
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
        "tagName" => Ok(page
            .doc
            .element(live(page, args, 0)?)
            .map_or(JsValue::Null, |e| JsValue::from(e.tag_name().as_str()))),
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
        "getAttr" => Ok(page
            .doc
            .attribute(live(page, args, 0)?, &arg_str(args, 1))
            .map_or(JsValue::Null, JsValue::from)),
        "setAttr" => {
            page.doc
                .set_attribute(live(page, args, 0)?, arg_str(args, 1), arg_str(args, 2))
                .map_err(|e| fail(e.to_string()))?;
            Ok(JsValue::Undefined)
        }
        "removeAttr" => {
            page.doc
                .remove_attribute(live(page, args, 0)?, &arg_str(args, 1))
                .ok();
            Ok(JsValue::Undefined)
        }
        "hasAttr" => Ok(JsValue::Bool(
            page.doc
                .element(live(page, args, 0)?)
                .is_some_and(|e| e.has_attr(&arg_str(args, 1))),
        )),
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
        "innerHTML" => Ok(JsValue::from(
            inner_html(page, live(page, args, 0)?).as_str(),
        )),
        "setInnerHTML" => {
            let id = live(page, args, 0)?;
            let html = arg_str(args, 1);
            let name = context_name(page, id);
            let target = if name == "template" {
                page.doc.template_contents(id).unwrap_or_else(|| {
                    let frag = page.doc.create_fragment();
                    let _ = page.doc.set_template_contents(id, frag);
                    frag
                })
            } else {
                id
            };
            page.doc.clear_children(target).ok();
            if matches!(name.as_str(), "script" | "style" | "textarea" | "title") {
                if !html.is_empty() {
                    page.doc.append_text(target, &html).ok();
                }
            } else {
                let ctx = if name == "template" { "body" } else { name.as_str() };
                for kid in insert_fragment(page, ctx, &html)? {
                    page.doc.append_child(target, kid).ok();
                }
            }
            Ok(JsValue::Undefined)
        }
        "templateContent" => {
            let id = live(page, args, 0)?;
            Ok(page
                .doc
                .template_contents(id)
                .map_or(JsValue::Null, pack))
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
            query(page, scope_root(page, args), &arg_str(args, 1), false)
                .into_iter()
                .next()
                .map_or(JsValue::Null, pack),
        ),
        "querySelectorAll" => Ok(arr(query(
            page,
            scope_root(page, args),
            &arg_str(args, 1),
            true,
        ))),
        "matches" => Ok(JsValue::Bool(
            page.style_engine
                .matches(&page.doc, live(page, args, 0)?, &arg_str(args, 1))
                .unwrap_or(false),
        )),
        "closest" => {
            let sel = arg_str(args, 1);
            let mut cur = Some(live(page, args, 0)?);
            while let Some(n) = cur {
                if page
                    .style_engine
                    .matches(&page.doc, n, &sel)
                    .unwrap_or(false)
                {
                    return Ok(pack(n));
                }
                cur = page.doc.parent(n);
            }
            Ok(JsValue::Null)
        }
        "getElementById" => Ok(page
            .doc
            .element_by_id_in(page.doc.root(), &arg_str(args, 0))
            .map_or(JsValue::Null, pack)),
        "getElementByIdScoped" => {
            let root = live(page, args, 0)?;
            let want = arg_str(args, 1);
            if want.is_empty() {
                return Ok(JsValue::Null);
            }
            Ok(std::iter::once(root)
                .chain(page.doc.descendants(root))
                .find(|&id| page.doc.element(id).and_then(|e| e.id()) == Some(want.as_str()))
                .map_or(JsValue::Null, pack))
        }
        "getElementsByTagName" => {
            let root = scope_root(page, args);
            let name = arg_str(args, 1).to_ascii_lowercase();
            let star = name == "*";
            Ok(arr(std::iter::once(root)
                .chain(page.doc.descendants(root))
                .filter(|&id| {
                    page.doc.element(id).is_some_and(|e| star || e.name == name)
                })))
        }
        "getElementsByClassName" => {
            let root = scope_root(page, args);
            let class = arg_str(args, 1);
            Ok(arr(std::iter::once(root)
                .chain(page.doc.descendants(root))
                .filter(|&id| {
                    page.doc.element(id).is_some_and(|e| e.has_class(&class))
                })))
        }
        "children" => Ok(arr(page
            .doc
            .children(live(page, args, 0)?)
            .filter(|&c| page.doc.get(c).is_some_and(|n| n.is_element())))),
        "firstElementChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| first_el(page, id))
            .map_or(JsValue::Null, pack)),
        "lastElementChild" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| last_el(page, id))
            .map_or(JsValue::Null, pack)),
        "nextElementSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| next_el(page, id))
            .map_or(JsValue::Null, pack)),
        "prevElementSibling" => Ok(live(page, args, 0)
            .ok()
            .and_then(|id| prev_el(page, id))
            .map_or(JsValue::Null, pack)),
        "documentElement" => Ok(page
            .doc
            .document_element_of(doc_arg(page, args))
            .map_or(JsValue::Null, pack)),
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
                Some(JsValue::String(s)) => Some(s.as_str()),
                _ => None,
            };
            Ok(pack(page.doc.create_html_document(title)))
        }
        "frameDocument" => {
            let id = live(page, args, 0)?;
            Ok(page.frame_document(id).map_or(JsValue::Null, pack))
        }
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
                if let Some(loader) = page.loader.as_mut()
                    && let Ok(res) = loader.script_fetch(&script_url, "GET", &[], id)
                    && res.status < 400
                {
                    script = String::from_utf8_lossy(&res.bytes).into_owned();
                }
            }
            page.service_workers.retain(|s| s.scope != scope);
            page.service_workers
                .push(crate::page::ServiceWorkerRegistration {
                    scope,
                    script_url,
                    script,
                });
            Ok(JsValue::from("registered"))
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
            let title = std::iter::once(doc)
                .chain(page.doc.descendants(doc))
                .find(|&e| page.doc.element(e).is_some_and(|el| el.is_html("title")));
            let title = match title {
                Some(t) => t,
                None => {
                    let Some(head) = page.doc.head_of(doc) else {
                        return Ok(JsValue::Undefined);
                    };
                    let t = page.doc.create_element("title", Namespace::Html);
                    page.doc
                        .append_child(head, t)
                        .map_err(|e| fail(e.to_string()))?;
                    t
                }
            };
            page.doc.clear_children(title).ok();
            page.doc.append_text(title, &text).ok();
            Ok(JsValue::Undefined)
        }
        "url" => Ok(JsValue::from(page.url.as_str())),
        "compatMode" => Ok(JsValue::from(
            if matches!(page.doc.quirks_mode(), ve_dom::QuirksMode::NoQuirks) {
                "CSS1Compat"
            } else {
                "BackCompat"
            },
        )),
        "cookie" => Ok(JsValue::from("")),
        "setCookie" => Ok(JsValue::Undefined),
        "createElement" => Ok(pack(
            page.doc
                .create_element(arg_str(args, 0).to_ascii_lowercase(), Namespace::Html),
        )),
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
            Ok(pack(page.doc.create_element_qname(name, namespace, prefix)))
        }
        "createTextNode" => Ok(pack(page.doc.create_text(arg_str(args, 0)))),
        "createComment" => Ok(pack(page.doc.create_comment(arg_str(args, 0)))),
        "createProcessingInstruction" => {
            let target = arg_str(args, 0);
            let data = arg_str(args, 1);
            if data.contains("?>") || target.is_empty() {
                return Err(fail("InvalidCharacterError"));
            }
            Ok(pack(page.doc.create_processing_instruction(target, data)))
        }
        "createDocumentType" => {
            let name = arg_str(args, 0);
            if name.is_empty() || name.chars().any(char::is_whitespace) {
                return Err(fail("InvalidCharacterError"));
            }
            Ok(pack(page.doc.create_doctype(
                name,
                arg_str(args, 1),
                arg_str(args, 2),
            )))
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
        "createFragment" => Ok(pack(page.doc.create_fragment())),
        "attachShadow" => {
            let mode = if arg_str(args, 1) == "closed" {
                ShadowRootMode::Closed
            } else {
                ShadowRootMode::Open
            };
            Ok(pack(
                page.doc
                    .attach_shadow(live(page, args, 0)?, mode)
                    .map_err(|e| fail(e.to_string()))?,
            ))
        }
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
            let pos = arg_str(args, 1).to_ascii_lowercase();
            let (context, before) = match pos.as_str() {
                "beforebegin" => (page.doc.parent(id), Some(id)),
                "afterbegin" => (Some(id), page.doc.first_child(id)),
                "beforeend" => (Some(id), None),
                "afterend" => (page.doc.parent(id), page.doc.next_sibling(id)),
                _ => return Err(fail(format!("invalid position {pos}"))),
            };
            let parent = context.ok_or_else(|| fail("no parent"))?;
            let kids = insert_fragment(page, &context_name(page, parent), &arg_str(args, 2))?;
            for kid in kids {
                if let Some(b) = before {
                    page.doc.insert_before(b, kid).ok();
                } else {
                    page.doc.append_child(parent, kid).ok();
                }
            }
            Ok(JsValue::Undefined)
        }
        "computed" => {
            let id = live(page, args, 0)?;
            page.update();
            let name = arg_str(args, 1);
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
        "formValue" => Ok(page
            .doc
            .form_value(live(page, args, 0)?)
            .map_or(JsValue::Null, |v| JsValue::from(v.as_str()))),
        "setFormValue" => {
            page.doc
                .set_form_value(live(page, args, 0)?, arg_str(args, 1))
                .ok();
            Ok(JsValue::Undefined)
        }
        "checked" => Ok(JsValue::Bool(page.doc.is_checked(live(page, args, 0)?))),
        "setChecked" => {
            page.doc
                .set_checked(live(page, args, 0)?, arg_bool(args, 1))
                .ok();
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
        "blur" => {
            page.focus(None);
            Ok(JsValue::Undefined)
        }
        "activate" => {
            let _ = page.activate(live(page, args, 0)?);
            Ok(JsValue::Undefined)
        }
        "submit" => {
            let _ = page.submit_from(live(page, args, 0)?);
            Ok(JsValue::Undefined)
        }
        "reset" => {
            let _ = page.reset_form_of(live(page, args, 0)?);
            Ok(JsValue::Undefined)
        }
        "innerWidth" => Ok(JsValue::Number(f64::from(page.viewport.width))),
        "innerHeight" => Ok(JsValue::Number(f64::from(page.viewport.height))),
        "locationGet" => Ok(JsValue::from(loc(&page.url, &arg_str(args, 0)).as_str())),
        "locationSet" => {
            let href = arg_str(args, 1);
            if arg_str(args, 0) == "replace" {
                if let Some(resolved) = page.resolve_url(&href) {
                    page.url.clone_from(&resolved);
                    if let Some(e) = page.history.get_mut(page.history_index) {
                        e.document.url.clone_from(&resolved);
                    }
                }
            } else {
                let _ = page.navigate(&href);
            }
            Ok(JsValue::Undefined)
        }
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
            &arg_str(args, 3),
        ),
        "fetchStart" => {
            let id =
                page.start_script_fetch(&arg_str(args, 0), &arg_str(args, 1), &arg_str(args, 3));
            Ok(JsValue::Number(id as f64))
        }
        "fetchPoll" => {
            let id = arg_f64(args, 0) as u64;
            if page
                .script_fetches
                .iter()
                .any(|j| j.id == id && j.result.is_none() && j.error.is_none() && !j.aborted)
            {
                page.complete_script_fetches();
            }
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
        "idbPut" => {
            let origin = origin_of(&page.url);
            let db = arg_str(args, 0);
            let store = arg_str(args, 1);
            let key = arg_str(args, 2);
            let value = arg_str(args, 3);
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
                    if let Some(reply) = crate::page::dispatch_worker(&w.source, &msg) {
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
        "canvasFillRect" => {
            let id = live(page, args, 0)?;
            let ops = page.canvas_fill_rect(
                id,
                arg_f64(args, 1) as i32,
                arg_f64(args, 2) as i32,
                arg_f64(args, 3) as i32,
                arg_f64(args, 4) as i32,
                &arg_str(args, 5),
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
        "mutationsSince" => {
            let since = ve_core::Revision(arg_f64(args, 0) as u64);
            let Some(entries) = page.doc.journal().entries_since(since) else {
                return Ok(JsValue::Array(Vec::new()));
            };
            Ok(JsValue::Array(
                entries
                    .map(|e| {
                        let (ty, target, attr) = match &e.mutation {
                            Mutation::NodeInserted { node, .. }
                            | Mutation::NodeRemoved { node, .. } => {
                                ("childList", Some(*node), None)
                            }
                            Mutation::AttributeChanged { node, name, .. } => {
                                ("attributes", Some(*node), Some(name.as_str()))
                            }
                            Mutation::TextChanged { node } => ("characterData", Some(*node), None),
                            _ => ("childList", e.mutation.target(), None),
                        };
                        let mut map = BTreeMap::new();
                        map.insert("type".into(), JsValue::from(ty));
                        if let Some(t) = target {
                            map.insert("target".into(), pack(t));
                        }
                        if let Some(a) = attr {
                            map.insert("attr".into(), JsValue::from(a));
                        }
                        JsValue::Object(map)
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

fn fetch(page: &mut Page, url: &str, method: &str, body: &str) -> Result<JsValue, ScriptError> {
    let resolved = page.resolve_url(url).unwrap_or_else(|| url.to_owned());
    if let Some((script_url, canned)) = page.service_workers.iter().rev().find_map(|s| {
        let in_scope =
            resolved.starts_with(&s.scope) || resolved.starts_with(s.scope.trim_end_matches('/'));
        if !in_scope {
            return None;
        }
        crate::page::service_worker_response_body(&s.script)
            .map(|body| (s.script_url.clone(), body))
    }) {
        let mut headers = BTreeMap::new();
        headers.insert(
            "x-service-worker".into(),
            JsValue::from(script_url.as_str()),
        );
        return Ok(obj(&[
            ("status", JsValue::Number(200.0)),
            ("statusText", JsValue::from("OK")),
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
    let id = page.id();
    let loader = page
        .loader
        .as_mut()
        .ok_or_else(|| fail("fetch needs a loader"))?;
    let res = loader
        .script_fetch(&resolved, method, body.as_bytes(), id)
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
    body: &str,
) -> Result<JsValue, ScriptError> {
    fetch(page, url, method, body)
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

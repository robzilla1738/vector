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
    page.doc
        .children(id)
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
                Some(NodeKind::Element(e)) => e.name.to_ascii_uppercase(),
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
            .and_then(ve_dom::Node::as_text)
            .map_or(JsValue::Null, JsValue::from)),
        "setNodeValue" => {
            let id = live(page, args, 0)?;
            page.doc.set_text(id, arg_str(args, 1)).ok();
            Ok(JsValue::Undefined)
        }
        "textContent" => Ok(JsValue::from(
            page.doc.text_content(live(page, args, 0)?).as_str(),
        )),
        "setTextContent" => {
            let id = live(page, args, 0)?;
            let text = arg_str(args, 1);
            let is_parent = page.doc.get(id).is_some_and(|n| {
                n.is_element()
                    || matches!(
                        n.kind,
                        NodeKind::DocumentFragment | NodeKind::ShadowRoot { .. }
                    )
            });
            if is_parent {
                page.doc.clear_children(id).ok();
                if !text.is_empty() {
                    page.doc.append_text(id, &text).ok();
                }
            } else {
                page.doc.set_text(id, text).ok();
            }
            Ok(JsValue::Undefined)
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
        "isConnected" => {
            let id = live(page, args, 0)?;
            let root = page.doc.root();
            Ok(JsValue::Bool(
                id == root || page.doc.is_ancestor_of(root, id),
            ))
        }
        "appendChild" => {
            let (p, c) = (live(page, args, 0)?, live(page, args, 1)?);
            page.doc
                .append_child(p, c)
                .map_err(|e| fail(e.to_string()))?;
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
            .map_or(JsValue::Null, |e| {
                JsValue::from(e.name.to_ascii_uppercase().as_str())
            })),
        "localName" => Ok(page
            .doc
            .element(live(page, args, 0)?)
            .map_or(JsValue::Null, |e| JsValue::from(e.name.as_str()))),
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
        "innerHTML" => Ok(JsValue::from(
            inner_html(page, live(page, args, 0)?).as_str(),
        )),
        "setInnerHTML" => {
            let id = live(page, args, 0)?;
            let html = arg_str(args, 1);
            let name = context_name(page, id);
            page.doc.clear_children(id).ok();
            if matches!(name.as_str(), "script" | "style" | "textarea" | "title") {
                if !html.is_empty() {
                    page.doc.append_text(id, &html).ok();
                }
            } else {
                for kid in insert_fragment(page, &name, &html)? {
                    page.doc.append_child(id, kid).ok();
                }
            }
            Ok(JsValue::Undefined)
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
            .element_by_id(&arg_str(args, 0))
            .map_or(JsValue::Null, pack)),
        "getElementByIdScoped" => {
            let root = live(page, args, 0)?;
            let want = arg_str(args, 1);
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
        "documentElement" => Ok(page.doc.document_element().map_or(JsValue::Null, pack)),
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
            match ve_net::WebSocketClient::connect(&resolved) {
                Ok(ws) => Ok(JsValue::from(format!("ws:{}", ws.ready_state).as_str())),
                Err(e) => Err(fail(e.to_string())),
            }
        }
        "head" => Ok(page.doc.head().map_or(JsValue::Null, pack)),
        "body" => Ok(page.doc.body().map_or(JsValue::Null, pack)),
        "title" => Ok(JsValue::from(page.title().as_str())),
        "setTitle" => {
            let text = arg_str(args, 0);
            let title = page
                .doc
                .elements()
                .find(|&e| page.doc.element(e).is_some_and(|el| el.is_html("title")));
            if let Some(t) = title {
                page.doc.clear_children(t).ok();
                page.doc.append_text(t, &text).ok();
            }
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
            Ok(pack(page.doc.create_element(arg_str(args, 1), namespace)))
        }
        "createTextNode" => Ok(pack(page.doc.create_text(arg_str(args, 0)))),
        "createComment" => Ok(pack(page.doc.create_comment(arg_str(args, 0)))),
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
            if d < 0 {
                for _ in 0..(-d) {
                    let _ = page.back();
                }
            } else if d > 0 {
                for _ in 0..d {
                    let _ = page.forward();
                }
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

fn fetch(page: &mut Page, url: &str, method: &str, body: &str) -> Result<JsValue, ScriptError> {
    let resolved = page.resolve_url(url).unwrap_or_else(|| url.to_owned());
    if let Some(sw) = page.service_workers.iter().rev().find(|s| {
        resolved.starts_with(&s.scope) || resolved.starts_with(s.scope.trim_end_matches('/'))
    }) && let Some(canned) = sw.script.strip_prefix("respond:")
    {
        let mut headers = BTreeMap::new();
        headers.insert(
            "x-service-worker".into(),
            JsValue::from(sw.script_url.as_str()),
        );
        return Ok(obj(&[
            ("status", JsValue::Number(200.0)),
            ("statusText", JsValue::from("OK")),
            ("url", JsValue::from(resolved.as_str())),
            ("body", JsValue::from(canned.trim())),
            ("headers", JsValue::Object(headers)),
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
        ("headers", JsValue::Object(headers)),
    ]))
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

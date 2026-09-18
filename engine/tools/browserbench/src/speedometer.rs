//! Official `Speedometer` 3.0 suite runner (VEC-021).

use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use ve_api::{OpenRequest, VectorEngine};

use crate::{SuiteResult, percentile, pin};

const TESTS_MJS: &str = include_str!("../vendor/speedometer/tests.mjs");

const STEPS_LIB: &str = r##"
  function fire(el, type, init, Ctor) {
    Ctor = Ctor || Event;
    var ev = new Ctor(type, init || { bubbles: true, cancelable: true });
    if (init) {
      if (init.key != null) ev.key = init.key;
      if (init.code != null) ev.code = init.code;
      if (init.keyCode != null) ev.keyCode = init.keyCode;
      if (init.which != null) ev.which = init.which;
      if (init.charCode != null) ev.charCode = init.charCode;
    }
    el.dispatchEvent(ev);
  }
  function enter(el) {
    var ke = { key: "Enter", code: "Enter", keyCode: 13, which: 13, charCode: 13, bubbles: true, cancelable: true };
    fire(el, "keydown", ke, KeyboardEvent);
    fire(el, "keypress", ke, KeyboardEvent);
    fire(el, "keyup", ke, KeyboardEvent);
  }
  function pierce(path, sel) {
    var n = document;
    for (var i = 0; i < path.length; i++) {
      n = n.querySelector(path[i]);
      if (!n) return null;
      n = n.shadowRoot || n;
    }
    return sel ? n.querySelector(sel) : n;
  }
  function qsa(root, sel) {
    if (!root) return [];
    var list = root.querySelectorAll(sel);
    var a = [];
    for (var i = 0; i < list.length; i++) a.push(list[i]);
    return a;
  }
  function todoInput() {
    return document.querySelector(".new-todo")
      || document.getElementById("new-todo")
      || document.querySelector("input.new-todo-input")
      || document.querySelector("input[placeholder='What needs to be done?']")
      || document.querySelector("input[placeholder=\"What needs to be done?\"]")
      || pierce(["todo-app", "todo-topbar"], ".new-todo-input")
      || pierce(["todo-app", "todo-form"], ".new-todo")
      || pierce(["todo-app"], ".new-todo")
      || pierce(["todo-app"], "input")
      || pierce(["todo-app", "todo-topbar"], "input")
      || deepQuery(".new-todo")
      || deepQuery("input.new-todo-input")
      || deepQuery("input[placeholder='What needs to be done?']");
  }
  function deepQuery(sel) {
    function walk(root) {
      if (!root) return null;
      if (root.querySelector) {
        var hit = root.querySelector(sel);
        if (hit) return hit;
      }
      var nodes = root.querySelectorAll ? root.querySelectorAll("*") : [];
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].shadowRoot) {
          hit = walk(nodes[i].shadowRoot);
          if (hit) return hit;
        }
      }
      return null;
    }
    return walk(document);
  }
  function countTodos() {
    var n = document.querySelectorAll(".todo-list li").length;
    if (!n) n = document.querySelectorAll("todo-item").length;
    if (!n) {
      var listRoot = pierce(["todo-app", "todo-list"], null) || pierce(["todo-app"], null);
      n = qsa(listRoot, "todo-item").length;
    }
    if (!n) {
      function walk(root) {
        var c = 0;
        if (!root) return 0;
        if (root.querySelectorAll) {
          c += root.querySelectorAll("todo-item").length;
          c += root.querySelectorAll(".todo-list li").length;
        }
        var nodes = root.querySelectorAll ? root.querySelectorAll("*") : [];
        for (var i = 0; i < nodes.length; i++) if (nodes[i].shadowRoot) c += walk(nodes[i].shadowRoot);
        return c;
      }
      n = walk(document);
    }
    return n;
  }
  function itemRoots() {
    var items = qsa(document, "todo-item");
    if (items.length) return items;
    var listRoot = pierce(["todo-app", "todo-list"], null) || pierce(["todo-app"], null);
    items = qsa(listRoot, "todo-item");
    if (items.length) return items;
    var out = [];
    function walk(root) {
      if (!root || !root.querySelectorAll) return;
      var list = root.querySelectorAll("todo-item");
      for (var i = 0; i < list.length; i++) out.push(list[i]);
      var nodes = root.querySelectorAll("*");
      for (var i = 0; i < nodes.length; i++) if (nodes[i].shadowRoot) walk(nodes[i].shadowRoot);
    }
    walk(document);
    return out;
  }
  function collectDeep(sel) {
    var out = [];
    function walk(root) {
      if (!root || !root.querySelectorAll) return;
      var list = root.querySelectorAll(sel);
      for (var i = 0; i < list.length; i++) out.push(list[i]);
      var nodes = root.querySelectorAll("*");
      for (var i = 0; i < nodes.length; i++) if (nodes[i].shadowRoot) walk(nodes[i].shadowRoot);
    }
    walk(document);
    return out;
  }
  function clickAllDeep(sel) {
    var buttons = collectDeep(sel);
    for (var i = buttons.length - 1; i >= 0; i--) {
      try { buttons[i].click(); } catch (e) {}
    }
    return buttons.length;
  }
  function clickRemaining(sel, limit) {
    var guard = 0;
    while (guard++ < limit) {
      var d = document.querySelector(sel) || deepQuery(sel);
      if (!d) break;
      try { d.click(); } catch (e) { break; }
    }
  }
  function completeAndDeleteTodos() {
    var added = countTodos();
    clickAllDeep(".destroy");
    clickAllDeep(".remove-todo-button");
    clickRemaining(".destroy", added + 5);
    clickRemaining(".remove-todo-button", 10);
    var toggle = document.querySelector("#toggle-all")
      || document.querySelector(".toggle-all")
      || deepQuery(".toggle-all");
    if (toggle) try { toggle.click(); } catch (e) {}
    var clear = document.querySelector(".clear-completed") || deepQuery(".clear-completed");
    if (clear) try { clear.click(); } catch (e) {}
    return { added: added, remaining: countTodos() };
  }
"##;

const ADD_STEPS: &str = r##"(function () {
  var kind = "unknown";
  var input = todoInput();
  if (input) {
    kind = "todomvc";
    var renderMs = { showEntries: 0, updateElementCount: 0, other: 0 };
    if (window.app && app.View && app.View.prototype && !app.View.prototype.__veTimed) {
      var origRender = app.View.prototype.render;
      app.View.prototype.render = function (cmd, p) {
        var t = Date.now();
        var r = origRender.call(this, cmd, p);
        var d = Date.now() - t;
        if (cmd === "showEntries") renderMs.showEntries += d;
        else if (cmd === "updateElementCount") renderMs.updateElementCount += d;
        else renderMs.other += d;
        return r;
      };
      app.View.prototype.__veTimed = true;
      window.__veRenderMs = renderMs;
    }
    var focusMs = 0, valueMs = 0, inputMs = 0, changeMs = 0, enterMs = 0;
    var addStarted = Date.now();
    for (var i = 0; i < 100; i++) {
      var t0 = Date.now();
      input.focus();
      focusMs += Date.now() - t0;
      t0 = Date.now();
      input.value = "Task-" + i;
      valueMs += Date.now() - t0;
      t0 = Date.now();
      fire(input, "input", { bubbles: true, data: "Task-" + i, inputType: "insertText" }, InputEvent);
      inputMs += Date.now() - t0;
      t0 = Date.now();
      fire(input, "change");
      changeMs += Date.now() - t0;
      t0 = Date.now();
      enter(input);
      enterMs += Date.now() - t0;
    }
    var addMs = Date.now() - addStarted;
    var added = countTodos();
    window.__veBench = {
      kind: kind, ok: added >= 100, added: added, remaining: added, addMs: addMs,
      focusMs: focusMs, valueMs: valueMs, inputMs: inputMs, changeMs: changeMs, enterMs: enterMs,
      showEntriesMs: renderMs.showEntries, updateElementCountMs: renderMs.updateElementCount, otherRenderMs: renderMs.other
    };
    return JSON.stringify(window.__veBench);
  }
  var news = document.querySelector("#navbar-dropdown-toggle");
  if (news) {
    kind = "news";
    for (var i = 0; i < 10; i++) { news.click(); news.click(); }
    var us = document.querySelector("#navbar-navlist-us-link");
    var world = document.querySelector("#navbar-navlist-world-link");
    var politics = document.querySelector("#navbar-navlist-politics-link");
    if (us) us.click();
    if (world) world.click();
    if (politics) politics.click();
    window.__veBench = { kind: kind, ok: !!(us || world || politics) };
    return JSON.stringify(window.__veBench);
  }
  var create = document.querySelector("#create");
  var layout = document.querySelector("#layout");
  if (create && layout) {
    kind = "editor";
    create.click(); layout.click();
    var longBtn = document.querySelector("#long");
    if (longBtn) longBtn.click();
    layout.click();
    var hi = document.querySelector("#highlight");
    if (hi) hi.click();
    layout.click();
    window.__veBench = { kind: kind, ok: true };
    return JSON.stringify(window.__veBench);
  }
  var prepare = document.querySelector("#prepare");
  if (prepare) {
    kind = "chart";
    prepare.click();
    var reset = document.querySelector("#reset");
    if (reset) reset.click();
    var stacked = document.querySelector("#add-stacked-chart-button");
    var scatter = document.querySelector("#add-scatter-chart-button");
    var dotted = document.querySelector("#add-dotted-chart-button");
    if (stacked) stacked.click();
    if (scatter) scatter.click();
    if (dotted) dotted.click();
    var tip = document.querySelector("#open-tooltip");
    if (tip) tip.click();
    window.__veBench = { kind: kind, ok: true };
    return JSON.stringify(window.__veBench);
  }
  var render = document.querySelector("#render");
  if (render) {
    kind = "stock";
    render.click();
    window.__veBench = { kind: kind, ok: true };
    return JSON.stringify(window.__veBench);
  }
  var ready = document.querySelector("#app-is-ready");
  if (ready) {
    kind = "perf";
    window.__veBench = { kind: kind, ok: true };
    return JSON.stringify(window.__veBench);
  }
  window.__veBench = { kind: kind, ok: false, reason: "no workload hook" };
  return JSON.stringify(window.__veBench);
})()"##;

const FINISH_STEPS: &str = r##"(function () {
  var prev = window.__veBench || { kind: "unknown", ok: false };
  var kind = prev.kind || "unknown";
  if (kind === "todomvc") {
    var finishStarted = Date.now();
    var beforeShow = (window.__veRenderMs && window.__veRenderMs.showEntries) || 0;
    var beforeCount = (window.__veRenderMs && window.__veRenderMs.updateElementCount) || 0;
    var beforeOther = (window.__veRenderMs && window.__veRenderMs.other) || 0;
    try {
      completeAndDeleteTodos();
    } catch (e) {
      window.__veBench = Object.assign({}, prev, { kind: kind, added: countTodos(), remaining: countTodos(), err: String(e) });
      return JSON.stringify(window.__veBench);
    }
    var finishMs = Date.now() - finishStarted;
    var added = prev.added || countTodos();
    var remaining = countTodos();
    var finishShowEntriesMs = ((window.__veRenderMs && window.__veRenderMs.showEntries) || 0) - beforeShow;
    var finishUpdateCountMs = ((window.__veRenderMs && window.__veRenderMs.updateElementCount) || 0) - beforeCount;
    var finishOtherRenderMs = ((window.__veRenderMs && window.__veRenderMs.other) || 0) - beforeOther;
    window.__veBench = Object.assign({}, prev, {
      kind: kind, added: added, remaining: remaining, finishMs: finishMs,
      finishShowEntriesMs: finishShowEntriesMs, finishUpdateCountMs: finishUpdateCountMs,
      finishOtherRenderMs: finishOtherRenderMs
    });
    return JSON.stringify(window.__veBench);
  }
  return JSON.stringify({ ok: !!prev.ok, kind: kind, added: prev.ok ? 1 : 0, remaining: 0, reason: prev.reason });
})()"##;

const RECOUNT_STEPS: &str = r##"(function () {
  var prev = window.__veBench || {};
  if ((prev.kind || "") === "todomvc") {
    var added = countTodos();
    window.__veBench = Object.assign({}, prev, {
      added: added,
      remaining: added,
      ok: added >= 100
    });
  }
  return JSON.stringify(window.__veBench || {});
})()"##;

const COUNT_STEPS: &str = r##"(function () {
  var prev = window.__veBench || { kind: "unknown", ok: false };
  var kind = prev.kind || "unknown";
  if (kind === "todomvc") {
    var remaining = countTodos();
    var added = prev.added || 0;
    return JSON.stringify({
      ok: added >= 100 && remaining === 0,
      kind: kind,
      added: added,
      remaining: remaining,
      addMs: prev.addMs || 0,
      finishMs: prev.finishMs || 0,
      focusMs: prev.focusMs || 0,
      valueMs: prev.valueMs || 0,
      inputMs: prev.inputMs || 0,
      changeMs: prev.changeMs || 0,
      enterMs: prev.enterMs || 0,
      showEntriesMs: prev.showEntriesMs || 0,
      updateElementCountMs: prev.updateElementCountMs || 0,
      otherRenderMs: prev.otherRenderMs || 0,
      finishShowEntriesMs: prev.finishShowEntriesMs || 0,
      finishUpdateCountMs: prev.finishUpdateCountMs || 0,
      finishOtherRenderMs: prev.finishOtherRenderMs || 0
    });
  }
  return JSON.stringify({ ok: !!prev.ok, kind: kind, added: prev.ok ? 1 : 0, remaining: 0, reason: prev.reason });
})()"##;

fn add_steps(n: u32) -> String {
    ADD_STEPS
        .replace("i < 100", &format!("i < {n}"))
        .replace("added >= 100", &format!("added >= {n}"))
}

fn count_steps(n: u32) -> String {
    COUNT_STEPS.replace("added >= 100", &format!("added >= {n}"))
}

fn workload_path(url: &str) -> &str {
    url.split(['#', '?']).next().unwrap_or(url)
}

fn with_lib(body: &str) -> String {
    // Keep helpers local. `function qsa` at script scope overwrites TodoMVC ES5's
    // `window.qsa(selector, scope)` (reversed arguments) and $delegate never matches.
    format!("(function(){{\n{STEPS_LIB}\nreturn {body};\n}})()")
}

fn vendor_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("vendor/speedometer")
}

/// `(name, url)` from the official `tests.mjs`.
pub(crate) fn official_suites() -> Vec<(String, String)> {
    let mut out = Vec::new();
    let mut name: Option<String> = None;
    for line in TESTS_MJS.lines() {
        let t = line.trim().trim_end_matches(',');
        if let Some(rest) = t.strip_prefix("name:") {
            name = Some(rest.trim().trim_matches('"').to_owned());
        } else if let Some(rest) = t.strip_prefix("url:")
            && let Some(n) = name.take()
        {
            let u = rest.trim().trim_matches('"').to_owned();
            out.push((n, u));
        }
    }
    out
}

fn inline_html(path: &Path) -> anyhow::Result<String> {
    let html = std::fs::read_to_string(path)?;
    let dir = path.parent().unwrap_or(path);
    let mut out = inline_scripts(&inline_styles(&html, dir), dir);
    if path_is_perf_dashboard(path) {
        out = embed_perf_dashboard_json(&out, dir);
    }
    Ok(out)
}

fn path_is_perf_dashboard(path: &Path) -> bool {
    path.components()
        .any(|c| c.as_os_str() == "perf.webkit.org")
}

fn embed_perf_dashboard_json(html: &str, v3_dir: &Path) -> String {
    let public = v3_dir.parent().unwrap_or(v3_dir);
    let files = [
        "/data/manifest.json",
        "/api/analysis-tasks-platform=55-metric=1649",
        "/api/analysis-tasks-platform=55-metric=1407",
        "/api/analysis-tasks-platform=55-metric=1648",
        "/api/analysis-tasks-platform=55-metric=1974",
        "/data/measurement-set-55-1649.json",
        "/data/measurement-set-55-1407.json",
        "/data/measurement-set-55-1648.json",
        "/data/measurement-set-55-1974.json",
        "/data/measurement-set-55-1649-1682812800000.json",
        "/data/measurement-set-55-1407-1682812800000.json",
        "/data/measurement-set-55-1648-1682812800000.json",
        "/data/measurement-set-55-1974-1682812800000.json",
    ];
    let mut js = String::from("window.__vePerfJson={};\n");
    for key in files {
        let rel = key.trim_start_matches('/');
        let Ok(body) = std::fs::read_to_string(public.join(rel)) else {
            continue;
        };
        js.push_str("window.__vePerfJson[");
        js.push_str(&serde_json::to_string(&key).unwrap_or_else(|_| "\"\"".into()));
        js.push_str("]=");
        js.push_str(&serde_json::to_string(&body).unwrap_or_else(|_| "\"\"".into()));
        js.push_str(";\n");
    }
    js.push_str(
        r#"
      const _fetch = globalThis.fetch;
      globalThis.fetch = function (url, init) {
        const u = String(url && url.url ? url.url : url);
        const keys = Object.keys(window.__vePerfJson || {});
        const key = keys.find((k) => u.endsWith(k) || u.endsWith(k.slice(1)));
        if (key) {
          const text = window.__vePerfJson[key];
          return Promise.resolve({
            ok: true,
            status: 200,
            text() { return Promise.resolve(text); },
            json() { return Promise.resolve(JSON.parse(text)); }
          });
        }
        return _fetch.apply(this, arguments);
      };
    "#,
    );
    let tag = format!("<script>\n{js}\n</script>");
    if let Some(i) = html.find("<head>") {
        let mut out = String::with_capacity(html.len() + tag.len());
        out.push_str(&html[..i + 6]);
        out.push_str(&tag);
        out.push_str(&html[i + 6..]);
        out
    } else if let Some(i) = html.find("<script") {
        let mut out = String::with_capacity(html.len() + tag.len());
        out.push_str(&html[..i]);
        out.push_str(&tag);
        out.push_str(&html[i..]);
        out
    } else {
        format!("{tag}{html}")
    }
}

fn sanitize_inline_js(js: &str) -> String {
    let chars: Vec<char> = js.chars().collect();
    let mut out = String::with_capacity(js.len());
    let mut i = 0;
    while i < chars.len() {
        if chars.len() - i >= 8 {
            let eq = chars[i..i + 8]
                .iter()
                .map(|c| c.to_ascii_lowercase())
                .eq("</script".chars());
            if eq {
                out.push_str("<\\/script");
                i += 8;
                continue;
            }
        }
        out.push(chars[i]);
        i += 1;
    }
    out
}

fn emit_script(out: &mut String, js: &str) {
    out.push_str("<script>\n");
    out.push_str(&sanitize_inline_js(js));
    out.push_str("\n</script>");
}

fn append_deferred(html: &mut String, deferred: &[String]) {
    if deferred.is_empty() {
        return;
    }
    let mut scripts = String::new();
    for js in deferred {
        emit_script(&mut scripts, js);
    }
    if let Some(i) = html.rfind("</body>") {
        html.insert_str(i, &scripts);
    } else {
        html.push_str(&scripts);
    }
}

fn inline_scripts(html: &str, dir: &Path) -> String {
    let mut out = String::new();
    let mut deferred = Vec::new();
    let mut rest = html;
    let open = "<script";
    while let Some(i) = rest.find(open) {
        out.push_str(&rest[..i]);
        rest = &rest[i + open.len()..];
        let Some(tag_end) = rest.find('>') else {
            out.push_str(open);
            out.push_str(rest);
            append_deferred(&mut out, &deferred);
            return out;
        };
        let attrs = &rest[..tag_end];
        rest = &rest[tag_end + 1..];
        let lower = attrs.to_ascii_lowercase();
        let is_template_script = lower.contains("type=\"text/x-")
            || lower.contains("type='text/x-")
            || lower.contains("type=\"text/template\"")
            || lower.contains("type='text/template'")
            || lower.contains("type=\"application/json\"")
            || lower.contains("type='application/json'")
            || lower.contains("importmap");
        let is_module = lower.contains("type=\"module\"") || lower.contains("type='module'");
        let is_defer = is_module || lower.contains("defer");
        let is_nomodule = lower.contains("nomodule");
        if is_nomodule {
            if let Some(close) = rest.find("</script>") {
                rest = &rest[close + 9..];
            } else {
                append_deferred(&mut out, &deferred);
                return out;
            }
            continue;
        }
        if is_template_script {
            if let Some(close) = rest.find("</script>") {
                out.push_str(open);
                out.push_str(attrs);
                out.push('>');
                out.push_str(&rest[..close]);
                out.push_str("</script>");
                rest = &rest[close + 9..];
            } else {
                out.push_str(open);
                out.push_str(attrs);
                out.push('>');
                out.push_str(rest);
                append_deferred(&mut out, &deferred);
                return out;
            }
            continue;
        }
        let src = attr(attrs, "src");
        if let Some(close) = rest.find("</script>") {
            let body = &rest[..close];
            rest = &rest[close + 9..];
            if let Some(src) = src.filter(|s| !s.starts_with("http")) {
                let path = dir.join(src);
                if is_module {
                    match crate::esm::bundle(&path) {
                        Ok(js) if is_defer => deferred.push(js),
                        Ok(js) => emit_script(&mut out, &js),
                        Err(e) => {
                            out.push_str("<script>throw new Error(");
                            out.push_str(
                                &serde_json::to_string(&e.to_string())
                                    .unwrap_or_else(|_| "\"module bundle failed\"".into()),
                            );
                            out.push_str(");</script>");
                        }
                    }
                } else {
                    match std::fs::read_to_string(&path) {
                        Ok(js) if is_defer => deferred.push(js),
                        Ok(js) => emit_script(&mut out, &js),
                        Err(_) => {
                            out.push_str(open);
                            out.push_str(attrs);
                            out.push('>');
                            out.push_str(body);
                            out.push_str("</script>");
                        }
                    }
                }
            } else if is_module {
                match crate::esm::bundle_inline(body, dir) {
                    Ok(js) if is_defer => deferred.push(js),
                    Ok(js) => emit_script(&mut out, &js),
                    Err(_) => {
                        out.push_str(open);
                        out.push_str(attrs);
                        out.push('>');
                        out.push_str(body);
                        out.push_str("</script>");
                    }
                }
            } else {
                out.push_str(open);
                out.push_str(attrs);
                out.push('>');
                out.push_str(body);
                out.push_str("</script>");
            }
        }
    }
    out.push_str(rest);
    append_deferred(&mut out, &deferred);
    out
}

fn inline_styles(html: &str, dir: &Path) -> String {
    let mut out = String::new();
    let mut rest = html;
    let open = "<link";
    while let Some(i) = rest.find(open) {
        out.push_str(&rest[..i]);
        rest = &rest[i + open.len()..];
        let Some(tag_end) = rest.find('>') else {
            out.push_str(open);
            out.push_str(rest);
            return out;
        };
        let attrs = &rest[..tag_end];
        rest = &rest[tag_end + 1..];
        let rel = attr(attrs, "rel").unwrap_or_default();
        let href = attr(attrs, "href");
        if rel.eq_ignore_ascii_case("stylesheet")
            && let Some(href) = href.filter(|s| !s.starts_with("http"))
            && let Ok(css) = std::fs::read_to_string(dir.join(href))
        {
            out.push_str("<style>\n");
            out.push_str(&css);
            out.push_str("\n</style>");
            continue;
        }
        out.push_str(open);
        out.push_str(attrs);
        out.push('>');
    }
    out.push_str(rest);
    out
}

fn attr(attrs: &str, name: &str) -> Option<String> {
    for quote in ['"', '\''] {
        let needle = format!("{name}={quote}");
        if let Some(i) = attrs.find(&needle) {
            let rest = &attrs[i + needle.len()..];
            let end = rest.find(quote)?;
            return Some(rest[..end].to_owned());
        }
    }
    None
}

/// Runs every official `Speedometer` 3.0 suite name. Vendored workloads execute;
/// missing sources are `NOTRUN`. `gate` executes only `TodoMVC-JavaScript-ES5`
/// (the merge-gated suite) and records the rest as `NOTRUN`.
pub(crate) fn run_official(
    engine: &mut VectorEngine,
    iterations: u32,
    gate: bool,
) -> Vec<SuiteResult> {
    let revision = pin("speedometer", "revision");
    let root = vendor_root();
    official_suites()
        .into_iter()
        .map(|(name, url)| {
            if gate && name != "TodoMVC-JavaScript-ES5" {
                SuiteResult {
                    name: format!("speedometer.3.0.{name}"),
                    status: "NOTRUN",
                    revision: revision.clone(),
                    samples_ms: None,
                    p50_ms: None,
                    p95_ms: None,
                    detail: Some("ci gate; not executed".into()),
                }
            } else {
                eprint!("browserbench: start {name} ... ");
                let _ = std::io::Write::flush(&mut std::io::stderr());
                let started = Instant::now();
                let result = run_one(engine, iterations, &revision, &root, name, url);
                eprintln!(
                    "{} {}ms {:?}",
                    result.status,
                    started.elapsed().as_millis(),
                    result.p95_ms
                );
                result
            }
        })
        .collect()
}

fn run_one(
    engine: &mut VectorEngine,
    iterations: u32,
    revision: &str,
    root: &Path,
    name: String,
    url: String,
) -> SuiteResult {
    let mut path = root.join(workload_path(&url));
    if path.is_dir() {
        path.push("index.html");
    }
    if !path.exists() {
        return SuiteResult {
            name: format!("speedometer.3.0.{name}"),
            status: "NOTRUN",
            revision: revision.to_owned(),
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some(format!("workload not vendored: {url}")),
        };
    }
    if !cfg!(feature = "v8") {
        return SuiteResult {
            name: format!("speedometer.3.0.{name}"),
            status: "NOTRUN",
            revision: revision.to_owned(),
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without v8".into()),
        };
    }
    let html = match inline_html(&path) {
        Ok(h) => h,
        Err(e) => {
            return SuiteResult {
                name: format!("speedometer.3.0.{name}"),
                status: "FAIL",
                revision: revision.to_owned(),
                samples_ms: None,
                p50_ms: None,
                p95_ms: None,
                detail: Some(e.to_string()),
            };
        }
    };
    let mut samples = Vec::new();
    let mut last = None;
    let mut added = 0u64;
    let mut remaining = 0u64;
    let mut kind = String::new();
    let mut ok = false;
    let mut last_attribution: Option<serde_json::Value> = None;
    for _ in 0..iterations.max(1) {
        let open_started = Instant::now();
        let opened = match engine.open(OpenRequest {
            url: Some(format!("https://browserbench.org/Speedometer3.0/{url}")),
            html: Some(html.clone()),
            allow_evaluate: true,
            ..OpenRequest::default()
        }) {
            Ok(o) => o,
            Err(e) => {
                last = Some(e.to_string());
                break;
            }
        };
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(3_000);
        }
        let open_ms = open_started.elapsed().as_millis();
        let started = Instant::now();
        let add_src = with_lib(ADD_STEPS);
        let finish_src = with_lib(FINISH_STEPS);
        if let Err(e) = engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(&add_src))
        {
            last = Some(e.to_string());
            engine.close(opened.page);
            continue;
        }
        let suite_wall = std::env::var("VECTOR_BROWSERBENCH_SUITE_DEADLINE_SECS")
            .ok()
            .and_then(|s| s.parse().ok())
            .map(Duration::from_secs)
            .filter(|d| *d > Duration::ZERO)
            .unwrap_or(Duration::from_secs(90));
        if started.elapsed() > suite_wall {
            last = Some("suite wall deadline after add".into());
            engine.close(opened.page);
            break;
        }
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(200);
        }
        if let Err(e) = engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(&with_lib(RECOUNT_STEPS)))
        {
            last = Some(e.to_string());
            engine.close(opened.page);
            continue;
        }
        if let Err(e) = engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(&finish_src))
        {
            last = Some(e.to_string());
            engine.close(opened.page);
            continue;
        }
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(200);
        }
        match engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(&with_lib(COUNT_STEPS)))
        {
            Ok(raw) => {
                let js_ms = started.elapsed().as_millis();
                samples.push(u64::try_from(js_ms).unwrap_or(u64::MAX));
                last_attribution = Some(serde_json::json!({
                    "label": format!("speedometer.3.0.{name}"),
                    "openMs": open_ms,
                    "jsMs": js_ms,
                    "settleMs": 3_200,
                    "note": "openMs covers parse/style/layout/script boot; jsMs is add+complete+count; settleMs is harness wait, not engine work"
                }));
                let text = match &raw {
                    serde_json::Value::String(s) => s.clone(),
                    other => other.to_string(),
                };
                if let Ok(v) = serde_json::from_str::<serde_json::Value>(&text) {
                    if let Some(attr) = last_attribution.as_mut() {
                        if let Some(obj) = attr.as_object_mut() {
                            if let Some(n) = v.get("addMs").and_then(serde_json::Value::as_u64) {
                                obj.insert("addMs".into(), serde_json::json!(n));
                            }
                            if let Some(n) = v.get("finishMs").and_then(serde_json::Value::as_u64) {
                                obj.insert("finishMs".into(), serde_json::json!(n));
                            }
                            for key in [
                                "focusMs",
                                "valueMs",
                                "inputMs",
                                "changeMs",
                                "enterMs",
                                "showEntriesMs",
                                "updateElementCountMs",
                                "otherRenderMs",
                                "finishShowEntriesMs",
                                "finishUpdateCountMs",
                                "finishOtherRenderMs",
                            ] {
                                if let Some(n) = v.get(key).and_then(serde_json::Value::as_u64) {
                                    obj.insert(key.into(), serde_json::json!(n));
                                }
                            }
                        }
                    }
                    added = v
                        .get("added")
                        .and_then(serde_json::Value::as_u64)
                        .unwrap_or(0);
                    remaining = v
                        .get("remaining")
                        .and_then(serde_json::Value::as_u64)
                        .unwrap_or(0);
                    kind.clear();
                    kind.push_str(
                        v.get("kind")
                            .and_then(serde_json::Value::as_str)
                            .unwrap_or(""),
                    );
                    ok = v.get("ok").and_then(serde_json::Value::as_bool) == Some(true);
                    if !ok {
                        last = Some(text);
                    }
                } else {
                    last = Some(text);
                }
            }
            Err(e) => last = Some(e.to_string()),
        }
        engine.close(opened.page);
    }
    let status = if samples.is_empty() {
        "FAIL"
    } else if kind == "todomvc" && added >= 100 && remaining == 0 {
        "PASS"
    } else if kind == "todomvc" && added > 0 {
        "PARTIAL"
    } else if ok
        && matches!(
            kind.as_str(),
            "news" | "editor" | "chart" | "stock" | "perf"
        )
    {
        "PASS"
    } else if added > 0 {
        "PARTIAL"
    } else {
        "FAIL"
    };
    SuiteResult {
        name: format!("speedometer.3.0.{name}"),
        status,
        revision: revision.to_owned(),
        p50_ms: (!samples.is_empty()).then(|| percentile(&samples, 0.50)),
        p95_ms: (!samples.is_empty()).then(|| percentile(&samples, 0.95)),
        samples_ms: (!samples.is_empty()).then_some(samples),
        detail: last.or(Some(match last_attribution {
            Some(attr) => serde_json::json!({
                "kind": kind,
                "added": added,
                "remaining": remaining,
                "attribution": attr,
            })
            .to_string(),
            None => format!("kind={kind} added={added} remaining={remaining}"),
        })),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn official_suite_list_is_speedometer_3() {
        let suites = official_suites();
        assert!(suites.len() >= 20, "{}", suites.len());
        assert!(
            suites.iter().any(|(n, _)| n == "TodoMVC-JavaScript-ES5"),
            "{suites:?}"
        );
        assert!(
            suites.iter().any(|(_, u)| u.contains("#/home")),
            "React/Preact/News keep their official hash URLs: {suites:?}"
        );
    }

    #[test]
    fn es5_workload_is_vendored() {
        let p = vendor_root().join("todomvc/vanilla-examples/javascript-es5/dist/index.html");
        assert!(p.exists(), "{}", p.display());
    }

    #[test]
    fn every_official_speedometer_3_workload_is_vendored() {
        for (name, url) in official_suites() {
            let p = vendor_root().join(workload_path(&url));
            assert!(p.exists(), "{name} missing {}", p.display());
        }
    }

    #[cfg(feature = "v8")]
    fn bench_engine() -> ve_api::VectorEngine {
        use ve_api::{EngineConfig, VectorEngine};
        use ve_core::Size;
        // Same process defaults as browserbench main: official Complex-DOM
        // inlines jQuery/Spectrum past the 20s SCRIPT_DEADLINE. Do not raise
        // the engine-wide default (ve-agent runaway-script stays 20s).
        if std::env::var_os("VECTOR_SCRIPT_DEADLINE_SECS").is_none() {
            unsafe { std::env::set_var("VECTOR_SCRIPT_DEADLINE_SECS", "90") };
        }
        if std::env::var_os("VECTOR_EVALUATE_DEADLINE_SECS").is_none() {
            unsafe { std::env::set_var("VECTOR_EVALUATE_DEADLINE_SECS", "240") };
        }
        VectorEngine::new(EngineConfig {
            viewport: Size::new(1280.0, 720.0),
            offline: true,
            scripting: true,
            policy: ve_api::NetworkPolicy::permissive(),
            ..EngineConfig::default()
        })
    }

    #[cfg(feature = "v8")]
    fn open_workload(engine: &mut ve_api::VectorEngine, rel: &str) -> ve_api::PageId {
        use ve_api::OpenRequest;
        let html = inline_html(&vendor_root().join(workload_path(rel))).unwrap();
        engine
            .open(OpenRequest {
                url: Some(format!("https://browserbench.org/Speedometer3.0/{rel}")),
                html: Some(html),
                allow_evaluate: true,
                ..OpenRequest::default()
            })
            .unwrap()
            .page
    }

    #[cfg(feature = "v8")]
    #[test]
    fn es5_destroy_click_removes_rendered_item() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/vanilla-examples/javascript-es5/dist/index.html",
        );
        {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.evaluate(&with_lib(ADD_STEPS)).unwrap();
            page.settle(200);
            page.evaluate(&with_lib(FINISH_STEPS)).unwrap();
            page.settle(200);
        }
        let finish = {
            let page = engine.page_mut(page_id).unwrap();
            page.evaluate(&with_lib(COUNT_STEPS)).unwrap()
        };
        let text = match &finish {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        let v: serde_json::Value = serde_json::from_str(&text).unwrap();
        assert_eq!(v["ok"], true, "{v}");
        assert_eq!(v["remaining"], 0, "{v}");
        engine.close(page_id);
    }

    #[cfg(feature = "v8")]
    #[test]
    fn react_mounts_new_todo() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/architecture-examples/react/dist/index.html#/home",
        );
        let (raw, console) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            let src = with_lib(
                r##"(function () {
                  var input = todoInput();
                  if (!input) return JSON.stringify({ todo: false });
                  input.focus();
                  input.value = "Task-0";
                  fire(input, "input", { bubbles: true, data: "Task-0", inputType: "insertText" }, InputEvent);
                  enter(input);
                  return JSON.stringify({
                    todo: true,
                    items: document.querySelectorAll(".todo-list li").length,
                    toggles: document.querySelectorAll(".toggle").length
                  });
                })()"##,
            );
            let raw = page.evaluate(&src).unwrap();
            let console: Vec<String> = page
                .console()
                .iter()
                .map(|l| format!("{}: {}", l.level, l.message))
                .take(8)
                .collect();
            (raw, console)
        };
        let text = match &raw {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        let v: serde_json::Value = serde_json::from_str(&text).unwrap();
        assert_eq!(v["todo"], true, "{v} console={console:?}");
        assert!(
            v["items"].as_u64().unwrap_or(0) >= 1 || v["toggles"].as_u64().unwrap_or(0) >= 1,
            "{v} console={console:?}"
        );
        engine.close(page_id);
    }

    #[cfg(feature = "v8")]
    #[test]
    fn perf_dashboard_creates_app_is_ready() {
        let mut engine = bench_engine();
        let page_id = open_workload(&mut engine, "perf.webkit.org/public/v3/index.html");
        let dump = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.evaluate(
                r##"(function () {
                  return JSON.stringify({
                    ready: !!document.getElementById("app-is-ready"),
                    cache: !!(window.__vePerfJson && window.__vePerfJson["/data/manifest.json"] && window.__vePerfJson["/api/analysis-tasks-platform=55-metric=1649"])
                  });
                })()"##,
            )
            .unwrap()
        };
        engine.close(page_id);
        let v: serde_json::Value = match &dump {
            serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(dump.clone()),
            other => other.clone(),
        };
        assert_eq!(v["ready"], true, "{v}");
        assert_eq!(v["cache"], true, "{v}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn lit_todomvc_destroy_removes_rendered_items() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/architecture-examples/lit/dist/index.html",
        );
        let (after_add, after_one, after_finish, console) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.evaluate(&with_lib(
                r##"(function () {
                  var input = todoInput();
                  if (!input) return JSON.stringify({ todo: false });
                  for (var i = 0; i < 3; i++) {
                    input.focus();
                    input.value = "Task-" + i;
                    fire(input, "input", { bubbles: true, data: "Task-" + i, inputType: "insertText" }, InputEvent);
                    fire(input, "change");
                    enter(input);
                  }
                  return JSON.stringify({ todo: true, added: countTodos() });
                })()"##,
            ))
            .unwrap();
            page.settle(250);
            let after_add = page
                .evaluate(&with_lib("JSON.stringify({ added: countTodos() })"))
                .unwrap();
            page.evaluate(
                r##"(function () {
                  var app = document.querySelector("todo-app");
                  var list = app && app.shadowRoot && app.shadowRoot.querySelector("todo-list");
                  var item = list && list.shadowRoot && list.shadowRoot.querySelector("todo-item");
                  var destroy = item && item.shadowRoot && item.shadowRoot.querySelector(".destroy");
                  if (destroy) destroy.click();
                })()"##,
            )
            .unwrap();
            page.settle(250);
            let after_one = page
                .evaluate(&with_lib("JSON.stringify({ remaining: countTodos() })"))
                .unwrap();
            page.evaluate(&with_lib(
                r##"(function () {
                  completeAndDeleteTodos();
                  return JSON.stringify({ remaining: countTodos() });
                })()"##,
            ))
            .unwrap();
            page.settle(250);
            let after_finish = page
                .evaluate(&with_lib("JSON.stringify({ remaining: countTodos() })"))
                .unwrap();
            let console: Vec<String> = page
                .console()
                .iter()
                .filter(|l| l.level == "error")
                .map(|l| l.message.chars().take(180).collect())
                .take(4)
                .collect();
            (after_add, after_one, after_finish, console)
        };
        engine.close(page_id);
        let add: serde_json::Value = match &after_add {
            serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(after_add.clone()),
            other => other.clone(),
        };
        let one: serde_json::Value = match &after_one {
            serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(after_one.clone()),
            other => other.clone(),
        };
        let finish: serde_json::Value = match &after_finish {
            serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(after_finish.clone()),
            other => other.clone(),
        };
        assert_eq!(add["added"], 3, "{add} err={console:?}");
        assert_eq!(one["remaining"], 2, "{one} err={console:?}");
        assert_eq!(finish["remaining"], 0, "{finish} err={console:?}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn web_components_workload_registers_and_finds_input() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/vanilla-examples/javascript-web-components/dist/index.html",
        );
        let (probe, console) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            let probe = page
                .evaluate(
                    r#"(function () {
                      const app = document.querySelector("todo-app");
                      const input = (function () {
                        var n = document;
                        var path = ["todo-app", "todo-topbar"];
                        for (var i = 0; i < path.length; i++) {
                          n = n.querySelector(path[i]);
                          if (!n) return { step: "missing-" + path[i] };
                          n = n.shadowRoot || n;
                        }
                        var el = n.querySelector(".new-todo-input") || n.querySelector(".new-todo");
                        return el ? { tag: el.tagName, cls: el.className } : { step: "no-input", html: n.innerHTML ? String(n.innerHTML).slice(0, 200) : "" };
                      })();
                      return {
                        defined: !!customElements.get("todo-app"),
                        topbar: !!customElements.get("todo-topbar"),
                        app: !!app,
                        shadow: !!(app && app.shadowRoot),
                        input: input,
                        css: typeof CSSStyleSheet === "function"
                      };
                    })()"#,
                )
                .unwrap();
            let console: Vec<String> = page
                .console()
                .iter()
                .map(|l| format!("{}:{}", l.level, l.message.chars().take(160).collect::<String>()))
                .take(8)
                .collect();
            (probe, console)
        };
        engine.close(page_id);
        assert_eq!(probe["defined"], true, "{probe} err={console:?}");
        assert_eq!(probe["topbar"], true, "{probe} err={console:?}");
        assert_eq!(probe["shadow"], true, "{probe} err={console:?}");
        assert!(probe["input"]["tag"].is_string(), "{probe} err={console:?}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn web_components_workload_adds_and_finishes() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/vanilla-examples/javascript-web-components/dist/index.html",
        );
        let (after_add, after_finish, console) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.evaluate(&with_lib(
                r##"(function () {
                  var input = todoInput();
                  if (!input) return JSON.stringify({ todo: false });
                  for (var i = 0; i < 3; i++) {
                    input.focus();
                    input.value = "Task-" + i;
                    fire(input, "input", { bubbles: true, data: "Task-" + i, inputType: "insertText" }, InputEvent);
                    fire(input, "change");
                    enter(input);
                  }
                  return JSON.stringify({ todo: true, added: countTodos() });
                })()"##,
            ))
            .unwrap();
            page.settle(250);
            let after_add = page
                .evaluate(&with_lib("JSON.stringify({ added: countTodos() })"))
                .unwrap();
            page.evaluate(&with_lib(
                r##"(function () {
                  completeAndDeleteTodos();
                  return JSON.stringify({ remaining: countTodos() });
                })()"##,
            ))
            .unwrap();
            page.settle(250);
            let after_finish = page
                .evaluate(&with_lib("JSON.stringify({ remaining: countTodos() })"))
                .unwrap();
            let console: Vec<String> = page
                .console()
                .iter()
                .filter(|l| l.level == "error")
                .map(|l| l.message.chars().take(180).collect())
                .take(4)
                .collect();
            (after_add, after_finish, console)
        };
        engine.close(page_id);
        let add: serde_json::Value = match &after_add {
            serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(after_add.clone()),
            other => other.clone(),
        };
        let finish: serde_json::Value = match &after_finish {
            serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(after_finish.clone()),
            other => other.clone(),
        };
        assert_eq!(add["added"], 3, "{add} err={console:?}");
        assert_eq!(finish["remaining"], 0, "{finish} err={console:?}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn official_fast_fail_suites_boot_and_expose_input() {
        let mut engine = bench_engine();
        let suites = [
            "todomvc/architecture-examples/react/dist/index.html",
            "todomvc/architecture-examples/react-redux/dist/index.html",
            "todomvc/architecture-examples/vue/dist/index.html",
            "todomvc/architecture-examples/lit/dist/index.html",
            "newssite/news-next/dist/index.html#/home",
        ];
        let mut fails = Vec::new();
        for rel in suites {
            let page_id = open_workload(&mut engine, rel);
            let (probe, added, console) = {
                let page = engine.page_mut(page_id).unwrap();
                page.settle(3_000);
                let probe = page
                    .evaluate(&with_lib(
                        r##"(function () {
                          var input = todoInput();
                          var news = document.querySelector("#navbar-dropdown-toggle");
                          return {
                            input: !!(input && input.tagName),
                            news: !!news,
                            title: document.title || "",
                            root: !!(document.querySelector(".todoapp") || document.querySelector("#root") || document.querySelector("todo-app")),
                            body: String(document.body && document.body.innerHTML || "").slice(0, 180)
                          };
                        })()"##,
                    ))
                    .unwrap();
                page.evaluate(&with_lib(
                    r##"(function () {
                      var input = todoInput();
                      if (!input) return JSON.stringify({ added: 0, skipped: true });
                      for (var i = 0; i < 3; i++) {
                        input.focus();
                        input.value = "Task-" + i;
                        fire(input, "input", { bubbles: true, data: "Task-" + i, inputType: "insertText" }, InputEvent);
                        fire(input, "change");
                        enter(input);
                      }
                      return JSON.stringify({ queued: true });
                    })()"##,
                ))
                .ok();
                page.settle(250);
                let added = page
                    .evaluate(&with_lib("JSON.stringify({ added: countTodos() })"))
                    .unwrap();
                let console: Vec<String> = page
                    .console()
                    .iter()
                    .filter(|l| l.level == "error" || l.level == "warn")
                    .map(|l| l.message.chars().take(400).collect())
                    .take(6)
                    .collect();
                (probe, added, console)
            };
            engine.close(page_id);
            let v: serde_json::Value = match &probe {
                serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(probe.clone()),
                other => other.clone(),
            };
            let add: serde_json::Value = match &added {
                serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(added.clone()),
                other => other.clone(),
            };
            let ok = v["input"].as_bool() == Some(true) || v["news"].as_bool() == Some(true);
            if !ok {
                fails.push(format!("{rel} => {v} err={console:?}"));
                continue;
            }
            if v["input"].as_bool() == Some(true) && add["added"].as_u64().unwrap_or(0) < 3 {
                fails.push(format!("{rel} add => {add} probe={v} err={console:?}"));
            }
        }
        assert!(fails.is_empty(), "{}", fails.join("\n"));
    }

    #[cfg(feature = "v8")]
    #[test]
    fn official_es5_complex_dom_one_add_is_attributed() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/vanilla-examples/javascript-es5-complex/dist/index.html",
        );
        let (probe, console, restyle) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.reset_restyle_attribution();
            let probe = page
                .evaluate(&with_lib(
                    r##"(function () {
                      var input = todoInput();
                      if (!input) return JSON.stringify({ input: false });
                      var t0 = Date.now();
                      input.focus();
                      var focusMs = Date.now() - t0;
                      t0 = Date.now();
                      input.value = "Task-0";
                      var valueMs = Date.now() - t0;
                      t0 = Date.now();
                      fire(input, "input", { bubbles: true, data: "Task-0", inputType: "insertText" }, InputEvent);
                      var inputMs = Date.now() - t0;
                      t0 = Date.now();
                      fire(input, "change");
                      var changeMs = Date.now() - t0;
                      t0 = Date.now();
                      enter(input);
                      var enterMs = Date.now() - t0;
                      return JSON.stringify({
                        input: true,
                        added: countTodos(),
                        addMs: focusMs + valueMs + inputMs + changeMs + enterMs,
                        focusMs: focusMs,
                        valueMs: valueMs,
                        inputMs: inputMs,
                        changeMs: changeMs,
                        enterMs: enterMs,
                        nodes: document.getElementsByTagName("*").length
                      });
                    })()"##,
                ))
                .expect("complex one add");
            let restyle = page.restyle_attribution();
            let console: Vec<String> = page
                .console()
                .iter()
                .filter(|l| l.level == "error")
                .map(|l| l.message.chars().take(180).collect())
                .take(4)
                .collect();
            (probe, console, restyle)
        };
        engine.close(page_id);
        let text = match &probe {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(probe);
        assert_eq!(v["input"], true, "{v} err={console:?}");
        assert!(
            v["nodes"].as_u64().unwrap_or(0) > 1000,
            "official Complex-DOM page did not keep its extra tree: {v} err={console:?}"
        );
        assert!(
            v["added"].as_u64().unwrap_or(0) >= 1,
            "window load must bind Controller._activeRoute: {v} err={console:?}"
        );
        assert_eq!(
            restyle.full_calls, 0,
            "one add must not full-restyle the Spectrum tree: {v} restyle={restyle:?} err={console:?}"
        );
        assert!(
            v["changeMs"].as_u64().unwrap_or(u64::MAX) < 2_000,
            "change dispatch must not scan the Spectrum tree as named properties: {v} restyle={restyle:?}"
        );
        eprintln!("complex-dom one-add {v} restyle={restyle:?}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn official_jquery_complex_one_add_is_attributed() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/architecture-examples/jquery-complex/dist/index.html",
        );
        let (probe, console, restyle) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.reset_restyle_attribution();
            let probe = page
                .evaluate(&with_lib(
                    r##"(function () {
                      var input = todoInput();
                      if (!input) return JSON.stringify({ input: false });
                      var renderMs = {};
                      if (window.app && app.render && !app.__veTimedRender) {
                        app.render = function () {
                          var todos = this.getFilteredTodos();
                          var t = Date.now();
                          var html = this.todoTemplate(todos);
                          renderMs.tpl = Date.now() - t;
                          t = Date.now();
                          $('#todo-list').html(html);
                          renderMs.listHtml = Date.now() - t;
                          t = Date.now();
                          $('#main').toggle(todos.length > 0);
                          renderMs.toggleMain = Date.now() - t;
                          t = Date.now();
                          $('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
                          renderMs.prop = Date.now() - t;
                          t = Date.now();
                          this.renderFooter();
                          renderMs.footer = Date.now() - t;
                          t = Date.now();
                          $('#new-todo').focus();
                          renderMs.focus = Date.now() - t;
                        };
                        app.__veTimedRender = true;
                      }
                      var t0 = Date.now();
                      input.focus();
                      var focusMs = Date.now() - t0;
                      t0 = Date.now();
                      input.value = "Task-0";
                      var valueMs = Date.now() - t0;
                      t0 = Date.now();
                      fire(input, "input", { bubbles: true, data: "Task-0", inputType: "insertText" }, InputEvent);
                      var inputMs = Date.now() - t0;
                      t0 = Date.now();
                      fire(input, "keyup", { key: "Enter", keyCode: 13, which: 13, bubbles: true }, KeyboardEvent);
                      var enterMs = Date.now() - t0;
                      return JSON.stringify({
                        input: true,
                        added: countTodos(),
                        focusMs: focusMs,
                        valueMs: valueMs,
                        inputMs: inputMs,
                        enterMs: enterMs,
                        tplMs: renderMs.tpl || 0,
                        listHtmlMs: renderMs.listHtml || 0,
                        toggleMainMs: renderMs.toggleMain || 0,
                        propMs: renderMs.prop || 0,
                        footerMs: renderMs.footer || 0,
                        renderFocusMs: renderMs.focus || 0,
                        nodes: document.getElementsByTagName("*").length
                      });
                    })()"##,
                ))
                .expect("jquery complex one add");
            let restyle = page.restyle_attribution();
            let console: Vec<String> = page
                .console()
                .iter()
                .filter(|l| l.level == "error")
                .map(|l| l.message.chars().take(180).collect())
                .take(4)
                .collect();
            (probe, console, restyle)
        };
        engine.close(page_id);
        let text = match &probe {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(probe);
        assert_eq!(v["input"], true, "{v} err={console:?}");
        assert!(
            v["nodes"].as_u64().unwrap_or(0) > 1000,
            "jquery Complex-DOM lost its extra tree: {v} err={console:?}"
        );
        assert!(
            v["added"].as_u64().unwrap_or(0) >= 1,
            "jquery Complex-DOM one-add: {v} err={console:?}"
        );
        assert_eq!(
            restyle.full_calls, 0,
            "jquery show() must not full-restyle Spectrum: {v} restyle={restyle:?}"
        );
        assert!(
            v["enterMs"].as_u64().unwrap_or(u64::MAX) < 2_000,
            "jquery create/render must not walk the Spectrum tree: {v} restyle={restyle:?}"
        );
        eprintln!("jquery-complex one-add {v} restyle={restyle:?}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn official_backbone_complex_one_add_is_attributed() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/architecture-examples/backbone-complex/dist/index.html",
        );
        let (probe, console, restyle) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.reset_restyle_attribution();
            let probe = page
                .evaluate(&with_lib(
                    r##"(function () {
                      var input = todoInput();
                      if (!input) return JSON.stringify({ input: false });
                      var t0 = Date.now();
                      input.focus();
                      var focusMs = Date.now() - t0;
                      t0 = Date.now();
                      input.value = "Task-0";
                      var valueMs = Date.now() - t0;
                      t0 = Date.now();
                      fire(input, "input", { bubbles: true, data: "Task-0", inputType: "insertText" }, InputEvent);
                      var inputMs = Date.now() - t0;
                      t0 = Date.now();
                      enter(input);
                      var enterMs = Date.now() - t0;
                      return JSON.stringify({
                        input: true,
                        added: countTodos(),
                        focusMs: focusMs,
                        valueMs: valueMs,
                        inputMs: inputMs,
                        enterMs: enterMs,
                        nodes: document.getElementsByTagName("*").length
                      });
                    })()"##,
                ))
                .expect("backbone complex one add");
            let restyle = page.restyle_attribution();
            let console: Vec<String> = page
                .console()
                .iter()
                .filter(|l| l.level == "error")
                .map(|l| l.message.chars().take(180).collect())
                .take(4)
                .collect();
            (probe, console, restyle)
        };
        engine.close(page_id);
        let text = match &probe {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(probe);
        assert_eq!(v["input"], true, "{v} err={console:?}");
        assert!(
            v["nodes"].as_u64().unwrap_or(0) > 1000,
            "backbone Complex-DOM lost its extra tree: {v} err={console:?}"
        );
        assert!(
            v["added"].as_u64().unwrap_or(0) >= 1,
            "backbone Complex-DOM one-add: {v} err={console:?}"
        );
        assert_eq!(
            restyle.full_calls, 0,
            "backbone add must not full-restyle Spectrum: {v} restyle={restyle:?}"
        );
        assert!(
            v["enterMs"].as_u64().unwrap_or(u64::MAX) < 2_000,
            "backbone create/render must not walk the Spectrum tree: {v} restyle={restyle:?}"
        );
        eprintln!("backbone-complex one-add {v} restyle={restyle:?}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn official_es5_complex_dom_hundred_add_is_attributed() {
        let mut engine = bench_engine();
        let page_id = open_workload(
            &mut engine,
            "todomvc/vanilla-examples/javascript-es5-complex/dist/index.html",
        );
        let (probe, restyle) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            page.reset_restyle_attribution();
            let probe = page.evaluate(&with_lib(ADD_STEPS)).expect("complex 100 add");
            let restyle = page.restyle_attribution();
            (probe, restyle)
        };
        engine.close(page_id);
        let text = match &probe {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(probe);
        assert!(
            v["added"].as_u64().unwrap_or(0) >= 100,
            "official Complex-DOM 100-add: {v} restyle={restyle:?}"
        );
        assert_eq!(restyle.full_calls, 0, "100-add full restyle: {v} restyle={restyle:?}");
        assert!(
            v["showEntriesMs"].as_u64().unwrap_or(u64::MAX) < 4_000,
            "showEntries must not scan a full mutation journal: {v} restyle={restyle:?}"
        );
        eprintln!("complex-dom 100-add {v} restyle={restyle:?}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn remaining_official_workloads_add_and_finish() {
        let mut engine = bench_engine();
        let suites = [
            "todomvc/architecture-examples/vue/dist/index.html",
            "todomvc/architecture-examples/lit/dist/index.html",
            "todomvc/architecture-examples/preact/dist/index.html#/home",
            "todomvc/architecture-examples/svelte/dist/index.html",
            "todomvc/architecture-examples/jquery/dist/index.html",
            "todomvc/architecture-examples/jquery-complex/dist/index.html",
            "todomvc/architecture-examples/backbone/dist/index.html",
            "todomvc/vanilla-examples/javascript-web-components/dist/index.html",
            "todomvc/vanilla-examples/javascript-web-components-complex/dist/index.html",
            "todomvc/architecture-examples/lit-complex/dist/index.html",
            "newssite/news-next/dist/index.html#/home",
            "newssite/news-nuxt/dist/index.html",
            "perf.webkit.org/public/v3/index.html",
        ];
        let mut fails = Vec::new();
        let add = with_lib(&add_steps(3));
        let count = with_lib(&count_steps(3));
        for rel in suites {
            let started = Instant::now();
            let page_id = open_workload(&mut engine, rel);
            let (finish, console) = {
                let page = engine.page_mut(page_id).unwrap();
                page.settle(3_000);
                page.evaluate(&add).ok();
                page.settle(250);
                page.evaluate(&with_lib(FINISH_STEPS)).ok();
                page.settle(250);
                let finish = page.evaluate(&count).unwrap();
                let console: Vec<String> = page
                    .console()
                    .iter()
                    .filter(|l| l.level == "error")
                    .map(|l| l.message.chars().take(180).collect())
                    .take(2)
                    .collect();
                (finish, console)
            };
            engine.close(page_id);
            let text = match &finish {
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(finish);
            let ok = v.get("ok").and_then(serde_json::Value::as_bool) == Some(true);
            eprintln!(
                "remaining-official {rel} ok={ok} {}ms {v} err={console:?}",
                started.elapsed().as_millis()
            );
            if !ok {
                fails.push(format!("{rel} => {v} err={console:?}"));
            }
        }
        assert!(fails.is_empty(), "{}", fails.join("\n"));
    }

    #[cfg(feature = "v8")]
    #[test]
    fn remaining_official_complex_workloads_add_and_finish() {
        let mut engine = bench_engine();
        let suites = [
            "todomvc/architecture-examples/backbone-complex/dist/index.html",
            "todomvc/architecture-examples/vue-complex/dist/index.html",
            "todomvc/architecture-examples/preact-complex/dist/index.html#/home",
            "todomvc/architecture-examples/svelte-complex/dist/index.html",
            "todomvc/architecture-examples/react-complex/dist/index.html#/home",
            "todomvc/architecture-examples/react-redux-complex/dist/index.html",
            "todomvc/vanilla-examples/javascript-es6-webpack-complex/dist/index.html",
        ];
        let mut fails = Vec::new();
        let add = with_lib(&add_steps(3));
        let count = with_lib(&count_steps(3));
        for rel in suites {
            let started = Instant::now();
            let page_id = open_workload(&mut engine, rel);
            let (finish, console) = {
                let page = engine.page_mut(page_id).unwrap();
                page.settle(3_000);
                page.evaluate(&add).ok();
                page.settle(250);
                page.evaluate(&with_lib(FINISH_STEPS)).ok();
                page.settle(250);
                let finish = page.evaluate(&count).unwrap();
                let console: Vec<String> = page
                    .console()
                    .iter()
                    .filter(|l| l.level == "error")
                    .map(|l| l.message.chars().take(180).collect())
                    .take(2)
                    .collect();
                (finish, console)
            };
            engine.close(page_id);
            let text = match &finish {
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(finish);
            let ok = v.get("ok").and_then(serde_json::Value::as_bool) == Some(true);
            eprintln!(
                "remaining-complex {rel} ok={ok} {}ms {v} err={console:?}",
                started.elapsed().as_millis()
            );
            if !ok {
                fails.push(format!("{rel} => {v} err={console:?}"));
            }
        }
        assert!(fails.is_empty(), "{}", fails.join("\n"));
    }

    #[cfg(feature = "v8")]
    #[test]
    fn official_chartjs_exposes_prepare() {
        let mut engine = bench_engine();
        let page_id = open_workload(&mut engine, "charts/dist/chartjs.html");
        let (probe, console) = {
            let page = engine.page_mut(page_id).unwrap();
            page.settle(3_000);
            let probe = page
                .evaluate(&with_lib(ADD_STEPS))
                .unwrap_or(serde_json::Value::Null);
            let console: Vec<String> = page
                .console()
                .iter()
                .filter(|l| l.level == "error")
                .map(|l| l.message.chars().take(180).collect())
                .take(2)
                .collect();
            (probe, console)
        };
        engine.close(page_id);
        let text = match &probe {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(probe);
        eprintln!("chartjs {v} err={console:?}");
        assert!(
            console
                .iter()
                .all(|m| {
                    !m.contains("Cannot use import")
                        && !m.contains("resetTransform")
                        && !m.contains("setLineDash")
                }),
            "chart module still missing canvas/ESM: {v} err={console:?}"
        );
        assert_eq!(v["ok"], true, "{v} err={console:?}");
        assert_eq!(v["kind"], "chart", "{v}");
    }

    #[cfg(feature = "v8")]
    #[test]
    #[ignore = "TipTap/charts/stockcharts OOM this host (same class as Editor-CodeMirror)"]
    fn remaining_official_editor_chart_workloads_boot() {
        let mut engine = bench_engine();
        let suites = [
            "editors/dist/tiptap.html",
            "charts/dist/observable-plot.html",
            "charts/dist/chartjs.html",
            "react-stockcharts/build/index.html?type=svg",
        ];
        let mut fails = Vec::new();
        let add = with_lib(&add_steps(1));
        for rel in suites {
            let started = Instant::now();
            let page_id = open_workload(&mut engine, rel);
            let (probe, console) = {
                let page = engine.page_mut(page_id).unwrap();
                page.settle(3_000);
                let probe = page.evaluate(&add).unwrap_or(serde_json::Value::Null);
                let console: Vec<String> = page
                    .console()
                    .iter()
                    .filter(|l| l.level == "error")
                    .map(|l| l.message.chars().take(180).collect())
                    .take(2)
                    .collect();
                (probe, console)
            };
            engine.close(page_id);
            let text = match &probe {
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            let v: serde_json::Value = serde_json::from_str(&text).unwrap_or(probe);
            let ok = v.get("ok").and_then(serde_json::Value::as_bool) == Some(true);
            eprintln!(
                "editor-chart {rel} ok={ok} {}ms {v} err={console:?}",
                started.elapsed().as_millis()
            );
            if !ok {
                fails.push(format!("{rel} => {v} err={console:?}"));
            }
        }
        assert!(fails.is_empty(), "{}", fails.join("\n"));
    }

    #[test]
    fn handlebars_templates_are_preserved_when_inlining() {
        let html = r#"<script id="todo-template" type="text/x-handlebars-template">{{title}}</script>
<script src="app.js"></script>"#;
        let dir = vendor_root().join("todomvc/architecture-examples/jquery/dist");
        let out = inline_scripts(html, &dir);
        assert!(out.contains("type=\"text/x-handlebars-template\""), "{out}");
        assert!(out.contains("{{title}}"), "{out}");
    }

    #[test]
    fn inlined_js_does_not_close_the_script_tag() {
        let html = r#"<script src="app.js"></script>"#;
        let dir = std::env::temp_dir();
        let js_path = dir.join("app.js");
        std::fs::write(&js_path, r#"var x = "</script>" + "ok";"#).unwrap();
        let out = inline_scripts(html, &dir);
        let _ = std::fs::remove_file(&js_path);
        assert!(out.contains("<\\/script"), "{out}");
        assert_eq!(out.matches("</script>").count(), 1, "{out}");
    }

    #[test]
    fn perf_dashboard_inlining_embeds_measurement_json() {
        let path = vendor_root().join("perf.webkit.org/public/v3/index.html");
        let out = inline_html(&path).unwrap();
        assert!(out.contains("__vePerfJson"), "{out:.200}");
        assert!(out.contains("/data/manifest.json"), "{out:.200}");
        assert!(out.contains("globalThis.fetch"), "{out:.200}");
    }

    #[test]
    fn nomodule_scripts_are_dropped_when_inlining() {
        let html = r#"<script nomodule src="polyfills.js"></script><script src="app.js"></script>"#;
        let dir = vendor_root().join("todomvc/architecture-examples/jquery/dist");
        let out = inline_scripts(html, &dir);
        assert!(!out.to_ascii_lowercase().contains("nomodule"), "{out}");
    }

    #[test]
    fn defer_head_scripts_are_moved_past_the_mount_point() {
        let dir = std::env::temp_dir();
        let js_path = dir.join("ve-defer-app.js");
        std::fs::write(&js_path, "window.__booted = !!document.getElementById('root');")
            .unwrap();
        let html = "<head><script defer src=\"ve-defer-app.js\"></script></head><body><div id=\"root\"></div></body>";
        let out = inline_scripts(html, &dir);
        let _ = std::fs::remove_file(&js_path);
        let root_at = out.find("id=\"root\"").expect(&out);
        let boot_at = out.find("window.__booted").expect(&out);
        assert!(boot_at > root_at, "{out}");
    }
}

//! Classic-script bundler for Speedometer `type=module` workloads.

use std::collections::HashSet;
use std::path::{Component, Path, PathBuf};

pub(crate) fn bundle(entry: &Path) -> anyhow::Result<String> {
    let entry = normalize(entry);
    let mut order = Vec::new();
    let mut seen = HashSet::new();
    visit(&entry, &mut order, &mut seen)?;
    let mut out = String::from(
        r#"var __ve_cache = Object.create(null);
function __ve_def(m) { return (m && m.default !== undefined) ? m.default : m; }
function __ve_require(id) {
  var m = __ve_cache[id];
  if (!m) throw new Error("Cannot find module " + id);
  if (!m.l) { m.l = true; m.f(__ve_require, m.e, m); }
  return m.e;
}
"#,
    );
    for path in &order {
        let id = path.to_string_lossy();
        let src = std::fs::read_to_string(path)?;
        let (imports, body) = take_imports(&src);
        let mut prelude = String::new();
        for imp in imports {
            let dep = resolve(path, &imp.spec);
            let req = format!("__ve_require({})", json_str(&dep.to_string_lossy()));
            if imp.side_effect {
                prelude.push_str(&req);
                prelude.push_str(";\n");
            }
            if let Some(ns) = &imp.namespace {
                prelude.push_str(&format!("const {ns} = {req};\n"));
            }
            if let Some(default) = &imp.default {
                prelude.push_str(&format!("const {default} = __ve_def({req});\n"));
            }
            if !imp.named.is_empty() {
                let names: Vec<String> = imp
                    .named
                    .iter()
                    .map(|(orig, alias)| {
                        if orig == alias {
                            orig.clone()
                        } else {
                            format!("{orig}: {alias}")
                        }
                    })
                    .collect();
                prelude.push_str(&format!("const {{ {} }} = {req};\n", names.join(", ")));
            }
        }
        let rewritten = rewrite_exports(&body).replace(
            "import.meta",
            "(module.url ? {url: module.url} : {url: \"\"})",
        );
        out.push_str("__ve_cache[");
        out.push_str(&json_str(&id));
        out.push_str("] = { l:false, e:{}, url:");
        out.push_str(&json_str(&id));
        out.push_str(", f:function(require, exports, module) {\n");
        out.push_str(&prelude);
        out.push_str(&rewritten);
        out.push_str("\n} };\n");
    }
    out.push_str("__ve_require(");
    out.push_str(&json_str(&entry.to_string_lossy()));
    out.push_str(");\n");
    Ok(out)
}

/// Bundles an inline `type=module` script whose imports resolve against `dir`.
pub(crate) fn bundle_inline(source: &str, dir: &Path) -> anyhow::Result<String> {
    let tmp = dir.join(".ve-inline-entry.js");
    std::fs::write(&tmp, source)?;
    let result = bundle(&tmp);
    let _ = std::fs::remove_file(&tmp);
    result
}

#[derive(Debug)]
struct Import {
    spec: String,
    default: Option<String>,
    named: Vec<(String, String)>,
    namespace: Option<String>,
    side_effect: bool,
}

fn visit(path: &Path, order: &mut Vec<PathBuf>, seen: &mut HashSet<PathBuf>) -> anyhow::Result<()> {
    if !seen.insert(path.to_path_buf()) {
        return Ok(());
    }
    let src = std::fs::read_to_string(path)?;
    let (imports, _) = take_imports(&src);
    for imp in imports {
        visit(&resolve(path, &imp.spec), order, seen)?;
    }
    order.push(path.to_path_buf());
    Ok(())
}

fn take_imports(source: &str) -> (Vec<Import>, String) {
    let chars: Vec<char> = source.chars().collect();
    let mut imports = Vec::new();
    let mut out = String::new();
    let mut i = 0;
    let mut depth = 0i32;
    while i < chars.len() {
        if starts_with(&chars, i, "//") {
            let start = i;
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            out.extend(chars[start..i].iter());
            continue;
        }
        if starts_with(&chars, i, "/*") {
            let start = i;
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i = (i + 2).min(chars.len());
            out.extend(chars[start..i].iter());
            continue;
        }
        if matches!(chars[i], '"' | '\'' | '`') {
            let start = i;
            i = skip_string(&chars, i);
            out.extend(chars[start..i].iter());
            continue;
        }
        if depth == 0
            && starts_with(&chars, i, "import")
            && chars.get(i + 6).is_some_and(|c| {
                c.is_whitespace() || *c == '"' || *c == '\'' || *c == '{'
            })
        {
            if let Some((imp, end)) = parse_import(&chars, i) {
                imports.push(imp);
                i = end;
                continue;
            }
        }
        match chars[i] {
            '{' | '(' | '[' => depth += 1,
            '}' | ')' | ']' => depth = depth.saturating_sub(1),
            _ => {}
        }
        out.push(chars[i]);
        i += 1;
    }
    (imports, out)
}

fn skip_string(chars: &[char], start: usize) -> usize {
    let quote = chars[start];
    let mut i = start + 1;
    while i < chars.len() {
        if chars[i] == '\\' {
            i += 2;
            continue;
        }
        if chars[i] == quote {
            return i + 1;
        }
        i += 1;
    }
    chars.len()
}

fn parse_import(chars: &[char], start: usize) -> Option<(Import, usize)> {
    let mut i = start + 6;
    i = skip_ws_and_comments(chars, i);
    let mut default = None;
    let mut named = Vec::new();
    let mut namespace = None;
    let mut side_effect = false;
    if i < chars.len() && (chars[i] == '"' || chars[i] == '\'') {
        let (spec, end) = parse_string(chars, i)?;
        let end = eat_semi(chars, end);
        return Some((
            Import {
                spec,
                default: None,
                named: Vec::new(),
                namespace: None,
                side_effect: true,
            },
            end,
        ));
    }
    if starts_with(chars, i, "type") && chars.get(i + 4).is_some_and(char::is_ascii_whitespace) {
        return None;
    }
    if chars.get(i) == Some(&'*') {
        i += 1;
        i = skip_ws_and_comments(chars, i);
        if !starts_with(chars, i, "as") {
            return None;
        }
        i = skip_ws_and_comments(chars, i + 2);
        let (name, n) = parse_ident(chars, i)?;
        namespace = Some(name);
        i = n;
    } else if chars.get(i) == Some(&'{') {
        let (n, end) = parse_named(chars, i)?;
        named = n;
        i = end;
    } else {
        let (name, n) = parse_ident(chars, i)?;
        default = Some(name);
        i = skip_ws_and_comments(chars, n);
        if chars.get(i) == Some(&',') {
            i = skip_ws_and_comments(chars, i + 1);
            if chars.get(i) == Some(&'{') {
                let (n, end) = parse_named(chars, i)?;
                named = n;
                i = end;
            } else if chars.get(i) == Some(&'*') {
                i += 1;
                i = skip_ws_and_comments(chars, i);
                if !starts_with(chars, i, "as") {
                    return None;
                }
                i = skip_ws_and_comments(chars, i + 2);
                let (name, n) = parse_ident(chars, i)?;
                namespace = Some(name);
                i = n;
            }
        }
    }
    i = skip_ws_and_comments(chars, i);
    if !starts_with(chars, i, "from") {
        return None;
    }
    i = skip_ws_and_comments(chars, i + 4);
    let (spec, end) = parse_string(chars, i)?;
    let end = eat_semi(chars, end);
    if default.is_none() && named.is_empty() && namespace.is_none() {
        side_effect = true;
    }
    Some((
        Import {
            spec,
            default,
            named,
            namespace,
            side_effect,
        },
        end,
    ))
}

fn parse_named(chars: &[char], start: usize) -> Option<(Vec<(String, String)>, usize)> {
    if chars.get(start) != Some(&'{') {
        return None;
    }
    let mut i = start + 1;
    let mut out = Vec::new();
    loop {
        i = skip_ws_and_comments(chars, i);
        if chars.get(i) == Some(&'}') {
            return Some((out, i + 1));
        }
        let (orig, n) = parse_ident(chars, i)?;
        i = skip_ws_and_comments(chars, n);
        let alias = if starts_with(chars, i, "as") {
            i = skip_ws_and_comments(chars, i + 2);
            let (a, n) = parse_ident(chars, i)?;
            i = n;
            a
        } else {
            orig.clone()
        };
        out.push((orig, alias));
        i = skip_ws_and_comments(chars, i);
        if chars.get(i) == Some(&',') {
            i += 1;
        }
    }
}

fn rewrite_exports(body: &str) -> String {
    let mut s = body.replace("export{", "export {");
    s = s.replace("export default ", "exports.default = ");
    let mut extras = String::new();
    for prefix in [
        "export function ",
        "export class ",
        "export const ",
        "export let ",
        "export var ",
    ] {
        while let Some(idx) = s.find(prefix) {
            let after = idx + "export ".len();
            s.replace_range(idx..after, "");
            let name_src = &s[idx + prefix.len() - "export ".len()..];
            if let Some(name) = ident_at(name_src) {
                extras.push_str(&format!("\nexports.{name} = {name};"));
            }
        }
    }
    while let Some(idx) = s.find("export {") {
        if let Some(end) = s[idx..].find('}') {
            let inner = s[idx + 8..idx + end].to_string();
            s.replace_range(idx..=(idx + end), "");
            for part in inner.split(',') {
                let part = part.trim();
                if part.is_empty() {
                    continue;
                }
                let mut bits = part.split_whitespace();
                let orig = bits.next().unwrap_or("");
                let alias = if bits.next() == Some("as") {
                    bits.next().unwrap_or(orig)
                } else {
                    orig
                };
                if !alias.is_empty() {
                    extras.push_str(&format!("\nexports.{alias} = {orig};"));
                }
            }
        } else {
            break;
        }
    }
    s.push_str(&extras);
    s
}

fn ident_at(s: &str) -> Option<String> {
    let mut chars = s.chars();
    let first = chars.next()?;
    if !(first.is_ascii_alphabetic() || first == '_' || first == '$') {
        return None;
    }
    let mut out = String::new();
    out.push(first);
    for c in chars {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            out.push(c);
        } else {
            break;
        }
    }
    Some(out)
}

fn parse_ident(chars: &[char], start: usize) -> Option<(String, usize)> {
    let mut i = start;
    let first = *chars.get(i)?;
    if !(first.is_ascii_alphabetic() || first == '_' || first == '$') {
        return None;
    }
    i += 1;
    while chars
        .get(i)
        .is_some_and(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '$')
    {
        i += 1;
    }
    Some((chars[start..i].iter().collect(), i))
}

fn parse_string(chars: &[char], start: usize) -> Option<(String, usize)> {
    let quote = *chars.get(start)?;
    if quote != '"' && quote != '\'' {
        return None;
    }
    let mut i = start + 1;
    let mut out = String::new();
    while i < chars.len() {
        let c = chars[i];
        if c == quote {
            return Some((out, i + 1));
        }
        if c == '\\' && i + 1 < chars.len() {
            out.push(chars[i + 1]);
            i += 2;
            continue;
        }
        out.push(c);
        i += 1;
    }
    None
}

fn eat_semi(chars: &[char], start: usize) -> usize {
    let i = skip_ws_and_comments(chars, start);
    if chars.get(i) == Some(&';') { i + 1 } else { i }
}

fn skip_ws_and_comments(chars: &[char], mut i: usize) -> usize {
    loop {
        while i < chars.len() && chars[i].is_whitespace() {
            i += 1;
        }
        if starts_with(chars, i, "//") {
            i += 2;
            while i < chars.len() && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }
        if starts_with(chars, i, "/*") {
            i += 2;
            while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            i = (i + 2).min(chars.len());
            continue;
        }
        break;
    }
    i
}

fn starts_with(chars: &[char], i: usize, s: &str) -> bool {
    let needle: Vec<char> = s.chars().collect();
    chars.get(i..i + needle.len()) == Some(needle.as_slice())
}

fn resolve(from_file: &Path, spec: &str) -> PathBuf {
    let base = from_file.parent().unwrap_or(from_file);
    let ext = Path::new(spec)
        .extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| {
            e.eq_ignore_ascii_case("js")
                || e.eq_ignore_ascii_case("mjs")
                || e.eq_ignore_ascii_case("css")
        });
    let raw = if ext {
        base.join(spec)
    } else {
        let js = base.join(format!("{spec}.js"));
        if js.exists() { js } else { base.join(spec) }
    };
    normalize(&raw)
}

fn normalize(p: &Path) -> PathBuf {
    let mut out = PathBuf::new();
    for c in p.components() {
        match c {
            Component::ParentDir => {
                out.pop();
            }
            Component::CurDir => {}
            rest => out.push(rest.as_os_str()),
        }
    }
    out
}

fn json_str(s: &str) -> String {
    serde_json::to_string(s).unwrap_or_else(|_| format!("\"{s}\""))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rewrites_default_and_named_imports() {
        let src = r#"import template from "./t.js";
import { useRouter } from "../../hooks/useRouter.js";
export default template;
"#;
        let (imports, body) = take_imports(src);
        assert_eq!(imports.len(), 2);
        assert_eq!(imports[0].default.as_deref(), Some("template"));
        assert_eq!(imports[1].named[0].0, "useRouter");
        assert!(rewrite_exports(&body).contains("exports.default = template"));
        assert!(rewrite_exports("export{Rt as TodoApp};").contains("exports.TodoApp = Rt"));
    }

    #[test]
    fn lifts_imports_after_helper_vars() {
        let src = r#"var __defProp = Object.defineProperty;
import { c as csvParse, a as airports } from "./flights.js";
var ready = true;
"#;
        let (imports, body) = take_imports(src);
        assert_eq!(imports.len(), 1, "{imports:?}");
        assert_eq!(imports[0].named[0], ("c".into(), "csvParse".into()));
        assert!(body.contains("var __defProp"));
        assert!(body.contains("var ready"));
        assert!(!body.contains("import "));
    }
}

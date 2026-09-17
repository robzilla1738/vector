//! Experimental independent JavaScript interpreter (VEC-025).
//!
//! Correctness-first subset. V8 remains the production VM. Replacing V8
//! requires Test262 + embedding evidence that this backend improves a
//! measured objective.

use std::cell::RefCell;
use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// Language features this interpreter implements.
pub const FEATURE_MANIFEST: &[&str] = &[
    "Number",
    "Boolean",
    "String",
    "undefined",
    "null",
    "binary + - * /",
    "unary - !",
    "parentheses",
    "equality == != === !==",
    "relational < > <= >=",
    "logical && ||",
    "ternary ?: ",
    "typeof",
    "string concat",
    "object literals",
    "array literals",
    "property access",
    "index access",
    "modulo",
    "bitwise & | ^",
    "void",
    "if",
    "else",
    "while",
    "for",
    "assignment",
    "comma",
    "var",
    "identifiers (env)",
];

/// Interpreter error.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum VmError {
    /// Syntax the subset rejects.
    #[error("unsupported syntax: {0}")]
    Unsupported(String),
}

/// A value in the subset VM.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Value {
    /// JS undefined.
    Undefined,
    /// JS null.
    Null,
    /// Number.
    Number(f64),
    /// Bool.
    Bool(bool),
    /// String.
    String(String),
    /// Object (string keys).
    Object(BTreeMap<String, Value>),
}

impl Value {
    /// JSON for worker `postMessage` payloads.
    #[must_use]
    pub fn to_json(&self) -> serde_json::Value {
        match self {
            Self::Undefined | Self::Null => serde_json::Value::Null,
            Self::Number(n) => serde_json::json!(n),
            Self::Bool(b) => serde_json::json!(b),
            Self::String(s) => serde_json::json!(s),
            Self::Object(m) => {
                let mut o = serde_json::Map::new();
                for (k, v) in m {
                    o.insert(k.clone(), v.to_json());
                }
                serde_json::Value::Object(o)
            }
        }
    }
}

/// Tiny expression interpreter for the feature manifest.
pub fn eval(source: &str) -> Result<Value, VmError> {
    eval_with(source, &BTreeMap::new())
}

/// [`eval`] with identifier bindings (worker realm, tests).
pub fn eval_with(source: &str, env: &BTreeMap<String, Value>) -> Result<Value, VmError> {
    let src = source.trim().trim_end_matches(';').trim();
    if src.is_empty() {
        return Ok(Value::Undefined);
    }
    Evaluator {
        env,
        locals: RefCell::new(BTreeMap::new()),
    }
    .eval_expr(src)
}

struct Evaluator<'a> {
    env: &'a BTreeMap<String, Value>,
    locals: RefCell<BTreeMap<String, Value>>,
}

impl Evaluator<'_> {
    fn eval_expr(&self, src: &str) -> Result<Value, VmError> {
        let src = src.trim();
        if src.is_empty() {
            return Ok(Value::Undefined);
        }
        if let Some(rest) = src.strip_prefix("var ") {
            return self.eval_expr(rest);
        }
        if let Some(rest) = src.strip_prefix("if") {
            let rest = rest.trim_start();
            if rest.starts_with('(')
                && let Some(end) = matching_paren(rest)
            {
                let cond = &rest[1..end];
                let body = rest[end + 1..].trim();
                let (then_src, else_src) =
                    split_else(body).map_or((body, None), |(t, e)| (t, Some(e)));
                return if is_truthy(&self.eval_expr(cond)?) {
                    self.eval_expr(then_src)
                } else if let Some(e) = else_src {
                    self.eval_expr(e)
                } else {
                    Ok(Value::Undefined)
                };
            }
        }
        if let Some(rest) = src.strip_prefix("while") {
            let rest = rest.trim_start();
            if rest.starts_with('(')
                && let Some(end) = matching_paren(rest)
            {
                let cond = &rest[1..end];
                let body = rest[end + 1..].trim();
                let mut last = Value::Undefined;
                let mut n = 0u32;
                while is_truthy(&self.eval_expr(cond)?) {
                    last = self.eval_expr(body)?;
                    n += 1;
                    if n > 10_000 {
                        return Err(VmError::Unsupported("while iteration limit".into()));
                    }
                }
                return Ok(last);
            }
        }
        if let Some(rest) = src.strip_prefix("for") {
            let rest = rest.trim_start();
            if rest.starts_with('(')
                && let Some(end) = matching_paren(rest)
            {
                let head = &rest[1..end];
                let body = rest[end + 1..].trim();
                let parts = split_top_all(head, ';');
                if parts.len() == 3 {
                    let (init, cond, step) = (parts[0], parts[1], parts[2]);
                    if !init.is_empty() {
                        self.eval_expr(init)?;
                    }
                    let mut last = Value::Undefined;
                    let mut n = 0u32;
                    loop {
                        if !cond.is_empty() && !is_truthy(&self.eval_expr(cond)?) {
                            break;
                        }
                        last = self.eval_expr(body)?;
                        if !step.is_empty() {
                            self.eval_expr(step)?;
                        }
                        n += 1;
                        if n > 10_000 {
                            return Err(VmError::Unsupported("for iteration limit".into()));
                        }
                    }
                    return Ok(last);
                }
            }
        }
        if src.starts_with('{') && src.ends_with('}') && wrapping_braces(src) {
            return self.parse_object(&src[1..src.len() - 1]);
        }
        if src.starts_with('[') && src.ends_with(']') && wrapping_brackets(src) {
            return self.parse_array(&src[1..src.len() - 1]);
        }
        if let Some((l, r)) = split_top(src, ',') {
            let _ = self.eval_expr(l)?;
            return self.eval_expr(r);
        }
        if let Some((name, val)) = split_assignment(src)
            && is_ident(name)
        {
            let v = self.eval_expr(val)?;
            self.locals.borrow_mut().insert(name.to_owned(), v.clone());
            return Ok(v);
        }
        self.parse_ternary(src)
    }

    fn parse_ternary(&self, src: &str) -> Result<Value, VmError> {
        if let Some((cond, rest)) = split_top(src, '?') {
            let (yes, no) = split_top(rest, ':')
                .ok_or_else(|| VmError::Unsupported(format!("ternary missing ':': {src}")))?;
            return if is_truthy(&self.parse_or(cond)?) {
                self.parse_ternary(yes)
            } else {
                self.parse_ternary(no)
            };
        }
        self.parse_or(src)
    }

    fn parse_or(&self, src: &str) -> Result<Value, VmError> {
        if let Some((l, r)) = split_top_str(src, "||") {
            let left = self.parse_or(l)?;
            return if is_truthy(&left) {
                Ok(left)
            } else {
                self.parse_and(r)
            };
        }
        self.parse_and(src)
    }

    fn parse_and(&self, src: &str) -> Result<Value, VmError> {
        if let Some((l, r)) = split_top_str(src, "&&") {
            let left = self.parse_and(l)?;
            return if !is_truthy(&left) {
                Ok(left)
            } else {
                self.parse_eq(r)
            };
        }
        self.parse_eq(src)
    }

    fn parse_eq(&self, src: &str) -> Result<Value, VmError> {
        if let Some((l, r)) = split_top_str(src, "!==") {
            return Ok(Value::Bool(self.parse_eq(l)? != self.parse_rel(r)?));
        }
        if let Some((l, r)) = split_top_str(src, "===") {
            return Ok(Value::Bool(self.parse_eq(l)? == self.parse_rel(r)?));
        }
        if let Some((l, r)) = split_top_str(src, "!=") {
            return Ok(Value::Bool(self.parse_eq(l)? != self.parse_rel(r)?));
        }
        if let Some((l, r)) = split_top_str(src, "==") {
            return Ok(Value::Bool(values_loose_eq(
                &self.parse_eq(l)?,
                &self.parse_rel(r)?,
            )));
        }
        self.parse_rel(src)
    }

    fn parse_rel(&self, src: &str) -> Result<Value, VmError> {
        if let Some((l, r)) = split_top_str(src, "<=") {
            return num_cmp(self.parse_rel(l)?, self.parse_add(r)?, |a, b| a <= b);
        }
        if let Some((l, r)) = split_top_str(src, ">=") {
            return num_cmp(self.parse_rel(l)?, self.parse_add(r)?, |a, b| a >= b);
        }
        if let Some((l, r)) = split_top(src, '<') {
            return num_cmp(self.parse_rel(l)?, self.parse_add(r)?, |a, b| a < b);
        }
        if let Some((l, r)) = split_top(src, '>') {
            return num_cmp(self.parse_rel(l)?, self.parse_add(r)?, |a, b| a > b);
        }
        self.parse_bit(src)
    }

    fn parse_bit(&self, src: &str) -> Result<Value, VmError> {
        if let Some((l, r)) = split_top(src, '|') {
            if !l.is_empty() && !l.trim_end().ends_with('|') && !r.starts_with('|') {
                return num_bin(self.parse_bit(l)?, self.parse_add(r)?, |a, b| {
                    (a as i64 | b as i64) as f64
                });
            }
        }
        if let Some((l, r)) = split_top(src, '^') {
            return num_bin(self.parse_bit(l)?, self.parse_add(r)?, |a, b| {
                (a as i64 ^ b as i64) as f64
            });
        }
        if let Some((l, r)) = split_top(src, '&') {
            if !l.is_empty() && !l.trim_end().ends_with('&') && !r.starts_with('&') {
                return num_bin(self.parse_bit(l)?, self.parse_add(r)?, |a, b| {
                    (a as i64 & b as i64) as f64
                });
            }
        }
        self.parse_add(src)
    }

    fn parse_add(&self, src: &str) -> Result<Value, VmError> {
        if let Some((l, r)) = split_top(src, '+') {
            return add_vals(self.parse_add(l)?, self.parse_mul(r)?);
        }
        if let Some((l, r)) = split_top(src, '-') {
            if !l.is_empty() {
                return num_bin(self.parse_add(l)?, self.parse_mul(r)?, |a, b| a - b);
            }
        }
        self.parse_mul(src)
    }

    fn parse_mul(&self, src: &str) -> Result<Value, VmError> {
        if let Some((l, r)) = split_top(src, '*') {
            return num_bin(self.parse_mul(l)?, self.parse_unary(r)?, |a, b| a * b);
        }
        if let Some((l, r)) = split_top(src, '/') {
            return num_bin(self.parse_mul(l)?, self.parse_unary(r)?, |a, b| a / b);
        }
        if let Some((l, r)) = split_top(src, '%') {
            return num_bin(self.parse_mul(l)?, self.parse_unary(r)?, |a, b| a % b);
        }
        self.parse_unary(src)
    }

    fn parse_unary(&self, src: &str) -> Result<Value, VmError> {
        let src = src.trim();
        if let Some(rest) = src.strip_prefix("typeof") {
            let rest = rest.trim_start();
            return Ok(Value::String(typeof_name(&self.eval_expr(rest)?).into()));
        }
        if let Some(rest) = src.strip_prefix("void") {
            let _ = self.eval_expr(rest.trim_start())?;
            return Ok(Value::Undefined);
        }
        if let Some(rest) = src.strip_prefix('!') {
            return Ok(Value::Bool(!is_truthy(&self.eval_expr(rest)?)));
        }
        if let Some(rest) = src.strip_prefix('-') {
            return match self.eval_expr(rest)? {
                Value::Number(n) => Ok(Value::Number(-n)),
                other => Err(VmError::Unsupported(format!("unary - on {other:?}"))),
            };
        }
        self.parse_member(src)
    }

    fn parse_member(&self, src: &str) -> Result<Value, VmError> {
        if src.ends_with(']') {
            if let Some(open) = last_index_open(src) {
                if open == 0 && wrapping_brackets(src) {
                    return self.parse_array(&src[1..src.len() - 1]);
                }
                if open > 0 {
                    let obj = self.parse_member(&src[..open])?;
                    let key = self.eval_expr(&src[open + 1..src.len() - 1])?;
                    return index_prop(&obj, &key);
                }
            }
        }
        if let Some((l, r)) = split_top(src, '.') {
            let r = r.trim();
            if is_ident(r) {
                let obj = self.parse_member(l)?;
                return prop(&obj, r);
            }
        }
        self.parse_primary(src)
    }

    fn parse_primary(&self, src: &str) -> Result<Value, VmError> {
        let src = src.trim();
        if src.starts_with('(') && src.ends_with(')') && wrapping_parens(src) {
            return self.eval_expr(&src[1..src.len() - 1]);
        }
        if src.starts_with('{') && src.ends_with('}') && wrapping_braces(src) {
            return self.parse_object(&src[1..src.len() - 1]);
        }
        if src.starts_with('[') && src.ends_with(']') && wrapping_brackets(src) {
            return self.parse_array(&src[1..src.len() - 1]);
        }
        if src == "true" {
            return Ok(Value::Bool(true));
        }
        if src == "false" {
            return Ok(Value::Bool(false));
        }
        if src == "undefined" {
            return Ok(Value::Undefined);
        }
        if src == "null" {
            return Ok(Value::Null);
        }
        if let Some(s) = parse_string(src) {
            return Ok(Value::String(s));
        }
        if is_ident(src) {
            if let Some(v) = self.locals.borrow().get(src).cloned() {
                return Ok(v);
            }
            return Ok(self.env.get(src).cloned().unwrap_or(Value::Undefined));
        }
        src.parse::<f64>()
            .map(Value::Number)
            .map_err(|_| VmError::Unsupported(src.to_owned()))
    }

    fn parse_object(&self, body: &str) -> Result<Value, VmError> {
        let body = body.trim();
        let mut map = BTreeMap::new();
        if body.is_empty() {
            return Ok(Value::Object(map));
        }
        for part in split_top_all(body, ',') {
            let (k, v) = split_top_first(part, ':')
                .ok_or_else(|| VmError::Unsupported(format!("object field: {part}")))?;
            let key = parse_string(k.trim()).unwrap_or_else(|| k.trim().to_owned());
            map.insert(key, self.eval_expr(v)?);
        }
        Ok(Value::Object(map))
    }

    fn parse_array(&self, body: &str) -> Result<Value, VmError> {
        let body = body.trim();
        let mut map = BTreeMap::new();
        let parts: Vec<&str> = if body.is_empty() {
            Vec::new()
        } else {
            split_top_all(body, ',')
        };
        let n = parts.len();
        for (i, part) in parts.into_iter().enumerate() {
            map.insert(i.to_string(), self.eval_expr(part)?);
        }
        map.insert("length".into(), Value::Number(n as f64));
        Ok(Value::Object(map))
    }
}

fn typeof_name(v: &Value) -> &'static str {
    match v {
        Value::Undefined => "undefined",
        Value::Null | Value::Object(_) => "object",
        Value::Number(_) => "number",
        Value::Bool(_) => "boolean",
        Value::String(_) => "string",
    }
}

fn prop(obj: &Value, name: &str) -> Result<Value, VmError> {
    match obj {
        Value::Object(m) => Ok(m.get(name).cloned().unwrap_or(Value::Undefined)),
        Value::String(s) if name == "length" => Ok(Value::Number(s.chars().count() as f64)),
        _ => Err(VmError::Unsupported(format!("property {name} on {obj:?}"))),
    }
}

fn index_prop(obj: &Value, key: &Value) -> Result<Value, VmError> {
    let name = match key {
        Value::Number(n) => {
            if n.fract() == 0.0 {
                (*n as i64).to_string()
            } else {
                n.to_string()
            }
        }
        Value::String(s) => s.clone(),
        other => return Err(VmError::Unsupported(format!("index {other:?}"))),
    };
    match obj {
        Value::String(s) => {
            let i: usize = name.parse().unwrap_or(usize::MAX);
            Ok(s.chars()
                .nth(i)
                .map_or(Value::Undefined, |c| Value::String(c.to_string())))
        }
        other => prop(other, &name),
    }
}

fn last_index_open(src: &str) -> Option<usize> {
    let b = src.as_bytes();
    if b.last() != Some(&b']') {
        return None;
    }
    let mut depth = 0i32;
    let mut quote = 0u8;
    for i in (0..b.len()).rev() {
        let c = b[i];
        if quote != 0 {
            if c == quote {
                quote = 0;
            }
            continue;
        }
        match c {
            b'"' | b'\'' => quote = c,
            b']' => depth += 1,
            b'[' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

fn is_ident(s: &str) -> bool {
    let mut chars = s.chars();
    match chars.next() {
        Some(c) if c == '_' || c == '$' || c.is_ascii_alphabetic() => {
            chars.all(|c| c == '_' || c == '$' || c.is_ascii_alphanumeric())
        }
        _ => false,
    }
}

fn values_loose_eq(a: &Value, b: &Value) -> bool {
    a == b
}

fn add_vals(l: Value, r: Value) -> Result<Value, VmError> {
    match (l, r) {
        (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a + b)),
        (Value::String(a), b) => Ok(Value::String(format!("{a}{}", display_js(&b)))),
        (a, Value::String(b)) => Ok(Value::String(format!("{}{b}", display_js(&a)))),
        _ => Err(VmError::Unsupported("non-numeric binary operand".into())),
    }
}

fn display_js(v: &Value) -> String {
    match v {
        Value::Undefined => "undefined".into(),
        Value::Null => "null".into(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::String(s) => s.clone(),
        Value::Object(_) => "[object Object]".into(),
    }
}

fn is_truthy(v: &Value) -> bool {
    match v {
        Value::Undefined | Value::Null => false,
        Value::Number(n) => *n != 0.0 && !n.is_nan(),
        Value::Bool(b) => *b,
        Value::String(s) => !s.is_empty(),
        Value::Object(_) => true,
    }
}

fn parse_string(src: &str) -> Option<String> {
    let b = src.as_bytes();
    if b.len() < 2 {
        return None;
    }
    let q = b[0];
    if q != b'"' && q != b'\'' {
        return None;
    }
    let mut i = 1;
    while i < b.len() {
        if b[i] == q {
            return (i + 1 == b.len()).then(|| src[1..i].to_owned());
        }
        i += 1;
    }
    None
}

fn num_bin(l: Value, r: Value, op: fn(f64, f64) -> f64) -> Result<Value, VmError> {
    match (l, r) {
        (Value::Number(a), Value::Number(b)) => Ok(Value::Number(op(a, b))),
        _ => Err(VmError::Unsupported("non-numeric binary operand".into())),
    }
}

fn num_cmp(l: Value, r: Value, op: fn(f64, f64) -> bool) -> Result<Value, VmError> {
    match (l, r) {
        (Value::Number(a), Value::Number(b)) => Ok(Value::Bool(op(a, b))),
        _ => Err(VmError::Unsupported("non-numeric comparison".into())),
    }
}

/// Runs a Test262-subset file made of `assert.sameValue(actual, expected);` lines.
pub fn eval_test262(source: &str) -> Result<(), VmError> {
    for (i, line) in source.lines().enumerate() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("//") || line.starts_with("/*") {
            continue;
        }
        let Some(rest) = line.strip_prefix("assert.sameValue(") else {
            return Err(VmError::Unsupported(format!("line {}: {line}", i + 1)));
        };
        let rest = rest.trim_end_matches(';').trim();
        let rest = rest
            .strip_suffix(')')
            .ok_or_else(|| VmError::Unsupported(format!("line {}: missing ')'", i + 1)))?;
        let (actual_src, expected_src) = split_top(rest, ',').ok_or_else(|| {
            VmError::Unsupported(format!("line {}: expected two arguments", i + 1))
        })?;
        let actual = eval(actual_src).map_err(|e| {
            VmError::Unsupported(format!("line {} actual `{actual_src}`: {e}", i + 1))
        })?;
        let expected = eval(expected_src).map_err(|e| {
            VmError::Unsupported(format!("line {} expected `{expected_src}`: {e}", i + 1))
        })?;
        if actual != expected {
            return Err(VmError::Unsupported(format!(
                "line {}: {actual:?} != {expected:?}",
                i + 1
            )));
        }
    }
    Ok(())
}

fn is_ident_byte(c: u8) -> bool {
    c == b'_' || c == b'$' || c.is_ascii_alphanumeric()
}

fn split_else(src: &str) -> Option<(&str, &str)> {
    let bytes = src.as_bytes();
    let mut depth = 0i32;
    let mut braces = 0i32;
    let mut brackets = 0i32;
    let mut quote = 0u8;
    let mut i = 0usize;
    while i + 4 <= bytes.len() {
        let c = bytes[i];
        if quote != 0 {
            if c == quote {
                quote = 0;
            }
            i += 1;
            continue;
        }
        match c {
            b'"' | b'\'' => {
                quote = c;
                i += 1;
                continue;
            }
            b'(' => depth += 1,
            b')' => depth -= 1,
            b'{' => braces += 1,
            b'}' => braces -= 1,
            b'[' => brackets += 1,
            b']' => brackets -= 1,
            _ => {}
        }
        if depth == 0
            && braces == 0
            && brackets == 0
            && &bytes[i..i + 4] == b"else"
            && (i == 0 || !is_ident_byte(bytes[i - 1]))
            && (i + 4 == bytes.len() || !is_ident_byte(bytes[i + 4]))
        {
            return Some((src[..i].trim(), src[i + 4..].trim()));
        }
        i += 1;
    }
    None
}

fn split_assignment(src: &str) -> Option<(&str, &str)> {
    let bytes = src.as_bytes();
    let mut depth = 0i32;
    let mut braces = 0i32;
    let mut brackets = 0i32;
    let mut quote = 0u8;
    let mut last = None;
    let mut i = 0usize;
    while i < bytes.len() {
        let c = bytes[i];
        if quote != 0 {
            if c == quote {
                quote = 0;
            }
            i += 1;
            continue;
        }
        match c {
            b'"' | b'\'' => {
                quote = c;
                i += 1;
                continue;
            }
            b'(' => depth += 1,
            b')' => depth -= 1,
            b'{' => braces += 1,
            b'}' => braces -= 1,
            b'[' => brackets += 1,
            b']' => brackets -= 1,
            b'=' if depth == 0 && braces == 0 && brackets == 0 => {
                let prev = if i > 0 { bytes[i - 1] } else { 0 };
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                if prev != b'=' && prev != b'!' && prev != b'<' && prev != b'>' && next != b'=' {
                    last = Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }
    last.map(|i| (src[..i].trim(), src[i + 1..].trim()))
}

fn matching_paren(src: &str) -> Option<usize> {
    let b = src.as_bytes();
    if b.first() != Some(&b'(') {
        return None;
    }
    let mut depth = 0i32;
    for (i, &c) in b.iter().enumerate() {
        match c {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

fn wrapping_parens(src: &str) -> bool {
    wrapping(src, b'(', b')')
}

fn wrapping_braces(src: &str) -> bool {
    wrapping(src, b'{', b'}')
}

fn wrapping_brackets(src: &str) -> bool {
    wrapping(src, b'[', b']')
}

fn wrapping(src: &str, open: u8, close: u8) -> bool {
    let b = src.as_bytes();
    if b.first() != Some(&open) || b.last() != Some(&close) {
        return false;
    }
    let mut depth = 0i32;
    let mut quote = 0u8;
    for (i, &c) in b.iter().enumerate() {
        if quote != 0 {
            if c == quote {
                quote = 0;
            }
            continue;
        }
        match c {
            b'"' | b'\'' => quote = c,
            x if x == open => depth += 1,
            x if x == close => {
                depth -= 1;
                if depth == 0 {
                    return i + 1 == b.len();
                }
            }
            _ => {}
        }
    }
    false
}

fn split_top(src: &str, op: char) -> Option<(&str, &str)> {
    let mut depth = 0i32;
    let mut braces = 0i32;
    let mut brackets = 0i32;
    let mut quote = 0u8;
    let mut last = None;
    for (i, c) in src.char_indices() {
        if quote != 0 {
            if c == quote as char {
                quote = 0;
            }
            continue;
        }
        match c {
            '"' | '\'' => quote = c as u8,
            '(' => depth += 1,
            ')' => depth -= 1,
            '{' => braces += 1,
            '}' => braces -= 1,
            '[' => brackets += 1,
            ']' => brackets -= 1,
            x if x == op && depth == 0 && braces == 0 && brackets == 0 && i > 0 => {
                last = Some(i);
            }
            _ => {}
        }
    }
    last.map(|i| (src[..i].trim(), src[i + op.len_utf8()..].trim()))
}

fn split_top_first(src: &str, op: char) -> Option<(&str, &str)> {
    let mut depth = 0i32;
    let mut braces = 0i32;
    let mut brackets = 0i32;
    let mut quote = 0u8;
    for (i, c) in src.char_indices() {
        if quote != 0 {
            if c == quote as char {
                quote = 0;
            }
            continue;
        }
        match c {
            '"' | '\'' => quote = c as u8,
            '(' => depth += 1,
            ')' => depth -= 1,
            '{' => braces += 1,
            '}' => braces -= 1,
            '[' => brackets += 1,
            ']' => brackets -= 1,
            x if x == op && depth == 0 && braces == 0 && brackets == 0 => {
                return Some((src[..i].trim(), src[i + x.len_utf8()..].trim()));
            }
            _ => {}
        }
    }
    None
}

fn split_top_all(src: &str, op: char) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut rest = src;
    while let Some((l, r)) = split_top(rest, op) {
        parts.push(r);
        rest = l;
    }
    parts.push(rest);
    parts.reverse();
    parts
}

fn split_top_str<'a>(src: &'a str, op: &str) -> Option<(&'a str, &'a str)> {
    let bytes = src.as_bytes();
    let opb = op.as_bytes();
    if opb.is_empty() || src.len() < opb.len() {
        return None;
    }
    let mut depth = 0i32;
    let mut braces = 0i32;
    let mut brackets = 0i32;
    let mut quote = 0u8;
    let mut last = None;
    let mut i = 0usize;
    while i + opb.len() <= bytes.len() {
        let c = bytes[i];
        if quote != 0 {
            if c == quote {
                quote = 0;
            }
            i += 1;
            continue;
        }
        match c {
            b'"' | b'\'' => {
                quote = c;
                i += 1;
                continue;
            }
            b'(' => depth += 1,
            b')' => depth -= 1,
            b'{' => braces += 1,
            b'}' => braces -= 1,
            b'[' => brackets += 1,
            b']' => brackets -= 1,
            _ => {}
        }
        if depth == 0 && braces == 0 && brackets == 0 && i > 0 && &bytes[i..i + opb.len()] == opb {
            let longer_eq = (op == "==" || op == "!=" || op == "===" || op == "!==")
                && i + opb.len() < bytes.len()
                && bytes[i + opb.len()] == b'=';
            let prev_eq = (op == "==" || op == "!=")
                && i > 0
                && (bytes[i - 1] == b'=' || bytes[i - 1] == b'!');
            let part_of_eq = op == "<" && i + 1 < bytes.len() && bytes[i + 1] == b'=';
            let part_of_ge = op == ">" && i + 1 < bytes.len() && bytes[i + 1] == b'=';
            if !longer_eq && !prev_eq && !part_of_eq && !part_of_ge {
                last = Some(i);
            }
        }
        i += 1;
    }
    last.map(|i| (src[..i].trim(), src[i + op.len()..].trim()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn manifest_and_arithmetic() {
        assert!(FEATURE_MANIFEST.contains(&"Number"));
        assert_eq!(eval("1 + 2 * 3").unwrap(), Value::Number(7.0));
        assert_eq!(eval("10 - 4").unwrap(), Value::Number(6.0));
        assert_eq!(eval("\"hi\"").unwrap(), Value::String("hi".into()));
        assert_eq!(eval("-3 + 1").unwrap(), Value::Number(-2.0));
        assert_eq!(eval("!false").unwrap(), Value::Bool(true));
        assert_eq!(eval("1 == 1").unwrap(), Value::Bool(true));
        assert_eq!(eval("1 != 2").unwrap(), Value::Bool(true));
        assert_eq!(eval("typeof 1").unwrap(), Value::String("number".into()));
        assert_eq!(eval("\"a\" + \"b\"").unwrap(), Value::String("ab".into()));
        assert_eq!(eval("1 === 1").unwrap(), Value::Bool(true));
        assert_eq!(eval("1 < 2").unwrap(), Value::Bool(true));
        assert_eq!(eval("true && false").unwrap(), Value::Bool(false));
        assert_eq!(eval("false || true").unwrap(), Value::Bool(true));
        assert_eq!(eval("1 ? 2 : 3").unwrap(), Value::Number(2.0));
        assert_eq!(eval("null").unwrap(), Value::Null);
        let obj = eval("{a: 1}").unwrap();
        assert_eq!(eval("({a: 1}).a").unwrap(), Value::Number(1.0));
        assert_eq!(eval("[1, 2].length").unwrap(), Value::Number(2.0));
        assert_eq!(eval("[1, 2][0]").unwrap(), Value::Number(1.0));
        assert_eq!(eval("10 % 3").unwrap(), Value::Number(1.0));
        assert_eq!(eval("1 | 2").unwrap(), Value::Number(3.0));
        assert_eq!(eval("void 1").unwrap(), Value::Undefined);
        assert_eq!(eval("[].length").unwrap(), Value::Number(0.0));
        assert_eq!(eval("if (1) 4").unwrap(), Value::Number(4.0));
        assert_eq!(eval("if (0) 4").unwrap(), Value::Undefined);
        assert_eq!(eval("if (0) 1 else 2").unwrap(), Value::Number(2.0));
        assert_eq!(eval("if (1) 2 else 3").unwrap(), Value::Number(2.0));
        assert_eq!(eval("while (0) 9").unwrap(), Value::Undefined);
        assert_eq!(
            eval("(i = 0, while (i < 3) i = i + 1)").unwrap(),
            Value::Number(3.0)
        );
        assert_eq!(
            eval("for (i = 0; i < 3; i = i + 1) i").unwrap(),
            Value::Number(2.0)
        );
        assert_eq!(eval("false || 1").unwrap(), Value::Number(1.0));
        assert!(matches!(obj, Value::Object(_)));
        assert!(eval("function(){}").is_err());
        let mut env = BTreeMap::new();
        env.insert("document".into(), Value::Undefined);
        assert_eq!(
            eval_with("typeof document", &env).unwrap(),
            Value::String("undefined".into())
        );
    }

    #[test]
    fn test262_subset_assert_same_value() {
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../conformance/test262-subset");
        let mut files = 0usize;
        for entry in std::fs::read_dir(&dir).unwrap() {
            let path = entry.unwrap().path();
            if path.extension().and_then(|e| e.to_str()) != Some("js") {
                continue;
            }
            let src = std::fs::read_to_string(&path).unwrap();
            eval_test262(&src).unwrap_or_else(|e| panic!("{}: {e}", path.display()));
            files += 1;
        }
        assert!(files >= 10, "expected expanded Test262 subset, got {files}");
    }
}

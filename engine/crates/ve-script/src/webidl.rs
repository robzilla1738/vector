//! Minimal WebIDL front end and Rust binding-stub generator.
//!
//! This is the seed of the bindings pipeline. It understands the subset of
//! WebIDL needed to describe DOM interfaces — `interface X : Y { … }` with
//! attributes, operations and constants, plus `?` nullable, `sequence<T>`
//! and `optional` arguments — and emits a Rust trait per interface that the
//! engine will implement over `ve-dom`. Extended attributes (`[Exposed=…]`)
//! are parsed and ignored. Dictionaries, enums, callbacks, mixins and
//! `partial` interfaces are recognised and skipped so real spec files parse.

use std::fmt::Write;

/// An operation argument.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Argument {
    /// Argument name.
    pub name: String,
    /// WebIDL type as written.
    pub ty: String,
    /// `optional` argument.
    pub optional: bool,
}

/// An interface member.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Member {
    /// `[readonly] attribute T name;`
    Attribute {
        /// Attribute name.
        name: String,
        /// WebIDL type.
        ty: String,
        /// Whether a setter is generated.
        readonly: bool,
    },
    /// `T name(args);`
    Operation {
        /// Operation name.
        name: String,
        /// WebIDL return type (`undefined` for none).
        return_type: String,
        /// Arguments in order.
        arguments: Vec<Argument>,
    },
    /// `const T NAME = value;`
    Const {
        /// Constant name.
        name: String,
        /// WebIDL type.
        ty: String,
        /// Literal value as written.
        value: String,
    },
}

/// A parsed interface.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Interface {
    /// Interface name.
    pub name: String,
    /// Parent interface.
    pub inherits: Option<String>,
    /// Members in source order.
    pub members: Vec<Member>,
}

/// A parse failure with a token offset.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("webidl parse error at token {token}: {message}")]
pub struct WebIdlError {
    /// Index of the offending token.
    pub token: usize,
    /// What went wrong.
    pub message: String,
}

fn strip_comments(src: &str) -> String {
    let mut out = String::with_capacity(src.len());
    let mut rest = src;
    loop {
        let line = rest.find("//");
        let block = rest.find("/*");
        let line_first = match (line, block) {
            (None, None) => {
                out.push_str(rest);
                return out;
            }
            (Some(_), None) => true,
            (Some(l), Some(b)) => l < b,
            (None, Some(_)) => false,
        };
        if line_first {
            let l = line.expect("line comment present");
            out.push_str(&rest[..l]);
            rest = rest[l..].find('\n').map_or("", |n| &rest[l + n..]);
        } else {
            let b = block.expect("block comment present");
            out.push_str(&rest[..b]);
            rest = rest[b + 2..]
                .find("*/")
                .map_or("", |e| &rest[b + 2 + e + 2..]);
        }
    }
}

fn tokenize(src: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut cur = String::new();
    let mut chars = src.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            c if c.is_whitespace() => {
                if !cur.is_empty() {
                    tokens.push(std::mem::take(&mut cur));
                }
            }
            '{' | '}' | '(' | ')' | ';' | ',' | ':' | '=' | '<' | '>' | '[' | ']' => {
                if !cur.is_empty() {
                    tokens.push(std::mem::take(&mut cur));
                }
                tokens.push(c.to_string());
            }
            '.' => {
                // Accumulate the variadic ellipsis `...` into one token.
                if !cur.is_empty() {
                    tokens.push(std::mem::take(&mut cur));
                }
                match tokens.last_mut() {
                    Some(last) if last == "." || last == ".." => last.push('.'),
                    _ => tokens.push(".".to_owned()),
                }
            }
            '?' => {
                // Nullable suffix attaches to the preceding type token.
                cur.push('?');
                tokens.push(std::mem::take(&mut cur));
            }
            '"' => {
                cur.push('"');
                for n in chars.by_ref() {
                    cur.push(n);
                    if n == '"' {
                        break;
                    }
                }
            }
            _ => cur.push(c),
        }
    }
    if !cur.is_empty() {
        tokens.push(cur);
    }
    tokens
}

struct Cursor {
    tokens: Vec<String>,
    pos: usize,
}

impl Cursor {
    fn peek(&self) -> Option<&str> {
        self.tokens.get(self.pos).map(String::as_str)
    }

    fn next(&mut self) -> Option<String> {
        let t = self.tokens.get(self.pos).cloned();
        self.pos += 1;
        t
    }

    fn expect(&mut self, want: &str) -> Result<(), WebIdlError> {
        match self.next() {
            Some(t) if t == want => Ok(()),
            other => Err(self.err(format!("expected `{want}`, found {other:?}"))),
        }
    }

    fn ident(&mut self) -> Result<String, WebIdlError> {
        match self.next() {
            Some(t)
                if t.chars()
                    .next()
                    .is_some_and(|c| c.is_alphabetic() || c == '_') =>
            {
                Ok(t)
            }
            other => Err(self.err(format!("expected identifier, found {other:?}"))),
        }
    }

    fn err(&self, message: String) -> WebIdlError {
        WebIdlError {
            token: self.pos.saturating_sub(1),
            message,
        }
    }

    /// Skips `[ … ]` extended attributes.
    fn skip_extended_attributes(&mut self) {
        if self.peek() == Some("[") {
            let mut depth = 0;
            while let Some(t) = self.next() {
                match t.as_str() {
                    "[" => depth += 1,
                    "]" => {
                        depth -= 1;
                        if depth == 0 {
                            break;
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    /// Skips a `{ … }` block, or up to and including the next `;`.
    fn skip_definition(&mut self) {
        let mut depth = 0;
        while let Some(t) = self.next() {
            match t.as_str() {
                "{" => depth += 1,
                "}" => {
                    depth -= 1;
                    if depth == 0 {
                        if self.peek() == Some(";") {
                            self.pos += 1;
                        }
                        return;
                    }
                }
                ";" if depth == 0 => return,
                _ => {}
            }
        }
    }

    /// Parses a type, including `sequence<T>`, `Promise<T>`, `record<K, V>`,
    /// `unsigned long long` and nullable suffixes.
    fn parse_type(&mut self) -> Result<String, WebIdlError> {
        let mut ty = self.ident()?;
        if ty == "unsigned" || ty == "long" {
            while matches!(self.peek(), Some("long" | "short")) {
                ty.push(' ');
                ty.push_str(&self.next().expect("peeked"));
            }
        }
        if self.peek() == Some("<") {
            self.next();
            ty.push('<');
            ty.push_str(&self.parse_type()?);
            while self.peek() == Some(",") {
                self.next();
                ty.push_str(", ");
                ty.push_str(&self.parse_type()?);
            }
            let closing = self.next();
            match closing.as_deref() {
                Some(">") => {}
                Some(">?") => {
                    ty.push_str(">?");
                    return Ok(ty);
                }
                other => return Err(self.err(format!("expected `>`, found {other:?}"))),
            }
            ty.push('>');
            if self.peek() == Some("?") {
                self.next();
                ty.push('?');
            }
        }
        Ok(ty)
    }
}

/// Parses WebIDL source into interfaces.
pub fn parse_webidl(src: &str) -> Result<Vec<Interface>, WebIdlError> {
    let mut cur = Cursor {
        tokens: tokenize(&strip_comments(src)),
        pos: 0,
    };
    let mut interfaces = Vec::new();
    while cur.peek().is_some() {
        cur.skip_extended_attributes();
        match cur.peek() {
            Some("interface") => {
                cur.next();
                if cur.peek() == Some("mixin") {
                    cur.skip_definition();
                    continue;
                }
                interfaces.push(parse_interface(&mut cur)?);
            }
            Some(
                "partial" | "dictionary" | "enum" | "callback" | "typedef" | "namespace"
                | "includes",
            ) => cur.skip_definition(),
            Some(_) => {
                // `X includes Y;` and other statements.
                cur.skip_definition();
            }
            None => break,
        }
    }
    Ok(interfaces)
}

fn parse_interface(cur: &mut Cursor) -> Result<Interface, WebIdlError> {
    let name = cur.ident()?;
    let inherits = if cur.peek() == Some(":") {
        cur.next();
        Some(cur.ident()?)
    } else {
        None
    };
    cur.expect("{")?;
    let mut members = Vec::new();
    loop {
        cur.skip_extended_attributes();
        match cur.peek() {
            Some("}") => {
                cur.next();
                if cur.peek() == Some(";") {
                    cur.next();
                }
                break;
            }
            None => return Err(cur.err("unterminated interface".into())),
            _ => {}
        }
        if let Some(member) = parse_member(cur)? {
            members.push(member);
        }
    }
    Ok(Interface {
        name,
        inherits,
        members,
    })
}

fn parse_member(cur: &mut Cursor) -> Result<Option<Member>, WebIdlError> {
    let mut readonly = false;
    let mut is_static = false;
    loop {
        match cur.peek() {
            Some("readonly") => {
                readonly = true;
                cur.next();
            }
            Some("static") => {
                is_static = true;
                cur.next();
            }
            Some("stringifier" | "inherit" | "unrestricted") => {
                cur.next();
            }
            Some(
                "getter" | "setter" | "deleter" | "iterable" | "maplike" | "setlike" | "async"
                | "constructor",
            ) => {
                // Special operations are not surfaced as members yet.
                cur.skip_definition();
                return Ok(None);
            }
            _ => break,
        }
    }
    let _ = is_static;
    if cur.peek() == Some("attribute") {
        cur.next();
        let ty = cur.parse_type()?;
        let name = cur.ident()?;
        cur.expect(";")?;
        return Ok(Some(Member::Attribute { name, ty, readonly }));
    }
    if cur.peek() == Some("const") {
        cur.next();
        let ty = cur.parse_type()?;
        let name = cur.ident()?;
        cur.expect("=")?;
        let value = cur
            .next()
            .ok_or_else(|| cur.err("expected constant value".into()))?;
        cur.expect(";")?;
        return Ok(Some(Member::Const { name, ty, value }));
    }
    let return_type = cur.parse_type()?;
    let name = cur.ident()?;
    cur.expect("(")?;
    let mut arguments = Vec::new();
    while cur.peek() != Some(")") {
        cur.skip_extended_attributes();
        let optional = if cur.peek() == Some("optional") {
            cur.next();
            true
        } else {
            false
        };
        let ty = cur.parse_type()?;
        let variadic = if cur.peek() == Some("...") {
            cur.next();
            true
        } else {
            false
        };
        let arg_name = cur.ident()?;
        if cur.peek() == Some("=") {
            cur.next();
            cur.next(); // default value
        }
        arguments.push(Argument {
            name: arg_name,
            ty: if variadic {
                format!("sequence<{ty}>")
            } else {
                ty
            },
            optional,
        });
        if cur.peek() == Some(",") {
            cur.next();
        }
    }
    cur.expect(")")?;
    cur.expect(";")?;
    Ok(Some(Member::Operation {
        name,
        return_type,
        arguments,
    }))
}

/// Maps a WebIDL type to the Rust type used in generated traits.
#[must_use]
pub fn rust_type(webidl: &str) -> String {
    if let Some(inner) = webidl.strip_suffix('?') {
        return format!("Option<{}>", rust_type(inner));
    }
    if let Some(inner) = webidl
        .strip_prefix("sequence<")
        .and_then(|s| s.strip_suffix('>'))
    {
        return format!("Vec<{}>", rust_type(inner));
    }
    if let Some(inner) = webidl
        .strip_prefix("Promise<")
        .and_then(|s| s.strip_suffix('>'))
    {
        return format!("Promise<{}>", rust_type(inner));
    }
    match webidl {
        "DOMString" | "USVString" | "ByteString" | "CSSOMString" => "String".into(),
        "boolean" => "bool".into(),
        "byte" => "i8".into(),
        "octet" => "u8".into(),
        "short" => "i16".into(),
        "unsigned short" => "u16".into(),
        "long" => "i32".into(),
        "unsigned long" => "u32".into(),
        "long long" => "i64".into(),
        "unsigned long long" => "u64".into(),
        "float" | "unrestricted float" => "f32".into(),
        "double" | "unrestricted double" => "f64".into(),
        "undefined" | "void" => "()".into(),
        "any" | "object" => "JsValue".into(),
        other => other.to_owned(),
    }
}

fn snake_case(name: &str) -> String {
    let mut out = String::new();
    for (i, c) in name.chars().enumerate() {
        if c.is_uppercase() {
            if i > 0 {
                out.push('_');
            }
            out.extend(c.to_lowercase());
        } else {
            out.push(c);
        }
    }
    match out.as_str() {
        "type" | "match" | "ref" | "self" | "mod" | "impl" | "loop" | "move" | "use" => {
            format!("r#{out}")
        }
        _ => out,
    }
}

/// Generates a Rust trait describing the interface. The engine implements
/// the trait over `ve-dom` types; VM backends bind the trait to script.
#[must_use]
pub fn generate_rust_stub(iface: &Interface) -> String {
    let mut out = String::new();
    let _ = writeln!(out, "// Generated from WebIDL by ve-script; do not edit.");
    let _ = writeln!(out, "/// The `{}` interface.", iface.name);
    let supertrait = iface
        .inherits
        .as_ref()
        .map_or(String::new(), |p| format!(": {p}Interface"));
    let _ = writeln!(out, "pub trait {}Interface{supertrait} {{", iface.name);
    for member in &iface.members {
        match member {
            Member::Attribute { name, ty, readonly } => {
                let rust_ty = rust_type(ty);
                let snake = snake_case(name);
                let _ = writeln!(out, "    /// `{name}` getter.");
                let _ = writeln!(out, "    fn {snake}(&self) -> {rust_ty};");
                if !readonly {
                    let _ = writeln!(out, "    /// `{name}` setter.");
                    let _ = writeln!(out, "    fn set_{snake}(&mut self, value: {rust_ty});");
                }
            }
            Member::Operation {
                name,
                return_type,
                arguments,
            } => {
                let args: Vec<String> = arguments
                    .iter()
                    .map(|a| {
                        let ty = rust_type(&a.ty);
                        let ty = if a.optional && !ty.starts_with("Option<") {
                            format!("Option<{ty}>")
                        } else {
                            ty
                        };
                        format!("{}: {ty}", snake_case(&a.name))
                    })
                    .collect();
                let ret = rust_type(return_type);
                let ret = if ret == "()" {
                    String::new()
                } else {
                    format!(" -> {ret}")
                };
                let _ = writeln!(out, "    /// `{name}()` operation.");
                let _ = writeln!(
                    out,
                    "    fn {}(&mut self{}{}){ret};",
                    snake_case(name),
                    if args.is_empty() { "" } else { ", " },
                    args.join(", ")
                );
            }
            Member::Const { name, ty, value } => {
                let _ = writeln!(out, "    /// `{name}` constant.");
                let _ = writeln!(out, "    const {name}: {} = {value};", rust_type(ty));
            }
        }
    }
    out.push_str("}\n");
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    const IDL: &str = r#"
        // A comment
        [Exposed=Window]
        interface Node : EventTarget {
          const unsigned short ELEMENT_NODE = 1;
          readonly attribute DOMString nodeName;
          attribute DOMString? textContent;
          [CEReactions] Node appendChild(Node node);
          boolean contains(Node? other);
          undefined normalize();
          sequence<Node> lookup(optional DOMString selector, long... rest);
        };
        dictionary GetRootNodeOptions { boolean composed = false; };
        interface mixin ParentNode { readonly attribute unsigned long childElementCount; };
        Node includes ParentNode;
    "#;

    #[test]
    fn parses_interfaces_and_generates_traits() {
        let interfaces = parse_webidl(IDL).unwrap();
        assert_eq!(interfaces.len(), 1);
        let node = &interfaces[0];
        assert_eq!(node.name, "Node");
        assert_eq!(node.inherits.as_deref(), Some("EventTarget"));
        assert_eq!(node.members.len(), 7);
        assert_eq!(
            node.members[2],
            Member::Attribute {
                name: "textContent".into(),
                ty: "DOMString?".into(),
                readonly: false
            }
        );
        assert!(
            matches!(&node.members[6], Member::Operation { arguments, .. } if arguments[1].ty == "sequence<long>")
        );

        let stub = generate_rust_stub(node);
        assert!(
            stub.contains("pub trait NodeInterface: EventTargetInterface {"),
            "{stub}"
        );
        assert!(stub.contains("const ELEMENT_NODE: u16 = 1;"));
        assert!(stub.contains("fn node_name(&self) -> String;"));
        assert!(!stub.contains("fn set_node_name"), "readonly has no setter");
        assert!(stub.contains("fn set_text_content(&mut self, value: Option<String>);"));
        assert!(stub.contains("fn append_child(&mut self, node: Node) -> Node;"));
        assert!(stub.contains("fn normalize(&mut self);"));
        assert!(stub.contains(
            "fn lookup(&mut self, selector: Option<String>, rest: Vec<i32>) -> Vec<Node>;"
        ));
        assert!(parse_webidl("interface Broken {").is_err());
    }
}

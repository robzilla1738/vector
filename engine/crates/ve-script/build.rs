//! Generate Rust binding traits from `idl/*.webidl` (plan A14).

fn main() {
    println!("cargo:rerun-if-changed=idl");
    println!("cargo:rerun-if-changed=src/webidl.rs");

    let mut interfaces = Vec::new();
    let mut files: Vec<std::path::PathBuf> = std::fs::read_dir("idl")
        .expect("idl/")
        .filter_map(|e| {
            let p = e.ok()?.path();
            (p.extension()? == "webidl").then_some(p)
        })
        .collect();
    files.sort();
    for path in files {
        let src = std::fs::read_to_string(&path).unwrap_or_else(|e| {
            panic!("read {}: {e}", path.display());
        });
        interfaces.extend(webidl::parse_webidl(&src).unwrap_or_else(|e| {
            panic!("{}: {e}", path.display());
        }));
    }

    let mut out = String::from(
        r#"// Generated from engine/crates/ve-script/idl/*.webidl. Do not edit.

use crate::vm::JsValue;
use ve_core::NodeId as Node;


/// WebIDL `Promise<T>` stand-in used by generated traits.
pub struct Promise<T>(std::marker::PhantomData<T>);

type Element = Node;
type Document = Node;
type Text = Node;
type Comment = Node;
type DocumentFragment = Node;
type ShadowRoot = Node;
type Location = JsValue;
type History = JsValue;
type Storage = JsValue;
type CustomElementRegistry = JsValue;
type CSSStyleDeclaration = JsValue;
type Response = JsValue;
type DOMRect = JsValue;
type HTMLCollection = JsValue;
type DOMImplementation = JsValue;
type MediaQueryList = JsValue;
type Worker = JsValue;
type ServiceWorker = JsValue;
type ServiceWorkerRegistration = JsValue;
type ServiceWorkerContainer = JsValue;
type XMLHttpRequest = JsValue;
type Client = JsValue;
type Clients = JsValue;
type ServiceWorkerGlobalScope = JsValue;
type HTMLInputElement = Node;
type HTMLFormElement = Node;
type HTMLButtonElement = Node;


"#,
    );
    for iface in &interfaces {
        out.push_str(&webidl::generate_rust_stub(iface));
        out.push('\n');
    }
    let names: Vec<String> = interfaces
        .iter()
        .map(|i| format!("\"{}\"", i.name))
        .collect();
    out.push_str(&format!(
        "/// Interface names generated from `idl/*.webidl`.\npub const INTERFACE_NAMES: &[&str] = &[{}];\n",
        names.join(", ")
    ));

    let dest = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap()).join("dom_bindings.rs");
    std::fs::write(&dest, out).expect("write generated bindings");
}

#[path = "src/webidl.rs"]
mod webidl;

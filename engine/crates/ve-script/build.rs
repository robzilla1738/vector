//! Generate Rust binding traits from `idl/*.webidl` (plan A14).

fn main() {
    println!("cargo:rerun-if-changed=idl");
    println!("cargo:rerun-if-changed=src/webidl.rs");
    println!("cargo:rerun-if-changed=src/html_dda.cc");
    if std::env::var_os("CARGO_FEATURE_V8").is_some() {
        compile_html_dda();
    }

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
type HTMLAllCollection = JsValue;
type HTMLFormControlsCollection = JsValue;
type HTMLOptionsCollection = JsValue;
type RadioNodeList = JsValue;
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

fn compile_html_dda() {
    let include = v8_include_dir();
    let mut build = cc::Build::new();
    build
        .cpp(true)
        .std("c++20")
        .include(&include)
        .file("src/html_dda.cc")
        .warnings(false);
    // Linux/macOS: g++ finds cstddef. Windows: rusty_v8 ships MSVC/clang-cl
    // objects; MinGW g++ cannot link MarkAsUndetectable.
    let target_os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    if target_os != "windows" {
        build.compiler("g++");
    }
    build.compile("ve_html_dda");
    if let Ok(entries) = std::fs::read_dir("/usr/lib/gcc") {
        for entry in entries.flatten() {
            let so = entry.path().join("libstdc++.so");
            if so.is_file() {
                println!("cargo:rustc-link-search=native={}", entry.path().display());
            }
            if let Ok(triples) = std::fs::read_dir(entry.path()) {
                for triple in triples.flatten() {
                    if triple.path().join("libstdc++.so").is_file() {
                        println!("cargo:rustc-link-search=native={}", triple.path().display());
                    }
                }
            }
        }
    }
}

fn v8_include_dir() -> std::path::PathBuf {
    let cargo_home = std::env::var_os("CARGO_HOME")
        .map(std::path::PathBuf::from)
        .or_else(|| {
            std::env::var_os("HOME").map(|home| std::path::PathBuf::from(home).join(".cargo"))
        })
        .expect("CARGO_HOME or HOME for rusty_v8 headers");
    let registry = cargo_home.join("registry").join("src");
    if let Ok(entries) = std::fs::read_dir(&registry) {
        for entry in entries.flatten() {
            let include = entry.path().join("v8-152.2.0").join("v8").join("include");
            if include.join("v8-template.h").is_file() {
                return include;
            }
        }
    }
    let known = std::path::PathBuf::from(
        "/usr/local/cargo/registry/src/index.crates.io-1949cf8c6b5b557f/v8-152.2.0/v8/include",
    );
    if known.join("v8-template.h").is_file() {
        return known;
    }
    panic!(
        "v8-template.h not found under {} (needed for document.all HTMLDDA)",
        registry.display()
    );
}

#[path = "src/webidl.rs"]
mod webidl;

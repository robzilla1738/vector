//! Build script: registers N-API symbols only when the `napi` feature is on,
//! so the default workspace build has no Node dependency.

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=src/napi_win_export.c");
    #[cfg(feature = "napi")]
    {
        napi_build::setup();
        export_napi_register();
    }
}

/// Node `process.dlopen` looks up `napi_register_module_v1` by name.
/// On ELF/Mach-O the symbol is visible as a global. On PE it is not, unless
/// the linker is told to export it: rustc does not put a dependency
/// `#[no_mangle]` on the cdylib export list, and `cargo:rustc-cdylib-link-arg`
/// `/EXPORT` did not appear in the table on windows-latest. The MSVC object
/// compiled here carries `#pragma comment(linker, "/EXPORT:…")`.
#[cfg(feature = "napi")]
fn export_napi_register() {
    let os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    let env = std::env::var("CARGO_CFG_TARGET_ENV").unwrap_or_default();
    if os == "windows" && env != "gnu" {
        println!("cargo:rustc-cdylib-link-arg=/EXPORT:napi_register_module_v1");
        println!("cargo:rustc-cdylib-link-arg=/INCLUDE:napi_register_module_v1");
        println!("cargo:rustc-link-arg=/EXPORT:napi_register_module_v1");
        println!("cargo:rustc-link-arg=/INCLUDE:napi_register_module_v1");
        cc::Build::new()
            .file("src/napi_win_export.c")
            .warnings(false)
            .compile("ve_napi_win_export");
    }
}

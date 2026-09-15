//! Build script: registers N-API symbols only when the `napi` feature is on,
//! so the default workspace build has no Node dependency.

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    #[cfg(feature = "napi")]
    napi_build::setup();
}

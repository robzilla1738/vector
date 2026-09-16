//! Context-process binary (plan A21).

#![deny(unsafe_op_in_unsafe_fn)]

mod sandbox;

fn main() {
    if std::env::var_os("VECTOR_ENGINE_SANDBOX").is_none_or(|v| v != "0")
        && let Err(e) = sandbox::apply()
    {
        eprintln!("ve-host sandbox: {e}");
    }
    ve_napi::isolate::serve_stdio();
}

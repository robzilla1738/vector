//! Speedometer used to inline `type=module` graphs. H1-B2: modules are
//! `v8::Module` at runtime; this crate no longer rewrites them.

use std::path::Path;

/// Read a module entry as-is (no CJS bundler).
pub(crate) fn bundle(entry: &Path) -> anyhow::Result<String> {
    Ok(std::fs::read_to_string(entry)?)
}

/// Inline module body as-is.
pub(crate) fn bundle_inline(body: &str, _dir: &Path) -> anyhow::Result<String> {
    Ok(body.to_string())
}

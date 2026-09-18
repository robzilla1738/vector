//! Official JetStream Next `SunSpider` group from `pins.json`.

use ve_api::VectorEngine;

use crate::SuiteResult;

/// Official `SUNSPIDER_TESTS` order from `JetStreamDriver.js` at the pin.
pub(crate) const SUNSPIDER: &[(&str, &str)] = &[
    (
        "3d-cube",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/3d-cube.js"
        )),
    ),
    (
        "3d-raytrace",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/3d-raytrace.js"
        )),
    ),
    (
        "base64",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/base64.js"
        )),
    ),
    (
        "crypto-aes",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/crypto-aes.js"
        )),
    ),
    (
        "crypto-md5",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/crypto-md5.js"
        )),
    ),
    (
        "crypto-sha1",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/crypto-sha1.js"
        )),
    ),
    (
        "date-format-tofte",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/date-format-tofte.js"
        )),
    ),
    (
        "date-format-xparb",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/date-format-xparb.js"
        )),
    ),
    (
        "n-body",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/n-body.js"
        )),
    ),
    (
        "regex-dna",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/regex-dna.js"
        )),
    ),
    (
        "string-unpack-code",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/string-unpack-code.js"
        )),
    ),
    (
        "tagcloud",
        include_str!(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/vendor/jetstream/tagcloud.js"
        )),
    ),
];

/// Names that fail the browserbench process (existing merge gate).
pub(crate) const GATED: &[&str] = &["jetstream.n-body", "jetstream.crypto-sha1"];

pub(crate) fn run(engine: &mut VectorEngine, iterations: u32) -> Vec<SuiteResult> {
    SUNSPIDER
        .iter()
        .map(|(name, source)| {
            eprintln!("browserbench: start jetstream.{name}");
            crate::jetstream(
                engine,
                iterations,
                &format!("jetstream.{name}"),
                source,
                name,
            )
        })
        .collect()
}

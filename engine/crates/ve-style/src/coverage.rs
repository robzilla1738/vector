//! CSS coverage counters.
//!
//! The router (architecture §11) sends a page to Chromium when the engine's
//! CSS support is too thin to trust its observation: "unknown or deferred
//! property count > 5 % of declarations affecting display/position/
//! visibility". [`CssCoverage`] is the counter that decision reads. It is
//! accumulated while stylesheets and `style=""` attributes are parsed.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::properties::{DEFERRED_PROPERTIES, GEOMETRY_AFFECTING_DEFERRED, PropertyId};

/// Counts of declarations seen while parsing, by how the engine handled them.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct CssCoverage {
    /// Every declaration encountered (a shorthand counts once).
    pub declarations_total: usize,
    /// Declarations whose property name the engine does not know at all.
    pub declarations_unknown: usize,
    /// Declarations of properties the engine knows about but deliberately
    /// does not implement in this milestone (animations, shadows, …).
    pub declarations_deferred: usize,
    /// Declarations of known properties whose value failed to parse (e.g.
    /// `display: ruby`).
    pub declarations_invalid: usize,
    /// At least one unknown / deferred / invalid declaration could change
    /// what is displayed, where it is, or whether it is visible.
    pub affects_geometry: bool,
    /// Unknown property names (not deferred) and how often they appeared.
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub unknown_names: HashMap<String, u32>,
}

impl CssCoverage {
    /// Records a declaration the engine fully handled.
    pub fn record_supported(&mut self) {
        self.declarations_total += 1;
    }

    /// Records a declaration whose property name is not in the table.
    pub fn record_unknown(&mut self, name: &str) {
        self.declarations_total += 1;
        let lower = name.to_ascii_lowercase();
        if DEFERRED_PROPERTIES.contains(&lower.as_str()) {
            self.declarations_deferred += 1;
        } else {
            self.declarations_unknown += 1;
            *self.unknown_names.entry(lower.clone()).or_insert(0) += 1;
        }
        if GEOMETRY_AFFECTING_DEFERRED.contains(&lower.as_str()) {
            self.affects_geometry = true;
        }
    }

    /// Records a known property whose value was rejected.
    pub fn record_invalid(&mut self, property: Option<&PropertyId>, name: &str) {
        self.declarations_total += 1;
        self.declarations_invalid += 1;
        let geometry_property = matches!(
            property,
            Some(
                PropertyId::Display
                    | PropertyId::Position
                    | PropertyId::Visibility
                    | PropertyId::Float
                    | PropertyId::Width
                    | PropertyId::Height
                    | PropertyId::Top
                    | PropertyId::Left
                    | PropertyId::Right
                    | PropertyId::Bottom
                    | PropertyId::Transform
                    | PropertyId::ClipPath
                    | PropertyId::Opacity
                    | PropertyId::OverflowX
                    | PropertyId::OverflowY
            )
        ) || matches!(
            name.to_ascii_lowercase().as_str(),
            "display" | "position" | "visibility" | "grid-template-columns" | "grid-template-rows"
        );
        if geometry_property {
            self.affects_geometry = true;
        }
    }

    /// Adds another counter into this one.
    pub fn merge(&mut self, other: &CssCoverage) {
        self.declarations_total += other.declarations_total;
        self.declarations_unknown += other.declarations_unknown;
        self.declarations_deferred += other.declarations_deferred;
        self.declarations_invalid += other.declarations_invalid;
        self.affects_geometry |= other.affects_geometry;
        for (name, count) in &other.unknown_names {
            *self.unknown_names.entry(name.clone()).or_insert(0) += *count;
        }
    }

    /// Unknown names sorted by count descending, then name.
    #[must_use]
    pub fn top_unknown(&self, n: usize) -> Vec<(String, u32)> {
        let mut rows: Vec<(String, u32)> = self
            .unknown_names
            .iter()
            .map(|(k, v)| (k.clone(), *v))
            .collect();
        rows.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
        rows.truncate(n);
        rows
    }

    /// Unknown + deferred declarations as a fraction of the total (`0.0` for
    /// an empty document).
    #[must_use]
    pub fn miss_ratio(&self) -> f32 {
        if self.declarations_total == 0 {
            0.0
        } else {
            (self.declarations_unknown + self.declarations_deferred) as f32
                / self.declarations_total as f32
        }
    }

    /// Router rule: miss ratio above `threshold` *and* at least one missed
    /// declaration affects display / position / visibility. The agent
    /// router uses `0.50`; `0.05` false-positives real stylesheets.
    #[must_use]
    pub fn exceeds(&self, threshold: f32) -> bool {
        self.affects_geometry && self.miss_ratio() > threshold
    }
}

#[cfg(test)]
mod tests {
    use crate::stylesheet::{Origin, parse_stylesheet};

    #[test]
    fn counts_supported_unknown_deferred_and_invalid() {
        let sheet = parse_stylesheet(
            r"
            p { color: red; margin: 1px; src: url(x.woff); frobnicate: 1; }
            div { display: ruby; writing-mode: vertical-rl; }
            ",
            Origin::Author,
        );
        let c = sheet.coverage;
        assert_eq!(c.declarations_total, 6);
        assert_eq!(c.declarations_unknown, 1, "frobnicate");
        assert_eq!(c.unknown_names.get("frobnicate"), Some(&1));
        assert_eq!(c.top_unknown(1), vec![("frobnicate".into(), 1)]);
        assert_eq!(c.declarations_deferred, 1, "src");
        assert_eq!(c.declarations_invalid, 1, "display: ruby");
        assert!(c.affects_geometry, "display: ruby");
        assert!((c.miss_ratio() - 2.0 / 6.0).abs() < 1e-6);
        assert!(c.exceeds(0.05));

        let clean = parse_stylesheet("p { color: red; src: url(x.woff) }", Origin::Author);
        assert!(!clean.coverage.affects_geometry);
        assert!(
            !clean.coverage.exceeds(0.05),
            "deferred paint-only props do not trip the router"
        );
    }
}

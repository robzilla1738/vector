//! CSS cascade for the Vector Engine.
//!
//! `ve-style` owns everything between a stylesheet's text and a
//! [`ComputedStyle`] per node. Two mature crates are borrowed for *syntax*
//! only:
//!
//! * `cssparser` tokenises CSS and drives rule / declaration parsing.
//! * `selectors` parses selector lists and runs the matching algorithm against
//!   a thin [`DomElement`] adapter over `ve-dom`.
//!
//! Everything else is the engine's own: the property table
//! ([`PropertyId`]), specified values ([`SpecifiedValue`]), the computed value
//! model ([`ComputedStyle`]) with inheritance, the cascade order
//! (origin + importance, specificity, source order), media queries
//! ([`MediaQueryList`]), custom properties with `var()` substitution,
//! `calc()`-family maths, rule buckets, invalidation maps and journal-driven
//! incremental restyle.
//!
//! # Contract
//!
//! * [`StyleEngine::compute`] is a pure function of the document, the
//!   registered stylesheets, the [`MediaEnv`] and the [`InteractionState`]. It
//!   produces a [`StyleTree`] mapping every node in the light tree to a shared
//!   [`ComputedStyle`]. Text nodes share their parent's style. Generated
//!   `::before` / `::after` styles are reachable through [`StyleTree::pseudo`].
//! * [`StyleEngine::restyle_incremental`] updates an existing tree from the
//!   mutation journal, recomputing only dirty subtrees (architecture §4).
//! * Lengths are computed to CSS pixels wherever the value does not depend on
//!   layout; percentages that depend on the containing block stay as
//!   percentages (or `calc(px + %)`) and are resolved by `ve-layout`.
//! * Unknown properties and invalid values are dropped at parse time so they
//!   never participate in the cascade, exactly like a browser; they are
//!   counted in [`CssCoverage`] for the router.

#![forbid(unsafe_code)]

pub mod cascade;
pub mod computed;
pub mod coverage;
pub mod element;
pub mod invalidation;
pub mod media;
pub mod properties;
pub mod selector_impl;
pub mod stylesheet;
pub mod ua;
pub mod values;

pub use cascade::{CSS_BYTES_CAP, RestyleStats, RuleSet, StyleEngine, StyleTree};
pub use computed::{ComputeContext, ComputedStyle, CustomProperties};
pub use coverage::CssCoverage;
pub use element::{DomElement, ElementState, InteractionState};
pub use invalidation::{Dependency, InvalidationMap, InvalidationStats};
pub use media::{ColorScheme, MediaEnv, MediaQueryList, MediaType};
pub use properties::{CalcExpr, CalcValue, PropertyId, SpecifiedValue};
pub use selector_impl::{
    CssString, PseudoClass, PseudoElement, SelectorParser, VeSelectorImpl, parse_selector_list,
};
pub use stylesheet::{
    CssRule, DeclarationBlock, FontFaceRule, FontFaceSrc, Keyframe, KeyframesRule, Origin,
    PropertyDeclaration, StyleRule, Stylesheet, parse_declaration_block,
    parse_declaration_block_counted, parse_stylesheet, strip_cdata,
};
pub use values::*;

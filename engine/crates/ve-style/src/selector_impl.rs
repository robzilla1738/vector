//! The engine's [`SelectorImpl`] and selector parser.
//!
//! `selectors` is generic over the string / atom types and over the set of
//! supported pseudo-classes and pseudo-elements. This module supplies those:
//! [`CssString`] (a plain owned string with a precomputed hash) and the
//! [`PseudoClass`] / [`PseudoElement`] enums the engine understands.

use std::borrow::Borrow;
use std::fmt;
use std::ops::Deref;

use cssparser::{CowRcStr, ParseError, Parser as CssParser, ParserInput, SourceLocation, ToCss};
use selectors::parser::{
    NonTSPseudoClass, ParseRelative, PseudoElement as PseudoElementTrait, SelectorParseErrorKind,
};
use selectors::{Parser, SelectorImpl, SelectorList};

/// Owned string type used for identifiers, attribute values, local names and
/// namespace URLs inside selectors.
#[derive(Clone, Debug, Default, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct CssString(pub String);

impl CssString {
    /// The wrapped string.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Deref for CssString {
    type Target = str;
    fn deref(&self) -> &str {
        &self.0
    }
}

impl AsRef<str> for CssString {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl Borrow<str> for CssString {
    fn borrow(&self) -> &str {
        &self.0
    }
}

impl From<&str> for CssString {
    fn from(s: &str) -> Self {
        Self(s.to_owned())
    }
}

impl From<String> for CssString {
    fn from(s: String) -> Self {
        Self(s)
    }
}

impl fmt::Display for CssString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl ToCss for CssString {
    fn to_css<W: fmt::Write>(&self, dest: &mut W) -> fmt::Result {
        cssparser::serialize_identifier(&self.0, dest)
    }
}

impl precomputed_hash::PrecomputedHash for CssString {
    fn precomputed_hash(&self) -> u32 {
        // FNV-1a; selectors only needs a stable, well-distributed hash.
        let mut hash: u32 = 0x811c_9dc5;
        for byte in self.0.bytes() {
            hash ^= u32::from(byte);
            hash = hash.wrapping_mul(0x0100_0193);
        }
        hash
    }
}

/// Non tree-structural pseudo-classes the engine can evaluate.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PseudoClass {
    /// `:hover`
    Hover,
    /// `:active`
    Active,
    /// `:focus`
    Focus,
    /// `:focus-visible`
    FocusVisible,
    /// `:focus-within`
    FocusWithin,
    /// `:enabled`
    Enabled,
    /// `:disabled`
    Disabled,
    /// `:checked`
    Checked,
    /// `:link`
    Link,
    /// `:any-link`
    AnyLink,
    /// `:visited` (never matches: the engine does not track history)
    Visited,
    /// `:target`
    Target,
    /// `:required`
    Required,
    /// `:optional`
    Optional,
    /// `:read-only`
    ReadOnly,
    /// `:read-write`
    ReadWrite,
    /// `:placeholder-shown`
    PlaceholderShown,
    /// `:defined` (always matches: no custom element registry yet)
    Defined,
    /// `:lang(tag)`
    Lang(CssString),
    /// `:dir(ltr)` / `:dir(rtl)`
    Dir(CssString),
}

impl PseudoClass {
    /// Parses a pseudo-class name (without the leading colon).
    #[must_use]
    pub fn from_name(name: &str) -> Option<Self> {
        Some(match name.to_ascii_lowercase().as_str() {
            "hover" => Self::Hover,
            "active" => Self::Active,
            "focus" => Self::Focus,
            "focus-visible" => Self::FocusVisible,
            "focus-within" => Self::FocusWithin,
            "enabled" => Self::Enabled,
            "disabled" => Self::Disabled,
            "checked" => Self::Checked,
            "link" => Self::Link,
            "any-link" => Self::AnyLink,
            "visited" => Self::Visited,
            "target" => Self::Target,
            "required" => Self::Required,
            "optional" => Self::Optional,
            "read-only" => Self::ReadOnly,
            "read-write" => Self::ReadWrite,
            "placeholder-shown" => Self::PlaceholderShown,
            "defined" => Self::Defined,
            "lang" => return None,
            _ => return None,
        })
    }

    /// The canonical name without the leading colon.
    #[must_use]
    pub fn name(&self) -> &'static str {
        match self {
            Self::Hover => "hover",
            Self::Active => "active",
            Self::Focus => "focus",
            Self::FocusVisible => "focus-visible",
            Self::FocusWithin => "focus-within",
            Self::Enabled => "enabled",
            Self::Disabled => "disabled",
            Self::Checked => "checked",
            Self::Link => "link",
            Self::AnyLink => "any-link",
            Self::Visited => "visited",
            Self::Target => "target",
            Self::Required => "required",
            Self::Optional => "optional",
            Self::ReadOnly => "read-only",
            Self::ReadWrite => "read-write",
            Self::PlaceholderShown => "placeholder-shown",
            Self::Defined => "defined",
            Self::Lang(_) => "lang",
            Self::Dir(_) => "dir",
        }
    }
}

impl ToCss for PseudoClass {
    fn to_css<W: fmt::Write>(&self, dest: &mut W) -> fmt::Result {
        match self {
            Self::Lang(tag) => write!(dest, ":lang({})", tag.as_str()),
            Self::Dir(dir) => write!(dest, ":dir({})", dir.as_str()),
            other => write!(dest, ":{}", other.name()),
        }
    }
}

impl NonTSPseudoClass for PseudoClass {
    type Impl = VeSelectorImpl;

    fn is_active_or_hover(&self) -> bool {
        matches!(self, Self::Active | Self::Hover)
    }

    fn is_user_action_state(&self) -> bool {
        matches!(
            self,
            Self::Active | Self::Hover | Self::Focus | Self::FocusVisible | Self::FocusWithin
        )
    }
}

/// Pseudo-elements the engine parses. `::before` and `::after` generate
/// boxes when their `content` is not `normal`/`none`; the others are
/// recognised so that rules using them parse and are ignored rather than
/// invalidating the surrounding stylesheet.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum PseudoElement {
    /// `::before`
    Before,
    /// `::after`
    After,
    /// `::first-line`
    FirstLine,
    /// `::first-letter`
    FirstLetter,
    /// `::placeholder`
    Placeholder,
    /// `::marker`
    Marker,
    /// `::selection`
    Selection,
}

impl PseudoElement {
    /// Parses a pseudo-element name (without the leading colons).
    #[must_use]
    pub fn from_name(name: &str) -> Option<Self> {
        Some(match name.to_ascii_lowercase().as_str() {
            "before" => Self::Before,
            "after" => Self::After,
            "first-line" => Self::FirstLine,
            "first-letter" => Self::FirstLetter,
            "placeholder" => Self::Placeholder,
            "marker" => Self::Marker,
            "selection" => Self::Selection,
            _ => return None,
        })
    }

    /// The canonical name without the leading colons.
    #[must_use]
    pub fn name(&self) -> &'static str {
        match self {
            Self::Before => "before",
            Self::After => "after",
            Self::FirstLine => "first-line",
            Self::FirstLetter => "first-letter",
            Self::Placeholder => "placeholder",
            Self::Marker => "marker",
            Self::Selection => "selection",
        }
    }
}

impl ToCss for PseudoElement {
    fn to_css<W: fmt::Write>(&self, dest: &mut W) -> fmt::Result {
        write!(dest, "::{}", self.name())
    }
}

impl PseudoElementTrait for PseudoElement {
    type Impl = VeSelectorImpl;

    fn is_before_or_after(&self) -> bool {
        matches!(self, Self::Before | Self::After)
    }
}

/// The engine's selector implementation marker type.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct VeSelectorImpl;

impl SelectorImpl for VeSelectorImpl {
    type ExtraMatchingData<'a> = ();
    type AttrValue = CssString;
    type Identifier = CssString;
    type LocalName = CssString;
    type NamespaceUrl = CssString;
    type NamespacePrefix = CssString;
    type BorrowedNamespaceUrl = str;
    type BorrowedLocalName = str;
    type NonTSPseudoClass = PseudoClass;
    type PseudoElement = PseudoElement;
}

/// Custom error kind for style parsing.
#[derive(Clone, Debug, PartialEq)]
pub enum StyleParseErrorKind<'i> {
    /// A selector failed to parse.
    Selector(SelectorParseErrorKind<'i>),
    /// The property name is not in the property table.
    UnknownProperty(CowRcStr<'i>),
    /// The value is not valid for the property.
    InvalidValue(CowRcStr<'i>),
    /// An at-rule the engine does not implement.
    UnsupportedAtRule(CowRcStr<'i>),
}

impl<'i> From<SelectorParseErrorKind<'i>> for StyleParseErrorKind<'i> {
    fn from(e: SelectorParseErrorKind<'i>) -> Self {
        Self::Selector(e)
    }
}

/// Parser configuration for selectors.
#[derive(Clone, Copy, Debug, Default)]
pub struct SelectorParser;

impl<'i> Parser<'i> for SelectorParser {
    type Impl = VeSelectorImpl;
    type Error = StyleParseErrorKind<'i>;

    fn parse_is_and_where(&self) -> bool {
        true
    }

    fn parse_has(&self) -> bool {
        true
    }

    fn parse_nth_child_of(&self) -> bool {
        true
    }

    fn parse_non_ts_pseudo_class(
        &self,
        location: SourceLocation,
        name: CowRcStr<'i>,
    ) -> Result<PseudoClass, ParseError<'i, Self::Error>> {
        PseudoClass::from_name(&name).ok_or_else(|| {
            location.new_custom_error(SelectorParseErrorKind::UnsupportedPseudoClassOrElement(
                name,
            ))
        })
    }

    fn parse_non_ts_functional_pseudo_class<'t>(
        &self,
        name: CowRcStr<'i>,
        parser: &mut CssParser<'i, 't>,
        _after_part: bool,
    ) -> Result<PseudoClass, ParseError<'i, Self::Error>> {
        if name.eq_ignore_ascii_case("lang") {
            let tag = parser.expect_ident_or_string()?.as_ref().to_owned();
            return Ok(PseudoClass::Lang(CssString::from(tag)));
        }
        if name.eq_ignore_ascii_case("dir") {
            let dir = parser.expect_ident()?.as_ref().to_owned();
            return Ok(PseudoClass::Dir(CssString::from(dir)));
        }
        Err(
            parser.new_custom_error(SelectorParseErrorKind::UnsupportedPseudoClassOrElement(
                name,
            )),
        )
    }

    fn parse_pseudo_element(
        &self,
        location: SourceLocation,
        name: CowRcStr<'i>,
    ) -> Result<PseudoElement, ParseError<'i, Self::Error>> {
        PseudoElement::from_name(&name).ok_or_else(|| {
            location.new_custom_error(SelectorParseErrorKind::UnsupportedPseudoClassOrElement(
                name,
            ))
        })
    }
}

/// Parses a selector list such as `main > p.intro, #id[href]`.
pub fn parse_selector_list(text: &str) -> ve_core::Result<SelectorList<VeSelectorImpl>> {
    let mut input = ParserInput::new(text);
    let mut parser = CssParser::new(&mut input);
    SelectorList::parse(&SelectorParser, &mut parser, ParseRelative::No)
        .map_err(|e| ve_core::Error::parse("selector", format!("{text:?}: {:?}", e.kind)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_selectors_and_reports_specificity() {
        let list =
            parse_selector_list("div#main > p.intro:hover, a[href^='http']::before").unwrap();
        let sels = list.slice();
        assert_eq!(sels.len(), 2);
        // (1 id, 2 class-ish [class + pseudo-class], 2 types) -> 0x01_02_02
        assert_eq!(sels[0].specificity(), (1 << 20) | (2 << 10) | 2);
        assert_eq!(sels[0].to_css_string(), "div#main > p.intro:hover");
        assert!(parse_selector_list("p:unknown-pseudo").is_err());
        assert!(parse_selector_list(">> p").is_err());
        let lang = parse_selector_list("div:lang(ko)").unwrap();
        assert_eq!(lang.slice()[0].to_css_string(), "div:lang(ko)");
        let dir = parse_selector_list("input:dir(rtl)").unwrap();
        assert_eq!(dir.slice()[0].to_css_string(), "input:dir(rtl)");
    }
}

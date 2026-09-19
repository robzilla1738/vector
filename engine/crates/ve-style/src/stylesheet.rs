//! Stylesheet model and parsing (`cssparser` rule/declaration drivers).

use cssparser::{
    AtRuleParser, CowRcStr, DeclarationParser, ParseError, Parser, ParserInput, ParserState,
    QualifiedRuleParser, RuleBodyItemParser, RuleBodyParser, StyleSheetParser, parse_important,
};
use selectors::SelectorList;
use selectors::parser::ParseRelative;
use ve_core::Stage;

use crate::coverage::CssCoverage;
use crate::media::MediaQueryList;
use crate::properties::{PropertyId, SpecifiedValue, expand_shorthand};
use crate::selector_impl::{SelectorParser, StyleParseErrorKind, VeSelectorImpl};
use crate::values::{FontStyle, FontWeight};

/// Where a stylesheet comes from; the first key of the cascade.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum Origin {
    /// The engine's built-in stylesheet.
    UserAgent,
    /// `<style>`, `<link rel=stylesheet>`, style attributes.
    Author,
}

/// One longhand declaration.
#[derive(Clone, Debug, PartialEq)]
pub struct PropertyDeclaration {
    /// The (longhand or custom) property.
    pub property: PropertyId,
    /// The specified value.
    pub value: SpecifiedValue,
    /// `!important`.
    pub important: bool,
}

/// An ordered list of longhand declarations (shorthands already expanded).
#[derive(Clone, Debug, Default, PartialEq)]
pub struct DeclarationBlock {
    /// Declarations in source order. Later ones win within the block.
    pub declarations: Vec<PropertyDeclaration>,
}

impl DeclarationBlock {
    /// Returns `true` if the block has no declarations.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.declarations.is_empty()
    }
}

/// A style rule: selectors plus declarations.
#[derive(Clone, Debug)]
pub struct StyleRule {
    /// The selector list.
    pub selectors: SelectorList<VeSelectorImpl>,
    /// The declarations.
    pub block: DeclarationBlock,
}

/// A `@media` rule.
#[derive(Clone, Debug)]
pub struct MediaRule {
    /// The media query list.
    pub query: MediaQueryList,
    /// Nested rules.
    pub rules: Vec<CssRule>,
}

/// One keyframe (`from` / `to` / `%`) inside `@keyframes`.
#[derive(Clone, Debug)]
pub struct Keyframe {
    /// Offsets in `0.0..=1.0` (`from` = 0, `to` = 1).
    pub offsets: Vec<f32>,
    /// Declarations at those offsets.
    pub block: DeclarationBlock,
}

/// A `@keyframes` / `@-webkit-keyframes` rule.
#[derive(Clone, Debug)]
pub struct KeyframesRule {
    /// Animation name.
    pub name: String,
    /// Keyframes in source order.
    pub frames: Vec<Keyframe>,
}

/// One `@font-face` `src` component.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FontFaceSrc {
    /// `url(...)`.
    Url(String),
    /// `local(...)`.
    Local(String),
}

/// A `@font-face` rule. Does not participate in the cascade.
#[derive(Clone, Debug, PartialEq)]
pub struct FontFaceRule {
    /// `font-family` name.
    pub family: String,
    /// `src` list in source order.
    pub sources: Vec<FontFaceSrc>,
    /// `font-weight` (defaults to 400).
    pub weight: FontWeight,
    /// `font-style` (defaults to normal).
    pub style: FontStyle,
}

/// A top-level or nested rule.
#[derive(Clone, Debug)]
pub enum CssRule {
    /// A style rule.
    Style(StyleRule),
    /// A `@media` rule.
    Media(MediaRule),
    /// A `@keyframes` rule. Does not participate in the cascade.
    Keyframes(KeyframesRule),
    /// A `@font-face` rule. Does not participate in the cascade.
    FontFace(FontFaceRule),
}

/// A parsed stylesheet.
#[derive(Clone, Debug)]
pub struct Stylesheet {
    /// Cascade origin.
    pub origin: Origin,
    /// Rules in source order.
    pub rules: Vec<CssRule>,
    /// Declaration coverage counters for this sheet.
    pub coverage: CssCoverage,
}

impl Stylesheet {
    /// An empty author stylesheet.
    #[must_use]
    pub fn empty(origin: Origin) -> Self {
        Self {
            origin,
            rules: Vec::new(),
            coverage: CssCoverage::default(),
        }
    }

    /// Total number of style rules, including nested ones.
    #[must_use]
    pub fn style_rule_count(&self) -> usize {
        fn count(rules: &[CssRule]) -> usize {
            rules
                .iter()
                .map(|r| match r {
                    CssRule::Style(_) => 1,
                    CssRule::Media(m) => count(&m.rules),
                    CssRule::Keyframes(_) | CssRule::FontFace(_) => 0,
                })
                .sum()
        }
        count(&self.rules)
    }

    /// `@keyframes` rules in source order, including nested sheets.
    #[must_use]
    pub fn keyframes(&self) -> Vec<&KeyframesRule> {
        fn walk<'a>(rules: &'a [CssRule], out: &mut Vec<&'a KeyframesRule>) {
            for rule in rules {
                match rule {
                    CssRule::Keyframes(k) => out.push(k),
                    CssRule::Media(m) => walk(&m.rules, out),
                    CssRule::Style(_) | CssRule::FontFace(_) => {}
                }
            }
        }
        let mut out = Vec::new();
        walk(&self.rules, &mut out);
        out
    }

    /// `@font-face` rules in source order, including nested sheets.
    #[must_use]
    pub fn font_faces(&self) -> Vec<&FontFaceRule> {
        fn walk<'a>(rules: &'a [CssRule], out: &mut Vec<&'a FontFaceRule>) {
            for rule in rules {
                match rule {
                    CssRule::FontFace(f) => out.push(f),
                    CssRule::Media(m) => walk(&m.rules, out),
                    CssRule::Style(_) | CssRule::Keyframes(_) => {}
                }
            }
        }
        let mut out = Vec::new();
        walk(&self.rules, &mut out);
        out
    }
}

/// Strips the XML `<![CDATA[` … `]]>` wrapper XHTML documents often put
/// inside `<style>` (it is raw text to an HTML parser, but would break the
/// first rule for the CSS tokenizer).
#[must_use]
pub fn strip_cdata(css: &str) -> String {
    css.replace("<![CDATA[", "").replace("]]>", "")
}

/// Parses a stylesheet. Invalid rules and declarations are skipped, as CSS
/// error recovery requires; nothing here can fail.
#[must_use]
pub fn parse_stylesheet(css: &str, origin: Origin) -> Stylesheet {
    let span = Stage::Style.span();
    let _guard = span.enter();
    let mut input = ParserInput::new(css);
    let mut parser = Parser::new(&mut input);
    let mut rule_parser = RuleParser {
        coverage: CssCoverage::default(),
    };
    let rules = StyleSheetParser::new(&mut parser, &mut rule_parser)
        .filter_map(|r| match r {
            Ok(rule) => Some(rule),
            Err((err, slice)) => {
                tracing::debug!(?err.kind, slice, "skipping invalid rule");
                None
            }
        })
        .collect();
    Stylesheet {
        origin,
        rules,
        coverage: rule_parser.coverage,
    }
}

/// Parses a declaration list, e.g. the contents of a `style=""` attribute.
#[must_use]
pub fn parse_declaration_block(css: &str) -> DeclarationBlock {
    parse_declaration_block_counted(css).0
}

/// Like [`parse_declaration_block`], also returning the coverage counters.
#[must_use]
pub fn parse_declaration_block_counted(css: &str) -> (DeclarationBlock, CssCoverage) {
    let mut input = ParserInput::new(css);
    let mut parser = Parser::new(&mut input);
    let mut coverage = CssCoverage::default();
    let block = parse_declarations(&mut parser, &mut coverage);
    (block, coverage)
}

fn parse_declarations<'i>(
    input: &mut Parser<'i, '_>,
    coverage: &mut CssCoverage,
) -> DeclarationBlock {
    let mut decl_parser = DeclarationListParser { coverage };
    let mut block = DeclarationBlock::default();
    for item in RuleBodyParser::new(input, &mut decl_parser) {
        match item {
            Ok(decls) => block.declarations.extend(decls),
            Err((err, slice)) => tracing::trace!(?err.kind, slice, "skipping invalid declaration"),
        }
    }
    block
}

// ---------------------------------------------------------------------------
// Declaration lists
// ---------------------------------------------------------------------------

struct DeclarationListParser<'c> {
    coverage: &'c mut CssCoverage,
}

impl<'i> DeclarationParser<'i> for DeclarationListParser<'_> {
    type Declaration = Vec<PropertyDeclaration>;
    type Error = StyleParseErrorKind<'i>;

    fn parse_value<'t>(
        &mut self,
        name: CowRcStr<'i>,
        input: &mut Parser<'i, 't>,
        _start: &ParserState,
    ) -> Result<Self::Declaration, ParseError<'i, Self::Error>> {
        // Custom properties may legitimately contain `!important` text; strip it first.
        let important_at_end =
            |input: &mut Parser<'i, 't>| input.try_parse(parse_important).is_ok();

        if let Some(expanded) = expand_shorthand(&name, input) {
            let Some(pairs) = expanded else {
                self.coverage.record_invalid(None, &name);
                return Err(input.new_custom_error(StyleParseErrorKind::InvalidValue(name.clone())));
            };
            let important = important_at_end(input);
            if input.expect_exhausted().is_err() {
                self.coverage.record_invalid(None, &name);
                return Err(input.new_custom_error(StyleParseErrorKind::InvalidValue(name.clone())));
            }
            self.coverage.record_supported();
            return Ok(pairs
                .into_iter()
                .map(|(property, value)| PropertyDeclaration {
                    property,
                    value,
                    important,
                })
                .collect());
        }

        let Some(property) = PropertyId::from_name(&name) else {
            self.coverage.record_unknown(&name);
            return Err(input.new_custom_error(StyleParseErrorKind::UnknownProperty(name.clone())));
        };

        if let PropertyId::Custom(_) = property {
            let mut value = property.parse_value(input).ok_or_else(|| {
                input.new_custom_error(StyleParseErrorKind::InvalidValue(name.clone()))
            })?;
            let mut important = false;
            if let SpecifiedValue::Raw(raw) = &value
                && let Some(stripped) = strip_important(raw)
            {
                important = true;
                value = SpecifiedValue::Raw(stripped.to_owned());
            }
            self.coverage.record_supported();
            return Ok(vec![PropertyDeclaration {
                property,
                value,
                important,
            }]);
        }

        let parsed = input.parse_until_before(cssparser::Delimiter::Bang, |i| {
            property
                .parse_value(i)
                .ok_or_else(|| i.new_custom_error(StyleParseErrorKind::InvalidValue(name.clone())))
        });
        let value = match parsed {
            Ok(v) => v,
            Err(e) => {
                self.coverage.record_invalid(Some(&property), &name);
                return Err(e);
            }
        };
        let important = important_at_end(input);
        if input.expect_exhausted().is_err() {
            self.coverage.record_invalid(Some(&property), &name);
            return Err(input.new_custom_error(StyleParseErrorKind::InvalidValue(name.clone())));
        }
        self.coverage.record_supported();
        Ok(vec![PropertyDeclaration {
            property,
            value,
            important,
        }])
    }
}

fn strip_important(raw: &str) -> Option<&str> {
    let trimmed = raw.trim_end();
    let bang = trimmed.rfind('!')?;
    trimmed[bang + 1..]
        .trim()
        .eq_ignore_ascii_case("important")
        .then(|| trimmed[..bang].trim_end())
}

impl<'i> QualifiedRuleParser<'i> for DeclarationListParser<'_> {
    type Prelude = ();
    type QualifiedRule = Vec<PropertyDeclaration>;
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> AtRuleParser<'i> for DeclarationListParser<'_> {
    type Prelude = ();
    type AtRule = Vec<PropertyDeclaration>;
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> RuleBodyItemParser<'i, Vec<PropertyDeclaration>, StyleParseErrorKind<'i>>
    for DeclarationListParser<'_>
{
    fn parse_declarations(&self) -> bool {
        true
    }

    fn parse_qualified(&self) -> bool {
        false
    }
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

struct RuleParser {
    coverage: CssCoverage,
}

/// Prelude of a supported at-rule.
enum AtPrelude {
    Media(MediaQueryList),
    /// `@supports`: body is kept only when the condition is true.
    Supports(bool),
    /// `@layer` / `@scope`: the body is parsed as rules (unconditional).
    Transparent,
    /// `@keyframes name`.
    Keyframes(String),
    /// `@font-face`.
    FontFace,
}

impl<'i> QualifiedRuleParser<'i> for RuleParser {
    type Prelude = SelectorList<VeSelectorImpl>;
    type QualifiedRule = CssRule;
    type Error = StyleParseErrorKind<'i>;

    fn parse_prelude<'t>(
        &mut self,
        input: &mut Parser<'i, 't>,
    ) -> Result<Self::Prelude, ParseError<'i, Self::Error>> {
        SelectorList::parse(&SelectorParser, input, ParseRelative::No)
    }

    fn parse_block<'t>(
        &mut self,
        selectors: Self::Prelude,
        _start: &ParserState,
        input: &mut Parser<'i, 't>,
    ) -> Result<CssRule, ParseError<'i, Self::Error>> {
        let block = parse_declarations(input, &mut self.coverage);
        Ok(CssRule::Style(StyleRule { selectors, block }))
    }
}

impl<'i> AtRuleParser<'i> for RuleParser {
    type Prelude = AtPrelude;
    type AtRule = CssRule;
    type Error = StyleParseErrorKind<'i>;

    fn parse_prelude<'t>(
        &mut self,
        name: CowRcStr<'i>,
        input: &mut Parser<'i, 't>,
    ) -> Result<Self::Prelude, ParseError<'i, Self::Error>> {
        if name.eq_ignore_ascii_case("media") {
            Ok(AtPrelude::Media(MediaQueryList::parse(input)))
        } else if name.eq_ignore_ascii_case("keyframes")
            || name.eq_ignore_ascii_case("-webkit-keyframes")
        {
            let ident = input.expect_ident()?;
            Ok(AtPrelude::Keyframes(ident.as_ref().to_owned()))
        } else if name.eq_ignore_ascii_case("font-face") {
            Ok(AtPrelude::FontFace)
        } else if name.eq_ignore_ascii_case("supports") {
            Ok(AtPrelude::Supports(parse_supports_condition(input)))
        } else if name.eq_ignore_ascii_case("layer") || name.eq_ignore_ascii_case("scope")
        {
            while input.next().is_ok() {}
            Ok(AtPrelude::Transparent)
        } else {
            Err(input.new_custom_error(StyleParseErrorKind::UnsupportedAtRule(name)))
        }
    }

    fn parse_block<'t>(
        &mut self,
        prelude: Self::Prelude,
        _start: &ParserState,
        input: &mut Parser<'i, 't>,
    ) -> Result<CssRule, ParseError<'i, Self::Error>> {
        match prelude {
            AtPrelude::Keyframes(name) => {
                let mut body = KeyframeBodyParser {
                    coverage: &mut self.coverage,
                };
                let frames = RuleBodyParser::new(input, &mut body)
                    .filter_map(|r| match r {
                        Ok(frame) => Some(frame),
                        Err((err, slice)) => {
                            tracing::debug!(?err.kind, slice, "skipping invalid keyframe");
                            None
                        }
                    })
                    .collect();
                Ok(CssRule::Keyframes(KeyframesRule { name, frames }))
            }
            AtPrelude::FontFace => {
                let mut body = FontFaceBodyParser::default();
                for item in RuleBodyParser::new(input, &mut body) {
                    if let Err((err, slice)) = item {
                        tracing::debug!(?err.kind, slice, "skipping invalid @font-face descriptor");
                    }
                }
                Ok(CssRule::FontFace(FontFaceRule {
                    family: body.family.unwrap_or_default(),
                    sources: body.sources,
                    weight: body.weight,
                    style: body.style,
                }))
            }
            prelude => {
                let rules = RuleBodyParser::new(input, self)
                    .filter_map(|r| match r {
                        Ok(rule) => Some(rule),
                        Err((err, slice)) => {
                            tracing::debug!(?err.kind, slice, "skipping invalid nested rule");
                            None
                        }
                    })
                    .collect();
                match prelude {
                    AtPrelude::Media(query) => Ok(CssRule::Media(MediaRule { query, rules })),
                    AtPrelude::Supports(true) | AtPrelude::Transparent => Ok(CssRule::Media(MediaRule {
                        query: MediaQueryList::default(),
                        rules,
                    })),
                    AtPrelude::Supports(false) => Ok(CssRule::Media(MediaRule {
                        query: MediaQueryList::default(),
                        rules: Vec::new(),
                    })),
                    AtPrelude::Keyframes(_) | AtPrelude::FontFace => {
                        unreachable!("handled above")
                    }
                }
            }
        }
    }
}

struct KeyframeBodyParser<'c> {
    coverage: &'c mut CssCoverage,
}

impl<'i> AtRuleParser<'i> for KeyframeBodyParser<'_> {
    type Prelude = ();
    type AtRule = Keyframe;
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> QualifiedRuleParser<'i> for KeyframeBodyParser<'_> {
    type Prelude = Vec<f32>;
    type QualifiedRule = Keyframe;
    type Error = StyleParseErrorKind<'i>;

    fn parse_prelude<'t>(
        &mut self,
        input: &mut Parser<'i, 't>,
    ) -> Result<Self::Prelude, ParseError<'i, Self::Error>> {
        let mut offsets = Vec::new();
        loop {
            if input.try_parse(|i| i.expect_ident_matching("from")).is_ok() {
                offsets.push(0.0);
            } else if input.try_parse(|i| i.expect_ident_matching("to")).is_ok() {
                offsets.push(1.0);
            } else if let Ok(p) = input.try_parse(Parser::expect_percentage) {
                offsets.push(p);
            } else {
                return Err(input.new_error(cssparser::BasicParseErrorKind::QualifiedRuleInvalid));
            }
            if input.try_parse(Parser::expect_comma).is_err() {
                break;
            }
        }
        Ok(offsets)
    }

    fn parse_block<'t>(
        &mut self,
        offsets: Self::Prelude,
        _start: &ParserState,
        input: &mut Parser<'i, 't>,
    ) -> Result<Keyframe, ParseError<'i, Self::Error>> {
        let block = parse_declarations(input, self.coverage);
        Ok(Keyframe { offsets, block })
    }
}

impl<'i> DeclarationParser<'i> for KeyframeBodyParser<'_> {
    type Declaration = Keyframe;
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> RuleBodyItemParser<'i, Keyframe, StyleParseErrorKind<'i>> for KeyframeBodyParser<'_> {
    fn parse_declarations(&self) -> bool {
        false
    }

    fn parse_qualified(&self) -> bool {
        true
    }
}

impl<'i> DeclarationParser<'i> for RuleParser {
    type Declaration = CssRule;
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> RuleBodyItemParser<'i, CssRule, StyleParseErrorKind<'i>> for RuleParser {
    fn parse_declarations(&self) -> bool {
        false
    }

    fn parse_qualified(&self) -> bool {
        true
    }
}

struct FontFaceBodyParser {
    family: Option<String>,
    sources: Vec<FontFaceSrc>,
    weight: FontWeight,
    style: FontStyle,
}

impl Default for FontFaceBodyParser {
    fn default() -> Self {
        Self {
            family: None,
            sources: Vec::new(),
            weight: FontWeight::NORMAL,
            style: FontStyle::Normal,
        }
    }
}

impl<'i> DeclarationParser<'i> for FontFaceBodyParser {
    type Declaration = ();
    type Error = StyleParseErrorKind<'i>;

    fn parse_value<'t>(
        &mut self,
        name: CowRcStr<'i>,
        input: &mut Parser<'i, 't>,
        _start: &ParserState,
    ) -> Result<Self::Declaration, ParseError<'i, Self::Error>> {
        if name.eq_ignore_ascii_case("font-family") {
            if let Ok(s) = input.try_parse(|i| i.expect_string_cloned()) {
                self.family = Some(s.to_string());
            } else {
                let ident = input.expect_ident()?;
                self.family = Some(ident.as_ref().to_owned());
            }
            let _ = input.try_parse(parse_important);
            return Ok(());
        }
        if name.eq_ignore_ascii_case("src") {
            self.sources = parse_font_face_src(input);
            let _ = input.try_parse(parse_important);
            return Ok(());
        }
        if name.eq_ignore_ascii_case("font-weight") {
            if let Ok(n) = input.try_parse(Parser::expect_number) {
                self.weight = FontWeight(n.round().clamp(1.0, 1000.0) as u16);
            } else if let Ok(ident) = input.try_parse(|i| i.expect_ident_cloned()) {
                self.weight = match ident.as_ref() {
                    s if s.eq_ignore_ascii_case("bold") => FontWeight::BOLD,
                    s if s.eq_ignore_ascii_case("normal") => FontWeight::NORMAL,
                    _ => FontWeight::NORMAL,
                };
            }
            let _ = input.try_parse(parse_important);
            return Ok(());
        }
        if name.eq_ignore_ascii_case("font-style") {
            if let Ok(ident) = input.try_parse(|i| i.expect_ident_cloned()) {
                self.style = if ident.eq_ignore_ascii_case("italic") {
                    FontStyle::Italic
                } else if ident.eq_ignore_ascii_case("oblique") {
                    FontStyle::Oblique
                } else {
                    FontStyle::Normal
                };
            }
            let _ = input.try_parse(parse_important);
            return Ok(());
        }
        while input.next().is_ok() {}
        Ok(())
    }
}

impl<'i> QualifiedRuleParser<'i> for FontFaceBodyParser {
    type Prelude = ();
    type QualifiedRule = ();
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> AtRuleParser<'i> for FontFaceBodyParser {
    type Prelude = ();
    type AtRule = ();
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> RuleBodyItemParser<'i, (), StyleParseErrorKind<'i>> for FontFaceBodyParser {
    fn parse_declarations(&self) -> bool {
        true
    }

    fn parse_qualified(&self) -> bool {
        false
    }
}

fn parse_font_face_src(input: &mut Parser<'_, '_>) -> Vec<FontFaceSrc> {
    let mut sources = Vec::new();
    loop {
        if input.is_exhausted() {
            break;
        }
        if let Ok(url) = input.try_parse(|i| i.expect_url()) {
            sources.push(FontFaceSrc::Url(url.as_ref().to_owned()));
        } else if input
            .try_parse(|i| i.expect_function_matching("local"))
            .is_ok()
        {
            let local = input
                .parse_nested_block(|args| {
                    if let Ok(s) = args.try_parse(|i| i.expect_string_cloned()) {
                        return Ok(s.to_string());
                    }
                    let ident = args.expect_ident()?.as_ref().to_owned();
                    Ok::<_, ParseError<'_, StyleParseErrorKind<'_>>>(ident)
                })
                .ok();
            if let Some(name) = local {
                sources.push(FontFaceSrc::Local(name));
            }
        } else if input
            .try_parse(|i| i.expect_function_matching("format"))
            .is_ok()
        {
            let _ = input.parse_nested_block(|args| {
                while args.next().is_ok() {}
                Ok::<_, ParseError<'_, StyleParseErrorKind<'_>>>(())
            });
        } else if input.try_parse(Parser::expect_comma).is_ok() {
            continue;
        } else if input.next().is_err() {
            break;
        }
    }
    sources
}

/// `@supports` prelude: `(property: value)` with optional `not` / `and` / `or`.
fn parse_supports_condition(input: &mut Parser<'_, '_>) -> bool {
    let negated = input.try_parse(|i| i.expect_ident_matching("not")).is_ok();
    let first = parse_supports_in_parens(input);
    let mut result = if negated { !first } else { first };
    loop {
        let Ok(op) = input.try_parse(|i| {
            Ok::<_, cssparser::ParseError<'static, ()>>(i.expect_ident()?.as_ref().to_ascii_lowercase())
        }) else {
            break;
        };
        if op != "and" && op != "or" {
            break;
        }
        let next = parse_supports_in_parens(input);
        if op == "and" {
            result &= next;
        } else {
            result |= next;
        }
    }
    while input.next().is_ok() {}
    result
}

fn parse_supports_in_parens(input: &mut Parser<'_, '_>) -> bool {
    if input.expect_parenthesis_block().is_err() {
        return false;
    }
    input
        .parse_nested_block(|inner| {
            if inner.try_parse(|i| i.expect_ident_matching("not")).is_ok() {
                return Ok(!parse_supports_in_parens(inner));
            }
            let name = match inner.expect_ident() {
                Ok(n) => n.as_ref().to_owned(),
                Err(_) => {
                    while inner.next().is_ok() {}
                    return Ok(false);
                }
            };
            if inner.expect_colon().is_err() {
                while inner.next().is_ok() {}
                return Ok(false);
            }
            let Some(prop) = PropertyId::from_name(&name) else {
                while inner.next().is_ok() {}
                return Ok(false);
            };
            let ok = prop.parse_value(inner).is_some();
            while inner.next().is_ok() {}
            Ok::<_, ParseError<'_, StyleParseErrorKind<'_>>>(ok)
        })
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::values::Length;

    #[test]
    fn parses_rules_declarations_and_recovers_from_errors() {
        let sheet = parse_stylesheet(
            r"
            p { color: red; margin: 1px 2px; bogus: 1; width: 12furlongs; }
            :unknown-pseudo { color: blue }
            @media (min-width: 600px) { h1 { font-size: 2em !important } }
            @font-face { font-family: X }
            a::after { content: 'x' }
            123 { color: green }
            @supports (display: grid) { .g { display: grid } }
            ",
            Origin::Author,
        );
        assert_eq!(sheet.style_rule_count(), 4, "p, h1 (nested), a::after, .g");
        let CssRule::Style(p) = &sheet.rules[0] else {
            panic!("first rule is a style rule")
        };
        assert_eq!(
            p.block.declarations.len(),
            5,
            "color + 4 margins; bogus/invalid dropped"
        );
        assert_eq!(p.block.declarations[2].property, PropertyId::MarginRight);
        assert_eq!(
            p.block.declarations[2].value,
            SpecifiedValue::Length(Length::Px(2.0))
        );
        let CssRule::Media(m) = &sheet.rules[1] else {
            panic!("second rule is @media")
        };
        let CssRule::Style(h1) = &m.rules[0] else {
            panic!("nested style rule")
        };
        assert!(h1.block.declarations[0].important);
        assert_eq!(sheet.coverage.declarations_unknown, 1, "bogus");
        assert_eq!(sheet.coverage.declarations_invalid, 1, "12furlongs");
    }

    #[test]
    fn supports_keeps_known_properties_and_drops_unknown() {
        let sheet = parse_stylesheet(
            r"
            @supports (display: grid) { .g { display: grid } }
            @supports (not-a-property: 1) { .nope { color: red } }
            @supports not (display: grid) { .neg { color: blue } }
            @supports (display: 12furlongs) { .bad { color: green } }
            ",
            Origin::Author,
        );
        assert_eq!(sheet.style_rule_count(), 1, "only display:grid applies");
        let CssRule::Media(m) = &sheet.rules[0] else {
            panic!("kept @supports becomes a media wrapper")
        };
        let CssRule::Style(g) = &m.rules[0] else {
            panic!(".g kept")
        };
        assert_eq!(g.block.declarations[0].property, PropertyId::Display);
        assert!(
            sheet.rules.iter().all(|r| match r {
                CssRule::Media(inner) => inner.rules.iter().all(|n| match n {
                    CssRule::Style(s) => {
                        !s.block.declarations.iter().any(|d| {
                            matches!(d.property, PropertyId::Color)
                        })
                    }
                    _ => true,
                }),
                _ => true,
            }),
            "unknown / not / invalid @supports bodies must be dropped"
        );
    }

    #[test]
    fn style_attribute_blocks() {
        let block =
            parse_declaration_block("display:none;;color: #123 !important; --x: 1 !important");
        assert_eq!(block.declarations.len(), 3);
        assert!(!block.declarations[0].important);
        assert!(block.declarations[1].important);
        assert_eq!(block.declarations[2].value, SpecifiedValue::Raw("1".into()));
        assert!(block.declarations[2].important);
        assert_eq!(strip_cdata("<![CDATA[ a{} ]]>"), " a{} ");
    }

    #[test]
    fn parses_keyframes_and_ignores_them_in_style_count() {
        let sheet = parse_stylesheet(
            r"
            @keyframes fade {
                from { opacity: 0 }
                50% { opacity: 0.5 }
                to { opacity: 1 }
            }
            @-webkit-keyframes slide {
                0%, 100% { margin-left: 0 }
            }
            .box { animation-name: fade }
            ",
            Origin::Author,
        );
        assert_eq!(sheet.style_rule_count(), 1);
        let names: Vec<_> = sheet.keyframes().iter().map(|k| k.name.as_str()).collect();
        assert_eq!(names, ["fade", "slide"]);
        let fade = &sheet.keyframes()[0];
        assert_eq!(fade.frames.len(), 3);
        assert_eq!(fade.frames[0].offsets, [0.0]);
        assert_eq!(fade.frames[1].offsets, [0.5]);
        assert_eq!(fade.frames[2].offsets, [1.0]);
        assert!(!fade.frames[0].block.is_empty());
        let slide = &sheet.keyframes()[1];
        assert_eq!(slide.frames[0].offsets, [0.0, 1.0]);
    }

    #[test]
    fn parses_font_face_src_family_weight() {
        let sheet = parse_stylesheet(
            r#"
            @font-face {
                font-family: "InterTest";
                src: url("/fonts/inter.woff2") format("woff2"),
                     local("Inter"),
                     url(data:font/ttf;base64,AA==);
                font-weight: 600;
                font-style: italic;
            }
            "#,
            Origin::Author,
        );
        assert_eq!(sheet.style_rule_count(), 0);
        assert_eq!(sheet.font_faces().len(), 1);
        let face = &sheet.font_faces()[0];
        assert_eq!(face.family, "InterTest");
        assert_eq!(
            face.sources,
            [
                FontFaceSrc::Url("/fonts/inter.woff2".into()),
                FontFaceSrc::Local("Inter".into()),
                FontFaceSrc::Url("data:font/ttf;base64,AA==".into()),
            ]
        );
        assert_eq!(face.weight, FontWeight(600));
        assert_eq!(face.style, FontStyle::Italic);
    }
}

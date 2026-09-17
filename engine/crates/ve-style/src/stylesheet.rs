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

/// A top-level or nested rule.
#[derive(Clone, Debug)]
pub enum CssRule {
    /// A style rule.
    Style(StyleRule),
    /// A `@media` rule.
    Media(MediaRule),
    /// A `@keyframes` rule. Does not participate in the cascade.
    Keyframes(KeyframesRule),
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
                    CssRule::Keyframes(_) => 0,
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
                    CssRule::Style(_) => {}
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
    /// `@supports` / `@layer` / `@scope`: the body is parsed as rules; the
    /// condition is treated as true (`@supports not (...)` is rare in static
    /// pages and errs on the side of applying styles).
    Transparent,
    /// `@keyframes name`.
    Keyframes(String),
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
        } else if name.eq_ignore_ascii_case("supports")
            || name.eq_ignore_ascii_case("layer")
            || name.eq_ignore_ascii_case("scope")
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
                    AtPrelude::Transparent => Ok(CssRule::Media(MediaRule {
                        query: MediaQueryList::default(),
                        rules,
                    })),
                    AtPrelude::Keyframes(_) => unreachable!("handled above"),
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
}

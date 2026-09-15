//! Stylesheet model and parsing (`cssparser` rule/declaration drivers).

use cssparser::{
    AtRuleParser, CowRcStr, DeclarationParser, ParseError, Parser, ParserInput, ParserState,
    QualifiedRuleParser, RuleBodyItemParser, RuleBodyParser, StyleSheetParser, parse_important,
};
use selectors::SelectorList;
use selectors::parser::ParseRelative;
use ve_core::Stage;

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

/// A top-level or nested rule.
#[derive(Clone, Debug)]
pub enum CssRule {
    /// A style rule.
    Style(StyleRule),
    /// A `@media` rule.
    Media(MediaRule),
}

/// A parsed stylesheet.
#[derive(Clone, Debug)]
pub struct Stylesheet {
    /// Cascade origin.
    pub origin: Origin,
    /// Rules in source order.
    pub rules: Vec<CssRule>,
}

impl Stylesheet {
    /// An empty author stylesheet.
    #[must_use]
    pub fn empty(origin: Origin) -> Self {
        Self {
            origin,
            rules: Vec::new(),
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
                })
                .sum()
        }
        count(&self.rules)
    }
}

/// Parses a stylesheet. Invalid rules and declarations are skipped, as CSS
/// error recovery requires; nothing here can fail.
#[must_use]
pub fn parse_stylesheet(css: &str, origin: Origin) -> Stylesheet {
    let span = Stage::Style.span();
    let _guard = span.enter();
    let mut input = ParserInput::new(css);
    let mut parser = Parser::new(&mut input);
    let mut rule_parser = RuleParser;
    let rules = StyleSheetParser::new(&mut parser, &mut rule_parser)
        .filter_map(|r| match r {
            Ok(rule) => Some(rule),
            Err((err, slice)) => {
                tracing::debug!(?err.kind, slice, "skipping invalid rule");
                None
            }
        })
        .collect();
    Stylesheet { origin, rules }
}

/// Parses a declaration list, e.g. the contents of a `style=""` attribute.
#[must_use]
pub fn parse_declaration_block(css: &str) -> DeclarationBlock {
    let mut input = ParserInput::new(css);
    let mut parser = Parser::new(&mut input);
    parse_declarations(&mut parser)
}

fn parse_declarations<'i>(input: &mut Parser<'i, '_>) -> DeclarationBlock {
    let mut decl_parser = DeclarationListParser;
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

struct DeclarationListParser;

impl<'i> DeclarationParser<'i> for DeclarationListParser {
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
            let pairs = expanded.ok_or_else(|| {
                input.new_custom_error(StyleParseErrorKind::InvalidValue(name.clone()))
            })?;
            let important = important_at_end(input);
            input.expect_exhausted()?;
            return Ok(pairs
                .into_iter()
                .map(|(property, value)| PropertyDeclaration {
                    property,
                    value,
                    important,
                })
                .collect());
        }

        let property = PropertyId::from_name(&name).ok_or_else(|| {
            input.new_custom_error(StyleParseErrorKind::UnknownProperty(name.clone()))
        })?;

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
            return Ok(vec![PropertyDeclaration {
                property,
                value,
                important,
            }]);
        }

        let value = input.parse_until_before(cssparser::Delimiter::Bang, |i| {
            property
                .parse_value(i)
                .ok_or_else(|| i.new_custom_error(StyleParseErrorKind::InvalidValue(name.clone())))
        })?;
        let important = important_at_end(input);
        input.expect_exhausted()?;
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

impl<'i> QualifiedRuleParser<'i> for DeclarationListParser {
    type Prelude = ();
    type QualifiedRule = Vec<PropertyDeclaration>;
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> AtRuleParser<'i> for DeclarationListParser {
    type Prelude = ();
    type AtRule = Vec<PropertyDeclaration>;
    type Error = StyleParseErrorKind<'i>;
}

impl<'i> RuleBodyItemParser<'i, Vec<PropertyDeclaration>, StyleParseErrorKind<'i>>
    for DeclarationListParser
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

struct RuleParser;

/// Prelude of a supported at-rule.
enum AtPrelude {
    Media(MediaQueryList),
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
        let block = parse_declarations(input);
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
            AtPrelude::Media(query) => {
                let rules = RuleBodyParser::new(input, self)
                    .filter_map(|r| match r {
                        Ok(rule) => Some(rule),
                        Err((err, slice)) => {
                            tracing::debug!(?err.kind, slice, "skipping invalid nested rule");
                            None
                        }
                    })
                    .collect();
                Ok(CssRule::Media(MediaRule { query, rules }))
            }
        }
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
            ",
            Origin::Author,
        );
        assert_eq!(sheet.style_rule_count(), 3, "p, h1 (nested), a::after");
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
    }
}

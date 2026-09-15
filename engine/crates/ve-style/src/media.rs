//! Media queries (Media Queries Level 3 subset plus a few Level 5 features).
//!
//! Supported: `screen`/`print`/`all`, `only`/`not`, `and`, comma lists and the
//! features `width`, `height` (with `min-`/`max-` prefixes), `orientation`,
//! `prefers-color-scheme`, `prefers-reduced-motion`, `hover` and `pointer`.
//! Unknown features evaluate to `false` (the query never matches), unknown
//! media types likewise. Range syntax (`(width >= 600px)`) is a follow-up.

use cssparser::{Parser, ParserInput, Token};
use serde::{Deserialize, Serialize};
use ve_core::Size;

use crate::values::{Length, LengthContext};

/// Media type.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    /// Matches every device.
    #[default]
    All,
    /// Interactive screens (the default environment).
    Screen,
    /// Paged output.
    Print,
}

/// `prefers-color-scheme`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ColorScheme {
    /// Light UI.
    #[default]
    Light,
    /// Dark UI.
    Dark,
}

/// The environment media queries are evaluated against.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct MediaEnv {
    /// Viewport size in CSS pixels.
    pub viewport: Size,
    /// Device media type.
    pub media_type: MediaType,
    /// Preferred colour scheme.
    pub color_scheme: ColorScheme,
    /// `prefers-reduced-motion: reduce`.
    pub reduced_motion: bool,
    /// Primary pointing device can hover (`hover: hover`).
    pub can_hover: bool,
    /// Root font size for `em` in media features.
    pub root_font_size: f32,
}

impl Default for MediaEnv {
    fn default() -> Self {
        Self {
            viewport: Size::new(1280.0, 720.0),
            media_type: MediaType::Screen,
            color_scheme: ColorScheme::Light,
            reduced_motion: false,
            can_hover: true,
            root_font_size: 16.0,
        }
    }
}

impl MediaEnv {
    /// A screen environment with the given viewport.
    #[must_use]
    pub fn screen(width: f32, height: f32) -> Self {
        Self {
            viewport: Size::new(width, height),
            ..Self::default()
        }
    }
}

/// A single media feature test.
#[derive(Clone, Debug, PartialEq)]
pub enum MediaFeature {
    /// `(min-width: L)`
    MinWidth(Length),
    /// `(max-width: L)`
    MaxWidth(Length),
    /// `(width: L)`
    Width(Length),
    /// `(min-height: L)`
    MinHeight(Length),
    /// `(max-height: L)`
    MaxHeight(Length),
    /// `(height: L)`
    Height(Length),
    /// `(orientation: portrait)` is `true`; landscape is `false`.
    OrientationPortrait(bool),
    /// `(prefers-color-scheme: …)`
    PrefersColorScheme(ColorScheme),
    /// `(prefers-reduced-motion: reduce)` is `true`; `no-preference` is `false`.
    PrefersReducedMotion(bool),
    /// `(hover: hover)` is `true`; `none` is `false`.
    Hover(bool),
    /// `(pointer: fine)` is `true`; `coarse`/`none` is `false`.
    PointerFine(bool),
    /// Anything the engine does not understand; never matches.
    Unknown(String),
}

impl MediaFeature {
    fn evaluate(&self, env: &MediaEnv) -> bool {
        let ctx = LengthContext {
            font_size: env.root_font_size,
            root_font_size: env.root_font_size,
            viewport: env.viewport,
        };
        let (w, h) = (env.viewport.width, env.viewport.height);
        match self {
            Self::MinWidth(l) => w >= l.to_px(&ctx),
            Self::MaxWidth(l) => w <= l.to_px(&ctx),
            Self::Width(l) => (w - l.to_px(&ctx)).abs() < 0.5,
            Self::MinHeight(l) => h >= l.to_px(&ctx),
            Self::MaxHeight(l) => h <= l.to_px(&ctx),
            Self::Height(l) => (h - l.to_px(&ctx)).abs() < 0.5,
            Self::OrientationPortrait(portrait) => (h >= w) == *portrait,
            Self::PrefersColorScheme(s) => env.color_scheme == *s,
            Self::PrefersReducedMotion(r) => env.reduced_motion == *r,
            Self::Hover(hover) | Self::PointerFine(hover) => env.can_hover == *hover,
            Self::Unknown(_) => false,
        }
    }
}

/// One comma-separated branch of a media query list.
#[derive(Clone, Debug, PartialEq)]
pub struct MediaQuery {
    /// `not` prefix.
    pub negated: bool,
    /// Media type (`all` if omitted).
    pub media_type: Option<MediaType>,
    /// `and`-joined features.
    pub features: Vec<MediaFeature>,
    /// The query failed to parse and must never match.
    pub invalid: bool,
}

impl MediaQuery {
    fn evaluate(&self, env: &MediaEnv) -> bool {
        if self.invalid {
            return false;
        }
        let type_ok = match self.media_type {
            None | Some(MediaType::All) => true,
            Some(t) => t == env.media_type,
        };
        let result = type_ok && self.features.iter().all(|f| f.evaluate(env));
        result != self.negated
    }
}

/// A comma separated list of media queries. The empty list matches always.
#[derive(Clone, Debug, PartialEq, Default)]
pub struct MediaQueryList {
    /// The branches; any matching branch makes the list match.
    pub queries: Vec<MediaQuery>,
}

impl MediaQueryList {
    /// Parses from a string.
    #[must_use]
    pub fn parse_str(text: &str) -> Self {
        let mut input = ParserInput::new(text);
        let mut parser = Parser::new(&mut input);
        Self::parse(&mut parser)
    }

    /// Parses from an in-progress parser (the `@media` prelude).
    pub fn parse(input: &mut Parser<'_, '_>) -> Self {
        let queries = input.parse_comma_separated_ignoring_errors(|i| {
            Ok::<_, cssparser::ParseError<'_, ()>>(parse_query(i))
        });
        Self { queries }
    }

    /// Returns `true` if the list matches `env`.
    #[must_use]
    pub fn evaluate(&self, env: &MediaEnv) -> bool {
        self.queries.is_empty() || self.queries.iter().any(|q| q.evaluate(env))
    }
}

fn parse_query(input: &mut Parser<'_, '_>) -> MediaQuery {
    let mut query = MediaQuery {
        negated: false,
        media_type: None,
        features: Vec::new(),
        invalid: false,
    };
    let mut expect_and = false;
    loop {
        let Ok(token) = input.next().cloned() else {
            break;
        };
        match token {
            Token::Ident(ident) => {
                let lower = ident.to_ascii_lowercase();
                match lower.as_str() {
                    "only" if query.media_type.is_none() && query.features.is_empty() => {}
                    "not" if query.media_type.is_none() && query.features.is_empty() => {
                        query.negated = true
                    }
                    "and" if expect_and => expect_and = false,
                    "all" | "screen" | "print"
                        if query.media_type.is_none() && query.features.is_empty() =>
                    {
                        query.media_type = Some(match lower.as_str() {
                            "screen" => MediaType::Screen,
                            "print" => MediaType::Print,
                            _ => MediaType::All,
                        });
                        expect_and = true;
                    }
                    _ => {
                        // Unknown media type (e.g. `speech`) or misplaced keyword: never matches.
                        query.invalid = true;
                        while input.next().is_ok() {}
                        return query;
                    }
                }
            }
            Token::ParenthesisBlock => {
                let feature = input
                    .parse_nested_block(|args| {
                        Ok::<_, cssparser::ParseError<'_, ()>>(parse_feature(args))
                    })
                    .unwrap_or_else(|_| MediaFeature::Unknown(String::new()));
                query.features.push(feature);
                expect_and = true;
            }
            _ => {
                query.invalid = true;
                while input.next().is_ok() {}
                return query;
            }
        }
    }
    query
}

fn parse_feature(input: &mut Parser<'_, '_>) -> MediaFeature {
    let Ok(name) = input.expect_ident_cloned() else {
        return MediaFeature::Unknown(String::new());
    };
    let name = name.to_ascii_lowercase();
    if input.expect_colon().is_err() {
        // Boolean context, e.g. `(hover)`.
        return match name.as_str() {
            "hover" => MediaFeature::Hover(true),
            "pointer" => MediaFeature::PointerFine(true),
            _ => MediaFeature::Unknown(name),
        };
    }
    let length = |input: &mut Parser<'_, '_>| -> Option<Length> {
        match input.next().ok()?.clone() {
            Token::Dimension { value, unit, .. } => Length::from_unit(value, &unit),
            Token::Number { value: 0.0, .. } => Some(Length::ZERO),
            _ => None,
        }
    };
    let ident = |input: &mut Parser<'_, '_>| {
        input
            .expect_ident_cloned()
            .ok()
            .map(|s| s.to_ascii_lowercase())
    };
    let feature = match name.as_str() {
        "min-width" => length(input).map(MediaFeature::MinWidth),
        "max-width" => length(input).map(MediaFeature::MaxWidth),
        "width" => length(input).map(MediaFeature::Width),
        "min-height" => length(input).map(MediaFeature::MinHeight),
        "max-height" => length(input).map(MediaFeature::MaxHeight),
        "height" => length(input).map(MediaFeature::Height),
        "orientation" => ident(input).and_then(|v| match v.as_str() {
            "portrait" => Some(MediaFeature::OrientationPortrait(true)),
            "landscape" => Some(MediaFeature::OrientationPortrait(false)),
            _ => None,
        }),
        "prefers-color-scheme" => ident(input).and_then(|v| match v.as_str() {
            "light" => Some(MediaFeature::PrefersColorScheme(ColorScheme::Light)),
            "dark" => Some(MediaFeature::PrefersColorScheme(ColorScheme::Dark)),
            _ => None,
        }),
        "prefers-reduced-motion" => ident(input).and_then(|v| match v.as_str() {
            "reduce" => Some(MediaFeature::PrefersReducedMotion(true)),
            "no-preference" => Some(MediaFeature::PrefersReducedMotion(false)),
            _ => None,
        }),
        "hover" => ident(input).and_then(|v| match v.as_str() {
            "hover" => Some(MediaFeature::Hover(true)),
            "none" => Some(MediaFeature::Hover(false)),
            _ => None,
        }),
        "pointer" => ident(input).and_then(|v| match v.as_str() {
            "fine" => Some(MediaFeature::PointerFine(true)),
            "coarse" | "none" => Some(MediaFeature::PointerFine(false)),
            _ => None,
        }),
        _ => None,
    };
    // Swallow anything left so the caller's nested block ends cleanly.
    while input.next().is_ok() {}
    feature.unwrap_or(MediaFeature::Unknown(name))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn evaluates_common_queries() {
        let env = MediaEnv::screen(800.0, 600.0);
        let yes = |q: &str| MediaQueryList::parse_str(q).evaluate(&env);
        assert!(yes(""));
        assert!(yes("screen"));
        assert!(!yes("print"));
        assert!(yes("(min-width: 600px)"));
        assert!(!yes("(min-width: 900px)"));
        assert!(yes("screen and (max-width: 50em)")); // 800px = 50em
        assert!(yes("(orientation: landscape)"));
        assert!(yes("not print"));
        assert!(yes("print, (min-width: 100px)"), "any branch");
        assert!(!yes("(prefers-color-scheme: dark)"));
        assert!(!yes("speech"), "unknown type never matches");
        assert!(!yes("(unknown-feature: 1)"));
        assert!(yes("only screen and (hover: hover) and (pointer: fine)"));
    }
}

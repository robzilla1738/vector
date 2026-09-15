//! Target string grammar (`contracts/program.ts` `target`): `r12`,
//! `css:<selector>`, `xpath:<expr>`, `text=<visible text>`,
//! `role=<role>[name="…"]`, `label=<label>`; anything else is a CSS selector.

use ve_core::{Error, Result};

/// A parsed target.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum TargetSpec {
    /// `r<index>`.
    Ref(u32),
    /// CSS selector (may pierce open shadow roots with `>>`).
    Css(String),
    /// Visible text (exact, then substring).
    Text(String),
    /// Accessibility role with optional name.
    Role {
        /// ARIA role.
        role: String,
        /// Accessible name (exact, case-insensitive).
        name: Option<String>,
    },
    /// Form control by label / accessible name.
    Label(String),
}

impl TargetSpec {
    /// Parses a target string.
    pub fn parse(target: &str) -> Result<Self> {
        let t = target.trim();
        if t.is_empty() {
            return Err(Error::invalid_params("empty target"));
        }
        if let Some(index) = ve_a11y::parse_ref(t) {
            return Ok(Self::Ref(index));
        }
        if let Some(css) = t.strip_prefix("css:") {
            return Ok(Self::Css(css.trim().to_owned()));
        }
        if t.starts_with("xpath:") || t.starts_with("xpath=") || t.starts_with("//") {
            return Err(Error::capability_unsupported(
                "xpath targets are not supported by the engine (use css:, text= or role=)",
            ));
        }
        if let Some(text) = t.strip_prefix("text=").or_else(|| t.strip_prefix("text:")) {
            return Ok(Self::Text(unquote(text.trim()).to_owned()));
        }
        if let Some(label) = t
            .strip_prefix("label=")
            .or_else(|| t.strip_prefix("label:"))
        {
            return Ok(Self::Label(unquote(label.trim()).to_owned()));
        }
        if let Some(rest) = t.strip_prefix("role=").or_else(|| t.strip_prefix("role:")) {
            let (role, attrs) = rest.split_once('[').unwrap_or((rest, ""));
            let role = role.trim().to_owned();
            if role.is_empty() {
                return Err(Error::invalid_params(format!(
                    "target {target:?}: empty role"
                )));
            }
            let mut name = None;
            if !attrs.is_empty() {
                let inner = attrs.strip_suffix(']').ok_or_else(|| {
                    Error::invalid_params(format!("target {target:?}: unterminated '['"))
                })?;
                for part in inner.split(',') {
                    let (k, v) = part.split_once('=').ok_or_else(|| {
                        Error::invalid_params(format!("target {target:?}: expected key=value"))
                    })?;
                    match k.trim() {
                        "name" => name = Some(unquote(v.trim()).to_owned()),
                        other => {
                            return Err(Error::invalid_params(format!(
                                "target {target:?}: unknown role attribute {other:?}"
                            )));
                        }
                    }
                }
            }
            return Ok(Self::Role { role, name });
        }
        Ok(Self::Css(t.to_owned()))
    }
}

fn unquote(s: &str) -> &str {
    if s.len() >= 2
        && ((s.starts_with('"') && s.ends_with('"')) || (s.starts_with('\'') && s.ends_with('\'')))
    {
        &s[1..s.len() - 1]
    } else {
        s
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn grammar() {
        assert_eq!(TargetSpec::parse("r12").unwrap(), TargetSpec::Ref(12));
        assert_eq!(
            TargetSpec::parse("css:#q > input").unwrap(),
            TargetSpec::Css("#q > input".into())
        );
        assert_eq!(
            TargetSpec::parse("button.primary").unwrap(),
            TargetSpec::Css("button.primary".into())
        );
        assert_eq!(
            TargetSpec::parse("text=Save changes").unwrap(),
            TargetSpec::Text("Save changes".into())
        );
        assert_eq!(
            TargetSpec::parse("text=\"Quoted\"").unwrap(),
            TargetSpec::Text("Quoted".into())
        );
        assert_eq!(
            TargetSpec::parse("role=button[name=\"Save\"]").unwrap(),
            TargetSpec::Role {
                role: "button".into(),
                name: Some("Save".into())
            }
        );
        assert_eq!(
            TargetSpec::parse("role=link").unwrap(),
            TargetSpec::Role {
                role: "link".into(),
                name: None
            }
        );
        assert_eq!(
            TargetSpec::parse("label=Email").unwrap(),
            TargetSpec::Label("Email".into())
        );
        assert_eq!(
            TargetSpec::parse("xpath://a").unwrap_err().code(),
            ve_core::ErrorCode::CapabilityUnsupported
        );
        assert_eq!(
            TargetSpec::parse("").unwrap_err().code(),
            ve_core::ErrorCode::InvalidParams
        );
        assert_eq!(
            TargetSpec::parse("role=button[name=x").unwrap_err().code(),
            ve_core::ErrorCode::InvalidParams
        );
        assert_eq!(
            TargetSpec::parse("role=button[colour=red]")
                .unwrap_err()
                .code(),
            ve_core::ErrorCode::InvalidParams
        );
    }
}

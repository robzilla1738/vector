//! Key chord parsing for `press` (`Enter`, `Shift+Tab`, `Control+A`, ` `).

use ve_core::{Error, Result};

/// Modifier flags.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Modifiers {
    /// Control.
    pub control: bool,
    /// Shift.
    pub shift: bool,
    /// Alt / Option.
    pub alt: bool,
    /// Meta / Command.
    pub meta: bool,
}

impl Modifiers {
    /// Chrome `NativeEvent` mask: 1 = alt, 2 = ctrl, 4 = meta, 8 = shift.
    #[must_use]
    pub fn from_mask(mask: u8) -> Self {
        Self {
            alt: mask & 1 != 0,
            control: mask & 2 != 0,
            meta: mask & 4 != 0,
            shift: mask & 8 != 0,
        }
    }
}

/// A named key.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Key {
    /// Enter / Return.
    Enter,
    /// Tab.
    Tab,
    /// Escape.
    Escape,
    /// Space bar.
    Space,
    /// Backspace.
    Backspace,
    /// Delete.
    Delete,
    /// Arrow keys.
    ArrowUp,
    /// Arrow keys.
    ArrowDown,
    /// Arrow keys.
    ArrowLeft,
    /// Arrow keys.
    ArrowRight,
    /// Home.
    Home,
    /// End.
    End,
    /// Page up.
    PageUp,
    /// Page down.
    PageDown,
    /// Function key `F1`–`F12`.
    Function(u8),
    /// A printable character.
    Char(char),
}

/// A parsed chord.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Chord {
    /// Modifiers.
    pub modifiers: Modifiers,
    /// The key.
    pub key: Key,
}

impl Chord {
    /// Parses `Control+Shift+A`, `Enter`, ` `, `a`, `Shift+Tab`.
    pub fn parse(text: &str) -> Result<Self> {
        if text == " " || text == "+" {
            return Ok(Self {
                modifiers: Modifiers::default(),
                key: if text == " " {
                    Key::Space
                } else {
                    Key::Char('+')
                },
            });
        }
        let mut modifiers = Modifiers::default();
        let parts: Vec<&str> = text.split('+').collect();
        let (mods, key_text) = parts.split_at(parts.len().saturating_sub(1));
        let key_text = key_text.first().copied().unwrap_or("");
        for m in mods {
            match m.to_ascii_lowercase().as_str() {
                "control" | "ctrl" | "controlorMeta" => modifiers.control = true,
                "shift" => modifiers.shift = true,
                "alt" | "option" => modifiers.alt = true,
                "meta" | "command" | "cmd" | "super" => modifiers.meta = true,
                "" => {}
                other => {
                    return Err(Error::invalid_params(format!(
                        "unknown modifier {other:?} in key chord {text:?}"
                    )));
                }
            }
        }
        let key = match key_text {
            "Enter" | "Return" | "NumpadEnter" => Key::Enter,
            "Tab" => Key::Tab,
            "Escape" | "Esc" => Key::Escape,
            "Space" | " " => Key::Space,
            "Backspace" => Key::Backspace,
            "Delete" | "Del" => Key::Delete,
            "ArrowUp" | "Up" => Key::ArrowUp,
            "ArrowDown" | "Down" => Key::ArrowDown,
            "ArrowLeft" | "Left" => Key::ArrowLeft,
            "ArrowRight" | "Right" => Key::ArrowRight,
            "Home" => Key::Home,
            "End" => Key::End,
            "PageUp" => Key::PageUp,
            "PageDown" => Key::PageDown,
            f if f.len() >= 2
                && f.as_bytes()[0].eq_ignore_ascii_case(&b'F')
                && f[1..].parse::<u8>().is_ok_and(|n| (1..=12).contains(&n)) =>
            {
                Key::Function(f[1..].parse().unwrap_or(1))
            }
            other => {
                let mut chars = other.chars();
                match (chars.next(), chars.next()) {
                    (Some(c), None) => Key::Char(c),
                    _ => {
                        return Err(Error::invalid_params(format!("unknown key chord {text:?}")));
                    }
                }
            }
        };
        Ok(Self { modifiers, key })
    }

    /// The character this chord types into a text field, if any.
    #[must_use]
    pub fn typed_char(&self) -> Option<char> {
        if self.modifiers.control || self.modifiers.alt || self.modifiers.meta {
            return None;
        }
        match &self.key {
            Key::Char(c) => Some(if self.modifiers.shift {
                c.to_ascii_uppercase()
            } else {
                *c
            }),
            Key::Space => Some(' '),
            _ => None,
        }
    }

    /// UI Events `KeyboardEvent.key`.
    #[must_use]
    pub fn key_name(&self) -> String {
        match &self.key {
            Key::Enter => "Enter".into(),
            Key::Tab => "Tab".into(),
            Key::Escape => "Escape".into(),
            Key::Space => " ".into(),
            Key::Backspace => "Backspace".into(),
            Key::Delete => "Delete".into(),
            Key::ArrowUp => "ArrowUp".into(),
            Key::ArrowDown => "ArrowDown".into(),
            Key::ArrowLeft => "ArrowLeft".into(),
            Key::ArrowRight => "ArrowRight".into(),
            Key::Home => "Home".into(),
            Key::End => "End".into(),
            Key::PageUp => "PageUp".into(),
            Key::PageDown => "PageDown".into(),
            Key::Function(n) => format!("F{n}"),
            Key::Char(c) => self.typed_char().unwrap_or(*c).to_string(),
        }
    }

    /// UI Events `KeyboardEvent.code`.
    #[must_use]
    pub fn code(&self) -> String {
        match &self.key {
            Key::Enter => "Enter".into(),
            Key::Tab => "Tab".into(),
            Key::Escape => "Escape".into(),
            Key::Space => "Space".into(),
            Key::Backspace => "Backspace".into(),
            Key::Delete => "Delete".into(),
            Key::ArrowUp => "ArrowUp".into(),
            Key::ArrowDown => "ArrowDown".into(),
            Key::ArrowLeft => "ArrowLeft".into(),
            Key::ArrowRight => "ArrowRight".into(),
            Key::Home => "Home".into(),
            Key::End => "End".into(),
            Key::PageUp => "PageUp".into(),
            Key::PageDown => "PageDown".into(),
            Key::Function(n) => format!("F{n}"),
            Key::Char(c) => format!("Key{}", c.to_ascii_uppercase()),
        }
    }

    /// Legacy `keyCode` / `which`.
    #[must_use]
    pub fn key_code(&self) -> u32 {
        match &self.key {
            Key::Enter => 13,
            Key::Tab => 9,
            Key::Escape => 27,
            Key::Space => 32,
            Key::Backspace => 8,
            Key::Delete => 46,
            Key::ArrowLeft => 37,
            Key::ArrowUp => 38,
            Key::ArrowRight => 39,
            Key::ArrowDown => 40,
            Key::Home => 36,
            Key::End => 35,
            Key::PageUp => 33,
            Key::PageDown => 34,
            Key::Function(n) => 111 + u32::from(*n),
            Key::Char(c) => u32::from(c.to_ascii_uppercase()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_chords_and_rejects_unknown_ones() {
        let c = Chord::parse("Control+Shift+A").unwrap();
        assert!(c.modifiers.control && c.modifiers.shift && !c.modifiers.alt);
        assert_eq!(c.key, Key::Char('A'));
        assert_eq!(c.typed_char(), None, "control chords do not type");
        assert_eq!(Chord::parse("Shift+Tab").unwrap().key, Key::Tab);
        assert_eq!(Chord::parse(" ").unwrap().key, Key::Space);
        assert_eq!(Chord::parse("+").unwrap().key, Key::Char('+'));
        assert_eq!(Chord::parse("a").unwrap().typed_char(), Some('a'));
        assert_eq!(Chord::parse("Shift+a").unwrap().typed_char(), Some('A'));
        assert_eq!(Chord::parse("Enter").unwrap().key, Key::Enter);
        assert_eq!(Chord::parse("ArrowDown").unwrap().key, Key::ArrowDown);
        assert_eq!(Chord::parse("F5").unwrap().key, Key::Function(5));
        assert_eq!(Chord::parse("F12").unwrap().key, Key::Function(12));
        assert_eq!(Chord::parse("F5").unwrap().key_code(), 116);
        let mods = Modifiers::from_mask(2 | 8);
        assert!(mods.control && mods.shift && !mods.alt && !mods.meta);
        let bad = Chord::parse("Hyper+A").unwrap_err();
        assert_eq!(bad.code(), ve_core::ErrorCode::InvalidParams);
        let bad = Chord::parse("Teleport").unwrap_err();
        assert!(bad.to_string().contains("unknown key chord"));
    }
}

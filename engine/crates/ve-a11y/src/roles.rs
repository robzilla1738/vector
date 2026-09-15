//! ARIA roles and the HTML-AAM implicit role mapping.

use serde::{Deserialize, Serialize};
use ve_core::NodeId;
use ve_dom::{Document, ElementData};

/// An accessibility role (WAI-ARIA 1.2 subset relevant to agents).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
#[allow(missing_docs)]
pub enum Role {
    Alert,
    Article,
    Banner,
    Button,
    Cell,
    Checkbox,
    ColumnHeader,
    Combobox,
    Complementary,
    ContentInfo,
    Dialog,
    Document,
    Figure,
    Form,
    Generic,
    Group,
    Heading,
    Image,
    Link,
    List,
    ListBox,
    ListItem,
    Main,
    Menu,
    MenuItem,
    Navigation,
    Option,
    Paragraph,
    Presentation,
    ProgressBar,
    Radio,
    RadioGroup,
    Region,
    Row,
    RowHeader,
    SearchBox,
    Separator,
    Slider,
    SpinButton,
    StaticText,
    Status,
    Switch,
    Tab,
    Table,
    TabList,
    TabPanel,
    TextBox,
    Toolbar,
    Tooltip,
    Tree,
    TreeItem,
}

impl Role {
    /// Parses the first recognised token of a `role` attribute.
    #[must_use]
    pub fn from_aria(value: &str) -> Option<Self> {
        value.split_ascii_whitespace().find_map(|token| {
            Some(match token.to_ascii_lowercase().as_str() {
                "alert" => Self::Alert,
                "article" => Self::Article,
                "banner" => Self::Banner,
                "button" => Self::Button,
                "cell" | "gridcell" => Self::Cell,
                "checkbox" => Self::Checkbox,
                "columnheader" => Self::ColumnHeader,
                "combobox" => Self::Combobox,
                "complementary" => Self::Complementary,
                "contentinfo" => Self::ContentInfo,
                "dialog" | "alertdialog" => Self::Dialog,
                "document" => Self::Document,
                "figure" => Self::Figure,
                "form" => Self::Form,
                "generic" => Self::Generic,
                "group" => Self::Group,
                "heading" => Self::Heading,
                "img" | "image" => Self::Image,
                "link" => Self::Link,
                "list" => Self::List,
                "listbox" => Self::ListBox,
                "listitem" => Self::ListItem,
                "main" => Self::Main,
                "menu" | "menubar" => Self::Menu,
                "menuitem" | "menuitemcheckbox" | "menuitemradio" => Self::MenuItem,
                "navigation" => Self::Navigation,
                "option" => Self::Option,
                "paragraph" => Self::Paragraph,
                "presentation" | "none" => Self::Presentation,
                "progressbar" => Self::ProgressBar,
                "radio" => Self::Radio,
                "radiogroup" => Self::RadioGroup,
                "region" => Self::Region,
                "row" => Self::Row,
                "rowheader" => Self::RowHeader,
                "searchbox" => Self::SearchBox,
                "separator" => Self::Separator,
                "slider" => Self::Slider,
                "spinbutton" => Self::SpinButton,
                "status" => Self::Status,
                "switch" => Self::Switch,
                "tab" => Self::Tab,
                "table" | "grid" | "treegrid" => Self::Table,
                "tablist" => Self::TabList,
                "tabpanel" => Self::TabPanel,
                "textbox" => Self::TextBox,
                "toolbar" => Self::Toolbar,
                "tooltip" => Self::Tooltip,
                "tree" => Self::Tree,
                "treeitem" => Self::TreeItem,
                _ => return None,
            })
        })
    }

    /// The canonical ARIA role name.
    #[must_use]
    pub fn name(self) -> &'static str {
        match self {
            Self::Alert => "alert",
            Self::Article => "article",
            Self::Banner => "banner",
            Self::Button => "button",
            Self::Cell => "cell",
            Self::Checkbox => "checkbox",
            Self::ColumnHeader => "columnheader",
            Self::Combobox => "combobox",
            Self::Complementary => "complementary",
            Self::ContentInfo => "contentinfo",
            Self::Dialog => "dialog",
            Self::Document => "document",
            Self::Figure => "figure",
            Self::Form => "form",
            Self::Generic => "generic",
            Self::Group => "group",
            Self::Heading => "heading",
            Self::Image => "img",
            Self::Link => "link",
            Self::List => "list",
            Self::ListBox => "listbox",
            Self::ListItem => "listitem",
            Self::Main => "main",
            Self::Menu => "menu",
            Self::MenuItem => "menuitem",
            Self::Navigation => "navigation",
            Self::Option => "option",
            Self::Paragraph => "paragraph",
            Self::Presentation => "presentation",
            Self::ProgressBar => "progressbar",
            Self::Radio => "radio",
            Self::RadioGroup => "radiogroup",
            Self::Region => "region",
            Self::Row => "row",
            Self::RowHeader => "rowheader",
            Self::SearchBox => "searchbox",
            Self::Separator => "separator",
            Self::Slider => "slider",
            Self::SpinButton => "spinbutton",
            Self::StaticText => "text",
            Self::Status => "status",
            Self::Switch => "switch",
            Self::Tab => "tab",
            Self::Table => "table",
            Self::TabList => "tablist",
            Self::TabPanel => "tabpanel",
            Self::TextBox => "textbox",
            Self::Toolbar => "toolbar",
            Self::Tooltip => "tooltip",
            Self::Tree => "tree",
            Self::TreeItem => "treeitem",
        }
    }

    /// Whether the accessible name may be computed from descendant content.
    #[must_use]
    pub fn allows_name_from_content(self) -> bool {
        matches!(
            self,
            Self::Button
                | Self::Cell
                | Self::Checkbox
                | Self::ColumnHeader
                | Self::Heading
                | Self::Link
                | Self::ListItem
                | Self::MenuItem
                | Self::Option
                | Self::Radio
                | Self::Row
                | Self::RowHeader
                | Self::Switch
                | Self::Tab
                | Self::Tooltip
                | Self::TreeItem
        )
    }

    /// Whether the role is an interactive widget an agent might act on.
    #[must_use]
    pub fn is_interactive(self) -> bool {
        matches!(
            self,
            Self::Button
                | Self::Checkbox
                | Self::Combobox
                | Self::Link
                | Self::ListBox
                | Self::MenuItem
                | Self::Option
                | Self::Radio
                | Self::SearchBox
                | Self::Slider
                | Self::SpinButton
                | Self::Switch
                | Self::Tab
                | Self::TextBox
                | Self::TreeItem
        )
    }

    /// Whether the role is a landmark.
    #[must_use]
    pub fn is_landmark(self) -> bool {
        matches!(
            self,
            Self::Banner
                | Self::Complementary
                | Self::ContentInfo
                | Self::Form
                | Self::Main
                | Self::Navigation
                | Self::Region
        )
    }

    /// Whether this role carries a checked/selected state.
    #[must_use]
    pub fn is_checkable(self) -> bool {
        matches!(
            self,
            Self::Checkbox | Self::Radio | Self::Switch | Self::MenuItem
        )
    }

    /// The role of an element: explicit `role` attribute if valid, otherwise
    /// the implicit HTML mapping. Returns `None` for elements that have no
    /// accessibility presence at all (e.g. `<input type=hidden>`).
    #[must_use]
    pub fn for_element(doc: &Document, id: NodeId) -> Option<Self> {
        let element = doc.element(id)?;
        if let Some(explicit) = element.attr("role").and_then(Self::from_aria) {
            return Some(explicit);
        }
        Self::implicit(doc, id, element)
    }

    /// The HTML-AAM implicit role of an element.
    #[must_use]
    pub fn implicit(doc: &Document, id: NodeId, element: &ElementData) -> Option<Self> {
        if element.namespace != ve_dom::Namespace::Html {
            return Some(if element.name == "svg" {
                Self::Image
            } else {
                Self::Generic
            });
        }
        let has_name_attr = element
            .attr("aria-label")
            .is_some_and(|v| !v.trim().is_empty())
            || element
                .attr("aria-labelledby")
                .is_some_and(|v| !v.trim().is_empty());
        Some(match element.name.as_str() {
            "a" | "area" => {
                if element.has_attr("href") {
                    Self::Link
                } else {
                    Self::Generic
                }
            }
            "article" => Self::Article,
            "aside" => Self::Complementary,
            "button" | "summary" => Self::Button,
            "datalist" | "select" => {
                let multiple = element.has_attr("multiple")
                    || element
                        .attr("size")
                        .and_then(|s| s.parse::<u32>().ok())
                        .is_some_and(|s| s > 1);
                if multiple {
                    Self::ListBox
                } else {
                    Self::Combobox
                }
            }
            "dialog" => Self::Dialog,
            "fieldset" | "details" | "optgroup" | "address" => Self::Group,
            "figure" => Self::Figure,
            "footer" => {
                if in_sectioning_content(doc, id) {
                    Self::Generic
                } else {
                    Self::ContentInfo
                }
            }
            "header" => {
                if in_sectioning_content(doc, id) {
                    Self::Generic
                } else {
                    Self::Banner
                }
            }
            "form" => Self::Form,
            "h1" | "h2" | "h3" | "h4" | "h5" | "h6" => Self::Heading,
            "hr" => Self::Separator,
            "html" => Self::Document,
            "img" => {
                if element.attr("alt") == Some("") {
                    Self::Presentation
                } else {
                    Self::Image
                }
            }
            "input" => match element.attr("type").map(str::to_ascii_lowercase).as_deref() {
                Some("checkbox") => Self::Checkbox,
                Some("radio") => Self::Radio,
                Some("range") => Self::Slider,
                Some("number") => Self::SpinButton,
                Some("search") => Self::SearchBox,
                Some("button" | "submit" | "reset" | "image") => Self::Button,
                Some("hidden") => return None,
                Some("email" | "tel" | "url" | "text") | None if element.has_attr("list") => {
                    Self::Combobox
                }
                _ => Self::TextBox,
            },
            "li" => Self::ListItem,
            "main" => Self::Main,
            "menu" | "ol" | "ul" => Self::List,
            "meter" | "progress" => Self::ProgressBar,
            "nav" => Self::Navigation,
            "option" => Self::Option,
            "output" => Self::Status,
            "p" => Self::Paragraph,
            "section" => {
                if has_name_attr {
                    Self::Region
                } else {
                    Self::Generic
                }
            }
            "table" => Self::Table,
            "tr" => Self::Row,
            "td" => Self::Cell,
            "th" => {
                if element
                    .attr("scope")
                    .is_some_and(|s| s.eq_ignore_ascii_case("row"))
                {
                    Self::RowHeader
                } else {
                    Self::ColumnHeader
                }
            }
            "textarea" => Self::TextBox,
            "dl" => Self::List,
            "dt" | "dd" => Self::ListItem,
            "blockquote" | "code" | "em" | "strong" | "b" | "i" | "small" | "sub" | "sup"
            | "time" | "mark" | "abbr" | "del" | "ins" | "s" | "u" | "q" | "cite" | "dfn"
            | "kbd" | "samp" | "var" | "span" | "div" | "body" | "label" | "legend" | "caption"
            | "thead" | "tbody" | "tfoot" | "pre" | "br" | "wbr" | "picture" | "slot" => {
                Self::Generic
            }
            _ => Self::Generic,
        })
    }
}

fn in_sectioning_content(doc: &Document, id: NodeId) -> bool {
    doc.ancestors(id).any(|a| {
        doc.element(a).is_some_and(|e| {
            matches!(
                e.name.as_str(),
                "article" | "aside" | "main" | "nav" | "section"
            )
        })
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn implicit_roles_follow_html_aam() {
        let doc = ve_html::parse_document(
            "<nav><a href=x>l</a><a>plain</a></nav><input type=checkbox><input type=hidden>\
             <img alt=''><img alt='pic'><select><option>a</select><section aria-label=s></section><section></section>\
             <article><header>h</header></article><header>top</header><span role='button link'>x</span>",
        )
        .document;
        let role_of = |sel_name: &str, nth: usize| {
            let id = doc
                .elements()
                .filter(|&e| doc.element(e).unwrap().name == sel_name)
                .nth(nth)
                .unwrap();
            Role::for_element(&doc, id)
        };
        assert_eq!(role_of("nav", 0), Some(Role::Navigation));
        assert_eq!(role_of("a", 0), Some(Role::Link));
        assert_eq!(role_of("a", 1), Some(Role::Generic));
        assert_eq!(role_of("input", 0), Some(Role::Checkbox));
        assert_eq!(role_of("input", 1), None);
        assert_eq!(role_of("img", 0), Some(Role::Presentation));
        assert_eq!(role_of("img", 1), Some(Role::Image));
        assert_eq!(role_of("select", 0), Some(Role::Combobox));
        assert_eq!(role_of("section", 0), Some(Role::Region));
        assert_eq!(role_of("section", 1), Some(Role::Generic));
        assert_eq!(
            role_of("header", 0),
            Some(Role::Generic),
            "header inside article"
        );
        assert_eq!(role_of("header", 1), Some(Role::Banner));
        assert_eq!(
            role_of("span", 0),
            Some(Role::Button),
            "first valid explicit token wins"
        );
        assert_eq!(Role::from_aria("bogus none"), Some(Role::Presentation));
        assert_eq!(
            serde_json::to_string(&Role::ColumnHeader).unwrap(),
            "\"columnheader\""
        );
    }
}

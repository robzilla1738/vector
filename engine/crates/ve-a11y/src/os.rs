//! AccessKit tree conversion (VEC-014 OS adapter source).

use accesskit::{Live as AkLive, Node, NodeId as AkId, Role as AkRole, Tree, TreeUpdate};

use crate::roles::Role;
use crate::tree::{AccessibilityNode, AccessibilityTree, Live};

/// Window node id published to the platform adapter.
pub const WINDOW_ID: AkId = AkId(0);
/// Chrome tab list.
pub const TABLIST_ID: AkId = AkId(1);
/// Chrome URL bar.
pub const URLBAR_ID: AkId = AkId(2);
/// Page document root wrapper under the window.
pub const WEB_ID: AkId = AkId(3);

const PAGE_ID_OFFSET: u64 = 1_000_000;

/// Packs a DOM [`ve_core::NodeId`] into an AccessKit id that cannot collide
/// with chrome ids 0–3.
#[must_use]
pub fn page_node_id(id: ve_core::NodeId) -> AkId {
    AkId(id.to_u64().saturating_add(PAGE_ID_OFFSET))
}

/// Converts the engine accessibility tree into an AccessKit `TreeUpdate`.
#[must_use]
pub fn page_tree_update(tree: &AccessibilityTree, focus: Option<ve_core::NodeId>) -> TreeUpdate {
    let mut nodes = Vec::new();
    collect(&tree.root, &mut nodes);
    TreeUpdate {
        nodes,
        tree: Some(Tree::new(page_node_id(tree.root.id))),
        focus: focus.map_or_else(|| page_node_id(tree.root.id), page_node_id),
    }
}

/// Chrome window wrapping a page tree. `tabs` are chrome tab names.
#[must_use]
pub fn shell_tree_update(
    chrome_title: &str,
    tabs: &[(String, bool)],
    urlbar: &str,
    page: Option<&AccessibilityTree>,
    focus: Option<ve_core::NodeId>,
) -> TreeUpdate {
    let mut window = Node::new(AkRole::Window);
    window.set_label(chrome_title);
    let mut children = vec![TABLIST_ID, URLBAR_ID];
    if page.is_some() {
        children.push(WEB_ID);
    }
    window.set_children(children);

    let mut tablist = Node::new(AkRole::TabList);
    tablist.set_label("Tabs");
    let tab_ids: Vec<AkId> = (0..tabs.len()).map(|i| AkId(10 + i as u64)).collect();
    tablist.set_children(tab_ids.clone());

    let mut url = Node::new(AkRole::TextInput);
    url.set_label("Address");
    url.set_value(urlbar);

    let mut nodes = vec![(WINDOW_ID, window), (TABLIST_ID, tablist), (URLBAR_ID, url)];
    for (i, (name, selected)) in tabs.iter().enumerate() {
        let mut tab = Node::new(AkRole::Tab);
        tab.set_label(name.as_str());
        tab.set_selected(*selected);
        nodes.push((AkId(10 + i as u64), tab));
    }

    let mut focus_id = WINDOW_ID;
    if let Some(page) = page {
        let mut web = Node::new(AkRole::WebView);
        web.set_children(vec![page_node_id(page.root.id)]);
        nodes.push((WEB_ID, web));
        collect(&page.root, &mut nodes);
        focus_id = focus.map_or(WEB_ID, page_node_id);
    }

    let mut tree = Tree::new(WINDOW_ID);
    tree.app_name = Some("Vector".into());
    TreeUpdate {
        nodes,
        tree: Some(tree),
        focus: focus_id,
    }
}

fn collect(node: &AccessibilityNode, out: &mut Vec<(AkId, Node)>) {
    let id = page_node_id(node.id);
    let mut ak = Node::new(map_role(node.role));
    if !node.name.is_empty() {
        ak.set_label(node.name.as_str());
    }
    if let Some(value) = &node.value {
        ak.set_value(value.as_str());
    }
    if node.states.disabled {
        ak.set_disabled();
    }
    if let Some(sel) = node.states.selected {
        ak.set_selected(sel);
    }
    if let Some(exp) = node.states.expanded {
        ak.set_expanded(exp);
    }
    match node.live {
        Live::Polite => ak.set_live(AkLive::Polite),
        Live::Assertive => ak.set_live(AkLive::Assertive),
        Live::Off => {}
    }
    if let Some(href) = &node.href {
        ak.set_url(href.as_str());
    }
    let kids: Vec<AkId> = node.children.iter().map(|c| page_node_id(c.id)).collect();
    if !kids.is_empty() {
        ak.set_children(kids);
    }
    out.push((id, ak));
    for child in &node.children {
        collect(child, out);
    }
}

fn map_role(role: Role) -> AkRole {
    match role {
        Role::Alert => AkRole::Alert,
        Role::Article => AkRole::Article,
        Role::Banner => AkRole::Banner,
        Role::Button => AkRole::Button,
        Role::Cell => AkRole::Cell,
        Role::Checkbox => AkRole::CheckBox,
        Role::ColumnHeader => AkRole::ColumnHeader,
        Role::Combobox => AkRole::ComboBox,
        Role::Complementary => AkRole::Complementary,
        Role::ContentInfo => AkRole::ContentInfo,
        Role::Dialog => AkRole::Dialog,
        Role::Document => AkRole::Document,
        Role::Figure => AkRole::Figure,
        Role::Form => AkRole::Form,
        Role::Generic => AkRole::GenericContainer,
        Role::Group => AkRole::Group,
        Role::Heading => AkRole::Heading,
        Role::Image => AkRole::Image,
        Role::Link => AkRole::Link,
        Role::List => AkRole::List,
        Role::ListBox => AkRole::ListBox,
        Role::ListItem => AkRole::ListItem,
        Role::Main => AkRole::Main,
        Role::Menu => AkRole::Menu,
        Role::MenuItem => AkRole::MenuItem,
        Role::Navigation => AkRole::Navigation,
        Role::Option => AkRole::ListBoxOption,
        Role::Paragraph => AkRole::Paragraph,
        Role::Presentation => AkRole::GenericContainer,
        Role::ProgressBar => AkRole::ProgressIndicator,
        Role::Radio => AkRole::RadioButton,
        Role::RadioGroup => AkRole::RadioGroup,
        Role::Region => AkRole::Region,
        Role::Row => AkRole::Row,
        Role::RowHeader => AkRole::RowHeader,
        Role::SearchBox => AkRole::SearchInput,
        Role::Separator => AkRole::Splitter,
        Role::Slider => AkRole::Slider,
        Role::SpinButton => AkRole::SpinButton,
        Role::StaticText => AkRole::Label,
        Role::Status => AkRole::Status,
        Role::Switch => AkRole::Switch,
        Role::Tab => AkRole::Tab,
        Role::Table => AkRole::Table,
        Role::TabList => AkRole::TabList,
        Role::TabPanel => AkRole::TabPanel,
        Role::TextBox => AkRole::TextInput,
        Role::Toolbar => AkRole::Toolbar,
        Role::Tooltip => AkRole::Tooltip,
        Role::Tree => AkRole::Tree,
        Role::TreeItem => AkRole::TreeItem,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tree::{AccessibilityTree, BuildOptions};

    #[test]
    fn shell_tree_includes_chrome_and_page() {
        let doc =
            ve_html::parse_document("<h1>Hello</h1><div aria-live=polite>ping</div>").document;
        let page = AccessibilityTree::build(&doc, &BuildOptions::default());
        let update = shell_tree_update(
            "Vector",
            &[("Hello".into(), true)],
            "https://app.test/",
            Some(&page),
            None,
        );
        assert!(update.tree.is_some());
        assert!(
            update
                .nodes
                .iter()
                .any(|(id, n)| *id == WINDOW_ID && n.role() == AkRole::Window)
        );
        assert!(
            update
                .nodes
                .iter()
                .any(|(_, n)| n.label() == Some("Hello") || n.label() == Some("ping"))
        );
        assert!(
            update
                .nodes
                .iter()
                .any(|(_, n)| n.live() == Some(AkLive::Polite))
        );
    }
}

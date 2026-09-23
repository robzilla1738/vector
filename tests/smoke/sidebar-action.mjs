// Primary sidebar actions live in the compact More menu (`.sb-more`) as
// menuitems. "Chats" and "Tasks" are also collapsible sidebar *sections*
// whose headings are plain buttons, so a bare getByRole('button', {name})
// either toggles the wrong control or matches nothing at all — scope to
// the menu item inside the More menu.
export async function sidebarAction(page, name) {
  const menu = page.locator(".sb-more");
  const item = menu.getByRole("menuitem", { name, exact: true });
  if (!(await item.isVisible())) await menu.locator("summary").click();
  await item.click();
}

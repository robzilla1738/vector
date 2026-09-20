// Primary sidebar actions are now grouped in the compact More menu.
export async function sidebarAction(page, name) {
  const button = page.getByRole('button', {name, exact: true});
  if (!await button.isVisible()) await page.locator('.sb-more summary').click();
  await button.click();
}

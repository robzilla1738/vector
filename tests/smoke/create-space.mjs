// Create a real browser space (which provisions its workspace) through the
// sidebar space-switcher, matching the end-to-end product path.
export async function createSpace(page, name) {
  await page.locator(".space-switch").click();
  await page.getByRole("menuitem", { name: "New space", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "New space", exact: true });
  await sheet.getByPlaceholder("Name").fill(name);
  await sheet.getByRole("button", { name: "Create", exact: true }).click();
  await page.locator(".space-switch").getByText(name, { exact: true }).waitFor();
}

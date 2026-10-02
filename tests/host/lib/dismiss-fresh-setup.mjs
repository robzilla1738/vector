export async function dismissFreshSetup(t) {
  const finishLater = { role: 'AXButton', name: 'Finish later', match: 'exact', scope: 'shell', index: 0 };
  await t.ax.waitFor(finishLater, 'present', 15_000);
  return t.step('dismiss optional fresh-profile setup', { kind: 'ui', features: [] }, async () => {
    // Use an actual selector-bound HID click; AXPress acknowledgement alone
    // has not reliably dispatched this top-layer control in native fixtures.
    await t.ax.click(finishLater);
    await t.ax.waitFor(finishLater, 'absent');
    // Setup state is human-only. Read its actual saved receipt through Settings,
    // without expanding the external journey connection's authority.
    await t.ax.key('command+,', 'hid');
    const general = { role: 'AXButton', name: 'General', match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(general, 'visible');
    await t.ax.press(general);
    const saved = { role: 'AXStaticText', name: 'Setup saved for later', match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(saved, 'present');
    const receipt = await t.ax.query(saved);
    t.assert.equal(receipt.length, 1, 'Finish later must save its actual setup receipt');
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(general, 'absent');
    return { ax: await t.ax.dump(), rpc: await t.rpc('workspace.get'), setupReceipt: receipt };
  });
}

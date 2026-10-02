/** Scroll the real Settings panel until the entire enabled control is visible. */
export async function revealSettingsControl(t, target, panelName) {
  const panel = { role: 'AXGroup', name: panelName, match: 'exact', scope: 'shell', index: 0 };
  return t.until(`Visible ${target.name}`, async () => {
    const [container] = await t.ax.query(panel);
    const [control] = await t.ax.query(target);
    const outer = container?.frame, frame = control?.frame;
    t.assert.ok(outer?.width > 0 && outer.height > 0, `${panelName} has a visible native frame`);
    if (control?.enabled && frame?.width > 0 && frame.height > 0 &&
        frame.y >= outer.y && frame.y + frame.height <= outer.y + outer.height) return control;
    await t.ax.scroll(panel, -440);
    return null;
  }, 5000);
}

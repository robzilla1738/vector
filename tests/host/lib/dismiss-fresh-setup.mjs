export async function dismissFreshSetup(t) {
  const finishLater = { role: 'AXButton', name: 'Finish later', match: 'exact', scope: 'shell', index: 0 };
  await t.ax.waitFor(finishLater, 'present', 15_000);
  return t.step('dismiss optional fresh-profile setup', { kind: 'ui', features: [] }, async () => {
    // Use an actual selector-bound HID click; AXPress acknowledgement alone
    // has not reliably dispatched this top-layer control in native fixtures.
    await t.ax.click(finishLater);
    await t.ax.waitFor(finishLater, 'absent');
    const onboarding = await t.rpc('onboarding.get');
    t.assert.equal(onboarding.status, 'later', 'Finish later must save its actual setup receipt');
    return { ax: await t.ax.dump(), rpc: await t.rpc('workspace.get'), onboarding };
  });
}

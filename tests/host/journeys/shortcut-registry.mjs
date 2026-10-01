import { writeFileSync } from "node:fs";
import { join } from "node:path";
const features = ["commandRegistry"];
const base = {
  features,
  needs: ["accessibility", "screen-recording"],
  model: "none",
  launch: {},
  timeoutMs: 180_000,
  owner: "L1",
  devAcceptance: ["commandRegistry", "reader", "spaces", "quickAsk"],
};
const selector = (name, role) => ({ name, match: "exact", scope: "shell", ...(role ? { role } : {}) });
async function openShortcuts(t) {
  await t.ax.key("command+,", "hid");
  await t.ax.waitFor(selector("Search settings", "AXTextField"));
  await t.ax.type("Keyboard shortcuts", selector("Search settings", "AXTextField"));
  await t.ax.press({ name: "Keyboard shortcuts", match: "contains", scope: "shell", index: 0 });
  await t.ax.waitFor(selector("Manage shortcuts", "AXButton"));
  await t.ax.press(selector("Manage shortcuts", "AXButton"));
  await t.ax.waitFor(selector("Find keyboard shortcut", "AXTextField"));
}
export function registerShortcutFixtures(fixture) {
  fixture.route("/shortcut-article", `<!doctype html><title>Shortcut article</title><article><h1>Shortcut article</h1>${Array.from({ length: 30 }, (_, i) => `<p>Paragraph ${i}. Aux keeps keyboard commands predictable and lets each person choose familiar shortcuts. Browser controls and the article remain accessible after a restart.</p>`).join("")}</article>`);
  fixture.route("/shortcut-counter", `<!doctype html><title>Shortcut target</title><h1>Shortcut target</h1><output id="received">Website shortcuts: 0</output><output id="released">Website releases: 0</output><output id="modifiers">Website modifiers: none</output><input aria-label="Website editor"><script>let count=0;document.addEventListener('keydown',event=>{if(event.metaKey&&event.key==='s'){event.preventDefault();document.getElementById('modifiers').textContent='Website modifiers: meta='+event.metaKey+' alt='+event.altKey+' ctrl='+event.ctrlKey+' shift='+event.shiftKey;document.getElementById('received').textContent='Website shortcuts: '+(++count);}});let releases=0;document.addEventListener('keyup',event=>{if(event.metaKey&&event.key==='s')document.getElementById('released').textContent='Website releases: '+(++releases);});</script>`);
}
async function core(t) {
  registerShortcutFixtures(t.fixture);
  const page = await t.rpc("pages.open", { url: `${t.fixture.url}/shortcut-article`, activate: true });
  await t.until("Shortcut article loaded", async () =>
    (await t.rpc("pages.list")).some((row) => row.pageId === page.pageId && !row.loading),
  );
  await t.step(
    "double press reaches the same website without browser recursion",
    { kind: "ui", features },
    async () => {
      await t.rpc("pages.navigate", { pageId: page.pageId, url: `${t.fixture.url}/shortcut-counter` });
      await t.ax.waitFor({ name: "Website shortcuts: 0", scope: "page" });
      await t.ax.focus({ role: "AXTextField", name: "Website editor", scope: "page" });
      await t.ax.key("command+s", "hid");
      await t.ax.waitFor({ name: "Press again to use this shortcut on the website", scope: "shell" });
      await t.ax.key("command+s", "hid");
      await t.ax.waitFor({ name: "Website shortcuts: 1", scope: "page" });
      await t.ax.waitFor({ name: "Website releases: 1", scope: "page" });
      t.assert.equal((await t.ax.query({ name: "Website releases: 2", scope: "page" })).length, 0);
      const observation = await t.rpc("pages.observe", { pageId: page.pageId });
      t.assert.match(JSON.stringify(observation), /Website shortcuts: 1/);
      await t.capture("shortcut-website-pass-through");
      return { ax: await t.ax.dump(), rpc: observation };
    },
  );
  await t.step(
    "navigation and shell-field focus refuse website forwarding",
    { kind: "ui", features },
    async () => {
      await t.ax.focus({ role: "AXTextField", name: "Website editor", scope: "page" });
      await t.ax.key("command+s", "hid");
      await t.rpc("pages.navigate", {
        pageId: page.pageId,
        url: `${t.fixture.url}/shortcut-counter?new-document=1`,
      });
      await t.ax.waitFor({ name: "Website shortcuts: 0", scope: "page" });
      await t.ax.focus({ role: "AXTextField", name: "Website editor", scope: "page" });
      await t.ax.key("command+s", "hid");
      t.assert.equal((await t.ax.query({ name: "Website shortcuts: 1", scope: "page" })).length, 0);
      await t.ax.key("command+l", "hid");
      await t.ax.key("command+s", "hid");
      t.assert.equal((await t.ax.query({ name: "Website shortcuts: 1", scope: "page" })).length, 0);
      const observation = await t.rpc("pages.observe", { pageId: page.pageId });
      t.assert.match(JSON.stringify(observation), /Website shortcuts: 0/);
      await t.capture("shortcut-forwarding-refused");
      await t.ax.key("escape", "hid");
      await t.rpc("pages.navigate", { pageId: page.pageId, url: `${t.fixture.url}/shortcut-article` });
      return { ax: await t.ax.dump(), rpc: observation };
    },
  );
  await t.step(
    "distinct accelerators and switched websites refuse forwarding and preserve modifiers",
    { kind: "ui", features },
    async () => {
      const settings = await t.rpc("settings.get");
      const overrides = settings.shortcutOverrides ?? {};
      await t.rpc("settings.set", { shortcutOverrides: { ...overrides, sidebar: [
        { key: "s", command: true }, { key: "s", command: true, alt: true },
      ] } });
      await t.rpc("pages.navigate", { pageId: page.pageId, url: `${t.fixture.url}/shortcut-counter?accelerator=1` });
      await t.ax.waitFor({ name: "Website shortcuts: 0", scope: "page" });
      await t.ax.focus({ role: "AXTextField", name: "Website editor", scope: "page" });
      await t.ax.key("command+s", "hid");
      await t.ax.key("command+alt+s", "hid");
      t.assert.equal((await t.ax.query({ name: "Website shortcuts: 1", scope: "page" })).length, 0);
      await t.ax.key("command+alt+s", "hid");
      await t.ax.waitFor({ name: "Website shortcuts: 1", scope: "page" });
      await t.ax.waitFor({ name: "Website modifiers: meta=true alt=true ctrl=false shift=false", scope: "page" });
      await t.ax.key("command+s", "hid");
      const other = await t.rpc("pages.open", { url: `${t.fixture.url}/shortcut-counter?other-target=1`, activate: true });
      await t.ax.waitFor({ name: "Website shortcuts: 0", scope: "page" });
      await t.ax.focus({ role: "AXTextField", name: "Website editor", scope: "page" });
      await t.ax.key("command+s", "hid");
      t.assert.equal((await t.ax.query({ name: "Website shortcuts: 1", scope: "page" })).length, 0);
      const observation = await t.rpc("pages.observe", { pageId: other.pageId });
      t.assert.match(JSON.stringify(observation), /Website shortcuts: 0/);
      await t.capture("shortcut-accelerator-and-target-refusal");
      await t.rpc("pages.close", { pageId: other.pageId });
      await t.rpc("settings.set", { shortcutOverrides: overrides });
      await t.rpc("pages.navigate", { pageId: page.pageId, url: `${t.fixture.url}/shortcut-article` });
      return { ax: await t.ax.dump(), rpc: observation };
    },
  );
  await t.step(
    "HID commands focus browser surfaces and create windows",
    { kind: "ui", features },
    async () => {
      await t.ax.key("command+l", "hid");
      const address = await t.ax.waitFor({
        role: "AXComboBox",
        name: "Address",
        match: "contains",
        scope: "shell",
        index: 0,
      });
      t.assert.ok(address.matched);
      await t.ax.key("escape", "hid");
      await t.ax.key("command+k", "hid");
      await t.ax.waitFor({
        role: "AXComboBox",
        name: "Command palette",
        match: "exact",
        scope: "shell",
        index: 0,
      });
      await t.ax.key("escape", "hid");
      await t.ax.key("command+shift+c", "hid");
      await t.ax.waitFor(selector("Link copied"));
      const count = (await t.ax.windows()).filter((row) => row.layer === 0).length;
      await t.ax.key("command+n", "hid");
      await t.until(
        "normal window opened",
        async () => (await t.ax.windows()).filter((row) => row.layer === 0).length > count,
      );
      await t.ax.key("command+shift+w", "hid");
      await t.ax.key("command+shift+n", "hid");
      await t.until(
        "private window opened",
        async () => (await t.ax.windows()).filter((row) => row.layer === 0).length > count,
      );
      t.assert.match(JSON.stringify(await t.ax.dump()), /Private/i);
      await t.ax.key("command+shift+w", "hid");
      await t.ax.key("command+shift+space", "hid");
      await t.ax.waitFor({ name: "Quick Ask", match: "contains", scope: "shell", index: 0 });
      await t.ax.key("escape", "hid");
      await t.capture("shortcut-core-defaults");
      return {
        ax: await t.ax.dump(),
        rpc: { pages: await t.rpc("pages.list"), runtime: await t.rpc("runtime.describe") },
      };
    },
  );
  await t.step(
    "record and persist Reader rebind, with old chord reserved",
    { kind: "ui", features },
    async () => {
      await openShortcuts(t);
      const importPath = join(t.app.profileRoot, "reserved-shortcuts.json");
      writeFileSync(
        importPath,
        JSON.stringify({ schema: 1, overrides: { sidebar: [{ key: "m", command: true }] } }),
        { mode: 0o600 },
      );
      await t.ax.press(selector("Import shortcuts", "AXButton"));
      await t.ax.openPanel(importPath);
      await t.ax.waitFor({ name: "macOS uses ⌘M for Minimize.", scope: "shell" });
      t.assert.equal((await t.rpc("settings.get")).shortcutOverrides?.sidebar, undefined);
      await t.ax.type("Reader View", selector("Find keyboard shortcut", "AXTextField"));
      await t.ax.press(selector("Change Reader View shortcut", "AXButton"));
      await t.ax.key("command+alt+b", "hid");
      await t.until("Reader override saved", async () => {
        const settings = await t.rpc("settings.get");
        return settings.shortcutOverrides?.reader?.some(
          (binding) => binding.key === "b" && binding.command && binding.alt,
        );
      });
      await t.capture("shortcut-rebind");
      await t.restart();
      await t.ax.key("command+alt+r", "hid");
      t.assert.equal(
        (await t.ax.query(selector("Back to page", "AXButton"))).length,
        0,
        "Old Reader chord must be dead",
      );
      await t.ax.key("command+alt+b", "hid");
      await t.ax.waitFor(selector("Back to page", "AXButton"));
      const settings = await t.rpc("settings.get");
      t.assert.ok(
        settings.shortcutOverrides.reader.some(
          (binding) => binding.key === "b" && binding.alt && binding.command,
        ),
      );
      await t.capture("shortcut-restart");
      return { ax: await t.ax.dump(), rpc: { settings, pages: await t.rpc("pages.list") } };
    },
  );
}
async function full(t) {
  await core(t);
  await t.ax.press(selector("Back to page", "AXButton"));
  await t.step("all feature defaults produce their registered effect", { kind: "ui", features }, async () => {
    await t.ax.key("command+shift+b", "hid");
    t.assert.equal((await t.ax.query({ role: "AXTabGroup", name: "Tabs", scope: "shell" })).length, 0);
    t.assert.equal((await t.rpc("settings.get")).minimalUi, true);
    await new Promise((resolve) => setTimeout(resolve, 850));
    await t.ax.key("command+shift+b", "hid");
    t.assert.equal((await t.rpc("settings.get")).minimalUi, false);
    await t.ax.key("command+shift+d", "hid");
    t.assert.match(JSON.stringify(await t.ax.dump()), /Unpin/);
    await t.ax.key("command+alt+n", "hid");
    await t.ax.waitFor({ name: "Open in Aux", match: "contains", scope: "shell" });
    await t.ax.key("command+alt+o", "hid");
    await t.ax.waitFor({ name: "Open in Aux", match: "contains", scope: "shell" }, "absent");
    await t.ax.key("control+command+p", "hid");
    await t.ax.waitFor(selector("No playing video on this page"));
    await t.ax.key("control+shift+=", "hid");
    await t.ax.waitFor({ name: "Split with", match: "contains", scope: "shell" });
    await t.capture("shortcut-feature-defaults");
    return {
      ax: await t.ax.dump(),
      rpc: { settings: await t.rpc("settings.get"), pages: await t.rpc("pages.list") },
    };
  });
  await t.step(
    "Minimal UI rebind survives restart and old chord is dead",
    { kind: "ui", features },
    async () => {
      await t.ax.key("escape", "hid");
      await openShortcuts(t);
      await t.ax.type("Minimal UI", selector("Find keyboard shortcut", "AXTextField"));
      await t.ax.press(selector("Change Minimal UI shortcut", "AXButton"));
      await t.ax.key("command+alt+b", "hid");
      // Reader currently holds the chord; resolve the explicit conflict through UI.
      await t.ax.press({ role: "AXButton", name: "Assign anyway", match: "contains", scope: "shell" });
      await t.until("Minimal binding saved", async () =>
        (await t.rpc("settings.get")).shortcutOverrides?.["minimal-ui"]?.some(
          (binding) => binding.key === "b" && binding.alt,
        ),
      );
      await t.restart();
      await t.ax.key("command+shift+b", "hid");
      t.assert.equal((await t.rpc("settings.get")).minimalUi, false);
      await t.ax.key("command+alt+b", "hid");
      await t.until("new Minimal chord active", async () => (await t.rpc("settings.get")).minimalUi === true);
      await t.capture("shortcut-minimal-persisted");
      return { ax: await t.ax.dump(), rpc: { settings: await t.rpc("settings.get") } };
    },
  );
}
export const journeys = [
  {
    journey: {
      ...base,
      id: "shortcut-registry-core",
      title: "Native command dispatch and persisted remapping",
    },
    run: core,
  },
  {
    journey: {
      ...base,
      devAcceptance: [
        ...base.devAcceptance,
        "minimalUi",
        "pinnedApps",
        "littleWindow",
        "pictureInPicture",
        "splitView",
      ],
      id: "shortcut-registry",
      title: "Every registered default and durable shortcut customization",
    },
    run: full,
  },
];

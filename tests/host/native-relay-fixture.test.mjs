import assert from "node:assert/strict";
import { test } from "node:test";
import { createRelayFixture, relayKinds } from "./native-relay-fixture.mjs";

test("capture oracle counts real sends while retaining no raw marker or password", async () => {
  const fixture = await createRelayFixture();
  try {
    const response = await fetch(`${fixture.origins.recipient}/capture?case=server-control`, { method: "POST", body: fixture.marker });
    assert.equal(response.status, 200); fixture.assertCount("server-control", 1, "recipient");
    fixture.assertCount("not-sent", 0);
    const snapshot = JSON.stringify(fixture.snapshot());
    assert.ok(!snapshot.includes(fixture.marker)); assert.ok(!snapshot.includes(fixture.credential.password));
    assert.match(fixture.snapshot()[0].digest, /^[a-f0-9]{64}$/);
    await fetch(`${fixture.origins.recipient}/capture?case=invalid%20name`);
    assert.equal(fixture.snapshot().length, 1);
    const oversized = await fetch(`${fixture.origins.recipient}/capture?case=oversized`, { method: "POST", body: "x".repeat(4097) });
    assert.equal(oversized.status, 413); fixture.assertCount("oversized", 0);
  } finally { await fixture.close(); }
});

test("actor and related receiver expose real relay endpoints and syntactically valid browser programs", async () => {
  const fixture = await createRelayFixture();
  try {
    for (const path of ["actor", "receiver", "race"]) {
      const response = await fetch(fixture.url(path)); assert.equal(response.status, 200);
      const html = await response.text(), script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
      assert.ok(script); assert.doesNotThrow(() => new Function(script));
      for (const kind of relayKinds) assert.ok(html.includes(`id="${kind}"`));
      assert.ok(script.includes("window.open('/receiver',channel)"));
    }
    const login = await fetch(fixture.url("login-submit"), { method: "POST", redirect: "manual", body: new URLSearchParams(fixture.credential) });
    assert.equal(login.status, 303); assert.equal(fixture.seeded(), true);
    assert.equal(fixture.snapshot().length, 0, "Login state never records raw form values in evidence");
  } finally { await fixture.close(); }
});

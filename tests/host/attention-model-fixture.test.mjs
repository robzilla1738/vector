import assert from "node:assert/strict";
import { test } from "node:test";
import { attentionModelFixture, MODEL_ID, RUN_A, RUN_B, RUN_C, RUN_D, PRIVATE_QUESTION } from "./attention-model-fixture.mjs";

const post = (endpoint, marker, stream = false) => fetch(`${endpoint}/chat/completions`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ model: MODEL_ID, stream, messages: [{ role: "user", content: marker }] }),
});

test("fixture holds each run until its native event phase and never calls a provider", async () => {
  const fixture = await attentionModelFixture();
  try {
    const page = await fetch(`${fixture.endpoint.replace(/\/v1$/, "")}/fixture?page=a`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Local attention fixture/);
    const a = post(fixture.endpoint, RUN_A);
    const b = post(fixture.endpoint, RUN_B, true);
    for (let i = 0; i < 50 && (!fixture.seen(RUN_A) || !fixture.seen(RUN_B)); i++) await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(fixture.seen(RUN_A), true);
    assert.equal(fixture.seen(RUN_B), true);
    fixture.release(RUN_B);
    const question = await (await b).text();
    assert.match(question, /needs_input/);
    assert.ok(question.includes(PRIVATE_QUESTION));
    fixture.release(RUN_A);
    assert.match(JSON.stringify(await (await a).json()), /Disposable page for two concurrent Aux tasks/);
    const answer = post(fixture.endpoint, RUN_B);
    for (let i = 0; i < 50 && !fixture.seen(`${RUN_B}:2`); i++) await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(fixture.seen(`${RUN_B}:2`), true);
    fixture.release(`${RUN_B}:2`);
    assert.match(JSON.stringify(await (await answer).json()), /Disposable page for two concurrent Aux tasks/);
    for (const marker of [RUN_C, RUN_D]) {
      const pending = post(fixture.endpoint, marker);
      for (let i = 0; i < 50 && !fixture.seen(marker); i++) await new Promise(resolve => setTimeout(resolve, 10));
      assert.equal(fixture.seen(marker), true);
      fixture.release(marker);
      assert.match(JSON.stringify(await (await pending).json()), /Disposable page for two concurrent Aux tasks/);
    }
  } finally { await fixture.close(); }
});

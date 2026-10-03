import assert from 'node:assert/strict';
import { createNarrowWindowGenerations, createNarrowWindowPreparation } from './narrow-window.mjs';
import { assertUtilityAppearanceOwner, decodeUtilityAppearanceOwner } from './utility-appearance-owner.mjs';

/** Explicit returned-runtime BWI joined to fresh native metadata; never a window title/size. */
export async function createDistinctNarrowWindowPreparation(t, runtimeWindow, provenance, assertCurrent = () => {}) {
  assert.equal(t.appearanceEnabled, true);
  assert.deepEqual(Object.keys(runtimeWindow).sort(), ['windowId', 'windowKind']);
  assert.ok(['normal', 'little'].includes(runtimeWindow.windowKind));
  const app = t.app, ax = t.ax, pid = app.pid, receipts = [];
  const current = () => { assertCurrent(); assert.ok(t.app === app && t.ax === ax && app.pid === pid && ax.pid === pid && pid > 0, 'Original distinct-window generation retired'); };
  async function runtime(owner) {
    current(); const pages = await (t.readRuntimePages ? t.readRuntimePages() : t.rpc('pages.list')); current();
    const inWindow = pages.filter(page => page.windowId === runtimeWindow.windowId && page.windowKind === runtimeWindow.windowKind);
    assert.ok(inWindow.length > 0 && (runtimeWindow.windowKind !== 'little' || inWindow.length === 1), 'Returned runtime browser window absent or ambiguous');
    if (owner) {
      assert.equal(owner.browserWindowId, runtimeWindow.windowId); assert.equal(owner.windowKind, runtimeWindow.windowKind);
      assert.equal(owner.pages.length, 1, 'Distinct preparation requires actual selected guest');
      assert.equal(inWindow.filter(page => page.pageId === owner.pages[0].pageId && page.loading === false && page.ownedByRuntime === false).length, 1, 'Actual selected native guest is absent from original runtime window');
    }
  }
  await runtime();
  const discovered = await provenance.discoverUtilityOwner({ browserWindowId: runtimeWindow.windowId, windowKind: runtimeWindow.windowKind }); current();
  const owner = decodeUtilityAppearanceOwner(discovered.owner); await runtime(owner); receipts.push(discovered);
  async function validate() {
    await runtime(owner);
    const receipt = await provenance.observeUtilityOwner(owner.windowId, owner); current();
    assertUtilityAppearanceOwner(receipt.owner, owner); await runtime(owner);
    assert.ok(receipts.length < 64, 'Distinct preparation observation bound exhausted'); receipts.push(receipt);
  }
  // Only this private adapter selects a native-authorized exact target from the
  // REAL helper inventory. The original sole-window utility remains unchanged.
  const scopedAx = Object.freeze({ pid, helperPid: ax.helperPid,
    async windows() {
      current(); const all = await ax.windows(); current();
      const target = all.filter(window => window.id === owner.windowId && window.layer === 0);
      assert.equal(target.length, 1, 'Original distinct native window absent or duplicated'); return target;
    },
    async request(operation) {
      assert.equal(operation, 'warmWindowIdentity'); current();
      const result = await ax.request(operation); current(); await validate(); return result;
    },
    async drag(...args) { await validate(); current(); if (!restoring) t.signal?.throwIfAborted(); const result = await ax.drag(...args); current(); await validate(); return result; },
  });
  const session = createNarrowWindowPreparation({ app, ax: scopedAx, appearanceEnabled: true, signal: t.signal });
  let narrowActive = false, restoring = false;
  return Object.freeze({ owner,
    async prepare() { current(); t.signal?.throwIfAborted(); const result = await session.prepare(); current(); t.signal?.throwIfAborted(); narrowActive = true; return result; },
    async restore() { restoring = true; try { const result = await session.restore(); narrowActive = false; return result; } finally { restoring = false; } },
    async capture(name, state, { narrow = false } = {}) {
      t.signal?.throwIfAborted(); await validate(); t.signal?.throwIfAborted();
      if (narrow) {
        assert.ok(narrowActive, 'Original narrow preparation already restored');
        const [window] = await scopedAx.windows();
        assert.ok(window.width >= 720 && window.width <= 900, 'Native width left the explicit narrow test band');
      }
      const result = await t.capture(name, { windowId: owner.windowId, state, expectedUtilityOwnership: owner }); current();
      if (narrow) assert.ok(result.windowFrame?.width >= 720 && result.windowFrame.width <= 900, 'Original captured native frame is outside the narrow test band');
      return result;
    },
    get record() { return { ...session.record, ownership: owner, ownershipObservations: receipts.slice() }; },
  });
}


/** Sole-window defaults stay unchanged. A cold normal+Little pair has separate
 * admitted native owners and deferred resize, after original functional proofs. */
export function createOwnedNarrowGenerations(readContext, manifest) {
  let soleContext;
  const sole = createNarrowWindowGenerations(() => soleContext, manifest);
  function bound() {
    const t = readContext(), app = t.app, ax = t.ax, provenance = t.provenance, pid = app.pid;
    const check = () => {
      const now = readContext();
      assert.ok(now.app === app && now.ax === ax && now.provenance === provenance &&
        app.pid === pid && ax.pid === pid && pid > 0, 'Original narrow context retired');
    };
    check(); return { t, check };
  }
  function guardSole(t, check) {
    const ax = t.ax;
    return { ...t, ax: { pid: ax.pid, helperPid: ax.helperPid,
      async windows() { check(); const result = await ax.windows(); check(); return result; },
      async request(...args) { check(); const result = await ax.request(...args); check(); return result; },
      async drag(...args) { check(); const result = await ax.drag(...args); check(); return result; },
    } };
  }
  const entries = manifest.distinctNarrowGenerations = [];
  let current, utility, utilityPending = false, capturing = false;
  async function restore() {
    const errors = [];
    if (utility) {
      const original = utility;
      try { original.entry.restoration = await original.session.restore(); if (utility === original) utility = undefined; }
      catch (error) { original.entry.cleanupError = error.stack ?? String(error); errors.push(error); }
      finally { original.entry.preparation = original.session.record; }
    }
    if (current) {
      for (const { session, entry } of [...current].reverse()) {
        try { entry.restoration = await session.restore(); }
        catch (error) { entry.cleanupError = error.stack ?? String(error); errors.push(error); }
        finally { entry.preparation = session.record; }
      }
      if (!errors.length) current = undefined;
    }
    try { await sole.restore(); } catch (error) { errors.push(error); }
    if (errors.length) throw new AggregateError(errors, 'Original narrow generation retains cleanup debt');
  }
  const operations = {
    async prepare() {
      assert.equal(current, undefined, 'Original distinct narrow generation must retire first');
      capturing = false;
      const { t, check } = bound(); t.signal?.throwIfAborted();
      const windows = (await t.ax.windows()).filter(window => window.layer === 0);
      check(); t.signal?.throwIfAborted();
      if (windows.length === 1) { soleContext = guardSole(t, check); const result = await sole.prepare(); check(); t.signal?.throwIfAborted(); return result; }
      assert.equal(windows.length, 2, 'Distinct cold preparation requires exactly two actual owned windows');
      const pages = await t.readRuntimePages(); check(); t.signal?.throwIfAborted();
      const returned = [...new Map(pages.map(page => [page.windowId, { windowId: page.windowId, windowKind: page.windowKind }])).values()];
      assert.equal(returned.length, 2, 'Returned runtime window inventory is ambiguous');
      assert.deepEqual(returned.map(window => window.windowKind).sort(), ['little', 'normal']);
      assert.ok(entries.length <= 30, 'Distinct generation record bound exhausted');
      current = [];
      for (const window of returned) {
        const session = await createDistinctNarrowWindowPreparation(t, window, t.provenance, check);
        check(); t.signal?.throwIfAborted();
        const entry = { ordinal: entries.length + 1, deferredUntilFunctionalProof: true, ownership: session.owner };
        entries.push(entry); current.push({ session, entry });
      }
      assert.deepEqual(current.map(value => value.session.owner.windowId).sort((a, b) => a - b), windows.map(window => window.id).sort((a, b) => a - b), 'Native/runtime/helper window inventory differs');
    },
    async captureUtility(runtimeWindow, prefix, state) {
      assert.ok(!utilityPending && !utility, 'Original utility capture must retire first'); utilityPending = true;
      let primary;
      try {
        assert.ok(entries.length < 32, 'Distinct generation record bound exhausted');
        const { t, check } = bound(); t.signal?.throwIfAborted();
        const session = await createDistinctNarrowWindowPreparation(t, runtimeWindow, t.provenance, check);
        check(); t.signal?.throwIfAborted();
        const entry = { ordinal: entries.length + 1, ownership: session.owner };
        entries.push(entry); utility = { session, entry };
        entry.preparation = await session.prepare();
        await session.capture(prefix, state, { narrow: true });
      } catch (error) { primary = error; }
      finally { utilityPending = false; }
      if (utility) {
        const original = utility;
        try { original.entry.restoration = await original.session.restore(); utility = undefined; }
        catch (cleanup) {
          original.entry.cleanupError = cleanup.stack ?? String(cleanup);
          if (primary) throw new AggregateError([primary, cleanup], 'Utility capture and restoration failed', { cause: primary });
          throw cleanup;
        } finally { original.entry.preparation = original.session.record; }
      }
      if (primary) throw primary;
    },
    async captureDistinct(prefix, state) {
      assert.ok(current?.length === 2, 'No admitted normal/Little generation');
      assert.equal(capturing, false, 'Distinct generation capture is one-use'); capturing = true;
      let primary;
      try {
        for (const { session, entry } of current) {
          await session.capture(`${prefix}-${session.owner.windowKind}-wide`, `${state}-${session.owner.windowKind}-wide`);
          entry.preparation = await session.prepare();
          await session.capture(`${prefix}-${session.owner.windowKind}-narrow`, `${state}-${session.owner.windowKind}-narrow`, { narrow: true });
        }
      } catch (error) { primary = error; }
      try { await restore(); }
      catch (cleanup) {
        if (primary) throw new AggregateError([primary, cleanup], 'Distinct capture and restoration failed', { cause: primary });
        throw cleanup;
      }
      if (primary) throw primary;
    },
    restore,
  };
  // Reserve synchronously, before any inventory/producer await. Internal cleanup
  // shares its operation reservation; public overlap cannot replace its owner.
  let pending;
  return Object.freeze(Object.fromEntries(Object.entries(operations).map(([name, run]) => [name, async (...args) => {
    assert.equal(pending, undefined, 'Original narrow operation is still pending');
    const owner = {}; pending = owner;
    try { return await run(...args); }
    finally { assert.equal(pending, owner); pending = undefined; }
  }])));
}

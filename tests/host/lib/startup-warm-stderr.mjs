import assert from 'node:assert/strict';

/** Bounded relay for bytes already owned by the original startup helper channel.
 * No listener, process discovery, launch or measurement authority is created.
 * Attach only the mailbox bound to that channel's admitted original browser. */
export function createWarmStderrRelay(kind) {
  assert.ok(kind === 'aux' || kind === 'stock', 'Closed original startup kind required');
  let buffered = [], total = 0, attached, failure, retired = false;
  const fail = error => {
    failure ??= error instanceof Error ? error : new Error(String(error));
    buffered = [];
    try { attached?.mailbox.dispose(failure); } catch (cleanup) { failure.mailboxCleanup ??= cleanup; }
    return failure;
  };
  return Object.freeze({
    push(bytes) {
      try {
        if (failure) throw failure;
        assert.ok(!retired, 'Retired original warm stderr channel');
        assert.ok(Buffer.isBuffer(bytes), 'Original stderr bytes required');
        total += bytes.length;
        assert.ok(total <= 2 * 1024 * 1024 && !bytes.includes(0), 'Original warm stderr overflow or NUL');
        if (attached) attached.mailbox.write(bytes, attached.source);
        else buffered.push(Buffer.from(bytes));
      } catch (error) { throw fail(error); }
    },
    attach(launch, mailbox, generation) {
      try {
        if (failure) throw failure;
        assert.ok(!retired && !attached, 'Original warm transport can attach only once');
        assert.equal(launch?.record?.kind, kind);
        assert.ok(Number.isSafeInteger(launch.record.browserPid) && launch.record.browserPid > 0);
        assert.match(launch.receiptSha256 ?? '', /^[a-f0-9]{64}$/);
        assert.ok(Number.isSafeInteger(generation) && generation > 0);
        assert.ok(mailbox && typeof mailbox.write === 'function' && typeof mailbox.dispose === 'function');
        attached = { mailbox, source: Object.freeze({ pid: launch.record.browserPid, generation }) };
        for (const bytes of buffered) mailbox.write(bytes, attached.source);
        buffered = [];
      } catch (error) { mailbox?.dispose?.(error); throw fail(error); }
    },
    assertLive() { if (failure) throw failure; assert.ok(attached && !retired, 'Original warm transport unavailable'); },
    refuse(error) { return fail(error); },
    retire(reason = new Error('Original startup helper channel closed')) {
      if (retired) return;
      retired = true; buffered = []; attached?.mailbox.dispose(reason);
    },
  });
}

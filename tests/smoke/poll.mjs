// Poll asynchronous runtime readbacks on the test side. waitForFunction checks
// the predicate's immediate truthiness; a Promise is truthy even if it yields false.
export async function poll(page, predicate, argument, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  do {
    if (await page.evaluate(predicate, argument)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  } while (Date.now() < deadline);
  throw new Error(`Runtime condition did not become true within ${timeoutMs}ms: ${predicate}`);
}

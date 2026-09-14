import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://127.0.0.1:63011');
const ctx = b.contexts()[0];
const page = ctx.pages().find(p => p.url().includes('index.html')) ?? ctx.pages()[0];
const keys = process.argv[2]?.split(',') ?? [];
for (const k of keys) { await page.keyboard.press(k); await page.waitForTimeout(450); }
await page.screenshot({ path: `/tmp/${process.argv[3] ?? 'shot'}.png` });
await b.close();

import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://127.0.0.1:63011');
const page = b.contexts()[0].pages().find(p => p.url().includes('index.html')) ?? b.contexts()[0].pages()[0];
// escape overview → open settings via store
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await page.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', {key:'k', metaKey:true})); });
await page.waitForTimeout(300);
await page.keyboard.type('settings'); await page.waitForTimeout(300);
await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/set1.png' });
// switch to light theme via the seg button
await page.getByRole('button', { name: 'light' }).click(); await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/set-light.png' });
await b.close();

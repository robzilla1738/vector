import { StandaloneDriver } from "../support/standalone-driver.js";
import { afterAll, beforeAll, expect, it } from "vitest";
import { type PlaywrightDriverPage } from "@aux/chromium-driver";
import { findChromium } from "../../scripts/chromium.mjs";

let driver: StandaloneDriver;
let page: PlaywrightDriverPage;

beforeAll(async () => {
  const path = findChromium();
  if (path && !process.env.AUX_BROWSER_PATH) process.env.AUX_BROWSER_PATH = path;
  driver = new StandaloneDriver();
  await driver.connect();
  page = await driver.attach(await driver.createTarget("about:blank"), "model-mask") as PlaywrightDriverPage;
}, 60_000);
afterAll(async () => { await driver?.disconnect(); });

it("masks editable pixels in the page and child frame while leaving controls visible", async () => {
  await page.rawPage().setContent(`<style>body{margin:0;background:white}input{position:absolute;left:20px;top:20px;width:140px;height:40px;background:#fff}button{position:absolute;left:200px;top:20px;width:100px;height:40px;background:#007acc;color:white}iframe{position:absolute;left:20px;top:100px;width:200px;height:90px;border:0}</style>
    <input aria-label="API token" value="synthetic-token"><button>Continue</button>
    <iframe srcdoc="<style>body{margin:0;background:white}textarea{position:absolute;left:10px;top:10px;width:140px;height:40px;background:#fff}</style><textarea>synthetic-card</textarea>"></iframe>`);
  await page.rawPage().frameLocator("iframe").locator("textarea").waitFor();
  const shot = await page.screenshot();
  const pixels = await page.rawPage().evaluate(async ({ dataUrl, scale }) => {
    const img = new Image(); img.src = dataUrl; await img.decode();
    const canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(img, 0, 0);
    const color = (x: number, y: number) => Array.from(ctx.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data).slice(0, 3);
    return { main: color(60, 40), child: color(60, 135), button: color(250, 40) };
  }, { dataUrl: `data:image/png;base64,${shot.buffer.toString("base64")}`, scale: shot.scale });
  expect(pixels.main).toEqual([36, 36, 36]);
  expect(pixels.child).toEqual([36, 36, 36]);
  expect(pixels.button).not.toEqual([36, 36, 36]);
});

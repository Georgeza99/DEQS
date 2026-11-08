import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { browserErrors, connect, newPage, pause, startBrowser } from "./helpers/browser.mjs";
import { fixtureAmounts, startFixture } from "./helpers/privacy-fixture.mjs";

test("total-debt privacy and application regression", { timeout: 240000 }, async t => {
  const scratch = path.resolve(".qa");
  await mkdir(scratch, { recursive: true });
  const output = await mkdtemp(path.join(scratch, "phase21-tests-"));
  const fixture = await startFixture(output);
  t.after(() => fixture.child.kill());
  const browser = await startBrowser(output);
  const version = await fetch(`${browser.base}/json/version`).then(r => r.json());
  const control = await connect(version.webSocketDebuggerUrl);
  t.after(async () => { await control.send("Browser.close"); control.close(); });
  const page = await newPage(browser);
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });

  // Observe actual value DOM mutations from the first parsed markup through hydration.
  await page.send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.privacyFlashes = 0;
    new MutationObserver(() => {
      const value = document.querySelector('#total-debt-display');
      if (value && /[0-9]/.test(value.textContent) && !window.deliberatelyRevealed) window.privacyFlashes++;
    }).observe(document, {subtree:true, childList:true, characterData:true});
  ` });
  const hidden = () => page.evaluate(`document.querySelector('#total-debt-display').textContent.includes('المبلغ مخفي') && !/[0-9]/.test(document.querySelector('#total-debt-display').textContent)`);
  async function waitForPage(expression, description) {
    for (let attempt = 0; attempt < 50; attempt++) {
      if (await page.evaluate(expression)) return;
      await pause(100);
    }
    assert.fail(description);
  }
  const waitForCustomers = () => waitForPage("location.pathname === '/customers'", "Customers navigation did not complete");
  const waitForDashboard = () => waitForPage(
    "location.pathname === '/' && document.querySelector('.privacy-toggle') !== null",
    "Dashboard navigation did not complete",
  );
  async function reveal() {
    await page.evaluate("window.deliberatelyRevealed = true");
    await page.click(".privacy-toggle");
  }
  async function geometry() {
    return page.evaluate(`['.debt-card','.secondary-metrics','.activity-panel'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height]})`);
  }

  await t.test("SSR, initial hydration, accessible masking, and no initial flash", async () => {
    const html = await fetch(fixture.base).then(r => r.text());
    const article = html.match(/<article class="debt-card"[\s\S]*?<\/article>/)?.[0];
    assert.ok(article?.includes("••••••"));
    assert.ok(!/[0-9]/.test(article.replace(/(?:width|height|viewBox|stroke-width|d)="[^"]*"/g, "").match(/id="total-debt-display"[\s\S]*?<\/div>/)?.[0] || ""));
    assert.ok(!article.includes(fixtureAmounts.normal));
    await page.navigate(fixture.base);
    assert.equal(await hidden(), true);
    assert.equal(await page.evaluate("window.privacyFlashes"), 0);
    const ax = await page.send("Accessibility.getFullAXTree");
    assert.ok(!JSON.stringify(ax).includes("9,876,543.210"));
    assert.equal(await page.evaluate(`document.querySelector('.privacy-toggle').getAttribute('aria-label')`), "إظهار إجمالي الديون");
  });

  await t.test("mouse reveal/hide and changing accessible labels", async () => {
    await reveal();
    assert.equal(await page.evaluate(`document.querySelector('.debt-number').textContent`), "9,876,543.210");
    assert.equal(await page.evaluate(`document.querySelector('.privacy-toggle').getAttribute('aria-label')`), "إخفاء إجمالي الديون");
    assert.equal(await page.evaluate(`document.querySelector('.privacy-toggle').getAttribute('aria-pressed')`), "true");
    await page.click(".privacy-toggle");
    assert.equal(await hidden(), true);
    assert.equal(await page.evaluate(`document.querySelectorAll('.debt-number').length`), 0);
  });

  await t.test("refresh and new tab start hidden", async () => {
    await reveal();
    await page.send("Page.reload"); await pause(650);
    assert.equal(await hidden(), true);
    assert.equal(await page.evaluate("window.privacyFlashes"), 0);
    const fresh = await newPage(browser);
    await fresh.navigate(fixture.base);
    assert.equal(await fresh.evaluate(`document.querySelector('#total-debt-display').textContent.includes('المبلغ مخفي')`), true);
    await fresh.dispose();
  });

  await t.test("client navigation, browser back, and forward all reset privacy", async () => {
    await reveal();
    await page.click(".button-primary");
    await waitForCustomers();
    await page.evaluate("history.back()");
    await waitForDashboard();
    assert.equal(await hidden(), true);
    await reveal();
    await page.evaluate("history.forward()");
    await waitForCustomers();
    await page.click('.desktop-sidebar a[href="/"]');
    await waitForDashboard();
    assert.equal(await hidden(), true);
  });

  await t.test("hidden tab and page lifecycle reset before returning", async () => {
    await reveal();
    const other = await newPage(browser);
    await other.send("Page.bringToFront"); await pause(200);
    const actualHidden = await page.evaluate("document.visibilityState === 'hidden'");
    assert.equal(actualHidden, true, "Browser must actually hide the target tab for this check.");
    assert.equal(await hidden(), true);
    await page.send("Page.bringToFront"); await pause(100);
    assert.equal(await hidden(), true);
    await other.dispose();
    for (const event of ["pagehide", "pageshow"]) {
      await reveal();
      await page.evaluate(`window.dispatchEvent(new PageTransitionEvent('${event}', {persisted:true}))`);
      assert.equal(await hidden(), true);
    }
  });

  await t.test("full-document history restoration remains hidden", async () => {
    await page.navigate(fixture.base);
    await reveal();
    await page.navigate(`${fixture.base}/customers`);
    await page.evaluate("history.back()"); await pause(650);
    assert.equal(await hidden(), true);
  });

  await t.test("unavailable data has an honest empty state and no reveal button", async () => {
    await page.navigate(`${fixture.base}/unavailable`);
    assert.equal(await page.evaluate(`document.querySelectorAll('.privacy-toggle').length`), 0);
    assert.equal(await page.evaluate(`document.querySelector('#total-debt-display').textContent.trim()`), "لا توجد بيانات بعد");
    assert.equal(await page.evaluate(`document.querySelectorAll('.privacy-dots').length`), 0);
  });

  await t.test("real zero starts hidden and reveals three-decimal JOD", async () => {
    await page.navigate(`${fixture.base}/zero`);
    assert.equal(await hidden(), true);
    await reveal();
    assert.equal(await page.evaluate(`document.querySelector('.debt-number').textContent`), "0.000");
    assert.equal(await page.evaluate(`document.querySelector('.currency').textContent`), "د.أ");
  });

  await t.test("Enter and Space activate the button without leaking masked values", async () => {
    await page.navigate(fixture.base);
    await page.evaluate(`document.querySelector('.privacy-toggle').focus(); window.deliberatelyRevealed=true`);
    await page.key("Enter", 13);
    assert.equal(await hidden(), false);
    await page.key(" ", 32);
    assert.equal(await hidden(), true);
    const attributes = await page.evaluate(`document.querySelector('.debt-card').outerHTML`);
    assert.ok(!attributes.includes("9,876,543.210"));
    assert.ok(!attributes.includes(fixtureAmounts.normal));
  });

  const sizes = [[1920,1080],[1366,768],[1280,720],[768,1024],[390,844],[375,667]];
  for (const [width, height] of sizes) {
    await t.test(`RTL, touch target, long amount, and stable layout at ${width}x${height}`, async () => {
      await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 500 });
      await page.navigate(`${fixture.base}/long`);
      const before = await geometry();
      await reveal();
      const after = await geometry();
      assert.deepEqual(after, before);
      assert.equal(await page.evaluate(`document.documentElement.lang==='ar' && document.documentElement.dir==='rtl' && document.documentElement.scrollWidth <= innerWidth`), true);
      assert.equal(await page.evaluate(`(()=>{const n=document.querySelector('.debt-number'),b=document.querySelector('.privacy-toggle');const r=b.getBoundingClientRect();return n.scrollWidth<=n.clientWidth+1&&n.scrollHeight<=n.clientHeight+1&&r.width>=44&&r.height>=44})()`), true);
      assert.equal(await page.evaluate(`document.querySelector('.debt-number-group:last-of-type').getClientRects().length`), 1, "The decimal group must stay together.");
      const shot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      await writeFile(path.join(output, `${width}x${height}-revealed.png`), Buffer.from(shot.data, "base64"));
      await page.click(".privacy-toggle");
      assert.deepEqual(await geometry(), before);
    });
  }

  await t.test("touch toggles, no persistence, and no console/hydration errors", async () => {
    await page.navigate(fixture.base);
    await page.evaluate("window.deliberatelyRevealed=true");
    const point = await page.evaluate(`(()=>{const r=document.querySelector('.privacy-toggle').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await page.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    await page.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await pause();
    assert.equal(await hidden(), false);
    assert.equal(await page.evaluate("localStorage.length===0 && sessionStorage.length===0 && document.cookie==='' && location.search===''"), true);
    await writeFile(path.join(output, "browser-errors.json"), JSON.stringify(browserErrors(page), null, 2));
    assert.equal(browserErrors(page).length, 0, "No browser errors or hydration warnings expected; inspect the local browser-errors.json.");
    assert.ok(!page.events.filter(e => e.method === "Runtime.consoleAPICalled").some(e => JSON.stringify(e).includes(fixtureAmounts.normal)));
  });

  await page.dispose();
});

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

export const pause = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

export async function waitFor(url) {
  for (let i = 0; i < 240; i++) {
    try { const response = await fetch(url); if (response.ok) return; } catch { /* Server starting. */ }
    await pause(250);
  }
  throw new Error("Timed out waiting for the local test server.");
}

export async function startBrowser(output) {
  const executable = process.env.CHROME_PATH || [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
  if (!executable) throw new Error("Set CHROME_PATH to an installed Chromium browser.");
  const port = await freePort();
  const profile = path.resolve(output, "browser-profile");
  await mkdir(profile, { recursive: true });
  const child = spawn(executable, ["--headless=new", `--remote-debugging-port=${port}`,
    "--remote-debugging-address=127.0.0.1", `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "about:blank"],
  { windowsHide: true, stdio: "ignore" });
  const base = `http://127.0.0.1:${port}`;
  await waitFor(`${base}/json/version`);
  return { base, child };
}

export async function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const events = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) { events.push(message); return; }
    const call = pending.get(message.id);
    if (!call) return;
    pending.delete(message.id);
    clearTimeout(call.timer);
    if (message.error) call.reject(new Error(JSON.stringify(message.error)));
    else call.resolve(message.result);
  });
  return {
    events,
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const callId = ++id;
        const timer = setTimeout(() => {
          pending.delete(callId);
          reject(new Error(`Browser command timed out: ${method}`));
        }, 15000);
        pending.set(callId, { resolve, reject, timer });
        socket.send(JSON.stringify({ id: callId, method, params }));
      });
    },
    close() { socket.close(); },
  };
}

export async function newPage(browser) {
  const target = await fetch(`${browser.base}/json/new?about:blank`, { method: "PUT" }).then(r => r.json());
  const client = await connect(target.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Accessibility.enable");
  return {
    ...client,
    id: target.id,
    async evaluate(expression) {
      const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error("Browser evaluation failed; inspect the test expression.");
      return result.result.value;
    },
    async navigate(url) {
      await client.send("Page.navigate", { url });
      await pause(650);
    },
    async click(selector) {
      const expression = `document.querySelector(${JSON.stringify(selector)}).click()`;
      const result = await client.send("Runtime.evaluate", { expression });
      if (result.exceptionDetails) throw new Error(`Could not activate ${selector}`);
      await pause(220);
    },
    async key(key, code, modifiers = 0) {
      await client.send("Page.bringToFront");
      for (const type of ["keyDown", "keyUp"]) {
        const text = type === "keyDown" ? (key === "Enter" ? "\r" : key === " " ? " " : undefined) : undefined;
        await client.send("Input.dispatchKeyEvent", { type, key, code: key === " " ? "Space" : key, windowsVirtualKeyCode: code, modifiers, text });
      }
      await pause();
    },
    async dispose() { await client.send("Page.close"); client.close(); },
  };
}

export function browserErrors(page) {
  return page.events.filter(event => event.method === "Runtime.exceptionThrown" ||
    (event.method === "Log.entryAdded" && event.params.entry.level === "error") ||
    (event.method === "Runtime.consoleAPICalled" && event.params.type === "error"));
}

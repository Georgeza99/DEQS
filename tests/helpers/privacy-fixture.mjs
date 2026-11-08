import { spawn } from "node:child_process";
import { openSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { freePort, waitFor } from "./browser.mjs";

// Runtime-only fixtures live outside src/app and are never application records.
export const fixtureAmounts = {
  normal: "9876543.210",
  zero: "0.000",
  long: "123456789012345.678",
};

export async function startFixture(output) {
  const root = process.cwd();
  const directory = path.resolve(output, "fixture-app");
  await mkdir(path.join(directory, "app"), { recursive: true });
  await writeFile(path.join(directory, "package.json"), JSON.stringify({ name: "deqs-privacy-test-only", private: true }));
  await writeFile(path.join(directory, "tsconfig.json"), JSON.stringify({
    extends: path.relative(directory, path.join(root, "tsconfig.json")).replaceAll("\\", "/"),
    compilerOptions: { paths: { "@/*": [path.relative(directory, path.join(root, "src/*")).replaceAll("\\", "/")] } },
    include: ["next-env.d.ts", "app/**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
    exclude: ["node_modules"],
  }));
  await writeFile(path.join(directory, "next.config.mjs"),
    `export default { turbopack: { root: ${JSON.stringify(root)} }, devIndicators: false, agentRules: false };`);
  await writeFile(path.join(directory, "app/layout.tsx"), 'export { default, metadata } from "@/app/layout";');
  await writeFile(path.join(directory, "app/icon.svg"), await readFile(path.join(root, "src/app/icon.svg")));
  const dashboard = await readFile(path.join(root, "src/app/page.tsx"), "utf8");
  for (const [route, amount] of [["", fixtureAmounts.normal], ["zero", fixtureAmounts.zero], ["long", fixtureAmounts.long], ["unavailable", null]]) {
    const folder = path.join(directory, "app", route);
    await mkdir(folder, { recursive: true });
    const source = amount === null ? dashboard : dashboard.replace("<DebtSummary />",
      `<DebtSummary data={{ status: "available", amount: ${JSON.stringify(amount)} }} />`);
    await writeFile(path.join(folder, "page.tsx"), source);
  }
  for (const route of ["customers", "archive", "reports", "settings"]) {
    await mkdir(path.join(directory, "app", route), { recursive: true });
    await writeFile(path.join(directory, "app", route, "page.tsx"), `export { default, metadata } from "@/app/${route}/page";`);
  }
  const port = await freePort();
  const log = openSync(path.resolve(output, "fixture-server.log"), "w");
  const child = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"),
    "dev", directory, "--hostname", "127.0.0.1", "--port", String(port)],
  { cwd: root, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, windowsHide: true, stdio: ["ignore", log, log] });
  const base = `http://127.0.0.1:${port}`;
  try { await waitFor(base); } catch (error) { child.kill(); throw error; }
  return { base, child };
}

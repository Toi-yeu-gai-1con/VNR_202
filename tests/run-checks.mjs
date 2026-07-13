import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const testsDirectory = fileURLToPath(new URL(".", import.meta.url));
const checks = (await readdir(testsDirectory))
  .filter((name) => name.endsWith("-check.mjs"))
  .sort();

for (const check of checks) {
  const result = spawnSync(process.execPath, [check], {
    cwd: testsDirectory,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

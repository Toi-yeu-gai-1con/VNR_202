import { execFileSync } from "node:child_process";
import { cp } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";
import packageInfo from "./package.json" with { type: "json" };

function getGitRevision() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "local";
  }
}

function copyRuntimeAssets() {
  return {
    name: "copy-runtime-assets",
    async closeBundle() {
      await cp(path.resolve("assets"), path.resolve("dist", "assets"), { recursive: true });
    },
  };
}

export default defineConfig({
  publicDir: false,
  define: {
    __BUILD_VERSION__: JSON.stringify(`${packageInfo.version ?? "0.0.0"}+${getGitRevision()}`),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
  },
  plugins: [copyRuntimeAssets()],
});

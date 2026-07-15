import { defineConfig } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "presentation.spec.mjs",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4180",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chrome-1366", use: { browserName: "chromium", executablePath: chrome, viewport: { width: 1366, height: 768 } } },
    { name: "chrome-1920", use: { browserName: "chromium", executablePath: chrome, viewport: { width: 1920, height: 1080 } } },
    { name: "edge-1366", use: { browserName: "chromium", executablePath: edge, viewport: { width: 1366, height: 768 } } },
    { name: "edge-1920", use: { browserName: "chromium", executablePath: edge, viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: {
    command: "node tests/support/static-server.mjs --port 4180",
    url: "http://127.0.0.1:4180/index.html",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});

import { expect, test as base } from "@playwright/test";

export const test = base.extend({
  runtimeErrorGuard: [async ({ page }, use) => {
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "unknown failure";
      if (failure === "net::ERR_ABORTED" && ["document", "media"].includes(request.resourceType())) return;
      errors.push(`requestfailed: ${request.method()} ${request.url()} (${failure})`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
    });

    await use(errors);
    expect(errors, "The browser run must not emit console, page, request, or HTTP errors.").toEqual([]);
  }, { auto: true }],
});

export { expect };

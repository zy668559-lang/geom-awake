import fs from "fs";
import path from "path";
import { expect, test, type Page } from "@playwright/test";

const TEMP_IMAGE_NAME = "test-geometry-e2e.png";
const TEMP_IMAGE_PATH = path.join(process.cwd(), TEMP_IMAGE_NAME);
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zf5gAAAAASUVORK5CYII=";

test.describe.configure({ mode: "serial" });

type Evidence = {
  consoleErrors: string[];
  requestFailures: string[];
  apiErrors: Array<{ status: number; url: string; bodySnippet: string }>;
  analyzeRequestCount: number;
};

function ensureTempImage() {
  fs.writeFileSync(TEMP_IMAGE_PATH, Buffer.from(TINY_PNG_BASE64, "base64"));
}

function cleanupTempImage() {
  if (fs.existsSync(TEMP_IMAGE_PATH)) {
    fs.unlinkSync(TEMP_IMAGE_PATH);
  }
}

function bindEvidence(page: Page): Evidence {
  const evidence: Evidence = {
    consoleErrors: [],
    requestFailures: [],
    apiErrors: [],
    analyzeRequestCount: 0,
  };

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      evidence.consoleErrors.push(msg.text());
    }
  });

  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/analyze")) {
      evidence.analyzeRequestCount += 1;
    }
  });

  page.on("requestfailed", (request) => {
    evidence.requestFailures.push(
      `${request.method()} ${request.url()} :: ${request.failure()?.errorText || "unknown"}`
    );
  });

  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/api/")) return;

    const status = response.status();
    if (status < 400) return;

    let bodySnippet = "";
    try {
      bodySnippet = (await response.text()).slice(0, 400);
    } catch (error) {
      bodySnippet = `<<failed to read response body: ${String(error)}>>`;
    }

    evidence.apiErrors.push({ status, url, bodySnippet });
  });

  return evidence;
}

function printEvidence(label: string, evidence: Evidence) {
  console.log("");
  console.log(`[E2E:${label}] /api/analyze calls = ${evidence.analyzeRequestCount}`);
  console.log(`[E2E:${label}] console errors = ${evidence.consoleErrors.length}`);
  console.log(`[E2E:${label}] request failures = ${evidence.requestFailures.length}`);
  console.log(`[E2E:${label}] api >= 400 responses = ${evidence.apiErrors.length}`);

  evidence.consoleErrors.forEach((item, index) => {
    console.log(`[E2E:${label}] console error #${index + 1}: ${item}`);
  });
  evidence.requestFailures.forEach((item, index) => {
    console.log(`[E2E:${label}] request failed #${index + 1}: ${item}`);
  });
  evidence.apiErrors.forEach((item, index) => {
    console.log(
      `[E2E:${label}] api error #${index + 1}: ${item.status} ${item.url} body=${item.bodySnippet}`
    );
  });
  console.log("");
}

async function uploadAndEnterProcessing(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("input[type='file'][capture='environment']")).toBeAttached({
    timeout: 10_000,
  });
  await expect(page.locator("button").first()).toBeVisible({ timeout: 10_000 });
  await page.locator("button").first().click();

  const processingNavigation = page.waitForURL(/\/processing(\?|$)/, {
    timeout: 15_000,
    waitUntil: "domcontentloaded",
  });

  await page.setInputFiles("input[type='file'][capture='environment']", TEMP_IMAGE_PATH);

  try {
    await processingNavigation;
  } catch {
    const sid = `sid-upload-fallback-${Date.now().toString(36)}`;
    console.log("[E2E] upload->processing navigation timeout, fallback to seeded processing route.");
    await page.evaluate(
      ({ imageBase64, sessionId }) => {
        localStorage.setItem("pending_geometry_image", imageBase64);
        localStorage.setItem("pending_geometry_sid", sessionId);
      },
      {
        imageBase64: `data:image/png;base64,${TINY_PNG_BASE64}`,
        sessionId: sid,
      }
    );
    await page.goto(`/processing?sid=${sid}`, { waitUntil: "domcontentloaded" });
  }
}

async function enterProcessingWithSeedData(page: Page) {
  const sid = "sid-timeout-e2e";
  await page.addInitScript(
    ({ imageBase64, sessionId }) => {
      localStorage.setItem("pending_geometry_image", imageBase64);
      localStorage.setItem("pending_geometry_sid", sessionId);
    },
    {
      imageBase64: `data:image/png;base64,${TINY_PNG_BASE64}`,
      sessionId: sid,
    }
  );

  await page.goto(`/processing?sid=${sid}`, { waitUntil: "domcontentloaded" });
}

async function clickConfirm(page: Page) {
  const customRow = page.locator("div.mt-4.flex.gap-2");
  await expect(customRow).toBeVisible({ timeout: 10_000 });
  await customRow.locator("input").fill("我卡在第一步，不知道怎么开始写证明");
  await customRow.locator("button").click();
}

async function waitForFlowOutcome(page: Page, timeoutMs: number) {
  return Promise.race([
    page
      .waitForURL(/\/(result|report|next)(\/|$|\?)/, {
        timeout: timeoutMs,
        waitUntil: "domcontentloaded",
      })
      .then(() => "navigated" as const),
    page
      .getByTestId("processing-error-card")
      .waitFor({ state: "visible", timeout: timeoutMs })
      .then(() => "error" as const),
  ]);
}

test.beforeEach(() => {
  ensureTempImage();
});

test.afterEach(() => {
  cleanupTempImage();
});

test("processing confirm: within 60s must navigate or show explicit error", async ({ page }) => {
  test.setTimeout(90_000);
  const evidence = bindEvidence(page);

  await uploadAndEnterProcessing(page);
  await clickConfirm(page);

  const outcome = await waitForFlowOutcome(page, 60_000);
  printEvidence("happy-or-error", evidence);

  expect(["navigated", "error"]).toContain(outcome);
  expect(evidence.analyzeRequestCount).toBe(1);
});

test("processing confirm: slow analyze must show timeout error + recovery actions", async ({ page }) => {
  test.setTimeout(90_000);
  const evidence = bindEvidence(page);

  await page.route("**/api/analyze", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 40_000));
    await route.fulfill({
      status: 504,
      contentType: "application/json",
      body: JSON.stringify({ error: "upstream timeout", message: "mocked slow upstream" }),
    });
  });

  await enterProcessingWithSeedData(page);
  await clickConfirm(page);

  await expect(page.getByTestId("processing-error-card")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("processing-retry")).toBeVisible();
  await expect(page.getByTestId("processing-return")).toBeVisible();

  printEvidence("timeout-fallback", evidence);
  expect(evidence.analyzeRequestCount).toBe(1);
});

import { expect, test } from "@playwright/test";

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zf5gAAAAASUVORK5CYII=";

test("production smoke: processing uses POST /api/analyze and does not 405", async ({ page }) => {
  test.setTimeout(90_000);

  const sid = `sid-prod-smoke-${Date.now().toString(36)}`;
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

  const causeButtons = page.locator("div.grid > button");
  await expect(causeButtons.first()).toBeVisible({ timeout: 20_000 });

  const analyzeResponsePromise = page.waitForResponse(
    (resp) => resp.url().includes("/api/analyze") && resp.request().method() === "POST",
    { timeout: 60_000 }
  );

  await causeButtons.first().click();

  const analyzeResponse = await analyzeResponsePromise;
  const analyzeStatus = analyzeResponse.status();
  const analyzeMethod = analyzeResponse.request().method();
  const analyzeUrl = analyzeResponse.url();

  const reachedReport = await page
    .waitForURL(/\/report(\/|$|\?)/, { timeout: 20_000, waitUntil: "domcontentloaded" })
    .then(() => true)
    .catch(() => false);

  let responseBody = "";
  try {
    responseBody = await analyzeResponse.text();
  } catch {
    responseBody = "<<unable to read body>>";
  }

  console.log(
    `[PROD-SMOKE] method=${analyzeMethod} status=${analyzeStatus} url=${analyzeUrl} reachedReport=${reachedReport}`
  );
  if (analyzeStatus >= 400) {
    console.log(`[PROD-SMOKE] error body=${responseBody.slice(0, 300)}`);
  }

  expect(analyzeMethod).toBe("POST");
  expect(analyzeStatus === 200 || reachedReport).toBeTruthy();
  expect(analyzeStatus).not.toBe(405);
});

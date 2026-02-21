import { expect, test } from "@playwright/test";

function isGoogleUrl(url: string): boolean {
  return /(^https?:\/\/([^/]+\.)?(googleapis\.com|google\.com|gstatic\.com)\b)/i.test(url);
}

test("processing page diagnosis network audit", async ({ page }) => {
  test.setTimeout(60_000);

  const googleRequests: Array<{ method: string; url: string }> = [];
  const analyzeRequests: Array<{ ts: number; postData: string | null }> = [];
  const analyzeStatuses: number[] = [];

  page.on("request", (request) => {
    const url = request.url();

    if (isGoogleUrl(url)) {
      googleRequests.push({ method: request.method(), url });
    }

    if (url.includes("/api/analyze") && request.method() === "POST") {
      analyzeRequests.push({
        ts: Date.now(),
        postData: request.postData(),
      });
    }
  });

  page.on("response", async (response) => {
    const status = response.status();
    const url = response.url();
    const isAnalyzeApi = url.includes("/api/analyze");
    if (isAnalyzeApi) {
      analyzeStatuses.push(status);
    }

    if (![400, 429].includes(status)) return;
    if (!isAnalyzeApi && !isGoogleUrl(url)) return;

    const contentType = response.headers()["content-type"] || "";
    let payloadText = "";

    try {
      payloadText = await response.text();
    } catch (err) {
      payloadText = `<<failed to read response body: ${String(err)}>>`;
    }

    let prettyBody = payloadText;
    if (contentType.includes("application/json")) {
      try {
        prettyBody = JSON.stringify(JSON.parse(payloadText), null, 2);
      } catch {
        // Keep raw body if JSON parse fails.
      }
    }

    console.log("");
    console.log(`[DIAG] Captured error response: ${status} ${url}`);
    console.log("[DIAG] Error payload:");
    console.log(prettyBody);
    console.log("");
  });

  await page.goto("/processing", { waitUntil: "domcontentloaded" });
  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zf5gAAAAASUVORK5CYII=";
  await page.evaluate((image) => {
    localStorage.setItem("pending_geometry_image", image);
  }, tinyPngBase64);
  await page.reload({ waitUntil: "domcontentloaded" });

  const diagnosisButtons = page.locator("div.grid > button");
  await expect(diagnosisButtons.first()).toBeVisible({ timeout: 20_000 });
  await expect(diagnosisButtons.first()).toBeEnabled();

  const beforeGoogle = googleRequests.length;
  const beforeAnalyze = analyzeRequests.length;

  const firstAnalyzeResponsePromise = page.waitForResponse((resp) => {
    return resp.url().includes("/api/analyze") && resp.request().method() === "POST";
  });

  // Stress click x3: must still produce only one analyze request.
  await diagnosisButtons.first().click({ clickCount: 3, delay: 10 });
  const firstAnalyzeResponse = await firstAnalyzeResponsePromise;
  expect(firstAnalyzeResponse.status()).toBe(200);

  await page.waitForTimeout(2_500);

  const googleAfterClick = googleRequests.slice(beforeGoogle);
  const analyzeAfterClick = analyzeRequests.slice(beforeAnalyze);

  const uniqueAnalyzePayloads = new Set(
    analyzeAfterClick.map((entry) => entry.postData || "")
  ).size;

  console.log("");
  console.log("[DIAG] ===== Processing Network Summary =====");
  console.log(`[DIAG] /api/analyze call count after click: ${analyzeAfterClick.length}`);
  console.log(`[DIAG] /api/analyze response statuses: ${analyzeStatuses.join(", ") || "none"}`);
  console.log(`[DIAG] Google request count after click: ${googleAfterClick.length}`);
  console.log(`[DIAG] Unique /api/analyze payload count: ${uniqueAnalyzePayloads}`);

  if (googleAfterClick.length > 0) {
    console.log("[DIAG] Google requests detail:");
    googleAfterClick.forEach((req, idx) => {
      console.log(`[DIAG]   ${idx + 1}. ${req.method} ${req.url}`);
    });
  }

  if (analyzeAfterClick.length > 1) {
    console.log("[DIAG] Verdict: detected duplicate diagnose calls. Need frontend anti-double-click hardening.");
  } else {
    console.log("[DIAG] Verdict: no duplicate diagnose calls detected in rapid-click test.");
  }
  console.log("[DIAG] =====================================");
  console.log("");

  expect(analyzeAfterClick.length).toBe(1);
  expect(uniqueAnalyzePayloads).toBe(1);
});

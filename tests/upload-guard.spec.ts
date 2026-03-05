import { expect, test } from "@playwright/test";

test("processing upload blocks empty file and accepts non-empty file", async ({ page }) => {
  const analyzeRequests: string[] = [];

  page.on("request", (request) => {
    if (request.url().includes("/api/analyze")) {
      analyzeRequests.push(request.url());
    }
  });

  await page.goto("/processing", { waitUntil: "domcontentloaded" });

  const fileInputs = page.locator('input[type="file"]');
  const albumInput = fileInputs.nth(1);

  await albumInput.setInputFiles({
    name: "empty.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(0),
  });

  await expect(page.getByTestId("processing-error-card")).toBeVisible();
  const firstDiagnosisButton = page.locator("div.grid > button").first();
  await expect(firstDiagnosisButton).toBeDisabled();
  expect(analyzeRequests.length).toBe(0);

  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zf5gAAAAASUVORK5CYII=",
    "base64"
  );

  await albumInput.setInputFiles({
    name: "tiny.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });

  await expect(page.locator('img[alt="selected"]')).toBeVisible();

  const storedSize = await page.evaluate(() => Number(localStorage.getItem("pending_geometry_file_size") || "0"));
  expect(storedSize).toBeGreaterThan(0);
});

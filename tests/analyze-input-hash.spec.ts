import { expect, test } from "@playwright/test";

const IMG_A = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zf5gAAAAASUVORK5CYII=", "base64");
const IMG_B = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAwUBAO+X5wAAAABJRU5ErkJggg==", "base64");

test("api analyze returns different inputHashTail for different image input", async ({ request }) => {
  const headers = { "x-analyze-mock": "1" };
  const cause = "draw_line";
  const note = "辅助线完全想不到";

  const respA = await request.post("/api/analyze", {
    headers,
    multipart: {
      image: {
        name: "a.png",
        mimeType: "image/png",
        buffer: IMG_A,
      },
      cause,
      note,
    },
  });
  expect(respA.status()).toBe(200);
  const bodyA = await respA.json();
  expect(bodyA.fallback).toBeTruthy();
  expect(typeof bodyA.inputHashTail).toBe("string");
  expect(bodyA.inputHashTail).toHaveLength(8);

  const respB = await request.post("/api/analyze", {
    headers,
    multipart: {
      image: {
        name: "b.png",
        mimeType: "image/png",
        buffer: IMG_B,
      },
      cause,
      note,
    },
  });
  expect(respB.status()).toBe(200);
  const bodyB = await respB.json();
  expect(bodyB.fallback).toBeTruthy();
  expect(bodyB.inputHashTail).toHaveLength(8);

  expect(bodyA.inputHashTail).not.toBe(bodyB.inputHashTail);
});

import { expect, test } from "@playwright/test";
import { REPAIR_7DAY_PACKS } from "../data/training/repair_7days";
import { evaluateRepairSubmit } from "../lib/repair-submit-local";

test("repair static challenges are complete (3 x 7 x 2)", () => {
  const causes = Object.keys(REPAIR_7DAY_PACKS);
  expect(causes.length).toBe(3);

  for (const cause of causes) {
    const pack = REPAIR_7DAY_PACKS[cause as keyof typeof REPAIR_7DAY_PACKS];
    expect(pack.days.length).toBe(7);

    for (const day of pack.days) {
      expect(day.microPractice.length).toBe(2);
      expect(day.microPractice[0].trim().length).toBeGreaterThan(0);
      expect(day.microPractice[1].trim().length).toBeGreaterThan(0);
    }
  }
});

test("local submit evaluation is deterministic and fast", () => {
  const started = Date.now();

  const a = evaluateRepairSubmit({
    cause: "condition_relation",
    dayId: 4,
    stuckPoint: "关系总是写乱",
    content: "因为 AB 平行 CD，所以同位角相等，再推出三角形全等。",
    hasDraftImage: true,
  });

  const b = evaluateRepairSubmit({
    cause: "condition_relation",
    dayId: 4,
    stuckPoint: "关系总是写乱",
    content: "因为 AB 平行 CD，所以同位角相等，再推出三角形全等。",
    hasDraftImage: true,
  });

  const elapsed = Date.now() - started;

  expect(a).toEqual(b);
  expect(a.verdictTitle.length).toBeGreaterThan(0);
  expect(elapsed).toBeLessThan(2000);
});

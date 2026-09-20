import { describe, it, expect } from "vitest";
import { assessRisk } from "../services/claudeAgent.ts";

describe("interaction risk eval", () => {
  it("flags a known major interaction", async () => {
    const result = await assessRisk(["warfarin"], "aspirin");
    expect(result.toLowerCase()).toContain("bleeding");
  });

  it("does not fabricate a severity for unrelated drugs", async () => {
    const result = await assessRisk(["metformin"], "lisinopril");
    expect(result.toLowerCase()).not.toContain("contraindicated");
  });
});
import "dotenv/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.eval.ts"],
    testTimeout: 30_000,
  },
});

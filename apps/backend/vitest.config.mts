import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    exclude: ["dist", "node_modules"],
    pool: "forks",
    restoreMocks: true,
    clearMocks: true,
  },
});

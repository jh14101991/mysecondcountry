import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "data",
    include: ["src/**/*.test.ts"],
  },
});

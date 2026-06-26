import { defineWorkspace } from "vitest/config";

// Each package owns its own vitest.config.ts; the root runner aggregates them.
// The inline root project keeps the workspace non-empty during bootstrap so
// `vitest run` exits 0 before any package lands.
export default defineWorkspace([
  { test: { name: "root", include: [] } },
  "packages/*/vitest.config.ts",
  "scripts/vitest.config.ts",
]);

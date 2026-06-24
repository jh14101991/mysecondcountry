import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

// Pin zod to the workspace copy (Zod 4, owned by @where/data). Node's module
// resolution otherwise walks up to a global Zod 3 install in the home directory,
// and the prerender step fails with `z.partialRecord is not a function`. Resolving
// through @where/data's node_modules keeps this correct across zod version bumps.
const zodDir = fileURLToPath(new URL("../data/node_modules/zod", import.meta.url));

// v1 bootstrap is fully static, no SSR and no serverless functions yet, so no adapter
// is needed (Vercel serves dist/ directly). The @astrojs/vercel adapter lands in
// Phase C with the first Vercel Function (email capture, Stripe). Switching hosts then
// is a one-line adapter change (ADR-0013).
export default defineConfig({
  site: "https://mysecondcountry.com",
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  vite: {
    resolve: {
      alias: {
        zod: zodDir,
      },
    },
    ssr: {
      // Bundle zod into the prerender build instead of externalising it. Externalised,
      // zod is resolved fresh at prerender runtime and can climb to a global Zod 3 in the
      // home directory (no z.partialRecord). Bundling pins the workspace Zod 4 into the chunk.
      noExternal: ["zod"],
    },
  },
});

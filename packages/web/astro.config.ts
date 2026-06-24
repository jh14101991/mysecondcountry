import { defineConfig } from "astro/config";

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
});

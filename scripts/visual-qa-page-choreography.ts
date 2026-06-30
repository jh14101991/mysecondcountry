import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Browser, type BrowserContext, chromium, type Page } from "playwright";

const baseUrl = process.env.MSC_QA_BASE_URL ?? "http://127.0.0.1:4321";
const outDir = process.env.MSC_QA_OUT_DIR ?? "output/visual-qa/page-choreography";

const routes = [
  "/",
  "/about",
  "/screener",
  "/compare",
  "/compare/greece-portugal-spain",
  "/shortlists",
  "/shortlists/eu-residency-under-3700-a-month",
  "/guides",
  "/answers/does-greece-tax-foreign-pensions-at-7-percent",
  "/topics/portugal-ifici-the-nhr-successor",
  "/tax",
  "/greece/tax/foreign-pensioner-flat-tax",
  "/tools/greece-7-percent-pension-tax-checklist",
  "/sources",
  "/methodology",
  "/places",
  "/places/greece",
  "/places/greece/crete",
  "/places/greece/crete/chania",
  "/privacy",
  "/screening-notice",
  "/terms",
  "/affiliate-disclosure",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "tablet", width: 900, height: 1100 },
  { name: "mobile", width: 390, height: 900 },
];

type Result = {
  route: string;
  viewport: string;
  ok: boolean;
  issues: string[];
  status: number | null;
  url: string | null;
  screenshots: string[];
};

function routeSlug(route: string): string {
  return route === "/" ? "home" : route.replace(/^\/+/, "").replaceAll("/", "-");
}

function emptyResult(route: string, viewport: string): Result {
  return {
    route,
    viewport,
    ok: false,
    issues: [],
    status: null,
    url: null,
    screenshots: [],
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function finishResult(result: Result): Result {
  result.ok = result.issues.length === 0;
  return result;
}

function screenshotPath(route: string, name: string): string {
  return join(outDir, `${name}-${routeSlug(route)}.png`);
}

async function closeContext(context: BrowserContext | undefined, result: Result): Promise<void> {
  if (!context) return;
  try {
    await context.close();
  } catch (error) {
    result.issues.push(`context close failed: ${errorMessage(error)}`);
  }
}

async function loadRoute(
  page: Page,
  route: string,
  waitUntil: "networkidle" | "domcontentloaded",
  result: Result,
): Promise<void> {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil });
  result.status = response?.status() ?? null;
  result.url = response?.url() ?? page.url();

  if (!response) {
    result.issues.push("navigation returned no response");
    return;
  }

  if (result.status === null || result.status < 200 || result.status >= 400) {
    result.issues.push(`HTTP status ${result.status}`);
  }
}

async function captureScreenshot(page: Page, result: Result, path: string): Promise<void> {
  await page.screenshot({ path, fullPage: false });
  result.screenshots.push(path);
}

async function hiddenRevealCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    return [...document.querySelectorAll<HTMLElement>("[data-reveal], [data-img-reveal]")].filter(
      (el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return rect.height > 8 && (style.opacity === "0" || style.visibility === "hidden");
      },
    ).length;
  });
}

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
}

async function visibleTextLength(page: Page): Promise<number> {
  return page.evaluate(() => document.body.innerText.trim().length);
}

async function checkMobileMenu(page: Page, result: Result): Promise<void> {
  const menuButton = page.locator(".nav-toggle").first();
  if ((await menuButton.count()) === 0) {
    result.issues.push("mobile menu button missing");
    return;
  }

  const controls = await menuButton.getAttribute("aria-controls");
  if (!controls) {
    result.issues.push("mobile menu button missing aria-controls");
    return;
  }

  const menu = page.locator(`#${controls}`).first();
  if ((await menu.count()) === 0) {
    result.issues.push(`controlled mobile menu #${controls} missing`);
    return;
  }

  await menuButton.click();
  await page.waitForTimeout(100);

  if ((await menuButton.getAttribute("aria-expanded")) !== "true") {
    result.issues.push("mobile menu button did not set aria-expanded=true");
  }

  if (!(await menu.isVisible())) {
    result.issues.push("mobile menu did not become visible");
  }

  if ((await menu.getAttribute("hidden")) !== null) {
    result.issues.push("mobile menu remains hidden after click");
  }

  const menuText = await menu.innerText();
  for (const label of ["Compare", "Shortlists", "Guides", "Sources", "Build my shortlist"]) {
    if (!menuText.includes(label)) result.issues.push(`mobile menu missing ${label}`);
  }
}

async function checkRoute(
  browser: Browser,
  route: string,
  viewport: (typeof viewports)[number],
): Promise<Result> {
  const result = emptyResult(route, viewport.name);
  let context: BrowserContext | undefined;

  try {
    context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await loadRoute(page, route, "networkidle", result);
    await captureScreenshot(page, result, screenshotPath(route, viewport.name));
    await page.evaluate(() => window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.45)));
    await page.waitForTimeout(250);
    await captureScreenshot(page, result, screenshotPath(route, `${viewport.name}-midscroll`));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(250);
    await captureScreenshot(page, result, screenshotPath(route, `${viewport.name}-bottom`));

    if (await hasHorizontalOverflow(page)) result.issues.push("horizontal overflow");
    const hiddenReveals = await hiddenRevealCount(page);
    if (hiddenReveals > 0)
      result.issues.push(`${hiddenReveals} reveal element(s) still hidden after scroll`);
    if ((await visibleTextLength(page)) < 200)
      result.issues.push("visible text unexpectedly short");

    if (viewport.name === "mobile") {
      await checkMobileMenu(page, result);
    }
  } catch (error) {
    result.issues.push(`check threw: ${errorMessage(error)}`);
  } finally {
    await closeContext(context, result);
  }

  return finishResult(result);
}

async function checkReducedMotion(browser: Browser, route: string): Promise<Result> {
  const result = emptyResult(route, "reduced-motion-mobile");
  let context: BrowserContext | undefined;

  try {
    context = await browser.newContext({
      viewport: { width: 390, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await loadRoute(page, route, "networkidle", result);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);
    if ((await hiddenRevealCount(page)) > 0)
      result.issues.push("reduced-motion content remains hidden");
    await captureScreenshot(page, result, screenshotPath(route, "reduced-motion"));
  } catch (error) {
    result.issues.push(`check threw: ${errorMessage(error)}`);
  } finally {
    await closeContext(context, result);
  }

  return finishResult(result);
}

async function checkNoJs(browser: Browser, route: string): Promise<Result> {
  const result = emptyResult(route, "no-js-mobile");
  let context: BrowserContext | undefined;

  try {
    context = await browser.newContext({
      viewport: { width: 390, height: 900 },
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await loadRoute(page, route, "domcontentloaded", result);
    if ((await visibleTextLength(page)) < 200)
      result.issues.push("no-JS visible text unexpectedly short");
    if ((await hiddenRevealCount(page)) > 0)
      result.issues.push("no-JS reveal content remains hidden");
    await captureScreenshot(page, result, screenshotPath(route, "no-js"));
  } catch (error) {
    result.issues.push(`check threw: ${errorMessage(error)}`);
  } finally {
    await closeContext(context, result);
  }

  return finishResult(result);
}

async function runCheck(
  route: string,
  viewport: string,
  check: () => Promise<Result>,
): Promise<Result> {
  try {
    return await check();
  } catch (error) {
    return finishResult({
      ...emptyResult(route, viewport),
      issues: [`check failed before result capture: ${errorMessage(error)}`],
    });
  }
}

async function run(): Promise<Result[]> {
  const results: Result[] = [];
  let browser: Browser | undefined;

  try {
    const activeBrowser = await chromium.launch({ headless: true });
    browser = activeBrowser;
    for (const route of routes) {
      for (const viewport of viewports) {
        results.push(
          await runCheck(route, viewport.name, () => checkRoute(activeBrowser, route, viewport)),
        );
      }
      results.push(
        await runCheck(route, "reduced-motion-mobile", () =>
          checkReducedMotion(activeBrowser, route),
        ),
      );
      results.push(await runCheck(route, "no-js-mobile", () => checkNoJs(activeBrowser, route)));
    }
  } catch (error) {
    results.push(
      finishResult({
        ...emptyResult("*", "runner"),
        issues: [`runner failed: ${errorMessage(error)}`],
      }),
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        results.push(
          finishResult({
            ...emptyResult("*", "browser"),
            issues: [`browser close failed: ${errorMessage(error)}`],
          }),
        );
      }
    }
  }

  return results;
}

mkdirSync(outDir, { recursive: true });
const results = await run();

writeFileSync(join(outDir, "results.json"), `${JSON.stringify(results, null, 2)}\n`);

const failures = results.filter((result) => !result.ok);
if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.route} ${failure.viewport}: ${failure.issues.join(", ")}`);
  }
  process.exit(1);
}

console.log(`visual-qa-page-choreography: ${results.length} checks passed. Evidence in ${outDir}`);

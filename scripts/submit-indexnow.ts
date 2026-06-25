// Submit every live sitemap URL to IndexNow (Bing, Yandex, and other participating engines),
// which prompts a fast re-crawl. The key file must already be live at KEY_LOCATION (deployed)
// before this works. Run after a deploy: `pnpm indexnow`.

const HOST = "mysecondcountry.com";
const KEY = "b171969e864f1a85bdef4e7f1855dc88";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

const sitemapXml = await (await fetch(SITEMAP_URL)).text();
const urlList = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u): u is string => Boolean(u));

if (urlList.length === 0) {
  console.error("indexnow: no <loc> URLs found in the live sitemap; aborting.");
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

console.log(`indexnow: submitted ${urlList.length} URL(s) -> HTTP ${res.status} ${res.statusText}`);
const body = await res.text();
if (body.trim()) console.log(body);
// IndexNow returns 200 (OK) or 202 (accepted, key validation pending). Both are success.
if (res.status !== 200 && res.status !== 202) process.exit(1);

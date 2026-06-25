// DOD (b): every CitedValue sourceUrl must be a reachable HTTPS URL. A clear "gone"
// status (404/410) is a hard failure. Bot blocks (403), rate limits (429), 5xx, and
// transient network/TLS errors are soft warnings, so the gate catches dead links
// without going flaky on government sites that throttle automated requests (AADE,
// migration.gov.gr). The weekly link-rot cron does the deeper sweep.

import {
  collectCitedValues,
  collectQaCitedValues,
  collectRegimeCitedValues,
  places,
  qa,
  regimes,
} from "@where/data";

const UA = "MySecondCountryBot/1.0 (+https://mysecondcountry.com; citation link check)";
const TIMEOUT_MS = 12_000;

const urls = new Set<string>();
for (const place of places) {
  for (const { cited } of collectCitedValues(place)) urls.add(cited.sourceUrl);
}
for (const regime of regimes) {
  for (const { cited } of collectRegimeCitedValues(regime)) urls.add(cited.sourceUrl);
}
for (const entry of qa) {
  for (const { cited } of collectQaCitedValues(entry)) urls.add(cited.sourceUrl);
}

let hardFail = 0;
let warned = 0;

for (const url of [...urls].sort()) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": UA, accept: "*/*" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404 || res.status === 410) {
      console.error(`DEAD ${res.status}  ${url}`);
      hardFail += 1;
    } else if (res.status >= 400) {
      console.warn(`WARN ${res.status}  ${url} (soft: bot-block / throttle / server error)`);
      warned += 1;
    } else {
      console.log(`OK   ${res.status}  ${url}`);
    }
  } catch (err) {
    console.warn(`WARN net    ${url} (soft: ${(err as Error).message})`);
    warned += 1;
  }
}

console.log(`\ncheck-sources: ${urls.size} url(s), ${hardFail} dead, ${warned} soft warning(s).`);
if (hardFail > 0) process.exit(1);

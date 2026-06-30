# Runbook

Reference doc, not a process doc (ADR-0012). How deploy, the two Monday crons, and IndexNow
actually work, where each credential lives, and who to call if access is lost. Read `SECRETS.md`
first for the secret inventory this doc cross-references.

## Deploy

The site is `output: static` (Astro, ADR-0013). Vercel's native Git integration triggers a
production deploy on every push to `main`; there is no separate deploy step or token in GitHub
Actions for normal operation.

- To ship a change: merge to `main`. Vercel builds and deploys automatically.
- To check deploy status: Vercel project dashboard, Deployments tab.
- To roll back: in the Vercel dashboard, find the previous good deployment and "Promote to
  Production" (instant; does not require a new commit).
- `ci.yml` runs on every push and PR (lint, typecheck, test, `verify:data`, `verify:sources`,
  build, `verify:build`). It does not gate the Vercel deploy itself; Vercel deploys on push
  regardless of CI's result on that same commit. Treat a red `ci.yml` run on `main` as a
  same-day fix, since the broken commit is already live.

## The two Monday crons

Both live in `.github/workflows/`, both also support manual `workflow_dispatch`.

### `refresh.yml`, data refresh

- Schedule: `0 6 * * 1`, Mondays 06:00 UTC.
- What it does: runs `pnpm exec tsx scripts/refresh-place.ts --all-greece` to pull the
  automatable fields (Eurostat); a failed fetch is a warning, not a hard failure. Normalizes
  JSON with `biome check --write`. If `packages/data/src/places` changed, opens (or updates) a
  PR on a `refresh/<date>` branch. No auto-merge (ADR-0006): a human reviews and merges. Also
  runs `pnpm verify:data` as an informational freshness check (visa/tax/residency fields are
  manual-only and are not touched by this script; a red result here means one of those values
  has aged past its window and needs a manual re-verify, independent of whether the PR has a
  diff).
- Credentials: uses the built-in `github.token` (via `GH_TOKEN` env) to push the branch and open
  the PR. No GitHub Actions secret is required for this workflow today (see `SECRETS.md`,
  `GH_PR_BOT_TOKEN` is documented but not currently wired in here).
- To run manually: GitHub repo, Actions tab, "Refresh data" workflow, "Run workflow" button
  (`workflow_dispatch`), or `gh workflow run refresh.yml`.
- To debug: check the workflow run's logs in the Actions tab. If no PR appeared, the most likely
  cause is "no data changes this run" (the script exits early and logs that explicitly). If the
  PR step failed, check `gh pr view "refresh/<date>"` and the `GH_TOKEN` permissions block
  (`contents: write`, `pull-requests: write`) at the top of the workflow file.

### `digest.yml`, weekly digest

- Schedule: `0 7 * * 1`, Mondays 07:00 UTC, one hour after `refresh.yml`.
- What it does: runs `pnpm exec tsx scripts/digest.ts`, which builds a markdown digest (Search
  Console performance, Plausible analytics, AI-crawler hits from the Vercel Blob log) and opens
  it as a GitHub issue labeled `digest`, assigned to the repo owner.
  - The Search Console section degrades gracefully: if `GSC_SERVICE_ACCOUNT_JSON` is missing, the
    digest prints a note explaining how to set it instead of failing the run.
  - The AI-crawler section similarly degrades if `BLOB_READ_WRITE_TOKEN` is missing.
- Credentials (GitHub Actions secrets): `PLAUSIBLE_API_KEY`, `GSC_SERVICE_ACCOUNT_JSON`,
  `BLOB_READ_WRITE_TOKEN`. See `SECRETS.md` for what each does and how to rotate it.
- To run manually: GitHub repo, Actions tab, "Weekly digest" workflow, "Run workflow" button, or
  `gh workflow run digest.yml`.
- To debug: check the "Build digest" step's logs first; the script prints which sections it
  skipped due to missing credentials. If the issue-creation step fails, check that the `digest`
  label exists on the repo (the workflow falls back to creating the issue without the label if
  the labeled attempt fails).

### Running a cron locally

Both scripts can run outside CI for debugging: `pnpm exec tsx scripts/refresh-place.ts
--all-greece` or `pnpm exec tsx scripts/digest.ts > digest.md`. Set the relevant secrets in a
local `.env` first (never commit it); see `SECRETS.md` for which ones each script reads.

## IndexNow

`indexnow.yml` runs on every push to `main` (not a cron). It waits 150 seconds for the Vercel
deploy to go live (a time-based proxy, not a real deploy-succeeded webhook), then runs
`pnpm indexnow` (`scripts/submit-indexnow.ts`), which fetches the live sitemap and submits every
URL to the IndexNow API so Bing, Yandex, and other participating engines re-crawl quickly. No
GitHub Actions secret is required: the IndexNow key is a hardcoded, non-secret value in the
script (it must match the key file served at `https://mysecondcountry.com/<key>.txt`).

- To run manually: `pnpm indexnow` from a local checkout (no special access needed beyond
  network access). `indexnow.yml` itself does not support `workflow_dispatch` today, only
  `push` to `main`; the local script run is the manual path.
- To debug: the script logs the HTTP status from the IndexNow API. 200 or 202 are both success
  (202 means the key is still being validated). A non-2xx status means either the sitemap fetch
  failed or the key file is not reachable at `KEY_LOCATION`.

## `ci.yml`

Runs on every push to `main` and every pull request: lint and format (Biome), typecheck (root and
per-package), `pnpm test`, `pnpm verify:data`, `pnpm verify:sources`, `pnpm build`, then
`pnpm verify:build` (fence, JSON-LD, robots, accessibility, and the other build-output gates). No
secrets are required; it does not deploy anything.

- `ci.yml` does not support `workflow_dispatch`, only `push` and `pull_request`. To re-run it
  without a new commit, use the Actions tab's "Re-run jobs" button on the existing run, or push
  an empty commit.
- To debug: each step is a separate log section in the Actions tab; the step name tells you which
  gate failed (lint, typecheck, test, data freshness, source reachability, build, or a specific
  `verify:build` sub-check).

## Where each credential lives

See `SECRETS.md` for the full inventory, descriptions, and rotation steps. Summary of locations:

| Credential | GitHub Actions secret | Vercel env var | Local `.env` |
|---|---|---|---|
| `GSC_SERVICE_ACCOUNT_JSON` | Yes (`digest.yml`) | No | Yes, for local digest runs |
| `BLOB_READ_WRITE_TOKEN` | Yes (`digest.yml`) | Yes (`middleware.ts` at runtime) | Yes, for local digest runs |
| `PLAUSIBLE_API_KEY` | Yes (`digest.yml`) | Not currently | Yes, for local digest runs |
| `PLAUSIBLE_DOMAIN` | Not a secret | Not currently | Yes |
| `GH_PR_BOT_TOKEN` | Documented, not currently used (`refresh.yml` uses `github.token`) | No | No |
| `VERCEL_TOKEN` | Only if a manual CLI deploy step is ever added | N/A (it authenticates *to* Vercel) | Only for manual `vercel` CLI use |
| `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAQ_API_KEY`, `DATA_GOV_GR_TOKEN` | Planned, not yet wired | Planned, not yet wired | Planned, not yet wired |

GitHub Actions secrets: repo Settings > Secrets and variables > Actions. Vercel env vars: Vercel
project dashboard > Settings > Environment Variables.

## Access and recovery

The single largest bus-factor gap in this project is that the founder is the only person with
access to the accounts below. The lines marked `FOUNDER: confirm` are facts only the founder
knows and must fill in; nothing here should be guessed.

- **Vercel admin:** FOUNDER: confirm (who has owner/admin role on the Vercel team/project; is
  there a second admin or a documented account-recovery path).
- **GitHub repo admin:** FOUNDER: confirm (who besides the founder has admin or write access to
  this repository and its Actions secrets).
- **Domain registrar (`mysecondcountry.com`):** FOUNDER: confirm (which registrar, who has login
  access, whether 2FA recovery codes are stored somewhere durable).
- **Domain renewal date:** FOUNDER: confirm exact date. Set a calendar reminder at least 30 days
  before expiry; an expired domain takes the whole production deploy down even if Vercel itself
  is healthy.
- **Google Search Console admin (`sc-domain:mysecondcountry.com`):** FOUNDER: confirm who has
  Owner-level access (needed to add or rotate the `GSC_SERVICE_ACCOUNT_JSON` service account).
- **Plausible admin:** FOUNDER: confirm who owns the Plausible account/site for
  `mysecondcountry.com`.

If the founder is unavailable and none of the above has a documented second admin, the practical
recovery path is: registrar access first (it is the root of DNS and therefore everything else),
then Vercel (re-link the GitHub repo to a new Vercel project if the original account is
unreachable), then GSC and Plausible (lower priority; analytics and search data, not the live
site).

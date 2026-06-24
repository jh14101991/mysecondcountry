# SECRETS.md

This repo is public-leaning. A committed secret is an immediate financial-loss event. Read this file before touching any key or token.

## Threat model

The content-as-code dataset is designed to be public. The codebase will likely be open-sourced or at minimum browsed by contributors. Treat every secret as if it is one `git push` away from exposure. The risk profile:

- ANTHROPIC_API_KEY: per-token billing, no hard cap by default. Leaked = open invoice.
- STRIPE_SECRET_KEY: payment operations. Even a restricted key can create payment links or read customer data.
- RESEND_API_KEY: email send. Leaked = spam cannon on your domain.
- VERCEL_TOKEN: not needed in CI with Vercel's Git integration; only needed if running `vercel` CLI manually. Leaked = unauthorized deploys.
- OPENAQ_API_KEY / DATA_GOV_GR_TOKEN: rate-limited data APIs. Leaked = quota exhaustion.

## Secret inventory

| Variable | Description | Least-privilege scope |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API for content generation in the refresh pipeline | Workspaces key scoped to the project; disable model access beyond claude-sonnet-* if possible |
| `RESEND_API_KEY` | Transactional email + newsletter sends via Resend | Scoped to one sending domain only |
| `STRIPE_SECRET_KEY` | Stripe Checkout fake-door; create checkout sessions and read session status only | **Restricted key** (not the live full secret key): enable Checkout Sessions write + read, disable everything else in the Stripe Dashboard restricted key editor |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures | Generated per webhook endpoint; unique per environment |
| `OPENAQ_API_KEY` | OpenAQ air quality data pulls in the refresh pipeline | Read-only, no write scopes |
| `DATA_GOV_GR_TOKEN` | Greek government open data API | Read-only |
| `PLAUSIBLE_API_KEY` | Plausible Stats API for analytics reads (optional in pipeline) | Read-only stats token |
| `PLAUSIBLE_DOMAIN` | Plausible site domain string (e.g. `whereto.live`) | Not a secret, but kept in env for consistency |
| `VERCEL_TOKEN` | Only needed if running `vercel` CLI outside of the native Git integration | Not required in CI for normal push-to-deploy; set only if a manual CLI deploy step is added |
| `GH_PR_BOT_TOKEN` | GitHub PAT used by the cron refresh pipeline to open a PR | Fine-grained PAT: `contents:write` + `pull_requests:write` on this repo only; no org scope |

## Where each secret lives

### Local development (.env)

All variables live in `.env` at the repo root (git-ignored). Copy `.env.example`, fill in values. Never commit `.env`.

Use only for: local data refreshes (`tsx scripts/refresh-*.ts`), local Stripe fake-door testing, local Astro dev server.

### GitHub Actions secrets

Store in the repo's **Settings > Secrets and variables > Actions**. The cron workflow and the PR-open bot use:

- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `OPENAQ_API_KEY`
- `DATA_GOV_GR_TOKEN`
- `GH_PR_BOT_TOKEN`
- `PLAUSIBLE_API_KEY` (if the pipeline reads analytics for scoring)

Stripe secrets are NOT needed in GitHub Actions. The refresh pipeline does not create payment intents; it generates content and opens a PR. Stripe keys belong only in the Vercel runtime.

### Vercel runtime secrets

Set in the Vercel project dashboard at Settings > Environment Variables. These are injected into Vercel Functions at runtime:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PLAUSIBLE_API_KEY` (if server-side AI-crawler logging calls the Plausible Events API)

With Vercel's native Git integration no deploy token is needed in GitHub Actions CI; deployments are triggered automatically on push to `main`.

## .env.example

```env
# Claude API, content generation in the refresh pipeline
ANTHROPIC_API_KEY=

# Resend, transactional email and newsletter
RESEND_API_KEY=

# Stripe, RESTRICTED key only (fake-door checkout sessions + read)
# Do NOT put your full live Stripe secret key here.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAQ, air quality data
OPENAQ_API_KEY=

# Greek government open data
DATA_GOV_GR_TOKEN=

# Plausible, analytics reads (optional in pipeline)
PLAUSIBLE_API_KEY=
PLAUSIBLE_DOMAIN=

# GitHub, fine-grained PAT for the cron PR bot
GH_PR_BOT_TOKEN=
```

## Secret scanning

Two layers are mandatory before any commit touches production.

### Pre-commit hook: gitleaks

Install gitleaks and wire it as a pre-commit hook via `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
```

Run `pre-commit install` after cloning. The hook blocks commits that match known secret patterns (API keys, Stripe sk_live/sk_test prefixes, bearer tokens).

A `.gitleaks.toml` config file lives at the repo root and extends the default ruleset with project-specific patterns (e.g. `sk_restricted_` Stripe prefix if Stripe ever adds a distinct prefix for restricted keys).

### GitHub push protection

Enable in **Settings > Code security and analysis > Secret scanning > Push protection**. This is a second gate: even if a developer bypasses the pre-commit hook (not installed, forced push), GitHub blocks the push server-side when a known secret pattern is detected.

Bootstrap step: enable both layers on day one, before any contributor other than the founder has access.

### trufflehog (optional CI gate)

Add a `trufflehog` step to the CI workflow to scan the full commit history on every PR. This catches secrets buried in older commits before merging:

```yaml
- name: Scan for secrets
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
```

## Stripe restricted key setup

In the Stripe Dashboard:

1. Go to Developers > API keys > Create restricted key.
2. Name it `whereto-live-fake-door-[env]` (one key per environment: test, live).
3. Enable only: Checkout Sessions (write + read). Disable everything else.
4. Paste the `rk_live_...` or `rk_test_...` value into `STRIPE_SECRET_KEY`.

The full `sk_live_...` key is never used in this project. If you find `sk_live` anywhere in the codebase, treat it as a leak and rotate immediately.

## Vercel setup

Vercel's native Git integration handles deploys automatically on push to `main`; no deploy token is needed in GitHub Actions for normal operation. Runtime env vars are set in the Vercel project dashboard at Settings > Environment Variables. If you ever need to run the `vercel` CLI manually (for example, for a one-off preview deploy), generate a token at vercel.com/account/tokens and treat it as a restricted secret. That token is never committed to the repo.

## GitHub fine-grained PAT setup

1. Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
2. Repository access: this repo only.
3. Permissions: `Contents: Read and write`, `Pull requests: Read and write`. Nothing else.
4. Expiry: 90 days maximum. Set a calendar reminder to rotate before expiry.
5. Save as `GH_PR_BOT_TOKEN` in GitHub Actions secrets.

## Rotation policy

| Key | Rotation trigger | Rotation interval |
|---|---|---|
| `ANTHROPIC_API_KEY` | Any suspected leak, or every 6 months | 6 months |
| `RESEND_API_KEY` | Any suspected leak, or any change to sending domain | 6 months |
| `STRIPE_SECRET_KEY` | Any suspected leak | 6 months |
| `STRIPE_WEBHOOK_SECRET` | Any change to the webhook endpoint URL | Per endpoint change |
| `OPENAQ_API_KEY` | Any suspected leak | 12 months |
| `DATA_GOV_GR_TOKEN` | Any suspected leak | 12 months |
| `VERCEL_TOKEN` | Any suspected leak or contributor offboarding (if a manual CLI token was created) | 90 days |
| `GH_PR_BOT_TOKEN` | Expiry (max 90 days), any suspected leak | 90 days |

## If a key leaks: immediate runbook

1. Rotate the key in the provider dashboard immediately. Do not wait to assess impact first. Rotate, then assess.
2. Revoke the leaked key before creating the replacement. Do not have both active simultaneously.
3. Remove the secret from any Git history using `git filter-repo` or BFG Repo Cleaner, then force-push. Notify any forks.
4. Check provider audit logs for unauthorized usage in the window between exposure and rotation.
5. Update the secret in all three locations: local `.env`, GitHub Actions secrets (for pipeline secrets), Vercel project environment variables (for runtime secrets).
6. File a brief incident note in `docs/decisions/ADR-log.md` with the date, key type, and estimated exposure window. No need to record the key value.
7. If the Stripe restricted key was exposed, check the Stripe Dashboard for unexpected Checkout Sessions or customers created in the exposure window.

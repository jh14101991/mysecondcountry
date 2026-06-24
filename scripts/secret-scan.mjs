#!/usr/bin/env node
// Local pre-commit secret scan. Second layer behind GitHub push protection.
// Prefers gitleaks when installed; otherwise runs a high-signal regex fallback
// over staged content so a missing binary never silently disables the gate.

import { execFileSync, spawnSync } from "node:child_process";

const ALLOWLIST = [/(^|\/)\.env\.example$/, /(^|\/)\.gitleaks\.toml$/];

// High-signal credential patterns. Kept narrow to avoid false positives in docs.
const PATTERNS = [
  { name: "Stripe live secret key", re: /sk_live_[0-9a-zA-Z]{20,}/ },
  { name: "Stripe live restricted key", re: /rk_live_[0-9a-zA-Z]{20,}/ },
  { name: "Stripe test secret key", re: /sk_test_[0-9a-zA-Z]{20,}/ },
  { name: "Anthropic API key", re: /sk-ant-[0-9A-Za-z_-]{20,}/ },
  { name: "Resend API key", re: /\bre_[0-9A-Za-z]{20,}/ },
  { name: "AWS access key id", re: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub token", re: /gh[posru]_[0-9A-Za-z]{30,}/ },
  { name: "Slack token", re: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: "Private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  {
    name: "Generic bearer secret",
    re: /(?:secret|token|password|passwd|api[_-]?key)\s*[:=]\s*["'][0-9A-Za-z/+_-]{24,}["']/i,
  },
];

function hasGitleaks() {
  const r = spawnSync("gitleaks", ["version"], { stdio: "ignore" });
  return r.status === 0;
}

function stagedFiles() {
  const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM"], {
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function stagedContent(file) {
  try {
    return execFileSync("git", ["show", `:${file}`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}

if (hasGitleaks()) {
  const r = spawnSync("gitleaks", ["protect", "--staged", "--redact", "--no-banner"], {
    stdio: "inherit",
  });
  process.exit(r.status ?? 0);
}

const findings = [];
for (const file of stagedFiles()) {
  if (ALLOWLIST.some((re) => re.test(file))) continue;
  const content = stagedContent(file);
  if (!content) continue;
  for (const { name, re } of PATTERNS) {
    if (re.test(content)) findings.push({ file, name });
  }
}

if (findings.length > 0) {
  console.error("\nBLOCKED: potential secret(s) in staged changes:");
  for (const f of findings) console.error(`  - ${f.file}: ${f.name}`);
  console.error("\nRemove the secret, use an env var, and commit again.");
  console.error("Install gitleaks for stronger coverage: https://github.com/gitleaks/gitleaks\n");
  process.exit(1);
}

process.exit(0);

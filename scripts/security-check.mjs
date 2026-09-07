#!/usr/bin/env node
/**
 * Repository security policy checks.
 *
 * Catches the classes of mistake that generic scanners miss because they are
 * specific to this stack (Vite + React frontend, Postgres with row-level
 * security, edge functions).
 *
 * Exit code 1 => blocking error. Warnings are reported but do not fail.
 *
 * Run locally with:  node scripts/security-check.mjs
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const errors = [];
const warnings = [];

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".workspace",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".sql",
  ".html",
  ".css",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
  ".env",
]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stats;
    try {
      stats = statSync(full);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      walk(full, files);
    } else if (TEXT_EXTENSIONS.has(extname(entry)) || entry.startsWith(".env")) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walk(ROOT);

function read(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function lineOf(content, index) {
  return content.slice(0, index).split("\n").length;
}

function report(list, rule, file, line, message) {
  list.push({ rule, location: `${relative(ROOT, file)}:${line}`, message });
}

// ---------------------------------------------------------------------------
// 1. Hardcoded credentials
// ---------------------------------------------------------------------------
// A Supabase service-role JWT always contains {"role":"service_role"} in its
// payload, which base64url-encodes to this fragment. The anon/publishable key
// is safe in client code, so matching the encoded role avoids false positives.
const SERVICE_ROLE_JWT_FRAGMENT = "InJvbGUiOiJzZXJ2aWNlX3JvbGUi";

const CREDENTIAL_PATTERNS = [
  {
    rule: "hardcoded-service-role-key",
    regex: new RegExp(SERVICE_ROLE_JWT_FRAGMENT, "g"),

    message:
      "A service-role key is embedded here. It bypasses row-level security and must never be committed or shipped to the browser.",
  },
  {
    rule: "hardcoded-secret-key",
    regex: /\bsb_secret_[A-Za-z0-9_-]{10,}/g,
    message: "A secret API key literal is committed. Store it as a secret instead.",
  },
  {
    rule: "hardcoded-openai-key",
    regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/g,
    message: "An OpenAI-style secret key literal is committed. Store it as a secret instead.",
  },
  {
    rule: "hardcoded-aws-key",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    message: "An AWS access key ID is committed. Rotate it and store it as a secret.",
  },
  {
    rule: "hardcoded-private-key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
    message: "A private key block is committed. Rotate it and store it as a secret.",
  },
  {
    rule: "hardcoded-github-token",
    regex: /\bgh[pousr]_[A-Za-z0-9]{36,}/g,
    message: "A GitHub token is committed. Revoke it and store it as a secret.",
  },
];

for (const file of allFiles) {
  // This file defines the patterns, so skip it to avoid self-matches.
  if (file.endsWith("security-check.mjs")) continue;
  const content = read(file);
  for (const { rule, regex, message } of CREDENTIAL_PATTERNS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      report(errors, rule, file, lineOf(content, match.index), message);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Privileged credentials referenced from frontend code
// ---------------------------------------------------------------------------
const FRONTEND_ROOT = join(ROOT, "src");
const PRIVILEGED_NAMES = [
  "SERVICE_ROLE",
  "SUPABASE_DB_URL",
  "STRIPE_SECRET_KEY",
];

if (existsSync(FRONTEND_ROOT)) {
  for (const file of allFiles.filter((f) => f.startsWith(FRONTEND_ROOT))) {
    const content = read(file);
    for (const name of PRIVILEGED_NAMES) {
      let index = content.indexOf(name);
      while (index !== -1) {
        report(
          errors,
          "privileged-credential-in-frontend",
          file,
          lineOf(content, index),
          `"${name}" is referenced in browser code. Anything bundled for the client is public; move this to a server-side edge function.`,
        );
        index = content.indexOf(name, index + name.length);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Unsafe DOM / dynamic execution
// ---------------------------------------------------------------------------
const UNSAFE_PATTERNS = [
  {
    rule: "unsafe-eval",
    regex: /\beval\s*\(/g,
    message: "eval() executes arbitrary code. Remove it or replace with an explicit parser.",
    blocking: true,
  },
  {
    rule: "unsafe-function-constructor",
    regex: /\bnew\s+Function\s*\(/g,
    message: "new Function() executes arbitrary code. Remove it.",
    blocking: true,
  },
  {
    rule: "unsanitized-html",
    regex: /dangerouslySetInnerHTML/g,
    message:
      "dangerouslySetInnerHTML can introduce cross-site scripting. Confirm the value is sanitized or statically trusted.",
    blocking: false,
  },
];

if (existsSync(FRONTEND_ROOT)) {
  for (const file of allFiles.filter(
    (f) => f.startsWith(FRONTEND_ROOT) && /\.(ts|tsx|js|jsx)$/.test(f),
  )) {
    const content = read(file);
    for (const { rule, regex, message, blocking } of UNSAFE_PATTERNS) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content)) !== null) {
        report(
          blocking ? errors : warnings,
          rule,
          file,
          lineOf(content, match.index),
          message,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Migration hygiene: every new public table needs RLS + GRANTs
// ---------------------------------------------------------------------------
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

if (existsSync(MIGRATIONS_DIR)) {
  const migrationFiles = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Statements can span migrations (a table created in one, secured in a
  // later one), so evaluate the combined history.
  const combined = migrationFiles
    .map((f) => read(join(MIGRATIONS_DIR, f)))
    .join("\n");

  const createTableRegex =
    /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z0-9_]+)"?/gi;

  const created = new Set();
  let match;
  while ((match = createTableRegex.exec(combined)) !== null) {
    created.add(match[1].toLowerCase());
  }

  const lower = combined.toLowerCase();

  for (const table of created) {
    const hasRls = new RegExp(
      `alter\\s+table\\s+(?:public\\.)?"?${table}"?[\\s\\S]{0,80}?enable\\s+row\\s+level\\s+security`,
      "i",
    ).test(combined);

    const hasGrant = new RegExp(
      `grant[\\s\\S]{0,120}?on\\s+(?:table\\s+)?(?:public\\.)?"?${table}"?`,
      "i",
    ).test(combined);

    const hasPolicy = lower.includes(`on public.${table}`) || lower.includes(`on ${table}`);

    if (!hasRls) {
      errors.push({
        rule: "missing-rls",
        location: `supabase/migrations (table: ${table})`,
        message: `Table "${table}" is created without ENABLE ROW LEVEL SECURITY. Without it every row is reachable through the data API.`,
      });
    }

    if (!hasGrant) {
      warnings.push({
        rule: "missing-grant",
        location: `supabase/migrations (table: ${table})`,
        message: `Table "${table}" has no GRANT statement. The data API cannot reach it unless privileges are granted explicitly.`,
      });
    }

    if (hasRls && !hasPolicy) {
      warnings.push({
        rule: "rls-without-policy",
        location: `supabase/migrations (table: ${table})`,
        message: `Table "${table}" has row-level security enabled but no policy, so it is fully locked.`,
      });
    }
  }

  // Policies that allow anyone, signed in or not, to read everything.
  for (const file of migrationFiles) {
    const content = read(join(MIGRATIONS_DIR, file));
    const anonPolicy =
      /create\s+policy[\s\S]{0,400}?to\s+anon[\s\S]{0,200}?using\s*\(\s*true\s*\)/gi;
    anonPolicy.lastIndex = 0;
    let policyMatch;
    while ((policyMatch = anonPolicy.exec(content)) !== null) {
      warnings.push({
        rule: "public-read-policy",
        location: `supabase/migrations/${file}:${lineOf(content, policyMatch.index)}`,
        message:
          "A policy grants unauthenticated read access to every row. Confirm this table is genuinely public.",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Committed .env files may only hold browser-public values
// ---------------------------------------------------------------------------
// In this stack .env is committed on purpose: it carries the public Vite
// values the build needs. So the rule is not "never commit .env", it is
// "never let a non-public value land in it". Real secrets belong in the
// managed secret store, where server-side code reads them at runtime.
for (const file of allFiles.filter((f) => /(^|\/)\.env(\..+)?$/.test(f))) {
  const content = read(file);
  content.split("\n").forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;

    const [name] = line.split("=");
    if (!name) return;

    const key = name.trim();
    // Publishable/anon keys and project URLs are designed to be public, so a
    // trailing "_KEY" alone is not evidence of a secret.
    const isPublic =
      key.startsWith("VITE_") ||
      key.startsWith("PUBLIC_") ||
      /(PUBLISHABLE|ANON|PROJECT_ID|_URL$)/i.test(key);
    const looksPrivate = /(SECRET|PRIVATE|SERVICE_ROLE|PASSWORD|TOKEN|_KEY$)/i.test(key);


    if (!isPublic && looksPrivate) {
      warnings.push({
        rule: "private-value-in-env",
        location: `${relative(ROOT, file)}:${i + 1}`,
        message: `"${key}" looks like a private value in a committed env file. Move it to the secret store and read it server-side.`,
      });
    }
  });
}


// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
function print(title, list, symbol) {
  if (list.length === 0) return;
  console.log(`\n${symbol} ${title} (${list.length})\n`);
  for (const item of list) {
    console.log(`  [${item.rule}] ${item.location}`);
    console.log(`      ${item.message}`);
    if (process.env.GITHUB_ACTIONS) {
      const level = symbol === "FAIL" ? "error" : "warning";
      console.log(`::${level} title=${item.rule}::${item.location} - ${item.message}`);
    }
  }
}

console.log("Security policy check");
console.log(`Scanned ${allFiles.length} files\n`);

print("Blocking issues", errors, "FAIL");
print("Warnings", warnings, "WARN");

if (errors.length === 0 && warnings.length === 0) {
  console.log("No issues found.");
}

console.log(
  `\nResult: ${errors.length} blocking, ${warnings.length} warning(s).`,
);

process.exit(errors.length > 0 ? 1 : 0);

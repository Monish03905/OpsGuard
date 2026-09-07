# Security

## Automated checks on every pull request

`.github/workflows/security.yml` runs on every pull request, on pushes to the
default branch, and weekly on a schedule. It is made up of five checks plus one
aggregated gate.

| Check | Tool | Blocks the merge when |
| --- | --- | --- |
| Dependency audit | `npm audit` | A runtime dependency has a **high or critical** advisory |
| Secret scan | TruffleHog | A **verified live** credential is found in the diff |
| Static analysis | Semgrep OSS | A rule from `p/typescript`, `p/react`, `p/secrets`, or `p/owasp-top-ten` matches |
| Security policy | `scripts/security-check.mjs` | A stack-specific rule below is violated |
| Lint (changed files) | ESLint | A file the PR touches has a lint error |
| Types, tests, build | `tsc`, Vitest, Vite | Any of them fail |

| **Security gate** | — | **Any of the above failed or was cancelled** |

Dev-only dependency advisories are reported but do not block, since they never
reach production users.

Linting is scoped to the files a pull request changes. The existing codebase has
41 pre-existing ESLint errors, so linting everything would fail every pull
request and the gate would be ignored within a day. Scoping to changed files
stops new problems from landing without blocking unrelated work on a cleanup
first. A full-repo lint still runs for visibility, marked non-blocking.


## The security gate

`security-gate` is the single job to require in branch protection. It waits for
all other jobs and fails if any of them failed, so you only manage one required
status check as the pipeline grows.

**A workflow on its own reports; it does not block.** To actually prevent risky
merges, enable branch protection once in GitHub:

1. Repository **Settings → Branches → Add branch ruleset** (or *Add rule*)
2. Target the default branch
3. Enable **Require status checks to pass before merging**
4. Search for and select **Security gate**
5. Recommended alongside it: **Require branches to be up to date before
   merging**, and **Do not allow bypassing the above settings** so the gate
   applies to administrators too

Until step 4 is done, a failing scan shows a red X but the merge button stays
green.

## Local use

Run the policy check the same way CI does:

```sh
npm run security
```

Exit code `0` means no blocking issues. Warnings are printed for review but do
not fail the run.

## Policy rules

`scripts/security-check.mjs` covers the mistakes generic scanners miss because
they depend on how this project is wired.

**Blocking**

- `hardcoded-service-role-key` — a service-role key literal. Detected by the
  encoded `"role":"service_role"` payload fragment, so the publishable key
  (which is safe in client code) never trips it.
- `hardcoded-secret-key`, `hardcoded-openai-key`, `hardcoded-aws-key`,
  `hardcoded-private-key`, `hardcoded-github-token` — committed credentials.
- `privileged-credential-in-frontend` — `src/` references a privileged name such
  as a service-role key or database URL. Anything bundled for the browser is
  public.
- `unsafe-eval`, `unsafe-function-constructor` — arbitrary code execution.
- `missing-rls` — a migration creates a table in `public` without
  `ENABLE ROW LEVEL SECURITY`, which would expose every row through the data API.

**Warnings**

- `missing-grant` — a table has no `GRANT`, so the data API cannot reach it.
- `rls-without-policy` — row-level security is on with no policy, so the table is
  fully locked.
- `public-read-policy` — a policy grants unauthenticated read access to all rows.
- `unsanitized-html` — `dangerouslySetInnerHTML`, which needs a human to confirm
  the value is trusted.
- `private-value-in-env` — a private-looking variable in a committed env file.

## What CI cannot cover

These checks read code, dependencies, and migration history. They cannot inspect
the **live** database, so they will not catch a policy changed directly against
the running project, an overly permissive policy that is valid SQL, or auth
settings such as leaked-password protection.

Keep using the in-product security scan for that: it analyses the running
database and its policies, which no repository-level tool can see.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Contact the
maintainers privately so a fix can ship before details are public.

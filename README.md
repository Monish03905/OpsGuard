# OpsGuard

OpsGuard is a real-time incident response and operations control platform for monitoring SLAs, managing teams, tracking incidents, and running operational playbooks.

## Local development

The project requires Node.js and npm.

```sh
npm install
npm run build
npm run dev
```

Copy `.env.example` to `.env` and set the Supabase URL and publishable key before starting the app.

Vercel deployments use `vercel.json` for SPA route fallback. Configure the same two `VITE_` variables as project environment variables. The GitHub Actions pipeline also validates pull requests and main-branch pushes; add them as repository variables named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Available scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run lint` checks the codebase with ESLint.
- `npm run test` runs the test suite.
- `npm run security` runs the repository security checks.

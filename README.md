# FocusFlow

FocusFlow is a small React/Vite app for logging focus and energy check-ins, viewing recent history, and running a focus timer.

## Development

Install dependencies:

```sh
npm install
```

Copy the example environment file and fill in the Clerk and Neon values:

```sh
cp .env.example .env.local
```

Run the database migration:

```sh
npm run db:migrate
```

Start the legacy local frontend and local API together:

```sh
npm run dev
```

The web app runs on `http://localhost:5173` and proxies API calls to the local Node server on `http://localhost:5174`.

For the deployed-style backend, use Vercel's local dev flow so `/api/*` is served by Vercel Functions:

```sh
npm run dev:vercel
```

## Scripts

- `npm run dev` starts Vite and the local API server together.
- `npm run dev:vercel` starts Vercel's local dev server for the deployed-style API.
- `npm run dev:web` starts only the Vite frontend.
- `npm run dev:api` starts only the local API server.
- `npm run db:migrate` applies SQL migrations to `DATABASE_URL`.
- `npm run build` creates a production frontend build.
- `npm run lint` runs ESLint.

## Local Data

Check-ins are persisted by the API server to `server/data/check-ins.json`. That file is ignored by Git so local history stays local.

## Vercel Backend

The deployed app uses Clerk auth and Vercel Functions in `api/` backed by Neon/Postgres. Required environment variables are listed in `.env.example`.

Before deploying, add those same variables in Vercel Project Settings. `CLERK_ALLOWED_ORIGINS` must include your production domain and any preview/local origins that should be allowed to call the authenticated API.

# FocusFlow

FocusFlow is a small React/Vite app for logging focus and energy check-ins, viewing recent history, and running a focus timer.

## Development

Install dependencies:

```sh
npm install
```

Start the frontend and local API together:

```sh
npm run dev
```

The web app runs on `http://localhost:5173` and proxies API calls to the local Node server on `http://localhost:5174`.

## Scripts

- `npm run dev` starts Vite and the local API server together.
- `npm run dev:web` starts only the Vite frontend.
- `npm run dev:api` starts only the local API server.
- `npm run build` creates a production frontend build.
- `npm run lint` runs ESLint.

## Local Data

Check-ins are persisted by the API server to `server/data/check-ins.json`. That file is ignored by Git so local history stays local.

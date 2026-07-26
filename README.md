# Church Follow-Up (Member Care)

React frontend for a church membership follow-up and pastoral care system —
dashboards, member management, follow-up task workflow, pastoral
escalations, team/worker management, campaigns and encouragement messaging,
prayer requests, Foundation School, service-day operations, and RBAC-based
administration.

**Live:** `https://church-follow-up-dev.web.app` — deploys automatically on
every push (see [DEPLOYMENT.md](./DEPLOYMENT.md)).

## Tech stack

- **React 19** + TypeScript, **Vite 8**
- **TanStack React Query** for server state, **React Context** for auth
  state (no Redux/Zustand)
- **React Router 7**, **React Hook Form** + **Zod** for forms/validation
- **Tailwind CSS 4**
- **Firebase Cloud Messaging** for staff browser push (optional — the app
  works fully without it configured)
- Talks to the [Church Follow-Up API](../backend) over a JSON REST API;
  see `src/config/api.ts` for the Axios instance (JWT bearer auth, 401
  refresh-and-retry with request queuing)

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend, e.g. http://localhost:4000/api/v1
npm run dev             # http://localhost:5173
```

Log in with credentials from the backend's seed data (default admin:
`admin@church.com` / `Admin123!@#`, or one of 7 demo accounts — one per
role — documented in the backend's README/seed script).

`VITE_FIREBASE_*` variables are optional; leave them blank to disable
push-notification UI (the in-app notification bell/center work either
way).

## Project structure

```
src/
  config/         Axios instance, Firebase init, React Query client, routes
  context/        AuthContext (login/logout/refresh/permission checks)
  components/     Shared layout (Sidebar, Header, ProtectedRoute) + UI kit
  features/       One folder per domain (members, follow-ups, escalations,
                  campaigns, encouragements, prayer-requests, foundation-
                  school, call-guides, reports, admin, notifications),
                  each with its own api/pages/components
  hooks/          Shared hooks (auth, permission checks, debounce, pagination)
  lib/            Formatters, validators, constants, className merge
  types/          Shared TypeScript types (mirrors backend domain models)
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build to `dist/` (bakes `VITE_*` env vars in at build time — see DEPLOYMENT.md) |
| `npm run preview` | Preview a production build locally |
| `npm run lint` | Oxlint |

# Deployment Guide — Frontend (Firebase Hosting)

Static Vite build, deployed to **Firebase Hosting**, auto-deployed on every
push via **GitHub Actions**.

**Live URL:** `https://church-follow-up-dev.web.app`
**Firebase project:** `church-follow-up-dev`
**Deploys on push to:** `claude/church-followup-architecture-o08r8s`

---

## 1. How the auto-deploy works

`.github/workflows/firebase-hosting-merge.yml` runs on every push to the
branch above:

1. `npm ci && npm run build` — Vite bakes the `VITE_*` env vars (declared
   directly in the workflow's `env:` block, not GitHub secrets — see §3)
   into the built JS bundle.
2. [`FirebaseExtended/action-hosting-deploy`](https://github.com/FirebaseExtended/action-hosting-deploy)
   deploys `dist/` to the Firebase Hosting **live** channel, authenticating
   with the `FIREBASE_SERVICE_ACCOUNT_CHURCH_FOLLOW_UP_DEV` repository
   secret (a service account with the Firebase Hosting Admin role, created
   via `firebase init hosting:github` / `firebase apps:create`).

Check **GitHub → church-follow-up repo → Actions** tab for run status and
logs. A push that doesn't touch anything under this frontend's build still
triggers the workflow (it's a whole-repo `on: push` trigger, not scoped to
specific paths) — harmless, just a redundant ~1 minute build.

## 2. Manual deploy (if you ever need it)

```bash
npm run build
firebase deploy --only hosting --project church-follow-up-dev
```

Requires `firebase login` as an account with access to the
`church-follow-up-dev` Firebase project, and `firebase.json` / `.firebaserc`
(both committed) pointing at it.

### If `firebase deploy` fails with a site-targeting error

```
Error: Assertion failed: resolving hosting target of a site with no site name or target name.
```

`firebase.json`'s `hosting.site` field must explicitly name the site
(`church-follow-up-dev` — matches the project ID here, but isn't
guaranteed to in general; check `firebase hosting:sites:list --project
church-follow-up-dev` if unsure). Firebase's CLI does not reliably infer
this from `.firebaserc` alone on a fresh project.

## 3. Environment variables (baked in at build time)

Vite embeds every `VITE_*` variable into the built JS at **build time** —
they cannot be changed after the fact without rebuilding and redeploying.
None of these are secret (Firebase's web config and the API URL are
public by design; they ship to every browser regardless), so they're
plain `env:` values in the GitHub Actions workflow rather than GitHub
secrets. To change one:

1. Edit `.github/workflows/firebase-hosting-merge.yml`'s `env:` block
   (source of truth for CI builds) **and** `.env` locally if you also want
   local builds to match.
2. Push — the next automated deploy picks it up.

| Variable | Current value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://church-followup.e4wtech.com/api/v1` | Must match the backend's `CORS_ORIGIN` exactly (this site's own origin) or every API call fails with a browser-level `Failed to fetch` and **no server-side error at all** — see the backend's DEPLOYMENT.md §5. |
| `VITE_FIREBASE_API_KEY` | — | From Firebase Console → Project Settings → General → Your apps → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | `church-follow-up-dev.firebaseapp.com` | |
| `VITE_FIREBASE_PROJECT_ID` | `church-follow-up-dev` | |
| `VITE_FIREBASE_STORAGE_BUCKET` | `church-follow-up-dev.firebasestorage.app` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1011335835960` | |
| `VITE_FIREBASE_APP_ID` | `1:1011335835960:web:62fb0849ef28b06c5411cd` | |
| `VITE_FIREBASE_VAPID_KEY` | *(not yet generated)* | From Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair. Blank disables push-notification opt-in UI only — everything else works without it. |

**If the Firebase project ever changes** (a new project, or moving to a
different owner account), every value in this table changes, plus:
`firebase.json`'s `hosting.site`, `.firebaserc`'s `default` project, and
the backend's `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/
`FIREBASE_PRIVATE_KEY` (staff push notifications need to target the
*same* Firebase project as this frontend's config — FCM tokens are
project-specific, a mismatch means push silently never arrives).

## 4. Firebase CLI authentication gotcha

If `firebase projects:list` doesn't show the expected project, the CLI on
your machine is very likely logged into the wrong Google account for a
multi-account setup like this one. `firebase login --reauth` **re-uses the
already-logged-in account** — it does not prompt you to choose a
different one. To actually switch accounts:

```bash
firebase logout
firebase login   # choose the correct account in the browser prompt
```

This project intentionally avoided that friction by creating a *new*
Firebase project (`church-follow-up-dev`) under the account the local CLI
was already authenticated as, rather than switching accounts on a shared
machine used for other unrelated projects. If you ever do need
`firebase init hosting:github`'s interactive wizard and it hangs
indefinitely on a `(y/N)` confirm prompt when driven through `expect`/a
non-interactive terminal, that's a real environment limitation observed
in this project's setup, not a config issue — run it in a real interactive
terminal instead, or hand-write the workflow YAML as
`firebase-hosting-merge.yml` does here.

## 5. Rewrites / SPA routing

`firebase.json` rewrites every path to `/index.html` (client-side routing
via React Router). If a route works when navigated to *from inside* the
app but shows Firebase's own 404 page on a hard refresh or direct link,
this rewrite rule is the first thing to check.

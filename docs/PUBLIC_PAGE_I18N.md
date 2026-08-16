# Public-page localisation (`src/i18n`)

Congregation-facing pages render in the visitor's language. The signed-in
application stays English.

## Why the scope stops where it does

Two groups of pages are localised:

- **QR-reached congregation pages** — the live-translation listener page and
  event registration. Read by people who may not speak the language the
  service is advertised in. A church can print a Spanish flier and an English
  flier pointing at **the same link**, and each reader gets their own language.
- **The marketing funnel** — landing page, church sign-up, and sign-in.
  Localised as one unit on purpose: a Spanish visitor who lands on a Spanish
  page and clicks through to an English sign-up form would be worse served than
  one who saw English throughout. Sign-in is included because being unable to
  get *in* is a hard blocker, and password errors are stressful in a second
  language — even though what waits on the other side is English.

The admin application is not translated. Half-translating it would be worse
than leaving it alone, and stamping `lang="es"` on English screens is an
accessibility lie. `I18nProvider` therefore wraps only the public routes
(`src/config/routes.tsx`), and restores `document.documentElement.lang` on
unmount.

## Cost model — why this is not i18next

| Decision | Reason |
|---|---|
| No runtime i18n dependency | The whole runtime is ~120 lines. A library would add more weight than the translations themselves. |
| English statically imported | The common case has no extra request and no loading flash. |
| `es` / `zh` via `import()` | Vite emits one chunk per locale (~4 kB gzipped each), fetched only by the visitor who needs it. |
| Renders English while a chunk loads | A service is starting. A spinner is worse than a beat of English. |
| Flat dot-namespaced keys | Keeps the key type a plain string union and makes `t('event.register')` greppable. |

Measured on the production build: main bundle +12 kB total for the runtime
plus the English dictionary (English marketing copy is the bulk of it);
`es` 10.78 kB raw / 3.99 kB gzipped; `zh` 9.40 kB / 4.10 kB. A visitor who
needs neither downloads neither.

## Type safety

`en.ts` is the source of truth and is declared `as const`. Other locales are
typed `Translations = Record<TranslationKey, string>`, so **adding a key to
`en.ts` without translating it fails `tsc`** rather than silently rendering
English to a Spanish speaker mid-service. Values are widened to `string`
deliberately — mapping over the keys is what enforces completeness without also
demanding the English wording.

## Language resolution

Most explicit wins (`src/i18n/detect.ts`):

1. **`?lang=es` on the URL** — lets a church print a Spanish flier whose QR
   carries the language, without a second page or a second event.
2. **A previous explicit choice** (`localStorage.publicLocale`) — if the visitor
   overrode us once, respect it.
3. **`navigator.languages`** — the case that matters most: a Spanish speaker
   scanning the *English* flier still gets Spanish.
4. **English.**

Region subtags collapse to the base language: `es-419`, `es-US` → `es`;
`zh-Hans`, `zh-TW` → `zh`.

An arrival via `?lang=` is **persisted** as an explicit choice. Client-side
navigation drops the query string, so without this a refresh one page into the
funnel would fall back to the phone's language and undo what the flier asked
for — the exact case `?lang=` exists to serve.

A visible `<LanguageSwitcher />` sits on every localised page, because
auto-detection cannot know that the English-set family phone is being carried
by a Spanish speaker.

It is a **dropdown collapsed to a globe + two-character code**, not a row of
language buttons. Language is a once-per-visitor decision, and a permanent row
competes for header space with the actions people actually came to take —
enough, at tablet width, to wrap the nav onto two lines. The header uses the
compact variant; the footer uses `variant="full"` (globe + full name), which is
where most enterprise sites put the control precisely because it is rarely
needed twice.

The menu lists each language in **its own language, never translated into the
current one** — "Chinese" is useless to a reader who only reads 中文 — with a
check on the active one. It is built on the shared `Dropdown` primitive so
click-outside, Escape and the menu/menuitem roles match every other menu in the
product, and the trigger's accessible name stays "Language: <current>" in
English so assistive tech announces it consistently.

## What is and isn't translated

Translated: all UI chrome, form labels for the fixed field catalogue, status
and error copy.

Not translated, on purpose: **church-authored content** — event names,
descriptions, custom questions, and the church's own name. That text was typed
by the church in its own language; machine-translating it would be presumptuous
and often wrong. Dates format from the same source string in every locale.

The SMS consent paragraph *is* translated, but keeps the carrier-required
elements (brand, message types, frequency, rates, STOP/HELP) in every locale —
those are a compliance requirement, not copy.

## SEO for the localised marketing pages

The QR pages are `noindex`, so language variants there are invisible to search
and need nothing. The landing page is the opposite — it is the SEO asset — so
each variant:

- **self-canonicalises** (`/welcome?lang=es` points at itself). Canonicalising
  the Spanish page to the English one would collapse them into a single result
  and the Spanish copy would never rank.
- **declares every alternate**, including a self-reference and `x-default`,
  via `<link rel="alternate" hreflang>` emitted by `useSeo`, and mirrored in
  `public/sitemap.xml` with `xhtml:link`.

`useSeo` rebuilds the alternate set wholesale on each render, so stale variants
cannot linger when a visitor navigates from a localised page to a
single-language one.

## Adding a locale

1. Copy `locales/en.ts` to `locales/<code>.ts`, translate, type it `Translations`.
2. Add the code to `LOCALES` and `LOCALE_LABELS` in `types.ts`.
3. Add a loader entry in `I18nProvider.tsx`.
4. `npx tsc -b` — a missing key is a build error.

Note this list is **not** the Live Translation language catalogue. That one is
what a sermon can be *interpreted* into (16+ languages, provider-driven); this
one is what we have human-quality UI copy for.

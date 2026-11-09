# Topaz Jewelry: project conventions

Jewelry store for Kazakhstan (Astana, Karaganda). UI language Russian, currency KZT. Solo developer + AI assistants.
Read `ARCHITECTURE.md` for the design; this file is the rulebook for day-to-day work.

## Stack and layout
- `apps/api`: FastAPI, SQLAlchemy 2 (async), Alembic, Pydantic v2, PostgreSQL, Redis. Python 3.12, managed with `uv`.
- `apps/web`: Next.js App Router, TypeScript (strict), Tailwind 4, hand-written shadcn-style components. Package manager: npm.
- `infra/`: Caddy config, Postgres init. `docker-compose.yml` is the dev stack (`docker compose up`).
- Everything runs in Docker. Do not assume Python/Node on the host. Use the `Makefile` targets.

## Language rules
- Code, comments, commit messages, API field names: **English**.
- User-facing storefront text lives **only** in `apps/web/src/content/dictionaries/{ru,en,kk}.ts` (Russian is the source; `en` and `kk` must keep the same shape, enforced by the `Dictionary` type and a test). Kazakh is a draft pending native review. Admin strings: `content/admin-ru.ts`. Never hardcode visible strings in components.
- Backend returns stable error `code`s (English); the frontend maps them to Russian text.

## Naming
- Python: `snake_case` modules/functions, `PascalCase` classes. Tables plural snake_case (`product_variants`), columns snake_case.
- Money columns end with `_minor` (integer tiyn; 1 KZT = 100 tiyn). Never use floats for money.
- TS: files `kebab-case.tsx`, components `PascalCase`, hooks `useX`. Routes: lowercase, English slugs.
- API paths: `/api/v1/<plural-resource>`; admin under `/api/v1/admin/...`.

## Backend rules
- Module shape in `app/modules/<name>/`: `models.py`, `schemas.py`, `service.py`, `router.py` (+ `deps.py`, `tasks.py` if needed).
- Routers are thin: parse input, call a service, return. Business logic lives in `service.py`.
- Services never commit. The `get_session` dependency commits on success and rolls back on error.
- A module may import another module's `service`/`schemas`/`deps`, never its `models` for writes (reads via the owning service). `app/core` never imports `app/modules` (enforced by import-linter).
- Every unsafe request needs the CSRF double-submit header (global dependency). Webhooks are exempt and must verify signatures.
- Feature flags: `FEATURE_ACCOUNTS`, `FEATURE_PAYMENTS`. Gate routes with `require_feature(...)`, never with ad-hoc `if settings...` in handlers. Admin login always works.
- Payments: business code uses only `modules/payments/interface.py` and `registry.get_provider()`. Provider-specific code lives in `providers/<name>.py`.

## How to add things
**Endpoint**: add schema in `schemas.py` -> logic in `service.py` -> route in `router.py` -> test in `tests/` -> `make gen-api` and commit `openapi.json` + `schema.d.ts`.
**Admin CRUD resource**: Pydantic Out/Create/Update schemas in `modules/admin/schemas.py`, one `crud_router(...)` call in `modules/admin/router.py`, one entry in `apps/web/src/lib/admin-resources.ts`, labels in `ru.ts` (`admin.resources`). No new page needed.
**Migration**: change models -> `make migration m="short description"` -> review the generated file (extensions, indexes, data fixes) -> `make migrate`. Never edit an applied migration; add a new one. Make new migrations backward compatible with the previous release (expand, then contract). New models must be imported in `app/models.py`.
**Page**: server component under `apps/web/src/app/(shop)/...`; read copy with `getDict()` (server) or `useDict()` (client); add `generateMetadata`. The storefront is frontend-only for now: data comes from `content/mock/*`, client state from `lib/state/*` (localStorage). Build from the Figma wireframe frame, then compare a 1440px screenshot with it.
**Feature-flagged UI**: read flags with `useFeatures()` (client) or `getFeatures()` (server) and call `notFound()` for disabled routes. Flags are the `FEATURE_ACCOUNTS` / `FEATURE_PAYMENTS` env vars of the `web` service.

## Testing rules
- Backend: pytest, real Postgres and Redis (`make test`). Test through HTTP (`client` fixture) for endpoints, plain functions for pure logic. Each test is isolated (tables are truncated after each test).
- New endpoint = at least one success and one failure test. Anything touching money, stock, auth or webhooks gets extra edge-case tests.
- Frontend: `npm run typecheck && npm run lint && npm test` (vitest, pure logic: filters, money, rates, dictionaries); Playwright e2e for critical flows only (catalog -> product, request order, mock payment) in `e2e/`.
- CI must stay green: ruff, mypy (strict), import-linter, pytest, generated-client drift check, prettier, eslint, tsc, next build.

## Never do
- Never commit secrets or `.env`. Add new variables to `.env.example` and `core/config.py` together.
- Never hardcode visible strings outside the dictionaries, and never raw hex colors or font sizes in components: use the tokens in `apps/web/src/styles/theme.css`.
- Never trust the client for prices, totals, stock or payment status. Never trust the browser redirect after payment: only verified webhooks (or server-side `get_status`) change payment state.
- Never store money as float or anywhere except minor-unit integers.
- Never put business logic in routers or React components.
- Never call a payment/email/storage vendor SDK outside its provider module.
- Never write raw SQL with string formatting; use SQLAlchemy expressions or bound params.
- Never expose sequential internal IDs on public routes (use slug / order number / public id).
- Never edit `apps/web/src/lib/api/schema.d.ts` by hand: it is generated (`make gen-api`).
- Never bypass hooks/CI, and never `git push --force` to `main`.
- Never add a microservice, message broker or ORM other than what is in the stack without updating `ARCHITECTURE.md` first.

## Known behaviors
- Flag changes: `FEATURE_*` are read at runtime by the web server; restart `web` (no rebuild).
- The storefront does not call the FastAPI backend yet (mock data). Exchange rates come from the National Bank of Kazakhstan RSS, cached for 1 hour, with a static fallback.
- Layout fidelity: the wireframe uses Inter's "auto" line heights; the theme sets them explicitly per font size so Chrome matches Figma.

## Storefront (frontend-only) rules
- Source of layout is the Figma wireframe v0 (file `S4qyAUaZLqy0sYrWKyXtds`). Colors, font, copy, photos and prices are temporary and replaceable via `styles/theme.css`, the dictionaries and `content/mock`.
- Money is stored in KZT and converted for display with `useMoney()`; never format prices by hand. Formatting avoids `Intl` on purpose (server and browser ICU data differ and break hydration).
- Optional modules: with accounts off there is no login/profile and checkout is for guests; with payments off the "online card" option is hidden. Favorites are local to the browser either way.
- Mock-only behavior (auth, orders, newsletter, fitting form) is marked in code with "frontend-only" comments and must be replaced when the backend is connected.

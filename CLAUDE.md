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
- User-facing text: **Russian, only in `apps/web/src/content/ru.ts`**. Never hardcode visible strings in components.
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
**Page**: server component under `apps/web/src/app/(shop)/...`; fetch with `serverApi()` (typed client); add `generateMetadata`; text from `ru.ts`. Pages with user-specific data must use `cache: "no-store"`.
**Feature-flagged UI**: read flags via `getConfig()` (server) and call `notFound()` for disabled routes.

## Testing rules
- Backend: pytest, real Postgres and Redis (`make test`). Test through HTTP (`client` fixture) for endpoints, plain functions for pure logic. Each test is isolated (tables are truncated after each test).
- New endpoint = at least one success and one failure test. Anything touching money, stock, auth or webhooks gets extra edge-case tests.
- Frontend: `npm run typecheck && npm run lint`; Playwright e2e for critical flows only (catalog -> product, request order, mock payment) in `e2e/`.
- CI must stay green: ruff, mypy (strict), import-linter, pytest, generated-client drift check, prettier, eslint, tsc, next build.

## Never do
- Never commit secrets or `.env`. Add new variables to `.env.example` and `core/config.py` together.
- Never hardcode Russian strings outside `ru.ts`, or English strings visible to users.
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
- Flag changes: restart `api` and `web`; header/UI reflects them within ~60 s (config is cached with `revalidate: 60`).
- Catalog API reads are cached by Next for 300 s; admin changes appear within that window until on-demand revalidation is added.

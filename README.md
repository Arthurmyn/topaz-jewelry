# Topaz Jewelry

Online store for Topaz Jewelry (Astana, Karaganda). Russian UI, prices in KZT.
Design and decisions: [ARCHITECTURE.md](ARCHITECTURE.md). Working rules: [CLAUDE.md](CLAUDE.md).

## Quick start

Requirements: Docker with Compose v2. Nothing else.

```bash
docker compose up --build
```

The first start takes a few minutes (images, dependencies). It then:
applies database migrations, loads 20 sample products with placeholder images, and serves everything on one address.

| What | Where |
|------|-------|
| Site | http://localhost:8080 |
| Admin panel | http://localhost:8080/admin |
| API docs (Swagger) | http://localhost:8080/api/docs |
| MinIO console | http://localhost:9001 (minioadmin / minioadmin) |
| Postgres | `localhost:5432`, user/password/db `topaz` |

Create an admin user (the admin panel needs one):

```bash
make admin email=you@example.kz        # prompts for a password (min 10 characters)
```

Configuration is optional for local work: every setting has a development default. To override, `cp .env.example .env`.

## Feature flags

Set in `.env`, then `docker compose up -d api web`:

| Flag | Off (default) | On |
|------|---------------|----|
| `FEATURE_ACCOUNTS` | guest checkout only; no login/profile/favorites for customers | customer registration, login, profile |
| `FEATURE_PAYMENTS` | order-by-request (no payment) | online payment through `PAYMENT_PROVIDER` (`mock` for now) |

Admin login works in both modes. UI picks flags up within about a minute.

## Common tasks

```bash
make test          # backend tests (real Postgres + Redis)
make lint          # ruff, mypy, import-linter, eslint, tsc, prettier
make fmt           # auto-format
make gen-api       # regenerate openapi.json and the TypeScript types after changing the API
make migration m="add orders"   # create a migration from model changes
make migrate       # apply migrations (also done automatically on api start)
make seed          # load sample data (skipped if the catalog is not empty)
make down          # stop; add -v to docker compose to wipe data volumes
```

Reset everything (database, images): `docker compose down -v`.

## Repository layout

```
apps/api     FastAPI backend (modules: catalog, auth, content, payments, admin; more to come)
apps/web     Next.js frontend (shop + /admin)
infra/       Caddy reverse proxy config, Postgres init
```

Edit all Russian site text in `apps/web/src/content/ru.ts`.

## What is implemented (foundation)

- Health check, public config with feature flags, uniform error format, request IDs, structured logs.
- Auth skeleton: argon2 passwords, server-side sessions in httpOnly cookies, CSRF, rate limiting, admin CLI.
- Catalog read API with filters (category, metal, purity, stone, price, availability, search), sorting, pagination, facets.
- Pages: home, catalog with URL-driven filters, category, product (variants, JSON-LD), stores, about/delivery/contacts, sitemap, robots.
- Admin shell with generic CRUD (categories, stones, stores) driven by a config.
- Payment provider interface, mock provider with signed webhooks, payment state machine, fiscalization hook placeholder.
- Image pipeline: upload-time WebP/AVIF variants in MinIO, served at `/media/...`.

Not yet implemented (see build order in ARCHITECTURE.md section 11): cart, checkout and orders, payment records and webhook processing, profile/favorites, newsletter, support bot, product admin screens, e2e tests, production compose and deployment.

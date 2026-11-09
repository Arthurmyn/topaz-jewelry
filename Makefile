# Shortcuts. Everything runs inside Docker, nothing needs to be installed on the host.
API = docker compose run --rm --no-deps -T api

.PHONY: up down logs test test-web lint fmt typecheck gen-api migration migrate seed admin

up:            ## start the whole stack (http://localhost:8080)
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f api web

test:          ## backend tests
	docker compose up -d db redis
	$(API) pytest -q

test-web:      ## frontend unit tests
	docker compose run --rm --no-deps -T web npm test

lint:          ## all linters and type checks
	$(API) ruff check .
	$(API) ruff format --check .
	$(API) mypy app
	$(API) lint-imports
	docker compose run --rm --no-deps -T web sh -c "npm run -s lint && npm run -s typecheck && npm run -s format:check"

fmt:
	$(API) ruff check --fix .
	$(API) ruff format .
	docker compose run --rm --no-deps -T web npm run -s format

gen-api:       ## regenerate OpenAPI spec and TypeScript types (commit both)
	$(API) python -m app.cli export-openapi --out openapi.json
	docker compose run --rm --no-deps -T web npm run -s gen:api

migration:     ## usage: make migration m="add orders"
	docker compose up -d db
	docker compose run --rm -T api alembic revision --autogenerate -m "$(m)"

migrate:
	docker compose run --rm -T api alembic upgrade head

seed:
	docker compose run --rm -T api python -m app.cli seed

admin:         ## usage: make admin email=you@example.kz
	docker compose run --rm api python -m app.cli create-admin $(email)

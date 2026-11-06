FROM python:3.12-slim AS base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_LINK_MODE=copy \
    PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir uv==0.5.11
WORKDIR /app

COPY pyproject.toml uv.lock ./

# ---- dev: includes dev tools, code is bind-mounted by compose ----
FROM base AS dev
RUN uv sync --frozen --no-install-project
COPY . .
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]

# ---- prod ----
FROM base AS prod
RUN uv sync --frozen --no-install-project --no-dev
COPY . .
RUN useradd -m app && chown -R app /app
USER app
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers"]

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- dev: code is bind-mounted by compose; deps are synced at container start ----
FROM base AS dev
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["sh", "-c", "npm install --no-audit --no-fund && npm run dev"]

# ---- prod ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
CMD ["node", "server.js"]

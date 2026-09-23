# ---- Build stage: install all deps and build client + server ----
FROM node:20-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Deps stage: production-only node_modules for the runtime image ----
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Runtime stage ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY attached_assets ./attached_assets
COPY proposals ./proposals
COPY package.json ./package.json

EXPOSE 5000
CMD ["node", "dist/index.cjs"]

# ─── Base ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ─── Development ─────────────────────────────────────────────────────────────
FROM base AS development
RUN npm install
COPY . .
CMD ["npx", "nodemon", "--exec", "npx", "ts-node", "src/index.ts"]

# ─── Build ───────────────────────────────────────────────────────────────────
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# ─── Production ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
RUN npm install --omit=dev
CMD ["node", "dist/index.js"]

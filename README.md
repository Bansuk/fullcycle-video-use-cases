# fullcycle-video-init

Backend for a video catalog application built with **Domain-Driven Design (DDD)** principles, using **TypeScript** and **Node.js**.

## Architecture

The project follows a DDD layered structure:

```
src/
├── category/
│   └── domain/
│       ├── category.entity.ts       # Category aggregate root
│       └── __tests__/
│           └── category.entity.spec.ts
└── shared/
    └── domain/
        ├── entity.ts                # Abstract base entity (UUID id, immutable props)
        └── value-object.ts         # Abstract value object with deep equality
```

### Domain Concepts

- **Entity** — base class with an auto-generated UUID `id` and immutable `props`. Both `id` and `props` are locked via `Object.defineProperty` at construction time.
- **ValueObject** — base class with frozen props and structural equality via `JSON.stringify`.
- **Category** — aggregate root with `name`, `description`, `is_active`, and `created_at`. Supports `changeName`, `changeDescription`, `activate`, and `deactivate` mutations. Name is validated (non-empty, max 255 chars).

## Requirements

- Node.js 20+
- npm

## Getting Started

### Local (without Docker)

```bash
npm install
npm run start:dev
```

### Docker (development)

```bash
docker compose up
```

The app runs at `http://localhost:3000`.

## Available Scripts

| Script | Description |
|---|---|
| `npm test` | Run all tests with Jest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:dev` | Start dev server with hot-reload via nodemon |

## Docker

The `Dockerfile` uses multi-stage builds:

| Stage | Purpose |
|---|---|
| `base` | Node 20 Alpine with dependencies installed |
| `development` | Mounts source, runs via nodemon + ts-node |
| `build` | Compiles TypeScript |
| `production` | Minimal image with compiled output only |

## Tech Stack

- **TypeScript 5** — strict mode, ES2020 target
- **Jest + ts-jest** — unit testing
- **nodemon + ts-node** — development hot-reload
- **Docker** — containerized dev and production environments

# fullcycle-video-init

Backend de uma aplicação de catálogo de vídeos construída com os princípios de **Domain-Driven Design (DDD)**, utilizando **TypeScript** e **Node.js**.

## Arquitetura

O projeto segue uma estrutura em camadas DDD:

```
src/
├── category/
│   └── domain/
│       ├── category.entity.ts       # Aggregate root de Category
│       └── __tests__/
│           └── category.entity.spec.ts
└── shared/
    └── domain/
        ├── entity.ts                # Entidade base abstrata (UUID id, props imutáveis)
        └── value-object.ts         # Value object abstrato com igualdade profunda
```

### Conceitos de Domínio

- **Entity** — classe base com `id` UUID gerado automaticamente e `props` imutáveis. Tanto `id` quanto `props` são bloqueados via `Object.defineProperty` na construção.
- **ValueObject** — classe base com props congeladas e igualdade estrutural via `JSON.stringify`.
- **Category** — aggregate root com `name`, `description`, `is_active` e `created_at`. Suporta as mutações `changeName`, `changeDescription`, `activate` e `deactivate`. O nome é validado (não vazio, máximo de 255 caracteres).

## Requisitos

- Node.js 20+
- npm

## Como Começar

### Local (sem Docker)

```bash
npm install
npm run start:dev
```

### Docker (desenvolvimento)

```bash
docker compose up
```

A aplicação roda em `http://localhost:3000`.

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm test` | Executa todos os testes com Jest |
| `npm run test:watch` | Executa os testes em modo watch |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm run start:dev` | Inicia o servidor de desenvolvimento com hot-reload via nodemon |

## Docker

O `Dockerfile` utiliza multi-stage builds:

| Stage | Finalidade |
|---|---|
| `base` | Node 20 Alpine com dependências instaladas |
| `development` | Monta o código-fonte, executa via nodemon + ts-node |
| `build` | Compila o TypeScript |
| `production` | Imagem mínima apenas com o output compilado |

## Tecnologias

- **TypeScript 5** — modo strict, target ES2020
- **Jest + ts-jest** — testes unitários
- **nodemon + ts-node** — hot-reload em desenvolvimento
- **Docker** — ambientes de desenvolvimento e produção em contêiner

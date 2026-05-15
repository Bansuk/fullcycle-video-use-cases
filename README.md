# fullcycle-video-init

Backend de uma aplicação de catálogo de vídeos construída com os princípios de **Domain-Driven Design (DDD)**, utilizando **TypeScript** e **Node.js**.

## Arquitetura

O projeto segue uma estrutura em camadas DDD:

```
src/
├── category/
│   ├── domain/
│   │   ├── category.entity.ts             # Aggregate root de Category
│   │   ├── category.validator.ts          # Regras de validação com class-validator
│   │   ├── category.repository.ts         # Interface ICategoryRepository
│   │   └── __tests__/
│   │       └── category.entity.spec.ts
│   └── infra/
│       └── db/
│           └── in-memory/
│               ├── category-in-memory.repository.ts  # Repositório em memória
│               └── __tests__/
│                   └── category-in-memory.repository.spec.ts
└── shared/
    └── domain/
        ├── entity.ts                      # Entidade base abstrata (UUID, props imutáveis)
        ├── value-object.ts                # Value object com igualdade estrutural
        ├── errors/
        │   └── validation.error.ts        # EntityValidationError
        ├── validators/
        │   ├── validator-interface.ts     # IValidatorFields<T>
        │   └── class-validator-fields.ts  # ClassValidatorFields<T>
        └── repository/
            ├── repository-interface.ts    # IRepository, ISearchableRepository, SearchParams, SearchResult
            └── in-memory.repository.ts    # InMemoryRepository, InMemorySearchableRepository
```

### Conceitos de Domínio

- **Entity** — classe base com `id` UUID gerado automaticamente e `props` imutáveis. Tanto `id` quanto `props` são bloqueados via `Object.defineProperty` na construção.
- **ValueObject** — classe base com props congeladas e igualdade estrutural via `JSON.stringify`.
- **Category** — aggregate root com `name`, `description`, `is_active` e `created_at`. Suporta as mutações `changeName`, `changeDescription`, `activate` e `deactivate`.

### Validação

A validação da entidade `Category` utiliza `class-validator`. As regras aplicadas ao campo `name` são:

- Não pode ser vazio (`@IsNotEmpty`)
- Não pode conter apenas espaços em branco (`@Matches(/\S+/)`)
- Máximo de 255 caracteres (`@MaxLength(255)`)

Quando a validação falha, um `EntityValidationError` é lançado com os erros organizados por campo:

```typescript
// Exemplo de erro
{
  error: {
    name: ['name should not be empty']
  }
}
```

### Repositório

O padrão de repositório é implementado em duas camadas:

- **`InMemoryRepository`** — operações básicas de CRUD (`insert`, `findById`, `findAll`, `update`, `delete`).
- **`InMemorySearchableRepository`** — estende o anterior adicionando `search` com suporte a filtro, ordenação e paginação.

O `CategoryInMemoryRepository` implementa:

| Comportamento | Detalhe |
|---|---|
| Filtro por nome | Substring case-insensitive em qualquer parte do nome |
| Ordenação padrão | `created_at` decrescente (mais recentes primeiro) quando `sort` não é informado |
| Paginação | `page`, `per_page` (padrão: 15), `last_page` calculado automaticamente |

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
- **class-validator** — validação declarativa com decorators
- **reflect-metadata** — suporte a metadados para decorators
- **Jest + ts-jest** — testes unitários
- **nodemon + ts-node** — hot-reload em desenvolvimento
- **Docker** — ambientes de desenvolvimento e produção em contêiner

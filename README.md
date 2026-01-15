# Hardcord

A production-grade, Discord-like web application built with Next.js (App Router), NestJS, Prisma/PostgreSQL, Redis, and Socket.IO.

## Architecture (High-level)

```
[ Next.js Web ]  <->  [ NestJS API + Socket.IO ]  <->  [ Postgres + Prisma ]
           \                         |                      \
            \                        |                       --> [ Redis ]
             \                       |
              \                      --> [ S3-compatible (MinIO in dev) ]
```

## Monorepo Structure

```
apps/
  api/   # NestJS + Prisma + Socket.IO
  web/   # Next.js + Tailwind + shadcn/ui
```

## Getting Started (Local)

```bash
pnpm install
pnpm -C apps/api prisma:generate
pnpm -C apps/api prisma:migrate
pnpm -C apps/api prisma:seed
pnpm dev
```

> ملاحظة: هذا المستودع يعتمد على pnpm. في بيئات CI يفضل تثبيت `pnpm-lock.yaml` عبر `pnpm install --frozen-lockfile` لضمان إعادة إنتاج البناء.

Or using Docker:

```bash
docker compose up --build
```

## API Docs

- Swagger: `http://localhost:4000/docs`

## Environment Variables

See:
- `apps/api/.env.example`
- `apps/web/.env.example`

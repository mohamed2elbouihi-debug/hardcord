FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN pnpm install --filter hardcord-api...

COPY apps/api ./apps/api

WORKDIR /app/apps/api

RUN pnpm prisma:generate
RUN pnpm build

EXPOSE 4000
CMD ["pnpm", "start"]

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN pnpm install --filter hardcord-web...

COPY apps/web ./apps/web

WORKDIR /app/apps/web

RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]

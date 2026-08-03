FROM node:22-slim AS base

WORKDIR /app

FROM base AS builder

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM base AS runner

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/database.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["npm", "start"]
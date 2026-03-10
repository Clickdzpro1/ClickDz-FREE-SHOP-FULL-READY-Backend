# ─── Stage 1: Build ────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Copy source
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN pnpm build

# ─── Stage 2: Production ──────────────────────────────────────────────
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Add tini for proper PID 1 handling + curl for health checks
RUN apk add --no-cache tini curl

WORKDIR /app

# Copy package files and install production deps only
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile 2>/dev/null || pnpm install --prod

# Copy Prisma schema + migrations + seed
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built code
COPY --from=builder /app/dist ./dist/

# Copy entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 3000

# Health check — matches the /health endpoint in app.ts
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./entrypoint.sh"]

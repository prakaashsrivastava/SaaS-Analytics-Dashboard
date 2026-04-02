FROM node:20-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set node-linker hoisted
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client
RUN pnpm prisma generate
# Build the application
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Uncomment the following line if you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
CMD ["node", "server.js"]

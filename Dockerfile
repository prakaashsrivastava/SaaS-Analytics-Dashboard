FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install pnpm and dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Use BuildKit cache mounts to speed up pnpm install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client
RUN pnpm exec prisma generate
# Build the application
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install pnpm for migration and sync in runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# Install prisma and tsx globally for seeding and sync in production
RUN pnpm add -g prisma tsx

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./
COPY --from=builder /app/package.json ./package.json

# Copy node_modules from builder to ensure sync script has all dependencies (date-fns, etc)
COPY --from=builder /app/node_modules ./node_modules
# Also copy the src directory for the sync script
COPY --from=builder /app/src ./src

EXPOSE 3000
ENV PORT=3000

# Set environment for standalone output
ENV HOSTNAME="0.0.0.0"

# Run db push then data sync then start the server
# We use pnpm exec for prisma to ensure it uses the local version if needed, 
# but global install also works.
CMD ["sh", "-c", "pnpm exec prisma db push && pnpm exec prisma db seed && pnpm run sync-data && node server.js"]

FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install pnpm and dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

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

# Install pnpm for migration in runner
RUN corepack enable
RUN npm install -g prisma

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV PORT=3000

# Set environment for standalone output
ENV HOSTNAME="0.0.0.0"

# Use absolute path for prisma if necessary, but global install should work
# Run db push then start the server
CMD ["sh", "-c", "prisma db push && node server.js"]

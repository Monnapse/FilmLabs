# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Update these paths to include the 'filmlabs' directory
COPY filmlabs/package.json filmlabs/package-lock.json ./
COPY filmlabs/prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Update this path to copy the application source
COPY filmlabs/ . 

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production Server
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
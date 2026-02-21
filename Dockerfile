# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the configuration files from the subfolder
COPY filmlabs/package.json filmlabs/package-lock.json ./
# Copy the prisma folder for the generator
COPY filmlabs/prisma ./prisma/

# Install dependencies
# If npm ci fails, try 'npm install' to bypass strict lockfile checks
RUN npm install --legacy-peer-deps
RUN npx prisma generate

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY filmlabs/ . 

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
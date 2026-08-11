# ============================
# Stage 1 - Build
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application source
COPY . .

# ============================
# Stage 2 - Production
# ============================
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

# Copy application
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Copy uploads folder only if it exists in your project
# Uncomment the line below if you have an uploads folder
# COPY --from=builder /app/uploads ./uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
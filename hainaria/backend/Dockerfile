# ===============================
# BUILD STAGE
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (we need devDependencies for building TypeScript)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# ===============================
# PRODUCTION STAGE
# ===============================
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL (needed by Prisma inside Alpine)
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies to keep the image slim
RUN npm ci --only=production

# Copy generated Prisma Client from the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory (will be mapped as a volume)
RUN mkdir -p /app/uploads
VOLUME /app/uploads

# Set Node environment to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]

# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine
WORKDIR /app

# Copy compiled output and production deps manifest
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

EXPOSE 4000

# Render sets PORT via env var; default to 4000
ENV PORT=4000

CMD ["node", "dist/index.js"]

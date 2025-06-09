FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install -g @nestjs/cli

RUN npm ci --only=production

COPY . .

RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]

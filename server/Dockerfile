FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production=false || true

COPY prisma ./prisma
COPY tsconfig.json vitest.config.ts .eslintrc.json ./
COPY src ./src
RUN npx prisma generate || true
RUN npm run build || true

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY package.json ./
COPY prisma ./prisma

CMD ["node", "dist/index.js"]
